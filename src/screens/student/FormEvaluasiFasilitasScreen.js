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
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import LikertScale from '../../components/LikertScale';
import ToastNotification from '../../components/ToastNotification';
import evaluasiService from '../../services/evaluasiService';
import { getActivePeriode } from '../../services/periodeService';

const FormEvaluasiFasilitasScreen = ({ route, navigation }) => {
  const { fasilitasId, namaFasilitas, kodeFasilitas } = route.params;
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
        'Data Anda belum disimpan. Yakin ingin keluar?',
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
        newErrors[q.id] = 'Wajib diisi';
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
      Alert.alert('Belum Lengkap', 'Mohon isi semua pertanyaan.');
      return;
    }
    Alert.alert(
      'Kirim Penilaian?',
      'Terima kasih telah memberikan masukan yang jujur.',
      [
        { text: 'Batal', style: 'cancel' },
        { text: 'Kirim Sekarang', onPress: submitEvaluasi },
      ]
    );
  };

  const submitEvaluasi = async () => {
    try {
      setSubmitting(true);
      if (!activePeriode) {
        showToast('Periode tidak aktif', 'error');
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
      showToast('Berhasil dikirim!', 'success');
      setTimeout(() => navigation.navigate('HomeMain'), 1500);
    } catch (error) {
      showToast(error?.message || 'Gagal mengirim', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const groupedQuestions = useMemo(() => {
    const groups = {};
    questions.forEach(q => {
      const cat = (q.kategori || 'Aspek Penilaian');
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(q);
    });
    return groups;
  }, [questions]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBarStyle} />
      <ToastNotification visible={toastVisible} message={toastMessage} type={toastType} onHide={hideToast} colors={colors} />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }, colors.shadowSoft]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
            <MaterialCommunityIcons name="chevron-left" size={32} color={colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Evaluasi Layanan</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{namaFasilitas}</Text>
          </View>
          <View style={styles.iconButton} />
        </View>

        {/* Progress Sticky */}
        <View style={[styles.stickyProgress, { backgroundColor: colors.surface }]}>
          <View style={styles.progressTextRow}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Kelengkapan Data</Text>
            <Text style={[styles.progressVal, { color: colors.primary }]}>{Math.round(progress)}%</Text>
          </View>
          <View style={[styles.progressBase, { backgroundColor: colors.surfaceLight }]}>
            <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]} />
          </View>
        </View>

        <ScrollView ref={scrollViewRef} style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.infoCard, { backgroundColor: colors.primaryLight }]}>
            <MaterialCommunityIcons name="shield-check" size={24} color={colors.primary} />
            <Text style={[styles.infoText, { color: colors.primary }]}>Identitas Anda 100% anonim. Berikan penilaian sejujur mungkin.</Text>
          </View>

          {Object.entries(groupedQuestions).map(([cat, list]) => (
            <View key={cat} style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>{cat}</Text>
              </View>
              {list.map((q, i) => (
                <View key={q.id} style={[styles.card, { backgroundColor: colors.surface }, colors.shadowSoft]}>
                  <Text style={[styles.questionNo, { color: colors.textDisabled }]}>PERTANYAAN {questions.indexOf(q) + 1}</Text>
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
          ))}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.textPrimary, marginBottom: 12 }]}>Saran Perbaikan</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.surface, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Apa yang perlu diperbaiki dari fasilitas ini?"
              value={komentar}
              onChangeText={(text) => { setKomentar(text); setHasUnsavedChanges(true); }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor={colors.textDisabled}
            />
          </View>
          
          <View style={{ height: 40 }} />
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.surface }, colors.shadowLarge]}>
          <TouchableOpacity
            style={[styles.btnSubmit, { backgroundColor: colors.primary }, (submitting || progress < 100) && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={submitting || progress < 100}
          >
            {submitting ? <ActivityIndicator color="#FFF" /> : (
              <>
                <Text style={styles.btnText}>Kirim Penilaian</Text>
                <MaterialCommunityIcons name="send" size={18} color="#FFF" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12, paddingBottom: 20 },
  iconButton: { width: 48, height: 48, justifyContent: 'center', alignItems: 'center' },
  headerInfo: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  headerSubtitle: { fontSize: 13, fontWeight: '600', marginTop: 2 },
  
  stickyProgress: { padding: 20, paddingTop: 0 },
  progressTextRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  progressVal: { fontSize: 14, fontWeight: '900' },
  progressBase: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  
  scrollView: { flex: 1 },
  scrollContent: { padding: 20 },
  
  infoCard: { flexDirection: 'row', padding: 16, borderRadius: 20, gap: 12, alignItems: 'center', marginBottom: 32 },
  infoText: { flex: 1, fontSize: 13, fontWeight: '600', lineHeight: 18 },
  
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  
  card: { padding: 20, borderRadius: 24, marginBottom: 16 },
  questionNo: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 12 },
  
  input: { borderWidth: 1, borderRadius: 20, padding: 20, minHeight: 120, fontSize: 15 },
  
  footer: { padding: 20, paddingBottom: Platform.OS === 'ios' ? 10 : 20 },
  btnSubmit: { height: 60, borderRadius: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default FormEvaluasiFasilitasScreen;
