import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeDatabase } from './db.js';
import todosRouter from './routes/todos.js';

const app = express();
const port = Number.parseInt(process.env.PORT, 10) || 3000;

initializeDatabase();

// Core middleware: CORS, JSON parsing, and static asset serving.
app.use(cors());
app.use(express.json());
app.use('/api/todos', todosRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, '..', 'frontend');
app.use(express.static(frontendPath));

app.get('/api/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
