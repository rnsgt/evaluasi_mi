import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../contexts/ThemeContext';

const ThemedStatusBar = () => {
  const { isDark } = useTheme();
  
  return <StatusBar style={isDark ? 'light' : 'dark'} />;
};

export default ThemedStatusBar;
