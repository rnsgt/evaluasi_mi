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
  Image,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const { login, loading, authError } = useAuth();
  const { colors } = useTheme();
  
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleLogin = async () => {
    const newErrors = {};
    if (!nim) newErrors.nim = 'NIM/Email tidak boleh kosong';
    if (!password) newErrors.password = 'Password tidak boleh kosong';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const result = await login(nim, password);
    if (!result.success) {
      setErrors({ general: result.error });
    }
  };

  return (
    <ImageBackground 
      source={require('../../../assets/gedung diklat.jpg')} 
      style={styles.backgroundImage}
    >
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.keyboardView}
          >
            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
              <View style={styles.headerSection}>
                <View style={styles.logoContainer}>
              <MaterialCommunityIcons name="school-outline" size={60} color="#2563EB" />
                </View>
                <Text style={styles.title}>Evaluasi MI</Text>
            <Text style={styles.subtitle}>Sistem Penilaian Mutu & Akademik</Text>
              </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Selamat Datang</Text>
            <Text style={styles.cardSubtitle}>Silakan login untuk melanjutkan</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>NIM / Email</Text>
              <View style={[styles.inputWrapper, errors.nim && styles.inputError]}>
                <MaterialCommunityIcons name="account-outline" size={22} color="#64748B" />
                <TextInput
                  value={nim}
                  onChangeText={(text) => { setNim(text); setErrors({ ...errors, nim: null, general: null }); }}
                  placeholder="Masukkan NIM atau Email"
                  style={styles.input}
                  placeholderTextColor="#94A3B8"
                  autoCapitalize="none"
                />
              </View>
              {errors.nim && <Text style={styles.errorText}>{errors.nim}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                <MaterialCommunityIcons name="lock-outline" size={22} color="#64748B" />
                <TextInput
                  value={password}
                  onChangeText={(text) => { setPassword(text); setErrors({ ...errors, password: null, general: null }); }}
                  placeholder="Masukkan password"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  placeholderTextColor="#94A3B8"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color="#64748B" />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            <TouchableOpacity 
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotButton}
            >
              <Text style={[styles.forgotText, { color: colors.primary }]}>Lupa Password?</Text>
            </TouchableOpacity>

            {errors.general && (
              <View style={styles.generalError}>
                <MaterialCommunityIcons name="alert-circle-outline" size={18} color="#EF4444" />
                <Text style={styles.generalErrorText}>{errors.general}</Text>
              </View>
            )}

            <TouchableOpacity
              onPress={loading ? null : handleLogin}
              style={[styles.loginButton, { backgroundColor: colors.primary }, loading && styles.loginButtonDisabled]}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.loginButtonText}>Masuk Ke Akun</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Belum punya akun? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.registerLink, { color: colors.secondary }]}>Daftar Sekarang</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
    </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  backgroundImage: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(15, 60, 89, 0.85)' },
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  headerSection: { alignItems: 'center', marginBottom: 40 },
  logoContainer: { width: 110, height: 110, backgroundColor: '#FFFFFF', borderRadius: 55, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 10, marginBottom: 20 },
  logoImage: { width: 80, height: 80, resizeMode: 'contain' },
  title: { fontSize: 34, fontWeight: 'bold', color: '#FFFFFF', textShadowColor: 'rgba(0, 0, 0, 0.3)', textShadowOffset: {width: 0, height: 2}, textShadowRadius: 4 },
  subtitle: { fontSize: 15, color: '#F8FAFC', marginTop: 4, fontWeight: '500' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 32, padding: 32, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20 },
  cardTitle: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  cardSubtitle: { fontSize: 14, color: '#64748B', marginTop: 4, marginBottom: 32 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 16, height: 56 },
  inputError: { borderColor: '#FECACA', backgroundColor: '#FFF1F2' },
  input: { flex: 1, marginLeft: 12, fontSize: 16, color: '#0F172A' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 4 },
  forgotButton: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { color: '#2563EB', fontWeight: '600', fontSize: 14 },
  generalError: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 20 },
  generalErrorText: { color: '#B91C1C', fontSize: 13, marginLeft: 8, flex: 1 },
  loginButton: { height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  loginButtonDisabled: { backgroundColor: '#94A3B8', elevation: 0 },
  loginButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { color: '#E2E8F0', fontSize: 14 },
  registerLink: { fontWeight: 'bold', fontSize: 14 },
});

export default LoginScreen;
