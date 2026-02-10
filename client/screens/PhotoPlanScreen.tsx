import React, { useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInRight, FadeIn } from "react-native-reanimated";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SwipeableRow } from "@/components/SwipeableRow";
import { useTheme } from "@/hooks/useTheme";
import { usePhotoLocationScouting, type LocationSearchResult } from "@/hooks/usePhotoLocationScouting";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import {
  getPhotoShots,
  createPhotoShot,
  updatePhotoShot,
  deletePhotoShot,
  seedDefaultPhotoShots,
  getVendorPlannedShots,
  PhotoShot,
} from "@/lib/api-couple-data";

const CATEGORY_LABELS: Record<string, string> = {
  ceremony: "Seremoni",
  portraits: "Portretter",
  group: "Gruppebilde",
  details: "Detaljer",
  reception: "Mottakelse",
};

const CATEGORY_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  ceremony: "heart",
  portraits: "user",
  group: "users",
  details: "eye",
  reception: "music",
};

export default function PhotoPlanScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  // Query for photo shots
  const { data: shotsData, isLoading: loading, refetch } = useQuery({
    queryKey: ["photo-shots"],
    queryFn: async () => {
      const shots = await getPhotoShots();
      // If no shots exist, seed with defaults
      if (shots.length === 0) {
        await seedDefaultPhotoShots();
        return getPhotoShots();
      }
      return shots;
    },
  });

  const shots = shotsData ?? [];

  // Query for vendor-planned shots (pushed from CreatorHub)
  const { data: vendorShotsData } = useQuery({
    queryKey: ["vendor-planned-shots"],
    queryFn: getVendorPlannedShots,
  });

  const vendorShots = vendorShotsData?.vendorShots ?? [];

  // Refresh handler
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createPhotoShot,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["photo-shots"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PhotoShot> }) => updatePhotoShot(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["photo-shots"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deletePhotoShot,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["photo-shots"] }),
  });

  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PhotoShot["category"]>("portraits");
  const [editingShot, setEditingShot] = useState<PhotoShot | null>(null);

  // ── Location Scouting Intelligence ──
  const scouting = usePhotoLocationScouting();
  const [locationSearch, setLocationSearch] = useState("");
  const [locationResults, setLocationResults] = useState<LocationSearchResult[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{
    locationName: string;
    locationLat: number;
    locationLng: number;
    locationNotes?: string;
    weatherTip?: string;
    travelFromVenue?: string;
    scouted: boolean;
  } | null>(null);

  const handleLocationSearch = useCallback(async (query: string) => {
    setLocationSearch(query);
    if (query.length < 2) {
      setLocationResults([]);
      return;
    }
    setIsSearchingLocation(true);
    try {
      const results = await scouting.searchLocation(query);
      setLocationResults(results);
    } catch {
      setLocationResults([]);
    } finally {
      setIsSearchingLocation(false);
    }
  }, [scouting]);

  const handleSelectLocation = useCallback(async (result: LocationSearchResult) => {
    setIsSearchingLocation(true);
    try {
      const locData = await scouting.resolveLocationForShot(result);
      setSelectedLocation(locData);
      setLocationSearch(locData.locationName);
      setLocationResults([]);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      Alert.alert("Feil", "Kunne ikke hente stedsinformasjon");
    } finally {
      setIsSearchingLocation(false);
    }
  }, [scouting]);

  const clearLocationSelection = useCallback(() => {
    setSelectedLocation(null);
    setLocationSearch("");
    setLocationResults([]);
  }, []);

  const completedCount = shots.filter((s) => s.completed).length;
  const progress = shots.length > 0 ? (completedCount / shots.length) * 100 : 0;

  const handleToggleComplete = async (id: string) => {
    const shot = shots.find((s) => s.id === id);
    if (shot) {
      await updateMutation.mutateAsync({ id, data: { completed: !shot.completed } });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handleAddShot = async () => {
    if (!newTitle.trim()) {
      Alert.alert("Feil", "Vennligst skriv inn en tittel");
      return;
    }

    try {
      if (editingShot) {
        await updateMutation.mutateAsync({
          id: editingShot.id,
          data: {
            title: newTitle.trim(),
            description: newDescription.trim() || undefined,
            category: selectedCategory,
            // Location scouting data
            ...(selectedLocation ? {
              locationName: selectedLocation.locationName,
              locationLat: selectedLocation.locationLat,
              locationLng: selectedLocation.locationLng,
              locationNotes: selectedLocation.locationNotes,
              weatherTip: selectedLocation.weatherTip,
              travelFromVenue: selectedLocation.travelFromVenue,
              scouted: selectedLocation.scouted,
            } : {}),
          },
        });
      } else {
        await createMutation.mutateAsync({
          title: newTitle.trim(),
          description: newDescription.trim() || undefined,
          completed: false,
          category: selectedCategory,
          // Location scouting data
          ...(selectedLocation ? {
            locationName: selectedLocation.locationName,
            locationLat: selectedLocation.locationLat,
            locationLng: selectedLocation.locationLng,
            locationNotes: selectedLocation.locationNotes,
            weatherTip: selectedLocation.weatherTip,
            travelFromVenue: selectedLocation.travelFromVenue,
            scouted: selectedLocation.scouted,
          } : {}),
        });
      }

      setNewTitle("");
      setNewDescription("");
      setEditingShot(null);
      setShowForm(false);
      clearLocationSelection();
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Feil", "Kunne ikke lagre bildet");
    }
  };

  const handleEditShot = (shot: PhotoShot) => {
    setEditingShot(shot);
    setNewTitle(shot.title);
    setNewDescription(shot.description || "");
    setSelectedCategory(shot.category);
    // Pre-fill location data if shot has scouting info
    if (shot.locationLat && shot.locationLng) {
      setSelectedLocation({
        locationName: shot.locationName || '',
        locationLat: shot.locationLat,
        locationLng: shot.locationLng,
        locationNotes: shot.locationNotes || undefined,
        weatherTip: shot.weatherTip || undefined,
        travelFromVenue: shot.travelFromVenue || undefined,
        scouted: shot.scouted || false,
      });
      setLocationSearch(shot.locationName || '');
    } else {
      clearLocationSelection();
    }
    setShowForm(true);
  };

  const handleDeleteShot = async (id: string) => {
    Alert.alert("Slett bilde", "Er du sikker på at du vil slette dette bildet?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Slett",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(id);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch (e) {
            Alert.alert("Feil", "Kunne ikke slette bildet");
          }
        },
      },
    ]);
  };

  const groupedShots = shots.reduce((acc, shot) => {
    if (!acc[shot.category]) {
      acc[shot.category] = [];
    }
    acc[shot.category].push(shot);
    return acc;
  }, {} as Record<string, PhotoShot[]>);

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.backgroundRoot },
        ]}
      >
        <ThemedText style={{ color: theme.textSecondary }}>Laster...</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.accent} />}
    >
      <View style={[styles.progressCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.progressHeader}>
          <ThemedText type="h3">Fremgang</ThemedText>
          <ThemedText style={[styles.progressText, { color: Colors.dark.accent }]}>
            {completedCount}/{shots.length}
          </ThemedText>
        </View>
        <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: Colors.dark.accent, width: `${progress}%` },
            ]}
          />
        </View>
      </View>

      {/* Location Scouting Stats */}
      {scouting.locatedCount(shots) > 0 && (
        <Animated.View entering={FadeIn.duration(400)} style={[styles.scoutingStats, { backgroundColor: theme.backgroundDefault, borderColor: Colors.dark.accent + '40' }]}>
          <View style={styles.scoutingStatsRow}>
            <View style={styles.scoutingStat}>
              <Feather name="map-pin" size={14} color={Colors.dark.accent} />
              <ThemedText style={[styles.scoutingStatText, { color: theme.text }]}>
                {scouting.locatedCount(shots)} steder
              </ThemedText>
            </View>
            <View style={styles.scoutingStat}>
              <Feather name="check-circle" size={14} color="#4CAF50" />
              <ThemedText style={[styles.scoutingStatText, { color: theme.text }]}>
                {scouting.scoutedCount(shots)} befart
              </ThemedText>
            </View>
            {scouting.venueName && (
              <View style={styles.scoutingStat}>
                <ThemedText style={styles.scoutingStatText}>
                  {scouting.venueWeatherEmoji} {scouting.venueTemperature !== null ? `${scouting.venueTemperature}°` : ''}
                </ThemedText>
              </View>
            )}
          </View>
        </Animated.View>
      )}

      <ThemedText style={[styles.swipeHint, { color: theme.textMuted }]}>
        Sveip til venstre for å endre eller slette
      </ThemedText>

      {Object.entries(groupedShots).map(([category, categoryShots]) => (
        <View key={category} style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIcon, { backgroundColor: theme.backgroundDefault }]}>
              <Feather
                name={CATEGORY_ICONS[category as PhotoShot["category"]]}
                size={16}
                color={Colors.dark.accent}
              />
            </View>
            <ThemedText type="h4">{CATEGORY_LABELS[category as PhotoShot["category"]]}</ThemedText>
          </View>

          <View style={styles.shotsList}>
            {categoryShots.map((shot, index) => (
              <Animated.View
                key={shot.id}
                entering={FadeInRight.delay(index * 50).duration(300)}
              >
                <SwipeableRow
                  onEdit={() => handleEditShot(shot)}
                  onDelete={() => handleDeleteShot(shot.id)}
                  backgroundColor={theme.backgroundDefault}
                >
                  <Pressable
                    onPress={() => handleToggleComplete(shot.id)}
                    style={[
                      styles.shotItem,
                      {
                        backgroundColor: theme.backgroundDefault,
                        borderColor: theme.border,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.checkbox,
                        {
                          backgroundColor: shot.completed
                            ? Colors.dark.accent
                            : "transparent",
                          borderColor: shot.completed
                            ? Colors.dark.accent
                            : theme.border,
                        },
                      ]}
                    >
                      {shot.completed ? (
                        <Feather name="check" size={14} color="#1A1A1A" />
                      ) : null}
                    </View>
                    <View style={styles.shotInfo}>
                      <ThemedText
                        style={[
                          styles.shotTitle,
                          shot.completed && styles.shotTitleCompleted,
                        ]}
                      >
                        {shot.title}
                      </ThemedText>
                      {shot.description ? (
                        <ThemedText
                          style={[styles.shotDescription, { color: theme.textSecondary }]}
                        >
                          {shot.description}
                        </ThemedText>
                      ) : null}
                      {/* Location scouting badges */}
                      {(shot.locationName || shot.travelFromVenue || shot.weatherTip) && (
                        <View style={styles.locationBadges}>
                          {shot.locationName && (
                            <Pressable
                              onPress={() => scouting.openShotOnMap(shot)}
                              style={[styles.locationBadge, { backgroundColor: Colors.dark.accent + '15' }]}
                            >
                              <Feather name="map-pin" size={10} color={Colors.dark.accent} />
                              <ThemedText style={[styles.locationBadgeText, { color: Colors.dark.accent }]} numberOfLines={1}>
                                {shot.locationName}
                              </ThemedText>
                            </Pressable>
                          )}
                          {shot.travelFromVenue && (
                            <Pressable
                              onPress={() => scouting.openDirectionsToShot(shot)}
                              style={[styles.locationBadge, { backgroundColor: '#2196F3' + '15' }]}
                            >
                              <Feather name="navigation" size={10} color="#2196F3" />
                              <ThemedText style={[styles.locationBadgeText, { color: '#2196F3' }]}>
                                {shot.travelFromVenue}
                              </ThemedText>
                            </Pressable>
                          )}
                          {shot.weatherTip && (
                            <View style={[styles.locationBadge, { backgroundColor: '#FF9800' + '15' }]}>
                              <ThemedText style={[styles.locationBadgeText, { color: '#FF9800' }]} numberOfLines={1}>
                                {shot.weatherTip}
                              </ThemedText>
                            </View>
                          )}
                          {shot.scouted && (
                            <View style={[styles.locationBadge, { backgroundColor: '#4CAF50' + '15' }]}>
                              <Feather name="check-circle" size={10} color="#4CAF50" />
                              <ThemedText style={[styles.locationBadgeText, { color: '#4CAF50' }]}>
                                Befart
                              </ThemedText>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  </Pressable>
                </SwipeableRow>
              </Animated.View>
            ))}
          </View>
        </View>
      ))}

      {/* Vendor-planned shots from photographer (CreatorHub bridge) */}
      {vendorShots.length > 0 && (
        <View style={styles.categorySection}>
          <View style={[styles.vendorBridgeHeader, { backgroundColor: theme.backgroundDefault, borderColor: Colors.dark.accent }]}>
            <View style={styles.categoryHeader}>
              <View style={[styles.categoryIcon, { backgroundColor: Colors.dark.accent + '20' }]}>
                <Feather name="camera" size={16} color={Colors.dark.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="h4">Fotografens plan</ThemedText>
                <ThemedText style={[styles.shotDescription, { color: theme.textSecondary }]}>
                  {vendorShots.length} bilder planlagt av fotografen din
                </ThemedText>
              </View>
            </View>
          </View>

          <View style={styles.shotsList}>
            {vendorShots.map((shot, index) => (
              <Animated.View
                key={shot.id}
                entering={FadeInRight.delay(index * 50).duration(300)}
              >
                <View
                  style={[
                    styles.shotItem,
                    {
                      backgroundColor: theme.backgroundDefault,
                      borderColor: Colors.dark.accent + '40',
                      borderLeftWidth: 3,
                      borderLeftColor: Colors.dark.accent,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: shot.completed ? Colors.dark.accent : 'transparent',
                        borderColor: shot.completed ? Colors.dark.accent : theme.border,
                      },
                    ]}
                  >
                    {shot.completed ? (
                      <Feather name="check" size={14} color="#1A1A1A" />
                    ) : (
                      <Feather name="camera" size={10} color={Colors.dark.accent} />
                    )}
                  </View>
                  <View style={styles.shotInfo}>
                    <ThemedText
                      style={[
                        styles.shotTitle,
                        shot.completed && styles.shotTitleCompleted,
                      ]}
                    >
                      {shot.title}
                    </ThemedText>
                    {shot.description ? (
                      <ThemedText
                        style={[styles.shotDescription, { color: theme.textSecondary }]}
                      >
                        {shot.description}
                      </ThemedText>
                    ) : null}
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        </View>
      )}

      {showForm ? (
        <Animated.View
          style={[
            styles.formCard,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
        >
          <ThemedText type="h3" style={styles.formTitle}>
            {editingShot ? "Endre bilde" : "Legg til bilde"}
          </ThemedText>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="F.eks. Brudeparet ved sjøen"
            placeholderTextColor={theme.textMuted}
            value={newTitle}
            onChangeText={setNewTitle}
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="F.eks. Ved solnedgang, romantisk stemning"
            placeholderTextColor={theme.textMuted}
            value={newDescription}
            onChangeText={setNewDescription}
          />

          {/* ── Location Scouting Search ── */}
          <View style={styles.locationSection}>
            <View style={styles.locationSearchRow}>
              <Feather name="map-pin" size={16} color={Colors.dark.accent} style={{ marginRight: Spacing.sm }} />
              <ThemedText style={[styles.locationLabel, { color: theme.text }]}>Sted (valgfritt)</ThemedText>
            </View>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                    borderColor: selectedLocation ? Colors.dark.accent : theme.border,
                  },
                ]}
                placeholder="Søk adresse eller stedsnavn..."
                placeholderTextColor={theme.textMuted}
                value={locationSearch}
                onChangeText={handleLocationSearch}
              />
              {isSearchingLocation && (
                <ActivityIndicator size="small" color={Colors.dark.accent} style={styles.locationSpinner} />
              )}
            </View>

            {/* Location search results dropdown */}
            {locationResults.length > 0 && (
              <View style={[styles.locationDropdown, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                {locationResults.slice(0, 5).map((result, idx) => (
                  <Pressable
                    key={idx}
                    onPress={() => handleSelectLocation(result)}
                    style={[styles.locationDropdownItem, idx < locationResults.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }]}
                  >
                    <Feather name="map-pin" size={12} color={theme.textSecondary} />
                    <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                      <ThemedText style={[styles.locationResultText, { color: theme.text }]} numberOfLines={1}>
                        {result.address}
                      </ThemedText>
                      <ThemedText style={[styles.locationResultSub, { color: theme.textMuted }]}>
                        {result.municipality}, {result.county}
                      </ThemedText>
                    </View>
                  </Pressable>
                ))}
              </View>
            )}

            {/* Selected location preview */}
            {selectedLocation && (
              <Animated.View entering={FadeIn.duration(300)} style={[styles.locationPreview, { backgroundColor: Colors.dark.accent + '10', borderColor: Colors.dark.accent + '30' }]}>
                <View style={styles.locationPreviewRow}>
                  <Feather name="check-circle" size={14} color="#4CAF50" />
                  <ThemedText style={[styles.locationPreviewText, { color: theme.text }]} numberOfLines={1}>
                    {selectedLocation.locationName}
                  </ThemedText>
                  <Pressable onPress={clearLocationSelection}>
                    <Feather name="x" size={16} color={theme.textMuted} />
                  </Pressable>
                </View>
                {selectedLocation.travelFromVenue ? (
                  <View style={styles.locationPreviewRow}>
                    <Feather name="navigation" size={12} color="#2196F3" />
                    <ThemedText style={[styles.locationPreviewSub, { color: '#2196F3' }]}>
                      Fra bryllupssted: {selectedLocation.travelFromVenue}
                    </ThemedText>
                  </View>
                ) : null}
                {selectedLocation.weatherTip ? (
                  <ThemedText style={[styles.locationPreviewSub, { color: '#FF9800' }]}>
                    {selectedLocation.weatherTip}
                  </ThemedText>
                ) : null}
              </Animated.View>
            )}
          </View>

          <ThemedText style={[styles.helpText, { color: theme.textMuted }]}>
            Velg kategori under for Foto & Video Tidsplan
          </ThemedText>

          <View style={styles.categoryPicker}>
            {(Object.keys(CATEGORY_LABELS) as PhotoShot["category"][]).map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryOption,
                  {
                    backgroundColor:
                      selectedCategory === cat
                        ? Colors.dark.accent
                        : theme.backgroundSecondary,
                  },
                ]}
              >
                <Feather
                  name={CATEGORY_ICONS[cat]}
                  size={14}
                  color={selectedCategory === cat ? "#1A1A1A" : theme.textSecondary}
                />
              </Pressable>
            ))}
          </View>

          <View style={styles.formButtons}>
            <Pressable
              onPress={() => {
                setShowForm(false);
                setEditingShot(null);
                setNewTitle("");
                setNewDescription("");
                setSelectedCategory("portraits");
                clearLocationSelection();
              }}
              style={[styles.cancelButton, { borderColor: theme.border }]}
            >
              <ThemedText style={{ color: theme.textSecondary }}>Avbryt</ThemedText>
            </Pressable>
            <Button onPress={handleAddShot} style={styles.saveButton}>
              {editingShot ? "Oppdater" : "Lagre"}
            </Button>
          </View>
        </Animated.View>
      ) : (
        <Pressable
          onPress={() => {
            setShowForm(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={[styles.addButton, { borderColor: Colors.dark.accent }]}
        >
          <Feather name="plus" size={20} color={Colors.dark.accent} />
          <ThemedText style={[styles.addButtonText, { color: Colors.dark.accent }]}>
            Legg til bilde
          </ThemedText>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  progressCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  progressText: {
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
  swipeHint: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  categorySection: {
    marginBottom: Spacing.xl,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  shotsList: {
    gap: Spacing.sm,
  },
  shotItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  shotInfo: {
    flex: 1,
  },
  shotTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  shotTitleCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  shotDescription: {
    fontSize: 13,
    marginTop: 2,
  },
  formCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.lg,
  },
  formTitle: {
    marginBottom: Spacing.lg,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  helpText: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  categoryPicker: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  categoryOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  formButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  saveButton: {
    flex: 1,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addButtonText: {
    marginLeft: Spacing.sm,
    fontWeight: "500",
  },
  vendorBridgeHeader: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  // ── Location Scouting Styles ──
  scoutingStats: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  scoutingStatsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
  },
  scoutingStat: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  scoutingStatText: {
    fontSize: 13,
    fontWeight: "500",
  },
  locationBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 6,
  },
  locationBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 3,
  },
  locationBadgeText: {
    fontSize: 11,
    fontWeight: "500",
    maxWidth: 120,
  },
  locationSection: {
    marginBottom: Spacing.md,
  },
  locationSearchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  locationLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  locationSpinner: {
    position: "absolute",
    right: 12,
    top: 14,
  },
  locationDropdown: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    marginTop: -Spacing.sm,
    marginBottom: Spacing.sm,
    maxHeight: 200,
    overflow: "hidden",
  },
  locationDropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
  },
  locationResultText: {
    fontSize: 14,
  },
  locationResultSub: {
    fontSize: 12,
    marginTop: 1,
  },
  locationPreview: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: Spacing.sm,
    gap: 6,
  },
  locationPreviewRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  locationPreviewText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  locationPreviewSub: {
    fontSize: 12,
    marginLeft: 20,
  },
});
