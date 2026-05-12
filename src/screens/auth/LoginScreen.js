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
  Dimensions,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ToastNotification from '../../components/ToastNotification';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { login, loading } = useAuth();
  const { colors } = useTheme();
  
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');

  const showToast = (message, type = 'error') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const handleLogin = async () => {
    const newErrors = {};
    if (!nim) newErrors.nim = 'Wajib diisi';
    if (!password) newErrors.password = 'Wajib diisi';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast('NIM dan Password wajib diisi', 'warning');
      return;
    }

    setErrors({});
    const result = await login(nim, password);
    if (!result.success) {
      showToast(result.error || 'NIM atau password salah', 'error');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      
      <ImageBackground 
        source={require('../../../assets/gedung diklat.jpg')} 
        style={styles.backgroundImage}
      >
        <View style={styles.overlay}>
          <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={{ flex: 1 }}
            >
              <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.headerSection}>
                  <View style={styles.logoBadge}>
                    <MaterialCommunityIcons name="shield-check" size={50} color={colors.primary} />
                  </View>
                  <Text style={styles.title}>Evaluasi MI</Text>
                  <Text style={styles.subtitle}>Penjaminan Mutu Internal</Text>
                </View>

                <View style={[styles.card, styles.shadowLarge]}>
                  <Text style={styles.cardHeaderTitle}>Login</Text>
                  <Text style={styles.cardHeaderSub}>Masuk untuk melanjutkan evaluasi</Text>

                  <View style={styles.inputGroup}>
                    <View style={[styles.inputContainer, errors.nim && styles.inputError]}>
                      <MaterialCommunityIcons name="account-outline" size={22} color={colors.primary} />
                      <TextInput
                        value={nim}
                        onChangeText={(text) => { setNim(text); setErrors({ ...errors, nim: null }); }}
                        placeholder="NIM / Email"
                        style={styles.input}
                        placeholderTextColor="#94A3B8"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  <View style={styles.inputGroup}>
                    <View style={[styles.inputContainer, errors.password && styles.inputError]}>
                      <MaterialCommunityIcons name="lock-outline" size={22} color={colors.primary} />
                      <TextInput
                        value={password}
                        onChangeText={(text) => { setPassword(text); setErrors({ ...errors, password: null }); }}
                        placeholder="Password"
                        secureTextEntry={!showPassword}
                        style={styles.input}
                        placeholderTextColor="#94A3B8"
                      />
                      <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#94A3B8" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity 
                    onPress={() => navigation.navigate('ForgotPassword')}
                    style={styles.forgotBtn}
                  >
                    <Text style={[styles.forgotText, { color: colors.primary }]}>Lupa password?</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={loading ? null : handleLogin}
                    style={[styles.loginBtn, { backgroundColor: colors.primary }]}
                    activeOpacity={0.8}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <Text style={styles.loginBtnText}>Masuk Sekarang</Text>
                    )}
                  </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                  <Text style={styles.footerText}>Belum punya akun? </Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={[styles.registerLink, { color: '#FFF' }]}>Daftar Disini</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </View>
      </ImageBackground>

      {/* Place Toast outside ScrollView and Overlay to ensure it stays on top */}
      <ToastNotification 
        visible={toastVisible} 
        message={toastMessage} 
        type={toastType} 
        onHide={() => setToastVisible(false)} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(15, 60, 89, 0.75)' },
  container: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: height * 0.08, paddingBottom: 40 },
  
  headerSection: { alignItems: 'center', marginBottom: 30 },
  logoBadge: { width: 85, height: 85, backgroundColor: '#FFF', borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 15, elevation: 10 },
  title: { fontSize: 30, fontWeight: '900', color: '#FFF', letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: '600' },

  card: { backgroundColor: '#FFF', borderRadius: 30, padding: 25, width: '100%' },
  cardHeaderTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E293B' },
  cardHeaderSub: { fontSize: 13, color: '#64748B', marginBottom: 25, marginTop: 4 },

  inputGroup: { marginBottom: 15 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: '#F1F5F9' },
  inputError: { borderColor: '#FECACA', backgroundColor: '#FFF1F2' },
  input: { flex: 1, marginLeft: 12, fontSize: 15, color: '#1E293B', fontWeight: '600' },

  forgotBtn: { alignSelf: 'flex-end', marginBottom: 25 },
  forgotText: { fontSize: 14, fontWeight: '700' },

  loginBtn: { height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', elevation: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  loginBtnText: { color: '#FFF', fontSize: 16, fontWeight: '900' },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  registerLink: { fontWeight: '900', fontSize: 14, textDecorationLine: 'underline' },

  shadowLarge: { shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
});

export default LoginScreen;
