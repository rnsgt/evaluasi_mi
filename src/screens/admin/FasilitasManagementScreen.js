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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius as radius } from '../../utils/theme';
import fasilitasService from '../../services/fasilitasService';

const FasilitasManagementScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fasilitasList, setFasilitasList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [stats, setStats] = useState({ total: 0, aktif: 0, tidak_aktif: 0 });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedKategori, fasilitasList]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [data, statsData] = await Promise.all([
        fasilitasService.getAllFasilitas(true),
        fasilitasService.getFasilitasStats(),
      ]);
      setFasilitasList(data);
      setStats(statsData);
    } catch (error) {
      console.error('Load fasilitas error:', error);
      Alert.alert('Error', 'Gagal memuat data fasilitas');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const applyFilters = async () => {
    try {
      let filtered = [...fasilitasList];

      // Apply kategori filter
      if (selectedKategori !== 'Semua') {
        filtered = filtered.filter((f) => f.kategori === selectedKategori);
      }

      // Apply search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(
          (f) =>
            f.nama.toLowerCase().includes(query) ||
            f.kode.toLowerCase().includes(query) ||
            f.lokasi.toLowerCase().includes(query)
        );
      }

      setFilteredList(filtered);
    } catch (error) {
      console.error('Apply filters error:', error);
    }
  };

  const handleCreate = () => {
    navigation.navigate('FormFasilitas', { mode: 'create' });
  };

  const handleEdit = (fasilitas) => {
    navigation.navigate('FormFasilitas', { mode: 'edit', fasilitas });
  };

  const handleToggleStatus = async (fasilitas) => {
    const newStatus = fasilitas.status === 'aktif' ? 'tidak aktif' : 'aktif';
    Alert.alert(
      'Ubah Status',
      `Ubah status fasilitas "${fasilitas.nama}" menjadi ${newStatus}?`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ubah',
          onPress: async () => {
            try {
              await fasilitasService.toggleStatus(fasilitas.id);
              Alert.alert('Berhasil', 'Status fasilitas berhasil diubah');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Gagal mengubah status fasilitas');
            }
          },
        },
      ]
    );
  };

  const handleDelete = (fasilitas) => {
    Alert.alert(
      'Hapus Fasilitas',
      `Hapus fasilitas "${fasilitas.nama}"?\n\nTindakan ini tidak dapat dibatalkan.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await fasilitasService.deleteFasilitas(fasilitas.id);
              if (result.success) {
                Alert.alert('Berhasil', 'Fasilitas berhasil dihapus');
                loadData();
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              Alert.alert('Error', 'Gagal menghapus fasilitas');
            }
          },
        },
      ]
    );
  };

  const renderFasilitasCard = ({ item }) => {
    const statusColor = item.status === 'aktif' ? colors.success : colors.textDisabled;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardHeaderLeft}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name={item.icon || 'office-building'}
                size={28}
                color={colors.primary}
              />
            </View>
            <View style={styles.cardHeaderInfo}>
              <Text style={styles.cardNama} numberOfLines={1}>
                {item.nama}
              </Text>
              <Text style={styles.cardKode}>{item.kode}</Text>
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
            <MaterialCommunityIcons name="tag" size={16} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Kategori:</Text>
            <View style={styles.kategoriBadge}>
              <Text style={styles.kategoriText}>{item.kategori}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="map-marker" size={16} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Lokasi:</Text>
            <Text style={styles.infoValue}>{item.lokasi}</Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="account-group" size={16} color={colors.textSecondary} />
            <Text style={styles.infoLabel}>Kapasitas:</Text>
            <Text style={styles.infoValue}>{item.kapasitas} orang</Text>
          </View>

          {item.fasilitas && item.fasilitas.length > 0 && (
            <View style={styles.fasilitasContainer}>
              <Text style={styles.fasilitasLabel}>Fasilitas:</Text>
              <View style={styles.fasilitasChips}>
                {item.fasilitas.slice(0, 3).map((f, index) => (
                  <View key={index} style={styles.fasilitasChip}>
                    <Text style={styles.fasilitasChipText}>{f}</Text>
                  </View>
                ))}
                {item.fasilitas.length > 3 && (
                  <Text style={styles.fasilitasMore}>+{item.fasilitas.length - 3}</Text>
                )}
              </View>
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
          <Text style={styles.loadingText}>Memuat data fasilitas...</Text>
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
          <Text style={styles.headerTitle}>Fasilitas</Text>
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
          placeholder="Cari nama, kode, atau lokasi..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Kategori Filter */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={fasilitasService.getAllKategori()}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterChip,
                selectedKategori === item && styles.filterChipActive,
              ]}
              onPress={() => setSelectedKategori(item)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  selectedKategori === item && styles.filterChipTextActive,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Fasilitas List */}
      <FlatList
        data={filteredList}
        renderItem={renderFasilitasCard}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="office-building-outline"
              size={64}
              color={colors.textDisabled}
            />
            <Text style={styles.emptyStateText}>Tidak ada fasilitas ditemukan</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery || selectedKategori !== 'Semua'
                ? 'Coba ubah filter atau pencarian'
                : 'Tap tombol + untuk menambah fasilitas baru'}
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
    marginTop: spacing.base,
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
  filterContainer: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  filterChip: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.base,
    borderRadius: radius.full,
    backgroundColor: '#f5f5f5',
    marginRight: spacing.xs,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.medium,
  },
  filterChipTextActive: {
    color: '#fff',
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
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: radius.base,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
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
  cardKode: {
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
  kategoriBadge: {
    flex: 1,
    marginLeft: spacing.xs,
    backgroundColor: colors.primary + '10',
    paddingVertical: 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  kategoriText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  fasilitasContainer: {
    marginTop: spacing.xs,
  },
  fasilitasLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  fasilitasChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  fasilitasChip: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 2,
    paddingHorizontal: spacing.xs,
    borderRadius: radius.xs,
  },
  fasilitasChipText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  fasilitasMore: {
    fontSize: typography.fontSize.xs,
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

export default FasilitasManagementScreen;
