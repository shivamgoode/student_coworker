const express = require('express');
const { getTodayDiscussionOutcomes } = require('../engines/dailyStorageEngine');

const router = express.Router();

/** GET /api/discussions/today */
router.get('/today', async (_req, res, next) => {
  try {
    const outcomes = await getTodayDiscussionOutcomes();
    res.json({ success: true, outcomes });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
