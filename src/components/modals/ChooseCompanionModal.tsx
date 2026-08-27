import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { CompanionId, PetElement } from '../../types';
import { InteractivePet2D } from '../pet2d/InteractivePet2D';
import {
  X,
  Check,
  Sparkles,
  Zap,
  Target,
  Lock,
  Edit2,
  Heart,
  Swords,
  Shield,
  Search,
  Award,
  Flame,
  Droplets,
  HelpCircle,
} from 'lucide-react';

const ELEMENT_BADGES: Record<string, { label: string; bg: string; text: string; icon: string }> = {
  fire: { label: 'Fire', bg: 'bg-red-500/15 border-red-500/30', text: 'text-red-600', icon: '🔥' },
  water: { label: 'Water', bg: 'bg-blue-500/15 border-blue-500/30', text: 'text-blue-600', icon: '💧' },
  nature: { label: 'Nature', bg: 'bg-emerald-500/15 border-emerald-500/30', text: 'text-emerald-600', icon: '🌿' },
  bloom: { label: 'Fairy', bg: 'bg-pink-500/15 border-pink-500/30', text: 'text-pink-600', icon: '🌸' },
  thunder: { label: 'Electric', bg: 'bg-amber-500/15 border-amber-500/30', text: 'text-amber-600', icon: '⚡' },
  earth: { label: 'Ground', bg: 'bg-yellow-700/15 border-yellow-700/30', text: 'text-yellow-800', icon: '⛰️' },
  shadow: { label: 'Dark', bg: 'bg-purple-900/15 border-purple-900/30', text: 'text-purple-700', icon: '🌑' },
  ghost: { label: 'Ghost', bg: 'bg-indigo-900/15 border-indigo-900/30', text: 'text-indigo-600', icon: '👻' },
  psychic: { label: 'Psychic', bg: 'bg-fuchsia-500/15 border-fuchsia-500/30', text: 'text-fuchsia-600', icon: '🔮' },
  fighting: { label: 'Fighting', bg: 'bg-orange-600/15 border-orange-600/30', text: 'text-orange-700', icon: '🥊' },
  dragon: { label: 'Dragon', bg: 'bg-violet-600/15 border-violet-600/30', text: 'text-violet-700', icon: '🐉' },
  starlight: { label: 'Astral', bg: 'bg-teal-500/15 border-teal-500/30', text: 'text-teal-700', icon: '✨' },
  normal: { label: 'Normal', bg: 'bg-zinc-500/15 border-zinc-500/30', text: 'text-zinc-700', icon: '⚪' },
};

