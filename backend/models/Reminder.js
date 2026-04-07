const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  task: { type: String, required: true },
  deadline: { type: String },
  deadlineDate: { type: Date },
  eventDate: { type: Date },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  category: { type: String, enum: ['academic', 'event', 'travel', 'meeting', 'personal', 'other'], default: 'other' },
  completed: { type: Boolean, default: false },
  sourceTranscript: { type: String },
  speaker: { type: String },
  date: { type: Date, default: Date.now },
  year: { type: Number },
  month: { type: Number },
  day: { type: Number },
}, { timestamps: true });

reminderSchema.pre('save', function (next) {
  const d = this.date || new Date();
  this.year = d.getFullYear();
  this.month = d.getMonth() + 1;
  this.day = d.getDate();
  next();
});

module.exports = mongoose.model('Reminder', reminderSchema);
