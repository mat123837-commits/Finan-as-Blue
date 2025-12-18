
import React from 'react';
import { Eye, EyeOff, Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, Calendar, CreditCard, Home, Car, Heart, Search, Filter, Activity, Utensils } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar, Cell } from 'recharts';
import { AppData, Transaction } from '../types';
import { formatCurrency, formatDate, COLORS } from '../constants';
import { AnimatedNumber } from './AnimatedNumber';

interface DashboardProps {
  data: AppData;
  togglePrivacy: () => void;
  onNavigate: (tab: string) => void;
  onOpenSidebar: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, togglePrivacy, onNavigate }) => {
  const { transactions, showValues, userName, creditCards } = data;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const totalIncome = transactions
    .filter(t => t.type === 'income' && !t.isBenefit)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpensesDebit = transactions
    .filter(t => t.type === 'expense' && t.paymentMethod !== 'credit')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const netBalance = totalIncome - totalExpensesDebit + (data.initialBalance || 0);
  
  const benefitIncome = transactions
    .filter(t => t.type === 'income' && t.isBenefit)
    .reduce((acc, curr) => acc + curr.amount, 0);
  const benefitBalance = benefitIncome + (data.initialBenefitBalance || 0);

  const creditExpensesTotal = transactions
    .filter(t => t.type === 'expense' && t.paymentMethod === 'credit')
    .filter(t => {
       const d = new Date(t.date);
       return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, t) => acc + t.amount, 0);
  
  const currentInvoiceValue = creditExpensesTotal;
  const creditLimit = creditCards.reduce((acc, card) => acc + card.limit, 0);
  const limitPercent = creditLimit > 0 ? (currentInvoiceValue / creditLimit) * 100 : 0;
  const mainCard = creditCards.length > 0 ? creditCards[0] : null;

  const monthlyRealizedIncome = transactions
    .filter(t => t.type === 'income' && !t.isBenefit && new Date(t.date).getMonth() === currentMonth && new Date(t.date).getFullYear() === currentYear)
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingFixedExpenses = (data.fixedExpenses || []).reduce((acc, expense) => acc + expense.amount, 0); 
  const forecastedFreeBalance = netBalance - currentInvoiceValue - pendingFixedExpenses;
  const totalCommitted = currentInvoiceValue + pendingFixedExpenses;
  const commitmentRate = monthlyRealizedIncome > 0 ? (totalCommitted / monthlyRealizedIncome) * 100 : 0;

  const chartData = Array.from({ length: 12 }).map((_, i) => {
     const date = new Date(currentYear, i, 1);
     const monthLabel = date.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase();
     const income = transactions
        .filter(t => t.type === 'income' && new Date(t.date).getMonth() === i && new Date(t.date).getFullYear() === currentYear)
        .reduce((acc, t) => acc + t.amount, 0);
     const expense = transactions
        .filter(t => t.type === 'expense' && new Date(t.date).getMonth() === i && new Date(t.date).getFullYear() === currentYear)
        .reduce((acc, t) => acc + t.amount, 0);
     return { name: monthLabel, Receitas: income, Despesas: expense };
  });

  const recentTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

  const calcCatTotal = (key: string) => transactions.filter(t => t.category === key && t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const carTotal = calcCatTotal('car');
  const houseTotal = calcCatTotal('house');
  const partnerTotal = calcCatTotal('partner');

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700 min-h-full pb-10">
      <div className="grid grid-cols-12 gap-6 h-auto min-h-[180px]">
         <div className="col-span-12 md:col-span-5 bg-[#13312A] rounded-[2.5rem] p-8 text-[#F6E9CA] relative overflow-hidden flex flex-col justify-between shadow-xl shadow-[#13312A]/10 group transition-all hover:shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#C69A72]/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#C69A72]/20 transition-all duration-700"></div>
            <div className="relative z-10">
               <div className="flex justify-between items-start mb-1">
                  <div>
                    <p className="text-sm font-medium opacity-80 flex items-center gap-2">
                       <Activity size={16} /> Liquidez Prevista
                    </p>
                    <p className="text-[10px] text-[#C69A72] uppercase tracking-wider font-bold opacity-80 mt-1">Livre para gastar</p>
                  </div>
                  <button onClick={togglePrivacy} className="p-3 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                      {showValues ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
               </div>
               <div className="mt-4">
                  <AnimatedNumber 
                    value={forecastedFreeBalance} 
                    showValues={showValues}
                    className={`text-5xl font-bold font-serif tracking-tight ${forecastedFreeBalance < 0 ? 'text-[#ff8a80]' : 'text-[#F6E9CA]'}`} 
                  />
               </div>
            </div>
            <div className="relative z-10 mt-6">
               <div className="flex justify-between text-xs font-bold text-[#F6E9CA] mb-2 opacity-80">
                  <span>Renda Comprometida</span>
                  <span>{commitmentRate > 100 ? 100 : commitmentRate.toFixed(0)}%</span>
               </div>
               <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-1000 ${commitmentRate > 80 ? 'bg-[#ff8a80]' : 'bg-[#C69A72]'}`} style={{ width: `${Math.min(commitmentRate, 100)}%` }}></div>
               </div>
               <p className="text-[10px] text-[#F6E9CA]/50 mt-2 leading-tight">Saldo atual - (Faturas Abertas + Gastos Fixos).</p>
            </div>
         </div>

         <div className="col-span-12 md:col-span-4 bg-white rounded-[2.5rem] p-6 border border-[#13312A]/5 flex flex-col justify-between shadow-sm relative overflow-hidden">
             <div className="absolute right-0 top-0 p-6 opacity-5 text-[#13312A]"><Wallet size={100} /></div>
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-2">
                   <div>
                      <h3 className="text-lg font-bold text-[#13312A] font-serif">Saldo em Conta</h3>
                      <p className="text-xs text-[#155446]">Balanço atual</p>
                   </div>
                   <div className="p-2 rounded-full bg-[#13312A]/5 text-[#13312A]"><Wallet size={20} /></div>
                </div>
                <div className="mb-6">
                   <AnimatedNumber value={netBalance} showValues={showValues} className="text-3xl font-bold font-serif text-[#13312A]" />
                </div>
                <div className="bg-[#F6E9CA]/30 p-3 rounded-2xl border border-[#13312A]/5 flex items-center justify-between">
                   <div>
                      <p className="text-[10px] uppercase font-bold text-[#155446]">Benefícios (VA/VR)</p>
                      <AnimatedNumber value={benefitBalance} showValues={showValues} className="text-sm font-bold font-mono text-[#13312A]" />
                   </div>
                   <div className="bg-white p-2 rounded-xl text-[#C69A72]"><Utensils size={16} /></div>
                </div>
             </div>
         </div>

         <div onClick={() => onNavigate('cards')} className="col-span-12 md:col-span-3 bg-white rounded-[2.5rem] p-6 border border-[#13312A]/5 shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden flex flex-col">
             <div className="flex justify-between items-center mb-4 relative z-10">
                <div className="w-10 h-10 rounded-2xl bg-[#F6E9CA] text-[#13312A] flex items-center justify-center"><CreditCard size={20} /></div>
                <span className="text-xs font-bold text-[#155446] bg-[#F6E9CA]/50 px-2 py-1 rounded-lg">{mainCard ? `Fecha dia ${mainCard.closingDay}` : 'Sem cartões'}</span>
             </div>
             <div className="flex-1 flex flex-col justify-end relative z-10">
                <p className="text-xs text-[#155446] font-bold uppercase mb-1">Total de Faturas</p>
                <div className="mb-4">
                   <AnimatedNumber value={currentInvoiceValue} showValues={showValues} className="text-3xl font-bold text-[#13312A] font-serif" />
                </div>
                <div className="w-full bg-[#F6E9CA] h-3 rounded-full overflow-hidden">
                   <div className={`h-full rounded-full transition-all duration-1000 ${limitPercent > 90 ? 'bg-[#9F3E34]' : 'bg-[#13312A]'}`} style={{ width: `${Math.min(limitPercent, 100)}%` }}></div>
                </div>
                <div className="flex justify-between mt-2 text-[10px] font-bold text-[#155446]/60"><span>Limite Total: {formatCurrency(creditLimit)}</span></div>
             </div>
         </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
         <div className="col-span-12 md:col-span-8 bg-white rounded-[2.5rem] p-8 border border-[#13312A]/5 shadow-sm min-h-[400px] flex flex-col">
            <div className="flex justify-between items-center mb-8">
               <h3 className="text-2xl font-bold text-[#13312A] font-serif">Evolução Financeira</h3>
               <div className="flex gap-2">
                  <span className="flex items-center gap-1 text-xs font-bold text-[#155446]"><span className="w-2 h-2 rounded-full bg-[#155446]"></span> Receitas</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-[#9F3E34]"><span className="w-2 h-2 rounded-full bg-[#9F3E34]"></span> Despesas</span>
               </div>
            </div>
            <div className="flex-1">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#155446" stopOpacity={0.1}/><stop offset="95%" stopColor="#155446" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#9F3E34" stopOpacity={0.1}/><stop offset="95%" stopColor="#9F3E34" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12, fontWeight: 500 }} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 11 }} tickFormatter={(val) => `R$${val/1000}k`} />
                     <RechartsTooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} formatter={(val: number) => formatCurrency(val)} />
                     <Area type="monotone" dataKey="Receitas" stroke="#155446" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                     <Area type="monotone" dataKey="Despesas" stroke="#9F3E34" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>
         <div className="col-span-12 md:col-span-4 flex flex-col gap-4">
            <div onClick={() => onNavigate('house-details')} className="flex-1 bg-white rounded-[2rem] p-5 border border-[#13312A]/5 shadow-sm hover:shadow-md transition-all cursor-pointer group">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Home size={24} /></div>
                  <div>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Casa</p>
                     <AnimatedNumber value={houseTotal} showValues={showValues} className="text-xl font-bold text-[#13312A] font-serif" />
                  </div>
               </div>
            </div>
            <div onClick={() => onNavigate('car-details')} className="flex-1 bg-white rounded-[2rem] p-5 border border-[#13312A]/5 shadow-sm hover:shadow-md transition-all cursor-pointer group">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Car size={24} /></div>
                  <div>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Carro</p>
                     <AnimatedNumber value={carTotal} showValues={showValues} className="text-xl font-bold text-[#13312A] font-serif" />
                  </div>
               </div>
            </div>
            <div onClick={() => onNavigate('partner-details')} className="flex-1 bg-white rounded-[2rem] p-5 border border-[#13312A]/5 shadow-sm hover:shadow-md transition-all cursor-pointer group">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform"><Heart size={24} /></div>
                  <div>
                     <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Relacionamento</p>
                     <AnimatedNumber value={partnerTotal} showValues={showValues} className="text-xl font-bold text-[#13312A] font-serif" />
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="bg-white rounded-[2.5rem] p-8 border border-[#13312A]/5 shadow-sm">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-bold text-[#13312A] font-serif">Últimos Lançamentos</h3>
             <div className="flex gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"><Filter size={14} /> Filtrar</button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"><Search size={14} /> Buscar</button>
             </div>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="text-xs text-gray-400 uppercase border-b border-gray-100">
                      <th className="py-3 font-bold pl-4">Categoria</th><th className="py-3 font-bold">Descrição</th><th className="py-3 font-bold">Data</th><th className="py-3 font-bold">Método</th><th className="py-3 font-bold text-right pr-4">Valor</th>
                   </tr>
                </thead>
                <tbody>
                   {recentTransactions.map((t) => (
                      <tr key={t.id} className="group hover:bg-[#F6E9CA]/20 transition-colors">
                         <td className="py-4 pl-4">
                            <div className="flex items-center gap-3">
                               <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-white group-hover:shadow-sm transition-all">
                                  {t.category === 'car' && <Car size={16} />}{t.category === 'house' && <Home size={16} />}{t.category === 'partner' && <Heart size={16} />}{t.category === 'others' && <Wallet size={16} />}{t.category === 'debt' && <TrendingDown size={16} />}
                               </div>
                               <span className="text-sm font-medium text-[#13312A] capitalize">{t.category}</span>
                            </div>
                         </td>
                         <td className="py-4 text-sm text-gray-600 font-medium">{t.description || t.subcategory || 'Sem descrição'}</td>
                         <td className="py-4 text-sm text-gray-400 font-mono">{formatDate(t.date)}</td>
                         <td className="py-4 text-xs font-bold"><span className={`px-2 py-1 rounded-md ${t.paymentMethod === 'credit' ? 'bg-purple-50 text-purple-600' : 'bg-emerald-50 text-emerald-600'}`}>{t.paymentMethod === 'credit' ? 'Crédito' : 'Débito'}</span></td>
                         <td className="py-4 pr-4 text-right"><span className={`font-bold font-mono ${t.type === 'income' ? 'text-emerald-600' : 'text-[#13312A]'}`}>{t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}</span></td>
                      </tr>
                   ))}
                </tbody>
             </table>
             {recentTransactions.length === 0 && <div className="text-center py-12 text-gray-400">Nenhum lançamento encontrado.</div>}
          </div>
      </div>
    </div>
  );
};
