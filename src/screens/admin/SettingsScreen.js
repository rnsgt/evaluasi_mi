import React from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography, spacing, borderRadius as radius } from '../../utils/theme';

const SettingsScreen = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Keluar Akun',
      'Apakah Anda yakin ingin keluar dari aplikasi?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Keluar',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons name="cog-outline" size={64} color={colors.textDisabled} />
        <Text style={styles.title}>Pengaturan</Text>
        <Text style={styles.subtitle}>Fitur dalam pengembangan</Text>
        
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="logout" size={20} color={colors.error} style={styles.logoutButtonIcon} />
          <Text style={styles.logoutButtonLabel}>Keluar Akun</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginTop: spacing.base,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.error,
    marginTop: spacing.lg,
  },
  logoutButtonIcon: {
    marginRight: spacing.sm,
  },
  logoutButtonLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.error,
  },
});

export default SettingsScreen;
