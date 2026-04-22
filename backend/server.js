require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5001;
const HOST = process.env.HOST || '0.0.0.0';

const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const allowCredentials = String(process.env.CORS_ALLOW_CREDENTIALS || 'false').toLowerCase() === 'true';

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: allowCredentials,
}));
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

app.listen(PORT, HOST, () => {
  console.log(`[MindPen AI] Server running on port ${PORT}`);
  console.log(`[MindPen AI] Health: http://localhost:${PORT}/api/health`);
  console.log(`[MindPen AI] Allowed CORS origins: ${allowedOrigins.join(', ')}`);
});
