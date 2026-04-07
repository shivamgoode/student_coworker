const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema({
  time: { type: String, required: true },
  type: {
    type: String,
    enum: ['lecture', 'discussion', 'reminder', 'visualization', 'note', 'flowchart'],
    required: true,
  },
  description: { type: String, required: true },
  referenceId: { type: mongoose.Schema.Types.ObjectId },
  referenceModel: { type: String },
  date: { type: Date, default: Date.now },
  year: { type: Number },
  month: { type: Number },
  day: { type: Number },
}, { timestamps: true });

timelineEventSchema.pre('save', function (next) {
  const d = this.date || new Date();
  this.year = d.getFullYear();
  this.month = d.getMonth() + 1;
  this.day = d.getDate();
  next();
});

module.exports = mongoose.model('TimelineEvent', timelineEventSchema);
