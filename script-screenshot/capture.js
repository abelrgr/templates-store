import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const DATA_DIR = resolve(__dirname, '..', 'data');
const VIEWPORT = { width: 1280, height: 720 };
const FULL_PAGE = false;

/**
 * Capture screenshot for a template
 * @param {string} templateName - Name of the template folder in /data
 */
async function captureScreenshot(templateName) {
  const templateDir = join(DATA_DIR, templateName);
  const htmlPath = join(templateDir, 'index.html');
  const imgsDir = join(templateDir, 'imgs');
  const outputPath = join(imgsDir, 'template.webp');

  // Validate template exists
  if (!fs.existsSync(templateDir)) {
    console.error(`❌ Error: Template folder "${templateName}" not found in /data`);
    console.error(`   Looking in: ${templateDir}`);
    process.exit(1);
  }

  if (!fs.existsSync(htmlPath)) {
    console.error(`❌ Error: index.html not found in template "${templateName}"`);
    console.error(`   Looking in: ${htmlPath}`);
    process.exit(1);
  }

  // Ensure imgs directory exists
  if (!fs.existsSync(imgsDir)) {
    console.log(`📁 Creating imgs directory: ${imgsDir}`);
    fs.mkdirSync(imgsDir, { recursive: true });
  }

  console.log(`📸 Capturing screenshot for: ${templateName}`);
  console.log(`   HTML: ${htmlPath}`);
  console.log(`   Output: ${outputPath}`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--disable-web-security', '--disable-features=IsolateOrigins,site-per-process']
  });

  const context = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
  });

  const page = await context.newPage();

  try {
    // Convert file path to file:// URL
    const fileUrl = `file://${htmlPath}`;
    
    console.log(`   Loading: ${fileUrl}`);
    
    // Navigate to the HTML file
    await page.goto(fileUrl, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Wait for any lazy-loaded images
    await page.waitForTimeout(2000);

    // Wait for Alpine.js to finish any animations
    await page.waitForFunction(() => {
      return document.readyState === 'complete';
    });

    // Capture screenshot as PNG (most compatible format)
    await page.screenshot({
      path: outputPath.replace('.webp', '.png'),
      type: 'png',
      fullPage: FULL_PAGE,
      omitBackground: false
    });
    
    // Rename to .webp for consistency with template structure
    fs.renameSync(outputPath.replace('.webp', '.png'), outputPath);

    console.log(`✅ Screenshot saved successfully!`);
    console.log(`   Location: ${outputPath}`);
    
    // Get file size
    const stats = fs.statSync(outputPath);
    const fileSizeKB = (stats.size / 1024).toFixed(2);
    console.log(`   Size: ${fileSizeKB} KB`);

  } catch (error) {
    console.error(`❌ Error capturing screenshot: ${error.message}`);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

/**
 * Capture screenshots for all templates
 */
async function captureAll() {
  console.log('📸 Capturing screenshots for ALL templates in /data\n');
  
  const folders = fs.readdirSync(DATA_DIR)
    .filter(item => {
      const itemPath = join(DATA_DIR, item);
      return fs.statSync(itemPath).isDirectory() && 
             fs.existsSync(join(itemPath, 'index.html'));
    });

  if (folders.length === 0) {
    console.log('No templates with index.html found in /data');
    return;
  }

  console.log(`Found ${folders.length} templates:\n`);
  folders.forEach((f, i) => console.log(`   ${i + 1}. ${f}`));
  console.log();

  for (const folder of folders) {
    try {
      await captureScreenshot(folder);
      console.log();
    } catch (error) {
      console.error(`   ⚠️  Failed: ${folder} - ${error.message}\n`);
    }
  }

  console.log('🎉 Batch capture complete!');
}

// Main execution
const templateName = process.argv[2];

if (!templateName) {
  console.log('📷 Template Screenshot Capture\n');
  console.log('Usage:');
  console.log('  node capture.js <template-name>    Capture specific template');
  console.log('  node capture.js --all              Capture all templates\n');
  console.log('Examples:');
  console.log('  node capture.js heritage_carpentry_restoration');
  console.log('  node capture.js modern_melamine_furnishings');
  console.log('  node capture.js --all\n');
  console.log(`Available templates in /data:`);
  
  const folders = fs.readdirSync(DATA_DIR)
    .filter(item => {
      const itemPath = join(DATA_DIR, item);
      return fs.statSync(itemPath).isDirectory() && 
             fs.existsSync(join(itemPath, 'index.html'));
    });
  
  folders.forEach((f, i) => console.log(`   ${i + 1}. ${f}`));
  console.log();
  process.exit(0);
}

if (templateName === '--all' || templateName === '-a') {
  captureAll();
} else {
  captureScreenshot(templateName);
}
