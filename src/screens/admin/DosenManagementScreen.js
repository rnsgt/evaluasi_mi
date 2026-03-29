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
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors as staticColors, typography, spacing, borderRadius as radius } from '../../utils/theme';
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

  // Reload data setiap kali screen mendapat focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('DosenManagementScreen focused - reloading data');
      loadData();
    }, [])
  );

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
    console.log('handleEdit called with:', dosen);
    if (!navigation) {
      Alert.alert('Error', 'Navigation tidak tersedia');
      return;
    }
    try {
      navigation.navigate('FormDosen', { mode: 'edit', dosen });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Error', 'Gagal membuka form: ' + error.message);
    }
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
    console.log('handleDelete called with:', dosen);
    if (!dosen?.id) {
      Alert.alert('Error', 'ID dosen tidak valid');
      return;
    }
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
              console.log('Deleting dosen with id:', dosen.id);
              const result = await dosenService.deleteDosen(dosen.id);
              console.log('Delete result:', result);
              if (result.success) {
                Alert.alert('Berhasil', 'Dosen berhasil dihapus', [
                  {
                    text: 'OK',
                    onPress: async () => {
                      console.log('Calling loadData() after delete success dialog close');
                      await loadData();
                      console.log('loadData() completed');
                    },
                  },
                ]);
              } else {
                Alert.alert('Error', result.message);
              }
            } catch (error) {
              console.error('Delete error:', error);
              Alert.alert('Error', 'Gagal menghapus dosen: ' + error.message);
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

  const getMataKuliahName = (mk) => {
    if (typeof mk === 'string') return mk;
    if (mk && typeof mk === 'object') return mk.nama || mk.kode || '-';
    return '-';
  };

  const renderDosenCard = ({ item }) => {
    const primaryColor = colors?.primary || staticColors.primary;
    const dangerColor = colors?.danger || staticColors.danger;
    const successColor = colors?.success || staticColors.success;
    const disabledColor = colors?.textDisabled || staticColors.textDisabled;
    const secondaryColor = colors?.textSecondary || staticColors.textSecondary;
    
    const statusColor = item.status === 'aktif' ? successColor : disabledColor;

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
            <MaterialCommunityIcons name="email" size={16} color={secondaryColor} />
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
                    <Text style={styles.mataKuliahChipText}>{getMataKuliahName(mk)}</Text>
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
            activeOpacity={0.7}
            style={[styles.actionButton, { backgroundColor: primaryColor + '20' }]}
            onPress={() => {
              console.log('EDIT button pressed for item:', item);
              handleEdit(item);
            }}
          >
            <MaterialCommunityIcons name="pencil" size={18} color={primaryColor} />
            <Text style={[styles.actionButtonText, { color: primaryColor }]}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            style={[styles.actionButton, { backgroundColor: dangerColor + '20' }]}
            onPress={() => {
              console.log('DELETE button pressed for item:', item);
              handleDelete(item);
            }}
          >
            <MaterialCommunityIcons name="delete" size={18} color={dangerColor} />
            <Text style={[styles.actionButtonText, { color: dangerColor }]}>Hapus</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    const primaryColor = colors?.primary || staticColors.primary;
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text style={styles.loadingText}>Memuat data dosen...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Defensive color fallbacks
  const primaryColor = colors?.primary || staticColors.primary;
  const successColor = colors?.success || staticColors.success;
  const disabledColor = colors?.textDisabled || staticColors.textDisabled;
  const secondaryColor = colors?.textSecondary || staticColors.textSecondary;
  const textPrimary = colors?.textPrimary || staticColors.textPrimary;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color={textPrimary} />
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
          <Text style={[styles.statValue, { color: successColor }]}>{stats.aktif}</Text>
          <Text style={styles.statLabel}>Aktif</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: disabledColor }]}>
            {stats.tidak_aktif}
          </Text>
          <Text style={styles.statLabel}>Tidak Aktif</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color={secondaryColor} />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari nama, NIP, atau email..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons name="close-circle" size={20} color={secondaryColor} />
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
              color={disabledColor}
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
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[primaryColor]} />
        }
      />

      {/* FAB */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.7}
        onPress={() => {
          console.log('CREATE/Tambah button pressed');
          handleCreate();
        }}
      >
        <MaterialCommunityIcons name="plus" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: staticColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.base,
    fontSize: typography.fontSize.base,
    color: staticColors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    backgroundColor: staticColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: staticColors.border,
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
    color: staticColors.textSecondary,
    letterSpacing: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: staticColors.textPrimary,
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: spacing.base,
    gap: spacing.sm,
    backgroundColor: staticColors.surface,
    borderBottomWidth: 1,
    borderBottomColor: staticColors.border,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: spacing.sm,
    borderRadius: radius.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: staticColors.border,
  },
  statValue: {
    fontSize: 24,
    fontFamily: typography.fontFamily.bold,
    color: staticColors.primary,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: staticColors.textSecondary,
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
    borderColor: staticColors.border,
  },
  searchInput: {
    flex: 1,
    marginLeft: spacing.sm,
    fontSize: typography.fontSize.base,
    color: staticColors.textPrimary,
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
    borderColor: staticColors.border,
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
    backgroundColor: staticColors.primary,
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
    color: staticColors.textPrimary,
  },
  cardNIP: {
    fontSize: typography.fontSize.sm,
    color: staticColors.textSecondary,
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
    color: staticColors.textPrimary,
    marginLeft: 6,
  },
  mataKuliahContainer: {
    marginTop: spacing.xs,
  },
  mataKuliahLabel: {
    fontSize: typography.fontSize.sm,
    color: staticColors.textSecondary,
    marginBottom: 4,
  },
  mataKuliahScroll: {
    flexDirection: 'row',
  },
  mataKuliahChip: {
    backgroundColor: staticColors.primary + '10',
    paddingVertical: 4,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    marginRight: spacing.xs,
  },
  mataKuliahChipMore: {
    backgroundColor: staticColors.textDisabled + '20',
  },
  mataKuliahChipText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: staticColors.primary,
  },
  bioContainer: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    backgroundColor: staticColors.background,
    borderRadius: radius.sm,
  },
  bioText: {
    fontSize: typography.fontSize.sm,
    color: staticColors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: staticColors.border,
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
    color: staticColors.textSecondary,
    marginTop: spacing.base,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.sm,
    color: staticColors.textDisabled,
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
    backgroundColor: staticColors.primary,
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
