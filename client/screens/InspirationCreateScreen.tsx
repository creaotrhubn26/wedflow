import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Switch,
  Image,
  Platform,
  Modal,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { EvendiIcon } from "@/components/EvendiIcon";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useEventType } from "@/hooks/useEventType";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl, apiRequest } from "@/lib/query-client";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { showToast } from "@/lib/toast";
import { showConfirm, showOptions } from "@/lib/dialogs";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

async function getVendorSession(): Promise<{ sessionToken: string } | null> {
  const data = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
  return data ? JSON.parse(data) : null;
}

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

type RouteParams = {
  params: { inspiration?: any };
};

export default function InspirationCreateScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { isWedding } = useEventType();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, "params">>();
  const queryClient = useQueryClient();
  
  const editingInspiration = route.params?.inspiration;
  const isEditMode = !!editingInspiration;

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
  const [showGoogleDriveHelp, setShowGoogleDriveHelp] = useState(false);

  // Pre-fill form when editing
  useEffect(() => {
    if (editingInspiration) {
      setSelectedCategory(editingInspiration.categoryId || editingInspiration.category?.id || "");
      setTitle(editingInspiration.title || "");
      setDescription(editingInspiration.description || "");
      setPriceSummary(editingInspiration.priceSummary || "");
      setPriceMin(editingInspiration.priceMin ? String(editingInspiration.priceMin) : "");
      setPriceMax(editingInspiration.priceMax ? String(editingInspiration.priceMax) : "");
      setWebsiteUrl(editingInspiration.websiteUrl || "");
      setInquiryEmail(editingInspiration.inquiryEmail || "");
      setInquiryPhone(editingInspiration.inquiryPhone || "");
      setCtaLabel(editingInspiration.ctaLabel || "");
      setCtaUrl(editingInspiration.ctaUrl || "");
      setAllowInquiryForm(editingInspiration.allowInquiryForm || false);
      setShowPricing(!!(editingInspiration.priceSummary || editingInspiration.priceMin || editingInspiration.priceMax));
      
      if (editingInspiration.media && editingInspiration.media.length > 0) {
        setMediaItems(editingInspiration.media.map((m: any) => ({
          type: m.type || "image",
          url: m.url || "",
          caption: m.caption || "",
        })));
      }
    }
  }, [editingInspiration]);

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

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const session = await getVendorSession();
      if (!session?.sessionToken) throw new Error("Ikke innlogget");
      
      const url = isEditMode 
        ? new URL(`/api/vendor/inspirations/${editingInspiration.id}`, getApiUrl())
        : new URL("/api/vendor/inspirations", getApiUrl());
        
      const response = await fetch(url.toString(), {
        method: isEditMode ? "PATCH" : "POST",
        headers: {
          Authorization: `Bearer ${session.sessionToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || (isEditMode ? "Kunne ikke oppdatere" : "Kunne ikke opprette"));
      }
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/inspirations"] });
      showToast(
        isEditMode
          ? "Showcasen er oppdatert og sendt til godkjenning."
          : "Showcasen er sendt til godkjenning."
      );
      navigation.goBack();
    },
    onError: (error: Error) => {
      showToast(error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const session = await getVendorSession();
      if (!session?.sessionToken) throw new Error("Ikke innlogget");

      const response = await fetch(
        new URL(`/api/vendor/inspirations/${editingInspiration.id}`, getApiUrl()).toString(),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.sessionToken}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kunne ikke slette showcase");
      }

      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/inspirations"] });
      navigation.goBack();
    },
    onError: (error: Error) => {
      showToast(error.message);
    },
  });

  const handleDelete = () => {
    showConfirm({
      title: "Slett showcase",
      message: `Er du sikker på at du vil slette "${title}"?`,
      confirmLabel: "Slett",
      cancelLabel: "Avbryt",
      destructive: true,
    }).then((confirmed) => {
      if (confirmed) deleteMutation.mutate();
    });
  };

  const handleAddMedia = () => {
    setMediaItems([...mediaItems, { type: "image", url: "", caption: "" }]);
  };

  // Convert Google Drive share links to direct image URLs
  const convertGoogleDriveUrl = (url: string): string => {
    // Match Google Drive file links
    // Format: https://drive.google.com/file/d/FILE_ID/view?usp=sharing
    // Or: https://drive.google.com/open?id=FILE_ID
    const fileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    const openMatch = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
    
    const fileId = fileMatch?.[1] || openMatch?.[1];
    
    if (fileId) {
      // Convert to direct image URL
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    
    // Already a direct link or not a Google Drive link
    return url;
  };

  const handlePickImage = async (index: number) => {
    const choice = await showOptions({
      title: "Legg til bilde",
      message: "Velg hvordan du vil legge til bildet:",
      options: [
        { label: "Google Drive" },
        { label: "Fra galleri" },
      ],
      cancelLabel: "Avbryt",
    });

    if (choice === 0) {
      showToast(
        "1. Åpne Google Drive\n" +
        "2. Høyreklikk på bildet → Del\n" +
        "3. Endre til 'Alle med lenken'\n" +
        "4. Kopier lenken\n" +
        "5. Lim inn i URL-feltet\n\n" +
        "Lenken konverteres automatisk til bildevisning!"
      );
      return;
    }

    if (choice !== 1) return;

    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        showToast("Vi trenger tilgang til bildegalleriet.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        showToast("Last opp bildet til Google Drive eller imgbb.com, og lim inn lenken i URL-feltet.");
      }
    } catch (error) {
      console.error("Error picking image:", error);
      showToast("Kunne ikke velge bilde");
    }
  };

  const handleRemoveMedia = (index: number) => {
    if (mediaItems.length > 1) {
      setMediaItems(mediaItems.filter((_, i) => i !== index));
    }
  };

  const handleUpdateMedia = (index: number, field: keyof MediaItem, value: string) => {
    const updated = [...mediaItems];
    
    // Auto-convert Google Drive URLs when pasting
    if (field === "url" && value.includes("drive.google.com")) {
      value = convertGoogleDriveUrl(value);
    }
    
    updated[index] = { ...updated[index], [field]: value };
    setMediaItems(updated);
  };

  const handleSubmit = () => {
    if (!selectedCategory) {
      showToast("Velg en kategori for showcasen.");
      return;
    }
    if (!title.trim()) {
      showToast("Skriv inn en tittel.");
      return;
    }
    const validMedia = mediaItems.filter((m) => m.url.trim());
    if (validMedia.length === 0) {
      showToast("Legg til minst ett bilde eller video.");
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

    saveMutation.mutate(data);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md, backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <View style={[styles.headerIconCircle, { backgroundColor: theme.accent }]}>
            <EvendiIcon name="image" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.headerTextContainer}>
            <ThemedText style={[styles.headerTitle, { color: theme.text }]}>
              {isEditMode ? "Rediger showcase" : "Ny showcase"}
            </ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              {isEditMode ? "Oppdater showcase-info" : "Vis frem ditt arbeid"}
            </ThemedText>
          </View>
        </View>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [
            styles.closeButton,
            { backgroundColor: pressed ? theme.backgroundSecondary : theme.backgroundRoot },
          ]}
        >
          <EvendiIcon name="x" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>
      <KeyboardAwareScrollViewCompat
        style={{ flex: 1, zIndex: 1 }}
        contentContainerStyle={{
          paddingTop: Spacing.lg,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
      >
        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: theme.accent + "15" }]}>
              <EvendiIcon name="grid" size={16} color={theme.accent} />
            </View>
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Kategori</ThemedText>
          </View>
          {loadingCategories ? (
            <ActivityIndicator size="small" color={theme.accent} />
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
                  style={[{
                    paddingHorizontal: Spacing.md,
                    paddingVertical: Spacing.sm,
                    borderRadius: BorderRadius.full,
                    borderWidth: selectedCategory === cat.id ? 0 : 1,
                    backgroundColor: selectedCategory === cat.id ? theme.accent : theme.backgroundRoot,
                    borderColor: theme.border,
                  }]}
                >
                  <ThemedText
                    style={[{
                      fontSize: 14,
                      fontWeight: "600",
                      color: selectedCategory === cat.id ? "#FFFFFF" : theme.text,
                    }]}
                  >
                    {cat.name}
                  </ThemedText>
                </Pressable>
              ))}
            </ScrollView>
          )}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: theme.accent + "15" }]}>
              <EvendiIcon name="edit-3" size={16} color={theme.accent} />
            </View>
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Detaljer</ThemedText>
          </View>
          
          <ThemedText style={[styles.fieldLabel, { color: theme.textMuted }]}>Tittel</ThemedText>
          <TextInput
            style={[styles.input, { backgroundColor: theme.backgroundRoot, borderColor: theme.border, color: theme.text }]}
            value={title}
            onChangeText={setTitle}
            placeholder={isWedding ? "F.eks. Romantisk hagebryllup" : "F.eks. Sommerkonferanse 2026"}
            placeholderTextColor={theme.textMuted}
          />

          <ThemedText style={[styles.fieldLabel, { color: theme.textMuted, marginTop: Spacing.md }]}>Beskrivelse (valgfritt)</ThemedText>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.backgroundRoot, borderColor: theme.border, color: theme.text }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Beskriv showcasen..."
            placeholderTextColor={theme.textMuted}
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: theme.accent + "15" }]}>
              <EvendiIcon name="film" size={16} color={theme.accent} />
            </View>
            <ThemedText style={[styles.sectionTitle, { color: theme.text }]}>Media</ThemedText>
          </View>
          
          {mediaItems.map((item, index) => (
            <View key={index} style={[styles.mediaRow, { backgroundColor: theme.backgroundRoot, borderColor: theme.border }]}>
              {/* Image Preview */}
              {item.type === "image" && item.url ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: item.url }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                </View>
              ) : null}
              
              <View style={styles.mediaHeader}>
                <View style={styles.mediaTypeToggle}>
                  <Pressable
                    onPress={() => handleUpdateMedia(index, "type", "image")}
                    style={[{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: item.type === "image" ? theme.accent : "transparent",
                    }]}
                  >
                    <EvendiIcon name="image" size={16} color={item.type === "image" ? "#FFFFFF" : theme.textMuted} />
                  </Pressable>
                  <Pressable
                    onPress={() => handleUpdateMedia(index, "type", "video")}
                    style={[{
                      width: 36,
                      height: 36,
                      borderRadius: 18,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: item.type === "video" ? theme.accent : "transparent",
                    }]}
                  >
                    <EvendiIcon name="video" size={16} color={item.type === "video" ? "#FFFFFF" : theme.textMuted} />
                  </Pressable>
                </View>
                <View style={styles.mediaActions}>
                  {item.type === "image" && Platform.OS !== "web" ? (
                    <Pressable 
                      onPress={() => handlePickImage(index)}
                      style={[styles.pickImageBtn, { backgroundColor: theme.accent + "15" }]}
                    >
                      <EvendiIcon name="upload" size={16} color={theme.accent} />
                    </Pressable>
                  ) : null}
                  {mediaItems.length > 1 ? (
                    <Pressable 
                      onPress={() => handleRemoveMedia(index)}
                      style={[styles.removeMediaBtn, { backgroundColor: "#EF535015" }]}
                    >
                      <EvendiIcon name="trash-2" size={16} color="#EF5350" />
                    </Pressable>
                  ) : null}
                </View>
              </View>
              <TextInput
                style={[styles.mediaInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={item.url}
                onChangeText={(val) => handleUpdateMedia(index, "url", val)}
                placeholder={item.type === "image" ? "Google Drive eller bilde-URL" : "Video-URL (YouTube, Vimeo)"}
                placeholderTextColor={theme.textMuted}
                autoCapitalize="none"
              />
              {/* Google Drive hint with help button */}
              {item.type === "image" && !item.url ? (
                <View style={styles.urlHintRow}>
                  <ThemedText style={[styles.urlHint, { color: theme.textMuted }]}>
                    💡 Lim inn Google Drive-lenke – konverteres automatisk!
                  </ThemedText>
                  <Pressable 
                    onPress={() => setShowGoogleDriveHelp(true)}
                    style={[styles.helpBtn, { backgroundColor: theme.accent + "15" }]}
                  >
                    <EvendiIcon name="help-circle" size={14} color={theme.accent} />
                  </Pressable>
                </View>
              ) : null}
              <TextInput
                style={[styles.mediaInput, { backgroundColor: theme.backgroundSecondary, color: theme.text }]}
                value={item.caption}
                onChangeText={(val) => handleUpdateMedia(index, "caption", val)}
                placeholder="Bildetekst (valgfritt)"
                placeholderTextColor={theme.textMuted}
              />
            </View>
          ))}
          <Pressable 
            onPress={handleAddMedia} 
            style={({ pressed }) => [
              styles.addMediaBtn, 
              { 
                borderColor: theme.border,
                backgroundColor: pressed ? theme.accent + "10" : "transparent",
              }
            ]}
          >
            <EvendiIcon name="plus" size={18} color={theme.accent} />
            <ThemedText style={[styles.addMediaText, { color: theme.accent }]}>Legg til media</ThemedText>
          </Pressable>
        </View>

        <Pressable
          onPress={() => setShowPricing(!showPricing)}
          style={[styles.toggleSection, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          <View style={styles.toggleHeader}>
            <View style={[styles.sectionIconCircle, { backgroundColor: theme.accent + "15" }]}>
              <EvendiIcon name="tag" size={16} color={theme.accent} />
            </View>
            <ThemedText style={[styles.toggleTitle, { color: theme.text }]}>Pris og kontakt</ThemedText>
          </View>
          <EvendiIcon name={showPricing ? "chevron-up" : "chevron-down"} size={20} color={theme.textMuted} />
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

          <View style={[styles.switchRow, { backgroundColor: theme.backgroundRoot }]}>
            <View style={styles.switchInfo}>
              <View style={[styles.sectionIconCircle, { backgroundColor: theme.accent + "15" }]}>
                <EvendiIcon name="mail" size={14} color={theme.accent} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Tillat kontaktskjema</ThemedText>
                <ThemedText style={[styles.switchDesc, { color: theme.textMuted }]}>
                  {isWedding ? "Brudepar kan sende deg forespørsler" : "Kunder kan sende deg forespørsler"}
                </ThemedText>
              </View>
            </View>
            <Switch
              value={allowInquiryForm}
              onValueChange={setAllowInquiryForm}
              trackColor={{ false: theme.border, true: theme.accent }}
              thumbColor="#fff"
            />
          </View>
        </View>
      ) : null}

        <Pressable
          onPress={handleSubmit}
          disabled={saveMutation.isPending}
          style={({ pressed }) => [
            styles.submitBtn,
            { 
              backgroundColor: theme.accent, 
              opacity: saveMutation.isPending ? 0.7 : 1,
              transform: [{ scale: pressed ? 0.98 : 1 }],
            },
          ]}
        >
          {saveMutation.isPending ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <View style={styles.submitBtnIcon}>
                <EvendiIcon name="send" size={16} color="#FFFFFF" />
              </View>
              <ThemedText style={styles.submitBtnText}>
                {isEditMode ? "Lagre endringer" : "Send til godkjenning"}
              </ThemedText>
            </>
          )}
        </Pressable>

        {isEditMode && (
          <Pressable
            onPress={handleDelete}
            disabled={deleteMutation.isPending}
            style={({ pressed }) => [
              styles.deleteBtn,
              { 
                backgroundColor: "#F44336" + "15",
                opacity: deleteMutation.isPending ? 0.5 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            {deleteMutation.isPending ? (
              <ActivityIndicator color="#F44336" />
            ) : (
              <>
                <EvendiIcon name="trash-2" size={18} color="#F44336" />
                <ThemedText style={[styles.deleteBtnText, { color: "#F44336" }]}>
                  Slett showcase
                </ThemedText>
              </>
            )}
          </Pressable>
        )}
      </KeyboardAwareScrollViewCompat>

      {/* Google Drive Help Modal */}
      <Modal
        visible={showGoogleDriveHelp}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowGoogleDriveHelp(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}>
            {/* Header with Google logo */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleRow}>
                <Image 
                  source={{ uri: "https://www.gstatic.com/images/branding/product/2x/drive_2020q4_48dp.png" }}
                  style={styles.googleDriveLogo}
                />
                <ThemedText style={[styles.modalTitle, { color: theme.text }]}>
                  Google Drive Oppsett
                </ThemedText>
              </View>
              <Pressable 
                onPress={() => setShowGoogleDriveHelp(false)}
                style={styles.modalCloseBtn}
              >
                <EvendiIcon name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <ThemedText style={[styles.modalSubtitle, { color: theme.textMuted }]}>
                Følg disse trinnene for å dele bilder fra Google Drive:
              </ThemedText>

              {/* Step 1 */}
              <View style={styles.helpStep}>
                <View style={[styles.stepNumber, { backgroundColor: theme.accent }]}>
                  <ThemedText style={styles.stepNumberText}>1</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={[styles.stepTitle, { color: theme.text }]}>
                    Åpne Google Drive
                  </ThemedText>
                  <ThemedText style={[styles.stepDesc, { color: theme.textMuted }]}>
                    Gå til drive.google.com eller åpne Google Drive-appen
                  </ThemedText>
                </View>
              </View>

              {/* Step 2 */}
              <View style={styles.helpStep}>
                <View style={[styles.stepNumber, { backgroundColor: theme.accent }]}>
                  <ThemedText style={styles.stepNumberText}>2</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={[styles.stepTitle, { color: theme.text }]}>
                    Velg bildet og åpne delings-innstillinger
                  </ThemedText>
                  <ThemedText style={[styles.stepDesc, { color: theme.textMuted }]}>
                    Høyreklikk på bildet → "Del" eller klikk på de tre prikkene → "Del"
                  </ThemedText>
                </View>
              </View>

              {/* Step 3 - Important! */}
              <View style={[styles.helpStep, styles.importantStep, { borderColor: theme.accent }]}>
                <View style={[styles.stepNumber, { backgroundColor: theme.accent }]}>
                  <ThemedText style={styles.stepNumberText}>3</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={[styles.stepTitle, { color: theme.text }]}>
                    Endre til "Alle med lenken" ⚠️
                  </ThemedText>
                  <ThemedText style={[styles.stepDesc, { color: theme.textMuted }]}>
                    Under "Generell tilgang", klikk på "Begrenset" og endre til{" "}
                    <ThemedText style={{ fontWeight: "700", color: theme.text }}>
                      "Alle med lenken"
                    </ThemedText>
                  </ThemedText>
                  <View style={[styles.warningBox, { backgroundColor: "#FFF3E0" }]}>
                    <EvendiIcon name="alert-triangle" size={16} color="#FF9800" />
                    <ThemedText style={styles.warningText}>
                      Viktig: Hvis bildet forblir "Begrenset", vil det ikke vises i appen!
                    </ThemedText>
                  </View>
                </View>
              </View>

              {/* Step 4 */}
              <View style={styles.helpStep}>
                <View style={[styles.stepNumber, { backgroundColor: theme.accent }]}>
                  <ThemedText style={styles.stepNumberText}>4</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={[styles.stepTitle, { color: theme.text }]}>
                    Kopier lenken
                  </ThemedText>
                  <ThemedText style={[styles.stepDesc, { color: theme.textMuted }]}>
                    Klikk "Kopier lenke" eller kopier URL-en fra adressefeltet
                  </ThemedText>
                </View>
              </View>

              {/* Step 5 */}
              <View style={styles.helpStep}>
                <View style={[styles.stepNumber, { backgroundColor: theme.accent }]}>
                  <ThemedText style={styles.stepNumberText}>5</ThemedText>
                </View>
                <View style={styles.stepContent}>
                  <ThemedText style={[styles.stepTitle, { color: theme.text }]}>
                    Lim inn i appen
                  </ThemedText>
                  <ThemedText style={[styles.stepDesc, { color: theme.textMuted }]}>
                    Lim inn lenken i URL-feltet – den konverteres automatisk til et bilde!
                  </ThemedText>
                </View>
              </View>

              {/* Supported formats */}
              <View style={[styles.supportedFormats, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                <ThemedText style={[styles.formatsTitle, { color: theme.text }]}>
                  ✅ Støttede lenkeformater:
                </ThemedText>
                <ThemedText style={[styles.formatExample, { color: theme.textMuted }]}>
                  • drive.google.com/file/d/ABC123/view
                </ThemedText>
                <ThemedText style={[styles.formatExample, { color: theme.textMuted }]}>
                  • drive.google.com/open?id=ABC123
                </ThemedText>
              </View>

              {/* Open Google Drive button */}
              <Pressable
                onPress={() => {
                  Linking.openURL("https://drive.google.com");
                  setShowGoogleDriveHelp(false);
                }}
                style={({ pressed }) => [
                  styles.openDriveBtn,
                  { 
                    backgroundColor: pressed ? "#1a73e8" : "#4285F4",
                  }
                ]}
              >
                <Image 
                  source={{ uri: "https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" }}
                  style={styles.googleGLogo}
                />
                <ThemedText style={styles.openDriveBtnText}>
                  Åpne Google Drive
                </ThemedText>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    position: "relative",
    zIndex: 1000,
    elevation: 1000,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    flex: 1,
  },
  headerIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 1,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  categoriesScroll: {
    marginHorizontal: -Spacing.sm,
  },
  categoriesContent: {
    paddingHorizontal: Spacing.sm,
    gap: Spacing.sm,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  input: {
    height: 52,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
  },
  textArea: {
    minHeight: 90,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    fontSize: 16,
    textAlignVertical: "top",
  },
  mediaRow: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  imagePreviewContainer: {
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.md,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 150,
    borderRadius: BorderRadius.md,
  },
  mediaHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  mediaTypeToggle: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  mediaActions: {
    flexDirection: "row",
    gap: Spacing.xs,
  },
  pickImageBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  removeMediaBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  mediaInput: {
    height: 44,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
    marginBottom: Spacing.xs,
  },
  urlHintRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
    marginTop: -2,
  },
  urlHint: {
    fontSize: 12,
    flex: 1,
  },
  helpBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  googleDriveLogo: {
    width: 28,
    height: 28,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalCloseBtn: {
    padding: Spacing.xs,
  },
  modalScroll: {
    flexGrow: 0,
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: Spacing.lg,
  },
  helpStep: {
    flexDirection: "row",
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  importantStep: {
    backgroundColor: "rgba(66, 133, 244, 0.05)",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginLeft: -Spacing.md,
    marginRight: -Spacing.md,
    paddingLeft: Spacing.md + Spacing.sm,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  stepDesc: {
    fontSize: 13,
    lineHeight: 20,
  },
  warningBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.sm,
  },
  warningText: {
    fontSize: 12,
    color: "#E65100",
    flex: 1,
    lineHeight: 18,
  },
  supportedFormats: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  formatsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  formatExample: {
    fontSize: 12,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    marginBottom: 4,
  },
  openDriveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  googleGLogo: {
    width: 20,
    height: 20,
  },
  openDriveBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
  addMediaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  addMediaText: {
    fontSize: 14,
    fontWeight: "600",
  },
  toggleSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
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
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
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
    borderRadius: BorderRadius.md,
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
    fontWeight: "600",
  },
  switchDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
    gap: Spacing.sm,
    shadowColor: "#C9A962",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  submitBtnIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  submitBtnText: {
    fontSize: 17,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  deleteBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
