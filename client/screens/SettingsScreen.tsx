import React, { useEffect, useState, useRef } from "react";
import { ScrollView, StyleSheet, View, Pressable, Switch, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { EvendiIcon, EvendiIconGlyphMap } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { clearAllData, getAppLanguage, saveAppLanguage, type AppLanguage } from "@/lib/storage";
import { showToast } from "@/lib/toast";
import { showConfirm, showOptions } from "@/lib/dialogs";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const [appLanguage, setAppLanguage] = useState<AppLanguage>("nb");
  const hasShownWebToast = useRef(false);

  useEffect(() => {
    async function loadLanguage() {
      const storedLanguage = await getAppLanguage();
      setAppLanguage(storedLanguage);
    }
    loadLanguage();
  }, []);

  useEffect(() => {
    if (Platform.OS === "web" && !hasShownWebToast.current) {
      showToast("ToastProvider web test");
      hasShownWebToast.current = true;
    }
  }, []);

  const handleClearData = async () => {
    const confirmed = await showConfirm({
      title: "Slett alle data",
      message: "Er du sikker på at du vil slette alle data? Dette kan ikke angres.",
      confirmLabel: "Slett",
      cancelLabel: "Avbryt",
      destructive: true,
    });
    if (!confirmed) return;
    await clearAllData();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast("Alle data er slettet. Start appen på nytt for å begynne på nytt.");
  };

  const languageLabel = appLanguage === "en" ? "English" : "Norsk";

  const handleLanguageSelect = () => {
    showOptions({
      title: "Sprak",
      message: "Velg språk for appen",
      cancelLabel: "Avbryt",
      options: [
        {
          label: "Norsk",
          onPress: async () => {
            await saveAppLanguage("nb");
            setAppLanguage("nb");
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            showToast("Sprak oppdatert.");
          },
        },
        {
          label: "English",
          onPress: async () => {
            await saveAppLanguage("en");
            setAppLanguage("en");
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            showToast("Language updated.");
          },
        },
      ],
    });
  };

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
      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Generelt
        </ThemedText>
        <View style={styles.settingsGroup}>
          <SettingRow
            icon="bell"
            label="Varslinger"
            theme={theme}
            hasSwitch
            switchValue={true}
            onSwitchChange={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          />
          <SettingRow
            icon="moon"
            label="Mørk modus"
            theme={theme}
            hasSwitch
            switchValue={true}
            onSwitchChange={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          />
          <SettingRow
            icon="globe"
            label="Språk"
            theme={theme}
            value={languageLabel}
            onPress={handleLanguageSelect}
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Data
        </ThemedText>
        <View style={styles.settingsGroup}>
          <SettingRow
            icon="download"
            label="Eksporter data"
            theme={theme}
            onPress={() => showToast("Eksportfunksjon kommer snart")}
          />
          <SettingRow
            icon="trash-2"
            label="Slett alle data"
            theme={theme}
            destructive
            onPress={handleClearData}
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <ThemedText type="h4" style={[styles.sectionTitle, { color: theme.textSecondary }]}>
          Om
        </ThemedText>
        <View style={styles.settingsGroup}>
          <SettingRow
            icon="info"
            label="Versjon"
            theme={theme}
            value="1.0.0"
          />
          <SettingRow
            icon="file-text"
            label="Personvern"
            theme={theme}
            onPress={() => showToast("Personvernerklæring kommer snart")}
          />
          <SettingRow
            icon="book"
            label="Vilkår"
            theme={theme}
            onPress={() => showToast("Vilkår for bruk kommer snart")}
          />
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <View style={styles.footer}>
          <ThemedText style={[styles.footerText, { color: theme.textMuted }]}>
            Evendi by Norwedfilm
          </ThemedText>
          <ThemedText style={[styles.footerText, { color: theme.textMuted }]}>
            Laget med kjærlighet i Norge
          </ThemedText>
        </View>
      </Animated.View>
    </ScrollView>
  );
}

interface SettingRowProps {
  icon: keyof typeof EvendiIconGlyphMap;
  label: string;
  theme: any;
  value?: string;
  hasSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  onPress?: () => void;
  destructive?: boolean;
}

function SettingRow({
  icon,
  label,
  theme,
  value,
  hasSwitch,
  switchValue,
  onSwitchChange,
  onPress,
  destructive,
}: SettingRowProps) {
  const content = (
    <View
      style={[
        styles.settingRow,
        { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
      ]}
    >
      <View
        style={[
          styles.settingIcon,
          { backgroundColor: theme.backgroundSecondary },
        ]}
      >
        <EvendiIcon
          name={icon}
          size={18}
          color={destructive ? theme.error : Colors.dark.accent}
        />
      </View>
      <ThemedText
        style={[
          styles.settingLabel,
          destructive && { color: theme.error },
        ]}
      >
        {label}
      </ThemedText>
      {hasSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onSwitchChange}
          trackColor={{ false: theme.border, true: Colors.dark.accent }}
          thumbColor="#FFFFFF"
        />
      ) : value ? (
        <ThemedText style={[styles.settingValue, { color: theme.textSecondary }]}>
          {value}
        </ThemedText>
      ) : onPress ? (
        <EvendiIcon name="chevron-right" size={18} color={theme.textMuted} />
      ) : null}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        style={({ pressed }) => [pressed && { opacity: 0.9 }]}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
    textTransform: "uppercase",
    fontSize: 12,
    letterSpacing: 1,
  },
  settingsGroup: {
    gap: Spacing.sm,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  settingIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  settingLabel: {
    flex: 1,
    fontSize: 16,
  },
  settingValue: {
    fontSize: 14,
  },
  footer: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
  footerText: {
    fontSize: 13,
    marginBottom: Spacing.xs,
  },
});
