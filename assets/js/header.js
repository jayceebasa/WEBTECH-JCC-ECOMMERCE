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

    /**
     * Render the login / user-account button in the header.
     * Checks the active user session and updates the #headerUserBtn element.
     */
    async renderUserButton() {
        const container = document.getElementById('headerUserBtn');
        if (!container || typeof userAuth === 'undefined') return;

        const render = (user) => {
            if (user) {
                const displayName = user.firstName || user.email.split('@')[0];
                const profileHref = window.location.pathname.includes('/pages/') ? 'profile.html' : 'pages/profile.html';
                container.innerHTML = `
                <div class="dropdown">
                    <button class="user-btn d-flex align-items-center gap-2 dropdown-toggle"
                            type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                            <circle cx="12" cy="8" r="4"/>
                            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                        </svg>
                        <span>${displayName}</span>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                        <li><span class="dropdown-item-text text-muted" style="font-size:12px;">${user.email}</span></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="${profileHref}">My Profile</a></li>
                        <li><button class="dropdown-item" onclick="headerLogout()">Sign Out</button></li>
                    </ul>
                </div>`;
            } else {
                const loginHref = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
                container.innerHTML = `
                <a href="${loginHref}" class="user-btn d-flex align-items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="12" cy="8" r="4"/>
                        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                    </svg>
                    <span>Login</span>
                </a>`;
            }
        };

        // Render synchronously from cache — zero delay, no flicker
        render(userAuth._getCachedUser());

        // Background refresh: only re-render if something changed (e.g. token expired)
        userAuth.getMe(render);
    }
}

async function headerLogout() {
    if (typeof userAuth !== 'undefined') {
        await userAuth.logout();
    }
    window.location.reload();
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