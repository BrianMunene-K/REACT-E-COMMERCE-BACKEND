const fs = require('fs');
const path = require('path');
const getHomePageProducts = (req, res) => {
    const filePath = path.join(__dirname, '../mockup/products.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const products = JSON.parse(rawData);
    const shuffled = products.sort(() => 0.5 - Math.random());
    const homePageProducts = shuffled.slice(0, 60);
    res.status(200).json(homePageProducts);
};

module.exports = { getHomePageProducts };