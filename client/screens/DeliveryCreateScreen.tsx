import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Clipboard from "expo-clipboard";

import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

interface DeliveryItemInput {
  type: "gallery" | "video" | "website" | "download" | "contract" | "document" | "other";
  label: string;
  url: string;
  description: string;
}

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

const ITEM_TYPES = [
  { value: "gallery" as const, label: "Bildegalleri", icon: "image" },
  { value: "video" as const, label: "Video", icon: "video" },
  { value: "website" as const, label: "Nettside", icon: "globe" },
  { value: "download" as const, label: "Nedlasting", icon: "download" },
  { value: "contract" as const, label: "Kontrakt", icon: "file-text" },
  { value: "document" as const, label: "Dokument", icon: "file" },
  { value: "other" as const, label: "Annet", icon: "link" },
];

export default function DeliveryCreateScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [coupleName, setCoupleName] = useState("");
  const [coupleEmail, setCoupleEmail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [items, setItems] = useState<DeliveryItemInput[]>([
    { type: "gallery", label: "", url: "", description: "" },
  ]);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    const session = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
    if (session) {
      setSessionToken(JSON.parse(session).sessionToken);
    }
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!sessionToken) {
        throw new Error("Vennligst logg inn på nytt");
      }
      const response = await fetch(new URL("/api/vendor/deliveries", getApiUrl()).toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          coupleName,
          coupleEmail: coupleEmail || undefined,
          title,
          description: description || undefined,
          weddingDate: weddingDate || undefined,
          items: items.filter((i) => i.label && i.url),
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kunne ikke opprette leveranse");
      }
      return response.json();
    },
    onSuccess: async (data) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await Clipboard.setStringAsync(data.delivery.accessCode);
      Alert.alert(
        "Leveranse opprettet!",
        `Tilgangskode: ${data.delivery.accessCode}\n\nKoden er kopiert til utklippstavlen. Del denne med brudeparet.`,
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/deliveries"] });
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Feil", error.message);
    },
  });

  const addItem = () => {
    setItems([...items, { type: "gallery", label: "", url: "", description: "" }]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const updateItem = (index: number, field: keyof DeliveryItemInput, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = () => {
    if (!sessionToken) {
      Alert.alert("Feil", "Vennligst logg inn på nytt.");
      return;
    }

    if (!coupleName || !title) {
      Alert.alert("Mangler informasjon", "Fyll ut navn på brudeparet og tittel.");
      return;
    }

    const validItems = items.filter((i) => i.label && i.url);
    if (validItems.length === 0) {
      Alert.alert("Mangler lenker", "Legg til minst én lenke med etikett og URL.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    createMutation.mutate();
  };

  const getIconName = (iconName: string): keyof typeof Feather.glyphMap => {
    const map: Record<string, keyof typeof Feather.glyphMap> = {
      image: "image",
      video: "video",
      globe: "globe",
      download: "download",
      "file-text": "file-text",
      file: "file",
      link: "link",
    };
    return map[iconName] || "link";
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
      >
        <ThemedText style={styles.sectionTitle}>Brudepar</ThemedText>
        <View style={styles.section}>
          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <Feather name="users" size={18} color={theme.textMuted} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Navn på brudeparet *"
              placeholderTextColor={theme.textMuted}
              value={coupleName}
              onChangeText={setCoupleName}
            />
          </View>
          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <Feather name="mail" size={18} color={theme.textMuted} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="E-post (valgfritt)"
              placeholderTextColor={theme.textMuted}
              value={coupleEmail}
              onChangeText={setCoupleEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <Feather name="calendar" size={18} color={theme.textMuted} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Bryllupsdato (valgfritt)"
              placeholderTextColor={theme.textMuted}
              value={weddingDate}
              onChangeText={setWeddingDate}
            />
          </View>
        </View>

        <ThemedText style={styles.sectionTitle}>Leveranse</ThemedText>
        <View style={styles.section}>
          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <Feather name="tag" size={18} color={theme.textMuted} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Tittel *"
              placeholderTextColor={theme.textMuted}
              value={title}
              onChangeText={setTitle}
            />
          </View>
          <View style={[styles.inputContainer, styles.textAreaContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <TextInput
              style={[styles.input, styles.textArea, { color: theme.text }]}
              placeholder="Beskrivelse (valgfritt)"
              placeholderTextColor={theme.textMuted}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        <View style={styles.itemsHeader}>
          <ThemedText style={styles.sectionTitle}>Lenker</ThemedText>
          <Pressable onPress={addItem} style={[styles.addItemBtn, { backgroundColor: Colors.dark.accent + "20" }]}>
            <Feather name="plus" size={16} color={Colors.dark.accent} />
            <ThemedText style={[styles.addItemText, { color: Colors.dark.accent }]}>Legg til</ThemedText>
          </Pressable>
        </View>

        {items.map((item, index) => (
          <View key={index} style={[styles.itemCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <View style={styles.itemHeader}>
              <ThemedText style={[styles.itemNumber, { color: theme.textMuted }]}>Lenke {index + 1}</ThemedText>
              {items.length > 1 ? (
                <Pressable onPress={() => removeItem(index)} style={styles.removeBtn}>
                  <Feather name="x" size={18} color="#EF5350" />
                </Pressable>
              ) : null}
            </View>

            <View style={styles.typeSelector}>
              {ITEM_TYPES.map((type) => (
                <Pressable
                  key={type.value}
                  onPress={() => {
                    updateItem(index, "type", type.value);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.typeBtn,
                    {
                      backgroundColor: item.type === type.value ? Colors.dark.accent : theme.backgroundRoot,
                      borderColor: item.type === type.value ? Colors.dark.accent : theme.border,
                    },
                  ]}
                >
                  <Feather
                    name={getIconName(type.icon)}
                    size={14}
                    color={item.type === type.value ? "#1A1A1A" : theme.textSecondary}
                  />
                </Pressable>
              ))}
            </View>

            <View style={[styles.itemInput, { backgroundColor: theme.backgroundRoot, borderColor: theme.border }]}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Etikett (f.eks. Bryllupsbilder)"
                placeholderTextColor={theme.textMuted}
                value={item.label}
                onChangeText={(v) => updateItem(index, "label", v)}
              />
            </View>

            <View style={[styles.itemInput, { backgroundColor: theme.backgroundRoot, borderColor: theme.border }]}>
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="URL (https://...)"
                placeholderTextColor={theme.textMuted}
                value={item.url}
                onChangeText={(v) => updateItem(index, "url", v)}
                keyboardType="url"
                autoCapitalize="none"
              />
            </View>
          </View>
        ))}

        <Pressable
          onPress={handleSubmit}
          disabled={createMutation.isPending}
          style={[
            styles.submitBtn,
            { backgroundColor: Colors.dark.accent, opacity: createMutation.isPending ? 0.6 : 1 },
          ]}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#1A1A1A" />
          ) : (
            <>
              <Feather name="check" size={20} color="#1A1A1A" />
              <ThemedText style={styles.submitBtnText}>Opprett leveranse</ThemedText>
            </>
          )}
        </Pressable>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    textTransform: "uppercase",
    opacity: 0.6,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  section: {
    gap: Spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 50,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  textAreaContainer: {
    height: 100,
    alignItems: "flex-start",
    paddingVertical: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  textArea: {
    height: "100%",
    textAlignVertical: "top",
  },
  itemsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  addItemBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  addItemText: {
    fontSize: 13,
    fontWeight: "600",
  },
  itemCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  itemNumber: {
    fontSize: 13,
    fontWeight: "500",
  },
  removeBtn: {
    padding: 4,
  },
  typeSelector: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  typeBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  itemInput: {
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    justifyContent: "center",
    marginBottom: Spacing.xs,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  submitBtnText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
  },
});
