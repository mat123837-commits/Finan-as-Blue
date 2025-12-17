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
  const { investments, transactions, debts, creditCards } = data;

  // 1. Calculate Net Worth
  const totalAssets = (data.initialBalance || 0) + investments.reduce((acc, inv) => acc + inv.amount, 0);
  
  const totalDebtsRemaining = debts.reduce((acc, d) => {
      const installmentVal = d.installmentValue || (d.totalValue / d.installmentsTotal);
      const remaining = d.totalValue - (installmentVal * d.installmentsPaid);
      return acc + Math.max(0, remaining);
  }, 0);
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Calculate current credit card liability (all pending transactions across all cards)
  const ccSpend = transactions
      .filter(t => t.type === 'expense' && t.paymentMethod === 'credit')
      .reduce((acc, t) => acc + t.amount, 0);
  
  // Total liabilities: Remaining parts of loans + everything charged to credit cards
  const totalLiabilities = totalDebtsRemaining + ccSpend;
  const netWorth = totalAssets - totalLiabilities;

  const chartData = [
      { name: 'Jan', value: netWorth * 0.85 },
      { name: 'Fev', value: netWorth * 0.88 },
      { name: 'Mar', value: netWorth * 0.92 },
      { name: 'Abr', value: netWorth * 0.90 }, 
      { name: 'Mai', value: netWorth * 0.96 },
      { name: 'Jun', value: netWorth },
  ];

  const reserve = investments.filter(i => i.type === 'reserve');
  const goals = investments.filter(i => i.type === 'goal');
  const others = investments.filter(i => !['reserve', 'goal'].includes(i.type));

  return (
    <div className="pb-32 animate-in slide-in-from-right duration-300 relative min-h-screen">
      
      {/* FAB */}
      <button 
        onClick={onAddInvestment}
        className="fixed bottom-28 right-6 w-14 h-14 bg-[#13312A] text-[#C69A72] rounded-full shadow-xl shadow-[#13312A]/30 flex items-center justify-center z-50 active:scale-90 transition-transform hover:bg-[#0f2620] md:hidden"
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
        <button onClick={onAddInvestment} className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#13312A] text-[#C69A72] rounded-xl text-sm font-bold">
           <Plus size={16} /> Novo Aporte
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">

          {/* 1. Net Worth Hero (Span 12/8) */}
          <div className="col-span-12 md:col-span-8 bg-[#13312A] rounded-[2.5rem] p-8 text-white shadow-xl shadow-[#13312A]/20 relative overflow-hidden flex flex-col justify-between h-80">
             <div className="absolute left-0 bottom-0 w-full h-48 opacity-30 pointer-events-none">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#C69A72" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#C69A72" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="value" stroke="#C69A72" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                </ResponsiveContainer>
             </div>
             
             <div className="relative z-10 flex justify-between items-start">
                 <div>
                     <div className="flex items-center gap-2 mb-2">
                         <div className="bg-white/10 p-1.5 rounded-lg">
                            <TrendingUp size={16} className="text-[#C69A72]" />
                         </div>
                         <span className="text-sm font-medium text-[#F6E9CA]">Patrimônio Líquido</span>
                     </div>
                     <h3 className="text-5xl font-bold tracking-tight font-serif">{formatCurrency(netWorth)}</h3>
                 </div>
             </div>

             <div className="relative z-10 flex gap-6">
                 <div>
                    <p className="text-[10px] text-[#F6E9CA] uppercase opacity-70">Ativos Totais</p>
                    <p className="font-bold text-[#155446] text-xl flex items-center gap-1 font-serif text-[#C69A72]">
                        <ArrowUpRight size={18} /> {formatCurrency(totalAssets)}
                    </p>
                 </div>
                 <div>
                    <p className="text-[10px] text-[#F6E9CA] uppercase opacity-70">Passivos Totais</p>
                    <p className="font-bold text-[#9F3E34] text-xl font-serif">{formatCurrency(totalLiabilities)}</p>
                 </div>
             </div>
          </div>

          {/* 2. Emergency Fund (Span 12/4) */}
          <div className="col-span-12 md:col-span-4 bg-white rounded-[2.5rem] p-6 border border-[#13312A]/5 shadow-sm flex flex-col">
             <h3 className="font-bold text-[#13312A] mb-6 px-1 flex items-center gap-2 font-serif">
                 <ShieldCheck size={20} className="text-[#155446]" /> Reserva de Emergência
             </h3>
             <div className="flex-1 flex flex-col justify-center">
                 {reserve.length > 0 ? reserve.map(r => {
                     const target = r.targetAmount || 15000;
                     const progress = (r.amount / target) * 100;
                     return (
                        <div key={r.id}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-[#13312A] text-2xl font-serif">{formatCurrency(r.amount)}</span>
                            </div>
                            <div className="h-4 w-full bg-[#F6E9CA] rounded-full overflow-hidden mb-3">
                                <div className="h-full bg-[#155446] rounded-full transition-all duration-1000" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                            </div>
                            <div className="flex justify-between text-xs text-[#155446] font-bold">
                                 <span>{(progress).toFixed(0)}% Concluído</span>
                                 <span>Meta: {formatCurrency(target)}</span>
                            </div>
                        </div>
                     )
                 }) : (
                     <div className="text-center py-4 text-[#155446] text-sm">
                         <p>Nenhuma reserva configurada.</p>
                         <button onClick={onAddInvestment} className="text-[#C69A72] font-bold mt-2">Configurar</button>
                     </div>
                 )}
             </div>
          </div>

          {/* 3. Goals (Span 6) */}
          <div className="col-span-12 md:col-span-6 bg-[#FFFDF5] rounded-[2.5rem] p-6 border border-[#13312A]/5 shadow-sm">
              <h3 className="font-bold text-[#13312A] mb-4 flex items-center gap-2 font-serif">
                 <Target size={18} className="text-[#9F3E34]" /> Metas & Sonhos
              </h3>
              <div className="grid grid-cols-2 gap-3">
                 {goals.map(g => {
                     const target = g.targetAmount || 1;
                     const progress = (g.amount / target) * 100;
                     return (
                         <div key={g.id} className="bg-white p-4 rounded-3xl shadow-sm border border-[#13312A]/5 flex flex-col justify-between h-32 relative overflow-hidden">
                             <div className="w-8 h-8 rounded-full bg-[#9F3E34]/10 text-[#9F3E34] flex items-center justify-center mb-2 relative z-10">
                                 <Target size={14} />
                             </div>
                             <div className="relative z-10">
                                 <p className="font-bold text-[#13312A] text-sm truncate">{g.name}</p>
                                 <p className="text-xs text-[#155446] font-serif">{formatCurrency(g.amount)}</p>
                             </div>
                             <div className="absolute bottom-0 left-0 h-1.5 bg-[#9F3E34]" style={{ width: `${Math.min(progress, 100)}%`}}></div>
                         </div>
                     )
                 })}
                 <button onClick={onAddInvestment} className="bg-white border-2 border-dashed border-[#13312A]/10 rounded-3xl flex flex-col items-center justify-center text-[#155446] h-32 hover:bg-[#F6E9CA] transition-colors">
                     <Plus size={24} className="mb-1" />
                     <span className="text-xs font-bold">Nova Meta</span>
                 </button>
              </div>
          </div>

          {/* 4. Others (Span 6) */}
          <div className="col-span-12 md:col-span-6 bg-[#FFFDF5] rounded-[2.5rem] p-6 border border-[#13312A]/5 shadow-sm">
             <h3 className="font-bold text-[#13312A] mb-4 font-serif">Outros Investimentos</h3>
             <div className="space-y-3">
                 {others.length === 0 ? (
                     <div className="flex items-center justify-center h-full text-[#155446] text-sm">
                         Nenhum outro investimento.
                     </div>
                 ) : (
                     others.map(inv => (
                         <div key={inv.id} className="bg-white p-4 rounded-3xl shadow-sm border border-[#13312A]/5 flex items-center justify-between">
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

      </div>
    </div>
  );
};