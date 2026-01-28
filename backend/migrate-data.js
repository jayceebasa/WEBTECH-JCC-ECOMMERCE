require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/database');

const Category = require('./models/Category');
const Product = require('./models/Product');

// Old product data
const oldProducts = [
  {
    id: 1,
    name: "Classic White Button-Down Shirt",
    description: "Elegant white linen button-down shirt",
    fullDescription: "Elevate your wardrobe with this minimalist white button-down shirt. Tailored from premium cotton for all-day comfort, it's perfect for both casual and professional settings. With a crisp collar, clean lines, and a timeless silhouette, this piece is a staple every wardrobe needs.",
    price: 1499,
    category: "fashion",
    image: "assets/images/Product Images/clothes1.png",
    material: "100% Cotton",
    color: "White",
    fit: "Regular",
    sizes: ["S", "M", "L", "XL"],
    care: "Machine wash cold, tumble dry low",
    inStock: true,
    featured: true,
    quantity: 50
  },
  {
    id: 2,
    name: "Beige Linen Trousers",
    description: "Comfortable and stylish beige linen trousers",
    fullDescription: "These beige linen trousers combine comfort with elegance. Made from breathable linen fabric, they're perfect for warm days and casual office wear. The relaxed fit and neutral color make them versatile pieces that pair well with any top.",
    price: 1799,
    category: "fashion",
    image: "assets/images/Product Images/clothes2.png",
    material: "100% Linen",
    color: "Beige",
    fit: "Relaxed",
    sizes: ["XS", "S", "M", "L", "XL"],
    care: "Hand wash or gentle cycle, lay flat to dry",
    inStock: true,
    featured: true,
    quantity: 45
  },
  {
    id: 3,
    name: "Cream Linen Shirt",
    description: "Relaxed fit cream linen shirt perfect for any occasion",
    fullDescription: "This cream linen shirt is the epitome of casual elegance. Perfect for layering or wearing on its own, it features a relaxed silhouette and breathable fabric ideal for any season. A wardrobe essential that effortlessly transitions from day to night.",
    price: 1699,
    category: "fashion",
    image: "assets/images/Product Images/clothes3.png",
    material: "100% Linen",
    color: "Cream",
    fit: "Relaxed",
    sizes: ["S", "M", "L", "XL"],
    care: "Hand wash, lay flat to dry",
    inStock: true,
    featured: true,
    quantity: 40
  },
  {
    id: 4,
    name: "Beauty Skincare Set",
    description: "Complete skincare collection with serums and creams",
    fullDescription: "Complete your skincare routine with our luxurious skincare set. This collection includes serums, moisturizers, and treatments formulated to nourish and revitalize your skin. Perfect for all skin types.",
    price: 2499,
    category: "beauty",
    image: "assets/images/Product Images/makeup.png",
    material: "Cruelty-free",
    color: "Multi",
    type: "Full Set",
    sizes: ["Full Size"],
    care: "Keep in cool, dry place",
    inStock: true,
    featured: true,
    quantity: 30
  },
  {
    id: 5,
    name: "Foundation Bottle",
    description: "Smooth and natural finish foundation",
    fullDescription: "Achieve a flawless complexion with our premium foundation. The smooth, blendable formula provides natural coverage and a skin-like finish. Perfect for all skin types and occasions.",
    price: 899,
    category: "beauty",
    image: "assets/images/Product Images/makeup3.png",
    material: "Lightweight formula",
    color: "Natural Beige",
    type: "Foundation",
    sizes: ["30ml"],
    care: "Apply with brush or sponge, store upright",
    inStock: true,
    featured: true,
    quantity: 60
  },
  {
    id: 6,
    name: "Makeup Palette with Brushes",
    description: "Professional makeup palette with 5 essential brushes",
    fullDescription: "Create stunning eye looks with this professional makeup palette. Includes 5 essential brushes to help you achieve flawless application. Perfect for both beginners and makeup enthusiasts.",
    price: 1299,
    category: "beauty",
    image: "assets/images/Product Images/makeup1.png",
    material: "Professional-grade",
    color: "Neutral Tones",
    type: "Palette + Brushes",
    sizes: ["Full Set"],
    care: "Clean brushes regularly, store in cool place",
    inStock: true,
    featured: true,
    quantity: 35
  }
];

async function migrateData() {
  try {
    // Connect to database
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear existing data
    await Product.deleteMany({});
    await Category.deleteMany({});
    console.log('Cleared existing products and categories');

    // Create categories
    const fashionCategory = await Category.create({
      name: 'Fashion',
      description: 'Clothing and fashion accessories',
      slug: 'fashion'
    });
    console.log('Created Fashion category:', fashionCategory._id);

    const beautyCategory = await Category.create({
      name: 'Beauty',
      description: 'Beauty and skincare products',
      slug: 'beauty'
    });
    console.log('Created Beauty category:', beautyCategory._id);

    // Transform and insert products
    const transformedProducts = oldProducts.map(product => ({
      name: product.name,
      description: product.description,
      fullDescription: product.fullDescription,
      price: product.price,
      category: product.category === 'fashion' ? fashionCategory._id : beautyCategory._id,
      image: product.image,
      details: {
        material: product.material,
        color: product.color,
        fit: product.fit || null,
        type: product.type || null,
        care: product.care
      },
      sizes: product.sizes,
      inventory: {
        quantity: product.quantity,
        inStock: product.inStock
      },
      featured: product.featured
    }));

    const insertedProducts = await Product.insertMany(transformedProducts);
    console.log(`Inserted ${insertedProducts.length} products`);

    console.log('\n✅ Data migration completed successfully!');
    console.log(`- ${insertedProducts.length} products inserted`);
    console.log('- Categories created: Fashion, Beauty');

    process.exit(0);
  } catch (error) {
    console.error('Migration error:', error);
    process.exit(1);
  }
}

// Run migration
migrateData();
