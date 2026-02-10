import React, { useState, useMemo } from "react";
import { View, ScrollView, StyleSheet, TextInput, Pressable, Switch, FlatList } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { EvendiIcon } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";

import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors, Typography } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { showToast } from "@/lib/toast";
import { showConfirm } from "@/lib/dialogs";
import type { WhatsNewItem } from "../../shared/schema";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

type Props = NativeStackScreenProps<RootStackParamList, "AdminWhatsNew">;

const FEATHER_ICONS = [
  "star", "zap", "gift", "check-circle", "alert-circle", "info", "heart", "thumbs-up",
  "trending-up", "package", "user", "settings", "bell", "flag", "rocket", "camera"
];

type Category = "vendor" | "couple";

export default function AdminWhatsNewScreen({ route }: Props) {
  const { adminKey } = route.params;
  const { theme } = useTheme();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [activeCategory, setActiveCategory] = useState<Category>("vendor");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category: "vendor" as Category,
    title: "",
    description: "",
    icon: "star",
    minAppVersion: "1.0.0",
    isActive: true,
    sortOrder: 0,
  });

  // Fetch what's new items for active category
  const { data: items = [] } = useQuery<WhatsNewItem[]>({
    queryKey: ["admin-whats-new", activeCategory],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/admin/whats-new/${activeCategory}`, {
        headers: { "X-Admin-Key": adminKey },
      });
      if (!res.ok) throw new Error("Kunne ikke hente hva som er nytt");
      return res.json();
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch(`${getApiUrl()}/api/admin/whats-new`, {
        method: "POST",
        headers: {
          "X-Admin-Key": adminKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Kunne ikke opprette");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-whats-new", activeCategory] });
      queryClient.invalidateQueries({ queryKey: ["whats-new", activeCategory] });
      resetForm();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error: any) => {
      showToast(error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const res = await fetch(`${getApiUrl()}/api/admin/whats-new/${id}`, {
        method: "PATCH",
        headers: {
          "X-Admin-Key": adminKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Kunne ikke oppdatere");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-whats-new", activeCategory] });
      queryClient.invalidateQueries({ queryKey: ["whats-new", activeCategory] });
      resetForm();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error: any) => {
      showToast(error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${getApiUrl()}/api/admin/whats-new/${id}`, {
        method: "DELETE",
        headers: { "X-Admin-Key": adminKey },
      });
      if (!res.ok) throw new Error("Kunne ikke slette");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-whats-new", activeCategory] });
      queryClient.invalidateQueries({ queryKey: ["whats-new", activeCategory] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error: any) => {
      showToast(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      category: activeCategory,
      title: "",
      description: "",
      icon: "star",
      minAppVersion: "1.0.0",
      isActive: true,
      sortOrder: 0,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item: WhatsNewItem) => {
    setFormData({
      category: item.category as Category,
      title: item.title,
      description: item.description,
      icon: item.icon,
      minAppVersion: item.minAppVersion,
      isActive: item.isActive,
      sortOrder: item.sortOrder,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      showToast("Tittel er påkrevd");
      return;
    }
    if (!formData.description.trim()) {
      showToast("Beskrivelse er påkrevd");
      return;
    }

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm({
      title: "Slett",
      message: "Er du sikker på at du vil slette dette?",
      confirmLabel: "Slett",
      cancelLabel: "Avbryt",
      destructive: true,
    });
    if (!confirmed) return;
    deleteMutation.mutate(id);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Category Tabs */}
        <View style={[styles.categoryTabs, { borderBottomColor: theme.border }]}>
          {(["vendor", "couple"] as const).map((category) => (
            <Pressable
              key={category}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveCategory(category);
                resetForm();
              }}
              style={[
                styles.categoryTab,
                activeCategory === category && { borderBottomColor: theme.accent, borderBottomWidth: 2 },
              ]}
            >
              <EvendiIcon
                name={category === "vendor" ? "briefcase" : "heart"}
                size={16}
                color={activeCategory === category ? theme.accent : theme.textMuted}
              />
              <ThemedText
                style={[
                  styles.categoryTabText,
                  activeCategory === category && { color: theme.accent, fontWeight: "600" },
                ]}
              >
                {category === "vendor" ? "Leverandører" : "Par"}
              </ThemedText>
            </Pressable>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: theme.backgroundSecondary }]}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>Hva er nytt</ThemedText>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setShowForm(!showForm);
                if (showForm) resetForm();
              }}
              style={[styles.addButton, { backgroundColor: theme.accent }]}
            >
              <EvendiIcon
                name={showForm ? "x" : "plus"}
                size={18}
                color="#FFFFFF"
              />
            </Pressable>
          </View>

          {showForm && (
            <View style={[styles.form, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
              <ThemedText style={styles.formTitle}>
                {editingId ? "Rediger" : "Nytt element"}
              </ThemedText>

              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Tittel</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  placeholder="f.eks. Ny chat-funksjon"
                  placeholderTextColor={theme.textMuted}
                  value={formData.title}
                  onChangeText={(text) => setFormData({ ...formData, title: text })}
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Beskrivelse</ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea, { borderColor: theme.border, color: theme.text }]}
                  placeholder="Detaljert beskrivelse av den nye funksjonen..."
                  placeholderTextColor={theme.textMuted}
                  value={formData.description}
                  onChangeText={(text) => setFormData({ ...formData, description: text })}
                  multiline
                  numberOfLines={4}
                />
              </View>

              <View style={styles.formGroup}>
                <ThemedText style={styles.label}>Ikon</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.iconPicker}>
                  {FEATHER_ICONS.map((icon) => (
                    <Pressable
                      key={icon}
                      onPress={() => setFormData({ ...formData, icon })}
                      style={[
                        styles.iconOption,
                        {
                          backgroundColor:
                            formData.icon === icon ? theme.accent : theme.backgroundSecondary,
                        },
                      ]}
                    >
                      <EvendiIcon
                        name={icon as any}
                        size={20}
                        color={formData.icon === icon ? "#FFFFFF" : theme.accent}
                      />
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <ThemedText style={styles.label}>Min versjon</ThemedText>
                  <TextInput
                    style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                    placeholder="1.0.0"
                    placeholderTextColor={theme.textMuted}
                    value={formData.minAppVersion}
                    onChangeText={(text) => setFormData({ ...formData, minAppVersion: text })}
                  />
                </View>

                <View style={[styles.formGroup, { flex: 1 }]}>
                  <ThemedText style={styles.label}>Sortrekkefølge</ThemedText>
                  <TextInput
                    style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                    placeholder="0"
                    placeholderTextColor={theme.textMuted}
                    value={formData.sortOrder.toString()}
                    onChangeText={(text) =>
                      setFormData({ ...formData, sortOrder: parseInt(text) || 0 })
                    }
                    keyboardType="number-pad"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <View style={styles.switchRow}>
                  <ThemedText style={styles.label}>Aktiv</ThemedText>
                  <Switch
                    value={formData.isActive}
                    onValueChange={(value) => setFormData({ ...formData, isActive: value })}
                    trackColor={{ false: theme.border, true: theme.accent + "50" }}
                    thumbColor={formData.isActive ? theme.accent : theme.textMuted}
                  />
                </View>
              </View>

              <View style={styles.formButtons}>
                <Pressable
                  onPress={handleSave}
                  style={[styles.saveButton, { backgroundColor: theme.accent }]}
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  <ThemedText style={styles.buttonText}>
                    {createMutation.isPending || updateMutation.isPending ? "Lagrer..." : "Lagre"}
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={resetForm}
                  style={[styles.cancelButton, { borderColor: theme.border }]}
                >
                  <ThemedText style={styles.buttonText}>Avbryt</ThemedText>
                </Pressable>
              </View>
            </View>
          )}

          <View style={styles.itemsList}>
            {items.length === 0 ? (
              <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
                Ingen elementer ennå. Klikk "+" for å legge til.
              </ThemedText>
            ) : (
              items.map((item) => (
                <View
                  key={item.id}
                  style={[styles.item, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
                >
                  <View style={[styles.itemIcon, { backgroundColor: theme.accent + "20" }]}>
                    <EvendiIcon name={item.icon as any} size={20} color={theme.accent} />
                  </View>

                  <View style={styles.itemContent}>
                    <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
                    <ThemedText
                      style={[styles.itemDescription, { color: theme.textMuted }]}
                      numberOfLines={2}
                    >
                      {item.description}
                    </ThemedText>
                    <View style={styles.itemMeta}>
                      <ThemedText style={[styles.metaText, { color: theme.textMuted }]}>
                        v{item.minAppVersion}
                      </ThemedText>
                      {!item.isActive && (
                        <View style={[styles.badge, { backgroundColor: theme.error + "20" }]}>
                          <ThemedText style={[styles.badgeText, { color: theme.error, fontSize: 11 }]}>
                            Inaktiv
                          </ThemedText>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.itemActions}>
                    <Pressable
                      onPress={() => handleEdit(item)}
                      style={[styles.actionButton, { backgroundColor: theme.accent + "20" }]}
                    >
                      <EvendiIcon name="edit-2" size={16} color={theme.accent} />
                    </Pressable>
                    <Pressable
                      onPress={() => handleDelete(item.id)}
                      style={[styles.actionButton, { backgroundColor: theme.error + "20" }]}
                    >
                      <EvendiIcon name="trash-2" size={16} color={theme.error} />
                    </Pressable>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        <View style={[styles.infoBox, { backgroundColor: theme.accent + "15", borderColor: theme.accent }]}>
          <EvendiIcon name="info" size={18} color={theme.accent} />
          <ThemedText style={[styles.infoText, { color: theme.text }]}>
            <ThemedText style={{ fontWeight: "600" }}>Tips: </ThemedText>
            Elementer vises automatisk til brukere som oppgraderer appen. Kun aktive elementer vises.
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.lg,
    gap: Spacing.lg,
  },
  categoryTabs: {
    flexDirection: "row",
    gap: Spacing.lg,
    borderBottomWidth: 1,
  },
  categoryTab: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
    alignItems: "center",
  },
  categoryTabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  formGroup: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: 13,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
  },
  textArea: {
    textAlignVertical: "top",
    paddingVertical: Spacing.md,
  },
  formRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  iconPicker: {
    marginHorizontal: -Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  formButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  saveButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  itemsList: {
    gap: Spacing.md,
  },
  emptyText: {
    textAlign: "center",
    paddingVertical: Spacing.lg,
    fontSize: 14,
  },
  item: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  itemContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  itemDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  itemMeta: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  metaText: {
    fontSize: 11,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontWeight: "600",
  },
  itemActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  infoBox: {
    flexDirection: "row",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
});
