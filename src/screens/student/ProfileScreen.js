import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, typography, spacing, borderRadius as radius } from '../../utils/theme';

const THEME_OPTIONS = [
  { id: 'light', name: 'Mode Terang', color: '#FFFFFF', icon: 'white-balance-sunny', iconColor: '#FFA000' },
  { id: 'dark', name: 'Mode Gelap', color: '#1E1E1E', icon: 'moon-waning-crescent', iconColor: '#FFFFFF' },
];

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { theme, colors, toggleTheme } = useTheme();

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

  const handleChangePassword = () => {
    // TODO: Navigate to change password screen
    console.log('Navigate to change password');
  };

  const handleThemeChange = async (themeId) => {
    const themeName = themeId === 'light' ? 'Mode Terang' : 'Mode Gelap';
    Alert.alert(
      'Ubah Mode Tampilan?',
      `Aplikasi akan menggunakan ${themeName}.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ubah',
          onPress: async () => {
            await toggleTheme(themeId);
            Alert.alert('Berhasil', `${themeName} telah diterapkan!`);
          },
        },
      ]
    );
  };

  const InfoCard = ({ icon, label, value }) => (
    <View style={[styles.infoCard, { backgroundColor: colors.card }]}>
      <View style={[styles.infoIconContainer, { backgroundColor: colors.primary + '20' }]}>
        <MaterialCommunityIcons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.surface }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Profil Mahasiswa</Text>
        </View>

        {/* Profile Info */}
        <View style={[styles.profileSection, { backgroundColor: colors.background }]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>
                {user?.nama ? user.nama.substring(0, 2).toUpperCase() : 'MA'}
              </Text>
            </View>
            <View style={[styles.statusIndicator, { backgroundColor: colors.success, borderColor: colors.background }]} />
          </View>
          <Text style={[styles.profileName, { color: colors.textPrimary }]}>{user?.nama || 'Mahasiswa'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: colors.primary + '20' }]}>
            <Text style={[styles.statusBadgeText, { color: colors.primary }]}>Mahasiswa Aktif</Text>
          </View>
        </View>

        {/* Academic Info */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>INFORMASI AKADEMIK</Text>
          
          <InfoCard
            icon="card-account-details-outline"
            label="NIM"
            value={user?.nim || '-'}
          />
          <InfoCard
            icon="account-outline"
            label="NAMA LENGKAP"
            value={user?.nama_lengkap || user?.nama || '-'}
          />
          <InfoCard
            icon="school-outline"
            label="PROGRAM STUDI"
            value={user?.program_studi || 'Teknik Informatika'}
          />
          <InfoCard
            icon="calendar-outline"
            label="ANGKATAN"
            value={user?.angkatan || '2021'}
          />
        </View>

        {/* Theme Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>MODE TAMPILAN</Text>
          
          <View style={[styles.themeContainer, { backgroundColor: colors.card }]}>
            {THEME_OPTIONS.map((themeOption) => (
              <TouchableOpacity
                key={themeOption.id}
                style={[
                  styles.themeOption,
                  { 
                    backgroundColor: colors.card,
                    borderColor: theme === themeOption.id ? colors.primary : 'transparent'
                  },
                  theme === themeOption.id && styles.themeOptionSelected,
                ]}
                onPress={() => handleThemeChange(themeOption.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.themeColorCircle,
                    { backgroundColor: themeOption.color },
                    themeOption.id === 'light' && { borderWidth: 2, borderColor: colors.border },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={themeOption.icon}
                    size={28}
                    color={themeOption.iconColor}
                  />
                </View>
                <Text
                  style={[
                    styles.themeName,
                    { color: colors.textPrimary },
                    theme === themeOption.id && { fontWeight: 'bold', color: colors.primary },
                  ]}
                >
                  {themeOption.name}
                </Text>
                {theme === themeOption.id && (
                  <MaterialCommunityIcons
                    name="check-circle"
                    size={20}
                    color={colors.primary}
                    style={styles.themeCheckIcon}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PENGATURAN AKUN</Text>
          
          <TouchableOpacity
            onPress={handleChangePassword}
            style={[styles.actionButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="lock-reset" size={20} color="white" style={styles.actionButtonIcon} />
            <Text style={styles.actionButtonLabel}>Ubah Password</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.actionButton, styles.logoutButton, { borderColor: colors.error }]}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="logout" size={20} color={colors.error} style={styles.actionButtonIcon} />
            <Text style={[styles.actionButtonLabel, styles.logoutButtonLabel, { color: colors.error }]}>Keluar Akun</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    textAlign: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.base,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontFamily: typography.fontFamily.bold,
    color: 'white',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 3,
  },
  profileName: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  statusBadgeText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  section: {
    marginTop: spacing.base,
    paddingHorizontal: spacing.base,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.5,
    marginBottom: spacing.md,
    marginTop: spacing.base,
  },
  infoCard: {
    flexDirection: 'row',
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.sm,
    elevation: 2,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
    justifyContent: 'center',
  },
  infoLabel: {
    fontSize: typography.fontSize.xs,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
  },
  themeContainer: {
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.base,
    marginBottom: spacing.xs,
    borderWidth: 2,
  },
  themeOptionSelected: {
    elevation: 2,
  },
  themeColorCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
    elevation: 2,
  },
  themeName: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
  },
  themeCheckIcon: {
    marginLeft: spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.base,
    borderRadius: radius.md,
    marginBottom: spacing.sm,
  },
  actionButtonIcon: {
    marginRight: spacing.sm,
  },
  actionButtonLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: 'white',
  },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
  },
  logoutButtonLabel: {},
});

export default ProfileScreen;
