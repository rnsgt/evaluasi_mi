import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

const { width } = Dimensions.get('window');

const KelolaScreen = ({ navigation }) => {
  const { colors } = useTheme();

  const renderMenuCard = (title, icon, color, onPress, description) => (
    <TouchableOpacity 
      style={[styles.menuCard, { borderLeftColor: color }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.iconBox, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      </View>
      <View style={styles.menuInfo}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuDesc}>{description}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>MANAJEMEN DATA</Text>
        <Text style={styles.headerTitle}>Pusat Kendali</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AKADEMIK & EVALUASI</Text>
          {renderMenuCard(
            'Periode Evaluasi',
            'calendar-clock',
            '#2563EB',
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
            '#EA580C',
            () => navigation.navigate('Fasilitas'),
            'Manajemen sarana dan prasarana kampus'
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>PERTANYAAN & INSTRUMEN</Text>
          {renderMenuCard(
            'Kuesioner Dosen',
            'comment-question-outline',
            '#10B981',
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

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  header: { padding: 24, backgroundColor: '#FFF' },
  headerSubtitle: { fontSize: 12, color: '#2563EB', fontWeight: 'bold', letterSpacing: 1.5 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#0F172A', marginTop: 4 },
  scrollContent: { padding: 20 },
  section: { marginBottom: 32 },
  sectionLabel: { fontSize: 12, fontWeight: 'bold', color: '#94A3B8', marginLeft: 12, marginBottom: 16, letterSpacing: 1 },
  menuCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 16, borderLeftWidth: 6, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 10 },
  iconBox: { width: 56, height: 56, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  menuInfo: { flex: 1, marginLeft: 16 },
  menuTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E293B' },
  menuDesc: { fontSize: 12, color: '#64748B', marginTop: 4, lineHeight: 18 },
});

export default KelolaScreen;
