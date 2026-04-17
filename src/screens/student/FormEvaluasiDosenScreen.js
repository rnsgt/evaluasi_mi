import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors as staticColors, typography, spacing, borderRadius as radius } from '../../utils/theme';
import { useAuth } from '../../contexts/AuthContext';
import LikertScale from '../../components/LikertScale';
import ToastNotification from '../../components/ToastNotification';
import { KATEGORI_EVALUASI_DOSEN, getTotalPertanyaan } from '../../data/pertanyaanDosen';
import evaluasiService from '../../services/evaluasiService';
import { getActivePeriode } from '../../services/periodeService';

const FormEvaluasiDosenScreen = ({ route, navigation }) => {
  const { dosenId, namaDosen, mataKuliah, nip } = route.params;
  const { user } = useAuth();
  const { colors } = useTheme();
  const scrollViewRef = useRef(null);

  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [komentar, setKomentar] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [mataKuliahOptions, setMataKuliahOptions] = useState([]);
  const [selectedMataKuliah, setSelectedMataKuliah] = useState(null);
  const [activePeriode, setActivePeriode] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const totalPertanyaan = getTotalPertanyaan();
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalPertanyaan) * 100;

  const showToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const hideToast = () => {
    setToastVisible(false);
  };

  useEffect(() => {
    // Load active periode
    const loadPeriode = async () => {
      const periode = await getActivePeriode();
      setActivePeriode(periode);
    };
    loadPeriode();

    const options = Array.isArray(mataKuliah)
      ? mataKuliah
          .map((item) => {
            if (typeof item === 'string') {
              return { id: null, nama: item };
            }

            const nama = item?.nama || item?.kode || '';
            return nama ? { id: item?.id || null, nama } : null;
          })
          .filter(Boolean)
      : [];

    setMataKuliahOptions(options);
    if (options.length > 0) {
      setSelectedMataKuliah(options[0]);
    }
  }, [mataKuliah]);

  useEffect(() => {
    // Set up back button listener for unsaved changes warning
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasUnsavedChanges) {
        return;
      }

      e.preventDefault();

      Alert.alert(
        'Batalkan Evaluasi?',
        'Anda memiliki perubahan yang belum disimpan. Yakin ingin keluar?',
        [
          { text: 'Tetap di sini', style: 'cancel' },
          {
            text: 'Keluar',
            style: 'destructive',
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation, hasUnsavedChanges]);

  const handleAnswerChange = (pertanyaanId, value) => {
    setAnswers((prev) => ({ ...prev, [pertanyaanId]: value }));
    setErrors((prev) => ({ ...prev, [pertanyaanId]: null }));
    setHasUnsavedChanges(true);
  };

  const handleMataKuliahSelect = (item) => {
    setSelectedMataKuliah(item);
    setHasUnsavedChanges(true);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Check all pertanyaan are answered
    KATEGORI_EVALUASI_DOSEN.forEach((kategori) => {
      kategori.pertanyaan.forEach((pertanyaan) => {
        if (!answers[pertanyaan.id]) {
          newErrors[pertanyaan.id] = 'Pertanyaan wajib diisi';
          isValid = false;
        }
      });
    });

    setErrors(newErrors);

    if (!isValid) {
      // Scroll to first error
      const firstErrorId = Object.keys(newErrors)[0];
      if (firstErrorId && scrollViewRef.current) {
        // Simple scroll to top where errors are
        scrollViewRef.current.scrollTo({ y: 0, animated: true });
      }
    }

    return isValid;
  };

  const handleSubmit = () => {
    if (!selectedMataKuliah) {
      Alert.alert('Mata Kuliah Wajib Dipilih', 'Silakan pilih mata kuliah terlebih dahulu.');
      return;
    }

    if (!validateForm()) {
      Alert.alert(
        'Form Belum Lengkap',
        `Mohon lengkapi semua pertanyaan. Masih ada ${totalPertanyaan - answeredCount} pertanyaan yang belum diisi.`
      );
      return;
    }

    Alert.alert(
      'Kirim Evaluasi?',
      'Apakah Anda yakin ingin mengirim evaluasi ini? Evaluasi tidak dapat diubah setelah dikirim.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Kirim',
          style: 'default',
          onPress: submitEvaluasi,
        },
      ]
    );
  };

  const submitEvaluasi = async () => {
    try {
      setSubmitting(true);

      // Check if periode active
      if (!activePeriode) {
        showToast('Tidak ada periode evaluasi aktif', 'error');
        return;
      }

      if (!selectedMataKuliah) {
        showToast('Silakan pilih mata kuliah terlebih dahulu', 'error');
        return;
      }

      // Prepare jawaban array with correct field name
      const jawaban = Object.keys(answers).map((pertanyaanId) => ({
        pernyataan_id: parseInt(pertanyaanId),
        nilai: answers[pertanyaanId],
      }));

      // Prepare evaluasi data according to backend API format
      const evaluasiData = {
        dosen_id: dosenId,
        periode_id: activePeriode.id,
        komentar: komentar || null,
        jawaban: jawaban,
        ...(selectedMataKuliah.id
          ? { mata_kuliah_id: selectedMataKuliah.id }
          : { mata_kuliah_nama: selectedMataKuliah.nama }),
      };

      // Submit to backend API
      const result = await evaluasiService.submitEvaluasiDosen(evaluasiData);

      setHasUnsavedChanges(false);

      showToast('Evaluasi Anda telah berhasil dikirim!', 'success');
      
      // Navigate home after brief delay
      setTimeout(() => {
        navigation.navigate('HomeMain');
      }, 2000);
    } catch (error) {
      // Check if it's a duplicate evaluation error
      const errorMessage = error?.message || 'Gagal mengirim evaluasi';
      const isDuplicate = errorMessage.includes('sudah mengevaluasi') || error?.status === 400;
      
      showToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const renderKategori = (kategori) => {
    return (
      <View key={kategori.id} style={styles.kategoriContainer}>
        {/* Kategori Header */}
        <View style={styles.kategoriHeader}>
          <View style={styles.kategoriIconContainer}>
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={20}
              color={colors.primary}
            />
          </View>
          <Text style={styles.kategoriTitle}>{kategori.nama}</Text>
        </View>

        {/* Pertanyaan dalam kategori */}
        {kategori.pertanyaan.map((pertanyaan, index) => (
          <View key={pertanyaan.id} style={styles.pertanyaanContainer}>
            <Text style={styles.pertanyaanNumber}>
              Pertanyaan {pertanyaan.id}
            </Text>
            <LikertScale
              question={pertanyaan.text}
              value={answers[pertanyaan.id]}
              onValueChange={(value) => handleAnswerChange(pertanyaan.id, value)}
              required={true}
              error={errors[pertanyaan.id]}
            />
          </View>
        ))}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ToastNotification
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={hideToast}
        duration={3000}
        colors={colors}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Evaluasi Dosen</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {namaDosen}
            </Text>
          </View>
          <View style={styles.backButton} />
        </View>

        {/* Dosen Info Card */}
        <View style={styles.dosenInfoCard}>
          <View style={styles.dosenAvatar}>
            <MaterialCommunityIcons name="account" size={32} color={colors.primary} />
          </View>
          <View style={styles.dosenInfo}>
            <Text style={styles.dosenNama} numberOfLines={2}>
              {namaDosen}
            </Text>
            <Text style={styles.dosenNip}>NIP: {nip}</Text>
            <View style={styles.mataKuliahTags}>
              {mataKuliah && mataKuliah.slice(0, 2).map((mk, index) => (
                <View key={index} style={styles.mataKuliahTag}>
                  <Text style={styles.mataKuliahText} numberOfLines={1}>
                    {typeof mk === 'object' ? mk.nama : mk}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.mataKuliahFormCard}>
          <Text style={styles.mataKuliahFormLabel}>Mata Kuliah</Text>


          <View style={styles.mataKuliahSuggestions}>
            {mataKuliahOptions.map((item) => {
              const isActive = selectedMataKuliah?.id
                ? selectedMataKuliah.id === item.id
                : selectedMataKuliah?.nama === item.nama;

              return (
                <TouchableOpacity
                  key={`${item.id || item.nama}`}
                  style={[styles.mataKuliahChip, isActive && styles.mataKuliahChipActive]}
                  onPress={() => handleMataKuliahSelect(item)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.mataKuliahChipText, isActive && styles.mataKuliahChipTextActive]}>
                    {item.nama}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              Progress: {answeredCount} / {totalPertanyaan} pertanyaan
            </Text>
            <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>

        {/* Form Content */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Instruction */}
          <View style={styles.instructionCard}>
            <MaterialCommunityIcons
              name="information"
              size={20}
              color={colors.primary}
              style={styles.instructionIcon}
            />
            <Text style={styles.instructionText}>
              Silakan berikan penilaian untuk setiap pertanyaan dengan skala 1-5.
              Semua pertanyaan wajib diisi.
            </Text>
          </View>

          {/* Kategori & Pertanyaan */}
          {KATEGORI_EVALUASI_DOSEN.map((kategori) => renderKategori(kategori))}

          {/* Komentar/Saran */}
          <View style={styles.komentarContainer}>
            <Text style={styles.komentarLabel}>
              Komentar / Saran (Opsional)
            </Text>
            <TextInput
              style={styles.komentarInput}
              placeholder="Tuliskan komentar atau saran Anda untuk dosen ini..."
              value={komentar}
              onChangeText={(text) => {
                setKomentar(text);
                setHasUnsavedChanges(true);
              }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Submit Button (Sticky) */}
        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              (submitting || progress < 100) && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={submitting || progress < 100}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="send"
                  size={20}
                  color="#FFFFFF"
                  style={styles.submitIcon}
                />
                <Text style={styles.submitButtonText}>Kirim Evaluasi</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF1F5',
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: staticColors.background,
    borderBottomWidth: 1,
    borderBottomColor: staticColors.border,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: staticColors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    color: staticColors.textSecondary,
    marginTop: 2,
  },
  dosenInfoCard: {
    flexDirection: 'row',
    backgroundColor: staticColors.background,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: staticColors.border,
  },
  dosenAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DBECFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  dosenInfo: {
    flex: 1,
  },
  dosenNama: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: staticColors.textPrimary,
    marginBottom: 4,
  },
  dosenNip: {
    fontSize: typography.fontSize.xs,
    color: staticColors.textSecondary,
    marginBottom: spacing.sm,
  },
  mataKuliahTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mataKuliahTag: {
    backgroundColor: '#DBECFF',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    marginRight: spacing.xs,
  },
  mataKuliahText: {
    fontSize: typography.fontSize.xs,
    color: staticColors.primary,
    fontFamily: typography.fontFamily.medium,
  },
  mataKuliahFormCard: {
    backgroundColor: staticColors.background,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: staticColors.border,
  },
  mataKuliahFormLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: staticColors.textPrimary,
    marginBottom: 4,
  },
  mataKuliahFormHelper: {
    fontSize: typography.fontSize.xs,
    color: staticColors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  mataKuliahFormInput: {
    backgroundColor: staticColors.surface,
    borderWidth: 1,
    borderColor: staticColors.border,
    borderRadius: radius.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.base,
    color: staticColors.textPrimary,
  },
  mataKuliahSuggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  mataKuliahChip: {
    backgroundColor: '#DBECFF',
    borderWidth: 1,
    borderColor: '#BBDEFB',
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  mataKuliahChipActive: {
    backgroundColor: staticColors.primary,
    borderColor: staticColors.primary,
  },
  mataKuliahChipText: {
    fontSize: typography.fontSize.xs,
    color: staticColors.primary,
    fontFamily: typography.fontFamily.medium,
  },
  mataKuliahChipTextActive: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.semibold,
  },
  progressContainer: {
    backgroundColor: staticColors.background,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: staticColors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: staticColors.textPrimary,
    fontFamily: typography.fontFamily.medium,
  },
  progressPercentage: {
    fontSize: typography.fontSize.sm,
    color: staticColors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: staticColors.surface,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: staticColors.primary,
    borderRadius: radius.full,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
  },
  instructionCard: {
    flexDirection: 'row',
    backgroundColor: '#DBECFF',
    padding: spacing.base,
    borderRadius: radius.base,
    marginBottom: spacing.lg,
  },
  instructionIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  instructionText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: staticColors.textPrimary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  kategoriContainer: {
    marginBottom: spacing.xl,
  },
  kategoriHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: staticColors.background,
    padding: spacing.md,
    borderRadius: radius.base,
    marginBottom: spacing.base,
    elevation: 2,
  },
  kategoriIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBECFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  kategoriTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: staticColors.textPrimary,
  },
  pertanyaanContainer: {
    backgroundColor: staticColors.background,
    padding: spacing.base,
    borderRadius: radius.base,
    marginBottom: spacing.base,
    elevation: 1,
  },
  pertanyaanNumber: {
    fontSize: typography.fontSize.xs,
    color: staticColors.textSecondary,
    fontFamily: typography.fontFamily.medium,
    marginBottom: spacing.sm,
  },
  komentarContainer: {
    backgroundColor: staticColors.background,
    padding: spacing.base,
    borderRadius: radius.base,
    marginTop: spacing.lg,
    elevation: 1,
  },
  komentarLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: staticColors.textPrimary,
    marginBottom: spacing.sm,
  },
  komentarInput: {
    borderWidth: 1,
    borderColor: staticColors.border,
    borderRadius: radius.base,
    padding: spacing.base,
    fontSize: typography.fontSize.base,
    color: staticColors.textPrimary,
    minHeight: 100,
    backgroundColor: staticColors.surface,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: staticColors.background,
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: staticColors.border,
    elevation: 8,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: staticColors.primary,
    paddingVertical: spacing.base,
    borderRadius: radius.base,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  submitButtonDisabled: {
    backgroundColor: staticColors.textDisabled,
    opacity: 0.6,
  },
  submitIcon: {
    marginRight: spacing.sm,
  },
  submitButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: '#FFFFFF',
  },
});

export default FormEvaluasiDosenScreen;

