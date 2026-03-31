# Nexus Gaming Hub - Video Game Store Template

A futuristic and modern video game store template with neon aesthetics, dark mode support, and complete e-commerce functionality.

## Features

✨ **Modern Design**
- Futuristic neon-themed aesthetic with purple, cyan, and pink gradients
- Smooth animations and transitions
- Fully responsive design (mobile, tablet, desktop)

🎮 **E-Commerce Functionality**
- Interactive product grid with 8 featured games
- Shopping cart with add/remove and quantity management
- Real-time cart total calculation
- Mock game data with ratings and categories

🔍 **Advanced Filtering**
- Search games by name in real-time
- Filter by category (Action, Adventure, RPG, Racing, Strategy, Puzzle)
- Instant results with visual feedback

🌙 **Dark Mode**
- Native dark mode toggle
- Persisted state with Alpine.js
- Smooth theme transitions

📱 **Responsive Layout**
- Mobile-first design approach
- Optimized navigation for all devices
- Touch-friendly interactive elements

🎨 **Customizable Components**
- Custom Tailwind configuration with neon colors
- Reusable card components
- Flexible hero section

## Technologies Used

- **HTML5** - Semantic markup
- **Tailwind CSS** - Utility-first CSS framework (CDN)
- **Alpine.js** - Lightweight JavaScript framework for interactivity
- **Tabler Icons** - Beautiful SVG icons library
- **Google Fonts** - Orbitron (display) and Inter (body) fonts

## Section Breakdown

### Navigation
- Logo with gradient neon effect
- Search functionality
- Dark mode toggle
- Shopping cart indicator with count badge

### Hero Section
- Eye-catching headline with gradient text
- Animated gradient background
- Call-to-action buttons with hover effects

### Features Section
- Three benefit cards with icons
- Fast Delivery, Secure Payment, 24/7 Support

### Product Grid
- Responsive grid (1-4 columns based on screen size)
- Game cards with:
  - Product image with zoom effect on hover
  - Rating badge
  - Game name and category
  - Price display
  - Add to cart button

### Shopping Cart
- Slide-in sidebar panel
- Product thumbnails
- Quantity adjustment
- Price totals
- Checkout button

### Footer
- Company information
- Quick links
- Support links
- Social media integration

## Customization

### Colors
Edit the gradient-neon class or Tailwind config to change the primary colors:
- `text-neon-purple` → `#A855F7`
- `text-neon-cyan` → `#06B6D4`
- `text-neon-pink` → `#EC4899`

### Games Data
Update the `games` array in the Alpine.js state to add your own games:
```javascript
{ 
  id: 1, 
  name: 'Game Name', 
  price: 49.99, 
  category: 'action', 
  image: 'image-url', 
  rating: 4.8 
}
```

### Categories
Modify the category filter list in the template:
```html
<template x-for="cat in ['all', 'action', 'adventure', ...]">
```

### Fonts
Change font families in the Google Fonts link and Tailwind extend config.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- Uses CDN for all external resources
- Alpine.js keeps JavaScript bundle minimal
- Optimized images through Unsplash
- CSS classes are tree-shaken by Tailwind CDN

## License

MIT License - See LICENSE file for details

## Notes

- The template uses Unsplash images as placeholders
- Shopping cart is client-side only (implement backend for persistence)
- No actual payment processing (integrate with payment gateway for production)
- Screenshot (imgs/template.webp) should be generated after deployment

## Future Enhancements

- Backend API integration for real games catalog
- Payment gateway integration
- User authentication and wishlist
- Product reviews and ratings
- Game details modal with screenshots and descriptions
- Wishlist functionality
- Discount codes system
