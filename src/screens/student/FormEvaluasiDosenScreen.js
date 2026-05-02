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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Path, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';
import LikertScale from '../../components/LikertScale';
import ToastNotification from '../../components/ToastNotification';
import evaluasiService from '../../services/evaluasiService';
import { getActivePeriode } from '../../services/periodeService';

const { width } = Dimensions.get('window');

const FormEvaluasiDosenScreen = ({ route, navigation }) => {
  const { dosenId, namaDosen, nip } = route.params;
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
          evaluasiService.getPernyataanDosen()
        ]);
        setActivePeriode(periode);
        setQuestions(fetchedQuestions);
      } catch (error) {
        console.error('Init evaluasi dosen error:', error);
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
      if (!hasUnsavedChanges || submitting) return;
      e.preventDefault();
      Alert.alert(
        'Batalkan Evaluasi?',
        'Anda memiliki perubahan yang belum disimpan. Yakin ingin keluar?',
        [
          { text: 'Tetap di sini', style: 'cancel' },
          { text: 'Keluar', style: 'destructive', onPress: () => navigation.dispatch(e.data.action) },
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
      'Kirim evaluasi ini untuk ' + namaDosen + '?',
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
        dosen_id: dosenId,
        mata_kuliah_nama: 'Umum',
        periode_id: activePeriode.id,
        komentar: komentar || null,
        jawaban,
      };
      await evaluasiService.submitEvaluasiDosen(evaluasiData);
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
      const cat = (q.kategori || 'Kompetensi').trim().replace(/\s+/g, ' ');
      const existingKey = Object.keys(groups).find(k => k.toLowerCase() === cat.toLowerCase());
      const key = existingKey || cat;
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(q);
    });
    return groups;
  }, [questions]);

  const renderKategori = (kategoriNama, questionsInGroup) => (
    <View key={kategoriNama} style={styles.kategoriSection}>
      <View style={styles.kategoriHeader}>
        <View style={[styles.kategoriDot, { backgroundColor: colors.primary }]} />
        <Text style={[styles.kategoriTitle, { color: colors.textPrimary }]}>{kategoriNama.toUpperCase()}</Text>
      </View>
      {questionsInGroup.map((q, idx) => (
        <View key={q.id} style={[styles.pertanyaanCard, { backgroundColor: colors.surface }, colors.shadowSoft]}>
          <View style={styles.pertanyaanHeader}>
            <View style={[styles.qNumberBadge, { backgroundColor: colors.primary + '10' }]}>
              <Text style={[styles.qNumberText, { color: colors.primary }]}>{questions.indexOf(q) + 1}</Text>
            </View>
            <Text style={[styles.pertanyaanLabel, { color: colors.textDisabled }]}>PERTANYAAN</Text>
          </View>
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
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingWrapper}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Memuat formulir...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" />
      <ToastNotification visible={toastVisible} message={toastMessage} type={toastType} onHide={hideToast} colors={colors} />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <View style={[styles.headerArea, { backgroundColor: colors.primaryDark }]}>
          <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
            <Circle cx={width} cy="0" r="100" fill="rgba(255,255,255,0.05)" />
            <Circle cx="0" cy="80" r="60" fill="rgba(255,255,255,0.03)" />
          </Svg>
          
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <MaterialCommunityIcons name="chevron-left" size={28} color="#FFF" />
            </TouchableOpacity>
            <View style={styles.headerTitleBox}>
              <Text style={styles.headerTitle}>Formulir Evaluasi</Text>
              <Text style={styles.headerSubtitle}>Dosen Pengampu</Text>
            </View>
            <View style={{ width: 40 }} />
          </View>

          <View style={[styles.dosenInfoBox, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.surface }]}>
              <MaterialCommunityIcons name="account-tie" size={32} color={colors.primary} />
            </View>
            <View style={styles.dosenTextInfo}>
              <Text style={styles.namaDosenText}>{namaDosen}</Text>
              <Text style={styles.nipDosenText}>NIP. {nip || '-'}</Text>
            </View>
          </View>
        </View>

        <View style={[styles.stickyProgress, { backgroundColor: colors.surface }, colors.shadowLarge]}>
          <View style={styles.progressTopRow}>
            <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Kelengkapan Jawaban</Text>
            <Text style={[styles.progressValue, { color: colors.primary }]}>{Math.round(progress)}%</Text>
          </View>
          <View style={[styles.barBg, { backgroundColor: colors.background }]}>
            <View style={[styles.barFill, { width: `${progress}%`, backgroundColor: colors.primary }]}>
               <LinearGradient id="gradBar" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={colors.primary} stopOpacity="1" />
                <Stop offset="1" stopColor={colors.primaryDark} stopOpacity="1" />
              </LinearGradient>
            </View>
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef} 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.noticeBox, { backgroundColor: colors.primary + '10', borderColor: colors.primary + '20' }]}>
            <MaterialCommunityIcons name="shield-check-outline" size={20} color={colors.primary} />
            <Text style={[styles.noticeText, { color: colors.textPrimary }]}>
              Identitas Anda akan disamarkan. Mohon berikan penilaian yang jujur dan objektif.
            </Text>
          </View>

          {Object.entries(groupedQuestions).map(([name, list]) => renderKategori(name, list))}

          <View style={[styles.commentSection, { backgroundColor: colors.surface }, colors.shadowSoft]}>
            <View style={styles.commentHeader}>
              <MaterialCommunityIcons name="message-draw" size={20} color={colors.primary} />
              <Text style={[styles.commentTitle, { color: colors.textPrimary }]}>SARAN & MASUKAN</Text>
            </View>
            <TextInput
              style={[styles.textInput, { backgroundColor: colors.background, color: colors.textPrimary, borderColor: colors.border }]}
              placeholder="Tuliskan masukan tambahan untuk dosen ini..."
              placeholderTextColor={colors.textDisabled}
              value={komentar}
              onChangeText={(text) => { setKomentar(text); setHasUnsavedChanges(true); }}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          <View style={{ height: 120 }} />
        </ScrollView>

        <View style={[styles.footer, { backgroundColor: colors.surface }, colors.shadowLarge]}>
          <TouchableOpacity
            style={[styles.btnKirim, (submitting || progress < 100) && { backgroundColor: colors.textDisabled }]}
            onPress={handleSubmit}
            disabled={submitting || progress < 100}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <Text style={styles.btnKirimText}>Kirim Evaluasi Sekarang</Text>
                <MaterialCommunityIcons name="send" size={20} color="#FFF" style={{ marginLeft: 8 }} />
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
  keyboardView: { flex: 1 },
  loadingWrapper: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, fontWeight: '600' },
  
  headerArea: { padding: 24, paddingTop: 60, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  headerTitleBox: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  headerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2, fontWeight: '600' },
  dosenInfoBox: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 24 },
  avatarCircle: { width: 60, height: 60, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  dosenTextInfo: { flex: 1, marginLeft: 16 },
  namaDosenText: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  nipDosenText: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  
  stickyProgress: { padding: 20, marginHorizontal: 24, marginTop: -30, borderRadius: 24, zIndex: 10 },
  progressTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  progressLabel: { fontSize: 12, fontWeight: 'bold', letterSpacing: 0.5 },
  progressValue: { fontSize: 18, fontWeight: '900' },
  barBg: { height: 10, borderRadius: 5, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 5 },
  
  scrollView: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 40 },
  noticeBox: { flexDirection: 'row', padding: 20, borderRadius: 20, marginBottom: 32, alignItems: 'center', borderWidth: 1 },
  noticeText: { flex: 1, marginLeft: 16, fontSize: 13, fontWeight: '600', lineHeight: 20 },
  
  kategoriSection: { marginBottom: 40 },
  kategoriHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20, marginLeft: 8 },
  kategoriDot: { width: 8, height: 8, borderRadius: 4 },
  kategoriTitle: { fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  
  pertanyaanCard: { padding: 20, borderRadius: 30, marginBottom: 20 },
  pertanyaanHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  qNumberBadge: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  qNumberText: { fontSize: 14, fontWeight: '900' },
  pertanyaanLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
  
  commentSection: { padding: 24, borderRadius: 35 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20 },
  commentTitle: { fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  textInput: { borderRadius: 20, padding: 20, minHeight: 140, borderWidth: 1, fontSize: 15, fontWeight: '500' },
  
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, borderTopLeftRadius: 35, borderTopRightRadius: 35 },
  btnKirim: { backgroundColor: '#2563EB', height: 65, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  btnKirimText: { color: '#FFF', fontWeight: 'bold', fontSize: 16, letterSpacing: 0.5 },
});

export default FormEvaluasiDosenScreen;
