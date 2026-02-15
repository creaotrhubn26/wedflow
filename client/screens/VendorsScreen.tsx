import React, { useState, useMemo, useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Pressable,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import { EvendiIcon, EvendiIconGlyphMap } from "@/components/EvendiIcon";
import { EmptyStateIllustration } from "@/components/EmptyStateIllustration";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useEventType } from "@/hooks/useEventType";
import { Spacing, BorderRadius } from "@/constants/theme";
import { Vendor } from "@/lib/types";
import { PlanningStackParamList } from "@/navigation/PlanningStackNavigator";
import PersistentTextInput from "@/components/PersistentTextInput";
import { type EventType, VENDOR_CATEGORIES, getVendorCategoryGradientByDbName } from "@shared/event-types";

const FALLBACK_LOGO = require("../../assets/images/Evendi_logo_norsk_tagline.png");
const { width: SCREEN_WIDTH } = Dimensions.get("window");
// Stable separator component extracted outside render
const VendorSeparator = () => <View style={{ height: Spacing.md }} />;
// ─── Vendor Categories for dropdown (from shared registry) ─────
const VENDOR_CATEGORY_DROPDOWN = [
  { id: "all", name: "Alle kategorier" },
  ...(["photographer", "videographer", "photo-video", "venue", "music", "florist", "catering", "cake", "planner", "beauty", "transport", "dress"] as const).map(slug => ({
    id: slug,
    name: VENDOR_CATEGORIES[slug].labelNo,
  })),
];

// ─── Placeholder gradient colors per category (from shared registry) ──
const CATEGORY_GRADIENT: Record<string, [string, string]> = (() => {
  const map: Record<string, [string, string]> = { default: ["#667eea", "#764ba2"] };
  for (const info of Object.values(VENDOR_CATEGORIES)) {
    map[info.dbName] = info.gradient;
  }
  return map;
})();

// ─── Hardcoded sample vendors ──────────────────────────────────
const SCANDINAVIAN_VENDORS: Vendor[] = [
  { id: "1", name: "Nordic Moments", categoryId: null, categoryName: "Fotograf", location: "Oslo", country: "Norway", rating: 4.9, priceRange: "25 000 - 40 000 kr", description: "Naturlig lys og tidløse øyeblikk", saved: false, isFeatured: true, isPrioritized: false, hasReviewBadge: true },
  { id: "2", name: "Stockholm Event Films", categoryId: null, categoryName: "Videograf", location: "Stockholm", country: "Sweden", rating: 4.8, priceRange: "30 000 - 50 000 kr", description: "Cinematiske event-filmer", saved: false, isFeatured: false, isPrioritized: true, hasReviewBadge: false },
  { id: "3", name: "Copenhagen Beats", categoryId: null, categoryName: "Musikk", location: "København", country: "Denmark", rating: 4.7, priceRange: "12 000 - 20 000 kr", description: "Stemningsfull musikk hele kvelden", saved: false, isFeatured: false, isPrioritized: false, hasReviewBadge: false },
  { id: "4", name: "Bergen Foto", categoryId: null, categoryName: "Fotograf", location: "Bergen", country: "Norway", rating: 4.9, priceRange: "20 000 - 35 000 kr", description: "Vestlandets mest ettertraktede", saved: false, isFeatured: false, isPrioritized: false, hasReviewBadge: true },
  { id: "5", name: "Malmö Films", categoryId: null, categoryName: "Videograf", location: "Malmö", country: "Sweden", rating: 4.6, priceRange: "25 000 - 45 000 kr", description: "Moderne og kreativt uttrykk", saved: false, isFeatured: false, isPrioritized: false, hasReviewBadge: false },
  { id: "6", name: "Oslo DJ Collective", categoryId: null, categoryName: "Musikk", location: "Oslo", country: "Norway", rating: 4.8, priceRange: "15 000 - 25 000 kr", description: "Profesjonelle DJs for alle arrangementer", saved: false, isFeatured: false, isPrioritized: false, hasReviewBadge: false },
  { id: "7", name: "Trondheim Foto", categoryId: null, categoryName: "Fotograf", location: "Trondheim", country: "Norway", rating: 4.7, priceRange: "18 000 - 30 000 kr", description: "Autentiske bilder med sjel", saved: false, isFeatured: false, isPrioritized: false, hasReviewBadge: false },
  { id: "8", name: "Danish Event Films", categoryId: null, categoryName: "Videograf", location: "Aarhus", country: "Denmark", rating: 4.8, priceRange: "28 000 - 48 000 kr", description: "Fortellende filmproduksjon", saved: false, isFeatured: false, isPrioritized: false, hasReviewBadge: false },
  { id: "9", name: "Blomster & Fest", categoryId: null, categoryName: "Blomster", location: "Oslo", country: "Norway", rating: 4.9, priceRange: "8 000 - 25 000 kr", description: "Vakre buketter og dekorasjoner", saved: false, isFeatured: true, isPrioritized: false, hasReviewBadge: false },
  { id: "10", name: "Göteborg Events", categoryId: null, categoryName: "Catering", location: "Göteborg", country: "Sweden", rating: 4.7, priceRange: "500 - 1200 kr/person", description: "Nordisk gourmet-catering", saved: false, isFeatured: false, isPrioritized: false, hasReviewBadge: false },
];

