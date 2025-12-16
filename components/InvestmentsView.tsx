import React from 'react';
import { AppData, Investment } from '../types';
import { formatCurrency, COLORS } from '../constants';
import { TrendingUp, ShieldCheck, Target, ArrowUpRight, Plus, Wallet, PiggyBank, Menu } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

interface InvestmentsViewProps {
  data: AppData;
  onAddInvestment: () => void;
  onOpenSidebar: () => void;
}

export const InvestmentsView: React.FC<InvestmentsViewProps> = ({ data, onAddInvestment, onOpenSidebar }) => {
  const { investments, transactions, debts, creditCard } = data;

  // 1. Calculate Net Worth
  const totalAssets = (data.initialBalance || 0) + investments.reduce((acc, inv) => acc + inv.amount, 0);
  
  // Estimate current liability (Debts remaining + current CC invoice)
  const totalDebtsRemaining = debts.reduce((acc, d) => {
      const remaining = d.totalValue * (1 - (d.installmentsPaid / d.installmentsTotal));
      return acc + remaining;
  }, 0);
  
  // Current month CC spend
  const now = new Date();
  const ccSpend = transactions
      .filter(t => t.type === 'expense' && t.paymentMethod === 'credit' && new Date(t.date).getMonth() === now.getMonth())
      .reduce((acc, t) => acc + t.amount, 0);
  
  const totalLiabilities = totalDebtsRemaining + ccSpend + (creditCard.initialInvoiceOffset || 0);
  const netWorth = totalAssets - totalLiabilities;

  // Mock Data for Chart (Evolution)
  const chartData = [
      { name: 'Jan', value: netWorth * 0.85 },
      { name: 'Fev', value: netWorth * 0.88 },
      { name: 'Mar', value: netWorth * 0.92 },
      { name: 'Abr', value: netWorth * 0.90 }, // Dip
      { name: 'Mai', value: netWorth * 0.96 },
      { name: 'Jun', value: netWorth },
  ];

  // Group Investments
  const reserve = investments.filter(i => i.type === 'reserve');
  const goals = investments.filter(i => i.type === 'goal');
  const others = investments.filter(i => !['reserve', 'goal'].includes(i.type));

  const totalReserve = reserve.reduce((acc, i) => acc + i.amount, 0);

  return (
    <div className="pb-32 animate-in slide-in-from-right duration-300 relative min-h-screen">
      
      {/* FAB - Adjusted for Navigation bar height */}
      <button 
        onClick={onAddInvestment}
        className="fixed bottom-28 right-6 w-14 h-14 bg-[#13312A] text-[#C69A72] rounded-full shadow-xl shadow-[#13312A]/30 flex items-center justify-center z-50 active:scale-90 transition-transform hover:bg-[#0f2620]"
      >
        <Plus size={32} />
      </button>

       <div className="flex items-center justify-between mb-6 pt-4">
        <div className="flex items-center gap-3">
             <button onClick={onOpenSidebar} className="p-2 bg-[#FFFDF5] rounded-full shadow-sm text-[#13312A] active:scale-95 transition-transform">
                <Menu size={20} />
             </button>
            <h2 className="text-2xl font-bold text-[#13312A] font-serif">Patrimônio</h2>
        </div>
      </div>

      {/* Net Worth Card */}
      <div className="bg-[#13312A] rounded-3xl p-6 text-white shadow-xl shadow-[#13312A]/20 mb-8 relative overflow-hidden">
         <div className="absolute left-0 bottom-0 w-full h-32 opacity-20 pointer-events-none">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                    <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C69A72" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#C69A72" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="value" stroke="#C69A72" strokeWidth={2} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
            </ResponsiveContainer>
         </div>
         
         <div className="relative z-10">
             <div className="flex items-center gap-2 mb-1">
                 <div className="bg-white/10 p-1.5 rounded-lg">
                    <TrendingUp size={16} className="text-[#C69A72]" />
                 </div>
                 <span className="text-sm font-medium text-[#F6E9CA]">Patrimônio Líquido</span>
             </div>
             <h3 className="text-4xl font-bold tracking-tight mb-2 font-serif">{formatCurrency(netWorth)}</h3>
             <div className="flex gap-4 mt-4">
                 <div>
                    <p className="text-[10px] text-[#F6E9CA] uppercase">Ativos Totais</p>
                    <p className="font-bold text-[#155446] text-sm flex items-center gap-1 font-serif text-[#C69A72]">
                        <ArrowUpRight size={12} /> {formatCurrency(totalAssets)}
                    </p>
                 </div>
                 <div>
                    <p className="text-[10px] text-[#F6E9CA] uppercase">Passivos Totais</p>
                    <p className="font-bold text-[#9F3E34] text-sm font-serif">{formatCurrency(totalLiabilities)}</p>
                 </div>
             </div>
         </div>
      </div>

      {/* Emergency Fund */}
      <div className="mb-8">
          <h3 className="font-bold text-[#13312A] mb-3 px-1 flex items-center gap-2 font-serif">
             <ShieldCheck size={18} className="text-[#155446]" /> Reserva de Emergência
          </h3>
          <div className="bg-[#FFFDF5] p-5 rounded-3xl shadow-sm border border-[#13312A]/10">
             {reserve.length > 0 ? reserve.map(r => {
                 const target = r.targetAmount || 15000; // Default target
                 const progress = (r.amount / target) * 100;
                 return (
                    <div key={r.id}>
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-[#13312A]">{r.name}</span>
                            <span className="font-bold text-[#13312A] font-serif">{formatCurrency(r.amount)}</span>
                        </div>
                        <div className="h-3 w-full bg-[#F6E9CA] rounded-full overflow-hidden mb-1">
                            <div className="h-full bg-[#155446] rounded-full transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                        </div>
                        <div className="flex justify-between text-xs text-[#155446]">
                             <span>{(progress).toFixed(0)}% da meta</span>
                             <span>Meta: {formatCurrency(target)}</span>
                        </div>
                    </div>
                 )
             }) : (
                 <div className="text-center py-4 text-[#155446] text-sm">
                     <p>Nenhuma reserva configurada.</p>
                 </div>
             )}
          </div>
      </div>

      {/* Goals */}
      <div className="mb-8">
          <h3 className="font-bold text-[#13312A] mb-3 px-1 flex items-center gap-2 font-serif">
             <Target size={18} className="text-[#9F3E34]" /> Metas & Sonhos
          </h3>
          <div className="grid grid-cols-2 gap-3">
             {goals.map(g => {
                 const target = g.targetAmount || 1;
                 const progress = (g.amount / target) * 100;
                 return (
                     <div key={g.id} className="bg-[#FFFDF5] p-4 rounded-3xl shadow-sm border border-[#13312A]/10 flex flex-col justify-between h-32">
                         <div className="w-8 h-8 rounded-full bg-[#9F3E34]/10 text-[#9F3E34] flex items-center justify-center mb-2">
                             <Target size={14} />
                         </div>
                         <div>
                             <p className="font-bold text-[#13312A] text-sm truncate">{g.name}</p>
                             <p className="text-xs text-[#155446] font-serif">{formatCurrency(g.amount)}</p>
                         </div>
                         <div className="w-full bg-[#F6E9CA] h-1.5 rounded-full mt-2">
                             <div className="h-full bg-[#9F3E34] rounded-full" style={{ width: `${Math.min(progress, 100)}%`}}></div>
                         </div>
                     </div>
                 )
             })}
             <button onClick={onAddInvestment} className="bg-[#F6E9CA]/50 border-2 border-dashed border-[#13312A]/20 rounded-3xl flex flex-col items-center justify-center text-[#155446] h-32 hover:bg-[#F6E9CA] transition-colors">
                 <Plus size={24} className="mb-1" />
                 <span className="text-xs font-bold">Nova Meta</span>
             </button>
          </div>
      </div>

      {/* Other Investments List */}
      <div className="space-y-3">
         <h3 className="font-bold text-[#13312A] px-1 font-serif">Investimentos Diversos</h3>
         {others.length === 0 ? (
             <p className="text-[#155446] text-sm px-2">Nenhum outro investimento.</p>
         ) : (
             others.map(inv => (
                 <div key={inv.id} className="bg-[#FFFDF5] p-4 rounded-3xl shadow-sm border border-[#13312A]/10 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-2xl bg-[#155446]/10 text-[#155446] flex items-center justify-center">
                             <PiggyBank size={20} />
                         </div>
                         <div>
                             <p className="font-bold text-[#13312A]">{inv.name}</p>
                             <p className="text-xs text-[#155446] capitalize">{inv.type === 'fixed' ? 'Renda Fixa' : 'Renda Variável'}</p>
                         </div>
                     </div>
                     <span className="font-bold text-[#13312A] font-serif">{formatCurrency(inv.amount)}</span>
                 </div>
             ))
         )}
      </div>

    </div>
  );
};