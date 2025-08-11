import * as Notifications from 'expo-notifications';
import { Quote } from '../models/Quote';

export async function requestNotificationPermission(): Promise<boolean> {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

export async function scheduleDailyQuoteNotification(time: Date, quote: Quote) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const trigger: Notifications.CalendarTriggerInput = {
    hour: time.getHours(),
    minute: time.getMinutes(),
    repeats: true,
    type: Notifications.SchedulableTriggerInputTypes.CALENDAR
  };
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Citação do Sasuke',
      body: quote.quote,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger,
  });
}