// Cart Management System
if (typeof console !== 'undefined') {
  console.log('[cart.js] Script tag executing at', new Date().toISOString());
}

try {
  if (typeof console !== 'undefined') {
    console.log('[cart.js] Loading...');
  }

const LOCAL_CART_KEY = 'guestCart';
const TOKEN_KEY = 'userToken';

function buildAuthHeaders(extraHeaders = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  return token
    ? { ...extraHeaders, Authorization: `Bearer ${token}` }
    : extraHeaders;
}

// Helper to check if user is logged in
function isUserLoggedIn() {
  return !!localStorage.getItem(TOKEN_KEY);
}

// Fetch single product details
async function getProductDetails(productId) {
  try {
    console.log('[getProductDetails] Fetching product:', productId, 'API_BASE:', API_BASE);
    const res = await fetch(`${API_BASE}/products/${productId}`);
    if (!res.ok) {
      console.error('[getProductDetails] Failed to fetch product:', res.status);
      return null;
    }
    const data = await res.json();
    const product = data.data || data.product || data;
    console.log('[getProductDetails] Got product data:', { 
      name: product.name, 
      price: product.price, 
      image: product.image,
      fullObject: product
    });
    return product;
  } catch (err) {
    console.error('[getProductDetails] Error fetching product:', err);
    return null;
  }
}

// CartModule - main cart operations
const CartModule = {
  async addItem(productId, quantity = 1) {
    console.log('[CartModule.addItem] Adding:', { productId, quantity, isLoggedIn: isUserLoggedIn() });
    
    if (isUserLoggedIn()) {
      // Logged in user - use API
      try {
        const res = await fetch(`${API_BASE}/cart/add`, {
          method: 'POST',
          headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
          credentials: 'include',
          body: JSON.stringify({ productId, quantity })
        });
        if (!res.ok) throw new Error('Failed to add to cart: ' + res.status);
        return await res.json();
      } catch (err) {
        console.error('[CartModule.addItem] Error:', err);
        throw err;
      }
    } else {
      // Guest user - use localStorage
      let cart = JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || '[]');
      const idx = cart.findIndex(item => item.productId === productId);
      if (idx > -1) {
        cart[idx].quantity += quantity;
      } else {
        cart.push({ productId, quantity });
      }
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
      console.log('[CartModule.addItem] Saved to localStorage:', cart);
      return { items: cart };
    }
  },

  async getCart() {
    if (isUserLoggedIn()) {
      try {
        const res = await fetch(`${API_BASE}/cart`, {
          headers: buildAuthHeaders(),
          credentials: 'include'
        });
        if (!res.ok) throw new Error('Failed to get cart');
        const data = await res.json();
        return data.data || { items: [] };
      } catch (err) {
        console.error('[CartModule.getCart] Error:', err);
        return { items: [] };
      }
    } else {
      let cart = JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || '[]');
      return { items: cart };
    }
  },

  async updateQuantity(productId, quantity) {
    if (quantity < 1) return;
    
    if (isUserLoggedIn()) {
      try {
        const res = await fetch(`${API_BASE}/cart/update`, {
          method: 'POST',
          headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
          credentials: 'include',
          body: JSON.stringify({ productId, quantity })
        });
        if (!res.ok) throw new Error('Failed to update quantity');
        return await res.json();
      } catch (err) {
        console.error('[CartModule.updateQuantity] Error:', err);
        throw err;
      }
    } else {
      let cart = JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || '[]');
      const idx = cart.findIndex(item => item.productId === productId);
      if (idx > -1) {
        cart[idx].quantity = quantity;
        localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
      }
      return { items: cart };
    }
  },

  async removeItem(productId) {
    if (isUserLoggedIn()) {
      try {
        const res = await fetch(`${API_BASE}/cart/remove`, {
          method: 'POST',
          headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
          credentials: 'include',
          body: JSON.stringify({ productId })
        });
        if (!res.ok) throw new Error('Failed to remove item');
        return await res.json();
      } catch (err) {
        console.error('[CartModule.removeItem] Error:', err);
        throw err;
      }
    } else {
      let cart = JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || '[]');
      cart = cart.filter(item => item.productId !== productId);
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(cart));
      return { items: cart };
    }
  },

  clearLocalCart() {
    localStorage.removeItem(LOCAL_CART_KEY);
  },

  getLocalCart() {
    return JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || '[]');
  }
};

// Export to window
window.CartModule = CartModule;
console.log('[cart.js] CartModule exported to window');

// Fallback - ensure window.CartModule always exists
if (!window.CartModule) {
  console.error('[cart.js] CRITICAL: CartModule not set!');
  window.CartModule = { addItem: async () => { throw new Error('CartModule not loaded'); } };
}

// Update cart badge counter (for both mobile and desktop)
// Call this after any cart operation to keep badge in sync
async function updateCartBadge() {
  try {
    const cartData = await CartModule.getCart();
    const items = cartData.items || [];
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    
    const badgeMobile = document.getElementById('cartCountBadgeMobile');
    const badgeDesktop = document.getElementById('cartCountBadgeDesktop');
    
    if (badgeMobile) badgeMobile.textContent = totalCount;
    if (badgeDesktop) badgeDesktop.textContent = totalCount;
    
    console.log('[updateCartBadge] Updated count to:', totalCount);
  } catch (err) {
    console.error('[updateCartBadge] Error:', err);
  }
}

