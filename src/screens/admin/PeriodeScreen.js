import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Path, Rect } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import periodeService from '../../services/periodeService';
import evaluasiService from '../../services/evaluasiService';
import { formatDate } from '../../utils/helpers';

const { width } = Dimensions.get('window');

const PeriodeScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [periodes, setPeriodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPeriodes();
  }, []);

  const loadPeriodes = async () => {
    try {
      setLoading(true);
      const data = await periodeService.getAllPeriode();
      setPeriodes(data);
    } catch (error) {
      console.error('Load periodes error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPeriodes();
    setRefreshing(false);
  };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'aktif' ? 'tidak_aktif' : 'aktif';
    try {
      await periodeService.updatePeriodeStatus(id, newStatus);
      loadPeriodes();
    } catch (error) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat memperbarui status periode.');
    }
  };

  const handleDelete = (id, nama, status) => {
    if (status === 'aktif') {
      Alert.alert('Gagal', 'Tidak dapat menghapus periode yang sedang aktif.');
      return;
    }

    Alert.alert('Hapus Periode', `Yakin ingin menghapus periode "${nama}"? Data evaluasi pada periode ini mungkin akan hilang.`, [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => {
        try {
          await evaluasiService.deletePeriode(id);
          loadPeriodes();
        } catch (error) {
          Alert.alert('Error', error?.response?.data?.message || 'Gagal menghapus periode');
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

  const renderPeriodeItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.surface }, colors.shadowSoft]}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'aktif' ? colors.success + '15' : colors.background }]}>
          <View style={[styles.statusDot, { backgroundColor: item.status === 'aktif' ? colors.success : colors.textDisabled }]} />
          <Text style={[styles.statusText, { color: item.status === 'aktif' ? colors.success : colors.textSecondary }]}>
            {item.status === 'aktif' ? 'AKTIF' : 'NON-AKTIF'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('FormPeriode', { periode: item })} style={[styles.iconAction, { backgroundColor: colors.primary + '10' }]}>
            <MaterialCommunityIcons name="pencil-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id, item.nama, item.status)} style={[styles.iconAction, { backgroundColor: colors.error + '10', marginLeft: 10 }]}>
            <MaterialCommunityIcons name="trash-can-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={[styles.periodeTitle, { color: colors.textPrimary }]}>{item.nama}</Text>
      
      <View style={[styles.dateBox, { backgroundColor: colors.background }]}>
        <View style={styles.dateItem}>
          <MaterialCommunityIcons name="calendar-play-outline" size={16} color={colors.primary} />
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>{formatDate(item.tanggal_mulai, 'DD MMM YYYY')}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={16} color={colors.textDisabled} />
        <View style={styles.dateItem}>
          <MaterialCommunityIcons name="calendar-stop-outline" size={16} color={colors.error} />
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>{formatDate(item.tanggal_akhir, 'DD MMM YYYY')}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.toggleBtn, { backgroundColor: item.status === 'aktif' ? colors.error + '10' : colors.primary + '10' }]}
        onPress={() => handleToggleStatus(item.id, item.status)}
      >
        <MaterialCommunityIcons 
          name={item.status === 'aktif' ? 'power-off' : 'power'} 
          size={18} 
          color={item.status === 'aktif' ? colors.error : colors.primary} 
        />
        <Text style={[styles.toggleBtnText, { color: item.status === 'aktif' ? colors.error : colors.primary }]}>
          {item.status === 'aktif' ? 'Nonaktifkan Sekarang' : 'Aktifkan Sekarang'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <DecorativeBackground />
      
      <View style={[styles.headerSection, { backgroundColor: colors.primary }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Periode Evaluasi</Text>
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]} onPress={() => navigation.navigate('FormPeriode')}>
            <MaterialCommunityIcons name="calendar-plus" size={22} color="#FFF" />
          </TouchableOpacity>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerInfoText}>Kelola jadwal pengisian kuesioner mahasiswa</Text>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loaderText, { color: colors.textSecondary }]}>Memuat periode...</Text>
        </View>
      ) : (
        <FlatList
          data={periodes}
          renderItem={renderPeriodeItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={[styles.emptyIconBox, { backgroundColor: colors.primary + '08' }]}>
                <MaterialCommunityIcons name="calendar-blank-outline" size={80} color={colors.primary + '20'} />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Belum Ada Periode</Text>
              <Text style={[styles.emptySub, { color: colors.textDisabled }]}>Silakan buat periode evaluasi baru</Text>
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
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  addBtn: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  headerInfo: { marginTop: 16 },
  headerInfoText: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },
  
  listContainer: { padding: 24, paddingBottom: 40 },
  card: { borderRadius: 30, padding: 24, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconAction: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  
  periodeTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  dateBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 20, marginBottom: 24 },
  dateItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dateText: { fontSize: 13, fontWeight: '700' },
  
  toggleBtn: { height: 50, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  toggleBtnText: { fontSize: 13, fontWeight: 'bold' },
  
  loaderBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 16, fontWeight: '600' },
  
  emptyBox: { flex: 1, alignItems: 'center', marginTop: 60 },
  emptyIconBox: { width: 120, height: 120, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold' },
  emptySub: { fontSize: 14, marginTop: 8, fontWeight: '500' },
});

export default PeriodeScreen;
