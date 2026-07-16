const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const PORT = 5000;

app.use(cors({ origin: 'http://localhost:5173' }));
app.use(express.json());

const UPLOADS_DIR = 'C:/Users/USER/Downloads/Uploads';
app.use('/Uploads', express.static(UPLOADS_DIR));

// --- EXISTING TRACK ---
const { router } = require('./routes/productRoutes');
app.use('/api/products', router);

// --- NEW SEARCH FEED TRACK (INDEPENDENT COUPLING) ---
// This safely hooks up our new endpoint gateway mapping
const searchRoute = require('./routes/searchRoute');
app.use('/api/search', searchRoute);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});