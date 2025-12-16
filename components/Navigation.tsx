import React from 'react';
import { Home, Calendar, Plus, CreditCard, Landmark } from 'lucide-react';
import { COLORS } from '../constants';

interface NavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onOpenAdd: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, onOpenAdd }) => {
  // Updated Navigation Structure
  const leftItems = [
    { id: 'dashboard', icon: Home, label: 'Início' },
    { id: 'calendar', icon: Calendar, label: 'Agenda' },
  ];

  const rightItems = [
    { id: 'cards', icon: CreditCard, label: 'Cartão' },
    { id: 'loans', icon: Landmark, label: 'Dívidas' },
  ];

  const NavButton: React.FC<{ item: { id: string; icon: any; label: string } }> = ({ item }) => {
    const Icon = item.icon;
    const isActive = activeTab === item.id;
    return (
      <button
        onClick={() => onTabChange(item.id)}
        className={`flex flex-col items-center justify-center w-full h-full transition-all duration-300 ${
          isActive ? 'text-[#13312A]' : 'text-[#155446]/60 hover:text-[#155446]'
        }`}
      >
        <div className={`transition-transform duration-200 ${isActive ? 'scale-110 -translate-y-1' : ''}`}>
           <Icon 
            size={24} 
            strokeWidth={isActive ? 2.5 : 2}
          />
        </div>
        <span className={`text-[10px] font-bold mt-1 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 hidden'}`}>
          {item.label}
        </span>
      </button>
    );
  };

  return (
    <div className="fixed bottom-6 left-4 right-4 h-20 bg-[#FFFDF5] rounded-[2rem] shadow-[0_8px_30px_rgb(19,49,42,0.1)] z-40 border border-[#13312A]/10 px-2 animate-in slide-in-from-bottom duration-500">
      <div className="grid grid-cols-5 h-full items-center">
        
        {/* Left Items */}
        {leftItems.map((item) => (
          <NavButton key={item.id} item={item} />
        ))}

        {/* Center FAB */}
        <div className="relative flex justify-center items-center h-full">
          <button
            onClick={onOpenAdd}
            className="absolute -top-8 w-16 h-16 rounded-[1.5rem] bg-[#13312A] text-[#C69A72] flex items-center justify-center shadow-xl shadow-[#13312A]/30 active:scale-95 transition-all duration-200 border-[6px] border-[#F6E9CA]"
          >
            <Plus size={32} strokeWidth={3} />
          </button>
        </div>

        {/* Right Items */}
        {rightItems.map((item) => (
          <NavButton key={item.id} item={item} />
        ))}

      </div>
    </div>
  );
};