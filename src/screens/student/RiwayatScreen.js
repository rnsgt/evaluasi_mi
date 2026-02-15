import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius as radius, shadows } from '../../utils/theme';
import { formatDate, groupBy } from '../../utils/helpers';

const RiwayatScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('semua');
  const [riwayatData, setRiwayatData] = useState({});

  useEffect(() => {
    loadData();
  }, [activeFilter]);

  const loadData = async () => {
    try {
      // TODO: Fetch from API
      // const response = await evaluasiService.getRiwayat(activeFilter);
      
      // Dummy data for now
      const dummyData = [
        {
          id: 1,
          tanggal: '2023-11-14',
          type: 'DOSEN',
          subject: 'Pemrograman Web',
          nama: 'Dr. Ir. Budi Santoso, M.Kom',
          status: 'SELESAI',
        },
        {
          id: 2,
          tanggal: '2023-11-10',
          type: 'FASILITAS',
          subject: 'Perpustakaan Pusat',
          nama: 'Kenyamanan & Kelengkapan Buku',
          status: 'SELESAI',
        },
        {
          id: 3,
          tanggal: '2023-10-28',
          type: 'DOSEN',
          subject: 'Basis Data',
          nama: 'Prof. Siti Aminah',
          status: 'SELESAI',
        },
      ];

      // Group by month
      const grouped = groupBy(dummyData, (item) => {
        const date = new Date(item.tanggal);
        return formatDate(date, 'MMMM YYYY').toUpperCase();
      });

      setRiwayatData(grouped);
    } catch (error) {
      console.error('Load riwayat error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderItem = (item) => (
    <TouchableOpacity key={item.id} style={styles.itemCard} activeOpacity={0.7}>
      <View style={styles.itemIndicator} />
      <View style={styles.itemContent}>
        <Text style={styles.itemDate}>{formatDate(item.tanggal)}</Text>
        <View style={styles.statusBadge}>
          <MaterialCommunityIcons name="check-circle" size={16} color={colors.success} style={styles.statusIcon} />
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
        <View style={styles.itemInfo}>
          <View
            style={[
              styles.chip,
              styles.itemInfoIcon,
              { backgroundColor: item.type === 'DOSEN' ? '#E3F2FD' : '#E8F5E9' },
            ]}
          >
            <Text style={styles.chipText}>{item.type}</Text>
          </View>
          <Text style={[styles.itemSubject, styles.itemInfoText]}>{item.subject}</Text>
        </View>
        <Text style={styles.itemName}>{item.nama}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>AKADEMIK</Text>
        <Text style={styles.headerTitle}>Riwayat Evaluasi</Text>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          onPress={() => setActiveFilter('semua')}
          style={[styles.filterChip, activeFilter === 'semua' && styles.filterChipActive]}
        >
          <Text style={[styles.filterChipText, activeFilter === 'semua' && styles.filterChipTextActive]}>
            Semua
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveFilter('dosen')}
          style={[styles.filterChip, activeFilter === 'dosen' && styles.filterChipActive]}
        >
          <Text style={[styles.filterChipText, activeFilter === 'dosen' && styles.filterChipTextActive]}>
            Dosen
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveFilter('fasilitas')}
          style={[styles.filterChip, activeFilter === 'fasilitas' && styles.filterChipActive]}
        >
          <Text style={[styles.filterChipText, activeFilter === 'fasilitas' && styles.filterChipTextActive]}>
            Fasilitas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {Object.keys(riwayatData).length > 0 ? (
          Object.keys(riwayatData).map((month) => (
            <View key={month}>
              <Text style={styles.monthLabel}>{month}</Text>
              {riwayatData[month].map(renderItem)}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={colors.textDisabled} />
            <Text style={styles.emptyStateText}>Belum ada riwayat evaluasi</Text>
          </View>
        )}
      </ScrollView>

      {/* FAB - Floating Action Button */}
      <TouchableOpacity style={styles.fab}>
        <MaterialCommunityIcons name="pencil" size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
    backgroundColor: colors.background,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  filterChip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    minWidth: 80,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
  },
  filterChipTextActive: {
    color: 'white',
    fontFamily: typography.fontFamily.medium,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
  },
  monthLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    letterSpacing: 0.5,
    marginBottom: spacing.md,
    marginTop: spacing.base,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: radius.md,
    padding: spacing.base,
    marginBottom: spacing.md,
    elevation: 2,
  },
  itemIndicator: {
    width: 4,
    backgroundColor: colors.primary,
    borderRadius: 2,
    marginRight: spacing.md,
  },
  itemContent: {
    flex: 1,
  },
  itemDate: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    marginBottom: spacing.sm,
  },
  statusIcon: {
    marginRight: spacing.xs,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    color: colors.success,
    fontFamily: typography.fontFamily.medium,
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  itemInfoIcon: {
    marginRight: spacing.sm,
  },
  itemInfoText: {
    marginRight: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  chipText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  itemSubject: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    flex: 1,
  },
  itemName: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.base,
  },
  fab: {
    position: 'absolute',
    right: spacing.base,
    bottom: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
  },
});

export default RiwayatScreen;
