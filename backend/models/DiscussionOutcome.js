const mongoose = require('mongoose');

const discussionOutcomeSchema = new mongoose.Schema({
  task: { type: String, required: true },
  deadline: { type: String },
  participants: [{ type: String }],
  decisions: [{ type: String }],
  actionItems: [{ type: String }],
  sourceTranscript: { type: String },
  date: { type: Date, default: Date.now },
  year: { type: Number },
  month: { type: Number },
  day: { type: Number },
}, { timestamps: true });

discussionOutcomeSchema.pre('save', function (next) {
  const d = this.date || new Date();
  this.year = d.getFullYear();
  this.month = d.getMonth() + 1;
  this.day = d.getDate();
  next();
});

module.exports = mongoose.model('DiscussionOutcome', discussionOutcomeSchema);
