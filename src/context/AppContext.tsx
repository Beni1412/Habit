import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ActiveTab,
  CompanionId,
  CompanionPet,
  Habit,
  StoreItem,
  EvolutionStage,
  PlaytimeData,
  DuoPartner,
  HabitCategory,
  HabitFrequency,
  HabitDifficulty,
  UserProfile,
  TimeOfDay,
  PetMarriage,
  MarriageSuitor,
  BattleOpponent,
} from '../types';
import {
  INITIAL_USER,
  INITIAL_PETS,
  INITIAL_HABITS,
  INITIAL_STORE_ITEMS,
  EVOLUTION_STAGES,
  PET_EVOLUTION_LINES,
  INITIAL_PLAYTIME_DATA,
  INITIAL_DUO_PARTNER,
  INITIAL_MARRIAGE,
  BATTLE_OPPONENTS,
  INITIAL_PVP_OPPONENTS,
} from '../data/initialData';
import { sounds } from '../utils/audio';
import { getPokemonArtwork, getPokemonStageName } from '../components/pet2d/InteractivePet2D';
import { syncUserProfile, syncHabitsToSupabase, syncPetsToSupabase, fetchUserData } from '../lib/supabase';

export interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  read: boolean;
  type: 'streak' | 'evolution' | 'gift' | 'care' | 'auth' | 'battle' | 'marriage';
}

interface AppContextType {
  // Navigation
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;

  // User Profile & Authentication
  user: UserProfile;
  login: (email: string, pass: string, name?: string, avatarUrl?: string) => void;
  signup: (name: string, email: string, pass: string, avatarUrl?: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  uploadAvatar: (avatarDataUrl: string) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;

  // Companions
  currentPetId: CompanionId;
  currentPet: CompanionPet;
  pets: Record<string, CompanionPet>;
  switchCompanion: (id: CompanionId) => void;
  renamePet: (id: CompanionId, newName: string) => void;
  unlockCompanion: (id: CompanionId) => void;

  // Habits
  habits: Habit[];
  toggleHabit: (id: string, event?: React.MouseEvent) => void;
  incrementHabitCount: (id: string, event?: React.MouseEvent) => void;
  addHabit: (data: {
    name: string;
    category: HabitCategory;
    frequency: HabitFrequency;
    difficulty: HabitDifficulty;
    points: number;
    description?: string;
    targetCount?: number;
    unit?: string;
    timeOfDay?: TimeOfDay;
  }) => void;
  updateHabit: (id: string, data: Partial<Habit>) => void;
  deleteHabit: (id: string) => void;
  editingHabit: Habit | null;
  setEditingHabit: (habit: Habit | null) => void;
  isAddHabitModalOpen: boolean;
  setIsAddHabitModalOpen: (open: boolean) => void;
  isEditHabitModalOpen: boolean;
  setIsEditHabitModalOpen: (open: boolean) => void;

  // Economy & Store & Inventory
  leafPoints: number;
  setLeafPoints: React.Dispatch<React.SetStateAction<number>>;
  storeItems: StoreItem[];
  buyStoreItem: (itemId: string) => void;
  useStoreItem: (itemId: string) => void;
  toggleEquipItem: (itemId: string) => void;

  // Progression & Evolution
  evolutionStages: EvolutionStage[];
  playtimeData: PlaytimeData;
  isEvolutionCutsceneOpen: boolean;
  setIsEvolutionCutsceneOpen: (open: boolean) => void;
  pendingEvolutionStages: { current: EvolutionStage; next: EvolutionStage } | null;
  triggerEvolutionCutscene: (targetStageNumber?: number) => void;
  completeEvolutionCutscene: () => void;

  // Duo & Social
  duoPartner: DuoPartner;
  updateDuoPartner: (data: Partial<DuoPartner>) => void;
  sendDuoGift: () => void;
  cheerDuoPartner: (cheerType: string) => void;
  isAddPartnerModalOpen: boolean;
  setIsAddPartnerModalOpen: (open: boolean) => void;

  // Pet Care & Focus
  interactWithPet: (action: 'feed' | 'play' | 'pet' | 'water') => void;
  isCompanionModalOpen: boolean;
  setIsCompanionModalOpen: (open: boolean) => void;
  isFocusTimerOpen: boolean;
  setIsFocusTimerOpen: (open: boolean) => void;
  completeFocusSession: (minutes: number) => void;

  // Pet Marriage & Offspring
  marriage: PetMarriage;
  proposeMarriage: (suitor: MarriageSuitor, ringItemId: string, customVows?: string) => void;
  divorcePet: () => void;
  sendLoveNote: (noteText: string) => void;
  sendLoveGift: (giftName: string) => void;
  hatchBabyEgg: (babyName?: string) => void;
  isMarriageModalOpen: boolean;
  setIsMarriageModalOpen: (open: boolean) => void;

  // Pet Battle Arena
  battleOpponents: BattleOpponent[];
  activeBattleOpponent: BattleOpponent | null;
  setActiveBattleOpponent: (opp: BattleOpponent | null) => void;
  completeBattle: (result: 'win' | 'lose', opponent: BattleOpponent) => void;
  upgradePetSkill: (petId: CompanionId, skillId: string) => void;

  // Toast & Notifications
  toastMessage: string | null;
  showToast: (msg: string) => void;
  notifications: NotificationItem[];
  markNotificationsRead: () => void;
  isNotificationsOpen: boolean;
  setIsNotificationsOpen: (open: boolean) => void;

  // Guide Book
  isGuideBookOpen: boolean;
  setIsGuideBookOpen: (open: boolean) => void;
  guideBookInitialTab: string;
  openGuideBook: (tab?: string) => void;
}

const CURRENT_DATA_VERSION = 'v8_pokemon_pve_pvp_split_2026';

const ALL_INITIAL_OPPONENTS: BattleOpponent[] = [
  ...BATTLE_OPPONENTS,
  ...INITIAL_PVP_OPPONENTS,
];

const loadSavedPets = (): Record<string, CompanionPet> => {
  try {
    const version = localStorage.getItem('habitpet_data_version');
    const saved = localStorage.getItem('habitpet_pets');
    if (!saved || version !== CURRENT_DATA_VERSION) {
      localStorage.setItem('habitpet_data_version', CURRENT_DATA_VERSION);
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged: Record<string, CompanionPet> = { ...INITIAL_PETS };
        Object.keys(INITIAL_PETS).forEach((key) => {
          if (parsed[key]) {
            const currentStage = parsed[key].evolutionStage || INITIAL_PETS[key].evolutionStage || 1;
            const stageArt = getPokemonArtwork(key, currentStage) || INITIAL_PETS[key].avatarImage;
            const stageName = getPokemonStageName(key, currentStage) || parsed[key].name || INITIAL_PETS[key].name;
            merged[key] = {
              ...INITIAL_PETS[key],
              name: stageName,
              avatarImage: stageArt,
              full3DImage: stageArt,
              islandImage: stageArt,
              growthLevel: parsed[key].growthLevel || INITIAL_PETS[key].growthLevel,
              currentXp: parsed[key].currentXp ?? INITIAL_PETS[key].currentXp,
              happinessPct: parsed[key].happinessPct ?? INITIAL_PETS[key].happinessPct,
              evolutionStage: currentStage,
              equippedItems: parsed[key].equippedItems || INITIAL_PETS[key].equippedItems,
              isUnlocked: parsed[key].isUnlocked ?? INITIAL_PETS[key].isUnlocked,
              unlockCondition: INITIAL_PETS[key].unlockCondition,
              battleStats: parsed[key].battleStats || INITIAL_PETS[key].battleStats,
              skills: INITIAL_PETS[key].skills,
            };
          }
        });
        localStorage.setItem('habitpet_pets', JSON.stringify(merged));
        return merged;
      }
      localStorage.setItem('habitpet_pets', JSON.stringify(INITIAL_PETS));
      return INITIAL_PETS;
    }
    return JSON.parse(saved);
  } catch {
    return INITIAL_PETS;
  }
};

