import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Modal,
  Image,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EvendiIcon } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { optimizeImage, PHOTO_PRESET } from "@/lib/optimize-image";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SwipeableRow } from "@/components/SwipeableRow";
import PersistentTextInput from "@/components/PersistentTextInput";
import { VendorSuggestions } from "@/components/VendorSuggestions";
import { VendorActionBar } from "@/components/VendorActionBar";
import { VendorCategoryMarketplace } from "@/components/VendorCategoryMarketplace";
import { TraditionHintBanner } from "@/components/TraditionHintBanner";
import { getCoupleProfile } from "@/lib/api-couples";
import { getCoupleSession } from "@/lib/storage";
import { useTheme } from "@/hooks/useTheme";
import { useEventType } from "@/hooks/useEventType";
import { useVendorSearch } from "@/hooks/useVendorSearch";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { PlanningStackParamList } from "@/navigation/PlanningStackNavigator";
import { showToast } from "@/lib/toast";
import { showOptions } from "@/lib/dialogs";
import {
  getDressData,
  createDressAppointment,
  updateDressAppointment,
  deleteDressAppointment,
  createDressFavorite,
  updateDressFavorite,
  deleteDressFavorite,
  updateDressTimeline,
  DressAppointment,
  DressFavorite,
  DressTimeline,
} from "@/lib/api-couple-data";

type NavigationProp = NativeStackNavigationProp<PlanningStackParamList>;

const TIMELINE_STEPS = [
  { key: "ordered", label: "Bestilt", icon: "shopping-bag" as const, dateKey: "orderedDate" },
  { key: "firstFitting", label: "Første prøving", icon: "user" as const, dateKey: "firstFittingDate" },
  { key: "alterations", label: "Endringer", icon: "scissors" as const, dateKey: "alterationsDate" },
  { key: "finalFitting", label: "Siste prøving", icon: "check-circle" as const, dateKey: "finalFittingDate" },
  { key: "pickup", label: "Hentet", icon: "gift" as const, dateKey: "pickupDate" },
];

