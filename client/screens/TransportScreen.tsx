import React, { useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Modal,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EvendiIcon } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SwipeableRow } from "@/components/SwipeableRow";
import { VendorSuggestions } from "@/components/VendorSuggestions";
import { VendorActionBar } from "@/components/VendorActionBar";
import { useTheme } from "@/hooks/useTheme";
import { useVendorSearch } from "@/hooks/useVendorSearch";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { PlanningStackParamList } from "@/navigation/PlanningStackNavigator";
import { showToast } from "@/lib/toast";
import { showConfirm, showOptions } from "@/lib/dialogs";
import {
  getTransportData,
  createTransportBooking,
  updateTransportBooking,
  deleteTransportBooking,
  updateTransportTimeline,
  TransportBooking,
  TransportTimeline,
} from "@/lib/api-couple-data";

type NavigationProp = NativeStackNavigationProp<PlanningStackParamList>;

const VEHICLE_TYPES = [
  { key: "bride", label: "Brudens bil", icon: "heart" as const },
  { key: "groom", label: "Brudgommens bil", icon: "user" as const },
  { key: "shuttle", label: "Gjesteshuttle", icon: "users" as const },
  { key: "getaway", label: "Getaway-bil", icon: "star" as const },
  { key: "other", label: "Annet", icon: "truck" as const },
];

const TIMELINE_STEPS = [
  { key: "brideCarBooked", label: "Brudens bil booket", icon: "heart" as const },
  { key: "groomCarBooked", label: "Brudgommens bil booket", icon: "user" as const },
  { key: "guestShuttleBooked", label: "Gjesteshuttle booket", icon: "users" as const },
  { key: "getawayCarBooked", label: "Getaway-bil booket", icon: "star" as const },
  { key: "allConfirmed", label: "Alt bekreftet", icon: "check-circle" as const },
];

