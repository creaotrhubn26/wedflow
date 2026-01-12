import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_GAP = Spacing.sm;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - GRID_GAP) / 2;

interface InspirationCategory {
  id: string;
  name: string;
  icon: string;
  sortOrder: number | null;
}

interface InspirationMedia {
  id: string;
  type: string;
  url: string;
  caption: string | null;
}

interface Vendor {
  id: string;
  businessName: string;
}

interface InspirationItem {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  priceSummary: string | null;
  priceMin: number | null;
  priceMax: number | null;
  currency: string | null;
  websiteUrl: string | null;
  inquiryEmail: string | null;
  inquiryPhone: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  allowInquiryForm: boolean | null;
  status: string;
  createdAt: string;
  media: InspirationMedia[];
  vendor: Vendor | null;
  category: InspirationCategory | null;
}

const getIconName = (iconName: string): keyof typeof Feather.glyphMap => {
  const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
    heart: "heart",
    flower: "sun",
    star: "star",
    cake: "gift",
    home: "home",
    utensils: "coffee",
    gift: "gift",
    scissors: "scissors",
    camera: "camera",
    mail: "mail",
  };
  return iconMap[iconName] || "image";
};

export default function InspirationScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedInspiration, setSelectedInspiration] = useState<InspirationItem | null>(null);
  const [showInquiryModal, setShowInquiryModal] = useState(false);
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [inquiryWeddingDate, setInquiryWeddingDate] = useState("");

  const { data: categories = [] } = useQuery<InspirationCategory[]>({
    queryKey: ["/api/inspiration-categories"],
  });

  const { data: inspirations = [], isLoading, refetch } = useQuery<InspirationItem[]>({
    queryKey: ["/api/inspirations"],
  });

  const inquiryMutation = useMutation({
    mutationFn: async (data: any) => {
      const url = new URL(`/api/inspirations/${data.inspirationId}/inquiry`, getApiUrl());
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Kunne ikke sende");
      }
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Sendt!", "Din forespørsel er sendt til leverandøren.");
      setShowInquiryModal(false);
      resetInquiryForm();
    },
    onError: (error: Error) => {
      Alert.alert("Feil", error.message);
    },
  });

  const resetInquiryForm = () => {
    setInquiryName("");
    setInquiryEmail("");
    setInquiryPhone("");
    setInquiryMessage("");
    setInquiryWeddingDate("");
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

  const handleToggleSave = (id: string) => {
    const newSaved = new Set(savedItems);
    if (newSaved.has(id)) {
      newSaved.delete(id);
    } else {
      newSaved.add(id);
    }
    setSavedItems(newSaved);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleOpenDetail = (item: InspirationItem) => {
    setSelectedInspiration(item);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSendInquiry = () => {
    if (!selectedInspiration) return;
    if (!inquiryName.trim() || !inquiryEmail.trim() || !inquiryMessage.trim()) {
      Alert.alert("Mangler informasjon", "Fyll ut navn, e-post og melding.");
      return;
    }
    inquiryMutation.mutate({
      inspirationId: selectedInspiration.id,
      name: inquiryName.trim(),
      email: inquiryEmail.trim(),
      phone: inquiryPhone.trim() || undefined,
      message: inquiryMessage.trim(),
      weddingDate: inquiryWeddingDate.trim() || undefined,
    });
  };

  const formatPrice = (item: InspirationItem) => {
    if (item.priceSummary) return item.priceSummary;
    if (item.priceMin && item.priceMax) {
      return `${item.priceMin.toLocaleString()} - ${item.priceMax.toLocaleString()} ${item.currency || "kr"}`;
    }
    if (item.priceMin) return `Fra ${item.priceMin.toLocaleString()} ${item.currency || "kr"}`;
    if (item.priceMax) return `Opp til ${item.priceMax.toLocaleString()} ${item.currency || "kr"}`;
    return null;
  };

  const filteredInspirations = selectedCategory
    ? inspirations.filter((insp) => insp.category?.id === selectedCategory)
    : inspirations;

  const categoryCounts = categories.map((cat) => ({
    ...cat,
    count: inspirations.filter((insp) => insp.category?.id === cat.id).length,
  }));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.dark.accent}
        />
      }
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        <Pressable
          onPress={() => {
            setSelectedCategory(null);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={[
            styles.categoryChip,
            {
              backgroundColor:
                selectedCategory === null
                  ? Colors.dark.accent
                  : theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
        >
          <ThemedText
            style={[
              styles.categoryChipText,
              { color: selectedCategory === null ? "#1A1A1A" : theme.text },
            ]}
          >
            Alle
          </ThemedText>
        </Pressable>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => {
              setSelectedCategory(category.id);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[
              styles.categoryChip,
              {
                backgroundColor:
                  selectedCategory === category.id
                    ? Colors.dark.accent
                    : theme.backgroundDefault,
                borderColor: theme.border,
              },
            ]}
          >
            <Feather
              name={getIconName(category.icon)}
              size={14}
              color={
                selectedCategory === category.id ? "#1A1A1A" : theme.textSecondary
              }
              style={styles.categoryIcon}
            />
            <ThemedText
              style={[
                styles.categoryChipText,
                {
                  color:
                    selectedCategory === category.id ? "#1A1A1A" : theme.text,
                },
              ]}
            >
              {category.name}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.accent} />
        </View>
      ) : filteredInspirations.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="image" size={48} color={theme.textMuted} />
          <ThemedText
            style={[styles.emptyText, { color: theme.textSecondary }]}
          >
            {selectedCategory ? "Ingen inspirasjoner i denne kategorien" : "Ingen inspirasjoner ennå"}
          </ThemedText>
          <ThemedText
            style={[styles.emptySubtext, { color: theme.textMuted }]}
          >
            Leverandører legger snart til vakre bilder her
          </ThemedText>
        </View>
      ) : (
        <View style={styles.grid}>
          {filteredInspirations.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInUp.delay(index * 100).duration(300)}
            >
              <Pressable
                onPress={() => handleOpenDetail(item)}
                style={[
                  styles.imageCard,
                  { backgroundColor: theme.backgroundDefault },
                ]}
              >
                {item.coverImageUrl || (item.media.length > 0 && item.media[0].url) ? (
                  <Image
                    source={{ uri: item.coverImageUrl || item.media[0].url }}
                    style={styles.imagePlaceholder}
                    contentFit="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.imagePlaceholder,
                      { backgroundColor: theme.backgroundSecondary },
                    ]}
                  >
                    <Feather name="image" size={32} color={theme.textMuted} />
                  </View>
                )}
                <View style={styles.imageOverlay}>
                  <View style={styles.overlayTop}>
                    <View style={styles.categoryBadge}>
                      <ThemedText style={styles.categoryBadgeText}>
                        {item.category?.name || "Inspirasjon"}
                      </ThemedText>
                    </View>
                    <Pressable
                      onPress={(e) => {
                        e.stopPropagation();
                        handleToggleSave(item.id);
                      }}
                      style={[
                        styles.saveButton,
                        {
                          backgroundColor: savedItems.has(item.id)
                            ? Colors.dark.accent
                            : "rgba(0,0,0,0.5)",
                        },
                      ]}
                    >
                      <Feather
                        name="heart"
                        size={16}
                        color={savedItems.has(item.id) ? "#1A1A1A" : "#FFFFFF"}
                      />
                    </Pressable>
                  </View>
                  {formatPrice(item) ? (
                    <View style={styles.priceBadge}>
                      <ThemedText style={styles.priceBadgeText}>
                        {formatPrice(item)}
                      </ThemedText>
                    </View>
                  ) : null}
                </View>
                <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                  <ThemedText style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </ThemedText>
                  {item.vendor ? (
                    <ThemedText style={[styles.vendorName, { color: theme.textMuted }]} numberOfLines={1}>
                      av {item.vendor.businessName}
                    </ThemedText>
                  ) : null}
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      )}

      {categoryCounts.length > 0 ? (
        <View style={styles.statsSection}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Kategorier
          </ThemedText>
          <View style={styles.categoriesList}>
            {categoryCounts.map((category, index) => (
              <Animated.View
                key={category.id}
                entering={FadeInUp.delay(300 + index * 50).duration(300)}
              >
                <Pressable
                  onPress={() => {
                    setSelectedCategory(category.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.categoryRow,
                    { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                  ]}
                >
                  <View
                    style={[
                      styles.categoryRowIcon,
                      { backgroundColor: theme.backgroundSecondary },
                    ]}
                  >
                    <Feather name={getIconName(category.icon)} size={18} color={Colors.dark.accent} />
                  </View>
                  <ThemedText style={styles.categoryRowName}>
                    {category.name}
                  </ThemedText>
                  <ThemedText
                    style={[styles.categoryRowCount, { color: theme.textSecondary }]}
                  >
                    {category.count} {category.count === 1 ? "bilde" : "bilder"}
                  </ThemedText>
                  <Feather name="chevron-right" size={18} color={theme.textMuted} />
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </View>
      ) : null}

      <Modal
        visible={selectedInspiration !== null && !showInquiryModal}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedInspiration(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.detailModal, { backgroundColor: theme.backgroundRoot }]}>
            <Pressable style={styles.closeBtn} onPress={() => setSelectedInspiration(null)}>
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>

            <ScrollView contentContainerStyle={styles.detailContent}>
              {selectedInspiration?.coverImageUrl || (selectedInspiration?.media.length && selectedInspiration.media[0].url) ? (
                <Image
                  source={{ uri: selectedInspiration.coverImageUrl || selectedInspiration.media[0].url }}
                  style={styles.detailImage}
                  contentFit="cover"
                />
              ) : null}

              <ThemedText style={styles.detailTitle}>{selectedInspiration?.title}</ThemedText>
              
              {selectedInspiration?.vendor ? (
                <ThemedText style={[styles.detailVendor, { color: Colors.dark.accent }]}>
                  av {selectedInspiration.vendor.businessName}
                </ThemedText>
              ) : null}

              {selectedInspiration?.description ? (
                <ThemedText style={[styles.detailDesc, { color: theme.textSecondary }]}>
                  {selectedInspiration.description}
                </ThemedText>
              ) : null}

              {formatPrice(selectedInspiration!) ? (
                <View style={[styles.priceBox, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                  <Feather name="tag" size={18} color={Colors.dark.accent} />
                  <ThemedText style={styles.priceText}>{formatPrice(selectedInspiration!)}</ThemedText>
                </View>
              ) : null}

              <View style={styles.contactButtons}>
                {selectedInspiration?.websiteUrl ? (
                  <Pressable
                    onPress={() => Linking.openURL(selectedInspiration.websiteUrl!)}
                    style={[styles.contactBtn, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
                  >
                    <Feather name="globe" size={18} color={Colors.dark.accent} />
                    <ThemedText style={styles.contactBtnText}>Nettside</ThemedText>
                  </Pressable>
                ) : null}

                {selectedInspiration?.inquiryPhone ? (
                  <Pressable
                    onPress={() => Linking.openURL(`tel:${selectedInspiration.inquiryPhone}`)}
                    style={[styles.contactBtn, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
                  >
                    <Feather name="phone" size={18} color={Colors.dark.accent} />
                    <ThemedText style={styles.contactBtnText}>Ring</ThemedText>
                  </Pressable>
                ) : null}

                {selectedInspiration?.inquiryEmail ? (
                  <Pressable
                    onPress={() => Linking.openURL(`mailto:${selectedInspiration.inquiryEmail}`)}
                    style={[styles.contactBtn, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
                  >
                    <Feather name="mail" size={18} color={Colors.dark.accent} />
                    <ThemedText style={styles.contactBtnText}>E-post</ThemedText>
                  </Pressable>
                ) : null}
              </View>

              {selectedInspiration?.ctaLabel && selectedInspiration?.ctaUrl ? (
                <Pressable
                  onPress={() => Linking.openURL(selectedInspiration.ctaUrl!)}
                  style={[styles.ctaBtn, { backgroundColor: Colors.dark.accent }]}
                >
                  <ThemedText style={styles.ctaBtnText}>{selectedInspiration.ctaLabel}</ThemedText>
                </Pressable>
              ) : null}

              {selectedInspiration?.allowInquiryForm ? (
                <Pressable
                  onPress={() => setShowInquiryModal(true)}
                  style={[styles.inquiryBtn, { borderColor: Colors.dark.accent }]}
                >
                  <Feather name="send" size={18} color={Colors.dark.accent} />
                  <ThemedText style={[styles.inquiryBtnText, { color: Colors.dark.accent }]}>
                    Send forespørsel
                  </ThemedText>
                </Pressable>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showInquiryModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowInquiryModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.inquiryModal, { backgroundColor: theme.backgroundRoot }]}>
            <View style={styles.inquiryHeader}>
              <ThemedText style={styles.inquiryTitle}>Send forespørsel</ThemedText>
              <Pressable onPress={() => setShowInquiryModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <KeyboardAwareScrollViewCompat style={styles.inquiryScroll}>
              <ThemedText style={[styles.inquirySubtitle, { color: theme.textSecondary }]}>
                Til: {selectedInspiration?.vendor?.businessName}
              </ThemedText>

              <TextInput
                style={[styles.inquiryInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={inquiryName}
                onChangeText={setInquiryName}
                placeholder="Ditt navn"
                placeholderTextColor={theme.textMuted}
              />

              <TextInput
                style={[styles.inquiryInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={inquiryEmail}
                onChangeText={setInquiryEmail}
                placeholder="Din e-post"
                placeholderTextColor={theme.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <TextInput
                style={[styles.inquiryInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={inquiryPhone}
                onChangeText={setInquiryPhone}
                placeholder="Telefon (valgfritt)"
                placeholderTextColor={theme.textMuted}
                keyboardType="phone-pad"
              />

              <TextInput
                style={[styles.inquiryInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={inquiryWeddingDate}
                onChangeText={setInquiryWeddingDate}
                placeholder="Bryllupsdato (valgfritt)"
                placeholderTextColor={theme.textMuted}
              />

              <TextInput
                style={[styles.inquiryTextArea, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={inquiryMessage}
                onChangeText={setInquiryMessage}
                placeholder="Din melding..."
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={4}
              />

              <Pressable
                onPress={handleSendInquiry}
                disabled={inquiryMutation.isPending}
                style={[styles.sendBtn, { backgroundColor: Colors.dark.accent }]}
              >
                {inquiryMutation.isPending ? (
                  <ActivityIndicator size="small" color="#1A1A1A" />
                ) : (
                  <ThemedText style={styles.sendBtnText}>Send forespørsel</ThemedText>
                )}
              </Pressable>
            </KeyboardAwareScrollViewCompat>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: Spacing["5xl"],
    alignItems: "center",
  },
  categoriesScroll: {
    marginHorizontal: -Spacing.lg,
    marginBottom: Spacing.lg,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryIcon: {
    marginRight: Spacing.xs,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
    marginBottom: Spacing["2xl"],
  },
  imageCard: {
    width: CARD_WIDTH,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  imagePlaceholder: {
    width: "100%",
    height: CARD_WIDTH * 1.3,
    justifyContent: "center",
    alignItems: "center",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: CARD_WIDTH * 1.3,
    justifyContent: "space-between",
    padding: Spacing.sm,
  },
  overlayTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  categoryBadge: {
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  saveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  priceBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(201, 169, 98, 0.9)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  priceBadgeText: {
    fontSize: 11,
    color: "#1A1A1A",
    fontWeight: "600",
  },
  cardFooter: {
    padding: Spacing.sm,
    borderTopWidth: 1,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  vendorName: {
    fontSize: 11,
    marginTop: 2,
  },
  statsSection: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  categoriesList: {
    gap: Spacing.sm,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  categoryRowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  categoryRowName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  categoryRowCount: {
    fontSize: 14,
    marginRight: Spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "flex-end",
  },
  detailModal: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: "90%",
  },
  closeBtn: {
    position: "absolute",
    top: Spacing.md,
    right: Spacing.md,
    zIndex: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  detailContent: {
    padding: Spacing.lg,
    paddingTop: 0,
  },
  detailImage: {
    width: "100%",
    height: 250,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: "700",
  },
  detailVendor: {
    fontSize: 15,
    fontWeight: "500",
    marginTop: Spacing.xs,
  },
  detailDesc: {
    fontSize: 15,
    lineHeight: 22,
    marginTop: Spacing.md,
  },
  priceBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  priceText: {
    fontSize: 16,
    fontWeight: "600",
  },
  contactButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginTop: Spacing.lg,
  },
  contactBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  contactBtnText: {
    fontSize: 13,
    fontWeight: "500",
  },
  ctaBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
  },
  ctaBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  inquiryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  inquiryBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  inquiryModal: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: "85%",
  },
  inquiryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  inquiryTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  inquiryScroll: {
    padding: Spacing.lg,
  },
  inquirySubtitle: {
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  inquiryInput: {
    height: 48,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
    marginBottom: Spacing.md,
  },
  inquiryTextArea: {
    minHeight: 100,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    fontSize: 15,
    textAlignVertical: "top",
    marginBottom: Spacing.lg,
  },
  sendBtn: {
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xl,
  },
  sendBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
});
