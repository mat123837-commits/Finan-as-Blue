
import React, { useState } from 'react';
import { Plus, Minus, Coffee, ShoppingBag, Car, Home, Zap, ArrowUpRight, ArrowDownLeft, Wallet, CreditCard, Activity, ChevronRight, Utensils, Menu } from 'lucide-react';
import { AppData, CategoryKey } from '../types';
import { formatCurrency } from '../constants';
import { AnimatedNumber } from './AnimatedNumber';

interface MobileHomeProps {
  data: AppData;
  userName: string;
  onOpenTransaction: (type: 'expense' | 'income', category?: CategoryKey, subcategory?: string) => void;
}

export const MobileHome: React.FC<MobileHomeProps> = ({ data, userName, onOpenTransaction }) => {
  const { transactions, showValues, creditCards = [], fixedExpenses = [], fixedIncomes = [] } = data;
  const [selectedCardIndex, setSelectedCardIndex] = useState(0);

  const now = new Date();
  const currentMonth = now.getMonth();

  const totalIncomeRealized = transactions
    .filter(t => t.type === 'income' && !t.isBenefit)
    .reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpensesDebit = transactions
    .filter(t => t.type === 'expense' && t.paymentMethod !== 'credit')
    .reduce((acc, curr) => acc + curr.amount, 0);
  const netBalance = totalIncomeRealized - totalExpensesDebit + (data.initialBalance || 0);

  const currentInvoiceTotal = transactions
    .filter(t => t.type === 'expense' && t.paymentMethod === 'credit' && new Date(t.date).getMonth() === currentMonth)
    .reduce((acc, t) => acc + t.amount, 0);
  const pendingFixedExpenses = fixedExpenses.reduce((acc, exp) => acc + exp.amount, 0);
  const pendingFixedIncomes = (fixedIncomes || []).reduce((acc, inc) => acc + inc.amount, 0);

  const forecastedFreeBalance = netBalance + pendingFixedIncomes - currentInvoiceTotal - pendingFixedExpenses;

  const activeCard = creditCards[selectedCardIndex] || null;
  const getCardAvailableLimit = (cardId: string) => {
      const card = creditCards.find(c => c.id === cardId);
      if (!card) return 0;
      const used = transactions
        .filter(t => t.cardId === cardId && t.type === 'expense')
        .reduce((acc, t) => acc + t.amount, 0);
      return card.limit - used;
  };

  const cycleCard = () => {
    if (creditCards.length > 1) {
      setSelectedCardIndex((prev) => (prev + 1) % creditCards.length);
    }
  };

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 max-w-md mx-auto">
      <div className="flex justify-between items-center px-1">
          <div>
              <p className="text-[10px] font-bold text-[#13312A]/30 uppercase tracking-[0.2em] mb-0.5">Visão Geral</p>
              <h1 className="text-2xl font-bold text-[#13312A] font-serif tracking-tight">{userName}</h1>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white border border-[#13312A]/5 flex items-center justify-center text-[#13312A] shadow-sm opacity-50">
              <Menu size={20} />
          </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2 bg-[#13312A] rounded-[2.5rem] p-8 text-[#F6E9CA] relative overflow-hidden shadow-2xl shadow-[#13312A]/10">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#C69A72]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2 opacity-50">
                    <Activity size={14} strokeWidth={3} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">Liquidez Livre</span>
                </div>
                <div className="mt-1">
                   <AnimatedNumber 
                    value={forecastedFreeBalance} 
                    showValues={showValues}
                    className="text-4xl font-bold font-serif tracking-tight text-[#F6E9CA]" 
                   />
                </div>
                <p className="text-[10px] mt-4 text-[#C69A72] font-bold uppercase tracking-widest leading-relaxed">Saldo disponível após <br/> todas as contas do mês</p>
            </div>
        </div>

        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#13312A]/5 flex flex-col justify-between min-h-[140px]">
            <div className="w-9 h-9 bg-[#F6E9CA] rounded-xl flex items-center justify-center text-[#13312A]">
                <Wallet size={18} />
            </div>
            <div>
                <p className="text-[10px] font-bold text-[#155446]/40 uppercase tracking-widest mb-1">Saldo Real</p>
                <AnimatedNumber value={netBalance} showValues={showValues} className="text-xl font-bold text-[#13312A] font-serif" />
            </div>
        </div>

        <div onClick={cycleCard} className="bg-white rounded-[2rem] p-6 shadow-sm border border-[#13312A]/5 flex flex-col justify-between min-h-[140px] active:scale-95 transition-all cursor-pointer">
            <div className="flex justify-between items-start">
                <div className="w-9 h-9 bg-[#13312A] text-[#C69A72] rounded-xl flex items-center justify-center">
                    <CreditCard size={18} />
                </div>
                {creditCards.length > 1 && <ChevronRight size={14} className="text-[#13312A]/20" />}
            </div>
            <div>
                <p className="text-[10px] font-bold text-[#155446]/40 uppercase tracking-widest mb-1 truncate">{activeCard ? activeCard.name : 'Cartão'}</p>
                <AnimatedNumber 
                  value={activeCard ? getCardAvailableLimit(activeCard.id) : 0} 
                  showValues={showValues} 
                  className="text-xl font-bold text-[#13312A] font-serif" 
                />
            </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button onClick={() => onOpenTransaction('expense')} className="h-24 rounded-[2.5rem] bg-[#9F3E34] text-[#F6E9CA] flex items-center justify-center gap-4 shadow-lg shadow-[#9F3E34]/20 active:scale-95 transition-all group">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Minus size={22} strokeWidth={3} /></div>
          <span className="text-lg font-bold font-serif">Gastei</span>
        </button>
        <button onClick={() => onOpenTransaction('income')} className="h-24 rounded-[2.5rem] bg-[#155446] text-[#F6E9CA] flex items-center justify-center gap-4 shadow-lg shadow-[#155446]/20 active:scale-95 transition-all group">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"><Plus size={22} strokeWidth={3} /></div>
          <span className="text-lg font-bold font-serif">Recebi</span>
        </button>
      </div>

      <div className="bg-white/40 backdrop-blur-sm rounded-[2.5rem] p-6 border border-[#13312A]/5">
        <h3 className="text-[#13312A]/30 font-bold text-[10px] uppercase tracking-[0.2em] mb-6 px-1">Sugestões Rápidas</h3>
        <div className="grid grid-cols-4 gap-4">
           <QuickButton icon={Utensils} label="Almoço" onClick={() => onOpenTransaction('expense', 'others', 'Restaurante')} color="bg-orange-50 text-orange-600" />
           <QuickButton icon={ShoppingBag} label="Mercado" onClick={() => onOpenTransaction('expense', 'house', 'Mercado')} color="bg-blue-50 text-blue-600" />
           <QuickButton icon={Car} label="Uber" onClick={() => onOpenTransaction('expense', 'car', 'Uber/Taxi')} color="bg-emerald-50 text-emerald-600" />
           <QuickButton icon={Zap} label="Contas" onClick={() => onOpenTransaction('expense', 'house', 'Luz')} color="bg-yellow-50 text-yellow-600" />
        </div>
      </div>

      <div className="px-1">
         <h3 className="text-[#13312A]/30 font-bold text-[10px] uppercase tracking-[0.2em] mb-4">Lançamentos Recentes</h3>
         <div className="space-y-3">
            {recentTransactions.map(t => (
               <div key={t.id} className="bg-white p-5 rounded-[2.2rem] shadow-sm border border-[#13312A]/5 flex items-center justify-between active:bg-[#F6E9CA]/20 transition-all">
                  <div className="flex items-center gap-4">
                     <div className={`w-11 h-11 rounded-[1.2rem] flex items-center justify-center ${t.type === 'income' ? 'bg-[#155446]/10 text-[#155446]' : 'bg-[#9F3E34]/10 text-[#9F3E34]'}`}><ArrowDownLeft size={20} /></div>
                     <div>
                        <p className="font-bold text-[#13312A] text-sm truncate max-w-[130px]">{t.description || t.subcategory || 'Lançamento'}</p>
                        <p className="text-[10px] text-[#13312A]/30 font-bold uppercase tracking-tight">{t.category}</p>
                     </div>
                  </div>
                  <span className={`font-bold font-serif text-base ${t.type === 'income' ? 'text-[#155446]' : 'text-[#13312A]'}`}>{t.type === 'expense' ? '- ' : '+ '}{formatCurrency(t.amount)}</span>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
};

const QuickButton = ({ icon: Icon, label, onClick, color }: any) => (
  <button onClick={onClick} className="flex flex-col items-center gap-2 active:scale-90 transition-transform">
    <div className={`w-14 h-14 rounded-[1.2rem] ${color} flex items-center justify-center shadow-sm`}><Icon size={24} /></div>
    <span className="text-[9px] font-bold text-[#13312A]/50 text-center uppercase tracking-tighter">{label}</span>
  </button>
);
