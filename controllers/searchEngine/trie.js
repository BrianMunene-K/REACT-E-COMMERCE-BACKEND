
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

  _cleanPhrase(phrase) {
    if (!phrase) return '';
    return phrase.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '');
  }

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

      if (suggestionText && currentNode.suggestions.size < 10) {
        currentNode.suggestions.add(suggestionText);
      }
    }
    currentNode.isEndOfWord = true;
  }

  hydrate(enrichedProducts) {
    if (!Array.isArray(enrichedProducts)) return;

    // Clear root to safely handle rebuilds or runtime data sync tasks
    this.root = new TrieNode();

    enrichedProducts.forEach((product) => {
      if (product.title) {
        this.insert(product.title, product.title);
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
    return Array.from(currentNode.suggestions);
  }
}

// Export a single, long-lived global instance of the tree structure
const globalProductTrie = new ProductTrie();
module.exports = globalProductTrie;