import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

import HomeScreen from './src/screens/HomeScreen';
import QuotesScreen from './src/screens/QuotesScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import SharinganScreen from './src/screens/SharinganScreen';
import ImageEditorScreen from './src/screens/ImageEditorScreen';
import SettingsScreen from './src/screens/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const AppTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#e31b3a',
    background: '#191c26',
    card: '#131936',
    text: '#FFFFFF',
    border: '#252f69',
  },
};

function SharinganStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
      <Stack.Screen name="Camera" component={SharinganScreen} />
      <Stack.Screen name="Editor" component={ImageEditorScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <>
      <NavigationContainer theme={AppTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap = 'alert-circle';
              if (route.name === 'Início') iconName = focused ? 'home' : 'home-outline';
              if (route.name === 'Explorar') iconName = focused ? 'list' : 'list-outline';
              if (route.name === 'Favoritos') iconName = focused ? 'heart' : 'heart-outline';
              if (route.name === 'Sharingan') iconName = focused ? 'camera' : 'camera-outline';
              if (route.name === 'Configurações') iconName = focused ? 'settings' : 'settings-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            headerShown: false,
            tabBarActiveTintColor: AppTheme.colors.primary,
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: { backgroundColor: AppTheme.colors.card, borderTopColor: AppTheme.colors.border },
          })}
        >
          <Tab.Screen name="Início" component={HomeScreen} />
          <Tab.Screen name="Explorar" component={QuotesScreen} />
          <Tab.Screen name="Favoritos" component={FavoritesScreen} />
          <Tab.Screen name="Sharingan" component={SharinganStack} />
          <Tab.Screen name="Configurações" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
}