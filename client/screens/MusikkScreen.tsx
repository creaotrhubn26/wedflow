import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl, TouchableOpacity, TextInput, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EvendiIcon } from '@/components/EvendiIcon';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getCoupleProfile } from '@/lib/api-couples';
import { TraditionHintBanner } from '@/components/TraditionHintBanner';
import {
  getMusicData,
  createMusicPerformance,
  updateMusicPerformance,
  deleteMusicPerformance,
  createMusicSetlist,
  updateMusicSetlist,
  deleteMusicSetlist,
  updateMusicTimeline,
  updateMusicPreferences,
  MusicPerformance,
  MusicSetlist,
  MusicTimeline,
  MusicPreferences,
} from '@/lib/api-couple-data';
import { ThemedText } from '../components/ThemedText';
import { Button } from '../components/Button';
import { VendorSuggestions } from '@/components/VendorSuggestions';
import { VendorActionBar } from '@/components/VendorActionBar';
import { useTheme } from '../hooks/useTheme';
import { useVendorSearch } from '@/hooks/useVendorSearch';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { PlanningStackParamList } from '../navigation/PlanningStackNavigator';
import { getSpeeches } from '@/lib/storage';
import { Speech } from '@/lib/types';
import { showToast } from '@/lib/toast';

type TabType = 'bookings' | 'timeline';
type NavigationProp = NativeStackNavigationProp<PlanningStackParamList>;

const TIMELINE_STEPS = [
  { key: 'musicianSelected', label: 'Musikk/DJ valgt', icon: 'check-circle' as const },
  { key: 'setlistDiscussed', label: 'Spilleliste diskutert', icon: 'list' as const },
  { key: 'contractSigned', label: 'Kontrakt signert', icon: 'file-text' as const },
  { key: 'depositPaid', label: 'Depositum betalt', icon: 'credit-card' as const },
];

