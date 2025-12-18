
import React, { useState, useEffect } from 'react';
import { Transaction, Debt, AppData, CategoryKey, Investment, FixedExpense, FixedIncome, CreditCard } from './types';
import { Dashboard } from './components/Dashboard';
import { CarView } from './components/CarView';
import { HouseView } from './components/HouseView';
import { PartnerView } from './components/PartnerView';
import { LoanView } from './components/LoanView';
import { CreditCardView } from './components/CreditCardView';
import { CalendarView } from './components/CalendarView';
import { InvestmentsView } from './components/InvestmentsView';
import { SettingsView } from './components/SettingsView';
import { TransactionModal } from './components/TransactionModal';
import { LoanModal } from './components/LoanModal';
import { InvestmentModal } from './components/InvestmentModal';
import { Sidebar } from './components/Sidebar';
import { MobileHome } from './components/MobileHome'; 
import { LoginView } from './components/LoginView'; 
import { Loader2 } from 'lucide-react';
import { supabase } from './supabaseClient';

const INITIAL_DATA: AppData = {
  transactions: [],
  debts: [],
  investments: [],
  fixedExpenses: [],
  fixedIncomes: [],
  userName: 'Usuário',
  showValues: true,
  initialBalance: 0,
  initialBenefitBalance: 0,
  creditCards: [], 
  car: { modelName: '', ipvaTotal: 0, insuranceTotal: 0, licensingTotal: 0, plateLastDigit: '' },
  house: { rentAmount: 0, internetAmount: 0, electricityBudget: 0, marketBudget: 0 },
  partner: { partnerName: '', dateBudget: 0 }
};

const useMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);
    return isMobile;
};

