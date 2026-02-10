import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  View,
  Pressable,
  Dimensions,
  TextInput,
  Linking,
  Modal,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInLeft,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "@react-navigation/native";
import type { RouteProp } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { showToast } from "@/lib/toast";
import type { AppSetting, VideoGuide } from "../../shared/schema";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

const { width } = Dimensions.get("window");

interface Feature {
  id: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
  color: string;
  steps?: string[];
  category: "vendor" | "couple" | "both";
}

const FEATURES: Feature[] = [
  {
    id: "profile",
    icon: "user",
    title: "Opprett og Administrer Profil",
    description: "Din bedriftsprofil er det første par ser. Hold den oppdatert med bilder, beskrivelse, priser og kontaktinfo for å skille deg ut.",
    color: "#FF6B6B",
    category: "vendor",
    steps: [
      "Gå til 'Min Profil' fra Dashboard",
      "Fyll inn virksomhetsinformasjon og beskrivelse",
      "Last opp logo og porteføljebilder",
      "Angi priskategorier, tjenester og tilgjengelighet",
      "Lagre endringer — profilen oppdateres umiddelbart"
    ]
  },
  {
    id: "messages",
    icon: "message-circle",
    title: "Håndter Meldinger",
    description: "Kommuniser direkte med par, send tilbud, del filer og administrer alle henvendelser på ett sted. Rask respons øker synligheten din.",
    color: "#51CF66",
    category: "vendor",
    steps: [
      "Klikk på 'Meldinger' i Dashboard",
      "Se alle aktive samtaler sortert etter siste melding",
      "Svar på henvendelser raskt — under 2 timer gir best resultat",
      "Send dokumenter, bilder og kontrakter direkte i chatten",
      "Du får push-varsler for nye meldinger"
    ]
  },
  {
    id: "inspiration",
    icon: "image",
    title: "Del Inspirasjon",
    description: "Vis fram ditt arbeid i inspirasjonsgalleriet. Jo flere gode bilder, jo bedre synlighet! Par bruker galleriet aktivt for å finne leverandører.",
    color: "#4DABF7",
    category: "vendor",
    steps: [
      "Naviger til 'Inspirasjon' i Dashboard",
      "Klikk '+ Nytt bilde'",
      "Last opp høykvalitetsbilder (min. 1080px bredde)",
      "Legg til beskrivelse, tags og kategori",
      "Publiser — bildet vises i Showcase-fanen for alle par"
    ]
  },
  {
    id: "offers",
    icon: "tag",
    title: "Opprett Tilbud",
    description: "Tiltrekk par med spesialtilbud, sesongtilbud og kampanjer. Tilbud vises på profilen din og i leverandørsøk.",
    color: "#FFA94D",
    category: "vendor",
    steps: [
      "Åpne 'Tilbud'-seksjonen i Dashboard",
      "Klikk 'Opprett nytt tilbud'",
      "Sett pris, rabatt og beskrivelse",
      "Angi gyldighetsperiode (start- og sluttdato)",
      "Publiser — tilbudet vises på profilsiden din"
    ]
  },
  {
    id: "products",
    icon: "package",
    title: "Administrer Produkter",
    description: "Legg til alle tjenester og produkter du tilbyr med priser, beskrivelser og bilder. Par kan se hele sortimentet ditt.",
    color: "#E64980",
    category: "vendor",
    steps: [
      "Gå til 'Produkter' i Dashboard",
      "Klikk '+ Nytt produkt'",
      "Legg til navn, beskrivelse og pris",
      "Last opp produktbilder",
      "Kategoriser produktet for enkel navigasjon"
    ]
  },
  {
    id: "deliveries",
    icon: "truck",
    title: "Leveranser og Oppdrag",
    description: "Opprett og administrer leveranser knyttet til par. Spor status og del detaljer slik at alt er klart til bryllupsdagen.",
    color: "#15AABF",
    category: "vendor",
    steps: [
      "Åpne 'Leveranser' i Dashboard",
      "Opprett ny leveranse knyttet til et par",
      "Legg til tidsfrist, beskrivelse og detaljer",
      "Oppdater status etter hvert som arbeidet skrider frem",
      "Paret får automatisk oppdateringer"
    ]
  },
  {
    id: "vendor-support",
    icon: "headphones",
    title: "Support og Hjelp",
    description: "Kontakt Wedflow-teamet direkte, se FAQ, dokumentasjon og videoguider. Vi er her for å hjelpe deg å lykkes.",
    color: "#748FFC",
    category: "vendor",
    steps: [
      "Klikk 'Wedflow Support' øverst i Dashboard for direkte chat",
      "Bruk 'Hjelp & FAQ' for raske svar på vanlige spørsmål",
      "Se dokumentasjonen for detaljerte guider",
      "Sjekk videoguider for visuell opplæring",
      "Send e-post til support@wedflow.no for akutte saker"
    ]
  },
  {
    id: "planning",
    icon: "calendar",
    title: "Planlegg Bryllupet",
    description: "Bruk sjekkliste, budsjett, tidslinje, påminnelser og fotoplan for å holde oversikt over hele planleggingen.",
    color: "#845EF7",
    category: "couple",
    steps: [
      "Gå til 'Planlegging'-fanen",
      "Sett bryllupsdato og legg til viktige detaljer",
      "Bruk sjekklisten for å spore oppgaver",
      "Administrer budsjett med kategorier og 'Hva om?'-scenarier",
      "Opprett kjøreplan og tidslinje for bryllupsdagen"
    ]
  },
  {
    id: "vendors",
    icon: "briefcase",
    title: "Finn Leverandører",
    description: "Søk blant leverandører direkte i planleggingsskjermene. Filtrer på kategori og sted, se profiler og start chat.",
    color: "#20C997",
    category: "couple",
    steps: [
      "Åpne en planleggingsskjerm (Blomster, Catering, Transport osv.)",
      "Bruk søkefeltet for å finne leverandører",
      "Se profiler med bilder, anmeldelser og priser",
      "Trykk 'Send melding' for å starte chat",
      "Alle samtaler ligger under Profil > Meldinger"
    ]
  },
  {
    id: "guests",
    icon: "users",
    title: "Administrer Gjester",
    description: "Hold oversikt over gjestelisten, RSVP, matpreferanser, allergier og bordplassering med interaktivt bordkart.",
    color: "#FA5252",
    category: "couple",
    steps: [
      "Naviger til 'Gjester'-fanen",
      "Legg til gjester med navn og kontaktinfo",
      "Spor RSVP-svar og matpreferanser",
      "Registrer allergier og spesielle behov",
      "Planlegg bordplassering med det interaktive bordkartet"
    ]
  },
  {
    id: "couple-messages",
    icon: "message-circle",
    title: "Meldinger og Kontakt",
    description: "Chat med leverandører, ring viktige personer i bryllupsfølget, og kontakt Wedflow Support — alt på ett sted.",
    color: "#51CF66",
    category: "couple",
    steps: [
      "Gå til Profil > Meldinger",
      "Se leverandørsamtaler med uleste varsler",
      "Ring eller send SMS til viktige personer",
      "Kontakt Wedflow Support for direkte hjelp",
      "Bruk Hjelp & FAQ for raske svar"
    ]
  },
  {
    id: "couple-photo",
    icon: "camera",
    title: "Fotoplan",
    description: "Planlegg hvilke bilder du vil ha tatt. Del fotoplanen med fotografen for å sikre at ingen viktige øyeblikk går tapt.",
    color: "#F06595",
    category: "couple",
    steps: [
      "Gå til Profil > Fotoplan",
      "Legg til bildekategorier (brudepar, familie, venner, detaljer)",
      "Spesifiser ønskede bilder i hver kategori",
      "Marker viktige «must-have»-bilder",
      "Del fotoplanen med fotografen"
    ]
  },
  {
    id: "support",
    icon: "help-circle",
    title: "Få Support",
    description: "Trenger du hjelp? Kontakt oss via chat, e-post eller se vår omfattende FAQ. Vi svarer vanligvis innen 24 timer.",
    color: "#748FFC",
    category: "both",
    steps: [
      "Klikk 'Wedflow Support' eller 'Meldinger' i menyen",
      "Velg mellom FAQ, direkte chat eller tilbakemelding",
      "Beskriv ditt problem eller spørsmål",
      "Vi svarer innen 24 timer",
      "Send e-post til support@wedflow.no for akutte saker"
    ]
  }
];

