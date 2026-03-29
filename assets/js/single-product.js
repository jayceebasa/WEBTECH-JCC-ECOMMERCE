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

    const response = await fetch(`${API_BASE}/products/${productId}`);
    if (!response.ok) {
      throw new Error(`Failed to load product: ${response.status}`);
    }

    const data = await response.json();
    // API returns product in data.data
    const product = data.data || data.product || data;

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
  const imagePath = getImagePath(product);
  productImage.src = imagePath;
  productImage.alt = product.name;
  productImage.onerror = () => { productImage.src = '../assets/images/placeholder.png'; };

  // Update title
  document.getElementById('productName').textContent = product.name;

  // Update price
  document.getElementById('productPrice').textContent = `₱${product.price.toLocaleString()}.00`;

  // Update description
  document.getElementById('productDescription').textContent = product.fullDescription || product.description;

  // Update specifications - handle both old and new schema formats
  const details = product.details || product;
  document.getElementById('specMaterial').textContent = details.material || '-';
  document.getElementById('specColor').textContent = details.color || '-';
  document.getElementById('specSizes').textContent = (product.sizes && product.sizes.length) ? product.sizes.join(', ') : '-';
  document.getElementById('specFit').textContent = details.fit || 'Regular';
  document.getElementById('specCare').textContent = details.care || '-';

  // Update page title
  document.title = `${product.name} - WST JCC E-Commerce`;
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

// Setup Add to Cart button
function setupAddToCartButton() {
  const addToCartBtn = document.querySelector('.add-to-cart-btn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', async () => {
      if (!currentProduct || !currentProduct._id) {
        alert('Product not loaded.');
        return;
      }
      
      // Check if CartModule is available
      if (typeof window.CartModule === 'undefined' || typeof window.CartModule.addItem !== 'function') {
        console.error('CartModule not loaded properly');
        alert('Cart system is not loaded. Please refresh the page.');
        return;
      }
      
      addToCartBtn.disabled = true;
      addToCartBtn.textContent = 'Adding...';
      try {
        await window.CartModule.addItem(currentProduct._id, 1);
        addToCartBtn.textContent = 'Added!';
        setTimeout(() => {
          addToCartBtn.textContent = 'Add to Cart';
          addToCartBtn.disabled = false;
        }, 1200);
        if (typeof updateCartBadge === 'function') updateCartBadge();
      } catch (err) {
        alert(err.message || 'Failed to add to cart.');
        addToCartBtn.textContent = 'Add to Cart';
        addToCartBtn.disabled = false;
      }
    });
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('[single-product.js] DOMContentLoaded event fired');
  
  // Wait for CartModule to be available
  let attempts = 0;
  const waitForCart = setInterval(() => {
    attempts++;
    console.log('[single-product.js] Waiting for CartModule... attempt', attempts);
    if (typeof window.CartModule !== 'undefined' && window.CartModule.addItem) {
      clearInterval(waitForCart);
      console.log('[single-product.js] ✓ CartModule is available');
      loadProductDetails();
      setupAddToCartButton();
    } else if (attempts > 10) {
      clearInterval(waitForCart);
      console.error('[single-product.js] ✗ CartModule failed to load after 10 attempts');
      loadProductDetails();
      setupAddToCartButton(); // Still setup button but it may fail
    }
  }, 100);
  
  // Fallback: start loading immediately
  loadProductDetails();
});
