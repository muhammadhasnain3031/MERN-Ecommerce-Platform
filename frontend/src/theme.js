// Central design system — har component yahan se colors/tokens leta hai
export const theme = {
  // Brand colors
  primary: '#6366f1',
  primaryDark: '#4f46e5',
  primaryGrad: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  accent: '#fbbf24',
  accentGrad: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
  dark: '#0f172a',
  darkGrad: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 50%, #6d28d9 100%)',

  // Status
  success: '#10b981', successGrad: 'linear-gradient(135deg, #10b981, #059669)',
  danger: '#ef4444', dangerGrad: 'linear-gradient(135deg, #ef4444, #dc2626)',
  warning: '#f59e0b',
  pink: '#ec4899', pinkGrad: 'linear-gradient(135deg, #ec4899, #db2777)',

  // Neutrals
  bg: 'linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)',
  card: '#ffffff',
  border: '#f1f5f9',
  borderMid: '#e2e8f0',
  text: '#0f172a',
  textMid: '#475569',
  textLight: '#64748b',
  textFaint: '#94a3b8',

  // Effects
  shadow: '0 2px 12px rgba(0,0,0,0.05)',
  shadowHover: '0 24px 48px rgba(99,102,241,0.18)',
  shadowCard: '0 4px 20px rgba(0,0,0,0.06)',
  radius: 16,
  radiusLg: 20,
};

export const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Toys', 'General'];

export const fmtPrice = (n) => 'PKR ' + (Number(n) || 0).toLocaleString();
