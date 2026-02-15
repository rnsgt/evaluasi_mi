import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography } from '../utils/theme';

// Screens - We'll create these next
import HomeScreen from '../screens/student/HomeScreen';
import RiwayatScreen from '../screens/student/RiwayatScreen';
import StatistikScreen from '../screens/student/StatistikScreen';
import ProfileScreen from '../screens/student/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const StudentNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Beranda') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Riwayat') {
            iconName = focused ? 'history' : 'history';
          } else if (route.name === 'Statistik') {
            iconName = focused ? 'chart-bar' : 'chart-bar';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'account' : 'account-outline';
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
      <Tab.Screen name="Beranda" component={HomeScreen} />
      <Tab.Screen name="Riwayat" component={RiwayatScreen} />
      <Tab.Screen name="Statistik" component={StatistikScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default StudentNavigator;
