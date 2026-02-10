import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Switch,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import * as ImagePicker from 'expo-image-picker';
import Animated, { FadeInDown } from "react-native-reanimated";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { AdminHeader } from "@/components/AdminHeader";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { showToast } from "@/lib/toast";

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

const THEME_PRESETS = [
  { name: "Klassisk Bryllup", primary: "#C9A962", bg: "#FFFFFF", accent: "#1A1A1A" },
  { name: "Romantisk", primary: "#DE98AB", bg: "#FFF5F7", accent: "#8B4F5C" },
  { name: "Moderne Minimalist", primary: "#1A1A1A", bg: "#FFFFFF", accent: "#666666" },
  { name: "Boho Chic", primary: "#9CAF88", bg: "#F5F3EF", accent: "#5C6B4F" },
  { name: "Elegant Mørk", primary: "#C9A962", bg: "#1A1A1A", accent: "#FFFFFF" },
];

const FONT_OPTIONS = [
  "System",
  "Playfair Display",
  "Montserrat",
  "Lora",
  "Raleway",
];

const LAYOUT_OPTIONS = [
  { label: "Kompakt", value: "compact", description: "Mindre mellomrom mellom elementer" },
  { label: "Standard", value: "standard", description: "Normal mellomrom" },
  { label: "Romslig", value: "spacious", description: "Mer mellomrom for luftighet" },
];

