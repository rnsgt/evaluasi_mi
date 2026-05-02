import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Svg, { Circle, Rect } from 'react-native-svg';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const KelolaScreen = ({ navigation }) => {
  const { colors } = useTheme();

  const DecorativeBackground = () => (
    <View style={StyleSheet.absoluteFill}>
      <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
        <Circle cx={width} cy="200" r="100" fill={colors.primary + '08'} />
        <Circle cx="0" cy="500" r="120" fill={colors.secondary + '08'} />
        <Rect x={width * 0.8} y="700" width="80" height="80" rx="20" transform="rotate(15)" fill={colors.tertiary + '05'} />
      </Svg>
    </View>
  );

  const renderMenuCard = (title, icon, color, onPress, description) => (
    <TouchableOpacity 
      style={[styles.menuCard, { backgroundColor: colors.surface }, colors.shadowSoft]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconBox, { backgroundColor: color + '12' }]}>
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      </View>
      <View style={styles.menuInfo}>
        <Text style={[styles.menuTitle, { color: colors.textPrimary }]}>{title}</Text>
        <Text style={[styles.menuDesc, { color: colors.textSecondary }]}>{description}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color={colors.textDisabled} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colors.statusBarStyle} />
      <DecorativeBackground />
      
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
          <Circle cx="0" cy="0" r="100" fill="rgba(255,255,255,0.1)" />
          <Circle cx={width} cy="80" r="60" fill="rgba(255,255,255,0.05)" />
        </Svg>
        <Text style={styles.headerSubtitle}>ADMINISTRATION</Text>
        <Text style={styles.headerTitle}>Pusat Kendali Data</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: colors.primary }]} />
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>AKADEMIK & EVALUASI</Text>
          </View>
          
          <View style={[styles.sectionGroup, { backgroundColor: colors.primary + '05' }]}>
            {renderMenuCard(
              'Periode Evaluasi',
              'calendar-clock',
              colors.primary,
              () => navigation.navigate('Periode'),
              'Kelola tahun ajaran dan jadwal evaluasi'
            )}
            {renderMenuCard(
              'Kelola Dosen',
              'account-tie',
              '#8B5CF6',
              () => navigation.navigate('Dosen'),
              'Manajemen data dosen dan pengampu'
            )}
            {renderMenuCard(
              'Kelola Fasilitas',
              'office-building',
              colors.tertiary,
              () => navigation.navigate('Fasilitas'),
              'Manajemen sarana dan prasarana kampus'
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: colors.success }]} />
            <Text style={[styles.sectionLabel, { color: colors.textPrimary }]}>PERTANYAAN & INSTRUMEN</Text>
          </View>
          
          <View style={[styles.sectionGroup, { backgroundColor: colors.success + '05' }]}>
            {renderMenuCard(
              'Kuesioner Dosen',
              'comment-question-outline',
              colors.success,
              () => navigation.navigate('KuesionerManagement', { type: 'dosen' }),
              'Atur butir pertanyaan evaluasi dosen'
            )}
            {renderMenuCard(
              'Kuesioner Fasilitas',
              'comment-search-outline',
              '#06B6D4',
              () => navigation.navigate('KuesionerManagement', { type: 'fasilitas' }),
              'Atur butir pertanyaan evaluasi fasilitas'
            )}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 32, paddingBottom: 40, borderBottomLeftRadius: 40, borderBottomRightRadius: 40, overflow: 'hidden' },
  headerSubtitle: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '900', letterSpacing: 2 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginTop: 4 },
  scrollContent: { padding: 20, paddingTop: 30 },
  section: { marginBottom: 32 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16, marginLeft: 8 },
  sectionDot: { width: 8, height: 8, borderRadius: 4 },
  sectionLabel: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  sectionGroup: { padding: 16, borderRadius: 32, gap: 4 },
  menuCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 24, padding: 16, marginBottom: 12 },
  iconBox: { width: 52, height: 52, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  menuInfo: { flex: 1, marginLeft: 16 },
  menuTitle: { fontSize: 16, fontWeight: 'bold' },
  menuDesc: { fontSize: 11, marginTop: 2, lineHeight: 16 },
});

export default KelolaScreen;
