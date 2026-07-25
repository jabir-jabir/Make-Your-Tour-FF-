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
    secret: 'makeyourtourff_secure_key',
    resave: false,
    saveUninitialized: true
}));

// Database Connection
const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch(err => console.error('DB Connection Error:', err));

// --- Middleware to check if user is logged in ---
function isLogged(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// --- ROUTES ---

// 1. Home Page (Redirects to Login if not logged in)
app.get('/', isLogged, async (req, res) => {
    try {
        const matches = await Match.find().sort({ _id: -1 });
        res.render('index', { matches, user: req.session.user });
    } catch (err) { res.send(err.message); }
});

// 2. Auth Routes
app.get('/register', (req, res) => res.render('register'));
app.post('/register', async (req, res) => {
    try {
        const { username, email, password, uid } = req.body;
        const newUser = new User({ username, email, password, uid });
        await newUser.save();
        res.redirect('/login');
    } catch (err) { res.send("Email already exists!"); }
});

app.get('/login', (req, res) => res.render('login'));
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) {
        req.session.user = user;
        res.redirect('/');
    } else {
        res.send('Invalid email or password. <a href="/login">Try again</a>');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// 3. Match Details & Joining
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

    if (user.wallet < match.entryFee) return res.send("Insufficient Balance!");

    user.wallet -= match.entryFee;
    match.joinedPlayers.push({ username: playerName, uid: uid, teamType: teamType });
    
    await user.save();
    await match.save();
    req.session.user = user; // Update session balance
    res.redirect('/match/' + match._id);
});

// 4. Admin Panel
app.get('/admin', async (req, res) => {
    const matches = await Match.find().sort({ _id: -1 });
    res.render('admin', { matches });
});

app.post('/admin/add-match', async (req, res) => {
    try {
        const newMatch = new Match(req.body);
        await newMatch.save();
        res.redirect('/admin');
    } catch (err) { res.send(err.message); }
});

app.post('/admin/update-room/:id', async (req, res) => {
    const { roomID, roomPass } = req.body;
    await Match.findByIdAndUpdate(req.params.id, { roomID, roomPass });
    res.redirect('/admin');
});

// 5. Profile Page
app.get('/profile', isLogged, (req, res) => {
    res.render('profile', { user: req.session.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
