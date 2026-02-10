import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { EvendiIcon } from "@/components/EvendiIcon";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

// ─────────────────────── Types ──────────────────────────

interface TimelineEvent {
  id: string;
  title: string;
  event_time: string | null;
  duration_minutes: number;
  description: string;
  location: string;
  status: string;
  can_client_edit: boolean;
}

interface TimelineComment {
  id: string;
  author_type: string;
  author_name: string;
  message: string;
  is_private: boolean;
  created_at: string;
}

interface Timeline {
  id: string;
  title: string;
  wedding_date: string | null;
  venue: string | null;
  couple_name: string | null;
  cultural_type: string | null;
  status: string;
  photographer_message: string | null;
  client_notes: string | null;
}

interface Project {
  id: string;
  title: string;
  category: string;
  status: string;
  createdAt: string;
  timeline: Timeline | null;
  events: TimelineEvent[];
  comments: TimelineComment[];
  shotList: any[];
}

interface BridgeData {
  success: boolean;
  coupleId: string;
  coupleName: string;
  coupleEmail: string;
  projects: Project[];
  conversationId: string;
}

interface Props {
  sessionToken: string;
  coupleId: string;
  onOpenChat?: (conversationId: string) => void;
}

// ─────────────────────── Component ──────────────────────

export default function VendorCreatorHubBridge({ sessionToken, coupleId, onOpenChat }: Props) {
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<"timeline" | "comments" | "shots">("timeline");
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");

  // ── Fetch bridge data ──
  const { data, isLoading, isError, refetch } = useQuery<BridgeData>({
    queryKey: ["vendor-creatorhub-bridge", coupleId],
    queryFn: async () => {
      const res = await fetch(
        new URL(`/api/vendor/creatorhub-bridge?coupleId=${coupleId}`, getApiUrl()).toString(),
        { headers: { Authorization: `Bearer ${sessionToken}` } }
      );
      if (!res.ok) throw new Error("Kunne ikke hente prosjektdata");
      return res.json();
    },
    enabled: !!sessionToken && !!coupleId,
  });

  // ── Add comment mutation ──
  const addCommentMutation = useMutation({
    mutationFn: async ({ timelineId, message }: { timelineId: string; message: string }) => {
      const res = await fetch(
        new URL(`/api/vendor/timeline-comments/${timelineId}`, getApiUrl()).toString(),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message, isPrivate: false }),
        }
      );
      if (!res.ok) throw new Error("Kunne ikke legge til kommentar");
      return res.json();
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["vendor-creatorhub-bridge", coupleId] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => {
      Alert.alert("Feil", "Kunne ikke legge til kommentar");
    },
  });

  // ── Add event mutation ──
  const addEventMutation = useMutation({
    mutationFn: async ({
      timelineId,
      title,
      eventTime,
      location,
    }: {
      timelineId: string;
      title: string;
      eventTime?: string;
      location?: string;
    }) => {
      const res = await fetch(
        new URL(`/api/vendor/timeline-events/${timelineId}`, getApiUrl()).toString(),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, eventTime, durationMinutes: 30, description: "", location }),
        }
      );
      if (!res.ok) throw new Error("Kunne ikke legge til hendelse");
      return res.json();
    },
    onSuccess: () => {
      setNewEventTitle("");
      setNewEventTime("");
      setNewEventLocation("");
      queryClient.invalidateQueries({ queryKey: ["vendor-creatorhub-bridge", coupleId] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => {
      Alert.alert("Feil", "Kunne ikke legge til hendelse");
    },
  });

  const handleAddComment = useCallback(
    (timelineId: string) => {
      if (!commentText.trim()) return;
      addCommentMutation.mutate({ timelineId, message: commentText.trim() });
    },
    [commentText, addCommentMutation]
  );

  const handleAddEvent = useCallback(
    (timelineId: string) => {
      if (!newEventTitle.trim()) return;
      addEventMutation.mutate({
        timelineId,
        title: newEventTitle.trim(),
        eventTime: newEventTime || undefined,
        location: newEventLocation || undefined,
      });
    },
    [newEventTitle, newEventTime, newEventLocation, addEventMutation]
  );

  const formatTime = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
  };

  const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString("nb-NO", { day: "numeric", month: "short" })} ${formatTime(dateStr)}`;
  };

  // ── Loading / Error states ──
  if (isLoading) {
    return (
      <View style={[styles.center, { paddingVertical: Spacing.xl }]}>
        <ActivityIndicator size="large" color={theme.accent} />
        <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
          Laster prosjektdata fra CreatorHub...
        </ThemedText>
      </View>
    );
  }

  if (isError || !data?.projects?.length) {
    return (
      <Animated.View entering={FadeInDown.delay(100)} style={[styles.emptyCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <EvendiIcon name="folder" size={32} color={theme.textSecondary} />
        <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
          Ingen CreatorHub-prosjekter
        </ThemedText>
        <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
          Det finnes ingen prosjekter knyttet til dette paret ennå.
        </ThemedText>
        <Button
          onPress={() => refetch()}
          style={{ marginTop: Spacing.md }}
        >
          Prøv igjen
        </Button>
      </Animated.View>
    );
  }

  // ── Render project section ──
  const renderProject = (project: Project, index: number) => {
    const isExpanded = expandedProject === project.id || data.projects.length === 1;
    const timeline = project.timeline;
    const hasTimeline = !!timeline;

    return (
      <Animated.View
        key={project.id}
        entering={FadeInDown.delay(100 + index * 80)}
        style={[styles.projectCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
      >
        {/* Project header */}
        <Pressable
          onPress={() => {
            setExpandedProject(isExpanded && data.projects.length > 1 ? null : project.id);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={styles.projectHeader}
        >
          <View style={styles.projectHeaderLeft}>
            <EvendiIcon name="briefcase" size={20} color={theme.accent} />
            <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
              <ThemedText style={[styles.projectTitle, { color: theme.text }]}>
                {project.title}
              </ThemedText>
              {timeline?.wedding_date && (
                <ThemedText style={[styles.projectDate, { color: theme.textSecondary }]}>
                  {formatDate(timeline.wedding_date)} · {timeline.venue || "Ukjent sted"}
                </ThemedText>
              )}
            </View>
          </View>
          <EvendiIcon name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={theme.textSecondary} />
        </Pressable>

        {/* Expanded content */}
        {isExpanded && hasTimeline && (
          <View style={styles.expandedContent}>
            {/* Culture badge */}
            {timeline.cultural_type && (
              <View style={[styles.cultureBadge, { backgroundColor: theme.accent + "20" }]}>
                <EvendiIcon name="globe" size={14} color={theme.accent} />
                <ThemedText style={[styles.cultureBadgeText, { color: theme.accent }]}>
                  {timeline.cultural_type.charAt(0).toUpperCase() + timeline.cultural_type.slice(1)} bryllup
                </ThemedText>
              </View>
            )}

            {/* Section tabs */}
            <View style={[styles.tabRow, { borderColor: theme.border }]}>
              {(["timeline", "comments", "shots"] as const).map((tab) => (
                <Pressable
                  key={tab}
                  onPress={() => {
                    setActiveSection(tab);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.tab,
                    activeSection === tab && { borderBottomColor: theme.accent, borderBottomWidth: 2 },
                  ]}
                >
                  <EvendiIcon
                    name={tab === "timeline" ? "clock" : tab === "comments" ? "message-circle" : "camera"}
                    size={16}
                    color={activeSection === tab ? theme.accent : theme.textSecondary}
                  />
                  <ThemedText
                    style={[
                      styles.tabText,
                      { color: activeSection === tab ? theme.accent : theme.textSecondary },
                    ]}
                  >
                    {tab === "timeline" ? "Tidslinje" : tab === "comments" ? `Kommentarer (${project.comments.length})` : `Shotliste (${project.shotList.length})`}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            {/* Timeline events */}
            {activeSection === "timeline" && (
              <View style={styles.section}>
                <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
                  <EvendiIcon name="clock" size={16} /> Bryllupstidslinje ({project.events.length} hendelser)
                </ThemedText>

                {project.events.map((evt) => (
                  <View key={evt.id} style={[styles.eventRow, { borderColor: theme.border }]}>
                    <View style={[styles.eventDot, { backgroundColor: theme.accent }]} />
                    <View style={styles.eventContent}>
                      <ThemedText style={[styles.eventTitle, { color: theme.text }]}>
                        {evt.title}
                      </ThemedText>
                      <View style={styles.eventMeta}>
                        {evt.event_time && (
                          <ThemedText style={[styles.eventTime, { color: theme.textSecondary }]}>
                            <EvendiIcon name="clock" size={12} /> {formatTime(evt.event_time)}
                          </ThemedText>
                        )}
                        {evt.duration_minutes > 0 && (
                          <ThemedText style={[styles.eventDuration, { color: theme.textSecondary }]}>
                            {evt.duration_minutes} min
                          </ThemedText>
                        )}
                        {evt.location ? (
                          <ThemedText style={[styles.eventLocation, { color: theme.textSecondary }]}>
                            <EvendiIcon name="map-pin" size={12} /> {evt.location}
                          </ThemedText>
                        ) : null}
                      </View>
                    </View>
                  </View>
                ))}

                {/* Add event form */}
                <View style={[styles.addForm, { borderColor: theme.border }]}>
                  <ThemedText style={[styles.addFormTitle, { color: theme.text }]}>
                    <EvendiIcon name="plus-circle" size={14} /> Legg til hendelse
                  </ThemedText>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                    placeholder="Tittel (f.eks. Detaljbilder sko)"
                    placeholderTextColor={theme.textSecondary}
                    value={newEventTitle}
                    onChangeText={setNewEventTitle}
                  />
                  <View style={styles.inputRow}>
                    <TextInput
                      style={[styles.input, styles.inputHalf, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                      placeholder="Tidspunkt (f.eks. 11:30)"
                      placeholderTextColor={theme.textSecondary}
                      value={newEventTime}
                      onChangeText={setNewEventTime}
                    />
                    <TextInput
                      style={[styles.input, styles.inputHalf, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                      placeholder="Sted"
                      placeholderTextColor={theme.textSecondary}
                      value={newEventLocation}
                      onChangeText={setNewEventLocation}
                    />
                  </View>
                  <Button
                    onPress={() => handleAddEvent(timeline.id)}
                    disabled={!newEventTitle.trim() || addEventMutation.isPending}
                    style={{ marginTop: Spacing.xs }}
                  >
                    {addEventMutation.isPending ? "Legger til..." : "Legg til i tidslinje"}
                  </Button>
                </View>
              </View>
            )}

            {/* Comments section */}
            {activeSection === "comments" && (
              <View style={styles.section}>
                <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
                  <EvendiIcon name="message-circle" size={16} /> Kommentarer til tidslinjen
                </ThemedText>

                {project.comments.length === 0 ? (
                  <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary, marginBottom: Spacing.md }]}>
                    Ingen kommentarer ennå. Legg til den første!
                  </ThemedText>
                ) : (
                  project.comments.map((comment) => (
                    <View
                      key={comment.id}
                      style={[
                        styles.commentCard,
                        {
                          backgroundColor: comment.author_type === "vendor" ? theme.accent + "10" : theme.background,
                          borderColor: comment.author_type === "vendor" ? theme.accent + "30" : theme.border,
                        },
                      ]}
                    >
                      <View style={styles.commentHeader}>
                        <EvendiIcon
                          name={comment.author_type === "vendor" ? "camera" : "heart"}
                          size={14}
                          color={comment.author_type === "vendor" ? theme.accent : "#E91E63"}
                        />
                        <ThemedText style={[styles.commentAuthor, { color: theme.text }]}>
                          {comment.author_name}
                        </ThemedText>
                        <ThemedText style={[styles.commentTime, { color: theme.textSecondary }]}>
                          {formatDateTime(comment.created_at)}
                        </ThemedText>
                      </View>
                      <ThemedText style={[styles.commentMessage, { color: theme.text }]}>
                        {comment.message}
                      </ThemedText>
                    </View>
                  ))
                )}

                {/* Add comment form */}
                <View style={[styles.commentInputRow, { borderColor: theme.border }]}>
                  <TextInput
                    style={[styles.commentInput, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                    placeholder="Skriv en kommentar til tidslinjen..."
                    placeholderTextColor={theme.textSecondary}
                    value={commentText}
                    onChangeText={setCommentText}
                    multiline
                    maxLength={500}
                  />
                  <Pressable
                    onPress={() => handleAddComment(timeline.id)}
                    disabled={!commentText.trim() || addCommentMutation.isPending}
                    style={[
                      styles.sendButton,
                      { backgroundColor: commentText.trim() ? theme.accent : theme.border },
                    ]}
                  >
                    {addCommentMutation.isPending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <EvendiIcon name="send" size={18} color="#fff" />
                    )}
                  </Pressable>
                </View>
              </View>
            )}

            {/* Shot list section */}
            {activeSection === "shots" && (
              <View style={styles.section}>
                <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
                  <EvendiIcon name="camera" size={16} /> Shotliste fra CreatorHub
                </ThemedText>

                {project.shotList.length === 0 ? (
                  <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                    Ingen shots planlagt ennå i CreatorHub.
                  </ThemedText>
                ) : (
                  project.shotList.map((shot: any, i: number) => (
                    <View key={shot.id || i} style={[styles.shotRow, { borderColor: theme.border }]}>
                      <EvendiIcon name="aperture" size={16} color={theme.accent} />
                      <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
                        <ThemedText style={[styles.shotTitle, { color: theme.text }]}>
                          {shot.title || shot.description || `Shot ${i + 1}`}
                        </ThemedText>
                        {shot.scene && (
                          <ThemedText style={[styles.shotScene, { color: theme.textSecondary }]}>
                            {shot.scene}
                          </ThemedText>
                        )}
                      </View>
                      {shot.priority && (
                        <View style={[styles.priorityBadge, { backgroundColor: shot.priority === "high" ? "#E91E63" : theme.accent }]}>
                          <ThemedText style={styles.priorityText}>
                            {shot.priority === "high" ? "Viktig" : "Normal"}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  ))
                )}
              </View>
            )}

            {/* Chat shortcut */}
            {data.conversationId && onOpenChat && (
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onOpenChat(data.conversationId);
                }}
                style={[styles.chatButton, { backgroundColor: theme.accent }]}
              >
                <EvendiIcon name="message-square" size={18} color="#fff" />
                <ThemedText style={styles.chatButtonText}>Chat med {data.coupleName || "paret"}</ThemedText>
              </Pressable>
            )}
          </View>
        )}

        {/* Expanded but no timeline */}
        {isExpanded && !hasTimeline && (
          <View style={styles.expandedContent}>
            <View style={[styles.emptyCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <EvendiIcon name="calendar" size={24} color={theme.textSecondary} />
              <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
                Ingen tidslinje opprettet for dette prosjektet ennå.
              </ThemedText>
            </View>
          </View>
        )}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown}
        style={[styles.headerCard, { backgroundColor: theme.accent + "10", borderColor: theme.accent + "30" }]}
      >
        <View style={styles.headerRow}>
          <EvendiIcon name="link" size={20} color={theme.accent} />
          <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
            <ThemedText style={[styles.headerTitle, { color: theme.text }]}>
              CreatorHub-kobling
            </ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              {data.coupleName || data.coupleEmail} · {data.projects.length} prosjekt{data.projects.length > 1 ? "er" : ""}
            </ThemedText>
          </View>
        </View>
      </Animated.View>

      {/* Projects */}
      {data.projects.map((project, i) => renderProject(project, i))}
    </View>
  );
}

// ─────────────────────── Styles ──────────────────────────

const styles = StyleSheet.create({
  container: {
    gap: Spacing.md,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: 14,
  },

  // Header
  headerCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  // Project card
  projectCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  projectHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
  },
  projectHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  projectTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  projectDate: {
    fontSize: 12,
    marginTop: 2,
  },

  // Culture
  cultureBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
    gap: 4,
  },
  cultureBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },

  expandedContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },

  // Tabs
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    marginBottom: Spacing.md,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    marginRight: Spacing.sm,
    gap: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "600",
  },

  // Section
  section: {
    gap: Spacing.xs,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },

  // Events
  eventRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  eventDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  eventContent: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  eventMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: 2,
  },
  eventTime: {
    fontSize: 12,
  },
  eventDuration: {
    fontSize: 12,
  },
  eventLocation: {
    fontSize: 12,
  },

  // Add event form
  addForm: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  addFormTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  inputHalf: {
    flex: 1,
  },

  // Comments
  commentCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  commentAuthor: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  commentTime: {
    fontSize: 11,
  },
  commentMessage: {
    fontSize: 14,
    lineHeight: 20,
  },
  commentInputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    fontSize: 14,
    maxHeight: 100,
    minHeight: 40,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  // Shots
  shotRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  shotTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  shotScene: {
    fontSize: 12,
    marginTop: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#fff",
  },

  // Chat
  chatButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
  },
  chatButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },

  // Empty
  emptyCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: "center",
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: "center",
  },
});
