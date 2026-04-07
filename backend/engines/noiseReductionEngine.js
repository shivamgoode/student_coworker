/**
 * Noise Reduction Engine
 * Lightweight classroom noise filtering before speech processing.
 * MVP: passes audio through with metadata tagging.
 * Production: integrate with a DSP library (e.g., sox, ffmpeg filters).
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Apply basic noise reduction using ffmpeg (if available).
 * Falls back to passthrough if ffmpeg is not installed.
 * @param {string} inputPath - path to raw audio file
 * @returns {string} path to cleaned audio file
 */
async function reduceNoise(inputPath) {
  const dir = path.dirname(inputPath);
  const ext = path.extname(inputPath);
  const cleanedPath = path.join(dir, `cleaned_${Date.now()}${ext}`);

  try {
    // Attempt ffmpeg high-pass + low-pass filter to remove ambient noise
    execSync(
      `ffmpeg -i "${inputPath}" -af "highpass=f=200,lowpass=f=3000,anlmdn=s=7" -y "${cleanedPath}" 2>/dev/null`,
      { timeout: 15000 }
    );
    console.log('[NoiseReduction] Audio cleaned with ffmpeg filters');
    return cleanedPath;
  } catch {
    // ffmpeg not available or failed — passthrough original file
    console.log('[NoiseReduction] ffmpeg not available, using raw audio');
    return inputPath;
  }
}

/**
 * Cleanup temporary cleaned audio files.
 */
function cleanupTempFile(filePath) {
  try {
    if (filePath.includes('cleaned_') && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // ignore cleanup errors
  }
}

module.exports = { reduceNoise, cleanupTempFile };
