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
import fasilitasService, { KATEGORI_FASILITAS, ICON_OPTIONS } from '../../services/fasilitasService';

const FormFasilitasScreen = ({ route, navigation }) => {
  const { mode = 'create', fasilitas: editData } = route.params || {};
  const isEdit = mode === 'edit';

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    kode: '',
    nama: '',
    kategori: '',
    lokasi: '',
    kapasitas: '',
    deskripsi: '',
    icon: 'office-building',
    fasilitas: [],
  });

  const [fasilitasInput, setFasilitasInput] = useState('');
  const [showKategoriPicker, setShowKategoriPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isEdit && editData) {
      setFormData({
        kode: editData.kode || '',
        nama: editData.nama || '',
        kategori: editData.kategori || '',
        lokasi: editData.lokasi || '',
        kapasitas: editData.kapasitas?.toString() || '',
        deskripsi: editData.deskripsi || '',
        icon: editData.icon || 'office-building',
        fasilitas: editData.fasilitas || [],
      });
    }
  }, [isEdit, editData]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: field === 'kode' ? value.toUpperCase() : value,
    }));
    setHasChanges(true);
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
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
      setHasChanges(true);
    }
  };

  const handleRemoveFasilitas = (index) => {
    setFormData((prev) => ({
      ...prev,
      fasilitas: prev.fasilitas.filter((_, i) => i !== index),
    }));
    setHasChanges(true);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.kode.trim()) {
      newErrors.kode = 'Kode fasilitas wajib diisi';
    } else if (formData.kode.length < 2) {
      newErrors.kode = 'Kode minimal 2 karakter';
    }

    if (!formData.nama.trim()) {
      newErrors.nama = 'Nama fasilitas wajib diisi';
    }

    if (!formData.kategori) {
      newErrors.kategori = 'Kategori wajib dipilih';
    }

    if (!formData.lokasi.trim()) {
      newErrors.lokasi = 'Lokasi wajib diisi';
    }

    const kapasitasNum = parseInt(formData.kapasitas);
    if (!formData.kapasitas || isNaN(kapasitasNum) || kapasitasNum <= 0) {
      newErrors.kapasitas = 'Kapasitas harus lebih dari 0';
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
      const submitData = {
        ...formData,
        kapasitas: parseInt(formData.kapasitas),
      };

      if (isEdit) {
        await fasilitasService.updateFasilitas(editData.id, submitData);
        Alert.alert('Berhasil', 'Data fasilitas berhasil diperbarui', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      } else {
        await fasilitasService.createFasilitas(submitData);
        Alert.alert('Berhasil', 'Fasilitas baru berhasil ditambahkan', [
          { text: 'OK', onPress: () => navigation.goBack() },
        ]);
      }
      setHasChanges(false);
    } catch (error) {
      console.error('Submit fasilitas error:', error);
      Alert.alert('Error', error.message || 'Gagal menyimpan data fasilitas');
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
          <Text style={styles.headerTitle}>{isEdit ? 'Edit Fasilitas' : 'Tambah Fasilitas'}</Text>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Kode */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Kode Fasilitas <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.kode && styles.inputError]}
            placeholder="Contoh: LAB01"
            value={formData.kode}
            onChangeText={(value) => handleChange('kode', value)}
            autoCapitalize="characters"
            maxLength={20}
          />
          {errors.kode && <Text style={styles.errorText}>{errors.kode}</Text>}
          <Text style={styles.hint}>Kode unik untuk identifikasi fasilitas</Text>
        </View>

        {/* Nama */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Nama Fasilitas <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.nama && styles.inputError]}
            placeholder="Contoh: Laboratorium Komputer 1"
            value={formData.nama}
            onChangeText={(value) => handleChange('nama', value)}
          />
          {errors.nama && <Text style={styles.errorText}>{errors.nama}</Text>}
        </View>

        {/* Kategori */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Kategori <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.pickerButton, errors.kategori && styles.inputError]}
            onPress={() => setShowKategoriPicker(true)}
          >
            <Text
              style={[styles.pickerButtonText, !formData.kategori && styles.pickerPlaceholder]}
            >
              {formData.kategori || 'Pilih Kategori'}
            </Text>
            <MaterialCommunityIcons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          {errors.kategori && <Text style={styles.errorText}>{errors.kategori}</Text>}
        </View>

        {/* Icon */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Icon</Text>
          <TouchableOpacity
            style={styles.iconPickerButton}
            onPress={() => setShowIconPicker(true)}
          >
            <View style={styles.iconPreview}>
              <MaterialCommunityIcons
                name={formData.icon}
                size={32}
                color={colors.primary}
              />
            </View>
            <View style={styles.iconPickerTextContainer}>
              <Text style={styles.iconPickerLabel}>
                {ICON_OPTIONS.find((opt) => opt.name === formData.icon)?.label || 'Pilih Icon'}
              </Text>
              <Text style={styles.iconPickerHint}>Tap untuk mengubah icon</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Lokasi */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Lokasi <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.lokasi && styles.inputError]}
            placeholder="Contoh: Gedung A Lantai 2"
            value={formData.lokasi}
            onChangeText={(value) => handleChange('lokasi', value)}
          />
          {errors.lokasi && <Text style={styles.errorText}>{errors.lokasi}</Text>}
        </View>

        {/* Kapasitas */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>
            Kapasitas <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.kapasitasContainer}>
            <TouchableOpacity
              style={styles.kapasitasButton}
              onPress={() => handleKapasitasChange(-5)}
            >
              <MaterialCommunityIcons name="minus" size={20} color={colors.primary} />
            </TouchableOpacity>
            <TextInput
              style={[styles.kapasitasInput, errors.kapasitas && styles.inputError]}
              value={formData.kapasitas}
              onChangeText={(value) => handleChange('kapasitas', value)}
              keyboardType="number-pad"
              maxLength={4}
            />
            <Text style={styles.kapasitasUnit}>orang</Text>
            <TouchableOpacity
              style={styles.kapasitasButton}
              onPress={() => handleKapasitasChange(5)}
            >
              <MaterialCommunityIcons name="plus" size={20} color={colors.primary} />
            </TouchableOpacity>
          </View>
          {errors.kapasitas && <Text style={styles.errorText}>{errors.kapasitas}</Text>}
        </View>

        {/* Deskripsi */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Deskripsi</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Deskripsi singkat tentang fasilitas..."
            value={formData.deskripsi}
            onChangeText={(value) => handleChange('deskripsi', value)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Fasilitas (Tags) */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Fasilitas yang Tersedia</Text>
          <View style={styles.fasilitasInputContainer}>
            <TextInput
              style={styles.fasilitasInput}
              placeholder="Contoh: Proyektor"
              value={fasilitasInput}
              onChangeText={setFasilitasInput}
              onSubmitEditing={handleAddFasilitas}
            />
            <TouchableOpacity
              style={styles.fasilitasAddButton}
              onPress={handleAddFasilitas}
              disabled={!fasilitasInput.trim()}
            >
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={fasilitasInput.trim() ? colors.primary : colors.textDisabled}
              />
            </TouchableOpacity>
          </View>
          {formData.fasilitas.length > 0 && (
            <View style={styles.fasilitasChips}>
              {formData.fasilitas.map((item, index) => (
                <View key={index} style={styles.fasilitasChip}>
                  <Text style={styles.fasilitasChipText}>{item}</Text>
                  <TouchableOpacity onPress={() => handleRemoveFasilitas(index)}>
                    <MaterialCommunityIcons name="close-circle" size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
          <Text style={styles.hint}>Tekan Enter atau tap + untuk menambahkan</Text>
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
              {isEdit ? 'Simpan Perubahan' : 'Tambah Fasilitas'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Kategori Picker Modal */}
      <Modal
        visible={showKategoriPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowKategoriPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Kategori</Text>
              <TouchableOpacity onPress={() => setShowKategoriPicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={KATEGORI_FASILITAS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    handleChange('kategori', item);
                    setShowKategoriPicker(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                  {formData.kategori === item && (
                    <MaterialCommunityIcons name="check" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Icon Picker Modal */}
      <Modal
        visible={showIconPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowIconPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Pilih Icon</Text>
              <TouchableOpacity onPress={() => setShowIconPicker(false)}>
                <MaterialCommunityIcons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={ICON_OPTIONS}
              keyExtractor={(item) => item.name}
              numColumns={3}
              columnWrapperStyle={styles.iconGrid}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.iconOption,
                    formData.icon === item.name && styles.iconOptionSelected,
                  ]}
                  onPress={() => {
                    handleChange('icon', item.name);
                    setShowIconPicker(false);
                  }}
                >
                  <MaterialCommunityIcons
                    name={item.name}
                    size={36}
                    color={formData.icon === item.name ? colors.primary : colors.textSecondary}
                  />
                  <Text style={styles.iconOptionLabel} numberOfLines={2}>
                    {item.label}
                  </Text>
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
  iconPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.base,
    padding: spacing.base,
  },
  iconPreview: {
    width: 56,
    height: 56,
    borderRadius: radius.base,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPickerTextContainer: {
    flex: 1,
    marginLeft: spacing.base,
  },
  iconPickerLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  iconPickerHint: {
    fontSize: typography.fontSize.xs,
    color: colors.textDisabled,
    marginTop: 2,
  },
  kapasitasContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  kapasitasButton: {
    width: 40,
    height: 40,
    borderRadius: radius.base,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  kapasitasInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  kapasitasUnit: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  fasilitasInputContainer: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  fasilitasInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  fasilitasAddButton: {
    width: 40,
    height: 40,
    borderRadius: radius.base,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fasilitasChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  fasilitasChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary + '10',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  fasilitasChipText: {
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
    maxHeight: '70%',
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
  modalItemText: {
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  iconGrid: {
    gap: spacing.sm,
    paddingHorizontal: spacing.base,
  },
  iconOption: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: radius.base,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    margin: spacing.xs,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  iconOptionSelected: {
    backgroundColor: colors.primary + '10',
    borderColor: colors.primary,
  },
  iconOptionLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});

export default FormFasilitasScreen;
