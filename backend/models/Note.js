const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  definition: { type: String },
  detailedExplanation: { type: String },
  subtopics: [{
    name: { type: String },
    explanation: { type: String },
    keyPoints: [{ type: String }],
  }],
  bulletPoints: [{ type: String }],
  keyTerms: [{
    term: { type: String },
    meaning: { type: String },
  }],
  examples: [{ type: String }],
  applications: [{ type: String }],
  examQuestions: [{ type: String }],
  revisionSummary: { type: String },
  explanation: {
    beginner: { type: String },
    intermediate: { type: String },
    examReady: { type: String },
  },
  isComprehensive: { type: Boolean, default: false },
  sourceTranscript: { type: String },
  speaker: { type: String },
  language: { type: String, default: 'en' },
  date: { type: Date, default: Date.now },
  year: { type: Number },
  month: { type: Number },
  day: { type: Number },
}, { timestamps: true });

noteSchema.pre('save', function (next) {
  const d = this.date || new Date();
  this.year = d.getFullYear();
  this.month = d.getMonth() + 1;
  this.day = d.getDate();
  next();
});

module.exports = mongoose.model('Note', noteSchema);
