import React, { useState, useEffect } from 'react';
import { X, Check, Car, Home, Heart, CreditCard, ShoppingBag, Calendar, Banknote, Utensils, Droplets, Layers, Calculator, Trash2 } from 'lucide-react';
import { TransactionType, CategoryKey, CATEGORIES, Transaction, PaymentMethod } from '../types';
import { COLORS, formatCurrency } from '../constants';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: any) => void;
  onDelete?: (id: string) => void;
  initialCategory?: CategoryKey;
  initialSubcategory?: string;
  initialData?: Transaction | null;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSave, onDelete, initialCategory, initialSubcategory, initialData }) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<CategoryKey>('others');
  const [subcategory, setSubcategory] = useState('');
  
  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('debit');

  // Income flags
  const [isBenefit, setIsBenefit] = useState(false);
  const [isSalary, setIsSalary] = useState(false);
  
  // Car specific
  const [carKm, setCarKm] = useState('');
  const [liters, setLiters] = useState('');
  const [description, setDescription] = useState('');

  // Installments logic
  const [isInstallment, setIsInstallment] = useState(false);
  const [installmentsCount, setInstallmentsCount] = useState('2');

  // --- Gesture Logic (Swipe Down to Close) ---
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchEndY, setTouchEndY] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEndY(null);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEndY(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStartY || !touchEndY) return;
    const distance = touchEndY - touchStartY;
    if (distance > 70) {
      onClose();
    }
  };
  // -------------------------------------------

  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            // Edit Mode
            setType(initialData.type);
            setAmount(initialData.amount.toString());
            setDate(initialData.date);
            setCategory(initialData.category);
            setSubcategory(initialData.subcategory || '');
            setDescription(initialData.description || '');
            setPaymentMethod(initialData.paymentMethod || 'debit');
            setIsBenefit(initialData.isBenefit || false);
            setIsSalary(initialData.isSalary || false);
            setCarKm(initialData.carKm ? initialData.carKm.toString() : '');
            setLiters(initialData.liters ? initialData.liters.toString() : '');
            
            // Disable installment toggle on edit to prevent complexity
            setIsInstallment(false);
        } else {
            // Create Mode
            setType('expense');
            setAmount('');
            setDate(new Date().toISOString().split('T')[0]);
            setCategory(initialCategory || 'others');
            setSubcategory(initialSubcategory || '');
            setDescription('');
            setPaymentMethod('debit');
            setIsBenefit(false);
            setIsSalary(false);
            setCarKm('');
            setLiters('');
            setIsInstallment(false);
            setInstallmentsCount('2');
        }
    }
  }, [isOpen, initialCategory, initialSubcategory, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const numInstallments = parseInt(installmentsCount);

    const commonData = {
        type,
        amount: numAmount,
        date,
        category: type === 'income' ? 'others' : category,
        subcategory,
        isBenefit: type === 'income' ? isBenefit : false,
        isSalary: type === 'income' ? isSalary : false,
        paymentMethod: type === 'expense' ? paymentMethod : 'debit',
        carKm: category === 'car' && carKm ? parseInt(carKm) : undefined,
        liters: category === 'car' && subcategory === 'Combustível' && liters ? parseFloat(liters) : undefined,
        description
    };

    if (initialData) {
        // UPDATE existing
        onSave({
            ...commonData,
            id: initialData.id // Pass ID to indicate update
        });
    } else if (type === 'expense' && isInstallment && numInstallments > 1) {
      // CREATE multiple transactions
      const installmentValue = numAmount / numInstallments;
      const transactions = [];

      for (let i = 0; i < numInstallments; i++) {
        const transDate = new Date(date);
        transDate.setMonth(transDate.getMonth() + i);
        if (transDate.getDate() !== new Date(date).getDate()) {
            transDate.setDate(0); 
        }

        transactions.push({
          ...commonData,
          amount: parseFloat(installmentValue.toFixed(2)),
          date: transDate.toISOString().split('T')[0],
          description: description || `Parcela ${i + 1}/${numInstallments}`,
          installmentCurrent: i + 1,
          installmentTotal: numInstallments
        });
      }
      onSave(transactions);
    } else {
      // CREATE Single transaction
      onSave(commonData);
    }

    onClose();
  };

  const handleDelete = () => {
      if (initialData && onDelete && confirm('Deseja excluir este lançamento?')) {
          onDelete(initialData.id);
          onClose();
      }
  };

  const toggleBenefit = () => {
    const newVal = !isBenefit;
    setIsBenefit(newVal);
    if (newVal) setIsSalary(false);
  }

  const toggleSalary = () => {
    const newVal = !isSalary;
    setIsSalary(newVal);
    if (newVal) setIsBenefit(false);
  }

  const currentCategoryObj = CATEGORIES.find(c => c.key === category);
  const pricePerLiter = (amount && liters && parseFloat(liters) > 0) 
    ? parseFloat(amount) / parseFloat(liters) 
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-[#F6E9CA] w-full max-w-md rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto no-scrollbar relative border-t-4 border-[#13312A] sm:border-4"
      >
        
        {/* Pull Indicator Area */}
        <div 
            className="absolute top-0 left-0 right-0 h-10 flex justify-center items-start pt-3 cursor-grab active:cursor-grabbing z-20"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <div className="w-12 h-1.5 bg-[#155446] rounded-full opacity-30"></div>
        </div>

        {/* Header */}
        <div className="flex justify-between items-center mb-6 mt-4">
          <h2 className="text-xl font-bold text-[#13312A] font-serif">{initialData ? 'Editar Lançamento' : 'Nova Movimentação'}</h2>
          <div className="flex gap-2">
            {initialData && onDelete && (
                <button onClick={handleDelete} className="p-2 bg-[#9F3E34]/10 rounded-full hover:bg-[#9F3E34]/20 text-[#9F3E34]">
                    <Trash2 size={20} />
                </button>
            )}
            <button onClick={onClose} className="p-2 bg-[#13312A]/10 rounded-full hover:bg-[#C69A72]/20">
                <X size={20} className="text-[#13312A]" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Switch Type */}
          <div className="flex bg-[#FFFDF5] p-1.5 rounded-3xl border border-[#13312A]/10">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all ${
                type === 'income' ? 'bg-[#13312A] text-white shadow-md' : 'text-[#155446] hover:text-[#13312A]'
              }`}
            >
              Receita
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all ${
                type === 'expense' ? 'bg-[#13312A] text-white shadow-md' : 'text-[#155446] hover:text-[#13312A]'
              }`}
            >
              Despesa
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-[#155446] mb-2 uppercase tracking-wide">Valor Total (R$)</label>
            <input
              type="number"
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0,00"
              className="w-full text-4xl font-bold text-[#13312A] placeholder-[#155446]/20 focus:outline-none border-b-2 border-[#13312A]/20 focus:border-[#C69A72] pb-2 bg-transparent transition-colors font-serif"
            />
          </div>

          {/* Logic for Income */}
          {type === 'income' ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              <label className="block text-sm font-medium text-[#155446]">Tipo de Entrada</label>
              
              <div 
                onClick={toggleSalary}
                className={`flex items-center space-x-3 p-4 rounded-3xl border cursor-pointer transition-all ${
                  isSalary 
                    ? 'bg-[#FFFDF5] border-[#C69A72] shadow-sm' 
                    : 'bg-white/50 border-transparent hover:bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${isSalary ? 'bg-[#13312A] text-white' : 'bg-[#F6E9CA] text-[#155446]'}`}>
                  {isSalary ? <Check size={20} /> : <Banknote size={20} />}
                </div>
                <div className="flex-1">
                  <span className={`block font-bold ${isSalary ? 'text-[#13312A]' : 'text-[#155446]'}`}>É Salário Mensal?</span>
                </div>
              </div>

              <div 
                onClick={toggleBenefit}
                className={`flex items-center space-x-3 p-4 rounded-3xl border cursor-pointer transition-all ${
                  isBenefit 
                    ? 'bg-[#FFFDF5] border-[#C69A72] shadow-sm' 
                    : 'bg-white/50 border-transparent hover:bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${isBenefit ? 'bg-[#13312A] text-white' : 'bg-[#F6E9CA] text-[#155446]'}`}>
                  {isBenefit ? <Check size={20} /> : <Utensils size={20} />}
                </div>
                <div className="flex-1">
                  <span className={`block font-bold ${isBenefit ? 'text-[#13312A]' : 'text-[#155446]'}`}>É Benefício?</span>
                </div>
              </div>
            </div>
          ) : (
            <>
               {/* Payment Method Toggle */}
               <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('debit')}
                  className={`flex-1 p-3 rounded-3xl border flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'debit' 
                      ? 'bg-[#FFFDF5] border-[#13312A] text-[#13312A] shadow-sm' 
                      : 'bg-white/50 border-transparent text-[#155446]'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${paymentMethod === 'debit' ? 'bg-[#13312A]' : 'bg-[#C69A72]'}`}></div>
                  <span className="font-bold text-sm">Débito / Pix</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit')}
                  className={`flex-1 p-3 rounded-3xl border flex items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'credit' 
                      ? 'bg-[#155446] border-[#13312A] text-white shadow-sm' 
                      : 'bg-white/50 border-transparent text-[#155446]'
                  }`}
                >
                  <CreditCard size={16} />
                  <span className="font-bold text-sm">Crédito</span>
                </button>
               </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-[#155446] mb-2 uppercase tracking-wide">Data</label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-4 bg-[#FFFDF5] rounded-3xl text-[#13312A] font-medium focus:outline-none focus:ring-2 focus:ring-[#C69A72] border border-[#13312A]/5"
                  />
                  <Calendar className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#155446] pointer-events-none" size={20}/>
                </div>
              </div>

              {/* Categories Grid */}
              <div>
                <label className="block text-sm font-medium text-[#155446] mb-2 uppercase tracking-wide">Categoria</label>
                <div className="grid grid-cols-5 gap-2">
                  {CATEGORIES.map((cat) => {
                    const isSelected = category === cat.key;
                    const IconMap: Record<string, any> = { Car, Home, partner: Heart, CreditCard, ShoppingBag };
                    const Icon = IconMap[cat.key === 'partner' ? 'partner' : cat.icon];

                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => {
                          setCategory(cat.key);
                          setSubcategory(cat.subcategories[0]); 
                        }}
                        className={`flex flex-col items-center justify-center p-2 rounded-3xl transition-all aspect-square ${
                          isSelected 
                            ? 'bg-[#13312A] text-[#C69A72] shadow-lg shadow-[#13312A]/20' 
                            : 'bg-[#FFFDF5] text-[#155446] hover:bg-[#155446]/10'
                        }`}
                      >
                        <Icon size={20} strokeWidth={isSelected ? 2.5 : 2} />
                        <span className="text-[10px] mt-1 font-medium truncate w-full">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subcategory */}
              {currentCategoryObj && (
                <div className="animate-in fade-in slide-in-from-top-2">
                   <label className="block text-sm font-medium text-[#155446] mb-2 uppercase tracking-wide">Detalhe</label>
                   <div className="flex flex-wrap gap-2">
                     {currentCategoryObj.subcategories.map(sub => (
                       <button
                        key={sub}
                        type="button"
                        onClick={() => setSubcategory(sub)}
                        className={`px-3 py-1.5 rounded-2xl text-xs font-semibold transition-colors border ${
                          subcategory === sub
                            ? 'bg-[#C69A72] text-[#13312A] border-[#C69A72]'
                            : 'bg-[#FFFDF5] text-[#155446] border-[#13312A]/10'
                        }`}
                       >
                         {sub}
                       </button>
                     ))}
                   </div>
                </div>
              )}

              {/* Description (Optional) */}
              <div className="animate-in fade-in slide-in-from-top-2">
                <label className="block text-sm font-medium text-[#155446] mb-2 uppercase tracking-wide">Descrição (Opcional)</label>
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Ex: Jantar no Outback"
                    className="w-full p-4 bg-[#FFFDF5] rounded-3xl text-[#13312A] font-medium focus:outline-none focus:ring-2 focus:ring-[#C69A72] border border-[#13312A]/5"
                  />
              </div>

              {/* Installment Toggle (Only in Create Mode) */}
              {!initialData && (
                  <div className="flex items-center justify-between bg-[#FFFDF5] p-4 rounded-3xl animate-in fade-in border border-[#13312A]/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#F6E9CA] text-[#13312A] flex items-center justify-center">
                        <Layers size={18} />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-[#13312A]">Pagamento Parcelado?</span>
                        {paymentMethod === 'credit' && (
                            <span className="text-[10px] text-[#155446] font-medium">Lança na fatura mensal</span>
                        )}
                      </div>
                    </div>
                    <div 
                      onClick={() => setIsInstallment(!isInstallment)}
                      className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${isInstallment ? 'bg-[#13312A]' : 'bg-[#C69A72]'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${isInstallment ? 'translate-x-6' : 'translate-x-0'}`}></div>
                    </div>
                  </div>
              )}

              {/* Installment Inputs */}
              {isInstallment && !initialData && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-[#155446] mb-2">Número de Parcelas</label>
                  <input
                    type="number"
                    min="2"
                    max="60"
                    value={installmentsCount}
                    onChange={(e) => setInstallmentsCount(e.target.value)}
                    className="w-full p-4 bg-[#FFFDF5] rounded-3xl text-[#13312A] font-medium focus:outline-none focus:ring-2 focus:ring-[#C69A72] border border-[#13312A]/5"
                  />
                  <p className="text-xs text-[#155446] mt-2">
                    Serão gerados {installmentsCount} lançamentos mensais.
                  </p>
                </div>
              )}

              {/* Special Fields: Car */}
              {category === 'car' && (
                <div className="bg-[#FFFDF5] p-4 rounded-3xl space-y-4 animate-in fade-in border border-[#13312A]/10">
                  <h4 className="font-bold text-[#13312A] text-sm flex items-center gap-2">
                    <Car size={16} /> Detalhes do Veículo
                  </h4>
                  
                  {/* KM */}
                  <div>
                    <label className="block text-xs font-medium text-[#155446] mb-1">Odômetro (KM)</label>
                    <input
                      type="number"
                      value={carKm}
                      onChange={(e) => setCarKm(e.target.value)}
                      placeholder="Ex: 55000"
                      className="w-full p-3 bg-white rounded-2xl text-[#13312A] font-medium border border-[#13312A]/10 focus:outline-none focus:border-[#C69A72]"
                    />
                  </div>

                  {/* Fuel Liters */}
                  {subcategory === 'Combustível' && (
                    <div className="animate-in fade-in">
                       <label className="block text-xs font-medium text-[#155446] mb-1">Litros Abastecidos</label>
                       <div className="relative">
                        <input
                          type="number"
                          value={liters}
                          onChange={(e) => setLiters(e.target.value)}
                          placeholder="Ex: 40"
                          className="w-full p-3 bg-white rounded-2xl text-[#13312A] font-medium border border-[#13312A]/10 focus:outline-none focus:border-[#C69A72]"
                        />
                        <Droplets className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#155446]" size={16} />
                       </div>
                       {pricePerLiter > 0 && (
                         <div className="flex items-center gap-1 mt-2 text-xs font-bold text-[#155446] bg-[#F6E9CA] p-2 rounded-lg inline-flex">
                           <Calculator size={12} />
                           <span>Preço/L: {formatCurrency(pricePerLiter)}</span>
                         </div>
                       )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-[#C69A72] text-[#13312A] rounded-[1.5rem] font-bold text-lg shadow-lg shadow-[#C69A72]/20 active:scale-95 transition-transform font-serif"
          >
            {initialData ? 'Atualizar' : 'Salvar'}
          </button>
        </form>
      </div>
    </div>
  );
};