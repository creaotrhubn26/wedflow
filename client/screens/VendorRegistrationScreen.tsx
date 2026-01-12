import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";

import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl, apiRequest } from "@/lib/query-client";

interface VendorCategory {
  id: string;
  name: string;
  icon: string;
  description: string | null;
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
    categoryId: "",
    description: "",
    location: "",
    phone: "",
    website: "",
    priceRange: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { data: categories = [], isLoading: categoriesLoading } = useQuery<VendorCategory[]>({
    queryKey: ["/api/vendor-categories"],
  });

  const registerMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { confirmPassword, ...submitData } = data;
      return apiRequest("POST", "/api/vendors/register", submitData);
    },
    onSuccess: () => {
      setSubmitted(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    onError: (error: any) => {
      Alert.alert("Feil", error.message || "Kunne ikke registrere. Prøv igjen.");
    },
  });

  const handleSubmit = () => {
    if (!formData.email || !formData.password || !formData.businessName || !formData.categoryId) {
      Alert.alert("Mangler informasjon", "Fyll ut alle påkrevde felt.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert("Feil", "Passordene stemmer ikke overens.");
      return;
    }

    if (formData.password.length < 8) {
      Alert.alert("Feil", "Passord må være minst 8 tegn.");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    registerMutation.mutate(formData);
  };

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getIconName = (iconName: string): keyof typeof Feather.glyphMap => {
    const iconMap: Record<string, keyof typeof Feather.glyphMap> = {
      camera: "camera",
      video: "video",
      flower: "sun",
      utensils: "coffee",
      music: "music",
      home: "home",
      cake: "gift",
      clipboard: "clipboard",
      scissors: "scissors",
      car: "truck",
    };
    return iconMap[iconName] || "briefcase";
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
      <ThemedText style={styles.title}>Bli en Wedflow-leverandør</ThemedText>
      <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
        Registrer din bedrift og nå ut til tusenvis av brudepar i Skandinavia.
      </ThemedText>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Kontoinformasjon</ThemedText>

        <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <Feather name="mail" size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="E-postadresse *"
            placeholderTextColor={theme.textMuted}
            value={formData.email}
            onChangeText={(v) => updateField("email", v)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <Feather name="lock" size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Passord (min. 8 tegn) *"
            placeholderTextColor={theme.textMuted}
            value={formData.password}
            onChangeText={(v) => updateField("password", v)}
            secureTextEntry={!showPassword}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)}>
            <Feather name={showPassword ? "eye-off" : "eye"} size={18} color={theme.textMuted} />
          </Pressable>
        </View>

        <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <Feather name="lock" size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Bekreft passord *"
            placeholderTextColor={theme.textMuted}
            value={formData.confirmPassword}
            onChangeText={(v) => updateField("confirmPassword", v)}
            secureTextEntry={!showPassword}
          />
        </View>
      </View>

      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Bedriftsinformasjon</ThemedText>

        <View style={[styles.inputContainer, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <Feather name="briefcase" size={18} color={theme.textMuted} />
          <TextInput
            style={[styles.input, { color: theme.text }]}
            placeholder="Bedriftsnavn *"
            placeholderTextColor={theme.textMuted}
            value={formData.businessName}
            onChangeText={(v) => updateField("businessName", v)}
          />
        </View>

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
                <Feather
                  name={getIconName(cat.icon)}
                  size={16}
                  color={formData.categoryId === cat.id ? "#1A1A1A" : theme.textSecondary}
                />
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
});
