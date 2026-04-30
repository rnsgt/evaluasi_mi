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
  Alert,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import authService from '../../services/authService';

const ForgotPasswordScreen = ({ navigation }) => {
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Check User, 2: Reset Password
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  const handleCheckUser = async () => {
    if (!identifier) {
      Alert.alert('Error', 'Silakan masukkan NIM atau Email');
      return;
    }

    try {
      setLoading(true);
      const result = await authService.forgotPassword(identifier);
      if (result.success) {
        setUserData(result.data);
        setStep(2);
      } else {
        Alert.alert('Gagal', result.message || 'Pengguna tidak ditemukan');
      }
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Konfirmasi password tidak cocok');
      return;
    }

    try {
      setLoading(true);
      const result = await authService.resetPassword(identifier, newPassword);
      if (result.success) {
        Alert.alert('Berhasil', result.message, [
          { text: 'Login Sekarang', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert('Gagal', result.message || 'Gagal mereset password');
      }
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Terjadi kesalahan sistem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lupa Password</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.iconCircle}>
            <MaterialCommunityIcons 
              name={step === 1 ? "lock-reset" : "shield-key-outline"} 
              size={50} 
              color="#2563EB" 
            />
          </View>

          <Text style={styles.title}>{step === 1 ? 'Cari Akun Anda' : 'Reset Password'}</Text>
          <Text style={styles.subtitle}>
            {step === 1 
              ? 'Masukkan NIM atau Email yang terdaftar untuk memulihkan akun Anda.' 
              : `Halo ${userData?.nama}, silakan masukkan password baru untuk akun Anda.`}
          </Text>

          <View style={styles.card}>
            {step === 1 ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>NIM / Email</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="account-search-outline" size={22} color="#64748B" />
                  <TextInput
                    value={identifier}
                    onChangeText={setIdentifier}
                    placeholder="Contoh: 21010101"
                    style={styles.input}
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                  />
                </View>
              </View>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password Baru</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons name="lock-outline" size={22} color="#64748B" />
                    <TextInput
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="Minimal 6 karakter"
                      style={styles.input}
                      secureTextEntry
                      placeholderTextColor="#94A3B8"
                    />
                  </View>
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Konfirmasi Password</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialCommunityIcons name="lock-check-outline" size={22} color="#64748B" />
                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Ulangi password baru"
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
              style={[styles.button, loading && styles.buttonDisabled]}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>{step === 1 ? 'Lanjutkan' : 'Perbarui Password'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  keyboardView: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20 },
  backButton: { width: 40, height: 40, backgroundColor: '#FFF', borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', marginLeft: 16, color: '#0F172A' },
  scrollContent: { padding: 24, alignItems: 'center' },
  iconCircle: { width: 100, height: 100, backgroundColor: '#DBECFF', borderRadius: 50, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748B', textAlign: 'center', marginTop: 8, marginBottom: 32, lineHeight: 20 },
  card: { backgroundColor: '#FFF', width: '100%', borderRadius: 24, padding: 24, elevation: 4 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 16, height: 56 },
  input: { flex: 1, marginLeft: 12, fontSize: 16, color: '#0F172A' },
  button: { backgroundColor: '#2563EB', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 12, elevation: 4 },
  buttonDisabled: { backgroundColor: '#94A3B8' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});

export default ForgotPasswordScreen;
