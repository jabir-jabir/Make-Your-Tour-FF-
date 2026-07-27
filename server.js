const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const User = require('./models/User');
const Match = require('./models/Match');
const Banner = require('./models/Banner'); 
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
.catch(err => console.error('DB Connection Error:', err));

// Middleware to check if user is logged in
function isLogged(req, res, next) {
    if (req.session.user) next();
    else res.redirect('/login');
}

// --- ROUTES ---

// 1. Home Page (Banner & Categories)
app.get('/', isLogged, async (req, res) => {
    try {
        const banners = await Banner.find();
        res.render('index', { banners, user: req.session.user });
    } catch (err) { res.send(err.message); }
});

// 2. Matches by Category
app.get('/category/:type', isLogged, async (req, res) => {
    const matches = await Match.find({ category: req.params.type }).sort({ _id: -1 });
    res.render('category-matches', { matches, type: req.params.type, user: req.session.user });
});

// 3. Auth Routes
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
    if (user) {
        req.session.user = user;
        res.redirect('/');
    } else { res.send('Invalid details'); }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// 4. Match Details & Join
app.get('/match/:id', isLogged, async (req, res) => {
    const match = await Match.findById(req.params.id);
    res.render('match-details', { match, user: req.session.user });
});

app.get('/join-match/:id', isLogged, (req, res) => {
    res.render('join', { matchId: req.params.id });
});

app.post('/join-match/:id', isLogged, async (req, res) => {
    const { playerName, uid, teamType } = req.body;
    const match = await Match.findById(req.params.id);
    const user = await User.findById(req.session.user._id);

    if (user.wallet < match.entryFee) return res.send("Low Balance!");

    user.wallet -= match.entryFee;
    match.joinedPlayers.push({ username: playerName, uid: uid, teamType: teamType });
    await user.save();
    await match.save();
    req.session.user = user; 
    res.redirect('/match/' + match._id);
});

// 5. Admin Panel (Matches & Banners)
app.get('/admin', async (req, res) => {
    const matches = await Match.find().sort({ _id: -1 });
    const banners = await Banner.find();
    res.render('admin', { matches, banners });
});

app.post('/admin/add-match', async (req, res) => {
    await new Match(req.body).save();
    res.redirect('/admin');
});

app.post('/admin/update-room/:id', async (req, res) => {
    await Match.findByIdAndUpdate(req.params.id, req.body);
    res.redirect('/admin');
});

app.post('/admin/add-banner', async (req, res) => {
    await new Banner(req.body).save();
    res.redirect('/admin');
});

app.get('/admin/delete-banner/:id', async (req, res) => {
    await Banner.findByIdAndDelete(req.params.id);
    res.redirect('/admin');
});

app.get('/profile', isLogged, (req, res) => res.render('profile', { user: req.session.user }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
