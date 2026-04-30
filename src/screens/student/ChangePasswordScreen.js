import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import authService from '../../services/authService';

const ChangePasswordScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Semua field harus diisi');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password baru minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Konfirmasi password tidak cocok');
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword(oldPassword, newPassword, confirmPassword);
      Alert.alert('Berhasil', 'Password Anda telah diperbarui', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error?.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (label, value, setter, showKey, placeholder) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputWrapper}>
        <MaterialCommunityIcons name="lock-outline" size={22} color="#64748B" />
        <TextInput
          value={value}
          onChangeText={setter}
          placeholder={placeholder}
          secureTextEntry={!showPasswords[showKey]}
          style={styles.input}
          placeholderTextColor="#94A3B8"
        />
        <TouchableOpacity onPress={() => setShowPasswords({ ...showPasswords, [showKey]: !showPasswords[showKey] })}>
          <MaterialCommunityIcons name={showPasswords[showKey] ? 'eye-off-outline' : 'eye-outline'} size={22} color="#64748B" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#0F172A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ubah Password</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.cardInfo}>Keamanan akun Anda sangat penting. Gunakan kombinasi password yang kuat.</Text>
          
          {renderInput('Password Lama', oldPassword, setOldPassword, 'old', 'Masukkan password saat ini')}
          <View style={styles.divider} />
          {renderInput('Password Baru', newPassword, setNewPassword, 'new', 'Minimal 6 karakter')}
          {renderInput('Konfirmasi Password', confirmPassword, setConfirmPassword, 'confirm', 'Ulangi password baru')}

          <TouchableOpacity
            onPress={loading ? null : handleChangePassword}
            style={[styles.button, loading && styles.buttonDisabled]}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Simpan Perubahan</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.tipBox}>
          <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color="#0369A1" />
          <Text style={styles.tipText}>Tip: Jangan gunakan informasi publik seperti NIM atau tanggal lahir sebagai password.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  backButton: { width: 40, height: 40, backgroundColor: '#F8FAFC', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  scrollContent: { padding: 24 },
  card: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
  cardInfo: { fontSize: 13, color: '#64748B', lineHeight: 20, marginBottom: 24 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 16, paddingHorizontal: 16, height: 56 },
  input: { flex: 1, marginLeft: 12, fontSize: 15, color: '#0F172A' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginBottom: 24, marginTop: 4 },
  button: { backgroundColor: '#2563EB', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 12, elevation: 4 },
  buttonDisabled: { backgroundColor: '#94A3B8' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  tipBox: { flexDirection: 'row', marginTop: 24, padding: 16, backgroundColor: '#E0F2FE', borderRadius: 16, alignItems: 'center' },
  tipText: { flex: 1, marginLeft: 12, fontSize: 12, color: '#0369A1', lineHeight: 18 },
});

export default ChangePasswordScreen;
