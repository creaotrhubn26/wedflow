import React, { useState, useCallback, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Alert,
  Modal,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { getGuests } from "@/lib/api-guests";
import { getCoupleSession } from "@/lib/storage";
import type { WeddingGuest } from "@shared/schema";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SwipeableRow } from "@/components/SwipeableRow";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { PlanningStackParamList } from "@/navigation/PlanningStackNavigator";
import {
  getCateringData,
  createCateringTasting,
  updateCateringTasting,
  deleteCateringTasting,
  createCateringMenuItem,
  updateCateringMenuItem,
  deleteCateringMenuItem,
  createCateringDietaryNeed,
  updateCateringDietaryNeed,
  deleteCateringDietaryNeed,
  updateCateringTimeline,
  CateringTasting,
  CateringMenuItem,
  CateringDietaryNeed,
  CateringTimeline,
} from "@/lib/api-couple-data";

type NavigationProp = NativeStackNavigationProp<PlanningStackParamList>;

const TIMELINE_STEPS = [
  { key: "catererSelected", label: "Caterer valgt", icon: "check-circle" as const },
  { key: "tastingCompleted", label: "Smaksprøve fullført", icon: "coffee" as const },
  { key: "menuFinalized", label: "Meny godkjent", icon: "list" as const },
  { key: "guestCountConfirmed", label: "Antall gjester bekreftet", icon: "users" as const },
];

const COURSE_TYPES = [
  { key: "appetizer", label: "Forrett" },
  { key: "main", label: "Hovedrett" },
  { key: "dessert", label: "Dessert" },
  { key: "drink", label: "Drikke" },
  { key: "other", label: "Annet" },
];

const DIETARY_TYPES = [
  "Vegetar", "Vegan", "Glutenfri", "Laktosefri", "Nøtteallergi", 
  "Skalldyrallergi", "Halal", "Kosher", "Annet"
];

const CUISINE_TYPES = [
  { key: "norwegian", label: "Norsk", emoji: "🇳🇴" },
  { key: "indian", label: "Indisk", emoji: "🇮🇳" },
  { key: "pakistani", label: "Pakistansk", emoji: "🇵🇰" },
  { key: "middle-eastern", label: "Midtøsten", emoji: "🧆" },
  { key: "mediterranean", label: "Middelhavet", emoji: "🫒" },
  { key: "asian", label: "Asiatisk", emoji: "🥢" },
  { key: "african", label: "Afrikansk", emoji: "🌍" },
  { key: "mexican", label: "Meksikansk", emoji: "🌮" },
  { key: "italian", label: "Italiensk", emoji: "🇮🇹" },
  { key: "french", label: "Fransk", emoji: "🇫🇷" },
  { key: "american", label: "Amerikansk", emoji: "🇺🇸" },
  { key: "fusion", label: "Fusion", emoji: "🌎" },
  { key: "mixed", label: "Blandet", emoji: "🍽️" },
];

