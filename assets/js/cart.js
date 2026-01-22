// Load and display cart items from localStorage
function loadCartItems() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  const productsSection = document.getElementById('productsSection');

  if (cart.length === 0) {
    productsSection.innerHTML = '<p class="empty-cart-message">Your cart is empty. <a href="shop.html">Continue shopping</a></p>';
    updateBilling();
    return;
  }

  productsSection.innerHTML = '';

  cart.forEach((item, index) => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.dataset.cartIndex = index;

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
          <button class="quantity-btn" onclick="updateQuantityInCart(1, ${index})">+</button>
          <span class="quantity">${item.quantity}</span>
          <button class="quantity-btn" onclick="updateQuantityInCart(-1, ${index})">-</button>
        </div>
        <button class="delete-btn" onclick="deleteFromCart(${index})">
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
}

// Update quantity of item in cart
function updateQuantityInCart(change, index) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (index >= 0 && index < cart.length) {
    cart[index].quantity = Math.max(1, cart[index].quantity + change);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    loadCartItems();
  }
}

// Delete item from cart
function deleteFromCart(index) {
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (index >= 0 && index < cart.length) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    loadCartItems();
  }
}

// Update billing information
function updateBilling() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];
  let subtotal = 0;

  // Clear and rebuild items breakdown
  const itemsBreakdown = document.getElementById('items-breakdown');
  itemsBreakdown.innerHTML = '';

  cart.forEach((item) => {
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    // Create item breakdown element
    const itemDiv = document.createElement('div');
    itemDiv.className = 'item-breakdown';
    itemDiv.innerHTML = `
      <div class="item-row">
        <span class="item-name">${item.name}</span>
        <span>₱${itemTotal.toLocaleString('en-PH', {minimumFractionDigits: 2})}</span>
      </div>
      <div class="item-row">
        <span class="item-details">Quantity: ${item.quantity}</span>
        <span class="item-details">₱${item.price.toLocaleString('en-PH', {minimumFractionDigits: 2})} each</span>
      </div>
    `;
    itemsBreakdown.appendChild(itemDiv);
  });

  const shipping = subtotal > 0 ? 150 : 0;
  const total = subtotal + shipping;

  document.getElementById('subtotal').textContent = `₱${subtotal.toLocaleString('en-PH', {minimumFractionDigits: 2})}`;
  document.getElementById('shipping').textContent = `₱${shipping.toLocaleString('en-PH', {minimumFractionDigits: 2})}`;
  document.getElementById('total').textContent = `₱${total.toLocaleString('en-PH', {minimumFractionDigits: 2})}`;
}

// Process purchase
function processPurchase() {
  const cart = JSON.parse(localStorage.getItem('cart')) || [];

  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  const total = document.getElementById('total').textContent;
  alert(`Thank you for your purchase! Your order total is ${total}. Redirecting to payment...`);
  
  // Clear cart after purchase
  localStorage.removeItem('cart');
  updateCartBadge();
  window.location.href = 'shop.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  loadCartItems();
});
