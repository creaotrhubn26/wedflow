import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { EvendiIcon } from "@/components/EvendiIcon";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
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

const useFieldValidation = () => {
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((field: string, value: string): string => {
    switch (field) {
      case "supportEmail":
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Ugyldig e-postadresse";
        return "";
      case "privacyPolicyUrl":
      case "termsUrl":
        if (value && !/^https?:\/\/.+/.test(value)) return "URL må starte med http:// eller https://";
        return "";
      case "maxFileUploadMb":
        if (value && !/^\d+$/.test(value)) return "Må være et tall";
        return "";
      default:
        return "";
    }
  }, []);

  const handleBlur = useCallback((field: string, value: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, [validateField]);

  const getFieldStyle = useCallback((field: string) => {
    if (touched[field] && errors[field]) {
      return { borderColor: "#DC3545" };
    }
    return {};
  }, [touched, errors]);

  const validateAll = (fields: Record<string, string>) => {
    const nextTouched: Record<string, boolean> = {};
    const nextErrors: Record<string, string> = {};

    Object.entries(fields).forEach(([field, value]) => {
      nextTouched[field] = true;
      const error = validateField(field, value);
      if (error) nextErrors[field] = error;
    });

    setTouched((prev) => ({ ...prev, ...nextTouched }));
    setErrors((prev) => ({ ...prev, ...nextErrors }));

    return Object.keys(nextErrors).length === 0;
  };

  return { touched, errors, handleBlur, getFieldStyle, validateAll };
};

interface AppSetting {
  id: string;
  key: string;
  value: string;
  category: string;
}

export default function AdminSettingsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const route = useRoute<RouteProp<RootStackParamList, "AdminSettings">>();
  const adminKey = route.params?.adminKey || "";
  const { touched, errors, handleBlur, getFieldStyle, validateAll } = useFieldValidation();

  const [enableVendorRegistration, setEnableVendorRegistration] = useState(true);
  const [requireInspirationApproval, setRequireInspirationApproval] = useState(true);
  const [enableMessaging, setEnableMessaging] = useState(true);
  const [maxFileUploadMb, setMaxFileUploadMb] = useState("50");
  const [supportEmail, setSupportEmail] = useState("");
  const [privacyPolicyUrl, setPrivacyPolicyUrl] = useState("");
  const [termsUrl, setTermsUrl] = useState("");

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
      setEnableVendorRegistration(getSetting("enable_vendor_registration", "true") === "true");
      setRequireInspirationApproval(getSetting("require_inspiration_approval", "true") === "true");
      setEnableMessaging(getSetting("enable_messaging", "true") === "true");
      setMaxFileUploadMb(getSetting("max_file_upload_mb", "50"));
      setSupportEmail(getSetting("support_email", ""));
      setPrivacyPolicyUrl(getSetting("privacy_policy_url", ""));
      setTermsUrl(getSetting("terms_url", ""));
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
            { key: "enable_vendor_registration", value: String(enableVendorRegistration), category: "features" },
            { key: "require_inspiration_approval", value: String(requireInspirationApproval), category: "features" },
            { key: "enable_messaging", value: String(enableMessaging), category: "features" },
            { key: "max_file_upload_mb", value: maxFileUploadMb, category: "limits" },
            { key: "support_email", value: supportEmail, category: "contact" },
            { key: "privacy_policy_url", value: privacyPolicyUrl, category: "legal" },
            { key: "terms_url", value: termsUrl, category: "legal" },
          ],
        }),
      });
      if (!response.ok) throw new Error("Kunne ikke lagre");
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      showToast("Innstillinger er oppdatert");
    },
    onError: () => {
      showToast("Kunne ikke lagre innstillinger");
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
    <View style={{ flex: 1, backgroundColor: theme.backgroundRoot }}>
      <AdminHeader 
        title="Innstillinger" 
        subtitle="Generelle appinnstillinger"
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
          <ThemedText style={styles.sectionTitle}>Funksjoner</ThemedText>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Leverandørregistrering</ThemedText>
              <ThemedText style={[styles.settingDesc, { color: theme.textSecondary }]}>
                Tillat nye leverandører å registrere seg
              </ThemedText>
            </View>
            <Switch
              value={enableVendorRegistration}
              onValueChange={setEnableVendorRegistration}
              trackColor={{ false: theme.border, true: Colors.dark.accent }}
              thumbColor="#FFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Godkjenning av showcases</ThemedText>
              <ThemedText style={[styles.settingDesc, { color: theme.textSecondary }]}>
                Krev admin-godkjenning for nye showcases
              </ThemedText>
            </View>
            <Switch
              value={requireInspirationApproval}
              onValueChange={setRequireInspirationApproval}
              trackColor={{ false: theme.border, true: Colors.dark.accent }}
              thumbColor="#FFF"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <ThemedText style={styles.settingLabel}>Meldinger</ThemedText>
              <ThemedText style={[styles.settingDesc, { color: theme.textSecondary }]}>
                Aktiver meldingssystem mellom par og leverandører
              </ThemedText>
            </View>
            <Switch
              value={enableMessaging}
              onValueChange={setEnableMessaging}
              trackColor={{ false: theme.border, true: Colors.dark.accent }}
              thumbColor="#FFF"
            />
          </View>
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(100).duration(400)}>
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.sectionTitle}>Begrensninger</ThemedText>
          
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
            Maks filopplasting (MB)
          </ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }, getFieldStyle("maxFileUploadMb")]}
            value={maxFileUploadMb}
            onChangeText={setMaxFileUploadMb}
            onBlur={() => handleBlur("maxFileUploadMb", maxFileUploadMb)}
            placeholder="50"
            placeholderTextColor={theme.textMuted}
            keyboardType="numeric"
          />
          {touched.maxFileUploadMb && errors.maxFileUploadMb ? (
            <ThemedText style={styles.errorText}>{errors.maxFileUploadMb}</ThemedText>
          ) : null}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(200).duration(400)}>
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.sectionTitle}>Kontakt</ThemedText>
          
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Support e-post</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }, getFieldStyle("supportEmail")]}
            value={supportEmail}
            onChangeText={setSupportEmail}
            onBlur={() => handleBlur("supportEmail", supportEmail)}
            placeholder="support@example.com"
            placeholderTextColor={theme.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {touched.supportEmail && errors.supportEmail ? (
            <ThemedText style={styles.errorText}>{errors.supportEmail}</ThemedText>
          ) : null}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(300).duration(400)}>
        <View style={[styles.section, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.sectionTitle}>Juridisk</ThemedText>
          
          <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Personvernerklæring URL</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }, getFieldStyle("privacyPolicyUrl")]}
            value={privacyPolicyUrl}
            onChangeText={setPrivacyPolicyUrl}
            onBlur={() => handleBlur("privacyPolicyUrl", privacyPolicyUrl)}
            placeholder="https://..."
            placeholderTextColor={theme.textMuted}
            autoCapitalize="none"
            keyboardType="url"
          />
          {touched.privacyPolicyUrl && errors.privacyPolicyUrl ? (
            <ThemedText style={styles.errorText}>{errors.privacyPolicyUrl}</ThemedText>
          ) : null}

          <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.md }]}>
            Vilkår for bruk URL
          </ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border }, getFieldStyle("termsUrl")]}
            value={termsUrl}
            onChangeText={setTermsUrl}
            onBlur={() => handleBlur("termsUrl", termsUrl)}
            placeholder="https://..."
            placeholderTextColor={theme.textMuted}
            autoCapitalize="none"
            keyboardType="url"
          />
          {touched.termsUrl && errors.termsUrl ? (
            <ThemedText style={styles.errorText}>{errors.termsUrl}</ThemedText>
          ) : null}
        </View>
      </Animated.View>

      <Animated.View entering={FadeInDown.delay(400).duration(400)}>
        <Pressable
          style={[styles.saveButton, { backgroundColor: Colors.dark.accent }]}
          onPress={() => {
            const isValid = validateAll({
              supportEmail,
              privacyPolicyUrl,
              termsUrl,
              maxFileUploadMb,
            });
            if (!isValid) {
              showToast("Rett opp feltene som er markert i rodt.");
              return;
            }
            saveMutation.mutate();
          }}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <EvendiIcon name="save" size={18} color="#000" />
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
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.sm,
  },
  settingInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  settingDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
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
  errorText: {
    fontSize: 12,
    color: "#DC3545",
    marginTop: 4,
    marginBottom: Spacing.sm,
  },
});
