import React, { useState } from 'react';
import { AppData, CATEGORIES, CategoryKey, Transaction } from '../types';
import { formatCurrency, formatDate, COLORS } from '../constants';
import { CreditCard, Lock, Calendar, ShoppingBag, ArrowUpRight, Settings, AlertTriangle, Clock, PieChart as PieIcon, BarChart3, TrendingUp, Menu, Plus, X, Save, Edit3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, CartesianGrid } from 'recharts';

interface CreditCardViewProps {
  data: AppData;
  onOpenSettings: () => void;
  onOpenSidebar: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onEditTransaction: (transaction: Transaction) => void;
}

// Sub-component: Future Invoice Modal
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
      d.setDate(1); // Set to 1st to avoid month overflow issues
      d.setMonth(currentMonth + i);
      return d;
  });

  const handleSaveFutureInvoice = (dateStr: string, amount: number) => {
      const selectedDate = new Date(dateStr);
      // Set the date to the configured Due Date of that month to ensure it falls in the correct "bucket" visually
      selectedDate.setDate(creditCard.dueDate);
      
      const formattedDate = selectedDate.toISOString().split('T')[0];
      
      onAddTransaction({
          type: 'expense',
          amount: amount,
          date: formattedDate,
          category: 'debt', // Categorize as Debt -> Credit Card
          subcategory: 'Ajuste Fatura',
          description: 'Ajuste Manual de Fatura',
          paymentMethod: 'credit',
          isBenefit: false,
          isSalary: false
      });
  };

  // --- 1. ALERT LOGIC ---
  const getDaysUntil = (dayNumber: number) => {
     const today = new Date();
     today.setHours(0,0,0,0);
     
     let target = new Date(today.getFullYear(), today.getMonth(), dayNumber);
     
     // If day passed, assume next month
     if (target.getTime() < today.getTime()) {
         target.setMonth(target.getMonth() + 1);
     }
     
     const diffTime = target.getTime() - today.getTime();
     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
     return diffDays;
  };

  const daysToClose = getDaysUntil(creditCard.closingDate);
  const daysToDue = getDaysUntil(creditCard.dueDate);
  const showClosingAlert = daysToClose <= 7 && daysToClose >= 0;
  const showDueAlert = daysToDue <= 7 && daysToDue >= 0;

  // --- 2. DATA PREPARATION ---

  // All credit transactions sorted descending
  const creditTransactions = transactions
    .filter(t => t.type === 'expense' && t.paymentMethod === 'credit')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Current Invoice Transactions
  const currentMonthTransactions = creditTransactions.filter(t => {
     const d = new Date(t.date);
     return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  // Current Invoice Total
  const currentInvoiceTotal = currentMonthTransactions.reduce((acc, t) => acc + t.amount, 0) + (creditCard.initialInvoiceOffset || 0);
  
  // Total Used Limit (All future + current)
  const allFutureSum = transactions
    .filter(t => t.type === 'expense' && t.paymentMethod === 'credit' && new Date(t.date) >= new Date(currentYear, currentMonth, 1))
    .reduce((acc, t) => acc + t.amount, 0);

  const totalUsedLimit = (creditCard.initialInvoiceOffset || 0) + allFutureSum;
  const availableLimit = creditCard.limit - totalUsedLimit;
  const limitPercentage = creditCard.limit > 0 ? (totalUsedLimit / creditCard.limit) * 100 : 0;

  // --- 3. CHART 1: SPEND BY CATEGORY (DONUT) ---
  const categoryTotals: Record<string, number> = {};
  
  currentMonthTransactions.forEach(t => {
      categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });

  const pieData = Object.keys(categoryTotals).map(catKey => {
      const catDef = CATEGORIES.find(c => c.key === catKey);
      let color = COLORS.tertiary; // default Oatmeal/Tan
      if (catKey === 'car') color = COLORS.secondary; // Forest Medium
      if (catKey === 'house') color = COLORS.primary; // Forest Deep
      if (catKey === 'partner') color = COLORS.danger; // Muted Red
      if (catKey === 'others') color = COLORS.accent; // Brown
      if (catKey === 'debt') color = '#94A3B8'; // Slate for financial debt

      return {
          name: catDef?.label || 'Outros',
          value: categoryTotals[catKey],
          color: color,
          key: catKey
      };
  }).sort((a, b) => b.value - a.value);

  // If empty, add placeholder
  if (pieData.length === 0) {
      pieData.push({ name: 'Sem gastos', value: 1, color: '#F1F5F9', key: 'empty' });
  }

  // --- 4. CHART 2: FUTURE PROJECTION (BARS) ---
  // Generate next 6 months
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
      
      // Add initial offset only to the first month (current)
      const total = i === 0 ? monthlySum + (creditCard.initialInvoiceOffset || 0) : monthlySum;

      return {
          name: monthLabel,
          total: total,
          isCurrent: i === 0
      };
  });

  return (
    <div className="pb-32 animate-in slide-in-from-right duration-300">
      
      <FutureInvoiceModal 
        isOpen={isFutureModalOpen} 
        onClose={() => setIsFutureModalOpen(false)} 
        onSave={handleSaveFutureInvoice}
        nextMonths={nextMonths}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-4">
        <div className="flex items-center gap-3">
            <button onClick={onOpenSidebar} className="p-2 bg-[#FFFDF5] rounded-full shadow-sm text-[#13312A] active:scale-95 transition-transform">
                <Menu size={20} />
            </button>
            <h2 className="text-2xl font-bold text-[#13312A] font-serif">Cartão de Crédito</h2>
        </div>
        <button 
          onClick={onOpenSettings}
          className="p-2 bg-[#FFFDF5] rounded-full text-[#155446] hover:text-[#13312A] shadow-sm transition-colors"
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Alerts */}
      <div className="space-y-3 mb-6">
        {showDueAlert && (
           <div className="bg-[#9F3E34]/10 border border-[#9F3E34]/20 p-4 rounded-3xl flex items-center gap-3 animate-in slide-in-from-top-2 shadow-sm">
             <div className="w-10 h-10 rounded-2xl bg-[#9F3E34]/20 text-[#9F3E34] flex items-center justify-center shrink-0">
               <AlertTriangle size={20} />
             </div>
             <div>
               <p className="font-bold text-[#9F3E34] text-sm">Fatura Vence em {daysToDue} {daysToDue === 1 ? 'dia' : 'dias'}</p>
               <p className="text-xs text-[#9F3E34]/80">Dia {creditCard.dueDate} está chegando.</p>
             </div>
           </div>
        )}
        
        {showClosingAlert && !showDueAlert && (
           <div className="bg-[#C69A72]/10 border border-[#C69A72]/30 p-4 rounded-3xl flex items-center gap-3 animate-in slide-in-from-top-2 shadow-sm">
             <div className="w-10 h-10 rounded-2xl bg-[#C69A72]/20 text-[#13312A] flex items-center justify-center shrink-0">
               <Clock size={20} />
             </div>
             <div>
               <p className="font-bold text-[#13312A] text-sm">Fatura Fecha em {daysToClose} {daysToClose === 1 ? 'dia' : 'dias'}</p>
               <p className="text-xs text-[#155446]">Prepare-se para o fechamento dia {creditCard.closingDate}.</p>
             </div>
           </div>
        )}
      </div>

      {/* Virtual Card UI - Abyssal Theme */}
      <div className="w-full aspect-[1.586] rounded-3xl bg-gradient-to-br from-[#13312A] to-[#155446] p-6 text-white shadow-xl shadow-[#13312A]/30 mb-8 relative overflow-hidden flex flex-col justify-between group cursor-pointer active:scale-[0.98] transition-all" onClick={onOpenSettings}>
         {/* Decorative */}
         <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-colors"></div>
         <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#C69A72]/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

         <div className="relative z-10 flex justify-between items-start">
            <CreditCard size={32} className="text-[#C69A72]" />
            <span className="text-lg font-bold tracking-widest text-[#C69A72]/80">VISA</span>
         </div>

         <div className="relative z-10">
            <p className="text-[#C69A72] text-xs mb-1">Fatura Atual</p>
            <h3 className="text-3xl font-bold mb-4 tracking-tight font-serif">{formatCurrency(currentInvoiceTotal)}</h3>
            
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] text-[#C69A72]/80 mb-1 uppercase tracking-wider">Limite Disponível</p>
                <p className="font-semibold">{formatCurrency(availableLimit)}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#C69A72]/80 mb-1 uppercase tracking-wider">Vencimento</p>
                <p className="font-semibold">{creditCard.dueDate}/{(currentMonth + 1).toString().padStart(2, '0')}</p>
              </div>
            </div>
         </div>
      </div>

      {/* CHART 1: SPEND BY CATEGORY - MOVED UP */}
      <section className="bg-[#FFFDF5] rounded-3xl p-6 shadow-sm mb-6 border border-[#13312A]/10">
         <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-[#13312A] flex items-center gap-2 font-serif">
               <PieIcon size={18} /> Por Categoria
            </h3>
            <span className="text-[10px] bg-[#F6E9CA] text-[#155446] px-2 py-1 rounded-lg font-bold">Fatura Atual</span>
         </div>
         
         <div className="flex items-center">
            <div className="h-28 w-28 relative shrink-0">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={35}
                        outerRadius={50}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={4}
                     >
                        {pieData.map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                     </Pie>
                  </PieChart>
               </ResponsiveContainer>
               {/* Total Center */}
               <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
                  <span className="text-[10px] text-gray-400">Total</span>
                  <span className="text-[10px] font-bold text-[#13312A]">100%</span>
               </div>
            </div>

            <div className="flex-1 pl-4 space-y-2">
               {pieData.slice(0, 3).map((item) => (
                   <div key={item.key} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                         <span className="text-xs text-[#155446] font-medium truncate max-w-[80px]">{item.name}</span>
                      </div>
                      <span className="text-xs font-bold text-[#13312A] font-serif">{formatCurrency(item.value)}</span>
                   </div>
               ))}
               {pieData.length > 3 && (
                   <p className="text-[10px] text-gray-400 pl-4 mt-1">+ {pieData.length - 3} outras categorias</p>
               )}
            </div>
         </div>
      </section>

      {/* Transactions List */}
      <section className="mb-8">
        <h3 className="font-bold text-[#13312A] flex items-center gap-2 mb-4 px-2 font-serif">
           <ShoppingBag size={18} /> Lançamentos da Fatura
        </h3>
        
        <div className="space-y-3">
            {currentMonthTransactions.length === 0 ? (
                <div className="text-center py-6 text-gray-400 bg-[#FFFDF5] rounded-3xl border border-dashed border-[#13312A]/10">
                    Nenhum lançamento nesta fatura.
                </div>
            ) : (
                currentMonthTransactions.map(t => (
                    <div key={t.id} className="bg-[#FFFDF5] p-4 rounded-3xl shadow-sm border border-[#13312A]/5 flex items-center justify-between">
                         <div className="flex items-center gap-3 overflow-hidden">
                             <div className="w-10 h-10 rounded-2xl bg-[#F6E9CA] text-[#155446] flex items-center justify-center shrink-0">
                                 {CATEGORIES.find(c => c.key === t.category)?.icon === 'Car' && <Settings size={18} />}
                                 {CATEGORIES.find(c => c.key === t.category)?.icon !== 'Car' && <ShoppingBag size={18} />}
                             </div>
                             <div className="min-w-0">
                                 <p className="font-bold text-[#13312A] truncate">{t.description || t.subcategory || 'Compra'}</p>
                                 <p className="text-xs text-[#155446]">{formatDate(t.date)}</p>
                             </div>
                         </div>
                         <div className="flex items-center gap-3 shrink-0">
                            <span className="font-bold text-[#13312A] font-serif">{formatCurrency(t.amount)}</span>
                            <button onClick={() => onEditTransaction(t)} className="p-2 bg-[#13312A]/5 text-[#155446] rounded-xl hover:bg-[#13312A]/10 hover:text-[#13312A]">
                                <Edit3 size={16} />
                            </button>
                         </div>
                    </div>
                ))
            )}
        </div>
      </section>

      {/* CHART 2: FUTURE PROJECTION */}
      <section className="bg-[#13312A] rounded-3xl p-6 text-white shadow-lg shadow-[#13312A]/20 relative overflow-hidden">
         <div className="absolute right-0 bottom-0 w-32 h-32 bg-[#C69A72]/10 rounded-full blur-2xl -mr-8 -mb-8"></div>
         
         <div className="flex items-center justify-between mb-6 relative z-10">
            <h3 className="font-bold flex items-center gap-2 font-serif">
               <BarChart3 size={18} className="text-[#C69A72]" /> Previsão Futura
            </h3>
            <button 
                onClick={() => setIsFutureModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-bold transition-colors border border-white/10 text-[#C69A72]"
            >
                <Plus size={14} /> Lançar Fatura
            </button>
         </div>

         <div className="h-40 w-full relative z-10">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={projectionData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                  <XAxis 
                     dataKey="name" 
                     axisLine={false} 
                     tickLine={false} 
                     tick={{ fontSize: 10, fill: '#C69A72', fontWeight: 600 }} 
                     dy={10}
                  />
                  <Tooltip 
                     cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                     contentStyle={{ borderRadius: '12px', border: 'none', backgroundColor: '#FFFDF5', color: '#13312A' }}
                     formatter={(value: number) => [formatCurrency(value), '']}
                  />
                  <Bar dataKey="total" radius={[4, 4, 0, 0]}>
                    {projectionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.isCurrent ? '#C69A72' : '#155446'} />
                    ))}
                  </Bar>
               </BarChart>
            </ResponsiveContainer>
         </div>
      </section>

    </div>
  );
};