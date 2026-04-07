/**
 * Audio Capture Engine (Backend)
 * Receives audio chunks from the frontend, stores them temporarily,
 * and orchestrates the full processing pipeline:
 *   audio -> noise reduction -> transcription -> speaker segmentation
 *   -> importance detection -> routing -> storage
 *
 * LECTURE ACCUMULATION:
 *   When a lecture is detected, transcripts are accumulated in a session
 *   (via lectureSessionManager). Each subsequent chunk is checked by the
 *   lectureEndDetectionEngine to see if the lecture is still going.
 *   Only when the lecture ends (or the user stops recording) is the full
 *   transcript sent to generate comprehensive notes at once.
 */
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { reduceNoise, cleanupTempFile } = require('./noiseReductionEngine');
const { transcribeAudio } = require('./speechToTextEngine');
const { segmentSpeakers } = require('./speakerSegmentationEngine');
const { detectImportance } = require('./importanceDetectionEngine');
const { routeTranscript, routeFullLecture } = require('./decisionRouterEngine');
const { isLectureActive, startLecture, appendToLecture, finalizeLecture, getActiveSession, isAutoFinalized, getAccumulatedSnippet } = require('./lectureSessionManager');
const { detectLectureEnd } = require('./lectureEndDetectionEngine');

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Process an uploaded audio chunk through the full pipeline.
 * Lectures are accumulated and only processed when they end.
 * @param {string} audioFilePath - path to the uploaded audio file
 * @returns {Object} full pipeline results
 */
