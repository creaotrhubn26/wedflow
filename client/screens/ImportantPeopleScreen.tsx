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
import { getImportantPeople, saveImportantPeople, generateId } from "@/lib/storage";
import { ImportantPerson } from "@/lib/types";

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

  const [people, setPeople] = useState<ImportantPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newPhone, setNewPhone] = useState("");

  const loadData = useCallback(async () => {
    const data = await getImportantPeople();
    setPeople(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddPerson = async () => {
    if (!newName.trim() || !newRole.trim()) {
      Alert.alert("Feil", "Vennligst fyll ut navn og rolle");
      return;
    }

    const newPerson: ImportantPerson = {
      id: generateId(),
      name: newName.trim(),
      role: newRole.trim(),
      phone: newPhone.trim() || undefined,
    };

    const updatedPeople = [...people, newPerson];
    setPeople(updatedPeople);
    await saveImportantPeople(updatedPeople);

    setNewName("");
    setNewRole("");
    setNewPhone("");
    setShowForm(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const handleDeletePerson = async (id: string) => {
    Alert.alert("Slett person", "Er du sikker på at du vil slette denne personen?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Slett",
        style: "destructive",
        onPress: async () => {
          const updatedPeople = people.filter((p) => p.id !== id);
          setPeople(updatedPeople);
          await saveImportantPeople(updatedPeople);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    >
      {people.length === 0 && !showForm ? (
        <View style={styles.emptyState}>
          <View
            style={[
              styles.emptyIcon,
              { backgroundColor: theme.backgroundDefault },
            ]}
          >
            <Feather name="users" size={32} color={theme.textMuted} />
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
        <View style={styles.peopleList}>
          {people.map((person, index) => (
            <Animated.View
              key={person.id}
              entering={FadeInRight.delay(index * 100).duration(300)}
            >
              <Pressable
                onLongPress={() => handleDeletePerson(person.id)}
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
                  <Feather name="user" size={20} color={Colors.dark.accent} />
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
                <Feather name="chevron-right" size={20} color={theme.textMuted} />
              </Pressable>
            </Animated.View>
          ))}
        </View>
      )}

      {showForm ? (
        <Animated.View
          style={[
            styles.formCard,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
        >
          <ThemedText type="h3" style={styles.formTitle}>
            Legg til person
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
              onPress={() => setShowForm(false)}
              style={[styles.cancelButton, { borderColor: theme.border }]}
            >
              <ThemedText style={{ color: theme.textSecondary }}>Avbryt</ThemedText>
            </Pressable>
            <Button onPress={handleAddPerson} style={styles.saveButton}>
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
            Legg til person
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
});
