import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Rect, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import evaluasiService from '../../services/evaluasiService';

const { width } = Dimensions.get('window');

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
    <View style={[styles.statCard, { backgroundColor: colors.surface }, colors.shadowSoft]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={24} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
        <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
      </View>
    </View>
  );

  const DecorativeBackground = () => (
    <View style={StyleSheet.absoluteFill}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Circle cx={width} cy="200" r="100" fill={colors.primary + '08'} />
        <Path d="M0 450 Q 50 400 100 450 T 200 450" fill="none" stroke={colors.secondary + '05'} strokeWidth="40" />
        <Rect x={width - 60} y="700" width="100" height="100" rx="20" transform="rotate(30)" fill={colors.tertiary + '05'} />
      </Svg>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Memuat statistik...</Text>
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
        <View style={[styles.headerSection, { backgroundColor: colors.primaryDark }]}>
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            <Circle cx="0" cy="0" r="120" fill="rgba(255,255,255,0.05)" />
            <Circle cx={width} cy="40" r="90" fill="rgba(255,255,255,0.03)" />
          </Svg>
          <Text style={styles.headerSubtitle}>PERFORMA EVALUASI</Text>
          <Text style={styles.headerTitle}>Statistik Partisipasi</Text>
          
          {stats.achievement && (
            <View style={[styles.achievementBadge, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
              <MaterialCommunityIcons name={stats.achievement.icon} size={20} color="#FFD700" />
              <Text style={styles.achievementBadgeText}>{stats.achievement.text}</Text>
            </View>
          )}
        </View>

        <View style={styles.bodyContent}>
          <View style={styles.statsGrid}>
            <View style={styles.fullRow}>
              {renderStatCard('check-decagram-outline', 'Total Evaluasi Dikirim', stats.totalEvaluasi, colors.success)}
            </View>
            <View style={styles.statsRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                {renderStatCard('account-tie-outline', 'Dosen', stats.totalDosen, colors.secondaryDark)}
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                {renderStatCard('office-building-outline', 'Fasilitas', stats.totalFasilitas, colors.tertiary)}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>PROGRES PERIODE INI</Text>
              <View style={[styles.periodeBadge, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[styles.periodeBadgeText, { color: colors.primary }]}>{stats.periodeAktif}</Text>
              </View>
            </View>
            
            <View style={[styles.chartCard, { backgroundColor: colors.surface }, colors.shadowSoft]}>
              <View style={styles.chartBars}>
                {stats.participationData.map((item, idx) => {
                  const percentage = item.total > 0 ? (item.completed / item.total) : 0;
                  const barColor = item.label === 'Dosen' ? colors.secondaryDark : colors.tertiary;
                  return (
                    <View key={item.label} style={styles.barColumn}>
                      <View style={[styles.barTrack, { backgroundColor: colors.background }]}>
                        <View style={[styles.barFill, { height: `${Math.max(5, percentage * 100)}%`, backgroundColor: barColor }]}>
                          <LinearGradient id={`grad-${idx}`} x1="0" y1="0" x2="0" y2="1">
                            <Stop offset="0" stopColor={barColor} stopOpacity="1" />
                            <Stop offset="1" stopColor={barColor} stopOpacity="0.7" />
                          </LinearGradient>
                        </View>
                      </View>
                      <Text style={[styles.barLabel, { color: colors.textPrimary }]}>{item.label}</Text>
                      <Text style={[styles.barCount, { color: colors.textDisabled }]}>{item.completed}/{item.total}</Text>
                    </View>
                  );
                })}
              </View>
              
              <View style={[styles.legendRow, { borderTopColor: colors.border }]}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.secondaryDark }]} />
                  <Text style={[styles.legendText, { color: colors.textSecondary }]}>Evaluasi Dosen</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.tertiary }]} />
                  <Text style={[styles.legendText, { color: colors.textSecondary }]}>Evaluasi Fasilitas</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.infoBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '20' }]}>
            <View style={[styles.infoIconBox, { backgroundColor: colors.primary }]}>
              <MaterialCommunityIcons name="lightbulb-on" size={18} color="#FFF" />
            </View>
            <Text style={[styles.infoBoxText, { color: colors.textPrimary }]}>
              Partisipasi Anda sangat berharga untuk peningkatan mutu akademik dan fasilitas kampus.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 60 },
  loadingWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontWeight: '600' },
  headerSection: { padding: 32, paddingTop: 60, borderBottomLeftRadius: 50, borderBottomRightRadius: 50, overflow: 'hidden' },
  headerSubtitle: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '900', letterSpacing: 2 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginTop: 4 },
  achievementBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 24 },
  achievementBadgeText: { fontSize: 12, fontWeight: '800', color: '#FFF' },
  
  bodyContent: { padding: 24, marginTop: 10 },
  statsGrid: { marginBottom: 32 },
  fullRow: { marginBottom: 16 },
  statsRow: { flexDirection: 'row' },
  statCard: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 28 },
  statIconContainer: { width: 50, height: 50, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  statContent: { flex: 1 },
  statTitle: { fontSize: 11, fontWeight: 'bold' },
  statValue: { fontSize: 22, fontWeight: '900', marginTop: 2 },
  
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, marginLeft: 8 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  periodeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginLeft: 'auto' },
  periodeBadgeText: { fontSize: 10, fontWeight: 'bold' },
  
  chartCard: { borderRadius: 35, padding: 24 },
  chartBars: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 160, marginBottom: 24 },
  barColumn: { alignItems: 'center', width: 80 },
  barTrack: { width: 24, height: 120, borderRadius: 12, justifyContent: 'flex-end', overflow: 'hidden' },
  barFill: { width: '100%', borderRadius: 12 },
  barLabel: { marginTop: 12, fontSize: 14, fontWeight: '800' },
  barCount: { fontSize: 12, marginTop: 2, fontWeight: '600' },
  legendRow: { flexDirection: 'row', justifyContent: 'center', borderTopWidth: 1, paddingTop: 20, gap: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 12, fontWeight: '600' },
  
  infoBox: { flexDirection: 'row', padding: 20, borderRadius: 28, alignItems: 'center', borderWidth: 1 },
  infoIconBox: { width: 32, height: 32, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  infoBoxText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 20 },
});

export default StatistikScreen;
