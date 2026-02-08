// Utility functions for the WST JCC E-Commerce application

// Get image path with fallback handling
function getImagePath(product) {
  if (!product || !product.image) {
    return '../assets/images/placeholder.png';
  }
  
  // Use as-is if it's a URL or base64
  if (product.image.startsWith('http') || product.image.startsWith('data:')) {
    return product.image;
  }
  
  // Prepend ../ for local paths
  return `../${product.image}`;
}

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

// Update cart badge counter from backend
// NOTE: Cart API endpoint (/api/cart/count) not yet implemented
// This function is disabled until backend cart endpoints are ready
async function updateCartBadge() {
    // TODO: Re-enable when backend cart endpoints are implemented
    // try {
    //     const response = await fetch('/api/cart/count');
    //     if (!response.ok) {
    //         throw new Error('Failed to fetch cart count');
    //     }
    //     const data = await response.json();
    //     const totalItems = data.count || 0;
    //     
    //     setTimeout(() => {
    //         const badgeMobile = document.getElementById('cartCountBadgeMobile');
    //         const badgeDesktop = document.getElementById('cartCountBadgeDesktop');
    //         if (badgeMobile) badgeMobile.textContent = totalItems;
    //         if (badgeDesktop) badgeDesktop.textContent = totalItems;
    //     }, 100);
    // } catch (error) {
    //     console.error('Error updating cart badge:', error);
    // }
}

// Poll for cart updates - DISABLED until cart API is ready
// setInterval(updateCartBadge, 30000);

// Update badge on page load - DISABLED
// document.addEventListener('DOMContentLoaded', () => {
//     setTimeout(updateCartBadge, 500);
// });

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