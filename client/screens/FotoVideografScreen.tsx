import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, RefreshControl, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EvendiIcon } from '@/components/EvendiIcon';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '../components/ThemedText';
import { Button } from '../components/Button';
import { VendorSuggestions } from '@/components/VendorSuggestions';
import { VendorActionBar } from '@/components/VendorActionBar';
import { useTheme } from '../hooks/useTheme';
import { useVendorSearch } from '@/hooks/useVendorSearch';
import { Colors, Spacing } from '../constants/theme';
import { PlanningStackParamList } from '../navigation/PlanningStackNavigator';

type TabType = 'sessions' | 'timeline';
type NavigationProp = NativeStackNavigationProp<PlanningStackParamList>;

const TIMELINE_STEPS = [
  { key: 'photographerSelected', label: 'Fotograf/Videograf valgt', icon: 'check-circle' as const },
  { key: 'sessionBooked', label: 'Foto-/Videosesjon booket', icon: 'calendar' as const },
  { key: 'contractSigned', label: 'Kontrakt signert', icon: 'file-text' as const },
  { key: 'depositPaid', label: 'Depositum betalt', icon: 'credit-card' as const },
  { key: 'deliveryPlanned', label: 'Leveranse planlagt', icon: 'truck' as const },
];

export function FotoVideografScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('sessions');
  const [refreshing, setRefreshing] = useState(false);

  // Vendor search for photo-video autocomplete
  const photoVideoSearch = useVendorSearch({ category: 'photo-video' });

  const onRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const handleFindProvider = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('VendorMatching', { category: 'photo-video' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundRoot }]} edges={['bottom']}>
      <View style={[styles.header, { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <View style={[styles.iconCircle, { backgroundColor: Colors.dark.accent + '15' }]}>
            <View style={styles.dualIconContainer}>
              <EvendiIcon name="camera" size={20} color={Colors.dark.accent} />
              <EvendiIcon name="video" size={20} color={Colors.dark.accent} />
            </View>
          </View>
          <View style={styles.headerText}>
            <ThemedText style={styles.headerTitle}>Foto & Video</ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: theme.textMuted }]}>
              Fotograf og videograf i ett
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
            <View style={styles.dualIconLarge}>
              <EvendiIcon name="camera" size={32} color={theme.textMuted} />
              <EvendiIcon name="video" size={32} color={theme.textMuted} />
            </View>
            <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
              Ingen foto-/videoøkter ennå
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
              Start med å finne en leverandør som tilbyr både foto og video
            </ThemedText>

            <View style={{ width: '100%', marginTop: Spacing.md }}>
              <ThemedText style={[styles.searchLabel, { color: theme.textSecondary }]}>Søk etter leverandør</ThemedText>
              <TextInput
                style={[styles.searchInput, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
                value={photoVideoSearch.searchText}
                onChangeText={photoVideoSearch.onChangeText}
                placeholder="Søk etter registrert foto & video..."
                placeholderTextColor={theme.textSecondary}
              />
              {photoVideoSearch.selectedVendor && (
                <VendorActionBar
                  vendor={photoVideoSearch.selectedVendor}
                  vendorCategory="photo-video"
                  onClear={photoVideoSearch.clearSelection}
                  icon="camera"
                />
              )}
              <VendorSuggestions
                suggestions={photoVideoSearch.suggestions}
                isLoading={photoVideoSearch.isLoading}
                onSelect={photoVideoSearch.onSelectVendor}
                onViewProfile={(v) => navigation.navigate('VendorDetail', {
                  vendorId: v.id,
                  vendorName: v.businessName,
                  vendorDescription: v.description || '',
                  vendorLocation: v.location || '',
                  vendorPriceRange: v.priceRange || '',
                  vendorCategory: 'photo-video',
                })}
                icon="camera"
              />
            </View>

            <Button onPress={handleFindProvider} style={styles.findButton}>
              Finn foto & video
            </Button>
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
  dualIconContainer: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  dualIconLarge: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
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
});
