import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { colors as staticColors, typography, spacing, borderRadius as radius } from '../../utils/theme';
import { validateNIM, validateEmail } from '../../utils/helpers';

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

  const validateForm = () => {
    const newErrors = {};

    // Validate NIM
    if (!formData.nim) {
      newErrors.nim = 'NIM wajib diisi';
    } else if (!validateNIM(formData.nim)) {
      newErrors.nim = 'Format NIM tidak valid (min. 6 digit)';
    }

    // Validate Nama
    if (!formData.nama) {
      newErrors.nama = 'Nama wajib diisi';
    } else if (formData.nama.length < 3) {
      newErrors.nama = 'Nama minimal 3 karakter';
    }

    // Validate Email
    if (!formData.email) {
      newErrors.email = 'Email wajib diisi';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Validate Prodi
    if (!formData.prodi) {
      newErrors.prodi = 'Program Studi wajib diisi';
    }

    // Validate Angkatan
    if (!formData.angkatan) {
      newErrors.angkatan = 'Angkatan wajib diisi';
    } else if (!/^\d{4}$/.test(formData.angkatan)) {
      newErrors.angkatan = 'Angkatan harus 4 digit tahun (contoh: 2023)';
    }

    // Validate Password
    if (!formData.password) {
      newErrors.password = 'Password wajib diisi';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    // Validate Confirm Password
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Konfirmasi password wajib diisi';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Password tidak cocok';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      Alert.alert(
        'Berhasil',
        'Registrasi berhasil! Silakan login dengan akun Anda.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Registrasi gagal');
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
    // Clear error when user types
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <MaterialCommunityIcons name="school" size={64} color={colors.primary} />
            <Text style={styles.title}>Daftar Akun</Text>
            <Text style={styles.subtitle}>
              Buat akun baru untuk mengakses sistem evaluasi
            </Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* NIM Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>NIM</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="card-account-details"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan NIM"
                  value={formData.nim}
                  onChangeText={(value) => updateField('nim', value)}
                  keyboardType="numeric"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
              {errors.nim && <Text style={styles.errorText}>{errors.nim}</Text>}
            </View>

            {/* Nama Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nama Lengkap</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="account"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan nama lengkap"
                  value={formData.nama}
                  onChangeText={(value) => updateField('nama', value)}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
              {errors.nama && <Text style={styles.errorText}>{errors.nama}</Text>}
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="email"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan email"
                  value={formData.email}
                  onChangeText={(value) => updateField('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
              {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
            </View>

            {/* Prodi Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Program Studi</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="book-education"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: Manajemen Informatika"
                  value={formData.prodi}
                  onChangeText={(value) => updateField('prodi', value)}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>
              {errors.prodi && <Text style={styles.errorText}>{errors.prodi}</Text>}
            </View>

            {/* Angkatan Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Angkatan</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Contoh: 2023"
                  value={formData.angkatan}
                  onChangeText={(value) => updateField('angkatan', value)}
                  keyboardType="numeric"
                  maxLength={4}
                  editable={!loading}
                />
              </View>
              {errors.angkatan && <Text style={styles.errorText}>{errors.angkatan}</Text>}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="lock"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan password"
                  value={formData.password}
                  onChangeText={(value) => updateField('password', value)}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <MaterialCommunityIcons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
            </View>

            {/* Confirm Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Konfirmasi Password</Text>
              <View style={styles.inputWrapper}>
                <MaterialCommunityIcons
                  name="lock-check"
                  size={20}
                  color={colors.textSecondary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan ulang password"
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateField('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={styles.eyeIcon}
                >
                  <MaterialCommunityIcons
                    name={showConfirmPassword ? 'eye-off' : 'eye'}
                    size={20}
                    color={colors.textSecondary}
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
              )}
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Mendaftar...' : 'Daftar'}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginLinkText}>Sudah punya akun? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Login disini</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginTop: spacing.base,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: spacing.base,
  },
  label: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.base,
    height: 48,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  eyeIcon: {
    padding: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  registerButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.base,
    borderRadius: radius.base,
    alignItems: 'center',
    marginTop: spacing.lg,
    elevation: 2,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  loginLinkText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
});

export default RegisterScreen;
