import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InteractivePet2D } from '../pet2d/InteractivePet2D';
import { PET_EVOLUTION_LINES } from '../../data/initialData';
import {
  Check,
  Lock,
  Sparkles,
  Trophy,
  Flame,
  Zap,
  Heart,
  Shield,
  Sword,
  Gauge,
  ArrowRight,
  Info,
  Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const EvolutionScreen: React.FC = () => {
  const { currentPet, currentPetId, triggerEvolutionCutscene } = useApp();
  const stages = PET_EVOLUTION_LINES[currentPetId] || PET_EVOLUTION_LINES.sprout;

  const currentStageNum = currentPet.evolutionStage || 1;
  const [selectedStageNum, setSelectedStageNum] = useState<number>(currentStageNum);

  const selectedStage = stages.find((s) => s.stageNumber === selectedStageNum) || stages[0];
  const canEvolve = currentStageNum < 4;
  const nextStageNum = Math.min(4, currentStageNum + 1);
  const nextStage = stages.find((s) => s.stageNumber === nextStageNum);

  return (
    <div id="evolution-screen" className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-12 space-y-6">
      {/* Header Pokémon Evolution Deck Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white border border-emerald-500/20 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Pokémon Evolution Matrix
            </span>
            <span className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold">
              Stage {currentStageNum} / 4
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            {currentPet.name}'s Evolution Path
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Every completed habit, unbroken streak, and mindfulness focus session fuels {currentPet.name}'s genetic Pokémon metamorphosis into legendary titan forms.
          </p>
        </div>

        {/* Big Evolve Now Action Trigger */}
        {canEvolve ? (
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="shrink-0 w-full sm:w-auto">
            <button
              id="trigger-evolution-button"
              onClick={() => triggerEvolutionCutscene(nextStageNum)}
              className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-3 shadow-[0_0_25px_rgba(245,158,11,0.4)] border-2 border-yellow-200 transition-all cursor-pointer"
            >
              <Sparkles className="w-5 h-5 fill-amber-900 text-amber-950 animate-spin" />
              <span>Evolve to {nextStage?.pokemonName || `Stage ${nextStageNum}`}!</span>
              <ArrowRight className="w-5 h-5 stroke-[3]" />
            </button>
          </motion.div>
        ) : (
          <div className="px-5 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 flex items-center gap-2 text-sm font-bold">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>Mega Apex Form Mastered!</span>
          </div>
        )}
      </div>

      {/* Main Grid: Evolution Stage Selector Cards + Pokédex Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: 4 Evolution Stages Pipeline (8 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              Evolution Pipeline
            </h2>
            <span className="text-xs font-semibold text-slate-500">Select any stage to inspect details</span>
          </div>

          <div className="space-y-3">
            {stages.map((stage) => {
              const isMastered = stage.stageNumber <= currentStageNum;
              const isCurrent = stage.stageNumber === currentStageNum;
              const isSelected = stage.stageNumber === selectedStageNum;
              const isNext = stage.stageNumber === currentStageNum + 1;

              return (
                <div
                  key={stage.id}
                  id={`stage-card-${stage.stageNumber}`}
                  onClick={() => setSelectedStageNum(stage.stageNumber)}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isSelected
                      ? 'bg-slate-900 text-white border-indigo-500 shadow-lg ring-2 ring-indigo-500/40'
                      : isCurrent
                      ? 'bg-emerald-50/80 border-emerald-400 text-slate-900 shadow-sm'
                      : isMastered
                      ? 'bg-white border-slate-200 text-slate-900 hover:border-slate-300'
                      : 'bg-slate-50/80 border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Pet 2D Miniature Thumbnail */}
                    <div
                      className={`w-16 h-16 rounded-xl shrink-0 p-1 flex items-center justify-center border overflow-hidden relative ${
                        isSelected ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                      }`}
                    >
                      <InteractivePet2D
                        pet={currentPet}
                        stageOverride={stage.stageNumber}
                        scale={0.36 + stage.stageNumber * 0.05}
                        mood={isSelected ? 'celebrating' : 'idle'}
                      />
                      {!isMastered && (
                        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex items-center justify-center">
                          <Lock className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          isSelected
                            ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/30'
                            : 'bg-slate-200 text-slate-700'
                        }`}>
                          Stage {stage.stageNumber}
                        </span>

                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500 text-slate-950">
                            Active
                          </span>
                        )}

                        {stage.stageNumber === 4 && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400 text-amber-950">
                            MEGA APEX
                          </span>
                        )}
                      </div>

                      <h3 className={`font-black text-base sm:text-lg ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                        {stage.pokemonName || stage.name}
                      </h3>
                      <p className={`text-xs ${isSelected ? 'text-slate-300' : 'text-slate-500'} line-clamp-1`}>
                        {stage.categoryTitle}
                      </p>
                    </div>
                  </div>

                  {/* Right Status Badge */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {isNext && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerEvolutionCutscene(stage.stageNumber);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        Evolve
                      </button>
                    )}
                    {isMastered ? (
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                        isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        <Check className="w-3.5 h-3.5 stroke-[3]" /> Mastered
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-slate-200/80 text-slate-600 text-xs font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Pokédex Stage Inspector Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider">
                  Pokédex Entry #{selectedStage.stageNumber}
                </span>
                <h3 className="text-xl font-black text-slate-950">
                  {selectedStage.pokemonName || selectedStage.name}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block font-medium">Height / Weight</span>
                <span className="text-xs font-bold text-slate-800">
                  {selectedStage.height || '1.2 m'} • {selectedStage.weight || '30.0 kg'}
                </span>
              </div>
            </div>

            {/* Stage Character Showcase Live View */}
            <div className="w-full h-52 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.25)_0%,transparent_70%)]" />
              
              <InteractivePet2D
                pet={currentPet}
                stageOverride={selectedStage.stageNumber}
                scale={1.25}
                mood={selectedStage.stageNumber <= currentStageNum ? 'happy' : 'idle'}
              />

              <span className="absolute bottom-2.5 left-3 text-[10px] font-bold text-indigo-300 bg-slate-900/80 px-2 py-0.5 rounded-full border border-indigo-500/30">
                {selectedStage.categoryTitle || 'Companion Pokémon'}
              </span>
            </div>

            {/* Description */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <p className="text-xs text-slate-600 leading-relaxed italic">
                "{selectedStage.description}"
              </p>
            </div>

            {/* Stat Progression Gains */}
            {selectedStage.statGains && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                  Base Stat Progression
                </h4>

                <div className="space-y-2 text-xs">
                  <div>
                    <div className="flex justify-between font-bold text-[11px] mb-1">
                      <span className="text-slate-600 flex items-center gap-1">
                        <Heart className="w-3 h-3 text-rose-500" /> HP Stat
                      </span>
                      <span className="text-rose-600 font-bold">{selectedStage.statGains.hp}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-rose-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, (selectedStage.statGains.hp / 320) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-[11px] mb-1">
                      <span className="text-slate-600 flex items-center gap-1">
                        <Sword className="w-3 h-3 text-amber-500" /> Attack Stat
                      </span>
                      <span className="text-amber-600 font-bold">{selectedStage.statGains.atk}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, (selectedStage.statGains.atk / 100) * 100)}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-bold text-[11px] mb-1">
                      <span className="text-slate-600 flex items-center gap-1">
                        <Shield className="w-3 h-3 text-blue-500" /> Defense Stat
                      </span>
                      <span className="text-blue-600 font-bold">{selectedStage.statGains.def}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, (selectedStage.statGains.def / 110) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Signature Skill if available */}
            {selectedStage.signatureSkill && (
              <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-indigo-700 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500" /> Signature Attack
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-indigo-200/80 text-indigo-900 px-2 py-0.5 rounded">
                    PWR {selectedStage.signatureSkill.power}
                  </span>
                </div>
                <h5 className="font-bold text-sm text-slate-900">{selectedStage.signatureSkill.name}</h5>
                <p className="text-xs text-slate-600">{selectedStage.signatureSkill.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
