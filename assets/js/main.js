// Main JavaScript file for WST JCC E-Commerce
console.log('WST JCC E-Commerce application loaded successfully!');

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');
    
    // Initialize application
    initializeApp();
});

// Initialize the application
function initializeApp() {
    console.log('Initializing WST JCC E-Commerce app...');
    
    // Load header and footer partials
    if (typeof PartialsLoader !== 'undefined') {
        PartialsLoader.loadHeaderAndFooter().then(() => {
            console.log('Header and footer loaded');
            // Update cart badge after header loads
            if (typeof updateCartBadge === 'function') {
                updateCartBadge();
            }
        });
    }
}

// Note: Page-specific event listeners are set up in individual page files:
// - shop.js: handles product filtering and loading
// - single-product.js: handles product detail display
// - admin-auth.js: handles authentication
// - header.js: handles navigation and mobile menu