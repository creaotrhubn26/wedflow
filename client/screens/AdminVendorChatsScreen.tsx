import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EvendiIcon } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import { useHeaderHeight } from "@react-navigation/elements";
import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { showToast } from "@/lib/toast";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

interface AdminConvWithVendor {
  conv: {
    id: string;
    vendorId: string;
    lastMessageAt: string;
    adminUnreadCount: number;
    vendorUnreadCount: number;
    status?: string;
  };
  vendor: { id: string; email: string; businessName: string } | null;
}

type Props = NativeStackScreenProps<RootStackParamList, "AdminVendorChats">;

type WsMessageEvent = { data: string };

export default function AdminVendorChatsScreen({ route, navigation }: Props) {
  const { adminKey } = route.params;
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();

  const [conversations, setConversations] = useState<AdminConvWithVendor[]>([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "recent" | "resolved">("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  const updateConversationStatus = async (convId: string, newStatus: string) => {
    if (!adminKey) {
      showToast("Logg inn som admin for a oppdatere status.");
      return;
    }
    try {
      const url = new URL(`/api/admin/vendor-admin-conversations/${convId}/status`, getApiUrl());
      const res = await fetch(url, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}` 
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Kunne ikke oppdatere status");
      
      setConversations((prev) =>
        prev.map((c) =>
          c.conv.id === convId
            ? { ...c, conv: { ...c.conv, status: newStatus } }
            : c
        )
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      showToast((e as Error).message);
    }
  };

  const fetchConversations = useCallback(async (showSpinner = true) => {
    if (!adminKey) {
      setLoading(false);
      return;
    }
    try {
      if (showSpinner) setLoading(true);
      const url = new URL("/api/admin/vendor-admin-conversations", getApiUrl());
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!res.ok) {
        console.error(`API error: ${res.status} ${res.statusText}`);
        setConversations([]);
        return;
      }
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Error fetching conversations:", e);
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [adminKey]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    if (!adminKey) return;
    let closedByUs = false;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      try {
        const wsUrl = getApiUrl().replace(/^http/, "ws") + `/ws/admin/vendor-admin-list?adminKey=${encodeURIComponent(adminKey)}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        ws.onmessage = (event: WsMessageEvent) => {
          try {
            const payloadText = typeof event.data === "string" ? event.data : "";
            if (!payloadText) return;
            const data = JSON.parse(payloadText) as {
              type?: string;
              payload?: {
                conversationId?: string;
                lastMessageAt?: string;
                adminUnreadCount?: number;
              };
            };
            if (data?.type === "conv-update" && data.payload?.conversationId) {
              const { conversationId, lastMessageAt, adminUnreadCount } = data.payload;
              setConversations((prev) => {
                const list = [...prev];
                const idx = list.findIndex((c) => c.conv.id === conversationId);
                if (idx >= 0) {
                  const updated = { ...list[idx] };
                  updated.conv = {
                    ...updated.conv,
                    lastMessageAt: lastMessageAt || updated.conv.lastMessageAt,
                    adminUnreadCount:
                      typeof adminUnreadCount === "number" ? adminUnreadCount : updated.conv.adminUnreadCount,
                  };
                  list[idx] = updated;
                  // Move to top if new lastMessageAt
                  if (lastMessageAt) {
                    list.sort((a, b) => new Date(b.conv.lastMessageAt).getTime() - new Date(a.conv.lastMessageAt).getTime());
                  }
                  return list;
                } else {
                  // If unknown conversation, do a light refresh
                  fetchConversations(false);
                  return prev;
                }
              });
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
    };
  }, [adminKey, fetchConversations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = conversations.filter((c) => {
      const hay = `${c.vendor?.businessName || ""} ${c.vendor?.email || ""}`.toLowerCase();
      return q ? hay.includes(q) : true;
    });
    if (filter === "unread") {
      list = list.filter((c) => (c.conv.adminUnreadCount || 0) > 0);
    } else if (filter === "recent") {
      const cutoff = Date.now() - 1000 * 60 * 60 * 24 * 2; // 48t
      list = list.filter((c) => new Date(c.conv.lastMessageAt).getTime() >= cutoff);
    } else if (filter === "resolved") {
      list = list.filter((c) => c.conv.status === "resolved");
    }
    // always sort by lastMessageAt desc
    list = [...list].sort((a, b) => new Date(b.conv.lastMessageAt).getTime() - new Date(a.conv.lastMessageAt).getTime());
    return list;
  }, [conversations, search, filter]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundRoot }]} edges={["top", "bottom"]}>
      <View style={[styles.header, { paddingTop: headerHeight + Spacing.md }]}>
        <ThemedText style={styles.title}>Evendi Support - Leverandører</ThemedText>
        <ThemedText style={styles.subtitle}>Meldinger fra leverandører</ThemedText>
        <View style={styles.toolsRow}>
          <View style={[styles.searchBox, { borderColor: theme.border, backgroundColor: theme.backgroundSecondary }]}>
            <EvendiIcon name="search" size={16} color={theme.textMuted} />
            <TextInput
              style={[styles.searchInput, { color: theme.text }]}
              placeholder="Søk på navn eller e-post"
              placeholderTextColor={theme.textMuted}
              value={search}
              onChangeText={setSearch}
              autoCorrect={false}
              autoCapitalize="none"
            />
            {search.length > 0 && (
              <Pressable onPress={() => setSearch("")}> 
                <EvendiIcon name="x" size={16} color={theme.textMuted} />
              </Pressable>
            )}
          </View>
          <View style={styles.filtersRow}>
            {(
              [
                { key: "all", label: "Alle" },
                { key: "unread", label: "Ulest" },
                { key: "recent", label: "Siste 48t" },
                { key: "resolved", label: "Løst" },
              ] as const
            ).map((f) => (
              <Pressable
                key={f.key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: filter === f.key ? theme.accent : theme.backgroundSecondary,
                    borderColor: filter === f.key ? theme.accent : theme.border,
                  },
                ]}
                onPress={() => setFilter(f.key)}
              >
                <ThemedText style={[styles.filterText, { color: filter === f.key ? "#FFFFFF" : theme.textSecondary }]}>
                  {f.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      </View>

      {loading && <ActivityIndicator style={{ marginTop: Spacing.lg }} color={theme.accent} />}
      {!loading && conversations.length === 0 && (
        <View style={styles.emptyState}>
          <EvendiIcon name="inbox" size={48} color={theme.textMuted} />
          <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>Ingen meldinger ennå</ThemedText>
        </View>
      )}
      {!loading && (
        <FlatList
          data={filtered}
          keyExtractor={(c) => c.conv.id}
          contentContainerStyle={{ padding: Spacing.md }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchConversations(false); }} />}
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.card,
                {
                  backgroundColor: item.conv.adminUnreadCount > 0 ? theme.accent + "10" : theme.backgroundSecondary,
                  borderColor: item.conv.adminUnreadCount > 0 ? theme.accent : theme.border,
                },
              ]}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate("AdminVendorMessages", {
                  conversationId: item.conv.id,
                  vendorName: item.vendor?.businessName || item.vendor?.email || "Ukjent",
                  adminKey,
                });
              }}
            >
              <View style={styles.cardHeader}>
                <View style={styles.cardInfo}>
                  <ThemedText style={styles.vendorName}>{item.vendor?.businessName || "Ukjent leverandør"}</ThemedText>
                  <ThemedText style={[styles.vendorEmail, { color: theme.textSecondary }]}>{item.vendor?.email}</ThemedText>
                  <ThemedText style={[styles.lastMessage, { color: theme.textMuted }]}>
                    Sist: {new Date(item.conv.lastMessageAt).toLocaleString()}
                  </ThemedText>
                </View>
                <View style={styles.trail}>
                  {item.conv.adminUnreadCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: theme.accent }]}> 
                      <ThemedText style={styles.badgeText}>{item.conv.adminUnreadCount}</ThemedText>
                    </View>
                  )}
                  {item.conv.status === "resolved" && (
                    <View style={[styles.statusBadge, { backgroundColor: "#4CAF50" }]}>
                      <EvendiIcon name="check-circle" size={14} color="#FFFFFF" />
                    </View>
                  )}
                  <EvendiIcon name="chevron-right" size={18} color={theme.textMuted} />
                </View>
              </View>
              <Pressable
                style={[styles.statusBtn, { backgroundColor: item.conv.status === "resolved" ? "#4CAF50" : theme.backgroundDefault }]}
                onPress={() =>
                  updateConversationStatus(
                    item.conv.id,
                    item.conv.status === "resolved" ? "active" : "resolved"
                  )
                }
              >
                <EvendiIcon 
                  name={item.conv.status === "resolved" ? "rotate-ccw" : "check"} 
                  size={12} 
                  color={item.conv.status === "resolved" ? "#FFFFFF" : theme.textSecondary} 
                />
                <ThemedText 
                  style={[styles.statusBtnText, { color: item.conv.status === "resolved" ? "#FFFFFF" : theme.textSecondary }]}
                >
                  {item.conv.status === "resolved" ? "Åpne" : "Løst"}
                </ThemedText>
              </Pressable>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.md },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 12, opacity: 0.6, marginTop: 2 },
  toolsRow: { marginTop: Spacing.md, gap: Spacing.sm },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 10, borderWidth: 1, borderRadius: BorderRadius.md, height: 40 },
  searchInput: { flex: 1, paddingVertical: 8 },
  filtersRow: { flexDirection: "row", gap: 8, marginTop: Spacing.sm },
  filterChip: { paddingHorizontal: 12, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  filterText: { fontSize: 12, fontWeight: "600" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 14, marginTop: Spacing.md },
  card: { borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.sm },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: Spacing.sm },
  cardInfo: { flex: 1 },
  vendorName: { fontSize: 16, fontWeight: "600", marginBottom: Spacing.xs },
  vendorEmail: { fontSize: 13, marginBottom: Spacing.xs },
  lastMessage: { fontSize: 12 },
  trail: { flexDirection: "row", alignItems: "center", gap: 8 },
  badge: { minWidth: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  badgeText: { fontSize: 12, fontWeight: "700", color: "#FFFFFF" },
  statusBadge: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  statusBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: BorderRadius.sm, flexDirection: "row", alignItems: "center", gap: 4, borderWidth: 1, borderColor: "transparent" },
  statusBtnText: { fontSize: 11, fontWeight: "600" },
});
