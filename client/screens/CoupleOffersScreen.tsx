import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
  FlatList,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

const COUPLE_STORAGE_KEY = "wedflow_couple_session";

const getCountdown = (validUntil: string): { text: string; color: string; urgency: "urgent" | "warning" | "normal" | "expired" } => {
  const now = new Date();
  const expiry = new Date(validUntil);
  const diffMs = expiry.getTime() - now.getTime();
  
  if (diffMs <= 0) {
    return { text: "Utløpt", color: "#F44336", urgency: "expired" };
  }
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  const remainingHours = diffHours % 24;
  
  if (diffHours < 24) {
    return { 
      text: `${diffHours} timer igjen`, 
      color: "#F44336",
      urgency: "urgent" 
    };
  } else if (diffDays <= 3) {
    return { 
      text: diffDays === 1 ? `1 dag ${remainingHours}t igjen` : `${diffDays} dager igjen`, 
      color: "#FF9800",
      urgency: "warning" 
    };
  } else {
    return { 
      text: `${diffDays} dager igjen`, 
      color: "#4CAF50",
      urgency: "normal" 
    };
  }
};

interface OfferItem {
  id: string;
  title: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface CoupleOffer {
  id: string;
  title: string;
  message: string | null;
  totalAmount: number;
  status: "pending" | "accepted" | "declined" | "expired";
  validUntil: string | null;
  createdAt: string;
  vendor: {
    id: string;
    businessName: string;
    imageUrl: string | null;
  } | null;
  items: OfferItem[];
}

export default function CoupleOffersScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [expandedOffer, setExpandedOffer] = useState<string | null>(null);

  const { data: offers = [], isLoading, isRefetching, refetch } = useQuery<CoupleOffer[]>({
    queryKey: ["/api/couple/offers"],
    queryFn: async () => {
      const sessionData = await AsyncStorage.getItem(COUPLE_STORAGE_KEY);
      if (!sessionData) return [];
      const session = JSON.parse(sessionData);
      const response = await fetch(new URL("/api/couple/offers", getApiUrl()).toString(), {
        headers: { Authorization: `Bearer ${session.sessionToken}` },
      });
      if (!response.ok) throw new Error("Kunne ikke hente tilbud");
      return response.json();
    },
  });

