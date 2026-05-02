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
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Path, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
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

  const DecorativeBackground = () => (
    <View style={StyleSheet.absoluteFill}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Defs>
          <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} stopOpacity="0.08" />
            <Stop offset="100%" stopColor={colors.secondary} stopOpacity="0.05" />
          </LinearGradient>
        </Defs>
        <Rect width="100%" height="100%" fill="url(#grad1)" />
        <Circle cx={width * 0.9} cy="100" r="150" fill={colors.primary + '08'} />
        <Circle cx={width * 0.1} cy="400" r="100" fill={colors.secondary + '10'} />
        <Path
          d="M0 600 Q 100 550 200 600 T 400 600"
          fill="none"
          stroke={colors.tertiary + '08'}
          strokeWidth="40"
        />
      </Svg>
    </View>
  );

  const renderEvaluasiCard = (title, desc, icon, color, onPress) => (
    <TouchableOpacity
      style={[styles.fullCard, { backgroundColor: colors.surface }, colors.shadowMedium]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      <View style={[styles.cardHeader, { borderLeftColor: color, borderLeftWidth: 6 }]}>
        <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
          <MaterialCommunityIcons name={icon} size={32} color={color} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.cardDesc, { color: colors.textSecondary }]}>{desc}</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textDisabled} />
      </View>
      <View style={[styles.cardAction, { backgroundColor: color }]}>
        <Text style={styles.actionText}>Mulai Penilaian</Text>
        <MaterialCommunityIcons name="arrow-right" size={18} color="#FFF" />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBarStyle} />
      <DecorativeBackground />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={[styles.headerWrapper, colors.shadowMedium]}>
          <ImageBackground
            source={require('../../../assets/gedungdipkom.png')}
            style={styles.headerCard}
            imageStyle={styles.headerCardImage}
          >
            <View style={[styles.headerOverlay, { backgroundColor: colors.glassDark }]}>
              <View style={styles.headerContent}>
                <View style={styles.headerTextCol}>
                  <Text style={styles.greeting}>PRODI MI UNSRI</Text>
                  <Text style={styles.userName} numberOfLines={1}>{user?.nama || 'Mahasiswa'}</Text>
                  <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>Sesi Aktif</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.profileCircle, colors.shadowSoft]}
                  onPress={() => navigation.navigate('Profil')}
                >
                  <Image source={require('../../../assets/logomi.png')} style={styles.logoImage} />
                </TouchableOpacity>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* Periode Banner */}
        {periodeAktif && (
          <View style={[styles.periodeBanner, { backgroundColor: colors.primaryDark }, colors.shadowMedium]}>
            <View style={styles.periodeIconCircle}>
              <MaterialCommunityIcons name="calendar-clock" size={22} color="#FFF" />
            </View>
            <View style={styles.periodeTextWrapper}>
              <Text style={styles.periodeLabel}>Periode Aktif</Text>
              <Text style={styles.periodeValue}>{periodeAktif.nama}</Text>
            </View>
            <View style={styles.deadlineBadge}>
              <Text style={styles.deadlineText}>Hingga {formatDate(periodeAktif.batas_akhir, 'DD MMM')}</Text>
            </View>
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Evaluasi Semester</Text>

        {/* Uniform Cards */}
        <View style={styles.cardsContainer}>
          {renderEvaluasiCard(
            'Evaluasi Dosen',
            'Berikan penilaian kualitas pengajaran dosen pengampu semester ini.',
            'account-tie-voice',
            colors.primary,
            () => navigation.navigate('PilihDosen')
          )}

          {renderEvaluasiCard(
            'Evaluasi Fasilitas',
            'Sampaikan aspirasi mengenai sarana dan layanan kampus.',
            'office-building-cog',
            colors.tertiary,
            () => navigation.navigate('PilihFasilitas')
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 20 },
  headerWrapper: { marginBottom: 24, borderRadius: 32, overflow: 'hidden' },
  headerCard: { width: '100%', minHeight: 160 },
  headerCardImage: { resizeMode: 'cover' },
  headerOverlay: { flex: 1, padding: 24, justifyContent: 'center' },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTextCol: { flex: 1, marginRight: 16 },
  greeting: { fontSize: 12, color: '#E2E8F0', fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  userName: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', letterSpacing: -0.5 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 12 },
  statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80', marginRight: 6 },
  statusText: { fontSize: 10, color: '#FFFFFF', fontWeight: 'bold', textTransform: 'uppercase' },
  profileCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center' },
  logoImage: { width: 40, height: 40, resizeMode: 'contain' },

  sectionTitle: { fontSize: 18, fontWeight: '900', marginBottom: 16, marginLeft: 4 },
  cardsContainer: { gap: 20, marginBottom: 24 },
  fullCard: { borderRadius: 32, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, gap: 16 },
  iconBox: { width: 60, height: 60, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  cardDesc: { fontSize: 12, marginTop: 4, lineHeight: 18 },
  cardAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 12, gap: 8 },
  actionText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  periodeBanner: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 24, marginBottom: 32 },
  periodeIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  periodeTextWrapper: { flex: 1 },
  periodeLabel: { fontSize: 10, color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  periodeValue: { fontSize: 15, color: '#FFFFFF', fontWeight: 'bold', marginTop: 1 },
  deadlineBadge: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  deadlineText: { color: '#FFFFFF', fontSize: 11, fontWeight: '600' },

  footerInfo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 8 },
  footerText: { flex: 1, fontSize: 12, fontWeight: '600' },
});

export default HomeScreen;
