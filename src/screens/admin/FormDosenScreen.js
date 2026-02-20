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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius as radius } from '../../utils/theme';
import dosenService, { MATA_KULIAH_LIST } from '../../services/dosenService';

const FormDosenScreen = ({ route, navigation }) => {
  const { mode = 'create', dosen: editData } = route.params || {};
  const isEdit = mode === 'edit';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nip: '',
    nama: '',
    email: '',
    mata_kuliah: [],
    bio: '',
  });

  const [showMataKuliahPicker, setShowMataKuliahPicker] = useState(false);
  const [selectedMataKuliah, setSelectedMataKuliah] = useState([]);
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        nip: editData.nip || '',
        nama: editData.nama || '',
        email: editData.email || '',
        mata_kuliah: editData.mata_kuliah || [],
        bio: editData.bio || '',
      });
      setSelectedMataKuliah(editData.mata_kuliah || []);
    }
  }, [isEdit, editData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleMataKuliahToggle = (mataKuliah) => {
    setSelectedMataKuliah((prev) => {
      if (prev.includes(mataKuliah)) {
        return prev.filter((mk) => mk !== mataKuliah);
      } else {
        return [...prev, mataKuliah];
      }
    });
  };

  const handleMataKuliahConfirm = () => {
    setFormData((prev) => ({
      ...prev,
      mata_kuliah: selectedMataKuliah,
    }));
    setShowMataKuliahPicker(false);
    setHasChanges(true);
    if (errors.mata_kuliah) {
      setErrors((prev) => ({ ...prev, mata_kuliah: null }));
    }
  };

  const handleRemoveMataKuliah = (mataKuliah) => {
    setFormData((prev) => ({
      ...prev,
      mata_kuliah: prev.mata_kuliah.filter((mk) => mk !== mataKuliah),
    }));
    setSelectedMataKuliah((prev) => prev.filter((mk) => mk !== mataKuliah));
    setHasChanges(true);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate NIP
    if (!formData.nip.trim()) {
      newErrors.nip = 'NIP wajib diisi';
    } else if (!dosenService.validateNIP(formData.nip)) {
      newErrors.nip = 'NIP harus 18 digit angka';
    }

    // Validate Nama
    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama dosen wajib diisi';
    }

    // Validate Email
    if (!formData.email.trim()) {
      newErrors.email = 'Email wajib diisi';
    } else if (!dosenService.validateEmail(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Validate Mata Kuliah
    if (formData.mata_kuliah.length === 0) {
      newErrors.mata_kuliah = 'Pilih minimal 1 mata kuliah';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validasi Gagal', 'Mohon lengkapi semua field yang wajib diisi');
      return;
    }

    setLoading(true);
    try {
      const submitData = { ...formData };

      if (isEdit) {
        await dosenService.updateDosen(editData.id, submitData);
        Alert.alert('Berhasil', 'Data dosen berhasil diperbarui', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await dosenService.createDosen(submitData);
        Alert.alert('Berhasil', 'Dosen baru berhasil ditambahkan', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
      setHasChanges(false);
    } catch (error) {
      console.error('Submit dosen error:', error);
      Alert.alert('Error', error.message || 'Gagal menyimpan data dosen');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        'Batalkan Perubahan?',
        'Perubahan yang Anda buat belum disimpan. Yakin ingin membatalkan?',
        [
          { text: 'Tidak', style: 'cancel' },
          { text: 'Ya', style: 'destructive', onPress: () => navigation.goBack() },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.backButton}>
          <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{isEdit ? 'Edit Dosen' : 'Tambah Dosen'}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* NIP */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            NIP <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.nip && styles.inputError]}
            placeholder="18 digit NIP"
            value={formData.nip}
            onChangeText={(value) => handleChange('nip', value.replace(/[^0-9]/g, ''))}
            keyboardType="number-pad"
            maxLength={18}
          />
          {errors.nip && <Text style={styles.errorText}>{errors.nip}</Text>}
          <Text style={styles.hint}>
            {formData.nip.length}/18 digit • Nomor Induk Pegawai (NIP) unik
          </Text>
        </View>

        {/* Nama */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Nama Lengkap <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.nama && styles.inputError]}
            placeholder="Contoh: Dr. Ahmad Fauzi, M.Kom"
            value={formData.nama}
            onChangeText={(value) => handleChange('nama', value)}
          />
          {errors.nama && <Text style={styles.errorText}>{errors.nama}</Text>}
          <Text style={styles.hint}>Sertakan gelar akademik jika ada</Text>
        </View>

        {/* Email */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Email <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            placeholder="contoh@email.com"
            value={formData.email}
            onChangeText={(value) => handleChange('email', value.toLowerCase())}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        {/* Mata Kuliah */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Mata Kuliah <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.pickerButton, errors.mata_kuliah && styles.inputError]}
            onPress={() => {
              setSelectedMataKuliah(formData.mata_kuliah);
              setShowMataKuliahPicker(true);
            }}
          >
            <Text
              style={[
                styles.pickerButtonText,
                formData.mata_kuliah.length === 0 && styles.pickerPlaceholder,
              ]}
            >
              {formData.mata_kuliah.length > 0
                ? `${formData.mata_kuliah.length} mata kuliah dipilih`
                : 'Pilih Mata Kuliah'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          {errors.mata_kuliah && <Text style={styles.errorText}>{errors.mata_kuliah}</Text>}

          {formData.mata_kuliah.length > 0 && (
            <View style={styles.mataKuliahChips}>
              {formData.mata_kuliah.map((mk, index) => (
                <View key={index} style={styles.mataKuliahChip}>
                  <Text style={styles.mataKuliahChipText}>{mk}</Text>
                  <TouchableOpacity onPress={() => handleRemoveMataKuliah(mk)}>
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={16}
                      color={colors.primary}
                    />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Bio */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Bio / Deskripsi</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Deskripsi singkat tentang dosen (opsional)"
            value={formData.bio}
            onChangeText={(value) => handleChange('bio', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          <Text style={styles.hint}>Misal: bidang keahlian, pengalaman mengajar, dll</Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={handleCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Batal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>
              {isEdit ? 'Simpan Perubahan' : 'Tambah Dosen'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Mata Kuliah Picker Modal */}
      <Modal
        visible={showMataKuliahPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMataKuliahPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Pilih Mata Kuliah ({selectedMataKuliah.length})
              </Text>
              <TouchableOpacity onPress={() => setShowMataKuliahPicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={MATA_KULIAH_LIST}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => {
                const isSelected = selectedMataKuliah.includes(item.nama);
                return (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => handleMataKuliahToggle(item.nama)}
                  >
                    <View style={styles.modalItemLeft}>
                      <View
                        style={[
                          styles.checkbox,
                          isSelected && styles.checkboxSelected,
                        ]}
                      >
                        {isSelected && (
                          <MaterialCommunityIcons name="check" size={16} color="#fff" />
                        )}
                      </View>
                      <View style={styles.modalItemInfo}>
                        <Text style={styles.modalItemTitle}>{item.nama}</Text>
                        <Text style={styles.modalItemSubtitle}>{item.kode}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
            />

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.button, styles.modalConfirmButton]}
                onPress={handleMataKuliahConfirm}
              >
                <Text style={styles.modalConfirmButtonText}>
                  Konfirmasi ({selectedMataKuliah.length})
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerTitleContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
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
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  inputError: {
    borderColor: colors.danger,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.danger,
    marginTop: 4,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    color: colors.textDisabled,
    marginTop: 4,
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  pickerButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  pickerPlaceholder: {
    color: colors.textDisabled,
  },
  mataKuliahChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  mataKuliahChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary + '10',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  mataKuliahChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: spacing.base,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  button: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.textSecondary,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  modalItemInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  modalItemTitle: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  modalItemSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalFooter: {
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalConfirmButton: {
    backgroundColor: colors.primary,
  },
  modalConfirmButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: '#fff',
  },
});

export default FormDosenScreen;
