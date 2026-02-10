import React, { useState, useCallback, useEffect, useRef } from "react";
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
  Image,
  Dimensions,
  FlatList,
  Animated,
  Modal,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { EvendiIcon, EvendiIconGlyphMap } from "@/components/EvendiIcon";
import { useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import * as WebBrowser from "expo-web-browser";
import { useRoute, RouteProp } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GALLERY_COLUMNS = 3;
const GALLERY_GAP = 2;
const GALLERY_ITEM_SIZE = (SCREEN_WIDTH - GALLERY_GAP * (GALLERY_COLUMNS + 1)) / GALLERY_COLUMNS;

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
  download_count?: number;
  favorite_count?: number;
  favorited_at?: string | null;
}

interface DeliveryData {
  delivery: {
    id: string;
    coupleName: string;
    title: string;
    description: string | null;
    weddingDate: string | null;
    accessCode?: string;
    items: DeliveryItem[];
    openCount?: number;
    downloadCount?: number;
    favoriteCount?: number;
  };
  vendor: {
    businessName: string;
    categoryId: string | null;
  };
}

// ===== TRACKING HELPER =====
const trackDeliveryAction = async (
  deliveryId: string,
  action: string,
  deliveryItemId?: string,
  accessCode?: string,
  source: string = 'wedflow-app'
) => {
  try {
    // Try monorepo bridge first, then wedflow
    const urls = [
      new URL('/api/wedflow/delivery-track', 'https://creatorhub-monorepo.onrender.com').toString(),
      new URL('/api/wedflow/delivery-track', getApiUrl()).toString(),
    ];
    for (const url of urls) {
      try {
        await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deliveryId, deliveryItemId, action, accessCode, source }),
        });
        return;
      } catch { continue; }
    }
  } catch { /* silent fail */ }
};

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

  // PicTime-style gallery state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Track open on first view
  const hasTrackedOpen = useRef(false);

  // Map vendor category to icon
  const getVendorIcon = useCallback((categoryId: string | null): keyof typeof EvendiIconGlyphMap => {
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
      // Track "opened" event
      if (!hasTrackedOpen.current && data?.delivery?.id) {
        hasTrackedOpen.current = true;
        trackDeliveryAction(data.delivery.id, 'opened', undefined, normalizeCode(accessCode));
      }
      // Pre-populate favorites from server
      if (data?.delivery?.items) {
        const fav = new Set<string>();
        data.delivery.items.forEach((item: DeliveryItem) => {
          if (item.favorited_at) fav.add(item.id);
        });
        setFavorites(fav);
      }
      setAccessCode("");
      // Animate in
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMsg = error.message || "Kunne ikke hente leveranse";
      const [code, message] = errorMsg.includes(":") ? errorMsg.split(":") : ["unknown", errorMsg];
      setErrorMessage(message);
    },
  });

  // Toggle favorite on an item
  const toggleFavorite = useCallback(async (item: DeliveryItem) => {
    if (!deliveryData) return;
    const isFav = favorites.has(item.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (isFav) {
      setFavorites(prev => { const s = new Set(prev); s.delete(item.id); return s; });
      trackDeliveryAction(deliveryData.delivery.id, 'unfavorited', item.id);
    } else {
      setFavorites(prev => new Set(prev).add(item.id));
      trackDeliveryAction(deliveryData.delivery.id, 'favorited', item.id);
    }
  }, [deliveryData, favorites]);

  // Track download
  const trackDownload = useCallback(async (item: DeliveryItem) => {
    if (!deliveryData) return;
    trackDeliveryAction(deliveryData.delivery.id, 'downloaded', item.id);
  }, [deliveryData]);

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

  const openLink = useCallback(async (url: string, item?: DeliveryItem) => {
    if (!isValidUrlScheme(url)) {
      Alert.alert("Ugyldig lenke", "Denne lenken kan ikke åpnes.");
      return;
    }

    // Track download/view
    if (item && deliveryData) {
      trackDownload(item);
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
  }, [isValidUrlScheme, deliveryData, trackDownload]);

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

  const getTypeIcon = (type: string): keyof typeof EvendiIconGlyphMap => {
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

  // Separate image items from other types for gallery
  const imageItems = deliveryData?.delivery.items.filter(i => i.type === 'gallery' || i.type === 'video') || [];
  const otherItems = deliveryData?.delivery.items.filter(i => i.type !== 'gallery' && i.type !== 'video') || [];
  const favoritedItems = deliveryData?.delivery.items.filter(i => favorites.has(i.id)) || [];

  // PicTime-style fullscreen lightbox
  const renderLightbox = () => {
    if (selectedImageIndex === null || !imageItems.length) return null;
    const currentItem = imageItems[selectedImageIndex];
    if (!currentItem) return null;

    return (
      <Modal visible={true} transparent={true} animationType="fade" statusBarTranslucent>
        <View style={styles.lightboxContainer}>
          <Image
            source={{ uri: currentItem.url }}
            style={styles.lightboxImage}
            resizeMode="contain"
          />
          {/* Top bar */}
          <View style={[styles.lightboxTopBar, { paddingTop: insets.top }]}>
            <Pressable onPress={() => setSelectedImageIndex(null)} style={styles.lightboxBtn}>
              <EvendiIcon name="x" size={24} color="#FFF" />
            </Pressable>
            <ThemedText style={styles.lightboxCounter}>
              {selectedImageIndex + 1} / {imageItems.length}
            </ThemedText>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <Pressable onPress={() => toggleFavorite(currentItem)} style={styles.lightboxBtn}>
                <EvendiIcon
                  name={favorites.has(currentItem.id) ? "heart" : "heart"}
                  size={22}
                  color={favorites.has(currentItem.id) ? "#FF6B6B" : "#FFF"}
                />
              </Pressable>
              <Pressable onPress={() => { openLink(currentItem.url, currentItem); }} style={styles.lightboxBtn}>
                <EvendiIcon name="download" size={22} color="#FFF" />
              </Pressable>
              <Pressable onPress={() => shareLink(currentItem.url, currentItem.label)} style={styles.lightboxBtn}>
                <EvendiIcon name="share-2" size={22} color="#FFF" />
              </Pressable>
            </View>
          </View>
          {/* Caption */}
          <View style={[styles.lightboxCaption, { paddingBottom: insets.bottom + 20 }]}>
            <ThemedText style={styles.lightboxLabel}>{currentItem.label}</ThemedText>
            {currentItem.description && (
              <ThemedText style={styles.lightboxDesc}>{currentItem.description}</ThemedText>
            )}
          </View>
          {/* Navigation arrows */}
          {selectedImageIndex > 0 && (
            <Pressable
              style={[styles.lightboxNav, styles.lightboxNavLeft]}
              onPress={() => setSelectedImageIndex(selectedImageIndex - 1)}
            >
              <EvendiIcon name="chevron-left" size={32} color="#FFF" />
            </Pressable>
          )}
          {selectedImageIndex < imageItems.length - 1 && (
            <Pressable
              style={[styles.lightboxNav, styles.lightboxNavRight]}
              onPress={() => setSelectedImageIndex(selectedImageIndex + 1)}
            >
              <EvendiIcon name="chevron-right" size={32} color="#FFF" />
            </Pressable>
          )}
        </View>
      </Modal>
    );
  };

  if (deliveryData) {
    return (
      <Animated.View style={[styles.container, { backgroundColor: theme.backgroundRoot, opacity: fadeAnim }]}>
        {renderLightbox()}
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
          ]}
        >
          {/* Vendor Badge — PicTime style header */}
          <View style={styles.galleryHeader}>
            <View style={[styles.vendorBadge, { backgroundColor: theme.accent + "15" }]}>
              <EvendiIcon name={getVendorIcon(deliveryData.vendor.categoryId)} size={16} color={theme.accent} />
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
                <EvendiIcon name="calendar" size={14} color={theme.textMuted} />
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
          </View>

          {/* Stats row — PicTime style */}
          <View style={[styles.statsRow, { borderColor: theme.border }]}>
            <View style={styles.statItem}>
              <EvendiIcon name="image" size={16} color={theme.accent} />
              <ThemedText style={[styles.statValue, { color: theme.text }]}>
                {deliveryData.delivery.items.length}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textMuted }]}>Filer</ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <EvendiIcon name="heart" size={16} color="#FF6B6B" />
              <ThemedText style={[styles.statValue, { color: theme.text }]}>
                {favorites.size}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textMuted }]}>Favoritter</ThemedText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statItem}>
              <EvendiIcon name="download" size={16} color={theme.accent} />
              <ThemedText style={[styles.statValue, { color: theme.text }]}>
                {deliveryData.delivery.downloadCount || 0}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textMuted }]}>Nedlastet</ThemedText>
            </View>
          </View>

          {/* View mode toggle */}
          <View style={styles.viewToggle}>
            <Pressable
              style={[styles.viewToggleBtn, viewMode === 'grid' && { backgroundColor: theme.accent + "20" }]}
              onPress={() => setViewMode('grid')}
            >
              <EvendiIcon name="grid" size={18} color={viewMode === 'grid' ? theme.accent : theme.textMuted} />
            </Pressable>
            <Pressable
              style={[styles.viewToggleBtn, viewMode === 'list' && { backgroundColor: theme.accent + "20" }]}
              onPress={() => setViewMode('list')}
            >
              <EvendiIcon name="list" size={18} color={viewMode === 'list' ? theme.accent : theme.textMuted} />
            </Pressable>
            {favoritedItems.length > 0 && (
              <View style={styles.favBadge}>
                <EvendiIcon name="heart" size={12} color="#FF6B6B" />
                <ThemedText style={{ fontSize: 11, color: "#FF6B6B", fontWeight: "600" }}>
                  {favoritedItems.length}
                </ThemedText>
              </View>
            )}
          </View>

          {/* PicTime-style Gallery Grid */}
          {imageItems.length > 0 && (
            <View style={styles.gallerySection}>
              <ThemedText style={[styles.sectionTitle, { color: theme.textMuted }]}>
                {imageItems.some(i => i.type === 'video') ? 'BILDER & VIDEO' : 'BILDEGALLERI'}
              </ThemedText>

              {viewMode === 'grid' ? (
                <View style={styles.galleryGrid}>
                  {imageItems.map((item, index) => (
                    <Pressable
                      key={item.id}
                      style={styles.galleryItem}
                      onPress={() => setSelectedImageIndex(index)}
                      onLongPress={() => {
                        Alert.alert(item.label, undefined, [
                          { text: "Avbryt", style: "cancel" },
                          { text: favorites.has(item.id) ? "Fjern favoritt" : "Legg til favoritt", onPress: () => toggleFavorite(item) },
                          { text: "Last ned", onPress: () => openLink(item.url, item) },
                          { text: "Del", onPress: () => shareLink(item.url, item.label) },
                        ]);
                      }}
                    >
                      <Image source={{ uri: item.url }} style={styles.galleryImage} />
                      {item.type === 'video' && (
                        <View style={styles.videoOverlay}>
                          <EvendiIcon name="play-circle" size={28} color="#FFF" />
                        </View>
                      )}
                      {favorites.has(item.id) && (
                        <View style={styles.favOverlay}>
                          <EvendiIcon name="heart" size={14} color="#FF6B6B" />
                        </View>
                      )}
                    </Pressable>
                  ))}
                </View>
              ) : (
                imageItems.map((item) => (
                  <Pressable
                    key={item.id}
                    onPress={() => openLink(item.url, item)}
                    style={[styles.listItemCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
                  >
                    <Image source={{ uri: item.url }} style={styles.listItemThumb} />
                    <View style={styles.listItemContent}>
                      <ThemedText style={styles.itemLabel}>{item.label}</ThemedText>
                      <ThemedText style={[styles.itemType, { color: theme.textMuted }]}>
                        {getTypeLabel(item.type)}
                      </ThemedText>
                    </View>
                    <Pressable onPress={() => toggleFavorite(item)} style={styles.favBtn}>
                      <EvendiIcon
                        name="heart"
                        size={20}
                        color={favorites.has(item.id) ? "#FF6B6B" : theme.textMuted}
                      />
                    </Pressable>
                  </Pressable>
                ))
              )}
            </View>
          )}

          {/* Non-image items (contracts, documents, etc.) */}
          {otherItems.length > 0 && (
            <View style={styles.itemsContainer}>
              <ThemedText style={[styles.sectionTitle, { color: theme.textMuted }]}>
                ANDRE FILER
              </ThemedText>
              {otherItems.map((item) => (
                <Pressable
                  key={item.id}
                  onLongPress={() => {
                    Alert.alert(`Handlinger`, `Hva vil du gjøre med "${item.label}"?`, [
                      { text: "Avbryt", style: "cancel" },
                      { text: "Åpne", onPress: () => openLink(item.url, item) },
                      { text: "Kopier lenke", onPress: () => copyLink(item.url, item.label) },
                      { text: "Del", onPress: () => shareLink(item.url, item.label) },
                    ]);
                  }}
                  onPress={() => openLink(item.url, item)}
                  style={[styles.itemCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
                >
                  <View style={[styles.itemIcon, { backgroundColor: theme.accent + "20" }]}>
                    <EvendiIcon name={getTypeIcon(item.type)} size={20} color={theme.accent} />
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
                  <EvendiIcon name="external-link" size={18} color={theme.textMuted} />
                </Pressable>
              ))}
            </View>
          )}

          {/* Download All button — PicTime style */}
          {imageItems.length > 1 && (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                Alert.alert(
                  "Last ned alle",
                  `Vil du laste ned alle ${imageItems.length} filer?`,
                  [
                    { text: "Avbryt", style: "cancel" },
                    {
                      text: "Last ned",
                      onPress: () => {
                        imageItems.forEach(item => {
                          openLink(item.url, item);
                        });
                      }
                    }
                  ]
                );
              }}
              style={[styles.downloadAllBtn, { backgroundColor: theme.accent }]}
            >
              <EvendiIcon name="download-cloud" size={20} color="#FFF" />
              <ThemedText style={styles.downloadAllText}>Last ned alle ({imageItems.length})</ThemedText>
            </Pressable>
          )}

          <Pressable
            onPress={() => {
              setDeliveryData(null);
              setAccessCode("");
              hasTrackedOpen.current = false;
              fadeAnim.setValue(0);
            }}
            style={[styles.backBtn, { borderColor: theme.border }]}
          >
            <ThemedText style={[styles.backBtnText, { color: theme.textSecondary }]}>
              Se en annen leveranse
            </ThemedText>
          </Pressable>
        </ScrollView>
      </Animated.View>
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
          <EvendiIcon name="gift" size={32} color={theme.accent} />
        </View>

        <ThemedText style={styles.title}>Hent din leveranse</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Skriv inn tilgangskoden du har fått fra fotografen eller videografen
        </ThemedText>

        <View style={styles.form}>
          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: errorMessage ? "#EF5350" : theme.border }]}>
            <EvendiIcon name="key" size={18} color={theme.textMuted} />
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
              <EvendiIcon name="alert-circle" size={16} color="#EF5350" />
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
  // PicTime-style gallery header
  galleryHeader: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  vendorBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: "600",
  },
  deliveryTitle: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.xs,
    letterSpacing: -0.5,
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
    marginBottom: Spacing.md,
  },
  // Stats row — PicTime style
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
    width: "100%",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: Spacing.md,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
  },
  statDivider: {
    width: 1,
    height: 24,
  },
  // View mode toggle
  viewToggle: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  viewToggleBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  favBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "#FF6B6B15",
    marginLeft: Spacing.sm,
  },
  // Gallery grid — PicTime style
  gallerySection: {
    width: "100%",
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GALLERY_GAP,
  },
  galleryItem: {
    width: GALLERY_ITEM_SIZE,
    height: GALLERY_ITEM_SIZE,
    borderRadius: 2,
    overflow: "hidden",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#F0F0F0",
  },
  videoOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  favOverlay: {
    position: "absolute",
    top: 6,
    right: 6,
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 12,
    padding: 4,
  },
  // List view items
  listItemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  listItemThumb: {
    width: 56,
    height: 56,
    borderRadius: 6,
    backgroundColor: "#F0F0F0",
  },
  listItemContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  favBtn: {
    padding: 8,
  },
  // Item cards for non-image items
  itemsContainer: {
    width: "100%",
    marginTop: Spacing.md,
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
  // Download all button
  downloadAllBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    height: 52,
    borderRadius: BorderRadius.md,
    width: "100%",
    marginTop: Spacing.md,
  },
  downloadAllText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
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
  // Fullscreen lightbox — PicTime style
  lightboxContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  lightboxImage: {
    width: SCREEN_WIDTH,
    height: "100%",
  },
  lightboxTopBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  lightboxBtn: {
    padding: 8,
  },
  lightboxCounter: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  lightboxCaption: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  lightboxLabel: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  lightboxDesc: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
  },
  lightboxNav: {
    position: "absolute",
    top: "50%",
    padding: 12,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 24,
  },
  lightboxNavLeft: {
    left: 8,
  },
  lightboxNavRight: {
    right: 8,
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
});
