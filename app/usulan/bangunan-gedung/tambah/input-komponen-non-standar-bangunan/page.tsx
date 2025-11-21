import React from 'react';
import { BuildingProvider } from './BuildingContext';
import LeftPanelForm from './LeftPanelForm';
import RightPanel3D from './RightPanel3D';

// This is a Server Component by default
export default function InputKomponenNonStandarPage() {
  return (
    // Wrap Client Components in the Provider
    <BuildingProvider>
      <main className="flex flex-col lg:flex-row h-screen max-h-screen overflow-hidden bg-gray-100">
        {/* Left Panel - Scrollable Form Area */}
        <div className="w-full lg:w-3/5 h-full overflow-y-auto border-r border-gray-200 bg-white p-6">
            <div className="mb-6">
             <h1 className="text-xl font-bold text-gray-800">Input Komponen Non Standar Pembangunan</h1>
             <p className="text-sm text-gray-500">Lengkapi data spesifikasi dan prosentase pembangunan.</p>
            </div>
           <LeftPanelForm />
        </div>

        {/* Right Panel - Sticky 3D Canvas Area */}
        <div className="w-full lg:w-2/5 h-[50vh] lg:h-full bg-gray-900 relative">
           <RightPanel3D />
        </div>
      </main>
    </BuildingProvider>
  );
}
