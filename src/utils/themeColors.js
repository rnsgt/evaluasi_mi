// Theme Color Palettes for Light and Dark Modes

export const lightTheme = {
  // Primary Colors - UNSRI Navy Blue
  primary: '#0F3C59',
  primaryDark: '#0A283C',
  primaryLight: '#E6F0F9',
  
  // Secondary Colors - UNSRI Gold/Yellow
  secondary: '#FFC107',
  secondaryDark: '#B28704',
  secondaryLight: '#FFF8E1',

  // Tertiary Colors - MI Red
  tertiary: '#B91C1C',
  tertiaryDark: '#7F1D1D',
  tertiaryLight: '#FEF2F2',
  
  // Status Colors
  success: '#16A34A',
  error: '#DC2626',
  danger: '#DC2626',
  warning: '#EA580C',
  info: '#0284C7',
  
  // Text Colors
  textPrimary: '#212121',
  textSecondary: '#757575',
  textDisabled: '#BDBDBD',
  
  // Background Colors
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceLight: '#FAFAFA',
  
  // Border Colors
  border: '#E0E0E0',
  borderLight: '#F5F5F5',
  
  // Card Colors
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  
  // Evaluation Card Colors
  evaluasiDosen: '#228BE6',
  evaluasiFasilitas: '#228BE6',
  
  // Likert Scale Colors - Green gradient theme
  likert1: '#FFCDD2',   // Sangat Tidak Setuju (Red tint)
  likert2: '#FFE0B2',   // Tidak Setuju (Orange tint)
  likert3: '#FFF9C4',   // Netral (Yellow tint)
  likert4: '#DBECFF',
  likert5: '#88C2F4',
  
  // Additional UI Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  divider: '#E0E0E0',
  placeholder: '#9E9E9E',
  disabled: '#BDBDBD',
  
  // Input Colors
  inputBackground: '#FFFFFF',
  inputBorder: '#E0E0E0',
  inputFocusBorder: '#228BE6',
  
  // Tab Bar
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E0E0E0',
  tabBarActive: '#228BE6',
  tabBarInactive: '#757575',
  
  // Status Bar
  statusBarStyle: 'dark-content',
};

export const darkTheme = {
  // Primary Colors - UNSRI Navy Blue (dark mode)
  primary: '#228BE6', // Keep brighter blue for dark mode visibility, or use Navy
  primaryDark: '#0F3C59',
  primaryLight: '#88C2F4',
  
  // Secondary Colors - UNSRI Gold/Yellow
  secondary: '#FFC107',
  secondaryDark: '#B28704',
  secondaryLight: '#FFF8E1',

  // Tertiary Colors - MI Red
  tertiary: '#EF4444', // Brighter red for dark mode
  tertiaryDark: '#B91C1C',
  tertiaryLight: '#FEF2F2',
  
  // Status Colors
  success: '#4ADE80',
  error: '#F87171',
  danger: '#F87171',
  warning: '#FBBF24',
  info: '#38BDF8',
  
  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textDisabled: '#666666',
  
  // Background Colors
  background: '#121212',     // Almost black
  surface: '#1E1E1E',        // Dark grey
  surfaceLight: '#2C2C2C',   // Lighter dark grey
  
  // Border Colors
  border: '#373737',
  borderLight: '#2C2C2C',
  
  // Card Colors
  card: '#1E1E1E',
  cardElevated: '#2C2C2C',
  
  // Evaluation Card Colors
  evaluasiDosen: '#228BE6',
  evaluasiFasilitas: '#88C2F4',
  
  // Likert Scale Colors - Adjusted for dark mode
  likert1: '#EF5350',   // Sangat Tidak Setuju (Red)
  likert2: '#FFB74D',   // Tidak Setuju (Orange)
  likert3: '#FFF176',   // Netral (Yellow)
  likert4: '#5EA6E8',
  likert5: '#88C2F4',
  
  // Additional UI Colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  divider: '#373737',
  placeholder: '#666666',
  disabled: '#444444',
  
  // Input Colors
  inputBackground: '#2C2C2C',
  inputBorder: '#373737',
  inputFocusBorder: '#228BE6',
  
  // Tab Bar
  tabBarBackground: '#1E1E1E',
  tabBarBorder: '#373737',
  tabBarActive: '#228BE6',
  tabBarInactive: '#B0B0B0',
  
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
