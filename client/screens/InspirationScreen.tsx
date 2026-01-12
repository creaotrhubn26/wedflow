import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  Image,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import emptyInspirationImage from "../../assets/images/empty-inspiration.png";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_GAP = Spacing.sm;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - GRID_GAP) / 2;

interface InspirationCategory {
  id: string;
  name: string;
  icon: keyof typeof Feather.glyphMap;
  imageCount: number;
}

const CATEGORIES: InspirationCategory[] = [
  { id: "1", name: "Bryllup", icon: "heart", imageCount: 24 },
  { id: "2", name: "Dekorasjoner", icon: "star", imageCount: 18 },
  { id: "3", name: "Blomster", icon: "sun", imageCount: 15 },
  { id: "4", name: "Kjoler", icon: "award", imageCount: 32 },
  { id: "5", name: "Brudgom", icon: "user", imageCount: 12 },
  { id: "6", name: "Lokaler", icon: "home", imageCount: 20 },
];

const INSPIRATION_IMAGES = [
  { id: "1", category: "Bryllup" },
  { id: "2", category: "Dekorasjoner" },
  { id: "3", category: "Blomster" },
  { id: "4", category: "Kjoler" },
  { id: "5", category: "Bryllup" },
  { id: "6", category: "Lokaler" },
];

export default function InspirationScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());

  const handleToggleSave = (id: string) => {
    const newSaved = new Set(savedItems);
    if (newSaved.has(id)) {
      newSaved.delete(id);
    } else {
      newSaved.add(id);
    }
    setSavedItems(newSaved);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const filteredImages = selectedCategory
    ? INSPIRATION_IMAGES.filter((img) => img.category === selectedCategory)
    : INSPIRATION_IMAGES;

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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        <Pressable
          onPress={() => {
            setSelectedCategory(null);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={[
            styles.categoryChip,
            {
              backgroundColor:
                selectedCategory === null
                  ? Colors.dark.accent
                  : theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
        >
          <ThemedText
            style={[
              styles.categoryChipText,
              { color: selectedCategory === null ? "#1A1A1A" : theme.text },
            ]}
          >
            Alle
          </ThemedText>
        </Pressable>
        {CATEGORIES.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => {
              setSelectedCategory(category.name);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[
              styles.categoryChip,
              {
                backgroundColor:
                  selectedCategory === category.name
                    ? Colors.dark.accent
                    : theme.backgroundDefault,
                borderColor: theme.border,
              },
            ]}
          >
            <Feather
              name={category.icon}
              size={14}
              color={
                selectedCategory === category.name ? "#1A1A1A" : theme.textSecondary
              }
              style={styles.categoryIcon}
            />
            <ThemedText
              style={[
                styles.categoryChipText,
                {
                  color:
                    selectedCategory === category.name ? "#1A1A1A" : theme.text,
                },
              ]}
            >
              {category.name}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {filteredImages.length === 0 ? (
        <View style={styles.emptyState}>
          <Image
            source={emptyInspirationImage}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <ThemedText
            style={[styles.emptyText, { color: theme.textSecondary }]}
          >
            Ingen bilder i denne kategorien
          </ThemedText>
        </View>
      ) : (
        <View style={styles.grid}>
          {filteredImages.map((item, index) => (
            <Animated.View
              key={item.id}
              entering={FadeInUp.delay(index * 100).duration(300)}
            >
              <Pressable
                style={[
                  styles.imageCard,
                  { backgroundColor: theme.backgroundDefault },
                ]}
              >
                <View
                  style={[
                    styles.imagePlaceholder,
                    { backgroundColor: theme.backgroundSecondary },
                  ]}
                >
                  <Feather name="image" size={32} color={theme.textMuted} />
                </View>
                <View style={styles.imageOverlay}>
                  <View style={styles.categoryBadge}>
                    <ThemedText style={styles.categoryBadgeText}>
                      {item.category}
                    </ThemedText>
                  </View>
                  <Pressable
                    onPress={() => handleToggleSave(item.id)}
                    style={[
                      styles.saveButton,
                      {
                        backgroundColor: savedItems.has(item.id)
                          ? Colors.dark.accent
                          : "rgba(0,0,0,0.5)",
                      },
                    ]}
                  >
                    <Feather
                      name="heart"
                      size={16}
                      color={savedItems.has(item.id) ? "#1A1A1A" : "#FFFFFF"}
                    />
                  </Pressable>
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      )}

      <View style={styles.statsSection}>
        <ThemedText type="h3" style={styles.sectionTitle}>
          Kategorier
        </ThemedText>
        <View style={styles.categoriesList}>
          {CATEGORIES.map((category, index) => (
            <Animated.View
              key={category.id}
              entering={FadeInUp.delay(300 + index * 50).duration(300)}
            >
              <Pressable
                onPress={() => {
                  setSelectedCategory(category.name);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.categoryRow,
                  { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                ]}
              >
                <View
                  style={[
                    styles.categoryRowIcon,
                    { backgroundColor: theme.backgroundSecondary },
                  ]}
                >
                  <Feather name={category.icon} size={18} color={Colors.dark.accent} />
                </View>
                <ThemedText style={styles.categoryRowName}>
                  {category.name}
                </ThemedText>
                <ThemedText
                  style={[styles.categoryRowCount, { color: theme.textSecondary }]}
                >
                  {category.imageCount} bilder
                </ThemedText>
                <Feather name="chevron-right" size={18} color={theme.textMuted} />
              </Pressable>
            </Animated.View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  categoriesScroll: {
    marginHorizontal: -Spacing.lg,
    marginBottom: Spacing.lg,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryIcon: {
    marginRight: Spacing.xs,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  emptyState: {
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
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: GRID_GAP,
    marginBottom: Spacing["2xl"],
  },
  imageCard: {
    width: CARD_WIDTH,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  imagePlaceholder: {
    width: "100%",
    height: CARD_WIDTH * 1.3,
    justifyContent: "center",
    alignItems: "center",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "space-between",
    padding: Spacing.sm,
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  categoryBadgeText: {
    fontSize: 11,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  saveButton: {
    alignSelf: "flex-end",
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  statsSection: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  categoriesList: {
    gap: Spacing.sm,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  categoryRowIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  categoryRowName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  categoryRowCount: {
    fontSize: 14,
    marginRight: Spacing.sm,
  },
});
