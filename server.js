const express = require('express');
const mongoose = require('mongoose');
const app = express();
const PORT = process.env.PORT || 3000;

// Database Connection (আমরা পরে MongoDB লিঙ্ক বসাবো)
const dbURI = process.env.MONGODB_URI || 'YOUR_MONGODB_CONNECTION_STRING_HERE';

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index', { title: 'Free Fire Tournament Website' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
