// Header functionality
class Header {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileMenu();
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
        // Get current page from document or URL
        // Uses data-page attribute if available (more reliable than path parsing)
        const currentPage = document.documentElement.dataset.page || this.getCurrentPage();
        
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
        switch(currentPage) {
            case 'home':
            case 'index':
                if (homeLink) homeLink.classList.add('active');
                break;
            case 'shop':
                if (shopLink) shopLink.classList.add('active');
                break;
            case 'cart':
                cartIcons.forEach(icon => {
                    icon.classList.add('active');
                });
                break;
        }
    }

    /**
     * Get current page name from URL path
     * More reliable than string parsing
     */
    getCurrentPage() {
        const currentPath = window.location.pathname;
        const currentFile = currentPath.split('/').pop() || 'index.html';
        
        if (currentFile === '' || currentFile.includes('index.html')) {
            return 'home';
        } else if (currentFile.includes('shop.html')) {
            return 'shop';
        } else if (currentFile.includes('cart.html')) {
            return 'cart';
        }
        return 'other';
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