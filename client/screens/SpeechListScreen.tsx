import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { EvendiIcon } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import Animated, { FadeInRight } from "react-native-reanimated";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SwipeableRow } from "@/components/SwipeableRow";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getSpeeches, saveSpeeches, generateId } from "@/lib/storage";
import { Speech } from "@/lib/types";
import { Table } from "@/components/SeatingChart";
import { showToast } from "@/lib/toast";
import { showConfirm } from "@/lib/dialogs";
import { useEventType } from "@/hooks/useEventType";

const WEDDING_DEFAULT_SPEECHES: Speech[] = [
  { id: "1", speakerName: "Mor til bruden", role: "Familie", time: "18:00", order: 1, status: "ready", tableId: null },
  { id: "2", speakerName: "Far til brudgommen", role: "Familie", time: "18:15", order: 2, status: "ready", tableId: null },
  { id: "3", speakerName: "Forlover", role: "Forlover", time: "18:30", order: 3, status: "ready", tableId: null },
  { id: "4", speakerName: "Toastmaster", role: "Toastmaster", time: "18:45", order: 4, status: "ready", tableId: null },
];

const CORPORATE_DEFAULT_SPEECHES: Speech[] = [
  { id: "1", speakerName: "Daglig leder", role: "CEO", time: "18:00", order: 1, status: "ready", tableId: null },
  { id: "2", speakerName: "Avdelingsleder", role: "Leder", time: "18:15", order: 2, status: "ready", tableId: null },
  { id: "3", speakerName: "Konferansier", role: "Konferansier", time: "18:30", order: 3, status: "ready", tableId: null },
];

const EVENT_DEFAULT_SPEECHES: Speech[] = [
  { id: "1", speakerName: "Hovedtaler", role: "Taler", time: "18:00", order: 1, status: "ready", tableId: null },
  { id: "2", speakerName: "Konferansier", role: "Konferansier", time: "18:30", order: 2, status: "ready", tableId: null },
];

