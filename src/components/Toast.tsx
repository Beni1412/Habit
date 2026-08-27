import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toastMessage } = useApp();

  if (!toastMessage) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200 pointer-events-none">
      <div className="bg-[#0d1c2e] text-white px-5 py-2.5 rounded-full shadow-2xl border border-white/20 flex items-center gap-2.5 text-xs sm:text-sm font-extrabold tracking-wide">
        <Sparkles className="w-4 h-4 text-[#f6bb1f] fill-[#f6bb1f] animate-spin" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
