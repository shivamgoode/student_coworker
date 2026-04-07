require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'MindPen AI', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/audio', require('./routes/audioRoutes'));
app.use('/api/notes', require('./routes/notesRoutes'));
app.use('/api/reminders', require('./routes/reminderRoutes'));
app.use('/api/discussions', require('./routes/discussionRoutes'));
app.use('/api/visualizations', require('./routes/visualizationRoutes'));
app.use('/api/timeline', require('./routes/timelineRoutes'));
app.use('/api/translate', require('./routes/translationRoutes'));

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[MindPen AI] Server running on port ${PORT}`);
  console.log(`[MindPen AI] Health: http://localhost:${PORT}/api/health`);
});
