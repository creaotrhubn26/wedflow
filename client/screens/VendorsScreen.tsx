import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Pressable,
  TextInput,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInRight } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { CategoryIcon } from "@/components/CategoryIcon";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { Vendor } from "@/lib/types";
import { PlanningStackParamList } from "@/navigation/PlanningStackNavigator";

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
  isFeatured: boolean;
  isPrioritized: boolean;
  hasReviewBadge: boolean;
}

const SCANDINAVIAN_VENDORS: Vendor[] = [
  { id: "1", name: "Nordic Moments", categoryId: null, categoryName: "Fotograf", location: "Oslo", country: "Norway", rating: 4.9, priceRange: "25 000 - 40 000 kr", description: "Naturlig lys og tidløse øyeblikk", saved: false, isFeatured: false, isPrioritized: false, hasReviewBadge: false },
  { id: "2", name: "Stockholm Wedding Films", categoryId: null, categoryName: "Videograf", location: "Stockholm", country: "Sweden", rating: 4.8, priceRange: "30 000 - 50 000 kr", description: "Cinematiske bryllupsfilmer", saved: false, isFeatured: false, isPrioritized: false, hasReviewBadge: false },
  { id: "3", name: "Copenhagen Beats", categoryId: null, categoryName: "Musikk", location: "København", country: "Denmark", rating: 4.7, priceRange: "12 000 - 20 000 kr", description: "Stemningsfull musikk hele kvelden", saved: false, isFeatured: false, isPrioritized: false, hasReviewBadge: false },
  { id: "4", name: "Bergen Bryllupsfoto", categoryId: null, categoryName: "Fotograf", location: "Bergen", country: "Norway", rating: 4.9, priceRange: "20 000 - 35 000 kr", description: "Vestlandets mest ettertraktede", saved: false, isFeatured: false, isPrioritized: false, hasReviewBadge: false },
  { id: "5", name: "Malmö Films", categoryId: null, categoryName: "Videograf", location: "Malmö", country: "Sweden", rating: 4.6, priceRange: "25 000 - 45 000 kr", description: "Moderne og kreativt uttrykk", saved: false, isFeatured: false, isPrioritized: false, hasReviewBadge: false },
  { id: "6", name: "Oslo DJ Collective", categoryId: null, categoryName: "Musikk", location: "Oslo", country: "Norway", rating: 4.8, priceRange: "15 000 - 25 000 kr", description: "Profesjonelle bryllups-DJs", saved: false, isFeatured: false, isPrioritized: false, hasReviewBadge: false },
  { id: "7", name: "Trondheim Foto", categoryId: null, categoryName: "Fotograf", location: "Trondheim", country: "Norway", rating: 4.7, priceRange: "18 000 - 30 000 kr", description: "Autentiske bilder med sjel", saved: false, isFeatured: false, isPrioritized: false, hasReviewBadge: false },
  { id: "8", name: "Danish Wedding Films", categoryId: null, categoryName: "Videograf", location: "Aarhus", country: "Denmark", rating: 4.8, priceRange: "28 000 - 48 000 kr", description: "Fortellende bryllupsfilmer", saved: false, isFeatured: false, isPrioritized: false, hasReviewBadge: false },
  { id: "9", name: "Blomster & Bryllup", categoryId: null, categoryName: "Blomster", location: "Oslo", country: "Norway", rating: 4.9, priceRange: "8 000 - 25 000 kr", description: "Vakre buketter og dekorasjoner", saved: false, isFeatured: false, isPrioritized: false, hasReviewBadge: false },
  { id: "10", name: "Göteborg Events", categoryId: null, categoryName: "Catering", location: "Göteborg", country: "Sweden", rating: 4.7, priceRange: "500 - 1200 kr/person", description: "Nordisk gourmet-catering", saved: false, isFeatured: false, isPrioritized: false, hasReviewBadge: false },
];

const CATEGORIES = [
  { id: "all", name: "Alle", icon: "grid" },
  { id: "photographer", name: "Foto", icon: "camera" },
  { id: "videographer", name: "Video", icon: "video" },
  { id: "dj", name: "DJ", icon: "music" },
  { id: "florist", name: "Blomster", icon: "sun" },
  { id: "caterer", name: "Catering", icon: "coffee" },
];

