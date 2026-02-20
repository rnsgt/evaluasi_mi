import React, { useState, useEffect } from 'react';
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
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography, spacing, borderRadius as radius, shadows } from '../../utils/theme';
import statsService from '../../services/statsService';

const AdminDashboardScreen = () => {
  const { user } = useAuth();
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

  const StatCard = ({ title, value, subtitle, icon, bgColor, iconColor }) => (
    <View style={[styles.statCard, { backgroundColor: bgColor || 'white' }]}>
      <View style={[styles.statIconContainer, { backgroundColor: iconColor + '20' }]}>
        <MaterialCommunityIcons name={icon} size={24} color={iconColor || colors.primary} />
      </View>
      <Text style={styles.statLabel}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const TopDosenCard = ({ dosen, rank }) => (
    <View style={styles.topDosenCard}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>#{rank}</Text>
      </View>
      <View style={styles.topDosenInfo}>
        <Text style={styles.topDosenNama} numberOfLines={1}>
          {dosen.nama}
        </Text>
        <Text style={styles.topDosenNip}>{dosen.nip}</Text>
      </View>
      <View style={styles.ratingContainer}>
        <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
        <Text style={styles.ratingText}>{dosen.rataRata}</Text>
      </View>
    </View>
  );

  const FasilitasPerluPerbaikanCard = ({ fasilitas }) => (
    <View style={styles.fasilitasCard}>
      <View style={styles.fasilitasIcon}>
        <MaterialCommunityIcons
          name="alert-circle"
          size={20}
          color="#FF9800"
        />
      </View>
      <View style={styles.fasilitasInfo}>
        <Text style={styles.fasilitasNama} numberOfLines={1}>
          {fasilitas.nama}
        </Text>
        <Text style={styles.fasilitasKode}>{fasilitas.kode}</Text>
      </View>
      <View style={[styles.ratingContainer, { backgroundColor: '#FFEBEE' }]}>
        <Text style={[styles.ratingText, { color: '#F44336' }]}>
          {fasilitas.rataRata}
        </Text>
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

  if (!stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={64}
            color={colors.textDisabled}
          />
          <Text style={styles.errorText}>Gagal memuat data</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>SELAMAT DATANG,</Text>
            <Text style={styles.userName}>Admin Akademik</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <MaterialCommunityIcons
              name="bell-outline"
              size={24}
              color={colors.textPrimary}
            />
            {stats.todayEvaluasi > 0 && <View style={styles.notificationBadge} />}
          </TouchableOpacity>
        </View>

        {/* Main Stats Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Total Evaluasi"
            value={stats.totalEvaluasi.toString()}
            subtitle="Semua periode"
            icon="clipboard-check"
            bgColor="white"
            iconColor={colors.primary}
          />
          <StatCard
            title="Hari Ini"
            value={stats.todayEvaluasi.toString()}
            subtitle={`${stats.weekEvaluasi} minggu ini`}
            icon="calendar-today"
            bgColor="white"
            iconColor="#2196F3"
          />
          <StatCard
            title="Evaluasi Dosen"
            value={stats.evaluasiDosen.toString()}
            subtitle={`${((stats.evaluasiDosen / stats.totalEvaluasi) * 100).toFixed(0)}% dari total`}
            icon="school"
            bgColor="white"
            iconColor="#4CAF50"
          />
          <StatCard
            title="Evaluasi Fasilitas"
            value={stats.evaluasiFasilitas.toString()}
            subtitle={`${((stats.evaluasiFasilitas / stats.totalEvaluasi) * 100).toFixed(0)}% dari total`}
            icon="office-building"
            bgColor="white"
            iconColor="#FF9800"
          />
        </View>

        {/* Participation Card */}
        <View style={styles.participationCard}>
          <View style={styles.participationHeader}>
            <Text style={styles.participationTitle}>Tingkat Partisipasi</Text>
            <MaterialCommunityIcons
              name="account-group"
              size={24}
              color={colors.primary}
            />
          </View>
          <View style={styles.participationStats}>
            <View style={styles.participationItem}>
              <Text style={styles.participationValue}>{stats.participationRate}%</Text>
              <Text style={styles.participationLabel}>Partisipasi</Text>
            </View>
            <View style={styles.participationDivider} />
            <View style={styles.participationItem}>
              <Text style={styles.participationValue}>{stats.uniqueMahasiswa}</Text>
              <Text style={styles.participationLabel}>Mahasiswa Aktif</Text>
            </View>
            <View style={styles.participationDivider} />
            <View style={styles.participationItem}>
              <Text style={styles.participationValue}>{stats.totalMahasiswa}</Text>
              <Text style={styles.participationLabel}>Total Mahasiswa</Text>
            </View>
          </View>
        </View>

        {/* Top 5 Dosen */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top 5 Dosen</Text>
            <MaterialCommunityIcons name="trophy" size={20} color="#FFD700" />
          </View>
          {stats.top5Dosen.length > 0 ? (
            stats.top5Dosen.map((dosen, index) => (
              <TopDosenCard key={dosen.id} dosen={dosen} rank={index + 1} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>Belum ada data evaluasi dosen</Text>
            </View>
          )}
        </View>

        {/* Fasilitas Perlu Perbaikan */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fasilitas Perlu Perbaikan</Text>
            <MaterialCommunityIcons name="alert" size={20} color="#FF9800" />
          </View>
          {stats.fasilitasPerluPerbaikan.length > 0 ? (
            stats.fasilitasPerluPerbaikan.map((fasilitas) => (
              <FasilitasPerluPerbaikanCard key={fasilitas.id} fasilitas={fasilitas} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="check-circle"
                size={48}
                color={colors.success}
              />
              <Text style={styles.emptyStateText}>
                Semua fasilitas dalam kondisi baik!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.base,
  },
  errorText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.base,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  notificationButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.xs,
  },
  statCard: {
    width: '48%',
    borderRadius: radius.md,
    padding: spacing.base,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.md,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.success,
  },
  participationCard: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.lg,
    elevation: 2,
  },
  participationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  participationTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  participationStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  participationItem: {
    flex: 1,
    alignItems: 'center',
  },
  participationValue: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  participationLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  participationDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  topDosenCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.base,
    borderRadius: radius.base,
    marginBottom: spacing.sm,
    elevation: 1,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  rankText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  topDosenInfo: {
    flex: 1,
  },
  topDosenNama: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  topDosenNip: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E1',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginLeft: 4,
  },
  fasilitasCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.base,
    borderRadius: radius.base,
    marginBottom: spacing.sm,
    elevation: 1,
  },
  fasilitasIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFF3E0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  fasilitasInfo: {
    flex: 1,
  },
  fasilitasNama: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  fasilitasKode: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
    backgroundColor: colors.background,
    borderRadius: radius.base,
  },
  emptyStateText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

export default AdminDashboardScreen;
