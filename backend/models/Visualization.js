const mongoose = require('mongoose');

const visualizationSchema = new mongoose.Schema({
  concept: { type: String, required: true },
  title: { type: String },
  type: { type: String, required: true },
  scene: { type: String },
  keywords: [{ type: String }],
  flowchartData: {
    steps: [{ type: String }],
    nodes: [{
      id: { type: String },
      label: { type: String },
      type: { type: String },
    }],
    edges: [{
      source: { type: String },
      target: { type: String },
      label: { type: String },
    }],
  },
  threejsConfig: {
    scene: { type: String },
    objects: [{ type: mongoose.Schema.Types.Mixed }],
  },
  isLectureFlowchart: { type: Boolean, default: false },
  speaker: { type: String },
  sourceTranscript: { type: String },
  date: { type: Date, default: Date.now },
  year: { type: Number },
  month: { type: Number },
  day: { type: Number },
}, { timestamps: true });

visualizationSchema.pre('save', function (next) {
  const d = this.date || new Date();
  this.year = d.getFullYear();
  this.month = d.getMonth() + 1;
  this.day = d.getDate();
  next();
});

module.exports = mongoose.model('Visualization', visualizationSchema);
