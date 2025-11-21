'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Environment, OrbitControls } from '@react-three/drei';
import dynamic from 'next/dynamic';
import { BuildingFormState } from '@/types/building-form';

const BuildingContainer = dynamic(() => import('../../../../../src/components/UsulanBangunan/3DComponents/BuildingContainer'), { ssr: false });

export default function RightPanel3D() {
  const [standardFormState, setStandardFormState] = useState<BuildingFormState>({});

  useEffect(() => {
    // Load standard components data for visualization
    const savedData = localStorage.getItem('usulan_bangunan_standar_components');
    if (savedData) {
      try {
        setStandardFormState(JSON.parse(savedData));
      } catch (e) {
        console.error('Failed to load standard components for 3D view', e);
      }
    }
  }, []);

  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }} fallback={<div>WebGL Not Support</div>}>
        <Suspense fallback={null}>
          {/* Lighting & Environment */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[10, 20, 10]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          >
            <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10]} />
          </directionalLight>
          <Sky sunPosition={[7, 5, 1]} />
          {/* <Environment preset="city" /> */}

          {/* The main container for our dynamic building parts */}
          <BuildingContainer formState={standardFormState} />

          {/* Camera Controls */}
          <OrbitControls enablePan enableZoom enableRotate />
        </Suspense>
      </Canvas>
    </div>
  );
}
