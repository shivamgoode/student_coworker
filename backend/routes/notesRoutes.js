const express = require('express');
const { getTodayNotes, getNotesByDate } = require('../engines/dailyStorageEngine');
const { generateNotes } = require('../engines/notesGenerationEngine');
const { generateExplanation } = require('../engines/explanationEngine');

const router = express.Router();

/** GET /api/notes/today — Get today's notes */
router.get('/today', async (_req, res, next) => {
  try {
    const notes = await getTodayNotes();
    res.json({ success: true, notes });
  } catch (error) {
    next(error);
  }
});

/** GET /api/notes/:year/:month/:day — Get notes by date */
router.get('/:year/:month/:day', async (req, res, next) => {
  try {
    const { year, month, day } = req.params;
    const notes = await getNotesByDate(+year, +month, +day);
    res.json({ success: true, notes });
  } catch (error) {
    next(error);
  }
});

/** POST /api/notes/generate — Manually generate notes from text */
router.post('/generate', async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const notes = await generateNotes(text);
    res.json({ success: true, notes });
  } catch (error) {
    next(error);
  }
});

/** POST /api/notes/explain — Generate multi-level explanation */
router.post('/explain', async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const explanation = await generateExplanation(text);
    res.json({ success: true, explanation });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
