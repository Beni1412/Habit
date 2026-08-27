import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BattleOpponent,
  BattleSkill,
  BattleLogItem,
  PetElement,
  BattleMode,
} from '../../types';
import {
  calculatePlayerAttackDamage,
  calculateEnemyAttackDamage,
  getElementMultiplier,
  ELEMENT_RELATIONS,
} from '../../utils/battleEngine';
import { sounds } from '../../utils/audio';
import {
  Swords,
  Shield,
  Zap,
  Heart,
  Sparkles,
  Flame,
  Award,
  RefreshCw,
  HelpCircle,
  X,
  TrendingUp,
  Droplets,
  Package,
  Trophy,
  Users,
  Search,
  Crown,
  Target,
  UserCheck,
  Check,
  CheckCircle,
  Gift,
  Lock,
  BookOpen,
} from 'lucide-react';

const ELEMENT_BADGES: Record<PetElement, { label: string; bg: string; text: string; icon: string }> = {
  fire: { label: 'Fire', bg: 'bg-red-500/15 border-red-500/30', text: 'text-red-600', icon: '🔥' },
  water: { label: 'Water', bg: 'bg-blue-500/15 border-blue-500/30', text: 'text-blue-600', icon: '💧' },
  nature: { label: 'Grass / Nature', bg: 'bg-emerald-500/15 border-emerald-500/30', text: 'text-emerald-600', icon: '🌿' },
  bloom: { label: 'Fairy / Bloom', bg: 'bg-pink-500/15 border-pink-500/30', text: 'text-pink-600', icon: '🌸' },
  thunder: { label: 'Electric / Thunder', bg: 'bg-amber-500/15 border-amber-500/30', text: 'text-amber-600', icon: '⚡' },
  earth: { label: 'Ground / Earth', bg: 'bg-yellow-700/15 border-yellow-700/30', text: 'text-yellow-800', icon: '⛰️' },
  shadow: { label: 'Dark / Shadow', bg: 'bg-purple-900/15 border-purple-900/30', text: 'text-purple-700', icon: '🌑' },
  ghost: { label: 'Ghost', bg: 'bg-indigo-900/15 border-indigo-900/30', text: 'text-indigo-600', icon: '👻' },
  psychic: { label: 'Psychic', bg: 'bg-fuchsia-500/15 border-fuchsia-500/30', text: 'text-fuchsia-600', icon: '🔮' },
  fighting: { label: 'Fighting', bg: 'bg-orange-600/15 border-orange-600/30', text: 'text-orange-700', icon: '🥊' },
  dragon: { label: 'Dragon', bg: 'bg-violet-600/15 border-violet-600/30', text: 'text-violet-700', icon: '🐉' },
  starlight: { label: 'Starlight / Astral', bg: 'bg-teal-500/15 border-teal-500/30', text: 'text-teal-700', icon: '✨' },
  normal: { label: 'Normal', bg: 'bg-zinc-500/15 border-zinc-500/30', text: 'text-zinc-700', icon: '⚪' },
};

const RANK_TIERS = [
  { name: 'Bronze', minRating: 1000, color: 'text-amber-700 bg-amber-100 border-amber-300', icon: '🥉' },
  { name: 'Silver', minRating: 1300, color: 'text-slate-700 bg-slate-100 border-slate-300', icon: '🥈' },
  { name: 'Gold', minRating: 1600, color: 'text-yellow-800 bg-yellow-100 border-yellow-300', icon: '🥇' },
  { name: 'Platinum', minRating: 1900, color: 'text-cyan-800 bg-cyan-100 border-cyan-300', icon: '💎' },
  { name: 'Diamond', minRating: 2200, color: 'text-purple-800 bg-purple-100 border-purple-300', icon: '👑' },
  { name: 'Master Ball', minRating: 2500, color: 'text-fuchsia-900 bg-fuchsia-100 border-fuchsia-400', icon: '🌟' },
];

