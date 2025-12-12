'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { BuildingFormState } from '@/types/building-form';
import * as THREE from 'three';

// Component mapping for komponen names to 3D parts
const KOMPONEN_MAPPING: { [key: string]: string } = {
  'pondasi': 'pondasi',
  'struktur': 'struktur',
  'struktur (kolom, balok & ring balk)': 'struktur',
  'struktur (plesteran)': 'struktur',
  'lantai': 'lantai',
  'lantai (penutup lantai)': 'lantai',
  'dinding': 'dinding',
  'dinding (batu bata / partisi)': 'dinding',
  'dinding (plesteran)': 'dinding',
  'dinding (kaca)': 'dinding_kaca',
  'dinding (pintu)': 'pintu',
  'dinding (kosen)': 'pintu',
  'atap': 'atap',
  'atap (rangka)': 'atap',
  'atap (penutup)': 'atap',
  'plafon': 'plafon',
  'langit - langit (rangka)': 'plafon',
  'langit - langit (penutup)': 'plafon',
  'utilitas': 'utilitas',
  'utilitas (instalasi listrik)': 'utilitas',
  'utilitas (instalasi air)': 'utilitas',
  'utilitas (drainase limbah)': 'utilitas',
  'finishing': 'finishing',
  'finishing (cat struktur)': 'finishing',
  'finishing (cat langit langit)': 'finishing',
  'finishing (cat dinding)': 'finishing',
  'finishing (cat pintu/kosen)': 'finishing',
  'pintu': 'pintu',
};

// Helper to get 3D component type from komponen name
const getComponentType = (komponenName: string): string => {
  const normalized = komponenName.toLowerCase().trim();
  return KOMPONEN_MAPPING[normalized] || 'default';
};

// --- SUB-COMPONENTS FOR SPECIFIC BUILDING PARTS ---
// All components now render at 100% size, visibility determined by percentage > 0

