# WST-JCC-ECOMMERCE System Summary

## 📋 Overview

**WST-JCC-ECOMMERCE** is a lightweight, client-side e-commerce platform built with vanilla HTML, CSS, and JavaScript. It demonstrates core e-commerce functionality without backend dependencies, making it ideal as a learning project or portfolio showcase. The system focuses on product discovery, detailed product views, and shopping cart management.

---

## 🏗️ Architecture & Technology Stack

### Core Technologies
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **CSS Framework**: Bootstrap 5.3.0
- **Data Format**: JSON (static product catalog)
- **Storage**: Browser localStorage
- **Deployment**: Static file serving (no server-side code)

### Key Design Principles
- **Modular Structure**: Separated concerns across different files and folders
- **Reusable Components**: Header and footer implemented as HTML partials loaded at runtime
- **Single Source of Truth**: All product data centralized in `data/products.json`
- **Client-Side Rendering**: DOM manipulation via JavaScript for dynamic content

---

## 🎯 Core Features

### 1. **Homepage (Landing Page)**
**File**: `index.html`z 

**Functionality**:
- Displays a hero section with marketing tagline: *"Curated fashion and beauty, crafted for effortless elegance."*
- Features a prominent hero image banner
- Includes a "Discover" call-to-action button that navigates to the shop
- Responsive design that adapts to mobile, tablet, and desktop screens

**Visual Elements**:
- Dynamic hero section with background image
- Overlay button with arrow icon
- Clean, minimalist branding with JCC logo

---

### 2. **Product Shop/Catalog**
**Files**: `pages/shop.html`, `assets/js/shop.js`

**Functionality**:

#### Product Display
- Dynamically loads all products from `data/products.json` via fetch API
- Displays products in a responsive grid layout (4 columns on desktop, 2-3 on tablet, 1 on mobile)
- Shows product card with:
  - Product image
  - Product name
  - Price in Philippine Peso (₱) format
  - Product ID data attribute for tracking

#### Filtering System
- Category filter dropdown with options:
  - All (default - shows all products)
  - Fashion
  - Beauty
  - Accessories
- Real-time filtering updates the displayed products
- Maintains responsive grid layout after filtering

#### Product Discovery
- Click on any product card redirects to detailed product page
- URL includes product ID as query parameter (`singleProduct.html?id={productId}`)
- Error handling for failed product loads

#### Error Handling
- Displays user-friendly error message if product data fails to load
- Empty state message when no products match selected filter

---

### 3. **Single Product Details Page**
**Files**: `pages/singleProduct.html`, `assets/js/single-product.js`

**Functionality**:

#### Product Information Display
- Full product image
- Product name and price (₱ formatted with locale string)
- Complete description (longer than shop preview)
- Product specifications including:
  - Material composition
  - Color options
  - Available sizes
  - Fit type (e.g., Regular, Relaxed)
  - Care instructions

#### Navigation
- Back button to return to shop page
- Maintains category filter state when returning to shop (if applicable)

#### Add to Cart
- **Add to Cart Button** with shopping cart icon
- Smart cart management:
  - If product already exists in cart → increments quantity
  - If product new → adds with quantity of 1
  - Updates localStorage immediately
  - Triggers cart badge update across the app
- Success feedback (typically via toast or direct cart navigation)

#### Dynamic Content Loading
- Extracts product ID from URL query parameters
- Fetches product data from JSON
- Redirects to shop if product ID missing or invalid
- Redirects to shop if product not found

---

### 4. **Shopping Cart**
**Files**: `pages/cart.html`, `assets/js/cart.js`

**Functionality**:

#### Cart Display
- Lists all items currently in cart
- Shows for each item:
  - Product image (thumbnail)
  - Product name
  - Price per unit
  - Current quantity
  - Item subtotal (price × quantity)

#### Cart Item Management
- **Increase Quantity**: "+" button increments item quantity
- **Decrease Quantity**: "-" button decrements quantity (minimum of 1)
- **Delete Item**: Trash icon removes entire item from cart
- All changes persist to localStorage immediately

