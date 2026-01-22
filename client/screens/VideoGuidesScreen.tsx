import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { VideoGuide } from "../../shared/schema";

export default function VideoGuidesScreen() {
  const { theme } = useTheme();
  const [selectedGuide, setSelectedGuide] = useState<VideoGuide | null>(null);
  const [category, setCategory] = useState<string>("all");

  const { data: guides = [], isLoading } = useQuery<VideoGuide[]>({
    queryKey: ["video-guides"],
    queryFn: async () => {
      const url = new URL("/api/video-guides", getApiUrl());
      const res = await fetch(url);
      if (!res.ok) throw new Error("Kunne ikke hente videoguider");
      return res.json();
    },
  });

  const categories = useMemo(() => {
    const cats = new Set<string>();
    guides.forEach((g) => cats.add(g.category));
    return ["all", ...Array.from(cats)];
  }, [guides]);

  const filtered = useMemo(() => {
    if (category === "all") return guides;
    return guides.filter((g) => g.category === category);
  }, [guides, category]);

  const handlePlay = (guide: VideoGuide) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGuide(guide);
  };

  const handleOpenURL = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert("Feil", "Kunne ikke åpne video");
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundRoot }]} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Feather name="play-circle" size={32} color={theme.accent} />
        <ThemedText style={styles.title}>Videoguider</ThemedText>
        <ThemedText style={styles.subtitle}>Lær å bruke Wedflow med videoguider</ThemedText>
      </View>

      {isLoading && <ActivityIndicator style={{ marginTop: Spacing.lg }} color={theme.accent} />}

      {!isLoading && guides.length === 0 && (
        <View style={styles.emptyState}>
          <Feather name="video" size={48} color={theme.textMuted} />
          <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>Ingen videoguider tilgjengelig</ThemedText>
        </View>
      )}

      {!isLoading && guides.length > 0 && (
        <>
          {categories.length > 1 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={{ paddingHorizontal: Spacing.md, gap: Spacing.sm }}
            >
              {categories.map((cat) => (
                <Pressable
                  key={cat}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: category === cat ? theme.accent : theme.backgroundSecondary,
                      borderColor: category === cat ? theme.accent : theme.border,
                    },
                  ]}
                  onPress={() => setCategory(cat)}
                >
                  <ThemedText style={[styles.categoryChipText, { color: category === cat ? "#FFFFFF" : theme.text }]}>
                    {cat === "all" ? "Alle" : cat}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          )}

          <FlatList
            data={filtered}
            keyExtractor={(g) => g.id}
            contentContainerStyle={{ padding: Spacing.md }}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.card, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
                onPress={() => handlePlay(item)}
              >
                <View style={[styles.thumbnail, { backgroundColor: theme.backgroundDefault }]}>
                  <Feather name="play" size={48} color={theme.accent} />
                </View>
                <View style={styles.cardContent}>
                  <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
                  <ThemedText style={[styles.cardDesc, { color: theme.textSecondary }]} numberOfLines={2}>
                    {item.description}
                  </ThemedText>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: Spacing.sm }}>
                    <Feather name="tag" size={12} color={theme.textMuted} />
                    <ThemedText style={[styles.cardMeta, { color: theme.textMuted }]}>{item.category}</ThemedText>
                  </View>
                </View>
                <Feather name="chevron-right" size={20} color={theme.textMuted} />
              </Pressable>
            )}
          />
        </>
      )}

      <Modal visible={selectedGuide !== null} transparent animationType="slide" onRequestClose={() => setSelectedGuide(null)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]} edges={["top", "bottom"]}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setSelectedGuide(null)} hitSlop={10}>
              <Feather name="x" size={24} color={theme.text} />
            </Pressable>
            <ThemedText style={styles.modalTitle}>{selectedGuide?.title}</ThemedText>
            <View style={{ width: 24 }} />
          </View>

          {selectedGuide && (
            <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
              <View style={[styles.videoBox, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <Feather name="video" size={64} color={theme.accent} />
              </View>

              <ThemedText style={[styles.guideTitle, { color: theme.text }]}>{selectedGuide.title}</ThemedText>
              <ThemedText style={[styles.guideCat, { color: theme.textMuted }]}>Kategori: {selectedGuide.category}</ThemedText>

              <ThemedText style={[styles.guideDesc, { color: theme.textSecondary }]}>{selectedGuide.description}</ThemedText>

              <Pressable
                style={[styles.playBtn, { backgroundColor: theme.accent }]}
                onPress={() => handleOpenURL(selectedGuide.videoUrl)}
              >
                <Feather name="play" size={20} color="#FFFFFF" />
                <ThemedText style={styles.playBtnText}>Åpne video</ThemedText>
              </Pressable>

              {selectedGuide.icon && (
                <View style={{ marginTop: Spacing.lg }}>
                  <ThemedText style={[styles.label, { color: theme.text }]}>Ikon</ThemedText>
                  <ThemedText style={[styles.meta, { color: theme.textMuted }]}>{selectedGuide.icon}</ThemedText>
                </View>
              )}
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  title: { fontSize: 20, fontWeight: "700" },
  subtitle: { fontSize: 13, opacity: 0.6 },
  categoryScroll: { height: 44 },
  categoryChip: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  categoryChipText: { fontSize: 12, fontWeight: "600" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { fontSize: 14, marginTop: Spacing.md },
  card: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: "600", marginBottom: 2 },
  cardDesc: { fontSize: 12, lineHeight: 16 },
  cardMeta: { fontSize: 11 },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: Spacing.md, borderBottomWidth: 1, borderBottomColor: "#333" },
  modalTitle: { fontSize: 16, fontWeight: "600", textAlign: "center", flex: 1 },
  videoBox: { width: "100%", aspectRatio: 16 / 9, borderRadius: BorderRadius.md, borderWidth: 1, alignItems: "center", justifyContent: "center", marginBottom: Spacing.lg },
  guideTitle: { fontSize: 18, fontWeight: "700", marginBottom: Spacing.sm },
  guideCat: { fontSize: 12, marginBottom: Spacing.md },
  guideDesc: { fontSize: 14, lineHeight: 20, marginBottom: Spacing.lg },
  playBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  playBtnText: { fontSize: 16, fontWeight: "600", color: "#FFFFFF" },
  label: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  meta: { fontSize: 12 },
});
