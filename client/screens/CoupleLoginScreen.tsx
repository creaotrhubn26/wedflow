import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Image,
  Platform,
  Modal,
  ScrollView,
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
import { showToast } from "@/lib/toast";
import { showOptions } from "@/lib/dialogs";
import { 
  EVENT_TYPE_CONFIGS, 
  getGroupedEventTypes, 
  getCorporateGrouped,
  getCorporateCatchAll,
  type EventType, 
  type EventCategory 
} from "@shared/event-types";

const COUPLE_STORAGE_KEY = "wedflow_couple_session";

interface CoupleSession {
  sessionToken: string;
  coupleId: string;
  email: string;
  displayName: string;
}

const GOOGLE_LOGO_URI = "https://developers.google.com/identity/images/g-logo.png";

const CULTURAL_TRADITIONS = [
  { key: "norway", name: "Norge", icon: "🇳🇴", color: "#BA2020" },
  { key: "sweden", name: "Sverige", icon: "🇸🇪", color: "#006AA7" },
  { key: "denmark", name: "Danmark", icon: "🇩🇰", color: "#C60C30" },
  { key: "hindu", name: "Hindu", icon: "🕉️", color: "#FF6B35" },
  { key: "sikh", name: "Sikh", icon: "☬", color: "#FF9933" },
  { key: "muslim", name: "Muslim", icon: "☪️", color: "#1B5E20" },
  { key: "jewish", name: "Jødisk", icon: "✡️", color: "#1565C0" },
  { key: "chinese", name: "Kinesisk", icon: "🏮", color: "#D32F2F" },
];

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
  const [selectedTraditions, setSelectedTraditions] = useState<string[]>([]);
  const [showTraditionSelection, setShowTraditionSelection] = useState(false);
  const [selectedEventType, setSelectedEventType] = useState<EventType>("wedding");
  const [selectedEventCategory, setSelectedEventCategory] = useState<EventCategory>("personal");
  const [showEventTypePicker, setShowEventTypePicker] = useState(false);
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
        displayName: isRegistering ? displayName : email.split("@")[0],
        selectedTraditions: isRegistering && selectedTraditions.length > 0 ? selectedTraditions : undefined,
        eventType: isRegistering ? selectedEventType : undefined,
        eventCategory: isRegistering ? selectedEventCategory : undefined,
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
        showToast("Kunne ikke logge inn. Prøv igjen.");
      }
    },
    onError: (error: any) => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(error.message || "Kunne ikke logge inn.");
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

    // For new registrations, show event type picker first
    if (isRegistering && !showEventTypePicker && selectedEventType === "wedding" && selectedTraditions.length === 0) {
      setShowEventTypePicker(true);
      return;
    }

    // For wedding registrations, show tradition selection
    if (isRegistering && selectedEventType === "wedding" && selectedTraditions.length === 0) {
      setShowTraditionSelection(true);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    loginMutation.mutate();
  };

  const toggleTradition = (key: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTraditions(prev =>
      prev.includes(key) ? prev.filter(t => t !== key) : [...prev, key]
    );
  };

  const handleContinueWithTraditions = () => {
    if (selectedTraditions.length === 0) {
      showToast("Velg minst én tradisjon for å fortsette, eller trykk 'Hopp over' for å gjøre dette senere.");
      return;
    }
    setShowTraditionSelection(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    loginMutation.mutate();
  };

  const handleSkipTraditions = () => {
    setShowTraditionSelection(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    loginMutation.mutate();
  };

  const handleSelectEventType = (eventType: EventType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const config = EVENT_TYPE_CONFIGS[eventType];
    setSelectedEventType(eventType);
    setSelectedEventCategory(config.category);
  };

  const handleContinueWithEventType = () => {
    setShowEventTypePicker(false);
    
    // If wedding, proceed to tradition selection
    if (selectedEventType === "wedding") {
      setShowTraditionSelection(true);
      return;
    }
    
    // For non-wedding events, skip traditions and register directly
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
      showToast(error instanceof Error ? error.message : "Kunne ikke logge inn med Google");
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
          source={require("../../assets/images/Evendi_logo_norsk_tagline.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <ThemedText style={styles.title}>Velkommen til Evendi</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          {isRegistering 
            ? "Opprett konto for å planlegge arrangementet ditt"
            : "Logg inn for å fortsette planleggingen"}
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

              showOptions({
                title: "Leverandør?",
                message: "Leverandører logger inn via leverandør-portalen.",
                cancelLabel: "Avbryt",
                options: [
                  { label: "Gå til leverandør-innlogging", onPress: () => navigation.navigate?.("VendorLogin") },
                ],
              });
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
          Med Evendi får du full kontroll over planleggingen – fra gjesteoversikt og tidslinje til budsjett og leverandørsamtaler.
        </ThemedText>
      </KeyboardAwareScrollViewCompat>

      {/* Event Type Picker Modal */}
      <Modal
        visible={showEventTypePicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowEventTypePicker(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]} edges={['top', 'bottom']}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <ThemedText style={styles.modalTitle}>Hva planlegger du?</ThemedText>
            <ThemedText style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              Vi tilpasser verktøyene basert på type arrangement
            </ThemedText>
          </View>

          <ScrollView 
            style={styles.traditionsScroll}
            contentContainerStyle={styles.traditionsContent}
          >
            {/* Personal Events */}
            <ThemedText style={[styles.eventCategoryHeader, { color: theme.textSecondary }]}>
              Privat
            </ThemedText>
            {getGroupedEventTypes().personal.map((config) => {
              const isSelected = selectedEventType === config.type;
              return (
                <Pressable
                  key={config.type}
                  onPress={() => handleSelectEventType(config.type)}
                  style={[
                    styles.traditionCard,
                    {
                      backgroundColor: isSelected ? Colors.dark.accent + "15" : theme.backgroundDefault,
                      borderColor: isSelected ? Colors.dark.accent : theme.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.traditionHeader}>
                    <ThemedText style={styles.traditionIcon}>{config.icon}</ThemedText>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={[styles.traditionName, { color: theme.text }]}>
                        {config.labelNo}
                      </ThemedText>
                      <ThemedText style={[styles.eventTypeDesc, { color: theme.textSecondary }]}>
                        {config.descriptionNo}
                      </ThemedText>
                    </View>
                  </View>
                  {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: Colors.dark.accent }]}>
                      <Feather name="check" size={16} color="#1A1A1A" />
                    </View>
                  )}
                </Pressable>
              );
            })}

            {/* Corporate Events — grouped by sub-category */}
            <ThemedText style={[styles.eventCategoryHeader, { color: theme.textSecondary, marginTop: Spacing.lg }]}>
              Bedrift & Organisasjon
            </ThemedText>
            {getCorporateGrouped().map((group) => (
              <View key={group.subCategory.key}>
                <ThemedText style={[styles.eventSubCategoryHeader, { color: theme.textMuted }]}>
                  {group.subCategory.labelNo}
                </ThemedText>
                {group.events.map((config) => {
                  const isSelected = selectedEventType === config.type;
                  return (
                    <Pressable
                      key={config.type}
                      onPress={() => handleSelectEventType(config.type)}
                      style={[
                        styles.traditionCard,
                        {
                          backgroundColor: isSelected ? Colors.dark.accent + "15" : theme.backgroundDefault,
                          borderColor: isSelected ? Colors.dark.accent : theme.border,
                          borderWidth: isSelected ? 2 : 1,
                        },
                      ]}
                    >
                      <View style={styles.traditionHeader}>
                        <ThemedText style={styles.traditionIcon}>{config.icon}</ThemedText>
                        <View style={{ flex: 1 }}>
                          <ThemedText style={[styles.traditionName, { color: theme.text }]}>
                            {config.labelNo}
                          </ThemedText>
                          <ThemedText style={[styles.eventTypeDesc, { color: theme.textSecondary }]}>
                            {config.descriptionNo}
                          </ThemedText>
                        </View>
                      </View>
                      {isSelected && (
                        <View style={[styles.checkBadge, { backgroundColor: Colors.dark.accent }]}>
                          <Feather name="check" size={16} color="#1A1A1A" />
                        </View>
                      )}
                    </Pressable>
                  );
                })}
              </View>
            ))}
            {/* Catch-all "Other" corporate event */}
            {(() => {
              const catchAll = getCorporateCatchAll();
              if (!catchAll) return null;
              const isSelected = selectedEventType === catchAll.type;
              return (
                <Pressable
                  onPress={() => handleSelectEventType(catchAll.type)}
                  style={[
                    styles.traditionCard,
                    {
                      backgroundColor: isSelected ? Colors.dark.accent + "15" : theme.backgroundDefault,
                      borderColor: isSelected ? Colors.dark.accent : theme.border,
                      borderWidth: isSelected ? 2 : 1,
                      marginTop: Spacing.sm,
                    },
                  ]}
                >
                  <View style={styles.traditionHeader}>
                    <ThemedText style={styles.traditionIcon}>{catchAll.icon}</ThemedText>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={[styles.traditionName, { color: theme.text }]}>
                        {catchAll.labelNo}
                      </ThemedText>
                      <ThemedText style={[styles.eventTypeDesc, { color: theme.textSecondary }]}>
                        {catchAll.descriptionNo}
                      </ThemedText>
                    </View>
                  </View>
                  {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: Colors.dark.accent }]}>
                      <Feather name="check" size={16} color="#1A1A1A" />
                    </View>
                  )}
                </Pressable>
              );
            })()}
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: theme.border, backgroundColor: theme.backgroundDefault }]}>
            <Pressable
              onPress={() => setShowEventTypePicker(false)}
              style={[styles.skipBtn, { borderColor: theme.border }]}
            >
              <ThemedText style={[styles.skipBtnText, { color: theme.textSecondary }]}>
                Tilbake
              </ThemedText>
            </Pressable>
            
            <Pressable
              onPress={handleContinueWithEventType}
              style={[
                styles.continueBtn,
                { backgroundColor: Colors.dark.accent },
              ]}
            >
              <ThemedText style={[styles.continueBtnText, { color: "#1A1A1A" }]}>
                Fortsett
              </ThemedText>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>

      {/* Tradition Selection Modal */}
      <Modal
        visible={showTraditionSelection}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowTraditionSelection(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]} edges={['top', 'bottom']}>
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
            <ThemedText style={styles.modalTitle}>Velg kulturelle tradisjoner</ThemedText>
            <ThemedText style={[styles.modalSubtitle, { color: theme.textSecondary }]}>
              Vi tilpasser tidslinjen og planleggingen basert på dine valg
            </ThemedText>
          </View>

          <ScrollView 
            style={styles.traditionsScroll}
            contentContainerStyle={styles.traditionsContent}
          >
            {CULTURAL_TRADITIONS.map((tradition) => {
              const isSelected = selectedTraditions.includes(tradition.key);
              return (
                <Pressable
                  key={tradition.key}
                  onPress={() => toggleTradition(tradition.key)}
                  style={[
                    styles.traditionCard,
                    {
                      backgroundColor: isSelected ? tradition.color + "15" : theme.backgroundDefault,
                      borderColor: isSelected ? tradition.color : theme.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <View style={styles.traditionHeader}>
                    <ThemedText style={styles.traditionIcon}>{tradition.icon}</ThemedText>
                    <ThemedText style={[styles.traditionName, { color: theme.text }]}>
                      {tradition.name}
                    </ThemedText>
                  </View>
                  {isSelected && (
                    <View style={[styles.checkBadge, { backgroundColor: tradition.color }]}>
                      <Feather name="check" size={16} color="#FFFFFF" />
                    </View>
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: theme.border, backgroundColor: theme.backgroundDefault }]}>
            <Pressable
              onPress={handleSkipTraditions}
              style={[styles.skipBtn, { borderColor: theme.border }]}
            >
              <ThemedText style={[styles.skipBtnText, { color: theme.textSecondary }]}>
                Hopp over
              </ThemedText>
            </Pressable>
            
            <Pressable
              onPress={handleContinueWithTraditions}
              disabled={selectedTraditions.length === 0}
              style={[
                styles.continueBtn,
                { 
                  backgroundColor: selectedTraditions.length > 0 ? Colors.dark.accent : theme.border,
                  opacity: selectedTraditions.length === 0 ? 0.5 : 1,
                },
              ]}
            >
              <ThemedText style={[styles.continueBtnText, { color: selectedTraditions.length > 0 ? "#1A1A1A" : theme.textMuted }]}>
                Fortsett{selectedTraditions.length > 0 ? ` (${selectedTraditions.length})` : ""}
              </ThemedText>
            </Pressable>
          </View>
        </SafeAreaView>
      </Modal>
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    padding: Spacing.xl,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  modalSubtitle: {
    fontSize: 15,
  },
  traditionsScroll: {
    flex: 1,
  },
  traditionsContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  traditionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  traditionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  traditionIcon: {
    fontSize: 32,
  },
  traditionName: {
    fontSize: 18,
    fontWeight: "600",
  },
  eventTypeDesc: {
    fontSize: 13,
    marginTop: 2,
  },
  eventCategoryHeader: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  eventSubCategoryHeader: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    marginBottom: 6,
    marginTop: Spacing.md,
    paddingLeft: 4,
  },
  checkBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  modalFooter: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderTopWidth: 1,
  },
  skipBtn: {
    flex: 1,
    height: 50,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  skipBtnText: {
    fontSize: 16,
    fontWeight: "600",
  },
  continueBtn: {
    flex: 2,
    height: 50,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  continueBtnText: {
    fontSize: 17,
    fontWeight: "600",
  },
});
