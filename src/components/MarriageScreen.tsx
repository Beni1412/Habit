import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MarriageSuitor } from '../types';
import { MARRIAGE_SUITORS } from '../data/initialData';
import { InteractivePet2D } from './pet2d/InteractivePet2D';
import {
  Heart,
  Sparkles,
  Gem,
  Gift,
  Send,
  Egg,
  Smile,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Flame,
  Award,
  Crown,
  Trash2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const MarriageScreen: React.FC = () => {
  const {
    currentPet,
    marriage,
    proposeMarriage,
    divorcePet,
    sendLoveNote,
    sendLoveGift,
    hatchBabyEgg,
    storeItems,
    leafPoints,
    buyStoreItem,
    switchCompanion,
    setActiveTab,
  } = useApp();

  const [selectedSuitor, setSelectedSuitor] = useState<MarriageSuitor | null>(null);
  const [customVows, setCustomVows] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [babyNameInput, setBabyNameInput] = useState('');
  const [isHatchingModalOpen, setIsHatchingModalOpen] = useState(false);
  const [isDivorceConfirmOpen, setIsDivorceConfirmOpen] = useState(false);

  // Check rings in inventory
  const ownedRings = storeItems.filter(
    (item) => item.category === 'marriage' && item.isPurchased
  );
  const availableRingInStore = storeItems.find((i) => i.id === 'wedding_ring_bloom');

  const handlePropose = (suitor: MarriageSuitor) => {
    // If no ring, check if can buy bloom ring
    const ringToUse = ownedRings[0] || availableRingInStore;
    if (!ownedRings.length && availableRingInStore) {
      if (leafPoints >= availableRingInStore.cost) {
        buyStoreItem(availableRingInStore.id);
      }
    }
    proposeMarriage(suitor, ringToUse ? ringToUse.id : 'wedding_ring_bloom', customVows || undefined);
    setSelectedSuitor(null);
    setCustomVows('');
  };

  const handleHatch = () => {
    hatchBabyEgg(babyNameInput.trim() || undefined);
    setIsHatchingModalOpen(false);
    setBabyNameInput('');
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-3.5 sm:px-6 py-6 pb-28 space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#ffe4e6] via-[#fdf2f8] to-[#f0fdf4] border border-[#fbcfe8] p-6 sm:p-8 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-black text-[#e11d48] border border-[#fecdd3] shadow-xs">
              <Heart className="w-3.5 h-3.5 fill-[#e11d48]" />
              <span>Pet Marriage & Offspring Sanctuary</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-[#1e293b] tracking-tight">
              {marriage.isMarried
                ? `${currentPet.name} & ${marriage.partnerPetName}'s Love Garden`
                : `Find True Love for ${currentPet.name}`}
            </h1>
            <p className="text-xs sm:text-sm text-[#64748b] max-w-xl">
              {marriage.isMarried
                ? `Married on ${marriage.marriageDate}. Enjoy a permanent +25% XP multiplier on all completed daily habits!`
                : `Propose to charming companions, earn wedding rings, incubate sacred eggs through daily routines, and raise adorable baby pets!`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {marriage.isMarried && (
              <div className="bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#fbcfe8] text-center shadow-xs">
                <span className="text-[10px] font-black text-[#94a3b8] uppercase tracking-wider block">
                  Love Bond Level
                </span>
                <span className="text-lg font-black text-[#e11d48] flex items-center justify-center gap-1">
                  <Crown className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" /> Lvl {marriage.loveBondLevel} ({marriage.loveTitle})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* IF PET IS MARRIED */}
      {marriage.isMarried ? (
        <div className="space-y-6">
          {/* Couple Showcase Card */}
          <div className="bg-white rounded-3xl border border-[#bccabb]/40 p-6 sm:p-8 shadow-sm">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Couple Visual Avatars */}
              <div className="lg:col-span-5 flex items-center justify-center">
                <div className="relative flex items-center justify-center">
                  {/* Heart Glow backdrop */}
                  <div className="absolute w-48 h-48 sm:w-56 sm:h-56 bg-rose-200/50 rounded-full blur-2xl animate-pulse" />

                  {/* Player Pet */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                    className="relative z-10 text-center flex flex-col items-center"
                  >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-visible border-4 border-[#006d36] bg-emerald-50 shadow-md flex items-center justify-center">
                      <InteractivePet2D pet={currentPet} scale={0.55} mood="celebrating" />
                    </div>
                    <span className="inline-block mt-2 font-black text-xs text-[#0d1c2e] bg-white px-2.5 py-0.5 rounded-full border border-[#bccabb]/40 shadow-2xs">
                      {currentPet.name}
                    </span>
                  </motion.div>

                  {/* Intertwined Heart Badge */}
                  <div className="relative z-20 -mx-3 bg-white p-2.5 rounded-full border-2 border-rose-400 shadow-lg text-rose-500">
                    <Heart className="w-6 h-6 fill-rose-500 animate-bounce" />
                  </div>

                  {/* Partner Pet */}
                  <motion.div
                    animate={{ y: [0, -6, 0] }}
                    transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut', delay: 1.5 }}
                    className="relative z-10 text-center flex flex-col items-center"
                  >
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-visible border-4 border-rose-400 bg-rose-50 shadow-md flex items-center justify-center">
                      <InteractivePet2D
                        pet={{
                          id: (marriage.partnerPetId as any) || 'ember',
                          name: marriage.partnerPetName,
                          element: 'fire',
                        } as any}
                        scale={0.55}
                        mood="celebrating"
                        isFacingLeft={true}
                      />
                    </div>
                    <span className="inline-block mt-2 font-black text-xs text-[#0d1c2e] bg-white px-2.5 py-0.5 rounded-full border border-[#bccabb]/40 shadow-2xs">
                      {marriage.partnerPetName}
                    </span>
                  </motion.div>
                </div>
              </div>

              {/* Couple Details & Perks */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#bccabb]/20 pb-3">
                  <div>
                    <h2 className="text-xl font-black text-[#0d1c2e] flex items-center gap-2">
                      <span>Eternal Union</span>
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                        {marriage.loveTitle}
                      </span>
                    </h2>
                    <p className="text-xs text-[#6d7b6d] flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-3.5 h-3.5 text-rose-500" />
                      Solemnized on {marriage.marriageDate} • Guardian: {marriage.partnerOwnerName}
                    </p>
                  </div>

                  <button
                    onClick={() => setIsDivorceConfirmOpen(true)}
                    className="text-xs font-bold text-[#ba1a1a] hover:bg-rose-50 px-3 py-1 rounded-full border border-rose-200 transition-colors"
                  >
                    Amicable Divorce
                  </button>
                </div>

                {/* Wedding Vows */}
                <div className="bg-rose-50/60 rounded-2xl p-4 border border-rose-100 italic text-xs text-rose-900 leading-relaxed">
                  "{marriage.weddingVows}"
                </div>

                {/* Active Perks */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-3 rounded-2xl flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#065f46]">{marriage.ringBonus}</p>
                      <p className="text-[10px] text-[#047857]">Ring: {marriage.ringType}</p>
                    </div>
                  </div>

                  <div className="bg-[#eff6ff] border border-[#bfdbfe] p-3 rounded-2xl flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-[#1e40af]">Partner Synergy Active</p>
                      <p className="text-[10px] text-[#2563eb]">Increases focus & battle stat growth</p>
                    </div>
                  </div>
                </div>

                {/* Love Exp Bar & Quick Actions */}
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[#3d4a3e]">Affection & Synergy EXP</span>
                    <span className="text-rose-600 font-extrabold">
                      {marriage.loveExp} / {marriage.maxLoveExp} XP
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-[#bccabb]/30">
                    <div
                      className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (marriage.loveExp / marriage.maxLoveExp) * 100)}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => sendLoveGift('Sweet Sakura Bouquet')}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all shadow-xs"
                    >
                      <Gift className="w-4 h-4" /> Send Love Gift (+60 XP)
                    </button>
                    <button
                      onClick={() => setActiveTab('battle')}
                      className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 bg-[#006d36] hover:bg-[#005a2b] active:scale-95 text-white font-bold text-xs py-2 px-3 rounded-xl transition-all shadow-xs"
                    >
                      <Flame className="w-4 h-4" /> Duo Battle Arena
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sacred Love Egg & Nursery Section */}
          <div className="bg-gradient-to-br from-[#fdf2f8] via-[#ffffff] to-[#eff6ff] rounded-3xl border border-[#fbcfe8] p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div>
                <div className="inline-flex items-center gap-1.5 text-rose-600 font-extrabold text-xs uppercase tracking-wider mb-1">
                  <Egg className="w-4 h-4" /> Sacred Egg Nursery
                </div>
                <h3 className="text-xl font-black text-[#0d1c2e]">
                  {marriage.babyEgg.isHatched
                    ? `Pet Offspring: ${marriage.babyEgg.babyName}`
                    : marriage.babyEgg.eggName}
                </h3>
                <p className="text-xs text-[#6d7b6d] mt-0.5">
                  {marriage.babyEgg.isHatched
                    ? `Hatched on ${marriage.babyEgg.hatchedDate}. Grants ${marriage.babyEgg.babyBonusDesc}!`
                    : `Complete daily habits to incubate the egg. Each completed habit warms the egg (+1 progress).`}
                </p>
              </div>

              {marriage.babyEgg.isHatched ? (
                <button
                  onClick={() => switchCompanion('baby_sprout')}
                  className="px-4 py-2 bg-[#006d36] hover:bg-[#005a2b] text-white font-bold text-xs rounded-2xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4" /> Switch to Baby Pet
                </button>
              ) : (
                <div className="bg-white px-4 py-2 rounded-2xl border border-rose-200 text-center shadow-xs">
                  <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider block">
                    Incubation
                  </span>
                  <span className="text-sm font-black text-rose-600">
                    {marriage.babyEgg.incubationProgress} / {marriage.babyEgg.maxProgress} Habits
                  </span>
                </div>
              )}
            </div>

            {/* Egg / Baby Showcase */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 flex flex-col items-center justify-center text-center">
                <div className="relative">
                  {/* Glowing background */}
                  <div className="absolute inset-0 bg-rose-300/40 rounded-full blur-xl animate-pulse" />

                  {marriage.babyEgg.isHatched ? (
                    <motion.div
                      animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                      transition={{ repeat: Infinity, duration: 4 }}
                      className="relative z-10 w-32 h-32 rounded-3xl overflow-hidden border-4 border-amber-300 shadow-xl bg-amber-50"
                    >
                      <img
                        src={marriage.babyEgg.babyAvatar}
                        alt="Baby Pet"
                        className="w-full h-full object-cover"
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{
                        rotate:
                          marriage.babyEgg.incubationProgress >= marriage.babyEgg.maxProgress
                            ? [-6, 6, -6]
                            : [-2, 2, -2],
                      }}
                      transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                      className="relative z-10 w-32 h-32 rounded-full overflow-hidden border-4 border-rose-300 shadow-xl bg-white p-2 flex items-center justify-center cursor-pointer"
                      onClick={() => {
                        if (marriage.babyEgg.incubationProgress >= marriage.babyEgg.maxProgress) {
                          setIsHatchingModalOpen(true);
                        }
                      }}
                    >
                      <img
                        src={marriage.babyEgg.eggImage}
                        alt="Sacred Egg"
                        className="w-full h-full object-contain"
                      />
                    </motion.div>
                  )}
                </div>

                <div className="mt-3">
                  <span className="font-black text-sm text-[#0d1c2e] block">
                    {marriage.babyEgg.isHatched
                      ? marriage.babyEgg.babyName
                      : marriage.babyEgg.incubationProgress >= marriage.babyEgg.maxProgress
                      ? 'Ready to Hatch! ✨'
                      : 'Incubating...'}
                  </span>
                  <span className="text-[11px] font-bold text-rose-500">
                    {marriage.babyEgg.isHatched
                      ? 'Baby Companion'
                      : `${Math.round(
                          (marriage.babyEgg.incubationProgress / marriage.babyEgg.maxProgress) * 100
                        )}% Warmth`}
                  </span>
                </div>
              </div>

              <div className="md:col-span-8 space-y-4">
                {!marriage.babyEgg.isHatched ? (
                  <>
                    {/* Incubation Step Bubbles */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold text-[#3d4a3e]">
                        <span>Daily Routine Incubation Milestones</span>
                        <span>
                          {marriage.babyEgg.incubationProgress}/{marriage.babyEgg.maxProgress} Complete
                        </span>
                      </div>
                      <div className="grid grid-cols-5 gap-2">
                        {Array.from({ length: marriage.babyEgg.maxProgress }).map((_, idx) => {
                          const isDone = idx < marriage.babyEgg.incubationProgress;
                          return (
                            <div
                              key={idx}
                              className={`h-10 rounded-xl flex items-center justify-center border font-extrabold text-xs transition-all ${
                                isDone
                                  ? 'bg-[#4ade80]/20 border-[#006d36] text-[#006d36] shadow-xs'
                                  : 'bg-white border-[#bccabb]/40 text-[#94a3b8]'
                              }`}
                            >
                              {isDone ? <CheckCircle2 className="w-5 h-5 text-[#006d36]" /> : `Step ${idx + 1}`}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Hatch Button */}
                    {marriage.babyEgg.incubationProgress >= marriage.babyEgg.maxProgress ? (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setIsHatchingModalOpen(true)}
                        className="w-full py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 text-white font-black text-sm rounded-2xl shadow-lg flex items-center justify-center gap-2 animate-bounce cursor-pointer"
                      >
                        <Sparkles className="w-5 h-5 fill-white" />
                        HATCH YOUR BABY PET NOW!
                      </motion.button>
                    ) : (
                      <div className="bg-white/80 p-3.5 rounded-2xl border border-rose-100 text-xs text-[#6d7b6d] flex items-center gap-2.5">
                        <Smile className="w-5 h-5 text-rose-500 shrink-0" />
                        <span>
                          Complete {marriage.babyEgg.maxProgress - marriage.babyEgg.incubationProgress} more habits
                          today to crack open this egg and meet your pet offspring!
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-white p-4 rounded-2xl border border-[#bccabb]/30 shadow-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-xs text-[#0d1c2e]">Offspring Bonus</span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Active Buff
                        </span>
                      </div>
                      <p className="text-xs text-[#3d4a3e]">{marriage.babyEgg.babyBonusDesc}</p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setActiveTab('habitat');
                        }}
                        className="flex-1 py-2.5 bg-white hover:bg-[#eff4ff] text-[#006d36] font-bold text-xs rounded-xl border border-[#bccabb]/40 transition-colors text-center"
                      >
                        Visit in Habitat Sanctuary
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Love Letters / Notes Wall */}
          <div className="bg-white rounded-3xl border border-[#bccabb]/40 p-6 sm:p-8 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#bccabb]/20 pb-3">
              <h3 className="font-black text-base text-[#0d1c2e] flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                Couple Love Notes Wall
              </h3>
              <span className="text-xs text-[#6d7b6d] font-bold">
                {marriage.loveNotes.length} Messages
              </span>
            </div>

            {/* Note Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && noteInput.trim()) {
                    sendLoveNote(noteInput);
                    setNoteInput('');
                  }
                }}
                placeholder={`Write a sweet message to ${marriage.partnerPetName}...`}
                className="flex-1 px-4 py-2.5 rounded-2xl border border-[#bccabb]/40 bg-[#f8f9ff] text-xs text-[#0d1c2e] focus:outline-none focus:border-rose-400 font-medium"
              />
              <button
                onClick={() => {
                  if (noteInput.trim()) {
                    sendLoveNote(noteInput);
                    setNoteInput('');
                  }
                }}
                className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Send className="w-3.5 h-3.5" /> Post
              </button>
            </div>

            {/* Notes List */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {marriage.loveNotes.map((note) => (
                <div
                  key={note.id}
                  className="bg-[#fff1f2] border border-[#ffe4e6] p-3 rounded-2xl flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-black text-rose-800 block text-[11px]">
                      {note.sender} 💕
                    </span>
                    <p className="text-rose-950 font-medium mt-0.5">{note.text}</p>
                  </div>
                  <span className="text-[10px] text-rose-400 font-bold shrink-0">{note.date}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* IF PET IS NOT MARRIED: THE WEDDING CHAPEL & SUITORS */
        <div className="space-y-6">
          {/* Benefits Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-[#bccabb]/40 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-2xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-black text-sm text-[#0d1c2e]">+25% Daily XP Buff</h4>
              <p className="text-xs text-[#6d7b6d]">
                Married pets receive a massive permanent boost to XP gained from all completed habits!
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#bccabb]/40 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-2xs">
                <Egg className="w-5 h-5" />
              </div>
              <h4 className="font-black text-sm text-[#0d1c2e]">Incubate Love Eggs</h4>
              <p className="text-xs text-[#6d7b6d]">
                Receive a sacred celestial egg upon marriage that hatches into a brand new baby companion pet!
              </p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-[#bccabb]/40 shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#006d36] flex items-center justify-center shadow-2xs">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-black text-sm text-[#0d1c2e]">Duo Battle Synergies</h4>
              <p className="text-xs text-[#6d7b6d]">
                Unlocks powerful romantic synergy skills and defensive shields in the Pet Battle Arena.
              </p>
            </div>
          </div>

          {/* Suitors Showcase */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h2 className="text-xl font-black text-[#0d1c2e]">
                  Eligible Companions for {currentPet.name}
                </h2>
                <p className="text-xs text-[#6d7b6d]">
                  Choose a romantic suitor with high compatibility to begin your wedding proposal!
                </p>
              </div>

              {ownedRings.length === 0 && (
                <div className="bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <Gem className="w-3.5 h-3.5 text-amber-600" />
                  <span>Proposal requires a Wedding Ring from Store (350 Leafs)</span>
                </div>
              )}
            </div>

            {/* Suitors Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {MARRIAGE_SUITORS.map((suitor) => {
                return (
                  <div
                    key={suitor.id}
                    className="bg-white rounded-3xl border border-[#bccabb]/40 hover:border-rose-300 p-5 shadow-xs transition-all duration-200 flex flex-col justify-between space-y-4 group hover:shadow-md"
                  >
                    <div className="space-y-3.5">
                      {/* Top row with avatar and match badge */}
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-16 h-16 rounded-2xl overflow-visible border-2 border-rose-200 bg-rose-50 shrink-0 flex items-center justify-center">
                          <InteractivePet2D
                            pet={{
                              id: (suitor.id.replace('suitor_', '') as any) || 'ember',
                              name: suitor.petName,
                              element: suitor.element as any,
                            } as any}
                            scale={0.4}
                            mood="idle"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-black text-sm text-[#0d1c2e] truncate">
                              {suitor.petName}
                            </h3>
                            <span className="text-[10px] font-extrabold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200 shrink-0">
                              {suitor.compatibilityScore}% Match
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-[#6d7b6d]">
                            Guardian: {suitor.name}
                          </p>
                          <span className="inline-block mt-0.5 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-[#006d36] rounded-md">
                            {suitor.tagLabel} • {suitor.element}
                          </span>
                        </div>
                      </div>

                      {/* Suitor Bio */}
                      <p className="text-xs text-[#3d4a3e] leading-relaxed line-clamp-2">
                        {suitor.bio}
                      </p>

                      {/* Suitor Details */}
                      <div className="bg-[#f8f9ff] p-3 rounded-2xl border border-[#bccabb]/20 space-y-1 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-[#6d7b6d] font-bold">Personality:</span>
                          <span className="text-[#0d1c2e] font-extrabold">{suitor.personality}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#6d7b6d] font-bold">Favorite Gift:</span>
                          <span className="text-rose-600 font-extrabold">{suitor.favoriteGift}</span>
                        </div>
                      </div>
                    </div>

                    {/* Propose Action */}
                    <button
                      onClick={() => setSelectedSuitor(suitor)}
                      className="w-full py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 fill-white" />
                      Propose Marriage
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PROPOSAL MODAL */}
      {selectedSuitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#bccabb]/40 p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-1.5">
              <div className="w-14 h-14 mx-auto rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
                <Heart className="w-7 h-7 fill-rose-600 animate-bounce" />
              </div>
              <h3 className="text-xl font-black text-[#0d1c2e]">
                Propose Marriage to {selectedSuitor.petName}!
              </h3>
              <p className="text-xs text-[#6d7b6d]">
                {currentPet.name} will present vows and a sacred wedding ring to {selectedSuitor.petName}.
              </p>
            </div>

            {/* Couple Preview */}
            <div className="flex items-center justify-center gap-4 bg-rose-50/70 p-4 rounded-2xl border border-rose-200">
              <div className="text-center">
                <img
                  src={currentPet.avatarImage}
                  alt={currentPet.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#006d36] mx-auto shadow-xs"
                />
                <span className="font-extrabold text-xs text-[#0d1c2e] mt-1 block">
                  {currentPet.name}
                </span>
              </div>

              <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />

              <div className="text-center">
                <img
                  src={selectedSuitor.petAvatar}
                  alt={selectedSuitor.petName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-rose-400 mx-auto shadow-xs"
                />
                <span className="font-extrabold text-xs text-[#0d1c2e] mt-1 block">
                  {selectedSuitor.petName}
                </span>
              </div>
            </div>

            {/* Vows Selection */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-[#0d1c2e] block">
                Wedding Vows Preset
              </label>
              <textarea
                value={customVows || selectedSuitor.vowsPreset}
                onChange={(e) => setCustomVows(e.target.value)}
                rows={2}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#bccabb]/50 bg-[#f8f9ff] text-xs text-[#0d1c2e] focus:outline-none focus:border-rose-400 font-medium"
              />
            </div>

            {/* Ring Status */}
            <div className="bg-[#f0fdf4] border border-[#bbf7d0] p-3 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Gem className="w-4 h-4 text-emerald-600" />
                <span className="font-extrabold text-[#065f46]">
                  {ownedRings.length > 0
                    ? `Equipped: ${ownedRings[0].name}`
                    : `Auto-purchase: Eternal Flora Ring (350 Leafs)`}
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700">Ready</span>
            </div>

            {/* Modal Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedSuitor(null)}
                className="flex-1 py-3 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#3d4a3e] font-bold text-xs rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handlePropose(selectedSuitor)}
                className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-black text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Heart className="w-4 h-4 fill-white" /> Confirm Vows & Marry!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HATCH BABY MODAL */}
      {isHatchingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-amber-200 p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-200 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shadow-md animate-bounce">
              <Sparkles className="w-10 h-10 fill-amber-500" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-black text-[#0d1c2e]">The Love Egg is Hatching! 🐣</h3>
              <p className="text-xs text-[#6d7b6d]">
                Your devotion to daily habits has brought life to this world! Choose a sweet name for your new baby pet:
              </p>
            </div>

            <input
              type="text"
              value={babyNameInput}
              onChange={(e) => setBabyNameInput(e.target.value)}
              placeholder="e.g. Sproutlet, Starlight, Pippin..."
              className="w-full px-4 py-3 rounded-2xl border border-amber-300 bg-amber-50/50 text-sm font-bold text-[#0d1c2e] focus:outline-none focus:border-amber-500 text-center"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setIsHatchingModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl"
              >
                Later
              </button>
              <button
                onClick={handleHatch}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-black text-xs rounded-xl shadow-md transition-transform active:scale-95"
              >
                Welcome to Family! 🎉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DIVORCE CONFIRM MODAL */}
      {isDivorceConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-rose-200 p-6 sm:p-8 space-y-4 animate-in zoom-in-95 duration-200 text-center">
            <h3 className="text-xl font-black text-[#ba1a1a]">Confirm Amicable Separation?</h3>
            <p className="text-xs text-[#6d7b6d]">
              This will reset current marriage status and vows. You can marry another companion anytime in the Grand Chapel!
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsDivorceConfirmOpen(false)}
                className="flex-1 py-3 bg-gray-100 font-bold text-xs rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  divorcePet();
                  setIsDivorceConfirmOpen(false);
                }}
                className="flex-1 py-3 bg-[#ba1a1a] text-white font-bold text-xs rounded-xl shadow-md"
              >
                Confirm Divorce
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
