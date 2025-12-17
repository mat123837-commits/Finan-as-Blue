
export const COLORS = {
  primary: '#13312A', // 01 Deep Forest Green (Main Text, Active UI)
  secondary: '#155446', // 04 Medium Green (Cards, Secondary Text)
  tertiary: '#C69A72', // 02 Earthy Brown (Borders, Accents)
  accent: '#C69A72', // 02 Earthy Brown (Highlights, CTAs)
  bg: '#F6E9CA', // 03 Cream (App Background)
  surface: '#FFFDF5', // Slightly lighter cream/white for cards
  danger: '#9F3E34', // Custom elegant red (muted)
  white: '#FFFFFF',
  success: '#155446', // Using the medium green for success indicators
};

export const CARD_GRADIENTS: Record<string, string> = {
    black: 'linear-gradient(135deg, #1a1a1a 0%, #333333 100%)',
    gold: 'linear-gradient(135deg, #C69A72 0%, #E6C8A8 100%)',
    platinum: 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)',
    blue: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    purple: 'linear-gradient(135deg, #581c87 0%, #8b5cf6 100%)', // Nubank style
    green: 'linear-gradient(135deg, #13312A 0%, #155446 100%)', // Fingreen style
    red: 'linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%)',
};

// Formatting helpers
export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  // Adjust for timezone offset to prevent one-day-off errors in simple strings
  const userTimezoneOffset = date.getTimezoneOffset() * 60000;
  const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
  
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  }).format(adjustedDate);
};
