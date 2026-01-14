# Templates Marketplace

A modern web application for browsing, previewing, and downloading HTML templates. Features a dynamic interface with real-time statistics, ratings, and download tracking.

## Features

- **Template Gallery**: Browse through multiple premium HTML templates (HealthStore, TechStore, and more)
- **Live Preview**: Quick view templates with modal previews
- **Download Tracking**: Monitor download statistics and user engagement
- **Rating System**: Users can rate templates (1-5 stars) with IP-based protection
- **Favorites**: Mark templates as favorites
- **View Counter**: Track template popularity
- **Countdown Timer**: Feature upcoming releases or events
- **Responsive Design**: Built with Tailwind CSS for mobile-first experience
- **REST API**: JSON endpoints for template statistics and interactions

## Technologies

- **Backend**: PHP with Fat-Free Framework (F3)
- **Frontend**: Tailwind CSS, Alpine.js, Anime.js
- **Database**: SQLite
- **Server**: Nginx (Docker)
- **Build Tools**: Tailwind CSS (with JIT mode)
- **Containerization**: Docker

## Installation

### Using Docker

```bash
docker build -t templates-marketplace .
docker run -p 8080:80 templates-marketplace
```

### Local Development

```bash
composer install
php -S localhost:8080
```

## Project Structure

```
/templates          # HTML template partials
/template-*         # Individual template packages
/assets             # CSS and JS assets
/docker             # Docker configuration
/vendor             # PHP dependencies
index.php           # Application entry point
```

## API Endpoints

- `GET /` - Homepage with template gallery
- `GET /download/@template` - Download template ZIP
- `POST /api/view/@template` - Track template views
- `POST /api/rate/@template` - Rate a template (1-5 stars)
- `POST /api/favorite/@template` - Toggle favorite status

## Author

**Abel Gallo Ruiz**

## License

This project is licensed under the MIT License.
