import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import { signInWithGoogle } from "@/lib/supabase-auth";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { showToast } from "@/lib/toast";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

interface VendorSession {
  sessionToken: string;
  vendorId: string;
  email: string;
  businessName: string;
}

const GOOGLE_LOGO_URI = "https://developers.google.com/identity/images/g-logo.png";

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export default function VendorLoginScreen({ navigation }: Props) {
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const validateField = useCallback((field: string, value: string): string => {
    switch (field) {
      case "email":
        if (!value) return "E-post er påkrevd";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Ugyldig e-postadresse";
        return "";
      case "password":
        if (!value) return "Passord er påkrevd";
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

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    const sessionData = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
    if (sessionData) {
      try {
        const session = JSON.parse(sessionData);
        // Validate that the session token is still valid by making a test request
        const response = await fetch(new URL("/api/vendor/session", getApiUrl()).toString(), {
          headers: {
            Authorization: `Bearer ${session.sessionToken}`,
          },
        });
        if (response.ok) {
          navigation.replace("VendorDashboard");
        } else {
          // Session is invalid, clear it
          await AsyncStorage.removeItem(VENDOR_STORAGE_KEY);
        }
      } catch {
        // Invalid session data, clear it
        await AsyncStorage.removeItem(VENDOR_STORAGE_KEY);
      }
    }
  };

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/vendors/login", { email, password });
      return response.json();
    },
    onSuccess: async (data) => {
      if (data.vendor && data.vendor.status === "approved" && data.sessionToken) {
        const session: VendorSession = {
          sessionToken: data.sessionToken,
          vendorId: data.vendor.id,
          email: data.vendor.email,
          businessName: data.vendor.businessName,
        };
        await AsyncStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(session));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        navigation.replace("VendorDashboard");
      } else if (data.vendor && data.vendor.status === "pending") {
        showToast("Din søknad er under behandling. Du vil få beskjed når den er godkjent.");
      } else if (data.vendor && data.vendor.status === "rejected") {
        showToast("Din søknad ble dessverre avvist. Ta kontakt for mer informasjon.");
      } else {
        showToast("Kunne ikke logge inn. Prøv igjen.");
      }
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message || "Ugyldig e-post eller passord.");
    },
  });

  const handleLogin = () => {
    if (!email || !password) {
      showToast("Fyll ut e-post og passord.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    loginMutation.mutate();
  };

  const handleGoogleLogin = async () => {
    try {
      setIsGoogleLoading(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      const session = await signInWithGoogle();
      
      if (session && session.user) {
        const googleEmail = session.user.email || "";
        const googleName = session.user.user_metadata?.full_name || googleEmail.split("@")[0];

        // Send Google info to backend
        const url = new URL("/api/vendors/google-login", getApiUrl());
        const response = await fetch(url.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            googleEmail,
            googleName,
            googleId: session.user.id,
          }),
        });

        const data = await response.json();

        if (response.status === 201 || response.status === 200) {
          // Vendor exists and is approved
          if (data.status === "approved" && data.sessionToken) {
            const vendorSession: VendorSession = {
              sessionToken: data.sessionToken,
              vendorId: data.vendor.id,
              email: data.vendor.email,
              businessName: data.vendor.businessName,
            };
            await AsyncStorage.setItem(VENDOR_STORAGE_KEY, JSON.stringify(vendorSession));
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            navigation.replace("VendorDashboard");
          } else if (data.status === "pending") {
            showToast("Takk for din registrering! Din søknad venter på godkjenning. Du vil motta en e-post når den er behandlet.");
          }
        } else if (response.status === 403) {
          // Vendor exists but not approved
          if (data.status === "pending") {
            showToast(data.message || "Din søknad venter på godkjenning.");
          } else if (data.status === "rejected") {
            showToast(data.message || "Din søknad ble avvist.");
          }
        } else {
          showToast(data.error || "Kunne ikke logge inn med Google");
        }
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error instanceof Error ? error.message : "Kunne ikke logge inn med Google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.headerBar, { paddingTop: headerHeight }]}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name="arrow-left" size={24} color={theme.text} />
        </Pressable>
      </View>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          { paddingTop: Spacing.xl },
        ]}
      >
        <Image
          source={require("../../assets/images/Evendi_logo_norsk_tagline.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <ThemedText style={styles.title}>Leverandørportal</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Logg inn for å administrere dine leveranser
        </ThemedText>

        <View style={styles.form}>
          <View>
            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }, getFieldStyle("email")]}>
              <Feather name="mail" size={18} color={touched.email && errors.email ? "#DC3545" : theme.textMuted} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="E-post"
                placeholderTextColor={theme.textMuted}
                value={email}
                onChangeText={setEmail}
                onBlur={() => handleBlur("email", email)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                accessible={true}
                accessibilityLabel="E-postadresse"
                accessibilityHint="Skriv inn din e-postadresse for å logge inn"
              />
            </View>
            {touched.email && errors.email ? (
              <ThemedText style={styles.errorText}>{errors.email}</ThemedText>
            ) : null}
          </View>

          <View>
            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }, getFieldStyle("password")]}>
              <Feather name="lock" size={18} color={touched.password && errors.password ? "#DC3545" : theme.textMuted} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Passord"
                placeholderTextColor={theme.textMuted}
                value={password}
                onChangeText={setPassword}
                onBlur={() => handleBlur("password", password)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                accessible={true}
                accessibilityLabel="Passord"
                accessibilityHint="Skriv inn ditt passord for å logge inn"
              />
              <Pressable 
                onPress={() => setShowPassword(!showPassword)}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={showPassword ? "Skjul passord" : "Vis passord"}
              >
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={theme.textMuted} />
              </Pressable>
            </View>
            {touched.password && errors.password ? (
              <ThemedText style={styles.errorText}>{errors.password}</ThemedText>
            ) : null}
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={loginMutation.isPending}
            style={[styles.loginBtn, { backgroundColor: Colors.dark.accent, opacity: loginMutation.isPending ? 0.6 : 1 }]}
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color="#1A1A1A" />
            ) : (
              <ThemedText style={styles.loginBtnText}>Logg inn</ThemedText>
            )}
          </Pressable>

          <View style={styles.dividerContainer}>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <ThemedText style={[styles.dividerText, { color: theme.textMuted }]}>ELLER</ThemedText>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
          </View>

          <Pressable
            onPress={handleGoogleLogin}
            disabled={isGoogleLoading}
            style={[
              styles.googleBtn,
              { 
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
                opacity: isGoogleLoading ? 0.7 : 1 
              },
            ]}
          >
            {isGoogleLoading ? (
              <ActivityIndicator size="small" color={Colors.dark.accent} />
            ) : (
              <>
                <Image
                  source={{ uri: GOOGLE_LOGO_URI }}
                  style={styles.googleLogo}
                  resizeMode="contain"
                />
                <ThemedText style={[styles.googleBtnText, { color: Colors.dark.accent }]}>
                  Logg inn med Google
                </ThemedText>
              </>
            )}
          </Pressable>
        </View>

        <ThemedText style={[styles.registerText, { color: theme.textSecondary }]}>
          Har du ikke en konto?
        </ThemedText>
        <Pressable
          onPress={() => navigation.navigate("VendorRegistration")}
          accessible={true}
          accessibilityRole="link"
          accessibilityLabel="Registrer ny leverandør"
          style={styles.registerLink}
        >
          <ThemedText style={[styles.registerLinkText, { color: Colors.dark.accent }]}>
            Registrer deg som leverandør
          </ThemedText>
        </Pressable>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
  },
  logo: {
    width: 480,
    height: 160,
    marginBottom: Spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: Spacing.xl,
  },
  form: {
    width: "100%",
    gap: Spacing.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 50,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  loginBtn: {
    height: 50,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.sm,
  },
  loginBtnText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginVertical: Spacing.lg,
    width: "100%",
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: "600",
  },
  googleBtn: {
    height: 50,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: Spacing.sm,
    width: "100%",
  },
  googleLogo: {
    width: 18,
    height: 18,
  },
  googleBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
  registerText: {
    fontSize: 14,
    marginTop: Spacing.xl,
  },
  registerLink: {
    marginTop: Spacing.xs,
  },
  registerLinkText: {
    fontSize: 14,
    fontWeight: "600",
  },
  errorText: {
    fontSize: 12,
    color: "#DC3545",
    marginTop: 4,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
});
