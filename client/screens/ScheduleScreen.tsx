import React, { useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Image,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getWeddingDetails, getSpeeches, getAppLanguage, type AppLanguage } from "@/lib/storage";
import { useSession } from "@/hooks/useSession";
import {
  getScheduleEvents,
  createScheduleEvent,
  updateScheduleEvent,
  deleteScheduleEvent,
} from "@/lib/api-schedule-events";
import { showToast } from "@/lib/toast";
import { showConfirm } from "@/lib/dialogs";
import type { ScheduleEvent } from "@shared/schema";
import { Speech } from "@/lib/types";

const emptyScheduleImage = require("../../assets/images/empty-schedule.png");

const ICON_OPTIONS = [
  "heart",
  "camera",
  "music",
  "users",
  "coffee",
  "sun",
  "moon",
  "star",
 ] as const;

type IconName = typeof ICON_OPTIONS[number];

const resolveIcon = (icon?: string | null): IconName => {
  if (!icon) return "heart";
  return (ICON_OPTIONS as readonly string[]).includes(icon) ? (icon as IconName) : "heart";
};

const SWIPE_THRESHOLD = -80;
const ACTION_WIDTH = 140;

interface SwipeableEventItemProps {
  event: ScheduleEvent;
  index: number;
  theme: any;
  t: (nb: string, en: string) => string;
  onEdit: () => void;
  onDelete: () => void;
}

