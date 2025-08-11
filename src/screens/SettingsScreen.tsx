import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  { code: 'dark', name: 'Modo Escuro', icon: 'moon' },
  { code: 'light', name: 'Modo Claro', icon: 'sunny' },
];

export default function SettingsScreen() {
  const { theme: themeMode, language, setTheme, setLanguage } = useApp();
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
      
      try {
        const quote = await getRandomQuote();
        await scheduleDailyQuoteNotification(time, quote);
        Alert.alert(
          i18n.t('common.success'), 
          i18n.t('settings.notificationSuccess', { 
            time: time.toLocaleTimeString(language, { hour: '2-digit', minute: '2-digit' }) 
          })
        );
      } catch (error) {
        console.error('Error setting up notifications:', error);
        Alert.alert(i18n.t('common.error'), 'Erro ao configurar notificações');
      }
    } else {
      try {
        const Notifications = require('expo-notifications');
        await Notifications.cancelAllScheduledNotificationsAsync();
        Alert.alert('Notificações desabilitadas');
      } catch (error) {
        console.error('Error canceling notifications:', error);
      }
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
      if (enabled) {
        getRandomQuote().then(quote =>
          scheduleDailyQuoteNotification(selectedTime, quote)
        ).catch(error => console.error('Error updating notification time:', error));
      }
    }
  };

  const handleLanguageChange = (langCode: string) => {
    setLanguage(langCode as 'pt' | 'en' | 'ja');
    i18n.locale = langCode;
  };

  const handleThemeChange = (themeCode: string) => {
    setTheme(themeCode as 'dark' | 'light');
  };

  const styles = createStyles(theme);

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{i18n.t('settings.title')}</Text>
          
          {/* Notifications Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="notifications-outline" size={22} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Notificações Diárias</Text>
            </View>
            
            <View style={styles.row}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Ativar notificações</Text>
                <Text style={styles.sublabel}>Receba uma citação do Sasuke todo dia</Text>
              </View>
              <Switch 
                value={enabled} 
                onValueChange={toggleSwitch} 
                trackColor={{ false: theme.colors.border, true: theme.colors.primary + '60' }} 
                thumbColor={enabled ? theme.colors.primary : '#f4f3f4'} 
              />
            </View>
            
            {enabled && (
              <View style={styles.row}>
                <View style={styles.labelContainer}>
                  <Ionicons name="time-outline" size={20} color={theme.colors.textSecondary} />
                  <Text style={styles.label}>Horário</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setShowPicker(true)}
                  style={styles.timeButton}
                >
                  <Text style={styles.timeText}>
                    {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
            
            <Text style={styles.info}>
              As notificações aparecerão no horário escolhido com uma citação aleatória do Sasuke
            </Text>
          </View>

          {/* Theme Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="color-palette-outline" size={22} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Aparência</Text>
            </View>
            <View style={styles.optionsContainer}>
              {themes.map((themeOption) => (
                <TouchableOpacity
                  key={themeOption.code}
                  style={[
                    styles.option,
                    themeMode === themeOption.code && styles.activeOption,
                  ]}
                  onPress={() => handleThemeChange(themeOption.code)}
                  activeOpacity={0.7}
                >
                  <View style={styles.optionLeft}>
                    <Ionicons 
                      name={themeOption.icon as any} 
                      size={22} 
                      color={themeMode === themeOption.code ? theme.colors.primary : theme.colors.textSecondary} 
                    />
                    <Text style={[
                      styles.optionText,
                      themeMode === themeOption.code && styles.activeOptionText
                    ]}>
                      {themeOption.name}
                    </Text>
                  </View>
                  {themeMode === themeOption.code && (
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Language Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="language-outline" size={22} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Idioma</Text>
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
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.optionText,
                    language === lang.code && styles.activeOptionText
                  ]}>
                    {lang.name}
                  </Text>
                  {language === lang.code && (
                    <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* About Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="information-circle-outline" size={22} color={theme.colors.primary} />
              <Text style={styles.sectionTitle}>Sobre o App</Text>
            </View>
            <View style={styles.aboutContainer}>
              <Text style={styles.aboutTitle}>Sasuke's Path</Text>
              <Text style={styles.aboutVersion}>Versão 2.0.0</Text>
              <Text style={styles.aboutDeveloper}>Desenvolvido por Augusto240</Text>
              <Text style={styles.aboutDescription}>
                Um aplicativo dedicado às melhores citações e momentos do Sasuke Uchiha
              </Text>
            </View>
          </View>

          {/* Spacer for bottom navigation */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {showPicker && (
          <DateTimePicker
            value={time}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={onTimeChange}
          />
        )}
      </SafeAreaView>
    </ErrorBoundary>
  );
}

const createStyles = (theme: Theme) => StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background,
  },
  title: { 
    color: theme.colors.text, 
    fontSize: 32, 
    fontWeight: 'bold', 
    marginTop: 20,
    marginBottom: 24,
    fontFamily: 'Uchiha',
    paddingHorizontal: 18,
  },
  section: {
    backgroundColor: theme.colors.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 10,
  },
  row: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingVertical: 12,
  },
  labelContainer: {
    flex: 1,
    marginRight: 16,
  },
  label: { 
    color: theme.colors.text, 
    fontSize: 16, 
    fontWeight: '600',
    marginBottom: 2,
  },
  sublabel: {
    color: theme.colors.textSecondary,
    fontSize: 13,
    lineHeight: 18,
  },
  info: { 
    color: theme.colors.textSecondary, 
    marginTop: 12, 
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    gap: 6,
  },
  timeText: { 
    color: theme.colors.primary, 
    fontSize: 16, 
    fontWeight: '600',
  },
  optionsContainer: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  activeOption: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '500',
  },
  activeOptionText: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  aboutContainer: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  aboutTitle: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'Uchiha',
  },
  aboutVersion: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 2,
    fontWeight: '500',
  },
  aboutDeveloper: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    marginBottom: 12,
  },
  aboutDescription: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
});