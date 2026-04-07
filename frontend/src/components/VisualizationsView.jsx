import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
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

/* ============================
   Three.js Scene Components
   ============================ */

function RotatingGroup({ children }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.15;
  });
  return <group ref={ref}>{children}</group>;
}

function StackScene() {
  const items = ['Top', 'Element 3', 'Element 2', 'Element 1', 'Bottom'];
  return (
    <RotatingGroup>
      {items.map((label, i) => (
        <group key={i} position={[0, (items.length - 1 - i) * 1.2, 0]}>
          <mesh>
            <boxGeometry args={[2.2, 0.8, 2.2]} />
            <meshStandardMaterial color={i === 0 ? '#00f0ff' : '#1e293b'} transparent opacity={0.85} />
          </mesh>
          <Text position={[0, 0, 1.2]} fontSize={0.28} color="white">{label}</Text>
        </group>
      ))}
    </RotatingGroup>
  );
}

function QueueScene() {
  const items = ['Front', 'Item 2', 'Item 3', 'Rear'];
  return (
    <RotatingGroup>
      {items.map((label, i) => (
        <group key={i} position={[i * 2.2 - 3.3, 0, 0]}>
          <mesh>
            <boxGeometry args={[1.6, 1.2, 1]} />
            <meshStandardMaterial color={i === 0 ? '#22d3ee' : i === items.length - 1 ? '#ec4899' : '#1e293b'} />
          </mesh>
          <Text position={[0, 1, 0]} fontSize={0.24} color="white">{label}</Text>
        </group>
      ))}
    </RotatingGroup>
  );
}

function BinaryTreeScene() {
  const nodes = [
    { pos: [0, 2.5, 0], label: '50' },
    { pos: [-2, 0.8, 0], label: '30' },
    { pos: [2, 0.8, 0], label: '70' },
    { pos: [-3, -1, 0], label: '20' },
    { pos: [-1, -1, 0], label: '40' },
    { pos: [1, -1, 0], label: '60' },
    { pos: [3, -1, 0], label: '80' },
  ];
  return (
    <RotatingGroup>
      {nodes.map((n, i) => (
        <group key={i} position={n.pos}>
          <mesh>
            <sphereGeometry args={[0.45, 32, 32]} />
            <meshStandardMaterial color="#a855f7" />
          </mesh>
          <Text position={[0, 0, 0.55]} fontSize={0.22} color="white">{n.label}</Text>
        </group>
      ))}
    </RotatingGroup>
  );
}

function DefaultScene({ concept }) {
  return (
    <RotatingGroup>
      <mesh>
        <torusKnotGeometry args={[1, 0.35, 128, 16]} />
        <meshStandardMaterial color="#00f0ff" wireframe />
      </mesh>
      <Text position={[0, -2.2, 0]} fontSize={0.35} color="#94a3b8">{concept || 'Concept'}</Text>
    </RotatingGroup>
  );
}

const SCENE_MAP = {
  'stack': StackScene,
  'queue': QueueScene,
  'binary-tree': BinaryTreeScene,
};

function ThreeScene({ vizType, concept }) {
  const Component = SCENE_MAP[vizType] || DefaultScene;
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -5]} intensity={0.3} color="#a855f7" />
      <Component concept={concept} />
      <OrbitControls enableZoom enablePan />
    </>
  );
}

/* ============================
   Flowchart Sub-Component
   ============================ */

function FlowchartViewer({ data }) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [graphHeight, setGraphHeight] = useState(400);

  useEffect(() => {
    if (!data?.nodes) return;

    const g = new dagre.graphlib.Graph();
    g.setDefaultEdgeLabel(() => ({}));
    g.setGraph({ rankdir: 'LR', nodesep: 50, ranksep: 60 });

    const nodeWidth = 140;
    const nodeHeight = 50;
    data.nodes.forEach((n) => g.setNode(n.id, { width: nodeWidth, height: nodeHeight }));
    (data.edges || []).forEach((e) => g.setEdge(e.source, e.target));
    dagre.layout(g);

    const graphInfo = g.graph();
    setGraphHeight(Math.max(500, (graphInfo.height || 0) + 150));

    setNodes(
      data.nodes.map((n) => {
        const pos = g.node(n.id);
        return {
          id: n.id,
          data: { label: n.label },
          position: { x: pos.x - nodeWidth / 2, y: pos.y - nodeHeight / 2 },
          type: n.type === 'input' ? 'input' : n.type === 'output' ? 'output' : 'default',
          style: {
            background: n.type === 'input' ? '#00f0ff' : n.type === 'output' ? '#ec4899' : '#1e293b',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '10px',
            padding: '8px 14px',
            fontSize: '11px',
            maxWidth: '160px',
          },
        };
      })
    );

    setEdges(
      (data.edges || []).map((e, i) => ({
        id: `e-${i}`,
        source: e.source,
        target: e.target,
        label: e.label || '',
        animated: true,
        style: { stroke: '#00f0ff' },
        labelStyle: { fill: '#94a3b8', fontSize: '10px' },
      }))
    );
  }, [data]);

  return (
    <div className="rounded-xl overflow-hidden border border-white/[0.04]" style={{ height: `${graphHeight}px` }}>
      <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} fitView>
        <Background color="#1e293b" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
}

