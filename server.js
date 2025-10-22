require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const User = require('./models/user');

const app = express();
const PORT = 3000;

// Replace with your actual MongoDB URI
const MONGO_URI = process.env.MONGO_URI;

//const MONGO_URI = "mongodb+srv://alvinkimani685_db_user:wUkOkscyMpEhoSE7@logindb.ir5crs9.mongodb.net/loginDB?retryWrites=true&w=majority&appName=logindb";

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in environment variables');
  process.exit(1); // Exit if no URI found
}

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

// Routes

// Login Page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Registration Page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

// Handle Login
app.post('/index', async (req, res) => {
    const { username, password } = req.body;
    console.log(`🔑 Login attempt: ${username}`);

    try {
        const user = await User.findOne({ username });

        if (!user) {
            console.log('❌ User not found');
            return res.send('❌ User not found.');
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            console.log('❌ Incorrect password');
            return res.send('❌ Incorrect password.');
        }

        req.session.user = user;
        console.log('✅ Login successful');
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('❌ Server error during login.');
    }
});

// Handle Registration
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    console.log(`📝 Registering: ${username}`);

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log('⚠️ Username already exists');
            return res.send('⚠️ Username already exists.');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        req.session.user = newUser;
        console.log('✅ User registered:', username);
        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('❌ Server error during registration.');
    }
});

// Dashboard (Protected)
app.get('/dashboard', (req, res) => {
    if (!req.session.user) {
        return res.redirect('/');
    }

    res.sendFile(path.join(__dirname, 'public', 'icecream.html'));
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Debug Route (Optional)
app.get('/all-users', async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (err) {
        res.status(500).send('❌ Failed to fetch users.');
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
