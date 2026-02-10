import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { EvendiIcon } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

interface Props {
  navigation: NativeStackNavigationProp<any>;
  initialAdminKey?: string;
  onLoginSuccess?: (adminKey: string) => void;
}

export default function AdminLoginScreen({ navigation, onLoginSuccess, initialAdminKey }: Props) {
  const { theme } = useTheme();

  const [adminKey, setAdminKey] = useState(initialAdminKey || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (initialAdminKey && adminKey.length === 0) {
      setAdminKey(initialAdminKey);
    }
  }, [initialAdminKey, adminKey]);

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);

    try {
      const url = new URL("/api/admin/statistics", getApiUrl());
      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${adminKey}` },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("Ugyldig admin-nøkkel");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setIsLoading(false);
          return;
        }
        if (response.status === 503) {
          setError("Admin-funksjonalitet er ikke konfigurert");
          setIsLoading(false);
          return;
        }
        if (response.status === 302) {
          setError("Port 5000 må være offentlig i Codespaces (Ports panel → Port 5000 → Set to Public)");
          setIsLoading(false);
          return;
        }
        setError("Kunne ikke koble til serveren");
        setIsLoading(false);
        return;
      }

      // Store admin key and navigate
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onLoginSuccess?.(adminKey);
      navigation.replace("AdminMain", { adminKey });
    } catch (error) {
      setError("Nettverksfeil. Prøv igjen.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundRoot }]} edges={['top', 'bottom']}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={styles.content}
      >
        <Image
          source={require("../../assets/images/Evendi_logo_norsk_tagline.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Animated.View entering={FadeInDown.duration(400)} style={styles.formContainer}>
          <View style={[styles.iconCircle, { backgroundColor: Colors.dark.accent + "20" }]}>
            <EvendiIcon name="shield" size={40} color={Colors.dark.accent} />
          </View>

          <ThemedText style={styles.title}>Admin-portal</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Skriv inn admin-nøkkelen for å få tilgang
          </ThemedText>

          <View style={styles.form}>
            <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: error ? "#DC3545" : theme.border }]}>
              <EvendiIcon name="key" size={18} color={error ? "#DC3545" : theme.textMuted} />
              <TextInput
                style={[styles.input, { color: theme.text }]}
                placeholder="Admin-nøkkel"
                placeholderTextColor={theme.textMuted}
                value={adminKey}
                onChangeText={(text) => {
                  setAdminKey(text);
                  setError("");
                }}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            {error ? (
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            ) : null}

            <Pressable
              onPress={handleLogin}
              disabled={isLoading || !adminKey}
              style={[
                styles.loginBtn,
                {
                  backgroundColor: Colors.dark.accent,
                  opacity: isLoading || !adminKey ? 0.5 : 1,
                },
              ]}
            >
              {isLoading ? (
                <ActivityIndicator color="#1A1A1A" />
              ) : (
                <ThemedText style={styles.loginBtnText}>Logg inn som admin</ThemedText>
              )}
            </Pressable>
          </View>

          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <EvendiIcon name="arrow-left" size={18} color={Colors.dark.accent} />
            <ThemedText style={[styles.backText, { color: Colors.dark.accent }]}>
              Tilbake til bruker-innlogging
            </ThemedText>
          </Pressable>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing["2xl"],
  },
  logo: {
    width: 480,
    height: 160,
    alignSelf: "center",
    marginBottom: Spacing["2xl"],
  },
  formContainer: {
    alignItems: "center",
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginBottom: Spacing["2xl"],
    paddingHorizontal: Spacing.lg,
  },
  form: {
    width: "100%",
    maxWidth: 400,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: Spacing.xs,
  },
  errorText: {
    color: "#DC3545",
    fontSize: 13,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  loginBtn: {
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.lg,
    minHeight: 48,
  },
  loginBtnText: {
    color: "#1A1A1A",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  backText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
