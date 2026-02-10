import React, { useState, useCallback, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Modal,
  Image,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EvendiIcon } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getCoupleProfile } from '@/lib/api-couples';
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SwipeableRow } from "@/components/SwipeableRow";
import { VendorSuggestions } from "@/components/VendorSuggestions";
import { VendorActionBar } from "@/components/VendorActionBar";
import { useTheme } from "@/hooks/useTheme";
import { useEventType } from "@/hooks/useEventType";
import { useVendorSearch } from "@/hooks/useVendorSearch";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { PlanningStackParamList } from "@/navigation/PlanningStackNavigator";
import { showToast } from "@/lib/toast";
import { showConfirm, showOptions } from "@/lib/dialogs";
import {
  getHairMakeupData,
  createHairMakeupAppointment,
  updateHairMakeupAppointment,
  deleteHairMakeupAppointment,
  createHairMakeupLook,
  updateHairMakeupLook,
  deleteHairMakeupLook,
  updateHairMakeupTimeline,
  HairMakeupAppointment,
  HairMakeupLook,
  HairMakeupTimeline,
} from "@/lib/api-couple-data";

type NavigationProp = NativeStackNavigationProp<PlanningStackParamList>;

const TIMELINE_STEPS = [
  { key: "consultationBooked", label: "Konsultasjon booket", icon: "calendar" as const },
  { key: "trialBooked", label: "Prøvetime booket", icon: "user" as const },
  { key: "lookSelected", label: "Look valgt", icon: "heart" as const },
  { key: "weddingDayBooked", label: "Dagen booket", icon: "check-circle" as const },
];

const SERVICE_TYPES = ["Hår", "Makeup", "Hår & Makeup", "Negler", "Annet"];
const APPOINTMENT_TYPES = ["Konsultasjon", "Prøvetime", "Dagen", "Annet"];
const LOOK_TYPES = ["Hår", "Makeup", "Komplett look"];

