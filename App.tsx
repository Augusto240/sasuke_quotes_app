import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { NavigationContainer, DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationLightTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { AppProvider, useApp } from './src/contexts/AppContext';
import { darkTheme, lightTheme } from './src/theme';
import i18n from './src/i18n';

import HomeScreen from './src/screens/HomeScreen';
import QuotesScreen from './src/screens/QuotesScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import SharinganScreen from './src/screens/SharinganScreen';
import ImageEditorScreen from './src/screens/ImageEditorScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function SharinganStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Camera" component={SharinganScreen} />
      <Stack.Screen name="Editor" component={ImageEditorScreen} />
    </Stack.Navigator>
  );
}

function AppContent() {
  const { theme: themeMode, language, hasSeenOnboarding, markOnboardingComplete } = useApp();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    i18n.locale = language;
  }, [language]);

  const NavigationTheme = {
    ...(themeMode === 'dark' ? NavigationDarkTheme : NavigationLightTheme),
    colors: {
      ...(themeMode === 'dark' ? NavigationDarkTheme.colors : NavigationLightTheme.colors),
      ...theme.colors,
    },
  };

  if (!hasSeenOnboarding) {
    return <OnboardingScreen onComplete={markOnboardingComplete} />;
  }

  return (
    <>
      <StatusBar style={themeMode === 'dark' ? 'light' : 'dark'} />
      <NavigationContainer theme={NavigationTheme}>
        <Tab.Navigator
          screenOptions={({ route }: { route: any }) => ({
            tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
              let iconName: keyof typeof Ionicons.glyphMap = 'alert-circle';
              if (route.name === i18n.t('navigation.home')) iconName = focused ? 'home' : 'home-outline';
              else if (route.name === i18n.t('navigation.explore')) iconName = focused ? 'list' : 'list-outline';
              else if (route.name === i18n.t('navigation.favorites')) iconName = focused ? 'heart' : 'heart-outline';
              else if (route.name === i18n.t('navigation.camera')) iconName = focused ? 'camera' : 'camera-outline';
              else if (route.name === i18n.t('navigation.settings')) iconName = focused ? 'settings' : 'settings-outline';
              return <Ionicons name={iconName} size={size} color={color} />;
            },
            headerShown: false,
            tabBarActiveTintColor: theme.colors.primary,
            tabBarInactiveTintColor: theme.colors.textSecondary,
            tabBarStyle: { 
              backgroundColor: theme.colors.card,
              borderTopColor: theme.colors.border,
            },
          })}
        >
          <Tab.Screen name={i18n.t('navigation.home')} component={HomeScreen} />
          <Tab.Screen name={i18n.t('navigation.explore')} component={QuotesScreen} />
          <Tab.Screen name={i18n.t('navigation.favorites')} component={FavoritesScreen} />
          <Tab.Screen name={i18n.t('navigation.camera')} component={SharinganStack} />
          <Tab.Screen name={i18n.t('navigation.settings')} component={SettingsScreen} />
        </Tab.Navigator>
      </NavigationContainer>
      <Toast />
    </>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    'Uchiha': require('./assets/fonts/uchiha.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: '#101010' }}>
        <ActivityIndicator size="large" color="#e31b3a" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </GestureHandlerRootView>
  );
}