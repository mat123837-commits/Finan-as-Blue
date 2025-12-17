
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
import { TransactionModal } from './components/TransactionModal';
import { LoanModal } from './components/LoanModal';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  
  const [prefillCategory, setPrefillCategory] = useState<CategoryKey | undefined>(undefined);
  const [prefillSubcategory, setPrefillSubcategory] = useState<string | undefined>(undefined);
  const [prefillType, setPrefillType] = useState<'expense'|'income'>('expense');

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
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      const { data: trans } = await supabase.from('transactions').select('*').eq('user_id', session.user.id);
      const { data: fixedExp } = await supabase.from('fixed_expenses').select('*').eq('user_id', session.user.id);
      const { data: debts } = await supabase.from('debts').select('*').eq('user_id', session.user.id);

      setData(prev => ({
        ...prev,
        userName: profile?.user_name || 'Usuário',
        initialBalance: profile?.initial_balance || 0,
        initialBenefitBalance: profile?.initial_benefit_balance || 0,
        creditCards: profile?.credit_card_config?.cards || [],
        car: profile?.car_config || INITIAL_DATA.car,
        house: profile?.house_config || INITIAL_DATA.house,
        partner: profile?.partner_config || INITIAL_DATA.partner,
        transactions: trans ? trans.map((t: any) => ({
          id: t.id, amount: t.amount, date: t.date, type: t.type, category: t.category, subcategory: t.subcategory,
          description: t.description, isBenefit: t.is_benefit, paymentMethod: t.payment_method, cardId: t.card_id
        })) : [],
        fixedExpenses: fixedExp || [],
        debts: debts || []
      }));
    } catch (e) {
      console.error("Erro ao carregar dados:", e);
    } finally {
      setIsLoaded(true);
    }
  };

  useEffect(() => { if (session) fetchSupabaseData(); }, [session]);

  const handleSaveTransaction = async (t: any) => {
    if (isDemoMode) {
      const processed = (Array.isArray(t) ? t : [t]).map(x => ({ ...x, id: crypto.randomUUID() }));
      setData(prev => ({ ...prev, transactions: [...processed, ...prev.transactions] }));
      return;
    }
    const inputs = Array.isArray(t) ? t : [t];
    const dbPayload = inputs.map(x => ({
      user_id: session.user.id, amount: x.amount, date: x.date, type: x.type, category: x.category, subcategory: x.subcategory,
      description: x.description, is_benefit: x.isBenefit, payment_method: x.paymentMethod, card_id: x.cardId
    }));
    await supabase.from('transactions').insert(dbPayload);
    fetchSupabaseData();
  };

  const openModal = (t: 'expense'|'income' = 'expense', c?: CategoryKey, s?: string) => {
      setPrefillType(t);
      setPrefillCategory(c);
      setPrefillSubcategory(s);
      setEditingTransaction(null);
      setIsModalOpen(true);
  };

  const renderContent = () => {
    if (isMobile) return <MobileHome data={data} userName={data.userName} onOpenTransaction={openModal} />;
    
    switch (activeTab) {
      case 'dashboard': return <Dashboard data={data} togglePrivacy={() => setData(p => ({...p, showValues: !p.showValues}))} onNavigate={setActiveTab} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'cards': return <CreditCardView data={data} onOpenSettings={() => {}} onOpenSidebar={() => setIsSidebarOpen(true)} onAddTransaction={handleSaveTransaction} onEditTransaction={(t) => { setEditingTransaction(t); setIsModalOpen(true); }} />;
      case 'calendar': return <CalendarView data={data} onOpenSidebar={() => setIsSidebarOpen(true)} onAddTransaction={(d) => openModal('expense')} />;
      case 'loans': return <LoanView debts={data.debts} onOpenAddLoan={() => {}} onPayInstallment={() => {}} onOpenSidebar={() => setIsSidebarOpen(true)} onEditDebt={() => {}} />;
      case 'investments': return <InvestmentsView data={data} onAddInvestment={() => {}} onOpenSidebar={() => setIsSidebarOpen(true)} />;
      case 'car-details': return <CarView data={data} onBack={() => setActiveTab('dashboard')} onOpenSettings={() => {}} onQuickAdd={(s) => openModal('expense', 'car', s)} onOpenSidebar={() => setIsSidebarOpen(true)} onEditTransaction={(t) => { setEditingTransaction(t); setIsModalOpen(true); }} />;
      case 'house-details': return <HouseView data={data} onBack={() => setActiveTab('dashboard')} onOpenSettings={() => {}} onQuickAdd={(s) => openModal('expense', 'house', s)} onOpenSidebar={() => setIsSidebarOpen(true)} onEditTransaction={(t) => { setEditingTransaction(t); setIsModalOpen(true); }} />;
      case 'partner-details': return <PartnerView data={data} onBack={() => setActiveTab('dashboard')} onOpenSettings={() => {}} onQuickAdd={(s) => openModal('expense', 'partner', s)} onOpenSidebar={() => setIsSidebarOpen(true)} onEditTransaction={(t) => { setEditingTransaction(t); setIsModalOpen(true); }} />;
      default: return <Dashboard data={data} togglePrivacy={() => {}} onNavigate={setActiveTab} onOpenSidebar={() => setIsSidebarOpen(true)} />;
    }
  };

  if (isLoadingSession) return <div className="min-h-screen bg-[#F6E9CA] flex items-center justify-center"><Loader2 className="animate-spin text-[#13312A]" /></div>;
  if (!session) return <LoginView onLoginSuccess={() => { setIsDemoMode(true); setSession({user:{id:'mock'}}); localStorage.setItem('financas_app_demo', 'true'); }} />;

  return (
    <div className={`min-h-screen bg-[#F6E9CA] text-[#13312A] font-sans overflow-x-hidden selection:bg-[#C69A72] flex`}>
      
      {/* Sidebar exclusiva para Desktop (sem barra inferior conflitante) */}
      {!isMobile && (
        <Sidebar 
          isOpen={true} 
          onClose={() => {}} 
          onNavigate={setActiveTab} 
          activeTab={activeTab} 
          userName={data.userName} 
          onLogout={() => { setSession(null); localStorage.removeItem('financas_app_demo'); }} 
          onOpenAdd={() => openModal()} 
        />
      )}

      {/* Sidebar Drawer para Mobile (caso o usuário a chame) */}
      {isMobile && (
        <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          onNavigate={setActiveTab} 
          activeTab={activeTab} 
          userName={data.userName} 
          onLogout={() => { setSession(null); localStorage.removeItem('financas_app_demo'); }} 
          onOpenAdd={() => { setIsSidebarOpen(false); openModal(); }} 
        />
      )}

      <main className={`flex-1 transition-all duration-500 overflow-y-auto ${isMobile ? 'p-6' : 'px-12 py-12'}`}>
        <div className={isMobile ? 'max-w-md mx-auto' : 'max-w-6xl mx-auto'}>
            {renderContent()}
        </div>
      </main>

      <TransactionModal 
        isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveTransaction} 
        creditCards={data.creditCards} initialCategory={prefillCategory} initialSubcategory={prefillSubcategory} 
        initialType={prefillType} initialData={editingTransaction}
      />
    </div>
  );
}
export default App;
