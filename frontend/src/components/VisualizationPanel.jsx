import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { api } from '../api/client';

// --- 3D Scene Components ---

function StackVisualization() {
  const elements = ['Top', 'Element 3', 'Element 2', 'Element 1', 'Bottom'];
  return (
    <group>
      {elements.map((label, i) => (
        <group key={i} position={[0, (elements.length - 1 - i) * 1.2, 0]}>
          <mesh>
            <boxGeometry args={[2, 0.8, 2]} />
            <meshStandardMaterial color={i === 0 ? '#4c6ef5' : '#374151'} transparent opacity={0.85} />
          </mesh>
          <Text position={[0, 0, 1.1]} fontSize={0.3} color="white">{label}</Text>
        </group>
      ))}
    </group>
  );
}

function QueueVisualization() {
  const elements = ['Front', 'Item 2', 'Item 3', 'Rear'];
  return (
    <group>
      {elements.map((label, i) => (
        <group key={i} position={[i * 2 - 3, 0, 0]}>
          <mesh>
            <boxGeometry args={[1.5, 1, 1]} />
            <meshStandardMaterial color={i === 0 ? '#22c55e' : i === elements.length - 1 ? '#ef4444' : '#374151'} />
          </mesh>
          <Text position={[0, 0.8, 0]} fontSize={0.25} color="white">{label}</Text>
        </group>
      ))}
    </group>
  );
}

function BinaryTreeVisualization() {
  const nodes = [
    { pos: [0, 2, 0], label: 'Root' },
    { pos: [-2, 0, 0], label: 'L' },
    { pos: [2, 0, 0], label: 'R' },
    { pos: [-3, -2, 0], label: 'LL' },
    { pos: [-1, -2, 0], label: 'LR' },
    { pos: [1, -2, 0], label: 'RL' },
    { pos: [3, -2, 0], label: 'RR' },
  ];
  return (
    <group>
      {nodes.map((n, i) => (
        <group key={i} position={n.pos}>
          <mesh>
            <sphereGeometry args={[0.5, 32, 32]} />
            <meshStandardMaterial color="#4c6ef5" />
          </mesh>
          <Text position={[0, 0, 0.6]} fontSize={0.25} color="white">{n.label}</Text>
        </group>
      ))}
    </group>
  );
}

function RotatingGroup({ children }) {
  const ref = useRef();
  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.2;
  });
  return <group ref={ref}>{children}</group>;
}

function DefaultVisualization({ concept }) {
  return (
    <RotatingGroup>
      <mesh>
        <torusKnotGeometry args={[1, 0.3, 128, 16]} />
        <meshStandardMaterial color="#4c6ef5" wireframe />
      </mesh>
      <Text position={[0, -2, 0]} fontSize={0.4} color="white">{concept || 'Concept'}</Text>
    </RotatingGroup>
  );
}

// --- Scene selector ---
const SCENES = {
  stack: StackVisualization,
  queue: QueueVisualization,
  'binary-tree': BinaryTreeVisualization,
};

function Scene({ vizType, concept }) {
  const SceneComponent = SCENES[vizType] || DefaultVisualization;
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <SceneComponent concept={concept} />
      <OrbitControls enableZoom enablePan />
    </>
  );
}

// --- Main Panel ---
export default function VisualizationPanel() {
  const [visualizations, setVisualizations] = useState([]);
  const [activeViz, setActiveViz] = useState(null);

  useEffect(() => {
    loadVisualizations();
    const interval = setInterval(loadVisualizations, 15000);
    return () => clearInterval(interval);
  }, []);

  async function loadVisualizations() {
    try {
      const data = await api.getTodayVisualizations();
      const vizList = data.visualizations || [];
      setVisualizations(vizList);
      if (vizList.length > 0 && !activeViz) {
        setActiveViz(vizList[0]);
      }
    } catch (err) {
      console.error('Failed to load visualizations:', err);
    }
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-mindpen-500">3D Visualizations</h2>

      {visualizations.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {visualizations.map((v) => (
            <button
              key={v._id}
              onClick={() => setActiveViz(v)}
              className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                activeViz?._id === v._id
                  ? 'bg-mindpen-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {v.concept}
            </button>
          ))}
        </div>
      )}

      <div className="h-80 bg-gray-900 rounded-lg border border-gray-800 overflow-hidden">
        <Canvas camera={{ position: [0, 2, 8], fov: 50 }}>
          <Scene
            vizType={activeViz?.type || 'default'}
            concept={activeViz?.concept || 'MindPen AI'}
          />
        </Canvas>
      </div>
    </div>
  );
}
