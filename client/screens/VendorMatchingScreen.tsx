import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ActivityIndicator,
  FlatList,
  Alert,
  ScrollView,
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
import { useEventType } from "@/hooks/useEventType";
import { isVendorCategoryApplicable, type EventType, type EventTypeConfig } from "@shared/event-types";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { PlanningStackParamList } from "@/navigation/PlanningStackNavigator";
import { getApiUrl } from "@/lib/query-client";
import { getCoupleProfile } from "@/lib/api-couples";
import { useVendorLocationIntelligence } from "@/hooks/useVendorLocationIntelligence";

const COUPLE_STORAGE_KEY = "wedflow_couple_session";

// Category configuration with icons and labels — event-type-aware
// Maps internal category IDs to their vendor category names in VENDOR_CATEGORY_EVENT_MAP
function getVendorCategories(eventType: EventType, isWedding: boolean, config: EventTypeConfig) {
  // Build a dynamic attire description from hints
  const attireHints = config.attireVendorHints?.storesNo;
  const attireDescription = isWedding
    ? "Brudekjole og dress"
    : attireHints && attireHints.length > 0
      ? `F.eks. ${attireHints.slice(0, 3).join(", ")}`
      : "Dresscode & antrekk";

  const attireLabel = config.featureLabels?.dressTracking?.no || (isWedding ? "Drakt & Dress" : "Antrekk");

  const allCategories = [
    { id: "venue", name: "Lokale", icon: "home" as const, description: "Finn det perfekte stedet", mapName: "Venue" },
    { id: "photographer", name: "Fotograf", icon: "camera" as const, description: "Fang de beste øyeblikkene", mapName: "Fotograf" },
    { id: "videographer", name: "Videograf", icon: "video" as const, description: isWedding ? "Film fra deres dag" : "Profesjonell film", mapName: "Videograf" },
    { id: "catering", name: "Catering", icon: "coffee" as const, description: "Mat til gjestene", mapName: "Catering" },
    { id: "florist", name: "Blomster", icon: "sun" as const, description: "Dekorasjon og buketter", mapName: "Blomster" },
    { id: "music", name: "Musikk/DJ", icon: "music" as const, description: "Stemning hele kvelden", mapName: "Musikk" },
    { id: "cake", name: "Kake", icon: "gift" as const, description: isWedding ? "Bryllupskaken" : "Festkaken", mapName: "Kake" },
    { id: "attire", name: attireLabel, icon: "shopping-bag" as const, description: attireDescription, mapName: "Drakt & Dress" },
    { id: "beauty", name: "Hår & Makeup", icon: "scissors" as const, description: "Se fantastisk ut", mapName: "Hår & Makeup" },
    { id: "transport", name: "Transport", icon: "truck" as const, description: "Reise med stil", mapName: "Transport" },
    { id: "planner", name: "Planlegger", icon: "clipboard" as const, description: "Profesjonell hjelp", mapName: "Planlegger" },
  ];

  return allCategories.filter(cat => isVendorCategoryApplicable(cat.mapName, eventType));
}

interface WeddingPreferences {
  guestCount: number | null;
  weddingDate: string | null;
  location: string | null;
  budget: number | null;
}

interface VendorProduct {
  id: string;
  vendorId: string;
  title: string;
  description: string | null;
  unitPrice: number;
  unitType: string;
  metadata: any | null;
  // Venue-specific fields
  venueAddress?: string | null;
  venueMaxGuests?: number | null;
  venueMinGuests?: number | null;
  venueCateringIncluded?: boolean;
  venueAccommodationAvailable?: boolean;
  venueCheckoutTime?: string | null;
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
  culturalExpertise?: string[] | null;
  // Capacity fields for matching
  venueCapacityMin?: number | null;
  venueCapacityMax?: number | null;
  cateringMinGuests?: number | null;
  cateringMaxGuests?: number | null;
  // Match score
  matchScore?: number;
  matchReasons?: string[];
  // Products
  products?: VendorProduct[];
}

