import { createTheme } from '@mui/material/styles';

// --- Design Tokens ---
export const tokens = {
  indigo: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    500: '#6366f1',
    600: '#4f46e5',
    700: '#4338ca',
    900: '#1e1b4b',
  },
  violet: {
    400: '#a78bfa',
    500: '#8b5cf6',
    600: '#7c3aed',
  },
  slate: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  emerald: { 500: '#10b981', 100: '#d1fae5' },
  amber: { 500: '#f59e0b', 100: '#fef3c7' },
  rose: { 500: '#f43f5e', 100: '#ffe4e6' },
  sky: { 500: '#0ea5e9', 100: '#e0f2fe' },
};

const createAppTheme = (mode = 'light') => createTheme({
  palette: {
    mode,
    primary: {
      main: tokens.indigo[600],
      light: tokens.indigo[500],
      dark: tokens.indigo[700],
      contrastText: '#ffffff',
    },
    secondary: {
      main: tokens.violet[600],
      light: tokens.violet[500],
      dark: tokens.violet[600],
      contrastText: '#ffffff',
    },
    background: {
      default: mode === 'light' ? tokens.slate[50] : tokens.slate[900],
      paper: mode === 'light' ? '#ffffff' : tokens.slate[800],
    },
    text: {
      primary: mode === 'light' ? tokens.slate[900] : tokens.slate[50],
      secondary: mode === 'light' ? tokens.slate[500] : tokens.slate[400],
    },
    divider: mode === 'light' ? tokens.slate[200] : tokens.slate[700],
    success: { main: tokens.emerald[500], light: tokens.emerald[100] },
    warning: { main: tokens.amber[500], light: tokens.amber[100] },
    error: { main: tokens.rose[500], light: tokens.rose[100] },
    info: { main: tokens.sky[500], light: tokens.sky[100] },
  },
  typography: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
    h1: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 800 },
    h2: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 },
    h3: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 },
    h4: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 700 },
    h5: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: { borderRadius: 12 },
  shadows: [
    'none',
    '0 1px 2px rgba(15,23,42,0.05)',
    '0 1px 4px rgba(15,23,42,0.07)',
    '0 2px 8px rgba(15,23,42,0.08)',
    '0 4px 16px rgba(15,23,42,0.08)',
    '0 8px 24px rgba(15,23,42,0.10)',
    '0 12px 32px rgba(15,23,42,0.12)',
    '0 16px 40px rgba(15,23,42,0.14)',
    '0 20px 48px rgba(15,23,42,0.16)',
    ...Array(16).fill('0 24px 56px rgba(15,23,42,0.18)'),
  ],
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          padding: '8px 20px',
          fontSize: '0.875rem',
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${tokens.indigo[600]} 0%, ${tokens.violet[600]} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${tokens.indigo[700]} 0%, ${tokens.violet[600]} 100%)`,
          },
        },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 16,
        }),
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': { borderRadius: 8 },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 6, fontWeight: 500 },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          fontWeight: 600,
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: theme.palette.text.secondary,
          backgroundColor: mode === 'light' ? tokens.slate[50] : tokens.slate[800],
        }),
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 4, height: 6 },
        bar: { borderRadius: 4 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 500, fontSize: '0.875rem' },
      },
    },
  },
});

export default createAppTheme;
