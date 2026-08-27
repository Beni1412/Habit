import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InventoryModal } from '../modals/InventoryModal';
import { AnimatedPetStage } from '../AnimatedPetStage';
import { InteractivePet2D } from '../pet2d/InteractivePet2D';
import {
  Sparkles,
  Plus,
  Flame,
  Check,
  Heart,
  Droplets,
  Cookie,
  Gamepad2,
  Trophy,
  ArrowRight,
  RefreshCw,
  Sun,
  CloudRain,
  Moon,
  Package,
  Edit2,
  Clock,
  Zap,
  GitBranch,
  Crown,
} from 'lucide-react';

export const HabitatDashboard: React.FC = () => {
  const {
    currentPet,
    habits,
    marriage,
    toggleHabit,
    incrementHabitCount,
    setEditingHabit,
    setIsEditHabitModalOpen,
    setIsAddHabitModalOpen,
    setIsCompanionModalOpen,
    setActiveTab,
  } = useApp();
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  const completedCount = habits.filter((h) => h.completedToday).length;
  const totalCount = habits.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const petXpPercent = Math.min(100, Math.round((currentPet.currentXp / currentPet.maxXp) * 100));

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Health':
        return 'bg-[#4ade80]/20 text-[#005e2d] border-[#4ade80]/40';
      case 'Mindfulness':
        return 'bg-[#dce9ff] text-[#004883] border-[#bccabb]/40';
      case 'Fitness':
        return 'bg-[#ffdad6] text-[#ba1a1a] border-[#ffdad6]';
      case 'Learning':
        return 'bg-[#ffdf9f]/40 text-[#795900] border-[#ffdf9f]';
      default:
        return 'bg-[#e6eeff] text-[#0d1c2e] border-[#bccabb]/30';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 md:px-8 py-5 pb-24 md:pb-12 space-y-6">
      {/* Top Banner / Welcome Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-[#eff4ff] via-[#ffffff] to-[#e6eeff] p-4 sm:p-5 rounded-3xl border border-[#bccabb]/30 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="relative cursor-pointer" onClick={() => setIsCompanionModalOpen(true)}>
            <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-white p-0.5 shadow-md border border-[#4ade80]/40 overflow-visible hover:scale-105 transition-transform flex items-center justify-center">
              <InteractivePet2D pet={currentPet} scale={0.4} mood="idle" />
            </div>
            <span className="absolute -bottom-1 -right-1 p-1 bg-[#006d36] text-white rounded-full text-[10px] shadow-sm">
              <RefreshCw className="w-3 h-3" />
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-xl sm:text-2xl text-[#0d1c2e] tracking-tight">
                {currentPet.name}'s Sanctuary
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${currentPet.tagColor}`}>
                Lvl {currentPet.growthLevel}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#3d4a3e] font-medium mt-0.5">
              {currentPet.happinessPct >= 90
                ? `🌿 ${currentPet.name} is joyful & glowing with energy!`
                : `✨ Check off routines to nourish ${currentPet.name} today!`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          {/* Bag Inventory Button */}
          <button
            onClick={() => setIsInventoryOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-[#eff4ff] text-[#0060ac] border border-[#bccabb]/40 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
            title="Open Bag Inventory"
          >
            <Package className="w-4 h-4 text-[#0060ac]" /> Bag
          </button>

          <button
            onClick={() => setIsCompanionModalOpen(true)}
            className="px-3.5 py-2 bg-white hover:bg-[#eff4ff] text-[#006d36] border border-[#bccabb]/40 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-[#006d36]" /> Switch Pet
          </button>

          <button
            onClick={() => setIsAddHabitModalOpen(true)}
            className="px-4 py-2 bg-[#006d36] hover:bg-[#005e2d] text-white rounded-xl font-black text-xs sm:text-sm shadow-md transition-all bouncy-button border-b-[#004722] flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Habit
          </button>
        </div>
      </div>

      {/* Main Grid: Habitat Left / Habits Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Animated Moving Pet Playground & Bento Stats (5 cols) */}
        <div className="lg:col-span-6 xl:col-span-5 space-y-5">
          {/* Interactive Animated Pet Stage */}
          <AnimatedPetStage />

          {/* Bento Quick Actions & Marriage / Evolution Hub */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Evolution Stage Card */}
            <div
              onClick={() => setActiveTab('evolution')}
              className="bg-gradient-to-br from-[#0d1c2e] to-[#1e293b] text-white rounded-2xl p-4 border border-[#334155] shadow-xs flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-[#4ade80] uppercase tracking-wider">
                  Evolution
                </span>
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-[#4ade80] flex items-center justify-center">
                  🌱
                </div>
              </div>
              <div className="my-1.5">
                <p className="font-black text-sm text-white">Growth Stage {currentPet.evolutionStage}/4</p>
                <p className="text-[10px] text-slate-300">
                  {currentPet.currentXp} / {currentPet.maxXp} XP • Lvl {currentPet.growthLevel}
                </p>
              </div>
              <div className="text-[11px] font-bold text-[#4ade80] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                View Evolution <ArrowRight className="w-3 h-3" />
              </div>
            </div>

            {/* Pet Marriage & Nursery Card */}
            <div
              onClick={() => setActiveTab('marriage')}
              className="bg-gradient-to-br from-[#fff1f2] to-[#ffe4e6] rounded-2xl p-4 border border-[#fecdd3] shadow-xs flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold text-rose-600 uppercase tracking-wider">
                  {marriage.isMarried ? 'Love Garden' : 'Marriage'}
                </span>
                <div className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-600 flex items-center justify-center">
                  💍
                </div>
              </div>
              <div className="my-1.5">
                <p className="font-black text-sm text-[#0d1c2e]">
                  {marriage.isMarried ? `Wed to ${marriage.partnerPetName}` : 'Find Pet Suitor'}
                </p>
                <p className="text-[10px] text-[#6d7b6d]">
                  {marriage.isMarried
                    ? marriage.babyEgg.hasEgg && !marriage.babyEgg.isHatched
                      ? `Egg: ${marriage.babyEgg.incubationProgress}/${marriage.babyEgg.maxProgress} Habits`
                      : '+25% XP Boost Active'
                    : 'Get Wedding Ring & Vows'}
                </p>
              </div>
              <div className="text-[11px] font-bold text-rose-600 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                {marriage.isMarried ? 'View Nursery' : 'Propose Now'} <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>

          {/* Bento Stats Row */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-[#ffffff] rounded-2xl p-4 border border-[#bccabb]/30 shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6d7b6d]">Today's Habits</span>
                <span className="text-xs font-black text-[#006d36] bg-[#4ade80]/20 px-2 py-0.5 rounded-full">
                  {progressPercent}%
                </span>
              </div>
              <div className="my-2">
                <span className="text-2xl font-black text-[#0d1c2e]">
                  {completedCount} <span className="text-sm font-semibold text-[#6d7b6d]">/ {totalCount}</span>
                </span>
              </div>
              <div className="w-full bg-[#eff4ff] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-[#006d36] h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div
              onClick={() => setActiveTab('evolution')}
              className="bg-[#ffffff] rounded-2xl p-4 border border-[#bccabb]/30 shadow-xs flex flex-col justify-between cursor-pointer hover:border-[#0060ac] transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#6d7b6d]">Next Evolution</span>
                <Trophy className="w-4 h-4 text-[#f6bb1f] group-hover:rotate-12 transition-transform" />
              </div>
              <div className="my-1">
                <p className="font-black text-sm text-[#0d1c2e]">Sproutling Stage</p>
                <p className="text-[11px] text-[#6d7b6d] mt-0.5">3 more days of streak</p>
              </div>
              <div className="text-[11px] font-bold text-[#0060ac] flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                Evolution Roadmap <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Today's Habits Checklist (7 cols) */}
        <div className="lg:col-span-6 xl:col-span-7 space-y-4">
          <div className="bg-[#ffffff] rounded-3xl p-5 sm:p-6 border border-[#bccabb]/30 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-black text-[#0d1c2e] tracking-tight">Today's Habits</h2>
                <p className="text-xs text-[#6d7b6d] font-medium mt-0.5">
                  Check off routines or log incremental counts to level up {currentPet.name}!
                </p>
              </div>
              <button
                onClick={() => setIsAddHabitModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#eff4ff] hover:bg-[#4ade80]/20 text-[#006d36] border border-[#bccabb]/30 rounded-xl font-bold text-xs transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>

            {/* Habits List */}
            <div className="space-y-3">
              {habits.map((habit) => {
                const isCompleted = habit.completedToday;
                const hasTarget = habit.targetCount && habit.targetCount > 1;

                return (
                  <div
                    key={habit.id}
                    className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 select-none ${
                      isCompleted
                        ? 'bg-[#f0fdf4] border-[#4ade80]/60 shadow-xs'
                        : 'bg-[#ffffff] border-[#bccabb]/30 hover:border-[#4ade80]/60 hover:bg-[#eff4ff]/30 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      {/* Checkbox circle */}
                      <button
                        type="button"
                        onClick={(e) => toggleHabit(habit.id, e)}
                        className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all shrink-0 ${
                          isCompleted
                            ? 'bg-[#006d36] text-white shadow-xs scale-105'
                            : 'border-2 border-[#bccabb] bg-white hover:border-[#006d36]'
                        }`}
                      >
                        {isCompleted && <Check className="w-4 h-4 stroke-[3]" />}
                      </button>

                      {/* Text details */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className={`font-black text-sm tracking-tight truncate ${
                              isCompleted ? 'text-[#005e2d] line-through opacity-80' : 'text-[#0d1c2e]'
                            }`}
                          >
                            {habit.name}
                          </p>
                          {habit.timeOfDay && habit.timeOfDay !== 'anytime' && (
                            <span className="text-[10px] text-[#6d7b6d] flex items-center gap-0.5 capitalize">
                              <Clock className="w-3 h-3" /> {habit.timeOfDay}
                            </span>
                          )}
                        </div>

                        {habit.description && (
                          <p className="text-[11px] text-[#6d7b6d] truncate mt-0.5">
                            {habit.description}
                          </p>
                        )}

                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getCategoryColor(
                              habit.category
                            )}`}
                          >
                            {habit.category}
                          </span>
                          <span className="text-[11px] text-[#6d7b6d] font-semibold">
                            +{habit.points} Leafs
                          </span>

                          {hasTarget && (
                            <span className="text-[10px] font-bold text-[#0060ac] bg-[#eff4ff] px-2 py-0.5 rounded-md">
                              {habit.currentCount || 0}/{habit.targetCount} {habit.unit || 'times'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Controls: Increment + Edit + Streak */}
                    <div className="flex items-center gap-2 shrink-0">
                      {hasTarget && !isCompleted && (
                        <button
                          type="button"
                          onClick={(e) => incrementHabitCount(habit.id, e)}
                          className="px-2.5 py-1 rounded-xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0060ac] text-xs font-black border border-[#bccabb]/40 active:scale-95 transition-all flex items-center gap-1"
                          title="Log 1 count"
                        >
                          <Plus className="w-3 h-3" /> +1
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setEditingHabit(habit);
                          setIsEditHabitModalOpen(true);
                        }}
                        className="p-1.5 rounded-xl hover:bg-[#eff4ff] text-[#6d7b6d] hover:text-[#0d1c2e] transition-colors"
                        title="Edit Habit"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Streak Badge */}
                      <div
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
                          habit.streak > 0
                            ? 'bg-[#ffdf9f]/50 text-[#795900] border border-[#f6bb1f]/40'
                            : 'bg-[#eff4ff] text-[#6d7b6d]'
                        }`}
                      >
                        <Flame
                          className={`w-3.5 h-3.5 ${
                            habit.streak > 0 ? 'text-[#f6bb1f] fill-[#f6bb1f]' : 'text-[#bccabb]'
                          }`}
                        />
                        <span>{habit.streak}d</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Manage Link */}
            <div className="mt-5 pt-4 border-t border-[#bccabb]/20 flex justify-between items-center text-xs">
              <span className="text-[#6d7b6d] font-medium">
                Want to organize categories or create schedules?
              </span>
              <button
                onClick={() => setActiveTab('habits')}
                className="font-bold text-[#006d36] hover:underline flex items-center gap-1"
              >
                Manage Routines <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Bag Modal */}
      <InventoryModal isOpen={isInventoryOpen} onClose={() => setIsInventoryOpen(false)} />
    </div>
  );
};
