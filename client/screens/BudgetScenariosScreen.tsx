import React, { useEffect, useState, useCallback, useMemo } from "react";
import { ScrollView, StyleSheet, View, Pressable, Switch, Alert, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { EvendiIcon } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getBudgetItems, getTotalBudget, getAppLanguage, type AppLanguage } from "@/lib/storage";
import { BudgetItem } from "@/lib/types";

interface ScenarioItem extends BudgetItem {
  included: boolean;
  alternatives: { name: string; cost: number }[];
  selectedAlt: number;
  baselineAlt: number; // Original selection for reset
}

// Use category as key for stable mapping (item.name can vary)
const ALTERNATIVES_BY_CATEGORY_NB: Record<string, { name: string; cost: number }[]> = {
  venue: [
    { name: "Premium lokale", cost: 100000 },
    { name: "Standard lokale", cost: 80000 },
    { name: "Enkelt lokale", cost: 50000 },
    { name: "Utendørs/gratis", cost: 10000 },
  ],
  catering: [
    { name: "Gourmet 3-retter", cost: 80000 },
    { name: "Standard buffet", cost: 60000 },
    { name: "Enkel meny", cost: 40000 },
    { name: "Koldtbord", cost: 25000 },
  ],
  photo: [
    { name: "Premium (hel dag)", cost: 35000 },
    { name: "Standard (6 timer)", cost: 25000 },
    { name: "Basis (4 timer)", cost: 15000 },
    { name: "Hobby-fotograf", cost: 5000 },
  ],
  video: [
    { name: "Cinematisk film", cost: 30000 },
    { name: "Standard video", cost: 20000 },
    { name: "Highlights only", cost: 12000 },
    { name: "Dropp video", cost: 0 },
  ],
  music: [
    { name: "Premium DJ + lyd", cost: 25000 },
    { name: "Standard DJ", cost: 15000 },
    { name: "Basis DJ", cost: 8000 },
    { name: "Spotify-liste", cost: 0 },
  ],
  flowers: [
    { name: "Luksus bukett", cost: 5000 },
    { name: "Standard bukett", cost: 3000 },
    { name: "Enkel bukett", cost: 1500 },
    { name: "DIY blomster", cost: 500 },
  ],
  attire: [
    { name: "Designer-kjole", cost: 40000 },
    { name: "Standard butikk", cost: 20000 },
    { name: "Brukt/vintage", cost: 8000 },
    { name: "Lei kjole", cost: 5000 },
  ],
  rings: [
    { name: "Luksus gull", cost: 25000 },
    { name: "Standard gull", cost: 15000 },
    { name: "Enkle ringer", cost: 8000 },
    { name: "Sølv/alternativ", cost: 3000 },
  ],
};

const ALTERNATIVES_BY_CATEGORY_EN: Record<string, { name: string; cost: number }[]> = {
  venue: [
    { name: "Premium venue", cost: 100000 },
    { name: "Standard venue", cost: 80000 },
    { name: "Basic venue", cost: 50000 },
    { name: "Outdoor/free", cost: 10000 },
  ],
  catering: [
    { name: "Gourmet 3-course", cost: 80000 },
    { name: "Standard buffet", cost: 60000 },
    { name: "Simple menu", cost: 40000 },
    { name: "Cold table", cost: 25000 },
  ],
  photo: [
    { name: "Premium (full day)", cost: 35000 },
    { name: "Standard (6 hours)", cost: 25000 },
    { name: "Basic (4 hours)", cost: 15000 },
    { name: "Hobby photographer", cost: 5000 },
  ],
  video: [
    { name: "Cinematic film", cost: 30000 },
    { name: "Standard video", cost: 20000 },
    { name: "Highlights only", cost: 12000 },
    { name: "Skip video", cost: 0 },
  ],
  music: [
    { name: "Premium DJ + sound", cost: 25000 },
    { name: "Standard DJ", cost: 15000 },
    { name: "Basic DJ", cost: 8000 },
    { name: "Spotify playlist", cost: 0 },
  ],
  flowers: [
    { name: "Luxury bouquet", cost: 5000 },
    { name: "Standard bouquet", cost: 3000 },
    { name: "Simple bouquet", cost: 1500 },
    { name: "DIY flowers", cost: 500 },
  ],
  attire: [
    { name: "Designer dress", cost: 40000 },
    { name: "Standard store", cost: 20000 },
    { name: "Second-hand/vintage", cost: 8000 },
    { name: "Rent a dress", cost: 5000 },
  ],
  rings: [
    { name: "Luxury gold", cost: 25000 },
    { name: "Standard gold", cost: 15000 },
    { name: "Simple bands", cost: 8000 },
    { name: "Silver/alternative", cost: 3000 },
  ],
};

