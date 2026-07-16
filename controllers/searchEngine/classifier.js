const natural = require('natural');
const TfIdf = natural.TfIdf;

function extractPathTokens(imagePath) {
  if (!imagePath) return '';
  return imagePath
    .toLowerCase()
    .replace(/\\/g, '/')
    .split('/')
    .filter(segment => segment && !segment.includes('.') && segment !== 'uploads')
    .join(' ');
}

function classifyCatalog(rawProducts) {
  if (!Array.isArray(rawProducts)) return [];
 const tfidf = new TfIdf();
 
  rawProducts.forEach((product) => {
    const pathContext = extractPathTokens(product.imageName);
    const textCorpusBlock = `${product.title} ${product.description} ${pathContext}`;
    tfidf.addDocument(textCorpusBlock);
  });

  return rawProducts.map((product, index) => {
    const documentTerms = tfidf.listTerms(index);
    
    // Sort terms by mathematical significance score, filter out short structural tokens
    const dominantTerms = documentTerms
      .filter(item => item.term.length > 2)
      .sort((a, b) => b.tfidf - a.tfidf);

    let computedCategory = 'General Essentials';

    if (dominantTerms.length > 0) {
    
      const topNounToken = dominantTerms[0].term;
      computedCategory = topNounToken.charAt(0).toUpperCase() + topNounToken.slice(1);
      
      
      if (['bag', 'box', 'lunch', 'essentials'].includes(topNounToken)) {
        computedCategory = 'School & Utility Gear';
      } else if (['shoe', 'boot', 'sneaker'].includes(topNounToken)) {
        computedCategory = 'Footwear';
      }
    }
  
    const seed = (product.id * 7) % 15; 
    const generatedRating = (3.5 + (seed / 10)).toFixed(1);

    return {
      id: product.id,
      title: product.title,
      description: product.description,
      price: product.price,    
      imageName: product.imageName,
      category: computedCategory, 
      rating: generatedRating     
    };
  });
}

module.exports = { classifyCatalog };