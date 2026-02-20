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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { colors, typography, spacing, borderRadius as radius } from '../../utils/theme';
import periodeService from '../../services/periodeService';

const FormPeriodeScreen = ({ navigation, route }) => {
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

    // Validate date logic
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
        Alert.alert('Berhasil', 'Periode berhasil diperbarui', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await periodeService.createPeriode(submitData);
        Alert.alert('Berhasil', 'Periode berhasil dibuat', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
    } catch (error) {
      console.error('Submit periode error:', error);
      Alert.alert('Error', 'Gagal menyimpan periode');
    } finally {
      setLoading(false);
    }
  };

  const renderSemesterModal = () => (
    <Modal
      visible={showSemesterModal}
      transparent
      animationType="fade"
      onRequestClose={() => setShowSemesterModal(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowSemesterModal(false)}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Pilih Semester</Text>
          {semesterOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[
                styles.modalOption,
                formData.semester === option && styles.modalOptionActive,
              ]}
              onPress={() => {
                handleChange('semester', option);
                setShowSemesterModal(false);
              }}
            >
              <Text
                style={[
                  styles.modalOptionText,
                  formData.semester === option && styles.modalOptionTextActive,
                ]}
              >
                {option}
              </Text>
              {formData.semester === option && (
                <MaterialCommunityIcons name="check" size={20} color={colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isEdit ? 'Edit Periode' : 'Buat Periode Baru'}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Nama Periode */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Nama Periode <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Semester Ganjil 2023/2024"
            value={formData.nama}
            onChangeText={(value) => handleChange('nama', value)}
            editable={!loading}
          />
          <Text style={styles.hint}>Nama periode yang akan ditampilkan</Text>
        </View>

        {/* Tahun Ajaran */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Tahun Ajaran <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: 2023/2024"
            value={formData.tahun_ajaran}
            onChangeText={(value) => handleChange('tahun_ajaran', value)}
            editable={!loading}
          />
          <Text style={styles.hint}>Format: YYYY/YYYY (contoh: 2023/2024)</Text>
        </View>

        {/* Semester */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Semester <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.pickerButton}
            onPress={() => setShowSemesterModal(true)}
            disabled={loading}
          >
            <Text style={styles.pickerButtonText}>{formData.semester}</Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Tanggal Mulai */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Tanggal Mulai <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker({ mulai: true, akhir: false, batas: false })}
            disabled={loading}
          >
            <MaterialCommunityIcons
              name="calendar"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={styles.dateButtonText}>
              {formatDate(formData.tanggal_mulai)}
            </Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {showDatePicker.mulai && (
            <DateTimePicker
              value={formData.tanggal_mulai}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e, date) => handleDateChange('tanggal_mulai', e, date)}
            />
          )}
        </View>

        {/* Tanggal Akhir */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Tanggal Akhir <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker({ mulai: false, akhir: true, batas: false })}
            disabled={loading}
          >
            <MaterialCommunityIcons
              name="calendar"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={styles.dateButtonText}>
              {formatDate(formData.tanggal_akhir)}
            </Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {showDatePicker.akhir && (
            <DateTimePicker
              value={formData.tanggal_akhir}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e, date) => handleDateChange('tanggal_akhir', e, date)}
            />
          )}
        </View>

        {/* Batas Evaluasi */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Batas Evaluasi <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker({ mulai: false, akhir: false, batas: true })}
            disabled={loading}
          >
            <MaterialCommunityIcons
              name="clock-alert"
              size={20}
              color={colors.textSecondary}
            />
            <Text style={styles.dateButtonText}>
              {formatDate(formData.batas_evaluasi)}
            </Text>
            <MaterialCommunityIcons
              name="chevron-down"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
          {showDatePicker.batas && (
            <DateTimePicker
              value={formData.batas_evaluasi}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(e, date) => handleDateChange('batas_evaluasi', e, date)}
            />
          )}
          <Text style={styles.hint}>
            Batas waktu mahasiswa mengisi evaluasi (antara tanggal mulai dan akhir)
          </Text>
        </View>

        {/* Keterangan */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Keterangan (Opsional)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Catatan atau keterangan tambahan..."
            value={formData.keterangan}
            onChangeText={(value) => handleChange('keterangan', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!loading}
          />
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <MaterialCommunityIcons name="information" size={20} color={colors.primary} />
          <Text style={styles.infoText}>
            Periode yang baru dibuat akan memiliki status "Tidak Aktif". Anda dapat
            mengaktifkannya dari halaman Kelola Periode.
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="check" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>
                {isEdit ? 'Simpan Perubahan' : 'Buat Periode'}
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={{ height: spacing.xl }} />
      </ScrollView>

      {renderSemesterModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    padding: spacing.base,
  },
  formGroup: {
    marginBottom: spacing.base,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  required: {
    color: colors.danger,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.base,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  textArea: {
    minHeight: 100,
    paddingTop: spacing.sm,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 4,
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.base,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  pickerButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.base,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
  },
  dateButtonText: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '10',
    padding: spacing.base,
    borderRadius: radius.base,
    marginBottom: spacing.base,
  },
  infoText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    borderRadius: radius.base,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.base,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: radius.base,
    padding: spacing.base,
    width: '100%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderRadius: radius.sm,
    marginBottom: 4,
  },
  modalOptionActive: {
    backgroundColor: colors.primary + '10',
  },
  modalOptionText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  modalOptionTextActive: {
    fontFamily: typography.fontFamily.semibold,
    color: colors.primary,
  },
});

export default FormPeriodeScreen;
