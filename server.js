const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const User = require('./models/User');
const Match = require('./models/Match');
const Banner = require('./models/Banner'); // এটি যোগ করা হয়েছে
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(session({
    secret: 'makeyourtourff_secure_key',
    resave: false,
    saveUninitialized: true
}));

// Database Connection
const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('DB Error:', err));

// Middleware to check Login
function isLogged(req, res, next) {
    if (req.session.user) next();
    else res.redirect('/login');
}

// --- ROUTES ---

// ১. আপনার হোমপেজ (এখানে স্লাইডার ডাইনামিক করা হয়েছে)
app.get('/', isLogged, async (req, res) => {
    try {
        const banners = await Banner.find(); // ডাটাবেস থেকে ব্যানার আনবে
        res.render('index', { banners, user: req.session.user });
    } catch (err) { res.send(err.message); }
});

// ২. ক্যাটাগরি ভিত্তিক ম্যাচ (আপনার ডিজাইন অনুযায়ী কাজ করবে)
app.get('/category/:type', isLogged, async (req, res) => {
    const matches = await Match.find({ category: req.params.type }).sort({ _id: -1 });
    res.render('category-matches', { matches, type: req.params.type, user: req.session.user });
});

// ৩. অথেনটিকেশন (আপনার আগের কোড)
app.get('/register', (req, res) => res.render('register'));
app.post('/register', async (req, res) => {
    const newUser = new User(req.body);
    await newUser.save();
    res.redirect('/login');
});

app.get('/login', (req, res) => res.render('login'));
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) { req.session.user = user; res.redirect('/'); }
    else res.send('Invalid details');
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// ৪. ম্যাচ এবং জয়েনিং (আপনার আগের লজিক)
app.get('/match/:id', isLogged, async (req, res) => {
    const match = await Match.findById(req.params.id);
    res.render('match-details', { match, user: req.session.user });
});

app.post('/join-match/:id', isLogged, async (req, res) => {
    const match = await Match.findById(req.params.id);
    const user = await User.findById(req.session.user._id);
    if (user.wallet < match.entryFee) return res.send("Low Balance!");
    user.wallet -= match.entryFee;
    match.joinedPlayers.push({ username: req.body.playerName, uid: req.body.uid, teamType: req.body.teamType });
    await user.save(); await match.save();
    req.session.user = user; 
    res.redirect('/match/' + match._id);
});

// ৫. অ্যাডমিন প্যানেল
app.get('/admin', async (req, res) => {
    const matches = await Match.find().sort({ _id: -1 });
    const banners = await Banner.find();
    res.render('admin', { matches, banners });
});

app.post('/admin/add-match', async (req, res) => {
    await new Match(req.body).save();
    res.redirect('/admin');
});

app.post('/admin/add-banner', async (req, res) => {
    await new Banner(req.body).save(); // অ্যাডমিন থেকে ব্যানার অ্যাড
    res.redirect('/admin');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
