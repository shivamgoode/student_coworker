/**
 * Day-Wise Storage Engine
 * Stores all outputs grouped by year/month/day.
 * Handles CRUD for: notes, reminders, discussionOutcomes, visualizations, transcripts.
 */
const Note = require('../models/Note');
const Reminder = require('../models/Reminder');
const DiscussionOutcome = require('../models/DiscussionOutcome');
const Transcript = require('../models/Transcript');
const Visualization = require('../models/Visualization');

function getDateParts(date) {
  const d = date || new Date();
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

function todayQuery() {
  const { year, month, day } = getDateParts(new Date());
  return { year, month, day };
}

// --- Store functions ---

async function storeTranscript(data) {
  return Transcript.create({ ...data, date: new Date() });
}

async function storeNote(data) {
  return Note.create({ ...data, date: new Date() });
}

async function storeReminder(data) {
  return Reminder.create({ ...data, date: new Date() });
}

async function storeDiscussionOutcome(data) {
  return DiscussionOutcome.create({ ...data, date: new Date() });
}

async function storeVisualization(data) {
  return Visualization.create({ ...data, date: new Date() });
}

// --- Fetch functions (day-wise) ---

async function getTodayNotes() {
  return Note.find(todayQuery()).sort({ createdAt: -1 });
}

async function getTodayReminders() {
  return Reminder.find(todayQuery()).sort({ createdAt: -1 });
}

async function getTodayDiscussionOutcomes() {
  return DiscussionOutcome.find(todayQuery()).sort({ createdAt: -1 });
}

async function getTodayTranscripts() {
  return Transcript.find(todayQuery()).sort({ createdAt: -1 });
}

async function getTodayVisualizations() {
  return Visualization.find(todayQuery()).sort({ createdAt: -1 });
}

// --- Fetch by date ---

async function getNotesByDate(year, month, day) {
  return Note.find({ year, month, day }).sort({ createdAt: -1 });
}

async function getRemindersByDate(year, month, day) {
  return Reminder.find({ year, month, day }).sort({ createdAt: -1 });
}

module.exports = {
  storeTranscript,
  storeNote,
  storeReminder,
  storeDiscussionOutcome,
  storeVisualization,
  getTodayNotes,
  getTodayReminders,
  getTodayDiscussionOutcomes,
  getTodayTranscripts,
  getTodayVisualizations,
  getNotesByDate,
  getRemindersByDate,
};
