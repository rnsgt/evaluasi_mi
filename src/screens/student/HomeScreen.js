import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { formatDate } from '../../utils/helpers';
import { getActivePeriode } from '../../services/periodeService';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [periodeAktif, setPeriodeAktif] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const periode = await getActivePeriode();
      if (periode) {
        setPeriodeAktif({
          nama: periode.nama,
          batas_akhir: periode.batas_evaluasi,
        });
      }
    } catch (error) {
      console.error('Load data error:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderEvaluasiCard = (title, desc, icon, color, onPress) => (
    <TouchableOpacity 
      style={[styles.evaluasiCard, { backgroundColor: '#FFFFFF', borderLeftColor: color, borderLeftWidth: 6 }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.cardTopRow}>
        <View style={[styles.cardIconBox, { backgroundColor: color + '15' }]}>
          <MaterialCommunityIcons name={icon} size={28} color={color} />
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
      </View>
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{desc}</Text>
      </View>
      <TouchableOpacity style={[styles.cardButton, { backgroundColor: color }]} onPress={onPress}>
        <Text style={styles.cardButtonText}>Mulai Evaluasi</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#FFC107']} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <ImageBackground 
          source={require('../../../assets/gedungdipkom.png')}
          style={styles.headerCard}
          imageStyle={styles.headerCardImage}
        >
          <View style={styles.headerOverlay}>
            <View style={styles.headerContent}>
              <View>
                <Text style={styles.greeting}>Fakultas Ilmu Komputer UNSRI</Text>
                <Text style={styles.greeting}>Manajemen Informatika</Text>
                <Text style={styles.userName}>{user?.nama || 'Mahasiswa'}</Text>
              </View>
              <View style={styles.profileCircle}>
                <Image source={require('../../../assets/logomi.png')} style={styles.logoImage} />
              </View>
            </View>
          </View>
        </ImageBackground>

        {/* Periode Info Box */}
        {periodeAktif && (
          <View style={styles.periodeCard}>
            <View style={styles.periodeIcon}>
              <MaterialCommunityIcons name="calendar-range" size={24} color="#2563EB" />
            </View>
            <View style={styles.periodeContent}>
              <Text style={styles.periodeTitle}>{periodeAktif.nama}</Text>
              <Text style={styles.periodeDeadline}>
                Batas Akhir: {formatDate(periodeAktif.batas_akhir, 'DD MMMM YYYY')}
              </Text>
            </View>
            <View style={styles.activeBadge}>
              <Text style={styles.activeBadgeText}>AKTIF</Text>
            </View>
          </View>
        )}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Evaluasi Semester</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Statistik')}>
            <Text style={styles.sectionLink}>Lihat Statistik</Text>
          </TouchableOpacity>
        </View>

        {/* Evaluasi Cards Grid */}
        <View style={styles.cardsGrid}>
          {renderEvaluasiCard(
            'Evaluasi Dosen',
            'Berikan penilaian kualitas pengajaran dosen pengampu.',
            'account-tie-voice-outline',
            colors.primary, // Navy Blue
            () => navigation.navigate('PilihDosen')
          )}
          
          {renderEvaluasiCard(
            'Evaluasi Fasilitas',
            'Sampaikan aspirasi mengenai sarana dan layanan kampus.',
            'office-building-cog-outline',
            colors.tertiary, // MI Red
            () => navigation.navigate('PilihFasilitas')
          )}
        </View>

        {/* Quick Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="shield-check-outline" size={20} color="#10B981" />
            <Text style={styles.infoText}>Anonimitas Anda terjamin sepenuhnya.</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color="#F59E0B" />
            <Text style={styles.infoText}>Masukan Anda sangat berarti bagi prodi.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  scrollContent: { padding: 24, paddingTop: 16 },
  headerCard: { width: '100%', minHeight: 140, marginBottom: 32, borderRadius: 28, overflow: 'hidden', elevation: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10 },
  headerCardImage: { resizeMode: 'cover' },
  headerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15, 60, 89, 0.8)', padding: 24, justifyContent: 'center' },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 13, color: '#E2E8F0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  userName: { fontSize: 26, fontWeight: 'bold', color: '#FFFFFF', marginTop: 4 },
  profileCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', elevation: 4 },
  logoImage: { width: 40, height: 40, resizeMode: 'contain' },
  periodeCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, alignItems: 'center', marginBottom: 32, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  periodeIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFF8E1', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  periodeContent: { flex: 1 },
  periodeTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  periodeDeadline: { fontSize: 12, color: '#64748B', marginTop: 2 },
  activeBadge: { backgroundColor: '#DCFCE7', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  activeBadgeText: { fontSize: 10, color: '#166534', fontWeight: 'bold' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F3C59' },
  sectionLink: { fontSize: 14, color: '#B91C1C', fontWeight: '600' },
  cardsGrid: { gap: 20 },
  evaluasiCard: { borderRadius: 28, padding: 24, elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  cardIconBox: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  cardTextContainer: { marginBottom: 24 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A' },
  cardDescription: { fontSize: 13, color: '#64748B', marginTop: 6, lineHeight: 20 },
  cardButton: { height: 48, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  cardButtonText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 14 },
  infoSection: { marginTop: 40, gap: 12 },
  infoItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8FAFC', padding: 12, borderRadius: 16 },
  infoText: { fontSize: 12, color: '#64748B', marginLeft: 12 },
});

export default HomeScreen;
