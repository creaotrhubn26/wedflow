import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight, HeaderButton } from "@react-navigation/elements";
import { EvendiIcon } from "@/components/EvendiIcon";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeIn } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import { optimizeImage, PHOTO_PRESET } from "@/lib/optimize-image";
import { uploadChatImage, isSupabaseConfigured } from "@/lib/supabase-storage";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl, apiRequest } from "@/lib/query-client";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { showToast } from "@/lib/toast";
import { showConfirm, showOptions } from "@/lib/dialogs";
import PersistentTextInput from "@/components/PersistentTextInput";

const COUPLE_STORAGE_KEY = "evendi_couple_session";

interface Message {
  id: string;
  conversationId: string;
  senderType: "couple" | "vendor";
  senderId: string;
  body: string;
  createdAt: string;
  readAt: string | null;
  editedAt: string | null;
  attachmentUrl?: string | null;
  attachmentType?: string | null;
}

interface ConversationDetails {
  conversation: any;
  vendor: {
    id: string;
    businessName: string;
    email: string;
    phone: string | null;
  };
  vendorTypingAt?: string | null;
}

type Props = NativeStackScreenProps<any, "Chat">;

export default function ChatScreen({ route, navigation }: Props) {
  const { conversationId } = route.params as { conversationId: string; vendorName: string };
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showVendorInfo, setShowVendorInfo] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const wsTypingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [vendorTypingWs, setVendorTypingWs] = useState(false);

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(new URL(`/api/couples/messages/${messageId}`, getApiUrl()).toString(), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!response.ok) throw new Error("Failed to delete message");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/couples/conversations", conversationId, "messages"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const editMessageMutation = useMutation({
    mutationFn: async ({ messageId, body }: { messageId: string; body: string }) => {
      const response = await fetch(new URL(`/api/couples/messages/${messageId}`, getApiUrl()).toString(), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ body }),
      });
      if (!response.ok) throw new Error("Failed to edit message");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/couples/conversations", conversationId, "messages"] });
      setEditingMessage(null);
      setMessageText("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(new URL(`/api/couples/conversations/${conversationId}`, getApiUrl()).toString(), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!response.ok) throw new Error("Failed to delete conversation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/couples/conversations"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    },
  });

  const handleDeleteMessage = async (messageId: string) => {
    const confirmed = await showConfirm({
      title: "Slett melding",
      message: "Er du sikker på at du vil slette denne meldingen? Dette kan ikke angres.",
      confirmLabel: "Slett",
      cancelLabel: "Avbryt",
      destructive: true,
    });
    if (!confirmed) return;
    deleteMessageMutation.mutate(messageId);
  };

  const handleEditMessage = (message: Message) => {
    setEditingMessage(message);
    setMessageText(message.body);
  };

  const handleCancelEdit = () => {
    setEditingMessage(null);
    setMessageText("");
  };

  const handleMessageAction = (message: Message) => {
    showOptions({
      title: "Meldingshandlinger",
      message: message.body,
      cancelLabel: "Avbryt",
      options: [
        { label: "Rediger", onPress: () => handleEditMessage(message) },
        { label: "Slett", destructive: true, onPress: () => handleDeleteMessage(message.id) },
      ],
    });
  };

  const handleDeleteConversation = async () => {
    const confirmed = await showConfirm({
      title: "Slett samtale",
      message: "Er du sikker på at du vil slette hele samtalen og alle meldinger? Dette kan ikke angres (GDPR).",
      confirmLabel: "Slett alt",
      cancelLabel: "Avbryt",
      destructive: true,
    });
    if (!confirmed) return;
    deleteConversationMutation.mutate();
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderButton onPress={handleDeleteConversation}>
          <EvendiIcon name="trash-2" size={20} color={theme.textSecondary} />
        </HeaderButton>
      ),
      headerRight: () => (
        <View style={{ flexDirection: "row", gap: 12 }}>
          <HeaderButton onPress={() => {
            setShowVendorInfo(!showVendorInfo);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}>
            <EvendiIcon name="info" size={20} color={showVendorInfo ? Colors.dark.accent : theme.text} />
          </HeaderButton>
          <HeaderButton onPress={() => navigation.goBack()}>
            <EvendiIcon name="x" size={24} color={theme.text} />
          </HeaderButton>
        </View>
      ),
    });
  }, [navigation, sessionToken, theme, showVendorInfo]);

  useEffect(() => {
    loadSession();
    loadDraft();
  }, []);

  const loadSession = async () => {
    const session = await AsyncStorage.getItem(COUPLE_STORAGE_KEY);
    if (session) {
      const parsed = JSON.parse(session);
      setSessionToken(parsed.sessionToken);
    }
  };

  const loadDraft = async () => {
    try {
      const draftKey = `couple_draft_${conversationId}`;
      const draft = await AsyncStorage.getItem(draftKey);
      if (draft) {
        setMessageText(draft);
      }
    } catch (error) {
      console.error("Error loading draft:", error);
    }
  };

  const saveDraft = async (text: string) => {
    try {
      const draftKey = `couple_draft_${conversationId}`;
      if (text.trim()) {
        await AsyncStorage.setItem(draftKey, text);
      } else {
        await AsyncStorage.removeItem(draftKey);
      }
    } catch (error) {
      console.error("Error saving draft:", error);
    }
  };

  const clearDraft = async () => {
    const draftKey = `couple_draft_${conversationId}`;
    await AsyncStorage.removeItem(draftKey);
  };

  const updateTypingStatus = async () => {
    if (!sessionToken) return;
    try {
      await fetch(
        new URL(`/api/couples/conversations/${conversationId}/typing`, getApiUrl()).toString(),
        {
          method: "POST",
          headers: { Authorization: `Bearer ${sessionToken}` },
        }
      );
    } catch (error) {
      // Silently fail - typing indicator is not critical
    }
  };

  const handleTextChange = (text: string) => {
    setMessageText(text);
    saveDraft(text);
    
    // Send typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    updateTypingStatus();
    typingTimeoutRef.current = setTimeout(() => {
      // Stop typing after 3 seconds of inactivity
    }, 3000) as unknown as NodeJS.Timeout;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showToast("Vi trenger tilgang til bildene dine for å kunne sende bilder.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      const optimizedUri = await optimizeImage(result.assets[0].uri, PHOTO_PRESET);
      setSelectedImage(optimizedUri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const uploadImage = async (imageUri: string): Promise<string> => {
    // Use Supabase Storage if configured, otherwise use base64
    if (isSupabaseConfigured()) {
      return uploadChatImage(imageUri, conversationId, "couple");
    } else {
      // Fallback to base64 for development
      const response = await fetch(imageUri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
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
    refetchInterval: false,
  });

  const { data: conversationDetails } = useQuery<ConversationDetails>({
    queryKey: ["/api/couples/conversations", conversationId, "details"],
    queryFn: async () => {
      if (!sessionToken) throw new Error("No session token");
      const response = await fetch(
        new URL(`/api/couples/conversations/${conversationId}/details`, getApiUrl()).toString(),
        { headers: { Authorization: `Bearer ${sessionToken}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch conversation details");
      return response.json();
    },
    enabled: !!sessionToken && !!conversationId,
    refetchInterval: 30000,
  });

  const sendMutation = useMutation({
    mutationFn: async (messageData: { body: string; attachmentUrl?: string; attachmentType?: string }) => {
      const response = await fetch(new URL("/api/couples/messages", getApiUrl()).toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({ conversationId, ...messageData }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/couples/conversations", conversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/couples/conversations"] });
      setMessageText("");
      setSelectedImage(null);
      clearDraft();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });

  const handleSend = async () => {
    if (!messageText.trim() && !selectedImage) return;
    
    setIsUploading(true);
    try {
      let attachmentUrl: string | undefined;
      let attachmentType: string | undefined;
      
      if (selectedImage) {
        attachmentUrl = await uploadImage(selectedImage);
        attachmentType = "image/jpeg";
      }
      
      if (editingMessage) {
        editMessageMutation.mutate({ 
          messageId: editingMessage.id, 
          body: messageText.trim() 
        });
      } else {
        sendMutation.mutate({ 
          body: messageText.trim() || "📷 Bilde",
          attachmentUrl,
          attachmentType
        });
      }
    } catch (error) {
      showToast("Kunne ikke laste opp bildet. Prøv igjen.");
    } finally {
      setIsUploading(false);
    }
  };

  const renderAttachment = (item: Message) => {
    if (!item.attachmentUrl) return null;
    
    if (item.attachmentType?.startsWith("image")) {
      return (
        <Image 
          source={{ uri: item.attachmentUrl }} 
          style={styles.attachmentImage}
          resizeMode="cover"
        />
      );
    }
    
    return null;
  };

  const isVendorTyping = () => {
    if (vendorTypingWs) return true;
    if (!conversationDetails?.vendorTypingAt) return false;
    const typingTime = new Date(conversationDetails.vendorTypingAt).getTime();
    const now = new Date().getTime();
    return (now - typingTime) < 5000; // Show if typed within last 5 seconds
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
          <Pressable
            onLongPress={() => {
              if (isFromMe) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                handleMessageAction(item);
              }
            }}
            delayLongPress={500}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Melding fra ${isFromMe ? 'deg' : 'leverandør'}. ${item.body}`}
            accessibilityHint={isFromMe ? "Trykk og hold for å redigere eller slette" : undefined}
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
            {renderAttachment(item)}
            <View style={styles.messageFooter}>
              {item.editedAt && (
                <ThemedText
                  style={[
                    styles.editedLabel,
                    isFromMe ? styles.myEditedLabel : { color: theme.textMuted },
                  ]}
                >
                  redigert
                </ThemedText>
              )}
              <ThemedText
                style={[styles.messageTime, isFromMe ? styles.myMessageTime : { color: theme.textMuted }]}
              >
                {formatTime(item.createdAt)}
              </ThemedText>
            </View>
          </Pressable>
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

  useEffect(() => {
    if (!sessionToken || !conversationId) return;
    let closedByUs = false;
    let reconnectTimer: any = null;
    let retryCount = 0;
    const MAX_RETRIES = 3;

    const connect = () => {
      if (retryCount >= MAX_RETRIES) return;
      try {
        const wsUrl = getApiUrl().replace(/^http/, "ws") + `/ws/couples?token=${encodeURIComponent(sessionToken)}&conversationId=${encodeURIComponent(conversationId)}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        ws.onopen = () => { retryCount = 0; };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse((event as any).data);
            if (data?.type === "message" && data.payload) {
              const msg = data.payload as Message;
              queryClient.setQueryData<Message[]>(["/api/couples/conversations", conversationId, "messages"], (prev) => {
                const list = prev || [];
                return list.some((m) => m.id === msg.id) ? list : [...list, msg];
              });
            } else if (data?.type === "typing" && data.payload?.sender === "vendor") {
              setVendorTypingWs(true);
              if (wsTypingTimerRef.current) clearTimeout(wsTypingTimerRef.current);
              wsTypingTimerRef.current = setTimeout(() => setVendorTypingWs(false), 5000) as unknown as NodeJS.Timeout;
            }
          } catch {}
        };
        ws.onerror = () => {};
        ws.onclose = () => {
          if (!closedByUs) {
            retryCount++;
            const delay = Math.min(3000 * Math.pow(2, retryCount), 30000);
            reconnectTimer = setTimeout(connect, delay);
          }
        };
      } catch {
        retryCount++;
        if (retryCount < MAX_RETRIES) {
          const delay = Math.min(3000 * Math.pow(2, retryCount), 30000);
          reconnectTimer = setTimeout(connect, delay);
        }
      }
    };

    connect();
    return () => {
      closedByUs = true;
      try { wsRef.current?.close(); } catch {}
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsTypingTimerRef.current) clearTimeout(wsTypingTimerRef.current);
    };
  }, [sessionToken, conversationId]);

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {showVendorInfo && conversationDetails?.vendor && (
        <View style={[styles.vendorInfoCard, { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
          <View style={styles.vendorInfoRow}>
            <EvendiIcon name="briefcase" size={16} color={Colors.dark.accent} />
            <ThemedText style={styles.vendorInfoText}>{conversationDetails.vendor.businessName}</ThemedText>
          </View>
          <View style={styles.vendorInfoRow}>
            <EvendiIcon name="mail" size={16} color={theme.textMuted} />
            <ThemedText style={[styles.vendorInfoText, { color: theme.textSecondary }]}>
              {conversationDetails.vendor.email}
            </ThemedText>
          </View>
          {conversationDetails.vendor.phone && (
            <View style={styles.vendorInfoRow}>
              <EvendiIcon name="phone" size={16} color={theme.textMuted} />
              <ThemedText style={[styles.vendorInfoText, { color: theme.textSecondary }]}>
                {conversationDetails.vendor.phone}
              </ThemedText>
            </View>
          )}
          <Pressable 
            onPress={() => setShowVendorInfo(false)}
            style={styles.closeInfoBtn}
          >
            <EvendiIcon name="x" size={16} color={theme.textMuted} />
          </Pressable>
        </View>
      )}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.md,
          paddingBottom: Spacing.md,
        }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />
      {isVendorTyping() && (
        <View style={[styles.typingIndicator, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.typingDots}>
            <View style={[styles.typingDot, { backgroundColor: theme.textMuted }]} />
            <View style={[styles.typingDot, { backgroundColor: theme.textMuted }]} />
            <View style={[styles.typingDot, { backgroundColor: theme.textMuted }]} />
          </View>
          <ThemedText style={[styles.typingText, { color: theme.textMuted }]}>
            {conversationDetails?.vendor.businessName} skriver...
          </ThemedText>
        </View>
      )}
      {selectedImage && (
        <View style={[styles.imagePreview, { backgroundColor: theme.backgroundRoot, borderTopColor: theme.border }]}>
          <Image source={{ uri: selectedImage }} style={styles.previewImage} resizeMode="cover" />
          <Pressable 
            onPress={() => setSelectedImage(null)}
            style={styles.removeImageBtn}
          >
            <EvendiIcon name="x-circle" size={24} color="#fff" />
          </Pressable>
        </View>
      )}
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.backgroundDefault, borderColor: theme.border, paddingBottom: insets.bottom || Spacing.md },
        ]}
      >
        {editingMessage && (
          <View style={[styles.editingBanner, { backgroundColor: theme.backgroundElevated, borderBottomColor: theme.border }]}>
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.editingLabel, { color: Colors.dark.accent }]}>
                Redigerer melding
              </ThemedText>
              <ThemedText numberOfLines={1} style={[styles.editingPreview, { color: theme.textMuted }]}>
                {editingMessage.body}
              </ThemedText>
            </View>
            <Pressable onPress={handleCancelEdit} hitSlop={8}>
              <EvendiIcon name="x" size={20} color={theme.textSecondary} />
            </Pressable>
          </View>
        )}
        <View style={styles.inputRow}>
          <Pressable 
            onPress={pickImage}
            style={styles.imagePickerBtn}
          >
            <EvendiIcon name="image" size={20} color={selectedImage ? Colors.dark.accent : theme.textMuted} />
          </Pressable>
          <PersistentTextInput
            draftKey="ChatScreen-input-1"
            style={[styles.textInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
            placeholder="Skriv en melding..."
            placeholderTextColor={theme.textMuted}
            value={messageText}
            onChangeText={handleTextChange}
            multiline
            maxLength={1000}
            accessible={true}
            accessibilityLabel="Meldingstekst"
            accessibilityHint={editingMessage ? "Rediger melding" : "Skriv en ny melding"}
          />
          <Pressable
            onPress={handleSend}
            disabled={(!messageText.trim() && !selectedImage) || sendMutation.isPending || editMessageMutation.isPending || isUploading}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={editingMessage ? "Lagre endringer" : "Send melding"}
            accessibilityState={{ disabled: (!messageText.trim() && !selectedImage) || sendMutation.isPending || editMessageMutation.isPending || isUploading }}
            style={[
              styles.sendBtn,
              {
                backgroundColor: (messageText.trim() || selectedImage) ? Colors.dark.accent : theme.backgroundSecondary,
                opacity: sendMutation.isPending || editMessageMutation.isPending ? 0.5 : 1,
              },
            ]}
          >
            {sendMutation.isPending || editMessageMutation.isPending || isUploading ? (
              <ActivityIndicator size="small" color="#1A1A1A" />
            ) : (
              <EvendiIcon name={editingMessage ? "check" : "send"} size={18} color={(messageText.trim() || selectedImage) ? "#1A1A1A" : theme.textMuted} />
            )}
          </Pressable>
        </View>
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
    paddingVertical: Spacing.lg,
    paddingTop: Spacing.md,
  },
  dateText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.6,
  },
  messageRow: {
    marginBottom: 2,
    paddingHorizontal: Spacing.md,
  },
  messageRowLeft: {
    alignItems: "flex-start",
  },
  messageRowRight: {
    alignItems: "flex-end",
  },
  messageBubble: {
    maxWidth: "75%",
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
    justifyContent: "center",
  },
  myBubble: {
    borderBottomRightRadius: 6,
  },
  theirBubble: {
    borderBottomLeftRadius: 6,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  myMessageText: {
    color: "#000000",
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 5,
    marginTop: 3,
  },
  editedLabel: {
    fontSize: 12,
    fontStyle: "italic",
    marginRight: -1,
    fontWeight: "500",
  },
  myEditedLabel: {
    color: "rgba(0,0,0,0.7)",
  },
  messageTime: {
    fontSize: 12,
    fontWeight: "500",
  },
  myMessageTime: {
    color: "rgba(0,0,0,0.75)",
  },
  inputContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
  },
  editingBanner: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  editingLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  editingPreview: {
    fontSize: 13,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.sm,
    paddingBottom: Spacing.sm,
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
  },
  sendBtn: {
    minWidth: 44,
    minHeight: 44,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  vendorInfoCard: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.xs,
  },
  vendorInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  vendorInfoText: {
    fontSize: 14,
  },
  closeInfoBtn: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    padding: Spacing.xs,
  },
  attachmentImage: {
    width: "100%",
    height: 200,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xs,
  },
  typingIndicator: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  typingDots: {
    flexDirection: "row",
    gap: 4,
  },
  typingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.6,
  },
  typingText: {
    fontSize: 13,
    fontStyle: "italic",
  },
  imagePreview: {
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  previewImage: {
    width: "100%",
    height: 150,
    borderRadius: BorderRadius.md,
  },
  removeImageBtn: {
    position: "absolute",
    top: Spacing.md + 8,
    right: Spacing.md + 8,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 12,
  },
  imagePickerBtn: {
    padding: Spacing.sm,
    marginRight: Spacing.xs,
  },
});
