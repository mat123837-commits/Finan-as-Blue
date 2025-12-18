
import React, { useState } from 'react';
import { AppData, FixedExpense, FixedIncome, CategoryKey, CATEGORIES } from '../types';
import { User, Wallet, Car, Home, Heart, Save, Plus, Trash2, CalendarClock, Banknote, ChevronRight, Menu, AlertTriangle, RefreshCcw, ArrowUpCircle } from 'lucide-react';
import { formatCurrency } from '../constants';

interface SettingsViewProps {
  data: AppData;
  onUpdateProfile: (name: string, balance: number, benefit: number) => void;
  onUpdateConfigs: (category: 'car' | 'house' | 'partner', config: any) => void;
  onAddFixedExpense: (expense: Omit<FixedExpense, 'id'>) => void;
  onDeleteFixedExpense: (id: string) => void;
  onAddFixedIncome: (income: Omit<FixedIncome, 'id'>) => void;
  onDeleteFixedIncome: (id: string) => void;
  onResetData: () => void;
  onOpenSidebar: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  data, onUpdateProfile, onUpdateConfigs, onAddFixedExpense, 
  onDeleteFixedExpense, onAddFixedIncome, onDeleteFixedIncome, onResetData, onOpenSidebar 
}) => {
  const [userName, setUserName] = useState(data.userName);
  const [balance, setBalance] = useState(data.initialBalance?.toString() || '0');
  const [benefit, setBenefit] = useState(data.initialBenefitBalance?.toString() || '0');

  // Local state for Fixed Expense
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expDay, setExpDay] = useState('1');

  // Local state for Fixed Income
  const [incTitle, setIncTitle] = useState('');
  const [incAmount, setIncAmount] = useState('');
  const [incDay, setIncDay] = useState('1');

  const [isResetConfirming, setIsResetConfirming] = useState(false);

  const handleSaveProfile = () => {
    onUpdateProfile(userName, parseFloat(balance) || 0, parseFloat(benefit) || 0);
  };

  const handleAddExpense = () => {
    if (!expTitle || !expAmount) return;
    onAddFixedExpense({ title: expTitle, amount: parseFloat(expAmount), day: parseInt(expDay), category: 'others' });
    setExpTitle(''); setExpAmount('');
  };

  const handleAddIncome = () => {
    if (!incTitle || !incAmount) return;
    onAddFixedIncome({ title: incTitle, amount: parseFloat(incAmount), day: parseInt(incDay), category: 'others' });
    setIncTitle(''); setIncAmount('');
  };

  const confirmReset = () => {
    onResetData();
    setIsResetConfirming(false);
  };

  return (
    <div className="pb-32 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-3 mb-8 pt-4">
        <button onClick={onOpenSidebar} className="p-2 bg-[#FFFDF5] rounded-full shadow-sm text-[#13312A] active:scale-95">
          <Menu size={20} />
        </button>
        <h2 className="text-2xl font-bold text-[#13312A] font-serif">Ajustes & Configurações</h2>
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* --- 1. PERFIL E SALDO (BENTO ESQUERDA) --- */}
        <div className="col-span-12 lg:col-span-4 bg-white rounded-[2.5rem] p-8 border border-[#13312A]/5 shadow-sm h-fit">
          <h3 className="flex items-center gap-2 font-bold text-[#13312A] mb-6 font-serif uppercase text-[10px] tracking-widest">
            <User size={18} className="text-[#C69A72]" /> Meu Perfil
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-[9px] font-bold text-[#155446]/40 uppercase tracking-widest mb-1 ml-1">Nome de Exibição</label>
              <input type="text" value={userName} onChange={e => setUserName(e.target.value)} className="w-full bg-[#F6E9CA]/20 border-none rounded-2xl p-4 text-[#13312A] font-bold outline-none focus:ring-2 focus:ring-[#C69A72]" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-[#155446]/40 uppercase tracking-widest mb-1 ml-1">Saldo em Conta (R$)</label>
              <input type="number" value={balance} onChange={e => setBalance(e.target.value)} className="w-full bg-[#F6E9CA]/20 border-none rounded-2xl p-4 text-[#13312A] font-bold outline-none focus:ring-2 focus:ring-[#C69A72]" />
            </div>
            <div>
              <label className="block text-[9px] font-bold text-[#155446]/40 uppercase tracking-widest mb-1 ml-1">Saldo VA/VR (R$)</label>
              <input type="number" value={benefit} onChange={e => setBenefit(e.target.value)} className="w-full bg-[#F6E9CA]/20 border-none rounded-2xl p-4 text-[#13312A] font-bold outline-none focus:ring-2 focus:ring-[#C69A72]" />
            </div>
            <button onClick={handleSaveProfile} className="w-full py-4 bg-[#13312A] text-[#C69A72] rounded-2xl font-bold font-serif flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-[#13312A]/10 mt-2">
              <Save size={18} /> Salvar Perfil
            </button>
          </div>
        </div>

        {/* --- 2. COLUNA DIREITA: ITENS RECORRENTES --- */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          
          {/* RECEITAS RECORRENTES */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-[#13312A]/5 shadow-sm">
            <h3 className="flex items-center gap-2 font-bold text-[#155446] mb-6 font-serif uppercase text-[10px] tracking-widest">
              <ArrowUpCircle size={18} className="text-emerald-600" /> Receitas Recorrentes (Mensais)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 bg-emerald-50/30 p-4 rounded-3xl border border-dashed border-emerald-600/10">
               <input type="text" placeholder="Salário, Aluguel..." value={incTitle} onChange={e => setIncTitle(e.target.value)} className="bg-white rounded-xl p-3 text-sm font-bold outline-none focus:ring-1 focus:ring-emerald-600" />
               <input type="number" placeholder="Valor" value={incAmount} onChange={e => setIncAmount(e.target.value)} className="bg-white rounded-xl p-3 text-sm font-bold outline-none focus:ring-1 focus:ring-emerald-600" />
               <input type="number" placeholder="Dia" value={incDay} onChange={e => setIncDay(e.target.value)} className="bg-white rounded-xl p-3 text-sm font-bold outline-none text-center focus:ring-1 focus:ring-emerald-600" />
               <button onClick={handleAddIncome} className="bg-[#155446] text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
                  <Plus size={16} /> Adicionar
               </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
              {data.fixedIncomes.length === 0 ? (
                <div className="text-center py-6 text-gray-300 text-[10px] font-bold uppercase tracking-widest italic opacity-50">Nenhuma receita fixa.</div>
              ) : data.fixedIncomes.map(income => (
                <div key={income.id} className="flex items-center justify-between p-4 bg-emerald-50/10 border border-emerald-600/5 rounded-2xl group hover:bg-emerald-50/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#155446] flex items-center justify-center">
                      <Banknote size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-[#13312A] text-sm">{income.title}</p>
                      <p className="text-[9px] font-bold text-[#155446]/60 uppercase tracking-tighter">Recebe dia {income.day}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="font-bold text-emerald-600 font-serif">{formatCurrency(income.amount)}</span>
                     <button onClick={() => onDeleteFixedIncome(income.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                       <Trash2 size={16} />
                     </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* GASTOS FIXOS */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-[#13312A]/5 shadow-sm">
            <h3 className="flex items-center gap-2 font-bold text-[#13312A] mb-6 font-serif uppercase text-[10px] tracking-widest">
              <CalendarClock size={18} className="text-rose-500" /> Gastos Fixos (Mensais)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6 bg-rose-50/30 p-4 rounded-3xl border border-dashed border-rose-600/10">
               <input type="text" placeholder="Aluguel, Academia..." value={expTitle} onChange={e => setExpTitle(e.target.value)} className="bg-white rounded-xl p-3 text-sm font-bold outline-none focus:ring-1 focus:ring-rose-500" />
               <input type="number" placeholder="Valor" value={expAmount} onChange={e => setExpAmount(e.target.value)} className="bg-white rounded-xl p-3 text-sm font-bold outline-none focus:ring-1 focus:ring-rose-500" />
               <input type="number" placeholder="Dia" value={expDay} onChange={e => setExpDay(e.target.value)} className="bg-white rounded-xl p-3 text-sm font-bold outline-none text-center focus:ring-1 focus:ring-rose-500" />
               <button onClick={handleAddExpense} className="bg-[#13312A] text-[#C69A72] rounded-xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
                  <Plus size={16} /> Adicionar
               </button>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
              {data.fixedExpenses.length === 0 ? (
                <div className="text-center py-6 text-gray-300 text-[10px] font-bold uppercase tracking-widest italic opacity-50">Nenhum gasto fixo.</div>
              ) : data.fixedExpenses.map(expense => (
                <div key={expense.id} className="flex items-center justify-between p-4 bg-rose-50/10 border border-rose-600/5 rounded-2xl group hover:bg-rose-50/20 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-500 flex items-center justify-center">
                      <CalendarClock size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-[#13312A] text-sm">{expense.title}</p>
                      <p className="text-[9px] font-bold text-rose-400/60 uppercase tracking-tighter">Vence dia {expense.day}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="font-bold text-rose-600 font-serif">{formatCurrency(expense.amount)}</span>
                     <button onClick={() => onDeleteFixedExpense(expense.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                       <Trash2 size={16} />
                     </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- 3. CONFIGURAÇÕES DE VIDA (BENTO RODAPÉ) --- */}
        <div className="col-span-12 grid grid-cols-1 md:grid-cols-3 gap-6">
           {/* CASA */}
           <div className="bg-white rounded-[2.5rem] p-6 border border-[#13312A]/5 shadow-sm">
             <div className="flex items-center gap-2 mb-6"><Home size={18} className="text-emerald-600" /><h4 className="font-bold text-[10px] uppercase tracking-widest text-[#13312A]">Config. Residenciais</h4></div>
             <div className="space-y-4">
                <div className="flex justify-between items-center text-xs"><span className="text-gray-400">Aluguel Estimado</span><input type="number" value={data.house.rentAmount} onChange={e => onUpdateConfigs('house', {...data.house, rentAmount: parseFloat(e.target.value)})} className="w-24 text-right font-bold text-[#13312A] bg-transparent outline-none focus:underline" /></div>
                <div className="flex justify-between items-center text-xs"><span className="text-gray-400">Teto de Mercado</span><input type="number" value={data.house.marketBudget} onChange={e => onUpdateConfigs('house', {...data.house, marketBudget: parseFloat(e.target.value)})} className="w-24 text-right font-bold text-[#13312A] bg-transparent outline-none focus:underline" /></div>
             </div>
           </div>
           {/* CARRO */}
           <div className="bg-white rounded-[2.5rem] p-6 border border-[#13312A]/5 shadow-sm">
             <div className="flex items-center gap-2 mb-6"><Car size={18} className="text-blue-600" /><h4 className="font-bold text-[10px] uppercase tracking-widest text-[#13312A]">Painel do Veículo</h4></div>
             <div className="space-y-4">
                <div className="flex justify-between items-center text-xs"><span className="text-gray-400">Modelo</span><input type="text" value={data.car.modelName} onChange={e => onUpdateConfigs('car', {...data.car, modelName: e.target.value})} className="w-24 text-right font-bold text-[#13312A] bg-transparent outline-none focus:underline" /></div>
                <div className="flex justify-between items-center text-xs"><span className="text-gray-400">Estimativa IPVA</span><input type="number" value={data.car.ipvaTotal} onChange={e => onUpdateConfigs('car', {...data.car, ipvaTotal: parseFloat(e.target.value)})} className="w-24 text-right font-bold text-[#13312A] bg-transparent outline-none focus:underline" /></div>
             </div>
           </div>
           {/* RELACIONAMENTO */}
           <div className="bg-white rounded-[2.5rem] p-6 border border-[#13312A]/5 shadow-sm">
             <div className="flex items-center gap-2 mb-6"><Heart size={18} className="text-rose-500" /><h4 className="font-bold text-[10px] uppercase tracking-widest text-[#13312A]">Relacionamento</h4></div>
             <div className="space-y-4">
                <div className="flex justify-between items-center text-xs"><span className="text-gray-400">Nome Parceiro(a)</span><input type="text" value={data.partner.partnerName} onChange={e => onUpdateConfigs('partner', {...data.partner, partnerName: e.target.value})} className="w-24 text-right font-bold text-[#13312A] bg-transparent outline-none focus:underline" /></div>
                <div className="flex justify-between items-center text-xs"><span className="text-gray-400">Orçamento Dates</span><input type="number" value={data.partner.dateBudget} onChange={e => onUpdateConfigs('partner', {...data.partner, dateBudget: parseFloat(e.target.value)})} className="w-24 text-right font-bold text-[#13312A] bg-transparent outline-none focus:underline" /></div>
             </div>
           </div>
        </div>

        {/* --- 4. ZONA DE RISCO --- */}
        <div className="col-span-12 mt-4">
          <div className="bg-[#9F3E34]/5 rounded-[2.5rem] p-8 border border-[#9F3E34]/10 shadow-sm overflow-hidden relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#9F3E34]/10 rounded-2xl flex items-center justify-center text-[#9F3E34]">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-[#9F3E34] font-serif uppercase text-[10px] tracking-widest">Zona de Segurança</h3>
                  <p className="text-[#9F3E34]/60 text-xs font-medium">Resetar dados limpa todo o histórico e configurações atuais.</p>
                </div>
              </div>

              {!isResetConfirming ? (
                <button 
                  onClick={() => setIsResetConfirming(true)}
                  className="px-6 py-3 bg-[#9F3E34] text-white rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-95 shadow-lg shadow-[#9F3E34]/20"
                >
                  <RefreshCcw size={18} /> Zerar Todos os Dados
                </button>
              ) : (
                <div className="flex items-center gap-3 animate-in zoom-in-95 duration-200">
                  <span className="text-[10px] font-bold text-[#9F3E34] uppercase">Confirmar?</span>
                  <button onClick={() => setIsResetConfirming(false)} className="px-4 py-2 bg-white border border-gray-200 text-[#13312A] rounded-xl font-bold text-[10px] uppercase">Sair</button>
                  <button onClick={confirmReset} className="px-5 py-2 bg-red-600 text-white rounded-xl font-bold text-[10px] uppercase shadow-lg shadow-red-600/20">Zerar</button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
