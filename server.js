const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const uploadRoute = require('./upload.route');
const app = express();
const PORT = process.env.PORT || 3000; // Set your desired port number

// Set up the database and add a user
// Create and open SQLite database connection
const db = new sqlite3.Database('./mydatabase.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the database.');
    // Create the 'users' table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      username TEXT,
      password TEXT
    )`, (err) => {
      if (err) {
        console.error('Error creating table:', err.message);
      } else {
        console.log('Table "users" created successfully.');

        // SQL query to insert user into the database
        const insertQuery = `INSERT INTO users (username, password) VALUES (?, ?)`;

        // Data to be inserted
        const userData = ['test', 'test'];

        // Execute SQL query
        db.run(insertQuery, userData, function(err) {
          if (err) {
            console.error('Error inserting record:', err.message);
          } else {
            console.log(`A row has been inserted with rowid ${this.lastID}`);
          }
        });
      }
    });
  }
});

app.use(cors());
app.use(bodyParser.json());
app.use(uploadRoute);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const selectQuery = `SELECT * FROM users`;

  db.all(selectQuery, (err, rows) => {
    if (err) {
      console.error('Error selecting data:', err.message);
      return res.status(500).send('Error selecting data');
    } else {
      console.log('Data retrieved successfully:', rows);
      for (const row of rows) {
        if (row.username === username && row.password === password) {
          return res.status(201).json({ message: 'Logged in' })
        };
      }
      return res.status(400).json({ message: 'Username or password is incorrect' });
    }
  });
});

app.get('/api/list-of-videos', (req, res) => {
  const folderPath = './uploads';
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return res.status(400).json({ message: 'Error reading folder.' });
    }

    let dictionaryOfFiles = {};
    files.forEach(file => {
      dictionaryOfFiles[file] = `http://localhost:3000/uploads/${file}`;
    });
    res.json(dictionaryOfFiles);
  });
});

//// Example middleware function to log incoming requests
//app.use((req, res, next) => {
//  console.log(`${req.method} ${req.url}`);
//  next();
//});


// Delete table and close database on shutdown
process.on('SIGINT', () => {
  console.log('Stopping server...');
  server.close(() => {
    console.log('Server stopped.');
    // Delete the 'users' table
    db.run(`DROP TABLE IF EXISTS users`, (err) => {
      if (err) {
        console.error('Error deleting table:', err.message);
      } else {
        console.log('Table "users" deleted successfully.');
        // Close the database connection
        db.close((err) => {
          if (err) {
            console.error('Error closing database:', err.message);
          } else {
            console.log('Database connection closed.');
          }
        });
      }
    });
  });
});