import React, { useState, useRef } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { EvendiIcon } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useEventType } from "@/hooks/useEventType";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "";

const ROLE_OPTIONS = [
  { key: "partner", label: "Partner / Ektefelle", icon: "heart" as const, description: "Full tilgang til planlegging" },
  { key: "toastmaster", label: "Toastmaster", icon: "mic" as const, description: "Tidslinje, program og taler" },
  { key: "bestman", label: "Bestmann", icon: "star" as const, description: "Tidslinje og program" },
  { key: "maidofhonor", label: "Forlover", icon: "star" as const, description: "Tidslinje og program" },
  { key: "bridesmaid", label: "Brudepike", icon: "users" as const, description: "Tidslinje" },
  { key: "groomsman", label: "Forlover/Bestmann", icon: "users" as const, description: "Tidslinje" },
  { key: "coordinator", label: "Koordinator", icon: "clipboard" as const, description: "Tidslinje, program og planlegging" },
  { key: "other", label: "Annen rolle", icon: "user" as const, description: "Tilgang basert på invitasjon" },
];

type Step = "code" | "role" | "details" | "success";

interface ValidationResult {
  valid: boolean;
  invitation: { id: string; role: string; name: string };
  couple: { displayName: string; weddingDate: string } | null;
}

export default function JoinWeddingScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme, isDark } = useTheme();
  const { isWedding } = useEventType();

  const [step, setStep] = useState<Step>("code");
  const [inviteCode, setInviteCode] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [joinResult, setJoinResult] = useState<any>(null);

  const nameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);

  const bg = isDark ? "#1a1a2e" : "#f8f6ff";
  const cardBg = isDark ? "#232347" : "#fff";
  const textColor = isDark ? "#fff" : "#1a1a2e";
  const subtextColor = isDark ? "#b0b0cc" : "#666";
  const accent = theme.accent;
  const inputBg = isDark ? "#2a2a4a" : "#f0eef8";
  const borderColor = isDark ? "#3a3a5a" : "#e0ddf0";

  const handleValidateCode = async () => {
    if (!inviteCode.trim()) {
      Alert.alert("Feil", "Skriv inn invitasjonskoden");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/partner/validate-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: inviteCode.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Ugyldig kode", data.error || "Koden er ikke gyldig");
        return;
      }

      setValidationResult(data);
      setSelectedRole(data.invitation.role);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep("role");
    } catch (error) {
      Alert.alert("Feil", "Kunne ikke validere koden. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRole = (roleKey: string) => {
    setSelectedRole(roleKey);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleContinueToDetails = () => {
    if (!selectedRole) {
      Alert.alert("Velg rolle", "Du må velge en rolle for å fortsette");
      return;
    }
    setStep("details");
    setTimeout(() => nameRef.current?.focus(), 300);
  };

  const handleJoin = async () => {
    if (!name.trim()) {
      Alert.alert("Mangler navn", "Skriv inn navnet ditt");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      Alert.alert("Mangler e-post", "Skriv inn en gyldig e-postadresse");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/partner/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: inviteCode.trim(),
          name: name.trim(),
          email: email.trim(),
          role: selectedRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Feil", data.error || "Kunne ikke bli med i arrangementet");
        return;
      }

      setJoinResult(data);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStep("success");
    } catch (error) {
      Alert.alert("Feil", "Nettverksfeil. Prøv igjen.");
    } finally {
      setLoading(false);
    }
  };

  const formatWeddingDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("nb-NO", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const renderCodeStep = () => (
    <Animated.View entering={FadeInDown.duration(400)} style={[styles.card, { backgroundColor: cardBg }]}>
      <View style={styles.iconCircle}>
        <EvendiIcon name="mail" size={32} color={accent} />
      </View>
      <ThemedText style={[styles.cardTitle, { color: textColor }]}>
        {isWedding ? "Bli med i et bryllup" : "Bli med i et arrangement"}
      </ThemedText>
      <ThemedText style={[styles.cardSubtitle, { color: subtextColor }]}>
        {isWedding ? "Skriv inn invitasjonskoden du har mottatt fra brudeparet" : "Skriv inn invitasjonskoden du har mottatt"}
      </ThemedText>

      <View style={[styles.codeInputContainer, { backgroundColor: inputBg, borderColor }]}>
        <EvendiIcon name="key" size={20} color={subtextColor} style={{ marginRight: 10 }} />
        <TextInput
          style={[styles.codeInput, { color: textColor }]}
          placeholder="WED-XXXXX"
          placeholderTextColor={subtextColor}
          value={inviteCode}
          onChangeText={setInviteCode}
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={handleValidateCode}
        />
      </View>

      <Pressable
        style={[styles.primaryButton, { backgroundColor: accent, opacity: loading ? 0.7 : 1 }]}
        onPress={handleValidateCode}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <EvendiIcon name="check-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
            <ThemedText style={styles.buttonText}>Valider kode</ThemedText>
          </>
        )}
      </Pressable>
    </Animated.View>
  );

  const renderRoleStep = () => (
    <Animated.View entering={FadeInDown.duration(400)}>
      {validationResult?.couple && (
        <View style={[styles.card, { backgroundColor: cardBg, marginBottom: Spacing.md }]}>
          <View style={styles.coupleInfoRow}>
            <EvendiIcon name="heart" size={20} color="#e91e63" />
            <View style={{ marginLeft: 12, flex: 1 }}>
              <ThemedText style={[styles.coupleName, { color: textColor }]}>
                {validationResult.couple.displayName}
              </ThemedText>
              {validationResult.couple.weddingDate && (
                <ThemedText style={[styles.weddingDate, { color: subtextColor }]}>
                  {formatWeddingDate(validationResult.couple.weddingDate)}
                </ThemedText>
              )}
            </View>
          </View>
        </View>
      )}

      <View style={[styles.card, { backgroundColor: cardBg }]}>
        <ThemedText style={[styles.cardTitle, { color: textColor }]}>
          Velg din rolle
        </ThemedText>
        <ThemedText style={[styles.cardSubtitle, { color: subtextColor }]}>
          Invitasjon som: {validationResult?.invitation.name}
        </ThemedText>

        <View style={styles.roleGrid}>
          {ROLE_OPTIONS.map((r) => {
            const isSelected = selectedRole === r.key;
            return (
              <Pressable
                key={r.key}
                style={[
                  styles.roleCard,
                  {
                    backgroundColor: isSelected ? accent + "18" : inputBg,
                    borderColor: isSelected ? accent : borderColor,
                  },
                ]}
                onPress={() => handleSelectRole(r.key)}
              >
                <View style={[styles.roleIcon, { backgroundColor: isSelected ? accent + "30" : borderColor }]}>
                  <EvendiIcon name={r.icon} size={18} color={isSelected ? accent : subtextColor} />
                </View>
                <ThemedText style={[styles.roleLabel, { color: isSelected ? accent : textColor }]}>
                  {r.label}
                </ThemedText>
                <ThemedText style={[styles.roleDesc, { color: subtextColor }]} numberOfLines={1}>
                  {r.description}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={[styles.primaryButton, { backgroundColor: accent }]}
          onPress={handleContinueToDetails}
        >
          <ThemedText style={styles.buttonText}>Fortsett</ThemedText>
          <EvendiIcon name="arrow-right" size={18} color="#fff" style={{ marginLeft: 8 }} />
        </Pressable>
      </View>
    </Animated.View>
  );

  const renderDetailsStep = () => (
    <Animated.View entering={FadeInDown.duration(400)} style={[styles.card, { backgroundColor: cardBg }]}>
      <View style={styles.iconCircle}>
        <EvendiIcon name="user-plus" size={32} color={accent} />
      </View>
      <ThemedText style={[styles.cardTitle, { color: textColor }]}>
        Dine opplysninger
      </ThemedText>
      <ThemedText style={[styles.cardSubtitle, { color: subtextColor }]}>
        Rolle: {ROLE_OPTIONS.find((r) => r.key === selectedRole)?.label}
      </ThemedText>

      <View style={{ marginTop: Spacing.lg, width: "100%" }}>
        <ThemedText style={[styles.inputLabel, { color: subtextColor }]}>Navn</ThemedText>
        <View style={[styles.inputContainer, { backgroundColor: inputBg, borderColor }]}>
          <EvendiIcon name="user" size={18} color={subtextColor} style={{ marginRight: 10 }} />
          <TextInput
            ref={nameRef}
            style={[styles.textInput, { color: textColor }]}
            placeholder="Ditt fulle navn"
            placeholderTextColor={subtextColor}
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            returnKeyType="next"
            onSubmitEditing={() => emailRef.current?.focus()}
          />
        </View>

        <ThemedText style={[styles.inputLabel, { color: subtextColor, marginTop: Spacing.md }]}>E-post</ThemedText>
        <View style={[styles.inputContainer, { backgroundColor: inputBg, borderColor }]}>
          <EvendiIcon name="mail" size={18} color={subtextColor} style={{ marginRight: 10 }} />
          <TextInput
            ref={emailRef}
            style={[styles.textInput, { color: textColor }]}
            placeholder="din@epost.no"
            placeholderTextColor={subtextColor}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="go"
            onSubmitEditing={handleJoin}
          />
        </View>
      </View>

      <Pressable
        style={[styles.primaryButton, { backgroundColor: accent, marginTop: Spacing.xl, opacity: loading ? 0.7 : 1 }]}
        onPress={handleJoin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <EvendiIcon name="check" size={18} color="#fff" style={{ marginRight: 8 }} />
            <ThemedText style={styles.buttonText}>{isWedding ? "Bli med i bryllupet" : "Bli med i arrangementet"}</ThemedText>
          </>
        )}
      </Pressable>

      <Pressable style={styles.backButton} onPress={() => setStep("role")}>
        <EvendiIcon name="arrow-left" size={16} color={subtextColor} />
        <ThemedText style={[styles.backText, { color: subtextColor }]}>Tilbake</ThemedText>
      </Pressable>
    </Animated.View>
  );

  const renderSuccessStep = () => (
    <Animated.View entering={FadeInDown.duration(400)} style={[styles.card, { backgroundColor: cardBg }]}>
      <View style={[styles.iconCircle, { backgroundColor: "#4caf50" + "20" }]}>
        <EvendiIcon name="check-circle" size={40} color="#4caf50" />
      </View>
      <ThemedText style={[styles.cardTitle, { color: textColor }]}>
        Du er med! 🎉
      </ThemedText>
      <ThemedText style={[styles.cardSubtitle, { color: subtextColor }]}>
        Du er nå registrert som {ROLE_OPTIONS.find((r) => r.key === selectedRole)?.label?.toLowerCase()} i {isWedding ? "bryllupet" : "arrangementet"}
        {validationResult?.couple?.displayName ? ` til ${validationResult.couple.displayName}` : ""}.
      </ThemedText>

      {joinResult?.invitation && (
        <View style={[styles.accessList, { borderColor }]}>
          <ThemedText style={[styles.accessTitle, { color: textColor }]}>Din tilgang:</ThemedText>
          {joinResult.invitation.canViewTimeline && (
            <AccessRow icon="clock" label="Tidslinje" color="#4caf50" />
          )}
          {joinResult.invitation.canCommentTimeline && (
            <AccessRow icon="message-circle" label="Kommentere tidslinje" color="#4caf50" />
          )}
          {joinResult.invitation.canViewSchedule && (
            <AccessRow icon="calendar" label="Program" color="#4caf50" />
          )}
          {joinResult.invitation.canEditSchedule && (
            <AccessRow icon="edit-3" label="Redigere program" color="#4caf50" />
          )}
          {joinResult.invitation.canViewShotlist && (
            <AccessRow icon="camera" label="Fotoliste" color="#4caf50" />
          )}
          {joinResult.invitation.canViewBudget && (
            <AccessRow icon="dollar-sign" label="Budsjett" color="#4caf50" />
          )}
          {joinResult.invitation.canEditPlanning && (
            <AccessRow icon="edit" label="Full planlegging" color="#4caf50" />
          )}
        </View>
      )}
    </Animated.View>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={headerHeight}
    >
      <ScrollView
        style={[styles.container, { backgroundColor: bg }]}
        contentContainerStyle={[styles.content, { paddingTop: Spacing.lg, paddingBottom: insets.bottom + 40 }]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress indicator */}
        <View style={styles.progressRow}>
          {(["code", "role", "details", "success"] as Step[]).map((s, i) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                {
                  backgroundColor:
                    step === s ? accent : (["code", "role", "details", "success"].indexOf(step) > i ? "#4caf50" : borderColor),
                },
              ]}
            />
          ))}
        </View>

        {step === "code" && renderCodeStep()}
        {step === "role" && renderRoleStep()}
        {step === "details" && renderDetailsStep()}
        {step === "success" && renderSuccessStep()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AccessRow({ icon, label, color }: { icon: any; label: string; color: string }) {
  return (
    <View style={styles.accessRow}>
      <EvendiIcon name={icon} size={16} color={color} />
      <ThemedText style={[styles.accessLabel, { color }]}>{label}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: Spacing.xl,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#7c3aed" + "15",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  codeInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: Spacing.xl,
    width: "100%",
  },
  codeInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 2,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    paddingHorizontal: 28,
    marginTop: Spacing.lg,
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  coupleInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  coupleName: {
    fontSize: 18,
    fontWeight: "700",
  },
  weddingDate: {
    fontSize: 13,
    marginTop: 2,
  },
  roleGrid: {
    width: "100%",
    marginTop: Spacing.lg,
    gap: 10,
  },
  roleCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    padding: 14,
  },
  roleIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  roleLabel: {
    fontSize: 15,
    fontWeight: "600",
    flex: 1,
  },
  roleDesc: {
    fontSize: 11,
    maxWidth: "35%",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.md,
    padding: 8,
  },
  backText: {
    fontSize: 14,
    marginLeft: 6,
  },
  accessList: {
    width: "100%",
    marginTop: Spacing.lg,
    borderTopWidth: 1,
    paddingTop: Spacing.md,
  },
  accessTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
  },
  accessRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 6,
  },
  accessLabel: {
    fontSize: 14,
  },
});
