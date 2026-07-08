const express = require('express');
const router = express.Router();
const { 
  getHomePageProducts, 
  getRecommendations, 
  getProductById // Import the new controller function
} = require('../controllers/productController');

router.get('/homepage', getHomePageProducts);
router.get('/recommendations', getRecommendations);

router.get('/:id', getProductById);

module.exports = { router };