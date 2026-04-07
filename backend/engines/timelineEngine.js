/**
 * Timeline Engine
 * Generates and retrieves daily learning timeline summaries.
 * Tracks all events: lectures, discussions, reminders, visualizations.
 */
const TimelineEvent = require('../models/TimelineEvent');

function todayQuery() {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

/**
 * Add a new timeline event.
 * @param {{ time: string, type: string, description: string, referenceId?: string, referenceModel?: string }} event
 */
async function addTimelineEvent(event) {
  return TimelineEvent.create({ ...event, date: new Date() });
}

/**
 * Get today's full timeline.
 * @returns {Array} timeline events sorted chronologically
 */
async function getTodayTimeline() {
  return TimelineEvent.find(todayQuery()).sort({ createdAt: 1 });
}

/**
 * Get timeline for a specific date.
 */
async function getTimelineByDate(year, month, day) {
  return TimelineEvent.find({ year, month, day }).sort({ createdAt: 1 });
}

/**
 * Generate a formatted timeline summary string.
 * @returns {string} human-readable timeline
 */
async function generateTimelineSummary() {
  const events = await getTodayTimeline();
  if (events.length === 0) return 'No events recorded today.';

  return events
    .map(e => `${e.time} — ${e.type}: ${e.description}`)
    .join('\n');
}

module.exports = { addTimelineEvent, getTodayTimeline, getTimelineByDate, generateTimelineSummary };
