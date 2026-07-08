const natural = require('natural');
const TfIdf = natural.TfIdf;

function extractPathTokens(imagePath) {
  if (!imagePath) return '';
  return imagePath
    .toLowerCase()
    .replace(/\\/g, '/') // Standardize windows slash forms
    .split('/')
    .filter(segment => segment && !segment.includes('.') && segment !== 'uploads')
    .join(' ');
}

function classifyCatalog(rawProducts) {
  if (!Array.isArray(rawProducts)) return [];

  const tfidf = new TfIdf();
 // We feed the combined text vectors of every single item directly into the TF-IDF engine
  rawProducts.forEach((product) => {
    const pathContext = extractPathTokens(product.imageName);
    const textCorpusBlock = `${product.title} ${product.description} ${pathContext}`;
    tfidf.addDocument(textCorpusBlock);
  });


  // Loop back through memory to read scores and discover the dominant classifications
  return rawProducts.map((product, index) => {
    const documentTerms = tfidf.listTerms(index);
    
    // Sort terms by mathematical significance score, filter out short structural tokens
    const dominantTerms = documentTerms
      .filter(item => item.term.length > 2)
      .sort((a, b) => b.tfidf - a.tfidf);

    // Dynamic Fallback Label Assignment
    let computedCategory = 'General Essentials';

    if (dominantTerms.length > 0) {
      // Extract the highest statistically significant noun token in this item vector
      const topNounToken = dominantTerms[0].term;
      
      // Capitalize the first letter of the discovered keyword to establish formatting rules
      computedCategory = topNounToken.charAt(0).toUpperCase() + topNounToken.slice(1);
      
      // Dynamic Grouping Framework: If the root token is granular, append category context
      if (['bag', 'box', 'lunch', 'essentials'].includes(topNounToken)) {
        computedCategory = 'School & Utility Gear';
      } else if (['shoe', 'boot', 'sneaker'].includes(topNounToken)) {
        computedCategory = 'Footwear';
      }
    }
    // Generates a stable review metric tied to your unique item database ID
    const seed = (product.id * 7) % 15; 
    const generatedRating = (3.5 + (seed / 10)).toFixed(1);

    // 4. MAP TO YOUR EXACT RAW JSON INTERFACE INTERSECTIONS
    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,       // Kept as raw number data type for KES currencies
      imageName: product.imageName,
      category: computedCategory, 
      rating: generatedRating     
    };
  });
}

module.exports = { classifyCatalog };