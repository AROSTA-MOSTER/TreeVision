# TreeVision Frontend

Standalone frontend for **TreeVision**, adapted from [https://www.treemaps.app/](https://www.treemaps.app/) (`umonkey/treemap` `services/landing`) and packaged with Vite for local development and static builds.

## Quick Start

```bash
npm install
npm run dev
```

To create a production static build in `dist/`:

```bash
npm run build
npm run preview
```

## Project Structure

- `index.html`: Rendered landing page markup, styles, SEO metadata, and JSON-LD schema.
- `public/css/gallery.css`: Carousel and `<dialog>` lightbox styling.
- `public/js/gallery.js`: Interactive carousel, touch swipe support, and lightbox modal logic.
- `public/screenshot-*.webp` & `public/screenshot-01-home.png`: App preview screenshots and icons.
