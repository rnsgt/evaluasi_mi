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
import dosenService from '../../services/dosenService';

const { width } = Dimensions.get('window');

const DosenManagementScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [dosen, setDosen] = useState([]);
  const [filteredDosen, setFilteredDosen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDosen, setSelectedDosen] = useState(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    loadDosen();
    const unsubscribe = navigation.addListener('focus', () => {
      loadDosen();
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredDosen(dosen.filter(d => 
        (d.nama && d.nama.toLowerCase().includes(searchQuery.toLowerCase())) || 
        (d.nip && d.nip.includes(searchQuery))
      ));
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
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: colors.surface }, styles.shadowSoft]}
      onPress={() => {
        setSelectedDosen(item);
        setShowDetail(true);
      }}
    >
      <View style={styles.cardHeader}>
        <View style={[styles.avatarBox, { backgroundColor: colors.primary + '10' }]}>
          <MaterialCommunityIcons name="account-tie" size={30} color={colors.primary} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.dosenName, { color: colors.textPrimary }]} numberOfLines={1}>{item.nama}</Text>
          <Text style={[styles.nip, { color: colors.textSecondary }]}>NIP. {item.nip || '-'}</Text>
        </View>
        <TouchableOpacity 
          style={styles.editBtn} 
          onPress={() => navigation.navigate('FormDosen', { mode: 'edit', dosen: item })}
        >
          <MaterialCommunityIcons name="pencil-circle" size={32} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.mkSection}>
        <Text style={[styles.mkLabel, { color: colors.textDisabled }]}>MATA KULIAH DIAMPU</Text>
        <View style={styles.mkBadges}>
          {item.mata_kuliah?.slice(0, 3).map((mk, idx) => (
            <View key={idx} style={[styles.mkBadge, { backgroundColor: colors.background }]}>
              <Text style={[styles.mkBadgeText, { color: colors.textSecondary }]} numberOfLines={1}>
                {typeof mk === 'object' ? mk.nama : mk}
              </Text>
            </View>
          ))}
          {item.mata_kuliah?.length > 3 && (
            <Text style={[styles.moreText, { color: colors.primary }]}>+{item.mata_kuliah.length - 3} lagi</Text>
          )}
        </View>
      </View>

      <TouchableOpacity 
        style={styles.deleteAction}
        onPress={() => handleDeleteDosen(item.id, item.nama)}
      >
        <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={[styles.headerSection, { backgroundColor: colors.primaryDark }]}>
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
          <Circle cx={width} cy="0" r="150" fill="rgba(255,255,255,0.05)" />
          <Circle cx="0" cy="100" r="80" fill="rgba(255,255,255,0.03)" />
        </Svg>
        
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Manajemen Dosen</Text>
            <Text style={styles.headerSubtitle}>{dosen.length} Tenaga Pengajar</Text>
          </View>
          <TouchableOpacity 
            style={[styles.addBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]} 
            onPress={() => navigation.navigate('FormDosen')}
          >
            <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.searchWrapper, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <MaterialCommunityIcons name="magnify" size={22} color="rgba(255,255,255,0.8)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama atau NIP..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loaderText, { color: colors.textSecondary }]}>Memuat data...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDosen}
          renderItem={renderDosenItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <MaterialCommunityIcons name="account-search-outline" size={80} color={colors.textDisabled} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Tidak Ditemukan</Text>
              <Text style={[styles.emptySub, { color: colors.textDisabled }]}>Belum ada data dosen</Text>
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
                  <View style={[styles.largeAvatar, { backgroundColor: colors.primary + '10' }]}>
                    <MaterialCommunityIcons name="account-tie" size={60} color={colors.primary} />
                  </View>
                  <Text style={[styles.detailNama, { color: colors.textPrimary }]}>{selectedDosen?.nama}</Text>
                  <Text style={[styles.detailNip, { color: colors.textSecondary }]}>NIP. {selectedDosen?.nip || '-'}</Text>
               </View>

               <View style={styles.divider} />

               <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Mata Kuliah Diamanahkan</Text>
               <View style={styles.mkFullList}>
                  {selectedDosen?.mata_kuliah?.map((mk, idx) => (
                    <View key={idx} style={[styles.mkBadgeLarge, { backgroundColor: colors.primary + '08' }]}>
                      <MaterialCommunityIcons name="book-open-variant" size={14} color={colors.primary} />
                      <Text style={[styles.mkBadgeTextLarge, { color: colors.primary }]}>
                        {typeof mk === 'object' ? mk.nama : mk}
                      </Text>
                    </View>
                  ))}
               </View>
            </ScrollView>
            <TouchableOpacity 
              style={[styles.closeBtn, { backgroundColor: colors.primary }]} 
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
  avatarBox: { width: 50, height: 50, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1, marginLeft: 15 },
  dosenName: { fontSize: 16, fontWeight: 'bold' },
  nip: { fontSize: 12, marginTop: 2, fontWeight: '600' },
  editBtn: { marginLeft: 10 },

  mkSection: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  mkLabel: { fontSize: 9, fontWeight: 'bold', letterSpacing: 1, marginBottom: 8 },
  mkBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  mkBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  mkBadgeText: { fontSize: 11, fontWeight: '600' },
  moreText: { fontSize: 11, fontWeight: 'bold', marginLeft: 4 },

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
  largeAvatar: { width: 100, height: 100, borderRadius: 35, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  detailNama: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  detailNip: { fontSize: 14, marginTop: 5 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginVertical: 10 },
  sectionLabel: { fontSize: 13, fontWeight: 'bold', marginBottom: 12 },
  mkFullList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mkBadgeLarge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  mkBadgeTextLarge: { fontSize: 13, fontWeight: '600' },
  closeBtn: { marginTop: 20, height: 55, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  closeBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  shadowSoft: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
});

export default DosenManagementScreen;