// Helper to find best matching alternative based on cost
const findBestAlternativeIndex = (alternatives: { cost: number }[], targetCost: number): number => {
  let bestIndex = 0;
  let bestDiff = Math.abs(alternatives[0].cost - targetCost);
  alternatives.forEach((alt, idx) => {
    const diff = Math.abs(alt.cost - targetCost);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestIndex = idx;
    }
  });
  return bestIndex;
};

export default function BudgetScenariosScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();

  const [appLanguage, setAppLanguage] = useState<AppLanguage>("nb");
  const t = useCallback((nb: string, en: string) => (appLanguage === "en" ? en : nb), [appLanguage]);
  const locale = appLanguage === "en" ? "en-US" : "nb-NO";
  const currencyLabel = t("kr", "NOK");
  const formatCurrency = useCallback(
    (amount: number) => `${amount.toLocaleString(locale)} ${currencyLabel}`,
    [currencyLabel, locale]
  );
  const alternativesByCategory = appLanguage === "en" ? ALTERNATIVES_BY_CATEGORY_EN : ALTERNATIVES_BY_CATEGORY_NB;

  const [items, setItems] = useState<ScenarioItem[]>([]);
  const [totalBudget, setTotalBudget] = useState(300000);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLanguage() {
      const language = await getAppLanguage();
      setAppLanguage(language);
    }
    loadLanguage();
  }, []);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      const [budgetItems, budget] = await Promise.all([getBudgetItems(), getTotalBudget()]);
      
      const scenarioItems: ScenarioItem[] = budgetItems.map((item) => {
        // Use category-based alternatives, fallback to item name as single option
        const alternatives = alternativesByCategory[item.category] || [{ name: item.name, cost: item.estimatedCost }];
        // Find best matching alternative based on item's estimated cost
        const bestAltIndex = findBestAlternativeIndex(alternatives, item.estimatedCost);
        
        return {
          ...item,
          included: true,
          alternatives,
          selectedAlt: bestAltIndex,
          baselineAlt: bestAltIndex, // Store original for reset
        };
      });

      setItems(scenarioItems);
      setTotalBudget(budget);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("Kunne ikke laste budsjettdata", "Could not load budget data"));
    } finally {
      setLoading(false);
    }
  }, [alternativesByCategory, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reset scenario to baseline
  const handleResetScenario = () => {
    setItems((prev) =>
      prev.map((item) => ({
        ...item,
        included: true,
        selectedAlt: item.baselineAlt,
      }))
    );
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleToggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, included: !item.included } : item))
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSelectAlternative = (id: string, altIndex: number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selectedAlt: altIndex } : item))
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Memoized calculations for performance
  const scenarioTotal = useMemo(() => {
    return items
      .filter((i) => i.included)
      .reduce((sum, item) => sum + (item.alternatives[item.selectedAlt]?.cost || 0), 0);
  }, [items]);

  // Baseline = sum of included items at their baseline cost (same items comparison)
  const baseline = useMemo(() => {
    return items
      .filter((i) => i.included)
      .reduce((sum, item) => sum + (item.alternatives[item.baselineAlt]?.cost || item.estimatedCost), 0);
  }, [items]);

  // Savings comparing scenario to baseline (same items, different choices)
  const savings = useMemo(() => baseline - scenarioTotal, [baseline, scenarioTotal]);

  const remaining = useMemo(() => totalBudget - scenarioTotal, [totalBudget, scenarioTotal]);

  // Progress percentage (capped at 150% for display)
  const progressPercent = useMemo(() => 
    Math.min((scenarioTotal / totalBudget) * 100, 150),
  [scenarioTotal, totalBudget]);

  // Check if scenario has any changes from baseline
  const hasChanges = useMemo(() => {
    return items.some((item) => !item.included || item.selectedAlt !== item.baselineAlt);
  }, [items]);

  // Calculate per-item delta (current choice vs baseline)
  const getItemDelta = (item: ScenarioItem): number => {
    if (!item.included) return -(item.alternatives[item.baselineAlt]?.cost || item.estimatedCost);
    const currentCost = item.alternatives[item.selectedAlt]?.cost || 0;
    const baselineCost = item.alternatives[item.baselineAlt]?.cost || item.estimatedCost;
    return currentCost - baselineCost;
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.dark.accent} />
        <ThemedText style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
          {t("Laster scenario...", "Loading scenario...")}
        </ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <EvendiIcon name="alert-circle" size={48} color={theme.error} />
        <ThemedText style={{ color: theme.error, marginTop: Spacing.md, textAlign: "center" }}>
          {error}
        </ThemedText>
        <Button onPress={loadData} style={{ marginTop: Spacing.lg }}>
          {t("Prøv igjen", "Try again")}
        </Button>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <EvendiIcon name="clipboard" size={48} color={theme.textMuted} />
        <ThemedText type="h4" style={{ color: theme.text, marginTop: Spacing.md, textAlign: "center" }}>
          {t("Ingen budsjettposter", "No budget items")}
        </ThemedText>
        <ThemedText style={{ color: theme.textSecondary, marginTop: Spacing.xs, textAlign: "center", paddingHorizontal: Spacing.xl }}>
          {t("Legg til poster i budsjettet først for å bruke scenario-kalkulatoren", "Add items to the budget first to use the scenario calculator")}
        </ThemedText>
        <Button
          onPress={() => (navigation as any).navigate("Budget")}
          style={{ marginTop: Spacing.lg }}
        >
          {t("Gå til Budsjett", "Go to Budget")}
        </Button>
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
        <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.summaryHeader}>
            <View>
              <ThemedText type="h3" style={styles.summaryTitle}>
                {t("Scenario-kalkulator", "Scenario calculator")}
              </ThemedText>
              <ThemedText style={[styles.summarySubtitle, { color: theme.textSecondary }]}>
                {t("Juster valg og se hvordan det påvirker budsjettet", "Adjust choices and see how it affects the budget")}
              </ThemedText>
            </View>
            {hasChanges && (
              <Pressable onPress={handleResetScenario} style={styles.resetButton}>
                <EvendiIcon name="refresh-cw" size={16} color={Colors.dark.accent} />
                <ThemedText style={{ color: Colors.dark.accent, fontSize: 13, marginLeft: 4 }}>
                  {t("Nullstill", "Reset")}
                </ThemedText>
              </Pressable>
            )}
          </View>

          {/* Progress bar */}
          <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: remaining >= 0 ? theme.success : theme.error,
                  width: `${Math.min(progressPercent, 100)}%`,
                },
              ]}
            />
          </View>
          <ThemedText style={[styles.progressLabel, { color: theme.textSecondary }]}>
            {t(
              `${Math.round(progressPercent)}% av budsjett (${formatCurrency(totalBudget)})`,
              `${Math.round(progressPercent)}% of budget (${formatCurrency(totalBudget)})`
            )}
          </ThemedText>

          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: Colors.dark.accent }]}>
                {formatCurrency(scenarioTotal)}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                {t("Scenario", "Scenario")}
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: savings > 0 ? theme.success : savings < 0 ? theme.error : theme.text }]}>
                {savings >= 0 ? "−" : "+"}{formatCurrency(Math.abs(savings))}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                {savings > 0 ? t("Spart", "Saved") : savings < 0 ? t("Ekstra", "Extra") : t("Ingen endring", "No change")}
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: remaining >= 0 ? theme.success : theme.error }]}>
                {remaining >= 0 ? "+" : "−"}{formatCurrency(Math.abs(remaining))}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                {remaining >= 0 ? t("Buffer", "Buffer") : t("Over", "Over")}
              </ThemedText>
            </View>
          </View>
        </View>
      </Animated.View>

      {items.map((item, index) => {
        const delta = getItemDelta(item);
        return (
        <Animated.View key={item.id} entering={FadeInRight.delay(200 + index * 50).duration(300)}>
          <View style={[styles.itemCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, opacity: item.included ? 1 : 0.5 }]}>
            <View style={styles.itemHeader}>
              <View style={styles.itemTitleRow}>
                <Switch
                  value={item.included}
                  onValueChange={() => handleToggleItem(item.id)}
                  trackColor={{ false: theme.backgroundSecondary, true: Colors.dark.accent }}
                  thumbColor={theme.backgroundDefault}
                />
                <View style={styles.itemNameContainer}>
                  <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                  {/* Show per-item delta when different from baseline */}
                  {delta !== 0 && (
                    <ThemedText style={[styles.itemDelta, { color: delta < 0 ? theme.success : theme.error }]}>
                      {delta < 0 ? "−" : "+"}{formatCurrency(Math.abs(delta))}
                    </ThemedText>
                  )}
                </View>
              </View>
              <ThemedText style={[styles.itemCost, { color: Colors.dark.accent }]}>
                {item.included ? formatCurrency(item.alternatives[item.selectedAlt]?.cost || 0) : t("Fjernet", "Removed")}
              </ThemedText>
            </View>

            {item.included && item.alternatives.length > 1 ? (
              <View style={styles.alternativesContainer}>
                {item.alternatives.map((alt, altIndex) => (
                  <Pressable
                    key={altIndex}
                    onPress={() => handleSelectAlternative(item.id, altIndex)}
                    style={[
                      styles.altButton,
                      {
                        backgroundColor: item.selectedAlt === altIndex ? Colors.dark.accent : theme.backgroundSecondary,
                        borderColor: item.selectedAlt === altIndex ? Colors.dark.accent : theme.border,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.altName,
                        { color: item.selectedAlt === altIndex ? "#1A1A1A" : theme.text },
                      ]}
                      numberOfLines={1}
                    >
                      {alt.name}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.altCost,
                        { color: item.selectedAlt === altIndex ? "#1A1A1A" : theme.textSecondary },
                      ]}
                    >
                      {formatCurrency(alt.cost)}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </View>
        </Animated.View>
        );
      })}

      <Animated.View entering={FadeInDown.delay(600).duration(400)}>
        <View style={[styles.tipsCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText type="h4" style={styles.tipsTitle}>{t("Spare-tips", "Savings tips")}</ThemedText>
          <View style={styles.tipItem}>
            <EvendiIcon name="calendar" size={16} color={Colors.dark.accent} />
            <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>
              {t("Velg lavssong (jan-mar, nov) for lavere priser", "Choose off-season (Jan-Mar, Nov) for lower prices")}
            </ThemedText>
          </View>
          <View style={styles.tipItem}>
            <EvendiIcon name="users" size={16} color={Colors.dark.accent} />
            <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>
              {t("Færre gjester = mer per person i budsjettet", "Fewer guests = more per person in the budget")}
            </ThemedText>
          </View>
          <View style={styles.tipItem}>
            <EvendiIcon name="sun" size={16} color={Colors.dark.accent} />
            <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>
              {t("Søndager og hverdager er billigere", "Sundays and weekdays are cheaper")}
            </ThemedText>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  summaryCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.lg,
  },
  summaryTitle: {},
  summarySubtitle: { fontSize: 13, marginTop: Spacing.xs },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: Spacing.xs,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressLabel: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  summaryStats: { flexDirection: "row", justifyContent: "space-between" },
  statItem: { alignItems: "center", flex: 1 },
  statValue: { fontSize: 16, fontWeight: "700" },
  statLabel: { fontSize: 11, marginTop: 2 },
  itemCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemTitleRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  itemNameContainer: { flex: 1, marginLeft: Spacing.sm },
  itemName: { fontSize: 15, fontWeight: "500" },
  itemDelta: { fontSize: 12, marginTop: 2 },
  itemCost: { fontSize: 14, fontWeight: "600" },
  alternativesContainer: { marginTop: Spacing.md, flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  altButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    minWidth: "48%",
    flex: 1,
  },
  altName: { fontSize: 12, fontWeight: "500" },
  altCost: { fontSize: 12 },
  tipsCard: { padding: Spacing.lg, borderRadius: BorderRadius.md, borderWidth: 1 },
  tipsTitle: { marginBottom: Spacing.md },
  tipItem: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.sm },
  tipText: { marginLeft: Spacing.sm, fontSize: 13, flex: 1 },
});
