import React, { useState, useEffect, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  Switch,
  Modal,
  Platform,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { EvendiIcon, type EvendiIconName } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
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
import { showToast } from "@/lib/toast";

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

const AFFIRMATION_STORAGE_KEY = "wedflow_stress_tracker_affirmation";
const HAPTICS_STORAGE_KEY = "wedflow_stress_tracker_haptics";
const COUNTDOWN_STORAGE_KEY = "wedflow_stress_tracker_countdown";
const SESSION_MINUTES_STORAGE_KEY = "wedflow_stress_tracker_session_minutes";
const TOTAL_BREATHS_STORAGE_KEY = "wedflow_stress_tracker_total_breaths";
const SESSION_MINUTES_OPTIONS = [1, 3, 5];


const STRESS_TIPS: Array<{ icon: EvendiIconName; title: string; desc: string }> = [
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
  const [totalBreaths, setTotalBreaths] = useState(0);
  const [affirmation, setAffirmation] = useState(AFFIRMATIONS[0]);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [showCountdown, setShowCountdown] = useState(true);
  const [sessionMinutes, setSessionMinutes] = useState(3);
  const [customSessionInput, setCustomSessionInput] = useState("3");
  const [remainingSeconds, setRemainingSeconds] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);
  const breathingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const breathCountRef = useRef(0);
  const skipPersistOnce = useRef(false);

  const animatedCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  useEffect(() => {
    let isActive = true;

    const loadAffirmation = async () => {
      try {
        const stored = await AsyncStorage.getItem(AFFIRMATION_STORAGE_KEY);
        if (!isActive) return;

        if (stored && AFFIRMATIONS.includes(stored)) {
          setAffirmation(stored);
          return;
        }

        const next = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
        setAffirmation(next);
      } catch {
        if (!isActive) return;
        setAffirmation(AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)]);
      }
    };

    loadAffirmation();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const persistAffirmation = async () => {
      if (skipPersistOnce.current) {
        skipPersistOnce.current = false;
        return;
      }
      try {
        await AsyncStorage.setItem(AFFIRMATION_STORAGE_KEY, affirmation);
      } catch {
        // Ignore persistence errors to avoid blocking UI.
      }
    };

    persistAffirmation();
  }, [affirmation]);

  useEffect(() => {
    let isActive = true;

    const loadSettings = async () => {
      try {
        const results = await AsyncStorage.multiGet([
          HAPTICS_STORAGE_KEY,
          COUNTDOWN_STORAGE_KEY,
          SESSION_MINUTES_STORAGE_KEY,
          TOTAL_BREATHS_STORAGE_KEY,
        ]);

        if (!isActive) return;

        const storedHaptics = results[0][1];
        const storedCountdown = results[1][1];
        const storedSessionMinutes = results[2][1];
        const storedTotalBreaths = results[3][1];

        if (storedHaptics !== null) setHapticsEnabled(storedHaptics === "true");
        if (storedCountdown !== null) setShowCountdown(storedCountdown === "true");
        if (storedSessionMinutes !== null) {
          const parsed = Number.parseInt(storedSessionMinutes, 10);
          if (!Number.isNaN(parsed) && parsed > 0) setSessionMinutes(parsed);
        }
        if (storedTotalBreaths !== null) {
          const parsed = Number.parseInt(storedTotalBreaths, 10);
          if (!Number.isNaN(parsed) && parsed >= 0) setTotalBreaths(parsed);
        }
      } catch {
        // Ignore load errors to avoid blocking UI.
      }
    };

    loadSettings();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(HAPTICS_STORAGE_KEY, hapticsEnabled ? "true" : "false").catch(() => undefined);
  }, [hapticsEnabled]);

  useEffect(() => {
    AsyncStorage.setItem(COUNTDOWN_STORAGE_KEY, showCountdown ? "true" : "false").catch(() => undefined);
  }, [showCountdown]);

  useEffect(() => {
    AsyncStorage.setItem(SESSION_MINUTES_STORAGE_KEY, String(sessionMinutes)).catch(() => undefined);
  }, [sessionMinutes]);

  useEffect(() => {
    setCustomSessionInput(String(sessionMinutes));
  }, [sessionMinutes]);

  useEffect(() => {
    AsyncStorage.setItem(TOTAL_BREATHS_STORAGE_KEY, String(totalBreaths)).catch(() => undefined);
  }, [totalBreaths]);

  useEffect(() => {
    breathCountRef.current = breathCount;
  }, [breathCount]);

  useEffect(() => {
    if (!isBreathing) {
      if (breathingTimeout.current) {
        clearTimeout(breathingTimeout.current);
        breathingTimeout.current = null;
      }
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
        countdownInterval.current = null;
      }
      if (sessionTimeout.current) {
        clearTimeout(sessionTimeout.current);
        sessionTimeout.current = null;
      }
      setRemainingSeconds(null);

      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      opacity.value = withRepeat(
        withSequence(withTiming(0.45, { duration: 1200 }), withTiming(0.3, { duration: 1200 })),
        -1,
        true
      );
      return () => {
        if (breathingTimeout.current) {
          clearTimeout(breathingTimeout.current);
          breathingTimeout.current = null;
        }
        if (countdownInterval.current) {
          clearInterval(countdownInterval.current);
          countdownInterval.current = null;
        }
        if (sessionTimeout.current) {
          clearTimeout(sessionTimeout.current);
          sessionTimeout.current = null;
        }
      };
    }

    const runBreathingCycle = () => {
      let phaseIndex = 0;

      const startCountdown = (durationMs: number) => {
        if (countdownInterval.current) {
          clearInterval(countdownInterval.current);
          countdownInterval.current = null;
        }
        if (!showCountdown) {
          setRemainingSeconds(null);
          return;
        }
        const seconds = Math.max(1, Math.ceil(durationMs / 1000));
        setRemainingSeconds(seconds);
        countdownInterval.current = setInterval(() => {
          setRemainingSeconds((prev) => {
            if (prev === null) return null;
            return prev > 1 ? prev - 1 : 0;
          });
        }, 1000);
      };

      const animate = () => {
        if (!isBreathing) return;

        const phase = BREATHING_PHASES[phaseIndex];
        setCurrentPhase(phaseIndex);
        startCountdown(phase.duration);

        if (phase.phase === "inhale") {
          scale.value = withTiming(1.5, { duration: phase.duration, easing: Easing.inOut(Easing.ease) });
          opacity.value = withTiming(0.8, { duration: phase.duration });
          if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          setTotalBreaths((c) => c + 1);
        }

        breathingTimeout.current = setTimeout(animate, phase.duration);
      };

      animate();
    };

    runBreathingCycle();
    return () => {
      if (breathingTimeout.current) {
        clearTimeout(breathingTimeout.current);
        breathingTimeout.current = null;
      }
      if (countdownInterval.current) {
        clearInterval(countdownInterval.current);
        countdownInterval.current = null;
      }
      if (sessionTimeout.current) {
        clearTimeout(sessionTimeout.current);
        sessionTimeout.current = null;
      }
    };
  }, [isBreathing, opacity, scale, showCountdown, hapticsEnabled]);

  const endBreathingSession = (reason: "manual" | "auto") => {
    const completedCycles = breathCountRef.current;
    setIsBreathing(false);
    setRemainingSeconds(null);

    if (breathingTimeout.current) {
      clearTimeout(breathingTimeout.current);
      breathingTimeout.current = null;
    }
    if (countdownInterval.current) {
      clearInterval(countdownInterval.current);
      countdownInterval.current = null;
    }
    if (sessionTimeout.current) {
      clearTimeout(sessionTimeout.current);
      sessionTimeout.current = null;
    }

    if (reason === "manual" && hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    if (completedCycles > 0) {
      showToast(`Fullfort ${completedCycles} pustesykluser`);
    }
  };

  const startBreathing = () => {
    setIsBreathing(true);
    setBreathCount(0);
    if (sessionTimeout.current) {
      clearTimeout(sessionTimeout.current);
      sessionTimeout.current = null;
    }
    sessionTimeout.current = setTimeout(() => {
      endBreathingSession("auto");
    }, sessionMinutes * 60 * 1000);
    if (hapticsEnabled) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const stopBreathing = () => {
    endBreathingSession("manual");
  };

  const getNewAffirmation = () => {
    const newAff = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
    setAffirmation(newAff);
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const resetAffirmation = async () => {
    skipPersistOnce.current = true;
    try {
      await AsyncStorage.removeItem(AFFIRMATION_STORAGE_KEY);
    } catch {
      // Ignore persistence errors to avoid blocking UI.
    }
    const newAff = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];
    setAffirmation(newAff);
    if (hapticsEnabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const applyCustomSession = () => {
    const parsed = Number.parseInt(customSessionInput, 10);
    if (Number.isNaN(parsed) || parsed <= 0) {
      showToast("Skriv inn antall minutter over 0.");
      return;
    }
    if (parsed > 120) {
      showToast("Velg 120 minutter eller mindre.");
      return;
    }
    setSessionMinutes(parsed);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <LinearGradient
        colors={["#f7fbff", "#f6f2ff", "#f3fff9"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.auroraBackground}
      />
      <View style={[styles.auroraOrb, styles.auroraOrbLeft]} />
      <View style={[styles.auroraOrb, styles.auroraOrbRight]} />
      <ScrollView
        style={styles.scrollSurface}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View
            style={[
              styles.affirmationCard,
              { backgroundColor: "rgba(255,255,255,0.7)", borderColor: Colors.dark.accent + "40" },
            ]}
          >
            <EvendiIcon name="sun" size={24} color={Colors.dark.accent} />
            <ThemedText style={[styles.affirmation, { color: Colors.dark.accent }]}>
              "{affirmation}"
            </ThemedText>
            <Pressable
              onPress={getNewAffirmation}
              onLongPress={resetAffirmation}
              style={styles.refreshBtn}
              accessibilityRole="button"
              accessibilityLabel="Oppdater affirmasjon"
              accessibilityHint="Hold for å tilbakestille lagret affirmasjon"
              testID="pulseid-affirmation-refresh"
            >
              <EvendiIcon name="refresh-cw" size={18} color={Colors.dark.accent} />
            </Pressable>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).duration(400)}>
          <View
            style={[styles.breathingCard, { backgroundColor: "rgba(255,255,255,0.8)", borderColor: theme.border }]}
          >
            <View style={styles.breathingHeader}>
              <ThemedText type="h3" style={styles.breathingTitle}>
                Pusteøvelse
              </ThemedText>
              <Pressable
                onPress={() => setShowSettings(true)}
                style={styles.settingsButton}
                accessibilityRole="button"
                accessibilityLabel="Aapne pusteinnstillinger"
                testID="pulseid-breathing-settings"
              >
                <EvendiIcon name="settings" size={18} color={theme.textSecondary} />
              </Pressable>
            </View>
            <ThemedText style={[styles.breathingSubtitle, { color: theme.textSecondary }]}>
              4-4-6 teknikk for avslapning
            </ThemedText>
            <ThemedText style={[styles.breathingMeta, { color: theme.textSecondary }]}
            >
              Sesjonslengde: {sessionMinutes} min
            </ThemedText>

            <View style={styles.breathingCircleContainer}>
              <View style={[styles.breathingHaloOuter, { backgroundColor: Colors.dark.accent + "22" }]} />
              <View style={[styles.breathingHaloInner, { backgroundColor: Colors.dark.accent + "33" }]} />
              <Animated.View
                style={[styles.breathingCircle, { backgroundColor: Colors.dark.accent }, animatedCircleStyle]}
              />
              <View style={styles.breathingLabelContainer}>
                {isBreathing ? (
                  <Animated.View
                    key={`phase-${currentPhase}`}
                    entering={FadeInDown.duration(200)}
                    style={styles.phaseStack}
                  >
                    <ThemedText style={styles.phaseLabel}>{BREATHING_PHASES[currentPhase].label}</ThemedText>
                    {showCountdown && remainingSeconds !== null ? (
                      <ThemedText style={[styles.countdownLabel, { color: theme.textSecondary }]}>
                        {remainingSeconds}s
                      </ThemedText>
                    ) : null}
                    <ThemedText style={[styles.breathCountLabel, { color: theme.textSecondary }]}>
                      {breathCount} pust
                    </ThemedText>
                  </Animated.View>
                ) : (
                  <ThemedText style={[styles.startLabel, { color: theme.textSecondary }]}>Trykk for å starte</ThemedText>
                )}
              </View>
            </View>

            {isBreathing ? (
              <Button
                onPress={stopBreathing}
                style={styles.breathButton}
                accessibilityLabel="Stopp pusteovelse"
                testID="pulseid-breathing-stop"
              >
                Stopp
              </Button>
            ) : (
              <Button
                onPress={startBreathing}
                style={styles.breathButton}
                accessibilityLabel="Start pusteovelse"
                testID="pulseid-breathing-start"
              >
                Start pusteøvelse
              </Button>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).duration(400)}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Stress-tips
          </ThemedText>
          <View style={styles.tipsGrid}>
            {STRESS_TIPS.map((tip, index) => (
              <Animated.View
                key={index}
                entering={FadeInDown.delay(320 + index * 60).duration(300)}
                style={styles.tipCardWrap}
              >
                <View
                  style={[
                    styles.tipCard,
                    {
                      backgroundColor: "rgba(255,255,255,0.75)",
                      borderColor: theme.border,
                      transform: [{ rotate: index % 2 === 0 ? "-1.5deg" : "1.5deg" }],
                    },
                  ]}
                >
                  <View style={[styles.tipIcon, { backgroundColor: theme.backgroundSecondary }]}
                  >
                    <EvendiIcon name={tip.icon} size={20} color={Colors.dark.accent} />
                  </View>
                  <ThemedText style={styles.tipTitle}>{tip.title}</ThemedText>
                  <ThemedText style={[styles.tipDesc, { color: theme.textSecondary }]}>{tip.desc}</ThemedText>
                </View>
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(400).duration(400)}>
          <View style={[styles.statsCard, { backgroundColor: "rgba(255,255,255,0.8)", borderColor: theme.border }]}>
            <ThemedText type="h4" style={styles.statsTitle}>
              Husk dette
            </ThemedText>
            <View style={styles.statRow}>
              <EvendiIcon name="heart" size={18} color={Colors.dark.accent} />
              <ThemedText style={[styles.statNumber, { color: Colors.dark.accent }]}>96%</ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}
              >
                av par opplever stress - du er ikke alene
              </ThemedText>
            </View>
            <View style={styles.statRow}>
              <EvendiIcon name="eye" size={18} color={Colors.dark.accent} />
              <ThemedText style={[styles.statNumber, { color: Colors.dark.accent }]}>0</ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}
              >
                gjester vil huske om serviettene matchet
              </ThemedText>
            </View>
            <View style={styles.statRow}>
              <EvendiIcon name="calendar" size={18} color={Colors.dark.accent} />
              <ThemedText style={[styles.statNumber, { color: Colors.dark.accent }]}>1</ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}
              >
                dag - fokuser på det viktigste
              </ThemedText>
            </View>
            <View style={styles.statRow}>
              <EvendiIcon name="activity" size={18} color={Colors.dark.accent} />
              <ThemedText style={[styles.statNumber, { color: Colors.dark.accent }]}
              >
                {totalBreaths}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}
              >
                totale pustesykluser lagret
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        <Modal
          visible={showSettings}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowSettings(false)}
        >
          <Pressable style={styles.settingsOverlay} onPress={() => setShowSettings(false)}>
            <Pressable style={styles.settingsSheetWrapper}>
              <Animated.View
                entering={FadeInDown.duration(200)}
                style={[
                  styles.settingsSheet,
                  {
                    backgroundColor: "rgba(255,255,255,0.96)",
                    borderColor: theme.border,
                    paddingBottom: insets.bottom + Spacing.lg,
                  },
                ]}
              >
                <View style={styles.settingsHeader}>
                  <ThemedText type="h4">Innstillinger</ThemedText>
                  <Pressable
                    onPress={() => setShowSettings(false)}
                    style={styles.settingsClose}
                    accessibilityRole="button"
                    accessibilityLabel="Lukk innstillinger"
                  >
                    <EvendiIcon name="x" size={20} color={theme.textSecondary} />
                  </Pressable>
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingText}>
                    <ThemedText style={styles.settingTitle}>Haptikk</ThemedText>
                    <ThemedText style={[styles.settingDesc, { color: theme.textSecondary }]}
                    >
                      Slatt av vibrasjoner
                    </ThemedText>
                  </View>
                  <Switch value={hapticsEnabled} onValueChange={setHapticsEnabled} />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingText}>
                    <ThemedText style={styles.settingTitle}>Nedtelling</ThemedText>
                    <ThemedText style={[styles.settingDesc, { color: theme.textSecondary }]}
                    >
                      Vis sekunder per fase
                    </ThemedText>
                  </View>
                  <Switch value={showCountdown} onValueChange={setShowCountdown} />
                </View>

                <View style={styles.settingRowColumn}>
                  <View style={styles.settingText}>
                    <ThemedText style={styles.settingTitle}>Sesjonslengde</ThemedText>
                    <ThemedText style={[styles.settingDesc, { color: theme.textSecondary }]}
                    >
                      Stopper automatisk
                    </ThemedText>
                  </View>
                  <View style={styles.segmentRow}>
                    {(() => {
                      const options = SESSION_MINUTES_OPTIONS.includes(sessionMinutes)
                        ? SESSION_MINUTES_OPTIONS
                        : [...SESSION_MINUTES_OPTIONS, sessionMinutes].sort((a, b) => a - b);

                      return options.map((option) => {
                        const isSelected = option === sessionMinutes;
                        return (
                          <Pressable
                            key={option}
                            onPress={() => setSessionMinutes(option)}
                            style={[
                              styles.segmentOption,
                              {
                                backgroundColor: isSelected ? Colors.dark.accent : theme.backgroundSecondary,
                                borderColor: isSelected ? Colors.dark.accent : theme.border,
                              },
                            ]}
                            accessibilityRole="button"
                            accessibilityLabel={`Sett sesjonslengde til ${option} minutter`}
                          >
                            <ThemedText style={[styles.segmentLabel, { color: isSelected ? "#FFFFFF" : theme.text }]}
                            >
                              {option} min
                            </ThemedText>
                          </Pressable>
                        );
                      });
                    })()}
                  </View>
                  <View style={styles.customSessionRow}>
                    <TextInput
                      value={customSessionInput}
                      onChangeText={setCustomSessionInput}
                      keyboardType="number-pad"
                      placeholder="Minutter"
                      placeholderTextColor={theme.textSecondary}
                      style={[
                        styles.customSessionInput,
                        {
                          borderColor: theme.border,
                          color: theme.text,
                          backgroundColor: theme.backgroundSecondary,
                        },
                      ]}
                      accessibilityLabel="Egendefinert sesjonslengde i minutter"
                      testID="pulseid-session-length-input"
                    />
                    <Pressable
                      onPress={applyCustomSession}
                      style={[styles.customSessionButton, { backgroundColor: Colors.dark.accent }]}
                      accessibilityRole="button"
                      accessibilityLabel="Bruk egendefinert sesjonslengde"
                      testID="pulseid-session-length-apply"
                    >
                      <ThemedText style={styles.customSessionButtonText}>Bruk</ThemedText>
                    </Pressable>
                  </View>
                </View>
              </Animated.View>
            </Pressable>
          </Pressable>
        </Modal>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  auroraBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  auroraOrb: {
    position: "absolute",
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(120, 195, 255, 0.18)",
  },
  auroraOrbLeft: { top: -80, left: -60 },
  auroraOrbRight: { top: 160, right: -80, backgroundColor: "rgba(144, 120, 255, 0.18)" },
  scrollSurface: { flex: 1, backgroundColor: "transparent" },
  affirmationCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  affirmation: {
    fontSize: 18,
    fontWeight: "500",
    textAlign: "center",
    marginTop: Spacing.md,
    fontStyle: "italic",
  },
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
  breathingMeta: { fontSize: 12, marginTop: Spacing.xs },
  breathingHeader: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingsButton: { padding: Spacing.sm },
  breathingCircleContainer: {
    width: 180,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: Spacing.xl,
  },
  breathingHaloOuter: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  breathingHaloInner: {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: 70,
  },
  breathingCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: "absolute",
  },
  breathingLabelContainer: { alignItems: "center", zIndex: 1 },
  phaseStack: { alignItems: "center" },
  phaseLabel: { fontSize: 20, fontWeight: "600" },
  countdownLabel: { fontSize: 12, marginTop: Spacing.xs },
  breathCountLabel: { fontSize: 14, marginTop: Spacing.xs },
  startLabel: { fontSize: 14 },
  breathButton: { width: "100%" },
  sectionTitle: { marginBottom: Spacing.lg },
  tipsGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md, marginBottom: Spacing.xl },
  tipCardWrap: { width: "48%" },
  tipCard: {
    width: "100%",
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
  statRow: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.md, gap: Spacing.sm },
  statNumber: { fontSize: 28, fontWeight: "700", marginRight: Spacing.sm },
  statLabel: { fontSize: 14, flex: 1 },
  settingsOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  settingsSheetWrapper: { width: "100%" },
  settingsSheet: {
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  settingsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  settingsClose: { padding: Spacing.sm },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
  },
  settingRowColumn: { marginBottom: Spacing.lg },
  settingText: { flex: 1, marginRight: Spacing.md },
  settingTitle: { fontSize: 14, fontWeight: "600" },
  settingDesc: { fontSize: 12, marginTop: 2 },
  segmentRow: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.sm },
  segmentOption: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  segmentLabel: { fontSize: 12, fontWeight: "600" },
  customSessionRow: { flexDirection: "row", alignItems: "center", marginTop: Spacing.sm },
  customSessionInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 14,
  },
  customSessionButton: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  customSessionButtonText: { color: "#FFFFFF", fontSize: 12, fontWeight: "600" },
});
