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
} from "@/lib/storage";
import { WeddingDetails, ScheduleEvent } from "@/lib/types";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "";
const COUPLE_STORAGE_KEY = "wedflow_couple_session";

type NavigationProp = NativeStackNavigationProp<PlanningStackParamList>;

const DEFAULT_WEDDING: WeddingDetails = {
  coupleNames: "Ditt bryllup",
  weddingDate: "2026-06-20",
  venue: "Legg inn detaljer",
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

function formatWeddingDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr; // Fallback to raw string
    return date.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
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
  const navigation = useNavigation<NavigationProp>();

  const [wedding, setWedding] = useState<WeddingDetails | null>(null);
  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [budgetUsed, setBudgetUsed] = useState(0);
  const [totalBudget, setTotalBudget] = useState(300000);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                    : project.name || "Ditt bryllup",
                  weddingDate: project.event_date || couple?.weddingDate || "2026-06-20",
                  venue: project.location || "Legg inn detaljer",
                };
                // Use project budget if available
                if (project.budget) {
                  apiBudget = Number(project.budget);
                }
                // Save to local storage for offline use
                await saveWeddingDetails(apiWedding);
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
      setWedding(apiWedding || localWeddingData || DEFAULT_WEDDING);
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
      setError((err as Error).message || "Kunne ikke laste data");
      // Set defaults on error
      setWedding(DEFAULT_WEDDING);
      setSchedule([]);
      setBudgetUsed(0);
      setTotalBudget(300000);
    } finally {
      setLoading(false);
    }
  }, []);

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
    if (wedding && wedding.coupleNames !== "Ditt bryllup") completed++;
    if (wedding && wedding.venue !== "Legg inn detaljer") completed++;
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
  }, [wedding, schedule.length, budgetUsed, budgetPercent]);

  const completion = calculateCompletion();

  // Helper: Get smart quick actions based on days left
  const getSmartQuickActions = useCallback(() => {
    const actions = [];
    if (daysLeft <= 7) {
      // Last week - prioritize weather and coordinators
      actions.push({ icon: "cloud" as const, label: "Vær", color: "#64B5F6", screen: "Weather" });
      actions.push({ icon: "users" as const, label: "Team", color: theme.accent, screen: "ImportantPeople" });
      actions.push({ icon: "check-square" as const, label: "Sjekkliste", color: theme.accent, screen: "Checklist" });
      actions.push({ icon: "bell" as const, label: "Påminnelser", color: "#FFB74D", screen: "Reminders" });
      actions.push({ icon: "calendar" as const, label: "Kjøreplan", color: theme.accent, screen: "Schedule" });
    } else if (daysLeft <= 30) {
      // Last month - focus on reminders and checklist
      actions.push({ icon: "bell" as const, label: "Påminnelser", color: "#FFB74D", screen: "Reminders" });
      actions.push({ icon: "check-square" as const, label: "Sjekkliste", color: theme.accent, screen: "Checklist" });
      actions.push({ icon: "cloud" as const, label: "Vær", color: "#64B5F6", screen: "Weather" });
      actions.push({ icon: "heart" as const, label: "Pust", color: "#81C784", screen: "StressTracker" });
      actions.push({ icon: "book-open" as const, label: "Tradisjoner", color: "#BA68C8", screen: "Traditions" });
    } else if (daysLeft <= 60) {
      // 2 months - add stress tracker
      actions.push({ icon: "check-square" as const, label: "Sjekkliste", color: theme.accent, screen: "Checklist" });
      actions.push({ icon: "heart" as const, label: "Pust", color: "#81C784", screen: "StressTracker" });
      actions.push({ icon: "bell" as const, label: "Påminnelser", color: "#FFB74D", screen: "Reminders" });
      actions.push({ icon: "book-open" as const, label: "Tradisjoner", color: "#BA68C8", screen: "Traditions" });
      actions.push({ icon: "cloud" as const, label: "Vær", color: "#64B5F6", screen: "Weather" });
    } else {
      // Default - more planning focused
      actions.push({ icon: "check-square" as const, label: "Sjekkliste", color: theme.accent, screen: "Checklist" });
      actions.push({ icon: "bell" as const, label: "Påminnelser", color: "#FFB74D", screen: "Reminders" });
      actions.push({ icon: "cloud" as const, label: "Vær", color: "#64B5F6", screen: "Weather" });
      actions.push({ icon: "heart" as const, label: "Pust", color: "#81C784", screen: "StressTracker" });
      actions.push({ icon: "book-open" as const, label: "Tradisjoner", color: "#BA68C8", screen: "Traditions" });
    }
    return actions;
  }, [daysLeft, theme.accent]);

  const smartActions = getSmartQuickActions();

  // Helper: Get next steps suggestions
  const getNextSteps = useCallback(() => {
    const steps = [];
    if (schedule.length === 0) {
      steps.push({ icon: "calendar" as const, label: "Lag kjøreplan for dagen", screen: "Schedule", priority: "high" });
    }
    if (budgetUsed === 0) {
      steps.push({ icon: "dollar-sign" as const, label: "Registrer budsjettpost", screen: "Budget", priority: daysLeft < 60 ? "high" : "normal" });
    }
    if (isOverBudget) {
      steps.push({ icon: "sliders" as const, label: "Sjekk budsjettscenario", screen: "BudgetScenarios", priority: "urgent" });
    }
    if (daysLeft <= 30 && daysLeft > 0) {
      steps.push({ icon: "bell" as const, label: "Legg til påminnelse", screen: "Reminders", priority: "high" });
    }
    if (daysLeft <= 7 && daysLeft > 0) {
      steps.push({ icon: "cloud" as const, label: "Sjekk værmelding", screen: "Weather", priority: "urgent" });
    }
    if (wedding && wedding.coupleNames === "Ditt bryllup") {
      steps.push({ icon: "heart" as const, label: "Fyll inn bryllupsdetaljer", screen: "WeddingDetails", priority: "normal" });
    }
    return steps.slice(0, 3); // Max 3 suggestions
  }, [schedule.length, budgetUsed, isOverBudget, daysLeft, wedding]);

  const nextSteps = getNextSteps();

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText style={{ color: theme.textSecondary }}>Laster...</ThemedText>
      </View>
    );
  }

  if (error && !wedding) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot, padding: Spacing.xl }]}>
        <Feather name="alert-circle" size={48} color="#FF3B30" style={{ marginBottom: Spacing.md }} />
        <ThemedText style={{ fontSize: 18, fontWeight: "600", color: theme.text, marginBottom: Spacing.xs, textAlign: "center" }}>
          Kunne ikke laste planlegging
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
          <ThemedText style={{ color: "#FFFFFF", fontWeight: "600" }}>Prøv igjen</ThemedText>
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
              <ThemedText style={styles.heroNames}>{wedding?.coupleNames}</ThemedText>
              <ThemedText style={[styles.heroVenue, { color: theme.textSecondary }]}>
                <Feather name="map-pin" size={12} color={theme.textMuted} /> {wedding?.venue}
              </ThemedText>
            </View>
            <View style={styles.heroCountdown}>
              <ThemedText style={[styles.heroDays, { color: theme.accent }]}>{daysLeft}</ThemedText>
              <ThemedText style={[styles.heroDaysLabel, { color: theme.textMuted }]}>dager</ThemedText>
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
                {wedding ? formatWeddingDate(wedding.weddingDate) : ""}
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
                {budgetPercent}% brukt {isOverBudget ? `(+${Math.abs(budgetRemaining).toLocaleString("nb-NO")} kr over)` : `(${budgetRemaining.toLocaleString("nb-NO")} kr igjen)`}
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
              <ThemedText style={[styles.ctaTitle, { color: theme.text }]}>Lag kjøreplan</ThemedText>
              <ThemedText style={[styles.ctaSubtitle, { color: theme.textMuted }]}>
                Planlegg timeplan for bryllupsdagen
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
              <ThemedText style={[styles.ctaTitle, { color: theme.text }]}>Sett budsjett</ThemedText>
              <ThemedText style={[styles.ctaSubtitle, { color: theme.textMuted }]}>
                Få oversikt over utgifter
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
              <ThemedText style={[styles.ctaTitle, { color: "#FF3B30" }]}>Budsjett overskridet</ThemedText>
              <ThemedText style={[styles.ctaSubtitle, { color: theme.textMuted }]}>
                Sjekk scenario-kalkulator
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
                {daysLeft <= 7 ? "Siste uke!" : "Bare én måned igjen"}
              </ThemedText>
              <ThemedText style={[styles.ctaSubtitle, { color: theme.textMuted }]}>
                Sjekk at alt er på plass
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
            <ThemedText style={[styles.progressTitle, { color: theme.text }]}>Fremdrift</ThemedText>
            <ThemedText style={[styles.progressPercentage, { color: theme.accent }]}>
              {completion.percentage}%
            </ThemedText>
          </View>
          <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
            <View style={[styles.progressFill, { backgroundColor: theme.accent, width: `${completion.percentage}%` }]} />
          </View>
          <ThemedText style={[styles.progressLabel, { color: theme.textMuted }]}>
            {completion.completed} av {completion.total} seksjoner fullført
          </ThemedText>
        </View>
      </Animated.View>

      {/* Next Steps Widget */}
      {nextSteps.length > 0 && (
        <Animated.View entering={FadeInDown.delay(140).duration(400)}>
          <View style={[styles.nextStepsCard, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={[styles.nextStepsTitle, { color: theme.text }]}>Neste steg</ThemedText>
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
        <ThemedText style={styles.sectionTitle}>Planlegging</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
          <ActionItem icon="calendar" label="Kjøreplan" subtitle="Planlegg bryllupsdagen" theme={theme} onPress={() => navigation.navigate("Schedule")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="clock" label="Tidslinje" subtitle="Visuell oversikt" theme={theme} onPress={() => navigation.navigate("Timeline")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="camera" label="Foto & Video Tidsplan" subtitle="Beregn tid for opptak" theme={theme} onPress={() => navigation.navigate("AITime")} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(350).duration(400)}>
        <ThemedText style={styles.sectionTitle}>Antrekk & Styling</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
          <ActionItem icon="heart" label="Brudekjole" subtitle="Prøvinger og favoritter" theme={theme} onPress={() => navigation.navigate("Brudekjole")} color="#BA68C8" />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="scissors" label="Hår & Makeup" subtitle="Avtaler og looks" theme={theme} onPress={() => navigation.navigate("HaarMakeup")} color="#E91E63" />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(375).duration(400)}>
        <ThemedText style={styles.sectionTitle}>Mat & Servering</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
          <ActionItem icon="coffee" label="Catering" subtitle="Menyer og smaksprøver" theme={theme} onPress={() => navigation.navigate("Catering")} color="#FF9800" />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="gift" label="Bryllupskake" subtitle="Design og smaker" theme={theme} onPress={() => navigation.navigate("Kake")} color="#F06292" />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(385).duration(400)}>
        <ThemedText style={styles.sectionTitle}>Dekor & Logistikk</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
          <ActionItem icon="sun" label="Blomster" subtitle="Florist og arrangementer" theme={theme} onPress={() => navigation.navigate("Blomster")} color="#4CAF50" />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="truck" label="Transport" subtitle="Biler og sjåfører" theme={theme} onPress={() => navigation.navigate("Transport")} color="#607D8B" />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="home" label="Lokale" subtitle="Bryllupslokale og seremont" theme={theme} onPress={() => navigation.navigate("Venue")} color="#795548" />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(410).duration(400)}>
        <ThemedText style={styles.sectionTitle}>Foto, Video & Musikk</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
          <ActionItem icon="camera" label="Fotograf" subtitle="Økter og leveranse" theme={theme} onPress={() => navigation.navigate("Fotograf")} color="#2196F3" />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="video" label="Videograf" subtitle="Film og redigering" theme={theme} onPress={() => navigation.navigate("Videograf")} color="#3F51B5" />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="music" label="Musikk & DJ" subtitle="Band og spilleliste" theme={theme} onPress={() => navigation.navigate("Musikk")} color="#9C27B0" />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(425).duration(400)}>
        <ThemedText style={styles.sectionTitle}>Koordinering</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
          <ActionItem icon="clipboard" label="Bryllupsplanlegger" subtitle="Profesjonell planlegging" theme={theme} onPress={() => navigation.navigate("Planlegger")} color="#00BCD4" />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(450).duration(400)}>
        <ThemedText style={styles.sectionTitle}>Økonomi</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
          <ActionItem icon="dollar-sign" label="Budsjett" subtitle={`${budgetPercent}% brukt`} theme={theme} onPress={() => navigation.navigate("Budget")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="sliders" label="Hva om...?" subtitle="Scenario-kalkulator" theme={theme} onPress={() => navigation.navigate("BudgetScenarios")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="briefcase" label="Leverandører" subtitle="Skandinaviske leverandører" theme={theme} onPress={() => navigation.navigate("Vendors")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="search" label="Finn leverandør" subtitle="Basert på dine preferanser" theme={theme} onPress={() => navigation.navigate("VendorMatching", {})} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).duration(400)}>
        <ThemedText style={styles.sectionTitle}>Team</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
          <ActionItem icon="users" label="Viktige personer" subtitle="Forlovere, toastmaster" theme={theme} onPress={() => navigation.navigate("ImportantPeople")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="message-circle" label="Meldinger" subtitle="Chat med leverandører" theme={theme} onPress={() => navigation.navigate("Messages")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="file-text" label="Tilbud" subtitle="Se pristilbud fra leverandører" theme={theme} onPress={() => navigation.navigate("CoupleOffers")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="check-square" label="Avtaler" subtitle="Dine aktive leverandøravtaler" theme={theme} onPress={() => navigation.navigate("CoupleContracts")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="gift" label="Hent leveranse" subtitle="Bilder/video fra fotograf" theme={theme} onPress={() => navigation.navigate("DeliveryAccess")} />
        </View>
      </Animated.View>

      {schedule.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <View style={[styles.schedulePreview, { backgroundColor: theme.backgroundDefault }]}>
            <Pressable
              onPress={() => navigation.navigate("Schedule")}
              style={styles.scheduleHeader}
            >
              <ThemedText style={styles.scheduleTitle}>Neste hendelser</ThemedText>
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
