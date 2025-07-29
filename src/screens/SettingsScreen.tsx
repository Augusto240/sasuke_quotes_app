import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { scheduleDailyNotification, cancelAllNotifications } from '../utils/notifications';

export default function SettingsScreen() {
  const [enabled, setEnabled] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);

  const toggleSwitch = async (value: boolean) => {
    setEnabled(value);
    if (value) {
      await scheduleDailyNotification(time);
    } else {
      await cancelAllNotifications();
    }
  };

  const onTimeChange = (event: DateTimePickerEvent, selectedTime?: Date) => {
    setShowPicker(Platform.OS === 'ios');
    if (selectedTime) {
      setTime(selectedTime);
      if (enabled) {
        scheduleDailyNotification(selectedTime);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações</Text>
      <View style={styles.row}>
        <Text style={styles.label}>Notificação diária</Text>
        <Switch value={enabled} onValueChange={toggleSwitch} trackColor={{ false: '#bbb', true: '#e31b3a' }} thumbColor="#fff" />
      </View>
      {enabled && (
        <View style={styles.row}>
          <Text style={styles.label}>Horário</Text>
          <TouchableOpacity onPress={() => setShowPicker(true)}>
            <Text style={styles.timeText}>{time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
          </TouchableOpacity>
        </View>
      )}
      {showPicker && (
        <DateTimePicker
          value={time}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={onTimeChange}
        />
      )}
      <Text style={styles.info}>Receba uma citação aleatória do Sasuke todos os dias.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#191c26', padding: 18 },
  title: { color: '#e31b3a', fontSize: 26, fontWeight: 'bold', marginTop: 28, marginBottom: 20 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, paddingVertical: 10 },
  label: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  info: { color: '#bbb', marginTop: 22, fontSize: 13 },
  timeText: { color: '#e31b3a', fontSize: 18, fontWeight: 'bold' },
});