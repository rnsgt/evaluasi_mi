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
import { formatDate, groupBy } from '../../utils/helpers';
import evaluasiService from '../../services/evaluasiService';

const RiwayatScreen = () => {
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
      const riwayat = await evaluasiService.getRiwayat();
      const transformedData = riwayat.map((item) => ({
        id: item.id,
        tanggal: item.submitted_at,
        type: item.type,
        subject: item.type === 'DOSEN' ? (item.mata_kuliah_nama || 'Evaluasi Dosen') : item.fasilitas_nama,
        nama: item.type === 'DOSEN' ? item.dosen_nama : item.fasilitas_kategori,
        nip: item.dosen_nip,
        kode: item.fasilitas_kode,
        lokasi: item.fasilitas_lokasi,
        rawData: item,
      }));
      setAllData(transformedData);
    } catch (error) {
      console.error('Load riwayat error:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    let filtered = [...allData];
    if (activeFilter === 'dosen') filtered = filtered.filter(i => i.type === 'DOSEN');
    else if (activeFilter === 'fasilitas') filtered = filtered.filter(i => i.type === 'FASILITAS');

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

  const renderItem = (item) => (
    <TouchableOpacity 
      key={item.id} 
      style={styles.itemCard} 
      activeOpacity={0.8}
      onPress={() => {
        Alert.alert('Detail Evaluasi', 
          `Subjek: ${item.subject}\nOleh: ${item.nama}\nTanggal: ${formatDate(item.tanggal)}\nKomentar: ${item.rawData.komentar || '-'}`,
          [{ text: 'Tutup' }]
        );
      }}
    >
      <View style={[styles.typeIcon, { backgroundColor: item.type === 'DOSEN' ? '#EFF6FF' : '#FFF7ED' }]}>
        <MaterialCommunityIcons 
          name={item.type === 'DOSEN' ? 'account-tie' : 'office-building'} 
          size={24} 
          color={item.type === 'DOSEN' ? '#2563EB' : '#EA580C'} 
        />
      </View>
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={styles.itemType}>{item.type}</Text>
          <Text style={styles.itemDate}>{formatDate(item.tanggal, 'DD MMM')}</Text>
        </View>
        <Text style={styles.itemSubject} numberOfLines={1}>{item.subject}</Text>
        <Text style={styles.itemName} numberOfLines={1}>{item.nama}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>AKTIVITAS ANDA</Text>
        <Text style={styles.headerTitle}>Riwayat Evaluasi</Text>
      </View>

      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {['semua', 'dosen', 'fasilitas'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[styles.chip, activeFilter === f && styles.chipActive]}
            >
              <Text style={[styles.chipText, activeFilter === f && styles.chipTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
        ) : Object.keys(riwayatData).length > 0 ? (
          Object.keys(riwayatData).map((month) => (
            <View key={month} style={styles.monthSection}>
              <Text style={styles.monthLabel}>{month}</Text>
              {riwayatData[month].map(renderItem)}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={80} color="#CBD5E1" />
            <Text style={styles.emptyText}>Belum ada riwayat evaluasi</Text>
          </View>
        )}
      </ScrollView>

      {!loading && allData.length > 0 && (
        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{allData.length}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{allData.filter(i => i.type === 'DOSEN').length}</Text>
            <Text style={styles.statLabel}>Dosen</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{allData.filter(i => i.type === 'FASILITAS').length}</Text>
            <Text style={styles.statLabel}>Fasilitas</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { padding: 24, backgroundColor: '#FFF' },
  headerSubtitle: { fontSize: 12, color: '#2563EB', fontWeight: 'bold', letterSpacing: 1 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#0F172A', marginTop: 4 },
  filterSection: { backgroundColor: '#FFF', paddingBottom: 16 },
  filterList: { paddingHorizontal: 24 },
  chip: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 99, backgroundColor: '#F1F5F9', marginRight: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  chipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  chipText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  chipTextActive: { color: '#FFF' },
  scrollContent: { padding: 24, paddingBottom: 100 },
  monthSection: { marginBottom: 24 },
  monthLabel: { fontSize: 13, fontWeight: 'bold', color: '#94A3B8', marginBottom: 16, letterSpacing: 0.5 },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 20, padding: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  typeIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  itemContent: { flex: 1 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  itemType: { fontSize: 10, fontWeight: 'bold', color: '#94A3B8' },
  itemDate: { fontSize: 11, color: '#94A3B8' },
  itemSubject: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  itemName: { fontSize: 13, color: '#64748B', marginTop: 2 },
  emptyState: { alignItems: 'center', marginTop: 60 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#94A3B8' },
  statsBar: { flexDirection: 'row', position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFF', paddingVertical: 16, borderTopWidth: 1, borderTopColor: '#E2E8F0', elevation: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  statLabel: { fontSize: 11, color: '#64748B', marginTop: 2 },
  statDivider: { width: 1, height: 30, backgroundColor: '#E2E8F0' },
});

export default RiwayatScreen;
