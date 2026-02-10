import React, { useState, useEffect, useMemo } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Switch,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { EvendiIcon } from "@/components/EvendiIcon";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { useEventType } from "@/hooks/useEventType";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import { CateringFields, CakeFields, FlowerFields, TransportFields, HairMakeupFields } from "@/lib/product-category-fields";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp, ParamListBase } from "@react-navigation/native";
import { showToast } from "@/lib/toast";
import { showConfirm } from "@/lib/dialogs";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

const UNIT_TYPES = [
  { value: "stk", label: "Stykk" },
  { value: "time", label: "Time" },
  { value: "dag", label: "Dag" },
  { value: "pakke", label: "Pakke" },
  { value: "m2", label: "m\u00B2" },
];

type VendorCategory =
  | "Catering"
  | "Kake"
  | "Blomster"
  | "Transport"
  | "H\u00E5r & Makeup"
  | "Fotograf"
  | "Videograf"
  | "Musikk"
  | "Venue"
  | "Planlegger"
  | "Fotograf og videograf"
  | null;

interface ProductMetadata {
  offersTasteSample?: boolean;
  cuisineType?: string;
  courseType?: string;
  servesCount?: number;
  isVegetarian?: boolean;
  isVegan?: boolean;
  isGlutenFree?: boolean;
  isDairyFree?: boolean;
  cakeStyle?: string;
  flavors?: string;
  servings?: number;
  tiers?: number;
  flowerItemType?: string;
  flowerTypes?: string;
  seasonalAvailability?: string;
  isSeasonalOnly?: boolean;
  itemType?: string;
  vehicleType?: string;
  passengerCapacity?: number;
  includesDriver?: boolean;
  vehicleDescription?: string;
  serviceType?: string;
  includesTrialSession?: boolean;
  lookType?: string;
  durationHours?: number;
  packageType?: string;
  hoursIncluded?: number;
  photosDelivered?: number;
  printRightsIncluded?: boolean;
  editedPhotosCount?: number;
  rawPhotosIncluded?: boolean;
  filmDurationMinutes?: number;
  editingStyle?: string;
  droneFootageIncluded?: boolean;
  rawFootageIncluded?: boolean;
  highlightReelIncluded?: boolean;
  performanceType?: string;
  genre?: string;
  equipmentIncluded?: boolean;
  soundCheckIncluded?: boolean;
  setlistCustomizable?: boolean;
  performanceDurationHours?: number;
  capacityMin?: number;
  capacityMax?: number;
  indoorOutdoor?: string;
  cateringIncluded?: boolean;
  parkingSpaces?: number;
  accessibilityFeatures?: string;
  serviceLevel?: string;
  monthsOfService?: number;
  numberOfMeetings?: number;
  vendorCoordinationIncluded?: boolean;
  combinedPackage?: string;
  totalHours?: number;
  photosIncluded?: boolean;
  videoIncluded?: boolean;
}

type TitleStatus = "idle" | "checking" | "available" | "duplicate" | "error";

interface ProductTemplate {
  name: string;
  title: string;
  price: string;
  unitType: string;
  hours?: string;
  photos?: string;
  printRights?: boolean;
  raw?: boolean;
  duration?: string;
  style?: string;
  drone?: boolean;
  highlight?: boolean;
  performanceType?: string;
  genre?: string;
  equipment?: boolean;
  capacityMin?: string;
  capacityMax?: string;
  indoor?: string;
  catering?: boolean;
  parking?: string;
  serviceLevel?: string;
  months?: string;
  meetings?: string;
  coordination?: boolean;
  cuisine?: string;
  tasteSample?: boolean;
  tiers?: string;
  servings?: string;
  itemType?: string;
  flowers?: string;
  vehicleType?: string;
  capacity?: string;
  driver?: boolean;
  serviceType?: string;
  trial?: boolean;
}

type ProductCreateRouteParams = { product?: any } | undefined;

interface Props {
  navigation: NativeStackNavigationProp<ParamListBase>;
  route: RouteProp<{ ProductCreate: ProductCreateRouteParams }, "ProductCreate">;
}

