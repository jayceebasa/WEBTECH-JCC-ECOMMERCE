// Global variable to store all products
let allProducts = [];

// Load products from backend database
async function loadProducts() {
  try {
    const response = await fetch('http://localhost:5000/api/products');
    if (!response.ok) {
      throw new Error(`Failed to load products: ${response.status}`);
    }
    const data = await response.json();
    allProducts = data.products;
    displayProducts(allProducts);
  } catch (error) {
    console.error('Error loading products:', error);
    // Show error message on page
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
      productsGrid.innerHTML = '<div class="col-12"><p>Error loading products. Please refresh the page.</p></div>';
    }
  }
}

function displayProducts(products) {
  const productsGrid = document.getElementById('productsGrid');
  productsGrid.innerHTML = '';

  if (products.length === 0) {
    productsGrid.innerHTML = '<div class="col-12"><p>No products found.</p></div>';
    return;
  }

  products.forEach(product => {
    const categoryId = typeof product.category === 'object' ? product.category._id : product.category;
    const productHTML = `
      <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
        <div class="product-card" data-product-id="${product._id || product.id}" data-category="${categoryId}">
          <div class="product-image">
            <img src="../${product.image}" alt="${product.name}" class="img-fluid">
          </div>
          <div class="product-info">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">₱${product.price.toLocaleString()}.00</p>
          </div>
        </div>
      </div>
    `;
    productsGrid.innerHTML += productHTML;
  });

  // Add click event listeners to product cards
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', function() {
      const productId = this.getAttribute('data-product-id');
      window.location.href = `singleProduct.html?id=${productId}`;
    });
  });
}

// Filter products by category
function filterByCategory(category) {
  if (category === '' || category === 'all') {
    // Show all products
    displayProducts(allProducts);
  } else {
    // Filter products by selected category
    // Handle category as either object (populated) or string (old format)
    const filteredProducts = allProducts.filter(product => {
      const productCategoryName = typeof product.category === 'object' 
        ? product.category.name.toLowerCase() 
        : product.category.toLowerCase();
      return productCategoryName === category.toLowerCase();
    });
    displayProducts(filteredProducts);
  }
}

// Initialize products on page load
document.addEventListener('DOMContentLoaded', () => {
  loadProducts();
  
  // Add filter functionality
  const filterSelect = document.getElementById('categoryFilter');
  if (filterSelect) {
    filterSelect.addEventListener('change', (e) => {
      filterByCategory(e.target.value);
    });
  }
});
