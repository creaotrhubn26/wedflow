import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ActivityIndicator,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { EvendiIcon, type EvendiIconName } from "@/components/EvendiIcon";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { PlanningStackParamList } from "@/navigation/PlanningStackNavigator";
import { getApiUrl } from "@/lib/query-client";
import type { VendorSuggestion } from "@/hooks/useVendorSearch";
import { showToast } from "@/lib/toast";

const COUPLE_STORAGE_KEY = "wedflow_couple_session";

interface VendorActionBarProps {
  vendor: VendorSuggestion;
  /** Category slug for the vendorDetail screen (e.g., "florist", "beauty") */
  vendorCategory: string;
  /** Called when user taps "Fjern" (clear the selection) */
  onClear?: () => void;
  /** Icon for the category */
  icon?: EvendiIconName;
  /** Travel badge text (e.g., "15 min • 12 km") */
  travelBadge?: string | null;
  /** Whether travel info is loading */
  isTravelLoading?: boolean;
  /** Called when user taps "Kjørerute" (get directions) */
  onGetDirections?: () => void;
  /** Called when user taps "Vis på kart" (show on map) */
  onShowOnMap?: () => void;
  /** Called when user taps "Legg til tidslinje" (add to timeline) */
  onAddToTimeline?: () => void;
  /** Wedding venue name */
  venueName?: string | null;
  /** Fuel cost for the trip */
  fuelCostNok?: number | null;
}

/**
 * Action bar shown after a couple selects a registered vendor.
 * Provides "Se profil" (navigate to VendorDetail) and "Send melding" (start/resume chat).
 */
