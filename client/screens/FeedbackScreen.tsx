import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
} from "react-native";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useHeaderHeight } from "@react-navigation/elements";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Colors, Spacing, BorderRadius, Typography } from "@/constants/theme";
import { useTheme } from "@/hooks/useTheme";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import type { AppSetting } from "../../shared/schema";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { showToast } from "@/lib/toast";

const CATEGORIES = [
  { id: "bug", label: "Feil/problem", icon: "alert-circle" as const },
  { id: "feature_request", label: "Forslag til ny funksjon", icon: "zap" as const },
  { id: "general", label: "Generell tilbakemelding", icon: "message-circle" as const },
  { id: "complaint", label: "Klage", icon: "frown" as const },
];

export default function FeedbackScreen() {
  const { theme } = useTheme();
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Fetch app settings to check for active status messages
  const { data: appSettings } = useQuery<AppSetting[]>({
    queryKey: ["app-settings"],
    queryFn: async () => {
      const res = await fetch(`${getApiUrl()}/api/app-settings`);
      if (!res.ok) throw new Error("Failed to fetch app settings");
      return res.json();
    },
  });

  const settingsByKey = useMemo(() => {
    return (
      appSettings?.reduce<Record<string, string>>((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {}) ?? {}
    );
  }, [appSettings]);

  const getSetting = (key: string, fallback = "") => settingsByKey[key] ?? fallback;
  const maintenanceMode = getSetting("maintenance_mode") === "true";
  const maintenanceMessage = getSetting("maintenance_message");
  const statusMessage = getSetting("status_message").trim();
  const statusType = getSetting("status_type", "info");
  const statusColor =
    maintenanceMode || statusType === "error"
      ? theme.error
      : statusType === "warning"
      ? "#FF8C00"
      : statusType === "success"
      ? "#51CF66"
      : theme.accent || Colors.dark.accent;
  const statusIcon: keyof typeof Feather.glyphMap =
    maintenanceMode
      ? "tool"
      : statusType === "warning"
      ? "alert-triangle"
      : statusType === "error"
      ? "alert-circle"
      : statusType === "success"
      ? "check-circle"
      : "info";
  const hasActiveStatus = maintenanceMode || statusMessage.length > 0;

  const submitMutation = useMutation({
    mutationFn: async (data: { category: string; subject: string; message: string }) => {
      return apiRequest("POST", "/api/couple/feedback", data);
    },
    onSuccess: () => {
      setSubmitted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error: any) => {
      showToast(error.message || "Kunne ikke sende tilbakemelding");
    },
  });

  const handleSubmit = () => {
    if (!category) {
      showToast("Velg hva tilbakemeldingen handler om");
      return;
    }
    if (!subject.trim()) {
      showToast("Skriv inn et kort emne");
      return;
    }
    if (!message.trim()) {
      showToast("Skriv inn din tilbakemelding");
      return;
    }

    submitMutation.mutate({ category, subject: subject.trim(), message: message.trim() });
  };

  if (submitted) {
    return (
      <KeyboardAwareScrollViewCompat
        style={styles.container}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl,
          paddingHorizontal: Spacing.lg,
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card style={styles.successCard}>
          <View style={[styles.successIcon, { backgroundColor: theme.success + "20" }]}>
            <Feather name="check-circle" size={48} color={theme.success} />
          </View>
          <ThemedText style={[Typography.h2, { textAlign: "center" }]}>Takk for tilbakemeldingen!</ThemedText>
          <ThemedText style={[Typography.body, { opacity: 0.7, textAlign: "center", marginTop: Spacing.sm }]}>
            Vi setter stor pris på at du tar deg tid til å hjelpe oss med å forbedre Evendi.
          </ThemedText>
          <Pressable
            style={[styles.secondaryButton, { borderColor: theme.border, marginTop: Spacing.lg }]}
            onPress={() => {
              setCategory("");
              setSubject("");
              setMessage("");
              setSubmitted(false);
            }}
          >
            <ThemedText style={Typography.body}>Send ny tilbakemelding</ThemedText>
          </Pressable>
        </Card>
      </KeyboardAwareScrollViewCompat>
    );
  }

  return (
    <KeyboardAwareScrollViewCompat
      style={styles.container}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: tabBarHeight + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      {hasActiveStatus && (
        <View style={[styles.statusNotice, { 
          backgroundColor: statusColor + "15",
          borderColor: statusColor,
        }]}>
          <Feather 
            name={statusIcon} 
            size={20} 
            color={statusColor} 
          />
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.statusNoticeTitle, { color: theme.text, fontWeight: "600" }]}>
              {maintenanceMode 
                ? "⚠️ Vedlikeholdsmodus"
                : "Systemmelding"}
            </ThemedText>
            <ThemedText style={[styles.statusNoticeText, { color: theme.text }]}>
              {maintenanceMode
                ? maintenanceMessage ||
                  "Evendi er for oyeblikket under vedlikehold. Noen funksjoner kan vaere utilgjengelige."
                : statusMessage}
            </ThemedText>
            <Pressable 
              onPress={() => navigation.navigate("Status")}
              style={{ marginTop: 8 }}
            >
              <ThemedText style={[styles.statusNoticeLink, { color: statusColor }]}>
                Se full status →
              </ThemedText>
            </Pressable>
          </View>
        </View>
      )}
      <ThemedText style={Typography.h2}>Gi tilbakemelding til Evendi</ThemedText>
      <ThemedText style={[Typography.small, { opacity: 0.7, marginBottom: Spacing.xl }]}>
        Din tilbakemelding hjelper oss å forbedre appen for alle brudepar.
      </ThemedText>

      <ThemedText style={styles.label}>Hva handler det om?</ThemedText>
      <View style={styles.categoriesGrid}>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat.id}
            style={[
              styles.categoryCard,
              { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
              category === cat.id && { borderColor: theme.accent, borderWidth: 2 },
            ]}
            onPress={() => {
              setCategory(cat.id);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <Feather
              name={cat.icon}
              size={24}
              color={category === cat.id ? theme.accent : theme.textSecondary}
            />
            <ThemedText
              style={[
                Typography.small,
                { textAlign: "center" },
                category === cat.id && { color: theme.accent },
              ]}
            >
              {cat.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Emne</ThemedText>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border },
          ]}
          value={subject}
          onChangeText={setSubject}
          placeholder="Kort beskrivelse av saken"
          placeholderTextColor={theme.textSecondary}
          maxLength={100}
        />
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={styles.label}>Din melding</ThemedText>
        <TextInput
          style={[
            styles.textArea,
            { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border },
          ]}
          value={message}
          onChangeText={setMessage}
          placeholder="Beskriv i detalj hva du opplever eller foreslår..."
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          maxLength={2000}
        />
        <ThemedText style={[Typography.caption, { opacity: 0.5, textAlign: "right", marginTop: Spacing.xs }]}>{message.length}/2000</ThemedText>
      </View>

      <Button
        onPress={handleSubmit}
        disabled={submitMutation.isPending}
        style={{ marginTop: Spacing.md }}
      >
        {submitMutation.isPending ? "Sender..." : "Send tilbakemelding"}
      </Button>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    ...Typography.small,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  categoryCard: {
    width: "48%",
    flexGrow: 1,
    flexBasis: "45%",
    alignItems: "center",
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Typography.body,
  },
  textArea: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    ...Typography.body,
    minHeight: 150,
  },
  successCard: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
    paddingHorizontal: Spacing.lg,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  secondaryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  statusNotice: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  statusNoticeTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  statusNoticeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  statusNoticeLink: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: Spacing.sm,
  },
});
