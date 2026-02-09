import React, { useState, useCallback, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Share,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { useRoute, RouteProp } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

type DeliveryAccessParams = {
  DeliveryAccess: {
    prefillCode?: string;
    deliveryId?: string;
    fromShowcase?: boolean;
  } | undefined;
};

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
  const route = useRoute<RouteProp<DeliveryAccessParams, 'DeliveryAccess'>>();
  const prefillCode = route.params?.prefillCode;
  const deliveryId = route.params?.deliveryId;
  const fromShowcase = route.params?.fromShowcase;

  const [accessCode, setAccessCode] = useState(prefillCode || "");
  const [deliveryData, setDeliveryData] = useState<DeliveryData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Map vendor category to icon
  const getVendorIcon = useCallback((categoryId: string | null): keyof typeof Feather.glyphMap => {
    switch (categoryId) {
      case "photographer": return "camera";
      case "videographer": return "video";
      case "venue": return "map-pin";
      case "catering": return "coffee";
      case "music": return "music";
      case "flowers": return "home";
      case "makeup": return "star";
      case "dress": return "shopping-bag";
      default: return "briefcase";
    }
  }, []);

  // Normalize and validate access code
  const normalizeCode = useCallback((code: string): string => {
    return code.replace(/[\s-]/g, "").toUpperCase();
  }, []);

  // Check URL scheme safety
  const isValidUrlScheme = useCallback((url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "https:" || urlObj.protocol === "http:";
    } catch {
      return false;
    }
  }, []);

  const fetchMutation = useMutation({
    mutationFn: async () => {
      const normalizedCode = normalizeCode(accessCode);
      const response = await fetch(
        new URL(`/api/deliveries/${normalizedCode}`, getApiUrl()).toString()
      );
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("404:Ingen leveranse funnet med denne koden. Sjekk at du har skrevet riktig.");
        } else if (response.status === 429) {
          throw new Error("429:For mange forsøk. Prøv igjen om noen minutter.");
        } else if (response.status >= 500) {
          throw new Error("500:Teknisk feil på serveren. Prøv igjen om litt.");
        }
        throw new Error("unknown:Kunne ikke hente leveranse. Prøv igjen.");
      }
      return response.json();
    },
    onSuccess: (data) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setDeliveryData(data);
      setErrorMessage(null);
      setAccessCode("");
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMsg = error.message || "Kunne ikke hente leveranse";
      const [code, message] = errorMsg.includes(":") ? errorMsg.split(":") : ["unknown", errorMsg];
      setErrorMessage(message);
    },
  });

  const handleFetch = useCallback(() => {
    if (!accessCode.trim()) {
      setErrorMessage("Skriv inn tilgangskoden du har fått.");
      return;
    }
    setErrorMessage(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    fetchMutation.mutate();
  }, [accessCode, fetchMutation]);

  // Auto-fetch when prefillCode is provided from showcase bridge
  useEffect(() => {
    if (prefillCode && prefillCode.length > 0) {
      setAccessCode(prefillCode);
      const timer = setTimeout(() => {
        fetchMutation.mutate();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [prefillCode]); // eslint-disable-line react-hooks/exhaustive-deps

  const openLink = useCallback(async (url: string) => {
    if (!isValidUrlScheme(url)) {
      Alert.alert("Ugyldig lenke", "Denne lenken kan ikke åpnes.");
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await WebBrowser.openBrowserAsync(url);
    } catch {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Feil", "Kunne ikke åpne lenken.");
      }
    }
  }, [isValidUrlScheme]);

  const copyLink = useCallback(async (url: string, label: string) => {
    try {
      await Clipboard.setStringAsync(url);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Kopiert", `"${label}" er kopiert til utklippstavlen.`);
    } catch (error) {
      Alert.alert("Feil", "Kunne ikke kopiere lenken.");
    }
  }, []);

  const shareLink = useCallback(async (url: string, label: string) => {
    try {
      await Share.share({
        message: `${label}\n${url}`,
        title: label,
        url,
      });
    } catch (error) {
      Alert.alert("Feil", "Kunne ikke dele lenken.");
    }
  }, []);

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
          <View style={[styles.vendorBadge, { backgroundColor: theme.accent + "20" }]}>
            <Feather name={getVendorIcon(deliveryData.vendor.categoryId)} size={16} color={theme.accent} />
            <ThemedText style={[styles.vendorName, { color: theme.accent }]}>
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

            {deliveryData.delivery.items.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                <Feather name="info" size={24} color={theme.textMuted} />
                <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
                  Ingen lenker lagt inn ennå
                </ThemedText>
                <ThemedText style={[styles.emptySubtext, { color: theme.textMuted }]}>
                  Kontakt leverandøren for å få tilgang til innholdet.
                </ThemedText>
              </View>
            ) : (
              deliveryData.delivery.items.map((item) => (
                <Pressable
                  key={item.id}
                  onLongPress={() => {
                    Alert.alert(`Handlinger`, `Hva vil du gjøre med "${item.label}"?`, [
                      { text: "Avbryt", style: "cancel" },
                      { text: "Åpne", onPress: () => openLink(item.url) },
                      { text: "Kopier lenke", onPress: () => copyLink(item.url, item.label) },
                      { text: "Del", onPress: () => shareLink(item.url, item.label) },
                    ]);
                  }}
                  onPress={() => openLink(item.url)}
                  style={[styles.itemCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
                >
                  <View style={[styles.itemIcon, { backgroundColor: theme.accent + "20" }]}>
                    <Feather name={getTypeIcon(item.type)} size={20} color={theme.accent} />
                  </View>
                  <View style={styles.itemContent}>
                    <ThemedText style={styles.itemLabel}>{item.label}</ThemedText>
                    <ThemedText style={[styles.itemType, { color: theme.textMuted }]}>
                      {getTypeLabel(item.type)}
                    </ThemedText>
                    {item.description && (
                      <ThemedText style={[styles.itemDescription, { color: theme.textMuted }]}>
                        {item.description}
                      </ThemedText>
                    )}
                  </View>
                  <Feather name="external-link" size={18} color={theme.textMuted} />
                </Pressable>
              ))
            )}
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
        <View style={[styles.iconContainer, { backgroundColor: theme.accent + "20" }]}>
          <Feather name="gift" size={32} color={theme.accent} />
        </View>

        <ThemedText style={styles.title}>Hent din leveranse</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Skriv inn tilgangskoden du har fått fra fotografen eller videografen
        </ThemedText>

        <View style={styles.form}>
          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: errorMessage ? "#EF5350" : theme.border }]}>
            <Feather name="key" size={18} color={theme.textMuted} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Tilgangskode"
              placeholderTextColor={theme.textMuted}
              value={accessCode}
              onChangeText={(text) => setAccessCode(text)}
              onSubmitEditing={handleFetch}
              returnKeyType="go"
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={20}
              editable={!fetchMutation.isPending}
            />
          </View>

          {errorMessage && (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={16} color="#EF5350" />
              <ThemedText style={styles.errorText}>{errorMessage}</ThemedText>
            </View>
          )}

          <Pressable
            onPress={handleFetch}
            disabled={fetchMutation.isPending || !accessCode.trim()}
            style={[styles.submitBtn, { backgroundColor: theme.accent, opacity: fetchMutation.isPending || !accessCode.trim() ? 0.5 : 1 }]}
          >
            {fetchMutation.isPending ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={[styles.submitBtnText, { color: "#FFFFFF" }]}>Hent leveranse</ThemedText>
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
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: "#EF535015",
  },
  errorText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#EF5350",
    flex: 1,
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
  emptyCard: {
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    minHeight: 140,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 13,
    textAlign: "center",
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
  itemDescription: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
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
