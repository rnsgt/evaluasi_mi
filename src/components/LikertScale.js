import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { colors as staticColors, typography, spacing, borderRadius as radius } from '../utils/theme';

const LikertScale = ({ value, onValueChange, question, required = true, error }) => {
  const { colors } = useTheme();
  const options = [
    {
      value: 1,
      label: 'Sangat Tidak Setuju',
      color: '#FF5252',
      icon: 'emoticon-sad-outline',
    },
    {
      value: 2,
      label: 'Tidak Setuju',
      color: '#FF9800',
      icon: 'emoticon-neutral-outline',
    },
    {
      value: 3,
      label: 'Netral',
      color: '#FFC107',
      icon: 'emoticon-neutral-outline',
    },
    {
      value: 4,
      label: 'Setuju',
      color: '#8BC34A',
      icon: 'emoticon-happy-outline',
    },
    {
      value: 5,
      label: 'Sangat Setuju',
      color: '#4CAF50',
      icon: 'emoticon-excited-outline',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Question */}
      <View style={styles.questionContainer}>
        <Text style={styles.questionText}>
          {question}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
      </View>

      {/* Options */}
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.option,
                isSelected && styles.optionSelected,
                isSelected && { borderColor: option.color },
                error && !isSelected && styles.optionError,
              ]}
              onPress={() => onValueChange(option.value)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.iconContainer,
                  isSelected && { backgroundColor: option.color },
                ]}
              >
                <MaterialCommunityIcons
                  name={option.icon}
                  size={28}
                  color={isSelected ? '#FFFFFF' : colors.textDisabled}
                />
              </View>
              <Text
                style={[
                  styles.optionLabel,
                  isSelected && styles.optionLabelSelected,
                ]}
                numberOfLines={2}
              >
                {option.label}
              </Text>
              <View style={styles.valueCircle}>
                <Text
                  style={[
                    styles.valueText,
                    isSelected && styles.valueTextSelected,
                  ]}
                >
                  {option.value}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={16}
            color={colors.error}
            style={styles.errorIcon}
          />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  questionContainer: {
    marginBottom: spacing.md,
  },
  questionText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: staticColors.textPrimary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  required: {
    color: staticColors.error,
    fontSize: typography.fontSize.base,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  option: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xs,
    marginHorizontal: 2,
    borderRadius: radius.base,
    borderWidth: 2,
    borderColor: staticColors.border,
    backgroundColor: staticColors.background,
    minHeight: 120,
  },
  optionSelected: {
    borderWidth: 2.5,
    backgroundColor: '#F1F8F5',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  optionError: {
    borderColor: staticColors.error,
    borderWidth: 1.5,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: staticColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  optionLabel: {
    fontSize: typography.fontSize.xs,
    color: staticColors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.tight * typography.fontSize.xs,
    marginBottom: spacing.xs,
    flex: 1,
  },
  optionLabelSelected: {
    color: staticColors.textPrimary,
    fontFamily: typography.fontFamily.bold,
  },
  valueCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: staticColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: staticColors.textSecondary,
  },
  valueTextSelected: {
    color: staticColors.primary,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  errorIcon: {
    marginRight: spacing.xs,
  },
  errorText: {
    fontSize: typography.fontSize.xs,
    color: staticColors.error,
    flex: 1,
  },
});

export default LikertScale;
