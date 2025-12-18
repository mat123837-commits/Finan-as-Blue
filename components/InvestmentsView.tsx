
import React from 'react';
import { AppData, Investment } from '../types';
import { formatCurrency } from '../constants';
import { TrendingUp, ShieldCheck, Target, Plus, PiggyBank, Menu, Edit3, PieChart, Wallet, ArrowUpRight } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { AnimatedNumber } from './AnimatedNumber';

interface InvestmentsViewProps {
  data: AppData;
  onAddInvestment: (type?: Investment['type']) => void;
  onEditInvestment: (inv: Investment) => void;
  onOpenSidebar: () => void;
}

export const InvestmentsView: React.FC<InvestmentsViewProps> = ({ data, onAddInvestment, onEditInvestment, onOpenSidebar }) => {
  const { investments = [], transactions = [], debts = [], showValues } = data;
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalInvested = investments.reduce((acc, inv) => acc + (Number(inv.amount) || 0), 0);
  const currentLiquidity = (transactions.filter(t => t.type === 'income' && !t.isBenefit).reduce((acc, t) => acc + t.amount, 0)) - 
                           (transactions.filter(t => t.type === 'expense' && t.paymentMethod !== 'credit').reduce((acc, t) => acc + t.amount, 0)) + 
                           (Number(data.initialBalance) || 0);
  
  const totalAssets = currentLiquidity + totalInvested;
  const totalLiabilities = debts.reduce((acc, d) => acc + (Math.max(0, Number(d.totalValue) - ((Number(d.installmentValue) || (Number(d.totalValue)/Number(d.installmentsTotal))) * Number(d.installmentsPaid)))), 0);
  const netWorth = totalAssets - totalLiabilities;

  const pieData = investments.length > 0 ? investments.map(inv => ({
    name: inv.name,
    value: inv.amount,
    color: inv.color || '#13312A'
  })) : [{ name: 'Saldo', value: currentLiquidity, color: '#13312A' }];

  return (
    <div className="pb-32 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onOpenSidebar} className="p-2 bg-white rounded-xl shadow-sm text-[#13312A]"><Menu size={22} /></button>
          <h2 className="text-2xl font-bold text-[#13312A] font-serif">Patrimônio</h2>
        </div>
        <button onClick={() => onAddInvestment('fixed')} className="p-3 bg-[#13312A] text-[#C69A72] rounded-2xl hover:scale-105 transition-all shadow-lg shadow-[#13312A]/20">
          <Plus size={20} />
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4">
        
        {/* BENTO: PATRIMÔNIO LÍQUIDO (MAIN) */}
        <div className="col-span-12 lg:col-span-6 bg-[#13312A] rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden flex flex-col justify-center min-h-[260px]">
           <div className="absolute top-0 right-0 w-48 h-48 bg-[#C69A72]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
           <span className="text-[10px] font-bold text-[#C69A72] uppercase tracking-[0.4em] mb-4">Patrimônio Consolidado</span>
           <div className="text-6xl font-bold font-serif tracking-tighter">
              <AnimatedNumber value={netWorth} showValues={showValues} className="text-white" />
           </div>
           <div className="mt-8 flex gap-8">
              <div>
                <p className="text-[9px] font-bold text-[#C69A72] uppercase mb-1">Total Ativos</p>
                <p className="font-bold font-serif text-lg">{formatCurrency(totalAssets)}</p>
              </div>
              <div className="w-px h-8 bg-white/10"></div>
              <div>
                <p className="text-[9px] font-bold text-rose-400 uppercase mb-1">Total Passivos</p>
                <p className="font-bold font-serif text-lg">{formatCurrency(totalLiabilities)}</p>
              </div>
           </div>
        </div>

        {/* BENTO: ALOCAÇÃO (CHART) */}
        <div className="col-span-12 lg:col-span-6 bg-white rounded-[2.5rem] p-8 border border-[#13312A]/5 shadow-sm flex items-center justify-between">
            <div className="flex-1">
                <h3 className="font-bold text-[#13312A] font-serif text-lg mb-2">Alocação</h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-[200px]">Distribuição atual dos seus investimentos e liquidez.</p>
                <button onClick={() => onAddInvestment('fixed')} className="mt-6 flex items-center gap-2 text-xs font-bold text-[#13312A] uppercase tracking-widest hover:text-[#C69A72] transition-colors">
                  Aportar <ArrowUpRight size={14} />
                </button>
            </div>
            <div className="w-40 h-40 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={65} paddingAngle={4} dataKey="value" stroke="none">
                            {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                    </RechartsPieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* BENTO: LIQUIDEZ (SQUARE) */}
        <div className="col-span-6 lg:col-span-3 bg-[#F6E9CA] rounded-[2.5rem] p-6 shadow-inner flex flex-col justify-between min-h-[160px]">
            <div className="w-10 h-10 rounded-xl bg-[#13312A] text-[#C69A72] flex items-center justify-center"><Wallet size={20} /></div>
            <div>
              <p className="text-[9px] font-bold text-[#155446]/60 uppercase tracking-widest mb-1">Liquidez Imediata</p>
              <div className="text-xl font-bold text-[#13312A] font-serif">{formatCurrency(currentLiquidity)}</div>
            </div>
        </div>

        {/* BENTO: RESERVA (SQUARE) */}
        <div className="col-span-6 lg:col-span-3 bg-white rounded-[2.5rem] p-6 border border-[#13312A]/5 shadow-sm flex flex-col justify-between min-h-[160px]">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><ShieldCheck size={20} /></div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Reserva Emerg.</p>
              <div className="text-xl font-bold text-[#13312A] font-serif">
                {formatCurrency(investments.find(i => i.type === 'reserve')?.amount || 0)}
              </div>
            </div>
        </div>

        {/* BENTO: METAS DE CURTO PRAZO (WIDE) */}
        <div className="col-span-12 lg:col-span-6 bg-white rounded-[2.5rem] p-8 border border-[#13312A]/5 shadow-sm">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[#13312A] font-serif flex items-center gap-2"><Target size={18} className="text-rose-500" /> Metas Ativas</h3>
              <Plus size={16} className="text-[#C69A72] cursor-pointer" onClick={() => onAddInvestment('goal')} />
           </div>
           <div className="space-y-4">
              {investments.filter(i => i.type === 'goal').slice(0, 2).map(goal => {
                const progress = goal.targetAmount ? (goal.amount / goal.targetAmount) * 100 : 0;
                return (
                  <div key={goal.id} onClick={() => onEditInvestment(goal)} className="cursor-pointer group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-[#13312A]">{goal.name}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-50 rounded-full overflow-hidden">
                      <div className="h-full bg-[#13312A] rounded-full group-hover:bg-[#C69A72] transition-all" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                    </div>
                  </div>
                );
              })}
              {investments.filter(i => i.type === 'goal').length === 0 && <p className="text-xs text-gray-300 italic">Nenhum objetivo cadastrado.</p>}
           </div>
        </div>

      </div>
    </div>
  );
};
