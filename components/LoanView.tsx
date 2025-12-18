
import React from 'react';
import { Debt } from '../types';
import { formatCurrency } from '../constants';
import { Plus, Landmark, TrendingDown, Menu, Edit3, Clock, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';

interface LoanViewProps {
  debts: Debt[];
  onOpenAddLoan: () => void;
  onPayInstallment: (id: string) => void;
  onOpenSidebar: () => void;
  onEditDebt: (debt: Debt) => void;
}

export const LoanView: React.FC<LoanViewProps> = ({ debts = [], onOpenAddLoan, onPayInstallment, onOpenSidebar, onEditDebt }) => {
  const totalDebt = debts.reduce((acc, d) => acc + (Math.max(0, Number(d.totalValue) - ((Number(d.installmentValue) || (Number(d.totalValue)/Number(d.installmentsTotal))) * Number(d.installmentsPaid)))), 0);
  const monthlyCommitment = debts.reduce((acc, d) => d.installmentsPaid < d.installmentsTotal ? acc + (Number(d.installmentValue) || (Number(d.totalValue)/Number(d.installmentsTotal))) : acc, 0);

  return (
    <div className="pb-32 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={onOpenSidebar} className="p-2 bg-white rounded-xl shadow-sm text-[#13312A]"><Menu size={22} /></button>
          <h2 className="text-2xl font-bold text-[#13312A] font-serif">Compromissos</h2>
        </div>
        <button onClick={onOpenAddLoan} className="p-3 bg-[#13312A] text-[#C69A72] rounded-2xl hover:scale-105 transition-all shadow-lg shadow-[#13312A]/20">
          <Plus size={20} />
        </button>
      </div>

      <div className="grid grid-cols-12 gap-4">
        
        {/* BENTO: TOTAL DE PASSIVOS (WIDE) */}
        <div className="col-span-12 lg:col-span-7 bg-[#13312A] rounded-[2.5rem] p-10 text-white shadow-xl relative overflow-hidden flex flex-col justify-center min-h-[220px]">
           <div className="absolute top-0 right-0 w-48 h-48 bg-[#C69A72]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
           <span className="text-[10px] font-bold text-[#C69A72] uppercase tracking-[0.4em] mb-2">Total em Aberto</span>
           <div className="text-6xl font-bold font-serif tracking-tighter">
              <AnimatedNumber value={totalDebt} className="text-white" />
           </div>
           <p className="text-[10px] text-white/40 mt-4 uppercase font-bold tracking-widest">Saldo devedor total consolidado</p>
        </div>

        {/* BENTO: DRENO MENSAL (SQUARE) */}
        <div className="col-span-12 lg:col-span-5 bg-white rounded-[2.5rem] p-8 border border-[#13312A]/5 shadow-sm flex flex-col justify-between min-h-[220px]">
            <div className="flex justify-between items-start">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center"><TrendingDown size={24} /></div>
              <ShieldAlert size={20} className="text-[#C69A72] opacity-40" />
            </div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Comprometimento Mensal</p>
              <div className="text-4xl font-bold text-[#13312A] font-serif">
                <AnimatedNumber value={monthlyCommitment} />
              </div>
            </div>
        </div>

        {/* BENTO: INSIGHT ESTRATÉGICO (WIDE) */}
        <div className="col-span-12 lg:col-span-4 bg-[#F6E9CA] rounded-[2.5rem] p-8 shadow-inner flex flex-col justify-center gap-4">
           <div className="flex items-center gap-3 text-[#13312A]">
             <Sparkles size={20} className="text-[#C69A72]" />
             <h4 className="font-bold text-sm uppercase tracking-widest">Estratégia</h4>
           </div>
           <p className="text-xs text-[#155446] leading-relaxed font-medium">Priorize a quitação do contrato de maior juros para liberar fluxo de caixa mais rápido.</p>
        </div>

        {/* BENTO: CONTRATOS ATIVOS (MAIN GRID) */}
        <div className="col-span-12 lg:col-span-8 bg-white rounded-[2.5rem] p-8 border border-[#13312A]/5 shadow-sm">
           <h3 className="font-bold text-[#13312A] font-serif mb-8 text-lg">Contratos Ativos</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {debts.length === 0 ? (
                <div className="col-span-full py-12 text-center text-gray-300 italic text-sm">Nenhum contrato ativo.</div>
              ) : (
                debts.map(debt => {
                  const installments = Number(debt.installmentsTotal) || 1;
                  const paid = Number(debt.installmentsPaid) || 0;
                  const progress = (paid / installments) * 100;
                  const isPaid = paid >= installments;

                  return (
                    <div key={debt.id} className="bg-[#FFFDF5] p-6 rounded-[2rem] border border-[#13312A]/5 relative group overflow-hidden">
                       {isPaid && <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center z-10"><CheckCircle2 className="text-emerald-500" size={32} /></div>}
                       <div className="flex justify-between items-start mb-4">
                          <h4 className="font-bold text-[#13312A] font-serif truncate w-2/3">{debt.name}</h4>
                          <button onClick={() => onEditDebt(debt)} className="p-1.5 text-gray-200 hover:text-[#13312A] transition-colors"><Edit3 size={14} /></button>
                       </div>
                       <div className="flex justify-between items-end mb-4">
                          <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase">Parcela</p>
                            <span className="font-bold text-sm text-[#13312A]">{formatCurrency(Number(debt.installmentValue) || (Number(debt.totalValue)/installments))}</span>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-bold text-gray-400 uppercase">Venc.</p>
                             <span className="font-bold text-sm text-[#13312A]">Dia {debt.dueDate}</span>
                          </div>
                       </div>
                       <div className="h-1.5 w-full bg-[#13312A]/5 rounded-full overflow-hidden">
                          <div className="h-full bg-[#13312A] rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                       </div>
                       {!isPaid && (
                         <button onClick={() => onPayInstallment(debt.id)} className="w-full mt-4 py-2 bg-white border border-[#13312A]/10 text-[#13312A] text-[10px] font-bold uppercase rounded-xl hover:bg-[#13312A] hover:text-[#C69A72] transition-all">Pagar Parcela</button>
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