async function processAudioChunk(audioFilePath) {
  const chunkId = uuidv4();
  const results = { chunkId, stages: {} };

  try {
    // Stage 1: Noise reduction
    console.log(`[Pipeline:${chunkId}] Stage 1: Noise reduction`);
    const cleanedPath = await reduceNoise(audioFilePath);
    results.stages.noiseReduction = { status: 'done', cleanedPath };

    // Stage 2: Speech-to-text
    console.log(`[Pipeline:${chunkId}] Stage 2: Transcription`);
    const transcription = await transcribeAudio(cleanedPath);
    results.stages.transcription = { status: 'done', text: transcription.text };

    if (!transcription.text || transcription.text.trim().length === 0) {
      results.stages.transcription.status = 'empty';

      // If lecture is active and we get empty audio, check if lecture ended
      if (isLectureActive()) {
        console.log(`[Pipeline:${chunkId}] Empty chunk during active lecture — checking if lecture ended`);
        const lectureData = finalizeLecture();
        if (lectureData) {
          console.log(`[Pipeline:${chunkId}] Lecture ended (empty audio). Processing full lecture...`);
          const lectureResult = await routeFullLecture(lectureData.fullTranscript, lectureData.speakers);
          results.stages.lectureFinalized = { status: 'done', ...lectureResult, sessionId: lectureData.id, chunkCount: lectureData.chunkCount };
        }
      }

      // Cleanup temp files
      cleanupTempFile(cleanedPath);
      return results;
    }

    // Stage 3: Speaker segmentation
    console.log(`[Pipeline:${chunkId}] Stage 3: Speaker segmentation`);
    const segments = await segmentSpeakers(transcription.text);
    results.stages.speakerSegmentation = { status: 'done', segments };

    // Stage 4–8: Process each speaker segment
    results.stages.processing = [];
    for (const segment of segments) {
      // Stage 4: Importance detection
      const importance = await detectImportance(segment.text);

      // --- LECTURE ACCUMULATION LOGIC ---

      if (importance.classification === 'lecture' || importance.classification === 'concept') {
        // This chunk is lecture content
        if (isLectureActive()) {
          // Lecture already in progress — append to session
          appendToLecture(segment.text, segment.speaker);
          results.stages.processing.push({
            speaker: segment.speaker,
            classification: importance.classification,
            confidence: importance.confidence,
            results: { classification: 'lecture', processed: [{ type: 'lecture_accumulated', data: { message: 'Chunk added to active lecture session', session: getActiveSession() } }] },
          });
        } else {
          // New lecture detected — start a session
          startLecture(segment.text, segment.speaker);
          results.stages.processing.push({
            speaker: segment.speaker,
            classification: importance.classification,
            confidence: importance.confidence,
            results: { classification: 'lecture', processed: [{ type: 'lecture_started', data: { message: 'Lecture session started — accumulating transcripts', session: getActiveSession() } }] },
          });
        }
      } else {
        // This chunk is NOT lecture content
        if (isLectureActive()) {
          // There's an active lecture, but this chunk isn't lecture — ask the second LLM
          console.log(`[Pipeline:${chunkId}] Non-lecture chunk during active session — checking with end-detection LLM`);
          // Get last ~500 chars of accumulated transcript for context
          const accumulatedSnippet = getAccumulatedSnippet(500);

          const endCheck = await detectLectureEnd(segment.text, importance.classification, accumulatedSnippet);

          if (endCheck.isLectureOngoing) {
            // LLM says lecture is still going — this might be a Q&A or brief tangent
            // Append it to the lecture session anyway
            appendToLecture(segment.text, segment.speaker);
            results.stages.processing.push({
              speaker: segment.speaker,
              classification: importance.classification,
              confidence: importance.confidence,
              results: { classification: 'lecture', processed: [{ type: 'lecture_continued', data: { message: 'Lecture still ongoing (brief non-lecture segment absorbed)', endCheck, session: getActiveSession() } }] },
            });
          } else {
            // LLM says lecture has ended — finalize and process full lecture
            console.log(`[Pipeline:${chunkId}] Lecture ended! Finalizing session...`);
            const lectureData = finalizeLecture();
            if (lectureData) {
              const lectureResult = await routeFullLecture(lectureData.fullTranscript, lectureData.speakers);
              results.stages.processing.push({
                speaker: segment.speaker,
                classification: 'lecture_finalized',
                confidence: endCheck.confidence,
                results: { ...lectureResult, sessionId: lectureData.id, chunkCount: lectureData.chunkCount },
              });
            }

            // Also process the current non-lecture chunk normally
            const routingResult = await routeTranscript(
              segment.text,
              importance.classification,
              segment.speaker
            );
            results.stages.processing.push({
              speaker: segment.speaker,
              classification: importance.classification,
              confidence: importance.confidence,
              results: routingResult,
            });
          }
        } else {
          // No active lecture — process normally (discussion, reminder, casual, etc.)
          const routingResult = await routeTranscript(
            segment.text,
            importance.classification,
            segment.speaker
          );
          results.stages.processing.push({
            speaker: segment.speaker,
            classification: importance.classification,
            confidence: importance.confidence,
            results: routingResult,
          });
        }
      }
    }

    // Check if session was auto-finalized due to inactivity
    if (isAutoFinalized()) {
      console.log(`[Pipeline:${chunkId}] Auto-finalized lecture detected, processing...`);
      const lectureData = finalizeLecture();
      if (lectureData) {
        const lectureResult = await routeFullLecture(lectureData.fullTranscript, lectureData.speakers);
        results.stages.autoFinalizedLecture = { status: 'done', ...lectureResult, sessionId: lectureData.id, chunkCount: lectureData.chunkCount };
      }
    }

    // Cleanup temp files
    cleanupTempFile(cleanedPath);

    // Add lecture session status to results
    if (isLectureActive()) {
      results.lectureSession = getActiveSession();
    }

    return results;
  } catch (error) {
    console.error(`[Pipeline:${chunkId}] Pipeline failed:`, error.message);
    results.error = error.message;
    return results;
  }
}

/**
 * Force-finalize any active lecture session (called when user stops recording).
 * @returns {Object|null} lecture processing results, or null if no active session
 */
async function finalizeActiveLecture() {
  if (!isLectureActive()) {
    return null;
  }

  console.log('[Pipeline] Force-finalizing active lecture (user stopped recording)');
  const lectureData = finalizeLecture();
  if (!lectureData) return null;

  const lectureResult = await routeFullLecture(lectureData.fullTranscript, lectureData.speakers);
  return {
    sessionId: lectureData.id,
    chunkCount: lectureData.chunkCount,
    startTime: lectureData.startTime,
    endTime: lectureData.endTime,
    ...lectureResult,
  };
}

module.exports = { processAudioChunk, finalizeActiveLecture, UPLOAD_DIR };
