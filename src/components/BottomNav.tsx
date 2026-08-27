import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import {
  Home,
  CheckSquare,
  Swords,
  Heart,
  ShoppingBag,
  GitBranch,
  BarChart3,
  HeartHandshake,
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, marriage } = useApp();

  const items: { id: ActiveTab; label: string; icon: React.FC<{ className?: string }>; badge?: string }[] = [
    { id: 'habitat', label: 'Habitat', icon: Home },
    { id: 'habits', label: 'Habits', icon: CheckSquare },
    { id: 'battle', label: 'Battle', icon: Swords, badge: '⚔️' },
    {
      id: 'marriage',
      label: marriage.isMarried ? 'Wedding' : 'Marriage',
      icon: Heart,
      badge: marriage.babyEgg.hasEgg && !marriage.babyEgg.isHatched && marriage.babyEgg.incubationProgress >= marriage.babyEgg.maxProgress ? '🥚' : undefined,
    },
    { id: 'store', label: 'Store', icon: ShoppingBag },
    { id: 'evolution', label: 'Evolution', icon: GitBranch },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'sanctuary', label: 'Sanctuary', icon: HeartHandshake },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#ffffff]/95 backdrop-blur-lg border-t border-[#bccabb]/30 py-1.5 px-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-lg mx-auto px-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 min-w-[58px] flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all duration-150 relative ${
                isActive ? 'text-[#006d36]' : 'text-[#6d7b6d] hover:text-[#0d1c2e]'
              }`}
            >
              <div
                className={`p-1.5 rounded-full transition-colors relative ${
                  isActive ? 'bg-[#4ade80]/25 text-[#006d36]' : 'bg-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.badge && (
                  <span className="absolute -top-1 -right-1 text-[10px] animate-bounce">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 whitespace-nowrap ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};


