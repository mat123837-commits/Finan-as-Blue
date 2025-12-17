import React, { useState, useEffect } from 'react';
import { Transaction, Debt, AppData, CategoryKey, Investment, FixedExpense } from './types';
import { Navigation } from './components/Navigation';
import { Dashboard } from './components/Dashboard';
import { CarView } from './components/CarView';
import { HouseView } from './components/HouseView';
import { PartnerView } from './components/PartnerView';
import { LoanView } from './components/LoanView';
import { CreditCardView } from './components/CreditCardView';
import { CalendarView } from './components/CalendarView';
import { InvestmentsView } from './components/InvestmentsView';
import { TransactionModal } from './components/TransactionModal';
import { LoanModal } from './components/LoanModal';
import { FixedExpensesModal } from './components/FixedExpensesModal';
import { Sidebar } from './components/Sidebar';
import { MobileHome } from './components/MobileHome'; // NEW IMPORT
import { LoginView } from './components/LoginView'; 
import { Trash2, Edit3, X, Save, CreditCard, Loader2, ArrowLeft, Database, RefreshCw, CalendarClock } from 'lucide-react';
import { supabase } from './supabaseClient';
import { COLORS } from './constants';

// --- MOCK DATA (Fallback apenas para Demo Mode) ---
const INITIAL_DATA: AppData = {
  transactions: [],
  debts: [],
  investments: [],
  fixedExpenses: [],
  userName: 'Usuário',
  showValues: true,
  initialBalance: 0,
  initialBenefitBalance: 0,
  creditCard: { limit: 0, closingDate: 1, dueDate: 10, initialInvoiceOffset: 0 },
  car: { modelName: '', ipvaTotal: 0, insuranceTotal: 0, licensingTotal: 0, plateLastDigit: '' },
  house: { rentAmount: 0, internetAmount: 0, electricityBudget: 0, marketBudget: 0 },
  partner: { partnerName: '', dateBudget: 0 }
};

// Internal Component for Balance Adjustment (Kept same as before)
interface BalanceAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: AppData;
  onUpdate: (updates: { balance: number; benefit: number; ccLimit: number; ccInvoice: number; closingDay: number; dueDay: number }) => void;
}

