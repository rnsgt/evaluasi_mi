// Theme configuration - Colors, Typography, Spacing
export const colors = {
  // Primary Colors - Academic Green
  primary: '#2E7D32',        // Forest Green
  primaryDark: '#1B5E20',    // Dark Green
  primaryLight: '#A5D6A7',   // Light Green
  
  // Status Colors
  success: '#66BB6A',        // Green
  error: '#F44336',
  warning: '#FFA726',
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
  
  // Evaluation Card Colors
  evaluasiDosen: '#2E7D32',  // Academic Green
  evaluasiFasilitas: '#388E3C',  // Slightly different green
  
  // Likert Scale Colors - Green gradient theme
  likert1: '#FFCDD2',   // Sangat Tidak Setuju (Red tint)
  likert2: '#FFE0B2',   // Tidak Setuju (Orange tint)
  likert3: '#FFF9C4',   // Netral (Yellow tint)
  likert4: '#C8E6C9',   // Setuju (Light Green)
  likert5: '#81C784',   // Sangat Setuju (Green)
};

export const typography = {
  fontFamily: {
    regular: 'Roboto',
    medium: 'Roboto-Medium',
    bold: 'Roboto-Bold',
  },
  fontSize: {
    xs: 11,
    sm: 13,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 28,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const borderRadius = {
  sm: 4,
  base: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

// React Native Paper theme customization
export const paperTheme = {
  version: 3,
  dark: false,
  colors: {
    primary: colors.primary,
    primaryContainer: colors.primary + '20',
    secondary: colors.success,
    secondaryContainer: colors.success + '20',
    tertiary: colors.warning,
    tertiaryContainer: colors.warning + '20',
    surface: colors.surface,
    surfaceVariant: colors.background,
    surfaceDisabled: colors.disabled + '20',
    background: colors.background,
    error: colors.error,
    errorContainer: colors.error + '20',
    onPrimary: '#FFFFFF',
    onPrimaryContainer: colors.primary,
    onSecondary: '#FFFFFF',
    onSecondaryContainer: colors.success,
    onTertiary: '#FFFFFF',
    onTertiaryContainer: colors.warning,
    onSurface: colors.textPrimary,
    onSurfaceVariant: colors.textSecondary,
    onSurfaceDisabled: colors.textDisabled,
    onError: '#FFFFFF',
    onErrorContainer: colors.error,
    onBackground: colors.textPrimary,
    outline: colors.border,
    outlineVariant: colors.border + '80',
    inverseSurface: colors.textPrimary,
    inverseOnSurface: '#FFFFFF',
    inversePrimary: colors.primary,
    shadow: '#000000',
    scrim: '#000000',
    backdrop: 'rgba(0, 0, 0, 0.5)',
    elevation: {
      level0: 'transparent',
      level1: colors.surface,
      level2: colors.surface,
      level3: colors.surface,
      level4: colors.surface,
      level5: colors.surface,
    },
  },
  roundness: borderRadius.base,
};
