// Definisi semua tipe data TypeScript yang dipakai di seluruh aplikasi.
// Berisi tipe untuk Pet, Habit, StoreItem, Marriage, Battle, UserProfile, dan lainnya.

export type CompanionId =
  | 'sprout'
  | 'ember'
  | 'bubbles'
  | 'lumi'
  | 'nyx'
  | 'blossom'
  | 'zephyr'
  | 'magma'
  | 'mewtwo'
  | 'dragonite'
  | 'snorlax'
  | 'cyndaquil'
  | 'totodile'
  | 'rayquaza'
  | 'greninja'
  | 'mimikyu'
  | 'baby_sprout'
  | 'baby_starlight';

export type PetElement =
  | 'nature'
  | 'fire'
  | 'water'
  | 'starlight'
  | 'shadow'
  | 'bloom'
  | 'thunder'
  | 'earth'
  | 'dragon'
  | 'fighting'
  | 'psychic'
  | 'ghost'
  | 'normal';

export type HabitCategory = 'Health' | 'Mindfulness' | 'Fitness' | 'Learning' | 'Productivity';

export type HabitFrequency = 'Daily' | 'Weekly' | 'Custom';

export type HabitDifficulty = 'easy' | 'medium' | 'hard';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  title: string;
  bio: string;
  level: number;
  streakDays: number;
  totalHabitsCompleted: number;
  joinDate: string;
  isLoggedIn: boolean;
  themePreference?: 'emerald' | 'amber' | 'azure';
}

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  frequency: HabitFrequency;
  difficulty: HabitDifficulty;
  points: number;
  streak: number;
  completedToday: boolean;
  completedDates: string[];
  createdAt: string;
  description?: string;
  targetCount?: number;
  currentCount?: number;
  unit?: string;
  timeOfDay?: TimeOfDay;
}

export interface BattleSkill {
  id: string;
  name: string;
  element: PetElement;
  type: 'attack' | 'heal' | 'buff' | 'ultimate';
  power: number;
  mpCost: number;
  description: string;
  iconName: string;
  cooldown?: number;
}

export interface BattleStats {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  spAtk: number;
  spd: number;
  critRate: number;
}

export interface CompanionUnlockCondition {
  type: 'starter' | 'streak' | 'habits_count' | 'happiness' | 'feed_count' | 'focus_sprints' | 'gym_badge' | 'leaf_points';
  targetValue: number | string;
  description: string;
  isMet?: boolean;
  currentValue?: number;
}

export interface CompanionPet {
  id: CompanionId;
  name: string;
  title: string;
  element: PetElement;
  tagLabel: string;
  tagColor: string;
  description: string;
  avatarImage: string;
  full3DImage: string;
  islandImage: string;
  growthLevel: number;
  currentXp: number;
  maxXp: number;
  happinessPct: number;
  healthStatus: 'Excellent' | 'Great' | 'Good' | 'Needs Water';
  focusStat: number;
  energyStat: number;
  playtimeRecentPct: number;
  habitCompletionPct: number;
  treatsGivenPct: number;
  evolutionStage: number; // 1: Seed, 2: Sproutling, 3: Small Tree, 4: Mighty Oak
  equippedItems: string[];
  battleStats?: BattleStats;
  skills?: BattleSkill[];
  isUnlocked?: boolean;
  unlockCondition?: CompanionUnlockCondition;
}

export interface BabyEgg {
  hasEgg: boolean;
  eggType: string;
  eggName: string;
  eggImage: string;
  incubationProgress: number; // Habit completions count
  maxProgress: number;
  isHatched: boolean;
  hatchedDate?: string;
  babyName?: string;
  babyAvatar?: string;
  babyBonusDesc?: string;
}

export interface PetMarriage {
  isMarried: boolean;
  partnerPetName: string;
  partnerPetAvatar: string;
  partnerOwnerName: string;
  marriageDate: string;
  ringType: string;
  ringBonus: string;
  loveBondLevel: number; // 1 to 5
  loveTitle: string;
  loveExp: number;
  maxLoveExp: number;
  loveBuffActive: boolean;
  weddingVows: string;
  weddingPhoto: string;
  babyEgg: BabyEgg;
  loveNotes: { id: string; sender: string; text: string; date: string }[];
}

