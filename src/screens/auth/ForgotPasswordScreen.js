import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import authService from '../../services/authService';
import { useTheme } from '../../contexts/ThemeContext';
import ToastNotification from '../../components/ToastNotification';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');

  const showToast = (message, type = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleCheckUser = async () => {
    if (!identifier) {
      showToast('Masukkan NIM atau Email', 'warning');
      return;
    }

    try {
      setLoading(true);
      const result = await authService.forgotPassword(identifier);
      if (result.success) {
        setUserData(result.data);
        setStep(2);
        showToast('Akun ditemukan!', 'success');
      } else {
        showToast(result.message || 'Pengguna tidak ditemukan', 'error');
      }
    } catch (error) {
      showToast(error?.response?.data?.message || 'Terjadi kesalahan sistem', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      showToast('Minimal 6 karakter', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Password tidak cocok', 'error');
      return;
    }

    try {
      setLoading(true);
      const result = await authService.resetPassword(identifier, newPassword);
      if (result.success) {
        showToast('Password diperbarui!', 'success');
        setTimeout(() => navigation.navigate('Login'), 1500);
      } else {
        showToast(result.message || 'Gagal reset password', 'error');
      }
    } catch (error) {
      showToast(error?.response?.data?.message || 'Terjadi kesalahan sistem', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <ImageBackground source={require('../../../assets/gedung diklat.jpg')} style={styles.background}>
        <View style={styles.overlay}>
          <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                  <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Lupa Password</Text>
                <View style={{ width: 44 }} />
              </View>

              <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.iconCircle}>
                  <MaterialCommunityIcons 
                    name={step === 1 ? "lock-reset" : "shield-key-outline"} 
                    size={45} 
                    color={colors.primary} 
                  />
                </View>

                <Text style={styles.title}>{step === 1 ? 'Cari Akun' : 'Reset Password'}</Text>
                <Text style={styles.subtitle}>
                  {step === 1 
                    ? 'Masukkan identitas akun untuk pemulihan.' 
                    : `Halo ${userData?.nama}, masukkan password baru.`}
                </Text>

                <View style={[styles.card, styles.shadowLarge]}>
                  {step === 1 ? (
                    <View style={styles.inputGroup}>
                      <View style={styles.inputContainer}>
                        <MaterialCommunityIcons name="account-search-outline" size={20} color={colors.primary} />
                        <TextInput
                          value={identifier}
                          onChangeText={setIdentifier}
                          placeholder="NIM atau Email"
                          style={styles.input}
                          placeholderTextColor="#94A3B8"
                          autoCapitalize="none"
                        />
                      </View>
                    </View>
                  ) : (
                    <>
                      <View style={styles.inputGroup}>
                        <View style={styles.inputContainer}>
                          <MaterialCommunityIcons name="lock-outline" size={20} color={colors.primary} />
                          <TextInput
                            value={newPassword}
                            onChangeText={setNewPassword}
                            placeholder="Password Baru"
                            style={styles.input}
                            secureTextEntry
                            placeholderTextColor="#94A3B8"
                          />
                        </View>
                      </View>
                      <View style={styles.inputGroup}>
                        <View style={styles.inputContainer}>
                          <MaterialCommunityIcons name="lock-check-outline" size={20} color={colors.primary} />
                          <TextInput
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Konfirmasi Password"
                            style={styles.input}
                            secureTextEntry
                            placeholderTextColor="#94A3B8"
                          />
                        </View>
                      </View>
                    </>
                  )}

                  <TouchableOpacity
                    onPress={loading ? null : (step === 1 ? handleCheckUser : handleResetPassword)}
                    style={[styles.btnAction, { backgroundColor: colors.primary }]}
                  >
                    {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Lanjutkan</Text>}
                  </TouchableOpacity>
                </View>
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
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10 },
  backBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
  scrollContent: { padding: 20, alignItems: 'center', paddingTop: height * 0.05 },
  iconCircle: { width: 90, height: 90, backgroundColor: '#FFF', borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 20, elevation: 8 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 8, marginBottom: 25 },
  card: { backgroundColor: '#FFF', width: '100%', borderRadius: 28, padding: 20 },
  inputGroup: { marginBottom: 15 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 14, paddingHorizontal: 12, height: 50, borderWidth: 1, borderColor: '#F1F5F9' },
  input: { flex: 1, marginLeft: 10, fontSize: 15, color: '#1E293B', fontWeight: '600' },
  btnAction: { height: 54, borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginTop: 10, elevation: 4 },
  btnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  shadowLarge: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
});

export default ForgotPasswordScreen;
