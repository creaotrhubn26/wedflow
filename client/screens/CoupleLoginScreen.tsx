import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
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
import { apiRequest } from "@/lib/query-client";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const COUPLE_STORAGE_KEY = "wedflow_couple_session";

interface CoupleSession {
  sessionToken: string;
  coupleId: string;
  email: string;
  displayName: string;
}

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export default function CoupleLoginScreen({ navigation }: Props) {
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");

  const loginMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/couples/login", { email, displayName });
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
    if (!email || !displayName) {
      Alert.alert("Mangler informasjon", "Fyll ut e-post og navn.");
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    loginMutation.mutate();
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + Spacing.xl },
        ]}
      >
        <Image
          source={require("../../assets/images/wedflow-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <ThemedText style={styles.title}>Logg inn for meldinger</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Logg inn for å chatte med leverandører og se meldingshistorikken din
        </ThemedText>

        <View style={styles.form}>
          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <Feather name="user" size={18} color={theme.textMuted} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Ditt navn"
              placeholderTextColor={theme.textMuted}
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
            />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <Feather name="mail" size={18} color={theme.textMuted} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="E-postadresse"
              placeholderTextColor={theme.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

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
              <ThemedText style={styles.loginBtnText}>Fortsett</ThemedText>
            )}
          </Pressable>
        </View>

        <ThemedText style={[styles.infoText, { color: theme.textMuted }]}>
          Du vil kunne se alle dine samtaler med leverandører og fortsette dialogen direkte i appen.
        </ThemedText>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.xl,
    alignItems: "center",
  },
  logo: {
    width: 300,
    height: 80,
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
  infoText: {
    fontSize: 13,
    textAlign: "center",
    marginTop: Spacing.xl,
    lineHeight: 20,
  },
});
