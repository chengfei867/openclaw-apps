const path = require('path');
const express = require('express');
const cors = require('cors');
const { PORT } = require('./config');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth');

require('./db');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const staticPath = path.resolve(__dirname, '..', '..', 'static');
app.use(express.static(staticPath));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log('Server listening on port ' + PORT);
});
