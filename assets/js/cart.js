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
const productDetailsCache = new Map();

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
  if (productId && productDetailsCache.has(productId)) {
    return productDetailsCache.get(productId);
  }

  try {
    console.log('[getProductDetails] Fetching product:', productId, 'API_BASE:', API_BASE);
    const res = await fetch(`${API_BASE}/products/${productId}`);
    if (!res.ok) {
      console.error('[getProductDetails] Failed to fetch product:', res.status);
      return null;
    }
    const data = await res.json();
    const product = data.data || data.product || data;
    if (productId && product) {
      productDetailsCache.set(productId, product);
    }
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

function getItemProductId(item) {
  return item.productId || (item.product && item.product._id) || '';
}

async function resolveProductForItem(item) {
  const productId = getItemProductId(item);

  if (item.product) {
    if (productId) {
      productDetailsCache.set(productId, item.product);
    }
    return item.product;
  }

  if (!productId) {
    return null;
  }

  return getProductDetails(productId);
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
  const resolvedItems = await Promise.all(items.map(async (item) => {
    const product = await resolveProductForItem(item);
    return {
      item,
      product,
      productId: getItemProductId(item)
    };
  }));

  if (items.length === 0) {
    productsSection.innerHTML = '<div class="empty-cart-message"><p>Your cart is empty.</p><p><a href="shop.html">Continue Shopping</a></p></div>';
  } else {
    let productsHTML = '';

    for (const { item, product, productId } of resolvedItems) {
      const productName = product && product.name ? product.name : 'Unknown Product';
      const productPrice = product && product.price ? product.price : 0;
      const imagePath = product ? getImagePath(product) : '';

      productsHTML += `
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
    }

    productsSection.innerHTML = productsHTML;

    // Add event listeners
    productsSection.querySelectorAll('.quantity-btn.decrease').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.getAttribute('data-product-id');
        const quantitySpan = e.target.nextElementSibling;
        const newQuantity = Math.max(1, parseInt(quantitySpan.textContent) - 1);
        window.updateCartQuantity(productId, newQuantity);
      });
    });

    productsSection.querySelectorAll('.quantity-btn.increase').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.getAttribute('data-product-id');
        const quantitySpan = e.target.previousElementSibling;
        const newQuantity = parseInt(quantitySpan.textContent) + 1;
        window.updateCartQuantity(productId, newQuantity);
      });
    });

    productsSection.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = e.target.getAttribute('data-product-id');
        window.removeCartItem(productId);
      });
    });
  }

  // Render order summary from already-resolved products (no extra fetches)
  const itemsBreakdown = document.getElementById('items-breakdown');
  let subtotal = 0;

  if (itemsBreakdown) {
    let breakdownHTML = '';

    for (const { item, product } of resolvedItems) {
      const productName = product && product.name ? product.name : 'Unknown Product';
      const productPrice = product && product.price ? product.price : 0;
      const lineTotal = productPrice * item.quantity;
      subtotal += lineTotal;

      breakdownHTML += `<div class="item-breakdown"><div class="item-row"><span class="item-name">${productName}</span><span>₱${lineTotal.toLocaleString()}.00</span></div><div class="item-row"><span class="item-details">x${item.quantity}</span></div></div>`;
    }

    itemsBreakdown.innerHTML = breakdownHTML;
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

function formatCheckoutAmount(value) {
  return `₱${Number(value || 0).toLocaleString()}.00`;
}

function getCheckoutSuccessModal() {
  let modal = document.getElementById('checkoutSuccessModal');
  if (modal) return modal;

  modal = document.createElement('div');
  modal.id = 'checkoutSuccessModal';
  modal.className = 'checkout-modal-overlay';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div class="checkout-modal-card" role="dialog" aria-modal="true" aria-labelledby="checkoutSuccessTitle">
      <button type="button" class="checkout-modal-close" data-close-checkout-modal aria-label="Close">×</button>
      <div class="checkout-modal-icon">✓</div>
      <h2 id="checkoutSuccessTitle" class="checkout-modal-title">Order Confirmed</h2>
      <p class="checkout-modal-subtitle">Thank you for shopping with WST JCC E-Commerce.</p>

      <div class="checkout-modal-details">
        <div class="checkout-modal-row">
          <span>Order Number</span>
          <strong data-checkout-order-number></strong>
        </div>
        <div class="checkout-modal-row">
          <span>Purchase Date</span>
          <strong data-checkout-purchased-at></strong>
        </div>
        <div class="checkout-modal-row checkout-modal-row-total">
          <span>Total Paid</span>
          <strong data-checkout-total></strong>
        </div>
      </div>

      <p class="checkout-modal-email-status" data-checkout-email-status></p>

      <div class="checkout-modal-actions">
        <button type="button" class="checkout-modal-btn checkout-modal-btn-secondary" data-close-checkout-modal>Stay on Cart</button>
        <a href="shop.html" class="checkout-modal-btn checkout-modal-btn-primary">Continue Shopping</a>
      </div>
    </div>
  `;

  modal.addEventListener('click', (event) => {
    if (event.target === modal || event.target.closest('[data-close-checkout-modal]')) {
      closeCheckoutSuccessModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.classList.contains('is-open')) {
      closeCheckoutSuccessModal();
    }
  });

  document.body.appendChild(modal);
  return modal;
}

function closeCheckoutSuccessModal() {
  const modal = document.getElementById('checkoutSuccessModal');
  if (!modal) return;
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.classList.remove('checkout-modal-open');
}

function openCheckoutSuccessModal(checkoutData) {
  const modal = getCheckoutSuccessModal();
  const orderNumber = checkoutData.orderNumber || 'N/A';
  const total = formatCheckoutAmount(checkoutData.total);
  const purchasedAt = checkoutData.purchasedAt
    ? new Date(checkoutData.purchasedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : 'N/A';

  const orderEl = modal.querySelector('[data-checkout-order-number]');
  const purchasedEl = modal.querySelector('[data-checkout-purchased-at]');
  const totalEl = modal.querySelector('[data-checkout-total]');
  const emailStatusEl = modal.querySelector('[data-checkout-email-status]');

  if (orderEl) orderEl.textContent = orderNumber;
  if (purchasedEl) purchasedEl.textContent = purchasedAt;
  if (totalEl) totalEl.textContent = total;

  if (emailStatusEl) {
    if (checkoutData.receiptEmailSent) {
      emailStatusEl.textContent = 'A receipt has been sent to your email.';
      emailStatusEl.classList.remove('is-warning');
      emailStatusEl.classList.add('is-success');
    } else {
      emailStatusEl.textContent = 'Order placed successfully. Receipt email could not be sent right now.';
      emailStatusEl.classList.remove('is-success');
      emailStatusEl.classList.add('is-warning');
    }
  }

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.classList.add('checkout-modal-open');
}

window.processPurchase = async function() {
  if (!isUserLoggedIn()) {
    alert('Please sign in to complete checkout and receive your receipt by email.');
    window.location.href = window.location.pathname.includes('/pages/') ? 'login.html?redirect=cart.html' : 'pages/login.html?redirect=pages/cart.html';
    return;
  }

  const buyButton = document.querySelector('.buy-button');
  const originalLabel = buyButton ? buyButton.textContent : 'Buy Now';

  if (buyButton) {
    buyButton.disabled = true;
    buyButton.textContent = 'Processing...';
  }

  try {
    const response = await fetch(`${API_BASE}/cart/checkout`, {
      method: 'POST',
      headers: buildAuthHeaders({ 'Content-Type': 'application/json' }),
      credentials: 'include'
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || 'Checkout failed. Please try again.');
    }

    await renderCartPage();

    const checkoutData = result.data || {};
    openCheckoutSuccessModal(checkoutData);
  } catch (error) {
    console.error('[processPurchase] Error:', error);
    alert(error.message || 'Checkout failed. Please try again.');
  } finally {
    if (buyButton) {
      buyButton.disabled = false;
      buyButton.textContent = originalLabel;
    }
  }
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
