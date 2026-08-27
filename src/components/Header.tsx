import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import {
  PawPrint,
  Bell,
  Sparkles,
  X,
  CheckCircle2,
  Flame,
  Heart,
  Timer,
  LogIn,
  User,
  Shield,
  BookOpen,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    user,
    currentPet,
    leafPoints,
    setIsCompanionModalOpen,
    setIsProfileModalOpen,
    setIsAuthModalOpen,
    setIsFocusTimerOpen,
    openGuideBook,
    notifications,
    isNotificationsOpen,
    setIsNotificationsOpen,
    markNotificationsRead,
  } = useApp();

  const unreadCount = notifications.filter((n) => !n.read).length;

  const navItems: { id: ActiveTab; label: string; badge?: string }[] = [
    { id: 'habitat', label: 'Habitat' },
    { id: 'habits', label: 'Habits' },
    { id: 'battle', label: 'Battle', badge: '⚔️' },
    { id: 'marriage', label: 'Marriage', badge: '💍' },
    { id: 'store', label: 'Store' },
    { id: 'evolution', label: 'Evolution' },
    { id: 'stats', label: 'Stats' },
    { id: 'sanctuary', label: 'Sanctuary' },
  ];

  return (
    <header className="w-full top-0 sticky z-40 bg-[#f8f9ff]/95 backdrop-blur-md border-b border-[#bccabb]/30 shadow-[0_4px_24px_rgba(13,28,46,0.04)]">
      <div className="flex justify-between items-center px-3.5 sm:px-6 md:px-8 py-3 max-w-7xl mx-auto w-full">
        {/* Brand Logo */}
        <div
          onClick={() => setActiveTab('habitat')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#4ade80]/25 flex items-center justify-center text-[#006d36] transition-transform group-hover:scale-105 group-active:scale-95 shadow-inner">
            <PawPrint className="w-6 h-6 fill-[#006d36]" />
          </div>
          <div>
            <span className="font-black text-2xl md:text-3xl text-[#006d36] tracking-tight block leading-none">
              HabitPet
            </span>
            <span className="text-[9px] font-bold text-[#6d7b6d] tracking-wider uppercase block mt-0.5">
              Focus & Routine RPG
            </span>
          </div>
        </div>

        {/* Desktop Nav Cluster */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-white/70 px-2 py-1 rounded-full border border-[#bccabb]/30 shadow-xs">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-1.5 rounded-full font-bold text-xs transition-all duration-150 relative flex items-center gap-1.5 ${
                  isActive
                    ? 'text-[#006d36] bg-[#4ade80]/25 shadow-xs'
                    : 'text-[#3d4a3e] hover:text-[#006d36] hover:bg-[#eff4ff]'
                }`}
              >
                {item.badge && <span className="text-[12px]">{item.badge}</span>}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Guide Book button */}
          <button
            onClick={() => openGuideBook('basics')}
            className="flex items-center gap-1.5 bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#006d36] border border-[#4ade80]/50 px-2.5 sm:px-3 py-1.5 rounded-full shadow-xs transition-all active:scale-95 text-xs font-black cursor-pointer"
            title="Open Trainer Guide Book & Supabase DB Setup"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#006d36]" />
            <span className="hidden sm:inline">Guide Book</span>
          </button>

          {/* Quick Focus Sprint Timer */}
          <button
            onClick={() => setIsFocusTimerOpen(true)}
            className="flex items-center gap-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0060ac] border border-[#bccabb]/40 px-2.5 sm:px-3 py-1.5 rounded-full shadow-xs transition-all active:scale-95 text-xs font-bold cursor-pointer"
            title="Start Companion Focus Sprint"
          >
            <Timer className="w-3.5 h-3.5 text-[#0060ac]" />
            <span className="hidden md:inline">Focus Sprint</span>
          </button>

          {/* Leaf Points pill */}
          <button
            onClick={() => setActiveTab('store')}
            className="flex items-center gap-1.5 bg-[#ffffff] border border-[#bccabb]/40 hover:border-[#4ade80] px-3 py-1.5 rounded-full shadow-xs transition-transform active:scale-95"
            title="Your Leaf Points balance"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#f6bb1f] fill-[#f6bb1f]" />
            <span className="font-black text-xs sm:text-sm text-[#0d1c2e]">{leafPoints.toLocaleString()}</span>
            <span className="text-[10px] font-bold text-[#6d7b6d] uppercase hidden sm:inline">Leafs</span>
          </button>

          {/* Companion Switcher */}
          <button
            onClick={() => setIsCompanionModalOpen(true)}
            className="hidden sm:flex items-center gap-2 bg-[#ffffff] border border-[#bccabb]/40 hover:border-[#4ade80] px-2.5 py-1 rounded-full shadow-xs transition-transform active:scale-95 group"
            title="Switch Companion"
          >
            <div className="w-6 h-6 rounded-full overflow-hidden bg-[#eff4ff]">
              <img
                src={currentPet.avatarImage}
                alt={currentPet.name}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xs font-bold text-[#0d1c2e] group-hover:text-[#006d36]">
              {currentPet.name}
            </span>
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                if (!isNotificationsOpen) markNotificationsRead();
              }}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#ffffff] border border-[#bccabb]/30 flex items-center justify-center text-[#3d4a3e] hover:text-[#006d36] hover:bg-[#eff4ff] transition-all relative active:scale-95"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#ba1a1a] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#ffffff] rounded-2xl shadow-xl border border-[#bccabb]/40 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex justify-between items-center pb-3 border-b border-[#bccabb]/20 mb-3">
                  <h3 className="font-bold text-sm text-[#0d1c2e] flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-[#006d36]" /> Activity & Rewards
                  </h3>
                  <button
                    onClick={() => setIsNotificationsOpen(false)}
                    className="text-[#6d7b6d] hover:text-[#0d1c2e]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto">
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3 rounded-xl flex items-start gap-3 transition-colors ${
                        item.read ? 'bg-[#f8f9ff]' : 'bg-[#4ade80]/10 border border-[#4ade80]/30'
                      }`}
                    >
                      <div className="mt-0.5">
                        {item.type === 'streak' && <Flame className="w-4 h-4 text-[#f6bb1f] fill-[#f6bb1f]" />}
                        {item.type === 'gift' && <Heart className="w-4 h-4 text-[#ba1a1a] fill-[#ba1a1a]" />}
                        {item.type === 'evolution' && <Sparkles className="w-4 h-4 text-[#006d36]" />}
                        {item.type === 'care' && <CheckCircle2 className="w-4 h-4 text-[#0060ac]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <p className="font-bold text-xs text-[#0d1c2e] truncate">{item.title}</p>
                          <span className="text-[10px] text-[#6d7b6d] shrink-0">{item.time}</span>
                        </div>
                        <p className="text-xs text-[#3d4a3e] mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Real User Profile Picture (PP) with Online Indicator */}
          {user.isLoggedIn ? (
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2 p-1 pl-1 pr-2.5 rounded-full bg-white border border-[#bccabb]/40 hover:border-[#006d36] shadow-xs transition-all active:scale-95 group text-left"
              title="Open Profile & Settings"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[#006d36] shadow-xs bg-[#eff4ff]">
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#006d36] border-2 border-white rounded-full" />
              </div>
              <div className="hidden sm:block">
                <p className="text-[11px] font-extrabold text-[#0d1c2e] leading-tight truncate max-w-[80px]">
                  {user.name.split(' ')[0]}
                </p>
                <p className="text-[9px] font-bold text-[#006d36] uppercase tracking-tight">
                  Lvl {user.level}
                </p>
              </div>
            </button>
          ) : (
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-[#006d36] hover:bg-[#005e2d] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
            >
              <LogIn className="w-3.5 h-3.5" /> Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
