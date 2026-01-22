// Utility functions for the WST JCC E-Commerce application

// DOM utility functions
const DOM = {
    // Get element by ID
    getElementById: (id) => document.getElementById(id),
    
    // Get elements by class name
    getElementsByClass: (className) => document.getElementsByClassName(className),
    
    // Query selector
    querySelector: (selector) => document.querySelector(selector),
    
    // Query selector all
    querySelectorAll: (selector) => document.querySelectorAll(selector),
    
    // Create element
    createElement: (tag, className = '', textContent = '') => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (textContent) element.textContent = textContent;
        return element;
    }
};

// Update cart badge counter
function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Use a small delay to ensure badges exist in DOM
    setTimeout(() => {
        const badgeMobile = document.getElementById('cartCountBadgeMobile');
        const badgeDesktop = document.getElementById('cartCountBadgeDesktop');
        
        if (badgeMobile) badgeMobile.textContent = totalItems;
        if (badgeDesktop) badgeDesktop.textContent = totalItems;
    }, 100);
}

// Listen for storage changes (updates from other tabs/windows)
window.addEventListener('storage', updateCartBadge);

// Update badge on page load - with delay to ensure DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(updateCartBadge, 500);
});

// Format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
};

// Format date
const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(new Date(date));
};

// Validate email
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Generate unique ID
const generateId = () => {
    return '_' + Math.random().toString(36).substr(2, 9);
};

// Export utilities (if using modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        DOM,
        formatCurrency,
        formatDate,
        validateEmail,
        generateId
    };
}