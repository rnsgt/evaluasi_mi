import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../utils/themeColors';

const ThemeContext = createContext();
const THEME_STORAGE_KEY = '@app_theme';

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme on mount
  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Load theme error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = async (newTheme) => {
    try {
      if (newTheme !== 'light' && newTheme !== 'dark') {
        throw new Error('Invalid theme value');
      }
      setTheme(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Save theme error:', error);
    }
  };

  const colors = theme === 'light' ? lightTheme : darkTheme;

  const value = {
    theme,
    colors,
    isDark: theme === 'dark',
    isLight: theme === 'light',
    toggleTheme,
    isLoading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export default ThemeContext;
