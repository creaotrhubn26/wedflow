import React, { useState, useCallback } from "react";
import { ScrollView, StyleSheet, View, Pressable, Alert, TextInput, Modal } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getGuests, saveGuests } from "@/lib/storage";
import { Table, Guest, TABLE_CATEGORIES } from "@/lib/types";
import { apiRequest } from "@/lib/query-client";

export default function TableSeatingScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [guests, setGuests] = useState<Guest[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: tables = [], isLoading } = useQuery<Table[]>({
    queryKey: ["/api/couple/tables"],
  });

  const loadGuests = useCallback(async () => {
    const guestsData = await getGuests();
    setGuests(guestsData);
  }, []);

  React.useEffect(() => {
    loadGuests();
  }, [loadGuests]);

  const createTableMutation = useMutation({
    mutationFn: async (data: Partial<Table>) => {
      return apiRequest("POST", "/api/couple/tables", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/couple/tables"] });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    },
  });

  const updateTableMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<Table> & { id: string }) => {
      return apiRequest("PATCH", `/api/couple/tables/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/couple/tables"] });
      setShowEditModal(false);
      setEditingTable(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const deleteTableMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/couple/tables/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/couple/tables"] });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
  });

  const assignGuestMutation = useMutation({
    mutationFn: async ({ tableId, guestId }: { tableId: string; guestId: string }) => {
      return apiRequest("POST", `/api/couple/tables/${tableId}/guests`, { guestId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/couple/tables"] });
      setSelectedGuest(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
  });

  const removeGuestMutation = useMutation({
    mutationFn: async ({ tableId, guestId }: { tableId: string; guestId: string }) => {
      return apiRequest("DELETE", `/api/couple/tables/${tableId}/guests/${guestId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/couple/tables"] });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    },
  });

  const getAssignedGuestIds = () => {
    const allAssigned = new Set<string>();
    for (const table of tables) {
      for (const guestId of table.guests) {
        allAssigned.add(guestId);
      }
    }
    return allAssigned;
  };

  const unassignedGuests = React.useMemo(() => {
    const assignedIds = getAssignedGuestIds();
    return guests.filter((g) => !assignedIds.has(g.id));
  }, [guests, tables]);

  const handleAssignGuest = async (tableId: string) => {
    if (!selectedGuest) return;
    assignGuestMutation.mutate({ tableId, guestId: selectedGuest.id });
  };

  const handleRemoveGuest = (guest: Guest, tableId: string) => {
    Alert.alert(
      "Fjern fra bord",
      `Fjerne ${guest.name} fra bordet?`,
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Fjern",
          onPress: () => removeGuestMutation.mutate({ tableId, guestId: guest.id }),
        },
      ]
    );
  };

  const getGuestsByTable = (tableId: string) => {
    const table = tables.find(t => t.id === tableId);
    if (!table) return [];
    return guests.filter((g) => table.guests.includes(g.id));
  };

  const handleAddTable = () => {
    const newTableNumber = tables.length + 1;
    createTableMutation.mutate({
      tableNumber: newTableNumber,
      name: `Bord ${newTableNumber}`,
      seats: 8,
      sortOrder: newTableNumber - 1,
    });
  };

  const handleEditTable = (table: Table) => {
    setEditingTable({ ...table });
    setShowEditModal(true);
  };

  const handleDeleteTable = (table: Table) => {
    Alert.alert(
      "Slett bord",
      `Er du sikker på at du vil slette "${table.name}"? Gjestene vil bli fjernet fra bordet.`,
      [
        { text: "Avbryt", style: "cancel" },
        { text: "Slett", style: "destructive", onPress: () => deleteTableMutation.mutate(table.id) },
      ]
    );
  };

  const getCategoryLabel = (category?: string) => {
    const cat = TABLE_CATEGORIES.find(c => c.value === category);
    return cat?.label || "";
  };

  if (isLoading) {
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
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        {selectedGuest ? (
          <Animated.View
            entering={FadeInUp.duration(300)}
            style={[
              styles.selectionBanner,
              { backgroundColor: Colors.dark.accent },
            ]}
          >
            <ThemedText style={styles.selectionText}>
              Velg bord for {selectedGuest.name}
            </ThemedText>
            <Pressable onPress={() => setSelectedGuest(null)}>
              <Feather name="x" size={20} color="#1A1A1A" />
            </Pressable>
          </Animated.View>
        ) : null}

        <View style={styles.tablesGrid}>
          {tables.map((table, index) => {
            const tableGuests = getGuestsByTable(table.id);
            const availableSeats = table.seats - tableGuests.length;

            return (
              <Animated.View
                key={table.id}
                entering={FadeInUp.delay(index * 100).duration(300)}
              >
                <Pressable
                  onPress={() =>
                    selectedGuest && availableSeats > 0
                      ? handleAssignGuest(table.id)
                      : null
                  }
                  onLongPress={() => handleEditTable(table)}
                  style={[
                    styles.tableCard,
                    {
                      backgroundColor: theme.backgroundDefault,
                      borderColor:
                        selectedGuest && availableSeats > 0
                          ? Colors.dark.accent
                          : table.isReserved
                          ? Colors.dark.accent + "60"
                          : theme.border,
                      borderWidth: selectedGuest && availableSeats > 0 ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.tableHeader}>
                    <View
                      style={[
                        styles.tableIcon,
                        { backgroundColor: table.isReserved ? Colors.dark.accent + "30" : theme.backgroundSecondary },
                      ]}
                    >
                      <ThemedText
                        style={[styles.tableNumber, { color: Colors.dark.accent }]}
                      >
                        {table.tableNumber}
                      </ThemedText>
                    </View>
                    <View style={styles.tableInfo}>
                      <ThemedText style={styles.tableName}>{table.name}</ThemedText>
                      {table.label || table.category ? (
                        <ThemedText style={[styles.categoryLabel, { color: Colors.dark.accent }]}>
                          {table.label || getCategoryLabel(table.category)}
                        </ThemedText>
                      ) : null}
                      <ThemedText
                        style={[styles.seatsInfo, { color: theme.textSecondary }]}
                      >
                        {tableGuests.length}/{table.seats} plasser
                      </ThemedText>
                    </View>
                    <Pressable 
                      onPress={() => handleEditTable(table)}
                      style={styles.editButton}
                    >
                      <Feather name="edit-2" size={16} color={theme.textSecondary} />
                    </Pressable>
                  </View>

                  {table.isReserved ? (
                    <View style={[styles.reservedBadge, { backgroundColor: Colors.dark.accent + "20" }]}>
                      <Feather name="lock" size={12} color={Colors.dark.accent} />
                      <ThemedText style={[styles.reservedText, { color: Colors.dark.accent }]}>
                        Reservert
                      </ThemedText>
                    </View>
                  ) : null}

                  {tableGuests.length > 0 ? (
                    <View style={styles.guestsList}>
                      {tableGuests.map((guest) => (
                        <Pressable
                          key={guest.id}
                          onLongPress={() => handleRemoveGuest(guest, table.id)}
                          style={[
                            styles.guestChip,
                            { backgroundColor: theme.backgroundSecondary },
                          ]}
                        >
                          <ThemedText style={styles.guestChipText}>
                            {guest.name}
                          </ThemedText>
                        </Pressable>
                      ))}
                    </View>
                  ) : !table.isReserved ? (
                    <ThemedText
                      style={[styles.emptyTable, { color: theme.textMuted }]}
                    >
                      Ingen gjester
                    </ThemedText>
                  ) : null}
                </Pressable>
              </Animated.View>
            );
          })}
        </View>

        <Pressable
          onPress={handleAddTable}
          style={[styles.addTableButton, { borderColor: Colors.dark.accent }]}
        >
          <Feather name="plus" size={20} color={Colors.dark.accent} />
          <ThemedText style={[styles.addTableText, { color: Colors.dark.accent }]}>
            Legg til bord
          </ThemedText>
        </Pressable>

        {unassignedGuests.length > 0 ? (
          <View style={styles.unassignedSection}>
            <ThemedText type="h3" style={styles.sectionTitle}>
              Gjester uten bord ({unassignedGuests.length})
            </ThemedText>
            <View style={styles.unassignedList}>
              {unassignedGuests.map((guest) => (
                <Pressable
                  key={guest.id}
                  onPress={() => {
                    setSelectedGuest(guest);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.unassignedGuest,
                    {
                      backgroundColor:
                        selectedGuest?.id === guest.id
                          ? Colors.dark.accent
                          : theme.backgroundDefault,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <ThemedText
                    style={[
                      styles.unassignedName,
                      {
                        color:
                          selectedGuest?.id === guest.id ? "#1A1A1A" : theme.text,
                      },
                    ]}
                  >
                    {guest.name}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="h3">Rediger bord</ThemedText>
              <Pressable onPress={() => setShowEditModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            {editingTable ? (
              <ScrollView style={styles.modalBody}>
                <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  Bordnavn
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                  value={editingTable.name}
                  onChangeText={(text) => setEditingTable({ ...editingTable, name: text })}
                  placeholder="F.eks. Hovedbord"
                  placeholderTextColor={theme.textMuted}
                />

                <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  Kategori
                </ThemedText>
                <View style={styles.categoryGrid}>
                  {TABLE_CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat.value}
                      onPress={() => setEditingTable({ ...editingTable, category: cat.value, label: cat.label })}
                      style={[
                        styles.categoryChip,
                        {
                          backgroundColor: editingTable.category === cat.value
                            ? Colors.dark.accent
                            : theme.backgroundSecondary,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.categoryChipText,
                          { color: editingTable.category === cat.value ? "#1A1A1A" : theme.text },
                        ]}
                      >
                        {cat.label}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>

                <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  Antall plasser
                </ThemedText>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                  value={String(editingTable.seats)}
                  onChangeText={(text) => setEditingTable({ ...editingTable, seats: parseInt(text) || 8 })}
                  keyboardType="number-pad"
                  placeholder="8"
                  placeholderTextColor={theme.textMuted}
                />

                <View style={styles.switchRow}>
                  <ThemedText>Reservert bord</ThemedText>
                  <Pressable
                    onPress={() => setEditingTable({ ...editingTable, isReserved: !editingTable.isReserved })}
                    style={[
                      styles.toggle,
                      { backgroundColor: editingTable.isReserved ? Colors.dark.accent : theme.backgroundSecondary },
                    ]}
                  >
                    <View
                      style={[
                        styles.toggleKnob,
                        { 
                          backgroundColor: "#fff",
                          transform: [{ translateX: editingTable.isReserved ? 20 : 0 }],
                        },
                      ]}
                    />
                  </Pressable>
                </View>

                <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  Notater (private)
                </ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                  value={editingTable.notes || ""}
                  onChangeText={(text) => setEditingTable({ ...editingTable, notes: text })}
                  placeholder="Private notater..."
                  placeholderTextColor={theme.textMuted}
                  multiline
                  numberOfLines={3}
                />

                <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>
                  Notater til lokale/dekoratør
                </ThemedText>
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                  value={editingTable.vendorNotes || ""}
                  onChangeText={(text) => setEditingTable({ ...editingTable, vendorNotes: text })}
                  placeholder="Notater synlig for lokale og dekoratører..."
                  placeholderTextColor={theme.textMuted}
                  multiline
                  numberOfLines={3}
                />

                <View style={styles.modalActions}>
                  <Button
                    onPress={() => updateTableMutation.mutate(editingTable)}
                    style={{ flex: 1 }}
                  >
                    Lagre
                  </Button>
                  <Pressable
                    onPress={() => handleDeleteTable(editingTable)}
                    style={[styles.deleteButton, { borderColor: "#ff4444" }]}
                  >
                    <Feather name="trash-2" size={20} color="#ff4444" />
                  </Pressable>
                </View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  selectionBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
  },
  selectionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  tablesGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  tableCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  tableHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  tableIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  tableNumber: {
    fontSize: 18,
    fontWeight: "700",
  },
  tableInfo: {
    flex: 1,
  },
  tableName: {
    fontSize: 16,
    fontWeight: "600",
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  seatsInfo: {
    fontSize: 13,
    marginTop: 2,
  },
  editButton: {
    padding: Spacing.sm,
  },
  reservedBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
    gap: 4,
  },
  reservedText: {
    fontSize: 12,
    fontWeight: "500",
  },
  guestsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  guestChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  guestChipText: {
    fontSize: 13,
  },
  emptyTable: {
    fontSize: 14,
    fontStyle: "italic",
  },
  addTableButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    marginBottom: Spacing["2xl"],
  },
  addTableText: {
    marginLeft: Spacing.sm,
    fontWeight: "500",
  },
  unassignedSection: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  unassignedList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  unassignedGuest: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  unassignedName: {
    fontSize: 14,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.1)",
  },
  modalBody: {
    padding: Spacing.lg,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
  },
  input: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.lg,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    padding: 2,
  },
  toggleKnob: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  modalActions: {
    flexDirection: "row",
    gap: Spacing.md,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  deleteButton: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
