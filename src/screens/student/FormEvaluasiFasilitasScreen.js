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
import { colors, typography, spacing, borderRadius as radius } from '../../utils/theme';
import { useAuth } from '../../contexts/AuthContext';
import LikertScale from '../../components/LikertScale';
import { KATEGORI_EVALUASI_FASILITAS, getTotalPertanyaan } from '../../data/pertanyaanFasilitas';
import evaluasiService from '../../services/evaluasiService';

const FormEvaluasiFasilitasScreen = ({ route, navigation }) => {
  const { fasilitasId, namaFasilitas, kodeFasilitas, kategoriFasilitas, lokasi } = route.params;
  const { user } = useAuth();
  const scrollViewRef = useRef(null);

  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [komentar, setKomentar] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const totalPertanyaan = getTotalPertanyaan();
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / totalPertanyaan) * 100;

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
    KATEGORI_EVALUASI_FASILITAS.forEach((kategori) => {
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
      if (scrollViewRef.current) {
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

      // Prepare jawaban array
      const jawaban = Object.keys(answers).map((pertanyaanId) => ({
        pertanyaan_id: parseInt(pertanyaanId),
        nilai: answers[pertanyaanId],
      }));

      // Prepare evaluasi data
      const evaluasiData = {
        fasilitas_id: fasilitasId,
        fasilitas_nama: namaFasilitas,
        fasilitas_kode: kodeFasilitas,
        fasilitas_kategori: kategoriFasilitas,
        lokasi: lokasi,
        periode_id: 1, // TODO: Get from active periode
        periode_nama: 'Semester Ganjil 2023/2024',
        mahasiswa_id: user.id,
        mahasiswa_nim: user.nim,
        mahasiswa_nama: user.nama,
        jawaban: jawaban,
        komentar: komentar || null,
        submitted_at: new Date().toISOString(),
      };

      // Submit to service
      const result = await evaluasiService.submitEvaluasiFasilitas(evaluasiData);

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
              name="clipboard-check-outline"
              size={20}
              color={colors.primary}
            />
          </View>
          <Text style={styles.kategoriTitle}>{kategori.nama}</Text>
        </View>

        {/* Pertanyaan dalam kategori */}
        {kategori.pertanyaan.map((pertanyaan) => (
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
            <Text style={styles.headerTitle}>Evaluasi Fasilitas</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {namaFasilitas}
            </Text>
          </View>
          <View style={styles.backButton} />
        </View>

        {/* Fasilitas Info Card */}
        <View style={styles.fasilitasInfoCard}>
          <View style={styles.fasilitasIcon}>
            <MaterialCommunityIcons name="office-building" size={32} color={colors.primary} />
          </View>
          <View style={styles.fasilitasInfo}>
            <Text style={styles.fasilitasNama} numberOfLines={2}>
              {namaFasilitas}
            </Text>
            <Text style={styles.fasilitasKode}>{kodeFasilitas}</Text>
            <View style={styles.fasilitasDetails}>
              <View style={styles.detailRow}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text style={styles.detailText} numberOfLines={1}>
                  {lokasi}
                </Text>
              </View>
              <View style={styles.kategoriTag}>
                <Text style={styles.kategoriTagText}>{kategoriFasilitas}</Text>
              </View>
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
              Silakan berikan penilaian untuk setiap aspek fasilitas dengan skala 1-5.
              Semua pertanyaan wajib diisi.
            </Text>
          </View>

          {/* Kategori & Pertanyaan */}
          {KATEGORI_EVALUASI_FASILITAS.map((kategori) => renderKategori(kategori))}

          {/* Komentar/Saran */}
          <View style={styles.komentarContainer}>
            <Text style={styles.komentarLabel}>
              Komentar / Saran (Opsional)
            </Text>
            <TextInput
              style={styles.komentarInput}
              placeholder="Tuliskan komentar atau saran Anda untuk fasilitas ini..."
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
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
    color: colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  fasilitasInfoCard: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  fasilitasIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  fasilitasInfo: {
    flex: 1,
  },
  fasilitasNama: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  fasilitasKode: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  fasilitasDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  detailText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  kategoriTag: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  kategoriTagText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
  },
  progressContainer: {
    backgroundColor: colors.background,
    padding: spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  progressText: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.medium,
  },
  progressPercentage: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primary,
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
    color: colors.textPrimary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  kategoriContainer: {
    marginBottom: spacing.xl,
  },
  kategoriHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
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
    color: colors.textPrimary,
  },
  pertanyaanContainer: {
    backgroundColor: colors.background,
    padding: spacing.base,
    borderRadius: radius.base,
    marginBottom: spacing.base,
    elevation: 1,
  },
  pertanyaanNumber: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.medium,
    marginBottom: spacing.sm,
  },
  komentarContainer: {
    backgroundColor: colors.background,
    padding: spacing.base,
    borderRadius: radius.base,
    marginTop: spacing.lg,
    elevation: 1,
  },
  komentarLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  komentarInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.base,
    padding: spacing.base,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
    minHeight: 100,
    backgroundColor: colors.surface,
  },
  submitContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background,
    padding: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 8,
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    borderRadius: radius.base,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  submitButtonDisabled: {
    backgroundColor: colors.textDisabled,
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

export default FormEvaluasiFasilitasScreen;
