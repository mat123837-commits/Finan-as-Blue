

export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'debit' | 'credit';

// Renamed 'girlfriend' to 'partner'
export type CategoryKey = 'car' | 'house' | 'partner' | 'debt' | 'others';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  category: CategoryKey;
  subcategory?: string;
  description?: string;
  isBenefit?: boolean; // If true, adds to VR/VA balance instead of Wallet
  isSalary?: boolean; // If true, marks as main salary
  paymentMethod?: PaymentMethod; // New field
  cardId?: string; // Links to a specific credit card
  carKm?: number; // Only for Car category
  liters?: number; // Only for Car + Fuel
  installmentCurrent?: number; // 1 of X
  installmentTotal?: number; // X
}

export interface Debt {
  id: string;
  name: string;
  totalValue: number; // Original Total Debt Value (Principal + Interest if user wants, or just Principal)
  installmentsTotal: number; // Total number of installments
  installmentsPaid: number; // Number of installments already paid
  dueDate: number; // Day of month
  installmentValue?: number; // Explicit monthly value (fixes interest calc issues)
  category?: 'personal' | 'vehicle' | 'house' | 'card';
  color?: string; 
}

export interface FixedExpense {
  id: string;
  title: string;
  amount: number;
  day: number; // Day of month
  category: CategoryKey;
}

// FixedIncome interface added to resolve import error in App.tsx
export interface FixedIncome {
  id: string;
  title: string;
  amount: number;
  day: number; // Day of month
  category: CategoryKey;
}

export interface Investment {
  id: string;
  name: string;
  type: 'reserve' | 'fixed' | 'variable' | 'goal';
  amount: number;
  targetAmount?: number; // For goals
  color?: string;
  icon?: string;
}

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'elo' | 'hipercard' | 'other';

export interface CreditCard {
  id: string;
  name: string; // e.g. "Nubank Ultravioleta"
  brand: CardBrand;
  last4Digits?: string;
  limit: number;
  closingDay: number; // day of month
  dueDay: number; // day of month
  color: string; // hex code for card background
}

export interface CarConfig {
  modelName: string;
  plateLastDigit?: string;
  ipvaTotal: number;
  insuranceTotal: number;
  licensingTotal: number;
}

export interface HouseConfig {
  rentAmount: number; // Valor fixo do aluguel/condomínio
  internetAmount: number; // Valor fixo internet/tv
  electricityBudget: number; // Meta de gasto luz
  marketBudget: number; // Meta de mercado/limpeza
}

export interface PartnerConfig {
  partnerName: string;
  dateBudget: number; // Meta mensal para saídas/jantar
  anniversaryDate?: string; // YYYY-MM-DD
}

export interface AppData {
  transactions: Transaction[];
  debts: Debt[];
  investments: Investment[]; 
  fixedExpenses: FixedExpense[]; // New field
  fixedIncomes: FixedIncome[]; // Added fixedIncomes to AppData interface to match INITIAL_DATA usage in App.tsx
  userName: string;
  showValues: boolean;
  initialBalance?: number; 
  initialBenefitBalance?: number;
  creditCards: CreditCard[]; // Changed from single config to array
  car: CarConfig; 
  house: HouseConfig;
  partner: PartnerConfig; 
}

export const CATEGORIES: { key: CategoryKey; label: string; icon: string; subcategories: string[] }[] = [
  { 
    key: 'car', 
    label: 'Carro', 
    icon: 'Car', 
    subcategories: [
      'Combustível', 'Manutenção', 'Pedágio', 'Estacionamento', 
      'IPVA', 'Seguro', 'Licenciamento', 'Lavagem', 'Multa', 'Acessórios', 'Uber/Taxi'
    ] 
  },
  { 
    key: 'house', 
    label: 'Casa', 
    icon: 'Home', 
    subcategories: [
      'Mercado', 'Limpeza', 'Aluguel', 'Condomínio', 'Internet', 'Luz', 
      'Água', 'Gás', 'Manutenção', 'Decoração', 'Móveis', 'Jardinagem', 'Diarista'
    ] 
  },
  { 
    key: 'partner', 
    label: 'Relacionamento', 
    icon: 'Heart', 
    subcategories: [
      'Restaurante', 'Lazer & Eventos', 'Viagem', 'Presente', 'Mercado', 
      'Cinema', 'Bar/Drinks', 'Hotel', 'Transporte a Dois', 'Outros'
    ] 
  },
  { 
    key: 'debt', 
    label: 'Dívidas', 
    icon: 'CreditCard', 
    subcategories: [
      'Cartão de Crédito', 'Empréstimo Pessoal', 'Financiamento Imóvel', 
      'Financiamento Veículo', 'Empréstimo Familiar', 'Cheque Especial', 'Negociação', 'Ajuste Fatura'
    ] 
  },
  { 
    key: 'others', 
    label: 'Outros', 
    icon: 'ShoppingBag', 
    subcategories: [
      'Lazer', 'Saúde', 'Educação', 'Farmácia', 'Academia', 
      'Roupas', 'Eletrônicos', 'Assinaturas', 'Beleza/Barbeiro', 'Pet', 'Doação', 'Jogos'
    ] 
  }
];
