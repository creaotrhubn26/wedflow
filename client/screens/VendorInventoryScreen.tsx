import React, { useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { EvendiIcon } from "@/components/EvendiIcon";
import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

interface VendorProduct {
  id: string;
  title: string;
  description: string | null;
  unitPrice: number;
  unitType: string;
  trackInventory: boolean;
  availableQuantity: number | null;
  reservedQuantity: number;
  bookingBuffer: number;
  categoryTag: string | null;
  // Venue-specific fields
  venueAddress?: string | null;
  venueMaxGuests?: number | null;
  venueMinGuests?: number | null;
  venueCateringIncluded?: boolean;
  venueAccommodationAvailable?: boolean;
  venueCheckoutTime?: string | null;
}

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList>;
}

export default function VendorInventoryScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: products = [], isLoading, refetch } = useQuery<VendorProduct[]>({
    queryKey: ["/api/vendor/products"],
    queryFn: async () => {
      const sessionData = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
      if (!sessionData) return [];
      const session = JSON.parse(sessionData);
      const response = await fetch(new URL("/api/vendor/products", getApiUrl()).toString(), {
        headers: { Authorization: `Bearer ${session.sessionToken}` },
      });
      if (!response.ok) throw new Error("Kunne ikke hente produkter");
      return response.json();
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const inventoryProducts = products.filter(p => p.trackInventory);

  const getStatusColor = (available: number, total: number) => {
    const percentage = (available / total) * 100;
    if (percentage > 30) return "#4CAF50";
    if (percentage > 10) return "#FF9800";
    return "#F44336";
  };

  const inventorySummary = useMemo(() => {
    return inventoryProducts.reduce(
      (acc, product) => {
        const total = product.availableQuantity || 0;
        const available = Math.max(total - product.bookingBuffer, 0);
        acc.totalStock += total;
        acc.totalAvailable += available;
        acc.totalBuffer += product.bookingBuffer;
        acc.totalReserved += product.reservedQuantity || 0;
        return acc;
      },
      { totalStock: 0, totalAvailable: 0, totalBuffer: 0, totalReserved: 0 }
    );
  }, [inventoryProducts]);

  const renderProductCard = ({ item, index }: { item: VendorProduct; index: number }) => {
    const total = item.availableQuantity || 0;
    const available = Math.max(total - item.bookingBuffer, 0);
    const percentage = total > 0 ? (available / total) * 100 : 0;
    const statusColor = getStatusColor(available, total);
    const warningPercent = percentage;
    const warningColor = statusColor;
    const isLowStock = total > 0 && warningPercent <= 10;

    return (
      <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
        <Pressable
          onPress={() => navigation.navigate("ProductCreate", { product: item })}
          style={({ pressed }) => [
            styles.productCard,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconCircle, { backgroundColor: statusColor + "20" }]}>
              <EvendiIcon name="package" size={20} color={statusColor} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.productTitle, { color: theme.text }]}>
                {item.title}
              </ThemedText>
              <ThemedText style={[styles.productType, { color: theme.textMuted }]}>
                {(item.unitPrice / 100).toLocaleString("nb-NO")} kr / {item.unitType}
              </ThemedText>
            </View>
            <EvendiIcon name="chevron-right" size={20} color={theme.textMuted} />
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <ThemedText style={[styles.statLabel, { color: theme.textMuted }]}>
                Opprinnelig
              </ThemedText>
              <ThemedText style={[styles.statValue, { color: theme.textMuted }]}>
                {total + item.bookingBuffer}
              </ThemedText>
            </View>

            <View style={styles.statBox}>
              <ThemedText style={[styles.statLabel, { color: theme.textMuted }]}>
                Buffer
              </ThemedText>
              <ThemedText style={[styles.statValue, { color: theme.textMuted }]}>
                {item.bookingBuffer}
              </ThemedText>
            </View>

            <View style={styles.statBox}>
              <ThemedText style={[styles.statLabel, { color: theme.textMuted }]}>
                Tilgjengelig
              </ThemedText>
              <ThemedText style={[styles.statValue, { color: statusColor }]}>
                {total}
              </ThemedText>
            </View>

            <View style={styles.statBox}>
              <ThemedText style={[styles.statLabel, { color: theme.textMuted }]}>
                Max/dato
              </ThemedText>
              <ThemedText style={[styles.statValue, { color: statusColor }]}>
                {available}
              </ThemedText>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBarBg, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.progressBarFill,
                  {
                    backgroundColor: statusColor,
                    width: `${percentage}%`,
                  },
                ]}
              />
            </View>
            <ThemedText style={[styles.progressText, { color: theme.textMuted }]}>
              {percentage.toFixed(0)}% tilgjengelig
            </ThemedText>
          </View>

          {isLowStock && (
            <View style={[styles.warningBadge, { backgroundColor: warningColor + "20" }]}> 
              <EvendiIcon name="alert-triangle" size={14} color={warningColor} />
              <ThemedText style={[styles.warningText, { color: warningColor }]}>
                Lav beholdning
              </ThemedText>
            </View>
          )}

          {/* Venue-specific details */}
          {item.categoryTag && item.categoryTag.toLowerCase() === "venue" && (item.venueMaxGuests || item.venueAddress) && (
            <View style={[styles.venueDetailsBox, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
              {item.venueMaxGuests && (
                <View style={styles.venueDetailRow}>
                  <EvendiIcon name="users" size={14} color={theme.accent} />
                  <ThemedText style={[styles.venueDetailText, { color: theme.text }]}>
                    {item.venueMinGuests ? `${item.venueMinGuests}-${item.venueMaxGuests}` : `Opptil ${item.venueMaxGuests}`} gjester
                  </ThemedText>
                </View>
              )}
              {item.venueAddress && (
                <View style={styles.venueDetailRow}>
                  <EvendiIcon name="map-pin" size={14} color={theme.accent} />
                  <ThemedText style={[styles.venueDetailText, { color: theme.text }]} numberOfLines={1}>
                    {item.venueAddress}
                  </ThemedText>
                </View>
              )}
              <View style={styles.venueBadgesRow}>
                {item.venueCateringIncluded && (
                  <View style={[styles.venueBadge, { backgroundColor: "#4CAF50" + "20" }]}>
                    <ThemedText style={[styles.venueBadgeText, { color: "#4CAF50" }]}>
                      Servering
                    </ThemedText>
                  </View>
                )}
                {item.venueAccommodationAvailable && (
                  <View style={[styles.venueBadge, { backgroundColor: "#2196F3" + "20" }]}>
                    <ThemedText style={[styles.venueBadgeText, { color: "#2196F3" }]}>
                      Overnatting
                    </ThemedText>
                  </View>
                )}
                {item.venueCheckoutTime && (
                  <View style={[styles.venueBadge, { backgroundColor: theme.accent + "20" }]}>
                    <ThemedText style={[styles.venueBadgeText, { color: theme.accent }]}>
                      Ut: {item.venueCheckoutTime}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          )}

          <View style={[styles.infoBox, { backgroundColor: theme.accent + "12", borderColor: theme.accent + "30" }]}>
            <EvendiIcon name="info" size={14} color={theme.accent} />
            <ThemedText style={[styles.infoText, { color: theme.text, flex: 1, marginLeft: Spacing.xs }]}>
              Tilgjengelighet sjekkes automatisk per arrangementsdato ved tilbudopprettelse
            </ThemedText>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.dark.accent} />
        <ThemedText style={[styles.loadingText, { color: theme.textMuted }]}>
          Laster lagerbeholdning...
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View
        style={[
          styles.header,
          {
            paddingTop: insets.top + Spacing.md,
            backgroundColor: theme.backgroundDefault,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <View style={[styles.headerIconCircle, { backgroundColor: Colors.dark.accent }]}>
            <EvendiIcon name="package" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.headerTextContainer}>
            <ThemedText style={[styles.headerTitle, { color: theme.text }]}>
              Lagerstyring
            </ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              {inventoryProducts.length} {inventoryProducts.length === 1 ? 'produkt' : 'produkter'} med tracking
            </ThemedText>
          </View>
        </View>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.closeButton,
            { backgroundColor: pressed ? theme.backgroundSecondary : "transparent" },
          ]}
        >
          <EvendiIcon name="x" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>

      {inventoryProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconCircle, { backgroundColor: theme.accent + "15" }]}>
            <EvendiIcon name="package" size={40} color={theme.accent} />
          </View>
          <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
            Ingen produkter med lagerstyring
          </ThemedText>
          <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
            Aktiver lagerstyring på dine produkter for å holde oversikt over tilgjengelig antall
          </ThemedText>
          <Pressable
            onPress={() => navigation.navigate("VendorDashboard")}
            style={({ pressed }) => [
              styles.emptyButton,
              {
                backgroundColor: theme.accent,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <EvendiIcon name="plus" size={18} color="#FFFFFF" />
            <ThemedText style={styles.emptyButtonText}>Gå til produkter</ThemedText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={inventoryProducts}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <Card elevation={2} style={{ ...styles.summaryCard, borderColor: theme.border }}> 
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <ThemedText style={[styles.summaryLabel, { color: theme.textMuted }]}>Totalt</ThemedText>
                  <ThemedText style={[styles.summaryValue, { color: theme.text }]}> 
                    {inventorySummary.totalStock}
                  </ThemedText>
                </View>
                <View style={styles.summaryItem}>
                  <ThemedText style={[styles.summaryLabel, { color: theme.textMuted }]}>Tilgjengelig</ThemedText>
                  <ThemedText style={[styles.summaryValue, { color: theme.text }]}> 
                    {inventorySummary.totalAvailable}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <ThemedText style={[styles.summaryLabel, { color: theme.textMuted }]}>Buffer</ThemedText>
                  <ThemedText style={[styles.summaryValue, { color: theme.text }]}> 
                    {inventorySummary.totalBuffer}
                  </ThemedText>
                </View>
                <View style={styles.summaryItem}>
                  <ThemedText style={[styles.summaryLabel, { color: theme.textMuted }]}>Reservert</ThemedText>
                  <ThemedText style={[styles.summaryValue, { color: theme.text }]}> 
                    {inventorySummary.totalReserved}
                  </ThemedText>
                </View>
              </View>
            </Card>
          }
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
          scrollIndicatorInsets={{ top: headerHeight, bottom: insets.bottom }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.dark.accent}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: Spacing.md, fontSize: 14 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: { flex: 1 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  summaryCard: {
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 4,
  },
  productCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  productTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  productType: {
    fontSize: 13,
  },
  statsContainer: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  progressBarContainer: {
    marginBottom: Spacing.sm,
  },
  progressBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: Spacing.xs,
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    textAlign: "center",
  },
  warningBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  warningText: {
    fontSize: 12,
    fontWeight: "600",
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  infoText: {
    fontSize: 11,
    lineHeight: 16,
  },
  venueDetailsBox: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.xs,
  },
  venueDetailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  venueDetailText: {
    fontSize: 13,
    flex: 1,
  },
  venueBadgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  venueBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  venueBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
    maxWidth: 300,
    lineHeight: 22,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
