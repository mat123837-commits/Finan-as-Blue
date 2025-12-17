import React, { useState } from 'react';
import { AppData, Transaction } from '../types';
import { formatCurrency, formatDate } from '../constants';
import { Settings, Wrench, Fuel, FileText, Gauge, ShieldCheck, ArrowLeft, Menu, Plus, Edit3 } from 'lucide-react';

interface CarViewProps {
  data: AppData;
  onBack: () => void;
  onOpenSettings: () => void;
  onQuickAdd: (subcategory: string) => void;
  onOpenSidebar: () => void;
  onEditTransaction: (transaction: Transaction) => void;
}

export const CarView: React.FC<CarViewProps> = ({ data, onBack, onOpenSettings, onQuickAdd, onOpenSidebar, onEditTransaction }) => {
  const { transactions, car } = data;

  const carTransactions = transactions
    .filter(t => t.category === 'car' && t.type === 'expense')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Data Logic
  const lastKmTrans = carTransactions.find(t => t.carKm);
  const currentKm = lastKmTrans?.carKm || 0;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlySpend = carTransactions
    .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, t) => acc + t.amount, 0);

  const calculateTotalPaidInYear = (subMatch: string) => {
    return carTransactions
      .filter(t => t.subcategory && t.subcategory.includes(subMatch))
      .filter(t => new Date(t.date).getFullYear() === currentYear)
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const ipvaPaid = calculateTotalPaidInYear('IPVA');
  const insurancePaid = calculateTotalPaidInYear('Seguro');
  const ipvaProgress = car.ipvaTotal > 0 ? (ipvaPaid / car.ipvaTotal) * 100 : 0;
  const insuranceProgress = car.insuranceTotal > 0 ? (insurancePaid / car.insuranceTotal) * 100 : 0;

  const getSubIcon = (sub: string) => {
    if (sub.includes('Preventiva') || sub.includes('Manutenção')) return Wrench;
    if (sub.includes('Combustível')) return Fuel;
    if (sub.includes('IPVA')) return FileText;
    if (sub.includes('Seguro')) return ShieldCheck;
    return Settings;
  };

  return (
    <div className="pb-32 animate-in slide-in-from-right duration-300 relative min-h-screen">
      
      {/* FAB */}
      <button 
        onClick={() => onQuickAdd('')} 
        className="fixed bottom-8 right-6 w-14 h-14 bg-[#162660] text-white rounded-full shadow-xl shadow-blue-900/30 flex items-center justify-center z-50 active:scale-90 transition-transform hover:bg-[#1e3a8a] md:hidden"
      >
        <Plus size={32} />
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-6 pt-4">
         <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 bg-white rounded-full text-gray-500 hover:text-[#162660] shadow-sm">
               <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-[#162660]">Meu Veículo</h2>
         </div>
         <div className="flex gap-2">
            <button onClick={() => onQuickAdd('')} className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#162660] text-white rounded-xl text-sm font-bold hover:bg-[#1e3a8a]">
               <Plus size={16} /> Novo Gasto
            </button>
            <button onClick={onOpenSettings} className="p-2 bg-white rounded-full text-gray-400 hover:text-[#162660] shadow-sm">
               <Settings size={20} />
            </button>
         </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
         
         {/* 1. Dashboard Hero (KM & Model) - Span 12 on mobile, 8 on desktop */}
         <div className="col-span-12 md:col-span-8 bg-[#162660] rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-xl shadow-blue-900/20">
             <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
             
             <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                 <div>
                     <div className="flex items-center gap-2 mb-2 opacity-80">
                         <Settings size={18} />
                         <span className="text-sm font-bold uppercase tracking-wider">{car.modelName || 'Carro Principal'}</span>
                     </div>
                     <h3 className="text-5xl font-bold font-mono tracking-tighter">
                         {currentKm > 0 ? (currentKm/1000).toFixed(0) : '0'}
                         <span className="text-2xl text-blue-300 ml-1">k km</span>
                     </h3>
                     <p className="text-xs text-blue-200 mt-2">Placa Final: {car.plateLastDigit || '?'}</p>
                 </div>

                 <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm min-w-[160px]">
                     <p className="text-xs text-blue-200 mb-1">Gasto (Mês Atual)</p>
                     <p className="text-2xl font-bold">{formatCurrency(monthlySpend)}</p>
                 </div>
             </div>
         </div>

         {/* 2. Quick Actions (Span 12 mobile, 4 desktop) */}
         <div className="col-span-12 md:col-span-4 flex flex-col gap-3">
             <button onClick={() => onQuickAdd('Combustível')} className="flex-1 bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                 <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <Fuel size={24} />
                 </div>
                 <div className="text-left">
                     <p className="font-bold text-[#162660]">Abastecer</p>
                     <p className="text-xs text-gray-400">Registrar combustível</p>
                 </div>
             </button>
             <button onClick={() => onQuickAdd('Manutenção')} className="flex-1 bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all flex items-center gap-4 group">
                 <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                     <Wrench size={24} />
                 </div>
                 <div className="text-left">
                     <p className="font-bold text-[#162660]">Oficina</p>
                     <p className="text-xs text-gray-400">Registrar manutenção</p>
                 </div>
             </button>
         </div>

         {/* 3. Taxes Progress (Span 6 each) */}
         <div className="col-span-12 md:col-span-6 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center gap-3">
                     <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                         <FileText size={20} />
                     </div>
                     <span className="font-bold text-[#162660]">IPVA {currentYear}</span>
                 </div>
                 <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">{ipvaProgress.toFixed(0)}% Pago</span>
             </div>
             <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                 <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(ipvaProgress, 100)}%` }}></div>
             </div>
             <div className="flex justify-between text-xs text-gray-400">
                 <span>Pago: {formatCurrency(ipvaPaid)}</span>
                 <span>Total: {formatCurrency(car.ipvaTotal)}</span>
             </div>
         </div>

         <div className="col-span-12 md:col-span-6 bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm">
             <div className="flex justify-between items-center mb-4">
                 <div className="flex items-center gap-3">
                     <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                         <ShieldCheck size={20} />
                     </div>
                     <span className="font-bold text-[#162660]">Seguro Auto</span>
                 </div>
                 <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">{insuranceProgress.toFixed(0)}% Pago</span>
             </div>
             <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
                 <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(insuranceProgress, 100)}%` }}></div>
             </div>
             <div className="flex justify-between text-xs text-gray-400">
                 <span>Pago: {formatCurrency(insurancePaid)}</span>
                 <span>Total: {formatCurrency(car.insuranceTotal)}</span>
             </div>
         </div>

         {/* 4. History Table (Span 12) */}
         <div className="col-span-12 bg-[#FFFDF5] rounded-[2.5rem] p-6 border border-gray-100 shadow-sm">
             <h3 className="font-bold text-[#162660] mb-4">Histórico Recente</h3>
             <div className="space-y-3">
                {carTransactions.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">Nenhum registro encontrado.</div>
                ) : (
                  carTransactions.slice(0, 5).map((t) => {
                    const sub = t.subcategory || '';
                    const Icon = getSubIcon(sub);
                    const isFuel = sub.includes('Combustível');
                    return (
                      <div key={t.id} className="flex items-center justify-between p-4 bg-white border border-gray-50 rounded-2xl hover:bg-gray-50 transition-colors">
                         <div className="flex items-center gap-4">
                             <div className="w-10 h-10 rounded-xl bg-gray-100 text-gray-500 flex items-center justify-center">
                                 <Icon size={18} />
                             </div>
                             <div>
                                 <p className="font-bold text-[#162660] text-sm">{sub || 'Geral'}</p>
                                 <p className="text-xs text-gray-400">{formatDate(t.date)} {isFuel && t.liters && `• ${t.liters}L`}</p>
                             </div>
                         </div>
                         <div className="flex items-center gap-3">
                             <span className="font-bold text-[#162660]">{formatCurrency(t.amount)}</span>
                             <button onClick={() => onEditTransaction(t)} className="p-2 text-gray-300 hover:text-[#162660]">
                                 <Edit3 size={16} />
                             </button>
                         </div>
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