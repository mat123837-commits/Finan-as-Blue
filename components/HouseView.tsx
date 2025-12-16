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

  const houseTransactions = transactions
    .filter(t => t.category === 'house' && t.type === 'expense')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Date Logic
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

  // Logic for Rent Status
  const isRentPaid = rentPaid >= (house.rentAmount * 0.9); // Margin of error/discount

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
            <h2 className="text-2xl font-bold text-[#162660]">Minha Casa</h2>
         </div>
         <button onClick={onOpenSettings} className="p-2 bg-white rounded-full text-gray-400 hover:text-[#162660] shadow-sm">
            <Settings size={20} />
         </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
         <div className="bg-[#162660] p-5 rounded-3xl text-white relative overflow-hidden">
            <Home size={24} className="mb-6 text-blue-300" />
            <p className="text-xs text-blue-200 mb-1">Gasto Total (Mês)</p>
            <p className="text-2xl font-bold tracking-tight">{formatCurrency(monthlyTotal)}</p>
         </div>
         
         <div className={`p-5 rounded-3xl shadow-sm border flex flex-col justify-between ${isRentPaid ? 'bg-green-50 border-green-100' : 'bg-white border-gray-100'}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isRentPaid ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-500'}`}>
                <Home size={20} />
            </div>
            <div>
                <p className="text-xs text-gray-400 mb-1">Aluguel / Cond.</p>
                <p className={`text-sm font-bold ${isRentPaid ? 'text-green-700' : 'text-red-500'}`}>
                    {isRentPaid ? 'Pago' : 'Pendente'}
                </p>
                {!isRentPaid && <p className="text-[10px] text-gray-400">{formatCurrency(house.rentAmount)}</p>}
            </div>
         </div>
      </div>

      {/* Quick Actions - Updated to rounded-3xl */}
      <div className="mb-8">
         <h3 className="font-bold text-[#162660] mb-3 px-1">Lançamento Rápido</h3>
         <div className="grid grid-cols-4 gap-2">
            <button onClick={() => onQuickAdd('Mercado')} className="flex flex-col items-center gap-2 p-3 bg-white rounded-3xl shadow-sm border border-gray-50 active:scale-95 transition-transform hover:bg-blue-50/50">
               <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
                  <ShoppingCart size={16} />
               </div>
               <span className="text-[10px] font-bold text-gray-600">Mercado</span>
            </button>
            <button onClick={() => onQuickAdd('Limpeza')} className="flex flex-col items-center gap-2 p-3 bg-white rounded-3xl shadow-sm border border-gray-50 active:scale-95 transition-transform hover:bg-blue-50/50">
               <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center">
                  <PaintBucket size={16} />
               </div>
               <span className="text-[10px] font-bold text-gray-600">Limpeza</span>
            </button>
            <button onClick={() => onQuickAdd('Aluguel')} className="flex flex-col items-center gap-2 p-3 bg-white rounded-3xl shadow-sm border border-gray-50 active:scale-95 transition-transform hover:bg-blue-50/50">
               <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Home size={16} />
               </div>
               <span className="text-[10px] font-bold text-gray-600">Aluguel</span>
            </button>
            <button onClick={() => onQuickAdd('Contas')} className="flex flex-col items-center gap-2 p-3 bg-white rounded-3xl shadow-sm border border-gray-50 active:scale-95 transition-transform hover:bg-blue-50/50">
               <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                  <Zap size={16} />
               </div>
               <span className="text-[10px] font-bold text-gray-600">Contas</span>
            </button>
         </div>
      </div>

      {/* Budgets & Fixed Costs */}
      <div className="mb-8 space-y-4">
         <h3 className="font-bold text-[#162660] px-1">Orçamento Mensal</h3>

         {/* Market & Cleaning Budget */}
         <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50">
             <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                   <ShoppingCart size={16} className="text-orange-500" />
                   <span className="text-sm font-bold text-[#162660]">Mercado & Limpeza</span>
                </div>
                <span className="text-xs font-bold text-gray-500">{formatCurrency(marketPaid + cleaningPaid)}</span>
             </div>
             <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-1">
                 <div 
                    className="h-full bg-orange-400 rounded-full" 
                    style={{ width: `${Math.min(((marketPaid + cleaningPaid) / house.marketBudget) * 100, 100)}%` }}
                 ></div>
             </div>
             <div className="flex justify-between text-[10px] text-gray-400">
                <span>Gasto atual</span>
                <span>Meta: {formatCurrency(house.marketBudget)}</span>
             </div>
         </div>

         {/* Utilities List (Mini) */}
         <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50 space-y-3">
             <h4 className="text-xs font-bold text-gray-400 uppercase">Contas Fixas</h4>
             
             {/* Internet */}
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                      <Wifi size={16} />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-[#162660]">Internet</p>
                      <p className="text-[10px] text-gray-400">Fixo: {formatCurrency(house.internetAmount)}</p>
                   </div>
                </div>
                <span className="font-bold text-xs text-[#162660]">{formatCurrency(getMonthlyTotal('Internet'))}</span>
             </div>

             {/* Electricity */}
             <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-2xl bg-yellow-50 text-yellow-500 flex items-center justify-center">
                      <Zap size={16} />
                   </div>
                   <div>
                      <p className="text-xs font-bold text-[#162660]">Luz / Energia</p>
                      <p className="text-[10px] text-gray-400">Média esp.: {formatCurrency(house.electricityBudget)}</p>
                   </div>
                </div>
                <span className="font-bold text-xs text-[#162660]">{formatCurrency(getMonthlyTotal('Luz'))}</span>
             </div>
         </div>
      </div>

      {/* Recent History */}
      <h3 className="text-[#162660] font-bold text-lg mb-4 px-1">Histórico Casa</h3>
      <div className="space-y-3">
        {houseTransactions.length === 0 ? (
          <div className="text-center py-10 text-gray-400">Nenhum registro da casa este mês.</div>
        ) : (
          houseTransactions.slice(0, 5).map((t) => {
            const sub = t.subcategory || '';
            const Icon = getSubIcon(sub);
            
            return (
              <div 
                key={t.id} 
                className={`p-4 rounded-3xl flex items-center gap-4 transition-all bg-white shadow-sm border border-gray-50`}
              >
                <div className="w-10 h-10 rounded-2xl bg-gray-50 text-gray-500 flex items-center justify-center shrink-0">
                  <Icon size={18} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-[#162660] text-sm truncate">{sub || 'Casa'}</h4>
                    <span className="font-bold text-[#162660] text-sm">{formatCurrency(t.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                     <p className="text-xs text-gray-400">{formatDate(t.date)}</p>
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