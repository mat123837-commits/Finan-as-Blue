import React, { useState } from 'react';
import { Wallet, ArrowRight, Mail, Lock, AlertCircle, Eye, EyeOff, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { COLORS } from '../constants';

interface LoginViewProps {
  onLoginSuccess?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
        setErrorMsg('Por favor, preencha todos os campos.');
        return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg('Cadastro realizado! Verifique seu e-mail para confirmar a conta antes de entrar.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (error: any) {
      console.error('Erro de autenticação:', error);
      
      if (error.message === 'Failed to fetch' || error.message.includes('NetworkError') || error.status === 0) {
        if (onLoginSuccess) {
            setSuccessMsg('Sem conexão com servidor. Entrando em Modo Demo...');
            setTimeout(() => {
                onLoginSuccess();
            }, 1000);
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
      if (msg.includes('Email not confirmed')) return 'E-mail não confirmado. Verifique sua caixa de entrada.';
      if (msg.includes('Failed to fetch')) return 'Erro de conexão com o servidor.';
      return msg;
  };

  return (
    <div className="min-h-screen bg-[#EEE9DF] flex flex-col items-center justify-center p-6 animate-in fade-in duration-500">
      
      <div className="w-full max-w-sm">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 bg-[#1B2632] rounded-[2rem] flex items-center justify-center shadow-2xl shadow-[#1B2632]/20 mb-6 rotate-3">
            <Wallet size={48} className="text-[#FFB162]" />
          </div>
          <h1 className="text-3xl font-bold text-[#1B2632] mb-2 tracking-tight">Finanças Blue</h1>
          <p className="text-[#2C3B4D] text-center text-sm leading-relaxed max-w-[200px]">
            Elegância e controle para sua vida financeira.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="space-y-4">
            
            {errorMsg && (
              <div className="bg-[#A35139]/10 p-4 rounded-2xl flex items-center gap-3 text-[#A35139] text-sm mb-2 animate-in slide-in-from-top-2 border border-[#A35139]/20">
                <AlertCircle size={20} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="bg-[#10B981]/10 p-4 rounded-2xl flex items-center gap-3 text-[#10B981] text-sm mb-2 animate-in slide-in-from-top-2 border border-[#10B981]/20">
                <CheckCircle2 size={20} className="shrink-0" />
                <span className="font-medium">{successMsg}</span>
              </div>
            )}

            {/* Email Input */}
            <div className="space-y-1.5">
               <label className="text-xs font-bold text-[#1B2632] uppercase ml-2">E-mail</label>
               <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9C1B1] group-focus-within:text-[#1B2632] transition-colors">
                    <Mail size={20} />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full bg-white border-2 border-transparent focus:border-[#FFB162] rounded-[1.5rem] py-4 pl-12 pr-4 text-[#1B2632] font-medium shadow-sm outline-none transition-all placeholder:text-[#C9C1B1]"
                    required
                  />
               </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
               <label className="text-xs font-bold text-[#1B2632] uppercase ml-2">Senha</label>
               <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#C9C1B1] group-focus-within:text-[#1B2632] transition-colors">
                    <Lock size={20} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha secreta"
                    className="w-full bg-white border-2 border-transparent focus:border-[#FFB162] rounded-[1.5rem] py-4 pl-12 pr-12 text-[#1B2632] font-medium shadow-sm outline-none transition-all placeholder:text-[#C9C1B1]"
                    required
                    minLength={6}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C9C1B1] hover:text-[#1B2632] transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
               </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className={`w-full py-4 rounded-[1.5rem] font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all duration-300 transform active:scale-[0.98] mt-6 ${
                isLoading
                  ? 'bg-[#C9C1B1] text-white cursor-not-allowed' 
                  : 'bg-[#FFB162] text-[#1B2632] shadow-[#FFB162]/20 hover:bg-[#FFB162]/90'
              }`}
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-[#1B2632] border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Criar Conta' : 'Entrar'}</span>
                  <ArrowRight size={20} />
                </>
              )}
            </button>
        </form>

        {/* Toggle Sign Up / Login */}
        <div className="mt-8 text-center">
           <p className="text-sm text-[#C9C1B1]">
             {isSignUp ? 'Já tem uma conta?' : 'Ainda não tem conta?'}
           </p>
           <button 
             onClick={() => {
                 setIsSignUp(!isSignUp);
                 setErrorMsg('');
                 setSuccessMsg('');
             }}
             className="text-[#1B2632] font-bold text-sm hover:underline mt-1 transition-all"
           >
             {isSignUp ? 'Fazer Login' : 'Criar nova conta'}
           </button>
        </div>

        {/* Footer Dots */}
        <div className="mt-12 flex justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9C1B1]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C9C1B1]"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#1B2632]"></span>
        </div>

      </div>
    </div>
  );
};