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
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../contexts/ThemeContext';
import adminService from '../../services/adminService';
import periodeService from '../../services/periodeService';

const LaporanScreen = () => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [flatData, setFlatData] = useState([]);
  const [selectedPeriode, setSelectedPeriode] = useState(null);
  const [selectedTipe, setSelectedTipe] = useState('semua');
  const [periodeList, setPeriodeList] = useState([]);
  const [showPeriodeModal, setShowPeriodeModal] = useState(false);

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
            submittedAt: evaluasi.submitted_at
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
    // Simple CSV Export logic
    let csv = 'Tanggal,Tipe,Subjek,Nilai,Komentar\n';
    flatData.forEach(row => {
      csv += `${new Date(row.submittedAt).toLocaleDateString()},${row.type.toUpperCase()},"${row.nama}",${row.rataRata},"${row.komentar || '-'}"\n`;
    });

    const fileUri = `${FileSystem.cacheDirectory}Laporan-Evaluasi.csv`;
    await FileSystem.writeAsStringAsync(fileUri, csv);
    await Sharing.shareAsync(fileUri);
  };

  const renderReportCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.typeIcon, { backgroundColor: item.type === 'dosen' ? '#EFF6FF' : '#FFF7ED' }]}>
          <MaterialCommunityIcons name={item.type === 'dosen' ? 'school' : 'office-building'} size={24} color={item.type === 'dosen' ? '#2563EB' : '#EA580C'} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.cardNama}>{item.nama}</Text>
          <Text style={styles.cardSubnama}>{item.subnama}</Text>
        </View>
        <View style={styles.ratingBadge}>
          <MaterialCommunityIcons name="star" size={14} color="#EAB308" />
          <Text style={styles.ratingText}>{item.rataRata}</Text>
        </View>
      </View>
      {item.komentar && (
        <View style={styles.komentarBox}>
          <Text style={styles.komentarLabel}>Komentar Responden:</Text>
          <Text style={styles.komentarText}>{item.komentar}</Text>
        </View>
      )}
      <View style={styles.cardFooter}>
        <Text style={styles.footerDate}>{new Date(item.submittedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>LAPORAN SISTEM</Text>
          <Text style={styles.headerTitle}>Hasil Evaluasi</Text>
        </View>
        <TouchableOpacity style={styles.downloadBtn} onPress={handleExport}>
          <MaterialCommunityIcons name="download" size={20} color="#FFF" />
          <Text style={styles.downloadText}>Export</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterSection}>
        <TouchableOpacity style={styles.periodeSelector} onPress={() => setShowPeriodeModal(true)}>
          <MaterialCommunityIcons name="calendar-range" size={20} color="#2563EB" />
          <Text style={styles.periodeSelectedText}>{selectedPeriode?.nama || 'Pilih Periode'}</Text>
          <MaterialCommunityIcons name="chevron-down" size={20} color="#94A3B8" />
        </TouchableOpacity>
        
        <View style={styles.tipeTabs}>
          {['semua', 'dosen', 'fasilitas'].map(t => (
            <TouchableOpacity 
              key={t} 
              style={[styles.tab, selectedTipe === t && styles.tabActive]}
              onPress={() => {
                setSelectedTipe(t);
                loadLaporan(selectedPeriode?.id, t);
              }}
            >
              <Text style={[styles.tabText, selectedTipe === t && styles.tabTextActive]}>{t.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={flatData}
          renderItem={renderReportCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="file-document-outline" size={80} color="#CBD5E1" />
              <Text style={styles.emptyText}>Tidak ada data laporan ditemukan</Text>
            </View>
          }
        />
      )}

      <Modal visible={showPeriodeModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Pilih Periode Laporan</Text>
            {periodeList.map(p => (
              <TouchableOpacity 
                key={p.id} 
                style={styles.modalItem}
                onPress={() => {
                  setSelectedPeriode(p);
                  setShowPeriodeModal(false);
                  loadLaporan(p.id, selectedTipe);
                }}
              >
                <Text style={styles.modalItemText}>{p.nama}</Text>
                {p.status === 'aktif' && <View style={styles.activeTag}><Text style={styles.activeTagText}>Aktif</Text></View>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowPeriodeModal(false)}>
              <Text style={styles.closeBtnText}>Tutup</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, backgroundColor: '#FFF' },
  headerSubtitle: { fontSize: 12, color: '#2563EB', fontWeight: 'bold', letterSpacing: 1.5 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', marginTop: 4 },
  downloadBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  downloadText: { color: '#FFF', fontWeight: 'bold', marginLeft: 8, fontSize: 13 },
  filterSection: { paddingHorizontal: 24, paddingVertical: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  periodeSelector: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#E2E8F0', marginBottom: 16 },
  periodeSelectedText: { flex: 1, marginLeft: 12, fontSize: 14, color: '#1E293B', fontWeight: '600' },
  tipeTabs: { flexDirection: 'row', gap: 8 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, backgroundColor: '#F1F5F9' },
  tabActive: { backgroundColor: '#2563EB' },
  tabText: { fontSize: 11, fontWeight: 'bold', color: '#64748B' },
  tabTextActive: { color: '#FFF' },
  listContent: { padding: 24 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  typeIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 16 },
  cardNama: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  cardSubnama: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEFCE8', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  ratingText: { fontSize: 14, fontWeight: 'bold', color: '#854D0E', marginLeft: 4 },
  komentarBox: { marginTop: 16, padding: 12, backgroundColor: '#F8FAFC', borderRadius: 12, borderLeftWidth: 3, borderLeftColor: '#CBD5E1' },
  komentarLabel: { fontSize: 10, fontWeight: 'bold', color: '#94A3B8', marginBottom: 4 },
  komentarText: { fontSize: 13, color: '#475569', lineHeight: 20 },
  cardFooter: { marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9', alignItems: 'flex-end' },
  footerDate: { fontSize: 11, color: '#94A3B8' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#94A3B8' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContent: { backgroundColor: '#FFF', width: '100%', borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 20 },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalItemText: { fontSize: 15, color: '#1E293B', fontWeight: '500' },
  activeTag: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  activeTagText: { fontSize: 10, color: '#166534', fontWeight: 'bold' },
  closeBtn: { marginTop: 20, backgroundColor: '#F1F5F9', padding: 16, borderRadius: 16, alignItems: 'center' },
  closeBtnText: { fontWeight: 'bold', color: '#64748B' },
});

export default LaporanScreen;
