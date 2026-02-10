import React, { useState, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { renderIcon } from "@/lib/custom-icons";

import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl, apiRequest } from "@/lib/query-client";
import { showToast } from "@/lib/toast";

interface BrregEntity {
  organizationNumber: string;
  name: string;
  organizationForm: string | null;
  address: {
    street: string | null;
    postalCode: string | null;
    city: string | null;
    municipality: string | null;
  } | null;
}

interface VendorCategory {
  id: string;
  name: string;
  icon: string;
  description: string | null;
}

interface SubscriptionTier {
  id: string;
  name: string;
  displayName: string;
  description: string | null;
  priceNok: number;
  maxInspirationPhotos: number;
  maxMonthlyVideoMinutes: number;
  hasAdvancedAnalytics: boolean;
  hasPrioritizedSearch: boolean;
  hasCustomLandingPage: boolean;
}

export default function VendorRegistrationScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    organizationNumber: "",
    categoryId: "",
    description: "",
    location: "",
    phone: "",
    website: "",
    priceRange: "",
    tierId: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [brregResults, setBrregResults] = useState<BrregEntity[]>([]);
  const [showBrregDropdown, setShowBrregDropdown] = useState(false);
  const [isSearchingBrreg, setIsSearchingBrreg] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateField = useCallback((field: string, value: string): string => {
    switch (field) {
      case "email":
        if (!value) return "E-postadresse er påkrevd";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Ugyldig e-postadresse";
        return "";
      case "password":
        if (!value) return "Passord er påkrevd";
        if (value.length < 8) return "Passord må være minst 8 tegn";
        return "";
      case "confirmPassword":
        if (!value) return "Bekreft passord er påkrevd";
        if (value !== formData.password) return "Passordene stemmer ikke overens";
        return "";
      case "businessName":
        if (!value) return "Bedriftsnavn er påkrevd";
        if (value.length < 2) return "Bedriftsnavn må være minst 2 tegn";
        return "";
      case "categoryId":
        if (!value) return "Velg en kategori";
        return "";
      case "tierId":
        if (!value) return "Velg et abonnement";
        return "";
      case "phone":
        if (value && !/^[+]?[\d\s-]{8,}$/.test(value)) return "Ugyldig telefonnummer";
        return "";
      case "website":
        if (value && !/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}/.test(value)) return "Ugyldig nettadresse";
        return "";
      default:
        return "";
    }
  }, [formData.password]);

  const handleBlur = useCallback((field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field as keyof typeof formData]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  }, [formData, validateField]);

  const validateAllFields = useCallback(() => {
    const newErrors: Record<string, string> = {};
    const requiredFields = ["email", "password", "confirmPassword", "businessName", "categoryId"];
    
    requiredFields.forEach((field) => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) newErrors[field] = error;
    });

    ["phone", "website"].forEach((field) => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouched(Object.keys(formData).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
    return Object.keys(newErrors).length === 0;
  }, [formData, validateField]);

  const getFieldStyle = useCallback((field: string) => {
    if (touched[field] && errors[field]) {
      return { borderColor: "#DC3545" };
    }
    return {};
  }, [touched, errors]);

  const searchBrreg = useCallback(async (query: string) => {
    if (query.length < 2) {
      setBrregResults([]);
      setShowBrregDropdown(false);
      return;
    }

    setIsSearchingBrreg(true);
    try {
      const url = `${getApiUrl()}/api/brreg/search?q=${encodeURIComponent(query)}`;
      console.log("Searching Brreg:", url);
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error("Brreg API error:", response.status, response.statusText);
        setBrregResults([]);
        setShowBrregDropdown(false);
        return;
      }
      
      const data = await response.json();
      console.log("Brreg results:", data.entities?.length || 0, "entities");
      setBrregResults(data.entities || []);
      setShowBrregDropdown(data.entities?.length > 0);
    } catch (error) {
      console.error("Brreg search error:", error);
      setBrregResults([]);
      setShowBrregDropdown(false);
    } finally {
      setIsSearchingBrreg(false);
    }
  }, []);

  const handleBusinessNameChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, businessName: value }));

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchBrreg(value);
    }, 300);
  }, [searchBrreg]);

  const selectBrregEntity = useCallback((entity: BrregEntity) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const location = entity.address
      ? [entity.address.city, entity.address.municipality].filter(Boolean).join(", ")
      : "";

    setFormData((prev) => ({
      ...prev,
      businessName: entity.name,
      organizationNumber: entity.organizationNumber,
      location: location || prev.location,
    }));
    setBrregResults([]);
    setShowBrregDropdown(false);
  }, []);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<VendorCategory[]>({
    queryKey: ["/api/vendor-categories"],
  });

  const { data: subscriptionTiers = [], isLoading: tiersLoading } = useQuery<SubscriptionTier[]>({
    queryKey: ["/api/subscription/tiers"],
    queryFn: async () => {
      const url = new URL("/api/subscription/tiers", getApiUrl());
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Kunne ikke hente abonnement");
      }
      return response.json();
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { confirmPassword, ...submitData } = data;
      return apiRequest("POST", "/api/vendors/register", {
        ...submitData,
        organizationNumber: submitData.organizationNumber || undefined,
      });
    },
    onSuccess: () => {
      setSubmitted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error: any) => {
      showToast(error.message || "Kunne ikke registrere. Prøv igjen.");
    },
  });

  const handleSubmit = () => {
    if (!validateAllFields()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    registerMutation.mutate(formData);
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <View style={[styles.successContainer, { paddingTop: headerHeight + Spacing.xl }]}>
          <View style={[styles.successIcon, { backgroundColor: Colors.dark.accent + "20" }]}>
            <Feather name="check-circle" size={48} color={Colors.dark.accent} />
          </View>
          <ThemedText style={styles.successTitle}>Søknad mottatt!</ThemedText>
          <ThemedText style={[styles.successText, { color: theme.textSecondary }]}>
            Takk for din registrering. Vi vil gjennomgå søknaden din og kontakte deg når den er behandlet.
          </ThemedText>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/Evendi_logo_norsk_tagline.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>
      <ThemedText style={styles.title}>Bli en Evendi-leverandør</ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        Registrer din bedrift og nå ut til tusenvis av kunder i Skandinavia.
      </ThemedText>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Kontoinformasjon</ThemedText>

        <View>
          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }, getFieldStyle("email")]}>
            <Feather name="mail" size={18} color={touched.email && errors.email ? "#DC3545" : theme.textMuted} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="E-postadresse *"
              placeholderTextColor={theme.textMuted}
              value={formData.email}
              onChangeText={(v) => updateField("email", v)}
              onBlur={() => handleBlur("email")}
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
              placeholder="Passord (min. 8 tegn) *"
              placeholderTextColor={theme.textMuted}
              value={formData.password}
              onChangeText={(v) => updateField("password", v)}
              onBlur={() => handleBlur("password")}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={theme.textMuted} />
            </Pressable>
          </View>
          {touched.password && errors.password ? (
            <ThemedText style={styles.errorText}>{errors.password}</ThemedText>
          ) : null}
        </View>

        <View>
          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }, getFieldStyle("confirmPassword")]}>
            <Feather name="lock" size={18} color={touched.confirmPassword && errors.confirmPassword ? "#DC3545" : theme.textMuted} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Bekreft passord *"
              placeholderTextColor={theme.textMuted}
              value={formData.confirmPassword}
              onChangeText={(v) => updateField("confirmPassword", v)}
              onBlur={() => handleBlur("confirmPassword")}
              secureTextEntry={!showPassword}
            />
          </View>
          {touched.confirmPassword && errors.confirmPassword ? (
            <ThemedText style={styles.errorText}>{errors.confirmPassword}</ThemedText>
          ) : null}
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Bedriftsinformasjon</ThemedText>

        <View style={styles.businessNameContainer}>
          <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <Feather name="briefcase" size={18} color={theme.textMuted} />
            <TextInput
              style={[styles.input, { color: theme.text }]}
              placeholder="Bedriftsnavn (søk i Brønnøysundregistrene) *"
              placeholderTextColor={theme.textMuted}
              value={formData.businessName}
              onChangeText={handleBusinessNameChange}
              onFocus={() => {
                if (brregResults.length > 0) setShowBrregDropdown(true);
              }}
            />
            {isSearchingBrreg ? (
              <ActivityIndicator size="small" color={Colors.dark.accent} />
            ) : null}
          </View>

          {showBrregDropdown && brregResults.length > 0 ? (
            <View style={[styles.brregDropdown, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
              <ScrollView style={{ maxHeight: 200 }}>
                {brregResults.map((entity) => (
                  <Pressable
                    key={entity.organizationNumber}
                    style={[styles.brregItem, { borderBottomColor: theme.border }]}
                    onPress={() => selectBrregEntity(entity)}
                  >
                    <View style={styles.brregItemMain}>
                      <ThemedText style={styles.brregItemName}>{entity.name}</ThemedText>
                      <ThemedText style={[styles.brregItemOrg, { color: theme.textMuted }]}>
                        Org.nr: {entity.organizationNumber}
                      </ThemedText>
                    </View>
                    {entity.address?.city ? (
                      <ThemedText style={[styles.brregItemLocation, { color: theme.textSecondary }]}>
                        {entity.address.city}
                      </ThemedText>
                    ) : null}
                  </Pressable>
                ))}
              </ScrollView>
              <Pressable
                style={styles.brregCloseBtn}
                onPress={() => setShowBrregDropdown(false)}
              >
                <ThemedText style={[styles.brregCloseText, { color: theme.textMuted }]}>Lukk</ThemedText>
              </Pressable>
            </View>
          ) : null}
        </View>

        {formData.organizationNumber ? (
          <View style={[styles.orgNumberBadge, { backgroundColor: Colors.dark.accent + "20", borderColor: Colors.dark.accent }]}>
            <Feather name="check-circle" size={14} color={Colors.dark.accent} />
            <ThemedText style={[styles.orgNumberText, { color: Colors.dark.accent }]}>
              Org.nr: {formData.organizationNumber}
            </ThemedText>
          </View>
        ) : null}

        <ThemedText style={[styles.label, { color: theme.textSecondary }]}>Velg kategori *</ThemedText>
        {categoriesLoading ? (
          <ActivityIndicator color={Colors.dark.accent} />
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => {
                  updateField("categoryId", cat.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: formData.categoryId === cat.id ? Colors.dark.accent : theme.backgroundDefault,
                    borderColor: formData.categoryId === cat.id ? Colors.dark.accent : theme.border,
                  },
                ]}
              >
                {renderIcon(
                  cat.icon || "briefcase",
                  formData.categoryId === cat.id ? "#1A1A1A" : theme.textSecondary,
                  16,
                )}
                <ThemedText
                  style={[
                    styles.categoryText,
                    { color: formData.categoryId === cat.id ? "#1A1A1A" : theme.text },
                  ]}
                >
                  {cat.name}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Subscription Tier Selection */}
        <ThemedText style={[styles.label, { color: theme.textSecondary, marginTop: Spacing.lg }]}>
          Velg hvilket abonnement som passer deg *
        </ThemedText>
        <ThemedText style={[styles.trialInfo, { color: Colors.dark.accent }]}>
          🎉 30 dager gratis prøveperiode - ingen binding!
        </ThemedText>
        {tiersLoading ? (
          <ActivityIndicator color={Colors.dark.accent} />
        ) : (
          <View style={styles.tiersContainer}>
            {subscriptionTiers.map((tier) => (
              <Pressable
                key={tier.id}
                onPress={() => {
                  updateField("tierId", tier.id);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.tierCard,
                  {
                    backgroundColor: formData.tierId === tier.id ? Colors.dark.accent + "15" : theme.backgroundDefault,
                    borderColor: formData.tierId === tier.id ? Colors.dark.accent : theme.border,
                    borderWidth: 2,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <View style={styles.tierHeader}>
                    <ThemedText style={styles.tierName}>{tier.displayName}</ThemedText>
                    {formData.tierId === tier.id && (
                      <Feather name="check-circle" size={20} color={Colors.dark.accent} />
                    )}
                  </View>
                  {tier.description && (
                    <ThemedText style={[styles.tierDescription, { color: theme.textSecondary }]}>
                      {tier.description}
                    </ThemedText>
                  )}
                  <ThemedText style={[styles.tierPrice, { color: Colors.dark.accent }]}>
                    {tier.priceNok} NOK/mnd
                  </ThemedText>
                  <View style={styles.tierFeatures}>
                    {tier.maxInspirationPhotos > 0 && (
                      <View style={styles.featureRow}>
                        <Feather name="image" size={14} color={theme.textSecondary} />
                        <ThemedText style={[styles.featureText, { color: theme.textSecondary }]}>
                          {tier.maxInspirationPhotos === -1 ? "Ubegrensede" : tier.maxInspirationPhotos} bilder
                        </ThemedText>
                      </View>
                    )}
                    {tier.hasAdvancedAnalytics && (
                      <View style={styles.featureRow}>
                        <Feather name="bar-chart-2" size={14} color={theme.textSecondary} />
                        <ThemedText style={[styles.featureText, { color: theme.textSecondary }]}>
                          Avansert analyse
                        </ThemedText>
                      </View>
                    )}
                    {tier.hasPrioritizedSearch && (
                      <View style={styles.featureRow}>
                        <Feather name="star" size={14} color={theme.textSecondary} />
                        <ThemedText style={[styles.featureText, { color: theme.textSecondary }]}>
                          Prioritert søk
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
        {touched.tierId && errors.tierId ? (
          <View style={styles.errorContainer}>
            <Feather name="alert-circle" size={14} color="#EF5350" />
            <ThemedText style={styles.errorText}>{errors.tierId}</ThemedText>
          </View>
        ) : null}

        <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <Feather name="map-pin" size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Sted (f.eks. Oslo, Norge)"
            placeholderTextColor={theme.textMuted}
            value={formData.location}
            onChangeText={(v) => updateField("location", v)}
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <Feather name="phone" size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Telefonnummer"
            placeholderTextColor={theme.textMuted}
            value={formData.phone}
            onChangeText={(v) => updateField("phone", v)}
            keyboardType="phone-pad"
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <Feather name="globe" size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Nettside (valgfritt)"
            placeholderTextColor={theme.textMuted}
            value={formData.website}
            onChangeText={(v) => updateField("website", v)}
            keyboardType="url"
            autoCapitalize="none"
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <Feather name="dollar-sign" size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Prisklasse (f.eks. 20 000 - 40 000 kr)"
            placeholderTextColor={theme.textMuted}
            value={formData.priceRange}
            onChangeText={(v) => updateField("priceRange", v)}
          />
        </View>

        <View style={[styles.textAreaContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <TextInput
            style={[styles.textArea, { color: theme.text }]}
            placeholder="Beskriv din bedrift og tjenester..."
            placeholderTextColor={theme.textMuted}
            value={formData.description}
            onChangeText={(v) => updateField("description", v)}
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      <Pressable
        onPress={handleSubmit}
        disabled={registerMutation.isPending}
        style={[
          styles.submitButton,
          { backgroundColor: Colors.dark.accent, opacity: registerMutation.isPending ? 0.7 : 1 },
        ]}
      >
        {registerMutation.isPending ? (
          <ActivityIndicator color="#1A1A1A" />
        ) : (
          <>
            <ThemedText style={styles.submitText}>Send søknad</ThemedText>
            <Feather name="arrow-right" size={20} color="#1A1A1A" />
          </>
        )}
      </Pressable>

      <ThemedText style={[styles.disclaimer, { color: theme.textMuted }]}>
        Ved å registrere deg godtar du våre vilkår og retningslinjer for leverandører.
      </ThemedText>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  logoContainer: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  logo: {
    width: 480,
    height: 160,
  },
  successContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: Spacing.xl,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.xl,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  successText: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 50,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  input: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
  textAreaContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  textArea: {
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
  },
  categoriesScroll: {
    marginBottom: Spacing.md,
    marginHorizontal: -Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: Spacing.xs,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  submitText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  disclaimer: {
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },
  businessNameContainer: {
    position: "relative",
    zIndex: 1000,
    marginBottom: Spacing.md,
  },
  brregDropdown: {
    position: "absolute",
    top: 54,
    left: 0,
    right: 0,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    maxHeight: 250,
    zIndex: 1001,
    elevation: 5,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
  },
  brregItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  brregItemMain: {
    flex: 1,
  },
  brregItemName: {
    fontSize: 15,
    fontWeight: "500",
  },
  brregItemOrg: {
    fontSize: 12,
    marginTop: 2,
  },
  brregItemLocation: {
    fontSize: 13,
    marginLeft: Spacing.sm,
  },
  brregCloseBtn: {
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  brregCloseText: {
    fontSize: 13,
  },
  orgNumberBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignSelf: "flex-start",
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  orgNumberText: {
    fontSize: 13,
    fontWeight: "500",
  },
  errorText: {
    fontSize: 12,
    color: "#DC3545",
    marginTop: 4,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  trialInfo: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  tiersContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  tierCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  tierHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  tierName: {
    fontSize: 18,
    fontWeight: "700",
  },
  tierDescription: {
    fontSize: 14,
    marginBottom: Spacing.sm,
  },
  tierPrice: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  tierFeatures: {
    gap: Spacing.xs,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  featureText: {
    fontSize: 13,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
});
