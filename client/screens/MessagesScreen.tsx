import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

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

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export default function MessagesScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    const session = await AsyncStorage.getItem(COUPLE_STORAGE_KEY);
    if (session) {
      const parsed = JSON.parse(session);
      setSessionToken(parsed.sessionToken);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  };

  const { data: conversations = [], isLoading, refetch, isRefetching } = useQuery<Conversation[]>({
    queryKey: ["/api/couples/conversations"],
    queryFn: async () => {
      if (!sessionToken) return [];
      const response = await fetch(new URL("/api/couples/conversations", getApiUrl()).toString(), {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!response.ok) throw new Error("Failed to fetch conversations");
      return response.json();
    },
    enabled: !!sessionToken,
  });

  const handleLogout = async () => {
    await AsyncStorage.removeItem(COUPLE_STORAGE_KEY);
    setSessionToken(null);
    setIsLoggedIn(false);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" });
    } else if (days === 1) {
      return "I går";
    } else if (days < 7) {
      return date.toLocaleDateString("no-NO", { weekday: "short" });
    } else {
      return date.toLocaleDateString("no-NO", { day: "numeric", month: "short" });
    }
  };

  if (isLoggedIn === null) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.dark.accent} />
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.loginPrompt, { paddingTop: headerHeight + Spacing.xl }]}>
          <View style={[styles.iconCircle, { backgroundColor: Colors.dark.accent + "20" }]}>
            <Feather name="message-circle" size={32} color={Colors.dark.accent} />
          </View>
          <ThemedText style={styles.loginTitle}>Meldinger</ThemedText>
          <ThemedText style={[styles.loginSubtitle, { color: theme.textSecondary }]}>
            Logg inn for å se dine samtaler med leverandører
          </ThemedText>
          <Pressable
            onPress={() => navigation.navigate("CoupleLogin")}
            style={[styles.loginBtn, { backgroundColor: Colors.dark.accent }]}
          >
            <ThemedText style={styles.loginBtnText}>Logg inn</ThemedText>
          </Pressable>
        </View>
      </View>
    );
  }

  const renderConversation = ({ item, index }: { item: Conversation; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate("Chat", { conversationId: item.id, vendorName: item.vendor.businessName });
        }}
        style={[styles.conversationItem, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
      >
        <View style={[styles.avatar, { backgroundColor: Colors.dark.accent + "20" }]}>
          <Feather name="briefcase" size={20} color={Colors.dark.accent} />
        </View>
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <ThemedText style={styles.vendorName} numberOfLines={1}>
              {item.vendor.businessName}
            </ThemedText>
            <ThemedText style={[styles.time, { color: theme.textMuted }]}>
              {item.lastMessage ? formatTime(item.lastMessage.createdAt) : ""}
            </ThemedText>
          </View>
          {item.inspiration ? (
            <ThemedText style={[styles.inspirationTitle, { color: Colors.dark.accent }]} numberOfLines={1}>
              {item.inspiration.title}
            </ThemedText>
          ) : null}
          {item.lastMessage ? (
            <ThemedText style={[styles.lastMessage, { color: theme.textSecondary }]} numberOfLines={1}>
              {item.lastMessage.senderType === "couple" ? "Du: " : ""}
              {item.lastMessage.body}
            </ThemedText>
          ) : null}
        </View>
        {item.coupleUnreadCount > 0 ? (
          <View style={[styles.unreadBadge, { backgroundColor: Colors.dark.accent }]}>
            <ThemedText style={styles.unreadCount}>{item.coupleUnreadCount}</ThemedText>
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {isLoading ? (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={Colors.dark.accent} />
        </View>
      ) : conversations.length === 0 ? (
        <View style={[styles.emptyState, { paddingTop: headerHeight + Spacing.xl }]}>
          <View style={[styles.iconCircle, { backgroundColor: Colors.dark.accent + "20" }]}>
            <Feather name="inbox" size={32} color={Colors.dark.accent} />
          </View>
          <ThemedText style={styles.emptyTitle}>Ingen samtaler ennå</ThemedText>
          <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>
            Når du sender en henvendelse til en leverandør, vil samtalen vises her
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderConversation}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingTop: headerHeight + Spacing.md,
            paddingBottom: insets.bottom + Spacing.xl,
            paddingHorizontal: Spacing.md,
          }}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={Colors.dark.accent}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loginPrompt: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  loginSubtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  loginBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  loginBtnText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: "center",
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  conversationContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  conversationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  vendorName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  time: {
    fontSize: 12,
    marginLeft: Spacing.sm,
  },
  inspirationTitle: {
    fontSize: 13,
    marginTop: 2,
  },
  lastMessage: {
    fontSize: 14,
    marginTop: 4,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
    marginLeft: Spacing.sm,
  },
  unreadCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1A1A1A",
  },
});
