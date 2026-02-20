import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, typography, spacing, borderRadius as radius } from '../../utils/theme';
import dosenService from '../../services/dosenService';

const DosenManagementScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dosenList, setDosenList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({ total: 0, aktif: 0, tidak_aktif: 0 });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applySearch();
  }, [searchQuery, dosenList]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [data, statsData] = await Promise.all([
        dosenService.getAllDosen(true),
        dosenService.getDosenStats(),
      ]);
      setDosenList(data);
      setStats(statsData);
    } catch (error) {
      console.error('Load dosen error:', error);
      Alert.alert('Error', 'Gagal memuat data dosen');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const applySearch = () => {
    if (!searchQuery.trim()) {
      setFilteredList(dosenList);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = dosenList.filter(
      (d) =>
        d.nama.toLowerCase().includes(query) ||
        d.nip.includes(query) ||
        d.email.toLowerCase().includes(query)
    );
    setFilteredList(filtered);
  };

  const handleCreate = () => {
    navigation.navigate('FormDosen', { mode: 'create' });
  };

  const handleEdit = (dosen) => {
    navigation.navigate('FormDosen', { mode: 'edit', dosen });
  };

  const handleToggleStatus = async (dosen) => {
    const newStatus = dosen.status === 'aktif' ? 'tidak aktif' : 'aktif';
    Alert.alert(
      'Ubah Status',
      `Ubah status dosen "${dosen.nama}" menjadi ${newStatus}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ubah',
          onPress: async () => {
            try {
              await dosenService.toggleStatus(dosen.id);
              Alert.alert('Berhasil', 'Status dosen berhasil diubah');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Gagal mengubah status dosen');
            }
          },
        },
      ]
    );
  };

  const handleDelete = (dosen) => {
    Alert.alert(
      'Hapus Dosen',
      `Hapus dosen "${dosen.nama}"?\n\nTindakan ini tidak dapat dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await dosenService.deleteDosen(dosen.id);
              if (result.success) {
                Alert.alert('Berhasil', 'Dosen berhasil dihapus');
                loadData();
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus dosen');
            }
          },
        },
      ]
    );
  };

  const getInitials = (nama) => {
    return nama
      .split(' ')
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
      .toUpperCase();
  };

  const renderDosenCard = ({ item }) => {
    const statusColor = item.status === 'aktif' ? colors.success : colors.textDisabled;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>{getInitials(item.nama)}</Text>
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.cardNama} numberOfLines={1}>
                {item.nama}
              </Text>
              <Text style={styles.cardNIP}>NIP: {item.nip}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status === 'aktif' ? 'Aktif' : 'Tidak Aktif'}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="email" size={16} color={colors.textSecondary} />
            <Text style={styles.infoValue}>{item.email}</Text>
          </View>

          {item.mata_kuliah && item.mata_kuliah.length > 0 && (
            <View style={styles.mataKuliahContainer}>
              <Text style={styles.mataKuliahLabel}>Mata Kuliah:</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.mataKuliahScroll}
              >
                {item.mata_kuliah.slice(0, 4).map((mk, index) => (
                  <View key={index} style={styles.mataKuliahChip}>
                    <Text style={styles.mataKuliahChipText}>{mk}</Text>
                  </View>
                ))}
                {item.mata_kuliah.length > 4 && (
                  <View style={[styles.mataKuliahChip, styles.mataKuliahChipMore]}>
                    <Text style={styles.mataKuliahChipText}>+{item.mata_kuliah.length - 4}</Text>
                  </View>
                )}
              </ScrollView>
            </View>
          )}

          {item.bio && (
            <View style={styles.bioContainer}>
              <Text style={styles.bioText} numberOfLines={2}>
                {item.bio}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.warning + '20' }]}
            onPress={() => handleToggleStatus(item)}
          >
            <MaterialCommunityIcons
              name={item.status === 'aktif' ? 'toggle-switch' : 'toggle-switch-off'}
              size={18}
              color={colors.warning}
            />
            <Text style={[styles.actionButtonText, { color: colors.warning }]}>
              {item.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
            onPress={() => handleEdit(item)}
          >
            <MaterialCommunityIcons name="pencil" size={18} color={colors.primary} />
            <Text style={[styles.actionButtonText, { color: colors.primary }]}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.danger + '20' }]}
            onPress={() => handleDelete(item)}
          >
            <MaterialCommunityIcons name="delete" size={18} color={colors.danger} />
            <Text style={[styles.actionButtonText, { color: colors.danger }]}>Hapus</Text>
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
          <Text style={styles.loadingText}>Memuat data dosen...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSubtitle}>KELOLA DATA</Text>
          <Text style={styles.headerTitle}>Dosen</Text>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.success }]}>{stats.aktif}</Text>
          <Text style={styles.statLabel}>Aktif</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.textDisabled }]}>
            {stats.tidak_aktif}
          </Text>
          <Text style={styles.statLabel}>Tidak Aktif</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color={colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama, NIP, atau email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Dosen List */}
      <FlatList
        data={filteredList}
        renderItem={renderDosenCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="account-tie-outline"
              size={64}
              color={colors.textDisabled}
            />
            <Text style={styles.emptyStateText}>Tidak ada dosen ditemukan</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery
                ? 'Coba ubah kata kunci pencarian'
                : 'Tap tombol + untuk menambah dosen baru'}
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
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
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.base,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 24,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: spacing.base,
    marginVertical: spacing.base,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.base,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontFamily: typography.fontFamily.bold,
    color: '#fff',
  },
  cardHeaderInfo: {
    flex: 1,
    marginLeft: spacing.sm,
    justifyContent: 'center',
  },
  cardNama: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.semibold,
    color: colors.textPrimary,
  },
  cardNIP: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginTop: 2,
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
  infoValue: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    marginLeft: 6,
  },
  mataKuliahContainer: {
    marginTop: spacing.xs,
  },
  mataKuliahLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  mataKuliahScroll: {
    flexDirection: 'row',
  },
  mataKuliahChip: {
    backgroundColor: colors.primary + '10',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    marginRight: spacing.xs,
  },
  mataKuliahChipMore: {
    backgroundColor: colors.textDisabled + '20',
  },
  mataKuliahChipText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  bioContainer: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.sm,
  },
  bioText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
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
    paddingHorizontal: spacing.xs,
    borderRadius: radius.sm,
    gap: 4,
  },
  actionButtonText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
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
    textAlign: 'center',
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

export default DosenManagementScreen;
