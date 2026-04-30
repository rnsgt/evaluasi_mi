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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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

  const renderStatCard = (title, value, icon, color) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.statIconBox, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statLabel}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Menyiapkan Dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.secondary]} />}
        showsVerticalScrollIndicator={false}
      >
        <ImageBackground 
          source={require('../../../assets/gedung diklat.jpg')}
          style={styles.headerCard}
          imageStyle={styles.headerCardImage}
        >
          <View style={styles.headerOverlay}>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.headerSubtitle}>PANEL ADMIN MI</Text>
                <Text style={styles.headerTitle}>Selamat Datang!</Text>
              </View>
              <View style={styles.adminBadge}>
                <Image source={require('../../../assets/logomi.png')} style={{width: 25, height: 30, borderRadius: 50, resizeMode: 'contain'}} />
              </View>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.grid}>
          <View style={styles.row}>
            {renderStatCard('Total Dosen', stats.totalDosen, 'account-tie', colors.primary)}
            {renderStatCard('Mahasiswa', stats.totalMahasiswa, 'account-group', colors.secondaryDark)}
          </View>
          <View style={styles.row}>
            {renderStatCard('Fasilitas', stats.totalFasilitas, 'office-building', colors.tertiary)}
            {renderStatCard('Total Evaluasi', stats.totalEvaluasi, 'clipboard-check', colors.success)}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>Analisis Partisipasi</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Laporan')}>
              <Text style={[styles.sectionLink, { color: colors.tertiary }]}>Detail Laporan</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.chartCard}>
            <View style={styles.participationHeader}>
              <View>
                <Text style={styles.participationValue}>{stats.partisipasi.persentase}%</Text>
                <Text style={styles.participationLabel}>Tingkat Partisipasi Mahasiswa</Text>
              </View>
              <MaterialCommunityIcons name="trending-up" size={32} color="#10B981" />
            </View>
            
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBarFill, { width: `${stats.partisipasi.persentase}%` }]} />
            </View>
            
            <View style={styles.participationFooter}>
              <Text style={styles.participationSubtext}>
                {stats.partisipasi.uniqueMahasiswa} dari {stats.totalMahasiswa} mahasiswa telah berpartisipasi
              </Text>
            </View>

            <View style={styles.typeDistribution}>
              <View style={styles.typeItem}>
                <View style={[styles.typeDot, { backgroundColor: colors.primary }]} />
                <Text style={styles.typeLabel}>Dosen: {stats.evaluasiDosen}</Text>
              </View>
              <View style={styles.typeItem}>
                <View style={[styles.typeDot, { backgroundColor: colors.tertiary }]} />
                <Text style={styles.typeLabel}>Fasilitas: {stats.evaluasiFasilitas}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary, marginBottom: 16 }]}>Aksi Cepat</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Periode')}>
              <MaterialCommunityIcons name="calendar-plus" size={24} color={colors.primary} />
              <Text style={styles.actionBtnText}>Periode</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Dosen')}>
              <MaterialCommunityIcons name="account-tie-outline" size={24} color={colors.secondaryDark} />
              <Text style={styles.actionBtnText}>Dosen</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Fasilitas')}>
              <MaterialCommunityIcons name="office-building-cog" size={24} color={colors.tertiary} />
              <Text style={styles.actionBtnText}>Fasilitas</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#64748B', fontWeight: '500' },
  scrollContent: { padding: 24, paddingTop: 16 },
  headerCard: { width: '100%', minHeight: 140, marginBottom: 32, borderRadius: 28, overflow: 'hidden', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
  headerCardImage: { resizeMode: 'cover' },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 60, 89, 0.8)', padding: 24, justifyContent: 'center' },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerSubtitle: { fontSize: 12, color: '#FFC107', fontWeight: 'bold', letterSpacing: 1.5 },
  headerTitle: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', marginTop: 4 },
  adminBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, elevation: 4 },
  adminBadgeText: { color: '#0F3C59', fontSize: 10, fontWeight: 'bold', marginLeft: 6 },
  grid: { marginBottom: 32 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  statCard: { width: (width - 64) / 2, backgroundColor: '#FFF', borderRadius: 20, padding: 16, borderLeftWidth: 5, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10 },
  statIconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  statContent: {},
  statLabel: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', marginTop: 2 },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  sectionLink: { fontSize: 13, color: '#2563EB', fontWeight: '600' },
  chartCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, elevation: 2 },
  participationHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  participationValue: { fontSize: 32, fontWeight: 'bold', color: '#0F172A' },
  participationLabel: { fontSize: 13, color: '#64748B', marginTop: 4 },
  progressBarContainer: { height: 12, backgroundColor: '#F1F5F9', borderRadius: 6, overflow: 'hidden', marginBottom: 16 },
  progressBarFill: { height: '100%', backgroundColor: '#10B981', borderRadius: 6 },
  participationFooter: { marginBottom: 20 },
  participationSubtext: { fontSize: 12, color: '#94A3B8', fontStyle: 'italic' },
  typeDistribution: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16 },
  typeItem: { flexDirection: 'row', alignItems: 'center', marginRight: 24 },
  typeDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  typeLabel: { fontSize: 12, color: '#475569', fontWeight: '600' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between' },
  actionBtn: { width: (width - 64) / 3, backgroundColor: '#FFF', padding: 16, borderRadius: 20, alignItems: 'center', elevation: 2 },
  actionBtnText: { marginTop: 8, fontSize: 11, fontWeight: 'bold', color: '#1E293B' },
});

export default AdminDashboardScreen;
