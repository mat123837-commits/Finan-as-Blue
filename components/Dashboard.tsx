import React from 'react';
import { Eye, EyeOff, Menu, Wallet, BarChart3, CreditCard, Landmark, TrendingUp, Home, Car, Heart, Ticket, CalendarClock, PieChart } from 'lucide-react';
import { ResponsiveContainer, XAxis, BarChart, Bar, Tooltip as RechartsTooltip, CartesianGrid, Cell } from 'recharts';
import { AppData } from '../types';
import { COLORS, formatCurrency } from '../constants';

interface DashboardProps {
  data: AppData;
  togglePrivacy: () => void;
  onNavigate: (tab: string) => void;
  onOpenSidebar: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ data, togglePrivacy, onNavigate, onOpenSidebar }) => {
  const { transactions, showValues, userName, debts, fixedExpenses } = data;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const isInCurrentMonth = (dateStr: string) => {
    const [year, month] = dateStr.split('-').map(Number);
    return year === currentYear && (month - 1) === currentMonth;
  };

  // --- 1. CALCULO DE SALDOS (LIQUIDEZ) ---
  const totalIncome = transactions
    .filter(t => t.type === 'income' && !t.isBenefit)
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpensesDebit = transactions
    .filter(t => t.type === 'expense' && t.paymentMethod !== 'credit')
    .reduce((acc, curr) => acc + curr.amount, 0);

  // Saldo em Conta Real (Sem Benefícios)
  const netBalance = totalIncome - totalExpensesDebit + (data.initialBalance || 0);

  // Saldo Benefícios (Separado)
  const benefitIncome = transactions
    .filter(t => t.type === 'income' && t.isBenefit)
    .reduce((acc, curr) => acc + curr.amount, 0);
  const benefitBalance = benefitIncome + (data.initialBenefitBalance || 0);

  // --- 2. CARTÃO DE CRÉDITO ---
  const creditExpensesCurrentMonth = transactions
    .filter(t => t.type === 'expense' && t.paymentMethod === 'credit' && isInCurrentMonth(t.date))
    .reduce((acc, t) => acc + t.amount, 0);
  
  const currentInvoiceValue = creditExpensesCurrentMonth + (data.creditCard?.initialInvoiceOffset || 0);
  const creditLimit = data.creditCard?.limit || 0;
  
  // Future credit usage
  const allFutureCredit = transactions
     .filter(t => t.type === 'expense' && t.paymentMethod === 'credit' && new Date(t.date) >= new Date(currentYear, currentMonth, 1))
     .reduce((acc, t) => acc + t.amount, 0);
  const limitUsed = (data.creditCard?.initialInvoiceOffset || 0) + allFutureCredit;
  const limitPercent = creditLimit > 0 ? (limitUsed / creditLimit) * 100 : 0;

  // --- 3. EMPRÉSTIMOS (MENSAL) ---
  const monthlyLoanCommitment = debts.reduce((acc, debt) => {
    if (debt.installmentsPaid >= debt.installmentsTotal) return acc;
    return acc + (debt.installmentValue || (debt.totalValue / debt.installmentsTotal));
  }, 0);
  const activeLoansCount = debts.filter(d => d.installmentsPaid < d.installmentsTotal).length;

  // --- 4. GASTOS FIXOS INTELIGENTES (SMART RECURRING) ---
  const pendingFixedExpenses = (fixedExpenses || []).reduce((acc, expense) => {
    const isPaid = transactions.some(t => {
       if (!isInCurrentMonth(t.date) || t.type !== 'expense') return false;
       const margin = expense.amount * 0.01;
       const diff = Math.abs(t.amount - expense.amount);
       return diff <= margin;
    });
    return isPaid ? acc : acc + expense.amount;
  }, 0);

  // --- 5. LÓGICA DE PREVISÃO DE LIQUIDEZ ---
  const rentPaid = transactions
    .filter(t => t.category === 'house' && (t.subcategory || '').includes('Aluguel') && isInCurrentMonth(t.date))
    .reduce((acc, t) => acc + t.amount, 0);
  
  const pendingRent = Math.max(0, (data.house?.rentAmount || 0) - rentPaid);
  
  // Forecast
  const forecastedFreeBalance = netBalance - currentInvoiceValue - pendingRent - monthlyLoanCommitment - pendingFixedExpenses;
  const isForecastNegative = forecastedFreeBalance < 0;

  // --- CHART DATA FOR LIQUIDITY ---
  const liquidityChartData = [
      { name: 'Fatura', value: currentInvoiceValue, color: '#C69A72', labelColor: '#F6E9CA' }, // Brown
      { name: 'Dívidas', value: monthlyLoanCommitment, color: '#9F3E34', labelColor: '#F6E9CA' }, // Muted Red
      { name: 'Fixos', value: pendingFixedExpenses + pendingRent, color: 'rgba(246, 233, 202, 0.4)', labelColor: '#F6E9CA' }, // Translucent Cream
      { name: 'Livre', value: Math.max(0, forecastedFreeBalance), color: '#F6E9CA', labelColor: '#13312A' } // Solid Cream
  ].filter(item => item.value > 0);

  // --- 6. DADOS PARA GRÁFICO ---
  const trendData = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    const month = d.getMonth();
    const year = d.getFullYear();
    const monthLabel = d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');

    const monthIncome = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'income' && !t.isBenefit && tDate.getMonth() === month && tDate.getFullYear() === year;
      })
      .reduce((acc, t) => acc + t.amount, 0);

    const monthExpense = transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && tDate.getMonth() === month && tDate.getFullYear() === year;
      })
      .reduce((acc, t) => acc + t.amount, 0);

    return {
      name: monthLabel,
      Entradas: monthIncome,
      Saídas: monthExpense
    };
  });

  // Category Progress List
  const calculateCategoryTotal = (key: string) => 
    transactions.filter(t => t.category === key && t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);

  const catProgress = [
    { key: 'house', name: 'Casa', total: calculateCategoryTotal('house'), color: COLORS.accent },
    { key: 'car', name: 'Carro', total: calculateCategoryTotal('car'), color: COLORS.secondary },
    { key: 'partner', name: 'Relacionamento', total: calculateCategoryTotal('partner'), color: COLORS.danger },
  ];
  const maxExpense = Math.max(...catProgress.map(c => c.total), 500);

  return (
    <div className="pb-32 animate-in fade-in duration-500">
      
      {/* Header - Clean iOS Style */}
      <header className="flex justify-between items-center mb-8 pt-4">
        <div className="flex items-center gap-4">
          <button 
            onClick={onOpenSidebar} 
            className="w-10 h-10 bg-[#FFFDF5] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#13312A]/10 flex items-center justify-center text-[#13312A] active:scale-95 transition-all hover:bg-white/80"
          >
             <Menu size={20} strokeWidth={2.5} />
          </button>
          <div className="flex flex-col justify-center">
            <span className="text-[10px] font-bold text-[#155446] uppercase tracking-widest leading-none mb-1">Visão Geral</span>
            <h1 className="text-2xl font-bold text-[#13312A] leading-none font-serif">{userName}</h1>
          </div>
        </div>
        <button 
          onClick={togglePrivacy} 
          className="w-10 h-10 bg-[#FFFDF5] rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-[#13312A]/10 flex items-center justify-center text-[#13312A] active:scale-95 transition-all hover:bg-white/80"
        >
          {showValues ? <EyeOff size={20} strokeWidth={2.5} /> : <Eye size={20} strokeWidth={2.5} />}
        </button>
      </header>

      {/* 1. SEPARATED BALANCE CARD (Honest View) */}
      <section className="bg-[#13312A] rounded-[2rem] p-7 text-white shadow-xl shadow-[#13312A]/20 mb-6 relative overflow-hidden transition-transform duration-300 hover:scale-[1.01]">
        {/* Decorative elements */}
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-[#C69A72]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
        
        {/* Main Account Balance */}
        <div className="mb-6 relative z-10">
          <div className="flex items-center justify-between mb-2">
             <p className="text-[#F6E9CA] text-xs font-bold uppercase tracking-wider flex items-center gap-2">
               <Wallet size={14} className="text-[#C69A72]" /> Saldo Disponível
             </p>
             <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded-lg text-[#F6E9CA] border border-white/10">Conta Corrente</span>
          </div>
          <h2 className="text-4xl font-bold tracking-tight text-[#F6E9CA] font-serif">
            {showValues ? formatCurrency(netBalance) : 'R$ ••••'}
          </h2>
        </div>
        
        <div className="h-[1px] bg-gradient-to-r from-transparent via-[#C69A72]/30 to-transparent mb-4 w-full"></div>

        {/* Benefits Balance (Separated) */}
        <div className="relative z-10 flex items-center justify-between">
           <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-2xl bg-white/5 flex items-center justify-center text-[#C69A72]">
                 <Ticket size={18} />
              </div>
              <div>
                 <p className="text-[10px] text-[#F6E9CA]/80 uppercase font-bold tracking-wide">Benefícios (VA/VR)</p>
                 <p className="text-sm font-bold text-[#C69A72] font-serif">
                    {showValues ? formatCurrency(benefitBalance) : '••••'}
                 </p>
              </div>
           </div>
           <div className="text-right">
             <p className="text-[10px] text-[#F6E9CA]/60 font-medium">Saldo restrito</p>
           </div>
        </div>
      </section>

      {/* 2. FORECAST CARD WITH CHART */}
      <section className="bg-[#155446] rounded-[2rem] p-6 text-white shadow-lg shadow-[#155446]/20 mb-8 relative overflow-hidden border border-[#13312A]/10">
         <div className="absolute -left-4 -bottom-10 w-32 h-32 bg-[#C69A72]/20 rounded-full blur-2xl"></div>
         
         <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
               <div className="p-2 bg-[#F6E9CA]/10 rounded-xl text-[#F6E9CA]">
                  <TrendingUp size={18} />
               </div>
               <div>
                   <h3 className="text-xs font-bold text-[#F6E9CA] uppercase tracking-widest">Previsão de Liquidez</h3>
                   <p className="text-[10px] text-[#F6E9CA]/60">Após pagar todas as contas</p>
               </div>
            </div>
            
            <div className="flex items-end justify-between mb-6">
               {isForecastNegative ? (
                   <div className="bg-[#9F3E34] px-4 py-2 rounded-2xl shadow-sm inline-block border border-[#F6E9CA]/20">
                       <p className="text-3xl font-bold font-serif text-[#F6E9CA]">
                          {showValues ? formatCurrency(forecastedFreeBalance) : 'R$ ••••'}
                       </p>
                   </div>
               ) : (
                   <p className="text-4xl font-bold font-serif text-[#F6E9CA]">
                      {showValues ? formatCurrency(forecastedFreeBalance) : 'R$ ••••'}
                   </p>
               )}
            </div>

            {/* NEW: Liquidity Breakdown Chart */}
            <div className="h-32 w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={liquidityChartData} margin={{ top: 15, right: 0, left: 0, bottom: 0 }}>
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{ fontSize: 10, fill: '#F6E9CA', fontWeight: 600, opacity: 0.7 }} 
                            dy={5}
                            interval={0}
                        />
                         <RechartsTooltip 
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#F6E9CA', color: '#13312A', fontSize: '12px', fontWeight: 'bold' }}
                            formatter={(value: number) => [formatCurrency(value), '']}
                            itemStyle={{ color: '#13312A' }}
                         />
                        <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={32}>
                            {liquidityChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
         </div>
      </section>

      {/* 3. LIABILITIES GRID (Cards & Loans) */}
      <section className="grid grid-cols-2 gap-3 mb-8">
        
        {/* Credit Card Widget */}
        <div 
            onClick={() => onNavigate('cards')} 
            className="bg-[#FFFDF5] border border-[#13312A]/10 rounded-3xl p-5 shadow-sm active:bg-[#F6E9CA] transition-all hover:shadow-md cursor-pointer flex flex-col justify-between"
        >
            <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 rounded-2xl bg-[#F6E9CA] text-[#13312A] flex items-center justify-center">
                    <CreditCard size={20} />
                </div>
                <div className="text-right">
                   <span className="text-[10px] font-bold text-[#155446] uppercase tracking-wider">Fatura</span>
                </div>
            </div>
            <div>
                <p className="text-lg font-bold text-[#13312A] truncate font-serif">
                   {showValues ? formatCurrency(currentInvoiceValue) : '••••'}
                </p>
                <div className="w-full bg-[#F6E9CA] h-1.5 rounded-full mt-2 overflow-hidden">
                    <div className="h-full bg-[#13312A] rounded-full" style={{ width: `${Math.min(limitPercent, 100)}%` }}></div>
                </div>
                <p className="text-[10px] text-[#155446] mt-1 font-medium">{limitPercent.toFixed(0)}% do limite</p>
            </div>
        </div>

        {/* Loans Widget */}
        <div 
            onClick={() => onNavigate('loans')} 
            className="bg-[#FFFDF5] border border-[#13312A]/10 rounded-3xl p-5 shadow-sm active:bg-[#F6E9CA] transition-all hover:shadow-md cursor-pointer flex flex-col justify-between"
        >
             <div className="flex justify-between items-start mb-2">
                <div className="w-10 h-10 rounded-2xl bg-[#F6E9CA] text-[#155446] flex items-center justify-center">
                    <Landmark size={20} />
                </div>
                <div className="text-right">
                   <span className="text-[10px] font-bold text-[#155446] uppercase tracking-wider">Mensal</span>
                </div>
            </div>
            <div>
                <p className="text-lg font-bold text-[#13312A] truncate font-serif">
                   {showValues ? formatCurrency(monthlyLoanCommitment) : '••••'}
                </p>
                <div className="flex items-center gap-1 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#C69A72]"></span>
                    <p className="text-[10px] text-[#155446] font-medium">{activeLoansCount} contratos ativos</p>
                </div>
            </div>
        </div>

      </section>

      {/* 4. TREND CHART (6 Months) */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 px-2">
           <h3 className="font-bold text-[#13312A] flex items-center gap-2 font-serif">
             <BarChart3 size={18} /> Evolução Semestral
           </h3>
           <span className="text-[10px] text-[#155446] font-medium">Últimos 6 meses</span>
        </div>
        
        <div className="bg-[#FFFDF5] p-4 rounded-3xl shadow-sm h-48 w-full border border-[#13312A]/10">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F6E9CA" />
                 <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#155446', fontWeight: 600 }} 
                    dy={10}
                 />
                 <RechartsTooltip 
                    cursor={{ fill: '#F6E9CA' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', color: '#13312A', backgroundColor: '#FFFDF5' }}
                    formatter={(value: number) => [formatCurrency(value), '']}
                 />
                 <Bar dataKey="Entradas" fill="#155446" radius={[4, 4, 0, 0]} barSize={8} />
                 <Bar dataKey="Saídas" fill="#9F3E34" radius={[4, 4, 0, 0]} barSize={8} />
              </BarChart>
           </ResponsiveContainer>
        </div>
      </section>

      {/* Categories Summary List */}
      <section>
        <h3 className="text-[#13312A] font-bold text-lg mb-4 px-2 font-serif">Categorias Principais</h3>
        <div className="space-y-4">
          {catProgress.map((cat) => {
            const percent = Math.min((cat.total / (maxExpense * 1.2)) * 100, 100);
            return (
              <div 
                key={cat.key} 
                onClick={() => {
                    if (cat.key === 'car') onNavigate('car-details');
                    if (cat.key === 'house') onNavigate('house-details');
                    if (cat.key === 'partner') onNavigate('partner-details');
                }}
                className={`bg-[#FFFDF5] p-5 rounded-3xl shadow-sm flex items-center gap-4 transition-all border border-[#13312A]/10 ${['car', 'house', 'partner'].includes(cat.key) ? 'cursor-pointer active:scale-95 hover:shadow-md' : ''}`}
              >
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-[#13312A]"
                  style={{ backgroundColor: '#F6E9CA' }}
                >
                    {cat.key === 'house' && <Home size={20} />}
                    {cat.key === 'car' && <Car size={20} />}
                    {cat.key === 'partner' && <Heart size={20} />}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-[#13312A]">{cat.name}</span>
                    <span className="text-sm font-medium text-[#155446] font-serif">
                      {showValues ? formatCurrency(cat.total) : '••••'}
                    </span>
                  </div>
                  <div className="h-3 w-full bg-[#F6E9CA] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ 
                        width: `${percent}%`, 
                        backgroundColor: cat.color
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};