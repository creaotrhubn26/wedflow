import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, StyleSheet, View, Pressable, Switch } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getBudgetItems, getTotalBudget } from "@/lib/storage";
import { BudgetItem } from "@/lib/types";

interface ScenarioItem extends BudgetItem {
  included: boolean;
  alternatives: { name: string; cost: number }[];
  selectedAlt: number;
}

const ALTERNATIVES: Record<string, { name: string; cost: number }[]> = {
  "Lokale leie": [
    { name: "Premium lokale", cost: 100000 },
    { name: "Standard lokale", cost: 80000 },
    { name: "Enkelt lokale", cost: 50000 },
    { name: "Utendørs/gratis", cost: 10000 },
  ],
  "Middag for gjester": [
    { name: "Gourmet 3-retter", cost: 80000 },
    { name: "Standard buffet", cost: 60000 },
    { name: "Enkel meny", cost: 40000 },
    { name: "Koldtbord", cost: 25000 },
  ],
  "Fotograf": [
    { name: "Premium (hel dag)", cost: 35000 },
    { name: "Standard (6 timer)", cost: 25000 },
    { name: "Basis (4 timer)", cost: 15000 },
    { name: "Hobby-fotograf", cost: 5000 },
  ],
  "Videograf": [
    { name: "Cinematisk film", cost: 30000 },
    { name: "Standard video", cost: 20000 },
    { name: "Highlights only", cost: 12000 },
    { name: "Dropp video", cost: 0 },
  ],
  "DJ": [
    { name: "Premium DJ + lyd", cost: 25000 },
    { name: "Standard DJ", cost: 15000 },
    { name: "Basis DJ", cost: 8000 },
    { name: "Spotify-liste", cost: 0 },
  ],
  "Brudebukett": [
    { name: "Luksus bukett", cost: 5000 },
    { name: "Standard bukett", cost: 3000 },
    { name: "Enkel bukett", cost: 1500 },
    { name: "DIY blomster", cost: 500 },
  ],
  "Brudekjole": [
    { name: "Designer-kjole", cost: 40000 },
    { name: "Standard butikk", cost: 20000 },
    { name: "Brukt/vintage", cost: 8000 },
    { name: "Lei kjole", cost: 5000 },
  ],
  "Gifteringer": [
    { name: "Luksus gull", cost: 25000 },
    { name: "Standard gull", cost: 15000 },
    { name: "Enkle ringer", cost: 8000 },
    { name: "Sølv/alternativ", cost: 3000 },
  ],
};

export default function BudgetScenariosScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [items, setItems] = useState<ScenarioItem[]>([]);
  const [totalBudget, setTotalBudget] = useState(300000);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [budgetItems, budget] = await Promise.all([getBudgetItems(), getTotalBudget()]);
    
    const scenarioItems: ScenarioItem[] = budgetItems.map((item) => ({
      ...item,
      included: true,
      alternatives: ALTERNATIVES[item.name] || [{ name: item.name, cost: item.estimatedCost }],
      selectedAlt: ALTERNATIVES[item.name] ? 1 : 0,
    }));

    setItems(scenarioItems);
    setTotalBudget(budget);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const calculateTotal = () => {
    return items
      .filter((i) => i.included)
      .reduce((sum, item) => sum + (item.alternatives[item.selectedAlt]?.cost || 0), 0);
  };

  const scenarioTotal = calculateTotal();
  const savings = items.reduce((sum, i) => sum + i.estimatedCost, 0) - scenarioTotal;
  const remaining = totalBudget - scenarioTotal;

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("nb-NO") + " kr";
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
        <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText type="h3" style={styles.summaryTitle}>Scenario-kalkulator</ThemedText>
          <ThemedText style={[styles.summarySubtitle, { color: theme.textSecondary }]}>
            Juster valg og se hvordan det påvirker budsjettet
          </ThemedText>

          <View style={styles.summaryStats}>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: Colors.dark.accent }]}>
                {formatCurrency(scenarioTotal)}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                Nytt estimat
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: savings > 0 ? "#81C784" : theme.text }]}>
                {savings > 0 ? "-" : "+"}{formatCurrency(Math.abs(savings))}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                {savings > 0 ? "Spart" : "Ekstra"}
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: remaining >= 0 ? "#81C784" : "#E57373" }]}>
                {formatCurrency(Math.abs(remaining))}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                {remaining >= 0 ? "Buffer" : "Over"}
              </ThemedText>
            </View>
          </View>
        </View>
      </Animated.View>

      {items.map((item, index) => (
        <Animated.View key={item.id} entering={FadeInRight.delay(200 + index * 50).duration(300)}>
          <View style={[styles.itemCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, opacity: item.included ? 1 : 0.5 }]}>
            <View style={styles.itemHeader}>
              <View style={styles.itemTitleRow}>
                <Switch
                  value={item.included}
                  onValueChange={() => handleToggleItem(item.id)}
                  trackColor={{ false: theme.backgroundSecondary, true: Colors.dark.accent }}
                  thumbColor="#FFFFFF"
                />
                <ThemedText style={styles.itemName}>{item.name}</ThemedText>
              </View>
              <ThemedText style={[styles.itemCost, { color: Colors.dark.accent }]}>
                {item.included ? formatCurrency(item.alternatives[item.selectedAlt]?.cost || 0) : "Fjernet"}
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
      ))}

      <Animated.View entering={FadeInDown.delay(600).duration(400)}>
        <View style={[styles.tipsCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText type="h4" style={styles.tipsTitle}>Spare-tips</ThemedText>
          <View style={styles.tipItem}>
            <Feather name="calendar" size={16} color={Colors.dark.accent} />
            <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>
              Velg lavssong (jan-mar, nov) for lavere priser
            </ThemedText>
          </View>
          <View style={styles.tipItem}>
            <Feather name="users" size={16} color={Colors.dark.accent} />
            <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>
              Færre gjester = mer per person i budsjettet
            </ThemedText>
          </View>
          <View style={styles.tipItem}>
            <Feather name="sun" size={16} color={Colors.dark.accent} />
            <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>
              Søndager og hverdager er billigere
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
  summaryTitle: { textAlign: "center" },
  summarySubtitle: { textAlign: "center", fontSize: 13, marginTop: Spacing.xs, marginBottom: Spacing.lg },
  summaryStats: { flexDirection: "row", justifyContent: "space-between" },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 18, fontWeight: "700" },
  statLabel: { fontSize: 12, marginTop: 2 },
  itemCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  itemHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemTitleRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  itemName: { fontSize: 15, fontWeight: "500", marginLeft: Spacing.sm, flex: 1 },
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
  altCost: { fontSize: 11 },
  tipsCard: { padding: Spacing.lg, borderRadius: BorderRadius.md, borderWidth: 1 },
  tipsTitle: { marginBottom: Spacing.md },
  tipItem: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.sm },
  tipText: { marginLeft: Spacing.sm, fontSize: 13, flex: 1 },
});
