import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors as staticColors, typography, spacing, borderRadius as radius } from '../../utils/theme';
import adminService from '../../services/adminService';
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
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  
  const tipeOptions = [
    { value: 'semua', label: 'Semua' },
    { value: 'dosen', label: 'Dosen' },
    { value: 'fasilitas', label: 'Fasilitas' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    // Reload data when filters change
    if (periodeList.length > 0) {
      loadData();
    }
  }, [selectedPeriode, selectedTipe]);

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
      
      // Load laporan from backend API
      const filters = {};
      if (selectedPeriode) {
        filters.periode_id = selectedPeriode.id;
      }
      if (selectedTipe !== 'semua') {
        filters.tipe = selectedTipe;
      }
      
      const laporan = await adminService.getLaporan(filters);
      
      // Transform backend data to match frontend format
      const dosenReport = (laporan.dosen || []).map((item) => ({
        id: item.id,
        nama: item.nama,
        nip: item.nip,
        type: 'dosen',
        rataRata: parseFloat(item.rata_rata) || 0,
        jumlahEvaluasi: parseInt(item.jumlah_evaluasi) || 0,
        totalJawaban: parseInt(item.total_jawaban) || 0,
        detailKategori: (item.detail_kategori || []).map((detail) => ({
          kategori: detail.kategori,
          rataRata: parseFloat(detail.rata_rata) || 0,
          totalJawaban: parseInt(detail.total_jawaban) || 0,
        })),
        komentarList: (item.komentar_list || [])
          .map((comment) => ({
            komentar: comment.komentar,
            submittedAt: comment.submitted_at,
          }))
          .filter((comment) => comment.komentar),
        detailEvaluasi: (item.detail_evaluasi || []).map((detail) => ({
          id: detail.id,
          submittedAt: detail.submitted_at,
          komentar: detail.komentar,
          mahasiswaNama: detail.mahasiswa_nama,
          mahasiswaNim: detail.mahasiswa_nim,
          rataRata: parseFloat(detail.rata_rata) || 0,
          jumlahJawaban: parseInt(detail.jumlah_jawaban) || 0,
        })),
      }));
      
      const fasilitasReport = (laporan.fasilitas || []).map((item) => ({
        id: item.id,
        nama: item.nama,
        kode: item.kode,
        kategori: item.kategori,
        lokasi: item.lokasi,
        type: 'fasilitas',
        rataRata: parseFloat(item.rata_rata) || 0,
        jumlahEvaluasi: parseInt(item.jumlah_evaluasi) || 0,
        totalJawaban: parseInt(item.total_jawaban) || 0,
        detailKategori: (item.detail_kategori || []).map((detail) => ({
          kategori: detail.kategori,
          rataRata: parseFloat(detail.rata_rata) || 0,
          totalJawaban: parseInt(detail.total_jawaban) || 0,
        })),
        komentarList: (item.komentar_list || [])
          .map((comment) => ({
            komentar: comment.komentar,
            submittedAt: comment.submitted_at,
          }))
          .filter((comment) => comment.komentar),
        detailEvaluasi: (item.detail_evaluasi || []).map((detail) => ({
          id: detail.id,
          submittedAt: detail.submitted_at,
          komentar: detail.komentar,
          mahasiswaNama: detail.mahasiswa_nama,
          mahasiswaNim: detail.mahasiswa_nim,
          rataRata: parseFloat(detail.rata_rata) || 0,
          jumlahJawaban: parseInt(detail.jumlah_jawaban) || 0,
        })),
      }));
      
      const combined = [...dosenReport, ...fasilitasReport];
      setReportData(combined);
      setFilteredData(combined);
    } catch (error) {
      console.error('Load laporan error:', error);
    } finally {
      setLoading(false);
    }
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

  const toDisplayText = (value) => {
    if (value === null || value === undefined) return '-';
    if (typeof value === 'string' || typeof value === 'number') return String(value);

    if (typeof value === 'object') {
      if (value.nama) return String(value.nama);
      if (value.kode) return String(value.kode);
      return JSON.stringify(value);
    }

    return String(value);
  };

  const getKomentarExport = (item) => {
    const comments = (item.komentarList || [])
      .map((entry) => String(entry.komentar || '').trim())
      .filter((value) => value.length > 0);

    return comments.length > 0 ? comments.join(' | ') : '-';
  };

  const getMappedKategori = (detailKategori = [], targetType) => {
    const mapped = {};

    if (targetType === 'dosen') {
      mapped['PENGUASAAN MATERI'] = '';
      mapped['METODE PENGAJARAN'] = '';
      mapped['KOMUNIKASI'] = '';
      mapped['PENILAIAN'] = '';
      mapped['KEDISIPLINAN'] = '';

      detailKategori.forEach((detail) => {
        const category = String(detail.kategori || '').toUpperCase();
        const value = detail.rataRata;

        if (category.includes('PERSIAPAN') || category.includes('PENGUASAAN')) {
          mapped['PENGUASAAN MATERI'] = value;
        } else if (category.includes('PENYAMPAIAN') || category.includes('METODE')) {
          mapped['METODE PENGAJARAN'] = value;
        } else if (category.includes('INTERAKSI') || category.includes('KOMUNIKASI')) {
          mapped['KOMUNIKASI'] = value;
        } else if (category.includes('EVALUASI') || category.includes('PENILAIAN')) {
          mapped['PENILAIAN'] = value;
        } else if (category.includes('SIKAP') || category.includes('ETIKA') || category.includes('DISIPLIN')) {
          mapped['KEDISIPLINAN'] = value;
        }
      });
    }

    if (targetType === 'fasilitas') {
      mapped['AKSESIBILITAS'] = '';
      mapped['KEBERSIHAN'] = '';
      mapped['KELENGKAPAN'] = '';
      mapped['KENYAMANAN'] = '';

      detailKategori.forEach((detail) => {
        const category = String(detail.kategori || '').toUpperCase();
        const value = detail.rataRata;

        if (category.includes('AKSES')) {
          mapped['AKSESIBILITAS'] = value;
        } else if (category.includes('BERSIH')) {
          mapped['KEBERSIHAN'] = value;
        } else if (category.includes('LENGKAP')) {
          mapped['KELENGKAPAN'] = value;
        } else if (category.includes('NYAMAN')) {
          mapped['KENYAMANAN'] = value;
        }
      });
    }

    return mapped;
  };

  const handleExportReport = async () => {
    try {
      if (filteredData.length === 0) {
        Alert.alert('Tidak Ada Data', 'Belum ada data laporan yang bisa diunduh.');
        return;
      }

      const isSharingAvailable = await Sharing.isAvailableAsync();
      if (!isSharingAvailable) {
        Alert.alert('Tidak Didukung', 'Perangkat ini tidak mendukung berbagi file laporan.');
        return;
      }

      // Separate dosen and fasilitas
      const dosenData = filteredData.filter((item) => item.type === 'dosen');
      const fasilitasData = filteredData.filter((item) => item.type === 'fasilitas');

      let csvContent = '';

      // TABEL DOSEN
      if (dosenData.length > 0) {
        csvContent += 'TABEL DOSEN\n\n';
        const dosenHeader = [
          'NO',
          'TIPE',
          'NAMA DOSEN',
          'PENGUASAAN MATERI',
          'METODE PENGAJARAN',
          'KOMUNIKASI',
          'PENILAIAN',
          'KEDISIPLINAN',
          'RATA-RATA',
          'JUMLAH EVALUASI',
          'KOMENTAR',
        ];

        const dosenRows = dosenData.map((item, index) => {
          const kategoriMap = getMappedKategori(item.detailKategori, 'dosen');

          return [
            index + 1,
            'DOSEN',
            item.nama,
            kategoriMap['PENGUASAAN MATERI'] || '',
            kategoriMap['METODE PENGAJARAN'] || '',
            kategoriMap['KOMUNIKASI'] || '',
            kategoriMap['PENILAIAN'] || '',
            kategoriMap['KEDISIPLINAN'] || '',
            item.rataRata,
            item.jumlahEvaluasi,
            getKomentarExport(item),
          ];
        });

        csvContent += dosenHeader
          .map((value) => `"${value}"`)
          .join(',') + '\n';
        csvContent += dosenRows
          .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
          .join('\n') + '\n\n';
      }

      // TABEL FASILITAS
      if (fasilitasData.length > 0) {
        csvContent += 'TABEL FASILITAS\n\n';
        const fasilitasHeader = [
          'NO',
          'TIPE',
          'NAMA',
          'AKSESIBILITAS',
          'KEBERSIHAN',
          'KELENGKAPAN',
          'KENYAMANAN',
          'RATA-RATA',
          'JUMLAH EVALUASI',
          'KOMENTAR',
        ];

        const fasilitasRows = fasilitasData.map((item, index) => {
          const kategoriMap = getMappedKategori(item.detailKategori, 'fasilitas');

          return [
            index + 1,
            'FASILITAS',
            item.nama,
            kategoriMap['AKSESIBILITAS'] || '',
            kategoriMap['KEBERSIHAN'] || '',
            kategoriMap['KELENGKAPAN'] || '',
            kategoriMap['KENYAMANAN'] || '',
            item.rataRata,
            item.jumlahEvaluasi,
            getKomentarExport(item),
          ];
        });

        csvContent += fasilitasHeader
          .map((value) => `"${value}"`)
          .join(',') + '\n';
        csvContent += fasilitasRows
          .map((row) => row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(','))
          .join('\n');
      }

      const fileName = `laporan-evaluasi-${Date.now()}.csv`;
      const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(fileUri, csvContent, { encoding: 'utf8' });

      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/csv',
        dialogTitle: 'Unduh Laporan Evaluasi',
        UTI: 'public.comma-separated-values-text',
      });
    } catch (error) {
      console.error('Export laporan error:', error);
      Alert.alert('Gagal', 'Laporan belum berhasil diunduh. Coba lagi.');
    }
  };

  const renderReportCard = ({ item }) => {
    const ratingColor = getRatingColor(parseFloat(item.rataRata));
    const ratingLabel = getRatingLabel(parseFloat(item.rataRata));
    
    return (
      <TouchableOpacity
        style={styles.reportCard}
        activeOpacity={0.8}
        onPress={() => {
          setSelectedReport(item);
          setShowDetailModal(true);
        }}
      >
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
              {toDisplayText(item.nama)}
            </Text>
            {item.type === 'dosen' ? (
              <Text style={styles.reportSubtitle}>{toDisplayText(item.nip)}</Text>
            ) : (
              <Text style={styles.reportSubtitle}>{toDisplayText(item.kode)} • {toDisplayText(item.kategori)}</Text>
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

        <View style={styles.detailHintWrap}>
          <Text style={styles.detailHintText}>Tap untuk lihat detail evaluasi dan komentar</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderDetailModal = () => {
    if (!selectedReport) return null;

    return (
      <Modal
        visible={showDetailModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentLarge}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detail Evaluasi</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.detailScrollContent}>
              <Text style={styles.detailName}>{selectedReport.nama}</Text>
              <Text style={styles.detailSubname}>
                {selectedReport.type === 'dosen'
                  ? `NIP: ${toDisplayText(selectedReport.nip)}`
                  : `${toDisplayText(selectedReport.kode)} • ${toDisplayText(selectedReport.kategori)}`}
              </Text>

              <View style={styles.detailStatsRow}>
                <Text style={styles.detailStatsText}>Rata-rata: {selectedReport.rataRata}</Text>
                <Text style={styles.detailStatsText}>Jumlah Evaluasi: {selectedReport.jumlahEvaluasi}</Text>
                <Text style={styles.detailStatsText}>Total Jawaban: {selectedReport.totalJawaban}</Text>
              </View>

              <Text style={styles.detailSectionTitle}>Rata-rata Per Kategori</Text>
              {(selectedReport.detailKategori || []).length > 0 ? (
                (selectedReport.detailKategori || []).map((detail, index) => (
                  <View key={`kategori-${index}`} style={styles.detailRow}>
                    <Text style={styles.detailRowLabel}>{toDisplayText(detail.kategori)}</Text>
                    <Text style={styles.detailRowValue}>{detail.rataRata}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.detailEmpty}>Belum ada detail kategori</Text>
              )}

              <Text style={styles.detailSectionTitle}>Komentar Mahasiswa</Text>
              {(selectedReport.detailEvaluasi || []).length > 0 ? (
                (selectedReport.detailEvaluasi || []).map((item, index) => (
                  <View key={`evaluasi-${item.id}-${index}`} style={styles.commentCard}>
                    <Text style={styles.commentMeta}>
                      {toDisplayText(item.mahasiswaNama)} ({toDisplayText(item.mahasiswaNim)})
                    </Text>
                    <Text style={styles.commentMeta}>Nilai: {item.rataRata} • Jawaban: {item.jumlahJawaban}</Text>
                    <Text style={styles.commentMeta}>Tanggal: {new Date(item.submittedAt).toLocaleDateString('id-ID')}</Text>
                    <Text style={styles.commentText}>{toDisplayText(item.komentar)}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.detailEmpty}>Belum ada komentar</Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
        <View>
          <Text style={styles.headerSubtitle}>ADMIN</Text>
          <Text style={styles.headerTitle}>Laporan Evaluasi</Text>
        </View>
        <TouchableOpacity style={styles.exportButton} onPress={handleExportReport}>
          <MaterialCommunityIcons name="download" size={20} color="#FFFFFF" />
          <Text style={styles.exportButtonText}>Unduh</Text>
        </TouchableOpacity>
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
      {renderDetailModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: staticColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.base,
    fontSize: typography.fontSize.base,
    color: staticColors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: staticColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: staticColors.border,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: staticColors.textSecondary,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: staticColors.textPrimary,
    marginTop: 2,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: staticColors.primary,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.base,
    gap: spacing.xs,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
  },
  filterSection: {
    backgroundColor: staticColors.surface,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: staticColors.border,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: radius.base,
    borderWidth: 1,
    borderColor: staticColors.border,
    marginBottom: spacing.sm,
  },
  filterButtonText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.base,
    color: staticColors.textPrimary,
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
    backgroundColor: staticColors.primary,
  },
  tipeChipText: {
    fontSize: typography.fontSize.sm,
    color: staticColors.textSecondary,
    fontFamily: typography.fontFamily.medium,
  },
  tipeChipTextActive: {
    color: '#fff',
  },
  summarySection: {
    flexDirection: 'row',
    padding: spacing.base,
    gap: spacing.sm,
    backgroundColor: staticColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: staticColors.border,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: spacing.base,
    borderRadius: radius.base,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: staticColors.border,
  },
  summaryValue: {
    fontSize: 24,
    fontFamily: typography.fontFamily.bold,
    color: staticColors.primary,
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    color: staticColors.textSecondary,
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
    borderColor: staticColors.border,
  },
  detailHintWrap: {
    marginTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: staticColors.border,
    paddingTop: spacing.sm,
  },
  detailHintText: {
    fontSize: typography.fontSize.xs,
    color: staticColors.textSecondary,
    fontFamily: typography.fontFamily.medium,
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
    color: staticColors.textPrimary,
  },
  reportSubtitle: {
    fontSize: typography.fontSize.sm,
    color: staticColors.textSecondary,
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
    borderTopColor: staticColors.border,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: staticColors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: staticColors.textPrimary,
  },
  statDivider: {
    width: 1,
    backgroundColor: staticColors.border,
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
    color: staticColors.textSecondary,
    marginTop: spacing.base,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.sm,
    color: staticColors.textDisabled,
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
  modalContentLarge: {
    backgroundColor: '#fff',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: staticColors.border,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: staticColors.textPrimary,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: staticColors.border,
  },
  modalItemActive: {
    backgroundColor: staticColors.primary + '10',
  },
  modalItemContent: {
    flex: 1,
  },
  modalItemText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: staticColors.textPrimary,
  },
  modalItemSubtext: {
    fontSize: typography.fontSize.sm,
    color: staticColors.textSecondary,
    marginTop: 2,
  },
  aktiveBadge: {
    backgroundColor: staticColors.success + '20',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  aktiveBadgeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: staticColors.success,
  },
  detailScrollContent: {
    padding: spacing.base,
  },
  detailName: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: staticColors.textPrimary,
  },
  detailSubname: {
    fontSize: typography.fontSize.sm,
    color: staticColors.textSecondary,
    marginTop: 2,
  },
  detailStatsRow: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: '#f8f9fa',
    borderRadius: radius.sm,
    gap: 4,
  },
  detailStatsText: {
    fontSize: typography.fontSize.sm,
    color: staticColors.textPrimary,
  },
  detailSectionTitle: {
    marginTop: spacing.base,
    marginBottom: spacing.xs,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: staticColors.textPrimary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: staticColors.border,
  },
  detailRowLabel: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: staticColors.textSecondary,
    marginRight: spacing.sm,
  },
  detailRowValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: staticColors.primary,
  },
  detailEmpty: {
    fontSize: typography.fontSize.sm,
    color: staticColors.textSecondary,
    fontStyle: 'italic',
  },
  commentCard: {
    borderWidth: 1,
    borderColor: staticColors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginBottom: spacing.sm,
  },
  commentMeta: {
    fontSize: typography.fontSize.xs,
    color: staticColors.textSecondary,
    marginBottom: 2,
  },
  commentText: {
    marginTop: spacing.xs,
    fontSize: typography.fontSize.sm,
    color: staticColors.textPrimary,
  },
});

export default LaporanScreen;
