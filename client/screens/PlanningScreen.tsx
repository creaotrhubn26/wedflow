import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";

import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { PlanningStackParamList } from "@/navigation/PlanningStackNavigator";
import {
  getWeddingDetails,
  saveWeddingDetails,
  getSchedule,
  getBudgetItems,
  getTotalBudget,
  getAppLanguage,
  type AppLanguage,
} from "@/lib/storage";
import { rescheduleAllNotifications } from "@/lib/notifications";
import { WeddingDetails, ScheduleEvent } from "@/lib/types";
import { useEventType } from "@/hooks/useEventType";
import { getDateLabel } from "@shared/event-types";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "";
const COUPLE_STORAGE_KEY = "wedflow_couple_session";

type NavigationProp = NativeStackNavigationProp<PlanningStackParamList>;

const DEFAULT_WEDDING_NB: WeddingDetails = {
  coupleNames: "Ditt bryllup",
  weddingDate: "2026-06-20",
  venue: "Legg inn detaljer",
};

const DEFAULT_WEDDING_EN: WeddingDetails = {
  coupleNames: "Your wedding",
  weddingDate: "2026-06-20",
  venue: "Add details",
};

function getDaysUntilWedding(dateStr: string): number {
  try {
    const weddingDate = new Date(dateStr);
    if (isNaN(weddingDate.getTime())) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    weddingDate.setHours(0, 0, 0, 0);
    const diffTime = weddingDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

function formatWeddingDate(dateStr: string, locale: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // Fallback to raw string
    return date.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
  } catch {
    return dateStr;
  }
}

interface ActionItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle?: string;
  theme: ReturnType<typeof useTheme>["theme"];
  onPress: () => void;
  color?: string;
  badge?: number;
}

