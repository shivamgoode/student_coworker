const express = require('express');
const { getTodayReminders, getRemindersByDate } = require('../engines/dailyStorageEngine');
const Reminder = require('../models/Reminder');

const router = express.Router();

/** GET /api/reminders/today */
router.get('/today', async (_req, res, next) => {
  try {
    const reminders = await getTodayReminders();
    res.json({ success: true, reminders });
  } catch (error) {
    next(error);
  }
});

/** GET /api/reminders/:year/:month/:day */
router.get('/:year/:month/:day', async (req, res, next) => {
  try {
    const { year, month, day } = req.params;
    const reminders = await getRemindersByDate(+year, +month, +day);
    res.json({ success: true, reminders });
  } catch (error) {
    next(error);
  }
});

/** PATCH /api/reminders/:id/complete — Mark reminder as completed */
router.patch('/:id/complete', async (req, res, next) => {
  try {
    const reminder = await Reminder.findByIdAndUpdate(
      req.params.id,
      { completed: true },
      { new: true }
    );
    if (!reminder) return res.status(404).json({ error: 'Reminder not found' });
    res.json({ success: true, reminder });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
