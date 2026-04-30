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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import fasilitasService from '../../services/fasilitasService';

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
      setFasilitas(data);
      setFilteredFasilitas(data);
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
        f.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.kode.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredFasilitas(filtered);
    } else {
      setFilteredFasilitas(fasilitas);
    }
  };

  const renderFasilitasCard = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('FormEvaluasiFasilitas', {
        fasilitasId: item.id,
        namaFasilitas: item.nama,
        kodeFasilitas: item.kode,
        kategoriFasilitas: item.kategori,
        lokasi: item.lokasi,
      })}
      activeOpacity={0.8}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="office-building-outline" size={28} color="#EA580C" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.fasilitasName} numberOfLines={1}>{item.nama}</Text>
          <Text style={styles.fasilitasKode}>{item.kode}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.detailItem}>
          <MaterialCommunityIcons name="map-marker-outline" size={14} color="#64748B" />
          <Text style={styles.detailText}>{item.lokasi || 'Kampus Utama'}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>{item.kategori}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#EA580C" />
          <Text style={styles.loadingText}>Memuat data fasilitas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Evaluasi Fasilitas</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={22} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari fasilitas atau lokasi..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <FlatList
        data={filteredFasilitas}
        renderItem={renderFasilitasCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="office-building-marker-outline" size={80} color="#CBD5E1" />
            <Text style={styles.emptyText}>Fasilitas tidak ditemukan</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#64748B' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backButton: { width: 40, height: 40, backgroundColor: '#F8FAFC', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  searchSection: { padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 16, paddingHorizontal: 16, height: 50 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#0F172A' },
  listContent: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 16 },
  fasilitasName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  fasilitasKode: { fontSize: 12, color: '#64748B', marginTop: 2 },
  cardFooter: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailItem: { flexDirection: 'row', alignItems: 'center' },
  detailText: { fontSize: 12, color: '#64748B', marginLeft: 6 },
  tag: { backgroundColor: '#FFEDD5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  tagText: { fontSize: 10, color: '#EA580C', fontWeight: 'bold' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#94A3B8' },
});

export default PilihFasilitasScreen;
