import React, { useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Alert,
  Modal,
  Image,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getCoupleProfile } from '@/lib/api-couples';
import { TraditionHintBanner } from '@/components/TraditionHintBanner';
import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SwipeableRow } from "@/components/SwipeableRow";
import { VendorSuggestions } from "@/components/VendorSuggestions";
import { VendorActionBar } from "@/components/VendorActionBar";
import { useTheme } from "@/hooks/useTheme";
import { useVendorSearch } from "@/hooks/useVendorSearch";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { PlanningStackParamList } from "@/navigation/PlanningStackNavigator";
import {
  getFlowerData,
  createFlowerAppointment,
  updateFlowerAppointment,
  deleteFlowerAppointment,
  createFlowerSelection,
  updateFlowerSelection,
  deleteFlowerSelection,
  updateFlowerTimeline,
  FlowerAppointment,
  FlowerSelection,
  FlowerTimeline,
} from "@/lib/api-couple-data";

type NavigationProp = NativeStackNavigationProp<PlanningStackParamList>;

const TIMELINE_STEPS = [
  { key: "floristSelected", label: "Florist valgt", icon: "check-circle" as const },
  { key: "consultationDone", label: "Konsultasjon gjennomført", icon: "calendar" as const },
  { key: "mockupApproved", label: "Mockup godkjent", icon: "image" as const },
  { key: "deliveryConfirmed", label: "Levering bekreftet", icon: "truck" as const },
];

const APPOINTMENT_TYPES = ["Konsultasjon", "Oppfølging", "Mockup-visning", "Leveringsplanlegging", "Annet"];

type FeatherIconName = React.ComponentProps<typeof Feather>["name"];
type FlowerItemType = "bouquet" | "boutonniere" | "centerpiece" | "ceremony" | "arch" | "other";

const ITEM_TYPES: Array<{ key: FlowerItemType; label: string; icon: FeatherIconName }> = [
  { key: "bouquet", label: "Brudebukett", icon: "heart" },
  { key: "boutonniere", label: "Knapphullsblomst", icon: "user" },
  { key: "centerpiece", label: "Borddekorasjon", icon: "layers" },
  { key: "ceremony", label: "Seremoni", icon: "home" },
  { key: "arch", label: "Bue/Portal", icon: "maximize" },
  { key: "other", label: "Annet", icon: "plus" },
];

const isFlowerItemType = (value: string): value is FlowerItemType =>
  ITEM_TYPES.some((item) => item.key === value);

