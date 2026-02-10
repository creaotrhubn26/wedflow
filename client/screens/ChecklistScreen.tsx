import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, StyleSheet, View, Pressable, TextInput, Modal, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { EvendiIcon, EvendiIconGlyphMap } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { SwipeableRow } from "@/components/SwipeableRow";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getWeddingDetails, getCoupleSession, getAppLanguage, type AppLanguage } from "@/lib/storage";
import { getCoupleProfile, updateCoupleProfile } from "@/lib/api-couples";
import { getChecklistTasks, updateChecklistTask, createChecklistTask, deleteChecklistTask, seedDefaultChecklist } from "@/lib/api-checklist";
import { TRADITION_CHECKLIST_ITEMS, CULTURAL_LABELS } from "@/constants/tradition-data";
import { migrateChecklistFromAsyncStorage, needsMigration } from "@/lib/checklist-migration";
import { rescheduleChecklistReminders } from "@/lib/notifications";
import type { ChecklistTask } from "@shared/schema";
import { showToast } from "@/lib/toast";
import { showConfirm } from "@/lib/dialogs";

type ChecklistCategory = "planning" | "vendors" | "attire" | "logistics" | "final";

const CATEGORY_KEYS: ChecklistCategory[] = ["planning", "vendors", "attire", "logistics", "final"];

const CATEGORY_INFO_NB: Record<ChecklistCategory, { name: string; icon: keyof typeof EvendiIconGlyphMap; color: string }> = {
  planning: { name: "Planlegging", icon: "clipboard", color: "#64B5F6" },
  vendors: { name: "Leverandører", icon: "briefcase", color: "#81C784" },
  attire: { name: "Antrekk", icon: "award", color: "#BA68C8" },
  logistics: { name: "Logistikk", icon: "truck", color: "#FFB74D" },
  final: { name: "Siste uken", icon: "check-circle", color: "#E57373" },
};

const CATEGORY_INFO_EN: Record<ChecklistCategory, { name: string; icon: keyof typeof EvendiIconGlyphMap; color: string }> = {
  planning: { name: "Planning", icon: "clipboard", color: "#64B5F6" },
  vendors: { name: "Vendors", icon: "briefcase", color: "#81C784" },
  attire: { name: "Attire", icon: "award", color: "#BA68C8" },
  logistics: { name: "Logistics", icon: "truck", color: "#FFB74D" },
  final: { name: "Final week", icon: "check-circle", color: "#E57373" },
};

