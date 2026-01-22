// Cart functionality - handled by Node.js backend
// All cart operations now use backend API endpoints

// Load and display cart items from backend
async function loadCartItems() {
  const productsSection = document.getElementById('productsSection');

  try {
    const response = await fetch('/api/cart');
    if (!response.ok) {
      throw new Error('Failed to load cart');
    }

    const data = await response.json();
    const cart = data.items || [];

    if (cart.length === 0) {
      productsSection.innerHTML = '<p class="empty-cart-message">Your cart is empty. <a href="shop.html">Continue shopping</a></p>';
      updateBilling();
      return;
    }

    productsSection.innerHTML = '';

    cart.forEach((item) => {
      const productCard = document.createElement('div');
      productCard.className = 'product-card';
      productCard.dataset.cartItemId = item.id;

      const productHTML = `
        <img
          class="product-image"
          src="../${item.image}"
          alt="${item.name}" />
        <div class="product-details">
          <h1 class="product-title">${item.name}</h1>
          <p class="product-price">Price: ₱${item.price.toLocaleString()}.00</p>
        </div>
        <div class="controls-wrapper">
          <div class="quantity-section">
            <button class="quantity-btn" onclick="updateQuantityInCart(1, '${item.id}')">+</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-btn" onclick="updateQuantityInCart(-1, '${item.id}')">-</button>
          </div>
          <button class="delete-btn" onclick="deleteFromCart('${item.id}')">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round">
              <path d="M3 6h18"></path>
              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      `;

      productCard.innerHTML = productHTML;
      productsSection.appendChild(productCard);
    });

    updateBilling();
  } catch (error) {
    console.error('Error loading cart:', error);
    productsSection.innerHTML = '<p class="error-message">Error loading cart. Please try again later.</p>';
  }
}

// Update quantity of item in cart via backend
async function updateQuantityInCart(change, productId) {
  try {
    const response = await fetch(`/api/cart/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        productId: productId,
        change: change
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update quantity');
    }

    loadCartItems();
  } catch (error) {
    console.error('Error updating quantity:', error);
    alert('Failed to update quantity. Please try again.');
  }
}

// Delete item from cart via backend
async function deleteFromCart(productId) {
  try {
    const response = await fetch(`/api/cart/remove/${productId}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Failed to delete from cart');
    }

    loadCartItems();
  } catch (error) {
    console.error('Error deleting from cart:', error);
    alert('Failed to remove item. Please try again.');
  }
}

// Update billing information
async function updateBilling() {
  try {
    const response = await fetch('/api/cart/summary');
    if (!response.ok) {
      throw new Error('Failed to load billing summary');
    }

    const data = await response.json();
    const itemsBreakdown = document.getElementById('items-breakdown');
    itemsBreakdown.innerHTML = '';

    data.items.forEach((item) => {
      const itemDiv = document.createElement('div');
      itemDiv.className = 'item-breakdown';
      itemDiv.innerHTML = `
        <div class="item-row">
          <span class="item-name">${item.name}</span>
          <span>₱${item.total.toLocaleString('en-PH', {minimumFractionDigits: 2})}</span>
        </div>
        <div class="item-row">
          <span class="item-details">Quantity: ${item.quantity}</span>
          <span class="item-details">₱${item.price.toLocaleString('en-PH', {minimumFractionDigits: 2})} each</span>
        </div>
      `;
      itemsBreakdown.appendChild(itemDiv);
    });

    document.getElementById('subtotal').textContent = `₱${data.subtotal.toLocaleString('en-PH', {minimumFractionDigits: 2})}`;
    document.getElementById('shipping').textContent = `₱${data.shipping.toLocaleString('en-PH', {minimumFractionDigits: 2})}`;
    document.getElementById('total').textContent = `₱${data.total.toLocaleString('en-PH', {minimumFractionDigits: 2})}`;
  } catch (error) {
    console.error('Error updating billing:', error);
  }
}

// Process purchase via backend
async function processPurchase() {
  try {
    const response = await fetch('/api/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to process purchase');
    }

    const result = await response.json();
    alert(`Thank you for your purchase! Your order ID is ${result.orderId}. Redirecting to payment...`);
    window.location.href = 'shop.html';
  } catch (error) {
    console.error('Error processing purchase:', error);
    alert('Failed to process purchase. Please try again.');
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  loadCartItems();
});
