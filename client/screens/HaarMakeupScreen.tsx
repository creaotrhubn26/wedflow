import React, { useEffect, useState, useCallback } from "react";
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
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SwipeableRow } from "@/components/SwipeableRow";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { PlanningStackParamList } from "@/navigation/PlanningStackNavigator";
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
  { key: "weddingDayBooked", label: "Bryllupsdag booket", icon: "check-circle" as const },
];

const SERVICE_TYPES = ["Hår", "Makeup", "Hår & Makeup", "Negler", "Annet"];
const APPOINTMENT_TYPES = ["Konsultasjon", "Prøvetime", "Bryllupsdag", "Annet"];
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

  // Query for hair/makeup data
  const { data: hairMakeupData, isLoading: loading, refetch } = useQuery({
    queryKey: ["hair-makeup-data"],
    queryFn: getHairMakeupData,
  });

  const appointments = hairMakeupData?.appointments ?? [];
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
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<HairMakeupAppointment | null>(null);
  const [appointmentStylist, setAppointmentStylist] = useState("");
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
      setAppointmentStylist(appointment.stylistName);
      setAppointmentServiceType(appointment.serviceType || "");
      setAppointmentType(appointment.appointmentType || "");
      setAppointmentDate(appointment.date);
      setAppointmentTime(appointment.time || "");
      setAppointmentLocation(appointment.location || "");
      setAppointmentNotes(appointment.notes || "");
    } else {
      setEditingAppointment(null);
      setAppointmentStylist("");
      setAppointmentServiceType("");
      setAppointmentType("");
      setAppointmentDate("");
      setAppointmentTime("");
      setAppointmentLocation("");
      setAppointmentNotes("");
    }
    setShowAppointmentModal(true);
  };

  const saveAppointment = async () => {
    if (!appointmentStylist.trim() || !appointmentDate.trim()) {
      Alert.alert("Feil", "Vennligst fyll inn stylist og dato");
      return;
    }

    try {
      if (editingAppointment) {
        await updateAppointmentMutation.mutateAsync({
          id: editingAppointment.id,
          data: {
            stylistName: appointmentStylist,
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
          stylistName: appointmentStylist,
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

  const saveLook = async () => {
    if (!lookName.trim()) {
      Alert.alert("Feil", "Vennligst gi looket et navn");
      return;
    }

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
      Alert.alert("Feil", "Kunne ikke lagre look");
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
      // Unselect others first if selecting
      if (!look.isSelected) {
        for (const otherLook of looks.filter((l) => l.isSelected && l.id !== id)) {
          await updateLookMutation.mutateAsync({ id: otherLook.id, data: { isSelected: false } });
        }
      }
      await updateLookMutation.mutateAsync({ id, data: { isSelected: !look.isSelected } });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const handleDeleteLook = async (id: string) => {
    await deleteLookMutation.mutateAsync(id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
    await updateTimelineMutation.mutateAsync({ budget: newBudget });
    setShowBudgetModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
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
          <Feather name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {appointments.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="calendar" size={48} color={theme.textSecondary} />
          <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
            Ingen avtaler ennå
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Legg til konsultasjoner og prøvetimer
          </ThemedText>
        </View>
      ) : (
        appointments.map((appointment, index) => (
          <Animated.View key={appointment.id} entering={FadeInDown.delay(index * 50)}>
            <SwipeableRow onDelete={() => handleDeleteAppointment(appointment.id)}>
              <Pressable
                onPress={() => openAppointmentModal(appointment)}
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
                <Feather name="chevron-right" size={20} color={theme.textSecondary} />
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
          <Feather name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {looks.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
          <Feather name="image" size={48} color={theme.textSecondary} />
          <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
            Ingen looks lagret
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary }]}>
            Lagre inspirasjon for hår og makeup
          </ThemedText>
        </View>
      ) : (
        <View style={styles.looksGrid}>
          {looks.map((look, index) => (
            <Animated.View key={look.id} entering={FadeInRight.delay(index * 50)} style={styles.lookCardWrapper}>
              <Pressable
                onPress={() => openLookModal(look)}
                onLongPress={() => toggleLookSelected(look.id)}
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
                    <Feather name="image" size={32} color={theme.textSecondary} />
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
                  <Feather
                    name={look.isFavorite ? "heart" : "heart"}
                    size={18}
                    color={look.isFavorite ? Colors.light.error : theme.textSecondary}
                    style={look.isFavorite ? { opacity: 1 } : { opacity: 0.5 }}
                  />
                </Pressable>
                {look.isSelected && (
                  <View style={[styles.selectedBadge, { backgroundColor: theme.primary }]}>
                    <Feather name="check" size={12} color="#fff" />
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
          <Feather name="edit-2" size={16} color={theme.textSecondary} />
        </View>
        <ThemedText style={[styles.budgetAmount, { color: theme.primary }]}>
          {formatCurrency(budget)}
        </ThemedText>
      </Pressable>

      {/* Find Vendors Button */}
      <Pressable
        onPress={() => {
          navigation.navigate("VendorMatching", { category: "beauty" });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }}
        style={[styles.findVendorsButton, { backgroundColor: theme.primary }]}
      >
        <Feather name="search" size={18} color="#FFFFFF" />
        <ThemedText style={styles.findVendorsText}>Finn hår & makeup-artister</ThemedText>
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
          { key: "appointments", label: "Avtaler", icon: "calendar" },
          { key: "looks", label: "Looks", icon: "image" },
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
        {activeTab === "appointments" && renderAppointmentsTab()}
        {activeTab === "looks" && renderLooksTab()}
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
              <ThemedText style={styles.formLabel}>Stylist/Salong *</ThemedText>
              <TextInput
                style={[styles.formInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={appointmentStylist}
                onChangeText={setAppointmentStylist}
                placeholder="Navn på stylist eller salong"
                placeholderTextColor={theme.textSecondary}
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
            <Pressable onPress={() => setShowLookModal(false)}>
              <ThemedText style={[styles.modalCancel, { color: theme.textSecondary }]}>Avbryt</ThemedText>
            </Pressable>
            <ThemedText style={styles.modalTitle}>
              {editingLook ? "Rediger look" : "Nytt look"}
            </ThemedText>
            <Pressable onPress={saveLook}>
              <ThemedText style={[styles.modalSave, { color: theme.primary }]}>Lagre</ThemedText>
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
                    <Feather name="image" size={32} color={theme.textSecondary} />
                    <ThemedText style={[styles.imagePickerText, { color: theme.textSecondary }]}>
                      Velg bilde
                    </ThemedText>
                  </View>
                )}
              </Pressable>
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
                  setShowLookModal(false);
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
