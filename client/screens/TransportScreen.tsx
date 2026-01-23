import React, { useState, useCallback } from "react";
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

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SwipeableRow } from "@/components/SwipeableRow";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { PlanningStackParamList } from "@/navigation/PlanningStackNavigator";
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
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"bookings" | "timeline">("bookings");
  const [refreshing, setRefreshing] = useState(false);

  // Query for transport data
  const { data: transportData, isLoading: loading, refetch } = useQuery({
    queryKey: ["transport-data"],
    queryFn: getTransportData,
  });

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

  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<TransportBooking | null>(null);
  const [bookingVehicleType, setBookingVehicleType] = useState("");
  const [bookingProvider, setBookingProvider] = useState("");
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
      setBookingProvider(booking.providerName || "");
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
      setBookingProvider("");
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

  const saveBooking = async () => {
    if (!bookingVehicleType.trim()) {
      Alert.alert("Feil", "Vennligst velg type kjøretøy");
      return;
    }

    try {
      const data = {
        vehicleType: bookingVehicleType,
        providerName: bookingProvider,
        vehicleDescription: bookingVehicleDesc,
        pickupTime: bookingPickupTime,
        pickupLocation: bookingPickupLocation,
        dropoffTime: bookingDropoffTime,
        dropoffLocation: bookingDropoffLocation,
        driverName: bookingDriverName,
        driverPhone: bookingDriverPhone,
        price: bookingPrice ? parseInt(bookingPrice, 10) : undefined,
        notes: bookingNotes,
        confirmed: false,
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
      Alert.alert("Feil", "Kunne ikke lagre booking");
    }
  };

  const toggleBookingConfirmed = async (id: string) => {
    const booking = bookings.find((b) => b.id === id);
    if (booking) {
      await updateBookingMutation.mutateAsync({ id, data: { confirmed: !booking.confirmed } });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleDeleteBooking = async (id: string) => {
    await deleteBookingMutation.mutateAsync(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
    const newBudget = parseInt(budgetInput, 10) || 0;
    await updateTimelineMutation.mutateAsync({ budget: newBudget });
    setShowBudgetModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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

  const renderBookingsTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Bookinger</ThemedText>
        <Pressable onPress={() => openBookingModal()} style={[styles.addButton, { backgroundColor: theme.primary }]}>
          <Feather name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {bookings.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="truck" size={48} color={theme.textSecondary} />
          <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
            Ingen transport booket ennå
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Legg til transport for bryllupsdagen
          </ThemedText>
        </View>
      ) : (
        bookings.map((booking, index) => (
          <Animated.View key={booking.id} entering={FadeInDown.delay(index * 50)}>
            <SwipeableRow onDelete={() => handleDeleteBooking(booking.id)}>
              <Pressable
                onPress={() => openBookingModal(booking)}
                style={[styles.bookingCard, { backgroundColor: theme.backgroundDefault }]}
              >
                <View style={[styles.bookingIcon, { backgroundColor: booking.confirmed ? theme.primary + '20' : theme.border }]}>
                  <Feather 
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
                <View style={styles.bookingActions}>
                  <Pressable
                    onPress={() => toggleBookingConfirmed(booking.id)}
                    style={[
                      styles.confirmButton,
                      { borderColor: theme.border },
                      booking.confirmed ? { backgroundColor: Colors.light.success, borderColor: Colors.light.success } : undefined,
                    ]}
                  >
                    <Feather name="check" size={16} color={booking.confirmed ? "#fff" : theme.textSecondary} />
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
      {/* Budget Card */}
      <Pressable onPress={openBudgetModal} style={[styles.budgetCard, { backgroundColor: theme.backgroundDefault }]}>
        <View style={styles.budgetHeader}>
          <ThemedText style={styles.budgetLabel}>Budsjett for Transport</ThemedText>
          <Feather name="edit-2" size={16} color={theme.textSecondary} />
        </View>
        <ThemedText style={[styles.budgetAmount, { color: theme.primary }]}>
          {formatCurrency(budget)}
        </ThemedText>
      </Pressable>

      {/* Find Vendors Button */}
      <Pressable
        onPress={() => {
          navigation.navigate("VendorMatching", { category: "transport" });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
        style={[styles.findVendorsButton, { backgroundColor: theme.primary }]}
      >
        <Feather name="search" size={18} color="#FFFFFF" />
        <ThemedText style={styles.findVendorsText}>Finn transportleverandører</ThemedText>
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
          { key: "bookings", label: "Bookinger", icon: "truck" },
          { key: "timeline", label: "Tidslinje", icon: "list" },
        ].map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key as any)}
            style={[styles.tab, activeTab === tab.key && { borderBottomColor: theme.primary, borderBottomWidth: 2 }]}
          >
            <Feather name={tab.icon as any} size={18} color={activeTab === tab.key ? theme.primary : theme.textSecondary} />
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
        {activeTab === "bookings" && renderBookingsTab()}
        {activeTab === "timeline" && renderTimelineTab()}
      </ScrollView>

      {/* Booking Modal */}
      <Modal visible={showBookingModal} animationType="slide" presentationStyle="pageSheet">
        <View style={[styles.modalContainer, { backgroundColor: theme.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setShowBookingModal(false)}>
              <ThemedText style={[styles.modalCancel, { color: theme.textSecondary }]}>Avbryt</ThemedText>
            </Pressable>
            <ThemedText style={styles.modalTitle}>
              {editingBooking ? "Rediger booking" : "Ny booking"}
            </ThemedText>
            <Pressable onPress={saveBooking}>
              <ThemedText style={[styles.modalSave, { color: theme.primary }]}>Lagre</ThemedText>
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
                    <Feather 
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
                value={bookingProvider}
                onChangeText={setBookingProvider}
                placeholder="Navn på firma/sjåfør"
                placeholderTextColor={theme.textSecondary}
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
                onPress={() => {
                  handleDeleteBooking(editingBooking.id);
                  setShowBookingModal(false);
                }}
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
