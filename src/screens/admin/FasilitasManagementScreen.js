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
  Modal,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
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
  const [selectedFasilitas, setSelectedFasilitas] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    loadFasilitas();
    const unsubscribe = navigation.addListener('focus', () => {
      loadFasilitas();
    });
    return unsubscribe;
  }, [navigation]);

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

  const renderFasilitasItem = ({ item }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.surface }, styles.shadowSoft]}
      onPress={() => {
        setSelectedFasilitas(item);
        setShowDetail(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.iconBox, { backgroundColor: colors.tertiary + '10' }]}>
          <MaterialCommunityIcons name={item.icon || 'office-building'} size={30} color={colors.tertiary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.fasilitasName, { color: colors.textPrimary }]} numberOfLines={1}>{item.nama}</Text>
          <Text style={[styles.kode, { color: colors.textSecondary }]}>{item.kode} • {item.kategori}</Text>
        </View>
        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={() => navigation.navigate('FormFasilitas', { mode: 'edit', fasilitas: item })}
        >
          <MaterialCommunityIcons name="pencil-circle" size={32} color={colors.tertiary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.locationSection}>
        <MaterialCommunityIcons name="map-marker-radius-outline" size={14} color={colors.textDisabled} />
        <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>{item.lokasi || 'Lokasi tidak diatur'}</Text>
      </View>

      <View style={styles.capacityBadge}>
        <MaterialCommunityIcons name="account-group-outline" size={12} color={colors.tertiary} />
        <Text style={[styles.capacityText, { color: colors.tertiary }]}>{item.kapasitas || 0} Kapasitas</Text>
      </View>

      <TouchableOpacity 
        style={styles.deleteAction}
        onPress={() => handleDeleteFasilitas(item.id, item.nama)}
      >
        <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={[styles.headerSection, { backgroundColor: colors.tertiary }]}>
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
          <Circle cx={width} cy="0" r="150" fill="rgba(255,255,255,0.05)" />
          <Circle cx="0" cy="100" r="80" fill="rgba(255,255,255,0.03)" />
        </Svg>
        
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Manajemen Fasilitas</Text>
            <Text style={styles.headerSubtitle}>{fasilitas.length} Infrastruktur Kampus</Text>
          </View>
          <TouchableOpacity 
            style={[styles.addBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]} 
            onPress={() => navigation.navigate('FormFasilitas')}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.searchWrapper, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <MaterialCommunityIcons name="magnify" size={22} color="rgba(255,255,255,0.8)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari fasilitas..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={colors.tertiary} />
          <Text style={[styles.loaderText, { color: colors.textSecondary }]}>Memuat data...</Text>
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
              <MaterialCommunityIcons name="office-building-marker-outline" size={80} color={colors.textDisabled} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Data Kosong</Text>
              <Text style={[styles.emptySub, { color: colors.textDisabled }]}>Silakan tambah fasilitas baru</Text>
            </View>
          }
        />
      )}

      {/* Detail Modal */}
      <Modal visible={showDetail} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalIndicator} />
            <ScrollView contentContainerStyle={styles.modalBody}>
               <View style={styles.detailHeader}>
                  <View style={[styles.largeIconBox, { backgroundColor: colors.tertiary + '10' }]}>
                    <MaterialCommunityIcons name={selectedFasilitas?.icon || 'office-building'} size={60} color={colors.tertiary} />
                  </View>
                  <Text style={[styles.detailNama, { color: colors.textPrimary }]}>{selectedFasilitas?.nama}</Text>
                  <Text style={[styles.detailKode, { color: colors.textSecondary }]}>{selectedFasilitas?.kode} • {selectedFasilitas?.kategori}</Text>
               </View>

               <View style={styles.infoGrid}>
                  <View style={[styles.infoItem, { backgroundColor: colors.background }]}>
                     <MaterialCommunityIcons name="map-marker" size={20} color={colors.tertiary} />
                     <Text style={[styles.infoLabel, { color: colors.textDisabled }]}>LOKASI</Text>
                     <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{selectedFasilitas?.lokasi || '-'}</Text>
                  </View>
                  <View style={[styles.infoItem, { backgroundColor: colors.background }]}>
                     <MaterialCommunityIcons name="account-group" size={20} color={colors.tertiary} />
                     <Text style={[styles.infoLabel, { color: colors.textDisabled }]}>KAPASITAS</Text>
                     <Text style={[styles.infoValue, { color: colors.textPrimary }]}>{selectedFasilitas?.kapasitas || 0} Orang</Text>
                  </View>
               </View>

               <View style={styles.divider} />

               <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Kelengkapan & Fasilitas</Text>
               <View style={styles.tagGrid}>
                  {selectedFasilitas?.fasilitas?.map((tag, idx) => (
                    <View key={idx} style={[styles.tagBadge, { backgroundColor: colors.tertiary + '08' }]}>
                      <MaterialCommunityIcons name="check-circle-outline" size={14} color={colors.tertiary} />
                      <Text style={[styles.tagBadgeText, { color: colors.tertiary }]}>{tag}</Text>
                    </View>
                  ))}
               </View>
            </ScrollView>
            <TouchableOpacity 
              style={[styles.closeBtn, { backgroundColor: colors.tertiary }]} 
              onPress={() => setShowDetail(false)}
            >
              <Text style={styles.closeBtnText}>Tutup Detail</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: { padding: 24, paddingTop: 50, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden', elevation: 10 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
  backBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitleBox: { flex: 1, marginLeft: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  addBtn: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', height: 55, borderRadius: 20, paddingHorizontal: 18 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, color: '#FFF', fontWeight: '500' },

  listContainer: { padding: 24, paddingBottom: 40 },
  card: { borderRadius: 30, padding: 20, marginBottom: 18, position: 'relative' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  iconBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 15 },
  fasilitasName: { fontSize: 16, fontWeight: 'bold' },
  kode: { fontSize: 12, marginTop: 2, fontWeight: '600' },
  editBtn: { marginLeft: 10 },

  locationSection: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10 },
  locationText: { fontSize: 13, fontWeight: '500' },
  
  capacityBadge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.03)' },
  capacityText: { fontSize: 11, fontWeight: 'bold' },

  deleteAction: { position: 'absolute', bottom: 15, right: 20 },

  loaderBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 15, fontWeight: '600' },
  emptyBox: { flex: 1, alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  emptySub: { fontSize: 14, marginTop: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 40, borderTopRightRadius: 40, padding: 24, maxHeight: '85%' },
  modalIndicator: { width: 50, height: 6, backgroundColor: '#E5E7EB', borderRadius: 3, alignSelf: 'center', marginBottom: 20 },
  modalBody: { paddingBottom: 30 },
  detailHeader: { alignItems: 'center', marginBottom: 25 },
  largeIconBox: { width: 100, height: 100, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  detailNama: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  detailKode: { fontSize: 14, marginTop: 5 },
  
  infoGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  infoItem: { flex: 1, padding: 15, borderRadius: 20, alignItems: 'center' },
  infoLabel: { fontSize: 9, fontWeight: 'bold', marginTop: 4, letterSpacing: 0.5 },
  infoValue: { fontSize: 14, fontWeight: '700', marginTop: 2 },

  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },
  sectionLabel: { fontSize: 13, fontWeight: 'bold', marginBottom: 12 },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  tagBadgeText: { fontSize: 13, fontWeight: '600' },
  closeBtn: { marginTop: 20, height: 55, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  shadowSoft: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
});

export default FasilitasManagementScreen;
