import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator, RefreshControl } from "react-native";
import { showConfirm } from "@/lib/dialogs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { EvendiIcon } from "@/components/EvendiIcon";
import { useQuery } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SwipeableRow } from "@/components/SwipeableRow";
import VendorCreatorHubBridge from "@/components/VendorCreatorHubBridge";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getVendorConfig } from "@/lib/vendor-adapter";
import { getSpeeches } from "@/lib/storage";
import { Speech } from "@/lib/types";
import { SeatingChart, Table } from "@/components/SeatingChart";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

type Navigation = NativeStackNavigationProp<any>;

type VendorProduct = {
  id: string;
  title: string;
  description: string | null;
  unitPrice: number;
  unitType: string;
  imageUrl: string | null;
};

type VendorOffer = {
  id: string;
  title: string;
  status: string;
  totalAmount: number;
  currency: string | null;
  createdAt: string;
};

export default function VendorFotografScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<Navigation>();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'speeches' | 'seating' | 'prosjekt'>('dashboard');
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [seatingData, setSeatingData] = useState<{ tables: Table[]; guests?: any[] }>({ tables: [], guests: [] });
  const [selectedCoupleId, setSelectedCoupleId] = useState<string | null>(null);

  const vendorConfig = getVendorConfig(null, "Fotograf");

  // Fetch vendor's couples from conversations
  const { data: vendorCouples = [] } = useQuery<{ id: string; coupleId: string; coupleName: string }[]>({
    queryKey: ["/api/vendor/conversations-couples"],
    queryFn: async () => {
      if (!sessionToken) return [];
      const res = await fetch(new URL("/api/vendor/conversations", getApiUrl()).toString(), {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!res.ok) return [];
      const convos = await res.json();
      return convos.map((c: any) => ({
        id: c.id,
        coupleId: c.coupleId,
        coupleName: c.couple?.displayName || c.couple?.email || "Ukjent par",
      }));
    },
    enabled: !!sessionToken,
  });

  // Auto-select first couple
  useEffect(() => {
    if (vendorCouples.length > 0 && !selectedCoupleId) {
      setSelectedCoupleId(vendorCouples[0].coupleId);
    }
  }, [vendorCouples, selectedCoupleId]);

  useEffect(() => {
    const loadSession = async () => {
      const data = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
      if (!data) {
        navigation.replace("VendorLogin");
        return;
      }
      const parsed = JSON.parse(data);
      setSessionToken(parsed?.sessionToken || null);
    };
    loadSession();
  }, [navigation]);

  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useQuery<VendorProduct[]>({
    queryKey: ["/api/vendor/products"],
    queryFn: async () => {
      if (!sessionToken) return [];
      const res = await fetch(new URL("/api/vendor/products", getApiUrl()).toString(), {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!sessionToken,
  });

  const { data: offers = [], isLoading: offersLoading, refetch: refetchOffers } = useQuery<VendorOffer[]>({
    queryKey: ["/api/vendor/offers"],
    queryFn: async () => {
      if (!sessionToken) return [];
      const res = await fetch(new URL("/api/vendor/offers", getApiUrl()).toString(), {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!sessionToken,
  });

  // Speeches query for event coordination
  const speechesQuery = useQuery<Speech[]>({
    queryKey: ['speeches'],
    queryFn: async () => {
      const data = await getSpeeches();
      return Array.isArray(data) ? data : [];
    },
  });

  useEffect(() => {
    if (speechesQuery.data) {
      setSpeeches(speechesQuery.data);
    }
  }, [speechesQuery.data]);

  // Load seating chart from local storage (cached from couple's session if on same device)
  useEffect(() => {
    const loadSeating = async () => {
      try {
        const SEATING_KEY = 'wedflow_seating';
        const stored = await AsyncStorage.getItem(SEATING_KEY);
        if (stored) {
          const data = JSON.parse(stored);
          setSeatingData(data || { tables: [], guests: [] });
        }
      } catch (err) {
        console.error('Error loading seating:', err);
      }
    };
    loadSeating();
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([refetchProducts(), refetchOffers()]);
    setIsRefreshing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const goToProducts = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("ProductCreate");
  };

  const goToOffers = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("OfferCreate");
  };

  const handleDelete = (id: string, type: 'product' | 'offer') => {
    showConfirm({
      title: `Slett ${type === 'product' ? 'produkt' : 'tilbud'}`,
      message: "Er du sikker?",
      confirmLabel: "Slett",
      cancelLabel: "Avbryt",
      destructive: true,
    }).then((confirmed) => {
      if (!confirmed) return;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    });
  };

  if (!sessionToken) return null;

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
      {/* Header */}
      <View style={{ padding: Spacing.lg, paddingTop: insets.top + Spacing.md }}>
        <ThemedText style={[styles.title, { color: theme.text }]}>Fotograf dashboard</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>Event-oversikt og pakkeadministrasjon</ThemedText>
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <Pressable
          style={[styles.tab, activeTab === 'dashboard' && { borderBottomColor: theme.accent, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('dashboard')}
        >
          <EvendiIcon name="package" size={18} color={activeTab === 'dashboard' ? theme.accent : theme.textSecondary} />
          <ThemedText style={[styles.tabText, { color: activeTab === 'dashboard' ? theme.accent : theme.textSecondary }]}>
            Pakker
          </ThemedText>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'speeches' && { borderBottomColor: theme.accent, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('speeches')}
        >
          <EvendiIcon name="mic" size={18} color={activeTab === 'speeches' ? theme.accent : theme.textSecondary} />
          <ThemedText style={[styles.tabText, { color: activeTab === 'speeches' ? theme.accent : theme.textSecondary }]}>
            Taler ({speeches.length})
          </ThemedText>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'seating' && { borderBottomColor: theme.accent, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('seating')}
        >
          <EvendiIcon name="users" size={18} color={activeTab === 'seating' ? theme.accent : theme.textSecondary} />
          <ThemedText style={[styles.tabText, { color: activeTab === 'seating' ? theme.accent : theme.textSecondary }]}>
            Bordplan
          </ThemedText>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'prosjekt' && { borderBottomColor: theme.accent, borderBottomWidth: 2 }]}
          onPress={() => setActiveTab('prosjekt')}
        >
          <EvendiIcon name="link" size={18} color={activeTab === 'prosjekt' ? theme.accent : theme.textSecondary} />
          <ThemedText style={[styles.tabText, { color: activeTab === 'prosjekt' ? theme.accent : theme.textSecondary }]}>
            Prosjekt
          </ThemedText>
        </Pressable>
      </View>

      {/* Tab Content */}
      {activeTab === 'dashboard' ? (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xl + insets.bottom }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={theme.accent}
        />
      }
    >      <View style={styles.cardRow}>
        <Pressable
          onPress={goToProducts}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            pressed && { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <View style={styles.cardHeader}>
            <ThemedText style={[styles.cardTitle, { color: theme.text }]}>Fotopakker</ThemedText>
            <EvendiIcon name="camera" size={18} color={theme.textSecondary} />
          </View>
          <ThemedText style={[styles.cardBody, { color: theme.textSecondary }]}>Legg til fotopakker med timepriser, antall bilder og leveringstid.</ThemedText>
          <Button style={styles.cardButton} onPress={goToProducts}>Opprett pakke</Button>
        </Pressable>

        <Pressable
          onPress={goToOffers}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            pressed && { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <View style={styles.cardHeader}>
            <ThemedText style={[styles.cardTitle, { color: theme.text }]}>Tilbud</ThemedText>
            <EvendiIcon name="file-text" size={18} color={theme.textSecondary} />
          </View>
          <ThemedText style={[styles.cardBody, { color: theme.textSecondary }]}>Send tilbud med timepriser og tilgjengelighet.</ThemedText>
          <Button style={styles.cardButton} onPress={goToOffers}>Send tilbud</Button>
        </Pressable>
      </View>

      <View style={[styles.infoBox, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <EvendiIcon name="info" size={16} color={theme.textSecondary} />
        <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>Legg til portfolio-bilder for å øke konvertering.</ThemedText>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={[styles.cardTitle, { color: theme.text }]}>Produkter</ThemedText>
          {productsLoading ? <ActivityIndicator size="small" color={theme.accent} /> : null}
        </View>
        {products.length === 0 ? (
          <View style={styles.emptyRow}>
            <EvendiIcon name="camera" size={18} color={theme.accent} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>Ingen pakker ennå</ThemedText>
              <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Legg til fotopakker for å komme i gang</ThemedText>
            </View>
            <Button onPress={goToProducts}>Opprett</Button>
          </View>
        ) : (
          products.map((p, idx) => (
            <Animated.View key={p.id} entering={FadeInDown.delay(idx * 30)}>
              <SwipeableRow onDelete={() => handleDelete(p.id, 'product')}>
                <Pressable onPress={goToProducts} style={[styles.listRow, { borderBottomColor: theme.border }]}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ color: theme.text, fontWeight: "600" }}>{p.title}</ThemedText>
                    <ThemedText style={{ color: theme.textSecondary, fontSize: 13 }}>{p.unitPrice} {p.unitType}</ThemedText>
                    {p.description ? <ThemedText numberOfLines={1} style={{ color: theme.textSecondary, fontSize: 12 }}>{p.description}</ThemedText> : null}
                  </View>
                  <EvendiIcon name="chevron-right" size={18} color={theme.textSecondary} />
                </Pressable>
              </SwipeableRow>
            </Animated.View>
          ))
        )}
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={[styles.cardTitle, { color: theme.text }]}>Tilbud</ThemedText>
          {offersLoading ? <ActivityIndicator size="small" color={theme.accent} /> : null}
        </View>
        {offers.length === 0 ? (
          <View style={styles.emptyRow}>
            <EvendiIcon name="file-text" size={18} color={theme.accent} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>Ingen tilbud ennå</ThemedText>
              <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Send tilbud til kunden</ThemedText>
            </View>
            <Button onPress={goToOffers}>Send tilbud</Button>
          </View>
        ) : (
          offers.map((o, idx) => (
            <Animated.View key={o.id} entering={FadeInDown.delay(idx * 30)}>
              <SwipeableRow onDelete={() => handleDelete(o.id, 'offer')}>
                <Pressable onPress={goToOffers} style={[styles.listRow, { borderBottomColor: theme.border }]}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ color: theme.text, fontWeight: "600" }}>{o.title}</ThemedText>
                    <ThemedText style={{ color: theme.textSecondary, fontSize: 13 }}>{o.totalAmount} {o.currency || 'NOK'}</ThemedText>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <ThemedText style={{ fontSize: 12, color: theme.textSecondary }}>{o.status}</ThemedText>
                    <EvendiIcon name="chevron-right" size={18} color={theme.textSecondary} />
                  </View>
                </Pressable>
              </SwipeableRow>
            </Animated.View>
          ))
        )}
      </View>
    </ScrollView>
      ) : activeTab === 'speeches' ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl }}>
          {speeches.length > 0 ? (
            <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
              <View style={styles.speechHeader}>
                <EvendiIcon name="camera" size={18} color={theme.accent} />
                <ThemedText style={styles.cardTitle}>Taler å fotografere ({speeches.length})</ThemedText>
              </View>
              <ThemedText style={[styles.infoText, { color: theme.textSecondary, marginBottom: Spacing.md }]}>
                Posisjonér deg for å fange taleøyeblikk og publikumsreaksjoner
              </ThemedText>
              {speeches.sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59')).map((speech) => {
                const statusColor = speech.status === 'speaking' ? '#f59e0b' : speech.status === 'done' ? '#22c55e' : '#9ca3af';
                const statusText = speech.status === 'speaking' ? '🔴 NÅ' : speech.status === 'done' ? 'Ferdig' : 'Klar';
                const tableName = seatingData.tables.find(t => t.id === speech.tableId)?.name || null;
                return (
                  <View
                    key={speech.id}
                    style={[
                      styles.speechRow,
                      {
                        borderLeftColor: statusColor,
                        backgroundColor: speech.status === 'speaking' ? '#f59e0b10' : 'transparent',
                      },
                    ]}
                  >
                    <View style={styles.speechTimeCol}>
                      <ThemedText style={[styles.speechTime, { color: theme.accent }]}>
                        {speech.time || 'TBA'}
                      </ThemedText>
                    </View>
                    <View style={styles.speechInfoCol}>
                      <ThemedText style={styles.speechName}>{speech.speakerName}</ThemedText>
                      <ThemedText style={[styles.speechRole, { color: theme.textSecondary }]}>
                        {speech.role}
                      </ThemedText>
                      {tableName && (
                        <View style={styles.tableInfo}>
                          <EvendiIcon name="users" size={10} color={theme.textMuted} />
                          <ThemedText style={[styles.tableName, { color: theme.textMuted }]}>
                            {tableName}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                    <View style={[styles.speechBadge, { backgroundColor: statusColor + '20' }]}>
                      <ThemedText style={[styles.speechBadgeText, { color: statusColor }]}>
                        {statusText}
                      </ThemedText>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
              <EvendiIcon name="mic" size={32} color={theme.textMuted} />
              <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>Ingen taler lagt til</ThemedText>
              <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Taler vises her når kunden legger dem til</ThemedText>
            </View>
          )}
        </ScrollView>
      ) : activeTab === 'seating' ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl }}>
          {seatingData.tables.length > 0 ? (
            <View>
              <View style={[styles.seatingHeader, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                <EvendiIcon name="info" size={16} color={theme.accent} />
                <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>
                  Bordplan med gjester. Røde ikoner = talere. Bruk dette for å planlegge gruppefoto og bordfoto.
                </ThemedText>
              </View>
              <SeatingChart
                tables={seatingData.tables}
                guests={seatingData.guests || []}
                onTablesChange={() => {}}
                onGuestsChange={() => {}}
                editable={false}
                speeches={speeches}
              />
            </View>
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
              <EvendiIcon name="users" size={32} color={theme.textMuted} />
              <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>Bordplan ikke lagt til</ThemedText>
              <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Bordplan vises her når kunden legger den til</ThemedText>
            </View>
          )}
        </ScrollView>
      ) : activeTab === 'prosjekt' ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl }}>
          {/* Couple selector if multiple couples */}
          {vendorCouples.length > 1 && (
            <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, marginBottom: Spacing.md }]}>
              <ThemedText style={[styles.cardTitle, { color: theme.text, marginBottom: Spacing.sm }]}>Velg par</ThemedText>
              {vendorCouples.map((c) => (
                <Pressable
                  key={c.coupleId}
                  onPress={() => setSelectedCoupleId(c.coupleId)}
                  style={[
                    styles.listRow,
                    { borderBottomColor: theme.border },
                    selectedCoupleId === c.coupleId && { backgroundColor: theme.accent + '10' },
                  ]}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                    <EvendiIcon name={selectedCoupleId === c.coupleId ? 'check-circle' : 'circle'} size={18} color={selectedCoupleId === c.coupleId ? theme.accent : theme.textSecondary} />
                    <ThemedText style={{ color: theme.text, fontWeight: selectedCoupleId === c.coupleId ? '600' : '400' }}>{c.coupleName}</ThemedText>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
          {selectedCoupleId && sessionToken ? (
            <VendorCreatorHubBridge
              sessionToken={sessionToken}
              coupleId={selectedCoupleId}
              onOpenChat={(convId) => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate("VendorChat", { conversationId: convId });
              }}
            />
          ) : (
            <View style={[styles.emptyCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
              <EvendiIcon name="link" size={32} color={theme.textMuted} />
              <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>Ingen par tilkoblet</ThemedText>
              <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Start en samtale med en kunde for å koble til prosjektet</ThemedText>
            </View>
          )}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: "700", marginBottom: Spacing.xs },
  subtitle: { fontSize: 14 },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardRow: { flexDirection: "row", gap: Spacing.md, marginBottom: Spacing.lg },
  card: { flex: 1, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.sm },
  cardTitle: { fontSize: 16, fontWeight: "600" },
  cardBody: { fontSize: 13, marginBottom: Spacing.md },
  cardButton: { marginTop: Spacing.sm },
  infoBox: { flexDirection: "row", gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: Spacing.lg },
  infoText: { flex: 1, fontSize: 13 },
  sectionCard: { padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1, marginBottom: Spacing.md },
  sectionHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.md },
  emptyRow: { flexDirection: "row", gap: Spacing.md, alignItems: "center", paddingVertical: Spacing.md },
  emptyTitle: { fontSize: 14, fontWeight: "600" },
  emptySubtitle: { fontSize: 12, marginTop: 2 },
  listRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: Spacing.sm, borderBottomWidth: 1 },
  speechHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  speechRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderLeftWidth: 3,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  speechTimeCol: {
    width: 50,
    marginRight: Spacing.md,
  },
  speechTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  speechInfoCol: {
    flex: 1,
  },
  speechName: {
    fontSize: 14,
    fontWeight: '500',
  },
  speechRole: {
    fontSize: 12,
    marginTop: 2,
  },
  tableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  tableName: {
    fontSize: 11,
  },
  speechBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  speechBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  emptyCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    gap: Spacing.md,
  },
  seatingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
});
