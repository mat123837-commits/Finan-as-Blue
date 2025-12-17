import React from 'react';
import { Plus, Minus, Coffee, ShoppingBag, Car, Home, Zap, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { AppData, CategoryKey } from '../types';
import { formatCurrency, COLORS } from '../constants';

interface MobileHomeProps {
  data: AppData;
  userName: string;
  onOpenTransaction: (type: 'expense' | 'income', category?: CategoryKey, subcategory?: string) => void;
}

export const MobileHome: React.FC<MobileHomeProps> = ({ data, userName, onOpenTransaction }) => {
  const { transactions, showValues } = data;

  // Calculo simples de saldo para o cabeçalho (apenas para contexto rápido)
  const totalIncome = transactions
    .filter(t => t.type === 'income' && !t.isBenefit)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpensesDebit = transactions
    .filter(t => t.type === 'expense' && t.paymentMethod !== 'credit')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalIncome - totalExpensesDebit + (data.initialBalance || 0);

  return (
    <div className="flex flex-col h-full min-h-[80vh] pt-4 pb-24 animate-in fade-in duration-500">
      
      {/* 1. Header Minimalista */}
      <div className="flex justify-between items-end mb-8 px-2">
        <div>
          <p className="text-sm text-primary/60 font-medium mb-1">Olá, {userName}</p>
          <div className="flex items-baseline gap-2">
             <h1 className="text-3xl font-bold text-primary font-serif">
               {showValues ? formatCurrency(netBalance) : 'R$ ••••'}
             </h1>
             <span className="text-xs font-bold text-primary/40 uppercase tracking-wide">Disponível</span>
          </div>
        </div>
      </div>

      {/* 2. Botões de Ação Principal (Gigantes) */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => onOpenTransaction('expense')}
          className="aspect-square rounded-[2.5rem] bg-[#9F3E34] text-[#F6E9CA] flex flex-col items-center justify-center gap-2 shadow-xl shadow-[#9F3E34]/20 active:scale-95 transition-all hover:brightness-110 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-black/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-[2.5rem]"></div>
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-2">
            <Minus size={32} strokeWidth={3} />
          </div>
          <span className="text-xl font-bold font-serif">Gastei</span>
        </button>

        <button
          onClick={() => onOpenTransaction('income')}
          className="aspect-square rounded-[2.5rem] bg-[#13312A] text-[#F6E9CA] flex flex-col items-center justify-center gap-2 shadow-xl shadow-[#13312A]/20 active:scale-95 transition-all hover:brightness-110 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-[2.5rem]"></div>
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-2">
            <Plus size={32} strokeWidth={3} />
          </div>
          <span className="text-xl font-bold font-serif">Recebi</span>
        </button>
      </div>

      {/* 3. Atalhos Rápidos (Quick Actions) */}
      <div className="bg-white/50 rounded-[2rem] p-6 border border-primary/5 mb-6">
        <h3 className="text-primary font-bold text-sm mb-4 px-1 flex items-center gap-2">
           <Zap size={16} className="text-accent" /> Atalhos Rápidos
        </h3>
        <div className="grid grid-cols-4 gap-3">
           <QuickButton 
             icon={Coffee} 
             label="Café/Lanche" 
             onClick={() => onOpenTransaction('expense', 'others', 'Lanche')} 
             color="bg-orange-100 text-orange-600" 
           />
           <QuickButton 
             icon={ShoppingBag} 
             label="Mercado" 
             onClick={() => onOpenTransaction('expense', 'house', 'Mercado')} 
             color="bg-blue-100 text-blue-600" 
           />
           <QuickButton 
             icon={Car} 
             label="Uber/Transp." 
             onClick={() => onOpenTransaction('expense', 'car', 'Transporte')} 
             color="bg-emerald-100 text-emerald-600" 
           />
           <QuickButton 
             icon={Home} 
             label="Ifood/Jantar" 
             onClick={() => onOpenTransaction('expense', 'others', 'Delivery')} 
             color="bg-rose-100 text-rose-600" 
           />
        </div>
      </div>

      {/* 4. Últimos 3 Lançamentos (Feedback Visual) */}
      <div>
         <h3 className="text-primary font-bold text-sm mb-3 px-3 opacity-60">Recentes</h3>
         <div className="space-y-2">
            {data.transactions.slice(0, 3).map(t => (
               <div key={t.id} className="bg-white p-4 rounded-3xl shadow-sm border border-primary/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${t.type === 'income' ? 'bg-[#13312A]/10 text-[#13312A]' : 'bg-[#9F3E34]/10 text-[#9F3E34]'}`}>
                        {t.type === 'income' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                     </div>
                     <div>
                        <p className="font-bold text-primary text-sm">{t.description || t.subcategory || 'Sem descrição'}</p>
                        <p className="text-xs text-primary/50 capitalize">{t.category === 'others' ? 'Outros' : t.category}</p>
                     </div>
                  </div>
                  <span className={`font-bold font-serif ${t.type === 'income' ? 'text-[#13312A]' : 'text-[#9F3E34]'}`}>
                     {t.type === 'expense' ? '- ' : '+ '}{formatCurrency(t.amount)}
                  </span>
               </div>
            ))}
         </div>
      </div>

    </div>
  );
};

const QuickButton = ({ icon: Icon, label, onClick, color }: any) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-2 active:scale-95 transition-transform"
  >
    <div className={`w-14 h-14 rounded-[1.2rem] ${color} flex items-center justify-center shadow-sm`}>
      <Icon size={24} />
    </div>
    <span className="text-[10px] font-bold text-primary/70 text-center leading-tight">{label}</span>
  </button>
);