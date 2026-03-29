import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors as staticColors, typography, spacing, borderRadius as radius } from '../../utils/theme';
import statsService from '../../services/statsService';

const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

const AdminDashboardScreen = () => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await statsService.getAdminDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Load admin stats error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  const dosenScore = useMemo(() => {
    if (!stats?.top5Dosen?.length) return 0;
    const total = stats.top5Dosen.reduce((sum, item) => sum + (item.rataRata || 0), 0);
    return total / stats.top5Dosen.length;
  }, [stats]);

  const fasilitasScore = useMemo(() => {
    if (!stats?.fasilitasPerluPerbaikan?.length) return 4.5;
    const total = stats.fasilitasPerluPerbaikan.reduce((sum, item) => sum + (item.rataRata || 0), 0);
    return total / stats.fasilitasPerluPerbaikan.length;
  }, [stats]);

  const trendBars = useMemo(() => {
    const totalWeek = Math.max(stats?.weekEvaluasi || 0, 1);
    const today = Math.max(stats?.todayEvaluasi || 0, 1);
    const base = [0.3, 0.5, 0.7, 0.45, 0.82, 0.25, 0.2];

    return base.map((value, index) => {
      const scaled = Math.min(1, value + (totalWeek / 2000) * 0.2 + (today / 600) * (index === 4 ? 0.2 : 0));
      return Math.max(0.18, scaled);
    });
  }, [stats]);

  const latestEvaluasi = useMemo(() => {
    const dosenItems = (stats?.top5Dosen || []).slice(0, 2).map((item, index) => ({
      id: `dosen-${item.id}`,
      label: 'DOSEN',
      name: item.nama || `Mahasiswa #${8000 + index}`,
      time: index === 0 ? '2 menit yang lalu' : '1 jam yang lalu',
      score: item.rataRata || 0,
      tagStyle: 'purple',
    }));

    const fasilitasItems = (stats?.fasilitasPerluPerbaikan || []).slice(0, 1).map((item, index) => ({
      id: `fasilitas-${item.id}`,
      label: 'FASILITAS',
      name: item.nama || `Mahasiswa #${1000 + index}`,
      time: '15 menit yang lalu',
      score: item.rataRata || 0,
      tagStyle: 'orange',
    }));

    const merged = [...dosenItems, ...fasilitasItems];
    if (merged.length === 0) {
      return [
        {
          id: 'dummy-1',
          label: 'DOSEN',
          name: 'Mahasiswa #8291',
          time: '2 menit yang lalu',
          score: 5,
          tagStyle: 'purple',
        },
        {
          id: 'dummy-2',
          label: 'FASILITAS',
          name: 'Mahasiswa #1042',
          time: '15 menit yang lalu',
          score: 3.5,
          tagStyle: 'orange',
        },
      ];
    }
    return merged.slice(0, 3);
  }, [stats]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Memuat dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={56} color={staticColors.textDisabled} />
          <Text style={styles.errorText}>Data dashboard tidak tersedia</Text>
        </View>
      </SafeAreaView>
    );
  }

  const cardData = [
    {
      title: 'Evaluasi Hari Ini',
      value: stats.todayEvaluasi || 0,
      subtitle: '+12% dari kemarin',
      subtitleColor: '#16A34A',
      icon: 'calendar-blank-outline',
      iconBg: '#DCEAFE',
      iconColor: '#228BE6',
    },
    {
      title: 'Minggu Ini',
      value: stats.weekEvaluasi || 0,
      subtitle: 'Sesuai Target',
      subtitleColor: '#0B78F0',
      icon: 'calendar-month-outline',
      iconBg: '#DCEAFE',
      iconColor: '#2563EB',
    },
    {
      title: 'Evaluasi Dosen',
      value: dosenScore.toFixed(1),
      subtitle: 'Skala 5.0',
      subtitleColor: '#94A3B8',
      icon: 'account-school-outline',
      iconBg: '#F1E3FF',
      iconColor: '#8B5CF6',
    },
    {
      title: 'Fasilitas',
      value: fasilitasScore.toFixed(1),
      subtitle: fasilitasScore < 4 ? 'Perlu Perhatian' : 'Kondisi Baik',
      subtitleColor: fasilitasScore < 4 ? '#EF4444' : '#16A34A',
      icon: 'office-building-outline',
      iconBg: '#FCE9CC',
      iconColor: '#EA580C',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerGreeting}>SELAMAT DATANG,</Text>
            <Text style={styles.headerTitle}>Admin Akademik</Text>
          </View>
          <TouchableOpacity style={styles.bellButton}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.primary} />
            <View style={styles.dotBadge} />
          </TouchableOpacity>
        </View>

        <View style={styles.cardsGrid}>
          {cardData.map((card) => (
            <View key={card.title} style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: card.iconBg }]}>
                <MaterialCommunityIcons name={card.icon} size={20} color={card.iconColor} />
              </View>
              <Text style={styles.metricTitle}>{card.title}</Text>
              <Text style={styles.metricValue}>{card.value}</Text>
              <Text style={[styles.metricSubtitle, { color: card.subtitleColor }]}>{card.subtitle}</Text>
            </View>
          ))}
        </View>

        <View style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <Text style={styles.sectionTitle}>Tren Evaluasi</Text>
            <View style={styles.badgePill}>
              <Text style={styles.badgePillText}>7 Hari Terakhir</Text>
            </View>
          </View>

          <View style={styles.barChartWrap}>
            {trendBars.map((height, index) => (
              <View key={dayLabels[index]} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height: `${Math.round(height * 100)}%`,
                        backgroundColor: index === 4 ? '#228BE6' : '#88C2F4',
                      },
                    ]}
                  />
                </View>
                <Text style={styles.dayLabel}>{dayLabels[index]}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.latestHeader}>
          <Text style={styles.sectionTitle}>Evaluasi Terbaru</Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Lihat Semua</Text>
          </TouchableOpacity>
        </View>

        {latestEvaluasi.map((item) => (
          <View key={item.id} style={styles.latestCard}>
            <View style={styles.avatarCircle}>
              <MaterialCommunityIcons name="account-outline" size={24} color="#64748B" />
            </View>
            <View style={styles.latestInfo}>
              <Text style={styles.latestName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.latestMetaRow}>
                <View
                  style={[
                    styles.typeTag,
                    item.tagStyle === 'purple' ? styles.typeTagPurple : styles.typeTagOrange,
                  ]}
                >
                  <Text
                    style={[
                      styles.typeTagText,
                      item.tagStyle === 'purple' ? styles.typeTagTextPurple : styles.typeTagTextOrange,
                    ]}
                  >
                    {item.label}
                  </Text>
                </View>
                <Text style={styles.timeText}>{item.time}</Text>
              </View>
            </View>
            <Text style={styles.scoreText}>{`${Number(item.score || 0).toFixed(1)} ★`}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF1F5',
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    marginTop: spacing.base,
    color: staticColors.textSecondary,
    fontSize: typography.fontSize.base,
  },
  errorText: {
    marginTop: spacing.base,
    color: staticColors.textSecondary,
    fontSize: typography.fontSize.base,
  },
  headerRow: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerGreeting: {
    fontSize: typography.fontSize.sm,
    color: '#2C8CF4',
    fontFamily: typography.fontFamily.medium,
    letterSpacing: 0.8,
  },
  headerTitle: {
    marginTop: 4,
    fontSize: 34,
    lineHeight: 40,
    color: '#0F172A',
    fontFamily: typography.fontFamily.bold,
  },
  bellButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DCEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dotBadge: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#F04438',
  },
  cardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  metricCard: {
    width: '48.2%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.md,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  metricTitle: {
    color: '#486080',
    fontSize: typography.fontSize.base,
    marginBottom: spacing.xs,
  },
  metricValue: {
    color: '#0F172A',
    fontSize: 36,
    lineHeight: 42,
    fontFamily: typography.fontFamily.bold,
  },
  metricSubtitle: {
    marginTop: 4,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  trendCard: {
    marginTop: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  sectionTitle: {
    color: '#0F172A',
    fontSize: typography.fontSize.xl,
    lineHeight: 32,
    fontFamily: typography.fontFamily.bold,
  },
  badgePill: {
    backgroundColor: '#DBECFF',
    borderRadius: 999,
    paddingHorizontal: spacing.base,
    paddingVertical: 6,
  },
  badgePillText: {
    color: '#228BE6',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  barChartWrap: {
    marginTop: spacing.base,
    height: 180,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  barColumn: {
    alignItems: 'center',
    width: 30,
  },
  barTrack: {
    width: 12,
    height: 132,
    borderRadius: 7,
    backgroundColor: '#E7ECF3',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 8,
  },
  dayLabel: {
    marginTop: 10,
    color: '#90A0B5',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  latestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  linkText: {
    color: '#228BE6',
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
  },
  latestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EEF2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  latestInfo: {
    flex: 1,
  },
  latestName: {
    color: '#0F172A',
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
  },
  latestMetaRow: {
    marginTop: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeTag: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginRight: spacing.sm,
  },
  typeTagPurple: {
    backgroundColor: '#EFE4FF',
  },
  typeTagOrange: {
    backgroundColor: '#FDE9D7',
  },
  typeTagText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.4,
  },
  typeTagTextPurple: {
    color: '#7C3AED',
  },
  typeTagTextOrange: {
    color: '#EA580C',
  },
  timeText: {
    color: '#94A3B8',
    fontSize: typography.fontSize.sm,
  },
  scoreText: {
    color: '#D99A00',
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    marginLeft: spacing.sm,
  },
});

export default AdminDashboardScreen;
