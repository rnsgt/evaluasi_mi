import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { Platform } from 'react-native';

// Screens
import HomeScreen from '../screens/student/HomeScreen';
import RiwayatScreen from '../screens/student/RiwayatScreen';
import StatistikScreen from '../screens/student/StatistikScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import ChangePasswordScreen from '../screens/student/ChangePasswordScreen';
import PilihDosenScreen from '../screens/student/PilihDosenScreen';
import FormEvaluasiDosenScreen from '../screens/student/FormEvaluasiDosenScreen';
import PilihFasilitasScreen from '../screens/student/PilihFasilitasScreen';
import FormEvaluasiFasilitasScreen from '../screens/student/FormEvaluasiFasilitasScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="PilihDosen" component={PilihDosenScreen} />
      <Stack.Screen name="FormEvaluasiDosen" component={FormEvaluasiDosenScreen} />
      <Stack.Screen name="PilihFasilitas" component={PilihFasilitasScreen} />
      <Stack.Screen name="FormEvaluasiFasilitas" component={FormEvaluasiFasilitasScreen} />
    </Stack.Navigator>
  );
};

const ProfileStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
    </Stack.Navigator>
  );
};

const StudentNavigator = () => {
  const { colors } = useTheme();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Beranda') iconName = focused ? 'home-variant' : 'home-variant-outline';
          else if (route.name === 'Riwayat') iconName = focused ? 'clipboard-text-clock' : 'clipboard-text-clock-outline';
          else if (route.name === 'Statistik') iconName = focused ? 'chart-box' : 'chart-box-outline';
          else if (route.name === 'Profil') iconName = focused ? 'account-circle' : 'account-circle-outline';

          return (
            <MaterialCommunityIcons 
              name={iconName} 
              size={focused ? 28 : 24} 
              color={color} 
              style={focused ? { marginBottom: 2 } : {}}
            />
          );
        },
        tabBarActiveTintColor: '#2563EB',
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
      <Tab.Screen name="Beranda" component={HomeStack} />
      <Tab.Screen name="Riwayat" component={RiwayatScreen} />
      <Tab.Screen name="Statistik" component={StatistikScreen} />
      <Tab.Screen name="Profil" component={ProfileStack} />
    </Tab.Navigator>
  );
};

export default StudentNavigator;
