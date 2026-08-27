// Inisialisasi koneksi ke database Supabase menggunakan environment variable.
// Berisi fungsi-fungsi untuk sinkronisasi data: profil user, habit, pet, battle log, dan leaderboard PvP.

import { Habit, CompanionPet, UserProfile, BattleOpponent } from '../types';
import { createClient } from '@supabase/supabase-js';

// Retrieve environment variables for Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('https://') &&
    supabaseUrl.includes('supabase.co') &&
    supabaseAnonKey !== 'your-anon-public-key'
  );
};

// Lazy initialization or safe fallback client
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

/**
 * Test the active connection to Supabase database
 */
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string; data?: any }> {
  if (!isSupabaseConfigured() || !supabase) {
    return {
      success: false,
      message: 'Supabase credentials belum dikonfigurasi di file .env (VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY).',
    };
  }

  try {
    const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
    if (error) {
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'Terhubung ke Supabase, namun tabel belum dibuat. Silakan jalankan script SQL Schema di SQL Editor Supabase Anda.',
        };
      }
      return { success: false, message: `Error koneksi: ${error.message}` };
    }
    return {
      success: true,
      message: 'Berhasil terhubung ke database Supabase!',
      data,
    };
  } catch (err: any) {
    return { success: false, message: `Koneksi gagal: ${err.message || 'Unknown network error'}` };
  }
}

/**
 * Sync user profile to Supabase
 */
export async function syncUserProfile(user: UserProfile, leafPoints: number, battlePoints: number, pvpRating: number) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      name: user.name,
      avatar_url: user.avatarUrl,
      title: user.title,
      bio: user.bio,
      level: user.level,
      streak_days: user.streakDays,
      total_habits_completed: user.totalHabitsCompleted,
      leaf_points: leafPoints,
      battle_points: battlePoints,
      pvp_rating: pvpRating,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Supabase syncUserProfile error:', err);
    return null;
  }
}

/**
 * Sync Habits to Supabase
 */
export async function syncHabitsToSupabase(userId: string, habits: Habit[]) {
  if (!supabase) return null;
  try {
    const rows = habits.map((h) => ({
      id: h.id,
      user_id: userId,
      name: h.name,
      category: h.category,
      frequency: h.frequency,
      difficulty: h.difficulty,
      points: h.points,
      streak: h.streak,
      completed_today: h.completedToday,
      target_count: h.targetCount || 1,
      current_count: h.currentCount || 0,
      unit: h.unit || 'times',
      time_of_day: h.timeOfDay || 'anytime',
      description: h.description || '',
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase.from('habits').upsert(rows);
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Supabase syncHabits error:', err);
    return null;
  }
}

/**
 * Log a completed habit entry
 */
export async function logHabitCompletion(userId: string, habitId: string, earnedPoints: number, earnedXp: number) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.from('habit_logs').insert({
      user_id: userId,
      habit_id: habitId,
      earned_points: earnedPoints,
      earned_xp: earnedXp,
      completed_at: new Date().toISOString(),
    });
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Supabase logHabitCompletion error:', err);
    return null;
  }
}

/**
 * Sync Companion Pets to Supabase
 */
export async function syncPetsToSupabase(userId: string, pets: Record<string, CompanionPet>) {
  if (!supabase) return null;
  try {
    const rows = Object.entries(pets).map(([petId, pet]) => ({
      user_id: userId,
      pet_id: petId,
      name: pet.name,
      element: pet.element,
      evolution_stage: pet.evolutionStage || 1,
      growth_level: pet.growthLevel || 1,
      current_xp: pet.currentXp || 0,
      max_xp: pet.maxXp || 100,
      happiness_pct: pet.happinessPct || 100,
      stats: pet.battleStats || {},
      skills: pet.skills || [],
      is_unlocked: pet.isUnlocked ?? true,
      equipped_items: pet.equippedItems || [],
      updated_at: new Date().toISOString(),
    }));

    const { data, error } = await supabase.from('pets').upsert(rows, { onConflict: 'user_id, pet_id' });
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('Supabase syncPets error:', err);
    return null;
  }
}

/**
 * Record Stage / PvP Battle Outcome
 */
export async function recordBattleInSupabase(
  userId: string,
  opponent: BattleOpponent,
  result: 'win' | 'lose',
  rewardBp: number,
  rewardLeafs: number,
  isFirstClear: boolean
) {
  if (!supabase) return null;
  try {
    // Record Battle history
    const { error: battleErr } = await supabase.from('battle_logs').insert({
      user_id: userId,
      opponent_id: opponent.id,
      opponent_name: opponent.name,
      battle_mode: opponent.mode || 'gym',
      stage_level: opponent.stageLevel || null,
      result,
      earned_bp: rewardBp,
      earned_leafs: rewardLeafs,
      created_at: new Date().toISOString(),
    });

    if (battleErr) throw battleErr;

    // If first clear of a stage, mark stage as cleared
    if (result === 'win' && opponent.stageLevel) {
      await supabase.from('cleared_stages').upsert({
        user_id: userId,
        stage_id: opponent.id,
        stage_level: opponent.stageLevel,
        first_clear_claimed: isFirstClear,
        cleared_at: new Date().toISOString(),
      }, { onConflict: 'user_id, stage_id' });
    }

    return true;
  } catch (err) {
    console.warn('Supabase recordBattle error:', err);
    return null;
  }
}

/**
 * Fetch Global PvP Leaderboard from Supabase
 */
export async function fetchSupabaseLeaderboard(limit = 10) {
  if (!supabase) return [];
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, avatar_url, title, level, pvp_rating, battle_points')
      .order('pvp_rating', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Supabase fetchLeaderboard error:', err);
    return [];
  }
}

/**
 * Fetch Full User Data on Login
 */
export async function fetchUserData(email: string) {
  if (!supabase) return null;
  try {
    // 1. Fetch Profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();

    if (!profile) return null; // New user

    // 2. Fetch Habits
    const { data: habits } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', profile.id);

    // 3. Fetch Pets
    const { data: pets } = await supabase
      .from('pets')
      .select('*')
      .eq('user_id', profile.id);

    return { profile, habits, pets };
  } catch (err) {
    console.warn('Supabase fetchUserData error:', err);
    return null;
  }
}
