import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InteractivePet2D, PetMood } from '../pet2d/InteractivePet2D';
import {
  Heart,
  Sparkles,
  Cookie,
  Gamepad2,
  Smile,
  ShieldCheck,
  TrendingUp,
  Droplets,
  Zap,
} from 'lucide-react';

export const PetStatsScreen: React.FC = () => {
  const { currentPet, interactWithPet } = useApp();
  const [activeMoodDay, setActiveMoodDay] = useState<string | null>('Sun');

  const moodDays = [
    { day: 'Mon', score: 78, mood: 'Content' },
    { day: 'Tue', score: 85, mood: 'Happy' },
    { day: 'Wed', score: 92, mood: 'Ecstatic' },
    { day: 'Thu', score: 80, mood: 'Happy' },
    { day: 'Fri', score: 96, mood: 'Joyful' },
    { day: 'Sat', score: 90, mood: 'Joyful' },
    { day: 'Sun', score: 94, mood: 'Ecstatic' },
  ];

  const petXpPercent = Math.min(100, Math.round((currentPet.currentXp / currentPet.maxXp) * 100));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-6 pb-24 md:pb-12 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#bccabb]/30 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0d1c2e] tracking-tight">
              {currentPet.name}'s Wellness & Stats
            </h1>
            <span className="px-3 py-1 bg-[#4ade80]/20 text-[#005e2d] font-bold text-xs rounded-full border border-[#4ade80]/30">
              Level {currentPet.growthLevel} {currentPet.title}
            </span>
            <span className="px-3 py-1 bg-[#dce9ff] text-[#0060ac] font-bold text-xs rounded-full flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> {currentPet.healthStatus}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6d7b6d] font-medium mt-1">
            Real-time biometric mood, habit nutrition balance, and evolution telemetry.
          </p>
        </div>
      </div>

      {/* Grid: 3D Stage Left / Mood & Telemetry Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 3D Character Stage & XP Breakdown (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Character Stage */}
          <div className="bg-white rounded-3xl p-6 border border-[#bccabb]/30 shadow-md relative overflow-hidden flex flex-col items-center">
            <div className="absolute top-10 w-72 h-72 bg-[#4ade80]/15 rounded-full blur-3xl pointer-events-none" />

            {/* 2D Interactive Pet Character Model */}
            <div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center my-2 overflow-visible">
              <InteractivePet2D pet={currentPet} scale={1.25} mood="happy" />
            </div>

            {/* Interactive Care Bar */}
            <div className="w-full grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-[#bccabb]/20 z-10">
              <button
                onClick={() => interactWithPet('feed')}
                className="py-3 px-2 rounded-2xl bg-[#eff4ff] hover:bg-[#4ade80]/20 border border-[#bccabb]/30 hover:border-[#4ade80] transition-all flex flex-col items-center gap-1 active:scale-95 group"
              >
                <Cookie className="w-5 h-5 text-[#006d36] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-[#0d1c2e]">Feed Treat</span>
              </button>

              <button
                onClick={() => interactWithPet('play')}
                className="py-3 px-2 rounded-2xl bg-[#eff4ff] hover:bg-[#ffdf9f]/40 border border-[#bccabb]/30 hover:border-[#f6bb1f] transition-all flex flex-col items-center gap-1 active:scale-95 group"
              >
                <Gamepad2 className="w-5 h-5 text-[#795900] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-[#0d1c2e]">Play Game</span>
              </button>

              <button
                onClick={() => interactWithPet('pet')}
                className="py-3 px-2 rounded-2xl bg-[#eff4ff] hover:bg-[#ffdad6]/40 border border-[#bccabb]/30 hover:border-[#ba1a1a] transition-all flex flex-col items-center gap-1 active:scale-95 group"
              >
                <Heart className="w-5 h-5 text-[#ba1a1a] group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-[#0d1c2e]">Cuddle & Pet</span>
              </button>
            </div>
          </div>

          {/* XP & Evolution Progress */}
          <div className="bg-white rounded-3xl p-6 border border-[#bccabb]/30 shadow-md space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#f6bb1f] fill-[#f6bb1f]" />
                <h3 className="font-extrabold text-base text-[#0d1c2e]">Evolution Progress</h3>
              </div>
              <span className="text-xs font-black text-[#006d36] bg-[#4ade80]/20 px-2.5 py-0.5 rounded-full">
                {petXpPercent}%
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="w-full h-3.5 bg-[#e6eeff] rounded-full overflow-hidden p-0.5 border border-[#bccabb]/30">
                <div
                  className="h-full bg-gradient-to-r from-[#4ade80] to-[#006d36] rounded-full progress-shimmer transition-all duration-500"
                  style={{ width: `${petXpPercent}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-[#6d7b6d] font-bold">
                <span>Current: {currentPet.currentXp} XP</span>
                <span>Next Stage: {currentPet.maxXp} XP</span>
              </div>
            </div>

            {/* XP Breakdown Grid */}
            <div className="grid grid-cols-3 gap-3 pt-3 border-t border-[#bccabb]/20 text-center">
              <div className="bg-[#f8f9ff] p-3 rounded-2xl border border-[#bccabb]/20">
                <span className="text-[10px] uppercase font-bold text-[#6d7b6d] block">Habits XP</span>
                <span className="font-black text-sm text-[#006d36]">
                  {Math.round(currentPet.currentXp * 0.7)}
                </span>
              </div>
              <div className="bg-[#f8f9ff] p-3 rounded-2xl border border-[#bccabb]/20">
                <span className="text-[10px] uppercase font-bold text-[#6d7b6d] block">Quest XP</span>
                <span className="font-black text-sm text-[#0060ac]">
                  {Math.round(currentPet.currentXp * 0.2)}
                </span>
              </div>
              <div className="bg-[#f8f9ff] p-3 rounded-2xl border border-[#bccabb]/20">
                <span className="text-[10px] uppercase font-bold text-[#6d7b6d] block">Bonus XP</span>
                <span className="font-black text-sm text-[#795900]">
                  {Math.round(currentPet.currentXp * 0.1)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Happiness, 7-Day Mood Chart, Health (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          {/* Happiness Overview */}
          <div className="bg-white rounded-3xl p-6 border border-[#bccabb]/30 shadow-md space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-[#006d36]" />
                <h3 className="font-extrabold text-base text-[#0d1c2e]">Happiness Index</h3>
              </div>
              <span className="text-xl font-black text-[#006d36]">
                Joyful {currentPet.happinessPct}%
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-[#eff4ff] p-3.5 rounded-2xl text-center border border-[#bccabb]/30">
                <span className="text-[10px] font-bold text-[#6d7b6d] block">Recent Play</span>
                <span className="font-extrabold text-sm text-[#0060ac]">
                  +{currentPet.playtimeRecentPct}%
                </span>
              </div>
              <div className="bg-[#4ade80]/15 p-3.5 rounded-2xl text-center border border-[#4ade80]/30">
                <span className="text-[10px] font-bold text-[#005e2d] block">Habit Done</span>
                <span className="font-extrabold text-sm text-[#006d36]">
                  +{currentPet.habitCompletionPct}%
                </span>
              </div>
              <div className="bg-[#ffdf9f]/30 p-3.5 rounded-2xl text-center border border-[#ffdf9f]">
                <span className="text-[10px] font-bold text-[#795900] block">Treats Given</span>
                <span className="font-extrabold text-sm text-[#795900]">
                  +{currentPet.treatsGivenPct}%
                </span>
              </div>
            </div>
          </div>

          {/* 7-Day Mood History Chart */}
          <div className="bg-white rounded-3xl p-6 border border-[#bccabb]/30 shadow-md space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#0060ac]" />
                <h3 className="font-extrabold text-base text-[#0d1c2e]">7-Day Mood Rhythm</h3>
              </div>
              {activeMoodDay && (
                <span className="text-xs font-extrabold text-[#006d36] bg-[#4ade80]/20 px-2.5 py-0.5 rounded-full">
                  {activeMoodDay}: {moodDays.find((m) => m.day === activeMoodDay)?.score}% (
                  {moodDays.find((m) => m.day === activeMoodDay)?.mood})
                </span>
              )}
            </div>

            {/* Custom Bar Chart */}
            <div className="pt-6 pb-2 flex items-end justify-between gap-2 h-44 px-2">
              {moodDays.map((item) => {
                const isSelected = activeMoodDay === item.day;
                return (
                  <div
                    key={item.day}
                    onClick={() => setActiveMoodDay(item.day)}
                    className="flex-1 flex flex-col items-center gap-2 cursor-pointer group"
                  >
                    <div className="w-full flex justify-center items-end h-28">
                      <div
                        className={`w-full max-w-[28px] rounded-t-xl transition-all duration-300 relative group-hover:scale-105 ${
                          isSelected
                            ? 'bg-[#006d36] shadow-md ring-2 ring-[#4ade80]'
                            : 'bg-[#4ade80]/40 hover:bg-[#4ade80]'
                        }`}
                        style={{ height: `${item.score}%` }}
                      >
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold bg-[#0d1c2e] text-white px-1.5 py-0.5 rounded shadow">
                          {item.score}%
                        </span>
                      </div>
                    </div>
                    <span
                      className={`text-xs font-bold transition-colors ${
                        isSelected ? 'text-[#006d36]' : 'text-[#6d7b6d]'
                      }`}
                    >
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Health & Vitality Card */}
          <div className="bg-gradient-to-r from-[#eff4ff] to-[#e6eeff] rounded-3xl p-6 border border-[#bccabb]/30 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#006d36]" />
                <h3 className="font-extrabold text-base text-[#0d1c2e]">Biometric Vitals</h3>
              </div>
              <span className="text-xs font-black text-[#006d36] bg-white px-3 py-1 rounded-full shadow-sm">
                Status: {currentPet.healthStatus}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-3.5 rounded-2xl border border-[#bccabb]/20 shadow-sm space-y-1">
                <div className="flex items-center gap-1 text-[#0060ac]">
                  <Droplets className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase">Hydration</span>
                </div>
                <p className="font-black text-base text-[#0d1c2e]">100%</p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#bccabb]/20 shadow-sm space-y-1">
                <div className="flex items-center gap-1 text-[#006d36]">
                  <Zap className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase">Energy</span>
                </div>
                <p className="font-black text-base text-[#0d1c2e]">96%</p>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-[#bccabb]/20 shadow-sm space-y-1">
                <div className="flex items-center gap-1 text-[#ba1a1a]">
                  <Heart className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase">Immunity</span>
                </div>
                <p className="font-black text-base text-[#0d1c2e]">94%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
