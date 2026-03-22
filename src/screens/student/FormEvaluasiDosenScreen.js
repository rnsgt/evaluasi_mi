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
  const [selectedMataKuliah, setSelectedMataKuliah] = useState(null);
  const [activePeriode, setActivePeriode] = useState(null);

  const totalPertanyaan = getTotalPertanyaan();
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalPertanyaan) * 100;

  useEffect(() => {
    // Load active periode
    const loadPeriode = async () => {
      const periode = await getActivePeriode();
      setActivePeriode(periode);
    };
    loadPeriode();

    // Set default selectedMataKuliah (first one)
    if (mataKuliah && mataKuliah.length > 0) {
      // Check if mataKuliah is array of objects or strings
      const firstMK = mataKuliah[0];
      if (typeof firstMK === 'object' && firstMK.id) {
        setSelectedMataKuliah(firstMK);
      } else {
        // Fallback for string array (will cause error, but prevent crash)
        setSelectedMataKuliah({ id: 1, nama: firstMK });
      }
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
        Alert.alert('Error', 'Tidak ada periode evaluasi aktif');
        return;
      }

      // Check if mata kuliah selected
      if (!selectedMataKuliah) {
        Alert.alert('Error', 'Silakan pilih mata kuliah terlebih dahulu');
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
        mata_kuliah_id: selectedMataKuliah.id,
        periode_id: activePeriode.id,
        komentar: komentar || null,
        jawaban: jawaban,
      };

      // Submit to backend API
      const result = await evaluasiService.submitEvaluasiDosen(evaluasiData);

      setHasUnsavedChanges(false);

      Alert.alert(
        'Berhasil!',
        'Evaluasi Anda telah berhasil dikirim. Terima kasih atas partisipasi Anda.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('HomeMain');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Gagal mengirim evaluasi');
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
    backgroundColor: '#F5F7FA',
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
    backgroundColor: '#E8F5E9',
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
    backgroundColor: '#E3F2FD',
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
    backgroundColor: '#E3F2FD',
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
    backgroundColor: '#E8F5E9',
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
