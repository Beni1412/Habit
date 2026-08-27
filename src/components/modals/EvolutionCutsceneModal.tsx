import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CompanionPet, EvolutionStage } from '../../types';
import { InteractivePet2D } from '../pet2d/InteractivePet2D';
import { playEvolutionPulse, playEvolutionFanfare, playSound } from '../../utils/audio';
import { Sparkles, Shield, Zap, Heart, Sword, ArrowUpRight, Award, Check, X, FastForward } from 'lucide-react';

interface EvolutionCutsceneModalProps {
  isOpen: boolean;
  pet: CompanionPet;
  currentStageData: EvolutionStage;
  nextStageData: EvolutionStage;
  onComplete: () => void;
  onCancel?: () => void;
}

type CutscenePhase = 'intro' | 'pulsing' | 'flash' | 'celebration' | 'summary';

export const EvolutionCutsceneModal: React.FC<EvolutionCutsceneModalProps> = ({
  isOpen,
  pet,
  currentStageData,
  nextStageData,
  onComplete,
  onCancel,
}) => {
  const [phase, setPhase] = useState<CutscenePhase>('intro');
  const [morphToggle, setMorphToggle] = useState(false);
  const [pulseCount, setPulseCount] = useState(0);

  const handleSkipToCelebration = useCallback(() => {
    setPhase('celebration');
    playEvolutionFanfare();
  }, []);

  const handleClose = useCallback(() => {
    if (phase === 'celebration') {
      onComplete();
    } else if (onCancel) {
      onCancel();
    } else {
      onComplete();
    }
  }, [phase, onCancel, onComplete]);

  // Handle ESC key to dismiss or skip
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  useEffect(() => {
    if (!isOpen) {
      setPhase('intro');
      setMorphToggle(false);
      setPulseCount(0);
      return;
    }

    // Sequence timing
    let timer1: NodeJS.Timeout;
    let timer2: NodeJS.Timeout;
    let morphInterval: NodeJS.Timeout;

    // Start intro text then trigger pulsing
    timer1 = setTimeout(() => {
      setPhase('pulsing');
      
      // Speeding up morphing loop
      let count = 0;
      const speed = 240;
      
      morphInterval = setInterval(() => {
        setMorphToggle((prev) => !prev);
        playEvolutionPulse();
        count++;
        setPulseCount(count);

        if (count >= 12) {
          clearInterval(morphInterval);
          setPhase('flash');
          playSound('boss_roar');
          
          timer2 = setTimeout(() => {
            setPhase('celebration');
            playEvolutionFanfare();
          }, 500);
        }
      }, speed);
    }, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      if (morphInterval) clearInterval(morphInterval);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const oldName = currentStageData.pokemonName || currentStageData.name || pet.name;
  const newName = nextStageData.pokemonName || nextStageData.name;
  const currentStageNum = currentStageData.stageNumber;
  const nextStageNum = nextStageData.stageNumber;

  return (
    <div
      id="evolution-cutscene-modal"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-md overflow-hidden p-4"
    >
      {/* Background Energy Matrix & Starlight */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.25)_0%,rgba(15,23,42,0.95)_100%)]" />
        
        {/* Floating Sparks */}
        {(phase === 'pulsing' || phase === 'celebration') && (
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 24 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#38bdf8]"
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
                  y: typeof window !== 'undefined' ? window.innerHeight + 20 : 600,
                  opacity: 0,
                  scale: 0.5,
                }}
                animate={{
                  y: -50,
                  opacity: [0, 1, 0],
                  scale: [0.5, 1.5, 0.2],
                  x: `+=${(Math.random() - 0.5) * 120}`,
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2 + Math.random() * 2,
                  delay: Math.random() * 1.5,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Top Floating Controls: Skip Animation & Close Button */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-50 flex items-center gap-2">
        {phase !== 'celebration' && (
          <button
            id="skip-evolution-button"
            onClick={handleSkipToCelebration}
            className="px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 text-xs font-bold flex items-center gap-1.5 backdrop-blur-md transition-all active:scale-95 cursor-pointer shadow-lg"
          >
            <FastForward className="w-3.5 h-3.5 text-amber-400" />
            <span>Lewati Animasi (Skip)</span>
          </button>
        )}

        <button
          id="close-evolution-modal-button"
          onClick={handleClose}
          aria-label="Tutup Evolusi"
          className="w-9 h-9 rounded-full bg-slate-900/90 border border-slate-700 hover:border-slate-500 flex items-center justify-center text-slate-300 hover:text-white transition-all backdrop-blur-md cursor-pointer shadow-lg active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Screen White Flash */}
      <AnimatePresence>
        {phase === 'flash' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-white z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 w-full max-w-lg flex flex-col items-center justify-center text-center">
        {/* TOP STATUS BAR */}
        <div className="mb-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-900/60 border border-indigo-400/40 text-indigo-200 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
            Pokémon Evolution Matrix
          </div>
        </div>

        {/* PET VISUAL TRANSFORMATION STAGE */}
        <div className="relative w-60 h-60 sm:w-72 sm:h-72 flex items-center justify-center my-2">
          {/* Pulsing Light Rings */}
          {phase === 'pulsing' && (
            <motion.div
              animate={{
                scale: [0.8, 1.4, 0.8],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="absolute inset-0 rounded-full border-4 border-cyan-400 shadow-[0_0_30px_#38bdf8] pointer-events-none"
            />
          )}

          {/* Celebration Aura */}
          {phase === 'celebration' && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [1, 1.1, 1], opacity: 1 }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-400/20 via-rose-500/20 to-indigo-500/20 blur-xl pointer-events-none"
            />
          )}

          {/* PET CONTAINER */}
          <div className="relative z-10">
            {phase === 'intro' && (
              <InteractivePet2D
                pet={pet}
                stageOverride={currentStageNum}
                mood="curious"
                scale={1.2}
              />
            )}

            {phase === 'pulsing' && (
              <motion.div
                animate={{
                  scale: [1, 1.15, 0.95, 1],
                  filter: morphToggle
                    ? 'brightness(2.5) drop-shadow(0 0 20px #38bdf8)'
                    : 'brightness(1.8) drop-shadow(0 0 15px #ffffff)',
                }}
                transition={{ duration: 0.2 }}
              >
                <InteractivePet2D
                  pet={pet}
                  stageOverride={morphToggle ? nextStageNum : currentStageNum}
                  mood="celebrating"
                  scale={1.3}
                />
              </motion.div>
            )}

            {phase === 'celebration' && (
              <motion.div
                initial={{ scale: 0.5, y: 30, opacity: 0 }}
                animate={{ scale: 1.35, y: 0, opacity: 1 }}
                transition={{ type: 'spring', damping: 12, stiffness: 100 }}
              >
                <InteractivePet2D
                  pet={pet}
                  stageOverride={nextStageNum}
                  mood="celebrating"
                  scale={1.35}
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* DIALOG BOX / POKÉMON TEXT */}
        <div className="w-full bg-slate-900/90 border-2 border-indigo-500/50 rounded-2xl p-5 shadow-2xl backdrop-blur-md mt-2 text-left">
          {phase === 'intro' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-lg sm:text-xl font-bold text-white font-mono tracking-wide">
                What? <span className="text-amber-400">{oldName}</span> is evolving!
              </p>
              <p className="text-slate-400 text-xs sm:text-sm mt-1.5">
                Awakening ancient habit energy through discipline and consistency...
              </p>
            </motion.div>
          )}

          {phase === 'pulsing' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex items-center justify-between">
                <p className="text-base sm:text-lg font-bold text-cyan-300 font-mono tracking-wide animate-pulse">
                  Morphing genetic habit resonance...
                </p>
                <button
                  onClick={handleSkipToCelebration}
                  className="text-xs font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                >
                  Skip Animation
                </button>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2.5 mt-3 overflow-hidden border border-slate-700">
                <motion.div
                  className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full"
                  style={{ width: `${Math.min(100, (pulseCount / 12) * 100)}%` }}
                />
              </div>
            </motion.div>
          )}

          {phase === 'celebration' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <p className="text-xl sm:text-2xl font-black text-amber-300 font-mono tracking-tight">
                Selamat! (Congratulations!)
              </p>
              <p className="text-white text-sm sm:text-base font-medium mt-1">
                Your <span className="text-indigo-300 font-bold">{oldName}</span> evolved into{' '}
                <span className="text-emerald-400 font-bold">{newName}</span>!
              </p>
              
              {/* Pokédex Entry & Stats */}
              <div className="mt-3 pt-3 border-t border-slate-800 space-y-2">
                <p className="text-xs text-slate-300 italic leading-relaxed">
                  "{nextStageData.description}"
                </p>

                {/* Stat Boosts Pills */}
                {nextStageData.statGains && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    <div className="bg-slate-800/80 rounded-lg p-2 flex items-center gap-1.5 border border-slate-700">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">HP Gain</span>
                        <span className="text-xs font-bold text-emerald-400">+{nextStageData.statGains.hp}</span>
                      </div>
                    </div>
                    <div className="bg-slate-800/80 rounded-lg p-2 flex items-center gap-1.5 border border-slate-700">
                      <Sword className="w-3.5 h-3.5 text-amber-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">ATK Gain</span>
                        <span className="text-xs font-bold text-emerald-400">+{nextStageData.statGains.atk}</span>
                      </div>
                    </div>
                    <div className="bg-slate-800/80 rounded-lg p-2 flex items-center gap-1.5 border border-slate-700">
                      <Shield className="w-3.5 h-3.5 text-blue-400" />
                      <div>
                        <span className="text-[10px] text-slate-400 block">DEF Gain</span>
                        <span className="text-xs font-bold text-emerald-400">+{nextStageData.statGains.def}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Unlocked Signature Skill */}
                {nextStageData.signatureSkill && (
                  <div className="mt-2 p-2.5 rounded-lg bg-indigo-950/70 border border-indigo-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <div>
                        <span className="text-[10px] text-indigo-300 block font-semibold">New Signature Skill</span>
                        <span className="text-xs font-bold text-white">{nextStageData.signatureSkill.name}</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-800 text-indigo-200 font-mono">
                      PWR {nextStageData.signatureSkill.power}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                <button
                  id="evolution-confirm-button"
                  onClick={onComplete}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  Accept Evolution & Continue
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

