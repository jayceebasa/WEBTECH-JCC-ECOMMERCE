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
    
    // Add any initial setup code here
    setupEventListeners();
}

// Setup event listeners
function setupEventListeners() {
    // Add event listeners for interactive elements
    console.log('Event listeners set up');
}

// Utility functions will be added here as the project grows