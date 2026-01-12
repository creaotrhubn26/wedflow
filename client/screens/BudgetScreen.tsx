import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getBudgetItems, saveBudgetItems, getTotalBudget, saveTotalBudget, generateId } from "@/lib/storage";
import { BudgetItem } from "@/lib/types";

const CATEGORIES = [
  { id: "venue", name: "Lokale", icon: "home", color: "#E57373" },
  { id: "catering", name: "Catering", icon: "coffee", color: "#81C784" },
  { id: "photo", name: "Foto/Video", icon: "camera", color: "#64B5F6" },
  { id: "music", name: "Musikk", icon: "music", color: "#BA68C8" },
  { id: "flowers", name: "Blomster", icon: "sun", color: "#FFB74D" },
  { id: "attire", name: "Antrekk", icon: "award", color: "#4DD0E1" },
  { id: "rings", name: "Ringer", icon: "circle", color: "#F06292" },
  { id: "other", name: "Annet", icon: "more-horizontal", color: "#90A4AE" },
];

const DEFAULT_ITEMS: BudgetItem[] = [
  { id: "1", category: "venue", name: "Lokale leie", estimatedCost: 80000, actualCost: 0, paid: false },
  { id: "2", category: "catering", name: "Middag for gjester", estimatedCost: 60000, actualCost: 0, paid: false },
  { id: "3", category: "photo", name: "Fotograf", estimatedCost: 25000, actualCost: 0, paid: false },
  { id: "4", category: "photo", name: "Videograf", estimatedCost: 20000, actualCost: 0, paid: false },
  { id: "5", category: "music", name: "DJ", estimatedCost: 15000, actualCost: 0, paid: false },
  { id: "6", category: "flowers", name: "Brudebukett", estimatedCost: 3000, actualCost: 0, paid: false },
  { id: "7", category: "attire", name: "Brudekjole", estimatedCost: 20000, actualCost: 0, paid: false },
  { id: "8", category: "rings", name: "Gifteringer", estimatedCost: 15000, actualCost: 0, paid: false },
];

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [items, setItems] = useState<BudgetItem[]>([]);
  const [totalBudget, setTotalBudget] = useState(300000);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCost, setNewCost] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("other");
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");

  const loadData = useCallback(async () => {
    const [itemsData, budgetData] = await Promise.all([
      getBudgetItems(),
      getTotalBudget(),
    ]);

    if (itemsData.length === 0) {
      await saveBudgetItems(DEFAULT_ITEMS);
      setItems(DEFAULT_ITEMS);
    } else {
      setItems(itemsData);
    }

    setTotalBudget(budgetData);
    setBudgetInput(budgetData.toString());
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalEstimated = items.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalActual = items.reduce((sum, item) => sum + item.actualCost, 0);
  const totalPaid = items.filter((i) => i.paid).reduce((sum, item) => sum + item.actualCost, 0);
  const remaining = totalBudget - totalEstimated;

  const handleAddItem = async () => {
    if (!newName.trim() || !newCost.trim()) {
      Alert.alert("Feil", "Fyll ut navn og beløp");
      return;
    }

    const newItem: BudgetItem = {
      id: generateId(),
      category: selectedCategory,
      name: newName.trim(),
      estimatedCost: parseInt(newCost) || 0,
      actualCost: 0,
      paid: false,
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    await saveBudgetItems(updatedItems);

    setNewName("");
    setNewCost("");
    setShowForm(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleTogglePaid = async (id: string) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, paid: !item.paid } : item
    );
    setItems(updatedItems);
    await saveBudgetItems(updatedItems);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDeleteItem = async (id: string) => {
    Alert.alert("Slett", "Slette denne utgiften?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Slett",
        style: "destructive",
        onPress: async () => {
          const updatedItems = items.filter((i) => i.id !== id);
          setItems(updatedItems);
          await saveBudgetItems(updatedItems);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  };

  const handleSaveBudget = async () => {
    const newBudget = parseInt(budgetInput) || 300000;
    setTotalBudget(newBudget);
    await saveTotalBudget(newBudget);
    setEditingBudget(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("nb-NO") + " kr";
  };

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[7];
  };

  const groupedItems = CATEGORIES.map((cat) => ({
    ...cat,
    items: items.filter((i) => i.category === cat.id),
    total: items.filter((i) => i.category === cat.id).reduce((sum, i) => sum + i.estimatedCost, 0),
  })).filter((cat) => cat.items.length > 0);

  if (loading) {
    return (
      <View
        style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}
      >
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
          <View style={styles.budgetRow}>
            <ThemedText style={[styles.budgetLabel, { color: theme.textSecondary }]}>
              Totalbudsjett
            </ThemedText>
            {editingBudget ? (
              <View style={styles.budgetEditRow}>
                <TextInput
                  style={[styles.budgetInput, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                  value={budgetInput}
                  onChangeText={setBudgetInput}
                  keyboardType="numeric"
                />
                <Pressable onPress={handleSaveBudget} style={styles.budgetSaveBtn}>
                  <Feather name="check" size={18} color={Colors.dark.accent} />
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => setEditingBudget(true)} style={styles.budgetValueRow}>
                <ThemedText style={[styles.budgetValue, { color: Colors.dark.accent }]}>
                  {formatCurrency(totalBudget)}
                </ThemedText>
                <Feather name="edit-2" size={14} color={theme.textMuted} />
              </Pressable>
            )}
          </View>

          <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: remaining >= 0 ? Colors.dark.accent : theme.error,
                  width: `${Math.min((totalEstimated / totalBudget) * 100, 100)}%`,
                },
              ]}
            />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: theme.text }]}>
                {formatCurrency(totalEstimated)}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                Estimert
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: remaining >= 0 ? theme.success : theme.error }]}>
                {formatCurrency(Math.abs(remaining))}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                {remaining >= 0 ? "Gjenstår" : "Over budsjett"}
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: theme.success }]}>
                {formatCurrency(totalPaid)}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                Betalt
              </ThemedText>
            </View>
          </View>
        </View>
      </Animated.View>

      {groupedItems.map((category, catIndex) => (
        <Animated.View key={category.id} entering={FadeInDown.delay(200 + catIndex * 100).duration(400)}>
          <View style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryIcon, { backgroundColor: category.color + "20" }]}>
                <Feather name={category.icon as any} size={16} color={category.color} />
              </View>
              <ThemedText type="h4" style={styles.categoryName}>{category.name}</ThemedText>
              <ThemedText style={[styles.categoryTotal, { color: theme.textSecondary }]}>
                {formatCurrency(category.total)}
              </ThemedText>
            </View>

            {category.items.map((item, index) => (
              <Animated.View key={item.id} entering={FadeInRight.delay(index * 50).duration(300)}>
                <Pressable
                  onPress={() => handleTogglePaid(item.id)}
                  onLongPress={() => handleDeleteItem(item.id)}
                  style={[styles.itemRow, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: item.paid ? Colors.dark.accent : "transparent",
                        borderColor: item.paid ? Colors.dark.accent : theme.border,
                      },
                    ]}
                  >
                    {item.paid ? <Feather name="check" size={12} color="#1A1A1A" /> : null}
                  </View>
                  <ThemedText style={[styles.itemName, item.paid && styles.itemPaid]}>
                    {item.name}
                  </ThemedText>
                  <ThemedText style={[styles.itemCost, { color: Colors.dark.accent }]}>
                    {formatCurrency(item.estimatedCost)}
                  </ThemedText>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </Animated.View>
      ))}

      {showForm ? (
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          <ThemedText type="h3" style={styles.formTitle}>Legg til utgift</ThemedText>

          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
            placeholder="Navn"
            placeholderTextColor={theme.textMuted}
            value={newName}
            onChangeText={setNewName}
          />

          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
            placeholder="Beløp (kr)"
            placeholderTextColor={theme.textMuted}
            value={newCost}
            onChangeText={setNewCost}
            keyboardType="numeric"
          />

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPicker}>
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: selectedCategory === cat.id ? cat.color : theme.backgroundSecondary,
                  },
                ]}
              >
                <Feather
                  name={cat.icon as any}
                  size={14}
                  color={selectedCategory === cat.id ? "#FFFFFF" : theme.textSecondary}
                />
                <ThemedText
                  style={[
                    styles.categoryChipText,
                    { color: selectedCategory === cat.id ? "#FFFFFF" : theme.textSecondary },
                  ]}
                >
                  {cat.name}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.formButtons}>
            <Pressable onPress={() => setShowForm(false)} style={[styles.cancelButton, { borderColor: theme.border }]}>
              <ThemedText style={{ color: theme.textSecondary }}>Avbryt</ThemedText>
            </Pressable>
            <Button onPress={handleAddItem} style={styles.saveButton}>Lagre</Button>
          </View>
        </Animated.View>
      ) : (
        <Pressable
          onPress={() => {
            setShowForm(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={[styles.addButton, { borderColor: Colors.dark.accent }]}
        >
          <Feather name="plus" size={20} color={Colors.dark.accent} />
          <ThemedText style={[styles.addButtonText, { color: Colors.dark.accent }]}>
            Legg til utgift
          </ThemedText>
        </Pressable>
      )}
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
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  budgetLabel: { fontSize: 14 },
  budgetValueRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  budgetValue: { fontSize: 24, fontWeight: "700" },
  budgetEditRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  budgetInput: {
    width: 120,
    height: 36,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    borderWidth: 1,
    fontSize: 16,
  },
  budgetSaveBtn: { padding: Spacing.xs },
  progressBar: { height: 8, borderRadius: 4, overflow: "hidden", marginBottom: Spacing.lg },
  progressFill: { height: "100%", borderRadius: 4 },
  statsRow: { flexDirection: "row", justifyContent: "space-between" },
  statItem: { alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "600" },
  statLabel: { fontSize: 12, marginTop: 2 },
  categorySection: { marginBottom: Spacing.xl },
  categoryHeader: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.md },
  categoryIcon: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center", marginRight: Spacing.sm },
  categoryName: { flex: 1 },
  categoryTotal: { fontSize: 14 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  checkbox: { width: 20, height: 20, borderRadius: 4, borderWidth: 2, justifyContent: "center", alignItems: "center", marginRight: Spacing.md },
  itemName: { flex: 1, fontSize: 15 },
  itemPaid: { textDecorationLine: "line-through", opacity: 0.6 },
  itemCost: { fontSize: 14, fontWeight: "600" },
  formCard: { padding: Spacing.xl, borderRadius: BorderRadius.md, borderWidth: 1, marginTop: Spacing.lg },
  formTitle: { marginBottom: Spacing.lg },
  input: { height: Spacing.inputHeight, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.md, borderWidth: 1, fontSize: 16, marginBottom: Spacing.md },
  categoryPicker: { marginBottom: Spacing.lg, marginHorizontal: -Spacing.xl, paddingHorizontal: Spacing.xl },
  categoryChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, marginRight: Spacing.sm },
  categoryChipText: { fontSize: 13, marginLeft: Spacing.xs },
  formButtons: { flexDirection: "row", gap: Spacing.md },
  cancelButton: { flex: 1, height: Spacing.buttonHeight, borderRadius: BorderRadius.full, justifyContent: "center", alignItems: "center", borderWidth: 1 },
  saveButton: { flex: 1 },
  addButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", padding: Spacing.lg, borderRadius: BorderRadius.md, borderWidth: 1, borderStyle: "dashed" },
  addButtonText: { marginLeft: Spacing.sm, fontWeight: "500" },
});
