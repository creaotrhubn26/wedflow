import React, { useState, useEffect, useRef } from "react";
import { ScrollView, StyleSheet, View, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  FadeInDown,
  Easing,
} from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

const BREATHING_PHASES = [
  { phase: "inhale", label: "Pust inn", duration: 4000 },
  { phase: "hold", label: "Hold", duration: 4000 },
  { phase: "exhale", label: "Pust ut", duration: 6000 },
];

const AFFIRMATIONS = [
  "Det viktigste er at dere gifter dere",
  "Ingen bryllup er perfekt - og det er greit",
  "Gjestene kommer for å feire dere",
  "Små feil blir gode minner",
  "Fokuser på det som betyr mest",
  "Du trenger ikke gjøre alt alene",
  "Ta en pause når du trenger det",
  "Dette er DERES dag",
];

const STRESS_TIPS = [
  { icon: "moon", title: "Søvn først", desc: "7-8 timer gir bedre beslutninger" },
  { icon: "calendar", title: "En ting om gangen", desc: "Fokuser på én oppgave per dag" },
  { icon: "users", title: "Deleger", desc: "La andre hjelpe deg" },
  { icon: "x-circle", title: "Si nei", desc: "Du trenger ikke gjøre alt" },
  { icon: "coffee", title: "Ta pauser", desc: "Planlegging-frie kvelder" },
  { icon: "heart", title: "Partnertid", desc: "Date nights uten bryllupsprat" },
];

