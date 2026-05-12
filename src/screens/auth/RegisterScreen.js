import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  ImageBackground,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { validateNIM, validateEmail } from '../../utils/helpers';
import ToastNotification from '../../components/ToastNotification';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const { register } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nim: '',
    nama: '',
    email: '',
    prodi: '',
    angkatan: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');

  const showToast = (message, type = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.nim) newErrors.nim = 'NIM wajib';
    if (!formData.nama) newErrors.nama = 'Nama wajib';
    if (!formData.email) newErrors.email = 'Email wajib';
    if (!formData.prodi) newErrors.prodi = 'Prodi wajib';
    if (!formData.angkatan) newErrors.angkatan = 'Angkatan wajib';
    if (!formData.password) newErrors.password = 'Password minimal 6 karakter';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Password tidak cocok';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      showToast('Lengkapi semua data pendaftaran', 'warning');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      showToast('Berhasil mendaftar!', 'success');
    } catch (error) {
      showToast(error.message || 'Pendaftaran gagal', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const renderInput = (label, field, icon, placeholder, secure = false, keyboard = 'default', showToggle = false, toggleFunc = null, toggleVal = false) => (
    <View style={styles.inputGroup}>
      <View style={[styles.inputContainer, errors[field] && styles.inputError]}>
        <MaterialCommunityIcons name={icon} size={20} color={colors.primary} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          value={formData[field]}
          onChangeText={(val) => updateField(field, val)}
          secureTextEntry={secure}
          keyboardType={keyboard}
          editable={!loading}
          autoCapitalize={field === 'email' ? 'none' : 'words'}
        />
        {showToggle && (
          <TouchableOpacity onPress={toggleFunc}>
            <MaterialCommunityIcons name={toggleVal ? 'eye-off' : 'eye'} size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ImageBackground source={require('../../../assets/gedung diklat.jpg')} style={styles.background}>
        <View style={styles.overlay}>
          <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
              <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                <View style={styles.header}>
                  <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
                  </TouchableOpacity>
                  <View style={{ flex: 1, alignItems: 'center', marginRight: 44 }}>
                     <Text style={styles.title}>Daftar Akun</Text>
                     <Text style={styles.subtitle}>Sistem Evaluasi Akademik</Text>
                  </View>
                </View>

                <View style={[styles.card, styles.shadowLarge]}>
                  {renderInput('NIM', 'nim', 'card-account-outline', 'Nomor Induk Mahasiswa', false, 'numeric')}
                  {renderInput('Nama', 'nama', 'account-outline', 'Nama Lengkap')}
                  {renderInput('Email', 'email', 'email-outline', 'Alamat Email', false, 'email-address')}
                  {renderInput('Prodi', 'prodi', 'book-outline', 'Program Studi (Contoh: MI)')}
                  {renderInput('Angkatan', 'angkatan', 'calendar-outline', 'Tahun Angkatan (Contoh: 2023)', false, 'numeric')}
                  {renderInput('Password', 'password', 'lock-outline', 'Password', !showPassword, 'default', true, () => setShowPassword(!showPassword), showPassword)}
                  {renderInput('Konfirmasi', 'confirmPassword', 'lock-check-outline', 'Konfirmasi Password', !showConfirmPassword, 'default', true, () => setShowConfirmPassword(!showConfirmPassword), showConfirmPassword)}

                  <TouchableOpacity
                    style={[styles.btnAction, { backgroundColor: colors.primary }]}
                    onPress={handleRegister}
                    disabled={loading}
                  >
                    {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Daftar Sekarang</Text>}
                  </TouchableOpacity>

                  <View style={styles.loginLinkRow}>
                    <Text style={styles.linkText}>Sudah punya akun? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                      <Text style={[styles.linkAction, { color: colors.primary }]}>Login</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={{ height: 40 }} />
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </ImageBackground>

      <ToastNotification visible={toastVisible} message={toastMessage} type={toastType} onHide={() => setToastVisible(false)} />
    </View>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(15, 60, 89, 0.75)' },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: height * 0.05, paddingBottom: 40 },
  
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#FFF' },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.7)' },

  card: { backgroundColor: '#FFF', borderRadius: 28, padding: 20 },
  inputGroup: { marginBottom: 12 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 14, paddingHorizontal: 12, height: 50, borderWidth: 1, borderColor: '#F1F5F9' },
  inputError: { borderColor: '#FECACA' },
  input: { flex: 1, marginLeft: 10, fontSize: 14, color: '#1E293B', fontWeight: '600' },
  
  btnAction: { height: 54, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 10, elevation: 4 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },

  loginLinkRow: { flexDirection: 'row', justifyContent: 'center', marginTop: 20 },
  linkText: { color: '#64748B', fontSize: 14 },
  linkAction: { fontSize: 14, fontWeight: 'bold' },

  shadowLarge: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
});

export default RegisterScreen;
