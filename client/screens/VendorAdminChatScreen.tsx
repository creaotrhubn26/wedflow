import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { StyleSheet, View, FlatList, TextInput, Pressable, ActivityIndicator, Linking, ScrollView, Text, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EvendiIcon } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { useQuery } from "@tanstack/react-query";
import type { AppSetting } from "../../shared/schema";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { showToast } from "@/lib/toast";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";
const WELCOME_MESSAGE = "Velkommen til Evendi Support!\n\nHer kan du kontakte oss direkte med spørsmål, problemer eller tilbakemeldinger. Vi svarer vanligvis innen 24 timer.\n\nFør du sender melding, sjekk våre ressurser:";
const HELP_LINKS = [
  { label: "Fullstendig Dokumentasjon", icon: "book-open" as const, screen: "Documentation" as const, url: null },
  { label: "Hjelp & FAQ", icon: "help-circle" as const, screen: null, url: null },
  { label: "Videoguider", icon: "video" as const, screen: null, url: "https://github.com/creaotrhubn26/wedflow/blob/main/VENDOR_DOCUMENTATION.md#videoguider" },
  { label: "Hva er nytt", icon: "star" as const, screen: "WhatsNew" as const, screenParams: { category: "vendor" }, url: null },
  { label: "Systemstatus", icon: "activity" as const, screen: "Status" as const, url: null },
  { label: "E-post Support", icon: "mail" as const, screen: null, url: "mailto:support@evendi.no" },
  { label: "Norwedfilm.no", icon: "globe" as const, screen: null, url: "https://norwedfilm.no" },
];

interface VendorSession { sessionToken: string; vendorId: string; email: string; businessName: string; }
interface AdminMessage { id: string; senderType: "vendor"|"admin"; body: string; createdAt: string; attachmentUrl?: string|null; attachmentType?: string|null; }
type MessageStatus = "pending" | "sent" | "error";
type ChatMessage = AdminMessage & { localId?: string; status?: MessageStatus };
interface AdminConversation { id: string; vendorId: string; lastMessageAt: string; }

