import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AVATAR_PRESETS } from '../../data/initialData';
import { X, Lock, Mail, User, Sparkles, LogIn, UserPlus, Upload, ShieldCheck, Check } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, setIsAuthModalOpen, login, signup } = useApp();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0].url);
  const [customAvatarPreview, setCustomAvatarPreview] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setCustomAvatarPreview(result);
        setSelectedAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (mode === 'login') {
      login(email, password, name, selectedAvatar);
    } else {
      if (!name) return;
      signup(name, email, password, selectedAvatar);
    }
  };

  const handleQuickLogin = (demoName: string, demoEmail: string, demoAvatar: string) => {
    login(demoEmail, 'demo123', demoName, demoAvatar);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d1c2e]/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#ffffff] w-full max-w-md rounded-3xl p-6 sm:p-8 border border-[#bccabb]/40 shadow-2xl space-y-6 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setIsAuthModalOpen(false)}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#f8f9ff] border border-[#bccabb]/30 flex items-center justify-center text-[#6d7b6d] hover:text-[#0d1c2e] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4ade80]/20 text-[#005e2d] rounded-full text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" /> HabitPet Account Portal
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0d1c2e] tracking-tight">
            {mode === 'login' ? 'Sign In to Your Sanctuary' : 'Create Guardian Account'}
          </h2>
          <p className="text-xs sm:text-sm text-[#6d7b6d] font-medium max-w-xs mx-auto">
            {mode === 'login'
              ? 'Access your habit streaks, evolved companions, and cloud sync.'
              : 'Start your journey, adopt spirit companions, and track routines.'}
          </p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 bg-[#f8f9ff] p-1.5 rounded-2xl border border-[#bccabb]/30">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'login'
                ? 'bg-white text-[#006d36] shadow-sm font-extrabold'
                : 'text-[#6d7b6d] hover:text-[#0d1c2e]'
            }`}
          >
            <LogIn className="w-4 h-4" /> Sign In
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'signup'
                ? 'bg-white text-[#006d36] shadow-sm font-extrabold'
                : 'text-[#6d7b6d] hover:text-[#0d1c2e]'
            }`}
          >
            <UserPlus className="w-4 h-4" /> Create Account
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide">
                  Full Name / Display Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#6d7b6d] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Budi Mulyawan"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#f8f9ff] border border-[#bccabb]/40 focus:outline-none focus:ring-2 focus:ring-[#006d36] text-sm font-semibold placeholder:text-[#bccabb]"
                    required
                  />
                </div>
              </div>

              {/* Avatar Selector */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide">
                  Choose or Upload Profile Picture (PP)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#006d36] shadow-md shrink-0 bg-[#eff4ff]">
                    <img
                      src={selectedAvatar}
                      alt="Selected Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <label className="flex-1 py-2.5 px-3 bg-[#eff4ff] hover:bg-[#dce9ff] border border-[#bccabb]/40 rounded-xl cursor-pointer text-xs font-bold text-[#0060ac] flex items-center justify-center gap-2 transition-all">
                    <Upload className="w-4 h-4" /> Upload Custom Photo
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-6 gap-2 pt-1">
                  {AVATAR_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(p.url);
                        setCustomAvatarPreview(null);
                      }}
                      className={`w-full aspect-square rounded-full overflow-hidden border-2 transition-all relative ${
                        selectedAvatar === p.url && !customAvatarPreview
                          ? 'border-[#006d36] ring-2 ring-[#4ade80]/50 scale-105'
                          : 'border-transparent hover:border-[#bccabb]'
                      }`}
                    >
                      <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                      {selectedAvatar === p.url && (
                        <div className="absolute inset-0 bg-[#006d36]/30 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#6d7b6d] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#f8f9ff] border border-[#bccabb]/40 focus:outline-none focus:ring-2 focus:ring-[#006d36] text-sm font-semibold placeholder:text-[#bccabb]"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#6d7b6d] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#f8f9ff] border border-[#bccabb]/40 focus:outline-none focus:ring-2 focus:ring-[#006d36] text-sm font-semibold placeholder:text-[#bccabb]"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-[#006d36] hover:bg-[#005e2d] text-white font-extrabold text-sm sm:text-base shadow-md transition-all bouncy-button border-b-[#004722] flex items-center justify-center gap-2 mt-2"
          >
            <ShieldCheck className="w-5 h-5" />
            {mode === 'login' ? 'Sign In Now' : 'Join HabitPet Sanctuary'}
          </button>
        </form>

        {/* Quick Demo Logins */}
        <div className="pt-2 border-t border-[#bccabb]/20 space-y-2">
          <p className="text-[11px] font-extrabold text-[#6d7b6d] uppercase tracking-wider text-center">
            Quick Switch / Instant Demo
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() =>
                handleQuickLogin(
                  'Budi Mulyawan',
                  'bv5mulyawan@gmail.com',
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
                )
              }
              className="p-2.5 rounded-xl border border-[#bccabb]/30 hover:border-[#4ade80] bg-[#f8f9ff] hover:bg-[#eff4ff] flex items-center gap-2 text-left transition-all"
            >
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
                alt="Budi"
                className="w-7 h-7 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#0d1c2e] truncate">Budi Mulyawan</p>
                <p className="text-[10px] text-[#006d36] font-semibold">Guardian Lvl 5</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() =>
                handleQuickLogin(
                  'Alex Tan',
                  'alex.tan@habits.io',
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80'
                )
              }
              className="p-2.5 rounded-xl border border-[#bccabb]/30 hover:border-[#4ade80] bg-[#f8f9ff] hover:bg-[#eff4ff] flex items-center gap-2 text-left transition-all"
            >
              <img
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80"
                alt="Alex"
                className="w-7 h-7 rounded-full object-cover"
              />
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#0d1c2e] truncate">Alex Tan</p>
                <p className="text-[10px] text-[#0060ac] font-semibold">Guardian Lvl 12</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

