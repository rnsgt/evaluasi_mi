import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography, spacing, borderRadius as radius, shadows } from '../../utils/theme';
import { formatDate } from '../../utils/helpers';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [periodeAktif, setPeriodeAktif] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // TODO: Fetch periode aktif from API
      // const response = await periodeService.getActivePeriode();
      // setPeriodeAktif(response.data);
      
      // Dummy data for now
      setPeriodeAktif({
        nama: 'Semester Ganjil 2023/2024',
        batas_akhir: '2023-12-30',
      });
    } catch (error) {
      console.error('Load data error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleEvaluasiDosen = () => {
    navigation.navigate('PilihDosen');
  };

  const handleEvaluasiFasilitas = () => {
    navigation.navigate('PilihFasilitas');
  };

  const handleLihatJadwal = () => {
    // Navigate to Riwayat tab
    navigation.navigate('Riwayat');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>SELAMAT DATANG</Text>
            <Text style={styles.userName}>{user?.nama || 'Mahasiswa'}</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <MaterialCommunityIcons name="bell-outline" size={24} color={colors.textPrimary} />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Evaluasi Semester</Text>
          <TouchableOpacity onPress={handleLihatJadwal}>
            <Text style={styles.sectionLink}>Lihat Jadwal</Text>
          </TouchableOpacity>
        </View>

        {/* Evaluasi Cards */}
        <TouchableOpacity 
          style={[styles.evaluasiCard, { backgroundColor: colors.evaluasiDosen }]}
          onPress={handleEvaluasiDosen}
          activeOpacity={0.8}
        >
          <View style={styles.cardIconContainer}>
            <MaterialCommunityIcons name="school-outline" size={32} color="white" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Evaluasi Dosen</Text>
            <Text style={styles.cardDescription}>
              Berikan penilaian untuk kualitas pengajaran dosen pengampu di semester ini.
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleEvaluasiDosen}
            style={styles.cardButton}
            activeOpacity={0.8}
          >
            <Text style={styles.cardButtonLabel}>Mulai Penilaian</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.evaluasiCard, { backgroundColor: colors.evaluasiFasilitas }]}
          onPress={handleEvaluasiFasilitas}
          activeOpacity={0.8}
        >
          <View style={styles.cardIconContainer}>
            <MaterialCommunityIcons name="office-building-outline" size={32} color="white" />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>Evaluasi Fasilitas</Text>
            <Text style={styles.cardDescription}>
              Sampaikan aspirasi mengenai sarana, prasarana, dan layanan penunjang kampus.
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleEvaluasiFasilitas}
            style={styles.cardButton}
            activeOpacity={0.8}
          >
            <Text style={styles.cardButtonLabel}>Mulai Penilaian</Text>
          </TouchableOpacity>
        </TouchableOpacity>

        {/* Warning Card - Deadline */}
        {periodeAktif && (
          <View style={styles.warningCard}>
            <MaterialCommunityIcons name="information-outline" size={24} color="#E65100" style={styles.warningIcon} />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Penting</Text>
              <Text style={styles.warningText}>
                Batas waktu pengisian evaluasi semester adalah{' '}
                <Text style={styles.warningDate}>
                  {formatDate(periodeAktif.batas_akhir, 'DD MMMM YYYY')}
                </Text>
                . Nilai tidak dapat dilihat sebelum pengisian selesai.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.error,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  sectionLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
  },
  evaluasiCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.base,
    elevation: 4,
  },
  cardIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  cardContent: {
    marginBottom: spacing.base,
  },
  cardTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: 'white',
    marginBottom: spacing.sm,
  },
  cardDescription: {
    fontSize: typography.fontSize.sm,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  cardButton: {
    backgroundColor: 'white',
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardButtonLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: spacing.base,
    borderRadius: radius.md,
    marginTop: spacing.base,
  },
  warningIcon: {
    marginRight: spacing.md,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: '#E65100',
    marginBottom: spacing.xs,
  },
  warningText: {
    fontSize: typography.fontSize.sm,
    color: '#E65100',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  warningDate: {
    fontFamily: typography.fontFamily.bold,
  },
});

export default HomeScreen;
