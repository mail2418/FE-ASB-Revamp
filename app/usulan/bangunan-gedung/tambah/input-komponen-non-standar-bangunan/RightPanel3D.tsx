'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Sky, Environment, OrbitControls } from '@react-three/drei';
import dynamic from 'next/dynamic';

const BuildingContainer = dynamic(() => import('../input-komponen-standar-bangunan/3DComponents/BuildingContainer'), { ssr: false });

export default function RightPanel3D() {
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
          <BuildingContainer />

          {/* Camera Controls */}
          <OrbitControls enablePan enableZoom enableRotate />
        </Suspense>
      </Canvas>
    </div>
  );
}