export function MusikkScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  const [refreshing, setRefreshing] = useState(false);
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<MusicPreferences>({
    spotifyPlaylistUrl: '',
    youtubePlaylistUrl: '',
    entranceSong: '',
    firstDanceSong: '',
    lastSong: '',
    doNotPlay: '',
    additionalNotes: '',
  });
  const [savingPreferences, setSavingPreferences] = useState(false);

  // Vendor search for music autocomplete
  const musicSearch = useVendorSearch({ category: 'music' });

  const COUPLE_STORAGE_KEY = 'wedflow_couple_session';

  useFocusEffect(
    useCallback(() => {
      const loadSession = async () => {
        const data = await AsyncStorage.getItem(COUPLE_STORAGE_KEY);
        if (!data) return;
        const parsed = JSON.parse(data);
        setSessionToken(parsed?.sessionToken || null);
      };
      loadSession();
    }, [])
  );

  const { data: coupleProfile } = useQuery({
    queryKey: ['coupleProfile'],
    queryFn: async () => {
      if (!sessionToken) throw new Error('No session');
      return getCoupleProfile(sessionToken);
    },
    enabled: !!sessionToken,
  });

  // Query for music data
  const { data: musicData, isLoading: loading, refetch } = useQuery({
    queryKey: ['music-data'],
    queryFn: getMusicData,
  });

  const performances = musicData?.performances ?? [];
  const setlists = musicData?.setlists ?? [];
  const timeline = musicData?.timeline ?? {
    musicianSelected: false,
    setlistDiscussed: false,
    contractSigned: false,
    depositPaid: false,
    budget: 0,
  };

  useEffect(() => {
    if (!musicData?.preferences) return;
    setPreferences({
      spotifyPlaylistUrl: musicData.preferences.spotifyPlaylistUrl || '',
      youtubePlaylistUrl: musicData.preferences.youtubePlaylistUrl || '',
      entranceSong: musicData.preferences.entranceSong || '',
      firstDanceSong: musicData.preferences.firstDanceSong || '',
      lastSong: musicData.preferences.lastSong || '',
      doNotPlay: musicData.preferences.doNotPlay || '',
      additionalNotes: musicData.preferences.additionalNotes || '',
    });
  }, [musicData?.preferences]);

  // Mutations
  const createPerformanceMutation = useMutation({
    mutationFn: createMusicPerformance,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['music-data'] }),
  });

  const updatePerformanceMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MusicPerformance> }) =>
      updateMusicPerformance(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['music-data'] }),
  });

  const deletePerformanceMutation = useMutation({
    mutationFn: deleteMusicPerformance,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['music-data'] }),
  });

  const createSetlistMutation = useMutation({
    mutationFn: createMusicSetlist,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['music-data'] }),
  });

  const updateSetlistMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<MusicSetlist> }) =>
      updateMusicSetlist(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['music-data'] }),
  });

  const deleteSetlistMutation = useMutation({
    mutationFn: deleteMusicSetlist,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['music-data'] }),
  });

  const updateTimelineMutation = useMutation({
    mutationFn: updateMusicTimeline,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['music-data'] }),
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: updateMusicPreferences,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['music-data'] }),
  });

  const normalizeUrl = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return '';
    return trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
  };

  const isValidPlaylistUrl = useCallback((value: string, type: 'spotify' | 'youtube') => {
    const normalized = normalizeUrl(value);
    if (!normalized) return true;
    try {
      const parsed = new URL(normalized);
      if (type === 'spotify') {
        return parsed.hostname.includes('spotify.com');
      }
      return parsed.hostname.includes('youtube.com') || parsed.hostname.includes('youtu.be');
    } catch {
      return false;
    }
  }, []);

  const spotifyError = useMemo(() => {
    if (!preferences.spotifyPlaylistUrl) return '';
    return isValidPlaylistUrl(preferences.spotifyPlaylistUrl, 'spotify')
      ? ''
      : 'Ugyldig Spotify-lenke';
  }, [preferences.spotifyPlaylistUrl, isValidPlaylistUrl]);

  const youtubeError = useMemo(() => {
    if (!preferences.youtubePlaylistUrl) return '';
    return isValidPlaylistUrl(preferences.youtubePlaylistUrl, 'youtube')
      ? ''
      : 'Ugyldig YouTube-lenke';
  }, [preferences.youtubePlaylistUrl, isValidPlaylistUrl]);

  const handleSavePreferences = async () => {
    if (spotifyError || youtubeError) {
      showToast('Sjekk Spotify- og YouTube-lenkene før du lagrer.');
      return;
    }
    setSavingPreferences(true);
    try {
      await updatePreferencesMutation.mutateAsync({
        spotifyPlaylistUrl: preferences.spotifyPlaylistUrl?.trim() || null,
        youtubePlaylistUrl: preferences.youtubePlaylistUrl?.trim() || null,
        entranceSong: preferences.entranceSong?.trim() || null,
        firstDanceSong: preferences.firstDanceSong?.trim() || null,
        lastSong: preferences.lastSong?.trim() || null,
        doNotPlay: preferences.doNotPlay?.trim() || null,
        additionalNotes: preferences.additionalNotes?.trim() || null,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      showToast('Kunne ikke lagre musikkønsker');
    } finally {
      setSavingPreferences(false);
    }
  };

  const openPlaylistLink = async (url: string) => {
    if (!url.trim()) return;
    const finalUrl = normalizeUrl(url);
    try {
      const canOpen = await Linking.canOpenURL(finalUrl);
      if (!canOpen) {
        showToast('Kan ikke åpne denne lenken.');
        return;
      }
      await Linking.openURL(finalUrl);
    } catch {
      showToast('Kunne ikke åpne lenken.');
    }
  };

  const duplicatePerformance = async (performance: MusicPerformance) => {
    try {
      await createPerformanceMutation.mutateAsync({
        title: `Kopi av ${performance.title}`,
        date: performance.date || '',
        time: performance.time || '',
        duration: performance.duration || '',
        completed: false,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      showToast('Kunne ikke duplisere forestilling');
    }
  };

  const duplicateSetlist = async (setlist: MusicSetlist) => {
    try {
      await createSetlistMutation.mutateAsync({
        title: `Kopi av ${setlist.title}`,
        songs: setlist.songs || '',
        genre: setlist.genre || '',
        duration: setlist.duration || '',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      showToast('Kunne ikke duplisere spilleliste');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleFindMusic = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('VendorMatching', { 
      category: 'music',
      selectedTraditions: coupleProfile?.selectedTraditions || [],
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundRoot }]} edges={['bottom']}>
      <View style={[styles.header, { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <View style={[styles.iconCircle, { backgroundColor: Colors.dark.accent + '15' }]}>
            <EvendiIcon name="music" size={24} color={Colors.dark.accent} />
          </View>
          <View style={styles.headerText}>
            <ThemedText style={styles.headerTitle}>Musikk & DJ</ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: theme.textMuted }]}>
              Band, DJ og musikere
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={[styles.tabBar, { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        <Pressable
          style={[styles.tab, activeTab === 'bookings' && styles.activeTab]}
          onPress={() => {
            setActiveTab('bookings');
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
        >
          <ThemedText style={[styles.tabText, activeTab === 'bookings' && { color: Colors.dark.accent }]}>
            Bookinger
          </ThemedText>
          {activeTab === 'bookings' && <View style={[styles.tabIndicator, { backgroundColor: Colors.dark.accent }]} />}
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
        {/* Tradition hints for music */}
        {(coupleProfile?.selectedTraditions?.length ?? 0) > 0 && (
          <TraditionHintBanner
            traditions={coupleProfile?.selectedTraditions || []}
            category="music"
          />
        )}
        {activeTab === 'bookings' ? (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.emptyState}>
            <EvendiIcon name="heart" size={48} color={theme.primary} style={{ opacity: 0.6 }} />
            <ThemedText style={[styles.emptyTitle, { color: theme.text, fontWeight: '600' }]}>
              Hva er soundtracket til dagen?
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
              La oss finne musikken som får dere til å danse.
            </ThemedText>

            <View style={{ width: '100%', marginTop: Spacing.md }}>
              <ThemedText style={[styles.searchLabel, { color: theme.textSecondary }]}>Søk etter musikk/DJ</ThemedText>
              <TextInput
                style={[styles.searchInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={musicSearch.searchText}
                onChangeText={musicSearch.onChangeText}
                placeholder="Søk etter registrert musikk/DJ..."
                placeholderTextColor={theme.textSecondary}
              />
              {musicSearch.selectedVendor && (
                <VendorActionBar
                  vendor={musicSearch.selectedVendor}
                  vendorCategory="music"
                  onClear={musicSearch.clearSelection}
                  icon="music"
                />
              )}
              <VendorSuggestions
                suggestions={musicSearch.suggestions}
                isLoading={musicSearch.isLoading}
                onSelect={musicSearch.onSelectVendor}
                onViewProfile={(v) => navigation.navigate('VendorDetail', {
                  vendorId: v.id,
                  vendorName: v.businessName,
                  vendorDescription: v.description || '',
                  vendorLocation: v.location || '',
                  vendorPriceRange: v.priceRange || '',
                  vendorCategory: 'music',
                })}
                icon="music"
              />
            </View>

            <Button onPress={handleFindMusic} style={styles.findButton}>
              Finn musikk
            </Button>

            <View style={[styles.prefCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}> 
              <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Spillelister & ønskelåter</ThemedText>
              <ThemedText style={[styles.sectionSubtitle, { color: theme.textMuted }]}> 
                Legg inn lenker og spesielle sanger som inngang og første dans.
              </ThemedText>

              <View style={styles.prefField}>
                <ThemedText style={[styles.prefLabel, { color: theme.textSecondary }]}>Spotify spilleliste</ThemedText>
                <View style={styles.prefRow}>
                  <TextInput
                    style={[styles.prefInput, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border, color: theme.text }]}
                    placeholder="https://open.spotify.com/..."
                    placeholderTextColor={theme.textMuted}
                    value={preferences.spotifyPlaylistUrl || ''}
                    onChangeText={(value) => setPreferences((prev) => ({ ...prev, spotifyPlaylistUrl: value }))}
                    onBlur={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        spotifyPlaylistUrl: normalizeUrl(prev.spotifyPlaylistUrl || ''),
                      }))
                    }
                  />
                  <Pressable
                    onPress={() => openPlaylistLink(preferences.spotifyPlaylistUrl || '')}
                    style={[styles.prefLinkBtn, { borderColor: theme.border }]}
                  >
                    <EvendiIcon name="external-link" size={16} color={theme.textSecondary} />
                  </Pressable>
                </View>
                {spotifyError ? (
                  <ThemedText style={styles.prefError}>{spotifyError}</ThemedText>
                ) : null}
              </View>

              <View style={styles.prefField}>
                <ThemedText style={[styles.prefLabel, { color: theme.textSecondary }]}>YouTube spilleliste</ThemedText>
                <View style={styles.prefRow}>
                  <TextInput
                    style={[styles.prefInput, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border, color: theme.text }]}
                    placeholder="https://youtube.com/playlist?..."
                    placeholderTextColor={theme.textMuted}
                    value={preferences.youtubePlaylistUrl || ''}
                    onChangeText={(value) => setPreferences((prev) => ({ ...prev, youtubePlaylistUrl: value }))}
                    onBlur={() =>
                      setPreferences((prev) => ({
                        ...prev,
                        youtubePlaylistUrl: normalizeUrl(prev.youtubePlaylistUrl || ''),
                      }))
                    }
                  />
                  <Pressable
                    onPress={() => openPlaylistLink(preferences.youtubePlaylistUrl || '')}
                    style={[styles.prefLinkBtn, { borderColor: theme.border }]}
                  >
                    <EvendiIcon name="external-link" size={16} color={theme.textSecondary} />
                  </Pressable>
                </View>
                {youtubeError ? (
                  <ThemedText style={styles.prefError}>{youtubeError}</ThemedText>
                ) : null}
              </View>

              <View style={styles.prefField}>
                <ThemedText style={[styles.prefLabel, { color: theme.textSecondary }]}>Inngangssang</ThemedText>
                <TextInput
                  style={[styles.prefInput, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border, color: theme.text }]}
                  placeholder="Artist - Sang"
                  placeholderTextColor={theme.textMuted}
                  value={preferences.entranceSong || ''}
                  onChangeText={(value) => setPreferences((prev) => ({ ...prev, entranceSong: value }))}
                />
              </View>

              <View style={styles.prefField}>
                <ThemedText style={[styles.prefLabel, { color: theme.textSecondary }]}>Første dans</ThemedText>
                <TextInput
                  style={[styles.prefInput, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border, color: theme.text }]}
                  placeholder="Artist - Sang"
                  placeholderTextColor={theme.textMuted}
                  value={preferences.firstDanceSong || ''}
                  onChangeText={(value) => setPreferences((prev) => ({ ...prev, firstDanceSong: value }))}
                />
              </View>

              <View style={styles.prefField}>
                <ThemedText style={[styles.prefLabel, { color: theme.textSecondary }]}>Siste sang</ThemedText>
                <TextInput
                  style={[styles.prefInput, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border, color: theme.text }]}
                  placeholder="Artist - Sang"
                  placeholderTextColor={theme.textMuted}
                  value={preferences.lastSong || ''}
                  onChangeText={(value) => setPreferences((prev) => ({ ...prev, lastSong: value }))}
                />
              </View>

              <View style={styles.prefField}>
                <ThemedText style={[styles.prefLabel, { color: theme.textSecondary }]}>Ikke spill</ThemedText>
                <TextInput
                  style={[styles.prefInput, styles.prefNotes, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border, color: theme.text }]}
                  placeholder="Sanger eller sjangre som må unngås"
                  placeholderTextColor={theme.textMuted}
                  value={preferences.doNotPlay || ''}
                  onChangeText={(value) => setPreferences((prev) => ({ ...prev, doNotPlay: value }))}
                  multiline
                />
              </View>

              <View style={styles.prefField}>
                <ThemedText style={[styles.prefLabel, { color: theme.textSecondary }]}>Ekstra notater</ThemedText>
                <TextInput
                  style={[styles.prefInput, styles.prefNotes, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border, color: theme.text }]}
                  placeholder="F.eks. ønsket stemning eller sjanger"
                  placeholderTextColor={theme.textMuted}
                  value={preferences.additionalNotes || ''}
                  onChangeText={(value) => setPreferences((prev) => ({ ...prev, additionalNotes: value }))}
                  multiline
                />
              </View>

              <Button onPress={handleSavePreferences} style={styles.savePreferencesButton}>
                {savingPreferences ? 'Lagrer...' : 'Lagre musikkønsker'}
              </Button>
            </View>
          </Animated.View>
        ) : (
          <Animated.View entering={FadeInDown.duration(300)} style={styles.timelineContainer}>
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>
              Musikk forberedelse
            </ThemedText>
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

            {speeches.length > 0 && (
              <>
                <ThemedText style={[styles.sectionTitle, { color: theme.text, marginTop: Spacing.xl }]}>
                  Taler ({speeches.length})
                </ThemedText>
                <ThemedText style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
                  Pause musikken når taler starter
                </ThemedText>
                
                {speeches
                  .sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'))
                  .map((speech) => {
                    const statusColor = speech.status === 'speaking' ? '#f59e0b' : 
                                       speech.status === 'done' ? '#16a34a' : theme.textSecondary;
                    const statusIcon = speech.status === 'speaking' ? 'mic' :
                                      speech.status === 'done' ? 'check-circle' : 'clock';

                    return (
                      <View
                        key={speech.id}
                        style={[
                          styles.speechItem,
                          { 
                            borderLeftWidth: 3,
                            borderLeftColor: statusColor,
                            backgroundColor: speech.status === 'speaking' ? '#f59e0b15' : theme.backgroundDefault,
                          }
                        ]}
                      >
                        <View style={[styles.timelineIconCircle, { backgroundColor: statusColor + '20' }]}>
                          <EvendiIcon name={statusIcon} size={18} color={statusColor} />
                        </View>
                        <View style={styles.speechContent}>
                          <View style={styles.speechHeader}>
                            <ThemedText style={[styles.speechTime, { color: theme.text, fontWeight: '600' }]}>
                              {speech.time}
                            </ThemedText>
                            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
                              <ThemedText style={[styles.statusText, { color: statusColor }]}>
                                {speech.status === 'speaking' ? '🔴 NÅ' : speech.status === 'done' ? 'Ferdig' : 'Klar'}
                              </ThemedText>
                            </View>
                          </View>
                          <ThemedText style={[styles.speechName, { color: theme.text }]}>
                            {speech.speakerName}
                          </ThemedText>
                          <ThemedText style={[styles.speechRole, { color: theme.textSecondary }]}>
                            {speech.role}
                          </ThemedText>
                        </View>
                      </View>
                    );
                  })}
              </>
            )}
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
  prefCard: {
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  prefField: {
    gap: Spacing.xs,
  },
  prefLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  prefRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  prefInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    fontSize: 14,
  },
  prefNotes: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm,
  },
  prefLinkBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prefError: {
    fontSize: 12,
    color: '#EF5350',
  },
  savePreferencesButton: {
    marginTop: Spacing.sm,
  },
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  speechItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
  speechContent: {
    flex: 1,
  },
  speechHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  speechTime: {
    fontSize: 16,
  },
  speechName: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  speechRole: {
    fontSize: 13,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
