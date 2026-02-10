import React, { useState } from "react";
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
import { useQuery } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useEventType } from "@/hooks/useEventType";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

interface Statistics {
  vendors: { total: number; approved: number; pending: number };
  couples: number;
  inspirations: { total: number; pending: number };
  conversations: number;
  messages: number;
  deliveries: number;
  offers: number;
}

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { isWedding } = useEventType();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [adminKey, setAdminKey] = useState("");
  const [storedKey, setStoredKey] = useState("");
  const [loginError, setLoginError] = useState("");

  const { data: stats, isLoading } = useQuery<Statistics>({
    queryKey: ["/api/admin/statistics", storedKey],
    queryFn: async () => {
      const url = new URL("/api/admin/statistics", getApiUrl());
      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${storedKey}` },
      });
      if (!response.ok) throw new Error("Kunne ikke hente statistikk");
      return response.json();
    },
    enabled: storedKey.length > 0,
  });

  const isAuthenticated = storedKey.length > 0;

  const handleLogin = async () => {
    setLoginError("");
    try {
      const url = new URL("/api/admin/statistics", getApiUrl());
      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${adminKey}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setLoginError("Ugyldig admin-nøkkel");
          return;
        }
        if (response.status === 503) {
          setLoginError("Admin-funksjonalitet er ikke konfigurert");
          return;
        }
        setLoginError("Kunne ikke koble til serveren");
        return;
      }

      setStoredKey(adminKey);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      setLoginError("Nettverksfeil. Prøv igjen.");
    }
  };

  const adminSections = [
    {
      title: "Leverandører",
      icon: "users" as const,
      description: "Godkjenn, avvis og administrer leverandører",
      screen: "AdminVendors" as const,
      badge: stats?.vendors.pending || 0,
    },
    {
      title: "Support-meldinger",
      icon: "message-circle" as const,
      description: "Svar på Evendi Support-meldinger fra leverandører",
      screen: "AdminVendorChats" as const,
    },
    {
      title: "Showcases",
      icon: "image" as const,
      description: "Moderer showcase-galleri",
      screen: "AdminInspirations" as const,
      badge: stats?.inspirations.pending || 0,
    },
    {
      title: "Sjekklister",
      icon: "clipboard" as const,
      description: "Vis og administrer parenes sjekklister",
      screen: "AdminChecklists" as const,
    },
    {
      title: "Kategorier",
      icon: "tag" as const,
      description: "Administrer kategorier",
      screen: "AdminCategories" as const,
    },
    {
      title: "FAQ & Hjelp",
      icon: "help-circle" as const,
      description: "Rediger FAQ for par og leverandører",
      screen: "AdminFAQ" as const,
    },
    {
      title: "App-innstillinger",
      icon: "smartphone" as const,
      description: "Versjon og globale innstillinger",
      screen: "AdminAppSettings" as const,
    },
    {
      title: "Hva er nytt",
      icon: "star" as const,
      description: "Publiser oppdateringer og nye funksjoner",
      screen: "AdminWhatsNew" as const,
    },
    {
      title: "Videoguider",
      icon: "video" as const,
      description: "Administrer videoguider for leverandører",
      screen: "AdminVideoGuides" as const,
    },
    {
      title: "Abonnement & Pakker",
      icon: "package" as const,
      description: "Administrer abonnementstier og priser",
      screen: "AdminSubscriptions" as const,
    },
    {
      title: "Preview-modus",
      icon: "eye" as const,
      description: isWedding ? "Se appen fra brudepar og leverandør-perspektivet" : "Se appen fra kunde- og leverandør-perspektivet",
      screen: "AdminPreview" as const,
    },
    {
      title: "Design",
      icon: "layout" as const,
      description: "Tilpass farger, logo og utseende",
      screen: "AdminDesign" as const,
    },
    {
      title: "Innstillinger",
      icon: "settings" as const,
      description: "Generelle appinnstillinger",
      screen: "AdminSettings" as const,
    },
  ];

  if (!isAuthenticated) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
      >
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={[styles.loginCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <View style={[styles.iconCircle, { backgroundColor: Colors.dark.accent + "20" }]}>
              <Feather name="shield" size={32} color={Colors.dark.accent} />
            </View>
            <ThemedText style={styles.loginTitle}>Admin-tilgang</ThemedText>
            <ThemedText style={[styles.loginSubtitle, { color: theme.textSecondary }]}>
              Skriv inn admin-nøkkelen for å få tilgang
            </ThemedText>

            <TextInput
              style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }]}
              placeholder="Admin-nøkkel"
              placeholderTextColor={theme.textMuted}
              value={adminKey}
              onChangeText={setAdminKey}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />

            {loginError ? (
              <ThemedText style={styles.errorText}>{loginError}</ThemedText>
            ) : null}

            <Pressable
              style={[styles.loginButton, { backgroundColor: Colors.dark.accent }]}
              onPress={handleLogin}
            >
              <ThemedText style={styles.loginButtonText}>Logg inn</ThemedText>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
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
        <View style={[styles.statsGrid, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.sectionTitle}>Oversikt</ThemedText>
          {isLoading ? (
            <ActivityIndicator color={Colors.dark.accent} />
          ) : (
            <View style={styles.statsRow}>
              <StatBox label="Par" value={stats?.couples || 0} icon="heart" theme={theme} />
              <StatBox label="Leverandører" value={stats?.vendors.approved || 0} icon="briefcase" theme={theme} />
              <StatBox label="Showcases" value={stats?.inspirations.total || 0} icon="image" theme={theme} />
              <StatBox label="Meldinger" value={stats?.messages || 0} icon="message-circle" theme={theme} />
            </View>
          )}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <ThemedText style={[styles.menuTitle, { marginTop: Spacing.lg }]}>Administrasjon</ThemedText>
        
        {adminSections.map((section, index) => (
          <Pressable
            key={section.screen}
            style={[styles.menuItem, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // @ts-ignore - dynamic navigation
              navigation.navigate(section.screen, { adminKey: storedKey });
            }}
          >
            <View style={[styles.menuIcon, { backgroundColor: Colors.dark.accent + "20" }]}>
              <Feather name={section.icon} size={20} color={Colors.dark.accent} />
            </View>
            <View style={styles.menuContent}>
              <ThemedText style={styles.menuItemTitle}>{section.title}</ThemedText>
              <ThemedText style={[styles.menuItemDesc, { color: theme.textSecondary }]}>
                {section.description}
              </ThemedText>
            </View>
            {section.badge && section.badge > 0 ? (
              <View style={[styles.badge, { backgroundColor: Colors.dark.accent }]}>
                <ThemedText style={styles.badgeText}>{section.badge}</ThemedText>
              </View>
            ) : null}
            <Feather name="chevron-right" size={20} color={theme.textMuted} />
          </Pressable>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <Pressable
          style={[styles.logoutButton, { borderColor: theme.border }]}
          onPress={() => {
            setStoredKey("");
            setAdminKey("");
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
        >
          <Feather name="log-out" size={18} color={theme.textSecondary} />
          <ThemedText style={[styles.logoutText, { color: theme.textSecondary }]}>Logg ut</ThemedText>
        </Pressable>
      </Animated.View>
    </ScrollView>
  );
}

function StatBox({ label, value, icon, theme }: { label: string; value: number; icon: keyof typeof Feather.glyphMap; theme: any }) {
  return (
    <View style={styles.statBox}>
      <Feather name={icon} size={16} color={Colors.dark.accent} />
      <ThemedText style={styles.statValue}>{value}</ThemedText>
      <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loginCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: "center",
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  loginTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  loginSubtitle: {
    fontSize: 14,
    marginBottom: Spacing.lg,
    textAlign: "center",
  },
  input: {
    width: "100%",
    height: 48,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 14,
    marginBottom: Spacing.md,
  },
  loginButton: {
    width: "100%",
    height: 48,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  loginButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "600",
  },
  statsGrid: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  menuContent: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  menuItemDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: Spacing.sm,
  },
  badgeText: {
    color: "#000",
    fontSize: 12,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    marginTop: Spacing.lg,
    borderTopWidth: 1,
    gap: Spacing.sm,
  },
  logoutText: {
    fontSize: 15,
  },
});
