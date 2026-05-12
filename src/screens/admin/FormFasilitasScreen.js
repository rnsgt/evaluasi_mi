import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import fasilitasService, { KATEGORI_FASILITAS, ICON_OPTIONS } from '../../services/fasilitasService';

const { width } = Dimensions.get('window');

const FormFasilitasScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { mode = 'create', fasilitas: editData } = route.params || {};
  const isEdit = mode === 'edit';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    kategori: '',
    lokasi: '',
    kapasitas: '',
    icon: 'office-building',
    fasilitas: [],
  });

  const [fasilitasInput, setFasilitasInput] = useState('');
  const [showKategoriPicker, setShowKategoriPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        kode: editData.kode || '',
        nama: editData.nama || '',
        kategori: editData.kategori || '',
        lokasi: editData.lokasi || '',
        kapasitas: editData.kapasitas?.toString() || '',
        icon: editData.icon || 'office-building',
        fasilitas: editData.fasilitas || [],
      });
    }
  }, [isEdit, editData, mode]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'kode' ? value.toUpperCase() : value,
    }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleKapasitasChange = (delta) => {
    const current = parseInt(formData.kapasitas) || 0;
    const newValue = Math.max(0, current + delta);
    handleChange('kapasitas', newValue.toString());
  };

  const handleAddFasilitas = () => {
    const trimmed = fasilitasInput.trim();
    if (trimmed && !formData.fasilitas.includes(trimmed)) {
      setFormData((prev) => ({
        ...prev,
        fasilitas: [...prev.fasilitas, trimmed],
      }));
      setFasilitasInput('');
    }
  };

  const handleRemoveFasilitas = (index) => {
    setFormData((prev) => ({
      ...prev,
      fasilitas: prev.fasilitas.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.kode.trim()) newErrors.kode = 'Kode wajib diisi';
    if (!formData.nama.trim()) newErrors.nama = 'Nama wajib diisi';
    if (!formData.kategori) newErrors.kategori = 'Kategori wajib dipilih';
    if (!formData.lokasi.trim()) newErrors.lokasi = 'Lokasi wajib diisi';
    const kapasitasNum = parseInt(formData.kapasitas);
    if (!formData.kapasitas || isNaN(kapasitasNum) || kapasitasNum <= 0) newErrors.kapasitas = 'Kapasitas tidak valid';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const submitData = { ...formData, kapasitas: parseInt(formData.kapasitas) };
      if (isEdit) {
        await fasilitasService.updateFasilitas(editData.id, submitData);
        Alert.alert('Berhasil', 'Fasilitas diperbarui');
      } else {
        await fasilitasService.createFasilitas(submitData);
        Alert.alert('Berhasil', 'Fasilitas ditambahkan');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, field, icon, placeholder, keyboardType = 'default', multiline = false) => (
    <View style={styles.inputWrapper}>
      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.inputContainer, errors[field] && styles.inputError, { backgroundColor: colors.surface }]}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.tertiary} style={styles.inputIcon} />
        <TextInput
          style={[styles.textInput, multiline && styles.textArea, { color: colors.textPrimary }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textDisabled}
          value={formData[field]}
          onChangeText={(val) => handleChange(field, val)}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={multiline ? 4 : 1}
        />
      </View>
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.headerArea, { backgroundColor: colors.tertiary }]}>
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            <Circle cx={width} cy="0" r="100" fill="rgba(255,255,255,0.05)" />
            <Circle cx="0" cy="80" r="60" fill="rgba(255,255,255,0.03)" />
          </Svg>
          
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleBox}>
              <Text style={styles.headerTitle}>{isEdit ? 'Update Fasilitas' : 'Fasilitas Baru'}</Text>
              <Text style={styles.headerSubtitle}>Manajemen Master Data</Text>
            </View>
          </View>

          <View style={styles.iconPreviewCard}>
             <View style={[styles.mainIconCircle, { backgroundColor: colors.surface }]}>
                <MaterialCommunityIcons name={formData.icon} size={40} color={colors.tertiary} />
             </View>
             <View style={styles.iconInfoText}>
                <Text style={styles.previewName}>{formData.nama || 'Nama Fasilitas'}</Text>
                <Text style={styles.previewCode}>{formData.kode || 'KODE-000'}</Text>
             </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 30 }}>
          <View style={[styles.formCard, { backgroundColor: colors.surface }, styles.shadowSoft]}>
            {renderInput('Kode Fasilitas', 'kode', 'barcode-scan', 'Contoh: R-101')}
            {renderInput('Nama Fasilitas', 'nama', 'office-building', 'Contoh: Ruang Kelas A')}
            
            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Kategori Fasilitas</Text>
              <TouchableOpacity style={[styles.inputContainer, { backgroundColor: colors.surface }]} onPress={() => setShowKategoriPicker(true)}>
                <MaterialCommunityIcons name="shape-outline" size={20} color={colors.tertiary} style={styles.inputIcon} />
                <Text style={[styles.textInput, { color: formData.kategori ? colors.textPrimary : colors.textDisabled }]}>{formData.kategori || 'Pilih Kategori'}</Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textDisabled} />
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Visual Icon</Text>
              <TouchableOpacity style={[styles.inputContainer, { backgroundColor: colors.surface }]} onPress={() => setShowIconPicker(true)}>
                <MaterialCommunityIcons name={formData.icon} size={20} color={colors.tertiary} style={styles.inputIcon} />
                <Text style={[styles.textInput, { color: colors.textPrimary }]}>Ganti Icon</Text>
                <MaterialCommunityIcons name="image-edit-outline" size={20} color={colors.textDisabled} />
              </TouchableOpacity>
            </View>

            {renderInput('Lokasi', 'lokasi', 'map-marker-radius', 'Gedung, Lantai, No. Ruang')}
            
            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Kapasitas (Orang)</Text>
              <View style={styles.kapasitasControl}>
                <TouchableOpacity onPress={() => handleKapasitasChange(-5)} style={[styles.stepBtn, { backgroundColor: colors.tertiary + '15' }]}><MaterialCommunityIcons name="minus" size={20} color={colors.tertiary} /></TouchableOpacity>
                <TextInput style={[styles.kapasitasInput, { color: colors.textPrimary, borderBottomColor: colors.tertiary }]} value={formData.kapasitas} onChangeText={(val) => handleChange('kapasitas', val)} keyboardType="numeric" />
                <TouchableOpacity onPress={() => handleKapasitasChange(5)} style={[styles.stepBtn, { backgroundColor: colors.tertiary + '15' }]}><MaterialCommunityIcons name="plus" size={20} color={colors.tertiary} /></TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={[styles.tagCard, { backgroundColor: colors.surface }, styles.shadowSoft]}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary, marginBottom: 12 }]}>Kelengkapan Fasilitas</Text>
            <View style={styles.tagInputRow}>
              <TextInput style={[styles.tagInput, { color: colors.textPrimary, borderBottomColor: colors.border }]} placeholder="Tambah item (e.g. AC, Wifi)" value={fasilitasInput} onChangeText={setFasilitasInput} />
              <TouchableOpacity onPress={handleAddFasilitas} style={[styles.addTagBtn, { backgroundColor: colors.tertiary }]}><MaterialCommunityIcons name="plus" size={24} color="#FFF" /></TouchableOpacity>
            </View>
            <View style={styles.tagGrid}>
              {formData.fasilitas.map((item, idx) => (
                <View key={idx} style={[styles.tagChip, { backgroundColor: colors.tertiary + '10' }]}>
                  <Text style={[styles.tagText, { color: colors.tertiary }]}>{item}</Text>
                  <TouchableOpacity onPress={() => handleRemoveFasilitas(idx)}><MaterialCommunityIcons name="close-circle" size={16} color={colors.tertiary} /></TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.tertiary }]} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFF" /> : (
              <>
                <Text style={styles.saveBtnText}>{isEdit ? 'Update Data Sekarang' : 'Simpan Fasilitas'}</Text>
                <MaterialCommunityIcons name="check-decagram" size={20} color="#FFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Picker Modals */}
      <Modal visible={showKategoriPicker} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
           <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
              <Text style={styles.modalTitle}>Pilih Kategori</Text>
              {KATEGORI_FASILITAS.map(cat => (
                <TouchableOpacity key={cat} style={[styles.modalOption, formData.kategori === cat && { backgroundColor: colors.tertiary + '10' }]} onPress={() => { handleChange('kategori', cat); setShowKategoriPicker(false); }}>
                  <Text style={[styles.optionText, { color: formData.kategori === cat ? colors.tertiary : colors.textPrimary }]}>{cat}</Text>
                  {formData.kategori === cat && <MaterialCommunityIcons name="check" size={20} color={colors.tertiary} />}
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.closeModal} onPress={() => setShowKategoriPicker(false)}><Text style={{ color: colors.danger, fontWeight: 'bold' }}>BATAL</Text></TouchableOpacity>
           </View>
        </View>
      </Modal>

      <Modal visible={showIconPicker} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
           <View style={{ flex: 1 }} /><View style={[styles.iconModalBox, { backgroundColor: colors.surface }]}>
              <View style={styles.modalHeaderRow}><Text style={styles.modalTitle}>Visual Icon</Text><TouchableOpacity onPress={() => setShowIconPicker(false)}><MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} /></TouchableOpacity></View>
              <FlatList data={ICON_OPTIONS} numColumns={4} keyExtractor={item => item.name} renderItem={({ item }) => (
                  <TouchableOpacity style={[styles.iconItem, formData.icon === item.name && { borderColor: colors.tertiary, backgroundColor: colors.tertiary + '05' }]} onPress={() => { handleChange('icon', item.name); setShowIconPicker(false); }}>
                    <MaterialCommunityIcons name={item.name} size={30} color={formData.icon === item.name ? colors.tertiary : colors.textSecondary} />
                    <Text style={[styles.iconLabel, { color: colors.textSecondary }]} numberOfLines={1}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
           </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: { padding: 24, paddingTop: 50, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 25 },
  backBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitleBox: { flex: 1, marginLeft: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  
  iconPreviewCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 25 },
  mainIconCircle: { width: 70, height: 70, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  iconInfoText: { marginLeft: 15, flex: 1 },
  previewName: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  previewCode: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4, letterSpacing: 1 },

  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  
  formCard: { padding: 24, borderRadius: 30, marginBottom: 20 },
  inputWrapper: { marginBottom: 20 },
  inputLabel: { fontSize: 13, fontWeight: 'bold', marginBottom: 8, marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 1, borderColor: '#E5E7EB', paddingHorizontal: 15 },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, paddingVertical: 14, fontSize: 15, fontWeight: '500' },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  inputError: { borderColor: '#EF4444' },
  errorText: { color: '#EF4444', fontSize: 11, marginTop: 4, marginLeft: 4 },

  kapasitasControl: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  stepBtn: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  kapasitasInput: { flex: 1, textAlign: 'center', fontSize: 20, fontWeight: 'bold', borderBottomWidth: 2, paddingBottom: 5 },

  tagCard: { padding: 24, borderRadius: 30, marginBottom: 30 },
  tagInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  tagInput: { flex: 1, borderBottomWidth: 1, paddingVertical: 8, fontSize: 15 },
  addTagBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 6 },
  tagText: { fontSize: 13, fontWeight: '600' },

  saveBtn: { height: 60, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { borderRadius: 30, padding: 25 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalOption: { flexDirection: 'row', justifyContent: 'space-between', padding: 18, borderRadius: 15, marginBottom: 8 },
  optionText: { fontSize: 16, fontWeight: '600' },
  closeModal: { marginTop: 15, alignSelf: 'center', padding: 10 },
  iconModalBox: { borderRadius: 35, padding: 25, maxHeight: '80%' },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  iconItem: { flex: 1/4, aspectRatio: 1, justifyContent: 'center', alignItems: 'center', margin: 5, borderRadius: 15, borderWidth: 1, borderColor: '#F3F4F6' },
  iconLabel: { fontSize: 9, marginTop: 4, fontWeight: '500' },

  shadowSoft: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 5 },
});

export default FormFasilitasScreen;