type RouteParams = {
  VendorMatching: {
    category?: string;
    guestCount?: number;
    cuisineTypes?: string[];
    selectedTraditions?: string[];
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
  const { eventType, isWedding, config } = useEventType();
  const navigation = useNavigation<NativeStackNavigationProp<PlanningStackParamList>>();
  const route = useRoute<RouteProp<RouteParams, "VendorMatching">>();
  
  const initialCategory = route.params?.category || null;
  const initialGuestCount = route.params?.guestCount || null;
  const initialCuisineTypes = route.params?.cuisineTypes || [];
  const initialTraditions = route.params?.selectedTraditions || [];
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(initialCuisineTypes);
  const [selectedTraditions, setSelectedTraditions] = useState<string[]>(initialTraditions);
  const [preferences, setPreferences] = useState<WeddingPreferences>({
    guestCount: initialGuestCount,
    weddingDate: null,
    location: null,
    budget: null,
  });
  
  // Metadata filters
  const [filterTasteSample, setFilterTasteSample] = useState(false);
  const [filterVegetarian, setFilterVegetarian] = useState(false);
  const [filterVegan, setFilterVegan] = useState(false);
  const [filterCakeStyles, setFilterCakeStyles] = useState<string[]>([]);
  const [filterVehicleTypes, setFilterVehicleTypes] = useState<string[]>([]);
  const [filterServiceTypes, setFilterServiceTypes] = useState<string[]>([]);
  const [filterTrialSession, setFilterTrialSession] = useState(false);
  
  // Fotograf filters
  const [filterPhotoPackageTypes, setFilterPhotoPackageTypes] = useState<string[]>([]);
  const [filterPrintRights, setFilterPrintRights] = useState(false);
  const [filterRawPhotos, setFilterRawPhotos] = useState(false);
  
  // Videograf filters
  const [filterVideoPackageTypes, setFilterVideoPackageTypes] = useState<string[]>([]);
  const [filterDroneFootage, setFilterDroneFootage] = useState(false);
  const [filterEditingStyles, setFilterEditingStyles] = useState<string[]>([]);
  
  // Musikk filters
  const [filterPerformanceTypes, setFilterPerformanceTypes] = useState<string[]>([]);
  const [filterMusicGenres, setFilterMusicGenres] = useState<string[]>([]);
  const [filterEquipmentIncluded, setFilterEquipmentIncluded] = useState(false);
  
  // Venue filters
  const [filterIndoorOutdoor, setFilterIndoorOutdoor] = useState<string[]>([]);
  const [filterCateringIncluded, setFilterCateringIncluded] = useState(false);
  const [filterMinCapacity, setFilterMinCapacity] = useState<number | null>(null);
  
  // Planlegger filters
  const [filterServiceLevels, setFilterServiceLevels] = useState<string[]>([]);
  const [filterVendorCoordination, setFilterVendorCoordination] = useState(false);

  // Location intelligence
  const locationIntel = useVendorLocationIntelligence();

  // Event-type-aware vendor categories
  const vendorCategories = useMemo(() => getVendorCategories(eventType, isWedding, config), [eventType, isWedding, config]);

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

  // Fetch couple profile to get selected traditions
  const { data: coupleProfile } = useQuery({
    queryKey: ["coupleProfile"],
    queryFn: async () => {
      if (!sessionToken) throw new Error("No session");
      return getCoupleProfile(sessionToken);
    },
    enabled: !!sessionToken,
  });

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

  // Calculate travel for matched vendors when they load
  useEffect(() => {
    if (vendors.length > 0 && locationIntel.venueCoordinates) {
      const vendorsWithLocation = vendors
        .filter(v => v.location)
        .map(v => ({ id: v.id, businessName: v.businessName, location: v.location }));
      locationIntel.calculateBatchTravel(vendorsWithLocation);
    }
  }, [vendors, locationIntel.venueCoordinates]);

  // Score and sort vendors based on matching criteria
  const matchedVendors = useMemo(() => {
    if (!vendors.length) return [];
    
    // Apply metadata filters first
    let filtered = vendors;
    
    if (selectedCategory === "catering") {
      if (filterTasteSample || filterVegetarian || filterVegan) {
        filtered = filtered.filter(vendor => 
          vendor.products?.some(product => {
            const metadata = product.metadata || {};
            return (
              (!filterTasteSample || metadata.offersTasteSample) &&
              (!filterVegetarian || metadata.isVegetarian) &&
              (!filterVegan || metadata.isVegan)
            );
          })
        );
      }
    }
    
    if (selectedCategory === "cake") {
      if (filterCakeStyles.length > 0) {
        filtered = filtered.filter(vendor =>
          vendor.products?.some(product => {
            const metadata = product.metadata || {};
            return metadata.cakeStyle && filterCakeStyles.includes(metadata.cakeStyle);
          })
        );
      }
    }
    
    if (selectedCategory === "transport") {
      if (filterVehicleTypes.length > 0) {
        filtered = filtered.filter(vendor =>
          vendor.products?.some(product => {
            const metadata = product.metadata || {};
            return metadata.vehicleType && filterVehicleTypes.includes(metadata.vehicleType);
          })
        );
      }
    }
    
    if (selectedCategory === "beauty") {
      if (filterServiceTypes.length > 0 || filterTrialSession) {
        filtered = filtered.filter(vendor =>
          vendor.products?.some(product => {
            const metadata = product.metadata || {};
            return (
              (filterServiceTypes.length === 0 || (metadata.serviceType && filterServiceTypes.includes(metadata.serviceType))) &&
              (!filterTrialSession || metadata.includesTrialSession)
            );
          })
        );
      }
    }
    
    if (selectedCategory === "photographer") {
      if (filterPhotoPackageTypes.length > 0 || filterPrintRights || filterRawPhotos) {
        filtered = filtered.filter(vendor =>
          vendor.products?.some(product => {
            const metadata = product.metadata || {};
            return (
              (filterPhotoPackageTypes.length === 0 || (metadata.packageType && filterPhotoPackageTypes.includes(metadata.packageType))) &&
              (!filterPrintRights || metadata.printRightsIncluded) &&
              (!filterRawPhotos || metadata.rawPhotosIncluded)
            );
          })
        );
      }
    }
    
    if (selectedCategory === "videographer") {
      if (filterVideoPackageTypes.length > 0 || filterDroneFootage || filterEditingStyles.length > 0) {
        filtered = filtered.filter(vendor =>
          vendor.products?.some(product => {
            const metadata = product.metadata || {};
            return (
              (filterVideoPackageTypes.length === 0 || (metadata.packageType && filterVideoPackageTypes.includes(metadata.packageType))) &&
              (!filterDroneFootage || metadata.droneFootageIncluded) &&
              (filterEditingStyles.length === 0 || (metadata.editingStyle && filterEditingStyles.includes(metadata.editingStyle)))
            );
          })
        );
      }
    }
    
    if (selectedCategory === "music") {
      if (filterPerformanceTypes.length > 0 || filterMusicGenres.length > 0 || filterEquipmentIncluded) {
        filtered = filtered.filter(vendor =>
          vendor.products?.some(product => {
            const metadata = product.metadata || {};
            return (
              (filterPerformanceTypes.length === 0 || (metadata.performanceType && filterPerformanceTypes.includes(metadata.performanceType))) &&
              (filterMusicGenres.length === 0 || (metadata.genre && filterMusicGenres.includes(metadata.genre))) &&
              (!filterEquipmentIncluded || metadata.equipmentIncluded)
            );
          })
        );
      }
    }
    
    if (selectedCategory === "venue") {
      if (filterIndoorOutdoor.length > 0 || filterCateringIncluded || filterMinCapacity) {
        filtered = filtered.filter(vendor =>
          vendor.products?.some(product => {
            const metadata = product.metadata || {};
            return (
              (filterIndoorOutdoor.length === 0 || (metadata.indoorOutdoor && filterIndoorOutdoor.includes(metadata.indoorOutdoor))) &&
              (!filterCateringIncluded || product.venueCateringIncluded) &&
              (!filterMinCapacity || (product.venueMaxGuests && product.venueMaxGuests >= filterMinCapacity))
            );
          })
        );
      }
    }
    
    if (selectedCategory === "planner") {
      if (filterServiceLevels.length > 0 || filterVendorCoordination) {
        filtered = filtered.filter(vendor =>
          vendor.products?.some(product => {
            const metadata = product.metadata || {};
            return (
              (filterServiceLevels.length === 0 || (metadata.serviceLevel && filterServiceLevels.includes(metadata.serviceLevel))) &&
              (!filterVendorCoordination || metadata.vendorCoordinationIncluded)
            );
          })
        );
      }
    }
    
    return filtered.map(vendor => {
      let score = 50; // Base score
      const reasons: string[] = [];
      
      // Check capacity match for venues
      if (preferences.guestCount && selectedCategory === "venue") {
        const venueProduct = vendor.products?.find(p => p.venueMaxGuests || p.venueMinGuests);
        if (venueProduct?.venueMaxGuests && venueProduct?.venueMinGuests) {
          if (preferences.guestCount >= venueProduct.venueMinGuests && preferences.guestCount <= venueProduct.venueMaxGuests) {
            score += 30;
            reasons.push(`Passer for ${preferences.guestCount} gjester`);
          } else if (preferences.guestCount < venueProduct.venueMinGuests) {
            score -= 10;
            reasons.push(`Minimum ${venueProduct.venueMinGuests} gjester`);
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

      // Check cultural expertise match - use passed traditions OR couple profile traditions
      const coupleTraditions = selectedTraditions.length > 0 
        ? selectedTraditions 
        : (coupleProfile?.selectedTraditions || []);
        
      if (coupleTraditions.length > 0 && vendor.culturalExpertise) {
        const matchingTraditions = coupleTraditions.filter(
          tradition => vendor.culturalExpertise?.includes(tradition)
        );
        
        if (matchingTraditions.length > 0) {
          score += matchingTraditions.length * 30; // 30 points per matching tradition (increased from 25)
          const traditionNames = matchingTraditions.map(t => {
            const nameMap: Record<string, string> = {
              norway: "Norsk", sweden: "Svensk", denmark: "Dansk",
              hindu: "Hindu", sikh: "Sikh", muslim: "Muslim",
              jewish: "Jødisk", chinese: "Kinesisk"
            };
            return nameMap[t] || t;
          });
          reasons.push(`Ekspertise i ${traditionNames.join(", ")} tradisjoner`);
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
          reasons.push(`Kake for ${preferences.guestCount}+ gjester`);
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
          reasons.push("Erfaring med store arrangementer");
        } else if (preferences.guestCount < 30) {
          reasons.push("Intimt arrangement");
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
          reasons.push("Mellomstort arrangement");
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
      
      // Event date relevance (if vendor has availability info in the future)
      if (preferences.weddingDate) {
        const eventMonth = new Date(preferences.weddingDate).toLocaleDateString("nb-NO", { month: "long" });
        reasons.push(`${config.labelNo} i ${eventMonth}`);
      }
      
      return { ...vendor, matchScore: score, matchReasons: reasons };
    }).sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));
  }, [
    vendors, 
    preferences, 
    selectedCategory,
    selectedTraditions,
    selectedCuisines,
    coupleProfile,
    filterTasteSample, 
    filterVegetarian, 
    filterVegan, 
    filterCakeStyles, 
    filterVehicleTypes, 
    filterServiceTypes, 
    filterTrialSession,
    filterPhotoPackageTypes,
    filterPrintRights,
    filterRawPhotos,
    filterVideoPackageTypes,
    filterDroneFootage,
    filterEditingStyles,
    filterPerformanceTypes,
    filterMusicGenres,
    filterEquipmentIncluded,
    filterIndoorOutdoor,
    filterCateringIncluded,
    filterMinCapacity,
    filterServiceLevels,
    filterVendorCoordination
  ]);

  const getCategoryConfig = (categoryId: string) => {
    return vendorCategories.find(c => c.id === categoryId) || vendorCategories[0];
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // Reset filters when changing category
    setFilterTasteSample(false);
    setFilterVegetarian(false);
    setFilterVegan(false);
    setFilterCakeStyles([]);
    setFilterVehicleTypes([]);
    setFilterServiceTypes([]);
    setFilterTrialSession(false);
    setFilterPhotoPackageTypes([]);
    setFilterPrintRights(false);
    setFilterRawPhotos(false);
    setFilterVideoPackageTypes([]);
    setFilterDroneFootage(false);
    setFilterEditingStyles([]);
    setFilterPerformanceTypes([]);
    setFilterMusicGenres([]);
    setFilterEquipmentIncluded(false);
    setFilterIndoorOutdoor([]);
    setFilterCateringIncluded(false);
    setFilterMinCapacity(null);
    setFilterServiceLevels([]);
    setFilterVendorCoordination(false);
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

  const renderCategoryCard = (category: ReturnType<typeof getVendorCategories>[number], index: number) => {
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
        case "photographer": return gc > 100 ? "Stort arrangement" : gc < 30 ? "Intimt" : null;
        case "videographer": return gc > 100 ? "Stort arrangement" : gc < 30 ? "Intimt" : null;
        case "music": return gc > 80 ? "Stort selskap" : gc < 40 ? "Intimt" : null;
        case "beauty": return Math.ceil(gc / 20) > 3 ? `${Math.ceil(gc / 20)} personer` : null;
        case "planner": return gc > 100 ? "Komplekst" : null;
        case "attire": return config.attireVendorHints?.storesNo?.[0] || null;
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
              {/* Travel time badge from venue */}
              {locationIntel.getTravelBadge(item.id) && (
                <View style={styles.vendorTravelRow}>
                  <Feather name="navigation" size={10} color="#2196F3" />
                  <ThemedText style={styles.vendorTravelText}>
                    {locationIntel.getTravelBadge(item.id)}
                  </ThemedText>
                  {locationIntel.venueName && (
                    <ThemedText style={[styles.vendorTravelFrom, { color: theme.textMuted }]}>
                      fra {locationIntel.venueName}
                    </ThemedText>
                  )}
                </View>
              )}
              {locationIntel.getVendorTravel(item.id)?.isLoading && (
                <View style={styles.vendorTravelRow}>
                  <ActivityIndicator size={8} color="#2196F3" />
                  <ThemedText style={[styles.vendorTravelText, { color: theme.textMuted }]}>
                    Beregner...
                  </ThemedText>
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
          
          {/* Display vendor products with metadata */}
          {item.products && item.products.length > 0 && (
            <View style={styles.productsSection}>
              <ThemedText style={[styles.productsSectionTitle, { color: theme.textSecondary }]}>
                Tilbud ({item.products.length})
              </ThemedText>
              {item.products.slice(0, 3).map((product) => {
                const metadata = product.metadata || {};
                const formatPrice = (priceInOre: number) => {
                  return (priceInOre / 100).toLocaleString("nb-NO", { minimumFractionDigits: 0 }) + " kr";
                };
                
                return (
                  <View key={product.id} style={[styles.productCard, { backgroundColor: theme.backgroundRoot, borderColor: theme.border }]}>
                    <View style={styles.productHeader}>
                      <ThemedText style={[styles.productTitle, { color: theme.text }]} numberOfLines={1}>
                        {product.title}
                      </ThemedText>
                      <ThemedText style={[styles.productPrice, { color: theme.accent }]}>
                        {formatPrice(product.unitPrice)}
                      </ThemedText>
                    </View>
                    
                    {/* Category-specific metadata badges */}
                    <View style={styles.metadataRow}>
                      {/* Catering metadata */}
                      {metadata.offersTasteSample && (
                        <View style={[styles.metadataBadge, { backgroundColor: "#4CAF5015" }]}>
                          <Feather name="coffee" size={10} color="#4CAF50" />
                          <ThemedText style={[styles.metadataText, { color: "#4CAF50" }]}>Smaksprøve</ThemedText>
                        </View>
                      )}
                      {metadata.cuisineType && (
                        <View style={[styles.metadataBadge, { backgroundColor: theme.accent + "10" }]}>
                          <ThemedText style={[styles.metadataText, { color: theme.accent }]}>
                            {metadata.cuisineType.charAt(0).toUpperCase() + metadata.cuisineType.slice(1)}
                          </ThemedText>
                        </View>
                      )}
                      {metadata.isVegetarian && (
                        <View style={[styles.metadataBadge, { backgroundColor: "#8BC34A15" }]}>
                          <ThemedText style={[styles.metadataText, { color: "#8BC34A" }]}>Vegetar</ThemedText>
                        </View>
                      )}
                      {metadata.isVegan && (
                        <View style={[styles.metadataBadge, { backgroundColor: "#8BC34A15" }]}>
                          <ThemedText style={[styles.metadataText, { color: "#8BC34A" }]}>Vegan</ThemedText>
                        </View>
                      )}
                      
                      {/* Cake metadata */}
                      {metadata.cakeStyle && (
                        <View style={[styles.metadataBadge, { backgroundColor: theme.accent + "10" }]}>
                          <ThemedText style={[styles.metadataText, { color: theme.accent }]}>
                            {metadata.cakeStyle.charAt(0).toUpperCase() + metadata.cakeStyle.slice(1)}
                          </ThemedText>
                        </View>
                      )}
                      {metadata.numberOfTiers && (
                        <View style={[styles.metadataBadge, { backgroundColor: theme.accent + "10" }]}>
                          <ThemedText style={[styles.metadataText, { color: theme.accent }]}>
                            {metadata.numberOfTiers} etasjer
                          </ThemedText>
                        </View>
                      )}
                      
                      {/* Flower metadata */}
                      {metadata.flowerItemType && (
                        <View style={[styles.metadataBadge, { backgroundColor: theme.accent + "10" }]}>
                          <ThemedText style={[styles.metadataText, { color: theme.accent }]}>
                            {metadata.flowerItemType.charAt(0).toUpperCase() + metadata.flowerItemType.slice(1)}
                          </ThemedText>
                        </View>
                      )}
                      {metadata.isSeasonal && (
                        <View style={[styles.metadataBadge, { backgroundColor: "#FF980015" }]}>
                          <Feather name="sun" size={10} color="#FF9800" />
                          <ThemedText style={[styles.metadataText, { color: "#FF9800" }]}>Sesongbasert</ThemedText>
                        </View>
                      )}
                      
                      {/* Transport metadata */}
                      {metadata.vehicleType && (
                        <View style={[styles.metadataBadge, { backgroundColor: theme.accent + "10" }]}>
                          <Feather name="truck" size={10} color={theme.accent} />
                          <ThemedText style={[styles.metadataText, { color: theme.accent }]}>
                            {metadata.vehicleType.charAt(0).toUpperCase() + metadata.vehicleType.slice(1)}
                          </ThemedText>
                        </View>
                      )}
                      {metadata.passengerCapacity && (
                        <View style={[styles.metadataBadge, { backgroundColor: theme.accent + "10" }]}>
                          <Feather name="users" size={10} color={theme.accent} />
                          <ThemedText style={[styles.metadataText, { color: theme.accent }]}>
                            {metadata.passengerCapacity} plasser
                          </ThemedText>
                        </View>
                      )}
                      
                      {/* Hair & Makeup metadata */}
                      {metadata.serviceType && (
                        <View style={[styles.metadataBadge, { backgroundColor: theme.accent + "10" }]}>
                          <ThemedText style={[styles.metadataText, { color: theme.accent }]}>
                            {metadata.serviceType.charAt(0).toUpperCase() + metadata.serviceType.slice(1)}
                          </ThemedText>
                        </View>
                      )}
                      {metadata.includesTrialSession && (
                        <View style={[styles.metadataBadge, { backgroundColor: "#9C27B015" }]}>
                          <Feather name="check" size={10} color="#9C27B0" />
                          <ThemedText style={[styles.metadataText, { color: "#9C27B0" }]}>Prøveskyss</ThemedText>
                        </View>
                      )}
                      
                      {/* Fotograf metadata */}
                      {metadata.packageType && selectedCategory === "photographer" && (
                        <View style={[styles.metadataBadge, { backgroundColor: "#2196F315" }]}>
                          <ThemedText style={[styles.metadataText, { color: "#2196F3" }]}>
                            {metadata.packageType.charAt(0).toUpperCase() + metadata.packageType.slice(1)}
                          </ThemedText>
                        </View>
                      )}
                      {metadata.hoursIncluded && (
                        <View style={[styles.metadataBadge, { backgroundColor: theme.accent + "10" }]}>
                          <Feather name="clock" size={10} color={theme.accent} />
                          <ThemedText style={[styles.metadataText, { color: theme.accent }]}>
                            {metadata.hoursIncluded}t
                          </ThemedText>
                        </View>
                      )}
                      {metadata.photosDelivered && (
                        <View style={[styles.metadataBadge, { backgroundColor: "#2196F315" }]}>
                          <Feather name="image" size={10} color="#2196F3" />
                          <ThemedText style={[styles.metadataText, { color: "#2196F3" }]}>
                            {metadata.photosDelivered} bilder
                          </ThemedText>
                        </View>
                      )}
                      {metadata.printRightsIncluded && (
                        <View style={[styles.metadataBadge, { backgroundColor: "#00BCD415" }]}>
                          <Feather name="printer" size={10} color="#00BCD4" />
                          <ThemedText style={[styles.metadataText, { color: "#00BCD4" }]}>Trykkerett</ThemedText>
                        </View>
                      )}
                      {metadata.rawPhotosIncluded && (
                        <View style={[styles.metadataBadge, { backgroundColor: "#00BCD415" }]}>
                          <ThemedText style={[styles.metadataText, { color: "#00BCD4" }]}>RAW</ThemedText>
                        </View>
                      )}
                      
                      {/* Videograf metadata */}
                      {metadata.packageType && selectedCategory === "videographer" && (
                        <View style={[styles.metadataBadge, { backgroundColor: "#9C27B015" }]}>
                          <ThemedText style={[styles.metadataText, { color: "#9C27B0" }]}>
                            {metadata.packageType.charAt(0).toUpperCase() + metadata.packageType.slice(1)}
                          </ThemedText>
                        </View>
                      )}
                      {metadata.filmDurationMinutes && (
                        <View style={[styles.metadataBadge, { backgroundColor: theme.accent + "10" }]}>
                          <Feather name="film" size={10} color={theme.accent} />
                          <ThemedText style={[styles.metadataText, { color: theme.accent }]}>
                            {metadata.filmDurationMinutes} min
                          </ThemedText>
                        </View>
                      )}
                      {metadata.editingStyle && (
                        <View style={[styles.metadataBadge, { backgroundColor: "#673AB715" }]}>
                          <ThemedText style={[styles.metadataText, { color: "#673AB7" }]}>
                            {metadata.editingStyle.charAt(0).toUpperCase() + metadata.editingStyle.slice(1)}
                          </ThemedText>
                        </View>
                      )}
                      {metadata.droneFootageIncluded && (
                        <View style={[styles.metadataBadge, { backgroundColor: "#FF980015" }]}>
                          <Feather name="navigation" size={10} color="#FF9800" />
                          <ThemedText style={[styles.metadataText, { color: "#FF9800" }]}>Drone</ThemedText>
                        </View>
                      )}
                      
                      {/* Musikk metadata */}
                      {metadata.performanceType && (
                        <View style={[styles.metadataBadge, { backgroundColor: "#E91E6315" }]}>
                          <Feather name="music" size={10} color="#E91E63" />
                          <ThemedText style={[styles.metadataText, { color: "#E91E63" }]}>
                            {metadata.performanceType.toUpperCase()}
                          </ThemedText>
                        </View>
                      )}
                      {metadata.genre && (
                        <View style={[styles.metadataBadge, { backgroundColor: "#F4433615" }]}>
                          <ThemedText style={[styles.metadataText, { color: "#F44336" }]}>
                            {metadata.genre.charAt(0).toUpperCase() + metadata.genre.slice(1)}
                          </ThemedText>
                        </View>
                      )}
                      {metadata.performanceDurationHours && (
                        <View style={[styles.metadataBadge, { backgroundColor: theme.accent + "10" }]}>
                          <Feather name="clock" size={10} color={theme.accent} />
                          <ThemedText style={[styles.metadataText, { color: theme.accent }]}>
                            {metadata.performanceDurationHours}t
                          </ThemedText>
                        </View>
                      )}
                      {metadata.equipmentIncluded && (
                        <View style={[styles.metadataBadge, { backgroundColor: "#FF572215" }]}>
                          <Feather name="headphones" size={10} color="#FF5722" />
                          <ThemedText style={[styles.metadataText, { color: "#FF5722" }]}>Utstyr</ThemedText>
                        </View>
                      )}
                      
                      {/* Venue metadata */}
                      {metadata.capacityMax && (
                        <View style={[styles.metadataBadge, { backgroundColor: "#79554815" }]}>
                          <Feather name="users" size={10} color="#795548" />
                          <ThemedText style={[styles.metadataText, { color: "#795548" }]}>
                            {metadata.capacityMin && `${metadata.capacityMin}-`}{metadata.capacityMax} gjester
                          </ThemedText>
                        </View>
                      )}
                      {metadata.indoorOutdoor && (
                        <View style={[styles.metadataBadge, { backgroundColor: theme.accent + "10" }]}>
                          <ThemedText style={[styles.metadataText, { color: theme.accent }]}>
                            {metadata.indoorOutdoor.charAt(0).toUpperCase() + metadata.indoorOutdoor.slice(1)}
                          </ThemedText>
                        </View>
                      )}
                      {metadata.cateringIncluded && (
                        <View style={[styles.metadataBadge, { backgroundColor: "#8BC34A15" }]}>
                          <Feather name="coffee" size={10} color="#8BC34A" />
                          <ThemedText style={[styles.metadataText, { color: "#8BC34A" }]}>Catering</ThemedText>
                        </View>
                      )}
                      
                      {/* Planlegger metadata */}
                      {metadata.serviceLevel && (
                        <View style={[styles.metadataBadge, { backgroundColor: "#00BCD415" }]}>
                          <Feather name="clipboard" size={10} color="#00BCD4" />
                          <ThemedText style={[styles.metadataText, { color: "#00BCD4" }]}>
                            {metadata.serviceLevel.charAt(0).toUpperCase() + metadata.serviceLevel.slice(1)}
                          </ThemedText>
                        </View>
                      )}
                      {metadata.monthsOfService && (
                        <View style={[styles.metadataBadge, { backgroundColor: theme.accent + "10" }]}>
                          <Feather name="calendar" size={10} color={theme.accent} />
                          <ThemedText style={[styles.metadataText, { color: theme.accent }]}>
                            {metadata.monthsOfService} mnd
                          </ThemedText>
                        </View>
                      )}
                      {metadata.vendorCoordinationIncluded && (
                        <View style={[styles.metadataBadge, { backgroundColor: "#00968815" }]}>
                          <Feather name="users" size={10} color="#009688" />
                          <ThemedText style={[styles.metadataText, { color: "#009688" }]}>Koordinering</ThemedText>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
              {item.products.length > 3 && (
                <ThemedText style={[styles.moreProductsText, { color: theme.textMuted }]}>
                  +{item.products.length - 3} flere produkter
                </ThemedText>
              )}
            </View>
          )}
          
          {item.priceRange && (
            <View style={styles.priceRow}>
              <Feather name="tag" size={12} color={theme.textMuted} />
              <ThemedText style={[styles.priceText, { color: theme.textMuted }]}>{item.priceRange}</ThemedText>
            </View>
          )}

          {/* Location quick links */}
          {item.location && locationIntel.venueCoordinates && (
            <View style={[styles.vendorQuickLinks, { borderTopColor: theme.border }]}>
              <Pressable
                onPress={() => {
                  locationIntel.openDirections({
                    id: item.id,
                    businessName: item.businessName,
                    location: item.location,
                  });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[styles.vendorQuickLink, { backgroundColor: "#2196F308" }]}
              >
                <Feather name="navigation" size={11} color="#2196F3" />
                <ThemedText style={[styles.vendorQuickLinkText, { color: "#2196F3" }]}>Kjørerute</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => {
                  locationIntel.openVendorOnMap({
                    id: item.id,
                    businessName: item.businessName,
                    location: item.location,
                  });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[styles.vendorQuickLink, { backgroundColor: "#4CAF5008" }]}
              >
                <Feather name="map" size={11} color="#4CAF50" />
                <ThemedText style={[styles.vendorQuickLinkText, { color: "#4CAF50" }]}>Kart</ThemedText>
              </Pressable>
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
      {(preferences.guestCount || preferences.location || preferences.weddingDate || locationIntel.venueName) && (
        <Animated.View entering={FadeInDown.duration(300)} style={[styles.preferencesSummary, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={[styles.preferencesTitle, { color: theme.text }]}>Dine preferanser</ThemedText>
          <View style={styles.preferencesRow}>
            {preferences.guestCount && (
              <View style={[styles.preferenceChip, { backgroundColor: theme.accent + "15" }]}>
                <Feather name="users" size={12} color={theme.accent} />
                <ThemedText style={[styles.preferenceChipText, { color: theme.accent }]}>{preferences.guestCount} gjester</ThemedText>
              </View>
            )}
            {locationIntel.venueName && (
              <View style={[styles.preferenceChip, { backgroundColor: "#2196F315" }]}>
                <Feather name="map-pin" size={12} color="#2196F3" />
                <ThemedText style={[styles.preferenceChipText, { color: "#2196F3" }]}>{locationIntel.venueName}</ThemedText>
              </View>
            )}
            {preferences.location && !locationIntel.venueName && (
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
          data={vendorCategories}
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

          {/* Metadata Filters */}
          {selectedCategory && (
            <Animated.View entering={FadeInDown.duration(300).delay(100)} style={[styles.filtersSection, { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
              {/* Quick Filter Presets */}
              <View style={styles.quickFiltersRow}>
                <Feather name="zap" size={14} color={theme.accent} />
                <ThemedText style={[styles.quickFiltersLabel, { color: theme.textSecondary }]}>Hurtigvalg:</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickFiltersScroll}>
                  <Pressable
                    onPress={() => {
                      // Clear all filters
                      setFilterTasteSample(false);
                      setFilterVegetarian(false);
                      setFilterVegan(false);
                      setFilterCakeStyles([]);
                      setFilterVehicleTypes([]);
                      setFilterServiceTypes([]);
                      setFilterTrialSession(false);
                      setFilterPhotoPackageTypes([]);
                      setFilterPrintRights(false);
                      setFilterRawPhotos(false);
                      setFilterVideoPackageTypes([]);
                      setFilterDroneFootage(false);
                      setFilterEditingStyles([]);
                      setFilterPerformanceTypes([]);
                      setFilterMusicGenres([]);
                      setFilterEquipmentIncluded(false);
                      setFilterIndoorOutdoor([]);
                      setFilterCateringIncluded(false);
                      setFilterServiceLevels([]);
                      setFilterVendorCoordination(false);
                      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    }}
                    style={[styles.quickFilterChip, { backgroundColor: theme.backgroundRoot, borderColor: theme.border }]}
                  >
                    <Feather name="x-circle" size={12} color={theme.textMuted} />
                    <ThemedText style={[styles.quickFilterText, { color: theme.textMuted }]}>Nullstill</ThemedText>
                  </Pressable>
                  {selectedCategory === "photographer" && (
                    <>
                      <Pressable
                        onPress={() => {
                          setFilterPrintRights(true);
                          setFilterRawPhotos(true);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={[styles.quickFilterChip, { backgroundColor: theme.accent + "15", borderColor: theme.accent }]}
                      >
                        <ThemedText style={[styles.quickFilterText, { color: theme.accent }]}>Full rettigheter</ThemedText>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          setFilterPhotoPackageTypes(["heldag"]);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={[styles.quickFilterChip, { backgroundColor: theme.backgroundRoot, borderColor: theme.border }]}
                      >
                        <ThemedText style={[styles.quickFilterText, { color: theme.text }]}>Heldagspakker</ThemedText>
                      </Pressable>
                    </>
                  )}
                  {selectedCategory === "videographer" && (
                    <Pressable
                      onPress={() => {
                        setFilterDroneFootage(true);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={[styles.quickFilterChip, { backgroundColor: theme.accent + "15", borderColor: theme.accent }]}
                    >
                      <Feather name="navigation" size={12} color={theme.accent} />
                      <ThemedText style={[styles.quickFilterText, { color: theme.accent }]}>Med drone</ThemedText>
                    </Pressable>
                  )}
                  {selectedCategory === "venue" && (
                    <Pressable
                      onPress={() => {
                        setFilterCateringIncluded(true);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={[styles.quickFilterChip, { backgroundColor: theme.accent + "15", borderColor: theme.accent }]}
                    >
                      <Feather name="coffee" size={12} color={theme.accent} />
                      <ThemedText style={[styles.quickFilterText, { color: theme.accent }]}>Med catering</ThemedText>
                    </Pressable>
                  )}
                  {selectedCategory === "music" && (
                    <>
                      <Pressable
                        onPress={() => {
                          setFilterPerformanceTypes(["dj"]);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={[styles.quickFilterChip, { backgroundColor: theme.backgroundRoot, borderColor: theme.border }]}
                      >
                        <ThemedText style={[styles.quickFilterText, { color: theme.text }]}>Kun DJ</ThemedText>
                      </Pressable>
                      <Pressable
                        onPress={() => {
                          setFilterPerformanceTypes(["band"]);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={[styles.quickFilterChip, { backgroundColor: theme.backgroundRoot, borderColor: theme.border }]}
                      >
                        <ThemedText style={[styles.quickFilterText, { color: theme.text }]}>Kun band</ThemedText>
                      </Pressable>
                    </>
                  )}
                </ScrollView>
              </View>
              
              <View style={styles.filtersHeader}>
                <Feather name="filter" size={14} color={theme.textSecondary} />
                <ThemedText style={[styles.filtersTitle, { color: theme.textSecondary }]}>Filtre</ThemedText>
              </View>
              
              {/* Catering Filters */}
              {selectedCategory === "catering" && (
                <View style={styles.filterChips}>
                  <Pressable
                    onPress={() => {
                      setFilterTasteSample(!filterTasteSample);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[styles.filterChip, { 
                      backgroundColor: filterTasteSample ? "#4CAF50" : theme.backgroundRoot,
                      borderColor: filterTasteSample ? "#4CAF50" : theme.border 
                    }]}
                  >
                    <Feather name="coffee" size={12} color={filterTasteSample ? "#FFFFFF" : theme.textSecondary} />
                    <ThemedText style={[styles.filterChipText, { color: filterTasteSample ? "#FFFFFF" : theme.text }]}>
                      Smaksprøve
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setFilterVegetarian(!filterVegetarian);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[styles.filterChip, { 
                      backgroundColor: filterVegetarian ? "#8BC34A" : theme.backgroundRoot,
                      borderColor: filterVegetarian ? "#8BC34A" : theme.border 
                    }]}
                  >
                    <ThemedText style={[styles.filterChipText, { color: filterVegetarian ? "#FFFFFF" : theme.text }]}>
                      Vegetar
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setFilterVegan(!filterVegan);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[styles.filterChip, { 
                      backgroundColor: filterVegan ? "#8BC34A" : theme.backgroundRoot,
                      borderColor: filterVegan ? "#8BC34A" : theme.border 
                    }]}
                  >
                    <ThemedText style={[styles.filterChipText, { color: filterVegan ? "#FFFFFF" : theme.text }]}>
                      Vegan
                    </ThemedText>
                  </Pressable>
                </View>
              )}
              
              {/* Cake Filters */}
              {selectedCategory === "cake" && (
                <View style={styles.filterChips}>
                  {["elegant", "modern", "rustic", "whimsical"].map(style => (
                    <Pressable
                      key={style}
                      onPress={() => {
                        setFilterCakeStyles(prev => 
                          prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
                        );
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={[styles.filterChip, { 
                        backgroundColor: filterCakeStyles.includes(style) ? theme.accent : theme.backgroundRoot,
                        borderColor: filterCakeStyles.includes(style) ? theme.accent : theme.border 
                      }]}
                    >
                      <ThemedText style={[styles.filterChipText, { 
                        color: filterCakeStyles.includes(style) ? "#FFFFFF" : theme.text 
                      }]}>
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              )}
              
              {/* Transport Filters */}
              {selectedCategory === "transport" && (
                <View style={styles.filterChips}>
                  {["luxury-car", "vintage-car", "limousine", "bus", "van"].map(type => (
                    <Pressable
                      key={type}
                      onPress={() => {
                        setFilterVehicleTypes(prev => 
                          prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                        );
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={[styles.filterChip, { 
                        backgroundColor: filterVehicleTypes.includes(type) ? theme.accent : theme.backgroundRoot,
                        borderColor: filterVehicleTypes.includes(type) ? theme.accent : theme.border 
                      }]}
                    >
                      <Feather name="truck" size={12} color={filterVehicleTypes.includes(type) ? "#FFFFFF" : theme.textSecondary} />
                      <ThemedText style={[styles.filterChipText, { 
                        color: filterVehicleTypes.includes(type) ? "#FFFFFF" : theme.text 
                      }]}>
                        {type.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              )}
              
              {/* Hair & Makeup Filters */}
              {selectedCategory === "beauty" && (
                <View style={styles.filterChips}>
                  {["hair", "makeup", "both"].map(type => (
                    <Pressable
                      key={type}
                      onPress={() => {
                        setFilterServiceTypes(prev => 
                          prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                        );
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={[styles.filterChip, { 
                        backgroundColor: filterServiceTypes.includes(type) ? theme.accent : theme.backgroundRoot,
                        borderColor: filterServiceTypes.includes(type) ? theme.accent : theme.border 
                      }]}
                    >
                      <ThemedText style={[styles.filterChipText, { 
                        color: filterServiceTypes.includes(type) ? "#FFFFFF" : theme.text 
                      }]}>
                        {type === "both" ? "Begge" : type === "hair" ? "Hår" : "Makeup"}
                      </ThemedText>
                    </Pressable>
                  ))}
                  <Pressable
                    onPress={() => {
                      setFilterTrialSession(!filterTrialSession);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[styles.filterChip, { 
                      backgroundColor: filterTrialSession ? "#9C27B0" : theme.backgroundRoot,
                      borderColor: filterTrialSession ? "#9C27B0" : theme.border 
                    }]}
                  >
                    <Feather name="check" size={12} color={filterTrialSession ? "#FFFFFF" : theme.textSecondary} />
                    <ThemedText style={[styles.filterChipText, { color: filterTrialSession ? "#FFFFFF" : theme.text }]}>
                      Prøveskyss
                    </ThemedText>
                  </Pressable>
                </View>
              )}
              
              {/* Fotograf Filters */}
              {selectedCategory === "photographer" && (
                <View style={styles.filterChips}>
                  {["timebasert", "heldag", "flerdag"].map(type => (
                    <Pressable
                      key={type}
                      onPress={() => {
                        setFilterPhotoPackageTypes(prev => 
                          prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                        );
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={[styles.filterChip, { 
                        backgroundColor: filterPhotoPackageTypes.includes(type) ? "#2196F3" : theme.backgroundRoot,
                        borderColor: filterPhotoPackageTypes.includes(type) ? "#2196F3" : theme.border 
                      }]}
                    >
                      <ThemedText style={[styles.filterChipText, { 
                        color: filterPhotoPackageTypes.includes(type) ? "#FFFFFF" : theme.text 
                      }]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </ThemedText>
                    </Pressable>
                  ))}
                  <Pressable
                    onPress={() => {
                      setFilterPrintRights(!filterPrintRights);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[styles.filterChip, { 
                      backgroundColor: filterPrintRights ? "#00BCD4" : theme.backgroundRoot,
                      borderColor: filterPrintRights ? "#00BCD4" : theme.border 
                    }]}
                  >
                    <Feather name="printer" size={12} color={filterPrintRights ? "#FFFFFF" : theme.textSecondary} />
                    <ThemedText style={[styles.filterChipText, { color: filterPrintRights ? "#FFFFFF" : theme.text }]}>
                      Trykkerett
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      setFilterRawPhotos(!filterRawPhotos);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[styles.filterChip, { 
                      backgroundColor: filterRawPhotos ? "#00BCD4" : theme.backgroundRoot,
                      borderColor: filterRawPhotos ? "#00BCD4" : theme.border 
                    }]}
                  >
                    <Feather name="file" size={12} color={filterRawPhotos ? "#FFFFFF" : theme.textSecondary} />
                    <ThemedText style={[styles.filterChipText, { color: filterRawPhotos ? "#FFFFFF" : theme.text }]}>
                      RAW-filer
                    </ThemedText>
                  </Pressable>
                </View>
              )}
              
              {/* Videograf Filters */}
              {selectedCategory === "videographer" && (
                <View style={styles.filterChips}>
                  {["highlight", "fullfilm", "både"].map(type => (
                    <Pressable
                      key={type}
                      onPress={() => {
                        setFilterVideoPackageTypes(prev => 
                          prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                        );
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={[styles.filterChip, { 
                        backgroundColor: filterVideoPackageTypes.includes(type) ? "#9C27B0" : theme.backgroundRoot,
                        borderColor: filterVideoPackageTypes.includes(type) ? "#9C27B0" : theme.border 
                      }]}
                    >
                      <ThemedText style={[styles.filterChipText, { 
                        color: filterVideoPackageTypes.includes(type) ? "#FFFFFF" : theme.text 
                      }]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </ThemedText>
                    </Pressable>
                  ))}
                  {["cinematic", "documentary", "artistic"].map(style => (
                    <Pressable
                      key={style}
                      onPress={() => {
                        setFilterEditingStyles(prev => 
                          prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
                        );
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={[styles.filterChip, { 
                        backgroundColor: filterEditingStyles.includes(style) ? "#673AB7" : theme.backgroundRoot,
                        borderColor: filterEditingStyles.includes(style) ? "#673AB7" : theme.border 
                      }]}
                    >
                      <ThemedText style={[styles.filterChipText, { 
                        color: filterEditingStyles.includes(style) ? "#FFFFFF" : theme.text 
                      }]}>
                        {style.charAt(0).toUpperCase() + style.slice(1)}
                      </ThemedText>
                    </Pressable>
                  ))}
                  <Pressable
                    onPress={() => {
                      setFilterDroneFootage(!filterDroneFootage);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[styles.filterChip, { 
                      backgroundColor: filterDroneFootage ? "#FF9800" : theme.backgroundRoot,
                      borderColor: filterDroneFootage ? "#FF9800" : theme.border 
                    }]}
                  >
                    <Feather name="navigation" size={12} color={filterDroneFootage ? "#FFFFFF" : theme.textSecondary} />
                    <ThemedText style={[styles.filterChipText, { color: filterDroneFootage ? "#FFFFFF" : theme.text }]}>
                      Drone
                    </ThemedText>
                  </Pressable>
                </View>
              )}
              
              {/* Musikk Filters */}
              {selectedCategory === "music" && (
                <View style={styles.filterChips}>
                  {["band", "dj", "solo", "duo"].map(type => (
                    <Pressable
                      key={type}
                      onPress={() => {
                        setFilterPerformanceTypes(prev => 
                          prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                        );
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={[styles.filterChip, { 
                        backgroundColor: filterPerformanceTypes.includes(type) ? "#E91E63" : theme.backgroundRoot,
                        borderColor: filterPerformanceTypes.includes(type) ? "#E91E63" : theme.border 
                      }]}
                    >
                      <ThemedText style={[styles.filterChipText, { 
                        color: filterPerformanceTypes.includes(type) ? "#FFFFFF" : theme.text 
                      }]}>
                        {type.toUpperCase()}
                      </ThemedText>
                    </Pressable>
                  ))}
                  {["pop", "jazz", "rock", "klassisk"].map(genre => (
                    <Pressable
                      key={genre}
                      onPress={() => {
                        setFilterMusicGenres(prev => 
                          prev.includes(genre) ? prev.filter(g => g !== genre) : [...prev, genre]
                        );
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={[styles.filterChip, { 
                        backgroundColor: filterMusicGenres.includes(genre) ? "#F44336" : theme.backgroundRoot,
                        borderColor: filterMusicGenres.includes(genre) ? "#F44336" : theme.border 
                      }]}
                    >
                      <ThemedText style={[styles.filterChipText, { 
                        color: filterMusicGenres.includes(genre) ? "#FFFFFF" : theme.text 
                      }]}>
                        {genre.charAt(0).toUpperCase() + genre.slice(1)}
                      </ThemedText>
                    </Pressable>
                  ))}
                  <Pressable
                    onPress={() => {
                      setFilterEquipmentIncluded(!filterEquipmentIncluded);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[styles.filterChip, { 
                      backgroundColor: filterEquipmentIncluded ? "#FF5722" : theme.backgroundRoot,
                      borderColor: filterEquipmentIncluded ? "#FF5722" : theme.border 
                    }]}
                  >
                    <Feather name="headphones" size={12} color={filterEquipmentIncluded ? "#FFFFFF" : theme.textSecondary} />
                    <ThemedText style={[styles.filterChipText, { color: filterEquipmentIncluded ? "#FFFFFF" : theme.text }]}>
                      Utstyr inkl.
                    </ThemedText>
                  </Pressable>
                </View>
              )}
              
              {/* Venue Filters */}
              {selectedCategory === "venue" && (
                <View style={styles.filterChips}>
                  {["innendørs", "utendørs", "begge"].map(type => (
                    <Pressable
                      key={type}
                      onPress={() => {
                        setFilterIndoorOutdoor(prev => 
                          prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
                        );
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={[styles.filterChip, { 
                        backgroundColor: filterIndoorOutdoor.includes(type) ? "#795548" : theme.backgroundRoot,
                        borderColor: filterIndoorOutdoor.includes(type) ? "#795548" : theme.border 
                      }]}
                    >
                      <ThemedText style={[styles.filterChipText, { 
                        color: filterIndoorOutdoor.includes(type) ? "#FFFFFF" : theme.text 
                      }]}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </ThemedText>
                    </Pressable>
                  ))}
                  <Pressable
                    onPress={() => {
                      setFilterCateringIncluded(!filterCateringIncluded);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[styles.filterChip, { 
                      backgroundColor: filterCateringIncluded ? "#8BC34A" : theme.backgroundRoot,
                      borderColor: filterCateringIncluded ? "#8BC34A" : theme.border 
                    }]}
                  >
                    <Feather name="coffee" size={12} color={filterCateringIncluded ? "#FFFFFF" : theme.textSecondary} />
                    <ThemedText style={[styles.filterChipText, { color: filterCateringIncluded ? "#FFFFFF" : theme.text }]}>
                      Catering inkl.
                    </ThemedText>
                  </Pressable>
                </View>
              )}
              
              {/* Planlegger Filters */}
              {selectedCategory === "planner" && (
                <View style={styles.filterChips}>
                  {["full", "delvis", "dagskoordinering", "konsultasjon"].map(level => (
                    <Pressable
                      key={level}
                      onPress={() => {
                        setFilterServiceLevels(prev => 
                          prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
                        );
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={[styles.filterChip, { 
                        backgroundColor: filterServiceLevels.includes(level) ? "#00BCD4" : theme.backgroundRoot,
                        borderColor: filterServiceLevels.includes(level) ? "#00BCD4" : theme.border 
                      }]}
                    >
                      <ThemedText style={[styles.filterChipText, { 
                        color: filterServiceLevels.includes(level) ? "#FFFFFF" : theme.text 
                      }]}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </ThemedText>
                    </Pressable>
                  ))}
                  <Pressable
                    onPress={() => {
                      setFilterVendorCoordination(!filterVendorCoordination);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[styles.filterChip, { 
                      backgroundColor: filterVendorCoordination ? "#009688" : theme.backgroundRoot,
                      borderColor: filterVendorCoordination ? "#009688" : theme.border 
                    }]}
                  >
                    <Feather name="users" size={12} color={filterVendorCoordination ? "#FFFFFF" : theme.textSecondary} />
                    <ThemedText style={[styles.filterChipText, { color: filterVendorCoordination ? "#FFFFFF" : theme.text }]}>
                      Leverandørkoordinering
                    </ThemedText>
                  </Pressable>
                </View>
              )}
            </Animated.View>
          )}

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
  
  // Filters section
  filtersSection: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  quickFiltersRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  quickFiltersLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  quickFiltersScroll: {
    flex: 1,
  },
  quickFilterChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: 4,
    marginRight: Spacing.xs,
  },
  quickFilterText: {
    fontSize: 12,
    fontWeight: "600",
  },
  filtersHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  filtersTitle: { fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },
  filterChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterChipText: { fontSize: 12, fontWeight: "600" },
  
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
  
  // Product section styles
  productsSection: { marginTop: Spacing.sm, gap: Spacing.xs },
  productsSectionTitle: { fontSize: 12, fontWeight: "600", marginBottom: Spacing.xs },
  productCard: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xs,
  },
  productHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Spacing.xs },
  productTitle: { fontSize: 13, fontWeight: "600", flex: 1, marginRight: Spacing.sm },
  productPrice: { fontSize: 13, fontWeight: "700" },
  metadataRow: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  metadataBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  metadataText: { fontSize: 10, fontWeight: "600" },
  moreProductsText: { fontSize: 11, fontStyle: "italic", marginTop: Spacing.xs },
  
  // Vendor travel styles
  vendorTravelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 3,
  },
  vendorTravelText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#2196F3",
  },
  vendorTravelFrom: {
    fontSize: 9,
    fontStyle: "italic",
    flex: 1,
  },
  vendorQuickLinks: {
    flexDirection: "row",
    gap: 8,
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  vendorQuickLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.sm,
  },
  vendorQuickLinkText: {
    fontSize: 11,
    fontWeight: "600",
  },
});
