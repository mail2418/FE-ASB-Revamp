'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';

interface WelcomeToastProps {
  isVisible: boolean;
  userName: string;
  selectedYear: number;
  onClose: () => void;
}

export default function WelcomeToast({ isVisible, userName, selectedYear, onClose }: WelcomeToastProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(onClose, 300); // Wait for fade out animation
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible && !isAnimating) return null;

  return (
    <div 
      className={`fixed top-20 right-4 z-[90] max-w-sm transition-all duration-300 ${
        isAnimating ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
      }`}
    >
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Success Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Selamat Datang!</p>
          </div>
          <button 
            onClick={() => {
              setIsAnimating(false);
              setTimeout(onClose, 300);
            }}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Content */}
        <div className="px-4 py-3">
          <p className="text-gray-700 text-sm">
            Halo <strong>{userName}</strong>! Anda telah memilih tahun anggaran <strong className="text-orange-600">{selectedYear}</strong>.
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Semua data akan ditampilkan sesuai tahun yang dipilih.
          </p>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div 
            className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-[3000ms] ease-linear"
            style={{ width: isAnimating ? '0%' : '100%' }}
          />
        </div>
      </div>
    </div>
  );
}
