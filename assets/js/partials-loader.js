// Partials loader utility for loading header and footer
class PartialsLoader {
    static getBasePath() {
        // Detect if we're in a subdirectory by checking the current path
        const currentPath = window.location.pathname;
        const hostname = window.location.hostname;
        
        console.log('Current path:', currentPath);
        console.log('Hostname:', hostname);
        
        // Check if we're on GitHub Pages
        const isGitHubPages = hostname.includes('github.io');
        
        // More robust subdirectory detection
        const isInPagesFolder = currentPath.includes('/pages/') || 
                               currentPath.endsWith('/shop.html') || 
                               currentPath.endsWith('/cart.html') ||
                               currentPath.endsWith('/singleProduct.html');
        
        const basePath = isInPagesFolder ? '../' : '';
        console.log('Base path determined:', basePath);
        
        return basePath;
    }

    static async loadPartial(partialPath, targetSelector) {
        try {
            const basePath = this.getBasePath();
            const fullPath = basePath + partialPath;
            
            console.log('Attempting to load partial from:', fullPath);
            
            const response = await fetch(fullPath);
            if (!response.ok) {
                console.error(`Failed to load partial: ${response.status} - ${fullPath}`);
                // Try fallback path
                const fallbackPath = '../' + partialPath;
                console.log('Trying fallback path:', fallbackPath);
                const fallbackResponse = await fetch(fallbackPath);
                if (!fallbackResponse.ok) {
                    throw new Error(`HTTP error! status: ${fallbackResponse.status} for ${fallbackPath}`);
                }
                var html = await fallbackResponse.text();
            } else {
                var html = await response.text();
            }
            
            console.log('Partial loaded successfully');
            
            // Fix paths based on current location
            html = this.fixPaths(html, basePath);
            
            const targetElement = document.querySelector(targetSelector);
            if (targetElement) {
                targetElement.innerHTML = html;
                console.log('Partial inserted into DOM');
            } else {
                console.error('Target element not found:', targetSelector);
            }
        } catch (error) {
            console.error('Error loading partial:', error);
        }
    }

    static fixPaths(html, basePath) {
        if (basePath === '../') {
            // We're in pages directory - paths in header.html are already correct
            return html;
        } else {
            // We're in root directory - need to adjust paths from header.html
            // Fix navigation links
            html = html.replace(/href="\.\.\/index\.html"/g, 'href="index.html"');
            
            // Fix asset paths (images, css, js)
            html = html.replace(/src="\.\.\/assets\//g, 'src="assets/');
            html = html.replace(/href="\.\.\/assets\//g, 'href="assets/');
            
            // Fix page navigation links - these should point to pages/ directory from root
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

    static async loadHeaderAndFooter() {
        await Promise.all([
            this.loadHeader(),
            this.loadFooter()
        ]);
        
        // Update cart badge after header is loaded
        if (typeof updateCartBadge === 'function') {
            updateCartBadge();
        }
    }
}

// Auto-load header and footer on pages that have the containers
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing partials...');
    
    const header = document.querySelector('header');
    const footer = document.querySelector('footer');
    
    console.log('Header element found:', !!header);
    console.log('Footer element found:', !!footer);
    
    if (header) {
        console.log('Loading header...');
        await PartialsLoader.loadHeader();
        console.log('Header loaded, checking for Header class...');
        
        // Initialize header functionality after loading and add active navigation
        if (window.Header) {
            console.log('Header class found, initializing...');
            const headerInstance = new Header();
            // Ensure DOM is fully ready before setting active navigation
            requestAnimationFrame(() => {
                console.log('Calling setActiveNavigation...');
                headerInstance.setActiveNavigation();
            });
        } else {
            console.log('Header class not found on window object');
        }
    }
    
    if (footer) {
        console.log('Loading footer...');
        await PartialsLoader.loadFooter();
    }
    
    console.log('Partials loading complete');
});