export const BattleScreen: React.FC = () => {
  const {
    currentPet,
    battleOpponents,
    activeBattleOpponent,
    setActiveBattleOpponent,
    completeBattle,
    leafPoints,
    setLeafPoints,
    user,
    showToast,
    unlockCompanion,
    openGuideBook,
  } = useApp();

  // Mode Selection: 'gym' (PvE) or 'pvp' (Player vs Player)
  const [battleTabMode, setBattleTabMode] = useState<BattleMode>('gym');
  const [pvpSubTab, setPvpSubTab] = useState<'stages' | 'leaderboard' | 'duel'>('stages');
  const [gymFilter, setGymFilter] = useState<'all' | 'gym' | 'raid'>('all');
  const [stageFilter, setStageFilter] = useState<'all' | 'unlocked' | 'cleared'>('all');

  // PvP Stats & Stage Clears (persisted in localStorage)
  const [pvpRating, setPvpRating] = useState<number>(() => {
    const saved = localStorage.getItem('habitpet_pvp_rating');
    return saved ? parseInt(saved, 10) : 1450;
  });
  const [pvpWins, setPvpWins] = useState<number>(() => {
    const saved = localStorage.getItem('habitpet_pvp_wins');
    return saved ? parseInt(saved, 10) : 6;
  });
  const [pvpLosses, setPvpLosses] = useState<number>(() => {
    const saved = localStorage.getItem('habitpet_pvp_losses');
    return saved ? parseInt(saved, 10) : 2;
  });
  const [battlePoints, setBattlePoints] = useState<number>(() => {
    const saved = localStorage.getItem('habitpet_battle_points');
    return saved ? parseInt(saved, 10) : 180;
  });
  const [clearedStages, setClearedStages] = useState<string[]>(() => {
    const saved = localStorage.getItem('habitpet_cleared_stages');
    return saved ? JSON.parse(saved) : [];
  });
  const [lastBattleFirstClear, setLastBattleFirstClear] = useState<boolean>(false);

  // Friend Code Custom Search
  const [searchFriendCode, setSearchFriendCode] = useState('');
  const [customSearchError, setCustomSearchError] = useState<string | null>(null);
  const [isMatchmakingSearching, setIsMatchmakingSearching] = useState(false);
  const [matchmakingCountdown, setMatchmakingCountdown] = useState<number | null>(null);
  const [matchedOpponent, setMatchedOpponent] = useState<BattleOpponent | null>(null);

  // Selected Opponent
  const [selectedOpponent, setSelectedOpponent] = useState<BattleOpponent>(
    activeBattleOpponent || battleOpponents[0] || null
  );

  // In-battle dynamic state
  const [inBattle, setInBattle] = useState(false);
  const [playerHp, setPlayerHp] = useState(300);
  const [playerMaxHp, setPlayerMaxHp] = useState(300);
  const [playerMp, setPlayerMp] = useState(100);
  const [playerMaxMp, setPlayerMaxMp] = useState(100);
  const [playerShield, setPlayerShield] = useState(0);

  const [enemyHp, setEnemyHp] = useState(300);
  const [enemyMaxHp, setEnemyMaxHp] = useState(300);
  const [enemyMp, setEnemyMp] = useState(100);
  const [enemyMaxMp, setEnemyMaxMp] = useState(100);

  const [turn, setTurn] = useState(1);
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battleLogs, setBattleLogs] = useState<BattleLogItem[]>([]);
  const [isAttacking, setIsAttacking] = useState<'player' | 'enemy' | null>(null);
  const [hitEffect, setHitEffect] = useState<'player' | 'enemy' | null>(null);
  const [battleResult, setBattleResult] = useState<'win' | 'lose' | null>(null);
  const [showItemBag, setShowItemBag] = useState(false);
  const [showElementChart, setShowElementChart] = useState(false);

  const logContainerRef = useRef<HTMLDivElement>(null);

  // Filtered lists
  const gymOpponents = battleOpponents.filter((opp) => opp.mode !== 'pvp');
  const pvpOpponents = [...battleOpponents.filter((opp) => opp.mode === 'pvp')].sort(
    (a, b) => (a.stageLevel || 1) - (b.stageLevel || 1)
  );

  const filteredGymOpponents = gymOpponents.filter((opp) => {
    if (gymFilter === 'gym') return opp.difficulty === 'Normal' || opp.difficulty === 'Hard';
    if (gymFilter === 'raid') return opp.difficulty === 'Boss' || opp.difficulty === 'Champion';
    return true;
  });

  // Calculate highest unlocked stage
  const maxClearedStageLevel = pvpOpponents.reduce((max, opp) => {
    return clearedStages.includes(opp.id) ? Math.max(max, opp.stageLevel || 0) : max;
  }, 0);

  const isStageUnlocked = (opp: BattleOpponent) => {
    if (!opp.stageLevel || opp.stageLevel === 1) return true;
    return (opp.stageLevel || 1) <= maxClearedStageLevel + 1;
  };

  const filteredPvpStages = pvpOpponents.filter((opp) => {
    const isCleared = clearedStages.includes(opp.id);
    const isUnlocked = isStageUnlocked(opp);
    if (stageFilter === 'cleared') return isCleared;
    if (stageFilter === 'unlocked') return isUnlocked && !isCleared;
    return true;
  });

  // Auto-scroll logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [battleLogs]);

  // Persist PvP Stats & Stages
  useEffect(() => {
    localStorage.setItem('habitpet_pvp_rating', pvpRating.toString());
    localStorage.setItem('habitpet_pvp_wins', pvpWins.toString());
    localStorage.setItem('habitpet_pvp_losses', pvpLosses.toString());
    localStorage.setItem('habitpet_battle_points', battlePoints.toString());
    localStorage.setItem('habitpet_cleared_stages', JSON.stringify(clearedStages));
  }, [pvpRating, pvpWins, pvpLosses, battlePoints, clearedStages]);

  // Current Rank Calculation
  const getCurrentRank = (rating: number) => {
    let current = RANK_TIERS[0];
    for (const tier of RANK_TIERS) {
      if (rating >= tier.minRating) {
        current = tier;
      }
    }
    return current;
  };

  const userRank = getCurrentRank(pvpRating);

  // Initialize battle stats when starting
  const startBattle = (opponent: BattleOpponent) => {
    setSelectedOpponent(opponent);
    setActiveBattleOpponent(opponent);
    setMatchedOpponent(null);
    setIsMatchmakingSearching(false);
    setLastBattleFirstClear(false);

    const pHp = currentPet.battleStats?.maxHp || 320;
    const pMp = currentPet.battleStats?.maxMp || 100;
    const eHp = opponent.stats.maxHp || 300;
    const eMp = opponent.stats.maxMp || 100;

    setPlayerHp(pHp);
    setPlayerMaxHp(pHp);
    setPlayerMp(pMp);
    setPlayerMaxMp(pMp);
    setPlayerShield(0);

    setEnemyHp(eHp);
    setEnemyMaxHp(eHp);
    setEnemyMp(eMp);
    setEnemyMaxMp(eMp);

    setTurn(1);
    setIsPlayerTurn(true);
    setBattleResult(null);
    setInBattle(true);

    const initialLogs: BattleLogItem[] = [
      {
        id: `log-${Date.now()}-1`,
        text: `⚔️ ${opponent.mode === 'pvp' ? 'PvP Trainer Duel' : 'Gym Challenge'} Started! ${opponent.dialogueIntro}`,
        type: 'system',
        turn: 1,
      },
      {
        id: `log-${Date.now()}-2`,
        text: `✨ ${currentPet.name} stepped onto the arena! Ready your discipline!`,
        type: 'player',
        turn: 1,
      },
    ];

    // Check happiness and hunger buffs
    if (currentPet.happinessPct >= 80) {
      initialLogs.push({
        id: `log-${Date.now()}-3`,
        text: `💖 High Happiness (${currentPet.happinessPct}%): +35% Attack power & high crit chance!`,
        type: 'buff',
        turn: 1,
      });
    }
    if ((currentPet.treatsGivenPct ?? 50) >= 70) {
      initialLogs.push({
        id: `log-${Date.now()}-4`,
        text: `🍖 Well-Fed Energy (${currentPet.treatsGivenPct}%): +25% Strength bonus!`,
        type: 'buff',
        turn: 1,
      });
    }
    if (user.streakDays > 0) {
      initialLogs.push({
        id: `log-${Date.now()}-5`,
        text: `🔥 Daily Habit Streak (${user.streakDays} days): +${user.streakDays * 5}% Discipline Synergy Boost!`,
        type: 'buff',
        turn: 1,
      });
    }

    setBattleLogs(initialLogs);
    sounds.playBattleStart();
  };

  // Quick Matchmaking Finder
  const handleStartMatchmaking = () => {
    setIsMatchmakingSearching(true);
    setMatchmakingCountdown(3);
    sounds.playPop();

    const interval = setInterval(() => {
      setMatchmakingCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          // Pick a random PvP opponent
          const randomOpp = pvpOpponents[Math.floor(Math.random() * pvpOpponents.length)];
          setMatchedOpponent(randomOpp);
          setIsMatchmakingSearching(false);
          sounds.playSkillBurst();
          return null;
        }
        return prev - 1;
      });
    }, 800);
  };

  // Friend Code Search
  const handleSearchFriendCode = () => {
    setCustomSearchError(null);
    const query = searchFriendCode.trim().toUpperCase();
    if (!query) {
      setCustomSearchError('Please enter a valid Friend Code / Trainer ID');
      return;
    }

    const found = pvpOpponents.find(
      (opp) =>
        (opp.friendCode && opp.friendCode.toUpperCase().includes(query)) ||
        opp.trainerName?.toUpperCase().includes(query) ||
        opp.name.toUpperCase().includes(query)
    );

    if (found) {
      setMatchedOpponent(found);
      showToast(`🎯 Matched with ${found.trainerName || found.name}!`);
      sounds.playSkillBurst();
    } else {
      // Dynamic fallback opponent if custom code
      const customOpponent: BattleOpponent = {
        id: `custom-${Date.now()}`,
        name: `Trainer ${query.split('-')[0] || 'Challenger'} & Pikachu`,
        trainerName: `Trainer ${query.split('-')[0] || 'Friend'}`,
        trainerAvatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/lucas.png',
        title: `Custom Challenger (${query})`,
        avatar: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
        element: 'thunder',
        level: Math.max(8, Math.min(20, user.level + 2)),
        mode: 'pvp',
        rankTier: 'Gold',
        rankRating: 1550,
        habitStreak: 12,
        winRatePct: 75,
        friendCode: query,
        difficulty: 'Normal',
        stats: {
          hp: 450,
          maxHp: 450,
          mp: 100,
          maxMp: 100,
          atk: 85,
          def: 70,
          spAtk: 95,
          spd: 90,
        },
        skills: [
          {
            id: 'sk_custom_1',
            name: 'Thunderbolt Pulse',
            element: 'thunder',
            type: 'attack',
            power: 80,
            mpCost: 25,
            description: 'Custom electric zap trained through daily focus habits!',
            iconName: 'Zap',
          },
        ],
        rewardLeafs: 200,
        rewardXp: 450,
        rewardBp: 30,
        bgAtmosphere: 'from-amber-950/90 to-slate-950',
        dialogueIntro: `Challenger: "You entered my Friend Code ${query}! Let’s see your Pokémon's true power!"`,
        dialogueVictory: `Challenger: "Well fought! Your daily routines are on another level!"`,
      };

      setMatchedOpponent(customOpponent);
      showToast(`🎯 Connected to Trainer ${query}!`);
      sounds.playSkillBurst();
    }
  };

  const handlePlayerSkill = (skill: BattleSkill) => {
    if (!isPlayerTurn || battleResult || !inBattle) return;

    if (playerMp < skill.mpCost) {
      showToast(`Not enough MP! Needs ${skill.mpCost} MP.`);
      sounds.playPop();
      return;
    }

    setIsPlayerTurn(false);
    setIsAttacking('player');

    // Deduct MP
    setPlayerMp((prev) => Math.max(0, prev - skill.mpCost));

    // Handle Skill Types
    if (skill.type === 'heal') {
      sounds.playHeal();
      const healAmount = Math.round(playerMaxHp * 0.35) + skill.power;
      setPlayerHp((prev) => Math.min(playerMaxHp, prev + healAmount));
      setPlayerMp((prev) => Math.min(playerMaxMp, prev + 20));

      setBattleLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}`,
          text: `🌿 ${currentPet.name} used ${skill.name}! Restored +${healAmount} HP & +20 MP!`,
          type: 'heal',
          turn,
        },
      ]);

      setTimeout(() => {
        setIsAttacking(null);
        triggerEnemyTurn();
      }, 900);
      return;
    }

    if (skill.type === 'buff') {
      sounds.playSkillBurst();
      const shieldGained = Math.round(playerMaxHp * 0.2) + 20;
      setPlayerShield((prev) => prev + shieldGained);
      setPlayerMp((prev) => Math.min(playerMaxMp, prev + 25));

      setBattleLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}`,
          text: `🛡️ ${currentPet.name} used ${skill.name}! Erected a ${shieldGained} HP Barrier!`,
          type: 'buff',
          turn,
        },
      ]);

      setTimeout(() => {
        setIsAttacking(null);
        triggerEnemyTurn();
      }, 900);
      return;
    }

    // Damage Attack
    sounds.playPlayerAttack();
    const streakBonus = user.streakDays || 1;
    const calc = calculatePlayerAttackDamage(currentPet, selectedOpponent, skill, streakBonus);

    setTimeout(() => {
      setHitEffect('enemy');
      const nextEnemyHp = Math.max(0, enemyHp - calc.damage);
      setEnemyHp(nextEnemyHp);

      const logMsg = calc.isCrit
        ? `💥 CRITICAL STRIKE! ${currentPet.name} unleashed ${skill.name} for ${calc.damage} DMG! (${calc.elementLabel})`
        : `⚡ ${currentPet.name} attacked with ${skill.name} for ${calc.damage} DMG! (${calc.elementLabel})`;

      setBattleLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}`,
          text: logMsg,
          type: calc.isCrit ? 'crit' : 'player',
          turn,
        },
      ]);

      setTimeout(() => {
        setHitEffect(null);
        setIsAttacking(null);

        // Check if Enemy Defeated
        if (nextEnemyHp <= 0) {
          handleVictory();
        } else {
          triggerEnemyTurn();
        }
      }, 600);
    }, 450);
  };

  const triggerEnemyTurn = () => {
    setTimeout(() => {
      if (!inBattle) return;
      setIsAttacking('enemy');

      // AI Selects a skill
      const availableSkills =
        selectedOpponent.skills && selectedOpponent.skills.length > 0
          ? selectedOpponent.skills
          : [
              {
                id: 'basic_enemy_atk',
                name: 'Heavy Tackle',
                element: selectedOpponent.element,
                type: 'attack' as const,
                power: 45,
                mpCost: 10,
                description: 'Charges with full body force!',
                iconName: 'Shield',
              },
            ];

      const chosenSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)];

      if (chosenSkill.type === 'heal') {
        sounds.playHeal();
        const healAmt = 60;
        setEnemyHp((prev) => Math.min(enemyMaxHp, prev + healAmt));
        setBattleLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}`,
            text: `✨ ${selectedOpponent.name} used ${chosenSkill.name} and healed +${healAmt} HP!`,
            type: 'heal',
            turn,
          },
        ]);
        setIsAttacking(null);
        setIsPlayerTurn(true);
        setTurn((t) => t + 1);
        setPlayerMp((mp) => Math.min(playerMaxMp, mp + 15));
        return;
      }

      sounds.playEnemyAttack();
      const calc = calculateEnemyAttackDamage(selectedOpponent, currentPet, chosenSkill);

      setTimeout(() => {
        setHitEffect('player');

        let actualDamage = calc.damage;
        // Absorb through shield first
        if (playerShield > 0) {
          if (playerShield >= actualDamage) {
            setPlayerShield((s) => s - actualDamage);
            actualDamage = 0;
            setBattleLogs((prev) => [
              ...prev,
              {
                id: `log-${Date.now()}-shield`,
                text: `🛡️ Your barrier fully absorbed ${selectedOpponent.name}'s attack!`,
                type: 'buff',
                turn,
              },
            ]);
          } else {
            actualDamage -= playerShield;
            setPlayerShield(0);
          }
        }

        const nextPlayerHp = Math.max(0, playerHp - actualDamage);
        setPlayerHp(nextPlayerHp);

        setBattleLogs((prev) => [
          ...prev,
          {
            id: `log-${Date.now()}`,
            text: `🩸 ${selectedOpponent.name} struck back with ${chosenSkill.name} for ${actualDamage} DMG! (${calc.elementLabel})`,
            type: 'enemy',
            turn,
          },
        ]);

        setTimeout(() => {
          setHitEffect(null);
          setIsAttacking(null);

          if (nextPlayerHp <= 0) {
            handleDefeat();
          } else {
            setIsPlayerTurn(true);
            setTurn((t) => t + 1);
            // Passive MP restore on turn cycle
            setPlayerMp((mp) => Math.min(playerMaxMp, mp + 20));
          }
        }, 600);
      }, 450);
    }, 700);
  };

  const handleVictory = () => {
    setBattleResult('win');
    sounds.playVictory();
    completeBattle('win', selectedOpponent);

    // If PvP / Stage Battle, update PvP stats & check for first clear rewards
    if (selectedOpponent.mode === 'pvp' || selectedOpponent.stageLevel) {
      const isFirstClear = !clearedStages.includes(selectedOpponent.id);
      setLastBattleFirstClear(isFirstClear);
      setPvpWins((w) => w + 1);
      setPvpRating((r) => r + 25);

      if (isFirstClear && selectedOpponent.firstClearReward) {
        const fc = selectedOpponent.firstClearReward;
        setClearedStages((prev) => [...new Set([...prev, selectedOpponent.id])]);
        setLeafPoints((lp) => lp + fc.leafs);
        setBattlePoints((bp) => bp + fc.bp);
        showToast(
          `🎉 STAGE ${selectedOpponent.stageLevel || 1} CLEARED! Bonus Hadiah Pertama: +${fc.leafs} Leafs, +${fc.bp} BP, +${fc.xp} XP!`
        );
      } else {
        const earnedBp = selectedOpponent.rewardBp || 25;
        setBattlePoints((bp) => bp + earnedBp);
        showToast(`🏆 Victory! +25 Rating Points & +${earnedBp} Battle Points!`);
      }
    }

    // Special unlocks if defeated gym boss
    if (selectedOpponent.id === 'opp-6') {
      // Giovanni defeated -> Mewtwo unlocked
      unlockCompanion('mewtwo');
    } else if (selectedOpponent.id === 'opp-7') {
      // Cynthia defeated -> Rayquaza unlocked
      unlockCompanion('rayquaza');
    }

    setBattleLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}`,
        text: `🏆 VICTORY! You defeated ${selectedOpponent.name}! ${selectedOpponent.dialogueVictory}`,
        type: 'victory',
        turn,
      },
    ]);
  };

  const handleDefeat = () => {
    setBattleResult('lose');
    completeBattle('lose', selectedOpponent);

    if (selectedOpponent.mode === 'pvp') {
      setPvpLosses((l) => l + 1);
      setPvpRating((r) => Math.max(1000, r - 12));
    }

    setBattleLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}`,
        text: `💀 ${currentPet.name} fainted! Complete more daily habits to boost your Pokémon's HP, Attack, and Happiness!`,
        type: 'system',
        turn,
      },
    ]);
  };

  const useBattlePotion = (type: 'potion' | 'max_revive' | 'energy_candy') => {
    if (type === 'potion') {
      if (leafPoints < 30) {
        showToast('Needs 30 Leafs to craft Hyper Potion!');
        return;
      }
      setLeafPoints((lp) => lp - 30);
      setPlayerHp((hp) => Math.min(playerMaxHp, hp + 150));
      sounds.playHeal();
      showToast('Used Hyper Potion! +150 HP restored!');
      setBattleLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}`,
          text: `🧪 Used Hyper Potion: +150 HP restored!`,
          type: 'heal',
          turn,
        },
      ]);
    } else if (type === 'energy_candy') {
      if (leafPoints < 50) {
        showToast('Needs 50 Leafs for Focus Energy Root!');
        return;
      }
      setLeafPoints((lp) => lp - 50);
      setPlayerMp(playerMaxMp);
      sounds.playSkillBurst();
      showToast('Used Energy Root! MP fully recharged!');
      setBattleLogs((prev) => [
        ...prev,
        {
          id: `log-${Date.now()}`,
          text: `⚡ Used Energy Root: MP fully restored to 100%!`,
          type: 'buff',
          turn,
        },
      ]);
    }
    setShowItemBag(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 md:px-8 py-4 sm:py-6 pb-28">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 pb-5 border-b border-[#bccabb]/30">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-500/15 text-red-600">
              <Swords className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#0d1c2e] tracking-tight">
                Pokémon Battle Arena
              </h1>
              <p className="text-xs sm:text-sm text-[#6d7b6d] mt-0.5">
                Attack power is powered by Happiness, Treats/Hunger, Habit Streaks, and Elemental counters!
              </p>
            </div>
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openGuideBook('battle_stages')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f0fdf4] border border-[#4ade80]/60 text-xs font-black text-[#006d36] hover:bg-[#dcfce7] transition-all shadow-xs cursor-pointer"
            title="Buka Buku Panduan Arena & Trainer Tower"
          >
            <BookOpen className="w-4 h-4 text-[#006d36]" />
            <span>Guide Book</span>
          </button>

          <button
            onClick={() => setShowElementChart(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#bccabb]/50 text-xs font-bold text-[#0d1c2e] hover:border-[#006d36] transition-all shadow-xs cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-emerald-600" />
            <span>Element Weakness Chart</span>
          </button>

          {inBattle && (
            <button
              onClick={() => setInBattle(false)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-bold hover:bg-red-100 transition-all shadow-xs cursor-pointer"
            >
              <X className="w-4 h-4" />
              <span>Forfeit Match</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Battle Canvas or Lobby View */}
      {!inBattle ? (
        <div className="mt-6 space-y-6">
          {/* Top Segmented Mode Selector: PvE Gym vs PvP Arena */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2 rounded-3xl border border-[#bccabb]/40 shadow-xs">
            <div className="flex w-full sm:w-auto p-1 bg-[#f0f4f0] rounded-2xl gap-1">
              <button
                onClick={() => setBattleTabMode('gym')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  battleTabMode === 'gym'
                    ? 'bg-white text-[#006d36] shadow-sm border border-emerald-200'
                    : 'text-[#6d7b6d] hover:text-[#0d1c2e]'
                }`}
              >
                <Award className="w-4 h-4" />
                <span>🏛️ Gym & Boss Challenge (PvE)</span>
              </button>

              <button
                onClick={() => setBattleTabMode('pvp')}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
                  battleTabMode === 'pvp'
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-sm'
                    : 'text-[#6d7b6d] hover:text-[#0d1c2e]'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>⚔️ Trainer PvP Arena (Lawan Player Lain)</span>
              </button>
            </div>

            {/* Quick Status Pill */}
            {battleTabMode === 'pvp' ? (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs font-black text-amber-900">
                <span>{userRank.icon} {userRank.name} Tier</span>
                <span>•</span>
                <span>{pvpRating} BR</span>
                <span>•</span>
                <span className="text-emerald-700">{battlePoints} BP</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs font-bold text-emerald-900">
                <span>🏆 9 Gym Leaders & Raid Bosses Ready</span>
              </div>
            )}
          </div>

          {/* Active Pet Battle Readiness Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#bccabb]/40 shadow-xs flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-2 border border-emerald-200 shadow-inner">
                <img
                  src={currentPet.avatarImage}
                  alt={currentPet.name}
                  className="w-full h-full object-contain filter drop-shadow-md animate-pulse"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-xl text-[#0d1c2e]">{currentPet.name}</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${ELEMENT_BADGES[currentPet.element]?.bg} ${ELEMENT_BADGES[currentPet.element]?.text}`}>
                    {ELEMENT_BADGES[currentPet.element]?.icon} {ELEMENT_BADGES[currentPet.element]?.label}
                  </span>
                  <span className="text-xs font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    Lv. {currentPet.growthLevel}
                  </span>
                </div>
                <p className="text-xs text-[#6d7b6d] mt-1 line-clamp-1">{currentPet.description}</p>
                <div className="flex items-center gap-4 mt-2 text-xs font-bold text-[#3d4a3e]">
                  <span>HP: {currentPet.battleStats?.hp || 300} / {currentPet.battleStats?.maxHp || 300}</span>
                  <span>ATK: {currentPet.battleStats?.atk || 45}</span>
                  <span>DEF: {currentPet.battleStats?.def || 40}</span>
                  <span>SPD: {currentPet.battleStats?.spd || 40}</span>
                </div>
              </div>
            </div>

            {/* Battle Multipliers from Care & Habits */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-[#f8f9ff] p-3 rounded-2xl border border-[#bccabb]/30">
              <div className="flex items-center gap-1.5 text-xs font-bold text-pink-600 bg-pink-50 px-2.5 py-1.5 rounded-xl border border-pink-200">
                <Heart className="w-4 h-4 fill-pink-500 text-pink-500" />
                <span>Happy: {currentPet.happinessPct}% ({currentPet.happinessPct >= 80 ? '+35% Power' : '+15% Power'})</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-1.5 rounded-xl border border-amber-200">
                <Flame className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span>Streak: {user.streakDays}d (+{user.streakDays * 5}% Sync)</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Fullness: {currentPet.treatsGivenPct ?? 60}%</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* MODE 1: GYM & BOSS BATTLES (PvE) */}
          {/* ========================================================================= */}
          {battleTabMode === 'gym' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-black text-[#0d1c2e] flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    Select Gym Leader or Raid Boss Challenge
                  </h2>
                  <p className="text-xs text-[#6d7b6d]">
                    Defeat Gym Leaders to earn official badges and unlock legendary Pokémon like Mewtwo and Rayquaza!
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex gap-1.5 bg-[#f0f4f0] p-1 rounded-2xl">
                  <button
                    onClick={() => setGymFilter('all')}
                    className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      gymFilter === 'all' ? 'bg-white text-[#0d1c2e] shadow-xs' : 'text-[#6d7b6d]'
                    }`}
                  >
                    All ({gymOpponents.length})
                  </button>
                  <button
                    onClick={() => setGymFilter('gym')}
                    className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      gymFilter === 'gym' ? 'bg-white text-[#0d1c2e] shadow-xs' : 'text-[#6d7b6d]'
                    }`}
                  >
                    Gym Leaders
                  </button>
                  <button
                    onClick={() => setGymFilter('raid')}
                    className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      gymFilter === 'raid' ? 'bg-white text-[#0d1c2e] shadow-xs' : 'text-[#6d7b6d]'
                    }`}
                  >
                    Legendary Raids
                  </button>
                </div>
              </div>

              {/* Gym Leaders Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredGymOpponents.map((opp) => {
                  const badgeInfo = ELEMENT_BADGES[opp.element] || ELEMENT_BADGES.normal;
                  const multiplier = getElementMultiplier(currentPet.element, opp.element);

                  return (
                    <div
                      key={opp.id}
                      className="bg-white rounded-3xl p-4 sm:p-5 border border-[#bccabb]/40 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col justify-between group"
                    >
                      <div>
                        {/* Top banner */}
                        <div className="flex justify-between items-start gap-2 mb-3">
                          <div>
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                                opp.difficulty === 'Easy'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : opp.difficulty === 'Normal'
                                  ? 'bg-blue-100 text-blue-800'
                                  : opp.difficulty === 'Hard'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-purple-100 text-purple-800'
                              }`}
                            >
                              {opp.difficulty}
                            </span>
                            <h3 className="font-extrabold text-base text-[#0d1c2e] mt-1 group-hover:text-emerald-700 transition-colors">
                              {opp.name}
                            </h3>
                            <p className="text-[11px] font-medium text-[#6d7b6d]">{opp.title}</p>
                          </div>

                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full border ${badgeInfo.bg} ${badgeInfo.text} flex items-center gap-1 shrink-0`}
                          >
                            <span>{badgeInfo.icon}</span>
                            <span>{badgeInfo.label}</span>
                          </span>
                        </div>

                        {/* Opponent Sprite + Quick stats */}
                        <div className="flex items-center gap-3 my-3 p-3 rounded-2xl bg-[#f8f9ff] border border-[#bccabb]/25">
                          <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center p-1.5 border border-[#bccabb]/30 shadow-inner">
                            <img
                              src={opp.avatar}
                              alt={opp.name}
                              className="w-full h-full object-contain filter drop-shadow-sm"
                            />
                          </div>
                          <div className="space-y-1 text-xs">
                            <p className="font-bold text-[#0d1c2e]">Level {opp.level} Pokémon</p>
                            <div className="flex items-center gap-2 text-[#6d7b6d] font-semibold text-[11px]">
                              <span>HP: {opp.stats.maxHp}</span>
                              <span>•</span>
                              <span>ATK: {opp.stats.atk}</span>
                              <span>•</span>
                              <span>DEF: {opp.stats.def}</span>
                            </div>
                            <div className={`text-[11px] font-bold ${multiplier.color}`}>
                              Matchup: {multiplier.label}
                            </div>
                          </div>
                        </div>

                        {/* Reward Preview */}
                        <div className="flex items-center justify-between text-xs font-bold py-2 border-t border-[#bccabb]/20 text-[#3d4a3e]">
                          <span className="flex items-center gap-1 text-amber-600">
                            <Sparkles className="w-3.5 h-3.5" /> +{opp.rewardLeafs} Leafs
                          </span>
                          <span className="flex items-center gap-1 text-emerald-600">
                            <TrendingUp className="w-3.5 h-3.5" /> +{opp.rewardXp} XP
                          </span>
                          {opp.rewardBadge && (
                            <span className="text-purple-600 text-[11px]">
                              🏅 {opp.rewardBadge}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Challenge Button */}
                      <button
                        onClick={() => startBattle(opp)}
                        className="mt-3 w-full py-2.5 px-4 rounded-xl bg-[#006d36] hover:bg-[#005e2d] text-white font-bold text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm cursor-pointer"
                      >
                        <Swords className="w-4 h-4" />
                        <span>Challenge {opp.trainerName || opp.name}</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* MODE 2: TRAINER PVP ARENA (Lawan Player Lain) */}
          {/* ========================================================================= */}
          {battleTabMode === 'pvp' && (
            <div className="space-y-6">
              {/* PvP Profile Banner */}
              <div className="bg-gradient-to-r from-[#0d1c2e] via-[#1a2f47] to-[#0d1c2e] rounded-3xl p-5 sm:p-6 text-white border border-slate-700/60 shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-300 p-1 flex items-center justify-center shadow-lg">
                        <img
                          src={user.avatarUrl || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/red.png'}
                          alt={user.name}
                          className="w-full h-full object-cover rounded-xl bg-slate-900"
                        />
                      </div>
                      <span className="absolute -bottom-1 -right-1 text-sm">{userRank.icon}</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-black">{user.name}</h2>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${userRank.color}`}>
                          {userRank.name} Tier
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Trainer Friend Code: <span className="font-mono text-amber-300">HPET-{user.name.slice(0, 3).toUpperCase()}-9901</span>
                      </p>
                    </div>
                  </div>

                  {/* PvP Stats Counters */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/15 text-center min-w-[90px]">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Rating (BR)</span>
                      <span className="text-lg font-black text-amber-300">{pvpRating}</span>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/15 text-center min-w-[90px]">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Win / Loss</span>
                      <span className="text-lg font-black text-emerald-400">
                        {pvpWins}W <span className="text-slate-400 font-normal">/</span> {pvpLosses}L
                      </span>
                    </div>

                    <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/15 text-center min-w-[90px]">
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Battle Points</span>
                      <span className="text-lg font-black text-fuchsia-300">{battlePoints} BP</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PvP Sub Navigation Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-[#bccabb]/30 pb-2">
                <button
                  onClick={() => setPvpSubTab('stages')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    pvpSubTab === 'stages'
                      ? 'bg-[#006d36] text-white shadow-xs'
                      : 'text-[#6d7b6d] hover:bg-[#f0f4f0]'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>🧗 Tingkat Level Pertarungan (Level Stages 1 - 10)</span>
                </button>

                <button
                  onClick={() => setPvpSubTab('duel')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    pvpSubTab === 'duel'
                      ? 'bg-[#006d36] text-white shadow-xs'
                      : 'text-[#6d7b6d] hover:bg-[#f0f4f0]'
                  }`}
                >
                  <Search className="w-4 h-4" />
                  <span>🔍 Cari & Tantang Teman (Friend Code)</span>
                </button>

                <button
                  onClick={() => setPvpSubTab('leaderboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    pvpSubTab === 'leaderboard'
                      ? 'bg-[#006d36] text-white shadow-xs'
                      : 'text-[#6d7b6d] hover:bg-[#f0f4f0]'
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>👑 Peringkat Global Trainer</span>
                </button>
              </div>

              {/* ========================================================================= */}
              {/* SUBTAB 1: LEVEL-BASED STAGE PROGRESSION (Trainer Tower) */}
              {/* ========================================================================= */}
              {pvpSubTab === 'stages' && (
                <div className="space-y-6">
                  {/* Progression Overview Card */}
                  <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-emerald-50 rounded-3xl p-5 border border-amber-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="p-1.5 rounded-xl bg-amber-500 text-white shadow-xs">
                          <Crown className="w-5 h-5" />
                        </span>
                        <h3 className="text-base font-black text-[#0d1c2e]">
                          Trainer Tower: Level Battle Progression
                        </h3>
                      </div>
                      <p className="text-xs text-[#6d7b6d]">
                        Kalahkan setiap trainer tingkat demi tingkat untuk membuka level berikutnya dan raih Hadiah Pertama (First-Clear Rewards) yang melimpah!
                      </p>
                    </div>

                    {/* Progress Pills & Filter */}
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="px-3.5 py-1.5 bg-white rounded-2xl border border-amber-300 text-xs font-black text-amber-900 shadow-xs">
                        🏆 Level Terbuka: <span className="text-emerald-700">Stage {Math.min(10, maxClearedStageLevel + 1)} / 10</span>
                      </div>
                      <div className="px-3.5 py-1.5 bg-white rounded-2xl border border-emerald-300 text-xs font-black text-emerald-900 shadow-xs">
                        ⭐ Selesai: <span className="text-emerald-700">{clearedStages.length} / {pvpOpponents.length}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stage Filter Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="flex gap-1.5 bg-[#f0f4f0] p-1 rounded-2xl">
                      <button
                        onClick={() => setStageFilter('all')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          stageFilter === 'all' ? 'bg-white text-[#0d1c2e] shadow-xs' : 'text-[#6d7b6d]'
                        }`}
                      >
                        Semua Stage ({pvpOpponents.length})
                      </button>
                      <button
                        onClick={() => setStageFilter('unlocked')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          stageFilter === 'unlocked' ? 'bg-white text-[#0d1c2e] shadow-xs' : 'text-[#6d7b6d]'
                        }`}
                      >
                        Siap Ditantang
                      </button>
                      <button
                        onClick={() => setStageFilter('cleared')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          stageFilter === 'cleared' ? 'bg-white text-[#0d1c2e] shadow-xs' : 'text-[#6d7b6d]'
                        }`}
                      >
                        Telah Selesai ({clearedStages.length})
                      </button>
                    </div>

                    <span className="text-xs font-bold text-[#6d7b6d]">
                      Total 10 Level Tantangan Bertingkat
                    </span>
                  </div>

                  {/* Progressive Stages Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPvpStages.map((opp) => {
                      const isCleared = clearedStages.includes(opp.id);
                      const isUnlocked = isStageUnlocked(opp);
                      const badgeInfo = ELEMENT_BADGES[opp.element] || ELEMENT_BADGES.normal;
                      const matchup = getElementMultiplier(currentPet.element, opp.element);

                      return (
                        <div
                          key={opp.id}
                          className={`rounded-3xl p-4 sm:p-5 border transition-all flex flex-col justify-between group relative overflow-hidden ${
                            isCleared
                              ? 'bg-gradient-to-b from-white to-emerald-50/40 border-emerald-300 shadow-xs hover:shadow-md'
                              : isUnlocked
                              ? 'bg-white border-amber-300 shadow-sm hover:border-amber-500 hover:shadow-md'
                              : 'bg-zinc-50/80 border-zinc-200 opacity-60'
                          }`}
                        >
                          {/* Locked Overlay Icon if locked */}
                          {!isUnlocked && (
                            <div className="absolute top-3 right-3 p-1.5 rounded-xl bg-zinc-200 text-zinc-600">
                              <Lock className="w-4 h-4" />
                            </div>
                          )}

                          <div>
                            {/* Stage Header Info */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                      opp.stageLevel === 10
                                        ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white animate-pulse'
                                        : isCleared
                                        ? 'bg-emerald-600 text-white'
                                        : isUnlocked
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-zinc-400 text-white'
                                    }`}
                                  >
                                    STAGE {opp.stageLevel || 1}
                                  </span>

                                  {isCleared ? (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                                      SELESAI ⭐⭐⭐
                                    </span>
                                  ) : isUnlocked ? (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                                      <Sparkles className="w-3 h-3 text-amber-600" />
                                      TERBUKA
                                    </span>
                                  ) : (
                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-zinc-200 text-zinc-600">
                                      TERKUNCI
                                    </span>
                                  )}
                                </div>

                                <h4 className="font-black text-base text-[#0d1c2e] mt-1.5 group-hover:text-emerald-700 transition-colors">
                                  {opp.trainerName || opp.name}
                                </h4>
                                <p className="text-[11px] font-medium text-[#6d7b6d]">{opp.title}</p>
                              </div>

                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border shrink-0 ${
                                opp.difficulty === 'Champion'
                                  ? 'bg-red-100 text-red-900 border-red-300'
                                  : opp.difficulty === 'Boss'
                                  ? 'bg-purple-100 text-purple-900 border-purple-300'
                                  : opp.difficulty === 'Hard'
                                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                                  : 'bg-blue-100 text-blue-900 border-blue-300'
                              }`}>
                                Lv. {opp.level} • {opp.difficulty}
                              </span>
                            </div>

                            {/* Pokemon Card Preview */}
                            <div className="flex items-center gap-3 p-3 rounded-2xl bg-[#f8f9ff] border border-[#bccabb]/25 mb-3">
                              <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center p-1 border border-[#bccabb]/30 shadow-inner shrink-0">
                                <img
                                  src={opp.avatar}
                                  alt={opp.name}
                                  className="w-full h-full object-contain filter drop-shadow-sm"
                                />
                              </div>
                              <div className="space-y-0.5 text-xs flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-[#0d1c2e]">{opp.name.split('&')[1]?.trim() || opp.name}</span>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${badgeInfo.bg} ${badgeInfo.text}`}>
                                    {badgeInfo.icon} {badgeInfo.label}
                                  </span>
                                </div>
                                <div className="text-[11px] text-[#6d7b6d] italic line-clamp-1">
                                  "{opp.dialogueIntro}"
                                </div>
                                <div className={`text-[11px] font-bold ${matchup.color}`}>
                                  Matchup: {matchup.label}
                                </div>
                              </div>
                            </div>

                            {/* First Clear Reward Callout */}
                            <div className="mb-3">
                              {opp.firstClearReward && !isCleared ? (
                                <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-yellow-500/15 to-emerald-500/15 border border-amber-300/80 text-xs">
                                  <div className="flex items-center justify-between text-[11px] font-black text-amber-900 mb-1">
                                    <span className="flex items-center gap-1">
                                      <Gift className="w-3.5 h-3.5 text-amber-600" />
                                      🎁 HADIAH PERTAMA (FIRST CLEAR):
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between font-bold text-[11px] text-[#0d1c2e]">
                                    <span className="text-amber-700">+{opp.firstClearReward.leafs} Leafs</span>
                                    <span className="text-fuchsia-700 font-black">+{opp.firstClearReward.bp} BP</span>
                                    <span className="text-emerald-700">+{opp.firstClearReward.xp} XP</span>
                                  </div>
                                  {opp.firstClearReward.title && (
                                    <div className="text-[10px] font-extrabold text-purple-700 mt-1">
                                      🎖️ Gelar: "{opp.firstClearReward.title}"
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between text-emerald-800 font-bold">
                                  <span className="flex items-center gap-1 text-[11px]">
                                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                                    Hadiah Pertama Telah Diklaim
                                  </span>
                                  <span className="text-[10px] bg-emerald-100 px-2 py-0.5 rounded-md">
                                    Clear Bonus Claimed
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Repeat Rewards Preview */}
                            <div className="flex items-center justify-between text-xs font-bold py-1.5 border-t border-[#bccabb]/20 text-[#3d4a3e]">
                              <span className="text-[10px] text-[#6d7b6d] uppercase font-bold">Hadiah Ulang:</span>
                              <span className="flex items-center gap-1 text-fuchsia-600 font-extrabold">
                                <Award className="w-3.5 h-3.5" /> +{opp.rewardBp || 25} BP
                              </span>
                              <span className="flex items-center gap-1 text-amber-600">
                                <Sparkles className="w-3.5 h-3.5" /> +{opp.rewardLeafs} Leafs
                              </span>
                              <span className="flex items-center gap-1 text-emerald-600">
                                <TrendingUp className="w-3.5 h-3.5" /> +{opp.rewardXp} XP
                              </span>
                            </div>
                          </div>

                          {/* Action Button */}
                          {isUnlocked ? (
                            <button
                              onClick={() => startBattle(opp)}
                              className={`mt-3 w-full py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-sm cursor-pointer ${
                                isCleared
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-700 hover:to-amber-700 text-white'
                              }`}
                            >
                              <Swords className="w-4 h-4" />
                              <span>
                                {isCleared
                                  ? `🔄 Tantang Ulang Stage ${opp.stageLevel || 1}`
                                  : `⚔️ Tantang Stage ${opp.stageLevel || 1} Sekarang`}
                              </span>
                            </button>
                          ) : (
                            <button
                              disabled
                              className="mt-3 w-full py-2.5 px-4 rounded-xl bg-zinc-200 text-zinc-500 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed"
                            >
                              <Lock className="w-3.5 h-3.5" />
                              <span>Kalahkan Stage {(opp.stageLevel || 2) - 1} untuk Membuka</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ========================================================================= */}
              {/* SUBTAB 2: CUSTOM DUEL VIA FRIEND CODE */}
              {/* ========================================================================= */}
              {pvpSubTab === 'duel' && (
                <div className="space-y-6">
                  {/* Action Row: Friend Code Search */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Friend Code / Trainer ID Duel Input */}
                    <div className="bg-white rounded-3xl p-5 border border-[#bccabb]/40 shadow-xs flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="p-2 rounded-xl bg-blue-500/15 text-blue-600">
                            <Search className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-base font-black text-[#0d1c2e]">Custom Duel via Friend Code</h3>
                            <p className="text-xs text-[#6d7b6d]">Masukkan Friend Code trainer untuk bertarung langsung</p>
                          </div>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <input
                            type="text"
                            placeholder="e.g. TRAINER-RED-0001 or HABIT-LUCAS-8821"
                            value={searchFriendCode}
                            onChange={(e) => setSearchFriendCode(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearchFriendCode()}
                            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-[#bccabb]/60 focus:border-[#006d36] focus:outline-hidden font-mono uppercase bg-[#f8f9ff]"
                          />
                          <button
                            onClick={handleSearchFriendCode}
                            className="px-4 py-2.5 bg-[#006d36] hover:bg-[#005e2d] text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Search className="w-4 h-4" />
                            <span>Cari</span>
                          </button>
                        </div>
                        {customSearchError && (
                          <p className="text-[11px] text-red-600 font-bold mt-1.5">{customSearchError}</p>
                        )}
                      </div>

                      {/* Quick Code suggestions */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2 border-t border-[#bccabb]/20 text-[11px] font-semibold text-[#6d7b6d]">
                        <span>Contoh:</span>
                        <button
                          onClick={() => setSearchFriendCode('HABIT-LUCAS-8821')}
                          className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 cursor-pointer font-mono"
                        >
                          Lucas (Partner)
                        </button>
                        <button
                          onClick={() => setSearchFriendCode('TRAINER-ASH-1997')}
                          className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 cursor-pointer font-mono"
                        >
                          Ash Ketchum
                        </button>
                        <button
                          onClick={() => setSearchFriendCode('TRAINER-RED-0001')}
                          className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 cursor-pointer font-mono"
                        >
                          Red (Master)
                        </button>
                      </div>
                    </div>

                    {/* Matched Opponent Callout Card (if found) */}
                    {matchedOpponent ? (
                      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 rounded-3xl p-5 border-2 border-emerald-400 shadow-md animate-in zoom-in-95 duration-200 flex flex-col justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-2xl bg-white p-2 border border-emerald-200 flex items-center justify-center shadow-sm shrink-0">
                            <img
                              src={matchedOpponent.avatar}
                              alt={matchedOpponent.name}
                              className="w-full h-full object-contain filter drop-shadow-sm"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-black uppercase px-2 py-0.5 rounded bg-emerald-600 text-white">
                                Trainer Ditemukan!
                              </span>
                              <span className="text-xs font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                {matchedOpponent.rankTier || 'Gold'} • {matchedOpponent.rankRating || 1500} BR
                              </span>
                            </div>
                            <h3 className="text-lg font-black text-[#0d1c2e] mt-1">{matchedOpponent.name}</h3>
                            <p className="text-xs text-[#6d7b6d] line-clamp-1">{matchedOpponent.dialogueIntro}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mt-4">
                          <button
                            onClick={() => setMatchedOpponent(null)}
                            className="flex-1 px-4 py-2 rounded-xl bg-white border border-[#bccabb]/50 text-xs font-bold text-[#6d7b6d] hover:bg-zinc-50 cursor-pointer"
                          >
                            Batal
                          </button>
                          <button
                            onClick={() => startBattle(matchedOpponent)}
                            className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-transform active:scale-95 cursor-pointer"
                          >
                            <Swords className="w-4 h-4" />
                            <span>Mulai Duel!</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-[#f8f9ff] rounded-3xl p-5 border border-dashed border-[#bccabb]/60 flex flex-col items-center justify-center text-center p-6">
                        <Users className="w-8 h-8 text-[#6d7b6d] mb-2" />
                        <p className="text-xs font-bold text-[#0d1c2e]">Belum Ada Duel Terpilih</p>
                        <p className="text-[11px] text-[#6d7b6d] mt-0.5">
                          Ketik Friend Code atau klik salah satu contoh kode di sebelah kiri.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PvP Leaderboard Section */}
              {pvpSubTab === 'leaderboard' && (
                <div className="bg-white rounded-3xl p-5 border border-[#bccabb]/40 shadow-xs space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-black text-[#0d1c2e] flex items-center gap-2">
                        <Crown className="w-5 h-5 text-amber-500" />
                        Global Trainer Habit Rankings
                      </h3>
                      <p className="text-xs text-[#6d7b6d]">
                        Top trainers ranked by Battle Rating (BR), habit streaks, and Pokémon combat prowess
                      </p>
                    </div>
                    <div className="text-xs font-bold text-[#6d7b6d]">Season 4 Active</div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#bccabb]/30 text-[#6d7b6d] font-black uppercase text-[10px]">
                          <th className="py-2.5 px-3">Rank</th>
                          <th className="py-2.5 px-3">Trainer & Friend Code</th>
                          <th className="py-2.5 px-3">Partner Pokémon</th>
                          <th className="py-2.5 px-3">Tier</th>
                          <th className="py-2.5 px-3">Rating (BR)</th>
                          <th className="py-2.5 px-3">Habit Streak</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#bccabb]/20">
                        {/* Current User Row */}
                        <tr className="bg-emerald-50/70 font-bold text-[#0d1c2e]">
                          <td className="py-3 px-3">
                            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-[11px] flex items-center justify-center">
                              YOU
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-2">
                              <span className="font-black text-emerald-900">{user.name}</span>
                              <span className="text-[10px] text-[#6d7b6d] font-mono">HPET-{user.name.slice(0, 3).toUpperCase()}-9901</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <img src={currentPet.avatarImage} alt={currentPet.name} className="w-5 h-5 object-contain" />
                              <span>{currentPet.name} (Lv. {currentPet.growthLevel})</span>
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border ${userRank.color}`}>
                              {userRank.icon} {userRank.name}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-black text-amber-700">{pvpRating} BR</td>
                          <td className="py-3 px-3">🔥 {user.streakDays} Days</td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-[10px] font-black text-emerald-700 uppercase bg-emerald-100 px-2 py-1 rounded">Your Stats</span>
                          </td>
                        </tr>

                        {/* Top Community Trainers */}
                        {pvpOpponents.map((opp, idx) => (
                          <tr key={opp.id} className="hover:bg-[#f8f9ff] transition-colors">
                            <td className="py-3 px-3 font-black text-sm">
                              {idx === 0 ? '🥇 #1' : idx === 1 ? '🥈 #2' : idx === 2 ? '🥉 #3' : `#${idx + 4}`}
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <img
                                  src={opp.trainerAvatar || 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/lucas.png'}
                                  alt={opp.trainerName || opp.name}
                                  className="w-6 h-6 object-contain rounded-full bg-slate-100 p-0.5 border"
                                />
                                <div>
                                  <span className="font-bold text-[#0d1c2e] block">{opp.trainerName || opp.name}</span>
                                  <span className="text-[10px] text-[#6d7b6d] font-mono">{opp.friendCode}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                <img src={opp.avatar} alt={opp.name} className="w-5 h-5 object-contain" />
                                <span className="font-semibold text-[#0d1c2e]">{opp.name.split('&')[1]?.trim() || opp.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-slate-100 border text-slate-800">
                                {opp.rankTier || 'Gold'}
                              </span>
                            </td>
                            <td className="py-3 px-3 font-black text-amber-700">{opp.rankRating || 1600} BR</td>
                            <td className="py-3 px-3 font-semibold text-[#3d4a3e]">🔥 {opp.habitStreak || 15} Days</td>
                            <td className="py-3 px-3 text-right">
                              <button
                                onClick={() => startBattle(opp)}
                                className="px-3 py-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                              >
                                Duel
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* ACTIVE COMBAT SCREEN STAGE (Both PvE and PvP) */
        /* ========================================================================= */
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Combat Stage (8 cols) */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            {/* Battle Ring Canvas */}
            <div
              className={`relative w-full rounded-3xl p-5 sm:p-6 bg-gradient-to-b ${
                selectedOpponent.bgAtmosphere || 'from-slate-900 via-zinc-900 to-slate-950'
              } text-white shadow-xl overflow-hidden border border-zinc-700/50 min-h-[360px] flex flex-col justify-between`}
            >
              {/* Background Battle FX & Lines */}
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              {/* Turn Counter & Mode Badge */}
              <div className="relative z-10 flex justify-between items-center text-xs font-extrabold text-zinc-300">
                <div className="flex items-center gap-2">
                  <span className="bg-black/40 px-3 py-1 rounded-full border border-white/10 backdrop-blur-xs flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-amber-400" />
                    Turn {turn}
                  </span>
                  <span className="bg-black/40 px-2.5 py-1 rounded-full border border-white/10 text-[10px] font-black uppercase text-amber-300">
                    {selectedOpponent.mode === 'pvp' ? '⚔️ Ranked PvP Duel' : '🏛️ Gym Challenge'}
                  </span>
                </div>

                <span
                  className={`px-3 py-1 rounded-full border text-[11px] font-bold ${
                    isPlayerTurn
                      ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
                      : 'bg-red-500/20 border-red-400/40 text-red-300'
                  }`}
                >
                  {isPlayerTurn
                    ? `Your Turn — Command ${currentPet.name}`
                    : `Enemy Turn — ${selectedOpponent.name} attacking...`}
                </span>
              </div>

              {/* Top: Opponent HUD + Sprite */}
              <div className="relative z-10 flex justify-between items-start pt-2">
                {/* Opponent Info Box */}
                <div className="bg-black/60 backdrop-blur-md rounded-2xl p-3 border border-white/15 max-w-xs w-full shadow-lg">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center gap-1.5 truncate">
                      {selectedOpponent.trainerAvatar && (
                        <img
                          src={selectedOpponent.trainerAvatar}
                          alt="Trainer"
                          className="w-4 h-4 rounded-full bg-white/20 p-0.5 shrink-0"
                        />
                      )}
                      <span className="font-black text-sm text-white truncate">
                        {selectedOpponent.trainerName || selectedOpponent.name}
                      </span>
                    </div>
                    <span className="text-[10px] font-extrabold text-amber-300 shrink-0">
                      Lv. {selectedOpponent.level}
                    </span>
                  </div>
                  {/* Enemy HP Bar */}
                  <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden border border-zinc-600">
                    <div
                      className={`h-full transition-all duration-500 ${
                        enemyHp / enemyMaxHp > 0.5
                          ? 'bg-emerald-500'
                          : enemyHp / enemyMaxHp > 0.2
                          ? 'bg-amber-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, (enemyHp / enemyMaxHp) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 mt-1">
                    <span>HP</span>
                    <span>
                      {enemyHp} / {enemyMaxHp}
                    </span>
                  </div>
                </div>

                {/* Opponent Sprite */}
                <div
                  className={`relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center transition-all duration-300 ${
                    isAttacking === 'enemy' ? '-translate-x-8 scale-110' : ''
                  } ${hitEffect === 'enemy' ? 'animate-bounce brightness-200' : ''}`}
                >
                  <img
                    src={selectedOpponent.avatar}
                    alt={selectedOpponent.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
                  />
                  {hitEffect === 'enemy' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl animate-ping">💥</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom: Player Sprite + HUD */}
              <div className="relative z-10 flex justify-between items-end pb-1">
                {/* Player Sprite */}
                <div
                  className={`relative w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center transition-all duration-300 ${
                    isAttacking === 'player' ? 'translate-x-8 scale-110' : ''
                  } ${hitEffect === 'player' ? 'animate-bounce brightness-200' : ''}`}
                >
                  <img
                    src={currentPet.avatarImage}
                    alt={currentPet.name}
                    className="w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
                  />
                  {hitEffect === 'player' && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl animate-ping">🩸</span>
                    </div>
                  )}
                </div>

                {/* Player Info Box */}
                <div className="bg-black/60 backdrop-blur-md rounded-2xl p-3 border border-white/15 max-w-xs w-full shadow-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-black text-sm text-white">{currentPet.name}</span>
                    <span className="text-[10px] font-extrabold text-emerald-400">
                      Lv. {currentPet.growthLevel}
                    </span>
                  </div>
                  {/* Player HP Bar */}
                  <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden border border-zinc-600 mb-1">
                    <div
                      className={`h-full transition-all duration-500 ${
                        playerHp / playerMaxHp > 0.5
                          ? 'bg-emerald-400'
                          : playerHp / playerMaxHp > 0.2
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                      }`}
                      style={{ width: `${Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100))}%` }}
                    />
                  </div>
                  {/* Player MP Bar */}
                  <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden border border-zinc-700">
                    <div
                      className="h-full bg-blue-400 transition-all duration-500"
                      style={{ width: `${Math.max(0, Math.min(100, (playerMp / playerMaxMp) * 100))}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-bold text-zinc-300 mt-1">
                    <span>
                      HP: {playerHp}/{playerMaxHp}
                    </span>
                    <span className="text-blue-300">
                      MP: {playerMp}/{playerMaxMp}
                    </span>
                    {playerShield > 0 && <span className="text-amber-300">🛡️ {playerShield}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Battle Command Center / Skills Deck */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#bccabb]/40 shadow-xs space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-sm text-[#0d1c2e] flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Commands & Battle Skills
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowItemBag(!showItemBag)}
                    className="flex items-center gap-1 px-3 py-1 rounded-xl bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-all cursor-pointer"
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Battle Items</span>
                  </button>
                </div>
              </div>

              {/* Item Bag Dropdown */}
              {showItemBag && (
                <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200 flex flex-wrap gap-2 text-xs animate-in fade-in duration-150">
                  <button
                    onClick={() => useBattlePotion('potion')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-300 font-bold hover:bg-amber-100 shadow-xs cursor-pointer"
                  >
                    <Droplets className="w-4 h-4 text-blue-500" />
                    <span>Hyper Potion (Cost: 30 Leafs) [+150 HP]</span>
                  </button>
                  <button
                    onClick={() => useBattlePotion('energy_candy')}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-amber-300 font-bold hover:bg-amber-100 shadow-xs cursor-pointer"
                  >
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span>Energy Root (Cost: 50 Leafs) [Full MP]</span>
                  </button>
                </div>
              )}

              {/* Active Skills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {(currentPet.skills && currentPet.skills.length > 0
                  ? currentPet.skills
                  : [
                      {
                        id: 'sk_default_1',
                        name: 'Tackle Strike',
                        element: currentPet.element,
                        type: 'attack' as const,
                        power: 45,
                        mpCost: 10,
                        description: 'A swift, disciplined tackle.',
                        iconName: 'Zap',
                      },
                      {
                        id: 'sk_default_2',
                        name: 'Focus Rest',
                        element: currentPet.element,
                        type: 'heal' as const,
                        power: 50,
                        mpCost: 30,
                        description: 'Takes a deep breath to restore HP and MP.',
                        iconName: 'Heart',
                      },
                    ]
                ).map((skill) => {
                  const elemBadge = ELEMENT_BADGES[skill.element] || ELEMENT_BADGES.normal;
                  const matchup = getElementMultiplier(skill.element, selectedOpponent.element);
                  const canAfford = playerMp >= skill.mpCost;

                  return (
                    <button
                      key={skill.id}
                      disabled={!isPlayerTurn || !canAfford || !!battleResult}
                      onClick={() => handlePlayerSkill(skill)}
                      className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                        canAfford && isPlayerTurn
                          ? 'bg-white border-[#bccabb]/50 hover:border-emerald-500 hover:shadow-sm active:scale-98 cursor-pointer'
                          : 'bg-zinc-50 border-zinc-200 opacity-60 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-sm text-[#0d1c2e]">{skill.name}</span>
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${elemBadge.bg} ${elemBadge.text}`}>
                              {elemBadge.icon} {elemBadge.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#6d7b6d] mt-1 line-clamp-1">{skill.description}</p>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-blue-600 block">{skill.mpCost} MP</span>
                          <span className="text-[10px] font-bold text-amber-600 block">Pwr: {skill.power}</span>
                        </div>
                      </div>

                      {/* Super effective tag preview */}
                      <div className="mt-2 pt-1.5 border-t border-[#bccabb]/20 flex justify-between items-center text-[10px] font-bold">
                        <span className={matchup.color}>{matchup.label}</span>
                        <span className="text-[#6d7b6d] capitalize">{skill.type} move</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Combat Log & Rewards (4 cols) */}
          <div className="lg:col-span-4 flex flex-col space-y-4">
            {/* Victory / Defeat Modal Callout */}
            {battleResult && (
              <div
                className={`p-5 rounded-3xl border shadow-lg animate-in zoom-in-95 duration-200 ${
                  battleResult === 'win'
                    ? 'bg-gradient-to-br from-emerald-50 to-teal-100 border-emerald-300 text-[#005e2d]'
                    : 'bg-gradient-to-br from-red-50 to-rose-100 border-red-300 text-red-900'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  {battleResult === 'win' ? (
                    <Award className="w-7 h-7 text-amber-500 fill-amber-400" />
                  ) : (
                    <X className="w-7 h-7 text-red-600" />
                  )}
                  <h3 className="font-black text-xl">
                    {battleResult === 'win' ? 'VICTORY ACHIEVED!' : 'DEFEAT...'}
                  </h3>
                </div>

                <p className="text-xs font-medium mb-3">
                  {battleResult === 'win'
                    ? `Brilliant tactical execution! Your consistent habit streak and elemental mastery claimed the win!`
                    : `Your Pokémon fainted. Complete daily habits, log workouts, and feed treats to strengthen your battle attributes!`}
                </p>

                {battleResult === 'win' && (
                  <div className="space-y-2 mb-3">
                    {lastBattleFirstClear && selectedOpponent.firstClearReward && (
                      <div className="bg-gradient-to-r from-amber-500/20 via-yellow-400/20 to-emerald-500/20 border border-amber-300 rounded-2xl p-3 text-xs">
                        <div className="flex items-center gap-1.5 font-black text-amber-900 mb-1">
                          <Gift className="w-4 h-4 text-amber-600" />
                          <span>🎉 BONUS HADIAH PERTAMA DIKLAIM!</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-[11px] font-bold text-center mt-1">
                          <div className="bg-white/80 rounded-lg py-1 px-1.5 text-amber-800 border border-amber-200">
                            +{selectedOpponent.firstClearReward.leafs} Leafs
                          </div>
                          <div className="bg-white/80 rounded-lg py-1 px-1.5 text-fuchsia-800 border border-fuchsia-200">
                            +{selectedOpponent.firstClearReward.bp} BP
                          </div>
                          <div className="bg-white/80 rounded-lg py-1 px-1.5 text-emerald-800 border border-emerald-200">
                            +{selectedOpponent.firstClearReward.xp} XP
                          </div>
                        </div>
                        {selectedOpponent.firstClearReward.title && (
                          <p className="text-[10px] font-black text-purple-800 mt-1.5 text-center">
                            🎖️ Gelar Baru: "{selectedOpponent.firstClearReward.title}"
                          </p>
                        )}
                      </div>
                    )}

                    <div className="bg-white/80 rounded-2xl p-3 border border-emerald-200 text-xs font-bold space-y-1.5">
                      {selectedOpponent.mode === 'pvp' && (
                        <div className="flex justify-between text-fuchsia-700">
                          <span>Battle Points (BP) Standard:</span>
                          <span className="font-black">+{selectedOpponent.rewardBp || 25} BP</span>
                        </div>
                      )}
                      {selectedOpponent.mode === 'pvp' && (
                        <div className="flex justify-between text-amber-700">
                          <span>Rating Gained:</span>
                          <span className="font-black">+25 BR Rating</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Leaf Points:</span>
                        <span className="text-amber-600">+{selectedOpponent.rewardLeafs} Leafs</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pet Battle XP:</span>
                        <span className="text-emerald-600">+{selectedOpponent.rewardXp} XP</span>
                      </div>
                      {selectedOpponent.rewardBadge && (
                        <div className="flex justify-between">
                          <span>Gym Badge:</span>
                          <span className="text-purple-600 font-black">🏅 {selectedOpponent.rewardBadge}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => startBattle(selectedOpponent)}
                    className="flex-1 py-2 rounded-xl bg-white border font-bold text-xs shadow-xs hover:bg-zinc-50 cursor-pointer"
                  >
                    Rematch
                  </button>
                  <button
                    onClick={() => setInBattle(false)}
                    className="flex-1 py-2 rounded-xl bg-[#006d36] text-white font-bold text-xs shadow-xs hover:bg-[#005e2d] cursor-pointer"
                  >
                    Exit Arena
                  </button>
                </div>
              </div>
            )}

            {/* Combat Log Box */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#bccabb]/40 shadow-xs flex-1 flex flex-col min-h-[300px]">
              <div className="flex justify-between items-center pb-2 border-b border-[#bccabb]/30 mb-2">
                <span className="font-black text-xs text-[#0d1c2e] uppercase tracking-wider">
                  Battle Commentary
                </span>
                <span className="text-[10px] font-bold text-[#6d7b6d]">Real-time Log</span>
              </div>

              <div
                ref={logContainerRef}
                className="flex-1 space-y-2 overflow-y-auto max-h-[340px] pr-1 text-xs"
              >
                {battleLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-2.5 rounded-xl leading-relaxed ${
                      log.type === 'crit'
                        ? 'bg-amber-50 border border-amber-300 font-extrabold text-amber-900'
                        : log.type === 'player'
                        ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                        : log.type === 'enemy'
                        ? 'bg-red-50 text-red-900 border border-red-200'
                        : log.type === 'heal'
                        ? 'bg-blue-50 text-blue-900 border border-blue-200'
                        : log.type === 'buff'
                        ? 'bg-purple-50 text-purple-900 border border-purple-200'
                        : log.type === 'victory'
                        ? 'bg-yellow-100 font-black text-yellow-950 border border-yellow-300'
                        : 'bg-zinc-50 text-zinc-700'
                    }`}
                  >
                    {log.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Element Weakness Chart Modal */}
      {showElementChart && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#bccabb]/40 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-[#bccabb]/30 mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/15 text-amber-600">
                  <HelpCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-[#0d1c2e]">Elemental Type Matchup Guide</h3>
                  <p className="text-xs text-[#6d7b6d]">
                    Master element strengths to deal 2.0x Super Effective damage!
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowElementChart(false)}
                className="p-1 rounded-full text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              {(Object.keys(ELEMENT_RELATIONS) as PetElement[]).map((elem) => {
                const relation = ELEMENT_RELATIONS[elem];
                const badge = ELEMENT_BADGES[elem];

                return (
                  <div
                    key={elem}
                    className="p-3 rounded-2xl bg-[#f8f9ff] border border-[#bccabb]/30 flex flex-col sm:flex-row justify-between sm:items-center gap-2"
                  >
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${badge.bg} ${badge.text}`}>
                        {badge.icon} {badge.label}
                      </span>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-amber-600 block uppercase">
                          Super Effective (2x) vs:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {relation.superEffectiveAgainst.length > 0 ? (
                            relation.superEffectiveAgainst.map((tgt) => (
                              <span
                                key={tgt}
                                className="text-[11px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded"
                              >
                                {ELEMENT_BADGES[tgt]?.icon} {tgt}
                              </span>
                            ))
                          ) : (
                            <span className="text-[#6d7b6d] text-[11px]">None</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-blue-600 block uppercase">
                          Resisted / Weak (0.5x) vs:
                        </span>
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {relation.weakAgainst.map((tgt) => (
                            <span
                              key={tgt}
                              className="text-[11px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded"
                            >
                              {ELEMENT_BADGES[tgt]?.icon} {tgt}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setShowElementChart(false)}
              className="mt-5 w-full py-3 rounded-2xl bg-[#006d36] text-white font-bold text-sm shadow-md hover:bg-[#005e2d] cursor-pointer"
            >
              Got it, let's battle!
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
