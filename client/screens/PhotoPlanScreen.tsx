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
import { getPhotoShots, savePhotoShots, generateId } from "@/lib/storage";
import { PhotoShot } from "@/lib/types";

const DEFAULT_SHOTS: PhotoShot[] = [
  { id: "1", title: "Detaljer av brudekjolen", description: "Nærbilder av kjole og sko", completed: false, category: "details" },
  { id: "2", title: "Bruden og forlover", description: "Før seremonien", completed: false, category: "portraits" },
  { id: "3", title: "Brudgommen gjør seg klar", description: "Med bestmennene", completed: false, category: "portraits" },
  { id: "4", title: "Brudens ankomst", description: "Ved kirken/lokalet", completed: false, category: "ceremony" },
  { id: "5", title: "Seremonien", description: "Utveksling av løfter og ringer", completed: false, category: "ceremony" },
  { id: "6", title: "Første kyss", description: "Det viktige øyeblikket", completed: false, category: "ceremony" },
  { id: "7", title: "Gruppebilde med familie", description: "Begge familier samlet", completed: false, category: "group" },
  { id: "8", title: "Brudeparet alene", description: "Romantiske portretter", completed: false, category: "portraits" },
  { id: "9", title: "Middagen starter", description: "Første dans og taler", completed: false, category: "reception" },
  { id: "10", title: "Kaken skjæres", description: "Bryllupskaken", completed: false, category: "reception" },
];

const CATEGORY_LABELS: Record<PhotoShot["category"], string> = {
  ceremony: "Seremoni",
  portraits: "Portretter",
  group: "Gruppebilde",
  details: "Detaljer",
  reception: "Mottakelse",
};

const CATEGORY_ICONS: Record<PhotoShot["category"], keyof typeof Feather.glyphMap> = {
  ceremony: "heart",
  portraits: "user",
  group: "users",
  details: "eye",
  reception: "music",
};

