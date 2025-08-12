const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const db = require('./mysql'); // Your MySQL configuration file
const bcrypt = require('bcryptjs');



// Serve static files (HTML, CSS, JS)
router.use(express.static(path.join(__dirname))); // Serving static files

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname); // Ensure this folder exists
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to filename
    }
});

const upload = multer({ storage: storage });

// API to fetch user and resource counts for the admin dashboard
router.get('/stats', (req, res) => {
    const sqlUsersCount = 'SELECT COUNT(*) AS count FROM users';
    const sqlBooksCount = 'SELECT COUNT(*) AS count FROM books';
    const sqlPapersCount = 'SELECT COUNT(*) AS count FROM papers';

    db.query(sqlUsersCount, (err, userResult) => {
        if (err) throw err;

        db.query(sqlBooksCount, (err, booksResult) => {
            if (err) throw err;

            db.query(sqlPapersCount, (err, papersResult) => {
                if (err) throw err;

                res.json({
                    usersCount: userResult[0].count,
                    booksCount: booksResult[0].count,
                    papersCount: papersResult[0].count,
                });
            });
        });
    });
});

// Middleware to check if admin is authenticated
router.get('/is-logged-in', (req, res) => {
    if (req.session.isAdmin) {
        res.json({ isLoggedIn: true });
    } else {
        res.json({ isLoggedIn: false });
    }
});


    router.post(
  '/books',
  upload.fields([
    { name: 'pdf_file' },   // match HTML input name
    { name: 'cover_image' } // match HTML input name
  ]),
  async (req, res) => {
    const { title_english, title_arabic } = req.body;
    const bookFile = req.files['pdf_file'][0].filename;
    const bookImage = req.files['cover_image'][0].filename;
    const dateAdded = new Date();

    const sqlCheckBook = 'SELECT * FROM books WHERE title_english = ? OR title_arabic = ?';
    db.query(sqlCheckBook, [title_english, title_arabic], (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        return res.status(400).json({ message: 'Book with this title already exists' });
      }

      const sqlInsertBook = `
        INSERT INTO books (title_english, title_arabic, book_file, book_image, date_added)
        VALUES (?, ?, ?, ?, ?)
      `;
      db.query(sqlInsertBook, [title_english, title_arabic, bookFile, bookImage, dateAdded], (err) => {
        if (err) throw err;
        res.status(201).json({ message: 'Book added successfully!' });
      });
    });
  }
);



// DELETE book by ID
router.delete('/books/:id', async (req, res) => {
  const bookId = req.params.id;

  // First get the file names so we can delete them from disk
  const sqlGetFiles = 'SELECT book_file, book_image FROM books WHERE id = ?';
  db.query(sqlGetFiles, [bookId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.length === 0) return res.status(404).json({ error: 'Book not found' });

    const { book_file, book_image } = result[0];

    // Delete the DB record
    const sqlDeleteBook = 'DELETE FROM books WHERE id = ?';
    db.query(sqlDeleteBook, [bookId], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to delete book' });

      // Optionally delete files from uploads folder
      const fs = require('fs');
      const path = require('path');

      try {
        if (book_file) fs.unlinkSync(path.join(__dirname, '../uploads', book_file));
        if (book_image) fs.unlinkSync(path.join(__dirname, '../uploads', book_image));
      } catch (fileErr) {
        console.warn('Error deleting files:', fileErr.message);
      }

      res.json({ message: 'Book deleted successfully' });
    });
  });
});


// ADD audio
router.post(
  '/audio',
  upload.fields([
    { name: 'audio_file' } // match HTML input name
  ]),
  async (req, res) => {
    const { title_english, title_arabic } = req.body;
    const audioFile = req.files['audio_file'][0].filename;
    const dateAdded = new Date();

    const sqlCheckAudio = 'SELECT * FROM audio WHERE title_english = ? OR title_arabic = ?';
    db.query(sqlCheckAudio, [title_english, title_arabic], (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        return res.status(400).json({ message: 'Audio with this title already exists' });
      }

      const sqlInsertAudio = `
        INSERT INTO audio (title_english, title_arabic, audio_file, date_added)
        VALUES (?, ?, ?, ?)
      `;
      db.query(sqlInsertAudio, [title_english, title_arabic, audioFile, dateAdded], (err) => {
        if (err) throw err;
        res.status(201).json({ message: 'Audio added successfully!' });
      });
    });
  }
);

