
const express = require('express');
const router = express.Router();
const searchController = require('../controllers/searchController');
router.get('/suggest', searchController.executeKeystrokeSuggestions);

router.get('/query', searchController.executeQuerySearch);

// Export the router configuration cleanly to be registered inside server.js
module.exports = router;