const isChecklistCategory = (value: string): value is ChecklistCategory => {
  return CATEGORY_KEYS.includes(value as ChecklistCategory);
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
  const [editCategory, setEditCategory] = useState<ChecklistCategory>("planning");
  const [editNotes, setEditNotes] = useState("");
  const [editAssignedTo, setEditAssignedTo] = useState<"me" | "partner" | "both">("both");
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [partnerEmailDraft, setPartnerEmailDraft] = useState("");
  const [appLanguage, setAppLanguage] = useState<AppLanguage>("nb");

  useEffect(() => {
    async function loadLanguage() {
      const language = await getAppLanguage();
      setAppLanguage(language);
    }
    loadLanguage();
  }, []);

  const t = useCallback((nb: string, en: string) => (appLanguage === "en" ? en : nb), [appLanguage]);
  const categoryInfo = appLanguage === "en" ? CATEGORY_INFO_EN : CATEGORY_INFO_NB;

  const { data: coupleProfile } = useQuery({
    queryKey: ["couple-profile"],
    queryFn: () => sessionToken ? getCoupleProfile(sessionToken) : Promise.resolve(null),
    enabled: !!sessionToken,
  });


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

  const resetEditFields = useCallback(() => {
    setEditTitle("");
    setEditMonthsBefore(12);
    setEditCategory("planning");
    setEditNotes("");
    setEditAssignedTo("both");
  }, []);

  const parseAssignedIds = useCallback((value: string | null | undefined) => {
    if (!value) return [] as string[];
    if (value === "me" || value === "partner") return [value];
    if (value.startsWith("[")) {
      try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed)
          ? parsed.filter((entry) => typeof entry === "string")
          : [value];
      } catch {
        return [value];
      }
    }
    return [value];
  }, []);

  const resolveAssignedTo = useCallback((value: string | null | undefined): "me" | "partner" | "both" => {
    if (!value) return "both";
    if (value === "me" || value === "partner") return value;

    const ids = parseAssignedIds(value);
    const hasMe = (!!coupleProfile?.id && ids.includes(coupleProfile.id)) || ids.includes("me");
    const hasPartner = (!!coupleProfile?.partnerEmail && ids.includes(coupleProfile.partnerEmail)) || ids.includes("partner");

    if (hasMe && hasPartner) return "both";
    if (hasMe) return "me";
    if (hasPartner) return "partner";
    return "partner";
  }, [coupleProfile?.id, coupleProfile?.partnerEmail, parseAssignedIds]);

  const buildAssignedToValue = useCallback((selection: "me" | "partner" | "both") => {
    if (selection === "both") {
      const ids: string[] = [];
      if (coupleProfile?.id) ids.push(coupleProfile.id);
      if (coupleProfile?.partnerEmail) ids.push(coupleProfile.partnerEmail);
      return ids.length > 0 ? JSON.stringify(ids) : null;
    }

    if (selection === "me") {
      return coupleProfile?.id ?? "me";
    }

    if (selection === "partner") {
      return coupleProfile?.partnerEmail ?? "partner";
    }

    return null;
  }, [coupleProfile?.id, coupleProfile?.partnerEmail]);

  const getAssignedMeta = useCallback((value: string | null | undefined) => {
    if (!value) return null;

    const ids = parseAssignedIds(value);
    const hasMe = (!!coupleProfile?.id && ids.includes(coupleProfile.id)) || ids.includes("me");
    const hasPartner = (!!coupleProfile?.partnerEmail && ids.includes(coupleProfile.partnerEmail)) || ids.includes("partner");

    if (hasMe && hasPartner) return { icon: "users" as const, label: t("Begge", "Both") };
    if (hasMe) return { icon: "user" as const, label: t("Meg", "Me") };
    if (hasPartner) return { icon: "heart" as const, label: t("Partner", "Partner") };
    return { icon: "user" as const, label: t("Tildelt", "Assigned") };
  }, [coupleProfile?.id, coupleProfile?.partnerEmail, parseAssignedIds, t]);


  // Check for migration on mount
  useEffect(() => {
    async function checkMigration() {
      if (!sessionToken) return;
      
      const hasTasks = tasks.length > 0;
      const needsDataMigration = await needsMigration();
      
      if (!hasTasks && needsDataMigration) {
        const confirmed = await showConfirm({
          title: t("Migrer eksisterende data", "Migrate existing data"),
          message: t("Vi fant sjekkliste-data lagret lokalt. Vil du flytte den til serveren?", "We found checklist data stored locally. Do you want to move it to the server?"),
          confirmLabel: t("Migrer", "Migrate"),
          cancelLabel: t("Avbryt", "Cancel"),
        });
        if (confirmed) {
          const success = await migrateChecklistFromAsyncStorage(sessionToken);
          if (success) {
            queryClient.invalidateQueries({ queryKey: ["checklist"] });
            showToast(t("Data ble migrert!", "Data was migrated!"));
          }
        }
      }
    }
    
    if (!isLoading) {
      checkMigration();
    }
  }, [sessionToken, tasks.length, isLoading, queryClient, t]);


  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateChecklistTask(sessionToken!, id, { completed }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
      await rescheduleChecklistReminders();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });

  const seedMutation = useMutation({
    mutationFn: () => seedDefaultChecklist(sessionToken!),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
      await rescheduleChecklistReminders();
    },
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
    mutationFn: (task: { title: string; monthsBefore: number; category: ChecklistCategory; notes: string | null; assignedTo: string | null }) =>
      createChecklistTask(sessionToken!, {
        title: task.title,
        monthsBefore: task.monthsBefore,
        category: task.category,
        notes: task.notes || undefined,
        assignedTo: task.assignedTo || undefined,
      }),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
      setShowAddModal(false);
      resetEditFields();
      await rescheduleChecklistReminders();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteChecklistTask(sessionToken!, id),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
      await rescheduleChecklistReminders();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ChecklistTask> }) =>
      updateChecklistTask(sessionToken!, id, updates),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["checklist"] });
      setEditingTask(null);
      await rescheduleChecklistReminders();
    },
  });

  const partnerEmailMutation = useMutation({
    mutationFn: (email: string) => updateCoupleProfile(sessionToken!, { partnerEmail: email || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["couple-profile"] });
      setShowPartnerModal(false);
      setPartnerEmailDraft("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error) => {
      showToast((error as Error).message);
    },
  });

  const openPartnerModal = useCallback(() => {
    setPartnerEmailDraft(coupleProfile?.partnerEmail ?? "");
    setShowPartnerModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [coupleProfile?.partnerEmail]);

  const handleSavePartnerEmail = useCallback(() => {
    const trimmedEmail = partnerEmailDraft.trim();
    if (!trimmedEmail) {
      showToast(t("Skriv inn partnerens e-postadresse.", "Enter your partner's email address."));
      return;
    }
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
    if (!isValidEmail) {
      showToast(t("Skriv inn en gyldig e-postadresse.", "Enter a valid email address."));
      return;
    }
    partnerEmailMutation.mutate(trimmedEmail);
  }, [partnerEmailDraft, partnerEmailMutation]);

  const handleRemovePartnerEmail = useCallback(() => {
    showConfirm({
      title: t("Fjern partner e-post", "Remove partner email"),
      message: t("Dette vil fjerne partneren fra tildelinger. Fortsette?", "This will remove the partner from assignments. Continue?"),
      confirmLabel: t("Fjern", "Remove"),
      cancelLabel: t("Avbryt", "Cancel"),
      destructive: true,
    }).then((confirmed) => {
      if (confirmed) {
        partnerEmailMutation.mutate("");
      }
    });
  }, [partnerEmailMutation, t]);

  const handleToggle = useCallback((id: string, completed: boolean) => {
    toggleMutation.mutate({ id, completed: !completed });
  }, [toggleMutation]);

  const handleSeedDefaults = useCallback(() => {
    showConfirm({
      title: t("Opprett standardsjekkliste", "Create default checklist"),
      message: t("Dette vil legge til 24 standardoppgaver. Fortsette?", "This will add 24 default tasks. Continue?"),
      confirmLabel: t("Opprett", "Create"),
      cancelLabel: t("Avbryt", "Cancel"),
    }).then((confirmed) => {
      if (confirmed) seedMutation.mutate();
    });
  }, [seedMutation, t]);

  const handleAddTask = useCallback(() => {
    const trimmedTitle = editTitle.trim();
    if (!trimmedTitle) {
      showToast(t("Legg til en tittel for oppgaven.", "Add a title for the task."));
      return;
    }

    if (editAssignedTo === "partner" && !coupleProfile?.partnerEmail) {
      showToast(t("Legg inn partnerens e-post i profilen for å tildele til partner.", "Add your partner's email to assign to partner."));
      return;
    }

    if (editAssignedTo === "both" && !coupleProfile?.partnerEmail) {
      showToast(t("Legg inn partnerens e-post i profilen for å tildele til begge.", "Add your partner's email to assign to both."));
      return;
    }

    const assignedToValue = buildAssignedToValue(editAssignedTo);

    createMutation.mutate({
      title: trimmedTitle,
      monthsBefore: editMonthsBefore,
      category: editCategory,
      notes: editNotes.trim() ? editNotes.trim() : null,
      assignedTo: assignedToValue,
    });
  }, [buildAssignedToValue, coupleProfile?.partnerEmail, createMutation, editAssignedTo, editCategory, editMonthsBefore, editNotes, editTitle, t]);

  const applyQuickPreset = (preset: { title: string; category: "planning" | "vendors" | "attire" | "logistics" | "final"; monthsBefore: number }) => {
    setEditTitle(preset.title);
    setEditCategory(preset.category);
    setEditMonthsBefore(preset.monthsBefore);
    setEditNotes("");
    setEditAssignedTo("both");
    setShowAddModal(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleEditTask = useCallback((task: ChecklistTask) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditMonthsBefore(task.monthsBefore);
    setEditCategory(isChecklistCategory(task.category) ? task.category : "planning");
    setEditNotes(task.notes || "");
    setEditAssignedTo(resolveAssignedTo(task.assignedTo));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }, [resolveAssignedTo]);

  const handleSaveEdit = useCallback(() => {
    if (!editingTask || !editTitle.trim()) return;

    if (editAssignedTo === "partner" && !coupleProfile?.partnerEmail) {
      showToast(t("Legg inn partnerens e-post i profilen for å tildele til partner.", "Add your partner's email to assign to partner."));
      return;
    }

    if (editAssignedTo === "both" && !coupleProfile?.partnerEmail) {
      showToast(t("Legg inn partnerens e-post i profilen for å tildele til begge.", "Add your partner's email to assign to both."));
      return;
    }

    const assignedToValue = buildAssignedToValue(editAssignedTo);
    
    updateMutation.mutate({
      id: editingTask.id,
      updates: {
        title: editTitle.trim(),
        monthsBefore: editMonthsBefore,
        category: editCategory,
        notes: editNotes || null,
        assignedTo: assignedToValue,
      },
    });
  }, [buildAssignedToValue, coupleProfile?.partnerEmail, editAssignedTo, editCategory, editMonthsBefore, editNotes, editTitle, editingTask, updateMutation, t]);

  const handleDeleteTask = useCallback((task: ChecklistTask) => {
    if (task.isDefault) {
      showToast(t("Standardoppgaver kan ikke slettes", "Default tasks cannot be deleted"));
      return;
    }

    showConfirm({
      title: t("Slett oppgave", "Delete task"),
      message: t(`Er du sikker på at du vil slette "${task.title}"?`, `Are you sure you want to delete "${task.title}"?`),
      confirmLabel: t("Slett", "Delete"),
      cancelLabel: t("Avbryt", "Cancel"),
      destructive: true,
    }).then((confirmed) => {
      if (confirmed) deleteMutation.mutate(task.id);
    });
  }, [deleteMutation, t]);

  if (!sessionToken) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText style={{ color: theme.textSecondary }}>{t("Logg inn for å se sjekkliste", "Log in to view your checklist")}</ThemedText>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText style={{ color: theme.textSecondary }}>{t("Laster...", "Loading...")}</ThemedText>
      </View>
    );
  }

  if (tasks.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <EvendiIcon name="clipboard" size={64} color={theme.textSecondary} />
        <ThemedText type="h3" style={{ marginTop: Spacing.lg }}>{t("Tom sjekkliste", "Empty checklist")}</ThemedText>
        <ThemedText style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.sm, marginHorizontal: Spacing.xl }}>
          {t("Opprett standardoppgaver eller legg til dine egne", "Create default tasks or add your own")}
        </ThemedText>
        <Pressable
          onPress={handleSeedDefaults}
          style={[styles.button, { backgroundColor: Colors.dark.accent, marginTop: Spacing.lg }]}
        >
          <ThemedText style={{ color: "#1A1A1A", fontWeight: "600" }}>{t("Opprett standardsjekkliste", "Create default checklist")}</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => {
            resetEditFields();
            setShowAddModal(true);
          }}
          style={[styles.button, { backgroundColor: theme.backgroundDefault, borderWidth: 1, borderColor: theme.border, marginTop: Spacing.md }]}
        >
          <ThemedText style={{ color: theme.text, fontWeight: "600" }}>{t("Legg til oppgave", "Add task")}</ThemedText>
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
            <ThemedText type="h3">{t("Din fremgang", "Your progress")}</ThemedText>
            <ThemedText style={[styles.progressPercent, { color: Colors.dark.accent }]}>
              {Math.round(progress)}%
            </ThemedText>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
            <View style={[styles.progressFill, { backgroundColor: Colors.dark.accent, width: `${progress}%` }]} />
          </View>
          <ThemedText style={[styles.progressSubtext, { color: theme.textSecondary }]}>
            {t(
              `${completedCount} av ${tasks.length} oppgaver fullført`,
              `${completedCount} of ${tasks.length} tasks completed`
            )}
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
            <EvendiIcon name="globe" size={18} color="#FFB300" />
            <View style={{ marginLeft: Spacing.sm, flex: 1 }}>
              <ThemedText style={{ color: '#FFB300', fontWeight: '600', fontSize: 14 }}>
                Legg til tradisjonsoppgaver
              </ThemedText>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
                {coupleProfile?.selectedTraditions?.map(t => CULTURAL_LABELS[t] || t).join(', ')}
              </ThemedText>
            </View>
            <EvendiIcon name="plus-circle" size={18} color="#FFB300" />
          </Pressable>
        </Animated.View>
      )}

      {urgentItems.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={[styles.urgentCard, { backgroundColor: theme.error + "20", borderColor: theme.error }]}>
            <EvendiIcon name="alert-triangle" size={20} color={theme.error} />
            <View style={styles.urgentContent}>
              <ThemedText style={[styles.urgentTitle, { color: theme.error }]}>
                {t(
                  `${urgentItems.length} oppgave${urgentItems.length > 1 ? "r" : ""} på overtid`,
                  `${urgentItems.length} overdue task${urgentItems.length > 1 ? "s" : ""}`
                )}
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
          <ThemedText style={[styles.presetsLabel, { color: theme.textMuted }]}>{t("Hurtigvalg", "Quick filters")}</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsScroll}>
            {[
              { value: "all" as const, label: t("Alle", "All"), icon: "list" as const },
              { value: "thisMonth" as const, label: t("Denne måneden", "This month"), icon: "calendar" as const },
              { value: "overdue" as const, label: t("Forsinkede", "Overdue"), icon: "alert-circle" as const },
              { value: "highPriority" as const, label: t("Høy prioritet", "High priority"), icon: "zap" as const },
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
                <EvendiIcon
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
          <ThemedText style={[styles.presetsLabel, { color: theme.textMuted }]}>{t("Legg til raskt", "Quick add")}</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetsScroll}>
            {[
              { title: t("Bestill brudebukett", "Order bridal bouquet"), category: "vendors" as const, monthsBefore: 3 },
              { title: t("Bestill kakesmak", "Book cake tasting"), category: "vendors" as const, monthsBefore: 4 },
              { title: t("Siste prøve antrekk", "Final outfit fitting"), category: "attire" as const, monthsBefore: 1 },
              { title: t("Send bordkart til lokale", "Send seating chart to venue"), category: "logistics" as const, monthsBefore: 1 },
            ].map((template, idx) => (
              <Pressable
                key={idx}
                onPress={() => applyQuickPreset(template)}
                style={[
                  styles.templateChip,
                  { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
                ]}
              >
                <EvendiIcon name="plus-circle" size={14} color={Colors.dark.accent} />
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
              {t("Alle", "All")}
            </ThemedText>
          </Pressable>
          {(Object.entries(categoryInfo) as [ChecklistCategory, typeof categoryInfo[ChecklistCategory]][]).map(([key, info]) => (
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
              <EvendiIcon name={info.icon} size={14} color={filterCategory === key ? "#FFFFFF" : info.color} />
              <ThemedText style={{ color: filterCategory === key ? "#FFFFFF" : theme.text, fontSize: 13, marginLeft: 4 }}>
                {info.name}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </Animated.View>

      {filteredItems.map((item, index) => {
        const catInfo = isChecklistCategory(item.category)
          ? categoryInfo[item.category]
          : categoryInfo.planning;
        const assignedMeta = getAssignedMeta(item.assignedTo);
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
                    {item.completed ? <EvendiIcon name="check" size={12} color="#1A1A1A" /> : null}
                  </View>
                  <View style={styles.itemContent}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.xs }}>
                      <ThemedText style={[styles.itemTitle, item.completed && styles.itemCompleted]}>
                        {item.title}
                      </ThemedText>
                      {assignedMeta && (
                        <View style={[styles.assignedBadge, { backgroundColor: Colors.dark.accent + "30" }]}>
                          <EvendiIcon name={assignedMeta.icon} size={10} color={Colors.dark.accent} />
                          <ThemedText style={[styles.assignedBadgeText, { color: Colors.dark.accent }]}>
                            {assignedMeta.label}
                          </ThemedText>
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
                        {t(`${item.monthsBefore} mnd før`, `${item.monthsBefore} mo before`)}
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
        onPress={() => {
          resetEditFields();
          setShowAddModal(true);
        }}
        style={[styles.addButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
      >
        <EvendiIcon name="plus" size={20} color={Colors.dark.accent} />
        <ThemedText style={{ color: Colors.dark.accent, marginLeft: Spacing.sm, fontWeight: "600" }}>
          {t("Legg til oppgave", "Add task")}
        </ThemedText>
      </Pressable>

      {/* Add Task Modal */}
      <Modal visible={showAddModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowAddModal(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]} onPress={(e) => e.stopPropagation()}>
            <ThemedText type="h3" style={{ marginBottom: Spacing.md }}>{t("Ny oppgave", "New task")}</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder={t("Oppgavetittel", "Task title")}
              placeholderTextColor={theme.textSecondary}
            />

            <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.sm }]}>
              {t("Kategori", "Category")}
            </ThemedText>
            <View style={styles.categoryGrid}>
              {(Object.entries(categoryInfo) as [ChecklistCategory, typeof categoryInfo[ChecklistCategory]][]).map(([key, info]) => (
                <Pressable
                  key={key}
                  onPress={() => setEditCategory(key)}
                  style={[
                    styles.categoryOption,
                    {
                      backgroundColor: editCategory === key ? info.color + "30" : theme.backgroundSecondary,
                      borderColor: editCategory === key ? info.color : "transparent",
                    },
                  ]}
                >
                  <EvendiIcon name={info.icon} size={16} color={editCategory === key ? info.color : theme.textSecondary} />
                  <ThemedText style={{ fontSize: 12, marginTop: 4, color: editCategory === key ? theme.text : theme.textSecondary }}>
                    {info.name}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.md }]}>
              {t("Måneder før arrangementet", "Months before event")}
            </ThemedText>
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

            <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.md }]}>
              {t("Tildel til", "Assign to")}
            </ThemedText>
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
                <EvendiIcon name="users" size={16} color={editAssignedTo === "both" ? Colors.dark.accent : theme.textSecondary} />
                <ThemedText style={{ marginLeft: 6 }}>{t("Begge", "Both")}</ThemedText>
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
                <EvendiIcon name="user" size={16} color={editAssignedTo === "me" ? Colors.dark.accent : theme.textSecondary} />
                <ThemedText style={{ marginLeft: 6 }}>{t("Meg", "Me")}</ThemedText>
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
                <EvendiIcon name="heart" size={16} color={editAssignedTo === "partner" ? Colors.dark.accent : theme.textSecondary} />
                <ThemedText style={{ marginLeft: 6 }}>{t("Partner", "Partner")}</ThemedText>
              </Pressable>
            </View>

            {!coupleProfile?.partnerEmail && (
              <Pressable
                onPress={openPartnerModal}
                style={[styles.partnerHint, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
              >
                <EvendiIcon name="mail" size={14} color={theme.textSecondary} />
                <ThemedText style={[styles.partnerHintText, { color: theme.textSecondary }]}>
                  {t(
                    "Legg inn partnerens e-post for å tildele til partner eller begge.",
                    "Add your partner's email to assign tasks to partner or both."
                  )}
                </ThemedText>
              </Pressable>
            )}

            <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.md }]}>
              {t("Notater (valgfritt)", "Notes (optional)")}
            </ThemedText>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder={t("Legg til notater...", "Add notes...")}
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => {
                  setShowAddModal(false);
                  resetEditFields();
                }}
                style={[styles.modalButton, { backgroundColor: theme.backgroundSecondary }]}
              >
                <ThemedText style={{ color: theme.text }}>{t("Avbryt", "Cancel")}</ThemedText>
              </Pressable>
              <Pressable onPress={handleAddTask} style={[styles.modalButton, { backgroundColor: Colors.dark.accent }]}>
                <ThemedText style={{ color: "#1A1A1A", fontWeight: "600" }}>{t("Legg til", "Add")}</ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Edit Task Modal */}
      <Modal visible={!!editingTask} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setEditingTask(null)}>
          <Pressable style={[styles.modalContentLarge, { backgroundColor: theme.backgroundDefault }]} onPress={(e) => e.stopPropagation()}>
            <ThemedText type="h3" style={{ marginBottom: Spacing.md }}>{t("Rediger oppgave", "Edit task")}</ThemedText>
            
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>{t("Tittel", "Title")}</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder={t("Oppgavetittel", "Task title")}
              placeholderTextColor={theme.textSecondary}
            />

            <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.md }]}>
              {t("Kategori", "Category")}
            </ThemedText>
            <View style={styles.categoryGrid}>
              {(Object.entries(categoryInfo) as [ChecklistCategory, typeof categoryInfo[ChecklistCategory]][]).map(([key, info]) => (
                <Pressable
                  key={key}
                  onPress={() => setEditCategory(key)}
                  style={[
                    styles.categoryOption,
                    {
                      backgroundColor: editCategory === key ? info.color + "30" : theme.backgroundSecondary,
                      borderColor: editCategory === key ? info.color : "transparent",
                    },
                  ]}
                >
                  <EvendiIcon name={info.icon} size={16} color={editCategory === key ? info.color : theme.textSecondary} />
                  <ThemedText style={{ fontSize: 12, marginTop: 4, color: editCategory === key ? theme.text : theme.textSecondary }}>
                    {info.name}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.md }]}>
              {t("Måneder før arrangementet", "Months before event")}
            </ThemedText>
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

            <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.md }]}>
              {t("Tildel til", "Assign to")}
            </ThemedText>
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
                <EvendiIcon name="users" size={16} color={editAssignedTo === "both" ? Colors.dark.accent : theme.textSecondary} />
                <ThemedText style={{ marginLeft: 6 }}>{t("Begge", "Both")}</ThemedText>
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
                <EvendiIcon name="user" size={16} color={editAssignedTo === "me" ? Colors.dark.accent : theme.textSecondary} />
                <ThemedText style={{ marginLeft: 6 }}>{t("Meg", "Me")}</ThemedText>
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
                <EvendiIcon name="heart" size={16} color={editAssignedTo === "partner" ? Colors.dark.accent : theme.textSecondary} />
                <ThemedText style={{ marginLeft: 6 }}>{t("Partner", "Partner")}</ThemedText>
              </Pressable>
            </View>

            {!coupleProfile?.partnerEmail && (
              <Pressable
                onPress={openPartnerModal}
                style={[styles.partnerHint, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
              >
                <EvendiIcon name="mail" size={14} color={theme.textSecondary} />
                <ThemedText style={[styles.partnerHintText, { color: theme.textSecondary }]}
                  >{t(
                    "Legg inn partnerens e-post for å tildele til partner eller begge.",
                    "Add your partner's email to assign tasks to partner or both."
                  )}</ThemedText>
              </Pressable>
            )}

            <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.md }]}>
              {t("Notater (valgfritt)", "Notes (optional)")}
            </ThemedText>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              value={editNotes}
              onChangeText={setEditNotes}
              placeholder={t("Legg til notater...", "Add notes...")}
              placeholderTextColor={theme.textSecondary}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <Pressable
                onPress={() => setEditingTask(null)}
                style={[styles.modalButton, { backgroundColor: theme.backgroundSecondary }]}
              >
                <ThemedText style={{ color: theme.text }}>{t("Avbryt", "Cancel")}</ThemedText>
              </Pressable>
              <Pressable onPress={handleSaveEdit} style={[styles.modalButton, { backgroundColor: Colors.dark.accent }]}>
                <ThemedText style={{ color: "#1A1A1A", fontWeight: "600" }}>{t("Lagre", "Save")}</ThemedText>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Partner Email Modal */}
      <Modal visible={showPartnerModal} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setShowPartnerModal(false)}>
          <Pressable style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]} onPress={(e) => e.stopPropagation()}>
            <ThemedText type="h3" style={{ marginBottom: Spacing.md }}>{t("Partner e-post", "Partner email")}</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              value={partnerEmailDraft}
              onChangeText={setPartnerEmailDraft}
              placeholder={t("partner@epost.no", "partner@email.com")}
              placeholderTextColor={theme.textSecondary}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <View style={styles.modalButtons}>
              <Pressable onPress={() => setShowPartnerModal(false)} style={[styles.modalButton, { backgroundColor: theme.backgroundSecondary }]}>
                <ThemedText style={{ color: theme.text }}>{t("Avbryt", "Cancel")}</ThemedText>
              </Pressable>
              {coupleProfile?.partnerEmail && (
                <Pressable
                  onPress={handleRemovePartnerEmail}
                  style={[styles.modalButton, { backgroundColor: theme.backgroundSecondary }]}
                >
                  <ThemedText style={{ color: theme.text }}>{t("Fjern", "Remove")}</ThemedText>
                </Pressable>
              )}
              <Pressable
                onPress={handleSavePartnerEmail}
                style={[styles.modalButton, { backgroundColor: Colors.dark.accent }]}
              >
                <ThemedText style={{ color: "#1A1A1A", fontWeight: "600" }}>{t("Lagre", "Save")}</ThemedText>
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
  assignedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
  assignedBadgeText: { fontSize: 10, fontWeight: "600" },
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
  partnerHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  partnerHintText: {
    fontSize: 12,
    flex: 1,
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
