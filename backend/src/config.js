const PORT = Number.parseInt(process.env.PORT, 10) || 3030;
const JWT_SECRET = process.env.JWT_SECRET || 'md-note-secret-key';
const DB_PATH = process.env.DB_PATH || './data/notes.db';

module.exports = {
  PORT,
  JWT_SECRET,
  DB_PATH,
};
