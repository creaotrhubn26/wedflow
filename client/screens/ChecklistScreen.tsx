import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, StyleSheet, View, Pressable, Alert, TextInput, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { SwipeableRow } from "@/components/SwipeableRow";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getWeddingDetails, getCoupleSession } from "@/lib/storage";
import { getChecklistTasks, updateChecklistTask, createChecklistTask, deleteChecklistTask, seedDefaultChecklist } from "@/lib/api-checklist";
import { getCoupleProfile } from "@/lib/api-couples";
import { TRADITION_CHECKLIST_ITEMS, CULTURAL_LABELS } from "@/constants/tradition-data";
import { migrateChecklistFromAsyncStorage, needsMigration } from "@/lib/checklist-migration";
import type { ChecklistTask } from "@shared/schema";

const CATEGORY_INFO: Record<string, { name: string; icon: keyof typeof Feather.glyphMap; color: string }> = {
  planning: { name: "Planlegging", icon: "clipboard", color: "#64B5F6" },
  vendors: { name: "Leverandører", icon: "briefcase", color: "#81C784" },
  attire: { name: "Antrekk", icon: "award", color: "#BA68C8" },
  logistics: { name: "Logistikk", icon: "truck", color: "#FFB74D" },
  final: { name: "Siste uken", icon: "check-circle", color: "#E57373" },
};

