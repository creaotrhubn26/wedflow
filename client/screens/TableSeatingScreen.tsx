import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, StyleSheet, View, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getTables, saveTables, getGuests, saveGuests } from "@/lib/storage";
import { Table, Guest } from "@/lib/types";

const DEFAULT_TABLES: Table[] = [
  { id: 1, name: "Bord 1", seats: 8, guests: [] },
  { id: 2, name: "Bord 2", seats: 8, guests: [] },
  { id: 3, name: "Bord 3", seats: 6, guests: [] },
  { id: 4, name: "Bord 4", seats: 6, guests: [] },
];

export default function TableSeatingScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [tables, setTables] = useState<Table[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);

  const loadData = useCallback(async () => {
    const [tablesData, guestsData] = await Promise.all([
      getTables(),
      getGuests(),
    ]);

    if (tablesData.length === 0) {
      await saveTables(DEFAULT_TABLES);
      setTables(DEFAULT_TABLES);
    } else {
      setTables(tablesData);
    }

    setGuests(guestsData);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const unassignedGuests = guests.filter((g) => !g.tableNumber);

  const handleAssignGuest = async (tableId: number) => {
    if (!selectedGuest) return;

    const updatedGuests = guests.map((g) =>
      g.id === selectedGuest.id ? { ...g, tableNumber: tableId } : g
    );

    const updatedTables = tables.map((t) =>
      t.id === tableId
        ? { ...t, guests: [...t.guests, selectedGuest.id] }
        : t
    );

    setGuests(updatedGuests);
    setTables(updatedTables);
    await Promise.all([saveGuests(updatedGuests), saveTables(updatedTables)]);

    setSelectedGuest(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleRemoveGuest = async (guest: Guest, tableId: number) => {
    Alert.alert(
      "Fjern fra bord",
      `Fjerne ${guest.name} fra bordet?`,
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Fjern",
          onPress: async () => {
            const updatedGuests = guests.map((g) =>
              g.id === guest.id ? { ...g, tableNumber: undefined } : g
            );

            const updatedTables = tables.map((t) =>
              t.id === tableId
                ? { ...t, guests: t.guests.filter((gId) => gId !== guest.id) }
                : t
            );

            setGuests(updatedGuests);
            setTables(updatedTables);
            await Promise.all([saveGuests(updatedGuests), saveTables(updatedTables)]);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          },
        },
      ]
    );
  };

  const getGuestsByTable = (tableId: number) => {
    return guests.filter((g) => g.tableNumber === tableId);
  };

  const handleAddTable = async () => {
    const newTable: Table = {
      id: tables.length + 1,
      name: `Bord ${tables.length + 1}`,
      seats: 6,
      guests: [],
    };

    const updatedTables = [...tables, newTable];
    setTables(updatedTables);
    await saveTables(updatedTables);
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
                style={[
                  styles.tableCard,
                  {
                    backgroundColor: theme.backgroundDefault,
                    borderColor:
                      selectedGuest && availableSeats > 0
                        ? Colors.dark.accent
                        : theme.border,
                    borderWidth: selectedGuest && availableSeats > 0 ? 2 : 1,
                  },
                ]}
              >
                <View style={styles.tableHeader}>
                  <View
                    style={[
                      styles.tableIcon,
                      { backgroundColor: theme.backgroundSecondary },
                    ]}
                  >
                    <ThemedText
                      style={[styles.tableNumber, { color: Colors.dark.accent }]}
                    >
                      {table.id}
                    </ThemedText>
                  </View>
                  <View style={styles.tableInfo}>
                    <ThemedText style={styles.tableName}>{table.name}</ThemedText>
                    <ThemedText
                      style={[styles.seatsInfo, { color: theme.textSecondary }]}
                    >
                      {tableGuests.length}/{table.seats} plasser
                    </ThemedText>
                  </View>
                </View>

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
                ) : (
                  <ThemedText
                    style={[styles.emptyTable, { color: theme.textMuted }]}
                  >
                    Ingen gjester
                  </ThemedText>
                )}
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
  seatsInfo: {
    fontSize: 13,
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
});
