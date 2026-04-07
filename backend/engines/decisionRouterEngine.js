/**
 * Decision Router Engine
 * Routes classified transcripts to the appropriate processing engine.
 *
 * Routing map:
 *   lecture   -> notesGenerationEngine
 *   discussion -> discussionSummaryEngine
 *   reminder  -> reminderEngine
 *   concept   -> visualizationTriggerEngine + explanationEngine
 *   casual    -> store transcript only
 *   ignore    -> discard
 */
const { generateNotes, generateComprehensiveNotes } = require('./notesGenerationEngine');
const { extractDiscussionOutcome } = require('./discussionSummaryEngine');
const { extractReminders } = require('./reminderEngine');
const { detectVisualization } = require('./visualizationTriggerEngine');
const { generateExplanation } = require('./explanationEngine');
const { generateFlowchart } = require('./flowchartEngine');
const { storeTranscript, storeNote, storeReminder, storeDiscussionOutcome, storeVisualization } = require('./dailyStorageEngine');
const { addTimelineEvent } = require('./timelineEngine');

/**
 * Route a classified transcript to the correct engine(s) and store results.
 * @param {string} transcript - the transcribed text
 * @param {string} classification - one of the importance categories
 * @param {string} speaker - identified speaker
 * @returns {Object} processing results
 */
async function routeTranscript(transcript, classification, speaker) {
  const results = { classification, processed: [] };
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  // Always store the transcript
  await storeTranscript({ text: transcript, speaker, classification });

  switch (classification) {
    case 'lecture': {
      const notes = await generateNotes(transcript);
      await storeNote({ ...notes, sourceTranscript: transcript, speaker });
      const flowchart = await generateFlowchart(transcript);
      // Store flowchart as a Visualization
      await storeVisualization({
        concept: notes.title || 'Lecture Chunk',
        title: notes.title || 'Lecture Chunk',
        type: 'lecture-flowchart',
        keywords: (notes.bulletPoints || []).slice(0, 5),
        flowchartData: {
          steps: flowchart.steps || [],
          nodes: flowchart.nodes || [],
          edges: flowchart.edges || [],
        },
        isLectureFlowchart: true,
        speaker,
        sourceTranscript: transcript,
      });
      await addTimelineEvent({ time: timeStr, type: 'lecture', description: `Lecture detected: ${notes.title || 'Untitled'}` });
      results.processed.push({ type: 'notes', data: notes });
      results.processed.push({ type: 'flowchart', data: flowchart });
      break;
    }

    case 'discussion': {
      const outcome = await extractDiscussionOutcome(transcript);
      await storeDiscussionOutcome({ ...outcome, sourceTranscript: transcript });
      await addTimelineEvent({ time: timeStr, type: 'discussion', description: `Discussion outcome: ${outcome.task || 'General'}` });
      results.processed.push({ type: 'discussionOutcome', data: outcome });
      break;
    }

    case 'reminder': {
      const reminders = await extractReminders(transcript);
      for (const r of reminders) {
        // Parse eventDate from LLM output (YYYY-MM-DD string) into a proper Date
        const eventDate = r.eventDate ? new Date(r.eventDate) : null;
        const deadlineDate = eventDate && !isNaN(eventDate.getTime()) ? eventDate : null;
        await storeReminder({
          ...r,
          eventDate: deadlineDate,
          deadlineDate: deadlineDate,
          category: r.category || 'other',
          sourceTranscript: transcript,
          speaker,
        });
      }
      const categoryLabel = reminders[0]?.category ? `[${reminders[0].category}] ` : '';
      await addTimelineEvent({ time: timeStr, type: 'reminder', description: `${categoryLabel}Reminder: ${reminders[0]?.task || 'Task detected'}` });
      results.processed.push({ type: 'reminders', data: reminders });
      break;
    }

    case 'concept': {
      const viz = await detectVisualization(transcript);
      const explanation = await generateExplanation(transcript);
      const flowchart = await generateFlowchart(transcript);
      if (viz.shouldVisualize) {
        // Store visualization with flowchart data embedded
        await storeVisualization({
          concept: viz.concept,
          title: viz.concept,
          type: viz.visualizationType,
          scene: viz.scene,
          keywords: viz.keywords,
          flowchartData: {
            steps: flowchart.steps || [],
            nodes: flowchart.nodes || [],
            edges: flowchart.edges || [],
          },
          speaker,
          sourceTranscript: transcript,
        });
        await addTimelineEvent({ time: timeStr, type: 'visualization', description: `Visualization: ${viz.concept}` });
      }
      results.processed.push({ type: 'visualization', data: viz });
      results.processed.push({ type: 'explanation', data: explanation });
      results.processed.push({ type: 'flowchart', data: flowchart });
      break;
    }

    case 'casual': {
      await addTimelineEvent({ time: timeStr, type: 'note', description: 'Casual conversation recorded' });
      results.processed.push({ type: 'stored', data: { message: 'Transcript stored' } });
      break;
    }

    case 'ignore':
    default:
      results.processed.push({ type: 'discarded', data: { message: 'Transcript discarded' } });
      break;
  }

  return results;
}

