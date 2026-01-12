import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Alert,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getSchedule, saveSchedule, generateId, getWeddingDetails } from "@/lib/storage";
import { ScheduleEvent } from "@/lib/types";
import emptyScheduleImage from "../../assets/images/empty-schedule.png";

const ICON_OPTIONS: ScheduleEvent["icon"][] = [
  "heart",
  "camera",
  "music",
  "users",
  "coffee",
  "sun",
  "moon",
  "star",
];

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTime, setNewTime] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<ScheduleEvent["icon"]>("heart");
  const [weddingDate, setWeddingDate] = useState("");

  const loadData = useCallback(async () => {
    const [data, wedding] = await Promise.all([
      getSchedule(),
      getWeddingDetails(),
    ]);
    setEvents(data);
    if (wedding) {
      const date = new Date(wedding.weddingDate);
      setWeddingDate(
        date.toLocaleDateString("nb-NO", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddEvent = async () => {
    if (!newTime.trim() || !newTitle.trim()) {
      Alert.alert("Feil", "Vennligst fyll ut tid og tittel");
      return;
    }

    const newEvent: ScheduleEvent = {
      id: generateId(),
      time: newTime.trim(),
      title: newTitle.trim(),
      icon: selectedIcon,
    };

    const updatedEvents = [...events, newEvent].sort((a, b) =>
      a.time.localeCompare(b.time)
    );
    setEvents(updatedEvents);
    await saveSchedule(updatedEvents);

    setNewTime("");
    setNewTitle("");
    setSelectedIcon("heart");
    setShowForm(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteEvent = async (id: string) => {
    Alert.alert("Slett hendelse", "Er du sikker på at du vil slette denne?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Slett",
        style: "destructive",
        onPress: async () => {
          const updatedEvents = events.filter((e) => e.id !== id);
          setEvents(updatedEvents);
          await saveSchedule(updatedEvents);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.backgroundRoot },
        ]}
      >
        <ThemedText style={{ color: theme.textSecondary }}>
          Laster...
        </ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
        flexGrow: 1,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      {weddingDate ? (
        <ThemedText
          style={[styles.dateHeader, { color: theme.textSecondary }]}
        >
          {weddingDate}
        </ThemedText>
      ) : null}

      {events.length === 0 ? (
        <View style={styles.emptyState}>
          <Image
            source={emptyScheduleImage}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <ThemedText
            style={[styles.emptyText, { color: theme.textSecondary }]}
          >
            Ingen hendelser lagt til ennå
          </ThemedText>
          <ThemedText
            style={[styles.emptySubtext, { color: theme.textMuted }]}
          >
            Legg til din første hendelse for bryllupsdagen
          </ThemedText>
        </View>
      ) : (
        <View style={styles.timeline}>
          {events.map((event, index) => (
            <Animated.View
              key={event.id}
              entering={FadeInRight.delay(index * 100).duration(300)}
            >
              <Pressable
                onLongPress={() => handleDeleteEvent(event.id)}
                style={({ pressed }) => [
                  styles.eventItem,
                  { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                  pressed && { opacity: 0.9 },
                ]}
              >
                <View style={styles.timeContainer}>
                  <ThemedText
                    style={[styles.eventTime, { color: Colors.dark.accent }]}
                  >
                    {event.time}
                  </ThemedText>
                </View>
                <View
                  style={[
                    styles.eventIcon,
                    { backgroundColor: theme.backgroundSecondary },
                  ]}
                >
                  <Feather
                    name={event.icon}
                    size={18}
                    color={Colors.dark.accent}
                  />
                </View>
                <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      )}

      {showForm ? (
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[
            styles.formCard,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
        >
          <ThemedText type="h3" style={styles.formTitle}>
            Legg til hendelse
          </ThemedText>

          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.timeInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="00:00"
              placeholderTextColor={theme.textMuted}
              value={newTime}
              onChangeText={setNewTime}
              keyboardType="numbers-and-punctuation"
            />
            <TextInput
              style={[
                styles.titleInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Tittel"
              placeholderTextColor={theme.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
            />
          </View>

          <View style={styles.iconPicker}>
            {ICON_OPTIONS.map((icon) => (
              <Pressable
                key={icon}
                onPress={() => setSelectedIcon(icon)}
                style={[
                  styles.iconOption,
                  {
                    backgroundColor:
                      selectedIcon === icon
                        ? Colors.dark.accent
                        : theme.backgroundSecondary,
                  },
                ]}
              >
                <Feather
                  name={icon}
                  size={18}
                  color={selectedIcon === icon ? "#1A1A1A" : theme.textSecondary}
                />
              </Pressable>
            ))}
          </View>

          <View style={styles.formButtons}>
            <Pressable
              onPress={() => setShowForm(false)}
              style={[styles.cancelButton, { borderColor: theme.border }]}
            >
              <ThemedText style={{ color: theme.textSecondary }}>
                Avbryt
              </ThemedText>
            </Pressable>
            <Button onPress={handleAddEvent} style={styles.saveButton}>
              Lagre
            </Button>
          </View>
        </Animated.View>
      ) : (
        <Pressable
          onPress={() => {
            setShowForm(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={[styles.addButton, { borderColor: Colors.dark.accent }]}
        >
          <Feather name="plus" size={20} color={Colors.dark.accent} />
          <ThemedText style={[styles.addButtonText, { color: Colors.dark.accent }]}>
            Legg til hendelse
          </ThemedText>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  dateHeader: {
    fontSize: 14,
    marginBottom: Spacing.xl,
    textTransform: "capitalize",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: Spacing.xl,
    opacity: 0.8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  timeline: {
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  eventItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  timeContainer: {
    width: 55,
  },
  eventTime: {
    fontSize: 16,
    fontWeight: "600",
  },
  eventIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  eventTitle: {
    fontSize: 16,
    flex: 1,
  },
  formCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.lg,
  },
  formTitle: {
    marginBottom: Spacing.lg,
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  timeInput: {
    width: 80,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    fontSize: 16,
  },
  titleInput: {
    flex: 1,
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    fontSize: 16,
  },
  iconPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  iconOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  formButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  saveButton: {
    flex: 1,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addButtonText: {
    marginLeft: Spacing.sm,
    fontWeight: "500",
  },
});
