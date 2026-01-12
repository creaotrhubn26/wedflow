import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl, apiRequest } from "@/lib/query-client";

interface PendingVendor {
  id: string;
  email: string;
  businessName: string;
  categoryId: string | null;
  description: string | null;
  location: string | null;
  phone: string | null;
  status: string;
  createdAt: string;
}

export default function AdminVendorsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [adminKey, setAdminKey] = useState("");
  const [storedKey, setStoredKey] = useState("");
  const [loginError, setLoginError] = useState("");
  const [selectedTab, setSelectedTab] = useState<"pending" | "approved" | "rejected">("pending");

  const { data: vendors = [], isLoading, refetch } = useQuery<PendingVendor[]>({
    queryKey: ["/api/admin/vendors", selectedTab, storedKey],
    queryFn: async () => {
      const url = new URL(`/api/admin/vendors?status=${selectedTab}`, getApiUrl());
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${storedKey}`,
        },
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Ugyldig admin-nøkkel");
        }
        throw new Error("Kunne ikke hente leverandører");
      }
      return response.json();
    },
    enabled: storedKey.length > 0,
  });

  const isAuthenticated = storedKey.length > 0;

  const approveMutation = useMutation({
    mutationFn: async (vendorId: string) => {
      const url = new URL(`/api/admin/vendors/${vendorId}/approve`, getApiUrl());
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${storedKey}`,
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) throw new Error("Kunne ikke godkjenne");
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ vendorId, reason }: { vendorId: string; reason: string }) => {
      const url = new URL(`/api/admin/vendors/${vendorId}/reject`, getApiUrl());
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${storedKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });
      if (!response.ok) throw new Error("Kunne ikke avvise");
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/vendors"] });
    },
  });

  const handleLogin = async () => {
    if (adminKey.length < 5) {
      setLoginError("Skriv inn en gyldig admin-nøkkel");
      return;
    }
    setLoginError("");
    
    try {
      const url = new URL("/api/admin/vendors?status=pending", getApiUrl());
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${adminKey}`,
        },
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          setLoginError("Ugyldig admin-nøkkel");
          return;
        }
        if (response.status === 503) {
          setLoginError("Admin-funksjonalitet er ikke konfigurert");
          return;
        }
        setLoginError("Kunne ikke koble til serveren");
        return;
      }
      
      setStoredKey(adminKey);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      setLoginError("Nettverksfeil. Prøv igjen.");
    }
  };

  const handleApprove = (vendor: PendingVendor) => {
    Alert.alert(
      "Godkjenn leverandør",
      `Er du sikker på at du vil godkjenne "${vendor.businessName}"?`,
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Godkjenn",
          onPress: () => approveMutation.mutate(vendor.id),
        },
      ]
    );
  };

  const handleReject = (vendor: PendingVendor) => {
    Alert.prompt(
      "Avvis leverandør",
      `Oppgi årsak for avvisning av "${vendor.businessName}":`,
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Avvis",
          style: "destructive",
          onPress: (reason: string | undefined) => rejectMutation.mutate({ vendorId: vendor.id, reason: reason || "" }),
        },
      ],
      "plain-text"
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderVendorItem = ({ item, index }: { item: PendingVendor; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <View style={[styles.vendorCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.vendorHeader}>
          <ThemedText style={styles.vendorName}>{item.businessName}</ThemedText>
          <View style={[
            styles.statusBadge,
            {
              backgroundColor:
                item.status === "pending" ? "#FFA726" + "30" :
                item.status === "approved" ? "#66BB6A" + "30" : "#EF5350" + "30",
            }
          ]}>
            <ThemedText style={[
              styles.statusText,
              {
                color:
                  item.status === "pending" ? "#FFA726" :
                  item.status === "approved" ? "#66BB6A" : "#EF5350",
              }
            ]}>
              {item.status === "pending" ? "Venter" : item.status === "approved" ? "Godkjent" : "Avvist"}
            </ThemedText>
          </View>
        </View>

        <View style={styles.vendorDetails}>
          <View style={styles.detailRow}>
            <Feather name="mail" size={14} color={theme.textSecondary} />
            <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}>{item.email}</ThemedText>
          </View>
          {item.location ? (
            <View style={styles.detailRow}>
              <Feather name="map-pin" size={14} color={theme.textSecondary} />
              <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}>{item.location}</ThemedText>
            </View>
          ) : null}
          {item.phone ? (
            <View style={styles.detailRow}>
              <Feather name="phone" size={14} color={theme.textSecondary} />
              <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}>{item.phone}</ThemedText>
            </View>
          ) : null}
          <View style={styles.detailRow}>
            <Feather name="calendar" size={14} color={theme.textSecondary} />
            <ThemedText style={[styles.detailText, { color: theme.textSecondary }]}>
              Registrert {formatDate(item.createdAt)}
            </ThemedText>
          </View>
        </View>

        {item.description ? (
          <ThemedText style={[styles.description, { color: theme.textMuted }]} numberOfLines={2}>
            {item.description}
          </ThemedText>
        ) : null}

        {item.status === "pending" ? (
          <View style={styles.actionButtons}>
            <Pressable
              onPress={() => handleApprove(item)}
              disabled={approveMutation.isPending}
              style={[styles.actionBtn, styles.approveBtn]}
            >
              <Feather name="check" size={18} color="#fff" />
              <ThemedText style={styles.actionBtnText}>Godkjenn</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => handleReject(item)}
              disabled={rejectMutation.isPending}
              style={[styles.actionBtn, styles.rejectBtn]}
            >
              <Feather name="x" size={18} color="#fff" />
              <ThemedText style={styles.actionBtnText}>Avvis</ThemedText>
            </Pressable>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.loginContainer, { paddingTop: headerHeight + Spacing.xl }]}>
          <View style={[styles.lockIcon, { backgroundColor: Colors.dark.accent + "20" }]}>
            <Feather name="lock" size={32} color={Colors.dark.accent} />
          </View>
          <ThemedText style={styles.loginTitle}>Admin-tilgang</ThemedText>
          <ThemedText style={[styles.loginSubtitle, { color: theme.textSecondary }]}>
            Skriv inn admin-nøkkelen for å administrere leverandører
          </ThemedText>

          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <Feather name="key" size={18} color={theme.textMuted} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Admin-nøkkel"
              placeholderTextColor={theme.textMuted}
              value={adminKey}
              onChangeText={setAdminKey}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          {loginError ? (
            <ThemedText style={styles.errorText}>{loginError}</ThemedText>
          ) : null}

          <Pressable
            onPress={handleLogin}
            style={[styles.loginBtn, { backgroundColor: Colors.dark.accent }]}
          >
            <ThemedText style={styles.loginBtnText}>Logg inn</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.tabsContainer, { paddingTop: headerHeight + Spacing.lg }]}>
        {(["pending", "approved", "rejected"] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => {
              setSelectedTab(tab);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[
              styles.tab,
              {
                backgroundColor: selectedTab === tab ? Colors.dark.accent : theme.backgroundDefault,
                borderColor: theme.border,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.tabText,
                { color: selectedTab === tab ? "#1A1A1A" : theme.text },
              ]}
            >
              {tab === "pending" ? "Venter" : tab === "approved" ? "Godkjent" : "Avvist"}
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
          data={vendors}
          renderItem={renderVendorItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Feather name="inbox" size={48} color={theme.textMuted} />
              <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
                Ingen {selectedTab === "pending" ? "ventende" : selectedTab === "approved" ? "godkjente" : "avviste"} leverandører
              </ThemedText>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loginContainer: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
  },
  lockIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  loginSubtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 50,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    width: "100%",
    marginBottom: Spacing.lg,
  },
  input: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
  loginBtn: {
    width: "100%",
    height: 50,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  loginBtnText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: "center",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: Spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    marginTop: Spacing.md,
  },
  vendorCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  vendorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  vendorName: {
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  vendorDetails: {
    gap: 4,
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  detailText: {
    fontSize: 13,
  },
  description: {
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  approveBtn: {
    backgroundColor: "#66BB6A",
  },
  rejectBtn: {
    backgroundColor: "#EF5350",
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  errorText: {
    color: "#EF5350",
    fontSize: 14,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
});
