
import React, { useState, useEffect } from 'react';
import { X, Save, ShieldCheck, Target, PiggyBank, TrendingUp, Trash2, ArrowRight, Check } from 'lucide-react';
import { Investment } from '../types';
import { formatCurrency, CARD_GRADIENTS } from '../constants';

interface InvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (inv: any) => void;
  onDelete: (id: string) => void;
  initialType?: Investment['type'];
  initialData: Investment | null;
}

const TYPE_CONFIG = {
  reserve: { label: 'Reserva', icon: ShieldCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  goal: { label: 'Meta', icon: Target, color: 'text-rose-500', bg: 'bg-rose-50' },
  fixed: { label: 'Renda Fixa', icon: PiggyBank, color: 'text-[#C69A72]', bg: 'bg-[#C69A72]/10' },
  variable: { label: 'Variável', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
};

export const InvestmentModal: React.FC<InvestmentModalProps> = ({ isOpen, onClose, onSave, onDelete, initialType, initialData }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [type, setType] = useState<Investment['type']>('fixed');
  const [colorKey, setColorKey] = useState('green');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        setAmount(initialData.amount.toString());
        setTargetAmount(initialData.targetAmount?.toString() || '');
        setType(initialData.type);
        const foundColor = Object.keys(CARD_GRADIENTS).find(k => CARD_GRADIENTS[k] === initialData.color) || 'green';
        setColorKey(foundColor);
      } else {
        setName(initialType === 'reserve' ? 'Reserva de Emergência' : '');
        setAmount('');
        setTargetAmount('');
        setType(initialType || 'fixed');
        setColorKey(initialType === 'reserve' ? 'green' : 'gold');
      }
    }
  }, [isOpen, initialType, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData?.id,
      name,
      amount: parseFloat(amount) || 0,
      targetAmount: targetAmount ? parseFloat(targetAmount) : undefined,
      type,
      color: CARD_GRADIENTS[colorKey],
      icon: type // Usamos o tipo como identificador do ícone
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-[#FFFDF5] w-full max-w-sm rounded-[3rem] p-8 shadow-2xl animate-in zoom-in-95 border-2 border-[#13312A]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#13312A] font-serif">
            {initialData ? 'Editar Aporte' : 'Novo Ativo'}
          </h2>
          <button onClick={onClose} className="p-2 bg-[#13312A]/5 rounded-full hover:bg-red-50 transition-colors">
            <X size={20} className="text-[#13312A]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* TIPO DE INVESTIMENTO */}
          <div>
            <label className="block text-[10px] font-bold text-[#13312A]/40 uppercase tracking-widest mb-3 ml-1">Categoria</label>
            <div className="grid grid-cols-4 gap-2">
                {(Object.keys(TYPE_CONFIG) as Array<Investment['type']>).map((t) => {
                    const Config = TYPE_CONFIG[t];
                    const Icon = Config.icon;
                    return (
                        <button 
                            key={t} 
                            type="button" 
                            onClick={() => setType(t)}
                            className={`flex flex-col items-center justify-center aspect-square rounded-2xl border-2 transition-all ${type === t ? 'bg-[#13312A] text-[#C69A72] border-[#13312A] shadow-lg scale-105' : 'bg-white border-[#13312A]/5 text-gray-300'}`}
                        >
                            <Icon size={20} />
                            <span className="text-[8px] font-bold mt-2 uppercase tracking-tighter">{Config.label}</span>
                        </button>
                    );
                })}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-[#13312A]/40 uppercase tracking-widest mb-1 ml-1">Nome do Ativo</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                required 
                placeholder="Ex: Tesouro Selic, CDB..."
                className="w-full bg-white border border-[#13312A]/10 rounded-2xl px-5 py-3 font-bold text-[#13312A] outline-none focus:ring-2 focus:ring-[#C69A72]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold text-[#13312A]/40 uppercase tracking-widest mb-1 ml-1">Valor Atual</label>
                    <input 
                        type="number" 
                        step="0.01"
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        required 
                        className="w-full bg-white border border-[#13312A]/10 rounded-2xl px-5 py-3 font-bold text-[#13312A] outline-none focus:ring-2 focus:ring-[#C69A72]"
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-[#13312A]/40 uppercase tracking-widest mb-1 ml-1">Meta (Opcional)</label>
                    <input 
                        type="number" 
                        step="0.01"
                        value={targetAmount} 
                        onChange={e => setTargetAmount(e.target.value)} 
                        placeholder="R$ 0,00"
                        className="w-full bg-white border border-[#13312A]/10 rounded-2xl px-5 py-3 font-bold text-[#13312A] outline-none focus:ring-2 focus:ring-[#C69A72]"
                    />
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-bold text-[#13312A]/40 uppercase tracking-widest mb-2 ml-1">Cor do Card</label>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                    {Object.keys(CARD_GRADIENTS).map(key => (
                        <button 
                            key={key} 
                            type="button" 
                            onClick={() => setColorKey(key)}
                            className={`w-8 h-8 rounded-full border-2 shrink-0 transition-all flex items-center justify-center ${colorKey === key ? 'border-[#13312A] scale-110 shadow-md' : 'border-transparent opacity-50'}`}
                            style={{ background: CARD_GRADIENTS[key] }}
                        >
                            {colorKey === key && <Check size={12} className="text-white" />}
                        </button>
                    ))}
                </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            {initialData && (
                <button 
                    type="button" 
                    onClick={() => { if(confirm('Excluir este ativo?')) { onDelete(initialData.id); onClose(); } }}
                    className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-95"
                >
                    <Trash2 size={20} />
                </button>
            )}
            <button 
                type="submit" 
                className="flex-1 py-4 bg-[#13312A] text-[#C69A72] rounded-2xl font-bold font-serif flex items-center justify-center gap-2 shadow-lg shadow-[#13312A]/20 active:scale-95 transition-all"
            >
                <Save size={20} /> {initialData ? 'Atualizar' : 'Confirmar Aporte'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
