import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';
import { getRandomQuote } from '../api/sasukeApi';

export default function SettingsScreen() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    Notifications.requestPermissionsAsync();
  }, []);

  const toggleSwitch = async () => {
    setEnabled(!enabled);
    if (!enabled) {
      const quote = await getRandomQuote();
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Citação do Sasuke',
          body: quote.quote,
        },
        trigger: { hour: 9, minute: 0, repeats: true },
      });
      Alert.alert('Notificação diária ativada às 9h!');
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
      Alert.alert('Notificações diárias desativadas.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Notificação diária</Text>
        <Switch value={enabled} onValueChange={toggleSwitch} trackColor={{ false: '#bbb', true: '#e31b3a' }} thumbColor={enabled ? '#fff' : '#fff'} />
      </View>
      <Text style={styles.info}>Você receberá uma citação aleatória do Sasuke todo dia às 9h.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#191c26', padding: 18 },
  title: { color: '#e31b3a', fontSize: 26, fontWeight: 'bold', marginTop: 28, marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 },
  label: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  info: { color: '#bbb', marginTop: 22, fontSize: 13 },
});