# Template Screenshot Capture

Generate screenshots for HTML templates in the `/data` directory using Playwright.

## Prerequisites

- Node.js 18+ installed
- npm or pnpm package manager
- Playwright browsers installed

## Installation

```bash
# Install dependencies from project root
npm install

# Install Playwright browsers (Chrome, Firefox, WebKit)
npm run install:browsers
```

## Usage

### From project root

```bash
# Capture a specific template
npm run capture <template-folder-name>

# Capture all templates
npm run capture:all
```

### Direct execution

```bash
node script-screenshot/capture.js <template-folder-name>
node script-screenshot/capture.js --all
```

**Examples:**
```bash
npm run capture heritage_carpentry_restoration
npm run capture modern_melamine_furnishings
npm run capture:all
```

### Show help

```bash
npm run capture
```

## Output

Screenshots are saved as:
```
data/{template-name}/imgs/template.webp
```

## Configuration

Edit `script-screenshot/capture.js` to customize:

```javascript
const VIEWPORT = { width: 1280, height: 720 };  // Desktop resolution
const FULL_PAGE = true;                         // Full page scroll screenshot
```

## Troubleshooting

### "Browser not found"
Run `npm run install:browsers` to install Playwright browsers.

### "Template not found"
Ensure the template folder exists in `/data` and contains an `index.html` file.

### Images not loading
The script waits 2 seconds for lazy-loaded images. Increase the timeout in `capture.js` if needed.

### Screenshot quality
The script captures full-page PNG and saves as `.webp`. Adjust `VIEWPORT` or `FULL_PAGE` settings for different results.