export default function BlomsterScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"appointments" | "selections" | "timeline">("appointments");
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

  // Query for flower data
  const { data: flowerData, isLoading: loading, refetch } = useQuery({
    queryKey: ["flower-data"],
    queryFn: getFlowerData,
  });

  const appointments = flowerData?.appointments ?? [];
  const selections = flowerData?.selections ?? [];
  const timeline = flowerData?.timeline ?? {
    floristSelected: false,
    consultationDone: false,
    mockupApproved: false,
    deliveryConfirmed: false,
    budget: 0,
  };
  const budget = timeline?.budget ?? 0;

  // Vendor search for florist autocomplete
  const floristSearch = useVendorSearch({ category: "florist" });

  // Appointment modal state
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<FlowerAppointment | null>(null);
  const [appointmentType, setAppointmentType] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const [appointmentLocation, setAppointmentLocation] = useState("");
  const [appointmentNotes, setAppointmentNotes] = useState("");

  // Selection modal state
  const [showSelectionModal, setShowSelectionModal] = useState(false);
  const [editingSelection, setEditingSelection] = useState<FlowerSelection | null>(null);
  const [selectionItemType, setSelectionItemType] = useState<FlowerItemType | "">("");
  const [selectionName, setSelectionName] = useState("");
  const [selectionDescription, setSelectionDescription] = useState("");
  const [selectionImage, setSelectionImage] = useState<string | undefined>();
  const [selectionQuantity, setSelectionQuantity] = useState("");
  const [selectionPrice, setSelectionPrice] = useState("");
  const [selectionNotes, setSelectionNotes] = useState("");

  // Budget modal state
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");

  // Mutations
  const createAppointmentMutation = useMutation({
    mutationFn: createFlowerAppointment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flower-data"] }),
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FlowerAppointment> }) => updateFlowerAppointment(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flower-data"] }),
  });

  const deleteAppointmentMutation = useMutation({
    mutationFn: deleteFlowerAppointment,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flower-data"] }),
  });

  const createSelectionMutation = useMutation({
    mutationFn: createFlowerSelection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flower-data"] }),
  });

  const updateSelectionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<FlowerSelection> }) => updateFlowerSelection(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flower-data"] }),
  });

  const deleteSelectionMutation = useMutation({
    mutationFn: deleteFlowerSelection,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flower-data"] }),
  });

  const updateTimelineMutation = useMutation({
    mutationFn: updateFlowerTimeline,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["flower-data"] }),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [refetch]);

  const isValidDateString = (value: string) => {
    const trimmed = value.trim();
    if (!/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) return false;
    const [day, month, year] = trimmed.split(".").map((part) => parseInt(part, 10));
    if (!day || !month || !year) return false;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  };

  const isValidTimeString = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return true;
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(trimmed)) return false;
    return true;
  };

  // Appointment handlers
  const openAppointmentModal = (appointment?: FlowerAppointment) => {
    if (appointment) {
      setEditingAppointment(appointment);
      floristSearch.setSearchText(appointment.floristName);
      floristSearch.setSelectedVendor(null);
      setAppointmentType(appointment.appointmentType);
      setAppointmentDate(appointment.date);
      setAppointmentTime(appointment.time || "");
      setAppointmentLocation(appointment.location || "");
      setAppointmentNotes(appointment.notes || "");
    } else {
      setEditingAppointment(null);
      floristSearch.clearSelection();
      setAppointmentType("");
      setAppointmentDate("");
      setAppointmentTime("");
      setAppointmentLocation("");
      setAppointmentNotes("");
    }
    setShowAppointmentModal(true);
  };

  const resetAppointmentForm = () => {
    Alert.alert("Nullstill skjema", "Vil du slette alle feltene i avtalen?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Nullstill",
        style: "destructive",
        onPress: () => {
          setEditingAppointment(null);
          floristSearch.clearSelection();
          setAppointmentType("");
          setAppointmentDate("");
          setAppointmentTime("");
          setAppointmentLocation("");
          setAppointmentNotes("");
        },
      },
      {
        text: "Nullstill og lukk",
        style: "destructive",
        onPress: () => {
          setEditingAppointment(null);
          floristSearch.clearSelection();
          setAppointmentType("");
          setAppointmentDate("");
          setAppointmentTime("");
          setAppointmentLocation("");
          setAppointmentNotes("");
          setShowAppointmentModal(false);
        },
      }
    ]);
  };

  const saveAppointment = async () => {
    if (!floristSearch.searchText.trim() || !appointmentDate.trim()) {
      Alert.alert("Feil", "Vennligst fyll inn florist og dato");
      return;
    }

    if (!isValidDateString(appointmentDate)) {
      Alert.alert("Feil", "Dato må være på formatet DD.MM.ÅÅÅÅ");
      return;
    }

    if (!isValidTimeString(appointmentTime)) {
      Alert.alert("Feil", "Klokkeslett må være på formatet HH:MM");
      return;
    }

    const floristName = floristSearch.searchText.trim();
    const date = appointmentDate.trim();
    const time = appointmentTime.trim();
    const location = appointmentLocation.trim();
    const notes = appointmentNotes.trim();

    try {
      if (editingAppointment) {
        await updateAppointmentMutation.mutateAsync({
          id: editingAppointment.id,
          data: {
            floristName,
            appointmentType: appointmentType,
            date,
            time: time || undefined,
            location: location || undefined,
            notes: notes || undefined,
          },
        });
      } else {
        await createAppointmentMutation.mutateAsync({
          floristName,
          appointmentType: appointmentType,
          date,
          time: time || undefined,
          location: location || undefined,
          notes: notes || undefined,
          completed: false,
        });
      }
      setShowAppointmentModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Feil", "Kunne ikke lagre avtale");
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

  const duplicateAppointment = async (appointment: FlowerAppointment) => {
    try {
      await createAppointmentMutation.mutateAsync({
        floristName: `Kopi av ${appointment.floristName}`,
        appointmentType: appointment.appointmentType,
        date: appointment.date,
        time: appointment.time,
        location: appointment.location,
        notes: appointment.notes,
        completed: false,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Feil", "Kunne ikke duplisere avtale");
    }
  };

  // Selection handlers
  const openSelectionModal = (selection?: FlowerSelection) => {
    if (selection) {
      setEditingSelection(selection);
      setSelectionItemType(isFlowerItemType(selection.itemType) ? selection.itemType : "");
      setSelectionName(selection.name);
      setSelectionDescription(selection.description || "");
      setSelectionImage(selection.imageUrl);
      setSelectionQuantity(selection.quantity?.toString() || "");
      setSelectionPrice(selection.estimatedPrice?.toString() || "");
      setSelectionNotes(selection.notes || "");
    } else {
      setEditingSelection(null);
      setSelectionItemType("");
      setSelectionName("");
      setSelectionDescription("");
      setSelectionImage(undefined);
      setSelectionQuantity("");
      setSelectionPrice("");
      setSelectionNotes("");
    }
    setShowSelectionModal(true);
  };

  const resetSelectionForm = () => {
    Alert.alert("Nullstill skjema", "Vil du slette alle feltene i valget?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Nullstill",
        style: "destructive",
        onPress: () => {
          setEditingSelection(null);
          setSelectionItemType("");
          setSelectionName("");
          setSelectionDescription("");
          setSelectionImage(undefined);
          setSelectionQuantity("");
          setSelectionPrice("");
          setSelectionNotes("");
        },
      },
      {
        text: "Nullstill og lukk",
        style: "destructive",
        onPress: () => {
          setEditingSelection(null);
          setSelectionItemType("");
          setSelectionName("");
          setSelectionDescription("");
          setSelectionImage(undefined);
          setSelectionQuantity("");
          setSelectionPrice("");
          setSelectionNotes("");
          setShowSelectionModal(false);
        },
      }
    ]);
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Tilgang nektet", "Gi tilgang til bildebiblioteket for å velge et bilde.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectionImage(result.assets[0].uri);
    }
  };

  const saveSelection = async () => {
    if (!selectionName.trim() || !selectionItemType.trim() || !isFlowerItemType(selectionItemType)) {
      Alert.alert("Feil", "Vennligst fyll inn navn og type");
      return;
    }

    const itemType = selectionItemType;

    try {
      const data = {
        itemType,
        name: selectionName,
        description: selectionDescription,
        imageUrl: selectionImage,
        quantity: selectionQuantity ? parseInt(selectionQuantity, 10) : undefined,
        estimatedPrice: selectionPrice ? parseInt(selectionPrice, 10) : undefined,
        notes: selectionNotes,
        isConfirmed: false,
      };

      if (editingSelection) {
        await updateSelectionMutation.mutateAsync({
          id: editingSelection.id,
          data,
        });
      } else {
        await createSelectionMutation.mutateAsync(data);
      }
      setShowSelectionModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Feil", "Kunne ikke lagre valg");
    }
  };

  const toggleSelectionConfirmed = async (id: string) => {
    const selection = selections.find((s) => s.id === id);
    if (selection) {
      await updateSelectionMutation.mutateAsync({ id, data: { isConfirmed: !selection.isConfirmed } });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleDeleteSelection = async (id: string) => {
    await deleteSelectionMutation.mutateAsync(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const duplicateSelection = async (selection: FlowerSelection) => {
    try {
      await createSelectionMutation.mutateAsync({
        itemType: selection.itemType,
        name: `Kopi av ${selection.name}`,
        description: selection.description,
        imageUrl: selection.imageUrl,
        quantity: selection.quantity,
        estimatedPrice: selection.estimatedPrice,
        notes: selection.notes,
        isConfirmed: false,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Feil", "Kunne ikke duplisere utvalg");
    }
  };

  // Timeline handlers
  const toggleTimelineStep = async (key: string) => {
    const newValue = !timeline[key as keyof FlowerTimeline];
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
    await updateTimelineMutation.mutateAsync({ budget: newBudget });
    setShowBudgetModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(amount);
  };

  const getItemTypeLabel = (type: string) => {
    const item = ITEM_TYPES.find((i) => i.key === type);
    return item?.label || type;
  };

  const getItemTypeIcon = (type: string): FeatherIconName => {
    const item = ITEM_TYPES.find((i) => i.key === type);
    return item?.icon || "help-circle";
  };

  const completedSteps = TIMELINE_STEPS.filter((step) => timeline[step.key as keyof FlowerTimeline]).length;
  const progressPercentage = (completedSteps / TIMELINE_STEPS.length) * 100;
  const totalEstimated = selections.reduce((sum, s) => sum + ((s.estimatedPrice || 0) * (s.quantity || 1)), 0);

  const renderAppointmentsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Avtaler</ThemedText>
        <Pressable onPress={() => openAppointmentModal()} style={[styles.addButton, { backgroundColor: theme.primary }]}>
          <Feather name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {appointments.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="heart" size={48} color={theme.primary} style={{ opacity: 0.6 }} />
          <ThemedText style={[styles.emptyText, { color: theme.text, fontWeight: '600', fontSize: 18 }]}>
            Hvilke blomster føles riktige for dere?
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary, fontSize: 15 }]}>
            La oss finne farger og uttrykk sammen.
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
                  Alert.alert(
                    appointment.floristName,
                    "Velg en handling",
                    [
                      { text: "Avbryt", style: "cancel" },
                      { text: "Rediger", onPress: () => openAppointmentModal(appointment) },
                      { text: "Dupliser", onPress: () => duplicateAppointment(appointment) },
                      { text: "Slett", style: "destructive", onPress: () => handleDeleteAppointment(appointment.id) },
                    ]
                  );
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
                  {appointment.completed && <Feather name="check" size={14} color="#fff" />}
                </Pressable>
                <View style={styles.appointmentInfo}>
                  <ThemedText
                    style={[styles.appointmentShop, appointment.completed && styles.completedText]}
                  >
                    {appointment.floristName}
                  </ThemedText>
                  <ThemedText style={[styles.appointmentDate, { color: theme.textSecondary }]}>
                    {appointment.date} {appointment.time && `kl. ${appointment.time}`}
                  </ThemedText>
                  {appointment.appointmentType && (
                    <View style={[styles.typeBadge, { backgroundColor: theme.primary + '20' }]}>
                      <ThemedText style={[styles.typeText, { color: theme.primary }]}>
                        {appointment.appointmentType}
                      </ThemedText>
                    </View>
                  )}
                </View>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    duplicateAppointment(appointment);
                  }}
                  style={styles.quickActionButton}
                >
                  <Feather name="copy" size={16} color={theme.textSecondary} />
                </Pressable>
                <Feather name="chevron-right" size={20} color={theme.textSecondary} />
              </Pressable>
            </SwipeableRow>
          </Animated.View>
        ))
      )}
    </View>
  );

  const renderSelectionsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Blomstervalg</ThemedText>
        <Pressable onPress={() => openSelectionModal()} style={[styles.addButton, { backgroundColor: theme.primary }]}>
          <Feather name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {/* Cost summary */}
      {selections.length > 0 && (
        <View style={[styles.costSummary, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={styles.costLabel}>Estimert total</ThemedText>
          <ThemedText style={[styles.costAmount, { color: theme.primary }]}>
            {formatCurrency(totalEstimated)}
          </ThemedText>
        </View>
      )}

      {selections.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="heart" size={48} color={theme.primary} style={{ opacity: 0.6 }} />
          <ThemedText style={[styles.emptyText, { color: theme.text, fontWeight: '600', fontSize: 18 }]}>
            Hvilke blomster føles riktige for dere?
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary, fontSize: 15 }]}>
            Lagre buketter og uttrykk dere elsker.
          </ThemedText>
        </View>
      ) : (
        <View style={styles.selectionsGrid}>
          {selections.map((selection, index) => (
            <Animated.View key={selection.id} entering={FadeInRight.delay(index * 50)} style={styles.selectionCardWrapper}>
              <Pressable
                onPress={() => openSelectionModal(selection)}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert("Alternativer", `Valg: ${selection.name}`, [
                    { text: "Avbryt", style: "cancel" },
                    { text: "Rediger", onPress: () => openSelectionModal(selection) },
                    { text: "Dupliser", onPress: () => duplicateSelection(selection) },
                    { text: "Slett", onPress: () => handleDeleteSelection(selection.id), style: "destructive" },
                  ]);
                }}
                style={[
                  styles.selectionCard,
                  { backgroundColor: theme.backgroundDefault },
                  selection.isConfirmed ? { borderColor: Colors.light.success, borderWidth: 2 } : undefined,
                ]}
              >
                {selection.imageUrl ? (
                  <Image source={{ uri: selection.imageUrl }} style={styles.selectionImage} />
                ) : (
                  <View style={[styles.selectionImagePlaceholder, { backgroundColor: theme.border }]}>
                    <Feather name={getItemTypeIcon(selection.itemType)} size={32} color={theme.textSecondary} />
                  </View>
                )}
                <View style={styles.selectionInfo}>
                  <ThemedText style={styles.selectionName} numberOfLines={1}>
                    {selection.name}
                  </ThemedText>
                  <ThemedText style={[styles.selectionType, { color: theme.textSecondary }]}>
                    {getItemTypeLabel(selection.itemType)}
                  </ThemedText>
                  {selection.quantity && (
                    <ThemedText style={[styles.selectionQuantity, { color: theme.textSecondary }]}>
                      Antall: {selection.quantity}
                    </ThemedText>
                  )}
                  {selection.estimatedPrice && (
                    <ThemedText style={[styles.selectionPrice, { color: theme.primary }]}>
                      {formatCurrency(selection.estimatedPrice * (selection.quantity || 1))}
                    </ThemedText>
                  )}
                </View>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    duplicateSelection(selection);
                  }}
                  style={styles.quickActionButton}
                >
                  <Feather name="copy" size={16} color={theme.textSecondary} />
                </Pressable>
                <Pressable
                  onPress={() => toggleSelectionConfirmed(selection.id)}
                  style={[
                    styles.confirmBadge,
                    { backgroundColor: selection.isConfirmed ? Colors.light.success : theme.border },
                  ]}
                >
                  <Feather name="check" size={12} color={selection.isConfirmed ? "#fff" : theme.textSecondary} />
                </Pressable>
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
          <ThemedText style={styles.budgetLabel}>Budsjett for Blomster</ThemedText>
          <Feather name="edit-2" size={16} color={theme.textSecondary} />
        </View>
        <ThemedText style={[styles.budgetAmount, { color: theme.primary }]}>
          {formatCurrency(budget)}
        </ThemedText>
        {budget > 0 && totalEstimated > 0 && (
          <ThemedText style={[styles.budgetUsed, { color: totalEstimated > budget ? Colors.light.error : theme.textSecondary }]}>
            Estimert brukt: {formatCurrency(totalEstimated)} ({Math.round((totalEstimated / budget) * 100)}%)
          </ThemedText>
        )}
      </Pressable>

      {/* Find Vendors Button */}
      <Pressable
        onPress={() => {
          navigation.navigate("VendorMatching", { 
            category: "florist",
            selectedTraditions: coupleProfile?.selectedTraditions || [],
          });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
        style={[styles.findVendorsButton, { backgroundColor: theme.primary }]}
      >
        <Feather name="search" size={18} color="#FFFFFF" />
        <ThemedText style={styles.findVendorsText}>Finn florister</ThemedText>
        <Feather name="arrow-right" size={18} color="#FFFFFF" />
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
          const isCompleted = timeline[step.key as keyof FlowerTimeline];
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
        {([
          { key: "appointments", label: "Avtaler", icon: "calendar" },
          { key: "selections", label: "Valg", icon: "sun" },
          { key: "timeline", label: "Tidslinje", icon: "list" },
        ] as const).map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tab, activeTab === tab.key && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
          >
            <Feather name={tab.icon} size={18} color={activeTab === tab.key ? theme.primary : theme.textSecondary} />
            <ThemedText style={[styles.tabLabel, { color: activeTab === tab.key ? theme.primary : theme.textSecondary }]}>
              {tab.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: tabBarHeight + Spacing.xl, paddingTop: insets.top + Spacing.sm },
        ]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
      >
        {/* Tradition hints for flowers */}
        {(coupleProfile?.selectedTraditions?.length ?? 0) > 0 && activeTab === "appointments" && (
          <TraditionHintBanner
            traditions={coupleProfile?.selectedTraditions || []}
            category="flowers"
          />
        )}
        {activeTab === "appointments" && renderAppointmentsTab()}
        {activeTab === "selections" && renderSelectionsTab()}
        {activeTab === "timeline" && renderTimelineTab()}
      </ScrollView>

      {/* Appointment Modal */}
      <Modal visible={showAppointmentModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setShowAppointmentModal(false)}>
              <ThemedText style={[styles.modalCancel, { color: theme.textSecondary }]}>Avbryt</ThemedText>
            </Pressable>
            <ThemedText style={styles.modalTitle}>
              {editingAppointment ? "Rediger avtale" : "Ny avtale"}
            </ThemedText>
            <Pressable onPress={saveAppointment}>
              <ThemedText style={[styles.modalSave, { color: theme.primary }]}>Lagre</ThemedText>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Florist *</ThemedText>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={floristSearch.searchText}
                onChangeText={floristSearch.onChangeText}
                placeholder="Søk etter registrert florist..."
                placeholderTextColor={theme.textSecondary}
              />
              {floristSearch.selectedVendor && (
                <VendorActionBar
                  vendor={floristSearch.selectedVendor}
                  vendorCategory="florist"
                  onClear={floristSearch.clearSelection}
                  icon="sun"
                />
              )}
              <VendorSuggestions
                suggestions={floristSearch.suggestions}
                isLoading={floristSearch.isLoading}
                onSelect={floristSearch.onSelectVendor}
                onViewProfile={(v) => navigation.navigate("VendorDetail", {
                  vendorId: v.id,
                  vendorName: v.businessName,
                  vendorDescription: v.description || "",
                  vendorLocation: v.location || "",
                  vendorPriceRange: v.priceRange || "",
                  vendorCategory: "florist",
                })}
                icon="sun"
              />
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
                placeholder="Adresse eller butikk"
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

            <Pressable
              onPress={resetAppointmentForm}
              style={[styles.resetButton, { borderColor: theme.border }]}
            >
              <ThemedText style={[styles.resetButtonText, { color: theme.textSecondary }]}>Nullstill skjema</ThemedText>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>

      {/* Selection Modal */}
      <Modal visible={showSelectionModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setShowSelectionModal(false)}>
              <ThemedText style={[styles.modalCancel, { color: theme.textSecondary }]}>Avbryt</ThemedText>
            </Pressable>
            <ThemedText style={styles.modalTitle}>
              {editingSelection ? "Rediger valg" : "Nytt valg"}
            </ThemedText>
            <Pressable onPress={saveSelection}>
              <ThemedText style={[styles.modalSave, { color: theme.primary }]}>Lagre</ThemedText>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Type *</ThemedText>
              <View style={styles.itemTypeGrid}>
                {ITEM_TYPES.map((item) => (
                  <Pressable
                    key={item.key}
                    onPress={() => setSelectionItemType(item.key)}
                    style={[
                      styles.itemTypeCard,
                      { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                      selectionItemType === item.key ? { backgroundColor: theme.primary + '20', borderColor: theme.primary } : undefined,
                    ]}
                  >
                    <Feather
                      name={item.icon}
                      size={20}
                      color={selectionItemType === item.key ? theme.primary : theme.textSecondary}
                    />
                    <ThemedText
                      style={[
                        styles.itemTypeLabel,
                        { color: selectionItemType === item.key ? theme.primary : theme.text },
                      ]}
                    >
                      {item.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Navn *</ThemedText>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={selectionName}
                onChangeText={setSelectionName}
                placeholder="F.eks. Hvit rosebukett"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Beskrivelse</ThemedText>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={selectionDescription}
                onChangeText={setSelectionDescription}
                placeholder="Detaljer om blomstene"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Bilde</ThemedText>
              <Pressable onPress={pickImage} style={[styles.imagePickerButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                {selectionImage ? (
                  <Image source={{ uri: selectionImage }} style={styles.pickedImage} />
                ) : (
                  <View style={styles.imagePickerPlaceholder}>
                    <Feather name="image" size={32} color={theme.textSecondary} />
                    <ThemedText style={[styles.imagePickerText, { color: theme.textSecondary }]}>
                      Velg bilde
                    </ThemedText>
                  </View>
                )}
              </Pressable>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <ThemedText style={styles.formLabel}>Antall</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                  value={selectionQuantity}
                  onChangeText={setSelectionQuantity}
                  placeholder="1"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <ThemedText style={styles.formLabel}>Pris (kr)</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                  value={selectionPrice}
                  onChangeText={setSelectionPrice}
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Notater</ThemedText>
              <TextInput
                style={[styles.formInput, styles.formTextArea, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={selectionNotes}
                onChangeText={setSelectionNotes}
                placeholder="Tilleggsinfo..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>

            <Pressable
              onPress={resetSelectionForm}
              style={[styles.resetButton, { borderColor: theme.border }]}
            >
              <ThemedText style={[styles.resetButtonText, { color: theme.textSecondary }]}>Nullstill skjema</ThemedText>
            </Pressable>

            {editingSelection && (
              <Pressable
                onPress={() => {
                  handleDeleteSelection(editingSelection.id);
                  setShowSelectionModal(false);
                }}
                style={[styles.deleteButton, { backgroundColor: Colors.light.error + '20', borderColor: Colors.light.error, borderWidth: 1, borderRadius: 8, padding: 12, alignItems: 'center' }]}
              >
                <ThemedText style={{ color: Colors.light.error }}>Slett valg</ThemedText>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Budget Modal */}
      <Modal visible={showBudgetModal} animationType="slide" transparent>
        <View style={styles.budgetModalOverlay}>
          <View style={[styles.budgetModalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={styles.budgetModalTitle}>Budsjett for Blomster</ThemedText>
            <TextInput
              style={[styles.budgetInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.text }]}
              value={budgetInput}
              onChangeText={setBudgetInput}
              placeholder="0"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />
            <View style={styles.budgetModalButtons}>
              <Pressable onPress={() => setShowBudgetModal(false)} style={[styles.budgetModalButton, { borderColor: theme.border, borderWidth: 1, borderRadius: 8, padding: 12, alignItems: 'center' }]}>
                <ThemedText>Avbryt</ThemedText>
              </Pressable>
              <Button onPress={saveBudget} style={styles.budgetModalButton}>Lagre</Button>
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
  typeBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    marginTop: 4,
  },
  typeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  costSummary: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  costLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  costAmount: {
    fontSize: 18,
    fontWeight: "700",
  },
  selectionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  selectionCardWrapper: {
    width: "48%",
  },
  selectionCard: {
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  selectionImage: {
    width: "100%",
    height: 120,
    resizeMode: "cover",
  },
  selectionImagePlaceholder: {
    width: "100%",
    height: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  selectionInfo: {
    padding: Spacing.sm,
  },
  selectionName: {
    fontSize: 14,
    fontWeight: "500",
  },
  selectionType: {
    fontSize: 12,
  },
  selectionQuantity: {
    fontSize: 12,
  },
  selectionPrice: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  quickActionButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmBadge: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
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
  budgetUsed: {
    fontSize: 12,
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
  formRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  resetButton: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  resetButtonText: {
    fontSize: 14,
    fontWeight: "500",
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
  itemTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  itemTypeCard: {
    width: "31%",
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    gap: 4,
  },
  itemTypeLabel: {
    fontSize: 11,
    textAlign: "center",
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