export default function AdminDesignScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const route = useRoute<RouteProp<RootStackParamList, "AdminDesign">>();
  const adminKey = route.params?.adminKey || "";

  const [primaryColor, setPrimaryColor] = useState("#1E6BFF");
  const [backgroundColor, setBackgroundColor] = useState("#0F1F3A");
  const [appName, setAppName] = useState("Evendi");
  const [tagline, setTagline] = useState("Din bryllupsplanlegger");
  const [logoUrl, setLogoUrl] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [fontFamily, setFontFamily] = useState("System");
  const [fontSize, setFontSize] = useState("16");
  const [layoutDensity, setLayoutDensity] = useState("standard");
  const [buttonRadius, setButtonRadius] = useState("8");
  const [cardRadius, setCardRadius] = useState("12");
  const [borderWidth, setBorderWidth] = useState("1");

  const numericFontSize = Number.parseInt(fontSize, 10);
  const safeFontSize = Number.isFinite(numericFontSize) ? numericFontSize : 16;
  const numericButtonRadius = Number.parseInt(buttonRadius, 10);
  const safeButtonRadius = Number.isFinite(numericButtonRadius) ? numericButtonRadius : 8;
  const numericCardRadius = Number.parseInt(cardRadius, 10);
  const safeCardRadius = Number.isFinite(numericCardRadius) ? numericCardRadius : 12;
  const numericBorderWidth = Number.parseInt(borderWidth, 10);
  const safeBorderWidth = Number.isFinite(numericBorderWidth) ? numericBorderWidth : 1;
  const densityScale = layoutDensity === "compact" ? 0.85 : layoutDensity === "spacious" ? 1.2 : 1;
  const previewFontFamily = fontFamily === "System" ? undefined : fontFamily;

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
      setPrimaryColor(getSetting("design_primary_color", "#1E6BFF"));
      setBackgroundColor(getSetting("design_background_color", "#0F1F3A"));
      setAppName(getSetting("app_name", "Evendi"));
      setTagline(getSetting("app_tagline", "Din bryllupsplanlegger"));
      setLogoUrl(getSetting("app_logo_url", ""));
      setDarkMode(getSetting("design_dark_mode", "true") === "true");
      setFontFamily(getSetting("design_font_family", "System"));
      setFontSize(getSetting("design_font_size", "16"));
      setLayoutDensity(getSetting("design_layout_density", "standard"));
      setButtonRadius(getSetting("design_button_radius", "8"));
      setCardRadius(getSetting("design_card_radius", "12"));
      setBorderWidth(getSetting("design_border_width", "1"));
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const url = new URL("/api/admin/settings", getApiUrl());
      console.log("Saving design settings to:", url.toString());
      console.log("Admin key:", adminKey);
      
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
            { key: "design_dark_mode", value: darkMode.toString(), category: "design" },
            { key: "design_font_family", value: fontFamily, category: "design" },
            { key: "design_font_size", value: fontSize, category: "design" },
            { key: "design_layout_density", value: layoutDensity, category: "design" },
            { key: "design_button_radius", value: buttonRadius, category: "design" },
            { key: "design_card_radius", value: cardRadius, category: "design" },
            { key: "design_border_width", value: borderWidth, category: "design" },
          ],
        }),
      });
      
      console.log("Response status:", response.status);
      if (!response.ok) {
        const error = await response.text();
        console.error("Save error:", error);
        throw new Error("Kunne ikke lagre");
      }
      return response.json();
    },
    onSuccess: () => {
      console.log("Save successful!");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      queryClient.invalidateQueries({ queryKey: ["design-settings"] });
      showToast("Designinnstillinger er oppdatert");
    },
    onError: (error) => {
      console.error("Save failed:", error);
      showToast("Kunne ikke lagre innstillinger");
    },
  });

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      showToast("Du må gi tilgang til bildebiblioteket");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      // In production, upload to cloud storage and get URL
      setLogoUrl(result.assets[0].uri);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const applyThemePreset = (preset: typeof THEME_PRESETS[0]) => {
    setPrimaryColor(preset.primary);
    setBackgroundColor(preset.bg);
    setDarkMode(preset.bg === "#1A1A1A");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot, justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color={Colors.dark.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
      <AdminHeader 
        title="Design" 
        subtitle="Tilpass farger, logo og utseende"
      />
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
            placeholder="Evendi"
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
          <View style={styles.colorInputRow}>
            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border, flex: 1 }]}
              value={logoUrl}
              onChangeText={setLogoUrl}
              placeholder="https://..."
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              keyboardType="url"
            />
            <Pressable
              onPress={pickImage}
              style={[styles.pickButton, { backgroundColor: theme.accent, borderColor: theme.border }]}
            >
              <Feather name="upload" size={18} color="#000" />
            </Pressable>
          </View>
          {logoUrl ? (
            <Image
              source={{ uri: logoUrl }}
              style={styles.logoPreview}
              resizeMode="contain"
            />
          ) : null}
        </View>
      </Animated.View>

      {/* Tema Presets */}
      <Animated.View entering={FadeInDown.delay(150).duration(400)}>
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.sectionTitle}>🎨 Tema Presets</ThemedText>
          <ThemedText style={[styles.label, { color: theme.textMuted, marginBottom: Spacing.md }]}>
            Velg et ferdiglaget fargetema
          </ThemedText>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -Spacing.lg }}>
            <View style={{ paddingHorizontal: Spacing.lg, flexDirection: 'row', gap: Spacing.md }}>
              {THEME_PRESETS.map((preset) => (
                <Pressable
                  key={preset.name}
                  onPress={() => applyThemePreset(preset)}
                  style={[
                    styles.presetCard,
                    { 
                      borderColor: primaryColor === preset.primary ? theme.accent : theme.border,
                      borderWidth: primaryColor === preset.primary ? 2 : 1,
                      backgroundColor: theme.backgroundSecondary,
                    }
                  ]}
                >
                  <View style={styles.presetColors}>
                    <View style={[styles.presetColorBox, { backgroundColor: preset.primary }]} />
                    <View style={[styles.presetColorBox, { backgroundColor: preset.bg }]} />
                    <View style={[styles.presetColorBox, { backgroundColor: preset.accent }]} />
                  </View>
                  <ThemedText style={{ fontSize: 12, marginTop: Spacing.sm, textAlign: 'center' }}>
                    {preset.name}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </View>
      </Animated.View>

      {/* Typografi */}
      <Animated.View entering={FadeInDown.delay(175).duration(400)}>
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.sectionTitle}>🔤 Typografi</ThemedText>
          
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Font-familie</ThemedText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -Spacing.lg, marginBottom: Spacing.md }}>
            <View style={{ paddingHorizontal: Spacing.lg, flexDirection: 'row', gap: Spacing.sm }}>
              {FONT_OPTIONS.map((font) => (
                <Pressable
                  key={font}
                  onPress={() => {
                    setFontFamily(font);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.fontOption,
                    {
                      backgroundColor: fontFamily === font ? theme.accent : theme.backgroundSecondary,
                      borderColor: theme.border,
                    }
                  ]}
                >
                  <ThemedText style={{ color: fontFamily === font ? '#000' : theme.text, fontSize: 13 }}>
                    {font}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </ScrollView>

          <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.md }]}>
            Basis skriftstørrelse
          </ThemedText>
          <View style={styles.colorInputRow}>
            <TextInput
              value={fontSize}
              onChangeText={setFontSize}
              keyboardType="numeric"
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border, flex: 1 }]}
              placeholder="16"
              placeholderTextColor={theme.textMuted}
            />
            <ThemedText style={{ color: theme.textMuted, marginLeft: Spacing.sm }}>px</ThemedText>
          </View>
        </View>
      </Animated.View>

      {/* Layout */}
      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.sectionTitle}>📐 Layout</ThemedText>
          
          <ThemedText style={[styles.label, { color: theme.textSecondary, marginBottom: Spacing.md }]}>
            Layout-tetthet
          </ThemedText>
          {LAYOUT_OPTIONS.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => {
                setLayoutDensity(option.value);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.layoutOption,
                {
                  backgroundColor: layoutDensity === option.value ? theme.accent + '20' : theme.backgroundSecondary,
                  borderColor: layoutDensity === option.value ? theme.accent : theme.border,
                  marginBottom: Spacing.sm,
                }
              ]}
            >
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontWeight: '600', marginBottom: 2 }}>{option.label}</ThemedText>
                <ThemedText style={{ fontSize: 12, color: theme.textMuted }}>{option.description}</ThemedText>
              </View>
              {layoutDensity === option.value && (
                <Feather name="check" size={20} color={theme.accent} />
              )}
            </Pressable>
          ))}
        </View>
      </Animated.View>

      {/* Komponent-styling */}
      <Animated.View entering={FadeInDown.delay(225).duration(400)}>
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.sectionTitle}>🎯 Komponent-styling</ThemedText>
          
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Button-radius</ThemedText>
          <View style={styles.colorInputRow}>
            <TextInput
              value={buttonRadius}
              onChangeText={setButtonRadius}
              keyboardType="numeric"
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border, flex: 1 }]}
              placeholder="8"
              placeholderTextColor={theme.textMuted}
            />
            <ThemedText style={{ color: theme.textMuted, marginLeft: Spacing.sm }}>px</ThemedText>
          </View>

          <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.md }]}>Card-radius</ThemedText>
          <View style={styles.colorInputRow}>
            <TextInput
              value={cardRadius}
              onChangeText={setCardRadius}
              keyboardType="numeric"
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border, flex: 1 }]}
              placeholder="12"
              placeholderTextColor={theme.textMuted}
            />
            <ThemedText style={{ color: theme.textMuted, marginLeft: Spacing.sm }}>px</ThemedText>
          </View>

          <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.md }]}>Border-bredde</ThemedText>
          <View style={styles.colorInputRow}>
            <TextInput
              value={borderWidth}
              onChangeText={setBorderWidth}
              keyboardType="numeric"
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border, flex: 1 }]}
              placeholder="1"
              placeholderTextColor={theme.textMuted}
            />
            <ThemedText style={{ color: theme.textMuted, marginLeft: Spacing.sm }}>px</ThemedText>
          </View>
        </View>
      </Animated.View>

      {/* Dark Mode */}
      <Animated.View entering={FadeInDown.delay(250).duration(400)}>
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.sectionTitle}>🌙 Visningsvalg</ThemedText>
          
          <View style={styles.switchRow}>
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontWeight: '600', marginBottom: 2 }}>Mørk modus</ThemedText>
              <ThemedText style={{ fontSize: 12, color: theme.textMuted }}>
                Aktiver mørkt tema som standard
              </ThemedText>
            </View>
            <Switch
              value={darkMode}
              onValueChange={(value) => {
                setDarkMode(value);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              trackColor={{ false: theme.border, true: theme.accent }}
              thumbColor="#fff"
            />
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(275).duration(400)}>
        <View style={[styles.previewSection, { backgroundColor: backgroundColor, borderColor: theme.border }]}>
          <ThemedText style={[styles.previewTitle, { color: primaryColor, fontFamily: previewFontFamily }]}>
            Forhåndsvisning
          </ThemedText>
          <View style={[styles.previewContent, { gap: Spacing.md * densityScale }]}>
            <View
              style={[
                styles.previewButton,
                {
                  backgroundColor: primaryColor,
                  borderRadius: safeButtonRadius,
                  paddingHorizontal: Spacing.xl * densityScale,
                  paddingVertical: Spacing.md * densityScale,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.previewButtonText,
                  {
                    color: backgroundColor,
                    fontSize: safeFontSize,
                    fontFamily: previewFontFamily,
                  },
                ]}
              >
                Eksempel-knapp
              </ThemedText>
            </View>
            <View
              style={[
                styles.previewCard,
                {
                  backgroundColor: backgroundColor === "#1A1A1A" ? "#2A2A2A" : "#FFFFFF",
                  borderColor: primaryColor,
                  borderRadius: safeCardRadius,
                  borderWidth: safeBorderWidth,
                  padding: Spacing.md * densityScale,
                  gap: Spacing.sm * densityScale,
                },
              ]}
            >
              <Feather name="heart" size={24} color={primaryColor} />
              <ThemedText
                style={[
                  styles.previewCardText,
                  {
                    color: backgroundColor === "#1A1A1A" ? "#FFFFFF" : "#1A1A1A",
                    fontSize: safeFontSize,
                    fontFamily: previewFontFamily,
                  },
                ]}
              >
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
    </View>
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
  pickButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoPreview: {
    width: "100%",
    height: 120,
    marginTop: Spacing.md,
    borderRadius: BorderRadius.sm,
    backgroundColor: "#f0f0f0",
  },
  presetCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    width: 120,
  },
  presetColors: {
    flexDirection: "row",
    gap: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  presetColorBox: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.xs,
  },
  fontOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  layoutOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
  },
});
