// Theme Color Palettes for Light and Dark Modes

export const lightTheme = {
  // Primary Colors - Academic Green
  primary: '#2E7D32',        // Forest Green
  primaryDark: '#1B5E20',    // Dark Green
  primaryLight: '#A5D6A7',   // Light Green
  
  // Status Colors
  success: '#66BB6A',        // Green
  error: '#F44336',          // Red
  danger: '#F44336',         // Red (alias)
  warning: '#FFA726',        // Orange
  info: '#43A047',           // Green info
  
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
  evaluasiDosen: '#2E7D32',
  evaluasiFasilitas: '#388E3C',
  
  // Likert Scale Colors - Green gradient theme
  likert1: '#FFCDD2',   // Sangat Tidak Setuju (Red tint)
  likert2: '#FFE0B2',   // Tidak Setuju (Orange tint)
  likert3: '#FFF9C4',   // Netral (Yellow tint)
  likert4: '#C8E6C9',   // Setuju (Light Green)
  likert5: '#81C784',   // Sangat Setuju (Green)
  
  // Additional UI Colors
  overlay: 'rgba(0, 0, 0, 0.5)',
  divider: '#E0E0E0',
  placeholder: '#9E9E9E',
  disabled: '#BDBDBD',
  
  // Input Colors
  inputBackground: '#FFFFFF',
  inputBorder: '#E0E0E0',
  inputFocusBorder: '#2E7D32',
  
  // Tab Bar
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E0E0E0',
  tabBarActive: '#2E7D32',
  tabBarInactive: '#757575',
  
  // Status Bar
  statusBarStyle: 'dark-content',
};

export const darkTheme = {
  // Primary Colors - Academic Green (slightly adjusted for dark mode)
  primary: '#4CAF50',        // Brighter Green for visibility
  primaryDark: '#388E3C',    // Medium Green
  primaryLight: '#81C784',   // Light Green
  
  // Status Colors
  success: '#81C784',        // Lighter Green
  error: '#EF5350',          // Lighter Red
  danger: '#EF5350',         // Lighter Red (alias)
  warning: '#FFB74D',        // Lighter Orange
  info: '#66BB6A',           // Lighter Green info
  
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
  evaluasiDosen: '#4CAF50',
  evaluasiFasilitas: '#66BB6A',
  
  // Likert Scale Colors - Adjusted for dark mode
  likert1: '#EF5350',   // Sangat Tidak Setuju (Red)
  likert2: '#FFB74D',   // Tidak Setuju (Orange)
  likert3: '#FFF176',   // Netral (Yellow)
  likert4: '#81C784',   // Setuju (Light Green)
  likert5: '#66BB6A',   // Sangat Setuju (Green)
  
  // Additional UI Colors
  overlay: 'rgba(0, 0, 0, 0.7)',
  divider: '#373737',
  placeholder: '#666666',
  disabled: '#444444',
  
  // Input Colors
  inputBackground: '#2C2C2C',
  inputBorder: '#373737',
  inputFocusBorder: '#4CAF50',
  
  // Tab Bar
  tabBarBackground: '#1E1E1E',
  tabBarBorder: '#373737',
  tabBarActive: '#4CAF50',
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
