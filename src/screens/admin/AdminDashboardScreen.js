import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Rect, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import evaluasiService from '../../services/evaluasiService';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalDosen: 0,
    totalMahasiswa: 0,
    totalEvaluasi: 0,
    totalFasilitas: 0,
    partisipasi: {
      persentase: 0,
      uniqueMahasiswa: 0,
    },
    evaluasiDosen: 0,
    evaluasiFasilitas: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await evaluasiService.getAdminDashboard();
      if (data) {
        setStats({
          totalDosen: data.totalDosen || 0,
          totalMahasiswa: data.totalMahasiswa || 0,
          totalEvaluasi: data.totalEvaluasi || 0,
          totalFasilitas: data.totalFasilitas || 0,
          partisipasi: data.partisipasi || { persentase: 0, uniqueMahasiswa: 0 },
          evaluasiDosen: data.evaluasiDosen || 0,
          evaluasiFasilitas: data.evaluasiFasilitas || 0,
        });
      }
    } catch (error) {
      console.error('Load dashboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const DecorativeBackground = () => (
    <View style={StyleSheet.absoluteFill}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Circle cx={width} cy="100" r="150" fill={colors.primary + '08'} />
        <Path d="M0 400 Q 100 350 200 400 T 400 400" fill="none" stroke={colors.secondary + '05'} strokeWidth="50" />
        <Rect x="-20" y="700" width="120" height="120" rx="24" transform="rotate(-15)" fill={colors.tertiary + '05'} />
      </Svg>
    </View>
  );

  const StatItem = ({ title, value, icon, color, style }) => (
    <View style={[styles.statItem, { backgroundColor: colors.surface }, colors.shadowSoft, style]}>
      <View style={[styles.statIconWrapper, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={22} color={color} />
      </View>
      <View>
        <Text style={[styles.statLabel, { color: colors.textSecondary }]}>{title}</Text>
        <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Sinkronisasi Data Panel UPM...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <DecorativeBackground />
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Header Area with Building Background */}
        <View style={styles.headerWrapper}>
          <ImageBackground 
            source={require('../../../assets/gedung diklat.jpg')} 
            style={styles.headerBackground}
          >
            <View style={styles.headerOverlay}>
              <View style={styles.headerTop}>
                <View>
                  <Text style={styles.greetingText}>Panel Unit Penjaminan Mutu</Text>
                  <Text style={styles.adminNameText}>{user?.nama || 'Kepala UPM'}</Text>
                </View>
                <View style={[styles.logoBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                  <Image source={require('../../../assets/logomi.png')} style={styles.headerLogo} />
                </View>
              </View>
              
              {/* Stats at the Top - Moved from below */}
              <View style={[styles.headerStatsRow, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                <View style={styles.hStatItem}>
                  <Text style={styles.hStatValue}>{stats.evaluasiDosen}</Text>
                  <Text style={styles.hStatLabel}>EVAL. DOSEN</Text>
                </View>
                <View style={styles.hStatDivider} />
                <View style={styles.hStatItem}>
                  <Text style={styles.hStatValue}>{stats.evaluasiFasilitas}</Text>
                  <Text style={styles.hStatLabel}>EVAL. FASILITAS</Text>
                </View>
                <View style={styles.hStatDivider} />
                <View style={styles.hStatItem}>
                  <Text style={styles.hStatValue}>{stats.partisipasi.persentase}%</Text>
                  <Text style={styles.hStatLabel}>PARTISIPASI</Text>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>

        <View style={styles.bodyContent}>
          {/* Quick Stats Grid - Total Dosen & Mahasiswa */}
          <View style={styles.statsGrid}>
            <View style={styles.statsRow}>
              <StatItem 
                title="Total Dosen" 
                value={stats.totalDosen} 
                icon="account-tie" 
                color={colors.primary} 
                style={{ flex: 1 }}
              />
              <StatItem 
                title="Mahasiswa" 
                value={stats.totalMahasiswa} 
                icon="account-group" 
                color={colors.secondaryDark} 
                style={{ flex: 1 }}
              />
            </View>
          </View>

          {/* Participation Analysis Card */}
          <View style={[styles.analysisCard, { backgroundColor: colors.surface }, colors.shadowMedium]}>
            <View style={styles.analysisHeader}>
              <View style={[styles.iconBox, { backgroundColor: colors.success + '10' }]}>
                <MaterialCommunityIcons name="finance" size={24} color={colors.success} />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={[styles.analysisTitle, { color: colors.textPrimary }]}>Analisis Partisipasi</Text>
                <Text style={[styles.analysisSubtitle, { color: colors.textDisabled }]}>Data Real-time Unit Penjaminan Mutu</Text>
              </View>
              <TouchableOpacity 
                style={[styles.reportButton, { backgroundColor: colors.primary + '10' }]}
                onPress={() => navigation.navigate('Laporan')}
              >
                <Text style={[styles.reportButtonText, { color: colors.primary }]}>Laporan</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressTextRow}>
                <Text style={[styles.progressPercentage, { color: colors.primary }]}>{stats.partisipasi.persentase}%</Text>
                <View style={[styles.trendBadge, { backgroundColor: colors.success + '15' }]}>
                  <MaterialCommunityIcons name="check-decagram" size={14} color={colors.success} />
                  <Text style={[styles.trendText, { color: colors.success }]}>Online</Text>
                </View>
              </View>
              <View style={[styles.progressBarBase, { backgroundColor: colors.background }]}>
                <View style={[styles.progressBarFill, { width: `${stats.partisipasi.persentase}%`, backgroundColor: colors.primary }]} />
              </View>
              <Text style={[styles.progressSubText, { color: colors.textSecondary }]}>
                <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>{stats.partisipasi.uniqueMahasiswa}</Text> dari {stats.totalMahasiswa} Mahasiswa sudah mengisi evaluasi
              </Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionSection}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>MANAJEMEN UPM</Text>
            </View>
            <View style={styles.actionGrid}>
              {[
                { label: 'Periode', icon: 'calendar-refresh', color: colors.primary, route: 'Periode' },
                { label: 'Kelola Dosen', icon: 'account-tie-outline', color: colors.secondaryDark, route: 'Dosen' },
                { label: 'Fasilitas', icon: 'office-building-cog', color: colors.tertiary, route: 'Fasilitas' },
              ].map((action, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={[styles.actionCard, { backgroundColor: colors.surface }, colors.shadowSoft]}
                  onPress={() => navigation.navigate(action.route)}
                >
                  <View style={[styles.actionIconBox, { backgroundColor: action.color + '10' }]}>
                    <MaterialCommunityIcons name={action.icon} size={24} color={action.color} />
                  </View>
                  <Text style={[styles.actionLabel, { color: colors.textPrimary }]}>{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontWeight: '700' },
  scrollContent: { paddingBottom: 20 },
  
  headerWrapper: { borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 15 },
  headerBackground: { width: '100%', height: 260 },
  headerOverlay: { flex: 1, backgroundColor: 'rgba(15, 60, 89, 0.85)', padding: 24, paddingTop: 60, justifyContent: 'space-between' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greetingText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', fontWeight: '600', letterSpacing: 0.5 },
  adminNameText: { fontSize: 22, color: '#FFFFFF', fontWeight: 'bold', marginTop: 2 },
  logoBadge: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  headerLogo: { width: 30, height: 30, resizeMode: 'contain' },
  
  headerStatsRow: { flexDirection: 'row', padding: 18, borderRadius: 20, alignItems: 'center', marginTop: 20 },
  hStatItem: { flex: 1, alignItems: 'center' },
  hStatValue: { fontSize: 20, fontWeight: '900', color: '#FFFFFF' },
  hStatLabel: { fontSize: 8, color: 'rgba(255,255,255,0.7)', fontWeight: '900', marginTop: 4, letterSpacing: 0.8 },
  hStatDivider: { width: 1, height: 25, backgroundColor: 'rgba(255,255,255,0.1)' },
  
  bodyContent: { padding: 24, marginTop: 10 },
  statsGrid: { marginBottom: 24 },
  statsRow: { flexDirection: 'row', gap: 16 },
  statItem: { padding: 18, borderRadius: 24, flexDirection: 'row', alignItems: 'center', gap: 14 },
  statIconWrapper: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  statLabel: { fontSize: 10, fontWeight: 'bold' },
  statValue: { fontSize: 20, fontWeight: '900', marginTop: 2 },
  
  analysisCard: { padding: 24, borderRadius: 32, marginBottom: 24 },
  analysisHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  iconBox: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  analysisTitle: { fontSize: 16, fontWeight: '900' },
  analysisSubtitle: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  reportButton: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  reportButtonText: { fontSize: 11, fontWeight: 'bold' },
  
  progressContainer: {},
  progressTextRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  progressPercentage: { fontSize: 32, fontWeight: '900' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  trendText: { fontSize: 9, fontWeight: 'bold' },
  progressBarBase: { height: 10, borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 5 },
  progressSubText: { fontSize: 11, marginTop: 12, fontWeight: '600' },
  
  actionSection: {},
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 18, marginLeft: 4 },
  sectionDot: { width: 6, height: 6, borderRadius: 3 },
  sectionTitle: { fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  actionGrid: { flexDirection: 'row', gap: 12 },
  actionCard: { flex: 1, padding: 16, borderRadius: 24, alignItems: 'center', gap: 10 },
  actionIconBox: { width: 46, height: 46, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 10, fontWeight: '900', textAlign: 'center' },
});


export default AdminDashboardScreen;
