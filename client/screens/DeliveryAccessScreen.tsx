import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";

import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

interface DeliveryItem {
  id: string;
  type: string;
  label: string;
  url: string;
  description: string | null;
}

interface DeliveryData {
  delivery: {
    id: string;
    coupleName: string;
    title: string;
    description: string | null;
    weddingDate: string | null;
    items: DeliveryItem[];
  };
  vendor: {
    businessName: string;
    categoryId: string | null;
  };
}

export default function DeliveryAccessScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [accessCode, setAccessCode] = useState("");
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);

  const fetchMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        new URL(`/api/deliveries/${accessCode.toUpperCase()}`, getApiUrl()).toString()
      );
      if (!response.ok) {
        throw new Error("Leveranse ikke funnet");
      }
      return response.json();
    },
    onSuccess: (data) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDeliveryData(data);
    },
    onError: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Ikke funnet", "Ingen leveranse funnet med denne koden. Sjekk at du har skrevet riktig.");
    },
  });

  const handleFetch = () => {
    if (!accessCode.trim()) {
      Alert.alert("Mangler kode", "Skriv inn tilgangskoden du har fått.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    fetchMutation.mutate();
  };

  const openLink = async (url: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await WebBrowser.openBrowserAsync(url);
    } catch {
      Linking.openURL(url);
    }
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

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case "gallery": return "Bildegalleri";
      case "video": return "Video";
      case "website": return "Nettside";
      case "download": return "Nedlasting";
      case "contract": return "Kontrakt";
      case "document": return "Dokument";
      default: return "Lenke";
    }
  };

  if (deliveryData) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
          ]}
        >
          <View style={[styles.vendorBadge, { backgroundColor: Colors.dark.accent + "20" }]}>
            <Feather name="camera" size={16} color={Colors.dark.accent} />
            <ThemedText style={[styles.vendorName, { color: Colors.dark.accent }]}>
              {deliveryData.vendor.businessName}
            </ThemedText>
          </View>

          <ThemedText style={styles.deliveryTitle}>{deliveryData.delivery.title}</ThemedText>
          <ThemedText style={[styles.coupleName, { color: theme.textSecondary }]}>
            Til {deliveryData.delivery.coupleName}
          </ThemedText>

          {deliveryData.delivery.weddingDate ? (
            <View style={styles.dateRow}>
              <Feather name="calendar" size={14} color={theme.textMuted} />
              <ThemedText style={[styles.dateText, { color: theme.textMuted }]}>
                {deliveryData.delivery.weddingDate}
              </ThemedText>
            </View>
          ) : null}

          {deliveryData.delivery.description ? (
            <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
              {deliveryData.delivery.description}
            </ThemedText>
          ) : null}

          <View style={styles.itemsContainer}>
            <ThemedText style={[styles.itemsTitle, { color: theme.textMuted }]}>
              Ditt innhold
            </ThemedText>

            {deliveryData.delivery.items.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => openLink(item.url)}
                style={[styles.itemCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
              >
                <View style={[styles.itemIcon, { backgroundColor: Colors.dark.accent + "20" }]}>
                  <Feather name={getTypeIcon(item.type)} size={20} color={Colors.dark.accent} />
                </View>
                <View style={styles.itemContent}>
                  <ThemedText style={styles.itemLabel}>{item.label}</ThemedText>
                  <ThemedText style={[styles.itemType, { color: theme.textMuted }]}>
                    {getTypeLabel(item.type)}
                  </ThemedText>
                </View>
                <Feather name="external-link" size={18} color={theme.textMuted} />
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={() => {
              setDeliveryData(null);
              setAccessCode("");
            }}
            style={[styles.backBtn, { borderColor: theme.border }]}
          >
            <ThemedText style={[styles.backBtnText, { color: theme.textSecondary }]}>
              Se en annen leveranse
            </ThemedText>
          </Pressable>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + Spacing.xl },
        ]}
      >
        <View style={[styles.iconContainer, { backgroundColor: Colors.dark.accent + "20" }]}>
          <Feather name="gift" size={32} color={Colors.dark.accent} />
        </View>

        <ThemedText style={styles.title}>Hent din leveranse</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Skriv inn tilgangskoden du har fått fra fotografen eller videografen
        </ThemedText>

        <View style={styles.form}>
          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <Feather name="key" size={18} color={theme.textMuted} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Tilgangskode"
              placeholderTextColor={theme.textMuted}
              value={accessCode}
              onChangeText={(text) => setAccessCode(text.toUpperCase())}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>

          <Pressable
            onPress={handleFetch}
            disabled={fetchMutation.isPending}
            style={[styles.submitBtn, { backgroundColor: Colors.dark.accent, opacity: fetchMutation.isPending ? 0.6 : 1 }]}
          >
            {fetchMutation.isPending ? (
              <ActivityIndicator color="#1A1A1A" />
            ) : (
              <ThemedText style={styles.submitBtnText}>Hent leveranse</ThemedText>
            )}
          </Pressable>
        </View>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  form: {
    width: "100%",
    gap: Spacing.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 50,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 2,
  },
  submitBtn: {
    height: 50,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  vendorBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: "600",
  },
  deliveryTitle: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  coupleName: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  dateText: {
    fontSize: 14,
  },
  description: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Spacing.lg,
  },
  itemsContainer: {
    width: "100%",
    marginTop: Spacing.lg,
  },
  itemsTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: Spacing.md,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  itemIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  itemType: {
    fontSize: 13,
    marginTop: 2,
  },
  backBtn: {
    marginTop: Spacing.xl,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  backBtnText: {
    fontSize: 14,
  },
});
