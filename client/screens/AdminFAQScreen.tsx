import React, { useState } from "react";
import { ScrollView, StyleSheet, View, Pressable, TextInput, ActivityIndicator, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EvendiIcon } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { showToast } from "@/lib/toast";
import { showConfirm } from "@/lib/dialogs";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface FaqItem {
  id: string;
  category: "couple" | "vendor";
  icon: string;
  question: string;
  answer: string;
  sortOrder: number;
  isActive: boolean;
}

export default function AdminFAQScreen({ route }: { route: { params: { adminKey: string } } }) {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();
  const { adminKey } = route.params;

  const [selectedCategory, setSelectedCategory] = useState<"couple" | "vendor">("vendor");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    icon: "",
    question: "",
    answer: "",
    sortOrder: 0,
    isActive: true,
  });

  const { data: faqItems = [], isLoading } = useQuery({
    queryKey: ["admin-faq", selectedCategory, adminKey],
    queryFn: async () => {
      const url = new URL(`/api/admin/faq/${selectedCategory}`, getApiUrl());
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) throw new Error("Kunne ikke hente FAQ");
      return res.json() as Promise<FaqItem[]>;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const url = new URL("/api/admin/faq", getApiUrl());
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify({ ...data, category: selectedCategory }),
      });
      if (!res.ok) throw new Error("Kunne ikke opprette FAQ");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faq"] });
      resetForm();
      showToast("FAQ opprettet");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<typeof formData> }) => {
      const url = new URL(`/api/admin/faq/${id}`, getApiUrl());
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Kunne ikke oppdatere FAQ");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faq"] });
      setEditingId(null);
      resetForm();
      showToast("FAQ oppdatert");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const url = new URL(`/api/admin/faq/${id}`, getApiUrl());
      const res = await fetch(url, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) throw new Error("Kunne ikke slette FAQ");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-faq"] });
      showToast("FAQ slettet");
    },
  });

  const resetForm = () => {
    setFormData({ icon: "", question: "", answer: "", sortOrder: 0, isActive: true });
    setEditingId(null);
  };

  const handleEdit = (item: FaqItem) => {
    setEditingId(item.id);
    setFormData({
      icon: item.icon,
      question: item.question,
      answer: item.answer,
      sortOrder: item.sortOrder,
      isActive: item.isActive,
    });
  };

  const handleSubmit = () => {
    if (!formData.icon || !formData.question || !formData.answer) {
      showToast("Alle felter må fylles ut");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({
      title: "Slett FAQ",
      message: "Er du sikker på at du vil slette dette spørsmålet?",
      confirmLabel: "Slett",
      cancelLabel: "Avbryt",
      destructive: true,
    });
    if (!confirmed) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    deleteMutation.mutate(id);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundRoot }]} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Category Tabs */}
        <View style={styles.tabs}>
          <Pressable
            onPress={() => {
              setSelectedCategory("vendor");
              resetForm();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[
              styles.tab,
              selectedCategory === "vendor" && [styles.tabActive, { backgroundColor: theme.accent }],
              selectedCategory !== "vendor" && { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            ]}
          >
            <EvendiIcon name="briefcase" size={18} color={selectedCategory === "vendor" ? "#FFF" : theme.textSecondary} />
            <ThemedText style={[styles.tabText, { color: selectedCategory === "vendor" ? "#FFF" : theme.textSecondary }]}>
              Leverandører
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => {
              setSelectedCategory("couple");
              resetForm();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[
              styles.tab,
              selectedCategory === "couple" && [styles.tabActive, { backgroundColor: theme.accent }],
              selectedCategory !== "couple" && { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            ]}
          >
            <EvendiIcon name="heart" size={18} color={selectedCategory === "couple" ? "#FFF" : theme.textSecondary} />
            <ThemedText style={[styles.tabText, { color: selectedCategory === "couple" ? "#FFF" : theme.textSecondary }]}>
              Par
            </ThemedText>
          </Pressable>
        </View>

        {/* Form */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.formTitle}>{editingId ? "Rediger FAQ" : "Ny FAQ"}</ThemedText>

          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Ikon (Evendi)</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
              placeholder="f.eks. log-in, package, star"
              placeholderTextColor={theme.textMuted}
              value={formData.icon}
              onChangeText={(text) => setFormData({ ...formData, icon: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Spørsmål</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
              placeholder="Skriv spørsmål..."
              placeholderTextColor={theme.textMuted}
              value={formData.question}
              onChangeText={(text) => setFormData({ ...formData, question: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Svar</ThemedText>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
              placeholder="Skriv svar..."
              placeholderTextColor={theme.textMuted}
              value={formData.answer}
              onChangeText={(text) => setFormData({ ...formData, answer: text })}
              multiline
              numberOfLines={5}
            />
          </View>

          <View style={styles.formGroup}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Sorteringsrekkefølge</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
              placeholder="0"
              placeholderTextColor={theme.textMuted}
              value={formData.sortOrder.toString()}
              onChangeText={(text) => setFormData({ ...formData, sortOrder: parseInt(text) || 0 })}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.formGroup, styles.switchRow]}>
            <ThemedText style={styles.label}>Aktiv</ThemedText>
            <Switch
              value={formData.isActive}
              onValueChange={(value) => setFormData({ ...formData, isActive: value })}
              trackColor={{ false: theme.border, true: theme.accent }}
            />
          </View>

          <View style={styles.buttonRow}>
            {editingId && (
              <Pressable
                onPress={resetForm}
                style={[styles.btnSecondary, { borderColor: theme.border }]}
              >
                <ThemedText style={{ color: theme.textSecondary }}>Avbryt</ThemedText>
              </Pressable>
            )}
            <Pressable
              onPress={handleSubmit}
              style={[styles.btnPrimary, { backgroundColor: theme.accent }]}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <ThemedText style={{ color: "#FFF", fontWeight: "600" }}>
                  {editingId ? "Oppdater" : "Opprett"}
                </ThemedText>
              )}
            </Pressable>
          </View>
        </View>

        {/* FAQ List */}
        <View style={[styles.listCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.listTitle}>
            {selectedCategory === "vendor" ? "Leverandør FAQ" : "Par FAQ"} ({faqItems.length})
          </ThemedText>

          {isLoading ? (
            <ActivityIndicator style={{ marginTop: Spacing.lg }} color={theme.accent} />
          ) : faqItems.length === 0 ? (
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              Ingen FAQ funnet. Opprett din første!
            </ThemedText>
          ) : (
            faqItems.map((item) => (
              <View key={item.id} style={[styles.faqItem, { borderColor: theme.border }]}>
                <View style={styles.faqHeader}>
                  <View style={styles.faqHeaderLeft}>
                    <View style={[styles.iconCircle, { backgroundColor: theme.accent + "15" }]}>
                      <EvendiIcon name={item.icon as any} size={16} color={theme.accent} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.faqQuestion}>{item.question}</ThemedText>
                      <ThemedText style={[styles.faqMeta, { color: theme.textMuted }]}>
                        Rekkefølge: {item.sortOrder} • {item.isActive ? "Aktiv" : "Inaktiv"}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.faqActions}>
                    <Pressable onPress={() => handleEdit(item)} style={styles.actionBtn}>
                      <EvendiIcon name="edit-2" size={18} color={theme.accent} />
                    </Pressable>
                    <Pressable onPress={() => handleDelete(item.id)} style={styles.actionBtn}>
                      <EvendiIcon name="trash-2" size={18} color="#FF6B6B" />
                    </Pressable>
                  </View>
                </View>
                <ThemedText style={[styles.faqAnswer, { color: theme.textSecondary }]}>
                  {item.answer}
                </ThemedText>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: Spacing.md },
  tabs: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  tabActive: {},
  tabText: { fontSize: 14, fontWeight: "600" },
  formCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  formTitle: { fontSize: 18, fontWeight: "600", marginBottom: Spacing.md },
  formGroup: { marginBottom: Spacing.md },
  label: { fontSize: 14, fontWeight: "500", marginBottom: Spacing.xs },
  input: {
    height: 44,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
  },
  textArea: {
    minHeight: 100,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
    textAlignVertical: "top",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  buttonRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  btnPrimary: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  btnSecondary: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  listCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  listTitle: { fontSize: 18, fontWeight: "600", marginBottom: Spacing.md },
  emptyText: { textAlign: "center", marginTop: Spacing.lg },
  faqItem: {
    borderBottomWidth: 1,
    paddingVertical: Spacing.md,
  },
  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  faqHeaderLeft: {
    flexDirection: "row",
    gap: Spacing.sm,
    flex: 1,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  faqQuestion: { fontSize: 15, fontWeight: "600", marginBottom: 2 },
  faqMeta: { fontSize: 12 },
  faqAnswer: { fontSize: 14, lineHeight: 20, marginLeft: 40 },
  faqActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionBtn: {
    padding: Spacing.xs,
  },
});
