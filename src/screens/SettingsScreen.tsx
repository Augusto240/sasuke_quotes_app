import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { getRandomQuote } from '../api/sasukeApi';
import { requestNotificationPermission, scheduleDailyQuoteNotification } from '../utils/notifications';
import { useApp } from '../contexts/AppContext';
import { darkTheme, lightTheme, Theme } from '../theme';
import i18n from '../i18n';
import ErrorBoundary from '../components/ErrorBoundary';

const languages = [
  { code: 'pt', name: 'Português' },
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
];

const themes = [
  { code: 'dark', name: 'Dark', icon: 'moon' },
  { code: 'light', name: 'Light', icon: 'sunny' },
];

export default function SettingsScreen() {
  const { theme: themeMode, language, toggleTheme, setLanguage } = useApp();
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => { 
    requestNotificationPermission(); 
  }, []);

  const toggleSwitch = async (value: boolean) => {
    setEnabled(value);
    if (value) {
      const hasPerm = await requestNotificationPermission();
      if (!hasPerm) return Alert.alert(i18n.t('common.error'), i18n.t('settings.permissionDenied'));
      const quote = await getRandomQuote();
      await scheduleDailyQuoteNotification(time, quote);
      Alert.alert(
        i18n.t('common.success'), 
        i18n.t('settings.notificationSuccess', { time: time.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' }) })
      );
    } else {
      const Notifications = require('expo-notifications');
      await Notifications.cancelAllScheduledNotificationsAsync();
      Alert.alert(i18n.t('settings.notificationDisabled'));
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
      if (enabled) {
        getRandomQuote().then(quote =>
          scheduleDailyQuoteNotification(selectedTime, quote)
        );
      }
    }
  };

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as 'pt' | 'en' | 'ja');
  };

  const styles = createStyles(theme);

  return (
    <ErrorBoundary>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>{i18n.t('settings.title')}</Text>
        
        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.row}>
            <View style={styles.labelContainer}>
              <Ionicons name="notifications-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.label}>{i18n.t('settings.notifications')}</Text>
            </View>
            <Switch 
              value={enabled} 
              onValueChange={toggleSwitch} 
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }} 
              thumbColor="#fff" 
            />
          </View>
          {enabled && (
            <View style={styles.row}>
              <View style={styles.labelContainer}>
                <Ionicons name="time-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.label}>{i18n.t('settings.time')}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowPicker(true)}>
                <Text style={styles.timeText}>
                  {time.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </TouchableOpacity>
            </View>
          )}
          <Text style={styles.info}>{i18n.t('settings.info')}</Text>
        </View>

        {/* Theme Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="color-palette-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>{i18n.t('settings.theme')}</Text>
          </View>
          <View style={styles.optionsContainer}>
            {themes.map((themeOption) => (
              <TouchableOpacity
                key={themeOption.code}
                style={[
                  styles.option,
                  themeMode === themeOption.code && styles.activeOption,
                ]}
                onPress={toggleTheme}
              >
                <Ionicons name={themeOption.icon as any} size={24} color={theme.colors.text} />
                <Text style={styles.optionText}>{themeOption.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="language-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>{i18n.t('settings.language')}</Text>
          </View>
          <View style={styles.optionsContainer}>
            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.code}
                style={[
                  styles.option,
                  language === lang.code && styles.activeOption,
                ]}
                onPress={() => handleLanguageChange(lang.code)}
              >
                <Text style={styles.optionText}>{lang.name}</Text>
                {language === lang.code && (
                  <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.sectionTitle}>{i18n.t('settings.about')}</Text>
          </View>
          <View style={styles.aboutContainer}>
            <Text style={styles.aboutText}>Sasuke's Path</Text>
            <Text style={styles.aboutSubtext}>{i18n.t('settings.version')} 2.0.0</Text>
            <Text style={styles.aboutSubtext}>Desenvolvido por Augusto240</Text>
          </View>
        </View>

        {showPicker && (
          <DateTimePicker
            value={time}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={onTimeChange}
          />
        )}
      </ScrollView>
    </ErrorBoundary>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background, 
    padding: 18 
  },
  title: { 
    color: theme.colors.primary, 
    fontSize: 32, 
    fontWeight: 'bold', 
    marginTop: 28, 
    marginBottom: 30,
    fontFamily: 'Uchiha' 
  },
  section: {
    backgroundColor: theme.colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: 10, 
    paddingVertical: 10 
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: { 
    color: theme.colors.text, 
    fontSize: 16, 
    fontWeight: '500',
    marginLeft: 8 
  },
  info: { 
    color: theme.colors.textSecondary, 
    marginTop: 8, 
    fontSize: 13,
    fontStyle: 'italic' 
  },
  timeText: { 
    color: theme.colors.primary, 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  optionsContainer: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeOption: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '20',
  },
  optionText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  aboutContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  aboutText: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  aboutSubtext: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 2,
  },
});