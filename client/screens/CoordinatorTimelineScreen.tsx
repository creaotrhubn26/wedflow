import React, { useEffect, useState, useCallback } from "react";
import { View, StyleSheet, TextInput, FlatList, Platform, TouchableOpacity, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EvendiIcon, EvendiIconGlyphMap, type EvendiIconName } from "@/components/EvendiIcon";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getCoordinatorCoupleProfile, getCoordinatorSchedule, exchangeCoordinatorCode, getCoordinatorSeating } from "@/lib/api-coordinator";
import { getSpeeches } from "@/lib/storage";
import { Speech } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { SeatingChart, Table } from "@/components/SeatingChart";
import { showToast } from "@/lib/toast";


interface ScheduleEvent {
  id: string;
  time: string;
  title: string;
  icon?: EvendiIconName;
  location?: string;
  notes?: string;
}

export default function CoordinatorTimelineScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();

  const [code, setCode] = useState("");
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [weddingDate, setWeddingDate] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [activeTab, setActiveTab] = useState<'timeline' | 'speeches' | 'seating'>('timeline');
  const [seatingData, setSeatingData] = useState<{ tables: Table[]; guests?: any[] }>({ tables: [], guests: [] });

  // Subscribe to speeches for real-time updates
  const speechesQuery = useQuery<Speech[]>({
    queryKey: ['speeches'],
    queryFn: async () => {
      const data = await getSpeeches();
      return Array.isArray(data) ? data : [];
    },
  });

  useEffect(() => {
    if (speechesQuery.data) {
      setSpeeches(speechesQuery.data);
    }
  }, [speechesQuery.data]);

  // Normalize access code (remove spaces and hyphens)
  const normalizeCode = useCallback((code: string): string => {
    return code.replace(/[\s-]/g, "").toUpperCase();
  }, []);

  // Format date with fallback
  const formatDate = useCallback((dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; // Fallback to raw string
      return date.toLocaleDateString("nb-NO", { 
        weekday: "long", 
        day: "numeric", 
        month: "long", 
        year: "numeric" 
      });
    } catch {
      return dateStr; // Fallback on error
    }
  }, []);

  // Sort events by time
  const sortEventsByTime = useCallback((events: ScheduleEvent[]): ScheduleEvent[] => {
    return [...events].sort((a, b) => {
      const timeA = a.time.replace(":", "");
      const timeB = b.time.replace(":", "");
      return timeA.localeCompare(timeB);
    });
  }, []);

  // Load profile and schedule with token
  const loadScheduleData = useCallback(async (token: string) => {
    setLoadingSchedule(true);
    setError(null);
    try {
      const [profile, schedule, seating] = await Promise.all([
        getCoordinatorCoupleProfile(token),
        getCoordinatorSchedule(token),
        getCoordinatorSeating(token),
      ]);
      setWeddingDate(profile.weddingDate || null);
      setDisplayName(profile.displayName || null);
      // Map to local interface with type safety
      const mappedEvents: ScheduleEvent[] = schedule.map((evt) => ({
        ...evt,
        icon: (evt.icon as string) || undefined,
      }));
      setEvents(sortEventsByTime(mappedEvents));
      setSeatingData(seating || { tables: [], guests: [] });
    } catch (err) {
      const errorMsg = (err as Error).message || "Kunne ikke hente program";
      setError(errorMsg);
      showToast(errorMsg);
    } finally {
      setLoadingSchedule(false);
    }
  }, [sortEventsByTime]);

  // Web deep link: /coordinator/<token>
  useEffect(() => {
    if (Platform.OS === "web") {
      const path = window.location.pathname;
      // More tolerant regex - matches tokens with letters, numbers, dots, underscores, hyphens
      const match = path.match(/\/coordinator\/([A-Za-z0-9._-]+)/i);
      if (match && match[1]) {
        const token = match[1];
        setAccessToken(token);
        loadScheduleData(token);
      }
    }
  }, [loadScheduleData]);

  const handleExchange = async () => {
    if (!code.trim()) {
      showToast("Angi tilgangskode");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const normalizedCode = normalizeCode(code);
      const { token } = await exchangeCoordinatorCode(normalizedCode);
      setAccessToken(token);
      await loadScheduleData(token);
    } catch (err) {
      const errorMsg = (err as Error).message || "Kunne ikke hente program";
      setError(errorMsg);
      showToast(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }: { item: ScheduleEvent; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <View style={[styles.timelineItem]}>
        <View style={styles.timeColumn}>
          <ThemedText style={[styles.time, { color: theme.accent }]}>{item.time}</ThemedText>
        </View>
        <View style={styles.dotColumn}>
          <View style={[styles.dot, { backgroundColor: theme.accent }]}>
            <EvendiIcon name={item.icon || "circle"} size={12} color="#FFFFFF" />
          </View>
          <View style={[styles.line, { backgroundColor: theme.border }]} />
        </View>
        <View style={[styles.eventCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.eventTitle}>{item.title}</ThemedText>
          {item.location && (
            <View style={styles.eventDetailRow}>
              <EvendiIcon name="map-pin" size={12} color={theme.textMuted} />
              <ThemedText style={[styles.eventDetail, { color: theme.textMuted }]}>
                {item.location}
              </ThemedText>
            </View>
          )}
          {item.notes && (
            <View style={styles.eventDetailRow}>
              <EvendiIcon name="file-text" size={12} color={theme.textMuted} />
              <ThemedText style={[styles.eventDetail, { color: theme.textMuted }]}>
                {item.notes}
              </ThemedText>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );

  const renderEmpty = () => (
    <View style={[styles.emptyCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
      <EvendiIcon name="calendar" size={32} color={theme.textMuted} />
      <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
        Programmet er ikke lagt inn ennå
      </ThemedText>
      <ThemedText style={[styles.emptySubtitle, { color: theme.textMuted }]}>
        Kontakt brudeparet eller fotografen for å få tilgang til tidslinje.
      </ThemedText>
    </View>
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={styles.skeletonItem}>
          <View style={[styles.skeletonTime, { backgroundColor: theme.backgroundSecondary }]} />
          <View style={[styles.skeletonDot, { backgroundColor: theme.accent + "40" }]} />
          <View style={[styles.skeletonCard, { backgroundColor: theme.backgroundSecondary }]} />
        </View>
      ))}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingBottom: insets.bottom + Spacing.lg }] }>
      <View style={[styles.headerCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }] }>
        <EvendiIcon name="calendar" size={20} color={theme.accent} />
        <ThemedText style={styles.headerTitle}>Toastmaster – oversikt</ThemedText>
        {displayName ? (
          <ThemedText style={[styles.headerName, { color: theme.text }] }>{displayName}</ThemedText>
        ) : null}
        <ThemedText style={[styles.headerDate, { color: theme.textSecondary }]}>{formatDate(weddingDate)}</ThemedText>
      </View>

      {!accessToken ? (
        <View style={[styles.accessCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={[styles.accessLabel, { color: theme.textSecondary }]}>Tilgangskode</ThemedText>
          <TextInput
            value={code}
            onChangeText={setCode}
            placeholder="Angi kode"
            placeholderTextColor={theme.textMuted}
            style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundSecondary }]}
            autoCapitalize="characters"
            returnKeyType="go"
            onSubmitEditing={handleExchange}
          />
          <Button onPress={handleExchange} disabled={loading}>
            {loading ? "Laster..." : "Hent program"}
          </Button>
          {error && (
            <View style={styles.errorContainer}>
              <EvendiIcon name="alert-circle" size={16} color="#FF3B30" />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}
        </View>
      ) : null}

      {accessToken && (
        <>
          {/* Tab Navigation */}
          <View style={[styles.tabContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'timeline' && { borderBottomColor: theme.accent, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab('timeline')}
            >
              <EvendiIcon name="calendar" size={18} color={activeTab === 'timeline' ? theme.accent : theme.textSecondary} />
              <ThemedText style={[styles.tabText, { color: activeTab === 'timeline' ? theme.accent : theme.textSecondary }]}>
                Tidslinje
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'speeches' && { borderBottomColor: theme.accent, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab('speeches')}
            >
              <EvendiIcon name="mic" size={18} color={activeTab === 'speeches' ? theme.accent : theme.textSecondary} />
              <ThemedText style={[styles.tabText, { color: activeTab === 'speeches' ? theme.accent : theme.textSecondary }]}>
                Taler ({speeches.length})
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'seating' && { borderBottomColor: theme.accent, borderBottomWidth: 2 }]}
              onPress={() => setActiveTab('seating')}
            >
              <EvendiIcon name="users" size={18} color={activeTab === 'seating' ? theme.accent : theme.textSecondary} />
              <ThemedText style={[styles.tabText, { color: activeTab === 'seating' ? theme.accent : theme.textSecondary }]}>
                Bordplan
              </ThemedText>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {loadingSchedule ? (
            renderSkeleton()
          ) : activeTab === 'timeline' ? (
            events.length === 0 ? (
              renderEmpty()
            ) : (
              <FlatList
                data={events}
                keyExtractor={(e) => e.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingHorizontal: Spacing.lg }}
              />
            )
          ) : activeTab === 'speeches' ? (
            <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing.lg }}>
              {speeches.length > 0 ? (
                <View style={[styles.speechListCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                  <View style={styles.speechHeader}>
                    <EvendiIcon name="mic" size={18} color={theme.accent} />
                    <ThemedText style={styles.speechTitle}>Taler ({speeches.length})</ThemedText>
                  </View>
                  <ThemedText style={[styles.speechSubtext, { color: theme.textSecondary }]}>
                    Pause/senk musikken når taler starter
                  </ThemedText>
                  {speeches.sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59')).map((speech) => {
                    const statusColor = speech.status === 'speaking' ? '#f59e0b' : speech.status === 'done' ? '#22c55e' : '#9ca3af';
                    const statusText = speech.status === 'speaking' ? '🔴 NÅ' : speech.status === 'done' ? 'Ferdig' : 'Klar';
                    const tableName = seatingData.tables.find(t => t.id === speech.tableId)?.name || null;
                    return (
                      <View
                        key={speech.id}
                        style={[
                          styles.speechRow,
                          {
                            borderLeftColor: statusColor,
                            backgroundColor: speech.status === 'speaking' ? '#f59e0b10' : 'transparent',
                          },
                        ]}
                      >
                        <View style={styles.speechTimeCol}>
                          <ThemedText style={[styles.speechTime, { color: theme.accent }]}>
                            {speech.time || 'TBA'}
                          </ThemedText>
                        </View>
                        <View style={styles.speechInfoCol}>
                          <ThemedText style={styles.speechName}>{speech.speakerName}</ThemedText>
                          <ThemedText style={[styles.speechRole, { color: theme.textSecondary }]}>
                            {speech.role}
                          </ThemedText>
                          {tableName && (
                            <View style={styles.tableInfo}>
                              <EvendiIcon name="users" size={10} color={theme.textMuted} />
                              <ThemedText style={[styles.tableName, { color: theme.textMuted }]}>
                                {tableName}
                              </ThemedText>
                            </View>
                          )}
                        </View>
                        <View style={[styles.speechBadge, { backgroundColor: statusColor + '20' }]}>
                          <ThemedText style={[styles.speechBadgeText, { color: statusColor }]}>
                            {statusText}
                          </ThemedText>
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={[styles.emptyCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                  <EvendiIcon name="mic" size={32} color={theme.textMuted} />
                  <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
                    Ingen taler lagt til
                  </ThemedText>
                </View>
              )}
            </ScrollView>
          ) : activeTab === 'seating' ? (
            <ScrollView contentContainerStyle={{ paddingHorizontal: Spacing.lg }}>
              {seatingData.tables.length > 0 ? (
                <View>
                  <View style={[styles.seatingHeader, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                    <EvendiIcon name="info" size={16} color={theme.accent} />
                    <ThemedText style={[styles.seatingInfo, { color: theme.textSecondary }]}>
                      Oversikt over gjester ved hvert bord. Røde ikoner = talere.
                    </ThemedText>
                  </View>
                  <SeatingChart
                    tables={seatingData.tables}
                    guests={seatingData.guests || []}
                    onTablesChange={() => {}}
                    onGuestsChange={() => {}}
                    editable={false}
                    speeches={speeches}
                  />
                </View>
              ) : (
                <View style={[styles.emptyCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                  <EvendiIcon name="users" size={32} color={theme.textMuted} />
                  <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>
                    Bordplan ikke lagt til
                  </ThemedText>
                </View>
              )}
            </ScrollView>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerCard: { padding: Spacing.lg, borderRadius: BorderRadius.lg, borderWidth: 1, alignItems: "center", margin: Spacing.lg },
  headerTitle: { marginTop: Spacing.xs, fontWeight: "600" },
  headerName: { marginTop: Spacing.xs, fontSize: 16, fontWeight: "600" },
  headerDate: { marginTop: Spacing.xs, fontSize: 14 },
  accessCard: { marginHorizontal: Spacing.lg, padding: Spacing.lg, borderRadius: BorderRadius.md, borderWidth: 1, gap: Spacing.md },
  accessLabel: { fontSize: 12 },
  input: { borderWidth: 1, borderRadius: BorderRadius.sm, padding: Spacing.md },
  errorContainer: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, marginTop: Spacing.xs },
  errorText: { fontSize: 13, color: "#FF3B30", flex: 1 },
  timelineItem: { flexDirection: "row", marginBottom: Spacing.sm },
  timeColumn: { width: 50, alignItems: "flex-end", paddingRight: Spacing.md },
  time: { fontSize: 14, fontWeight: "600" },
  dotColumn: { alignItems: "center", width: 30 },
  dot: { width: 24, height: 24, borderRadius: 12, justifyContent: "center", alignItems: "center", zIndex: 1 },
  line: { width: 2, flex: 1, marginTop: -2 },
  eventCard: { flex: 1, padding: Spacing.md, borderRadius: BorderRadius.sm, borderWidth: 1, marginLeft: Spacing.sm },
  eventTitle: { fontSize: 15, fontWeight: "500" },
  eventDetailRow: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, marginTop: Spacing.xs },
  eventDetail: { fontSize: 13, flex: 1 },
  emptyCard: { 
    marginHorizontal: Spacing.lg, 
    padding: Spacing.xl, 
    borderRadius: BorderRadius.md, 
    borderWidth: 1, 
    alignItems: "center", 
    gap: Spacing.md 
  },
  emptyTitle: { fontSize: 16, fontWeight: "600", textAlign: "center" },
  emptySubtitle: { fontSize: 14, textAlign: "center" },
  skeletonContainer: { paddingHorizontal: Spacing.lg },
  skeletonItem: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.md },
  skeletonTime: { width: 50, height: 18, borderRadius: 4, marginRight: Spacing.md },
  skeletonDot: { width: 24, height: 24, borderRadius: 12, marginRight: Spacing.sm },
  skeletonCard: { flex: 1, height: 60, borderRadius: BorderRadius.sm },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  speechListCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  tableInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  tableName: {
    fontSize: 11,
  },
  seatingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  seatingInfo: {
    flex: 1,
    fontSize: 13,
  },
  speechCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  speechHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  speechTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  speechSubtext: {
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  speechRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderLeftWidth: 3,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  speechTimeCol: {
    width: 50,
    marginRight: Spacing.md,
  },
  speechTime: {
    fontSize: 14,
    fontWeight: '600',
  },
  speechInfoCol: {
    flex: 1,
  },
  speechName: {
    fontSize: 14,
    fontWeight: '500',
  },
  speechRole: {
    fontSize: 12,
    marginTop: 2,
  },
  speechBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  speechBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
