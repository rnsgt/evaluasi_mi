import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, typography, spacing, borderRadius as radius } from '../../utils/theme';

const KelolaScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const menuItems = [
    {
      id: 'fasilitas',
      title: 'Kelola Fasilitas',
      description: 'Tambah, edit, dan hapus data fasilitas kampus',
      icon: 'office-building',
      color: '#4CAF50',
      route: 'FasilitasManagement',
    },
    {
      id: 'dosen',
      title: 'Kelola Dosen',
      description: 'Tambah, edit, dan hapus data dosen pengampu',
      icon: 'account-tie',
      color: '#2196F3',
      route: 'DosenManagement',
    },
  ];

  const handleMenuPress = (route) => {
    navigation.navigate(route);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>ADMIN</Text>
          <Text style={styles.headerTitle}>Kelola Data Master</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <MaterialCommunityIcons
              name="information"
              size={20}
              color={colors.primary}
            />
            <Text style={styles.infoText}>
              Kelola data master yang akan digunakan dalam evaluasi akademik
            </Text>
          </View>

          {/* Menu Cards */}
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuCard}
              onPress={() => handleMenuPress(item.route)}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: item.color + '20' }]}>
                <MaterialCommunityIcons
                  name={item.icon}
                  size={40}
                  color={item.color}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuDescription}>{item.description}</Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  content: {
    padding: spacing.base,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: colors.primary + '10',
    padding: spacing.base,
    borderRadius: radius.base,
    marginBottom: spacing.base,
  },
  infoText: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: spacing.base,
    borderRadius: radius.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  menuIconContainer: {
    width: 70,
    height: 70,
    borderRadius: radius.base,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContent: {
    flex: 1,
    marginLeft: spacing.base,
  },
  menuTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semibold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});

export default KelolaScreen;
