import React, { useState } from "react";
import { ScrollView, StyleSheet, View, Pressable, Share, Alert, TextInput, Switch, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useEventType } from "@/hooks/useEventType";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import {
  getWeddingInvites,
  createWeddingInvite,
  deleteWeddingInvite,
  WeddingRoleInvitation,
} from "@/lib/api-couple-data";

const ROLE_OPTIONS = [
  { key: "partner", label: "Partner / Ektefelle", icon: "heart" as const },
  { key: "toastmaster", label: "Toastmaster", icon: "mic" as const },
  { key: "bestman", label: "Bestmann", icon: "star" as const },
  { key: "maidofhonor", label: "Forlover", icon: "star" as const },
  { key: "coordinator", label: "Koordinator", icon: "clipboard" as const },
  { key: "other", label: "Annen rolle", icon: "user" as const },
];

export default function SharePartnerScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { config } = useEventType();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("partner");
  const [creating, setCreating] = useState(false);
  const [perms, setPerms] = useState({
    canViewTimeline: true,
    canCommentTimeline: true,
    canViewSchedule: true,
    canEditSchedule: true,
    canViewShotlist: true,
    canViewBudget: true,
    canViewGuestlist: true,
    canViewImportantPeople: true,
    canEditPlanning: true,
  });

  const { data: invites, isLoading } = useQuery({
    queryKey: ["wedding-invites"],
    queryFn: getWeddingInvites,
  });

  const createMutation = useMutation({
    mutationFn: createWeddingInvite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wedding-invites"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWeddingInvite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wedding-invites"] }),
  });

  const handleCreate = async () => {
    if (!newName.trim()) {
      Alert.alert("Feil", "Skriv inn navn");
      return;
    }
    setCreating(true);
    try {
      await createMutation.mutateAsync({
        name: newName.trim(),
        email: newEmail.trim() || "",
        role: newRole,
        ...perms,
      });
      setNewName("");
      setNewEmail("");
      setNewRole("partner");
      setShowCreateForm(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      Alert.alert("Feil", "Kunne ikke opprette invitasjon");
    } finally {
      setCreating(false);
    }
  };

  const handleCopyCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Kopiert!", `Kode ${code} kopiert til utklippstavlen`);
  };

  const handleShareCode = async (code: string, name: string) => {
    try {
      const msg = config.shareLabel
        ? config.shareLabel.shareMessageNo.replace("{name}", name).replace("{code}", code)
        : `Hei ${name}! Du er invitert til bryllupet vårt på Wedflow. Din invitasjonskode: ${code}. Last ned Wedflow og skriv inn koden for å få tilgang.`;
      await Share.share({
        message: `${msg}\n\n• App Store: https://apps.apple.com/app/wedflow\n• Google Play: https://play.google.com/store/apps/details?id=no.norwedfilm.wedflow`,
      });
    } catch {}
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert("Slett invitasjon", `Trekke tilbake invitasjon til ${name}?`, [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Slett",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(id);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch {
            Alert.alert("Feil", "Kunne ikke slette invitasjonen");
          }
        },
      },
    ]);
  };

  const setRoleDefaults = (role: string) => {
    setNewRole(role);
    const isPartner = role === "partner";
    const isKey = ["toastmaster", "coordinator", "bestman", "maidofhonor"].includes(role);
    setPerms({
      canViewTimeline: true,
      canCommentTimeline: isPartner || isKey,
      canViewSchedule: true,
      canEditSchedule: isPartner,
      canViewShotlist: isPartner || isKey,
      canViewBudget: isPartner,
      canViewGuestlist: isPartner,
      canViewImportantPeople: isPartner,
      canEditPlanning: isPartner,
    });
  };

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      pending: "Venter",
      accepted: "Akseptert",
      revoked: "Trukket tilbake",
      expired: "Utløpt",
    };
    return map[status] || status;
  };

  const statusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: "#ff9800",
      accepted: "#4caf50",
      revoked: "#f44336",
      expired: "#9e9e9e",
    };
    return map[status] || "#9e9e9e";
  };

  const activeInvites = (invites || []).filter((inv) => inv.status !== "revoked");

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      {/* Hero */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <View style={[styles.heroSection, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={[styles.iconCircle, { backgroundColor: Colors.dark.accent + "20" }]}>
            <Feather name="users" size={40} color={Colors.dark.accent} />
          </View>
          <ThemedText style={styles.title}>{config.shareLabel?.titleNo || "Del bryllupet"}</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            {config.shareLabel?.subtitleNo || "Inviter partner, toastmaster, forlover og andre viktige personer"}
          </ThemedText>
        </View>
      </Animated.View>

      {/* Quick links */}
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <Pressable
          onPress={() => navigation.navigate("ImportantPeople")}
          style={[styles.linkCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          <Feather name="users" size={20} color={Colors.dark.accent} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <ThemedText style={styles.linkTitle}>Viktige personer</ThemedText>
            <ThemedText style={[styles.linkDesc, { color: theme.textSecondary }]}>
              Administrer og inviter viktige personer direkte
            </ThemedText>
          </View>
          <Feather name="chevron-right" size={18} color={theme.textMuted} />
        </Pressable>
      </Animated.View>

      {/* Existing invitations */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>
            Invitasjoner ({activeInvites.length})
          </ThemedText>
        </View>

        {isLoading ? (
          <ActivityIndicator color={Colors.dark.accent} style={{ marginVertical: 20 }} />
        ) : activeInvites.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <Feather name="mail" size={28} color={theme.textMuted} />
            <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
              Ingen invitasjoner ennå. Opprett en nedenfor!
            </ThemedText>
          </View>
        ) : (
          <View style={styles.invitesList}>
            {activeInvites.map((inv) => (
              <View key={inv.id} style={[styles.inviteCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                <View style={styles.inviteCardHeader}>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.inviteName}>{inv.name}</ThemedText>
                    <ThemedText style={[styles.inviteRole, { color: Colors.dark.accent }]}>
                      {ROLE_OPTIONS.find((r) => r.key === inv.role)?.label || inv.role}
                    </ThemedText>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: statusColor(inv.status) + "20" }]}>
                    <ThemedText style={[styles.statusText, { color: statusColor(inv.status) }]}>
                      {statusLabel(inv.status)}
                    </ThemedText>
                  </View>
                </View>

                <View style={[styles.codeRow, { backgroundColor: theme.backgroundSecondary }]}>
                  <ThemedText style={[styles.codeText, { color: Colors.dark.accent }]}>
                    {inv.inviteCode}
                  </ThemedText>
                </View>

                <View style={styles.inviteCardActions}>
                  <Pressable style={[styles.actionBtn, { backgroundColor: theme.backgroundSecondary }]} onPress={() => handleCopyCode(inv.inviteCode)}>
                    <Feather name="copy" size={14} color={Colors.dark.accent} />
                    <ThemedText style={[styles.actionBtnText, { color: Colors.dark.accent }]}>Kopier</ThemedText>
                  </Pressable>
                  <Pressable style={[styles.actionBtn, { backgroundColor: "#25D366" + "20" }]} onPress={() => handleShareCode(inv.inviteCode, inv.name)}>
                    <Feather name="share-2" size={14} color="#25D366" />
                    <ThemedText style={[styles.actionBtnText, { color: "#25D366" }]}>Del</ThemedText>
                  </Pressable>
                  <Pressable style={[styles.actionBtn, { backgroundColor: "#f4433620" }]} onPress={() => handleDelete(inv.id, inv.name)}>
                    <Feather name="trash-2" size={14} color="#f44336" />
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
      </Animated.View>

      {/* Create new invitation */}
      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        {showCreateForm ? (
          <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <ThemedText style={styles.formTitle}>Ny invitasjon</ThemedText>

            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
              placeholder="Navn"
              placeholderTextColor={theme.textMuted}
              value={newName}
              onChangeText={setNewName}
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
              placeholder="E-post (valgfritt)"
              placeholderTextColor={theme.textMuted}
              value={newEmail}
              onChangeText={setNewEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary }]}>Rolle</ThemedText>
            <View style={styles.roleChips}>
              {ROLE_OPTIONS.map((r) => (
                <Pressable
                  key={r.key}
                  style={[styles.roleChip, { backgroundColor: newRole === r.key ? Colors.dark.accent : theme.backgroundSecondary }]}
                  onPress={() => setRoleDefaults(r.key)}
                >
                  <Feather name={r.icon} size={13} color={newRole === r.key ? "#1A1A1A" : theme.textSecondary} />
                  <ThemedText style={[styles.roleChipText, { color: newRole === r.key ? "#1A1A1A" : theme.textSecondary }]}>
                    {r.label}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <ThemedText style={[styles.fieldLabel, { color: theme.textSecondary, marginTop: Spacing.md }]}>
              Tilgang
            </ThemedText>
            <PermRow label="Se tidslinje" value={perms.canViewTimeline} onToggle={(v) => setPerms({ ...perms, canViewTimeline: v })} theme={theme} />
            <PermRow label="Kommentere tidslinje" value={perms.canCommentTimeline} onToggle={(v) => setPerms({ ...perms, canCommentTimeline: v })} theme={theme} />
            <PermRow label="Se program" value={perms.canViewSchedule} onToggle={(v) => setPerms({ ...perms, canViewSchedule: v })} theme={theme} />
            <PermRow label="Redigere program" value={perms.canEditSchedule} onToggle={(v) => setPerms({ ...perms, canEditSchedule: v })} theme={theme} />
            <PermRow label="Se fotoliste" value={perms.canViewShotlist} onToggle={(v) => setPerms({ ...perms, canViewShotlist: v })} theme={theme} />
            <PermRow label="Se budsjett" value={perms.canViewBudget} onToggle={(v) => setPerms({ ...perms, canViewBudget: v })} theme={theme} />
            <PermRow label="Se viktige personer" value={perms.canViewImportantPeople} onToggle={(v) => setPerms({ ...perms, canViewImportantPeople: v })} theme={theme} />
            <PermRow label="Full planlegging" value={perms.canEditPlanning} onToggle={(v) => setPerms({ ...perms, canEditPlanning: v })} theme={theme} />

            <View style={styles.formButtons}>
              <Pressable
                onPress={() => setShowCreateForm(false)}
                style={[styles.cancelBtn, { borderColor: theme.border }]}
              >
                <ThemedText style={{ color: theme.textSecondary }}>Avbryt</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleCreate}
                style={[styles.createBtn, { backgroundColor: Colors.dark.accent, opacity: creating ? 0.7 : 1 }]}
                disabled={creating}
              >
                {creating ? (
                  <ActivityIndicator color="#1A1A1A" size="small" />
                ) : (
                  <ThemedText style={styles.createBtnText}>Opprett</ThemedText>
                )}
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => {
              setShowCreateForm(true);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[styles.addBtn, { backgroundColor: Colors.dark.accent }]}
          >
            <Feather name="plus" size={20} color="#1A1A1A" />
            <ThemedText style={styles.addBtnText}>Ny invitasjon</ThemedText>
          </Pressable>
        )}
      </Animated.View>

      {/* How it works */}
      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <View style={[styles.infoBox, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.infoTitle}>Slik fungerer det</ThemedText>
          <StepItem number={1} title="Opprett invitasjon" desc="Velg rolle og tilgang for personen" theme={theme} />
          <StepItem number={2} title="Del koden" desc="Send invitasjonskoden via melding eller e-post" theme={theme} />
          <StepItem number={3} title="Mottar tilgang" desc="Personen skriver inn koden i «Bli med i bryllup»" theme={theme} />
          <StepItem number={4} title="Planlegg sammen" desc="De får tilgang basert på rollens rettigheter" theme={theme} isLast />
        </View>
      </Animated.View>
    </ScrollView>
  );
}

function PermRow({ label, value, onToggle, theme }: { label: string; value: boolean; onToggle: (v: boolean) => void; theme: any }) {
  return (
    <View style={permStyles.row}>
      <ThemedText style={[permStyles.label, { color: theme.text }]}>{label}</ThemedText>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: theme.border, true: Colors.dark.accent + "60" }}
        thumbColor={value ? Colors.dark.accent : "#ccc"}
      />
    </View>
  );
}

function StepItem({ number, title, desc, theme, isLast = false }: { number: number; title: string; desc: string; theme: any; isLast?: boolean }) {
  return (
    <View style={[stepStyles.item, !isLast && { borderBottomWidth: 1, borderBottomColor: theme.border }]}>
      <View style={[stepStyles.num, { backgroundColor: Colors.dark.accent }]}>
        <ThemedText style={stepStyles.numText}>{number}</ThemedText>
      </View>
      <View style={{ flex: 1 }}>
        <ThemedText style={stepStyles.title}>{title}</ThemedText>
        <ThemedText style={[stepStyles.desc, { color: theme.textSecondary }]}>{desc}</ThemedText>
      </View>
    </View>
  );
}

const permStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  label: { fontSize: 14 },
});

const stepStyles = StyleSheet.create({
  item: { flexDirection: "row", paddingVertical: Spacing.sm },
  num: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", marginRight: 12 },
  numText: { fontSize: 13, fontWeight: "700", color: "#1A1A1A" },
  title: { fontSize: 15, fontWeight: "600" },
  desc: { fontSize: 13, marginTop: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroSection: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  title: { fontSize: 24, fontWeight: "700" },
  subtitle: { fontSize: 15, textAlign: "center", marginTop: Spacing.xs },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  linkTitle: { fontSize: 15, fontWeight: "600" },
  linkDesc: { fontSize: 13, marginTop: 2 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600" },
  emptyBox: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    gap: 10,
  },
  emptyText: { fontSize: 14, textAlign: "center" },
  invitesList: { gap: Spacing.sm, marginBottom: Spacing.lg },
  inviteCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  inviteCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  inviteName: { fontSize: 16, fontWeight: "600" },
  inviteRole: { fontSize: 13, marginTop: 2 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusText: { fontSize: 12, fontWeight: "600" },
  codeRow: {
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: BorderRadius.sm,
    marginBottom: 10,
  },
  codeText: { fontSize: 20, fontWeight: "700", letterSpacing: 2 },
  inviteCardActions: {
    flexDirection: "row",
    gap: 8,
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.sm,
    gap: 5,
  },
  actionBtnText: { fontSize: 13, fontWeight: "500" },
  formCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  formTitle: { fontSize: 18, fontWeight: "600", marginBottom: Spacing.md },
  input: {
    height: 48,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: Spacing.sm,
  },
  fieldLabel: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  roleChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: Spacing.sm,
  },
  roleChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    gap: 5,
  },
  roleChipText: { fontSize: 13, fontWeight: "500" },
  formButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.lg,
  },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  createBtn: {
    flex: 1,
    height: 48,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  createBtnText: { fontSize: 16, fontWeight: "600", color: "#1A1A1A" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  addBtnText: { fontSize: 17, fontWeight: "600", color: "#1A1A1A" },
  infoBox: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  infoTitle: { fontSize: 16, fontWeight: "600", marginBottom: Spacing.sm },
});
