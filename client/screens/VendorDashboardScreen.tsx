import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Clipboard from "expo-clipboard";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

interface VendorSession {
  sessionToken: string;
  vendorId: string;
  email: string;
  businessName: string;
}

interface DeliveryItem {
  id: string;
  type: string;
  label: string;
  url: string;
  description: string | null;
}

interface Delivery {
  id: string;
  coupleName: string;
  coupleEmail: string | null;
  accessCode: string;
  title: string;
  description: string | null;
  weddingDate: string | null;
  status: string;
  createdAt: string;
  items: DeliveryItem[];
}

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export default function VendorDashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [session, setSession] = useState<VendorSession | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    const sessionData = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
    if (sessionData) {
      setSession(JSON.parse(sessionData));
    } else {
      navigation.replace("VendorLogin");
    }
  };

  const { data: deliveries = [], isLoading, refetch } = useQuery<Delivery[]>({
    queryKey: ["/api/vendor/deliveries"],
    queryFn: async () => {
      if (!session?.sessionToken) return [];
      const response = await fetch(new URL("/api/vendor/deliveries", getApiUrl()).toString(), {
        headers: {
          Authorization: `Bearer ${session.sessionToken}`,
        },
      });
      if (!response.ok) throw new Error("Kunne ikke hente leveranser");
      return response.json();
    },
    enabled: !!session?.sessionToken,
  });

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleLogout = async () => {
    Alert.alert(
      "Logg ut",
      "Er du sikker på at du vil logge ut?",
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Logg ut",
          style: "destructive",
          onPress: async () => {
            if (session?.sessionToken) {
              try {
                await fetch(new URL("/api/vendors/logout", getApiUrl()).toString(), {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${session.sessionToken}`,
                  },
                });
              } catch {
              }
            }
            await AsyncStorage.removeItem(VENDOR_STORAGE_KEY);
            queryClient.clear();
            navigation.replace("VendorLogin");
          },
        },
      ]
    );
  };

  const copyAccessCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Kopiert!", `Tilgangskode ${code} er kopiert.`);
  };

  const getTypeIcon = (type: string): keyof typeof Feather.glyphMap => {
    switch (type) {
      case "gallery": return "image";
      case "video": return "video";
      case "website": return "globe";
      case "download": return "download";
      case "contract": return "file-text";
      case "document": return "file";
      default: return "link";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const renderDeliveryItem = ({ item, index }: { item: Delivery; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <View style={[styles.deliveryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: Colors.dark.accent + "30" }]}>
              <ThemedText style={[styles.statusText, { color: Colors.dark.accent }]}>
                Aktiv
              </ThemedText>
            </View>
          </View>
          <ThemedText style={[styles.coupleName, { color: theme.textSecondary }]}>
            {item.coupleName}
          </ThemedText>
          {item.weddingDate ? (
            <View style={styles.dateRow}>
              <Feather name="calendar" size={12} color={theme.textMuted} />
              <ThemedText style={[styles.dateText, { color: theme.textMuted }]}>
                {item.weddingDate}
              </ThemedText>
            </View>
          ) : null}
        </View>

        <View style={[styles.accessCodeContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={styles.accessCodeLeft}>
            <ThemedText style={[styles.accessCodeLabel, { color: theme.textMuted }]}>Tilgangskode:</ThemedText>
            <ThemedText style={styles.accessCode}>{item.accessCode}</ThemedText>
          </View>
          <Pressable
            onPress={() => copyAccessCode(item.accessCode)}
            style={[styles.copyBtn, { backgroundColor: Colors.dark.accent + "20" }]}
          >
            <Feather name="copy" size={16} color={Colors.dark.accent} />
          </Pressable>
        </View>

        <View style={styles.itemsList}>
          {item.items.map((deliveryItem) => (
            <View key={deliveryItem.id} style={styles.itemRow}>
              <Feather name={getTypeIcon(deliveryItem.type)} size={14} color={theme.textSecondary} />
              <ThemedText style={[styles.itemLabel, { color: theme.textSecondary }]} numberOfLines={1}>
                {deliveryItem.label}
              </ThemedText>
            </View>
          ))}
        </View>

        <ThemedText style={[styles.createdAt, { color: theme.textMuted }]}>
          Opprettet {formatDate(item.createdAt)}
        </ThemedText>
      </View>
    </Animated.View>
  );

  if (!session) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.dark.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: headerHeight + Spacing.md }]}>
        <View style={styles.headerLeft}>
          <ThemedText style={styles.welcomeText}>Velkommen tilbake,</ThemedText>
          <ThemedText style={styles.businessName}>{session.businessName}</ThemedText>
        </View>
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Feather name="log-out" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>

      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          navigation.navigate("DeliveryCreate");
        }}
        style={[styles.createBtn, { backgroundColor: Colors.dark.accent }]}
      >
        <Feather name="plus" size={20} color="#1A1A1A" />
        <ThemedText style={styles.createBtnText}>Ny leveranse</ThemedText>
      </Pressable>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.accent} />
        </View>
      ) : (
        <FlatList
          data={deliveries}
          renderItem={renderDeliveryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.dark.accent}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Feather name="package" size={48} color={theme.textMuted} />
              <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
                Ingen leveranser ennå
              </ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: theme.textMuted }]}>
                Opprett din første leveranse for å dele innhold med brudepar
              </ThemedText>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    opacity: 0.7,
  },
  businessName: {
    fontSize: 20,
    fontWeight: "700",
  },
  logoutBtn: {
    padding: Spacing.sm,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: Spacing.xl * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  deliveryCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  cardHeader: {
    marginBottom: Spacing.md,
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
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
  coupleName: {
    fontSize: 14,
    marginTop: 2,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
  },
  accessCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  accessCodeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  accessCodeLabel: {
    fontSize: 13,
  },
  accessCode: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  copyBtn: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  itemsList: {
    gap: 4,
    marginBottom: Spacing.sm,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  itemLabel: {
    fontSize: 13,
    flex: 1,
  },
  createdAt: {
    fontSize: 12,
    textAlign: "right",
  },
});