interface ApiVendor {
  id: string;
  businessName: string;
  categoryId: string | null;
  categoryName?: string;
  description: string | null;
  location: string | null;
  phone: string | null;
  website: string | null;
  priceRange: string | null;
  imageUrl: string | null;
  isFeatured?: boolean;
  isPrioritized?: boolean;
  hasReviewBadge?: boolean;
}

// ─── Event-type-aware labels ───────────────────────────────────
const EVENT_TYPE_OPTIONS: { value: EventType; label: string; icon: string }[] = [
  { value: "wedding", label: "Bryllup", icon: "💍" },
  { value: "confirmation", label: "Konfirmasjon", icon: "🎓" },
  { value: "birthday", label: "Bursdag", icon: "🎂" },
  { value: "anniversary", label: "Jubileum", icon: "🥂" },
  { value: "conference", label: "Konferanse", icon: "🎤" },
  { value: "christmas_party", label: "Julebord", icon: "🎄" },
  { value: "summer_party", label: "Sommerfest", icon: "☀️" },
  { value: "team_building", label: "Teambuilding", icon: "🤝" },
  { value: "kickoff", label: "Kickoff", icon: "🚀" },
  { value: "awards_night", label: "Galla", icon: "🏆" },
];

// ────────────────────────────────────────────────────────────────
//  Dropdown component
// ────────────────────────────────────────────────────────────────
function Dropdown({
  label,
  value,
  options,
  onSelect,
  icon,
  theme,
}: {
  label: string;
  value: string;
  options: { id: string; name: string; icon?: string }[];
  onSelect: (id: string) => void;
  icon?: keyof typeof EvendiIconGlyphMap;
  theme: any;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);

  return (
    <>
      <Pressable
        onPress={() => {
          setOpen(true);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        style={[
          styles.dropdown,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        ]}
      >
        {icon && <EvendiIcon name={icon} size={16} color={theme.textSecondary} />}
        <ThemedText style={[styles.dropdownText, { color: theme.text }]} numberOfLines={1}>
          {selected?.name || label}
        </ThemedText>
        <EvendiIcon name="chevron-down" size={16} color={theme.textSecondary} />
      </Pressable>

      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={[styles.modalTitle, { color: theme.text }]}>{label}</ThemedText>
            <ScrollView style={{ maxHeight: 400 }}>
              {options.map((opt) => (
                <Pressable
                  key={opt.id}
                  style={[
                    styles.modalOption,
                    opt.id === value && { backgroundColor: theme.accent + "18" },
                  ]}
                  onPress={() => {
                    onSelect(opt.id);
                    setOpen(false);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  {opt.icon && (
                    <ThemedText style={{ fontSize: 18, marginRight: Spacing.sm }}>{opt.icon}</ThemedText>
                  )}
                  <ThemedText
                    style={[
                      styles.modalOptionText,
                      { color: opt.id === value ? theme.accent : theme.text },
                    ]}
                  >
                    {opt.name}
                  </ThemedText>
                  {opt.id === value && (
                    <EvendiIcon name="check" size={18} color={theme.accent} />
                  )}
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

// ────────────────────────────────────────────────────────────────
//  Main screen
// ────────────────────────────────────────────────────────────────
export default function VendorsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme, designSettings } = useTheme();
  const { eventType, config } = useEventType();
  const navigation = useNavigation<NativeStackNavigationProp<PlanningStackParamList>>();

  // ── State ──
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEventType, setSelectedEventType] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [savedVendors, setSavedVendors] = useState<Set<string>>(new Set());

  // ── API data ──
  const { data: apiVendors = [], isLoading } = useQuery<ApiVendor[]>({
    queryKey: ["/api/vendors"],
  });

  const allVendors: Vendor[] = useMemo(
    () => [
      ...SCANDINAVIAN_VENDORS,
      ...apiVendors.map((v) => ({
        id: v.id,
        name: v.businessName,
        businessName: v.businessName,
        categoryId: v.categoryId,
        categoryName: v.categoryName,
        location: v.location || "Norge",
        country: "Norway" as Vendor["country"],
        rating: 5.0,
        priceRange: v.priceRange || "",
        description: v.description || "",
        phone: v.phone,
        website: v.website,
        imageUrl: v.imageUrl,
        isFeatured: v.isFeatured ?? false,
        isPrioritized: v.isPrioritized ?? false,
        hasReviewBadge: v.hasReviewBadge ?? false,
        saved: false,
      })),
    ],
    [apiVendors],
  );

  // ── Filter ──
  const filteredVendors = useMemo(() => {
    const catMap: Record<string, string> = {
      photographer: "Fotograf",
      videographer: "Videograf",
      dj: "Musikk",
      florist: "Blomster",
      caterer: "Catering",
      venue: "Venue",
      cake: "Kake",
      planner: "Planlegger",
      beauty: "Hår & Makeup",
    };
    return allVendors
      .filter((v) => {
        const matchesCat =
          selectedCategory === "all" ||
          v.categoryName === catMap[selectedCategory] ||
          v.categoryName === selectedCategory;
        const matchesSearch =
          !searchQuery ||
          v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (v.categoryName || "").toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesSearch;
      })
      .map((v) => ({ ...v, saved: savedVendors.has(v.id) }));
  }, [allVendors, selectedCategory, searchQuery, savedVendors]);

  // ── Handlers ──
  const handleToggleSave = useCallback(
    (id: string) => {
      setSavedVendors((prev) => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        return next;
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [],
  );

  const handleVendorPress = useCallback(
    (vendor: Vendor) => {
      navigation.navigate("VendorDetail", {
        vendorId: vendor.id,
        vendorName: vendor.name,
        vendorDescription: vendor.description,
        vendorLocation: vendor.location,
        vendorPriceRange: vendor.priceRange,
        vendorCategory: vendor.categoryName || "Ukjent",
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
    [navigation],
  );

  // ── Icon helper ──
  const getCatIcon = (categoryName?: string): keyof typeof EvendiIconGlyphMap => {
    const map: Record<string, string> = {
      Fotograf: "camera",
      Videograf: "film",
      Blomster: "flower",
      Catering: "coffee",
      Musikk: "music",
      Venue: "home",
      Kake: "gift",
      Planlegger: "clipboard",
      "Hår & Makeup": "scissors",
      Transport: "truck",
      Underholdning: "smile",
      Dekorasjon: "star",
    };
    return (map[categoryName || ""] || "camera") as keyof typeof EvendiIconGlyphMap;
  };

  // ── Country formatter ──
  const countryLabel = (c: string) =>
    c === "Norway" ? "Norge" : c === "Sweden" ? "Sverige" : "Danmark";

  // ── Stars renderer ──
  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const stars: React.ReactNode[] = [];
    for (let i = 0; i < full; i++) {
      stars.push(<EvendiIcon key={`f${i}`} name="star" size={14} color="#F59E0B" />);
    }
    return stars;
  };

  // ── Render a full-width vendor card (matching screenshot design) ──
  const renderVendorCard = ({ item, index }: { item: Vendor; index: number }) => {
    const gradientColors = CATEGORY_GRADIENT[item.categoryName || ""] || CATEGORY_GRADIENT.default;
    const hasImage = !!(item as any).imageUrl;

    return (
      <Animated.View entering={index < 10 ? FadeInDown.delay(index * 80).duration(400) : undefined}>
        <Pressable
          style={[styles.vendorCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          onPress={() => handleVendorPress(item)}
        >
          {/* Image / Gradient placeholder */}
          <View style={styles.cardImageContainer}>
            {hasImage ? (
              <Image
                source={{ uri: (item as any).imageUrl }}
                style={styles.cardImage}
                resizeMode="cover"
              />
            ) : (
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardImage}
              >
                <View style={styles.placeholderIcon}>
                  <EvendiIcon name={getCatIcon(item.categoryName)} size={40} color="#fff" />
                </View>
              </LinearGradient>
            )}

            {/* Category badge on image */}
            <View style={styles.categoryBadge}>
              <EvendiIcon name={getCatIcon(item.categoryName)} size={12} color="#fff" />
              <ThemedText style={styles.categoryBadgeText}>
                {item.categoryName || "Leverandør"}
              </ThemedText>
            </View>

            {/* Save heart on image */}
            <Pressable
              style={styles.saveHeart}
              onPress={() => handleToggleSave(item.id)}
              hitSlop={12}
            >
              <EvendiIcon
                name="heart"
                size={22}
                color={item.saved ? "#EF4444" : "#fff"}
              />
            </Pressable>

            {/* Featured badge */}
            {item.isFeatured && (
              <View style={[styles.featuredTag, { backgroundColor: theme.accent }]}>
                <EvendiIcon name="star" size={11} color="#fff" />
                <ThemedText style={styles.featuredText}>Anbefalt</ThemedText>
              </View>
            )}
          </View>

          {/* Card content below image */}
          <View style={styles.cardContent}>
            <View style={styles.cardTopRow}>
              <ThemedText style={[styles.vendorName, { color: theme.text }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              {item.hasReviewBadge && (
                <View style={[styles.reviewBadge, { backgroundColor: theme.accent }]}>
                  <EvendiIcon name="award" size={11} color="#fff" />
                </View>
              )}
            </View>

            <View style={styles.locationRow}>
              <EvendiIcon name="map-pin" size={13} color={theme.textSecondary} />
              <ThemedText style={[styles.locationText, { color: theme.textSecondary }]}>
                {item.location}, {countryLabel(item.country)}
              </ThemedText>
            </View>

            <ThemedText style={[styles.descriptionText, { color: theme.textMuted }]} numberOfLines={2}>
              {item.description}
            </ThemedText>

            {/* Rating + price + CTA */}
            <View style={styles.cardBottomRow}>
              <View style={styles.ratingRow}>
                <View style={styles.starsRow}>{renderStars(item.rating)}</View>
                <ThemedText style={[styles.ratingNumber, { color: theme.text }]}>
                  {item.rating.toFixed(1)}
                </ThemedText>
                <View style={[styles.dot, { backgroundColor: theme.textMuted }]} />
                <ThemedText style={[styles.priceText, { color: theme.textSecondary }]} numberOfLines={1}>
                  {item.priceRange}
                </ThemedText>
              </View>

              <Pressable
                style={[styles.ctaButton, { backgroundColor: theme.accent }]}
                onPress={() => handleVendorPress(item)}
              >
                <ThemedText style={styles.ctaText}>Se Detaljer</ThemedText>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  // ── List header ──
  const ListHeader = () => {
    const eventTypeDropdownOptions = [
      { id: "all", name: "Alle arrangementer", icon: "🎉" },
      ...EVENT_TYPE_OPTIONS.map((o) => ({ id: o.value, name: o.label, icon: o.icon })),
    ];

    return (
      <>
        {/* Hero header with logo & gradient */}
        <LinearGradient
          colors={["#0F1B2D", "#1A2D47", "#243B5E"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.heroHeader}
        >
          <Image source={designSettings.logoUrl ? { uri: designSettings.logoUrl } : FALLBACK_LOGO} style={styles.logo} resizeMode="contain" />
        </LinearGradient>

        {/* Search bar */}
        <View
          style={[
            styles.searchBar,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
        >
          <EvendiIcon name="search" size={20} color={theme.textMuted} />
          <PersistentTextInput
            draftKey="VendorsScreen-search"
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Søk etter lokale, catering, DJ..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <EvendiIcon name="x" size={18} color={theme.textMuted} />
            </Pressable>
          )}
        </View>

        {/* Event Type + Category dropdowns */}
        <View style={styles.dropdownRow}>
          <View style={{ flex: 1 }}>
            <Dropdown
              label="Arrangementstype"
              value={selectedEventType}
              options={eventTypeDropdownOptions}
              onSelect={setSelectedEventType}
              icon="calendar"
              theme={theme}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Dropdown
              label="Kategori"
              value={selectedCategory}
              options={VENDOR_CATEGORY_DROPDOWN.map((c) => ({ id: c.id, name: c.name }))}
              onSelect={setSelectedCategory}
              icon="grid"
              theme={theme}
            />
          </View>
        </View>

        {/* Section title + result count */}
        <View style={styles.resultsRow}>
          <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
            {selectedCategory === "all"
              ? "Populære Leverandører"
              : VENDOR_CATEGORY_DROPDOWN.find((c) => c.id === selectedCategory)?.name || "Leverandører"}
          </ThemedText>
          <ThemedText style={[styles.resultsCount, { color: theme.textSecondary }]}>
            {filteredVendors.length} funnet
          </ThemedText>
        </View>

        {/* Smart vendor matching CTA */}
        <Pressable
          onPress={() => {
            const matchCategory =
              selectedCategory !== "all" ? selectedCategory : undefined;
            navigation.navigate("VendorMatching", {
              ...(matchCategory ? { category: matchCategory } : {}),
            });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          style={[
            styles.smartMatchBanner,
            { borderColor: theme.accent },
          ]}
        >
          <LinearGradient
            colors={[theme.accent + "18", theme.accent + "08"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.smartMatchGradient}
          >
            <View style={[styles.smartMatchIcon, { backgroundColor: theme.accent + "20" }]}>
              <EvendiIcon name="zap" size={22} color={theme.accent} />
            </View>
            <View style={styles.vendorCtaTextWrap}>
              <ThemedText style={[styles.vendorCtaTitle, { color: theme.text }]}>
                Finn din perfekte leverandør
              </ThemedText>
              <ThemedText style={[styles.vendorCtaSub, { color: theme.textSecondary }]}>
                Smart matching basert på dine preferanser og budsjett
              </ThemedText>
            </View>
            <EvendiIcon name="chevron-right" size={20} color={theme.accent} />
          </LinearGradient>
        </Pressable>

        {/* Vendor registration CTA */}
        <Pressable
          onPress={() => {
            navigation.navigate("VendorRegistration");
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          style={[
            styles.vendorCtaBanner,
            { backgroundColor: theme.accent + "12", borderColor: theme.accent + "40" },
          ]}
        >
          <EvendiIcon name="briefcase" size={20} color={theme.accent} />
          <View style={styles.vendorCtaTextWrap}>
            <ThemedText style={[styles.vendorCtaTitle, { color: theme.text }]}>
              Er du leverandør?
            </ThemedText>
            <ThemedText style={[styles.vendorCtaSub, { color: theme.textSecondary }]}>
              Registrer din bedrift og nå tusenvis av kunder
            </ThemedText>
          </View>
          <EvendiIcon name="chevron-right" size={20} color={theme.accent} />
        </Pressable>
      </>
    );
  };

  // ── Empty state ──
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <EmptyStateIllustration stateKey="vendors" />
      <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
        Ingen leverandører funnet
      </ThemedText>
      <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
        Prøv andre søkeord eller filtere
      </ThemedText>
    </View>
  );

  return (
    <FlatList
      data={filteredVendors}
      renderItem={renderVendorCard}
      keyExtractor={(item) => item.id}
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight,
        paddingBottom: tabBarHeight + Spacing.xl,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      ListHeaderComponent={ListHeader}
      ListEmptyComponent={
        isLoading ? (
          <ActivityIndicator size="large" color={theme.accent} style={{ paddingTop: 60 }} />
        ) : (
          EmptyState
        )
      }
      ItemSeparatorComponent={VendorSeparator}
      initialNumToRender={8}
      windowSize={5}
      maxToRenderPerBatch={8}
      removeClippedSubviews
    />
  );
}

// ────────────────────────────────────────────────────────────────
//  Styles
// ────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  // ── Hero header ──
  heroHeader: {
    alignItems: "center",
    paddingVertical: Spacing.lg,
    marginBottom: Spacing.md,
  },
  logo: {
    width: 160,
    height: 50,
  },

  // ── Search bar ──
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    height: 48,
  },

  // ── Dropdowns ──
  dropdownRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  dropdown: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  dropdownText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },

  // ── Modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  modalContent: {
    width: "100%",
    maxWidth: 360,
    borderRadius: 16,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.sm,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: Spacing.sm,
    borderRadius: 10,
  },
  modalOptionText: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
  },

  // ── Results row ──
  resultsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  resultsCount: {
    fontSize: 13,
  },

  // ── Vendor CTA banner ──
  vendorCtaBanner: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: Spacing.lg,
    padding: Spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  vendorCtaTextWrap: { flex: 1 },
  vendorCtaTitle: { fontSize: 15, fontWeight: "600" },
  vendorCtaSub: { fontSize: 13, marginTop: 2 },

  // ── Smart matching banner ──
  smartMatchBanner: {
    marginHorizontal: Spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    overflow: "hidden",
  },
  smartMatchGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    gap: Spacing.md,
  },
  smartMatchIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  // ── Vendor card ──
  vendorCard: {
    marginHorizontal: Spacing.lg,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  cardImageContainer: {
    width: "100%",
    height: 180,
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  placeholderIcon: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryBadge: {
    position: "absolute",
    bottom: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  categoryBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  saveHeart: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  featuredTag: {
    position: "absolute",
    top: 10,
    left: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  featuredText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
  },

  // ── Card content ──
  cardContent: {
    padding: Spacing.md,
    gap: 6,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  reviewBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 13,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  cardBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  starsRow: {
    flexDirection: "row",
    gap: 1,
  },
  ratingNumber: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 4,
  },
  priceText: {
    fontSize: 12,
    flexShrink: 1,
  },
  ctaButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: 20,
  },
  ctaText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },

  // ── Empty state ──
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    maxWidth: 260,
  },
});
