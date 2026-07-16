/**
 * ============================================================================
 * MODULE 4: SEARCH ENGINE OPERATIONAL TRAFFIC CONTROLLER (searchController.js)
 * ============================================================================
 * CACHING RULE: Orchestrates lifecycle synchronization and serves paginated
 * search arrays completely from volatile memory cache.
 */

const fs = require('fs');
const path = require('path');
const { classifyCatalog } = require('./searchEngine/classifier');
const globalProductTrie = require('./searchEngine/trie');

// High-speed, in-memory cache to hold our upgraded data array
let MEMORY_PRODUCT_CACHE = [];
const ITEMS_PER_PAGE = 8; // Perfectly aligned with your frontend pagination slice

/**
 * LIFECYCLE INITIALIZER: Synchronizes and builds your system RAM data states
 * This function runs ONCE when your server boots up.
 */
function initializeSearchEngine() {
  try {
    // 1. Resolve path and pull raw database keys from your read-only mockup file
    const targetPath = path.join(__dirname, '..', 'mockup', 'products.json');
    const rawData = fs.readFileSync(targetPath, 'utf8');
    const parsedProducts = JSON.parse(rawData);

    console.log(`[Search Engine] Booting... Ingested ${parsedProducts.length} raw products.`);

    // 2. Stream through NLP logic to dynamically compute categories and ratings.
    // THIS HAPPENS IN RAM INDEPENDENTLY. The physical products.json file is NOT altered.
    MEMORY_PRODUCT_CACHE = classifyCatalog(parsedProducts);

    // 3. Populate your Trie character map with the newly enriched objects
    globalProductTrie.hydrate(MEMORY_PRODUCT_CACHE);

    console.log('[Search Engine] Success: NLP Taxonomy Clustered & Prefix Trie Built.');
  } catch (error) {
    console.error('[Search Engine Fatal Crash Error]: Failed to bootstrap schema context.', error);
  }
}

// Automatically trigger initialization when this module file is loaded by server.js
initializeSearchEngine();

/**
 * ENDPOINT ACTION: Multi-Match Filter, Ranker & Pagination Slicer
 * Route Hook: GET /api/search/query?q=...&page=...
 */
exports.executeQuerySearch = async (req, res) => {
  try {
    const queryText = (req.query.q || '').toLowerCase().trim();
    const pageIndex = parseInt(req.query.page, 10) || 1;

    // Handle empty queries safely by returning an empty list block
    if (!queryText) {
      return res.status(200).json({ products: [], hasMore: false });
    }

    // 1. MULTI-MATCH RANKING MATRIX SCAN
    // Scans the active memory cache to filter items matching title, description, or category
    const matchingProducts = MEMORY_PRODUCT_CACHE.filter((product) => {
      const matchTitle = product.title.toLowerCase().includes(queryText);
      const matchDesc = product.description.toLowerCase().includes(queryText);
      const matchCategory = product.category.toLowerCase().includes(queryText);

      return matchTitle || matchDesc || matchCategory;
    });

    // 2. PAGINATION OFFSETS COMPUTATION SLICER
    const totalMatches = matchingProducts.length;
    const startIndex = (pageIndex - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;

    // Slice out the exact page segment of 8 items to send down the wire
    const paginatedSlice = matchingProducts.slice(startIndex, endIndex);

    // 3. HASMORE BOOLEAN STREAM RULE DETERMINATION
    const hasMore = endIndex < totalMatches;

    // Stream the final structural payload directly to your frontend SearchGrid
    return res.status(200).json({
      products: paginatedSlice,
      hasMore: hasMore
    });
  } catch (error) {
    console.error('[Search Query Error Handling Dispatcher]:', error);
    return res.status(500).json({ message: 'Internal Server Search Engine Error occurred.' });
  }
};

/**
 * ENDPOINT ACTION: Live Typing Suggestion Dispatcher
 * Route Hook: GET /api/search/suggest?prefix=...
 */
exports.executeKeystrokeSuggestions = async (req, res) => {
  try {
    const prefixInput = req.query.prefix || '';
    
    // Call our fast O(L) prefix search tree to collect character suggestions
    const matchedStrings = globalProductTrie.searchSuggestions(prefixInput);

    return res.status(200).json(matchedStrings);
  } catch (error) {
    console.error('[Keystroke Suggestions Stream Error]:', error);
    return res.status(500).json({ message: 'Error retrieving live keystroke strings.' });
  }
};