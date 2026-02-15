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
import { colors, typography, spacing, borderRadius as radius, shadows } from '../../utils/theme';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

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

  const InfoCard = ({ icon, label, value }) => (
    <View style={styles.infoCard}>
      <View style={styles.infoIconContainer}>
        <MaterialCommunityIcons name={icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil Mahasiswa</Text>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.nama ? user.nama.substring(0, 2).toUpperCase() : 'MA'}
              </Text>
            </View>
            <View style={styles.statusIndicator} />
          </View>
          <Text style={styles.profileName}>{user?.nama || 'Mahasiswa'}</Text>
          <View style={styles.statusBadge}>
            <Text style={styles.statusBadgeText}>Mahasiswa Aktif</Text>
          </View>
        </View>

        {/* Academic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMASI AKADEMIK</Text>
          
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

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PENGATURAN AKUN</Text>
          
          <TouchableOpacity
            onPress={handleChangePassword}
            style={styles.actionButton}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="lock-reset" size={20} color="white" style={styles.actionButtonIcon} />
            <Text style={styles.actionButtonLabel}>Ubah Password</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={handleLogout}
            style={[styles.actionButton, styles.logoutButton]}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="logout" size={20} color={colors.error} style={styles.actionButtonIcon} />
            <Text style={[styles.actionButtonLabel, styles.logoutButtonLabel]}>Keluar Akun</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.background,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.base,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
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
    backgroundColor: colors.success,
    borderWidth: 3,
    borderColor: colors.background,
  },
  profileName: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  statusBadge: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  statusBadgeText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
  },
  section: {
    marginTop: spacing.base,
    paddingHorizontal: spacing.base,
  },
  sectionTitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: spacing.md,
    marginTop: spacing.base,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.sm,
    elevation: 2,
  },
  infoIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
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
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
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
    borderColor: colors.error,
  },
  logoutButtonLabel: {
    color: colors.error,
  },
});

export default ProfileScreen;
