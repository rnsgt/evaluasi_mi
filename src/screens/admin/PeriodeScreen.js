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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import periodeService from '../../services/periodeService';
import evaluasiService from '../../services/evaluasiService';
import { formatDate } from '../../utils/helpers';

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

  const renderPeriodeItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'aktif' ? '#DCFCE7' : '#F1F5F9' }]}>
          <View style={[styles.statusDot, { backgroundColor: item.status === 'aktif' ? '#22C55E' : '#94A3B8' }]} />
          <Text style={[styles.statusText, { color: item.status === 'aktif' ? '#166534' : '#475569' }]}>
            {item.status === 'aktif' ? 'AKTIF' : 'NON-AKTIF'}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => navigation.navigate('FormPeriode', { periode: item })} style={styles.iconAction}>
            <MaterialCommunityIcons name="pencil" size={20} color="#64748B" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id, item.nama, item.status)} style={[styles.iconAction, { marginLeft: 12 }]}>
            <MaterialCommunityIcons name="trash-can-outline" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>
      </View>
      
      <Text style={styles.periodeTitle}>{item.nama}</Text>
      <View style={styles.divider} />
      
      <View style={styles.dateRow}>
        <View style={styles.dateItem}>
          <MaterialCommunityIcons name="calendar-play" size={16} color="#64748B" />
          <Text style={styles.dateText}>{formatDate(item.tanggal_mulai, 'DD MMM YYYY')}</Text>
        </View>
        <MaterialCommunityIcons name="arrow-right" size={14} color="#CBD5E1" />
        <View style={styles.dateItem}>
          <MaterialCommunityIcons name="calendar-stop" size={16} color="#64748B" />
          <Text style={styles.dateText}>{formatDate(item.tanggal_akhir, 'DD MMM YYYY')}</Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.statusBtn, { backgroundColor: item.status === 'aktif' ? '#FEF2F2' : '#EFF6FF' }]}
        onPress={() => handleToggleStatus(item.id, item.status)}
      >
        <Text style={[styles.statusBtnText, { color: item.status === 'aktif' ? '#EF4444' : '#2563EB' }]}>
          {item.status === 'aktif' ? 'Nonaktifkan Periode' : 'Aktifkan Periode'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Periode Evaluasi</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('FormPeriode')}>
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={periodes}
        renderItem={renderPeriodeItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="calendar-search" size={80} color="#CBD5E1" />
              <Text style={styles.emptyText}>Belum ada periode evaluasi</Text>
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
  addButton: { width: 40, height: 40, backgroundColor: '#2563EB', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20, paddingBottom: 40 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 16, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  headerActions: { flexDirection: 'row', alignItems: 'center' },
  iconAction: { padding: 4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  statusText: { fontSize: 10, fontWeight: 'bold' },
  periodeTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 16 },
  dateRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  dateItem: { flexDirection: 'row', alignItems: 'center' },
  dateText: { fontSize: 13, color: '#475569', fontWeight: '600', marginLeft: 8 },
  statusBtn: { paddingVertical: 12, borderRadius: 14, alignItems: 'center' },
  statusBtnText: { fontSize: 13, fontWeight: 'bold' },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#94A3B8' },
});

export default PeriodeScreen;
