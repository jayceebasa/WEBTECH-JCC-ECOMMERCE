## WST-JCC-ECOMMERCE

This repository contains a small front-end e-commerce demo built with static HTML, CSS and JavaScript. It is intended as a learning or portfolio project demonstrating a simple product listing, single-product pages, and a cart implemented on the client side.

## Project summary

- Tech: HTML, CSS, JavaScript
- Purpose: Static front-end demo of a small e-commerce site (catalog, product details, cart)


## Project structure

The repository is organized as a lightweight static front-end project. Below is a clear tree-style overview you can use as a reference:

WST-JCC-ECOMMERCE/
├── index.html                 # Main entry point
├── assets/                    # Static assets
│   ├── css/                  # Stylesheets
│   │   ├── main.css         # Main stylesheet
│   │   ├── cart.css         # Cart stylesheet
│   │   ├── shop.css         # Shop stylesheet
│   │   ├── single-product.css  # Single-Product stylesheet
│   │   ├── header.css       # Header styles
│   │   ├── footer.css       # Footer styles
│   │   └── README.md
│   ├── js/                   # JavaScript files
│   │   ├── main.js          # Main JavaScript file
│   │   ├── helpers.js       # Utility functions
│   │   ├── cart.js          # Cart functionality
│   │   ├── shop.js          # Shop page logic
│   │   ├── single-product.js # Single product page logic
│   │   ├── header.js        # Header functionality
│   │   ├── partials-loader.js # Partials loading utility
│   │   └── README.md
│   ├── images/               # Images (products, banners, UI)
│   ├── icons/                # Icon files
│   ├── fonts/                # Custom fonts
│   └── README.md
├── data/                     # Static data files (JSON)
│   ├── products.json         # Product catalog
│   └── README.md
├── pages/                    # Individual page files
│   └── README.md
├── partials/                 # Reusable HTML partials
│   ├── header.html          # Header partial
│   ├── footer.html          # Footer partial
│   └── README.md
└── README.md                # This file

Notes

- The above tree maps the primary responsibilities of each folder.
- Use `assets/js/` for runtime JavaScript; `utils/` is kept for compatibility notes and can be removed or merged into `assets/js/` later.
- Keep `data/products.json` as the single source of product data for rendering pages.

Each file is static and intended to be served over HTTP. The JavaScript reads the `data/products.json` file and manipulates the DOM to render products and cart state.

## Quickstart — previewing the site in VS Code (Live Preview)

This project is static (HTML/CSS/JS) so the easiest way to preview it during development is using VS Code's built-in Live Preview or a Live Server extension. The steps below focus on using the VS Code Live Preview experience so you can instantly view and interact with pages while editing.

1. Open the repository folder in Visual Studio Code: use File → Open Folder and select the project root.
2. Install a live HTML preview extension if you don't already have one. Two common choices:
	 - Live Preview (by Microsoft) — integrates a browser preview panel inside VS Code.
	 - Live Server (by Ritwick Dey) — launches a small local static server and opens your default browser.

3. Open `index.html` (or any file under `pages/`, e.g. `pages/shop.html`) in the editor.
4. Start the preview:
	 - With Live Preview (Microsoft): open the Command Palette (Ctrl+Shift+P) and run "Live Preview: Show Preview" or click the Live Preview button in the status bar or editor toolbar. The preview opens inside VS Code; you can dock it or open it in the browser.
	 - With Live Server: click the "Go Live" button in the status bar; the site will open in your browser on a local port.
5. Interact with the site in the preview. Changes you save in your editor are reflected immediately by the Live Preview/Live Server extension.

Notes on preview behavior

- The site loads `data/products.json` via fetch. Live Preview or Live Server provide an HTTP context so that fetch/XHR requests to local files succeed. Opening `index.html` directly from the file system (file://) can block fetch requests due to browser security, so use an HTTP preview.
- If you use Live Preview inside VS Code, you can keep the preview panel visible while editing files side-by-side.
- If you choose to run a separate static server (for example, `http-server` or Python's `http.server`), ensure it serves the project root so relative asset and data paths resolve correctly.

## How the site is organized (brief)

- Layout: shared header and footer are kept in `partials/` and loaded at runtime by `js/partials-loader.js`.
- Data: `data/products.json` is the single source of product data used to render the shop and product pages.
- Cart: `js/cart.js` manages cart state and persists (typically to localStorage) so the cart survives page reloads.

## Troubleshooting

- If product images or data fail to load in the preview, confirm you started Live Preview/Live Server (an HTTP context) and that the URL in the preview points to the project root.
- If a browser blocks fetch to `products.json`, make sure you are not using a file:// URL. Use the Live Preview or Live Server HTTP URL instead.
