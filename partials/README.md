# Partials Folder

This folder contains reusable HTML partials that can be dynamically loaded into pages.

## Purpose

- Store reusable HTML components (header, footer, etc.)
- Enable dynamic loading of common page elements
- Maintain consistent layouts across all pages
- Simplify maintenance by having single source of truth

## Files

- **header.html**: Header partial with navigation
- **footer.html**: Footer partial with links and copyright
- **README.md**: This documentation file

## Usage

The partials are automatically loaded by the `partials-loader.js` script:

```html
<!-- In your HTML files -->
<header></header> <!-- Header partial will be loaded here -->
<footer></footer> <!-- Footer partial will be loaded here -->
```

## Benefits

1. **DRY Principle**: Don't repeat header/footer code on every page
2. **Easy Maintenance**: Update header/footer in one place
3. **Consistency**: All pages use the same header/footer structure
4. **Performance**: Partials can be cached by the browser