// 1. Pondasi (Foundation) - Trapezium Prism Shape
const PondasiPart = ({ percentage, variant }: { percentage: number, variant?: string }) => {
  if (percentage <= 0) return null;
  
  const bottomWidth = 7;  // Wider at the bottom
  const topWidth = 6.2;   // Narrower at the top
  const depth = 7;        // Bottom depth
  const topDepth = 6.2;   // Top depth
  const height = 1;
  
  const color = variant?.includes('batu_kali') ? '#9ddec0ff' : '#de8282ff'; 

  // Create trapezium prism geometry using useMemo
  const geometry = React.useMemo(() => {
    const geo = new THREE.BufferGeometry();
    
    // Define vertices for trapezium prism
    const vertices = new Float32Array([
      // Bottom face (wider) - y = -0.5
      -bottomWidth/2, -0.5, -depth/2,      // 0
      bottomWidth/2, -0.5, -depth/2,       // 1
      bottomWidth/2, -0.5, depth/2,        // 2
      -bottomWidth/2, -0.5, depth/2,       // 3
      
      // Top face (narrower) - y = 0.5
      -topWidth/2, 0.5, -topDepth/2,       // 4
      topWidth/2, 0.5, -topDepth/2,        // 5
      topWidth/2, 0.5, topDepth/2,         // 6
      -topWidth/2, 0.5, topDepth/2,        // 7
    ]);

    const indices = [
      // Bottom face
      0, 2, 1,
      0, 3, 2,
      // Top face
      4, 5, 6,
      4, 6, 7,
      // Front face
      3, 7, 6,
      3, 6, 2,
      // Back face
      0, 1, 5,
      0, 5, 4,
      // Left face
      0, 4, 7,
      0, 7, 3,
      // Right face
      1, 2, 6,
      1, 6, 5,
    ];

    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    
    return geo;
  }, []);

  return (
    <mesh geometry={geometry} position={[0, 0, 0]} castShadow receiveShadow>
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
};

// 2. Struktur (Columns)
const StrukturPart = ({ percentage, levelIndex, variant }: { percentage: number, levelIndex: number, variant?: string }) => {
  if (percentage <= 0) return null;
  
  const floorHeight = 3; 
  const startY = 0.5 + (levelIndex * floorHeight);
  // Always render at full height regardless of percentage
  const currentHeight = floorHeight;
  
  const color = variant?.includes('beton') ? '#a0a0a0' : '#2f4f4f';

  const positions = [
    [-2.8, startY + currentHeight / 2, -2.8],
    [2.8, startY + currentHeight / 2, -2.8],
    [-2.8, startY + currentHeight / 2, 2.8],
    [2.8, startY + currentHeight / 2, 2.8],
  ];

  return (
    <group>
      {positions.map((pos, idx) => (
        <mesh key={idx} position={new THREE.Vector3(...pos)} castShadow>
          <boxGeometry args={[0.4, currentHeight, 0.4]} />
          <meshStandardMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
};

// 3. Lantai (Floor Slab)
const LantaiPart = ({ percentage, levelIndex, variant }: { percentage: number, levelIndex: number, variant?: string }) => {
  if (percentage <= 0) return null;
  
  const floorHeight = 3;
  const startY = 0.5 + (levelIndex * floorHeight);
  
  // Always render at full scale regardless of percentage
  const fullScale = 6;
  
  const color = variant?.includes('keramik') ? '#f5f5dc' : '#d3d3d3';

  return (
    <mesh position={[0, startY + 0.1, 0]} receiveShadow>
      <boxGeometry args={[fullScale, 0.2, fullScale]} />
      <meshStandardMaterial color={color} roughness={0.2} />
    </mesh>
  );
};

// 4. Dinding (Walls)
const DindingPart = ({ percentage, levelIndex, variant }: { percentage: number, levelIndex: number, variant?: string }) => {
  if (percentage <= 0) return null;

  const floorHeight = 3;
  const startY = 0.5 + (levelIndex * floorHeight);
  // Always render at full height regardless of percentage
  const currentHeight = floorHeight;
  
  const color = variant?.includes('bata') ? '#e8e8e8' : '#ffffff';

  return (
    <group position={[0, startY + currentHeight / 2, 0]}>
      <mesh position={[0, 0, -2.9]}>
        <boxGeometry args={[5.8, currentHeight, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0, 2.9]}>
        <boxGeometry args={[5.8, currentHeight, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-2.9, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[5.8, currentHeight, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[2.9, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[5.8, currentHeight, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
};

// 4b. Dinding Kaca (Glass Walls)
const DindingKacaPart = ({ percentage, levelIndex }: { percentage: number, levelIndex: number }) => {
  if (percentage <= 0) return null;

  const floorHeight = 3;
  const startY = 0.5 + (levelIndex * floorHeight);
  // Always render at full height regardless of percentage
  const currentHeight = floorHeight * 0.6;
  
  return (
    <group position={[0, startY + 1 + currentHeight / 2, 0]}>
      <mesh position={[0, 0, 2.95]}>
        <boxGeometry args={[4, currentHeight, 0.05]} />
        <meshStandardMaterial color="#87CEEB" transparent opacity={0.5} />
      </mesh>
    </group>
  );
};

// 5. Pintu (Doors)
const PintuPart = ({ percentage, levelIndex }: { percentage: number, levelIndex: number }) => {
  if (percentage <= 0) return null;

  const floorHeight = 3;
  const startY = 0.5 + (levelIndex * floorHeight);
  // Always render at full height regardless of percentage
  const doorHeight = 2.5;
  
  return (
    <group position={[0, startY, 0]}>
      {/* Door Frame */}
      <mesh position={[0, doorHeight / 2, 3]}>
        <boxGeometry args={[1.2, doorHeight, 0.15]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
    </group>
  );
};

// 6. Atap (Roof)
const AtapPart = ({ percentage, levelOffset, variant }: { percentage: number, levelOffset: number, variant?: string }) => {
  if (percentage <= 0) return null;

  const startY = 0.5 + (levelOffset * 3);
  // Always render at full scale regardless of percentage
  const color = variant?.includes('genteng') ? '#8b0000' : '#2f4f4f';

  return (
    <group position={[0, startY, 0]}>
      <mesh position={[0, 1.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[5, 3, 4]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  );
};

// 7. Plafon (Ceiling)
const PlafonPart = ({ percentage, levelIndex }: { percentage: number, levelIndex: number }) => {
  if (percentage <= 0) return null;

  const floorHeight = 3;
  const startY = 0.5 + (levelIndex * floorHeight) + floorHeight - 0.3;
  // Always render at full scale regardless of percentage
  const fullScale = 5.6;
  
  return (
    <mesh position={[0, startY, 0]} receiveShadow>
      <boxGeometry args={[fullScale, 0.15, fullScale]} />
      <meshStandardMaterial color="#F5F5F5" />
    </mesh>
  );
};

// 8. Utilitas (Utilities - Electrical/Plumbing/Lamp)
const UtilitasPart = ({ percentage, levelIndex }: { percentage: number, levelIndex: number }) => {
  if (percentage <= 0) return null;

  const floorHeight = 3;
  const startY = 0.5 + (levelIndex * floorHeight);
  
  return (
    <group position={[0, startY, 0]}>
      {/* Ceiling Lamp 1 */}
      <group position={[0, 2.6, 0]}>
        {/* Lamp cord */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        {/* Lamp base */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.08, 0.1, 16]} />
          <meshStandardMaterial color="#F5F5F5" />
        </mesh>
        {/* Lamp bulb */}
        <mesh position={[0, -0.1, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#FFFACD" emissive="#FFFF00" emissiveIntensity={0.5} />
        </mesh>
      </group>
      
      {/* Ceiling Lamp 2 */}
      <group position={[-1.5, 2.6, -1.5]}>
        {/* Lamp cord */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        {/* Lamp base */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.08, 0.1, 16]} />
          <meshStandardMaterial color="#F5F5F5" />
        </mesh>
        {/* Lamp bulb */}
        <mesh position={[0, -0.1, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#FFFACD" emissive="#FFFF00" emissiveIntensity={0.5} />
        </mesh>
      </group>
      
      {/* Ceiling Lamp 3 */}
      <group position={[1.5, 2.6, -1.5]}>
        {/* Lamp cord */}
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
          <meshStandardMaterial color="#333333" />
        </mesh>
        {/* Lamp base */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.15, 0.08, 0.1, 16]} />
          <meshStandardMaterial color="#F5F5F5" />
        </mesh>
        {/* Lamp bulb */}
        <mesh position={[0, -0.1, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color="#FFFACD" emissive="#FFFF00" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  );
};

// 9. Finishing (Paint/Final touches - represented as color overlay)
const FinishingPart = ({ percentage, levelIndex }: { percentage: number, levelIndex: number }) => {
  if (percentage <= 0) return null;

  const floorHeight = 3;
  const startY = 0.5 + (levelIndex * floorHeight);
  // Always render at full opacity for visibility
  const opacity = 0.3;
  
  return (
    <group position={[0, startY + 1.5, 0]}>
      {/* Finishing overlay effect on walls */}
      <mesh position={[0, 0, -2.85]}>
        <boxGeometry args={[5.6, 2.8, 0.01]} />
        <meshStandardMaterial color="#FFFAF0" transparent opacity={opacity} />
      </mesh>
      <mesh position={[0, 0, 2.85]}>
        <boxGeometry args={[5.6, 2.8, 0.01]} />
        <meshStandardMaterial color="#FFFAF0" transparent opacity={opacity} />
      </mesh>
    </group>
  );
};

// --- MAIN CONTAINER COMPONENT ---

interface BuildingContainerProps {
  formState: BuildingFormState;
}

export default function BuildingContainer({ formState }: BuildingContainerProps) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame((state) => {
    if(groupRef.current) {
      // Optional: Slow rotation
      // groupRef.current.rotation.y += 0.002;
    }
  });

  // Aggregate percentages by component type from formState
  const aggregatedPercentages: { [key: string]: number } = {};
  
  Object.keys(formState).forEach(key => {
    const match = key.match(/^row_(\d+)$/);
    if (match && formState[key]?.percentage) {
      // This handles dynamic component IDs
      aggregatedPercentages[key] = formState[key].percentage;
    }
  });

  // Calculate average percentages for main categories
  const getAverageForType = (type: string): number => {
    const keys = Object.keys(formState).filter(k => {
      const rowKey = k.replace('row_', '').toLowerCase();
      return rowKey.includes(type) || k === `row_${type}`;
    });
    if (keys.length === 0) return formState[`row_${type}`]?.percentage || 0;
    const sum = keys.reduce((acc, k) => acc + (formState[k]?.percentage || 0), 0);
    return sum / keys.length;
  };

  return (
    <group ref={groupRef}>
      {/* 1. Pondasi (Foundation) */}
      <PondasiPart 
        percentage={formState['row_pondasi']?.percentage || getAverageForType('pondasi')} 
      />

      {/* 2. Struktur (Structure/Columns) - Level 0 */}
      <StrukturPart 
        levelIndex={0} 
        percentage={formState['row_struktur']?.percentage || getAverageForType('struktur')}
      />
      
      {/* 3. Lantai (Floor) - Level 0 */}
      <LantaiPart 
        levelIndex={0} 
        percentage={formState['row_lantai']?.percentage || getAverageForType('lantai')}
      />
      
      {/* 4. Dinding (Walls) - Level 0 */}
      <DindingPart 
        levelIndex={0} 
        percentage={formState['row_dinding']?.percentage || getAverageForType('dinding')} 
      />

      {/* 4b. Dinding Kaca (Glass) - Level 0 */}
      <DindingKacaPart 
        levelIndex={0} 
        percentage={formState['row_dinding_kaca']?.percentage || 0} 
      />

      {/* 5. Pintu (Doors) - Level 0 */}
      <PintuPart 
        levelIndex={0} 
        percentage={formState['row_pintu']?.percentage || getAverageForType('pintu')} 
      />

      {/* 6. Plafon (Ceiling) - Level 0 */}
      <PlafonPart 
        levelIndex={0} 
        percentage={formState['row_plafon']?.percentage || getAverageForType('plafon')} 
      />

      {/* 7. Utilitas (Utilities with Lamps) - Level 0 */}
      <UtilitasPart 
        levelIndex={0} 
        percentage={formState['row_utilitas']?.percentage || getAverageForType('utilitas')} 
      />

      {/* 8. Finishing - Level 0 */}
      <FinishingPart 
        levelIndex={0} 
        percentage={formState['row_finishing']?.percentage || getAverageForType('finishing')} 
      />

      {/* 9. Atap (Roof) - On top of the building */}
      <AtapPart 
        levelOffset={1} 
        percentage={formState['row_atap']?.percentage || getAverageForType('atap')}
      />

      {/* Dynamic components based on row IDs from API */}
      {Object.keys(formState).map(key => {
        const match = key.match(/^row_(\d+)$/);
        if (!match) return null;
        
        const componentId = parseInt(match[1]);
        const percentage = formState[key]?.percentage || 0;
        
        // These are handled by the explicit components above
        // This section can be used for additional dynamic rendering
        return null;
      })}
    </group>
  );
}