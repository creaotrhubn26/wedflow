import React, { useEffect, useState, useCallback, useMemo } from "react";
import { StyleSheet, View, Pressable, Share, Linking, ScrollView, ActivityIndicator, RefreshControl } from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EvendiIcon } from "@/components/EvendiIcon";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useEventType } from "@/hooks/useEventType";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getCoupleSession } from "@/lib/storage";
import { getGuestInvitations } from "@/lib/api-guest-invitations";
import type { GuestInvitation } from "@shared/schema";
import { showToast } from "@/lib/toast";

export default function GuestInvitationsScreen() {
  const { theme } = useTheme();
  const { isWedding } = useEventType();
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [invites, setInvites] = useState<GuestInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const baseInviteUrl = useMemo(() => {
    const domain = process.env.EXPO_PUBLIC_DOMAIN;
    return domain ? `https://${domain}` : "http://localhost:5000";
  }, []);

  const fetchInvites = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    try {
      const session = await getCoupleSession();
      const token = session?.token ?? null;
      setSessionToken(token);
      if (!token) {
        setError("Du er ikke innlogget som par.");
        return;
      }
      const data = await getGuestInvitations(token);
      setInvites(data);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Kunne ikke hente invitasjoner";
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchInvites();
  }, [fetchInvites]);

  const canShare = sessionToken !== null;

  const shareViaSMS = async (url: string) => {
    const smsUrl = `sms:&body=${encodeURIComponent(url)}`;
    try {
      const supported = await Linking.canOpenURL(smsUrl);
      if (supported) await Linking.openURL(smsUrl);
      else await Share.share({ message: url });
    } catch {}
  };

  const shareViaEmail = async (email: string | null, url: string) => {
    const subject = isWedding ? "Bryllupsinvitasjon" : "Invitasjon";
    const body = `Hei! Her er invitasjonen: ${url}`;
    const mailto = `mailto:${email || ""}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    try {
      const supported = await Linking.canOpenURL(mailto);
      if (supported) await Linking.openURL(mailto);
      else await Share.share({ message: body });
    } catch {}
  };

  const statusColor = (status: string) => {
    switch (status) {
      case "responded": return "#4CAF50";
      case "declined": return "#EF5350";
      case "sent": return Colors.dark.accent;
      default: return theme.textSecondary;
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot, paddingTop: headerHeight + insets.top }]}> 
        <ActivityIndicator color={Colors.dark.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + insets.top,
        paddingBottom: insets.bottom + Spacing["2xl"],
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            setRefreshing(true);
            fetchInvites(false);
          }}
          tintColor={theme.accent}
        />
      }
    >
      <View style={{ paddingHorizontal: Spacing.md }}>
        <ThemedText type="h3" style={{ marginBottom: Spacing.md }}>Invitasjoner</ThemedText>
        {error ? (
          <View style={[styles.errorBox, { borderColor: theme.border, backgroundColor: theme.backgroundSecondary }]}> 
            <ThemedText style={{ color: theme.textSecondary }}>{error}</ThemedText>
          </View>
        ) : null}

        {invites.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundSecondary }]}>
              <EvendiIcon name="mail" size={48} color={theme.textMuted} />
            </View>
            <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>Ingen invitasjoner ennå</ThemedText>
            <ThemedText style={{ color: theme.textMuted }}>Opprett invitasjoner fra gjesteskjemaet</ThemedText>
          </View>
        ) : invites.map((inv) => (
          <View key={inv.id} style={[styles.card, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}><EvendiIcon name="user" size={18} color={theme.textSecondary} /></View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.name}>{inv.name}</ThemedText>
                <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>{inv.email || inv.phone || ""}</ThemedText>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: statusColor(inv.status) + "20" }]}>
                <View style={[styles.statusDot, { backgroundColor: statusColor(inv.status) }]} />
                <ThemedText style={{ color: statusColor(inv.status), fontSize: 12 }}>
                  {inv.status === "responded" ? "Svart" : inv.status === "declined" ? "Avslått" : inv.status === "sent" ? "Sendt" : "Venter"}
                </ThemedText>
              </View>
            </View>
            <View style={styles.cardActions}>
              <Pressable
                onPress={() => {
                  if (!canShare) {
                    showToast("Logg inn for å dele invitasjoner.");
                    return;
                  }
                  Share.share({
                    message: inv.inviteToken ? `${inv.message || ""}\n${buildInviteUrl(inv)}` : inv.message || "",
                  });
                }}
                style={[styles.actionBtn, { borderColor: theme.border, opacity: canShare ? 1 : 0.6 }]}
              >
                <EvendiIcon name="share-2" size={16} color={Colors.dark.accent} />
                <ThemedText style={styles.actionText}>Del</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!canShare) {
                    showToast("Logg inn for å dele invitasjoner.");
                    return;
                  }
                  shareViaSMS(buildInviteUrl(inv));
                }}
                style={[styles.actionBtn, { borderColor: theme.border, opacity: canShare ? 1 : 0.6 }]}
              >
                <EvendiIcon name="message-square" size={16} color={Colors.dark.accent} />
                <ThemedText style={styles.actionText}>SMS</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => {
                  if (!canShare) {
                    showToast("Logg inn for å dele invitasjoner.");
                    return;
                  }
                  shareViaEmail(inv.email || null, buildInviteUrl(inv));
                }}
                style={[styles.actionBtn, { borderColor: theme.border, opacity: canShare ? 1 : 0.6 }]}
              >
                <EvendiIcon name="mail" size={16} color={Colors.dark.accent} />
                <ThemedText style={styles.actionText}>E-post</ThemedText>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  function buildInviteUrl(inv: GuestInvitation): string {
    if (!inv.inviteToken) return baseInviteUrl;
    return `${baseInviteUrl}/invite/${inv.inviteToken}`;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { borderRadius: BorderRadius.md, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.md },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", backgroundColor: "#eee" },
  name: { fontSize: 16, fontWeight: "600" },
  statusBadge: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.full },
  statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: Spacing.xs },
  cardActions: { flexDirection: "row", gap: Spacing.sm, marginTop: Spacing.sm },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: Spacing.xs, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.full, borderWidth: 1 },
  actionText: { fontSize: 13, fontWeight: "600" },
  emptyState: { alignItems: "center", paddingVertical: Spacing['2xl'] },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: Spacing.md },
  emptyText: { fontSize: 16, fontWeight: "500", marginBottom: Spacing.xs },
  errorBox: { borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.md, marginBottom: Spacing.md },
});