/**
 * Route a full accumulated lecture transcript for comprehensive note generation.
 * Called when a lecture session is finalized (lecture ended or user stopped recording).
 * Processes the ENTIRE lecture transcript at once instead of chunk-by-chunk.
 * @param {string} fullTranscript - the complete accumulated lecture transcript
 * @param {string[]} speakers - all speakers detected during the lecture
 * @returns {Object} processing results
 */
async function routeFullLecture(fullTranscript, speakers) {
  const results = { classification: 'lecture_full', processed: [] };
  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  const speaker = speakers.join(', ');

  // Store the full transcript
  await storeTranscript({ text: fullTranscript, speaker, classification: 'lecture' });

  // Generate comprehensive detailed notes from the FULL lecture transcript
  const notes = await generateComprehensiveNotes(fullTranscript);

  // Generate multi-level explanation for the lecture topic
  const explanation = await generateExplanation(fullTranscript);

  // Generate detailed flowchart from the full lecture notes
  const flowchart = await generateFlowchart(fullTranscript);

  // Store notes with explanation embedded and marked as comprehensive
  await storeNote({
    ...notes,
    explanation,
    isComprehensive: true,
    sourceTranscript: fullTranscript,
    speaker,
  });

  // Store the flowchart as a Visualization with full metadata (title, date, speaker, etc.)
  const lectureTitle = notes.title || 'Untitled Lecture';
  const flowchartKeywords = (notes.keyTerms || []).map(kt => kt.term).filter(Boolean);
  await storeVisualization({
    concept: lectureTitle,
    title: lectureTitle,
    type: 'lecture-flowchart',
    keywords: flowchartKeywords.length > 0 ? flowchartKeywords : (notes.subtopics || []).map(s => s.name).filter(Boolean),
    flowchartData: {
      steps: flowchart.steps || [],
      nodes: flowchart.nodes || [],
      edges: flowchart.edges || [],
    },
    isLectureFlowchart: true,
    speaker,
    sourceTranscript: fullTranscript,
  });

  // Add timeline events
  await addTimelineEvent({
    time: timeStr,
    type: 'lecture',
    description: `Full lecture notes: ${lectureTitle} (${speakers.length} speaker${speakers.length > 1 ? 's' : ''})`,
  });
  await addTimelineEvent({
    time: timeStr,
    type: 'visualization',
    description: `Lecture flowchart: ${lectureTitle}`,
  });

  results.processed.push({ type: 'notes', data: notes });
  results.processed.push({ type: 'explanation', data: explanation });
  results.processed.push({ type: 'flowchart', data: flowchart });

  console.log(`[DecisionRouter] Full lecture processed — title: "${lectureTitle}", transcript length: ${fullTranscript.length} chars, subtopics: ${notes.subtopics?.length || 0}, keyTerms: ${notes.keyTerms?.length || 0}`);
  return results;
}

module.exports = { routeTranscript, routeFullLecture };
