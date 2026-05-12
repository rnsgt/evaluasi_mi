import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import periodeService from '../../services/periodeService';

const { width } = Dimensions.get('window');

const FormPeriodeScreen = ({ navigation, route }) => {
  const { colors } = useTheme();
  const { mode = 'create', periode = null } = route.params || {};
  const isEdit = mode === 'edit';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama: '',
    tahun_ajaran: '',
    semester: 'Ganjil',
    tanggal_mulai: new Date(),
    tanggal_akhir: new Date(),
    batas_evaluasi: new Date(),
    keterangan: '',
  });

  const [showSemesterModal, setShowSemesterModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState({
    mulai: false,
    akhir: false,
    batas: false,
  });

  const semesterOptions = ['Ganjil', 'Genap'];

  useEffect(() => {
    if (isEdit && periode) {
      setFormData({
        nama: periode.nama,
        tahun_ajaran: periode.tahun_ajaran,
        semester: periode.semester,
        tanggal_mulai: new Date(periode.tanggal_mulai),
        tanggal_akhir: new Date(periode.tanggal_akhir),
        batas_evaluasi: new Date(periode.batas_evaluasi),
        keterangan: periode.keterangan || '',
      });
    }
  }, [isEdit, periode]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (field, event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker({ mulai: false, akhir: false, batas: false });
    }
    if (selectedDate) {
      handleChange(field, selectedDate);
      if (Platform.OS === 'ios') {
        setShowDatePicker({ mulai: false, akhir: false, batas: false });
      }
    }
  };

  const validateForm = () => {
    if (!formData.nama.trim()) {
      Alert.alert('Validasi', 'Nama periode harus diisi');
      return false;
    }
    if (!formData.tahun_ajaran.trim()) {
      Alert.alert('Validasi', 'Tahun ajaran harus diisi');
      return false;
    }
    const mulai = formatDate(formData.tanggal_mulai);
    const akhir = formatDate(formData.tanggal_akhir);
    const batas = formatDate(formData.batas_evaluasi);
    const validation = periodeService.validatePeriodeDates(mulai, akhir, batas);
    if (!validation.valid) {
      Alert.alert('Validasi', validation.message);
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    try {
      setLoading(true);
      const submitData = {
        ...formData,
        tanggal_mulai: formatDate(formData.tanggal_mulai),
        tanggal_akhir: formatDate(formData.tanggal_akhir),
        batas_evaluasi: formatDate(formData.batas_evaluasi),
      };
      if (isEdit) {
        await periodeService.updatePeriode(periode.id, submitData);
        Alert.alert('Berhasil', 'Periode diperbarui');
      } else {
        await periodeService.createPeriode(submitData);
        Alert.alert('Berhasil', 'Periode dibuat');
      }
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Gagal menyimpan periode');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, field, icon, placeholder) => (
    <View style={styles.inputWrapper}>
      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
      <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.primary} style={styles.inputIcon} />
        <TextInput
          style={[styles.textInput, { color: colors.textPrimary }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textDisabled}
          value={formData[field]}
          onChangeText={(val) => handleChange(field, val)}
          editable={!loading}
        />
      </View>
    </View>
  );

  const renderDatePicker = (label, field, icon) => (
    <View style={styles.inputWrapper}>
      <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>{label}</Text>
      <TouchableOpacity 
        style={[styles.inputContainer, { backgroundColor: colors.surface }]}
        onPress={() => setShowDatePicker({ [field.split('_')[1]]: true })}
        disabled={loading}
      >
        <MaterialCommunityIcons name={icon} size={20} color={colors.primary} style={styles.inputIcon} />
        <Text style={[styles.textInput, { color: colors.textPrimary }]}>
          {formatDate(formData[field])}
        </Text>
        <MaterialCommunityIcons name="calendar-edit" size={20} color={colors.textDisabled} />
      </TouchableOpacity>
      {showDatePicker[field.split('_')[1]] && (
        <DateTimePicker
          value={formData[field]}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(e, date) => handleDateChange(field, e, date)}
        />
      )}
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
              <Text style={styles.headerTitle}>{isEdit ? 'Update Periode' : 'Periode Baru'}</Text>
              <Text style={styles.headerSubtitle}>Manajemen Kalender Akademik</Text>
            </View>
          </View>

          <View style={styles.infoPreviewCard}>
             <View style={[styles.statusCircle, { backgroundColor: colors.surface }]}>
                <MaterialCommunityIcons name="calendar-clock" size={36} color={colors.primary} />
             </View>
             <View style={styles.infoTextContainer}>
                <Text style={styles.previewName}>{formData.nama || 'Nama Periode'}</Text>
                <Text style={styles.previewYear}>{formData.tahun_ajaran || '20XX/20XX'} • {formData.semester}</Text>
             </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: 24, paddingTop: 30 }}>
          <View style={[styles.formCard, { backgroundColor: colors.surface }, styles.shadowSoft]}>
            {renderInput('Nama Periode', 'nama', 'rename-box', 'Semester Ganjil 2024/2025')}
            {renderInput('Tahun Ajaran', 'tahun_ajaran', 'calendar-range', '2024/2025')}

            <View style={styles.inputWrapper}>
              <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Semester</Text>
              <TouchableOpacity 
                style={[styles.inputContainer, { backgroundColor: colors.surface }]}
                onPress={() => setShowSemesterModal(true)}
                disabled={loading}
              >
                <MaterialCommunityIcons name="form-select" size={20} color={colors.primary} style={styles.inputIcon} />
                <Text style={[styles.textInput, { color: colors.textPrimary }]}>{formData.semester}</Text>
                <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textDisabled} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.formCard, { backgroundColor: colors.surface }, styles.shadowSoft]}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary, marginBottom: 15 }]}>Pengaturan Tanggal</Text>
            {renderDatePicker('Tanggal Mulai', 'tanggal_mulai', 'calendar-play')}
            {renderDatePicker('Tanggal Akhir', 'tanggal_akhir', 'calendar-check')}
            {renderDatePicker('Batas Evaluasi', 'batas_evaluasi', 'clock-alert-outline')}
          </View>

          <View style={[styles.formCard, { backgroundColor: colors.surface }, styles.shadowSoft]}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Keterangan Tambahan</Text>
            <View style={[styles.inputContainer, { backgroundColor: colors.surface, alignItems: 'flex-start' }]}>
              <TextInput
                style={[styles.textInput, { color: colors.textPrimary, minHeight: 80 }]}
                placeholder="Catatan tambahan (opsional)"
                value={formData.keterangan}
                onChangeText={(val) => handleChange('keterangan', val)}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.saveBtn, { backgroundColor: colors.primary }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : (
              <>
                <Text style={styles.saveBtnText}>{isEdit ? 'Update Periode Sekarang' : 'Simpan Periode'}</Text>
                <MaterialCommunityIcons name="calendar-plus" size={20} color="#FFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Semester Modal */}
      <Modal visible={showSemesterModal} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
           <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
              <Text style={styles.modalTitle}>Pilih Semester</Text>
              {semesterOptions.map(opt => (
                <TouchableOpacity 
                  key={opt} 
                  style={[styles.modalOption, formData.semester === opt && { backgroundColor: colors.primary + '10' }]}
                  onPress={() => { handleChange('semester', opt); setShowSemesterModal(false); }}
                >
                  <Text style={[styles.optionText, { color: formData.semester === opt ? colors.primary : colors.textPrimary }]}>{opt}</Text>
                  {formData.semester === opt && <MaterialCommunityIcons name="check" size={20} color={colors.primary} />}
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.closeModal} onPress={() => setShowSemesterModal(false)}>
                <Text style={{ color: colors.danger, fontWeight: 'bold' }}>BATAL</Text>
              </TouchableOpacity>
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
  
  infoPreviewCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: 15, borderRadius: 25 },
  statusCircle: { width: 65, height: 65, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  infoTextContainer: { marginLeft: 15, flex: 1 },
  previewName: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  previewYear: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },

  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  
  formCard: { padding: 24, borderRadius: 30, marginBottom: 20 },
  inputWrapper: { marginBottom: 18 },
  inputLabel: { fontSize: 13, fontWeight: 'bold', marginBottom: 8, marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 1, borderColor: '#F3F4F6', paddingHorizontal: 15 },
  inputIcon: { marginRight: 12 },
  textInput: { flex: 1, paddingVertical: 14, fontSize: 15, fontWeight: '500' },

  saveBtn: { height: 60, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalBox: { borderRadius: 30, padding: 25 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  modalOption: { flexDirection: 'row', justifyContent: 'space-between', padding: 18, borderRadius: 15, marginBottom: 8 },
  optionText: { fontSize: 16, fontWeight: '600' },
  closeModal: { marginTop: 15, alignSelf: 'center', padding: 10 },

  shadowSoft: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 5 },
});

export default FormPeriodeScreen;
