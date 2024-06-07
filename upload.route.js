const express = require('express');
const router = express.Router();
const multer = require('multer');
const app = express();
const path = require('path');

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

router.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  // File uploaded successfully
  const videoUrl = `http://localhost:3000/uploads/${req.file.filename}`;
  return res.status(200).json({ message: 'File uploaded successfully', videoUrl });
});

module.exports = router;