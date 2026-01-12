import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getWeddingDetails } from "@/lib/storage";

interface ChecklistItem {
  id: string;
  title: string;
  monthsBefore: number;
  completed: boolean;
  category: "planning" | "vendors" | "attire" | "logistics" | "final";
}

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: "1", title: "Sett bryllupsbudsjett", monthsBefore: 12, completed: false, category: "planning" },
  { id: "2", title: "Velg bryllupsdato", monthsBefore: 12, completed: false, category: "planning" },
  { id: "3", title: "Book lokale", monthsBefore: 12, completed: false, category: "vendors" },
  { id: "4", title: "Start gjesteliste", monthsBefore: 11, completed: false, category: "planning" },
  { id: "5", title: "Book fotograf", monthsBefore: 10, completed: false, category: "vendors" },
  { id: "6", title: "Book videograf", monthsBefore: 10, completed: false, category: "vendors" },
  { id: "7", title: "Bestill/kjøp brudekjole", monthsBefore: 9, completed: false, category: "attire" },
  { id: "8", title: "Book DJ/band", monthsBefore: 8, completed: false, category: "vendors" },
  { id: "9", title: "Velg catering/meny", monthsBefore: 6, completed: false, category: "vendors" },
  { id: "10", title: "Send 'save the date'", monthsBefore: 6, completed: false, category: "logistics" },
  { id: "11", title: "Bestill invitasjoner", monthsBefore: 5, completed: false, category: "logistics" },
  { id: "12", title: "Book overnatting for gjester", monthsBefore: 5, completed: false, category: "logistics" },
  { id: "13", title: "Velg blomsterarrangement", monthsBefore: 4, completed: false, category: "vendors" },
  { id: "14", title: "Kjøp/bestill gifteringer", monthsBefore: 4, completed: false, category: "attire" },
  { id: "15", title: "Send invitasjoner", monthsBefore: 3, completed: false, category: "logistics" },
  { id: "16", title: "Planlegg bryllupsreise", monthsBefore: 3, completed: false, category: "logistics" },
  { id: "17", title: "Prøv brudekjole", monthsBefore: 2, completed: false, category: "attire" },
  { id: "18", title: "Ferdigstill kjøreplan", monthsBefore: 2, completed: false, category: "planning" },
  { id: "19", title: "Bekreft alle leverandører", monthsBefore: 1, completed: false, category: "vendors" },
  { id: "20", title: "Ferdigstill bordplassering", monthsBefore: 1, completed: false, category: "logistics" },
  { id: "21", title: "Hent brudekjole", monthsBefore: 1, completed: false, category: "attire" },
  { id: "22", title: "Øv på brudevals", monthsBefore: 1, completed: false, category: "final" },
  { id: "23", title: "Pakk til bryllupsreise", monthsBefore: 0, completed: false, category: "final" },
  { id: "24", title: "Siste gjennomgang med lokale", monthsBefore: 0, completed: false, category: "final" },
];

const CATEGORY_INFO: Record<string, { name: string; icon: keyof typeof Feather.glyphMap; color: string }> = {
  planning: { name: "Planlegging", icon: "clipboard", color: "#64B5F6" },
  vendors: { name: "Leverandører", icon: "briefcase", color: "#81C784" },
  attire: { name: "Antrekk", icon: "award", color: "#BA68C8" },
  logistics: { name: "Logistikk", icon: "truck", color: "#FFB74D" },
  final: { name: "Siste uken", icon: "check-circle", color: "#E57373" },
};

const STORAGE_KEY = "@wedflow/checklist";

export default function ChecklistScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [monthsLeft, setMonthsLeft] = useState(12);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [storedData, weddingData] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      getWeddingDetails(),
    ]);

    if (storedData) {
      setItems(JSON.parse(storedData));
    } else {
      setItems(DEFAULT_CHECKLIST);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CHECKLIST));
    }

    if (weddingData) {
      const weddingDate = new Date(weddingData.weddingDate);
      const today = new Date();
      const diffTime = weddingDate.getTime() - today.getTime();
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
      setMonthsLeft(Math.max(0, diffMonths));
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleToggle = async (id: string) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, completed: !item.completed } : item
    );
    setItems(updatedItems);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedItems));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const completedCount = items.filter((i) => i.completed).length;
  const progress = (completedCount / items.length) * 100;

  const filteredItems = filterCategory
    ? items.filter((i) => i.category === filterCategory)
    : items;

  const urgentItems = items.filter((i) => !i.completed && i.monthsBefore >= monthsLeft);
  const upcomingItems = items.filter((i) => !i.completed && i.monthsBefore < monthsLeft && i.monthsBefore >= monthsLeft - 2);

  const getUrgencyColor = (monthsBefore: number) => {
    if (monthsBefore > monthsLeft) return theme.error;
    if (monthsBefore >= monthsLeft - 1) return "#FFB74D";
    return theme.textSecondary;
  };

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
            {completedCount} av {items.length} oppgaver fullført
          </ThemedText>
        </View>
      </Animated.View>

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
            <Pressable onPress={() => handleToggle(item.id)}>
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
                  <ThemedText style={[styles.itemTitle, item.completed && styles.itemCompleted]}>
                    {item.title}
                  </ThemedText>
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
                </View>
              </View>
            </Pressable>
          </Animated.View>
        );
      })}
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
  categoryBadgeText: { fontSize: 11, fontWeight: "500" },
  monthsText: { fontSize: 12 },
});