  const respondMutation = useMutation({
    mutationFn: async ({ offerId, response }: { offerId: string; response: "accept" | "decline" }) => {
      const sessionData = await AsyncStorage.getItem(COUPLE_STORAGE_KEY);
      if (!sessionData) throw new Error("Ikke innlogget");
      const session = JSON.parse(sessionData);

      const res = await fetch(new URL(`/api/couple/offers/${offerId}/respond`, getApiUrl()).toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.sessionToken}`,
        },
        body: JSON.stringify({ response }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Kunne ikke svare på tilbud");
      }

      return res.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/couple/offers"] });
    },
    onError: (error: Error) => {
      Alert.alert("Feil", error.message);
    },
  });

  const handleRespond = (offerId: string, response: "accept" | "decline") => {
    const actionText = response === "accept" ? "akseptere" : "avslå";
    Alert.alert(
      response === "accept" ? "Aksepter tilbud" : "Avslå tilbud",
      `Er du sikker på at du vil ${actionText} dette tilbudet?`,
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: response === "accept" ? "Aksepter" : "Avslå",
          style: response === "accept" ? "default" : "destructive",
          onPress: () => respondMutation.mutate({ offerId, response }),
        },
      ]
    );
  };

  const formatPrice = (priceInOre: number) => {
    return (priceInOre / 100).toLocaleString("nb-NO", { minimumFractionDigits: 0 }) + " kr";
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return { label: "Akseptert", color: "#4CAF50", icon: "check-circle" as const };
      case "declined":
        return { label: "Avslått", color: "#F44336", icon: "x-circle" as const };
      case "expired":
        return { label: "Utløpt", color: "#9E9E9E", icon: "clock" as const };
      default:
        return { label: "Venter", color: Colors.dark.accent, icon: "clock" as const };
    }
  };

  const pendingOffers = offers.filter((o) => o.status === "pending");
  const processedOffers = offers.filter((o) => o.status !== "pending");

  const renderOfferCard = (offer: CoupleOffer, index: number) => {
    const status = getStatusBadge(offer.status);
    const isExpanded = expandedOffer === offer.id;
    const isExpired = offer.validUntil && new Date(offer.validUntil) < new Date();

    return (
      <Animated.View
        key={offer.id}
        entering={FadeInDown.duration(300).delay(index * 50)}
      >
        <Card style={styles.offerCard}>
          <Pressable
            onPress={() => {
              setExpandedOffer(isExpanded ? null : offer.id);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={styles.offerHeader}
          >
            <View style={styles.offerInfo}>
              <View style={styles.offerTitleRow}>
                <ThemedText style={styles.offerTitle}>{offer.title}</ThemedText>
                <View style={[styles.statusBadge, { backgroundColor: status.color + "20" }]}>
                  <Feather name={status.icon} size={12} color={status.color} />
                  <ThemedText style={[styles.statusText, { color: status.color }]}>
                    {status.label}
                  </ThemedText>
                </View>
              </View>
              {offer.vendor ? (
                <ThemedText style={[styles.vendorName, { color: theme.textMuted }]}>
                  Fra {offer.vendor.businessName}
                </ThemedText>
              ) : null}
              <View style={styles.priceAndCountdown}>
                <ThemedText style={[styles.offerAmount, { color: Colors.dark.accent }]}>
                  {formatPrice(offer.totalAmount)}
                </ThemedText>
                {offer.status === "pending" && offer.validUntil ? (
                  (() => {
                    const countdown = getCountdown(offer.validUntil);
                    return (
                      <View style={[styles.countdownBadge, { backgroundColor: countdown.color + "15", borderColor: countdown.color + "40" }]}>
                        <Feather 
                          name={countdown.urgency === "urgent" ? "alert-circle" : "clock"} 
                          size={12} 
                          color={countdown.color} 
                        />
                        <ThemedText style={[styles.countdownText, { color: countdown.color }]}>
                          {countdown.text}
                        </ThemedText>
                      </View>
                    );
                  })()
                ) : null}
              </View>
            </View>
            <Feather
              name={isExpanded ? "chevron-up" : "chevron-down"}
              size={20}
              color={theme.textMuted}
            />
          </Pressable>

          {isExpanded ? (
            <View style={[styles.offerDetails, { borderTopColor: theme.border }]}>
              {offer.message ? (
                <View style={styles.messageSection}>
                  <ThemedText style={[styles.sectionLabel, { color: theme.textMuted }]}>
                    Melding
                  </ThemedText>
                  <ThemedText style={styles.messageText}>{offer.message}</ThemedText>
                </View>
              ) : null}

              <View style={styles.itemsSection}>
                <ThemedText style={[styles.sectionLabel, { color: theme.textMuted }]}>
                  Linjer
                </ThemedText>
                {offer.items.map((item) => {
                  // Check if inventory tracking is enabled and if quantity is available
                  const product = (item as any).product;
                  const hasInventory = product?.trackInventory;
                  const available = hasInventory 
                    ? (product.availableQuantity || 0) - (product.reservedQuantity || 0) - (product.bookingBuffer || 0)
                    : null;
                  const exceedsInventory = hasInventory && available !== null && item.quantity > available;
                  
                  return (
                    <View key={item.id} style={[styles.itemRow, { borderBottomColor: theme.border }]}>
                      <View style={styles.itemInfo}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                          <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
                          {hasInventory && (
                            <View style={[styles.inventoryBadge, {
                              backgroundColor: exceedsInventory ? "#F44336" + "20" : "#4CAF50" + "20"
                            }]}>
                              <Feather 
                                name={exceedsInventory ? "alert-triangle" : "check"} 
                                size={10} 
                                color={exceedsInventory ? "#F44336" : "#4CAF50"}
                              />
                              <ThemedText style={{
                                fontSize: 10,
                                marginLeft: 3,
                                color: exceedsInventory ? "#F44336" : "#4CAF50",
                                fontWeight: "600",
                              }}>
                                {exceedsInventory ? `Kun ${available} tilgj.` : 'På lager'}
                              </ThemedText>
                            </View>
                          )}
                        </View>
                        <ThemedText style={[styles.itemDesc, { color: theme.textMuted }]}>
                          {formatPrice(item.unitPrice)} x {item.quantity}
                        </ThemedText>
                      </View>
                      <ThemedText style={styles.itemTotal}>
                        {formatPrice(item.lineTotal)}
                      </ThemedText>
                    </View>
                  );
                })}
              </View>

              <View style={styles.metaSection}>
                <View style={styles.metaRow}>
                  <Feather name="calendar" size={14} color={theme.textMuted} />
                  <ThemedText style={[styles.metaText, { color: theme.textMuted }]}>
                    Mottatt {formatDate(offer.createdAt)}
                  </ThemedText>
                </View>
                {offer.validUntil ? (
                  <View style={styles.metaRow}>
                    <Feather
                      name="clock"
                      size={14}
                      color={isExpired ? "#F44336" : theme.textMuted}
                    />
                    <ThemedText
                      style={[
                        styles.metaText,
                        { color: isExpired ? "#F44336" : theme.textMuted },
                      ]}
                    >
                      {isExpired ? "Utløpt" : `Gyldig til ${formatDate(offer.validUntil)}`}
                    </ThemedText>
                  </View>
                ) : null}
              </View>

              {offer.status === "pending" && !isExpired ? (
                <View style={styles.actionButtons}>
                  <Pressable
                    onPress={() => handleRespond(offer.id, "decline")}
                    style={[styles.declineBtn, { borderColor: theme.border }]}
                    disabled={respondMutation.isPending}
                  >
                    <ThemedText style={[styles.declineBtnText, { color: theme.textMuted }]}>
                      Avslå
                    </ThemedText>
                  </Pressable>
                  <Button
                    onPress={() => handleRespond(offer.id, "accept")}
                    style={styles.acceptBtn}
                    disabled={respondMutation.isPending}
                  >
                    {respondMutation.isPending ? "Behandler..." : "Aksepter tilbud"}
                  </Button>
                </View>
              ) : null}
            </View>
          ) : null}
        </Card>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.dark.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={[...pendingOffers, ...processedOffers]}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => renderOfferCard(item, index)}
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={Colors.dark.accent}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Feather name="file-text" size={48} color={theme.textMuted} />
            <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
              Ingen tilbud ennå
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
              Når leverandører sender deg tilbud, vil de vises her.
            </ThemedText>
          </View>
        }
        ListHeaderComponent={
          pendingOffers.length > 0 ? (
            <View style={styles.sectionHeader}>
              <View style={[styles.pendingBadge, { backgroundColor: Colors.dark.accent + "20" }]}>
                <ThemedText style={[styles.pendingBadgeText, { color: Colors.dark.accent }]}>
                  {pendingOffers.length} venter på svar
                </ThemedText>
              </View>
            </View>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  sectionHeader: {
    marginBottom: Spacing.sm,
  },
  pendingBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  pendingBadgeText: {
    fontSize: 13,
    fontWeight: "600",
  },
  offerCard: {
    padding: 0,
    overflow: "hidden",
  },
  offerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: Spacing.lg,
  },
  offerInfo: {
    flex: 1,
  },
  offerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
    marginBottom: Spacing.xs,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  vendorName: {
    fontSize: 13,
    marginBottom: Spacing.xs,
  },
  offerAmount: {
    fontSize: 18,
    fontWeight: "700",
  },
  priceAndCountdown: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  countdownBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  countdownText: {
    fontSize: 12,
    fontWeight: "600",
  },
  offerDetails: {
    borderTopWidth: 1,
    padding: Spacing.lg,
  },
  messageSection: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  itemsSection: {
    marginBottom: Spacing.md,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "500",
  },
  inventoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "600",
  },
  metaSection: {
    marginBottom: Spacing.md,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  metaText: {
    fontSize: 13,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  declineBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  declineBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  acceptBtn: {
    flex: 2,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    maxWidth: 250,
  },
});
