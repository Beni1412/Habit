import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Play, Pause, RotateCcw, Sparkles, CheckCircle2, Flame, Award } from 'lucide-react';

export const FocusTimerModal: React.FC = () => {
  const { isFocusTimerOpen, setIsFocusTimerOpen, currentPet, completeFocusSession } = useApp();

  const [selectedMinutes, setSelectedMinutes] = useState<number>(15);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);
  const [isActive, setIsActive] = useState<boolean>(false);
  const [sessionCompleted, setSessionCompleted] = useState<boolean>(false);

  useEffect(() => {
    setSecondsRemaining(selectedMinutes * 60);
    setIsActive(false);
    setSessionCompleted(false);
  }, [selectedMinutes, isFocusTimerOpen]);

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsRemaining > 0) {
      interval = setInterval(() => {
        setSecondsRemaining((prev) => prev - 1);
      }, 1000);
    } else if (isActive && secondsRemaining === 0) {
      setIsActive(false);
      setSessionCompleted(true);
      completeFocusSession(selectedMinutes);
    }
    return () => clearInterval(interval);
  }, [isActive, secondsRemaining, selectedMinutes, completeFocusSession]);

  if (!isFocusTimerOpen) return null;

  const totalSecs = selectedMinutes * 60;
  const progressPct = Math.round(((totalSecs - secondsRemaining) / totalSecs) * 100);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleReset = () => {
    setIsActive(false);
    setSecondsRemaining(selectedMinutes * 60);
    setSessionCompleted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d1c2e]/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#ffffff] w-full max-w-md rounded-3xl p-6 sm:p-8 border border-[#bccabb]/40 shadow-2xl space-y-6 relative text-center">
        {/* Close Button */}
        <button
          onClick={() => {
            setIsActive(false);
            setIsFocusTimerOpen(false);
          }}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#f8f9ff] border border-[#bccabb]/30 flex items-center justify-center text-[#6d7b6d] hover:text-[#0d1c2e] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4ade80]/20 text-[#005e2d] rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Companion Focus Sprint
          </div>
          <h2 className="text-2xl font-black text-[#0d1c2e] tracking-tight">
            Focus with {currentPet.name}
          </h2>
          <p className="text-xs text-[#6d7b6d] font-medium">
            Stay in the flow. Your companion meditates and gains XP while you work!
          </p>
        </div>

        {/* Sprint Durations */}
        <div className="grid grid-cols-3 gap-2 bg-[#f8f9ff] p-1.5 rounded-2xl border border-[#bccabb]/30">
          {[5, 15, 25].map((mins) => (
            <button
              key={mins}
              disabled={isActive}
              onClick={() => setSelectedMinutes(mins)}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                selectedMinutes === mins
                  ? 'bg-white text-[#006d36] shadow-sm font-black scale-105'
                  : 'text-[#6d7b6d] hover:text-[#0d1c2e] disabled:opacity-50'
              }`}
            >
              {mins} Mins
            </button>
          ))}
        </div>

        {/* Circular Countdown Stage */}
        <div className="relative w-52 h-52 mx-auto flex items-center justify-center">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[#e6eeff]"
              strokeWidth="2.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-[#006d36] transition-all duration-500"
              strokeDasharray={`${progressPct}, 100`}
              strokeWidth="2.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>

          {/* Floating Character & Timer Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full overflow-hidden mb-1 drop-shadow-md">
              <img
                src={currentPet.avatarImage}
                alt={currentPet.name}
                className={`w-full h-full object-cover ${isActive ? 'pet-floating' : ''}`}
              />
            </div>
            <span className="text-3xl font-black text-[#0d1c2e] font-mono tracking-tight">
              {formatTime(secondsRemaining)}
            </span>
            <span className="text-[10px] font-bold text-[#006d36] uppercase tracking-wider mt-0.5">
              +{selectedMinutes * 2} Leafs • +{selectedMinutes * 5} XP
            </span>
          </div>
        </div>

        {/* Completion Notice */}
        {sessionCompleted && (
          <div className="p-3 bg-[#4ade80]/20 rounded-2xl border border-[#4ade80]/40 text-xs font-bold text-[#005e2d] flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#006d36]" />
            Sprint Complete! Rewards added to your account.
          </div>
        )}

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setIsActive(!isActive)}
            className={`flex-1 py-3.5 rounded-2xl font-black text-sm shadow-md transition-all bouncy-button flex items-center justify-center gap-2 text-white ${
              isActive
                ? 'bg-[#ba1a1a] hover:bg-[#93000a] border-b-[#690005]'
                : 'bg-[#006d36] hover:bg-[#005e2d] border-b-[#004722]'
            }`}
          >
            {isActive ? (
              <>
                <Pause className="w-4 h-4" /> Pause Sprint
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Start Focus Sprint
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-3.5 rounded-2xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#3d4a3e] border border-[#bccabb]/40 transition-transform active:scale-95"
            title="Reset Timer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
