import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LogBox } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import ThemedStatusBar from './src/components/ThemedStatusBar';

// Suppress error display overlay and yellow warnings box
LogBox.ignoreAllLogs();

// Optionally, suppress specific warnings while keeping others
// LogBox.ignoreLogs([
//   'Non-serializable values',
//   'VirtualizedList',
// ]);

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppNavigator />
          <ThemedStatusBar />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
