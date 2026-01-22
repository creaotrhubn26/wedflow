import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { SubscriptionTier } from "@shared/schema";

type Props = NativeStackScreenProps<any, "AdminSubscriptions">;

interface TierForm {
  name: string;
  displayName: string;
  description: string;
  priceNok: string;
  sortOrder: string;
  maxInspirationPhotos: string;
  maxProducts: string;
  maxMonthlyOffers: string;
  maxMonthlyDeliveries: string;
  maxStorageGb: string;
  commissionPercentage: string;
  // Core feature flags
  canSendMessages: boolean;
  canReceiveInquiries: boolean;
  canCreateOffers: boolean;
  canCreateDeliveries: boolean;
  canShowcaseWork: boolean;
  // Premium feature flags
  hasAdvancedAnalytics: boolean;
  hasPrioritizedSearch: boolean;
  canHighlightProfile: boolean;
  canUseVideoGallery: boolean;
  hasReviewBadge: boolean;
  hasMultipleCategories: boolean;
}

export default function AdminSubscriptionsScreen({ route }: Props) {
  const { adminKey } = route.params as any;
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"tiers" | "vendors">("tiers");
  const [searchVendor, setSearchVendor] = useState("");

  const [form, setForm] = useState<TierForm>({
    name: "",
    displayName: "",
    description: "",
    priceNok: "0",
    sortOrder: "0",
    maxInspirationPhotos: "10",
    maxProducts: "5",
    maxMonthlyOffers: "10",
    maxMonthlyDeliveries: "5",
    maxStorageGb: "5",
    commissionPercentage: "3",
    canSendMessages: true,
    canReceiveInquiries: true,
    canCreateOffers: true,
    canCreateDeliveries: true,
    canShowcaseWork: true,
    hasAdvancedAnalytics: false,
    hasPrioritizedSearch: false,
    canHighlightProfile: false,
    canUseVideoGallery: false,
    hasReviewBadge: false,
    hasMultipleCategories: false,
  });

  const { data: tiers = [], isLoading: tiersLoading } = useQuery<SubscriptionTier[]>({
    queryKey: ["admin-subscription-tiers", adminKey],
    queryFn: async () => {
      const url = new URL("/api/admin/subscription/tiers", getApiUrl());
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) throw new Error("Kunne ikke hente abonnementstier");
      return res.json();
    },
  });

  const { data: vendorSubs = [], isLoading: vendorLoading } = useQuery<any[]>({
    queryKey: ["admin-vendor-subscriptions", adminKey],
    queryFn: async () => {
      const url = new URL("/api/admin/subscription/vendors", getApiUrl());
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) throw new Error("Kunne ikke hente leverandørabonnement");
      return res.json();
    },
  });

  const filteredVendors = useMemo(() => {
    const q = searchVendor.toLowerCase();
    return vendorSubs.filter((v) => 
      v.vendor?.businessName?.toLowerCase().includes(q) ||
      v.vendor?.email?.toLowerCase().includes(q)
    );
  }, [vendorSubs, searchVendor]);

  const openNewTierModal = () => {
    setEditingId(null);
    setForm({
      name: "",
      displayName: "",
      description: "",
      priceNok: "0",
      sortOrder: "0",
      maxInspirationPhotos: "10",
      maxProducts: "5",
      maxMonthlyOffers: "10",
      maxMonthlyDeliveries: "5",
      maxStorageGb: "5",
      commissionPercentage: "3",
      canSendMessages: true,
      canReceiveInquiries: true,
      canCreateOffers: true,
      canCreateDeliveries: true,
      canShowcaseWork: true,
      hasAdvancedAnalytics: false,
      hasPrioritizedSearch: false,
      canHighlightProfile: false,
      canUseVideoGallery: false,
      hasReviewBadge: false,
      hasMultipleCategories: false,
    });
    setShowModal(true);
  };

  const openEditTierModal = (tier: SubscriptionTier) => {
    setEditingId(tier.id);
    setForm({
      name: tier.name,
      displayName: tier.displayName,
      description: tier.description || "",
      priceNok: tier.priceNok.toString(),
      sortOrder: tier.sortOrder.toString(),
      maxInspirationPhotos: tier.maxInspirationPhotos.toString(),
      maxProducts: tier.maxProducts?.toString() ?? "0",
      maxMonthlyOffers: tier.maxMonthlyOffers?.toString() ?? "0",
      maxMonthlyDeliveries: tier.maxMonthlyDeliveries?.toString() ?? "0",
      maxStorageGb: tier.maxStorageGb.toString(),
      commissionPercentage: tier.commissionPercentage.toString(),
      canSendMessages: tier.canSendMessages,
      canReceiveInquiries: tier.canReceiveInquiries,
      canCreateOffers: tier.canCreateOffers,
      canCreateDeliveries: tier.canCreateDeliveries,
      canShowcaseWork: tier.canShowcaseWork,
      hasAdvancedAnalytics: tier.hasAdvancedAnalytics,
      hasPrioritizedSearch: tier.hasPrioritizedSearch,
      canHighlightProfile: tier.canHighlightProfile,
      canUseVideoGallery: tier.canUseVideoGallery,
      hasReviewBadge: tier.hasReviewBadge,
      hasMultipleCategories: tier.hasMultipleCategories,
    });
    setShowModal(true);
  };

  const saveTier = async () => {
    if (!form.name.trim() || !form.displayName.trim()) {
      Alert.alert("Feil", "Navn og visningsnavn er påkrevd");
      return;
    }

    try {
      setSaving(true);
      const method = editingId ? "PATCH" : "POST";
      const endpoint = editingId
        ? `/api/admin/subscription/tiers/${editingId}`
        : "/api/admin/subscription/tiers";

      const url = new URL(endpoint, getApiUrl());
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify({
          name: form.name,
          displayName: form.displayName,
          description: form.description,
          priceNok: parseInt(form.priceNok),
          sortOrder: parseInt(form.sortOrder),
          maxInspirationPhotos: parseInt(form.maxInspirationPhotos),
          maxProducts: parseInt(form.maxProducts),
          maxMonthlyOffers: parseInt(form.maxMonthlyOffers),
          maxMonthlyDeliveries: parseInt(form.maxMonthlyDeliveries),
          maxStorageGb: parseInt(form.maxStorageGb),
          commissionPercentage: parseInt(form.commissionPercentage),
          canSendMessages: form.canSendMessages,
          canReceiveInquiries: form.canReceiveInquiries,
          canCreateOffers: form.canCreateOffers,
          canCreateDeliveries: form.canCreateDeliveries,
          canShowcaseWork: form.canShowcaseWork,
          hasAdvancedAnalytics: form.hasAdvancedAnalytics,
          hasPrioritizedSearch: form.hasPrioritizedSearch,
          canHighlightProfile: form.canHighlightProfile,
          canUseVideoGallery: form.canUseVideoGallery,
          hasReviewBadge: form.hasReviewBadge,
          hasMultipleCategories: form.hasMultipleCategories,
        }),
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-tiers"] });
      setShowModal(false);
    } catch (e) {
      Alert.alert("Feil", (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const deleteTier = (tierId: string) => {
    Alert.alert("Slett abonnementstier", "Er du sikker? Dette kan ikke angres.", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Slett",
        style: "destructive",
        onPress: async () => {
          try {
            const url = new URL(`/api/admin/subscription/tiers/${tierId}`, getApiUrl());
            const res = await fetch(url, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${adminKey}` },
            });
            if (!res.ok) throw new Error("Kunne ikke slette tier");
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            queryClient.invalidateQueries({ queryKey: ["admin-subscription-tiers"] });
          } catch (e) {
            Alert.alert("Feil", (e as Error).message);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundRoot }]} edges={["top"]}>
      <View style={[styles.header, { backgroundColor: theme.backgroundSecondary }]}>
        <ThemedText style={styles.title}>Abonnement & Pakker</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Administrer abonnementstier og priser
        </ThemedText>
      </View>

      <View style={[styles.tabBar, { borderColor: theme.border }]}>
        <Pressable
          style={[styles.tab, tab === "tiers" && { borderBottomColor: theme.accent, borderBottomWidth: 2 }]}
          onPress={() => setTab("tiers")}
        >
          <Feather name="package" size={16} color={tab === "tiers" ? theme.accent : theme.textSecondary} />
          <ThemedText style={[styles.tabText, { color: tab === "tiers" ? theme.accent : theme.textSecondary }]}>
            Tiers
          </ThemedText>
        </Pressable>
        <Pressable
          style={[styles.tab, tab === "vendors" && { borderBottomColor: theme.accent, borderBottomWidth: 2 }]}
          onPress={() => setTab("vendors")}
        >
          <Feather name="users" size={16} color={tab === "vendors" ? theme.accent : theme.textSecondary} />
          <ThemedText style={[styles.tabText, { color: tab === "vendors" ? theme.accent : theme.textSecondary }]}>
            Leverandører
          </ThemedText>
        </Pressable>
      </View>

      {tab === "tiers" && (
        <ScrollView style={styles.content} contentContainerStyle={{ padding: Spacing.md, gap: Spacing.md }}>
          {tiersLoading ? (
            <ActivityIndicator color={theme.accent} size="large" style={{ marginTop: Spacing.lg }} />
          ) : (
            <>
              {tiers.map((tier) => (
                <Pressable
                  key={tier.id}
                  style={[styles.tierCard, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
                  onPress={() => openEditTierModal(tier)}
                >
                  <View style={styles.tierCardContent}>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={styles.tierName}>{tier.displayName}</ThemedText>
                      <ThemedText style={[styles.tierDesc, { color: theme.textSecondary }]}>{tier.description}</ThemedText>
                      <View style={{ flexDirection: "row", gap: Spacing.md, marginTop: Spacing.sm }}>
                        <ThemedText style={[styles.tierPrice, { color: theme.accent }]}>{tier.priceNok} kr/mnd</ThemedText>
                        <View style={[styles.featureBadge, { backgroundColor: theme.accent + "20" }]}>
                          <ThemedText style={[styles.featureBadgeText, { color: theme.accent }]}>
                            {[
                              tier.hasAdvancedAnalytics && "Analytics",
                              tier.hasPrioritizedSearch && "Søk",
                              tier.canHighlightProfile && "Highlight",
                              tier.canUseVideoGallery && "Video",
                              tier.hasMultipleCategories && "Flere kategorier",
                              tier.hasReviewBadge && "Badge",
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        deleteTier(tier.id);
                      }}
                      hitSlop={10}
                    >
                      <Feather name="trash-2" size={18} color="#FF6B6B" />
                    </Pressable>
                  </View>
                </Pressable>
              ))}

              <Pressable
                style={[styles.addButton, { backgroundColor: theme.accent }]}
                onPress={openNewTierModal}
              >
                <Feather name="plus" size={20} color="#FFFFFF" />
                <ThemedText style={styles.addButtonText}>Ny abonnementstier</ThemedText>
              </Pressable>
            </>
          )}
        </ScrollView>
      )}

      {tab === "vendors" && (
        <ScrollView style={styles.content} contentContainerStyle={{ padding: Spacing.md }}>
          {vendorLoading ? (
            <ActivityIndicator color={theme.accent} size="large" style={{ marginTop: Spacing.lg }} />
          ) : (
            <>
              <View style={[styles.searchBox, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <Feather name="search" size={16} color={theme.textMuted} />
                <TextInput
                  style={[styles.searchInput, { color: theme.text, flex: 1 }]}
                  placeholder="Søk leverandør..."
                  placeholderTextColor={theme.textMuted}
                  value={searchVendor}
                  onChangeText={setSearchVendor}
                />
              </View>

              {filteredVendors.map((sub) => (
                <ThemedView
                  key={sub.id}
                  style={[styles.vendorCard, { borderColor: theme.border, backgroundColor: theme.backgroundSecondary }]}
                >
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.vendorName}>{sub.vendor?.businessName}</ThemedText>
                    <ThemedText style={[styles.vendorEmail, { color: theme.textSecondary }]}>{sub.vendor?.email}</ThemedText>
                    <View style={{ flexDirection: "row", gap: Spacing.md, marginTop: Spacing.sm }}>
                      <ThemedText style={[styles.tierBadge, { color: theme.accent }]}>
                        {sub.tier?.displayName}
                      </ThemedText>
                      <ThemedText style={[styles.statusBadge, { color: theme.textSecondary }]}>
                        {sub.status === "active" ? "✓ Aktiv" : "Inaktiv"}
                      </ThemedText>
                    </View>
                  </View>
                </ThemedView>
              ))}

              {filteredVendors.length === 0 && (
                <ThemedText style={[styles.emptyText, { color: theme.textMuted, textAlign: "center", marginTop: Spacing.lg }]}>
                  Ingen leverandører funnet
                </ThemedText>
              )}
            </>
          )}
        </ScrollView>
      )}

      <Modal visible={showModal} transparent animationType="slide">
        <SafeAreaView style={[styles.modal, { backgroundColor: theme.backgroundRoot }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText style={styles.modalTitle}>
              {editingId ? "Rediger abonnementstier" : "Ny abonnementstier"}
            </ThemedText>
            <Pressable onPress={() => setShowModal(false)}>
              <Feather name="x" size={20} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent} contentContainerStyle={{ padding: Spacing.md, gap: Spacing.md }}>
            <View>
              <ThemedText style={styles.label}>System-navn *</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                placeholder="starter, professional, enterprise"
                placeholderTextColor={theme.textMuted}
                value={form.name}
                onChangeText={(text) => setForm({ ...form, name: text })}
                editable={!saving}
              />
            </View>

            <View>
              <ThemedText style={styles.label}>Visningsnavn *</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                placeholder="Starter Plan"
                placeholderTextColor={theme.textMuted}
                value={form.displayName}
                onChangeText={(text) => setForm({ ...form, displayName: text })}
                editable={!saving}
              />
            </View>

            <View>
              <ThemedText style={styles.label}>Beskrivelse</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                placeholder="For små leverandører..."
                placeholderTextColor={theme.textMuted}
                value={form.description}
                onChangeText={(text) => setForm({ ...form, description: text })}
                editable={!saving}
                multiline
              />
            </View>

            <View style={{ flexDirection: "row", gap: Spacing.md }}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.label}>Pris (NOK/mnd)</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                  placeholder="0"
                  placeholderTextColor={theme.textMuted}
                  value={form.priceNok}
                  onChangeText={(text) => setForm({ ...form, priceNok: text })}
                  keyboardType="number-pad"
                  editable={!saving}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.label}>Sortering</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                  placeholder="0"
                  placeholderTextColor={theme.textMuted}
                  value={form.sortOrder}
                  onChangeText={(text) => setForm({ ...form, sortOrder: text })}
                  keyboardType="number-pad"
                  editable={!saving}
                />
              </View>
            </View>

            <ThemedText style={[styles.sectionTitle, { marginTop: Spacing.md }]}>Grenser</ThemedText>

            <View style={{ flexDirection: "row", gap: Spacing.md }}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.label}>Maks inspirasjonsfoto</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                  placeholder="10"
                  placeholderTextColor={theme.textMuted}
                  value={form.maxInspirationPhotos}
                  onChangeText={(text) => setForm({ ...form, maxInspirationPhotos: text })}
                  keyboardType="number-pad"
                  editable={!saving}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.label}>Maks produkter</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                  placeholder="5"
                  placeholderTextColor={theme.textMuted}
                  value={form.maxProducts}
                  onChangeText={(text) => setForm({ ...form, maxProducts: text })}
                  keyboardType="number-pad"
                  editable={!saving}
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: Spacing.md }}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.label}>Maks tilbud per mnd</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                  placeholder="10"
                  placeholderTextColor={theme.textMuted}
                  value={form.maxMonthlyOffers}
                  onChangeText={(text) => setForm({ ...form, maxMonthlyOffers: text })}
                  keyboardType="number-pad"
                  editable={!saving}
                />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.label}>Maks leveringer per mnd</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                  placeholder="5"
                  placeholderTextColor={theme.textMuted}
                  value={form.maxMonthlyDeliveries}
                  onChangeText={(text) => setForm({ ...form, maxMonthlyDeliveries: text })}
                  keyboardType="number-pad"
                  editable={!saving}
                />
              </View>
            </View>

            <View style={{ flexDirection: "row", gap: Spacing.md }}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.label}>Maks lagring (GB)</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                  placeholder="5"
                  placeholderTextColor={theme.textMuted}
                  value={form.maxStorageGb}
                  onChangeText={(text) => setForm({ ...form, maxStorageGb: text })}
                  keyboardType="number-pad"
                  editable={!saving}
                />
              </View>
              <View style={{ flex: 1 }} />
            </View>

            <ThemedText style={[styles.sectionTitle, { marginTop: Spacing.md }]}>Kjernefunksjoner</ThemedText>

            {[
              { key: "canSendMessages", label: "Send meldinger til par" },
              { key: "canReceiveInquiries", label: "Motta henvendelser fra par" },
              { key: "canCreateOffers", label: "Opprett tilbud" },
              { key: "canCreateDeliveries", label: "Opprett deliveries" },
              { key: "canShowcaseWork", label: "Vis inspirasjon/gallerier" },
            ].map((feature) => (
              <View
                key={feature.key}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: Spacing.sm,
                  borderBottomWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <ThemedText>{feature.label}</ThemedText>
                <Switch
                  value={form[feature.key as keyof typeof form] as boolean}
                  onValueChange={(val) => setForm({ ...form, [feature.key]: val })}
                  disabled={saving}
                />
              </View>
            ))}

            <ThemedText style={[styles.sectionTitle, { marginTop: Spacing.md }]}>Premiumfunksjoner</ThemedText>

            {[
              { key: "hasAdvancedAnalytics", label: "Avansert analyse" },
              { key: "hasPrioritizedSearch", label: "Prioritert søk i katalog" },
              { key: "canHighlightProfile", label: "Fremhevet profil" },
              { key: "canUseVideoGallery", label: "Videogalleri" },
              { key: "hasReviewBadge", label: "Anmeldelsesmerke" },
              { key: "hasMultipleCategories", label: "Flere kategorier" },
            ].map((feature) => (
              <View
                key={feature.key}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingVertical: Spacing.sm,
                  borderBottomWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <ThemedText>{feature.label}</ThemedText>
                <Switch
                  value={form[feature.key as keyof typeof form] as boolean}
                  onValueChange={(val) => setForm({ ...form, [feature.key]: val })}
                  disabled={saving}
                />
              </View>
            ))}

            <View style={{ flexDirection: "row", gap: Spacing.md }}>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.label}>Provisjon (%)</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
                  placeholder="3"
                  placeholderTextColor={theme.textMuted}
                  value={form.commissionPercentage}
                  onChangeText={(text) => setForm({ ...form, commissionPercentage: text })}
                  keyboardType="number-pad"
                  editable={!saving}
                />
              </View>
            </View>

            <Pressable
              style={[styles.saveButton, { backgroundColor: theme.accent, opacity: saving ? 0.6 : 1 }]}
              onPress={saveTier}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Feather name="save" size={18} color="#FFFFFF" />
                  <ThemedText style={styles.saveButtonText}>Lagre</ThemedText>
                </>
              )}
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.md },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 12, marginTop: 2 },
  tabBar: { flexDirection: "row", borderBottomWidth: 1, paddingHorizontal: Spacing.md },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.xs, paddingVertical: Spacing.md },
  tabText: { fontSize: 12, fontWeight: "600" },
  content: { flex: 1 },
  tierCard: { borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.md },
  tierCardContent: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.md },
  tierName: { fontSize: 16, fontWeight: "700" },
  tierDesc: { fontSize: 12, marginTop: 4 },
  tierPrice: { fontSize: 14, fontWeight: "600" },
  featureBadge: { paddingHorizontal: Spacing.sm, paddingVertical: 4, borderRadius: 8 },
  featureBadgeText: { fontSize: 10, fontWeight: "600" },
  addButton: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm },
  addButtonText: { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
  searchBox: { borderWidth: 1, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.sm, flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginBottom: Spacing.md },
  searchInput: { flex: 1, paddingVertical: Spacing.sm },
  vendorCard: { borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm, flexDirection: "row" },
  vendorName: { fontSize: 14, fontWeight: "600" },
  vendorEmail: { fontSize: 12, marginTop: 2 },
  tierBadge: { fontSize: 12, fontWeight: "600" },
  statusBadge: { fontSize: 12 },
  emptyText: { fontSize: 14 },
  modal: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  modalTitle: { fontSize: 16, fontWeight: "700" },
  modalContent: { flex: 1 },
  label: { fontSize: 12, fontWeight: "600", marginBottom: Spacing.xs },
  input: { borderWidth: 1, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm, fontSize: 14 },
  sectionTitle: { fontSize: 14, fontWeight: "700" },
  saveButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.sm, paddingVertical: Spacing.md, borderRadius: BorderRadius.md, marginTop: Spacing.md },
  saveButtonText: { fontSize: 14, fontWeight: "600", color: "#FFFFFF" },
});
