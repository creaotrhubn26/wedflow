import React, { useLayoutEffect, useMemo } from "react";
import { ScrollView, StyleSheet, View, Pressable, Linking, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EvendiIcon, EvendiIconGlyphMap } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import Constants from "expo-constants";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useQuery } from "@tanstack/react-query";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useEventType } from "@/hooks/useEventType";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import type { AppSetting } from "../../shared/schema";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";
import { getApiUrl } from "@/lib/query-client";
import { showToast } from "@/lib/toast";

type Theme = ReturnType<typeof useTheme>["theme"];

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, designSettings } = useTheme();
  const { isWedding } = useEventType();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

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
  const appName = getSetting("app_name", designSettings.appName ?? "Evendi");
  const appTagline = getSetting("app_tagline", designSettings.appTagline ?? (isWedding ? "Din bryllupsplanlegger" : "Din arrangementsplanlegger"));
  const appDescription = getSetting(
    "app_description",
    isWedding
      ? "Evendi er en komplett bryllupsplattform for par og leverandorer i Skandinavia. Planlegg gjestelister, bordplassering, budsjett, timeline og samarbeid med leverandorer i en felles oversikt."
      : "Evendi er en komplett arrangementsplattform for planleggere og leverandorer i Skandinavia. Planlegg gjestelister, bordplassering, budsjett, timeline og samarbeid med leverandorer i en felles oversikt."
  );
  const companyDescription = getSetting(
    "app_company_description",
    isWedding
      ? "Appen er laget av Norwedfilm, et team med erfaring fra bryllupsbransjen som forstar hva par trenger for en stressfri planleggingsprosess."
      : "Appen er laget av Norwedfilm, et team med erfaring fra eventbransjen som forstar hva arrangorer trenger for en stressfri planleggingsprosess."
  );
  const supportEmail = getSetting("support_email", "contact@norwedfilm.no");
  const supportPhone = getSetting("support_phone");
  const dialablePhone = supportPhone.replace(/[^\d+]/g, "");
  const websiteUrl = getSetting("app_website", "https://norwedfilm.no");
  const instagramUrl = getSetting("app_instagram_url", "https://instagram.com/norwedfilm");
  const instagramHandle = getSetting("app_instagram_handle", "@norwedfilm");
  const appVersionSetting = getSetting("app_version");
  const runtimeVersion = Constants.expoConfig?.runtimeVersion;
  const resolvedRuntimeVersion = typeof runtimeVersion === "string" ? runtimeVersion : "";
  const appVersion = appVersionSetting || Constants.expoConfig?.version || resolvedRuntimeVersion || "1.0.0";
  const accentColor = theme.accent || Colors.dark.accent;

  const hasActiveStatus = maintenanceMode || statusMessage.length > 0;

  const statusColor = useMemo(() => {
    if (maintenanceMode || statusType === "error") return theme.error;
    if (statusType === "warning") return "#FF8C00";
    if (statusType === "success") return "#51CF66";
    return accentColor;
  }, [maintenanceMode, statusType, theme.error, accentColor]);

  const statusIcon = useMemo(() => {
    if (maintenanceMode) return "tool";
    if (statusType === "warning") return "alert-triangle";
    if (statusType === "error") return "alert-circle";
    if (statusType === "success") return "check-circle";
    return "info";
  }, [maintenanceMode, statusType]);

  const logoSource = useMemo(() => {
    if (designSettings.logoUrl) {
      return { uri: designSettings.logoUrl };
    }
    return require("../../assets/images/Evendi_logo_norsk_tagline.png");
  }, [designSettings.logoUrl]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Image
          source={logoSource}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      ),
    });
  }, [navigation, logoSource]);

  const handleOpenLink = async (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        showToast("Enheten din kan ikke apne denne lenken.");
        return;
      }
      await Linking.openURL(url);
    } catch (error) {
      showToast("Kunne ikke apne lenken akkurat na.");
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      {hasActiveStatus && (
        <View
          style={[
            styles.statusNotice,
            {
              backgroundColor: statusColor + "15",
              borderColor: statusColor,
            },
          ]}
        >
          <EvendiIcon name={statusIcon as keyof typeof EvendiIconGlyphMap} size={20} color={statusColor} />
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.statusNoticeTitle, { color: theme.text, fontWeight: "600" }]}>
              {maintenanceMode ? "⚠️ Vedlikeholdsmodus" : "Systemmelding"}
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
              <ThemedText style={[styles.statusNoticeLink, { color: theme.accent }]}>
                Se full status →
              </ThemedText>
            </Pressable>
          </View>
        </View>
      )}
      <Animated.View entering={FadeInDown.duration(400)}>
        <View style={[styles.logoSection, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <Image source={logoSource} style={styles.logoImage} resizeMode="contain" />
          <ThemedText style={[styles.version, { color: theme.textMuted }]}>{appName}</ThemedText>
          <ThemedText style={[styles.tagline, { color: theme.textSecondary }]}>{appTagline}</ThemedText>
          <ThemedText style={[styles.version, { color: theme.textMuted }]}>
            Versjon {appVersion}
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.sectionTitle}>Om appen</ThemedText>
          <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
            {appDescription}
          </ThemedText>
          <ThemedText style={[styles.description, { color: theme.textSecondary, marginTop: Spacing.md }]}>
            {companyDescription}
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.sectionTitle}>Funksjoner</ThemedText>
          <View style={styles.featureList}>
            <FeatureItem icon="calendar" text="Dagsplan og tidslinjeplanlegging" theme={theme} />
            <FeatureItem icon="users" text="Gjesteliste og bordplassering" theme={theme} />
            <FeatureItem icon="dollar-sign" text="Budsjettoppfølging" theme={theme} />
            <FeatureItem icon="image" text="Showcase-galleri fra leverandører" theme={theme} />
            <FeatureItem icon="package" text="Leveranser fra fotografer og videografer" theme={theme} />
            <FeatureItem icon="message-circle" text="Meldinger med leverandører" theme={theme} />
            <FeatureItem icon="file-text" text="Pristilbud og tilbudsbehandling" theme={theme} />
            <FeatureItem icon="shopping-bag" text="Leverandørmarkedsplass" theme={theme} />
            <FeatureItem icon="cloud" text={isWedding ? "Værvarsel for bryllupsdagen" : "Værvarsel for arrangementsdagen"} theme={theme} />
            <FeatureItem icon="bell" text="Påminnelser og varsler" theme={theme} />
            <FeatureItem icon="shield" text="GDPR-kompatibel datahåndtering" theme={theme} />
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.sectionTitle}>Kontakt oss</ThemedText>
          
          <Pressable
            onPress={() => handleOpenLink(`mailto:${supportEmail}`)}
            style={[styles.contactRow, { borderColor: theme.border }]}
          >
            <View style={[styles.contactIcon, { backgroundColor: theme.backgroundSecondary }]}>
              <EvendiIcon name="mail" size={18} color={accentColor} />
            </View>
            <View style={styles.contactInfo}>
              <ThemedText style={styles.contactLabel}>E-post</ThemedText>
              <ThemedText style={[styles.contactValue, { color: accentColor }]}>{supportEmail}</ThemedText>
            </View>
            <EvendiIcon name="chevron-right" size={18} color={theme.textMuted} />
          </Pressable>

          {supportPhone.length > 0 && dialablePhone.length > 0 && (
            <Pressable
              onPress={() => handleOpenLink(`tel:${dialablePhone}`)}
              style={[styles.contactRow, { borderColor: theme.border }]}
            >
              <View style={[styles.contactIcon, { backgroundColor: theme.backgroundSecondary }]}>
                <EvendiIcon name="phone" size={18} color={accentColor} />
              </View>
              <View style={styles.contactInfo}>
                <ThemedText style={styles.contactLabel}>Telefon</ThemedText>
                <ThemedText style={[styles.contactValue, { color: accentColor }]}>{supportPhone}</ThemedText>
              </View>
              <EvendiIcon name="chevron-right" size={18} color={theme.textMuted} />
            </Pressable>
          )}

          <Pressable
            onPress={() => handleOpenLink(websiteUrl)}
            style={[styles.contactRow, { borderColor: theme.border }]}
          >
            <View style={[styles.contactIcon, { backgroundColor: theme.backgroundSecondary }]}>
              <EvendiIcon name="globe" size={18} color={accentColor} />
            </View>
            <View style={styles.contactInfo}>
              <ThemedText style={styles.contactLabel}>Nettside</ThemedText>
              <ThemedText style={[styles.contactValue, { color: accentColor }]}>
                {websiteUrl.replace(/^https?:\/\//, "")}
              </ThemedText>
            </View>
            <EvendiIcon name="chevron-right" size={18} color={theme.textMuted} />
          </Pressable>

          <Pressable
            onPress={() => handleOpenLink(instagramUrl)}
            style={[styles.contactRow, { borderColor: theme.border }]}
          >
            <View style={[styles.contactIcon, { backgroundColor: theme.backgroundSecondary }]}>
              <EvendiIcon name="instagram" size={18} color={accentColor} />
            </View>
            <View style={styles.contactInfo}>
              <ThemedText style={styles.contactLabel}>Instagram</ThemedText>
              <ThemedText style={[styles.contactValue, { color: accentColor }]}>{instagramHandle}</ThemedText>
            </View>
            <EvendiIcon name="chevron-right" size={18} color={theme.textMuted} />
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <ThemedText style={[styles.copyright, { color: theme.textMuted }]}>
          2026 Norwedfilm. Alle rettigheter reservert.
        </ThemedText>
      </Animated.View>
    </ScrollView>
  );
}

function FeatureItem({ icon, text, theme }: { icon: keyof typeof EvendiIconGlyphMap; text: string; theme: Theme }) {
  return (
    <View style={styles.featureItem}>
      <EvendiIcon name={icon} size={16} color={theme.accent || Colors.dark.accent} />
      <ThemedText style={[styles.featureText, { color: theme.textSecondary }]}>{text}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerLogo: {
    width: 300,
    height: 80,
  },
  logoSection: {
    alignItems: "center",
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  logoImage: {
    width: 320,
    height: 160,
    marginBottom: Spacing.md,
  },
  version: {
    fontSize: 14,
    marginTop: Spacing.sm,
  },
  tagline: {
    fontSize: 14,
    marginTop: 2,
    textAlign: "center",
  },
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
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  featureList: {
    gap: Spacing.sm,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: 15,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  contactInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  contactLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  contactValue: {
    fontSize: 14,
    marginTop: 2,
  },
  copyright: {
    fontSize: 13,
    textAlign: "center",
    marginTop: Spacing.md,
  },
  statusNotice: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    alignItems: "flex-start",
  },
  statusNoticeTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  statusNoticeText: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.9,
  },
  statusNoticeLink: {
    fontSize: 13,
    fontWeight: "600",
  },
});
