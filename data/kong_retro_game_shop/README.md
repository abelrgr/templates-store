# Kong Retro Shop — Tienda de Consolas de Segunda Mano

Plantilla de tienda online de consolas retro usadas, inspirada en la paleta de colores y 
atmósfera de **Donkey Kong Country (SNES)**. Verde selva profundo, dorados banana brillantes 
y marrones de barril de madera se combinan con tipografía pixel para revivir la era dorada del gaming.

## Vista previa

La captura de pantalla se genera automáticamente. Ver `imgs/template.webp`.

## Características

### Diseño
- Paleta DKC: jungle green (`#1b4d25`), banana gold (`#ffd000`), barrel brown (`#6b3a1f`)
- Tipografía **Press Start 2P** para títulos y elementos de marca
- Tipografía **Nunito** para cuerpo de texto
- Fondo oscuro con estrellas/luciérnagas animadas (evoca estadios bonus de DKC)
- Tarjetas estilo caja de madera con sombra pixel
- Botones con efecto tactile press (desplazamiento al clic)
- Scrollbar personalizado con colores de la paleta

### Funcionalidades
- **Catálogo filtrable** por categoría: Nintendo, Sega, PlayStation, Portátiles
- **Carrito de compras** lateral con gestión de cantidades y total reactivo
- **Badge de condición** por producto (Excelente / Bueno / Regular)
- **Sección "Vende tu consola"** con proceso en 3 pasos
- **Carrusel de testimonios** con navegación y paginación
- **FAQ interactivo** con acordeón Alpine.js
- **Formulario de contacto** con validación client-side
- **Modo oscuro** activado por defecto (toggle en navbar)
- **Toast notifications** para feedback de acciones
- **Responsive** — mobile, tablet y desktop

### Secciones
1. Barra de anuncio superior
2. Navbar sticky con logo, filtros de categoría, modo oscuro y carrito
3. Drawer de navegación móvil
4. Hero con headline pixel, CTAs y fondo atmosférico
5. Barra de características (Garantía, Revisadas, Envíos)
6. Catálogo de 8 consolas con filtros por plataforma
7. CTA "Vende tu consola" con proceso de 3 pasos
8. Sección de testimonios con carrusel
9. FAQ con acordeón
10. Contacto: información + formulario validado
11. Footer completo con 4 columnas
12. Sidebar de carrito de compras + backdrop

## Tecnologías

| Tecnología        | Versión / CDN |
|-------------------|--------------|
| HTML5             | —            |
| Tailwind CSS      | CDN latest   |
| Alpine.js         | ^3.x         |
| Tabler Icons      | latest       |
| Google Fonts      | Press Start 2P + Nunito |

## Paleta de colores

| Nombre         | Hex       | Uso                        |
|----------------|-----------|----------------------------|
| Jungle Darkest | `#030b05` | Fondo principal            |
| Jungle Dark    | `#0b1f10` | Navbar, secciones alt.     |
| Jungle Default | `#1b4d25` | Botones, badges, íconos    |
| Jungle Mid     | `#2d7a38` | Hover states               |
| Jungle Light   | `#4aad58` | Subtítulos, acentos        |
| Banana Default | `#ffd000` | Precios, highlights, glow  |
| Barrel Default | `#6b3a1f` | Bordes de tarjetas         |
| Barrel Dark    | `#2d1506` | Footer, sombras            |

## Personalización

### Agregar productos

Edita el array `products` dentro del Alpine.js `appState`:

```javascript
{
  id: 9,
  name: 'Nombre de la consola',
  system: 'nintendo',        // nintendo | sega | playstation | portatil
  condition: 'Excelente',    // Excelente | Bueno | Regular
  price: 250,
  originalPrice: 300,        // null si no hay precio original
  badge: 'Oferta',           // null si sin badge
  description: 'Descripción corta del producto.',
  image: 'https://images.unsplash.com/photo-...'
}
```

### Cambiar información de contacto

Busca en `index.html` la sección `id="contacto"` y actualiza dirección, teléfono y email.

### Cambiar colores

Modifica los colores en el bloque `tailwind.config`:

```javascript
colors: {
  jungle: { darkest: '#030b05', dark: '#0b1f10', DEFAULT: '#1b4d25', ... },
  banana: { DEFAULT: '#ffd000', ... },
  barrel: { DEFAULT: '#6b3a1f', ... },
}
```

## Compatibilidad

- Chrome ≥ 90 · Firefox ≥ 88 · Safari ≥ 14 · Edge ≥ 90
- iOS Safari · Chrome Mobile

## Notas de producción

- El carrito es sólo client-side. Integra un backend (Node.js, PHP, etc.) para persistencia.
- El formulario de contacto no envía datos reales. Conecta un endpoint o servicio (Formspree, EmailJS, etc.).
- Las imágenes son placeholders de Unsplash. Reemplázalas con fotos reales de tus consolas.
- `imgs/template.webp` es la captura generada con Playwright post-deploy.

## Licencia

MIT — ver archivo `LICENSE`.
