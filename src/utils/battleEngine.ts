import { CompanionPet, BattleOpponent, BattleSkill, PetElement } from '../types';

export interface ElementalRelation {
  superEffectiveAgainst: PetElement[];
  weakAgainst: PetElement[];
  immuneAgainst?: PetElement[];
}

export const ELEMENT_RELATIONS: Record<PetElement, ElementalRelation> = {
  fire: {
    superEffectiveAgainst: ['nature', 'bloom'],
    weakAgainst: ['water', 'earth', 'dragon'],
  },
  water: {
    superEffectiveAgainst: ['fire', 'earth', 'bloom'],
    weakAgainst: ['thunder', 'nature', 'dragon'],
  },
  nature: {
    superEffectiveAgainst: ['water', 'earth'],
    weakAgainst: ['fire', 'shadow', 'dragon'],
  },
  bloom: {
    superEffectiveAgainst: ['water', 'earth', 'fighting'],
    weakAgainst: ['fire', 'shadow', 'dragon'],
  },
  thunder: {
    superEffectiveAgainst: ['water'],
    weakAgainst: ['earth', 'dragon'],
    immuneAgainst: [],
  },
  earth: {
    superEffectiveAgainst: ['fire', 'thunder', 'fighting'],
    weakAgainst: ['nature', 'water', 'bloom'],
  },
  shadow: {
    superEffectiveAgainst: ['psychic', 'ghost', 'starlight'],
    weakAgainst: ['fighting', 'bloom'],
  },
  ghost: {
    superEffectiveAgainst: ['psychic', 'ghost'],
    weakAgainst: ['shadow', 'bloom'],
    immuneAgainst: ['normal', 'fighting'],
  },
  psychic: {
    superEffectiveAgainst: ['fighting', 'nature'],
    weakAgainst: ['shadow', 'ghost'],
  },
  fighting: {
    superEffectiveAgainst: ['normal', 'shadow', 'earth'],
    weakAgainst: ['psychic', 'bloom', 'ghost'],
  },
  dragon: {
    superEffectiveAgainst: ['dragon', 'fire', 'water', 'nature', 'thunder'],
    weakAgainst: ['starlight', 'bloom'],
  },
  starlight: {
    superEffectiveAgainst: ['dragon', 'shadow', 'fighting'],
    weakAgainst: ['fire', 'earth'],
  },
  normal: {
    superEffectiveAgainst: [],
    weakAgainst: ['fighting'],
    immuneAgainst: ['ghost'],
  },
};

export const getElementMultiplier = (attackElement: PetElement, defenseElement: PetElement): { multiplier: number; label: string; color: string } => {
  const relation = ELEMENT_RELATIONS[attackElement];
  if (!relation) {
    return { multiplier: 1.0, label: 'Neutral Effect', color: 'text-gray-500' };
  }

  if (relation.immuneAgainst && relation.immuneAgainst.includes(defenseElement)) {
    return { multiplier: 0.0, label: 'No Effect (Immune)', color: 'text-gray-400' };
  }

  if (relation.superEffectiveAgainst.includes(defenseElement)) {
    return { multiplier: 2.0, label: 'Super Effective! 💥 (x2.0)', color: 'text-amber-600' };
  }

  if (relation.weakAgainst.includes(defenseElement)) {
    return { multiplier: 0.5, label: 'Not Very Effective... 🛡️ (x0.5)', color: 'text-blue-500' };
  }

  return { multiplier: 1.0, label: 'Standard Hit (x1.0)', color: 'text-emerald-600' };
};

export interface DamageCalculationResult {
  damage: number;
  isCrit: boolean;
  elementMultiplier: number;
  elementLabel: string;
  elementColor: string;
  happinessMultiplier: number;
  happinessLabel?: string;
  fullnessMultiplier: number;
  fullnessLabel?: string;
  habitMultiplier: number;
  habitLabel?: string;
  breakdown: string[];
}

