import React, { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Alert,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SwipeableRow } from "@/components/SwipeableRow";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { GuestsStackParamList } from "@/navigation/GuestsStackNavigator";
import { getGuests, saveGuests, generateId } from "@/lib/storage";
import { Guest } from "@/lib/types";
import emptyGuestsImage from "../../assets/images/empty-guests.png";

type NavigationProp = NativeStackNavigationProp<GuestsStackParamList>;

const STATUS_COLORS = {
  confirmed: "#4CAF50",
  pending: Colors.dark.accent,
  declined: "#EF5350",
};

const STATUS_LABELS = {
  confirmed: "Bekreftet",
  pending: "Venter",
  declined: "Avslått",
};

export default function GuestsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  const loadData = useCallback(async () => {
    const data = await getGuests();
    setGuests(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const confirmedCount = guests.filter((g) => g.status === "confirmed").length;
  const pendingCount = guests.filter((g) => g.status === "pending").length;

  const handleAddGuest = async () => {
    if (!newName.trim()) {
      Alert.alert("Feil", "Vennligst skriv inn et navn");
      return;
    }

    let updatedGuests: Guest[];

    if (editingGuest) {
      updatedGuests = guests.map((g) =>
        g.id === editingGuest.id ? { ...g, name: newName.trim() } : g
      );
    } else {
      const newGuest: Guest = {
        id: generateId(),
        name: newName.trim(),
        status: "pending",
      };
      updatedGuests = [...guests, newGuest];
    }

    setGuests(updatedGuests);
    await saveGuests(updatedGuests);

    setNewName("");
    setEditingGuest(null);
    setShowAddForm(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest);
    setNewName(guest.name);
    setShowAddForm(true);
  };

  const handleToggleStatus = async (guest: Guest) => {
    const statusOrder: Guest["status"][] = ["pending", "confirmed", "declined"];
    const currentIndex = statusOrder.indexOf(guest.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

    const updatedGuests = guests.map((g) =>
      g.id === guest.id ? { ...g, status: nextStatus } : g
    );
    setGuests(updatedGuests);
    await saveGuests(updatedGuests);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleDeleteGuest = async (id: string) => {
    Alert.alert("Slett gjest", "Er du sikker på at du vil slette denne gjesten?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Slett",
        style: "destructive",
        onPress: async () => {
          const updatedGuests = guests.filter((g) => g.id !== id);
          setGuests(updatedGuests);
          await saveGuests(updatedGuests);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  };

  const renderGuestItem = ({ item, index }: { item: Guest; index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 50).duration(300)}>
      <SwipeableRow
        onEdit={() => handleEditGuest(item)}
        onDelete={() => handleDeleteGuest(item.id)}
        backgroundColor={theme.backgroundDefault}
      >
        <Pressable
          onPress={() => handleToggleStatus(item)}
          style={({ pressed }) => [
            styles.guestItem,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            pressed && { opacity: 0.9 },
          ]}
        >
          <View
            style={[styles.avatar, { backgroundColor: theme.backgroundSecondary }]}
          >
            <Feather name="user" size={18} color={theme.textSecondary} />
          </View>
          <View style={styles.guestInfo}>
            <ThemedText style={styles.guestName}>{item.name}</ThemedText>
            {item.tableNumber ? (
              <ThemedText style={[styles.tableNumber, { color: theme.textSecondary }]}>
                Bord {item.tableNumber}
              </ThemedText>
            ) : null}
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: STATUS_COLORS[item.status] + "20" },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: STATUS_COLORS[item.status] },
              ]}
            />
            <ThemedText
              style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}
            >
              {STATUS_LABELS[item.status]}
            </ThemedText>
          </View>
        </Pressable>
      </SwipeableRow>
    </Animated.View>
  );

  const ListHeader = () => (
    <>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.statNumber, { color: Colors.dark.accent }]}>
            {guests.length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
            Gjester
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.statNumber, { color: "#4CAF50" }]}>
            {confirmedCount}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
            Bekreftet
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.statNumber, { color: Colors.dark.accent }]}>
            {pendingCount}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
            Venter
          </ThemedText>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <Pressable
          onPress={() => navigation.navigate("TableSeating")}
          style={[styles.actionButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          <Feather name="grid" size={18} color={Colors.dark.accent} />
          <ThemedText style={styles.actionButtonText}>Bordplassering</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("SpeechList")}
          style={[styles.actionButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          <Feather name="mic" size={18} color={Colors.dark.accent} />
          <ThemedText style={styles.actionButtonText}>Taleliste</ThemedText>
        </Pressable>
      </View>

      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
        ]}
      >
        <Feather name="search" size={18} color={theme.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Søk etter gjest..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <ThemedText style={[styles.swipeHint, { color: theme.textMuted }]}>
        Sveip til venstre for å endre eller slette
      </ThemedText>

      {showAddForm ? (
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[
            styles.addForm,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
        >
          <ThemedText type="h4" style={styles.formTitle}>
            {editingGuest ? "Endre gjest" : "Legg til gjest"}
          </ThemedText>
          <TextInput
            style={[
              styles.addInput,
              { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border },
            ]}
            placeholder="Navn på gjest"
            placeholderTextColor={theme.textMuted}
            value={newName}
            onChangeText={setNewName}
            autoFocus
          />
          <View style={styles.addFormButtons}>
            <Pressable
              onPress={() => {
                setShowAddForm(false);
                setEditingGuest(null);
                setNewName("");
              }}
              style={[styles.cancelButton, { borderColor: theme.border }]}
            >
              <ThemedText style={{ color: theme.textSecondary }}>Avbryt</ThemedText>
            </Pressable>
            <Button onPress={handleAddGuest} style={styles.saveButton}>
              {editingGuest ? "Oppdater" : "Legg til"}
            </Button>
          </View>
        </Animated.View>
      ) : null}
    </>
  );

  const ListEmpty = () => (
    <View style={styles.emptyState}>
      <Image
        source={emptyGuestsImage}
        style={styles.emptyImage}
        resizeMode="contain"
      />
      <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
        Ingen gjester lagt til
      </ThemedText>
      <ThemedText style={[styles.emptySubtext, { color: theme.textMuted }]}>
        Legg til din første gjest
      </ThemedText>
    </View>
  );

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
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={filteredGuests}
        renderItem={renderGuestItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl + 70,
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={searchQuery ? null : ListEmpty}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      />

      {!showAddForm ? (
        <Pressable
          onPress={() => {
            setShowAddForm(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={[
            styles.fab,
            { backgroundColor: Colors.dark.accent, bottom: tabBarHeight + Spacing.xl },
          ]}
        >
          <Feather name="plus" size={24} color="#1A1A1A" />
        </Pressable>
      ) : null}
    </View>
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
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
  swipeHint: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  addForm: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  formTitle: {
    marginBottom: Spacing.md,
  },
  addInput: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  addFormButtons: {
    flexDirection: "row",
    gap: Spacing.md,
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
  guestItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  guestInfo: {
    flex: 1,
  },
  guestName: {
    fontSize: 16,
    fontWeight: "500",
  },
  tableNumber: {
    fontSize: 13,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyImage: {
    width: 150,
    height: 150,
    marginBottom: Spacing.xl,
    opacity: 0.8,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});
