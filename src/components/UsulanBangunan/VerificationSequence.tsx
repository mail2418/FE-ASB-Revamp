'use client';
import React from 'react';
import { Check, X, Clock, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VerificationStages, VerificationStatus } from '@/types/usulan-bangunan';

interface VerificationSequenceProps {
  verificationStatus: VerificationStages;
  userRole: string | null;
  usulanId: string;
  idAsbStatus?: number;
  onStatusChange?: (stage: 'adbang' | 'bpkad' | 'bappeda', newStatus: VerificationStatus) => void;
}

const getStatusIcon = (status: VerificationStatus) => {
  switch (status) {
    case 'Disetujui':
      return <Check className="w-3 h-3" />;
    case 'Ditolak':
      return <X className="w-3 h-3" />;
    case 'Menunggu':
      return <Clock className="w-3 h-3" />;
    case 'Belum':
    default:
      return <Circle className="w-3 h-3" />;
  }
};

const getStatusColor = (status: VerificationStatus) => {
  switch (status) {
    case 'Disetujui':
      return 'bg-green-100 text-green-700 border-green-300';
    case 'Ditolak':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'Menunggu':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'Belum':
    default:
      return 'bg-gray-100 text-gray-500 border-gray-300';
  }
};

export default function VerificationSequence({
  verificationStatus,
  userRole,
  idAsbStatus,
  onStatusChange,
}: VerificationSequenceProps) {
  // Compute effective verification status based on idAsbStatus
  const getEffectiveStatus = (stageKey: 'adbang' | 'bpkad' | 'bappeda'): VerificationStatus => {
    const originalStatus = verificationStatus?.[stageKey] || 'Belum';
    // Override status based on idAsbStatus
    if (idAsbStatus === 11) {
      // BPKAD is waiting
      if (stageKey === 'bpkad') return 'Menunggu';
    } else if (idAsbStatus === 12) {
      // BPKAD is approved
      if (stageKey === 'bpkad') return 'Disetujui';
    } else if (idAsbStatus === 13) {
      // ADBANG is approved, BAPPEDA is waiting
      if (stageKey === 'adbang') return 'Disetujui';
      if (stageKey === 'bpkad') return 'Disetujui';
      if (stageKey === 'bappeda') return 'Menunggu';
    } else if (idAsbStatus === 8) {
      // BAPPEDA is approved
      if (stageKey === 'bappeda') return 'Disetujui';
      if (stageKey === 'adbang') return 'Disetujui';
      if (stageKey === 'bpkad') return 'Disetujui';
    }
    else if (idAsbStatus !== undefined && idAsbStatus < 6){
      if (stageKey === 'bappeda') return 'Belum';
      if (stageKey === 'adbang') return 'Belum';
      if (stageKey === 'bpkad') return 'Belum';
    }
    return originalStatus;
  };
  const stages = [
    { key: 'adbang' as const, label: 'ADBANG', role: 'verifikator_adbang' },
    { key: 'bpkad' as const, label: 'BPKAD', role: 'verifikator_bpkad' },
    { key: 'bappeda' as const, label: 'BAPPEDA', role: 'verifikator_bappeda' },
  ];

  // Safety check: if verificationStatus is undefined or missing properties, don't render
  if (!verificationStatus || typeof verificationStatus !== 'object') {
    return (
      <div className="flex items-center gap-2">
        <div className="text-sm text-gray-500 italic">
          Status verifikasi tidak tersedia
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {stages.map((stage, index) => {
        // Get effective status based on idAsbStatus overrides
        const safeStatus: VerificationStatus = getEffectiveStatus(stage.key);

        return (
          <React.Fragment key={stage.key}>
            <div
                className={cn(
                  'inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium border min-w-[100px] justify-center',
                  getStatusColor(safeStatus)
                )}
                title={`${stage.label} - ${safeStatus}`}
              >
                {getStatusIcon(safeStatus)}
                <span className="text-[10px] font-semibold">{stage.label}</span>
            </div>
            
            {/* Connector line between stages */}
            {index < stages.length - 1 && (
              <div className="flex items-center">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
