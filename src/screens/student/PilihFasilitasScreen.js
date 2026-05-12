import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import fasilitasService from '../../services/fasilitasService';

const { width } = Dimensions.get('window');

const PilihFasilitasScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [fasilitas, setFasilitas] = useState([]);
  const [filteredFasilitas, setFilteredFasilitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadFasilitas();
  }, []);

  useEffect(() => {
    filterFasilitas();
  }, [searchQuery, fasilitas]);

  const loadFasilitas = async () => {
    try {
      setLoading(true);
      const data = await fasilitasService.getAllFasilitas();
      setFasilitas(data || []);
      setFilteredFasilitas(data || []);
    } catch (error) {
      console.error('Load fasilitas error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFasilitas();
    setRefreshing(false);
  };

  const filterFasilitas = () => {
    if (searchQuery) {
      const filtered = fasilitas.filter(f =>
        (f.nama && f.nama.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (f.kode && f.kode.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredFasilitas(filtered);
    } else {
      setFilteredFasilitas(fasilitas);
    }
  };

  const renderFasilitasCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }, styles.shadowSoft]}
      onPress={() => navigation.navigate('FormEvaluasiFasilitas', {
        fasilitasId: item.id,
        namaFasilitas: item.nama,
        kodeFasilitas: item.kode,
        kategoriFasilitas: item.kategori,
        lokasi: item.lokasi,
      })}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: colors.tertiary + '10' }]}>
          <MaterialCommunityIcons name={item.icon || 'office-building'} size={28} color={colors.tertiary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.fasilitasName, { color: colors.textPrimary }]} numberOfLines={1}>{item.nama}</Text>
          <Text style={[styles.fasilitasKode, { color: colors.textSecondary }]}>{item.kode} • {item.kategori}</Text>
        </View>
        <View style={[styles.goCircle, { backgroundColor: colors.tertiary + '08' }]}>
           <MaterialCommunityIcons name="chevron-right" size={24} color={colors.tertiary} />
        </View>
      </View>
      
      <View style={[styles.cardDivider, { backgroundColor: colors.border + '50' }]} />

      <View style={styles.cardFooter}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="map-marker-radius-outline" size={16} color={colors.textDisabled} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]}>{item.lokasi || 'Kampus Utama'}</Text>
        </View>
        <View style={[styles.capacityBadge, { backgroundColor: colors.background }]}>
          <MaterialCommunityIcons name="account-group-outline" size={12} color={colors.textSecondary} />
          <Text style={[styles.capacityText, { color: colors.textSecondary }]}>{item.kapasitas || 0}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Curved Premium Header */}
      <View style={[styles.headerArea, { backgroundColor: colors.tertiary }]}>
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
          <Circle cx={width} cy="0" r="120" fill="rgba(255,255,255,0.05)" />
          <Circle cx="0" cy="80" r="70" fill="rgba(255,255,255,0.03)" />
        </Svg>
        
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Evaluasi Fasilitas</Text>
            <Text style={styles.headerSubtitle}>Pilih infrastruktur yang ingin dinilai</Text>
          </View>
        </View>

        {/* Search Bar inside Header */}
        <View style={[styles.searchWrapper, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <MaterialCommunityIcons name="magnify" size={22} color="rgba(255,255,255,0.7)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari fasilitas atau lokasi..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tertiary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Memuat data fasilitas...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFasilitas}
          renderItem={renderFasilitasCard}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.tertiary]} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconBox, { backgroundColor: colors.tertiary + '05' }]}>
                <MaterialCommunityIcons name="office-building-marker-outline" size={80} color={colors.textDisabled} />
              </View>
              <Text style={[styles.emptyText, { color: colors.textPrimary }]}>Fasilitas tidak ditemukan</Text>
              <Text style={[styles.emptySub, { color: colors.textDisabled }]}>Silakan hubungi admin jika ada kendala</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 15, fontWeight: '600' },
  
  headerArea: { padding: 24, paddingTop: 50, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  backBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitleBox: { marginLeft: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  
  searchWrapper: { flexDirection: 'row', alignItems: 'center', height: 55, borderRadius: 18, paddingHorizontal: 16, marginTop: 5 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: '#FFF', fontWeight: '500' },

  listContent: { padding: 24, paddingTop: 30, paddingBottom: 40 },
  card: { borderRadius: 30, padding: 20, marginBottom: 18 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 16 },
  fasilitasName: { fontSize: 16, fontWeight: 'bold' },
  fasilitasKode: { fontSize: 12, marginTop: 3, fontWeight: '600' },
  goCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

  cardDivider: { height: 1, marginVertical: 15 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  detailText: { fontSize: 13, fontWeight: '600', marginLeft: 8 },
  capacityBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  capacityText: { fontSize: 11, fontWeight: 'bold' },

  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyIconBox: { width: 140, height: 140, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyText: { fontSize: 18, fontWeight: 'bold' },
  emptySub: { fontSize: 14, marginTop: 8 },

  shadowSoft: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
});

export default PilihFasilitasScreen;
