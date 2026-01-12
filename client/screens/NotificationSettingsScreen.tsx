import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, StyleSheet, View, Switch, Pressable, Alert, Platform, Linking } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Notifications from "expo-notifications";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import {
  NotificationSettings,
  getNotificationSettings,
  saveNotificationSettings,
  requestNotificationPermission,
  getScheduledNotifications,
  DEFAULT_NOTIFICATION_SETTINGS,
} from "@/lib/notifications";
import { getWeddingDetails } from "@/lib/storage";

const REMINDER_OPTIONS = [
  { days: 30, label: "30 dager før" },
  { days: 14, label: "2 uker før" },
  { days: 7, label: "1 uke før" },
  { days: 3, label: "3 dager før" },
  { days: 1, label: "1 dag før" },
];

export default function NotificationSettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [settings, setSettings] = useState<NotificationSettings>(DEFAULT_NOTIFICATION_SETTINGS);
  const [hasWeddingDate, setHasWeddingDate] = useState(false);
  const [scheduledCount, setScheduledCount] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState<string>("undetermined");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [savedSettings, wedding, scheduled, permission] = await Promise.all([
      getNotificationSettings(),
      getWeddingDetails(),
      getScheduledNotifications(),
      Notifications.getPermissionsAsync(),
    ]);

    setSettings(savedSettings);
    setHasWeddingDate(!!wedding?.weddingDate);
    setScheduledCount(scheduled.length);
    setPermissionStatus(permission.status);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggleEnabled = async (value: boolean) => {
    if (value) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        Alert.alert(
          "Tillatelse kreves",
          "Du må tillate varsler for å bruke denne funksjonen. Gå til innstillinger for å aktivere.",
          [
            { text: "Avbryt", style: "cancel" },
            {
              text: "Åpne innstillinger",
              onPress: () => {
                if (Platform.OS !== "web") {
                  try {
                    Linking.openSettings();
                  } catch {}
                }
              },
            },
          ]
        );
        return;
      }
      setPermissionStatus("granted");
    }

    const newSettings = { ...settings, enabled: value };
    setSettings(newSettings);
    await saveNotificationSettings(newSettings);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const scheduled = await getScheduledNotifications();
    setScheduledCount(scheduled.length);
  };

  const handleToggleChecklistReminders = async (value: boolean) => {
    const newSettings = { ...settings, checklistReminders: value };
    setSettings(newSettings);
    await saveNotificationSettings(newSettings);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleToggleCountdown = async (value: boolean) => {
    const newSettings = { ...settings, weddingCountdown: value };
    setSettings(newSettings);
    await saveNotificationSettings(newSettings);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const scheduled = await getScheduledNotifications();
    setScheduledCount(scheduled.length);
  };

  const handleToggleDay = async (day: number) => {
    const currentDays = settings.daysBefore;
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day].sort((a, b) => b - a);

    const newSettings = { ...settings, daysBefore: newDays };
    setSettings(newSettings);
    await saveNotificationSettings(newSettings);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const scheduled = await getScheduledNotifications();
    setScheduledCount(scheduled.length);
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.loadingContainer}>
          <ThemedText style={{ color: theme.textMuted }}>Laster...</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <Animated.View entering={FadeInDown.duration(300)}>
          <View style={[styles.card, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <View style={[styles.iconContainer, { backgroundColor: Colors.dark.accent + "20" }]}>
                  <Feather name="bell" size={20} color={Colors.dark.accent} />
                </View>
                <View style={styles.settingText}>
                  <ThemedText style={styles.settingTitle}>Varsler</ThemedText>
                  <ThemedText style={[styles.settingDescription, { color: theme.textMuted }]}>
                    Motta påminnelser om viktige oppgaver
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={settings.enabled}
                onValueChange={handleToggleEnabled}
                trackColor={{ false: theme.border, true: Colors.dark.accent }}
                thumbColor="#FFFFFF"
              />
            </View>

            {permissionStatus === "denied" ? (
              <View style={[styles.warningBox, { backgroundColor: "#FF6B6B20" }]}>
                <Feather name="alert-triangle" size={16} color="#FF6B6B" />
                <ThemedText style={[styles.warningText, { color: "#FF6B6B" }]}>
                  Varsler er blokkert. Åpne innstillinger for å aktivere.
                </ThemedText>
              </View>
            ) : null}
          </View>
        </Animated.View>

        {settings.enabled ? (
          <>
            <Animated.View entering={FadeInDown.delay(100).duration(300)}>
              <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                Varseltyper
              </ThemedText>
              <View style={[styles.card, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <View style={[styles.iconContainer, { backgroundColor: "#64B5F620" }]}>
                      <Feather name="check-square" size={20} color="#64B5F6" />
                    </View>
                    <View style={styles.settingText}>
                      <ThemedText style={styles.settingTitle}>Gjøremålspåminnelser</ThemedText>
                      <ThemedText style={[styles.settingDescription, { color: theme.textMuted }]}>
                        Påminnelser om oppgaver fra sjekklisten
                      </ThemedText>
                    </View>
                  </View>
                  <Switch
                    value={settings.checklistReminders}
                    onValueChange={handleToggleChecklistReminders}
                    trackColor={{ false: theme.border, true: Colors.dark.accent }}
                    thumbColor="#FFFFFF"
                  />
                </View>

                <View style={[styles.divider, { backgroundColor: theme.border }]} />

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <View style={[styles.iconContainer, { backgroundColor: "#BA68C820" }]}>
                      <Feather name="calendar" size={20} color="#BA68C8" />
                    </View>
                    <View style={styles.settingText}>
                      <ThemedText style={styles.settingTitle}>Bryllupsnedtelling</ThemedText>
                      <ThemedText style={[styles.settingDescription, { color: theme.textMuted }]}>
                        Varsler om dager igjen til bryllupet
                      </ThemedText>
                    </View>
                  </View>
                  <Switch
                    value={settings.weddingCountdown}
                    onValueChange={handleToggleCountdown}
                    trackColor={{ false: theme.border, true: Colors.dark.accent }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>
            </Animated.View>

            {settings.weddingCountdown ? (
              <Animated.View entering={FadeInDown.delay(200).duration(300)}>
                <ThemedText style={[styles.sectionTitle, { color: theme.textSecondary }]}>
                  Nedtellingsvarsel
                </ThemedText>
                <View style={[styles.card, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                  {!hasWeddingDate ? (
                    <View style={[styles.warningBox, { backgroundColor: "#FFB74D20" }]}>
                      <Feather name="info" size={16} color="#FFB74D" />
                      <ThemedText style={[styles.warningText, { color: "#FFB74D" }]}>
                        Sett bryllupsdato for å aktivere nedtellingsvarsler
                      </ThemedText>
                    </View>
                  ) : null}

                  {REMINDER_OPTIONS.map((option, index) => (
                    <React.Fragment key={option.days}>
                      {index > 0 ? <View style={[styles.divider, { backgroundColor: theme.border }]} /> : null}
                      <Pressable
                        style={styles.reminderRow}
                        onPress={() => handleToggleDay(option.days)}
                      >
                        <ThemedText style={styles.reminderLabel}>{option.label}</ThemedText>
                        <View
                          style={[
                            styles.checkbox,
                            {
                              backgroundColor: settings.daysBefore.includes(option.days)
                                ? Colors.dark.accent
                                : "transparent",
                              borderColor: settings.daysBefore.includes(option.days)
                                ? Colors.dark.accent
                                : theme.border,
                            },
                          ]}
                        >
                          {settings.daysBefore.includes(option.days) ? (
                            <Feather name="check" size={14} color="#FFFFFF" />
                          ) : null}
                        </View>
                      </Pressable>
                    </React.Fragment>
                  ))}
                </View>
              </Animated.View>
            ) : null}

            <Animated.View entering={FadeInDown.delay(300).duration(300)}>
              <View style={[styles.infoCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                <Feather name="info" size={18} color={theme.textMuted} />
                <ThemedText style={[styles.infoText, { color: theme.textMuted }]}>
                  {scheduledCount > 0
                    ? `${scheduledCount} varsler er planlagt`
                    : "Ingen varsler planlagt ennå"}
                </ThemedText>
              </View>
            </Animated.View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: Spacing.sm,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: Spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  settingDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  warningText: {
    fontSize: 13,
    flex: 1,
  },
  reminderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
  },
  reminderLabel: {
    fontSize: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  infoText: {
    fontSize: 14,
  },
});
