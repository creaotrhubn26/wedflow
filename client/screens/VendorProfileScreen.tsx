import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

interface VendorProfile {
  id: string;
  email: string;
  businessName: string;
  organizationNumber: string | null;
  description: string | null;
  location: string | null;
  phone: string | null;
  website: string | null;
  priceRange: string | null;
  imageUrl: string | null;
  googleReviewUrl: string | null;
  status: string;
  category: { id: string; name: string } | null;
}

interface CategoryDetails {
  // General fields
  yearsExperience?: number | null;
  weddingsCompleted?: number | null;
  insuranceVerified?: boolean | null;
  contractIncluded?: boolean | null;
  depositRequired?: boolean | null;
  depositPercentage?: number | null;
  cancellationPolicy?: string | null;
  languages?: string | null;
  // Venue specific
  venueCapacityMin?: number | null;
  venueCapacityMax?: number | null;
  venueHasAccommodation?: boolean | null;
  venueAccommodationCapacity?: number | null;
  venueHasParking?: boolean | null;
  venueParkingSpaces?: number | null;
  venueHasCatering?: boolean | null;
  venueOutdoorArea?: boolean | null;
  venueAccessibility?: boolean | null;
  venueAlcoholLicense?: boolean | null;
  // Photographer specific
  photoDeliveryDays?: number | null;
  photoStyleTags?: string | null;
  photoIncludesRaw?: boolean | null;
  photoIncludesAlbum?: boolean | null;
  photoSecondShooter?: boolean | null;
  photoDroneAvailable?: boolean | null;
  photoTravelIncluded?: boolean | null;
  photoTravelRadius?: number | null;
  // Florist specific
  floristDeliveryAvailable?: boolean | null;
  floristSetupIncluded?: boolean | null;
  floristRentalAvailable?: boolean | null;
  floristSeasonalFlowers?: boolean | null;
  floristPreservationService?: boolean | null;
  // Catering specific
  cateringMinGuests?: number | null;
  cateringMaxGuests?: number | null;
  cateringStaffIncluded?: boolean | null;
  cateringEquipmentIncluded?: boolean | null;
  cateringTastingAvailable?: boolean | null;
  cateringAlcoholService?: boolean | null;
  // Music specific
  musicEquipmentIncluded?: boolean | null;
  musicLightingIncluded?: boolean | null;
  musicMcServices?: boolean | null;
  musicPlaylistCustom?: boolean | null;
  musicLivePerformance?: boolean | null;
  // Cake specific
  cakeDeliveryIncluded?: boolean | null;
  cakeTastingAvailable?: boolean | null;
  cakeDessertsAvailable?: boolean | null;
  // Hair & Makeup specific
  beautyTrialIncluded?: boolean | null;
  beautyBridalParty?: boolean | null;
  beautyOnLocation?: boolean | null;
  beautyLashesAvailable?: boolean | null;
  // Transport specific
  transportCapacity?: number | null;
  transportDecorationIncluded?: boolean | null;
  transportChampagneIncluded?: boolean | null;
  // Planner specific
  plannerFullService?: boolean | null;
  plannerPartialService?: boolean | null;
  plannerDayOfCoordination?: boolean | null;
  plannerVendorNetwork?: boolean | null;
  plannerBudgetManagement?: boolean | null;
}

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export default function VendorProfileScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [businessName, setBusinessName] = useState("");
  const [organizationNumber, setOrganizationNumber] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [googleReviewUrl, setGoogleReviewUrl] = useState("");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  
  // Category-specific details state
  const [categoryDetails, setCategoryDetails] = useState<CategoryDetails>({});
  const [activeSection, setActiveSection] = useState<"basic" | "category" | "general">("basic");

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    const sessionData = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      setSessionToken(session.sessionToken);
    } else {
      navigation.replace("VendorLogin");
    }
  };

  const { data: profile, isLoading } = useQuery<VendorProfile>({
    queryKey: ["/api/vendor/profile"],
    queryFn: async () => {
      if (!sessionToken) throw new Error("Ikke innlogget");
      const response = await fetch(new URL("/api/vendor/profile", getApiUrl()).toString(), {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      if (!response.ok) throw new Error("Kunne ikke hente profil");
      return response.json();
    },
    enabled: !!sessionToken,
  });

  // Fetch category-specific details
  const { data: categoryDetailsData } = useQuery<{ details: CategoryDetails | null; categoryName: string | null }>({
    queryKey: ["/api/vendor/category-details"],
    queryFn: async () => {
      if (!sessionToken) throw new Error("Ikke innlogget");
      const response = await fetch(new URL("/api/vendor/category-details", getApiUrl()).toString(), {
        headers: {
          Authorization: `Bearer ${sessionToken}`,
        },
      });
      if (!response.ok) throw new Error("Kunne ikke hente kategori-detaljer");
      return response.json();
    },
    enabled: !!sessionToken,
  });

  // Pre-fill form when profile loads
  useEffect(() => {
    if (profile) {
      setBusinessName(profile.businessName || "");
      setOrganizationNumber(profile.organizationNumber || "");
      setDescription(profile.description || "");
      setLocation(profile.location || "");
      setPhone(profile.phone || "");
      setWebsite(profile.website || "");
      setPriceRange(profile.priceRange || "");
      setGoogleReviewUrl(profile.googleReviewUrl || "");
    }
  }, [profile]);

  // Pre-fill category details when loaded
  useEffect(() => {
    if (categoryDetailsData?.details) {
      setCategoryDetails(categoryDetailsData.details);
    }
  }, [categoryDetailsData]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!sessionToken) throw new Error("Ikke innlogget");
      
      const response = await fetch(new URL("/api/vendor/profile", getApiUrl()).toString(), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          businessName: businessName.trim(),
          organizationNumber: organizationNumber.trim() || null,
          description: description.trim() || null,
          location: location.trim() || null,
          phone: phone.trim() || null,
          website: website.trim() || null,
          priceRange: priceRange.trim() || null,
          googleReviewUrl: googleReviewUrl.trim() || null,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Kunne ikke oppdatere profil");
      }
      return response.json();
    },
    onSuccess: async (data) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Update session storage with new business name
      const sessionData = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
      if (sessionData) {
        const session = JSON.parse(sessionData);
        session.businessName = data.businessName;
        await AsyncStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(session));
      }
      
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/profile"] });
      Alert.alert("Lagret", "Profilen din er oppdatert");
    },
    onError: (error: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Feil", error.message);
    },
  });

  // Save category details
  const saveCategoryDetailsMutation = useMutation({
    mutationFn: async () => {
      if (!sessionToken) throw new Error("Ikke innlogget");
      
      const response = await fetch(new URL("/api/vendor/category-details", getApiUrl()).toString(), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify(categoryDetails),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Kunne ikke oppdatere detaljer");
      }
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/category-details"] });
      Alert.alert("Lagret", "Kategori-detaljene dine er oppdatert");
    },
    onError: (error: Error) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Feil", error.message);
    },
  });

  const handleSave = () => {
    if (!businessName.trim()) {
      Alert.alert("Ugyldig", "Bedriftsnavn er påkrevd");
      return;
    }
    saveMutation.mutate();
  };

  const handleSaveCategoryDetails = () => {
    saveCategoryDetailsMutation.mutate();
  };

  const updateCategoryDetail = (key: keyof CategoryDetails, value: any) => {
    setCategoryDetails(prev => ({ ...prev, [key]: value }));
  };

  // Helper to render category-specific fields based on vendor category
  const getCategoryName = () => profile?.category?.name || categoryDetailsData?.categoryName || "";

  // Navigate to detailed category screen
  const navigateToCategoryDetails = () => {
    const category = getCategoryName();
    const screenMap: Record<string, string> = {
      "Venue": "VenueDetails",
      "Fotograf": "PhotographerDetails",
      "Videograf": "PhotographerDetails",
      "Blomster": "FloristDetails",
      "Catering": "CateringDetails",
      "Musikk": "MusicDetails",
      "DJ": "MusicDetails",
      "Kake": "CakeDetails",
      "Hår & Makeup": "BeautyDetails",
      "Transport": "TransportDetails",
      "Planlegger": "PlannerDetails",
      "Koordinator": "PlannerDetails",
    };
    const screenName = screenMap[category];
    if (screenName) {
      navigation.navigate(screenName as any);
    }
  };

  const hasCategoryDetailsScreen = () => {
    const category = getCategoryName();
    return ["Venue", "Fotograf", "Videograf", "Blomster", "Catering", "Musikk", "DJ", "Kake", "Hår & Makeup", "Transport", "Planlegger", "Koordinator"].includes(category);
  };

  const renderCategoryFields = () => {
    const category = getCategoryName();
    
    switch (category) {
      case "Venue":
        return (
          <>
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Kapasitet (min gjester)</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                value={categoryDetails.venueCapacityMin?.toString() || ""}
                onChangeText={(v) => updateCategoryDetail("venueCapacityMin", v ? parseInt(v) : null)}
                placeholder="F.eks. 20"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Kapasitet (maks gjester)</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                value={categoryDetails.venueCapacityMax?.toString() || ""}
                onChangeText={(v) => updateCategoryDetail("venueCapacityMax", v ? parseInt(v) : null)}
                placeholder="F.eks. 150"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Overnatting tilgjengelig</ThemedText>
              <Switch
                value={categoryDetails.venueHasAccommodation || false}
                onValueChange={(v) => updateCategoryDetail("venueHasAccommodation", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.venueHasAccommodation ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            {categoryDetails.venueHasAccommodation && (
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Antall sengeplasser</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                  value={categoryDetails.venueAccommodationCapacity?.toString() || ""}
                  onChangeText={(v) => updateCategoryDetail("venueAccommodationCapacity", v ? parseInt(v) : null)}
                  placeholder="F.eks. 50"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="number-pad"
                />
              </View>
            )}
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Parkering</ThemedText>
              <Switch
                value={categoryDetails.venueHasParking || false}
                onValueChange={(v) => updateCategoryDetail("venueHasParking", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.venueHasParking ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            {categoryDetails.venueHasParking && (
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Antall p-plasser</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                  value={categoryDetails.venueParkingSpaces?.toString() || ""}
                  onChangeText={(v) => updateCategoryDetail("venueParkingSpaces", v ? parseInt(v) : null)}
                  placeholder="F.eks. 30"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="number-pad"
                />
              </View>
            )}
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Catering inkludert</ThemedText>
              <Switch
                value={categoryDetails.venueHasCatering || false}
                onValueChange={(v) => updateCategoryDetail("venueHasCatering", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.venueHasCatering ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Utendørs område</ThemedText>
              <Switch
                value={categoryDetails.venueOutdoorArea || false}
                onValueChange={(v) => updateCategoryDetail("venueOutdoorArea", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.venueOutdoorArea ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Universell utforming</ThemedText>
              <Switch
                value={categoryDetails.venueAccessibility || false}
                onValueChange={(v) => updateCategoryDetail("venueAccessibility", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.venueAccessibility ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Skjenkebevilling</ThemedText>
              <Switch
                value={categoryDetails.venueAlcoholLicense || false}
                onValueChange={(v) => updateCategoryDetail("venueAlcoholLicense", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.venueAlcoholLicense ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
          </>
        );
      
      case "Fotograf":
      case "Videograf":
        return (
          <>
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Leveringstid (dager)</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                value={categoryDetails.photoDeliveryDays?.toString() || ""}
                onChangeText={(v) => updateCategoryDetail("photoDeliveryDays", v ? parseInt(v) : null)}
                placeholder="F.eks. 30"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>RAW-filer inkludert</ThemedText>
              <Switch
                value={categoryDetails.photoIncludesRaw || false}
                onValueChange={(v) => updateCategoryDetail("photoIncludesRaw", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.photoIncludesRaw ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Album inkludert</ThemedText>
              <Switch
                value={categoryDetails.photoIncludesAlbum || false}
                onValueChange={(v) => updateCategoryDetail("photoIncludesAlbum", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.photoIncludesAlbum ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Second shooter tilgjengelig</ThemedText>
              <Switch
                value={categoryDetails.photoSecondShooter || false}
                onValueChange={(v) => updateCategoryDetail("photoSecondShooter", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.photoSecondShooter ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Dronefoto/-video</ThemedText>
              <Switch
                value={categoryDetails.photoDroneAvailable || false}
                onValueChange={(v) => updateCategoryDetail("photoDroneAvailable", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.photoDroneAvailable ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Reise inkludert</ThemedText>
              <Switch
                value={categoryDetails.photoTravelIncluded || false}
                onValueChange={(v) => updateCategoryDetail("photoTravelIncluded", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.photoTravelIncluded ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            {!categoryDetails.photoTravelIncluded && (
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Reiseradius (km) uten tillegg</ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                  value={categoryDetails.photoTravelRadius?.toString() || ""}
                  onChangeText={(v) => updateCategoryDetail("photoTravelRadius", v ? parseInt(v) : null)}
                  placeholder="F.eks. 50"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="number-pad"
                />
              </View>
            )}
          </>
        );
      
      case "Blomster":
        return (
          <>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Levering inkludert</ThemedText>
              <Switch
                value={categoryDetails.floristDeliveryAvailable || false}
                onValueChange={(v) => updateCategoryDetail("floristDeliveryAvailable", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.floristDeliveryAvailable ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Oppsett inkludert</ThemedText>
              <Switch
                value={categoryDetails.floristSetupIncluded || false}
                onValueChange={(v) => updateCategoryDetail("floristSetupIncluded", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.floristSetupIncluded ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Utleie av vaser/dekor</ThemedText>
              <Switch
                value={categoryDetails.floristRentalAvailable || false}
                onValueChange={(v) => updateCategoryDetail("floristRentalAvailable", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.floristRentalAvailable ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Sesongbaserte blomster</ThemedText>
              <Switch
                value={categoryDetails.floristSeasonalFlowers || false}
                onValueChange={(v) => updateCategoryDetail("floristSeasonalFlowers", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.floristSeasonalFlowers ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Bukettpreservering</ThemedText>
              <Switch
                value={categoryDetails.floristPreservationService || false}
                onValueChange={(v) => updateCategoryDetail("floristPreservationService", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.floristPreservationService ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
          </>
        );
      
      case "Catering":
        return (
          <>
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Minimum antall gjester</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                value={categoryDetails.cateringMinGuests?.toString() || ""}
                onChangeText={(v) => updateCategoryDetail("cateringMinGuests", v ? parseInt(v) : null)}
                placeholder="F.eks. 30"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Maksimum antall gjester</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                value={categoryDetails.cateringMaxGuests?.toString() || ""}
                onChangeText={(v) => updateCategoryDetail("cateringMaxGuests", v ? parseInt(v) : null)}
                placeholder="F.eks. 200"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Serveringspersonale inkludert</ThemedText>
              <Switch
                value={categoryDetails.cateringStaffIncluded || false}
                onValueChange={(v) => updateCategoryDetail("cateringStaffIncluded", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.cateringStaffIncluded ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Utstyr inkludert</ThemedText>
              <Switch
                value={categoryDetails.cateringEquipmentIncluded || false}
                onValueChange={(v) => updateCategoryDetail("cateringEquipmentIncluded", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.cateringEquipmentIncluded ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Smaksprøver tilgjengelig</ThemedText>
              <Switch
                value={categoryDetails.cateringTastingAvailable || false}
                onValueChange={(v) => updateCategoryDetail("cateringTastingAvailable", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.cateringTastingAvailable ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Drikkeservering</ThemedText>
              <Switch
                value={categoryDetails.cateringAlcoholService || false}
                onValueChange={(v) => updateCategoryDetail("cateringAlcoholService", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.cateringAlcoholService ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
          </>
        );
      
      case "Musikk":
        return (
          <>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Lydutstyr inkludert</ThemedText>
              <Switch
                value={categoryDetails.musicEquipmentIncluded || false}
                onValueChange={(v) => updateCategoryDetail("musicEquipmentIncluded", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.musicEquipmentIncluded ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Lyseffekter inkludert</ThemedText>
              <Switch
                value={categoryDetails.musicLightingIncluded || false}
                onValueChange={(v) => updateCategoryDetail("musicLightingIncluded", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.musicLightingIncluded ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Seremoni­mester/konferansier</ThemedText>
              <Switch
                value={categoryDetails.musicMcServices || false}
                onValueChange={(v) => updateCategoryDetail("musicMcServices", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.musicMcServices ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Tilpasset spilleliste</ThemedText>
              <Switch
                value={categoryDetails.musicPlaylistCustom || false}
                onValueChange={(v) => updateCategoryDetail("musicPlaylistCustom", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.musicPlaylistCustom ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Live-opptreden</ThemedText>
              <Switch
                value={categoryDetails.musicLivePerformance || false}
                onValueChange={(v) => updateCategoryDetail("musicLivePerformance", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.musicLivePerformance ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
          </>
        );
      
      case "Kake":
        return (
          <>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Levering inkludert</ThemedText>
              <Switch
                value={categoryDetails.cakeDeliveryIncluded || false}
                onValueChange={(v) => updateCategoryDetail("cakeDeliveryIncluded", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.cakeDeliveryIncluded ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Smaksprøver tilgjengelig</ThemedText>
              <Switch
                value={categoryDetails.cakeTastingAvailable || false}
                onValueChange={(v) => updateCategoryDetail("cakeTastingAvailable", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.cakeTastingAvailable ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Dessertbord tilgjengelig</ThemedText>
              <Switch
                value={categoryDetails.cakeDessertsAvailable || false}
                onValueChange={(v) => updateCategoryDetail("cakeDessertsAvailable", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.cakeDessertsAvailable ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
          </>
        );
      
      case "Hår & Makeup":
        return (
          <>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Prøvetime inkludert</ThemedText>
              <Switch
                value={categoryDetails.beautyTrialIncluded || false}
                onValueChange={(v) => updateCategoryDetail("beautyTrialIncluded", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.beautyTrialIncluded ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Brudefølge-tjenester</ThemedText>
              <Switch
                value={categoryDetails.beautyBridalParty || false}
                onValueChange={(v) => updateCategoryDetail("beautyBridalParty", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.beautyBridalParty ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Kommer til lokalet</ThemedText>
              <Switch
                value={categoryDetails.beautyOnLocation || false}
                onValueChange={(v) => updateCategoryDetail("beautyOnLocation", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.beautyOnLocation ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Vipper tilgjengelig</ThemedText>
              <Switch
                value={categoryDetails.beautyLashesAvailable || false}
                onValueChange={(v) => updateCategoryDetail("beautyLashesAvailable", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.beautyLashesAvailable ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
          </>
        );
      
      case "Transport":
        return (
          <>
            <View style={styles.inputGroup}>
              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Kapasitet (personer)</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                value={categoryDetails.transportCapacity?.toString() || ""}
                onChangeText={(v) => updateCategoryDetail("transportCapacity", v ? parseInt(v) : null)}
                placeholder="F.eks. 8"
                placeholderTextColor={theme.textMuted}
                keyboardType="number-pad"
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Dekorasjon inkludert</ThemedText>
              <Switch
                value={categoryDetails.transportDecorationIncluded || false}
                onValueChange={(v) => updateCategoryDetail("transportDecorationIncluded", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.transportDecorationIncluded ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Champagne inkludert</ThemedText>
              <Switch
                value={categoryDetails.transportChampagneIncluded || false}
                onValueChange={(v) => updateCategoryDetail("transportChampagneIncluded", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.transportChampagneIncluded ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
          </>
        );
      
      case "Planlegger":
        return (
          <>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Full planlegging</ThemedText>
              <Switch
                value={categoryDetails.plannerFullService || false}
                onValueChange={(v) => updateCategoryDetail("plannerFullService", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.plannerFullService ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Delvis planlegging</ThemedText>
              <Switch
                value={categoryDetails.plannerPartialService || false}
                onValueChange={(v) => updateCategoryDetail("plannerPartialService", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.plannerPartialService ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Dagskoordinering</ThemedText>
              <Switch
                value={categoryDetails.plannerDayOfCoordination || false}
                onValueChange={(v) => updateCategoryDetail("plannerDayOfCoordination", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.plannerDayOfCoordination ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Leverandørnettverk</ThemedText>
              <Switch
                value={categoryDetails.plannerVendorNetwork || false}
                onValueChange={(v) => updateCategoryDetail("plannerVendorNetwork", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.plannerVendorNetwork ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
            <View style={styles.switchRow}>
              <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Budsjettstyring</ThemedText>
              <Switch
                value={categoryDetails.plannerBudgetManagement || false}
                onValueChange={(v) => updateCategoryDetail("plannerBudgetManagement", v)}
                trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
                thumbColor={categoryDetails.plannerBudgetManagement ? Colors.dark.accent : theme.backgroundSecondary}
              />
            </View>
          </>
        );
      
      default:
        return (
          <ThemedText style={[styles.noCategoryText, { color: theme.textSecondary }]}>
            Ingen spesifikke felter for denne kategorien ennå.
          </ThemedText>
        );
    }
  };

  // Render general business details (applicable to all categories)
  const renderGeneralFields = () => (
    <>
      <View style={styles.inputGroup}>
        <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Antall års erfaring</ThemedText>
        <TextInput
          style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
          value={categoryDetails.yearsExperience?.toString() || ""}
          onChangeText={(v) => updateCategoryDetail("yearsExperience", v ? parseInt(v) : null)}
          placeholder="F.eks. 10"
          placeholderTextColor={theme.textMuted}
          keyboardType="number-pad"
        />
      </View>
      <View style={styles.inputGroup}>
        <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Antall bryllup gjennomført</ThemedText>
        <TextInput
          style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
          value={categoryDetails.weddingsCompleted?.toString() || ""}
          onChangeText={(v) => updateCategoryDetail("weddingsCompleted", v ? parseInt(v) : null)}
          placeholder="F.eks. 200"
          placeholderTextColor={theme.textMuted}
          keyboardType="number-pad"
        />
      </View>
      <View style={styles.switchRow}>
        <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Forsikring verifisert</ThemedText>
        <Switch
          value={categoryDetails.insuranceVerified || false}
          onValueChange={(v) => updateCategoryDetail("insuranceVerified", v)}
          trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
          thumbColor={categoryDetails.insuranceVerified ? Colors.dark.accent : theme.backgroundSecondary}
        />
      </View>
      <View style={styles.switchRow}>
        <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Kontrakt inkludert</ThemedText>
        <Switch
          value={categoryDetails.contractIncluded || false}
          onValueChange={(v) => updateCategoryDetail("contractIncluded", v)}
          trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
          thumbColor={categoryDetails.contractIncluded ? Colors.dark.accent : theme.backgroundSecondary}
        />
      </View>
      <View style={styles.switchRow}>
        <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Depositum påkrevd</ThemedText>
        <Switch
          value={categoryDetails.depositRequired || false}
          onValueChange={(v) => updateCategoryDetail("depositRequired", v)}
          trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
          thumbColor={categoryDetails.depositRequired ? Colors.dark.accent : theme.backgroundSecondary}
        />
      </View>
      {categoryDetails.depositRequired && (
        <View style={styles.inputGroup}>
          <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Depositum (%)</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
            value={categoryDetails.depositPercentage?.toString() || ""}
            onChangeText={(v) => updateCategoryDetail("depositPercentage", v ? parseInt(v) : null)}
            placeholder="F.eks. 30"
            placeholderTextColor={theme.textMuted}
            keyboardType="number-pad"
          />
        </View>
      )}
      <View style={styles.inputGroup}>
        <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Avbestillingsvilkår</ThemedText>
        <TextInput
          style={[styles.textArea, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
          value={categoryDetails.cancellationPolicy || ""}
          onChangeText={(v) => updateCategoryDetail("cancellationPolicy", v || null)}
          placeholder="Beskriv dine avbestillingsvilkår..."
          placeholderTextColor={theme.textMuted}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
    </>
  );

  const isValid = businessName.trim().length >= 2;

  if (isLoading || !profile) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.header, { paddingTop: insets.top + Spacing.md, backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
          <View style={styles.headerContent}>
            <View style={[styles.headerIconCircle, { backgroundColor: theme.accent }]}>
              <Feather name="user" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.headerTextContainer}>
              <ThemedText style={[styles.headerTitle, { color: theme.text }]}>Min profil</ThemedText>
              <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Laster...</ThemedText>
            </View>
          </View>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => [
              styles.closeButton,
              { backgroundColor: pressed ? theme.backgroundSecondary : theme.backgroundRoot },
            ]}
          >
            <Feather name="x" size={20} color={theme.textSecondary} />
          </Pressable>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md, backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <View style={[styles.headerIconCircle, { backgroundColor: theme.accent }]}>
            <Feather name="user" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.headerTextContainer}>
            <ThemedText style={[styles.headerTitle, { color: theme.text }]}>Min profil</ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Rediger bedriftsinformasjon</ThemedText>
          </View>
        </View>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.closeButton,
            { backgroundColor: pressed ? theme.backgroundSecondary : theme.backgroundRoot },
          ]}
        >
          <Feather name="x" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>

      <KeyboardAwareScrollViewCompat
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        {/* Status Badge */}
        <View style={[styles.statusCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.statusRow}>
            <ThemedText style={[styles.statusLabel, { color: theme.textSecondary }]}>Status:</ThemedText>
            <View style={[
              styles.statusBadge, 
              { backgroundColor: profile.status === "approved" ? "#4CAF5020" : profile.status === "pending" ? "#FF980020" : "#EF535020" }
            ]}>
              <ThemedText style={[
                styles.statusText, 
                { color: profile.status === "approved" ? "#4CAF50" : profile.status === "pending" ? "#FF9800" : "#EF5350" }
              ]}>
                {profile.status === "approved" ? "Godkjent" : profile.status === "pending" ? "Venter på godkjenning" : "Avvist"}
              </ThemedText>
            </View>
          </View>
          {profile.category && (
            <View style={styles.statusRow}>
              <ThemedText style={[styles.statusLabel, { color: theme.textSecondary }]}>Kategori:</ThemedText>
              <ThemedText style={[styles.categoryText, { color: theme.text }]}>{profile.category.name}</ThemedText>
            </View>
          )}
          <View style={styles.statusRow}>
            <ThemedText style={[styles.statusLabel, { color: theme.textSecondary }]}>E-post:</ThemedText>
            <ThemedText style={[styles.emailText, { color: theme.text }]}>{profile.email}</ThemedText>
          </View>
        </View>

        {/* Business Information */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: theme.accent + "15" }]}>
              <Feather name="briefcase" size={16} color={theme.accent} />
            </View>
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Bedriftsinformasjon</ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Bedriftsnavn <ThemedText style={{ color: "#EF5350" }}>*</ThemedText>
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              value={businessName}
              onChangeText={setBusinessName}
              placeholder="Ditt bedriftsnavn"
              placeholderTextColor={theme.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Organisasjonsnummer</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              value={organizationNumber}
              onChangeText={setOrganizationNumber}
              placeholder="123 456 789"
              placeholderTextColor={theme.textMuted}
              keyboardType="number-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Beskrivelse</ThemedText>
            <TextInput
              style={[styles.textArea, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Fortell om din bedrift og tjenester..."
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Contact Information */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: theme.accent + "15" }]}>
              <Feather name="phone" size={16} color={theme.accent} />
            </View>
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Kontaktinformasjon</ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Sted / Område</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              value={location}
              onChangeText={setLocation}
              placeholder="F.eks. Oslo, Bergen, hele Norge"
              placeholderTextColor={theme.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Telefon</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="+47 123 45 678"
              placeholderTextColor={theme.textMuted}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Nettside</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              value={website}
              onChangeText={setWebsite}
              placeholder="https://dinbedrift.no"
              placeholderTextColor={theme.textMuted}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Pricing & Reviews */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: theme.accent + "15" }]}>
              <Feather name="dollar-sign" size={16} color={theme.accent} />
            </View>
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Priser & Anmeldelser</ThemedText>
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Prisklasse</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              value={priceRange}
              onChangeText={setPriceRange}
              placeholder="F.eks. 15 000 - 50 000 kr"
              placeholderTextColor={theme.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Google anmeldelser URL</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              value={googleReviewUrl}
              onChangeText={setGoogleReviewUrl}
              placeholder="https://g.page/..."
              placeholderTextColor={theme.textMuted}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={!isValid || saveMutation.isPending}
          style={({ pressed }) => [
            styles.submitBtn,
            { backgroundColor: isValid ? theme.accent : theme.border },
            pressed && isValid && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
        >
          {saveMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <View style={styles.submitBtnIcon}>
                <Feather name="check" size={16} color="#FFFFFF" />
              </View>
              <ThemedText style={styles.submitBtnText}>Lagre endringer</ThemedText>
            </>
          )}
        </Pressable>

        {/* General Business Details */}
        <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, marginTop: Spacing.xl }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: theme.accent + "15" }]}>
              <Feather name="award" size={16} color={theme.accent} />
            </View>
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Generell forretningsinformasjon</ThemedText>
          </View>

          {renderGeneralFields()}
        </View>

        {/* Category-Specific Details */}
        {profile.category && (
          <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconCircle, { backgroundColor: theme.accent + "15" }]}>
                <Feather 
                  name={
                    getCategoryName() === "Venue" ? "home" :
                    getCategoryName() === "Fotograf" || getCategoryName() === "Videograf" ? "camera" :
                    getCategoryName() === "Blomster" ? "sun" :
                    getCategoryName() === "Catering" ? "coffee" :
                    getCategoryName() === "Musikk" ? "music" :
                    getCategoryName() === "Kake" ? "gift" :
                    getCategoryName() === "Hår & Makeup" ? "scissors" :
                    getCategoryName() === "Transport" ? "truck" :
                    getCategoryName() === "Planlegger" ? "clipboard" :
                    "settings"
                  }
                  size={16} 
                  color={theme.accent} 
                />
              </View>
              <View style={{ flex: 1, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
                  {getCategoryName()}-detaljer
                </ThemedText>
                {hasCategoryDetailsScreen() && (
                  <Pressable
                    onPress={navigateToCategoryDetails}
                    style={({ pressed }) => [
                      styles.detailsLinkBtn,
                      { backgroundColor: theme.accent + "15", borderColor: theme.accent },
                      pressed && { opacity: 0.8 }
                    ]}
                  >
                    <ThemedText style={[styles.detailsLinkText, { color: theme.accent }]}>Alle detaljer</ThemedText>
                    <Feather name="arrow-right" size={14} color={theme.accent} />
                  </Pressable>
                )}
              </View>
            </View>

            {renderCategoryFields()}
          </View>
        )}

        {/* Advanced Category Details - Navigate to full screen */}
        {profile.category && hasCategoryDetailsScreen() && (
          <Pressable
            onPress={navigateToCategoryDetails}
            style={({ pressed }) => [
              styles.advancedDetailsCard,
              { backgroundColor: theme.backgroundDefault, borderColor: theme.accent + "40" },
              pressed && { opacity: 0.9 }
            ]}
          >
            <View style={styles.advancedDetailsContent}>
              <View style={[styles.advancedDetailsIcon, { backgroundColor: theme.accent + "15" }]}>
                <Feather name="sliders" size={20} color={theme.accent} />
              </View>
              <View style={styles.advancedDetailsText}>
                <ThemedText style={[styles.advancedDetailsTitle, { color: theme.text }]}>
                  Utvidede {getCategoryName().toLowerCase()}-innstillinger
                </ThemedText>
                <ThemedText style={[styles.advancedDetailsSubtitle, { color: theme.textSecondary }]}>
                  Bordoppsett, fasiliteter, kapasitet og mer
                </ThemedText>
              </View>
            </View>
            <Feather name="chevron-right" size={20} color={theme.accent} />
          </Pressable>
        )}

        {/* Save Category Details Button */}
        <Pressable
          onPress={handleSaveCategoryDetails}
          disabled={saveCategoryDetailsMutation.isPending}
          style={({ pressed }) => [
            styles.submitBtn,
            { backgroundColor: theme.accent },
            pressed && { opacity: 0.9, transform: [{ scale: 0.98 }] },
          ]}
        >
          {saveCategoryDetailsMutation.isPending ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <View style={styles.submitBtnIcon}>
                <Feather name="save" size={16} color="#FFFFFF" />
              </View>
              <ThemedText style={styles.submitBtnText}>Lagre kategori-detaljer</ThemedText>
            </>
          )}
        </Pressable>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  statusCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: "500",
    width: 80,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
  },
  emailText: {
    fontSize: 14,
    flex: 1,
  },
  formCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
  },
  textArea: {
    minHeight: 100,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    fontSize: 15,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
    gap: Spacing.sm,
    shadowColor: "#C9A962",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
    marginRight: Spacing.md,
  },
  noCategoryText: {
    fontSize: 14,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: Spacing.lg,
  },
  detailsLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  detailsLinkText: {
    fontSize: 13,
    fontWeight: "600",
  },
  advancedDetailsCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    marginBottom: Spacing.md,
    borderStyle: "dashed" as any,
  },
  advancedDetailsContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  advancedDetailsIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  advancedDetailsText: {
    flex: 1,
  },
  advancedDetailsTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  advancedDetailsSubtitle: {
    fontSize: 13,
  },
});