export function VendorActionBar({
  vendor,
  vendorCategory,
  onClear,
  icon = "briefcase",
  travelBadge,
  isTravelLoading,
  onGetDirections,
  onShowOnMap,
  onAddToTimeline,
  venueName,
  fuelCostNok,
}: VendorActionBarProps) {
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<PlanningStackParamList>>();
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const handleViewProfile = () => {
    navigation.navigate("VendorDetail", {
      vendorId: vendor.id,
      vendorName: vendor.businessName,
      vendorDescription: vendor.description || "",
      vendorLocation: vendor.location || "",
      vendorPriceRange: vendor.priceRange || "",
      vendorCategory,
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleStartChat = async () => {
    setIsSendingMessage(true);
    try {
      const sessionData = await AsyncStorage.getItem(COUPLE_STORAGE_KEY);
      if (!sessionData) {
        showToast("Du må logge inn som par for å sende meldinger.");
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
            vendorId: vendor.id,
            body: `Hei! Jeg er interessert i tjenestene deres.`,
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
        vendorName: vendor.businessName,
      });
    } catch (e: any) {
      showToast(e.message || "Kunne ikke starte samtale");
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(250)}
      style={[
        styles.container,
        {
          backgroundColor: theme.primary + "08",
          borderColor: theme.primary + "30",
        },
      ]}
    >
      {/* Selected vendor info */}
      <View style={styles.vendorRow}>
        <View style={[styles.vendorIcon, { backgroundColor: theme.primary + "15" }]}>
          <EvendiIcon name={icon} size={14} color={theme.primary} />
        </View>
        <View style={styles.vendorInfo}>
          <ThemedText style={[styles.vendorName, { color: theme.text }]} numberOfLines={1}>
            {vendor.businessName}
          </ThemedText>
          {vendor.location && (
            <View style={styles.metaRow}>
              <EvendiIcon name="map-pin" size={10} color={theme.textMuted} />
              <ThemedText style={[styles.metaText, { color: theme.textSecondary }]} numberOfLines={1}>
                {vendor.location}
              </ThemedText>
            </View>
          )}
        </View>
        <View style={[styles.matchedBadge, { backgroundColor: theme.primary + "15" }]}>
          <EvendiIcon name="check-circle" size={12} color={theme.primary} />
          <ThemedText style={[styles.matchedText, { color: theme.primary }]}>Registrert</ThemedText>
        </View>
      </View>

      {/* Travel info from venue */}
      {(travelBadge || isTravelLoading) && (
        <View style={[styles.travelInfoRow, { backgroundColor: "#2196F308", borderColor: "#2196F320" }]}>
          <EvendiIcon name="navigation" size={12} color="#2196F3" />
          {isTravelLoading ? (
            <>
              <ActivityIndicator size={10} color="#2196F3" />
              <ThemedText style={[styles.travelInfoText, { color: "#2196F3" }]}>
                Beregner reisetid...
              </ThemedText>
            </>
          ) : (
            <>
              <ThemedText style={[styles.travelInfoBold, { color: "#2196F3" }]}>
                {travelBadge}
              </ThemedText>
              {venueName && (
                <ThemedText style={[styles.travelInfoFrom, { color: theme.textMuted }]}>
                  fra {venueName}
                </ThemedText>
              )}
              {fuelCostNok != null && fuelCostNok > 0 && (
                <View style={[styles.fuelBadge, { backgroundColor: "#FF980015" }]}>
                  <EvendiIcon name="droplet" size={9} color="#FF9800" />
                  <ThemedText style={[styles.fuelText, { color: "#FF9800" }]}>
                    ~{Math.round(fuelCostNok)} kr
                  </ThemedText>
                </View>
              )}
            </>
          )}
        </View>
      )}

      {/* Action buttons */}
      <View style={styles.buttonsRow}>
        <Pressable
          onPress={handleViewProfile}
          style={[styles.profileButton, { borderColor: theme.primary }]}
        >
          <EvendiIcon name="user" size={14} color={theme.primary} />
          <ThemedText style={[styles.buttonText, { color: theme.primary }]}>Se profil</ThemedText>
        </Pressable>

        <Pressable
          onPress={handleStartChat}
          disabled={isSendingMessage}
          style={[styles.chatButton, { backgroundColor: theme.primary }]}
        >
          {isSendingMessage ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <EvendiIcon name="message-circle" size={14} color="#FFFFFF" />
              <ThemedText style={styles.chatButtonText}>Send melding</ThemedText>
            </>
          )}
        </Pressable>

        {onClear && (
          <Pressable
            onPress={() => {
              onClear();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            hitSlop={8}
            style={styles.clearButton}
          >
            <EvendiIcon name="x" size={16} color={theme.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Location quick links */}
      {(onGetDirections || onShowOnMap || onAddToTimeline) && vendor.location && (
        <View style={[styles.quickLinksRow, { borderTopColor: theme.border }]}>
          {onGetDirections && (
            <Pressable
              onPress={() => {
                onGetDirections();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[styles.quickLinkButton, { backgroundColor: "#2196F310" }]}
            >
              <EvendiIcon name="navigation" size={12} color="#2196F3" />
              <ThemedText style={[styles.quickLinkText, { color: "#2196F3" }]}>Kjørerute</ThemedText>
            </Pressable>
          )}
          {onShowOnMap && (
            <Pressable
              onPress={() => {
                onShowOnMap();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[styles.quickLinkButton, { backgroundColor: "#4CAF5010" }]}
            >
              <EvendiIcon name="map" size={12} color="#4CAF50" />
              <ThemedText style={[styles.quickLinkText, { color: "#4CAF50" }]}>Vis på kart</ThemedText>
            </Pressable>
          )}
          {onAddToTimeline && (
            <Pressable
              onPress={() => {
                onAddToTimeline();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[styles.quickLinkButton, { backgroundColor: "#FF980010" }]}
            >
              <EvendiIcon name="clock" size={12} color="#FF9800" />
              <ThemedText style={[styles.quickLinkText, { color: "#FF9800" }]}>Tidslinje</ThemedText>
            </Pressable>
          )}
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.sm,
    marginTop: 6,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  vendorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  vendorIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 13,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    marginTop: 1,
  },
  metaText: {
    fontSize: 11,
  },
  matchedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  matchedText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  profileButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
    borderWidth: 1.5,
  },
  chatButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    borderRadius: BorderRadius.sm,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "700",
  },
  chatButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  clearButton: {
    padding: 4,
  },
  travelInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  travelInfoText: {
    fontSize: 11,
  },
  travelInfoBold: {
    fontSize: 12,
    fontWeight: "700",
  },
  travelInfoFrom: {
    fontSize: 10,
    fontStyle: "italic",
    flex: 1,
  },
  fuelBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  fuelText: {
    fontSize: 9,
    fontWeight: "600",
  },
  quickLinksRow: {
    flexDirection: "row",
    gap: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
  },
  quickLinkButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  quickLinkText: {
    fontSize: 10,
    fontWeight: "600",
  },
});