const COUNTRIES = [
  { id: "all", name: "Skandinavia" },
  { id: "Norway", name: "Norge" },
  { id: "Sweden", name: "Sverige" },
  { id: "Denmark", name: "Danmark" },
];

interface ApiVendor {
  id: string;
  businessName: string;
  categoryId: string | null;
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

export default function VendorsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<PlanningStackParamList>>();

  const { data: apiVendors = [], isLoading } = useQuery<ApiVendor[]>({
    queryKey: ["/api/vendors"],
  });

  const allVendors: Vendor[] = [
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
      isFeatured: v.isFeatured,
      isPrioritized: v.isPrioritized,
      hasReviewBadge: v.hasReviewBadge,
      saved: false,
    })),
  ];

  const [savedVendors, setSavedVendors] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVendors = allVendors.filter((v) => {
    const matchesCategory = selectedCategory === "all" || v.categoryName === selectedCategory;
    const matchesCountry = selectedCountry === "all" || v.country === selectedCountry;
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesCountry && matchesSearch;
  }).map(v => ({ ...v, saved: savedVendors.has(v.id) }));

  const handleToggleSave = (id: string) => {
    setSavedVendors((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleVendorPress = (vendor: Vendor) => {
    navigation.navigate("VendorDetail", {
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorDescription: vendor.description,
      vendorLocation: vendor.location,
      vendorPriceRange: vendor.priceRange,
      vendorCategory: vendor.categoryName || "Ukjent",
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderVendorItem = ({ item, index }: { item: Vendor; index: number }) => {
    // Map category name from API to icon name
    const getIconName = (categoryName?: string): string => {
      if (!categoryName) return "camera";
      
      const iconMap: Record<string, string> = {
        "Fotograf": "camera",
        "Videograf": "film",
        "Blomster": "flower",
        "Catering": "coffee",
        "Musikk": "music",
        "Venue": "venue",
        "Kake": "cake",
        "Planlegger": "clipboard",
        "Hår & Makeup": "scissors",
        "Transport": "car",
        "Invitasjoner": "mail",
        "Underholdning": "sparkles",
        "Dekorasjon": "star",
        "Konfektyrer": "gift",
        "Bar & Drikke": "cocktail",
        "Fotoboks": "aperture",
        "Ringer": "diamond",
        "Drakt & Dress": "suit",
        "Overnatting": "bed",
        "Husdyr": "heart",
      };
      
      return iconMap[categoryName] || "camera";
    };

    return (
      <Animated.View entering={FadeInRight.delay(index * 50).duration(300)}>
        <Pressable
          style={[
            styles.vendorCard,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            (item as any).isFeatured && { borderColor: Colors.dark.accent, borderWidth: 2 },
          ]}
          onPress={() => handleVendorPress(item)}
        >
          <View style={[styles.vendorImage, { backgroundColor: theme.backgroundSecondary }]}>
            <CategoryIcon name={getIconName((item as any).categoryName)} size={28} color={Colors.dark.accent} />
            {(item as any).isFeatured && (
              <View style={[styles.featuredBadge, { backgroundColor: Colors.dark.accent }]}>
                <Feather name="star" size={10} color="#FFFFFF" />
              </View>
            )}
          </View>
          <View style={styles.vendorInfo}>
            <View style={styles.vendorHeader}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.xs, flex: 1 }}>
                <ThemedText style={styles.vendorName}>{item.name}</ThemedText>
                {(item as any).isPrioritized && !((item as any).isFeatured) && (
                  <Feather name="zap" size={14} color={Colors.dark.accent} />
                )}
                {(item as any).hasReviewBadge && (
                  <View style={[styles.reviewBadge, { backgroundColor: Colors.dark.accent }]}>
                    <Feather name="award" size={10} color="#FFFFFF" />
                  </View>
                )}
              </View>
            </View>
          </View>
          <View style={styles.vendorMeta}>
            <Feather name="map-pin" size={12} color={theme.textSecondary} />
            <ThemedText style={[styles.vendorLocation, { color: theme.textSecondary }]}>
              {item.location}, {item.country === "Norway" ? "Norge" : item.country === "Sweden" ? "Sverige" : "Danmark"}
            </ThemedText>
          </View>
          <ThemedText style={[styles.vendorDesc, { color: theme.textMuted }]} numberOfLines={1}>
            {item.description}
          </ThemedText>
          <View style={styles.vendorFooter}>
            <View style={styles.ratingContainer}>
              <Feather name="star" size={14} color={Colors.dark.accent} />
              <ThemedText style={[styles.rating, { color: Colors.dark.accent }]}>
                {item.rating}
              </ThemedText>
            </View>
            <ThemedText style={[styles.price, { color: theme.textSecondary }]}>
              {item.priceRange}
            </ThemedText>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  const ListHeader = () => (
    <>
      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
        ]}
      >
        <Feather name="search" size={18} color={theme.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Søk etter leverandør..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filtersRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                setSelectedCategory(item.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    selectedCategory === item.id ? Colors.dark.accent : theme.backgroundDefault,
                  borderColor: theme.border,
                },
              ]}
            >
              <Feather
                name={item.icon as any}
                size={14}
                color={selectedCategory === item.id ? "#1A1A1A" : theme.textSecondary}
              />
              <ThemedText
                style={[
                  styles.filterChipText,
                  { color: selectedCategory === item.id ? "#1A1A1A" : theme.text },
                ]}
              >
                {item.name}
              </ThemedText>
            </Pressable>
          )}
          contentContainerStyle={styles.filtersContent}
        />
      </View>

      <View style={styles.countryRow}>
        {COUNTRIES.map((country) => (
          <Pressable
            key={country.id}
            onPress={() => {
              setSelectedCountry(country.id);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[
              styles.countryChip,
              {
                backgroundColor:
                  selectedCountry === country.id ? theme.backgroundDefault : "transparent",
                borderColor: selectedCountry === country.id ? theme.border : "transparent",
              },
            ]}
          >
            <ThemedText
              style={[
                styles.countryText,
                {
                  color: selectedCountry === country.id ? Colors.dark.accent : theme.textSecondary,
                },
              ]}
            >
              {country.name}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ThemedText style={[styles.resultsCount, { color: theme.textSecondary }]}>
        {filteredVendors.length} leverandører funnet
      </ThemedText>

      <Pressable
        onPress={() => {
          navigation.navigate("VendorRegistration");
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
        style={[styles.vendorCta, { backgroundColor: theme.backgroundDefault, borderColor: Colors.dark.accent }]}
      >
        <View style={styles.vendorCtaContent}>
          <Feather name="briefcase" size={20} color={Colors.dark.accent} />
          <View style={styles.vendorCtaText}>
            <ThemedText style={styles.vendorCtaTitle}>Er du leverandør?</ThemedText>
            <ThemedText style={[styles.vendorCtaSubtitle, { color: theme.textSecondary }]}>
              Registrer din bedrift og nå tusenvis av brudepar
            </ThemedText>
          </View>
        </View>
        <Feather name="chevron-right" size={20} color={Colors.dark.accent} />
      </Pressable>
    </>
  );

  return (
    <FlatList
      data={filteredVendors}
      renderItem={renderVendorItem}
      keyExtractor={(item) => item.id}
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      ListHeaderComponent={ListHeader}
      ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  searchInput: { flex: 1, marginLeft: Spacing.sm, fontSize: 16 },
  filtersRow: { marginBottom: Spacing.sm, marginHorizontal: -Spacing.lg },
  filtersContent: { paddingHorizontal: Spacing.lg, gap: Spacing.sm },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterChipText: { fontSize: 13, marginLeft: Spacing.xs, fontWeight: "500" },
  countryRow: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
  },
  countryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  countryText: { fontSize: 13, fontWeight: "500" },
  resultsCount: { fontSize: 13, marginBottom: Spacing.md },
  vendorCard: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  vendorImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
    position: "relative",
  },
  featuredBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  vendorInfo: { flex: 1 },
  vendorHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  vendorName: { fontSize: 16, fontWeight: "600", flex: 1 },
  saveBtn: { padding: Spacing.xs },
  vendorMeta: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  vendorLocation: { fontSize: 12, marginLeft: Spacing.xs },
  vendorDesc: { fontSize: 13, marginTop: Spacing.xs },
  vendorFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: Spacing.sm },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  rating: { fontSize: 14, fontWeight: "600", marginLeft: Spacing.xs },
  price: { fontSize: 12 },
  vendorCta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  vendorCtaContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  vendorCtaText: {
    marginLeft: Spacing.md,
    flex: 1,
  },
  vendorCtaTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  vendorCtaSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
});