#### Billing Section
- **Detailed Breakdown**:
  - Individual item lines with quantity and subtotal
  - Subtotal (sum of all items)
  - Estimated tax (10% of subtotal) - *calculated*
  - Shipping fee (fixed at ₱100)
  - **Total Amount** (Subtotal + Tax + Shipping)

#### Currency Formatting
- All prices displayed in Philippine Peso (₱)
- Locale-aware number formatting with comma separators
- Two decimal places (.00)

#### Empty Cart State
- Message: "Your cart is empty" with link to continue shopping
- Billing section updates correctly when cart is empty

#### Data Persistence
- Cart stored in browser localStorage
- Survives page refreshes and browser closures
- Synchronized across browser tabs/windows via storage event listener

---

### 5. **Navigation Header**
**Files**: `partials/header.html`, `assets/js/header.js`, `assets/css/bootstrap/header.css`

**Functionality**:

#### Layout Components
- **Logo/Brand**: JCC logo centered, links to home page
- **Navigation Menu**: Links to Home and Shop pages
- **Cart Icon**: Displays shopping cart with item count badge
  - Two variants: Desktop (right side) and Mobile (in hamburger menu)
- **Search Button**: Placeholder for future search functionality (visual element)

#### Mobile Responsiveness
- Bootstrap hamburger menu for mobile devices
- Toggle button collapses/expands navigation menu
- Mobile-specific action section with cart and search
- Proper spacing and alignment across breakpoints

#### Cart Badge
- Shows total quantity of items in cart
- Updates in real-time when cart changes
- Two separate badge elements (desktop and mobile)
- Uses data from localStorage cart

#### Sticky Navigation
- Header remains visible at top while scrolling
- `sticky-top` Bootstrap class applied
- Proper z-index management

#### Visual Design
- White background with Bootstrap styling
- Subtle divider line below header
- Responsive navigation that adapts to screen size
- Professional and clean appearance

---

### 6. **Footer**
**Files**: `partials/footer.html`, `assets/css/custom/footer.css`

**Functionality**:
- Loaded as reusable partial on all pages
- Consistent footer layout across all pages
- Provides company/brand information and links
- Responsive design matching site's aesthetic

---

### 7. **Partial System (Dynamic Component Loading)**
**Files**: `assets/js/partials-loader.js`

**Functionality**:
- Automatically loads header and footer HTML from `partials/` folder
- Injects partials into `<header>` and `<footer>` empty tags
- Executes at DOM ready (DOMContentLoaded)
- Enables code reuse without duplicating HTML across pages
- Single maintenance point for header and footer updates

---

## 💾 Data Management

### Product Catalog (`data/products.json`)
**Structure**: Array of product objects with the following properties:

```javascript
{
  "id": 1,                                    // Unique identifier
  "name": "Classic White Button-Down Shirt", // Product name
  "description": "...",                       // Short description
  "fullDescription": "...",                   // Long description for detail page
  "price": 1499,                              // Price in pesos (integer)
  "category": "fashion",                      // Category: fashion, beauty, accessories
  "image": "assets/images/Product Images/...", // Relative image path
  "material": "100% Cotton",                  // Material composition
  "color": "White",                           // Color
  "fit": "Regular",                           // Fit type
  "sizes": ["S", "M", "L", "XL"],            // Available sizes array
  "care": "Machine wash cold, tumble dry low", // Care instructions
  "inStock": true,                            // Availability flag
  "featured": true                            // Featured flag (for homepage display)
}
```

### Product Categories
1. **Fashion** - Clothing items (shirts, trousers, etc.)
2. **Beauty** - Beauty and personal care products
3. **Accessories** - Fashion accessories

### Local Storage Structure
**Key**: `cart`

**Value**: JSON array of cart items
```javascript
[
  {
    "id": 1,
    "name": "Classic White Button-Down Shirt",
    "price": 1499,
    "quantity": 2,
    "image": "assets/images/Product Images/clothes1.png"
  },
  // ... more items
]
```

---

