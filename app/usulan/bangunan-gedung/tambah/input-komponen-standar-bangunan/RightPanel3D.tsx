'use client';

import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Environment, ContactShadows } from '@react-three/drei';
import BuildingContainer from './3DComponents/BuildingContainer';

export default function RightPanel3D() {
  return (
    <div className="w-full h-full">
      <Canvas camera={{ position: [10, 10, 10], fov: 50 }} fallback={<div>WebGL Not Support</div>}>
        <Suspense fallback={null}>
          {/* Lighting & Environment */}
          <ambientLight intensity={0.5} />
          <directionalLight
            castShadow
            position={[10, 20, 15]}
            intensity={1.5}
            shadow-mapSize={[1024, 1024]}
          >
            <orthographicCamera attach="shadow-camera" args={[-10, 10, 10, -10]} />
          </directionalLight>
          <Sky sunPosition={[7, 5, 1]} />
          {/* <Environment preset="city" /> */}

          {/* The main container for our dynamic building parts */}
          <BuildingContainer />

          {/* Ground shadows for realism */}
          <ContactShadows position={[0, 0, 0]} opacity={0.6} scale={20} blur={1.5} far={4.5} />
          
          {/* User controls to rotate/zoom */}
          <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 2.1} makeDefault />
        </Suspense>
      </Canvas>

      {/* Overlay Label */}
      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-sm pointer-events-none">
        <h3 className="font-bold text-gray-800">Visualisasi Konstruksi 3D</h3>
        <p className="text-xs text-gray-600">Model diperbarui secara real-time berdasarkan input prosentase.</p>
      </div>
    </div>
  );
}