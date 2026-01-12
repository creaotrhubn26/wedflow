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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { ProfileStackParamList } from "@/navigation/ProfileStackNavigator";
import { getWeddingDetails, saveWeddingDetails } from "@/lib/storage";
import { WeddingDetails } from "@/lib/types";

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [wedding, setWedding] = useState<WeddingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editCoupleNames, setEditCoupleNames] = useState("");
  const [editWeddingDate, setEditWeddingDate] = useState("");
  const [editVenue, setEditVenue] = useState("");

  const loadData = useCallback(async () => {
    const data = await getWeddingDetails();
    setWedding(data);
    if (data) {
      setEditCoupleNames(data.coupleNames);
      setEditWeddingDate(data.weddingDate);
      setEditVenue(data.venue);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    if (!editCoupleNames.trim() || !editWeddingDate.trim()) {
      Alert.alert("Feil", "Vennligst fyll ut navn og dato");
      return;
    }

    const updatedWedding: WeddingDetails = {
      coupleNames: editCoupleNames.trim(),
      weddingDate: editWeddingDate.trim(),
      venue: editVenue.trim(),
    };

    await saveWeddingDetails(updatedWedding);
    setWedding(updatedWedding);
    setEditing(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("nb-NO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
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
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View
          style={[
            styles.profileHeader,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
        >
          <View
            style={[
              styles.avatarLarge,
              { backgroundColor: theme.backgroundSecondary },
            ]}
          >
            <Feather name="heart" size={32} color={Colors.dark.accent} />
          </View>

          {editing ? (
            <View style={styles.editForm}>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.backgroundSecondary,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                placeholder="Navn (f.eks. Emma & Erik)"
                placeholderTextColor={theme.textMuted}
                value={editCoupleNames}
                onChangeText={setEditCoupleNames}
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
                placeholder="Dato (ÅÅÅÅ-MM-DD)"
                placeholderTextColor={theme.textMuted}
                value={editWeddingDate}
                onChangeText={setEditWeddingDate}
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
                placeholder="Lokale"
                placeholderTextColor={theme.textMuted}
                value={editVenue}
                onChangeText={setEditVenue}
              />
              <View style={styles.editButtons}>
                <Pressable
                  onPress={() => setEditing(false)}
                  style={[styles.cancelButton, { borderColor: theme.border }]}
                >
                  <ThemedText style={{ color: theme.textSecondary }}>
                    Avbryt
                  </ThemedText>
                </Pressable>
                <Button onPress={handleSave} style={styles.saveButton}>
                  Lagre
                </Button>
              </View>
            </View>
          ) : (
            <>
              <ThemedText type="h2" style={styles.coupleNames}>
                {wedding?.coupleNames || "Legg til navn"}
              </ThemedText>
              <ThemedText
                style={[styles.weddingDate, { color: Colors.dark.accent }]}
              >
                {wedding?.weddingDate ? formatDate(wedding.weddingDate) : "Legg til dato"}
              </ThemedText>
              <ThemedText
                style={[styles.venue, { color: theme.textSecondary }]}
              >
                {wedding?.venue || "Legg til lokale"}
              </ThemedText>
              <Pressable
                onPress={() => {
                  setEditing(true);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[styles.editButton, { borderColor: Colors.dark.accent }]}
              >
                <Feather name="edit-2" size={16} color={Colors.dark.accent} />
                <ThemedText style={[styles.editButtonText, { color: Colors.dark.accent }]}>
                  Rediger
                </ThemedText>
              </Pressable>
            </>
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Verktøy
        </ThemedText>
        <View style={styles.toolsGrid}>
          <Card
            elevation={1}
            onPress={() => navigation.navigate("PhotoPlan")}
            style={{ ...styles.toolCard, borderColor: theme.border }}
          >
            <View
              style={[
                styles.toolIcon,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Feather name="camera" size={20} color={Colors.dark.accent} />
            </View>
            <ThemedText style={styles.toolLabel}>Fotoplan</ThemedText>
            <ThemedText style={[styles.toolDescription, { color: theme.textSecondary }]}>
              Planlegg hvilke bilder du vil ha
            </ThemedText>
          </Card>

          <Card
            elevation={1}
            onPress={() => navigation.navigate("Settings")}
            style={{ ...styles.toolCard, borderColor: theme.border }}
          >
            <View
              style={[
                styles.toolIcon,
                { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <Feather name="settings" size={20} color={Colors.dark.accent} />
            </View>
            <ThemedText style={styles.toolLabel}>Innstillinger</ThemedText>
            <ThemedText style={[styles.toolDescription, { color: theme.textSecondary }]}>
              App-innstillinger
            </ThemedText>
          </Card>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <View style={styles.menuSection}>
          <MenuItem
            icon="help-circle"
            label="Hjelp"
            theme={theme}
            onPress={() => Alert.alert("Kontakt oss", "E-post: contact@norwedfilm.no\nNettside: norwedfilm.no\nInstagram: @norwedfilm")}
          />
          <MenuItem
            icon="info"
            label="Om Wedflow"
            theme={theme}
            onPress={() => Alert.alert("Wedflow", "Versjon 1.0.0\nby Norwedfilm\n\nKontakt:\ncontact@norwedfilm.no\nnorwedfilm.no\n@norwedfilm")}
          />
          <MenuItem
            icon="bell"
            label="Varsler og påminnelser"
            theme={theme}
            onPress={() => navigation.navigate("NotificationSettings")}
          />
          <MenuItem
            icon="share-2"
            label="Del med partner"
            theme={theme}
            onPress={() => Alert.alert("Del", "Delefunksjon kommer snart!")}
          />
          <MenuItem
            icon="briefcase"
            label="Leverandørportal"
            theme={theme}
            onPress={() => navigation.navigate("VendorLogin")}
          />
          <MenuItem
            icon="shield"
            label="Admin: Leverandører"
            theme={theme}
            onPress={() => navigation.navigate("AdminVendors")}
          />
        </View>
      </Animated.View>
    </ScrollView>
  );
}

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  theme: any;
  onPress: () => void;
}

function MenuItem({ icon, label, theme, onPress }: MenuItemProps) {
  return (
    <Pressable
      onPress={() => {
        onPress();
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }}
      style={({ pressed }) => [
        styles.menuItem,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
        pressed && { opacity: 0.9 },
      ]}
    >
      <View
        style={[styles.menuIcon, { backgroundColor: theme.backgroundSecondary }]}
      >
        <Feather name={icon} size={18} color={Colors.dark.accent} />
      </View>
      <ThemedText style={styles.menuLabel}>{label}</ThemedText>
      <Feather name="chevron-right" size={18} color={theme.textMuted} />
    </Pressable>
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
  profileHeader: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing["2xl"],
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  coupleNames: {
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  weddingDate: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: Spacing.xs,
  },
  venue: {
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  editButtonText: {
    marginLeft: Spacing.xs,
    fontWeight: "500",
  },
  editForm: {
    width: "100%",
    marginTop: Spacing.md,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  editButtons: {
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
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  toolsGrid: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing["2xl"],
  },
  toolCard: {
    flex: 1,
    borderWidth: 1,
  },
  toolIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  toolLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  toolDescription: {
    fontSize: 12,
  },
  menuSection: {
    gap: Spacing.sm,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
  },
});
