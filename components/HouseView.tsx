
import React from 'react';
import { AppData, Transaction } from '../types';
import { formatCurrency, formatDate } from '../constants';
import { 
  Settings, Home, ShoppingCart, Droplets, Zap, Wifi, 
  Menu, Plus, Edit3, PaintBucket, Armchair, CheckCircle2, 
  AlertCircle, ArrowUpRight, ReceiptText
} from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';

interface HouseViewProps {
  data: AppData;
  onBack: () => void;
  onOpenSettings: () => void;
  onQuickAdd: (subcategory: string) => void;
  onOpenSidebar: () => void;
  onEditTransaction: (transaction: Transaction) => void;
}

export const HouseView: React.FC<HouseViewProps> = ({ 
  data, onBack, onOpenSettings, onQuickAdd, onOpenSidebar, onEditTransaction 
}) => {
  const { transactions, house, showValues } = data;
  
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
        const matchSub = subStr ? (t.subcategory || '').toLowerCase().includes(subStr.toLowerCase()) : true;
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear && matchSub;
      })
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const monthlyTotal = getMonthlyTotal();
  const rentPaid = getMonthlyTotal('Aluguel');
  const marketPaid = getMonthlyTotal('Mercado');
  const electricityPaid = getMonthlyTotal('Luz') + getMonthlyTotal('Energia');
  const internetPaid = getMonthlyTotal('Internet');
  const waterPaid = getMonthlyTotal('Água');

  const isRentPaid = rentPaid >= (house.rentAmount * 0.95);
  const marketProgress = house.marketBudget > 0 ? (marketPaid / house.marketBudget) * 100 : 0;

  return (
    <div className="pb-32 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-4">
            <button onClick={onOpenSidebar} className="p-2 bg-white rounded-xl shadow-sm text-[#13312A] hover:bg-[#F6E9CA] transition-colors">
                <Menu size={20} />
            </button>
            <h2 className="text-2xl font-bold text-[#13312A] font-serif">Minha Casa</h2>
         </div>
         <div className="flex gap-2">
            <button onClick={onOpenSettings} className="p-3 bg-white rounded-2xl text-gray-400 hover:text-[#13312A] transition-all shadow-sm">
                <Settings size={22} />
            </button>
         </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        
        {/* BENTO: GASTO TOTAL DO MÊS (WIDE HERO) */}
        <div className="col-span-12 lg:col-span-8 bg-[#13312A] rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden flex flex-col justify-center min-h-[240px]">
           <div className="absolute top-0 right-0 p-10 opacity-10"><Home size={160} /></div>
           <div className="relative z-10">
              <span className="text-[10px] font-bold text-[#C69A72] uppercase tracking-[0.4em] mb-2 block">Manutenção do Lar</span>
              <div className="text-7xl font-bold font-serif tracking-tighter">
                 <AnimatedNumber value={monthlyTotal} showValues={showValues} className="text-white" />
              </div>
              <p className="text-[10px] text-white/40 mt-6 uppercase font-bold tracking-widest flex items-center gap-2">
                 <ReceiptText size={14} /> Ciclo atual de {now.toLocaleDateString('pt-BR', { month: 'long' })}
              </p>
           </div>
        </div>

        {/* BENTO: STATUS ALUGUEL (SQUARE) */}
        <div className={`col-span-6 lg:col-span-4 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-sm border ${isRentPaid ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-[#13312A]/5'}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isRentPaid ? 'bg-emerald-500 text-white' : 'bg-rose-50 text-rose-500'}`}>
                {isRentPaid ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Aluguel / Condomínio</p>
              <div className={`text-2xl font-bold font-serif ${isRentPaid ? 'text-emerald-700' : 'text-rose-600'}`}>
                {isRentPaid ? 'Compromisso Pago' : 'Pendente'}
              </div>
              {!isRentPaid && <p className="text-[10px] font-bold text-rose-400 mt-1">Estimado: {formatCurrency(house.rentAmount)}</p>}
            </div>
        </div>

        {/* BENTO: MARKET BUDGET (WIDE) */}
        <div className="col-span-12 lg:col-span-6 bg-white rounded-[2.5rem] p-8 border border-[#13312A]/5 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[#13312A] font-serif flex items-center gap-2">
                 <ShoppingCart size={18} className="text-[#C69A72]" /> Mercado & Limpeza
              </h3>
              <span className="text-[10px] font-bold text-gray-400 uppercase">{marketProgress.toFixed(0)}% da Meta</span>
           </div>
           <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold text-[#13312A] font-serif">{formatCurrency(marketPaid)}</span>
              <span className="text-xs text-gray-400">/ {formatCurrency(house.marketBudget)}</span>
           </div>
           <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${marketProgress > 90 ? 'bg-rose-500' : 'bg-[#13312A]'}`} 
                style={{ width: `${Math.min(marketProgress, 100)}%` }}
              ></div>
           </div>
        </div>

        {/* BENTO: UTILITIES (3 SQUARES) */}
        <div className="col-span-4 lg:col-span-2 bg-[#F6E9CA]/30 rounded-[2.5rem] p-6 border border-[#13312A]/5 flex flex-col justify-between text-center group hover:bg-[#F6E9CA]/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-yellow-50 text-yellow-600 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform"><Zap size={20} /></div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Luz</p>
              <div className="text-lg font-bold text-[#13312A] font-serif">{formatCurrency(electricityPaid)}</div>
            </div>
        </div>

        <div className="col-span-4 lg:col-span-2 bg-[#F6E9CA]/30 rounded-[2.5rem] p-6 border border-[#13312A]/5 flex flex-col justify-between text-center group hover:bg-[#F6E9CA]/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform"><Droplets size={20} /></div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Água</p>
              <div className="text-lg font-bold text-[#13312A] font-serif">{formatCurrency(waterPaid)}</div>
            </div>
        </div>

        <div className="col-span-4 lg:col-span-2 bg-[#F6E9CA]/30 rounded-[2.5rem] p-6 border border-[#13312A]/5 flex flex-col justify-between text-center group hover:bg-[#F6E9CA]/50 transition-all">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform"><Wifi size={20} /></div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Internet</p>
              <div className="text-lg font-bold text-[#13312A] font-serif">{formatCurrency(internetPaid)}</div>
            </div>
        </div>

        {/* BENTO: QUICK ACTIONS */}
        <div className="col-span-12 lg:col-span-5 grid grid-cols-2 gap-4">
            <button 
              onClick={() => onQuickAdd('Mercado')} 
              className="bg-white rounded-[2rem] p-6 border border-[#13312A]/5 shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F6E9CA] text-[#13312A] flex items-center justify-center group-hover:bg-[#13312A] group-hover:text-[#C69A72] transition-colors"><ShoppingCart size={18} /></div>
              <span className="text-[10px] font-bold text-[#13312A] uppercase tracking-widest">Add Mercado</span>
            </button>
            <button 
              onClick={() => onQuickAdd('Aluguel')} 
              className="bg-white rounded-[2rem] p-6 border border-[#13312A]/5 shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#13312A]/5 text-[#13312A] flex items-center justify-center group-hover:bg-[#13312A] group-hover:text-[#C69A72] transition-colors"><Home size={18} /></div>
              <span className="text-[10px] font-bold text-[#13312A] uppercase tracking-widest">Pagar Aluguel</span>
            </button>
            <button 
              onClick={() => onQuickAdd('Manutenção')} 
              className="bg-white rounded-[2rem] p-6 border border-[#13312A]/5 shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:bg-[#13312A] group-hover:text-[#C69A72] transition-colors"><PaintBucket size={18} /></div>
              <span className="text-[10px] font-bold text-[#13312A] uppercase tracking-widest">Reparos</span>
            </button>
            <button 
              onClick={() => onQuickAdd('Outros')} 
              className="bg-white rounded-[2rem] p-6 border border-[#13312A]/5 shadow-sm hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center group-hover:bg-[#13312A] group-hover:text-[#C69A72] transition-colors"><Armchair size={18} /></div>
              <span className="text-[10px] font-bold text-[#13312A] uppercase tracking-widest">Móveis/Deco</span>
            </button>
        </div>

        {/* BENTO: HISTORY (MAIN LIST) */}
        <div className="col-span-12 lg:col-span-7 bg-white rounded-[2.5rem] p-8 border border-[#13312A]/5 shadow-sm">
           <div className="flex justify-between items-center mb-6 px-2">
              <h3 className="font-bold text-[#13312A] font-serif">Livro de Registros</h3>
              <Plus 
                size={18} 
                className="text-[#C69A72] cursor-pointer hover:scale-110 transition-transform" 
                onClick={() => onQuickAdd('')} 
              />
           </div>
           <div className="space-y-1">
              {houseTransactions.length === 0 ? (
                <div className="py-12 text-center text-gray-300 italic text-sm">Nenhum registro para esta residência.</div>
              ) : (
                houseTransactions.slice(0, 5).map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => onEditTransaction(t)} 
                    className="flex items-center justify-between p-4 hover:bg-[#F6E9CA]/30 rounded-2xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-[10px] font-bold text-gray-300 w-10">{formatDate(t.date)}</div>
                      <div className="font-bold text-[#13312A] text-sm">{t.subcategory || 'Despesa'}</div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="font-bold text-[#13312A] font-serif text-sm">{formatCurrency(t.amount)}</span>
                      <ArrowUpRight size={14} className="text-gray-200 group-hover:text-[#C69A72] transition-colors" />
                    </div>
                  </div>
                ))
              )}
           </div>
        </div>

      </div>
    </div>
  );
};
