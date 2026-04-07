/**
 * Flowchart Generation Engine
 * Generates flowchart data in JSON format from transcript content.
 * Output is compatible with ReactFlow for frontend rendering.
 * Uses Groq llama3-70b.
 */
const groq = require('../config/groq');

/**
 * Generate flowchart nodes and edges from transcript.
 * @param {string} transcript - text describing a process or concept
 * @returns {{ nodes: Array, edges: Array, steps: string[] }}
 */
async function generateFlowchart(transcript) {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a flowchart generator. The text may be in English, Hindi (Devanagari), or Hinglish (mixed Hindi-English). Understand the content regardless of language.
Break down the concept/process into sequential steps. Use the same language as the input for step descriptions and labels.
For longer content (lectures), create a DETAILED flowchart covering ALL major steps, decisions, and branches — not just 3-4 nodes.

Return JSON:
{
  "steps": ["Step 1 description", "Step 2 description", ...],
  "nodes": [
    {"id": "1", "label": "Start", "type": "input"},
    {"id": "2", "label": "Step description", "type": "default"},
    {"id": "n", "label": "End", "type": "output"}
  ],
  "edges": [
    {"source": "1", "target": "2", "label": "optional edge label"},
    {"source": "2", "target": "3", "label": ""}
  ]
}

RULES:
- Always start with a "Start" node and end with an "End" node.
- For decision points, use "type": "default" with a label like "Is X true?" and create branching edges with "Yes"/"No" labels.
- Generate AT LEAST 6-10 nodes for detailed content. Cover every major step.
- Do NOT oversimplify. If the content has multiple phases or stages, represent them ALL.
Return ONLY valid JSON, no markdown.`,
        },
        {
          role: 'user',
          content: `Generate a flowchart for:\n\n${transcript}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    });

    const content = response.choices[0].message.content.trim();
    return JSON.parse(content);
  } catch (error) {
    console.error('[FlowchartEngine] Generation failed:', error.message);
    return {
      steps: ['Start', 'Process', 'End'],
      nodes: [
        { id: '1', label: 'Start', type: 'input' },
        { id: '2', label: 'Process', type: 'default' },
        { id: '3', label: 'End', type: 'output' },
      ],
      edges: [
        { source: '1', target: '2', label: '' },
        { source: '2', target: '3', label: '' },
      ],
    };
  }
}

module.exports = { generateFlowchart };
