import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius as radius } from '../../utils/theme';
import periodeService from '../../services/periodeService';

const PeriodeScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [periodeList, setPeriodeList] = useState([]);
  const [activePeriode, setActivePeriode] = useState(null);

  useEffect(() => {
    loadPeriode();
  }, []);

  const loadPeriode = async () => {
    try {
      setLoading(true);
      const data = await periodeService.getAllPeriode();
      setPeriodeList(data);
      
      const active = data.find((p) => p.status === 'aktif');
      setActivePeriode(active);
    } catch (error) {
      console.error('Load periode error:', error);
      Alert.alert('Error', 'Gagal memuat data periode');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPeriode();
    setRefreshing(false);
  };

  const handleCreate = () => {
    navigation.navigate('FormPeriode', { mode: 'create' });
  };

  const handleEdit = (periode) => {
    navigation.navigate('FormPeriode', { mode: 'edit', periode });
  };

  const handleActivate = (periode) => {
    Alert.alert(
      'Aktifkan Periode',
      `Aktifkan periode "${periode.nama}"?\n\nPeriode yang sedang aktif akan dinonaktifkan secara otomatis.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Aktifkan',
          onPress: async () => {
            try {
              await periodeService.activatePeriode(periode.id);
              Alert.alert('Berhasil', 'Periode berhasil diaktifkan');
              loadPeriode();
            } catch (error) {
              Alert.alert('Error', 'Gagal mengaktifkan periode');
            }
          },
        },
      ]
    );
  };

  const handleDeactivate = (periode) => {
    Alert.alert(
      'Nonaktifkan Periode',
      `Nonaktifkan periode "${periode.nama}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Nonaktifkan',
          onPress: async () => {
            try {
              await periodeService.deactivatePeriode(periode.id);
              Alert.alert('Berhasil', 'Periode berhasil dinonaktifkan');
              loadPeriode();
            } catch (error) {
              Alert.alert('Error', 'Gagal menonaktifkan periode');
            }
          },
        },
      ]
    );
  };

  const handleDelete = (periode) => {
    if (periode.status === 'aktif') {
      Alert.alert('Tidak Dapat Dihapus', 'Periode yang sedang aktif tidak dapat dihapus');
      return;
    }

    Alert.alert(
      'Hapus Periode',
      `Hapus periode "${periode.nama}"?\n\nTindakan ini tidak dapat dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await periodeService.deletePeriode(periode.id);
              if (result.success) {
                Alert.alert('Berhasil', 'Periode berhasil dihapus');
                loadPeriode();
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus periode');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'aktif':
        return colors.success;
      case 'selesai':
        return colors.textDisabled;
      default:
        return colors.warning;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'aktif':
        return 'Aktif';
      case 'selesai':
        return 'Selesai';
      default:
        return 'Tidak Aktif';
    }
  };

  const renderPeriodeCard = ({ item }) => {
    const statusColor = getStatusColor(item.status);
    const statusLabel = getStatusLabel(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>{item.nama}</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar" size={16} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Tahun Ajaran:</Text>
            <Text style={styles.infoValue}>{item.tahun_ajaran}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar-check" size={16} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Semester:</Text>
            <Text style={styles.infoValue}>{item.semester}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="calendar-range" size={16} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Periode:</Text>
            <Text style={styles.infoValue}>
              {item.tanggal_mulai} s/d {item.tanggal_akhir}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="clock-alert" size={16} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Batas Evaluasi:</Text>
            <Text style={styles.infoValue}>{item.batas_evaluasi}</Text>
          </View>

          {item.keterangan && (
            <View style={styles.keteranganContainer}>
              <Text style={styles.keterangan}>{item.keterangan}</Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          {item.status === 'tidak_aktif' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.activateButton]}
              onPress={() => handleActivate(item)}
            >
              <MaterialCommunityIcons name="check-circle" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Aktifkan</Text>
            </TouchableOpacity>
          )}

          {item.status === 'aktif' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.deactivateButton]}
              onPress={() => handleDeactivate(item)}
            >
              <MaterialCommunityIcons name="close-circle" size={18} color="#fff" />
              <Text style={styles.actionButtonText}>Nonaktifkan</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => handleEdit(item)}
          >
            <MaterialCommunityIcons name="pencil" size={18} color="#fff" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.deleteButton,
              item.status === 'aktif' && styles.disabledButton,
            ]}
            onPress={() => handleDelete(item)}
            disabled={item.status === 'aktif'}
          >
            <MaterialCommunityIcons
              name="delete"
              size={18}
              color={item.status === 'aktif' ? colors.textDisabled : '#fff'}
            />
            <Text
              style={[
                styles.actionButtonText,
                item.status === 'aktif' && styles.disabledButtonText,
              ]}
            >
              Hapus
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Memuat periode...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>ADMIN</Text>
        <Text style={styles.headerTitle}>Kelola Periode</Text>
      </View>

      {/* Active Periode Info */}
      {activePeriode && (
        <View style={styles.activePeriodeCard}>
          <MaterialCommunityIcons name="information" size={20} color={colors.success} />
          <View style={styles.activePeriodeInfo}>
            <Text style={styles.activePeriodeLabel}>Periode Aktif:</Text>
            <Text style={styles.activePeriodeNama}>{activePeriode.nama}</Text>
          </View>
        </View>
      )}

      {/* Periode List */}
      <FlatList
        data={periodeList}
        renderItem={renderPeriodeCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="calendar-blank"
              size={64}
              color={colors.textDisabled}
            />
            <Text style={styles.emptyStateText}>Belum ada periode</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap tombol + untuk membuat periode baru
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleCreate}>
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.base,
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  header: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
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
  activePeriodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '10',
    padding: spacing.base,
    marginHorizontal: spacing.base,
    marginTop: spacing.base,
    borderRadius: radius.base,
    borderWidth: 1,
    borderColor: colors.success + '30',
  },
  activePeriodeInfo: {
    marginLeft: spacing.sm,
    flex: 1,
  },
  activePeriodeLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  activePeriodeNama: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  listContent: {
    padding: spacing.base,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: radius.base,
    padding: spacing.base,
    marginBottom: spacing.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    marginBottom: spacing.sm,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitle: {
    flex: 1,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginRight: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
  },
  cardContent: {
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  infoLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginLeft: 6,
  },
  infoValue: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    marginLeft: spacing.xs,
  },
  keteranganContainer: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
  },
  keterangan: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    gap: 4,
  },
  activateButton: {
    backgroundColor: colors.success,
  },
  deactivateButton: {
    backgroundColor: colors.warning,
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  disabledButton: {
    backgroundColor: colors.border,
  },
  actionButtonText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: '#fff',
  },
  disabledButtonText: {
    color: colors.textDisabled,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyStateText: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.textSecondary,
    marginTop: spacing.base,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textDisabled,
    marginTop: spacing.xs,
  },
  fab: {
    position: 'absolute',
    right: spacing.base,
    bottom: spacing.base,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default PeriodeScreen;
