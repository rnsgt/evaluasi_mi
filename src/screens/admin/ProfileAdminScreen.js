import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const ProfileAdminScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { colors } = useTheme();

  const handleLogout = () => {
    Alert.alert('Keluar Admin', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Keluar', style: 'destructive', onPress: logout },
    ]);
  };

  const renderInfoRow = (icon, label, value, color) => (
    <View style={styles.infoRow}>
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
          <Text style={styles.headerTitle}>Profil Admin</Text>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <MaterialCommunityIcons name="shield-account" size={40} color="#FFF" />
            </View>
            <View style={styles.onlineStatus} />
          </View>
          <Text style={styles.userName}>{user?.nama || 'Administrator'}</Text>
          <Text style={styles.userEmail}>{user?.email || '-'}</Text>
          <View style={styles.adminTag}>
            <Text style={styles.adminTagText}>SUPER ADMIN</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>INFORMASI AKUN</Text>
          <View style={styles.infoContainer}>
            {renderInfoRow('identifier', 'NIM / ID', user?.nim || 'ADM-01', '#2563EB')}
            <View style={styles.divider} />
            {renderInfoRow('account-outline', 'Nama Lengkap', user?.nama, '#8B5CF6')}
            <View style={styles.divider} />
            {renderInfoRow('email-outline', 'Email Sistem', user?.email, '#10B981')}
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
          <Text style={styles.logoutText}>Keluar Admin</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>Panel Admin Versi 1.0.0 (Premium)</Text>
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
  avatar: { width: 90, height: 90, borderRadius: 30, backgroundColor: '#0F172A', justifyContent: 'center', alignItems: 'center' },
  onlineStatus: { position: 'absolute', bottom: 5, right: 5, width: 18, height: 18, backgroundColor: '#10B981', borderRadius: 9, borderWidth: 3, borderColor: '#FFF' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  userEmail: { fontSize: 14, color: '#64748B', marginTop: 4 },
  adminTag: { backgroundColor: '#F1F5F9', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 16, borderWidth: 1, borderColor: '#E2E8F0' },
  adminTagText: { fontSize: 10, fontWeight: 'bold', color: '#1E293B', letterSpacing: 1 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8', marginBottom: 12, letterSpacing: 1 },
  infoContainer: { backgroundColor: '#FFF', borderRadius: 24, padding: 16, elevation: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  infoIconBox: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  infoTextContent: { flex: 1, marginLeft: 16 },
  infoLabel: { fontSize: 11, color: '#94A3B8', fontWeight: 'bold' },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#1E293B', marginTop: 2 },
  divider: { height: 1, backgroundColor: '#F1F5F9' },
  actionRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  actionLabel: { flex: 1, marginLeft: 16, fontSize: 15, fontWeight: '600', color: '#1E293B' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FEF2F2', paddingVertical: 18, borderRadius: 20, marginTop: 12 },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: 'bold', marginLeft: 12 },
  versionText: { textAlign: 'center', color: '#94A3B8', fontSize: 11, marginTop: 32 },
});

export default ProfileAdminScreen;
