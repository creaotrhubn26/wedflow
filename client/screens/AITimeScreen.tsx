import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { EvendiIcon, EvendiIconGlyphMap, type EvendiIconName } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getSchedule, getPhotoShots } from "@/lib/storage";
import { AITimeSlot, ScheduleEvent } from "@/lib/types";

const PHOTO_TIME_ESTIMATES: Record<string, number> = {
  ceremony: 45,
  portraits: 45,
  group: 30,
  details: 15,
  reception: 30,
};

const CATEGORY_LABELS: Record<string, string> = {
  ceremony: "Seremoni",
  portraits: "Portretter",
  group: "Gruppbilder",
  details: "Detaljer",
  reception: "Mottakelse",
};

const CATEGORY_ICONS: Record<string, keyof typeof EvendiIconGlyphMap> = {
  ceremony: "heart",
  portraits: "user",
  group: "users",
  details: "eye",
  reception: "music",
};


const isIconKey = (value: string): value is keyof typeof CATEGORY_ICONS =>
  Object.prototype.hasOwnProperty.call(CATEGORY_ICONS, value);

export default function AITimeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [timeSlots, setTimeSlots] = useState<AITimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [expandedSlotId, setExpandedSlotId] = useState<string | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});

  const categorizeScheduleEvent = (event: ScheduleEvent): string | null => {
    const title = event.title.toLowerCase();
    const isPhotoOrVideo = event.icon === "camera" || 
      title.includes("foto") || title.includes("bilde") ||
      title.includes("video") || title.includes("film") || title.includes("opptak");
    
    if (isPhotoOrVideo) {
      if (title.includes("gruppe") || title.includes("familie")) return "group";
      if (title.includes("portrett") || title.includes("brudepar")) return "portraits";
      if (title.includes("detalj") || title.includes("ring")) return "details";
      if (title.includes("seremoni") || title.includes("vielse")) return "ceremony";
      if (title.includes("fest") || title.includes("dans") || title.includes("kake")) return "reception";
      return "portraits";
    }
    return null;
  };

  const calculateTimes = useCallback(async () => {
    setCalculating(true);
    
    const [schedule, photoShots] = await Promise.all([
      getSchedule(),
      getPhotoShots(),
    ]);

    const photoCounts: Record<string, number> = {
      ceremony: 0,
      portraits: 0,
      group: 0,
      details: 0,
      reception: 0,
    };

    photoShots.forEach((shot) => {
      if (!shot.completed) {
        photoCounts[shot.category] = (photoCounts[shot.category] || 0) + 1;
      }
    });

    schedule.forEach((event) => {
      const category = categorizeScheduleEvent(event);
      if (category) {
        photoCounts[category] = (photoCounts[category] || 0) + 1;
      }
    });

    const ceremonyEvent = schedule.find((e) => 
      e.title.toLowerCase().includes("vielse") || 
      e.title.toLowerCase().includes("seremoni")
    );
    
    let baseTime = ceremonyEvent ? ceremonyEvent.time : "14:00";
    const [baseHour, baseMinute] = baseTime.split(":").map(Number);
    let currentMinutes = baseHour * 60 + baseMinute;

    const slots: AITimeSlot[] = [];

    Object.entries(photoCounts).forEach(([category, count]) => {
      if (count > 0) {
        const duration = Math.max(15, Math.min(PHOTO_TIME_ESTIMATES[category], count * 5));
        const startHour = Math.floor(currentMinutes / 60);
        const startMin = currentMinutes % 60;
        const endMinutes = currentMinutes + duration;
        const endHour = Math.floor(endMinutes / 60);
        const endMin = endMinutes % 60;

        const slotIcon = isIconKey(category) ? CATEGORY_ICONS[category] : "clock";

        slots.push({
          id: category,
          type: category,
          title: CATEGORY_LABELS[category],
          duration,
          startTime: `${startHour.toString().padStart(2, "0")}:${startMin.toString().padStart(2, "0")}`,
          endTime: `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`,
          icon: slotIcon,
        });

        currentMinutes = endMinutes + 5;
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setTimeSlots(slots);
    setCategoryCounts(photoCounts);
    setCalculating(false);
    setLoading(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  useEffect(() => {
    calculateTimes();
  }, [calculateTimes]);

  const totalDuration = timeSlots.reduce((sum, slot) => sum + slot.duration, 0);

  if (loading && !calculating) {
    return (
      <View
        style={[styles.container, styles.centered, { backgroundColor: theme.backgroundRoot }]}
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
    >
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View style={[styles.headerCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={[styles.aiIcon, { backgroundColor: Colors.dark.accent + "20" }]}>
            <View style={styles.mediaIconContainer}>
              <EvendiIcon name="camera" size={16} color={Colors.dark.accent} />
              <EvendiIcon name="video" size={16} color={Colors.dark.accent} />
            </View>
          </View>
          <ThemedText type="h2" style={styles.title}>Foto & Video Tidsplan</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Foreslåtte tidsrammer basert på fotoplanen og foto/video-hendelser i kjøreplanen.
          </ThemedText>
        </View>
      </Animated.View>

      {calculating ? (
        <Animated.View entering={FadeInUp.duration(400)} style={styles.calculatingContainer}>
          <View style={[styles.pulseCircle, { backgroundColor: Colors.dark.accent + "20" }]}>
            <EvendiIcon name="loader" size={32} color={Colors.dark.accent} />
          </View>
          <ThemedText style={[styles.calculatingText, { color: theme.textSecondary }]}>
            Beregner optimale tidsrammer...
          </ThemedText>
        </Animated.View>
      ) : (
        <>
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <View
              style={[
                styles.summaryCard,
                { backgroundColor: Colors.dark.accent + "10", borderColor: Colors.dark.accent },
              ]}
            >
              <EvendiIcon name="clock" size={20} color={Colors.dark.accent} />
              <View style={styles.summaryContent}>
                <ThemedText style={[styles.summaryLabel, { color: theme.textSecondary }]}> 
                  Total fotograferingstid
                </ThemedText>
                <ThemedText style={[styles.summaryValue, { color: Colors.dark.accent }]}> 
                  {totalDuration} minutter
                </ThemedText>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(300).duration(400)}>
            <View style={styles.slotsContainer}>
              {timeSlots.map((slot) => {
                const slotIcon: EvendiIconName = isIconKey(slot.type)
                  ? CATEGORY_ICONS[slot.type]
                  : "clock";
                return (
                <Pressable
                  key={slot.id}
                  onPress={() => {
                    setExpandedSlotId((prev) => (prev === slot.id ? null : slot.id));
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.slotCard,
                    { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                  ]}
                >
                  <View style={[styles.slotIcon, { backgroundColor: theme.backgroundSecondary }]}> 
                    <EvendiIcon name={slotIcon} size={20} color={Colors.dark.accent} />
                  </View>
                  <View style={styles.slotInfo}>
                    <ThemedText style={styles.slotTitle}>{slot.title}</ThemedText>
                    <ThemedText style={[styles.slotTime, { color: theme.textSecondary }]}> 
                      {slot.startTime} - {slot.endTime}
                    </ThemedText>
                    {expandedSlotId === slot.id && (
                      <ThemedText style={[styles.slotMeta, { color: theme.textMuted }]}> 
                        Basert på {categoryCounts[slot.type] || 0} elementer
                      </ThemedText>
                    )}
                  </View>
                  <View style={styles.durationBadge}>
                    <ThemedText style={[styles.durationText, { color: Colors.dark.success }]}> 
                      {slot.duration} min
                    </ThemedText>
                  </View>
                </Pressable>
                );
              })}
            </View>
          </Animated.View>

          {timeSlots.length === 0 ? (
            <View style={styles.emptyState}>
              <EvendiIcon name="camera-off" size={48} color={theme.textMuted} />
              <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}> 
                Ingen bilder funnet
              </ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: theme.textMuted }]}> 
                Legg til bilder i fotoplanen eller foto-hendelser i kjøreplanen
              </ThemedText>
            </View>
          ) : null}

          <Animated.View entering={FadeInDown.delay(600).duration(400)}>
            <Button
              onPress={() => {
                calculateTimes();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              }}
              style={styles.recalculateButton}
            >
              Beregn på nytt
            </Button>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(700).duration(400)}>
            <View style={[styles.tipsCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
              <ThemedText type="h4" style={styles.tipsTitle}>Tips</ThemedText>
              <View style={styles.tipItem}>
                <EvendiIcon name="check-circle" size={16} color={Colors.dark.accent} />
                <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}> 
                  Legg inn buffer mellom hver sesjon
                </ThemedText>
              </View>
              <View style={styles.tipItem}>
                <EvendiIcon name="check-circle" size={16} color={Colors.dark.accent} />
                <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}> 
                  Gruppebilder tar lengre tid enn du tror
                </ThemedText>
              </View>
              <View style={styles.tipItem}>
                <EvendiIcon name="check-circle" size={16} color={Colors.dark.accent} />
                <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}> 
                  Bruk golden hour for portretter
                </ThemedText>
              </View>
            </View>
          </Animated.View>
        </>
      )}
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
  aiIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  mediaIconContainer: {
    flexDirection: "row",
    gap: 4,
  },
  title: { textAlign: "center", marginBottom: Spacing.sm },
  subtitle: { textAlign: "center", fontSize: 14 },
  calculatingContainer: { alignItems: "center", paddingVertical: Spacing["5xl"] },
  pulseCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  calculatingText: { fontSize: 16 },
  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  summaryContent: { marginLeft: Spacing.md },
  summaryLabel: { fontSize: 13 },
  summaryValue: { fontSize: 18, fontWeight: "700" },
  slotsContainer: { gap: Spacing.md, marginBottom: Spacing.xl },
  slotCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  slotIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  slotInfo: { flex: 1 },
  slotTitle: { fontSize: 16, fontWeight: "600" },
  slotTime: { fontSize: 14, marginTop: 2 },
  slotMeta: { fontSize: 12, marginTop: 4 },
  durationBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  durationText: { fontSize: 16, fontWeight: "700" },
  emptyState: { alignItems: "center", paddingVertical: Spacing["5xl"] },
  emptyText: { fontSize: 16, fontWeight: "500", marginTop: Spacing.lg },
  emptySubtext: { fontSize: 14, textAlign: "center", marginTop: Spacing.sm },
  recalculateButton: { marginBottom: Spacing.xl },
  tipsCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  tipsTitle: { marginBottom: Spacing.md },
  tipItem: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.sm },
  tipText: { marginLeft: Spacing.sm, fontSize: 14 },
});
