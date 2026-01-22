import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

interface VendorSession {
  sessionToken: string;
  vendorId: string;
  email: string;
  businessName: string;
}

interface ScheduleEvent {
  id: string;
  time: string;
  title: string;
  icon?: string;
  notes?: string;
}

interface Speech {
  id: string;
  speakerName: string;
  role: string;
  durationMinutes: number;
  sortOrder: number;
  notes?: string;
  scheduledTime?: string;
}

interface CoupleScheduleData {
  couple: {
    displayName: string;
    weddingDate: string | null;
  };
  schedule: ScheduleEvent[];
  speeches: Speech[];
  canViewSpeeches: boolean;
}

interface SuggestionPayload {
  type: "schedule_change" | "new_event" | "speech_change";
  eventId?: string;
  suggestedTime?: string;
  suggestedTitle?: string;
  message: string;
}

const ICON_MAP: Record<string, keyof typeof Feather.glyphMap> = {
  heart: "heart",
  camera: "camera",
  music: "music",
  users: "users",
  coffee: "coffee",
  sun: "sun",
  moon: "moon",
  star: "star",
};

type Props = NativeStackScreenProps<any, "VendorCoupleSchedule">;

export default function VendorCoupleScheduleScreen({ route, navigation }: Props) {
  const { coupleId, coupleName } = route.params as { coupleId: string; coupleName: string };
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [session, setSession] = useState<VendorSession | null>(null);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);
  const [suggestionMessage, setSuggestionMessage] = useState("");
  const [suggestedTime, setSuggestedTime] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load session on mount
  React.useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    const sessionData = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
    if (sessionData) {
      setSession(JSON.parse(sessionData));
    } else {
      navigation.goBack();
    }
  };

  const { data, isLoading, refetch } = useQuery<CoupleScheduleData>({
    queryKey: ["/api/vendor/couple-schedule", coupleId],
    queryFn: async () => {
      if (!session?.sessionToken) throw new Error("Ikke autentisert");
      const response = await fetch(
        new URL(`/api/vendor/couple-schedule/${coupleId}`, getApiUrl()).toString(),
        {
          headers: {
            Authorization: `Bearer ${session.sessionToken}`,
          },
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kunne ikke hente program");
      }
      return response.json();
    },
    enabled: !!session?.sessionToken && !!coupleId,
  });

  const sendSuggestionMutation = useMutation({
    mutationFn: async (payload: SuggestionPayload) => {
      if (!session?.sessionToken) throw new Error("Ikke autentisert");
      const response = await fetch(
        new URL(`/api/vendor/schedule-suggestions`, getApiUrl()).toString(),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.sessionToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            coupleId,
            ...payload,
          }),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kunne ikke sende forslag");
      }
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Sendt!", "Forslaget ditt er sendt til brudeparet.");
      setShowSuggestionModal(false);
      setSelectedEvent(null);
      setSuggestionMessage("");
      setSuggestedTime("");
    },
    onError: (error: any) => {
      Alert.alert("Feil", error.message || "Kunne ikke sende forslag");
    },
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const openSuggestionModal = (event: ScheduleEvent) => {
    setSelectedEvent(event);
    setSuggestedTime(event.time);
    setShowSuggestionModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSendSuggestion = () => {
    if (!suggestionMessage.trim()) {
      Alert.alert("Feil", "Skriv en melding med forslaget ditt");
      return;
    }

    const payload: SuggestionPayload = {
      type: "schedule_change",
      eventId: selectedEvent?.id,
      suggestedTime: suggestedTime !== selectedEvent?.time ? suggestedTime : undefined,
      message: suggestionMessage.trim(),
    };

    sendSuggestionMutation.mutate(payload);
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("nb-NO", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getTimeDiff = (time1: string, time2: string) => {
    const [h1, m1] = time1.split(":").map(Number);
    const [h2, m2] = time2.split(":").map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  };

  const renderScheduleItem = ({ item, index }: { item: ScheduleEvent; index: number }) => {
    const nextEvent = data?.schedule[index + 1];
    const timeDiff = nextEvent ? getTimeDiff(item.time, nextEvent.time) : 0;

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
        <Pressable
          onPress={() => openSuggestionModal(item)}
          style={({ pressed }) => [
            styles.timelineItem,
            pressed && { opacity: 0.7 },
          ]}
        >
          <View style={styles.timeColumn}>
            <ThemedText style={[styles.time, { color: Colors.dark.accent }]}>
              {item.time}
            </ThemedText>
          </View>
          <View style={styles.dotColumn}>
            <View style={[styles.dot, { backgroundColor: Colors.dark.accent }]}>
              <Feather
                name={ICON_MAP[item.icon || "star"] || "star"}
                size={12}
                color="#1A1A1A"
              />
            </View>
            {nextEvent && (
              <View style={[styles.line, { backgroundColor: theme.border }]} />
            )}
          </View>
          <View
            style={[
              styles.eventCard,
              { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            ]}
          >
            <View style={styles.eventHeader}>
              <ThemedText style={styles.eventTitle}>{item.title}</ThemedText>
              <View style={[styles.suggestBadge, { backgroundColor: Colors.dark.accent + "15" }]}>
                <Feather name="message-circle" size={12} color={Colors.dark.accent} />
                <ThemedText style={[styles.suggestText, { color: Colors.dark.accent }]}>
                  Foreslå
                </ThemedText>
              </View>
            </View>
            {nextEvent && (
              <ThemedText style={[styles.duration, { color: theme.textSecondary }]}>
                {timeDiff} min til neste
              </ThemedText>
            )}
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  const renderSpeechItem = ({ item, index }: { item: Speech; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50 + 200).duration(300)}>
      <View
        style={[
          styles.speechCard,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        ]}
      >
        <View style={styles.speechHeader}>
          <View style={[styles.speechNumber, { backgroundColor: Colors.dark.accent }]}>
            <ThemedText style={styles.speechNumberText}>{index + 1}</ThemedText>
          </View>
          <View style={styles.speechInfo}>
            <ThemedText style={styles.speechName}>{item.speakerName}</ThemedText>
            <ThemedText style={[styles.speechRole, { color: theme.textSecondary }]}>
              {item.role}
            </ThemedText>
          </View>
          <View style={styles.speechMeta}>
            <ThemedText style={[styles.speechDuration, { color: Colors.dark.accent }]}>
              {item.durationMinutes} min
            </ThemedText>
            {item.scheduledTime && (
              <ThemedText style={[styles.speechTime, { color: theme.textSecondary }]}>
                kl. {item.scheduledTime}
              </ThemedText>
            )}
          </View>
        </View>
      </View>
    </Animated.View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.dark.accent} />
        <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
          Henter program...
        </ThemedText>
      </View>
    );
  }

  if (!data) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <Feather name="lock" size={48} color={theme.textMuted} />
        <ThemedText style={[styles.errorText, { color: theme.textSecondary }]}>
          Du har ikke tilgang til dette programmet
        </ThemedText>
        <Button onPress={() => navigation.goBack()} style={{ marginTop: Spacing.lg }}>
          Gå tilbake
        </Button>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={data.schedule}
        keyExtractor={(item) => item.id}
        renderItem={renderScheduleItem}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingHorizontal: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
        }}
        ListHeaderComponent={
          <View style={[styles.headerCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <Feather name="calendar" size={24} color={Colors.dark.accent} />
            <ThemedText type="h3" style={styles.headerTitle}>
              {coupleName || data.couple.displayName}
            </ThemedText>
            <ThemedText style={[styles.headerDate, { color: theme.textSecondary }]}>
              {formatDate(data.couple.weddingDate)}
            </ThemedText>
            <View style={[styles.viewOnlyBadge, { backgroundColor: Colors.dark.accent + "15" }]}>
              <Feather name="eye" size={14} color={Colors.dark.accent} />
              <ThemedText style={[styles.viewOnlyText, { color: Colors.dark.accent }]}>
                Kun visning – trykk for å foreslå endringer
              </ThemedText>
            </View>
          </View>
        }
        ListFooterComponent={
          data.canViewSpeeches && data.speeches.length > 0 ? (
            <View style={styles.speechSection}>
              <View style={styles.sectionHeader}>
                <Feather name="mic" size={18} color={Colors.dark.accent} />
                <ThemedText type="h4" style={styles.sectionTitle}>
                  Taler ({data.speeches.length})
                </ThemedText>
              </View>
              {data.speeches.map((speech, index) => (
                <View key={speech.id}>
                  {renderSpeechItem({ item: speech, index })}
                </View>
              ))}
            </View>
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="calendar" size={48} color={theme.textMuted} />
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              Ingen hendelser i kjøreplanen ennå
            </ThemedText>
          </View>
        }
      />

      {/* Suggestion Modal */}
      <Modal
        visible={showSuggestionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSuggestionModal(false)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3" style={styles.modalTitle}>
                Foreslå endring
              </ThemedText>
              <Pressable onPress={() => setShowSuggestionModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            {selectedEvent && (
              <>
                <View style={styles.modalSection}>
                  <ThemedText style={[styles.modalLabel, { color: theme.textSecondary }]}>
                    Hendelse
                  </ThemedText>
                  <View style={[styles.eventPreview, { backgroundColor: theme.backgroundSecondary }]}>
                    <Feather
                      name={ICON_MAP[selectedEvent.icon || "star"] || "star"}
                      size={16}
                      color={Colors.dark.accent}
                    />
                    <ThemedText style={styles.eventPreviewText}>
                      {selectedEvent.title}
                    </ThemedText>
                    <ThemedText style={[styles.eventPreviewTime, { color: theme.textSecondary }]}>
                      kl. {selectedEvent.time}
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <ThemedText style={[styles.modalLabel, { color: theme.textSecondary }]}>
                    Foreslått ny tid (valgfritt)
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.timeInput,
                      { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundSecondary },
                    ]}
                    placeholder="HH:MM"
                    placeholderTextColor={theme.textMuted}
                    value={suggestedTime}
                    onChangeText={setSuggestedTime}
                    maxLength={5}
                    keyboardType="numbers-and-punctuation"
                  />
                </View>

                <View style={styles.modalSection}>
                  <ThemedText style={[styles.modalLabel, { color: theme.textSecondary }]}>
                    Din melding til brudeparet *
                  </ThemedText>
                  <TextInput
                    style={[
                      styles.messageInput,
                      { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundSecondary },
                    ]}
                    placeholder="Beskriv forslaget ditt..."
                    placeholderTextColor={theme.textMuted}
                    value={suggestionMessage}
                    onChangeText={setSuggestionMessage}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                  />
                </View>

                <View style={[styles.infoBox, { backgroundColor: Colors.dark.accent + "10", borderColor: Colors.dark.accent }]}>
                  <Feather name="info" size={16} color={Colors.dark.accent} />
                  <ThemedText style={[styles.infoText, { color: Colors.dark.accent }]}>
                    Brudeparet vil motta forslaget ditt og kan velge å godta eller avvise endringen.
                  </ThemedText>
                </View>

                <View style={styles.modalButtonGroup}>
                  <Button
                    onPress={() => setShowSuggestionModal(false)}
                    style={styles.cancelButton}
                  >
                    Avbryt
                  </Button>
                  <Button
                    onPress={handleSendSuggestion}
                    disabled={sendSuggestionMutation.isPending}
                  >
                    {sendSuggestionMutation.isPending ? "Sender..." : "Send forslag"}
                  </Button>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: Spacing.md, fontSize: 14 },
  errorText: { marginTop: Spacing.lg, fontSize: 16, textAlign: "center" },
  headerCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  headerTitle: { marginTop: Spacing.sm, textAlign: "center" },
  headerDate: { marginTop: Spacing.xs, fontSize: 14 },
  viewOnlyBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  viewOnlyText: { fontSize: 12, fontWeight: "500" },
  timelineItem: { flexDirection: "row", marginBottom: Spacing.sm },
  timeColumn: { width: 50, alignItems: "flex-end", paddingRight: Spacing.md },
  time: { fontSize: 14, fontWeight: "600" },
  dotColumn: { alignItems: "center", width: 30 },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  line: { width: 2, flex: 1, marginTop: -2 },
  eventCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginLeft: Spacing.sm,
  },
  eventHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  eventTitle: { fontSize: 15, fontWeight: "500", flex: 1 },
  suggestBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  suggestText: { fontSize: 11, fontWeight: "600" },
  duration: { fontSize: 12, marginTop: 4 },
  emptyState: { alignItems: "center", paddingVertical: Spacing["5xl"] },
  emptyText: { fontSize: 16, marginTop: Spacing.lg },
  speechSection: { marginTop: Spacing.xl },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionTitle: { marginBottom: 0 },
  speechCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  speechHeader: { flexDirection: "row", alignItems: "center" },
  speechNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  speechNumberText: { color: "#1A1A1A", fontSize: 14, fontWeight: "700" },
  speechInfo: { flex: 1, marginLeft: Spacing.md },
  speechName: { fontSize: 15, fontWeight: "600" },
  speechRole: { fontSize: 12, marginTop: 2 },
  speechMeta: { alignItems: "flex-end" },
  speechDuration: { fontSize: 14, fontWeight: "600" },
  speechTime: { fontSize: 12, marginTop: 2 },
  modalOverlay: { flex: 1, justifyContent: "flex-end" },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: { marginBottom: 0 },
  modalSection: { marginBottom: Spacing.lg },
  modalLabel: { fontSize: 12, fontWeight: "600", marginBottom: Spacing.sm },
  eventPreview: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  eventPreviewText: { flex: 1, fontSize: 15, fontWeight: "500" },
  eventPreviewTime: { fontSize: 14 },
  timeInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: 16,
    fontWeight: "600",
  },
  messageInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: 15,
    minHeight: 100,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  infoText: { flex: 1, fontSize: 12, lineHeight: 18 },
  modalButtonGroup: { flexDirection: "row", gap: Spacing.md },
  cancelButton: { flex: 1, backgroundColor: "transparent" },
});
