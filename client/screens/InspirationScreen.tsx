import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInUp } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_GAP = Spacing.sm;
const CARD_WIDTH = (SCREEN_WIDTH - Spacing.lg * 2 - GRID_GAP) / 2;

interface InspirationCategory {
  id: string;
  name: string;
  icon: string;
  sortOrder: number | null;
}

interface InspirationMedia {
  id: string;
  type: string;
  url: string;
  caption: string | null;
}

interface Vendor {
  id: string;
  businessName: string;
}

interface InspirationItem {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  status: string;
  createdAt: string;
  media: InspirationMedia[];
  vendor: Vendor | null;
  category: InspirationCategory | null;
}

const getIconName = (iconName: string): keyof typeof Feather.glyphMap => {
  const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
    heart: "heart",
    flower: "sun",
    star: "star",
    cake: "gift",
    home: "home",
    utensils: "coffee",
    gift: "gift",
    scissors: "scissors",
    camera: "camera",
    mail: "mail",
  };
  return iconMap[iconName] || "image";
};

export default function InspirationScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [savedItems, setSavedItems] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: categories = [] } = useQuery<InspirationCategory[]>({
    queryKey: ["/api/inspiration-categories"],
  });

  const { data: inspirations = [], isLoading, refetch } = useQuery<InspirationItem[]>({
    queryKey: ["/api/inspirations"],
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
  };

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

  const filteredInspirations = selectedCategory
    ? inspirations.filter((insp) => insp.category?.id === selectedCategory)
    : inspirations;

  const categoryCounts = categories.map((cat) => ({
    ...cat,
    count: inspirations.filter((insp) => insp.category?.id === cat.id).length,
  }));

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
      scrollIndicatorInsets={{ bottom: insets.bottom }}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          tintColor={Colors.dark.accent}
        />
      }
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
        {categories.map((category) => (
          <Pressable
            key={category.id}
            onPress={() => {
              setSelectedCategory(category.id);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[
              styles.categoryChip,
              {
                backgroundColor:
                  selectedCategory === category.id
                    ? Colors.dark.accent
                    : theme.backgroundDefault,
                borderColor: theme.border,
              },
            ]}
          >
            <Feather
              name={getIconName(category.icon)}
              size={14}
              color={
                selectedCategory === category.id ? "#1A1A1A" : theme.textSecondary
              }
              style={styles.categoryIcon}
            />
            <ThemedText
              style={[
                styles.categoryChipText,
                {
                  color:
                    selectedCategory === category.id ? "#1A1A1A" : theme.text,
                },
              ]}
            >
              {category.name}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.accent} />
        </View>
      ) : filteredInspirations.length === 0 ? (
        <View style={styles.emptyState}>
          <Feather name="image" size={48} color={theme.textMuted} />
          <ThemedText
            style={[styles.emptyText, { color: theme.textSecondary }]}
          >
            {selectedCategory ? "Ingen inspirasjoner i denne kategorien" : "Ingen inspirasjoner ennå"}
          </ThemedText>
          <ThemedText
            style={[styles.emptySubtext, { color: theme.textMuted }]}
          >
            Leverandører legger snart til vakre bilder her
          </ThemedText>
        </View>
      ) : (
        <View style={styles.grid}>
          {filteredInspirations.map((item, index) => (
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
                {item.coverImageUrl || (item.media.length > 0 && item.media[0].url) ? (
                  <Image
                    source={{ uri: item.coverImageUrl || item.media[0].url }}
                    style={styles.imagePlaceholder}
                    contentFit="cover"
                  />
                ) : (
                  <View
                    style={[
                      styles.imagePlaceholder,
                      { backgroundColor: theme.backgroundSecondary },
                    ]}
                  >
                    <Feather name="image" size={32} color={theme.textMuted} />
                  </View>
                )}
                <View style={styles.imageOverlay}>
                  <View style={styles.categoryBadge}>
                    <ThemedText style={styles.categoryBadgeText}>
                      {item.category?.name || "Inspirasjon"}
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
                <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                  <ThemedText style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </ThemedText>
                  {item.vendor ? (
                    <ThemedText style={[styles.vendorName, { color: theme.textMuted }]} numberOfLines={1}>
                      av {item.vendor.businessName}
                    </ThemedText>
                  ) : null}
                </View>
              </Pressable>
            </Animated.View>
          ))}
        </View>
      )}

      {categoryCounts.length > 0 ? (
        <View style={styles.statsSection}>
          <ThemedText type="h3" style={styles.sectionTitle}>
            Kategorier
          </ThemedText>
          <View style={styles.categoriesList}>
            {categoryCounts.map((category, index) => (
              <Animated.View
                key={category.id}
                entering={FadeInUp.delay(300 + index * 50).duration(300)}
              >
                <Pressable
                  onPress={() => {
                    setSelectedCategory(category.id);
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
                    <Feather name={getIconName(category.icon)} size={18} color={Colors.dark.accent} />
                  </View>
                  <ThemedText style={styles.categoryRowName}>
                    {category.name}
                  </ThemedText>
                  <ThemedText
                    style={[styles.categoryRowCount, { color: theme.textSecondary }]}
                  >
                    {category.count} {category.count === 1 ? "bilde" : "bilder"}
                  </ThemedText>
                  <Feather name="chevron-right" size={18} color={theme.textMuted} />
                </Pressable>
              </Animated.View>
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    paddingVertical: Spacing["5xl"],
    alignItems: "center",
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
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: Spacing.xs,
    textAlign: "center",
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
    height: CARD_WIDTH * 1.3,
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
  cardFooter: {
    padding: Spacing.sm,
    borderTopWidth: 1,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  vendorName: {
    fontSize: 11,
    marginTop: 2,
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
