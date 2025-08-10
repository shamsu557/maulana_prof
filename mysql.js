const mysql = require('mysql');

// MySQL database connection configuration
const dbConfig = {
    host: process.env.DB_HOST || 'mysql-shamsu557.alwaysdata.net',  // Use environment variable or default
    port: process.env.DB_PORT || 3306,                       // Default MySQL port or environment variable
    user: process.env.DB_USER || 'shamsu557',               // MySQL username from environment
    password: process.env.DB_PASSWORD || '@Shamsu1440',       // MySQL password from environment
    database: process.env.DB_NAME || 'shamsu557_maula_database'            // Database name from environment
};

// Create MySQL connection
const db = mysql.createConnection(dbConfig);

// Connect to MySQL database
db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL database:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

// Export the database connection
module.exports = db;

// CREATE TABLE books (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     title_english VARCHAR(255) NOT NULL,
//     title_arabic VARCHAR(255) NOT NULL,
//     book_file VARCHAR(255) NOT NULL,
//     book_image VARCHAR(255) NOT NULL,
//     date_added DATETIME NOT NULL
// );


// CREATE TABLE admins (
//     id INT AUTO_INCREMENT PRIMARY KEY, -- Unique ID for each admin
//     username VARCHAR(50) NOT NULL UNIQUE, -- Admin username (must be unique)
//     password VARCHAR(255) NOT NULL,   -- Hashed password for security
//     email VARCHAR(255) NOT NULL UNIQUE, -- Email address (must be unique)
//     fullName VARCHAR(255) NOT NULL,   -- Full name of the admin
//     phone VARCHAR(15),                -- Phone number (optional)
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Record creation time
// );




// CREATE TABLE sessions (
//     id INT AUTO_INCREMENT PRIMARY KEY,         -- Unique identifier for each session
//     user_id INT NOT NULL,                      -- ID of the user associated with the session
//     session_token VARCHAR(255) NOT NULL,       -- Unique session token
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp when the session was created
//     expires_at TIMESTAMP,                      -- Timestamp when the session expires
//     FOREIGN KEY (user_id) REFERENCES users(id) -- Foreign key linking to the users table
// );



// CREATE TABLE audio (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     title_english VARCHAR(255) NOT NULL,
//     title_arabic VARCHAR(255) NOT NULL,
//     audio_file VARCHAR(255) NOT NULL,
//     date_added DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
//     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
// );
