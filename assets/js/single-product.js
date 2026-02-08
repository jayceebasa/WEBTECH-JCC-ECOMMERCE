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

    const response = await fetch(`http://localhost:5000/api/products/${productId}`);
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  loadProductDetails();
});
