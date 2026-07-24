const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

const PORT = process.env.PORT || 3000;

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // এটি ফোল্ডার চিনতে সাহায্য করবে
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
const dbURI = process.env.MONGODB_URI;
if (dbURI) {
    mongoose.connect(dbURI)
        .then(() => console.log('MongoDB Connected...'))
        .catch(err => console.log('DB Connection Error:', err));
}

// Routes
app.get('/', (req, res) => {
    res.render('index');
});

// Server Listen
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