export const calculatePlayerAttackDamage = (
  playerPet: CompanionPet,
  opponent: BattleOpponent,
  skill: BattleSkill,
  habitStreakBonus: number = 0
): DamageCalculationResult => {
  const breakdown: string[] = [];
  const baseAtk = playerPet.battleStats?.atk || 45;
  const enemyDef = opponent.stats.def || 35;
  const power = skill.power || 40;

  // 1. Raw Base Damage calculation
  const rawBase = Math.max(12, Math.round(((baseAtk * (power / 30)) / (enemyDef * 0.75 + 15)) * 18));
  breakdown.push(`Base Power (${power}) + Atk (${baseAtk}) vs Def (${enemyDef}) → ${rawBase} DMG`);

  // 2. Happiness (Friendship & Mood) Multiplier
  const happiness = playerPet.happinessPct ?? 80;
  let happinessMultiplier = 1.0;
  let happinessLabel = 'Neutral Mood';

  if (happiness >= 90) {
    happinessMultiplier = 1.35;
    happinessLabel = '💖 Euphoric Bond (+35%)';
    breakdown.push(`High Happiness (${happiness}%): +35% Friendship Surge`);
  } else if (happiness >= 70) {
    happinessMultiplier = 1.15;
    happinessLabel = '😊 Cheerful & Lively (+15%)';
    breakdown.push(`Good Happiness (${happiness}%): +15% Morale Boost`);
  } else if (happiness >= 40) {
    happinessMultiplier = 1.0;
    happinessLabel = '😐 Content (Normal)';
  } else {
    happinessMultiplier = 0.85;
    happinessLabel = '😢 Sad / Unmotivated (-15%)';
    breakdown.push(`Low Happiness (${happiness}%): -15% Mood Penalty`);
  }

  // 3. Hunger / Fullness (Treats Given & Energy) Multiplier
  const fullness = playerPet.treatsGivenPct ?? 60;
  let fullnessMultiplier = 1.0;
  let fullnessLabel = 'Normal Energy';

  if (fullness >= 75) {
    fullnessMultiplier = 1.25;
    fullnessLabel = '🍖 Well-Fed & Energetic (+25%)';
    breakdown.push(`Well-Fed Stamina (${fullness}%): +25% Power`);
  } else if (fullness >= 40) {
    fullnessMultiplier = 1.05;
    fullnessLabel = '🍎 Satisfied Belly (+5%)';
    breakdown.push(`Satisfied Belly (${fullness}%): +5% Power`);
  } else {
    fullnessMultiplier = 0.80;
    fullnessLabel = '🥖 Hungry / Low Stamina (-20%)';
    breakdown.push(`Hungry Belly (${fullness}%): -20% Power`);
  }

  // 4. Habit Streak & Today Routine Sync
  let habitMultiplier = 1.0;
  let habitLabel = 'Routine Sync (1.0x)';
  if (habitStreakBonus > 0) {
    habitMultiplier = Math.min(1.30, 1.0 + habitStreakBonus * 0.05);
    habitLabel = `🔥 Streak Sync (+${Math.round((habitMultiplier - 1) * 100)}%)`;
    breakdown.push(`Habit Streak (${habitStreakBonus}d): +${Math.round((habitMultiplier - 1) * 100)}% Trainer Sync`);
  }

  // 5. Elemental Weakness / Resistance
  const elementResult = getElementMultiplier(skill.element || playerPet.element, opponent.element);
  if (elementResult.multiplier !== 1.0) {
    breakdown.push(`${skill.element.toUpperCase()} vs ${opponent.element.toUpperCase()}: ${elementResult.label}`);
  }

  // 6. Critical Hit roll
  const baseCrit = playerPet.battleStats?.critRate || 10;
  const extraCrit = happiness >= 85 ? 15 : 0;
  const isCrit = Math.random() * 100 < (baseCrit + extraCrit);
  const critMultiplier = isCrit ? 1.75 : 1.0;
  if (isCrit) {
    breakdown.push(`🎯 CRITICAL HIT! 1.75x Damage multiplier!`);
  }

  // Final Total
  const finalDamage = Math.max(
    1,
    Math.round(
      rawBase *
      happinessMultiplier *
      fullnessMultiplier *
      habitMultiplier *
      elementResult.multiplier *
      critMultiplier
    )
  );

  return {
    damage: finalDamage,
    isCrit,
    elementMultiplier: elementResult.multiplier,
    elementLabel: elementResult.label,
    elementColor: elementResult.color,
    happinessMultiplier,
    happinessLabel,
    fullnessMultiplier,
    fullnessLabel,
    habitMultiplier,
    habitLabel,
    breakdown,
  };
};

export const calculateEnemyAttackDamage = (
  opponent: BattleOpponent,
  playerPet: CompanionPet,
  skill: BattleSkill
): DamageCalculationResult => {
  const breakdown: string[] = [];
  const baseAtk = opponent.stats.atk || 40;
  const playerDef = playerPet.battleStats?.def || 35;
  const power = skill.power || 35;

  const rawBase = Math.max(10, Math.round(((baseAtk * (power / 30)) / (playerDef * 0.75 + 15)) * 16));
  breakdown.push(`Enemy ${opponent.name} used ${skill.name} (${power} PWR)`);

  const elementResult = getElementMultiplier(skill.element || opponent.element, playerPet.element);
  const isCrit = Math.random() * 100 < 8; // 8% enemy crit
  const critMultiplier = isCrit ? 1.5 : 1.0;

  const finalDamage = Math.max(
    1,
    Math.round(rawBase * elementResult.multiplier * critMultiplier)
  );

  return {
    damage: finalDamage,
    isCrit,
    elementMultiplier: elementResult.multiplier,
    elementLabel: elementResult.label,
    elementColor: elementResult.color,
    happinessMultiplier: 1,
    fullnessMultiplier: 1,
    habitMultiplier: 1,
    breakdown,
  };
};
