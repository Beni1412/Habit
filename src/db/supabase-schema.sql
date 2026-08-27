-- ==============================================================================
-- HABITPET DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- ==============================================================================
-- Pet Habits, RPG Progression, Gym & Stage Battles, Marriage, and PvP System
-- Run this SQL in your Supabase Project -> SQL Editor -> Run.
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY, -- Supports Supabase Auth UUID or custom usr-id
    email TEXT UNIQUE,
    name TEXT NOT NULL DEFAULT 'Habit Master',
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    title TEXT DEFAULT 'Novice Guardian',
    bio TEXT DEFAULT 'Building good habits step by step!',
    level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    total_habits_completed INTEGER DEFAULT 0,
    leaf_points INTEGER DEFAULT 1200,
    battle_points INTEGER DEFAULT 100,
    pvp_rating INTEGER DEFAULT 1450,
    pvp_wins INTEGER DEFAULT 0,
    pvp_losses INTEGER DEFAULT 0,
    theme_preference TEXT DEFAULT 'emerald',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. HABITS TABLE
CREATE TABLE IF NOT EXISTS public.habits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Health', 'Mindfulness', 'Fitness', 'Learning', 'Productivity')),
    frequency TEXT NOT NULL DEFAULT 'Daily',
    difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    points INTEGER DEFAULT 15,
    streak INTEGER DEFAULT 0,
    completed_today BOOLEAN DEFAULT FALSE,
    target_count INTEGER DEFAULT 1,
    current_count INTEGER DEFAULT 0,
    unit TEXT DEFAULT 'times',
    time_of_day TEXT DEFAULT 'anytime',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. HABIT ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id TEXT REFERENCES public.habits(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    earned_points INTEGER DEFAULT 15,
    earned_xp INTEGER DEFAULT 45,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. COMPANION PETS TABLE
CREATE TABLE IF NOT EXISTS public.pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pet_id TEXT NOT NULL, -- e.g. sprout, ember, bubbles, lumi, etc.
    name TEXT NOT NULL,
    element TEXT NOT NULL,
    evolution_stage INTEGER DEFAULT 1,
    growth_level INTEGER DEFAULT 1,
    current_xp INTEGER DEFAULT 0,
    max_xp INTEGER DEFAULT 100,
    happiness_pct INTEGER DEFAULT 100,
    stats JSONB DEFAULT '{"hp": 320, "maxHp": 320, "mp": 100, "maxMp": 100, "atk": 45, "def": 42, "spAtk": 40, "spd": 44, "critRate": 10}'::jsonb,
    skills JSONB DEFAULT '[]'::jsonb,
    is_unlocked BOOLEAN DEFAULT TRUE,
    equipped_items TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, pet_id)
);

-- 6. USER INVENTORY & BAG
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    is_equipped BOOLEAN DEFAULT FALSE,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, item_id)
);

-- 7. CLEARED STAGES & GYM BADGES (TRAINER TOWER)
CREATE TABLE IF NOT EXISTS public.cleared_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stage_id TEXT NOT NULL,
    stage_level INTEGER NOT NULL,
    first_clear_claimed BOOLEAN DEFAULT TRUE,
    cleared_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, stage_id)
);

-- 8. BATTLE LOGS (PvE & PvP History)
CREATE TABLE IF NOT EXISTS public.battle_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    opponent_id TEXT NOT NULL,
    opponent_name TEXT NOT NULL,
    battle_mode TEXT DEFAULT 'gym',
    stage_level INTEGER,
    result TEXT NOT NULL CHECK (result IN ('win', 'lose')),
    earned_bp INTEGER DEFAULT 0,
    earned_leafs INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. PET MARRIAGE & SANCTUARY
CREATE TABLE IF NOT EXISTS public.pet_marriages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    is_married BOOLEAN DEFAULT TRUE,
    partner_pet_name TEXT NOT NULL,
    partner_owner_name TEXT NOT NULL,
    ring_type TEXT DEFAULT 'Eternal Flora Ring',
    ring_bonus TEXT DEFAULT '+25% Habit XP Multiplier & Romantic Aura',
    love_bond_level INTEGER DEFAULT 1,
    love_exp INTEGER DEFAULT 100,
    max_love_exp INTEGER DEFAULT 500,
    love_buff_active BOOLEAN DEFAULT TRUE,
    wedding_vows TEXT,
    baby_egg JSONB DEFAULT '{"hasEgg": true, "eggName": "Sacred Love Egg", "incubationProgress": 0, "maxProgress": 5, "isHatched": false}'::jsonb,
    love_notes JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. FOCUS SESSIONS (Pomodoro Sprint History)
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pet_id TEXT,
    duration_minutes INTEGER NOT NULL,
    earned_points INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR FAST QUERYING
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON public.habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_pets_user_id ON public.pets(user_id);
CREATE INDEX IF NOT EXISTS idx_cleared_stages_user_id ON public.cleared_stages(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_pvp_rating ON public.profiles(pvp_rating DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleared_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_marriages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to Profiles (for leaderboard & friend codes)
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (true);

-- Allow authenticated users / matching IDs to update their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (true);

-- Habits RLS
CREATE POLICY "Users can view own habits" ON public.habits
    FOR SELECT USING (true);

CREATE POLICY "Users can manage own habits" ON public.habits
    FOR ALL USING (true);

-- Pets RLS
CREATE POLICY "Users can manage own pets" ON public.pets
    FOR ALL USING (true);

-- Cleared Stages & Battle logs RLS
CREATE POLICY "Users can manage own stage progress" ON public.cleared_stages
    FOR ALL USING (true);

CREATE POLICY "Users can manage own battle logs" ON public.battle_logs
    FOR ALL USING (true);

-- Marriage & Inventory RLS
CREATE POLICY "Users can manage own marriage" ON public.pet_marriages
    FOR ALL USING (true);

CREATE POLICY "Users can manage own inventory" ON public.inventory
    FOR ALL USING (true);

-- ==============================================================================
-- AUTOMATIC PROFILE TRIGGER (ON SUPABASE AUTH SIGNUP)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, avatar_url, leaf_points, battle_points, pvp_rating)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'),
        1200,
        100,
        1450
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger execution
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- SEED SAMPLE COMMUNITY TRAINERS FOR LEADERBOARD
-- ==============================================================================
INSERT INTO public.profiles (id, email, name, avatar_url, title, level, pvp_rating, battle_points, total_habits_completed)
VALUES
    ('trainer-ash', 'ash@kanto.org', 'Ash Ketchum', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/red.png', 'World Monarch Champion', 50, 2450, 1200, 320),
    ('trainer-cynthia', 'cynthia@sinnoh.org', 'Cynthia', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/cynthia.png', 'Sinnoh League Champion', 48, 2380, 1150, 290),
    ('trainer-steven', 'steven@hoenn.org', 'Steven Stone', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/steven.png', 'Hoenn Champion & Miner', 45, 2290, 980, 240),
    ('trainer-lucas', 'lucas@habitpet.app', 'Lucas & Blaziken', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/lucas.png', 'Habit Striker Master', 38, 2050, 840, 180),
    ('trainer-maya', 'maya@habitpet.app', 'Maya Bloom', 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/trainers/dawn.png', 'Serene Flora Master', 34, 1890, 620, 150)
ON CONFLICT (id) DO NOTHING;

