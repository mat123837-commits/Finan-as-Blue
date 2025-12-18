
import React from 'react';
import { AppData, Transaction } from '../types';
import { formatCurrency, formatDate } from '../constants';
import { Settings, Wrench, Fuel, FileText, ShieldCheck, Menu, Plus, Edit3, Activity, Car, Gauge, MapPin } from 'lucide-react';
import { AnimatedNumber } from './AnimatedNumber';

interface CarViewProps {
  data: AppData;
  onBack: () => void;
  onOpenSettings: () => void;
  onQuickAdd: (subcategory: string) => void;
  onOpenSidebar: () => void;
  onEditTransaction: (transaction: Transaction) => void;
}

export const CarView: React.FC<CarViewProps> = ({ data, onBack, onOpenSettings, onQuickAdd, onOpenSidebar, onEditTransaction }) => {
  const { transactions, car, showValues } = data;
  const carTransactions = transactions.filter(t => t.category === 'car' && t.type === 'expense').sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const currentKm = carTransactions.find(t => t.carKm)?.carKm || 0;
  const monthlySpend = carTransactions.filter(t => new Date(t.date).getMonth() === new Date().getMonth()).reduce((acc, t) => acc + t.amount, 0);

  const ipvaPaid = carTransactions.filter(t => (t.subcategory || '').includes('IPVA')).reduce((acc, t) => acc + t.amount, 0);
  const insurancePaid = carTransactions.filter(t => (t.subcategory || '').includes('Seguro')).reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="pb-32 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
         <div className="flex items-center gap-4">
            <button onClick={onOpenSidebar} className="p-2 bg-white rounded-xl shadow-sm text-[#13312A]"><Menu size={20} /></button>
            <h2 className="text-2xl font-bold text-[#13312A] font-serif">Meu Veículo</h2>
         </div>
         <button onClick={onOpenSettings} className="p-3 bg-white rounded-2xl text-gray-400 hover:text-[#13312A] transition-all"><Settings size={22} /></button>
      </div>

      <div className="grid grid-cols-12 gap-4">
        
        {/* BENTO: ODÔMETRO (MAIN CARD) */}
        <div className="col-span-12 lg:col-span-8 bg-[#13312A] rounded-[2.5rem] p-8 text-[#F6E9CA] shadow-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
           <div className="absolute top-0 right-0 p-8 opacity-10"><Gauge size={140} /></div>
           <div className="relative z-10">
              <span className="text-[10px] font-bold text-[#C69A72] uppercase tracking-[0.3em]">Quilometragem Total</span>
              <div className="text-7xl font-bold font-serif tracking-tighter flex items-baseline gap-2 mt-2">
                 <AnimatedNumber value={currentKm} className="text-white" />
                 <span className="text-xl font-sans font-bold text-[#C69A72] opacity-60">KM</span>
              </div>
           </div>
           <div className="relative z-10 flex items-center gap-2 text-[10px] font-medium opacity-60">
              <MapPin size={12} /> {car.modelName || 'Veículo Registrado'} • Atualizado recentemente
           </div>
        </div>

        {/* BENTO: GASTO MENSAL (SQUARE) */}
        <div className="col-span-6 lg:col-span-2 bg-white rounded-[2.5rem] p-6 border border-[#13312A]/5 shadow-sm flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-[#F6E9CA] text-[#13312A] flex items-center justify-center"><Activity size={20} /></div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Mês Atual</p>
              <div className="text-xl font-bold text-[#13312A] font-serif">
                <AnimatedNumber value={monthlySpend} />
              </div>
            </div>
        </div>

        {/* BENTO: LICENCIAMENTO (SQUARE) */}
        <div className="col-span-6 lg:col-span-2 bg-white rounded-[2.5rem] p-6 border border-[#13312A]/5 shadow-sm flex flex-col justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"><FileText size={20} /></div>
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Licenciar</p>
              <div className="text-xl font-bold text-[#13312A] font-serif">
                {car.licensingTotal > 0 ? formatCurrency(car.licensingTotal) : '--'}
              </div>
            </div>
        </div>

        {/* BENTO: QUICK ACTION FUEL */}
        <button onClick={() => onQuickAdd('Combustível')} className="col-span-6 lg:col-span-3 bg-[#C69A72] rounded-[2.5rem] p-6 shadow-lg shadow-[#C69A72]/20 flex items-center gap-4 group hover:scale-[1.02] transition-all">
           <div className="w-12 h-12 rounded-2xl bg-[#13312A] text-[#C69A72] flex items-center justify-center group-hover:scale-110 transition-transform"><Fuel size={24} /></div>
           <span className="font-bold text-[#13312A] uppercase text-xs tracking-widest">Abastecer</span>
        </button>

        {/* BENTO: QUICK ACTION SERVICE */}
        <button onClick={() => onQuickAdd('Manutenção')} className="col-span-6 lg:col-span-3 bg-white rounded-[2.5rem] p-6 border border-[#13312A]/5 shadow-sm flex items-center gap-4 group hover:scale-[1.02] transition-all">
           <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition-transform"><Wrench size={24} /></div>
           <span className="font-bold text-[#13312A] uppercase text-xs tracking-widest">Oficina</span>
        </button>

        {/* BENTO: TAX PROGRESS IPVA */}
        <div className="col-span-12 lg:col-span-3 bg-white rounded-[2.5rem] p-6 border border-[#13312A]/5 shadow-sm">
           <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">IPVA Anual</span>
              <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">Pago</span>
           </div>
           <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: `${car.ipvaTotal > 0 ? (ipvaPaid / car.ipvaTotal) * 100 : 0}%` }}></div>
           </div>
           <div className="flex justify-between text-[10px] font-bold text-[#13312A] font-serif">
              <span>{formatCurrency(ipvaPaid)}</span>
              <span className="opacity-40">{formatCurrency(car.ipvaTotal)}</span>
           </div>
        </div>

        {/* BENTO: TAX PROGRESS INSURANCE */}
        <div className="col-span-12 lg:col-span-3 bg-white rounded-[2.5rem] p-6 border border-[#13312A]/5 shadow-sm">
           <div className="flex justify-between items-center mb-4">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Seguro Auto</span>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Protegido</span>
           </div>
           <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${car.insuranceTotal > 0 ? (insurancePaid / car.insuranceTotal) * 100 : 0}%` }}></div>
           </div>
           <div className="flex justify-between text-[10px] font-bold text-[#13312A] font-serif">
              <span>{formatCurrency(insurancePaid)}</span>
              <span className="opacity-40">{formatCurrency(car.insuranceTotal)}</span>
           </div>
        </div>

        {/* BENTO: DIÁRIO DE BORDO (LISTA COMPACTA) */}
        <div className="col-span-12 bg-white rounded-[2.5rem] p-8 border border-[#13312A]/5 shadow-sm mt-2">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-[#13312A] font-serif">Últimos Registros</h3>
              <Plus size={18} className="text-[#C69A72] cursor-pointer" onClick={() => onQuickAdd('')} />
           </div>
           <div className="space-y-1">
              {carTransactions.slice(0, 4).map(t => (
                <div key={t.id} onClick={() => onEditTransaction(t)} className="flex items-center justify-between p-4 hover:bg-[#F6E9CA]/30 rounded-2xl transition-all cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="text-[10px] font-bold text-gray-300 w-10">{formatDate(t.date)}</div>
                    <div className="font-bold text-[#13312A] text-sm">{t.subcategory}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-[#13312A] font-serif text-sm">{formatCurrency(t.amount)}</span>
                    <Edit3 size={14} className="text-gray-200 group-hover:text-[#13312A]" />
                  </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
};
