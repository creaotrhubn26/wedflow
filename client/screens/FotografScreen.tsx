import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EvendiIcon } from '@/components/EvendiIcon';import { EmptyStateIllustration } from "@/components/EmptyStateIllustration";import * as Haptics from 'expo-haptics';
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
import { VendorCategoryMarketplace } from '@/components/VendorCategoryMarketplace';
import { useTheme } from '../hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { PlanningStackParamList } from '../navigation/PlanningStackNavigator';
import { showToast } from '@/lib/toast';
import PersistentTextInput from "@/components/PersistentTextInput";

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

  const COUPLE_STORAGE_KEY = 'evendi_couple_session';

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
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundRoot }]} edges={['bottom']}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Marketplace hero + search + vendor cards + CTA */}
        <VendorCategoryMarketplace
          category="photographer"
          categoryName="Fotograf"
          icon="camera"
          subtitle="Finn og book den perfekte fotografen"
          selectedTraditions={coupleProfile?.selectedTraditions}
        />

        {/* Tab bar */}
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

        {/* Tab content */}
        {activeTab === 'sessions' ? (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.emptyState}>
            <EmptyStateIllustration stateKey="photographer" />
            <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
              Ingen fotoøkter ennå
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
              Bruk søket ovenfor for å finne og booke en fotograf.
            </ThemedText>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.timelineContainer}>
            {TIMELINE_STEPS.map((step) => (
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
  scrollContent: { flexGrow: 1 },
  emptyState: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing['2xl'],
    paddingHorizontal: Spacing.lg,
  },
  emptyTitle: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
  emptyText: { fontSize: 14, textAlign: 'center', maxWidth: 280 },
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
