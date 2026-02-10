import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Pressable,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EvendiIcon } from "@/components/EvendiIcon";
import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { showToast } from "@/lib/toast";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

interface SiteVisit {
  id: string;
  coupleName: string;
  venueName: string;
  siteVisitDate: string;
  siteVisitTime: string | null;
  address: string | null;
  maxGuests: number | null;
  invitedGuests: number | null;
  status: string;
  notes: string | null;
  weddingDate: string | null;
  email: string;
}

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export default function VendorSiteVisitsScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: siteVisits = [], isLoading, refetch } = useQuery<SiteVisit[]>({
    queryKey: ["/api/vendor/site-visits"],
    queryFn: async () => {
      const sessionData = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
      if (!sessionData) return [];
      const session = JSON.parse(sessionData);
      const response = await fetch(new URL("/api/vendor/site-visits", getApiUrl()).toString(), {
        headers: { Authorization: `Bearer ${session.sessionToken}` },
      });
      if (!response.ok) throw new Error("Kunne ikke hente befaringer");
      return response.json();
    },
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const openEmail = async (email: string) => {
    try {
      const mailUrl = `mailto:${email}`;
      const canOpen = await Linking.canOpenURL(mailUrl);
      if (!canOpen) {
        showToast("E-postklienten er ikke tilgjengelig.");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      await Linking.openURL(mailUrl);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Could not open email", error);
      showToast("Noe gikk galt. Prov igjen.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const openMap = async (address: string) => {
    try {
      const encodedAddress = encodeURIComponent(address);
      const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
      const canOpen = await Linking.canOpenURL(mapsUrl);
      if (!canOpen) {
        showToast("Karttjenesten er ikke tilgjengelig.");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }
      await Linking.openURL(mapsUrl);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Could not open map", error);
      showToast("Noe gikk galt. Prov igjen.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const formatDate = (dateStr: string) => {
    const parsed = new Date(dateStr);
    if (Number.isNaN(parsed.getTime())) return dateStr;
    return parsed.toLocaleDateString("nb-NO", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "#10b981";
      case "booked": return "#f59e0b";
      default: return theme.textSecondary;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed": return "Bekreftet";
      case "booked": return "Booket";
      default: return "Vurderes";
    }
  };

  const renderSiteVisit = ({ item, index }: { item: SiteVisit; index: number }) => {
    const statusColor = getStatusColor(item.status);
    const address = item.address;

    return (
      <Animated.View entering={FadeInDown.duration(300).delay(index * 50)}>
        <View
          style={[
            styles.visitCard,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
        >
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.coupleName, { color: theme.text }]}>
                {item.coupleName}
              </ThemedText>
              <ThemedText style={[styles.venueName, { color: theme.textSecondary }]}>
                {item.venueName}
              </ThemedText>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + "20", borderColor: statusColor }]}>
              <ThemedText style={[styles.statusText, { color: statusColor }]}>
                {getStatusLabel(item.status)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.visitInfo}>
            <View style={styles.infoRow}>
              <EvendiIcon name="calendar" size={14} color={theme.accent} />
              <ThemedText style={[styles.infoText, { color: theme.text }]}>
                {formatDate(item.siteVisitDate)}
                {item.siteVisitTime && ` kl. ${item.siteVisitTime}`}
              </ThemedText>
            </View>

            {item.weddingDate && (
              <View style={styles.infoRow}>
                <EvendiIcon name="heart" size={14} color={theme.textSecondary} />
                <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>
                  Arrangement: {formatDate(item.weddingDate)}
                </ThemedText>
              </View>
            )}

            {address && (
              <Pressable
                onPress={() => openMap(address)}
                style={({ pressed }) => [
                  styles.infoRow,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <EvendiIcon name="map-pin" size={14} color={theme.textSecondary} />
                <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>
                  {address}
                </ThemedText>
              </Pressable>
            )}

            {(item.invitedGuests || item.maxGuests) && (
              <View style={styles.infoRow}>
                <EvendiIcon name="users" size={14} color={theme.textSecondary} />
                <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>
                  {item.invitedGuests ? `${item.invitedGuests} gjester` : `Opptil ${item.maxGuests} gjester`}
                </ThemedText>
              </View>
            )}

            {item.notes && (
              <View style={[styles.notesBox, { backgroundColor: theme.backgroundSecondary }]}>
                <ThemedText style={[styles.notesText, { color: theme.textSecondary }]}>
                  {item.notes}
                </ThemedText>
              </View>
            )}
          </View>

          <Pressable
            onPress={() => openEmail(item.email)}
            style={[styles.contactButton, { backgroundColor: theme.accent }]}
          >
            <EvendiIcon name="mail" size={16} color="#FFFFFF" />
            <ThemedText style={styles.contactButtonText}>Kontakt kunde</ThemedText>
          </Pressable>
        </View>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.dark.accent} />
        <ThemedText style={[styles.loadingText, { color: theme.textMuted }]}>
          Laster befaringer...
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
            <EvendiIcon name="calendar" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.headerTextContainer}>
            <ThemedText style={[styles.headerTitle, { color: theme.text }]}>
              Planlagte befaringer
            </ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              {siteVisits.length} {siteVisits.length === 1 ? 'befaring' : 'befaringer'}
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

      {siteVisits.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconCircle, { backgroundColor: theme.accent + "15" }]}>
            <EvendiIcon name="calendar" size={40} color={theme.accent} />
          </View>
          <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
            Ingen planlagte befaringer
          </ThemedText>
          <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
            Når kunder booker befaring hos dere, vil de vises her
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={siteVisits}
          renderItem={renderSiteVisit}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + Spacing.xl },
          ]}
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
  visitCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  coupleName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  venueName: {
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
  },
  visitInfo: {
    gap: Spacing.xs,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  infoText: {
    fontSize: 13,
    flex: 1,
  },
  notesBox: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xs,
  },
  notesText: {
    fontSize: 12,
    lineHeight: 18,
  },
  contactButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
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
});
