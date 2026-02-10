import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight, HeaderButton } from "@react-navigation/elements";
import { EvendiIcon } from "@/components/EvendiIcon";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeIn } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import { uploadChatImage, isSupabaseConfigured } from "@/lib/supabase-storage";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useEventType } from "@/hooks/useEventType";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

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
  id: string;
  couple: {
    id: string;
    displayName: string;
    email: string;
    lastActiveAt: string | null;
  };
  coupleTypingAt?: string | null;
}

type Props = NativeStackScreenProps<RootStackParamList, "VendorChat">;

export default function VendorChatScreen({ route, navigation }: Props) {
  const { conversationId } = route.params as { conversationId: string; coupleName: string };
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { isWedding } = useEventType();
  const queryClient = useQueryClient();
  const flatListRef = useRef<FlatList>(null);

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [showQuickReplies, setShowQuickReplies] = useState(false);
  const [quickReplyCategory, setQuickReplyCategory] = useState<string>("all");
  const [customQuickReplies, setCustomQuickReplies] = useState<Array<{ id: string; label: string; message: string; category: string; color: string }>>([]);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [newTemplateLabel, setNewTemplateLabel] = useState("");
  const [newTemplateMessage, setNewTemplateMessage] = useState("");
  const [newTemplateCategory, setNewTemplateCategory] = useState("custom");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [showCoupleInfo, setShowCoupleInfo] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const wsTypingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [coupleTypingWs, setCoupleTypingWs] = useState(false);

  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: string) => {
      const response = await fetch(new URL(`/api/vendor/messages/${messageId}`, getApiUrl()).toString(), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!response.ok) throw new Error("Failed to delete message");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/conversations", conversationId, "messages"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const editMessageMutation = useMutation({
    mutationFn: async ({ messageId, body }: { messageId: string; body: string }) => {
      const response = await fetch(new URL(`/api/vendor/messages/${messageId}`, getApiUrl()).toString(), {
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
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/conversations", conversationId, "messages"] });
      setEditingMessage(null);
      setMessageText("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(new URL(`/api/vendor/conversations/${conversationId}`, getApiUrl()).toString(), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!response.ok) throw new Error("Failed to delete conversation");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/conversations"] });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.goBack();
    },
  });

  const handleDeleteMessage = (messageId: string) => {
    Alert.alert(
      "Slett melding",
      "Er du sikker på at du vil slette denne meldingen? Dette kan ikke angres.",
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Slett",
          style: "destructive",
          onPress: () => deleteMessageMutation.mutate(messageId),
        },
      ]
    );
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
    Alert.alert(
      "Meldingshandlinger",
      message.body,
      [
        {
          text: "Rediger",
          onPress: () => handleEditMessage(message),
        },
        {
          text: "Slett",
          style: "destructive",
          onPress: () => handleDeleteMessage(message.id),
        },
        { text: "Avbryt", style: "cancel" },
      ]
    );
  };

  const handleDeleteConversation = () => {
    Alert.alert(
      "Slett samtale",
      "Er du sikker på at du vil slette hele samtalen og alle meldinger? Dette kan ikke angres (GDPR).",
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Slett alt",
          style: "destructive",
          onPress: () => deleteConversationMutation.mutate(),
        },
      ]
    );
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <HeaderButton onPress={handleDeleteConversation}>
          <EvendiIcon name="trash-2" size={20} color={theme.textSecondary} />
        </HeaderButton>
      ),
      headerRight: () => (
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <HeaderButton onPress={() => setShowSearch(!showSearch)}>
            <EvendiIcon name="search" size={20} color={theme.text} />
          </HeaderButton>
          <HeaderButton onPress={() => setShowCoupleInfo(!showCoupleInfo)}>
            <EvendiIcon name="user" size={20} color={theme.text} />
          </HeaderButton>
          <HeaderButton onPress={() => navigation.goBack()}>
            <EvendiIcon name="x" size={24} color={theme.text} />
          </HeaderButton>
        </View>
      ),
    });
  }, [navigation, sessionToken, theme, showSearch, showCoupleInfo]);

  useEffect(() => {
    loadSession();
    loadDraft();
  }, []);

  const loadSession = async () => {
    const session = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
    if (session) {
      const parsed = JSON.parse(session);
      setSessionToken(parsed.sessionToken);
    }
  };

  const loadDraft = async () => {
    const draftKey = `vendor_draft_${conversationId}`;
    const draft = await AsyncStorage.getItem(draftKey);
    if (draft) {
      setMessageText(draft);
    }
  };

  const saveDraft = async (text: string) => {
    const draftKey = `vendor_draft_${conversationId}`;
    if (text.trim()) {
      await AsyncStorage.setItem(draftKey, text);
    } else {
      await AsyncStorage.removeItem(draftKey);
    }
  };

  const clearDraft = async () => {
    const draftKey = `vendor_draft_${conversationId}`;
    await AsyncStorage.removeItem(draftKey);
  };

  const updateTypingStatus = async () => {
    if (!sessionToken) return;
    try {
      await fetch(
        new URL(`/api/vendor/conversations/${conversationId}/typing`, getApiUrl()).toString(),
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
      Alert.alert("Tillatelse nødvendig", "Vi trenger tilgang til bildene dine for å kunne sende bilder.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0]) {
      setSelectedImage(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const uploadImage = async (imageUri: string): Promise<string> => {
    // Use Supabase Storage if configured, otherwise use base64
    if (isSupabaseConfigured()) {
      return uploadChatImage(imageUri, conversationId, "vendor");
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

  const { data: conversationDetails } = useQuery<ConversationDetails>({
    queryKey: ["/api/vendor/conversations", conversationId, "details"],
    queryFn: async () => {
      if (!sessionToken) return null;
      const response = await fetch(
        new URL(`/api/vendor/conversations/${conversationId}`, getApiUrl()).toString(),
        { headers: { Authorization: `Bearer ${sessionToken}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch conversation");
      return response.json();
    },
    enabled: !!sessionToken && !!conversationId,
    refetchInterval: 30000,
  });

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
    refetchInterval: false,
  });

  const formatLastActive = (dateStr: string | null): string => {
    if (!dateStr) return "Aldri aktiv";
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 5) return "Aktiv nå";
    if (diffMins < 60) return `Aktiv ${diffMins} min siden`;
    if (diffHours < 24) return `Aktiv ${diffHours}t siden`;
    if (diffDays === 1) return "Aktiv i går";
    if (diffDays < 7) return `Aktiv ${diffDays} dager siden`;
    return date.toLocaleDateString("nb-NO", { day: "numeric", month: "short" });
  };

  // ---- Quick Message Templates (built-in + custom) ----
  // Context: Vendor replying TO a couple — organized by wedding workflow stage
  const CUSTOM_TEMPLATES_KEY = "wedflow_vendor_custom_quick_templates";

  const builtInTemplates = [
    // --- Booking & inquiry replies (most common vendor-to-couple context) ---
    { id: "inq-1", label: "Takk for henvendelsen", message: "Tusen takk for henvendelsen! Jeg er ledig den datoen og vil gjerne høre mer om planene deres. Kan vi avtale et møte?", category: "inquiry", color: "#2196F3" },
    { id: "inq-2", label: "Pris & pakker", message: "Så hyggelig! Jeg sender over prisinfo og pakketilbudene mine. Ta gjerne en titt og si ifra om noe passer.", category: "inquiry", color: "#9C27B0" },
    { id: "inq-3", label: "Ikke ledig", message: "Takk for at dere tenkte på meg! Dessverre er jeg booket den datoen. Lykke til med planleggingen! 💛", category: "inquiry", color: "#FF9800" },
    { id: "inq-4", label: "Avtale møte", message: "Flott! La oss ta et uforpliktende møte. Passer det for dere denne uken? Jeg er fleksibel på tidspunkt.", category: "inquiry", color: "#4CAF50" },

    // --- Booking confirmed ---
    { id: "book-1", label: "Gleder meg!", message: "Perfekt! Jeg gleder meg til å jobbe med dere. Kontrakten er på vei — sjekk e-posten. 🎉", category: "booking", color: "#E91E63" },
    { id: "book-2", label: "Tilbud sendt", message: "Tilbudet er sendt — sjekk innboksen din. Si ifra om du har noen spørsmål!", category: "booking", color: "#2196F3" },
    { id: "book-3", label: "Kontrakt signert", message: "✅ Kontrakten er mottatt og alt er i orden! Jeg kommer tilbake med en detaljert tidsplan etter hvert.", category: "booking", color: "#4CAF50" },

    // --- Pre-wedding planning ---
    { id: "plan-1", label: "Tidsplan klar", message: isWedding ? "📋 Tidsplanen for bryllupsdagen er klar! Sjekk den og gi meg beskjed om noe bør justeres." : "📋 Tidsplanen for arrangementet er klar! Sjekk den og gi meg beskjed om noe bør justeres.", category: "planning", color: "#2196F3" },
    { id: "plan-2", label: "Trenger info", message: "Hei! Jeg trenger noen detaljer fra dere for å planlegge best mulig. Kan dere sende meg adresse og kontaktinfo for lokalet?", category: "planning", color: "#FF9800" },
    { id: "plan-3", label: "Befaring avtalt", message: "Befaring av lokalet er avtalt — jeg tar kontakt med dem direkte. Dere trenger ikke gjøre noe mer her!", category: "planning", color: "#4CAF50" },

    // --- Wedding day coordination ---
    { id: "wd-onway", label: "På vei", message: "🚗 Jeg er på vei til lokalet nå! Regner med å være der ca. kl. {tid}.", category: "weddingday", color: "#2196F3" },
    { id: "wd-arrived", label: "Er fremme", message: "📍 Jeg er på plass og setter opp utstyret. Alt ser bra ut!", category: "weddingday", color: "#4CAF50" },
    { id: "wd-ready", label: "Alt klart", message: "✅ Alt er klart fra min side! Bare gi signal når vi skal begynne.", category: "weddingday", color: "#4CAF50" },
    { id: "wd-delay", label: "Litt forsinket", message: "⏰ Beklager — vi er ca. 15 min forsinket. Holder dere oppdatert!", category: "weddingday", color: "#FF9800" },

    // --- Post-wedding / delivery ---
    { id: "del-1", label: "Levering snart", message: "Bildene/videoen er nesten ferdig! Dere kan forvente leveranse innen {antall} dager. 📸", category: "delivery", color: "#9C27B0" },
    { id: "del-2", label: "Galleriet er klart", message: "🎉 Galleriet er klart! Dere finner det her: [link]. Håper dere blir fornøyde!", category: "delivery", color: "#E91E63" },
    { id: "del-3", label: "Sniktitt", message: "Her er en liten sniktitt fra bryllupet deres! 🫶 Resten kommer snart.", category: "delivery", color: "#E91E63" },
  ];

  const allQuickTemplates = [...builtInTemplates, ...customQuickReplies.map((t) => ({ ...t, isCustom: true }))];
  const filteredQuickTemplates = quickReplyCategory === "all"
    ? allQuickTemplates
    : allQuickTemplates.filter((t) => t.category === quickReplyCategory);

  const quickReplyCategories = [
    { value: "all", label: "Alle", icon: "grid" as const },
    { value: "inquiry", label: "Henvendelse", icon: "message-circle" as const },
    { value: "booking", label: "Booking", icon: "check-square" as const },
    { value: "planning", label: "Planlegging", icon: "calendar" as const },
    { value: "weddingday", label: isWedding ? "Bryllupsdag" : "Arrangementsdagen", icon: "heart" as const },
    { value: "delivery", label: "Levering", icon: "package" as const },
    ...(customQuickReplies.length > 0 ? [{ value: "custom", label: "Mine", icon: "star" as const }] : []),
  ];

  // Load custom templates from AsyncStorage
  useEffect(() => {
    AsyncStorage.getItem(CUSTOM_TEMPLATES_KEY).then((raw) => {
      if (raw) {
        try {
          setCustomQuickReplies(JSON.parse(raw));
        } catch (e) {
          console.warn("Failed to parse custom quick templates:", e);
        }
      }
    });
  }, []);

  const saveCustomTemplate = useCallback(() => {
    if (!newTemplateLabel.trim() || !newTemplateMessage.trim()) {
      Alert.alert("Feil", "Navn og melding er påkrevd");
      return;
    }
    const newTemplate = {
      id: `custom-${Date.now()}`,
      label: newTemplateLabel.trim(),
      message: newTemplateMessage.trim(),
      category: newTemplateCategory,
      color: "#9C27B0",
    };
    const updated = [...customQuickReplies, newTemplate];
    setCustomQuickReplies(updated);
    AsyncStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
    setNewTemplateLabel("");
    setNewTemplateMessage("");
    setNewTemplateCategory("custom");
    setShowCreateTemplate(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [newTemplateLabel, newTemplateMessage, newTemplateCategory, customQuickReplies]);

  const deleteCustomTemplate = useCallback((templateId: string) => {
    Alert.alert("Slett mal", "Er du sikker på at du vil slette denne malen?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Slett",
        style: "destructive",
        onPress: () => {
          const updated = customQuickReplies.filter((t) => t.id !== templateId);
          setCustomQuickReplies(updated);
          AsyncStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(updated));
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  }, [customQuickReplies]);

  const sendMutation = useMutation({
    mutationFn: async (messageData: { body: string; attachmentUrl?: string; attachmentType?: string }) => {
      const response = await fetch(new URL("/api/vendor/messages", getApiUrl()).toString(), {
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
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/conversations", conversationId, "messages"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/conversations"] });
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
      Alert.alert("Feil", "Kunne ikke laste opp bildet. Prøv igjen.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    setMessageText(reply);
    setShowQuickReplies(false);
    saveDraft(reply);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  const isCoupleTyping = () => {
    if (coupleTypingWs) return true;
    if (!conversationDetails?.coupleTypingAt) return false;
    const typingTime = new Date(conversationDetails.coupleTypingAt).getTime();
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
            accessibilityLabel={`Melding fra ${isFromMe ? 'deg' : conversationDetails?.couple?.displayName || 'par'}. ${item.body}`}
            accessibilityHint={isFromMe ? "Trykk og hold for å redigere eller slette" : undefined}
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
                { color: isFromMe ? "#000000" : theme.text },
              ]}
            >
              {item.body}
            </ThemedText>
            {renderAttachment(item)}
            <View style={styles.messageFooter}>
              {item.editedAt && (
                <ThemedText
                  style={[
                    styles.editedLabel,
                    { color: isFromMe ? "rgba(0,0,0,0.7)" : theme.textMuted },
                  ]}
                >
                  redigert
                </ThemedText>
              )}
              <ThemedText
                style={[
                  styles.messageTime,
                  { color: isFromMe ? "rgba(0,0,0,0.75)" : theme.textMuted },
                ]}
              >
                {formatTime(item.createdAt)}
              </ThemedText>
              {isFromMe ? (
                <View style={styles.readReceipt}>
                  {item.readAt ? (
                    <EvendiIcon name="check-circle" size={13} color="rgba(0,0,0,0.8)" />
                  ) : (
                    <EvendiIcon name="check" size={13} color="rgba(0,0,0,0.65)" />
                  )}
                </View>
              ) : null}
            </View>
          </Pressable>
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

  const lastActiveText = formatLastActive(conversationDetails?.couple?.lastActiveAt ?? null);
  const isActive = lastActiveText === "Aktiv nå";

  const filteredMessages = searchQuery
    ? messages.filter(msg => msg.body.toLowerCase().includes(searchQuery.toLowerCase()))
    : messages;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      {showSearch && (
        <View style={[styles.searchBar, { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
          <EvendiIcon name="search" size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Søk i meldinger..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery("")}>
              <EvendiIcon name="x" size={18} color={theme.textMuted} />
            </Pressable>
          )}
        </View>
      )}

      {showCoupleInfo && conversationDetails?.couple && (
        <View style={[styles.coupleInfoCard, { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
          <View style={styles.coupleInfoRow}>
            <EvendiIcon name="user" size={16} color={Colors.dark.accent} />
            <ThemedText style={styles.coupleInfoText}>{conversationDetails.couple.displayName}</ThemedText>
          </View>
          <View style={styles.coupleInfoRow}>
            <EvendiIcon name="mail" size={16} color={theme.textMuted} />
            <ThemedText style={[styles.coupleInfoText, { color: theme.textSecondary }]}>
              {conversationDetails.couple.email}
            </ThemedText>
          </View>
          <Pressable 
            onPress={() => setShowCoupleInfo(false)}
            style={styles.closeInfoBtn}
          >
            <EvendiIcon name="x" size={16} color={theme.textMuted} />
          </Pressable>
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={filteredMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.md,
          paddingHorizontal: Spacing.md,
          paddingBottom: Spacing.md,
        }}
        ListHeaderComponent={
          <View style={[styles.lastActiveBar, { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
            <View style={[styles.activeIndicator, { backgroundColor: isActive ? "#4CAF50" : theme.textMuted }]} />
            <ThemedText style={[styles.lastActiveText, { color: isActive ? "#4CAF50" : theme.textMuted }]}>
              {lastActiveText}
            </ThemedText>
          </View>
        }
        inverted={false}
        onContentSizeChange={() => {
          if (filteredMessages.length > 0) {
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

        {showQuickReplies && (
          <View style={[styles.quickRepliesContainer, { backgroundColor: theme.backgroundRoot, borderBottomColor: theme.border }]}>
            <View style={styles.quickRepliesHeader}>
              <ThemedText style={[styles.quickRepliesTitle, { color: theme.textSecondary }]}>
                ⚡ Hurtigmeldinger
              </ThemedText>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Pressable onPress={() => setShowCreateTemplate(true)}>
                  <EvendiIcon name="plus" size={16} color={Colors.dark.accent} />
                </Pressable>
                <Pressable onPress={() => setShowQuickReplies(false)}>
                  <EvendiIcon name="x" size={16} color={theme.textMuted} />
                </Pressable>
              </View>
            </View>
            {/* Category Filters */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
              {quickReplyCategories.map((cat) => (
                <Pressable
                  key={cat.value}
                  onPress={() => { setQuickReplyCategory(cat.value); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: quickReplyCategory === cat.value ? Colors.dark.accent + "20" : theme.backgroundDefault,
                      borderColor: quickReplyCategory === cat.value ? Colors.dark.accent : theme.border,
                    },
                  ]}
                >
                  <EvendiIcon name={cat.icon} size={12} color={quickReplyCategory === cat.value ? Colors.dark.accent : theme.textMuted} />
                  <ThemedText style={[styles.categoryChipText, { color: quickReplyCategory === cat.value ? Colors.dark.accent : theme.textSecondary }]}>
                    {cat.label}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
            {/* Template Chips */}
            <ScrollView style={{ maxHeight: 200 }}>
              <View style={styles.quickRepliesGrid}>
                {filteredQuickTemplates.map((template) => (
                  <Pressable
                    key={template.id}
                    onPress={() => handleQuickReply(template.message)}
                    onLongPress={() => {
                      if ("isCustom" in template && template.isCustom) {
                        deleteCustomTemplate(template.id);
                      }
                    }}
                    style={[styles.quickReplyChip, { backgroundColor: template.color + "15", borderColor: template.color }]}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <ThemedText style={[styles.quickReplyLabel, { color: template.color }]}>{template.label}</ThemedText>
                      {"isCustom" in template && (template as any).isCustom && (
                        <EvendiIcon name="star" size={10} color={template.color} />
                      )}
                    </View>
                    <ThemedText style={[styles.quickReplyText, { color: theme.textSecondary }]} numberOfLines={1}>{template.message}</ThemedText>
                  </Pressable>
                ))}
                {filteredQuickTemplates.length === 0 && (
                  <ThemedText style={{ fontSize: 13, color: theme.textMuted, textAlign: "center", paddingVertical: 8 }}>
                    Ingen maler i denne kategorien
                  </ThemedText>
                )}
              </View>
            </ScrollView>
            {/* Create new template button */}
            <Pressable
              onPress={() => setShowCreateTemplate(true)}
              style={[styles.addTemplateBtn, { borderColor: Colors.dark.accent }]}
            >
              <EvendiIcon name="plus" size={14} color={Colors.dark.accent} />
              <ThemedText style={{ fontSize: 12, color: Colors.dark.accent, fontWeight: "600" }}>Ny mal</ThemedText>
            </Pressable>
          </View>
        )}

        {/* Create Custom Template Modal */}
        <Modal visible={showCreateTemplate} animationType="slide" transparent>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
                <View style={styles.modalHeader}>
                  <ThemedText style={styles.modalTitle}>Opprett ny hurtigmelding</ThemedText>
                  <Pressable onPress={() => setShowCreateTemplate(false)}>
                    <EvendiIcon name="x" size={20} color={theme.textSecondary} />
                  </Pressable>
                </View>
                <TextInput
                  style={[styles.modalInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                  placeholder="Navn / Label (f.eks. Fremme)"
                  placeholderTextColor={theme.textMuted}
                  value={newTemplateLabel}
                  onChangeText={setNewTemplateLabel}
                  maxLength={40}
                />
                <TextInput
                  style={[styles.modalInput, styles.modalTextArea, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
                  placeholder="Melding (f.eks. 🏛️ Vi er fremme og klare!)"
                  placeholderTextColor={theme.textMuted}
                  value={newTemplateMessage}
                  onChangeText={setNewTemplateMessage}
                  multiline
                  maxLength={200}
                />
                <ThemedText style={[styles.charCount, { color: theme.textMuted }]}>{newTemplateMessage.length}/200</ThemedText>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
                  {["general", "status", "timing", "location", "coordination", "custom"].map((cat) => (
                    <Pressable
                      key={cat}
                      onPress={() => setNewTemplateCategory(cat)}
                      style={[styles.categoryChip, {
                        backgroundColor: newTemplateCategory === cat ? Colors.dark.accent + "20" : theme.backgroundRoot,
                        borderColor: newTemplateCategory === cat ? Colors.dark.accent : theme.border,
                      }]}
                    >
                      <ThemedText style={{ fontSize: 12, color: newTemplateCategory === cat ? Colors.dark.accent : theme.textSecondary }}>
                        {cat === "general" ? "Svar" : cat === "status" ? "Status" : cat === "timing" ? "Tid" : cat === "location" ? "Sted" : cat === "coordination" ? "Team" : "Egen"}
                      </ThemedText>
                    </Pressable>
                  ))}
                </ScrollView>
                <Pressable
                  onPress={saveCustomTemplate}
                  style={[styles.saveTemplateBtn, { backgroundColor: Colors.dark.accent, opacity: (!newTemplateLabel.trim() || !newTemplateMessage.trim()) ? 0.5 : 1 }]}
                  disabled={!newTemplateLabel.trim() || !newTemplateMessage.trim()}
                >
                  <EvendiIcon name="save" size={16} color="#1A1A1A" />
                  <ThemedText style={{ fontSize: 14, fontWeight: "600", color: "#1A1A1A" }}>Lagre</ThemedText>
                </Pressable>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {isCoupleTyping() && (
          <View style={[styles.typingIndicator, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.typingDots}>
              <View style={[styles.typingDot, { backgroundColor: theme.textMuted }]} />
              <View style={[styles.typingDot, { backgroundColor: theme.textMuted }]} />
              <View style={[styles.typingDot, { backgroundColor: theme.textMuted }]} />
            </View>
            <ThemedText style={[styles.typingText, { color: theme.textMuted }]}>
              {conversationDetails?.couple.displayName} skriver...
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

        <View style={styles.inputRow}>
          <Pressable 
            onPress={() => {
              setShowQuickReplies(!showQuickReplies);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={styles.quickReplyBtn}
          >
            <EvendiIcon name="zap" size={20} color={showQuickReplies ? Colors.dark.accent : theme.textMuted} />
          </Pressable>
          <Pressable 
            onPress={pickImage}
            style={styles.imagePickerBtn}
          >
            <EvendiIcon name="image" size={20} color={selectedImage ? Colors.dark.accent : theme.textMuted} />
          </Pressable>
          <TextInput
            style={[
              styles.textInput,
              { backgroundColor: theme.backgroundRoot, color: theme.text },
            ]}
            placeholder="Skriv en melding..."
            placeholderTextColor={theme.textMuted}
            value={messageText}
            onChangeText={handleTextChange}
            multiline
            maxLength={2000}
            accessible={true}
            accessibilityLabel="Meldingstekst"
            accessibilityHint={editingMessage ? "Rediger melding" : isWedding ? "Skriv en ny melding til paret" : "Skriv en ny melding til kunden"}
          />
          <Pressable
            onPress={handleSend}
            disabled={(!messageText.trim() && !selectedImage) || sendMutation.isPending || editMessageMutation.isPending || isUploading}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={editingMessage ? "Lagre endringer" : "Send melding"}
            accessibilityState={{ disabled: (!messageText.trim() && !selectedImage) || sendMutation.isPending || editMessageMutation.isPending || isUploading }}
            style={[
              styles.sendButton,
              {
                backgroundColor: (messageText.trim() || selectedImage) ? Colors.dark.accent : theme.backgroundRoot,
              },
            ]}
          >
            {sendMutation.isPending || editMessageMutation.isPending || isUploading ? (
              <ActivityIndicator size="small" color="#1A1A1A" />
            ) : (
              <EvendiIcon
                name={editingMessage ? "check" : "send"}
                size={20}
                color={messageText.trim() ? "#1A1A1A" : theme.textMuted}
              />
            )}
          </Pressable>
        </View>
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
    paddingVertical: Spacing.lg,
    paddingTop: Spacing.md,
  },
  dateSeparatorText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    opacity: 0.6,
  },
  messageRow: {
    flexDirection: "row",
    marginBottom: 2,
    paddingHorizontal: Spacing.md,
  },
  messageRowMine: {
    justifyContent: "flex-end",
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
  messageText: {
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.1,
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
  messageTime: {
    fontSize: 12,
    fontWeight: "500",
  },
  readReceipt: {
    marginLeft: 1,
  },
  lastActiveBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: 6,
  },
  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  lastActiveText: {
    fontSize: 12,
    fontWeight: "500",
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
  quickReplyBtn: {
    minWidth: 44,
    minHeight: 44,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
  },
  sendButton: {
    minWidth: 44,
    minHeight: 44,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    borderBottomWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: Spacing.xs,
  },
  coupleInfoCard: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.xs,
  },
  coupleInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  coupleInfoText: {
    fontSize: 14,
  },
  closeInfoBtn: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    padding: Spacing.xs,
  },
  quickRepliesContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  quickRepliesHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  quickRepliesTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  quickRepliesGrid: {
    gap: Spacing.xs,
  },
  quickReplyChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  quickReplyText: {
    fontSize: 14,
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
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 6,
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: "600",
  },
  quickReplyLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  addTemplateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 8,
    marginTop: 8,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  modalInput: {
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
    borderWidth: 1,
  },
  modalTextArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 11,
    textAlign: "right",
    marginTop: -4,
  },
  saveTemplateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    marginTop: 8,
  },
});
