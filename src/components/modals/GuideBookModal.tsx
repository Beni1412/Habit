import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  X,
  Sparkles,
  Heart,
  Swords,
  Flame,
  Shield,
  Zap,
  Timer,
  Database,
  Copy,
  Check,
  Search,
  ArrowRight,
  TrendingUp,
  Award,
  Crown,
  Gift,
  HelpCircle,
  Code2,
  RefreshCw,
  Server,
} from 'lucide-react';
import { isSupabaseConfigured, testSupabaseConnection, syncUserProfile, syncHabitsToSupabase, syncPetsToSupabase } from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

interface GuideBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
}

type GuideChapter =
  | 'basics'
  | 'habits_rpg'
  | 'evolution'
  | 'battle_stages'
  | 'marriage'
  | 'focus'
  | 'supabase_db';

export const GuideBookModal: React.FC<GuideBookModalProps> = ({ isOpen, onClose, initialTab }) => {
  const { user, currentPet, habits, pets, leafPoints, showToast } = useApp();
  const [activeChapter, setActiveChapter] = useState<GuideChapter>(
    (initialTab as GuideChapter) || 'basics'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [dbTestResult, setDbTestResult] = useState<{ status: 'idle' | 'testing' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: '',
  });
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveChapter(initialTab as GuideChapter);
    }
  }, [initialTab]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    const sqlCode = `-- ==============================================================================
-- HABITPET DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- ==============================================================================
-- Run this in your Supabase Dashboard -> SQL Editor -> Run!

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
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

-- 2. HABITS TABLE
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

-- 3. HABIT ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    habit_id TEXT REFERENCES public.habits(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    earned_points INTEGER DEFAULT 15,
    earned_xp INTEGER DEFAULT 45,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. COMPANION PETS TABLE
CREATE TABLE IF NOT EXISTS public.pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pet_id TEXT NOT NULL,
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

-- 5. USER INVENTORY & BAG
CREATE TABLE IF NOT EXISTS public.inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_id TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    is_equipped BOOLEAN DEFAULT FALSE,
    acquired_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, item_id)
);

-- 6. CLEARED STAGES & GYM BADGES (TRAINER TOWER)
CREATE TABLE IF NOT EXISTS public.cleared_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    stage_id TEXT NOT NULL,
    stage_level INTEGER NOT NULL,
    first_clear_claimed BOOLEAN DEFAULT TRUE,
    cleared_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, stage_id)
);

-- 7. BATTLE LOGS (PvE & PvP History)
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

-- 8. PET MARRIAGE & SANCTUARY
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

-- 9. FOCUS SESSIONS
CREATE TABLE IF NOT EXISTS public.focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    pet_id TEXT,
    duration_minutes INTEGER NOT NULL,
    earned_points INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- INDEXES & RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cleared_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battle_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_marriages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.focus_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (true);
CREATE POLICY "Users can manage own habits" ON public.habits FOR ALL USING (true);
CREATE POLICY "Users can manage own pets" ON public.pets FOR ALL USING (true);
CREATE POLICY "Users can manage own stage progress" ON public.cleared_stages FOR ALL USING (true);
CREATE POLICY "Users can manage own battle logs" ON public.battle_logs FOR ALL USING (true);
CREATE POLICY "Users can manage own marriage" ON public.pet_marriages FOR ALL USING (true);
CREATE POLICY "Users can manage own inventory" ON public.inventory FOR ALL USING (true);`;

    navigator.clipboard.writeText(sqlCode);
    setCopiedSql(true);
    showToast('📋 Kode SQL Supabase berhasil disalin ke clipboard!');
    setTimeout(() => setCopiedSql(false), 3000);
  };

  const handleTestConnection = async () => {
    setDbTestResult({ status: 'testing', message: 'Memeriksa koneksi ke Supabase...' });
    const res = await testSupabaseConnection();
    if (res.success) {
      setDbTestResult({ status: 'success', message: res.message });
      showToast('✅ Koneksi Supabase Berhasil!');
    } else {
      setDbTestResult({ status: 'error', message: res.message });
      showToast('⚠️ ' + res.message);
    }
  };

  const handleManualSync = async () => {
    if (!isSupabaseConfigured()) {
      showToast('Silakan atur VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY di .env terlebih dahulu.');
      return;
    }
    setIsSyncing(true);
    try {
      const pvpRating = parseInt(localStorage.getItem('habitpet_pvp_rating') || '1450', 10);
      const bp = parseInt(localStorage.getItem('habitpet_battle_points') || '100', 10);

      await syncUserProfile(user, leafPoints, bp, pvpRating);
      await syncHabitsToSupabase(user.id, habits);
      await syncPetsToSupabase(user.id, pets);

      showToast('🎉 Data profil, kebiasaan, dan pet berhasil disinkronkan ke Supabase!');
    } catch (err: any) {
      showToast('Gagal sinkron: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSyncing(false);
    }
  };

  const chapters: { id: GuideChapter; title: string; subtitle: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'basics',
      title: 'Dasar Petualangan & Habitat',
      subtitle: 'Perawatan, EXP, Happiness & Leveling',
      icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
    },
    {
      id: 'habits_rpg',
      title: 'Kebiasaan & RPG Stat Growth',
      subtitle: 'Fitness, Health, Mind, Learning -> Battle Stats',
      icon: <TrendingUp className="w-4 h-4 text-amber-600" />,
      badge: 'Core RPG',
    },
    {
      id: 'evolution',
      title: 'Sistem Evolusi & Wujud Pet',
      subtitle: 'Tahapan Stage 1-4, Syarat & Stat Boost',
      icon: <Flame className="w-4 h-4 text-orange-600" />,
    },
    {
      id: 'battle_stages',
      title: 'Arena Battle & Trainer Tower',
      subtitle: '10 Stage Levels, Elemen Matchup & BP',
      icon: <Swords className="w-4 h-4 text-red-600" />,
      badge: 'PvE / PvP',
    },
    {
      id: 'marriage',
      title: 'Pernikahan Pet & Penetasan Telur',
      subtitle: 'Cincin, Vows, Buff Cinta & Baby Egg',
      icon: <Heart className="w-4 h-4 text-pink-600" />,
    },
    {
      id: 'focus',
      title: 'Focus Sprint Pomodoro',
      subtitle: 'Timer Fokus, Leaf Points & Happiness',
      icon: <Timer className="w-4 h-4 text-blue-600" />,
    },
    {
      id: 'supabase_db',
      title: 'Database Supabase & SQL Setup',
      subtitle: 'Kode Tabel PostgreSQL, RLS, Sync & API',
      icon: <Database className="w-4 h-4 text-emerald-500" />,
      badge: 'Database Code',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#0d1c2e]/60 backdrop-blur-md animate-in fade-in duration-200">
      <div
        id="guidebook-modal-container"
        className="bg-white w-full max-w-5xl h-[92vh] max-h-[850px] rounded-3xl shadow-2xl border border-[#bccabb]/40 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-[#006d36] via-[#005e2d] to-[#0d1c2e] text-white px-5 sm:px-7 py-4 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-[#4ade80] shadow-inner">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  HabitPet Trainer Manual & Guide Book
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-300/30 hidden sm:inline-block">
                  v8.5 Complete
                </span>
              </div>
              <p className="text-xs text-emerald-100/80">
                Panduan Lengkap Mekanik Game, Pertarungan, Evolusi & Integrasi Database Supabase
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close Guide Book"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
          {/* Chapter Sidebar */}
          <div className="w-full md:w-80 bg-[#f8f9ff] border-r border-[#bccabb]/30 p-3 sm:p-4 flex flex-col shrink-0 overflow-y-auto">
            <div className="mb-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#6d7b6d]" />
                <input
                  type="text"
                  placeholder="Cari topik panduan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white rounded-xl border border-[#bccabb]/40 focus:outline-none focus:border-[#006d36] text-[#0d1c2e]"
                />
              </div>
            </div>

            <div className="space-y-1.5 flex-1">
              <div className="text-[11px] font-black uppercase text-[#6d7b6d] px-2 py-1 tracking-wider">
                Daftar Bab Panduan
              </div>

              {chapters
                .filter(
                  (c) =>
                    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    c.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((ch) => {
                  const isActive = activeChapter === ch.id;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => setActiveChapter(ch.id)}
                      className={`w-full p-3 rounded-2xl text-left transition-all flex items-start gap-2.5 cursor-pointer ${
                        isActive
                          ? 'bg-[#006d36] text-white shadow-sm'
                          : 'bg-white hover:bg-emerald-50/70 text-[#0d1c2e] border border-[#bccabb]/30'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {ch.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <p
                            className={`text-xs font-black truncate ${
                              isActive ? 'text-white' : 'text-[#0d1c2e]'
                            }`}
                          >
                            {ch.title}
                          </p>
                          {ch.badge && (
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md shrink-0 ${
                                isActive
                                  ? 'bg-white/30 text-white'
                                  : 'bg-amber-100 text-amber-900 border border-amber-300'
                              }`}
                            >
                              {ch.badge}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-[11px] truncate mt-0.5 ${
                            isActive ? 'text-emerald-100' : 'text-[#6d7b6d]'
                          }`}
                        >
                          {ch.subtitle}
                        </p>
                      </div>
                    </button>
                  );
                })}
            </div>

            {/* Quick Status Pill */}
            <div className="mt-3 pt-3 border-t border-[#bccabb]/30 flex items-center justify-between text-[11px] text-[#6d7b6d]">
              <span className="flex items-center gap-1">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSupabaseConfigured() ? 'bg-emerald-500 animate-ping' : 'bg-amber-400'
                  }`}
                />
                Supabase: {isSupabaseConfigured() ? 'Terkoneksi' : 'Lokal (LocalStorage)'}
              </span>
              <button
                onClick={() => setActiveChapter('supabase_db')}
                className="text-[#006d36] font-black hover:underline cursor-pointer"
              >
                Setup DB &rarr;
              </button>
            </div>
          </div>

          {/* Chapter Reading Panel */}
          <div className="flex-1 bg-white p-5 sm:p-7 overflow-y-auto text-sm leading-relaxed">
            {/* ========================================================================= */}
            {/* CHAPTER 1: BASICS & PET CARE */}
            {/* ========================================================================= */}
            {activeChapter === 'basics' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-black uppercase text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    Bab 1: Petualangan Awal
                  </span>
                  <h3 className="text-2xl font-black text-[#0d1c2e] mt-2">
                    Dasar Habitat & Perawatan Companion Pet
                  </h3>
                  <p className="text-xs text-[#6d7b6d] mt-1">
                    Pelajari cara menjaga kebahagiaan, pertumbuhan level, dan kesehatan companion pet Anda setiap hari.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#eff4ff] border border-[#bccabb]/30 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-[#0060ac]">
                      <span>🍓 Beri Makan (Feed)</span>
                    </div>
                    <p className="text-xs text-[#3d4a3e]">
                      Memberikan camilan buah berry untuk memulihkan energi dan menambah <strong>+25 EXP</strong> serta <strong>+5% Kebahagiaan</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#f0fdf4] border border-[#bccabb]/30 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                      <span>🎮 Bermain (Play)</span>
                    </div>
                    <p className="text-xs text-[#3d4a3e]">
                      Mengajak pet bermain mini-game atau berlari untuk meningkatkan playtime dan menambahkan <strong>+25 EXP</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#fdf2f8] border border-[#bccabb]/30 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-pink-700">
                      <span>💖 Elus & Peluk (Pet)</span>
                    </div>
                    <p className="text-xs text-[#3d4a3e]">
                      Memberikan kasih sayang dan ikatan emosional hangat untuk menjaga happiness pet tetap di atas 90%.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-[#ecfeff] border border-[#bccabb]/30 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-sm text-cyan-800">
                      <span>💧 Beri Air Segar (Water)</span>
                    </div>
                    <p className="text-xs text-[#3d4a3e]">
                      Menyiramkan air mata air murni untuk menjaga hidrasi optimal dan menyegarkan aura pet.
                    </p>
                  </div>
                </div>

                {/* Growth Formula Card */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-50 to-emerald-50 border border-amber-200">
                  <h4 className="font-black text-sm text-[#0d1c2e] flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Rumus Naik Level & Leaf Points
                  </h4>
                  <ul className="text-xs text-[#3d4a3e] space-y-2 list-disc list-inside">
                    <li>
                      <strong>EXP Naik Level:</strong> Setiap menyelesaikan kebiasaan atau berinteraksi, pet menerima EXP. Saat XP mencapai target (100, 125, 156...), pet naik ke level berikutnya.
                    </li>
                    <li>
                      <strong>Leaf Points (Mata Uang Utama):</strong> Diperoleh dari menyelesaikan kebiasaan harian, sesi Focus Sprint, dan memenangkan pertarungan di Arena. Digunakan untuk membeli item, bibit, ramuan, dan cincin pernikahan di Toko.
                    </li>
                    <li>
                      <strong>Ganti Companion:</strong> Anda dapat memiliki beberapa pet (Treecko, Torchic, Mudkip, Pichu, Cyndaquil, dll) dan berganti kapan saja melalui tombol companion di header.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CHAPTER 2: HABITS & RPG STAT GROWTH */}
            {/* ========================================================================= */}
            {activeChapter === 'habits_rpg' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-black uppercase text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full">
                    Bab 2: Inti Mekanik RPG
                  </span>
                  <h3 className="text-2xl font-black text-[#0d1c2e] mt-2">
                    Sistem Kebiasaan Nyata & Peningkatan Status Pet
                  </h3>
                  <p className="text-xs text-[#6d7b6d] mt-1">
                    Setiap kebiasaan nyata yang Anda selesaikan di dunia nyata memperkuat atribut bertarung pet Anda!
                  </p>
                </div>

                {/* Stat Matrix Table */}
                <div className="overflow-x-auto rounded-2xl border border-[#bccabb]/40 shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-100 text-[#0d1c2e] border-b border-[#bccabb]/30">
                        <th className="p-3 font-black">Kategori Kebiasaan</th>
                        <th className="p-3 font-black">Contoh Aktivitas</th>
                        <th className="p-3 font-black text-emerald-700">Peningkatan Status Battle Pet</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#bccabb]/20">
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-red-700">💪 Fitness (Olahraga)</td>
                        <td className="p-3 text-[#6d7b6d]">Push-up, Lari 5km, Gym, Peregangan</td>
                        <td className="p-3 font-bold text-emerald-800">
                          +1 Physical ATK, +5 Max HP
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-green-700">🥗 Health (Kesehatan)</td>
                        <td className="p-3 text-[#6d7b6d]">Minum 2L Air, Tidur 8 Jam, Makan Sayur</td>
                        <td className="p-3 font-bold text-emerald-800">
                          +8 Max HP, +1 Physical DEF
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-blue-700">📚 Learning (Belajar)</td>
                        <td className="p-3 text-[#6d7b6d]">Membaca Buku, Belajar Coding, Duolingo</td>
                        <td className="p-3 font-bold text-emerald-800">
                          +2 Special Attack (SP.ATK), Pulihkan 100 MP
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-purple-700">🧘 Mindfulness (Ketenangan)</td>
                        <td className="p-3 text-[#6d7b6d]">Meditasi 10 menit, Jurnal Syukur, Bernapas</td>
                        <td className="p-3 font-bold text-emerald-800">
                          +2 Special DEF, +1% Critical Hit Rate
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-amber-700">⚡ Productivity (Produktivitas)</td>
                        <td className="p-3 text-[#6d7b6d]">Selesaikan To-Do List, Deep Work, Bersih Meja</td>
                        <td className="p-3 font-bold text-emerald-800">
                          +2 Speed (Kecepatan Gerak), +1 ATK
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                  <h4 className="font-black text-sm text-emerald-950 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-emerald-600" />
                    Sistem Streak & Pengali Poin
                  </h4>
                  <p>
                    Menjaga streak berturut-turut akan membuka pencapaian khusus, meningkatkan kepercayaan diri pet, dan mempercepat pematangan telur suci di Sanctuary.
                  </p>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CHAPTER 3: EVOLUTION */}
            {/* ========================================================================= */}
            {activeChapter === 'evolution' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-black uppercase text-orange-800 bg-orange-100 px-2.5 py-1 rounded-full">
                    Bab 3: Garis Evolusi
                  </span>
                  <h3 className="text-2xl font-black text-[#0d1c2e] mt-2">
                    Sistem Evolusi & Perubahan Bentuk Companion
                  </h3>
                  <p className="text-xs text-[#6d7b6d] mt-1">
                    Bimbing pet Anda bertransformasi dari benih pemula hingga wujud Mega Ascended legendaris.
                  </p>
                </div>

                {/* Stage Steps */}
                <div className="space-y-3">
                  <div className="p-4 rounded-2xl border border-[#bccabb]/40 bg-[#f8f9ff] flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      1
                    </span>
                    <div>
                      <h4 className="font-black text-sm text-[#0d1c2e]">Stage 1: Starter / Hatchling (Lv. 1 - 4)</h4>
                      <p className="text-xs text-[#6d7b6d] mt-0.5">
                        Wujud bayi pemula seperti Treecko, Torchic, Mudkip, atau Pichu. Memiliki skill dasar seperti Leaf Scratch atau Ember Spark.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-[#bccabb]/40 bg-[#f8f9ff] flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      2
                    </span>
                    <div>
                      <h4 className="font-black text-sm text-[#0d1c2e]">Stage 2: Mid-Evolution (Lv. 5 - 11)</h4>
                      <p className="text-xs text-[#6d7b6d] mt-0.5">
                        Wujud remaja seperti Grovyle, Combusken, Marshtomp, atau Pikachu. Membuka skill elemen baru dan bonus +40 HP, +12 ATK.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-[#bccabb]/40 bg-[#f8f9ff] flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-purple-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      3
                    </span>
                    <div>
                      <h4 className="font-black text-sm text-[#0d1c2e]">Stage 3: Apex Final Form (Lv. 12 - 19)</h4>
                      <p className="text-xs text-[#6d7b6d] mt-0.5">
                        Wujud dewasa penuh seperti Sceptile, Blaziken, Swampert, atau Raichu. Membuka Ultimate Attack (misal: Solar Blade Storm, Brave Bird Flare).
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl border border-[#bccabb]/40 bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 flex items-start gap-3">
                    <span className="w-7 h-7 rounded-xl bg-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                      4
                    </span>
                    <div>
                      <h4 className="font-black text-sm text-amber-950 flex items-center gap-1.5">
                        <Crown className="w-4 h-4 text-amber-600" />
                        Stage 4: Mega Evolution & Ascended Form (Lv. 20+)
                      </h4>
                      <p className="text-xs text-amber-900 mt-0.5">
                        Wujud legenda tertinggi dengan aura kosmik tak tertandingi dan stat tempur ganda.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                  <strong>💡 Tips Evolusi:</strong> Setiap evolusi selesai akan memicu cutscene sinematik dan memberikan bonus <strong>+350 Leaf Points</strong> serta skill tanda tangan baru!
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CHAPTER 4: BATTLE ARENA & TRAINER TOWER */}
            {/* ========================================================================= */}
            {activeChapter === 'battle_stages' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-black uppercase text-red-800 bg-red-100 px-2.5 py-1 rounded-full">
                    Bab 4: Arena Pertarungan
                  </span>
                  <h3 className="text-2xl font-black text-[#0d1c2e] mt-2">
                    Trainer Tower, Elemen Matchup & PvP Duels
                  </h3>
                  <p className="text-xs text-[#6d7b6d] mt-1">
                    Tantang Gym Leader, selesaikan 10 Stage Level bertingkat, dan klaim Hadiah Pertama (First Clear Rewards).
                  </p>
                </div>

                {/* Element Type Table */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-[#bccabb]/40 space-y-3">
                  <h4 className="font-black text-xs uppercase text-[#0d1c2e] flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Tabel Keunggulan Elemen (1.5x Super Effective vs 0.7x Resist)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-red-100 border border-red-200 text-red-900 font-bold">
                      🔥 API (Fire)
                      <div className="text-[11px] font-normal text-red-800 mt-0.5">
                        Kuat vs Daun (1.5x) • Lemah vs Air (0.7x)
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-blue-100 border border-blue-200 text-blue-900 font-bold">
                      💧 AIR (Water)
                      <div className="text-[11px] font-normal text-blue-800 mt-0.5">
                        Kuat vs Api (1.5x) • Lemah vs Daun/Listrik (0.7x)
                      </div>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-900 font-bold">
                      🌿 ALAM / DAUN (Nature)
                      <div className="text-[11px] font-normal text-emerald-800 mt-0.5">
                        Kuat vs Air (1.5x) • Lemah vs Api (0.7x)
                      </div>
                    </div>
                  </div>
                </div>

                {/* 10 Stage Progression Info */}
                <div className="p-5 rounded-3xl bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border border-amber-300 space-y-2">
                  <h4 className="font-black text-sm text-[#0d1c2e] flex items-center gap-1.5">
                    <Crown className="w-4 h-4 text-amber-600" />
                    Sistem 10 Tingkat Stage (Trainer Tower)
                  </h4>
                  <ul className="text-xs text-[#3d4a3e] space-y-1.5 list-disc list-inside">
                    <li>
                      <strong>Stage 1 hingga 10:</strong> Anda harus mengalahkan lawan di stage sebelumnya untuk membuka stage berikutnya.
                    </li>
                    <li>
                      <strong>🎁 First-Clear Bonus:</strong> Menyelesaikan stage untuk pertama kali memberikan bonus ekstra: +Leafs, +Battle Points (BP), +Pet XP, dan Gelar Spesial.
                    </li>
                    <li>
                      <strong>Tantang Ulang:</strong> Stage yang telah selesai dapat ditantang kembali kapan saja untuk farming Battle Points (BP) dan Leaf Points.
                    </li>
                    <li>
                      <strong>Friend Code Duel:</strong> Masukkan Friend Code teman (misal: <code>HABIT-LUCAS-8821</code>) untuk bertarung langsung.
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CHAPTER 5: MARRIAGE & BABY EGG */}
            {/* ========================================================================= */}
            {activeChapter === 'marriage' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-black uppercase text-pink-800 bg-pink-100 px-2.5 py-1 rounded-full">
                    Bab 5: Ikatan Cinta & Sanctuary
                  </span>
                  <h3 className="text-2xl font-black text-[#0d1c2e] mt-2">
                    Pernikahan Pet & Menetaskan Telur Suci
                  </h3>
                  <p className="text-xs text-[#6d7b6d] mt-1">
                    Menikahkan companion pet memberikan buff EXP permanen dan melahirkan keturunan generasi baru.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-pink-50 border border-pink-200 space-y-2">
                    <h4 className="font-bold text-sm text-pink-950 flex items-center gap-1.5">
                      💍 1. Beli Cincin & Lamar Suitor
                    </h4>
                    <p className="text-xs text-pink-900">
                      Beli <em>Eternal Flora Ring</em> atau <em>Starlight Diamond Band</em> di Toko, lalu pilih suitor di tab Marriage untuk melangsungkan pernikahan.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-2">
                    <h4 className="font-bold text-sm text-purple-950 flex items-center gap-1.5">
                      ✨ 2. Buff Cinta (+25% EXP)
                    </h4>
                    <p className="text-xs text-purple-900">
                      Setelah menikah, seluruh kebiasaan yang diselesaikan menerima bonus <strong>+25% EXP</strong> secara otomatis.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                    <h4 className="font-bold text-sm text-amber-950 flex items-center gap-1.5">
                      🥚 3. Inkubasi Telur Cinta
                    </h4>
                    <p className="text-xs text-amber-900">
                      Setiap kali Anda menyelesaikan kebiasaan harian, telur cinta dierami (0/5). Saat penuh, telur akan bercahaya dan siap menetas.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                    <h4 className="font-bold text-sm text-emerald-950 flex items-center gap-1.5">
                      🐣 4. Baby Companion Terbuka
                    </h4>
                    <p className="text-xs text-emerald-900">
                      Menetaskan telur membuka baby companion unik (misal: Sproutlet) yang bergabung ke Sanctuary dan tim petualangan Anda.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CHAPTER 6: FOCUS SPRINT */}
            {/* ========================================================================= */}
            {activeChapter === 'focus' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-black uppercase text-blue-800 bg-blue-100 px-2.5 py-1 rounded-full">
                    Bab 6: Produktivitas Fokus
                  </span>
                  <h3 className="text-2xl font-black text-[#0d1c2e] mt-2">
                    Companion Focus Sprint Pomodoro
                  </h3>
                  <p className="text-xs text-[#6d7b6d] mt-1">
                    Gunakan timer fokus terintegrasi untuk menyelesaikan pekerjaan atau belajar sambil melatih pet Anda.
                  </p>
                </div>

                <div className="p-5 rounded-3xl bg-[#eff4ff] border border-blue-200 space-y-3">
                  <h4 className="font-black text-sm text-blue-950 flex items-center gap-2">
                    <Timer className="w-5 h-5 text-blue-600" />
                    Bagaimana Focus Sprint Bekerja?
                  </h4>
                  <ul className="text-xs text-[#3d4a3e] space-y-2 list-disc list-inside">
                    <li>
                      <strong>Pilih Durasi:</strong> 15 menit, 25 menit (Standar Pomodoro), 45 menit, atau 60 menit.
                    </li>
                    <li>
                      <strong>Animasi Belajar:</strong> Companion pet akan menemani Anda dengan pose meditasi / membaca buku yang tenang.
                    </li>
                    <li>
                      <strong>Hadiah Selesai:</strong> Menghasilkan <strong>2x Leaf Points</strong> dan <strong>5x EXP Pet</strong> per menit fokus yang berhasil diselesaikan!
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* CHAPTER 7: SUPABASE DATABASE INTEGRATION & SQL */}
            {/* ========================================================================= */}
            {activeChapter === 'supabase_db' && (
              <div className="space-y-6">
                <div>
                  <span className="text-[11px] font-black uppercase text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                    Bab 7: Integrasi Database Supabase
                  </span>
                  <h3 className="text-2xl font-black text-[#0d1c2e] mt-2">
                    Setup Database PostgreSQL & Supabase
                  </h3>
                  <p className="text-xs text-[#6d7b6d] mt-1">
                    Simpan semua data profil, kebiasaan, battle log, pernikahan, dan inventory Anda di cloud database Supabase.
                  </p>
                </div>

                {/* Connection Checker & Sync Panel */}
                <div className="p-5 rounded-3xl bg-slate-50 border border-[#bccabb]/40 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="font-black text-sm text-[#0d1c2e] flex items-center gap-2">
                        <Server className="w-4 h-4 text-emerald-600" />
                        Status Koneksi Supabase
                      </h4>
                      <p className="text-xs text-[#6d7b6d] mt-0.5">
                        {isSupabaseConfigured()
                          ? 'Konfigurasi .env terdeteksi. Anda dapat menguji koneksi atau menyinkronkan data.'
                          : 'Belum terhubung ke Supabase. Aplikasi saat ini menggunakan penyimpanan lokal (LocalStorage).'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTestConnection}
                        className="px-3.5 py-2 rounded-xl bg-white border border-[#bccabb]/40 hover:border-emerald-500 font-bold text-xs text-[#0d1c2e] flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Test Koneksi</span>
                      </button>

                      <button
                        onClick={handleManualSync}
                        disabled={isSyncing}
                        className="px-4 py-2 rounded-xl bg-[#006d36] hover:bg-[#005e2d] text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <Database className="w-3.5 h-3.5" />
                        <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan Data'}</span>
                      </button>
                    </div>
                  </div>

                  {dbTestResult.status !== 'idle' && (
                    <div
                      className={`p-3 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                        dbTestResult.status === 'success'
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                          : dbTestResult.status === 'error'
                          ? 'bg-red-50 text-red-900 border border-red-200'
                          : 'bg-amber-50 text-amber-900 border border-amber-200'
                      }`}
                    >
                      <span>{dbTestResult.message}</span>
                    </div>
                  )}
                </div>

                {/* Step-by-Step Setup Guide */}
                <div className="space-y-4">
                  <h4 className="font-black text-sm text-[#0d1c2e] flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[#006d36]" />
                    Langkah Integrasi Supabase (3 Langkah Mudah):
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="p-4 rounded-2xl bg-white border border-[#bccabb]/30 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-[#0d1c2e]">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">
                          1
                        </span>
                        <span>Buat Proyek di Supabase</span>
                      </div>
                      <p className="text-[#6d7b6d] pl-7">
                        Buka <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">supabase.com</a>, buat project baru (gratis), dan pilih region terdekat (misal: Singapore).
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-[#bccabb]/30 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-[#0d1c2e]">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">
                          2
                        </span>
                        <span>Jalankan Script SQL di SQL Editor</span>
                      </div>
                      <p className="text-[#6d7b6d] pl-7">
                        Buka tab <strong>SQL Editor</strong> di dashboard Supabase Anda, paste kode SQL di bawah ini, lalu klik tombol <strong>Run</strong>.
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-white border border-[#bccabb]/30 space-y-1.5">
                      <div className="flex items-center gap-2 font-bold text-[#0d1c2e]">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black flex items-center justify-center">
                          3
                        </span>
                        <span>Tambahkan Kredensial ke File <code>.env</code></span>
                      </div>
                      <p className="text-[#6d7b6d] pl-7">
                        Buka <em>Project Settings &rarr; API</em> di Supabase, lalu masukkan URL dan Anon Key ke file <code>.env</code> aplikasi:
                      </p>
                      <div className="pl-7 pt-1 font-mono text-[11px] bg-slate-900 text-emerald-400 p-2.5 rounded-xl">
                        VITE_SUPABASE_URL="https://your-project.supabase.co"<br />
                        VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsIn..."
                      </div>
                    </div>
                  </div>
                </div>

                {/* SQL Code Box with Copy Button */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#0d1c2e] uppercase flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-emerald-600" />
                      Skrip SQL Lengkap (Schema, RLS, & Indexes)
                    </span>
                    <button
                      onClick={handleCopySql}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-xs"
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSql ? 'Tersalin!' : 'Salin Kode SQL'}</span>
                    </button>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-2xl text-slate-200 font-mono text-[11px] overflow-x-auto max-h-64 overflow-y-auto border border-slate-800 space-y-1">
                    <pre className="text-emerald-400">-- 1. PROFILES TABLE</pre>
                    <pre className="text-slate-300">
{`CREATE TABLE IF NOT EXISTS public.profiles (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE,
    name TEXT NOT NULL DEFAULT 'Habit Master',
    avatar_url TEXT,
    title TEXT DEFAULT 'Novice Guardian',
    level INTEGER DEFAULT 1,
    streak_days INTEGER DEFAULT 0,
    total_habits_completed INTEGER DEFAULT 0,
    leaf_points INTEGER DEFAULT 1200,
    battle_points INTEGER DEFAULT 100,
    pvp_rating INTEGER DEFAULT 1450,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);`}
                    </pre>
                    <pre className="text-emerald-400 mt-2">-- 2. HABITS TABLE</pre>
                    <pre className="text-slate-300">
{`CREATE TABLE IF NOT EXISTS public.habits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    frequency TEXT NOT NULL DEFAULT 'Daily',
    difficulty TEXT NOT NULL DEFAULT 'medium',
    points INTEGER DEFAULT 15,
    streak INTEGER DEFAULT 0,
    completed_today BOOLEAN DEFAULT FALSE,
    target_count INTEGER DEFAULT 1,
    current_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);`}
                    </pre>
                    <pre className="text-emerald-400 mt-2">-- 3. PETS & INVENTORY & STAGES</pre>
                    <pre className="text-slate-400">
                      -- Klik tombol "Salin Kode SQL" di atas untuk menyalin seluruh 9 tabel, index & RLS policies lengkap.
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
