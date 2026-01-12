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
import { getApiUrl } from "@/lib/query-client";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

interface Message {
  id: string;
  conversationId: string;
  senderType: "couple" | "vendor";
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
}

type Props = NativeStackScreenProps<any, "VendorChat">;

export default function VendorChatScreen({ route }: Props) {
  const { conversationId } = route.params as { conversationId: string; coupleName: string };
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
    const session = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
    if (session) {
      const parsed = JSON.parse(session);
      setSessionToken(parsed.sessionToken);
    }
  };

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: ["/api/vendor/conversations", conversationId, "messages"],
    queryFn: async () => {
      if (!sessionToken) return [];
      const response = await fetch(
        new URL(`/api/vendor/conversations/${conversationId}/messages`, getApiUrl()).toString(),
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
      const response = await fetch(new URL("/api/vendor/messages", getApiUrl()).toString(), {
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
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/conversations", conversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/conversations"] });
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
    const isFromMe = item.senderType === "vendor";
    const showDateSeparator =
      index === 0 ||
      new Date(messages[index - 1].createdAt).toDateString() !== new Date(item.createdAt).toDateString();

    return (
      <Animated.View entering={FadeIn.duration(200)}>
        {showDateSeparator ? (
          <View style={styles.dateSeparator}>
            <ThemedText style={[styles.dateSeparatorText, { color: theme.textMuted }]}>
              {formatDateSeparator(item.createdAt)}
            </ThemedText>
          </View>
        ) : null}
        <View style={[styles.messageRow, isFromMe && styles.messageRowMine]}>
          <View
            style={[
              styles.messageBubble,
              isFromMe
                ? { backgroundColor: Colors.dark.accent }
                : { backgroundColor: theme.backgroundDefault, borderWidth: 1, borderColor: theme.border },
            ]}
          >
            <ThemedText
              style={[
                styles.messageText,
                { color: isFromMe ? "#1A1A1A" : theme.text },
              ]}
            >
              {item.body}
            </ThemedText>
            <ThemedText
              style={[
                styles.messageTime,
                { color: isFromMe ? "rgba(0,0,0,0.6)" : theme.textMuted },
              ]}
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
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.accent} />
        </View>
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
          paddingHorizontal: Spacing.md,
          paddingBottom: Spacing.md,
        }}
        inverted={false}
        onContentSizeChange={() => {
          if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: false });
          }
        }}
      />

      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.backgroundDefault,
            borderTopColor: theme.border,
            paddingBottom: insets.bottom > 0 ? insets.bottom : Spacing.md,
          },
        ]}
      >
        <TextInput
          style={[
            styles.textInput,
            { backgroundColor: theme.backgroundRoot, color: theme.text },
          ]}
          placeholder="Skriv en melding..."
          placeholderTextColor={theme.textMuted}
          value={messageText}
          onChangeText={setMessageText}
          multiline
          maxLength={2000}
        />
        <Pressable
          onPress={handleSend}
          disabled={!messageText.trim() || sendMutation.isPending}
          style={[
            styles.sendButton,
            {
              backgroundColor: messageText.trim() ? Colors.dark.accent : theme.backgroundRoot,
            },
          ]}
        >
          {sendMutation.isPending ? (
            <ActivityIndicator size="small" color="#1A1A1A" />
          ) : (
            <Feather
              name="send"
              size={20}
              color={messageText.trim() ? "#1A1A1A" : theme.textMuted}
            />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dateSeparator: {
    alignItems: "center",
    paddingVertical: Spacing.md,
  },
  dateSeparatorText: {
    fontSize: 13,
    fontWeight: "500",
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  messageRowMine: {
    justifyContent: "flex-end",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    alignSelf: "flex-end",
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
    maxHeight: 120,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
});
