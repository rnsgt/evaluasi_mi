// Theme Color Palettes for Light and Dark Modes

export const lightTheme = {
  // Primary Colors - Dashboard Blue
  primary: '#228BE6',
  primaryDark: '#0B78F0',
  primaryLight: '#88C2F4',
  
  // Status Colors
  success: '#228BE6',
  error: '#F44336',          // Red
  danger: '#F44336',         // Red (alias)
  warning: '#FFA726',        // Orange
  info: '#228BE6',
  
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
  // Primary Colors - Dashboard Blue (dark mode)
  primary: '#228BE6',
  primaryDark: '#0B78F0',
  primaryLight: '#88C2F4',
  
  // Status Colors
  success: '#88C2F4',
  error: '#EF5350',          // Lighter Red
  danger: '#EF5350',         // Lighter Red (alias)
  warning: '#FFB74D',        // Lighter Orange
  info: '#88C2F4',
  
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
