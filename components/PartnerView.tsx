import React, { useState } from 'react';
import { AppData, Transaction } from '../types';
import { formatCurrency, formatDate } from '../constants';
import { Settings, Heart, Utensils, Ticket, Plane, Gift, ArrowLeft, ShoppingBag, Menu, Plus, Edit3 } from 'lucide-react';

interface PartnerViewProps {
  data: AppData;
  onBack: () => void;
  onOpenSettings: () => void;
  onQuickAdd: (subcategory: string) => void;
  onOpenSidebar: () => void;
  onEditTransaction: (transaction: Transaction) => void;
}

export const PartnerView: React.FC<PartnerViewProps> = ({ data, onBack, onOpenSettings, onQuickAdd, onOpenSidebar, onEditTransaction }) => {
  const { transactions, partner } = data;

  // --- Gesture Logic ---
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isRightSwipe) {
      onBack();
    }
  };
  // ---------------------

  const partnerTransactions = transactions
    .filter(t => t.category === 'partner' && t.type === 'expense')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Date Logic
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const getMonthlyTotal = (subStr?: string) => {
    return partnerTransactions
      .filter(t => {
        const d = new Date(t.date);
        const matchSub = subStr ? (t.subcategory || '').includes(subStr) : true;
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && matchSub;
      })
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const monthlyTotal = getMonthlyTotal();
  
  // Specific Budgets / Categories
  const restaurantSpend = getMonthlyTotal('Restaurante') + getMonthlyTotal('Jantar');
  const leisureSpend = getMonthlyTotal('Lazer') + getMonthlyTotal('Cinema') + getMonthlyTotal('Eventos');
  const travelSpend = getMonthlyTotal('Viagem');
  
  // Date Night Budget (Dining + Leisure)
  const dateNightSpend = restaurantSpend + leisureSpend;
  const dateBudgetProgress = partner.dateBudget > 0 ? (dateNightSpend / partner.dateBudget) * 100 : 0;

  const getSubIcon = (sub: string) => {
    if (sub.includes('Restaurante') || sub.includes('Jantar')) return Utensils;
    if (sub.includes('Lazer') || sub.includes('Eventos') || sub.includes('Cinema')) return Ticket;
    if (sub.includes('Viagem')) return Plane;
    if (sub.includes('Presente')) return Gift;
    if (sub.includes('Mercado')) return ShoppingBag;
    return Heart;
  };

  return (
    <div 
        className="pb-32 animate-in slide-in-from-right duration-300 relative min-h-screen touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
    >
      
      {/* FAB for Quick Add */}
      <button 
        onClick={() => onQuickAdd('')} 
        className="fixed bottom-8 right-6 w-14 h-14 bg-[#162660] text-white rounded-full shadow-xl shadow-blue-900/30 flex items-center justify-center z-50 active:scale-90 transition-transform hover:bg-[#1e3a8a]"
      >
        <Plus size={32} />
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-4">
         <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 bg-white rounded-full text-gray-500 hover:text-[#162660] shadow-sm">
               <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-[#162660]">Relacionamento</h2>
         </div>
         <button onClick={onOpenSettings} className="p-2 bg-white rounded-full text-gray-400 hover:text-[#162660] shadow-sm">
            <Settings size={20} />
         </button>
      </div>

      <div className="mb-6 flex items-center gap-2 text-rose-500">
         <Heart size={16} fill="currentColor" />
         <p className="text-sm font-medium">{partner.partnerName || 'Meu Amor'}</p>
         {partner.anniversaryDate && (
             <span className="text-xs text-gray-400 ml-2">• Aniversário: {formatDate(partner.anniversaryDate)}</span>
         )}
      </div>

      {/* Main Stats */}
      <div className="bg-gradient-to-br from-rose-500 to-pink-600 p-6 rounded-3xl text-white relative overflow-hidden shadow-lg shadow-rose-200 mb-6">
          <div className="absolute right-0 top-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
          
          <p className="text-xs text-rose-100 mb-1 font-medium">Investimento no Relacionamento (Mês)</p>
          <h3 className="text-3xl font-bold tracking-tight mb-4">{formatCurrency(monthlyTotal)}</h3>
          
          <div className="flex gap-4">
             <div>
                <p className="text-[10px] text-rose-100 uppercase font-bold opacity-80">Jantares/Saídas</p>
                <p className="text-sm font-bold">{formatCurrency(dateNightSpend)}</p>
             </div>
             <div>
                <p className="text-[10px] text-rose-100 uppercase font-bold opacity-80">Viagens</p>
                <p className="text-sm font-bold">{formatCurrency(travelSpend)}</p>
             </div>
          </div>
      </div>

      {/* Quick Actions - Updated to rounded-3xl */}
      <div className="mb-8">
         <h3 className="font-bold text-[#162660] mb-3 px-1">Novo Momento</h3>
         <div className="grid grid-cols-4 gap-2">
            <button onClick={() => onQuickAdd('Restaurante')} className="flex flex-col items-center gap-2 p-3 bg-white rounded-3xl shadow-sm border border-gray-50 active:scale-95 transition-transform hover:bg-rose-50/50">
               <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center">
                  <Utensils size={18} />
               </div>
               <span className="text-[10px] font-bold text-gray-600">Jantar</span>
            </button>
            <button onClick={() => onQuickAdd('Lazer & Eventos')} className="flex flex-col items-center gap-2 p-3 bg-white rounded-3xl shadow-sm border border-gray-50 active:scale-95 transition-transform hover:bg-rose-50/50">
               <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-500 flex items-center justify-center">
                  <Ticket size={18} />
               </div>
               <span className="text-[10px] font-bold text-gray-600">Lazer</span>
            </button>
            <button onClick={() => onQuickAdd('Viagem')} className="flex flex-col items-center gap-2 p-3 bg-white rounded-3xl shadow-sm border border-gray-50 active:scale-95 transition-transform hover:bg-rose-50/50">
               <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-500 flex items-center justify-center">
                  <Plane size={18} />
               </div>
               <span className="text-[10px] font-bold text-gray-600">Viagem</span>
            </button>
            <button onClick={() => onQuickAdd('Presente')} className="flex flex-col items-center gap-2 p-3 bg-white rounded-3xl shadow-sm border border-gray-50 active:scale-95 transition-transform hover:bg-rose-50/50">
               <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Gift size={18} />
               </div>
               <span className="text-[10px] font-bold text-gray-600">Presente</span>
            </button>
         </div>
      </div>

      {/* Date Night Budget */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
                <Ticket size={16} className="text-purple-500" />
                <span className="text-sm font-bold text-[#162660]">Orçamento Mensal (Saídas)</span>
            </div>
            <span className="text-xs font-bold text-gray-500">{formatCurrency(dateNightSpend)}</span>
          </div>
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-1">
                <div 
                className="h-full bg-purple-400 rounded-full" 
                style={{ width: `${Math.min(dateBudgetProgress, 100)}%` }}
                ></div>
          </div>
          <div className="flex justify-between text-[10px] text-gray-400">
            <span>Usado</span>
            <span>Meta: {formatCurrency(partner.dateBudget)}</span>
          </div>
      </div>

      {/* Recent History */}
      <h3 className="text-[#162660] font-bold text-lg mb-4 px-1">Memórias Recentes</h3>
      <div className="space-y-3">
        {partnerTransactions.length === 0 ? (
          <div className="text-center py-10 text-gray-400">Nenhum registro ainda.</div>
        ) : (
          partnerTransactions.slice(0, 5).map((t) => {
            const sub = t.subcategory || '';
            const Icon = getSubIcon(sub);
            
            return (
              <div 
                key={t.id} 
                className={`p-4 rounded-3xl flex items-center gap-4 transition-all bg-white shadow-sm border border-gray-50`}
              >
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-[#162660] text-sm truncate">{t.description || sub}</h4>
                    <span className="font-bold text-[#162660] text-sm">{formatCurrency(t.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                     <p className="text-xs text-gray-400">{formatDate(t.date)} • {sub}</p>
                  </div>
                </div>
                <button onClick={() => onEditTransaction(t)} className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 hover:text-[#162660]">
                    <Edit3 size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};