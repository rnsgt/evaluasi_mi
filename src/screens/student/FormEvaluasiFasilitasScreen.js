import React, { useState, useRef, useEffect, useMemo } from 'react';
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
import LikertScale from '../../components/LikertScale';
import ToastNotification from '../../components/ToastNotification';
import evaluasiService from '../../services/evaluasiService';
import { getActivePeriode } from '../../services/periodeService';

const FormEvaluasiFasilitasScreen = ({ route, navigation }) => {
  const { fasilitasId, namaFasilitas, kodeFasilitas, kategoriFasilitas, lokasi } = route.params;
  const { colors } = useTheme();
  const scrollViewRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});
  const [komentar, setKomentar] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [activePeriode, setActivePeriode] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('info');

  const totalPertanyaan = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progress = totalPertanyaan > 0 ? (answeredCount / totalPertanyaan) * 100 : 0;

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        const [periode, fetchedQuestions] = await Promise.all([
          getActivePeriode(),
          evaluasiService.getPernyataanFasilitas()
        ]);
        setActivePeriode(periode);
        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error('Init evaluasi fasilitas error:', error);
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const showToast = (message, type = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const hideToast = () => {
    setToastVisible(false);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (!hasUnsavedChanges || submitting) {
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
  }, [navigation, hasUnsavedChanges, submitting]);

  const handleAnswerChange = (pertanyaanId, value) => {
    setAnswers((prev) => ({ ...prev, [pertanyaanId]: value }));
    setErrors((prev) => ({ ...prev, [pertanyaanId]: null }));
    setHasUnsavedChanges(true);
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    questions.forEach((q) => {
      if (!answers[q.id]) {
        newErrors[q.id] = 'Pertanyaan wajib diisi';
        isValid = false;
      }
    });

    setErrors(newErrors);
    if (!isValid && scrollViewRef.current) {
      scrollViewRef.current.scrollTo({ y: 0, animated: true });
    }
    return isValid;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      Alert.alert('Form Belum Lengkap', 'Mohon lengkapi semua pertanyaan.');
      return;
    }
    Alert.alert(
      'Kirim Evaluasi?',
      'Apakah Anda yakin ingin mengirim evaluasi ini?',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Kirim', onPress: submitEvaluasi },
      ]
    );
  };

  const submitEvaluasi = async () => {
    try {
      setSubmitting(true);
      if (!activePeriode) {
        showToast('Tidak ada periode evaluasi aktif', 'error');
        return;
      }

      const jawaban = Object.keys(answers).map((id) => ({
        pernyataan_id: parseInt(id),
        nilai: answers[id],
      }));

      const evaluasiData = {
        fasilitas_id: fasilitasId,
        periode_id: activePeriode.id,
        komentar: komentar || null,
        jawaban,
      };

      await evaluasiService.submitEvaluasiFasilitas(evaluasiData);
      setHasUnsavedChanges(false);
      showToast('Evaluasi berhasil dikirim!', 'success');
      setTimeout(() => navigation.navigate('HomeMain'), 2000);
    } catch (error) {
      showToast(error?.message || 'Gagal mengirim evaluasi', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const groupedQuestions = useMemo(() => {
    const groups = {};
    questions.forEach(q => {
      const cat = (q.kategori || 'Lainnya').trim().replace(/\s+/g, ' ');
      const existingKey = Object.keys(groups).find(k => k.toLowerCase() === cat.toLowerCase());
      const key = existingKey || cat;
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(q);
    });
    return groups;
  }, [questions]);

  const renderKategori = (kategoriNama, questionsInGroup) => (
    <View key={kategoriNama} style={styles.kategoriContainer}>
      <View style={styles.kategoriHeader}>
        <View style={styles.kategoriIconContainer}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={20} color={colors.primary} />
        </View>
        <Text style={styles.kategoriTitle}>{kategoriNama}</Text>
      </View>
      {questionsInGroup.map((q) => (
        <View key={q.id} style={styles.pertanyaanContainer}>
          <Text style={styles.pertanyaanNumber}>Pertanyaan {questions.indexOf(q) + 1}</Text>
          <LikertScale
            question={q.pernyataan}
            value={answers[q.id]}
            onValueChange={(val) => handleAnswerChange(q.id, val)}
            required={true}
            error={errors[q.id]}
          />
        </View>
      ))}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Memuat formulir...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ToastNotification visible={toastVisible} message={toastMessage} type={toastType} onHide={hideToast} colors={colors} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Evaluasi Fasilitas</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>{namaFasilitas}</Text>
          </View>
          <View style={styles.backButton} />
        </View>

        <View style={styles.fasilitasInfoCard}>
          <View style={styles.fasilitasIcon}>
            <MaterialCommunityIcons name="office-building" size={32} color={colors.primary} />
          </View>
          <View style={styles.fasilitasInfo}>
            <Text style={styles.fasilitasNama}>{namaFasilitas}</Text>
            <Text style={styles.fasilitasKode}>{kodeFasilitas}</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>Progress: {answeredCount} / {totalPertanyaan}</Text>
            <Text style={styles.progressPercentage}>{Math.round(progress)}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
          </View>
        </View>

        <ScrollView ref={scrollViewRef} style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.instructionCard}>
            <MaterialCommunityIcons name="information" size={20} color={colors.primary} style={styles.instructionIcon} />
            <Text style={styles.instructionText}>Berikan penilaian objektif untuk fasilitas ini demi peningkatan kualitas layanan.</Text>
          </View>

          {Object.entries(groupedQuestions).map(([name, list]) => renderKategori(name, list))}

          <View style={styles.komentarContainer}>
            <Text style={styles.komentarLabel}>Komentar / Saran (Opsional)</Text>
            <TextInput
              style={styles.komentarInput}
              placeholder="Tuliskan masukan Anda..."
              value={komentar}
              onChangeText={(text) => { setKomentar(text); setHasUnsavedChanges(true); }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={{ height: 100 }} />
        </ScrollView>

        <View style={styles.submitContainer}>
          <TouchableOpacity
            style={[styles.submitButton, (submitting || progress < 100) && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={submitting || progress < 100}
          >
            {submitting ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitButtonText}>Kirim Evaluasi</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  keyboardView: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#64748B' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitleContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 12, color: '#64748B' },
  fasilitasInfoCard: { flexDirection: 'row', padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  fasilitasIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  fasilitasInfo: { justifyContent: 'center' },
  fasilitasNama: { fontSize: 16, fontWeight: 'bold' },
  fasilitasKode: { fontSize: 12, color: '#64748B' },
  progressContainer: { padding: 16, backgroundColor: '#FFF' },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressText: { fontSize: 14, fontWeight: '500' },
  progressPercentage: { fontSize: 14, color: '#2563EB', fontWeight: 'bold' },
  progressBarBg: { height: 8, backgroundColor: '#F1F5F9', borderRadius: 4 },
  progressBarFill: { height: '100%', backgroundColor: '#2563EB', borderRadius: 4 },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },
  instructionCard: { flexDirection: 'row', padding: 16, backgroundColor: '#E0F2FE', borderRadius: 12, marginBottom: 24 },
  instructionIcon: { marginRight: 12 },
  instructionText: { flex: 1, fontSize: 14, color: '#0369A1' },
  kategoriContainer: { marginBottom: 32 },
  kategoriHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  kategoriIconContainer: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  kategoriTitle: { fontSize: 16, fontWeight: 'bold' },
  pertanyaanContainer: { backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  pertanyaanNumber: { fontSize: 12, color: '#94A3B8', marginBottom: 8 },
  komentarContainer: { padding: 16, backgroundColor: '#FFF', borderRadius: 16 },
  komentarLabel: { fontSize: 16, fontWeight: '600', marginBottom: 12 },
  komentarInput: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 12, minHeight: 120, backgroundColor: '#F8FAFC' },
  submitContainer: { padding: 16, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  submitButton: { backgroundColor: '#2563EB', height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  submitButtonDisabled: { backgroundColor: '#94A3B8' },
  submitButtonText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
});

export default FormEvaluasiFasilitasScreen;
