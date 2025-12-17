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
  
  const totalDebt = debts.reduce((acc, debt) => {
    const installmentVal = debt.installmentValue || (debt.totalValue / debt.installmentsTotal);
    const paidAmount = debt.installmentsPaid * installmentVal;
    return acc + Math.max(0, debt.totalValue - paidAmount);
  }, 0);

  const monthlyCommitment = debts.reduce((acc, debt) => {
    if (debt.installmentsPaid >= debt.installmentsTotal) return acc;
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
     const freedom = new Date(now.getFullYear(), now.getMonth() + remainingMonths, 1);
     const str = freedom.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
     return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <div className="pb-32 animate-in slide-in-from-right duration-300 relative min-h-screen">
      
      {/* FAB */}
      <button 
        onClick={onOpenAddLoan}
        className="fixed bottom-28 right-6 w-14 h-14 bg-[#13312A] text-[#C69A72] rounded-full shadow-xl shadow-[#13312A]/30 flex items-center justify-center z-50 active:scale-90 transition-transform hover:bg-[#0f2620] md:hidden"
      >
        <Plus size={32} />
      </button>

      <div className="flex items-center justify-between mb-6 pt-4">
        <div className="flex items-center gap-3">
             <button onClick={onOpenSidebar} className="p-2 bg-[#FFFDF5] rounded-full shadow-sm text-[#13312A] active:scale-95 transition-transform">
                <Menu size={20} />
             </button>
            <h2 className="text-2xl font-bold text-[#13312A] font-serif">Empréstimos</h2>
        </div>
        <button onClick={onOpenAddLoan} className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#13312A] text-[#C69A72] rounded-xl text-sm font-bold">
           <Plus size={16} /> Novo Contrato
        </button>
      </div>

      <div className="grid grid-cols-12 gap-6">
          
          {/* 1. Summary Card (Span 12) */}
          <div className="col-span-12 bg-[#155446] rounded-[2.5rem] p-8 text-white shadow-xl shadow-[#155446]/20 relative overflow-hidden border border-[#13312A]/20">
             <div className="absolute right-0 top-0 w-64 h-64 bg-[#C69A72]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
             
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-[#13312A] flex items-center justify-center text-[#C69A72]">
                           <Landmark size={24} />
                        </div>
                        <div>
                           <p className="text-xs text-[#F6E9CA] font-medium opacity-80">Resumo da Dívida</p>
                           <p className="text-sm font-semibold text-white font-serif">Saldo Devedor Real</p>
                        </div>
                    </div>
                    <h3 className="text-5xl font-bold tracking-tight font-serif">{formatCurrency(totalDebt)}</h3>
                </div>

                <div className="bg-[#13312A]/50 rounded-[2rem] p-6 flex items-center gap-4 border border-[#F6E9CA]/10 min-w-[200px]">
                   <TrendingDown size={32} className="text-[#C69A72]" />
                   <div>
                      <p className="text-[10px] text-[#F6E9CA] uppercase font-bold">Compromisso Mensal</p>
                      <p className="text-2xl font-bold text-white font-serif">{formatCurrency(monthlyCommitment)}</p>
                   </div>
                </div>
             </div>
          </div>

          {/* 2. Contracts Grid (Span 12 -> 6 on desktop) */}
          <div className="col-span-12">
            <h3 className="font-bold text-[#13312A] mb-4 font-serif">Meus Contratos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {debts.length === 0 ? (
                  <div className="col-span-2 text-center py-12 text-[#155446] bg-[#FFFDF5] rounded-[2.5rem] border border-dashed border-[#13312A]/10">
                    <p>Nenhum empréstimo cadastrado.</p>
                  </div>
                ) : (
                  debts.map((debt) => {
                    const installmentValue = debt.installmentValue || (debt.totalValue / debt.installmentsTotal);
                    const remainingMonths = Math.max(0, debt.installmentsTotal - debt.installmentsPaid);
                    const paidValue = debt.installmentsPaid * installmentValue;
                    const remainingValue = Math.max(0, debt.totalValue - paidValue);
                    const progress = (debt.installmentsPaid / debt.installmentsTotal) * 100;
                    const Icon = getIcon(debt.category);
                    const isPaid = debt.installmentsPaid >= debt.installmentsTotal;
                    const freedomDate = getFreedomDate(remainingMonths);

                    return (
                      <div key={debt.id} className="bg-[#FFFDF5] p-6 rounded-[2.5rem] shadow-sm border border-[#13312A]/10 relative overflow-hidden group flex flex-col justify-between">
                         {isPaid && (
                           <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center backdrop-blur-[1px]">
                              <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-bold flex items-center gap-2 shadow-sm">
                                <CheckCircle2 size={18} /> Quitado
                              </div>
                           </div>
                         )}

                         <div>
                             <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                   <div className="w-12 h-12 rounded-[1.2rem] bg-[#F6E9CA] text-[#155446] flex items-center justify-center">
                                      <Icon size={24} />
                                   </div>
                                   <div>
                                      <h4 className="font-bold text-[#13312A] text-lg font-serif">{debt.name}</h4>
                                      <p className="text-xs text-[#155446] flex items-center gap-1 font-bold">
                                        <Calendar size={12} /> Dia {debt.dueDate}
                                      </p>
                                   </div>
                                </div>
                                <button onClick={() => onEditDebt(debt)} className="p-2 text-[#155446] hover:text-[#13312A] bg-white rounded-full shadow-sm">
                                   <Edit3 size={16} />
                                </button>
                             </div>

                             <div className="flex justify-between items-end mb-4">
                                <div>
                                   <p className="text-xs text-[#155446] mb-1">Restante</p>
                                   <p className="text-2xl font-bold text-[#13312A] font-serif">{formatCurrency(remainingValue)}</p>
                                </div>
                                {!isPaid && (
                                    <div className="text-right">
                                       <p className="text-[10px] text-[#155446] font-bold uppercase tracking-wide mb-1">Quitação</p>
                                       <p className="text-sm font-bold text-[#13312A] bg-[#13312A]/5 px-2 py-1 rounded-lg">{freedomDate}</p>
                                    </div>
                                )}
                             </div>

                             <div className="mb-2">
                                <div className="h-3 w-full bg-[#13312A]/5 rounded-full overflow-hidden">
                                   <div className="h-full bg-[#13312A] rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                                </div>
                                <div className="flex justify-between text-xs mt-2 font-medium">
                                   <span className="text-[#155446]">{debt.installmentsPaid}/{debt.installmentsTotal} pagas</span>
                                   <span className="text-[#9F3E34]">{remainingMonths} meses</span>
                                </div>
                             </div>
                         </div>

                         {!isPaid && (
                            <div className="pt-4 border-t border-[#13312A]/5 mt-2 flex justify-between items-center">
                                <div className="text-xs">
                                   <span className="text-[#155446]">Parcela: </span>
                                   <span className="font-bold text-[#13312A]">{formatCurrency(installmentValue)}</span>
                                </div>
                                <button onClick={() => onPayInstallment(debt.id)} className="px-5 py-2.5 bg-[#13312A] text-[#F6E9CA] rounded-2xl text-xs font-bold transition-colors hover:bg-black">
                                    Pagar
                                </button>
                            </div>
                         )}
                      </div>
                    );
                  })
                )}
            </div>
          </div>
      </div>
    </div>
  );
};