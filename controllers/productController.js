const fs = require('fs');
const path = require('path');
const searchController = require('../controllers/searchController'); 

// 1. HOME PAGE PRODUCTS CONTROLLER
const getHomePageProducts = (req, res) => {
    const filePath = path.join(__dirname, '../mockup/products.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const products = JSON.parse(rawData);
    const shuffled = products.sort(() => 0.5 - Math.random());
    const homePageProducts = shuffled.slice(0, 60);
    res.status(200).json(homePageProducts);
};

// 2. FIXED SINGLE PRODUCT CONTROLLER (Changed 'exports.getProductById' to 'const getProductById')
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[Cache Machine] Incoming details request for ID: ${id}`);
    
    // Grab the live 116 product cache from your search engine controller
    const cache = searchController.MEMORY_PRODUCT_CACHE();

    // Find the item using loose equality (==) to ignore String vs Number mismatches
    const foundProduct = cache.find(product => product.id == id || product._id == id);

    // If not found, immediately break the loop and respond 404
    if (!foundProduct) {
      console.log(`[Cache Machine Failure] Product with ID ${id} is missing from cache.`);
      return res.status(404).json({ message: 'Product not found in active catalog cache' });
    }

    // Explicitly send the JSON data back to the frontend to end the "Pending" state
    console.log(`[Cache Machine Success] Found product: ${foundProduct.title || foundProduct.name}. Sending payload.`);
    return res.status(200).json(foundProduct);

  } catch (error) {
    console.error('[Single Product Fetch Exception]:', error);
    return res.status(500).json({ message: 'Internal server error pulling catalog item.', error: error.message });
  }
};

// 3. RECOMMENDATIONS CONTROLLER
const getRecommendations = (req, res) => {
    const filePath = path.join(__dirname, '../mockup/products.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const products = JSON.parse(rawData);
    const { category, exclude } = req.query;
    const matches = products.filter(p => p.category === category && String(p.id) !== String(exclude));
    const shuffled = matches.sort(() => 0.5 - Math.random());
    const recommendations = shuffled.slice(0, 4);
    res.status(200).json(recommendations);
};

// 4. UNIFIED BLOCK EXPORT (This will now run perfectly without crashing)
module.exports = { 
  getHomePageProducts, 
  getRecommendations, 
  getProductById 
};
