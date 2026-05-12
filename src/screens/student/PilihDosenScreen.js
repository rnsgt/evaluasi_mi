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
      setDosen(data || []);
      setFilteredDosen(data || []);
      
      const allMK = [];
      data?.forEach((d) => {
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
      filtered = filtered.filter(d => 
        (d.nama && d.nama.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (d.nip && d.nip.includes(searchQuery))
      );
    }
    if (selectedMataKuliah !== 'Semua') {
      filtered = filtered.filter(d => 
        d.mata_kuliah && d.mata_kuliah.some(mk => (typeof mk === 'object' ? mk.nama : mk) === selectedMataKuliah)
      );
    }
    setFilteredDosen(filtered);
  };

  const renderDosenCard = ({ item }) => {
    const initials = item.nama?.split(' ').filter(w => w.length > 2).slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'DS';
    
    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface }, styles.shadowSoft]}
        onPress={() => navigation.navigate('FormEvaluasiDosen', { 
          dosenId: item.id, 
          namaDosen: item.nama, 
          nip: item.nip,
          mataKuliah: item.mata_kuliah 
        })}
        activeOpacity={0.9}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: colors.primary + '10' }]}>
            <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
          </View>
          <View style={styles.cardInfo}>
            <Text style={[styles.dosenName, { color: colors.textPrimary }]} numberOfLines={1}>{item.nama}</Text>
            <Text style={[styles.nip, { color: colors.textSecondary }]}>NIP: {item.nip || '-'}</Text>
          </View>
          <View style={[styles.goCircle, { backgroundColor: colors.primary + '08' }]}>
             <MaterialCommunityIcons name="chevron-right" size={24} color={colors.primary} />
          </View>
        </View>
        
        <View style={[styles.cardDivider, { backgroundColor: colors.border + '50' }]} />
        
        <View style={styles.cardFooter}>
          <View style={styles.mkTags}>
            <MaterialCommunityIcons name="book-outline" size={14} color={colors.textDisabled} style={{ marginRight: 6 }} />
            {(item.mata_kuliah || []).slice(0, 2).map((mk, idx) => (
              <View key={idx} style={[styles.mkBadge, { backgroundColor: colors.background }]}>
                <Text style={[styles.mkText, { color: colors.textSecondary }]} numberOfLines={1}>
                  {typeof mk === 'object' ? mk.nama : mk}
                </Text>
              </View>
            ))}
            {(item.mata_kuliah || []).length > 2 && (
              <Text style={[styles.moreText, { color: colors.primary }]}>+{(item.mata_kuliah || []).length - 2}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* Curved Premium Header */}
      <View style={[styles.headerArea, { backgroundColor: colors.primaryDark }]}>
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
          <Circle cx={width} cy="0" r="120" fill="rgba(255,255,255,0.05)" />
          <Circle cx="0" cy="80" r="70" fill="rgba(255,255,255,0.03)" />
        </Svg>
        
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Pilih Dosen</Text>
            <Text style={styles.headerSubtitle}>Silakan pilih dosen untuk dievaluasi</Text>
          </View>
        </View>

        {/* Search Bar inside Header */}
        <View style={[styles.searchWrapper, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <MaterialCommunityIcons name="magnify" size={22} color="rgba(255,255,255,0.7)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama dosen atau NIP..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filter Chips - Floating slightly over list */}
      <View style={styles.filterArea}>
        <FlatList
          horizontal
          data={mataKuliahList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.chip, 
                { backgroundColor: colors.surface, borderColor: colors.border },
                selectedMataKuliah === item && { backgroundColor: colors.primary, borderColor: colors.primary }
              ]}
              onPress={() => setSelectedMataKuliah(item)}
            >
              <Text style={[
                styles.chipText, 
                { color: colors.textSecondary },
                selectedMataKuliah === item && { color: '#FFF' }
              ]}>{item}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={item => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipList}
        />
      </View>

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Sinkronisasi data dosen...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDosen}
          renderItem={renderDosenCard}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={[styles.emptyIconBox, { backgroundColor: colors.primary + '05' }]}>
                <MaterialCommunityIcons name="account-search-outline" size={80} color={colors.textDisabled} />
              </View>
              <Text style={[styles.emptyText, { color: colors.textPrimary }]}>Dosen tidak ditemukan</Text>
              <Text style={[styles.emptySub, { color: colors.textDisabled }]}>Coba gunakan kata kunci lain</Text>
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

  filterArea: { marginTop: -20, zIndex: 10 },
  chipList: { paddingHorizontal: 24, paddingVertical: 5 },
  chip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 15, marginRight: 10, borderWidth: 1, elevation: 2 },
  chipText: { fontSize: 13, fontWeight: 'bold' },

  listContent: { padding: 24, paddingTop: 20, paddingBottom: 40 },
  card: { borderRadius: 30, padding: 20, marginBottom: 18 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: 'bold' },
  cardInfo: { flex: 1, marginLeft: 16 },
  dosenName: { fontSize: 16, fontWeight: 'bold' },
  nip: { fontSize: 12, marginTop: 3, fontWeight: '600' },
  goCircle: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

  cardDivider: { height: 1, marginVertical: 15 },
  cardFooter: { flexDirection: 'row', alignItems: 'center' },
  mkTags: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  mkBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginRight: 6 },
  mkText: { fontSize: 10, fontWeight: '700' },
  moreText: { fontSize: 11, fontWeight: 'bold' },

  emptyState: { alignItems: 'center', marginTop: 80 },
  emptyIconBox: { width: 140, height: 140, borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyText: { fontSize: 18, fontWeight: 'bold' },
  emptySub: { fontSize: 14, marginTop: 8 },

  shadowSoft: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
});

export default PilihDosenScreen;
