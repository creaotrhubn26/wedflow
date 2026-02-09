import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  RefreshControl,
  Image,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { ThemedText } from '../components/ThemedText';
import { Button } from '../components/Button';
import { SwipeableRow } from '../components/SwipeableRow';
import { VendorSuggestions } from '@/components/VendorSuggestions';
import { VendorActionBar } from '@/components/VendorActionBar';
import { useTheme } from '../hooks/useTheme';
import { useVendorSearch } from '@/hooks/useVendorSearch';
import { Colors } from '../constants/theme';
import { PlanningStackParamList } from '../navigation/PlanningStackNavigator';
import {
  getCakeData,
  createCakeTasting,
  updateCakeTasting,
  deleteCakeTasting,
  createCakeDesign,
  updateCakeDesign,
  deleteCakeDesign,
  updateCakeTimeline,
  type CakeTasting,
  type CakeDesign,
  type CakeTimeline,
} from '../lib/api-couple-data';

type TabType = 'tastings' | 'designs' | 'timeline';
type NavigationProp = NativeStackNavigationProp<PlanningStackParamList>;

const CAKE_STYLES = [
  { id: 'traditional', label: 'Tradisjonell', icon: '🎂' },
  { id: 'naked', label: 'Naked Cake', icon: '🍰' },
  { id: 'drip', label: 'Drip Cake', icon: '🧁' },
  { id: 'fondant', label: 'Fondant', icon: '🎀' },
  { id: 'buttercream', label: 'Smørkrem', icon: '🍦' },
  { id: 'macaron', label: 'Macaron Tower', icon: '🗼' },
  { id: 'cheesecake', label: 'Ostekake', icon: '🧀' },
  { id: 'cupcakes', label: 'Cupcakes', icon: '🧁' },
];

const TIMELINE_STEPS = [
  { key: 'bakerySelected' as const, label: 'Bakeri valgt', icon: 'home' as const },
  { key: 'tastingCompleted' as const, label: 'Smaksprøve gjennomført', icon: 'coffee' as const },
  { key: 'designFinalized' as const, label: 'Design bestemt', icon: 'image' as const },
  { key: 'depositPaid' as const, label: 'Depositum betalt', icon: 'credit-card' as const },
  { key: 'deliveryConfirmed' as const, label: 'Levering bekreftet', icon: 'truck' as const },
];

