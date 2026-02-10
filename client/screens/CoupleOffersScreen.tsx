import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { EvendiIcon } from "@/components/EvendiIcon";
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
import { showConfirm } from "@/lib/dialogs";
import { showToast } from "@/lib/toast";

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
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "accepted" | "declined" | "expired">("all");
  const [sortBy, setSortBy] = useState<"date" | "price" | "expiring">("date");

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
      showToast(error.message);
    },
  });

  const handleRespond = async (offerId: string, response: "accept" | "decline") => {
    const actionText = response === "accept" ? "akseptere" : "avslå";
    const confirmed = await showConfirm({
      title: response === "accept" ? "Aksepter tilbud" : "Avslå tilbud",
      message: `Er du sikker på at du vil ${actionText} dette tilbudet?`,
      confirmLabel: response === "accept" ? "Aksepter" : "Avslå",
      cancelLabel: "Avbryt",
      destructive: response !== "accept",
    });

    if (confirmed) {
      respondMutation.mutate({ offerId, response });
    }
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

  // Filter offers by status
  const filteredOffers = offers.filter((o) => {
    if (statusFilter === "all") return true;
    return o.status === statusFilter;
  });

  // Sort offers
  const sortedOffers = [...filteredOffers].sort((a, b) => {
    if (sortBy === "price") {
      return b.totalAmount - a.totalAmount;
    } else if (sortBy === "expiring") {
      if (!a.validUntil) return 1;
      if (!b.validUntil) return -1;
      return new Date(a.validUntil).getTime() - new Date(b.validUntil).getTime();
    } else {
      // Sort by date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const pendingOffers = sortedOffers.filter((o) => o.status === "pending");
  const processedOffers = sortedOffers.filter((o) => o.status !== "pending");

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
                  <EvendiIcon name={status.icon} size={12} color={status.color} />
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
                        <EvendiIcon 
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
            <EvendiIcon
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
                  const metadata = product?.metadata || {};
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
                              <EvendiIcon 
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
                        
                        {/* Display product metadata badges */}
                        {product && Object.keys(metadata).length > 0 && (
                          <View style={styles.metadataRow}>
                            {metadata.offersTasteSample && (
                              <View style={[styles.metadataBadge, { backgroundColor: "#4CAF5015" }]}>
                                <EvendiIcon name="coffee" size={9} color="#4CAF50" />
                                <ThemedText style={[styles.metadataText, { color: "#4CAF50" }]}>Smaksprøve inkludert</ThemedText>
                              </View>
                            )}
                            {metadata.cuisineType && (
                              <View style={[styles.metadataBadge, { backgroundColor: Colors.dark.accent + "15" }]}>
                                <ThemedText style={[styles.metadataText, { color: Colors.dark.accent }]}>
                                  {metadata.cuisineType.charAt(0).toUpperCase() + metadata.cuisineType.slice(1)}
                                </ThemedText>
                              </View>
                            )}
                            {metadata.isVegetarian && (
                              <View style={[styles.metadataBadge, { backgroundColor: "#8BC34A15" }]}>
                                <ThemedText style={[styles.metadataText, { color: "#8BC34A" }]}>Vegetar</ThemedText>
                              </View>
                            )}
                            {metadata.isVegan && (
                              <View style={[styles.metadataBadge, { backgroundColor: "#8BC34A15" }]}>
                                <ThemedText style={[styles.metadataText, { color: "#8BC34A" }]}>Vegan</ThemedText>
                              </View>
                            )}
                            {metadata.cakeStyle && (
                              <View style={[styles.metadataBadge, { backgroundColor: Colors.dark.accent + "15" }]}>
                                <ThemedText style={[styles.metadataText, { color: Colors.dark.accent }]}>
                                  {metadata.cakeStyle.charAt(0).toUpperCase() + metadata.cakeStyle.slice(1)} stil
                                </ThemedText>
                              </View>
                            )}
                            {metadata.numberOfTiers && (
                              <View style={[styles.metadataBadge, { backgroundColor: Colors.dark.accent + "15" }]}>
                                <ThemedText style={[styles.metadataText, { color: Colors.dark.accent }]}>
                                  {metadata.numberOfTiers} etasjer
                                </ThemedText>
                              </View>
                            )}
                            {metadata.flowerItemType && (
                              <View style={[styles.metadataBadge, { backgroundColor: Colors.dark.accent + "15" }]}>
                                <ThemedText style={[styles.metadataText, { color: Colors.dark.accent }]}>
                                  {metadata.flowerItemType.charAt(0).toUpperCase() + metadata.flowerItemType.slice(1)}
                                </ThemedText>
                              </View>
                            )}
                            {metadata.vehicleType && (
                              <View style={[styles.metadataBadge, { backgroundColor: Colors.dark.accent + "15" }]}>
                                <EvendiIcon name="truck" size={9} color={Colors.dark.accent} />
                                <ThemedText style={[styles.metadataText, { color: Colors.dark.accent }]}>
                                  {metadata.vehicleType.charAt(0).toUpperCase() + metadata.vehicleType.slice(1)}
                                </ThemedText>
                              </View>
                            )}
                            {metadata.passengerCapacity && (
                              <View style={[styles.metadataBadge, { backgroundColor: Colors.dark.accent + "15" }]}>
                                <EvendiIcon name="users" size={9} color={Colors.dark.accent} />
                                <ThemedText style={[styles.metadataText, { color: Colors.dark.accent }]}>
                                  {metadata.passengerCapacity} plasser
                                </ThemedText>
                              </View>
                            )}
                            {metadata.serviceType && (
                              <View style={[styles.metadataBadge, { backgroundColor: Colors.dark.accent + "15" }]}>
                                <ThemedText style={[styles.metadataText, { color: Colors.dark.accent }]}>
                                  {metadata.serviceType.charAt(0).toUpperCase() + metadata.serviceType.slice(1)}
                                </ThemedText>
                              </View>
                            )}
                            {metadata.includesTrialSession && (
                              <View style={[styles.metadataBadge, { backgroundColor: "#9C27B015" }]}>
                                <EvendiIcon name="check" size={9} color="#9C27B0" />
                                <ThemedText style={[styles.metadataText, { color: "#9C27B0" }]}>Prøveskyss inkludert</ThemedText>
                              </View>
                            )}
                            
                            {/* Fotograf metadata */}
                            {metadata.packageType && metadata.hoursIncluded && (
                              <View style={[styles.metadataBadge, { backgroundColor: "#2196F315" }]}>
                                <EvendiIcon name="camera" size={9} color="#2196F3" />
                                <ThemedText style={[styles.metadataText, { color: "#2196F3" }]}>
                                  {metadata.packageType} - {metadata.hoursIncluded}t
                                </ThemedText>
                              </View>
                            )}
                            {metadata.photosDelivered && (
                              <View style={[styles.metadataBadge, { backgroundColor: "#2196F315" }]}>
                                <EvendiIcon name="image" size={9} color="#2196F3" />
                                <ThemedText style={[styles.metadataText, { color: "#2196F3" }]}>
                                  {metadata.photosDelivered} bilder
                                </ThemedText>
                              </View>
                            )}
                            {metadata.printRightsIncluded && (
                              <View style={[styles.metadataBadge, { backgroundColor: "#00BCD415" }]}>
                                <EvendiIcon name="printer" size={9} color="#00BCD4" />
                                <ThemedText style={[styles.metadataText, { color: "#00BCD4" }]}>Trykkerett</ThemedText>
                              </View>
                            )}
                            
                            {/* Videograf metadata */}
                            {metadata.filmDurationMinutes && (
                              <View style={[styles.metadataBadge, { backgroundColor: "#9C27B015" }]}>
                                <EvendiIcon name="film" size={9} color="#9C27B0" />
                                <ThemedText style={[styles.metadataText, { color: "#9C27B0" }]}>
                                  {metadata.filmDurationMinutes} min film
                                </ThemedText>
                              </View>
                            )}
                            {metadata.editingStyle && (
                              <View style={[styles.metadataBadge, { backgroundColor: "#673AB715" }]}>
                                <ThemedText style={[styles.metadataText, { color: "#673AB7" }]}>
                                  {metadata.editingStyle.charAt(0).toUpperCase() + metadata.editingStyle.slice(1)}
                                </ThemedText>
                              </View>
                            )}
                            {metadata.droneFootageIncluded && (
                              <View style={[styles.metadataBadge, { backgroundColor: "#FF980015" }]}>
                                <EvendiIcon name="navigation" size={9} color="#FF9800" />
                                <ThemedText style={[styles.metadataText, { color: "#FF9800" }]}>Drone inkludert</ThemedText>
                              </View>
                            )}
                            
                            {/* Musikk metadata */}
                            {metadata.performanceType && (
                              <View style={[styles.metadataBadge, { backgroundColor: "#E91E6315" }]}>
                                <EvendiIcon name="music" size={9} color="#E91E63" />
                                <ThemedText style={[styles.metadataText, { color: "#E91E63" }]}>
                                  {metadata.performanceType.toUpperCase()}
                                </ThemedText>
                              </View>
                            )}
                            {metadata.genre && (
                              <View style={[styles.metadataBadge, { backgroundColor: "#F4433615" }]}>
                                <ThemedText style={[styles.metadataText, { color: "#F44336" }]}>
                                  {metadata.genre.charAt(0).toUpperCase() + metadata.genre.slice(1)}
                                </ThemedText>
                              </View>
                            )}
                            {metadata.performanceDurationHours && (
                              <View style={[styles.metadataBadge, { backgroundColor: Colors.dark.accent + "15" }]}>
                                <EvendiIcon name="clock" size={9} color={Colors.dark.accent} />
                                <ThemedText style={[styles.metadataText, { color: Colors.dark.accent }]}>
                                  {metadata.performanceDurationHours}t opptreden
                                </ThemedText>
                              </View>
                            )}
                            {metadata.equipmentIncluded && (
                              <View style={[styles.metadataBadge, { backgroundColor: "#FF572215" }]}>
                                <EvendiIcon name="headphones" size={9} color="#FF5722" />
                                <ThemedText style={[styles.metadataText, { color: "#FF5722" }]}>Utstyr inkludert</ThemedText>
                              </View>
                            )}
                            
                            {/* Venue metadata */}
                            {metadata.capacityMax && (
                              <View style={[styles.metadataBadge, { backgroundColor: "#79554815" }]}>
                                <EvendiIcon name="users" size={9} color="#795548" />
                                <ThemedText style={[styles.metadataText, { color: "#795548" }]}>
                                  {metadata.capacityMin && `${metadata.capacityMin}-`}{metadata.capacityMax} gjester
                                </ThemedText>
                              </View>
                            )}
                            {metadata.indoorOutdoor && (
                              <View style={[styles.metadataBadge, { backgroundColor: Colors.dark.accent + "15" }]}>
                                <EvendiIcon name="home" size={9} color={Colors.dark.accent} />
                                <ThemedText style={[styles.metadataText, { color: Colors.dark.accent }]}>
                                  {metadata.indoorOutdoor.charAt(0).toUpperCase() + metadata.indoorOutdoor.slice(1)}
                                </ThemedText>
                              </View>
                            )}
                            {metadata.cateringIncluded && (
                              <View style={[styles.metadataBadge, { backgroundColor: "#8BC34A15" }]}>
                                <EvendiIcon name="coffee" size={9} color="#8BC34A" />
                                <ThemedText style={[styles.metadataText, { color: "#8BC34A" }]}>Catering inkludert</ThemedText>
                              </View>
                            )}
                            
                            {/* Planlegger metadata */}
                            {metadata.serviceLevel && (
                              <View style={[styles.metadataBadge, { backgroundColor: "#00BCD415" }]}>
                                <EvendiIcon name="clipboard" size={9} color="#00BCD4" />
                                <ThemedText style={[styles.metadataText, { color: "#00BCD4" }]}>
                                  {metadata.serviceLevel.charAt(0).toUpperCase() + metadata.serviceLevel.slice(1)}
                                </ThemedText>
                              </View>
                            )}
                            {metadata.monthsOfService && (
                              <View style={[styles.metadataBadge, { backgroundColor: Colors.dark.accent + "15" }]}>
                                <EvendiIcon name="calendar" size={9} color={Colors.dark.accent} />
                                <ThemedText style={[styles.metadataText, { color: Colors.dark.accent }]}>
                                  {metadata.monthsOfService} måneder
                                </ThemedText>
                              </View>
                            )}
                            {metadata.vendorCoordinationIncluded && (
                              <View style={[styles.metadataBadge, { backgroundColor: "#00968815" }]}>
                                <EvendiIcon name="users" size={9} color="#009688" />
                                <ThemedText style={[styles.metadataText, { color: "#009688" }]}>Koordinering inkludert</ThemedText>
                              </View>
                            )}
                          </View>
                        )}
                        
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
                  <EvendiIcon name="calendar" size={14} color={theme.textMuted} />
                  <ThemedText style={[styles.metaText, { color: theme.textMuted }]}>
                    Mottatt {formatDate(offer.createdAt)}
                  </ThemedText>
                </View>
                {offer.validUntil ? (
                  <View style={styles.metaRow}>
                    <EvendiIcon
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
            <EvendiIcon name="file-text" size={48} color={theme.textMuted} />
            <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
              Ingen tilbud ennå
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
              Når leverandører sender deg tilbud, vil de vises her.
            </ThemedText>
          </View>
        }
        ListHeaderComponent={
          <>
            {/* Quick Filter Chips */}
            <View style={styles.filtersSection}>
              <ThemedText style={[styles.filtersLabel, { color: theme.textMuted }]}>Status</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                {[
                  { value: "all" as const, label: "Alle", icon: "list" as const },
                  { value: "pending" as const, label: "Venter", icon: "clock" as const },
                  { value: "accepted" as const, label: "Akseptert", icon: "check-circle" as const },
                  { value: "declined" as const, label: "Avslått", icon: "x-circle" as const },
                  { value: "expired" as const, label: "Utløpt", icon: "alert-circle" as const },
                ].map((filter) => (
                  <Pressable
                    key={filter.value}
                    onPress={() => {
                      setStatusFilter(filter.value);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: statusFilter === filter.value ? Colors.dark.accent : theme.backgroundSecondary,
                        borderColor: statusFilter === filter.value ? Colors.dark.accent : theme.border,
                      },
                    ]}
                  >
                    <EvendiIcon
                      name={filter.icon}
                      size={14}
                      color={statusFilter === filter.value ? "#1A1A1A" : theme.textMuted}
                    />
                    <ThemedText
                      style={[
                        styles.filterText,
                        { color: statusFilter === filter.value ? "#1A1A1A" : theme.textSecondary },
                      ]}
                    >
                      {filter.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Sort Options */}
            <View style={styles.filtersSection}>
              <ThemedText style={[styles.filtersLabel, { color: theme.textMuted }]}>Sorter</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
                {[
                  { value: "date" as const, label: "Nyeste først", icon: "calendar" as const },
                  { value: "price" as const, label: "Høyeste pris", icon: "dollar-sign" as const },
                  { value: "expiring" as const, label: "Utløper snart", icon: "clock" as const },
                ].map((sort) => (
                  <Pressable
                    key={sort.value}
                    onPress={() => {
                      setSortBy(sort.value);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.filterChip,
                      {
                        backgroundColor: sortBy === sort.value ? Colors.dark.accent : theme.backgroundSecondary,
                        borderColor: sortBy === sort.value ? Colors.dark.accent : theme.border,
                      },
                    ]}
                  >
                    <EvendiIcon
                      name={sort.icon}
                      size={14}
                      color={sortBy === sort.value ? "#1A1A1A" : theme.textMuted}
                    />
                    <ThemedText
                      style={[
                        styles.filterText,
                        { color: sortBy === sort.value ? "#1A1A1A" : theme.textSecondary },
                      ]}
                    >
                      {sort.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {pendingOffers.length > 0 ? (
              <View style={styles.sectionHeader}>
                <View style={[styles.pendingBadge, { backgroundColor: Colors.dark.accent + "20" }]}>
                  <ThemedText style={[styles.pendingBadgeText, { color: Colors.dark.accent }]}>
                    {pendingOffers.length} venter på svar
                  </ThemedText>
                </View>
              </View>
            ) : null}
          </>
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
  filtersSection: {
    marginBottom: Spacing.md,
  },
  filtersLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: Spacing.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  filtersScroll: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "500",
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
    gap: 4,
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
  metadataRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  metadataBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  metadataText: {
    fontSize: 10,
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
