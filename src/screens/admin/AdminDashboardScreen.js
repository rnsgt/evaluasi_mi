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
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Sinkronisasi Data Panel...</Text>
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
        {/* Modern Header Area */}
        <View style={[styles.headerSection, { backgroundColor: colors.primaryDark }]}>
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            <Defs>
              <LinearGradient id="gradHeader" x1="0" y1="0" x2="1" y2="1">
                <Stop offset="0" stopColor={colors.primary} stopOpacity="1" />
                <Stop offset="1" stopColor={colors.primaryDark} stopOpacity="1" />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#gradHeader)" />
            <Circle cx={width} cy="0" r="150" fill="rgba(255,255,255,0.05)" />
            <Circle cx="0" cy="100" r="80" fill="rgba(255,255,255,0.03)" />
          </Svg>
          
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greetingText}>Selamat Datang,</Text>
              <Text style={styles.adminNameText}>{user?.nama || 'Administrator'}</Text>
            </View>
            <View style={[styles.logoBadge, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Image source={require('../../../assets/logomi.png')} style={styles.headerLogo} />
            </View>
          </View>
          
          <View style={[styles.headerStatsRow, { backgroundColor: 'rgba(0,0,0,0.1)' }]}>
            <View style={styles.hStatItem}>
              <Text style={styles.hStatValue}>{stats.totalEvaluasi}</Text>
              <Text style={styles.hStatLabel}>EVALUASI MASUK</Text>
            </View>
            <View style={styles.hStatDivider} />
            <View style={styles.hStatItem}>
              <Text style={styles.hStatValue}>{stats.partisipasi.persentase}%</Text>
              <Text style={styles.hStatLabel}>PARTISIPASI</Text>
            </View>
          </View>
        </View>

        <View style={styles.bodyContent}>
          {/* Quick Stats Grid */}
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
                <Text style={[styles.analysisSubtitle, { color: colors.textDisabled }]}>Data Real-time Periode Aktif</Text>
              </View>
              <TouchableOpacity 
                style={[styles.reportButton, { backgroundColor: colors.primary + '10' }]}
                onPress={() => navigation.navigate('Laporan')}
              >
                <Text style={[styles.reportButtonText, { color: colors.primary }]}>Detail</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={styles.progressTextRow}>
                <Text style={[styles.progressPercentage, { color: colors.primary }]}>{stats.partisipasi.persentase}%</Text>
                <View style={[styles.trendBadge, { backgroundColor: colors.success + '15' }]}>
                  <MaterialCommunityIcons name="arrow-up" size={14} color={colors.success} />
                  <Text style={[styles.trendText, { color: colors.success }]}>Aktif</Text>
                </View>
              </View>
              <View style={[styles.progressBarBase, { backgroundColor: colors.background }]}>
                <View style={[styles.progressBarFill, { width: `${stats.partisipasi.persentase}%`, backgroundColor: colors.primary }]}>
                   <LinearGradient id="gradBar" x1="0" y1="0" x2="1" y2="0">
                    <Stop offset="0" stopColor={colors.primary} stopOpacity="1" />
                    <Stop offset="1" stopColor={colors.primaryDark} stopOpacity="1" />
                  </LinearGradient>
                </View>
              </View>
              <Text style={[styles.progressSubText, { color: colors.textSecondary }]}>
                <Text style={{ fontWeight: 'bold', color: colors.textPrimary }}>{stats.partisipasi.uniqueMahasiswa}</Text> dari {stats.totalMahasiswa} Mahasiswa berpartisipasi
              </Text>
            </View>
          </View>

          {/* Composition Card */}
          <View style={styles.compositionRow}>
            <View style={[styles.compCard, { backgroundColor: colors.surface }, colors.shadowSoft]}>
              <View style={[styles.compIcon, { backgroundColor: colors.secondaryDark + '10' }]}>
                <MaterialCommunityIcons name="school" size={24} color={colors.secondaryDark} />
              </View>
              <Text style={[styles.compValue, { color: colors.textPrimary }]}>{stats.evaluasiDosen}</Text>
              <Text style={[styles.compLabel, { color: colors.textDisabled }]}>Evaluasi Dosen</Text>
            </View>
            <View style={[styles.compCard, { backgroundColor: colors.surface }, colors.shadowSoft]}>
              <View style={[styles.compIcon, { backgroundColor: colors.tertiary + '10' }]}>
                <MaterialCommunityIcons name="office-building" size={24} color={colors.tertiary} />
              </View>
              <Text style={[styles.compValue, { color: colors.textPrimary }]}>{stats.evaluasiFasilitas}</Text>
              <Text style={[styles.compLabel, { color: colors.textDisabled }]}>Evaluasi Fasilitas</Text>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.actionSection}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>MANAJEMEN DATA</Text>
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
  
  headerSection: { padding: 32, paddingTop: 60, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden' },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  greetingText: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  adminNameText: { fontSize: 24, color: '#FFFFFF', fontWeight: 'bold', marginTop: 4 },
  logoBadge: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  headerLogo: { width: 32, height: 32, resizeMode: 'contain' },
  
  headerStatsRow: { flexDirection: 'row', padding: 20, borderRadius: 24, alignItems: 'center' },
  hStatItem: { flex: 1, alignItems: 'center' },
  hStatValue: { fontSize: 22, fontWeight: '900', color: '#FFFFFF' },
  hStatLabel: { fontSize: 9, color: 'rgba(255,255,255,0.6)', fontWeight: '900', marginTop: 4, letterSpacing: 1 },
  hStatDivider: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.1)' },
  
  bodyContent: { padding: 24, marginTop: -20 },
  statsGrid: { marginBottom: 24 },
  statsRow: { flexDirection: 'row', gap: 16 },
  statItem: { padding: 20, borderRadius: 28, flexDirection: 'row', alignItems: 'center', gap: 16 },
  statIconWrapper: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  statLabel: { fontSize: 11, fontWeight: 'bold' },
  statValue: { fontSize: 22, fontWeight: '900', marginTop: 2 },
  
  analysisCard: { padding: 24, borderRadius: 35, marginBottom: 24 },
  analysisHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  iconBox: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  analysisTitle: { fontSize: 17, fontWeight: '900' },
  analysisSubtitle: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  reportButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 14 },
  reportButtonText: { fontSize: 12, fontWeight: 'bold' },
  
  progressContainer: {},
  progressTextRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  progressPercentage: { fontSize: 36, fontWeight: '900' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  trendText: { fontSize: 10, fontWeight: 'bold' },
  progressBarBase: { height: 12, borderRadius: 6, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 6 },
  progressSubText: { fontSize: 12, marginTop: 14, fontWeight: '600' },
  
  compositionRow: { flexDirection: 'row', gap: 16, marginBottom: 32 },
  compCard: { flex: 1, padding: 20, borderRadius: 30, alignItems: 'center' },
  compIcon: { width: 50, height: 50, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  compValue: { fontSize: 22, fontWeight: '900' },
  compLabel: { fontSize: 11, fontWeight: 'bold', marginTop: 4 },
  
  actionSection: {},
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, marginLeft: 8 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  actionGrid: { flexDirection: 'row', gap: 12 },
  actionCard: { flex: 1, padding: 18, borderRadius: 28, alignItems: 'center', gap: 12 },
  actionIconBox: { width: 50, height: 50, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  actionLabel: { fontSize: 11, fontWeight: '900', textAlign: 'center' },
});

export default AdminDashboardScreen;
