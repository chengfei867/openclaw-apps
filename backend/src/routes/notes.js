const express = require('express');
const { body, param, validationResult } = require('express-validator');
const db = require('../db');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

const baseSelect = `
  SELECT
    notes.id,
    notes.user_id,
    notes.title,
    notes.content,
    notes.is_draft,
    notes.created_at,
    notes.updated_at,
    tags.id AS tag_id,
    tags.name AS tag_name,
    tags.color AS tag_color
  FROM notes
  LEFT JOIN note_tags ON note_tags.note_id = notes.id
  LEFT JOIN tags ON tags.id = note_tags.tag_id
`;

const mapNotesWithTags = (rows) => {
  const notesById = new Map();

  for (const row of rows) {
    let note = notesById.get(row.id);
    if (!note) {
      note = {
        id: row.id,
        user_id: row.user_id,
        title: row.title,
        content: row.content,
        is_draft: row.is_draft,
        created_at: row.created_at,
        updated_at: row.updated_at,
        tags: [],
      };
      notesById.set(row.id, note);
    }

    if (row.tag_id !== null && row.tag_id !== undefined) {
      note.tags.push({
        id: row.tag_id,
        name: row.tag_name,
        color: row.tag_color,
      });
    }
  }

  return Array.from(notesById.values());
};

const fetchNoteById = (noteId, userId) => {
  const rows = db
    .prepare(`${baseSelect} WHERE notes.id = ? AND notes.user_id = ?`)
    .all(noteId, userId);

  const notes = mapNotesWithTags(rows);
  return notes[0] || null;
};

const normalizeTagIds = (tags) => {
  if (!Array.isArray(tags)) {
    return [];
  }

  const ids = tags
    .map((tagId) => Number.parseInt(tagId, 10))
    .filter((tagId) => Number.isInteger(tagId));

  return Array.from(new Set(ids));
};

const ensureTagsExist = (userId, tagIds) => {
  if (tagIds.length === 0) {
    return true;
  }

  const placeholders = tagIds.map(() => '?').join(', ');
  const rows = db
    .prepare(
      `SELECT id FROM tags WHERE user_id = ? AND id IN (${placeholders})`
    )
    .all(userId, ...tagIds);

  return rows.length === tagIds.length;
};

const createNoteValidators = [
  body('title').optional().isString().withMessage('Title must be a string'),
  body('content')
    .optional()
    .isString()
    .withMessage('Content must be a string'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().isInt({ min: 1 }).withMessage('Invalid tag id'),
];

const updateNoteValidators = [
  param('id').isInt({ min: 1 }).withMessage('Invalid note id'),
  body('title').optional().isString().withMessage('Title must be a string'),
  body('content')
    .optional()
    .isString()
    .withMessage('Content must be a string'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().isInt({ min: 1 }).withMessage('Invalid tag id'),
];

const noteIdParamValidator = [
  param('id').isInt({ min: 1 }).withMessage('Invalid note id'),
];

router.get('/', (req, res, next) => {
  const userId = req.user.id;
  const search =
    typeof req.query.search === 'string' ? req.query.search.trim() : '';
  const tag = typeof req.query.tag === 'string' ? req.query.tag.trim() : '';

  const params = [userId];
  let whereClause = 'notes.user_id = ?';

  if (search) {
    const like = `%${search}%`;
    whereClause += ' AND (notes.title LIKE ? OR notes.content LIKE ?)';
    params.push(like, like);
  }

  if (tag) {
    const numericTag = Number.parseInt(tag, 10);
    let tagFilter = 't.name = ?';
    const tagParams = [tag];

    if (Number.isInteger(numericTag)) {
      tagFilter = '(t.id = ? OR t.name = ?)';
      tagParams.splice(0, tagParams.length, numericTag, tag);
    }

    whereClause += ` AND EXISTS (
      SELECT 1 FROM note_tags nt
      JOIN tags t ON t.id = nt.tag_id
      WHERE nt.note_id = notes.id AND ${tagFilter}
    )`;
    params.push(...tagParams);
  }

  const sql = `${baseSelect} WHERE ${whereClause} ORDER BY notes.updated_at DESC, notes.id DESC`;

  try {
    const rows = db.prepare(sql).all(params);
    const notes = mapNotesWithTags(rows);
    return res.json({ notes });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', noteIdParamValidator, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user.id;
  const noteId = Number.parseInt(req.params.id, 10);

  try {
    const note = fetchNoteById(noteId, userId);
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    return res.json({ note });
  } catch (error) {
    return next(error);
  }
});

router.post('/', createNoteValidators, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user.id;
  const titleInput =
    typeof req.body.title === 'string' ? req.body.title.trim() : '';
  const title = titleInput || 'Untitled';
  const content = typeof req.body.content === 'string' ? req.body.content : '';
  const tagIds = normalizeTagIds(req.body.tags);

  try {
    if (!ensureTagsExist(userId, tagIds)) {
      return res.status(400).json({ error: 'Invalid tags' });
    }

    const insertNote = db.prepare(
      'INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)'
    );
    const insertNoteTag = db.prepare(
      'INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)'
    );

    const createNote = db.transaction(() => {
      const result = insertNote.run(userId, title, content);
      const noteId = Number(result.lastInsertRowid);

      for (const tagId of tagIds) {
        insertNoteTag.run(noteId, tagId);
      }

      return noteId;
    });

    const noteId = createNote();
    const note = fetchNoteById(noteId, userId);

    return res.status(201).json({ note });
  } catch (error) {
    return next(error);
  }
});

router.put('/:id', updateNoteValidators, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user.id;
  const noteId = Number.parseInt(req.params.id, 10);
  const tagIds = normalizeTagIds(req.body.tags);
  const shouldUpdateTags = Array.isArray(req.body.tags);

  try {
    const existing = db
      .prepare('SELECT id, title, content FROM notes WHERE id = ? AND user_id = ?')
      .get(noteId, userId);

    if (!existing) {
      return res.status(404).json({ error: 'Note not found' });
    }

    if (shouldUpdateTags && !ensureTagsExist(userId, tagIds)) {
      return res.status(400).json({ error: 'Invalid tags' });
    }

    const titleInput =
      typeof req.body.title === 'string' ? req.body.title.trim() : undefined;
    const title =
      titleInput === undefined || titleInput === ''
        ? existing.title
        : titleInput;
    const content =
      typeof req.body.content === 'string' ? req.body.content : existing.content;

    const updateNote = db.prepare(
      'UPDATE notes SET title = ?, content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
    );
    const deleteNoteTags = db.prepare(
      'DELETE FROM note_tags WHERE note_id = ?'
    );
    const insertNoteTag = db.prepare(
      'INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)'
    );

    const update = db.transaction(() => {
      updateNote.run(title, content, noteId, userId);

      if (shouldUpdateTags) {
        deleteNoteTags.run(noteId);
        for (const tagId of tagIds) {
          insertNoteTag.run(noteId, tagId);
        }
      }
    });

    update();

    const note = fetchNoteById(noteId, userId);
    return res.json({ note });
  } catch (error) {
    return next(error);
  }
});

router.delete('/:id', noteIdParamValidator, (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const userId = req.user.id;
  const noteId = Number.parseInt(req.params.id, 10);

  try {
    const result = db
      .prepare('DELETE FROM notes WHERE id = ? AND user_id = ?')
      .run(noteId, userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
