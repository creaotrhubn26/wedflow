import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { EvendiIcon } from "@/components/EvendiIcon";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { AdminHeader } from "@/components/AdminHeader";
import { useTheme } from "@/hooks/useTheme";
import { useEventType } from "@/hooks/useEventType";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import {
  getAllChecklists,
  adminUpdateChecklistTask,
  adminDeleteChecklistTask,
  type AdminChecklistItem,
} from "@/lib/api-admin-checklist";
import { showConfirm } from "@/lib/dialogs";

const ADMIN_SECRET = process.env.EXPO_PUBLIC_ADMIN_SECRET || "dev-admin-secret";

const CATEGORY_INFO: Record<string, { name: string; color: string }> = {
  planning: { name: "Planlegging", color: "#64B5F6" },
  vendors: { name: "Leverandører", color: "#81C784" },
  attire: { name: "Antrekk", color: "#BA68C8" },
  logistics: { name: "Logistikk", color: "#FFB74D" },
  final: { name: "Siste uken", color: "#E57373" },
};

export default function AdminChecklistsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { isWedding } = useEventType();
  const queryClient = useQueryClient();

  const [selectedCouple, setSelectedCouple] = useState<string | null>(null);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());

  const { data: checklists = [], isLoading } = useQuery<AdminChecklistItem[]>({
    queryKey: ["admin-checklists"],
    queryFn: () => getAllChecklists(ADMIN_SECRET),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ taskId, completed }: { taskId: string; completed: boolean }) =>
      adminUpdateChecklistTask(ADMIN_SECRET, taskId, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-checklists"] });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (taskId: string) => adminDeleteChecklistTask(ADMIN_SECRET, taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-checklists"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const handleToggle = (taskId: string, completed: boolean) => {
    toggleMutation.mutate({ taskId, completed: !completed });
  };

  const handleDelete = (taskId: string, taskTitle: string) => {
    showConfirm({
      title: "Slett oppgave",
      message: `Er du sikker på at du vil slette "${taskTitle}"?`,
      confirmLabel: "Slett",
      cancelLabel: "Avbryt",
      destructive: true,
    }).then((confirmed) => {
      if (confirmed) deleteMutation.mutate(taskId);
    });
  };

  const toggleTaskExpanded = (taskId: string) => {
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Group by couple
  const coupleGroups = checklists.reduce<Record<string, { 
    coupleName: string;
    coupleEmail: string;
    weddingDate: string | null;
    tasks: AdminChecklistItem[];
  }>>((acc, item) => {
    if (!acc[item.coupleId]) {
      acc[item.coupleId] = {
        coupleName: item.coupleName,
        coupleEmail: item.coupleEmail,
        weddingDate: item.weddingDate,
        tasks: [],
      };
    }
    acc[item.coupleId].tasks.push(item);
    return acc;
  }, {});

  const couples = Object.entries(coupleGroups);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.dark.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
      <AdminHeader 
        title="Sjekklister" 
        subtitle={`${couples.length} ${isWedding ? "par" : "kunder"} med sjekklister`}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
      >
        {couples.map(([coupleId, data], index) => {
        const completed = data.tasks.filter((task) => task.taskCompleted).length;
        const total = data.tasks.length;
        const progress = total > 0 ? (completed / total) * 100 : 0;
        const isExpanded = selectedCouple === coupleId;

        return (
          <Animated.View key={coupleId} entering={FadeInDown.delay(100 + index * 50).duration(400)}>
            <Pressable
              onPress={() => {
                setSelectedCouple(isExpanded ? null : coupleId);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.coupleCard,
                {
                  backgroundColor: theme.backgroundDefault,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.coupleHeader}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.coupleName}>{data.coupleName}</ThemedText>
                  <ThemedText style={{ color: theme.textSecondary, fontSize: 13, marginTop: 2 }}>
                    {data.coupleEmail}
                  </ThemedText>
                  {data.weddingDate && (
                    <ThemedText style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>
                      📅 {new Date(data.weddingDate).toLocaleDateString("nb-NO")}
                    </ThemedText>
                  )}
                </View>
                <View style={styles.progressInfo}>
                  <ThemedText style={[styles.progressPercent, { color: Colors.dark.accent }]}>
                    {Math.round(progress)}%
                  </ThemedText>
                  <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>
                    {completed}/{total}
                  </ThemedText>
                </View>
              </View>

              <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
                <View
                  style={[
                    styles.progressFill,
                    { backgroundColor: Colors.dark.accent, width: `${progress}%` },
                  ]}
                />
              </View>

              {isExpanded && (
                <View style={{ marginTop: Spacing.md }}>
                  {data.tasks.map((task) => {
                    const catInfo = CATEGORY_INFO[task.taskCategory] || CATEGORY_INFO.planning;
                    const isTaskExpanded = expandedTasks.has(task.taskId);

                    return (
                      <View
                        key={task.taskId}
                        style={[
                          styles.taskCard,
                          {
                            backgroundColor: theme.backgroundSecondary,
                            borderColor: theme.border,
                            opacity: task.taskCompleted ? 0.6 : 1,
                          },
                        ]}
                      >
                        <Pressable
                          onPress={() => handleToggle(task.taskId, task.taskCompleted)}
                          style={styles.taskMain}
                        >
                          <View
                            style={[
                              styles.checkbox,
                              {
                                backgroundColor: task.taskCompleted
                                  ? Colors.dark.accent
                                  : "transparent",
                                borderColor: task.taskCompleted
                                  ? Colors.dark.accent
                                  : theme.border,
                              },
                            ]}
                          >
                            {task.taskCompleted && <EvendiIcon name="check" size={12} color="#1A1A1A" />}
                          </View>
                          <View style={{ flex: 1 }}>
                            <ThemedText
                              style={[
                                styles.taskTitle,
                                task.taskCompleted && styles.taskCompleted,
                              ]}
                            >
                              {task.taskTitle}
                            </ThemedText>
                            <View style={styles.taskMeta}>
                              <View
                                style={[
                                  styles.categoryBadge,
                                  { backgroundColor: catInfo.color + "20" },
                                ]}
                              >
                                <ThemedText
                                  style={{ fontSize: 12, fontWeight: "500", color: catInfo.color }}
                                >
                                  {catInfo.name}
                                </ThemedText>
                              </View>
                              <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>
                                {task.taskMonthsBefore} mnd før
                              </ThemedText>
                              {task.taskIsDefault && (
                                <View
                                  style={[
                                    styles.defaultBadge,
                                    { backgroundColor: theme.backgroundRoot },
                                  ]}
                                >
                                  <ThemedText style={{ fontSize: 9, color: theme.textSecondary }}>
                                    Standard
                                  </ThemedText>
                                </View>
                              )}
                            </View>
                            {task.taskNotes && (
                              <ThemedText
                                style={{
                                  color: theme.textSecondary,
                                  fontSize: 11,
                                  marginTop: 4,
                                  fontStyle: "italic",
                                }}
                                numberOfLines={isTaskExpanded ? undefined : 1}
                              >
                                {task.taskNotes}
                              </ThemedText>
                            )}
                          </View>
                        </Pressable>

                        <View style={styles.taskActions}>
                          {task.taskNotes && (
                            <Pressable
                              onPress={() => toggleTaskExpanded(task.taskId)}
                              style={[styles.actionButton, { backgroundColor: theme.backgroundRoot }]}
                            >
                              <EvendiIcon
                                name={isTaskExpanded ? "chevron-up" : "chevron-down"}
                                size={16}
                                color={theme.textSecondary}
                              />
                            </Pressable>
                          )}
                          {!task.taskIsDefault && (
                            <Pressable
                              onPress={() => handleDelete(task.taskId, task.taskTitle)}
                              style={[styles.actionButton, { backgroundColor: theme.error + "20" }]}
                            >
                              <EvendiIcon name="trash-2" size={14} color={theme.error} />
                            </Pressable>
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              )}
            </Pressable>
          </Animated.View>
        );
      })}

      {couples.length === 0 && (
        <View style={styles.emptyState}>
          <EvendiIcon name="clipboard" size={64} color={theme.textSecondary} />
          <ThemedText style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
            Ingen sjekklister funnet
          </ThemedText>
        </View>
      )}
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  header: { marginBottom: Spacing.lg },
  coupleCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  coupleHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  coupleName: { fontSize: 16, fontWeight: "600" },
  progressInfo: { alignItems: "flex-end" },
  progressPercent: { fontSize: 20, fontWeight: "700" },
  progressBar: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  taskCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: "hidden",
  },
  taskMain: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  taskTitle: { fontSize: 14, fontWeight: "500" },
  taskCompleted: { textDecorationLine: "line-through" },
  taskMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
    flexWrap: "wrap",
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  defaultBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  taskActions: {
    flexDirection: "row",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
  },
});
