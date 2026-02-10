import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View, Pressable, TextInput, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { EvendiIcon, EvendiIconGlyphMap } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import {
  scheduleCustomReminder,
  cancelCustomReminder,
  CATEGORY_ICONS,
  getNotificationSettings,
  getCategoryLabel,
} from "@/lib/notifications";
import { getAppLanguage, type AppLanguage } from "@/lib/storage";
import { showToast } from "@/lib/toast";
import { showConfirm } from "@/lib/dialogs";

interface Reminder {
  id: string;
  title: string;
  description: string | null;
  reminderDate: string;
  category: string;
  isCompleted: boolean;
  notificationId: string | null;
  createdAt: string;
  updatedAt: string;
}

const CATEGORIES = ["general", "vendor", "budget", "guest", "planning"] as const;

const CATEGORY_COLORS: Record<string, string> = {
  general: "#64B5F6",
  vendor: "#81C784",
  budget: "#FFB74D",
  guest: "#BA68C8",
  planning: "#4FC3F7",
};

export default function RemindersScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState<string>("general");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [appLanguage, setAppLanguage] = useState<AppLanguage>("nb");

  const copy = appLanguage === "en"
    ? {
      loading: "Loading...",
      upcoming: "Upcoming",
      completed: "Completed",
      emptyTitle: "No reminders",
      emptyText: "Create a reminder to track important deadlines and tasks.",
      summaryTitle: "Reminders",
      summaryStatus: (completed: number, total: number) => `${completed} of ${total} completed`,
      summaryEmpty: "No reminders yet",
      statsThisWeek: (count: number) => `${count} due this week`,
      statsOverdue: (count: number) => `${count} overdue`,
      filterAll: "All",
      errorTitleMissing: "Title is required",
      deleteTitle: "Delete reminder",
      deleteConfirm: (title: string) => `Are you sure you want to delete "${title}"?`,
      deleteCancel: "Cancel",
      deleteConfirmAction: "Delete",
      overdueTitle: (count: number) => `${count} overdue reminder${count === 1 ? "" : "s"}`,
      overdueSubtitle: "Mark as completed or snooze",
      addReminder: "Add reminder",
      addReminderCta: "Add a new reminder",
      allCompleted: "All reminders are completed",
      newReminder: "New reminder",
      quickPick: "Quick picks:",
      titleLabel: "Title",
      titlePlaceholder: "What should we remind you about?",
      descriptionLabel: "Description (optional)",
      descriptionPlaceholder: "Add more information...",
      dateLabel: "Date",
      datePlaceholder: "YYYY-MM-DD",
      categoryLabel: "Category",
      cancel: "Cancel",
      create: "Create",
      saving: "Saving...",
      templatePayVendor: "Pay vendor",
      templateVendorMeeting: "Vendor meeting",
      templateSendRsvp: "Send RSVP",
      templateCheckBudget: "Check budget",
    }
    : {
      loading: "Laster...",
      upcoming: "Kommende",
      completed: "Fullført",
      emptyTitle: "Ingen påminnelser",
      emptyText: "Opprett en påminnelse for å holde styr på viktige frister og oppgaver.",
      summaryTitle: "Påminnelser",
      summaryStatus: (completed: number, total: number) => `${completed} av ${total} fullført`,
      summaryEmpty: "Ingen påminnelser ennå",
      statsThisWeek: (count: number) => `${count} denne uken`,
      statsOverdue: (count: number) => `${count} forfalt`,
      filterAll: "Alle",
      errorTitleMissing: "Tittel er påkrevd",
      deleteTitle: "Slett påminnelse",
      deleteConfirm: (title: string) => `Er du sikker på at du vil slette "${title}"?`,
      deleteCancel: "Avbryt",
      deleteConfirmAction: "Slett",
      overdueTitle: (count: number) => `${count} forfalt${count === 1 ? "" : "e"} påminnelse${count === 1 ? "" : "r"}`,
      overdueSubtitle: "Marker som fullført eller utsett",
      addReminder: "Legg til påminnelse",
      addReminderCta: "Legg til ny påminnelse",
      allCompleted: "Alle påminnelser er fullført",
      newReminder: "Ny påminnelse",
      quickPick: "Hurtigvalg:",
      titleLabel: "Tittel",
      titlePlaceholder: "Hva vil du bli påminnet om?",
      descriptionLabel: "Beskrivelse (valgfritt)",
      descriptionPlaceholder: "Legg til mer informasjon...",
      dateLabel: "Dato",
      datePlaceholder: "YYYY-MM-DD",
      categoryLabel: "Kategori",
      cancel: "Avbryt",
      create: "Opprett",
      saving: "Lagrer...",
      templatePayVendor: "Betal leverandør",
      templateVendorMeeting: "Møte leverandør",
      templateSendRsvp: "Send RSVP",
      templateCheckBudget: "Sjekk budsjett",
    };

  const locale = appLanguage === "en" ? "en-US" : "nb-NO";

  useEffect(() => {
    async function loadLanguage() {
      const language = await getAppLanguage();
      setAppLanguage(language);
    }
    loadLanguage();
  }, []);

  const { data: reminders = [], isLoading } = useQuery<Reminder[]>({
    queryKey: ["/api/reminders"],
  });

  const createMutation = useMutation({
    mutationFn: async (data: { title: string; description?: string; reminderDate: string; category: string }): Promise<Reminder> => {
      const res = await apiRequest("POST", "/api/reminders", data);
      return res.json();
    },
    onSuccess: async (newReminder: Reminder) => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      const settings = await getNotificationSettings();
      if (settings.enabled) {
        const notificationId = await scheduleCustomReminder({
          id: newReminder.id,
          title: newReminder.title,
          description: newReminder.description,
          reminderDate: newReminder.reminderDate,
          category: newReminder.category,
        });
        if (notificationId) {
          await apiRequest("PATCH", `/api/reminders/${newReminder.id}`, { notificationId });
        }
      }
      resetForm();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isCompleted }: { id: string; isCompleted: boolean }) => {
      return apiRequest("PATCH", `/api/reminders/${id}`, { isCompleted });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await cancelCustomReminder(id);
      return apiRequest("DELETE", `/api/reminders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedDate(new Date());
    setSelectedCategory("general");
    setShowForm(false);
  };

  const handleCreateReminder = () => {
    if (!title.trim()) {
      showToast(copy.errorTitleMissing);
      return;
    }
    createMutation.mutate({
      title: title.trim(),
      description: description.trim() || undefined,
      reminderDate: selectedDate.toISOString(),
      category: selectedCategory,
    });
  };

  const handleDeleteReminder = (reminder: Reminder) => {
    showConfirm({
      title: copy.deleteTitle,
      message: copy.deleteConfirm(reminder.title),
      confirmLabel: copy.deleteConfirmAction,
      cancelLabel: copy.deleteCancel,
      destructive: true,
    }).then((confirmed) => {
      if (confirmed) deleteMutation.mutate(reminder.id);
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale, {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getTimeUntil = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (appLanguage === "en") {
      if (diffDays < 0) return "Overdue";
      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Tomorrow";
      if (diffDays < 7) return `In ${diffDays} days`;
      if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
      return `In ${Math.ceil(diffDays / 30)} months`;
    }

    if (diffDays < 0) return "Forfalt";
    if (diffDays === 0) return "I dag";
    if (diffDays === 1) return "I morgen";
    if (diffDays < 7) return `Om ${diffDays} dager`;
    if (diffDays < 30) return `Om ${Math.ceil(diffDays / 7)} uker`;
    return `Om ${Math.ceil(diffDays / 30)} måneder`;
  };

  const filteredReminders = filterCategory
    ? reminders.filter((r) => r.category === filterCategory)
    : reminders;

  const upcomingReminders = filteredReminders.filter((r) => !r.isCompleted);
  const completedReminders = filteredReminders.filter((r) => r.isCompleted);

  const completedCount = reminders.filter((r) => r.isCompleted).length;
  const totalCount = reminders.length;

  // Helper: Get reminders by urgency
  const now = new Date();
  const overdueReminders = upcomingReminders.filter((r) => {
    const reminderDate = new Date(r.reminderDate);
    return reminderDate < now;
  });
  const dueThisWeekReminders = upcomingReminders.filter((r) => {
    const reminderDate = new Date(r.reminderDate);
    const diffDays = Math.ceil((reminderDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 7;
  });
  const dueNextWeekReminders = upcomingReminders.filter((r) => {
    const reminderDate = new Date(r.reminderDate);
    const diffDays = Math.ceil((reminderDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays > 7 && diffDays <= 14;
  });

  // Helper: Get category breakdown
  const getCategoryCount = (category: string) => {
    return upcomingReminders.filter((r) => r.category === category).length;
  };

  // Helper: Smart reminder suggestions
  const getSmartSuggestions = () => {
    const suggestions = [];
    if (overdueReminders.length > 0) {
      suggestions.push({
        icon: "alert-circle" as const,
        label: copy.statsOverdue(overdueReminders.length),
        color: "#FF3B30",
        priority: "urgent",
        action: () => {
          setFilterCategory(null);
          // Scroll to overdue section would happen here
        },
      });
    }
    if (dueThisWeekReminders.length > 0) {
      suggestions.push({
        icon: "clock" as const,
        label: copy.statsThisWeek(dueThisWeekReminders.length),
        color: "#FFB74D",
        priority: "high",
        action: () => {
          // Filter to this week
        },
      });
    }
    return suggestions;
  };

  const smartSuggestions = getSmartSuggestions();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.loadingContainer}>
          <ThemedText style={{ color: theme.textMuted }}>{copy.loading}</ThemedText>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <Animated.View entering={FadeInDown.duration(300)} style={styles.header}>
          <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <View style={styles.summaryRow}>
              <View style={[styles.iconContainer, { backgroundColor: theme.accent + "20" }]}>
                <EvendiIcon name="bell" size={24} color={theme.accent} />
              </View>
              <View style={styles.summaryText}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
                  <ThemedText style={styles.summaryTitle}>{copy.summaryTitle}</ThemedText>
                  {overdueReminders.length > 0 && (
                    <View style={[styles.urgencyBadge, { backgroundColor: "#FF3B30" }]}>
                      <ThemedText style={styles.urgencyBadgeText}>{overdueReminders.length}</ThemedText>
                    </View>
                  )}
                </View>
                <ThemedText style={[styles.summarySubtitle, { color: theme.textMuted }]}> 
                  {totalCount > 0 ? copy.summaryStatus(completedCount, totalCount) : copy.summaryEmpty}
                </ThemedText>
              </View>
            </View>
            {totalCount > 0 ? (
              <>
                <View style={styles.progressContainer}>
                  <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          backgroundColor: theme.accent,
                          width: `${(completedCount / totalCount) * 100}%`,
                        },
                      ]}
                    />
                  </View>
                  <ThemedText style={[styles.progressText, { color: theme.textMuted }]}>
                    {Math.round((completedCount / totalCount) * 100)}%
                  </ThemedText>
                </View>
                {upcomingReminders.length > 0 && (
                  <View style={styles.statsRow}>
                    {dueThisWeekReminders.length > 0 && (
                      <View style={styles.statItem}>
                        <EvendiIcon name="clock" size={12} color="#FFB74D" />
                        <ThemedText style={[styles.statText, { color: theme.textMuted }]}>
                          {copy.statsThisWeek(dueThisWeekReminders.length)}
                        </ThemedText>
                      </View>
                    )}
                    {overdueReminders.length > 0 && (
                      <View style={styles.statItem}>
                        <EvendiIcon name="alert-circle" size={12} color="#FF3B30" />
                        <ThemedText style={[styles.statText, { color: "#FF3B30" }]}>
                          {copy.statsOverdue(overdueReminders.length)}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                )}
              </>
            ) : null}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(100)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterContainer}
          >
            <Pressable
              style={[
                styles.filterChip,
                {
                  backgroundColor: filterCategory === null ? Colors.dark.accent : theme.backgroundDefault,
                  borderColor: filterCategory === null ? Colors.dark.accent : theme.border,
                },
              ]}
              onPress={() => {
                setFilterCategory(null);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <ThemedText
                style={[
                  styles.filterText,
                  { color: filterCategory === null ? "#1A1A1A" : theme.textSecondary },
                ]}
              >
                {copy.filterAll}
              </ThemedText>
            </Pressable>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: filterCategory === cat ? CATEGORY_COLORS[cat] : theme.backgroundDefault,
                    borderColor: filterCategory === cat ? CATEGORY_COLORS[cat] : theme.border,
                  },
                ]}
                onPress={() => {
                  setFilterCategory(filterCategory === cat ? null : cat);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <EvendiIcon
                  name={CATEGORY_ICONS[cat] as keyof typeof EvendiIconGlyphMap}
                  size={14}
                  color={filterCategory === cat ? "#1A1A1A" : theme.textSecondary}
                  style={styles.filterIcon}
                />
                <ThemedText
                  style={[
                    styles.filterText,
                    { color: filterCategory === cat ? "#1A1A1A" : theme.textSecondary },
                  ]}
                >
                  {getCategoryLabel(cat, appLanguage)}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </Animated.View>

        {/* Contextual CTAs */}
        {overdueReminders.length > 0 && !showForm && (
          <Animated.View entering={FadeInDown.duration(300).delay(150)}>
            <Pressable
              style={[styles.ctaCard, { backgroundColor: "#FF3B3015", borderColor: "#FF3B30" }]}
              onPress={() => {
                // Mark all overdue as complete or snooze
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View style={[styles.ctaIcon, { backgroundColor: "#FF3B30" }]}>
                <EvendiIcon name="alert-triangle" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.ctaContent}>
                <ThemedText style={[styles.ctaTitle, { color: "#FF3B30" }]}>
                  {copy.overdueTitle(overdueReminders.length)}
                </ThemedText>
                <ThemedText style={[styles.ctaSubtitle, { color: theme.textMuted }]}>
                  {copy.overdueSubtitle}
                </ThemedText>
              </View>
              <EvendiIcon name="arrow-right" size={20} color="#FF3B30" />
            </Pressable>
          </Animated.View>
        )}

        {upcomingReminders.length === 0 && completedReminders.length > 0 && !showForm && (
          <Animated.View entering={FadeInDown.duration(300).delay(150)}>
            <Pressable
              style={[styles.ctaCard, { backgroundColor: theme.accent + "15", borderColor: theme.accent }]}
              onPress={() => {
                setShowForm(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View style={[styles.ctaIcon, { backgroundColor: theme.accent }]}>
                <EvendiIcon name="plus" size={20} color="#FFFFFF" />
              </View>
              <View style={styles.ctaContent}>
                <ThemedText style={[styles.ctaTitle, { color: theme.text }]}>{copy.addReminderCta}</ThemedText>
                <ThemedText style={[styles.ctaSubtitle, { color: theme.textMuted }]}>
                  {copy.allCompleted}
                </ThemedText>
              </View>
              <EvendiIcon name="arrow-right" size={20} color={theme.accent} />
            </Pressable>
          </Animated.View>
        )}

        {showForm ? (
          <Animated.View entering={FadeInUp.duration(300)} style={styles.formSection}>
            <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
              <ThemedText style={styles.formTitle}>{copy.newReminder}</ThemedText>

              {/* Quick templates */}
              <View style={styles.templateRow}>
                <ThemedText style={[styles.templateLabel, { color: theme.textMuted }]}>{copy.quickPick}</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.templateScroll}>
                  <Pressable
                    style={[styles.templateChip, { backgroundColor: theme.backgroundRoot, borderColor: theme.border }]}
                    onPress={() => {
                      setTitle(copy.templatePayVendor);
                      setSelectedCategory("vendor");
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 7);
                      setSelectedDate(tomorrow);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <EvendiIcon name="dollar-sign" size={12} color={CATEGORY_COLORS.vendor} />
                    <ThemedText style={[styles.templateText, { color: theme.textSecondary }]}>{copy.templatePayVendor}</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.templateChip, { backgroundColor: theme.backgroundRoot, borderColor: theme.border }]}
                    onPress={() => {
                      setTitle(copy.templateVendorMeeting);
                      setSelectedCategory("vendor");
                      const nextWeek = new Date();
                      nextWeek.setDate(nextWeek.getDate() + 7);
                      setSelectedDate(nextWeek);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <EvendiIcon name="calendar" size={12} color={CATEGORY_COLORS.vendor} />
                    <ThemedText style={[styles.templateText, { color: theme.textSecondary }]}>{copy.templateVendorMeeting}</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.templateChip, { backgroundColor: theme.backgroundRoot, borderColor: theme.border }]}
                    onPress={() => {
                      setTitle(copy.templateSendRsvp);
                      setSelectedCategory("guest");
                      const twoWeeks = new Date();
                      twoWeeks.setDate(twoWeeks.getDate() + 14);
                      setSelectedDate(twoWeeks);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <EvendiIcon name="users" size={12} color={CATEGORY_COLORS.guest} />
                    <ThemedText style={[styles.templateText, { color: theme.textSecondary }]}>{copy.templateSendRsvp}</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.templateChip, { backgroundColor: theme.backgroundRoot, borderColor: theme.border }]}
                    onPress={() => {
                      setTitle(copy.templateCheckBudget);
                      setSelectedCategory("budget");
                      const tomorrow = new Date();
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      setSelectedDate(tomorrow);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <EvendiIcon name="trending-up" size={12} color={CATEGORY_COLORS.budget} />
                    <ThemedText style={[styles.templateText, { color: theme.textSecondary }]}>{copy.templateCheckBudget}</ThemedText>
                  </Pressable>
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>{copy.titleLabel}</ThemedText>
                <TextInput
                  testID="input-reminder-title"
                  style={[
                    styles.textInput,
                    { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                  ]}
                  placeholder={copy.titlePlaceholder}
                  placeholderTextColor={theme.textMuted}
                  value={title}
                  onChangeText={setTitle}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>{copy.descriptionLabel}</ThemedText>
                <TextInput
                  testID="input-reminder-description"
                  style={[
                    styles.textInput,
                    styles.textArea,
                    { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                  ]}
                  placeholder={copy.descriptionPlaceholder}
                  placeholderTextColor={theme.textMuted}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>{copy.dateLabel}</ThemedText>
                {Platform.OS === "web" ? (
                  <TextInput
                    style={[
                      styles.textInput,
                      { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                    ]}
                    placeholder={copy.datePlaceholder}
                    placeholderTextColor={theme.textMuted}
                    value={selectedDate.toISOString().split("T")[0]}
                    onChangeText={(text) => {
                      const date = new Date(text);
                      if (!isNaN(date.getTime())) {
                        setSelectedDate(date);
                      }
                    }}
                  />
                ) : (
                  <>
                    <Pressable
                      style={[
                        styles.dateButton,
                        { backgroundColor: theme.backgroundRoot, borderColor: theme.border },
                      ]}
                      onPress={() => setShowDatePicker(true)}
                    >
                      <EvendiIcon name="calendar" size={18} color={Colors.dark.accent} />
                      <ThemedText style={styles.dateButtonText}>
                        {selectedDate.toLocaleDateString(locale, {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </ThemedText>
                    </Pressable>
                    {showDatePicker ? (
                      <DateTimePicker
                        value={selectedDate}
                        mode="date"
                        display="default"
                        minimumDate={new Date()}
                        onChange={(event: DateTimePickerEvent, date?: Date) => {
                          setShowDatePicker(false);
                          if (date) setSelectedDate(date);
                        }}
                      />
                    ) : null}
                  </>
                )}
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>{copy.categoryLabel}</ThemedText>
                <View style={styles.categoryGrid}>
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat}
                      style={[
                        styles.categoryOption,
                        {
                          backgroundColor:
                            selectedCategory === cat ? CATEGORY_COLORS[cat] + "20" : theme.backgroundRoot,
                          borderColor: selectedCategory === cat ? CATEGORY_COLORS[cat] : theme.border,
                        },
                      ]}
                      onPress={() => {
                        setSelectedCategory(cat);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                    >
                      <EvendiIcon
                        name={CATEGORY_ICONS[cat] as keyof typeof EvendiIconGlyphMap}
                        size={16}
                        color={selectedCategory === cat ? CATEGORY_COLORS[cat] : theme.textMuted}
                      />
                      <ThemedText
                        style={[
                          styles.categoryOptionText,
                          { color: selectedCategory === cat ? CATEGORY_COLORS[cat] : theme.textSecondary },
                        ]}
                      >
                        {getCategoryLabel(cat, appLanguage)}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.formButtons}>
                <Pressable
                  testID="button-cancel-reminder"
                  style={[styles.cancelButton, { borderColor: theme.border }]}
                  onPress={resetForm}
                >
                  <ThemedText style={{ color: theme.textSecondary }}>{copy.cancel}</ThemedText>
                </Pressable>
                <Button
                  onPress={handleCreateReminder}
                  disabled={createMutation.isPending || !title.trim()}
                  style={styles.submitButton}
                >
                  {createMutation.isPending ? copy.saving : copy.create}
                </Button>
              </View>
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(300).delay(200)}>
            <Pressable
              testID="button-add-reminder"
              style={[styles.addButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.accent }]}
              onPress={() => {
                setShowForm(true);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <EvendiIcon name="plus" size={20} color={theme.accent} />
              <ThemedText style={[styles.addButtonText, { color: theme.accent }]}>
                {copy.addReminder}
              </ThemedText>
            </Pressable>
          </Animated.View>
        )}

        {upcomingReminders.length > 0 ? (
          <Animated.View entering={FadeInDown.duration(300).delay(300)} style={styles.section}>
            <ThemedText style={styles.sectionTitle}>{copy.upcoming}</ThemedText>
            {upcomingReminders.map((reminder, index) => (
              <Animated.View
                key={reminder.id}
                entering={FadeInDown.duration(300).delay(350 + index * 50)}
              >
                <ReminderItem
                  reminder={reminder}
                  theme={theme}
                  appLanguage={appLanguage}
                  onToggle={() => toggleMutation.mutate({ id: reminder.id, isCompleted: true })}
                  onDelete={() => handleDeleteReminder(reminder)}
                  formatDate={formatDate}
                  getTimeUntil={getTimeUntil}
                />
              </Animated.View>
            ))}
          </Animated.View>
        ) : null}

        {completedReminders.length > 0 ? (
          <Animated.View entering={FadeInDown.duration(300).delay(400)} style={styles.section}>
            <ThemedText style={[styles.sectionTitle, { color: theme.textMuted }]}>{copy.completed}</ThemedText>
            {completedReminders.map((reminder, index) => (
              <Animated.View
                key={reminder.id}
                entering={FadeInDown.duration(300).delay(450 + index * 50)}
              >
                <ReminderItem
                  reminder={reminder}
                  theme={theme}
                  appLanguage={appLanguage}
                  onToggle={() => toggleMutation.mutate({ id: reminder.id, isCompleted: false })}
                  onDelete={() => handleDeleteReminder(reminder)}
                  formatDate={formatDate}
                  getTimeUntil={getTimeUntil}
                  completed
                />
              </Animated.View>
            ))}
          </Animated.View>
        ) : null}

        {reminders.length === 0 ? (
          <Animated.View entering={FadeInDown.duration(300).delay(300)} style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.accent + "20" }]}>
              <EvendiIcon name="bell-off" size={32} color={theme.accent} />
            </View>
            <ThemedText style={styles.emptyTitle}>{copy.emptyTitle}</ThemedText>
            <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
              {copy.emptyText}
            </ThemedText>
          </Animated.View>
        ) : null}
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

function ReminderItem({
  reminder,
  theme,
  appLanguage,
  onToggle,
  onDelete,
  formatDate,
  getTimeUntil,
  completed = false,
}: {
  reminder: Reminder;
  theme: any;
  appLanguage: AppLanguage;
  onToggle: () => void;
  onDelete: () => void;
  formatDate: (date: string) => string;
  getTimeUntil: (date: string) => string;
  completed?: boolean;
}) {
  const categoryColor = CATEGORY_COLORS[reminder.category] || CATEGORY_COLORS.general;
  const timeUntil = getTimeUntil(reminder.reminderDate);
  const isOverdue = new Date(reminder.reminderDate) < new Date();

  return (
    <View
      style={[
        styles.reminderCard,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: theme.border,
          opacity: completed ? 0.7 : 1,
        },
      ]}
    >
      <Pressable style={styles.checkboxContainer} onPress={onToggle}>
        <View
          style={[
            styles.checkbox,
            {
              borderColor: completed ? theme.accent : theme.border,
              backgroundColor: completed ? theme.accent : "transparent",
            },
          ]}
        >
          {completed ? <EvendiIcon name="check" size={14} color="#1A1A1A" /> : null}
        </View>
      </Pressable>

      <View style={styles.reminderContent}>
        <View style={styles.reminderHeader}>
          <ThemedText
            style={[
              styles.reminderTitle,
              completed && { textDecorationLine: "line-through", color: theme.textMuted },
            ]}
          >
            {reminder.title}
          </ThemedText>
          <Pressable style={styles.deleteButton} onPress={onDelete}>
            <EvendiIcon name="trash-2" size={16} color={theme.textMuted} />
          </Pressable>
        </View>

        {reminder.description ? (
          <ThemedText
            style={[styles.reminderDescription, { color: theme.textMuted }]}
            numberOfLines={2}
          >
            {reminder.description}
          </ThemedText>
        ) : null}

        <View style={styles.reminderMeta}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryColor + "20" }]}>
            <EvendiIcon
              name={CATEGORY_ICONS[reminder.category] as keyof typeof EvendiIconGlyphMap}
              size={12}
              color={categoryColor}
            />
            <ThemedText style={[styles.categoryBadgeText, { color: categoryColor }]}>
              {getCategoryLabel(reminder.category, appLanguage)}
            </ThemedText>
          </View>

          <View style={styles.dateInfo}>
            <EvendiIcon
              name="calendar"
              size={12}
              color={isOverdue && !completed ? "#FF6B6B" : theme.textMuted}
            />
            <ThemedText
              style={[
                styles.dateText,
                { color: isOverdue && !completed ? "#FF6B6B" : theme.textMuted },
              ]}
            >
              {formatDate(reminder.reminderDate)}
            </ThemedText>
            <ThemedText
              style={[
                styles.timeUntilText,
                { color: isOverdue && !completed ? "#FF6B6B" : theme.accent },
              ]}
            >
              ({timeUntil})
            </ThemedText>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  summaryCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryText: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  summarySubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "600",
    minWidth: 36,
    textAlign: "right",
  },
  filterContainer: {
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
    flexDirection: "row",
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterIcon: {
    marginRight: 4,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "500",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: "500",
  },
  formSection: {
    marginBottom: Spacing.lg,
  },
  formCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  textInput: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  dateButtonText: {
    fontSize: 15,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  categoryOptionText: {
    fontSize: 13,
    fontWeight: "500",
  },
  formButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  submitButton: {
    flex: 1,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  reminderCard: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  checkboxContainer: {
    marginRight: Spacing.md,
    paddingTop: 2,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  reminderContent: {
    flex: 1,
  },
  reminderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
    marginRight: Spacing.sm,
  },
  deleteButton: {
    padding: Spacing.xs,
  },
  reminderDescription: {
    fontSize: 13,
    marginTop: 4,
  },
  reminderMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.sm,
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "500",
  },
  dateInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dateText: {
    fontSize: 12,
  },
  timeUntilText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    maxWidth: 280,
  },
  urgencyBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  urgencyBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.sm,
    flexWrap: "wrap",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    fontSize: 12,
  },
  ctaCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  ctaIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  ctaContent: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  ctaSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  templateRow: {
    marginBottom: Spacing.lg,
  },
  templateLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  templateScroll: {
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  templateChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginRight: Spacing.sm,
    gap: 4,
  },
  templateText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
