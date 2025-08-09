const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const db = require('./mysql'); // Ensure mysql.js is configured correctly
const adminRoutes = require('./admin-routes');
const fs = require('fs');

const app = express();
const saltRounds = 10; // bcrypt salt rounds

// Session setup
app.use(session({
  secret: 'YBdLcGmLbdsYrw9S4PNnaCW3SuHhZ6M0',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    httpOnly: true,
    maxAge: 60 * 60 * 1000 // 1 hour
  }
}));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Disable caching for sensitive pages
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/login');
}

// Check if admin is authenticated
function isAdminAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect('/adminLogin');
}

// Serve static files
app.use(express.static(path.join(__dirname)));

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// User login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// Admin creation login (hardcoded access)
app.post('/admin-creation-login', (req, res) => {
  const { username, password } = req.body;

  if (username === 'SuperAdmin' && password === 'security') {
    return res.json({ success: true, message: 'Login successful! You can now create a new admin.' });
  } else {
    return res.json({ success: false, message: 'Invalid credentials! You do not have permission to create admins.' });
  }
});

// Admin signup page
app.get('/creation', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-signup.html'));
});

// Handle admin signup
app.post('/creation', (req, res) => {
  const { username, password, email, fullName, phone } = req.body;

  db.query('SELECT email FROM admins WHERE email = ?', [email], (err, results) => {
    if (err) {
      console.error('Error querying database for signup:', err);
      return res.status(500).json({ success: false, message: 'Server error' });
    }

    if (results.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    } 

    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
      if (err) {
        console.error('Error hashing password:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
      }

      db.query(
        'INSERT INTO admins (username, password, email, fullName, phone) VALUES (?, ?, ?, ?, ?)', 
        [username, hashedPassword, email, fullName, phone],
        (err) => {
          if (err) {
            console.error('Error inserting admin into database:', err);
            return res.status(500).json({ success: false, message: 'Server error' });
          }
          res.json({ success: true, message: 'Admin created successfully! They can now access the dashboard.', redirectUrl: '/adminLogin' });
        }
      );
    });
  });
});

// Admin dashboard (protected)
app.get('/admin-dashboard.html', isAdminAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-dashboard.html'));
});

// Auth check
app.get('/auth-check', (req, res) => {
  if (req.session.user) {
    res.json({ authenticated: true, userType: 'admin' });
  } else {
    res.json({ authenticated: false });
  }
});

// Admin login page
app.get('/adminLogin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-login.html'));
});

// Handle admin login
app.post('/adminLogin', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM admins WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error('Error querying database for admin login:', err);
      return res.status(500).send('Server error');
    }

    if (results.length === 0) {
      return res.status(400).send('No admin found');
    }

    const user = results[0];
    if (bcrypt.compareSync(password, user.password)) {
      req.session.user = user;
      res.redirect('/admin-dashboard.html');
    } else {
      res.status(400).send('Incorrect password');
    }
  });
});

// Admin logout
app.get('/adminLogout', (req, res) => {
  req.session.destroy((err) => {
    if (err) throw err;
    res.redirect('/index.html');
  });
});

// Use admin routes
app.use('/admin', adminRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
