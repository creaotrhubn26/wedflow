import React, { useState, useCallback, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  TextInput,
  Modal,
  LayoutRectangle,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { EvendiIcon } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getCoupleSession } from "@/lib/storage";
import { getGuests } from "@/lib/api-guests";
import { Table, TABLE_CATEGORIES, Speech } from "@/lib/types";
import { apiRequest } from "@/lib/query-client";
import { getSpeeches } from "@/lib/storage";
import type { WeddingGuest } from "@shared/schema";
import { showToast } from "@/lib/toast";
import { showConfirm } from "@/lib/dialogs";

export default function TableSeatingScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [guests, setGuests] = useState<WeddingGuest[]>([]);
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [selectedGuest, setSelectedGuest] = useState<WeddingGuest | null>(null);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [showSpeakers, setShowSpeakers] = useState(true);
  const [draggingGuest, setDraggingGuest] = useState<{ guest: WeddingGuest; fromTableId: string | null } | null>(null);
  const [draggingOverTableId, setDraggingOverTableId] = useState<string | null>(null);

  const tableLayouts = useRef<Record<string, LayoutRectangle>>({});
  const scrollOffset = useRef(0);
  const scrollViewLayout = useRef({ x: 0, y: 0, height: 0 });
  const scrollViewRef = useRef<ScrollView | null>(null);
  const SCROLL_EDGE_MARGIN = 80;
  const SCROLL_STEP = 24;

  const dragX = useSharedValue(0);
  const dragY = useSharedValue(0);
  const dragActive = useSharedValue(0);

  const { data: tables = [], isLoading } = useQuery<Table[]>({
    queryKey: ["/api/couple/tables"],
  });

  const loadGuests = useCallback(async () => {
    try {
      let token = sessionToken;
      if (!token) {
        const session = await getCoupleSession();
        if (!session) return;
        token = session.token;
        setSessionToken(session.token);
      }
      const guestsData = await getGuests(token);
      setGuests(guestsData);
    } catch (err) {
      console.warn("Failed to load guests:", err);
    }
  }, [sessionToken]);

  const loadSpeeches = useCallback(async () => {
    try {
      const data = await getSpeeches();
      const normalized = data.map((speech, index) => ({
        ...speech,
        status: speech.status || "ready",
        tableId: speech.tableId ?? null,
        order: speech.order || index + 1,
      }));
      setSpeeches(normalized);
    } catch (err) {
      console.warn("Failed to load speeches:", err);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGuests();
      loadSpeeches();
      queryClient.invalidateQueries({ queryKey: ["/api/couple/tables"] });
    }, [loadGuests, loadSpeeches, queryClient])
  );

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

  const dragGhostStyle = useAnimatedStyle(() => ({
    opacity: dragActive.value,
    transform: [
      { translateX: dragX.value },
      { translateY: dragY.value },
      { scale: dragActive.value ? 1 : 0.95 },
    ],
  }));

  const handleAssignGuest = async (tableId: string) => {
    if (!selectedGuest) return;
    assignGuestMutation.mutate({ tableId, guestId: selectedGuest.id });
  };

  const handleRemoveGuest = async (guest: WeddingGuest, tableId: string) => {
    const confirmed = await showConfirm({
      title: "Fjern fra bord",
      message: `Fjerne ${guest.name} fra bordet?`,
      confirmLabel: "Fjern",
      cancelLabel: "Avbryt",
      destructive: true,
    });
    if (confirmed) {
      removeGuestMutation.mutate({ tableId, guestId: guest.id });
    }
  };

  const getGuestsByTable = useCallback((tableId: string) => {
    const table = tables.find((t) => t.id === tableId);
    if (!table) return [];
    return guests.filter((g) => table.guests.includes(g.id));
  }, [guests, tables]);

  const resolveTableAtPoint = useCallback((absoluteX: number, absoluteY: number) => {
    const contentX = absoluteX - scrollViewLayout.current.x;
    const contentY = absoluteY - scrollViewLayout.current.y + scrollOffset.current;

    for (const [tableId, layout] of Object.entries(tableLayouts.current)) {
      const withinX = contentX >= layout.x && contentX <= layout.x + layout.width;
      const withinY = contentY >= layout.y && contentY <= layout.y + layout.height;
      if (withinX && withinY) return tableId;
    }
    return null;
  }, []);

  const handleDropGuest = useCallback((guest: WeddingGuest, targetTableId: string | null) => {
    if (!targetTableId) return;
    const targetTable = tables.find((t) => t.id === targetTableId);
    if (!targetTable) return;
    const tableGuests = getGuestsByTable(targetTableId);
    if (tableGuests.length >= targetTable.seats) {
      showToast(`"${targetTable.name}" er fullt.`);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    assignGuestMutation.mutate({ tableId: targetTableId, guestId: guest.id });
  }, [assignGuestMutation, getGuestsByTable, tables]);

  const startDrag = useCallback((guest: WeddingGuest, fromTableId: string | null, x: number, y: number) => {
    dragActive.value = withSpring(1, { damping: 20 });
    dragX.value = x - 80;
    dragY.value = y - 20;
    setDraggingGuest({ guest, fromTableId });
    setSelectedGuest(null);
  }, [dragActive, dragX, dragY]);

  const updateDrag = useCallback((x: number, y: number) => {
    dragX.value = x - 80;
    dragY.value = y - 20;
    const target = resolveTableAtPoint(x, y);
    setDraggingOverTableId(target);
    const layout = scrollViewLayout.current;
    if (layout.height > 0) {
      const topEdge = layout.y + SCROLL_EDGE_MARGIN;
      const bottomEdge = layout.y + layout.height - SCROLL_EDGE_MARGIN;
      if (y < topEdge) {
        const nextOffset = Math.max(0, scrollOffset.current - SCROLL_STEP);
        if (nextOffset !== scrollOffset.current) {
          scrollOffset.current = nextOffset;
          scrollViewRef.current?.scrollTo({ y: nextOffset, animated: false });
        }
      } else if (y > bottomEdge) {
        const nextOffset = scrollOffset.current + SCROLL_STEP;
        scrollOffset.current = nextOffset;
        scrollViewRef.current?.scrollTo({ y: nextOffset, animated: false });
      }
    }
  }, [dragX, dragY]);

  const endDrag = useCallback((guest: WeddingGuest, fromTableId: string | null, x: number, y: number) => {
    dragActive.value = withSpring(0, { damping: 20 });
    const target = resolveTableAtPoint(x, y);
    setDraggingGuest(null);
    setDraggingOverTableId(null);
    if (!target || target === fromTableId) return;
    handleDropGuest(guest, target);
  }, [dragActive, handleDropGuest, resolveTableAtPoint]);

  const speechesByTable = React.useMemo(() => {
    const map = new Map<string, Speech[]>();
    speeches.forEach((speech) => {
      if (!speech.tableId) return;
      const existing = map.get(speech.tableId) || [];
      map.set(speech.tableId, [...existing, speech]);
    });
    return map;
  }, [speeches]);

  const statusColor: Record<NonNullable<Speech["status"]>, string> = {
    ready: Colors.dark.accent,
    speaking: "#f59e0b",
    done: "#16a34a",
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
    showConfirm({
      title: "Slett bord",
      message: `Er du sikker på at du vil slette "${table.name}"? Gjestene vil bli fjernet fra bordet.`,
      confirmLabel: "Slett",
      cancelLabel: "Avbryt",
      destructive: true,
    }).then((confirmed) => {
      if (confirmed) deleteTableMutation.mutate(table.id);
    });
  };

  const getCategoryLabel = (category?: string) => {
    const cat = TABLE_CATEGORIES.find((c) => c.value === category);
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
        ref={scrollViewRef}
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        onLayout={(event) => {
          scrollViewLayout.current = {
            x: event.nativeEvent.layout.x,
            y: event.nativeEvent.layout.y,
            height: event.nativeEvent.layout.height,
          };
        }}
        onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
          scrollOffset.current = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
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
              <EvendiIcon name="x" size={20} color="#1A1A1A" />
            </Pressable>
          </Animated.View>
        ) : null}

        <View style={styles.toggleRow}>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.toggleLabel}>Vis talere på bord</ThemedText>
            <ThemedText style={[styles.toggleHint, { color: theme.textSecondary }]}>
              Få oversikt over hvem som taler hvor
            </ThemedText>
          </View>
          <Pressable
            onPress={() => setShowSpeakers(!showSpeakers)}
            style={[
              styles.toggle,
              { backgroundColor: showSpeakers ? Colors.dark.accent : theme.backgroundSecondary },
            ]}
          >
            <View
              style={[
                styles.toggleKnob,
                {
                  backgroundColor: "#fff",
                  transform: [{ translateX: showSpeakers ? 20 : 0 }],
                },
              ]}
            />
          </Pressable>
        </View>

        <View style={styles.tablesGrid}>
          {tables.map((table, index) => {
            const tableGuests = getGuestsByTable(table.id);
            const availableSeats = table.seats - tableGuests.length;
            const tableSpeeches = speechesByTable.get(table.id) || [];
            const isDropTarget = !!draggingGuest && draggingOverTableId === table.id;
            const isSameTable = draggingGuest?.fromTableId === table.id;
            const canDrop = isDropTarget && !isSameTable && availableSeats > 0;
            const shouldDim = !!draggingGuest && !isDropTarget && availableSeats > 0;
            const dropColor = canDrop ? Colors.dark.accent : "#ef4444";

            return (
              <Animated.View
                key={table.id}
                entering={FadeInUp.delay(index * 100).duration(300)}
              >
                <Pressable
                  onLayout={(event) => {
                    tableLayouts.current[table.id] = event.nativeEvent.layout;
                  }}
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
                      opacity: shouldDim ? 0.55 : 1,
                      borderColor:
                        isDropTarget
                          ? dropColor
                          :
                        selectedGuest && availableSeats > 0
                          ? Colors.dark.accent
                          : table.isReserved
                          ? Colors.dark.accent + "60"
                          : theme.border,
                      borderWidth: isDropTarget || (selectedGuest && availableSeats > 0) ? 2 : 1,
                    },
                    isDropTarget ? (canDrop ? styles.dropTarget : styles.dropTargetInvalid) : null,
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
                      <EvendiIcon name="edit-2" size={16} color={theme.textSecondary} />
                    </Pressable>
                  </View>

                  {isDropTarget ? (
                    <View style={[styles.dropHint, { backgroundColor: dropColor + "20", borderColor: dropColor }]}
                    >
                      <ThemedText style={[styles.dropHintText, { color: dropColor }]}
                      >
                        {canDrop ? "Slipp for å plassere" : "Fullt bord"}
                      </ThemedText>
                    </View>
                  ) : null}

                  {showSpeakers && tableSpeeches.length > 0 ? (
                    <View style={styles.speechOverlay}>
                      <View style={styles.speechOverlayHeader}>
                        <EvendiIcon name="mic" size={14} color={Colors.dark.accent} />
                        <ThemedText style={[styles.speechOverlayTitle, { color: theme.text }]}>
                          Taler ved bordet
                        </ThemedText>
                      </View>
                      <View style={styles.speechBadges}>
                        {tableSpeeches
                          .sort((a, b) => (a.order || 0) - (b.order || 0))
                          .map((speech) => (
                            <View
                              key={speech.id}
                              style={[
                                styles.speechBadge,
                                { borderColor: statusColor[speech.status || "ready"] },
                              ]}
                            >
                              <ThemedText style={[styles.speechBadgeOrder, { color: statusColor[speech.status || "ready"] }]}>
                                {speech.order}
                              </ThemedText>
                              <View style={{ flex: 1 }}>
                                <ThemedText style={styles.speechBadgeName} numberOfLines={1}>
                                  {speech.speakerName}
                                </ThemedText>
                                <ThemedText style={[styles.speechBadgeStatus, { color: statusColor[speech.status || "ready"] }]}>
                                  {speech.status === "done"
                                    ? "Ferdig"
                                    : speech.status === "speaking"
                                    ? "Snakker nå"
                                    : "Klar"}
                                </ThemedText>
                              </View>
                              <ThemedText style={[styles.speechBadgeTime, { color: theme.textSecondary }]}>
                                {speech.time}
                              </ThemedText>
                            </View>
                          ))}
                      </View>
                    </View>
                  ) : null}

                  {table.isReserved ? (
                    <View style={[styles.reservedBadge, { backgroundColor: Colors.dark.accent + "20" }]}>
                      <EvendiIcon name="lock" size={12} color={Colors.dark.accent} />
                      <ThemedText style={[styles.reservedText, { color: Colors.dark.accent }]}>
                        Reservert
                      </ThemedText>
                    </View>
                  ) : null}

                  {tableGuests.length > 0 ? (
                    <View style={styles.guestsList}>
                      {tableGuests.map((guest) => (
                            <View
                              key={guest.id}
                              style={[styles.guestChip, { backgroundColor: theme.backgroundSecondary }]}
                            >
                              <Pressable
                                onLongPress={() => handleRemoveGuest(guest, table.id)}
                                style={styles.guestChipPressable}
                              >
                                <ThemedText style={styles.guestChipText}>
                                  {guest.name}
                                </ThemedText>
                              </Pressable>
                              <GestureDetector
                                gesture={Gesture.Pan()
                                  .minDistance(8)
                                  .onBegin((e) => {
                                    runOnJS(startDrag)(guest, table.id, e.absoluteX, e.absoluteY);
                                  })
                                  .onUpdate((e) => {
                                    runOnJS(updateDrag)(e.absoluteX, e.absoluteY);
                                  })
                                  .onEnd((e) => {
                                    runOnJS(endDrag)(guest, table.id, e.absoluteX, e.absoluteY);
                                  })}
                              >
                                <View style={styles.dragHandle}>
                                  <EvendiIcon name="move" size={14} color={theme.textSecondary} />
                                </View>
                              </GestureDetector>
                            </View>
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
          <EvendiIcon name="plus" size={20} color={Colors.dark.accent} />
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
                <View
                  key={guest.id}
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
                  <Pressable
                    onPress={() => {
                      setSelectedGuest(guest);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={styles.unassignedPressable}
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
                  <GestureDetector
                    gesture={Gesture.Pan()
                      .minDistance(8)
                      .onBegin((e) => {
                        runOnJS(startDrag)(guest, null, e.absoluteX, e.absoluteY);
                      })
                      .onUpdate((e) => {
                        runOnJS(updateDrag)(e.absoluteX, e.absoluteY);
                      })
                      .onEnd((e) => {
                        runOnJS(endDrag)(guest, null, e.absoluteX, e.absoluteY);
                      })}
                  >
                    <View style={styles.dragHandle}>
                      <EvendiIcon name="move" size={14} color={theme.textSecondary} />
                    </View>
                  </GestureDetector>
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {draggingGuest ? (
        <Animated.View pointerEvents="none" style={[styles.dragGhost, dragGhostStyle]}>
          <View
            style={[
              styles.dragGhostChip,
              { backgroundColor: theme.backgroundDefault, borderColor: Colors.dark.accent },
            ]}
          >
            <ThemedText style={styles.dragGhostText}>{draggingGuest.guest.name}</ThemedText>
          </View>
        </Animated.View>
      ) : null}

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
                <EvendiIcon name="x" size={24} color={theme.text} />
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
                    <EvendiIcon name="trash-2" size={20} color="#ff4444" />
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
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  toggleLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  toggleHint: {
    fontSize: 13,
    marginTop: 2,
  },
  tablesGrid: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  tableCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  dropTarget: {
    shadowColor: Colors.dark.accent,
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  dropTargetInvalid: {
    shadowColor: "#ef4444",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
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
  speechOverlay: {
    marginBottom: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  dropHint: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  dropHintText: {
    fontSize: 12,
    fontWeight: "600",
  },
  speechOverlayHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  speechOverlayTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  speechBadges: {
    gap: Spacing.xs,
  },
  speechBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  speechBadgeOrder: {
    fontWeight: "700",
  },
  speechBadgeName: {
    fontSize: 14,
    fontWeight: "600",
  },
  speechBadgeStatus: {
    fontSize: 12,
  },
  speechBadgeTime: {
    fontSize: 12,
    fontWeight: "600",
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
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  guestChipPressable: {
    paddingRight: Spacing.xs,
  },
  guestChipText: {
    fontSize: 13,
  },
  dragHandle: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
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
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  unassignedPressable: {
    paddingRight: Spacing.xs,
  },
  unassignedName: {
    fontSize: 14,
    fontWeight: "500",
  },
  dragGhost: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 20,
  },
  dragGhostChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  dragGhostText: {
    fontSize: 14,
    fontWeight: "600",
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