// Export to window for use in other scripts
window.updateCartBadge = updateCartBadge;

// Render cart page
async function renderCartPage() {
  console.log('[renderCartPage] Starting...');
  const cartData = await CartModule.getCart();
  const items = cartData.items || [];
  console.log('[renderCartPage] Items in cart:', items);

  const productsSection = document.getElementById('productsSection');
  if (!productsSection) {
    console.log('[renderCartPage] No productsSection element found');
    return;
  }

  productsSection.innerHTML = '';

  if (items.length === 0) {
    productsSection.innerHTML = '<div class="empty-cart-message"><p>Your cart is empty.</p><p><a href="shop.html">Continue Shopping</a></p></div>';
  } else {
    // Fetch product details for all items
    for (const item of items) {
      console.log('[renderCartPage] Processing item:', item);
      
      let product = item.product || null;
      
      // For guest users, item only has productId, need to fetch details
      if (!product && item.productId) {
        console.log('[renderCartPage] Item is guest format, fetching details...');
        product = await getProductDetails(item.productId);
        console.log('[renderCartPage] Fetched product:', product);
      }

      const productName = product && product.name ? product.name : 'Unknown Product';
      const productPrice = product && product.price ? product.price : 0;
      const productId = item.productId || (item.product && item.product._id) || '';
      const imagePath = product ? getImagePath(product) : '';

      console.log('[renderCartPage] Rendering:', { 
        productName, 
        productPrice, 
        productId, 
        productImage: product ? product.image : 'no product',
        imagePath 
      });

      const cartItemHTML = `
        <div class="product-card">
          <div class="product-image">
            <img src="${imagePath}" alt="${productName}">
          </div>
          <div class="product-details">
            <h3 class="product-title">${productName}</h3>
            <p class="product-price">₱${productPrice.toLocaleString()}.00</p>
          </div>
          <div class="controls-wrapper">
            <div class="quantity-section">
              <button class="quantity-btn decrease" data-product-id="${productId}">−</button>
              <span class="quantity">${item.quantity}</span>
              <button class="quantity-btn increase" data-product-id="${productId}">+</button>
            </div>
            <button class="delete-btn" data-product-id="${productId}">✕</button>
          </div>
        </div>
      `;
      productsSection.innerHTML += cartItemHTML;
    }

    // Add event listeners
    document.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.getAttribute('data-product-id');
        const quantitySpan = e.target.nextElementSibling;
        const newQuantity = Math.max(1, parseInt(quantitySpan.textContent) - 1);
        window.updateCartQuantity(productId, newQuantity);
      });
    });

    document.querySelectorAll('.quantity-btn.increase').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.getAttribute('data-product-id');
        const quantitySpan = e.target.previousElementSibling;
        const newQuantity = parseInt(quantitySpan.textContent) + 1;
        window.updateCartQuantity(productId, newQuantity);
      });
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.getAttribute('data-product-id');
        window.removeCartItem(productId);
      });
    });
  }

  // Render order summary
  const itemsBreakdown = document.getElementById('items-breakdown');
  let subtotal = 0;
  
  if (itemsBreakdown) {
    itemsBreakdown.innerHTML = '';
    for (const item of items) {
      let product = item.product || null;

      if (!product && item.productId) {
        product = await getProductDetails(item.productId);
      }

      const productName = product && product.name ? product.name : 'Unknown Product';
      const productPrice = product && product.price ? product.price : 0;
      const lineTotal = productPrice * item.quantity;
      subtotal += lineTotal;

      itemsBreakdown.innerHTML += `<div class="item-breakdown"><div class="item-row"><span class="item-name">${productName}</span><span>₱${lineTotal.toLocaleString()}.00</span></div><div class="item-row"><span class="item-details">x${item.quantity}</span></div></div>`;
    }
  }

  // Update totals
  const subtotalElem = document.getElementById('subtotal');
  const totalElem = document.getElementById('total');
  if (subtotalElem) subtotalElem.textContent = `₱${subtotal.toLocaleString()}.00`;
  if (totalElem) totalElem.textContent = `₱${subtotal.toLocaleString()}.00`;

  updateCartBadge();
  console.log('[renderCartPage] Completed');
}

// Global cart handlers
window.updateCartQuantity = async function(productId, newQuantity) {
  await CartModule.updateQuantity(productId, newQuantity);
  renderCartPage();
};

window.removeCartItem = async function(productId) {
  await CartModule.removeItem(productId);
  renderCartPage();
};

// Only run on cart.html
if (window.location.pathname.endsWith('cart.html')) {
  document.addEventListener('DOMContentLoaded', renderCartPage);
}

// Initialize cart badge on all pages when cart.js loads
updateCartBadge();

console.log('[cart.js] Loaded successfully');

} catch (error) {
  console.error('[cart.js] Fatal error during initialization:', error);
  // Define empty CartModule as fallback
  window.CartModule = {
    addItem: () => alert('Error: Cart system failed to initialize'),
    removeItem: () => alert('Error: Cart system failed to initialize'),
    getCart: () => ({items: []}),
    updateQuantity: () => alert('Error: Cart system failed to initialize'),
    clearCart: () => alert('Error: Cart system failed to initialize')
  };
}
