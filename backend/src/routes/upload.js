const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

const uploadDir = path.resolve(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const safeName = path
      .basename(file.originalname)
      .replace(/[^a-zA-Z0-9._-]/g, '_');
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + safeName);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.md') {
      return cb(null, false);
    }
    return cb(null, true);
  },
});

const insertNote = db.prepare(
  'INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)'
);
const getNoteById = db.prepare(
  'SELECT id, user_id, title, content, is_draft, created_at, updated_at FROM notes WHERE id = ? AND user_id = ?'
);

router.post('/md', auth, upload.single('file'), async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No .md file uploaded' });
  }

  try {
    const content = await fs.promises.readFile(req.file.path, 'utf8');
    const baseName = path.parse(req.file.originalname).name || 'Untitled';
    const result = insertNote.run(req.user.id, baseName, content);
    const noteId = Number(result.lastInsertRowid);
    const note = getNoteById.get(noteId, req.user.id);
    return res.status(201).json(note);
  } catch (error) {
    return next(error);
  } finally {
    fs.promises.unlink(req.file.path).catch(() => {});
  }
});

module.exports = router;
