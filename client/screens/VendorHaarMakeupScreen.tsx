import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator, RefreshControl } from "react-native";
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
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getVendorConfig } from "@/lib/vendor-adapter";
import { showConfirm } from "@/lib/dialogs";

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

export default function VendorHaarMakeupScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<Navigation>();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const vendorConfig = getVendorConfig(null, "Hår & Makeup");

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
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundRoot }}
      contentContainerStyle={{ padding: Spacing.lg, paddingBottom: Spacing.xl + insets.bottom }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={theme.accent}
        />
      }
    >
      <ThemedText style={[styles.title, { color: theme.text }]}>Hår & makeup dashboard</ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>Tilby styling-pakker, oppdater showcase og send tilbud.</ThemedText>

      <View style={styles.cardRow}>
        <Pressable
          onPress={goToProducts}
          style={({ pressed }) => [
            styles.card,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            pressed && { backgroundColor: theme.backgroundSecondary },
          ]}
        >
          <View style={styles.cardHeader}>
            <ThemedText style={[styles.cardTitle, { color: theme.text }]}>Pakker</ThemedText>
            <EvendiIcon name="shopping-bag" size={18} color={theme.textSecondary} />
          </View>
          <ThemedText style={[styles.cardBody, { color: theme.textSecondary }]}>Lag pakker for styling, team og prøvetime.</ThemedText>
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
          <ThemedText style={[styles.cardBody, { color: theme.textSecondary }]}>Send tilbud med oppmøtetid og lokasjon.</ThemedText>
          <Button style={styles.cardButton} onPress={goToOffers}>Send tilbud</Button>
        </Pressable>
      </View>

      <View style={[styles.infoBox, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <EvendiIcon name="info" size={16} color={theme.textSecondary} />
        <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>Hold showcase oppdatert med nye looks for mer synlighet.</ThemedText>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={[styles.cardTitle, { color: theme.text }]}>Produkter</ThemedText>
          {productsLoading ? <ActivityIndicator size="small" color={theme.accent} /> : null}
        </View>
        {products.length === 0 ? (
          <View style={styles.emptyRow}>
            <EvendiIcon name="shopping-bag" size={18} color={theme.accent} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>{vendorConfig.emptyStates.products.title}</ThemedText>
              <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>{vendorConfig.emptyStates.products.subtitle}</ThemedText>
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
              <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>Ingen tilbud</ThemedText>
              <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Send et tilbud basert på meny.</ThemedText>
            </View>
            <Button onPress={goToOffers}>Send</Button>
          </View>
        ) : (
          offers.map((o, idx) => (
            <Animated.View key={o.id} entering={FadeInDown.delay(idx * 30)}>
              <SwipeableRow onDelete={() => handleDelete(o.id, 'offer')}>
                <Pressable onPress={goToOffers} style={[styles.listRow, { borderBottomColor: theme.border }]}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ color: theme.text, fontWeight: "600" }}>{o.title}</ThemedText>
                    <ThemedText style={{ color: theme.textSecondary, fontSize: 13 }}>{o.status} • {o.totalAmount}{o.currency ? ` ${o.currency}` : ""}</ThemedText>
                  </View>
                  <EvendiIcon name="chevron-right" size={18} color={theme.textSecondary} />
                </Pressable>
              </SwipeableRow>
            </Animated.View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 15,
    marginBottom: Spacing.lg,
  },
  cardRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    flexWrap: "wrap",
  },
  card: {
    flex: 1,
    minWidth: 160,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  cardBody: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  cardButton: {
    alignSelf: "flex-start",
    marginTop: Spacing.xs,
  },
  infoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    padding: Spacing.md,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
  },
  sectionCard: {
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  emptyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontWeight: "600",
    fontSize: 14,
  },
  emptySubtitle: {
    fontSize: 13,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#00000010",
    gap: Spacing.sm,
  },
  chevronBtn: {
    padding: Spacing.xs,
  },
});
