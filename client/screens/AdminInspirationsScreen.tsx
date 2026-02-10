import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  FlatList,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { EvendiIcon } from "@/components/EvendiIcon";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { AdminHeader } from "@/components/AdminHeader";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

interface Inspiration {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  status: string;
  createdAt: string;
  vendor?: {
    businessName: string;
  };
}

export default function AdminInspirationsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const route = useRoute<RouteProp<RootStackParamList, "AdminInspirations">>();
  const adminKey = route.params?.adminKey || "";

  const [selectedTab, setSelectedTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);

  const { data: inspirations = [], isLoading } = useQuery<Inspiration[]>({
    queryKey: ["/api/admin/inspirations", selectedTab, adminKey],
    queryFn: async () => {
      const url = new URL(`/api/admin/inspirations?status=${selectedTab}`, getApiUrl());
      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!response.ok) throw new Error("Kunne ikke hente showcases");
      return response.json();
    },
    enabled: adminKey.length > 0,
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const url = new URL(`/api/admin/inspirations/${id}/approve`, getApiUrl());
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!response.ok) throw new Error("Kunne ikke godkjenne");
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inspirations"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const url = new URL(`/api/admin/inspirations/${id}/reject`, getApiUrl());
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error("Kunne ikke avvise");
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inspirations"] });
    },
  });

  const handleReject = (id: string) => {
    if (Platform.OS === "ios") {
      Alert.prompt(
        "Avvis showcase",
        "Oppgi en begrunnelse (valgfritt):",
        [
          { text: "Avbryt", style: "cancel" },
          {
            text: "Avvis",
            style: "destructive",
            onPress: (reason: string | undefined) => rejectMutation.mutate({ id, reason: reason || "" }),
          },
        ],
        "plain-text"
      );
      return;
    }

    setRejectTargetId(id);
    setRejectReason("");
    setRejectModalVisible(true);
  };

  const handleConfirmReject = () => {
    if (!rejectTargetId) return;
    rejectMutation.mutate({ id: rejectTargetId, reason: rejectReason.trim() });
    setRejectModalVisible(false);
    setRejectTargetId(null);
    setRejectReason("");
  };

  const handleCancelReject = () => {
    setRejectModalVisible(false);
    setRejectTargetId(null);
    setRejectReason("");
  };

  const tabs = [
    { key: "pending" as const, label: "Ventende" },
    { key: "approved" as const, label: "Godkjent" },
    { key: "rejected" as const, label: "Avvist" },
  ];

  const renderItem = ({ item, index }: { item: Inspiration; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <View style={[styles.card, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        {item.coverImageUrl ? (
          <Image source={{ uri: item.coverImageUrl }} style={styles.coverImage} />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: theme.backgroundSecondary }]}>
            <EvendiIcon name="image" size={32} color={theme.textMuted} />
          </View>
        )}
        
        <View style={styles.cardContent}>
          <ThemedText style={styles.cardTitle} numberOfLines={1}>{item.title}</ThemedText>
          {item.vendor ? (
            <ThemedText style={[styles.vendorName, { color: theme.textSecondary }]}>
              {item.vendor.businessName}
            </ThemedText>
          ) : null}
          {item.description ? (
            <ThemedText style={[styles.description, { color: theme.textSecondary }]} numberOfLines={2}>
              {item.description}
            </ThemedText>
          ) : null}
          
          {selectedTab === "pending" ? (
            <View style={styles.actionRow}>
              <Pressable
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => approveMutation.mutate(item.id)}
                disabled={approveMutation.isPending}
              >
                <EvendiIcon name="check" size={16} color="#000" />
                <ThemedText style={styles.actionButtonText}>Godkjenn</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.actionButton, styles.rejectButton, { borderColor: "#FF6B6B" }]}
                onPress={() => handleReject(item.id)}
                disabled={rejectMutation.isPending}
              >
                <EvendiIcon name="x" size={16} color="#FF6B6B" />
                <ThemedText style={[styles.actionButtonTextOutline, { color: "#FF6B6B" }]}>Avvis</ThemedText>
              </Pressable>
            </View>
          ) : null}
        </View>
      </View>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingTop: headerHeight }]}>
      <AdminHeader 
        title="Showcases" 
        subtitle={`${inspirations.length} ${selectedTab === "pending" ? "venter" : selectedTab === "approved" ? "godkjent" : "avvist"}`}
      />
      <View style={[styles.tabRow, { paddingTop: Spacing.sm }]}>
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
          data={inspirations}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{
            padding: Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <EvendiIcon name="inbox" size={48} color={theme.textMuted} />
              <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
                Ingen {selectedTab === "pending" ? "ventende" : selectedTab === "approved" ? "godkjente" : "avviste"} showcases
              </ThemedText>
            </View>
          }
        />
      )}

      <Modal
        visible={rejectModalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleCancelReject}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={[styles.modalCard, { backgroundColor: theme.backgroundDefault }]}
          >
            <ThemedText style={styles.modalTitle}>Avvis showcase</ThemedText>
            <ThemedText style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              Oppgi en begrunnelse (valgfritt):
            </ThemedText>
            <TextInput
              value={rejectReason}
              onChangeText={setRejectReason}
              placeholder="F.eks. lav bildekvalitet"
              placeholderTextColor={theme.textMuted}
              style={[styles.modalInput, { borderColor: theme.border, color: theme.text }]}
              multiline
            />
            <View style={styles.modalActions}>
              <Pressable style={[styles.modalButton, { borderColor: theme.border }]} onPress={handleCancelReject}>
                <ThemedText style={styles.modalButtonText}>Avbryt</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonDanger]}
                onPress={handleConfirmReject}
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.modalButtonTextDanger}>Avvis</ThemedText>
                )}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
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
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  coverImage: {
    width: "100%",
    height: 150,
  },
  placeholderImage: {
    width: "100%",
    height: 100,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: {
    padding: Spacing.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  vendorName: {
    fontSize: 13,
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  actionRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  approveButton: {
    backgroundColor: Colors.dark.accent,
  },
  rejectButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
  },
  actionButtonText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtonTextOutline: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: Spacing.xl * 2,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 15,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
  },
  modalCard: {
    width: "100%",
    backgroundColor: Colors.dark.backgroundDefault,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalSubtitle: {
    fontSize: 13,
  },
  modalInput: {
    minHeight: 80,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    textAlignVertical: "top",
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    justifyContent: "flex-end",
  },
  modalButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  modalButtonDanger: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  modalButtonTextDanger: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