const DOCUMENTATION_FEATURES_KEY = "documentation_features";
const DOCUMENTATION_VIDEO_URL_KEY = "documentation_video_url";
const DOCUMENTATION_VIDEO_TITLE_KEY = "documentation_video_title";
const DOCUMENTATION_VIDEO_DESCRIPTION_KEY = "documentation_video_description";

const DEFAULT_VIDEO_TITLE = "Videoguider";
const DEFAULT_VIDEO_DESCRIPTION =
  "Se vare videoguider for visuell opplaering i alle funksjoner.";

const isFeatherIcon = (icon: string): icon is keyof typeof Feather.glyphMap => {
  return Object.prototype.hasOwnProperty.call(Feather.glyphMap, icon);
};

const isValidColor = (value: string) => /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);

const normalizeFeature = (feature: Feature, fallbackColor: string): Feature => {
  const safeIcon = isFeatherIcon(feature.icon) ? feature.icon : "book-open";
  const safeColor = isValidColor(feature.color) ? feature.color : fallbackColor;
  const safeCategory = ["vendor", "couple", "both"].includes(feature.category)
    ? feature.category
    : "vendor";

  return {
    ...feature,
    icon: safeIcon,
    color: safeColor,
    category: safeCategory as Feature["category"],
    steps: feature.steps?.filter((step) => step.trim().length > 0),
  };
};

const parseFeaturesSetting = (value: string | undefined, fallbackColor: string) => {
  if (!value) return FEATURES.map((feature) => normalizeFeature(feature, fallbackColor));
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return FEATURES.map((feature) => normalizeFeature(feature, fallbackColor));
    const mapped = parsed
      .filter((item) => item && typeof item === "object")
      .map((item) => {
        const candidate: Feature = {
          id: String(item.id ?? `feature-${Math.random().toString(36).slice(2)}`),
          icon: String(item.icon ?? "book-open") as Feature["icon"],
          title: String(item.title ?? ""),
          description: String(item.description ?? ""),
          color: String(item.color ?? fallbackColor),
          steps: Array.isArray(item.steps) ? item.steps.map((step: string) => String(step)) : undefined,
          category: (item.category as Feature["category"]) ?? "vendor",
        };
        return normalizeFeature(candidate, fallbackColor);
      })
      .filter((item) => item.title.length > 0 && item.description.length > 0);

    return mapped.length > 0
      ? mapped
      : FEATURES.map((feature) => normalizeFeature(feature, fallbackColor));
  } catch {
    return FEATURES.map((feature) => normalizeFeature(feature, fallbackColor));
  }
};

