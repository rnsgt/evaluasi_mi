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
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography, spacing, borderRadius as radius } from '../../utils/theme';
import { validateNIM } from '../../utils/helpers';

const LoginScreen = ({ navigation }) => {
  const { login, loading, authError } = useAuth();
  
  const [nim, setNim] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleLogin = async () => {
    // Validation
    const newErrors = {};
    
    if (!nim) {
      newErrors.nim = 'Username tidak boleh kosong';
    } else if (!validateNIM(nim)) {
      newErrors.nim = 'Username tidak valid';
    }
    
    if (!password) {
      newErrors.password = 'Password tidak boleh kosong';
    } else if (password.length < 6) {
      newErrors.password = 'Password minimal 6 karakter';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    
    // Call login
    const result = await login(nim, password);
    
    if (!result.success) {
      setErrors({ general: result.error });
    }
    // Navigation will be handled by AppNavigator based on auth state
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Evaluasi Akademik</Text>
            <Text style={styles.subtitle}>
              Sistem Penilaian Program Studi
            </Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            {/* NIM Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Username</Text>
              <View style={[styles.inputWrapper, errors.nim && styles.inputError]}>
                <MaterialCommunityIcons name="account-outline" size={24} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  value={nim}
                  onChangeText={(text) => {
                    setNim(text);
                    setErrors({ ...errors, nim: null, general: null });
                  }}
                  placeholder="Masukkan Username"
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              {errors.nim && (
                <Text style={styles.errorText}>
                  {errors.nim}
                </Text>
              )}
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={[styles.inputWrapper, errors.password && styles.inputError]}>
                <MaterialCommunityIcons name="lock-outline" size={24} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrors({ ...errors, password: null, general: null });
                  }}
                  placeholder="Masukkan password"
                  secureTextEntry={!showPassword}
                  style={[styles.input, { flex: 1 }]}
                  placeholderTextColor={colors.textSecondary}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <MaterialCommunityIcons 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={24} 
                    color={colors.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Text style={styles.errorText}>
                  {errors.password}
                </Text>
              )}
            </View>

            {/* General Error Message */}
            {(errors.general || authError) && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  {errors.general || authError}
                </Text>
              </View>
            )}

            {/* Login Button */}
            <TouchableOpacity
              onPress={loading ? null : handleLogin}
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              activeOpacity={loading ? 1 : 0.8}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.loginButtonLabel}>MASUK</Text>
              )}
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.registerLinkContainer}>
              <Text style={styles.registerLinkText}>Belum punya akun? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.registerLink}>Daftar disini</Text>
              </TouchableOpacity>
            </View>

            {/* Forgot Password Link - Optional */}
            {/* <TouchableOpacity 
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPassword}
            >
              <Text style={styles.forgotPasswordText}>Lupa Password?</Text>
            </TouchableOpacity> */}
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Versi 1.0.0</Text>
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
    paddingHorizontal: spacing.xl,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
    marginTop: spacing.xxl,
  },
  title: {
    fontSize: typography.fontSize.xxxl,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: spacing.xl,
  },
  inputContainer: {
    marginBottom: spacing.lg,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    height: 56,
  },
  inputError: {
    borderColor: colors.error,
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.regular,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: spacing.sm,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: spacing.md,
    borderRadius: radius.base,
    marginBottom: spacing.base,
  },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
    height: 48,
  },
  loginButtonDisabled: {
    backgroundColor: colors.disabled,
  },
  loginButtonLabel: {
    color: 'white',
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  registerLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  registerLinkText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  registerLink: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: spacing.md,
  },
  forgotPasswordText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    color: colors.textDisabled,
  },
});

export default LoginScreen;
