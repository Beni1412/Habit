import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Sparkles, Package, Check, Droplets, Zap, Cookie, Sun, Bell, ShoppingBag } from 'lucide-react';

export const InventoryModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const { storeItems, useStoreItem, toggleEquipItem, currentPet, setActiveTab } = useApp();

  if (!isOpen) return null;

  const ownedItems = storeItems.filter((i) => (i.quantity && i.quantity > 0) || i.isPurchased);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'water_drop':
        return <Droplets className="w-5 h-5 text-[#0060ac]" />;
      case 'checkroom':
        return <Sun className="w-5 h-5 text-[#795900]" />;
      case 'compost':
        return <Zap className="w-5 h-5 text-[#006d36]" />;
      case 'cake':
        return <Cookie className="w-5 h-5 text-[#ba1a1a]" />;
      case 'notifications_active':
        return <Bell className="w-5 h-5 text-[#f6bb1f]" />;
      default:
        return <ShoppingBag className="w-5 h-5 text-[#006d36]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d1c2e]/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#ffffff] w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-[#bccabb]/40 shadow-2xl space-y-6 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-full bg-[#f8f9ff] border border-[#bccabb]/30 flex items-center justify-center text-[#6d7b6d] hover:text-[#0d1c2e] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1 pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4ade80]/20 text-[#005e2d] rounded-full text-xs font-bold">
            <Package className="w-3.5 h-3.5" /> Guardian Inventory Bag
          </div>
          <h2 className="text-2xl font-black text-[#0d1c2e] tracking-tight">Your Care Items</h2>
          <p className="text-xs text-[#6d7b6d] font-medium">
            Feed, hydrate, or equip accessories to care for {currentPet.name}.
          </p>
        </div>

        {/* Items List */}
        <div className="space-y-3">
          {ownedItems.length === 0 ? (
            <div className="text-center py-8 bg-[#f8f9ff] rounded-2xl border border-[#bccabb]/30 space-y-3">
              <Package className="w-10 h-10 text-[#bccabb] mx-auto" />
              <p className="text-xs font-bold text-[#6d7b6d]">Your inventory bag is empty.</p>
              <button
                onClick={() => {
                  onClose();
                  setActiveTab('store');
                }}
                className="px-4 py-2 bg-[#006d36] text-white rounded-xl text-xs font-bold shadow-sm"
              >
                Visit Store
              </button>
            </div>
          ) : (
            ownedItems.map((item) => {
              const isEquipped = currentPet.equippedItems.includes(item.id);
              const isConsumable = item.category === 'potion' || item.category === 'treat' || item.category === 'booster';

              return (
                <div
                  key={item.id}
                  className="bg-[#f8f9ff] p-4 rounded-2xl border border-[#bccabb]/30 flex items-center justify-between gap-3 hover:border-[#4ade80] transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`p-3 rounded-xl ${item.colorTheme} shadow-sm shrink-0`}>
                      {getIcon(item.icon)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-[#0d1c2e] truncate">{item.name}</h4>
                        {item.quantity && item.quantity > 0 && (
                          <span className="px-2 py-0.5 bg-[#4ade80]/20 text-[#005e2d] text-[10px] font-black rounded-full">
                            x{item.quantity}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6d7b6d] truncate">{item.boostEffect || item.description}</p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isConsumable ? (
                      <button
                        onClick={() => useStoreItem(item.id)}
                        className="px-3.5 py-2 rounded-xl bg-[#006d36] hover:bg-[#005e2d] text-white text-xs font-bold shadow-sm transition-all bouncy-button border-b-[#004722] flex items-center gap-1"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Use
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleEquipItem(item.id)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                          isEquipped
                            ? 'bg-[#006d36] text-white shadow-sm'
                            : 'bg-white text-[#0060ac] border border-[#bccabb]/40 hover:bg-[#eff4ff]'
                        }`}
                      >
                        {isEquipped ? 'Equipped' : 'Equip'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

