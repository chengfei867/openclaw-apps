const express = require('express');
const { body, param, validationResult } = require('express-validator');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

const listTags = db.prepare(
  'SELECT id, name, color FROM tags WHERE user_id = ? ORDER BY name COLLATE NOCASE'
);
const insertTag = db.prepare(
  'INSERT INTO tags (user_id, name, color) VALUES (?, ?, ?)'
);
const getTagById = db.prepare(
  'SELECT id, name, color FROM tags WHERE id = ? AND user_id = ?'
);
const deleteTag = db.prepare('DELETE FROM tags WHERE id = ? AND user_id = ?');

const tagValidators = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('color')
    .optional({ values: 'falsy' })
    .isHexColor()
    .withMessage('Color must be a hex color'),
];

const idValidators = [
  param('id').isInt({ min: 1 }).toInt().withMessage('Invalid tag id'),
];

router.get('/', auth, (req, res, next) => {
  try {
    const tags = listTags.all(req.user.id);
    return res.json(tags);
  } catch (error) {
    return next(error);
  }
});

router.post('/', auth, tagValidators, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const name = req.body.name.trim();
  const color = req.body.color ? req.body.color.trim() : '#6366f1';

  try {
    const result = insertTag.run(req.user.id, name, color);
    const tagId = Number(result.lastInsertRowid);
    const tag = getTagById.get(tagId, req.user.id);
    return res.status(201).json(tag);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'Tag already exists' });
    }
    return next(error);
  }
});

router.delete('/:id', auth, idValidators, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const tagId = req.params.id;

  try {
    const tag = getTagById.get(tagId, req.user.id);
    if (!tag) {
      return res.status(404).json({ error: 'Tag not found' });
    }

    deleteTag.run(tagId, req.user.id);
    return res.json({ success: true });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
