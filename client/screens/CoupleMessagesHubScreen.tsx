import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { EvendiIcon } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getImportantPeople, type ImportantPerson } from "@/lib/api-couple-data";
import { getAppLanguage, type AppLanguage } from "@/lib/storage";
import { showToast } from "@/lib/toast";
import type { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";

const COUPLE_STORAGE_KEY = "wedflow_couple_session";

interface Conversation {
  id: string;
  coupleId: string;
  vendorId: string;
  inspirationId: string | null;
  status: string;
  lastMessageAt: string;
  coupleUnreadCount: number;
  vendor: { id: string; businessName: string };
  inspiration: { id: string; title: string; coverImageUrl: string | null } | null;
  lastMessage: { body: string; senderType: string; createdAt: string } | null;
}

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

export default function CoupleMessagesHubScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [appLanguage, setAppLanguage] = useState<AppLanguage>("nb");
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    getAppLanguage().then(setAppLanguage);
    loadSession();
  }, []);

  const t = useCallback(
    (nb: string, en: string) => (appLanguage === "en" ? en : nb),
    [appLanguage]
  );

  const loadSession = async () => {
    const session = await AsyncStorage.getItem(COUPLE_STORAGE_KEY);
    if (session) {
      const parsed = JSON.parse(session);
      setSessionToken(parsed.sessionToken);
    }
  };

  // Vendor conversations
  const {
    data: conversations = [],
    isLoading: loadingConvos,
    refetch: refetchConvos,
  } = useQuery<Conversation[]>({
    queryKey: ["/api/couples/conversations"],
    queryFn: async () => {
      if (!sessionToken) return [];
      const response = await fetch(
        new URL("/api/couples/conversations", getApiUrl()).toString(),
        { headers: { Authorization: `Bearer ${sessionToken}` } }
      );
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!sessionToken,
  });

  // Important people
  const {
    data: people = [],
    isLoading: loadingPeople,
    refetch: refetchPeople,
  } = useQuery<ImportantPerson[]>({
    queryKey: ["important-people"],
    queryFn: getImportantPeople,
  });

  const totalUnread = useMemo(
    () => conversations.reduce((sum, c) => sum + (c.coupleUnreadCount || 0), 0),
    [conversations]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetchConvos(), refetchPeople()]);
    setRefreshing(false);
  }, [refetchConvos, refetchPeople]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0)
      return date.toLocaleTimeString("no-NO", {
        hour: "2-digit",
        minute: "2-digit",
      });
    if (days === 1) return t("I går", "Yesterday");
    if (days < 7)
      return date.toLocaleDateString(appLanguage === "en" ? "en-US" : "no-NO", {
        weekday: "short",
      });
    return date.toLocaleDateString(appLanguage === "en" ? "en-US" : "no-NO", {
      day: "numeric",
      month: "short",
    });
  };

  const handleCallPerson = (person: ImportantPerson) => {
    if (person.phone) {
      Linking.openURL(`tel:${person.phone}`);
    } else {
      showToast(
        t("Ingen telefonnummer registrert", "No phone number registered")
      );
    }
  };

  const handleSmsPerson = (person: ImportantPerson) => {
    if (person.phone) {
      Linking.openURL(`sms:${person.phone}`);
    } else {
      showToast(
        t("Ingen telefonnummer registrert", "No phone number registered")
      );
    }
  };

  const recentConversations = conversations
    .slice()
    .sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime()
    )
    .slice(0, 5);

  const isLoading = loadingConvos || loadingPeople;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: Spacing.md,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.md,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.accent}
        />
      }
    >
      {/* ── Vendor Messages ── */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate("CoupleMessages");
          }}
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: theme.accent + "20" },
              ]}
            >
              <EvendiIcon name="briefcase" size={22} color={theme.accent} />
            </View>
            <View style={styles.sectionHeaderText}>
              <ThemedText style={styles.sectionTitle}>
                {t("Leverandører", "Vendors")}
              </ThemedText>
              <ThemedText
                style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
              >
                {conversations.length === 0
                  ? t("Ingen samtaler ennå", "No conversations yet")
                  : t(
                      `${conversations.length} samtale${conversations.length !== 1 ? "r" : ""}`,
                      `${conversations.length} conversation${conversations.length !== 1 ? "s" : ""}`
                    )}
              </ThemedText>
            </View>
            {totalUnread > 0 && (
              <View
                style={[styles.badge, { backgroundColor: theme.accent }]}
              >
                <ThemedText
                  style={[styles.badgeText, { color: theme.buttonText }]}
                >
                  {totalUnread}
                </ThemedText>
              </View>
            )}
            <EvendiIcon
              name="chevron-right"
              size={20}
              color={theme.textMuted}
            />
          </View>

          {/* Recent vendor conversations preview */}
          {recentConversations.length > 0 && (
            <View style={styles.previewList}>
              {recentConversations.map((conv) => (
                <View
                  key={conv.id}
                  style={[
                    styles.previewItem,
                    { borderTopColor: theme.border },
                  ]}
                >
                  <View
                    style={[
                      styles.previewAvatar,
                      { backgroundColor: theme.accent + "15" },
                    ]}
                  >
                    <EvendiIcon
                      name="briefcase"
                      size={14}
                      color={theme.accent}
                    />
                  </View>
                  <View style={styles.previewContent}>
                    <ThemedText
                      style={styles.previewName}
                      numberOfLines={1}
                    >
                      {conv.vendor.businessName}
                    </ThemedText>
                    {conv.lastMessage && (
                      <ThemedText
                        style={[
                          styles.previewMessage,
                          { color: theme.textSecondary },
                        ]}
                        numberOfLines={1}
                      >
                        {conv.lastMessage.senderType === "couple"
                          ? `${t("Du", "You")}: `
                          : ""}
                        {conv.lastMessage.body}
                      </ThemedText>
                    )}
                  </View>
                  {conv.lastMessage && (
                    <ThemedText
                      style={[
                        styles.previewTime,
                        { color: theme.textMuted },
                      ]}
                    >
                      {formatTime(conv.lastMessage.createdAt)}
                    </ThemedText>
                  )}
                  {conv.coupleUnreadCount > 0 && (
                    <View
                      style={[
                        styles.smallBadge,
                        { backgroundColor: theme.accent },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.smallBadgeText,
                          { color: theme.buttonText },
                        ]}
                      >
                        {conv.coupleUnreadCount}
                      </ThemedText>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </Pressable>
      </Animated.View>

      {/* ── Important People ── */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <View
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: "#8B5CF620" },
              ]}
            >
              <EvendiIcon name="users" size={22} color="#8B5CF6" />
            </View>
            <View style={styles.sectionHeaderText}>
              <ThemedText style={styles.sectionTitle}>
                {t("Viktige personer", "Important people")}
              </ThemedText>
              <ThemedText
                style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
              >
                {t(
                  "Ring eller send SMS til bryllupsfølget",
                  "Call or text your wedding party"
                )}
              </ThemedText>
            </View>
          </View>

          {loadingPeople ? (
            <ActivityIndicator
              size="small"
              color={theme.accent}
              style={{ padding: Spacing.md }}
            />
          ) : people.length === 0 ? (
            <View style={[styles.emptySection, { borderTopColor: theme.border }]}>
              <EvendiIcon
                name="user-plus"
                size={20}
                color={theme.textMuted}
              />
              <ThemedText
                style={[styles.emptyText, { color: theme.textSecondary }]}
              >
                {t(
                  "Legg til viktige personer i Planlegging-fanen",
                  "Add important people in the Planning tab"
                )}
              </ThemedText>
            </View>
          ) : (
            <View style={styles.peopleList}>
              {people.slice(0, 6).map((person, idx) => (
                <View
                  key={person.id}
                  style={[
                    styles.personRow,
                    { borderTopColor: theme.border },
                  ]}
                >
                  <View
                    style={[
                      styles.personAvatar,
                      { backgroundColor: "#8B5CF615" },
                    ]}
                  >
                    <EvendiIcon name="user" size={14} color="#8B5CF6" />
                  </View>
                  <View style={styles.personInfo}>
                    <ThemedText
                      style={styles.personName}
                      numberOfLines={1}
                    >
                      {person.name}
                    </ThemedText>
                    <ThemedText
                      style={[
                        styles.personRole,
                        { color: theme.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {person.role}
                    </ThemedText>
                  </View>
                  <View style={styles.personActions}>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(
                          Haptics.ImpactFeedbackStyle.Light
                        );
                        handleCallPerson(person);
                      }}
                      style={[
                        styles.actionBtn,
                        {
                          backgroundColor: person.phone
                            ? "#10B98120"
                            : theme.backgroundSecondary,
                        },
                      ]}
                      accessibilityLabel={t(
                        `Ring ${person.name}`,
                        `Call ${person.name}`
                      )}
                    >
                      <EvendiIcon
                        name="phone"
                        size={16}
                        color={person.phone ? "#10B981" : theme.textMuted}
                      />
                    </Pressable>
                    <Pressable
                      onPress={() => {
                        Haptics.impactAsync(
                          Haptics.ImpactFeedbackStyle.Light
                        );
                        handleSmsPerson(person);
                      }}
                      style={[
                        styles.actionBtn,
                        {
                          backgroundColor: person.phone
                            ? theme.accent + "20"
                            : theme.backgroundSecondary,
                        },
                      ]}
                      accessibilityLabel={t(
                        `Send SMS til ${person.name}`,
                        `Text ${person.name}`
                      )}
                    >
                      <EvendiIcon
                        name="message-square"
                        size={16}
                        color={
                          person.phone ? theme.accent : theme.textMuted
                        }
                      />
                    </Pressable>
                  </View>
                </View>
              ))}
              {people.length > 6 && (
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    // Navigate to ImportantPeople in PlanningTab
                    navigation.getParent()?.navigate("PlanningTab", {
                      screen: "ImportantPeople",
                    });
                  }}
                  style={[styles.showMore, { borderTopColor: theme.border }]}
                >
                  <ThemedText
                    style={[styles.showMoreText, { color: theme.accent }]}
                  >
                    {t(
                      `Vis alle ${people.length} personer`,
                      `Show all ${people.length} people`
                    )}
                  </ThemedText>
                  <EvendiIcon
                    name="chevron-right"
                    size={16}
                    color={theme.accent}
                  />
                </Pressable>
              )}
            </View>
          )}
        </View>
      </Animated.View>

      {/* ── Evendi Support ── */}
      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate("CoupleAdminChat");
          }}
          style={[
            styles.sectionCard,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.sectionHeader}>
            <View
              style={[
                styles.sectionIcon,
                { backgroundColor: "#F5920020" },
              ]}
            >
              <EvendiIcon
                name="headphones"
                size={22}
                color="#F59200"
              />
            </View>
            <View style={styles.sectionHeaderText}>
              <ThemedText style={styles.sectionTitle}>
                {t("Evendi Support", "Evendi Support")}
              </ThemedText>
              <ThemedText
                style={[styles.sectionSubtitle, { color: theme.textSecondary }]}
              >
                {t(
                  "Chat med Evendi-teamet for hjelp",
                  "Chat with the Evendi team for help"
                )}
              </ThemedText>
            </View>
            <EvendiIcon
              name="chevron-right"
              size={20}
              color={theme.textMuted}
            />
          </View>
        </Pressable>
      </Animated.View>

      {/* ── Quick Actions ── */}
      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <ThemedText
          style={[styles.quickActionsTitle, { color: theme.textSecondary }]}
        >
          {t("Hurtighandlinger", "Quick actions")}
        </ThemedText>
        <View style={styles.quickActions}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("CoupleHelp");
            }}
            style={[
              styles.quickAction,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
              },
            ]}
          >
            <EvendiIcon name="help-circle" size={20} color={theme.accent} />
            <ThemedText style={styles.quickActionLabel}>
              {t("Hjelp & FAQ", "Help & FAQ")}
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("Feedback");
            }}
            style={[
              styles.quickAction,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
              },
            ]}
          >
            <EvendiIcon name="edit-3" size={20} color={theme.accent} />
            <ThemedText style={styles.quickActionLabel}>
              {t("Tilbakemelding", "Feedback")}
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              Linking.openURL("mailto:support@evendi.no");
            }}
            style={[
              styles.quickAction,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
              },
            ]}
          >
            <EvendiIcon name="mail" size={20} color={theme.accent} />
            <ThemedText style={styles.quickActionLabel}>
              {t("E-post", "Email")}
            </ThemedText>
          </Pressable>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
  },
  sectionIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  sectionHeaderText: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  sectionSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    marginRight: Spacing.sm,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  previewList: {},
  previewItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
  previewAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  previewContent: {
    flex: 1,
  },
  previewName: {
    fontSize: 14,
    fontWeight: "600",
  },
  previewMessage: {
    fontSize: 12,
    marginTop: 1,
  },
  previewTime: {
    fontSize: 11,
    marginLeft: Spacing.sm,
  },
  smallBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
    marginLeft: Spacing.xs,
  },
  smallBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  peopleList: {},
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
  personAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 14,
    fontWeight: "600",
  },
  personRole: {
    fontSize: 12,
    marginTop: 1,
  },
  personActions: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  emptySection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  emptyText: {
    fontSize: 13,
    flex: 1,
  },
  showMore: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    gap: Spacing.xs,
  },
  showMoreText: {
    fontSize: 13,
    fontWeight: "600",
  },
  quickActionsTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  quickActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  quickAction: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
});
