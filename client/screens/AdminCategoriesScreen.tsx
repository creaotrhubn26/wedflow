import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRoute } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

interface Category {
  id: string;
  name: string;
  icon: string;
  sortOrder?: number;
  description?: string;
}

const ICON_OPTIONS = [
  "heart", "camera", "video", "image", "star", "gift", "home", "music",
  "scissors", "car", "utensils", "flower", "cake", "clipboard", "mail",
  "calendar", "users", "map-pin", "phone", "globe", "award", "bookmark"
];

export default function AdminCategoriesScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const route = useRoute();
  const adminKey = (route.params as any)?.adminKey || "";

  const [selectedTab, setSelectedTab] = useState<"inspiration" | "vendor">("inspiration");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("heart");
  const [description, setDescription] = useState("");

  const { data: inspirationCategories = [], isLoading: loadingInspiration } = useQuery<Category[]>({
    queryKey: ["/api/inspiration-categories"],
  });

  const { data: vendorCategories = [], isLoading: loadingVendor } = useQuery<Category[]>({
    queryKey: ["/api/vendor-categories"],
  });

  const categories = selectedTab === "inspiration" ? inspirationCategories : vendorCategories;
  const isLoading = selectedTab === "inspiration" ? loadingInspiration : loadingVendor;
  const apiPath = selectedTab === "inspiration" ? "inspiration-categories" : "vendor-categories";

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; icon: string; description?: string }) => {
      const url = new URL(`/api/admin/${apiPath}`, getApiUrl());
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Kunne ikke opprette");
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: [`/api/${apiPath}`] });
      setShowModal(false);
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: { id: string; name: string; icon: string; description?: string }) => {
      const url = new URL(`/api/admin/${apiPath}/${id}`, getApiUrl());
      const response = await fetch(url.toString(), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${adminKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Kunne ikke oppdatere");
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: [`/api/${apiPath}`] });
      setShowModal(false);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const url = new URL(`/api/admin/${apiPath}/${id}`, getApiUrl());
      const response = await fetch(url.toString(), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!response.ok) throw new Error("Kunne ikke slette");
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      queryClient.invalidateQueries({ queryKey: [`/api/${apiPath}`] });
    },
  });

  const resetForm = () => {
    setName("");
    setIcon("heart");
    setDescription("");
    setEditingCategory(null);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setName(category.name);
    setIcon(category.icon);
    setDescription(category.description || "");
    setShowModal(true);
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Feil", "Navn er påkrevd");
      return;
    }

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, name, icon, description });
    } else {
      createMutation.mutate({ name, icon, description });
    }
  };

  const handleDelete = (category: Category) => {
    Alert.alert(
      "Slett kategori",
      `Er du sikker på at du vil slette "${category.name}"?`,
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Slett",
          style: "destructive",
          onPress: () => deleteMutation.mutate(category.id),
        },
      ]
    );
  };

  const tabs = [
    { key: "inspiration" as const, label: "Inspirasjon" },
    { key: "vendor" as const, label: "Leverandører" },
  ];

  const renderItem = ({ item, index }: { item: Category; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <View style={[styles.card, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={[styles.iconCircle, { backgroundColor: Colors.dark.accent + "20" }]}>
          <Feather name={item.icon as any} size={20} color={Colors.dark.accent} />
        </View>
        <View style={styles.cardContent}>
          <ThemedText style={styles.cardTitle}>{item.name}</ThemedText>
          {item.description ? (
            <ThemedText style={[styles.cardDesc, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.description}
            </ThemedText>
          ) : null}
        </View>
        <Pressable
          style={styles.iconButton}
          onPress={() => openEditModal(item)}
        >
          <Feather name="edit-2" size={18} color={theme.textSecondary} />
        </Pressable>
        <Pressable
          style={styles.iconButton}
          onPress={() => handleDelete(item)}
        >
          <Feather name="trash-2" size={18} color="#FF6B6B" />
        </Pressable>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.tabRow, { paddingTop: headerHeight + Spacing.sm }]}>
        {tabs.map((tab) => (
          <Pressable
            key={tab.key}
            style={[
              styles.tab,
              selectedTab === tab.key && { backgroundColor: Colors.dark.accent },
              { borderColor: theme.border }
            ]}
            onPress={() => {
              setSelectedTab(tab.key);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <ThemedText style={[
              styles.tabText,
              selectedTab === tab.key && styles.tabTextActive
            ]}>
              {tab.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.accent} />
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            padding: Spacing.lg,
            paddingBottom: insets.bottom + 100,
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="folder" size={48} color={theme.textMuted} />
              <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
                Ingen kategorier ennå
              </ThemedText>
            </View>
          }
        />
      )}

      <Pressable
        style={[styles.fab, { backgroundColor: Colors.dark.accent }]}
        onPress={() => {
          resetForm();
          setShowModal(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
      >
        <Feather name="plus" size={24} color="#000" />
      </Pressable>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {editingCategory ? "Rediger kategori" : "Ny kategori"}
              </ThemedText>
              <Pressable onPress={() => { setShowModal(false); resetForm(); }}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Navn</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
              value={name}
              onChangeText={setName}
              placeholder="Kategori navn"
              placeholderTextColor={theme.textMuted}
            />

            <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.md }]}>Ikon</ThemedText>
            <View style={styles.iconGrid}>
              {ICON_OPTIONS.map((iconName) => (
                <Pressable
                  key={iconName}
                  style={[
                    styles.iconOption,
                    icon === iconName && { backgroundColor: Colors.dark.accent },
                    { borderColor: theme.border }
                  ]}
                  onPress={() => setIcon(iconName)}
                >
                  <Feather
                    name={iconName as any}
                    size={20}
                    color={icon === iconName ? "#000" : theme.text}
                  />
                </Pressable>
              ))}
            </View>

            {selectedTab === "vendor" ? (
              <>
                <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.md }]}>
                  Beskrivelse
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Beskrivelse (valgfritt)"
                  placeholderTextColor={theme.textMuted}
                />
              </>
            ) : null}

            <Pressable
              style={[styles.saveButton, { backgroundColor: Colors.dark.accent }]}
              onPress={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <ActivityIndicator color="#000" />
              ) : (
                <ThemedText style={styles.saveButtonText}>Lagre</ThemedText>
              )}
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  tabTextActive: {
    color: "#000",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  cardDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  iconButton: {
    padding: Spacing.sm,
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: Spacing.xl * 2,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 15,
  },
  fab: {
    position: "absolute",
    bottom: 100,
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    padding: Spacing.lg,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  label: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButton: {
    height: 52,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
  },
  saveButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});
