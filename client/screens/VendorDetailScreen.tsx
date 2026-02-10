import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Linking,
  Alert,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { EvendiIcon, EvendiIconGlyphMap } from "@/components/EvendiIcon";
import { useQuery, useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { PlanningStackParamList } from "@/navigation/PlanningStackNavigator";
import { getApiUrl } from "@/lib/query-client";
import { useVendorLocationIntelligence } from "@/hooks/useVendorLocationIntelligence";

const COUPLE_STORAGE_KEY = "wedflow_couple_session";

interface VendorReview {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  isAnonymous: boolean;
  createdAt: string;
  coupleName: string;
  vendorResponse: {
    id: string;
    body: string;
    createdAt: string;
  } | null;
}

interface VendorProduct {
  id: string;
  title: string;
  description: string | null;
  unitPrice: number;
  unitType: string;
  metadata: any | null;
  categoryTag?: string | null;
  // Venue-specific fields
  venueAddress?: string | null;
  venueMaxGuests?: number | null;
  venueMinGuests?: number | null;
  venueCateringIncluded?: boolean;
  venueAccommodationAvailable?: boolean;
  venueCheckoutTime?: string | null;
}

interface VendorReviewsResponse {
  reviews: VendorReview[];
  googleReviewUrl: string | null;
  stats: {
    count: number;
    average: number;
  };
}

export default function VendorDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<NativeStackNavigationProp<PlanningStackParamList>>();
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const [isStartingChat, setIsStartingChat] = useState(false);

  const { vendorId, vendorName, vendorDescription, vendorLocation, vendorPriceRange, vendorCategory } = route.params || {};

  // Location intelligence
  const locationIntel = useVendorLocationIntelligence();

  // Calculate travel on mount if vendor has location
  React.useEffect(() => {
    if (vendorId && vendorLocation && locationIntel.venueCoordinates) {
      locationIntel.calculateVendorTravel({
        id: vendorId,
        businessName: vendorName || '',
        location: vendorLocation,
      });
    }
  }, [vendorId, vendorLocation, locationIntel.venueCoordinates]);

  const vendorTravel = vendorId ? locationIntel.getVendorTravel(vendorId) : null;
  const travelBadge = vendorId ? locationIntel.getTravelBadge(vendorId) : null;

  const { data, isLoading, error } = useQuery<VendorReviewsResponse>({
    queryKey: [`/api/vendors/${vendorId}/reviews`],
    enabled: !!vendorId,
  });

  const { data: products = [] } = useQuery<VendorProduct[]>({
    queryKey: [`/api/vendors/${vendorId}/products`],
    enabled: !!vendorId,
  });

  /** Start (or resume) a chat conversation with this vendor */
  const handleStartChat = async () => {
    setIsStartingChat(true);
    try {
      const sessionData = await AsyncStorage.getItem(COUPLE_STORAGE_KEY);
      if (!sessionData) {
        Alert.alert("Logg inn", "Du må logge inn for å sende meldinger.");
        setIsStartingChat(false);
        return;
      }
      const { sessionToken } = JSON.parse(sessionData);

      const response = await fetch(
        new URL("/api/couples/messages", getApiUrl()).toString(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionToken}`,
          },
          body: JSON.stringify({
            vendorId,
            body: `Hei! Jeg er interessert i tjenestene deres (${getCategoryLabel(vendorCategory)}).`,
          }),
        }
      );

      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || "Kunne ikke starte samtale");
      }

      const msg = await response.json();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      navigation.navigate("Chat", {
        conversationId: msg.conversationId,
        vendorName: vendorName || "Leverandør",
      });
    } catch (e: any) {
      Alert.alert("Feil", e.message || "Kunne ikke starte samtale");
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleOpenGoogle = async () => {
    if (!data?.googleReviewUrl) return;
    try {
      await Linking.openURL(data.googleReviewUrl);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      Alert.alert("Kunne ikke åpne", "Vennligst prøv igjen senere");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      photographer: "Fotograf",
      videographer: "Videograf",
      dj: "DJ",
      florist: "Blomster",
      caterer: "Catering",
      venue: "Lokale",
      planner: "Planlegger",
      music: "Musikk/DJ",
      cake: "Kake",
      attire: "Antrekk",
      beauty: "Hår & Makeup",
      transport: "Transport",
    };
    return labels[category] || category;
  };

  const getCategoryIcon = (category: string): keyof typeof EvendiIconGlyphMap => {
    const icons: Record<string, keyof typeof EvendiIconGlyphMap> = {
      photographer: "camera",
      videographer: "video",
      dj: "music",
      florist: "sun",
      caterer: "coffee",
      venue: "home",
      planner: "clipboard",
      music: "music",
      cake: "gift",
      attire: "shopping-bag",
      beauty: "scissors",
      transport: "truck",
    };
    return icons[category] || "briefcase";
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
    >
      <Card style={styles.headerCard}>
        <View style={[styles.vendorImage, { backgroundColor: theme.backgroundSecondary }]}>
          <EvendiIcon name={getCategoryIcon(vendorCategory)} size={32} color={theme.accent} />
        </View>
        <ThemedText style={Typography.h2}>{vendorName}</ThemedText>
        <View style={styles.categoryRow}>
          <EvendiIcon name="tag" size={14} color={theme.textSecondary} />
          <ThemedText style={[Typography.small, { color: theme.textSecondary, marginLeft: Spacing.xs }]}>
            {getCategoryLabel(vendorCategory)}
          </ThemedText>
        </View>
        {vendorLocation ? (
          <View style={styles.locationRow}>
            <EvendiIcon name="map-pin" size={14} color={theme.textSecondary} />
            <ThemedText style={[Typography.small, { color: theme.textSecondary, marginLeft: Spacing.xs }]}>
              {vendorLocation}
            </ThemedText>
          </View>
        ) : null}

        {/* Travel info from venue */}
        {(travelBadge || vendorTravel?.isLoading) && (
          <View style={[styles.travelCard, { backgroundColor: "#2196F308", borderColor: "#2196F320" }]}>
            <View style={styles.travelCardHeader}>
              <EvendiIcon name="navigation" size={14} color="#2196F3" />
              {vendorTravel?.isLoading ? (
                <View style={styles.travelCardLoading}>
                  <ActivityIndicator size={10} color="#2196F3" />
                  <ThemedText style={[styles.travelCardText, { color: "#2196F3" }]}>
                    Beregner reisetid...
                  </ThemedText>
                </View>
              ) : (
                <ThemedText style={[styles.travelCardBold, { color: "#2196F3" }]}>
                  {travelBadge}
                </ThemedText>
              )}
            </View>

            {locationIntel.venueName && !vendorTravel?.isLoading && (
              <ThemedText style={[styles.travelCardFrom, { color: theme.textMuted }]}>
                Fra lokalet ({locationIntel.venueName})
              </ThemedText>
            )}

            {vendorTravel?.travel && (
              <View style={styles.travelCardDetails}>
                {vendorTravel.travel.fuelCostNok > 0 && (
                  <View style={[styles.travelDetailBadge, { backgroundColor: "#FF980010" }]}>
                    <EvendiIcon name="droplet" size={10} color="#FF9800" />
                    <ThemedText style={[styles.travelDetailText, { color: "#FF9800" }]}>
                      Drivstoff: ~{Math.round(vendorTravel.travel.fuelCostNok)} kr
                    </ThemedText>
                  </View>
                )}
                {vendorTravel.travel.tollEstimateNok > 0 && (
                  <View style={[styles.travelDetailBadge, { backgroundColor: "#9C27B010" }]}>
                    <EvendiIcon name="credit-card" size={10} color="#9C27B0" />
                    <ThemedText style={[styles.travelDetailText, { color: "#9C27B0" }]}>
                      Bompenger: ~{Math.round(vendorTravel.travel.tollEstimateNok)} kr
                    </ThemedText>
                  </View>
                )}
              </View>
            )}

            {/* Quick action buttons */}
            <View style={styles.travelCardActions}>
              <Pressable
                onPress={() => locationIntel.openDirections({
                  id: vendorId, businessName: vendorName || '', location: vendorLocation,
                })}
                style={[styles.travelActionBtn, { backgroundColor: "#2196F312" }]}
              >
                <EvendiIcon name="navigation" size={12} color="#2196F3" />
                <ThemedText style={[styles.travelActionText, { color: "#2196F3" }]}>Kjørerute</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => locationIntel.openVendorOnMap({
                  id: vendorId, businessName: vendorName || '', location: vendorLocation,
                })}
                style={[styles.travelActionBtn, { backgroundColor: "#4CAF5012" }]}
              >
                <EvendiIcon name="map" size={12} color="#4CAF50" />
                <ThemedText style={[styles.travelActionText, { color: "#4CAF50" }]}>Vis på kart</ThemedText>
              </Pressable>
            </View>
          </View>
        )}
        {vendorDescription ? (
          <ThemedText style={[Typography.body, { opacity: 0.8, marginTop: Spacing.md, textAlign: "center" }]}>
            {vendorDescription}
          </ThemedText>
        ) : null}
        {vendorPriceRange ? (
          <ThemedText style={[Typography.caption, { color: theme.accent, marginTop: Spacing.sm }]}>
            {vendorPriceRange}
          </ThemedText>
        ) : null}
      </Card>

      {/* Action Bar — Contact / Chat / Appointment */}
      <Animated.View entering={FadeInDown.delay(100).duration(300)} style={styles.actionBar}>
        <Pressable
          onPress={handleStartChat}
          disabled={isStartingChat}
          style={[styles.actionButton, { backgroundColor: theme.primary }]}
        >
          <EvendiIcon name="message-circle" size={18} color="#FFFFFF" />
          <ThemedText style={styles.actionButtonText}>
            {isStartingChat ? "Starter..." : "Send melding"}
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => {
            navigation.goBack();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={[styles.actionButtonOutline, { borderColor: theme.primary }]}
        >
          <EvendiIcon name="calendar" size={18} color={theme.primary} />
          <ThemedText style={[styles.actionButtonOutlineText, { color: theme.primary }]}>
            Book avtale
          </ThemedText>
        </Pressable>
      </Animated.View>

      {isLoading ? (
        <ActivityIndicator size="large" color={theme.accent} style={{ marginTop: Spacing.xl }} />
      ) : error ? (
        <Card style={styles.errorCard}>
          <EvendiIcon name="alert-circle" size={24} color={theme.error} />
          <ThemedText style={[Typography.body, { marginTop: Spacing.sm }]}>
            Kunne ikke laste anmeldelser
          </ThemedText>
        </Card>
      ) : (
        <>
          {/* Products Section */}
          {products.length > 0 && (
            <>
              <ThemedText style={[Typography.h3, { marginTop: Spacing.xl, marginBottom: Spacing.md }]}>
                Tilbud & Tjenester
              </ThemedText>
              {products.map((product) => {
                const metadata = product.metadata || {};
                const formatPrice = (priceInOre: number) => {
                  return (priceInOre / 100).toLocaleString("nb-NO", { minimumFractionDigits: 0 }) + " kr";
                };
                
                return (
                  <Card key={product.id} style={styles.productCard}>
                    <View style={styles.productHeader}>
                      <ThemedText style={[Typography.body, { fontWeight: "600", flex: 1 }]}>
                        {product.title}
                      </ThemedText>
                      <ThemedText style={[Typography.body, { color: theme.accent, fontWeight: "700" }]}>
                        {formatPrice(product.unitPrice)}
                      </ThemedText>
                    </View>
                    
                    {product.description && (
                      <ThemedText style={[Typography.small, { opacity: 0.8, marginTop: Spacing.xs }]}>
                        {product.description}
                      </ThemedText>
                    )}\n                    \n                    {/* Metadata badges */}
                    {Object.keys(metadata).length > 0 && (
                      <View style={styles.metadataRow}>
                        {metadata.offersTasteSample && (
                          <View style={[styles.metadataBadge, { backgroundColor: "#4CAF5015" }]}>
                            <EvendiIcon name="coffee" size={10} color="#4CAF50" />
                            <ThemedText style={[styles.metadataText, { color: "#4CAF50" }]}>Smaksprøve</ThemedText>
                          </View>
                        )}
                        {metadata.cuisineType && (
                          <View style={[styles.metadataBadge, { backgroundColor: theme.accent + "15" }]}>
                            <ThemedText style={[styles.metadataText, { color: theme.accent }]}>
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
                          <View style={[styles.metadataBadge, { backgroundColor: theme.accent + "15" }]}>
                            <ThemedText style={[styles.metadataText, { color: theme.accent }]}>
                              {metadata.cakeStyle.charAt(0).toUpperCase() + metadata.cakeStyle.slice(1)}
                            </ThemedText>
                          </View>
                        )}
                        {metadata.numberOfTiers && (
                          <View style={[styles.metadataBadge, { backgroundColor: theme.accent + "15" }]}>
                            <ThemedText style={[styles.metadataText, { color: theme.accent }]}>
                              {metadata.numberOfTiers} etasjer
                            </ThemedText>
                          </View>
                        )}
                        {metadata.flowerItemType && (
                          <View style={[styles.metadataBadge, { backgroundColor: theme.accent + "15" }]}>
                            <ThemedText style={[styles.metadataText, { color: theme.accent }]}>
                              {metadata.flowerItemType.charAt(0).toUpperCase() + metadata.flowerItemType.slice(1)}
                            </ThemedText>
                          </View>
                        )}
                        {metadata.vehicleType && (
                          <View style={[styles.metadataBadge, { backgroundColor: theme.accent + "15" }]}>
                            <EvendiIcon name="truck" size={10} color={theme.accent} />
                            <ThemedText style={[styles.metadataText, { color: theme.accent }]}>
                              {metadata.vehicleType.charAt(0).toUpperCase() + metadata.vehicleType.slice(1)}
                            </ThemedText>
                          </View>
                        )}
                        {metadata.passengerCapacity && (
                          <View style={[styles.metadataBadge, { backgroundColor: theme.accent + "15" }]}>
                            <EvendiIcon name="users" size={10} color={theme.accent} />
                            <ThemedText style={[styles.metadataText, { color: theme.accent }]}>
                              {metadata.passengerCapacity} plasser
                            </ThemedText>
                          </View>
                        )}
                        {metadata.serviceType && (
                          <View style={[styles.metadataBadge, { backgroundColor: theme.accent + "15" }]}>
                            <ThemedText style={[styles.metadataText, { color: theme.accent }]}>
                              {metadata.serviceType.charAt(0).toUpperCase() + metadata.serviceType.slice(1)}
                            </ThemedText>
                          </View>
                        )}
                        {metadata.includesTrialSession && (
                          <View style={[styles.metadataBadge, { backgroundColor: "#9C27B015" }]}>
                            <EvendiIcon name="check" size={10} color="#9C27B0" />
                            <ThemedText style={[styles.metadataText, { color: "#9C27B0" }]}>Prøveskyss</ThemedText>
                          </View>
                        )}
                        
                        {/* Fotograf metadata */}
                        {metadata.packageType && metadata.hoursIncluded && (
                          <View style={[styles.metadataBadge, { backgroundColor: "#2196F315" }]}>
                            <EvendiIcon name="camera" size={10} color="#2196F3" />
                            <ThemedText style={[styles.metadataText, { color: "#2196F3" }]}>
                              {metadata.packageType} - {metadata.hoursIncluded}t
                            </ThemedText>
                          </View>
                        )}
                        {metadata.photosDelivered && (
                          <View style={[styles.metadataBadge, { backgroundColor: "#2196F315" }]}>
                            <EvendiIcon name="image" size={10} color="#2196F3" />
                            <ThemedText style={[styles.metadataText, { color: "#2196F3" }]}>
                              {metadata.photosDelivered} bilder
                            </ThemedText>
                          </View>
                        )}
                        {metadata.printRightsIncluded && (
                          <View style={[styles.metadataBadge, { backgroundColor: "#00BCD415" }]}>
                            <EvendiIcon name="printer" size={10} color="#00BCD4" />
                            <ThemedText style={[styles.metadataText, { color: "#00BCD4" }]}>Trykkerett</ThemedText>
                          </View>
                        )}
                        
                        {/* Videograf metadata */}
                        {metadata.filmDurationMinutes && (
                          <View style={[styles.metadataBadge, { backgroundColor: "#9C27B015" }]}>
                            <EvendiIcon name="film" size={10} color="#9C27B0" />
                            <ThemedText style={[styles.metadataText, { color: "#9C27B0" }]}>
                              {metadata.filmDurationMinutes} min
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
                            <EvendiIcon name="navigation" size={10} color="#FF9800" />
                            <ThemedText style={[styles.metadataText, { color: "#FF9800" }]}>Drone</ThemedText>
                          </View>
                        )}
                        
                        {/* Musikk metadata */}
                        {metadata.performanceType && (
                          <View style={[styles.metadataBadge, { backgroundColor: "#E91E6315" }]}>
                            <EvendiIcon name="music" size={10} color="#E91E63" />
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
                          <View style={[styles.metadataBadge, { backgroundColor: theme.accent + "15" }]}>
                            <EvendiIcon name="clock" size={10} color={theme.accent} />
                            <ThemedText style={[styles.metadataText, { color: theme.accent }]}>
                              {metadata.performanceDurationHours}t
                            </ThemedText>
                          </View>
                        )}
                        {metadata.equipmentIncluded && (
                          <View style={[styles.metadataBadge, { backgroundColor: "#FF572215" }]}>
                            <EvendiIcon name="headphones" size={10} color="#FF5722" />
                            <ThemedText style={[styles.metadataText, { color: "#FF5722" }]}>Utstyr</ThemedText>
                          </View>
                        )}
                        
                        {/* Venue metadata */}
                        {metadata.capacityMax && (
                          <View style={[styles.metadataBadge, { backgroundColor: "#79554815" }]}>
                            <EvendiIcon name="users" size={10} color="#795548" />
                            <ThemedText style={[styles.metadataText, { color: "#795548" }]}>
                              {metadata.capacityMin && `${metadata.capacityMin}-`}{metadata.capacityMax} gjester
                            </ThemedText>
                          </View>
                        )}
                        {metadata.indoorOutdoor && (
                          <View style={[styles.metadataBadge, { backgroundColor: theme.accent + "15" }]}>
                            <EvendiIcon name="home" size={10} color={theme.accent} />
                            <ThemedText style={[styles.metadataText, { color: theme.accent }]}>
                              {metadata.indoorOutdoor.charAt(0).toUpperCase() + metadata.indoorOutdoor.slice(1)}
                            </ThemedText>
                          </View>
                        )}
                        {metadata.cateringIncluded && (
                          <View style={[styles.metadataBadge, { backgroundColor: "#8BC34A15" }]}>
                            <EvendiIcon name="coffee" size={10} color="#8BC34A" />
                            <ThemedText style={[styles.metadataText, { color: "#8BC34A" }]}>Catering</ThemedText>
                          </View>
                        )}
                        
                        {/* Planlegger metadata */}
                        {metadata.serviceLevel && (
                          <View style={[styles.metadataBadge, { backgroundColor: "#00BCD415" }]}>
                            <EvendiIcon name="clipboard" size={10} color="#00BCD4" />
                            <ThemedText style={[styles.metadataText, { color: "#00BCD4" }]}>
                              {metadata.serviceLevel.charAt(0).toUpperCase() + metadata.serviceLevel.slice(1)}
                            </ThemedText>
                          </View>
                        )}
                        {metadata.monthsOfService && (
                          <View style={[styles.metadataBadge, { backgroundColor: theme.accent + "15" }]}>
                            <EvendiIcon name="calendar" size={10} color={theme.accent} />
                            <ThemedText style={[styles.metadataText, { color: theme.accent }]}>
                              {metadata.monthsOfService} mnd
                            </ThemedText>
                          </View>
                        )}
                        {metadata.vendorCoordinationIncluded && (
                          <View style={[styles.metadataBadge, { backgroundColor: "#00968815" }]}>
                            <EvendiIcon name="users" size={10} color="#009688" />
                            <ThemedText style={[styles.metadataText, { color: "#009688" }]}>Koordinering</ThemedText>
                          </View>
                        )}
                      </View>
                    )}

                    {/* Venue-specific details */}
                    {product.categoryTag === 'venue' && (product.venueMaxGuests || product.venueAddress) && (
                      <View style={[styles.venueDetailsBox, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                        {product.venueMaxGuests && (
                          <View style={styles.venueDetailRow}>
                            <EvendiIcon name="users" size={14} color={theme.accent} />
                            <ThemedText style={[Typography.small, { flex: 1, marginLeft: Spacing.xs }]}>
                              Kapasitet: {product.venueMinGuests ? `${product.venueMinGuests}-${product.venueMaxGuests}` : `Opptil ${product.venueMaxGuests}`} gjester
                            </ThemedText>
                          </View>
                        )}
                        {product.venueAddress && (
                          <View style={styles.venueDetailRow}>
                            <EvendiIcon name="map-pin" size={14} color={theme.accent} />
                            <ThemedText style={[Typography.small, { flex: 1, marginLeft: Spacing.xs }]} numberOfLines={1}>
                              {product.venueAddress}
                            </ThemedText>
                          </View>
                        )}
                        <View style={styles.venueBadgesRow}>
                          {product.venueCateringIncluded && (
                            <View style={[styles.venueBadge, { backgroundColor: "#4CAF5020" }]}>
                              <EvendiIcon name="coffee" size={10} color="#4CAF50" />
                              <ThemedText style={[styles.metadataText, { color: "#4CAF50" }]}>Servering inkludert</ThemedText>
                            </View>
                          )}
                          {product.venueAccommodationAvailable && (
                            <View style={[styles.venueBadge, { backgroundColor: "#2196F320" }]}>
                              <EvendiIcon name="home" size={10} color="#2196F3" />
                              <ThemedText style={[styles.metadataText, { color: "#2196F3" }]}>Overnatting tilgjengelig</ThemedText>
                            </View>
                          )}
                          {product.venueCheckoutTime && (
                            <View style={[styles.venueBadge, { backgroundColor: theme.accent + "20" }]}>
                              <EvendiIcon name="clock" size={10} color={theme.accent} />
                              <ThemedText style={[styles.metadataText, { color: theme.accent }]}>Utsjekk: {product.venueCheckoutTime}</ThemedText>
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  </Card>
                );
              })}
            </>
          )}
          
          <Card style={styles.ratingCard}>
            <View style={styles.ratingMain}>
              <ThemedText style={[Typography.h1, { color: theme.accent }]}>
                {data?.stats.average || 0}
              </ThemedText>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <EvendiIcon
                    key={star}
                    name="star"
                    size={18}
                    color={star <= (data?.stats.average || 0) ? theme.accent : theme.border}
                  />
                ))}
              </View>
              <ThemedText style={[Typography.caption, { opacity: 0.6 }]}>
                {data?.stats.count || 0} anmeldelser
              </ThemedText>
            </View>
          </Card>

          {data?.googleReviewUrl ? (
            <Pressable
              style={[styles.googleButton, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
              onPress={handleOpenGoogle}
            >
              <EvendiIcon name="external-link" size={18} color={theme.accent} />
              <ThemedText style={[Typography.body, { marginLeft: Spacing.sm, color: theme.accent }]}>
                Se anmeldelser på Google
              </ThemedText>
            </Pressable>
          ) : null}

          <ThemedText style={[Typography.h3, { marginTop: Spacing.xl, marginBottom: Spacing.md }]}>
            Anmeldelser
          </ThemedText>

          {data?.reviews && data.reviews.length > 0 ? (
            data.reviews.map((review) => (
              <Card key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View>
                    <ThemedText style={Typography.body}>{review.coupleName}</ThemedText>
                    <ThemedText style={[Typography.caption, { opacity: 0.6 }]}>
                      {formatDate(review.createdAt)}
                    </ThemedText>
                  </View>
                  <View style={styles.ratingBadge}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <EvendiIcon
                        key={star}
                        name="star"
                        size={14}
                        color={star <= review.rating ? theme.accent : theme.border}
                      />
                    ))}
                  </View>
                </View>
                {review.title ? (
                  <ThemedText style={[Typography.body, { fontWeight: "600", marginTop: Spacing.sm }]}>
                    {review.title}
                  </ThemedText>
                ) : null}
                {review.body ? (
                  <ThemedText style={[Typography.small, { opacity: 0.8, marginTop: Spacing.xs }]}>
                    {review.body}
                  </ThemedText>
                ) : null}
                {review.vendorResponse ? (
                  <View style={[styles.vendorResponse, { backgroundColor: theme.backgroundSecondary }]}>
                    <ThemedText style={[Typography.caption, { color: theme.accent, fontWeight: "600", marginBottom: Spacing.xs }]}>
                      Svar fra leverandør
                    </ThemedText>
                    <ThemedText style={Typography.small}>{review.vendorResponse.body}</ThemedText>
                  </View>
                ) : null}
              </Card>
            ))
          ) : (
            <Card style={styles.emptyCard}>
              <EvendiIcon name="star" size={32} color={theme.textSecondary} />
              <ThemedText style={[Typography.body, { opacity: 0.7, marginTop: Spacing.md, textAlign: "center" }]}>
                Ingen anmeldelser ennå
              </ThemedText>
            </Card>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  vendorImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  ratingCard: {
    marginTop: Spacing.lg,
    alignItems: "center",
    paddingVertical: Spacing.lg,
  },
  ratingMain: {
    alignItems: "center",
  },
  starsRow: {
    flexDirection: "row",
    gap: 4,
    marginTop: Spacing.xs,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.lg,
  },
  reviewCard: {
    marginBottom: Spacing.md,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  ratingBadge: {
    flexDirection: "row",
    gap: 2,
  },
  vendorResponse: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  errorCard: {
    alignItems: "center",
    paddingVertical: Spacing.xl,
  },
  productCard: {
    marginBottom: Spacing.md,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.xs,
  },
  metadataRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: Spacing.sm,
  },
  metadataBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  metadataText: {
    fontSize: 11,
    fontWeight: "600",
  },
  venueDetailsBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  venueDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  venueBadgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: Spacing.xs,
  },
  venueBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  actionBar: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  actionButtonOutline: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  actionButtonOutlineText: {
    fontSize: 14,
    fontWeight: "700",
  },
  // Travel card styles
  travelCard: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    width: "100%",
    gap: Spacing.sm,
  },
  travelCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  travelCardLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  travelCardText: {
    fontSize: 13,
  },
  travelCardBold: {
    fontSize: 16,
    fontWeight: "700",
  },
  travelCardFrom: {
    fontSize: 11,
    fontStyle: "italic",
  },
  travelCardDetails: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  travelDetailBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  travelDetailText: {
    fontSize: 11,
    fontWeight: "600",
  },
  travelCardActions: {
    flexDirection: "row",
    gap: 8,
  },
  travelActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
  },
  travelActionText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
