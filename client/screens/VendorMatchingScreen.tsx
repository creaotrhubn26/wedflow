import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ActivityIndicator,
  FlatList,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInRight, FadeInDown } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { PlanningStackParamList } from "@/navigation/PlanningStackNavigator";
import { getApiUrl } from "@/lib/query-client";

const COUPLE_STORAGE_KEY = "wedflow_couple_session";

// Category configuration with icons and labels
const VENDOR_CATEGORIES = [
  { id: "venue", name: "Lokale", icon: "home", description: "Finn det perfekte stedet" },
  { id: "photographer", name: "Fotograf", icon: "camera", description: "Fang de beste øyeblikkene" },
  { id: "videographer", name: "Videograf", icon: "video", description: "Film fra deres dag" },
  { id: "catering", name: "Catering", icon: "coffee", description: "Mat til gjestene" },
  { id: "florist", name: "Blomster", icon: "sun", description: "Dekorasjon og buketter" },
  { id: "music", name: "Musikk/DJ", icon: "music", description: "Stemning hele kvelden" },
  { id: "cake", name: "Kake", icon: "gift", description: "Bryllupskaken" },
  { id: "beauty", name: "Hår & Makeup", icon: "scissors", description: "Se fantastisk ut" },
  { id: "transport", name: "Transport", icon: "truck", description: "Reise med stil" },
  { id: "planner", name: "Planlegger", icon: "clipboard", description: "Profesjonell hjelp" },
] as const;

interface WeddingPreferences {
  guestCount: number | null;
  weddingDate: string | null;
  location: string | null;
  budget: number | null;
}

interface VendorMatch {
  id: string;
  businessName: string;
  categoryId: string | null;
  categoryName: string | null;
  description: string | null;
  location: string | null;
  priceRange: string | null;
  imageUrl: string | null;
  // Capacity fields for matching
  venueCapacityMin?: number | null;
  venueCapacityMax?: number | null;
  cateringMinGuests?: number | null;
  cateringMaxGuests?: number | null;
  // Match score
  matchScore?: number;
  matchReasons?: string[];
}

type RouteParams = {
  VendorMatching: {
    category?: string;
    guestCount?: number;
    cuisineTypes?: string[];
  };
};

// Cuisine types for matching (shared with CateringScreen)
const CUISINE_TYPES_MAP: Record<string, string[]> = {
  norwegian: ["norsk", "skandinavisk", "norwegian"],
  indian: ["indisk", "indian"],
  pakistani: ["pakistansk", "pakistani"],
  "middle-eastern": ["midtøsten", "middle eastern", "arabisk", "libanesisk"],
  mediterranean: ["middelhavet", "mediterranean", "gresk", "tyrkisk"],
  asian: ["asiatisk", "asian", "kinesisk", "japansk", "thai"],
  african: ["afrikansk", "african", "etiopisk"],
  mexican: ["meksikansk", "mexican", "latin"],
  italian: ["italiensk", "italian", "pasta"],
  french: ["fransk", "french"],
  american: ["amerikansk", "american", "bbq", "grill"],
  fusion: ["fusion", "moderne"],
  mixed: ["blandet", "mixed", "variert"],
};

