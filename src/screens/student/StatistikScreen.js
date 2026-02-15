import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../utils/theme';

const StatistikScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <MaterialCommunityIcons name="chart-bar" size={64} color={colors.textDisabled} />
        <Text style={styles.title}>Statistik</Text>
        <Text style={styles.subtitle}>Fitur dalam pengembangan</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginTop: spacing.base,
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
});

export default StatistikScreen;