export default function ProductCreateScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const { isWedding } = useEventType();
  const queryClient = useQueryClient();
  
  const editingProduct = route.params?.product;
  const isEditMode = !!editingProduct;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [unitType, setUnitType] = useState("stk");
  const [leadTimeDays, setLeadTimeDays] = useState("");
  const [minQuantity, setMinQuantity] = useState("1");
  const [categoryTag, setCategoryTag] = useState("");
  const [trackInventory, setTrackInventory] = useState(false);
  const [availableQuantity, setAvailableQuantity] = useState("");
  const [bookingBuffer, setBookingBuffer] = useState("0");

  // Vendor category
  const [vendorCategory, setVendorCategory] = useState<VendorCategory>(null);

  // Category-specific metadata
  const [offersTasteSample, setOffersTasteSample] = useState(false);
  const [cuisineType, setCuisineType] = useState("");
  const [courseType, setCourseType] = useState("");
  const [isVegetarian, setIsVegetarian] = useState(false);
  const [isVegan, setIsVegan] = useState(false);
  const [isGlutenFree, setIsGlutenFree] = useState(false);
  const [isDairyFree, setIsDairyFree] = useState(false);
  const [cakeStyle, setCakeStyle] = useState("");
  const [flavors, setFlavors] = useState("");
  const [servings, setServings] = useState("");
  const [tiers, setTiers] = useState("");
  const [servesCount, setServesCount] = useState("");
  const [flowerItemType, setFlowerItemType] = useState("");
  const [flowerTypes, setFlowerTypes] = useState("");
  const [seasonalAvailability, setSeasonalAvailability] = useState("");
  const [isSeasonalOnly, setIsSeasonalOnly] = useState(false);
  const [vehicleType, setVehicleType] = useState("");
  const [passengerCapacity, setPassengerCapacity] = useState("");
  const [includesDriver, setIncludesDriver] = useState(false);
  const [vehicleDescription, setVehicleDescription] = useState("");
  const [serviceType, setServiceType] = useState("");
  const [includesTrialSession, setIncludesTrialSession] = useState(false);
  const [lookType, setLookType] = useState("");
  const [durationHours, setDurationHours] = useState("");
  
  // Fotograf metadata
  const [photoPackageType, setPhotoPackageType] = useState("");
  const [hoursIncluded, setHoursIncluded] = useState("");
  const [photosDelivered, setPhotosDelivered] = useState("");
  const [printRightsIncluded, setPrintRightsIncluded] = useState(false);
  const [editedPhotosCount, setEditedPhotosCount] = useState("");
  const [rawPhotosIncluded, setRawPhotosIncluded] = useState(false);
  
  // Videograf metadata
  const [videoPackageType, setVideoPackageType] = useState("");
  const [filmDurationMinutes, setFilmDurationMinutes] = useState("");
  const [editingStyle, setEditingStyle] = useState("");
  const [droneFootageIncluded, setDroneFootageIncluded] = useState(false);
  const [rawFootageIncluded, setRawFootageIncluded] = useState(false);
  const [highlightReelIncluded, setHighlightReelIncluded] = useState(false);
  
  // Musikk metadata
  const [performanceType, setPerformanceType] = useState("");
  const [musicGenre, setMusicGenre] = useState("");
  const [equipmentIncluded, setEquipmentIncluded] = useState(false);
  const [soundCheckIncluded, setSoundCheckIncluded] = useState(false);
  const [setlistCustomizable, setSetlistCustomizable] = useState(false);
  const [performanceDurationHours, setPerformanceDurationHours] = useState("");
  
  // Venue metadata
  const [capacityMin, setCapacityMin] = useState("");
  const [capacityMax, setCapacityMax] = useState("");
  const [indoorOutdoor, setIndoorOutdoor] = useState("");
  const [cateringIncluded, setCateringIncluded] = useState(false);
  const [parkingSpaces, setParkingSpaces] = useState("");
  const [accessibilityFeatures, setAccessibilityFeatures] = useState("");
  
  // Planlegger metadata
  const [serviceLevelType, setServiceLevelType] = useState("");
  const [monthsOfService, setMonthsOfService] = useState("");
  const [numberOfMeetings, setNumberOfMeetings] = useState("");
  const [vendorCoordinationIncluded, setVendorCoordinationIncluded] = useState(false);
  
  // FotoVideo combined metadata
  const [combinedPackage, setCombinedPackage] = useState("");
  const [totalHours, setTotalHours] = useState("");
  const [photosIncluded, setPhotosIncluded] = useState(false);
  const [videoIncluded, setVideoIncluded] = useState(false);
  
  const [metadata, setMetadata] = useState<ProductMetadata>({});
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [titleStatus, setTitleStatus] = useState<TitleStatus>("idle");
  const [matchingTitles, setMatchingTitles] = useState<string[]>([]);
  
  // UX improvements
  const [showAdvancedFields, setShowAdvancedFields] = useState(false);
  const [showTemplates, setShowTemplates] = useState(!isEditMode);
  const [showSmartFields, setShowSmartFields] = useState(false);

  // Smart defaults based on category
  const getSuggestedPrice = (category: string) => {
    const suggestions: Record<string, number> = {
      "Fotograf": 15000,
      "Videograf": 18000,
      "Musikk": 8000,
      "Venue": 35000,
      "Planlegger": 30000,
      "Catering": 650,
      "Kake": 4000,
      "Blomster": 1200,
      "Transport": 5500,
      "Hår & Makeup": 2500,
    };
    return suggestions[category] || 0;
  };

  const loadVendorCategory = async () => {
    const sessionData = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
    if (sessionData) {
      const session = JSON.parse(sessionData);
      const category = session.vendorCategory || null;
      setVendorCategory(category);
      setSessionToken(session.sessionToken || null);
      if (session.sessionToken) {
        await AsyncStorage.setItem("session_token", session.sessionToken);
      }
      
      // Auto-expand if editing or category has metadata
      if (isEditMode || category) {
        setShowAdvancedFields(true);
      }
    }
  };

  const applyMetadataToFields = (data: ProductMetadata) => {
    setOffersTasteSample(!!data.offersTasteSample);
    setCuisineType(data.cuisineType || "");
    setCourseType(data.courseType || "");
    setIsVegetarian(!!data.isVegetarian);
    setIsVegan(!!data.isVegan);
    setIsGlutenFree(!!data.isGlutenFree);
    setIsDairyFree(!!data.isDairyFree);
    setCakeStyle(data.cakeStyle || "");
    setFlavors(data.flavors || "");
    setServings(data.servings ? String(data.servings) : "");
    setTiers(data.tiers ? String(data.tiers) : "");
    setServesCount(data.servesCount ? String(data.servesCount) : "");
    setFlowerItemType(data.flowerItemType || data.itemType || "");
    setFlowerTypes(data.flowerTypes || "");
    setSeasonalAvailability(data.seasonalAvailability || "");
    setIsSeasonalOnly(!!data.isSeasonalOnly);
    setVehicleType(data.vehicleType || "");
    setPassengerCapacity(data.passengerCapacity ? String(data.passengerCapacity) : "");
    setIncludesDriver(!!data.includesDriver);
    setVehicleDescription(data.vehicleDescription || "");
    setServiceType(data.serviceType || "");
    setIncludesTrialSession(!!data.includesTrialSession);
    setLookType(data.lookType || "");
    setDurationHours(data.durationHours ? String(data.durationHours) : "");
    setPhotoPackageType(data.packageType || "");
    setHoursIncluded(data.hoursIncluded ? String(data.hoursIncluded) : "");
    setPhotosDelivered(data.photosDelivered ? String(data.photosDelivered) : "");
    setPrintRightsIncluded(!!data.printRightsIncluded);
    setEditedPhotosCount(data.editedPhotosCount ? String(data.editedPhotosCount) : "");
    setRawPhotosIncluded(!!data.rawPhotosIncluded);
    setVideoPackageType(data.packageType || "");
    setFilmDurationMinutes(data.filmDurationMinutes ? String(data.filmDurationMinutes) : "");
    setEditingStyle(data.editingStyle || "");
    setDroneFootageIncluded(!!data.droneFootageIncluded);
    setRawFootageIncluded(!!data.rawFootageIncluded);
    setHighlightReelIncluded(!!data.highlightReelIncluded);
    setPerformanceType(data.performanceType || "");
    setMusicGenre(data.genre || "");
    setEquipmentIncluded(!!data.equipmentIncluded);
    setSoundCheckIncluded(!!data.soundCheckIncluded);
    setSetlistCustomizable(!!data.setlistCustomizable);
    setPerformanceDurationHours(data.performanceDurationHours ? String(data.performanceDurationHours) : "");
    setCapacityMin(data.capacityMin ? String(data.capacityMin) : "");
    setCapacityMax(data.capacityMax ? String(data.capacityMax) : "");
    setIndoorOutdoor(data.indoorOutdoor || "");
    setCateringIncluded(!!data.cateringIncluded);
    setParkingSpaces(data.parkingSpaces ? String(data.parkingSpaces) : "");
    setAccessibilityFeatures(data.accessibilityFeatures || "");
    setServiceLevelType(data.serviceLevel || "");
    setMonthsOfService(data.monthsOfService ? String(data.monthsOfService) : "");
    setNumberOfMeetings(data.numberOfMeetings ? String(data.numberOfMeetings) : "");
    setVendorCoordinationIncluded(!!data.vendorCoordinationIncluded);
    setCombinedPackage(data.combinedPackage || "");
    setTotalHours(data.totalHours ? String(data.totalHours) : "");
    setPhotosIncluded(!!data.photosIncluded);
    setVideoIncluded(!!data.videoIncluded);
  };

  const buildProductMetadataFromFields = (): ProductMetadata => {
    const productMetadata: ProductMetadata = {};
    if (!vendorCategory) return productMetadata;
    if (vendorCategory === "Catering") {
      productMetadata.offersTasteSample = offersTasteSample;
      if (cuisineType) productMetadata.cuisineType = cuisineType;
      if (courseType) productMetadata.courseType = courseType;
      if (servesCount) productMetadata.servesCount = parseInt(servesCount);
      productMetadata.isVegetarian = isVegetarian;
      productMetadata.isVegan = isVegan;
      productMetadata.isGlutenFree = isGlutenFree;
      productMetadata.isDairyFree = isDairyFree;
    } else if (vendorCategory === "Kake") {
      productMetadata.offersTasteSample = offersTasteSample;
      if (cakeStyle) productMetadata.cakeStyle = cakeStyle;
      if (flavors) productMetadata.flavors = flavors;
      if (servings) productMetadata.servings = parseInt(servings);
      if (tiers) productMetadata.tiers = parseInt(tiers);
    } else if (vendorCategory === "Blomster") {
      if (flowerItemType) {
        productMetadata.flowerItemType = flowerItemType;
        productMetadata.itemType = flowerItemType;
      }
      if (flowerTypes) productMetadata.flowerTypes = flowerTypes;
      if (seasonalAvailability) productMetadata.seasonalAvailability = seasonalAvailability;
      productMetadata.isSeasonalOnly = isSeasonalOnly;
    } else if (vendorCategory === "Transport") {
      if (vehicleType) productMetadata.vehicleType = vehicleType;
      if (passengerCapacity) productMetadata.passengerCapacity = parseInt(passengerCapacity);
      productMetadata.includesDriver = includesDriver;
      if (vehicleDescription) productMetadata.vehicleDescription = vehicleDescription;
    } else if (vendorCategory === "H\u00E5r & Makeup") {
      if (serviceType) productMetadata.serviceType = serviceType;
      productMetadata.includesTrialSession = includesTrialSession;
      if (lookType) productMetadata.lookType = lookType;
      if (durationHours) productMetadata.durationHours = parseInt(durationHours);
    } else if (vendorCategory === "Fotograf") {
      if (photoPackageType) productMetadata.packageType = photoPackageType;
      if (hoursIncluded) productMetadata.hoursIncluded = parseInt(hoursIncluded);
      if (photosDelivered) productMetadata.photosDelivered = parseInt(photosDelivered);
      productMetadata.printRightsIncluded = printRightsIncluded;
      if (editedPhotosCount) productMetadata.editedPhotosCount = parseInt(editedPhotosCount);
      productMetadata.rawPhotosIncluded = rawPhotosIncluded;
    } else if (vendorCategory === "Videograf") {
      if (videoPackageType) productMetadata.packageType = videoPackageType;
      if (filmDurationMinutes) productMetadata.filmDurationMinutes = parseInt(filmDurationMinutes);
      if (editingStyle) productMetadata.editingStyle = editingStyle;
      productMetadata.droneFootageIncluded = droneFootageIncluded;
      productMetadata.rawFootageIncluded = rawFootageIncluded;
      productMetadata.highlightReelIncluded = highlightReelIncluded;
    } else if (vendorCategory === "Musikk") {
      if (performanceType) productMetadata.performanceType = performanceType;
      if (musicGenre) productMetadata.genre = musicGenre;
      productMetadata.equipmentIncluded = equipmentIncluded;
      productMetadata.soundCheckIncluded = soundCheckIncluded;
      productMetadata.setlistCustomizable = setlistCustomizable;
      if (performanceDurationHours) {
        productMetadata.performanceDurationHours = parseInt(performanceDurationHours);
      }
    } else if (vendorCategory === "Venue") {
      if (capacityMin) productMetadata.capacityMin = parseInt(capacityMin);
      if (capacityMax) productMetadata.capacityMax = parseInt(capacityMax);
      if (indoorOutdoor) productMetadata.indoorOutdoor = indoorOutdoor;
      productMetadata.cateringIncluded = cateringIncluded;
      if (parkingSpaces) productMetadata.parkingSpaces = parseInt(parkingSpaces);
      if (accessibilityFeatures) productMetadata.accessibilityFeatures = accessibilityFeatures;
    } else if (vendorCategory === "Planlegger") {
      if (serviceLevelType) productMetadata.serviceLevel = serviceLevelType;
      if (monthsOfService) productMetadata.monthsOfService = parseInt(monthsOfService);
      if (numberOfMeetings) productMetadata.numberOfMeetings = parseInt(numberOfMeetings);
      productMetadata.vendorCoordinationIncluded = vendorCoordinationIncluded;
    } else if (vendorCategory === "Fotograf og videograf") {
      if (combinedPackage) productMetadata.combinedPackage = combinedPackage;
      if (totalHours) productMetadata.totalHours = parseInt(totalHours);
      productMetadata.photosIncluded = photosIncluded;
      productMetadata.videoIncluded = videoIncluded;
    }
    return productMetadata;
  };

  const computedMetadata = useMemo(buildProductMetadataFromFields, [
    vendorCategory,
    offersTasteSample,
    cuisineType,
    courseType,
    servesCount,
    isVegetarian,
    isVegan,
    isGlutenFree,
    isDairyFree,
    cakeStyle,
    flavors,
    servings,
    tiers,
    flowerItemType,
    flowerTypes,
    seasonalAvailability,
    isSeasonalOnly,
    vehicleType,
    passengerCapacity,
    includesDriver,
    vehicleDescription,
    serviceType,
    includesTrialSession,
    lookType,
    durationHours,
    photoPackageType,
    hoursIncluded,
    photosDelivered,
    printRightsIncluded,
    editedPhotosCount,
    rawPhotosIncluded,
    videoPackageType,
    filmDurationMinutes,
    editingStyle,
    droneFootageIncluded,
    rawFootageIncluded,
    highlightReelIncluded,
    performanceType,
    musicGenre,
    equipmentIncluded,
    soundCheckIncluded,
    setlistCustomizable,
    performanceDurationHours,
    capacityMin,
    capacityMax,
    indoorOutdoor,
    cateringIncluded,
    parkingSpaces,
    accessibilityFeatures,
    serviceLevelType,
    monthsOfService,
    numberOfMeetings,
    vendorCoordinationIncluded,
    combinedPackage,
    totalHours,
    photosIncluded,
    videoIncluded,
  ]);

  useEffect(() => {
    setMetadata(computedMetadata);
  }, [computedMetadata]);

  // Pre-fill form when editing
  useEffect(() => {
    loadVendorCategory();

    if (editingProduct) {
      setTitle(editingProduct.title || "");
      setDescription(editingProduct.description || "");
      setUnitPrice(editingProduct.unitPrice ? String(editingProduct.unitPrice / 100) : "");
      setUnitType(editingProduct.unitType || "stk");
      setLeadTimeDays(editingProduct.leadTimeDays ? String(editingProduct.leadTimeDays) : "");
      setMinQuantity(editingProduct.minQuantity ? String(editingProduct.minQuantity) : "1");
      setCategoryTag(editingProduct.categoryTag || "");
      setTrackInventory(editingProduct.trackInventory || false);
      setAvailableQuantity(editingProduct.availableQuantity ? String(editingProduct.availableQuantity) : "");
      setBookingBuffer(editingProduct.bookingBuffer ? String(editingProduct.bookingBuffer) : "0");
      
      // Parse metadata if it exists
      if (editingProduct.metadata) {
        try {
          const parsed = typeof editingProduct.metadata === "string" 
            ? JSON.parse(editingProduct.metadata)
            : editingProduct.metadata;
          setMetadata(parsed || {});
          applyMetadataToFields(parsed || {});
        } catch (e) {
          setMetadata({});
        }
      }
    }
  }, [editingProduct]);

  useEffect(() => {
    let isActive = true;
    if (!sessionToken || title.trim().length < 2) {
      setTitleStatus("idle");
      setMatchingTitles([]);
      return;
    }

    setTitleStatus("checking");
    const timeout = setTimeout(async () => {
      try {
        const response = await apiRequest("GET", "/api/vendor/products");
        const products = await response.json();
        if (!isActive) return;
        const normalized = title.trim().toLowerCase();
        const matches = Array.isArray(products)
          ? products
              .filter((product) => {
                if (!product?.title) return false;
                if (isEditMode && editingProduct?.id === product.id) return false;
                return product.title.trim().toLowerCase() === normalized;
              })
              .map((product) => product.title)
          : [];
        setMatchingTitles(matches);
        setTitleStatus(matches.length > 0 ? "duplicate" : "available");
      } catch (error) {
        if (!isActive) return;
        setTitleStatus("error");
      }
    }, 450);

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [title, sessionToken, isEditMode, editingProduct?.id]);

  const handleSmartMetadataChange = (nextMetadata: ProductMetadata) => {
    setMetadata(nextMetadata);
    applyMetadataToFields(nextMetadata);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const sessionData = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
      if (!sessionData) throw new Error("Ikke innlogget");
      const session = JSON.parse(sessionData);

      const priceInOre = Math.round(parseFloat(unitPrice) * 100);
      
      // Build category-specific metadata
      const productMetadata: ProductMetadata = {};
      if (vendorCategory === "Catering") {
        productMetadata.offersTasteSample = offersTasteSample;
        if (cuisineType) productMetadata.cuisineType = cuisineType;
        if (courseType) productMetadata.courseType = courseType;
        if (servesCount) productMetadata.servesCount = parseInt(servesCount);
        productMetadata.isVegetarian = isVegetarian;
        productMetadata.isVegan = isVegan;
        productMetadata.isGlutenFree = isGlutenFree;
        productMetadata.isDairyFree = isDairyFree;
      } else if (vendorCategory === "Kake") {
        productMetadata.offersTasteSample = offersTasteSample;
        if (cakeStyle) productMetadata.cakeStyle = cakeStyle;
        if (flavors) productMetadata.flavors = flavors;
        if (servings) productMetadata.servings = parseInt(servings);
        if (tiers) productMetadata.tiers = parseInt(tiers);
      } else if (vendorCategory === "Blomster") {
        if (flowerItemType) {
          productMetadata.flowerItemType = flowerItemType;
          productMetadata.itemType = flowerItemType;
        }
        if (flowerTypes) productMetadata.flowerTypes = flowerTypes;
        if (seasonalAvailability) productMetadata.seasonalAvailability = seasonalAvailability;
        productMetadata.isSeasonalOnly = isSeasonalOnly;
      } else if (vendorCategory === "Transport") {
        if (vehicleType) productMetadata.vehicleType = vehicleType;
        if (passengerCapacity) productMetadata.passengerCapacity = parseInt(passengerCapacity);
        productMetadata.includesDriver = includesDriver;
        if (vehicleDescription) productMetadata.vehicleDescription = vehicleDescription;
      } else if (vendorCategory === "Hår & Makeup") {
        if (serviceType) productMetadata.serviceType = serviceType;
        productMetadata.includesTrialSession = includesTrialSession;
        if (lookType) productMetadata.lookType = lookType;
        if (durationHours) productMetadata.durationHours = parseInt(durationHours);
      } else if (vendorCategory === "Fotograf") {
        if (photoPackageType) productMetadata.packageType = photoPackageType;
        if (hoursIncluded) productMetadata.hoursIncluded = parseInt(hoursIncluded);
        if (photosDelivered) productMetadata.photosDelivered = parseInt(photosDelivered);
        productMetadata.printRightsIncluded = printRightsIncluded;
        if (editedPhotosCount) productMetadata.editedPhotosCount = parseInt(editedPhotosCount);
        productMetadata.rawPhotosIncluded = rawPhotosIncluded;
      } else if (vendorCategory === "Videograf") {
        if (videoPackageType) productMetadata.packageType = videoPackageType;
        if (filmDurationMinutes) productMetadata.filmDurationMinutes = parseInt(filmDurationMinutes);
        if (editingStyle) productMetadata.editingStyle = editingStyle;
        productMetadata.droneFootageIncluded = droneFootageIncluded;
        productMetadata.rawFootageIncluded = rawFootageIncluded;
        productMetadata.highlightReelIncluded = highlightReelIncluded;
      } else if (vendorCategory === "Musikk") {
        if (performanceType) productMetadata.performanceType = performanceType;
        if (musicGenre) productMetadata.genre = musicGenre;
        productMetadata.equipmentIncluded = equipmentIncluded;
        productMetadata.soundCheckIncluded = soundCheckIncluded;
        productMetadata.setlistCustomizable = setlistCustomizable;
        if (performanceDurationHours) productMetadata.performanceDurationHours = parseInt(performanceDurationHours);
      } else if (vendorCategory === "Venue") {
        if (capacityMin) productMetadata.capacityMin = parseInt(capacityMin);
        if (capacityMax) productMetadata.capacityMax = parseInt(capacityMax);
        if (indoorOutdoor) productMetadata.indoorOutdoor = indoorOutdoor;
        productMetadata.cateringIncluded = cateringIncluded;
        if (parkingSpaces) productMetadata.parkingSpaces = parseInt(parkingSpaces);
        if (accessibilityFeatures) productMetadata.accessibilityFeatures = accessibilityFeatures;
      } else if (vendorCategory === "Planlegger") {
        if (serviceLevelType) productMetadata.serviceLevel = serviceLevelType;
        if (monthsOfService) productMetadata.monthsOfService = parseInt(monthsOfService);
        if (numberOfMeetings) productMetadata.numberOfMeetings = parseInt(numberOfMeetings);
        productMetadata.vendorCoordinationIncluded = vendorCoordinationIncluded;
      } else if (vendorCategory === "Fotograf og videograf") {
        if (combinedPackage) productMetadata.combinedPackage = combinedPackage;
        if (totalHours) productMetadata.totalHours = parseInt(totalHours);
        productMetadata.photosIncluded = photosIncluded;
        productMetadata.videoIncluded = videoIncluded;
      }
      
      const url = isEditMode 
        ? new URL(`/api/vendor/products/${editingProduct.id}`, getApiUrl()).toString()
        : new URL("/api/vendor/products", getApiUrl()).toString();

      const response = await fetch(url, {
        method: isEditMode ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.sessionToken}`,
        },
        body: JSON.stringify({
          title,
          description: description || undefined,
          unitPrice: priceInOre,
          unitType,
          leadTimeDays: leadTimeDays ? parseInt(leadTimeDays) : undefined,
          minQuantity: minQuantity ? parseInt(minQuantity) : 1,
          categoryTag: categoryTag || undefined,
          trackInventory,
          availableQuantity: trackInventory && availableQuantity ? parseInt(availableQuantity) : undefined,
          bookingBuffer: trackInventory && bookingBuffer ? parseInt(bookingBuffer) : 0,
          metadata: productMetadata,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || (isEditMode ? "Kunne ikke oppdatere produkt" : "Kunne ikke opprette produkt"));
      }

      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/products"] });
      navigation.goBack();
    },
    onError: (error: Error) => {
      showToast(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const sessionData = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
      if (!sessionData) throw new Error("Ikke innlogget");
      const session = JSON.parse(sessionData);

      const response = await fetch(
        new URL(`/api/vendor/products/${editingProduct.id}`, getApiUrl()).toString(),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.sessionToken}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kunne ikke slette produkt");
      }

      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/products"] });
      navigation.goBack();
    },
    onError: (error: Error) => {
      showToast(error.message);
    },
  });

  const handleDelete = () => {
    showConfirm({
      title: "Slett produkt",
      message: `Er du sikker på at du vil slette "${title}"?`,
      confirmLabel: "Slett",
      cancelLabel: "Avbryt",
      destructive: true,
    }).then((confirmed) => {
      if (confirmed) deleteMutation.mutate();
    });
  };

  // Product templates based on category
  const getTemplates = (): ProductTemplate[] => {
    const templates: Record<string, ProductTemplate[]> = {
      "Fotograf": [
        { name: "Heldagspakke", title: "Heldagsfotografering", price: "15000", unitType: "pakke", hours: "8", photos: "500", printRights: true },
        { name: "Timepakke", title: "Timesbasert fotografering", price: "2500", unitType: "time", hours: "1", photos: "50", printRights: false },
        { name: "Premium pakke", title: isWedding ? "Premium bryllupspakke" : "Premium eventpakke", price: "25000", unitType: "pakke", hours: "12", photos: "800", printRights: true, raw: true },
      ],
      "Videograf": [
        { name: "Highlight reel", title: isWedding ? "Bryllups highlight" : "Event highlight", price: "12000", unitType: "pakke", duration: "10", style: "cinematic", drone: true },
        { name: "Fullfilm", title: isWedding ? "Full bryllupsfilm" : "Full eventfilm", price: "20000", unitType: "pakke", duration: "60", style: "documentary", drone: true },
        { name: "Kombinert pakke", title: "Highlight + Fullfilm", price: "28000", unitType: "pakke", duration: "70", style: "cinematic", drone: true, highlight: true },
      ],
      "Musikk": [
        { name: "DJ 4 timer", title: "DJ-tjenester", price: "8000", unitType: "pakke", performanceType: "dj", genre: "pop", duration: "4", equipment: true },
        { name: "Live band", title: "Live band opptreden", price: "15000", unitType: "pakke", performanceType: "band", genre: "pop", duration: "3", equipment: true },
        { name: "Solo artist", title: "Solo artist", price: "5000", unitType: "pakke", performanceType: "solo", genre: "klassisk", duration: "2", equipment: false },
      ],
      "Venue": [
        { name: "Liten sal", title: "Intim festsal", price: "25000", unitType: "dag", capacityMin: "20", capacityMax: "60", indoor: "innendørs", catering: true },
        { name: "Mellomstor sal", title: isWedding ? "Bryllupslokale" : "Arrangementslokale", price: "40000", unitType: "dag", capacityMin: "60", capacityMax: "120", indoor: "innendørs", catering: true },
        { name: "Stor sal", title: "Grand ballroom", price: "65000", unitType: "dag", capacityMin: "120", capacityMax: "250", indoor: "begge", catering: true, parking: "100" },
      ],
      "Planlegger": [
        { name: "Full planlegging", title: isWedding ? "Full bryllupsplanlegging" : "Full arrangementsplanlegging", price: "45000", unitType: "pakke", serviceLevel: "full", months: "12", meetings: "10", coordination: true },
        { name: "Dagskoordinering", title: isWedding ? "Bryllupsdagskoordinering" : "Arrangementsdagskoordinering", price: "12000", unitType: "dag", serviceLevel: "dagskoordinering", months: "1", meetings: "3", coordination: true },
        { name: "Konsultasjon", title: "Planleggingskonsultasjon", price: "2500", unitType: "time", serviceLevel: "konsultasjon", months: "0", meetings: "1", coordination: false },
      ],
      "Catering": [
        { name: "3-retters meny", title: "3-retters middag", price: "750", unitType: "stk", cuisine: "norsk", tasteSample: true },
        { name: "Buffet", title: isWedding ? "Bryllupsbuffet" : "Arrangementsbuffet", price: "550", unitType: "stk", cuisine: "blandet", tasteSample: true },
        { name: "Dessertbord", title: "Dessertbord", price: "250", unitType: "stk", tasteSample: false },
      ],
      "Kake": [
        { name: "3-etasjes kake", title: isWedding ? "Bryllupskake 3 etasjer" : "Festkake 3 etasjer", price: "4500", unitType: "stk", style: "elegant", tiers: "3", servings: "80", tasteSample: true },
        { name: "Naked cake", title: isWedding ? "Naked bryllupskake" : "Naked festkake", price: "3500", unitType: "stk", style: "rustic", tiers: "2", servings: "50", tasteSample: true },
      ],
      "Blomster": [
        { name: "Brudebukett", title: "Brudebukett med roser", price: "1500", unitType: "stk", itemType: "brudebukett", flowers: "Roser, Peoner" },
        { name: "Borddekorasjon", title: "Borddekorasjon per bord", price: "450", unitType: "stk", itemType: "borddekorasjon", flowers: "Sesongblomster" },
      ],
      "Transport": [
        { name: "Vintage bil", title: isWedding ? "Vintage bryllupsbil" : "Vintage eventbil", price: "5000", unitType: "dag", vehicleType: "vintage-car", capacity: "4", driver: true },
        { name: "Limousin", title: "Limousin", price: "7000", unitType: "dag", vehicleType: "limousine", capacity: "8", driver: true },
      ],
      "Hår & Makeup": [
        { name: "Brud pakke", title: "Brud hår og makeup", price: "3500", unitType: "pakke", serviceType: "both", trial: true, duration: "3" },
        { name: "Kun makeup", title: "Brude makeup", price: "2000", unitType: "pakke", serviceType: "makeup", trial: true, duration: "2" },
      ],
    };
    return templates[vendorCategory || ""] || [];
  };

  const applyTemplate = (template: ProductTemplate) => {
    setTitle(template.title);
    setUnitPrice(template.price);
    setUnitType(template.unitType);
    
    // Apply category-specific metadata
    if (vendorCategory === "Fotograf") {
      setHoursIncluded(template.hours || "");
      setPhotosDelivered(template.photos || "");
      setPrintRightsIncluded(template.printRights || false);
      setRawPhotosIncluded(template.raw || false);
    } else if (vendorCategory === "Videograf") {
      setFilmDurationMinutes(template.duration || "");
      setEditingStyle(template.style || "");
      setDroneFootageIncluded(template.drone || false);
      setHighlightReelIncluded(template.highlight || false);
    } else if (vendorCategory === "Musikk") {
      setPerformanceType(template.performanceType || "");
      setMusicGenre(template.genre || "");
      setPerformanceDurationHours(template.duration || "");
      setEquipmentIncluded(template.equipment || false);
    } else if (vendorCategory === "Venue") {
      setCapacityMin(template.capacityMin || "");
      setCapacityMax(template.capacityMax || "");
      setIndoorOutdoor(template.indoor || "");
      setCateringIncluded(template.catering || false);
      setParkingSpaces(template.parking || "");
    } else if (vendorCategory === "Planlegger") {
      setServiceLevelType(template.serviceLevel || "");
      setMonthsOfService(template.months || "");
      setNumberOfMeetings(template.meetings || "");
      setVendorCoordinationIncluded(template.coordination || false);
    } else if (vendorCategory === "Catering") {
      setCuisineType(template.cuisine || "");
      setOffersTasteSample(template.tasteSample || false);
    } else if (vendorCategory === "Kake") {
      setCakeStyle(template.style || "");
      setTiers(template.tiers || "");
      setServings(template.servings || "");
      setOffersTasteSample(template.tasteSample || false);
    } else if (vendorCategory === "Blomster") {
      setFlowerItemType(template.itemType || "");
      setFlowerTypes(template.flowers || "");
    } else if (vendorCategory === "Transport") {
      setVehicleType(template.vehicleType || "");
      setPassengerCapacity(template.capacity || "");
      setIncludesDriver(template.driver || false);
    } else if (vendorCategory === "Hår & Makeup") {
      setServiceType(template.serviceType || "");
      setIncludesTrialSession(template.trial || false);
      setDurationHours(template.duration || "");
    }
    
    setShowTemplates(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const isValid = title.trim().length >= 2 && parseFloat(unitPrice) >= 0;
  const hasSmartFields =
    vendorCategory === "Catering" ||
    vendorCategory === "Kake" ||
    vendorCategory === "Blomster" ||
    vendorCategory === "Transport" ||
    vendorCategory === "H\u00E5r & Makeup";
  const warningColor = isDark ? Colors.dark.warning : Colors.light.warning;
  const successColor = isDark ? Colors.dark.success : Colors.light.success;
  const errorColor = isDark ? Colors.dark.error : Colors.light.error;
  const metadataFieldCount = useMemo(
    () =>
      Object.values(metadata).filter(
        (value) => value !== undefined && value !== null && value !== "" && value !== false
      ).length,
    [metadata]
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md, backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <View style={[styles.headerIconCircle, { backgroundColor: theme.accent }]}>
            <EvendiIcon name="shopping-bag" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.headerTextContainer}>
            <ThemedText style={[styles.headerTitle, { color: theme.text }]}>
              {isEditMode ? "Rediger produkt" : "Nytt produkt"}
            </ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              {isEditMode ? "Oppdater produktinfo" : "Legg til tjeneste eller vare"}
            </ThemedText>
          </View>
        </View>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.closeButton,
            { backgroundColor: pressed ? theme.backgroundSecondary : theme.backgroundRoot },
          ]}
        >
          <EvendiIcon name="x" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>
      <KeyboardAwareScrollViewCompat
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        scrollIndicatorInsets={{ top: headerHeight, bottom: insets.bottom }}
      >
        {/* Quick Templates Section */}
        {!isEditMode && vendorCategory && showTemplates && getTemplates().length > 0 && (
          <Animated.View entering={FadeInDown.duration(300)}>
            <View style={[styles.templatesCard, { backgroundColor: theme.accent + "10", borderColor: theme.accent + "30" }]}>
              <View style={styles.templatesHeader}>
                <View style={styles.templatesHeaderLeft}>
                  <EvendiIcon name="zap" size={18} color={theme.accent} />
                  <ThemedText style={[styles.templatesTitle, { color: theme.accent }]}>Hurtigstart</ThemedText>
                </View>
                <Pressable onPress={() => setShowTemplates(false)} style={styles.templatesClose}>
                  <EvendiIcon name="x" size={16} color={theme.textMuted} />
                </Pressable>
              </View>
              <ThemedText style={[styles.templatesSubtitle, { color: theme.textSecondary }]}>
                Velg en mal for å komme raskt i gang
              </ThemedText>
              <View style={styles.templatesGrid}>
                {getTemplates().map((template, index) => (
                  <Pressable
                    key={index}
                    onPress={() => applyTemplate(template)}
                    style={[styles.templateChip, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
                  >
                    <EvendiIcon name="copy" size={14} color={theme.accent} />
                    <View style={styles.templateChipContent}>
                      <ThemedText style={[styles.templateChipName, { color: theme.text }]}>{template.name}</ThemedText>
                      <ThemedText style={[styles.templateChipPrice, { color: theme.textMuted }]}>{template.price} kr</ThemedText>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          </Animated.View>
        )}
        
        <Animated.View entering={FadeInDown.duration(300)}>
          <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconCircle, { backgroundColor: theme.accent + "15" }]}>
                <EvendiIcon name="info" size={16} color={theme.accent} />
              </View>
              <ThemedText style={[styles.formTitle, { color: theme.text }]}>Produktinformasjon</ThemedText>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Tittel</ThemedText>
              <TextInput
                testID="input-product-title"
                style={[
                  styles.textInput,
                  { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                ]}
                placeholder={isWedding ? "F.eks. Bryllupsfotografering" : "F.eks. Eventfotografering"}
                placeholderTextColor={theme.textMuted}
                value={title}
                onChangeText={setTitle}
              />
              {titleStatus !== "idle" && (
                <View style={styles.titleStatusRow}>
                  <EvendiIcon
                    name={
                      titleStatus === "available"
                        ? "check-circle"
                        : titleStatus === "duplicate"
                        ? "alert-triangle"
                        : titleStatus === "checking"
                        ? "loader"
                        : "alert-circle"
                    }
                    size={14}
                    color={
                      titleStatus === "available"
                        ? successColor
                        : titleStatus === "duplicate"
                        ? warningColor
                        : titleStatus === "checking"
                        ? theme.textMuted
                        : errorColor
                    }
                  />
                  <ThemedText
                    style={{
                      fontSize: 12,
                      color:
                        titleStatus === "available"
                          ? successColor
                          : titleStatus === "duplicate"
                          ? warningColor
                          : titleStatus === "checking"
                          ? theme.textMuted
                          : errorColor,
                    }}
                  >
                    {titleStatus === "checking" && "Sjekker tittel..."}
                    {titleStatus === "available" && "Tittel er ledig"}
                    {titleStatus === "duplicate" &&
                      `Tittel finnes allerede${matchingTitles.length ? ` (${matchingTitles.length})` : ""}`}
                    {titleStatus === "error" && "Kunne ikke sjekke tittel"}
                  </ThemedText>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Beskrivelse (valgfritt)</ThemedText>
              <TextInput
                testID="input-product-description"
                style={[
                  styles.textInput,
                  styles.textArea,
                  { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                ]}
                placeholder="Beskriv produktet eller tjenesten..."
                placeholderTextColor={theme.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Pris (NOK)</ThemedText>
                <TextInput
                  testID="input-product-price"
                  style={[
                    styles.textInput,
                    { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                  ]}
                  placeholder="0"
                  placeholderTextColor={theme.textMuted}
                  value={unitPrice}
                  onChangeText={setUnitPrice}
                  keyboardType="numeric"
                />
                {!unitPrice && vendorCategory && getSuggestedPrice(vendorCategory) && (
                  <Pressable
                    onPress={() => {
                      setUnitPrice(getSuggestedPrice(vendorCategory)?.toString() || '');
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={styles.suggestionChip}
                  >
                    <EvendiIcon name="zap" size={12} color="#f59e0b" />
                    <ThemedText style={styles.suggestionText}>
                      Foreslått: {getSuggestedPrice(vendorCategory)} kr
                    </ThemedText>
                  </Pressable>
                )}
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Enhet</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.unitPicker}>
                  {UNIT_TYPES.map((unit) => (
                    <Pressable
                      key={unit.value}
                      onPress={() => {
                        setUnitType(unit.value);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={[{
                        paddingHorizontal: Spacing.md,
                        paddingVertical: Spacing.sm,
                        borderRadius: BorderRadius.full,
                        borderWidth: unitType === unit.value ? 0 : 1,
                        backgroundColor: unitType === unit.value ? theme.accent : theme.backgroundRoot,
                        borderColor: theme.border,
                      }]}
                    >
                      <ThemedText
                        style={[{
                          fontSize: 13,
                          fontWeight: "600",
                          color: unitType === unit.value ? "#FFFFFF" : theme.textMuted,
                        }]}
                      >
                        {unit.label}
                      </ThemedText>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Leveringstid (dager)</ThemedText>
                <TextInput
                  testID="input-product-lead-time"
                  style={[
                    styles.textInput,
                    { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                  ]}
                  placeholder="Valgfritt"
                  placeholderTextColor={theme.textMuted}
                  value={leadTimeDays}
                  onChangeText={setLeadTimeDays}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Min. antall</ThemedText>
                <TextInput
                  testID="input-product-min-quantity"
                  style={[
                    styles.textInput,
                    { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                  ]}
                  placeholder="1"
                  placeholderTextColor={theme.textMuted}
                  value={minQuantity}
                  onChangeText={setMinQuantity}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Kategori (valgfritt)</ThemedText>
              <TextInput
                testID="input-product-category"
                style={[
                  styles.textInput,
                  { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                ]}
                placeholder="F.eks. Hovedtjenester, Tillegg..."
                placeholderTextColor={theme.textMuted}
                value={categoryTag}
                onChangeText={setCategoryTag}
              />
            </View>
          </View>

          {/* Category-Specific Fields Section */}
          {vendorCategory && (
            <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, marginTop: Spacing.lg }]}>
              <Pressable 
                onPress={() => {
                  setShowAdvancedFields(!showAdvancedFields);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={styles.sectionHeader}
              >
                <View style={[styles.sectionIconCircle, { backgroundColor: theme.accent + "15" }]}>
                  <EvendiIcon name="sliders" size={16} color={theme.accent} />
                </View>
                <ThemedText style={[styles.formTitle, { color: theme.text }]}>
                  {vendorCategory === "Catering" && "Catering-detaljer"}
                  {vendorCategory === "Kake" && "Kake-detaljer"}
                  {vendorCategory === "Blomster" && "Blomster-detaljer"}
                  {vendorCategory === "Transport" && "Transport-detaljer"}
                  {vendorCategory === "Hår & Makeup" && "Tjeneste-detaljer"}
                  {vendorCategory === "Fotograf" && "Fotograf-detaljer"}
                  {vendorCategory === "Videograf" && "Videograf-detaljer"}
                  {vendorCategory === "Musikk" && "Musikk-detaljer"}
                  {vendorCategory === "Venue" && "Lokale-detaljer"}
                  {vendorCategory === "Planlegger" && "Planlegger-detaljer"}
                  {vendorCategory === "Fotograf og videograf" && "Foto & Video-detaljer"}
                </ThemedText>
                <View style={{ marginLeft: "auto" }}>
                  <EvendiIcon name={showAdvancedFields ? "chevron-up" : "chevron-down"} size={18} color={theme.textMuted} />
                </View>
              </Pressable>

              {showAdvancedFields && (
                <Animated.View entering={FadeInDown.duration(200)}>

              {hasSmartFields && (
                <View style={[styles.smartFieldsCard, { backgroundColor: theme.backgroundRoot, borderColor: theme.border }]}> 
                  <View style={styles.smartFieldsHeader}>
                    <View style={styles.smartFieldsHeaderLeft}>
                      <EvendiIcon name="layers" size={16} color={theme.accent} />
                      <ThemedText style={[styles.smartFieldsTitle, { color: theme.text }]}>Smartvalg</ThemedText>
                    </View>
                    <Switch
                      value={showSmartFields}
                      onValueChange={(value) => {
                        setShowSmartFields(value);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      trackColor={{ false: theme.backgroundSecondary, true: theme.accent + "60" }}
                      thumbColor={showSmartFields ? theme.accent : theme.backgroundRoot}
                    />
                  </View>
                  {showSmartFields && (
                    <View style={{ marginTop: Spacing.md }}>
                      {vendorCategory === "Catering" && (
                        <CateringFields metadata={metadata} setMetadata={handleSmartMetadataChange} theme={theme} />
                      )}
                      {vendorCategory === "Kake" && (
                        <CakeFields metadata={metadata} setMetadata={handleSmartMetadataChange} theme={theme} />
                      )}
                      {vendorCategory === "Blomster" && (
                        <FlowerFields metadata={metadata} setMetadata={handleSmartMetadataChange} theme={theme} />
                      )}
                      {vendorCategory === "Transport" && (
                        <TransportFields metadata={metadata} setMetadata={handleSmartMetadataChange} theme={theme} />
                      )}
                      {vendorCategory === "H\u00E5r & Makeup" && (
                        <HairMakeupFields metadata={metadata} setMetadata={handleSmartMetadataChange} theme={theme} />
                      )}
                    </View>
                  )}
                  <View style={[styles.smartFieldsFooter, { borderTopColor: theme.border }]}>
                    <ThemedText style={[styles.smartFieldsFooterText, { color: theme.textMuted }]}> 
                      {metadataFieldCount > 0
                        ? `${metadataFieldCount} detaljer klare for lagring`
                        : "Ingen smartvalg valgt"}
                    </ThemedText>
                  </View>
                </View>
              )}

              {/* Catering Fields */}
              {vendorCategory === "Catering" && (
                <>
                  <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
                    <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Tilbyr smaksprøve</ThemedText>
                    <Switch
                      value={offersTasteSample}
                      onValueChange={setOffersTasteSample}
                      trackColor={{ false: theme.backgroundSecondary, true: theme.accent + "60" }}
                      thumbColor={offersTasteSample ? theme.accent : theme.backgroundRoot}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Kjøkkentype</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. Norsk, Italiensk, Asiatisk..."
                      placeholderTextColor={theme.textMuted}
                      value={cuisineType}
                      onChangeText={setCuisineType}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Retttype</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. Forrett, Hovedrett, Dessert..."
                      placeholderTextColor={theme.textMuted}
                      value={courseType}
                      onChangeText={setCourseType}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Antall porsjoner</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. 80"
                      placeholderTextColor={theme.textMuted}
                      value={servesCount}
                      onChangeText={setServesCount}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
                    <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Vegetar</ThemedText>
                    <Switch value={isVegetarian} onValueChange={setIsVegetarian} trackColor={{ false: theme.backgroundSecondary, true: theme.accent + "60" }} thumbColor={isVegetarian ? theme.accent : theme.backgroundRoot} />
                  </View>
                  <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
                    <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Vegan</ThemedText>
                    <Switch value={isVegan} onValueChange={setIsVegan} trackColor={{ false: theme.backgroundSecondary, true: theme.accent + "60" }} thumbColor={isVegan ? theme.accent : theme.backgroundRoot} />
                  </View>
                  <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
                    <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Glutenfri</ThemedText>
                    <Switch value={isGlutenFree} onValueChange={setIsGlutenFree} trackColor={{ false: theme.backgroundSecondary, true: theme.accent + "60" }} thumbColor={isGlutenFree ? theme.accent : theme.backgroundRoot} />
                  </View>
                  <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
                    <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Laktosefri</ThemedText>
                    <Switch value={isDairyFree} onValueChange={setIsDairyFree} trackColor={{ false: theme.backgroundSecondary, true: theme.accent + "60" }} thumbColor={isDairyFree ? theme.accent : theme.backgroundRoot} />
                  </View>
                </>
              )}

              {/* Cake Fields */}
              {vendorCategory === "Kake" && (
                <>
                  <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
                    <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Tilbyr smaksprøve</ThemedText>
                    <Switch
                      value={offersTasteSample}
                      onValueChange={setOffersTasteSample}
                      trackColor={{ false: theme.backgroundSecondary, true: theme.accent + "60" }}
                      thumbColor={offersTasteSample ? theme.accent : theme.backgroundRoot}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Kakestil</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. Tradisjonell, Naked, Drip..."
                      placeholderTextColor={theme.textMuted}
                      value={cakeStyle}
                      onChangeText={setCakeStyle}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Smaker</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. Sjokolade, Vanilje, Sitron..."
                      placeholderTextColor={theme.textMuted}
                      value={flavors}
                      onChangeText={setFlavors}
                    />
                  </View>
                  <View style={styles.rowInputs}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Porsjoner</ThemedText>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                        placeholder="F.eks. 50"
                        placeholderTextColor={theme.textMuted}
                        value={servings}
                        onChangeText={setServings}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Antall lag</ThemedText>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                        placeholder="F.eks. 3"
                        placeholderTextColor={theme.textMuted}
                        value={tiers}
                        onChangeText={setTiers}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </>
              )}

              {/* Flower Fields */}
              {vendorCategory === "Blomster" && (
                <>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Blomstertype</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. Brudebukett, Borddekorasjon..."
                      placeholderTextColor={theme.textMuted}
                      value={flowerItemType}
                      onChangeText={setFlowerItemType}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Blomster inkludert</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. Roser, Liljer, Peoner..."
                      placeholderTextColor={theme.textMuted}
                      value={flowerTypes}
                      onChangeText={setFlowerTypes}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Sesong tilgjengelighet</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. Vår, Sommer, Hele året..."
                      placeholderTextColor={theme.textMuted}
                      value={seasonalAvailability}
                      onChangeText={setSeasonalAvailability}
                    />
                  </View>
                  <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
                    <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Kun sesongbasert</ThemedText>
                    <Switch
                      value={isSeasonalOnly}
                      onValueChange={setIsSeasonalOnly}
                      trackColor={{ false: theme.backgroundSecondary, true: theme.accent + "60" }}
                      thumbColor={isSeasonalOnly ? theme.accent : theme.backgroundRoot}
                    />
                  </View>
                </>
              )}

              {/* Transport Fields */}
              {vendorCategory === "Transport" && (
                <>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Kjøretøytype</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. Limousin, Vintage bil, Buss..."
                      placeholderTextColor={theme.textMuted}
                      value={vehicleType}
                      onChangeText={setVehicleType}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Passasjerkapasitet</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. 4"
                      placeholderTextColor={theme.textMuted}
                      value={passengerCapacity}
                      onChangeText={setPassengerCapacity}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Kjøretøybeskrivelse</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="Detaljer om kjøretøyet..."
                      placeholderTextColor={theme.textMuted}
                      value={vehicleDescription}
                      onChangeText={setVehicleDescription}
                      multiline
                      numberOfLines={3}
                    />
                  </View>
                  <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
                    <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Inkluderer sjåfør</ThemedText>
                    <Switch
                      value={includesDriver}
                      onValueChange={setIncludesDriver}
                      trackColor={{ false: theme.backgroundSecondary, true: theme.accent + "60" }}
                      thumbColor={includesDriver ? theme.accent : theme.backgroundRoot}
                    />
                  </View>
                </>
              )}

              {/* Hair & Makeup Fields */}
              {vendorCategory === "Hår & Makeup" && (
                <>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Tjenestetype</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. Hår, Makeup, Begge..."
                      placeholderTextColor={theme.textMuted}
                      value={serviceType}
                      onChangeText={setServiceType}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Look-type</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. Naturlig, Glamorøs, Vintage..."
                      placeholderTextColor={theme.textMuted}
                      value={lookType}
                      onChangeText={setLookType}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Varighet (timer)</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. 2"
                      placeholderTextColor={theme.textMuted}
                      value={durationHours}
                      onChangeText={setDurationHours}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
                    <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Inkluderer prøvetime</ThemedText>
                    <Switch
                      value={includesTrialSession}
                      onValueChange={setIncludesTrialSession}
                      trackColor={{ false: theme.backgroundSecondary, true: theme.accent + "60" }}
                      thumbColor={includesTrialSession ? theme.accent : theme.backgroundRoot}
                    />
                  </View>
                </>
              )}

              {/* Fotograf Fields */}
              {vendorCategory === "Fotograf" && (
                <>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Pakketype</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. Timebasert, Heldag, Flerdag..."
                      placeholderTextColor={theme.textMuted}
                      value={photoPackageType}
                      onChangeText={setPhotoPackageType}
                    />
                  </View>
                  <View style={styles.rowInputs}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Timer inkludert</ThemedText>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                        placeholder="F.eks. 8"
                        placeholderTextColor={theme.textMuted}
                        value={hoursIncluded}
                        onChangeText={setHoursIncluded}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Bilder levert</ThemedText>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                        placeholder="F.eks. 500"
                        placeholderTextColor={theme.textMuted}
                        value={photosDelivered}
                        onChangeText={setPhotosDelivered}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Redigerte bilder</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. 400"
                      placeholderTextColor={theme.textMuted}
                      value={editedPhotosCount}
                      onChangeText={setEditedPhotosCount}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
                    <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Trykkerettigheter inkludert</ThemedText>
                    <Switch value={printRightsIncluded} onValueChange={setPrintRightsIncluded} trackColor={{ false: theme.backgroundSecondary, true: theme.accent + "60" }} thumbColor={printRightsIncluded ? theme.accent : theme.backgroundRoot} />
                  </View>
                  <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
                    <ThemedText style={[styles.switchLabel, { color: theme.text }]}>RAW-filer inkludert</ThemedText>
                    <Switch value={rawPhotosIncluded} onValueChange={setRawPhotosIncluded} trackColor={{ false: theme.backgroundSecondary, true: theme.accent + "60" }} thumbColor={rawPhotosIncluded ? theme.accent : theme.backgroundRoot} />
                  </View>
                </>
              )}

              {/* Videograf Fields */}
              {vendorCategory === "Videograf" && (
                <>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Pakketype</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. Highlight, Fullfilm, Både..."
                      placeholderTextColor={theme.textMuted}
                      value={videoPackageType}
                      onChangeText={setVideoPackageType}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Filmlengde (minutter)</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. 60"
                      placeholderTextColor={theme.textMuted}
                      value={filmDurationMinutes}
                      onChangeText={setFilmDurationMinutes}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Redigeringsstil</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. Cinematic, Documentary, Artistic..."
                      placeholderTextColor={theme.textMuted}
                      value={editingStyle}
                      onChangeText={setEditingStyle}
                    />
                  </View>
                  <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
                    <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Droneopptak inkludert</ThemedText>
                    <Switch value={droneFootageIncluded} onValueChange={setDroneFootageIncluded} trackColor={{ false: theme.backgroundSecondary, true: theme.accent + "60" }} thumbColor={droneFootageIncluded ? theme.accent : theme.backgroundRoot} />
                  </View>
                  <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
                    <ThemedText style={[styles.switchLabel, { color: theme.text }]}>RAW-opptak inkludert</ThemedText>
                    <Switch value={rawFootageIncluded} onValueChange={setRawFootageIncluded} trackColor={{ false: theme.backgroundSecondary, true: theme.accent + "60" }} thumbColor={rawFootageIncluded ? theme.accent : theme.backgroundRoot} />
                  </View>
                  <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
                    <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Highlight reel inkludert</ThemedText>
                    <Switch value={highlightReelIncluded} onValueChange={setHighlightReelIncluded} trackColor={{ false: theme.backgroundSecondary, true: theme.accent + "60" }} thumbColor={highlightReelIncluded ? theme.accent : theme.backgroundRoot} />
                  </View>
                </>
              )}

              {/* Musikk Fields */}
              {vendorCategory === "Musikk" && (
                <>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Type opptreden</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. Band, DJ, Solo, Duo..."
                      placeholderTextColor={theme.textMuted}
                      value={performanceType}
                      onChangeText={setPerformanceType}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Sjanger</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. Pop, Jazz, Rock, Klassisk..."
                      placeholderTextColor={theme.textMuted}
                      value={musicGenre}
                      onChangeText={setMusicGenre}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Varighet (timer)</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. 4"
                      placeholderTextColor={theme.textMuted}
                      value={performanceDurationHours}
                      onChangeText={setPerformanceDurationHours}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
                    <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Utstyr inkludert</ThemedText>
                    <Switch value={equipmentIncluded} onValueChange={setEquipmentIncluded} trackColor={{ false: theme.backgroundSecondary, true: theme.accent + "60" }} thumbColor={equipmentIncluded ? theme.accent : theme.backgroundRoot} />
                  </View>
                  <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
                    <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Lydsjekk inkludert</ThemedText>
                    <Switch value={soundCheckIncluded} onValueChange={setSoundCheckIncluded} trackColor={{ false: theme.backgroundSecondary, true: theme.accent + "60" }} thumbColor={soundCheckIncluded ? theme.accent : theme.backgroundRoot} />
                  </View>
                  <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
                    <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Tilpassbar spilleliste</ThemedText>
                    <Switch value={setlistCustomizable} onValueChange={setSetlistCustomizable} trackColor={{ false: theme.backgroundSecondary, true: theme.accent + "60" }} thumbColor={setlistCustomizable ? theme.accent : theme.backgroundRoot} />
                  </View>
                </>
              )}

              {/* Venue Fields */}
              {vendorCategory === "Venue" && (
                <>
                  <View style={styles.rowInputs}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Min. kapasitet</ThemedText>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                        placeholder="F.eks. 50"
                        placeholderTextColor={theme.textMuted}
                        value={capacityMin}
                        onChangeText={setCapacityMin}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Maks. kapasitet</ThemedText>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                        placeholder="F.eks. 200"
                        placeholderTextColor={theme.textMuted}
                        value={capacityMax}
                        onChangeText={setCapacityMax}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Lokasjon</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. Innendørs, Utendørs, Begge..."
                      placeholderTextColor={theme.textMuted}
                      value={indoorOutdoor}
                      onChangeText={setIndoorOutdoor}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Parkeringsplasser</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. 50"
                      placeholderTextColor={theme.textMuted}
                      value={parkingSpaces}
                      onChangeText={setParkingSpaces}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Tilgjengelighetsfunksjoner</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. Rullestoladgang, Heis..."
                      placeholderTextColor={theme.textMuted}
                      value={accessibilityFeatures}
                      onChangeText={setAccessibilityFeatures}
                    />
                  </View>
                  <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
                    <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Catering inkludert</ThemedText>
                    <Switch value={cateringIncluded} onValueChange={setCateringIncluded} trackColor={{ false: theme.backgroundSecondary, true: theme.accent + "60" }} thumbColor={cateringIncluded ? theme.accent : theme.backgroundRoot} />
                  </View>
                </>
              )}

              {/* Planlegger Fields */}
              {vendorCategory === "Planlegger" && (
                <>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Tjenestenivå</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. Full, Delvis, Dagskoordinering..."
                      placeholderTextColor={theme.textMuted}
                      value={serviceLevelType}
                      onChangeText={setServiceLevelType}
                    />
                  </View>
                  <View style={styles.rowInputs}>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Måneder tjeneste</ThemedText>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                        placeholder="F.eks. 12"
                        placeholderTextColor={theme.textMuted}
                        value={monthsOfService}
                        onChangeText={setMonthsOfService}
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={[styles.inputGroup, { flex: 1 }]}>
                      <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Antall møter</ThemedText>
                      <TextInput
                        style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                        placeholder="F.eks. 6"
                        placeholderTextColor={theme.textMuted}
                        value={numberOfMeetings}
                        onChangeText={setNumberOfMeetings}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                  <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
                    <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Leverandørkoordinering inkludert</ThemedText>
                    <Switch value={vendorCoordinationIncluded} onValueChange={setVendorCoordinationIncluded} trackColor={{ false: theme.backgroundSecondary, true: theme.accent + "60" }} thumbColor={vendorCoordinationIncluded ? theme.accent : theme.backgroundRoot} />
                  </View>
                </>
              )}

              {/* FotoVideo Combined Fields */}
              {vendorCategory === "Fotograf og videograf" && (
                <>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Kombinert pakke</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. Kun foto, Kun video, Begge..."
                      placeholderTextColor={theme.textMuted}
                      value={combinedPackage}
                      onChangeText={setCombinedPackage}
                    />
                  </View>
                  <View style={styles.inputGroup}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Totale timer</ThemedText>
                    <TextInput
                      style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                      placeholder="F.eks. 10"
                      placeholderTextColor={theme.textMuted}
                      value={totalHours}
                      onChangeText={setTotalHours}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
                    <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Foto inkludert</ThemedText>
                    <Switch value={photosIncluded} onValueChange={setPhotosIncluded} trackColor={{ false: theme.backgroundSecondary, true: theme.accent + "60" }} thumbColor={photosIncluded ? theme.accent : theme.backgroundRoot} />
                  </View>
                  <View style={[styles.switchRow, { borderBottomWidth: 0 }]}>
                    <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Video inkludert</ThemedText>
                    <Switch value={videoIncluded} onValueChange={setVideoIncluded} trackColor={{ false: theme.backgroundSecondary, true: theme.accent + "60" }} thumbColor={videoIncluded ? theme.accent : theme.backgroundRoot} />
                  </View>
                </>
              )}
                </Animated.View>
              )}
            </View>
          )}

          {/* Inventory Tracking Section */}
          <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, marginTop: Spacing.lg }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconCircle, { backgroundColor: theme.accent + "15" }]}>
                <EvendiIcon name="package" size={16} color={theme.accent} />
              </View>
              <ThemedText style={[styles.formTitle, { color: theme.text }]}>Lagerstyring</ThemedText>
            </View>

            <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
              <View style={styles.switchContent}>
                <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Aktiver lagerstyring</ThemedText>
                <ThemedText style={[styles.switchDescription, { color: theme.textMuted }]}>
                  Hold oversikt over tilgjengelig antall (f.eks. 200 stoler)
                </ThemedText>
              </View>
              <Switch
                value={trackInventory}
                onValueChange={(value) => {
                  setTrackInventory(value);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                trackColor={{ false: theme.border, true: theme.accent }}
                thumbColor="#FFFFFF"
              />
            </View>

            {trackInventory && (
              <Animated.View entering={FadeInDown.duration(300)}>
                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>
                      Totalt tilgjengelig
                    </ThemedText>
                    <TextInput
                      testID="input-available-quantity"
                      style={[
                        styles.textInput,
                        { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                      ]}
                      placeholder="200"
                      placeholderTextColor={theme.textMuted}
                      value={availableQuantity}
                      onChangeText={setAvailableQuantity}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>
                      Sikkerhetsbuffer
                    </ThemedText>
                    <TextInput
                      testID="input-booking-buffer"
                      style={[
                        styles.textInput,
                        { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                      ]}
                      placeholder="10"
                      placeholderTextColor={theme.textMuted}
                      value={bookingBuffer}
                      onChangeText={setBookingBuffer}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={[styles.infoBox, { backgroundColor: theme.accent + "12", borderColor: theme.accent + "30" }]}>
                  <EvendiIcon name="info" size={16} color={theme.accent} />
                  <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                    <ThemedText style={[styles.infoBoxText, { color: theme.text }]}>
                      {availableQuantity && parseInt(availableQuantity) > 0 ? (
                        <>
                          <ThemedText style={{ fontWeight: "600" }}>
                            {parseInt(availableQuantity) - parseInt(bookingBuffer || "0")}
                          </ThemedText>
                          {" "}tilgjengelig for booking
                          {editingProduct?.reservedQuantity > 0 && (
                            <ThemedText style={{ color: theme.textMuted }}>
                              {" "}({editingProduct.reservedQuantity} reservert)
                            </ThemedText>
                          )}
                        </>
                      ) : (
                        "Angi totalt antall og sikkerhetsbuffer"
                      )}
                    </ThemedText>
                    <ThemedText style={[styles.infoBoxSubtext, { color: theme.textMuted }]}>
                      Sikkerhetsbuffer holdes alltid tilbake
                    </ThemedText>
                  </View>
                </View>
              </Animated.View>
            )}
          </View>

          <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, marginTop: Spacing.lg }]}>
            <View style={[styles.pricePreview, { backgroundColor: theme.accent + "12" }]}>
              <View style={[styles.pricePreviewIcon, { backgroundColor: theme.accent }]}>
                <EvendiIcon name="tag" size={16} color="#FFFFFF" />
              </View>
              <ThemedText style={[styles.pricePreviewText, { color: theme.text }]}>
                {parseFloat(unitPrice) > 0
                  ? `${parseFloat(unitPrice).toLocaleString("nb-NO")} kr / ${UNIT_TYPES.find(u => u.value === unitType)?.label.toLowerCase()}`
                  : "Angi pris for forhåndsvisning"}
              </ThemedText>
            </View>

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                saveMutation.mutate();
              }}
              disabled={!isValid || saveMutation.isPending}
              style={({ pressed }) => [
                styles.submitBtn,
                { 
                  backgroundColor: theme.accent, 
                  opacity: (!isValid || saveMutation.isPending) ? 0.5 : 1,
                  transform: [{ scale: pressed && isValid ? 0.98 : 1 }],
                },
              ]}
            >
              {saveMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <View style={styles.submitBtnIcon}>
                    <EvendiIcon name="check" size={18} color="#FFFFFF" />
                  </View>
                  <ThemedText style={styles.submitBtnText}>
                    {isEditMode ? "Lagre endringer" : "Opprett produkt"}
                  </ThemedText>
                </>
              )}
            </Pressable>

            {isEditMode && (
              <Pressable
                onPress={handleDelete}
                disabled={deleteMutation.isPending}
                style={({ pressed }) => [
                  styles.deleteBtn,
                  { 
                    backgroundColor: "#F44336" + "15",
                    opacity: deleteMutation.isPending ? 0.5 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                {deleteMutation.isPending ? (
                  <ActivityIndicator color="#F44336" />
                ) : (
                  <>
                    <EvendiIcon name="trash-2" size={18} color="#F44336" />
                    <ThemedText style={[styles.deleteBtnText, { color: "#F44336" }]}>
                      Slett produkt
                    </ThemedText>
                  </>
                )}
              </Pressable>
            )}
          </View>
        </Animated.View>
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
  content: {
    paddingHorizontal: Spacing.lg,
  },
  formCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
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
  formTitle: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  textInput: {
    fontSize: 16,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  rowInputs: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  unitPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  pricePreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  pricePreviewIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pricePreviewText: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: BorderRadius.lg,
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
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  deleteBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  switchContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  infoBoxText: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoBoxSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  // Template styles
  templatesCard: {
    borderWidth: 1.5,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    marginHorizontal: Spacing.lg,
  },
  templatesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  templatesHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  templatesTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  templatesSubtitle: {
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  templatesClose: {
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  templatesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  templateChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  templateChipContent: {
    gap: 2,
  },
  templateChipName: {
    fontSize: 13,
    fontWeight: "600",
  },
  templateChipPrice: {
    fontSize: 11,
  },
  suggestionChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: Colors.light.warning + "22",
    borderRadius: 6,
    marginTop: 4,
    alignSelf: "flex-start",
  },
  suggestionText: {
    fontSize: 11,
    color: Colors.light.warning,
  },
  titleStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: Spacing.xs,
  },
  smartFieldsCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  smartFieldsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  smartFieldsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  smartFieldsTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  smartFieldsFooter: {
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  smartFieldsFooterText: {
    fontSize: 12,
  },
});