export default function TransportScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"bookings" | "timeline">("bookings");
  const [refreshing, setRefreshing] = useState(false);

  // Query for transport data
  const { data: transportData, isLoading: loading, isError, error, refetch } = useQuery({
    queryKey: ["transport-data"],
    queryFn: getTransportData,
  });

  // Saving states
  const [isSavingBooking, setIsSavingBooking] = useState(false);
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  const bookings = transportData?.bookings ?? [];
  const timeline = transportData?.timeline ?? {
    brideCarBooked: false,
    groomCarBooked: false,
    guestShuttleBooked: false,
    getawayCarBooked: false,
    allConfirmed: false,
    budget: 0,
  };
  const budget = timeline?.budget ?? 0;

  // Vendor search for transport provider autocomplete
  const providerSearch = useVendorSearch({ category: "transport" });

  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<TransportBooking | null>(null);
  const [bookingVehicleType, setBookingVehicleType] = useState("");
  const [bookingVehicleDesc, setBookingVehicleDesc] = useState("");
  const [bookingPickupTime, setBookingPickupTime] = useState("");
  const [bookingPickupLocation, setBookingPickupLocation] = useState("");
  const [bookingDropoffTime, setBookingDropoffTime] = useState("");
  const [bookingDropoffLocation, setBookingDropoffLocation] = useState("");
  const [bookingDriverName, setBookingDriverName] = useState("");
  const [bookingDriverPhone, setBookingDriverPhone] = useState("");
  const [bookingPrice, setBookingPrice] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");

  // Budget modal state
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState("");

  // Mutations
  const createBookingMutation = useMutation({
    mutationFn: createTransportBooking,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transport-data"] }),
  });

  const updateBookingMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<TransportBooking> }) => updateTransportBooking(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transport-data"] }),
  });

  const deleteBookingMutation = useMutation({
    mutationFn: deleteTransportBooking,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transport-data"] }),
  });

  const updateTimelineMutation = useMutation({
    mutationFn: updateTransportTimeline,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["transport-data"] }),
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [refetch]);

  // Booking handlers
  const openBookingModal = (booking?: TransportBooking) => {
    if (booking) {
      setEditingBooking(booking);
      setBookingVehicleType(booking.vehicleType);
      providerSearch.setSearchText(booking.providerName || "");
      providerSearch.setSelectedVendor(null);
      setBookingVehicleDesc(booking.vehicleDescription || "");
      setBookingPickupTime(booking.pickupTime || "");
      setBookingPickupLocation(booking.pickupLocation || "");
      setBookingDropoffTime(booking.dropoffTime || "");
      setBookingDropoffLocation(booking.dropoffLocation || "");
      setBookingDriverName(booking.driverName || "");
      setBookingDriverPhone(booking.driverPhone || "");
      setBookingPrice(booking.price?.toString() || "");
      setBookingNotes(booking.notes || "");
    } else {
      setEditingBooking(null);
      setBookingVehicleType("");
      providerSearch.clearSelection();
      setBookingVehicleDesc("");
      setBookingPickupTime("");
      setBookingPickupLocation("");
      setBookingDropoffTime("");
      setBookingDropoffLocation("");
      setBookingDriverName("");
      setBookingDriverPhone("");
      setBookingPrice("");
      setBookingNotes("");
    }
    setShowBookingModal(true);
  };

  // Time validation helper
  const isValidTime = (time: string): boolean => {
    if (!time) return true; // Empty is ok (optional)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  // Parse price safely (strip non-numeric)
  const parsePrice = (priceStr: string): number | undefined => {
    if (!priceStr) return undefined;
    const cleaned = priceStr.replace(/[^\d]/g, '');
    const num = parseInt(cleaned, 10);
    return isNaN(num) ? undefined : num;
  };

  const saveBooking = async () => {
    if (!bookingVehicleType.trim()) {
      showToast("Vennligst velg type kjøretøy");
      return;
    }

    if (bookingPickupTime && !isValidTime(bookingPickupTime)) {
      showToast("Ugyldig tid. Bruk format HH:MM (f.eks. 14:30)");
      return;
    }

    if (bookingDropoffTime && !isValidTime(bookingDropoffTime)) {
      showToast("Ugyldig tid. Bruk format HH:MM (f.eks. 16:00)");
      return;
    }

    setIsSavingBooking(true);
    try {
      const data = {
        vehicleType: bookingVehicleType,
        providerName: providerSearch.searchText.trim(),
        vehicleDescription: bookingVehicleDesc,
        pickupTime: bookingPickupTime,
        pickupLocation: bookingPickupLocation,
        dropoffTime: bookingDropoffTime,
        dropoffLocation: bookingDropoffLocation,
        driverName: bookingDriverName,
        driverPhone: bookingDriverPhone,
        price: parsePrice(bookingPrice),
        notes: bookingNotes,
        confirmed: editingBooking?.confirmed ?? false,
      };

      if (editingBooking) {
        await updateBookingMutation.mutateAsync({
          id: editingBooking.id,
          data,
        });
      } else {
        await createBookingMutation.mutateAsync(data);
      }
      setShowBookingModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      showToast("Kunne ikke lagre booking");
    } finally {
      setIsSavingBooking(false);
    }
  };

  const toggleBookingConfirmed = async (id: string) => {
    const booking = bookings.find((b) => b.id === id);
    if (booking) {
      const newConfirmed = !booking.confirmed;
      await updateBookingMutation.mutateAsync({ id, data: { confirmed: newConfirmed } });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Auto-sync allConfirmed: check if all bookings are now confirmed
      const updatedBookings = bookings.map(b => b.id === id ? { ...b, confirmed: newConfirmed } : b);
      const allAreConfirmed = updatedBookings.length > 0 && updatedBookings.every(b => b.confirmed);
      if (allAreConfirmed !== timeline.allConfirmed) {
        await updateTimelineMutation.mutateAsync({ allConfirmed: allAreConfirmed });
      }
    }
  };

  const handleDeleteBooking = async (id: string) => {
    const booking = bookings.find(b => b.id === id);
    const confirmed = await showConfirm({
      title: "Slett booking",
      message: `Er du sikker på at du vil slette ${booking ? getVehicleLabel(booking.vehicleType) : 'denne bookingen'}?`,
      confirmLabel: "Slett",
      cancelLabel: "Avbryt",
      destructive: true,
    });
    if (!confirmed) return;

    await deleteBookingMutation.mutateAsync(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (showBookingModal && editingBooking?.id === id) {
      setShowBookingModal(false);
    }
  };

  const duplicateBooking = async (booking: TransportBooking) => {
    try {
      await createBookingMutation.mutateAsync({
        vehicleType: booking.vehicleType,
        providerName: booking.providerName ? `Kopi av ${booking.providerName}` : undefined,
        vehicleDescription: booking.vehicleDescription,
        pickupTime: booking.pickupTime,
        pickupLocation: booking.pickupLocation,
        dropoffTime: booking.dropoffTime,
        dropoffLocation: booking.dropoffLocation,
        driverName: booking.driverName,
        driverPhone: booking.driverPhone,
        price: booking.price,
        notes: booking.notes,
        confirmed: false,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      showToast("Kunne ikke duplisere booking");
    }
  };

  // Timeline handlers
  const toggleTimelineStep = async (key: string) => {
    const newValue = !timeline[key as keyof TransportTimeline];
    await updateTimelineMutation.mutateAsync({ [key]: newValue });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Budget handlers
  const openBudgetModal = () => {
    setBudgetInput(budget?.toString() || "");
    setShowBudgetModal(true);
  };

  const saveBudget = async () => {
    const newBudget = parseInt(budgetInput.replace(/[^\d]/g, ''), 10) || 0;
    setIsSavingBudget(true);
    try {
      await updateTimelineMutation.mutateAsync({ budget: newBudget });
      setShowBudgetModal(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } finally {
      setIsSavingBudget(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("nb-NO", { style: "currency", currency: "NOK", maximumFractionDigits: 0 }).format(amount);
  };

  const getVehicleIcon = (type: string) => {
    const vehicle = VEHICLE_TYPES.find((v) => v.key === type);
    return vehicle?.icon || "truck";
  };

  const getVehicleLabel = (type: string) => {
    const vehicle = VEHICLE_TYPES.find((v) => v.key === type);
    return vehicle?.label || type;
  };

  const completedSteps = TIMELINE_STEPS.filter((step) => timeline[step.key as keyof TransportTimeline]).length;
  const progressPercentage = (completedSteps / TIMELINE_STEPS.length) * 100;

  // Calculate budget vs bookings sum
  const bookingsSum = bookings.reduce((sum, b) => sum + (b.price || 0), 0);
  const budgetDifference = budget - bookingsSum;

  // Sort bookings: by vehicle type priority, then by pickup time
  const vehicleTypePriority: Record<string, number> = {
    bride: 1,
    groom: 2,
    getaway: 3,
    shuttle: 4,
    other: 5,
  };
  const sortedBookings = [...bookings].sort((a, b) => {
    // Unconfirmed first
    if (a.confirmed !== b.confirmed) return a.confirmed ? 1 : -1;
    // Then by vehicle type
    const aPriority = vehicleTypePriority[a.vehicleType] ?? 99;
    const bPriority = vehicleTypePriority[b.vehicleType] ?? 99;
    if (aPriority !== bPriority) return aPriority - bPriority;
    // Then by pickup time
    return (a.pickupTime || '').localeCompare(b.pickupTime || '');
  });

  const renderBookingsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Bookinger</ThemedText>
        <Pressable onPress={() => openBookingModal()} style={[styles.addButton, { backgroundColor: theme.primary }]}>
          <EvendiIcon name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {bookings.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
          <EvendiIcon name="heart" size={48} color={theme.primary} style={{ opacity: 0.6 }} />
          <ThemedText style={[styles.emptyText, { color: theme.text, fontWeight: '600', fontSize: 18 }]}>
            Hvordan starter dagen for dere?
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary, fontSize: 15 }]}>
            La oss planlegge ankomsten.
          </ThemedText>
          <Pressable
            style={[styles.emptyStateCta, { backgroundColor: theme.primary }]}
            onPress={() => {
              openBookingModal();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <EvendiIcon name="plus" size={16} color="#fff" />
            <ThemedText style={styles.emptyStateCtaText}>Legg til booking</ThemedText>
          </Pressable>
        </View>
      ) : (
        sortedBookings.map((booking, index) => (
          <Animated.View key={booking.id} entering={FadeInDown.delay(index * 50)}>
            <SwipeableRow onDelete={() => handleDeleteBooking(booking.id)}>
              <Pressable
                onPress={() => openBookingModal(booking)}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  showOptions({
                    title: getVehicleLabel(booking.vehicleType),
                    message: "Velg en handling",
                    cancelLabel: "Avbryt",
                    options: [
                      { label: "Rediger", onPress: () => openBookingModal(booking) },
                      { label: "Dupliser", onPress: () => duplicateBooking(booking) },
                      { label: "Slett", destructive: true, onPress: () => handleDeleteBooking(booking.id) },
                    ],
                  });
                }}
                style={[styles.bookingCard, { backgroundColor: theme.backgroundDefault }]}
              >
                <View style={[styles.bookingIcon, { backgroundColor: booking.confirmed ? theme.primary + '20' : theme.border }]}>
                  <EvendiIcon 
                    name={getVehicleIcon(booking.vehicleType) as any} 
                    size={20} 
                    color={booking.confirmed ? theme.primary : theme.textSecondary} 
                  />
                </View>
                <View style={styles.bookingInfo}>
                  <ThemedText style={styles.bookingType}>
                    {getVehicleLabel(booking.vehicleType)}
                  </ThemedText>
                  {booking.providerName && (
                    <ThemedText style={[styles.bookingProvider, { color: theme.textSecondary }]}>
                      {booking.providerName}
                    </ThemedText>
                  )}
                  {booking.pickupTime && (
                    <ThemedText style={[styles.bookingTime, { color: theme.textSecondary }]}>
                      Henting: {booking.pickupTime}
                    </ThemedText>
                  )}
                  {booking.price && (
                    <ThemedText style={[styles.bookingPrice, { color: theme.primary }]}>
                      {formatCurrency(booking.price)}
                    </ThemedText>
                  )}
                </View>
                <Pressable
                  onPress={() => {
                    duplicateBooking(booking);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[styles.quickActionButton, { backgroundColor: theme.backgroundSecondary }]}
                >
                  <EvendiIcon name="copy" size={16} color={Colors.dark.accent} />
                </Pressable>
                <View style={styles.bookingActions}>
                  <Pressable
                    onPress={() => toggleBookingConfirmed(booking.id)}
                    style={[
                      styles.confirmButton,
                      { borderColor: theme.border },
                      booking.confirmed ? { backgroundColor: Colors.light.success, borderColor: Colors.light.success } : undefined,
                    ]}
                  >
                    <EvendiIcon name="check" size={16} color={booking.confirmed ? "#fff" : theme.textSecondary} />
                  </Pressable>
                </View>
              </Pressable>
            </SwipeableRow>
          </Animated.View>
        ))
      )}
    </View>
  );

  const renderTimelineTab = () => (
    <View style={styles.tabContent}>
      {/* Budget Card with comparison */}
      <Pressable onPress={openBudgetModal} style={[styles.budgetCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.budgetHeader}>
          <ThemedText style={styles.budgetLabel}>Budsjett for Transport</ThemedText>
          <EvendiIcon name="edit-2" size={16} color={theme.textSecondary} />
        </View>
        <ThemedText style={[styles.budgetAmount, { color: theme.primary }]}>
          {formatCurrency(budget)}
        </ThemedText>
        {bookings.length > 0 && (
          <View style={styles.budgetComparison}>
            <View style={styles.budgetComparisonRow}>
              <ThemedText style={[styles.budgetComparisonLabel, { color: theme.textSecondary }]}>
                Sum bookinger:
              </ThemedText>
              <ThemedText style={[styles.budgetComparisonValue, { color: theme.text }]}>
                {formatCurrency(bookingsSum)}
              </ThemedText>
            </View>
            <View style={styles.budgetComparisonRow}>
              <ThemedText style={[styles.budgetComparisonLabel, { color: theme.textSecondary }]}>
                {budgetDifference >= 0 ? 'Tilgjengelig:' : 'Over budsjett:'}
              </ThemedText>
              <ThemedText style={[styles.budgetComparisonValue, { color: budgetDifference >= 0 ? Colors.light.success : Colors.light.error }]}>
                {budgetDifference >= 0 ? formatCurrency(budgetDifference) : formatCurrency(Math.abs(budgetDifference))}
              </ThemedText>
            </View>
          </View>
        )}
      </Pressable>

      {/* Find Vendors Button */}
      <Pressable
        onPress={() => {
          navigation.navigate("VendorMatching", { category: "transport" });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
        style={[styles.findVendorsButton, { backgroundColor: theme.primary }]}
      >
        <EvendiIcon name="search" size={18} color="#FFFFFF" />
        <ThemedText style={styles.findVendorsText}>Finn transportleverandører</ThemedText>
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
          const isCompleted = timeline[step.key as keyof TransportTimeline];
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
          { key: "bookings", label: "Bookinger", icon: "truck" },
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
            <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>Laster data...</ThemedText>
          </View>
        ) : isError ? (
          <View style={styles.errorContainer}>
            <EvendiIcon name="alert-circle" size={48} color={Colors.light.error} />
            <ThemedText style={styles.errorText}>Kunne ikke laste data</ThemedText>
            <ThemedText style={[styles.errorSubtext, { color: theme.textSecondary }]}>
              {error instanceof Error ? error.message : 'Ukjent feil'}
            </ThemedText>
            <Pressable
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
              onPress={() => refetch()}
            >
              <ThemedText style={styles.retryButtonText}>Prøv igjen</ThemedText>
            </Pressable>
          </View>
        ) : (
          <>
            {activeTab === "bookings" && renderBookingsTab()}
            {activeTab === "timeline" && renderTimelineTab()}
          </>
        )}
      </ScrollView>

      {/* Booking Modal */}
      <Modal visible={showBookingModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setShowBookingModal(false)} disabled={isSavingBooking}>
              <ThemedText style={[styles.modalCancel, { color: theme.textSecondary, opacity: isSavingBooking ? 0.5 : 1 }]}>Avbryt</ThemedText>
            </Pressable>
            <ThemedText style={styles.modalTitle}>
              {editingBooking ? "Rediger booking" : "Ny booking"}
            </ThemedText>
            <Pressable onPress={saveBooking} disabled={isSavingBooking}>
              {isSavingBooking ? (
                <ActivityIndicator size="small" color={theme.primary} />
              ) : (
                <ThemedText style={[styles.modalSave, { color: theme.primary }]}>Lagre</ThemedText>
              )}
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Type kjøretøy *</ThemedText>
              <View style={styles.vehicleTypeGrid}>
                {VEHICLE_TYPES.map((vehicle) => (
                  <Pressable
                    key={vehicle.key}
                    onPress={() => setBookingVehicleType(vehicle.key)}
                    style={[
                      styles.vehicleTypeCard,
                      { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                      bookingVehicleType === vehicle.key ? { backgroundColor: theme.primary + '20', borderColor: theme.primary } : undefined,
                    ]}
                  >
                    <EvendiIcon 
                      name={vehicle.icon} 
                      size={24} 
                      color={bookingVehicleType === vehicle.key ? theme.primary : theme.textSecondary} 
                    />
                    <ThemedText
                      style={[
                        styles.vehicleTypeLabel,
                        { color: bookingVehicleType === vehicle.key ? theme.primary : theme.text },
                      ]}
                    >
                      {vehicle.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Leverandør</ThemedText>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={providerSearch.searchText}
                onChangeText={providerSearch.onChangeText}
                placeholder="Søk etter registrert transportfirma..."
                placeholderTextColor={theme.textSecondary}
              />
              {providerSearch.selectedVendor && (
                <VendorActionBar
                  vendor={providerSearch.selectedVendor}
                  vendorCategory="transport"
                  onClear={providerSearch.clearSelection}
                  icon="truck"
                />
              )}
              <VendorSuggestions
                suggestions={providerSearch.suggestions}
                isLoading={providerSearch.isLoading}
                onSelect={providerSearch.onSelectVendor}
                onViewProfile={(v) => navigation.navigate("VendorDetail", {
                  vendorId: v.id,
                  vendorName: v.businessName,
                  vendorDescription: v.description || "",
                  vendorLocation: v.location || "",
                  vendorPriceRange: v.priceRange || "",
                  vendorCategory: "transport",
                })}
                icon="truck"
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Kjøretøybeskrivelse</ThemedText>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={bookingVehicleDesc}
                onChangeText={setBookingVehicleDesc}
                placeholder="F.eks. Hvit Mercedes S-klasse"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <ThemedText style={styles.formLabel}>Henting kl.</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                  value={bookingPickupTime}
                  onChangeText={setBookingPickupTime}
                  placeholder="HH:MM"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <ThemedText style={styles.formLabel}>Levering kl.</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                  value={bookingDropoffTime}
                  onChangeText={setBookingDropoffTime}
                  placeholder="HH:MM"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Hentested</ThemedText>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={bookingPickupLocation}
                onChangeText={setBookingPickupLocation}
                placeholder="Adresse"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Leveringssted</ThemedText>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={bookingDropoffLocation}
                onChangeText={setBookingDropoffLocation}
                placeholder="Adresse"
                placeholderTextColor={theme.textSecondary}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <ThemedText style={styles.formLabel}>Sjåfør navn</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                  value={bookingDriverName}
                  onChangeText={setBookingDriverName}
                  placeholder="Navn"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <ThemedText style={styles.formLabel}>Sjåfør tlf.</ThemedText>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                  value={bookingDriverPhone}
                  onChangeText={setBookingDriverPhone}
                  placeholder="Telefon"
                  placeholderTextColor={theme.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Pris (kr)</ThemedText>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={bookingPrice}
                onChangeText={setBookingPrice}
                placeholder="0"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Notater</ThemedText>
              <TextInput
                style={[styles.formInput, styles.formTextArea, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={bookingNotes}
                onChangeText={setBookingNotes}
                placeholder="Tilleggsinfo..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>

            {editingBooking && (
              <Pressable
                onPress={() => handleDeleteBooking(editingBooking.id)}
                style={[styles.deleteButton, { backgroundColor: Colors.light.error + '20', borderColor: Colors.light.error, borderWidth: 1, borderRadius: 8, padding: 12, alignItems: 'center' }]}
              >
                <ThemedText style={{ color: Colors.light.error }}>Slett booking</ThemedText>
              </Pressable>
            )}
          </ScrollView>
        </View>
      </Modal>

      {/* Budget Modal */}
      <Modal visible={showBudgetModal} animationType="slide" transparent>
        <View style={styles.budgetModalOverlay}>
          <View style={[styles.budgetModalContent, { backgroundColor: theme.backgroundDefault }]}>
            <ThemedText style={styles.budgetModalTitle}>Budsjett for Transport</ThemedText>
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
                disabled={isSavingBudget}
                style={[styles.budgetModalButton, { borderColor: theme.border, borderWidth: 1, borderRadius: 8, padding: 12, alignItems: 'center', opacity: isSavingBudget ? 0.5 : 1 }]}
              >
                <ThemedText>Avbryt</ThemedText>
              </Pressable>
              <Pressable
                onPress={saveBudget}
                disabled={isSavingBudget}
                style={[styles.saveButton, { backgroundColor: theme.primary, opacity: isSavingBudget ? 0.7 : 1 }]}
              >
                {isSavingBudget ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={styles.saveButtonText}>Lagre</ThemedText>
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
  bookingCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  bookingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  bookingInfo: {
    flex: 1,
    gap: 2,
  },
  bookingType: {
    fontSize: 16,
    fontWeight: "600",
  },
  bookingProvider: {
    fontSize: 14,
  },
  bookingTime: {
    fontSize: 13,
  },
  bookingPrice: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 4,
  },
  bookingActions: {
    alignItems: "center",
  },
  confirmButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  completedText: {
    textDecorationLine: "line-through",
    opacity: 0.6,
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
  formRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  vehicleTypeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  vehicleTypeCard: {
    width: "31%",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
    gap: Spacing.sm,
  },
  vehicleTypeLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  quickActionButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
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
  // New styles for improvements
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 14,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: Spacing.xl,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: Spacing.md,
  },
  errorSubtext: {
    fontSize: 14,
    marginTop: Spacing.xs,
    textAlign: "center",
  },
  retryButton: {
    marginTop: Spacing.md,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  emptyStateCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  emptyStateCtaText: {
    color: "#fff",
    fontWeight: "600",
  },
  budgetComparison: {
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  budgetComparisonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  budgetComparisonLabel: {
    fontSize: 13,
  },
  budgetComparisonValue: {
    fontSize: 13,
    fontWeight: "600",
  },
  saveButton: {
    flex: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
});
