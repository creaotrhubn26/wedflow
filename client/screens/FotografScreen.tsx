import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EvendiIcon } from '@/components/EvendiIcon';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getCoupleProfile } from '@/lib/api-couples';
import {
  getPhotographerData,
  createPhotographerSession,
  updatePhotographerSession,
  deletePhotographerSession,
  createPhotographerShot,
  updatePhotographerShot,
  deletePhotographerShot,
  updatePhotographerTimeline,
  PhotographerSession,
  PhotographerShot,
  PhotographerTimeline,
} from '@/lib/api-couple-data';
import { ThemedText } from '../components/ThemedText';
import { Button } from '../components/Button';
import { SwipeableRow } from '../components/SwipeableRow';
import { VendorSuggestions } from '@/components/VendorSuggestions';
import { VendorActionBar } from '@/components/VendorActionBar';
import { useTheme } from '../hooks/useTheme';
import { useVendorSearch } from '@/hooks/useVendorSearch';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { PlanningStackParamList } from '../navigation/PlanningStackNavigator';
import { showToast } from '@/lib/toast';

type TabType = 'sessions' | 'timeline';
type NavigationProp = NativeStackNavigationProp<PlanningStackParamList>;

const TIMELINE_STEPS = [
  { key: 'photographerSelected', label: 'Fotograf valgt', icon: 'check-circle' as const },
  { key: 'sessionBooked', label: 'Fotosesjon booket', icon: 'calendar' as const },
  { key: 'contractSigned', label: 'Kontrakt signert', icon: 'file-text' as const },
  { key: 'depositPaid', label: 'Depositum betalt', icon: 'credit-card' as const },
];

