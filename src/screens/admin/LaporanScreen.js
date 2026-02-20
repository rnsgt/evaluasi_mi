import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, typography, spacing, borderRadius as radius } from '../../utils/theme';
import evaluasiService from '../../services/evaluasiService';
import periodeService from '../../services/periodeService';

const LaporanScreen = () => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  
  // Filter states
  const [selectedPeriode, setSelectedPeriode] = useState(null);
  const [selectedTipe, setSelectedTipe] = useState('semua');
  const [periodeList, setPeriodeList] = useState([]);
  
  // Modal states
  const [showPeriodeModal, setShowPeriodeModal] = useState(false);
  
  const tipeOptions = [
    { value: 'semua', label: 'Semua' },
    { value: 'dosen', label: 'Dosen' },
    { value: 'fasilitas', label: 'Fasilitas' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [selectedPeriode, selectedTipe, reportData]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load periode
      const periode = await periodeService.getAllPeriode();
      setPeriodeList(periode);
      
      // Set active periode as default
      const activePeriode = periode.find((p) => p.status === 'aktif');
      if (activePeriode && !selectedPeriode) {
        setSelectedPeriode(activePeriode);
      }
      
      // Load all evaluasi
      const allEvaluasi = await evaluasiService.getAllRiwayat('all');
      
      // Calculate statistics per item
      const dosenStats = {};
      const fasilitasStats = {};
      
      allEvaluasi.forEach((evaluasi) => {
        if (evaluasi.type === 'dosen') {
          if (!dosenStats[evaluasi.dosen_id]) {
            dosenStats[evaluasi.dosen_id] = {
              id: evaluasi.dosen_id,
              nama: evaluasi.dosen_nama,
              nip: evaluasi.dosen_nip,
              type: 'dosen',
              totalNilai: 0,
              totalJawaban: 0,
              jumlahEvaluasi: 0,
            };
          }
          
          evaluasi.jawaban.forEach((jawab) => {
            dosenStats[evaluasi.dosen_id].totalNilai += jawab.nilai;
            dosenStats[evaluasi.dosen_id].totalJawaban += 1;
          });
          dosenStats[evaluasi.dosen_id].jumlahEvaluasi += 1;
        } else {
          if (!fasilitasStats[evaluasi.fasilitas_id]) {
            fasilitasStats[evaluasi.fasilitas_id] = {
              id: evaluasi.fasilitas_id,
              nama: evaluasi.fasilitas_nama,
              kode: evaluasi.fasilitas_kode,
              kategori: evaluasi.fasilitas_kategori,
              type: 'fasilitas',
              totalNilai: 0,
              totalJawaban: 0,
              jumlahEvaluasi: 0,
            };
          }
          
          evaluasi.jawaban.forEach((jawab) => {
            fasilitasStats[evaluasi.fasilitas_id].totalNilai += jawab.nilai;
            fasilitasStats[evaluasi.fasilitas_id].totalJawaban += 1;
          });
          fasilitasStats[evaluasi.fasilitas_id].jumlahEvaluasi += 1;
        }
      });
      
      // Calculate average
      const dosenReport = Object.values(dosenStats).map((item) => ({
        ...item,
        rataRata: (item.totalNilai / item.totalJawaban).toFixed(2),
      }));
      
      const fasilitasReport = Object.values(fasilitasStats).map((item) => ({
        ...item,
        rataRata: (item.totalNilai / item.totalJawaban).toFixed(2),
      }));
      
      const combined = [...dosenReport, ...fasilitasReport];
      setReportData(combined);
    } catch (error) {
      console.error('Load laporan error:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...reportData];
    
    // Filter by tipe
    if (selectedTipe !== 'semua') {
      filtered = filtered.filter((item) => item.type === selectedTipe);
    }
    
    // Sort by rating desc
    filtered.sort((a, b) => b.rataRata - a.rataRata);
    
    setFilteredData(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#4CAF50';
    if (rating >= 4.0) return '#8BC34A';
    if (rating >= 3.5) return '#FFC107';
    if (rating >= 3.0) return '#FF9800';
    return '#F44336';
  };

  const getRatingLabel = (rating) => {
    if (rating >= 4.5) return 'Sangat Baik';
    if (rating >= 4.0) return 'Baik';
    if (rating >= 3.5) return 'Cukup';
    if (rating >= 3.0) return 'Kurang';
    return 'Sangat Kurang';
  };

  const renderReportCard = ({ item }) => {
    const ratingColor = getRatingColor(parseFloat(item.rataRata));
    const ratingLabel = getRatingLabel(parseFloat(item.rataRata));
    
    return (
      <View style={styles.reportCard}>
        <View style={styles.reportHeader}>
          <View style={styles.reportIconContainer}>
            <MaterialCommunityIcons
              name={item.type === 'dosen' ? 'school' : 'office-building'}
              size={24}
              color={item.type === 'dosen' ? '#2196F3' : '#4CAF50'}
            />
          </View>
          <View style={styles.reportInfo}>
            <Text style={styles.reportNama} numberOfLines={1}>
              {item.nama}
            </Text>
            {item.type === 'dosen' ? (
              <Text style={styles.reportSubtitle}>{item.nip}</Text>
            ) : (
              <Text style={styles.reportSubtitle}>{item.kode} • {item.kategori}</Text>
            )}
          </View>
          <View style={[styles.typeBadge, { 
            backgroundColor: item.type === 'dosen' ? '#E3F2FD' : '#E8F5E9' 
          }]}>
            <Text style={[styles.typeBadgeText, {
              color: item.type === 'dosen' ? '#2196F3' : '#4CAF50'
            }]}>
              {item.type === 'dosen' ? 'Dosen' : 'Fasilitas'}
            </Text>
          </View>
        </View>
        
        <View style={styles.reportStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Rata-rata</Text>
            <View style={[styles.ratingBadge, { backgroundColor: ratingColor + '20' }]}>
              <MaterialCommunityIcons name="star" size={16} color={ratingColor} />
              <Text style={[styles.ratingValue, { color: ratingColor }]}>
                {item.rataRata}
              </Text>
            </View>
            <Text style={[styles.ratingLabel, { color: ratingColor }]}>
              {ratingLabel}
            </Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Jumlah Evaluasi</Text>
            <Text style={styles.statValue}>{item.jumlahEvaluasi}</Text>
          </View>
          
          <View style={styles.statDivider} />
          
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Total Jawaban</Text>
            <Text style={styles.statValue}>{item.totalJawaban}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderPeriodeModal = () => (
    <Modal
      visible={showPeriodeModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowPeriodeModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Pilih Periode</Text>
            <TouchableOpacity onPress={() => setShowPeriodeModal(false)}>
              <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={periodeList}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  selectedPeriode?.id === item.id && styles.modalItemActive,
                ]}
                onPress={() => {
                  setSelectedPeriode(item);
                  setShowPeriodeModal(false);
                }}
              >
                <View style={styles.modalItemContent}>
                  <Text style={styles.modalItemText}>{item.nama}</Text>
                  <Text style={styles.modalItemSubtext}>
                    {item.tanggal_mulai} s/d {item.tanggal_akhir}
                  </Text>
                </View>
                {item.status === 'aktif' && (
                  <View style={styles.aktiveBadge}>
                    <Text style={styles.aktiveBadgeText}>Aktif</Text>
                  </View>
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Memuat laporan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>ADMIN</Text>
        <Text style={styles.headerTitle}>Laporan Evaluasi</Text>
      </View>

      {/* Filters */}
      <View style={styles.filterSection}>
        {/* Periode Filter */}
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowPeriodeModal(true)}
        >
          <MaterialCommunityIcons
            name="calendar"
            size={20}
            color={colors.primary}
          />
          <Text style={styles.filterButtonText} numberOfLines={1}>
            {selectedPeriode ? selectedPeriode.nama : 'Pilih Periode'}
          </Text>
          <MaterialCommunityIcons
            name="chevron-down"
            size={20}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
        
        {/* Tipe Filter */}
        <View style={styles.tipeFilterContainer}>
          {tipeOptions.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.tipeChip,
                selectedTipe === option.value && styles.tipeChipActive,
              ]}
              onPress={() => setSelectedTipe(option.value)}
            >
              <Text
                style={[
                  styles.tipeChipText,
                  selectedTipe === option.value && styles.tipeChipTextActive,
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Summary Cards */}
      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{filteredData.length}</Text>
          <Text style={styles.summaryLabel}>Total Item</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>
            {filteredData.length > 0
              ? (
                  filteredData.reduce((sum, item) => sum + parseFloat(item.rataRata), 0) /
                  filteredData.length
                ).toFixed(2)
              : '0.00'}
          </Text>
          <Text style={styles.summaryLabel}>Rata-rata Keseluruhan</Text>
        </View>
      </View>

      {/* Report List */}
      <FlatList
        data={filteredData}
        renderItem={renderReportCard}
        keyExtractor={(item) => `${item.type}-${item.id}`}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="file-document-outline"
              size={64}
              color={colors.textDisabled}
            />
            <Text style={styles.emptyStateText}>Tidak ada data laporan</Text>
            <Text style={styles.emptyStateSubtext}>
              Coba ubah filter atau periode
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      />

      {renderPeriodeModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.base,
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  filterSection: {
    backgroundColor: colors.surface,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: radius.base,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  filterButtonText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  tipeFilterContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tipeChip: {
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
  },
  tipeChipActive: {
    backgroundColor: colors.primary,
  },
  tipeChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.medium,
  },
  tipeChipTextActive: {
    color: '#fff',
  },
  summarySection: {
    flexDirection: 'row',
    padding: spacing.base,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: spacing.base,
    borderRadius: radius.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryValue: {
    fontSize: 24,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  listContent: {
    padding: spacing.base,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: radius.base,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  reportIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reportInfo: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  reportNama: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.textPrimary,
  },
  reportSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  typeBadge: {
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  typeBadgeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },
  reportStats: {
    flexDirection: 'row',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  statDivider: {
    width: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.base,
    gap: 4,
  },
  ratingValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
  },
  ratingLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.textSecondary,
    marginTop: spacing.base,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textDisabled,
    marginTop: spacing.xs,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemActive: {
    backgroundColor: colors.primary + '10',
  },
  modalItemContent: {
    flex: 1,
  },
  modalItemText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.textPrimary,
  },
  modalItemSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
  },
  aktiveBadge: {
    backgroundColor: colors.success + '20',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  aktiveBadgeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.success,
  },
});

export default LaporanScreen;
