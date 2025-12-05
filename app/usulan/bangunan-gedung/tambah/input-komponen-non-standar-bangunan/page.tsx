'use client';

import React from 'react';
import { NonStandardBuildingProvider } from './BuildingContext';
import LeftPanelForm from './LeftPanelForm';
import RightPanel3D from './RightPanel3D';

// This is a Client Component
export default function InputKomponenNonStandarPage() {
  return (
    // Wrap Client Components in the Provider
    <NonStandardBuildingProvider>
      <main className="flex flex-col lg:flex-row min-h-screen bg-gray-100">
        {/* Left Panel - Scrollable Form Area */}
        <div className="w-full lg:w-3/5 overflow-y-auto border-r border-gray-200 bg-white p-6">
            <div className="mb-6">
             <h1 className="text-xl font-bold text-gray-800">Input Komponen Non Standar Pembangunan</h1>
             <p className="text-sm text-gray-500">Lengkapi data spesifikasi dan Persentase pembangunan.</p>
            </div>
           <LeftPanelForm />
        </div>

        {/* Right Panel - Sticky 3D Canvas Area */}
        <div className="w-full lg:w-2/5 min-h-[50vh] lg:min-h-screen bg-gray-900 relative lg:sticky lg:top-0">
           <RightPanel3D />
        </div>
      </main>
    </NonStandardBuildingProvider>
  );
}
