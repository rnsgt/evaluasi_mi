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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
      <View style={[styles.infoIconBox, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <View style={styles.infoTextContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '-'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profil Saya</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.nama ? user.nama.substring(0, 2).toUpperCase() : 'MA'}
              </Text>
            </View>
            <View style={styles.editBadge}>
              <MaterialCommunityIcons name="check-decagram" size={20} color="#2563EB" />
            </View>
          </View>
          <Text style={styles.userName}>{user?.nama || 'Mahasiswa'}</Text>
          <Text style={styles.userEmail}>{user?.email || '-'}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMASI AKADEMIK</Text>
          <View style={styles.infoContainer}>
            {renderInfoItem('card-account-details-outline', 'NIM', user?.nim, '#2563EB')}
            <View style={styles.divider} />
            {renderInfoItem('school-outline', 'Program Studi', user?.prodi || user?.program_studi, '#8B5CF6')}
            <View style={styles.divider} />
            {renderInfoItem('calendar-outline', 'Angkatan', user?.angkatan, '#EA580C')}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PENGATURAN</Text>
          <View style={styles.infoContainer}>
            <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('ChangePassword')}>
              <View style={[styles.infoIconBox, { backgroundColor: '#F1F5F9' }]}>
                <MaterialCommunityIcons name="lock-reset" size={22} color="#475569" />
              </View>
              <Text style={styles.actionLabel}>Ubah Password</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={22} color="#EF4444" />
          <Text style={styles.logoutText}>Keluar dari Aplikasi</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Versi 1.0.0 (Premium UI)</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  scrollContent: { padding: 24, paddingBottom: 40 },
  header: { marginBottom: 24 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  profileCard: { backgroundColor: '#FFF', borderRadius: 32, padding: 32, alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, marginBottom: 32 },
  avatarWrapper: { position: 'relative', marginBottom: 16 },
  avatar: { width: 90, height: 90, borderRadius: 30, backgroundColor: '#2563EB', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  editBadge: { position: 'absolute', bottom: -5, right: -5, backgroundColor: '#FFF', borderRadius: 12, padding: 2 },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  userEmail: { fontSize: 14, color: '#64748B', marginTop: 4 },
  roleBadge: { backgroundColor: '#DBECFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 16 },
  roleText: { fontSize: 11, fontWeight: 'bold', color: '#2563EB', letterSpacing: 0.5 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8', marginBottom: 12, letterSpacing: 1 },
  infoContainer: { backgroundColor: '#FFF', borderRadius: 24, padding: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  infoItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  infoIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  infoTextContent: { flex: 1, marginLeft: 16 },
  infoLabel: { fontSize: 12, color: '#94A3B8' },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#1E293B', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginHorizontal: 0 },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  actionLabel: { flex: 1, marginLeft: 16, fontSize: 15, fontWeight: '600', color: '#1E293B' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', paddingVertical: 18, borderRadius: 20, marginTop: 12 },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: 'bold', marginLeft: 12 },
  versionText: { textAlign: 'center', color: '#94A3B8', fontSize: 12, marginTop: 32 },
});

export default ProfileScreen;