export function FotografScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('sessions');
  const [refreshing, setRefreshing] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const COUPLE_STORAGE_KEY = 'wedflow_couple_session';

  React.useEffect(() => {
    const loadSession = async () => {
      const data = await AsyncStorage.getItem(COUPLE_STORAGE_KEY);
      if (!data) return;
      const parsed = JSON.parse(data);
      setSessionToken(parsed?.sessionToken || null);
    };
    loadSession();
  }, []);

  const { data: coupleProfile } = useQuery({
    queryKey: ['coupleProfile'],
    queryFn: async () => {
      if (!sessionToken) throw new Error('No session');
      return getCoupleProfile(sessionToken);
    },
    enabled: !!sessionToken,
  });

  // Query for photographer data
  const { data: photographerData, isLoading: loading, refetch } = useQuery({
    queryKey: ['photographer-data'],
    queryFn: getPhotographerData,
  });

  const sessions = photographerData?.sessions ?? [];
  const shots = photographerData?.shots ?? [];
  const timeline = photographerData?.timeline ?? {
    photographerSelected: false,
    sessionBooked: false,
    contractSigned: false,
    depositPaid: false,
    budget: 0,
  };

  // Vendor search for photographer autocomplete
  const photographerSearch = useVendorSearch({ category: 'photographer' });

  // Mutations
  const createSessionMutation = useMutation({
    mutationFn: createPhotographerSession,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['photographer-data'] }),
  });

  const updateSessionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PhotographerSession> }) =>
      updatePhotographerSession(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['photographer-data'] }),
  });

  const deleteSessionMutation = useMutation({
    mutationFn: deletePhotographerSession,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['photographer-data'] }),
  });

  const createShotMutation = useMutation({
    mutationFn: createPhotographerShot,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['photographer-data'] }),
  });

  const updateShotMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PhotographerShot> }) =>
      updatePhotographerShot(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['photographer-data'] }),
  });

  const deleteShotMutation = useMutation({
    mutationFn: deletePhotographerShot,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['photographer-data'] }),
  });

  const updateTimelineMutation = useMutation({
    mutationFn: updatePhotographerTimeline,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['photographer-data'] }),
  });

  const duplicateSession = async (session: PhotographerSession) => {
    try {
      await createSessionMutation.mutateAsync({
        title: `Kopi av ${session.title}`,
        date: session.date || '',
        time: session.time || '',
        location: session.location || '',
        completed: false,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      showToast('Kunne ikke duplisere sesjon');
    }
  };

  const duplicateShot = async (shot: PhotographerShot) => {
    try {
      await createShotMutation.mutateAsync({
        title: `Kopi av ${shot.title}`,
        description: shot.description || '',
        isSelected: false,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      showToast('Kunne ikke duplisere bilde');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleFindPhotographer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('VendorMatching', { 
      category: 'photographer',
      selectedTraditions: coupleProfile?.selectedTraditions || [],
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundRoot }]} edges={['bottom']}>
      <View style={[styles.header, { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <View style={[styles.iconCircle, { backgroundColor: Colors.dark.accent + '15' }]}>
            <EvendiIcon name="camera" size={24} color={Colors.dark.accent} />
          </View>
          <View style={styles.headerText}>
            <ThemedText style={styles.headerTitle}>Fotograf</ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: theme.textMuted }]}>
              Finn og book fotograf
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={[styles.tabBar, { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        <Pressable
          style={[styles.tab, activeTab === 'sessions' && styles.activeTab]}
          onPress={() => {
            setActiveTab('sessions');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <ThemedText style={[styles.tabText, activeTab === 'sessions' && { color: Colors.dark.accent }]}>
            Økter
          </ThemedText>
          {activeTab === 'sessions' && <View style={[styles.tabIndicator, { backgroundColor: Colors.dark.accent }]} />}
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === 'timeline' && styles.activeTab]}
          onPress={() => {
            setActiveTab('timeline');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <ThemedText style={[styles.tabText, activeTab === 'timeline' && { color: Colors.dark.accent }]}>
            Tidslinje
          </ThemedText>
          {activeTab === 'timeline' && <View style={[styles.tabIndicator, { backgroundColor: Colors.dark.accent }]} />}
        </Pressable>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'sessions' ? (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.emptyState}>
            <EvendiIcon name="heart" size={48} color={theme.primary} style={{ opacity: 0.6 }} />
            <ThemedText style={[styles.emptyTitle, { color: theme.text, fontWeight: '600' }]}>
              Hvem skal bevare minnene deres?
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
              La oss finne fotografen som forteller historien deres.
            </ThemedText>

            <View style={{ width: '100%', marginTop: Spacing.md }}>
              <ThemedText style={[styles.searchLabel, { color: theme.textSecondary }]}>Søk etter fotograf</ThemedText>
              <TextInput
                style={[styles.searchInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={photographerSearch.searchText}
                onChangeText={photographerSearch.onChangeText}
                placeholder="Søk etter registrert fotograf..."
                placeholderTextColor={theme.textSecondary}
              />
              {photographerSearch.selectedVendor && (
                <VendorActionBar
                  vendor={photographerSearch.selectedVendor}
                  vendorCategory="photographer"
                  onClear={photographerSearch.clearSelection}
                  icon="camera"
                />
              )}
              <VendorSuggestions
                suggestions={photographerSearch.suggestions}
                isLoading={photographerSearch.isLoading}
                onSelect={photographerSearch.onSelectVendor}
                onViewProfile={(v) => navigation.navigate('VendorDetail', {
                  vendorId: v.id,
                  vendorName: v.businessName,
                  vendorDescription: v.description || '',
                  vendorLocation: v.location || '',
                  vendorPriceRange: v.priceRange || '',
                  vendorCategory: 'photographer',
                })}
                icon="camera"
              />
            </View>

            <Button onPress={handleFindPhotographer} style={styles.findButton}>
              Finn fotograf
            </Button>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.timelineContainer}>
            {TIMELINE_STEPS.map((step, index) => (
              <View key={step.key} style={styles.timelineItem}>
                <View style={[styles.timelineIconCircle, { backgroundColor: theme.backgroundSecondary }]}>
                  <EvendiIcon name={step.icon} size={20} color={theme.textMuted} />
                </View>
                <View style={styles.timelineContent}>
                  <ThemedText style={styles.timelineLabel}>{step.label}</ThemedText>
                </View>
              </View>
            ))}
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  headerSubtitle: { fontSize: 14, marginTop: 2 },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {},
  tabText: { fontSize: 15, fontWeight: '600' },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  content: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: Spacing.lg },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing['3xl'],
  },
  emptyTitle: { fontSize: 20, fontWeight: '600', textAlign: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center', maxWidth: 280 },
  findButton: { marginTop: Spacing.md },
  searchLabel: { fontSize: 14, fontWeight: '600', marginBottom: Spacing.xs },
  searchInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
  },
  timelineContainer: { gap: Spacing.lg },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  timelineIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineContent: { flex: 1 },
  timelineLabel: { fontSize: 15, fontWeight: '500' },
  quickActionButton: {
    padding: 8,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
