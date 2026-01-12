import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeIn } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl, apiRequest } from "@/lib/query-client";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

const COUPLE_STORAGE_KEY = "wedflow_couple_session";

interface Message {
  id: string;
  conversationId: string;
  senderType: "couple" | "vendor";
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

type Props = NativeStackScreenProps<any, "Chat">;

export default function ChatScreen({ route }: Props) {
  const { conversationId } = route.params as { conversationId: string; vendorName: string };
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    const session = await AsyncStorage.getItem(COUPLE_STORAGE_KEY);
    if (session) {
      const parsed = JSON.parse(session);
      setSessionToken(parsed.sessionToken);
    }
  };

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/couples/conversations", conversationId, "messages"],
    queryFn: async () => {
      if (!sessionToken) return [];
      const response = await fetch(
        new URL(`/api/couples/conversations/${conversationId}/messages`, getApiUrl()).toString(),
        { headers: { Authorization: `Bearer ${sessionToken}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
    enabled: !!sessionToken && !!conversationId,
    refetchInterval: 5000,
  });

  const sendMutation = useMutation({
    mutationFn: async (body: string) => {
      const response = await fetch(new URL("/api/couples/messages", getApiUrl()).toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ conversationId, body }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/couples/conversations", conversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/couples/conversations"] });
      setMessageText("");
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });

  const handleSend = () => {
    if (!messageText.trim()) return;
    sendMutation.mutate(messageText.trim());
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" });
  };

  const formatDateSeparator = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "I dag";
    if (days === 1) return "I går";
    return date.toLocaleDateString("no-NO", { day: "numeric", month: "long" });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isFromMe = item.senderType === "couple";
    const showDateSeparator =
      index === 0 ||
      new Date(messages[index - 1].createdAt).toDateString() !== new Date(item.createdAt).toDateString();

    return (
      <Animated.View entering={FadeIn.duration(200)}>
        {showDateSeparator ? (
          <View style={styles.dateSeparator}>
            <ThemedText style={[styles.dateText, { color: theme.textMuted }]}>
              {formatDateSeparator(item.createdAt)}
            </ThemedText>
          </View>
        ) : null}
        <View style={[styles.messageRow, isFromMe ? styles.messageRowRight : styles.messageRowLeft]}>
          <View
            style={[
              styles.messageBubble,
              isFromMe
                ? [styles.myBubble, { backgroundColor: Colors.dark.accent }]
                : [styles.theirBubble, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }],
            ]}
          >
            <ThemedText style={[styles.messageText, isFromMe ? styles.myMessageText : null]}>
              {item.body}
            </ThemedText>
            <ThemedText
              style={[styles.messageTime, isFromMe ? styles.myMessageTime : { color: theme.textMuted }]}
            >
              {formatTime(item.createdAt)}
            </ThemedText>
          </View>
        </View>
      </Animated.View>
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.dark.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: Spacing.md,
          paddingHorizontal: Spacing.md,
        }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.border, paddingBottom: insets.bottom || Spacing.md },
        ]}
      >
        <TextInput
          style={[styles.textInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
          placeholder="Skriv en melding..."
          placeholderTextColor={theme.textMuted}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={1000}
        />
        <Pressable
          onPress={handleSend}
          disabled={!messageText.trim() || sendMutation.isPending}
          style={[
            styles.sendBtn,
            {
              backgroundColor: messageText.trim() ? Colors.dark.accent : theme.backgroundSecondary,
              opacity: sendMutation.isPending ? 0.5 : 1,
            },
          ]}
        >
          {sendMutation.isPending ? (
            <ActivityIndicator size="small" color="#1A1A1A" />
          ) : (
            <Feather name="send" size={18} color={messageText.trim() ? "#1A1A1A" : theme.textMuted} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  dateSeparator: {
    alignItems: "center",
    marginVertical: Spacing.md,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "500",
  },
  messageRow: {
    marginBottom: Spacing.sm,
  },
  messageRowLeft: {
    alignItems: "flex-start",
  },
  messageRowRight: {
    alignItems: "flex-end",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  myBubble: {
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  myMessageText: {
    color: "#1A1A1A",
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  myMessageTime: {
    color: "#1A1A1A99",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
