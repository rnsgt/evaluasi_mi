import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography, spacing, borderRadius as radius, shadows } from '../../utils/theme';

const AdminDashboardScreen = () => {
  const { user } = useAuth();

  const StatCard = ({ title, value, subtitle, icon, bgColor }) => (
    <View style={[styles.statCard, { backgroundColor: bgColor || 'white' }]}>
      <View style={styles.statIconContainer}>
        <MaterialCommunityIcons name={icon} size={24} color={colors.primary} />
      </View>
      <Text style={styles.statLabel}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>SELAMAT DATANG,</Text>
            <Text style={styles.userName}>Admin Akademik</Text>
          </View>
          <MaterialCommunityIcons name="bell-outline" size={24} color={colors.textPrimary} />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            title="Evaluasi Hari Ini"
            value="128"
            subtitle="+12% dari kemarin"
            icon="calendar-today"
            bgColor="white"
          />
          <StatCard
            title="Minggu Ini"
            value="842"
            subtitle="Sesuai Target"
            icon="calendar-week"
            bgColor="white"
          />
          <StatCard
            title="Evaluasi Dosen"
            value="4.8"
            subtitle="Skala 5.0"
            icon="account-outline"
            bgColor="white"
          />
          <StatCard
            title="Fasilitas"
            value="3.9"
            subtitle="Perlu Perhatian"
            icon="office-building-outline"
            bgColor="white"
          />
        </View>

        {/* Placeholder */}
        <View style={styles.placeholderContainer}>
          <MaterialCommunityIcons name="chart-line" size={64} color={colors.textDisabled} />
          <Text style={styles.placeholderText}>Dashboard fitur dalam pengembangan</Text>
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
    marginHorizontal: -spacing.md / 2,
  },
  statCard: {
    width: '48%',
    borderRadius: radius.md,
    padding: spacing.base,
    marginHorizontal: spacing.md / 2,
    marginBottom: spacing.md,
    elevation: 2,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
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
  placeholderContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  placeholderText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.base,
  },
});

export default AdminDashboardScreen;
