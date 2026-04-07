const express = require('express');
const multer = require('multer');
const path = require('path');
const { processAudioChunk, finalizeActiveLecture, UPLOAD_DIR } = require('../engines/audioCaptureEngine');

const router = express.Router();

const storage = multer.diskStorage({
  destination: UPLOAD_DIR,
  filename: (_req, file, cb) => {
    cb(null, `chunk_${Date.now()}${path.extname(file.originalname) || '.webm'}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

/**
 * POST /api/audio/upload
 * Receives an audio chunk and runs the full processing pipeline.
 */
router.post('/upload', upload.single('audio'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No audio file provided' });
    }

    console.log(`[Audio] Received chunk: ${req.file.filename}`);
    const results = await processAudioChunk(req.file.path);
    res.json({ success: true, results });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/audio/finalize
 * Called when the user stops recording. Finalizes any active lecture session
 * and processes the full accumulated transcript into comprehensive notes.
 */
router.post('/finalize', async (req, res, next) => {
  try {
    console.log('[Audio] Finalize request — checking for active lecture session');
    const result = await finalizeActiveLecture();
    if (result) {
      res.json({ success: true, lectureFinalized: true, results: result });
    } else {
      res.json({ success: true, lectureFinalized: false, message: 'No active lecture session to finalize' });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;
