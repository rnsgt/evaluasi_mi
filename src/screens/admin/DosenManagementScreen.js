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
import dosenService from '../../services/dosenService';

const DosenManagementScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [dosen, setDosen] = useState([]);
  const [filteredDosen, setFilteredDosen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDosen();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      setFilteredDosen(dosen.filter(d => d.nama.toLowerCase().includes(searchQuery.toLowerCase()) || d.nip.includes(searchQuery)));
    } else {
      setFilteredDosen(dosen);
    }
  }, [searchQuery, dosen]);

  const loadDosen = async () => {
    try {
      setLoading(true);
      const data = await dosenService.getAllDosen();
      setDosen(data);
      setFilteredDosen(data);
    } catch (error) {
      console.error('Load dosen error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDosen();
    setRefreshing(false);
  };

  const handleDeleteDosen = (id, nama) => {
    Alert.alert('Hapus Dosen', `Yakin ingin menghapus ${nama}?`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => {
        try {
          await dosenService.deleteDosen(id);
          loadDosen();
        } catch (error) {
          Alert.alert('Gagal', 'Terjadi kesalahan saat menghapus data.');
        }
      }},
    ]);
  };

  const renderDosenItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.nama.substring(0, 2).toUpperCase()}</Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.dosenName} numberOfLines={1}>{item.nama}</Text>
          <Text style={styles.nip}>NIP: {item.nip}</Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => navigation.navigate('FormDosen', { dosen: item })}>
          <MaterialCommunityIcons name="pencil-outline" size={18} color="#2563EB" />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDeleteDosen(item.id, item.nama)}>
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
        <Text style={styles.headerTitle}>Kelola Dosen</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('FormDosen')}>
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={22} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama atau NIP..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <FlatList
        data={filteredDosen}
        renderItem={renderDosenItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-search-outline" size={80} color="#CBD5E1" />
              <Text style={styles.emptyText}>Data dosen tidak ditemukan</Text>
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
  addButton: { width: 40, height: 40, backgroundColor: '#2563EB', borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  searchSection: { padding: 20, backgroundColor: '#FFF' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 16, paddingHorizontal: 16, height: 50 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#0F172A' },
  listContent: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 16, marginBottom: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 50, height: 50, borderRadius: 15, backgroundColor: '#DBECFF', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: '#2563EB' },
  cardInfo: { flex: 1, marginLeft: 16 },
  dosenName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  nip: { fontSize: 12, color: '#64748B', marginTop: 2 },
  cardActions: { flexDirection: 'row', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, backgroundColor: '#EFF6FF', borderRadius: 10, marginRight: 8 },
  editBtnText: { color: '#2563EB', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
  deleteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, backgroundColor: '#FEF2F2', borderRadius: 10 },
  deleteBtnText: { color: '#EF4444', fontSize: 13, fontWeight: 'bold', marginLeft: 6 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#94A3B8' },
});

export default DosenManagementScreen;