export default function CateringScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"tastings" | "menu" | "dietary" | "timeline">("tastings");
  const [refreshing, setRefreshing] = useState(false);

  // Query for catering data
  const { data: cateringData, isLoading: loading, refetch } = useQuery({
    queryKey: ["catering-data"],
    queryFn: getCateringData,
  });

  const tastings = cateringData?.tastings ?? [];
  const menu = cateringData?.menu ?? [];
  const dietaryNeeds = cateringData?.dietaryNeeds ?? [];
  const timeline = cateringData?.timeline ?? {
    catererSelected: false,
    tastingCompleted: false,
    menuFinalized: false,
    guestCountConfirmed: false,
    guestCount: 0,
    budget: 0,
  };
  const budget = timeline?.budget ?? 0;
  const guestCount = timeline?.guestCount ?? 0;

  // Tasting modal state
  const [showTastingModal, setShowTastingModal] = useState(false);
  const [editingTasting, setEditingTasting] = useState<CateringTasting | null>(null);
  const [tastingCaterer, setTastingCaterer] = useState("");
  const [tastingDate, setTastingDate] = useState("");
  const [tastingTime, setTastingTime] = useState("");
  const [tastingLocation, setTastingLocation] = useState("");
  const [tastingNotes, setTastingNotes] = useState("");
  const [tastingRating, setTastingRating] = useState(0);

  // Menu item modal state
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState<CateringMenuItem | null>(null);
  const [menuCourseType, setMenuCourseType] = useState("");
  const [menuDishName, setMenuDishName] = useState("");
  const [menuDescription, setMenuDescription] = useState("");
  const [menuIsVegetarian, setMenuIsVegetarian] = useState(false);
  const [menuIsVegan, setMenuIsVegan] = useState(false);
  const [menuIsGlutenFree, setMenuIsGlutenFree] = useState(false);
  const [menuIsDairyFree, setMenuIsDairyFree] = useState(false);
  const [menuPricePerPerson, setMenuPricePerPerson] = useState("");

  // Dietary need modal state
  const [showDietaryModal, setShowDietaryModal] = useState(false);
  const [editingDietary, setEditingDietary] = useState<CateringDietaryNeed | null>(null);
  const [dietaryGuestName, setDietaryGuestName] = useState("");
  const [dietaryType, setDietaryType] = useState("");
  const [dietaryNotes, setDietaryNotes] = useState("");

  // Budget modal state
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");
  const [guestCountInput, setGuestCountInput] = useState("");

  // Cuisine selection state
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [showCuisineModal, setShowCuisineModal] = useState(false);

  // Guest list integration
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [guests, setGuests] = useState<WeddingGuest[]>([]);
  const [showGuestPicker, setShowGuestPicker] = useState(false);
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null);

  // Load session token and guests
  useEffect(() => {
    const initSession = async () => {
      const session = await getCoupleSession();
      if (session?.token) {
        setSessionToken(session.token);
      }
    };
    initSession();
  }, []);

  useEffect(() => {
    const loadGuests = async () => {
      if (!sessionToken) return;
      try {
        const data = await getGuests(sessionToken);
        setGuests(data);
      } catch (err) {
        console.warn("Kunne ikke hente gjester", err);
      }
    };
    loadGuests();
  }, [sessionToken]);

  // Calculate confirmed guest count from RSVP data
  const confirmedGuestCount = guests.filter((g) => g.status === "confirmed").length +
    guests.filter((g) => g.status === "confirmed" && g.plusOne).length;

  // Get guests with dietary needs from guest list
  const guestsWithDietary = guests.filter(
    (g) => g.dietaryRequirements || g.allergies
  );

  // Mutations
  const createTastingMutation = useMutation({
    mutationFn: createCateringTasting,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catering-data"] }),
  });

  const updateTastingMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CateringTasting> }) => updateCateringTasting(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catering-data"] }),
  });

  const deleteTastingMutation = useMutation({
    mutationFn: deleteCateringTasting,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catering-data"] }),
  });

  const createMenuMutation = useMutation({
    mutationFn: createCateringMenuItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catering-data"] }),
  });

  const updateMenuMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CateringMenuItem> }) => updateCateringMenuItem(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catering-data"] }),
  });

  const deleteMenuMutation = useMutation({
    mutationFn: deleteCateringMenuItem,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catering-data"] }),
  });

  const createDietaryMutation = useMutation({
    mutationFn: createCateringDietaryNeed,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catering-data"] }),
  });

  const updateDietaryMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CateringDietaryNeed> }) => updateCateringDietaryNeed(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catering-data"] }),
  });

  const deleteDietaryMutation = useMutation({
    mutationFn: deleteCateringDietaryNeed,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catering-data"] }),
  });

  const updateTimelineMutation = useMutation({
    mutationFn: updateCateringTimeline,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["catering-data"] }),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [refetch]);

  // Tasting handlers
  const openTastingModal = (tasting?: CateringTasting) => {
    if (tasting) {
      setEditingTasting(tasting);
      setTastingCaterer(tasting.catererName);
      setTastingDate(tasting.date);
      setTastingTime(tasting.time || "");
      setTastingLocation(tasting.location || "");
      setTastingNotes(tasting.notes || "");
      setTastingRating(tasting.rating || 0);
    } else {
      setEditingTasting(null);
      setTastingCaterer("");
      setTastingDate("");
      setTastingTime("");
      setTastingLocation("");
      setTastingNotes("");
      setTastingRating(0);
    }
    setShowTastingModal(true);
  };

  const saveTasting = async () => {
    if (!tastingCaterer.trim() || !tastingDate.trim()) {
      Alert.alert("Feil", "Vennligst fyll inn caterer og dato");
      return;
    }

    try {
      if (editingTasting) {
        await updateTastingMutation.mutateAsync({
          id: editingTasting.id,
          data: {
            catererName: tastingCaterer,
            date: tastingDate,
            time: tastingTime,
            location: tastingLocation,
            notes: tastingNotes,
            rating: tastingRating,
          },
        });
      } else {
        await createTastingMutation.mutateAsync({
          catererName: tastingCaterer,
          date: tastingDate,
          time: tastingTime,
          location: tastingLocation,
          notes: tastingNotes,
          rating: tastingRating,
          completed: false,
        });
      }
      setShowTastingModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Feil", "Kunne ikke lagre smaksprøve");
    }
  };

  const toggleTastingComplete = async (id: string) => {
    const tasting = tastings.find((t) => t.id === id);
    if (tasting) {
      await updateTastingMutation.mutateAsync({ id, data: { completed: !tasting.completed } });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleDeleteTasting = async (id: string) => {
    await deleteTastingMutation.mutateAsync(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Menu handlers
  const openMenuModal = (menuItem?: CateringMenuItem) => {
    if (menuItem) {
      setEditingMenuItem(menuItem);
      setMenuCourseType(menuItem.courseType);
      setMenuDishName(menuItem.dishName);
      setMenuDescription(menuItem.description || "");
      setMenuIsVegetarian(menuItem.isVegetarian);
      setMenuIsVegan(menuItem.isVegan);
      setMenuIsGlutenFree(menuItem.isGlutenFree);
      setMenuIsDairyFree(menuItem.isDairyFree);
      setMenuPricePerPerson(menuItem.pricePerPerson?.toString() || "");
    } else {
      setEditingMenuItem(null);
      setMenuCourseType("");
      setMenuDishName("");
      setMenuDescription("");
      setMenuIsVegetarian(false);
      setMenuIsVegan(false);
      setMenuIsGlutenFree(false);
      setMenuIsDairyFree(false);
      setMenuPricePerPerson("");
    }
    setShowMenuModal(true);
  };

  const saveMenuItem = async () => {
    if (!menuDishName.trim() || !menuCourseType.trim()) {
      Alert.alert("Feil", "Vennligst fyll inn rettnavn og type");
      return;
    }

    try {
      const data = {
        courseType: menuCourseType,
        dishName: menuDishName,
        description: menuDescription,
        isVegetarian: menuIsVegetarian,
        isVegan: menuIsVegan,
        isGlutenFree: menuIsGlutenFree,
        isDairyFree: menuIsDairyFree,
        isSelected: false,
        pricePerPerson: menuPricePerPerson ? parseInt(menuPricePerPerson, 10) : undefined,
      };

      if (editingMenuItem) {
        await updateMenuMutation.mutateAsync({
          id: editingMenuItem.id,
          data,
        });
      } else {
        await createMenuMutation.mutateAsync(data);
      }
      setShowMenuModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Feil", "Kunne ikke lagre rett");
    }
  };

  const toggleMenuSelected = async (id: string) => {
    const menuItem = menu.find((m) => m.id === id);
    if (menuItem) {
      await updateMenuMutation.mutateAsync({ id, data: { isSelected: !menuItem.isSelected } });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleDeleteMenu = async (id: string) => {
    await deleteMenuMutation.mutateAsync(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Dietary handlers
  const openDietaryModal = (dietary?: CateringDietaryNeed) => {
    if (dietary) {
      setEditingDietary(dietary);
      setDietaryGuestName(dietary.guestName);
      setDietaryType(dietary.dietaryType);
      setDietaryNotes(dietary.notes || "");
      setSelectedGuestId(null);
    } else {
      setEditingDietary(null);
      setDietaryGuestName("");
      setDietaryType("");
      setDietaryNotes("");
      setSelectedGuestId(null);
    }
    setShowGuestPicker(false);
    setShowDietaryModal(true);
  };

  const selectGuestForDietary = (guest: WeddingGuest) => {
    setSelectedGuestId(guest.id);
    setDietaryGuestName(guest.name);
    // Auto-fill from guest's existing dietary info
    if (guest.dietaryRequirements) {
      setDietaryNotes(guest.dietaryRequirements + (guest.allergies ? `\nAllergier: ${guest.allergies}` : ""));
    } else if (guest.allergies) {
      setDietaryNotes(`Allergier: ${guest.allergies}`);
    }
    setShowGuestPicker(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Sync guest count from confirmed RSVPs
  const syncGuestCountFromRSVP = async () => {
    try {
      await updateTimelineMutation.mutateAsync({ guestCount: confirmedGuestCount });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("Oppdatert", `Antall gjester synkronisert: ${confirmedGuestCount} bekreftede gjester`);
    } catch (e) {
      Alert.alert("Feil", "Kunne ikke synkronisere antall gjester");
    }
  };

  const saveDietary = async () => {
    if (!dietaryGuestName.trim() || !dietaryType.trim()) {
      Alert.alert("Feil", "Vennligst fyll inn gjestens navn og kostbehov");
      return;
    }

    try {
      if (editingDietary) {
        await updateDietaryMutation.mutateAsync({
          id: editingDietary.id,
          data: {
            guestName: dietaryGuestName,
            dietaryType: dietaryType,
            notes: dietaryNotes,
          },
        });
      } else {
        await createDietaryMutation.mutateAsync({
          guestName: dietaryGuestName,
          dietaryType: dietaryType,
          notes: dietaryNotes,
        });
      }
      setShowDietaryModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Feil", "Kunne ikke lagre kostbehov");
    }
  };

  const handleDeleteDietary = async (id: string) => {
    await deleteDietaryMutation.mutateAsync(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Timeline handlers
  const toggleTimelineStep = async (key: string) => {
    const newValue = !timeline[key as keyof CateringTimeline];
    await updateTimelineMutation.mutateAsync({ [key]: newValue });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Budget handlers
  const openBudgetModal = () => {
    setBudgetInput(budget?.toString() || "");
    setGuestCountInput(guestCount?.toString() || "");
    setShowBudgetModal(true);
  };

  const saveBudget = async () => {
    const newBudget = parseInt(budgetInput, 10) || 0;
    const newGuestCount = parseInt(guestCountInput, 10) || 0;
    await updateTimelineMutation.mutateAsync({ budget: newBudget, guestCount: newGuestCount });
    setShowBudgetModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Cuisine handlers
  const toggleCuisine = (cuisineKey: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisineKey)
        ? prev.filter((c) => c !== cuisineKey)
        : [...prev, cuisineKey]
    );
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getCuisineLabels = () => {
    return selectedCuisines
      .map((key) => CUISINE_TYPES.find((c) => c.key === key))
      .filter(Boolean)
      .map((c) => `${c!.emoji} ${c!.label}`)
      .join(", ");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(amount);
  };

  const getCourseLabel = (type: string) => {
    const course = COURSE_TYPES.find((c) => c.key === type);
    return course?.label || type;
  };

  const completedSteps = TIMELINE_STEPS.filter((step) => timeline[step.key as keyof CateringTimeline]).length;
  const progressPercentage = (completedSteps / TIMELINE_STEPS.length) * 100;
  const selectedMenuItems = menu.filter((m) => m.isSelected);
  const menuCostPerPerson = selectedMenuItems.reduce((sum, m) => sum + (m.pricePerPerson || 0), 0);
  const totalMenuCost = menuCostPerPerson * guestCount;

  const renderTastingsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Smaksprøver</ThemedText>
        <Pressable onPress={() => openTastingModal()} style={[styles.addButton, { backgroundColor: theme.primary }]}>
          <Feather name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {tastings.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="coffee" size={48} color={theme.textSecondary} />
          <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
            Ingen smaksprøver planlagt
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Book smaksprøver hos caterere
          </ThemedText>
        </View>
      ) : (
        tastings.map((tasting, index) => (
          <Animated.View key={tasting.id} entering={FadeInDown.delay(index * 50)}>
            <SwipeableRow onDelete={() => handleDeleteTasting(tasting.id)}>
              <Pressable
                onPress={() => openTastingModal(tasting)}
                style={[styles.tastingCard, { backgroundColor: theme.backgroundDefault }]}
              >
                <Pressable
                  onPress={() => toggleTastingComplete(tasting.id)}
                  style={[
                    styles.checkbox,
                    { borderColor: theme.border },
                    tasting.completed && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                >
                  {tasting.completed && <Feather name="check" size={14} color="#fff" />}
                </Pressable>
                <View style={styles.tastingInfo}>
                  <ThemedText
                    style={[styles.tastingName, tasting.completed && styles.completedText]}
                  >
                    {tasting.catererName}
                  </ThemedText>
                  <ThemedText style={[styles.tastingDate, { color: theme.textSecondary }]}>
                    {tasting.date} {tasting.time && `kl. ${tasting.time}`}
                  </ThemedText>
                  {tasting.rating && tasting.rating > 0 && (
                    <View style={styles.ratingRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Feather
                          key={star}
                          name="star"
                          size={14}
                          color={star <= tasting.rating! ? Colors.light.accent : theme.border}
                        />
                      ))}
                    </View>
                  )}
                </View>
                <Feather name="chevron-right" size={20} color={theme.textSecondary} />
              </Pressable>
            </SwipeableRow>
          </Animated.View>
        ))
      )}
    </View>
  );

  const renderMenuTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Meny</ThemedText>
        <Pressable onPress={() => openMenuModal()} style={[styles.addButton, { backgroundColor: theme.primary }]}>
          <Feather name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Cost summary */}
      {selectedMenuItems.length > 0 && guestCount > 0 && (
        <View style={[styles.costSummary, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.costRow}>
            <ThemedText style={styles.costLabel}>Per person:</ThemedText>
            <ThemedText style={[styles.costAmount, { color: theme.primary }]}>
              {formatCurrency(menuCostPerPerson)}
            </ThemedText>
          </View>
          <View style={styles.costRow}>
            <ThemedText style={styles.costLabel}>Total ({guestCount} gjester):</ThemedText>
            <ThemedText style={[styles.costAmount, { color: theme.primary }]}>
              {formatCurrency(totalMenuCost)}
            </ThemedText>
          </View>
        </View>
      )}

      {menu.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="list" size={48} color={theme.textSecondary} />
          <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
            Ingen retter lagt til
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Bygg opp bryllupsmenyen
          </ThemedText>
        </View>
      ) : (
        COURSE_TYPES.map((course) => {
          const courseItems = menu.filter((m) => m.courseType === course.key);
          if (courseItems.length === 0) return null;
          
          return (
            <View key={course.key} style={styles.courseSection}>
              <ThemedText style={[styles.courseTitle, { color: theme.textSecondary }]}>
                {course.label}
              </ThemedText>
              {courseItems.map((menuItem, index) => (
                <Animated.View key={menuItem.id} entering={FadeInDown.delay(index * 30)}>
                  <SwipeableRow onDelete={() => handleDeleteMenu(menuItem.id)}>
                    <Pressable
                      onPress={() => openMenuModal(menuItem)}
                      style={[
                        styles.menuCard,
                        { backgroundColor: theme.backgroundDefault },
                        menuItem.isSelected ? { borderLeftColor: theme.primary, borderLeftWidth: 3 } : undefined,
                      ]}
                    >
                      <View style={styles.menuInfo}>
                        <ThemedText style={styles.menuName}>{menuItem.dishName}</ThemedText>
                        {menuItem.description && (
                          <ThemedText style={[styles.menuDesc, { color: theme.textSecondary }]} numberOfLines={1}>
                            {menuItem.description}
                          </ThemedText>
                        )}
                        <View style={styles.dietaryBadges}>
                          {menuItem.isVegetarian && (
                            <View style={[styles.dietaryBadge, { backgroundColor: Colors.light.success + "20" }]}>
                              <ThemedText style={[styles.dietaryBadgeText, { color: Colors.light.success }]}>V</ThemedText>
                            </View>
                          )}
                          {menuItem.isVegan && (
                            <View style={[styles.dietaryBadge, { backgroundColor: Colors.light.success + "20" }]}>
                              <ThemedText style={[styles.dietaryBadgeText, { color: Colors.light.success }]}>VG</ThemedText>
                            </View>
                          )}
                          {menuItem.isGlutenFree && (
                            <View style={[styles.dietaryBadge, { backgroundColor: Colors.light.accent + "20" }]}>
                              <ThemedText style={[styles.dietaryBadgeText, { color: Colors.light.accent }]}>GF</ThemedText>
                            </View>
                          )}
                          {menuItem.isDairyFree && (
                            <View style={[styles.dietaryBadge, { backgroundColor: Colors.light.link + "20" }]}>
                              <ThemedText style={[styles.dietaryBadgeText, { color: Colors.light.link }]}>DF</ThemedText>
                            </View>
                          )}
                        </View>
                      </View>
                      <View style={styles.menuRight}>
                        {menuItem.pricePerPerson && (
                          <ThemedText style={[styles.menuPrice, { color: theme.primary }]}>
                            {formatCurrency(menuItem.pricePerPerson)}
                          </ThemedText>
                        )}
                        <Pressable
                          onPress={() => toggleMenuSelected(menuItem.id)}
                          style={[
                            styles.selectButton,
                            { borderColor: theme.border },
                            menuItem.isSelected && { backgroundColor: theme.primary, borderColor: theme.primary },
                          ]}
                        >
                          <Feather name="check" size={14} color={menuItem.isSelected ? "#fff" : theme.textSecondary} />
                        </Pressable>
                      </View>
                    </Pressable>
                  </SwipeableRow>
                </Animated.View>
              ))}
            </View>
          );
        })
      )}
    </View>
  );

  const renderDietaryTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Kostbehov</ThemedText>
        <Pressable onPress={() => openDietaryModal()} style={[styles.addButton, { backgroundColor: theme.primary }]}>
          <Feather name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Import from Guest List hint */}
      {guestsWithDietary.length > 0 && (
        <View style={[styles.importHint, { backgroundColor: theme.primary + '20' }]}>
          <Feather name="info" size={16} color={theme.primary} />
          <ThemedText style={[styles.importHintText, { color: theme.primary }]}>
            {guestsWithDietary.length} gjest{guestsWithDietary.length !== 1 ? "er" : ""} har registrert kostbehov i gjestelisten
          </ThemedText>
        </View>
      )}

      {/* Summary */}
      {dietaryNeeds.length > 0 && (
        <View style={[styles.dietarySummary, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={styles.summaryTitle}>Oversikt</ThemedText>
          <ThemedText style={[styles.summaryText, { color: theme.textSecondary }]}>
            {dietaryNeeds.length} gjest{dietaryNeeds.length !== 1 ? "er" : ""} med spesielle behov
          </ThemedText>
        </View>
      )}

      {dietaryNeeds.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="alert-circle" size={48} color={theme.textSecondary} />
          <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
            Ingen kostbehov registrert
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Legg til allergier og kostholdskrav
          </ThemedText>
        </View>
      ) : (
        dietaryNeeds.map((dietary, index) => (
          <Animated.View key={dietary.id} entering={FadeInDown.delay(index * 50)}>
            <SwipeableRow onDelete={() => handleDeleteDietary(dietary.id)}>
              <Pressable
                onPress={() => openDietaryModal(dietary)}
                style={[styles.dietaryCard, { backgroundColor: theme.backgroundDefault }]}
              >
                <View style={[styles.dietaryIcon, { backgroundColor: theme.primary + '20' }]}>
                  <Feather name="user" size={20} color={theme.primary} />
                </View>
                <View style={styles.dietaryInfo}>
                  <ThemedText style={styles.dietaryGuestName}>{dietary.guestName}</ThemedText>
                  <View style={[styles.dietaryTypeBadge, { backgroundColor: Colors.light.accent + "20" }]}>
                    <ThemedText style={[styles.dietaryTypeText, { color: Colors.light.accent }]}>
                      {dietary.dietaryType}
                    </ThemedText>
                  </View>
                  {dietary.notes && (
                    <ThemedText style={[styles.dietaryNotes, { color: theme.textSecondary }]} numberOfLines={1}>
                      {dietary.notes}
                    </ThemedText>
                  )}
                </View>
                <Feather name="chevron-right" size={20} color={theme.textSecondary} />
              </Pressable>
            </SwipeableRow>
          </Animated.View>
        ))
      )}
    </View>
  );

  const renderTimelineTab = () => (
    <View style={styles.tabContent}>
      {/* Budget Card */}
      <Pressable onPress={openBudgetModal} style={[styles.budgetCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.budgetHeader}>
          <ThemedText style={styles.budgetLabel}>Budsjett & Gjester</ThemedText>
          <Feather name="edit-2" size={16} color={theme.textSecondary} />
        </View>
        <View style={styles.budgetRow}>
          <View style={styles.budgetItem}>
            <ThemedText style={[styles.budgetAmount, { color: theme.primary }]}>
              {formatCurrency(budget)}
            </ThemedText>
            <ThemedText style={[styles.budgetSubLabel, { color: theme.textSecondary }]}>Budsjett</ThemedText>
          </View>
          <View style={styles.budgetDivider} />
          <View style={styles.budgetItem}>
            <ThemedText style={[styles.budgetAmount, { color: theme.primary }]}>
              {guestCount}
            </ThemedText>
            <ThemedText style={[styles.budgetSubLabel, { color: theme.textSecondary }]}>Gjester</ThemedText>
          </View>
        </View>
        {budget > 0 && totalMenuCost > 0 && (
          <ThemedText style={[styles.budgetUsed, { color: totalMenuCost > budget ? Colors.light.error : theme.textSecondary }]}>
            Estimert menykost: {formatCurrency(totalMenuCost)} ({Math.round((totalMenuCost / budget) * 100)}%)
          </ThemedText>
        )}
      </Pressable>

      {/* Cuisine Type Card */}
      <Pressable onPress={() => setShowCuisineModal(true)} style={[styles.cuisineCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.cuisineHeader}>
          <View style={styles.cuisineHeaderLeft}>
            <Feather name="globe" size={20} color={theme.primary} />
            <ThemedText style={styles.cuisineLabel}>Mattype / Kjøkken</ThemedText>
          </View>
          <Feather name="chevron-right" size={18} color={theme.textSecondary} />
        </View>
        {selectedCuisines.length > 0 ? (
          <View style={styles.cuisineTagsContainer}>
            {selectedCuisines.map((key) => {
              const cuisine = CUISINE_TYPES.find((c) => c.key === key);
              if (!cuisine) return null;
              return (
                <View key={key} style={[styles.cuisineTag, { backgroundColor: theme.primary + '20' }]}>
                  <ThemedText style={[styles.cuisineTagText, { color: theme.primary }]}>)
                    {cuisine.emoji} {cuisine.label}
                  </ThemedText>
                </View>
              );
            })}
          </View>
        ) : (
          <ThemedText style={[styles.cuisinePlaceholder, { color: theme.textSecondary }]}>
            Velg mattype (indisk, norsk, pakistansk, etc.)
          </ThemedText>
        )}
      </Pressable>

      {/* Find Caterers Button - only show when cuisines are selected */}
      {selectedCuisines.length > 0 && (
        <Pressable
          onPress={() => {
            navigation.navigate("VendorMatching", {
              category: "catering",
              guestCount: guestCount || undefined,
              cuisineTypes: selectedCuisines,
            });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          style={[styles.findCaterersButton, { backgroundColor: theme.primary }]}
        >
          <Feather name="search" size={18} color="#FFFFFF" />
          <ThemedText style={styles.findCaterersText}>
            Finn caterere med {getCuisineLabels()}
          </ThemedText>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </Pressable>
      )}

      {/* Sync Guest Count from RSVP */}
      {confirmedGuestCount > 0 && confirmedGuestCount !== guestCount && (
        <Pressable
          onPress={syncGuestCountFromRSVP}
          style={[styles.syncCard, { backgroundColor: theme.primary + '20' }]}
        >
          <Feather name="refresh-cw" size={18} color={theme.primary} />
          <View style={styles.syncContent}>
            <ThemedText style={[styles.syncTitle, { color: theme.primary }]}>
              Synkroniser med gjestelisten
            </ThemedText>
            <ThemedText style={[styles.syncText, { color: theme.textSecondary }]}>
              {confirmedGuestCount} bekreftede gjester i RSVP
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={20} color={theme.primary} />
        </Pressable>
      )}

      {/* Progress */}
      <View style={[styles.progressCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.progressHeader}>
          <ThemedText style={styles.progressTitle}>Fremgang</ThemedText>
          <ThemedText style={[styles.progressPercentage, { color: theme.primary }]}>
            {Math.round(progressPercentage)}%
          </ThemedText>
        </View>
        <View style={[styles.progressBar, { backgroundColor: theme.border }]}>
          <View style={[styles.progressFill, { backgroundColor: theme.primary, width: `${progressPercentage}%` }]} />
        </View>
        <ThemedText style={[styles.progressSubtext, { color: theme.textSecondary }]}>
          {completedSteps} av {TIMELINE_STEPS.length} steg fullført
        </ThemedText>
      </View>

      {/* Timeline Steps */}
      <View style={[styles.timelineCard, { backgroundColor: theme.backgroundDefault }]}>
        <ThemedText style={styles.timelineTitle}>Sjekkliste</ThemedText>
        {TIMELINE_STEPS.map((step, index) => {
          const isCompleted = timeline[step.key as keyof CateringTimeline];
          return (
            <Pressable
              key={step.key}
              onPress={() => toggleTimelineStep(step.key)}
              style={styles.timelineStep}
            >
              <View
                style={[
                  styles.timelineCheckbox,
                  { borderColor: theme.border },
                  isCompleted ? { backgroundColor: theme.primary, borderColor: theme.primary } : undefined,
                ]}
              >
                {isCompleted && <Feather name="check" size={14} color="#fff" />}
              </View>
              <View style={styles.timelineStepContent}>
                <View style={[styles.timelineIcon, { backgroundColor: isCompleted ? theme.primary + '20' : theme.border }]}>
                  <Feather name={step.icon} size={16} color={isCompleted ? theme.primary : theme.textSecondary} />
                </View>
                <ThemedText style={[styles.timelineStepLabel, isCompleted ? styles.completedText : undefined]}>
                  {step.label}
                </ThemedText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        {[
          { key: "tastings", label: "Smaksprøver", icon: "coffee" },
          { key: "menu", label: "Meny", icon: "list" },
          { key: "dietary", label: "Kostbehov", icon: "alert-circle" },
          { key: "timeline", label: "Oversikt", icon: "check-square" },
        ].map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            style={[styles.tab, activeTab === tab.key && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
          >
            <Feather name={tab.icon as any} size={16} color={activeTab === tab.key ? theme.primary : theme.textSecondary} />
            <ThemedText style={[styles.tabLabel, { color: activeTab === tab.key ? theme.primary : theme.textSecondary }]}>
              {tab.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + Spacing.xl }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        {activeTab === "tastings" && renderTastingsTab()}
        {activeTab === "menu" && renderMenuTab()}
        {activeTab === "dietary" && renderDietaryTab()}
        {activeTab === "timeline" && renderTimelineTab()}
      </ScrollView>

      {/* Tasting Modal */}
      <Modal visible={showTastingModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setShowTastingModal(false)}>
              <ThemedText style={[styles.modalCancel, { color: theme.textSecondary }]}>Avbryt</ThemedText>
            </Pressable>
            <ThemedText style={styles.modalTitle}>
              {editingTasting ? "Rediger smaksprøve" : "Ny smaksprøve"}
            </ThemedText>
            <Pressable onPress={saveTasting}>
              <ThemedText style={[styles.modalSave, { color: theme.primary }]}>Lagre</ThemedText>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Caterer *</ThemedText>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={tastingCaterer}
                onChangeText={setTastingCaterer}
                placeholder="Navn på caterer"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Dato *</ThemedText>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={tastingDate}
                onChangeText={setTastingDate}
                placeholder="DD.MM.ÅÅÅÅ"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Klokkeslett</ThemedText>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={tastingTime}
                onChangeText={setTastingTime}
                placeholder="HH:MM"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Sted</ThemedText>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={tastingLocation}
                onChangeText={setTastingLocation}
                placeholder="Adresse"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Vurdering</ThemedText>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Pressable key={star} onPress={() => setTastingRating(star)}>
                    <Feather
                      name="star"
                      size={32}
                      color={star <= tastingRating ? Colors.light.accent : theme.border}
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Notater</ThemedText>
              <TextInput
                style={[styles.formInput, styles.formTextArea, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={tastingNotes}
                onChangeText={setTastingNotes}
                placeholder="Tilleggsinfo..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Menu Modal */}
      <Modal visible={showMenuModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setShowMenuModal(false)}>
              <ThemedText style={[styles.modalCancel, { color: theme.textSecondary }]}>Avbryt</ThemedText>
            </Pressable>
            <ThemedText style={styles.modalTitle}>
              {editingMenuItem ? "Rediger rett" : "Ny rett"}
            </ThemedText>
            <Pressable onPress={saveMenuItem}>
              <ThemedText style={[styles.modalSave, { color: theme.primary }]}>Lagre</ThemedText>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Type *</ThemedText>
              <View style={styles.chipContainer}>
                {COURSE_TYPES.map((course) => (
                  <Pressable
                    key={course.key}
                    onPress={() => setMenuCourseType(course.key)}
                    style={[
                      styles.chip,
                      { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                      menuCourseType === course.key ? { backgroundColor: theme.primary, borderColor: theme.primary } : undefined,
                    ]}
                  >
                    <ThemedText
                      style={[styles.chipText, menuCourseType === course.key && { color: "#fff" }]}
                    >
                      {course.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Rettnavn *</ThemedText>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={menuDishName}
                onChangeText={setMenuDishName}
                placeholder="F.eks. Laks med grønnsaker"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Beskrivelse</ThemedText>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={menuDescription}
                onChangeText={setMenuDescription}
                placeholder="Detaljer om retten"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Kostholdskrav</ThemedText>
              <View style={styles.dietaryOptions}>
                {[
                  { key: "vegetarian", label: "Vegetar", state: menuIsVegetarian, setter: setMenuIsVegetarian },
                  { key: "vegan", label: "Vegan", state: menuIsVegan, setter: setMenuIsVegan },
                  { key: "glutenFree", label: "Glutenfri", state: menuIsGlutenFree, setter: setMenuIsGlutenFree },
                  { key: "dairyFree", label: "Laktosefri", state: menuIsDairyFree, setter: setMenuIsDairyFree },
                ].map((option) => (
                  <Pressable
                    key={option.key}
                    onPress={() => option.setter(!option.state)}
                    style={[
                      styles.dietaryOption,
                      { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                      option.state ? { backgroundColor: theme.primary + '20', borderColor: theme.primary } : undefined,
                    ]}
                  >
                    <Feather
                      name={option.state ? "check-square" : "square"}
                      size={18}
                      color={option.state ? theme.primary : theme.textSecondary}
                    />
                    <ThemedText style={[styles.dietaryOptionLabel, option.state && { color: theme.primary }]}>
                      {option.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Pris per person (kr)</ThemedText>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={menuPricePerPerson}
                onChangeText={setMenuPricePerPerson}
                placeholder="0"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
              />
            </View>

            {editingMenuItem && (
              <Button
                onPress={() => {
                  handleDeleteMenu(editingMenuItem.id);
                  setShowMenuModal(false);
                }}
                style={styles.deleteButton}
              >
                Slett rett
              </Button>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Dietary Modal */}
      <Modal visible={showDietaryModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setShowDietaryModal(false)}>
              <ThemedText style={[styles.modalCancel, { color: theme.textSecondary }]}>Avbryt</ThemedText>
            </Pressable>
            <ThemedText style={styles.modalTitle}>
              {editingDietary ? "Rediger kostbehov" : "Nytt kostbehov"}
            </ThemedText>
            <Pressable onPress={saveDietary}>
              <ThemedText style={[styles.modalSave, { color: theme.primary }]}>Lagre</ThemedText>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Guest Picker Toggle */}
            {!editingDietary && guests.length > 0 && (
              <View style={styles.formGroup}>
                <Pressable
                  onPress={() => setShowGuestPicker(!showGuestPicker)}
                  style={[styles.guestPickerToggle, { backgroundColor: theme.primary + '20' }]}
                >
                  <Feather name="users" size={18} color={theme.primary} />
                  <ThemedText style={[styles.guestPickerText, { color: theme.primary }]}>
                    Velg fra gjestelisten
                  </ThemedText>
                  <Feather name={showGuestPicker ? "chevron-up" : "chevron-down"} size={18} color={theme.primary} />
                </Pressable>

                {showGuestPicker && (
                  <View style={[styles.guestPickerList, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                    {guests.map((guest) => (
                      <Pressable
                        key={guest.id}
                        onPress={() => selectGuestForDietary(guest)}
                        style={[
                          styles.guestPickerItem,
                          { borderBottomColor: theme.border },
                          selectedGuestId === guest.id ? { backgroundColor: theme.primary + '20' } : undefined,
                        ]}
                      >
                        <View style={styles.guestPickerInfo}>
                          <ThemedText style={styles.guestPickerName}>{guest.name}</ThemedText>
                          {(guest.dietaryRequirements || guest.allergies) && (
                            <ThemedText style={[styles.guestPickerDietary, { color: theme.textSecondary }]}>
                              {guest.dietaryRequirements || guest.allergies}
                            </ThemedText>
                          )}
                        </View>
                        {selectedGuestId === guest.id && (
                          <Feather name="check" size={18} color={theme.primary} />
                        )}
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            )}

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Gjestens navn *</ThemedText>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={dietaryGuestName}
                onChangeText={setDietaryGuestName}
                placeholder="Navn"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Kostbehov *</ThemedText>
              <View style={styles.chipContainer}>
                {DIETARY_TYPES.map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => setDietaryType(type)}
                    style={[
                      styles.chip,
                      { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                      dietaryType === type ? { backgroundColor: theme.primary, borderColor: theme.primary } : undefined,
                    ]}
                  >
                    <ThemedText
                      style={[styles.chipText, dietaryType === type && { color: "#fff" }]}
                    >
                      {type}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Notater</ThemedText>
              <TextInput
                style={[styles.formInput, styles.formTextArea, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={dietaryNotes}
                onChangeText={setDietaryNotes}
                placeholder="Detaljer om allergien eller kostholdskravet..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>

            {editingDietary && (
              <Button
                onPress={() => {
                  handleDeleteDietary(editingDietary.id);
                  setShowDietaryModal(false);
                }}
                style={styles.deleteButton}
              >
                Slett kostbehov
              </Button>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Budget Modal */}
      <Modal visible={showBudgetModal} animationType="slide" transparent>
        <View style={styles.budgetModalOverlay}>
          <View style={[styles.budgetModalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={styles.budgetModalTitle}>Budsjett & Gjester</ThemedText>
            
            <View style={styles.budgetModalFields}>
              <View style={styles.budgetModalField}>
                <ThemedText style={styles.budgetModalFieldLabel}>Budsjett (kr)</ThemedText>
                <TextInput
                  style={[styles.budgetInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                  value={budgetInput}
                  onChangeText={setBudgetInput}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.budgetModalField}>
                <ThemedText style={styles.budgetModalFieldLabel}>Antall gjester</ThemedText>
                <TextInput
                  style={[styles.budgetInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
                  value={guestCountInput}
                  onChangeText={setGuestCountInput}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.budgetModalButtons}>
              <Button onPress={() => setShowBudgetModal(false)} style={styles.budgetModalButton}>Avbryt</Button>
              <Button onPress={saveBudget} style={styles.budgetModalButton}>Lagre</Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Cuisine Modal */}
      <Modal visible={showCuisineModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setShowCuisineModal(false)}>
              <ThemedText style={[styles.modalCancel, { color: theme.textSecondary }]}>Lukk</ThemedText>
            </Pressable>
            <ThemedText style={styles.modalTitle}>Velg mattype</ThemedText>
            <Pressable onPress={() => setSelectedCuisines([])}>
              <ThemedText style={[styles.modalSave, { color: theme.primary }]}>Nullstill</ThemedText>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <ThemedText style={[styles.cuisineHint, { color: theme.textSecondary }]}>
              Velg én eller flere mattyper for bryllupet. Dette hjelper med å finne riktig caterer og planlegge menyen.
            </ThemedText>

            <View style={styles.cuisineGrid}>
              {CUISINE_TYPES.map((cuisine) => {
                const isSelected = selectedCuisines.includes(cuisine.key);
                return (
                  <Pressable
                    key={cuisine.key}
                    onPress={() => toggleCuisine(cuisine.key)}
                    style={[
                      styles.cuisineOption,
                      { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                      isSelected ? { backgroundColor: theme.primary + '20', borderColor: theme.primary } : undefined,
                    ]}
                  >
                    <ThemedText style={styles.cuisineEmoji}>{cuisine.emoji}</ThemedText>
                    <ThemedText
                      style={[
                        styles.cuisineOptionLabel,
                        isSelected && { color: theme.primary, fontWeight: "600" },
                      ]}
                    >
                      {cuisine.label}
                    </ThemedText>
                    {isSelected && (
                      <View style={[styles.cuisineCheck, { backgroundColor: theme.primary }]}>
                        <Feather name="check" size={12} color="#fff" />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>

            {selectedCuisines.length > 0 && (
              <View style={[styles.cuisineSummary, { backgroundColor: theme.backgroundDefault }]}>
                <ThemedText style={styles.cuisineSummaryTitle}>Valgt:</ThemedText>
                <ThemedText style={[styles.cuisineSummaryText, { color: theme.textSecondary }]}>
                  {getCuisineLabels()}
                </ThemedText>
              </View>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingTop: Spacing.sm,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    gap: 2,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  tabContent: {
    gap: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyState: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: Spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  tastingCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  tastingInfo: {
    flex: 1,
    gap: 4,
  },
  tastingName: {
    fontSize: 16,
    fontWeight: "500",
  },
  tastingDate: {
    fontSize: 14,
  },
  ratingRow: {
    flexDirection: "row",
    gap: 2,
    marginTop: 4,
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  costSummary: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  costRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  costLabel: {
    fontSize: 14,
  },
  costAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  courseSection: {
    marginBottom: Spacing.md,
  },
  courseTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: Spacing.sm,
  },
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  menuInfo: {
    flex: 1,
    gap: 4,
  },
  menuName: {
    fontSize: 15,
    fontWeight: "500",
  },
  menuDesc: {
    fontSize: 13,
  },
  dietaryBadges: {
    flexDirection: "row",
    gap: 4,
    marginTop: 4,
  },
  dietaryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dietaryBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  menuRight: {
    alignItems: "flex-end",
    gap: Spacing.sm,
  },
  menuPrice: {
    fontSize: 14,
    fontWeight: "600",
  },
  selectButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  dietarySummary: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  summaryText: {
    fontSize: 13,
  },
  dietaryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  dietaryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  dietaryInfo: {
    flex: 1,
    gap: 4,
  },
  dietaryGuestName: {
    fontSize: 15,
    fontWeight: "500",
  },
  dietaryTypeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dietaryTypeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  dietaryNotes: {
    fontSize: 13,
  },
  budgetCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  budgetLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  budgetRow: {
    flexDirection: "row",
    marginTop: Spacing.md,
  },
  budgetItem: {
    flex: 1,
    alignItems: "center",
  },
  budgetDivider: {
    width: 1,
    backgroundColor: "#ddd",
    marginHorizontal: Spacing.md,
  },
  budgetAmount: {
    fontSize: 24,
    fontWeight: "700",
  },
  budgetSubLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  budgetUsed: {
    fontSize: 12,
    marginTop: Spacing.md,
    textAlign: "center",
  },
  progressCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: "600",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressSubtext: {
    fontSize: 12,
    marginTop: Spacing.sm,
  },
  timelineCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  timelineStep: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  timelineCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineStepContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  timelineStepLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  modalCancel: {
    fontSize: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  modalSave: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    flex: 1,
    padding: Spacing.md,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
  },
  formTextArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
  },
  ratingContainer: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  dietaryOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  dietaryOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  dietaryOptionLabel: {
    fontSize: 14,
  },
  deleteButton: {
    marginTop: Spacing.md,
  },
  budgetModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  budgetModalContent: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
  },
  budgetModalTitle: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: Spacing.lg,
  },
  budgetModalFields: {
    gap: Spacing.md,
  },
  budgetModalField: {
    gap: Spacing.sm,
  },
  budgetModalFieldLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  budgetInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 20,
    textAlign: "center",
    fontWeight: "600",
  },
  budgetModalButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  budgetModalButton: {
    flex: 1,
  },
  // Guest picker styles
  guestPickerToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  guestPickerText: {
    fontSize: 14,
    fontWeight: "500",
  },
  guestPickerList: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    maxHeight: 200,
    marginBottom: Spacing.sm,
  },
  guestPickerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  guestPickerInfo: {
    flex: 1,
    gap: 2,
  },
  guestPickerName: {
    fontSize: 15,
    fontWeight: "500",
  },
  guestPickerDietary: {
    fontSize: 12,
  },
  // Import hint styles
  importHint: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  importHintText: {
    fontSize: 13,
    flex: 1,
  },
  // Sync card styles
  syncCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  syncContent: {
    flex: 1,
  },
  syncTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  syncText: {
    fontSize: 12,
  },
  // Cuisine card styles
  cuisineCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  cuisineHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  cuisineHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  cuisineLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  cuisinePlaceholder: {
    fontSize: 13,
  },
  cuisineTagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  cuisineTag: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  cuisineTagText: {
    fontSize: 13,
    fontWeight: "500",
  },
  // Cuisine modal styles
  cuisineHint: {
    fontSize: 14,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  cuisineGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  cuisineOption: {
    width: "47%",
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  cuisineEmoji: {
    fontSize: 24,
  },
  cuisineOptionLabel: {
    flex: 1,
    fontSize: 14,
  },
  cuisineCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cuisineSummary: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  cuisineSummaryTitle: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 4,
  },
  cuisineSummaryText: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Find caterers button
  findCaterersButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  findCaterersText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
});
