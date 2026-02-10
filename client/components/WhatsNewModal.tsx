import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  FlatList,
  Modal,
  SafeAreaView,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { EvendiIcon, EvendiIconGlyphMap } from "@/components/EvendiIcon";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { WhatsNewItem } from "../../shared/schema";

interface WhatsNewModalProps {
  visible: boolean;
  onDismiss: () => void;
  currentAppVersion: string;
  category: "vendor" | "couple";
}

const STORAGE_KEY_PREFIX = "whats_new_viewed_version_";

const isEvendiIcon = (icon: string): icon is keyof typeof EvendiIconGlyphMap => {
  return Object.prototype.hasOwnProperty.call(EvendiIconGlyphMap, icon);
};

export default function WhatsNewModal({
  visible,
  onDismiss,
  currentAppVersion,
  category,
}: WhatsNewModalProps) {
  const { theme } = useTheme();
  const storageKey = `${STORAGE_KEY_PREFIX}${category}`;
  const [viewedVersion, setViewedVersion] = useState<string | null>(null);
  const [checkingStorage, setCheckingStorage] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadViewedVersion = async () => {
      try {
        const stored = await AsyncStorage.getItem(storageKey);
        if (isMounted) {
          setViewedVersion(stored);
        }
      } catch (error) {
        console.error("Failed to load whats new version", error);
      } finally {
        if (isMounted) {
          setCheckingStorage(false);
        }
      }
    };

    loadViewedVersion();
    return () => {
      isMounted = false;
    };
  }, [storageKey]);

  // Fetch what's new items for specific category
  const { data: allItems = [] } = useQuery<WhatsNewItem[]>({
    queryKey: ["whats-new", category],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/whats-new/${category}`);
      if (!res.ok) throw new Error("Failed to fetch what's new");
      return res.json();
    },
  });

  // Filter items for current app version
  const items = useMemo(() => {
    return allItems.filter((item) => {
      const [major, minor, patch] = item.minAppVersion.split(".").map(Number);
      const [appMajor, appMinor, appPatch] = currentAppVersion
        .split(".")
        .map(Number);

      return (
        appMajor > major ||
        (appMajor === major && appMinor > minor) ||
        (appMajor === major && appMinor === minor && appPatch >= patch)
      );
    });
  }, [allItems, currentAppVersion]);

  const handleDismiss = useCallback(async () => {
    await AsyncStorage.setItem(storageKey, currentAppVersion);
    onDismiss();
  }, [currentAppVersion, onDismiss, storageKey]);

  useEffect(() => {
    if (visible && viewedVersion === currentAppVersion) {
      onDismiss();
    }
  }, [visible, viewedVersion, currentAppVersion, onDismiss]);

  const shouldShow = visible && viewedVersion !== currentAppVersion;

  if (!items.length || checkingStorage || !shouldShow) {
    return null;
  }

  return (
    <Modal visible={shouldShow} transparent animationType="slide" onRequestClose={handleDismiss}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={styles.header}>
          <View>
            <ThemedText style={styles.title}>✨ Hva er nytt</ThemedText>
            <ThemedText style={[styles.subtitle, { color: theme.textMuted }]}>
              {items.length} ny{items.length !== 1 ? "e" : ""} funksjon{items.length !== 1 ? "er" : ""}
            </ThemedText>
          </View>
          <Pressable onPress={handleDismiss}>
            <EvendiIcon name="x" size={24} color={theme.text} />
          </Pressable>
        </View>

        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          scrollEnabled
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.listContent}
          renderItem={({ item, index }) => (
            <View
              style={[
                styles.item,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                  marginBottom: index === items.length - 1 ? Spacing.lg : Spacing.md,
                },
              ]}
            >
              <View
                style={[
                  styles.itemIcon,
                  {
                    backgroundColor: theme.accent + "20",
                  },
                ]}
              >
                <EvendiIcon
                  name={isEvendiIcon(item.icon) ? item.icon : "star"}
                  size={24}
                  color={theme.accent}
                />
              </View>

              <View style={styles.itemContent}>
                <ThemedText style={styles.itemTitle}>{item.title}</ThemedText>
                <ThemedText
                  style={[
                    styles.itemDescription,
                    {
                      color: theme.textMuted,
                      marginTop: Spacing.xs,
                    },
                  ]}
                >
                  {item.description}
                </ThemedText>
              </View>

              {index === 0 && (
                <View
                  style={[
                    styles.newBadge,
                    {
                      backgroundColor: theme.accent,
                    },
                  ]}
                >
                  <ThemedText style={styles.newBadgeText}>NYT</ThemedText>
                </View>
              )}
            </View>
          )}
        />

        <View style={styles.footer}>
          <Pressable
            onPress={handleDismiss}
            style={[styles.button, { backgroundColor: theme.accent }]}
          >
            <ThemedText style={styles.buttonText}>Skjønner det</ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    marginTop: Spacing.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  item: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  itemIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  itemContent: {
    flex: 1,
    justifyContent: "center",
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  itemDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  newBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  button: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
