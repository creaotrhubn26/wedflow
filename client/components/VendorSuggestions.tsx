import React from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ActivityIndicator,
} from "react-native";
import Animated, { FadeInDown, FadeOutUp } from "react-native-reanimated";
import { EvendiIcon, type EvendiIconName } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import type { VendorSuggestion } from "@/hooks/useVendorSearch";
import type { VendorTravelInfo } from "@/hooks/useVendorLocationIntelligence";


interface VendorSuggestionsProps {
  suggestions: VendorSuggestion[];
  isLoading: boolean;
  onSelect: (vendor: VendorSuggestion) => void;
  /** Called when user taps "Se profil" on a vendor row */
  onViewProfile?: (vendor: VendorSuggestion) => void;
  /** Optional icon to show per result (defaults to "briefcase") */
  icon?: EvendiIconName;
  /** Travel badge text per vendor (vendorId → "15 min • 12 km") */
  travelBadges?: Record<string, string | null>;
  /** Travel info per vendor for loading states */
  travelInfoMap?: Record<string, VendorTravelInfo>;
  /** Called when user taps navigation icon on a suggestion */
  onNavigate?: (vendor: VendorSuggestion) => void;
  /** Wedding venue name for "fra …" label */
  venueName?: string | null;
}

/**
 * Dropdown list of vendor suggestions, rendered below a TextInput.
 * Shows matching vendors from the system with location and price range.
 */
export function VendorSuggestions({
  suggestions,
  isLoading,
  onSelect,
  onViewProfile,
  icon = "briefcase",
  travelBadges,
  travelInfoMap,
  onNavigate,
  venueName,
}: VendorSuggestionsProps) {
  const { theme } = useTheme();

  if (!isLoading && suggestions.length === 0) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(200)}
      exiting={FadeOutUp.duration(150)}
      style={[
        styles.container,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: theme.border,
          shadowColor: theme.text,
        },
      ]}
    >
      {isLoading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator size="small" color={theme.primary} />
          <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
            Søker leverandører...
          </ThemedText>
        </View>
      ) : (
        <>
          <View style={styles.headerRow}>
            <EvendiIcon name="check-circle" size={12} color={theme.primary} />
            <ThemedText style={[styles.headerText, { color: theme.primary }]}>
              {suggestions.length} registrert{suggestions.length !== 1 ? "e" : ""} leverandør{suggestions.length !== 1 ? "er" : ""}
            </ThemedText>
          </View>
          {suggestions.slice(0, 5).map((vendor, index) => (
            <Pressable
              key={vendor.id}
              onPress={() => {
                onSelect(vendor);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={({ pressed }) => [
                styles.row,
                {
                  backgroundColor: pressed
                    ? theme.primary + "10"
                    : theme.backgroundDefault,
                  borderTopColor: index > 0 ? theme.border : "transparent",
                  borderTopWidth: index > 0 ? StyleSheet.hairlineWidth : 0,
                },
              ]}
            >
              <View style={[styles.iconCircle, { backgroundColor: theme.primary + "15" }]}>
                <EvendiIcon name={icon} size={14} color={theme.primary} />
              </View>
              <View style={styles.info}>
                <ThemedText style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                  {vendor.businessName}
                </ThemedText>
                <View style={styles.meta}>
                  {vendor.location && (
                    <View style={styles.metaItem}>
                      <EvendiIcon name="map-pin" size={10} color={theme.textMuted} />
                      <ThemedText style={[styles.metaText, { color: theme.textSecondary }]} numberOfLines={1}>
                        {vendor.location}
                      </ThemedText>
                    </View>
                  )}
                  {vendor.priceRange && (
                    <View style={styles.metaItem}>
                      <EvendiIcon name="tag" size={10} color={theme.textMuted} />
                      <ThemedText style={[styles.metaText, { color: theme.textSecondary }]} numberOfLines={1}>
                        {vendor.priceRange}
                      </ThemedText>
                    </View>
                  )}
                </View>
                {/* Travel time badge from venue */}
                {travelBadges?.[vendor.id] && (
                  <View style={styles.travelRow}>
                    <EvendiIcon name="navigation" size={9} color="#2196F3" />
                    <ThemedText style={styles.travelText}>
                      {travelBadges[vendor.id]}
                    </ThemedText>
                    {venueName && (
                      <ThemedText style={[styles.travelFrom, { color: theme.textMuted }]} numberOfLines={1}>
                        fra {venueName}
                      </ThemedText>
                    )}
                  </View>
                )}
                {travelInfoMap?.[vendor.id]?.isLoading && (
                  <View style={styles.travelRow}>
                    <ActivityIndicator size={8} color="#2196F3" />
                    <ThemedText style={[styles.travelText, { color: theme.textMuted }]}>
                      Beregner reisetid...
                    </ThemedText>
                  </View>
                )}
              </View>
              <View style={styles.actions}>
                {onNavigate && vendor.location && (
                  <Pressable
                    onPress={() => {
                      onNavigate(vendor);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    hitSlop={6}
                    style={[styles.actionPill, { backgroundColor: "#2196F312" }]}
                  >
                    <EvendiIcon name="navigation" size={12} color="#2196F3" />
                  </Pressable>
                )}
                {onViewProfile && (
                  <Pressable
                    onPress={() => {
                      onViewProfile(vendor);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    hitSlop={6}
                    style={[styles.actionPill, { backgroundColor: theme.primary + "12" }]}
                  >
                    <EvendiIcon name="eye" size={12} color={theme.primary} />
                    <ThemedText style={[styles.actionPillText, { color: theme.primary }]}>Profil</ThemedText>
                  </Pressable>
                )}
                <EvendiIcon name="chevron-right" size={14} color={theme.textMuted} />
              </View>
            </Pressable>
          ))}
          {suggestions.length > 5 && (
            <View style={styles.moreRow}>
              <ThemedText style={[styles.moreText, { color: theme.textSecondary }]}>
                +{suggestions.length - 5} flere treff
              </ThemedText>
            </View>
          )}
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: 4,
    marginBottom: Spacing.sm,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: 6,
  },
  headerText: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: Spacing.md,
  },
  loadingText: {
    fontSize: 13,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: 10,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
  },
  meta: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  metaText: {
    fontSize: 11,
  },
  moreRow: {
    alignItems: "center",
    paddingVertical: 6,
  },
  moreText: {
    fontSize: 11,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  travelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  travelText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#2196F3",
  },
  travelFrom: {
    fontSize: 9,
    fontStyle: "italic",
    flex: 1,
  },
});