export default function StressTrackerScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [isBreathing, setIsBreathing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [affirmation, setAffirmation] = useState(AFFIRMATIONS[0]);

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
  }, []);

  useEffect(() => {
    if (!isBreathing) {
      scale.value = 1;
      opacity.value = 0.3;
      return;
    }

    const runBreathingCycle = () => {
      let phaseIndex = 0;
      
      const animate = () => {
        if (!isBreathing) return;
        
        const phase = BREATHING_PHASES[phaseIndex];
        setCurrentPhase(phaseIndex);

        if (phase.phase === "inhale") {
          scale.value = withTiming(1.5, { duration: phase.duration, easing: Easing.inOut(Easing.ease) });
          opacity.value = withTiming(0.8, { duration: phase.duration });
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else if (phase.phase === "hold") {
          scale.value = withTiming(1.5, { duration: phase.duration });
          opacity.value = withTiming(0.8, { duration: phase.duration });
        } else {
          scale.value = withTiming(1, { duration: phase.duration, easing: Easing.inOut(Easing.ease) });
          opacity.value = withTiming(0.3, { duration: phase.duration });
        }

        phaseIndex = (phaseIndex + 1) % BREATHING_PHASES.length;
        
        if (phaseIndex === 0) {
          setBreathCount((c) => c + 1);
        }

        setTimeout(animate, phase.duration);
      };

      animate();
    };

    runBreathingCycle();
  }, [isBreathing]);

  const startBreathing = () => {
    setIsBreathing(true);
    setBreathCount(0);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const stopBreathing = () => {
    setIsBreathing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const getNewAffirmation = () => {
    const newAff = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
    setAffirmation(newAff);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

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
        <View style={[styles.affirmationCard, { backgroundColor: Colors.dark.accent + "15", borderColor: Colors.dark.accent }]}>
          <Feather name="sun" size={24} color={Colors.dark.accent} />
          <ThemedText style={[styles.affirmation, { color: Colors.dark.accent }]}>
            "{affirmation}"
          </ThemedText>
          <Pressable onPress={getNewAffirmation} style={styles.refreshBtn}>
            <Feather name="refresh-cw" size={18} color={Colors.dark.accent} />
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <View style={[styles.breathingCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText type="h3" style={styles.breathingTitle}>Pusteøvelse</ThemedText>
          <ThemedText style={[styles.breathingSubtitle, { color: theme.textSecondary }]}>
            4-4-6 teknikk for avslapning
          </ThemedText>

          <View style={styles.breathingCircleContainer}>
            <Animated.View style={[styles.breathingCircle, { backgroundColor: Colors.dark.accent }, animatedCircleStyle]} />
            <View style={styles.breathingLabelContainer}>
              {isBreathing ? (
                <>
                  <ThemedText style={styles.phaseLabel}>
                    {BREATHING_PHASES[currentPhase].label}
                  </ThemedText>
                  <ThemedText style={[styles.breathCountLabel, { color: theme.textSecondary }]}>
                    {breathCount} pust
                  </ThemedText>
                </>
              ) : (
                <ThemedText style={[styles.startLabel, { color: theme.textSecondary }]}>
                  Trykk for å starte
                </ThemedText>
              )}
            </View>
          </View>

          {isBreathing ? (
            <Button onPress={stopBreathing} variant="outline" style={styles.breathButton}>
              Stopp
            </Button>
          ) : (
            <Button onPress={startBreathing} style={styles.breathButton}>
              Start pusteøvelse
            </Button>
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <ThemedText type="h3" style={styles.sectionTitle}>Stress-tips</ThemedText>
        <View style={styles.tipsGrid}>
          {STRESS_TIPS.map((tip, index) => (
            <View
              key={index}
              style={[styles.tipCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
            >
              <View style={[styles.tipIcon, { backgroundColor: theme.backgroundSecondary }]}>
                <Feather name={tip.icon as any} size={20} color={Colors.dark.accent} />
              </View>
              <ThemedText style={styles.tipTitle}>{tip.title}</ThemedText>
              <ThemedText style={[styles.tipDesc, { color: theme.textSecondary }]}>
                {tip.desc}
              </ThemedText>
            </View>
          ))}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <View style={[styles.statsCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText type="h4" style={styles.statsTitle}>Husk dette</ThemedText>
          <View style={styles.statRow}>
            <ThemedText style={[styles.statNumber, { color: Colors.dark.accent }]}>96%</ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              av par opplever stress - du er ikke alene
            </ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText style={[styles.statNumber, { color: Colors.dark.accent }]}>0</ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              gjester vil huske om serviettene matchet
            </ThemedText>
          </View>
          <View style={styles.statRow}>
            <ThemedText style={[styles.statNumber, { color: Colors.dark.accent }]}>1</ThemedText>
            <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
              dag - fokuser på det viktigste
            </ThemedText>
          </View>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  affirmationCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  affirmation: { fontSize: 18, fontWeight: "500", textAlign: "center", marginTop: Spacing.md, fontStyle: "italic" },
  refreshBtn: { marginTop: Spacing.md, padding: Spacing.sm },
  breathingCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  breathingTitle: { textAlign: "center" },
  breathingSubtitle: { fontSize: 14, marginTop: Spacing.xs },
  breathingCircleContainer: {
    width: 180,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: Spacing.xl,
  },
  breathingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: "absolute",
  },
  breathingLabelContainer: { alignItems: "center", zIndex: 1 },
  phaseLabel: { fontSize: 20, fontWeight: "600" },
  breathCountLabel: { fontSize: 14, marginTop: Spacing.xs },
  startLabel: { fontSize: 14 },
  breathButton: { width: "100%" },
  sectionTitle: { marginBottom: Spacing.lg },
  tipsGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md, marginBottom: Spacing.xl },
  tipCard: {
    width: "48%",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  tipIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  tipTitle: { fontSize: 14, fontWeight: "600" },
  tipDesc: { fontSize: 12, marginTop: 2 },
  statsCard: { padding: Spacing.xl, borderRadius: BorderRadius.md, borderWidth: 1 },
  statsTitle: { marginBottom: Spacing.lg },
  statRow: { flexDirection: "row", alignItems: "baseline", marginBottom: Spacing.md },
  statNumber: { fontSize: 28, fontWeight: "700", marginRight: Spacing.sm },
  statLabel: { fontSize: 14, flex: 1 },
});