export default function HaarMakeupScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"appointments" | "looks" | "timeline">("appointments");
  const [refreshing, setRefreshing] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const COUPLE_STORAGE_KEY = 'wedflow_couple_session';

  // Load session token on mount
  React.useEffect(() => {
    const loadSession = async () => {
      const data = await AsyncStorage.getItem(COUPLE_STORAGE_KEY);
      if (!data) return;
      const parsed = JSON.parse(data);
      setSessionToken(parsed?.sessionToken || null);
    };
    loadSession();
  }, []);

  // Fetch couple profile for selected traditions
  const { data: coupleProfile } = useQuery({
    queryKey: ['coupleProfile'],
    queryFn: async () => {
      if (!sessionToken) throw new Error('No session');
      return getCoupleProfile(sessionToken);
    },
    enabled: !!sessionToken,
  });

  // Query for hair/makeup data
  const { data: hairMakeupData, isLoading: loading, isError, error, refetch } = useQuery({
    queryKey: ["hair-makeup-data"],
    queryFn: getHairMakeupData,
  });

  // Saving state for buttons
  const [isSavingAppointment, setIsSavingAppointment] = useState(false);
  const [isSavingLook, setIsSavingLook] = useState(false);
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  // Parse date string (DD.MM.YYYY or YYYY-MM-DD) to sortable format
  const parseDate = (dateStr: string): Date => {
    if (!dateStr) return new Date(0);
    // Try DD.MM.YYYY format
    const norMatch = dateStr.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (norMatch) {
      return new Date(parseInt(norMatch[3]), parseInt(norMatch[2]) - 1, parseInt(norMatch[1]));
    }
    // Try YYYY-MM-DD format
    const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      return new Date(parseInt(isoMatch[1]), parseInt(isoMatch[2]) - 1, parseInt(isoMatch[3]));
    }
    return new Date(dateStr);
  };

  // Sort appointments by date (upcoming first, then completed)
  const rawAppointments = hairMakeupData?.appointments ?? [];
  const appointments = [...rawAppointments].sort((a, b) => {
    // Completed appointments go to the bottom
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    // Sort by date
    return parseDate(a.date).getTime() - parseDate(b.date).getTime();
  });

  const looks = hairMakeupData?.looks ?? [];
  const timeline = hairMakeupData?.timeline ?? {
    consultationBooked: false,
    trialBooked: false,
    lookSelected: false,
    weddingDayBooked: false,
    budget: 0,
  };
  const budget = timeline?.budget ?? 0;

  // Appointment modal state
  // Vendor search for stylist/salon autocomplete
  const stylistSearch = useVendorSearch({ category: "beauty" });

  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<HairMakeupAppointment | null>(null);
  const [appointmentServiceType, setAppointmentServiceType] = useState("");
  const [appointmentType, setAppointmentType] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentLocation, setAppointmentLocation] = useState("");
  const [appointmentNotes, setAppointmentNotes] = useState("");

  // Look modal state
  const [showLookModal, setShowLookModal] = useState(false);
  const [editingLook, setEditingLook] = useState<HairMakeupLook | null>(null);
  const [lookName, setLookName] = useState("");
  const [lookType, setLookType] = useState("");
  const [lookImage, setLookImage] = useState<string | undefined>();
  const [lookNotes, setLookNotes] = useState("");

  // Budget modal state
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");

  // Mutations
  const createAppointmentMutation = useMutation({
    mutationFn: createHairMakeupAppointment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hair-makeup-data"] }),
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<HairMakeupAppointment> }) => updateHairMakeupAppointment(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hair-makeup-data"] }),
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: deleteHairMakeupAppointment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hair-makeup-data"] }),
  });

  const createLookMutation = useMutation({
    mutationFn: createHairMakeupLook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hair-makeup-data"] }),
  });

  const updateLookMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<HairMakeupLook> }) => updateHairMakeupLook(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hair-makeup-data"] }),
  });

  const deleteLookMutation = useMutation({
    mutationFn: deleteHairMakeupLook,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hair-makeup-data"] }),
  });

  const updateTimelineMutation = useMutation({
    mutationFn: updateHairMakeupTimeline,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["hair-makeup-data"] }),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [refetch]);

  // Appointment handlers
  const openAppointmentModal = (appointment?: HairMakeupAppointment) => {
    if (appointment) {
      setEditingAppointment(appointment);
      stylistSearch.setSearchText(appointment.stylistName);
      stylistSearch.setSelectedVendor(null);
      setAppointmentServiceType(appointment.serviceType || "");
      setAppointmentType(appointment.appointmentType || "");
      setAppointmentDate(appointment.date);
      setAppointmentTime(appointment.time || "");
      setAppointmentLocation(appointment.location || "");
      setAppointmentNotes(appointment.notes || "");
    } else {
      setEditingAppointment(null);
      stylistSearch.clearSelection();
      setAppointmentServiceType("");
      setAppointmentType("");
      setAppointmentDate("");
      setAppointmentTime("");
      setAppointmentLocation("");
      setAppointmentNotes("");
    }
    setShowAppointmentModal(true);
  };

  // Validate date format (DD.MM.YYYY or YYYY-MM-DD)
  const isValidDate = (dateStr: string): boolean => {
    if (!dateStr) return false;
    const norFormat = /^\d{1,2}\.\d{1,2}\.\d{4}$/;
    const isoFormat = /^\d{4}-\d{2}-\d{2}$/;
    return norFormat.test(dateStr) || isoFormat.test(dateStr);
  };

  // Validate time format (HH:MM)
  const isValidTime = (timeStr: string): boolean => {
    if (!timeStr) return true; // Time is optional
    return /^\d{1,2}:\d{2}$/.test(timeStr);
  };

  const saveAppointment = async () => {
    if (!stylistSearch.searchText.trim() || !appointmentDate.trim()) {
      showToast("Vennligst fyll inn stylist og dato");
      return;
    }

    if (!isValidDate(appointmentDate)) {
      showToast("Bruk format DD.MM.ÅÅÅÅ (f.eks. 15.06.2026)");
      return;
    }

    if (appointmentTime && !isValidTime(appointmentTime)) {
      showToast("Bruk format HH:MM (f.eks. 14:30)");
      return;
    }

    setIsSavingAppointment(true);
    try {
      if (editingAppointment) {
        await updateAppointmentMutation.mutateAsync({
          id: editingAppointment.id,
          data: {
            stylistName: stylistSearch.searchText.trim(),
            serviceType: appointmentServiceType,
            appointmentType: appointmentType,
            date: appointmentDate,
            time: appointmentTime,
            location: appointmentLocation,
            notes: appointmentNotes,
          },
        });
      } else {
        await createAppointmentMutation.mutateAsync({
          stylistName: stylistSearch.searchText.trim(),
          serviceType: appointmentServiceType,
          appointmentType: appointmentType,
          date: appointmentDate,
          time: appointmentTime,
          location: appointmentLocation,
          notes: appointmentNotes,
          completed: false,
        });
      }
      setShowAppointmentModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      showToast("Kunne ikke lagre avtale");
    } finally {
      setIsSavingAppointment(false);
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
    const appointment = appointments.find((a) => a.id === id);
    const confirmed = await showConfirm({
      title: "Slett avtale",
      message: `Er du sikker på at du vil slette avtalen med ${appointment?.stylistName || 'denne stylisten'}?`,
      confirmLabel: "Slett",
      cancelLabel: "Avbryt",
      destructive: true,
    });
    if (confirmed) {
      await deleteAppointmentMutation.mutateAsync(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const duplicateAppointment = async (appointment: HairMakeupAppointment) => {
    try {
      await createAppointmentMutation.mutateAsync({
        stylistName: `Kopi av ${appointment.stylistName}`,
        serviceType: appointment.serviceType,
        appointmentType: appointment.appointmentType,
        date: appointment.date,
        time: appointment.time,
        location: appointment.location,
        notes: appointment.notes,
        completed: false,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      showToast("Kunne ikke duplisere avtale");
    }
  };

  // Look handlers
  const openLookModal = (look?: HairMakeupLook) => {
    if (look) {
      setEditingLook(look);
      setLookName(look.name);
      setLookType(look.lookType);
      setLookImage(look.imageUrl);
      setLookNotes(look.notes || "");
    } else {
      setEditingLook(null);
      setLookName("");
      setLookType("");
      setLookImage(undefined);
      setLookNotes("");
    }
    setShowLookModal(true);
  };

  const pickImage = async () => {
    // Request permissions first
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast("Vi trenger tilgang til bildebiblioteket for å velge bilder.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setLookImage(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setLookImage(undefined);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const saveLook = async () => {
    if (!lookName.trim()) {
      showToast("Vennligst gi looket et navn");
      return;
    }

    setIsSavingLook(true);
    try {
      if (editingLook) {
        await updateLookMutation.mutateAsync({
          id: editingLook.id,
          data: { name: lookName, lookType: lookType, imageUrl: lookImage, notes: lookNotes },
        });
      } else {
        await createLookMutation.mutateAsync({
          name: lookName,
          lookType: lookType,
          imageUrl: lookImage,
          notes: lookNotes,
          isFavorite: false,
          isSelected: false,
        });
      }
      setShowLookModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      showToast("Kunne ikke lagre look");
    } finally {
      setIsSavingLook(false);
    }
  };

  const toggleLookFavorite = async (id: string) => {
    const look = looks.find((l) => l.id === id);
    if (look) {
      await updateLookMutation.mutateAsync({ id, data: { isFavorite: !look.isFavorite } });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const toggleLookSelected = async (id: string) => {
    const look = looks.find((l) => l.id === id);
    if (look) {
      const willBeSelected = !look.isSelected;
      
      // Unselect others first if selecting
      if (willBeSelected) {
        const othersToUnselect = looks.filter((l) => l.isSelected && l.id !== id);
        await Promise.all(
          othersToUnselect.map((l) => 
            updateLookMutation.mutateAsync({ id: l.id, data: { isSelected: false } })
          )
        );
      }
      
      await updateLookMutation.mutateAsync({ id, data: { isSelected: willBeSelected } });
      
      // Sync timeline.lookSelected with look selection state
      if (timeline.lookSelected !== willBeSelected) {
        await updateTimelineMutation.mutateAsync({ lookSelected: willBeSelected });
      }
      
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleDeleteLook = async (id: string) => {
    const look = looks.find((l) => l.id === id);
    const confirmed = await showConfirm({
      title: "Slett look",
      message: `Er du sikker på at du vil slette "${look?.name || 'dette looket'}"?`,
      confirmLabel: "Slett",
      cancelLabel: "Avbryt",
      destructive: true,
    });
    if (confirmed) {
      await deleteLookMutation.mutateAsync(id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowLookModal(false);
      setEditingLook(null);
      setLookName("");
      setLookNotes("");
      setLookImage(undefined);
    }
  };

  const duplicateLook = async (look: HairMakeupLook) => {
    try {
      await createLookMutation.mutateAsync({
        name: `Kopi av ${look.name}`,
        lookType: look.lookType,
        imageUrl: look.imageUrl,
        notes: look.notes,
        isFavorite: false,
        isSelected: false,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      showToast("Kunne ikke duplisere look");
    }
  };

  // Timeline handlers
  const toggleTimelineStep = async (key: string) => {
    const newValue = !timeline[key as keyof HairMakeupTimeline];
    await updateTimelineMutation.mutateAsync({ [key]: newValue });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Budget handlers
  const openBudgetModal = () => {
    setBudgetInput(budget?.toString() || "");
    setShowBudgetModal(true);
  };

  const saveBudget = async () => {
    const newBudget = parseInt(budgetInput, 10) || 0;
    setIsSavingBudget(true);
    try {
      await updateTimelineMutation.mutateAsync({ budget: newBudget });
      setShowBudgetModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      showToast("Kunne ikke lagre budsjett");
    } finally {
      setIsSavingBudget(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(amount);
  };

  const completedSteps = TIMELINE_STEPS.filter((step) => timeline[step.key as keyof HairMakeupTimeline]).length;
  const progressPercentage = (completedSteps / TIMELINE_STEPS.length) * 100;

  const renderAppointmentsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Avtaler</ThemedText>
        <Pressable onPress={() => openAppointmentModal()} style={[styles.addButton, { backgroundColor: theme.primary }]}>
          <EvendiIcon name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {appointments.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
          <EvendiIcon name="heart" size={48} color={theme.primary} style={{ opacity: 0.6 }} />
          <ThemedText style={[styles.emptyText, { color: theme.text, fontWeight: '600', fontSize: 18 }]}>
            Se best ut på dagen deres
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary, fontSize: 15 }]}>
            La oss finne den perfekte looken sammen.
          </ThemedText>
        </View>
      ) : (
        appointments.map((appointment, index) => (
          <Animated.View key={appointment.id} entering={FadeInDown.delay(index * 50)}>
            <SwipeableRow onDelete={() => handleDeleteAppointment(appointment.id)}>
              <Pressable
                onPress={() => openAppointmentModal(appointment)}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  showOptions({
                    title: appointment.stylistName,
                    message: "Velg en handling",
                    options: [
                      { label: "Rediger", onPress: () => openAppointmentModal(appointment) },
                      { label: "Dupliser", onPress: () => duplicateAppointment(appointment) },
                      { label: "Slett", destructive: true, onPress: () => handleDeleteAppointment(appointment.id) },
                    ],
                    cancelLabel: "Avbryt",
                  });
                }}
                style={[styles.appointmentCard, { backgroundColor: theme.backgroundDefault }]}
              >
                <Pressable
                  onPress={() => toggleAppointmentComplete(appointment.id)}
                  style={[
                    styles.checkbox,
                    { borderColor: theme.border },
                    appointment.completed && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                >
                  {appointment.completed && <EvendiIcon name="check" size={14} color="#fff" />}
                </Pressable>
                <View style={styles.appointmentInfo}>
                  <ThemedText
                    style={[styles.appointmentShop, appointment.completed && styles.completedText]}
                  >
                    {appointment.stylistName}
                  </ThemedText>
                  <ThemedText style={[styles.appointmentDate, { color: theme.textSecondary }]}>
                    {appointment.date} {appointment.time && `kl. ${appointment.time}`}
                  </ThemedText>
                  {appointment.serviceType && (
                    <View style={[styles.serviceTypeBadge, { backgroundColor: theme.primary + '20' }]}>
                      <ThemedText style={[styles.serviceTypeText, { color: theme.primary }]}>
                        {appointment.serviceType}
                      </ThemedText>
                    </View>
                  )}
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
                <EvendiIcon name="chevron-right" size={20} color={theme.textSecondary} />
              </Pressable>
            </SwipeableRow>
          </Animated.View>
        ))
      )}
    </View>
  );

  const renderLooksTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Looks & Inspirasjon</ThemedText>
        <Pressable onPress={() => openLookModal()} style={[styles.addButton, { backgroundColor: theme.primary }]}>
          <EvendiIcon name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {looks.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
          <EvendiIcon name="heart" size={48} color={theme.primary} style={{ opacity: 0.6 }} />
          <ThemedText style={[styles.emptyText, { color: theme.text, fontWeight: '600', fontSize: 18 }]}>
            Hvordan vil dere se ut?
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary, fontSize: 15 }]}>
            Lagre inspirasjon for hår og makeup.
          </ThemedText>
        </View>
      ) : (
        <View style={styles.looksGrid}>
          {looks.map((look, index) => (
            <Animated.View key={look.id} entering={FadeInRight.delay(index * 50)} style={styles.lookCardWrapper}>
              <Pressable
                onPress={() => openLookModal(look)}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  showOptions({
                    title: look.name,
                    message: "Velg en handling",
                    options: [
                      { label: "Rediger", onPress: () => openLookModal(look) },
                      { label: "Dupliser", onPress: () => duplicateLook(look) },
                      { label: look.isSelected ? "Fjern valg" : "Velg", onPress: () => toggleLookSelected(look.id) },
                      { label: "Slett", destructive: true, onPress: () => handleDeleteLook(look.id) },
                    ],
                    cancelLabel: "Avbryt",
                  });
                }}
                style={[
                  styles.lookCard,
                  { backgroundColor: theme.backgroundDefault },
                  look.isSelected ? { borderColor: theme.primary, borderWidth: 2 } : undefined,
                ]}
              >
                {look.imageUrl ? (
                  <Image source={{ uri: look.imageUrl }} style={styles.lookImage} />
                ) : (
                  <View style={[styles.lookImagePlaceholder, { backgroundColor: theme.border }]}>
                    <EvendiIcon name="image" size={32} color={theme.textSecondary} />
                  </View>
                )}
                <View style={styles.lookInfo}>
                  <ThemedText style={styles.lookName} numberOfLines={1}>
                    {look.name}
                  </ThemedText>
                  {look.lookType && (
                    <ThemedText style={[styles.lookType, { color: theme.textSecondary }]}>
                      {look.lookType}
                    </ThemedText>
                  )}
                </View>
                <Pressable
                  onPress={() => toggleLookFavorite(look.id)}
                  style={styles.favoriteButton}
                >
                  <View style={[styles.favoriteIconBg, look.isFavorite && { backgroundColor: Colors.light.error + '20' }]}>
                    <EvendiIcon
                      name="heart"
                      size={18}
                      color={look.isFavorite ? Colors.light.error : theme.textSecondary}
                      fill={look.isFavorite ? Colors.light.error : 'transparent'}
                    />
                  </View>
                </Pressable>
                {look.isSelected && (
                  <View style={[styles.selectedBadge, { backgroundColor: theme.primary }]}>
                    <EvendiIcon name="check" size={12} color="#fff" />
                    <ThemedText style={styles.selectedText}>Valgt</ThemedText>
                  </View>
                )}
              </Pressable>
            </Animated.View>
          ))}
        </View>
      )}
    </View>
  );

  const renderTimelineTab = () => (
    <View style={styles.tabContent}>
      {/* Budget Card */}
      <Pressable onPress={openBudgetModal} style={[styles.budgetCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.budgetHeader}>
          <ThemedText style={styles.budgetLabel}>Budsjett for Hår & Makeup</ThemedText>
          <EvendiIcon name="edit-2" size={16} color={theme.textSecondary} />
        </View>
        <ThemedText style={[styles.budgetAmount, { color: theme.primary }]}>
          {formatCurrency(budget)}
        </ThemedText>
      </Pressable>

      {/* Find Vendors Button */}
      <Pressable
        onPress={() => {
          navigation.navigate("VendorMatching", { 
            category: "beauty",
            selectedTraditions: coupleProfile?.selectedTraditions || [],
          });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
        style={[styles.findVendorsButton, { backgroundColor: theme.primary }]}
      >
        <EvendiIcon name="search" size={18} color="#FFFFFF" />
        <ThemedText style={styles.findVendorsText}>Finn hår & makeup-artister</ThemedText>
        <EvendiIcon name="arrow-right" size={18} color="#FFFFFF" />
      </Pressable>

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
          const isCompleted = timeline[step.key as keyof HairMakeupTimeline];
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
                {isCompleted && <EvendiIcon name="check" size={14} color="#fff" />}
              </View>
              <View style={styles.timelineStepContent}>
                <View style={[styles.timelineIcon, { backgroundColor: isCompleted ? theme.primary + '20' : theme.border }]}>
                  <EvendiIcon name={step.icon} size={16} color={isCompleted ? theme.primary : theme.textSecondary} />
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
          { key: "appointments", label: "Avtaler", icon: "calendar" },
          { key: "looks", label: "Looks", icon: "image" },
          { key: "timeline", label: "Tidslinje", icon: "list" },
        ].map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            style={[styles.tab, activeTab === tab.key && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
          >
            <EvendiIcon name={tab.icon as any} size={18} color={activeTab === tab.key ? theme.primary : theme.textSecondary} />
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>
              Laster data...
            </ThemedText>
          </View>
        ) : isError ? (
          <View style={[styles.errorContainer, { backgroundColor: theme.backgroundDefault }]}>
            <EvendiIcon name="alert-circle" size={48} color={Colors.light.error} />
            <ThemedText style={[styles.errorText, { color: theme.text }]}>
              Kunne ikke laste data
            </ThemedText>
            <ThemedText style={[styles.errorSubtext, { color: theme.textSecondary }]}>
              {error instanceof Error ? error.message : 'En feil oppstod'}
            </ThemedText>
            <Pressable
              onPress={() => refetch()}
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
            >
              <EvendiIcon name="refresh-cw" size={16} color="#fff" />
              <ThemedText style={styles.retryButtonText}>Prøv igjen</ThemedText>
            </Pressable>
          </View>
        ) : (
          <>
            {activeTab === "appointments" && renderAppointmentsTab()}
            {activeTab === "looks" && renderLooksTab()}
            {activeTab === "timeline" && renderTimelineTab()}
          </>
        )}
      </ScrollView>

      {/* Appointment Modal */}
      <Modal visible={showAppointmentModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setShowAppointmentModal(false)} disabled={isSavingAppointment}>
              <ThemedText style={[styles.modalCancel, { color: theme.textSecondary }]}>Avbryt</ThemedText>
            </Pressable>
            <ThemedText style={styles.modalTitle}>
              {editingAppointment ? "Rediger avtale" : "Ny avtale"}
            </ThemedText>
            <Pressable onPress={saveAppointment} disabled={isSavingAppointment}>
              {isSavingAppointment ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <ThemedText style={[styles.modalSave, { color: theme.primary }]}>Lagre</ThemedText>
              )}
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Stylist/Salong *</ThemedText>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={stylistSearch.searchText}
                onChangeText={stylistSearch.onChangeText}
                placeholder="Søk etter registrert stylist..."
                placeholderTextColor={theme.textSecondary}
              />
              {stylistSearch.selectedVendor && (
                <VendorActionBar
                  vendor={stylistSearch.selectedVendor}
                  vendorCategory="beauty"
                  onClear={stylistSearch.clearSelection}
                  icon="scissors"
                />
              )}
              <VendorSuggestions
                suggestions={stylistSearch.suggestions}
                isLoading={stylistSearch.isLoading}
                onSelect={stylistSearch.onSelectVendor}
                onViewProfile={(v) => navigation.navigate("VendorDetail", {
                  vendorId: v.id,
                  vendorName: v.businessName,
                  vendorDescription: v.description || "",
                  vendorLocation: v.location || "",
                  vendorPriceRange: v.priceRange || "",
                  vendorCategory: "beauty",
                })}
                icon="scissors"
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Tjeneste</ThemedText>
              <View style={styles.chipContainer}>
                {SERVICE_TYPES.map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => setAppointmentServiceType(type)}
                    style={[
                      styles.chip,
                      { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                      appointmentServiceType === type ? { backgroundColor: theme.primary, borderColor: theme.primary } : undefined,
                    ]}
                  >
                    <ThemedText
                      style={[styles.chipText, appointmentServiceType === type && { color: "#fff" }]}
                    >
                      {type}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Type avtale</ThemedText>
              <View style={styles.chipContainer}>
                {APPOINTMENT_TYPES.map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => setAppointmentType(type)}
                    style={[
                      styles.chip,
                      { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                      appointmentType === type ? { backgroundColor: theme.primary, borderColor: theme.primary } : undefined,
                    ]}
                  >
                    <ThemedText
                      style={[styles.chipText, appointmentType === type && { color: "#fff" }]}
                    >
                      {type}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Dato *</ThemedText>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={appointmentDate}
                onChangeText={setAppointmentDate}
                placeholder="DD.MM.ÅÅÅÅ"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Klokkeslett</ThemedText>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={appointmentTime}
                onChangeText={setAppointmentTime}
                placeholder="HH:MM"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Sted</ThemedText>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={appointmentLocation}
                onChangeText={setAppointmentLocation}
                placeholder="Adresse eller sted"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Notater</ThemedText>
              <TextInput
                style={[styles.formInput, styles.formTextArea, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={appointmentNotes}
                onChangeText={setAppointmentNotes}
                placeholder="Tilleggsinfo..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Look Modal */}
      <Modal visible={showLookModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setShowLookModal(false)} disabled={isSavingLook}>
              <ThemedText style={[styles.modalCancel, { color: theme.textSecondary }]}>Avbryt</ThemedText>
            </Pressable>
            <ThemedText style={styles.modalTitle}>
              {editingLook ? "Rediger look" : "Nytt look"}
            </ThemedText>
            <Pressable onPress={saveLook} disabled={isSavingLook}>
              {isSavingLook ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <ThemedText style={[styles.modalSave, { color: theme.primary }]}>Lagre</ThemedText>
              )}
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Navn *</ThemedText>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={lookName}
                onChangeText={setLookName}
                placeholder="Gi looket et navn"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Type</ThemedText>
              <View style={styles.chipContainer}>
                {LOOK_TYPES.map((type) => (
                  <Pressable
                    key={type}
                    onPress={() => setLookType(type)}
                    style={[
                      styles.chip,
                      { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                      lookType === type ? { backgroundColor: theme.primary, borderColor: theme.primary } : undefined,
                    ]}
                  >
                    <ThemedText
                      style={[styles.chipText, lookType === type && { color: "#fff" }]}
                    >
                      {type}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Bilde</ThemedText>
              <Pressable onPress={pickImage} style={[styles.imagePickerButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                {lookImage ? (
                  <Image source={{ uri: lookImage }} style={styles.pickedImage} />
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <EvendiIcon name="image" size={32} color={theme.textSecondary} />
                    <ThemedText style={[styles.imagePickerText, { color: theme.textSecondary }]}>
                      Velg bilde
                    </ThemedText>
                  </View>
                )}
              </Pressable>
              {lookImage && (
                <View style={styles.imageActions}>
                  <Pressable onPress={pickImage} style={[styles.imageActionButton, { backgroundColor: theme.backgroundDefault }]}>
                    <EvendiIcon name="edit-2" size={16} color={theme.primary} />
                    <ThemedText style={[styles.imageActionText, { color: theme.primary }]}>Bytt bilde</ThemedText>
                  </Pressable>
                  <Pressable onPress={removeImage} style={[styles.imageActionButton, { backgroundColor: Colors.light.error + '10' }]}>
                    <EvendiIcon name="trash-2" size={16} color={Colors.light.error} />
                    <ThemedText style={[styles.imageActionText, { color: Colors.light.error }]}>Fjern</ThemedText>
                  </Pressable>
                </View>
              )}
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Notater</ThemedText>
              <TextInput
                style={[styles.formInput, styles.formTextArea, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={lookNotes}
                onChangeText={setLookNotes}
                placeholder="Beskrivelse eller notater..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>

            {editingLook && (
              <Pressable
                onPress={() => {
                  handleDeleteLook(editingLook.id);
                }}
                style={[styles.deleteButton, { backgroundColor: Colors.light.error + '20', borderColor: Colors.light.error, borderWidth: 1, borderRadius: 8, padding: 12, alignItems: 'center' }]}
              >
                <ThemedText style={{ color: Colors.light.error }}>Slett look</ThemedText>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Budget Modal */}
      <Modal visible={showBudgetModal} animationType="slide" transparent>
        <View style={styles.budgetModalOverlay}>
          <View style={[styles.budgetModalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={styles.budgetModalTitle}>Budsjett for Hår & Makeup</ThemedText>
            <TextInput
              style={[styles.budgetInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              value={budgetInput}
              onChangeText={setBudgetInput}
              placeholder="0"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
              editable={!isSavingBudget}
            />
            <View style={styles.budgetModalButtons}>
              <Pressable 
                onPress={() => setShowBudgetModal(false)} 
                style={[styles.budgetModalButton, { borderColor: theme.border, borderWidth: 1, borderRadius: 8, padding: 12, alignItems: 'center' }]}
                disabled={isSavingBudget}
              >
                <ThemedText>Avbryt</ThemedText>
              </Pressable>
              <Pressable 
                onPress={saveBudget} 
                style={[styles.budgetModalButton, styles.budgetSaveButton, { backgroundColor: theme.primary }]}
                disabled={isSavingBudget}
              >
                {isSavingBudget ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={styles.budgetSaveText}>Lagre</ThemedText>
                )}
              </Pressable>
            </View>
          </View>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    gap: Spacing.xs,
  },
  tabLabel: {
    fontSize: 14,
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
  appointmentCard: {
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
  appointmentInfo: {
    flex: 1,
    gap: 4,
  },
  appointmentShop: {
    fontSize: 16,
    fontWeight: "500",
  },
  appointmentDate: {
    fontSize: 14,
  },
  serviceTypeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginTop: 4,
  },
  serviceTypeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  looksGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  lookCardWrapper: {
    width: "48%",
  },
  lookCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  lookImage: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  lookImagePlaceholder: {
    width: "100%",
    height: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  lookInfo: {
    padding: Spacing.sm,
  },
  lookName: {
    fontSize: 14,
    fontWeight: "500",
  },
  lookType: {
    fontSize: 12,
  },
  favoriteButton: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedBadge: {
    position: "absolute",
    top: Spacing.sm,
    left: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  selectedText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
  },
  quickActionButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
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
  budgetAmount: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: Spacing.xs,
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
  imagePickerButton: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
    borderStyle: "dashed",
  },
  pickedImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  imagePickerPlaceholder: {
    height: 150,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  imagePickerText: {
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
  budgetInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 24,
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
  budgetSaveButton: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  budgetSaveText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  // Loading & Error states
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
    gap: Spacing.md,
  },
  loadingText: {
    fontSize: 14,
  },
  errorContainer: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Image actions
  imageActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  imageActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  imageActionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Favorite icon background
  favoriteIconBg: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  // Find vendors button
  findVendorsButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  findVendorsText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
    textAlign: "center",
  },
});
