import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl, apiRequest } from "@/lib/query-client";
import { getVendorSession } from "@/lib/storage";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";

interface InspirationCategory {
  id: string;
  name: string;
  icon: string;
  sortOrder: number | null;
}

interface MediaItem {
  type: "image" | "video";
  url: string;
  caption: string;
}

export default function InspirationCreateScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([{ type: "image", url: "", caption: "" }]);
  const [priceSummary, setPriceSummary] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [ctaLabel, setCtaLabel] = useState("");
  const [ctaUrl, setCtaUrl] = useState("");
  const [allowInquiryForm, setAllowInquiryForm] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  const { data: categories = [], isLoading: loadingCategories } = useQuery<InspirationCategory[]>({
    queryKey: ["/api/vendor/allowed-categories"],
    queryFn: async () => {
      const session = await getVendorSession();
      if (!session?.sessionToken) throw new Error("Ikke innlogget");
      const url = new URL("/api/vendor/allowed-categories", getApiUrl());
      const response = await fetch(url.toString(), {
        headers: { Authorization: `Bearer ${session.sessionToken}` },
      });
      if (!response.ok) throw new Error("Kunne ikke hente kategorier");
      return response.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const session = await getVendorSession();
      if (!session?.sessionToken) throw new Error("Ikke innlogget");
      const url = new URL("/api/vendor/inspirations", getApiUrl());
      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.sessionToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Kunne ikke opprette");
      }
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/inspirations"] });
      Alert.alert("Suksess!", "Inspirasjonen er sendt til godkjenning.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    },
    onError: (error: Error) => {
      Alert.alert("Feil", error.message);
    },
  });

  const handleAddMedia = () => {
    setMediaItems([...mediaItems, { type: "image", url: "", caption: "" }]);
  };

  const handleRemoveMedia = (index: number) => {
    if (mediaItems.length > 1) {
      setMediaItems(mediaItems.filter((_, i) => i !== index));
    }
  };

  const handleUpdateMedia = (index: number, field: keyof MediaItem, value: string) => {
    const updated = [...mediaItems];
    updated[index] = { ...updated[index], [field]: value };
    setMediaItems(updated);
  };

  const handleSubmit = () => {
    if (!selectedCategory) {
      Alert.alert("Mangler kategori", "Velg en kategori for inspirasjonen.");
      return;
    }
    if (!title.trim()) {
      Alert.alert("Mangler tittel", "Skriv inn en tittel.");
      return;
    }
    const validMedia = mediaItems.filter((m) => m.url.trim());
    if (validMedia.length === 0) {
      Alert.alert("Mangler media", "Legg til minst ett bilde eller video.");
      return;
    }

    const data: any = {
      categoryId: selectedCategory,
      title: title.trim(),
      description: description.trim() || undefined,
      media: validMedia.map((m) => ({
        type: m.type,
        url: m.url.trim(),
        caption: m.caption.trim() || undefined,
      })),
      allowInquiryForm,
    };

    if (priceSummary.trim()) data.priceSummary = priceSummary.trim();
    if (priceMin) data.priceMin = parseInt(priceMin, 10);
    if (priceMax) data.priceMax = parseInt(priceMax, 10);
    if (websiteUrl.trim()) data.websiteUrl = websiteUrl.trim();
    if (inquiryEmail.trim()) data.inquiryEmail = inquiryEmail.trim();
    if (inquiryPhone.trim()) data.inquiryPhone = inquiryPhone.trim();
    if (ctaLabel.trim()) data.ctaLabel = ctaLabel.trim();
    if (ctaUrl.trim()) data.ctaUrl = ctaUrl.trim();

    createMutation.mutate(data);
  };

  return (
    <KeyboardAwareScrollViewCompat
      style={[styles.container, { backgroundColor: theme.backgroundRoot }]}
      contentContainerStyle={{
        paddingTop: headerHeight + Spacing.lg,
        paddingBottom: insets.bottom + Spacing.xl,
        paddingHorizontal: Spacing.lg,
      }}
    >
      <ThemedText style={styles.sectionTitle}>Kategori</ThemedText>
      {loadingCategories ? (
        <ActivityIndicator size="small" color={Colors.dark.accent} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => {
                setSelectedCategory(cat.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    selectedCategory === cat.id ? Colors.dark.accent : theme.backgroundDefault,
                  borderColor: selectedCategory === cat.id ? Colors.dark.accent : theme.border,
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.categoryChipText,
                  { color: selectedCategory === cat.id ? "#1A1A1A" : theme.text },
                ]}
              >
                {cat.name}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <ThemedText style={styles.sectionTitle}>Tittel</ThemedText>
      <TextInput
        style={[styles.input, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
        value={title}
        onChangeText={setTitle}
        placeholder="F.eks. Romantisk hagebryllup"
        placeholderTextColor={theme.textMuted}
      />

      <ThemedText style={styles.sectionTitle}>Beskrivelse (valgfritt)</ThemedText>
      <TextInput
        style={[styles.textArea, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, color: theme.text }]}
        value={description}
        onChangeText={setDescription}
        placeholder="Beskriv inspirasjonen..."
        placeholderTextColor={theme.textMuted}
        multiline
        numberOfLines={3}
      />

      <ThemedText style={styles.sectionTitle}>Media</ThemedText>
      {mediaItems.map((item, index) => (
        <View key={index} style={[styles.mediaRow, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.mediaHeader}>
            <View style={styles.mediaTypeToggle}>
              <Pressable
                onPress={() => handleUpdateMedia(index, "type", "image")}
                style={[
                  styles.mediaTypeBtn,
                  {
                    backgroundColor: item.type === "image" ? Colors.dark.accent : "transparent",
                  },
                ]}
              >
                <Feather name="image" size={14} color={item.type === "image" ? "#1A1A1A" : theme.textMuted} />
              </Pressable>
              <Pressable
                onPress={() => handleUpdateMedia(index, "type", "video")}
                style={[
                  styles.mediaTypeBtn,
                  {
                    backgroundColor: item.type === "video" ? Colors.dark.accent : "transparent",
                  },
                ]}
              >
                <Feather name="video" size={14} color={item.type === "video" ? "#1A1A1A" : theme.textMuted} />
              </Pressable>
            </View>
            {mediaItems.length > 1 ? (
              <Pressable onPress={() => handleRemoveMedia(index)}>
                <Feather name="trash-2" size={18} color="#EF5350" />
              </Pressable>
            ) : null}
          </View>
          <TextInput
            style={[styles.mediaInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
            value={item.url}
            onChangeText={(val) => handleUpdateMedia(index, "url", val)}
            placeholder={item.type === "image" ? "Bilde-URL" : "Video-URL"}
            placeholderTextColor={theme.textMuted}
            autoCapitalize="none"
          />
          <TextInput
            style={[styles.mediaInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
            value={item.caption}
            onChangeText={(val) => handleUpdateMedia(index, "caption", val)}
            placeholder="Bildetekst (valgfritt)"
            placeholderTextColor={theme.textMuted}
          />
        </View>
      ))}
      <Pressable onPress={handleAddMedia} style={[styles.addMediaBtn, { borderColor: theme.border }]}>
        <Feather name="plus" size={18} color={Colors.dark.accent} />
        <ThemedText style={[styles.addMediaText, { color: Colors.dark.accent }]}>Legg til media</ThemedText>
      </Pressable>

      <Pressable
        onPress={() => setShowPricing(!showPricing)}
        style={[styles.toggleSection, { borderColor: theme.border }]}
      >
        <View style={styles.toggleHeader}>
          <Feather name="tag" size={18} color={Colors.dark.accent} />
          <ThemedText style={styles.toggleTitle}>Pris og kontakt</ThemedText>
        </View>
        <Feather name={showPricing ? "chevron-up" : "chevron-down"} size={20} color={theme.textMuted} />
      </Pressable>

      {showPricing ? (
        <View style={[styles.pricingSection, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <ThemedText style={styles.fieldLabel}>Prissammendrag</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border, color: theme.text }]}
            value={priceSummary}
            onChangeText={setPriceSummary}
            placeholder="F.eks. Fra 15 000 kr"
            placeholderTextColor={theme.textMuted}
          />

          <View style={styles.priceRow}>
            <View style={styles.priceField}>
              <ThemedText style={styles.fieldLabel}>Min. pris (kr)</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border, color: theme.text }]}
                value={priceMin}
                onChangeText={setPriceMin}
                placeholder="10000"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.priceField}>
              <ThemedText style={styles.fieldLabel}>Maks. pris (kr)</ThemedText>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border, color: theme.text }]}
                value={priceMax}
                onChangeText={setPriceMax}
                placeholder="50000"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
              />
            </View>
          </View>

          <ThemedText style={styles.fieldLabel}>Nettside</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border, color: theme.text }]}
            value={websiteUrl}
            onChangeText={setWebsiteUrl}
            placeholder="https://din-nettside.no"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="none"
            keyboardType="url"
          />

          <ThemedText style={styles.fieldLabel}>E-post for henvendelser</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border, color: theme.text }]}
            value={inquiryEmail}
            onChangeText={setInquiryEmail}
            placeholder="kontakt@bedrift.no"
            placeholderTextColor={theme.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <ThemedText style={styles.fieldLabel}>Telefon</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border, color: theme.text }]}
            value={inquiryPhone}
            onChangeText={setInquiryPhone}
            placeholder="+47 123 45 678"
            placeholderTextColor={theme.textMuted}
            keyboardType="phone-pad"
          />

          <ThemedText style={styles.fieldLabel}>Handlingsknapp</ThemedText>
          <View style={styles.priceRow}>
            <View style={styles.priceField}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border, color: theme.text }]}
                value={ctaLabel}
                onChangeText={setCtaLabel}
                placeholder="Bestill time"
                placeholderTextColor={theme.textMuted}
              />
            </View>
            <View style={styles.priceField}>
              <TextInput
                style={[styles.input, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border, color: theme.text }]}
                value={ctaUrl}
                onChangeText={setCtaUrl}
                placeholder="https://..."
                placeholderTextColor={theme.textMuted}
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={[styles.switchRow, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
            <View style={styles.switchInfo}>
              <Feather name="mail" size={18} color={Colors.dark.accent} />
              <View>
                <ThemedText style={styles.switchLabel}>Tillat kontaktskjema</ThemedText>
                <ThemedText style={[styles.switchDesc, { color: theme.textMuted }]}>
                  Brudepar kan sende deg forespørsler
                </ThemedText>
              </View>
            </View>
            <Switch
              value={allowInquiryForm}
              onValueChange={setAllowInquiryForm}
              trackColor={{ false: theme.border, true: Colors.dark.accent }}
              thumbColor="#fff"
            />
          </View>
        </View>
      ) : null}

      <Pressable
        onPress={handleSubmit}
        disabled={createMutation.isPending}
        style={[styles.submitBtn, { backgroundColor: Colors.dark.accent, opacity: createMutation.isPending ? 0.6 : 1 }]}
      >
        {createMutation.isPending ? (
          <ActivityIndicator size="small" color="#1A1A1A" />
        ) : (
          <>
            <Feather name="send" size={18} color="#1A1A1A" />
            <ThemedText style={styles.submitBtnText}>Send til godkjenning</ThemedText>
          </>
        )}
      </Pressable>
    </KeyboardAwareScrollViewCompat>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  categoriesScroll: {
    marginHorizontal: -Spacing.lg,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    height: 48,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
  },
  textArea: {
    minHeight: 80,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    fontSize: 15,
    textAlignVertical: "top",
  },
  mediaRow: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  mediaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  mediaTypeToggle: {
    flexDirection: "row",
    gap: 4,
  },
  mediaTypeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  mediaInput: {
    height: 40,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    fontSize: 14,
    marginBottom: Spacing.xs,
  },
  addMediaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  addMediaText: {
    fontSize: 14,
    fontWeight: "500",
  },
  toggleSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Spacing.md,
    marginTop: Spacing.xl,
    borderTopWidth: 1,
  },
  toggleHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  pricingSection: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  priceRow: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  priceField: {
    flex: 1,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  switchInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  switchDesc: {
    fontSize: 12,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
});
