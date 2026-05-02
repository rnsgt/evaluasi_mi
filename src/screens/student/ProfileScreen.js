import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Rect, Path } from 'react-native-svg';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import authService from '../../services/authService';

const { width } = Dimensions.get('window');

const ProfileScreen = ({ navigation }) => {
  const { user, logout, updateUser } = useAuth();
  const { colors } = useTheme();
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoadingProfile(true);
        const profile = await authService.getProfile();
        if (profile) {
          await updateUser({ ...user, ...profile });
        }
      } catch (error) {
        console.error('Load profile error:', error);
      } finally {
        setLoadingProfile(false);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert('Keluar Akun', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: logout },
    ]);
  };

  const renderInfoItem = (icon, label, value, color) => (
    <View style={styles.infoItem}>
      <View style={[styles.infoIconBox, { backgroundColor: color + '12' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <View style={styles.infoTextContent}>
        <Text style={[styles.infoLabel, { color: colors.textDisabled }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{value || '-'}</Text>
      </View>
    </View>
  );

  const DecorativeBackground = () => (
    <View style={StyleSheet.absoluteFill}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Circle cx={width * 0.9} cy="150" r="100" fill={colors.primary + '08'} />
        <Path d="M0 400 Q 50 350 100 400 T 200 400" fill="none" stroke={colors.secondary + '05'} strokeWidth="40" />
        <Rect x={width - 80} y="600" width="60" height="60" rx="15" transform="rotate(20)" fill={colors.tertiary + '05'} />
      </Svg>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <DecorativeBackground />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerSection, { backgroundColor: colors.primary }]}>
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            <Circle cx="0" cy="0" r="120" fill="rgba(255,255,255,0.08)" />
            <Circle cx={width} cy="100" r="80" fill="rgba(255,255,255,0.05)" />
          </Svg>

          <View style={styles.avatarWrapper}>
            <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {user?.nama ? user.nama.substring(0, 2).toUpperCase() : 'MA'}
              </Text>
            </View>
            <View style={[styles.statusBadge, { borderColor: colors.primary }]}>
              <MaterialCommunityIcons name="check-decagram" size={20} color={colors.secondaryDark} />
            </View>
          </View>
          <Text style={styles.userName}>{user?.nama || 'Mahasiswa'}</Text>
          <Text style={styles.userEmail}>{user?.nim || '-'}</Text>
        </View>

        <View style={styles.bodyContent}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>INFORMASI AKADEMIK</Text>
            </View>
            <View style={[styles.infoContainer, { backgroundColor: colors.surface }, colors.shadowSoft]}>
              {renderInfoItem('card-account-details-outline', 'Nomor Induk Mahasiswa', user?.nim, colors.primary)}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              {renderInfoItem('school-outline', 'Program Studi', user?.prodi || user?.program_studi || 'Manajemen Informatika', colors.secondaryDark)}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              {renderInfoItem('calendar-outline', 'Tahun Angkatan', user?.angkatan, colors.tertiary)}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: colors.tertiary }]} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>PENGATURAN AKUN</Text>
            </View>
            <View style={[styles.infoContainer, { backgroundColor: colors.surface }, colors.shadowSoft]}>
              <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('ChangePassword')}>
                <View style={[styles.infoIconBox, { backgroundColor: colors.background }]}>
                  <MaterialCommunityIcons name="shield-lock-outline" size={22} color={colors.textSecondary} />
                </View>
                <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Ubah Password</Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textDisabled} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error + '10' }]} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={24} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Keluar Akun</Text>
          </TouchableOpacity>

          <Text style={[styles.versionText, { color: colors.textDisabled }]}>Aplikasi Evaluasi MI v1.0.0 (Premium)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  headerSection: { alignItems: 'center', padding: 40, paddingTop: 60, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden' },
  avatarWrapper: { position: 'relative', marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 35, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 10 },
  avatarText: { fontSize: 36, fontWeight: 'bold' },
  statusBadge: { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#FFF', borderRadius: 15, padding: 2, borderWidth: 3 },
  userName: { fontSize: 22, fontWeight: 'bold', color: '#FFFFFF', textAlign: 'center' },
  userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  roleBadge: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 20 },
  roleText: { fontSize: 10, fontWeight: '900', color: '#FFFFFF', letterSpacing: 2 },

  bodyContent: { padding: 24, marginTop: 10 },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, marginLeft: 8 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  infoContainer: { borderRadius: 32, padding: 20 },
  infoItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  infoIconBox: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  infoTextContent: { flex: 1, marginLeft: 16 },
  infoLabel: { fontSize: 11, fontWeight: 'bold' },
  infoValue: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  divider: { height: 1, marginHorizontal: 8 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  actionLabel: { flex: 1, marginLeft: 16, fontSize: 16, fontWeight: '700' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 20, borderRadius: 24, marginTop: 8 },
  logoutText: { fontSize: 16, fontWeight: 'bold', marginLeft: 12 },
  versionText: { textAlign: 'center', fontSize: 11, marginTop: 40, fontWeight: '600' },
});

export default ProfileScreen;
