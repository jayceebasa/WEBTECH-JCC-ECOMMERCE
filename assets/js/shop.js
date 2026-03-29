// Global variable to store all products
let allProducts = [];
let activeCategory = '';
let activeSearchTerm = '';

function showProductsLoading(count = 6) {
  const productsGrid = document.getElementById('productsGrid');
  if (!productsGrid) return;

  let skeletonHTML = '';
  for (let i = 0; i < count; i += 1) {
    skeletonHTML += `
      <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
        <div class="product-card skeleton-card" aria-hidden="true">
          <div class="product-image skeleton-image"></div>
          <div class="product-info">
            <div class="skeleton-line skeleton-title"></div>
            <div class="skeleton-line skeleton-price"></div>
          </div>
        </div>
      </div>
    `;
  }

  skeletonHTML += `
    <div class="col-12 shop-loading-note-wrap">
      <p class="shop-loading-note">Loading products...</p>
    </div>
  `;

  productsGrid.innerHTML = skeletonHTML;
}

// Load products from backend database
async function loadProducts() {
  showProductsLoading();

  try {
    const response = await fetch(`${API_BASE}/products?limit=100&published=true`);
    if (!response.ok) {
      throw new Error(`Failed to load products: ${response.status}`);
    }
    const data = await response.json();
    // API returns products in data.data
    allProducts = data.data || data.products || [];
    applyFilters();
  } catch (error) {
    console.error('Error loading products:', error);
    // Show error message on page
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
      productsGrid.innerHTML = '<div class="col-12"><p>Error loading products. Please refresh the page.</p></div>';
    }
  }
}

function applyFilters() {
  const normalizedCategory = activeCategory.toLowerCase();
  const normalizedSearch = activeSearchTerm.toLowerCase();

  const filteredProducts = allProducts.filter((product) => {
    const matchesCategory = !normalizedCategory || normalizedCategory === 'all'
      ? true
      : getProductCategoryName(product) === normalizedCategory;

    const productName = (product.name || '').toLowerCase();
    const matchesSearch = !normalizedSearch || productName.includes(normalizedSearch);

    return matchesCategory && matchesSearch;
  });

  displayProducts(filteredProducts);
}

function getProductCategoryName(product) {
  if (typeof product.category === 'object' && product.category) {
    return (product.category.name || '').toLowerCase();
  }
  return (product.category || '').toLowerCase();
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
    const imagePath = getImagePath(product);
    
    const productHTML = `
      <div class="col-lg-4 col-md-6 col-sm-12 mb-4">
        <div class="product-card" data-product-id="${product._id || product.id}" data-category="${categoryId}">
          <div class="product-image">
            <img src="${imagePath}" alt="${product.name}" class="img-fluid" onerror="this.src='../assets/images/placeholder.png'">
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
  activeCategory = category || '';
  applyFilters();
}

function setSearchTerm(term) {
  activeSearchTerm = (term || '').trim();
  applyFilters();
}

// Initialize products on page load
document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  activeSearchTerm = (params.get('search') || '').trim();

  loadProducts();
  
  // Add filter functionality
  const filterSelect = document.getElementById('categoryFilter');
  if (filterSelect) {
    activeCategory = filterSelect.value || '';
    filterSelect.addEventListener('change', (e) => {
      filterByCategory(e.target.value);
    });
  }

  window.addEventListener('header-search', (event) => {
    const nextQuery = event?.detail?.query || '';
    setSearchTerm(nextQuery);
  });
});
