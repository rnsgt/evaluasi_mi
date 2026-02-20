import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography, spacing, borderRadius as radius } from '../../utils/theme';
import dosenService from '../../services/dosenService';

const PilihDosenScreen = ({ navigation }) => {
  const [dosen, setDosen] = useState([]);
  const [filteredDosen, setFilteredDosen] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMataKuliah, setSelectedMataKuliah] = useState('Semua');
  const [mataKuliahList, setMataKuliahList] = useState(['Semua']);

  useEffect(() => {
    loadDosen();
  }, []);

  useEffect(() => {
    filterDosen();
  }, [searchQuery, selectedMataKuliah, dosen]);

  const loadDosen = async () => {
    try {
      setLoading(true);
      const data = await dosenService.getAllDosen();
      setDosen(data);
      setFilteredDosen(data);
      
      // Get unique mata kuliah for filter
      const allMataKuliah = dosenService.getAllMataKuliah();
      setMataKuliahList(['Semua', ...allMataKuliah]);
    } catch (error) {
      console.error('Load dosen error:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDosen();
    setRefreshing(false);
  };

  const filterDosen = () => {
    let filtered = [...dosen];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(d =>
        d.nama.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by mata kuliah
    if (selectedMataKuliah !== 'Semua') {
      filtered = filtered.filter(d =>
        d.mata_kuliah.includes(selectedMataKuliah)
      );
    }

    setFilteredDosen(filtered);
  };

  const handleDosenPress = (dosenItem) => {
    navigation.navigate('FormEvaluasiDosen', {
      dosenId: dosenItem.id,
      namaDosen: dosenItem.nama,
      mataKuliah: dosenItem.mata_kuliah,
      nip: dosenItem.nip,
    });
  };

  const renderDosenCard = ({ item }) => {
    // Get initials for avatar
    const getInitials = (name) => {
      const words = name.split(' ').filter(w => w.length > 2); // Skip titles like Dr.
      return words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
    };

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleDosenPress(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardContent}>
          {/* Avatar */}
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.nama)}</Text>
          </View>

          {/* Info */}
          <View style={styles.cardInfo}>
            <Text style={styles.dosenName} numberOfLines={2}>
              {item.nama}
            </Text>
            <Text style={styles.nip}>NIP: {item.nip}</Text>
            <View style={styles.mataKuliahContainer}>
              {item.mata_kuliah.map((mk, index) => (
                <View key={index} style={styles.mataKuliahBadge}>
                  <Text style={styles.mataKuliahText} numberOfLines={1}>
                    {mk}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Arrow Icon */}
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={colors.textSecondary}
          />
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterChip = ({ item }) => {
    const isSelected = item === selectedMataKuliah;
    return (
      <TouchableOpacity
        style={[styles.filterChip, isSelected && styles.filterChipSelected]}
        onPress={() => setSelectedMataKuliah(item)}
        activeOpacity={0.7}
      >
        <Text
          style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}
          numberOfLines={1}
        >
          {item}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons
        name="account-search"
        size={80}
        color={colors.textDisabled}
      />
      <Text style={styles.emptyTitle}>Dosen Tidak Ditemukan</Text>
      <Text style={styles.emptySubtitle}>
        Coba ubah kata kunci pencarian atau filter
      </Text>
    </View>
  );

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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pilih Dosen</Text>
        <View style={styles.backButton} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <MaterialCommunityIcons
            name="magnify"
            size={20}
            color={colors.textSecondary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari nama dosen..."
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
      </View>

      {/* Filter Chips */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={mataKuliahList}
          renderItem={renderFilterChip}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
        />
      </View>

      {/* Result Count */}
      <View style={styles.resultContainer}>
        <Text style={styles.resultText}>
          Ditemukan {filteredDosen.length} dosen
        </Text>
      </View>

      {/* Dosen List */}
      <FlatList
        data={filteredDosen}
        renderItem={renderDosenCard}
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
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  searchContainer: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.base,
    paddingHorizontal: spacing.base,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.textPrimary,
  },
  filterContainer: {
    backgroundColor: colors.background,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  filterList: {
    paddingHorizontal: spacing.base,
  },
  filterChip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipText: {
    fontSize: typography.fontSize.sm,
    color: colors.textPrimary,
    fontFamily: typography.fontFamily.medium,
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.bold,
  },
  resultContainer: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  resultText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  listContent: {
    padding: spacing.base,
  },
  card: {
    backgroundColor: colors.background,
    borderRadius: radius.md,
    marginBottom: spacing.base,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.base,
  },
  avatarText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: '#FFFFFF',
  },
  cardInfo: {
    flex: 1,
  },
  dosenName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  nip: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  mataKuliahContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mataKuliahBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  mataKuliahText: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginTop: spacing.base,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default PilihDosenScreen;
