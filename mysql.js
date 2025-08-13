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
//     section VARCHAR(255) NOT NULL DEFAULT
//     section_arabic VARCHAR(255);
//     audio_file VARCHAR(255) NOT NULL,
//     date_added DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
//     updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
// );
//        UPDATE audio SET section_arabic = CASE section
//   WHEN 'Sahihul Bukhari' THEN 'صحيح البخاري'
//   WHEN 'Sahihul Bukhari (Bita Tare Da Malamai)' THEN 'صحيح البخاري (بيت التاريخ مع المعلمين)'
//   WHEN 'Sahihul Muslim' THEN 'صحيح مسلم'
//   WHEN 'Muwadda Malik' THEN 'مواضع مالك'
//   WHEN 'Attajul Jamiu Lil usul' THEN 'التاج الجامع للأصول'
//   WHEN 'Bulughul Maram' THEN 'بلوغ المرام'
//   WHEN 'Ihya''u Ulumiddeen' THEN 'إحياء علوم الدين'
//   WHEN 'Jam''ul Jawami''i Fi Ilmi Usulil Fiqh' THEN 'جامع الجوامع في علم أصول الفقه'
//   WHEN 'Lectures' THEN 'محاضرات'
//   WHEN 'Discussions' THEN 'مناقشات'
//   WHEN 'Majlisi' THEN 'مجلسي'
//   WHEN 'Questions & Answers 2013' THEN 'أسئلة وأجوبة 2013'
//   WHEN 'Questions & Answers 2014' THEN 'أسئلة وأجوبة 2014'
//   WHEN 'Questions & Answers 2015' THEN 'أسئلة وأجوبة 2015'
//   WHEN 'Questions & Answers 2016' THEN 'أسئلة وأجوبة 2016'
//   WHEN 'Questions & Answers 2017' THEN 'أسئلة وأجوبة 2017'
//   WHEN 'Questions & Answers 2018' THEN 'أسئلة وأجوبة 2018'
//   WHEN 'Questions & Answers 2019' THEN 'أسئلة وأجوبة 2019'
//   WHEN 'Tafseer 2013' THEN 'تفسير 2013'
//   WHEN 'Tafseer 2014' THEN 'تفسير 2014'
//   WHEN 'Tafseer 2015' THEN 'تفسير 2015'
//   WHEN 'Tafseer 2016' THEN 'تفسير 2016'
//   WHEN 'Tafseer 2017' THEN 'تفسير 2017'
//   WHEN 'Tafseer 2018' THEN 'تفسير 2018'
//   WHEN 'Tafseer 2019' THEN 'تفسير 2019'
//   WHEN 'Tafseer 2020' THEN 'تفسير 2020'
//   WHEN 'Tafseer 2021' THEN 'تفسير 2021'
//   WHEN 'Tafseer 2022' THEN 'تفسير 2022'
//   WHEN 'Tafseer 2023' THEN 'تفسير 2023'
//   WHEN 'Tafseer 2024' THEN 'تفسير 2024'
//   WHEN 'Tafseer 2025' THEN 'تفسير 2025'
//   ELSE section
// END;
// CREATE TABLE videos (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     title_english VARCHAR(255) NOT NULL,
//     title_arabic VARCHAR(255) NOT NULL,
  
//     video_url VARCHAR(500) NOT NULL,
   
//     date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
// );
// CREATE TABLE messages (
//     id INT AUTO_INCREMENT PRIMARY KEY,
//     name VARCHAR(100) NOT NULL,
//     email VARCHAR(150) NOT NULL,
//     phone VARCHAR(20),
//     category VARCHAR(100),
//     subject VARCHAR(200),
//     message TEXT NOT NULL,
//     status VARCHAR(20) DEFAULT 'Untreated',
//     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
// );