export default function DocumentationScreen() {
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const route = useRoute<RouteProp<RootStackParamList, "Documentation">>();
  const adminKey = route.params?.adminKey ?? "";
  const isAdmin = adminKey.length > 0;
  const [activeCategory, setActiveCategory] = useState<"vendor" | "couple" | "both">("vendor");
  const [expandedFeature, setExpandedFeature] = useState<string | null>(null);
  const [videoInterested, setVideoInterested] = useState(false);
  const playPulse = useSharedValue(1);
  const contentMaxWidth = Math.min(width - Spacing.lg * 2, 680);
  const [draftFeatures, setDraftFeatures] = useState<Feature[]>(FEATURES);
  const [isEditingFeatures, setIsEditingFeatures] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [stepsDraft, setStepsDraft] = useState("");
  const [videoTitleDraft, setVideoTitleDraft] = useState("");
  const [videoDescriptionDraft, setVideoDescriptionDraft] = useState("");
  const [videoUrlDraft, setVideoUrlDraft] = useState("");
  const [videoDirty, setVideoDirty] = useState(false);
  const [savingFeatures, setSavingFeatures] = useState(false);
  const [savingVideo, setSavingVideo] = useState(false);
  const [selectedGuideId, setSelectedGuideId] = useState<string | null>(null);

  const { data: appSettings = [] } = useQuery<AppSetting[]>({
    queryKey: ["app-settings"],
    queryFn: async () => {
      const url = new URL("/api/app-settings", getApiUrl());
      const res = await fetch(url);
      if (!res.ok) throw new Error("Kunne ikke hente innstillinger");
      return res.json() as Promise<AppSetting[]>;
    },
  });

  const { data: adminGuides = [], isLoading: isLoadingGuides } = useQuery<VideoGuide[]>({
    queryKey: ["admin-video-guides", adminKey],
    enabled: isAdmin,
    queryFn: async () => {
      const vendorUrl = new URL("/api/admin/video-guides/vendor", getApiUrl());
      const coupleUrl = new URL("/api/admin/video-guides/couple", getApiUrl());
      const [vendorRes, coupleRes] = await Promise.all([
        fetch(vendorUrl, { headers: { Authorization: `Bearer ${adminKey}` } }),
        fetch(coupleUrl, { headers: { Authorization: `Bearer ${adminKey}` } }),
      ]);
      if (!vendorRes.ok || !coupleRes.ok) {
        throw new Error("Kunne ikke hente videoguider");
      }
      const [vendorGuides, coupleGuides] = await Promise.all([
        vendorRes.json() as Promise<VideoGuide[]>,
        coupleRes.json() as Promise<VideoGuide[]>,
      ]);
      return [...vendorGuides, ...coupleGuides].sort((a, b) => a.sortOrder - b.sortOrder);
    },
  });

  const filteredAdminGuides = useMemo(() => {
    if (activeCategory === "both") return adminGuides;
    return adminGuides.filter((guide) => guide.category === activeCategory);
  }, [adminGuides, activeCategory]);

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      if (!adminKey) throw new Error("Mangler admin-tilgang");
      const url = new URL(`/api/admin/app-settings/${key}`, getApiUrl());
      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${adminKey}`,
        },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) throw new Error("Kunne ikke oppdatere innstillinger");
      return res.json();
    },
  });

  const getSettingValue = useMemo(() => {
    return (key: string, fallback: string = "") =>
      appSettings.find((setting) => setting.key === key)?.value ?? fallback;
  }, [appSettings]);

  const settingsFeatures = useMemo(
    () => parseFeaturesSetting(getSettingValue(DOCUMENTATION_FEATURES_KEY), theme.accent),
    [getSettingValue, theme.accent]
  );

  const videoTitle = useMemo(
    () => getSettingValue(DOCUMENTATION_VIDEO_TITLE_KEY, DEFAULT_VIDEO_TITLE),
    [getSettingValue]
  );
  const videoDescription = useMemo(
    () => getSettingValue(DOCUMENTATION_VIDEO_DESCRIPTION_KEY, DEFAULT_VIDEO_DESCRIPTION),
    [getSettingValue]
  );
  const videoUrl = useMemo(
    () => getSettingValue(DOCUMENTATION_VIDEO_URL_KEY, ""),
    [getSettingValue]
  );

  useEffect(() => {
    playPulse.value = withRepeat(
      withSequence(
        withSpring(1.06, { damping: 12, stiffness: 120 }),
        withSpring(1, { damping: 12, stiffness: 120 })
      ),
      -1,
      true
    );
  }, [playPulse]);

  useEffect(() => {
    if (!isEditingFeatures) {
      setDraftFeatures(settingsFeatures);
    }
  }, [isEditingFeatures, settingsFeatures]);

  useEffect(() => {
    if (!videoDirty) {
      setVideoTitleDraft(videoTitle);
      setVideoDescriptionDraft(videoDescription);
      setVideoUrlDraft(videoUrl);
      setSelectedGuideId(null);
    }
  }, [videoDirty, videoTitle, videoDescription, videoUrl]);

  const visibleFeatures = useMemo(() => {
    const source = isEditingFeatures ? draftFeatures : settingsFeatures;
    return source.filter(
      (feature) => feature.category === activeCategory || feature.category === "both"
    );
  }, [activeCategory, draftFeatures, isEditingFeatures, settingsFeatures]);

  const handleToggleFeature = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setExpandedFeature(expandedFeature === id ? null : id);
  };

  const handleCategoryChange = (category: "vendor" | "couple" | "both") => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveCategory(category);
    setExpandedFeature(null);
    setSelectedGuideId(null);
  };

  const handleVideoPress = () => {
    if (videoUrl) {
      handleOpenVideo(videoUrl);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVideoInterested((prev) => !prev);
  };

  const handleOpenVideo = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        showToast("Lenken er ikke gyldig.");
        return;
      }
      await Linking.openURL(url);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error("Could not open video", error);
      showToast("Noe gikk galt. Prov igjen.");
    }
  };

  const handleStartEditing = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDraftFeatures(settingsFeatures);
    setIsEditingFeatures(true);
  };

  const handleCancelEditing = () => {
    setDraftFeatures(settingsFeatures);
    setIsEditingFeatures(false);
    setExpandedFeature(null);
    setEditingFeature(null);
    setStepsDraft("");
  };

  const handleSaveFeatures = async () => {
    if (!isAdmin) return;
    setSavingFeatures(true);
    try {
      await updateSettingMutation.mutateAsync({
        key: DOCUMENTATION_FEATURES_KEY,
        value: JSON.stringify(draftFeatures),
      });
      queryClient.invalidateQueries({ queryKey: ["app-settings"] });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      showToast("Dokumentasjonen er oppdatert.");
      setIsEditingFeatures(false);
    } catch (error) {
      showToast((error as Error).message);
    } finally {
      setSavingFeatures(false);
    }
  };

  const handleAddFeature = () => {
    if (!isEditingFeatures) return;
    const newFeature: Feature = {
      id: `feature-${Date.now()}`,
      icon: "book-open",
      title: "",
      description: "",
      color: theme.accent,
      category: activeCategory,
      steps: [],
    };
    setEditingFeature(newFeature);
    setStepsDraft("");
  };

  const handleEditFeature = (feature: Feature) => {
    setEditingFeature({ ...feature });
    setStepsDraft(feature.steps?.join("\n") ?? "");
  };

  const handleSaveFeatureDraft = () => {
    if (!editingFeature) return;
    if (!editingFeature.title.trim() || !editingFeature.description.trim()) {
      showToast("Tittel og beskrivelse ma fylles ut.");
      return;
    }

    const normalizedSteps = stepsDraft
      .split("\n")
      .map((step) => step.trim())
      .filter((step) => step.length > 0);

    const nextFeature = normalizeFeature(
      {
        ...editingFeature,
        title: editingFeature.title.trim(),
        description: editingFeature.description.trim(),
        steps: normalizedSteps.length > 0 ? normalizedSteps : undefined,
      },
      theme.accent
    );

    setDraftFeatures((prev) => {
      const current = prev ?? [];
      const existingIndex = current.findIndex((item) => item.id === nextFeature.id);
      if (existingIndex === -1) {
        return [...current, nextFeature];
      }
      const updated = [...current];
      updated[existingIndex] = nextFeature;
      return updated;
    });
    setEditingFeature(null);
    setStepsDraft("");
  };

  const handleSaveVideoSettings = async () => {
    if (!isAdmin) return;
    if (videoUrlDraft && !/^https?:\/\//.test(videoUrlDraft)) {
      showToast("Video-URL ma starte med http eller https.");
      return;
    }
    setSavingVideo(true);
    try {
      await updateSettingMutation.mutateAsync({
        key: DOCUMENTATION_VIDEO_TITLE_KEY,
        value: videoTitleDraft.trim() || DEFAULT_VIDEO_TITLE,
      });
      await updateSettingMutation.mutateAsync({
        key: DOCUMENTATION_VIDEO_DESCRIPTION_KEY,
        value: videoDescriptionDraft.trim() || DEFAULT_VIDEO_DESCRIPTION,
      });
      await updateSettingMutation.mutateAsync({
        key: DOCUMENTATION_VIDEO_URL_KEY,
        value: videoUrlDraft.trim(),
      });
      queryClient.invalidateQueries({ queryKey: ["app-settings"] });
      setVideoDirty(false);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      showToast("Videoseksjonen er oppdatert.");
    } catch (error) {
      showToast((error as Error).message);
    } finally {
      setSavingVideo(false);
    }
  };

  const applyGuideToVideo = (guide: VideoGuide) => {
    setSelectedGuideId(guide.id);
    setVideoTitleDraft(guide.title);
    setVideoDescriptionDraft(guide.description);
    setVideoUrlDraft(guide.videoUrl);
    setVideoDirty(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const playButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: playPulse.value }],
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundRoot }]} edges={["bottom"]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: Spacing.xl * 2,
          paddingHorizontal: Spacing.lg,
          alignItems: "center",
        }}
      >
        <View style={[styles.content, { width: contentMaxWidth > 0 ? contentMaxWidth : "100%" }]}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)}>
          <View style={[styles.header, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <View style={[styles.headerIcon, { backgroundColor: theme.accent + "20" }]}>
              <Feather name="book-open" size={32} color={theme.accent} />
            </View>
            <ThemedText style={styles.headerTitle}>Slik Bruker Du Wedflow</ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              Komplett guide til alle funksjoner
            </ThemedText>
          </View>
        </Animated.View>

        {/* Category Tabs */}
        <Animated.View entering={FadeInDown.delay(100).duration(400)}>
          <View style={[styles.categoryTabs, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <Pressable
              onPress={() => handleCategoryChange("vendor")}
              style={[
                styles.categoryTab,
                activeCategory === "vendor" && [styles.categoryTabActive, { backgroundColor: theme.accent }],
                activeCategory !== "vendor" && { backgroundColor: theme.backgroundSecondary }
              ]}
            >
              <Feather 
                name="briefcase" 
                size={18} 
                color={activeCategory === "vendor" ? "#FFFFFF" : theme.textSecondary} 
              />
              <ThemedText 
                style={[
                  styles.categoryTabText,
                  { color: activeCategory === "vendor" ? "#FFFFFF" : theme.textSecondary }
                ]}
              >
                For Leverandører
              </ThemedText>
            </Pressable>

            <Pressable
              onPress={() => handleCategoryChange("couple")}
              style={[
                styles.categoryTab,
                activeCategory === "couple" && [styles.categoryTabActive, { backgroundColor: theme.accent }],
                activeCategory !== "couple" && { backgroundColor: theme.backgroundSecondary }
              ]}
            >
              <Feather 
                name="heart" 
                size={18} 
                color={activeCategory === "couple" ? "#FFFFFF" : theme.textSecondary} 
              />
              <ThemedText 
                style={[
                  styles.categoryTabText,
                  { color: activeCategory === "couple" ? "#FFFFFF" : theme.textSecondary }
                ]}
              >
                For Brudepar
              </ThemedText>
            </Pressable>
          </View>
        </Animated.View>

        {/* Features List */}
        {visibleFeatures.map((feature, index) => (
          <Animated.View 
            key={feature.id}
            entering={FadeInDown.delay(200 + index * 50).duration(400)}
          >
            <Pressable
              onPress={() => handleToggleFeature(feature.id)}
              style={[
                styles.featureCard,
                { 
                  backgroundColor: theme.backgroundDefault, 
                  borderColor: expandedFeature === feature.id ? feature.color : theme.border,
                  borderWidth: expandedFeature === feature.id ? 2 : 1,
                }
              ]}
            >
              <View style={styles.featureHeader}>
                <View style={[styles.featureIcon, { backgroundColor: feature.color + "20" }]}>
                  <Feather name={feature.icon} size={24} color={feature.color} />
                </View>
                <View style={styles.featureInfo}>
                  <ThemedText style={styles.featureTitle}>{feature.title}</ThemedText>
                  <ThemedText style={[styles.featureDescription, { color: theme.textSecondary }]}>
                    {feature.description}
                  </ThemedText>
                </View>
                <Feather 
                  name={expandedFeature === feature.id ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={theme.textMuted} 
                />
              </View>

              {expandedFeature === feature.id && feature.steps && (
                <Animated.View entering={FadeInDown.duration(300)}>
                  <View style={[styles.stepsContainer, { borderTopColor: theme.border }]}>
                    <ThemedText style={[styles.stepsTitle, { color: feature.color }]}>
                      📋 Steg-for-steg:
                    </ThemedText>
                    {feature.steps.map((step, i) => (
                      <Animated.View 
                        key={i}
                        entering={(i % 2 === 0 ? FadeInRight : FadeInLeft).delay(i * 50).duration(300)}
                        style={styles.stepItem}
                      >
                        <View style={[styles.stepNumber, { backgroundColor: feature.color }]}>
                          <ThemedText style={styles.stepNumberText}>{i + 1}</ThemedText>
                        </View>
                        <ThemedText style={[styles.stepText, { color: theme.text }]}>
                          {step}
                        </ThemedText>
                      </Animated.View>
                    ))}
                  </View>
                </Animated.View>
              )}
            </Pressable>
          </Animated.View>
        ))}

        {/* Tips Section */}
        <Animated.View entering={FadeInDown.delay(600).duration(400)}>
          <View style={[styles.tipsBox, { backgroundColor: theme.accent + "15", borderColor: theme.accent }]}>
            <View style={[styles.tipsIcon, { backgroundColor: theme.accent }]}>
              <Feather name="zap" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.tipsContent}>
              <ThemedText style={[styles.tipsTitle, { color: theme.accent }]}>
                Pro Tips!
              </ThemedText>
              <ThemedText style={[styles.tipsText, { color: theme.text }]}>
                {activeCategory === "vendor" 
                  ? "Svar raskt på henvendelser og hold profilen oppdatert for best synlighet. Par setter pris på rask respons!"
                  : "Begynn planleggingen tidlig og bruk sjekklistene våre. Kommuniser tydelig med leverandører for best resultat!"
                }
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        {/* Video Section */}
        <Animated.View entering={FadeInDown.delay(700).duration(400)}>
          <View style={[styles.videoSection, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <Pressable
              onPress={handleVideoPress}
              style={({ pressed }) => [
                styles.videoPlaceholder,
                { backgroundColor: theme.backgroundSecondary },
                pressed && { opacity: 0.85 },
              ]}
            >
              <Animated.View style={[styles.playButton, { backgroundColor: theme.accent }, playButtonStyle]}>
                <Feather name={videoInterested ? "check" : "play"} size={32} color="#FFFFFF" />
              </Animated.View>
            </Pressable>
            <ThemedText style={styles.videoTitle}>{videoTitle}</ThemedText>
            <ThemedText style={[styles.videoDescription, { color: theme.textSecondary }]}>
              {videoUrl
                ? videoDescription
                : videoInterested
                  ? "Takk! Vi gir deg beskjed nar videoguider er klare."
                  : "Trykk for a fa varsel nar videoguider er tilgjengelige."
              }
            </ThemedText>
            {videoUrl ? (
              <Pressable
                onPress={() => handleOpenVideo(videoUrl)}
                style={[styles.videoButton, { backgroundColor: theme.accent }]}
              >
                <Feather name="play" size={18} color="#FFFFFF" />
                <ThemedText style={styles.videoButtonText}>Apne video</ThemedText>
              </Pressable>
            ) : null}
          </View>
        </Animated.View>

        {isAdmin && (
          <Animated.View entering={FadeInDown.delay(800).duration(400)}>
            <View style={[styles.adminPanel, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
              <View style={styles.adminHeader}>
                <View style={[styles.adminIcon, { backgroundColor: theme.accent + "20" }]}>
                  <Feather name="edit" size={18} color={theme.accent} />
                </View>
                <View style={styles.adminHeaderText}>
                  <ThemedText style={styles.adminTitle}>Admin: Rediger dokumentasjon</ThemedText>
                  <ThemedText style={[styles.adminSubtitle, { color: theme.textSecondary }]}>Oppdater videoseksjon og funksjoner.</ThemedText>
                </View>
                <Pressable
                  onPress={isEditingFeatures ? handleCancelEditing : handleStartEditing}
                  style={({ pressed }) => [
                    styles.adminToggle,
                    { backgroundColor: pressed ? theme.backgroundSecondary : theme.backgroundRoot },
                    isEditingFeatures && { borderColor: theme.accent },
                  ]}
                >
                  <ThemedText style={[styles.adminToggleText, { color: theme.text }]}>
                    {isEditingFeatures ? "Avslutt" : "Rediger"}
                  </ThemedText>
                </Pressable>
              </View>

              <View style={styles.adminSection}>
                <ThemedText style={styles.adminSectionTitle}>Videoguide</ThemedText>
                {isLoadingGuides ? (
                  <View style={styles.adminGuideLoading}>
                    <ActivityIndicator color={theme.accent} />
                    <ThemedText style={[styles.adminGuideHint, { color: theme.textSecondary }]}>Laster videoguider...</ThemedText>
                  </View>
                ) : filteredAdminGuides.length > 0 ? (
                  <View style={styles.adminGuideList}>
                    <ThemedText style={[styles.adminGuideLabel, { color: theme.textSecondary }]}>Velg fra eksisterende videoguider</ThemedText>
                    {filteredAdminGuides.map((guide) => (
                      <Pressable
                        key={guide.id}
                        onPress={() => applyGuideToVideo(guide)}
                        style={({ pressed }) => [
                          styles.adminGuideRow,
                          { borderColor: theme.border, backgroundColor: theme.backgroundSecondary },
                          !guide.isActive && { opacity: 0.6 },
                          selectedGuideId === guide.id && { borderColor: theme.accent, backgroundColor: theme.accent + "15" },
                          pressed && { opacity: 0.85 },
                        ]}
                      >
                        <View style={styles.adminGuideInfo}>
                          <ThemedText style={styles.adminGuideTitle}>{guide.title}</ThemedText>
                          <ThemedText style={[styles.adminGuideMeta, { color: theme.textSecondary }]}>Kategori: {guide.category}</ThemedText>
                        </View>
                        {!guide.isActive && (
                          <View style={[styles.adminGuideBadge, { borderColor: theme.border }]}
                          >
                            <ThemedText style={[styles.adminGuideBadgeText, { color: theme.textSecondary }]}>Inaktiv</ThemedText>
                          </View>
                        )}
                        <Feather name={selectedGuideId === guide.id ? "check" : "chevron-right"} size={18} color={theme.textMuted} />
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <ThemedText style={[styles.adminGuideHint, { color: theme.textSecondary }]}>Ingen videoguider i valgt kategori.</ThemedText>
                )}
                <TextInput
                  style={[styles.adminInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundSecondary }]}
                  placeholder="Tittel"
                  placeholderTextColor={theme.textMuted}
                  value={videoTitleDraft}
                  onChangeText={(text) => {
                    setVideoTitleDraft(text);
                    setVideoDirty(true);
                  }}
                />
                <TextInput
                  style={[styles.adminInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundSecondary }]}
                  placeholder="Beskrivelse"
                  placeholderTextColor={theme.textMuted}
                  value={videoDescriptionDraft}
                  onChangeText={(text) => {
                    setVideoDescriptionDraft(text);
                    setVideoDirty(true);
                  }}
                  multiline
                />
                <TextInput
                  style={[styles.adminInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundSecondary }]}
                  placeholder="Video-URL (https://...)"
                  placeholderTextColor={theme.textMuted}
                  value={videoUrlDraft}
                  onChangeText={(text) => {
                    setVideoUrlDraft(text);
                    setVideoDirty(true);
                  }}
                  autoCapitalize="none"
                />
                <Pressable
                  onPress={handleSaveVideoSettings}
                  disabled={savingVideo}
                  style={[styles.adminPrimaryButton, { backgroundColor: theme.accent }, savingVideo && { opacity: 0.7 }]}
                >
                  {savingVideo ? <ActivityIndicator color="#FFFFFF" /> : (
                    <>
                      <Feather name="save" size={16} color="#FFFFFF" />
                      <ThemedText style={styles.adminPrimaryButtonText}>Lagre videoseksjon</ThemedText>
                    </>
                  )}
                </Pressable>
              </View>

              <View style={styles.adminSection}>
                <View style={styles.adminSectionHeader}>
                  <ThemedText style={styles.adminSectionTitle}>Funksjoner</ThemedText>
                  {isEditingFeatures && (
                    <Pressable
                      onPress={handleAddFeature}
                      style={({ pressed }) => [
                        styles.adminAddButton,
                        { backgroundColor: pressed ? theme.backgroundSecondary : theme.backgroundRoot },
                      ]}
                    >
                      <Feather name="plus" size={16} color={theme.text} />
                      <ThemedText style={[styles.adminAddButtonText, { color: theme.text }]}>Legg til</ThemedText>
                    </Pressable>
                  )}
                </View>

                {(isEditingFeatures ? draftFeatures : settingsFeatures).map((feature) => (
                  <View key={feature.id} style={[styles.adminFeatureRow, { borderColor: theme.border }]}
                  >
                    <View style={styles.adminFeatureInfo}>
                      <ThemedText style={styles.adminFeatureTitle}>{feature.title}</ThemedText>
                      <ThemedText style={[styles.adminFeatureMeta, { color: theme.textSecondary }]}
                      >
                        {feature.category} • {feature.icon}
                      </ThemedText>
                    </View>
                    {isEditingFeatures && (
                      <Pressable
                        onPress={() => handleEditFeature(feature)}
                        style={({ pressed }) => [
                          styles.adminEditButton,
                          { backgroundColor: pressed ? theme.backgroundSecondary : theme.backgroundRoot },
                        ]}
                      >
                        <Feather name="edit-2" size={14} color={theme.text} />
                        <ThemedText style={[styles.adminEditButtonText, { color: theme.text }]}>Rediger</ThemedText>
                      </Pressable>
                    )}
                  </View>
                ))}

                {isEditingFeatures && (
                  <View style={styles.adminActions}>
                    <Pressable
                      onPress={handleSaveFeatures}
                      disabled={savingFeatures}
                      style={[styles.adminPrimaryButton, { backgroundColor: theme.accent }, savingFeatures && { opacity: 0.7 }]}
                    >
                      {savingFeatures ? <ActivityIndicator color="#FFFFFF" /> : (
                        <>
                          <Feather name="save" size={16} color="#FFFFFF" />
                          <ThemedText style={styles.adminPrimaryButtonText}>Lagre funksjoner</ThemedText>
                        </>
                      )}
                    </Pressable>
                    <Pressable
                      onPress={handleCancelEditing}
                      style={[styles.adminSecondaryButton, { borderColor: theme.border }]}
                    >
                      <ThemedText style={[styles.adminSecondaryButtonText, { color: theme.text }]}>Avbryt</ThemedText>
                    </Pressable>
                  </View>
                )}
              </View>
            </View>
          </Animated.View>
        )}
        </View>
      </ScrollView>

      <Modal
        visible={editingFeature !== null}
        transparent
        animationType="slide"
        onRequestClose={() => setEditingFeature(null)}
      >
        <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.backgroundDefault }]}
          >
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Rediger funksjon</ThemedText>
              <Pressable onPress={() => setEditingFeature(null)}>
                <Feather name="x" size={22} color={theme.text} />
              </Pressable>
            </View>

            <TextInput
              style={[styles.modalInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundSecondary }]}
              placeholder="Tittel"
              placeholderTextColor={theme.textMuted}
              value={editingFeature?.title ?? ""}
              onChangeText={(text) =>
                setEditingFeature((prev) => (prev ? { ...prev, title: text } : prev))
              }
            />
            <TextInput
              style={[styles.modalInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundSecondary }]}
              placeholder="Beskrivelse"
              placeholderTextColor={theme.textMuted}
              value={editingFeature?.description ?? ""}
              onChangeText={(text) =>
                setEditingFeature((prev) => (prev ? { ...prev, description: text } : prev))
              }
              multiline
            />
            <TextInput
              style={[styles.modalInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundSecondary }]}
              placeholder="Ikon (Feather)"
              placeholderTextColor={theme.textMuted}
              value={editingFeature?.icon ?? ""}
              onChangeText={(text) =>
                setEditingFeature((prev) => (prev ? { ...prev, icon: text as Feature["icon"] } : prev))
              }
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.modalInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundSecondary }]}
              placeholder="Farge (HEX, f.eks. #FF6B6B)"
              placeholderTextColor={theme.textMuted}
              value={editingFeature?.color ?? ""}
              onChangeText={(text) =>
                setEditingFeature((prev) => (prev ? { ...prev, color: text } : prev))
              }
              autoCapitalize="none"
            />

            <View style={styles.modalCategoryRow}>
              {["vendor", "couple", "both"].map((category) => (
                <Pressable
                  key={category}
                  onPress={() =>
                    setEditingFeature((prev) => (prev ? { ...prev, category: category as Feature["category"] } : prev))
                  }
                  style={({ pressed }) => [
                    styles.modalCategoryChip,
                    {
                      backgroundColor:
                        editingFeature?.category === category ? theme.accent : theme.backgroundSecondary,
                      borderColor: theme.border,
                    },
                    pressed && { opacity: 0.8 },
                  ]}
                >
                  <ThemedText style={[styles.modalCategoryText, { color: editingFeature?.category === category ? "#FFFFFF" : theme.text }]}>
                    {category === "vendor" ? "Leverandor" : category === "couple" ? "Brudepar" : "Begge"}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <TextInput
              style={[styles.modalInput, styles.modalSteps, { borderColor: theme.border, color: theme.text, backgroundColor: theme.backgroundSecondary }]}
              placeholder="Steg (ett per linje)"
              placeholderTextColor={theme.textMuted}
              value={stepsDraft}
              onChangeText={setStepsDraft}
              multiline
            />

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setEditingFeature(null)}
                style={[styles.adminSecondaryButton, { borderColor: theme.border }]}
              >
                <ThemedText style={[styles.adminSecondaryButtonText, { color: theme.text }]}>Avbryt</ThemedText>
              </Pressable>
              <Pressable
                onPress={handleSaveFeatureDraft}
                style={[styles.adminPrimaryButton, { backgroundColor: theme.accent }]}
              >
                <Feather name="save" size={16} color="#FFFFFF" />
                <ThemedText style={styles.adminPrimaryButtonText}>Lagre</ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    alignSelf: "center",
    width: "100%",
  },
  header: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  headerIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  categoryTabs: {
    flexDirection: "row",
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    padding: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  categoryTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  categoryTabActive: {},
  categoryTabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  featureCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  featureHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  featureDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  stepsContainer: {
    marginTop: Spacing.lg,
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
  },
  stepsTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.md,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    paddingTop: 2,
  },
  tipsBox: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  tipsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: Spacing.xs,
  },
  tipsText: {
    fontSize: 14,
    lineHeight: 20,
  },
  videoSection: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    alignItems: "center",
  },
  videoPlaceholder: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  videoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  videoDescription: {
    fontSize: 14,
    textAlign: "center",
  },
  videoButton: {
    marginTop: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  videoButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  adminPanel: {
    marginTop: Spacing.xl,
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.lg,
  },
  adminHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  adminIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  adminHeaderText: { flex: 1 },
  adminTitle: { fontSize: 16, fontWeight: "700" },
  adminSubtitle: { fontSize: 12, marginTop: 2 },
  adminToggle: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  adminToggleText: { fontSize: 12, fontWeight: "600" },
  adminSection: {
    gap: Spacing.sm,
  },
  adminGuideList: {
    gap: Spacing.xs,
  },
  adminGuideLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  adminGuideLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  adminGuideHint: {
    fontSize: 12,
  },
  adminGuideRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  adminGuideInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  adminGuideTitle: {
    fontSize: 13,
    fontWeight: "600",
  },
  adminGuideMeta: {
    fontSize: 11,
    marginTop: 2,
  },
  adminGuideBadge: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginRight: Spacing.sm,
  },
  adminGuideBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  adminSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  adminSectionTitle: { fontSize: 14, fontWeight: "700" },
  adminInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: 14,
  },
  adminPrimaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  adminPrimaryButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  adminSecondaryButton: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    alignItems: "center",
  },
  adminSecondaryButtonText: { fontSize: 14, fontWeight: "600" },
  adminAddButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  adminAddButtonText: { fontSize: 12, fontWeight: "600" },
  adminFeatureRow: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  adminFeatureInfo: { flex: 1, marginRight: Spacing.sm },
  adminFeatureTitle: { fontSize: 14, fontWeight: "600" },
  adminFeatureMeta: { fontSize: 12, marginTop: 2 },
  adminEditButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  adminEditButtonText: { fontSize: 12, fontWeight: "600" },
  adminActions: { gap: Spacing.sm },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    padding: Spacing.lg,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    gap: Spacing.sm,
    maxHeight: "85%",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  modalTitle: { fontSize: 16, fontWeight: "700" },
  modalInput: {
    borderWidth: 1,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: 14,
  },
  modalSteps: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  modalCategoryRow: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  modalCategoryChip: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    alignItems: "center",
  },
  modalCategoryText: { fontSize: 12, fontWeight: "600" },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
});
