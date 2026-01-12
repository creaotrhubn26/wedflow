import React, { useLayoutEffect } from "react";
import { ScrollView, StyleSheet, View, Pressable, Linking, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

export default function AboutScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Image
          source={require("../../assets/images/wedflow-logo.png")}
          style={styles.headerLogo}
          resizeMode="contain"
        />
      ),
    });
  }, [navigation]);

  const handleOpenLink = (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(url);
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
      <Animated.View entering={FadeInDown.duration(400)}>
        <View style={[styles.logoSection, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={[styles.logoCircle, { backgroundColor: Colors.dark.accent + "20" }]}>
            <Feather name="heart" size={40} color={Colors.dark.accent} />
          </View>
          <ThemedText style={styles.appName}>Wedflow</ThemedText>
          <ThemedText style={[styles.tagline, { color: theme.textSecondary }]}>
            by Norwedfilm
          </ThemedText>
          <ThemedText style={[styles.version, { color: theme.textMuted }]}>
            Versjon 1.0.0
          </ThemedText>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.sectionTitle}>Om appen</ThemedText>
          <ThemedText style={[styles.description, { color: theme.textSecondary }]}>
            Wedflow er din personlige bryllupsplanlegger, utviklet spesielt for skandinaviske par. Vi hjelper deg med alt fra gjestelister og bordplassering til leverandørkontakt og dagsplan.
          </ThemedText>
          <ThemedText style={[styles.description, { color: theme.textSecondary, marginTop: Spacing.md }]}>
            Appen er laget av Norwedfilm, et team med erfaring fra bryllupsbransjen som forstår hva par trenger for en stressfri planleggingsprosess.
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
            <FeatureItem icon="image" text="Inspirasjonsgalleri fra leverandører" theme={theme} />
            <FeatureItem icon="package" text="Leveranser fra fotografer og videografer" theme={theme} />
            <FeatureItem icon="message-circle" text="Meldinger med leverandører" theme={theme} />
            <FeatureItem icon="file-text" text="Pristilbud og tilbudsbehandling" theme={theme} />
            <FeatureItem icon="shopping-bag" text="Leverandørmarkedsplass" theme={theme} />
            <FeatureItem icon="cloud" text="Værvarsel for bryllupsdagen" theme={theme} />
            <FeatureItem icon="bell" text="Påminnelser og varsler" theme={theme} />
            <FeatureItem icon="shield" text="GDPR-kompatibel datahåndtering" theme={theme} />
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.sectionTitle}>Kontakt oss</ThemedText>
          
          <Pressable
            onPress={() => handleOpenLink("mailto:contact@norwedfilm.no")}
            style={[styles.contactRow, { borderColor: theme.border }]}
          >
            <View style={[styles.contactIcon, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="mail" size={18} color={Colors.dark.accent} />
            </View>
            <View style={styles.contactInfo}>
              <ThemedText style={styles.contactLabel}>E-post</ThemedText>
              <ThemedText style={[styles.contactValue, { color: Colors.dark.accent }]}>
                contact@norwedfilm.no
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={18} color={theme.textMuted} />
          </Pressable>

          <Pressable
            onPress={() => handleOpenLink("https://norwedfilm.no")}
            style={[styles.contactRow, { borderColor: theme.border }]}
          >
            <View style={[styles.contactIcon, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="globe" size={18} color={Colors.dark.accent} />
            </View>
            <View style={styles.contactInfo}>
              <ThemedText style={styles.contactLabel}>Nettside</ThemedText>
              <ThemedText style={[styles.contactValue, { color: Colors.dark.accent }]}>
                norwedfilm.no
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={18} color={theme.textMuted} />
          </Pressable>

          <Pressable
            onPress={() => handleOpenLink("https://instagram.com/norwedfilm")}
            style={[styles.contactRow, { borderColor: theme.border }]}
          >
            <View style={[styles.contactIcon, { backgroundColor: theme.backgroundSecondary }]}>
              <Feather name="instagram" size={18} color={Colors.dark.accent} />
            </View>
            <View style={styles.contactInfo}>
              <ThemedText style={styles.contactLabel}>Instagram</ThemedText>
              <ThemedText style={[styles.contactValue, { color: Colors.dark.accent }]}>
                @norwedfilm
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={18} color={theme.textMuted} />
          </Pressable>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <ThemedText style={[styles.copyright, { color: theme.textMuted }]}>
          2024-2026 Norwedfilm. Alle rettigheter reservert.
        </ThemedText>
      </Animated.View>
    </ScrollView>
  );
}

function FeatureItem({ icon, text, theme }: { icon: keyof typeof Feather.glyphMap; text: string; theme: any }) {
  return (
    <View style={styles.featureItem}>
      <Feather name={icon} size={16} color={Colors.dark.accent} />
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
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  appName: {
    fontSize: 28,
    fontWeight: "700",
  },
  tagline: {
    fontSize: 16,
    marginTop: Spacing.xs,
  },
  version: {
    fontSize: 14,
    marginTop: Spacing.sm,
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
});
