// Partials loader utility for loading header and footer
class PartialsLoader {
    static getBasePath() {
        const currentPath = window.location.pathname;
        const hostname = window.location.hostname;
        
        const isInPagesFolder = currentPath.includes('/pages/') || 
                               currentPath.endsWith('/shop.html') || 
                               currentPath.endsWith('/cart.html') ||
                               currentPath.endsWith('/singleProduct.html');
        
        const basePath = isInPagesFolder ? '../' : '';
        return basePath;
    }

    static async loadPartial(partialPath, targetSelector) {
        const basePath = this.getBasePath();
        const cacheKey = `partial_cache_${partialPath}_${basePath}`;

        const targetElement = document.querySelector(targetSelector);
        if (!targetElement) return;

        // Inject from sessionStorage cache instantly (no network wait)
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
            targetElement.innerHTML = cached;
        }

        // Fetch fresh copy in background (or first load)
        try {
            const fullPath = basePath + partialPath;
            let response = await fetch(fullPath);
            if (!response.ok) {
                const fallbackPath = '../' + partialPath;
                response = await fetch(fallbackPath);
                if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            }

            let html = await response.text();
            html = this.fixPaths(html, basePath);

            // Update cache
            sessionStorage.setItem(cacheKey, html);

            // Only update DOM if it changed (avoids re-running Header init unnecessarily)
            if (html !== cached) {
                targetElement.innerHTML = html;
            }
        } catch (error) {
            console.error('Error loading partial:', error);
        }
    }

    static fixPaths(html, basePath) {
        if (basePath === '../') {
            return html;
        } else {
            html = html.replace(/href="\.\.\/index\.html"/g, 'href="index.html"');
            html = html.replace(/src="\.\.\/assets\//g, 'src="assets/');
            html = html.replace(/href="\.\.\/assets\//g, 'href="assets/');
            html = html.replace(/href="shop\.html"/g, 'href="pages/shop.html"');
            html = html.replace(/href="cart\.html"/g, 'href="pages/cart.html"');
            html = html.replace(/href="singleProduct\.html"/g, 'href="pages/singleProduct.html"');
            return html;
        }
    }

    static async loadHeader() {
        await this.loadPartial('partials/header.html', 'header');
    }

    static async loadFooter() {
        await this.loadPartial('partials/footer.html', 'footer');
    }
}

// Auto-load header and footer on pages that have the containers
document.addEventListener('DOMContentLoaded', async () => {
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');

    if (header) {
        await PartialsLoader.loadHeader();

        if (window.Header) {
            const headerInstance = new Header();
            headerInstance.setActiveNavigation();
            headerInstance.renderUserButton();
        }
    }

    if (footer) {
        await PartialsLoader.loadFooter();
    }

    if (typeof updateCartBadge === 'function') {
        updateCartBadge();
    }
});