import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { colors, typography } from '../utils/theme';

// Screens
import HomeScreen from '../screens/student/HomeScreen';
import RiwayatScreen from '../screens/student/RiwayatScreen';
import StatistikScreen from '../screens/student/StatistikScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import PilihDosenScreen from '../screens/student/PilihDosenScreen';
import FormEvaluasiDosenScreen from '../screens/student/FormEvaluasiDosenScreen';
import PilihFasilitasScreen from '../screens/student/PilihFasilitasScreen';
import FormEvaluasiFasilitasScreen from '../screens/student/FormEvaluasiFasilitasScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Home Stack Navigator untuk nested screens
const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="PilihDosen" component={PilihDosenScreen} />
      <Stack.Screen name="FormEvaluasiDosen" component={FormEvaluasiDosenScreen} />
      <Stack.Screen name="PilihFasilitas" component={PilihFasilitasScreen} />
      <Stack.Screen name="FormEvaluasiFasilitas" component={FormEvaluasiFasilitasScreen} />
    </Stack.Navigator>
  );
};

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
      <Tab.Screen name="Beranda" component={HomeStack} />
      <Tab.Screen name="Riwayat" component={RiwayatScreen} />
      <Tab.Screen name="Statistik" component={StatistikScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default StudentNavigator;
