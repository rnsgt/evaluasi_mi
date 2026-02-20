import React from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, typography, spacing, borderRadius as radius } from '../../utils/theme';

const SettingsScreen = ({ navigation }) => {
  const { logout } = useAuth();
  const { colors } = useTheme();

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

  const menuItems = [
    {
      id: 'kelola',
      title: 'Kelola Data Master',
      description: 'Kelola data fasilitas dan dosen',
      icon: 'database-cog',
      color: colors.primary,
      onPress: () => navigation.navigate('KelolaHub'),
    },
    {
      id: 'profile',
      title: 'Profil Admin',
      description: 'Kelola informasi profil Anda',
      icon: 'account-circle',
      color: '#2196F3',
      onPress: () => Alert.alert('Info', 'Fitur dalam pengembangan'),
    },
    {
      id: 'notification',
      title: 'Notifikasi',
      description: 'Atur preferensi notifikasi',
      icon: 'bell',
      color: '#FF9800',
      onPress: () => Alert.alert('Info', 'Fitur dalam pengembangan'),
    },
    {
      id: 'help',
      title: 'Bantuan & Panduan',
      description: 'Panduan penggunaan aplikasi',
      icon: 'help-circle',
      color: '#9C27B0',
      onPress: () => Alert.alert('Info', 'Fitur dalam pengembangan'),
    },
    {
      id: 'about',
      title: 'Tentang Aplikasi',
      description: 'Informasi versi dan lisensi',
      icon: 'information',
      color: '#607D8B',
      onPress: () => Alert.alert('Info', 'Evaluasi MI v1.0.0'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Pengaturan</Text>
        <Text style={styles.headerSubtitle}>Kelola aplikasi dan data</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Menu Items */}
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.id}
            style={styles.menuItem}
            onPress={item.onPress}
            activeOpacity={0.7}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
              <MaterialCommunityIcons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>{item.title}</Text>
              <Text style={styles.menuItemDescription}>{item.description}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textDisabled} />
          </TouchableOpacity>
        ))}

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          style={styles.logoutButton}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="logout" size={20} color={colors.error} />
          <Text style={styles.logoutButtonLabel}>Keluar Akun</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: spacing.base,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  content: {
    flex: 1,
    padding: spacing.base,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: spacing.base,
    marginBottom: spacing.sm,
    borderRadius: radius.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  menuItemTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.textPrimary,
  },
  menuItemDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.base,
    borderWidth: 1.5,
    borderColor: colors.error,
    marginTop: spacing.xl,
    backgroundColor: '#fff',
    gap: spacing.xs,
  },
  logoutButtonLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.error,
  },
});

export default SettingsScreen;
