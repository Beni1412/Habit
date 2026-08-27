import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Heart,
  Sparkles,
  Gift,
  Clock,
  Star,
  Cookie,
  Lock,
  Flame,
  UserCheck,
  TrendingUp,
  UserPlus,
  MessageCircle,
  Zap,
} from 'lucide-react';

export const SanctuaryScreen: React.FC = () => {
  const {
    duoPartner,
    sendDuoGift,
    cheerDuoPartner,
    playtimeData,
    setIsAddPartnerModalOpen,
  } = useApp();

  return (
    <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 md:px-8 py-5 pb-24 md:pb-12 space-y-6">
      {/* Duo Sanctuary Hero Card */}
      <div className="relative rounded-3xl overflow-hidden shadow-lg border border-[#bccabb]/30 bg-gradient-to-br from-[#eff4ff] to-[#dce9ff]">
        {/* Background Atmosphere Image */}
        <div className="absolute inset-0 z-0 opacity-40">
          <img
            src={duoPartner.sharedSanctuaryBg}
            alt="Sanctuary Island"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f8f9ff] via-[#f8f9ff]/70 to-transparent" />
        </div>

        <div className="relative z-10 p-5 sm:p-8 space-y-5">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full bg-[#ba1a1a]/15 text-[#ba1a1a] font-black text-xs uppercase tracking-wider flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5 fill-[#ba1a1a]" /> Duo Sanctuary
                </span>
                <span className="px-2.5 py-0.5 bg-white text-[#0060ac] rounded-full text-xs font-black shadow-xs">
                  {duoPartner.bondPoints} Bond Points
                </span>
                {duoPartner.friendCode && (
                  <span className="px-2.5 py-0.5 bg-white/80 text-[#6d7b6d] rounded-full text-[10px] font-mono font-bold">
                    {duoPartner.friendCode}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0d1c2e] tracking-tight mt-1">
                Shared Island Sanctuary
              </h1>
              <p className="text-xs sm:text-sm text-[#3d4a3e] font-medium">
                Collaborate with {duoPartner.name} & {duoPartner.partnerPetName} to maintain dual streak power and share rewards!
              </p>
            </div>

            {/* Action Group */}
            <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
              <button
                onClick={() => setIsAddPartnerModalOpen(true)}
                className="px-4 py-2.5 rounded-2xl bg-white hover:bg-[#eff4ff] text-[#0060ac] border border-[#bccabb]/40 font-bold text-xs sm:text-sm shadow-xs transition-all active:scale-95 flex items-center gap-1.5 justify-center flex-1 sm:flex-none"
              >
                <UserPlus className="w-4 h-4" /> Change / Add Partner
              </button>

              <button
                onClick={sendDuoGift}
                className="px-4 py-2.5 rounded-2xl bg-[#006d36] hover:bg-[#005e2d] text-white font-black text-xs sm:text-sm shadow-md transition-all bouncy-button border-b-[#004722] flex items-center gap-1.5 justify-center flex-1 sm:flex-none"
              >
                <Gift className="w-4 h-4" /> Send Care Gift (+50 pts)
              </button>
            </div>
          </div>

          {/* Partner & Synergy Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {/* Partner Card */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-[#bccabb]/40 shadow-xs flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#4ade80] shadow shrink-0">
                <img
                  src={duoPartner.partnerAvatar}
                  alt={duoPartner.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-black text-sm text-[#0d1c2e] truncate">{duoPartner.name}</h3>
                  <UserCheck className="w-3.5 h-3.5 text-[#006d36]" />
                </div>
                <p className="text-xs text-[#6d7b6d] font-medium">
                  Partner Pet: <span className="font-bold text-[#0060ac]">{duoPartner.partnerPetName}</span> (Lvl {duoPartner.partnerLevel})
                </p>
                {duoPartner.statusMessage && (
                  <p className="text-[10px] text-[#6d7b6d] truncate italic mt-0.5">
                    "{duoPartner.statusMessage}"
                  </p>
                )}
              </div>
            </div>

            {/* Daily Synergy */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 border border-[#bccabb]/40 shadow-xs flex flex-col justify-between">
              <div className="flex justify-between items-center text-xs font-bold">
                <span className="text-[#6d7b6d]">Daily Synergy</span>
                <span className="text-[#006d36] font-black">{duoPartner.dailySynergyPct}%</span>
              </div>
              <div className="w-full h-2.5 bg-[#e6eeff] rounded-full overflow-hidden my-2">
                <div
                  className="h-full bg-gradient-to-r from-[#4ade80] to-[#006d36] rounded-full transition-all duration-500 progress-shimmer"
                  style={{ width: `${duoPartner.dailySynergyPct}%` }}
                />
              </div>
              <span className="text-[11px] text-[#3d4a3e] font-bold">
                🔥 1.5x Habit Multiplier active today
              </span>
            </div>

            {/* Quick Cheers */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3.5 border border-[#bccabb]/40 shadow-xs flex flex-col justify-between">
              <span className="text-xs font-bold text-[#6d7b6d] mb-1">Quick Partner Cheers</span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => cheerDuoPartner('High-Five 🙌')}
                  className="py-1.5 px-2 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0060ac] rounded-xl text-[11px] font-bold transition-all active:scale-95 truncate"
                >
                  🙌 High Five
                </button>
                <button
                  onClick={() => cheerDuoPartner('Fire Boost 🔥')}
                  className="py-1.5 px-2 bg-[#ffdf9f]/30 hover:bg-[#ffdf9f]/60 text-[#795900] rounded-xl text-[11px] font-bold transition-all active:scale-95 truncate"
                >
                  🔥 Boost
                </button>
                <button
                  onClick={() => cheerDuoPartner('Care Heart 💖')}
                  className="py-1.5 px-2 bg-[#ffdad6]/40 hover:bg-[#ffdad6]/80 text-[#ba1a1a] rounded-xl text-[11px] font-bold transition-all active:scale-95 truncate"
                >
                  💖 Heart
                </button>
              </div>
              <span className="text-[10px] text-[#006d36] font-bold mt-1 text-center">
                +20 Bond Points per cheer
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Playtime Analytics Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#006d36]" />
          <h2 className="text-xl font-black text-[#0d1c2e] tracking-tight">
            Playtime & Habit Analytics
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Hero Duration Stat Card (6 cols) */}
          <div className="md:col-span-6 bg-white rounded-3xl p-5 sm:p-7 border border-[#bccabb]/30 shadow-md space-y-5 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <span className="text-xs font-black text-[#6d7b6d] uppercase tracking-wider">
                  Total Playtime & Habit Dedication
                </span>
                <span className="px-3 py-1 bg-[#4ade80]/20 text-[#005e2d] font-black text-xs rounded-full flex items-center gap-1 border border-[#4ade80]/30">
                  <TrendingUp className="w-3.5 h-3.5" /> {playtimeData.weekChange}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-black text-[#0d1c2e] tracking-tight">
                  {playtimeData.totalHours}h {playtimeData.totalMinutes}m
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-4 border-t border-[#bccabb]/20">
              <div className="bg-[#f8f9ff] p-3 rounded-2xl border border-[#bccabb]/20">
                <span className="text-xs font-bold text-[#6d7b6d] block">Today</span>
                <span className="text-base sm:text-lg font-black text-[#0d1c2e]">
                  {playtimeData.todayDuration}
                </span>
              </div>
              <div className="bg-[#f8f9ff] p-3 rounded-2xl border border-[#bccabb]/20">
                <span className="text-xs font-bold text-[#6d7b6d] block">Daily Average</span>
                <span className="text-base sm:text-lg font-black text-[#0d1c2e]">
                  {playtimeData.dailyAvgDuration}
                </span>
              </div>
            </div>
          </div>

          {/* Bonding Level Circular Indicator (6 cols) */}
          <div className="md:col-span-6 bg-white rounded-3xl p-5 sm:p-7 border border-[#bccabb]/30 shadow-md flex items-center justify-between gap-5">
            <div className="space-y-2">
              <span className="text-xs font-black text-[#6d7b6d] uppercase tracking-wider">
                Companion Bond Level
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-[#0d1c2e]">
                Level {playtimeData.bondingLevel}: {playtimeData.bondingTitle}
              </h3>
              <p className="text-xs text-[#3d4a3e] max-w-xs leading-relaxed">
                Your deep daily commitment and care habits have established an unbreakable bond.
              </p>
              <div className="pt-1">
                <span className="text-xs font-bold text-[#006d36] bg-[#4ade80]/20 px-3 py-1 rounded-full">
                  {playtimeData.bondingProgressPct}% to Level {playtimeData.bondingLevel + 1}
                </span>
              </div>
            </div>

            {/* Circular Ring */}
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#e6eeff]"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#006d36]"
                  strokeDasharray={`${playtimeData.bondingProgressPct}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <Heart className="w-5 h-5 text-[#ba1a1a] fill-[#ba1a1a] animate-heart-pulse" />
                <span className="text-xs font-black text-[#0d1c2e] mt-0.5">
                  {playtimeData.bondingProgressPct}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Distribution & Rewards Row */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Playtime Distribution (7 cols) */}
          <div className="md:col-span-7 bg-white rounded-3xl p-5 sm:p-6 border border-[#bccabb]/30 shadow-md space-y-4">
            <h3 className="font-black text-base text-[#0d1c2e]">Care Time Distribution</h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#3d4a3e]">Active Play & Focus Sprints</span>
                  <span className="text-[#006d36]">{playtimeData.distribution.activePlayPct}%</span>
                </div>
                <div className="w-full h-3 bg-[#eff4ff] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#006d36] rounded-full"
                    style={{ width: `${playtimeData.distribution.activePlayPct}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#3d4a3e]">Habit Grooming & Feeding</span>
                  <span className="text-[#0060ac]">{playtimeData.distribution.groomingPct}%</span>
                </div>
                <div className="w-full h-3 bg-[#eff4ff] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#0060ac] rounded-full"
                    style={{ width: `${playtimeData.distribution.groomingPct}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[#3d4a3e]">Idle Sanctuary Bonding</span>
                  <span className="text-[#795900]">{playtimeData.distribution.idleBondingPct}%</span>
                </div>
                <div className="w-full h-3 bg-[#eff4ff] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#f6bb1f] rounded-full"
                    style={{ width: `${playtimeData.distribution.idleBondingPct}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Playtime Rewards Shelf (5 cols) */}
          <div className="md:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-[#bccabb]/30 shadow-md space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-base text-[#0d1c2e]">Milestone Rewards</h3>
              <Sparkles className="w-4 h-4 text-[#f6bb1f]" />
            </div>

            <div className="space-y-2.5">
              {playtimeData.rewards.map((reward) => (
                <div
                  key={reward.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between ${
                    reward.unlocked
                      ? 'bg-[#f8f9ff] border-[#bccabb]/30'
                      : 'bg-[#eff4ff]/50 border-[#bccabb]/20 opacity-70'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shadow-inner"
                      style={{ backgroundColor: `${reward.accentColor}20` }}
                    >
                      {reward.icon === 'star' && <Star className="w-4 h-4 text-[#006d36] fill-[#006d36]" />}
                      {reward.icon === 'cookie' && <Cookie className="w-4 h-4 text-[#0060ac]" />}
                      {reward.icon === 'lock' && <Lock className="w-4 h-4 text-[#6d7b6d]" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-[#0d1c2e]">{reward.name}</h4>
                      <span className="text-[11px] font-black text-[#6d7b6d]">
                        {typeof reward.points === 'number' ? `+${reward.points} Pts` : reward.points}
                      </span>
                    </div>
                  </div>

                  {reward.unlocked ? (
                    <span className="text-[10px] font-bold text-[#006d36] bg-[#4ade80]/20 px-2 py-0.5 rounded-full">
                      Claimed
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-[#6d7b6d] bg-[#eff4ff] px-2 py-0.5 rounded-full">
                      Locked
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