const loadSavedEvolutionStages = (petId: string = 'sprout'): EvolutionStage[] => {
  try {
    const version = localStorage.getItem('habitpet_data_version');
    const saved = localStorage.getItem('habitpet_evolution');
    const line = (PET_EVOLUTION_LINES as any)[petId] || EVOLUTION_STAGES;
    if (!saved || version !== CURRENT_DATA_VERSION) {
      localStorage.setItem('habitpet_evolution', JSON.stringify(line));
      return line;
    }
    const parsed = JSON.parse(saved);
    if (parsed[0]?.name === 'Sproutlet' || parsed[0]?.name === 'Sprout') {
      localStorage.setItem('habitpet_evolution', JSON.stringify(line));
      return line;
    }
    return parsed;
  } catch {
    return (PET_EVOLUTION_LINES as any)[petId] || EVOLUTION_STAGES;
  }
};

const loadSavedOpponents = (): BattleOpponent[] => {
  try {
    const version = localStorage.getItem('habitpet_data_version');
    const saved = localStorage.getItem('habitpet_opponents');
    if (!saved || version !== CURRENT_DATA_VERSION) {
      localStorage.setItem('habitpet_opponents', JSON.stringify(ALL_INITIAL_OPPONENTS));
      return ALL_INITIAL_OPPONENTS;
    }
    return JSON.parse(saved);
  } catch {
    return ALL_INITIAL_OPPONENTS;
  }
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('habitat');
  const [currentPetId, setCurrentPetId] = useState<CompanionId>('sprout');

  // User Profile & Authentication State
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('habitpet_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [pets, setPets] = useState<Record<string, CompanionPet>>(() => loadSavedPets());

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habitpet_habits');
    return saved ? JSON.parse(saved) : INITIAL_HABITS;
  });

  const [leafPoints, setLeafPoints] = useState<number>(() => {
    const saved = localStorage.getItem('habitpet_leafpoints');
    return saved ? JSON.parse(saved) : 1240;
  });

  const [storeItems, setStoreItems] = useState<StoreItem[]>(() => {
    const saved = localStorage.getItem('habitpet_store');
    return saved ? JSON.parse(saved) : INITIAL_STORE_ITEMS;
  });

  const [evolutionStages, setEvolutionStages] = useState<EvolutionStage[]>(() => loadSavedEvolutionStages('sprout'));

  const [playtimeData, setPlaytimeData] = useState<PlaytimeData>(() => {
    const saved = localStorage.getItem('habitpet_playtime');
    return saved ? JSON.parse(saved) : INITIAL_PLAYTIME_DATA;
  });

  const [duoPartner, setDuoPartner] = useState<DuoPartner>(() => {
    const saved = localStorage.getItem('habitpet_duo');
    return saved ? JSON.parse(saved) : INITIAL_DUO_PARTNER;
  });

  // Marriage State
  const [marriage, setMarriage] = useState<PetMarriage>(() => {
    const saved = localStorage.getItem('habitpet_marriage');
    return saved ? JSON.parse(saved) : INITIAL_MARRIAGE;
  });

  // Battle Opponents State
  const [battleOpponents, setBattleOpponents] = useState<BattleOpponent[]>(() => loadSavedOpponents());

  const [activeBattleOpponent, setActiveBattleOpponent] = useState<BattleOpponent | null>(null);

  // Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCompanionModalOpen, setIsCompanionModalOpen] = useState(false);
  const [isAddHabitModalOpen, setIsAddHabitModalOpen] = useState(false);
  const [isEditHabitModalOpen, setIsEditHabitModalOpen] = useState(false);
  const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState(false);
  const [isFocusTimerOpen, setIsFocusTimerOpen] = useState(false);
  const [isMarriageModalOpen, setIsMarriageModalOpen] = useState(false);
  const [isEvolutionCutsceneOpen, setIsEvolutionCutsceneOpen] = useState(false);
  const [pendingEvolutionStages, setPendingEvolutionStages] = useState<{ current: EvolutionStage; next: EvolutionStage } | null>(null);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isGuideBookOpen, setIsGuideBookOpen] = useState(false);
  const [guideBookInitialTab, setGuideBookInitialTab] = useState<string>('basics');

  const openGuideBook = (tab: string = 'basics') => {
    setGuideBookInitialTab(tab);
    setIsGuideBookOpen(true);
    sounds.playPop();
  };

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'n-1',
      title: '5-Day Streak!',
      desc: 'You completed "Read 15 Pages" for 5 consecutive days!',
      time: '10m ago',
      read: false,
      type: 'streak',
    },
    {
      id: 'n-2',
      title: 'Partner Synergy Alert',
      desc: 'Alex sent 50 Bond Points to your shared sanctuary!',
      time: '1h ago',
      read: false,
      type: 'gift',
    },
    {
      id: 'n-3',
      title: 'Evolution Milestone Near',
      desc: 'Sprout is 85% to reaching Level 5 Cap!',
      time: '3h ago',
      read: true,
      type: 'evolution',
    },
  ]);

  // Persist to local storage and Supabase
  useEffect(() => {
    localStorage.setItem('habitpet_user', JSON.stringify(user));
    if (user.isLoggedIn && user.id) {
      syncUserProfile(user, leafPoints, 0, 1000);
    }
  }, [user, leafPoints]); // Added leafPoints as dependency for the sync

  useEffect(() => {
    localStorage.setItem('habitpet_pets', JSON.stringify(pets));
    if (user.isLoggedIn && user.id) {
      syncPetsToSupabase(user.id, pets);
    }
  }, [pets, user.isLoggedIn, user.id]);

  useEffect(() => {
    localStorage.setItem('habitpet_habits', JSON.stringify(habits));
    if (user.isLoggedIn && user.id) {
      syncHabitsToSupabase(user.id, habits);
    }
  }, [habits, user.isLoggedIn, user.id]);

  useEffect(() => {
    localStorage.setItem('habitpet_leafpoints', JSON.stringify(leafPoints));
  }, [leafPoints]);

  useEffect(() => {
    localStorage.setItem('habitpet_store', JSON.stringify(storeItems));
  }, [storeItems]);

  useEffect(() => {
    localStorage.setItem('habitpet_evolution', JSON.stringify(evolutionStages));
  }, [evolutionStages]);

  useEffect(() => {
    localStorage.setItem('habitpet_playtime', JSON.stringify(playtimeData));
  }, [playtimeData]);

  useEffect(() => {
    localStorage.setItem('habitpet_duo', JSON.stringify(duoPartner));
  }, [duoPartner]);

  useEffect(() => {
    localStorage.setItem('habitpet_marriage', JSON.stringify(marriage));
  }, [marriage]);

  useEffect(() => {
    localStorage.setItem('habitpet_opponents', JSON.stringify(battleOpponents));
  }, [battleOpponents]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  const triggerConfetti = (e?: React.MouseEvent) => {
    let origin = { x: 0.5, y: 0.5 };
    if (e && window.innerWidth > 0 && window.innerHeight > 0) {
      origin = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    }
    confetti({
      particleCount: 50,
      spread: 70,
      origin,
      colors: ['#f9bd22', '#4de082', '#64a8fe', '#ffdf9f', '#ff847c', '#ec4899'],
    });
  };

  // Auth Functions
  const login = async (email: string, _pass: string, name?: string, avatarUrl?: string) => {
    showToast('Connecting to database...');
    const dbData = await fetchUserData(email);

    if (dbData && dbData.profile) {
      const p = dbData.profile;
      setUser({
        id: p.id,
        email: p.email,
        name: p.name,
        avatarUrl: p.avatar_url || avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        title: p.title,
        bio: p.bio,
        level: p.level,
        streakDays: p.streak_days,
        totalHabitsCompleted: p.total_habits_completed,
        joinDate: p.created_at ? new Date(p.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently',
        isLoggedIn: true,
        themePreference: p.theme_preference || 'emerald',
      });
      setLeafPoints(p.leaf_points || 0);

      if (dbData.habits && dbData.habits.length > 0) {
        const mappedHabits = dbData.habits.map((h: any) => ({
          id: h.id,
          name: h.name,
          description: h.description,
          category: h.category,
          frequency: h.frequency,
          difficulty: h.difficulty,
          points: h.points,
          targetCount: h.target_count,
          currentCount: h.current_count,
          unit: h.unit,
          timeOfDay: h.time_of_day,
          streak: h.streak,
          completedToday: h.completed_today,
        }));
        setHabits(mappedHabits as Habit[]);
      }

      if (dbData.pets && dbData.pets.length > 0) {
        const newPets = { ...INITIAL_PETS };
        dbData.pets.forEach((petRow: any) => {
          if (newPets[petRow.pet_id]) {
            newPets[petRow.pet_id] = {
              ...newPets[petRow.pet_id],
              name: petRow.name,
              element: petRow.element,
              evolutionStage: petRow.evolution_stage,
              growthLevel: petRow.growth_level,
              currentXp: petRow.current_xp,
              maxXp: petRow.max_xp,
              happinessPct: petRow.happiness_pct,
              isUnlocked: petRow.is_unlocked,
              equippedItems: petRow.equipped_items || [],
            };
          }
        });
        setPets(newPets);
      }

      sounds.playHabitComplete();
      showToast(`Welcome back, ${p.name}! ✨`);
      setIsAuthModalOpen(false);
    } else {
      if (email === 'guest@habitpet.com') {
        // Fallback for guest demo if not in DB yet
        const formattedName = name || 'Guest Trainer';
        setUser((prev) => ({
          ...prev,
          id: 'guest-' + Date.now(),
          email,
          name: formattedName,
          avatarUrl: avatarUrl || prev.avatarUrl,
          isLoggedIn: true,
        }));
        sounds.playHabitComplete();
        showToast(`Welcome, Guest! ✨`);
        setIsAuthModalOpen(false);
      } else {
        showToast('❌ Akun tidak ditemukan! Silakan Sign Up / Create Account dulu.');
      }
    }
  };

  const signup = (name: string, email: string, _pass: string, avatarUrl?: string) => {
    const newUser: UserProfile = {
      id: `usr-${Date.now()}`,
      name,
      email,
      avatarUrl:
        avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      title: 'Novice Guardian',
      bio: 'Just started my HabitPet journey!',
      level: 1,
      streakDays: 1,
      totalHabitsCompleted: 0,
      joinDate: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      isLoggedIn: true,
      themePreference: 'emerald',
    };
    setUser(newUser);
    
    // Reset other data for fresh account
    setHabits([]);
    setPets(INITIAL_PETS);
    setLeafPoints(0);
    localStorage.removeItem('habitpet_habits');
    localStorage.removeItem('habitpet_leafpoints');
    localStorage.removeItem('habitpet_pets');
    
    sounds.playHabitComplete();
    triggerConfetti();
    showToast(`Account created! Welcome to HabitPet, ${name}! 🎉`);
    setIsAuthModalOpen(false);
  };

  const logout = () => {
    localStorage.clear();
    localStorage.setItem('habitpet_data_version', CURRENT_DATA_VERSION);
    window.location.reload();
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...data }));
    sounds.playPop();
    showToast('Profile updated successfully! ✅');
  };

  const uploadAvatar = (avatarDataUrl: string) => {
    setUser((prev) => ({ ...prev, avatarUrl: avatarDataUrl }));
    sounds.playPop();
    showToast('Profile picture updated successfully! 📸');
  };

  const currentPet = pets[currentPetId] || pets.sprout;

  const renamePet = (id: CompanionId, newName: string) => {
    if (!newName.trim()) return;
    setPets((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        name: newName.trim(),
      },
    }));
    sounds.playPop();
    showToast(`Companion renamed to ${newName.trim()}! 🐾`);
  };

  const unlockCompanion = (id: CompanionId) => {
    setPets((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        isUnlocked: true,
      },
    }));
    sounds.playEggHatch();
    triggerConfetti();
    showToast(`🌟 Companion ${pets[id]?.name || id} unlocked and joined your party!`);
  };

  const toggleHabit = (id: string, event?: React.MouseEvent) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    const willBeCompleted = !habit.completedToday;

    // Update habit
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const newStreak = willBeCompleted ? h.streak + 1 : Math.max(0, h.streak - 1);
          const newCurrentCount = willBeCompleted
            ? h.targetCount || 1
            : Math.max(0, (h.currentCount || 1) - 1);
          return {
            ...h,
            completedToday: willBeCompleted,
            streak: newStreak,
            currentCount: newCurrentCount,
          };
        }
        return h;
      })
    );

    if (willBeCompleted) {
      sounds.playHabitComplete();
      triggerConfetti(event);

      let earnedPoints = habit.points;
      let earnedXp = habit.points * 3;

      // Apply marriage XP bonus if active
      if (marriage.isMarried && marriage.loveBuffActive) {
        earnedXp = Math.round(earnedXp * 1.25);
      }

      setLeafPoints((prev) => prev + earnedPoints);

      // Incubation progress for love egg if exists
      if (marriage.isMarried && marriage.babyEgg.hasEgg && !marriage.babyEgg.isHatched) {
        const nextProgress = marriage.babyEgg.incubationProgress + 1;
        const isReadyToHatch = nextProgress >= marriage.babyEgg.maxProgress;

        setMarriage((prev) => ({
          ...prev,
          loveExp: Math.min(prev.maxLoveExp, prev.loveExp + 30),
          babyEgg: {
            ...prev.babyEgg,
            incubationProgress: nextProgress,
          },
        }));

        if (isReadyToHatch) {
          sounds.playEggHatch();
          showToast(`🥚 Your ${marriage.babyEgg.eggName} is glowing and ready to hatch! Visit Marriage / Sanctuary!`);
        } else {
          showToast(`+${earnedPoints} Leafs & +${earnedXp} XP! (Egg Incubation: ${nextProgress}/${marriage.babyEgg.maxProgress})`);
        }
      } else {
        showToast(`+${earnedPoints} Leaf Points & +${earnedXp} XP!`);
      }

      // Update user total habits completed
      setUser((prev) => ({
        ...prev,
        totalHabitsCompleted: prev.totalHabitsCompleted + 1,
      }));

      // Update current pet XP, happiness, and habit category RPG battle stats!
      setPets((prev) => {
        const pet = prev[currentPetId];
        let newXp = pet.currentXp + earnedXp;
        let newLevel = pet.growthLevel;
        let newMaxXp = pet.maxXp;

        if (newXp >= newMaxXp) {
          newXp = newXp - newMaxXp;
          newLevel += 1;
          newMaxXp = Math.round(newMaxXp * 1.25);
          showToast(`🌟 Level Up! ${pet.name} reached Level ${newLevel}!`);
        }

        const newHappiness = Math.min(100, pet.happinessPct + 4);
        const newHabitPct = Math.min(100, pet.habitCompletionPct + 5);

        // RPG Battle Stat gains based on Habit Category
        const currentStats = pet.battleStats || {
          hp: 300,
          maxHp: 300,
          mp: 100,
          maxMp: 100,
          atk: 40,
          def: 40,
          spAtk: 40,
          spd: 40,
          critRate: 10,
        };

        let statBoost = { ...currentStats };
        if (habit.category === 'Fitness') {
          statBoost.atk += 1;
          statBoost.hp = Math.min(statBoost.maxHp + 5, statBoost.hp + 5);
          statBoost.maxHp += 5;
        } else if (habit.category === 'Health') {
          statBoost.hp = Math.min(statBoost.maxHp + 8, statBoost.hp + 8);
          statBoost.maxHp += 8;
          statBoost.def += 1;
        } else if (habit.category === 'Learning') {
          statBoost.spAtk += 2;
          statBoost.mp = 100;
        } else if (habit.category === 'Mindfulness') {
          statBoost.def += 2;
          statBoost.critRate = Math.min(50, statBoost.critRate + 1);
        } else if (habit.category === 'Productivity') {
          statBoost.spd += 2;
          statBoost.atk += 1;
        }

        return {
          ...prev,
          [currentPetId]: {
            ...pet,
            currentXp: newXp,
            growthLevel: newLevel,
            maxXp: newMaxXp,
            happinessPct: newHappiness,
            habitCompletionPct: newHabitPct,
            battleStats: statBoost,
          },
        };
      });

      // Update Evolution progress
      setEvolutionStages((prev) =>
        prev.map((stage) => {
          if (stage.status === 'current') {
            const currentStreak = (stage.currentStreakDays || 0) + 1;
            const target = stage.requiredStreakDays || 7;
            const pct = Math.min(100, Math.round((currentStreak / target) * 100));
            return {
              ...stage,
              currentStreakDays: currentStreak,
              progressPct: pct,
            };
          }
          return stage;
        })
      );
    } else {
      sounds.playPop();
      setLeafPoints((prev) => Math.max(0, prev - habit.points));
    }
  };

  const incrementHabitCount = (id: string, event?: React.MouseEvent) => {
    const habit = habits.find((h) => h.id === id);
    if (!habit) return;

    const target = habit.targetCount || 1;
    const current = habit.currentCount || 0;
    const nextCount = current + 1;
    const willBeCompleted = nextCount >= target;

    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          return {
            ...h,
            currentCount: nextCount,
            completedToday: willBeCompleted,
            streak: willBeCompleted && !h.completedToday ? h.streak + 1 : h.streak,
          };
        }
        return h;
      })
    );

    if (willBeCompleted && !habit.completedToday) {
      sounds.playHabitComplete();
      triggerConfetti(event);
      setLeafPoints((prev) => prev + habit.points);
      showToast(`🎯 Goal completed! +${habit.points} Leaf Points!`);
    } else {
      sounds.playPop();
      showToast(`Logged ${nextCount}/${target} ${habit.unit || 'times'}`);
    }
  };

  const addHabit = (data: {
    name: string;
    category: HabitCategory;
    frequency: HabitFrequency;
    difficulty: HabitDifficulty;
    points: number;
    description?: string;
    targetCount?: number;
    unit?: string;
    timeOfDay?: TimeOfDay;
  }) => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}`,
      name: data.name,
      category: data.category,
      frequency: data.frequency,
      difficulty: data.difficulty,
      points: data.points,
      streak: 0,
      completedToday: false,
      completedDates: [],
      createdAt: new Date().toISOString(),
      description: data.description || '',
      targetCount: data.targetCount || 1,
      currentCount: 0,
      unit: data.unit || 'times',
      timeOfDay: data.timeOfDay || 'anytime',
    };

    setHabits((prev) => [newHabit, ...prev]);
    sounds.playPop();
    showToast(`New habit "${data.name}" added! 🌱`);
  };

  const updateHabit = (id: string, data: Partial<Habit>) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...data } : h)));
    sounds.playPop();
    showToast('Habit updated successfully! ✨');
    setIsEditHabitModalOpen(false);
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
    sounds.playPop();
    showToast('Habit removed.');
  };

  const buyStoreItem = (itemId: string) => {
    const item = storeItems.find((i) => i.id === itemId);
    if (!item) return;

    if (item.isSoldOut) {
      showToast('This item is currently sold out.');
      return;
    }

    if (leafPoints < item.cost) {
      showToast('Not enough Leaf Points! Complete habits to earn more.');
      return;
    }

    setLeafPoints((prev) => prev - item.cost);
    sounds.playBuy();
    triggerConfetti();

    // Mark as purchased or increase quantity
    setStoreItems((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          return {
            ...i,
            isPurchased: true,
            quantity: (i.quantity || 0) + 1,
            isEquipped: i.category === 'accessory' ? true : i.isEquipped,
          };
        }
        return i;
      })
    );

    // Apply immediate effect for accessories
    if (itemId === 'sun_hat') {
      setPets((prev) => {
        const pet = prev[currentPetId];
        const equipped = pet.equippedItems.includes('sun_hat')
          ? pet.equippedItems
          : [...pet.equippedItems, 'sun_hat'];
        return {
          ...prev,
          [currentPetId]: {
            ...pet,
            equippedItems: equipped,
            happinessPct: Math.min(100, pet.happinessPct + 5),
          },
        };
      });
      showToast(`Equipped Sun Hat on ${currentPet.name}! 👒`);
    } else if (itemId === 'wedding_ring_bloom' || itemId === 'wedding_ring_diamond') {
      showToast(`Acquired ${item.name}! You can now propose marriage in the Marriage Chapel! 💍`);
    } else {
      showToast(`Purchased ${item.name}! Added to your inventory bag.`);
    }
  };

  const useStoreItem = (itemId: string) => {
    const item = storeItems.find((i) => i.id === itemId);
    if (!item || !item.quantity || item.quantity <= 0) {
      showToast('You do not have any of this item in your bag.');
      return;
    }

    // Decrement quantity
    setStoreItems((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          const nextQty = (i.quantity || 1) - 1;
          return {
            ...i,
            quantity: nextQty,
            isPurchased: nextQty > 0 || i.category === 'accessory',
          };
        }
        return i;
      })
    );

    sounds.playPetChirp();
    triggerConfetti();

    if (itemId === 'magic_water') {
      setPets((prev) => {
        const pet = prev[currentPetId];
        return {
          ...prev,
          [currentPetId]: {
            ...pet,
            currentXp: Math.min(pet.maxXp, pet.currentXp + 60),
            healthStatus: 'Excellent',
            happinessPct: Math.min(100, pet.happinessPct + 10),
          },
        };
      });
      showToast(`Gave Magic Spring Water to ${currentPet.name}! (+60 XP, Max Hydration) 💧`);
    } else if (itemId === 'treat_cake') {
      setPets((prev) => {
        const pet = prev[currentPetId];
        return {
          ...prev,
          [currentPetId]: {
            ...pet,
            currentXp: Math.min(pet.maxXp, pet.currentXp + 40),
            happinessPct: 100,
            energyStat: 100,
          },
        };
      });
      showToast(`${currentPet.name} devoured the Golden Berry Cake! 🍰 (100% Happiness & Energy!)`);
    } else if (itemId === 'organic_fertilizer') {
      showToast('🌱 Organic Fertilizer activated! 2x XP boost for 24h!');
    }
  };

  const toggleEquipItem = (itemId: string) => {
    setStoreItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, isEquipped: !i.isEquipped } : i))
    );

    setPets((prev) => {
      const pet = prev[currentPetId];
      const isAlready = pet.equippedItems.includes(itemId);
      const newEquipped = isAlready
        ? pet.equippedItems.filter((id) => id !== itemId)
        : [...pet.equippedItems, itemId];

      return {
        ...prev,
        [currentPetId]: {
          ...pet,
          equippedItems: newEquipped,
        },
      };
    });

    sounds.playPop();
  };

  const switchCompanion = (id: CompanionId) => {
    setCurrentPetId(id);
    const line = (PET_EVOLUTION_LINES as any)[id] || PET_EVOLUTION_LINES.sprout;
    setEvolutionStages(line);
    sounds.playPetChirp();
    showToast(`Switched active companion to ${pets[id]?.name || id}! 🐾`);
  };

  const interactWithPet = (action: 'feed' | 'play' | 'pet' | 'water') => {
    sounds.playPetChirp();
    triggerConfetti();

    setPets((prev) => {
      const pet = prev[currentPetId];
      let newHappiness = Math.min(100, pet.happinessPct + 5);
      let newPlaytime = pet.playtimeRecentPct;
      let newTreats = pet.treatsGivenPct;

      if (action === 'play' || action === 'pet') {
        newPlaytime = Math.min(100, newPlaytime + 6);
      } else if (action === 'feed') {
        newTreats = Math.min(100, newTreats + 5);
      }

      return {
        ...prev,
        [currentPetId]: {
          ...pet,
          happinessPct: newHappiness,
          playtimeRecentPct: newPlaytime,
          treatsGivenPct: newTreats,
          currentXp: Math.min(pet.maxXp, pet.currentXp + 25),
        },
      };
    });

    const messages = {
      feed: `🍓 ${currentPet.name} loved the berry snack! (+25 XP, +5% Happiness)`,
      play: `🎮 ${currentPet.name} had a blast playing mini-games! (+25 XP)`,
      pet: `💖 ${currentPet.name} purrs warmly with affection!`,
      water: `💧 ${currentPet.name} is deeply refreshed with pure spring water!`,
    };

    showToast(messages[action]);
  };

  const sendDuoGift = () => {
    sounds.playHabitComplete();
    triggerConfetti();
    setDuoPartner((prev) => ({
      ...prev,
      bondPoints: prev.bondPoints + 50,
      dailySynergyPct: Math.min(100, prev.dailySynergyPct + 4),
      lastGiftSent: 'Just now',
    }));
    showToast(`Sent Care Gift to ${duoPartner.name} & ${duoPartner.partnerPetName}! (+50 Bond Pts) 🎁`);
  };

  const cheerDuoPartner = (cheerType: string) => {
    sounds.playPop();
    triggerConfetti();
    setDuoPartner((prev) => ({
      ...prev,
      bondPoints: prev.bondPoints + 20,
      dailySynergyPct: Math.min(100, prev.dailySynergyPct + 2),
    }));
    showToast(`Sent "${cheerType}" cheer to ${duoPartner.name}! 🌟`);
  };

  const updateDuoPartner = (data: Partial<DuoPartner>) => {
    setDuoPartner((prev) => ({ ...prev, ...data }));
    sounds.playPop();
    showToast('Duo partner updated successfully! 🤝');
    setIsAddPartnerModalOpen(false);
  };

  const completeFocusSession = (minutes: number) => {
    const earnedPoints = minutes * 2;
    const earnedXp = minutes * 5;

    setLeafPoints((prev) => prev + earnedPoints);
    setPets((prev) => {
      const pet = prev[currentPetId];
      return {
        ...prev,
        [currentPetId]: {
          ...pet,
          currentXp: Math.min(pet.maxXp, pet.currentXp + earnedXp),
          focusStat: Math.min(100, pet.focusStat + 5),
          happinessPct: Math.min(100, pet.happinessPct + 8),
        },
      };
    });

    sounds.playHabitComplete();
    triggerConfetti();
    showToast(`🎉 Focus Sprint Finished! +${earnedPoints} Leaf Points & +${earnedXp} XP!`);
  };

  // Marriage Functions
  const proposeMarriage = (suitor: MarriageSuitor, ringItemId: string, customVows?: string) => {
    const ring = storeItems.find((i) => i.id === ringItemId);
    const ringName = ring?.name || 'Eternal Flora Ring';

    sounds.playWeddingBells();
    triggerConfetti();

    const newMarriage: PetMarriage = {
      isMarried: true,
      partnerPetName: suitor.petName,
      partnerPetAvatar: suitor.petAvatar,
      partnerOwnerName: suitor.name,
      marriageDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      ringType: ringName,
      ringBonus: '+25% Habit XP Multiplier & Romantic Aura',
      loveBondLevel: 1,
      loveTitle: 'Newlyweds',
      loveExp: 100,
      maxLoveExp: 500,
      loveBuffActive: true,
      weddingVows: customVows || suitor.vowsPreset,
      weddingPhoto: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&auto=format&fit=crop&q=80',
      babyEgg: {
        hasEgg: true,
        eggType: suitor.element === 'water' ? 'mystic_frost' : 'sacred_bloom',
        eggName: `${suitor.petName}'s Celestial Love Egg`,
        eggImage: 'https://images.unsplash.com/photo-1582794543139-8ac9cb0f7b11?w=400&auto=format&fit=crop&q=80',
        incubationProgress: 0,
        maxProgress: 5,
        isHatched: false,
      },
      loveNotes: [
        {
          id: `note-${Date.now()}`,
          sender: suitor.petName,
          text: `I said YES! Let us grow our habits and love together forever 💕💍`,
          date: 'Just now',
        },
      ],
    };

    setMarriage(newMarriage);

    // Add marriage notification
    setNotifications((prev) => [
      {
        id: `n-m-${Date.now()}`,
        title: '💍 Pet Wedding Ceremony Complete!',
        desc: `${currentPet.name} and ${suitor.petName} are now happily married! Received a Sacred Love Egg!`,
        time: 'Just now',
        read: false,
        type: 'marriage',
      },
      ...prev,
    ]);

    showToast(`💍 Wedding Vows Sealed! ${currentPet.name} & ${suitor.petName} are now Married! 🎉`);
  };

  const divorcePet = () => {
    setMarriage(INITIAL_MARRIAGE);
    sounds.playPop();
    showToast('Marriage ended amicably. You can propose to a new companion anytime.');
  };

  const sendLoveNote = (noteText: string) => {
    if (!noteText.trim()) return;
    const newNote = {
      id: `note-${Date.now()}`,
      sender: user.name.split(' ')[0],
      text: noteText.trim(),
      date: 'Just now',
    };
    setMarriage((prev) => ({
      ...prev,
      loveExp: Math.min(prev.maxLoveExp, prev.loveExp + 40),
      loveNotes: [newNote, ...prev.loveNotes],
    }));
    sounds.playPetChirp();
    triggerConfetti();
    showToast('💌 Love note sent to your married partner!');
  };

  const sendLoveGift = (giftName: string) => {
    setMarriage((prev) => ({
      ...prev,
      loveExp: Math.min(prev.maxLoveExp, prev.loveExp + 60),
    }));
    sounds.playHabitComplete();
    triggerConfetti();
    showToast(`🎁 Gifted ${giftName} to ${marriage.partnerPetName}! (+60 Love XP)`);
  };

  const hatchBabyEgg = (babyName?: string) => {
    if (!marriage.babyEgg.hasEgg || marriage.babyEgg.isHatched) return;

    sounds.playEggHatch();
    triggerConfetti();

    const name = babyName || 'Sproutlet';
    const unlockedBabyId: CompanionId = 'baby_sprout';

    setMarriage((prev) => ({
      ...prev,
      loveBondLevel: Math.min(5, prev.loveBondLevel + 1),
      loveTitle: 'Happy Family',
      babyEgg: {
        ...prev.babyEgg,
        isHatched: true,
        hatchedDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        babyName: name,
        babyAvatar: 'https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&auto=format&fit=crop&q=80',
        babyBonusDesc: '+20% Permanent Habit XP Buff',
      },
    }));

    // Unlock baby pet companion
    setPets((prev) => ({
      ...prev,
      [unlockedBabyId]: {
        ...prev[unlockedBabyId],
        name,
        isUnlocked: true,
      },
    }));

    setNotifications((prev) => [
      {
        id: `n-hatch-${Date.now()}`,
        title: '🐣 Baby Pet Hatched!',
        desc: `Congratulations! ${name} has hatched and joined your HabitPet family!`,
        time: 'Just now',
        read: false,
        type: 'marriage',
      },
      ...prev,
    ]);

    showToast(`🐣 The Love Egg Hatched! Welcome to the family, ${name}! 🎉`);
  };

  // Battle Functions
  const completeBattle = (result: 'win' | 'lose', opponent: BattleOpponent) => {
    if (result === 'win') {
      sounds.playVictory();
      triggerConfetti();

      const earnedLeafs = opponent.rewardLeafs;
      const earnedXp = opponent.rewardXp;

      setLeafPoints((prev) => prev + earnedLeafs);

      setPets((prev) => {
        const pet = prev[currentPetId];
        let newXp = pet.currentXp + earnedXp;
        let newLevel = pet.growthLevel;
        let newMaxXp = pet.maxXp;

        if (newXp >= newMaxXp) {
          newXp = newXp - newMaxXp;
          newLevel += 1;
          newMaxXp = Math.round(newMaxXp * 1.25);
        }

        return {
          ...prev,
          [currentPetId]: {
            ...pet,
            currentXp: newXp,
            growthLevel: newLevel,
            maxXp: newMaxXp,
            happinessPct: Math.min(100, pet.happinessPct + 6),
          },
        };
      });

      setNotifications((prev) => [
        {
          id: `n-battle-${Date.now()}`,
          title: `⚔️ Victory vs ${opponent.name}!`,
          desc: `Earned +${earnedLeafs} Leafs & +${earnedXp} Pet Battle XP!`,
          time: 'Just now',
          read: false,
          type: 'battle',
        },
        ...prev,
      ]);

      showToast(`🏆 VICTORY! Defeated ${opponent.name}! (+${earnedLeafs} Leafs, +${earnedXp} XP)`);
    } else {
      sounds.playPop();
      showToast(`Defeat! Keep training your daily habits to power up ${currentPet.name}'s battle stats!`);
    }
  };

  const upgradePetSkill = (petId: CompanionId, skillId: string) => {
    setPets((prev) => {
      const pet = prev[petId];
      if (!pet.skills) return prev;
      const updatedSkills = pet.skills.map((s) => (s.id === skillId ? { ...s, power: s.power + 10 } : s));
      return {
        ...prev,
        [petId]: {
          ...pet,
          skills: updatedSkills,
        },
      };
    });
    sounds.playSkillBurst();
    showToast(`⚡ Skill upgraded! Power increased by +10!`);
  };

  const triggerEvolutionCutscene = (targetStageNumber?: number) => {
    const lines = PET_EVOLUTION_LINES[currentPetId] || EVOLUTION_STAGES;
    const currentNum = currentPet.evolutionStage || 1;
    const targetNum = targetStageNumber || Math.min(4, currentNum + 1);

    const currentStage = lines.find((s) => s.stageNumber === currentNum) || lines[0];
    const nextStage = lines.find((s) => s.stageNumber === targetNum) || lines[Math.min(lines.length - 1, targetNum - 1)];

    setPendingEvolutionStages({
      current: currentStage,
      next: nextStage,
    });
    setIsEvolutionCutsceneOpen(true);
  };

  const completeEvolutionCutscene = () => {
    if (!pendingEvolutionStages) {
      setIsEvolutionCutsceneOpen(false);
      return;
    }

    const { next } = pendingEvolutionStages;
    const newStageNum = next.stageNumber;
    const pokemonName = getPokemonStageName(currentPetId, newStageNum) || next.pokemonName || next.name;
    const newArtwork = getPokemonArtwork(currentPetId, newStageNum);

    // Update Pet State
    setPets((prev) => {
      const pet = prev[currentPetId];
      const gains = next.statGains || { hp: 50, atk: 15, def: 15, spAtk: 20, spd: 10 };
      
      const newSkills = pet.skills ? [...pet.skills] : [];
      if (next.signatureSkill && !newSkills.some((s) => s.id === next.signatureSkill?.id)) {
        newSkills.push(next.signatureSkill);
      }

      return {
        ...prev,
        [currentPetId]: {
          ...pet,
          name: pokemonName,
          title: next.categoryTitle || pokemonName,
          evolutionStage: newStageNum,
          avatarImage: newArtwork,
          full3DImage: newArtwork,
          islandImage: newArtwork,
          growthLevel: Math.max(pet.growthLevel, newStageNum * 4),
          maxHp: pet.maxHp + gains.hp,
          currentHp: pet.maxHp + gains.hp,
          attack: (pet.attack || 50) + gains.atk,
          defense: (pet.defense || 50) + gains.def,
          speed: (pet.speed || 10) + gains.spd,
          skills: newSkills,
        },
      };
    });

    // Update Evolution Stages List
    setEvolutionStages((prev) =>
      prev.map((stage) => {
        if (stage.stageNumber < newStageNum) {
          return { ...stage, status: 'mastered', progressPct: 100 };
        }
        if (stage.stageNumber === newStageNum) {
          return { ...stage, status: 'current', progressPct: 100 };
        }
        return stage;
      })
    );

    // Reward Leaf Points
    setLeafPoints((prev) => prev + 350);

    // Add Notification
    setNotifications((prev) => [
      {
        id: `n-evo-${Date.now()}`,
        title: `✨ Evolution Complete!`,
        desc: `${currentPet.name} evolved into ${pokemonName}! Gained massive stat boosts & +350 Leafs!`,
        time: 'Just now',
        read: false,
        type: 'evolution',
      },
      ...prev,
    ]);

    triggerConfetti();
    sounds.playVictory();
    showToast(`🌟 ${currentPet.name} has evolved into ${pokemonName}! (+350 Leafs)`);
    setIsEvolutionCutsceneOpen(false);
    setPendingEvolutionStages(null);
  };

  const markNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        user,
        login,
        signup,
        logout,
        updateProfile,
        uploadAvatar,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isProfileModalOpen,
        setIsProfileModalOpen,
        currentPetId,
        currentPet,
        pets,
        switchCompanion,
        renamePet,
        unlockCompanion,
        habits,
        toggleHabit,
        incrementHabitCount,
        addHabit,
        updateHabit,
        deleteHabit,
        editingHabit,
        setEditingHabit,
        isAddHabitModalOpen,
        setIsAddHabitModalOpen,
        isEditHabitModalOpen,
        setIsEditHabitModalOpen,
        leafPoints,
        setLeafPoints,
        storeItems,
        buyStoreItem,
        useStoreItem,
        toggleEquipItem,
        evolutionStages,
        playtimeData,
        isEvolutionCutsceneOpen,
        setIsEvolutionCutsceneOpen,
        pendingEvolutionStages,
        triggerEvolutionCutscene,
        completeEvolutionCutscene,
        duoPartner,
        updateDuoPartner,
        sendDuoGift,
        cheerDuoPartner,
        isAddPartnerModalOpen,
        setIsAddPartnerModalOpen,
        interactWithPet,
        isCompanionModalOpen,
        setIsCompanionModalOpen,
        isFocusTimerOpen,
        setIsFocusTimerOpen,
        completeFocusSession,
        marriage,
        proposeMarriage,
        divorcePet,
        sendLoveNote,
        sendLoveGift,
        hatchBabyEgg,
        isMarriageModalOpen,
        setIsMarriageModalOpen,
        battleOpponents,
        activeBattleOpponent,
        setActiveBattleOpponent,
        completeBattle,
        upgradePetSkill,
        toastMessage,
        showToast,
        notifications,
        markNotificationsRead,
        isNotificationsOpen,
        setIsNotificationsOpen,
        isGuideBookOpen,
        setIsGuideBookOpen,
        guideBookInitialTab,
        openGuideBook,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

