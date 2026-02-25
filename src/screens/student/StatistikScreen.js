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
  const { user } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalEvaluasi: 0,
    totalDosen: 0,
    totalFasilitas: 0,
    periodeAktif: 'Semester Ganjil 2023/2024',
    achievement: null,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const riwayat = await evaluasiService.getAllRiwayat(user.id);
      
      const totalDosen = riwayat.filter((item) => item.type === 'dosen').length;
      const totalFasilitas = riwayat.filter((item) => item.type === 'fasilitas').length;
      const total = riwayat.length;

      // Determine achievement
      let achievement = null;
      if (total >= 20) {
        achievement = { icon: 'trophy', text: 'Super Aktif!', color: '#FFD700' };
      } else if (total >= 10) {
        achievement = { icon: 'star', text: 'Aktif Berpartisipasi', color: '#FFA500' };
      } else if (total >= 5) {
        achievement = { icon: 'medal', text: 'Partisipasi Baik', color: '#4CAF50' };
      }

      setStats({
        totalEvaluasi: total,
        totalDosen,
        totalFasilitas,
        periodeAktif: 'Semester Ganjil 2023/2024',
        achievement,
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
    <View style={[styles.statCard, { borderLeftColor: color, backgroundColor: colors.surface }]}>
      <View style={[styles.statIconContainer, { backgroundColor: color + '20' }]}>
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      </View>
      <View style={styles.statContent}>
        <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
        <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
      </View>
    </View>
  );

  const renderProgressBar = (label, current, total, color) => {
    const percentage = total > 0 ? (current / total) * 100 : 0;
    return (
      <View style={styles.progressItem}>
        <View style={styles.progressHeader}>
          <Text style={[styles.progressLabel, { color: colors.textPrimary }]}>{label}</Text>
          <Text style={[styles.progressValue, { color: colors.textSecondary }]}>
            {current} / {total}
          </Text>
        </View>
        <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
          <View
            style={[
              styles.progressBarFill,
              { width: `${percentage}%`, backgroundColor: color },
            ]}
          />
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Memuat statistik...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.background }]}>
          <Text style={[styles.headerSubtitle, { color: colors.primary }]}>PARTISIPASI ANDA</Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Statistik Evaluasi</Text>
        </View>

        {/* Achievement Badge */}
        {stats.achievement && (
          <View
            style={[
              styles.achievementCard,
              { backgroundColor: stats.achievement.color + '15' },
            ]}
          >
            <MaterialCommunityIcons
              name={stats.achievement.icon}
              size={48}
              color={stats.achievement.color}
            />
            <View style={styles.achievementContent}>
              <Text style={[styles.achievementTitle, { color: colors.textPrimary }]}>{stats.achievement.text}</Text>
              <Text style={[styles.achievementSubtitle, { color: colors.textSecondary }]}>
                Terima kasih atas partisipasi aktif Anda!
              </Text>
            </View>
          </View>
        )}

        {/* Main Stats Cards */}
        <View style={styles.statsGrid}>
          {renderStatCard(
            'clipboard-check',
            'Total Evaluasi',
            stats.totalEvaluasi,
            colors.primary
          )}
          {renderStatCard(
            'school',
            'Evaluasi Dosen',
            stats.totalDosen,
            '#2196F3'
          )}
          {renderStatCard(
            'office-building',
            'Evaluasi Fasilitas',
            stats.totalFasilitas,
            '#4CAF50'
          )}
        </View>

        {/* Periode Info */}
        <View style={styles.periodeCard}>
          <MaterialCommunityIcons
            name="calendar-clock"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.periodeText, { color: colors.textPrimary }]}>Periode: {stats.periodeAktif}</Text>
        </View>

        {/* Progress Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Progress Evaluasi</Text>
          <View style={[styles.progressContainer, { backgroundColor: colors.surface }]}>
            {renderProgressBar(
              'Evaluasi Dosen',
              stats.totalDosen,
              stats.totalDosen > 0 ? stats.totalDosen : 10,
              '#2196F3'
            )}
            {renderProgressBar(
              'Evaluasi Fasilitas',
              stats.totalFasilitas,
              stats.totalFasilitas > 0 ? stats.totalFasilitas : 10,
              '#4CAF50'
            )}
          </View>
        </View>

        {/* Visual Chart - Simple Bar */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Grafik Partisipasi</Text>
          <View style={[styles.chartContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.chartBars}>
              <View style={styles.barGroup}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: stats.totalDosen * 20 + 40,
                      maxHeight: 200,
                      backgroundColor: '#2196F3',
                    },
                  ]}
                />
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>Dosen</Text>
                <Text style={[styles.barValue, { color: colors.textPrimary }]}>{stats.totalDosen}</Text>
              </View>
              <View style={styles.barGroup}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: stats.totalFasilitas * 20 + 40,
                      maxHeight: 200,
                      backgroundColor: '#4CAF50',
                    },
                  ]}
                />
                <Text style={[styles.barLabel, { color: colors.textSecondary }]}>Fasilitas</Text>
                <Text style={[styles.barValue, { color: colors.textPrimary }]}>{stats.totalFasilitas}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={colors.primary}
            style={styles.infoIcon}
          />
          <Text style={[styles.infoText, { color: colors.textPrimary }]}>
            Pastikan Anda menyelesaikan semua evaluasi sebelum periode berakhir.
            Partisipasi Anda sangat berarti untuk peningkatan kualitas akademik.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    marginTop: spacing.base,
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    marginTop: spacing.xs,
  },
  achievementCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    padding: spacing.base,
    borderRadius: radius.lg,
    elevation: 2,
  },
  achievementContent: {
    flex: 1,
    marginLeft: spacing.base,
  },
  achievementTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
  },
  achievementSubtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  statsGrid: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.base,
  },
  statCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: radius.base,
    marginBottom: spacing.base,
    elevation: 2,
    borderLeftWidth: 4,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
  },
  statTitle: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.xs,
  },
  periodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    marginHorizontal: spacing.base,
    marginBottom: spacing.base,
    padding: spacing.md,
    borderRadius: radius.base,
  },
  periodeText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    marginLeft: spacing.sm,
  },
  section: {
    paddingHorizontal: spacing.base,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.base,
  },
  progressContainer: {
    padding: spacing.base,
    borderRadius: radius.base,
    elevation: 1,
  },
  progressItem: {
    marginBottom: spacing.base,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  progressValue: {
    fontSize: typography.fontSize.sm,
  },
  progressBarBg: {
    height: 10,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  chartContainer: {
    padding: spacing.base,
    borderRadius: radius.base,
    elevation: 1,
    minHeight: 240,
  },
  chartBars: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 200,
    paddingBottom: spacing.base,
  },
  barGroup: {
    alignItems: 'center',
    flex: 1,
  },
  bar: {
    width: 60,
    borderRadius: radius.base,
    minHeight: 40,
  },
  barLabel: {
    fontSize: typography.fontSize.sm,
    marginTop: spacing.sm,
    fontFamily: typography.fontFamily.medium,
  },
  barValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    marginTop: spacing.xs,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    marginHorizontal: spacing.base,
    padding: spacing.base,
    borderRadius: radius.base,
  },
  infoIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
});

export default StatistikScreen;
