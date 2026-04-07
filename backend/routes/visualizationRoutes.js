const express = require('express');
const { getTodayVisualizations } = require('../engines/dailyStorageEngine');
const { generateFlowchart } = require('../engines/flowchartEngine');
const { detectVisualization } = require('../engines/visualizationTriggerEngine');

const router = express.Router();

/** GET /api/visualizations/today */
router.get('/today', async (_req, res, next) => {
  try {
    const visualizations = await getTodayVisualizations();
    res.json({ success: true, visualizations });
  } catch (error) {
    next(error);
  }
});

/** POST /api/visualizations/flowchart — Generate flowchart from text */
router.post('/flowchart', async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const flowchart = await generateFlowchart(text);
    res.json({ success: true, flowchart });
  } catch (error) {
    next(error);
  }
});

/** POST /api/visualizations/detect — Check if text needs visualization */
router.post('/detect', async (req, res, next) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const result = await detectVisualization(text);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
