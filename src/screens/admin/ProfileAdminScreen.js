import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Rect } from 'react-native-svg';
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
        <Text style={[styles.infoLabel, { color: colors.textDisabled }]}>{label}</Text>
        <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{value || '-'}</Text>
      </View>
    </View>
  );

  const DecorativeBackground = () => (
    <View style={StyleSheet.absoluteFill}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Circle cx={width} cy="100" r="100" fill={colors.primary + '08'} />
        <Rect x="-20" y="400" width="100" height="100" rx="20" transform="rotate(-15)" fill={colors.secondary + '05'} />
      </Svg>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <DecorativeBackground />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.profileHeader, { backgroundColor: colors.primaryDark }]}>
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            <Circle cx="0" cy="0" r="100" fill="rgba(255,255,255,0.05)" />
            <Circle cx={width} cy="50" r="80" fill="rgba(255,255,255,0.03)" />
          </Svg>
          
          <View style={styles.avatarWrapper}>
            <View style={[styles.avatar, { backgroundColor: colors.surface }]}>
              <MaterialCommunityIcons name="shield-account" size={48} color={colors.primary} />
            </View>
            <View style={[styles.onlineStatus, { borderColor: colors.primaryDark }]} />
          </View>
          <Text style={styles.userName}>{user?.nama || 'Administrator'}</Text>
          <Text style={styles.userEmail}>{user?.email || 'admin@unsri.ac.id'}</Text>
          <View style={[styles.adminTag, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
            <Text style={styles.adminTagText}>SUPER ADMIN PANEL</Text>
          </View>
        </View>

        <View style={styles.bodyContent}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>INFORMASI AKUN</Text>
            </View>
            <View style={[styles.infoContainer, { backgroundColor: colors.surface }, colors.shadowSoft]}>
              {renderInfoRow('identifier', 'NIM / ID', user?.nim || 'ADM-01', colors.primary)}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              {renderInfoRow('account-outline', 'Nama Lengkap', user?.nama, colors.secondaryDark)}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              {renderInfoRow('email-outline', 'Email Sistem', user?.email, colors.success)}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: colors.tertiary }]} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>PENGATURAN & KEAMANAN</Text>
            </View>
            <View style={[styles.infoContainer, { backgroundColor: colors.surface }, colors.shadowSoft]}>
              <TouchableOpacity style={styles.actionRow} onPress={() => navigation.navigate('ChangePassword')}>
                <View style={[styles.infoIconBox, { backgroundColor: colors.background }]}>
                  <MaterialCommunityIcons name="lock-reset" size={22} color={colors.textSecondary} />
                </View>
                <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>Ubah Password</Text>
                <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textDisabled} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.error + '10' }]} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={22} color={colors.error} />
            <Text style={[styles.logoutText, { color: colors.error }]}>Keluar Admin</Text>
          </TouchableOpacity>
          
          <Text style={[styles.versionText, { color: colors.textDisabled }]}>Panel Admin Versi 1.0.0 (Premium Layout)</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  profileHeader: { alignItems: 'center', padding: 40, paddingTop: 60, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden' },
  avatarWrapper: { position: 'relative', marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  onlineStatus: { position: 'absolute', bottom: 5, right: 5, width: 22, height: 22, backgroundColor: '#10B981', borderRadius: 11, borderWidth: 4 },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF' },
  userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  adminTag: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 16, marginTop: 20 },
  adminTagText: { fontSize: 10, fontWeight: '900', color: '#FFFFFF', letterSpacing: 2 },
  
  bodyContent: { padding: 24, marginTop: 10 },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, marginLeft: 8 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  infoContainer: { borderRadius: 32, padding: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
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

export default ProfileAdminScreen;