## 🎨 Styling & UI/UX

### CSS Architecture
- **Bootstrap Integration**: Primary framework for layout and components
- **Custom Stylesheets**:
  - `main.css` - Global styles and layout
  - `shop.css` - Shop page specific styles
  - `single-product.css` - Product detail page styles
  - `cart.css` - Cart page styles
  - `header.css` - Header styling and customizations
  - `footer.css` - Footer styling
- **Bootstrap Overrides**: `overrides.css` for custom Bootstrap modifications

### Responsive Design
- Mobile-first approach using Bootstrap's grid system
- Breakpoints: `sm` (576px), `md` (768px), `lg` (992px), `xl` (1200px)
- Flexible product grids: 1 column mobile → 2 columns tablet → 4 columns desktop
- Responsive font sizes and spacing

### Visual Hierarchy
- Clear typography distinction (headings, body text, labels)
- Whitespace usage for readability
- Icon usage for actionable elements (cart, delete, search)
- Color-coded elements (prices, buttons, badges)

---

## 🔧 Utility Functions & Helpers

### File: `assets/js/helpers.js`

#### DOM Utilities (`DOM` object)
- `getElementById()` - Get element by ID
- `getElementsByClass()` - Get elements by class
- `querySelector()` - Single element query
- `querySelectorAll()` - Multiple elements query
- `createElement()` - Create new elements with optional class and text

#### Cart Badge Management
- `updateCartBadge()` - Updates badge with current cart item count
- Synchronized across both desktop and mobile badge elements
- Includes delay mechanism for DOM readiness
- Listens to storage events for cross-tab updates

#### Currency Formatting
- `formatCurrency()` - Format amounts as currency (Philippine Peso)

#### Event Listeners
- Storage event listener for cart synchronization across tabs
- DOM content loaded handler for badge initialization

---

## 📱 Page Flow & User Journey

### 1. **Homepage → Shop**
- User lands on `index.html`
- Clicks "Discover" button
- Redirects to `pages/shop.html`

### 2. **Browse Products**
- Filters products by category (optional)
- Views product listings in grid
- Clicks product card to view details

### 3. **View Product Details**
- Single product page loads with full information
- User can add item to cart
- Returns to shop via back button

### 4. **Manage Cart**
- Clicks cart icon from any page
- Views all items with quantities
- Can modify quantities or remove items
- Sees real-time billing calculations

### 5. **Header Updates**
- Cart badge shows total items
- Updates across all pages
- Reflects changes from other tabs

---

## 🚀 Technical Features & Capabilities

### Asynchronous Data Loading
- Fetch API for loading `products.json`
- Error handling for failed requests
- Loading states handled gracefully

### Local Storage Integration
- Persistent cart across sessions
- JSON serialization/deserialization
- Cross-tab synchronization via storage events

### DOM Manipulation
- Dynamic product grid rendering
- Real-time cart updates
- Conditional content display (empty cart state)

### URL Query Parameters
- Extract product ID from URL (`?id=1`)
- Enable deep linking to specific products
- Navigate with state preservation

### Event Handling
- Click events for product selection
- Change events for category filtering
- Custom cart operations (add, remove, update quantity)
- Storage events for tab synchronization

---

## 🔐 Data Flow Diagram

```
Homepage
   ↓
   ├─→ [Click Discover] → Shop Page
   │                        ↓
   │                    [Load products.json]
   │                        ↓
   │                    [Display Grid]
   │                        ↓
   │                    [Filter Products]
   │
   ├─→ [Click Cart] → Cart Page
   │                  ↓
   │            [Load from localStorage]
   │                  ↓
   │            [Display Items + Billing]
   │
   └─→ Shop → [Click Product] → Single Product Page
                                  ↓
                         [Load product.json]
                                  ↓
                         [Display Details]
                                  ↓
                    [Add to Cart] → Save to localStorage
                                  ↓
                         Update Cart Badge
```

---

## 📊 Key Metrics & Information