function ActionItem({ icon, label, subtitle, theme, onPress, color, badge }: ActionItemProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const iconColor = color || theme.accent;

  return (
    <Pressable
      onPress={() => {
        onPress();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
    >
      <Animated.View style={[styles.actionItem, { backgroundColor: theme.backgroundDefault }, animatedStyle]}>
        <View style={[styles.actionIcon, { backgroundColor: iconColor + "15" }]}>
          <Feather name={icon} size={20} color={iconColor} />
        </View>
        <View style={styles.actionContent}>
          <ThemedText style={styles.actionLabel}>{label}</ThemedText>
          {subtitle ? <ThemedText style={[styles.actionSubtitle, { color: theme.textMuted }]}>{subtitle}</ThemedText> : null}
        </View>
        {badge !== undefined && badge > 0 ? (
          <View style={[styles.badge, { backgroundColor: theme.accent }]}>
            <ThemedText style={styles.badgeText}>{badge}</ThemedText>
          </View>
        ) : null}
        <Feather name="chevron-right" size={18} color={theme.textMuted} />
      </Animated.View>
    </Pressable>
  );
}

interface QuickButtonProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  color?: string;
  theme: ReturnType<typeof useTheme>["theme"];
  onPress: () => void;
}

function QuickButton({ icon, label, color, theme, onPress }: QuickButtonProps) {
  return (
    <Pressable
      onPress={() => {
        onPress();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.quickButton, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={[styles.quickButtonIcon, { backgroundColor: (color || theme.accent) + "15" }]}>
        <Feather name={icon} size={18} color={color || theme.accent} />
      </View>
      <ThemedText style={styles.quickButtonLabel} numberOfLines={1}>{label}</ThemedText>
    </Pressable>
  );
}

export default function PlanningScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { eventType, hasFeature, isWedding, config } = useEventType();
  const navigation = useNavigation<NavigationProp>();

  const [appLanguage, setAppLanguage] = useState<AppLanguage>("nb");
  const [wedding, setWedding] = useState<WeddingDetails | null>(null);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [budgetUsed, setBudgetUsed] = useState(0);
  const [totalBudget, setTotalBudget] = useState(300000);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLanguage() {
      const language = await getAppLanguage();
      setAppLanguage(language);
    }
    loadLanguage();
  }, []);

  const t = useCallback((nb: string, en: string) => (appLanguage === "en" ? en : nb), [appLanguage]);
  const locale = appLanguage === "en" ? "en-US" : "nb-NO";
  const defaultWedding = appLanguage === "en" ? DEFAULT_WEDDING_EN : DEFAULT_WEDDING_NB;
  const defaultCoupleNames = [DEFAULT_WEDDING_NB.coupleNames, DEFAULT_WEDDING_EN.coupleNames];
  const defaultVenues = [DEFAULT_WEDDING_NB.venue, DEFAULT_WEDDING_EN.venue];
  const currencyLabel = t("kr", "NOK");
  const formatCurrency = useCallback(
    (value: number) => `${Math.abs(value).toLocaleString(locale)} ${currencyLabel}`,
    [currencyLabel, locale]
  );

  const isDefaultCoupleName = wedding ? defaultCoupleNames.includes(wedding.coupleNames) : true;
  const isDefaultVenue = wedding ? defaultVenues.includes(wedding.venue) : true;
  const eventDefaultName = config ? t(config.roleLabels.primary.no, config.roleLabels.primary.en) : t("Ditt arrangement", "Your event");
  const displayCoupleNames = wedding?.coupleNames && !isDefaultCoupleName
    ? wedding.coupleNames
    : (isWedding ? t(DEFAULT_WEDDING_NB.coupleNames, DEFAULT_WEDDING_EN.coupleNames) : eventDefaultName);
  const displayVenue = wedding?.venue && !isDefaultVenue
    ? wedding.venue
    : t(DEFAULT_WEDDING_NB.venue, DEFAULT_WEDDING_EN.venue);

  const loadData = useCallback(async () => {
    try {
      setError(null);

      // Try to fetch real project data from the API
      let apiWedding: WeddingDetails | null = null;
      let apiBudget: number | null = null;
      try {
        const sessionStr = await AsyncStorage.getItem(COUPLE_STORAGE_KEY);
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          const token = session.sessionToken || session.token;
          if (token) {
            const res = await fetch(`${API_BASE}/api/couples/dashboard`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
              const dashboard = await res.json();
              // Use the first project's data if available
              if (dashboard.projects && dashboard.projects.length > 0) {
                const project = dashboard.projects[0];
                const couple = dashboard.couple;
                apiWedding = {
                  coupleNames: couple?.displayName && couple.displayName !== couple.email?.split("@")[0]
                    ? couple.displayName
                    : project.name || defaultWedding.coupleNames,
                  weddingDate: project.event_date || couple?.weddingDate || defaultWedding.weddingDate,
                  venue: project.location || defaultWedding.venue,
                };
                // Use project budget if available
                if (project.budget) {
                  apiBudget = Number(project.budget);
                }
                // Save to local storage for offline use
                await saveWeddingDetails(apiWedding);
                await rescheduleAllNotifications(true);
              }
            }
          }
        }
      } catch (apiErr) {
        console.log("API fetch failed, using local data:", apiErr);
      }

      const [localWeddingData, scheduleData, budgetItems, storedBudget] = await Promise.all([
        getWeddingDetails(),
        getSchedule(),
        getBudgetItems(),
        getTotalBudget(),
      ]);

      // Prefer API data, then local, then defaults
      setWedding(apiWedding || localWeddingData || defaultWedding);
      // Sort schedule by time
      const sortedSchedule = scheduleData.sort((a, b) => {
        const timeA = a.time.replace(":", "");
        const timeB = b.time.replace(":", "");
        return timeA.localeCompare(timeB);
      });
      setSchedule(sortedSchedule);
      setBudgetUsed(budgetItems.reduce((sum, item) => sum + item.estimatedCost, 0));
      setTotalBudget(apiBudget || storedBudget || 300000);
    } catch (err) {
      console.error("Failed to load planning data:", err);
      setError((err as Error).message || t("Kunne ikke laste data", "Could not load data"));
      // Set defaults on error
      setWedding(defaultWedding);
      setSchedule([]);
      setBudgetUsed(0);
      setTotalBudget(300000);
    } finally {
      setLoading(false);
    }
  }, [defaultWedding, t]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [loadData]);

  const daysLeft = wedding ? getDaysUntilWedding(wedding.weddingDate) : 0;
  const budgetPercent = totalBudget > 0 ? Math.round((budgetUsed / totalBudget) * 100) : 0;
  const budgetRemaining = totalBudget - budgetUsed;
  const isOverBudget = budgetUsed > totalBudget;

  // Helper: Calculate completion percentage
  const calculateCompletion = useCallback(() => {
    let completed = 0;
    const total = 10;
    if (wedding && !isDefaultCoupleName) completed++;
    if (wedding && !isDefaultVenue) completed++;
    if (schedule.length > 0) completed++;
    if (budgetUsed > 0) completed++;
    if (budgetPercent <= 100) completed++; // Budget under control
    // Remaining 5 items tracked by actual data
    if (schedule.length >= 5) completed++; // Good amount of timeline events
    if (schedule.length >= 10) completed++; // Well-planned timeline
    if (budgetUsed >= 3) completed++; // At least 3 budget items
    if (wedding && wedding.weddingDate) completed++; // Wedding date set
    if (budgetPercent > 0 && budgetPercent <= 80) completed++; // Budget well managed
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  }, [wedding, schedule.length, budgetUsed, budgetPercent, isDefaultCoupleName, isDefaultVenue]);

  const completion = calculateCompletion();

  // Helper: Get smart quick actions based on days left
  const getSmartQuickActions = useCallback(() => {
    const actions = [];
    if (daysLeft <= 7) {
      // Last week - prioritize weather and coordinators
      actions.push({ icon: "cloud" as const, label: t("Vær", "Weather"), color: "#64B5F6", screen: "Weather" });
      actions.push({ icon: "users" as const, label: t("Team", "Team"), color: theme.accent, screen: "ImportantPeople" });
      actions.push({ icon: "check-square" as const, label: t("Sjekkliste", "Checklist"), color: theme.accent, screen: "Checklist" });
      actions.push({ icon: "bell" as const, label: t("Påminnelser", "Reminders"), color: "#FFB74D", screen: "Reminders" });
      actions.push({ icon: "calendar" as const, label: t("Kjøreplan", "Schedule"), color: theme.accent, screen: "Schedule" });
    } else if (daysLeft <= 30) {
      // Last month - focus on reminders and checklist
      actions.push({ icon: "bell" as const, label: t("Påminnelser", "Reminders"), color: "#FFB74D", screen: "Reminders" });
      actions.push({ icon: "check-square" as const, label: t("Sjekkliste", "Checklist"), color: theme.accent, screen: "Checklist" });
      actions.push({ icon: "cloud" as const, label: t("Vær", "Weather"), color: "#64B5F6", screen: "Weather" });
      actions.push({ icon: "heart" as const, label: t("Pust", "Breathe"), color: "#81C784", screen: "StressTracker" });
      actions.push({ icon: "book-open" as const, label: t("Tradisjoner", "Traditions"), color: "#BA68C8", screen: "Traditions" });
    } else if (daysLeft <= 60) {
      // 2 months - add stress tracker
      actions.push({ icon: "check-square" as const, label: t("Sjekkliste", "Checklist"), color: theme.accent, screen: "Checklist" });
      actions.push({ icon: "heart" as const, label: t("Pust", "Breathe"), color: "#81C784", screen: "StressTracker" });
      actions.push({ icon: "bell" as const, label: t("Påminnelser", "Reminders"), color: "#FFB74D", screen: "Reminders" });
      actions.push({ icon: "book-open" as const, label: t("Tradisjoner", "Traditions"), color: "#BA68C8", screen: "Traditions" });
      actions.push({ icon: "cloud" as const, label: t("Vær", "Weather"), color: "#64B5F6", screen: "Weather" });
    } else {
      // Default - more planning focused
      actions.push({ icon: "check-square" as const, label: t("Sjekkliste", "Checklist"), color: theme.accent, screen: "Checklist" });
      actions.push({ icon: "bell" as const, label: t("Påminnelser", "Reminders"), color: "#FFB74D", screen: "Reminders" });
      actions.push({ icon: "cloud" as const, label: t("Vær", "Weather"), color: "#64B5F6", screen: "Weather" });
      actions.push({ icon: "heart" as const, label: t("Pust", "Breathe"), color: "#81C784", screen: "StressTracker" });
      actions.push({ icon: "book-open" as const, label: t("Tradisjoner", "Traditions"), color: "#BA68C8", screen: "Traditions" });
    }
    return actions;
  }, [daysLeft, theme.accent, t]);

  const smartActions = getSmartQuickActions();

  // Helper: Get next steps suggestions
  const getNextSteps = useCallback(() => {
    const steps = [];
    if (schedule.length === 0) {
      steps.push({ icon: "calendar" as const, label: t("Lag kjøreplan for dagen", "Build day-of schedule"), screen: "Schedule", priority: "high" });
    }
    if (budgetUsed === 0) {
      steps.push({ icon: "dollar-sign" as const, label: t("Registrer budsjettpost", "Add budget item"), screen: "Budget", priority: daysLeft < 60 ? "high" : "normal" });
    }
    if (isOverBudget) {
      steps.push({ icon: "sliders" as const, label: t("Sjekk budsjettscenario", "Check budget scenarios"), screen: "BudgetScenarios", priority: "urgent" });
    }
    if (daysLeft <= 30 && daysLeft > 0) {
      steps.push({ icon: "bell" as const, label: t("Legg til påminnelse", "Add reminder"), screen: "Reminders", priority: "high" });
    }
    if (daysLeft <= 7 && daysLeft > 0) {
      steps.push({ icon: "cloud" as const, label: t("Sjekk værmelding", "Check the forecast"), screen: "Weather", priority: "urgent" });
    }
    if (wedding && isDefaultCoupleName) {
      steps.push({ icon: "heart" as const, label: t("Fyll inn bryllupsdetaljer", "Fill in wedding details"), screen: "WeddingDetails", priority: "normal" });
    }
    return steps.slice(0, 3); // Max 3 suggestions
  }, [schedule.length, budgetUsed, isOverBudget, daysLeft, wedding, isDefaultCoupleName, t]);

  const nextSteps = getNextSteps();

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText style={{ color: theme.textSecondary }}>{t("Laster...", "Loading...")}</ThemedText>
      </View>
    );
  }

  if (error && !wedding) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot, padding: Spacing.xl }]}>
        <Feather name="alert-circle" size={48} color="#FF3B30" style={{ marginBottom: Spacing.md }} />
        <ThemedText style={{ fontSize: 18, fontWeight: "600", color: theme.text, marginBottom: Spacing.xs, textAlign: "center" }}>
          {t("Kunne ikke laste planlegging", "Could not load planning")}
        </ThemedText>
        <ThemedText style={{ fontSize: 14, color: theme.textMuted, marginBottom: Spacing.lg, textAlign: "center" }}>
          {error}
        </ThemedText>
        <Pressable
          onPress={loadData}
          style={{
            backgroundColor: theme.accent,
            paddingHorizontal: Spacing.xl,
            paddingVertical: Spacing.md,
            borderRadius: BorderRadius.sm,
          }}
        >
          <ThemedText style={{ color: "#FFFFFF", fontWeight: "600" }}>{t("Prøv igjen", "Try again")}</ThemedText>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.md,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}
    >
      <Animated.View entering={FadeInDown.delay(50).duration(400)}>
        <View style={[styles.heroCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.heroTop}>
            <View>
              <ThemedText style={styles.heroNames}>{displayCoupleNames}</ThemedText>
              <ThemedText style={[styles.heroVenue, { color: theme.textSecondary }]}>
                <Feather name="map-pin" size={12} color={theme.textMuted} /> {displayVenue}
              </ThemedText>
            </View>
            <View style={styles.heroCountdown}>
              <ThemedText style={[styles.heroDays, { color: theme.accent }]}>{daysLeft}</ThemedText>
              <ThemedText style={[styles.heroDaysLabel, { color: theme.textMuted }]}>
                {t(daysLeft === 1 ? "dag" : "dager", daysLeft === 1 ? "day" : "days")}
              </ThemedText>
            </View>
          </View>
          <View style={[styles.heroDivider, { backgroundColor: theme.border }]} />
          <View style={styles.heroBottom}>
            <Pressable
              onPress={() => {
                navigation.navigate("Schedule");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={styles.heroStat}
            >
              <Feather name="calendar" size={14} color={theme.accent} />
              <ThemedText style={[styles.heroStatText, { color: theme.text }]}>
                {wedding ? formatWeddingDate(wedding.weddingDate, locale) : ""}
              </ThemedText>
              <Feather name="chevron-right" size={14} color={theme.textMuted} style={{ marginLeft: 4 }} />
            </Pressable>
            <Pressable
              onPress={() => {
                navigation.navigate("Budget");
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={styles.heroStat}
            >
              <Feather name="dollar-sign" size={14} color={isOverBudget ? "#FF3B30" : theme.accent} />
              <ThemedText style={[styles.heroStatText, { color: isOverBudget ? "#FF3B30" : theme.text }]}>
                {t(`${budgetPercent}% brukt`, `${budgetPercent}% spent`)} {isOverBudget
                  ? t(`(+${formatCurrency(budgetRemaining)} over)`, `(+${formatCurrency(budgetRemaining)} over budget)`)
                  : t(`(${formatCurrency(budgetRemaining)} igjen)`, `(${formatCurrency(budgetRemaining)} remaining)`)
                }
              </ThemedText>
              <Feather name="chevron-right" size={14} color={theme.textMuted} style={{ marginLeft: 4 }} />
            </Pressable>
          </View>
        </View>
      </Animated.View>

      {/* Dynamic CTAs based on state */}
      {schedule.length === 0 && (
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <Pressable
            onPress={() => {
              navigation.navigate("Schedule");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[styles.ctaCard, { backgroundColor: theme.accent + "15", borderColor: theme.accent }]}
          >
            <View style={[styles.ctaIcon, { backgroundColor: theme.accent }]}>
              <Feather name="calendar" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.ctaContent}>
              <ThemedText style={[styles.ctaTitle, { color: theme.text }]}>{t("Lag kjøreplan", "Create schedule")}</ThemedText>
              <ThemedText style={[styles.ctaSubtitle, { color: theme.textMuted }]}>
                {t("Planlegg timeplan for bryllupsdagen", "Plan the wedding day timeline")}
              </ThemedText>
            </View>
            <Feather name="arrow-right" size={20} color={theme.accent} />
          </Pressable>
        </Animated.View>
      )}

      {budgetUsed === 0 && (
        <Animated.View entering={FadeInDown.delay(110).duration(400)}>
          <Pressable
            onPress={() => {
              navigation.navigate("Budget");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[styles.ctaCard, { backgroundColor: theme.accent + "15", borderColor: theme.accent }]}
          >
            <View style={[styles.ctaIcon, { backgroundColor: theme.accent }]}>
              <Feather name="dollar-sign" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.ctaContent}>
              <ThemedText style={[styles.ctaTitle, { color: theme.text }]}>{t("Sett budsjett", "Set budget")}</ThemedText>
              <ThemedText style={[styles.ctaSubtitle, { color: theme.textMuted }]}>
                {t("Få oversikt over utgifter", "Track your spending")}
              </ThemedText>
            </View>
            <Feather name="arrow-right" size={20} color={theme.accent} />
          </Pressable>
        </Animated.View>
      )}

      {isOverBudget && (
        <Animated.View entering={FadeInDown.delay(110).duration(400)}>
          <Pressable
            onPress={() => {
              navigation.navigate("BudgetScenarios");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[styles.warningCard, { backgroundColor: "#FF3B3015", borderColor: "#FF3B30" }]}
          >
            <View style={[styles.ctaIcon, { backgroundColor: "#FF3B30" }]}>
              <Feather name="alert-triangle" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.ctaContent}>
              <ThemedText style={[styles.ctaTitle, { color: "#FF3B30" }]}>{t("Budsjett overskridet", "Budget exceeded")}</ThemedText>
              <ThemedText style={[styles.ctaSubtitle, { color: theme.textMuted }]}>
                {t("Sjekk scenario-kalkulator", "Review scenario calculator")}
              </ThemedText>
            </View>
            <Feather name="arrow-right" size={20} color="#FF3B30" />
          </Pressable>
        </Animated.View>
      )}

      {daysLeft <= 30 && daysLeft > 0 && !isOverBudget && (
        <Animated.View entering={FadeInDown.delay(110).duration(400)}>
          <Pressable
            onPress={() => {
              navigation.navigate("Checklist");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[styles.urgencyCard, { backgroundColor: "#FFB74D15", borderColor: "#FFB74D" }]}
          >
            <View style={[styles.ctaIcon, { backgroundColor: "#FFB74D" }]}>
              <Feather name="clock" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.ctaContent}>
              <ThemedText style={[styles.ctaTitle, { color: "#FFB74D" }]}>
                {daysLeft <= 7 ? t("Siste uke!", "Final week!") : t("Bare én måned igjen", "One month left")}
              </ThemedText>
              <ThemedText style={[styles.ctaSubtitle, { color: theme.textMuted }]}>
                {t("Sjekk at alt er på plass", "Make sure everything is ready")}
              </ThemedText>
            </View>
            <Feather name="arrow-right" size={20} color="#FFB74D" />
          </Pressable>
        </Animated.View>
      )}

      {/* Progress Widget */}
      <Animated.View entering={FadeInDown.delay(125).duration(400)}>
        <View style={[styles.progressCard, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.progressHeader}>
            <ThemedText style={[styles.progressTitle, { color: theme.text }]}>{t("Fremdrift", "Progress")}</ThemedText>
            <ThemedText style={[styles.progressPercentage, { color: theme.accent }]}>
              {completion.percentage}%
            </ThemedText>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View style={[styles.progressFill, { backgroundColor: theme.accent, width: `${completion.percentage}%` }]} />
          </View>
          <ThemedText style={[styles.progressLabel, { color: theme.textMuted }]}>
            {t(
              `${completion.completed} av ${completion.total} seksjoner fullført`,
              `${completion.completed} of ${completion.total} sections completed`
            )}
          </ThemedText>
        </View>
      </Animated.View>

      {/* Next Steps Widget */}
      {nextSteps.length > 0 && (
        <Animated.View entering={FadeInDown.delay(140).duration(400)}>
          <View style={[styles.nextStepsCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={[styles.nextStepsTitle, { color: theme.text }]}>{t("Neste steg", "Next steps")}</ThemedText>
            {nextSteps.map((step, idx) => {
              const borderColor =
                step.priority === "urgent"
                  ? "#FF3B30"
                  : step.priority === "high"
                  ? "#FFB74D"
                  : theme.accent;
              return (
                <Pressable
                  key={idx}
                  onPress={() => {
                    navigation.navigate(step.screen as any);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[styles.nextStep, { borderLeftColor: borderColor, borderLeftWidth: 3 }]}
                >
                  <Feather name={step.icon} size={16} color={borderColor} />
                  <ThemedText style={[styles.nextStepLabel, { color: theme.text, flex: 1 }]}>
                    {step.label}
                  </ThemedText>
                  <Feather name="chevron-right" size={16} color={theme.textMuted} />
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(150).duration(400)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll} contentContainerStyle={styles.quickScrollContent}>
          {smartActions.map((action, idx) => (
            <QuickButton
              key={idx}
              icon={action.icon}
              label={action.label}
              color={action.color}
              theme={theme}
              onPress={() => navigation.navigate(action.screen as any)}
            />
          ))}
        </ScrollView>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(250).duration(400)}>
        <ThemedText style={styles.sectionTitle}>{t("Planlegging", "Planning")}</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
          <ActionItem icon="calendar" label={t("Kjøreplan", "Schedule")} subtitle={t("Planlegg bryllupsdagen", "Plan the wedding day")} theme={theme} onPress={() => navigation.navigate("Schedule")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="clock" label={t("Tidslinje", "Timeline")} subtitle={t("Visuell oversikt", "Visual overview")} theme={theme} onPress={() => navigation.navigate("Timeline")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="camera" label={t("Foto & Video Tidsplan", "Photo & Video Timeline")} subtitle={t("Beregn tid for opptak", "Estimate time for shoots")} theme={theme} onPress={() => navigation.navigate("AITime")} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(350).duration(400)}>
        {hasFeature("dressTracking") && (
        <>
        <ThemedText style={styles.sectionTitle}>{t("Antrekk & Styling", "Attire & Styling")}</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
          <ActionItem icon="heart" label={t("Brudekjole", "Wedding dress")} subtitle={t("Prøvinger og favoritter", "Fittings and favorites")} theme={theme} onPress={() => navigation.navigate("Brudekjole")} color="#BA68C8" />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="scissors" label={t("Hår & Makeup", "Hair & Makeup")} subtitle={t("Avtaler og looks", "Appointments and looks")} theme={theme} onPress={() => navigation.navigate("HaarMakeup")} color="#E91E63" />
        </View>
        </>
        )}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(375).duration(400)}>
        <ThemedText style={styles.sectionTitle}>{t("Mat & Servering", "Food & Catering")}</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
          <ActionItem icon="coffee" label={t("Catering", "Catering")} subtitle={t("Menyer og smaksprøver", "Menus and tastings")} theme={theme} onPress={() => navigation.navigate("Catering")} color="#FF9800" />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="gift" label={t(isWedding ? "Bryllupskake" : "Kake", isWedding ? "Wedding cake" : "Cake")} subtitle={t("Design og smaker", "Design and flavors")} theme={theme} onPress={() => navigation.navigate("Kake")} color="#F06292" />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(385).duration(400)}>
        <ThemedText style={styles.sectionTitle}>{t("Dekor & Logistikk", "Decor & Logistics")}</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
          <ActionItem icon="sun" label={t("Blomster", "Flowers")} subtitle={t("Florist og arrangementer", "Florist and arrangements")} theme={theme} onPress={() => navigation.navigate("Blomster")} color="#4CAF50" />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="truck" label={t("Transport", "Transport")} subtitle={t("Biler og sjåfører", "Cars and drivers")} theme={theme} onPress={() => navigation.navigate("Transport")} color="#607D8B" />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="home" label={t("Lokale", "Venue")} subtitle={t(isWedding ? "Bryllupslokale og seremoni" : "Lokale og arrangement", isWedding ? "Venue and ceremony" : "Venue and event")} theme={theme} onPress={() => navigation.navigate("Venue")} color="#795548" />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(410).duration(400)}>
        <ThemedText style={styles.sectionTitle}>{t("Foto, Video & Musikk", "Photo, Video & Music")}</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
          <ActionItem icon="camera" label={t("Fotograf", "Photographer")} subtitle={t("Økter og leveranse", "Sessions and delivery")} theme={theme} onPress={() => navigation.navigate("Fotograf")} color="#2196F3" />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="video" label={t("Videograf", "Videographer")} subtitle={t("Film og redigering", "Film and editing")} theme={theme} onPress={() => navigation.navigate("Videograf")} color="#3F51B5" />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="music" label={t("Musikk & DJ", "Music & DJ")} subtitle={t("Band og spilleliste", "Band and playlist")} theme={theme} onPress={() => navigation.navigate("Musikk")} color="#9C27B0" />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(425).duration(400)}>
        <ThemedText style={styles.sectionTitle}>{t("Koordinering", "Coordination")}</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
          <ActionItem icon="clipboard" label={t(isWedding ? "Bryllupsplanlegger" : "Planlegger", isWedding ? "Wedding planner" : "Event planner")} subtitle={t("Profesjonell planlegging", "Professional planning")} theme={theme} onPress={() => navigation.navigate("Planlegger")} color="#00BCD4" />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(450).duration(400)}>
        <ThemedText style={styles.sectionTitle}>{t("Økonomi", "Finances")}</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
          <ActionItem icon="dollar-sign" label={t("Budsjett", "Budget")} subtitle={t(`${budgetPercent}% brukt`, `${budgetPercent}% spent`)} theme={theme} onPress={() => navigation.navigate("Budget")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="sliders" label={t("Hva om...?", "What if...?")} subtitle={t("Scenario-kalkulator", "Scenario calculator")} theme={theme} onPress={() => navigation.navigate("BudgetScenarios")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="briefcase" label={t("Leverandører", "Vendors")} subtitle={t("Skandinaviske leverandører", "Scandinavian vendors")} theme={theme} onPress={() => navigation.navigate("Vendors")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="search" label={t("Finn leverandør", "Find vendor")} subtitle={t("Basert på dine preferanser", "Based on your preferences")} theme={theme} onPress={() => navigation.navigate("VendorMatching", {})} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).duration(400)}>
        <ThemedText style={styles.sectionTitle}>{t("Team", "Team")}</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
          <ActionItem icon="users" label={t("Viktige personer", "Key people")} subtitle={t(isWedding ? "Forlovere, toastmaster" : "Nøkkelpersoner", isWedding ? "Bridal party, toastmaster" : "Key contacts")} theme={theme} onPress={() => navigation.navigate("ImportantPeople") } />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="message-circle" label={t("Meldinger", "Messages")} subtitle={t("Chat med leverandører", "Chat with vendors")} theme={theme} onPress={() => navigation.navigate("Messages")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="file-text" label={t("Tilbud", "Offers")} subtitle={t("Se pristilbud fra leverandører", "View vendor quotes")} theme={theme} onPress={() => navigation.navigate("CoupleOffers")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="check-square" label={t("Avtaler", "Contracts")} subtitle={t("Dine aktive leverandøravtaler", "Your active vendor contracts")} theme={theme} onPress={() => navigation.navigate("CoupleContracts")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="gift" label={t("Hent leveranse", "Get delivery")} subtitle={t("Bilder/video fra fotograf", "Photos/video from photographer")} theme={theme} onPress={() => navigation.navigate("DeliveryAccess")} />
        </View>
      </Animated.View>

      {schedule.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <View style={[styles.schedulePreview, { backgroundColor: theme.backgroundDefault }]}>
            <Pressable
              onPress={() => navigation.navigate("Schedule")}
              style={styles.scheduleHeader}
            >
              <ThemedText style={styles.scheduleTitle}>{t("Neste hendelser", "Next events")}</ThemedText>
              <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm }}>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    navigation.navigate("Schedule");
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[styles.scheduleAddButton, { backgroundColor: theme.accent + "15" }]}
                >
                  <Feather name="plus" size={16} color={theme.accent} />
                </Pressable>
                <Feather name="arrow-right" size={16} color={theme.accent} />
              </View>
            </Pressable>
            {schedule.slice(0, 2).map((event, idx) => (
              <Pressable
                key={event.id}
                onPress={() => navigation.navigate("Schedule")}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  navigation.navigate("Schedule");
                }}
                style={styles.scheduleRow}
              >
                <View style={[styles.scheduleTime, { backgroundColor: theme.accent + "20" }]}>
                  <ThemedText style={[styles.scheduleTimeText, { color: theme.accent }]}>{event.time}</ThemedText>
                </View>
                <ThemedText style={styles.scheduleEventTitle}>{event.title}</ThemedText>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },

  heroCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  heroNames: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  heroVenue: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  heroCountdown: {
    alignItems: "center",
  },
  heroDays: {
    fontSize: 44,
    fontWeight: "700",
    lineHeight: 48,
  },
  heroDaysLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginTop: -4,
  },
  heroDivider: {
    height: 1,
    marginVertical: Spacing.md,
  },
  heroBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  heroStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  heroStatText: {
    fontSize: 13,
  },

  quickScroll: {
    marginBottom: Spacing.lg,
    marginHorizontal: -Spacing.lg,
  },
  quickScrollContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  quickButton: {
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    minWidth: 80,
  },
  quickButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  quickButtonLabel: {
    fontSize: 12,
    fontWeight: "500",
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888888",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  sectionCard: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    marginBottom: Spacing.md,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  actionContent: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  actionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginLeft: 64,
  },

  schedulePreview: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.sm,
  },
  scheduleHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  scheduleTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  scheduleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  scheduleTime: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
  },
  scheduleTimeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  scheduleEventTitle: {
    fontSize: 14,
    flex: 1,
  },
  scheduleAddButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },

  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.xs,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
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
  warningCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  urgencyCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },

  progressCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  progressPercentage: {
    fontSize: 18,
    fontWeight: "700",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
  },

  nextStepsCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  nextStepsTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  nextStep: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  nextStepLabel: {
    fontSize: 14,
  },
});
