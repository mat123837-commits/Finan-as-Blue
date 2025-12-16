import React, { useState, useEffect } from 'react';
import { X, Save, Car, Home, Wallet, Calculator, RefreshCw, Trash2 } from 'lucide-react';
import { Debt } from '../types';
import { formatCurrency } from '../constants';

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (debt: any) => void;
  onDelete?: (id: string) => void;
  initialData?: Debt | null;
}

export const LoanModal: React.FC<LoanModalProps> = ({ isOpen, onClose, onSave, onDelete, initialData }) => {
  const [name, setName] = useState('');
  const [totalValue, setTotalValue] = useState('');
  const [installments, setInstallments] = useState('');
  const [paid, setPaid] = useState('0');
  const [dueDay, setDueDay] = useState('10');
  const [category, setCategory] = useState<'personal'|'vehicle'|'house'>('personal');
  const [installmentValue, setInstallmentValue] = useState('');

  // Effect to populate form on edit or reset on create
  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setName(initialData.name);
            setTotalValue(initialData.totalValue.toString());
            setInstallments(initialData.installmentsTotal.toString());
            setPaid(initialData.installmentsPaid.toString());
            setDueDay(initialData.dueDate.toString());
            setCategory(initialData.category || 'personal');
            setInstallmentValue(initialData.installmentValue ? initialData.installmentValue.toString() : '');
        } else {
            setName('');
            setTotalValue('');
            setInstallments('');
            setPaid('0');
            setDueDay('10');
            setCategory('personal');
            setInstallmentValue('');
        }
    }
  }, [isOpen, initialData]);

  // Effect to auto-suggest installment value if both Total and Count are present AND user hasn't typed yet (Only in create mode)
  useEffect(() => {
     if (!initialData && totalValue && installments && !installmentValue) {
        const calc = (parseFloat(totalValue) / parseInt(installments));
        if (!isNaN(calc) && isFinite(calc)) {
            setInstallmentValue(calc.toFixed(2));
        }
     }
  }, [totalValue, installments, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      totalValue: parseFloat(totalValue) || 0,
      installmentsTotal: parseInt(installments) || 1,
      installmentsPaid: parseInt(paid) || 0,
      dueDate: parseInt(dueDay) || 10,
      installmentValue: parseFloat(installmentValue) || 0,
      category
    };

    if (initialData) {
        onSave({ ...data, id: initialData.id });
    } else {
        onSave(data);
    }
    onClose();
  };

  const handleDelete = () => {
    if (initialData && onDelete && confirm('Deseja excluir este empréstimo?')) {
        onDelete(initialData.id);
        onClose();
    }
  };

  const recalcTotal = () => {
     if (installmentValue && installments) {
        const newTotal = parseFloat(installmentValue) * parseInt(installments);
        setTotalValue(newTotal.toFixed(2));
     }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#162660]">{initialData ? 'Editar Empréstimo' : 'Novo Empréstimo'}</h2>
          <div className="flex gap-2">
            {initialData && onDelete && (
                <button onClick={handleDelete} className="p-2 bg-rose-50 rounded-full hover:bg-rose-100 text-rose-500">
                    <Trash2 size={20} />
                </button>
            )}
            <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                <X size={20} className="text-[#162660]" />
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block text-xs font-bold text-[#162660] uppercase mb-1">Nome do Empréstimo</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Financiamento Carro" className="w-full px-4 py-3 bg-gray-50 rounded-3xl text-[#162660] font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>

          <div className="flex gap-3">
             <div className="flex-1">
                <label className="block text-xs font-bold text-[#162660] uppercase mb-1">Total Parcelas</label>
                <input type="number" required min="1" value={installments} onChange={(e) => setInstallments(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-3xl text-[#162660] font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
             </div>
             <div className="flex-1">
                <label className="block text-xs font-bold text-[#162660] uppercase mb-1">Já Pagas</label>
                <input type="number" min="0" value={paid} onChange={(e) => setPaid(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-3xl text-[#162660] font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
             </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#162660] uppercase mb-1">Valor da Parcela (Real)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                  <input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={installmentValue} 
                    onChange={(e) => setInstallmentValue(e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 bg-white rounded-3xl text-[#162660] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-sm" 
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1 leading-tight">O valor exato que você paga por mês.</p>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                   <label className="block text-xs font-bold text-[#162660] uppercase">Valor Total (Dívida)</label>
                   <button type="button" onClick={recalcTotal} className="text-[10px] text-blue-600 flex items-center gap-1 hover:underline">
                      <RefreshCw size={10} /> Recalcular pelo valor da parcela
                   </button>
                </div>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">R$</span>
                  <input type="number" step="0.01" required value={totalValue} onChange={(e) => setTotalValue(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white rounded-3xl text-[#162660] font-bold text-lg focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-sm" />
                </div>
              </div>
          </div>

          <div>
             <label className="block text-xs font-bold text-[#162660] uppercase mb-1">Dia do Vencimento</label>
             <input type="number" min="1" max="31" value={dueDay} onChange={(e) => setDueDay(e.target.value)} className="w-full px-4 py-3 bg-gray-50 rounded-3xl text-[#162660] font-medium focus:outline-none focus:ring-2 focus:ring-slate-200" />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#162660] uppercase mb-2">Categoria</label>
            <div className="flex gap-2">
              {[
                { id: 'personal', label: 'Pessoal', icon: Wallet },
                { id: 'vehicle', label: 'Veículo', icon: Car },
                { id: 'house', label: 'Casa', icon: Home }
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id as any)}
                  className={`flex-1 flex flex-col items-center justify-center py-3 rounded-3xl border transition-all ${
                    category === cat.id 
                      ? 'bg-slate-800 text-white border-slate-800' 
                      : 'bg-white border-gray-200 text-gray-400'
                  }`}
                >
                  <cat.icon size={20} className="mb-1" />
                  <span className="text-[10px] font-bold">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#162660] text-white rounded-3xl font-bold text-base shadow-lg shadow-blue-900/20 active:scale-95 transition-transform flex items-center justify-center gap-2 mt-2"
          >
            <Save size={18} />
            {initialData ? 'Atualizar' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  );
};