### Product Information Tracked
- 100+ products in catalog
- Categories: Fashion, Beauty, Accessories
- Price range: ₱1,299 - ₱2,999
- Sizes available: XS, S, M, L, XL, XXL

### Cart Operations
- Add items with default quantity (1)
- Increment/decrement quantities
- Delete items
- View subtotal, tax, shipping, total

### Performance Considerations
- Single JSON file load per page visit
- Lazy loading of partials at DOMContentLoaded
- localStorage for fast cart access
- Minimal network requests (no external API calls)

---

## ⚠️ Limitations & Future Enhancements

### Current Limitations
- No backend/database (static products only)
- No user authentication
- No payment processing
- No order history or wishlist
- Cart data not encrypted (localStorage vulnerability)
- Search functionality not implemented
- No product reviews or ratings
- No inventory management

### Recommended Future Features
1. **Backend Integration** - Node.js/Express server for dynamic products
2. **User Accounts** - Registration, login, order history
3. **Payment Gateway** - Stripe/PayPal integration
4. **Search Functionality** - Full-text search with filters
5. **Product Reviews** - Customer ratings and reviews
6. **Wishlist** - Save favorite items
7. **Inventory Management** - Stock tracking
8. **Admin Dashboard** - Manage products and orders
9. **Analytics** - Track user behavior
10. **PWA Features** - Offline support, installability

---

## 📁 Project Structure Reference

```
WST-JCC-ECOMMERCE/
├── index.html                          # Homepage with hero section
├── pages/
│   ├── shop.html                      # Product catalog with filters
│   ├── singleProduct.html             # Product detail page
│   └── cart.html                      # Shopping cart page
├── partials/
│   ├── header.html                    # Reusable header component
│   └── footer.html                    # Reusable footer component
├── assets/
│   ├── css/
│   │   ├── bootstrap/
│   │   │   ├── header.css             # Header styling
│   │   │   └── overrides.css          # Bootstrap customizations
│   │   └── custom/
│   │       ├── main.css               # Global styles
│   │       ├── shop.css               # Shop page styles
│   │       ├── single-product.css     # Product detail styles
│   │       ├── cart.css               # Cart page styles
│   │       └── footer.css             # Footer styling
│   ├── js/
│   │   ├── main.js                    # Main initialization script
│   │   ├── helpers.js                 # Utility functions
│   │   ├── partials-loader.js         # Dynamic partial loading
│   │   ├── shop.js                    # Shop page logic
│   │   ├── single-product.js          # Product detail logic
│   │   ├── cart.js                    # Cart management logic
│   │   └── header.js                  # Header functionality
│   ├── images/
│   │   ├── Product Images/            # Product photos
│   │   ├── HERO.PNG                   # Homepage hero image
│   │   └── jcclogo.png                # Brand logo
│   └── fonts/                         # Custom fonts
├── data/
│   └── products.json                  # Product catalog (JSON)
└── README.md                          # Project documentation
```

---

## 🎓 Learning Outcomes

This project demonstrates:
1. **Frontend Web Development** - HTML5, CSS3, JavaScript fundamentals
2. **DOM Manipulation** - Dynamic content rendering and updates
3. **API Integration** - Fetching and processing JSON data
4. **State Management** - Managing cart state with localStorage
5. **Responsive Design** - Mobile-first CSS and Bootstrap framework
6. **Component Architecture** - Reusable HTML partials
7. **Event Handling** - Click, change, and storage events
8. **URL Management** - Query parameters for routing
9. **Data Structures** - Working with objects and arrays
10. **UI/UX Principles** - User-friendly interface design

---

## 📝 Summary

**WST-JCC-ECOMMERCE** is a well-structured, feature-rich e-commerce learning project that showcases core web development skills. It successfully implements:
- ✅ Product discovery and filtering
- ✅ Detailed product information display
- ✅ Shopping cart with persistent storage
- ✅ Responsive mobile-friendly design
- ✅ Modular, maintainable code architecture
- ✅ Reusable component system

The project serves as an excellent foundation for learning e-commerce development concepts or as a portfolio piece demonstrating proficiency in vanilla web technologies.
