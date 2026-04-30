import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  SectionList,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import evaluasiService from '../../services/evaluasiService';

const KuesionerManagementScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { type } = route.params || { type: 'dosen' }; // 'dosen' or 'fasilitas'
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statements, setStatements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedStatement, setSelectedStatement] = useState(null);
  
  // Form state
  const [kategori, setKategori] = useState('');
  const [pernyataan, setPernyataan] = useState('');

  const categories = type === 'dosen' 
    ? ['Penguasaan Materi', 'Metode Pengajaran', 'Komunikasi', 'Penilaian', 'Kedisiplinan']
    : ['Kebersihan', 'Kelengkapan', 'Kenyamanan', 'Aksesibilitas'];

  const groupedStatements = statements.reduce((acc, curr) => {
    const existingCategory = acc.find(item => item.title === curr.kategori);
    if (existingCategory) {
      existingCategory.data.push(curr);
    } else {
      acc.push({ title: curr.kategori, data: [curr] });
    }
    return acc;
  }, []);

  // Sort by category name, then by urutan
  groupedStatements.forEach(group => {
    group.data.sort((a, b) => a.urutan - b.urutan);
  });
  groupedStatements.sort((a, b) => a.title.localeCompare(b.title));

  useEffect(() => {
    loadStatements();
  }, [type]);

  const loadStatements = async () => {
    try {
      setLoading(true);
      const data = await evaluasiService.getAdminStatements(type);
      setStatements(data);
    } catch (error) {
      console.error('Load statements error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStatements();
    setRefreshing(false);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setSelectedStatement(item);
      setKategori(item.kategori);
      setPernyataan(item.pernyataan);
    } else {
      setSelectedStatement(null);
      setKategori(categories[0]); // default to first category
      setPernyataan('');
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!kategori || !pernyataan) {
      Alert.alert('Error', 'Semua field harus diisi');
      return;
    }

    try {
      setLoading(true);
      if (selectedStatement) {
        const payload = { kategori, pernyataan, urutan: selectedStatement.urutan };
        await evaluasiService.updateAdminStatement(type, selectedStatement.id, payload);
        Alert.alert('Berhasil', 'Pertanyaan berhasil diperbarui');
      } else {
        const maxUrutan = statements.length > 0 ? Math.max(...statements.map(s => s.urutan || 0)) : 0;
        const payload = { kategori, pernyataan, urutan: maxUrutan + 1 };
        await evaluasiService.addAdminStatement(type, payload);
        Alert.alert('Berhasil', 'Pertanyaan berhasil ditambahkan');
      }
      
      setShowModal(false);
      loadStatements();
    } catch (error) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert('Hapus Pertanyaan', 'Yakin ingin menghapus butir pertanyaan ini?', [
      { text: 'Batal', style: 'cancel' },
      { text: 'Hapus', style: 'destructive', onPress: async () => {
        try {
          await evaluasiService.deleteAdminStatement(type, id);
          loadStatements();
        } catch (error) {
          Alert.alert('Gagal', 'Gagal menghapus data');
        }
      }},
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Urutan: {item.urutan}</Text>
        </View>
      </View>
      <Text style={styles.pernyataanText}>{item.pernyataan}</Text>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.editBtn} onPress={() => handleOpenModal(item)}>
          <MaterialCommunityIcons name="pencil-outline" size={18} color="#2563EB" />
          <Text style={styles.editBtnText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item.id)}>
          <MaterialCommunityIcons name="trash-can-outline" size={18} color="#EF4444" />
          <Text style={styles.deleteBtnText}>Hapus</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kuesioner {type === 'dosen' ? 'Dosen' : 'Fasilitas'}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => handleOpenModal()}>
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <SectionList
        sections={groupedStatements}
        renderItem={renderItem}
        renderSectionHeader={({ section: { title } }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="comment-question-outline" size={80} color="#CBD5E1" />
              <Text style={styles.emptyText}>Belum ada butir pertanyaan</Text>
            </View>
          )
        }
      />

      <Modal visible={showModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedStatement ? 'Edit Pertanyaan' : 'Tambah Pertanyaan'}</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Kategori</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                  {categories.map((cat, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[styles.categoryChip, kategori === cat && styles.categoryChipActive]}
                      onPress={() => setKategori(cat)}
                    >
                      <Text style={[styles.categoryChipText, kategori === cat && styles.categoryChipTextActive]}>{cat}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Pernyataan / Pertanyaan</Text>
                <TextInput 
                  style={[styles.input, { height: 100, textAlignVertical: 'top' }]} 
                  value={pernyataan} 
                  onChangeText={setPernyataan} 
                  multiline 
                  placeholder="Isi butir pertanyaan..." 
                />
              </View>

              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Simpan Perubahan</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backBtn: { width: 40, height: 40, backgroundColor: '#F8FAFC', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  addBtn: { width: 40, height: 40, backgroundColor: '#2563EB', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  listContent: { padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'center', marginBottom: 12 },
  sectionHeader: { backgroundColor: '#F8FAFC', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginBottom: 12, marginTop: 16, borderLeftWidth: 4, borderLeftColor: '#3B82F6' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  badge: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, color: '#2563EB', fontWeight: 'bold' },
  orderText: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },
  pernyataanText: { fontSize: 15, color: '#1E293B', lineHeight: 22, marginBottom: 20 },
  actions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F1F5F9', paddingTop: 16 },
  editBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  editBtnText: { color: '#2563EB', fontSize: 13, fontWeight: 'bold', marginLeft: 8 },
  deleteBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8 },
  deleteBtnText: { color: '#EF4444', fontSize: 13, fontWeight: 'bold', marginLeft: 8 },
  emptyState: { alignItems: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, color: '#94A3B8' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, minHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  form: {},
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  input: { backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, padding: 16, fontSize: 15, color: '#0F172A' },
  categoryChip: { backgroundColor: '#F8FAFC', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: '#E2E8F0' },
  categoryChipActive: { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
  categoryChipText: { color: '#64748B', fontSize: 13, fontWeight: '600' },
  categoryChipTextActive: { color: '#3B82F6', fontWeight: 'bold' },
  saveBtn: { backgroundColor: '#2563EB', padding: 18, borderRadius: 16, alignItems: 'center', marginTop: 12 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default KuesionerManagementScreen;
