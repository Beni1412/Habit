import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InteractivePet2D } from '../pet2d/InteractivePet2D';
import {
  Sparkles,
  ShoppingBag,
  Droplets,
  Zap,
  Cookie,
  Bell,
  Sun,
  Check,
  CheckCircle,
  Package,
} from 'lucide-react';

export const StoreScreen: React.FC = () => {
  const { storeItems, leafPoints, buyStoreItem, useStoreItem, toggleEquipItem, currentPet } =
    useApp();
  const [activeMainTab, setActiveMainTab] = useState<'shop' | 'inventory'>('shop');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const getStoreIcon = (iconName: string) => {
    switch (iconName) {
      case 'water_drop':
        return <Droplets className="w-7 h-7 text-[#0060ac]" />;
      case 'checkroom':
        return <Sun className="w-7 h-7 text-[#795900]" />;
      case 'compost':
        return <Zap className="w-7 h-7 text-[#006d36]" />;
      case 'cake':
        return <Cookie className="w-7 h-7 text-[#ba1a1a]" />;
      case 'notifications_active':
        return <Bell className="w-7 h-7 text-[#f6bb1f]" />;
      case 'lightbulb':
        return <Sun className="w-7 h-7 text-[#64a8fe]" />;
      default:
        return <ShoppingBag className="w-7 h-7 text-[#006d36]" />;
    }
  };

  const filteredItems = storeItems.filter((item) => {
    if (activeMainTab === 'inventory') {
      return (item.quantity && item.quantity > 0) || item.isPurchased;
    }
    if (filterCategory === 'all') return true;
    return item.category === filterCategory;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-3.5 sm:px-6 md:px-8 py-5 pb-24 md:pb-12 space-y-6">
      {/* Header & Leaf Balance Banner */}
      <div className="bg-gradient-to-r from-[#eff4ff] via-white to-[#e6eeff] rounded-3xl p-5 sm:p-7 border border-[#bccabb]/30 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-[#0d1c2e] tracking-tight">
              Habit Rewards Store
            </h1>
            <span className="bg-[#4ade80]/20 text-[#005e2d] px-3 py-0.5 rounded-full text-xs font-black border border-[#4ade80]/30">
              Fresh Restock
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6d7b6d] font-medium mt-1">
            Redeem points earned from completed routines for care elixirs, outfits, and boosters.
          </p>
        </div>

        {/* Balance Capsule */}
        <div className="bg-white px-5 py-3 rounded-2xl border-2 border-[#4ade80]/50 shadow-md flex items-center gap-3 self-stretch md:self-auto">
          <div className="w-10 h-10 rounded-full bg-[#f6bb1f]/20 flex items-center justify-center text-[#f6bb1f]">
            <Sparkles className="w-5 h-5 fill-[#f6bb1f]" />
          </div>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-black text-[#6d7b6d] block">
              Available Balance
            </span>
            <span className="text-xl sm:text-2xl font-black text-[#0d1c2e]">
              {leafPoints.toLocaleString()}{' '}
              <span className="text-xs font-bold text-[#006d36]">Leafs</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Mode Toggle: Shop vs My Bag */}
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-[#f8f9ff] p-1.5 rounded-2xl border border-[#bccabb]/30">
          <button
            onClick={() => setActiveMainTab('shop')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
              activeMainTab === 'shop'
                ? 'bg-white text-[#006d36] shadow-xs'
                : 'text-[#6d7b6d] hover:text-[#0d1c2e]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" /> Shop Catalog
          </button>
          <button
            onClick={() => setActiveMainTab('inventory')}
            className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all ${
              activeMainTab === 'inventory'
                ? 'bg-white text-[#0060ac] shadow-xs'
                : 'text-[#6d7b6d] hover:text-[#0d1c2e]'
            }`}
          >
            <Package className="w-4 h-4" /> My Bag Inventory
          </button>
        </div>

        {/* Category Pills (Only visible in Shop mode) */}
        {activeMainTab === 'shop' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'potion', label: 'Potions & Care' },
              { id: 'accessory', label: 'Outfits & Hats' },
              { id: 'booster', label: 'Growth Boosters' },
              { id: 'decor', label: 'Habitat Decor' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterCategory(tab.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  filterCategory === tab.id
                    ? 'bg-[#006d36] text-white shadow-xs'
                    : 'bg-white text-[#3d4a3e] hover:bg-[#eff4ff] border border-[#bccabb]/30'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Live 2D Companion Preview & Fitting Room */}
      {activeMainTab === 'inventory' && (
        <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 rounded-3xl p-5 border border-emerald-200/60 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-white rounded-2xl shadow-inner border border-emerald-100 flex items-center justify-center overflow-visible">
              <InteractivePet2D pet={currentPet} scale={0.7} mood="celebrating" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-black text-base text-[#0d1c2e]">{currentPet.name}'s Wardrobe</h2>
                <span className="px-2 py-0.5 bg-emerald-100 text-[#006d36] text-[10px] font-black rounded-full">
                  {currentPet.equippedItems.length} Equipped
                </span>
              </div>
              <p className="text-xs text-[#3d4a3e] mt-0.5">
                Equip hats, glasses, and accessories to customize your 2D companion's appearance!
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-white/80 px-3 py-1.5 rounded-full border border-emerald-200 shadow-2xs">
            Live 2D Fitting
          </span>
        </div>
      )}

      {/* Items Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.length === 0 ? (
          <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-[#bccabb]/30 space-y-3">
            <Package className="w-12 h-12 text-[#bccabb] mx-auto" />
            <h3 className="font-bold text-[#0d1c2e] text-base">
              {activeMainTab === 'inventory'
                ? 'Your inventory bag is currently empty'
                : 'No items in this category'}
            </h3>
            <p className="text-xs text-[#6d7b6d]">
              {activeMainTab === 'inventory'
                ? 'Browse the shop catalog above to purchase treats and accessories!'
                : 'Check back soon for new arrivals.'}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isEquippedOnCurrentPet = currentPet.equippedItems.includes(item.id);
            const canAfford = leafPoints >= item.cost;
            const isConsumable =
              item.category === 'potion' || item.category === 'treat' || item.category === 'booster';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-5 sm:p-6 border transition-all flex flex-col justify-between relative overflow-hidden ${
                  item.isSoldOut
                    ? 'opacity-70 border-[#bccabb]/30'
                    : 'border-[#bccabb]/40 hover:border-[#4ade80] hover:shadow-md'
                }`}
              >
                {/* Badges */}
                <div className="flex justify-between items-start mb-3">
                  <div className={`p-3.5 rounded-2xl ${item.colorTheme} shadow-inner`}>
                    {getStoreIcon(item.icon)}
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {item.quantity && item.quantity > 0 && (
                      <span className="px-2.5 py-0.5 bg-[#4ade80]/20 text-[#005e2d] rounded-full text-xs font-black shadow-xs">
                        Owned x{item.quantity}
                      </span>
                    )}
                    {item.isNew && (
                      <span className="px-2.5 py-0.5 bg-[#4ade80] text-[#005e2d] rounded-full text-[10px] font-black tracking-wider uppercase shadow-xs">
                        NEW
                      </span>
                    )}
                    {item.isPurchased && !item.quantity && (
                      <span className="px-2.5 py-0.5 bg-[#4ade80]/20 text-[#005e2d] rounded-full text-[10px] font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Owned
                      </span>
                    )}
                  </div>
                </div>

                {/* Item Info */}
                <div className="space-y-1.5 mb-5">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-black text-base sm:text-lg text-[#0d1c2e] tracking-tight">
                      {item.name}
                    </h3>
                    <span className="text-[11px] font-bold text-[#6d7b6d] capitalize">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-[#3d4a3e] line-clamp-2 leading-relaxed">
                    {item.description}
                  </p>

                  {item.boostEffect && (
                    <div className="bg-[#f8f9ff] p-2 rounded-xl border border-[#bccabb]/20 text-[11px] font-bold text-[#006d36] flex items-center gap-1.5 mt-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#f6bb1f]" />
                      {item.boostEffect}
                    </div>
                  )}
                </div>

                {/* Action Area */}
                <div className="pt-3.5 border-t border-[#bccabb]/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#f6bb1f] fill-[#f6bb1f]" />
                    <span className="font-black text-lg text-[#0d1c2e]">{item.cost}</span>
                    <span className="text-xs font-bold text-[#6d7b6d]">Leafs</span>
                  </div>

                  {activeMainTab === 'inventory' ? (
                    isConsumable ? (
                      <button
                        onClick={() => useStoreItem(item.id)}
                        className="px-4 py-2 rounded-xl bg-[#006d36] hover:bg-[#005e2d] text-white text-xs font-black shadow-xs transition-all bouncy-button border-b-[#004722] flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Use Now
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleEquipItem(item.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
                          isEquippedOnCurrentPet
                            ? 'bg-[#006d36] text-white shadow-xs'
                            : 'bg-[#eff4ff] text-[#0060ac] hover:bg-[#dce9ff]'
                        }`}
                      >
                        {isEquippedOnCurrentPet ? (
                          <>
                            <CheckCircle className="w-3.5 h-3.5" /> Equipped
                          </>
                        ) : (
                          'Equip'
                        )}
                      </button>
                    )
                  ) : item.isSoldOut ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-xl bg-[#e6eeff] text-[#6d7b6d] font-bold text-xs cursor-not-allowed"
                    >
                      Out of Stock
                    </button>
                  ) : item.category === 'accessory' && item.isPurchased ? (
                    <button
                      onClick={() => toggleEquipItem(item.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 active:scale-95 ${
                        isEquippedOnCurrentPet
                          ? 'bg-[#006d36] text-white shadow-xs'
                          : 'bg-[#eff4ff] text-[#0060ac] hover:bg-[#dce9ff]'
                      }`}
                    >
                      {isEquippedOnCurrentPet ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" /> Equipped
                        </>
                      ) : (
                        'Equip'
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={() => buyStoreItem(item.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-black shadow-xs transition-all bouncy-button flex items-center gap-1.5 ${
                        canAfford
                          ? 'bg-[#006d36] hover:bg-[#005e2d] text-white border-b-[#004722]'
                          : 'bg-[#eff4ff] text-[#6d7b6d] border-b-[#bccabb]'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" /> Buy
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
