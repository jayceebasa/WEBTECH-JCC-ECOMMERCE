// Helper to check if user is logged in (simple check for token/cookie)

async function fetchProductDetails(productId) {
  try {
    const res = await fetch(`${API_BASE}/products/${productId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || data.product || null;
  } catch {
    return null;
  }
}

const CartModule = {
  async getCart() {
    if (isUserLoggedIn()) {
      try {
        const res = await fetch(`${API_BASE}/cart`, { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to get cart');
        const data = await res.json();
        return data.data || { items: [] };
      } catch (err) {
        console.error('Get cart error:', err);
        return { items: [] };
      }
    } else {
      // Guest: use localStorage
      let cart = JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || '[]');
      return { items: cart };
    }
  },

  async updateQuantity(productId, quantity) {
    if (isUserLoggedIn()) {
      try {
        const res = await fetch(`${API_BASE}/cart/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productId, quantity })
        });
        if (!res.ok) throw new Error('Failed to update quantity');
        return await res.json();
      } catch (err) {
        console.error('Update quantity error:', err);
        throw err;
      }
    } else {
      // Guest: use localStorage
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
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productId })
        });
        if (!res.ok) throw new Error('Failed to remove item');
        return await res.json();
      } catch (err) {
        console.error('Remove item error:', err);
        throw err;
      }
    } else {
      // Guest: use localStorage
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

window.CartModule = CartModule;

// Quantity and remove handlers for cart page
window.updateCartQuantity = async function(productId, newQuantity) {
  if (newQuantity < 1) return;
  await CartModule.updateQuantity(productId, newQuantity);
  renderCartPage();
};

window.removeCartItem = async function(productId) {
  await CartModule.removeItem(productId);
  renderCartPage();
};
      } catch (err) {
        console.error('Get cart error:', err);
        return { items: [] };
      }
    } else {
      // Guest: use localStorage
      let cart = JSON.parse(localStorage.getItem(LOCAL_CART_KEY) || '[]');
      return { items: cart };
    }
  },

  async updateQuantity(productId, quantity) {
    if (isUserLoggedIn()) {
      try {
        const res = await fetch(`${API_BASE}/cart/update`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productId, quantity })
        });
        if (!res.ok) throw new Error('Failed to update quantity');
        return await res.json();
      } catch (err) {
        console.error('Update quantity error:', err);
        throw err;
      }
    } else {
      // Guest: use localStorage
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
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ productId })
        });
        if (!res.ok) throw new Error('Failed to remove item');
        return await res.json();
      } catch (err) {
        console.error('Remove item error:', err);
        throw err;
      }
    } else {
      // Guest: use localStorage
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

// Render cart items and update cart counter
async function renderCartPage() {
  const cartData = await CartModule.getCart();
  const items = cartData.items || [];

  // Render products section
  const productsSection = document.getElementById('productsSection');
  if (productsSection) {
    productsSection.innerHTML = '';
    if (items.length === 0) {
      productsSection.innerHTML = '<p>Your cart is empty.</p>';
    } else {
      for (const item of items) {
        // For guests, item only has productId and quantity; for logged-in, may have product details
        let product = item.product || null;
        if (!product) {
          // Try to get product details from localStorage cache or fetch (optional improvement)
          // For now, just show productId and quantity
          productsSection.innerHTML += `<div class="cart-item">Product ID: ${item.productId} | Quantity: ${item.quantity}</div>`;
        } else {
          // Show product details (name, price, etc.)
          productsSection.innerHTML += `<div class="cart-item">${product.name} | ₱${product.price} x ${item.quantity}</div>`;
        }
      }
    }
  }

  // Render order summary
  const itemsBreakdown = document.getElementById('items-breakdown');
  let subtotal = 0;
  if (itemsBreakdown) {
    itemsBreakdown.innerHTML = '';
    for (const item of items) {
      let price = 0;
      let label = '';
      if (item.product && item.product.price) {
        price = item.product.price;
        label = item.product.name;
      } else {
        // For guests, no product details
        label = `Product ID: ${item.productId}`;
      }
      const lineTotal = price * item.quantity;
      subtotal += lineTotal;
      itemsBreakdown.innerHTML += `<div>${label} x ${item.quantity} = ₱${lineTotal.toLocaleString()}</div>`;
    }
  }
  // Update subtotal and total
  const subtotalElem = document.getElementById('subtotal');
  const totalElem = document.getElementById('total');
  if (subtotalElem) subtotalElem.textContent = `₱${subtotal.toLocaleString()}`;
  if (totalElem) totalElem.textContent = `₱${subtotal.toLocaleString()}`;

  // Update cart badge counter
  updateCartBadge(items.reduce((sum, item) => sum + item.quantity, 0));
}

// Update cart badge counter (for both mobile and desktop)
function updateCartBadge(count) {
  const badgeMobile = document.getElementById('cartCountBadgeMobile');
  const badgeDesktop = document.getElementById('cartCountBadgeDesktop');
  if (badgeMobile) badgeMobile.textContent = count;
  if (badgeDesktop) badgeDesktop.textContent = count;
}

// Only run on cart.html
if (window.location.pathname.endsWith('cart.html')) {
  document.addEventListener('DOMContentLoaded', renderCartPage);
}