export default function PhotoPlanScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [shots, setShots] = useState<PhotoShot[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<PhotoShot["category"]>("portraits");

  const loadData = useCallback(async () => {
    const data = await getPhotoShots();
    if (data.length === 0) {
      await savePhotoShots(DEFAULT_SHOTS);
      setShots(DEFAULT_SHOTS);
    } else {
      setShots(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const completedCount = shots.filter((s) => s.completed).length;
  const progress = shots.length > 0 ? (completedCount / shots.length) * 100 : 0;

  const handleToggleComplete = async (id: string) => {
    const updatedShots = shots.map((s) =>
      s.id === id ? { ...s, completed: !s.completed } : s
    );
    setShots(updatedShots);
    await savePhotoShots(updatedShots);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleAddShot = async () => {
    if (!newTitle.trim()) {
      Alert.alert("Feil", "Vennligst skriv inn en tittel");
      return;
    }

    const newShot: PhotoShot = {
      id: generateId(),
      title: newTitle.trim(),
      description: newDescription.trim(),
      completed: false,
      category: selectedCategory,
    };

    const updatedShots = [...shots, newShot];
    setShots(updatedShots);
    await savePhotoShots(updatedShots);

    setNewTitle("");
    setNewDescription("");
    setShowForm(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeleteShot = async (id: string) => {
    Alert.alert("Slett bilde", "Er du sikker på at du vil slette dette bildet?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Slett",
        style: "destructive",
        onPress: async () => {
          const updatedShots = shots.filter((s) => s.id !== id);
          setShots(updatedShots);
          await savePhotoShots(updatedShots);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  };

  const groupedShots = shots.reduce((acc, shot) => {
    if (!acc[shot.category]) {
      acc[shot.category] = [];
    }
    acc[shot.category].push(shot);
    return acc;
  }, {} as Record<PhotoShot["category"], PhotoShot[]>);

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
      <View style={[styles.progressCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.progressHeader}>
          <ThemedText type="h3">Fremgang</ThemedText>
          <ThemedText style={[styles.progressText, { color: Colors.dark.accent }]}>
            {completedCount}/{shots.length}
          </ThemedText>
        </View>
        <View style={[styles.progressBar, { backgroundColor: theme.backgroundSecondary }]}>
          <View
            style={[
              styles.progressFill,
              { backgroundColor: Colors.dark.accent, width: `${progress}%` },
            ]}
          />
        </View>
      </View>

      {Object.entries(groupedShots).map(([category, categoryShots]) => (
        <View key={category} style={styles.categorySection}>
          <View style={styles.categoryHeader}>
            <View style={[styles.categoryIcon, { backgroundColor: theme.backgroundDefault }]}>
              <Feather
                name={CATEGORY_ICONS[category as PhotoShot["category"]]}
                size={16}
                color={Colors.dark.accent}
              />
            </View>
            <ThemedText type="h4">{CATEGORY_LABELS[category as PhotoShot["category"]]}</ThemedText>
          </View>

          <View style={styles.shotsList}>
            {categoryShots.map((shot, index) => (
              <Animated.View
                key={shot.id}
                entering={FadeInRight.delay(index * 50).duration(300)}
              >
                <Pressable
                  onPress={() => handleToggleComplete(shot.id)}
                  onLongPress={() => handleDeleteShot(shot.id)}
                  style={[
                    styles.shotItem,
                    {
                      backgroundColor: theme.backgroundDefault,
                      borderColor: theme.border,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: shot.completed
                          ? Colors.dark.accent
                          : "transparent",
                        borderColor: shot.completed
                          ? Colors.dark.accent
                          : theme.border,
                      },
                    ]}
                  >
                    {shot.completed ? (
                      <Feather name="check" size={14} color="#1A1A1A" />
                    ) : null}
                  </View>
                  <View style={styles.shotInfo}>
                    <ThemedText
                      style={[
                        styles.shotTitle,
                        shot.completed && styles.shotTitleCompleted,
                      ]}
                    >
                      {shot.title}
                    </ThemedText>
                    {shot.description ? (
                      <ThemedText
                        style={[styles.shotDescription, { color: theme.textSecondary }]}
                      >
                        {shot.description}
                      </ThemedText>
                    ) : null}
                  </View>
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </View>
      ))}

      {showForm ? (
        <Animated.View
          style={[
            styles.formCard,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
        >
          <ThemedText type="h3" style={styles.formTitle}>
            Legg til bilde
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
            placeholder="F.eks. Brudeparet ved sjøen"
            placeholderTextColor={theme.textMuted}
            value={newTitle}
            onChangeText={setNewTitle}
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
            placeholder="F.eks. Ved solnedgang, romantisk stemning"
            placeholderTextColor={theme.textMuted}
            value={newDescription}
            onChangeText={setNewDescription}
          />

          <ThemedText style={[styles.helpText, { color: theme.textMuted }]}>
            Velg kategori under for Foto & Video Tidsplan
          </ThemedText>

          <View style={styles.categoryPicker}>
            {(Object.keys(CATEGORY_LABELS) as PhotoShot["category"][]).map((cat) => (
              <Pressable
                key={cat}
                onPress={() => setSelectedCategory(cat)}
                style={[
                  styles.categoryOption,
                  {
                    backgroundColor:
                      selectedCategory === cat
                        ? Colors.dark.accent
                        : theme.backgroundSecondary,
                  },
                ]}
              >
                <Feather
                  name={CATEGORY_ICONS[cat]}
                  size={14}
                  color={selectedCategory === cat ? "#1A1A1A" : theme.textSecondary}
                />
              </Pressable>
            ))}
          </View>

          <View style={styles.formButtons}>
            <Pressable
              onPress={() => setShowForm(false)}
              style={[styles.cancelButton, { borderColor: theme.border }]}
            >
              <ThemedText style={{ color: theme.textSecondary }}>Avbryt</ThemedText>
            </Pressable>
            <Button onPress={handleAddShot} style={styles.saveButton}>
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
            Legg til bilde
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
  progressCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.xl,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  categorySection: {
    marginBottom: Spacing.xl,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
  },
  shotsList: {
    gap: Spacing.sm,
  },
  shotItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  shotInfo: {
    flex: 1,
  },
  shotTitle: {
    fontSize: 15,
    fontWeight: "500",
  },
  shotTitleCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  shotDescription: {
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
  helpText: {
    fontSize: 12,
    marginBottom: Spacing.sm,
  },
  categoryPicker: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  categoryOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  formButtons: {
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
