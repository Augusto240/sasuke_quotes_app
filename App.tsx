import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';

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
    background: '#101010',
    card: '#181818',
    text: '#FFFFFF',
    border: '#27272a',
  },
};

function SharinganStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Camera" component={SharinganScreen} />
      <Stack.Screen name="Editor" component={ImageEditorScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Uchiha': require('./assets/fonts/uchiha.ttf'),
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, justifyContent: 'center', backgroundColor: AppTheme.colors.background }}><ActivityIndicator size="large" color={AppTheme.colors.primary} /></View>;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer theme={AppTheme}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ focused, color, size }) => {
              let iconName: keyof typeof Ionicons.glyphMap = 'alert-circle';
              if (route.name === 'Início') iconName = focused ? 'home' : 'home-outline';
              else if (route.name === 'Explorar') iconName = focused ? 'list' : 'list-outline';
              else if (route.name === 'Favoritos') iconName = focused ? 'heart' : 'heart-outline';
              else if (route.name === 'Sharingan') iconName = focused ? 'camera' : 'camera-outline';
              else if (route.name === 'Ajustes') iconName = focused ? 'settings' : 'settings-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            headerShown: false,
            tabBarActiveTintColor: AppTheme.colors.primary,
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: { 
              backgroundColor: AppTheme.colors.card,
              borderTopColor: AppTheme.colors.border,
            },
          })}
        >
          <Tab.Screen name="Início" component={HomeScreen} />
          <Tab.Screen name="Explorar" component={QuotesScreen} />
          <Tab.Screen name="Favoritos" component={FavoritesScreen} />
          <Tab.Screen name="Sharingan" component={SharinganStack} />
          <Tab.Screen name="Ajustes" component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      <Toast />
    </GestureHandlerRootView>
  );
}