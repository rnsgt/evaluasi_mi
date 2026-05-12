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
import Svg, { Circle } from 'react-native-svg';
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
    const unsubscribe = navigation.addListener('focus', () => {
      loadPeriodes();
    });
    return unsubscribe;
  }, [navigation]);

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
    try {
      if (currentStatus === 'aktif') {
        await periodeService.deactivatePeriode(id);
      } else {
        await periodeService.activatePeriode(id);
      }
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

    Alert.alert('Hapus Periode', `Yakin ingin menghapus periode "${nama}"?`, [
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

  const renderPeriodeItem = ({ item }) => (
    <View style={[styles.card, { backgroundColor: colors.surface }, styles.shadowSoft]}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'aktif' ? colors.success + '10' : '#F3F4F6' }]}>
          <View style={[styles.statusDot, { backgroundColor: item.status === 'aktif' ? colors.success : colors.textDisabled }]} />
          <Text style={[styles.statusText, { color: item.status === 'aktif' ? colors.success : colors.textSecondary }]}>
            {item.status === 'aktif' ? 'PERIODE AKTIF' : 'NON-AKTIF'}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('FormPeriode', { mode: 'edit', periode: item })}>
          <MaterialCommunityIcons name="cog-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <Text style={[styles.periodeTitle, { color: colors.textPrimary }]}>{item.nama}</Text>
      <Text style={[styles.tahunText, { color: colors.textSecondary }]}>Tahun Ajaran {item.tahun_ajaran} • {item.semester}</Text>

      <View style={[styles.timelineBox, { backgroundColor: colors.background }]}>
        <View style={styles.timelineItem}>
           <MaterialCommunityIcons name="calendar-play" size={18} color={colors.primary} />
           <View>
             <Text style={styles.timelineLabel}>MULAI</Text>
             <Text style={[styles.timelineValue, { color: colors.textPrimary }]}>{formatDate(item.tanggal_mulai, 'DD MMM YYYY')}</Text>
           </View>
        </View>
        <View style={styles.timelineItem}>
           <MaterialCommunityIcons name="calendar-stop" size={18} color={colors.error} />
           <View>
             <Text style={styles.timelineLabel}>SELESAI</Text>
             <Text style={[styles.timelineValue, { color: colors.textPrimary }]}>{formatDate(item.tanggal_akhir, 'DD MMM YYYY')}</Text>
           </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <TouchableOpacity 
          style={[styles.toggleBtn, { backgroundColor: item.status === 'aktif' ? colors.error + '10' : colors.primary + '10' }]}
          onPress={() => handleToggleStatus(item.id, item.status)}
        >
          <MaterialCommunityIcons 
            name={item.status === 'aktif' ? 'power-settings' : 'power-settings'} 
            size={18} 
            color={item.status === 'aktif' ? colors.error : colors.primary} 
          />
          <Text style={[styles.toggleBtnText, { color: item.status === 'aktif' ? colors.error : colors.primary }]}>
            {item.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan Sekarang'}
          </Text>
        </TouchableOpacity>
        
        {item.status !== 'aktif' && (
          <TouchableOpacity 
            style={[styles.deleteBtn, { backgroundColor: colors.error + '08' }]}
            onPress={() => handleDelete(item.id, item.nama, item.status)}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={20} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      <View style={[styles.headerSection, { backgroundColor: colors.primary }]}>
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
          <Circle cx={width} cy="0" r="150" fill="rgba(255,255,255,0.05)" />
          <Circle cx="0" cy="100" r="80" fill="rgba(255,255,255,0.03)" />
        </Svg>
        
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <View style={styles.headerTitleBox}>
            <Text style={styles.headerTitle}>Periode Evaluasi</Text>
            <Text style={styles.headerSubtitle}>Manajemen Waktu Pengisian</Text>
          </View>
          <TouchableOpacity 
            style={[styles.addBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]} 
            onPress={() => navigation.navigate('FormPeriode')}
          >
            <MaterialCommunityIcons name="calendar-plus" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loaderText, { color: colors.textSecondary }]}>Sinkronisasi jadwal...</Text>
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
              <MaterialCommunityIcons name="calendar-blank-outline" size={80} color={colors.textDisabled} />
              <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>Belum Ada Periode</Text>
              <Text style={[styles.emptySub, { color: colors.textDisabled }]}>Buat periode untuk memulai evaluasi</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerSection: { padding: 24, paddingTop: 50, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden', elevation: 10 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitleBox: { flex: 1, marginLeft: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  addBtn: { width: 42, height: 42, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  listContainer: { padding: 24, paddingBottom: 40 },
  card: { borderRadius: 30, padding: 24, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },

  periodeTitle: { fontSize: 18, fontWeight: 'bold' },
  tahunText: { fontSize: 13, marginTop: 4, marginBottom: 20 },

  timelineBox: { flexDirection: 'row', padding: 20, borderRadius: 25, gap: 20, marginBottom: 20 },
  timelineItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  timelineLabel: { fontSize: 9, fontWeight: 'bold', color: '#9CA3AF', letterSpacing: 1 },
  timelineValue: { fontSize: 13, fontWeight: '700', marginTop: 2 },

  cardFooter: { flexDirection: 'row', gap: 12 },
  toggleBtn: { flex: 1, height: 55, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  toggleBtnText: { fontSize: 14, fontWeight: 'bold' },
  deleteBtn: { width: 55, height: 55, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },

  loaderBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 15, fontWeight: '600' },
  emptyBox: { flex: 1, alignItems: 'center', marginTop: 100 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20 },
  emptySub: { fontSize: 14, marginTop: 8 },

  shadowSoft: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
});

export default PeriodeScreen;
