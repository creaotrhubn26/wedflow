import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View, Pressable, Linking, ActivityIndicator, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { AppSetting } from "../../shared/schema";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { showToast } from "@/lib/toast";

type FAQCategory = "vendor" | "couple";

interface FAQItem {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  question: string;
  answer: string;
  category: FAQCategory;
  sortOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface SupportLink {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  description: string;
  url: string | null;
  onPress?: () => void;
  settingKey: string;
  defaultVisible: string;
}

export default function VendorHelpScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const { theme } = useTheme();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // When opened as CoupleHelp, only show couple FAQ
  const isCoupleMode = route.name === "CoupleHelp";
  const [activeCategory, setActiveCategory] = useState<FAQCategory>(isCoupleMode ? "couple" : "vendor");

  // Fetch app settings to control visibility of support links
  const { data: appSettings, refetch: refetchSettings, isFetching: isSettingsFetching } = useQuery<AppSetting[]>({
    queryKey: ["app-settings"],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/app-settings`);
      if (!res.ok) throw new Error("Kunne ikke hente innstillinger");
      return res.json();
    },
  });

  const supportLinks = useMemo(
    () => [
      {
        label: "Fullstendig dokumentasjon",
        icon: "book-open" as const,
        description: "Alt om Evendi for leverandører",
        url: null,
        onPress: () => navigation.navigate("Documentation", {}),
        settingKey: "help_show_documentation",
        defaultVisible: "true",
      },
      {
        label: "Videoguider",
        icon: "video" as const,
        description: "Lær hvordan funksjoner brukes",
        url: null,
        onPress: () => navigation.navigate("VideoGuides"),
        settingKey: "help_show_videoguides",
        defaultVisible: "false",
      },
      {
        label: "Status",
        icon: "activity" as const,
        description: "Se systemstatus og planlagt vedlikehold",
        url: null,
        onPress: () => navigation.navigate("Status"),
        settingKey: "help_show_status",
        defaultVisible: "true",
      },
      {
        label: "E-post Support",
        icon: "mail" as const,
        description: "support@evendi.no",
        url: "mailto:support@evendi.no",
        settingKey: "help_show_email_support",
        defaultVisible: "false",
      },
      {
        label: "Norwedfilm",
        icon: "globe" as const,
        description: "Vår hovedside",
        url: "https://norwedfilm.no",
        settingKey: "help_show_norwedfilm",
        defaultVisible: "true",
      },
    ],
    [navigation]
  );

  const visibleSupportLinks = useMemo(() => {
    const getSetting = (key: string, defaultValue: string) => {
      return appSettings?.find((s) => s.key === key)?.value ?? defaultValue;
    };

    return supportLinks.filter((link) => getSetting(link.settingKey, link.defaultVisible) === "true");
  }, [appSettings, supportLinks]);

  // Fetch FAQ from API
  const { data: faqData = [], isLoading, refetch, isRefetching } = useQuery({
    queryKey: ["faq", activeCategory],
    queryFn: async () => {
      const url = new URL(`/api/faq/${activeCategory}`, getApiUrl());
      const res = await fetch(url);
      if (!res.ok) throw new Error("Kunne ikke hente FAQ");
      return res.json() as Promise<FAQItem[]>;
    },
  });

  // Compute the most recent updatedAt across all FAQ items
  const lastUpdated = useMemo(() => {
    if (!faqData.length) return null;
    const dates = faqData
      .map((item) => item.updatedAt || item.createdAt)
      .filter(Boolean)
      .map((d) => new Date(d!).getTime());
    if (!dates.length) return null;
    return new Date(Math.max(...dates));
  }, [faqData]);

  const handleToggle = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const nextId = faqData[index]?.id;
    if (!nextId) return;
    setExpandedId(expandedId === nextId ? null : nextId);
  };

  const handleOpenLink = async (url: string | null, onPress?: () => void) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
    } else if (url) {
      try {
        const canOpen = await Linking.canOpenURL(url);
        if (!canOpen) {
          showToast("Enheten din kan ikke åpne denne lenken.");
          return;
        }
        await Linking.openURL(url);
      } catch (error) {
        showToast("Kunne ikke åpne lenken akkurat nå.");
      }
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching || isSettingsFetching}
          onRefresh={() => {
            refetchSettings();
            refetch();
          }}
          tintColor={theme.accent}
        />
      }
    >
      <Animated.View entering={FadeInDown.duration(400)}>
        <View style={[styles.header, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <Feather name="help-circle" size={32} color={Colors.dark.accent} />
          <ThemedText style={styles.headerTitle}>Hjelp & FAQ</ThemedText>
          <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
            Alt du trenger å vite om Evendi
          </ThemedText>
        </View>
      </Animated.View>

      {!isCoupleMode && (
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View style={styles.categoryTabs}>
          <Pressable
            onPress={() => {
              setActiveCategory("vendor");
              setExpandedId(null);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[
              styles.categoryTab,
              activeCategory === "vendor" && [styles.categoryTabActive, { backgroundColor: theme.accent }],
              activeCategory !== "vendor" && { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            ]}
          >
            <Feather 
              name="briefcase" 
              size={18} 
              color={activeCategory === "vendor" ? "#FFFFFF" : theme.textSecondary} 
            />
            <ThemedText 
              style={[
                styles.categoryTabText,
                { color: activeCategory === "vendor" ? "#FFFFFF" : theme.textSecondary }
              ]}
            >
              For leverandører
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => {
              setActiveCategory("couple");
              setExpandedId(null);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[
              styles.categoryTab,
              activeCategory === "couple" && [styles.categoryTabActive, { backgroundColor: theme.accent }],
              activeCategory !== "couple" && { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            ]}
          >
            <Feather 
              name="heart" 
              size={18} 
              color={activeCategory === "couple" ? "#FFFFFF" : theme.textSecondary} 
            />
            <ThemedText 
              style={[
                styles.categoryTabText,
                { color: activeCategory === "couple" ? "#FFFFFF" : theme.textSecondary }
              ]}
            >
              Hva par trenger
            </ThemedText>
          </Pressable>
        </View>
      </Animated.View>
      )}

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.sectionTitle}>
            {activeCategory === "vendor" ? "Ofte stilte spørsmål" : "Slik hjelper du parene"}
          </ThemedText>
          {lastUpdated && (
            <ThemedText style={[styles.lastUpdated, { color: theme.textMuted }]}>
              Sist oppdatert: {lastUpdated.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" })}
            </ThemedText>
          )}
          
          {isLoading ? (
            <ActivityIndicator style={{ marginTop: Spacing.lg }} color={theme.accent} />
          ) : faqData.length === 0 ? (
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
              Ingen FAQ tilgjengelig
            </ThemedText>
          ) : (
            faqData.map((item, index) => (
              <View key={item.id} style={[styles.faqItem, { borderColor: theme.border }]}>
                <Pressable
                  onPress={() => handleToggle(index)}
                  style={styles.faqQuestion}
                >
                  <View style={styles.faqQuestionContent}>
                    <View style={[styles.iconCircle, { backgroundColor: theme.accent + "15" }]}>
                      <Feather 
                        name={item.icon} 
                        size={16} 
                        color={theme.accent} 
                      />
                    </View>
                    <ThemedText style={styles.faqQuestionText}>{item.question}</ThemedText>
                    <Feather 
                      name={expandedId === item.id ? "chevron-up" : "chevron-down"} 
                      size={18} 
                      color={theme.textMuted} 
                    />
                  </View>
                </Pressable>
                {expandedId === item.id && (
                  <View style={[styles.faqAnswer, { backgroundColor: theme.backgroundSecondary }]}>
                    <ThemedText style={[styles.faqAnswerText, { color: theme.textSecondary }]}>
                      {item.answer}
                    </ThemedText>
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.sectionTitle}>Hurtiglenker</ThemedText>

          {visibleSupportLinks.map((link) => {
            const isVideo = link.settingKey === "help_show_videoguides";

            return (
              <Pressable
                key={link.label}
                onPress={() => handleOpenLink(link.url, link.onPress)}
                style={[
                  styles.helpLink,
                  { borderColor: theme.border },
                  isVideo && { backgroundColor: theme.accent + "12", borderColor: theme.accent + "40" },
                ]}
              >
                <View style={[styles.helpIcon, { backgroundColor: isVideo ? theme.accent + "20" : theme.backgroundSecondary }]}> 
                  <Feather name={isVideo ? "play-circle" : link.icon} size={20} color={isVideo ? theme.accent : Colors.dark.accent} />
                </View>
                <View style={styles.helpInfo}>
                  <ThemedText style={styles.helpLabel}>{link.label}</ThemedText>
                  <ThemedText style={[styles.helpDesc, { color: theme.textSecondary }]}>
                    {link.description}
                  </ThemedText>
                  {isVideo && (
                    <View style={[styles.badge, { backgroundColor: theme.accent }]}> 
                      <ThemedText style={styles.badgeText}>Video</ThemedText>
                    </View>
                  )}
                </View>
                <Feather name="external-link" size={18} color={theme.textMuted} />
              </Pressable>
            );
          })}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <View style={[styles.tipBox, { backgroundColor: theme.accent + "15", borderColor: theme.accent }]}>
          <Feather name="info" size={20} color={theme.accent} />
          <ThemedText style={[styles.tipText, { color: theme.text }]}>
            <ThemedText style={{ fontWeight: "600" }}>Tips: </ThemedText>
            Bruk Evendi Support-knappen øverst i Dashboard for rask hjelp. Vi svarer vanligvis innen 24 timer.
          </ThemedText>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: Spacing.md,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: Spacing.xs,
  },
  categoryTabs: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  categoryTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  categoryTabActive: {},
  categoryTabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  lastUpdated: {
    fontSize: 12,
    marginBottom: Spacing.md,
  },
  faqItem: {
    borderBottomWidth: 1,
    paddingVertical: Spacing.sm,
  },
  faqQuestion: {
    paddingVertical: Spacing.sm,
  },
  faqQuestionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    lineHeight: 22,
  },
  faqAnswer: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 14,
    marginVertical: Spacing.lg,
  },
  helpLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  helpInfo: {
    flex: 1,
  },
  helpLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  helpDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    marginTop: 6,
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },
  tipBox: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
