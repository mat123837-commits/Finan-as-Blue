import React, { useState } from 'react';
import { AppData, Transaction } from '../types';
import { formatCurrency, formatDate } from '../constants';
import { Settings, Home, ShoppingCart, Droplets, Zap, Wifi, ArrowLeft, PaintBucket, Armchair, Menu, Plus, Edit3 } from 'lucide-react';

interface HouseViewProps {
  data: AppData;
  onBack: () => void;
  onOpenSettings: () => void;
  onQuickAdd: (subcategory: string) => void;
  onOpenSidebar: () => void;
  onEditTransaction: (transaction: Transaction) => void;
}

export const HouseView: React.FC<HouseViewProps> = ({ data, onBack, onOpenSettings, onQuickAdd, onOpenSidebar, onEditTransaction }) => {
  const { transactions, house } = data;
  
  const houseTransactions = transactions
    .filter(t => t.category === 'house' && t.type === 'expense')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const getMonthlyTotal = (subStr?: string) => {
    return houseTransactions
      .filter(t => {
        const d = new Date(t.date);
        const matchSub = subStr ? (t.subcategory || '').includes(subStr) : true;
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && matchSub;
      })
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const monthlyTotal = getMonthlyTotal();
  const rentPaid = getMonthlyTotal('Aluguel');
  const marketPaid = getMonthlyTotal('Mercado');
  const cleaningPaid = getMonthlyTotal('Limpeza');
  const isRentPaid = rentPaid >= (house.rentAmount * 0.9);

  const getSubIcon = (sub: string) => {
    if (sub.includes('Mercado')) return ShoppingCart;
    if (sub.includes('Limpeza')) return PaintBucket;
    if (sub.includes('Aluguel')) return Home;
    if (sub.includes('Internet')) return Wifi;
    if (sub.includes('Luz') || sub.includes('Energia')) return Zap;
    if (sub.includes('Água')) return Droplets;
    return Armchair;
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
            <h2 className="text-2xl font-bold text-[#162660]">Minha Casa</h2>
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
         
         {/* 1. Total Spend Hero (Span 12/6) */}
         <div className="col-span-12 md:col-span-6 bg-[#162660] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-900/20">
            <div className="absolute left-0 bottom-0 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl -ml-10 -mb-10"></div>
            <p className="text-blue-200 text-xs font-bold uppercase tracking-wide mb-1">Custo Total (Mês)</p>
            <h3 className="text-5xl font-bold font-serif mb-4">{formatCurrency(monthlyTotal)}</h3>
            <div className="flex items-center gap-2 text-xs bg-white/10 w-fit px-3 py-1.5 rounded-lg">
                <Home size={14} />
                <span>Baseado em {houseTransactions.length} lançamentos</span>
            </div>
         </div>

         {/* 2. Rent Status (Span 12/6) */}
         <div className={`col-span-12 md:col-span-6 rounded-[2.5rem] p-8 border shadow-sm relative overflow-hidden flex flex-col justify-center ${isRentPaid ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-gray-100'}`}>
            <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isRentPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                    <Home size={28} />
                </div>
                <div>
                    <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Aluguel / Cond.</p>
                    <p className={`text-3xl font-bold ${isRentPaid ? 'text-emerald-700' : 'text-red-500'}`}>
                        {isRentPaid ? 'Pago' : 'Pendente'}
                    </p>
                </div>
            </div>
            {!isRentPaid && (
                <div className="bg-red-100/50 p-3 rounded-xl text-red-600 text-xs font-bold text-center">
                    Valor esperado: {formatCurrency(house.rentAmount)}
                </div>
            )}
         </div>

         {/* 3. Market Budget (Span 12/6) */}
         <div className="col-span-12 md:col-span-6 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center gap-2">
                     <div className="p-2 bg-orange-50 text-orange-600 rounded-xl"><ShoppingCart size={20} /></div>
                     <span className="font-bold text-[#162660]">Mercado & Limpeza</span>
                 </div>
                 <span className="text-xs font-bold text-gray-400">Meta: {formatCurrency(house.marketBudget)}</span>
             </div>
             <h4 className="text-2xl font-bold text-[#162660] mb-2">{formatCurrency(marketPaid + cleaningPaid)}</h4>
             <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                 <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(((marketPaid + cleaningPaid) / house.marketBudget) * 100, 100)}%` }}></div>
             </div>
         </div>

         {/* 4. Utilities Grid (Span 12/6) */}
         <div className="col-span-12 md:col-span-6 grid grid-cols-2 gap-4">
             <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                 <div className="flex items-center gap-2 text-indigo-500 mb-2">
                     <Wifi size={20} />
                     <span className="text-xs font-bold uppercase text-gray-400">Internet</span>
                 </div>
                 <p className="text-xl font-bold text-[#162660]">{formatCurrency(getMonthlyTotal('Internet'))}</p>
                 <p className="text-[10px] text-gray-400">Fixo: {formatCurrency(house.internetAmount)}</p>
             </div>
             <div className="bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col justify-between">
                 <div className="flex items-center gap-2 text-yellow-500 mb-2">
                     <Zap size={20} />
                     <span className="text-xs font-bold uppercase text-gray-400">Luz</span>
                 </div>
                 <p className="text-xl font-bold text-[#162660]">{formatCurrency(getMonthlyTotal('Luz'))}</p>
                 <p className="text-[10px] text-gray-400">Est.: {formatCurrency(house.electricityBudget)}</p>
             </div>
         </div>

         {/* 5. Quick Actions Row (Span 12) */}
         <div className="col-span-12 flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {[
                { id: 'Mercado', icon: ShoppingCart, color: 'text-orange-600 bg-orange-100' },
                { id: 'Limpeza', icon: PaintBucket, color: 'text-cyan-600 bg-cyan-100' },
                { id: 'Aluguel', icon: Home, color: 'text-emerald-600 bg-emerald-100' },
                { id: 'Contas', icon: Zap, color: 'text-yellow-600 bg-yellow-100' }
            ].map(action => (
                <button 
                    key={action.id}
                    onClick={() => onQuickAdd(action.id)}
                    className="flex-1 min-w-[100px] bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center gap-2"
                >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${action.color}`}>
                        <action.icon size={18} />
                    </div>
                    <span className="text-xs font-bold text-gray-600">{action.id}</span>
                </button>
            ))}
         </div>

         {/* 6. History (Span 12) */}
         <div className="col-span-12 bg-[#FFFDF5] rounded-[2.5rem] p-6 border border-gray-100 shadow-sm">
             <h3 className="font-bold text-[#162660] mb-4">Histórico</h3>
             <div className="space-y-3">
                {houseTransactions.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">Nenhum registro.</div>
                ) : (
                  houseTransactions.slice(0, 5).map((t) => {
                    const sub = t.subcategory || '';
                    const Icon = getSubIcon(sub);
                    return (
                      <div key={t.id} className="flex items-center justify-between p-4 bg-white border border-gray-50 rounded-2xl hover:bg-gray-50 transition-colors">
                         <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center">
                                 <Icon size={18} />
                             </div>
                             <div>
                                 <p className="font-bold text-[#162660] text-sm">{sub || 'Casa'}</p>
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