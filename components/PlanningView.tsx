import React from 'react';
import { Debt } from '../types';
import { COLORS, formatCurrency } from '../constants';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface PlanningViewProps {
  debts: Debt[];
}

export const PlanningView: React.FC<PlanningViewProps> = ({ debts }) => {
  return (
    <div className="pb-32 animate-in slide-in-from-right duration-300">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-[#162660] mb-2">Planejamento & Dívidas</h2>
        <p className="text-gray-500 text-sm">Acompanhe a quitação dos seus débitos.</p>
      </header>

      <div className="space-y-6">
        {debts.map((debt) => {
          const installmentValue = debt.totalValue / debt.installmentsTotal;
          const currentPaid = installmentValue * debt.installmentsPaid;
          const remaining = debt.totalValue - currentPaid;
          const progress = (currentPaid / debt.totalValue) * 100;
          const isPaidOff = remaining <= 0;

          return (
            <div key={debt.id} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-50">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${isPaidOff ? 'bg-green-100 text-green-600' : 'bg-red-50 text-red-500'}`}>
                    {isPaidOff ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                  </div>
                  <h3 className="font-bold text-[#162660]">{debt.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Restante</p>
                  <p className={`font-bold ${isPaidOff ? 'text-green-600' : 'text-red-500'}`}>
                    {formatCurrency(remaining)}
                  </p>
                </div>
              </div>

              {/* Inverted Logic Visual: Show how much is LEFT visually, or how much PAID? 
                  Prompt says "Barra de progresso invertida (quanto falta para quitar)".
                  Usually, filling the bar means completing the debt payment. 
                  Let's make the bar represent "Paid Amount" towards "Total".
              */}
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div className="text-xs font-semibold inline-block text-[#162660]">
                    {progress.toFixed(0)}% Pago
                  </div>
                  <div className="text-xs font-semibold inline-block text-gray-400">
                    Total: {formatCurrency(debt.totalValue)}
                  </div>
                </div>
                <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-gray-100">
                  <div
                    style={{ width: `${progress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-300 to-[#162660] transition-all duration-1000"
                  ></div>
                </div>
              </div>
            </div>
          );
        })}

        {debts.length === 0 && (
          <div className="bg-[#D0E6FD]/30 p-8 rounded-3xl text-center">
            <p className="text-[#162660] font-medium">Você está livre de dívidas! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
};