function SwipeableEventItem({ event, index, theme, t, onEdit, onDelete }: SwipeableEventItemProps) {
  const translateX = useSharedValue(0);
  const isOpen = useSharedValue(false);

  const panGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      if (isOpen.value) {
        translateX.value = Math.max(-ACTION_WIDTH, Math.min(0, e.translationX - ACTION_WIDTH));
      } else {
        translateX.value = Math.max(-ACTION_WIDTH, Math.min(0, e.translationX));
      }
    })
    .onEnd((e) => {
      if (translateX.value < SWIPE_THRESHOLD) {
        translateX.value = withSpring(-ACTION_WIDTH, { damping: 20 });
        isOpen.value = true;
      } else {
        translateX.value = withSpring(0, { damping: 20 });
        isOpen.value = false;
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const handleEdit = () => {
    translateX.value = withSpring(0, { damping: 20 });
    isOpen.value = false;
    onEdit();
  };

  const handleDelete = () => {
    translateX.value = withSpring(0, { damping: 20 });
    isOpen.value = false;
    onDelete();
  };

  return (
    <Animated.View entering={FadeInRight.delay(index * 100).duration(300)}>
      <View style={styles.swipeContainer}>
        <View style={styles.actionsContainer}>
          <Pressable
            style={[styles.actionButton, styles.editButton]}
            onPress={handleEdit}
          >
            <Feather name="edit-2" size={18} color="#FFF" />
            <ThemedText style={styles.actionText}>{t("Endre", "Edit")}</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Feather name="trash-2" size={18} color="#FFF" />
            <ThemedText style={styles.actionText}>{t("Slett", "Delete")}</ThemedText>
          </Pressable>
        </View>
        <GestureDetector gesture={panGesture}>
          <Animated.View
            style={[
              styles.eventItem,
              { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
              animatedStyle,
            ]}
          >
            <View style={styles.timeContainer}>
              <ThemedText style={[styles.eventTime, { color: Colors.dark.accent }]}>
                {event.time}
              </ThemedText>
            </View>
            <View style={[styles.eventIcon, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name={resolveIcon(event.icon)} size={18} color={Colors.dark.accent} />
            </View>
            <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
          </Animated.View>
        </GestureDetector>
      </View>
    </Animated.View>
  );
}

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { session } = useSession();
  const queryClient = useQueryClient();

  const [appLanguage, setAppLanguage] = useState<AppLanguage>("nb");
  const t = useCallback((nb: string, en: string) => (appLanguage === "en" ? en : nb), [appLanguage]);
  const locale = appLanguage === "en" ? "en-US" : "nb-NO";

  // Query for schedule events from server - only if we have a valid token
  const { data: eventsData, isLoading: loadingEvents, refetch, error: queryError } = useQuery({
    queryKey: ["schedule-events", session?.token],
    queryFn: () => (session?.token ? getScheduleEvents(session.token) : Promise.resolve([])),
    enabled: !!session?.token,
    retry: false,
  });

  const events = eventsData ?? [];
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [loadingOther, setLoadingOther] = useState(true);
  const loading = loadingEvents || loadingOther;

  // Safe token getter
  const getToken = () => session?.token;

  // Mutations
  const createMutation = useMutation({
    mutationFn: (data: { time: string; title: string; icon?: string }) => {
      const token = getToken();
      if (!token) throw new Error("No session token available");
      return createScheduleEvent(token, data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedule-events"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ScheduleEvent> }) => {
      const token = getToken();
      if (!token) throw new Error("No session token available");
      return updateScheduleEvent(token, id, data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedule-events"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => {
      const token = getToken();
      if (!token) throw new Error("No session token available");
      return deleteScheduleEvent(token, id);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedule-events"] }),
  });

  // Refresh handler
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null);
  const [newTime, setNewTime] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<IconName>("heart");
  const [weddingDate, setWeddingDate] = useState("");
  const [showSpeeches, setShowSpeeches] = useState(true);

  React.useEffect(() => {
    async function loadLanguage() {
      const language = await getAppLanguage();
      setAppLanguage(language);
    }
    loadLanguage();
  }, []);

  // Load other data (speeches, wedding date) on mount
  React.useEffect(() => {
    async function loadOtherData() {
      const [wedding, speechData] = await Promise.all([
        getWeddingDetails(),
        getSpeeches(),
      ]);
      setSpeeches(speechData);
      if (wedding) {
        const date = new Date(wedding.weddingDate);
        setWeddingDate(
          date.toLocaleDateString(locale, {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        );
      }
      setLoadingOther(false);
    }
    loadOtherData();
  }, []);

  const handleAddEvent = async () => {
    if (!newTime.trim() || !newTitle.trim()) {
      showToast(t("Vennligst fyll ut tid og tittel", "Please fill in time and title"));
      return;
    }

    try {
      if (editingEvent) {
        await updateMutation.mutateAsync({
          id: editingEvent.id.toString(),
          data: { time: newTime.trim(), title: newTitle.trim(), icon: selectedIcon },
        });
      } else {
        await createMutation.mutateAsync({
          time: newTime.trim(),
          title: newTitle.trim(),
          icon: selectedIcon,
        });
      }

      setNewTime("");
      setNewTitle("");
      setSelectedIcon("heart");
      setEditingEvent(null);
      setShowForm(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      showToast(t("Kunne ikke lagre hendelse", "Could not save event"));
    }
  };

  const handleEditEvent = (event: ScheduleEvent) => {
    setEditingEvent(event);
    setNewTime(event.time);
    setNewTitle(event.title);
    setSelectedIcon(resolveIcon(event.icon));
    setShowForm(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDeleteEvent = async (id: string) => {
    const confirmed = await showConfirm({
      title: t("Slett hendelse", "Delete event"),
      message: t("Er du sikker på at du vil slette denne?", "Are you sure you want to delete this?"),
      confirmLabel: t("Slett", "Delete"),
      cancelLabel: t("Avbryt", "Cancel"),
      destructive: true,
    });
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(id);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      showToast(t("Kunne ikke slette hendelse", "Could not delete event"));
    }
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
        <ThemedText style={{ color: theme.textSecondary }}>{t("Laster...", "Loading...")}</ThemedText>
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.accent} />}
    >
      {queryError && (
        <View style={[styles.errorBanner, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}> 
          <Feather name="alert-triangle" size={16} color={theme.textSecondary} />
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.errorBannerText, { color: theme.textSecondary }]}> 
              {queryError instanceof Error ? queryError.message : t("Kunne ikke laste tidsplan", "Could not load schedule")}
            </ThemedText>
          </View>
          <Pressable onPress={() => refetch()}>
            <ThemedText style={{ color: Colors.dark.accent, fontWeight: "600" }}>
              {t("Prøv igjen", "Try again")}
            </ThemedText>
          </Pressable>
        </View>
      )}
      {weddingDate ? (
        <ThemedText
          style={[styles.dateHeader, { color: theme.textSecondary }]}
        >
          {weddingDate}
        </ThemedText>
      ) : null}

      {/* Speech Section */}
      <Pressable
        onPress={() => {
          setShowSpeeches(!showSpeeches);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        style={[
          styles.speechHeader,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        ]}
      >
        <View style={[styles.speechIconContainer, { backgroundColor: Colors.dark.accent + "20" }]}>
          <Feather name="mic" size={18} color={Colors.dark.accent} />
        </View>
        <View style={styles.speechHeaderContent}>
          <ThemedText style={styles.speechTitle}>{t("Taleliste", "Speech list")}</ThemedText>
          <ThemedText style={[styles.speechCount, { color: theme.textSecondary }]}>
            {t(
              `${speeches.length} taler - ${speeches.reduce((sum, s) => sum + (s.durationMinutes || 5), 0)} min totalt`,
              `${speeches.length} speeches - ${speeches.reduce((sum, s) => sum + (s.durationMinutes || 5), 0)} min total`
            )}
          </ThemedText>
        </View>
        <Feather
          name={showSpeeches ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.textSecondary}
        />
      </Pressable>

      {showSpeeches && speeches.length > 0 ? (
        <Animated.View entering={FadeInDown.duration(200)} style={styles.speechList}>
          {speeches.slice(0, 3).map((speech, index) => (
            <View
              key={speech.id}
              style={[
                styles.speechItem,
                { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
              ]}
            >
              <ThemedText style={[styles.speechOrder, { color: Colors.dark.accent }]}>
                {speech.order}
              </ThemedText>
              <View style={styles.speechInfo}>
                <ThemedText style={styles.speechName}>{speech.speakerName}</ThemedText>
                <ThemedText style={[styles.speechRole, { color: theme.textMuted }]}>
                  {speech.role}
                </ThemedText>
              </View>
              <ThemedText style={[styles.speechDuration, { color: theme.textSecondary }]}>
                {t(`${speech.durationMinutes || 5} min`, `${speech.durationMinutes || 5} min`)}
              </ThemedText>
            </View>
          ))}
          {speeches.length > 3 ? (
            <Pressable
              onPress={() => navigation.navigate("SpeechList")}
              style={styles.viewAllButton}
            >
              <ThemedText style={[styles.viewAllText, { color: Colors.dark.accent }]}>
                {t(`Se alle ${speeches.length} taler`, `View all ${speeches.length} speeches`)}
              </ThemedText>
              <Feather name="arrow-right" size={16} color={Colors.dark.accent} />
            </Pressable>
          ) : (
            <Pressable
              onPress={() => navigation.navigate("SpeechList")}
              style={styles.viewAllButton}
            >
              <ThemedText style={[styles.viewAllText, { color: Colors.dark.accent }]}>
                {t("Rediger taleliste", "Edit speech list")}
              </ThemedText>
              <Feather name="edit-2" size={14} color={Colors.dark.accent} />
            </Pressable>
          )}
        </Animated.View>
      ) : showSpeeches && speeches.length === 0 ? (
        <Pressable
          onPress={() => navigation.navigate("SpeechList")}
          style={[styles.addSpeechButton, { borderColor: Colors.dark.accent }]}
        >
          <Feather name="plus" size={16} color={Colors.dark.accent} />
          <ThemedText style={[styles.addSpeechText, { color: Colors.dark.accent }]}>
            {t("Legg til taler", "Add speeches")}
          </ThemedText>
        </Pressable>
      ) : null}

      {/* Share with Coordinator Button */}
      <Pressable
        onPress={() => navigation.navigate("CoordinatorSharing")}
        style={[styles.shareButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
      >
        <Feather name="share-2" size={18} color={Colors.dark.accent} />
        <View style={styles.shareButtonContent}>
          <ThemedText style={styles.shareButtonTitle}>{t("Del med toastmaster", "Share with toastmaster")}</ThemedText>
          <ThemedText style={[styles.shareButtonSubtitle, { color: theme.textMuted }]}>
            {t("Gi koordinatorer tilgang til taler og program", "Give coordinators access to speeches and schedule")}
          </ThemedText>
        </View>
        <Feather name="chevron-right" size={18} color={theme.textMuted} />
      </Pressable>

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
            {t("Ingen hendelser lagt til ennå", "No events added yet")}
          </ThemedText>
          <ThemedText
            style={[styles.emptySubtext, { color: theme.textMuted }]}
          >
            {t("Legg til din første hendelse for dagen", "Add your first event for the day")}
          </ThemedText>
        </View>
      ) : (
        <View style={styles.timeline}>
          <ThemedText style={[styles.swipeHint, { color: theme.textMuted }]}>
            {t("Sveip til venstre for å endre eller slette", "Swipe left to edit or delete")}
          </ThemedText>
          {events.map((event, index) => (
            <SwipeableEventItem
              key={event.id}
              event={event}
              index={index}
              theme={theme}
              t={t}
              onEdit={() => handleEditEvent(event)}
              onDelete={() => handleDeleteEvent(event.id)}
            />
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
            {editingEvent ? t("Endre hendelse", "Edit event") : t("Legg til hendelse", "Add event")}
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
              placeholder={t("14:00", "14:00")}
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
              placeholder={t("F.eks. Fotografering av brudepar", "e.g. Couple photos")}
              placeholderTextColor={theme.textMuted}
              value={newTitle}
              onChangeText={setNewTitle}
            />
          </View>

          <ThemedText style={[styles.helpText, { color: theme.textMuted }]}>
            {t(
              "Tips: Bruk kamera-ikon for foto/video, så finner Foto & Video Tidsplan det automatisk",
              "Tip: Use the camera icon for photo/video so the Photo & Video Timeline finds it automatically"
            )}
          </ThemedText>

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
              onPress={() => {
                setShowForm(false);
                setEditingEvent(null);
                setNewTime("");
                setNewTitle("");
                setSelectedIcon("heart");
              }}
              style={[styles.cancelButton, { borderColor: theme.border }]}
            >
              <ThemedText style={{ color: theme.textSecondary }}>{t("Avbryt", "Cancel")}</ThemedText>
            </Pressable>
            <Button onPress={handleAddEvent} style={styles.saveButton}>
              {editingEvent ? t("Oppdater", "Update") : t("Lagre", "Save")}
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
            {t("Legg til hendelse", "Add event")}
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
  swipeHint: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  errorBannerText: {
    fontSize: 12,
  },
  swipeContainer: {
    position: "relative",
    overflow: "hidden",
    borderRadius: BorderRadius.md,
  },
  actionsContainer: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    flexDirection: "row",
  },
  actionButton: {
    width: 70,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  editButton: {
    backgroundColor: Colors.dark.accent,
  },
  deleteButton: {
    backgroundColor: "#DC3545",
  },
  actionText: {
    color: "#FFF",
    fontSize: 11,
    fontWeight: "500",
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
    marginBottom: Spacing.sm,
  },
  helpText: {
    fontSize: 12,
    marginBottom: Spacing.md,
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
  speechHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  speechIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  speechHeaderContent: {
    flex: 1,
  },
  speechTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  speechCount: {
    fontSize: 13,
  },
  speechList: {
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  speechItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  speechOrder: {
    fontSize: 14,
    fontWeight: "700",
    width: 24,
    textAlign: "center",
  },
  speechInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  speechName: {
    fontSize: 14,
    fontWeight: "500",
  },
  speechRole: {
    fontSize: 12,
  },
  speechDuration: {
    fontSize: 13,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "500",
  },
  addSpeechButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderStyle: "dashed",
    marginBottom: Spacing.lg,
    gap: Spacing.xs,
  },
  addSpeechText: {
    fontSize: 14,
    fontWeight: "500",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  shareButtonContent: {
    flex: 1,
  },
  shareButtonTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  shareButtonSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
