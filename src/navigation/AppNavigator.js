import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import StudentNavigator from './StudentNavigator';
import AdminNavigator from './AdminNavigator';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../utils/theme';

const AppNavigator = () => {
  const { isAuthenticated, isMahasiswa, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        <AuthNavigator />
      ) : isMahasiswa ? (
        <StudentNavigator />
      ) : isAdmin ? (
        <AdminNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
