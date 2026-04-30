import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import fasilitasService from '../../services/fasilitasService';

const FasilitasManagementScreen = ({ navigation }) => {
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
    if (searchQuery) {
      setFilteredFasilitas(fasilitas.filter(f => f.nama.toLowerCase().includes(searchQuery.toLowerCase()) || f.kode.includes(searchQuery)));
    } else {
      setFilteredFasilitas(fasilitas);
    }
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

  const handleDeleteFasilitas = (id, nama) => {
    Alert.alert('Hapus Fasilitas', `Yakin ingin menghapus ${nama}?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => {
        try {
          await fasilitasService.deleteFasilitas(id);
          loadFasilitas();
        } catch (error) {
          Alert.alert('Gagal', 'Terjadi kesalahan saat menghapus data.');
        }
      }},
    ]);
  };

  const renderFasilitasItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="office-building" size={26} color="#EA580C" />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.fasilitasName} numberOfLines={1}>{item.nama}</Text>
          <Text style={styles.kode}>KODE: {item.kode}</Text>
        </View>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.kategori}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('FormFasilitas', { fasilitas: item })}>
          <MaterialCommunityIcons name="pencil-outline" size={18} color="#2563EB" />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteFasilitas(item.id, item.nama)}>
          <MaterialCommunityIcons name="trash-can-outline" size={18} color="#EF4444" />
          <Text style={styles.deleteBtnText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kelola Fasilitas</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('FormFasilitas')}>
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={22} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama atau kode..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <FlatList
        data={filteredFasilitas}
        renderItem={renderFasilitasItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="office-building-marker-outline" size={80} color="#CBD5E1" />
              <Text style={styles.emptyText}>Data fasilitas tidak ditemukan</Text>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backButton: { width: 40, height: 40, backgroundColor: '#F8FAFC', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  addButton: { width: 40, height: 40, backgroundColor: '#EA580C', borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  searchSection: { padding: 20, backgroundColor: '#FFF' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 16, paddingHorizontal: 16, height: 50 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#0F172A' },
  listContent: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 16, marginBottom: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 16 },
  fasilitasName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  kode: { fontSize: 12, color: '#64748B', marginTop: 2 },
  categoryBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  categoryBadgeText: { fontSize: 10, color: '#64748B', fontWeight: 'bold' },
  cardActions: { flexDirection: 'row', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, backgroundColor: '#EFF6FF', borderRadius: 10, marginRight: 8 },
  editBtnText: { color: '#2563EB', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
  deleteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, backgroundColor: '#FEF2F2', borderRadius: 10 },
  deleteBtnText: { color: '#EF4444', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#94A3B8' },
});

export default FasilitasManagementScreen;
