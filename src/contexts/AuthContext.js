import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import authService from '../services/authService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Check if user is already logged in on app start
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const savedToken = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      const savedUser = await AsyncStorage.getItem(STORAGE_KEYS.USER);

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (nim, password) => {
    try {
      setAuthError(null);
      setLoading(true);

      const response = await authService.login(nim, password);

      // Save to AsyncStorage
      await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));

      // Update state
      setToken(response.token);
      setUser(response.user);

      return { success: true };
    } catch (error) {
      setAuthError(error.message || 'Login gagal');
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call logout API
      await authService.logout();
    } catch (error) {
      console.error('Logout API failed:', error);
    } finally {
      // Clear local storage and state
      await AsyncStorage.multiRemove([STORAGE_KEYS.TOKEN, STORAGE_KEYS.USER]);
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = async (updatedUser) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (error) {
      console.error('Update user failed:', error);
    }
  };

  const value = {
    user,
    token,
    loading,
    authError,
    login,
    logout,
    updateUser,
    isAuthenticated: !!token,
    isMahasiswa: user?.role === 'mahasiswa',
    isAdmin: user?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
