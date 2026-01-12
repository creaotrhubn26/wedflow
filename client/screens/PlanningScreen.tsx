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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { PlanningStackParamList } from "@/navigation/PlanningStackNavigator";
import {
  getWeddingDetails,
  getSchedule,
  getBudgetItems,
  getTotalBudget,
} from "@/lib/storage";
import { WeddingDetails, ScheduleEvent } from "@/lib/types";

type NavigationProp = NativeStackNavigationProp<PlanningStackParamList>;

const DEFAULT_WEDDING: WeddingDetails = {
  coupleNames: "Emma & Erik",
  weddingDate: "2026-06-20",
  venue: "Oslo",
};

function getDaysUntilWedding(dateStr: string): number {
  const weddingDate = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  weddingDate.setHours(0, 0, 0, 0);
  const diffTime = weddingDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function formatWeddingDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

interface QuickActionProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  theme: any;
  badge?: string;
  color?: string;
  onPress: () => void;
}

function QuickActionCard({ icon, label, theme, badge, color, onPress }: QuickActionProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Pressable
      onPress={() => {
        onPress();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      onPressIn={() => { scale.value = withSpring(0.95, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
    >
      <Animated.View
        style={[styles.quickCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }, animatedStyle]}
      >
        <View style={[styles.quickIcon, { backgroundColor: (color || Colors.dark.accent) + "20" }]}>
          <Feather name={icon} size={18} color={color || Colors.dark.accent} />
        </View>
        <ThemedText style={styles.quickLabel} numberOfLines={1}>{label}</ThemedText>
        {badge ? <ThemedText style={[styles.quickBadge, { color: color || Colors.dark.accent }]}>{badge}</ThemedText> : null}
      </Animated.View>
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

  const loadData = useCallback(async () => {
    const [weddingData, scheduleData, budgetItems, budget] = await Promise.all([
      getWeddingDetails(),
      getSchedule(),
      getBudgetItems(),
      getTotalBudget(),
    ]);

    setWedding(weddingData || DEFAULT_WEDDING);
    setSchedule(scheduleData);
    setBudgetUsed(budgetItems.reduce((sum, item) => sum + item.estimatedCost, 0));
    setTotalBudget(budget);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadData);
    return unsubscribe;
  }, [navigation, loadData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [loadData]);

  const daysLeft = wedding ? getDaysUntilWedding(wedding.weddingDate) : 0;
  const budgetPercent = Math.round((budgetUsed / totalBudget) * 100);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText style={{ color: theme.textSecondary }}>Laster...</ThemedText>
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
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.accent} />}
    >
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View style={styles.countdownCard}>
          <View style={styles.countdownContent}>
            <ThemedText style={[styles.daysNumber, { color: Colors.dark.accent }]}>{daysLeft}</ThemedText>
            <ThemedText style={[styles.daysLabel, { color: theme.textSecondary }]}>dager igjen</ThemedText>
          </View>
          <View style={styles.weddingInfo}>
            <ThemedText style={styles.coupleNames}>{wedding?.coupleNames}</ThemedText>
            <ThemedText style={[styles.weddingDate, { color: theme.textSecondary }]}>
              {wedding ? formatWeddingDate(wedding.weddingDate) : ""}
            </ThemedText>
            <ThemedText style={[styles.venue, { color: theme.textSecondary }]}>{wedding?.venue}</ThemedText>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <ThemedText type="h4" style={styles.sectionLabel}>Planlegging</ThemedText>
        <View style={styles.quickGrid}>
          <QuickActionCard icon="calendar" label="Kjøreplan" theme={theme} onPress={() => navigation.navigate("Schedule")} />
          <QuickActionCard icon="clock" label="Tidslinje" theme={theme} onPress={() => navigation.navigate("Timeline")} />
          <QuickActionCard icon="check-square" label="Sjekkliste" theme={theme} onPress={() => navigation.navigate("Checklist")} />
          <QuickActionCard icon="cpu" label="AI Tid" theme={theme} onPress={() => navigation.navigate("AITime")} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <ThemedText type="h4" style={styles.sectionLabel}>Økonomi</ThemedText>
        <View style={styles.quickGrid}>
          <QuickActionCard icon="dollar-sign" label="Budsjett" theme={theme} badge={`${budgetPercent}%`} onPress={() => navigation.navigate("Budget")} />
          <QuickActionCard icon="sliders" label="Hva om...?" theme={theme} onPress={() => navigation.navigate("BudgetScenarios")} />
          <QuickActionCard icon="briefcase" label="Leverandører" theme={theme} onPress={() => navigation.navigate("Vendors")} />
          <QuickActionCard icon="users" label="Viktige" theme={theme} onPress={() => navigation.navigate("ImportantPeople")} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <ThemedText type="h4" style={styles.sectionLabel}>Inspirasjon & Info</ThemedText>
        <View style={styles.quickGrid}>
          <QuickActionCard icon="book-open" label="Tradisjoner" theme={theme} color="#BA68C8" onPress={() => navigation.navigate("Traditions")} />
          <QuickActionCard icon="cloud" label="Værvarsel" theme={theme} color="#64B5F6" onPress={() => navigation.navigate("Weather")} />
          <QuickActionCard icon="heart" label="Avspenning" theme={theme} color="#81C784" onPress={() => navigation.navigate("StressTracker")} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(500).duration(400)}>
        <Card elevation={1} onPress={() => navigation.navigate("Schedule")} style={[styles.previewCard, { borderColor: theme.border }]}>
          <View style={styles.previewHeader}>
            <View style={styles.previewTitleRow}>
              <Feather name="clock" size={18} color={Colors.dark.accent} />
              <ThemedText type="h4" style={styles.previewTitle}>Dagens kjøreplan</ThemedText>
            </View>
            <Feather name="chevron-right" size={18} color={theme.textSecondary} />
          </View>
          {schedule.length > 0 ? (
            <View style={styles.schedulePreview}>
              {schedule.slice(0, 3).map((event) => (
                <View key={event.id} style={styles.scheduleRow}>
                  <ThemedText style={[styles.scheduleTime, { color: Colors.dark.accent }]}>{event.time}</ThemedText>
                  <ThemedText style={styles.scheduleTitle}>{event.title}</ThemedText>
                </View>
              ))}
            </View>
          ) : (
            <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>Ingen hendelser ennå</ThemedText>
          )}
        </Card>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  countdownCard: { flexDirection: "row", marginBottom: Spacing.xl, alignItems: "center" },
  countdownContent: { alignItems: "center", marginRight: Spacing["2xl"] },
  daysNumber: { fontSize: 52, fontWeight: "700" },
  daysLabel: { fontSize: 13, marginTop: -6 },
  weddingInfo: { flex: 1 },
  coupleNames: { fontSize: 20, fontWeight: "600", marginBottom: Spacing.xs },
  weddingDate: { fontSize: 13 },
  venue: { fontSize: 13 },
  sectionLabel: { marginBottom: Spacing.md, marginTop: Spacing.sm },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm, marginBottom: Spacing.lg },
  quickCard: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  quickIcon: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", marginRight: Spacing.sm },
  quickLabel: { flex: 1, fontSize: 13, fontWeight: "500" },
  quickBadge: { fontSize: 12, fontWeight: "600" },
  previewCard: { borderWidth: 1 },
  previewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.md },
  previewTitleRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  previewTitle: {},
  schedulePreview: { gap: Spacing.sm },
  scheduleRow: { flexDirection: "row", alignItems: "center" },
  scheduleTime: { width: 50, fontSize: 13, fontWeight: "600" },
  scheduleTitle: { fontSize: 14 },
  emptyText: { fontSize: 13 },
});
