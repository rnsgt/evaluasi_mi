import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { colors, typography, spacing, borderRadius as radius } from '../../utils/theme';
import fasilitasService from '../../services/fasilitasService';

const PilihFasilitasScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [fasilitas, setFasilitas] = useState([]);
  const [filteredFasilitas, setFilteredFasilitas] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const kategoriList = fasilitasService.getAllKategori();

  useEffect(() => {
    loadFasilitas();
  }, []);

  useEffect(() => {
    filterFasilitas();
  }, [fasilitas, searchQuery, selectedKategori]);

  const loadFasilitas = async () => {
    try {
      setLoading(true);
      const data = await fasilitasService.getAllFasilitas();
      setFasilitas(data);
    } catch (error) {
      console.error('Error loading fasilitas:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadFasilitas();
    setRefreshing(false);
  };

  const filterFasilitas = () => {
    let filtered = [...fasilitas];

    // Filter by kategori
    if (selectedKategori !== 'Semua') {
      filtered = filtered.filter((f) => f.kategori === selectedKategori);
    }

    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (f) =>
          f.nama.toLowerCase().includes(query) ||
          f.kode.toLowerCase().includes(query) ||
          f.lokasi.toLowerCase().includes(query)
      );
    }

    setFilteredFasilitas(filtered);
  };

  const handleSelectFasilitas = (fasilitas) => {
    navigation.navigate('FormEvaluasiFasilitas', {
      fasilitasId: fasilitas.id,
      namaFasilitas: fasilitas.nama,
      kodeFasilitas: fasilitas.kode,
      kategoriFasilitas: fasilitas.kategori,
      lokasi: fasilitas.lokasi,
    });
  };

  const renderKategoriChip = ({ item }) => {
    const isSelected = item === selectedKategori;
    return (
      <TouchableOpacity
        style={[styles.kategoriChip, isSelected && styles.kategoriChipActive]}
        onPress={() => setSelectedKategori(item)}
      >
        <Text
          style={[styles.kategoriChipText, isSelected && styles.kategoriChipTextActive]}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderFasilitasCard = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.fasilitasCard}
        onPress={() => handleSelectFasilitas(item)}
        activeOpacity={0.7}
      >
        <View style={styles.fasilitasIconContainer}>
          <MaterialCommunityIcons
            name={item.icon || 'office-building'}
            size={32}
            color={colors.primary}
          />
        </View>
        <View style={styles.fasilitasInfo}>
          <Text style={styles.fasilitasNama} numberOfLines={1}>
            {item.nama}
          </Text>
          <Text style={styles.fasilitasKode}>{item.kode}</Text>
          <View style={styles.fasilitasDetails}>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons
                name="map-marker"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.detailText} numberOfLines={1}>
                {item.lokasi}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons
                name="account-group"
                size={14}
                color={colors.textSecondary}
              />
              <Text style={styles.detailText}>Kapasitas: {item.kapasitas}</Text>
            </View>
          </View>
          <View style={styles.kategoriTag}>
            <Text style={styles.kategoriTagText}>{item.kategori}</Text>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name="office-building-outline"
        size={64}
        color={colors.textDisabled}
      />
      <Text style={styles.emptyStateText}>Tidak ada fasilitas ditemukan</Text>
      <Text style={styles.emptyStateSubtext}>
        Coba ubah filter atau kata kunci pencarian
      </Text>
    </View>
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>Memuat data fasilitas...</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pilih Fasilitas</Text>
        <View style={styles.backButton} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialCommunityIcons
          name="magnify"
          size={20}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Cari fasilitas, kode, atau lokasi..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor={colors.textSecondary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialCommunityIcons
              name="close-circle"
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Kategori Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Kategori:</Text>
        <FlatList
          horizontal
          data={kategoriList}
          renderItem={renderKategoriChip}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.kategoriList}
        />
      </View>

      {/* Fasilitas List */}
      {loading ? (
        renderLoadingSkeleton()
      ) : (
        <FlatList
          data={filteredFasilitas}
          renderItem={renderFasilitasCard}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Results Count */}
      {!loading && (
        <View style={styles.resultsCount}>
          <Text style={styles.resultsCountText}>
            Menampilkan {filteredFasilitas.length} dari {fasilitas.length} fasilitas
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 2,
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
    color: colors.textPrimary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    margin: spacing.base,
    paddingHorizontal: spacing.base,
    borderRadius: radius.base,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 1,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.md,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  filterSection: {
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  kategoriList: {
    paddingHorizontal: spacing.base,
  },
  kategoriChip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  kategoriChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  kategoriChipText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
  },
  kategoriChipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: spacing.base,
  },
  fasilitasCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.base,
    borderRadius: radius.base,
    marginBottom: spacing.base,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.border,
  },
  fasilitasIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  fasilitasInfo: {
    flex: 1,
  },
  fasilitasNama: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  fasilitasKode: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  fasilitasDetails: {
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  detailText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginLeft: 4,
    flex: 1,
  },
  kategoriTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  kategoriTagText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
  },
  emptyStateText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.textSecondary,
    marginTop: spacing.base,
  },
  emptyStateSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textDisabled,
    marginTop: spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing.base,
  },
  resultsCount: {
    backgroundColor: colors.background,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.base,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  resultsCountText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default PilihFasilitasScreen;
