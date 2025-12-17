import React, { useState } from 'react';
import { AppData, CATEGORIES, CategoryKey, Transaction } from '../types';
import { formatCurrency, formatDate, COLORS } from '../constants';
import { CreditCard, Lock, Calendar, ShoppingBag, ArrowUpRight, Settings, AlertTriangle, Clock, PieChart as PieIcon, BarChart3, TrendingUp, Menu, Plus, X, Save, Edit3, Filter } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, CartesianGrid } from 'recharts';

interface CreditCardViewProps {
  data: AppData;
  onOpenSettings: () => void;
  onOpenSidebar: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onEditTransaction: (transaction: Transaction) => void;
}

// Sub-component: Future Invoice Modal (Mantido igual)
const FutureInvoiceModal = ({ isOpen, onClose, onSave, nextMonths }: { isOpen: boolean, onClose: () => void, onSave: (date: string, amount: number) => void, nextMonths: Date[] }) => {
    const [selectedDateStr, setSelectedDateStr] = useState(nextMonths[0].toISOString());
    const [amount, setAmount] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(selectedDateStr, parseFloat(amount));
        setAmount('');
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
            <div className="bg-[#F6E9CA] w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-[#13312A]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[#13312A] font-serif">Lançar Fatura Futura</h2>
                    <button onClick={onClose} className="p-2 bg-[#13312A]/10 rounded-full hover:bg-[#C69A72]/20">
                        <X size={20} className="text-[#13312A]" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-[#13312A] uppercase mb-1">Mês de Vencimento</label>
                        <select 
                            value={selectedDateStr} 
                            onChange={(e) => setSelectedDateStr(e.target.value)}
                            className="w-full px-4 py-3 bg-[#FFFDF5] border border-[#13312A]/10 rounded-2xl text-[#13312A] font-bold focus:outline-none focus:ring-2 focus:ring-[#C69A72] appearance-none"
                        >
                            {nextMonths.map((d, i) => (
                                <option key={i} value={d.toISOString()}>
                                    {d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).toUpperCase()}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-[#13312A] uppercase mb-1">Valor Total</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#155446] font-bold font-serif">R$</span>
                            <input 
                                type="number" 
                                step="0.01" 
                                required 
                                value={amount} 
                                onChange={(e) => setAmount(e.target.value)} 
                                className="w-full pl-10 pr-4 py-3 bg-[#FFFDF5] border border-[#13312A]/10 rounded-2xl text-[#13312A] font-bold text-lg font-serif focus:outline-none focus:ring-2 focus:ring-[#C69A72]" 
                            />
                        </div>
                        <p className="text-[10px] text-[#155446] mt-2 leading-tight">
                            Isso criará um lançamento de ajuste para preencher o valor desta fatura no gráfico de previsão.
                        </p>
                    </div>
                    <button type="submit" className="w-full py-3 bg-[#C69A72] text-[#13312A] rounded-xl font-bold text-base shadow-lg shadow-[#C69A72]/20 active:scale-95 transition-transform flex items-center justify-center gap-2 mt-4 font-serif">
                        <Save size={18} /> Salvar Fatura
                    </button>
                </form>
            </div>
        </div>
    );
};

export const CreditCardView: React.FC<CreditCardViewProps> = ({ data, onOpenSettings, onOpenSidebar, onAddTransaction, onEditTransaction }) => {
  const { transactions, creditCard } = data;
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const [isFutureModalOpen, setIsFutureModalOpen] = useState(false);

  // Helper: Generate next 12 months for dropdown
  const nextMonths = Array.from({ length: 12 }).map((_, i) => {
      const d = new Date();
      d.setDate(1); 
      d.setMonth(currentMonth + i);
      return d;
  });

  const handleSaveFutureInvoice = (dateStr: string, amount: number) => {
      const selectedDate = new Date(dateStr);
      selectedDate.setDate(creditCard.dueDate);
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      onAddTransaction({
          type: 'expense',
          amount: amount,
          date: formattedDate,
          category: 'debt', 
          subcategory: 'Ajuste Fatura',
          description: 'Ajuste Manual de Fatura',
          paymentMethod: 'credit',
          isBenefit: false,
          isSalary: false
      });
  };

  const getDaysUntil = (dayNumber: number) => {
     const today = new Date();
     today.setHours(0,0,0,0);
     let target = new Date(today.getFullYear(), today.getMonth(), dayNumber);
     if (target.getTime() < today.getTime()) target.setMonth(target.getMonth() + 1);
     const diffTime = target.getTime() - today.getTime();
     return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  };

  const daysToClose = getDaysUntil(creditCard.closingDate);
  const daysToDue = getDaysUntil(creditCard.dueDate);
  const showClosingAlert = daysToClose <= 7 && daysToClose >= 0;
  const showDueAlert = daysToDue <= 7 && daysToDue >= 0;

  // Data Logic
  const creditTransactions = transactions
    .filter(t => t.type === 'expense' && t.paymentMethod === 'credit')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const currentMonthTransactions = creditTransactions.filter(t => {
     const d = new Date(t.date);
     return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const currentInvoiceTotal = currentMonthTransactions.reduce((acc, t) => acc + t.amount, 0) + (creditCard.initialInvoiceOffset || 0);
  
  const allFutureSum = transactions
    .filter(t => t.type === 'expense' && t.paymentMethod === 'credit' && new Date(t.date) >= new Date(currentYear, currentMonth, 1))
    .reduce((acc, t) => acc + t.amount, 0);

  const totalUsedLimit = (creditCard.initialInvoiceOffset || 0) + allFutureSum;
  const availableLimit = creditCard.limit - totalUsedLimit;
  const limitPercentage = creditCard.limit > 0 ? (totalUsedLimit / creditCard.limit) * 100 : 0;

  // Pie Chart Data
  const categoryTotals: Record<string, number> = {};
  currentMonthTransactions.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });
  const pieData = Object.keys(categoryTotals).map(catKey => {
      const catDef = CATEGORIES.find(c => c.key === catKey);
      let color = COLORS.tertiary; 
      if (catKey === 'car') color = COLORS.secondary; 
      if (catKey === 'house') color = COLORS.primary; 
      if (catKey === 'partner') color = COLORS.danger; 
      if (catKey === 'others') color = COLORS.accent; 
      if (catKey === 'debt') color = '#94A3B8'; 
      return { name: catDef?.label || 'Outros', value: categoryTotals[catKey], color: color, key: catKey };
  }).sort((a, b) => b.value - a.value);

  if (pieData.length === 0) pieData.push({ name: 'Sem gastos', value: 1, color: '#F1F5F9', key: 'empty' });

  // Projection Data
  const projectionData = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date();
      d.setMonth(currentMonth + i);
      const m = d.getMonth();
      const y = d.getFullYear();
      const monthLabel = d.toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase().replace('.', '');
      const monthlySum = transactions
        .filter(t => {
            const tDate = new Date(t.date);
            return t.type === 'expense' && t.paymentMethod === 'credit' && tDate.getMonth() === m && tDate.getFullYear() === y;
        })
        .reduce((acc, t) => acc + t.amount, 0);
      const total = i === 0 ? monthlySum + (creditCard.initialInvoiceOffset || 0) : monthlySum;
      return { name: monthLabel, total: total, isCurrent: i === 0 };
  });

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-700 pb-24">
      
      <FutureInvoiceModal isOpen={isFutureModalOpen} onClose={() => setIsFutureModalOpen(false)} onSave={handleSaveFutureInvoice} nextMonths={nextMonths} />

      <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#13312A] font-serif">Gestão de Crédito</h2>
          <button onClick={onOpenSettings} className="p-2 bg-white rounded-full text-[#155446] hover:text-[#13312A] shadow-sm transition-colors">
            <Settings size={20} />
          </button>
      </div>

      {/* --- BENTO GRID START --- */}
      <div className="grid grid-cols-12 gap-6">

          {/* 1. Main Card Status (Span 4) */}
          <div className="col-span-12 md:col-span-4 bg-[#13312A] rounded-[2.5rem] p-8 text-white relative overflow-hidden flex flex-col justify-between shadow-xl shadow-[#13312A]/20 group">
             {/* Decor */}
             <div className="absolute top-0 right-0 w-48 h-48 bg-[#C69A72]/20 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-[#C69A72]/30 transition-colors"></div>
             
             <div className="relative z-10 flex justify-between items-start mb-8">
                 <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                    <CreditCard size={24} className="text-[#C69A72]" />
                 </div>
                 <span className="text-xs font-bold bg-[#C69A72] text-[#13312A] px-3 py-1.5 rounded-full">
                     Vence dia {creditCard.dueDate}
                 </span>
             </div>

             <div className="relative z-10">
                 <p className="text-[#C69A72] text-xs font-bold uppercase tracking-wider mb-2">Fatura Atual</p>
                 <h3 className="text-4xl font-bold font-serif mb-6">{formatCurrency(currentInvoiceTotal)}</h3>
                 
                 <div className="space-y-3">
                    <div className="flex justify-between text-xs text-[#F6E9CA]/70">
                        <span>Limite Usado</span>
                        <span>{limitPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${limitPercentage > 90 ? 'bg-[#9F3E34]' : 'bg-[#C69A72]'}`} style={{ width: `${Math.min(limitPercentage, 100)}%` }}></div>
                    </div>
                    <p className="text-xs text-right text-[#F6E9CA]">Disponível: <span className="font-bold text-white">{formatCurrency(availableLimit)}</span></p>
                 </div>
             </div>
          </div>

          {/* 2. Spending by Category (Span 4) */}
          <div className="col-span-12 md:col-span-4 bg-white rounded-[2.5rem] p-6 border border-[#13312A]/5 shadow-sm flex flex-col">
             <div className="flex items-center gap-2 mb-4">
                 <div className="p-2 bg-[#F6E9CA] rounded-full text-[#13312A]">
                     <PieIcon size={18} />
                 </div>
                 <h3 className="font-bold text-[#13312A] text-sm">Composição da Fatura</h3>
             </div>
             
             <div className="flex-1 flex flex-col items-center justify-center relative">
                <div className="h-40 w-full">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none" cornerRadius={4}>
                            {pieData.map((entry, index) => (
                               <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                         </Pie>
                      </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                        <span className="text-xs text-gray-400 font-bold">Total</span>
                   </div>
                </div>
                <div className="w-full mt-4 space-y-2 max-h-[100px] overflow-y-auto no-scrollbar">
                    {pieData.slice(0, 3).map((item) => (
                       <div key={item.key} className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                             <span className="text-gray-600 truncate max-w-[100px]">{item.name}</span>
                          </div>
                          <span className="font-bold text-[#13312A]">{formatCurrency(item.value)}</span>
                       </div>
                   ))}
                </div>
             </div>
          </div>

          {/* 3. Alerts & Quick Actions (Span 4) */}
          <div className="col-span-12 md:col-span-4 flex flex-col gap-4">
              {/* Alerts Box */}
              <div className="flex-1 bg-[#FFFDF5] rounded-[2.5rem] p-6 border border-[#13312A]/5 relative overflow-hidden">
                  <h3 className="font-bold text-[#13312A] text-sm mb-4">Avisos</h3>
                  {showDueAlert ? (
                      <div className="flex items-start gap-3 bg-[#9F3E34]/10 p-3 rounded-2xl text-[#9F3E34]">
                          <AlertTriangle size={20} className="shrink-0" />
                          <div>
                              <p className="font-bold text-sm">Vence em {daysToDue} dias!</p>
                              <p className="text-xs opacity-80">Prepare o pagamento.</p>
                          </div>
                      </div>
                  ) : showClosingAlert ? (
                      <div className="flex items-start gap-3 bg-[#C69A72]/20 p-3 rounded-2xl text-[#13312A]">
                          <Clock size={20} className="shrink-0" />
                          <div>
                              <p className="font-bold text-sm">Fecha em {daysToClose} dias</p>
                              <p className="text-xs opacity-80">Controle seus gastos.</p>
                          </div>
                      </div>
                  ) : (
                      <div className="flex flex-col items-center justify-center h-20 text-gray-400 text-xs text-center">
                          <Clock size={24} className="mb-2 opacity-20" />
                          <p>Sem alertas pendentes.</p>
                      </div>
                  )}
              </div>

              {/* Future Invoice Button */}
              <button 
                onClick={() => setIsFutureModalOpen(true)}
                className="bg-[#155446] text-white p-5 rounded-[2rem] flex items-center justify-between hover:bg-[#13312A] transition-colors shadow-lg shadow-[#155446]/20 group"
              >
                  <div className="text-left">
                      <p className="font-bold text-sm">Lançar Futuro</p>
                      <p className="text-[10px] text-white/60">Simular parcelas manuais</p>
                  </div>
                  <div className="bg-white/10 p-2 rounded-full group-hover:bg-white/20">
                      <Plus size={20} />
                  </div>
              </button>
          </div>

          {/* 4. Projection Chart (Span 12) */}
          <div className="col-span-12 bg-white rounded-[2.5rem] p-6 border border-[#13312A]/5 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="font-bold text-[#13312A] text-sm flex items-center gap-2">
                     <BarChart3 size={18} /> Projeção de Faturas
                 </h3>
             </div>
             <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={projectionData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                      <XAxis 
                         dataKey="name" 
                         axisLine={false} 
                         tickLine={false} 
                         tick={{ fontSize: 10, fill: '#9CA3AF', fontWeight: 600 }} 
                         dy={10}
                      />
                      <Tooltip 
                         cursor={{ fill: '#F9FAFB' }}
                         contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#13312A', color: '#fff' }}
                         formatter={(value: number) => [formatCurrency(value), '']}
                      />
                      <Bar dataKey="total" radius={[6, 6, 0, 0]} barSize={40}>
                        {projectionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#C69A72' : '#155446'} />
                        ))}
                      </Bar>
                   </BarChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* 5. Transactions Table (Span 12) */}
          <div className="col-span-12 bg-[#FFFDF5] rounded-[2.5rem] p-6 border border-[#13312A]/5 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-[#13312A] text-sm flex items-center gap-2">
                      <ShoppingBag size={18} /> Detalhamento da Fatura
                  </h3>
              </div>
              
              <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="text-xs text-gray-400 uppercase border-b border-gray-200">
                          <th className="py-3 font-bold pl-2">Item</th>
                          <th className="py-3 font-bold text-center">Data</th>
                          <th className="py-3 font-bold text-right pr-2">Valor</th>
                          <th className="py-3"></th>
                       </tr>
                    </thead>
                    <tbody>
                       {currentMonthTransactions.length === 0 ? (
                           <tr>
                               <td colSpan={4} className="py-8 text-center text-gray-400 text-sm">Nenhum lançamento.</td>
                           </tr>
                       ) : (
                           currentMonthTransactions.map(t => (
                              <tr key={t.id} className="group hover:bg-[#F6E9CA]/20 transition-colors border-b border-gray-50 last:border-0">
                                 <td className="py-4 pl-2">
                                     <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-lg bg-white border border-gray-100 flex items-center justify-center text-[#155446]">
                                            {CATEGORIES.find(c => c.key === t.category)?.icon === 'Car' ? <Settings size={14} /> : <ShoppingBag size={14} />}
                                         </div>
                                         <div>
                                             <p className="text-sm font-bold text-[#13312A]">{t.description || t.subcategory || 'Compra'}</p>
                                             <p className="text-[10px] text-gray-400 capitalize">{t.category}</p>
                                         </div>
                                     </div>
                                 </td>
                                 <td className="py-4 text-center text-xs text-gray-500 font-mono">
                                    {formatDate(t.date)}
                                 </td>
                                 <td className="py-4 text-right pr-2 text-sm font-bold text-[#13312A] font-serif">
                                    {formatCurrency(t.amount)}
                                 </td>
                                 <td className="py-4 text-right">
                                    <button onClick={() => onEditTransaction(t)} className="p-2 text-gray-300 hover:text-[#13312A] hover:bg-gray-100 rounded-lg transition-colors">
                                        <Edit3 size={14} />
                                    </button>
                                 </td>
                              </tr>
                           ))
                       )}
                    </tbody>
                 </table>
              </div>
          </div>

      </div>
    </div>
  );
};