/* ============================
   Main View
   ============================ */

export default function VisualizationsView() {
  const [visualizations, setVisualizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFile, setOpenFile] = useState(null);
  const [flowchartInput, setFlowchartInput] = useState('');
  const [flowchartData, setFlowchartData] = useState(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadVisualizations();
    const interval = setInterval(loadVisualizations, 15000);
    return () => clearInterval(interval);
  }, []);

  async function loadVisualizations() {
    try {
      const data = await api.getTodayVisualizations();
      setVisualizations(data.visualizations || []);
    } catch (err) {
      console.error('Failed to load visualizations:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerateFlowchart() {
    if (!flowchartInput.trim()) return;
    setGenerating(true);
    try {
      const data = await api.generateFlowchart(flowchartInput);
      setFlowchartData(data.flowchart);
    } catch (err) {
      console.error('Flowchart generation failed:', err);
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // File opened — 3D viewer or Flowchart viewer
  if (openFile !== null && visualizations[openFile]) {
    const viz = visualizations[openFile];
    const hasFlowchart = viz.flowchartData && viz.flowchartData.nodes && viz.flowchartData.nodes.length > 0;
    const isLecture = viz.isLectureFlowchart || viz.type === 'lecture-flowchart';

    return (
      <div className="fade-in">
        <button onClick={() => setOpenFile(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-400 transition-colors mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Back to files
        </button>

        <div className="glass-strong rounded-2xl p-8 slide-up">
          <div className="flex items-center gap-3 mb-2">
            <span className={`tag ${isLecture ? 'tag-blue' : 'tag-green'}`}>
              {isLecture ? 'LECTURE FLOWCHART' : '3D VISUALIZATION'}
            </span>
            <span className="text-xs text-gray-500 font-mono">
              {new Date(viz.createdAt || viz.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-xs text-gray-600 font-mono">
              {new Date(viz.createdAt || viz.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white capitalize mb-1">{viz.title || viz.concept}</h2>
          {viz.speaker && (
            <p className="text-sm text-gray-500 mb-4">Speaker: {viz.speaker}</p>
          )}

          <div className="section-line mb-6" style={{ background: isLecture ? 'linear-gradient(90deg, #3b82f6, transparent)' : 'linear-gradient(90deg, #22d3ee, transparent)' }} />

          {/* Flowchart viewer for lecture flowcharts */}
          {hasFlowchart && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Flowchart</h3>
              <FlowchartViewer data={viz.flowchartData} />
            </div>
          )}

          {/* Steps list for lecture flowcharts */}
          {hasFlowchart && viz.flowchartData.steps && viz.flowchartData.steps.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3">Steps</h3>
              <div className="space-y-2">
                {viz.flowchartData.steps.map((step, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center">{i + 1}</span>
                    <p className="text-sm text-gray-300">{step}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3D Viewer for concept visualizations */}
          {!isLecture && (
            <div className="h-96 rounded-xl overflow-hidden border border-white/[0.04] bg-gray-950 mb-6">
              <Canvas camera={{ position: [0, 3, 9], fov: 45 }}>
                <ThreeScene vizType={viz.type} concept={viz.concept} />
              </Canvas>
            </div>
          )}

          {/* Metadata */}
          <div className={`grid ${viz.speaker ? 'grid-cols-4' : 'grid-cols-3'} gap-4`}>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-xs text-gray-500 mb-1">Type</p>
              <p className="text-sm text-gray-300 capitalize">{viz.type}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-xs text-gray-500 mb-1">{isLecture ? 'Source' : 'Scene'}</p>
              <p className="text-sm text-gray-300 capitalize">{isLecture ? 'Lecture Notes' : (viz.scene || 'General')}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-xs text-gray-500 mb-1">Keywords</p>
              <div className="flex flex-wrap gap-1">
                {(viz.keywords || []).slice(0, 6).map((kw, j) => (
                  <span key={j} className="tag tag-green">{kw}</span>
                ))}
              </div>
            </div>
            {viz.speaker && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <p className="text-xs text-gray-500 mb-1">Speaker</p>
                <p className="text-sm text-gray-300">{viz.speaker}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // File list + flowchart generator
  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Visualizations</h2>
          <p className="text-sm text-gray-500">{visualizations.length} visualization{visualizations.length !== 1 ? 's' : ''} today</p>
        </div>
      </div>

      {/* Flowchart Generator */}
      <div className="glass rounded-xl p-5 mb-6">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">Flowchart Generator</h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={flowchartInput}
            onChange={(e) => setFlowchartInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateFlowchart()}
            placeholder="Describe a process (e.g. 'how a stack push operation works')..."
            className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/30 transition-colors"
          />
          <button onClick={handleGenerateFlowchart} disabled={generating} className="btn-neon whitespace-nowrap">
            {generating ? 'Generating...' : 'Generate'}
          </button>
        </div>
        {flowchartData && (
          <div className="mt-4">
            <FlowchartViewer data={flowchartData} />
          </div>
        )}
      </div>

      {/* Visualization Files */}
      {visualizations.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
            <line x1="12" y1="22" x2="12" y2="15.5" />
            <polyline points="22 8.5 12 15.5 2 8.5" />
          </svg>
          <p className="text-lg font-medium">No visualizations yet</p>
          <p className="text-sm mt-1">Concepts like stack, queue, binary tree will auto-trigger 3D views</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visualizations.map((viz, i) => {
            const isLecture = viz.isLectureFlowchart || viz.type === 'lecture-flowchart';
            const hasFlowchart = viz.flowchartData && viz.flowchartData.nodes && viz.flowchartData.nodes.length > 0;

            return (
              <button
                key={viz._id || i}
                onClick={() => setOpenFile(i)}
                className="file-card p-5 text-left group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg ${isLecture ? 'bg-blue-500/10' : 'bg-emerald-500/10'} flex items-center justify-center flex-shrink-0`}>
                    {isLecture ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-blue-400">
                        <path d="M9 17H7A5 5 0 0 1 7 7h2" /><path d="M15 7h2a5 5 0 0 1 0 10h-2" /><line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-400">
                        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className={`font-semibold text-white text-sm truncate capitalize group-hover:${isLecture ? 'text-blue-400' : 'text-emerald-400'} transition-colors`}>
                      {viz.title || viz.concept}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5 capitalize">{viz.type}</p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      {new Date(viz.createdAt || viz.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                      {viz.speaker ? ` · ${viz.speaker}` : ''}
                    </p>
                  </div>
                </div>

                {/* Preview: flowchart steps for lectures, 3D for concepts */}
                {isLecture && hasFlowchart ? (
                  <div className="h-32 rounded-lg overflow-hidden bg-gray-950 border border-white/[0.04] mb-3 p-3">
                    <div className="space-y-1.5 overflow-hidden h-full">
                      {(viz.flowchartData.steps || []).slice(0, 4).map((step, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <span className="flex-shrink-0 w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold flex items-center justify-center">{j + 1}</span>
                          <p className="text-[11px] text-gray-400 truncate">{step}</p>
                        </div>
                      ))}
                      {(viz.flowchartData.steps || []).length > 4 && (
                        <p className="text-[10px] text-gray-600 pl-6">+{viz.flowchartData.steps.length - 4} more steps...</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-32 rounded-lg overflow-hidden bg-gray-950 border border-white/[0.04] mb-3 flex items-center justify-center">
                    <div className="text-center">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-emerald-400/60 mx-auto mb-1">
                        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                        <line x1="12" y1="22" x2="12" y2="15.5" />
                        <polyline points="22 8.5 12 15.5 2 8.5" />
                      </svg>
                      <p className="text-[11px] text-gray-500 capitalize">{viz.concept}</p>
                      <p className="text-[10px] text-emerald-400/50 mt-0.5">Click to view 3D</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5">
                  {isLecture && <span className="tag tag-blue">Lecture</span>}
                  {(viz.keywords || []).slice(0, 3).map((kw, j) => (
                    <span key={j} className="tag tag-green">{kw}</span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
