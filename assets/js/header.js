// Header functionality
class Header {
    constructor() {
        this.init();
    }

    init() {
        this.setupMobileMenu();
        this.setupSearchButtons();
        this.setupSearchPanel();
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

    setupSearchButtons() {
        const searchButtons = document.querySelectorAll('.search-btn');
        if (!searchButtons.length) return;

        searchButtons.forEach((button) => {
            button.addEventListener('click', (event) => {
                event.preventDefault();
                this.handleSearchClick();
            });
        });
    }

    setupSearchPanel() {
        this.searchPanel = document.getElementById('headerSearchPanel');
        this.searchInput = document.getElementById('headerSearchInput');
        this.searchResults = document.getElementById('headerSearchResults');
        this.searchCloseButton = document.getElementById('headerSearchClose');
        this.searchProducts = [];
        this.searchProductsPromise = null;

        if (!this.searchPanel || !this.searchInput || !this.searchResults || !this.searchCloseButton) {
            return;
        }

        this.searchCloseButton.addEventListener('click', () => {
            this.closeSearchPanel();
        });

        this.searchInput.addEventListener('input', () => {
            const query = this.searchInput.value.trim();
            this.handleLiveSearch(query);
        });

        this.searchInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                this.goToShopSearch(this.searchInput.value.trim());
            }
        });

        this.searchResults.addEventListener('click', (event) => {
            const productButton = event.target.closest('[data-search-product-id]');
            if (productButton) {
                const productId = productButton.getAttribute('data-search-product-id');
                if (productId) {
                    window.location.href = this.getSingleProductPath(productId);
                }
                return;
            }

            const viewAllButton = event.target.closest('[data-search-view-all]');
            if (viewAllButton) {
                const query = this.searchInput.value.trim();
                this.goToShopSearch(query);
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                this.closeSearchPanel();
            }
        });

        this.renderEmptySearchHint();
    }

    handleSearchClick() {
        if (!this.searchPanel || !this.searchInput) {
            this.goToShopSearch('');
            return;
        }

        const panelWasHidden = this.searchPanel.hasAttribute('hidden');

        if (panelWasHidden) {
            this.openSearchPanel();
        } else {
            this.closeSearchPanel();
        }
    }

    openSearchPanel() {
        if (!this.searchPanel || !this.searchInput) return;

        this.searchPanel.removeAttribute('hidden');

        const params = new URLSearchParams(window.location.search);
        const queryFromUrl = (params.get('search') || '').trim();
        if (queryFromUrl && !this.searchInput.value.trim()) {
            this.searchInput.value = queryFromUrl;
        }

        this.handleLiveSearch(this.searchInput.value.trim());

        // Delay focus slightly so the panel is visible before keyboard opens on mobile.
        setTimeout(() => {
            this.searchInput.focus();
            this.searchInput.select();
        }, 30);
    }

    closeSearchPanel() {
        if (!this.searchPanel) return;
        this.searchPanel.setAttribute('hidden', 'hidden');
    }

    async handleLiveSearch(query) {
        this.syncShopSearch(query);
        await this.ensureSearchProductsLoaded();
        this.renderSearchResults(query);
    }

    async ensureSearchProductsLoaded() {
        if (this.searchProducts.length > 0) return;
        if (this.searchProductsPromise) {
            await this.searchProductsPromise;
            return;
        }

        this.searchProductsPromise = this.fetchSearchProducts();
        await this.searchProductsPromise;
        this.searchProductsPromise = null;
    }

    async fetchSearchProducts() {
        if (typeof API_BASE === 'undefined') {
            this.searchProducts = [];
            return;
        }

        try {
            const response = await fetch(`${API_BASE}/products?limit=150&published=true`);
            if (!response.ok) throw new Error(`Failed to load products: ${response.status}`);

            const data = await response.json();
            this.searchProducts = data.data || data.products || [];
        } catch (error) {
            console.error('Failed to load search products:', error);
            this.searchProducts = [];
        }
    }

    renderSearchResults(query) {
        if (!this.searchResults) return;

        const normalizedQuery = (query || '').toLowerCase();
        if (!normalizedQuery) {
            this.renderEmptySearchHint();
            return;
        }

        const matches = this.searchProducts
            .filter((product) => ((product?.name) || '').toLowerCase().includes(normalizedQuery))
            .slice(0, 8);

        if (!matches.length) {
            this.searchResults.innerHTML = `
                <p class="header-search-empty">No products match "${this.escapeHtml(query)}" yet.</p>
                <button type="button" class="header-search-view-all" data-search-view-all="true">Search in shop</button>
            `;
            return;
        }

        const itemsMarkup = matches.map((product) => {
            const productId = product._id || product.id || '';
            const safeName = this.escapeHtml(product.name || 'Unnamed product');
            const priceValue = Number(product.price || 0);
            const safePrice = `₱${priceValue.toLocaleString()}.00`;

            return `
                <button type="button" class="header-search-item" data-search-product-id="${this.escapeHtml(String(productId))}">
                    <span class="header-search-item-name">${safeName}</span>
                    <span class="header-search-item-price">${safePrice}</span>
                </button>
            `;
        }).join('');

        this.searchResults.innerHTML = `${itemsMarkup}
            <button type="button" class="header-search-view-all" data-search-view-all="true">See all results in shop</button>
        `;
    }

    renderEmptySearchHint() {
        if (!this.searchResults) return;
        this.searchResults.innerHTML = '<p class="header-search-empty">Type a product name and results will appear as you type.</p>';
    }

    goToShopSearch(query) {
        const term = (query || '').trim();
        if (this.isShopPage()) {
            this.syncShopSearch(term);
            return;
        }

        const shopPagePath = this.getShopPagePath();
        const target = term
            ? `${shopPagePath}?search=${encodeURIComponent(term)}`
            : shopPagePath;

        window.location.href = target;
    }

    isShopPage() {
        return window.location.pathname.toLowerCase().includes('shop.html');
    }

    syncShopSearch(query) {
        if (!this.isShopPage()) return;

        const params = new URLSearchParams(window.location.search);
        if (query) {
            params.set('search', query);
        } else {
            params.delete('search');
        }

        const nextUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
        window.history.replaceState({}, '', nextUrl);
        window.dispatchEvent(new CustomEvent('header-search', {
            detail: { query }
        }));
    }

    getShopPagePath() {
        const isInsidePages = window.location.pathname.includes('/pages/');
        return isInsidePages ? 'shop.html' : 'pages/shop.html';
    }

    getSingleProductPath(productId) {
        const isInsidePages = window.location.pathname.includes('/pages/');
        return isInsidePages
            ? `singleProduct.html?id=${encodeURIComponent(productId)}`
            : `pages/singleProduct.html?id=${encodeURIComponent(productId)}`;
    }

    escapeHtml(value) {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
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