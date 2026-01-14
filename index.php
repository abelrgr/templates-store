<?php
// Include F3 framework
require 'vendor/autoload.php';

// Initialize F3
$f3 = \Base::instance();

// Set up configuration
$f3->set('DEBUG', 3);
$f3->set('UI', 'templates/');
$f3->set('AUTOLOAD', 'vendor/');

// Logger setup
$actionLogger = new \Log('tmp/actions.log');
$errorLogger = new \Log('tmp/errors.log');
$f3->set('actionLogger', $actionLogger);
$f3->set('errorLogger', $errorLogger);

// Database setup
$f3->set('db', new \DB\SQL('sqlite:tmp/db.sqlite'));

// Create tables if they don't exist
$f3->get('db')->exec("
  CREATE TABLE IF NOT EXISTS stats (
    id TEXT PRIMARY KEY,
    views INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    favorites INTEGER DEFAULT 0,
    rating_sum INTEGER DEFAULT 0,
    rating_count INTEGER DEFAULT 0
  )
");

$f3->get('db')->exec("
  CREATE TABLE IF NOT EXISTS downloads_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_name TEXT,
    ip TEXT,
    date DATETIME DEFAULT CURRENT_TIMESTAMP
  )
");

$f3->get('db')->exec("
  CREATE TABLE IF NOT EXISTS user_ratings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_id TEXT,
    ip TEXT,
    rating INTEGER,
    date DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(template_id, ip)
  )
");

// Define routes
$f3->route('GET /', 'HomeController->index');
$f3->route('GET /download/@template', 'HomeController->download');
$f3->route('POST /api/view/@template', 'HomeController->trackView');
$f3->route('POST /api/rate/@template', 'HomeController->rate');
$f3->route('POST /api/favorite/@template', 'HomeController->favorite');

// Run the application
$f3->run();

// HomeController class
class HomeController
{

  /**
   * Log an action with Apache-like format
   */
  private function logAction($f3, $status = 200)
  {
    $ip = $f3->get('IP');
    $verb = $f3->get('VERB');
    $uri = $f3->get('URI');
    $date = date('d/M/Y:H:i:s O');
    $f3->get('actionLogger')->write("$ip - - [$date] \"$verb $uri\" $status -");
  }

  /**
   * Log an error with custom message
   */
  private function logError($f3, $message)
  {
    $ip = $f3->get('IP');
    $date = date('d/M/Y:H:i:s O');
    $f3->get('errorLogger')->write("[$date] [error] $ip: $message");
  }

  /**
   * Index action: displays the homepage with template boxes
   */
  public function index($f3)
  {
    $this->logAction($f3);
    $templates = $this->getTemplates($f3);
    $countdownTargetDate = '2026-02-20T00:00:00';
    $f3->set('templates', json_encode($templates));
    $f3->set('countdownTargetDate', $countdownTargetDate);
    echo \Template::instance()->render('home.html');
  }

  /**
   * Check if user has exceeded download rate limit (5 downloads per 10 minutes)
   */
  private function checkRateLimit($f3, $ip)
  {
    $db = $f3->get('db');
    $tenMinutesAgo = date('Y-m-d H:i:s', time() - 600);

    // Count downloads from this IP in the last 10 minutes
    $result = $db->exec(
      "SELECT COUNT(*) as count FROM downloads_log WHERE ip = ? AND date > ?",
      [$ip, $tenMinutesAgo]
    );

    if (!$result || empty($result)) {
      return ['allowed' => true, 'count' => 0];
    }

    $count = $result[0]['count'];

    if ($count >= 5) {
      return ['allowed' => false, 'count' => $count];
    }

    return ['allowed' => true, 'count' => $count];
  }

  /**
   * Download action: creates and serves a zip file of the template
   */
  public function download($f3)
  {
    $template = $f3->get('PARAMS.template');
    $templatePath = __DIR__ . '/' . $template;
    $ip = $f3->get('IP');

    // Validate template exists and is a directory
    if (!is_dir($templatePath)) {
      $this->logError($f3, "Template $template not found");
      header('Content-Type: application/json');
      http_response_code(404);
      echo json_encode(['error' => true, 'message' => 'Template not found']);
      return;
    }

    // Check if info.json exists
    $infoFile = $templatePath . '/info.json';
    if (!file_exists($infoFile)) {
      $this->logError($f3, "info.json missing for $template");
      header('Content-Type: application/json');
      http_response_code(404);
      echo json_encode(['error' => true, 'message' => 'Template info not found']);
      return;
    }

    // Check rate limit
    $db = $f3->get('db');
    $rateLimitCheck = $this->checkRateLimit($f3, $ip);

    if (!$rateLimitCheck['allowed']) {
      $this->logError($f3, "Download rate limit exceeded for $template (Count: " . $rateLimitCheck['count'] . ")");
      header('Content-Type: application/json');
      http_response_code(429);
      echo json_encode([
        'error' => true,
        'message' => 'You have exceeded the download limit. Please wait 10 minutes before trying again.'
      ]);
      return;
    }

    $this->logAction($f3);

    // Track download in DB
    $db->exec("INSERT OR IGNORE INTO stats (id) VALUES (?)", [$template]);
    $db->exec("UPDATE stats SET downloads = downloads + 1 WHERE id = ?", [$template]);

    // Log download details
    $db->exec("INSERT INTO downloads_log (template_name, ip) VALUES (?, ?)", [$template, $ip]);

    // Create zip file
    $zipFile = tempnam(sys_get_temp_dir(), 'template_') . '.zip';
    $zip = new ZipArchive();
    if ($zip->open($zipFile, ZipArchive::CREATE) !== TRUE) {
      header('Content-Type: application/json');
      http_response_code(500);
      echo json_encode(['error' => true, 'message' => 'Could not create zip file']);
      return;
    }

    // Add files to zip, excluding info.json and .git
    $this->addFolderToZip($templatePath, $zip, '');

    $zip->close();

    // Serve the zip file
    header('Content-Type: application/zip');
    header('Content-Disposition: attachment; filename="' . $template . '.zip"');
    header('Content-Length: ' . filesize($zipFile));
    readfile($zipFile);

    // Clean up
    unlink($zipFile);
    exit;
  }

  /**
   * Get list of valid templates
   */
  private function getTemplates($f3)
  {
    $templates = [];
    $dir = opendir(__DIR__);
    $db = $f3->get('db');

    while (($file = readdir($dir)) !== false) {
      if ($file === '.' || $file === '..' || !is_dir($file) || $file === 'vendor' || $file === 'tmp' || $file === 'assets' || $file === 'templates') {
        continue;
      }

      $infoFile = $file . '/info.json';
      if (!file_exists($infoFile)) {
        continue;
      }

      $info = json_decode(file_get_contents($infoFile), true);
      if (!$info || !isset($info['image'], $info['title'], $info['description'], $info['demo'])) {
        continue;
      }

      $info['image'] = '/' . $file . '/' . $info['image'];
      $info['demo'] = '/' . $info['demo'];
      $info['folder'] = $file;

      $stats = $db->exec("SELECT * FROM stats WHERE id = ?", [$file]);
      if ($stats) {
        $info['stats'] = $stats[0];
        $info['rating'] = $stats[0]['rating_count'] > 0 ? round($stats[0]['rating_sum'] / $stats[0]['rating_count'], 1) : 0;
      } else {
        $info['stats'] = ['views' => 0, 'downloads' => 0, 'favorites' => 0, 'rating_sum' => 0, 'rating_count' => 0];
        $info['rating'] = 0;
      }

      $templates[] = $info;
    }

    closedir($dir);
    return $templates;
  }

  public function trackView($f3)
  {
    $template = $f3->get('PARAMS.template');
    $this->logAction($f3);
    $db = $f3->get('db');
    $db->exec("INSERT OR IGNORE INTO stats (id) VALUES (?)", [$template]);
    $db->exec("UPDATE stats SET views = views + 1 WHERE id = ?", [$template]);
    echo json_encode(['success' => true]);
  }

  public function rate($f3)
  {
    $template = $f3->get('PARAMS.template');
    $rating = (int)$f3->get('POST.rating');
    $ip = $f3->get('IP');

    if ($rating < 1 || $rating > 5) {
      $this->logError($f3, "Invalid rating $rating for $template");
      header('Content-Type: application/json');
      http_response_code(400);
      echo json_encode(['error' => true, 'message' => 'Invalid rating']);
      return;
    }

    $db = $f3->get('db');

    // Check if user has already rated this template
    $existingRating = $db->exec(
      "SELECT rating, date FROM user_ratings WHERE template_id = ? AND ip = ?",
      [$template, $ip]
    );

    // Check if same rating or if rate limit (1 minute) applies
    if ($existingRating && !empty($existingRating)) {
      $lastRatingTime = strtotime($existingRating[0]['date']);
      $currentTime = time();
      $timeDiff = $currentTime - $lastRatingTime;

      if ($existingRating[0]['rating'] == $rating) {
        $this->logError($f3, "Already gave rating $rating to $template");
        header('Content-Type: application/json');
        http_response_code(400);
        echo json_encode(['error' => true, 'message' => 'You already gave this rating to this template']);
        return;
      }

      if ($timeDiff < 60) {
        $this->logError($f3, "Rate limit for $template too frequent ($timeDiff seconds since last)");
        header('Content-Type: application/json');
        http_response_code(429);
        echo json_encode(['error' => true, 'message' => 'You can only re-rate a template once per minute', 'waitSeconds' => 60 - $timeDiff]);
        return;
      }

      // Update existing rating: remove old rating sum and add new one
      $db->exec(
        "UPDATE stats SET rating_sum = rating_sum - ? + ? WHERE id = ?",
        [$existingRating[0]['rating'], $rating, $template]
      );

      // Update the user rating
      $db->exec(
        "UPDATE user_ratings SET rating = ?, date = CURRENT_TIMESTAMP WHERE template_id = ? AND ip = ?",
        [$rating, $template, $ip]
      );
    } else {
      // New rating
      $db->exec("INSERT OR IGNORE INTO stats (id) VALUES (?)", [$template]);
      $db->exec(
        "UPDATE stats SET rating_sum = rating_sum + ?, rating_count = rating_count + 1 WHERE id = ?",
        [$rating, $template]
      );

      // Insert new user rating
      $db->exec(
        "INSERT INTO user_ratings (template_id, ip, rating) VALUES (?, ?, ?)",
        [$template, $ip, $rating]
      );
    }

    $this->logAction($f3);

    // Get updated stats
    $stats = $db->exec("SELECT rating_sum, rating_count FROM stats WHERE id = ?", [$template]);
    $newRating = $stats[0]['rating_count'] > 0 ? round($stats[0]['rating_sum'] / $stats[0]['rating_count'], 1) : 0;

    header('Content-Type: application/json');
    echo json_encode([
      'success' => true,
      'rating' => $newRating,
      'rating_count' => $stats[0]['rating_count'],
      'userRating' => $rating
    ]);
  }

  public function favorite($f3)
  {
    $template = $f3->get('PARAMS.template');
    $action = $f3->get('POST.action'); // 'add' or 'remove'
    $this->logAction($f3);

    $db = $f3->get('db');
    $db->exec("INSERT OR IGNORE INTO stats (id) VALUES (?)", [$template]);
    if ($action === 'add') {
      $db->exec("UPDATE stats SET favorites = favorites + 1 WHERE id = ?", [$template]);
    } else {
      $db->exec("UPDATE stats SET favorites = MAX(0, favorites - 1) WHERE id = ?", [$template]);
    }
    echo json_encode(['success' => true]);
  }

  /**
   * Recursively add folder contents to zip, excluding info.json and .git
   */
  private function addFolderToZip($folder, $zip, $basePath = '')
  {
    $handle = opendir($folder);
    while (($file = readdir($handle)) !== false) {
      if ($file === '.' || $file === '..' || $file === '.git') {
        continue;
      }

      $filePath = $folder . '/' . $file;
      $relativePath = $basePath ? $basePath . '/' . $file : $file;

      if ($file === 'info.json') {
        continue;
      }

      if (is_dir($filePath)) {
        $this->addFolderToZip($filePath, $zip, $relativePath);
      } else {
        $zip->addFile($filePath, $relativePath);
      }
    }
    closedir($handle);
  }
}