export default function VendorAdminChatScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [conv, setConv] = useState<AdminConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlatList<ChatMessage>>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [unseenCount, setUnseenCount] = useState(0);
  const isFirstChat = useMemo(() => messages.length === 0, [messages.length]);

  // Fetch app settings to check for active status messages
  const { data: appSettings } = useQuery<AppSetting[]>({
    queryKey: ["app-settings"],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/app-settings`);
      if (!res.ok) throw new Error("Failed to fetch app settings");
      return res.json();
    },
  });

  const hasActiveStatus = useMemo(() => {
    if (!appSettings) return false;
    const maintenanceMode = appSettings.find((s) => s.key === "maintenance_mode")?.value === "true";
    const statusMessage = appSettings.find((s) => s.key === "status_message")?.value;
    return maintenanceMode || !!statusMessage;
  }, [appSettings]);

  // Filter help links based on admin settings
  const visibleHelpLinks = useMemo(() => {
    const getSetting = (key: string, defaultValue: string = "true") => {
      return appSettings?.find((s) => s.key === key)?.value ?? defaultValue;
    };

    return HELP_LINKS.filter((link) => {
      // Check visibility settings for each link
      switch (link.label) {
        case "Fullstendig Dokumentasjon":
          return getSetting("help_show_documentation", "true") === "true";
        case "Hjelp & FAQ":
          return getSetting("help_show_faq", "true") === "true";
        case "Videoguider":
          return getSetting("help_show_videoguides", "false") === "true";
        case "Hva er nytt":
          return getSetting("help_show_whatsnew", "true") === "true";
        case "Systemstatus":
          return getSetting("help_show_status", "true") === "true";
        case "E-post Support":
          return getSetting("help_show_email_support", "false") === "true";
        case "Norwedfilm.no":
          return getSetting("help_show_norwedfilm", "true") === "true";
        default:
          return true;
      }
    });
  }, [appSettings]);

  const loadSessionToken = async (): Promise<string|null> => {
    const raw = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
    if (!raw) return null;
    try { const parsed: VendorSession = JSON.parse(raw); return parsed.sessionToken; } catch { return null; }
  };

  const fetchConversation = useCallback(async () => {
    setLoading(true);
    try {
      const token = await loadSessionToken();
      if (!token) { showToast("Vennligst logg inn som leverandør."); return; }
      const url = new URL("/api/vendor/admin/conversation", getApiUrl());
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Kunne ikke hente admin-samtale");
      const data = await res.json();
      setConv(data);
    } catch (e) {
      console.error(e);
      showToast((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchMessages = useCallback(async () => {
    try {
      const token = await loadSessionToken();
      if (!token) return;
      const url = new URL("/api/vendor/admin/messages", getApiUrl());
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Kunne ikke hente meldinger");
      const data: AdminMessage[] = await res.json();
      setMessages(data.reverse());
    } catch (e) { console.error(e); }
  }, []);

  const sendMessage = useCallback(async () => {
    if (!input.trim()) return;
    try {
      setSending(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const token = await loadSessionToken();
      if (!token) return;
      // optimistic local message
      const localId = `local-${Date.now()}`;
      const body = input.trim();
      const optimistic: ChatMessage = {
        id: localId,
        localId,
        senderType: "vendor",
        body,
        createdAt: new Date().toISOString(),
        status: "pending",
      };
      setMessages(prev => [...prev, optimistic]);
      const url = new URL("/api/vendor/admin/messages", getApiUrl());
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ body })
      });
      if (!res.ok) throw new Error("Kunne ikke sende melding");
      const msg: AdminMessage = await res.json();
      setMessages(prev => prev.map(m => (m.localId === localId ? { ...msg, status: "sent" } : m)));
      setInput("");
    } catch (e) {
      // mark last local as error
      setMessages(prev => prev.map(m => (m.status === "pending" ? { ...m, status: "error" } : m)));
      showToast((e as Error).message);
    } finally {
      setSending(false);
    }
  }, [input]);

  const retrySend = useCallback(async (msg: ChatMessage) => {
    if (!msg || !msg.body) return;
    try {
      setSending(true);
      const token = await loadSessionToken();
      if (!token) return;
      setMessages(prev => prev.map(m => (m.id === msg.id ? { ...m, status: "pending" } : m)));
      const url = new URL("/api/vendor/admin/messages", getApiUrl());
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ body: msg.body })
      });
      if (!res.ok) throw new Error("Kunne ikke sende melding");
      const saved: AdminMessage = await res.json();
      setMessages(prev => prev.map(m => (m.id === msg.id ? { ...saved, status: "sent" } : m)));
    } catch (e) {
      setMessages(prev => prev.map(m => (m.id === msg.id ? { ...m, status: "error" } : m)));
      showToast((e as Error).message);
    } finally {
      setSending(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
  }, [fetchMessages]);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const threshold = 40;
    const atBottom = contentOffset.y + layoutMeasurement.height >= contentSize.height - threshold;
    setIsAtBottom(atBottom);
    if (atBottom) setUnseenCount(0);
  }, []);

  useEffect(() => {
    // auto-scroll on new messages if at bottom
    if (isAtBottom) {
      requestAnimationFrame(() => listRef.current?.scrollToEnd({ animated: true }));
    } else {
      setUnseenCount((c) => c + 1);
    }
  }, [messages.length]);

  useEffect(() => { fetchConversation().then(fetchMessages); }, [fetchConversation, fetchMessages]);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: any = null;
    let closedByUs = false;
    const typingTimers: { admin?: any } = {};

    const connect = async () => {
      try {
        const token = await loadSessionToken();
        if (!token) return;
        const apiUrl = getApiUrl();
        const wsUrl = apiUrl.replace(/^http/, "ws") + "/ws/vendor-admin?token=" + encodeURIComponent(token);
        ws = new WebSocket(wsUrl);
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data as any);
            if (data?.type === "message" && data.payload) {
              const msg = data.payload as AdminMessage;
              setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, { ...msg, status: "sent" }]));
            } else if (data?.type === "typing" && data.payload?.sender === "admin") {
              setUnseenCount((c) => c);
              // Show an inline typing indicator above input
              setInput((text) => text);
              if (typingTimers.admin) clearTimeout(typingTimers.admin);
              const indicator = setTimeout(() => {
                // nothing persistent to clear; vendor's local typing already shown via input length
              }, 3000);
              typingTimers.admin = indicator;
            }
          } catch {}
        };
        ws.onclose = () => {
          if (!closedByUs) {
            reconnectTimer = setTimeout(connect, 3000);
          }
        };
      } catch {
        reconnectTimer = setTimeout(connect, 3000);
      }
    };

    connect();

    return () => {
      closedByUs = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      try { ws?.close(); } catch {}
    };
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundRoot }]} edges={["top","bottom"]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <ThemedText style={styles.title}>Evendi Support</ThemedText>
          <ThemedText style={styles.subtitle}>Kommunikasjon med Evendi-teamet</ThemedText>
        </View>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <EvendiIcon name="x" size={24} color={theme.text} />
        </Pressable>
      </View>
      {loading && <ActivityIndicator style={{ marginTop: Spacing.lg }} color={theme.accent} />}
      {!loading && (
        <FlatList
          ref={listRef}
          data={isFirstChat ? [] : messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: Spacing.md, paddingTop: 0 }}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          ListHeaderComponent={
            <>
              {hasActiveStatus && (
                <View style={[styles.statusNotice, { 
                  backgroundColor: appSettings?.find(s => s.key === "maintenance_mode")?.value === "true" 
                    ? theme.error + "15" 
                    : appSettings?.find(s => s.key === "status_type")?.value === "warning"
                    ? "#FF8C00" + "15"
                    : theme.accent + "15",
                  borderColor: appSettings?.find(s => s.key === "maintenance_mode")?.value === "true"
                    ? theme.error
                    : appSettings?.find(s => s.key === "status_type")?.value === "warning"
                    ? "#FF8C00"
                    : theme.accent,
                }]}>
                  <EvendiIcon 
                    name={appSettings?.find(s => s.key === "maintenance_mode")?.value === "true" ? "tool" : "info"} 
                    size={20} 
                    color={appSettings?.find(s => s.key === "maintenance_mode")?.value === "true" 
                      ? theme.error 
                      : appSettings?.find(s => s.key === "status_type")?.value === "warning"
                      ? "#FF8C00"
                      : theme.accent
                    } 
                  />
                  <View style={{ flex: 1 }}>
                    <ThemedText style={[styles.statusNoticeTitle, { color: theme.text, fontWeight: "600" }]}>
                      {appSettings?.find(s => s.key === "maintenance_mode")?.value === "true" 
                        ? "Vedlikeholdsmodus"
                        : "Systemmelding"}
                    </ThemedText>
                    <ThemedText style={[styles.statusNoticeText, { color: theme.text }]}>
                      {appSettings?.find(s => s.key === "maintenance_mode")?.value === "true"
                        ? appSettings?.find(s => s.key === "maintenance_message")?.value || "Evendi er for øyeblikket under vedlikehold. Noen funksjoner kan være utilgjengelige."
                        : appSettings?.find(s => s.key === "status_message")?.value || ""}
                    </ThemedText>
                    <Pressable 
                      onPress={() => navigation.navigate("Status")}
                      style={{ marginTop: 8 }}
                    >
                      <ThemedText style={[styles.statusNoticeLink, { color: theme.accent }]}>
                        Se full status →
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>
              )}
              {isFirstChat && (
                <ScrollView contentContainerStyle={{ paddingTop: hasActiveStatus ? 0 : Spacing.md }}>
                  <View style={[styles.welcomeBox, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                  <View style={styles.welcomeHeader}>
                    <EvendiIcon name="message-circle" size={32} color={theme.accent} />
                    <ThemedText style={styles.welcomeTitle}>Evendi Support</ThemedText>
                  </View>
                  <ThemedText style={styles.welcomeBody}>{WELCOME_MESSAGE}</ThemedText>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.sm, marginBottom: Spacing.md }}>
                    <EvendiIcon name="book-open" size={16} color={theme.accent} />
                    <ThemedText style={{ fontWeight: "600", color: theme.text, fontSize: 13 }}>Ressurser</ThemedText>
                  </View>
                  <View style={styles.quickLinks}>
                    {visibleHelpLinks.map((link) => (
                      <Pressable
                        key={link.label}
                        style={[styles.quickLink, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          if (link.screen) {
                            if ("screenParams" in link && link.screenParams) {
                              navigation.navigate(link.screen as any, link.screenParams as any);
                            } else {
                              navigation.navigate(link.screen as any);
                            }
                          } else if (link.url) {
                            Linking.openURL(link.url).catch(() => showToast("Kunne ikke åpne lenke"));
                          }
                        }}
                      >
                        <View style={{ position: "relative" }}>
                          <EvendiIcon name={link.icon} size={18} color={theme.accent} />
                          {link.screen === "Status" && hasActiveStatus && (
                            <View style={[styles.statusBadge, { backgroundColor: theme.error }]} />
                          )}
                        </View>
                        <ThemedText style={[styles.quickLinkText, { color: theme.text }]}>{link.label}</ThemedText>
                        <EvendiIcon name={link.screen ? "chevron-right" : "external-link"} size={12} color={theme.textMuted} style={{ marginLeft: "auto" }} />
                      </Pressable>
                    ))}
                  </View>
                  <View style={[styles.infoBox, { backgroundColor: theme.accent + "15", borderColor: theme.accent }]}>
                    <EvendiIcon name="info" size={16} color={theme.accent} />
                    <ThemedText style={[styles.infoText, { color: theme.text }]}>
                      Når du sender melding her, går den direkte til vårt supportteam. Vi hjelper deg med alt fra tekniske problemer til spørsmål om funksjoner.
                    </ThemedText>
                  </View>
                </View>
              </ScrollView>
              )}
            </>
          }
          renderItem={({ item }) => {
            const isVendor = item.senderType === "vendor";
            const bubbleBg = isVendor ? theme.accent : theme.backgroundElevated;
            const textColor = isVendor ? theme.buttonText : theme.text;
            const metaColor = isVendor ? theme.textSecondary : theme.textMuted;

            const Body = () => (
              <Text style={[styles.body, { color: textColor }]}>
                {renderAutolinkedText(item.body, textColor)}
              </Text>
            );

            return (
              <View style={[styles.bubble, isVendor ? styles.vendorAlign : styles.adminAlign, { backgroundColor: bubbleBg }]}>
                <Body />
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 4 }}>
                  {item.status === "pending" && <ActivityIndicator size="small" color={metaColor} />}
                  {item.status === "error" && <EvendiIcon name="alert-circle" size={12} color={theme.error} />}
                  <ThemedText style={[styles.meta, { color: metaColor }]}>{new Date(item.createdAt).toLocaleString()}</ThemedText>
                  {item.status === "error" && (
                    <Pressable onPress={() => retrySend(item)} style={{ marginLeft: 8 }}>
                      <ThemedText style={[styles.meta, { color: theme.link, fontWeight: "600" }]}>Prøv igjen</ThemedText>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
      {!isAtBottom && unseenCount > 0 && (
        <Pressable
          onPress={() => { listRef.current?.scrollToEnd({ animated: true }); setUnseenCount(0); }}
          style={[styles.toBottomBtn, { backgroundColor: theme.accent }]}
        >
          <EvendiIcon name="arrow-down" size={16} color="#FFFFFF" />
          <Text style={{ color: "#FFFFFF", fontSize: 12, fontWeight: "600" }}>{unseenCount}</Text>
        </Pressable>
      )}
      {input.length > 0 && !sending && (
        <View style={{ paddingHorizontal: Spacing.md, paddingBottom: 4 }}>
          <ThemedText style={{ fontSize: 11, color: theme.textMuted }}>Skriver…</ThemedText>
        </View>
      )}
      <View style={[styles.inputBar, { backgroundColor: theme.backgroundSecondary }] }>
        <TextInput
          style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundDefault }]} 
          placeholder="Skriv en melding…"
          placeholderTextColor={theme.textMuted}
          value={input}
          onChangeText={setInput}
          editable={!loading && !sending}
        />
        <Pressable style={[styles.sendBtn, { backgroundColor: theme.accent }]} onPress={sendMessage} disabled={sending || !input.trim()}>
          {sending ? <ActivityIndicator color="#FFFFFF" /> : <EvendiIcon name="send" size={18} color="#FFFFFF" />}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// Simple URL autolinker for message body
function renderAutolinkedText(text: string, color: string) {
  const parts: Array<{ text: string; url?: string }> = [];
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/gi;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = urlRegex.exec(text)) !== null) {
    const start = match.index;
    if (start > lastIndex) parts.push({ text: text.substring(lastIndex, start) });
    const urlText = match[0];
    parts.push({ text: urlText, url: urlText.startsWith("http") ? urlText : `https://${urlText}` });
    lastIndex = start + urlText.length;
  }
  if (lastIndex < text.length) parts.push({ text: text.substring(lastIndex) });
  return parts.map((p, i) =>
    p.url ? (
      <Text key={i} style={{ color }} onPress={() => Linking.openURL(p.url!).catch(() => {})}>
        {p.text}
      </Text>
    ) : (
      <Text key={i} style={{ color }}>{p.text}</Text>
    )
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md, 
    paddingTop: Spacing.md, 
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
  },
  headerContent: {
    flex: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
  title: { fontSize: 20, fontWeight: "600" },
  subtitle: { fontSize: 12, opacity: 0.7, marginTop: 2 },
  welcomeBox: { 
    borderRadius: BorderRadius.md, 
    padding: Spacing.lg, 
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  welcomeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  welcomeTitle: { fontSize: 20, fontWeight: "700" },
  welcomeBody: { fontSize: 14, lineHeight: 20, marginBottom: Spacing.lg, opacity: 0.9 },
  quickLinks: { gap: Spacing.sm, marginBottom: Spacing.md },
  quickLink: { 
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1, 
    borderRadius: BorderRadius.md, 
    padding: Spacing.md,
  },
  quickLinkText: { fontSize: 13, fontWeight: "500" },
  infoBox: {
    flexDirection: "row",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 18,
  },
  statusNotice: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    alignItems: "flex-start",
  },
  statusNoticeTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  statusNoticeText: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.9,
  },
  statusNoticeLink: {
    fontSize: 13,
    fontWeight: "600",
  },
  statusBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  bubble: { borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm, maxWidth: "85%" },
  vendorAlign: { alignSelf: "flex-end" },
  adminAlign: { alignSelf: "flex-start" },
  body: { fontSize: 14 },
  meta: { fontSize: 11, opacity: 0.8 },
  inputBar: { flexDirection: "row", alignItems: "center", padding: Spacing.sm },
  input: { flex: 1, height: 44, borderRadius: BorderRadius.md, paddingHorizontal: Spacing.md },
  sendBtn: { marginLeft: Spacing.sm, height: 44, width: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  toBottomBtn: { position: "absolute", right: Spacing.md, bottom: 72, flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: Spacing.md, height: 36, borderRadius: 18 },
});