export function KakeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<TabType>('tastings');
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [tastingModalVisible, setTastingModalVisible] = useState(false);
  const [designModalVisible, setDesignModalVisible] = useState(false);

  // Edit state
  const [editingTasting, setEditingTasting] = useState<CakeTasting | null>(null);
  const [editingDesign, setEditingDesign] = useState<CakeDesign | null>(null);

  // Form state - Tasting
  const [bakeryName, setBakeryName] = useState('');
  const [tastingDate, setTastingDate] = useState('');
  const [tastingTime, setTastingTime] = useState('');
  const [tastingLocation, setTastingLocation] = useState('');
  const [flavorsToTry, setFlavorsToTry] = useState('');
  const [tastingNotes, setTastingNotes] = useState('');
  const [tastingRating, setTastingRating] = useState(0);
  const [tastingCompleted, setTastingCompleted] = useState(false);

  // Form state - Design
  const [designName, setDesignName] = useState('');
  const [designImageUrl, setDesignImageUrl] = useState('');
  const [designTiers, setDesignTiers] = useState('');
  const [designFlavor, setDesignFlavor] = useState('');
  const [designFilling, setDesignFilling] = useState('');
  const [designFrosting, setDesignFrosting] = useState('');
  const [designStyle, setDesignStyle] = useState('');
  const [designEstimatedPrice, setDesignEstimatedPrice] = useState('');
  const [designEstimatedServings, setDesignEstimatedServings] = useState('');
  const [designNotes, setDesignNotes] = useState('');
  const [designIsFavorite, setDesignIsFavorite] = useState(false);
  const [designIsSelected, setDesignIsSelected] = useState(false);

  // Loading states
  const [isSavingTasting, setIsSavingTasting] = useState(false);
  const [isSavingDesign, setIsSavingDesign] = useState(false);
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  // Budget modal state
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');

  // Vendor search for bakery autocomplete
  const bakerySearch = useVendorSearch({ category: 'bakery' });

  // Date parsing helper for sorting (handles YYYY-MM-DD and DD.MM.YYYY)
  const parseDate = (dateStr: string | undefined): Date => {
    if (!dateStr) return new Date(0);
    // Try ISO format first (YYYY-MM-DD)
    const isoDate = new Date(dateStr);
    if (!isNaN(isoDate.getTime()) && dateStr.includes('-')) {
      return isoDate;
    }
    // Try Norwegian format (DD.MM.YYYY)
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return new Date(0);
  };

  // Date format helper for display
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return '';
    const date = parseDate(dateStr);
    if (isNaN(date.getTime()) || date.getTime() === 0) return dateStr;
    return date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Date validation helper
  const isValidDate = (dateStr: string): boolean => {
    if (!dateStr) return false;
    // Check YYYY-MM-DD format
    const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
    // Check DD.MM.YYYY format
    const norRegex = /^\d{2}\.\d{2}\.\d{4}$/;
    if (isoRegex.test(dateStr) || norRegex.test(dateStr)) {
      const date = parseDate(dateStr);
      return !isNaN(date.getTime()) && date.getTime() !== 0;
    }
    return false;
  };

  // Fetch cake data
  const { data: cakeData, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['couple-cake-data'],
    queryFn: getCakeData,
  });

  // Mutations
  const createTastingMutation = useMutation({
    mutationFn: createCakeTasting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple-cake-data'] });
      closeTastingModal();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => Alert.alert('Feil', 'Kunne ikke lagre smaksprøve'),
  });

  const updateTastingMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CakeTasting> }) =>
      updateCakeTasting(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple-cake-data'] });
      closeTastingModal();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => Alert.alert('Feil', 'Kunne ikke oppdatere smaksprøve'),
  });

  const deleteTastingMutation = useMutation({
    mutationFn: deleteCakeTasting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple-cake-data'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => Alert.alert('Feil', 'Kunne ikke slette smaksprøve'),
  });

  const createDesignMutation = useMutation({
    mutationFn: createCakeDesign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple-cake-data'] });
      closeDesignModal();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => Alert.alert('Feil', 'Kunne ikke lagre design'),
  });

  const updateDesignMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CakeDesign> }) =>
      updateCakeDesign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple-cake-data'] });
      closeDesignModal();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => Alert.alert('Feil', 'Kunne ikke oppdatere design'),
  });

  const deleteDesignMutation = useMutation({
    mutationFn: deleteCakeDesign,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple-cake-data'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => Alert.alert('Feil', 'Kunne ikke slette design'),
  });

  const updateTimelineMutation = useMutation({
    mutationFn: updateCakeTimeline,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple-cake-data'] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: () => Alert.alert('Feil', 'Kunne ikke oppdatere tidslinje'),
  });

  // Modal functions
  const closeTastingModal = () => {
    setTastingModalVisible(false);
    setEditingTasting(null);
    setBakeryName('');
    setTastingDate('');
    setTastingTime('');
    setTastingLocation('');
    setFlavorsToTry('');
    setTastingNotes('');
    setTastingRating(0);
    setTastingCompleted(false);
  };

  const closeDesignModal = () => {
    setDesignModalVisible(false);
    setEditingDesign(null);
    setDesignName('');
    setDesignImageUrl('');
    setDesignTiers('');
    setDesignFlavor('');
    setDesignFilling('');
    setDesignFrosting('');
    setDesignStyle('');
    setDesignEstimatedPrice('');
    setDesignEstimatedServings('');
    setDesignNotes('');
    setDesignIsFavorite(false);
    setDesignIsSelected(false);
  };

  const openEditTasting = (tasting: CakeTasting) => {
    setEditingTasting(tasting);
    setBakeryName(tasting.bakeryName || '');
    setTastingDate(tasting.date || '');
    setTastingTime(tasting.time || '');
    setTastingLocation(tasting.location || '');
    setFlavorsToTry(tasting.flavorsToTry || '');
    setTastingNotes(tasting.notes || '');
    setTastingRating(tasting.rating || 0);
    setTastingCompleted(tasting.completed || false);
    setTastingModalVisible(true);
  };

  const openEditDesign = (design: CakeDesign) => {
    setEditingDesign(design);
    setDesignName(design.name || '');
    setDesignImageUrl(design.imageUrl || '');
    setDesignTiers(design.tiers?.toString() || '');
    setDesignFlavor(design.flavor || '');
    setDesignFilling(design.filling || '');
    setDesignFrosting(design.frosting || '');
    setDesignStyle(design.style || '');
    setDesignEstimatedPrice(design.estimatedPrice?.toString() || '');
    setDesignEstimatedServings(design.estimatedServings?.toString() || '');
    setDesignNotes(design.notes || '');
    setDesignIsFavorite(design.isFavorite || false);
    setDesignIsSelected(design.isSelected || false);
    setDesignModalVisible(true);
  };

  const handleSaveTasting = async () => {
    if (!bakeryName.trim()) {
      Alert.alert('Feil', 'Vennligst fyll inn bakeri navn');
      return;
    }
    if (!tastingDate.trim()) {
      Alert.alert('Feil', 'Vennligst fyll inn dato');
      return;
    }
    if (!isValidDate(tastingDate.trim())) {
      Alert.alert('Ugyldig dato', 'Bruk format YYYY-MM-DD eller DD.MM.YYYY');
      return;
    }

    setIsSavingTasting(true);
    try {
      const data = {
        bakeryName: bakeryName.trim(),
        date: tastingDate.trim(),
        time: tastingTime.trim() || undefined,
        location: tastingLocation.trim() || undefined,
        flavorsToTry: flavorsToTry.trim() || undefined,
        notes: tastingNotes.trim() || undefined,
        rating: tastingRating || undefined,
        completed: tastingCompleted,
      };

      if (editingTasting) {
        await updateTastingMutation.mutateAsync({ id: editingTasting.id, data });
      } else {
        await createTastingMutation.mutateAsync(data);
      }
    } finally {
      setIsSavingTasting(false);
    }
  };

  const handleSaveDesign = async () => {
    if (!designName.trim()) {
      Alert.alert('Feil', 'Vennligst fyll inn design navn');
      return;
    }

    setIsSavingDesign(true);
    try {
      // If selecting this design, unselect all others first
      if (designIsSelected) {
        const othersToUnselect = (cakeData?.designs || []).filter(
          (d) => d.isSelected && d.id !== editingDesign?.id
        );
        await Promise.all(
          othersToUnselect.map((d) =>
            updateDesignMutation.mutateAsync({ id: d.id, data: { isSelected: false } })
          )
        );
        
        // Also update timeline.designFinalized when a design is selected
        if (cakeData?.timeline && !cakeData.timeline.designFinalized) {
          await updateTimelineMutation.mutateAsync({ designFinalized: true });
        }
      }

      const data = {
        name: designName.trim(),
        imageUrl: designImageUrl.trim() || undefined,
        tiers: designTiers ? parseInt(designTiers) : undefined,
        flavor: designFlavor.trim() || undefined,
        filling: designFilling.trim() || undefined,
        frosting: designFrosting.trim() || undefined,
        style: designStyle || undefined,
        estimatedPrice: designEstimatedPrice ? parseInt(designEstimatedPrice) : undefined,
        estimatedServings: designEstimatedServings ? parseInt(designEstimatedServings) : undefined,
        notes: designNotes.trim() || undefined,
        isFavorite: designIsFavorite,
        isSelected: designIsSelected,
      };

      if (editingDesign) {
        await updateDesignMutation.mutateAsync({ id: editingDesign.id, data });
      } else {
        await createDesignMutation.mutateAsync(data);
      }
    } finally {
      setIsSavingDesign(false);
    }
  };

  const handleDeleteTasting = (id: string) => {
    Alert.alert('Slett smaksprøve', 'Er du sikker på at du vil slette denne smaksprøven?', [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Slett', style: 'destructive', onPress: () => deleteTastingMutation.mutate(id) },
    ]);
  };

  const handleDeleteDesign = (id: string) => {
    Alert.alert('Slett design', 'Er du sikker på at du vil slette dette designet?', [
      { text: 'Avbryt', style: 'cancel' },
      { text: 'Slett', style: 'destructive', onPress: () => deleteDesignMutation.mutate(id) },
    ]);
  };

  const duplicateTasting = async (tasting: CakeTasting) => {
    try {
      await createTastingMutation.mutateAsync({
        bakeryName: `Kopi av ${tasting.bakeryName}`,
        date: tasting.date,
        time: tasting.time,
        location: tasting.location || '',
        flavorsToTry: tasting.flavorsToTry || '',
        notes: tasting.notes || '',
        completed: false,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert('Feil', 'Kunne ikke duplisere smaksprøve');
    }
  };

  const duplicateDesign = async (design: CakeDesign) => {
    try {
      await createDesignMutation.mutateAsync({
        name: `Kopi av ${design.name}`,
        imageUrl: design.imageUrl,
        tiers: design.tiers || 0,
        flavor: design.flavor || '',
        filling: design.filling || '',
        frosting: design.frosting || '',
        style: design.style,
        estimatedPrice: design.estimatedPrice,
        isFavorite: false,
        isSelected: false,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert('Feil', 'Kunne ikke duplisere design');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const toggleTimelineStep = (step: keyof CakeTimeline) => {
    if (!cakeData?.timeline) return;
    const currentValue = cakeData.timeline[step];
    if (typeof currentValue === 'boolean') {
      updateTimelineMutation.mutate({ [step]: !currentValue });
    }
  };

  // Budget handlers
  const openBudgetModal = () => {
    setBudgetInput(cakeData?.timeline?.budget?.toString() || '');
    setShowBudgetModal(true);
  };

  const saveBudget = async () => {
    const newBudget = parseInt(budgetInput, 10) || 0;
    setIsSavingBudget(true);
    try {
      await updateTimelineMutation.mutateAsync({ budget: newBudget });
      setShowBudgetModal(false);
    } finally {
      setIsSavingBudget(false);
    }
  };

  // Image picker for design
  const pickDesignImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Tillatelse kreves', 'Vi trenger tilgang til bildegalleriet for å velge bilder.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setDesignImageUrl(result.assets[0].uri);
    }
  };

  // Calculate summary stats
  const completedTastings = (cakeData?.tastings || []).filter((t) => t.completed).length;
  const totalTastings = (cakeData?.tastings || []).length;
  const favoriteDesigns = (cakeData?.designs || []).filter((d) => d.isFavorite).length;
  const selectedDesign = (cakeData?.designs || []).find((d) => d.isSelected);
  const completedSteps = TIMELINE_STEPS.filter(
    (step) => cakeData?.timeline && cakeData.timeline[step.key]
  ).length;

  // Sort tastings: upcoming first (by date), then completed
  const sortedTastings = [...(cakeData?.tastings || [])].sort((a, b) => {
    // Completed at bottom
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    // Sort by date (earliest first for upcoming)
    return parseDate(a.date).getTime() - parseDate(b.date).getTime();
  });

  // Sort designs: selected first, then favorites, then by name
  const sortedDesigns = [...(cakeData?.designs || [])].sort((a, b) => {
    if (a.isSelected !== b.isSelected) return a.isSelected ? -1 : 1;
    if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
    return (a.name || '').localeCompare(b.name || '');
  });

  const renderTastingsTab = () => (
    <View style={styles.tabContent}>
      {/* Summary Card */}
      <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Smaksprøver
            </ThemedText>
            <ThemedText style={[styles.summaryValue, { color: theme.primary }]}>
              {completedTastings}/{totalTastings}
            </ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Gjennomført
            </ThemedText>
            <ThemedText style={[styles.summaryValue, { color: theme.primary }]}>
              {completedTastings}
            </ThemedText>
          </View>
        </View>
      </View>

      {(cakeData?.tastings || []).length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="heart" size={48} color={theme.primary} style={{ opacity: 0.6 }} />
          <ThemedText style={[styles.emptyStateText, { fontWeight: '600' }]}>Hvilken kake avslutter dagen best?</ThemedText>
          <ThemedText style={[styles.emptyStateSubtext, { color: theme.textSecondary }]}>
            La oss finne smaken dere husker.
          </ThemedText>
          <TouchableOpacity
            style={[styles.emptyStateCta, { backgroundColor: theme.primary }]}
            onPress={() => {
              setTastingModalVisible(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Feather name="plus" size={16} color="#fff" />
            <ThemedText style={styles.emptyStateCtaText}>Legg til smaksprøve</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        sortedTastings.map((tasting, index) => (
          <Animated.View key={tasting.id} entering={FadeInDown.delay(index * 50)}>
            <SwipeableRow
              onEdit={() => openEditTasting(tasting)}
              onDelete={() => handleDeleteTasting(tasting.id)}
            >
              <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
                onPress={() => openEditTasting(tasting)}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert('Alternativer', tasting.bakeryName, [
                    { text: 'Avbryt', style: 'cancel' },
                    { text: 'Rediger', onPress: () => openEditTasting(tasting) },
                    { text: 'Dupliser', onPress: () => duplicateTasting(tasting) },
                    { text: 'Slett', style: 'destructive', onPress: () => handleDeleteTasting(tasting.id) },
                  ]);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <ThemedText style={styles.cardTitle}>{tasting.bakeryName}</ThemedText>
                    {tasting.completed && (
                      <View style={[styles.statusBadge, { backgroundColor: theme.primary + '20' }]}>
                        <ThemedText style={[styles.statusBadgeText, { color: theme.primary }]}>
                          Gjennomført
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  {tasting.rating && tasting.rating > 0 && (
                    <View style={styles.ratingContainer}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Feather
                          key={star}
                          name="star"
                          size={14}
                          color={star <= tasting.rating! ? Colors.light.warning : theme.border}
                          style={{ marginRight: 2 }}
                        />
                      ))}
                    </View>
                  )}
                </View>

                {tasting.location && (
                  <View style={styles.cardRow}>
                    <Feather name="map-pin" size={14} color={theme.textSecondary} />
                    <ThemedText style={[styles.cardSubtext, { color: theme.textSecondary }]}>
                      {tasting.location}
                    </ThemedText>
                  </View>
                )}

                <View style={styles.cardRow}>
                  <Feather name="calendar" size={14} color={theme.textSecondary} />
                  <ThemedText style={[styles.cardSubtext, { color: theme.textSecondary }]}>
                    {formatDate(tasting.date)}
                    {tasting.time && ` kl. ${tasting.time}`}
                  </ThemedText>
                </View>

                {tasting.flavorsToTry && (
                  <View style={styles.cardRow}>
                    <Feather name="list" size={14} color={theme.textSecondary} />
                    <ThemedText
                      style={[styles.cardSubtext, { color: theme.textSecondary }]}
                      numberOfLines={1}
                    >
                      {tasting.flavorsToTry}
                    </ThemedText>
                  </View>
                )}
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    duplicateTasting(tasting);
                  }}
                  style={styles.quickActionButton}
                >
                  <Feather name="copy" size={16} color={theme.textSecondary} />
                </Pressable>
              </TouchableOpacity>
            </SwipeableRow>
          </Animated.View>
        ))
      )}
    </View>
  );

  const renderDesignsTab = () => (
    <View style={styles.tabContent}>
      {/* Summary Card */}
      <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Favoritter
            </ThemedText>
            <ThemedText style={[styles.summaryValue, { color: theme.primary }]}>
              {favoriteDesigns}
            </ThemedText>
          </View>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Valgt design
            </ThemedText>
            <ThemedText style={[styles.summaryValue, { color: theme.primary }]}>
              {selectedDesign ? '✓' : '–'}
            </ThemedText>
          </View>
        </View>
      </View>

      {(cakeData?.designs || []).length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="heart" size={48} color={theme.primary} style={{ opacity: 0.6 }} />
          <ThemedText style={[styles.emptyStateText, { fontWeight: '600' }]}>Hvilken kake avslutter dagen best?</ThemedText>
          <ThemedText style={[styles.emptyStateSubtext, { color: theme.textSecondary }]}>
            Lagre inspirasjon for kaken deres.
          </ThemedText>
          <TouchableOpacity
            style={[styles.emptyStateCta, { backgroundColor: theme.primary }]}
            onPress={() => {
              setDesignModalVisible(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Feather name="plus" size={16} color="#fff" />
            <ThemedText style={styles.emptyStateCtaText}>Legg til design</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        sortedDesigns.map((design, index) => (
          <Animated.View key={design.id} entering={FadeInDown.delay(index * 50)}>
            <SwipeableRow
              onEdit={() => openEditDesign(design)}
              onDelete={() => handleDeleteDesign(design.id)}
            >
              <TouchableOpacity
                style={[styles.card, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
                onPress={() => openEditDesign(design)}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  Alert.alert('Alternativer', design.name, [
                    { text: 'Avbryt', style: 'cancel' },
                    { text: 'Rediger', onPress: () => openEditDesign(design) },
                    { text: 'Dupliser', onPress: () => duplicateDesign(design) },
                    { text: 'Slett', style: 'destructive', onPress: () => handleDeleteDesign(design.id) },
                  ]);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <ThemedText style={styles.cardTitle}>{design.name}</ThemedText>
                    {design.isFavorite && (
                      <Feather name="heart" size={16} color={Colors.light.error} style={{ marginLeft: 8 }} />
                    )}
                    {design.isSelected && (
                      <View style={[styles.statusBadge, { backgroundColor: theme.primary + '20', marginLeft: 8 }]}>
                        <ThemedText style={[styles.statusBadgeText, { color: theme.primary }]}>
                          Valgt
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  {design.style && (
                    <View style={[styles.typeBadge, { backgroundColor: theme.backgroundSecondary }]}>
                      <ThemedText style={styles.typeEmoji}>
                        {CAKE_STYLES.find((t) => t.id === design.style)?.icon || '🎂'}
                      </ThemedText>
                      <ThemedText style={[styles.typeLabel, { color: theme.textSecondary }]}>
                        {CAKE_STYLES.find((t) => t.id === design.style)?.label || design.style}
                      </ThemedText>
                    </View>
                  )}
                </View>

                {design.imageUrl && (
                  <Image source={{ uri: design.imageUrl }} style={styles.designImage} />
                )}

                <View style={styles.designDetails}>
                  {design.tiers && (
                    <View style={styles.detailItem}>
                      <ThemedText style={[styles.detailLabel, { color: theme.textSecondary }]}>
                        Etasjer
                      </ThemedText>
                      <ThemedText style={styles.detailValue}>{design.tiers}</ThemedText>
                    </View>
                  )}
                  {design.estimatedServings && (
                    <View style={styles.detailItem}>
                      <ThemedText style={[styles.detailLabel, { color: theme.textSecondary }]}>
                        Porsjoner
                      </ThemedText>
                      <ThemedText style={styles.detailValue}>{design.estimatedServings}</ThemedText>
                    </View>
                  )}
                  {design.estimatedPrice && (
                    <View style={styles.detailItem}>
                      <ThemedText style={[styles.detailLabel, { color: theme.textSecondary }]}>
                        Pris
                      </ThemedText>
                      <ThemedText style={[styles.detailValue, { color: theme.primary }]}>
                        {design.estimatedPrice.toLocaleString('nb-NO')} kr
                      </ThemedText>
                    </View>
                  )}
                </View>

                {(design.flavor || design.filling || design.frosting) && (
                  <View style={styles.flavorsRow}>
                    {design.flavor && (
                      <View
                        style={[styles.flavorChip, { backgroundColor: theme.primary + '15' }]}
                      >
                        <ThemedText style={[styles.flavorChipText, { color: theme.primary }]}>
                          {design.flavor}
                        </ThemedText>
                      </View>
                    )}
                    {design.filling && (
                      <View
                        style={[styles.flavorChip, { backgroundColor: theme.primary + '15' }]}
                      >
                        <ThemedText style={[styles.flavorChipText, { color: theme.primary }]}>
                          {design.filling}
                        </ThemedText>
                      </View>
                    )}
                    {design.frosting && (
                      <View
                        style={[styles.flavorChip, { backgroundColor: theme.primary + '15' }]}
                      >
                        <ThemedText style={[styles.flavorChipText, { color: theme.primary }]}>
                          {design.frosting}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                )}
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    duplicateDesign(design);
                  }}
                  style={styles.quickActionButton}
                >
                  <Feather name="copy" size={16} color={theme.textSecondary} />
                </Pressable>
              </TouchableOpacity>
            </SwipeableRow>
          </Animated.View>
        ))
      )}
    </View>
  );

  const renderTimelineTab = () => (
    <View style={styles.tabContent}>
      {/* Summary Card with clickable budget */}
      <View style={[styles.summaryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Fremgang
            </ThemedText>
            <ThemedText style={[styles.summaryValue, { color: theme.primary }]}>
              {completedSteps}/{TIMELINE_STEPS.length}
            </ThemedText>
          </View>
          <TouchableOpacity 
            style={styles.summaryItem}
            onPress={() => {
              openBudgetModal();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}>
              Budsjett
            </ThemedText>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <ThemedText style={[styles.summaryValue, { color: theme.primary }]}>
                {cakeData?.timeline?.budget 
                  ? `${cakeData.timeline.budget.toLocaleString('nb-NO')} kr`
                  : 'Sett budsjett'}
              </ThemedText>
              <Feather name="edit-2" size={12} color={theme.primary} />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* Find Vendors Button - context aware */}
      {cakeData?.timeline?.bakerySelected ? (
        <View style={[styles.vendorSelectedCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.vendorSelectedHeader}>
            <Feather name="check-circle" size={18} color={theme.primary} />
            <ThemedText style={[styles.vendorSelectedText, { color: theme.text }]}>
              Bakeri valgt
            </ThemedText>
          </View>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("VendorMatching", { category: "cake" });
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            }}
            style={[styles.vendorChangeButton, { borderColor: theme.border }]}
          >
            <ThemedText style={{ color: theme.textSecondary }}>Endre / Se kontaktinfo</ThemedText>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("VendorMatching", { category: "cake" });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          style={[styles.findVendorsButton, { backgroundColor: theme.primary }]}
          activeOpacity={0.7}
        >
          <Feather name="search" size={18} color="#FFFFFF" />
          <ThemedText style={styles.findVendorsText}>Finn konditori</ThemedText>
          <Feather name="arrow-right" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      )}

      {/* Timeline Steps */}
      {TIMELINE_STEPS.map((step, index) => {
        const isCompleted = cakeData?.timeline && cakeData.timeline[step.key];
        return (
          <Animated.View key={step.key} entering={FadeInDown.delay(index * 50)}>
            <TouchableOpacity
              style={[styles.timelineCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
              onPress={() => toggleTimelineStep(step.key)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.timelineCheckbox,
                  {
                    backgroundColor: isCompleted ? theme.primary : 'transparent',
                    borderColor: isCompleted ? theme.primary : theme.border,
                  },
                ]}
              >
                {isCompleted && <Feather name="check" size={14} color="#fff" />}
              </View>

              <View style={styles.timelineContent}>
                <View style={styles.timelineHeader}>
                  <Feather
                    name={step.icon}
                    size={18}
                    color={isCompleted ? theme.primary : theme.textSecondary}
                  />
                  <ThemedText
                    style={[
                      styles.timelineTitle,
                      isCompleted && { textDecorationLine: 'line-through', opacity: 0.7 },
                    ]}
                  >
                    {step.label}
                  </ThemedText>
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="arrow-left" size={24} color={theme.text} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Bryllupskake</ThemedText>
        <View style={styles.headerRight} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
        {[
          { id: 'tastings', label: 'Smaksprøver', icon: 'coffee' },
          { id: 'designs', label: 'Design', icon: 'image' },
          { id: 'timeline', label: 'Tidslinje', icon: 'list' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[styles.tab, activeTab === tab.id && { borderBottomColor: theme.primary }]}
            onPress={() => {
              setActiveTab(tab.id as TabType);
              Haptics.selectionAsync();
            }}
          >
            <Feather
              name={tab.icon as any}
              size={18}
              color={activeTab === tab.id ? theme.primary : theme.textSecondary}
            />
            <ThemedText
              style={[
                styles.tabLabel,
                { color: activeTab === tab.id ? theme.primary : theme.textSecondary },
              ]}
            >
              {tab.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={theme.primary} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.primary} />
            <ThemedText style={[styles.loadingText, { color: theme.textSecondary }]}>Laster data...</ThemedText>
          </View>
        ) : isError ? (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={48} color={Colors.light.error} />
            <ThemedText style={styles.errorText}>Kunne ikke laste data</ThemedText>
            <ThemedText style={[styles.errorSubtext, { color: theme.textSecondary }]}>
              {error instanceof Error ? error.message : 'Ukjent feil'}
            </ThemedText>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: theme.primary }]}
              onPress={() => refetch()}
            >
              <ThemedText style={styles.retryButtonText}>Prøv igjen</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {activeTab === 'tastings' && renderTastingsTab()}
            {activeTab === 'designs' && renderDesignsTab()}
            {activeTab === 'timeline' && renderTimelineTab()}
          </>
        )}
      </ScrollView>

      {/* FAB - Only for tastings and designs tabs */}
      {activeTab !== 'timeline' && (
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: theme.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            if (activeTab === 'tastings') setTastingModalVisible(true);
            else setDesignModalVisible(true);
          }}
        >
          <Feather name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Tasting Modal */}
      <Modal visible={tastingModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {editingTasting ? 'Rediger smaksprøve' : 'Ny smaksprøve'}
              </ThemedText>
              <TouchableOpacity onPress={closeTastingModal}>
                <Feather name="x" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Bakeri navn *
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={bakerySearch.searchText || bakeryName}
                onChangeText={(text) => {
                  setBakeryName(text);
                  bakerySearch.onChangeText(text);
                }}
                placeholder="Søk etter registrert bakeri..."
                placeholderTextColor={theme.textSecondary}
              />
              {bakerySearch.selectedVendor && (
                <VendorActionBar
                  vendor={bakerySearch.selectedVendor}
                  vendorCategory="bakery"
                  onClear={() => {
                    bakerySearch.clearSelection();
                    setBakeryName('');
                  }}
                  icon="gift"
                />
              )}
              <VendorSuggestions
                suggestions={bakerySearch.suggestions}
                isLoading={bakerySearch.isLoading}
                onSelect={(v) => {
                  bakerySearch.onSelectVendor(v);
                  setBakeryName(v.businessName);
                }}
                onViewProfile={(v) => navigation.navigate('VendorDetail', {
                  vendorId: v.id,
                  vendorName: v.businessName,
                  vendorDescription: v.description || '',
                  vendorLocation: v.location || '',
                  vendorPriceRange: v.priceRange || '',
                  vendorCategory: 'bakery',
                })}
                icon="gift"
              />

              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Dato *
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={tastingDate}
                onChangeText={setTastingDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={theme.textSecondary}
              />

              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Tidspunkt
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={tastingTime}
                onChangeText={setTastingTime}
                placeholder="F.eks. 14:00"
                placeholderTextColor={theme.textSecondary}
              />

              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Sted
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={tastingLocation}
                onChangeText={setTastingLocation}
                placeholder="Gateadresse"
                placeholderTextColor={theme.textSecondary}
              />

              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Smaker å prøve
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={flavorsToTry}
                onChangeText={setFlavorsToTry}
                placeholder="F.eks. Sjokolade, vanilje, sitron"
                placeholderTextColor={theme.textSecondary}
              />

              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Vurdering
              </ThemedText>
              <View style={styles.ratingInput}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <TouchableOpacity
                    key={star}
                    onPress={() => {
                      setTastingRating(star);
                      Haptics.selectionAsync();
                    }}
                    hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
                  >
                    <Feather
                      name="star"
                      size={28}
                      color={star <= tastingRating ? Colors.light.warning : theme.border}
                      style={{ marginRight: 8 }}
                    />
                  </TouchableOpacity>
                ))}
              </View>

              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Notater
              </ThemedText>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={tastingNotes}
                onChangeText={setTastingNotes}
                placeholder="Tilleggsnotater..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => {
                  setTastingCompleted(!tastingCompleted);
                  Haptics.selectionAsync();
                }}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: tastingCompleted ? theme.primary : 'transparent',
                      borderColor: tastingCompleted ? theme.primary : theme.border,
                    },
                  ]}
                >
                  {tastingCompleted && <Feather name="check" size={14} color="#fff" />}
                </View>
                <ThemedText style={styles.checkboxLabel}>Gjennomført</ThemedText>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                onPress={closeTastingModal}
                disabled={isSavingTasting}
                style={{ flex: 1, marginRight: 8, borderColor: theme.border, borderWidth: 1, borderRadius: 8, padding: 14, alignItems: 'center', opacity: isSavingTasting ? 0.5 : 1 }}
              >
                <ThemedText>Avbryt</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveTasting}
                disabled={isSavingTasting}
                style={[styles.saveButton, { backgroundColor: theme.primary, opacity: isSavingTasting ? 0.7 : 1 }]}
              >
                {isSavingTasting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={styles.saveButtonText}>
                    {editingTasting ? 'Lagre' : 'Legg til'}
                  </ThemedText>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Design Modal */}
      <Modal visible={designModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {editingDesign ? 'Rediger design' : 'Nytt design'}
              </ThemedText>
              <TouchableOpacity onPress={closeDesignModal}>
                <Feather name="x" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Navn *
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={designName}
                onChangeText={setDesignName}
                placeholder="F.eks. Rustikk blomsterkake"
                placeholderTextColor={theme.textSecondary}
              />

              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Stil
              </ThemedText>
              <View style={styles.typeGrid}>
                {CAKE_STYLES.map((styleItem) => (
                  <TouchableOpacity
                    key={styleItem.id}
                    style={[
                      styles.typeButton,
                      {
                        backgroundColor:
                          designStyle === styleItem.id ? theme.primary + '20' : theme.background,
                        borderColor: designStyle === styleItem.id ? theme.primary : theme.border,
                      },
                    ]}
                    onPress={() => {
                      setDesignStyle(styleItem.id);
                      Haptics.selectionAsync();
                    }}
                  >
                    <ThemedText style={styles.typeButtonEmoji}>{styleItem.icon}</ThemedText>
                    <ThemedText
                      style={[
                        styles.typeButtonLabel,
                        { color: designStyle === styleItem.id ? theme.primary : theme.text },
                      ]}
                    >
                      {styleItem.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Bilde
              </ThemedText>
              {designImageUrl ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: designImageUrl }} style={styles.imagePreview} />
                  <View style={styles.imageActions}>
                    <TouchableOpacity
                      style={[styles.imageActionButton, { backgroundColor: theme.backgroundSecondary }]}
                      onPress={pickDesignImage}
                    >
                      <Feather name="edit-2" size={14} color={theme.text} />
                      <ThemedText style={[styles.imageActionText, { color: theme.text }]}>Endre</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.imageActionButton, { backgroundColor: Colors.light.error + '20' }]}
                      onPress={() => setDesignImageUrl('')}
                    >
                      <Feather name="trash-2" size={14} color={Colors.light.error} />
                      <ThemedText style={[styles.imageActionText, { color: Colors.light.error }]}>Fjern</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.imageInputRow}>
                  <TouchableOpacity
                    style={[styles.pickImageButton, { backgroundColor: theme.primary + '15', borderColor: theme.primary }]}
                    onPress={pickDesignImage}
                  >
                    <Feather name="image" size={18} color={theme.primary} />
                    <ThemedText style={{ color: theme.primary, fontWeight: '500' }}>Velg bilde</ThemedText>
                  </TouchableOpacity>
                  <ThemedText style={{ color: theme.textSecondary, marginVertical: 8 }}>eller</ThemedText>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                    value={designImageUrl}
                    onChangeText={setDesignImageUrl}
                    placeholder="Lim inn bilde-URL"
                    placeholderTextColor={theme.textSecondary}
                  />
                </View>
              )}

              <View style={styles.rowInputs}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
                    Etasjer
                  </ThemedText>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                    value={designTiers}
                    onChangeText={setDesignTiers}
                    placeholder="3"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
                    Porsjoner
                  </ThemedText>
                  <TextInput
                    style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                    value={designEstimatedServings}
                    onChangeText={setDesignEstimatedServings}
                    placeholder="100"
                    placeholderTextColor={theme.textSecondary}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Smak
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={designFlavor}
                onChangeText={setDesignFlavor}
                placeholder="F.eks. Sjokolade"
                placeholderTextColor={theme.textSecondary}
              />

              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Fyll
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={designFilling}
                onChangeText={setDesignFilling}
                placeholder="F.eks. Bringebærmousse"
                placeholderTextColor={theme.textSecondary}
              />

              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Glasur
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={designFrosting}
                onChangeText={setDesignFrosting}
                placeholder="F.eks. Smørkrem"
                placeholderTextColor={theme.textSecondary}
              />

              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Estimert pris (NOK)
              </ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={designEstimatedPrice}
                onChangeText={setDesignEstimatedPrice}
                placeholder="0"
                placeholderTextColor={theme.textSecondary}
                keyboardType="numeric"
              />

              <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
                Notater
              </ThemedText>
              <TextInput
                style={[styles.textArea, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
                value={designNotes}
                onChangeText={setDesignNotes}
                placeholder="Tilleggsnotater..."
                placeholderTextColor={theme.textSecondary}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => {
                  setDesignIsFavorite(!designIsFavorite);
                  Haptics.selectionAsync();
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: designIsFavorite ? Colors.light.error : 'transparent',
                      borderColor: designIsFavorite ? Colors.light.error : theme.border,
                    },
                  ]}
                >
                  {designIsFavorite && <Feather name="heart" size={14} color="#fff" />}
                </View>
                <ThemedText style={styles.checkboxLabel}>Favoritt</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => {
                  setDesignIsSelected(!designIsSelected);
                  Haptics.selectionAsync();
                }}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      backgroundColor: designIsSelected ? theme.primary : 'transparent',
                      borderColor: designIsSelected ? theme.primary : theme.border,
                    },
                  ]}
                >
                  {designIsSelected && <Feather name="check" size={14} color="#fff" />}
                </View>
                <ThemedText style={styles.checkboxLabel}>Valgt som endelig design</ThemedText>
              </TouchableOpacity>
            </ScrollView>

            <View style={styles.modalActions}>
              <Pressable
                onPress={closeDesignModal}
                disabled={isSavingDesign}
                style={{ flex: 1, marginRight: 8, borderColor: theme.border, borderWidth: 1, borderRadius: 8, padding: 14, alignItems: 'center', opacity: isSavingDesign ? 0.5 : 1 }}
              >
                <ThemedText>Avbryt</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveDesign}
                disabled={isSavingDesign}
                style={[styles.saveButton, { backgroundColor: theme.primary, opacity: isSavingDesign ? 0.7 : 1 }]}
              >
                {isSavingDesign ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <ThemedText style={styles.saveButtonText}>
                    {editingDesign ? 'Lagre' : 'Legg til'}
                  </ThemedText>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Budget Modal */}
      <Modal visible={showBudgetModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.budgetModalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Budsjett for Bryllupskake</ThemedText>
              <TouchableOpacity onPress={() => setShowBudgetModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </TouchableOpacity>
            </View>

            <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
              Budsjett (NOK)
            </ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
              value={budgetInput}
              onChangeText={setBudgetInput}
              placeholder="0"
              placeholderTextColor={theme.textSecondary}
              keyboardType="numeric"
            />

            <View style={[styles.modalActions, { marginTop: 20 }]}>
              <Pressable
                onPress={() => setShowBudgetModal(false)}
                disabled={isSavingBudget}
                style={{ flex: 1, marginRight: 8, borderColor: theme.border, borderWidth: 1, borderRadius: 8, padding: 14, alignItems: 'center', opacity: isSavingBudget ? 0.5 : 1 }}
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerRight: {
    width: 32,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  tabContent: {
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  cardSubtext: {
    fontSize: 13,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  typeEmoji: {
    fontSize: 16,
  },
  typeLabel: {
    fontSize: 12,
  },
  designImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginVertical: 12,
  },
  quickActionButton: {
    padding: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  designDetails: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  detailItem: {
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  flavorsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  flavorChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  flavorChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  timelineCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  timelineCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  timelineTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalScroll: {
    maxHeight: 500,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  ratingInput: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  typeButton: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  typeButtonEmoji: {
    fontSize: 20,
  },
  typeButtonLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  rowInputs: {
    flexDirection: 'row',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 16,
    paddingVertical: 8,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 24,
  },
  // Find vendors button
  findVendorsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  findVendorsText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  // New styles for improvements
  saveButton: {
    flex: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  errorSubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyStateCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateCtaText: {
    color: '#fff',
    fontWeight: '600',
  },
  vendorSelectedCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  vendorSelectedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  vendorSelectedText: {
    fontSize: 15,
    fontWeight: '600',
  },
  vendorChangeButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  budgetModalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  imagePreviewContainer: {
    marginTop: 8,
  },
  imagePreview: {
    width: '100%',
    height: 150,
    borderRadius: 10,
  },
  imageActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  imageActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  imageActionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  imageInputRow: {
    marginTop: 8,
  },
  pickImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
});