export default function BrudekjoleScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { isWedding, config } = useEventType();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  useEffect(() => {
    getCoupleSession().then(s => setSessionToken(s?.token || null));
  }, []);

  // Couple profile for tradition hints
  const { data: coupleProfile } = useQuery({
    queryKey: ['coupleProfile'],
    queryFn: async () => {
      if (!sessionToken) throw new Error('No session');
      return getCoupleProfile(sessionToken);
    },
    enabled: !!sessionToken,
  });

  const [activeTab, setActiveTab] = useState<"appointments" | "favorites" | "timeline">("appointments");
  const [refreshing, setRefreshing] = useState(false);

  // Query for dress data
  const { data: dressData, isLoading: loading, refetch } = useQuery({
    queryKey: ["dress-data"],
    queryFn: getDressData,
  });

  const appointments = dressData?.appointments ?? [];
  const favorites = dressData?.favorites ?? [];
  const timeline = dressData?.timeline ?? {
    ordered: false,
    firstFitting: false,
    alterations: false,
    finalFitting: false,
    pickup: false,
    budget: 0,
  };
  const dressBudget = timeline?.budget ?? 0;

  // Appointment modal state
  // Vendor search for bridal shop autocomplete
  const shopSearch = useVendorSearch({ category: undefined });

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<DressAppointment | null>(null);
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentNotes, setAppointmentNotes] = useState("");

  // Dress modal state
  const [showDressModal, setShowDressModal] = useState(false);
  const [editingDress, setEditingDress] = useState<DressFavorite | null>(null);
  const [dressName, setDressName] = useState("");
  const [dressDesigner, setDressDesigner] = useState("");
  const [dressShop, setDressShop] = useState("");
  const [dressPrice, setDressPrice] = useState("");
  const [dressNotes, setDressNotes] = useState("");
  const [dressImage, setDressImage] = useState<string | undefined>();

  // Budget modal state
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");

  // Mutations
  const createAppointmentMutation = useMutation({
    mutationFn: createDressAppointment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dress-data"] }),
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DressAppointment> }) => updateDressAppointment(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dress-data"] }),
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: deleteDressAppointment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dress-data"] }),
  });

  const createFavoriteMutation = useMutation({
    mutationFn: createDressFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dress-data"] }),
  });

  const updateFavoriteMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DressFavorite> }) => updateDressFavorite(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dress-data"] }),
  });

  const deleteFavoriteMutation = useMutation({
    mutationFn: deleteDressFavorite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dress-data"] }),
  });

  const updateTimelineMutation = useMutation({
    mutationFn: updateDressTimeline,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["dress-data"] }),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [refetch]);

  // Appointment handlers
  const openAppointmentModal = (appointment?: DressAppointment) => {
    if (appointment) {
      setEditingAppointment(appointment);
      shopSearch.setSearchText(appointment.shopName);
      shopSearch.setSelectedVendor(null);
      setAppointmentDate(appointment.date);
      setAppointmentTime(appointment.time || "");
      setAppointmentNotes(appointment.notes || "");
    } else {
      setEditingAppointment(null);
      shopSearch.clearSelection();
      setAppointmentDate("");
      setAppointmentTime("");
      setAppointmentNotes("");
    }
    setShowAppointmentModal(true);
  };

  const saveAppointment = async () => {
    if (!shopSearch.searchText.trim() || !appointmentDate.trim()) {
      showToast("Vennligst fyll inn butikknavn og dato");
      return;
    }

    try {
      if (editingAppointment) {
        await updateAppointmentMutation.mutateAsync({
          id: editingAppointment.id,
          data: { shopName: shopSearch.searchText.trim(), date: appointmentDate, time: appointmentTime, notes: appointmentNotes },
        });
      } else {
        await createAppointmentMutation.mutateAsync({
          shopName: shopSearch.searchText.trim(),
          date: appointmentDate,
          time: appointmentTime,
          notes: appointmentNotes,
          completed: false,
        });
      }
      setShowAppointmentModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      showToast("Kunne ikke lagre avtale");
    }
  };

  const toggleAppointmentComplete = async (id: string) => {
    const appointment = appointments.find((a) => a.id === id);
    if (appointment) {
      await updateAppointmentMutation.mutateAsync({ id, data: { completed: !appointment.completed } });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    await deleteAppointmentMutation.mutateAsync(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const duplicateAppointment = async (appointment: DressAppointment) => {
    try {
      await createAppointmentMutation.mutateAsync({
        shopName: `Kopi av ${appointment.shopName}`,
        date: appointment.date,
        time: appointment.time,
        notes: appointment.notes,
        completed: false,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      showToast("Kunne ikke duplisere avtale");
    }
  };

  // Dress handlers
  const openDressModal = (dress?: DressFavorite) => {
    if (dress) {
      setEditingDress(dress);
      setDressName(dress.name);
      setDressDesigner(dress.designer || "");
      setDressShop(dress.shop || "");
      setDressPrice(dress.price?.toString() || "");
      setDressNotes(dress.notes || "");
      setDressImage(dress.imageUrl);
    } else {
      setEditingDress(null);
      setDressName("");
      setDressDesigner("");
      setDressShop("");
      setDressPrice("");
      setDressNotes("");
      setDressImage(undefined);
    }
    setShowDressModal(true);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const optimizedUri = await optimizeImage(result.assets[0].uri, PHOTO_PRESET);
      setDressImage(optimizedUri);
    }
  };

  const saveDress = async () => {
    if (!dressName.trim()) {
      showToast("Vennligst gi kjolen et navn");
      return;
    }

    try {
      if (editingDress) {
        await updateFavoriteMutation.mutateAsync({
          id: editingDress.id,
          data: {
            name: dressName,
            designer: dressDesigner,
            shop: dressShop,
            price: parseFloat(dressPrice) || 0,
            notes: dressNotes,
            imageUrl: dressImage,
          },
        });
      } else {
        await createFavoriteMutation.mutateAsync({
          name: dressName,
          designer: dressDesigner,
          shop: dressShop,
          price: parseFloat(dressPrice) || 0,
          notes: dressNotes,
          imageUrl: dressImage,
          isFavorite: false,
        });
      }
      setShowDressModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      showToast("Kunne ikke lagre kjole");
    }
  };

  const toggleFavorite = async (id: string) => {
    const dress = favorites.find((d) => d.id === id);
    if (dress) {
      await updateFavoriteMutation.mutateAsync({ id, data: { isFavorite: !dress.isFavorite } });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleDeleteDress = async (id: string) => {
    await deleteFavoriteMutation.mutateAsync(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const duplicateDress = async (dress: DressFavorite) => {
    try {
      await createFavoriteMutation.mutateAsync({
        name: `Kopi av ${dress.name}`,
        designer: dress.designer,
        shop: dress.shop,
        price: dress.price,
        notes: dress.notes,
        imageUrl: dress.imageUrl,
        isFavorite: dress.isFavorite,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      showToast("Kunne ikke duplisere kjole");
    }
  };

  // Timeline handlers
  const toggleTimelineStep = async (key: string, dateKey: string) => {
    const currentValue = (timeline as any)[key];
    try {
      await updateTimelineMutation.mutateAsync({
        ...timeline,
        [key]: !currentValue,
        [dateKey]: !currentValue ? new Date().toISOString().split("T")[0] : undefined,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {
      showToast("Kunne ikke oppdatere tidslinje");
    }
  };

  // Budget handlers
  const saveBudget = async () => {
    const budget = parseFloat(budgetInput) || 0;
    try {
      await updateTimelineMutation.mutateAsync({ ...timeline, budget });
      setShowBudgetModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      showToast("Kunne ikke lagre budsjett");
    }
  };

  const totalSpent = favorites.reduce((sum, d) => sum + (d.price || 0), 0);
  const budgetRemaining = dressBudget - totalSpent;

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
        <ThemedText style={{ color: theme.textSecondary }}>Laster...</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.accent} />}
      >
        {/* Marketplace hero + search + vendor cards */}
        <VendorCategoryMarketplace
          category="dress"
          categoryName="Brudekjole"
          icon="heart"
          subtitle={isWedding ? 'Finn drømmekjolen' : 'Finn det perfekte antrekket'}
          selectedTraditions={coupleProfile?.selectedTraditions}
        />

        {/* Budget Overview */}
        {/* Tradition hints for dress */}
        {(coupleProfile?.selectedTraditions?.length ?? 0) > 0 && (
          <TraditionHintBanner
            traditions={coupleProfile?.selectedTraditions || []}
            category="dress"
          />
        )}
        <Animated.View entering={FadeInDown.delay(50).duration(400)}>
          <Pressable onPress={() => {
            setBudgetInput(dressBudget.toString());
            setShowBudgetModal(true);
          }}>
            <View style={[styles.budgetCard, { backgroundColor: theme.backgroundDefault }]}>
              <View style={styles.budgetHeader}>
                <View style={[styles.budgetIcon, { backgroundColor: Colors.dark.accent + "20" }]}>
                  <EvendiIcon name="dollar-sign" size={20} color={Colors.dark.accent} />
                </View>
                <View style={styles.budgetInfo}>
                  <ThemedText style={styles.budgetLabel}>{isWedding ? "Kjolebudsjett" : "Antrekksbudsjett"}</ThemedText>
                  <ThemedText style={[styles.budgetAmount, { color: Colors.dark.accent }]}>
                    {dressBudget > 0 ? `${dressBudget.toLocaleString("nb-NO")} kr` : "Sett budsjett"}
                  </ThemedText>
                </View>
                <EvendiIcon name="edit-2" size={16} color={theme.textMuted} />
              </View>
              {dressBudget > 0 && (
                <View style={styles.budgetProgress}>
                  <View style={styles.budgetProgressBar}>
                    <View
                      style={[
                        styles.budgetProgressFill,
                        {
                          width: `${Math.min((totalSpent / dressBudget) * 100, 100)}%`,
                          backgroundColor: budgetRemaining >= 0 ? Colors.dark.accent : "#E57373",
                        },
                      ]}
                    />
                  </View>
                  <View style={styles.budgetStats}>
                    <ThemedText style={[styles.budgetStatText, { color: theme.textMuted }]}>
                      Brukt: {totalSpent.toLocaleString("nb-NO")} kr
                    </ThemedText>
                    <ThemedText
                      style={[styles.budgetStatText, { color: budgetRemaining >= 0 ? "#81C784" : "#E57373" }]}
                    >
                      {budgetRemaining >= 0 ? "Gjenstår" : "Over"}: {Math.abs(budgetRemaining).toLocaleString("nb-NO")} kr
                    </ThemedText>
                  </View>
                </View>
              )}
            </View>
          </Pressable>
        </Animated.View>

        {/* Tabs */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={styles.tabs}>
            {[
              { key: "appointments", label: "Avtaler", icon: "calendar" },
              { key: "favorites", label: "Favoritter", icon: "heart" },
              { key: "timeline", label: "Tidslinje", icon: "git-commit" },
            ].map((tab) => (
              <Pressable
                key={tab.key}
                onPress={() => {
                  setActiveTab(tab.key as any);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.tab,
                  { backgroundColor: activeTab === tab.key ? Colors.dark.accent : theme.backgroundDefault },
                ]}
              >
                <EvendiIcon
                  name={tab.icon as any}
                  size={16}
                  color={activeTab === tab.key ? "#fff" : theme.textMuted}
                />
                <ThemedText
                  style={[styles.tabText, { color: activeTab === tab.key ? "#fff" : theme.text }]}
                >
                  {tab.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </Animated.View>

        {/* Appointments Tab */}
        {activeTab === "appointments" && (
          <Animated.View entering={FadeInRight.duration(300)}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>{isWedding ? "Prøveavtaler" : "Avtaler"}</ThemedText>
              <Pressable onPress={() => openAppointmentModal()}>
                <View style={[styles.addButton, { backgroundColor: Colors.dark.accent }]}>
                  <EvendiIcon name="plus" size={18} color="#fff" />
                </View>
              </Pressable>
            </View>

            {appointments.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.backgroundDefault }]}>
                <EvendiIcon name="calendar" size={40} color={theme.textMuted} />
                <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
                  Ingen avtaler lagt til
                </ThemedText>
                <ThemedText style={[styles.emptySubtext, { color: theme.textMuted }]}>
                  Trykk + for å legge til en prøveavtale
                </ThemedText>
              </View>
            ) : (
              appointments.map((appointment, idx) => (
                <Animated.View key={appointment.id} entering={FadeInDown.delay(idx * 50).duration(300)}>
                  <SwipeableRow
                    onEdit={() => openAppointmentModal(appointment)}
                    onDelete={() => handleDeleteAppointment(appointment.id)}
                  >
                    <View style={[styles.appointmentCard, { backgroundColor: theme.backgroundDefault }]}>
                      <Pressable
                        onPress={() => toggleAppointmentComplete(appointment.id)}
                        onLongPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          showOptions({
                            title: appointment.shopName,
                            message: "Velg en handling",
                            options: [
                              { label: "Rediger", onPress: () => openAppointmentModal(appointment) },
                              { label: "Dupliser", onPress: () => duplicateAppointment(appointment) },
                              { label: "Slett", destructive: true, onPress: () => handleDeleteAppointment(appointment.id) },
                            ],
                            cancelLabel: "Avbryt",
                          });
                        }}
                        style={[
                          styles.checkbox,
                          {
                            borderColor: appointment.completed ? Colors.dark.accent : theme.border,
                            backgroundColor: appointment.completed ? Colors.dark.accent : "transparent",
                          },
                        ]}
                      >
                        {appointment.completed && <EvendiIcon name="check" size={14} color="#fff" />}
                      </Pressable>
                      <View style={styles.appointmentInfo}>
                        <ThemedText
                          style={[
                            styles.appointmentShop,
                            appointment.completed && styles.completedText,
                          ]}
                        >
                          {appointment.shopName}
                        </ThemedText>
                        <View style={styles.appointmentMeta}>
                          <EvendiIcon name="calendar" size={12} color={theme.textMuted} />
                          <ThemedText style={[styles.appointmentDate, { color: theme.textMuted }]}>
                            {appointment.date} {appointment.time && `kl. ${appointment.time}`}
                          </ThemedText>
                        </View>
                        {appointment.notes ? (
                          <ThemedText style={[styles.appointmentNotes, { color: theme.textSecondary }]}>
                            {appointment.notes}
                          </ThemedText>
                        ) : null}
                      </View>
                      <Pressable
                        onPress={() => {
                          duplicateAppointment(appointment);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                        style={[styles.quickActionButton, { backgroundColor: theme.backgroundSecondary }]}
                      >
                        <EvendiIcon name="copy" size={16} color={Colors.dark.accent} />
                      </Pressable>
                    </View>
                  </SwipeableRow>
                </Animated.View>
              ))
            )}
          </Animated.View>
        )}

        {/* Favorites Tab */}
        {activeTab === "favorites" && (
          <Animated.View entering={FadeInRight.duration(300)}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>{isWedding ? "Lagrede kjoler" : "Lagrede antrekk"}</ThemedText>
              <Pressable onPress={() => openDressModal()}>
                <View style={[styles.addButton, { backgroundColor: Colors.dark.accent }]}>
                  <EvendiIcon name="plus" size={18} color="#fff" />
                </View>
              </Pressable>
            </View>

            {favorites.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: theme.backgroundDefault }]}>
                <EvendiIcon name="heart" size={40} color={theme.textMuted} />
                <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
                  Ingen kjoler lagret
                </ThemedText>
                <ThemedText style={[styles.emptySubtext, { color: theme.textMuted }]}>
                  Ta bilde av kjoler du liker under prøvinger
                </ThemedText>
              </View>
            ) : (
              <View style={styles.dressGrid}>
                {favorites.map((dress, idx) => (
                  <Animated.View
                    key={dress.id}
                    entering={FadeInDown.delay(idx * 50).duration(300)}
                    style={styles.dressCardWrapper}
                  >
                    <Pressable 
                      onPress={() => openDressModal(dress)} 
                      onLongPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        showOptions({
                          title: dress.name,
                          message: "Velg en handling",
                          options: [
                            { label: "Rediger", onPress: () => openDressModal(dress) },
                            { label: "Dupliser", onPress: () => duplicateDress(dress) },
                            { label: "Slett", destructive: true, onPress: () => handleDeleteDress(dress.id) },
                          ],
                          cancelLabel: "Avbryt",
                        });
                      }}
                    >
                      <View style={[styles.dressCard, { backgroundColor: theme.backgroundDefault }]}>
                        {dress.imageUrl ? (
                          <Image source={{ uri: dress.imageUrl }} style={styles.dressImage} />
                        ) : (
                          <View style={[styles.dressImagePlaceholder, { backgroundColor: theme.border }]}>
                            <EvendiIcon name="image" size={30} color={theme.textMuted} />
                          </View>
                        )}
                        <Pressable
                          onPress={() => toggleFavorite(dress.id)}
                          style={[styles.favoriteButton, { backgroundColor: theme.backgroundDefault }]}
                        >
                          <EvendiIcon
                            name="heart"
                            size={16}
                            color={dress.isFavorite ? "#E57373" : theme.textMuted}
                            style={{ opacity: dress.isFavorite ? 1 : 0.5 }}
                          />
                        </Pressable>
                        <View style={styles.dressInfo}>
                          <ThemedText style={styles.dressName} numberOfLines={1}>
                            {dress.name}
                          </ThemedText>
                          {dress.designer ? (
                            <ThemedText style={[styles.dressDesigner, { color: theme.textMuted }]} numberOfLines={1}>
                              {dress.designer}
                            </ThemedText>
                          ) : null}
                          {dress.price > 0 && (
                            <ThemedText style={[styles.dressPrice, { color: Colors.dark.accent }]}>
                              {dress.price.toLocaleString("nb-NO")} kr
                            </ThemedText>
                          )}
                        </View>
                      </View>
                    </Pressable>
                  </Animated.View>
                ))}
              </View>
            )}
          </Animated.View>
        )}

        {/* Timeline Tab */}
        {activeTab === "timeline" && (
          <Animated.View entering={FadeInRight.duration(300)}>
            <ThemedText style={styles.sectionTitle}>{isWedding ? "Kjolens reise" : "Antrekksplan"}</ThemedText>
            <View style={[styles.timelineCard, { backgroundColor: theme.backgroundDefault }]}>
              {TIMELINE_STEPS.map((step, idx) => {
                const isCompleted = (timeline as any)[step.key] as boolean;
                const dateValue = (timeline as any)[step.dateKey] as string | undefined;

                return (
                  <Pressable
                    key={step.key}
                    onPress={() => toggleTimelineStep(step.key, step.dateKey)}
                  >
                    <View style={styles.timelineStep}>
                      <View style={styles.timelineIndicator}>
                        <View
                          style={[
                            styles.timelineDot,
                            {
                              backgroundColor: isCompleted ? Colors.dark.accent : theme.border,
                              borderColor: isCompleted ? Colors.dark.accent : theme.border,
                            },
                          ]}
                        >
                          {isCompleted && <EvendiIcon name="check" size={12} color="#fff" />}
                        </View>
                        {idx < TIMELINE_STEPS.length - 1 && (
                          <View
                            style={[
                              styles.timelineLine,
                              { backgroundColor: isCompleted ? Colors.dark.accent : theme.border },
                            ]}
                          />
                        )}
                      </View>
                      <View style={styles.timelineContent}>
                        <View style={styles.timelineHeader}>
                          <View style={[styles.timelineIcon, { backgroundColor: isCompleted ? Colors.dark.accent + "20" : theme.border + "40" }]}>
                            <EvendiIcon name={step.icon} size={16} color={isCompleted ? Colors.dark.accent : theme.textMuted} />
                          </View>
                          <View style={styles.timelineTextContainer}>
                            <ThemedText style={[styles.timelineLabel, isCompleted && styles.completedText]}>
                              {step.label}
                            </ThemedText>
                            {dateValue && (
                              <ThemedText style={[styles.timelineDate, { color: theme.textMuted }]}>
                                {new Date(dateValue).toLocaleDateString("nb-NO")}
                              </ThemedText>
                            )}
                          </View>
                        </View>
                      </View>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View style={[styles.tipCard, { backgroundColor: Colors.dark.accent + "15" }]}>
              <EvendiIcon name="info" size={18} color={Colors.dark.accent} />
              <ThemedText style={[styles.tipText, { color: theme.text }]}>
                Bestill kjolen 6-9 måneder før bryllupet for å ha tid til prøvinger og endringer.
              </ThemedText>
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Appointment Modal */}
      <Modal visible={showAppointmentModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {editingAppointment ? "Rediger avtale" : "Ny prøveavtale"}
              </ThemedText>
              <Pressable onPress={() => setShowAppointmentModal(false)}>
                <EvendiIcon name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <PersistentTextInput
              draftKey="BrudekjoleScreen-input-1"
              style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              placeholder="Søk etter brudesalong..."
              placeholderTextColor={theme.textMuted}
              value={shopSearch.searchText}
              onChangeText={shopSearch.onChangeText}
            />
            {shopSearch.selectedVendor && (
              <VendorActionBar
                vendor={shopSearch.selectedVendor}
                vendorCategory="bridal"
                onClear={shopSearch.clearSelection}
                icon="heart"
              />
            )}
            <VendorSuggestions
              suggestions={shopSearch.suggestions}
              isLoading={shopSearch.isLoading}
              onSelect={shopSearch.onSelectVendor}
              onViewProfile={(v) => navigation.navigate("VendorDetail", {
                vendorId: v.id,
                vendorName: v.businessName,
                vendorDescription: v.description || "",
                vendorLocation: v.location || "",
                vendorPriceRange: v.priceRange || "",
                vendorCategory: "bridal",
              })}
              icon="heart"
            />

            <View style={styles.inputRow}>
              <PersistentTextInput
                draftKey="BrudekjoleScreen-input-2"
                style={[styles.input, styles.inputHalf, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                placeholder="Dato (ÅÅÅÅ-MM-DD)"
                placeholderTextColor={theme.textMuted}
                value={appointmentDate}
                onChangeText={setAppointmentDate}
              />
              <PersistentTextInput
                draftKey="BrudekjoleScreen-input-3"
                style={[styles.input, styles.inputHalf, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                placeholder="Tidspunkt (12:00)"
                placeholderTextColor={theme.textMuted}
                value={appointmentTime}
                onChangeText={setAppointmentTime}
              />
            </View>

            <PersistentTextInput
              draftKey="BrudekjoleScreen-input-4"
              style={[styles.input, styles.inputMultiline, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              placeholder="Notater (hva du vil prøve, hvem du tar med...)"
              placeholderTextColor={theme.textMuted}
              value={appointmentNotes}
              onChangeText={setAppointmentNotes}
              multiline
              numberOfLines={3}
            />

            <Button onPress={saveAppointment}>
              {editingAppointment ? "Lagre endringer" : "Legg til avtale"}
            </Button>
          </View>
        </View>
      </Modal>

      {/* Dress Modal */}
      <Modal visible={showDressModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <ScrollView style={[styles.modalContent, styles.modalScrollable, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {editingDress ? "Rediger kjole" : "Legg til kjole"}
              </ThemedText>
              <Pressable onPress={() => setShowDressModal(false)}>
                <EvendiIcon name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <Pressable onPress={pickImage} style={styles.imagePickerContainer}>
              {dressImage ? (
                <Image source={{ uri: dressImage }} style={styles.imagePreview} />
              ) : (
                <View style={[styles.imagePlaceholder, { backgroundColor: theme.backgroundRoot, borderColor: theme.border }]}>
                  <EvendiIcon name="camera" size={30} color={theme.textMuted} />
                  <ThemedText style={[styles.imagePlaceholderText, { color: theme.textMuted }]}>
                    Ta bilde eller velg fra album
                  </ThemedText>
                </View>
              )}
            </Pressable>

            <PersistentTextInput
              draftKey="BrudekjoleScreen-input-5"
              style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              placeholder="Kjolens navn (f.eks. Pronovias Atelier)"
              placeholderTextColor={theme.textMuted}
              value={dressName}
              onChangeText={setDressName}
            />

            <PersistentTextInput
              draftKey="BrudekjoleScreen-input-6"
              style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              placeholder="Designer"
              placeholderTextColor={theme.textMuted}
              value={dressDesigner}
              onChangeText={setDressDesigner}
            />

            <PersistentTextInput
              draftKey="BrudekjoleScreen-input-7"
              style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              placeholder="Butikk"
              placeholderTextColor={theme.textMuted}
              value={dressShop}
              onChangeText={setDressShop}
            />

            <PersistentTextInput
              draftKey="BrudekjoleScreen-input-8"
              style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              placeholder="Pris (kr)"
              placeholderTextColor={theme.textMuted}
              value={dressPrice}
              onChangeText={setDressPrice}
              keyboardType="numeric"
            />

            <PersistentTextInput
              draftKey="BrudekjoleScreen-input-9"
              style={[styles.input, styles.inputMultiline, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              placeholder="Notater (passform, følelse, detaljer...)"
              placeholderTextColor={theme.textMuted}
              value={dressNotes}
              onChangeText={setDressNotes}
              multiline
              numberOfLines={3}
            />

            <Button onPress={saveDress}>
              {editingDress ? "Lagre endringer" : "Lagre kjole"}
            </Button>
            <View style={{ height: Spacing.xl }} />
          </ScrollView>
        </View>
      </Modal>

      {/* Budget Modal */}
      <Modal visible={showBudgetModal} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>{isWedding ? "Sett kjolebudsjett" : "Sett antrekksbudsjett"}</ThemedText>
              <Pressable onPress={() => setShowBudgetModal(false)}>
                <EvendiIcon name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <PersistentTextInput
              draftKey="BrudekjoleScreen-input-10"
              style={[styles.input, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
              placeholder="Budsjett i kroner"
              placeholderTextColor={theme.textMuted}
              value={budgetInput}
              onChangeText={setBudgetInput}
              keyboardType="numeric"
            />

            <Button onPress={saveBudget}>Lagre budsjett</Button>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },

  budgetCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  budgetHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  budgetIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  budgetInfo: { flex: 1 },
  budgetLabel: { fontSize: 14, opacity: 0.7 },
  budgetAmount: { fontSize: 20, fontWeight: "600" },
  budgetProgress: { marginTop: Spacing.md },
  budgetProgressBar: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  budgetProgressFill: { height: "100%", borderRadius: 3 },
  budgetStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Spacing.xs,
  },
  budgetStatText: { fontSize: 12 },

  tabs: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  tabText: { fontSize: 13, fontWeight: "500" },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    gap: Spacing.sm,
  },
  emptyText: { fontSize: 16, fontWeight: "500" },
  emptySubtext: { fontSize: 14, textAlign: "center" },

  appointmentCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
    marginTop: 2,
  },
  appointmentInfo: { flex: 1 },
  appointmentShop: { fontSize: 16, fontWeight: "500", marginBottom: 4 },
  appointmentMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  appointmentDate: { fontSize: 13 },
  appointmentNotes: { fontSize: 13, marginTop: 4 },
  completedText: { textDecorationLine: "line-through", opacity: 0.6 },

  dressGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -Spacing.xs,
  },
  dressCardWrapper: {
    width: "50%",
    padding: Spacing.xs,
  },
  dressCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  dressImage: {
    width: "100%",
    aspectRatio: 3 / 4,
  },
  dressImagePlaceholder: {
    width: "100%",
    aspectRatio: 3 / 4,
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  dressInfo: { padding: Spacing.sm },
  dressName: { fontSize: 14, fontWeight: "600" },
  dressDesigner: { fontSize: 12, marginTop: 2 },
  dressPrice: { fontSize: 13, fontWeight: "500", marginTop: 4 },

  timelineCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  timelineStep: {
    flexDirection: "row",
    minHeight: 60,
  },
  timelineIndicator: {
    alignItems: "center",
    width: 24,
    marginRight: Spacing.md,
  },
  timelineDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: Spacing.xs,
    marginBottom: -Spacing.xs,
  },
  timelineContent: { flex: 1, paddingBottom: Spacing.md },
  timelineHeader: { flexDirection: "row", alignItems: "center" },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  timelineTextContainer: { flex: 1 },
  timelineLabel: { fontSize: 15, fontWeight: "500" },
  timelineDate: { fontSize: 12, marginTop: 2 },

  quickActionButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },

  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  tipText: { flex: 1, fontSize: 13, lineHeight: 18 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xl + 20,
  },
  modalScrollable: {
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: { fontSize: 20, fontWeight: "600" },

  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  inputHalf: { flex: 1 },
  inputMultiline: {
    minHeight: 80,
    textAlignVertical: "top",
  },

  imagePickerContainer: {
    marginBottom: Spacing.md,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.md,
  },
  imagePlaceholder: {
    height: 150,
    borderWidth: 2,
    borderStyle: "dashed",
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: { marginTop: Spacing.sm, fontSize: 14 },
});
