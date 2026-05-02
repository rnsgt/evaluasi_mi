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
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Rect } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDate, groupBy } from '../../utils/helpers';
import evaluasiService from '../../services/evaluasiService';

const { width } = Dimensions.get('window');

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
      style={[styles.itemCard, { backgroundColor: colors.surface }, colors.shadowSoft]} 
      activeOpacity={0.8}
      onPress={() => {
        Alert.alert('Detail Evaluasi', 
          `Subjek: ${item.subject}\nOleh: ${item.nama}\nTanggal: ${formatDate(item.tanggal)}\nKomentar: ${item.rawData.komentar || '-'}`,
          [{ text: 'Tutup' }]
        );
      }}
    >
      <View style={[styles.typeIcon, { backgroundColor: item.type === 'DOSEN' ? colors.primary + '12' : colors.tertiary + '12' }]}>
        <MaterialCommunityIcons 
          name={item.type === 'DOSEN' ? 'account-tie' : 'office-building'} 
          size={24} 
          color={item.type === 'DOSEN' ? colors.primary : colors.tertiary} 
        />
      </View>
      <View style={styles.itemContent}>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemType, { color: colors.textDisabled }]}>{item.type}</Text>
          <Text style={[styles.itemDate, { color: colors.textDisabled }]}>{formatDate(item.tanggal, 'DD MMM')}</Text>
        </View>
        <Text style={[styles.itemSubject, { color: colors.textPrimary }]} numberOfLines={1}>{item.subject}</Text>
        <Text style={[styles.itemName, { color: colors.textSecondary }]} numberOfLines={1}>{item.nama}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textDisabled} />
    </TouchableOpacity>
  );

  const DecorativeBackground = () => (
    <View style={StyleSheet.absoluteFill}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Circle cx={width} cy="200" r="100" fill={colors.primary + '08'} />
        <Rect x="-20" y="500" width="80" height="80" rx="20" transform="rotate(-15)" fill={colors.secondary + '05'} />
      </Svg>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <DecorativeBackground />
      
      <View style={[styles.header, { backgroundColor: colors.primaryDark }]}>
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
          <Circle cx="0" cy="0" r="100" fill="rgba(255,255,255,0.05)" />
          <Circle cx={width} cy="50" r="80" fill="rgba(255,255,255,0.03)" />
        </Svg>
        <Text style={styles.headerSubtitle}>ACTIVITY LOG</Text>
        <Text style={styles.headerTitle}>Riwayat Evaluasi</Text>
      </View>

      <View style={[styles.filterSection, { backgroundColor: colors.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
          {['semua', 'dosen', 'fasilitas'].map((f) => (
            <TouchableOpacity
              key={f}
              onPress={() => setActiveFilter(f)}
              style={[styles.chip, { backgroundColor: colors.background, borderColor: colors.border }, activeFilter === f && { backgroundColor: colors.primary, borderColor: colors.primary }]}
            >
              <Text style={[styles.chipText, { color: colors.textSecondary }, activeFilter === f && { color: '#FFF' }]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : Object.keys(riwayatData).length > 0 ? (
          Object.keys(riwayatData).map((month) => (
            <View key={month} style={styles.monthSection}>
              <View style={styles.monthHeader}>
                <View style={[styles.monthDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.monthLabel, { color: colors.textPrimary }]}>{month}</Text>
              </View>
              {riwayatData[month].map(renderItem)}
            </View>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="clipboard-text-search-outline" size={80} color={colors.textDisabled + '50'} />
            <Text style={[styles.emptyText, { color: colors.textDisabled }]}>Belum ada aktivitas evaluasi</Text>
          </View>
        )}
      </ScrollView>

      {!loading && allData.length > 0 && (
        <View style={[styles.statsBar, { backgroundColor: colors.surface }, colors.shadowLarge]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{allData.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.secondaryDark }]}>{allData.filter(i => i.type === 'DOSEN').length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Dosen</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: colors.tertiary }]}>{allData.filter(i => i.type === 'FASILITAS').length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Fasilitas</Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 32, paddingBottom: 40, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' },
  headerSubtitle: { fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: '900', letterSpacing: 2 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginTop: 4 },
  filterSection: { paddingVertical: 16, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, elevation: 4 },
  filterList: { paddingHorizontal: 24 },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 16, marginRight: 10, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: '700' },
  scrollContent: { padding: 24, paddingBottom: 120 },
  monthSection: { marginBottom: 32 },
  monthHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, marginLeft: 8 },
  monthDot: { width: 8, height: 8, borderRadius: 4 },
  monthLabel: { fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  itemCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 24, padding: 16, marginBottom: 12 },
  typeIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  itemContent: { flex: 1 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  itemType: { fontSize: 10, fontWeight: '900' },
  itemDate: { fontSize: 11, fontWeight: '600' },
  itemSubject: { fontSize: 16, fontWeight: 'bold' },
  itemName: { fontSize: 13, marginTop: 2, fontWeight: '500' },
  loadingWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  emptyState: { alignItems: 'center', marginTop: 80, opacity: 0.8 },
  emptyText: { marginTop: 16, fontSize: 15, fontWeight: '600' },
  statsBar: { flexDirection: 'row', position: 'absolute', bottom: 24, left: 24, right: 24, paddingVertical: 20, borderRadius: 32, alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '900' },
  statLabel: { fontSize: 11, marginTop: 2, fontWeight: '700' },
  statDivider: { width: 1, height: 30 },
});

export default RiwayatScreen;
