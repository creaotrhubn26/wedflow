import React, { useEffect, useState, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInRight } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getSpeeches, saveSpeeches, generateId } from "@/lib/storage";
import { Speech } from "@/lib/types";

const DEFAULT_SPEECHES: Speech[] = [
  { id: "1", speakerName: "Mor til bruden", role: "Familie", time: "18:00", order: 1 },
  { id: "2", speakerName: "Far til brudgommen", role: "Familie", time: "18:15", order: 2 },
  { id: "3", speakerName: "Forlover", role: "Forlover", time: "18:30", order: 3 },
  { id: "4", speakerName: "Toastmaster", role: "Toastmaster", time: "18:45", order: 4 },
];

export default function SpeechListScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newTime, setNewTime] = useState("");

  const loadData = useCallback(async () => {
    const data = await getSpeeches();
    if (data.length === 0) {
      await saveSpeeches(DEFAULT_SPEECHES);
      setSpeeches(DEFAULT_SPEECHES);
    } else {
      setSpeeches(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddSpeech = async () => {
    if (!newName.trim()) {
      Alert.alert("Feil", "Vennligst skriv inn navnet på taleren");
      return;
    }

    const newSpeech: Speech = {
      id: generateId(),
      speakerName: newName.trim(),
      role: newRole.trim() || "Gjest",
      time: newTime.trim() || "TBD",
      order: speeches.length + 1,
    };

    const updatedSpeeches = [...speeches, newSpeech];
    setSpeeches(updatedSpeeches);
    await saveSpeeches(updatedSpeeches);

    setNewName("");
    setNewRole("");
    setNewTime("");
    setShowForm(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteSpeech = async (id: string) => {
    Alert.alert("Slett tale", "Er du sikker på at du vil slette denne talen?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Slett",
        style: "destructive",
        onPress: async () => {
          const updatedSpeeches = speeches
            .filter((s) => s.id !== id)
            .map((s, index) => ({ ...s, order: index + 1 }));
          setSpeeches(updatedSpeeches);
          await saveSpeeches(updatedSpeeches);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
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
      <ThemedText
        style={[styles.subtitle, { color: theme.textSecondary }]}
      >
        {speeches.length} taler planlagt
      </ThemedText>

      <View style={styles.speechList}>
        {speeches.map((speech, index) => (
          <Animated.View
            key={speech.id}
            entering={FadeInRight.delay(index * 100).duration(300)}
          >
            <Pressable
              onLongPress={() => handleDeleteSpeech(speech.id)}
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
                  <Feather name="chevron-up" size={18} color={theme.textSecondary} />
                </Pressable>
                <Pressable
                  onPress={() => handleMoveDown(index)}
                  style={[
                    styles.reorderButton,
                    { opacity: index === speeches.length - 1 ? 0.3 : 1 },
                  ]}
                  disabled={index === speeches.length - 1}
                >
                  <Feather
                    name="chevron-down"
                    size={18}
                    color={theme.textSecondary}
                  />
                </Pressable>
              </View>
            </Pressable>
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
            Legg til tale
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

          <View style={styles.formButtons}>
            <Pressable
              onPress={() => setShowForm(false)}
              style={[styles.cancelButton, { borderColor: theme.border }]}
            >
              <ThemedText style={{ color: theme.textSecondary }}>Avbryt</ThemedText>
            </Pressable>
            <Button onPress={handleAddSpeech} style={styles.saveButton}>
              Lagre
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
          <Feather name="plus" size={20} color={Colors.dark.accent} />
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
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  subtitle: {
    fontSize: 14,
    marginBottom: Spacing.lg,
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
