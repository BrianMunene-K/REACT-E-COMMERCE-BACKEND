const express = require('express');
const router = express.Router();
const { getHomePageProducts } = require('../controllers/productController');
router.get('/homepage', getHomePageProducts);
module.exports = { router };