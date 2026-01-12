import React, { useState } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  Pressable,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInRight } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { Vendor } from "@/lib/types";

const SCANDINAVIAN_VENDORS: Vendor[] = [
  { id: "1", name: "Nordic Moments", category: "photographer", location: "Oslo", country: "Norway", rating: 4.9, priceRange: "25 000 - 40 000 kr", description: "Naturlig lys og tidløse øyeblikk", saved: false },
  { id: "2", name: "Stockholm Wedding Films", category: "videographer", location: "Stockholm", country: "Sweden", rating: 4.8, priceRange: "30 000 - 50 000 kr", description: "Cinematiske bryllupsfilmer", saved: false },
  { id: "3", name: "Copenhagen Beats", category: "dj", location: "København", country: "Denmark", rating: 4.7, priceRange: "12 000 - 20 000 kr", description: "Stemningsfull musikk hele kvelden", saved: false },
  { id: "4", name: "Bergen Bryllupsfoto", category: "photographer", location: "Bergen", country: "Norway", rating: 4.9, priceRange: "20 000 - 35 000 kr", description: "Vestlandets mest ettertraktede", saved: false },
  { id: "5", name: "Malmö Films", category: "videographer", location: "Malmö", country: "Sweden", rating: 4.6, priceRange: "25 000 - 45 000 kr", description: "Moderne og kreativt uttrykk", saved: false },
  { id: "6", name: "Oslo DJ Collective", category: "dj", location: "Oslo", country: "Norway", rating: 4.8, priceRange: "15 000 - 25 000 kr", description: "Profesjonelle bryllups-DJs", saved: false },
  { id: "7", name: "Trondheim Foto", category: "photographer", location: "Trondheim", country: "Norway", rating: 4.7, priceRange: "18 000 - 30 000 kr", description: "Autentiske bilder med sjel", saved: false },
  { id: "8", name: "Danish Wedding Films", category: "videographer", location: "Aarhus", country: "Denmark", rating: 4.8, priceRange: "28 000 - 48 000 kr", description: "Fortellende bryllupsfilmer", saved: false },
  { id: "9", name: "Blomster & Bryllup", category: "florist", location: "Oslo", country: "Norway", rating: 4.9, priceRange: "8 000 - 25 000 kr", description: "Vakre buketter og dekorasjoner", saved: false },
  { id: "10", name: "Göteborg Events", category: "caterer", location: "Göteborg", country: "Sweden", rating: 4.7, priceRange: "500 - 1200 kr/person", description: "Nordisk gourmet-catering", saved: false },
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

export default function VendorsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [vendors, setVendors] = useState(SCANDINAVIAN_VENDORS);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedCountry, setSelectedCountry] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVendors = vendors.filter((v) => {
    const matchesCategory = selectedCategory === "all" || v.category === selectedCategory;
    const matchesCountry = selectedCountry === "all" || v.country === selectedCountry;
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesCountry && matchesSearch;
  });

  const handleToggleSave = (id: string) => {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, saved: !v.saved } : v))
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getCategoryIcon = (category: Vendor["category"]): keyof typeof Feather.glyphMap => {
    switch (category) {
      case "photographer": return "camera";
      case "videographer": return "video";
      case "dj": return "music";
      case "florist": return "sun";
      case "caterer": return "coffee";
      case "venue": return "home";
      default: return "briefcase";
    }
  };

  const renderVendorItem = ({ item, index }: { item: Vendor; index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 50).duration(300)}>
      <Pressable
        style={[
          styles.vendorCard,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        ]}
      >
        <View style={[styles.vendorImage, { backgroundColor: theme.backgroundSecondary }]}>
          <Feather name={getCategoryIcon(item.category)} size={24} color={Colors.dark.accent} />
        </View>
        <View style={styles.vendorInfo}>
          <View style={styles.vendorHeader}>
            <ThemedText style={styles.vendorName}>{item.name}</ThemedText>
            <Pressable onPress={() => handleToggleSave(item.id)} style={styles.saveBtn}>
              <Feather
                name={item.saved ? "heart" : "heart"}
                size={20}
                color={item.saved ? Colors.dark.accent : theme.textMuted}
              />
            </Pressable>
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
        </View>
      </Pressable>
    </Animated.View>
  );

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
});