function App() {
  const isMobile = useMobile();
  const [session, setSession] = useState<any>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isInvestmentModalOpen, setIsInvestmentModalOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  
  const [prefillCategory, setPrefillCategory] = useState<CategoryKey | undefined>(undefined);
  const [prefillSubcategory, setPrefillSubcategory] = useState<string>('');
  const [prefillType, setPrefillType] = useState<'expense'|'income'>('expense');
  const [prefillInvType, setPrefillInvType] = useState<Investment['type']>('fixed');

  const [data, setData] = useState<AppData>(INITIAL_DATA);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    let mounted = true;
    const checkSession = async () => {
        const { data: { session: sbSession } } = await supabase.auth.getSession();
        if (sbSession && mounted) { setSession(sbSession); setIsLoadingSession(false); }
        else {
          const isDemoStored = localStorage.getItem('financas_app_demo') === 'true';
          if (isDemoStored && mounted) { setIsDemoMode(true); setSession({ user: { id: 'mock', email: 'demo@fingreen.me' } }); setIsLoadingSession(false); }
          else if (mounted) setIsLoadingSession(false);
        }
    };
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) { if (session) setSession(session); else if (!localStorage.getItem('financas_app_demo')) setSession(null); }
    });
    return () => { mounted = false; subscription.unsubscribe(); };
  }, []);

  const fetchSupabaseData = async () => {
    if (!session?.user || isDemoMode) { setIsLoaded(true); return; }
    try {
      const userId = session.user.id;
      const [profileRes, transRes, fixedExpRes, fixedIncRes, debtsRes, invsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('transactions').select('*').eq('user_id', userId),
        supabase.from('fixed_expenses').select('*').eq('user_id', userId),
        supabase.from('fixed_incomes').select('*').eq('user_id', userId),
        supabase.from('debts').select('*').eq('user_id', userId),
        supabase.from('investments').select('*').eq('user_id', userId)
      ]);

      const profile = profileRes.data;

      setData(prev => ({
        ...prev,
        userName: profile?.user_name || 'Usuário',
        initialBalance: Number(profile?.initial_balance) || 0,
        initialBenefitBalance: Number(profile?.initial_benefit_balance) || 0,
        creditCards: profile?.credit_card_config?.cards || [],
        car: profile?.car_config || INITIAL_DATA.car,
        house: profile?.house_config || INITIAL_DATA.house,
        partner: profile?.partner_config || INITIAL_DATA.partner,
        transactions: transRes.data ? transRes.data.map((t: any) => ({
          id: t.id, 
          amount: Number(t.amount) || 0, 
          date: t.date, 
          type: t.type, 
          category: t.category, 
          subcategory: t.subcategory,
          description: t.description, 
          isBenefit: t.is_benefit, 
          paymentMethod: t.payment_method, 
          cardId: t.card_id,
          carKm: t.car_km,
          liters: t.liters
        })) : [],
        fixedExpenses: fixedExpRes.data ? fixedExpRes.data.map((fe: any) => ({
          id: fe.id, title: fe.title, amount: Number(fe.amount) || 0, day: Number(fe.day) || 1, category: fe.category || 'others'
        })) : [],
        fixedIncomes: fixedIncRes.data ? fixedIncRes.data.map((fi: any) => ({
          id: fi.id, title: fi.title, amount: Number(fi.amount) || 0, day: Number(fi.day) || 1, category: fi.category || 'others'
        })) : [],
        debts: debtsRes.data ? debtsRes.data.map((d: any) => ({
          id: d.id, name: d.name, totalValue: Number(d.total_value) || 0, installmentsTotal: Number(d.installments_total) || 1, installmentsPaid: Number(d.installments_paid) || 0, dueDate: Number(d.due_date) || 1, installmentValue: Number(d.installment_value) || 0, category: d.category || 'personal', color: d.color
        })) : [],
        investments: invsRes.data ? invsRes.data.map((i: any) => ({
          id: i.id, name: i.name, type: i.type, amount: Number(i.amount) || 0, targetAmount: i.target_amount ? Number(i.target_amount) : undefined, color: i.color, icon: i.icon
        })) : []
      }));
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => { if (session) fetchSupabaseData(); }, [session]);

  const handleUpdateProfile = async (name: string, balance: number, benefit: number) => {
    if (isDemoMode) {
      setData(prev => ({ ...prev, userName: name, initialBalance: balance, initialBenefitBalance: benefit }));
      return;
    }
    await supabase.from('profiles').update({
      user_name: name,
      initial_balance: balance,
      initial_benefit_balance: benefit
    }).eq('id', session.user.id);
    fetchSupabaseData();
  };

  const handleUpdateConfigs = async (category: 'car' | 'house' | 'partner', config: any) => {
    if (isDemoMode) {
      setData(prev => ({ ...prev, [category]: config }));
      return;
    }
    const column = category === 'car' ? 'car_config' : category === 'house' ? 'house_config' : 'partner_config';
    await supabase.from('profiles').update({ [column]: config }).eq('id', session.user.id);
    fetchSupabaseData();
  };

  // FIXED ITEMS HANDLERS
  const handleSaveFixedExpense = async (expense: Omit<FixedExpense, 'id'>) => {
    if (isDemoMode) {
      setData(prev => ({ ...prev, fixedExpenses: [...prev.fixedExpenses, { ...expense, id: crypto.randomUUID() }] }));
      return;
    }
    await supabase.from('fixed_expenses').insert({ ...expense, user_id: session.user.id });
    fetchSupabaseData();
  };

  const handleDeleteFixedExpense = async (id: string) => {
    if (isDemoMode) {
      setData(prev => ({ ...prev, fixedExpenses: prev.fixedExpenses.filter(e => e.id !== id) }));
      return;
    }
    await supabase.from('fixed_expenses').delete().eq('id', id);
    fetchSupabaseData();
  };

  const handleSaveFixedIncome = async (income: Omit<FixedIncome, 'id'>) => {
    if (isDemoMode) {
      setData(prev => ({ ...prev, fixedIncomes: [...prev.fixedIncomes, { ...income, id: crypto.randomUUID() }] }));
      return;
    }
    await supabase.from('fixed_incomes').insert({ ...income, user_id: session.user.id });
    fetchSupabaseData();
  };

  const handleDeleteFixedIncome = async (id: string) => {
    if (isDemoMode) {
      setData(prev => ({ ...prev, fixedIncomes: prev.fixedIncomes.filter(i => i.id !== id) }));
      return;
    }
    await supabase.from('fixed_incomes').delete().eq('id', id);
    fetchSupabaseData();
  };

  const handleSaveInvestment = async (inv: any) => {
    if (isDemoMode) {
      if (inv.id) {
        setData(prev => ({ ...prev, investments: prev.investments.map(i => i.id === inv.id ? { ...i, ...inv } : i) }));
      } else {
        setData(prev => ({ ...prev, investments: [...prev.investments, { ...inv, id: crypto.randomUUID() }] }));
      }
      return;
    }
    const payload = { user_id: session.user.id, name: inv.name, amount: inv.amount, target_amount: inv.targetAmount, type: inv.type, color: inv.color, icon: inv.icon };
    if (inv.id) await supabase.from('investments').update(payload).eq('id', inv.id);
    else await supabase.from('investments').insert(payload);
    fetchSupabaseData();
  };

  const handleDeleteInvestment = async (id: string) => {
    if (isDemoMode) { setData(prev => ({ ...prev, investments: prev.investments.filter(i => i.id !== id) })); return; }
    await supabase.from('investments').delete().eq('id', id);
    fetchSupabaseData();
  };

  const handleSaveDebt = async (debt: any) => {
    if (isDemoMode) {
      if (debt.id) setData(prev => ({ ...prev, debts: prev.debts.map(d => d.id === debt.id ? { ...d, ...debt } : d) }));
      else setData(prev => ({ ...prev, debts: [...prev.debts, { ...debt, id: crypto.randomUUID() }] }));
      return;
    }
    const payload = { user_id: session.user.id, name: debt.name, total_value: debt.totalValue, installments_total: debt.installmentsTotal, installments_paid: debt.installmentsPaid, due_date: debt.dueDate, installment_value: debt.installmentValue, category: debt.category };
    if (debt.id) await supabase.from('debts').update(payload).eq('id', debt.id);
    else await supabase.from('debts').insert(payload);
    fetchSupabaseData();
  };

  const handleDeleteDebt = async (id: string) => {
    if (isDemoMode) { setData(prev => ({ ...prev, debts: prev.debts.filter(d => d.id !== id) })); return; }
    await supabase.from('debts').delete().eq('id', id);
    fetchSupabaseData();
  };

  const handlePayInstallment = async (id: string) => {
    const debt = data.debts.find(d => d.id === id);
    if (!debt) return;
    const newPaid = Math.min(debt.installmentsPaid + 1, debt.installmentsTotal);
    const transactionPayload = { amount: debt.installmentValue || (debt.totalValue / debt.installmentsTotal), date: new Date().toISOString().split('T')[0], type: 'expense' as const, category: 'debt' as const, subcategory: debt.name, description: `Parcela ${newPaid}/${debt.installmentsTotal} - ${debt.name}`, paymentMethod: 'debit' as const };
    if (isDemoMode) {
        setData(prev => ({
            ...prev,
            debts: prev.debts.map(d => d.id === id ? { ...d, installmentsPaid: newPaid } : d),
            transactions: [{ ...transactionPayload, id: crypto.randomUUID() }, ...prev.transactions]
        }));
        return;
    }
    await Promise.all([
        supabase.from('debts').update({ installments_paid: newPaid }).eq('id', id),
        supabase.from('transactions').insert({ ...transactionPayload, user_id: session.user.id, is_benefit: false })
    ]);
    fetchSupabaseData();
  };

  const handleSaveCard = async (card: CreditCard | Omit<CreditCard, 'id'>) => {
    const cardWithId = (card as any).id ? (card as CreditCard) : { ...card, id: crypto.randomUUID() };
    let updatedCards: CreditCard[] = (card as any).id ? data.creditCards.map(c => c.id === (card as any).id ? cardWithId : c) : [...data.creditCards, cardWithId];
    if (isDemoMode) { setData(prev => ({ ...prev, creditCards: updatedCards })); return; }
    await supabase.from('profiles').update({ credit_card_config: { cards: updatedCards } }).eq('id', session.user.id);
    fetchSupabaseData();
  };

  const handleDeleteCard = async (id: string) => {
    const updatedCards = data.creditCards.filter(c => c.id !== id);
    if (isDemoMode) { setData(prev => ({ ...prev, creditCards: updatedCards })); return; }
    await supabase.from('profiles').update({ credit_card_config: { cards: updatedCards } }).eq('id', session.user.id);
    fetchSupabaseData();
  };

  const handleSaveTransaction = async (t: any) => {
    if (isDemoMode) {
      const processed = (Array.isArray(t) ? t : [t]).map(x => ({ ...x, id: crypto.randomUUID() }));
      setData(prev => ({ ...prev, transactions: [...processed, ...prev.transactions] }));
      return;
    }
    const inputs = Array.isArray(t) ? t : [t];
    const dbPayload = inputs.map(x => ({ user_id: session.user.id, amount: x.amount, date: x.date, type: x.type, category: x.category, subcategory: x.subcategory, description: x.description, is_benefit: x.is_benefit, payment_method: x.payment_method, card_id: x.card_id, car_km: x.carKm, liters: x.liters }));
    await supabase.from('transactions').insert(dbPayload);
    fetchSupabaseData();
  };

  const handleDeleteTransaction = async (id: string) => {
      if (isDemoMode) { setData(prev => ({ ...prev, transactions: prev.transactions.filter(t => t.id !== id) })); return; }
      await supabase.from('transactions').delete().eq('id', id);
      fetchSupabaseData();
  };

  const renderContent = () => {
    if (isMobile) return <MobileHome data={data} userName={data.userName} onOpenTransaction={openModal} />;
    
    switch (activeTab) {
      case 'dashboard': return <Dashboard data={data} togglePrivacy={() => setData(p => ({...p, showValues: !p.showValues}))} onNavigate={setActiveTab} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'calendar': return <CalendarView data={data} onOpenSidebar={() => setIsSidebarOpen(true)} onAddTransaction={(date) => { setPrefillType('expense'); setIsModalOpen(true); }} />;
      case 'investments': return <InvestmentsView data={data} onAddInvestment={(type) => { setEditingInvestment(null); setPrefillInvType(type || 'fixed'); setIsInvestmentModalOpen(true); }} onEditInvestment={(inv) => { setEditingInvestment(inv); setIsInvestmentModalOpen(true); }} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'cards': return <CreditCardView data={data} onOpenSettings={() => setActiveTab('settings')} onOpenSidebar={() => setIsSidebarOpen(true)} onAddTransaction={handleSaveTransaction} onEditTransaction={(t) => { setEditingTransaction(t); setIsModalOpen(true); }} onSaveCard={handleSaveCard} onDeleteCard={handleDeleteCard} />;
      case 'loans': return <LoanView debts={data.debts} onOpenAddLoan={() => { setEditingDebt(null); setIsLoanModalOpen(true); }} onPayInstallment={handlePayInstallment} onOpenSidebar={() => setIsSidebarOpen(true)} onEditDebt={(debt) => { setEditingDebt(debt); setIsLoanModalOpen(true); }} />;
      case 'settings': return (
        <SettingsView 
          data={data} 
          onUpdateProfile={handleUpdateProfile} 
          onUpdateConfigs={handleUpdateConfigs} 
          onAddFixedExpense={handleSaveFixedExpense} 
          onDeleteFixedExpense={handleDeleteFixedExpense} 
          onAddFixedIncome={handleSaveFixedIncome} 
          onDeleteFixedIncome={handleDeleteFixedIncome} 
          onResetData={() => setData(INITIAL_DATA)} 
          onOpenSidebar={() => setIsSidebarOpen(true)} 
        />
      );
      case 'car-details': return <CarView data={data} onBack={() => setActiveTab('dashboard')} onOpenSettings={() => setActiveTab('settings')} onQuickAdd={(sub) => openModal('expense', 'car', sub)} onOpenSidebar={() => setIsSidebarOpen(true)} onEditTransaction={(t) => { setEditingTransaction(t); setIsModalOpen(true); }} />;
      case 'house-details': return <HouseView data={data} onBack={() => setActiveTab('dashboard')} onOpenSettings={() => setActiveTab('settings')} onQuickAdd={(sub) => openModal('expense', 'house', sub)} onOpenSidebar={() => setIsSidebarOpen(true)} onEditTransaction={(t) => { setEditingTransaction(t); setIsModalOpen(true); }} />;
      case 'partner-details': return <PartnerView data={data} onBack={() => setActiveTab('dashboard')} onOpenSettings={() => setActiveTab('settings')} onQuickAdd={(sub) => openModal('expense', 'partner', sub)} onOpenSidebar={() => setIsSidebarOpen(true)} onEditTransaction={(t) => { setEditingTransaction(t); setIsModalOpen(true); }} />;
      default: return <Dashboard data={data} togglePrivacy={() => setData(p => ({...p, showValues: !p.showValues}))} onNavigate={setActiveTab} onOpenSidebar={() => setIsSidebarOpen(true)} />;
    }
  };

  const openModal = (t: 'expense'|'income' = 'expense', c?: CategoryKey, s?: string) => {
      setPrefillType(t); setPrefillCategory(c); setPrefillSubcategory(s || ''); setEditingTransaction(null); setIsModalOpen(true);
  };

  if (isLoadingSession) return <div className="min-h-screen bg-[#F6E9CA] flex items-center justify-center"><Loader2 className="animate-spin text-[#13312A]" /></div>;
  if (!session) return <LoginView onLoginSuccess={() => { setIsDemoMode(true); setSession({user:{id:'mock'}}); localStorage.setItem('financas_app_demo', 'true'); }} />;

  return (
    <div className={`min-h-screen bg-[#F6E9CA] text-[#13312A] font-sans flex`}>
      {!isMobile && <Sidebar isOpen={true} onClose={() => {}} onNavigate={setActiveTab} activeTab={activeTab} userName={data.userName} onLogout={() => { setSession(null); localStorage.removeItem('financas_app_demo'); }} onOpenAdd={() => openModal()} />}
      {isMobile && <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} onNavigate={setActiveTab} activeTab={activeTab} userName={data.userName} onLogout={() => { setSession(null); localStorage.removeItem('financas_app_demo'); }} onOpenAdd={() => { setIsSidebarOpen(false); openModal(); }} />}
      <main className={`flex-1 transition-all duration-500 overflow-y-auto ${isMobile ? 'p-6' : 'px-12 py-12'}`}>
        <div className={isMobile ? 'max-w-md mx-auto' : 'max-w-6xl mx-auto'}>{renderContent()}</div>
      </main>
      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTransaction} onDelete={handleDeleteTransaction} creditCards={data.creditCards} initialCategory={prefillCategory} initialSubcategory={prefillSubcategory} initialType={prefillType} initialData={editingTransaction} />
      <InvestmentModal isOpen={isInvestmentModalOpen} onClose={() => setIsInvestmentModalOpen(false)} onSave={handleSaveInvestment} onDelete={handleDeleteInvestment} initialType={prefillInvType} initialData={editingInvestment} />
      <LoanModal isOpen={isLoanModalOpen} onClose={() => setIsLoanModalOpen(false)} onSave={handleSaveDebt} onDelete={handleDeleteDebt} initialData={editingDebt} />
    </div>
  );
}
export default App;