export interface MarriageSuitor {
  id: string;
  name: string;
  petName: string;
  avatar: string;
  petAvatar: string;
  element: PetElement;
  tagLabel: string;
  personality: string;
  favoriteGift: string;
  bio: string;
  compatibilityScore: number;
  vowsPreset: string;
}

export type BattleMode = 'gym' | 'pvp';

export interface BattleOpponent {
  id: string;
  name: string;
  stageLevel?: number;
  trainerName?: string;
  trainerAvatar?: string;
  title: string;
  avatar: string;
  element: PetElement;
  level: number;
  mode?: BattleMode;
  rankTier?: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master Ball';
  rankRating?: number;
  habitStreak?: number;
  winRatePct?: number;
  friendCode?: string;
  stats: {
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    atk: number;
    def: number;
    spAtk: number;
    spd: number;
  };
  skills: BattleSkill[];
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Boss' | 'Champion';
  rewardLeafs: number;
  rewardXp: number;
  rewardBadge?: string;
  rewardBp?: number;
  firstClearReward?: {
    leafs: number;
    bp: number;
    xp: number;
    badge?: string;
    title?: string;
  };
  bgAtmosphere: string;
  dialogueIntro: string;
  dialogueVictory: string;
}

export interface BattleLogItem {
  id: string;
  text: string;
  type: 'player' | 'enemy' | 'system' | 'crit' | 'heal' | 'buff' | 'victory';
  turn: number;
}

export interface StoreItem {
  id: string;
  name: string;
  description: string;
  category: 'potion' | 'accessory' | 'booster' | 'treat' | 'decor' | 'marriage';
  cost: number;
  icon: string;
  colorTheme: string;
  isNew?: boolean;
  isSoldOut?: boolean;
  isEquipped?: boolean;
  isPurchased?: boolean;
  quantity?: number;
  boostEffect?: string;
}

export interface EvolutionStage {
  id: string;
  stageNumber: number;
  name: string;
  pokemonName?: string;
  categoryTitle?: string;
  height?: string;
  weight?: string;
  description: string;
  image?: string;
  status: 'mastered' | 'current' | 'locked' | 'ready_to_evolve';
  requiredLevel?: number;
  requiredStreakDays?: number;
  currentStreakDays?: number;
  requiredHabitsCount?: number;
  progressPct?: number;
  statGains?: {
    hp: number;
    atk: number;
    def: number;
    spAtk: number;
    spd: number;
  };
  signatureSkill?: BattleSkill;
}

export interface EvolutionEventData {
  petId: CompanionId;
  previousStage: number;
  targetStage: number;
  oldName: string;
  newName: string;
  speciesTitle: string;
  statBoosts: {
    hp: number;
    atk: number;
    def: number;
    spAtk: number;
    spd: number;
  };
  unlockedSkill?: BattleSkill;
  pokedexEntry: string;
  height: string;
  weight: string;
}

export interface PlaytimeData {
  totalHours: number;
  totalMinutes: number;
  weekChange: string;
  todayDuration: string;
  dailyAvgDuration: string;
  bondingLevel: number;
  bondingTitle: string;
  bondingProgressPct: number;
  distribution: {
    activePlayPct: number;
    groomingPct: number;
    idleBondingPct: number;
  };
  rewards: {
    id: string;
    name: string;
    points: number | string;
    icon: string;
    accentColor: string;
    unlocked: boolean;
  }[];
}

export interface DuoPartner {
  id?: string;
  name: string;
  partnerPetName: string;
  partnerPetAvatar: string;
  partnerAvatar: string;
  partnerLevel: number;
  dailySynergyPct: number;
  bondPoints: number;
  lastGiftSent?: string;
  sharedSanctuaryBg: string;
  friendCode?: string;
  statusMessage?: string;
}

export type ActiveTab =
  | 'habitat'
  | 'habits'
  | 'battle'
  | 'marriage'
  | 'store'
  | 'evolution'
  | 'stats'
  | 'sanctuary';

