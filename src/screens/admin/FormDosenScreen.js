import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StatusBar,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import dosenService, { MATA_KULIAH_LIST } from '../../services/dosenService';

const { width } = Dimensions.get('window');

const FormDosenScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { mode = 'create', dosen: editData } = route.params || {};
  const isEdit = mode === 'edit';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nip: '',
    nama: '',
    mata_kuliah: [],
  });

  const [mataKuliahInput, setMataKuliahInput] = useState('');
  const [mataKuliahSuggestions, setMataKuliahSuggestions] = useState(
    MATA_KULIAH_LIST.slice(0, 8)
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        nip: editData.nip || '',
        nama: editData.nama || '',
        mata_kuliah: editData.mata_kuliah || [],
      });
    }
  }, [isEdit, editData, mode]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const handleMataKuliahInputChange = (value) => {
    setMataKuliahInput(value);
    const query = value.trim().toLowerCase();
    if (!query) {
      setMataKuliahSuggestions(MATA_KULIAH_LIST.slice(0, 8));
      return;
    }
    const filtered = MATA_KULIAH_LIST.filter((item) =>
      item.nama.toLowerCase().includes(query) || item.kode.toLowerCase().includes(query)
    );
    setMataKuliahSuggestions(filtered.length > 0 ? filtered : MATA_KULIAH_LIST.slice(0, 8));
  };

  const handleAddMataKuliah = (mataKuliahValue) => {
    const normalized = mataKuliahValue.trim();
    if (!normalized) return;
    setFormData((prev) => {
      if (prev.mata_kuliah.includes(normalized)) return prev;
      return { ...prev, mata_kuliah: [...prev.mata_kuliah, normalized] };
    });
    setMataKuliahInput('');
  };

  const handleRemoveMataKuliah = (mkName) => {
    setFormData((prev) => ({
      ...prev,
      mata_kuliah: prev.mata_kuliah.filter((mk) => mk !== mkName),
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nip.trim()) newErrors.nip = 'NIP wajib diisi';
    if (!formData.nama.trim()) newErrors.nama = 'Nama wajib diisi';
    if (formData.mata_kuliah.length === 0) newErrors.mata_kuliah = 'Pilih minimal 1 MK';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (isEdit) {
        await dosenService.updateDosen(editData.id, formData);
        Alert.alert('Berhasil', 'Data dosen diperbarui');
      } else {
        await dosenService.createDosen(formData);
        Alert.alert('Berhasil', 'Dosen berhasil ditambahkan');
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
        <MaterialCommunityIcons name={icon} size={20} color={colors.primary} style={styles.inputIcon} />
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
        <View style={[styles.headerArea, { backgroundColor: colors.primaryDark }]}>
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            <Circle cx={width} cy="0" r="100" fill="rgba(255,255,255,0.05)" />
            <Circle cx="0" cy="80" r="60" fill="rgba(255,255,255,0.03)" />
          </Svg>
          
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleBox}>
              <Text style={styles.headerTitle}>{isEdit ? 'Update Dosen' : 'Dosen Baru'}</Text>
              <Text style={styles.headerSubtitle}>Manajemen Sumber Daya</Text>
            </View>
          </View>

          <View style={styles.profilePreviewCard}>
             <View style={[styles.avatarCircle, { backgroundColor: colors.surface }]}>
                <MaterialCommunityIcons name="account-tie" size={40} color={colors.primary} />
             </View>
             <View style={styles.profileInfoText}>
                <Text style={styles.previewName}>{formData.nama || 'Nama Lengkap'}</Text>
                <Text style={styles.previewNip}>{formData.nip || 'NIP - Belum Diisi'}</Text>
             </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 30 }}>
          <View style={[styles.formCard, { backgroundColor: colors.surface }, styles.shadowSoft]}>
            {renderInput('NIP', 'nip', 'card-account-details-outline', '18 digit NIP', 'numeric')}
            {renderInput('Nama Lengkap', 'nama', 'account-edit-outline', 'Sertakan gelar akademik')}
          </View>

          <View style={[styles.mkCard, { backgroundColor: colors.surface }, styles.shadowSoft]}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary, marginBottom: 12 }]}>Pengampu Mata Kuliah</Text>
            <View style={styles.mkInputRow}>
              <TextInput
                style={[styles.mkInput, { color: colors.textPrimary, borderBottomColor: colors.border }]}
                placeholder="Cari atau ketik Mata Kuliah"
                value={mataKuliahInput}
                onChangeText={handleMataKuliahInputChange}
              />
              <TouchableOpacity onPress={() => handleAddMataKuliah(mataKuliahInput)} style={[styles.addMkBtn, { backgroundColor: colors.primary }]}>
                <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestionRow}>
              {mataKuliahSuggestions.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[styles.suggestionChip, { backgroundColor: colors.primary + '08' }]}
                  onPress={() => handleAddMataKuliah(item.nama)}
                >
                  <Text style={[styles.suggestionText, { color: colors.primary }]}>{item.nama}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <View style={styles.tagGrid}>
              {formData.mata_kuliah.map((mk, idx) => (
                <View key={idx} style={[styles.tagChip, { backgroundColor: colors.primary + '10' }]}>
                  <Text style={[styles.tagText, { color: colors.primary }]}>{typeof mk === 'object' ? mk.nama : mk}</Text>
                  <TouchableOpacity onPress={() => handleRemoveMataKuliah(typeof mk === 'object' ? mk.nama : mk)}>
                    <MaterialCommunityIcons name="close-circle" size={16} color={colors.primary} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : (
              <>
                <Text style={styles.saveBtnText}>{isEdit ? 'Update Data Sekarang' : 'Simpan Dosen'}</Text>
                <MaterialCommunityIcons name="content-save-check" size={20} color="#FFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerArea: { padding: 24, paddingTop: 50, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  backBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitleBox: { flex: 1, marginLeft: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  
  profilePreviewCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 25 },
  avatarCircle: { width: 70, height: 70, borderRadius: 35, justifyContent: 'center', alignItems: 'center' },
  profileInfoText: { marginLeft: 15, flex: 1 },
  previewName: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  previewNip: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

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

  mkCard: { padding: 24, borderRadius: 30, marginBottom: 30 },
  mkInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  mkInput: { flex: 1, borderBottomWidth: 1, paddingVertical: 8, fontSize: 15 },
  addMkBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  suggestionRow: { marginBottom: 20 },
  suggestionChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 12, marginRight: 8, borderStyle: 'dashed', borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
  suggestionText: { fontSize: 12, fontWeight: '600' },
  tagGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, gap: 6 },
  tagText: { fontSize: 13, fontWeight: '600' },

  saveBtn: { height: 60, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  shadowSoft: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 5 },
});

export default FormDosenScreen;