export default function ChecklistScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [monthsLeft, setMonthsLeft] = useState(12);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<"all" | "thisMonth" | "overdue" | "highPriority">("all");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTask, setEditingTask] = useState<ChecklistTask | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editMonthsBefore, setEditMonthsBefore] = useState(12);
  const [editCategory, setEditCategory] = useState<"planning" | "vendors" | "attire" | "logistics" | "final">("planning");
  const [editNotes, setEditNotes] = useState("");
  const [editAssignedTo, setEditAssignedTo] = useState<"me" | "partner" | "both">("both");

  useEffect(() => {
    async function loadSession() {
      const session = await getCoupleSession();
      if (session) {
        setSessionToken(session.token);
      }
    }
    loadSession();
  }, []);

  useEffect(() => {
    async function loadWeddingDate() {
      const weddingData = await getWeddingDetails();
      if (weddingData) {
        const weddingDate = new Date(weddingData.weddingDate);
        const today = new Date();
        const diffTime = weddingDate.getTime() - today.getTime();
        const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
        setMonthsLeft(Math.max(0, diffMonths));
      }
    }
    loadWeddingDate();
  }, []);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["checklist"],
    queryFn: () => sessionToken ? getChecklistTasks(sessionToken) : [],
    enabled: !!sessionToken,
  });

  // Check for migration on mount
  useEffect(() => {
    async function checkMigration() {
      if (!sessionToken) return;
      
      const hasTasks = tasks.length > 0;
      const needsDataMigration = await needsMigration();
      
      if (!hasTasks && needsDataMigration) {
        Alert.alert(
          "Migrer eksisterende data",
          "Vi fant sjekkliste-data lagret lokalt. Vil du flytte den til serveren?",
          [
            { text: "Avbryt", style: "cancel" },
            {
              text: "Migrer",
              onPress: async () => {
                const success = await migrateChecklistFromAsyncStorage(sessionToken);
                if (success) {
                  queryClient.invalidateQueries({ queryKey: ["checklist"] });
                  Alert.alert("Suksess", "Data ble migrert!");
                }
              },
            },
          ]
        );
      }
    }
    
    if (!isLoading) {
      checkMigration();
    }
  }, [sessionToken, tasks.length, isLoading]);


  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateChecklistTask(sessionToken!, id, { completed }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });

  const seedMutation = useMutation({
    mutationFn: () => seedDefaultChecklist(sessionToken!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
    },
  });

  // Couple profile for traditions
  const { data: coupleProfile } = useQuery({
    queryKey: ['coupleProfile'],
    queryFn: async () => {
      if (!sessionToken) throw new Error('No session');
      return getCoupleProfile(sessionToken);
    },
    enabled: !!sessionToken,
  });

  // Seed tradition-specific checklist tasks
  const handleSeedTraditions = async () => {
    const traditions = coupleProfile?.selectedTraditions || [];
    if (traditions.length === 0) {
      Alert.alert("Ingen tradisjoner", "Velg tradisjoner i profilen din først.");
      return;
    }
    Alert.alert(
      "Legg til tradisjonsoppgaver",
      `Legger til oppgaver for: ${traditions.map(t => CULTURAL_LABELS[t] || t).join(', ')}`,
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Legg til",
          onPress: async () => {
            try {
              for (const t of traditions) {
                const tItems = TRADITION_CHECKLIST_ITEMS[t.toLowerCase()] || [];
                for (const item of tItems) {
                  // Skip duplicates
                  if (tasks.some(existing => existing.title === item.title)) continue;
                  await createChecklistTask(sessionToken!, {
                    title: item.title,
                    monthsBefore: item.monthsBefore,
                    category: item.category as any,
                  });
                }
              }
              queryClient.invalidateQueries({ queryKey: ["checklist"] });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (e) {
              Alert.alert("Feil", "Kunne ikke legge til tradisjonsoppgaver");
            }
          },
        },
      ]
    );
  };

  const createMutation = useMutation({
    mutationFn: (title: string) =>
      createChecklistTask(sessionToken!, {
        title,
        monthsBefore: 12,
        category: "planning",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
      setShowAddModal(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteChecklistTask(sessionToken!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ChecklistTask> }) =>
      updateChecklistTask(sessionToken!, id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
      setEditingTask(null);
    },
  });

  const handleToggle = (id: string, completed: boolean) => {
    toggleMutation.mutate({ id, completed: !completed });
  };

  const handleSeedDefaults = () => {
    Alert.alert(
      "Opprett standardsjekkliste",
      "Dette vil legge til 24 standardoppgaver. Fortsette?",
      [
        { text: "Avbryt", style: "cancel" },
        { text: "Opprett", onPress: () => seedMutation.mutate() },
      ]
    );
  };

  const handleAddTask = () => {
    if (editTitle.trim()) {
      createMutation.mutate(editTitle.trim());
      setEditTitle("");
    }
  };

  const applyQuickPreset = (preset: { title: string; category: "planning" | "vendors" | "attire" | "logistics" | "final"; monthsBefore: number }) => {
    setEditTitle(preset.title);
    setEditCategory(preset.category);
    setEditMonthsBefore(preset.monthsBefore);
    setEditNotes("");
    setEditAssignedTo("both");
    setShowAddModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleEditTask = (task: ChecklistTask) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditMonthsBefore(task.monthsBefore);
    setEditCategory(task.category as any);
    setEditNotes(task.notes || "");
    setEditAssignedTo(task.assignedTo ? "partner" : "both");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleSaveEdit = () => {
    if (!editingTask || !editTitle.trim()) return;
    
    updateMutation.mutate({
      id: editingTask.id,
      updates: {
        title: editTitle,
        monthsBefore: editMonthsBefore,
        category: editCategory,
        notes: editNotes || null,
        assignedTo: editAssignedTo === "both" ? null : sessionToken,
      },
    });
  };

  const handleDeleteTask = (task: ChecklistTask) => {
    if (task.isDefault) {
      Alert.alert("Kan ikke slette", "Standardoppgaver kan ikke slettes");
      return;
    }
    
    Alert.alert(
      "Slett oppgave",
      `Er du sikker på at du vil slette "${task.title}"?`,
      [
        { text: "Avbryt", style: "cancel" },
        { 
          text: "Slett", 
          style: "destructive",
          onPress: () => deleteMutation.mutate(task.id)
        },
      ]
    );
  };

  if (!sessionToken) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText style={{ color: theme.textSecondary }}>Logg inn for å se sjekkliste</ThemedText>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText style={{ color: theme.textSecondary }}>Laster...</ThemedText>
      </View>
    );
  }

  if (tasks.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <Feather name="clipboard" size={64} color={theme.textSecondary} />
        <ThemedText type="h3" style={{ marginTop: Spacing.lg }}>Tom sjekkliste</ThemedText>
        <ThemedText style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm, marginHorizontal: Spacing.xl }}>
          Opprett standardoppgaver eller legg til dine egne
        </ThemedText>
        <Pressable
          onPress={handleSeedDefaults}
          style={[styles.button, { backgroundColor: Colors.dark.accent, marginTop: Spacing.lg }]}
        >
          <ThemedText style={{ color: "#1A1A1A", fontWeight: "600" }}>Opprett standardsjekkliste</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => { setEditTitle(""); setShowAddModal(true); }}
          style={[styles.button, { backgroundColor: theme.backgroundDefault, borderWidth: 1, borderColor: theme.border, marginTop: Spacing.md }]}
        >
          <ThemedText style={{ color: theme.text, fontWeight: "600" }}>Legg til oppgave</ThemedText>
        </Pressable>
      </View>
    );
  }

  const completedCount = tasks.filter((i) => i.completed).length;
  const progress = (completedCount / tasks.length) * 100;

  const categoryFiltered = filterCategory
    ? tasks.filter((i) => i.category === filterCategory)
    : tasks;

  // Apply quick filter
  const quickFiltered = categoryFiltered.filter((t) => {
    switch (quickFilter) {
      case "thisMonth":
        return t.monthsBefore >= monthsLeft && t.monthsBefore <= monthsLeft + 1;
      case "overdue":
        return t.monthsBefore > monthsLeft && !t.completed;
      case "highPriority":
        return t.monthsBefore >= monthsLeft - 1 && t.monthsBefore <= monthsLeft + 1 && !t.completed;
      default:
        return true;
    }
  });
  
  const completedItems = quickFiltered.filter((t) => t.completed);
  const uncompletedItems = quickFiltered.filter((t) => !t.completed);
  const filteredItems = [...uncompletedItems, ...completedItems];

  const urgentItems = tasks.filter((i) => !i.completed && i.monthsBefore >= monthsLeft);

  const getUrgencyColor = (monthsBefore: number) => {
    if (monthsBefore > monthsLeft) return theme.error;
    if (monthsBefore >= monthsLeft - 1) return "#FFB74D";
    return theme.textSecondary;
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View style={[styles.progressCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.progressHeader}>
            <ThemedText type="h3">Din fremgang</ThemedText>
            <ThemedText style={[styles.progressPercent, { color: Colors.dark.accent }]}>
              {Math.round(progress)}%
            </ThemedText>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={[styles.progressFill, { backgroundColor: Colors.dark.accent, width: `${progress}%` }]} />
          </View>
          <ThemedText style={[styles.progressSubtext, { color: theme.textSecondary }]}>
            {completedCount} av {tasks.length} oppgaver fullført
          </ThemedText>
        </View>
      </Animated.View>

      {/* Tradition checklist import */}
      {(coupleProfile?.selectedTraditions?.length ?? 0) > 0 && (
        <Animated.View entering={FadeInDown.delay(180).duration(300)}>
          <Pressable
            onPress={handleSeedTraditions}
            style={[styles.urgentCard, { backgroundColor: '#FFB30020', borderColor: '#FFB300', flexDirection: 'row', alignItems: 'center' }]}
          >
            <Feather name="globe" size={18} color="#FFB300" />
            <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
              <ThemedText style={{ color: '#FFB300', fontWeight: '600', fontSize: 14 }}>
                Legg til tradisjonsoppgaver
              </ThemedText>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                {coupleProfile?.selectedTraditions?.map(t => CULTURAL_LABELS[t] || t).join(', ')}
              </ThemedText>
            </View>
            <Feather name="plus-circle" size={18} color="#FFB300" />
          </Pressable>
        </Animated.View>
      )}

      {urgentItems.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={[styles.urgentCard, { backgroundColor: theme.error + "20", borderColor: theme.error }]}>
            <Feather name="alert-triangle" size={20} color={theme.error} />
            <View style={styles.urgentContent}>
              <ThemedText style={[styles.urgentTitle, { color: theme.error }]}>
                {urgentItems.length} oppgave{urgentItems.length > 1 ? "r" : ""} på overtid
              </ThemedText>
              <ThemedText style={[styles.urgentText, { color: theme.textSecondary }]}>
                {urgentItems.slice(0, 2).map((i) => i.title).join(", ")}
              </ThemedText>
            </View>
          </View>
        </Animated.View>
      ) : null}

      {/* Quick Preset Templates */}
      <Animated.View entering={FadeInDown.delay(250).duration(400)}>
        <View style={styles.presetsSection}>
          <ThemedText style={[styles.presetsLabel, { color: theme.textMuted }]}>Hurtigvalg</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsScroll}>
            {[
              { value: "all" as const, label: "Alle", icon: "list" as const },
              { value: "thisMonth" as const, label: "Denne måneden", icon: "calendar" as const },
              { value: "overdue" as const, label: "Forsinkede", icon: "alert-circle" as const },
              { value: "highPriority" as const, label: "Høy prioritet", icon: "zap" as const },
            ].map((preset) => (
              <Pressable
                key={preset.value}
                onPress={() => {
                  setQuickFilter(preset.value);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.presetChip,
                  {
                    backgroundColor: quickFilter === preset.value ? Colors.dark.accent : theme.backgroundSecondary,
                    borderColor: quickFilter === preset.value ? Colors.dark.accent : theme.border,
                  },
                ]}
              >
                <Feather
                  name={preset.icon}
                  size={14}
                  color={quickFilter === preset.value ? "#1A1A1A" : theme.textMuted}
                />
                <ThemedText
                  style={[
                    styles.presetText,
                    { color: quickFilter === preset.value ? "#1A1A1A" : theme.textSecondary },
                  ]}
                >
                  {preset.label}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>
        
        {/* Quick Add Templates */}
        <View style={styles.presetsSection}>
          <ThemedText style={[styles.presetsLabel, { color: theme.textMuted }]}>Legg til raskt</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsScroll}>
            {[
              { title: "Bestill brudebukett", category: "vendors" as const, monthsBefore: 3 },
              { title: "Bestill kakesmak", category: "vendors" as const, monthsBefore: 4 },
              { title: "Siste prøve antrekk", category: "attire" as const, monthsBefore: 1 },
              { title: "Send bordkart til lokale", category: "logistics" as const, monthsBefore: 1 },
            ].map((template, idx) => (
              <Pressable
                key={idx}
                onPress={() => applyQuickPreset(template)}
                style={[
                  styles.templateChip,
                  { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
                ]}
              >
                <Feather name="plus-circle" size={14} color={Colors.dark.accent} />
                <ThemedText style={[styles.templateText, { color: theme.text }]}>
                  {template.title}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryFilter}>
          <Pressable
            onPress={() => setFilterCategory(null)}
            style={[
              styles.categoryChip,
              {
                backgroundColor: filterCategory === null ? Colors.dark.accent : theme.backgroundDefault,
                borderColor: filterCategory === null ? Colors.dark.accent : theme.border,
              },
            ]}
          >
            <ThemedText style={{ color: filterCategory === null ? "#1A1A1A" : theme.text, fontSize: 13 }}>
              Alle
            </ThemedText>
          </Pressable>
          {Object.entries(CATEGORY_INFO).map(([key, info]) => (
            <Pressable
              key={key}
              onPress={() => {
                setFilterCategory(filterCategory === key ? null : key);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: filterCategory === key ? info.color : theme.backgroundDefault,
                  borderColor: filterCategory === key ? info.color : theme.border,
                },
              ]}
            >
              <Feather name={info.icon} size={14} color={filterCategory === key ? "#FFFFFF" : info.color} />
              <ThemedText style={{ color: filterCategory === key ? "#FFFFFF" : theme.text, fontSize: 13, marginLeft: 4 }}>
                {info.name}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      {filteredItems.map((item, index) => {
        const catInfo = CATEGORY_INFO[item.category];
        return (
          <Animated.View key={item.id} entering={FadeInRight.delay(400 + index * 30).duration(300)}>
            <SwipeableRow
              onEdit={() => handleEditTask(item)}
              onDelete={() => handleDeleteTask(item)}
              showEdit={true}
              showDelete={!item.isDefault}
              backgroundColor={theme.backgroundDefault}
            >
              <Pressable 
                onPress={() => handleToggle(item.id, item.completed)}
                onLongPress={() => handleEditTask(item)}
              >
                <View
                  style={[
                    styles.itemCard,
                    {
                      backgroundColor: theme.backgroundDefault,
                      borderColor: theme.border,
                      opacity: item.completed ? 0.6 : 1,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: item.completed ? Colors.dark.accent : "transparent",
                        borderColor: item.completed ? Colors.dark.accent : theme.border,
                      },
                    ]}
                  >
                    {item.completed ? <Feather name="check" size={12} color="#1A1A1A" /> : null}
                  </View>
                  <View style={styles.itemContent}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.xs }}>
                      <ThemedText style={[styles.itemTitle, item.completed && styles.itemCompleted]}>
                        {item.title}
                      </ThemedText>
                      {item.assignedTo && (
                        <View style={[styles.assignedBadge, { backgroundColor: Colors.dark.accent + "30" }]}>
                          <Feather name="user" size={10} color={Colors.dark.accent} />
                        </View>
                      )}
                    </View>
                    <View style={styles.itemMeta}>
                      <View style={[styles.categoryBadge, { backgroundColor: catInfo.color + "20" }]}>
                        <ThemedText style={[styles.categoryBadgeText, { color: catInfo.color }]}>
                          {catInfo.name}
                        </ThemedText>
                      </View>
                      <ThemedText style={[styles.monthsText, { color: getUrgencyColor(item.monthsBefore) }]}>
                        {item.monthsBefore} mnd før
                      </ThemedText>
                    </View>
                    {item.notes && (
                      <ThemedText style={[styles.notesText, { color: theme.textSecondary }]} numberOfLines={1}>
                        {item.notes}
                      </ThemedText>
                    )}
                  </View>
                </View>
              </Pressable>
            </SwipeableRow>
          </Animated.View>
        );
      })}

      <Pressable
        onPress={() => { setEditTitle(""); setShowAddModal(true); }}
        style={[styles.addButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
      >
        <Feather name="plus" size={20} color={Colors.dark.accent} />
        <ThemedText style={{ color: Colors.dark.accent, marginLeft: Spacing.sm, fontWeight: "600" }}>
          Legg til oppgave
        </ThemedText>
      </Pressable>

      {/* Add Task Modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddModal(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]} onPress={(e) => e.stopPropagation()}>
            <ThemedText type="h3" style={{ marginBottom: Spacing.md }}>Ny oppgave</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Oppgavetittel"
              placeholderTextColor={theme.textSecondary}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable onPress={() => setShowAddModal(false)} style={[styles.modalButton, { backgroundColor: theme.backgroundSecondary }]}>
                <ThemedText style={{ color: theme.text }}>Avbryt</ThemedText>
              </Pressable>
              <Pressable onPress={handleAddTask} style={[styles.modalButton, { backgroundColor: Colors.dark.accent }]}>
                <ThemedText style={{ color: "#1A1A1A", fontWeight: "600" }}>Legg til</ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Edit Task Modal */}
      <Modal visible={!!editingTask} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setEditingTask(null)}>
          <Pressable style={[styles.modalContentLarge, { backgroundColor: theme.backgroundDefault }]} onPress={(e) => e.stopPropagation()}>
            <ThemedText type="h3" style={{ marginBottom: Spacing.md }}>Rediger oppgave</ThemedText>
            
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Tittel</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Oppgavetittel"
              placeholderTextColor={theme.textSecondary}
            />

            <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.md }]}>Kategori</ThemedText>
            <View style={styles.categoryGrid}>
              {Object.entries(CATEGORY_INFO).map(([key, info]) => (
                <Pressable
                  key={key}
                  onPress={() => setEditCategory(key as any)}
                  style={[
                    styles.categoryOption,
                    {
                      backgroundColor: editCategory === key ? info.color + "30" : theme.backgroundSecondary,
                      borderColor: editCategory === key ? info.color : "transparent",
                    },
                  ]}
                >
                  <Feather name={info.icon} size={16} color={editCategory === key ? info.color : theme.textSecondary} />
                  <ThemedText style={{ fontSize: 12, marginTop: 4, color: editCategory === key ? theme.text : theme.textSecondary }}>
                    {info.name}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.md }]}>Måneder før bryllup</ThemedText>
            <View style={styles.monthsSlider}>
              {[0, 1, 2, 3, 6, 9, 12].map((months) => (
                <Pressable
                  key={months}
                  onPress={() => setEditMonthsBefore(months)}
                  style={[
                    styles.monthOption,
                    {
                      backgroundColor: editMonthsBefore === months ? Colors.dark.accent : theme.backgroundSecondary,
                    },
                  ]}
                >
                  <ThemedText style={{ color: editMonthsBefore === months ? "#1A1A1A" : theme.text, fontSize: 13 }}>
                    {months}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.md }]}>Tildel til</ThemedText>
            <View style={styles.assignmentOptions}>
              <Pressable
                onPress={() => setEditAssignedTo("both")}
                style={[
                  styles.assignmentOption,
                  {
                    backgroundColor: editAssignedTo === "both" ? Colors.dark.accent + "30" : theme.backgroundSecondary,
                    borderColor: editAssignedTo === "both" ? Colors.dark.accent : "transparent",
                  },
                ]}
              >
                <Feather name="users" size={16} color={editAssignedTo === "both" ? Colors.dark.accent : theme.textSecondary} />
                <ThemedText style={{ marginLeft: 6 }}>Begge</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setEditAssignedTo("me")}
                style={[
                  styles.assignmentOption,
                  {
                    backgroundColor: editAssignedTo === "me" ? Colors.dark.accent + "30" : theme.backgroundSecondary,
                    borderColor: editAssignedTo === "me" ? Colors.dark.accent : "transparent",
                  },
                ]}
              >
                <Feather name="user" size={16} color={editAssignedTo === "me" ? Colors.dark.accent : theme.textSecondary} />
                <ThemedText style={{ marginLeft: 6 }}>Meg</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => setEditAssignedTo("partner")}
                style={[
                  styles.assignmentOption,
                  {
                    backgroundColor: editAssignedTo === "partner" ? Colors.dark.accent + "30" : theme.backgroundSecondary,
                    borderColor: editAssignedTo === "partner" ? Colors.dark.accent : "transparent",
                  },
                ]}
              >
                <Feather name="heart" size={16} color={editAssignedTo === "partner" ? Colors.dark.accent : theme.textSecondary} />
                <ThemedText style={{ marginLeft: 6 }}>Partner</ThemedText>
              </Pressable>
            </View>

            <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.md }]}>Notater (valgfritt)</ThemedText>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder="Legg til notater..."
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <Pressable onPress={() => setEditingTask(null)} style={[styles.modalButton, { backgroundColor: theme.backgroundSecondary }]}>
                <ThemedText style={{ color: theme.text }}>Avbryt</ThemedText>
              </Pressable>
              <Pressable onPress={handleSaveEdit} style={[styles.modalButton, { backgroundColor: Colors.dark.accent }]}>
                <ThemedText style={{ color: "#1A1A1A", fontWeight: "600" }}>Lagre</ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  progressCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  progressHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.md },
  progressPercent: { fontSize: 24, fontWeight: "700" },
  progressBar: { height: 8, borderRadius: 4, overflow: "hidden", marginBottom: Spacing.sm },
  progressFill: { height: "100%", borderRadius: 4 },
  progressSubtext: { fontSize: 13 },
  urgentCard: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  urgentContent: { marginLeft: Spacing.md, flex: 1 },
  urgentTitle: { fontSize: 14, fontWeight: "600" },
  urgentText: { fontSize: 13, marginTop: 2 },
  presetsSection: {
    marginBottom: Spacing.md,
  },
  presetsLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  presetsScroll: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  presetChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  presetText: {
    fontSize: 13,
    fontWeight: "500",
  },
  templateChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  templateText: {
    fontSize: 13,
    fontWeight: "500",
  },
  categoryFilter: { marginBottom: Spacing.lg, marginHorizontal: -Spacing.lg, paddingHorizontal: Spacing.lg },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: "500" },
  itemCompleted: { textDecorationLine: "line-through" },
  itemMeta: { flexDirection: "row", alignItems: "center", marginTop: Spacing.xs },
  categoryBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: BorderRadius.sm, marginRight: Spacing.sm },
  categoryBadgeText: { fontSize: 12, fontWeight: "500" },
  monthsText: { fontSize: 12 },
  notesText: { fontSize: 12, marginTop: 4, fontStyle: "italic" },
  assignedBadge: { width: 18, height: 18, borderRadius: 9, alignItems: "center", justifyContent: "center" },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    marginTop: Spacing.md,
  },
  button: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  modalContentLarge: {
    width: "90%",
    maxHeight: "85%",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: "top",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryOption: {
    width: "30%",
    aspectRatio: 1,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  monthsSlider: {
    flexDirection: "row",
    gap: Spacing.xs,
    flexWrap: "wrap",
  },
  monthOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    minWidth: 40,
    alignItems: "center",
  },
  assignmentOptions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  assignmentOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
  },
  modalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  modalButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
  },
});
