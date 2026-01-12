import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInLeft } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getSchedule, getWeddingDetails } from "@/lib/storage";
import { ScheduleEvent } from "@/lib/types";

const ICON_MAP: Record<string, keyof typeof Feather.glyphMap> = {
  heart: "heart",
  camera: "camera",
  music: "music",
  users: "users",
  coffee: "coffee",
  sun: "sun",
  moon: "moon",
  star: "star",
};

export default function TimelineScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [schedule, setSchedule] = useState<ScheduleEvent[]>([]);
  const [weddingDate, setWeddingDate] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    const [scheduleData, weddingData] = await Promise.all([
      getSchedule(),
      getWeddingDetails(),
    ]);
    setSchedule(scheduleData.sort((a, b) => a.time.localeCompare(b.time)));
    if (weddingData) {
      setWeddingDate(weddingData.weddingDate);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getTimeDiff = (time1: string, time2: string): number => {
    const [h1, m1] = time1.split(":").map(Number);
    const [h2, m2] = time2.split(":").map(Number);
    return (h2 * 60 + m2) - (h1 * 60 + m1);
  };

  const getBufferStatus = (diff: number): { color: string; label: string; icon: keyof typeof Feather.glyphMap } => {
    if (diff < 15) return { color: theme.error, label: "For kort buffer!", icon: "alert-triangle" };
    if (diff < 30) return { color: "#FFB74D", label: "Stram tidslinje", icon: "clock" };
    return { color: theme.success, label: "God buffer", icon: "check-circle" };
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("nb-NO", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}>
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
    >
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View style={[styles.headerCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <Feather name="calendar" size={24} color={Colors.dark.accent} />
          <ThemedText type="h2" style={styles.headerTitle}>Bryllupsdagen</ThemedText>
          <ThemedText style={[styles.headerDate, { color: theme.textSecondary }]}>
            {formatDate(weddingDate)}
          </ThemedText>
        </View>
      </Animated.View>

      <View style={styles.timeline}>
        {schedule.map((event, index) => {
          const nextEvent = schedule[index + 1];
          const timeDiff = nextEvent ? getTimeDiff(event.time, nextEvent.time) : 0;
          const bufferStatus = nextEvent ? getBufferStatus(timeDiff) : null;

          return (
            <Animated.View key={event.id} entering={FadeInLeft.delay(200 + index * 100).duration(400)}>
              <View style={styles.timelineItem}>
                <View style={styles.timeColumn}>
                  <ThemedText style={[styles.time, { color: Colors.dark.accent }]}>
                    {event.time}
                  </ThemedText>
                </View>

                <View style={styles.dotColumn}>
                  <View style={[styles.dot, { backgroundColor: Colors.dark.accent }]}>
                    <Feather name={ICON_MAP[event.icon] || "circle"} size={12} color="#1A1A1A" />
                  </View>
                  {index < schedule.length - 1 ? (
                    <View style={[styles.line, { backgroundColor: theme.border }]} />
                  ) : null}
                </View>

                <View style={[styles.eventCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                  <ThemedText style={styles.eventTitle}>{event.title}</ThemedText>
                  {nextEvent ? (
                    <ThemedText style={[styles.duration, { color: theme.textSecondary }]}>
                      {timeDiff} min til neste
                    </ThemedText>
                  ) : null}
                </View>
              </View>

              {bufferStatus && timeDiff < 30 ? (
                <View style={styles.bufferWarning}>
                  <View style={styles.bufferSpacer} />
                  <View style={[styles.bufferCard, { backgroundColor: bufferStatus.color + "20", borderColor: bufferStatus.color }]}>
                    <Feather name={bufferStatus.icon} size={14} color={bufferStatus.color} />
                    <ThemedText style={[styles.bufferText, { color: bufferStatus.color }]}>
                      {bufferStatus.label}
                    </ThemedText>
                  </View>
                </View>
              ) : null}
            </Animated.View>
          );
        })}
      </View>

      {schedule.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="calendar" size={48} color={theme.textMuted} />
          <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
            Ingen hendelser i kjøreplanen
          </ThemedText>
        </View>
      ) : null}

      <Animated.View entering={FadeInDown.delay(600).duration(400)}>
        <View style={[styles.tipsCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText type="h4" style={styles.tipsTitle}>Buffer-tips</ThemedText>
          <View style={styles.tipRow}>
            <View style={[styles.tipDot, { backgroundColor: theme.success }]} />
            <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>
              30+ min: Ideell buffer
            </ThemedText>
          </View>
          <View style={styles.tipRow}>
            <View style={[styles.tipDot, { backgroundColor: "#FFB74D" }]} />
            <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>
              15-30 min: Stram, men ok
            </ThemedText>
          </View>
          <View style={styles.tipRow}>
            <View style={[styles.tipDot, { backgroundColor: theme.error }]} />
            <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>
              Under 15 min: Risikabelt
            </ThemedText>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: "center", alignItems: "center" },
  headerCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  headerTitle: { marginTop: Spacing.sm, textAlign: "center" },
  headerDate: { marginTop: Spacing.xs, fontSize: 14 },
  timeline: { marginBottom: Spacing.xl },
  timelineItem: { flexDirection: "row", marginBottom: Spacing.sm },
  timeColumn: { width: 50, alignItems: "flex-end", paddingRight: Spacing.md },
  time: { fontSize: 14, fontWeight: "600" },
  dotColumn: { alignItems: "center", width: 30 },
  dot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  line: { width: 2, flex: 1, marginTop: -2 },
  eventCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginLeft: Spacing.sm,
  },
  eventTitle: { fontSize: 15, fontWeight: "500" },
  duration: { fontSize: 12, marginTop: 2 },
  bufferWarning: { flexDirection: "row", marginBottom: Spacing.sm, marginTop: -Spacing.xs },
  bufferSpacer: { width: 80 },
  bufferCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginLeft: Spacing.sm,
  },
  bufferText: { fontSize: 12, marginLeft: Spacing.xs, fontWeight: "500" },
  emptyState: { alignItems: "center", paddingVertical: Spacing["5xl"] },
  emptyText: { fontSize: 16, marginTop: Spacing.lg },
  tipsCard: { padding: Spacing.lg, borderRadius: BorderRadius.md, borderWidth: 1 },
  tipsTitle: { marginBottom: Spacing.md },
  tipRow: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.sm },
  tipDot: { width: 12, height: 12, borderRadius: 6, marginRight: Spacing.sm },
  tipText: { fontSize: 13 },
});