const BalanceAdjustmentModal: React.FC<BalanceAdjustmentModalProps> = ({ isOpen, onClose, data, onUpdate }) => {
  const [targetBalance, setTargetBalance] = useState('');
  const [targetBenefit, setTargetBenefit] = useState('');
  const [ccLimit, setCcLimit] = useState('');
  const [targetInvoice, setTargetInvoice] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');

  // Helper to calc current displayed balance
  const transIncome = data.transactions.filter(t => t.type === 'income' && !t.isBenefit).reduce((acc, t) => acc + t.amount, 0);
  const transExpenseDebit = data.transactions.filter(t => t.type === 'expense' && t.paymentMethod !== 'credit').reduce((acc, t) => acc + t.amount, 0);
  const rawNetBalance = transIncome - transExpenseDebit;
  
  const transBenefit = data.transactions.filter(t => t.type === 'income' && t.isBenefit).reduce((acc, t) => acc + t.amount, 0);
  const rawBenefitBalance = transBenefit;

  const now = new Date();
  const currentMonth = now.getMonth();
  const rawCreditExpenses = data.transactions
    .filter(t => t.type === 'expense' && t.paymentMethod === 'credit')
    .filter(t => new Date(t.date).getMonth() === currentMonth)
    .reduce((acc, t) => acc + t.amount, 0);

  useEffect(() => {
    if (isOpen) {
      const currentTotal = rawNetBalance + (data.initialBalance || 0);
      const currentBenefit = rawBenefitBalance + (data.initialBenefitBalance || 0);
      const currentCCLimit = data.creditCard.limit;
      const currentInvoice = rawCreditExpenses + (data.creditCard.initialInvoiceOffset || 0);

      setTargetBalance(currentTotal === 0 ? '' : currentTotal.toString());
      setTargetBenefit(currentBenefit === 0 ? '' : currentBenefit.toString());
      setCcLimit(currentCCLimit === 0 ? '' : currentCCLimit.toString());
      setTargetInvoice(currentInvoice === 0 ? '' : currentInvoice.toString());
      
      setClosingDay(data.creditCard.closingDate.toString());
      setDueDay(data.creditCard.dueDate.toString());
    }
  }, [isOpen, data, rawNetBalance, rawBenefitBalance, rawCreditExpenses]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTargetTotal = parseFloat(targetBalance) || 0;
    const newTargetBenefit = parseFloat(targetBenefit) || 0;
    const newLimit = parseFloat(ccLimit) || 0;
    const newTargetInvoice = parseFloat(targetInvoice) || 0;
    const newClosing = parseInt(closingDay) || 1;
    const newDue = parseInt(dueDay) || 10;

    const newInitialBalance = newTargetTotal - rawNetBalance;
    const newInitialBenefit = newTargetBenefit - rawBenefitBalance;
    const newInvoiceOffset = newTargetInvoice - rawCreditExpenses;

    onUpdate({
      balance: newInitialBalance,
      benefit: newInitialBenefit,
      ccLimit: newLimit,
      ccInvoice: newInvoiceOffset,
      closingDay: newClosing,
      dueDay: newDue
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
      <div className="bg-[#F6E9CA] w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto no-scrollbar border-2 border-[#13312A]">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#13312A] font-serif">Configurar Finanças</h2>
          <button onClick={onClose} className="p-2 bg-[#13312A]/10 rounded-full hover:bg-[#C69A72]/20">
            <X size={20} className="text-[#13312A]" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#13312A] uppercase mb-1">Saldo Conta Corrente</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#155446] font-bold font-serif">R$</span>
              <input type="number" step="0.01" placeholder="0,00" value={targetBalance} onChange={(e) => setTargetBalance(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/50 border border-[#13312A]/10 rounded-2xl text-[#13312A] font-bold text-lg font-serif focus:outline-none focus:ring-2 focus:ring-[#C69A72]" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#13312A] uppercase mb-1">Saldo Benefícios (VA/VR)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#155446] font-bold font-serif">R$</span>
              <input type="number" step="0.01" placeholder="0,00" value={targetBenefit} onChange={(e) => setTargetBenefit(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/50 border border-[#13312A]/10 rounded-2xl text-[#13312A] font-bold text-lg font-serif focus:outline-none focus:ring-2 focus:ring-[#C69A72]" />
            </div>
          </div>
          <div className="h-[1px] bg-[#13312A]/10 my-4"></div>
          <div>
             <h3 className="font-bold text-[#13312A] flex items-center gap-2 mb-3 font-serif">
               <CreditCard size={16} /> Configuração do Cartão
             </h3>
             <div className="space-y-3">
               <div>
                  <label className="block text-xs font-bold text-[#155446] uppercase mb-1">Limite Total</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#155446] font-bold font-serif">R$</span>
                    <input type="number" step="0.01" placeholder="0,00" value={ccLimit} onChange={(e) => setCcLimit(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/50 border border-[#13312A]/10 rounded-2xl text-[#155446] font-bold text-lg font-serif focus:outline-none focus:ring-2 focus:ring-[#C69A72]" />
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-bold text-[#155446] uppercase mb-1">Fatura Atual (Aberto)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#155446] font-bold font-serif">R$</span>
                    <input type="number" step="0.01" placeholder="0,00" value={targetInvoice} onChange={(e) => setTargetInvoice(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/50 border border-[#13312A]/10 rounded-2xl text-[#155446] font-bold text-lg font-serif focus:outline-none focus:ring-2 focus:ring-[#C69A72]" />
                  </div>
               </div>
               <div className="flex gap-3">
                 <div className="flex-1">
                    <label className="block text-[10px] font-bold text-[#155446] uppercase mb-1">Dia Fechamento</label>
                    <div className="relative">
                       <input type="number" min="1" max="31" value={closingDay} onChange={(e) => setClosingDay(e.target.value)} className="w-full px-3 py-3 bg-white/50 border border-[#13312A]/10 rounded-xl text-[#155446] font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#C69A72]" />
                    </div>
                 </div>
                 <div className="flex-1">
                    <label className="block text-[10px] font-bold text-[#155446] uppercase mb-1">Dia Vencimento</label>
                    <div className="relative">
                       <input type="number" min="1" max="31" value={dueDay} onChange={(e) => setDueDay(e.target.value)} className="w-full px-3 py-3 bg-white/50 border border-[#13312A]/10 rounded-xl text-[#155446] font-bold text-center focus:outline-none focus:ring-2 focus:ring-[#C69A72]" />
                    </div>
                 </div>
               </div>
             </div>
          </div>
          <button type="submit" className="w-full py-3 bg-[#C69A72] text-[#13312A] rounded-xl font-bold text-base shadow-lg shadow-[#C69A72]/20 active:scale-95 transition-transform flex items-center justify-center gap-2 mt-4">
            <Save size={18} /> Salvar Alterações
          </button>
        </form>
      </div>
    </div>
  );
};

// Internal Component for Car Config & House Config & Partner Config omitted for brevity as they are unchanged

// Setup Required View
const SetupRequiredView = ({ onRetry, onDemo }: { onRetry: () => void; onDemo: () => void }) => (
  <div className="min-h-screen bg-[#F6E9CA] flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
    <div className="w-20 h-20 bg-[#C69A72]/20 text-[#C69A72] rounded-[2rem] flex items-center justify-center mb-6 shadow-sm">
      <Database size={32} />
    </div>
    <h2 className="text-2xl font-bold text-[#13312A] mb-2 font-serif">Configuração Pendente</h2>
    <p className="text-[#155446] max-w-xs mb-8">
      O banco de dados do novo projeto está vazio. Você precisa rodar o script SQL no painel do Supabase.
    </p>
    <div className="w-full max-w-xs space-y-3">
       <button onClick={onRetry} className="w-full py-3 bg-[#13312A] text-white rounded-2xl font-bold active:scale-95 transition-transform flex items-center justify-center gap-2">
         <RefreshCw size={18} /> Já executei, recarregar
       </button>
       <button onClick={onDemo} className="w-full py-3 bg-white border border-[#155446] text-[#155446] rounded-2xl font-bold active:scale-95 transition-transform hover:bg-[#F9F8F6]">
         Usar Modo Demo
       </button>
    </div>
  </div>
);

// HOOK: Detect Mobile
const useMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
};

// ... Config Modals (CarConfigModal, HouseConfigModal, PartnerConfigModal) ...
// Keeping them here for completeness but they are unchanged from previous version.
const CarConfigModal: React.FC<{ isOpen: boolean; onClose: () => void; data: AppData; onUpdate: (config: any) => void; }> = ({ isOpen, onClose, data, onUpdate }) => {
    const [model, setModel] = useState('');
    const [ipva, setIpva] = useState('');
    const [insurance, setInsurance] = useState('');
    const [plate, setPlate] = useState('');
  
    useEffect(() => {
      if (isOpen) {
        setModel(data.car?.modelName || '');
        setIpva(data.car?.ipvaTotal === 0 ? '' : data.car?.ipvaTotal?.toString() || '');
        setInsurance(data.car?.insuranceTotal === 0 ? '' : data.car?.insuranceTotal?.toString() || '');
        setPlate(data.car?.plateLastDigit || '');
      }
    }, [isOpen, data]);
  
    if (!isOpen) return null;
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onUpdate({
        modelName: model,
        ipvaTotal: parseFloat(ipva) || 0,
        insuranceTotal: parseFloat(insurance) || 0,
        licensingTotal: data.car?.licensingTotal || 0,
        plateLastDigit: plate
      });
      onClose();
    };
  
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4">
        <div className="bg-[#F6E9CA] w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-[#13312A]">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-[#13312A] font-serif">Configurar Veículo</h2>
            <button onClick={onClose} className="p-2 bg-[#13312A]/10 rounded-full hover:bg-[#C69A72]/20">
              <X size={20} className="text-[#13312A]" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#13312A] uppercase mb-1">Modelo</label>
              <input type="text" value={model} onChange={(e) => setModel(e.target.value)} className="w-full px-4 py-3 bg-white/50 border border-[#13312A]/10 rounded-xl text-[#13312A] font-bold focus:outline-none" />
            </div>
            {/* Other inputs */}
            <div><label className="block text-xs font-bold text-[#13312A] uppercase mb-1">Valor Total IPVA (Anual)</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#155446] font-bold font-serif">R$</span><input type="number" step="0.01" placeholder="0,00" value={ipva} onChange={(e) => setIpva(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/50 border border-[#13312A]/10 rounded-xl text-[#13312A] font-bold focus:outline-none" /></div></div>
            <div><label className="block text-xs font-bold text-[#13312A] uppercase mb-1">Valor Seguro (Anual)</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#155446] font-bold font-serif">R$</span><input type="number" step="0.01" placeholder="0,00" value={insurance} onChange={(e) => setInsurance(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/50 border border-[#13312A]/10 rounded-xl text-[#13312A] font-bold focus:outline-none" /></div></div>
            <div><label className="block text-xs font-bold text-[#13312A] uppercase mb-1">Final da Placa</label><input type="text" maxLength={1} value={plate} onChange={(e) => setPlate(e.target.value)} className="w-full px-4 py-3 bg-white/50 border border-[#13312A]/10 rounded-xl text-[#13312A] font-bold focus:outline-none text-center" /></div>
            <button type="submit" className="w-full py-3 bg-[#C69A72] text-[#13312A] rounded-xl font-bold mt-2 font-serif">Salvar</button>
          </form>
        </div>
      </div>
    );
}

const HouseConfigModal: React.FC<{ isOpen: boolean; onClose: () => void; data: AppData; onUpdate: (config: any) => void; }> = ({ isOpen, onClose, data, onUpdate }) => {
    const [rent, setRent] = useState('');
    const [market, setMarket] = useState('');
    const [internet, setInternet] = useState('');
    const [electricity, setElectricity] = useState('');
    useEffect(() => { if (isOpen) { setRent(data.house?.rentAmount === 0 ? '' : data.house?.rentAmount?.toString() || ''); setMarket(data.house?.marketBudget === 0 ? '' : data.house?.marketBudget?.toString() || ''); setInternet(data.house?.internetAmount === 0 ? '' : data.house?.internetAmount?.toString() || ''); setElectricity(data.house?.electricityBudget === 0 ? '' : data.house?.electricityBudget?.toString() || ''); } }, [isOpen, data]);
    if (!isOpen) return null;
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onUpdate({ rentAmount: parseFloat(rent) || 0, marketBudget: parseFloat(market) || 0, internetAmount: parseFloat(internet) || 0, electricityBudget: parseFloat(electricity) || 0, }); onClose(); };
    return ( <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4"> <div className="bg-[#F6E9CA] w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-[#13312A]"> <div className="flex justify-between items-center mb-6"> <h2 className="text-xl font-bold text-[#13312A] font-serif">Configurar Casa</h2> <button onClick={onClose} className="p-2 bg-[#13312A]/10 rounded-full hover:bg-[#C69A72]/20"> <X size={20} className="text-[#13312A]" /> </button> </div> <form onSubmit={handleSubmit} className="space-y-4"> <div> <label className="block text-xs font-bold text-[#13312A] uppercase mb-1">Valor Aluguel/Condomínio</label> <div className="relative"> <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#155446] font-bold font-serif">R$</span> <input type="number" step="0.01" placeholder="0,00" value={rent} onChange={(e) => setRent(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/50 border border-[#13312A]/10 rounded-xl text-[#13312A] font-bold focus:outline-none" /> </div> </div> {/* ... other inputs ... */} <div> <label className="block text-xs font-bold text-[#13312A] uppercase mb-1">Orçamento Mercado & Limpeza</label> <div className="relative"> <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#155446] font-bold font-serif">R$</span> <input type="number" step="0.01" placeholder="0,00" value={market} onChange={(e) => setMarket(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/50 border border-[#13312A]/10 rounded-xl text-[#13312A] font-bold focus:outline-none" /> </div> </div> <div> <label className="block text-xs font-bold text-[#13312A] uppercase mb-1">Valor Internet (Fixo)</label> <div className="relative"> <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#155446] font-bold font-serif">R$</span> <input type="number" step="0.01" placeholder="0,00" value={internet} onChange={(e) => setInternet(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/50 border border-[#13312A]/10 rounded-xl text-[#13312A] font-bold focus:outline-none" /> </div> </div> <div> <label className="block text-xs font-bold text-[#13312A] uppercase mb-1">Orçamento Luz (Estimado)</label> <div className="relative"> <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#155446] font-bold font-serif">R$</span> <input type="number" step="0.01" placeholder="0,00" value={electricity} onChange={(e) => setElectricity(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/50 border border-[#13312A]/10 rounded-xl text-[#13312A] font-bold focus:outline-none" /> </div> </div> <button type="submit" className="w-full py-3 bg-[#C69A72] text-[#13312A] rounded-xl font-bold mt-2 font-serif">Salvar</button> </form> </div> </div> );
}

const PartnerConfigModal: React.FC<{ isOpen: boolean; onClose: () => void; data: AppData; onUpdate: (config: any) => void; }> = ({ isOpen, onClose, data, onUpdate }) => {
    const [name, setName] = useState('');
    const [budget, setBudget] = useState('');
    const [date, setDate] = useState('');
    useEffect(() => { if (isOpen) { setName(data.partner?.partnerName || ''); setBudget(data.partner?.dateBudget === 0 ? '' : data.partner?.dateBudget?.toString() || ''); setDate(data.partner?.anniversaryDate || ''); } }, [isOpen, data]);
    if (!isOpen) return null;
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onUpdate({ partnerName: name, dateBudget: parseFloat(budget) || 0, anniversaryDate: date }); onClose(); };
    return ( <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 p-4"> <div className="bg-[#F6E9CA] w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 duration-200 border-2 border-[#13312A]"> <div className="flex justify-between items-center mb-6"> <h2 className="text-xl font-bold text-[#13312A] font-serif">Configurar Relacionamento</h2> <button onClick={onClose} className="p-2 bg-[#13312A]/10 rounded-full hover:bg-[#C69A72]/20"> <X size={20} className="text-[#13312A]" /> </button> </div> <form onSubmit={handleSubmit} className="space-y-4"> <div> <label className="block text-xs font-bold text-[#13312A] uppercase mb-1">Nome do(a) Parceiro(a)</label> <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 bg-white/50 border border-[#13312A]/10 rounded-xl text-[#13312A] font-bold focus:outline-none" /> </div> <div> <label className="block text-xs font-bold text-[#13312A] uppercase mb-1">Orçamento Mensal (Saídas)</label> <div className="relative"> <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#155446] font-bold font-serif">R$</span> <input type="number" step="0.01" placeholder="0,00" value={budget} onChange={(e) => setBudget(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/50 border border-[#13312A]/10 rounded-xl text-[#13312A] font-bold focus:outline-none" /> </div> </div> <div> <label className="block text-xs font-bold text-[#13312A] uppercase mb-1">Data de Aniversário (Namoro/Casamento)</label> <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full px-4 py-3 bg-white/50 border border-[#13312A]/10 rounded-xl text-[#13312A] font-bold focus:outline-none" /> </div> <button type="submit" className="w-full py-3 bg-[#C69A72] text-[#13312A] rounded-xl font-bold mt-2 font-serif">Salvar</button> </form> </div> </div> );
}

function App() {
  const isMobile = useMobile();
  const [session, setSession] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Modals Visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isFixedExpenseModalOpen, setIsFixedExpenseModalOpen] = useState(false);
  const [isCarConfigOpen, setIsCarConfigOpen] = useState(false);
  const [isHouseConfigOpen, setIsHouseConfigOpen] = useState(false);
  const [isPartnerConfigOpen, setIsPartnerConfigOpen] = useState(false);
  
  // Edit State
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);

  const [prefillCategory, setPrefillCategory] = useState<CategoryKey | undefined>(undefined);
  const [prefillSubcategory, setPrefillSubcategory] = useState<string | undefined>(undefined);
  const [prefillType, setPrefillType] = useState<'expense'|'income'>('expense');
  const [prefillDate, setPrefillDate] = useState<string | undefined>(undefined);

  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  // ... (Supabase Fetch Logic - Unchanged) ...
  useEffect(() => {
    let mounted = true;
    const checkSession = async () => {
        const { data: { session: sbSession } } = await supabase.auth.getSession();
        if (sbSession) {
          if (mounted) {
            setSession(sbSession);
            setIsLoadingSession(false);
            localStorage.removeItem('financas_app_demo');
          }
        } else {
          const isDemoStored = localStorage.getItem('financas_app_demo') === 'true';
          if (isDemoStored && mounted) {
             setIsDemoMode(true);
             setSession({ user: { id: 'mock-user-123', email: 'demo@financas.blue' } });
             setData(prev => ({...prev, userName: 'Demo User'}));
             setIsLoadingSession(false);
          } else {
             if (mounted) setIsLoadingSession(false);
          }
        }
    };
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        if (session) {
            setSession(session);
            setIsLoadingSession(false);
            localStorage.removeItem('financas_app_demo');
        } else if (!localStorage.getItem('financas_app_demo')) {
            setSession(null);
        }
      }
    });
    return () => {
        mounted = false;
        subscription.unsubscribe();
    };
  }, []);

  const fetchSupabaseData = async () => {
    if (!session?.user) return;
    try {
      setIsLoaded(false);
      setDbError(null);
      const { data: profile, error: profileError } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (profileError) {
          if (profileError.code === '42P01') { 
              setDbError('missing_table');
              setIsLoaded(true);
              return;
          }
          if (profileError.code !== 'PGRST116') console.error(profileError);
      }
      const { data: trans } = await supabase.from('transactions').select('*');
      const { data: debts } = await supabase.from('debts').select('*');
      const { data: investments } = await supabase.from('investments').select('*');
      const { data: fixedExp, error: fixedError } = await supabase.from('fixed_expenses').select('*');
      
      const newData: AppData = {
        ...INITIAL_DATA,
        userName: profile?.user_name || session.user.email?.split('@')[0] || 'Usuário',
        initialBalance: profile?.initial_balance || 0,
        initialBenefitBalance: profile?.initial_benefit_balance || 0,
        creditCard: profile?.credit_card_config || INITIAL_DATA.creditCard,
        car: profile?.car_config || INITIAL_DATA.car,
        house: profile?.house_config || INITIAL_DATA.house,
        partner: profile?.partner_config || INITIAL_DATA.partner,
        transactions: trans ? trans.map((t: any) => ({
           id: t.id, type: t.type, amount: t.amount, date: t.date, category: t.category, subcategory: t.subcategory, description: t.description, isBenefit: t.is_benefit, isSalary: t.is_salary, paymentMethod: t.payment_method, carKm: t.car_km, liters: t.liters, installmentCurrent: t.installment_current, installmentTotal: t.installment_total
        })) : [],
        debts: debts ? debts.map((d: any) => ({
           id: d.id, name: d.name, totalValue: d.total_value, installmentsTotal: d.installments_total, installmentsPaid: d.installments_paid, dueDate: d.due_date, category: d.category, installmentValue: d.installment_value
        })) : [],
        investments: investments ? investments.map((i: any) => ({
           id: i.id, name: i.name, type: i.type, amount: i.amount, targetAmount: i.target_amount
        })) : [],
        fixedExpenses: fixedExp ? fixedExp.map((f: any) => ({
           id: f.id, title: f.title, amount: f.amount, day: f.day, category: f.category
        })) : [],
        showValues: true
      };
      setData(newData);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    if (session) {
      if (session.user.id === 'mock-user-123') setIsLoaded(true);
      else fetchSupabaseData();
    }
  }, [session]);

  const handleLogout = async () => {
    if (confirm('Tem certeza que deseja sair?')) {
        await supabase.auth.signOut();
        localStorage.removeItem('financas_app_demo');
        setSession(null);
        setIsDemoMode(false);
        setActiveTab('dashboard');
        setDbError(null);
    }
  };
  const handleMockLogin = () => {
      setIsDemoMode(true);
      setDbError(null);
      setSession({ user: { id: 'mock-user-123', email: 'demo@financas.blue' } });
      setData(prev => ({...prev, userName: 'Demo User'}));
      localStorage.setItem('financas_app_demo', 'true');
  };

  // --- SAVE / EDIT TRANSACTIONS ---
  const handleSaveTransaction = async (dataOrArray: Transaction | Omit<Transaction, 'id'> | Omit<Transaction, 'id'>[]) => {
    const inputs = Array.isArray(dataOrArray) ? dataOrArray : [dataOrArray];
    const isUpdate = inputs.length === 1 && 'id' in inputs[0];

    if (isDemoMode) {
        if (isUpdate) {
            const updated = inputs[0] as Transaction;
            setData(prev => ({
                ...prev,
                transactions: prev.transactions.map(t => t.id === updated.id ? updated : t)
            }));
        } else {
            const processed = inputs.map(t => ({ ...t, id: crypto.randomUUID() })) as Transaction[];
            setData(prev => ({ ...prev, transactions: [...processed, ...prev.transactions] }));
        }
        return;
    }

    if (isUpdate) {
        const t = inputs[0] as Transaction;
        const dbPayload = {
            type: t.type, amount: t.amount, date: t.date, category: t.category, subcategory: t.subcategory, description: t.description, is_benefit: t.isBenefit, is_salary: t.isSalary, payment_method: t.paymentMethod, car_km: t.carKm, liters: t.liters
        };
        const { error } = await supabase.from('transactions').update(dbPayload).eq('id', t.id);
        if (error) { alert('Erro ao atualizar transação'); console.error(error); } else { fetchSupabaseData(); }

    } else {
        const dbPayload = inputs.map((t: any) => ({
            user_id: session.user.id, type: t.type, amount: t.amount, date: t.date, category: t.category, subcategory: t.subcategory, description: t.description, is_benefit: t.isBenefit, is_salary: t.is_salary, payment_method: t.paymentMethod, car_km: t.car_km, liters: t.liters, installment_current: t.installment_current, installment_total: t.installment_total
        }));
        const { error } = await supabase.from('transactions').insert(dbPayload);
        if (error) { alert('Erro ao salvar transação'); console.error(error); } else { fetchSupabaseData(); }
    }
  };

  const handleEditTransaction = (transaction: Transaction) => {
      setEditingTransaction(transaction);
      setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (id: string) => {
      if (isDemoMode) {
          setData(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) }));
          return;
      }
      const { error } = await supabase.from('transactions').delete().eq('id', id);
      if (error) alert('Erro ao excluir'); else fetchSupabaseData();
  };

  // --- SAVE / EDIT LOANS --- (Unchanged)
  const handleSaveDebt = async (debtData: Debt | Omit<Debt, 'id'>) => {
    const isUpdate = 'id' in debtData;

    if (isDemoMode) {
       if (isUpdate) {
           setData(prev => ({ ...prev, debts: prev.debts.map(d => d.id === (debtData as Debt).id ? (debtData as Debt) : d) }));
       } else {
           const loan: Debt = { ...(debtData as Omit<Debt, 'id'>), id: crypto.randomUUID() };
           setData(prev => ({ ...prev, debts: [...prev.debts, loan] }));
       }
       return;
    }

    const payload = {
        name: debtData.name, 
        total_value: debtData.totalValue, 
        installments_total: debtData.installmentsTotal, 
        installments_paid: debtData.installmentsPaid, 
        due_date: debtData.dueDate, 
        category: debtData.category, 
        installment_value: debtData.installmentValue
    };

    if (isUpdate) {
        const { error } = await supabase.from('debts').update(payload).eq('id', (debtData as Debt).id);
        if (error) alert('Erro ao atualizar dívida'); else fetchSupabaseData();
    } else {
        const { error } = await supabase.from('debts').insert({ user_id: session.user.id, ...payload });
        if (error) alert('Erro ao salvar dívida'); else fetchSupabaseData();
    }
  };

  const handleEditDebt = (debt: Debt) => {
      setEditingDebt(debt);
      setIsLoanModalOpen(true);
  };

  const handleDeleteDebt = async (id: string) => {
      if (isDemoMode) {
          setData(prev => ({ ...prev, debts: prev.debts.filter(d => d.id !== id) }));
          return;
      }
      const { error } = await supabase.from('debts').delete().eq('id', id);
      if (error) alert('Erro ao excluir'); else fetchSupabaseData();
  };


  const handleAddInvestment = async () => {
      if (isDemoMode) {
        const newInv: Investment = { id: crypto.randomUUID(), name: 'Novo Aporte', type: 'variable', amount: 1000 };
        setData(prev => ({ ...prev, investments: [...prev.investments, newInv] }));
        return;
      }
      const { error } = await supabase.from('investments').insert({ user_id: session.user.id, name: 'Novo Investimento', type: 'variable', amount: 1000 });
      if (error) alert('Erro ao criar investimento'); else fetchSupabaseData();
  };
  // Fixed Expenses Handlers
  const handleAddFixedExpense = async (expense: Omit<FixedExpense, 'id'>) => {
      if (isDemoMode) {
          setData(prev => ({ ...prev, fixedExpenses: [...prev.fixedExpenses, { ...expense, id: crypto.randomUUID() }] }));
          return;
      }
      const { error } = await supabase.from('fixed_expenses').insert({
          user_id: session.user.id,
          title: expense.title,
          amount: expense.amount,
          day: expense.day,
          category: expense.category
      });
      if (error) { console.error(error); alert('Erro ao adicionar gasto fixo. Verifique se criou a tabela no Supabase.'); }
      else fetchSupabaseData();
  };
  const handleDeleteFixedExpense = async (id: string) => {
      if (isDemoMode) {
          setData(prev => ({ ...prev, fixedExpenses: prev.fixedExpenses.filter(f => f.id !== id) }));
          return;
      }
      await supabase.from('fixed_expenses').delete().eq('id', id);
      fetchSupabaseData();
  };

  const handlePayInstallment = async (id: string) => {
    if (isDemoMode) {
        setData(prev => ({ ...prev, debts: prev.debts.map(d => d.id === id && d.installmentsPaid < d.installmentsTotal ? { ...d, installmentsPaid: d.installmentsPaid + 1 } : d) }));
        return;
    }
    const debt = data.debts.find(d => d.id === id);
    if (!debt || debt.installmentsPaid >= debt.installmentsTotal) return;
    const { error } = await supabase.from('debts').update({ installments_paid: debt.installmentsPaid + 1 }).eq('id', id);
    if (error) alert('Erro ao atualizar parcela'); else fetchSupabaseData();
  };
  
  // Update helpers
  const handleUpdateBalance = async (updates: { balance: number; benefit: number; ccLimit: number; ccInvoice: number; closingDay: number; dueDay: number }) => {
      if (isDemoMode) {
          setData(prev => ({
              ...prev,
              initialBalance: updates.balance,
              initialBenefitBalance: updates.benefit,
              creditCard: {
                  ...prev.creditCard,
                  limit: updates.ccLimit,
                  initialInvoiceOffset: updates.ccInvoice,
                  closingDate: updates.closingDay,
                  dueDate: updates.dueDay
              }
          }));
          return;
      }
      const { error } = await supabase.from('profiles').update({
          initial_balance: updates.balance,
          initial_benefit_balance: updates.benefit,
          credit_card_config: {
              limit: updates.ccLimit,
              initialInvoiceOffset: updates.ccInvoice,
              closingDate: updates.closingDay,
              dueDate: updates.dueDay
          }
      }).eq('id', session.user.id);
      if (error) alert('Erro ao salvar ajustes.');
      else fetchSupabaseData();
  };

  const handleUpdateCar = async (config: any) => {
      if (isDemoMode) {
          setData(prev => ({ ...prev, car: config }));
          return;
      }
      const { error } = await supabase.from('profiles').update({ car_config: config }).eq('id', session.user.id);
      if (error) alert('Erro ao salvar veículo.'); else fetchSupabaseData();
  };

  const handleUpdateHouse = async (config: any) => {
      if (isDemoMode) {
          setData(prev => ({ ...prev, house: config }));
          return;
      }
      const { error } = await supabase.from('profiles').update({ house_config: config }).eq('id', session.user.id);
      if (error) alert('Erro ao salvar casa.'); else fetchSupabaseData();
  };

  const handleUpdatePartner = async (config: any) => {
      if (isDemoMode) {
          setData(prev => ({ ...prev, partner: config }));
          return;
      }
      const { error } = await supabase.from('profiles').update({ partner_config: config }).eq('id', session.user.id);
      if (error) alert('Erro ao salvar relacionamento.'); else fetchSupabaseData();
  };

  const togglePrivacy = () => {
      setData(prev => ({ ...prev, showValues: !prev.showValues }));
  };

  const handleResetData = async () => {
    if (!confirm('Esta ação apagará todos os dados (transações, dívidas, configurações). Deseja continuar?')) return;
    
    if (isDemoMode) {
        setData({ ...INITIAL_DATA, userName: 'Demo User', showValues: true });
        return;
    }

    try {
        // Delete dependent data first
        await supabase.from('transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('debts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('investments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('fixed_expenses').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        
        // Reset profile
        await supabase.from('profiles').update({
            initial_balance: 0,
            initial_benefit_balance: 0,
            credit_card_config: INITIAL_DATA.creditCard,
            car_config: INITIAL_DATA.car,
            house_config: INITIAL_DATA.house,
            partner_config: INITIAL_DATA.partner
        }).eq('id', session.user.id);

        fetchSupabaseData();
        alert('Dados resetados com sucesso.');
    } catch (e) {
        console.error(e);
        alert('Erro ao resetar dados. Verifique o console.');
    }
  };

  const openTransactionWithPreset = (cat: CategoryKey, sub?: string, forcedType: 'expense' | 'income' = 'expense', date?: string) => { 
      setEditingTransaction(null);
      setPrefillType(forcedType);
      setPrefillCategory(cat); 
      setPrefillSubcategory(sub); 
      setPrefillDate(date);
      setIsModalOpen(true); 
  }

  const SettingsView = ({onBack}: {onBack: () => void}) => {
    return (
      <div className="pb-32 animate-in slide-in-from-right duration-300">
        <div className="flex items-center gap-3 mb-6 pt-4">
           {isMobile && <button onClick={onBack} className="p-2 bg-white rounded-full shadow-sm text-[#13312A] active:scale-95 transition-transform"><ArrowLeft size={20} /></button>}
           <h2 className="text-2xl font-bold text-[#13312A] font-serif">Ajustes</h2>
        </div>
        <div className="bg-[#FFFDF5] rounded-3xl p-6 shadow-sm mb-4 border border-[#13312A]/10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-[#13312A] flex items-center gap-2"><Edit3 size={16} /> Ajuste Geral</h3>
              <p className="text-[#155446] text-xs mt-1 leading-relaxed max-w-[85%]">Sincronize o saldo da conta, benefícios e fatura.</p>
            </div>
          </div>
          <button onClick={() => setIsBalanceModalOpen(true)} className="w-full py-3 bg-[#13312A]/10 text-[#13312A] rounded-xl font-bold text-sm hover:bg-[#C69A72]/20 transition-colors">Corrigir Saldos e Limites</button>
        </div>
        
        <div className="bg-[#FFFDF5] rounded-3xl p-6 shadow-sm mb-4 border border-[#13312A]/10">
           <div className="flex items-start justify-between mb-4">
             <div>
               <h3 className="font-bold text-[#13312A] flex items-center gap-2"><CalendarClock size={16} /> Gastos Fixos</h3>
               <p className="text-[#155446] text-xs mt-1 leading-relaxed max-w-[85%]">
                 Cadastre assinaturas e contas recorrentes para melhorar sua previsão de liquidez.
               </p>
             </div>
           </div>
           <button onClick={() => setIsFixedExpenseModalOpen(true)} className="w-full py-3 bg-[#13312A]/10 text-[#13312A] rounded-xl font-bold text-sm hover:bg-[#C69A72]/20 transition-colors">Gerenciar Recorrências</button>
        </div>

        <div className="bg-[#FFFDF5] rounded-3xl p-6 shadow-sm mb-4 border border-[#13312A]/10">
          <h3 className="font-bold text-[#13312A] mb-2 font-serif">Dados da Conta</h3>
          <p className="text-[#155446] text-sm mb-4">Gerenciamento de dados.</p>
          <button onClick={handleResetData} className="flex items-center gap-2 text-[#9F3E34] font-medium p-3 bg-[#9F3E34]/10 rounded-xl w-full justify-center active:bg-[#9F3E34]/20 transition-colors">
            <Trash2 size={18} /> {isDemoMode ? 'Restaurar Padrão' : 'Apagar Tudo'}
          </button>
        </div>
        <div className="text-center text-xs text-[#155446] mt-4"><p>Finanças Blue v2.3 (Forest)</p></div>
      </div>
    );
  };

  const renderContent = () => {
    // If mobile and dashboard tab is active, we show the special MobileHome instead of standard Dashboard
    if (isMobile && activeTab === 'dashboard') {
        return <MobileHome data={data} userName={data.userName} onOpenTransaction={(t, c, s) => openTransactionWithPreset(c || 'others', s, t)} />;
    }

    switch (activeTab) {
      case 'dashboard': return <Dashboard data={data} togglePrivacy={togglePrivacy} onNavigate={setActiveTab} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'calendar': return <CalendarView data={data} onOpenSidebar={() => setIsSidebarOpen(true)} onAddTransaction={(date) => openTransactionWithPreset('others', undefined, 'expense', date)} />;
      case 'investments': return <InvestmentsView data={data} onAddInvestment={handleAddInvestment} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'cards': return <CreditCardView data={data} onOpenSettings={() => setIsBalanceModalOpen(true)} onOpenSidebar={() => setIsSidebarOpen(true)} onAddTransaction={handleSaveTransaction} onEditTransaction={handleEditTransaction} />;
      case 'loans': return <LoanView debts={data.debts} onOpenAddLoan={() => { setEditingDebt(null); setIsLoanModalOpen(true); }} onPayInstallment={handlePayInstallment} onOpenSidebar={() => setIsSidebarOpen(true)} onEditDebt={handleEditDebt} />;
      case 'car-details': return <CarView data={data} onBack={() => setActiveTab('dashboard')} onOpenSettings={() => setIsCarConfigOpen(true)} onQuickAdd={(sub) => openTransactionWithPreset('car', sub)} onOpenSidebar={() => setIsSidebarOpen(true)} onEditTransaction={handleEditTransaction} />;
      case 'house-details': return <HouseView data={data} onBack={() => setActiveTab('dashboard')} onOpenSettings={() => setIsHouseConfigOpen(true)} onQuickAdd={(sub) => openTransactionWithPreset('house', sub)} onOpenSidebar={() => setIsSidebarOpen(true)} onEditTransaction={handleEditTransaction} />;
      case 'partner-details': return <PartnerView data={data} onBack={() => setActiveTab('dashboard')} onOpenSettings={() => setIsPartnerConfigOpen(true)} onQuickAdd={(sub) => openTransactionWithPreset('partner', sub)} onOpenSidebar={() => setIsSidebarOpen(true)} onEditTransaction={handleEditTransaction} />;
      case 'settings': return <SettingsView onBack={() => setActiveTab('dashboard')} />;
      default: return <Dashboard data={data} togglePrivacy={togglePrivacy} onNavigate={setActiveTab} onOpenSidebar={() => setIsSidebarOpen(true)} />;
    }
  };

  if (!isLoaded && !isDemoMode && session && !dbError) return <div className="min-h-screen bg-[#F6E9CA] flex items-center justify-center"><Loader2 size={32} className="text-[#13312A] animate-spin" /></div>;
  if (isLoadingSession) return <div className="min-h-screen bg-[#F6E9CA] flex items-center justify-center"><Loader2 size={32} className="text-[#13312A] animate-spin" /></div>;
  if (!session) return <LoginView onLoginSuccess={handleMockLogin} />;
  if (dbError === 'missing_table') return <SetupRequiredView onRetry={() => window.location.reload()} onDemo={handleMockLogin} />;

  // --- DESKTOP LAYOUT ---
  if (!isMobile) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#F6E9CA] text-[#13312A] font-sans selection:bg-[#C69A72]">
        {/* Desktop Sidebar (Fixed Width, Independent Scroll) */}
        <div className="w-72 shrink-0 h-full border-r border-[#13312A]/10 bg-[#FFFDF5] relative z-20">
          <Sidebar 
            isOpen={true} 
            onClose={() => {}} 
            onNavigate={setActiveTab} 
            activeTab={activeTab} 
            userName={data.userName} 
            onLogout={handleLogout} 
            onOpenAdd={() => openTransactionWithPreset('others', undefined, 'expense')} 
          />
        </div>
        
        {/* Main Content Area (Independent Scroll) */}
        <main className="flex-1 h-full overflow-y-auto relative z-10 scroll-smooth">
           <div className="p-6 md:p-8 min-h-full">
              {renderContent()}
           </div>
        </main>

        {/* Modals (Fixed on screen) */}
        <TransactionModal 
            isOpen={isModalOpen} 
            onClose={() => { setIsModalOpen(false); setEditingTransaction(null); setPrefillCategory(undefined); setPrefillSubcategory(undefined); setPrefillDate(undefined); }} 
            onSave={handleSaveTransaction} 
            onDelete={handleDeleteTransaction}
            initialCategory={prefillCategory} 
            initialSubcategory={prefillSubcategory} 
            initialData={editingTransaction}
            initialType={prefillType}
            initialDate={prefillDate}
        />
        {/* ... Other modals same as mobile ... */}
        <BalanceAdjustmentModal isOpen={isBalanceModalOpen} onClose={() => setIsBalanceModalOpen(false)} data={data} onUpdate={handleUpdateBalance} />
        <LoanModal isOpen={isLoanModalOpen} onClose={() => { setIsLoanModalOpen(false); setEditingDebt(null); }} onSave={handleSaveDebt} onDelete={handleDeleteDebt} initialData={editingDebt} />
        <FixedExpensesModal isOpen={isFixedExpenseModalOpen} onClose={() => setIsFixedExpenseModalOpen(false)} fixedExpenses={data.fixedExpenses} onAdd={handleAddFixedExpense} onDelete={handleDeleteFixedExpense} />
        <CarConfigModal isOpen={isCarConfigOpen} onClose={() => setIsCarConfigOpen(false)} data={data} onUpdate={handleUpdateCar} />
        <HouseConfigModal isOpen={isHouseConfigOpen} onClose={() => setIsHouseConfigOpen(false)} data={data} onUpdate={handleUpdateHouse} />
        <PartnerConfigModal isOpen={isPartnerConfigOpen} onClose={() => setIsPartnerConfigOpen(false)} data={data} onUpdate={handleUpdatePartner} />
      </div>
    );
  }

  // --- MOBILE LAYOUT (Classic) ---
  return (
    <div className="min-h-screen bg-[#F6E9CA] text-[#13312A] font-sans selection:bg-[#C69A72]">
      <main className="max-w-md mx-auto min-h-screen relative p-6">
        {renderContent()}
      </main>

      {/* Navigation Bar shown on Mobile Only */}
      {['dashboard', 'cards', 'investments', 'calendar', 'settings', 'loans'].includes(activeTab) && (
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} onOpenAdd={() => openTransactionWithPreset('others')} />
      )}

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onNavigate={setActiveTab} activeTab={activeTab} userName={data.userName} onLogout={handleLogout} onOpenAdd={() => { setIsSidebarOpen(false); openTransactionWithPreset('others'); }} />

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingTransaction(null); setPrefillCategory(undefined); setPrefillSubcategory(undefined); setPrefillDate(undefined); }} 
        onSave={handleSaveTransaction} 
        onDelete={handleDeleteTransaction}
        initialCategory={prefillCategory} 
        initialSubcategory={prefillSubcategory} 
        initialData={editingTransaction}
        initialType={prefillType}
        initialDate={prefillDate}
      />
      <BalanceAdjustmentModal isOpen={isBalanceModalOpen} onClose={() => setIsBalanceModalOpen(false)} data={data} onUpdate={handleUpdateBalance} />
      <LoanModal isOpen={isLoanModalOpen} onClose={() => { setIsLoanModalOpen(false); setEditingDebt(null); }} onSave={handleSaveDebt} onDelete={handleDeleteDebt} initialData={editingDebt} />
      <FixedExpensesModal isOpen={isFixedExpenseModalOpen} onClose={() => setIsFixedExpenseModalOpen(false)} fixedExpenses={data.fixedExpenses} onAdd={handleAddFixedExpense} onDelete={handleDeleteFixedExpense} />
      <CarConfigModal isOpen={isCarConfigOpen} onClose={() => setIsCarConfigOpen(false)} data={data} onUpdate={handleUpdateCar} />
      <HouseConfigModal isOpen={isHouseConfigOpen} onClose={() => setIsHouseConfigOpen(false)} data={data} onUpdate={handleUpdateHouse} />
      <PartnerConfigModal isOpen={isPartnerConfigOpen} onClose={() => setIsPartnerConfigOpen(false)} data={data} onUpdate={handleUpdatePartner} />
    </div>
  );
}
export default App;