// Theme Color Palettes for Light and Dark Modes

export const lightTheme = {
  // Primary Colors - UNSRI Navy Blue (Refined)
  primary: '#0F3C59',
  primaryDark: '#072436',
  primaryLight: '#E6F0F9',
  primaryMedium: '#228BE6',
  
  // Secondary Colors - UNSRI Gold/Yellow
  secondary: '#FFC107',
  secondaryDark: '#B28704',
  secondaryLight: '#FFF8E1',

  // Tertiary Colors - MI Red
  tertiary: '#B91C1C',
  tertiaryDark: '#7F1D1D',
  tertiaryLight: '#FEF2F2',
  
  // Status Colors
  success: '#059669',
  error: '#DC2626',
  danger: '#DC2626',
  warning: '#D97706',
  info: '#0284C7',
  
  // Text Colors
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textDisabled: '#94A3B8',
  
  // Background Colors
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceLight: '#F1F5F9',
  
  // Border Colors
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  
  // Card Colors
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  
  // Glassmorphism effect simulations
  glass: 'rgba(255, 255, 255, 0.7)',
  glassDark: 'rgba(15, 60, 89, 0.8)',
  
  // Shadows (Premium)
  shadowSoft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 2,
  },
  shadowMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
  },
  shadowLarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 10,
  },
  
  // Evaluation Card Colors
  evaluasiDosen: '#0F3C59',
  evaluasiFasilitas: '#B91C1C',
  
  // Likert Scale Colors - Refined
  likert1: '#FEE2E2',   // Red tint
  likert2: '#FFEDD5',   // Orange tint
  likert3: '#FEF9C3',   // Yellow tint
  likert4: '#DBEAFE',   // Blue tint
  likert5: '#D1FAE5',   // Green tint
  
  // Additional UI Colors
  overlay: 'rgba(15, 23, 42, 0.5)',
  divider: '#F1F5F9',
  placeholder: '#94A3B8',
  disabled: '#E2E8F0',
  
  // Input Colors
  inputBackground: '#F8FAFC',
  inputBorder: '#E2E8F0',
  inputFocusBorder: '#0F3C59',
  
  // Tab Bar
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#F1F5F9',
  tabBarActive: '#0F3C59',
  tabBarInactive: '#94A3B8',
  
  // Status Bar
  statusBarStyle: 'dark-content',
};

export const darkTheme = {
  // Primary Colors
  primary: '#38BDF8',
  primaryDark: '#0F172A',
  primaryLight: '#0C4A6E',
  primaryMedium: '#0284C7',
  
  // Secondary Colors
  secondary: '#FBBF24',
  secondaryDark: '#92400E',
  secondaryLight: '#451A03',

  // Tertiary Colors
  tertiary: '#F87171',
  tertiaryDark: '#7F1D1D',
  tertiaryLight: '#450A0A',
  
  // Status Colors
  success: '#34D399',
  error: '#F87171',
  danger: '#F87171',
  warning: '#FBBF24',
  info: '#38BDF8',
  
  // Text Colors
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textDisabled: '#475569',
  
  // Background Colors
  background: '#0F172A',     // Deep Navy
  surface: '#1E293B',        // Slate Dark
  surfaceLight: '#334155',
  
  // Border Colors
  border: '#1E293B',
  borderLight: '#334155',
  
  // Card Colors
  card: '#1E293B',
  cardElevated: '#334155',
  
  // Glassmorphism effect simulations
  glass: 'rgba(30, 41, 59, 0.7)',
  glassDark: 'rgba(15, 23, 42, 0.8)',

  // Shadows (Premium Dark)
  shadowSoft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 2,
  },
  shadowMedium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 5,
  },
  shadowLarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 30,
    elevation: 10,
  },
  
  // Evaluation Card Colors
  evaluasiDosen: '#38BDF8',
  evaluasiFasilitas: '#F87171',
  
  // Likert Scale Colors - Refined for Dark Mode
  likert1: '#450A0A',
  likert2: '#451A03',
  likert3: '#422006',
  likert4: '#0C4A6E',
  likert5: '#064E3B',
  
  // Additional UI Colors
  overlay: 'rgba(0, 0, 0, 0.8)',
  divider: '#1E293B',
  placeholder: '#475569',
  disabled: '#1E293B',
  
  // Input Colors
  inputBackground: '#0F172A',
  inputBorder: '#334155',
  inputFocusBorder: '#38BDF8',
  
  // Tab Bar
  tabBarBackground: '#0F172A',
  tabBarBorder: '#1E293B',
  tabBarActive: '#38BDF8',
  tabBarInactive: '#475569',
  
  // Status Bar
  statusBarStyle: 'light-content',
};

// Export a function to get theme by name
export const getTheme = (themeName) => {
  return themeName === 'dark' ? darkTheme : lightTheme;
};

export default {
  light: lightTheme,
  dark: darkTheme,
  getTheme,
};

