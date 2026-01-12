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
  ScrollView,
  Switch,
  Image,
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
import { getApiUrl } from "@/lib/query-client";

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

interface InspirationCategory {
  id: string;
  name: string;
  icon: string;
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
  const [editingVendor, setEditingVendor] = useState<PendingVendor | null>(null);
  const [vendorFeatures, setVendorFeatures] = useState<Record<string, boolean>>({
    deliveries: true,
    inspirations: true,
  });
  const [vendorCategories, setVendorCategories] = useState<string[]>([]);

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

  const { data: inspirationCats = [] } = useQuery<InspirationCategory[]>({
    queryKey: ["/api/inspiration-categories"],
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

  const updateFeaturesMutation = useMutation({
    mutationFn: async ({ vendorId, features }: { vendorId: string; features: { featureKey: string; isEnabled: boolean }[] }) => {
      const url = new URL(`/api/admin/vendors/${vendorId}/features`, getApiUrl());
      const response = await fetch(url.toString(), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${storedKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ features }),
      });
      if (!response.ok) throw new Error("Kunne ikke oppdatere");
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const updateCategoriesMutation = useMutation({
    mutationFn: async ({ vendorId, categoryIds }: { vendorId: string; categoryIds: string[] }) => {
      const url = new URL(`/api/admin/vendors/${vendorId}/inspiration-categories`, getApiUrl());
      const response = await fetch(url.toString(), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${storedKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ categoryIds }),
      });
      if (!response.ok) throw new Error("Kunne ikke oppdatere");
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  const openEditModal = async (vendor: PendingVendor) => {
    setEditingVendor(vendor);
    
    try {
      const featuresUrl = new URL(`/api/admin/vendors/${vendor.id}/features`, getApiUrl());
      const featuresRes = await fetch(featuresUrl.toString(), {
        headers: { Authorization: `Bearer ${storedKey}` },
      });
      if (featuresRes.ok) {
        const features = await featuresRes.json();
        const featureMap: Record<string, boolean> = { deliveries: true, inspirations: true };
        for (const f of features) {
          featureMap[f.featureKey] = f.isEnabled;
        }
        setVendorFeatures(featureMap);
      }

      const catsUrl = new URL(`/api/admin/vendors/${vendor.id}/inspiration-categories`, getApiUrl());
      const catsRes = await fetch(catsUrl.toString(), {
        headers: { Authorization: `Bearer ${storedKey}` },
      });
      if (catsRes.ok) {
        const cats = await catsRes.json();
        setVendorCategories(cats);
      }
    } catch (error) {
      console.error("Error loading vendor settings:", error);
    }
  };

  const handleSaveSettings = async () => {
    if (!editingVendor) return;

    const features = Object.entries(vendorFeatures).map(([featureKey, isEnabled]) => ({
      featureKey,
      isEnabled,
    }));

    await updateFeaturesMutation.mutateAsync({ vendorId: editingVendor.id, features });
    await updateCategoriesMutation.mutateAsync({ vendorId: editingVendor.id, categoryIds: vendorCategories });

    setEditingVendor(null);
    Alert.alert("Suksess", "Innstillinger lagret!");
  };

  const toggleCategory = (categoryId: string) => {
    setVendorCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

        {item.status === "approved" ? (
          <Pressable
            onPress={() => openEditModal(item)}
            style={[styles.settingsBtn, { borderColor: Colors.dark.accent }]}
          >
            <Feather name="settings" size={16} color={Colors.dark.accent} />
            <ThemedText style={[styles.settingsBtnText, { color: Colors.dark.accent }]}>
              Administrer tilganger
            </ThemedText>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.loginContainer, { paddingTop: headerHeight + Spacing.xl }]}>
          <Image
            source={require("../../assets/images/wedflow-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
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

      <Modal
        visible={editingVendor !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setEditingVendor(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundRoot }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {editingVendor?.businessName}
              </ThemedText>
              <Pressable onPress={() => setEditingVendor(null)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll}>
              <ThemedText style={styles.sectionTitle}>Funksjoner</ThemedText>
              <View style={[styles.featureRow, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                <View style={styles.featureInfo}>
                  <Feather name="package" size={18} color={Colors.dark.accent} />
                  <ThemedText style={styles.featureLabel}>Leveranser</ThemedText>
                </View>
                <Switch
                  value={vendorFeatures.deliveries}
                  onValueChange={(val) => setVendorFeatures(prev => ({ ...prev, deliveries: val }))}
                  trackColor={{ false: theme.border, true: Colors.dark.accent }}
                  thumbColor="#fff"
                />
              </View>
              <View style={[styles.featureRow, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                <View style={styles.featureInfo}>
                  <Feather name="image" size={18} color={Colors.dark.accent} />
                  <ThemedText style={styles.featureLabel}>Inspirasjoner</ThemedText>
                </View>
                <Switch
                  value={vendorFeatures.inspirations}
                  onValueChange={(val) => setVendorFeatures(prev => ({ ...prev, inspirations: val }))}
                  trackColor={{ false: theme.border, true: Colors.dark.accent }}
                  thumbColor="#fff"
                />
              </View>

              <ThemedText style={[styles.sectionTitle, { marginTop: Spacing.xl }]}>
                Tillatte inspirasjonskategorier
              </ThemedText>
              <ThemedText style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
                Velg hvilke kategorier denne leverandøren kan legge inn inspirasjoner i. Hvis ingen er valgt, har de tilgang til alle.
              </ThemedText>

              <View style={styles.categoriesGrid}>
                {inspirationCats.map((cat) => (
                  <Pressable
                    key={cat.id}
                    onPress={() => toggleCategory(cat.id)}
                    style={[
                      styles.categoryChip,
                      {
                        backgroundColor: vendorCategories.includes(cat.id)
                          ? Colors.dark.accent
                          : theme.backgroundDefault,
                        borderColor: vendorCategories.includes(cat.id)
                          ? Colors.dark.accent
                          : theme.border,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.categoryChipText,
                        {
                          color: vendorCategories.includes(cat.id) ? "#1A1A1A" : theme.text,
                        },
                      ]}
                    >
                      {cat.name}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                onPress={() => setEditingVendor(null)}
                style={[styles.modalBtn, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, borderWidth: 1 }]}
              >
                <ThemedText style={{ color: theme.text }}>Avbryt</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveSettings}
                style={[styles.modalBtn, { backgroundColor: Colors.dark.accent }]}
              >
                <ThemedText style={{ color: "#1A1A1A", fontWeight: "600" }}>Lagre</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
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
  logo: {
    width: 300,
    height: 80,
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
  settingsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  settingsBtnText: {
    fontSize: 14,
    fontWeight: "500",
  },
  errorText: {
    color: "#EF5350",
    fontSize: 14,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalScroll: {
    padding: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  featureInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  featureLabel: {
    fontSize: 15,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalFooter: {
    flexDirection: "row",
    padding: Spacing.lg,
    gap: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
});