export default function VendorMatchingScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<PlanningStackParamList>>();
  const route = useRoute<RouteProp<RouteParams, "VendorMatching">>();
  
  const initialCategory = route.params?.category || null;
  const initialGuestCount = route.params?.guestCount || null;
  const initialCuisineTypes = route.params?.cuisineTypes || [];
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(initialCuisineTypes);
  const [preferences, setPreferences] = useState<WeddingPreferences>({
    guestCount: initialGuestCount,
    weddingDate: null,
    location: null,
    budget: null,
  });

  useEffect(() => {
    loadSessionAndPreferences();
  }, []);

  const loadSessionAndPreferences = async () => {
    try {
      const sessionData = await AsyncStorage.getItem(COUPLE_STORAGE_KEY);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        setSessionToken(session.sessionToken);
      }
      
      // Load wedding details for preferences
      const weddingData = await AsyncStorage.getItem("@wedflow/wedding_details");
      if (weddingData) {
        const details = JSON.parse(weddingData);
        setPreferences(prev => ({
          ...prev,
          weddingDate: details.weddingDate || null,
          location: details.venue || null,
        }));
      }
    } catch (error) {
      console.error("Error loading session:", error);
    }
  };

  // Fetch couple's guest count from API
  const { data: guestData } = useQuery({
    queryKey: ["/api/couple/guests"],
    queryFn: async () => {
      if (!sessionToken) return [];
      const response = await fetch(new URL("/api/couple/guests", getApiUrl()).toString(), {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return response.ok ? response.json() : [];
    },
    enabled: !!sessionToken,
  });

  // Calculate guest count from API data
  useEffect(() => {
    if (guestData && Array.isArray(guestData)) {
      const confirmedGuests = guestData.filter((g: any) => g.status === "confirmed").length;
      const totalGuests = guestData.length;
      // Use confirmed if available, otherwise total, add buffer for plus-ones
      const estimatedCount = confirmedGuests > 0 ? confirmedGuests : totalGuests;
      if (estimatedCount > 0 && !initialGuestCount) {
        setPreferences(prev => ({ ...prev, guestCount: Math.ceil(estimatedCount * 1.1) })); // 10% buffer
      }
    }
  }, [guestData, initialGuestCount]);

  // Fetch vendors that match the category
  const { data: vendors = [], isLoading } = useQuery<VendorMatch[]>({
    queryKey: ["/api/vendors/matching", selectedCategory, preferences.guestCount, selectedCuisines],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (preferences.guestCount) params.append("guestCount", preferences.guestCount.toString());
      if (preferences.location) params.append("location", preferences.location);
      if (selectedCuisines.length > 0) params.append("cuisineTypes", selectedCuisines.join(","));
      
      const response = await fetch(
        new URL(`/api/vendors/matching?${params.toString()}`, getApiUrl()).toString()
      );
      return response.ok ? response.json() : [];
    },
    enabled: !!selectedCategory,
  });

  // Score and sort vendors based on matching criteria
  const matchedVendors = useMemo(() => {
    if (!vendors.length) return [];
    
    return vendors.map(vendor => {
      let score = 50; // Base score
      const reasons: string[] = [];
      
      // Check capacity match for venues
      if (preferences.guestCount && selectedCategory === "venue") {
        if (vendor.venueCapacityMin && vendor.venueCapacityMax) {
          if (preferences.guestCount >= vendor.venueCapacityMin && preferences.guestCount <= vendor.venueCapacityMax) {
            score += 30;
            reasons.push(`Passer for ${preferences.guestCount} gjester`);
          } else if (preferences.guestCount < vendor.venueCapacityMin) {
            score -= 10;
            reasons.push(`Minimum ${vendor.venueCapacityMin} gjester`);
          }
        }
      }
      
      // Check capacity match for catering
      if (preferences.guestCount && selectedCategory === "catering") {
        if (vendor.cateringMinGuests && vendor.cateringMaxGuests) {
          if (preferences.guestCount >= vendor.cateringMinGuests && preferences.guestCount <= vendor.cateringMaxGuests) {
            score += 30;
            reasons.push(`Kan servere ${preferences.guestCount} gjester`);
          }
        }
      }
      
      // Check cuisine match for catering
      if (selectedCategory === "catering" && selectedCuisines.length > 0 && vendor.description) {
        const descLower = vendor.description.toLowerCase();
        const nameLower = (vendor.businessName || "").toLowerCase();
        let cuisineMatches = 0;
        const matchedCuisineLabels: string[] = [];
        
        for (const cuisineKey of selectedCuisines) {
          const searchTerms = CUISINE_TYPES_MAP[cuisineKey] || [cuisineKey];
          const hasMatch = searchTerms.some(term => 
            descLower.includes(term) || nameLower.includes(term)
          );
          if (hasMatch) {
            cuisineMatches++;
            // Get the display label
            const label = cuisineKey.replace("-", " ").replace(/^\w/, c => c.toUpperCase());
            matchedCuisineLabels.push(label);
          }
        }
        
        if (cuisineMatches > 0) {
          score += cuisineMatches * 20; // 20 points per cuisine match
          reasons.push(`Tilbyr ${matchedCuisineLabels.join(", ")} mat`);
        }
      }
      
      // Check for cake - guest count affects cake size
      if (preferences.guestCount && selectedCategory === "cake") {
        if (preferences.guestCount <= 50) {
          reasons.push(`Kake for ~${preferences.guestCount} personer`);
          score += 15;
        } else if (preferences.guestCount <= 100) {
          reasons.push(`Stor kake for ~${preferences.guestCount} personer`);
          score += 15;
        } else {
          reasons.push(`Bryllupskake for ${preferences.guestCount}+ gjester`);
          score += 15;
        }
      }
      
      // Check for transport - guest count affects vehicle needs
      if (preferences.guestCount && selectedCategory === "transport") {
        const vehiclesNeeded = Math.ceil(preferences.guestCount / 50);
        if (vehiclesNeeded > 1) {
          reasons.push(`Transport for ${preferences.guestCount} gjester`);
        }
        score += 15;
      }
      
      // Photography/Videography - match based on event size
      if (preferences.guestCount && (selectedCategory === "photographer" || selectedCategory === "videographer")) {
        if (preferences.guestCount > 100) {
          reasons.push("Erfaring med store bryllup");
        } else if (preferences.guestCount < 30) {
          reasons.push("Intimt bryllup");
        }
        score += 15;
      }
      
      // Beauty - based on bridal party size (estimate from guest count)
      if (preferences.guestCount && selectedCategory === "beauty") {
        const bridalPartySize = Math.min(Math.ceil(preferences.guestCount / 20), 8);
        if (bridalPartySize > 3) {
          reasons.push(`Kan style ${bridalPartySize}+ personer`);
        }
        score += 10;
      }
      
      // Music/DJ - event size matters
      if (preferences.guestCount && selectedCategory === "music") {
        if (preferences.guestCount > 80) {
          reasons.push("Passer for stort selskap");
        } else if (preferences.guestCount < 40) {
          reasons.push("Intimt selskap");
        }
        score += 15;
      }
      
      // Florist - location and event size
      if (preferences.guestCount && selectedCategory === "florist") {
        const tableCount = Math.ceil(preferences.guestCount / 8);
        reasons.push(`~${tableCount} borddekorasjoner`);
        score += 10;
      }
      
      // Planner - match on complexity
      if (preferences.guestCount && selectedCategory === "planner") {
        if (preferences.guestCount > 100) {
          reasons.push("Erfaring med store arrangementer");
          score += 20;
        } else if (preferences.guestCount > 50) {
          reasons.push("Mellomstort bryllup");
          score += 15;
        }
      }
      
      // Location match for ALL categories
      if (preferences.location && vendor.location) {
        const vendorLoc = vendor.location.toLowerCase();
        const prefLoc = preferences.location.toLowerCase();
        if (vendorLoc.includes(prefLoc) || prefLoc.includes(vendorLoc)) {
          score += 25;
          reasons.push(`I ${vendor.location}`);
        }
      }
      
      // Wedding date relevance (if vendor has availability info in the future)
      if (preferences.weddingDate) {
        const weddingMonth = new Date(preferences.weddingDate).toLocaleDateString("nb-NO", { month: "long" });
        reasons.push(`Bryllup i ${weddingMonth}`);
      }
      
      return { ...vendor, matchScore: score, matchReasons: reasons };
    }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }, [vendors, preferences, selectedCategory]);

  const getCategoryConfig = (categoryId: string) => {
    return VENDOR_CATEGORIES.find(c => c.id === categoryId) || VENDOR_CATEGORIES[0];
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleVendorPress = (vendor: VendorMatch) => {
    navigation.navigate("VendorDetail", {
      vendorId: vendor.id,
      vendorName: vendor.businessName,
      vendorDescription: vendor.description || "",
      vendorLocation: vendor.location || "",
      vendorPriceRange: vendor.priceRange || "",
      vendorCategory: selectedCategory || "other",
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderCategoryCard = (category: typeof VENDOR_CATEGORIES[number], index: number) => {
    const isSelected = selectedCategory === category.id;
    const hasGuestCount = preferences.guestCount && preferences.guestCount > 0;
    const hasLocation = preferences.location && preferences.location.length > 0;
    const hasPreferences = hasGuestCount || hasLocation;
    
    // Get smart hint for each category based on preferences
    const getSmartHint = () => {
      if (!hasGuestCount) return null;
      const gc = preferences.guestCount!;
      switch (category.id) {
        case "venue": return `${gc} gjester`;
        case "catering": return `${gc} porsjoner`;
        case "cake": return gc > 100 ? "Stor kake" : gc > 50 ? "Mellomstor" : "Liten kake";
        case "florist": return `~${Math.ceil(gc / 8)} bord`;
        case "transport": return gc > 50 ? `${Math.ceil(gc / 50)} kjøretøy` : null;
        case "photographer": return gc > 100 ? "Stort bryllup" : gc < 30 ? "Intimt" : null;
        case "videographer": return gc > 100 ? "Stort bryllup" : gc < 30 ? "Intimt" : null;
        case "music": return gc > 80 ? "Stort selskap" : gc < 40 ? "Intimt" : null;
        case "beauty": return Math.ceil(gc / 20) > 3 ? `${Math.ceil(gc / 20)} personer` : null;
        case "planner": return gc > 100 ? "Komplekst" : null;
        default: return null;
      }
    };
    
    const smartHint = getSmartHint();
    
    return (
      <Animated.View key={category.id} entering={FadeInRight.delay(index * 50).duration(300)}>
        <Pressable
          onPress={() => handleCategorySelect(category.id)}
          style={[
            styles.categoryCard,
            { 
              backgroundColor: isSelected ? theme.accent + "15" : theme.backgroundDefault,
              borderColor: isSelected ? theme.accent : theme.border,
            },
          ]}
        >
          <View style={[styles.categoryIconCircle, { backgroundColor: isSelected ? theme.accent : theme.backgroundSecondary }]}>
            <Feather name={category.icon as any} size={20} color={isSelected ? "#FFFFFF" : theme.textSecondary} />
          </View>
          <View style={styles.categoryInfo}>
            <ThemedText style={[styles.categoryName, { color: isSelected ? theme.accent : theme.text }]}>
              {category.name}
            </ThemedText>
            <ThemedText style={[styles.categoryDesc, { color: theme.textSecondary }]} numberOfLines={1}>
              {category.description}
            </ThemedText>
          </View>
          {smartHint && (
            <View style={[styles.matchBadge, { backgroundColor: "#4CAF5020" }]}>
              <Feather name="zap" size={12} color="#4CAF50" />
              <ThemedText style={[styles.matchBadgeText, { color: "#4CAF50" }]}>{smartHint}</ThemedText>
            </View>
          )}
          <Feather name="chevron-right" size={18} color={theme.textMuted} />
        </Pressable>
      </Animated.View>
    );
  };

  const renderVendorCard = ({ item, index }: { item: VendorMatch; index: number }) => {
    const score = item.matchScore || 50;
    const isGoodMatch = score >= 70;
    
    return (
      <Animated.View entering={FadeInRight.delay(index * 50).duration(300)}>
        <Pressable
          onPress={() => handleVendorPress(item)}
          style={[styles.vendorCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          <View style={styles.vendorHeader}>
            <View style={[styles.vendorIconCircle, { backgroundColor: theme.accent + "15" }]}>
              <Feather name={getCategoryConfig(selectedCategory || "").icon as any} size={18} color={theme.accent} />
            </View>
            <View style={styles.vendorInfo}>
              <ThemedText style={[styles.vendorName, { color: theme.text }]}>{item.businessName}</ThemedText>
              {item.location && (
                <View style={styles.vendorLocationRow}>
                  <Feather name="map-pin" size={12} color={theme.textSecondary} />
                  <ThemedText style={[styles.vendorLocation, { color: theme.textSecondary }]}>{item.location}</ThemedText>
                </View>
              )}
            </View>
            {isGoodMatch && (
              <View style={[styles.matchIndicator, { backgroundColor: "#4CAF5015" }]}>
                <Feather name="star" size={14} color="#4CAF50" />
                <ThemedText style={[styles.matchText, { color: "#4CAF50" }]}>Anbefalt</ThemedText>
              </View>
            )}
          </View>
          
          {item.description && (
            <ThemedText style={[styles.vendorDescription, { color: theme.textSecondary }]} numberOfLines={2}>
              {item.description}
            </ThemedText>
          )}
          
          {item.matchReasons && item.matchReasons.length > 0 && (
            <View style={styles.reasonsRow}>
              {item.matchReasons.map((reason, i) => (
                <View key={i} style={[styles.reasonBadge, { backgroundColor: theme.accent + "10" }]}>
                  <Feather name="check-circle" size={10} color={theme.accent} />
                  <ThemedText style={[styles.reasonText, { color: theme.accent }]}>{reason}</ThemedText>
                </View>
              ))}
            </View>
          )}
          
          {item.priceRange && (
            <View style={styles.priceRow}>
              <Feather name="tag" size={12} color={theme.textMuted} />
              <ThemedText style={[styles.priceText, { color: theme.textMuted }]}>{item.priceRange}</ThemedText>
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md, backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={20} color={theme.text} />
          </Pressable>
          <View style={styles.headerTextContainer}>
            <ThemedText style={[styles.headerTitle, { color: theme.text }]}>Finn leverandører</ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              {preferences.guestCount 
                ? `Basert på ${preferences.guestCount} gjester`
                : "Velg kategori for å starte"}
            </ThemedText>
          </View>
        </View>
      </View>

      {/* Preferences Summary */}
      {(preferences.guestCount || preferences.location || preferences.weddingDate) && (
        <Animated.View entering={FadeInDown.duration(300)} style={[styles.preferencesSummary, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={[styles.preferencesTitle, { color: theme.text }]}>Dine preferanser</ThemedText>
          <View style={styles.preferencesRow}>
            {preferences.guestCount && (
              <View style={[styles.preferenceChip, { backgroundColor: theme.accent + "15" }]}>
                <Feather name="users" size={12} color={theme.accent} />
                <ThemedText style={[styles.preferenceChipText, { color: theme.accent }]}>{preferences.guestCount} gjester</ThemedText>
              </View>
            )}
            {preferences.location && (
              <View style={[styles.preferenceChip, { backgroundColor: theme.accent + "15" }]}>
                <Feather name="map-pin" size={12} color={theme.accent} />
                <ThemedText style={[styles.preferenceChipText, { color: theme.accent }]}>{preferences.location}</ThemedText>
              </View>
            )}
            {preferences.weddingDate && (
              <View style={[styles.preferenceChip, { backgroundColor: theme.accent + "15" }]}>
                <Feather name="calendar" size={12} color={theme.accent} />
                <ThemedText style={[styles.preferenceChipText, { color: theme.accent }]}>
                  {new Date(preferences.weddingDate).toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })}
                </ThemedText>
              </View>
            )}
          </View>
        </Animated.View>
      )}

      {/* Category Selection */}
      {!selectedCategory ? (
        <FlatList
          data={VENDOR_CATEGORIES}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => renderCategoryCard(item, index)}
          contentContainerStyle={[styles.categoryList, { paddingBottom: insets.bottom + Spacing.xl }]}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              Hvilken type leverandør trenger du?
            </ThemedText>
          }
        />
      ) : (
        <>
          {/* Selected Category Header */}
          <View style={[styles.selectedCategoryHeader, { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setSelectedCategory(null)} style={[styles.changeCategoryBtn, { borderColor: theme.border }]}>
              <Feather name="grid" size={14} color={theme.textSecondary} />
              <ThemedText style={[styles.changeCategoryText, { color: theme.textSecondary }]}>Endre kategori</ThemedText>
            </Pressable>
            <View style={styles.selectedCategoryInfo}>
              <View style={[styles.categoryIconCircle, { backgroundColor: theme.accent }]}>
                <Feather name={getCategoryConfig(selectedCategory).icon as any} size={16} color="#FFFFFF" />
              </View>
              <ThemedText style={[styles.selectedCategoryName, { color: theme.text }]}>
                {getCategoryConfig(selectedCategory).name}
              </ThemedText>
            </View>
          </View>

          {/* Vendor Results */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={theme.accent} />
              <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
                Finner leverandører som passer...
              </ThemedText>
            </View>
          ) : matchedVendors.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Feather name="search" size={48} color={theme.textMuted} />
              <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>Ingen leverandører funnet</ThemedText>
              <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
                Vi jobber med å få flere leverandører i denne kategorien.
              </ThemedText>
            </View>
          ) : (
            <FlatList
              data={matchedVendors}
              keyExtractor={(item) => item.id}
              renderItem={renderVendorCard}
              contentContainerStyle={[styles.vendorList, { paddingBottom: insets.bottom + Spacing.xl }]}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                <ThemedText style={[styles.resultsCount, { color: theme.textSecondary }]}>
                  {matchedVendors.length} leverandør{matchedVendors.length !== 1 ? "er" : ""} funnet
                </ThemedText>
              }
            />
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerContent: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  backButton: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  headerTextContainer: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  headerSubtitle: { fontSize: 13, marginTop: 2 },
  
  preferencesSummary: {
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  preferencesTitle: { fontSize: 13, fontWeight: "600", marginBottom: Spacing.sm },
  preferencesRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  preferenceChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  preferenceChipText: { fontSize: 12, fontWeight: "500" },
  
  sectionTitle: { fontSize: 16, fontWeight: "600", marginBottom: Spacing.md, paddingHorizontal: Spacing.md },
  categoryList: { paddingHorizontal: Spacing.md, paddingTop: Spacing.lg },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  categoryIconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  categoryInfo: { flex: 1 },
  categoryName: { fontSize: 15, fontWeight: "600" },
  categoryDesc: { fontSize: 12, marginTop: 2 },
  matchBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  matchBadgeText: { fontSize: 11, fontWeight: "600" },
  
  selectedCategoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  changeCategoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  changeCategoryText: { fontSize: 12, fontWeight: "500" },
  selectedCategoryInfo: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  selectedCategoryName: { fontSize: 15, fontWeight: "600" },
  
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", gap: Spacing.md },
  loadingText: { fontSize: 14 },
  
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: Spacing.xl, gap: Spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: "600", textAlign: "center" },
  emptyText: { fontSize: 14, textAlign: "center" },
  
  resultsCount: { fontSize: 13, marginBottom: Spacing.md, paddingHorizontal: Spacing.md },
  vendorList: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md },
  vendorCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  vendorHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.md, marginBottom: Spacing.sm },
  vendorIconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  vendorInfo: { flex: 1 },
  vendorName: { fontSize: 16, fontWeight: "600" },
  vendorLocationRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  vendorLocation: { fontSize: 12 },
  vendorDescription: { fontSize: 13, lineHeight: 18, marginBottom: Spacing.sm },
  matchIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  matchText: { fontSize: 11, fontWeight: "600" },
  reasonsRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs, marginBottom: Spacing.sm },
  reasonBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  reasonText: { fontSize: 11, fontWeight: "500" },
  priceRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  priceText: { fontSize: 12 },
});
