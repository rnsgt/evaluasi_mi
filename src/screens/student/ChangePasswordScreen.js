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
import { colors as staticColors, typography, spacing, borderRadius as radius } from '../../utils/theme';
import authService from '../../services/authService';

// Komponen input field terpisah untuk mencegah keyboard menutup
const PasswordInputField = React.memo(({ label, value, onChangeText, showPassword, onToggleShow, placeholder, error, loading, colors: themeColors }) => {
  // Fallback ke static colors jika theme colors undefined
  const colors = themeColors || staticColors;
  
  return (
    <View style={styles.fieldContainer}>
      <Text style={[styles.fieldLabel, { color: colors.textPrimary || staticColors.textPrimary }]}>{label}</Text>
      <View style={[styles.inputWrapper, { borderColor: error ? staticColors.error : (colors.border || staticColors.border) }]}>
        <MaterialCommunityIcons
          name="lock-outline"
          size={20}
          color={error ? staticColors.error : (colors.textSecondary || staticColors.textSecondary)}
          style={styles.inputIcon}
        />
        <TextInput
          style={[styles.input, { color: colors.textPrimary || staticColors.textPrimary }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary || staticColors.textSecondary}
          secureTextEntry={!showPassword}
          value={value}
          onChangeText={onChangeText}
          editable={!loading}
        />
        <TouchableOpacity onPress={onToggleShow} style={styles.toggleButton} disabled={loading}>
          <MaterialCommunityIcons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color={colors.textSecondary || staticColors.textSecondary}
          />
        </TouchableOpacity>
      </View>
      {error && (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={14}
            color={staticColors.error}
            style={styles.errorIcon}
          />
          <Text style={[styles.errorText, { color: staticColors.error }]}>{error}</Text>
        </View>
      )}
    </View>
  );
});

PasswordInputField.displayName = 'PasswordInputField';

const ChangePasswordScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Trim whitespace untuk menghindari false positive
    const trimmedOldPassword = oldPassword.trim();
    const trimmedNewPassword = newPassword.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    if (!trimmedOldPassword || trimmedOldPassword.length === 0) {
      newErrors.oldPassword = 'Password lama harus diisi';
    }

    if (!trimmedNewPassword || trimmedNewPassword.length === 0) {
      newErrors.newPassword = 'Password baru harus diisi';
    } else if (trimmedNewPassword.length < 6) {
      newErrors.newPassword = 'Password minimal 6 karakter';
    } else if (trimmedNewPassword === trimmedOldPassword) {
      newErrors.newPassword = 'Password baru tidak boleh sama dengan password lama';
    }

    if (!trimmedConfirmPassword || trimmedConfirmPassword.length === 0) {
      newErrors.confirmPassword = 'Konfirmasi password harus diisi';
    } else if (trimmedConfirmPassword !== trimmedNewPassword) {
      newErrors.confirmPassword = 'Konfirmasi password tidak sesuai';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      // Trim values saat mengirim ke API
      await authService.changePassword(
        oldPassword.trim(),
        newPassword.trim(),
        confirmPassword.trim()
      );

      Alert.alert(
        'Berhasil',
        'Password Anda berhasil diubah. Silakan login kembali dengan password baru.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Clear form and go back
              setOldPassword('');
              setNewPassword('');
              setConfirmPassword('');
              setErrors({});
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Change password error:', error);
      
      // Handle berbagai jenis error response
      // Error dari api interceptor structure: { message, status, data }
      let message = 'Gagal mengubah password';
      
      if (error?.message) {
        message = error.message;
      } else if (error?.data?.message) {
        message = error.data.message;
      }

      // Log lebih detail untuk debugging
      console.log('Error details:', {
        status: error?.status,
        data: error?.data,
        message: message
      });

      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors?.surface || staticColors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            disabled={loading}
          >
            <MaterialCommunityIcons name="chevron-left" size={24} color={colors?.textPrimary || staticColors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors?.textPrimary || staticColors.textPrimary }]}>Ubah Password</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Info Card */}
        <View style={[styles.infoCard, { backgroundColor: (colors?.primary || staticColors.primary) + '10' }]}>
          <MaterialCommunityIcons
            name="information-outline"
            size={20}
            color={colors?.primary || staticColors.primary}
            style={styles.infoIcon}
          />
          <Text style={[styles.infoText, { color: colors?.primary || staticColors.primary }]}>
            Masukkan password lama Anda dan buat password baru yang kuat.
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          <PasswordInputField
            label="Password Lama"
            placeholder="Masukkan password lama Anda"
            value={oldPassword}
            onChangeText={setOldPassword}
            showPassword={showOldPassword}
            onToggleShow={() => setShowOldPassword(!showOldPassword)}
            error={errors.oldPassword}
            loading={loading}
            colors={colors}
          />

          <PasswordInputField
            label="Password Baru"
            placeholder="Masukkan password baru"
            value={newPassword}
            onChangeText={setNewPassword}
            showPassword={showNewPassword}
            onToggleShow={() => setShowNewPassword(!showNewPassword)}
            error={errors.newPassword}
            loading={loading}
            colors={colors}
          />

          <PasswordInputField
            label="Konfirmasi Password Baru"
            placeholder="Ketik ulang password baru"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            showPassword={showConfirmPassword}
            onToggleShow={() => setShowConfirmPassword(!showConfirmPassword)}
            error={errors.confirmPassword}
            loading={loading}
            colors={colors}
          />
        </View>

        {/* Password Requirements */}
        <View style={[styles.requirementsCard, { backgroundColor: colors?.card || staticColors.card }]}>
          <Text style={[styles.requirementsTitle, { color: colors?.textPrimary || staticColors.textPrimary }]}>
            Syarat Password Kuat:
          </Text>
          <View style={styles.requirement}>
            <MaterialCommunityIcons
              name={newPassword.trim().length >= 6 ? 'check-circle' : 'circle-outline'}
              size={16}
              color={newPassword.trim().length >= 6 ? (colors?.success || '#16A34A') : (colors?.textSecondary || staticColors.textSecondary)}
            />
            <Text style={[styles.requirementText, { color: colors?.textSecondary || staticColors.textSecondary }]}>
              Minimal 6 karakter
            </Text>
          </View>
          <View style={styles.requirement}>
            <MaterialCommunityIcons
              name={newPassword.trim() && newPassword.trim() !== oldPassword.trim() ? 'check-circle' : 'circle-outline'}
              size={16}
              color={newPassword.trim() && newPassword.trim() !== oldPassword.trim() ? (colors?.success || '#16A34A') : (colors?.textSecondary || staticColors.textSecondary)}
            />
            <Text style={[styles.requirementText, { color: colors?.textSecondary || staticColors.textSecondary }]}>
              Berbeda dengan password lama
            </Text>
          </View>
          <View style={styles.requirement}>
            <MaterialCommunityIcons
              name={newPassword.trim() && newPassword.trim() === confirmPassword.trim() ? 'check-circle' : 'circle-outline'}
              size={16}
              color={newPassword.trim() && newPassword.trim() === confirmPassword.trim() ? (colors?.success || '#16A34A') : (colors?.textSecondary || staticColors.textSecondary)}
            />
            <Text style={[styles.requirementText, { color: colors?.textSecondary || staticColors.textSecondary }]}>
              Konfirmasi password cocok
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { backgroundColor: colors?.surface || staticColors.background, borderTopColor: colors?.border || staticColors.border }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[styles.cancelButton, { borderColor: colors?.border || staticColors.border }]}
          disabled={loading}
        >
          <Text style={[styles.cancelButtonText, { color: colors?.textPrimary || staticColors.textPrimary }]}>Batal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleChangePassword}
          style={[styles.submitButton, { backgroundColor: colors?.primary || staticColors.primary }, loading && styles.submitButtonDisabled]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <MaterialCommunityIcons name="check" size={20} color="white" style={styles.submitButtonIcon} />
              <Text style={styles.submitButtonText}>Ubah Password</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: staticColors.background,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  infoCard: {
    flexDirection: 'row',
    padding: spacing.base,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
    alignItems: 'flex-start',
  },
  infoIcon: {
    marginRight: spacing.sm,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.fontSize.sm * 1.5,
  },
  formContainer: {
    marginBottom: spacing.lg,
  },
  fieldContainer: {
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
    marginBottom: spacing.xs,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: radius.base,
    paddingHorizontal: spacing.sm,
    height: 48,
  },
  inputIcon: {
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    paddingVertical: spacing.xs,
  },
  toggleButton: {
    padding: spacing.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  errorIcon: {
    marginRight: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },
  requirementsCard: {
    padding: spacing.base,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  requirementsTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semibold,
    marginBottom: spacing.sm,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  requirementText: {
    fontSize: typography.fontSize.xs,
    marginLeft: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.base,
    borderTopWidth: 1,
    gap: spacing.sm,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: spacing.base,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
  },
  submitButton: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: spacing.base,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonIcon: {
    marginRight: spacing.xs,
  },
  submitButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: 'white',
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
});

export default ChangePasswordScreen;

