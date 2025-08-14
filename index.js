const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const db = require('./mysql'); // Ensure mysql.js is configured correctly
const adminRoutes = require('./admin-routes');
const fs = require('fs');
const nodemailer = require("nodemailer");
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
  res.sendFile(path.join(__dirname, 'creation.html'));
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

// Nodemailer transporter configuration for Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: '1440shamsusabo@gmail.com',
    pass: 'cdwx syjc vctw jzmz',  // Use an App Password or OAuth2 token, NOT your Gmail login password
  },
});

// Contact form submission route
app.post("/send-message", (req, res) => {
  const { name, email, phone, category, subject, message } = req.body;

  if (!name || !email || !message || !category) {
    return res.status(400).json({ error: "Please fill all required fields." });
  }

  // Insert data into messages table
  const insertQuery = `
    INSERT INTO messages (name, email, phone, category, subject, message, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, 'new', NOW(), NOW())
  `;

  db.query(insertQuery, [name, email, phone, category, subject, message], (err, results) => {
    if (err) {
      console.error("Error inserting message into database:", err);
      return res.status(500).json({ error: "Failed to save your message. Please try again later." });
    }

    // Prepare email options
    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: "1440shamsusabo@gmail.com",
      subject: subject || `Message from ${name} via Contact Form`,
      text: `
You have a new message from your website contact form:

Name: ${name}
Email: ${email}
Phone: ${phone || "N/A"}
Category: ${category}
Subject: ${subject || "N/A"}
Message:
${message}
      `,
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "Message saved but failed to send email notification." });
      }
      console.log("Email sent: " + info.response);
      res.status(200).json({ message: "Your message has been sent successfully and saved." });
    });
  });
});
;

// API Endpoint to fetch books for current app
app.get('/api/books', (req, res) => {
  const query = `
    SELECT 
      id, 
      title_english, 
      title_arabic, 
      book_file AS pdf_file, 
      book_image AS cover_image 
    FROM books
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching books:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

// View PDF or other file in browser
app.get('/view/:fileName', (req, res) => {
  const filePath = path.join(__dirname, req.params.fileName); // direct in project root

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).send('File not found');
    res.sendFile(filePath);
  });
});

// Download file
app.get('/files/:fileName', (req, res) => {
  const filePath = path.join(__dirname, req.params.fileName); // direct in project root

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) return res.status(404).send('File not found');
    res.download(filePath);
  });
});


// Fetch all audio
app.get('/api/audio', (req, res) => {
  const query = `
    SELECT 
      id, 
      title_english, 
      title_arabic, 
      audio_file, 
      section,
      section_arabic,
      date_added,
      updated_at
    FROM audio
    ORDER BY date_added DESC
  `;
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching audio:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    res.json(results);
  });
});

// Stream audio
app.get('/audio/:fileName', (req, res) => {
  const filePath = path.join(__dirname, req.params.fileName);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
  res.sendFile(filePath);
});

// Download audio
app.get('/download/audio/:fileName', (req, res) => {
  const filePath = path.join(__dirname, req.params.fileName);
  if (!fs.existsSync(filePath)) return res.status(404).send('File not found');
  res.download(filePath);
});

// Fetch all videos
app.get('/api/videos', (req, res) => {
  const query = `
    SELECT 
      id, 
      title_english, 
      title_arabic, 
      date_added,
      video_url,
      updated_at
    FROM videos
    ORDER BY date_added DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error('Error fetching videos:', err);
      return res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
    res.json(results);
  });
});

// Stream video (for local files)
app.get('/videos/:fileName', (req, res) => {
  const filePath = path.join(__dirname, 'videos', req.params.fileName);
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return res.status(404).json({ error: 'File not found' });
  }
  res.sendFile(filePath);
});

//book counts
app.get('/api/books', (req, res) => {
  db.query('SELECT * FROM books', (err, results) => {
    if (err) return res.status(500).json([]);
    res.json(results);
  });
});

//audio counts
app.get('/api/audio', (req, res) => {
  db.query('SELECT * FROM audio', (err, results) => {
    if (err) return res.status(500).json([]);
    res.json(results);
  });
});
//video counts
app.get('/api/videos', (req, res) => {
  db.query('SELECT * FROM videos', (err, results) => {
    if (err) return res.status(500).json([]);
    res.json(results);
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
app.use('/api/admin', adminRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});