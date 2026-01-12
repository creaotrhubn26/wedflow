import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

interface InspirationCategory {
  id: string;
  name: string;
  icon: string;
}

interface MediaItem {
  type: "image" | "video";
  url: string;
  caption: string;
}

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export default function InspirationCreateScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [categoryId, setCategoryId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState<MediaItem[]>([{ type: "image", url: "", caption: "" }]);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    const sessionData = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
    if (sessionData) {
      const parsed = JSON.parse(sessionData);
      setSessionToken(parsed.sessionToken);
    } else {
      navigation.goBack();
    }
  };

  const { data: categories = [] } = useQuery<InspirationCategory[]>({
    queryKey: ["/api/inspiration-categories"],
  });

  const addMediaItem = () => {
    setMedia([...media, { type: "image", url: "", caption: "" }]);
  };

  const removeMediaItem = (index: number) => {
    if (media.length > 1) {
      setMedia(media.filter((_, i) => i !== index));
    }
  };

  const updateMediaItem = (index: number, field: keyof MediaItem, value: string) => {
    const updated = [...media];
    updated[index] = { ...updated[index], [field]: value };
    setMedia(updated);
  };

  const validateForm = () => {
    if (!categoryId) {
      Alert.alert("Feil", "Velg en kategori");
      return false;
    }
    if (!title.trim()) {
      Alert.alert("Feil", "Tittel er påkrevd");
      return false;
    }
    const validMedia = media.filter((m) => m.url.trim());
    if (validMedia.length === 0) {
      Alert.alert("Feil", "Legg til minst ett bilde eller video");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !sessionToken) return;

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const validMedia = media.filter((m) => m.url.trim());
      const response = await fetch(new URL("/api/vendor/inspirations", getApiUrl()).toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionToken}`,
        },
        body: JSON.stringify({
          categoryId,
          title: title.trim(),
          description: description.trim() || undefined,
          media: validMedia,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kunne ikke opprette inspirasjon");
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/inspirations"] });

      Alert.alert("Suksess!", data.message || "Inspirasjon opprettet!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Feil", error instanceof Error ? error.message : "Noe gikk galt");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.md,
          paddingHorizontal: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
        }}
      >
        <ThemedText style={styles.sectionTitle}>Kategori</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => setCategoryId(cat.id)}
              style={[
                styles.categoryChip,
                { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                categoryId === cat.id && { borderColor: Colors.dark.accent, backgroundColor: Colors.dark.accent + "20" },
              ]}
            >
              <ThemedText
                style={[
                  styles.categoryChipText,
                  categoryId === cat.id && { color: Colors.dark.accent },
                ]}
              >
                {cat.name}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        <ThemedText style={styles.sectionTitle}>Tittel</ThemedText>
        <TextInput
          style={[styles.input, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
          value={title}
          onChangeText={setTitle}
          placeholder="F.eks. Romantisk hagebryllup"
          placeholderTextColor={theme.textMuted}
        />

        <ThemedText style={styles.sectionTitle}>Beskrivelse (valgfritt)</ThemedText>
        <TextInput
          style={[styles.input, styles.textArea, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Kort beskrivelse av inspirasjonen..."
          placeholderTextColor={theme.textMuted}
          multiline
          numberOfLines={3}
        />

        <ThemedText style={styles.sectionTitle}>Bilder/Videoer</ThemedText>
        {media.map((item, index) => (
          <View key={index} style={[styles.mediaCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <View style={styles.mediaHeader}>
              <View style={styles.mediaTypeRow}>
                <Pressable
                  onPress={() => updateMediaItem(index, "type", "image")}
                  style={[styles.typeBtn, item.type === "image" && { backgroundColor: Colors.dark.accent + "30" }]}
                >
                  <Feather name="image" size={14} color={item.type === "image" ? Colors.dark.accent : theme.textMuted} />
                  <ThemedText style={[styles.typeBtnText, { color: item.type === "image" ? Colors.dark.accent : theme.textMuted }]}>
                    Bilde
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => updateMediaItem(index, "type", "video")}
                  style={[styles.typeBtn, item.type === "video" && { backgroundColor: Colors.dark.accent + "30" }]}
                >
                  <Feather name="video" size={14} color={item.type === "video" ? Colors.dark.accent : theme.textMuted} />
                  <ThemedText style={[styles.typeBtnText, { color: item.type === "video" ? Colors.dark.accent : theme.textMuted }]}>
                    Video
                  </ThemedText>
                </Pressable>
              </View>
              {media.length > 1 ? (
                <Pressable onPress={() => removeMediaItem(index)} style={styles.removeBtn}>
                  <Feather name="trash-2" size={18} color="#F44336" />
                </Pressable>
              ) : null}
            </View>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundRoot, borderColor: theme.border, color: theme.text }]}
              value={item.url}
              onChangeText={(text) => updateMediaItem(index, "url", text)}
              placeholder="https://eksempel.no/bilde.jpg"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              keyboardType="url"
            />
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundRoot, borderColor: theme.border, color: theme.text, marginTop: Spacing.xs }]}
              value={item.caption}
              onChangeText={(text) => updateMediaItem(index, "caption", text)}
              placeholder="Bildetekst (valgfritt)"
              placeholderTextColor={theme.textMuted}
            />
          </View>
        ))}

        <Pressable
          onPress={addMediaItem}
          style={[styles.addMediaBtn, { borderColor: theme.border }]}
        >
          <Feather name="plus" size={18} color={Colors.dark.accent} />
          <ThemedText style={[styles.addMediaText, { color: Colors.dark.accent }]}>
            Legg til flere
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={[styles.submitBtn, { backgroundColor: Colors.dark.accent, opacity: isSubmitting ? 0.6 : 1 }]}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#1A1A1A" />
          ) : (
            <>
              <Feather name="send" size={18} color="#1A1A1A" />
              <ThemedText style={styles.submitBtnText}>Send til godkjenning</ThemedText>
            </>
          )}
        </Pressable>

        <ThemedText style={[styles.note, { color: theme.textMuted }]}>
          Inspirasjoner må godkjennes før de vises for brudepar.
        </ThemedText>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  categoryList: {
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 14,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  mediaCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  mediaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  mediaTypeRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  typeBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    gap: 4,
  },
  typeBtnText: {
    fontSize: 13,
  },
  removeBtn: {
    padding: Spacing.xs,
  },
  addMediaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  addMediaText: {
    fontSize: 14,
    fontWeight: "600",
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  note: {
    fontSize: 13,
    textAlign: "center",
    marginTop: Spacing.md,
  },
});
