import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors as staticColors, typography, spacing, borderRadius as radius, shadows } from '../../utils/theme';
import { formatDate, groupBy } from '../../utils/helpers';
import { useAuth } from '../../contexts/AuthContext';
import evaluasiService from '../../services/evaluasiService';

const RiwayatScreen = () => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('semua');
  const [riwayatData, setRiwayatData] = useState({});
  const [allData, setAllData] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [activeFilter, allData]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Get all riwayat (both dosen and fasilitas)
      const riwayat = await evaluasiService.getAllRiwayat(user.id);
      
      // Transform data to display format
      const transformedData = riwayat.map((item) => {
        if (item.type === 'dosen') {
          return {
            id: item.id,
            tanggal: item.submitted_at,
            type: 'DOSEN',
            subject: item.mata_kuliah && item.mata_kuliah.length > 0 
              ? item.mata_kuliah[0] 
              : 'Evaluasi Dosen',
            nama: item.dosen_nama,
            nip: item.dosen_nip,
            status: item.status === 'submitted' ? 'SELESAI' : 'PENDING',
            rawData: item,
          };
        } else {
          return {
            id: item.id,
            tanggal: item.submitted_at,
            type: 'FASILITAS',
            subject: item.fasilitas_nama,
            nama: item.fasilitas_kategori,
            kode: item.fasilitas_kode,
            lokasi: item.lokasi,
            status: item.status === 'submitted' ? 'SELESAI' : 'PENDING',
            rawData: item,
          };
        }
      });

      setAllData(transformedData);
    } catch (error) {
      console.error('Load riwayat error:', error);
      Alert.alert('Error', 'Gagal memuat riwayat evaluasi');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...allData];

    if (activeFilter === 'dosen') {
      filtered = filtered.filter((item) => item.type === 'DOSEN');
    } else if (activeFilter === 'fasilitas') {
      filtered = filtered.filter((item) => item.type === 'FASILITAS');
    }

    // Group by month
    const grouped = groupBy(filtered, (item) => {
      const date = new Date(item.tanggal);
      return formatDate(date, 'MMMM YYYY').toUpperCase();
    });

    setRiwayatData(grouped);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleItemPress = (item) => {
    // Show detail dialog
    const detailText = item.type === 'DOSEN'
      ? `Dosen: ${item.nama}\nNIP: ${item.nip}\nMata Kuliah: ${item.subject}\nTanggal: ${formatDate(item.tanggal)}\nJumlah Jawaban: ${item.rawData.jawaban.length}`
      : `Fasilitas: ${item.subject}\nKode: ${item.kode}\nLokasi: ${item.lokasi}\nKategori: ${item.nama}\nTanggal: ${formatDate(item.tanggal)}\nJumlah Jawaban: ${item.rawData.jawaban.length}`;

    const komentarText = item.rawData.komentar 
      ? `\n\nKomentar:\n${item.rawData.komentar}`
      : '';

    Alert.alert(
      'Detail Evaluasi',
      detailText + komentarText,
      [{ text: 'OK' }]
    );
  };

  const renderItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.itemCard} 
      activeOpacity={0.7}
      onPress={() => handleItemPress(item)}
    >
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
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Memuat riwayat...</Text>
          </View>
        ) : Object.keys(riwayatData).length > 0 ? (
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
            <Text style={styles.emptyStateSubtext}>
              Mulai evaluasi dosen atau fasilitas dari halaman beranda
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Stats Summary */}
      {!loading && allData.length > 0 && (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{allData.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {allData.filter((item) => item.type === 'DOSEN').length}
            </Text>
            <Text style={styles.statLabel}>Dosen</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {allData.filter((item) => item.type === 'FASILITAS').length}
            </Text>
            <Text style={styles.statLabel}>Fasilitas</Text>
          </View>
        </View>
      )}
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
    fontFamily: typography.fontFamily.medium,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textDisabled,
    marginTop: spacing.sm,
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
  loadingState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl * 2,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.base,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 4,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
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
