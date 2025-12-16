import React from 'react';
import { Debt } from '../types';
import { formatCurrency } from '../constants';
import { Plus, Landmark, TrendingDown, Calendar, Car, Home, Wallet, CheckCircle2, Flag, Target, Menu, Edit3 } from 'lucide-react';

interface LoanViewProps {
  debts: Debt[];
  onOpenAddLoan: () => void;
  onPayInstallment: (id: string) => void;
  onOpenSidebar: () => void;
  onEditDebt: (debt: Debt) => void;
}

export const LoanView: React.FC<LoanViewProps> = ({ debts, onOpenAddLoan, onPayInstallment, onOpenSidebar, onEditDebt }) => {
  
  // Calculations
  const totalDebt = debts.reduce((acc, debt) => {
    // Determine the value of one installment
    const installmentVal = debt.installmentValue || (debt.totalValue / debt.installmentsTotal);
    const paidAmount = debt.installmentsPaid * installmentVal;
    
    // Remaining = Total - Paid
    return acc + Math.max(0, debt.totalValue - paidAmount);
  }, 0);

  const monthlyCommitment = debts.reduce((acc, debt) => {
    if (debt.installmentsPaid >= debt.installmentsTotal) return acc;
    // Use explicit value if available
    return acc + (debt.installmentValue || (debt.totalValue / debt.installmentsTotal));
  }, 0);

  const getIcon = (category?: string) => {
    switch(category) {
      case 'vehicle': return Car;
      case 'house': return Home;
      default: return Wallet;
    }
  };

  const getFreedomDate = (remainingMonths: number) => {
     if (remainingMonths <= 0) return 'Quitado';
     const now = new Date();
     // Add months to current date
     const freedom = new Date(now.getFullYear(), now.getMonth() + remainingMonths, 1);
     const str = freedom.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
     return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="pb-32 animate-in slide-in-from-right duration-300 relative min-h-screen">
      
      {/* FAB - Adjusted for Navigation bar height */}
      <button 
        onClick={onOpenAddLoan}
        className="fixed bottom-28 right-6 w-14 h-14 bg-[#13312A] text-[#C69A72] rounded-full shadow-xl shadow-[#13312A]/30 flex items-center justify-center z-50 active:scale-90 transition-transform hover:bg-[#0f2620]"
      >
        <Plus size={32} />
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-4">
        <div className="flex items-center gap-3">
             <button onClick={onOpenSidebar} className="p-2 bg-[#FFFDF5] rounded-full shadow-sm text-[#13312A] active:scale-95 transition-transform">
                <Menu size={20} />
             </button>
            <h2 className="text-2xl font-bold text-[#13312A] font-serif">Empréstimos</h2>
        </div>
      </div>

      {/* Summary Card */}
      <div className="bg-[#155446] rounded-3xl p-6 text-white shadow-xl shadow-[#155446]/20 mb-8 relative overflow-hidden border border-[#13312A]/20">
         <div className="absolute right-0 top-0 w-64 h-64 bg-[#C69A72]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
         
         <div className="relative z-10 flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#13312A] flex items-center justify-center text-[#C69A72]">
               <Landmark size={24} />
            </div>
            <div>
               <p className="text-xs text-[#F6E9CA] font-medium opacity-80">Resumo da Dívida</p>
               <p className="text-sm font-semibold text-white font-serif">Saldo Devedor Real</p>
            </div>
         </div>

         <div className="relative z-10">
            <h3 className="text-4xl font-bold tracking-tight mb-4 font-serif">{formatCurrency(totalDebt)}</h3>
            
            <div className="bg-[#13312A]/50 rounded-xl p-3 flex items-center gap-3 border border-[#F6E9CA]/10">
               <TrendingDown size={20} className="text-[#C69A72]" />
               <div>
                  <p className="text-[10px] text-[#F6E9CA] uppercase font-bold">Compromisso Mensal</p>
                  <p className="text-lg font-bold text-white font-serif">{formatCurrency(monthlyCommitment)}</p>
               </div>
            </div>
         </div>
      </div>

      {/* Loans List */}
      <div className="space-y-4">
        <h3 className="font-bold text-[#13312A] px-2 font-serif">Meus Contratos</h3>
        
        {debts.length === 0 ? (
          <div className="text-center py-10 text-[#155446] bg-[#FFFDF5] rounded-3xl border border-dashed border-[#13312A]/10">
            <p>Nenhum empréstimo cadastrado.</p>
            <button onClick={onOpenAddLoan} className="text-sm text-[#C69A72] font-bold mt-2">Adicionar Novo</button>
          </div>
        ) : (
          debts.map((debt) => {
            const installmentValue = debt.installmentValue || (debt.totalValue / debt.installmentsTotal);
            const remainingMonths = Math.max(0, debt.installmentsTotal - debt.installmentsPaid);
            
            // Logic Change: Total Debt Value - (Paid Installments * Installment Value)
            const paidValue = debt.installmentsPaid * installmentValue;
            const remainingValue = Math.max(0, debt.totalValue - paidValue);

            const progress = (debt.installmentsPaid / debt.installmentsTotal) * 100;
            const Icon = getIcon(debt.category);
            const isPaid = debt.installmentsPaid >= debt.installmentsTotal;
            const freedomDate = getFreedomDate(remainingMonths);

            return (
              <div key={debt.id} className="bg-[#FFFDF5] p-5 rounded-3xl shadow-sm border border-[#13312A]/10 relative overflow-hidden group">
                 {isPaid && (
                   <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center backdrop-blur-[1px]">
                      <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-sm">
                        <CheckCircle2 size={18} /> Quitado
                      </div>
                   </div>
                 )}

                 <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                       <div className="w-10 h-10 rounded-2xl bg-[#F6E9CA] text-[#155446] flex items-center justify-center">
                          <Icon size={20} />
                       </div>
                       <div>
                          <h4 className="font-bold text-[#13312A] font-serif">{debt.name}</h4>
                          <p className="text-xs text-[#155446] flex items-center gap-1">
                            <Calendar size={10} /> Vence dia {debt.dueDate}
                          </p>
                       </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="text-right">
                           <p className="text-xs text-[#155446] mb-0.5">Falta Pagar</p>
                           <p className="font-bold text-[#13312A] font-serif">{formatCurrency(remainingValue)}</p>
                        </div>
                        <button onClick={() => onEditDebt(debt)} className="p-1.5 text-[#155446] hover:text-[#13312A]">
                           <Edit3 size={16} />
                        </button>
                    </div>
                 </div>

                 {/* Freedom Date Badge */}
                 {!isPaid && (
                    <div className="mb-4 bg-[#13312A]/5 p-3 rounded-2xl border border-[#13312A]/5 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#13312A]/10 text-[#13312A] flex items-center justify-center shrink-0">
                           <Target size={16} />
                        </div>
                        <div>
                           <p className="text-[10px] text-[#155446] font-bold uppercase tracking-wide">Previsão de Quitação</p>
                           <p className="text-sm font-bold text-[#13312A] font-serif">{freedomDate}</p>
                        </div>
                    </div>
                 )}

                 {/* Progress Bar */}
                 <div className="mb-4">
                    <div className="flex justify-between text-xs mb-1.5 font-medium">
                       <span className="text-[#155446]">
                          {debt.installmentsPaid} de {debt.installmentsTotal} parcelas
                       </span>
                       <span className="text-[#9F3E34]">
                          {remainingMonths} meses restantes
                       </span>
                    </div>
                    <div className="h-2.5 w-full bg-[#F6E9CA] rounded-full overflow-hidden">
                       <div 
                          className="h-full bg-[#13312A] rounded-full transition-all duration-1000"
                          style={{ width: `${progress}%` }}
                       ></div>
                    </div>
                 </div>

                 {/* Actions */}
                 <div className="flex items-center justify-between pt-3 border-t border-[#13312A]/5">
                    <div className="text-xs">
                       <span className="text-[#155446]">Valor da parcela: </span>
                       <span className="font-semibold text-[#13312A] font-serif">{formatCurrency(installmentValue)}</span>
                    </div>
                    
                    {!isPaid && (
                      <button 
                        onClick={() => onPayInstallment(debt.id)}
                        className="px-4 py-2 bg-[#13312A]/5 hover:bg-[#13312A]/10 text-[#13312A] rounded-2xl text-xs font-bold transition-colors active:scale-95"
                      >
                        Pagar Parcela
                      </button>
                    )}
                 </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};