const express = require('express');
const { getTodayTimeline, getTimelineByDate, generateTimelineSummary } = require('../engines/timelineEngine');

const router = express.Router();

/** GET /api/timeline/today */
router.get('/today', async (_req, res, next) => {
  try {
    const events = await getTodayTimeline();
    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
});

/** GET /api/timeline/summary — Formatted timeline summary */
router.get('/summary', async (_req, res, next) => {
  try {
    const summary = await generateTimelineSummary();
    res.json({ success: true, summary });
  } catch (error) {
    next(error);
  }
});

/** GET /api/timeline/:year/:month/:day */
router.get('/:year/:month/:day', async (req, res, next) => {
  try {
    const { year, month, day } = req.params;
    const events = await getTimelineByDate(+year, +month, +day);
    res.json({ success: true, events });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
