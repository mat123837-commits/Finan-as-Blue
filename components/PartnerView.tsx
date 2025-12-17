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

  const partnerTransactions = transactions
    .filter(t => t.category === 'partner' && t.type === 'expense')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
  const restaurantSpend = getMonthlyTotal('Restaurante') + getMonthlyTotal('Jantar');
  const leisureSpend = getMonthlyTotal('Lazer') + getMonthlyTotal('Cinema') + getMonthlyTotal('Eventos');
  const travelSpend = getMonthlyTotal('Viagem');
  
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
    <div className="pb-32 animate-in slide-in-from-right duration-300 relative min-h-screen">
      
      {/* FAB */}
      <button 
        onClick={() => onQuickAdd('')} 
        className="fixed bottom-8 right-6 w-14 h-14 bg-[#162660] text-white rounded-full shadow-xl shadow-blue-900/30 flex items-center justify-center z-50 active:scale-90 transition-transform hover:bg-[#1e3a8a] md:hidden"
      >
        <Plus size={32} />
      </button>

      <div className="flex items-center justify-between mb-6 pt-4">
         <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 bg-white rounded-full text-gray-500 hover:text-[#162660] shadow-sm">
               <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-[#162660]">Relacionamento</h2>
         </div>
         <div className="flex gap-2">
            <button onClick={() => onQuickAdd('')} className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#162660] text-white rounded-xl text-sm font-bold hover:bg-[#1e3a8a]">
               <Plus size={16} /> Novo Gasto
            </button>
            <button onClick={onOpenSettings} className="p-2 bg-white rounded-full text-gray-400 hover:text-[#162660] shadow-sm">
               <Settings size={20} />
            </button>
         </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
          
          {/* 1. Hero Card (Span 12/8) */}
          <div className="col-span-12 md:col-span-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-rose-200">
             <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
             
             <div className="relative z-10 flex flex-col h-full justify-between">
                 <div className="flex items-center gap-2 mb-4">
                     <div className="bg-white/20 p-2 rounded-xl">
                        <Heart size={20} fill="currentColor" />
                     </div>
                     <span className="font-bold text-rose-100">{partner.partnerName || 'Meu Amor'}</span>
                     {partner.anniversaryDate && (
                         <span className="text-xs bg-white/10 px-2 py-1 rounded-lg ml-2">{formatDate(partner.anniversaryDate)}</span>
                     )}
                 </div>

                 <div>
                     <p className="text-xs text-rose-100 mb-1 font-bold uppercase tracking-wide">Investimento no Nós (Mês)</p>
                     <h3 className="text-5xl font-bold tracking-tight mb-6 font-serif">{formatCurrency(monthlyTotal)}</h3>
                     
                     <div className="flex gap-6">
                        <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                            <p className="text-[10px] text-rose-100 uppercase font-bold opacity-80">Jantares/Saídas</p>
                            <p className="text-lg font-bold">{formatCurrency(dateNightSpend)}</p>
                        </div>
                        <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm">
                            <p className="text-[10px] text-rose-100 uppercase font-bold opacity-80">Viagens</p>
                            <p className="text-lg font-bold">{formatCurrency(travelSpend)}</p>
                        </div>
                     </div>
                 </div>
             </div>
          </div>

          {/* 2. Budget Gauge (Span 12/4) */}
          <div className="col-span-12 md:col-span-4 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-4 text-purple-600">
                  <Ticket size={24} />
                  <h3 className="font-bold text-[#162660]">Orçamento Date</h3>
              </div>
              <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-end mb-2">
                      <span className="text-4xl font-bold text-[#162660] font-serif">{dateBudgetProgress.toFixed(0)}%</span>
                      <span className="text-xs font-bold text-gray-400 mb-1">da meta mensal</span>
                  </div>
                  <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-purple-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(dateBudgetProgress, 100)}%` }}></div>
                  </div>
                  <p className="text-center text-xs text-gray-400 mt-2">
                      Gasto: <span className="text-[#162660] font-bold">{formatCurrency(dateNightSpend)}</span> / {formatCurrency(partner.dateBudget)}
                  </p>
              </div>
          </div>

          {/* 3. Quick Actions Grid (Span 12) */}
          <div className="col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { id: 'Restaurante', label: 'Jantar', icon: Utensils, color: 'bg-rose-50 text-rose-500' },
                { id: 'Lazer & Eventos', label: 'Lazer', icon: Ticket, color: 'bg-purple-50 text-purple-500' },
                { id: 'Viagem', label: 'Viagem', icon: Plane, color: 'bg-sky-50 text-sky-500' },
                { id: 'Presente', label: 'Presente', icon: Gift, color: 'bg-amber-50 text-amber-500' },
            ].map(action => (
                <button 
                    key={action.id}
                    onClick={() => onQuickAdd(action.id)}
                    className="bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-3 group"
                >
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${action.color}`}>
                        <action.icon size={20} />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-[#162660] text-sm">{action.label}</p>
                        <p className="text-[10px] text-gray-400">Adicionar</p>
                    </div>
                </button>
            ))}
          </div>

          {/* 4. History (Span 12) */}
          <div className="col-span-12 bg-[#FFFDF5] rounded-[2.5rem] p-6 border border-gray-100 shadow-sm">
             <h3 className="font-bold text-[#162660] mb-4">Memórias Recentes</h3>
             <div className="space-y-3">
                {partnerTransactions.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">Nenhum registro ainda.</div>
                ) : (
                  partnerTransactions.slice(0, 5).map((t) => {
                    const sub = t.subcategory || '';
                    const Icon = getSubIcon(sub);
                    return (
                      <div key={t.id} className="flex items-center justify-between p-4 bg-white border border-gray-50 rounded-2xl hover:bg-gray-50 transition-colors">
                         <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                                 <Icon size={18} />
                             </div>
                             <div>
                                 <p className="font-bold text-[#162660] text-sm">{t.description || sub}</p>
                                 <p className="text-xs text-gray-400">{formatDate(t.date)}</p>
                             </div>
                         </div>
                         <div className="flex items-center gap-3">
                             <span className="font-bold text-[#162660]">{formatCurrency(t.amount)}</span>
                             <button onClick={() => onEditTransaction(t)} className="p-2 text-gray-300 hover:text-[#162660]">
                                 <Edit3 size={16} />
                             </button>
                         </div>
                      </div>
                    );
                  })
                )}
             </div>
          </div>

      </div>
    </div>
  );
};