import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRoute } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

interface AppSetting {
  id: string;
  key: string;
  value: string;
  category: string;
}

const COLOR_PRESETS = [
  { name: "Antikk Gull", primary: "#C9A962", secondary: "#1A1A1A" },
  { name: "Rose Gull", primary: "#E8B4B8", secondary: "#1A1A1A" },
  { name: "Sølv", primary: "#C0C0C0", secondary: "#1A1A1A" },
  { name: "Dusty Blue", primary: "#7BA3BC", secondary: "#1A1A1A" },
  { name: "Sage Grønn", primary: "#9CAF88", secondary: "#1A1A1A" },
  { name: "Burgundy", primary: "#800020", secondary: "#1A1A1A" },
  { name: "Blush Pink", primary: "#DE98AB", secondary: "#1A1A1A" },
  { name: "Navy", primary: "#1E3A5F", secondary: "#F5F5F5" },
];

export default function AdminDesignScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const route = useRoute();
  const adminKey = (route.params as any)?.adminKey || "";

  const [primaryColor, setPrimaryColor] = useState("#C9A962");
  const [backgroundColor, setBackgroundColor] = useState("#1A1A1A");
  const [appName, setAppName] = useState("Wedflow");
  const [tagline, setTagline] = useState("Din bryllupsplanlegger");
  const [logoUrl, setLogoUrl] = useState("");

  const { data: settings, isLoading } = useQuery<AppSetting[]>({
    queryKey: ["/api/admin/settings", adminKey],
    queryFn: async () => {
      const url = new URL("/api/admin/settings", getApiUrl());
      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${adminKey}` },
      });
      if (!response.ok) throw new Error("Kunne ikke hente innstillinger");
      return response.json();
    },
    enabled: adminKey.length > 0,
  });

  useEffect(() => {
    if (settings) {
      const getSetting = (key: string, defaultValue: string) => {
        const setting = settings.find(s => s.key === key);
        return setting?.value || defaultValue;
      };
      setPrimaryColor(getSetting("design_primary_color", "#C9A962"));
      setBackgroundColor(getSetting("design_background_color", "#1A1A1A"));
      setAppName(getSetting("app_name", "Wedflow"));
      setTagline(getSetting("app_tagline", "Din bryllupsplanlegger"));
      setLogoUrl(getSetting("app_logo_url", ""));
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = new URL("/api/admin/settings", getApiUrl());
      const response = await fetch(url.toString(), {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${adminKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: [
            { key: "design_primary_color", value: primaryColor, category: "design" },
            { key: "design_background_color", value: backgroundColor, category: "design" },
            { key: "app_name", value: appName, category: "branding" },
            { key: "app_tagline", value: tagline, category: "branding" },
            { key: "app_logo_url", value: logoUrl, category: "branding" },
          ],
        }),
      });
      if (!response.ok) throw new Error("Kunne ikke lagre");
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      Alert.alert("Lagret", "Designinnstillinger er oppdatert");
    },
    onError: () => {
      Alert.alert("Feil", "Kunne ikke lagre innstillinger");
    },
  });

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={Colors.dark.accent} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <Animated.View entering={FadeInDown.duration(400)}>
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.sectionTitle}>Fargeskjema</ThemedText>
          
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Forhåndsinnstillinger</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetRow}>
            {COLOR_PRESETS.map((preset) => (
              <Pressable
                key={preset.name}
                style={[
                  styles.presetButton,
                  primaryColor === preset.primary && styles.presetSelected,
                  { borderColor: primaryColor === preset.primary ? preset.primary : theme.border }
                ]}
                onPress={() => {
                  setPrimaryColor(preset.primary);
                  setBackgroundColor(preset.secondary);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View style={[styles.presetColorDot, { backgroundColor: preset.primary }]} />
                <ThemedText style={styles.presetName}>{preset.name}</ThemedText>
              </Pressable>
            ))}
          </ScrollView>

          <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.lg }]}>
            Primærfarge (HEX)
          </ThemedText>
          <View style={styles.colorInputRow}>
            <View style={[styles.colorPreview, { backgroundColor: primaryColor }]} />
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border, flex: 1 }]}
              value={primaryColor}
              onChangeText={setPrimaryColor}
              placeholder="#C9A962"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="characters"
            />
          </View>

          <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.md }]}>
            Bakgrunnsfarge (HEX)
          </ThemedText>
          <View style={styles.colorInputRow}>
            <View style={[styles.colorPreview, { backgroundColor: backgroundColor }]} />
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border, flex: 1 }]}
              value={backgroundColor}
              onChangeText={setBackgroundColor}
              placeholder="#1A1A1A"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="characters"
            />
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.sectionTitle}>Branding</ThemedText>
          
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Appnavn</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
            value={appName}
            onChangeText={setAppName}
            placeholder="Wedflow"
            placeholderTextColor={theme.textMuted}
          />

          <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.md }]}>Tagline</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
            value={tagline}
            onChangeText={setTagline}
            placeholder="Din bryllupsplanlegger"
            placeholderTextColor={theme.textMuted}
          />

          <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.md }]}>Logo URL</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
            value={logoUrl}
            onChangeText={setLogoUrl}
            placeholder="https://..."
            placeholderTextColor={theme.textMuted}
            autoCapitalize="none"
            keyboardType="url"
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <View style={[styles.previewSection, { backgroundColor: backgroundColor, borderColor: theme.border }]}>
          <ThemedText style={[styles.previewTitle, { color: primaryColor }]}>
            Forhåndsvisning
          </ThemedText>
          <View style={styles.previewContent}>
            <View style={[styles.previewButton, { backgroundColor: primaryColor }]}>
              <ThemedText style={[styles.previewButtonText, { color: backgroundColor }]}>
                Eksempel-knapp
              </ThemedText>
            </View>
            <View style={[styles.previewCard, { backgroundColor: backgroundColor === "#1A1A1A" ? "#2A2A2A" : "#FFFFFF", borderColor: primaryColor }]}>
              <Feather name="heart" size={24} color={primaryColor} />
              <ThemedText style={[styles.previewCardText, { color: backgroundColor === "#1A1A1A" ? "#FFFFFF" : "#1A1A1A" }]}>
                {appName}
              </ThemedText>
            </View>
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <Pressable
          style={[styles.saveButton, { backgroundColor: Colors.dark.accent }]}
          onPress={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Feather name="save" size={18} color="#000" />
              <ThemedText style={styles.saveButtonText}>Lagre endringer</ThemedText>
            </>
          )}
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  section: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  colorInputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  colorPreview: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
  },
  presetRow: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  presetButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginRight: Spacing.sm,
    gap: Spacing.xs,
  },
  presetSelected: {
    borderWidth: 2,
  },
  presetColorDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  presetName: {
    fontSize: 13,
  },
  previewSection: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  previewContent: {
    alignItems: "center",
    gap: Spacing.md,
  },
  previewButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  previewButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  previewCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  previewCardText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    flexDirection: "row",
    height: 52,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
  },
  saveButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
});
