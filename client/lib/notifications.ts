import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { getWeddingDetails } from "./storage";

const NOTIFICATION_SETTINGS_KEY = "@wedflow/notification_settings";
const SCHEDULED_NOTIFICATIONS_KEY = "@wedflow/scheduled_notifications";

export interface NotificationSettings {
  enabled: boolean;
  checklistReminders: boolean;
  weddingCountdown: boolean;
  daysBefore: number[];
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  enabled: false,
  checklistReminders: true,
  weddingCountdown: true,
  daysBefore: [30, 7, 1],
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    priority: Notifications.AndroidNotificationPriority.HIGH,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === "web") {
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === "granted";
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const data = await AsyncStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    return data ? JSON.parse(data) : DEFAULT_NOTIFICATION_SETTINGS;
  } catch {
    return DEFAULT_NOTIFICATION_SETTINGS;
  }
}

export async function saveNotificationSettings(settings: NotificationSettings): Promise<void> {
  await AsyncStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  
  if (settings.enabled) {
    await scheduleAllNotifications(settings);
  } else {
    await cancelAllScheduledNotifications();
  }
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  await AsyncStorage.removeItem(SCHEDULED_NOTIFICATIONS_KEY);
}

export async function scheduleAllNotifications(settings: NotificationSettings): Promise<void> {
  if (!settings.enabled) return;

  await cancelAllScheduledNotifications();

  const wedding = await getWeddingDetails();
  if (!wedding?.weddingDate) return;

  const weddingDate = new Date(wedding.weddingDate);
  const scheduledIds: string[] = [];

  if (settings.weddingCountdown) {
    for (const daysBefore of settings.daysBefore) {
      const notificationDate = new Date(weddingDate);
      notificationDate.setDate(notificationDate.getDate() - daysBefore);
      notificationDate.setHours(9, 0, 0, 0);

      if (notificationDate > new Date()) {
        const title = daysBefore === 1 
          ? "Bryllupet er i morgen!" 
          : daysBefore === 0 
            ? "Gratulerer med dagen!" 
            : `${daysBefore} dager til bryllupet!`;

        const body = daysBefore === 1
          ? "Siste sjekk av alle detaljer. Vi gleder oss med dere!"
          : daysBefore === 0
            ? "I dag er den store dagen. Nyt hvert øyeblikk!"
            : `Ikke glem å sjekke gjøremålslisten din.`;

        try {
          const id = await Notifications.scheduleNotificationAsync({
            content: {
              title,
              body,
              data: { type: "countdown", daysBefore },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: notificationDate,
            },
          });
          scheduledIds.push(id);
        } catch (error) {
          console.log("Failed to schedule notification:", error);
        }
      }
    }
  }

  await AsyncStorage.setItem(SCHEDULED_NOTIFICATIONS_KEY, JSON.stringify(scheduledIds));
}

export async function scheduleChecklistReminder(
  taskTitle: string,
  dueDate: Date
): Promise<string | null> {
  const settings = await getNotificationSettings();
  if (!settings.enabled || !settings.checklistReminders) return null;

  const reminderDate = new Date(dueDate);
  reminderDate.setDate(reminderDate.getDate() - 7);
  reminderDate.setHours(10, 0, 0, 0);

  if (reminderDate <= new Date()) return null;

  try {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: "Påminnelse om gjøremål",
        body: `Husk: "${taskTitle}" bør gjøres snart!`,
        data: { type: "checklist", task: taskTitle },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderDate,
      },
    });
    return id;
  } catch {
    return null;
  }
}

export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  return await Notifications.getAllScheduledNotificationsAsync();
}
