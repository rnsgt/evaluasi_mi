import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography } from '../utils/theme';

// Screens - We'll create these next
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import LaporanScreen from '../screens/admin/LaporanScreen';
import PeriodeScreen from '../screens/admin/PeriodeScreen';
import SettingsScreen from '../screens/admin/SettingsScreen';

const Tab = createBottomTabNavigator();

const AdminNavigator = () => {
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

export default AdminNavigator;
