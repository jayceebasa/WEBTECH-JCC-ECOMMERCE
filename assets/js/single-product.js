// Store current product
let currentProduct = null;

// Get product ID from URL parameters
function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Load product details
async function loadProductDetails() {
  try {
    const productId = getProductIdFromUrl();
    
    if (!productId) {
      // If no product ID, redirect to shop
      window.location.href = 'shop.html';
      return;
    }

    const response = await fetch('../data/products.json');
    if (!response.ok) {
      throw new Error(`Failed to load products: ${response.status}`);
    }

    const data = await response.json();
    const product = data.products.find(p => p.id === parseInt(productId));

    if (!product) {
      // Product not found, redirect to shop
      window.location.href = 'shop.html';
      return;
    }

    currentProduct = product;
    displayProductDetails(product);
  } catch (error) {
    console.error('Error loading product details:', error);
    showError('Error loading product. Please try again.');
  }
}

// Display product details on the page
function displayProductDetails(product) {
  // Update image
  const productImage = document.getElementById('productImage');
  productImage.src = `../${product.image}`;
  productImage.alt = product.name;

  // Update title
  document.getElementById('productName').textContent = product.name;

  // Update price
  document.getElementById('productPrice').textContent = `₱${product.price.toLocaleString()}.00`;

  // Update description
  document.getElementById('productDescription').textContent = product.fullDescription;

  // Update specifications
  document.getElementById('specMaterial').textContent = product.material || '-';
  document.getElementById('specColor').textContent = product.color || '-';
  document.getElementById('specSizes').textContent = product.sizes.join(', ') || '-';
  document.getElementById('specFit').textContent = product.fit || 'Regular';
  document.getElementById('specCare').textContent = product.care || '-';

  // Update page title
  document.title = `${product.name} - WST JCC E-Commerce`;
}

// Add to cart function
function addToCart() {
  if (!currentProduct) return;

  // Get cart from localStorage
  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  // Check if product already in cart
  const existingItem = cart.find(item => item.id === currentProduct.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: currentProduct.id,
      name: currentProduct.name,
      price: currentProduct.price,
      image: currentProduct.image,
      quantity: 1,
      material: currentProduct.material,
      color: currentProduct.color,
      fit: currentProduct.fit,
      sizes: currentProduct.sizes,
      care: currentProduct.care
    });
  }

  // Save cart to localStorage
  localStorage.setItem('cart', JSON.stringify(cart));

  // Update cart badge
  updateCartBadge();

  // Show feedback
  showAddToCartFeedback();
}

// Show feedback after adding to cart
function showAddToCartFeedback() {
  const button = document.querySelector('.add-to-cart-btn');
  const originalText = button.innerHTML;
  
  button.textContent = 'Added to Cart!';
  button.style.backgroundColor = '#2e2545';
  button.style.color = '#ffffff';
  button.disabled = true;

  setTimeout(() => {
    button.innerHTML = originalText;
    button.style.backgroundColor = '';
    button.style.color = '';
    button.disabled = false;
  }, 2000);
}

// Go back function
function goBack() {
  window.history.back();
}

// Show error message
function showError(message) {
  const container = document.querySelector('.product-container');
  container.innerHTML = `
    <div class="error-message">
      <p>${message}</p>
      <a href="shop.html" class="btn btn-primary">Back to Shop</a>
    </div>
  `;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadProductDetails();

  // Add event listener to Add to Cart button
  const addToCartBtn = document.querySelector('.add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', addToCart);
  }
});
