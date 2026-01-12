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
  return date.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
}

interface ActionItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle?: string;
  theme: any;
  onPress: () => void;
}

function ActionItem({ icon, label, subtitle, theme, onPress }: ActionItemProps) {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

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
        <View style={styles.actionIcon}>
          <Feather name={icon} size={20} color={Colors.dark.accent} />
        </View>
        <View style={styles.actionContent}>
          <ThemedText style={styles.actionLabel}>{label}</ThemedText>
          {subtitle ? <ThemedText style={[styles.actionSubtitle, { color: theme.textMuted }]}>{subtitle}</ThemedText> : null}
        </View>
        <Feather name="chevron-right" size={18} color={theme.textMuted} />
      </Animated.View>
    </Pressable>
  );
}

interface QuickButtonProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  color?: string;
  theme: any;
  onPress: () => void;
}

function QuickButton({ icon, label, color, theme, onPress }: QuickButtonProps) {
  return (
    <Pressable
      onPress={() => {
        onPress();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      style={[styles.quickButton, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={[styles.quickButtonIcon, { backgroundColor: (color || Colors.dark.accent) + "15" }]}>
        <Feather name={icon} size={18} color={color || Colors.dark.accent} />
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
        paddingTop: headerHeight + Spacing.md,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.accent} />}
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
              <ThemedText style={[styles.heroDays, { color: Colors.dark.accent }]}>{daysLeft}</ThemedText>
              <ThemedText style={[styles.heroDaysLabel, { color: theme.textMuted }]}>dager</ThemedText>
            </View>
          </View>
          <View style={[styles.heroDivider, { backgroundColor: theme.border }]} />
          <View style={styles.heroBottom}>
            <View style={styles.heroStat}>
              <Feather name="calendar" size={14} color={Colors.dark.accent} />
              <ThemedText style={[styles.heroStatText, { color: theme.text }]}>
                {wedding ? formatWeddingDate(wedding.weddingDate) : ""}
              </ThemedText>
            </View>
            <View style={styles.heroStat}>
              <Feather name="dollar-sign" size={14} color={Colors.dark.accent} />
              <ThemedText style={[styles.heroStatText, { color: theme.text }]}>
                {budgetPercent}% av budsjettet brukt
              </ThemedText>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(150).duration(400)}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickScroll} contentContainerStyle={styles.quickScrollContent}>
          <QuickButton icon="check-square" label="Sjekkliste" theme={theme} onPress={() => navigation.navigate("Checklist")} />
          <QuickButton icon="cloud" label="Vær" color="#64B5F6" theme={theme} onPress={() => navigation.navigate("Weather")} />
          <QuickButton icon="heart" label="Pust" color="#81C784" theme={theme} onPress={() => navigation.navigate("StressTracker")} />
          <QuickButton icon="book-open" label="Tradisjoner" color="#BA68C8" theme={theme} onPress={() => navigation.navigate("Traditions")} />
        </ScrollView>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(250).duration(400)}>
        <ThemedText style={styles.sectionTitle}>Planlegging</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
          <ActionItem icon="calendar" label="Kjøreplan" subtitle="Planlegg bryllupsdagen" theme={theme} onPress={() => navigation.navigate("Schedule")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="clock" label="Tidslinje" subtitle="Visuell oversikt" theme={theme} onPress={() => navigation.navigate("Timeline")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="cpu" label="AI Tidsberegner" subtitle="Smart fotoplanlegger" theme={theme} onPress={() => navigation.navigate("AITime")} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(350).duration(400)}>
        <ThemedText style={styles.sectionTitle}>Økonomi</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
          <ActionItem icon="dollar-sign" label="Budsjett" subtitle={`${budgetPercent}% brukt`} theme={theme} onPress={() => navigation.navigate("Budget")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="sliders" label="Hva om...?" subtitle="Scenario-kalkulator" theme={theme} onPress={() => navigation.navigate("BudgetScenarios")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="briefcase" label="Leverandører" subtitle="Skandinaviske leverandører" theme={theme} onPress={() => navigation.navigate("Vendors")} />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(450).duration(400)}>
        <ThemedText style={styles.sectionTitle}>Team</ThemedText>
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault }]}>
          <ActionItem icon="users" label="Viktige personer" subtitle="Forlovere, toastmaster" theme={theme} onPress={() => navigation.navigate("ImportantPeople")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="message-circle" label="Meldinger" subtitle="Chat med leverandører" theme={theme} onPress={() => navigation.navigate("Messages")} />
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ActionItem icon="gift" label="Hent leveranse" subtitle="Bilder/video fra fotograf" theme={theme} onPress={() => navigation.navigate("DeliveryAccess")} />
        </View>
      </Animated.View>

      {schedule.length > 0 ? (
        <Animated.View entering={FadeInDown.delay(550).duration(400)}>
          <Pressable onPress={() => navigation.navigate("Schedule")}>
            <View style={[styles.schedulePreview, { backgroundColor: theme.backgroundDefault }]}>
              <View style={styles.scheduleHeader}>
                <ThemedText style={styles.scheduleTitle}>Neste hendelser</ThemedText>
                <Feather name="arrow-right" size={16} color={Colors.dark.accent} />
              </View>
              {schedule.slice(0, 2).map((event, idx) => (
                <View key={event.id} style={styles.scheduleRow}>
                  <View style={[styles.scheduleTime, { backgroundColor: Colors.dark.accent + "20" }]}>
                    <ThemedText style={[styles.scheduleTimeText, { color: Colors.dark.accent }]}>{event.time}</ThemedText>
                  </View>
                  <ThemedText style={styles.scheduleEventTitle}>{event.title}</ThemedText>
                </View>
              ))}
            </View>
          </Pressable>
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
    backgroundColor: Colors.dark.accent + "15",
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
});
