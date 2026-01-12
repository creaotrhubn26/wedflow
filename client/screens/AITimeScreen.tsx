import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getSchedule, getPhotoShots } from "@/lib/storage";
import { AITimeSlot } from "@/lib/types";

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

const CATEGORY_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  ceremony: "heart",
  portraits: "user",
  group: "users",
  details: "eye",
  reception: "music",
};

export default function AITimeScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [timeSlots, setTimeSlots] = useState<AITimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);

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

        slots.push({
          id: category,
          type: category,
          title: CATEGORY_LABELS[category],
          duration,
          startTime: `${startHour.toString().padStart(2, "0")}:${startMin.toString().padStart(2, "0")}`,
          endTime: `${endHour.toString().padStart(2, "0")}:${endMin.toString().padStart(2, "0")}`,
          icon: CATEGORY_ICONS[category],
        });

        currentMinutes = endMinutes + 5;
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    setTimeSlots(slots);
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
            <Feather name="cpu" size={24} color={Colors.dark.accent} />
          </View>
          <ThemedText type="h2" style={styles.title}>AI Tidsberegner</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Foreslåtte tidsrammer basert på din kjøreplan og shot list.
          </ThemedText>
        </View>
      </Animated.View>

      {calculating ? (
        <Animated.View entering={FadeInUp.duration(400)} style={styles.calculatingContainer}>
          <View style={[styles.pulseCircle, { backgroundColor: Colors.dark.accent + "20" }]}>
            <Feather name="loader" size={32} color={Colors.dark.accent} />
          </View>
          <ThemedText style={[styles.calculatingText, { color: theme.textSecondary }]}>
            Beregner optimale tidsrammer...
          </ThemedText>
        </Animated.View>
      ) : (
        <>
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <View style={[styles.summaryCard, { backgroundColor: Colors.dark.accent + "10", borderColor: Colors.dark.accent }]}>
              <Feather name="clock" size={20} color={Colors.dark.accent} />
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

          <View style={styles.slotsContainer}>
            {timeSlots.map((slot, index) => (
              <Animated.View
                key={slot.id}
                entering={FadeInDown.delay(300 + index * 100).duration(400)}
              >
                <View
                  style={[
                    styles.slotCard,
                    { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                  ]}
                >
                  <View style={[styles.slotIcon, { backgroundColor: theme.backgroundSecondary }]}>
                    <Feather name={slot.icon} size={20} color={Colors.dark.accent} />
                  </View>
                  <View style={styles.slotInfo}>
                    <ThemedText style={styles.slotTitle}>{slot.title}</ThemedText>
                    <ThemedText style={[styles.slotTime, { color: theme.textSecondary }]}>
                      {slot.startTime} - {slot.endTime}
                    </ThemedText>
                  </View>
                  <View style={styles.durationBadge}>
                    <ThemedText style={[styles.durationText, { color: Colors.dark.success }]}>
                      {slot.duration} min
                    </ThemedText>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>

          {timeSlots.length === 0 ? (
            <View style={styles.emptyState}>
              <Feather name="camera-off" size={48} color={theme.textMuted} />
              <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
                Ingen bilder i fotoplanen
              </ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: theme.textMuted }]}>
                Legg til bilder i fotoplanen for å få AI-beregninger
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
                <Feather name="check-circle" size={16} color={Colors.dark.accent} />
                <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>
                  Legg inn buffer mellom hver sesjon
                </ThemedText>
              </View>
              <View style={styles.tipItem}>
                <Feather name="check-circle" size={16} color={Colors.dark.accent} />
                <ThemedText style={[styles.tipText, { color: theme.textSecondary }]}>
                  Gruppebilder tar lengre tid enn du tror
                </ThemedText>
              </View>
              <View style={styles.tipItem}>
                <Feather name="check-circle" size={16} color={Colors.dark.accent} />
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
