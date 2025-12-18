
import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, ArrowRight, Mail, Lock, AlertCircle, Eye, EyeOff, 
  CheckCircle2, TrendingUp, User, X, Activity, CreditCard, 
  ShieldCheck, Heart, Car, Home, Zap, ChevronDown, Sparkles, Layers, ArrowLeft
} from 'lucide-react';
import { supabase } from '../supabaseClient';

interface LoginViewProps {
  onLoginSuccess?: () => void;
}

const SAVED_EMAILS_KEY = 'fingreen_recent_accounts';

// Componente para criar as curvas fluidas e profundas
const CurvedDivider = ({ from, to, inverted = false }: { from: string, to: string, inverted?: boolean }) => (
  <div className="relative w-full h-40 md:h-64 overflow-hidden" style={{ backgroundColor: from, marginBottom: '-2px' }}>
    <svg 
      viewBox="0 0 1440 320" 
      className={`absolute left-0 w-full h-full ${inverted ? 'bottom-0' : 'top-0'}`}
      preserveAspectRatio="none"
    >
      <path 
        fill={to} 
        fillOpacity="1" 
        d={inverted 
          ? "M0,160 C320,300 420,10 720,160 C1020,310 1120,20 1440,160 L1440,320 L0,320 Z"
          : "M0,160 C320,20 420,300 720,160 C1020,20 1120,310 1440,160 L1440,320 L0,320 Z"
        }
      ></path>
    </svg>
  </div>
);

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [savedEmails, setSavedEmails] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const loginSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(SAVED_EMAILS_KEY);
    if (stored) {
      try {
        setSavedEmails(JSON.parse(stored));
      } catch (e) {
        setSavedEmails([]);
      }
    }
  }, []);

  const saveEmailToRecent = (newEmail: string) => {
    if (!newEmail || !newEmail.includes('@') || newEmail.length < 5) return;
    setSavedEmails(prev => {
      const updated = [newEmail, ...prev.filter(e => e !== newEmail)].slice(0, 5);
      localStorage.setItem(SAVED_EMAILS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeSavedEmail = (e: React.MouseEvent, emailToRemove: string) => {
    e.stopPropagation();
    setSavedEmails(prev => {
      const updated = prev.filter(e => e !== emailToRemove);
      localStorage.setItem(SAVED_EMAILS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleBlur = () => {
    if (email.includes('@')) saveEmailToRecent(email);
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Por favor, informe seu e-mail.');
      return;
    }
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setSuccessMsg('Link de recuperação enviado para seu e-mail!');
    } catch (error: any) {
      setErrorMsg(translateError(error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isForgotPassword) {
      handleResetPassword(e);
      return;
    }
    if (!email || !password) {
        setErrorMsg('Por favor, preencha todos os campos.');
        return;
    }
    saveEmailToRecent(email);
    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccessMsg('Cadastro realizado! Verifique seu e-mail para confirmar a conta.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (error: any) {
      if (error.message === 'Failed to fetch' || error.message.includes('NetworkError') || error.status === 0) {
        if (onLoginSuccess) {
            setSuccessMsg('Sem conexão. Entrando em Modo Demo...');
            setTimeout(() => onLoginSuccess(), 1000);
            return;
        }
      }
      setErrorMsg(translateError(error.message));
    } finally {
      setIsLoading(false);
    }
  };

  const translateError = (msg: string) => {
      if (msg.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
      if (msg.includes('User already registered')) return 'Este e-mail já está cadastrado.';
      if (msg.includes('Password should be at least')) return 'A senha deve ter no mínimo 6 caracteres.';
      if (msg.includes('User not found')) return 'Usuário não encontrado.';
      return msg;
  };

  const scrollToLogin = () => {
    loginSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#F6E9CA] h-screen overflow-y-auto no-scrollbar scroll-smooth">
      
      {/* --- SECTION 1: HERO & LOGIN --- */}
      <section ref={loginSectionRef} className="min-h-screen flex flex-col lg:flex-row overflow-hidden relative bg-[#F6E9CA]">
        {/* Left Side: Visual Showcase */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#13312A] relative flex-col justify-between p-16 text-[#F6E9CA] overflow-hidden">
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#C69A72]/10 rounded-full blur-[120px] -mr-32 -mt-32 animate-pulse duration-[10s]"></div>
           <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#155446] rounded-full blur-[100px] -ml-20 -mb-20 opacity-40"></div>
           <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(#C69A72 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }}></div>

           <div className="relative z-20">
              <div className="flex items-center gap-3 mb-16 animate-in slide-in-from-left duration-700">
                 <div className="w-12 h-12 bg-[#C69A72] rounded-2xl flex items-center justify-center text-[#13312A] shadow-xl shadow-black/20 rotate-3">
                    <Wallet size={24} strokeWidth={2.5} />
                 </div>
                 <span className="text-2xl font-bold font-serif tracking-tight">Fingreen</span>
              </div>

              <div className="max-w-xl animate-in fade-in slide-in-from-bottom duration-1000">
                 <h2 className="text-7xl font-serif font-bold leading-[1.05] mb-8">
                    A clareza que seu <br/>
                    <span className="text-[#C69A72] italic">patrimônio</span> merece.
                 </h2>
                 <p className="text-xl text-[#F6E9CA]/60 leading-relaxed font-medium">
                    Organize sua vida financeira com uma interface desenhada para ser rápida, visual e absolutamente elegante.
                 </p>
              </div>
           </div>

           <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full h-[600px] pointer-events-none flex items-center justify-end pr-8">
               <div className="absolute top-[15%] right-[10%] bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] shadow-2xl w-64" style={{ animation: 'float 6s ease-in-out infinite' }}>
                  <div className="flex justify-between items-center mb-4">
                      <div className="p-2 bg-[#C69A72] rounded-lg text-[#13312A]"><TrendingUp size={16} /></div>
                      <div className="w-10 h-1.5 bg-white/10 rounded-full"></div>
                  </div>
                  <p className="text-[10px] uppercase font-bold text-[#C69A72] tracking-widest mb-1">Liquidez Livre</p>
                  <p className="text-2xl font-bold font-serif">R$ 14.502,30</p>
               </div>
               <div className="absolute bottom-[20%] right-[18%] bg-gradient-to-br from-[#C69A72] to-[#b58b66] p-6 rounded-[2.2rem] shadow-2xl w-72 h-44 flex flex-col justify-between rotate-[-6deg]" style={{ animation: 'float 8s ease-in-out infinite 1s' }}>
                  <div className="flex justify-between items-start"><p className="font-bold text-white tracking-wide">Premium Card</p><CreditCard size={24} className="text-white/40" /></div>
                  <div><p className="text-[10px] text-white/60 uppercase font-bold mb-1">Fatura Atual</p><p className="text-2xl font-bold text-white font-serif">R$ 2.840,00</p></div>
               </div>
           </div>

           <div className="relative z-10 flex flex-col gap-8">
              <div className="flex gap-12 items-center opacity-40">
                 <div className="flex -space-x-3">
                    {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-2 border-[#13312A] bg-white/10 backdrop-blur-md"></div>)}
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#C69A72]">Private Access</span>
                    <span className="text-[10px] font-medium">Segurança Bancária Certificada</span>
                 </div>
              </div>
              <div className="animate-bounce flex items-center gap-2 text-xs font-bold text-[#C69A72]/60 uppercase tracking-widest">
                 <ChevronDown size={14} /> Saiba mais sobre o Fingreen
              </div>
           </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-24 relative z-50">
          <div className="w-full max-w-sm">
              <div className="lg:hidden flex justify-center mb-8">
                 <div className="w-20 h-20 bg-[#13312A] rounded-[2rem] flex items-center justify-center shadow-2xl shadow-[#13312A]/30">
                    <Wallet size={36} className="text-[#C69A72]" strokeWidth={2} />
                 </div>
              </div>
              <div className="text-center lg:text-left mb-10">
                 {isForgotPassword ? (
                   <>
                    <button onClick={() => setIsForgotPassword(false)} className="flex items-center gap-2 text-[#13312A] font-bold text-sm mb-4 hover:text-[#C69A72] transition-colors"><ArrowLeft size={16} /> Voltar ao Login</button>
                    <h1 className="text-4xl lg:text-5xl font-bold text-[#13312A] mb-4 font-serif leading-tight">Redefinir Senha.</h1>
                    <p className="text-[#155446] text-base leading-relaxed font-medium opacity-60">Enviaremos um link de recuperação para seu e-mail.</p>
                   </>
                 ) : (
                   <>
                    <h1 className="text-4xl lg:text-5xl font-bold text-[#13312A] mb-4 font-serif leading-tight">Acesse sua conta.</h1>
                    <p className="text-[#155446] text-base leading-relaxed font-medium opacity-60">Sua jornada para o domínio financeiro começa aqui.</p>
                   </>
                 )}
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                 {errorMsg && <div className="bg-[#9F3E34]/10 p-4 rounded-2xl flex items-center gap-3 text-[#9F3E34] text-sm border border-[#9F3E34]/20 animate-in slide-in-from-top-2"><AlertCircle size={20} className="shrink-0" /><span>{errorMsg}</span></div>}
                 {successMsg && <div className="bg-[#155446]/10 p-4 rounded-2xl flex items-center gap-3 text-[#155446] text-sm border border-[#155446]/20 animate-in slide-in-from-top-2"><CheckCircle2 size={20} className="shrink-0" /><span className="font-medium">{successMsg}</span></div>}
                 <div className="space-y-2 relative">
                    <label className="text-xs font-bold text-[#13312A] uppercase tracking-widest ml-1">E-mail</label>
                    <div className="relative group">
                       <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#155446]/30 group-focus-within:text-[#13312A] transition-colors z-10"><Mail size={20} /></div>
                       <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setShowSuggestions(true)} onBlur={handleBlur} placeholder="seu@email.com" className="w-full bg-white border-2 border-transparent focus:border-[#C69A72] hover:bg-white/80 rounded-[1.5rem] py-5 pl-14 pr-6 text-[#13312A] font-bold shadow-sm outline-none transition-all placeholder:text-[#155446]/20 relative z-0" required />
                       {showSuggestions && savedEmails.length > 0 && !isForgotPassword && (
                          <div className="absolute top-full left-0 right-0 mt-3 bg-white rounded-3xl shadow-2xl border border-[#13312A]/10 z-50 overflow-hidden">
                             {savedEmails.map((saved) => (
                                <div key={saved} onMouseDown={(e) => { e.preventDefault(); setEmail(saved); setShowSuggestions(false); }} className="flex items-center justify-between px-5 py-4 hover:bg-[#F6E9CA]/30 cursor-pointer border-b border-gray-50 last:border-0"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-[#13312A]/5 text-[#13312A] rounded-full flex items-center justify-center"><User size={14} /></div><span className="text-sm font-bold text-[#155446]">{saved}</span></div><button onMouseDown={(e) => { e.stopPropagation(); removeSavedEmail(e as any, saved); }} className="p-1.5 hover:bg-red-50 text-gray-200 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100"><X size={14} /></button></div>
                             ))}
                          </div>
                       )}
                    </div>
                 </div>
                 {!isForgotPassword && (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-xs font-bold text-[#13312A] uppercase tracking-widest">Senha</label>
                        {!isSignUp && <button type="button" onClick={() => { setIsForgotPassword(true); setErrorMsg(''); setSuccessMsg(''); }} className="text-[10px] font-bold text-[#C69A72] uppercase tracking-wider hover:underline">Esqueci minha senha</button>}
                      </div>
                      <div className="relative group">
                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#155446]/30 group-focus-within:text-[#13312A] transition-colors"><Lock size={20} /></div>
                        <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-white border-2 border-transparent focus:border-[#C69A72] hover:bg-white/80 rounded-[1.5rem] py-5 pl-14 pr-14 text-[#13312A] font-bold shadow-sm outline-none transition-all placeholder:text-[#155446]/20" required={!isForgotPassword} minLength={6} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#155446]/40 hover:text-[#13312A] transition-colors">{showPassword ? <EyeOff size={22} /> : <Eye size={22} />}</button>
                      </div>
                    </div>
                 )}
                 <button type="submit" disabled={isLoading} className={`w-full py-5 rounded-[1.5rem] font-bold text-xl shadow-2xl flex items-center justify-center gap-4 transition-all duration-300 transform active:scale-[0.98] mt-4 font-serif ${isLoading ? 'bg-[#155446]/50 text-white/50 cursor-not-allowed' : 'bg-[#13312A] text-[#C69A72] shadow-[#13312A]/40 hover:bg-black hover:-translate-y-1'}`}>
                    {isLoading ? <div className="w-7 h-7 border-3 border-[#C69A72] border-t-transparent rounded-full animate-spin" /> : <>{isForgotPassword ? 'Enviar Link de Recuperação' : isSignUp ? 'Criar Minha Conta' : 'Acessar Meu Dashboard'} <ArrowRight size={22} /></>}
                 </button>
              </form>
          </div>
        </div>
      </section>

      {/* --- CURVED TRANSITION 1: CREAM -> WHITE --- */}
      <CurvedDivider from="#F6E9CA" to="#ffffff" />

      {/* --- SECTION 2: THE PHILOSOPHY --- */}
      <section className="py-24 lg:py-40 px-6 lg:px-24 bg-white text-[#13312A] relative">
         <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-32">
            <div className="lg:w-1/2">
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#F6E9CA] rounded-full text-[#13312A] text-xs font-bold uppercase tracking-widest mb-8"><Sparkles size={14} /> Previsibilidade Total</div>
               <h3 className="text-5xl lg:text-7xl font-serif font-bold leading-tight mb-8">Chega de <br/><span className="text-[#C69A72]">contas de cabeça.</span></h3>
               <p className="text-xl text-[#155446]/70 leading-relaxed font-medium mb-12">Planilhas tradicionais focam no que você gastou. <br/>O <strong>Fingreen</strong> foca no que você pode gastar amanhã. <br/>Nosso indicador de <strong>Liquidez Livre</strong> subtrai automaticamente suas faturas e gastos fixos do seu saldo real, entregando clareza mental instantânea.</p>
               <button onClick={scrollToLogin} className="px-8 py-4 bg-[#13312A] text-[#C69A72] rounded-2xl font-bold font-serif hover:shadow-xl transition-all active:scale-95">Experimentar agora</button>
            </div>
            <div className="lg:w-1/2 grid grid-cols-2 gap-6 relative">
               <div className="absolute -inset-10 bg-[#C69A72]/5 rounded-full blur-3xl"></div>
               <div className="bg-[#F6E9CA] p-8 rounded-[3rem] shadow-sm flex flex-col items-center justify-center text-center transform translate-y-12">
                  <div className="w-16 h-16 bg-[#13312A] rounded-2xl flex items-center justify-center text-[#C69A72] mb-4"><Zap size={32} /></div>
                  <h4 className="font-bold font-serif">Ação Rápida</h4>
                  <p className="text-xs text-[#155446]/60 mt-2">Lançamentos em 2 segundos</p>
               </div>
               <div className="bg-[#13312A] p-8 rounded-[3rem] shadow-xl flex flex-col items-center justify-center text-center text-[#F6E9CA]">
                  <div className="w-16 h-16 bg-[#C69A72] rounded-2xl flex items-center justify-center text-[#13312A] mb-4"><Activity size={32} /></div>
                  <h4 className="font-bold font-serif">Visão Ativa</h4>
                  <p className="text-xs text-[#F6E9CA]/40 mt-2">Dados em tempo real</p>
               </div>
            </div>
         </div>
      </section>

      {/* --- CURVED TRANSITION 2: WHITE -> GREEN --- */}
      <CurvedDivider from="#ffffff" to="#13312A" />

      {/* --- SECTION 3: ECOSYSTEM SHOWCASE --- */}
      <section className="py-24 lg:py-40 px-6 lg:px-24 bg-[#13312A] text-[#F6E9CA] relative">
         <div className="max-w-6xl mx-auto">
            <div className="text-center mb-24">
               <h3 className="text-4xl lg:text-6xl font-serif font-bold mb-6">Controle seu estilo de vida.</h3>
               <p className="text-lg text-[#F6E9CA]/60 max-w-2xl mx-auto">Muito mais que uma carteira. Um ecossistema completo para gerenciar os pilares que realmente importam no seu dia a dia.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] hover:bg-white/10 transition-all group">
                  <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform"><Car size={32} /></div>
                  <h4 className="text-2xl font-bold font-serif mb-4">Meu Veículo</h4>
                  <p className="text-[#F6E9CA]/50 leading-relaxed mb-6 text-sm">Controle de IPVA, Seguros e Manutenções. Saiba exatamente quanto seu carro custa por mês sem surpresas.</p>
                  <div className="h-1 w-20 bg-blue-500 rounded-full"></div>
               </div>
               <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] hover:bg-white/10 transition-all group">
                  <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform"><Home size={32} /></div>
                  <h4 className="text-2xl font-bold font-serif mb-4">Minha Casa</h4>
                  <p className="text-[#F6E9CA]/50 leading-relaxed mb-6 text-sm">Gerencie o aluguel, mercado e contas de consumo. Mantenha o lar em ordem com orçamentos inteligentes.</p>
                  <div className="h-1 w-20 bg-emerald-500 rounded-full"></div>
               </div>
               <div className="bg-white/5 border border-white/10 p-10 rounded-[3rem] hover:bg-white/10 transition-all group">
                  <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform"><Heart size={32} /></div>
                  <h4 className="text-2xl font-bold font-serif mb-4">Relacionamento</h4>
                  <p className="text-[#F6E9CA]/50 leading-relaxed mb-6 text-sm">Separe um orçamento para jantares, dates e viagens a dois. Celebre momentos sem estourar o banco.</p>
                  <div className="h-1 w-20 bg-rose-500 rounded-full"></div>
               </div>
            </div>
         </div>
      </section>

      {/* --- CURVED TRANSITION 3: GREEN -> OFFWHITE --- */}
      <CurvedDivider from="#13312A" to="#FFFDF5" inverted={true} />

      {/* --- SECTION 4: SECURITY & DESIGN --- */}
      <section className="py-24 lg:py-40 px-6 lg:px-24 bg-[#FFFDF5] text-[#13312A] relative">
         <div className="max-w-6xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-16 lg:gap-32">
            <div className="lg:w-1/2">
               <h3 className="text-5xl lg:text-7xl font-serif font-bold leading-tight mb-8">Privacidade <br/><span className="text-[#C69A72]">por design.</span></h3>
               <div className="space-y-8">
                  <div className="flex gap-6">
                     <div className="shrink-0 w-12 h-12 bg-[#13312A]/5 rounded-xl flex items-center justify-center"><ShieldCheck size={24} /></div>
                     <div>
                        <h5 className="font-bold mb-1">Criptografia Ponta a Ponta</h5>
                        <p className="text-sm text-[#155446]/60">Seus dados financeiros são sensíveis. Por isso, usamos protocolos de segurança de nível bancário.</p>
                     </div>
                  </div>
                  <div className="flex gap-6">
                     <div className="shrink-0 w-12 h-12 bg-[#13312A]/5 rounded-xl flex items-center justify-center"><Layers size={24} /></div>
                     <div>
                        <h5 className="font-bold mb-1">Modo Privacidade</h5>
                        <p className="text-sm text-[#155446]/60">Esconda seus saldos com um clique para usar o app em locais públicos com total discrição.</p>
                     </div>
                  </div>
               </div>
            </div>
            <div className="lg:w-1/2">
               <div className="relative group">
                  <div className="absolute -inset-4 bg-[#C69A72]/20 rounded-[3rem] blur-2xl group-hover:bg-[#C69A72]/30 transition-all"></div>
                  <div className="relative bg-white border border-[#13312A]/5 rounded-[3rem] p-4 shadow-2xl overflow-hidden">
                     <div className="bg-[#13312A] h-8 w-full rounded-t-2xl flex items-center px-4 gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-400"></div>
                        <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                        <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                     </div>
                     <div className="p-8"><div className="flex justify-between items-center mb-12"><div><div className="h-3 w-24 bg-gray-100 rounded-full mb-3"></div><div className="h-8 w-48 bg-[#13312A] rounded-xl"></div></div><div className="w-12 h-12 rounded-full bg-[#C69A72]"></div></div><div className="grid grid-cols-2 gap-4"><div className="h-32 bg-gray-50 rounded-3xl"></div><div className="h-32 bg-gray-50 rounded-3xl"></div></div></div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* --- CURVED TRANSITION 4: OFFWHITE -> GREEN --- */}
      <CurvedDivider from="#FFFDF5" to="#13312A" />

      {/* --- SECTION 5: FINAL CTA & FOOTER --- */}
      <footer className="py-24 lg:py-40 px-6 lg:px-24 bg-[#13312A] text-[#F6E9CA] relative overflow-hidden">
         <div className="max-w-4xl mx-auto text-center relative z-10">
            <h3 className="text-4xl lg:text-7xl font-serif font-bold mb-8">Elegância é a <br/> forma suprema de <br/> <span className="text-[#C69A72]">controle.</span></h3>
            <p className="text-xl text-[#F6E9CA]/60 mb-12 max-w-xl mx-auto font-medium">Junte-se a centenas de pessoas que redescobriram o prazer de gerenciar seu dinheiro.</p>
            <button onClick={scrollToLogin} className="group px-12 py-6 bg-[#C69A72] text-[#13312A] rounded-[2rem] font-bold text-xl shadow-2xl shadow-black/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 mx-auto font-serif">Começar agora <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" /></button>
            <div className="mt-40 pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
               <div className="flex items-center gap-3"><Wallet size={20} /><span className="font-bold font-serif">Fingreen Private</span></div>
               <p className="text-xs">© 2025 Fingreen. Todos os direitos reservados.</p>
               <div className="flex gap-6 text-xs font-bold uppercase tracking-widest"><a href="#" className="hover:text-[#C69A72]">Termos</a><a href="#" className="hover:text-[#C69A72]">Privacidade</a></div>
            </div>
         </div>
      </footer>
      <style>{`
        @keyframes float { 0% { transform: translateY(0px) rotate(var(--tw-rotate, 0deg)); } 50% { transform: translateY(-20px) rotate(var(--tw-rotate, 0deg)); } 100% { transform: translateY(0px) rotate(var(--tw-rotate, 0deg)); } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
};
