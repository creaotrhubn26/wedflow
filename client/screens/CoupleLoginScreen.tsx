import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { apiRequest } from "@/lib/query-client";
import { signInWithGoogle } from "@/lib/supabase-auth";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const COUPLE_STORAGE_KEY = "wedflow_couple_session";

interface CoupleSession {
  sessionToken: string;
  coupleId: string;
  email: string;
  displayName: string;
}

const GOOGLE_LOGO_URI = "https://developers.google.com/identity/images/g-logo.png";

interface Props {
  navigation: NativeStackNavigationProp<any>;
  onLoginSuccess?: () => void;
}

export default function CoupleLoginScreen({ navigation, onLoginSuccess }: Props) {
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
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
        if (value.length < 8) return "Passord må være minst 8 tegn";
        return "";
      case "displayName":
        if (isRegistering) {
          if (!value) return "Navn er påkrevd";
          if (value.length < 2) return "Navn må være minst 2 tegn";
        }
        return "";
      default:
        return "";
    }
  }, [isRegistering]);

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

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/couples/login", { 
        email, 
        password,
        displayName: isRegistering ? displayName : email.split("@")[0]
      });
      return response.json();
    },
    onSuccess: async (data) => {
      if (data.couple && data.sessionToken) {
        const session: CoupleSession = {
          sessionToken: data.sessionToken,
          coupleId: data.couple.id,
          email: data.couple.email,
          displayName: data.couple.displayName,
        };
        await AsyncStorage.setItem(COUPLE_STORAGE_KEY, JSON.stringify(session));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onLoginSuccess?.();
        navigation.replace("Messages");
      } else {
        Alert.alert("Feil", "Kunne ikke logge inn. Prøv igjen.");
      }
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Feil", error.message || "Kunne ikke logge inn.");
    },
  });

  const handleLogin = () => {
    const newErrors: Record<string, string> = {};
    
    const emailError = validateField("email", email);
    const passwordError = validateField("password", password);
    const nameError = isRegistering ? validateField("displayName", displayName) : "";
    
    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    if (nameError) newErrors.displayName = nameError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched({ email: true, password: true, displayName: true });
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
        // Extract user info from Google OAuth
        const googleEmail = session.user.email || "";
        const googleName = session.user.user_metadata?.full_name || googleEmail.split("@")[0];
        
        // Save session
        const coupleSession: CoupleSession = {
          sessionToken: session.access_token,
          coupleId: session.user.id,
          email: googleEmail,
          displayName: googleName,
        };
        
        await AsyncStorage.setItem(COUPLE_STORAGE_KEY, JSON.stringify(coupleSession));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onLoginSuccess?.();
        navigation.replace("Messages");
      }
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Feil", error instanceof Error ? error.message : "Kunne ikke logge inn med Google");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundRoot }]} edges={['top', 'bottom']}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={styles.content}
      >
        <Image
          source={require("../../assets/images/wedflow-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <ThemedText style={styles.title}>Velkommen til Wedflow</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          {isRegistering 
            ? "Opprett konto for å planlegge bryllupet ditt"
            : "Logg inn for å planlegge bryllupet ditt"}
        </ThemedText>

        <View style={styles.form}>
          <View>
            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }, getFieldStyle("email")]}>
              <Feather name="mail" size={18} color={touched.email && errors.email ? "#DC3545" : theme.textMuted} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="E-postadresse"
                placeholderTextColor={theme.textMuted}
                value={email}
                onChangeText={setEmail}
                onBlur={() => handleBlur("email", email)}
                keyboardType="email-address"
                autoCapitalize="none"
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
              />
              <Pressable onPress={() => setShowPassword(!showPassword)}>
                <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={theme.textMuted} />
              </Pressable>
            </View>
            {touched.password && errors.password ? (
              <ThemedText style={styles.errorText}>{errors.password}</ThemedText>
            ) : null}
          </View>

          {isRegistering && (
            <View>
              <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }, getFieldStyle("displayName")]}>
                <Feather name="user" size={18} color={touched.displayName && errors.displayName ? "#DC3545" : theme.textMuted} />
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder="Ditt navn"
                  placeholderTextColor={theme.textMuted}
                  value={displayName}
                  onChangeText={setDisplayName}
                  onBlur={() => handleBlur("displayName", displayName)}
                  autoCapitalize="words"
                />
              </View>
              {touched.displayName && errors.displayName ? (
                <ThemedText style={styles.errorText}>{errors.displayName}</ThemedText>
              ) : null}
            </View>
          )}

          <Pressable
            onPress={handleLogin}
            disabled={loginMutation.isPending}
            style={[
              styles.loginBtn,
              { backgroundColor: Colors.dark.accent, opacity: loginMutation.isPending ? 0.7 : 1 },
            ]}
          >
            {loginMutation.isPending ? (
              <ActivityIndicator color="#1A1A1A" />
            ) : (
              <ThemedText style={styles.loginBtnText}>
                {isRegistering ? "Registrer deg" : "Logg inn"}
              </ThemedText>
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

        <View style={styles.toggleContainer}>
          <ThemedText style={[styles.toggleText, { color: theme.textSecondary }]}>
            {isRegistering ? "Har du allerede konto? " : "Ny bruker? "}
          </ThemedText>
          <Pressable onPress={() => {
            setIsRegistering(!isRegistering);
            setErrors({});
            setTouched({});
          }}>
            <ThemedText style={[styles.toggleLink, { color: Colors.dark.accent }]}>
              {isRegistering ? "Logg inn" : "Registrer deg"}
            </ThemedText>
          </Pressable>
        </View>

        <View style={styles.linkContainer}>
          <Pressable 
            onPress={() => {
              if (Platform.OS === "web") {
                navigation.navigate?.("VendorLogin");
                return;
              }

              Alert.alert(
                "Leverandør?",
                "Leverandører logger inn via leverandør-portalen.",
                [
                  { text: "Avbryt", style: "cancel" },
                  { 
                    text: "Gå til leverandør-innlogging", 
                    onPress: () => navigation.navigate?.("VendorLogin")
                  }
                ]
              );
            }}
            style={styles.vendorLink}
          >
            <ThemedText style={[styles.vendorLinkText, { color: theme.textSecondary }]}>
              Er du leverandør?
            </ThemedText>
          </Pressable>

          <Pressable 
            onPress={() => navigation.navigate?.("AdminLogin")}
            style={styles.vendorLink}
          >
            <Feather name="shield" size={16} color={theme.textSecondary} />
            <ThemedText style={[styles.vendorLinkText, { color: theme.textSecondary }]}>
              Admin-portal
            </ThemedText>
          </Pressable>
        </View>

        <ThemedText style={[styles.infoText, { color: theme.textMuted }]}>
          Med Wedflow får du full kontroll over planleggingen av bryllupet ditt – fra gjesteoversikt og tidslinje til budsjett og leverandørsamtaler.
        </ThemedText>
      </KeyboardAwareScrollViewCompat>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    alignItems: "center",
  },
  logo: {
    width: 480,
    height: 160,
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
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
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: Spacing.lg,
    gap: Spacing.xs,
  },
  toggleText: {
    fontSize: 14,
  },
  toggleLink: {
    fontSize: 14,
    fontWeight: "600",
  },
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.lg,
    gap: Spacing.xl,
  },
  vendorLink: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  vendorLinkText: {
    fontSize: 13,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  infoText: {
    fontSize: 13,
    textAlign: "center",
    marginTop: Spacing.xl,
    lineHeight: 20,
  },
  errorText: {
    fontSize: 12,
    color: "#DC3545",
    marginTop: 4,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
});