export const ChooseCompanionModal: React.FC = () => {
  const {
    pets,
    currentPetId,
    switchCompanion,
    renamePet,
    unlockCompanion,
    leafPoints,
    setLeafPoints,
    user,
    habits,
    marriage,
    isCompanionModalOpen,
    setIsCompanionModalOpen,
    showToast,
  } = useApp();

  const [selectedId, setSelectedId] = useState<CompanionId>(currentPetId);
  const [editingNameId, setEditingNameId] = useState<CompanionId | null>(null);
  const [renameInput, setRenameInput] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isCompanionModalOpen) return null;

  // Evaluate if condition is met for a specific pet
  const checkConditionMet = (id: CompanionId): { met: boolean; progressLabel: string; progressPct: number } => {
    const pet = pets[id];
    if (!pet || pet.isUnlocked) {
      return { met: true, progressLabel: 'Unlocked', progressPct: 100 };
    }

    const cond = pet.unlockCondition;
    if (!cond) {
      return { met: true, progressLabel: 'Ready to Adopt', progressPct: 100 };
    }

    if (cond.type === 'starter') {
      return { met: true, progressLabel: 'Starter Companion', progressPct: 100 };
    }

    if (cond.type === 'streak') {
      const target = typeof cond.targetValue === 'number' ? cond.targetValue : 7;
      const current = user.streakDays || 1;
      const met = current >= target;
      const pct = Math.min(100, Math.round((current / target) * 100));
      return {
        met,
        progressLabel: `${current}/${target} Days Habit Streak`,
        progressPct: pct,
      };
    }

    if (cond.type === 'habits_count') {
      const target = typeof cond.targetValue === 'number' ? cond.targetValue : 10;
      const current = user.totalHabitsCompleted || habits.filter((h) => h.completedToday).length;
      const met = current >= target;
      const pct = Math.min(100, Math.round((current / target) * 100));
      return {
        met,
        progressLabel: `${current}/${target} Habits Completed`,
        progressPct: pct,
      };
    }

    if (cond.type === 'feed_count') {
      const target = typeof cond.targetValue === 'number' ? cond.targetValue : 10;
      const current = Math.round((pets.sprout?.treatsGivenPct || 30) / 10);
      const met = current >= target;
      const pct = Math.min(100, Math.round((current / target) * 100));
      return {
        met,
        progressLabel: `${current}/${target} Gourmet Treats Given`,
        progressPct: pct,
      };
    }

    return {
      met: leafPoints >= 500,
      progressLabel: `${leafPoints}/500 Leaf Points`,
      progressPct: Math.min(100, Math.round((leafPoints / 500) * 100)),
    };
  };

  const handleConfirm = () => {
    const pet = pets[selectedId];
    if (!pet) return;

    if (pet.isUnlocked === false) {
      const { met } = checkConditionMet(selectedId);
      if (met) {
        unlockCompanion(selectedId);
        switchCompanion(selectedId);
        setIsCompanionModalOpen(false);
        showToast(`🎉 Condition achieved! ${pet.name} unlocked and adopted!`);
      } else {
        // Option to spend 500 leafs to unlock immediately
        if (leafPoints >= 500) {
          setLeafPoints((prev) => prev - 500);
          unlockCompanion(selectedId);
          switchCompanion(selectedId);
          setIsCompanionModalOpen(false);
          showToast(`✨ Unlocked ${pet.name} with 500 Leaf Points!`);
        } else {
          showToast(`Complete "${pet.unlockCondition?.description || 'requirements'}" or earn 500 Leafs to unlock!`);
        }
      }
      return;
    }

    switchCompanion(selectedId);
    setIsCompanionModalOpen(false);
  };

  const handleStartRename = (id: CompanionId, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingNameId(id);
    setRenameInput(pets[id]?.name || '');
  };

  const handleSaveRename = (id: CompanionId, e: React.MouseEvent) => {
    e.stopPropagation();
    if (renameInput.trim()) {
      renamePet(id, renameInput.trim());
    }
    setEditingNameId(null);
  };

  const petKeys = Object.keys(pets) as CompanionId[];

  const filteredPetKeys = petKeys.filter((id) => {
    const pet = pets[id];
    if (!pet) return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = pet.name.toLowerCase().includes(q);
      const matchTitle = pet.title.toLowerCase().includes(q);
      const matchElement = pet.element.toLowerCase().includes(q);
      if (!matchName && !matchTitle && !matchElement) return false;
    }

    // Category Filter
    if (categoryFilter === 'all') return true;
    if (categoryFilter === 'starters') {
      return ['sprout', 'ember', 'bubbles', 'cyndaquil', 'totodile'].includes(id);
    }
    if (categoryFilter === 'legendaries') {
      return ['mewtwo', 'rayquaza', 'dragonite'].includes(id);
    }
    if (categoryFilter === 'favorites') {
      return ['lumi', 'nyx', 'blossom', 'zephyr', 'magma', 'snorlax', 'greninja', 'mimikyu'].includes(id);
    }
    if (categoryFilter === 'baby') {
      return ['baby_sprout', 'baby_starlight'].includes(id);
    }
    return pet.element === categoryFilter;
  });

  const selectedPet = pets[selectedId] || pets.sprout;
  const conditionStatus = checkConditionMet(selectedId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0d1c2e]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#ffffff] w-full max-w-5xl rounded-3xl p-5 sm:p-7 border border-[#bccabb]/40 shadow-2xl space-y-5 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setIsCompanionModalOpen(false)}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#f8f9ff] border border-[#bccabb]/30 flex items-center justify-center text-[#6d7b6d] hover:text-[#0d1c2e] transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4ade80]/20 text-[#005e2d] rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> Official Pokémon Roster & Sanctuary
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0d1c2e] tracking-tight">
            Choose, Rename & Unlock Pokémon Companions
          </h2>
          <p className="text-xs sm:text-sm text-[#6d7b6d] font-medium max-w-xl mx-auto">
            Unlock new Pokémon by building daily habit streaks, logging focus sessions, winning Gym battles, or hatching baby eggs!
          </p>

          {/* Search & Category Filter Pills */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-2 max-w-2xl mx-auto">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#6d7b6d]" />
              <input
                type="text"
                placeholder="Search Pokémon or Element..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-full border border-[#bccabb]/40 bg-[#f8f9ff] focus:outline-none focus:border-[#006d36]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1">
              {[
                { id: 'all', label: 'All Roster' },
                { id: 'starters', label: 'Starters' },
                { id: 'legendaries', label: 'Legendary & Raids' },
                { id: 'favorites', label: 'Popular' },
                { id: 'baby', label: 'Baby Pokémon' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`px-3 py-1 rounded-full text-[11px] font-extrabold transition-all ${
                    categoryFilter === cat.id
                      ? 'bg-[#006d36] text-white shadow-xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Companion Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 max-h-[460px] overflow-y-auto pr-1">
          {filteredPetKeys.map((id) => {
            const pet = pets[id];
            if (!pet) return null;
            const isSelected = selectedId === id;
            const isUnlocked = pet.isUnlocked !== false;
            const cond = checkConditionMet(id);
            const badge = ELEMENT_BADGES[pet.element] || ELEMENT_BADGES.normal;

            return (
              <div
                key={id}
                onClick={() => setSelectedId(id)}
                className={`rounded-2xl p-3.5 sm:p-4 border-2 transition-all cursor-pointer flex flex-col justify-between relative ${
                  isSelected
                    ? 'border-[#006d36] bg-[#eff4ff]/70 shadow-lg scale-[1.01] ring-2 ring-[#4ade80]/40'
                    : 'border-[#bccabb]/30 bg-[#ffffff] hover:border-[#4ade80] hover:bg-[#f8f9ff]'
                }`}
              >
                {/* Active Checkmark or Lock Badge */}
                {isSelected && isUnlocked && (
                  <div className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-[#006d36] text-white flex items-center justify-center shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}

                {!isUnlocked && (
                  <div className={`absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full text-[10px] font-black flex items-center gap-1 shadow-sm ${
                    cond.met ? 'bg-emerald-600 text-white animate-pulse' : 'bg-amber-600 text-white'
                  }`}>
                    {cond.met ? <Sparkles className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                    {cond.met ? 'Ready to Claim!' : 'Locked'}
                  </div>
                )}

                {/* Pokemon Sprite Preview */}
                <div className="w-full aspect-square max-w-[110px] mx-auto flex items-center justify-center my-1 relative">
                  <div className={`${!isUnlocked ? 'filter grayscale-[35%] opacity-85' : ''}`}>
                    <InteractivePet2D pet={pet} scale={0.65} mood={isSelected ? 'celebrating' : 'idle'} />
                  </div>
                </div>

                {/* Info & Stats */}
                <div className="space-y-1.5 mt-1">
                  <div className="flex items-center justify-between gap-1">
                    {editingNameId === id ? (
                      <div
                        className="flex items-center gap-1 w-full"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="text"
                          value={renameInput}
                          onChange={(e) => setRenameInput(e.target.value)}
                          className="px-2 py-0.5 text-xs font-extrabold border rounded-md w-full focus:outline-none focus:border-[#006d36]"
                        />
                        <button
                          onClick={(e) => handleSaveRename(id, e)}
                          className="p-1 bg-[#006d36] text-white rounded-md text-[10px] font-bold"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-1 min-w-0">
                          <h3 className="font-black text-xs sm:text-sm text-[#0d1c2e] truncate">{pet.name}</h3>
                          <button
                            onClick={(e) => handleStartRename(id, e)}
                            className="text-[#6d7b6d] hover:text-[#006d36] p-0.5"
                            title="Rename pet"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-black border ${badge.bg} ${badge.text} shrink-0`}>
                          {badge.icon} {badge.label}
                        </span>
                      </>
                    )}
                  </div>

                  <p className="text-[10px] text-[#6d7b6d] line-clamp-1">
                    {pet.title}
                  </p>

                  {/* Unlock Progress Banner if Locked */}
                  {!isUnlocked && pet.unlockCondition && (
                    <div className="p-1.5 rounded-lg bg-amber-50 border border-amber-200 text-[10px]">
                      <div className="flex justify-between text-amber-900 font-bold mb-0.5">
                        <span className="truncate">{pet.unlockCondition.description}</span>
                      </div>
                      <div className="w-full bg-amber-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-amber-600 h-full rounded-full transition-all"
                          style={{ width: `${cond.progressPct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] text-amber-800 font-semibold mt-0.5">
                        <span>{cond.progressLabel}</span>
                        <span>{cond.progressPct}%</span>
                      </div>
                    </div>
                  )}

                  {/* Stat Tracks */}
                  <div className="flex justify-between items-center text-[10px] font-bold text-[#3d4a3e] pt-1 border-t border-[#bccabb]/20">
                    <span className="flex items-center gap-0.5">
                      <Swords className="w-3 h-3 text-rose-500" /> {pet.battleStats?.atk || 40}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Shield className="w-3 h-3 text-blue-500" /> {pet.battleStats?.def || 35}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Heart className="w-3 h-3 text-emerald-500" /> {pet.battleStats?.maxHp || 300}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Pokémon Detail Preview Bar */}
        <div className="p-4 rounded-2xl bg-[#f8f9ff] border border-[#bccabb]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center p-1 border border-[#bccabb]/30">
              <img
                src={selectedPet.avatarImage}
                alt={selectedPet.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm text-[#0d1c2e]">{selectedPet.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${ELEMENT_BADGES[selectedPet.element]?.bg} ${ELEMENT_BADGES[selectedPet.element]?.text}`}>
                  {ELEMENT_BADGES[selectedPet.element]?.icon} {ELEMENT_BADGES[selectedPet.element]?.label}
                </span>
                <span className="text-[11px] font-extrabold text-[#6d7b6d]">
                  {selectedPet.title}
                </span>
              </div>
              <p className="text-xs text-[#3d4a3e] line-clamp-1 mt-0.5">
                {selectedPet.description}
              </p>
            </div>
          </div>

          <div className="shrink-0 w-full sm:w-auto">
            <button
              onClick={handleConfirm}
              className={`w-full sm:w-auto px-6 py-3 rounded-2xl font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 ${
                selectedPet.isUnlocked !== false
                  ? 'bg-[#006d36] hover:bg-[#005e2d] text-white'
                  : conditionStatus.met
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white animate-bounce'
                  : 'bg-amber-600 hover:bg-amber-700 text-white'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {selectedPet.isUnlocked !== false
                ? `Set ${selectedPet.name} as Active Companion`
                : conditionStatus.met
                ? `Claim & Adopt ${selectedPet.name} (Requirements Met!)`
                : `Unlock & Adopt (500 Leaf Points)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

