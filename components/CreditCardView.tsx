
import React, { useState } from 'react';
import { AppData, CATEGORIES, CategoryKey, Transaction, CreditCard, CardBrand } from '../types';
import { formatCurrency, formatDate, COLORS, CARD_GRADIENTS } from '../constants';
import { CreditCard as CardIcon, Lock, Calendar, ShoppingBag, Settings, AlertTriangle, Clock, PieChart as PieIcon, BarChart3, Plus, X, Save, Edit3, Trash2, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, CartesianGrid } from 'recharts';

interface CreditCardViewProps {
  data: AppData;
  onOpenSettings: () => void;
  onOpenSidebar: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onSaveCard: (card: CreditCard | Omit<CreditCard, 'id'>) => void;
  onDeleteCard: (id: string) => void;
}

// --- NEW CARD MODAL ---
const ManageCardModal = ({ isOpen, onClose, onSave, onDelete, initialData }: { isOpen: boolean, onClose: () => void, onSave: (card: CreditCard | Omit<CreditCard, 'id'>) => void, onDelete?: (id: string) => void, initialData?: CreditCard }) => {
    const [name, setName] = useState('');
    const [brand, setBrand] = useState<CardBrand>('mastercard');
    const [limit, setLimit] = useState('');
    const [closing, setClosing] = useState('1');
    const [due, setDue] = useState('10');
    const [colorKey, setColorKey] = useState('black');
    const [last4, setLast4] = useState('');

    React.useEffect(() => {
        if(isOpen) {
            if(initialData) {
                setName(initialData.name);
                setBrand(initialData.brand);
                setLimit(initialData.limit.toString());
                setClosing(initialData.closingDay.toString());
                setDue(initialData.dueDay.toString());
                setLast4(initialData.last4Digits || '');
                const foundKey = Object.keys(CARD_GRADIENTS).find(k => CARD_GRADIENTS[k] === initialData.color) || 'black';
                setColorKey(foundKey);
            } else {
                setName('');
                setBrand('mastercard');
                setLimit('');
                setClosing('1');
                setDue('10');
                setColorKey('black');
                setLast4('');
            }
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const cardData = {
            name,
            brand,
            limit: parseFloat(limit) || 0,
            closingDay: parseInt(closing),
            dueDay: parseInt(due),
            color: CARD_GRADIENTS[colorKey],
            last4Digits: last4
        };
        if(initialData) {
            onSave({ ...cardData, id: initialData.id });
        } else {
            onSave(cardData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in p-4">
            <div className="bg-[#FFFDF5] w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in zoom-in-95 border-2 border-[#13312A]">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[#13312A] font-serif">{initialData ? 'Editar Cartão' : 'Adicionar Cartão'}</h2>
                    <button onClick={onClose} className="p-2 bg-[#13312A]/10 rounded-full hover:bg-[#C69A72]/20"><X size={20} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-[#13312A] uppercase mb-1 ml-1">Apelido do Cartão</label>
                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Nubank" className="w-full px-4 py-3 rounded-2xl bg-white border border-[#13312A]/10 font-bold outline-none focus:ring-2 focus:ring-[#C69A72]" required />
                    </div>
                    <div className="flex gap-3">
                         <div className="flex-1">
                             <label className="block text-[10px] font-bold text-[#13312A] uppercase mb-1 ml-1">Bandeira</label>
                             <select value={brand} onChange={e => setBrand(e.target.value as CardBrand)} className="w-full px-4 py-3 rounded-2xl bg-white border border-[#13312A]/10 font-bold outline-none appearance-none">
                                <option value="mastercard">Mastercard</option>
                                <option value="visa">Visa</option>
                                <option value="amex">Amex</option>
                                <option value="elo">Elo</option>
                                <option value="hipercard">Hipercard</option>
                                <option value="other">Outro</option>
                             </select>
                         </div>
                         <div className="flex-1">
                             <label className="block text-[10px] font-bold text-[#13312A] uppercase mb-1 ml-1">Final (4 díc.)</label>
                             <input type="text" maxLength={4} value={last4} onChange={e => setLast4(e.target.value)} placeholder="1234" className="w-full px-4 py-3 rounded-2xl bg-white border border-[#13312A]/10 font-bold text-center outline-none focus:ring-2 focus:ring-[#C69A72]" />
                         </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-[#13312A] uppercase mb-1 ml-1">Limite Total</label>
                        <input type="number" value={limit} onChange={e => setLimit(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white border border-[#13312A]/10 font-bold outline-none focus:ring-2 focus:ring-[#C69A72]" required />
                    </div>
                    <div className="flex gap-3">
                         <div className="flex-1">
                             <label className="block text-[10px] font-bold text-[#13312A] uppercase mb-1 ml-1">Fechamento</label>
                             <input type="number" min="1" max="31" value={closing} onChange={e => setClosing(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white border border-[#13312A]/10 font-bold text-center outline-none" />
                         </div>
                         <div className="flex-1">
                             <label className="block text-[10px] font-bold text-[#13312A] uppercase mb-1 ml-1">Vencimento</label>
                             <input type="number" min="1" max="31" value={due} onChange={e => setDue(e.target.value)} className="w-full px-4 py-3 rounded-2xl bg-white border border-[#13312A]/10 font-bold text-center outline-none" />
                         </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-[#13312A] uppercase mb-2 ml-1">Estilo do Cartão</label>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
                            {Object.keys(CARD_GRADIENTS).map(key => (
                                <button 
                                    key={key} 
                                    type="button"
                                    onClick={() => setColorKey(key)} 
                                    className={`w-10 h-10 rounded-full border-2 transition-all shrink-0 ${colorKey === key ? 'border-[#13312A] scale-110 shadow-md' : 'border-transparent opacity-60'}`} 
                                    style={{ background: CARD_GRADIENTS[key] }}
                                />
                            ))}
                        </div>
                    </div>
                    <div className="pt-2 flex gap-3">
                        {initialData && onDelete && (
                             <button type="button" onClick={() => { onDelete(initialData.id); onClose(); }} className="p-4 bg-red-100 text-red-500 rounded-2xl font-bold hover:bg-red-500 hover:text-white transition-colors"><Trash2 size={20} /></button>
                        )}
                        <button type="submit" className="flex-1 py-4 bg-[#13312A] text-[#C69A72] rounded-2xl font-bold font-serif active:scale-95 transition-transform">Salvar Cartão</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

// --- WALLET COMPONENT ---
export const CreditCardView: React.FC<CreditCardViewProps> = ({ data, onOpenSettings, onOpenSidebar, onAddTransaction, onEditTransaction, onSaveCard, onDeleteCard }) => {
  const { transactions, creditCards } = data;
  const [selectedCardId, setSelectedCardId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | undefined>(undefined);

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const creditTransactions = transactions
    .filter(t => t.type === 'expense' && t.paymentMethod === 'credit')
    .filter(t => selectedCardId === 'all' ? true : t.cardId === selectedCardId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const currentMonthTransactions = creditTransactions.filter(t => {
     const d = new Date(t.date);
     return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const calculateCardTotals = (cardId: string) => {
      const cardTrans = transactions.filter(t => t.type === 'expense' && t.paymentMethod === 'credit' && t.cardId === cardId);
      const invoice = cardTrans.filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).reduce((acc, t) => acc + t.amount, 0);
      
      const future = cardTrans.filter(t => {
           const d = new Date(t.date);
           return d > new Date(currentYear, currentMonth + 1, 0);
      }).reduce((acc, t) => acc + t.amount, 0);
      
      return { invoice, future };
  };

  const totalInvoice = selectedCardId === 'all' 
      ? creditCards.reduce((acc, c) => acc + calculateCardTotals(c.id).invoice, 0)
      : calculateCardTotals(selectedCardId).invoice;

  const totalLimit = selectedCardId === 'all'
      ? creditCards.reduce((acc, c) => acc + c.limit, 0)
      : creditCards.find(c => c.id === selectedCardId)?.limit || 0;

  const totalUsed = selectedCardId === 'all'
      ? creditCards.reduce((acc, c) => {
          const totals = calculateCardTotals(c.id);
          return acc + totals.invoice + totals.future;
      }, 0)
      : (() => {
          const t = calculateCardTotals(selectedCardId);
          return t.invoice + t.future;
      })();
  
  const limitPercentage = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0;
  const availableLimit = Math.max(0, totalLimit - totalUsed);

  const categoryTotals: Record<string, number> = {};
  currentMonthTransactions.forEach(t => { categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount; });
  const pieData = Object.keys(categoryTotals).map(catKey => {
      const catDef = CATEGORIES.find(c => c.key === catKey);
      let color = COLORS.tertiary; 
      if (catKey === 'car') color = COLORS.secondary; 
      if (catKey === 'house') color = COLORS.primary; 
      if (catKey === 'partner') color = COLORS.danger; 
      if (catKey === 'others') color = COLORS.accent; 
      if (catKey === 'debt') color = '#94A3B8'; 
      return { name: catDef?.label || 'Outros', value: categoryTotals[catKey], color: color, key: catKey };
  }).sort((a, b) => b.value - a.value);

  return (
    <div className="h-full flex flex-col gap-6 animate-in fade-in duration-700 pb-24 relative">
      
      <ManageCardModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingCard(undefined); }} 
        onSave={onSaveCard} 
        onDelete={onDeleteCard}
        initialData={editingCard}
      />

      <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[#13312A] font-serif">Minha Carteira</h2>
          <div className="flex gap-2">
             <button onClick={() => { setEditingCard(undefined); setIsModalOpen(true); }} className="px-4 py-2 bg-[#13312A] text-[#C69A72] rounded-full text-xs font-bold hover:bg-[#0f2620] shadow-sm flex items-center gap-2 transition-all active:scale-95">
                <Plus size={16} /> Add Cartão
             </button>
             <button onClick={onOpenSidebar} className="p-2 bg-white rounded-full text-[#155446] hover:text-[#13312A] shadow-sm transition-colors md:hidden">
                <PieIcon size={20} />
             </button>
          </div>
      </div>

      {/* --- CARDS CAROUSEL --- */}
      <div className="w-full overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 md:mx-0 md:px-0">
          <div className="flex gap-4 w-max">
              <button 
                 onClick={() => setSelectedCardId('all')}
                 className={`w-16 rounded-[1.5rem] flex flex-col items-center justify-center gap-2 transition-all border-2 ${selectedCardId === 'all' ? 'bg-[#13312A] border-[#13312A] text-[#C69A72] shadow-lg' : 'bg-white border-transparent text-[#155446] opacity-70 hover:opacity-100'}`}
              >
                  <BarChart3 size={24} />
                  <span className="text-[10px] font-bold uppercase rotate-180 py-2" style={{ writingMode: 'vertical-rl' }}>Geral</span>
              </button>

              {creditCards.map(card => {
                  const isSelected = selectedCardId === card.id;
                  const cardTotals = calculateCardTotals(card.id);
                  const limitPct = card.limit > 0 ? ((cardTotals.invoice + cardTotals.future) / card.limit) * 100 : 0;
                  
                  return (
                      <div 
                         key={card.id}
                         onClick={() => setSelectedCardId(card.id)}
                         className={`relative w-72 h-44 rounded-[2rem] p-5 flex flex-col justify-between shadow-xl transition-all cursor-pointer border-4 ${isSelected ? 'border-[#C69A72] scale-[1.02] ring-4 ring-[#C69A72]/10' : 'border-transparent hover:scale-[1.01]'}`}
                         style={{ background: card.color, color: 'white' }}
                      >
                          <div className="flex justify-between items-start">
                              <div>
                                  <p className="font-bold text-lg tracking-wide shadow-black drop-shadow-md">{card.name}</p>
                                  <p className="text-[10px] opacity-80 uppercase tracking-widest font-bold">{card.brand}</p>
                              </div>
                              {isSelected && (
                                  <button onClick={(e) => { e.stopPropagation(); setEditingCard(card); setIsModalOpen(true); }} className="p-2 bg-white/20 rounded-full hover:bg-white/30 backdrop-blur-md transition-colors">
                                      <Edit3 size={14} />
                                  </button>
                              )}
                          </div>
                          
                          <div>
                              <div className="flex justify-between items-end mb-3">
                                  <div className="flex items-center gap-2">
                                      <div className="w-8 h-5 bg-[#C69A72]/30 rounded-md border border-white/20 relative">
                                          <div className="absolute top-1 left-1 w-2 h-1 bg-white/20 rounded-sm"></div>
                                      </div>
                                      <span className="font-mono text-xs opacity-90 tracking-tighter">•••• {card.last4Digits || '0000'}</span>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-[8px] opacity-60 uppercase font-bold tracking-widest">Fatura Atual</p>
                                      <p className="font-bold text-xl font-serif leading-none">{formatCurrency(cardTotals.invoice)}</p>
                                  </div>
                              </div>
                              <div className="w-full h-1.5 bg-black/30 rounded-full overflow-hidden">
                                  <div className="h-full bg-white/90 rounded-full transition-all duration-1000" style={{ width: `${Math.min(limitPct, 100)}%` }}></div>
                              </div>
                          </div>
                      </div>
                  );
              })}

              {creditCards.length < 5 && (
                  <button onClick={() => { setEditingCard(undefined); setIsModalOpen(true); }} className="w-72 h-44 rounded-[2rem] border-2 border-dashed border-[#13312A]/20 flex flex-col items-center justify-center text-[#155446] gap-2 hover:bg-[#13312A]/5 transition-all group">
                      <div className="p-3 bg-white rounded-2xl group-hover:scale-110 transition-transform"><Plus size={24} /></div>
                      <span className="font-bold text-sm">Novo Cartão</span>
                  </button>
              )}
          </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid grid-cols-12 gap-6">
          
          <div className="col-span-12 md:col-span-6 bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#13312A]/5 relative overflow-hidden group">
              <div className="absolute right-0 top-0 p-8 text-[#13312A]/5 group-hover:scale-110 transition-transform"><CardIcon size={120} /></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-[#F6E9CA] rounded-xl text-[#13312A]">
                        <CardIcon size={20} />
                    </div>
                    <div>
                        <h3 className="font-bold text-[#13312A] font-serif">Resumo Financeiro</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{selectedCardId === 'all' ? 'Consolidado' : 'Específico'}</p>
                    </div>
                </div>
                <h2 className="text-5xl font-bold text-[#13312A] font-serif mb-8 tracking-tight">{formatCurrency(totalInvoice)}</h2>
                
                <div className="space-y-6">
                    <div>
                        <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                            <span>Utilização do Limite</span>
                            <span className="text-[#13312A]">{limitPercentage.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-3 bg-[#F6E9CA]/30 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-1000 ${limitPercentage > 90 ? 'bg-red-500' : 'bg-[#13312A]'}`} style={{ width: `${Math.min(limitPercentage, 100)}%` }}></div>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="flex-1 p-4 bg-[#F6E9CA]/20 rounded-2xl border border-[#13312A]/5">
                            <span className="text-[9px] font-bold text-[#155446] uppercase tracking-widest block mb-1">Limite Livre</span>
                            <span className="font-bold text-[#13312A] text-lg font-serif">{formatCurrency(availableLimit)}</span>
                        </div>
                        <div className="flex-1 p-4 bg-white rounded-2xl border border-[#13312A]/5 shadow-sm">
                            <span className="text-[9px] font-bold text-[#155446] uppercase tracking-widest block mb-1">Gasto Total</span>
                            <span className="font-bold text-[#13312A] text-lg font-serif">{formatCurrency(totalUsed)}</span>
                        </div>
                    </div>
                </div>
              </div>
          </div>

          <div className="col-span-12 md:col-span-6 bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#13312A]/5 flex flex-col">
              <h3 className="font-bold text-[#13312A] mb-8 text-sm uppercase tracking-widest flex items-center gap-2"><PieIcon size={16} /> Composição de Gastos</h3>
              <div className="flex-1 flex flex-col md:flex-row items-center gap-8">
                  <div className="h-48 w-48 relative shrink-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={6} dataKey="value" stroke="none" cornerRadius={8}>
                                    {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Mês</span>
                            <span className="text-xs font-bold text-[#13312A] font-serif">{pieData.length} Cats</span>
                        </div>
                  </div>
                  <div className="flex-1 w-full space-y-3 max-h-48 overflow-y-auto no-scrollbar">
                      {pieData.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center italic py-4">Sem dados para este filtro.</p>
                      ) : (
                        pieData.map(item => (
                          <div key={item.key} className="flex justify-between items-center group">
                              <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: item.color }}></div>
                                  <span className="text-xs font-bold text-[#155446] group-hover:text-[#13312A] transition-colors">{item.name}</span>
                              </div>
                              <span className="font-bold text-xs font-mono">{formatCurrency(item.value)}</span>
                          </div>
                        ))
                      )}
                  </div>
              </div>
          </div>

          {/* Transactions List */}
          <div className="col-span-12 bg-[#FFFDF5] rounded-[2.5rem] p-8 border border-[#13312A]/5 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-[#13312A] font-serif text-lg">Lançamentos na Fatura</h3>
                <span className="text-[10px] font-bold text-[#155446] uppercase bg-[#F6E9CA] px-3 py-1 rounded-full">{currentMonthTransactions.length} itens</span>
              </div>
              <div className="space-y-3">
                  {currentMonthTransactions.length === 0 ? (
                      <div className="text-center py-12 text-gray-400 bg-white/50 rounded-3xl border border-dashed border-[#13312A]/10">
                        <ShoppingBag size={32} className="mx-auto mb-2 opacity-20" />
                        <p className="text-xs font-medium">Nenhum gasto registrado neste cartão.</p>
                      </div>
                  ) : (
                      currentMonthTransactions.map(t => {
                          const card = creditCards.find(c => c.id === t.cardId);
                          return (
                              <div key={t.id} className="flex items-center justify-between p-4 bg-white border border-[#13312A]/5 rounded-2xl hover:bg-[#F6E9CA]/30 transition-all cursor-pointer group shadow-sm hover:shadow-md" onClick={() => onEditTransaction(t)}>
                                  <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-xl bg-[#F6E9CA]/30 text-[#13312A] flex items-center justify-center group-hover:scale-110 transition-transform">
                                          <ShoppingBag size={22} />
                                      </div>
                                      <div className="min-w-0">
                                          <p className="font-bold text-[#13312A] text-sm truncate">{t.description || t.subcategory}</p>
                                          <div className="flex items-center gap-2">
                                              <p className="text-[10px] text-gray-400 font-bold">{formatDate(t.date)}</p>
                                              {selectedCardId === 'all' && card && (
                                                  <span className="text-[9px] px-1.5 py-0.5 rounded font-bold text-white opacity-80" style={{ backgroundColor: card.color }}>{card.name}</span>
                                              )}
                                          </div>
                                      </div>
                                  </div>
                                  <span className="font-bold text-[#13312A] font-serif text-lg">{formatCurrency(t.amount)}</span>
                              </div>
                          )
                      })
                  )}
              </div>
          </div>

      </div>
    </div>
  );
};
