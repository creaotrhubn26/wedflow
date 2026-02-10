import React, { useEffect, useState, useRef, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  TextInput,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Modal,
  ScrollView,
  Linking,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useHeaderHeight } from "@react-navigation/elements";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { showToast } from "@/lib/toast";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import type { VideoGuide } from "@shared/schema";

interface AdminMessage {
  id: string;
  conversationId: string;
  senderType: "vendor" | "admin";
  senderId: string;
  body: string;
  createdAt: string;
  videoGuideId?: string;
}

type Props = NativeStackScreenProps<RootStackParamList, "AdminVendorMessages">;

type WsMessageEvent = { data: string };

export default function AdminVendorMessagesScreen({ route, navigation }: Props) {
  const { conversationId, vendorName, adminKey } = route.params;
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();

  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const wsTypingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [vendorTypingWs, setVendorTypingWs] = useState(false);
  const listRef = useRef<FlatList<{ type: "sep"; id: string; label: string } | { type: "msg"; id: string; m: AdminMessage }> | null>(null);

  const { data: videoGuides = [] } = useQuery<VideoGuide[], Error>({
    queryKey: ["video-guides"],
    queryFn: async () => {
      const url = new URL("/api/video-guides", getApiUrl());
      const res = await fetch(url);
      if (!res.ok) throw new Error("Kunne ikke hente videoguider");
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    },
    retry: 2,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const items = useMemo(() => {
    // Build a list with date separators
    const out: Array<{ type: "sep"; id: string; label: string } | { type: "msg"; id: string; m: AdminMessage }> = [];
    let lastDay = "";
    for (const m of messages) {
      const d = new Date(m.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (key !== lastDay) {
        const now = new Date();
        const dayOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const diffDays = Math.round((todayOnly.getTime() - dayOnly.getTime()) / (1000 * 60 * 60 * 24));
        const label = diffDays === 0 ? "I dag" : diffDays === 1 ? "I går" : d.toLocaleDateString();
        out.push({ type: "sep", id: `sep-${key}`, label });
        lastDay = key;
      }
      out.push({ type: "msg", id: m.id, m });
    }
    return out;
  }, [messages]);

  const fetchMessages = useCallback(async (showSpinner = true) => {
    if (!adminKey) {
      setLoading(false);
      return;
    }
    try {
      if (showSpinner) setLoading(true);
      const url = new URL(`/api/admin/vendor-admin-conversations/${conversationId}/messages`, getApiUrl());
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) throw new Error("Kunne ikke hente meldinger");
      const data = await res.json();
      setMessages(data.reverse());
    } catch (e) {
      console.error(e);
      showToast((e as Error).message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [adminKey, conversationId]);

  const sendReply = async () => {
    if (!replyText.trim() && !selectedGuideId) return;
    if (!adminKey) {
      showToast("Logg inn som admin for a sende svar.");
      return;
    }
    try {
      setSending(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const url = new URL(`/api/admin/vendor-admin-conversations/${conversationId}/messages`, getApiUrl());
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify({ 
          body: replyText.trim(),
          videoGuideId: selectedGuideId || undefined,
        }),
      });
      if (!res.ok) throw new Error("Kunne ikke sende svar");
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setReplyText("");
      setSelectedGuideId(null);
    } catch (e) {
      showToast((e as Error).message);
    } finally {
      setSending(false);
    }
  };

  const notifyTyping = async () => {
    try {
      const url = new URL(`/api/admin/vendor-admin-conversations/${conversationId}/typing`, getApiUrl());
      await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${adminKey}` } });
    } catch {}
  };

  const handleChangeText = (text: string) => {
    setReplyText(text);
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    // Fire immediately and then debounce further calls for 2s
    notifyTyping();
    typingTimerRef.current = setTimeout(() => {
      typingTimerRef.current = null;
    }, 2000);
  };

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  useEffect(() => {
    // Auto-scroll to bottom when new content arrives
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [items.length]);

  // WS subscribe for live updates
  useEffect(() => {
    if (!adminKey || !conversationId) return;
    let closedByUs = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      try {
        const wsUrl = getApiUrl().replace(/^http/, "ws") + `/ws/admin/vendor-admin?adminKey=${encodeURIComponent(adminKey)}&conversationId=${encodeURIComponent(conversationId)}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        ws.onmessage = (event: WsMessageEvent) => {
          try {
            const payloadText = typeof event.data === "string" ? event.data : "";
            if (!payloadText) return;
            const data = JSON.parse(payloadText) as {
              type?: string;
              payload?: AdminMessage & { sender?: string };
            };
            if (data?.type === "message" && data.payload) {
              const msg = data.payload as AdminMessage;
              setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
            } else if (data?.type === "typing" && data.payload?.sender === "vendor") {
              setVendorTypingWs(true);
              if (wsTypingTimerRef.current) clearTimeout(wsTypingTimerRef.current);
              wsTypingTimerRef.current = setTimeout(() => setVendorTypingWs(false), 4000);
            }
          } catch {}
        };
        ws.onclose = () => {
          if (!closedByUs) reconnectTimer = setTimeout(connect, 3000);
        };
      } catch {
        reconnectTimer = setTimeout(connect, 3000);
      }
    };

    connect();
    return () => {
      closedByUs = true;
      try { wsRef.current?.close(); } catch {}
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (wsTypingTimerRef.current) clearTimeout(wsTypingTimerRef.current);
    };
  }, [adminKey, conversationId]);

  const openGuide = async (guideId: string) => {
    const guide = videoGuides.find((g) => g.id === guideId);
    if (!guide?.videoUrl) {
      showToast("Denne videoguiden mangler URL.");
      return;
    }
    try {
      const canOpen = await Linking.canOpenURL(guide.videoUrl);
      if (!canOpen) {
        showToast("Enheten din kan ikke åpne denne lenken.");
        return;
      }
      await Linking.openURL(guide.videoUrl);
    } catch (error) {
      showToast("Kunne ikke åpne videoguiden akkurat nå.");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundRoot }]} edges={["top", "bottom"]}>
      <View style={[styles.header, { paddingTop: headerHeight + Spacing.md }]}>
        <ThemedText style={styles.title}>{vendorName || "Leverandør"}</ThemedText>
        <ThemedText style={styles.subtitle}>Evendi Support Chat</ThemedText>
      </View>

      {loading && <ActivityIndicator style={{ marginTop: Spacing.lg }} color={theme.accent} />}
      {!loading && (
        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={(it) => it.id}
          contentContainerStyle={{ padding: Spacing.md, paddingTop: 0 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchMessages(false); }} />}
          renderItem={({ item }) => {
            if (item.type === "sep") {
              return (
                <View style={styles.sepWrap}>
                  <View style={styles.sepLine} />
                  <ThemedText style={styles.sepText}>{item.label}</ThemedText>
                  <View style={styles.sepLine} />
                </View>
              );
            }
            const m = item.m;
            return (
              <Pressable
                onLongPress={async () => {
                  try {
                    await Clipboard.setStringAsync(m.body);
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  } catch {}
                }}
                style={[
                  styles.bubble,
                  m.senderType === "vendor"
                    ? [styles.vendorBubble, { backgroundColor: theme.backgroundSecondary }]
                    : [styles.adminBubble, { backgroundColor: theme.accent + "20" }],
                ]}
              >
                <ThemedText style={[styles.senderLabel, { color: m.senderType === "admin" ? theme.accent : theme.textSecondary }]}>
                  {m.senderType === "admin" ? "Du (Admin)" : "Leverandør"}
                </ThemedText>
                {m.body && <ThemedText style={styles.body}>{m.body}</ThemedText>}
                {m.videoGuideId && (
                  <Pressable
                    onPress={() => openGuide(m.videoGuideId || "")}
                    style={[styles.guideRef, { backgroundColor: theme.accent + "15", borderColor: theme.accent }]}
                  >
                    <Feather name="video" size={14} color={theme.accent} />
                    <ThemedText style={[styles.guideRefText, { color: theme.accent }]}>
                      {videoGuides.find((g) => g.id === m.videoGuideId)?.title || "Videoguide"}
                    </ThemedText>
                    <Feather name="external-link" size={12} color={theme.accent} />
                  </Pressable>
                )}
                <ThemedText style={styles.meta}>{new Date(m.createdAt).toLocaleString()}</ThemedText>
              </Pressable>
            );
          }}
        />
      )}

      {vendorTypingWs && (
        <View style={{ paddingHorizontal: Spacing.md, paddingBottom: 4 }}>
          <ThemedText style={{ fontSize: 12, color: theme.textMuted }}>Leverandør skriver…</ThemedText>
        </View>
      )}

      {selectedGuideId && (
        <View style={[styles.selectedGuideBar, { backgroundColor: theme.accent + "10", borderColor: theme.accent }]}>
          <Feather name="video" size={16} color={theme.accent} />
          <ThemedText style={[styles.selectedGuideText, { color: theme.accent, flex: 1 }]}>
            {videoGuides.find((g) => g.id === selectedGuideId)?.title || "Videoguide"}
          </ThemedText>
          <Pressable onPress={() => setSelectedGuideId(null)}>
            <Feather name="x" size={16} color={theme.accent} />
          </Pressable>
        </View>
      )}

      <View style={[styles.quickRow]}> 
        {[
          "Takk for meldingen! Vi ser på saken.",
          "Kan du dele skjermbilde og flere detaljer?",
          "Vi er på saken – kommer tilbake snart.",
        ].map((t) => (
          <Pressable
            key={t}
            onPress={() => setReplyText((prev) => (prev ? prev + " " + t : t))}
            style={[styles.quickChip, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
          >
            <ThemedText style={styles.quickText}> {t} </ThemedText>
          </Pressable>
        ))}
      </View>

      <View style={[styles.inputBar, { backgroundColor: theme.backgroundSecondary }]}>
        <Pressable
          style={[styles.guideBtn, { backgroundColor: selectedGuideId ? theme.accent : theme.backgroundDefault }]}
          onPress={() => setShowGuideModal(true)}
        >
          <Feather name="video" size={18} color={selectedGuideId ? "#FFFFFF" : theme.textSecondary} />
        </Pressable>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholder="Svar på melding…"
          placeholderTextColor={theme.textMuted}
          value={replyText}
          onChangeText={handleChangeText}
          editable={!loading && !sending}
          multiline
        />
        <Pressable
          style={[styles.sendBtn, { backgroundColor: theme.accent }]}
          onPress={sendReply}
          disabled={sending || (!replyText.trim() && !selectedGuideId)}
        >
          {sending ? <ActivityIndicator color="#FFFFFF" /> : <Feather name="send" size={18} color="#FFFFFF" />}
        </Pressable>
      </View>

      <Modal visible={showGuideModal} transparent animationType="slide">
        <SafeAreaView style={[styles.modal, { backgroundColor: theme.backgroundRoot }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.backgroundSecondary }]}>
            <ThemedText style={styles.modalTitle}>Velg videoguide</ThemedText>
            <Pressable onPress={() => setShowGuideModal(false)}>
              <Feather name="x" size={20} color={theme.text} />
            </Pressable>
          </View>
          <ScrollView style={styles.modalContent} contentContainerStyle={{ padding: Spacing.md }}>
            {videoGuides.length === 0 ? (
              <ThemedText style={{ textAlign: "center", color: theme.textMuted, marginTop: Spacing.lg }}>
                Ingen videoguider tilgjengelig
              </ThemedText>
            ) : (
              videoGuides.map((guide) => (
                <Pressable
                  key={guide.id}
                  onPress={() => {
                    setSelectedGuideId(guide.id);
                    setShowGuideModal(false);
                  }}
                  style={[
                    styles.guideOption,
                    {
                      backgroundColor: selectedGuideId === guide.id ? theme.accent + "20" : theme.backgroundSecondary,
                      borderColor: selectedGuideId === guide.id ? theme.accent : theme.border,
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.guideOptionTitle}>{guide.title}</ThemedText>
                    <ThemedText style={[styles.guideOptionDesc, { color: theme.textSecondary }]}>
                      {guide.category}
                    </ThemedText>
                  </View>
                  {selectedGuideId === guide.id && (
                    <Feather name="check" size={18} color={theme.accent} />
                  )}
                </Pressable>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  title: { fontSize: 18, fontWeight: "700" },
  subtitle: { fontSize: 12, opacity: 0.6, marginTop: 2 },
  bubble: { borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  vendorBubble: { alignSelf: "flex-start" },
  adminBubble: { alignSelf: "flex-end" },
  senderLabel: { fontSize: 11, fontWeight: "600", marginBottom: Spacing.xs },
  body: { fontSize: 14, lineHeight: 20 },
  meta: { fontSize: 11, opacity: 0.6, marginTop: 4 },
  guideRef: { borderWidth: 1, borderRadius: BorderRadius.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  guideRefText: { fontSize: 12, fontWeight: "600", flex: 1 },
  sepWrap: { flexDirection: "row", alignItems: "center", gap: 8, marginVertical: Spacing.sm, paddingHorizontal: Spacing.md },
  sepLine: { flex: 1, height: 1, opacity: 0.3, backgroundColor: "#888" },
  sepText: { fontSize: 11, opacity: 0.7 },
  quickRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  quickChip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  quickText: { fontSize: 12 },
  selectedGuideBar: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderBottomWidth: 1, marginHorizontal: Spacing.md },
  selectedGuideText: { fontSize: 12, fontWeight: "600" },
  inputBar: { flexDirection: "row", alignItems: "flex-end", padding: Spacing.sm, gap: Spacing.sm },
  guideBtn: { height: 44, width: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  input: { flex: 1, maxHeight: 100, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, backgroundColor: "#2D2D2D" },
  sendBtn: { height: 44, width: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  modal: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  modalTitle: { fontSize: 16, fontWeight: "700" },
  modalContent: { flex: 1 },
  guideOption: { borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm, flexDirection: "row", alignItems: "center", gap: Spacing.md },
  guideOptionTitle: { fontSize: 14, fontWeight: "600", marginBottom: Spacing.xs },
  guideOptionDesc: { fontSize: 12 },
});
