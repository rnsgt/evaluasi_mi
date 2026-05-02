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
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import fasilitasService from '../../services/fasilitasService';

const { width } = Dimensions.get('window');

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
      setFilteredFasilitas(fasilitas.filter(f => 
        (f.nama && f.nama.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (f.kode && f.kode.includes(searchQuery))
      ));
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

  const DecorativeBackground = () => (
    <View style={StyleSheet.absoluteFill}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Circle cx={width} cy="100" r="120" fill={colors.tertiary + '08'} />
        <Path d="M0 500 Q 100 450 200 500 T 400 500" fill="none" stroke={colors.primary + '05'} strokeWidth="50" />
        <Rect x={width - 80} y="800" width="100" height="100" rx="30" transform="rotate(20)" fill={colors.secondary + '05'} />
      </Svg>
    </View>
  );

  const renderFasilitasItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.surface }, colors.shadowSoft]}>
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: colors.tertiary + '15' }]}>
          <MaterialCommunityIcons name="office-building" size={26} color={colors.tertiary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.fasilitasName, { color: colors.textPrimary }]} numberOfLines={1}>{item.nama}</Text>
          <Text style={[styles.kode, { color: colors.textSecondary }]}>KODE: {item.kode}</Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: colors.background }]}>
          <Text style={[styles.categoryBadgeText, { color: colors.textSecondary }]}>{item.kategori}</Text>
        </View>
      </View>
      <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.primary + '10' }]} 
          onPress={() => navigation.navigate('FormFasilitas', { fasilitas: item })}
        >
          <MaterialCommunityIcons name="pencil-box-outline" size={18} color={colors.primary} />
          <Text style={[styles.actionBtnText, { color: colors.primary }]}>Ubah</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.error + '10' }]} 
          onPress={() => handleDeleteFasilitas(item.id, item.nama)}
        >
          <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.error} />
          <Text style={[styles.actionBtnText, { color: colors.error }]}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <DecorativeBackground />
      
      <View style={[styles.headerSection, { backgroundColor: colors.tertiary }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manajemen Fasilitas</Text>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]} onPress={() => navigation.navigate('FormFasilitas')}>
            <MaterialCommunityIcons name="plus-box-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.searchWrapper, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <MaterialCommunityIcons name="magnify" size={20} color="rgba(255,255,255,0.8)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari berdasarkan nama atau kode..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={colors.tertiary} />
          <Text style={[styles.loaderText, { color: colors.textSecondary }]}>Sinkronisasi data fasilitas...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredFasilitas}
          renderItem={renderFasilitasItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.tertiary]} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={[styles.emptyIconBox, { backgroundColor: colors.tertiary + '08' }]}>
                <MaterialCommunityIcons name="office-building-marker-outline" size={80} color={colors.tertiary + '20'} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Fasilitas Kosong</Text>
              <Text style={[styles.emptySub, { color: colors.textDisabled }]}>Belum ada data fasilitas yang ditambahkan</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: { padding: 24, paddingTop: 20, borderBottomLeftRadius: 35, borderBottomRightRadius: 35, elevation: 8 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  addBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  
  searchWrapper: { flexDirection: 'row', alignItems: 'center', height: 54, borderRadius: 18, paddingHorizontal: 16 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 14, color: '#FFF', fontWeight: '500' },
  
  listContainer: { padding: 24, paddingBottom: 40 },
  card: { borderRadius: 30, padding: 20, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 16 },
  fasilitasName: { fontSize: 16, fontWeight: 'bold' },
  kode: { fontSize: 12, marginTop: 4, fontWeight: '700' },
  categoryBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  categoryBadgeText: { fontSize: 10, fontWeight: '800' },
  
  cardActions: { flexDirection: 'row', marginTop: 20, paddingTop: 20, borderTopWidth: 1, gap: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 44, borderRadius: 14, gap: 8 },
  actionBtnText: { fontSize: 13, fontWeight: 'bold' },
  
  loaderBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 16, fontWeight: '600' },
  
  emptyBox: { flex: 1, alignItems: 'center', marginTop: 60 },
  emptyIconBox: { width: 120, height: 120, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold' },
  emptySub: { fontSize: 14, marginTop: 8, fontWeight: '500' },
});

export default FasilitasManagementScreen;