export default function SpeechListScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const { isWedding, isCorporate } = useEventType();
  
  const DEFAULT_SPEECHES = isWedding ? WEDDING_DEFAULT_SPEECHES : isCorporate ? CORPORATE_DEFAULT_SPEECHES : EVENT_DEFAULT_SPEECHES;

  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newStatus, setNewStatus] = useState<NonNullable<Speech["status"]>>("ready");
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [editingSpeech, setEditingSpeech] = useState<Speech | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  // Load session token
  useFocusEffect(
    useCallback(() => {
      const loadToken = async () => {
        try {
          const stored = await getSpeeches();
          const parsed = JSON.parse(localStorage.getItem("session") || "{}");
          setSessionToken(parsed?.sessionToken || null);
        } catch {
          setSessionToken(null);
        }
      };
      loadToken();
    }, [])
  );

  // Fetch seating chart tables directly
  const { data: seatingData } = useQuery<{ tables: Table[]; guests: any[] }>({
    queryKey: ["/api/couple/venue/seating", sessionToken],
    enabled: !!sessionToken,
    queryFn: async () => {
      const response = await fetch("/api/couple/venue/seating", {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      return response.json();
    },
  });

  const tables = seatingData?.tables ?? [];

  const loadData = useCallback(async () => {
    const data = await getSpeeches();
    const source = data.length === 0 ? DEFAULT_SPEECHES : data;
    const normalized = source
      .map((speech, index) => ({
        ...speech,
        status: speech.status || "ready",
        tableId: speech.tableId ?? null,
        order: speech.order || index + 1,
      }))
      .sort((a, b) => a.order - b.order);

    if (data.length === 0) {
      await saveSpeeches(normalized);
    }

    setSpeeches(normalized);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const tableLookup = useMemo(() => {
    const lookup = new Map<string, Table>();
    tables.forEach((table) => lookup.set(table.id, table));
    return lookup;
  }, [tables]);

  const statusLabel: Record<NonNullable<Speech["status"]>, string> = {
    ready: "Klar",
    speaking: "Snakker nå",
    done: "Ferdig",
  };

  const statusColor: Record<NonNullable<Speech["status"]>, string> = {
    ready: Colors.dark.accent,
    speaking: "#f59e0b",
    done: "#16a34a",
  };

  const getTableLabel = (tableId?: string | null) => {
    if (!tableId) return "Uten bord";
    const table = tableLookup.get(tableId);
    if (!table) return "Uten bord";
    return table.name || `Bord ${table.id}`;
  };

  const handleExportPdf = async () => {
    if (speeches.length === 0) {
      showToast("Legg til taler før du eksporterer.");
      return;
    }

    const grouped: Record<string, Speech[]> = {};
    speeches.forEach((speech) => {
      const key = getTableLabel(speech.tableId);
      grouped[key] = grouped[key] ? [...grouped[key], speech] : [speech];
    });

    const sectionHtml = Object.entries(grouped)
      .map(([tableName, items]) => {
        const rows = items
          .sort((a, b) => a.order - b.order)
          .map(
            (speech) => `
              <tr>
                <td style="padding:8px 4px; width:40px; text-align:center;">${speech.order}</td>
                <td style="padding:8px 4px;">
                  <div style="font-weight:600;">${speech.speakerName}</div>
                  <div style="font-size:12px; color:#6b7280;">${speech.role}</div>
                </td>
                <td style="padding:8px 4px; text-align:center; color:${statusColor[speech.status || "ready"]};">${statusLabel[speech.status || "ready"]}</td>
                <td style="padding:8px 4px; text-align:center;">${speech.time}</td>
              </tr>
            `,
          )
          .join("");
        return `
          <h3 style="margin:16px 0 8px;">${tableName}</h3>
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr style="text-align:left; border-bottom:1px solid #e5e7eb;">
                <th style="padding:8px 4px; width:40px;">#</th>
                <th style="padding:8px 4px;">Taler</th>
                <th style="padding:8px 4px;">Status</th>
                <th style="padding:8px 4px; text-align:center;">Tid</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        `;
      })
      .join("");

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Taler per bord</title>
        </head>
        <body style="font-family: Arial, sans-serif; padding: 24px;">
          <h1 style="margin-top:0;">Taler per bord</h1>
          ${sectionHtml}
        </body>
      </html>
    `;

    try {
      const file = await Print.printToFileAsync({ html });
      const sharingAvailable = await Sharing.isAvailableAsync();
      if (sharingAvailable) {
        await Sharing.shareAsync(file.uri, { dialogTitle: "Del PDF" });
      } else {
        showToast(`Fant ikke delingsmulighet. Fil lagret til:\n${file.uri}`);
      }
    } catch (error) {
      console.warn("PDF export failed", error);
      showToast("Kunne ikke generere PDF. Prøv igjen senere.");
    }
  };

  const handleAddSpeech = async () => {
    if (!newName.trim()) {
      showToast("Vennligst skriv inn navnet på taleren");
      return;
    }

    let updatedSpeeches: Speech[];

    if (editingSpeech) {
      updatedSpeeches = speeches.map((s) =>
        s.id === editingSpeech.id
          ? {
              ...s,
              speakerName: newName.trim(),
              role: newRole.trim() || "Gjest",
              time: newTime.trim() || "TBD",
              status: newStatus,
              tableId: selectedTableId,
            }
          : s
      );
    } else {
      const newSpeech: Speech = {
        id: generateId(),
        speakerName: newName.trim(),
        role: newRole.trim() || "Gjest",
        time: newTime.trim() || "TBD",
        order: speeches.length + 1,
        status: newStatus,
        tableId: selectedTableId,
      };
      updatedSpeeches = [...speeches, newSpeech];
    }

    setSpeeches(updatedSpeeches);
    await saveSpeeches(updatedSpeeches);
    
    // Notify VenueScreen to refresh
    queryClient.invalidateQueries({ queryKey: ['speeches'] });

    setNewName("");
    setNewRole("");
    setNewTime("");
    setNewStatus("ready");
    setSelectedTableId(null);
    setEditingSpeech(null);
    setShowForm(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleEditSpeech = (speech: Speech) => {
    setEditingSpeech(speech);
    setNewName(speech.speakerName);
    setNewRole(speech.role);
    setNewTime(speech.time);
    setNewStatus(speech.status || "ready");
    setSelectedTableId(speech.tableId ?? null);
    setShowForm(true);
  };

  const handleDeleteSpeech = async (id: string) => {
    const confirmed = await showConfirm({
      title: "Slett tale",
      message: "Er du sikker på at du vil slette denne talen?",
      confirmLabel: "Slett",
      cancelLabel: "Avbryt",
      destructive: true,
    });
    if (!confirmed) return;
    const updatedSpeeches = speeches
      .filter((s) => s.id !== id)
      .map((s, index) => ({ ...s, order: index + 1 }));
    setSpeeches(updatedSpeeches);
    await saveSpeeches(updatedSpeeches);
    queryClient.invalidateQueries({ queryKey: ['speeches'] });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;

    const newSpeeches = [...speeches];
    [newSpeeches[index - 1], newSpeeches[index]] = [
      newSpeeches[index],
      newSpeeches[index - 1],
    ];

    const updatedSpeeches = newSpeeches.map((s, i) => ({ ...s, order: i + 1 }));
    setSpeeches(updatedSpeeches);
    await saveSpeeches(updatedSpeeches);
    queryClient.invalidateQueries({ queryKey: ['speeches'] });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleMoveDown = async (index: number) => {
    if (index === speeches.length - 1) return;

    const newSpeeches = [...speeches];
    [newSpeeches[index], newSpeeches[index + 1]] = [
      newSpeeches[index + 1],
      newSpeeches[index],
    ];

    const updatedSpeeches = newSpeeches.map((s, i) => ({ ...s, order: i + 1 }));
    setSpeeches(updatedSpeeches);
    await saveSpeeches(updatedSpeeches);
    queryClient.invalidateQueries({ queryKey: ['speeches'] });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
    >
      <View style={styles.toolbar}>
        <Pressable
          onPress={handleExportPdf}
          style={[styles.exportButton, { borderColor: Colors.dark.accent }]}
        >
          <EvendiIcon name="printer" size={18} color={Colors.dark.accent} />
          <ThemedText style={[styles.exportButtonText, { color: Colors.dark.accent }]}>
            Eksporter PDF per bord
          </ThemedText>
        </Pressable>
      </View>

      <ThemedText
        style={[styles.subtitle, { color: theme.textSecondary }]}
      >
        {speeches.length} taler planlagt
      </ThemedText>

      <ThemedText style={[styles.swipeHint, { color: theme.textMuted }]}>
        Sveip til venstre for å endre eller slette
      </ThemedText>

      <View style={styles.speechList}>
        {speeches.map((speech, index) => (
          <Animated.View
            key={speech.id}
            entering={FadeInRight.delay(index * 100).duration(300)}
          >
            <SwipeableRow
              onEdit={() => handleEditSpeech(speech)}
              onDelete={() => handleDeleteSpeech(speech.id)}
              backgroundColor={theme.backgroundDefault}
            >
              <View
                style={[
                  styles.speechItem,
                  {
                    backgroundColor: theme.backgroundDefault,
                    borderColor: theme.border,
                  },
                ]}
              >
                <View style={styles.orderContainer}>
                  <ThemedText
                    style={[styles.orderNumber, { color: Colors.dark.accent }]}
                  >
                    {speech.order}
                  </ThemedText>
                </View>

                <View style={styles.speechInfo}>
                  <ThemedText style={styles.speakerName}>
                    {speech.speakerName}
                  </ThemedText>
                  <ThemedText
                    style={[styles.speechRole, { color: theme.textSecondary }]}
                  >
                    {speech.role}
                  </ThemedText>
                  <View style={styles.metaRow}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusColor[speech.status || "ready"] + "20" },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.statusText,
                          { color: statusColor[speech.status || "ready"] },
                        ]}
                      >
                        {statusLabel[speech.status || "ready"]}
                      </ThemedText>
                    </View>
                    <View style={[styles.tableChip, { borderColor: theme.border }]}
                    >
                      <EvendiIcon name="map-pin" size={12} color={theme.textSecondary} />
                      <ThemedText style={[styles.tableChipText, { color: theme.textSecondary }]}>
                        {getTableLabel(speech.tableId)}
                      </ThemedText>
                    </View>
                  </View>
                </View>
                <ThemedText
                  style={[styles.speechTime, { color: Colors.dark.accent }]}
                >
                  {speech.time}
                </ThemedText>

                <View style={styles.reorderButtons}>
                  <Pressable
                    onPress={() => handleMoveUp(index)}
                    style={[
                      styles.reorderButton,
                      { opacity: index === 0 ? 0.3 : 1 },
                    ]}
                    disabled={index === 0}
                  >
                    <EvendiIcon name="chevron-up" size={18} color={theme.textSecondary} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleMoveDown(index)}
                    style={[
                      styles.reorderButton,
                      { opacity: index === speeches.length - 1 ? 0.3 : 1 },
                    ]}
                    disabled={index === speeches.length - 1}
                  >
                    <EvendiIcon
                      name="chevron-down"
                      size={18}
                      color={theme.textSecondary}
                    />
                  </Pressable>
                </View>
              </View>
            </SwipeableRow>
          </Animated.View>
        ))}
      </View>

      {showForm ? (
        <Animated.View
          style={[
            styles.formCard,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
        >
          <ThemedText type="h3" style={styles.formTitle}>
            {editingSpeech ? "Endre tale" : "Legg til tale"}
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
            placeholder="Navn på taler"
            placeholderTextColor={theme.textMuted}
            value={newName}
            onChangeText={setNewName}
          />

          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.input,
                styles.halfInput,
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
            <TextInput
              style={[
                styles.input,
                styles.halfInput,
                {
                  backgroundColor: theme.backgroundSecondary,
                  color: theme.text,
                  borderColor: theme.border,
                },
              ]}
              placeholder="Tid (18:00)"
              placeholderTextColor={theme.textMuted}
              value={newTime}
              onChangeText={setNewTime}
            />
          </View>

          <ThemedText style={[styles.statusLabel, { color: theme.textSecondary }]}>Status</ThemedText>
          <View style={styles.statusRow}>
            {["ready", "speaking", "done"].map((status) => (
              <Pressable
                key={status}
                onPress={() => setNewStatus(status as NonNullable<Speech["status"]>)}
                style={[
                  styles.statusOption,
                  {
                    borderColor:
                      newStatus === status ? statusColor[status as NonNullable<Speech["status"]>] : theme.border,
                    backgroundColor:
                      newStatus === status
                        ? (statusColor[status as NonNullable<Speech["status"]>] + "20")
                        : theme.backgroundSecondary,
                  },
                ]}
              >
                <ThemedText
                  style={{
                    color:
                      newStatus === status
                        ? statusColor[status as NonNullable<Speech["status"]>]
                        : theme.text,
                    fontWeight: "600",
                  }}
                >
                  {statusLabel[status as NonNullable<Speech["status"]>]}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <ThemedText style={[styles.statusLabel, { color: theme.textSecondary }]}>Bord</ThemedText>
          <View style={styles.tablePicker}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: Spacing.sm }}>
              <Pressable
                onPress={() => setSelectedTableId(null)}
                style={[
                  styles.tableOption,
                  {
                    borderColor: selectedTableId === null ? Colors.dark.accent : theme.border,
                    backgroundColor:
                      selectedTableId === null ? Colors.dark.accent + "20" : theme.backgroundSecondary,
                  },
                ]}
              >
                <ThemedText style={{ color: theme.text }}>Ingen</ThemedText>
              </Pressable>
              {tables.map((table) => (
                <Pressable
                  key={table.id}
                  onPress={() => setSelectedTableId(table.id)}
                  style={[
                    styles.tableOption,
                    {
                      borderColor: selectedTableId === table.id ? Colors.dark.accent : theme.border,
                      backgroundColor:
                        selectedTableId === table.id ? Colors.dark.accent + "20" : theme.backgroundSecondary,
                    },
                  ]}
                >
                  <ThemedText style={{ color: theme.text }}>{table.name || `Bord`}</ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          <View style={styles.formButtons}>
            <Pressable
              onPress={() => {
                setShowForm(false);
                setEditingSpeech(null);
                setNewName("");
                setNewRole("");
                setNewTime("");
                setNewStatus("ready");
                setSelectedTableId(null);
              }}
              style={[styles.cancelButton, { borderColor: theme.border }]}
            >
              <ThemedText style={{ color: theme.textSecondary }}>Avbryt</ThemedText>
            </Pressable>
            <Button onPress={handleAddSpeech} style={styles.saveButton}>
              {editingSpeech ? "Oppdater" : "Lagre"}
            </Button>
          </View>
        </Animated.View>
      ) : (
        <Pressable
          onPress={() => {
            setShowForm(true);
            setNewStatus("ready");
            setSelectedTableId(null);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={[styles.addButton, { borderColor: Colors.dark.accent }]}
        >
          <EvendiIcon name="plus" size={20} color={Colors.dark.accent} />
          <ThemedText style={[styles.addButtonText, { color: Colors.dark.accent }]}>
            Legg til tale
          </ThemedText>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: Spacing.sm,
  },
  exportButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  exportButtonText: {
    fontWeight: "600",
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  swipeHint: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  speechList: {
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  speechItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  orderContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: "700",
  },
  speechInfo: {
    flex: 1,
  },
  speakerName: {
    fontSize: 16,
    fontWeight: "500",
  },
  speechRole: {
    fontSize: 13,
  },
  metaRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "center",
    marginTop: Spacing.xs,
    flexWrap: "wrap",
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  tableChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  tableChipText: {
    fontSize: 12,
  },
  speechTime: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: Spacing.md,
  },
  reorderButtons: {
    flexDirection: "column",
  },
  reorderButton: {
    padding: Spacing.xs,
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
  inputRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  halfInput: {
    flex: 1,
  },
  formButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  statusLabel: {
    marginBottom: Spacing.xs,
    fontSize: 14,
  },
  statusRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  statusOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  tablePicker: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
  },
  tableOption: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
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
});