// DELETE audio by ID
router.delete('/audio/:id', async (req, res) => {
  const audioId = req.params.id;

  // Get file name to delete from disk
  const sqlGetFile = 'SELECT audio_file FROM audio WHERE id = ?';
  db.query(sqlGetFile, [audioId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.length === 0) return res.status(404).json({ error: 'Audio not found' });

    const { audio_file } = result[0];

    // Delete DB record
    const sqlDeleteAudio = 'DELETE FROM audio WHERE id = ?';
    db.query(sqlDeleteAudio, [audioId], (err) => {
      if (err) return res.status(500).json({ error: 'Failed to delete audio' });

      // Optionally delete file from uploads folder
      const fs = require('fs');
      const path = require('path');

      try {
        if (audio_file) fs.unlinkSync(path.join(__dirname, '../uploads', audio_file));
      } catch (fileErr) {
        console.warn('Error deleting audio file:', fileErr.message);
      }

      res.json({ message: 'Audio deleted successfully' });
    });
  });
});

// GET all videos
router.get('/videos', (req, res) => {
  const sqlGetVideos = 'SELECT * FROM videos ORDER BY created_at DESC';
  
  db.query(sqlGetVideos, (err, results) => {
    if (err) {
      console.error('SQL error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

// ADD video
router.post('/videos', (req, res) => {
  const { title_english, title_arabic, video_url } = req.body;

  if (!title_english || !title_arabic || !video_url) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Check if video already exists by English or Arabic title
  const sqlCheckVideo = 'SELECT * FROM videos WHERE title_english = ? OR title_arabic = ?';
  db.query(sqlCheckVideo, [title_english, title_arabic], (err, result) => {
    if (err) {
      console.error('SQL error:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    if (result.length > 0) {
      return res.status(400).json({ error: 'Video with this title already exists' });
    }

    // Insert new video record
    const sqlInsertVideo = `
      INSERT INTO videos (title_english, title_arabic, video_url, date_added, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
    `;
    db.query(sqlInsertVideo, [title_english, title_arabic, video_url], (err) => {
      if (err) {
        console.error('SQL insert error:', err);
        return res.status(500).json({ error: 'Failed to add video' });
      }
      res.status(201).json({ message: 'Video added successfully!' });
    });
  });
});
// DELETE video by ID
router.delete('/videos/:id', (req, res) => {
  const videoId = req.params.id;

  // Check if video exists first
  const sqlCheckVideo = 'SELECT * FROM videos WHERE id = ?';
  db.query(sqlCheckVideo, [videoId], (err, result) => {
    if (err) {
      console.error('SQL error on check:', err);
      return res.status(500).json({ error: 'Database error' });
    }

    if (result.length === 0) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Delete video record
    const sqlDeleteVideo = 'DELETE FROM videos WHERE id = ?';
    db.query(sqlDeleteVideo, [videoId], (err) => {
      if (err) {
        console.error('SQL error on delete:', err);
        return res.status(500).json({ error: 'Failed to delete video' });
      }
      res.json({ message: 'Video deleted successfully' });
    });
  });
});

// ======================
// GET all messages
// ======================
router.get('/messages', (req, res) => {
    const sql = 'SELECT * FROM messages ORDER BY created_at DESC';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching messages:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(results);
    });
});

// ======================
// DELETE - Remove message
// ======================
router.delete('/messages/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM messages WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting message:', err);
            return res.status(500).json({ error: 'Database error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Message not found' });
        }
        res.json({ success: true });
    });
});

module.exports = router;
