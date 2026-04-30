import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform } from 'react-native';

// Screens
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import LaporanScreen from '../screens/admin/LaporanScreen';
import PeriodeScreen from '../screens/admin/PeriodeScreen';
import FormPeriodeScreen from '../screens/admin/FormPeriodeScreen';
import SettingsScreen from '../screens/admin/SettingsScreen';
import ProfileAdminScreen from '../screens/admin/ProfileAdminScreen';
import KelolaScreen from '../screens/admin/KelolaScreen';
import FasilitasManagementScreen from '../screens/admin/FasilitasManagementScreen';
import FormFasilitasScreen from '../screens/admin/FormFasilitasScreen';
import DosenManagementScreen from '../screens/admin/DosenManagementScreen';
import FormDosenScreen from '../screens/admin/FormDosenScreen';
import KuesionerManagementScreen from '../screens/admin/KuesionerManagementScreen';
import ChangePasswordScreen from '../screens/student/ChangePasswordScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const AdminTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Beranda') iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
          else if (route.name === 'Kelola') iconName = focused ? 'layers' : 'layers-outline';
          else if (route.name === 'Laporan') iconName = focused ? 'file-chart' : 'file-chart-outline';
          else if (route.name === 'Profil') iconName = focused ? 'shield-account' : 'shield-account-outline';

          return (
            <MaterialCommunityIcons 
              name={iconName} 
              size={focused ? 28 : 24} 
              color={color} 
              style={focused ? { marginBottom: 2 } : {}}
            />
          );
        },
        tabBarActiveTintColor: '#0F172A',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: 'bold',
          marginBottom: Platform.OS === 'ios' ? 0 : 10,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingTop: 10,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
      })}
    >
      <Tab.Screen name="Beranda" component={AdminDashboardScreen} />
      <Tab.Screen name="Kelola" component={KelolaScreen} />
      <Tab.Screen name="Laporan" component={LaporanScreen} />
      <Tab.Screen name="Profil" component={ProfileAdminScreen} />
    </Tab.Navigator>
  );
};

const AdminNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
      <Stack.Screen name="Periode" component={PeriodeScreen} />
      <Stack.Screen name="FormPeriode" component={FormPeriodeScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Dosen" component={DosenManagementScreen} />
      <Stack.Screen name="FormDosen" component={FormDosenScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="Fasilitas" component={FasilitasManagementScreen} />
      <Stack.Screen name="FormFasilitas" component={FormFasilitasScreen} options={{ presentation: 'modal' }} />
      <Stack.Screen name="KuesionerManagement" component={KuesionerManagementScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
};

export default AdminNavigator;
