import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AVATAR_PRESETS } from '../../data/initialData';
import {
  X,
  Camera,
  Upload,
  User,
  Mail,
  Award,
  Sparkles,
  Flame,
  CheckCircle,
  LogOut,
  Edit3,
  Save,
  Shield,
  Check,
} from 'lucide-react';

export const ProfileModal: React.FC = () => {
  const {
    user,
    updateProfile,
    uploadAvatar,
    logout,
    isProfileModalOpen,
    setIsProfileModalOpen,
    setIsAuthModalOpen,
    leafPoints,
    habits,
  } = useApp();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [title, setTitle] = useState(user.title);
  const [bio, setBio] = useState(user.bio);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [showAvatarPresets, setShowAvatarPresets] = useState(false);

  if (!isProfileModalOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        uploadAvatar(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      email,
      title,
      bio,
    });
    setIsEditingInfo(false);
  };

  const completedTodayCount = habits.filter((h) => h.completedToday).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d1c2e]/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#ffffff] w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-[#bccabb]/40 shadow-2xl space-y-6 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setIsProfileModalOpen(false)}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#f8f9ff] border border-[#bccabb]/30 flex items-center justify-center text-[#6d7b6d] hover:text-[#0d1c2e] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header & PP Upload Area */}
        <div className="text-center space-y-3 pt-2">
          {/* Profile Picture Frame */}
          <div className="relative inline-block mx-auto group">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-4 border-[#006d36] shadow-xl bg-[#eff4ff] ring-4 ring-[#4ade80]/30">
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
            </div>

            {/* Custom Photo Upload Button */}
            <label
              htmlFor="pp-upload-input"
              className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-[#006d36] text-white flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:bg-[#005e2d] hover:scale-110 active:scale-95 transition-all"
              title="Ganti Foto Profil (Upload PP)"
            >
              <Camera className="w-4 h-4" />
              <input
                id="pp-upload-input"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <h2 className="text-2xl font-black text-[#0d1c2e] tracking-tight">{user.name}</h2>
              <span className="px-2.5 py-0.5 bg-[#4ade80]/20 text-[#005e2d] rounded-full text-xs font-bold border border-[#4ade80]/30">
                Lvl {user.level}
              </span>
            </div>
            <p className="text-xs font-bold text-[#0060ac] mt-0.5 flex items-center justify-center gap-1">
              <Shield className="w-3.5 h-3.5" /> {user.title}
            </p>
            <p className="text-xs text-[#6d7b6d] max-w-sm mx-auto mt-1 italic">
              "{user.bio || 'Consistent habits shape an unstoppable destiny.'}"
            </p>
          </div>

          {/* Avatar Quick Switch Trigger */}
          <div className="flex justify-center gap-2 pt-1">
            <label
              htmlFor="pp-upload-input"
              className="px-3 py-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0060ac] rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all"
            >
              <Upload className="w-3.5 h-3.5" /> Upload Foto Baru
            </label>
            <button
              onClick={() => setShowAvatarPresets(!showAvatarPresets)}
              className="px-3 py-1.5 bg-[#f8f9ff] hover:bg-[#eff4ff] border border-[#bccabb]/30 text-[#3d4a3e] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#f6bb1f]" /> Pilih Avatar Preset
            </button>
          </div>

          {/* Avatar Presets Drawer */}
          {showAvatarPresets && (
            <div className="p-3 bg-[#f8f9ff] rounded-2xl border border-[#bccabb]/30 animate-in fade-in duration-150">
              <p className="text-[11px] font-bold text-[#6d7b6d] uppercase mb-2">
                Pilih Dari Koleksi HD Avatar
              </p>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_PRESETS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      uploadAvatar(p.url);
                      setShowAvatarPresets(false);
                    }}
                    className={`aspect-square rounded-full overflow-hidden border-2 transition-all relative ${
                      user.avatarUrl === p.url
                        ? 'border-[#006d36] ring-2 ring-[#4ade80]/50 scale-105'
                        : 'border-transparent hover:border-[#bccabb]'
                    }`}
                  >
                    <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                    {user.avatarUrl === p.url && (
                      <div className="absolute inset-0 bg-[#006d36]/30 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white stroke-[3]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Stats Bento Grid */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-[#f8f9ff] p-3 rounded-2xl border border-[#bccabb]/30 text-center">
            <div className="flex items-center justify-center gap-1 text-[#f6bb1f] mb-0.5">
              <Flame className="w-4 h-4 fill-[#f6bb1f]" />
              <span className="text-base font-black text-[#0d1c2e]">{user.streakDays}d</span>
            </div>
            <p className="text-[10px] font-bold text-[#6d7b6d] uppercase">Streak Rekor</p>
          </div>

          <div className="bg-[#f8f9ff] p-3 rounded-2xl border border-[#bccabb]/30 text-center">
            <div className="flex items-center justify-center gap-1 text-[#006d36] mb-0.5">
              <CheckCircle className="w-4 h-4" />
              <span className="text-base font-black text-[#0d1c2e]">
                {completedTodayCount}/{habits.length}
              </span>
            </div>
            <p className="text-[10px] font-bold text-[#6d7b6d] uppercase">Rutin Hari Ini</p>
          </div>

          <div className="bg-[#f8f9ff] p-3 rounded-2xl border border-[#bccabb]/30 text-center">
            <div className="flex items-center justify-center gap-1 text-[#0060ac] mb-0.5">
              <Sparkles className="w-4 h-4 fill-[#0060ac]" />
              <span className="text-base font-black text-[#0d1c2e]">{leafPoints}</span>
            </div>
            <p className="text-[10px] font-bold text-[#6d7b6d] uppercase">Leaf Points</p>
          </div>
        </div>

        {/* Profile Info Form */}
        <div className="bg-[#f8f9ff] p-4 sm:p-5 rounded-2xl border border-[#bccabb]/30 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm text-[#0d1c2e] flex items-center gap-2">
              <User className="w-4 h-4 text-[#006d36]" /> Informasi Akun & Profil
            </h3>
            <button
              onClick={() => setIsEditingInfo(!isEditingInfo)}
              className="text-xs font-bold text-[#006d36] hover:underline flex items-center gap-1"
            >
              {isEditingInfo ? (
                'Batal'
              ) : (
                <>
                  <Edit3 className="w-3.5 h-3.5" /> Edit Data
                </>
              )}
            </button>
          </div>

          {isEditingInfo ? (
            <form onSubmit={handleSaveInfo} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#3d4a3e] uppercase mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#bccabb]/40 text-xs font-semibold focus:ring-2 focus:ring-[#006d36] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#3d4a3e] uppercase mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#bccabb]/40 text-xs font-semibold focus:ring-2 focus:ring-[#006d36] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#3d4a3e] uppercase mb-1">
                  Gelar / Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#bccabb]/40 text-xs font-semibold focus:ring-2 focus:ring-[#006d36] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#3d4a3e] uppercase mb-1">
                  Bio Singkat
                </label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#bccabb]/40 text-xs font-semibold focus:ring-2 focus:ring-[#006d36] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#006d36] hover:bg-[#005e2d] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Save className="w-3.5 h-3.5" /> Simpan Perubahan
              </button>
            </form>
          ) : (
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-[#bccabb]/20">
                <span className="text-[#6d7b6d] flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Email
                </span>
                <span className="font-bold text-[#0d1c2e]">{user.email}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#bccabb]/20">
                <span className="text-[#6d7b6d] flex items-center gap-1">
                  <Award className="w-3.5 h-3.5" /> Bergabung
                </span>
                <span className="font-bold text-[#0d1c2e]">{user.joinDate}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#6d7b6d]">Total Kebiasaan Selesai</span>
                <span className="font-black text-[#006d36]">{user.totalHabitsCompleted} Selesai</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            onClick={() => {
              setIsProfileModalOpen(false);
              setIsAuthModalOpen(true);
            }}
            className="py-3 rounded-2xl bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0060ac] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <User className="w-4 h-4" /> Ganti Akun
          </button>

          <button
            onClick={logout}
            className="py-3 rounded-2xl bg-[#ffdad6]/50 hover:bg-[#ffdad6] text-[#ba1a1a] font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all"
          >
            <LogOut className="w-4 h-4" /> Keluar (Logout)
          </button>
        </div>
      </div>
    </div>
  );
};
