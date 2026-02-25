# TechStore Template

A modern, responsive e-commerce website template for a tech store, built with HTML, Tailwind CSS, Alpine.js, and other lightweight libraries. This template provides a complete starting point for creating an online store focused on electronics, gadgets, and accessories.

## Features

### 🎨 Design & UI

- **Responsive Design**: Fully responsive layout that works seamlessly on desktop, tablet, and mobile devices.
- **Dark Mode Support**: Built-in dark mode toggle with local storage persistence.
- **Modern UI**: Clean, professional design using Tailwind CSS with custom color schemes and smooth transitions.
- **Smooth Animations**: Powered by Anime.js for engaging user interactions, including a "fly-to-cart" animation when adding products.

### 🛒 E-commerce Functionality

- **Product Catalog**: Pre-populated with sample tech products (laptops, smartphones, accessories, audio devices).
- **Shopping Cart**: Interactive cart with quantity management, item removal, and total calculation.
- **Product Filtering**: Filter products by category (All, Laptops, Smartphones, Accessories, Audio).
- **Search Functionality**: Real-time search through product names and descriptions.
- **Sorting Options**: Sort products by featured, price (low to high), or price (high to low).
- **Product Ratings**: Star ratings displayed for each product.

### 🎠 Interactive Elements

- **Hero Carousel**: Auto-rotating carousel with featured offers, manual navigation controls, and indicators.
- **Mobile Menu**: Collapsible navigation menu for mobile devices.
- **Back to Top Button**: Appears on scroll for easy navigation to the top of the page.
- **Hover Effects**: Interactive overlays on product cards with quick action buttons.

### 📱 Sections Included

- **Header**: Logo, navigation menu, cart dropdown, theme toggle, and mobile menu button.
- **Hero Section**: Full-width carousel showcasing featured products/offers.
- **Products Grid**: Main product display with filtering and search controls.
- **About Us**: Brief company information with icons.
- **Footer**: Contact information, social links, newsletter signup, and credits.

### 🛠️ Technical Features

- **Lightweight**: Uses CDN-hosted libraries to minimize load times.
- **No Build Process Required**: Ready to use - just open the HTML file in a browser.
- **View Transitions**: Modern CSS view transitions for smooth state changes (where supported).
- **Accessibility**: Proper ARIA labels and semantic HTML structure.
- **Performance Optimized**: Efficient rendering with Alpine.js reactivity.

## Technologies Used

- **HTML5**: Semantic markup structure
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Alpine.js**: Lightweight JavaScript framework for reactivity
- **Anime.js**: Animation library for smooth transitions
- **Phosphor Icons**: Modern, lightweight icon set
- **Google Fonts (Inter)**: Clean, readable typography

## How to Use

### Quick Start

1. Download or clone the template files.
2. Open `index.html` in any modern web browser.
3. The template is fully functional out of the box with sample data.

### Customization

#### Changing Content

- **Products**: Edit the `products` array in the JavaScript section to add, remove, or modify products.
- **Slides**: Update the `slides` array for different hero carousel content.
- **Categories**: Modify the `categories` array to change available filter options.
- **Branding**: Update the logo, site title, and footer information.

#### Styling

- Colors are defined in the Tailwind config within the `<script>` tag.
- Modify the `primary` color scheme or add new colors as needed.
- Custom CSS can be added in the `<style>` section.

#### Functionality

- Alpine.js data and methods are defined in the `techStore()` function.
- Add new features by extending the Alpine.js component.
- Animations can be customized in the `addToCart()` method using Anime.js.

#### Images

- Replace image files in the `imgs/` directory with your own product images.
- Update image paths in the `products` and `slides` arrays accordingly.

### File Structure

```
techstore/
├── index.html          # Main template file
├── imgs/               # Product and carousel images
│   ├── ...             # Image files
└── README.md           # This file
```

## Potential Uses

- **E-commerce Websites**: Perfect for online stores selling electronics, gadgets, or tech accessories.
- **Portfolio Projects**: Great for developers showcasing front-end skills.
- **Prototyping**: Quick way to demonstrate e-commerce concepts or product catalogs.
- **Learning Projects**: Ideal for practicing HTML, CSS, JavaScript, and modern web development techniques.
- **Business Websites**: Can be adapted for tech companies, repair services, or gadget reviews.
- **Landing Pages**: Use as a foundation for product launch pages or promotional sites.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires JavaScript enabled
- View Transitions API support for enhanced animations (optional)

## Credits

- **Designed by**: Abel Gallo Ruiz
- **GitHub**: [abelrgr/template-techstore](https://github.com/abelrgr/template-techstore)
- **LinkedIn**: [Abel Gallo Ruiz](https://www.linkedin.com/in/abel-gallo-ruiz)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

You are free to use, modify, and distribute this template in your projects, both personal and commercial, as long as you include the license notice and provide credit to the original author.

---

_Last updated: January 4, 2026_
