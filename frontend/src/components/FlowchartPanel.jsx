import { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { api } from '../api/client';

export default function FlowchartPanel() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [input, setInput] = useState('');

  function loadFlowchart(data) {
    if (!data?.nodes) return;

    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 60 });

    const nodeWidth = 140;
    const nodeHeight = 50;
    data.nodes.forEach((n) => g.setNode(n.id, { width: nodeWidth, height: nodeHeight }));
    (data.edges || []).forEach((e) => g.setEdge(e.source, e.target));
    dagre.layout(g);

    const reactFlowNodes = data.nodes.map((n) => {
      const pos = g.node(n.id);
      return {
        id: n.id,
        data: { label: n.label },
        position: { x: pos.x - nodeWidth / 2, y: pos.y - nodeHeight / 2 },
        type: n.type === 'input' ? 'input' : n.type === 'output' ? 'output' : 'default',
        style: {
          background: n.type === 'input' ? '#4c6ef5' : n.type === 'output' ? '#e03131' : '#1e293b',
          color: '#fff',
          border: '1px solid #374151',
          borderRadius: '8px',
          padding: '10px',
        },
      };
    });

    const reactFlowEdges = (data.edges || []).map((e, i) => ({
      id: `e-${i}`,
      source: e.source,
      target: e.target,
      label: e.label || '',
      animated: true,
      style: { stroke: '#4c6ef5' },
    }));

    setNodes(reactFlowNodes);
    setEdges(reactFlowEdges);
  }

  async function handleGenerate() {
    if (!input.trim()) return;
    try {
      const data = await api.generateFlowchart(input);
      loadFlowchart(data.flowchart);
    } catch (err) {
      console.error('Flowchart generation failed:', err);
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-mindpen-500">Flowcharts</h2>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          placeholder="Describe a process to generate flowchart..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-mindpen-500"
        />
        <button
          onClick={handleGenerate}
          className="px-4 py-2 bg-mindpen-600 text-white rounded-lg text-sm font-medium hover:bg-mindpen-700"
        >
          Generate
        </button>
      </div>

      <div className="h-80 bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        {nodes.length > 0 ? (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            fitView
          >
            <Background color="#374151" gap={16} />
            <Controls />
          </ReactFlow>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500 text-sm">
            Generate a flowchart or wait for auto-detection
          </div>
        )}
      </div>
    </div>
  );
}
