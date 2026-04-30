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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import dosenService from '../../services/dosenService';

const { width } = Dimensions.get('window');

const PilihDosenScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [dosen, setDosen] = useState([]);
  const [filteredDosen, setFilteredDosen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMataKuliah, setSelectedMataKuliah] = useState('Semua');
  const [mataKuliahList, setMataKuliahList] = useState(['Semua']);

  useEffect(() => {
    loadDosen();
  }, []);

  useEffect(() => {
    filterDosen();
  }, [searchQuery, selectedMataKuliah, dosen]);

  const loadDosen = async () => {
    try {
      setLoading(true);
      const data = await dosenService.getAllDosen();
      setDosen(data);
      setFilteredDosen(data);
      
      const allMK = [];
      data.forEach((d) => {
        if (d.mata_kuliah && Array.isArray(d.mata_kuliah)) {
          d.mata_kuliah.forEach((mk) => {
            const mkNama = typeof mk === 'object' ? mk.nama : mk;
            if (mkNama && !allMK.includes(mkNama)) allMK.push(mkNama);
          });
        }
      });
      setMataKuliahList(['Semua', ...allMK.sort()]);
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

  const filterDosen = () => {
    let filtered = [...dosen];
    if (searchQuery) {
      filtered = filtered.filter(d => d.nama.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (selectedMataKuliah !== 'Semua') {
      filtered = filtered.filter(d => 
        d.mata_kuliah && d.mata_kuliah.some(mk => (typeof mk === 'object' ? mk.nama : mk) === selectedMataKuliah)
      );
    }
    setFilteredDosen(filtered);
  };

  const renderDosenCard = ({ item }) => {
    const initials = item.nama.split(' ').filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join('').toUpperCase();
    
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('FormEvaluasiDosen', { dosenId: item.id, namaDosen: item.nama, nip: item.nip })}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.dosenName} numberOfLines={1}>{item.nama}</Text>
            <Text style={styles.nip}>NIP: {item.nip}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.mkTags}>
            {(item.mata_kuliah || []).slice(0, 2).map((mk, idx) => (
              <View key={idx} style={styles.mkBadge}>
                <Text style={styles.mkText} numberOfLines={1}>{typeof mk === 'object' ? mk.nama : mk}</Text>
              </View>
            ))}
            {(item.mata_kuliah || []).length > 2 && (
              <Text style={styles.moreText}>+{(item.mata_kuliah || []).length - 2} lagi</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Memuat data dosen...</Text>
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
        <Text style={styles.headerTitle}>Dosen Pengampu</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons name="magnify" size={22} color="#64748B" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari dosen..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#94A3B8"
          />
        </View>
      </View>

      <View style={styles.filterSection}>
        <FlatList
          horizontal
          data={mataKuliahList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, selectedMataKuliah === item && styles.chipActive]}
              onPress={() => setSelectedMataKuliah(item)}
            >
              <Text style={[styles.chipText, selectedMataKuliah === item && styles.chipTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipList}
        />
      </View>

      <FlatList
        data={filteredDosen}
        renderItem={renderDosenCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-search-outline" size={80} color="#CBD5E1" />
            <Text style={styles.emptyText}>Dosen tidak ditemukan</Text>
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
  searchSection: { padding: 20, backgroundColor: '#FFF' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F1F5F9', borderRadius: 16, paddingHorizontal: 16, height: 50 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#0F172A' },
  filterSection: { backgroundColor: '#FFF', paddingBottom: 16 },
  chipList: { paddingHorizontal: 20 },
  chip: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 99, backgroundColor: '#F1F5F9', marginRight: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  chipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  chipText: { fontSize: 13, color: '#64748B', fontWeight: '600' },
  chipTextActive: { color: '#FFF' },
  listContent: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 20, backgroundColor: '#DBECFF', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#2563EB' },
  cardInfo: { flex: 1, marginLeft: 16 },
  dosenName: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  nip: { fontSize: 12, color: '#64748B', marginTop: 2 },
  cardFooter: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  mkTags: { flexDirection: 'row', alignItems: 'center' },
  mkBadge: { backgroundColor: '#F1F5F9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginRight: 8 },
  mkText: { fontSize: 11, color: '#475569', fontWeight: '500' },
  moreText: { fontSize: 11, color: '#94A3B8' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#94A3B8' },
});

export default PilihDosenScreen;
