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
import dosenService from '../../services/dosenService';

const { width } = Dimensions.get('window');

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

  const DecorativeBackground = () => (
    <View style={StyleSheet.absoluteFill}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Circle cx={width} cy="200" r="100" fill={colors.primary + '08'} />
        <Path d="M0 450 Q 50 400 100 450 T 200 450" fill="none" stroke={colors.secondary + '05'} strokeWidth="40" />
        <Rect x={width - 60} y="700" width="100" height="100" rx="20" transform="rotate(30)" fill={colors.tertiary + '05'} />
      </Svg>
    </View>
  );

  const renderDosenItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.surface }, colors.shadowSoft]}>
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.primary + '15' }]}>
          <Text style={[styles.avatarText, { color: colors.primary }]}>
            {item.nama ? item.nama.substring(0, 2).toUpperCase() : 'DS'}
          </Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.dosenName, { color: colors.textPrimary }]} numberOfLines={1}>{item.nama}</Text>
          <Text style={[styles.nip, { color: colors.textSecondary }]}>NIP. {item.nip || '-'}</Text>
        </View>
      </View>
      <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.primary + '10' }]} 
          onPress={() => navigation.navigate('FormDosen', { dosen: item })}
        >
          <MaterialCommunityIcons name="account-edit-outline" size={18} color={colors.primary} />
          <Text style={[styles.actionBtnText, { color: colors.primary }]}>Ubah</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: colors.error + '10' }]} 
          onPress={() => handleDeleteDosen(item.id, item.nama)}
        >
          <MaterialCommunityIcons name="account-remove-outline" size={18} color={colors.error} />
          <Text style={[styles.actionBtnText, { color: colors.error }]}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <DecorativeBackground />
      
      <View style={[styles.headerSection, { backgroundColor: colors.primaryDark }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manajemen Dosen</Text>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]} onPress={() => navigation.navigate('FormDosen')}>
            <MaterialCommunityIcons name="account-plus-outline" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        <View style={[styles.searchWrapper, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
          <MaterialCommunityIcons name="magnify" size={20} color="rgba(255,255,255,0.8)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari berdasarkan nama atau NIP..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loaderText, { color: colors.textSecondary }]}>Memuat data dosen...</Text>
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
              <View style={[styles.emptyIconBox, { backgroundColor: colors.primary + '08' }]}>
                <MaterialCommunityIcons name="account-search-outline" size={80} color={colors.primary + '20'} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Dosen Tidak Ditemukan</Text>
              <Text style={[styles.emptySub, { color: colors.textDisabled }]}>Pastikan kata kunci pencarian benar</Text>
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
  avatar: { width: 54, height: 54, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 18, fontWeight: 'bold' },
  cardInfo: { flex: 1, marginLeft: 16 },
  dosenName: { fontSize: 16, fontWeight: 'bold' },
  nip: { fontSize: 13, marginTop: 4, fontWeight: '600' },
  
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

export default DosenManagementScreen;
