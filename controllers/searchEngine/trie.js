/**
 * ============================================================================
 * MODULE 3: HIGH-SPEED PREFIX TRIE SEARCH TREE (trie.js)
 * ============================================================================
 * PERFORMANCE RULE: Stores search keys as structural character chains to achieve
 * O(L) lookup times—where L is the length of the typed prefix string.
 */

class TrieNode {
  constructor() {
    this.children = {};     // Sub-nodes mapped by individual character keys
    this.isEndOfWord = false;
    this.suggestions = new Set(); // Caches clean string suggestions matching this path
  }
}

class ProductTrie {
  constructor() {
    this.root = new TrieNode();
  }

  /**
   * Tokenizes and cleans phrase strings to prepare them for tree placement.
   */
  _cleanPhrase(phrase) {
    if (!phrase) return '';
    return phrase.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '');
  }

  /**
   * Inserts a target phrase string into the tree character by character.
   */
  insert(phrase, suggestionText) {
    const cleaned = this._cleanPhrase(phrase);
    if (!cleaned) return;

    let currentNode = this.root;

    // Walk through the character nodes, creating new nodes where paths don't exist
    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      if (!currentNode.children[char]) {
        currentNode.children[char] = new TrieNode();
      }
      currentNode = currentNode.children[char];

      // CRITICAL STRATEGY: Cache the full suggestion text directly on the prefix node.
      // This eliminates the need for expensive sub-tree traversals during user typing.
      if (suggestionText && currentNode.suggestions.size < 10) {
        currentNode.suggestions.add(suggestionText);
      }
    }
    currentNode.isEndOfWord = true;
  }

  /**
   * Hydrates the entire Trie structure using your auto-classified product arrays.
   */
  hydrate(enrichedProducts) {
    if (!Array.isArray(enrichedProducts)) return;

    // Clear root to safely handle rebuilds or runtime data sync tasks
    this.root = new TrieNode();

    enrichedProducts.forEach((product) => {
      // Index the title for specific lookups
      if (product.title) {
        this.insert(product.title, product.title);
        
        // Split title into individual words to support middle-word lookups
        const words = product.title.split(/\s+/);
        if (words.length > 1) {
          words.forEach(word => this.insert(word, product.title));
        }
      }

      // Index the computed category so synonyms or broad categories match naturally
      if (product.category) {
        this.insert(product.category, product.category);
      }
    });
  }

  /**
   * Resolves a prefix parameter in O(L) time and extracts live typing suggestions.
   */
  searchSuggestions(prefix) {
    const cleaned = this._cleanPhrase(prefix);
    if (!cleaned) return [];

    let currentNode = this.root;

    // Trace down the pre-calculated character path nodes
    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      if (!currentNode.children[char]) {
        return []; // Break out immediately if a character breaks the index tree lines
      }
      currentNode = currentNode.children[char];
    }

    // Instantly return the pre-cached suggestions string array
    return Array.from(currentNode.suggestions);
  }
}

// Export a single, long-lived global instance of the tree structure
const globalProductTrie = new ProductTrie();
module.exports = globalProductTrie;