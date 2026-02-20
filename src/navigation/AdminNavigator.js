import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography } from '../utils/theme';

// Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import LaporanScreen from '../screens/admin/LaporanScreen';
import PeriodeScreen from '../screens/admin/PeriodeScreen';
import FormPeriodeScreen from '../screens/admin/FormPeriodeScreen';
import SettingsScreen from '../screens/admin/SettingsScreen';
import KelolaScreen from '../screens/admin/KelolaScreen';
import FasilitasManagementScreen from '../screens/admin/FasilitasManagementScreen';
import FormFasilitasScreen from '../screens/admin/FormFasilitasScreen';
import DosenManagementScreen from '../screens/admin/DosenManagementScreen';
import FormDosenScreen from '../screens/admin/FormDosenScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Beranda') {
            iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          } else if (route.name === 'Laporan') {
            iconName = focused ? 'chart-box' : 'chart-box-outline';
          } else if (route.name === 'Periode') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Pengaturan') {
            iconName = focused ? 'cog' : 'cog-outline';
          }

          return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: typography.fontSize.xs,
          fontFamily: typography.fontFamily.medium,
        },
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
      })}
    >
      <Tab.Screen name="Beranda" component={AdminDashboardScreen} />
      <Tab.Screen name="Laporan" component={LaporanScreen} />
      <Tab.Screen name="Periode" component={PeriodeScreen} />
      <Tab.Screen name="Pengaturan" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const AdminNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
      
      {/* Periode Management */}
      <Stack.Screen 
        name="FormPeriode" 
        component={FormPeriodeScreen}
        options={{
          presentation: 'modal',
        }}
      />

      {/* Master Data Management */}
      <Stack.Screen name="KelolaHub" component={KelolaScreen} />
      
      {/* Fasilitas Management */}
      <Stack.Screen name="FasilitasManagement" component={FasilitasManagementScreen} />
      <Stack.Screen 
        name="FormFasilitas" 
        component={FormFasilitasScreen}
        options={{
          presentation: 'modal',
        }}
      />

      {/* Dosen Management */}
      <Stack.Screen name="DosenManagement" component={DosenManagementScreen} />
      <Stack.Screen 
        name="FormDosen" 
        component={FormDosenScreen}
        options={{
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
