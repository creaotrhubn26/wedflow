import React, { useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Alert,
  RefreshControl,
  Modal,
  Switch,
  Share,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { EvendiIcon } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import Animated, { FadeInRight } from "react-native-reanimated";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SwipeableRow } from "@/components/SwipeableRow";
import { useTheme } from "@/hooks/useTheme";
import { useEventType } from "@/hooks/useEventType";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import {
  getImportantPeople,
  createImportantPerson,
  updateImportantPerson,
  deleteImportantPerson,
  ImportantPerson,
  getWeddingInvites,
  createWeddingInvite,
  WeddingRoleInvitation,
} from "@/lib/api-couple-data";

const ROLE_SUGGESTIONS = [
  "Toastmaster",
  "Forlover",
  "Brudepike",
  "Bestmann",
  "Fotograf",
  "Videograf",
  "DJ",
  "Florist",
  "Cateringlsjef",
  "Koordinator",
];

export default function ImportantPeopleScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { config } = useEventType();
  const queryClient = useQueryClient();

  // Query for important people
  const { data: peopleData, isLoading: loading, refetch } = useQuery({
    queryKey: ["important-people"],
    queryFn: getImportantPeople,
  });

  const people = peopleData ?? [];

  // Refresh handler
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createImportantPerson,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["important-people"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ImportantPerson> }) => updateImportantPerson(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["important-people"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteImportantPerson,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["important-people"] }),
  });

  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [editingPerson, setEditingPerson] = useState<ImportantPerson | null>(null);

  // Invite state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invitePerson, setInvitePerson] = useState<ImportantPerson | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<WeddingRoleInvitation | null>(null);
  const [invitePerms, setInvitePerms] = useState({
    canViewTimeline: true,
    canCommentTimeline: false,
    canViewSchedule: true,
    canEditSchedule: false,
    canViewShotlist: false,
    canViewBudget: false,
    canViewGuestlist: false,
    canViewImportantPeople: false,
    canEditPlanning: false,
  });

  // Wedding invites query
  const { data: invitesData } = useQuery({
    queryKey: ["wedding-invites"],
    queryFn: getWeddingInvites,
  });
  const existingInvites = invitesData ?? [];

  const inviteMutation = useMutation({
    mutationFn: createWeddingInvite,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["wedding-invites"] }),
  });

  const roleToInviteRole = (role: string): string => {
    const map: Record<string, string> = {
      Toastmaster: "toastmaster",
      Bestmann: "bestman",
      Forlover: "maidofhonor",
      Brudepike: "bridesmaid",
      Koordinator: "coordinator",
    };
    return map[role] || "other";
  };

  const handleOpenInvite = (person: ImportantPerson) => {
    // Check if already invited
    const existing = existingInvites.find(
      (inv) => inv.importantPersonId === person.id && inv.status !== "revoked"
    );
    if (existing) {
      Alert.alert(
        "Allerede invitert",
        `${person.name} har allerede en invitasjon (kode: ${existing.inviteCode}). Vil du kopiere koden?`,
        [
          { text: "Avbryt", style: "cancel" },
          {
            text: "Kopier kode",
            onPress: async () => {
              await Clipboard.setStringAsync(existing.inviteCode);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert("Kopiert!", `Kode: ${existing.inviteCode}`);
            },
          },
        ]
      );
      return;
    }

    setInvitePerson(person);
    setInviteResult(null);
    // Set default permissions based on role
    const isKey = ["Toastmaster", "Koordinator", "Bestmann", "Forlover"].includes(person.role);
    setInvitePerms({
      canViewTimeline: true,
      canCommentTimeline: isKey,
      canViewSchedule: true,
      canEditSchedule: false,
      canViewShotlist: isKey,
      canViewBudget: false,
      canViewGuestlist: false,
      canViewImportantPeople: false,
      canEditPlanning: false,
    });
    setShowInviteModal(true);
  };

  const handleSendInvite = async () => {
    if (!invitePerson) return;
    setInviteLoading(true);
    try {
      const result = await inviteMutation.mutateAsync({
        name: invitePerson.name,
        email: invitePerson.email || "",
        role: roleToInviteRole(invitePerson.role),
        importantPersonId: invitePerson.id,
        ...invitePerms,
      });
      setInviteResult(result);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Feil", "Kunne ikke opprette invitasjon");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleShareInviteCode = async (code: string, personName: string) => {
    try {
      const msg = config.shareLabel
        ? config.shareLabel.shareMessageNo.replace("{name}", personName).replace("{code}", code)
        : `Hei ${personName}! Du er invitert til bryllupet vårt på Evendi. Din invitasjonskode: ${code}. Last ned Evendi og skriv inn koden for å få tilgang.`;
      await Share.share({
        message: `${msg}\n\n• App Store: https://apps.apple.com/app/evendi\n• Google Play: https://play.google.com/store/apps/details?id=com.evendi`,
      });
    } catch {}
  };

  const handleCopyInviteCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Kopiert!", `Invitasjonskode ${code} kopiert`);
  };

  const handleAddPerson = async () => {
    if (!newName.trim() || !newRole.trim()) {
      Alert.alert("Feil", "Vennligst fyll ut navn og rolle");
      return;
    }

    try {
      if (editingPerson) {
        await updateMutation.mutateAsync({
          id: editingPerson.id,
          data: { name: newName.trim(), role: newRole.trim() as any, phone: newPhone.trim() || undefined },
        });
      } else {
        await createMutation.mutateAsync({
          name: newName.trim(),
          role: newRole.trim() as any,
          phone: newPhone.trim() || undefined,
        });
      }

      setNewName("");
      setNewRole("");
      setNewPhone("");
      setEditingPerson(null);
      setShowForm(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      Alert.alert("Feil", "Kunne ikke lagre person");
    }
  };

  const handleEditPerson = (person: ImportantPerson) => {
    setEditingPerson(person);
    setNewName(person.name);
    setNewRole(person.role);
    setNewPhone(person.phone || "");
    setShowForm(true);
  };

  const handleDeletePerson = async (id: string) => {
    Alert.alert("Slett person", "Er du sikker på at du vil slette denne personen?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Slett",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteMutation.mutateAsync(id);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch (e) {
            Alert.alert("Feil", "Kunne ikke slette person");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.backgroundRoot },
        ]}
      >
        <ThemedText style={{ color: theme.textSecondary }}>Laster...</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.accent} />}
    >
      {people.length === 0 && !showForm ? (
        <View style={styles.emptyState}>
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <EvendiIcon name="users" size={32} color={theme.textMuted} />
          </View>
          <ThemedText
            style={[styles.emptyText, { color: theme.textSecondary }]}
          >
            Ingen viktige personer lagt til
          </ThemedText>
          <ThemedText
            style={[styles.emptySubtext, { color: theme.textMuted }]}
          >
            Legg til leverandører og viktige kontakter
          </ThemedText>
        </View>
      ) : (
        <>
          <ThemedText style={[styles.swipeHint, { color: theme.textMuted }]}>
            Sveip til venstre for å endre eller slette
          </ThemedText>

          <View style={styles.peopleList}>
          {people.map((person, index) => (
            <Animated.View
              key={person.id}
              entering={FadeInRight.delay(index * 100).duration(300)}
            >
              <SwipeableRow
                onEdit={() => handleEditPerson(person)}
                onDelete={() => handleDeletePerson(person.id)}
                backgroundColor={theme.backgroundDefault}
              >
                <View
                  style={[
                    styles.personCard,
                    {
                      backgroundColor: theme.backgroundDefault,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: theme.backgroundSecondary },
                    ]}
                  >
                    <EvendiIcon name="user" size={20} color={Colors.dark.accent} />
                  </View>
                  <View style={styles.personInfo}>
                    <ThemedText style={styles.personName}>{person.name}</ThemedText>
                    <ThemedText
                      style={[styles.personRole, { color: Colors.dark.accent }]}
                    >
                      {person.role}
                    </ThemedText>
                    {person.phone ? (
                      <ThemedText
                        style={[styles.personPhone, { color: theme.textSecondary }]}
                      >
                        {person.phone}
                      </ThemedText>
                    ) : null}
                  </View>
                  <Pressable
                    onPress={() => handleOpenInvite(person)}
                    style={[styles.inviteChip, {
                      backgroundColor: existingInvites.find(
                        (inv) => inv.importantPersonId === person.id && inv.status !== "revoked"
                      ) ? "#4caf50" + "20" : Colors.dark.accent + "18",
                    }]}
                    hitSlop={8}
                  >
                    <EvendiIcon
                      name={existingInvites.find(
                        (inv) => inv.importantPersonId === person.id && inv.status !== "revoked"
                      ) ? "check-circle" : "send"}
                      size={14}
                      color={existingInvites.find(
                        (inv) => inv.importantPersonId === person.id && inv.status !== "revoked"
                      ) ? "#4caf50" : Colors.dark.accent}
                    />
                    <ThemedText style={[styles.inviteChipText, {
                      color: existingInvites.find(
                        (inv) => inv.importantPersonId === person.id && inv.status !== "revoked"
                      ) ? "#4caf50" : Colors.dark.accent,
                    }]}>
                      {existingInvites.find(
                        (inv) => inv.importantPersonId === person.id && inv.status !== "revoked"
                      ) ? "Invitert" : "Inviter"}
                    </ThemedText>
                  </Pressable>
                  <EvendiIcon name="chevron-right" size={20} color={theme.textMuted} />
                </View>
              </SwipeableRow>
            </Animated.View>
          ))}
          </View>
        </>
      )}

      {showForm ? (
        <Animated.View
          style={[
            styles.formCard,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
        >
          <ThemedText type="h3" style={styles.formTitle}>
            {editingPerson ? "Endre person" : "Legg til person"}
          </ThemedText>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="Navn"
            placeholderTextColor={theme.textMuted}
            value={newName}
            onChangeText={setNewName}
          />

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="Rolle"
            placeholderTextColor={theme.textMuted}
            value={newRole}
            onChangeText={setNewRole}
          />

          <View style={styles.roleSuggestions}>
            {ROLE_SUGGESTIONS.slice(0, 5).map((role) => (
              <Pressable
                key={role}
                onPress={() => setNewRole(role)}
                style={[
                  styles.roleChip,
                  {
                    backgroundColor:
                      newRole === role ? Colors.dark.accent : theme.backgroundSecondary,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.roleChipText,
                    { color: newRole === role ? "#1A1A1A" : theme.textSecondary },
                  ]}
                >
                  {role}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.backgroundSecondary,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            placeholder="Telefon (valgfritt)"
            placeholderTextColor={theme.textMuted}
            value={newPhone}
            onChangeText={setNewPhone}
            keyboardType="phone-pad"
          />

          <View style={styles.formButtons}>
            <Pressable
              onPress={() => {
                setShowForm(false);
                setEditingPerson(null);
                setNewName("");
                setNewRole("");
                setNewPhone("");
              }}
              style={[styles.cancelButton, { borderColor: theme.border }]}
            >
              <ThemedText style={{ color: theme.textSecondary }}>Avbryt</ThemedText>
            </Pressable>
            <Button onPress={handleAddPerson} style={styles.saveButton}>
              {editingPerson ? "Oppdater" : "Lagre"}
            </Button>
          </View>
        </Animated.View>
      ) : (
        <Pressable
          onPress={() => {
            setShowForm(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={[styles.addButton, { borderColor: Colors.dark.accent }]}
        >
          <EvendiIcon name="plus" size={20} color={Colors.dark.accent} />
          <ThemedText style={[styles.addButtonText, { color: Colors.dark.accent }]}>
            Legg til person
          </ThemedText>
        </Pressable>
      )}

      {/* Invite Modal */}
      <Modal visible={showInviteModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>
                {inviteResult ? "Invitasjon opprettet! 🎉" : `Inviter ${invitePerson?.name || ""}`}
              </ThemedText>
              <Pressable onPress={() => setShowInviteModal(false)} hitSlop={12}>
                <EvendiIcon name="x" size={22} color={theme.textSecondary} />
              </Pressable>
            </View>

            {inviteResult ? (
              <View style={styles.inviteResultSection}>
                <View style={[styles.codeBox, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                  <ThemedText style={styles.codeLabel}>Invitasjonskode</ThemedText>
                  <ThemedText style={[styles.codeValue, { color: Colors.dark.accent }]}>
                    {inviteResult.inviteCode}
                  </ThemedText>
                </View>

                <View style={styles.inviteActions}>
                  <Pressable
                    style={[styles.inviteActionBtn, { backgroundColor: Colors.dark.accent }]}
                    onPress={() => handleCopyInviteCode(inviteResult.inviteCode)}
                  >
                    <EvendiIcon name="copy" size={16} color="#fff" />
                    <ThemedText style={styles.inviteActionText}>Kopier</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.inviteActionBtn, { backgroundColor: "#25D366" }]}
                    onPress={() => handleShareInviteCode(inviteResult.inviteCode, invitePerson?.name || "")}
                  >
                    <EvendiIcon name="share-2" size={16} color="#fff" />
                    <ThemedText style={styles.inviteActionText}>Del</ThemedText>
                  </Pressable>
                </View>

                <ThemedText style={[styles.inviteHint, { color: theme.textMuted }]}>
                  {invitePerson?.name} kan bruke denne koden i "Bli med i bryllup"-skjermen i Evendi-appen.
                </ThemedText>
              </View>
            ) : (
              <ScrollView style={styles.permsList} showsVerticalScrollIndicator={false}>
                <ThemedText style={[styles.permsLabel, { color: theme.textSecondary }]}>
                  Rolle: {invitePerson?.role}
                </ThemedText>

                <ThemedText style={[styles.permsSectionTitle, { color: theme.text }]}>
                  Tilgang
                </ThemedText>

                <PermToggle label="Se tidslinje" value={invitePerms.canViewTimeline} onToggle={(v) => setInvitePerms({ ...invitePerms, canViewTimeline: v })} theme={theme} />
                <PermToggle label="Kommentere tidslinje" value={invitePerms.canCommentTimeline} onToggle={(v) => setInvitePerms({ ...invitePerms, canCommentTimeline: v })} theme={theme} />
                <PermToggle label="Se program" value={invitePerms.canViewSchedule} onToggle={(v) => setInvitePerms({ ...invitePerms, canViewSchedule: v })} theme={theme} />
                <PermToggle label="Redigere program" value={invitePerms.canEditSchedule} onToggle={(v) => setInvitePerms({ ...invitePerms, canEditSchedule: v })} theme={theme} />
                <PermToggle label="Se fotoliste" value={invitePerms.canViewShotlist} onToggle={(v) => setInvitePerms({ ...invitePerms, canViewShotlist: v })} theme={theme} />
                <PermToggle label="Se budsjett" value={invitePerms.canViewBudget} onToggle={(v) => setInvitePerms({ ...invitePerms, canViewBudget: v })} theme={theme} />
                <PermToggle label="Se viktige personer" value={invitePerms.canViewImportantPeople} onToggle={(v) => setInvitePerms({ ...invitePerms, canViewImportantPeople: v })} theme={theme} />
                <PermToggle label="Full planleggingstilgang" value={invitePerms.canEditPlanning} onToggle={(v) => setInvitePerms({ ...invitePerms, canEditPlanning: v })} theme={theme} />

                <Pressable
                  style={[styles.sendInviteBtn, { backgroundColor: Colors.dark.accent, opacity: inviteLoading ? 0.7 : 1 }]}
                  onPress={handleSendInvite}
                  disabled={inviteLoading}
                >
                  {inviteLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <EvendiIcon name="send" size={16} color="#fff" style={{ marginRight: 8 }} />
                      <ThemedText style={styles.sendInviteBtnText}>Opprett invitasjon</ThemedText>
                    </>
                  )}
                </Pressable>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function PermToggle({ label, value, onToggle, theme }: { label: string; value: boolean; onToggle: (v: boolean) => void; theme: any }) {
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

const permStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  label: {
    fontSize: 15,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
  },
  swipeHint: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  peopleList: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  personCard: {
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
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  personInfo: {
    flex: 1,
  },
  personName: {
    fontSize: 16,
    fontWeight: "600",
  },
  personRole: {
    fontSize: 14,
    marginTop: 2,
  },
  personPhone: {
    fontSize: 13,
    marginTop: 2,
  },
  formCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.lg,
  },
  formTitle: {
    marginBottom: Spacing.lg,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  roleSuggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  roleChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  roleChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  formButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  cancelButton: {
    flex: 1,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  saveButton: {
    flex: 1,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
  },
  addButtonText: {
    marginLeft: Spacing.sm,
    fontWeight: "500",
  },
  inviteChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    marginRight: 8,
    gap: 4,
  },
  inviteChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing.xl,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
  },
  permsList: {
    maxHeight: 400,
  },
  permsLabel: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  permsSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  sendInviteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.xl,
    marginBottom: Spacing.md,
  },
  sendInviteBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  inviteResultSection: {
    alignItems: "center",
  },
  codeBox: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    width: "100%",
    marginBottom: Spacing.lg,
  },
  codeLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  codeValue: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: 2,
  },
  inviteActions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: Spacing.lg,
  },
  inviteActionBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: BorderRadius.md,
    gap: 6,
  },
  inviteActionText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  inviteHint: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 18,
  },
});
