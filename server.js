const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const User = require('./models/User');
const Match = require('./models/Match');
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true
}));

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.log('DB Error:', err));

// Routes
app.get('/', async (req, res) => {
    const matches = await Match.find();
    res.render('index', { matches, user: req.session.user });
});

app.get('/register', (req, res) => res.render('register'));

app.post('/register', async (req, res) => {
    const { username, email, password, uid } = req.body;
    const newUser = new User({ username, email, password, uid });
    await newUser.save();
    res.redirect('/login');
});

app.get('/login', (req, res) => res.render('login'));

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
        req.session.user = user;
        res.redirect('/');
    } else {
        res.send('Invalid email or password');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Admin Page - To see and add matches
app.get('/admin', (req, res) => {
    res.render('admin');
});

// Post Match Logic
app.post('/admin/add-match', async (req, res) => {
    const { title, entryFee, prize, time, map, version } = req.body;
    const newMatch = new Match({ title, entryFee, prize, time, map, version });
    await newMatch.save();
    res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
