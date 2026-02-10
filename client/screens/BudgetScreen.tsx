import React, { useState, useCallback, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { EvendiIcon } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { renderIcon } from "@/lib/custom-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SwipeableRow } from "@/components/SwipeableRow";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import {
  getBudgetSettings,
  updateBudgetSettings,
  getBudgetItems,
  createBudgetItem,
  updateBudgetItem,
  deleteBudgetItem,
  BudgetItem,
} from "@/lib/api-couple-data";
import { generateId, getCoupleSession } from "@/lib/storage";
import { getCoupleProfile } from "@/lib/api-couples";
import { TRADITION_BUDGET_ITEMS, getPerPersonBudget, CULTURAL_LABELS } from "@/constants/tradition-data";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useFieldValidation = () => {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((field: string, value: string): string => {
    switch (field) {
      case "newLabel":
        if (!value.trim()) return "Navn er påkrevd";
        return "";
      case "newCost":
        if (!value.trim()) return "Beløp er påkrevd";
        if (!/^\d+$/.test(value.replace(/[^\d]/g, ""))) return "Bruk kun tall";
        return "";
      case "budgetInput":
        if (!value.trim()) return "Budsjett er påkrevd";
        if (!/^\d+$/.test(value.replace(/[^\d]/g, ""))) return "Bruk kun tall";
        return "";
      default:
        return "";
    }
  }, []);

  const handleBlur = useCallback((field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, [validateField]);

  const getFieldStyle = useCallback((field: string) => {
    if (touched[field] && errors[field]) {
      return { borderColor: "#DC3545" };
    }
    return {};
  }, [touched, errors]);

  const resetValidation = useCallback(() => {
    setTouched({});
    setErrors({});
  }, []);

  return { touched, errors, handleBlur, getFieldStyle, resetValidation };
};

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

const DEFAULT_ITEMS: Omit<BudgetItem, "id" | "coupleId" | "createdAt" | "updatedAt">[] = [
  { category: "venue", label: "Lokale leie", estimatedCost: 80000, actualCost: 0, isPaid: false },
  { category: "catering", label: "Middag for gjester", estimatedCost: 60000, actualCost: 0, isPaid: false },
  { category: "photo", label: "Fotograf", estimatedCost: 25000, actualCost: 0, isPaid: false },
  { category: "photo", label: "Videograf", estimatedCost: 20000, actualCost: 0, isPaid: false },
  { category: "music", label: "DJ", estimatedCost: 15000, actualCost: 0, isPaid: false },
  { category: "flowers", label: "Brudebukett", estimatedCost: 3000, actualCost: 0, isPaid: false },
  { category: "attire", label: "Brudekjole", estimatedCost: 20000, actualCost: 0, isPaid: false },
  { category: "rings", label: "Gifteringer", estimatedCost: 15000, actualCost: 0, isPaid: false },
];

export default function BudgetScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { touched, errors, handleBlur, getFieldStyle, resetValidation } = useFieldValidation();
  const queryClient = useQueryClient();

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  useEffect(() => {
    getCoupleSession().then(s => setSessionToken(s?.token || null));
  }, []);

  // Fetch couple profile for traditions + guest count
  const { data: coupleProfile } = useQuery({
    queryKey: ['coupleProfile'],
    queryFn: async () => {
      if (!sessionToken) throw new Error('No session');
      return getCoupleProfile(sessionToken);
    },
    enabled: !!sessionToken,
  });

  // Query for budget settings
  const { data: budgetSettings, isLoading: loadingSettings, isError: isSettingsError, error: settingsError, refetch: refetchSettings } = useQuery({
    queryKey: ["budget-settings"],
    queryFn: getBudgetSettings,
  });

  // Query for budget items
  const { data: budgetItemsData, isLoading: loadingItems, isError: isItemsError, error: itemsError, refetch: refetchItems } = useQuery({
    queryKey: ["budget-items"],
    queryFn: getBudgetItems,
  });

  const items = budgetItemsData ?? [];
  const totalBudget = budgetSettings?.totalBudget ?? 300000;
  const loading = loadingSettings || loadingItems;
  const isError = isSettingsError || isItemsError;
  const error = settingsError || itemsError;

  // State for refreshing
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetchItems();
    await refetchSettings();
    setRefreshing(false);
  }, [refetchItems, refetchSettings]);

  // Mutations
  const updateSettingsMutation = useMutation({
    mutationFn: updateBudgetSettings,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budget-settings"] }),
  });

  const createItemMutation = useMutation({
    mutationFn: createBudgetItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budget-items"] }),
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BudgetItem> }) => updateBudgetItem(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budget-items"] }),
  });

  const deleteItemMutation = useMutation({
    mutationFn: deleteBudgetItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["budget-items"] }),
  });

  const [showForm, setShowForm] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [newCost, setNewCost] = useState("");
  const [newActualCost, setNewActualCost] = useState("");
  const [newIsPaid, setNewIsPaid] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("other");
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState(totalBudget.toString());
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Sync budgetInput when settings load or change
  useEffect(() => {
    if (budgetSettings?.totalBudget !== undefined) {
      setBudgetInput(budgetSettings.totalBudget.toString());
    }
  }, [budgetSettings?.totalBudget]);

  // Helper to parse Norwegian number format (strips spaces and non-numeric chars)
  const parseNumber = (value: string): number => {
    const cleaned = value.replace(/[^\d]/g, "");
    return parseInt(cleaned) || 0;
  };

  const totalEstimated = items.reduce((sum, item) => sum + (item.estimatedCost || 0), 0);
  const totalActual = items.reduce((sum, item) => sum + (item.actualCost || 0), 0);
  const totalPaid = items.filter((i) => i.isPaid).reduce((sum, item) => sum + (item.actualCost || item.estimatedCost || 0), 0);
  const remainingEstimated = totalBudget - totalEstimated;
  const remainingActual = totalBudget - totalActual;
  // Use actual if available, otherwise estimated
  const effectiveSpent = totalActual > 0 ? totalActual : totalEstimated;
  const remaining = totalBudget - effectiveSpent;

  const handleAddItem = async () => {
    if (!newLabel.trim() || !newCost.trim()) {
      Alert.alert("Feil", "Fyll ut navn og beløp");
      return;
    }

    setIsSaving(true);
    try {
      if (editingItem) {
        // Update with all fields including actualCost and isPaid
        await updateItemMutation.mutateAsync({
          id: editingItem.id,
          data: {
            label: newLabel.trim(),
            estimatedCost: parseNumber(newCost),
            actualCost: newActualCost.trim() ? parseNumber(newActualCost) : 0,
            category: selectedCategory,
            isPaid: newIsPaid,
          },
        });
      } else {
        await createItemMutation.mutateAsync({
          category: selectedCategory,
          label: newLabel.trim(),
          estimatedCost: parseNumber(newCost),
          actualCost: 0,
          isPaid: false,
        });
      }

      setNewLabel("");
      setNewCost("");
      setNewActualCost("");
      setNewIsPaid(false);
      setEditingItem(null);
      setShowForm(false);
      resetValidation();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Feil", "Kunne ikke lagre utgift");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditItem = (item: BudgetItem) => {
    setEditingItem(item);
    setNewLabel(item.label);
    setNewCost((item.estimatedCost || 0).toString());
    setNewActualCost((item.actualCost || 0).toString());
    setNewIsPaid(item.isPaid || false);
    setSelectedCategory(item.category);
    setShowForm(true);
    resetValidation();
  };

  const handleTogglePaid = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (item) {
      await updateItemMutation.mutateAsync({ id, data: { isPaid: !item.isPaid } });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleDeleteItem = async (id: string) => {
    Alert.alert("Slett", "Slette denne utgiften?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Slett",
        style: "destructive",
        onPress: async () => {
          await deleteItemMutation.mutateAsync(id);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  };

  const handleSaveBudget = async () => {
    try {
      const newBudget = parseNumber(budgetInput) || 300000;
      await updateSettingsMutation.mutateAsync({ totalBudget: newBudget });
      setEditingBudget(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Feil", "Kunne ikke lagre budsjett");
    }
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

  // Function to add all default items
  const handleImportDefaults = async () => {
    try {
      setIsSaving(true);
      for (const item of DEFAULT_ITEMS) {
        await createItemMutation.mutateAsync({
          category: item.category,
          label: item.label,
          estimatedCost: item.estimatedCost,
          actualCost: 0,
          isPaid: false,
        });
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Feil", "Kunne ikke importere standardbudsjettet");
    } finally {
      setIsSaving(false);
    }
  };

  // Import tradition-specific budget items
  const handleImportTraditionBudget = async () => {
    const traditions = coupleProfile?.selectedTraditions || [];
    if (traditions.length === 0) {
      Alert.alert("Ingen tradisjoner", "Velg tradisjoner i profilen din først.");
      return;
    }
    try {
      setIsSaving(true);
      for (const t of traditions) {
        const tItems = TRADITION_BUDGET_ITEMS[t.toLowerCase()] || [];
        for (const item of tItems) {
          // Skip if already exists
          if (items.some(existing => existing.label === item.label)) continue;
          await createItemMutation.mutateAsync({
            category: item.category,
            label: item.label,
            estimatedCost: item.estimatedCost,
            actualCost: 0,
            isPaid: false,
          });
        }
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Feil", "Kunne ikke importere tradisjonsbudsjett");
    } finally {
      setIsSaving(false);
    }
  };

  const guestCount = coupleProfile?.expectedGuests || 0;
  const perPerson = guestCount > 0 ? getPerPersonBudget(totalBudget, guestCount) : 0;

  if (loading) {
    return (
      <View
        style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}
      >
        <ActivityIndicator size="large" color={Colors.dark.accent} />
        <ThemedText style={{ color: theme.textSecondary, marginTop: Spacing.md }}>
          Laster budsjett...
        </ThemedText>
      </View>
    );
  }

  if (isError) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <EvendiIcon name="alert-circle" size={48} color={theme.error} />
        <ThemedText style={{ color: theme.error, marginTop: Spacing.md, textAlign: "center" }}>
          Kunne ikke laste budsjett
        </ThemedText>
        <ThemedText style={{ color: theme.textSecondary, marginTop: Spacing.xs, textAlign: "center", paddingHorizontal: Spacing.xl }}>
          {error instanceof Error ? error.message : "Ukjent feil"}
        </ThemedText>
        <Button
          onPress={() => {
            refetchSettings();
            refetchItems();
          }}
          style={{ marginTop: Spacing.lg }}
        >
          Prøv igjen
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
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.accent} />}
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
                  <EvendiIcon name="check" size={18} color={Colors.dark.accent} />
                </Pressable>
              </View>
            ) : (
              <Pressable onPress={() => setEditingBudget(true)} style={styles.budgetValueRow}>
                <ThemedText style={[styles.budgetValue, { color: Colors.dark.accent }]}>
                  {formatCurrency(totalBudget)}
                </ThemedText>
                <EvendiIcon name="edit-2" size={14} color={theme.textMuted} />
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
              <ThemedText style={[styles.statValue, { color: totalActual > 0 ? Colors.dark.accent : theme.textMuted }]}>
                {formatCurrency(totalActual)}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                Faktisk
              </ThemedText>
            </View>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: remaining >= 0 ? theme.success : theme.error }]}>
                {formatCurrency(Math.abs(remaining))}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
                {remaining >= 0 ? "Gjenstår" : "Over"}
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

      {/* Per-person budget & guest count badge */}
      {guestCount > 0 && (
        <Animated.View entering={FadeInDown.delay(150).duration(300)}>
          <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, marginTop: Spacing.sm }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <EvendiIcon name="users" size={16} color={Colors.dark.accent} />
                <ThemedText style={{ color: theme.text, marginLeft: Spacing.xs, fontWeight: '600' }}>
                  {guestCount} gjester
                </ThemedText>
              </View>
              <ThemedText style={{ color: theme.textSecondary, fontSize: 13 }}>
                ca. {perPerson.toLocaleString('nb-NO')} kr per person
              </ThemedText>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Tradition budget import button */}
      {(coupleProfile?.selectedTraditions?.length ?? 0) > 0 && items.length > 0 && (
        <Animated.View entering={FadeInDown.delay(180).duration(300)}>
          <Pressable
            onPress={handleImportTraditionBudget}
            disabled={isSaving}
            style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault, borderColor: '#FFB300', borderWidth: 1, marginTop: Spacing.sm, flexDirection: 'row', alignItems: 'center' }]}
          >
            <EvendiIcon name="globe" size={16} color="#FFB300" />
            <ThemedText style={{ color: theme.text, marginLeft: Spacing.sm, flex: 1, fontSize: 14 }}>
              Importer tradisjonsbudsjett ({coupleProfile?.selectedTraditions?.map(t => CULTURAL_LABELS[t] || t).join(', ')})
            </ThemedText>
            <EvendiIcon name="plus-circle" size={18} color="#FFB300" />
          </Pressable>
        </Animated.View>
      )}

      {items.length > 0 && (
        <ThemedText style={[styles.swipeHint, { color: theme.textMuted }]}>
          Sveip til venstre for å endre eller slette
        </ThemedText>
      )}

      {/* Empty state with import defaults CTA */}
      {items.length === 0 && !showForm && (
        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <EvendiIcon name="clipboard" size={48} color={theme.textMuted} />
            <ThemedText type="h4" style={{ color: theme.text, marginTop: Spacing.md, textAlign: "center" }}>
              Ingen utgifter ennå
            </ThemedText>
            <ThemedText style={{ color: theme.textSecondary, marginTop: Spacing.xs, textAlign: "center" }}>
              Start med et standardbudsjett eller legg til dine egne utgifter
            </ThemedText>
            <Button
              onPress={handleImportDefaults}
              style={{ marginTop: Spacing.lg }}
              disabled={isSaving}
            >
              {isSaving ? "Importerer..." : "Importer standardbudsjett"}
            </Button>
          </View>
        </Animated.View>
      )}

      {groupedItems.map((category, catIndex) => (
        <Animated.View key={category.id} entering={FadeInDown.delay(200 + catIndex * 100).duration(400)}>
          <View style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryIcon, { backgroundColor: category.color + "20" }]}>
                {renderIcon(category.icon, category.color, 16)}
              </View>
              <ThemedText type="h4" style={styles.categoryName}>{category.name}</ThemedText>
              <ThemedText style={[styles.categoryTotal, { color: theme.textSecondary }]}>
                {formatCurrency(category.total)}
              </ThemedText>
            </View>

            {category.items.map((item, index) => (
              <Animated.View key={item.id} entering={FadeInRight.delay(index * 50).duration(300)}>
                <SwipeableRow
                  onEdit={() => handleEditItem(item)}
                  onDelete={() => handleDeleteItem(item.id)}
                  backgroundColor={theme.backgroundDefault}
                >
                  <Pressable
                    onPress={() => handleTogglePaid(item.id)}
                    style={[styles.itemRow, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: item.isPaid ? Colors.dark.accent : "transparent",
                          borderColor: item.isPaid ? Colors.dark.accent : theme.border,
                        },
                      ]}
                    >
                      {item.isPaid ? <EvendiIcon name="check" size={12} color="#1A1A1A" /> : null}
                    </View>
                    <View style={styles.itemNameContainer}>
                      <ThemedText style={[styles.itemName, item.isPaid && styles.itemPaid]}>
                        {item.label}
                      </ThemedText>
                      {(item.actualCost ?? 0) > 0 && item.actualCost !== item.estimatedCost && (
                        <ThemedText style={[styles.itemActualLabel, { color: theme.textMuted }]}>
                          Est: {formatCurrency(item.estimatedCost)}
                        </ThemedText>
                      )}
                    </View>
                    <ThemedText style={[styles.itemCost, { color: Colors.dark.accent }]}>
                      {formatCurrency((item.actualCost ?? 0) > 0 ? (item.actualCost ?? 0) : item.estimatedCost)}
                    </ThemedText>
                  </Pressable>
                </SwipeableRow>
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
          <ThemedText type="h3" style={styles.formTitle}>{editingItem ? "Endre utgift" : "Legg til utgift"}</ThemedText>

          <View>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }, getFieldStyle("newLabel")]}
              placeholder="Navn"
              placeholderTextColor={theme.textMuted}
              value={newLabel}
              onChangeText={setNewLabel}
              onBlur={() => handleBlur("newLabel", newLabel)}
            />
            {touched.newLabel && errors.newLabel ? (
              <ThemedText style={styles.errorText}>{errors.newLabel}</ThemedText>
            ) : null}
          </View>

          <View>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }, getFieldStyle("newCost")]}
              placeholder="Estimert beløp (kr)"
              placeholderTextColor={theme.textMuted}
              value={newCost}
              onChangeText={setNewCost}
              onBlur={() => handleBlur("newCost", newCost)}
              keyboardType="numeric"
            />
            {touched.newCost && errors.newCost ? (
              <ThemedText style={styles.errorText}>{errors.newCost}</ThemedText>
            ) : null}
          </View>

          {/* Show actual cost and paid toggle only when editing */}
          {editingItem && (
            <>
              <View>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                  placeholder="Faktisk beløp (kr)"
                  placeholderTextColor={theme.textMuted}
                  value={newActualCost}
                  onChangeText={setNewActualCost}
                  keyboardType="numeric"
                />
              </View>

              <Pressable
                onPress={() => setNewIsPaid(!newIsPaid)}
                style={[styles.paidToggle, { borderColor: theme.border }]}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: newIsPaid ? Colors.dark.accent : "transparent",
                      borderColor: newIsPaid ? Colors.dark.accent : theme.border,
                    },
                  ]}
                >
                  {newIsPaid ? <EvendiIcon name="check" size={12} color="#1A1A1A" /> : null}
                </View>
                <ThemedText style={{ color: theme.text }}>Betalt</ThemedText>
              </Pressable>
            </>
          )}

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
                {renderIcon(
                  cat.icon,
                  selectedCategory === cat.id ? "#FFFFFF" : theme.textSecondary,
                  14
                )}
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
            <Pressable
              onPress={() => {
                setShowForm(false);
                setEditingItem(null);
                setNewLabel("");
                setNewCost("");
                setNewActualCost("");
                setNewIsPaid(false);
                setSelectedCategory("other");
                resetValidation();
              }}
              style={[styles.cancelButton, { borderColor: theme.border }]}
            >
              <ThemedText style={{ color: theme.textSecondary }}>Avbryt</ThemedText>
            </Pressable>
            <Button onPress={handleAddItem} style={styles.saveButton} disabled={isSaving}>
              {isSaving ? "Lagrer..." : (editingItem ? "Oppdater" : "Lagre")}
            </Button>
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
          <EvendiIcon name="plus" size={20} color={Colors.dark.accent} />
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
  swipeHint: { fontSize: 12, textAlign: "center", marginBottom: Spacing.md },
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
  itemNameContainer: { flex: 1 },
  itemName: { fontSize: 15 },
  itemActualLabel: { fontSize: 11, marginTop: 2 },
  itemPaid: { textDecorationLine: "line-through", opacity: 0.6 },
  itemCost: { fontSize: 14, fontWeight: "600" },
  emptyState: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  paidToggle: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
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
  errorText: {
    fontSize: 12,
    color: "#DC3545",
    marginTop: -8,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
});
