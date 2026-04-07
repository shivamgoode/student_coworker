/**
 * Lecture Session Manager
 * Manages in-memory lecture sessions to accumulate transcripts across chunks.
 * When a lecture is detected, transcripts are buffered here instead of being
 * processed individually. Once the lecture ends, the full transcript is released
 * for comprehensive note generation.
 */

// Single active lecture session (one at a time)
let activeSession = null;

// Auto-finalize timeout (2 minutes of no new chunks → lecture considered ended)
const AUTO_FINALIZE_TIMEOUT_MS = 2 * 60 * 1000;
let autoFinalizeTimer = null;

/**
 * Check if a lecture session is currently active.
 */
function isLectureActive() {
  return activeSession !== null;
}

/**
 * Start a new lecture session with the first transcript chunk.
 * @param {string} transcript - first chunk's transcript text
 * @param {string} speaker - detected speaker
 */
function startLecture(transcript, speaker) {
  activeSession = {
    id: `lecture_${Date.now()}`,
    transcripts: [transcript],
    speakers: [speaker],
    startTime: new Date(),
    lastActivityTime: new Date(),
    chunkCount: 1,
  };
  resetAutoFinalizeTimer();
  console.log(`[LectureSession] Started session ${activeSession.id}`);
}

/**
 * Append a new transcript chunk to the active lecture session.
 * @param {string} transcript - new chunk's transcript text
 * @param {string} speaker - detected speaker
 */
function appendToLecture(transcript, speaker) {
  if (!activeSession) return;
  activeSession.transcripts.push(transcript);
  activeSession.speakers.push(speaker);
  activeSession.lastActivityTime = new Date();
  activeSession.chunkCount += 1;
  resetAutoFinalizeTimer();
  console.log(`[LectureSession] Appended chunk #${activeSession.chunkCount} to ${activeSession.id}`);
}

/**
 * Finalize the active lecture session and return all accumulated data.
 * Clears the session so a new one can start.
 * @returns {{ id: string, fullTranscript: string, speakers: string[], chunkCount: number, startTime: Date, endTime: Date } | null}
 */
function finalizeLecture() {
  if (!activeSession) return null;

  clearAutoFinalizeTimer();

  const result = {
    id: activeSession.id,
    fullTranscript: activeSession.transcripts.join('\n\n'),
    speakers: [...new Set(activeSession.speakers)],
    chunkCount: activeSession.chunkCount,
    startTime: activeSession.startTime,
    endTime: new Date(),
  };

  console.log(`[LectureSession] Finalized ${activeSession.id} — ${activeSession.chunkCount} chunks, ${result.fullTranscript.length} chars`);
  activeSession = null;
  return result;
}

/**
 * Get info about the active session without finalizing.
 */
function getActiveSession() {
  if (!activeSession) return null;
  return {
    id: activeSession.id,
    chunkCount: activeSession.chunkCount,
    startTime: activeSession.startTime,
    lastActivityTime: activeSession.lastActivityTime,
    transcriptLength: activeSession.transcripts.join(' ').length,
  };
}

/**
 * Reset the auto-finalize timer. Called each time a new chunk is appended.
 * If no new chunk arrives within AUTO_FINALIZE_TIMEOUT_MS, the session
 * auto-finalizes (returns null — caller must handle separately).
 */
function resetAutoFinalizeTimer() {
  clearAutoFinalizeTimer();
  autoFinalizeTimer = setTimeout(() => {
    if (activeSession) {
      console.log(`[LectureSession] Auto-finalize triggered for ${activeSession.id} (no activity for ${AUTO_FINALIZE_TIMEOUT_MS / 1000}s)`);
      // We set a flag so the next call or the finalize endpoint can pick it up
      activeSession._autoFinalized = true;
    }
  }, AUTO_FINALIZE_TIMEOUT_MS);
}

function clearAutoFinalizeTimer() {
  if (autoFinalizeTimer) {
    clearTimeout(autoFinalizeTimer);
    autoFinalizeTimer = null;
  }
}

/**
 * Check if the session was auto-finalized due to inactivity.
 */
function isAutoFinalized() {
  return activeSession && activeSession._autoFinalized === true;
}

/**
 * Get the last ~500 characters of accumulated transcript for context.
 * Used by the lecture end detection engine.
 */
function getAccumulatedSnippet(maxLength = 500) {
  if (!activeSession || activeSession.transcripts.length === 0) return '';
  const full = activeSession.transcripts.join('\n\n');
  if (full.length <= maxLength) return full;
  return full.slice(-maxLength);
}

module.exports = {
  isLectureActive,
  startLecture,
  appendToLecture,
  finalizeLecture,
  getActiveSession,
  isAutoFinalized,
  getAccumulatedSnippet,
};
