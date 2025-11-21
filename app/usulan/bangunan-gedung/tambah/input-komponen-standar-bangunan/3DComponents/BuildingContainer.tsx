'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBuildingContext } from '../BuildingContext';
import * as THREE from 'three';

// --- SUB-COMPONENTS FOR SPECIFIC BUILDING PARTS ---

// 1. Pondasi (Foundation)
const PondasiPart = ({ percentage, variant }: { percentage: number, variant: string }) => {
  if (percentage <= 0) return null;
  const targetHeight = 1;
  const currentHeight = (percentage / 100) * targetHeight;
  
  // Variant styling: Batu kali (Darker/Rough) vs Tiang Pancang (Lighter/Smooth)
  const color = variant.includes('batu_kali') ? '#5c4033' : '#808080'; 

  return (
    <mesh position={[0, currentHeight / 2 - 0.5, 0]} castShadow receiveShadow>
      {/* Base stays at y=0, grows up */}
      <boxGeometry args={[6.2, currentHeight, 6.2]} />
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  );
};

// 2. Struktur (Columns)
const StrukturPart = ({ percentage, levelIndex, variant }: { percentage: number, levelIndex: number, variant: string }) => {
  if (percentage <= 0) return null;
  
  const floorHeight = 3; 
  const startY = 0.5 + (levelIndex * floorHeight); // Start on top of pondasi (0.5) + level offset
  const currentHeight = (percentage / 100) * floorHeight;
  
  const color = variant.includes('beton') ? '#a0a0a0' : '#2f4f4f'; // Concrete vs Steel

  // Create 4 corner columns
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
const LantaiPart = ({ percentage, levelIndex, variant }: { percentage: number, levelIndex: number, variant: string }) => {
  if (percentage <= 0) return null;
  
  const floorHeight = 3;
  const startY = 0.5 + (levelIndex * floorHeight); // Sit at the bottom of the level
  
  // Floor grows horizontally (scale) rather than height for visual effect
  const fullScale = 6;
  const currentScale = (percentage / 100) * fullScale;
  
  const color = variant.includes('keramik') ? '#f5f5dc' : '#d3d3d3'; // Beige vs Grey

  return (
    <mesh position={[0, startY + 0.1, 0]} receiveShadow>
      <boxGeometry args={[currentScale, 0.2, currentScale]} />
      <meshStandardMaterial color={color} roughness={0.2} />
    </mesh>
  );
};

// 4. Dinding (Walls)
const DindingPart = ({ percentage, levelIndex, variant }: { percentage: number, levelIndex: number, variant: string }) => {
  if (percentage <= 0) return null;

  const floorHeight = 3;
  const startY = 0.5 + (levelIndex * floorHeight);
  const currentHeight = (percentage / 100) * floorHeight;
  
  const color = variant.includes('bata') ? '#e8e8e8' : '#ffffff'; // Whiteish walls

  // Create 4 walls, slightly inset from columns
  return (
    <group position={[0, startY + currentHeight / 2, 0]}>
       {/* Back Wall */}
      <mesh position={[0, 0, -2.9]}>
        <boxGeometry args={[5.8, currentHeight, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Front Wall (with "door" gap visual logic could be added here) */}
      <mesh position={[0, 0, 2.9]}>
        <boxGeometry args={[5.8, currentHeight, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Left Wall */}
      <mesh position={[-2.9, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[5.8, currentHeight, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
       {/* Right Wall */}
       <mesh position={[2.9, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[5.8, currentHeight, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
};

// 5. Atap (Roof)
const AtapPart = ({ percentage, levelOffset, variant }: { percentage: number, levelOffset: number, variant: string }) => {
  if (percentage <= 0) return null;

  const startY = 0.5 + (levelOffset * 3); // On top of the highest level
  
  // Roof builds by opacity or scaling
  const scale = percentage / 100;

  const color = variant.includes('genteng') ? '#8b0000' : '#2f4f4f'; // Dark Red vs Dark Slate

  return (
    <group position={[0, startY, 0]} scale={[scale, scale, scale]}>
      {/* Prism Shape */}
      <mesh position={[0, 1.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[5, 3, 4]} /> {/* 4 segments = pyramid */}
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
    </group>
  );
};

// --- MAIN CONTAINER COMPONENT ---

export default function BuildingContainer() {
  const { formState } = useBuildingContext();

  // Animate rotation slightly for "alive" feel or use OrbitControls
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
     if(groupRef.current) {
         // Optional: Slow rotation
         // groupRef.current.rotation.y += 0.002;
     }
  });

  return (
    <group ref={groupRef}>
      {/* 1. Sub Struktur */}
      <PondasiPart 
        percentage={formState['row_pondasi']?.percentage} 
        variant={formState['row_pondasi']?.classificationKey} 
      />

      {/* 2. Lantai 1 */}
      <StrukturPart 
        levelIndex={0} 
        percentage={formState['row_struktur_lt1']?.percentage}
        variant={formState['row_struktur_lt1']?.classificationKey}
      />
      <LantaiPart 
        levelIndex={0} 
        percentage={formState['row_lantai_lt1']?.percentage}
        variant={formState['row_lantai_lt1']?.classificationKey}
      />
      <DindingPart 
        levelIndex={0} 
        percentage={formState['row_dinding_luar']?.percentage} // Using outer wall for visualization
        variant={formState['row_dinding_luar']?.classificationKey}
      />

      {/* 3. Lantai 2 (Only renders if structure lt 2 has percentage) */}
      <StrukturPart 
        levelIndex={1} 
        percentage={formState['row_struktur_lt2']?.percentage}
        variant={formState['row_struktur_lt2']?.classificationKey}
      />
      <LantaiPart 
        levelIndex={1} 
        percentage={formState['row_lantai_lt2']?.percentage}
        variant={formState['row_lantai_lt2']?.classificationKey}
      />
      {/* Assuming Dinding Luar applies to whole building, or split by floor in real app */}
      {formState['row_struktur_lt2']?.percentage > 0 && (
        <DindingPart 
            levelIndex={1} 
            percentage={formState['row_dinding_luar']?.percentage} 
            variant={formState['row_dinding_luar']?.classificationKey}
        />
      )}

      {/* 4. Atap - Sitting on top of Level 2 (index 2 height) */}
      <AtapPart 
        levelOffset={2} 
        percentage={formState['row_atap']?.percentage}
        variant={formState['row_atap']?.classificationKey}
      />
    </group>
  );
}