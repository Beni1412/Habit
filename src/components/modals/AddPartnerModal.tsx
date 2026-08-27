import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AVATAR_PRESETS } from '../../data/initialData';
import { X, UserPlus, Heart, Sparkles, Upload, Copy, Check, Users } from 'lucide-react';

export const AddPartnerModal: React.FC = () => {
  const { isAddPartnerModalOpen, setIsAddPartnerModalOpen, duoPartner, updateDuoPartner, showToast } =
    useApp();

  const [partnerName, setPartnerName] = useState(duoPartner.name);
  const [partnerPetName, setPartnerPetName] = useState(duoPartner.partnerPetName);
  const [partnerAvatar, setPartnerAvatar] = useState(duoPartner.partnerAvatar);
  const [friendCodeInput, setFriendCodeInput] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isAddPartnerModalOpen) return null;

  const myFriendCode = 'HABIT-BUDI-2026';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(myFriendCode);
    setCopiedCode(true);
    showToast('Friend code copied to clipboard! 📋');
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPartnerAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim()) return;

    updateDuoPartner({
      name: partnerName.trim(),
      partnerPetName: partnerPetName.trim() || 'Frosty',
      partnerAvatar,
      statusMessage: friendCodeInput ? `Connected via ${friendCodeInput}` : 'Joined shared sanctuary!',
    });

    setIsAddPartnerModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d1c2e]/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#ffffff] w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-[#bccabb]/40 shadow-2xl space-y-6 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={() => setIsAddPartnerModalOpen(false)}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#f8f9ff] border border-[#bccabb]/30 flex items-center justify-center text-[#6d7b6d] hover:text-[#0d1c2e] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#ba1a1a]/15 text-[#ba1a1a] rounded-full text-xs font-bold">
            <Heart className="w-3.5 h-3.5 fill-[#ba1a1a]" /> Duo Partner Sanctuary
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#0d1c2e] tracking-tight">
            Connect & Add Partner
          </h2>
          <p className="text-xs sm:text-sm text-[#6d7b6d] font-medium max-w-xs mx-auto">
            Pair up with a friend, study buddy, or partner to build mutual streaks and unlock shared island synergy!
          </p>
        </div>

        {/* My Friend Code Box */}
        <div className="bg-[#eff4ff] p-4 rounded-2xl border border-[#bccabb]/40 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-black text-[#0060ac] uppercase tracking-wider block">
              Your Shareable Friend Code
            </span>
            <span className="text-sm font-black text-[#0d1c2e] tracking-wide font-mono">
              {myFriendCode}
            </span>
          </div>
          <button
            onClick={handleCopyCode}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#dce9ff] text-[#0060ac] border border-[#bccabb]/40 font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-[#006d36]" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedCode ? 'Copied!' : 'Copy Code'}
          </button>
        </div>

        {/* Partner Connection Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide">
              Partner Display Name *
            </label>
            <input
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="e.g. Alex Tan, Sarah Maya"
              className="w-full px-4 py-3 rounded-2xl bg-[#f8f9ff] border border-[#bccabb]/40 focus:outline-none focus:ring-2 focus:ring-[#006d36] text-sm font-semibold placeholder:text-[#bccabb]"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide">
              Partner Spirit Pet Name
            </label>
            <input
              type="text"
              value={partnerPetName}
              onChange={(e) => setPartnerPetName(e.target.value)}
              placeholder="e.g. Frosty, Phoenix, Sparky"
              className="w-full px-4 py-3 rounded-2xl bg-[#f8f9ff] border border-[#bccabb]/40 focus:outline-none focus:ring-2 focus:ring-[#006d36] text-sm font-semibold placeholder:text-[#bccabb]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide">
              Friend Code or Invite Link (Optional)
            </label>
            <input
              type="text"
              value={friendCodeInput}
              onChange={(e) => setFriendCodeInput(e.target.value)}
              placeholder="e.g. HABIT-ALEX-8821"
              className="w-full px-4 py-3 rounded-2xl bg-[#f8f9ff] border border-[#bccabb]/40 focus:outline-none focus:ring-2 focus:ring-[#006d36] text-sm font-semibold placeholder:text-[#bccabb]"
            />
          </div>

          {/* Partner Photo / Avatar Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[#0d1c2e] uppercase tracking-wide">
              Partner Profile Picture (PP)
            </label>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#0060ac] shadow-md shrink-0 bg-[#eff4ff]">
                <img src={partnerAvatar} alt={partnerName} className="w-full h-full object-cover" />
              </div>
              <label className="flex-1 py-2.5 px-3 bg-[#eff4ff] hover:bg-[#dce9ff] border border-[#bccabb]/40 rounded-xl cursor-pointer text-xs font-bold text-[#0060ac] flex items-center justify-center gap-2 transition-all">
                <Upload className="w-4 h-4" /> Upload Partner Photo
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
                  onClick={() => setPartnerAvatar(p.url)}
                  className={`w-full aspect-square rounded-full overflow-hidden border-2 transition-all relative ${
                    partnerAvatar === p.url
                      ? 'border-[#0060ac] ring-2 ring-[#64a8fe]/50 scale-105'
                      : 'border-transparent hover:border-[#bccabb]'
                  }`}
                >
                  <img src={p.url} alt={p.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 rounded-2xl bg-[#006d36] hover:bg-[#005e2d] text-white font-black text-sm sm:text-base shadow-md transition-all bouncy-button border-b-[#004722] flex items-center justify-center gap-2 mt-2"
          >
            <UserPlus className="w-5 h-5" /> Pair & Save Duo Partner
          </button>
        </form>
      </div>
    </div>
  );
};
