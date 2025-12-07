'use client';
import React from 'react';
import { Check, X, Clock, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { VerificationStages, VerificationStatus } from '@/types/usulan-bangunan';

interface VerificationSequenceProps {
  verificationStatus: VerificationStages;
  userRole: string | null;
  usulanId: string;
  onStatusChange?: (stage: 'adpem' | 'bappeda' | 'bpkad', newStatus: VerificationStatus) => void;
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
  usulanId,
  onStatusChange,
}: VerificationSequenceProps) {
  const stages = [
    { key: 'adpem' as const, label: 'Adpem', role: 'verifikator_adpem' },
    { key: 'bappeda' as const, label: 'BAPPEDA', role: 'verifikator_bappeda' },
    { key: 'bpkad' as const, label: 'BPKAD', role: 'verifikator_bpkad' },
  ];

  const handleStatusChange = (stage: 'adpem' | 'bappeda' | 'bpkad', newStatus: VerificationStatus) => {
    if (onStatusChange) {
      onStatusChange(stage, newStatus);
    }
  };

  const canEdit = (stageRole: string) => {
    // Only allow editing if user has the exact role for this stage
    return userRole !== null && userRole === stageRole;
  };

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
    <div className="flex items-center gap-2">{stages.map((stage, index) => {
        const status = verificationStatus[stage.key];
        
        // Safety check: if this stage's status is undefined, use 'Belum' as default
        const safeStatus: VerificationStatus = status || 'Belum';
        const isEditable = canEdit(stage.role);

        return (
          <React.Fragment key={stage.key}>
            {isEditable ? (
              <select
                value={safeStatus}
                onChange={(e) => handleStatusChange(stage.key, e.target.value as VerificationStatus)}
                className={cn(
                  'text-xs border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer transition-colors min-w-[100px]',
                  getStatusColor(safeStatus)
                )}
                title={`${stage.label} - ${safeStatus}`}
              >
                <option value="Belum">Belum</option>
                <option value="Menunggu">Menunggu</option>
                <option value="Disetujui">Disetujui</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            ) : (
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
            )}
            
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
