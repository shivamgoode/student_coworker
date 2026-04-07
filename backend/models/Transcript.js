const mongoose = require('mongoose');

const transcriptSchema = new mongoose.Schema({
  text: { type: String, required: true },
  speaker: { type: String },
  classification: {
    type: String,
    enum: ['lecture', 'discussion', 'reminder', 'concept', 'casual', 'ignore'],
  },
  importance: { type: Number, min: 0, max: 10 },
  audioChunkId: { type: String },
  date: { type: Date, default: Date.now },
  year: { type: Number },
  month: { type: Number },
  day: { type: Number },
}, { timestamps: true });

transcriptSchema.pre('save', function (next) {
  const d = this.date || new Date();
  this.year = d.getFullYear();
  this.month = d.getMonth() + 1;
  this.day = d.getDate();
  next();
});

module.exports = mongoose.model('Transcript', transcriptSchema);
