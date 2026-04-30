import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors as staticColors, typography, spacing, borderRadius as radius } from '../../utils/theme';
import { useAuth } from '../../contexts/AuthContext';
import evaluasiService from '../../services/evaluasiService';

const StatistikScreen = () => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalEvaluasi: 0,
    totalDosen: 0,
    totalFasilitas: 0,
    participationData: [],
    periodeAktif: 'Tidak ada periode aktif',
    achievement: null,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const statsData = await evaluasiService.getStatistik();
      setStats({
        totalEvaluasi: statsData.totalEvaluasi || 0,
        totalDosen: statsData.totalDosen || 0,
        totalFasilitas: statsData.totalFasilitas || 0,
        participationData: statsData.participationData || [],
        periodeAktif: statsData.periodeAktif || 'Tidak ada periode aktif',
        achievement: statsData.achievement || null,
      });
    } catch (error) {
      console.error('Load stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const renderStatCard = (icon, title, value, color) => (
    <View style={[styles.statCard, { borderLeftColor: color, backgroundColor: '#FFFFFF' }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statTitle}>{title}</Text>
        <Text style={styles.statValue}>{value}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Memuat statistik...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>RINGKASAN AKTIVITAS</Text>
          <Text style={styles.headerTitle}>Statistik Anda</Text>
        </View>

        {stats.achievement && (
          <View style={[styles.achievementCard, { backgroundColor: stats.achievement.color + '10' }]}>
            <View style={[styles.trophyContainer, { backgroundColor: stats.achievement.color + '20' }]}>
              <MaterialCommunityIcons name={stats.achievement.icon} size={32} color={stats.achievement.color} />
            </View>
            <View style={styles.achievementContent}>
              <Text style={styles.achievementTitle}>{stats.achievement.text}</Text>
              <Text style={styles.achievementSubtitle}>Terima kasih telah berkontribusi!</Text>
            </View>
          </View>
        )}

        <View style={styles.statsGrid}>
          {renderStatCard('check-circle-outline', 'Total Evaluasi', stats.totalEvaluasi, colors.primary)}
          <View style={styles.statsRow}>
            <View style={{ flex: 1, marginRight: 8 }}>
              {renderStatCard('account-school-outline', 'Dosen', stats.totalDosen, '#8B5CF6')}
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              {renderStatCard('office-building-outline', 'Fasilitas', stats.totalFasilitas, '#EA580C')}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Grafik Partisipasi</Text>
            <View style={styles.periodeBadge}>
              <Text style={styles.periodeBadgeText}>{stats.periodeAktif}</Text>
            </View>
          </View>
          
          <View style={styles.chartCard}>
            <View style={styles.chartBars}>
              {stats.participationData.map((item, idx) => {
                const percentage = item.total > 0 ? (item.completed / item.total) : 0;
                const barColor = item.label === 'Dosen' ? '#8B5CF6' : '#EA580C';
                return (
                  <View key={item.label} style={styles.barColumn}>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { height: `${Math.max(10, percentage * 100)}%`, backgroundColor: barColor }]} />
                    </View>
                    <Text style={styles.barLabel}>{item.label}</Text>
                    <Text style={styles.barCount}>{item.completed}/{item.total}</Text>
                  </View>
                );
              })}
            </View>
            
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
                <Text style={styles.legendText}>Evaluasi Dosen</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#EA580C' }]} />
                <Text style={styles.legendText}>Evaluasi Fasilitas</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.infoBox}>
          <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#0B78F0" />
          <Text style={styles.infoBoxText}>
            Lengkapi semua evaluasi untuk membantu kami meningkatkan kualitas layanan dan pengajaran.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  scrollContent: { paddingBottom: 40 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#64748B' },
  header: { padding: 20 },
  headerSubtitle: { color: '#2563EB', fontWeight: 'bold', letterSpacing: 1 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#0F172A', marginTop: 4 },
  achievementCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 20, padding: 16, borderRadius: 20 },
  trophyContainer: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  achievementContent: { flex: 1 },
  achievementTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  achievementSubtitle: { fontSize: 13, color: '#64748B', marginTop: 2 },
  statsGrid: { paddingHorizontal: 20, marginBottom: 24 },
  statsRow: { flexDirection: 'row', marginTop: 16 },
  statCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  statIconContainer: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  statContent: { flex: 1 },
  statTitle: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  statValue: { fontSize: 22, fontWeight: 'bold', color: '#0F172A', marginTop: 2 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  periodeBadge: { backgroundColor: '#DBECFF', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99 },
  periodeBadgeText: { fontSize: 11, color: '#2563EB', fontWeight: 'bold' },
  chartCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, elevation: 2 },
  chartBars: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 160, marginBottom: 20 },
  barColumn: { alignItems: 'center', width: 80 },
  barTrack: { width: 16, height: 120, backgroundColor: '#F1F5F9', borderRadius: 8, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 8 },
  barLabel: { marginTop: 12, fontSize: 13, fontWeight: 'bold', color: '#0F172A' },
  barCount: { fontSize: 11, color: '#64748B', marginTop: 2 },
  legendRow: { flexDirection: 'row', justifyContent: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 10 },
  legendDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  legendText: { fontSize: 11, color: '#64748B' },
  infoBox: { flexDirection: 'row', marginHorizontal: 20, padding: 16, backgroundColor: '#E0F2FE', borderRadius: 16, alignItems: 'center' },
  infoBoxText: { flex: 1, marginLeft: 12, fontSize: 13, color: '#0369A1', lineHeight: 18 },
});

export default StatistikScreen;
