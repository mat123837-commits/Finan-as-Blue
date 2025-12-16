
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