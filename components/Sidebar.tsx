import React from 'react';
import { Home, Calendar, CreditCard, Landmark, TrendingUp, Car, Home as HomeIcon, Heart, Settings, X, ChevronRight, LogOut, Plus } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
  activeTab: string;
  userName: string;
  onLogout: () => void;
  onOpenAdd: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, onNavigate, activeTab, userName, onLogout, onOpenAdd }) => {
  const handleNav = (tab: string) => {
    onNavigate(tab);
    onClose();
  };

  const menuGroups = [
    {
      label: 'Principal',
      items: [
        { id: 'dashboard', label: 'Visão Geral', icon: Home },
        { id: 'calendar', label: 'Agenda', icon: Calendar },
      ]
    },
    {
      label: 'Financeiro',
      items: [
        { id: 'cards', label: 'Cartão de Crédito', icon: CreditCard },
        { id: 'loans', label: 'Empréstimos', icon: Landmark },
        { id: 'investments', label: 'Patrimônio', icon: TrendingUp },
      ]
    },
    {
      label: 'Estilo de Vida',
      items: [
        { id: 'car-details', label: 'Meu Veículo', icon: Car },
        { id: 'house-details', label: 'Minha Casa', icon: HomeIcon },
        { id: 'partner-details', label: 'Relacionamento', icon: Heart },
      ]
    },
    {
      label: 'Sistema',
      items: [
        { id: 'settings', label: 'Ajustes', icon: Settings },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop - Only visible if fixed positioning is applied by parent or class logic */}
      <div 
        className={`md:hidden fixed inset-0 z-50 bg-[#13312A]/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Sidebar Panel - Adaptive Classes */}
      <div 
        className={`
            fixed md:relative top-0 left-0 bottom-0 z-50 w-72 bg-[#FFFDF5] shadow-2xl md:shadow-none 
            transform transition-transform duration-300 ease-out md:translate-x-0 h-full flex flex-col
            ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col overflow-y-auto no-scrollbar">
          
          {/* Header */}
          <div className="p-6 pb-2">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold text-[#13312A] font-serif">Finanças</h2>
               {/* Close button only on mobile */}
               <button onClick={onClose} className="md:hidden p-2 bg-[#F6E9CA] rounded-full text-[#155446] hover:bg-[#C69A72]/20">
                 <X size={20} />
               </button>
            </div>
            
            <div className="bg-[#13312A] p-4 rounded-2xl text-white flex items-center gap-3 mb-6 shadow-lg shadow-[#13312A]/20">
               <div className="w-10 h-10 rounded-full bg-[#C69A72] text-[#13312A] flex items-center justify-center font-bold text-lg font-serif">
                  {userName.charAt(0).toUpperCase()}
               </div>
               <div className="min-w-0">
                  <p className="text-xs text-[#F6E9CA]">Olá,</p>
                  <p className="font-bold truncate font-serif">{userName}</p>
               </div>
            </div>

            {/* NEW ADD BUTTON FOR DESKTOP */}
            <button 
              onClick={onOpenAdd} 
              className="w-full bg-[#C69A72] text-[#13312A] font-bold py-3.5 rounded-xl mb-4 shadow-md hover:shadow-lg hover:shadow-[#C69A72]/20 transition-all flex items-center justify-center gap-2 font-serif active:scale-95 group"
            >
                <div className="bg-[#13312A] rounded-full p-1 text-[#C69A72] group-hover:scale-110 transition-transform">
                   <Plus size={16} strokeWidth={3} />
                </div>
                Novo Lançamento
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 px-4 space-y-6 pb-24">
            {menuGroups.map((group, idx) => (
              <div key={idx}>
                <h3 className="text-xs font-bold text-[#155446] uppercase tracking-wider mb-2 px-2">
                  {group.label}
                </h3>
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleNav(item.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                          isActive 
                            ? 'bg-[#155446]/10 text-[#13312A] font-bold shadow-sm' 
                            : 'text-[#155446] hover:bg-[#F6E9CA] font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-[#13312A]' : 'text-[#155446]/70'} />
                          <span>{item.label}</span>
                        </div>
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#C69A72]"></div>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <div className="p-6 border-t border-[#13312A]/5 bg-[#F6E9CA]/30 mt-auto">
             <button onClick={onLogout} className="flex items-center gap-2 text-[#9F3E34] font-medium text-sm hover:opacity-80 w-full">
                <LogOut size={16} /> Sair do App
             </button>
             <p className="text-[10px] text-[#155446] mt-4">Finanças Blue v2.4 (Hybrid)</p>
          </div>

        </div>
      </div>
    </>
  );
};