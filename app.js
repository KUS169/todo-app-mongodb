console.log('📦 app.js file is running...');
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');

const User = require('./models/User');
const Todo = require('./models/Todo');

const app = express();

// ====== MongoDB connection ======
mongoose
  .connect('mongodb://127.0.0.1:27017/todo_app', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('MongoDB error', err));

// ====== Middleware ======
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: 'supersecretkey', // change for real app
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
  })
);

// Serve static files from /public
app.use(express.static(path.join(__dirname, 'public')));

// ====== Auth middleware ======
function requireLogin(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not logged in' });
  }
  next();
}

// ====== ROUTES ======

// Default route: show login/register page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Protected todo page
app.get('/todo', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, 'public', 'todo.html'));
});

// ----- Auth: Register -----
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.json({ success: false, message: 'Username and password required' });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.json({ success: false, message: 'Username already exists' });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      passwordHash: hash
    });

    await user.save();

    res.json({ success: true, message: 'Registered successfully' });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Error registering' });
  }
});

// ----- Auth: Login -----
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.json({ success: false, message: 'Invalid username or password' });
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      return res.json({ success: false, message: 'Invalid username or password' });
    }

    // Save userId in session
    req.session.userId = user._id;

    res.json({ success: true, message: 'Login successful' });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Error logging in' });
  }
});

// ----- Auth: Logout -----
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.json({ success: false, message: 'Error logging out' });
    }
    res.json({ success: true, message: 'Logged out' });
  });
});

// ----- TODOS API -----
// Get all todos for logged in user
app.get('/api/todos', requireLogin, async (req, res) => {
  try {
    const todos = await Todo.find({ userId: req.session.userId }).sort({ _id: -1 });
    res.json({ success: true, todos });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Error fetching todos' });
  }
});

// Add a todo
app.post('/api/todos/add', requireLogin, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.json({ success: false, message: 'Text required' });
    }

    const todo = new Todo({
      userId: req.session.userId,
      text
    });

    await todo.save();
    res.json({ success: true, todo });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Error adding todo' });
  }
});

// Delete a todo
app.post('/api/todos/delete', requireLogin, async (req, res) => {
  try {
    const { id } = req.body;
    await Todo.deleteOne({ _id: id, userId: req.session.userId });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.json({ success: false, message: 'Error deleting todo' });
  }
});

// ====== Start server ======
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
