import React, { useEffect, useMemo, useRef } from "react";
import { View, StyleSheet, Image, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  withSequence,
  Easing,
  type SharedValue,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Audio } from "expo-av";
import { ThemedText } from "@/components/ThemedText";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useDesignSettings } from "@/hooks/useDesignSettings";

const { width, height } = Dimensions.get("window");

export default function SplashScreen() {
  const systemColorScheme = useColorScheme();
  const { settings } = useDesignSettings();
  
  // Use design settings darkMode if available, otherwise fall back to system
  const isDark = settings?.darkMode ?? (systemColorScheme === "dark");
  const colorScheme = isDark ? "dark" : "light";
  const colors = Colors[colorScheme];
  
  // Debug: log the color scheme
  console.log("SplashScreen - isDark:", isDark, "darkMode setting:", settings?.darkMode, "system:", systemColorScheme);
  
  // Logo fade and scale animations
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.8);

  // Dolly zoom effect (scale only for React Native compatibility)
  const contentScale = useSharedValue(1);

  // Text animations
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(20);

  // Accent line animation
  const lineScale = useSharedValue(0);

  // Overall fade out at the end
  const fadeOutOpacity = useSharedValue(1);

  const soundRef = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    // Logo animation: fade in and scale (0-1200ms)
    logoOpacity.value = withTiming(1, {
      duration: 1200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    logoScale.value = withTiming(1, {
      duration: 1200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });

    // Accent line animation (1200-2000ms)
    lineScale.value = withDelay(
      1200,
      withTiming(1, {
        duration: 1200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );

    // Subtitle animation (2000-2800ms)
    subtitleOpacity.value = withDelay(
      2000,
      withTiming(1, {
        duration: 1200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );

    subtitleTranslateY.value = withDelay(
      2000,
      withTiming(0, {
        duration: 1200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      })
    );

    // Dolly zoom starting at 3000ms (cinematic push-in, scale only for React Native)
    contentScale.value = withDelay(
      3000,
      withTiming(1.08, {
        duration: 4500,
        easing: Easing.bezier(0.22, 1, 0.36, 1),
      })
    );

    // Cinematic fade out (5500-6800ms)
    fadeOutOpacity.value = withDelay(
      5500,
      withTiming(0, {
        duration: 1300,
        easing: Easing.bezier(0.33, 0, 0.67, 1),
      })
    );

    // Background audio with fade-out
    let isMounted = true;
    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../../assets/images/ONE NOTE.wav"),
          { volume: 0.6, shouldPlay: true, isLooping: false }
        );
        if (!isMounted) {
          await sound.unloadAsync();
          return;
        }
        soundRef.current = sound;
      } catch (error) {
        // silent fail if audio unavailable
      }
    })();

    // Start gradual audio fade at 4500ms
    const audioFadeStart = setTimeout(async () => {
      if (soundRef.current) {
        // Gradual fade over 2 seconds
        for (let i = 6; i >= 0; i--) {
          await soundRef.current.setStatusAsync({ volume: i / 10 });
          await new Promise(resolve => setTimeout(resolve, 285)); // 2000ms / 7 steps
        }
      }
    }, 4500);

    return () => {
      isMounted = false;
      clearTimeout(audioFadeStart);
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [contentScale, fadeOutOpacity, lineScale, logoOpacity, logoScale, subtitleOpacity, subtitleTranslateY]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const lineAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: lineScale.value }],
  }));

  const fadeOutStyle = useAnimatedStyle(() => ({
    opacity: fadeOutOpacity.value,
  }));

  const dollyZoomStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: contentScale.value },
    ],
  }));

  return (
    <Animated.View style={[styles.container, fadeOutStyle]}>
      <LinearGradient
        colors={
          colorScheme === "light"
            ? ["#f8f9fc", "#ffffff", "#f5f6fa"]
            : ["#0f1624", "#121826", "#0d0f1a"]
        }
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={
          colorScheme === "light"
            ? ["rgba(0,0,0,0.03)", "rgba(0,0,0,0)"]
            : ["rgba(255,255,255,0.08)", "rgba(255,255,255,0)"]
        }
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.vignette}
      />

      <Animated.View style={[styles.content, dollyZoomStyle]}>
        {/* Logo */}
        <Animated.View style={logoAnimatedStyle}>
          <Image
            source={require("../../assets/images/Evendi_logo_norsk_tagline.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Accent line */}
        <Animated.View
          style={[
            styles.accentLine,
            { backgroundColor: colors.accent },
            lineAnimatedStyle,
          ]}
        />

        {/* Subtitle text */}
        <Animated.View style={subtitleAnimatedStyle}>
          <ThemedText style={[styles.subtitle, { color: colors.accent }]}>
            A Day To Remember
          </ThemedText>
        </Animated.View>
      </Animated.View>

      {/* Subtle bottom accent */}
      <View style={[styles.bottomAccent, { backgroundColor: colors.accent + "20" }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    gap: 24,
  },
  logo: {
    width: 280,
    height: 280,
  },
  accentLine: {
    width: 60,
    height: 3,
    borderRadius: 1.5,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  bottomAccent: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 1,
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
  },
});
