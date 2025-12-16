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

  // --- Gesture Logic ---
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isRightSwipe) {
      onBack();
    }
  };
  // ---------------------

  const carTransactions = transactions
    .filter(t => t.category === 'car' && t.type === 'expense')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Find latest KM
  const lastKmTrans = carTransactions.find(t => t.carKm);
  const currentKm = lastKmTrans?.carKm || 0;

  // Monthly Spending
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const monthlySpend = carTransactions
    .filter(t => {
        const d = new Date(t.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    })
    .reduce((acc, t) => acc + t.amount, 0);

  // Taxes Progress (Annual)
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
    <div 
        className="pb-32 animate-in slide-in-from-right duration-300 relative min-h-screen touch-pan-y"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
    >
      
      {/* FAB for Quick Add */}
      <button 
        onClick={() => onQuickAdd('')} 
        className="fixed bottom-8 right-6 w-14 h-14 bg-[#162660] text-white rounded-full shadow-xl shadow-blue-900/30 flex items-center justify-center z-50 active:scale-90 transition-transform hover:bg-[#1e3a8a]"
      >
        <Plus size={32} />
      </button>

      {/* Header with Navigation */}
      <div className="flex items-center justify-between mb-6 pt-4">
         <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-2 bg-white rounded-full text-gray-500 hover:text-[#162660] shadow-sm">
               <ArrowLeft size={20} />
            </button>
            <h2 className="text-2xl font-bold text-[#162660]">Meu Veículo</h2>
         </div>
         <button onClick={onOpenSettings} className="p-2 bg-white rounded-full text-gray-400 hover:text-[#162660] shadow-sm">
            <Settings size={20} />
         </button>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1 ml-1">{car.modelName || 'Carro Principal'}</h3>
        <p className="text-xs text-gray-400 ml-1">Placa final {car.plateLastDigit || '?'}</p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
         {/* Odometer */}
         <div className="bg-[#162660] p-5 rounded-3xl text-white relative overflow-hidden">
            <Gauge size={24} className="mb-6 text-blue-300" />
            <p className="text-xs text-blue-200 mb-1">Odômetro</p>
            <p className="text-2xl font-bold tracking-tight">{currentKm > 0 ? `${(currentKm/1000).toFixed(0)}k` : '0'} <span className="text-sm font-normal text-blue-300">km</span></p>
         </div>
         
         {/* Monthly Spend */}
         <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2">
                <Settings size={20} />
            </div>
            <div>
                <p className="text-xs text-gray-400 mb-1">Gasto (Mês)</p>
                <p className="text-xl font-bold text-[#162660]">{formatCurrency(monthlySpend)}</p>
            </div>
         </div>
      </div>

      {/* Quick Actions - Updated to rounded-3xl */}
      <div className="mb-8">
         <h3 className="font-bold text-[#162660] mb-3 px-1">Lançamento Rápido</h3>
         <div className="grid grid-cols-3 gap-3">
            <button onClick={() => onQuickAdd('Combustível')} className="flex flex-col items-center gap-2 p-4 bg-white rounded-3xl shadow-sm border border-gray-50 active:scale-95 transition-transform hover:bg-blue-50/50">
               <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Fuel size={20} />
               </div>
               <span className="text-xs font-bold text-gray-600">Abastecer</span>
            </button>
            <button onClick={() => onQuickAdd('Manutenção')} className="flex flex-col items-center gap-2 p-4 bg-white rounded-3xl shadow-sm border border-gray-50 active:scale-95 transition-transform hover:bg-blue-50/50">
               <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                  <Wrench size={20} />
               </div>
               <span className="text-xs font-bold text-gray-600">Oficina</span>
            </button>
            <button onClick={() => onQuickAdd('IPVA')} className="flex flex-col items-center gap-2 p-4 bg-white rounded-3xl shadow-sm border border-gray-50 active:scale-95 transition-transform hover:bg-blue-50/50">
               <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <FileText size={20} />
               </div>
               <span className="text-xs font-bold text-gray-600">Imposto</span>
            </button>
         </div>
      </div>

      {/* Taxes & Annual Costs */}
      <div className="mb-8 space-y-4">
         <h3 className="font-bold text-[#162660] px-1">Metas Anuais</h3>
         
         {/* IPVA Widget */}
         <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50">
            <div className="flex justify-between items-center mb-3">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                     <FileText size={18} />
                  </div>
                  <div>
                     <p className="text-sm font-bold text-[#162660]">IPVA {currentYear}</p>
                     <p className="text-xs text-gray-400">Total: {formatCurrency(car.ipvaTotal)}</p>
                  </div>
               </div>
               <span className="text-xs font-bold text-indigo-600">{ipvaProgress.toFixed(0)}% Pago</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
               <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(ipvaProgress, 100)}%` }}></div>
            </div>
            <p className="text-xs text-gray-400 text-right">Falta: {formatCurrency(Math.max(car.ipvaTotal - ipvaPaid, 0))}</p>
         </div>

         {/* Insurance Widget */}
         <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-50">
            <div className="flex justify-between items-center mb-3">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                     <ShieldCheck size={18} />
                  </div>
                  <div>
                     <p className="text-sm font-bold text-[#162660]">Seguro Auto</p>
                     <p className="text-xs text-gray-400">Total: {formatCurrency(car.insuranceTotal)}</p>
                  </div>
               </div>
               <span className="text-xs font-bold text-emerald-600">{insuranceProgress.toFixed(0)}% Pago</span>
            </div>
            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden mb-2">
               <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${Math.min(insuranceProgress, 100)}%` }}></div>
            </div>
            <p className="text-xs text-gray-400 text-right">Falta: {formatCurrency(Math.max(car.insuranceTotal - insurancePaid, 0))}</p>
         </div>
      </div>

      {/* Recent History */}
      <h3 className="text-[#162660] font-bold text-lg mb-4 px-1">Histórico Recente</h3>
      <div className="space-y-3">
        {carTransactions.length === 0 ? (
          <div className="text-center py-10 text-gray-400">Nenhum registro encontrado.</div>
        ) : (
          carTransactions.slice(0, 5).map((t) => {
            const sub = t.subcategory || '';
            const Icon = getSubIcon(sub);
            const isPreventive = sub.includes('Preventiva') || sub.includes('Manutenção');
            const isFuel = sub.includes('Combustível');

            return (
              <div 
                key={t.id} 
                className={`p-4 rounded-3xl flex items-center gap-4 transition-all bg-white shadow-sm border border-gray-50`}
              >
                <div 
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                    isPreventive ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  <Icon size={18} />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-[#162660] text-sm truncate">{sub || 'Geral'}</h4>
                    <span className="font-bold text-[#162660] text-sm">{formatCurrency(t.amount)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                     <p className="text-xs text-gray-400">{formatDate(t.date)}</p>
                     {isFuel && t.liters && (
                        <div className="text-[10px] font-medium text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-lg">
                           {t.liters}L
                        </div>
                     )}
                  </div>
                </div>
                
                {/* Edit Button */}
                <button onClick={() => onEditTransaction(t)} className="p-2 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-100 hover:text-[#162660]">
                    <Edit3 size={16} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};