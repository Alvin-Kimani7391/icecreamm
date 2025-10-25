require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const session = require('express-session');
const path = require('path');
const User = require('./models/user');
const crypto=require(`crypto`);
const nodemailer = require('nodemailer');

const resetTokens=new Map();

const app = express();
const PORT = process.env.PORT || 3000;

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

//introduction page
app.get('/',(req, res) =>{
    res.sendFile(path.join(__dirname, 'public','index.html'));
});
// Login Page
app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','login.html'));
});
// Registration Page
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/forgot-password',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','forgot-password.html'));
});

app.get('/reset-password/:token', (req, res) => {
    const token = req.params.token;
    if (!resetTokens.has(token)) {
        return res.send('❌ Invalid or expired token.');
    }

    // Serve a simple HTML reset form
    res.send(`
        <html>
            <head><title>Reset Password</title></head>
            <body style="font-family: Arial; text-align:center; margin-top:50px;">
                <h2>Reset Password</h2>
                <form action="/reset-password/${token}" method="POST">
                    <input type="password" name="password" placeholder="New Password" required /><br><br>
                    <button type="submit">Update Password</button>
                </form>
            </body>
        </html>
    `);
});

// Handle Login
app.post('/login', async (req, res) => {
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

//handle forgot password
app.post('/forgot-password', async (req, res) => {
    const { username } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.send('❌ No account found with that username.');
        }

        // Generate reset token
        const token = crypto.randomBytes(20).toString('hex');
        resetTokens.set(token, user.username);

        const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;


        // Create transporter
        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Compose email
        const mailOptions = {
            from: `"ICE CREAM DELIGHTS" <${process.env.EMAIL_USER}>`,
            to: user.username, // assuming username is the user's email
            subject: 'Password Reset Request',
            html: `
                <h3>Password Reset</h3>
                <p>You requested a password reset. Click the link below to reset your password:</p>
                <a href="${resetLink}">${resetLink}</a>
                <p>This link will expire after some time or after one use.</p>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);

        console.log(`📧 Password reset email sent to: ${user.username}`);
        res.send('✅ Password reset link has been sent to your email.');
    } catch (err) {
        console.error(err);
        res.status(500).send('❌ Error processing reset request.');
    }
});

// Handle Password Reset Submission
app.post('/reset-password/:token', async (req, res) => {
    const token = req.params.token;
    const newPassword = req.body.password;

    const username = resetTokens.get(token);
    if (!username) {
        return res.send('❌ Invalid or expired token.');
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.findOneAndUpdate({ username }, { password: hashedPassword });
        resetTokens.delete(token);

        res.send('✅ Password has been successfully reset. <a href="/login">Login now</a>.');
    } catch (err) {
        console.error(err);
        res.status(500).send('❌ Error resetting password.');
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
