import React from "react";
import { StyleSheet, View, Pressable } from "react-native";
import { EvendiIcon } from "@/components/EvendiIcon";
import { useNavigation } from "@react-navigation/native";
import * as Haptics from "expo-haptics";

import { ThemedText } from "./ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showClose?: boolean;
}

export function AdminHeader({ title, subtitle, onBack, showClose = true }: AdminHeaderProps) {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onBack) {
      onBack();
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={[styles.header, { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.backButton,
              { backgroundColor: pressed ? theme.backgroundSecondary : "transparent" },
            ]}
          >
            <EvendiIcon name="arrow-left" size={24} color={theme.text} />
          </Pressable>
          <View style={styles.titleContainer}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            {subtitle && (
              <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
                {subtitle}
              </ThemedText>
            )}
          </View>
        </View>
        {showClose && (
          <Pressable
            onPress={handleBack}
            style={({ pressed }) => [
              styles.closeButton,
              { 
                backgroundColor: pressed ? theme.backgroundSecondary : "transparent",
                borderColor: theme.border
              },
            ]}
          >
            <EvendiIcon name="x" size={20} color={theme.textSecondary} />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 2,
  },
});
