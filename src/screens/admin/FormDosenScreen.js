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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors as staticColors, typography, spacing, borderRadius as radius } from '../../utils/theme';
import dosenService, { MATA_KULIAH_LIST } from '../../services/dosenService';

const FormDosenScreen = ({ route, navigation }) => {
  const { colors } = useTheme();
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

  const [mataKuliahInput, setMataKuliahInput] = useState('');
  const [mataKuliahSuggestions, setMataKuliahSuggestions] = useState(
    MATA_KULIAH_LIST.slice(0, 8)
  );
  const [errors, setErrors] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  const getMataKuliahName = (mk) => {
    if (typeof mk === 'string') return mk;
    if (mk && typeof mk === 'object') return mk.nama || mk.kode || '';
    return '';
  };

  const normalizeMataKuliah = (list = []) =>
    list
      .map((mk) => getMataKuliahName(mk))
      .filter((name) => name);

  useEffect(() => {
    console.log('FormDosenScreen mounted - route.params:', route.params);
    console.log('Mode:', mode, 'EditData:', editData, 'isEdit:', isEdit);
    
    if (isEdit && editData) {
      console.log('Setting form data with editData');
      setFormData({
        nip: editData.nip || '',
        nama: editData.nama || '',
        email: editData.email || '',
        mata_kuliah: editData.mata_kuliah || [],
        bio: editData.bio || '',
      });
    }
  }, [isEdit, editData, mode]);

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

  const handleMataKuliahInputChange = (value) => {
    setMataKuliahInput(value);
    setHasChanges(true);

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
    if (!normalized) {
      return;
    }

    setFormData((prev) => {
      if (prev.mata_kuliah.includes(normalized)) {
        return prev;
      }

      return {
        ...prev,
        mata_kuliah: [...prev.mata_kuliah, normalized],
      };
    });

    setMataKuliahInput('');
    setMataKuliahSuggestions(MATA_KULIAH_LIST.slice(0, 8));
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
          <View style={[styles.mataKuliahInputRow, errors.mata_kuliah && styles.inputError]}>
            <TextInput
              style={styles.mataKuliahInput}
              placeholder="Ketik nama mata kuliah"
              value={mataKuliahInput}
              onChangeText={handleMataKuliahInputChange}
              onSubmitEditing={() => handleAddMataKuliah(mataKuliahInput)}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={styles.mataKuliahAddButton}
              onPress={() => handleAddMataKuliah(mataKuliahInput)}
            >
              <MaterialCommunityIcons name="plus" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          {errors.mata_kuliah && <Text style={styles.errorText}>{errors.mata_kuliah}</Text>}

          <View style={styles.suggestionSection}>
            <Text style={styles.hint}>Saran cepat</Text>
            <View style={styles.mataKuliahSuggestions}>
              {mataKuliahSuggestions.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.suggestionChip}
                  onPress={() => handleAddMataKuliah(item.nama)}
                >
                  <Text style={styles.suggestionChipText}>{item.nama}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {formData.mata_kuliah.length > 0 && (
            <View style={styles.mataKuliahChips}>
              {formData.mata_kuliah.map((mk, index) => (
                <View key={index} style={styles.mataKuliahChip}>
                  <Text style={styles.mataKuliahChipText}>{getMataKuliahName(mk)}</Text>
                  <TouchableOpacity onPress={() => handleRemoveMataKuliah(getMataKuliahName(mk))}>
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

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: staticColors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: staticColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: staticColors.border,
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
    color: staticColors.textPrimary,
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
    color: staticColors.textPrimary,
    marginBottom: spacing.xs,
  },
  required: {
    color: staticColors.danger,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: staticColors.border,
    borderRadius: radius.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    color: staticColors.textPrimary,
  },
  inputError: {
    borderColor: staticColors.danger,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: staticColors.danger,
    marginTop: 4,
  },
  hint: {
    fontSize: typography.fontSize.xs,
    color: staticColors.textDisabled,
    marginTop: 4,
  },
  mataKuliahInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.base,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: staticColors.border,
  },
  mataKuliahInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: staticColors.textPrimary,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
  },
  mataKuliahAddButton: {
    width: 46,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: staticColors.primary,
  },
  suggestionSection: {
    marginTop: spacing.sm,
  },
  mataKuliahChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  suggestionChip: {
    backgroundColor: '#F3F7FB',
    borderWidth: 1,
    borderColor: staticColors.border,
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  suggestionChipText: {
    fontSize: typography.fontSize.sm,
    color: staticColors.textSecondary,
  },
  mataKuliahChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: staticColors.primary + '10',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  mataKuliahChipText: {
    fontSize: typography.fontSize.sm,
    color: staticColors.primary,
  },
  bottomActions: {
    flexDirection: 'row',
    padding: spacing.base,
    gap: spacing.sm,
    backgroundColor: staticColors.surface,
    borderTopWidth: 1,
    borderTopColor: staticColors.border,
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
    borderColor: staticColors.border,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: staticColors.textSecondary,
  },
  submitButton: {
    backgroundColor: staticColors.primary,
  },
  submitButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: '#fff',
  },
});

export default FormDosenScreen;
