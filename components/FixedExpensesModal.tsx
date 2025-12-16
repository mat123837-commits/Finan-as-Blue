import React, { useState } from 'react';
import { X, Plus, Trash2, CalendarClock } from 'lucide-react';
import { FixedExpense, CategoryKey, CATEGORIES } from '../types';
import { formatCurrency } from '../constants';

interface FixedExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixedExpenses: FixedExpense[];
  onAdd: (expense: Omit<FixedExpense, 'id'>) => void;
  onDelete: (id: string) => void;
}

export const FixedExpensesModal: React.FC<FixedExpensesModalProps> = ({ isOpen, onClose, fixedExpenses, onAdd, onDelete }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [day, setDay] = useState('');
  const [category, setCategory] = useState<CategoryKey>('others');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount || !day) return;

    onAdd({
      title,
      amount: parseFloat(amount),
      day: parseInt(day),
      category
    });

    setTitle('');
    setAmount('');
    setDay('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-white w-full max-w-md rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#1B2632] flex items-center gap-2">
            <CalendarClock size={24} className="text-[#FFB162]" /> Gastos Fixos
          </h2>
          <button onClick={onClose} className="p-2 bg-[#EEE9DF] rounded-full hover:bg-[#C9C1B1]">
            <X size={20} className="text-[#1B2632]" />
          </button>
        </div>

        <div className="bg-[#EEE9DF]/50 p-4 rounded-3xl mb-6">
           <h3 className="text-sm font-bold text-[#1B2632] mb-3">Adicionar Novo</h3>
           <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                 <input 
                    type="text" 
                    placeholder="Nome (ex: Academia)" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    className="w-full px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-[#FFB162] bg-white text-sm font-medium" 
                 />
              </div>
              <div className="flex gap-2">
                 <input 
                    type="number" 
                    placeholder="Valor (R$)" 
                    value={amount} 
                    onChange={e => setAmount(e.target.value)} 
                    step="0.01"
                    className="w-full px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-[#FFB162] bg-white text-sm font-medium" 
                 />
                 <input 
                    type="number" 
                    placeholder="Dia" 
                    value={day} 
                    onChange={e => setDay(e.target.value)} 
                    min="1" max="31"
                    className="w-24 px-4 py-3 rounded-2xl border-none focus:ring-2 focus:ring-[#FFB162] bg-white text-sm font-medium text-center" 
                 />
              </div>
              <div>
                  <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                     {CATEGORIES.map(cat => (
                         <button
                            key={cat.key}
                            type="button"
                            onClick={() => setCategory(cat.key)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${category === cat.key ? 'bg-[#1B2632] text-white' : 'bg-white text-gray-400'}`}
                         >
                            {cat.label}
                         </button>
                     ))}
                  </div>
              </div>
              <button type="submit" className="w-full py-3 bg-[#1B2632] text-white rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-transform">
                 <Plus size={18} /> Adicionar
              </button>
           </form>
        </div>

        <div className="space-y-3">
           <h3 className="text-sm font-bold text-[#1B2632] px-2">Recorrentes Cadastrados</h3>
           {fixedExpenses.length === 0 ? (
               <div className="text-center py-8 text-gray-400 border border-dashed border-gray-200 rounded-3xl">
                   Nenhum gasto fixo.
               </div>
           ) : (
               fixedExpenses.map(item => (
                   <div key={item.id} className="flex justify-between items-center p-4 bg-white border border-[#EEE9DF] rounded-2xl shadow-sm">
                       <div>
                           <p className="font-bold text-[#1B2632]">{item.title}</p>
                           <p className="text-xs text-gray-400">Todo dia {item.day} • {formatCurrency(item.amount)}</p>
                       </div>
                       <button onClick={() => onDelete(item.id)} className="p-2 text-rose-400 hover:bg-rose-50 rounded-xl transition-colors">
                           <Trash2 size={18} />
                       </button>
                   </div>
               ))
           )}
        </div>

      </div>
    </div>
  );
};
