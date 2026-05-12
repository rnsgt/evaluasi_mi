import React, { useState, useEffect } from 'react';
// UI Updated: 2026-05-13 03:07
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
  StatusBar,
  Dimensions,
} from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import adminService from '../../services/adminService';
import periodeService from '../../services/periodeService';

const { width } = Dimensions.get('window');

const LaporanScreen = () => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState([]);
  const [flatData, setFlatData] = useState([]);
  const [selectedPeriode, setSelectedPeriode] = useState(null);
  const [selectedTipe, setSelectedTipe] = useState('semua');
  const [periodeList, setPeriodeList] = useState([]);
  const [showPeriodeModal, setShowPeriodeModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const periodes = await periodeService.getAllPeriode();
      setPeriodeList(periodes);
      const active = periodes.find(p => p.status === 'aktif');
      if (active) setSelectedPeriode(active);
      loadLaporan(active?.id, selectedTipe);
    } catch (error) {
      console.error('Load initial data error:', error);
    }
  };

  const loadLaporan = async (periodeId, tipe) => {
    try {
      setLoading(true);
      const filters = { periode_id: periodeId, tipe };
      const laporan = await adminService.getLaporan(filters);
      
      const combined = [
        ...(laporan.dosen || []).map(i => ({ ...i, type: 'dosen' })),
        ...(laporan.fasilitas || []).map(i => ({ ...i, type: 'fasilitas' }))
      ];

      let flat = [];
      combined.forEach(item => {
        (item.detail_evaluasi || []).forEach(evaluasi => {
          flat.push({
            id: `${item.type}-${evaluasi.id}`,
            type: item.type,
            nama: item.nama,
            subnama: item.type === 'dosen' ? item.nip : item.kode,
            rataRata: evaluasi.rata_rata,
            komentar: evaluasi.komentar,
            mataKuliah: item.type === 'dosen' ? (evaluasi.mata_kuliah || 'Umum') : null,
            submittedAt: evaluasi.submitted_at,
            detail_kategori: evaluasi.detail_kategori || []
          });
        });
      });
      flat.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
      setFlatData(flat);
      setReportData(combined);
    } catch (error) {
      console.error('Load laporan error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    if (flatData.length === 0) {
      Alert.alert('Info', 'Tidak ada data untuk diunduh');
      return;
    }
    let csv = 'Tanggal,Tipe,Subjek,Mata Kuliah,Nilai,Kategori,Komentar\n';
    flatData.forEach(row => {
      const category = getScoreCategory(row.rataRata);
      csv += `${new Date(row.submittedAt).toLocaleDateString()},${row.type.toUpperCase()},"${row.nama}","${row.mataKuliah || '-'}",${row.rataRata},"${category.label}","${row.komentar || '-'}"\n`;
    });

    const fileUri = `${FileSystem.cacheDirectory}Laporan-Evaluasi.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csv);
    await Sharing.shareAsync(fileUri);
  };

  const getScoreCategory = (score) => {
    if (score >= 4.5) return { label: 'Sangat Baik', color: '#10B981' };
    if (score >= 3.5) return { label: 'Baik', color: '#3B82F6' };
    if (score >= 2.5) return { label: 'Cukup', color: '#F59E0B' };
    return { label: 'Kurang', color: '#EF4444' };
  };

  const renderReportCard = ({ item }) => {
    const category = getScoreCategory(item.rataRata);
    
    return (
      <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.surface }, colors.shadowSoft]}
        onPress={() => {
          setSelectedItem(item);
          setShowDetailModal(true);
        }}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.typeIcon, { backgroundColor: item.type === 'dosen' ? colors.primary + '12' : colors.tertiary + '12' }]}>
            <MaterialCommunityIcons 
              name={item.type === 'dosen' ? 'school' : 'office-building'} 
              size={24} 
              color={item.type === 'dosen' ? colors.primary : colors.tertiary} 
            />
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.cardNama, { color: colors.textPrimary }]}>{item.nama}</Text>
            <View style={styles.subInfoRow}>
              <Text style={[styles.cardSubnama, { color: colors.textSecondary }]}>{item.subnama}</Text>
              {item.mataKuliah && (
                <>
                  <View style={styles.infoDot} />
                  <Text style={[styles.mkInfo, { color: colors.primary }]}>{item.mataKuliah}</Text>
                </>
              )}
            </View>
          </View>
          <View style={styles.ratingSection}>
            <View style={[styles.ratingBadge, { backgroundColor: category.color + '15' }]}>
              <Text style={[styles.ratingText, { color: category.color }]}>{item.rataRata}</Text>
            </View>
          </View>
        </View>
        
        {item.komentar && (
          <View style={[styles.komentarBox, { backgroundColor: colors.background, borderLeftColor: category.color }]}>
            <View style={styles.komentarHeader}>
              <MaterialCommunityIcons name="message-text-outline" size={12} color={colors.textDisabled} />
              <Text style={[styles.komentarLabel, { color: colors.textDisabled }]}>KOMENTAR MAHASISWA</Text>
            </View>
            <Text style={[styles.komentarText, { color: colors.textPrimary }]}>{item.komentar}</Text>
          </View>
        )}
        <View style={styles.cardFooter}>
          <Text style={[styles.footerDate, { color: colors.textDisabled }]}>
            {new Date(item.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const DecorativeBackground = () => (
    <View style={StyleSheet.absoluteFill}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Circle cx={width} cy="100" r="100" fill={colors.primary + '08'} />
        <Circle cx="0" cy="300" r="120" fill={colors.tertiary + '08'} />
      </Svg>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBarStyle} />
      <DecorativeBackground />
      
      <View style={[styles.header, { backgroundColor: colors.primaryDark }]}>
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
          <Circle cx="20" cy="20" r="50" fill="rgba(255,255,255,0.1)" />
          <Circle cx={width} cy="50" r="70" fill="rgba(255,255,255,0.05)" />
        </Svg>
        <View>
          <Text style={styles.headerSubtitle}>ANALYTICS REPORT</Text>
          <Text style={styles.headerTitle}>Hasil Evaluasi</Text>
        </View>
        <TouchableOpacity style={[styles.downloadBtn, { backgroundColor: colors.secondary }]} onPress={handleExport}>
          <MaterialCommunityIcons name="cloud-download" size={20} color={colors.primary} />
          <Text style={[styles.downloadText, { color: colors.primary }]}>Export</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.filterSection, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          style={[styles.periodeSelector, { backgroundColor: colors.background, borderColor: colors.border }]} 
          onPress={() => setShowPeriodeModal(true)}
        >
          <MaterialCommunityIcons name="calendar-filter" size={20} color={colors.primary} />
          <Text style={[styles.periodeSelectedText, { color: colors.textPrimary }]}>{selectedPeriode?.nama || 'Pilih Periode'}</Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textDisabled} />
        </TouchableOpacity>
        
        <View style={styles.tipeTabs}>
          {['semua', 'dosen', 'fasilitas'].map(t => (
            <TouchableOpacity 
              key={t} 
              style={[styles.tab, { backgroundColor: colors.background }, selectedTipe === t && { backgroundColor: colors.primary }]}
              onPress={() => {
                setSelectedTipe(t);
                loadLaporan(selectedPeriode?.id, t);
              }}
            >
              <Text style={[styles.tabText, { color: colors.textSecondary }, selectedTipe === t && { color: '#FFF' }]}>{t.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={flatData}
          renderItem={renderReportCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="file-search-outline" size={80} color={colors.textDisabled + '50'} />
              <Text style={[styles.emptyText, { color: colors.textDisabled }]}>Tidak ada data untuk periode ini</Text>
            </View>
          }
        />
      )}

      <Modal visible={showPeriodeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Pilih Periode Laporan</Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {periodeList.map(p => (
                <TouchableOpacity 
                  key={p.id} 
                  style={[styles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setSelectedPeriode(p);
                    setShowPeriodeModal(false);
                    loadLaporan(p.id, selectedTipe);
                  }}
                >
                  <Text style={[styles.modalItemText, { color: colors.textPrimary }]}>{p.nama}</Text>
                  {p.status === 'aktif' && <View style={[styles.activeTag, { backgroundColor: colors.success + '20' }]}><Text style={[styles.activeTagText, { color: colors.success }]}>Aktif</Text></View>}
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.background }]} onPress={() => setShowPeriodeModal(false)}>
              <Text style={[styles.closeBtnText, { color: colors.textSecondary }]}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Category Detail Modal */}
      <Modal visible={showDetailModal} transparent animationType="fade" onRequestClose={() => setShowDetailModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={[styles.modalHeaderHeader, { backgroundColor: selectedItem?.type === 'dosen' ? colors.primary : colors.tertiary }]}>
              <Text style={styles.modalHeaderTitle}>Analisis Kategori</Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={[styles.detailSubjectName, { color: colors.textPrimary }]}>{selectedItem?.nama}</Text>
              <Text style={[styles.detailSubjectSub, { color: colors.textSecondary }]}>
                {selectedItem?.type === 'dosen' ? `NIP. ${selectedItem.subnama}` : `KODE. ${selectedItem?.subnama}`}
              </Text>
              
              <View style={[styles.summaryBadge, { backgroundColor: colors.background }]}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Rata-rata Penilaian</Text>
                <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>{selectedItem?.rataRata || '0.0'}</Text>
              </View>

              <Text style={[styles.kategoriTitle, { color: colors.textPrimary }]}>Skor Per Kategori</Text>
              <ScrollView style={{ maxHeight: 300 }}>
                {selectedItem?.detail_kategori?.map((kat, idx) => (
                  <View key={idx} style={styles.kategoriRow}>
                    <View style={styles.kategoriInfo}>
                      <Text style={[styles.kategoriName, { color: colors.textPrimary }]}>{kat.kategori}</Text>
                      <Text style={[styles.kategoriScore, { color: kat.rata_rata < 3.5 ? colors.error : colors.success }]}>
                        {kat.rata_rata || kat.skor}
                      </Text>
                    </View>
                    <View style={[styles.progressBarBg, { backgroundColor: colors.border }]}>
                      <View 
                        style={[
                          styles.progressBarFill, 
                          { 
                            width: `${((kat.rata_rata || kat.skor) / 5) * 100}%`,
                            backgroundColor: (kat.rata_rata || kat.skor) < 3.5 ? colors.error : colors.success 
                          }
                        ]} 
                      />
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity 
              style={[styles.closeDetailBtn, { backgroundColor: selectedItem?.type === 'dosen' ? colors.primary : colors.tertiary }]} 
              onPress={() => setShowDetailModal(false)}
            >
              <Text style={styles.closeDetailBtnText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 32, paddingBottom: 40, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' },
  headerSubtitle: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '900', letterSpacing: 2 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFFFFF', marginTop: 4 },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, elevation: 4 },
  downloadText: { fontWeight: 'bold', marginLeft: 8, fontSize: 13 },
  filterSection: { padding: 20, paddingTop: 30, paddingBottom: 16, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, elevation: 4 },
  periodeSelector: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
  periodeSelectedText: { flex: 1, marginLeft: 12, fontSize: 14, fontWeight: '600' },
  tipeTabs: { flexDirection: 'row', gap: 8 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  tabText: { fontSize: 11, fontWeight: '800' },
  listContent: { padding: 20, paddingTop: 30 },
  card: { borderRadius: 28, padding: 20, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  typeIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 16 },
  cardNama: { fontSize: 16, fontWeight: 'bold' },
  cardSubnama: { fontSize: 12, marginTop: 2 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontSize: 14, fontWeight: 'bold', marginLeft: 4 },
  komentarBox: { marginTop: 16, padding: 12, borderRadius: 16, borderLeftWidth: 4 },
  komentarLabel: { fontSize: 9, fontWeight: '900', marginBottom: 4, letterSpacing: 1 },
  komentarText: { fontSize: 13, lineHeight: 20, fontWeight: '500' },
  cardFooter: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.03)', alignItems: 'flex-end' },
  footerDate: { fontSize: 11, fontWeight: '600' },
  subInfoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  infoDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#CBD5E1', mx: 8, marginHorizontal: 8 },
  mkInfo: { fontSize: 11, fontWeight: '700' },
  ratingSection: { alignItems: 'flex-end' },
  categoryLabel: { fontSize: 9, fontWeight: '900', marginTop: 4 },
  komentarHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  loadingWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', marginTop: 100, opacity: 0.8 },
  emptyText: { marginTop: 16, fontSize: 15, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { width: '100%', borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 32, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 24 },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 20, borderBottomWidth: 1 },
  modalItemText: { fontSize: 16, fontWeight: '600' },
  activeTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  activeTagText: { fontSize: 10, fontWeight: 'bold' },
  closeBtn: { marginTop: 24, padding: 18, borderRadius: 20, alignItems: 'center' },
  closeBtnText: { fontWeight: '800', fontSize: 14 },

  modalHeaderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  modalHeaderTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  detailSubjectName: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
  detailSubjectSub: { fontSize: 12, textAlign: 'center', marginBottom: 20 },
  summaryBadge: { padding: 16, borderRadius: 20, alignItems: 'center', marginBottom: 24 },
  summaryLabel: { fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  summaryValue: { fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  kategoriTitle: { fontSize: 13, fontWeight: '900', letterSpacing: 1, marginBottom: 16, marginLeft: 4 },
  kategoriRow: { marginBottom: 16 },
  kategoriInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  kategoriName: { fontSize: 14, fontWeight: '600', flex: 1 },
  kategoriScore: { fontSize: 14, fontWeight: 'bold', marginLeft: 10 },
  progressBarBg: { height: 8, borderRadius: 4, width: '100%', overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 4 },
  closeDetailBtn: { margin: 24, marginTop: 0, padding: 16, borderRadius: 16, alignItems: 'center' },
  closeDetailBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default LaporanScreen;
