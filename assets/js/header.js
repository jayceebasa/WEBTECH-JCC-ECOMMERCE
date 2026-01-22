// Header functionality
class Header {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.updateCartCount();
        // Don't call setActiveNavigation here - it will be called from partials-loader
    }

    setupMobileMenu() {
        // For Bootstrap navbar, the toggle and menu are handled by Bootstrap's JavaScript
        // We just need to close the menu when a link is clicked
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        const navbarCollapse = document.querySelector('.navbar-collapse');
        const navbarToggler = document.querySelector('.navbar-toggler');
        
        if (!navLinks) return;

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Close mobile menu after clicking a link
                if (navbarCollapse && navbarCollapse.classList.contains('show')) {
                    navbarToggler.click();
                }
            });
        });
    }

    setActiveNavigation() {
        // Get current page path
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';
        
        // Get navigation links - updated for Bootstrap navbar structure
        const homeLink = document.querySelector('.navbar-nav a[href*="index.html"]');
        const shopLink = document.querySelector('.navbar-nav a[href*="shop.html"]');
        
        // Get all cart icons (desktop and mobile)
        const cartIcons = document.querySelectorAll('.cart-icon');
        
        // Remove active class from all nav links first
        document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
            link.classList.remove('active');
        });
        cartIcons.forEach(icon => {
            icon.classList.remove('active');
        });
        
        // Add active class based on current page
        if (currentPage === 'index.html' || currentPage === '' || currentPath === '/' || currentPath.endsWith('/')) {
            // Homepage - highlight Home
            if (homeLink) homeLink.classList.add('active');
        } else if (currentPage === 'shop.html') {
            // Shop page - highlight Shop
            if (shopLink) shopLink.classList.add('active');
        } else if (currentPage === 'cart.html') {
            // Cart page - highlight all cart icons (both desktop and mobile)
            cartIcons.forEach(icon => {
                icon.classList.add('active');
            });
        }
    }

    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            // Get cart items from localStorage or your cart system
            const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
            cartCount.textContent = cartItems.length;
        }
    }

    // Method to update cart count from other parts of the application
    static updateCartDisplay() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
            cartCount.textContent = cartItems.length;
        }
    }
}

// Expose Header class globally for partials-loader
window.Header = Header;

// Initialize header when DOM is loaded (fallback if not using partials-loader)
document.addEventListener('DOMContentLoaded', () => {
    document.body.classList.add('has-js');
    // Only initialize if partials-loader hasn't already done it
    if (!document.querySelector('.main-header')) {
        new Header();
    }
});