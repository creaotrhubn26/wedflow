import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  StyleSheet,
  View,
  Pressable,
  ActivityIndicator,
  FlatList,
  ScrollView,
  Dimensions,
  RefreshControl,
  Image,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { ThemedText } from "@/components/ThemedText";
import { Card } from "@/components/Card";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Typography } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getVendorConfig, getEnabledTabs, type VendorTab } from "@/lib/vendor-adapter";
import { showToast } from "@/lib/toast";
import { showConfirm, showOptions } from "@/lib/dialogs";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

interface VendorSession {
  sessionToken: string;
  vendorId: string;
  businessName: string;
}

// Types (matching server schema)
interface Delivery {
  id: string;
  title: string;
  link: string | null;
  createdAt: string;
  description?: string;
  accessCode: string;
  status?: string;
  coupleName?: string;
  weddingDate?: string | null;
  items?: any[]; // delivery items
}

interface UpcomingEvent {
  id: string;
  eventDate: string;
  eventType: string;
  notes: string | null;
  couple?: {
    id: string;
    displayName: string;
  };
}

interface VendorProfile {
  id: string;
  businessName: string;
  description: string | null;
  category: {
    id: string;
    name: string;
  } | null;
}

interface VendorCoupleAccess {
  id: string;
  displayName: string;
  weddingDate: string | null;
  accessTypes: string[];
}

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

interface InspirationMedia {
  id: string;
  type: string;
  url: string;
  caption: string | null;
}

interface InspirationCategory {
  id: string;
  name: string;
  icon: string;
}

interface Inspiration {
  id: string;
  title: string;
  description: string | null;
  coverImageUrl: string | null;
  status: string;
  createdAt: string;
  media: InspirationMedia[];
  category: InspirationCategory | null;
}

type TabType = "deliveries" | "inspirations" | "messages" | "products" | "offers" | "reviews" | "couples";

interface Conversation {
  id: string;
  coupleId: string;
  vendorId: string;
  inspirationId: string | null;
  status: string;
  lastMessageAt: string | null;
  vendorUnreadCount: number;
  couple?: { id: string; displayName: string; email: string; weddingDate: string | null };
  inspiration: { id: string; title: string } | null;
  lastMessage: { body: string; senderType: string; createdAt: string } | null;
}

interface VendorProduct {
  id: string;
  title: string;
  description: string | null;
  unitPrice: number;
  unitType: string;
  leadTimeDays: number | null;
  minQuantity: number | null;
  categoryTag: string | null;
  imageUrl: string | null;
  sortOrder: number | null;
  createdAt: string;
}

interface VendorOfferItem {
  id: string;
  title: string;
  description: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

interface VendorOffer {
  id: string;
  title: string;
  message: string | null;
  status: string;
  totalAmount: number;
  currency: string | null;
  validUntil: string | null;
  createdAt: string;
  couple?: { id: string; displayName: string; email: string };
  items: VendorOfferItem[];
}

interface VendorReceivedReview {
  id: string;
  contractId: string;
  rating: number;
  title: string | null;
  body: string | null;
  isAnonymous: boolean;
  isApproved: boolean;
  createdAt: string;
  coupleName: string;
  response: { id: string; body: string; createdAt: string } | null;
}

interface VendorContract {
  id: string;
  coupleId: string;
  status: string;
  completedAt: string | null;
  reviewReminderSentAt: string | null;
  coupleName: string;
  hasReview: boolean;
}

interface CoupleContract {
  id: string;
  coupleId: string;
  coupleName: string;
  weddingDate: string | null;
  vendorRole: string | null;
  status: string;
  canViewSchedule: boolean;
  canViewSpeeches: boolean;
  canViewTableSeating: boolean;
  createdAt: string;
}

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export default function VendorDashboardScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [session, setSession] = useState<VendorSession | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("deliveries");
  const [conversationFilter, setConversationFilter] = useState<"all" | "unread" | "favorites">("all");
  const [conversationSort, setConversationSort] = useState<"recent" | "name" | "unread">("recent");
  const [favoriteConversations, setFavoriteConversations] = useState<Set<string>>(new Set());
  const wsRef = useRef<WebSocket | null>(null);
  const [wsConversations, setWsConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    loadSession();
    loadFavorites();
  }, []);

  const loadSession = async () => {
    const sessionData = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
    if (sessionData) {
      setSession(JSON.parse(sessionData));
    } else {
      navigation.replace("VendorLogin");
    }
  };

  const loadFavorites = async () => {
    try {
      const favoritesData = await AsyncStorage.getItem("vendor_favorite_conversations");
      if (favoritesData) {
        setFavoriteConversations(new Set(JSON.parse(favoritesData)));
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
    }
  };

  const toggleFavorite = async (conversationId: string) => {
    const newFavorites = new Set(favoriteConversations);
    if (newFavorites.has(conversationId)) {
      newFavorites.delete(conversationId);
    } else {
      newFavorites.add(conversationId);
    }
    setFavoriteConversations(newFavorites);
    await AsyncStorage.setItem("vendor_favorite_conversations", JSON.stringify(Array.from(newFavorites)));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const { data: deliveries = [], isLoading: deliveriesLoading, refetch: refetchDeliveries } = useQuery<Delivery[]>({
    queryKey: ["/api/vendor/deliveries"],
    queryFn: async () => {
      if (!session?.sessionToken) return [];
      const response = await fetch(new URL("/api/vendor/deliveries", getApiUrl()).toString(), {
        headers: {
          Authorization: `Bearer ${session.sessionToken}`,
        },
      });
      if (!response.ok) throw new Error("Kunne ikke hente leveranser");
      return response.json();
    },
    enabled: !!session?.sessionToken,
  });

  const { data: inspirationsData = [], isLoading: inspirationsLoading, refetch: refetchInspirations } = useQuery<Inspiration[]>({
    queryKey: ["/api/vendor/inspirations"],
    queryFn: async () => {
      if (!session?.sessionToken) return [];
      const response = await fetch(new URL("/api/vendor/inspirations", getApiUrl()).toString(), {
        headers: {
          Authorization: `Bearer ${session.sessionToken}`,
        },
      });
      if (!response.ok) throw new Error("Kunne ikke hente showcases");
      return response.json();
    },
    enabled: !!session?.sessionToken,
  });

  const { data: conversationsData = [], isLoading: conversationsLoading, refetch: refetchConversations } = useQuery<Conversation[]>({
    queryKey: ["/api/vendor/conversations"],
    queryFn: async () => {
      if (!session?.sessionToken) return [];
      const response = await fetch(new URL("/api/vendor/conversations", getApiUrl()).toString(), {
        headers: {
          Authorization: `Bearer ${session.sessionToken}`,
        },
      });
      if (!response.ok) throw new Error("Kunne ikke hente samtaler");
      return response.json();
    },
    enabled: !!session?.sessionToken,
  });

  // Query subscription status
  const { data: subscriptionStatus } = useQuery({
    queryKey: ["/api/vendor/subscription/status", session?.sessionToken],
    queryFn: async () => {
      if (!session?.sessionToken) return null;
      const response = await fetch(new URL("/api/vendor/subscription/status", getApiUrl()).toString(), {
        headers: {
          Authorization: `Bearer ${session.sessionToken}`,
        },
      });
      if (!response.ok) return null;
      return response.json();
    },
    enabled: !!session?.sessionToken,
    refetchInterval: 60000, // Refetch every minute
  });

  // Merge fetched conversations with WebSocket updates
  const mergedConversationsData = React.useMemo(() => {
    const base = [...conversationsData];
    for (const ws of wsConversations) {
      const idx = base.findIndex((c) => c.id === ws.id);
      if (idx >= 0) {
        base[idx] = ws;
      }
    }
    return base;
  }, [conversationsData, wsConversations]);

  // Filter and sort conversations
  const filteredAndSortedConversations = React.useMemo(() => {
    let filtered = [...mergedConversationsData];

    // Apply filter
    if (conversationFilter === "unread") {
      filtered = filtered.filter(conv => conv.vendorUnreadCount > 0);
    } else if (conversationFilter === "favorites") {
      filtered = filtered.filter(conv => favoriteConversations.has(conv.id));
    }

    // Apply sort
    if (conversationSort === "recent") {
      filtered.sort((a, b) => new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime());
    } else if (conversationSort === "name") {
      filtered.sort((a, b) => (a.couple?.displayName || "").localeCompare(b.couple?.displayName || ""));
    } else if (conversationSort === "unread") {
      filtered.sort((a, b) => b.vendorUnreadCount - a.vendorUnreadCount);
    }

    return filtered;
  }, [mergedConversationsData, conversationFilter, conversationSort, favoriteConversations]);

  const { data: productsData = [], isLoading: productsLoading, refetch: refetchProducts } = useQuery<VendorProduct[]>({
    queryKey: ["/api/vendor/products"],
    queryFn: async () => {
      if (!session?.sessionToken) return [];
      const response = await fetch(new URL("/api/vendor/products", getApiUrl()).toString(), {
        headers: {
          Authorization: `Bearer ${session.sessionToken}`,
        },
      });
      if (!response.ok) throw new Error("Kunne ikke hente produkter");
      return response.json();
    },
    enabled: !!session?.sessionToken,
  });

  const { data: offersData = [], isLoading: offersLoading, refetch: refetchOffers } = useQuery<VendorOffer[]>({
    queryKey: ["/api/vendor/offers"],
    queryFn: async () => {
      if (!session?.sessionToken) return [];
      const response = await fetch(new URL("/api/vendor/offers", getApiUrl()).toString(), {
        headers: {
          Authorization: `Bearer ${session.sessionToken}`,
        },
      });
      if (!response.ok) throw new Error("Kunne ikke hente tilbud");
      return response.json();
    },
    enabled: !!session?.sessionToken,
  });

  const { data: vendorProfile } = useQuery<{ 
    googleReviewUrl: string | null;
    category: { id: string; name: string } | null;
  }>({
    queryKey: ["/api/vendor/profile"],
    queryFn: async () => {
      if (!session?.sessionToken) return { googleReviewUrl: null, category: null };
      const response = await fetch(new URL("/api/vendor/profile", getApiUrl()).toString(), {
        headers: {
          Authorization: `Bearer ${session.sessionToken}`,
        },
      });
      if (!response.ok) return { googleReviewUrl: null, category: null };
      return response.json();
    },
    enabled: !!session?.sessionToken,
  });

  const { data: reviewsResponse, isLoading: reviewsLoading, refetch: refetchReviews } = useQuery<{ reviews: VendorReceivedReview[]; stats: { total: number; approved: number; average: number } }>({
    queryKey: ["/api/vendor/reviews"],
    queryFn: async () => {
      if (!session?.sessionToken) return { reviews: [], stats: { total: 0, approved: 0, average: 0 } };
      const response = await fetch(new URL("/api/vendor/reviews", getApiUrl()).toString(), {
        headers: {
          Authorization: `Bearer ${session.sessionToken}`,
        },
      });
      if (!response.ok) throw new Error("Kunne ikke hente anmeldelser");
      return response.json();
    },
    enabled: !!session?.sessionToken,
  });

  const reviewsData = reviewsResponse?.reviews || [];

  const { data: contractsData = [], refetch: refetchContracts } = useQuery<VendorContract[]>({
    queryKey: ["/api/vendor/contracts"],
    queryFn: async () => {
      if (!session?.sessionToken) return [];
      const response = await fetch(new URL("/api/vendor/contracts", getApiUrl()).toString(), {
        headers: {
          Authorization: `Bearer ${session.sessionToken}`,
        },
      });
      if (!response.ok) throw new Error("Kunne ikke hente kontrakter");
      return response.json();
    },
    enabled: !!session?.sessionToken,
  });

  // Query for couple contracts with schedule access
  const { data: coupleContractsData = [], refetch: refetchCoupleContracts } = useQuery<CoupleContract[]>({
    queryKey: ["/api/vendor/couple-contracts"],
    queryFn: async () => {
      if (!session?.sessionToken) return [];
      const response = await fetch(new URL("/api/vendor/couple-contracts", getApiUrl()).toString(), {
        headers: {
          Authorization: `Bearer ${session.sessionToken}`,
        },
      });
      if (!response.ok) throw new Error("Kunne ikke hente brudepar");
      return response.json();
    },
    enabled: !!session?.sessionToken,
  });

  const completedWithoutReview = contractsData.filter(c => c.status === "completed" && !c.hasReview);

  const sendReminderMutation = useMutation({
    mutationFn: async (contractId: string) => {
      if (!session?.sessionToken) throw new Error("Ikke autentisert");
      const response = await fetch(
        new URL(`/api/vendor/contracts/${contractId}/review-reminder`, getApiUrl()).toString(),
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.sessionToken}`,
          },
        }
      );
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Kunne ikke sende påminnelse");
      }
      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast("Påminnelse om anmeldelse er sendt til brudeparet.");
      refetchContracts();
    },
    onError: (error: any) => {
      showToast(error.message || "Kunne ikke sende påminnelse");
    },
  });

  const totalUnread = mergedConversationsData.reduce((sum, c) => sum + (c.vendorUnreadCount || 0), 0);

  // Get vendor category configuration
  const vendorConfig = getVendorConfig(
    vendorProfile?.category?.id || null,
    vendorProfile?.category?.name || null
  );
  const enabledTabs = getEnabledTabs(vendorConfig);

  useEffect(() => {
    const firstTab = enabledTabs[0]?.key;
    const stillEnabled = enabledTabs.some((t) => t.key === activeTab);
    if (!stillEnabled && firstTab) {
      setActiveTab(firstTab);
    }
  }, [enabledTabs, activeTab]);

  // Helper: Calculate business insights
  const getBusinessInsights = () => {
    const insights = [];
    const pendingOffers = offersData.filter(o => o.status === "pending").length;
    const unapprovedReviews = reviewsData.filter(r => !r.isApproved).length;
    const emptyDeliveries = deliveries.filter(d => (d.items?.length || 0) === 0).length;
    const draftShowcases = inspirationsData.filter(i => i.status === "draft").length;
    const completedWithoutReview = contractsData.filter(c => c.status === "completed" && !c.hasReview && !c.reviewReminderSentAt);

    if (totalUnread > 0) {
      insights.push({
        icon: "message-circle" as const,
        label: `${totalUnread} ulest${totalUnread > 1 ? 'e' : ''} melding${totalUnread > 1 ? 'er' : ''}`,
        color: "#FF3B30",
        priority: "urgent",
        action: () => setActiveTab("messages"),
      });
    }
    if (vendorConfig.insights.showPendingOffers && pendingOffers > 0) {
      insights.push({
        icon: "clock" as const,
        label: `${pendingOffers} tilbud venter svar`,
        color: "#FFB74D",
        priority: "high",
        action: () => setActiveTab("offers"),
      });
    }
    if (vendorConfig.insights.showReviewRequests && completedWithoutReview.length > 0) {
      insights.push({
        icon: "star" as const,
        label: `${completedWithoutReview.length} kan anmeldes`,
        color: theme.accent,
        priority: "normal",
        action: () => setActiveTab("reviews"),
      });
    }
    if (vendorConfig.insights.showReviewRequests && unapprovedReviews > 0) {
      insights.push({
        icon: "eye" as const,
        label: `${unapprovedReviews} nye anmeldelse${unapprovedReviews > 1 ? 'r' : ''}`,
        color: "#64B5F6",
        priority: "normal",
        action: () => setActiveTab("reviews"),
      });
    }
    return insights.slice(0, 3); // Max 3 insights
  };

  const businessInsights = getBusinessInsights();

  // Helper: Get quick stats
  const getQuickStats = () => {
    const stats = [];
    if (vendorConfig.quickStats.showDeliveryCount && deliveries.length > 0) {
      const activeDeliveries = deliveries.filter(d => d.status === "active").length;
      stats.push({ label: "Leveranser", value: activeDeliveries, total: deliveries.length, icon: "package" as const });
    }
    if (vendorConfig.quickStats.showShowcaseCount && inspirationsData.length > 0) {
      const publishedShowcases = inspirationsData.filter(i => i.status === "published").length;
      stats.push({ label: "Showcase", value: publishedShowcases, total: inspirationsData.length, icon: "image" as const });
    }
    if (vendorConfig.quickStats.showOfferAcceptance && offersData.length > 0) {
      const acceptedOffers = offersData.filter(o => o.status === "accepted").length;
      stats.push({ label: "Tilbud", value: acceptedOffers, total: offersData.length, icon: "file-text" as const });
    }
    if (vendorConfig.quickStats.showAverageRating && reviewsData.length > 0) {
      const avgRating = reviewsResponse?.stats?.average || 0;
      stats.push({ label: "Snitt rating", value: avgRating.toFixed(1), icon: "star" as const, isRating: true });
    }
    return stats;
  };

  const quickStats = getQuickStats();

  // WebSocket subscription for vendor list updates
  useEffect(() => {
    if (!session?.sessionToken) return;
    let closedByUs = false;
    let reconnectTimer: any = null;

    const connect = () => {
      try {
        const wsUrl = getApiUrl().replace(/^http/, "ws") + `/ws/vendor-list?token=${encodeURIComponent(session.sessionToken)}`;
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse((event as any).data);
            if (data?.type === "conv-update" && data.payload?.conversationId) {
              const { conversationId, lastMessageAt, vendorUnreadCount } = data.payload as { conversationId: string; lastMessageAt?: string; vendorUnreadCount?: number };
              setWsConversations((prev) => {
                const idx = prev.findIndex((c) => c.id === conversationId);
                const baseConv = conversationsData.find((c) => c.id === conversationId);
                if (!baseConv) return prev; // unknown conversation
                const updated = { ...baseConv, lastMessageAt: lastMessageAt || baseConv.lastMessageAt, vendorUnreadCount: typeof vendorUnreadCount === "number" ? vendorUnreadCount : baseConv.vendorUnreadCount };
                if (idx >= 0) {
                  const list = [...prev];
                  list[idx] = updated;
                  return list;
                } else {
                  return [...prev, updated];
                }
              });
            }
          } catch {}
        };
        ws.onclose = () => {
          if (!closedByUs) reconnectTimer = setTimeout(connect, 3000);
        };
      } catch {
        reconnectTimer = setTimeout(connect, 3000);
      }
    };

    connect();
    return () => {
      closedByUs = true;
      try { wsRef.current?.close(); } catch {}
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, [session?.sessionToken, conversationsData]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    if (activeTab === "deliveries") {
      await refetchDeliveries();
    } else if (activeTab === "inspirations") {
      await refetchInspirations();
    } else if (activeTab === "products") {
      await refetchProducts();
    } else if (activeTab === "offers") {
      await refetchOffers();
    } else if (activeTab === "reviews") {
      await Promise.all([refetchReviews(), refetchContracts()]);
    } else if (activeTab === "couples") {
      await refetchCoupleContracts();
    } else {
      await refetchConversations();
    }
    setIsRefreshing(false);
  }, [activeTab, refetchDeliveries, refetchInspirations, refetchConversations, refetchProducts, refetchOffers, refetchReviews, refetchContracts, refetchCoupleContracts]);

  const handleLogout = async () => {
    const performLogout = async () => {
      if (session?.sessionToken) {
        try {
          await fetch(new URL("/api/vendors/logout", getApiUrl()).toString(), {
            method: "POST",
            headers: {
              Authorization: `Bearer ${session.sessionToken}`,
            },
          });
        } catch {
          // Ignore errors
        }
      }
      await AsyncStorage.removeItem(VENDOR_STORAGE_KEY);
      // Clear preview session if in preview mode
      await AsyncStorage.removeItem("preview_session_token");
      await AsyncStorage.removeItem("preview_admin_key");
      await AsyncStorage.removeItem("preview_mode");
      await AsyncStorage.removeItem("preview_user_id");
      queryClient.clear();
      navigation.replace("VendorLogin");
    };

    const confirmed = await showConfirm({
      title: "Logg ut",
      message: "Er du sikker på at du vil logge ut?",
      confirmLabel: "Logg ut",
      cancelLabel: "Avbryt",
      destructive: true,
    });
    if (confirmed) {
      await performLogout();
    }
  };

  const copyAccessCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    showToast(`Tilgangskode ${code} er kopiert.`);
  };

  const getTypeIcon = (type: string): keyof typeof Feather.glyphMap => {
    switch (type) {
      case "gallery": return "image";
      case "video": return "video";
      case "website": return "globe";
      case "download": return "download";
      case "contract": return "file-text";
      case "document": return "file";
      default: return "link";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("nb-NO", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "#4CAF50";
      case "pending": return "#FF9800";
      case "rejected": return "#F44336";
      default: return theme.accent;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved": return "Godkjent";
      case "pending": return "Venter";
      case "rejected": return "Avvist";
      default: return status;
    }
  };

  const renderInspirationItem = ({ item, index }: { item: Inspiration; index: number }) => {
    // Get thumbnail: prefer coverImageUrl, then first image from media
    const thumbnailUrl = item.coverImageUrl || item.media.find(m => m.type === "image")?.url;
    const thumbnails = item.media.filter(m => m.type === "image").slice(0, 4);
    
    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate("InspirationCreate", { inspiration: item });
          }}
          style={[styles.showcaseCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          {/* Thumbnail Grid */}
          {thumbnails.length > 0 ? (
            <View style={styles.thumbnailGrid}>
              {thumbnails.length === 1 ? (
                <Image
                  source={{ uri: thumbnails[0].url }}
                  style={styles.singleThumbnail}
                  resizeMode="cover"
                />
              ) : thumbnails.length === 2 ? (
                <View style={styles.twoThumbnails}>
                  {thumbnails.map((media, i) => (
                    <Image
                      key={media.id}
                      source={{ uri: media.url }}
                      style={styles.halfThumbnail}
                      resizeMode="cover"
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.gridThumbnails}>
                  <Image
                    source={{ uri: thumbnails[0].url }}
                    style={styles.mainThumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.sideThumbnails}>
                    {thumbnails.slice(1, 4).map((media, i) => (
                      <View key={media.id} style={styles.smallThumbnailWrapper}>
                        <Image
                          source={{ uri: media.url }}
                          style={styles.smallThumbnail}
                          resizeMode="cover"
                        />
                        {i === 2 && item.media.length > 4 && (
                          <View style={styles.moreOverlay}>
                            <ThemedText style={styles.moreText}>+{item.media.length - 4}</ThemedText>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {/* Status badge overlay */}
              <View style={[styles.statusOverlay, { backgroundColor: getStatusColor(item.status) }]}>
                <ThemedText style={styles.statusOverlayText}>
                  {getStatusLabel(item.status)}
                </ThemedText>
              </View>
            </View>
          ) : (
            <View style={[styles.noThumbnail, { backgroundColor: theme.backgroundRoot }]}>
              <Feather name="image" size={32} color={theme.textMuted} />
              <ThemedText style={[styles.noThumbnailText, { color: theme.textMuted }]}>Ingen bilder</ThemedText>
            </View>
          )}

          {/* Content */}
          <View style={styles.showcaseContent}>
            <ThemedText style={[styles.showcaseTitle, { color: theme.text }]} numberOfLines={1}>
              {item.title}
            </ThemedText>
            {item.category ? (
              <View style={styles.categoryRow}>
                <Feather name="folder" size={12} color={theme.textSecondary} />
                <ThemedText style={[styles.categoryText, { color: theme.textSecondary }]}>
                  {item.category.name}
                </ThemedText>
              </View>
            ) : null}
            {item.description ? (
              <ThemedText style={[styles.showcaseDescription, { color: theme.textMuted }]} numberOfLines={2}>
                {item.description}
              </ThemedText>
            ) : null}
            <View style={styles.showcaseFooter}>
              <View style={styles.mediaCount}>
                <Feather name="image" size={12} color={theme.textMuted} />
                <ThemedText style={[styles.mediaCountText, { color: theme.textMuted }]}>
                  {item.media.length}
                </ThemedText>
              </View>
              <ThemedText style={[styles.showcaseDate, { color: theme.textMuted }]}>
                {formatDate(item.createdAt)}
              </ThemedText>
            </View>
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  const renderDeliveryItem = ({ item, index }: { item: Delivery; index: number }) => {
    // Get thumbnails from delivery items that are images
    const imageThumbnails = (item.items || [])
      .filter((i: any) => i.type === "image" || i.type === "photo" || i.url.match(/\.(jpg|jpeg|png|gif|webp)$/i))
      .slice(0, 4);

    const duplicateDelivery = () => {
      const duplicated = {
        ...item,
        id: undefined,
        title: `Kopi av ${item.title}`,
        accessCode: undefined,
        createdAt: undefined,
      };
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate("DeliveryCreate", { delivery: duplicated });
    };
    
    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate("DeliveryCreate", { delivery: item });
          }}
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            showOptions({
              title: item.title,
              message: "Velg handling",
              cancelLabel: "Avbryt",
              options: [
                { label: "Rediger", onPress: () => navigation.navigate("DeliveryCreate", { delivery: item }) },
                { label: "Dupliser", onPress: duplicateDelivery },
              ],
            });
          }}
          style={[styles.deliveryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          {/* Thumbnail Grid */}
          {imageThumbnails.length > 0 ? (
            <View style={styles.deliveryThumbnailGrid}>
              {imageThumbnails.length === 1 ? (
                <Image
                  source={{ uri: imageThumbnails[0].url }}
                  style={styles.deliverySingleThumbnail}
                  resizeMode="cover"
                />
              ) : imageThumbnails.length === 2 ? (
                <View style={styles.deliveryTwoThumbnails}>
                  {imageThumbnails.map((img) => (
                    <Image
                      key={img.id}
                      source={{ uri: img.url }}
                      style={styles.deliveryHalfThumbnail}
                      resizeMode="cover"
                    />
                  ))}
                </View>
              ) : (
                <View style={styles.deliveryGridThumbnails}>
                  <Image
                    source={{ uri: imageThumbnails[0].url }}
                    style={styles.deliveryMainThumbnail}
                    resizeMode="cover"
                  />
                  <View style={styles.deliverySideThumbnails}>
                    {imageThumbnails.slice(1, 4).map((img, i) => (
                      <View key={img.id} style={styles.deliverySmallWrapper}>
                        <Image
                          source={{ uri: img.url }}
                          style={styles.deliverySmallThumbnail}
                          resizeMode="cover"
                        />
                        {i === 2 && (item.items || []).filter((it: any) => it.type === "image" || it.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length > 4 && (
                          <View style={styles.deliveryMoreOverlay}>
                            <ThemedText style={styles.deliveryMoreText}>
                              +{(item.items || []).filter((it: any) => it.type === "image" || it.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)).length - 4}
                            </ThemedText>
                          </View>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}
              {/* Status badge overlay */}
              <View style={[styles.deliveryStatusOverlay, { backgroundColor: theme.accent }]}>
                <ThemedText style={styles.deliveryStatusText}>Aktiv</ThemedText>
              </View>
            </View>
          ) : null}

          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
              {imageThumbnails.length === 0 && (
                <View style={[styles.statusBadge, { backgroundColor: theme.accent + "30" }]}>
                  <ThemedText style={[styles.statusText, { color: theme.accent }]}>
                    Aktiv
                  </ThemedText>
                </View>
              )}
            </View>
            <ThemedText style={[styles.coupleName, { color: theme.textSecondary }]}>
              {item.coupleName}
            </ThemedText>
            {item.weddingDate ? (
              <View style={styles.dateRow}>
                <Feather name="calendar" size={12} color={theme.textMuted} />
                <ThemedText style={[styles.dateText, { color: theme.textMuted }]}>
                  {item.weddingDate}
                </ThemedText>
              </View>
            ) : null}
          </View>

          <View style={[styles.accessCodeContainer, { backgroundColor: theme.backgroundRoot }]}>
            <View style={styles.accessCodeLeft}>
              <ThemedText style={[styles.accessCodeLabel, { color: theme.textMuted }]}>Tilgangskode:</ThemedText>
              <ThemedText style={styles.accessCode}>{item.accessCode}</ThemedText>
            </View>
            <Pressable
              onPress={() => copyAccessCode(item.accessCode)}
              style={[styles.copyBtn, { backgroundColor: theme.accent + "20" }]}
            >
              <Feather name="copy" size={16} color={theme.accent} />
            </Pressable>
          </View>

          <View style={styles.itemsList}>
            {(item.items || []).map((deliveryItem: any) => (
              <View key={deliveryItem.id} style={styles.itemRow}>
                <Feather name={getTypeIcon(deliveryItem.type)} size={14} color={theme.textSecondary} />
                <ThemedText style={[styles.itemLabel, { color: theme.textSecondary }]} numberOfLines={1}>
                  {deliveryItem.label}
                </ThemedText>
              </View>
            ))}
          </View>

          <ThemedText style={[styles.createdAt, { color: theme.textMuted }]}>
            Opprettet {formatDate(item.createdAt)}
          </ThemedText>
        </Pressable>
      </Animated.View>
    );
  };

  if (!session) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={theme.accent} />
      </View>
    );
  }

  const isLoading = 
    activeTab === "deliveries" ? deliveriesLoading : 
    activeTab === "inspirations" ? inspirationsLoading : 
    activeTab === "products" ? productsLoading :
    activeTab === "offers" ? offersLoading :
    activeTab === "reviews" ? reviewsLoading :
    conversationsLoading;

  const formatPrice = (priceInOre: number) => {
    return (priceInOre / 100).toLocaleString("nb-NO", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " kr";
  };

  const getOfferStatusColor = (status: string) => {
    switch (status) {
      case "accepted": return "#4CAF50";
      case "declined": return "#F44336";
      case "expired": return "#9E9E9E";
      default: return "#FF9800";
    }
  };

  const getOfferStatusLabel = (status: string) => {
    switch (status) {
      case "accepted": return "Akseptert";
      case "declined": return "Avslått";
      case "expired": return "Utløpt";
      default: return "Venter";
    }
  };

  const renderProductItem = ({ item, index }: { item: VendorProduct; index: number }) => {
    const duplicateProduct = () => {
      const duplicated = {
        ...item,
        id: undefined,
        title: `Kopi av ${item.title}`,
      };
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate("ProductCreate", { product: duplicated });
    };

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate("ProductCreate", { product: item });
          }}
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            showOptions({
              title: item.title,
              message: "Velg handling",
              cancelLabel: "Avbryt",
              options: [
                { label: "Rediger", onPress: () => navigation.navigate("ProductCreate", { product: item }) },
                { label: "Dupliser", onPress: duplicateProduct },
              ],
            });
          }}
          style={[styles.deliveryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
              <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.xs }}>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    duplicateProduct();
                  }}
                  style={[styles.quickActionBtn, { backgroundColor: theme.accent + "20" }]}
                >
                  <Feather name="copy" size={14} color={theme.accent} />
                </Pressable>
                <ThemedText style={[styles.priceTag, { color: theme.accent }]}>
                  {formatPrice(item.unitPrice)} / {item.unitType}
                </ThemedText>
              </View>
            </View>
            {item.description ? (
              <ThemedText style={[styles.dateText, { color: theme.textMuted, marginTop: 4 }]} numberOfLines={2}>
                {item.description}
              </ThemedText>
            ) : null}
          </View>
          <View style={styles.itemsList}>
            {item.minQuantity && item.minQuantity > 1 ? (
              <View style={styles.itemRow}>
                <Feather name="hash" size={14} color={theme.textSecondary} />
                <ThemedText style={[styles.itemLabel, { color: theme.textSecondary }]}>
                  Min. antall: {item.minQuantity}
                </ThemedText>
              </View>
            ) : null}
            {item.leadTimeDays ? (
              <View style={styles.itemRow}>
                <Feather name="clock" size={14} color={theme.textSecondary} />
                <ThemedText style={[styles.itemLabel, { color: theme.textSecondary }]}>
                  Leveringstid: {item.leadTimeDays} dager
                </ThemedText>
              </View>
            ) : null}
            {item.categoryTag ? (
              <View style={styles.itemRow}>
                <Feather name="tag" size={14} color={theme.textSecondary} />
                <ThemedText style={[styles.itemLabel, { color: theme.textSecondary }]}>
                  {item.categoryTag}
                </ThemedText>
              </View>
            ) : null}
          </View>
        </Pressable>
      </Animated.View>
    );
  };

  const renderOfferItem = ({ item, index }: { item: VendorOffer; index: number }) => {
    const duplicateOffer = () => {
      const duplicated = {
        ...item,
        id: undefined,
        title: `Kopi av ${item.title}`,
        status: "pending",
        createdAt: undefined,
      };
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.navigate("OfferCreate", { offer: duplicated });
    };

    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate("OfferCreate", { offer: item });
          }}
          onLongPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            showOptions({
              title: item.title,
              message: "Velg handling",
              cancelLabel: "Avbryt",
              options: [
                { label: "Rediger", onPress: () => navigation.navigate("OfferCreate", { offer: item }) },
                { label: "Dupliser", onPress: duplicateOffer },
              ],
            });
          }}
          style={[styles.deliveryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
              <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.xs }}>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    duplicateOffer();
                  }}
                  style={[styles.quickActionBtn, { backgroundColor: theme.accent + "20" }]}
                >
                  <Feather name="copy" size={14} color={theme.accent} />
                </Pressable>
                <View style={[styles.statusBadge, { backgroundColor: getOfferStatusColor(item.status) + "30" }]}>
                  <ThemedText style={[styles.statusText, { color: getOfferStatusColor(item.status) }]}>
                    {getOfferStatusLabel(item.status)}
                  </ThemedText>
                </View>
              </View>
            </View>
          {item.couple ? (
            <ThemedText style={[styles.coupleName, { color: theme.textSecondary }]}>
              Til: {item.couple.displayName}
            </ThemedText>
          ) : null}
        </View>
        <View style={[styles.offerTotalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <ThemedText style={[styles.offerTotalLabel, { color: theme.textMuted }]}>Totalt:</ThemedText>
          <ThemedText style={[styles.offerTotal, { color: theme.accent }]}>
            {formatPrice(item.totalAmount)}
          </ThemedText>
        </View>
        <View style={styles.itemsList}>
          {item.items.slice(0, 3).map((offerItem) => (
            <View key={offerItem.id} style={styles.itemRow}>
              <Feather name="check" size={14} color={theme.textSecondary} />
              <ThemedText style={[styles.itemLabel, { color: theme.textSecondary }]} numberOfLines={1}>
                {offerItem.quantity}x {offerItem.title} - {formatPrice(offerItem.lineTotal)}
              </ThemedText>
            </View>
          ))}
          {item.items.length > 3 ? (
            <ThemedText style={[styles.moreItems, { color: theme.textMuted }]}>
              + {item.items.length - 3} flere linjer
            </ThemedText>
          ) : null}
        </View>
        <ThemedText style={[styles.createdAt, { color: theme.textMuted }]}>
          Sendt {formatDate(item.createdAt)}
        </ThemedText>
      </Pressable>
    </Animated.View>
  );
};

  const formatConversationTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return date.toLocaleTimeString("no-NO", { hour: "2-digit", minute: "2-digit" });
    if (days === 1) return "I går";
    if (days < 7) return date.toLocaleDateString("no-NO", { weekday: "short" });
    return date.toLocaleDateString("no-NO", { day: "numeric", month: "short" });
  };

  const renderConversationItem = ({ item, index }: { item: Conversation; index: number }) => {
    const isFavorite = favoriteConversations.has(item.id);
    
    return (
      <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            navigation.navigate("VendorChat", {
              conversationId: item.id,
              coupleName: item.couple?.displayName || "Unknown",
              chatType: "couple",
            });
          }}
          style={[styles.deliveryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <ThemedText style={styles.cardTitle}>{item.couple?.displayName || "Unknown"}</ThemedText>
              <View style={styles.conversationBadges}>
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleFavorite(item.id);
                  }}
                  style={styles.favoriteBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Feather 
                    name={isFavorite ? "star" : "star"} 
                    size={18} 
                    color={isFavorite ? "#FFD700" : theme.textMuted}
                    fill={isFavorite ? "#FFD700" : "none"}
                  />
                </Pressable>
                {item.vendorUnreadCount > 0 ? (
                  <View style={[styles.unreadBadge, { backgroundColor: theme.accent }]}>
                    <ThemedText style={styles.unreadText}>{item.vendorUnreadCount}</ThemedText>
                  </View>
                ) : null}
              </View>
            </View>
            <ThemedText style={[styles.coupleName, { color: theme.textSecondary }]}>
              {item.couple?.email || "No email"}
            </ThemedText>
            {item.inspiration ? (
              <ThemedText style={[styles.dateText, { color: theme.accent, marginTop: 4 }]}>
                {item.inspiration.title}
              </ThemedText>
            ) : null}
          </View>
          {item.lastMessage ? (
            <View style={styles.lastMessageContainer}>
              <ThemedText style={[styles.lastMessage, { color: theme.textSecondary }]} numberOfLines={2}>
                {item.lastMessage.senderType === "vendor" ? "Du: " : ""}{item.lastMessage.body}
              </ThemedText>
              <ThemedText style={[styles.messageTime, { color: theme.textMuted }]}>
                {formatConversationTime(item.lastMessage.createdAt)}
              </ThemedText>
            </View>
          ) : null}
        </Pressable>
      </Animated.View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: headerHeight + Spacing.lg }]}>
        <View style={[styles.headerCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
          <Pressable 
            onPress={() => navigation.navigate("VendorProfile")}
            style={styles.headerContent}
          >
            <View style={[styles.avatarContainer, { backgroundColor: theme.accent }]}>
              <ThemedText style={styles.avatarText}>
                {session.businessName.charAt(0).toUpperCase()}
              </ThemedText>
            </View>
            <View style={styles.headerTextContainer}>
              <ThemedText style={[styles.welcomeText, { color: theme.textMuted }]}>Velkommen tilbake</ThemedText>
              <ThemedText style={[styles.businessName, { color: theme.text }]} numberOfLines={1}>{session.businessName}</ThemedText>
            </View>
            <View style={[styles.profileArrow, { backgroundColor: theme.accent + "15" }]}>
              <Feather name="chevron-right" size={16} color={theme.accent} />
            </View>
          </Pressable>
          <Pressable 
            onPress={handleLogout} 
            style={({ pressed }) => [
              styles.logoutBtn, 
              { backgroundColor: pressed ? theme.backgroundTertiary : theme.backgroundSecondary }
            ]}
          >
            <Feather name="log-out" size={18} color={theme.textSecondary} />
          </Pressable>
          <Pressable 
            onPress={() => navigation.navigate("VendorHelp")}
            style={({ pressed }) => [
              styles.logoutBtn,
              { backgroundColor: pressed ? theme.backgroundTertiary : theme.backgroundSecondary }
            ]}
            accessibilityLabel="Hjelp & FAQ"
          >
            <Feather name="help-circle" size={18} color={theme.accent} />
          </Pressable>
          <Pressable 
            onPress={() => navigation.navigate("VendorAdminChat")}
            style={({ pressed }) => [
              styles.logoutBtn,
              { backgroundColor: pressed ? theme.backgroundTertiary : theme.backgroundSecondary }
            ]}
            accessibilityLabel="Evendi Support"
          >
            <Feather name="message-circle" size={18} color={theme.accent} />
          </Pressable>
        </View>
      </View>

      {/* Payment Reminder Banner - FOMO messaging */}
      {subscriptionStatus?.needsPayment && (
        <View style={[styles.paymentBanner, { backgroundColor: subscriptionStatus.isPaused ? "#EF5350" : "#FFA726" }]}>
          <Feather name={subscriptionStatus.isPaused ? "lock" : "alert-triangle"} size={24} color="#1A1A1A" />
          <View style={{ flex: 1, marginLeft: Spacing.md }}>
            <ThemedText style={styles.paymentBannerTitle}>
              {subscriptionStatus.isPaused 
                ? "Tilgangen din er satt på pause" 
                : `Kun ${subscriptionStatus.daysRemaining} dager igjen!`}
            </ThemedText>
            <ThemedText style={styles.paymentBannerText}>
              {subscriptionStatus.isPaused 
                ? "Du går glipp av nye henvendelser, showcase-visninger og potensielle kunder" 
                : "Sikre din plass og fortsett å motta henvendelser fra brudepar"}
            </ThemedText>
            {subscriptionStatus.isPaused && (
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Feather name="x-circle" size={14} color="#1A1A1A" />
                  <ThemedText style={[styles.paymentBannerText, { fontSize: 13, fontWeight: "600" }]}>Ingen showcase</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Feather name="mail" size={14} color="#1A1A1A" />
                  <ThemedText style={[styles.paymentBannerText, { fontSize: 13, fontWeight: "600" }]}>Meldinger deaktivert</ThemedText>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                  <Feather name="slash" size={14} color="#1A1A1A" />
                  <ThemedText style={[styles.paymentBannerText, { fontSize: 13, fontWeight: "600" }]}>Henvendelser blokkert</ThemedText>
                </View>
              </View>
            )}
          </View>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate("VendorPayment");
            }}
            style={[styles.paymentBtn, { backgroundColor: "#1A1A1A" }]}
          >
            <ThemedText style={styles.paymentBtnText}>
              {subscriptionStatus.isPaused ? "Reaktiver" : "Sikre plass"}
            </ThemedText>
            <Feather name="arrow-right" size={16} color={subscriptionStatus.isPaused ? "#EF5350" : "#FFA726"} />
          </Pressable>
        </View>
      )}

      {/* Trial Info Banner - Progressive scarcity */}
      {subscriptionStatus?.isTrialing && !subscriptionStatus.needsPayment && (
        <Pressable
          onPress={() => {
            const days = subscriptionStatus.daysRemaining;
            let message = "Du har full tilgang til alle funksjoner i prøveperioden.";
            
            if (days <= 7) {
              // Navigate to payment screen instead of just showing alert
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate("VendorPayment");
              return;
            } else if (days <= 14) {
              message = `${days} dager til prøveperioden utløper. Ikke gå glipp av potensielle kunder!`;
            }

            if (days <= 14) {
              showOptions({
                title: days <= 7 ? "Prøveperioden går snart ut!" : "Prøveperiode aktiv",
                message,
                cancelLabel: "OK",
                options: [
                  { label: "Betal nå", onPress: () => navigation.navigate("VendorPayment") },
                ],
              });
            } else {
              showToast(message);
            }
          }}
          style={[
            styles.trialBanner, 
            { 
              backgroundColor: subscriptionStatus.daysRemaining <= 7 
                ? "#FFA726" + "20" 
                : theme.accent + "20", 
              borderColor: subscriptionStatus.daysRemaining <= 7 
                ? "#FFA726" 
                : theme.accent 
            }
          ]}
        >
          <Feather 
            name={subscriptionStatus.daysRemaining <= 7 ? "alert-circle" : "star"} 
            size={18} 
            color={subscriptionStatus.daysRemaining <= 7 ? "#FFA726" : theme.accent} 
          />
          <View style={{ flex: 1, marginLeft: Spacing.sm }}>
            <ThemedText 
              style={[
                styles.trialBannerText, 
                { color: subscriptionStatus.daysRemaining <= 7 ? "#FFA726" : theme.accent }
              ]}
            >
              {subscriptionStatus.daysRemaining <= 3 
                ? `${subscriptionStatus.daysRemaining} dager igjen av prøveperioden` 
                : subscriptionStatus.daysRemaining <= 7
                ? `${subscriptionStatus.daysRemaining} dager igjen - sikre din plass nå`
                : `Prøveperiode: ${subscriptionStatus.daysRemaining} dager gjenstår`}
            </ThemedText>
            {subscriptionStatus.daysRemaining <= 7 && (
              <ThemedText style={[styles.trialBannerSubtext, { color: "#FFA726" }]}>
                Trykk for å se hva du mister
              </ThemedText>
            )}
          </View>
          {subscriptionStatus.daysRemaining <= 7 && (
            <Feather name="chevron-right" size={18} color="#FFA726" />
          )}
        </Pressable>
      )}

      {/* Business Insights */}
      {businessInsights.length > 0 && (
        <View style={styles.insightsContainer}>
          {businessInsights.map((insight, idx) => (
            <Pressable
              key={idx}
              onPress={() => {
                insight.action();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.insightCard,
                { 
                  backgroundColor: insight.color + "15", 
                  borderLeftColor: insight.color,
                  borderLeftWidth: 3,
                }
              ]}
            >
              <Feather name={insight.icon} size={16} color={insight.color} />
              <ThemedText style={[styles.insightText, { color: theme.text }]}>
                {insight.label}
              </ThemedText>
              <Feather name="chevron-right" size={14} color={insight.color} />
            </Pressable>
          ))}
        </View>
      )}

      {/* Quick Stats */}
      {quickStats.length > 0 && activeTab === "deliveries" && (
        <View style={[styles.statsContainer, { backgroundColor: theme.backgroundDefault }]}>
          {quickStats.map((stat, idx) => (
            <View key={idx} style={styles.quickStatCard}>
              <Feather name={stat.icon} size={16} color={theme.accent} />
              <View style={styles.quickStatContent}>
                <ThemedText style={[styles.quickStatValue, { color: theme.text }]}>
                  {stat.isRating ? stat.value : `${stat.value}${stat.total ? `/${stat.total}` : ''}`}
                </ThemedText>
                <ThemedText style={[styles.quickStatLabel, { color: theme.textMuted }]}>
                  {stat.label}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>
      )}

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainer}
        style={[styles.tabScroll, { backgroundColor: theme.backgroundRoot }]}
      >
        {enabledTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const badge = tab.key === "messages" ? totalUnread : tab.key === "reviews" ? reviewsData.length : undefined;
          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setActiveTab(tab.key);
              }}
              style={({ pressed }) => [
                styles.tab,
                isActive && [styles.tabActive, { backgroundColor: theme.accent }],
                !isActive && { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
                pressed && !isActive && { backgroundColor: theme.backgroundSecondary },
              ]}
            >
              <View style={styles.tabIconContainer}>
                <Feather 
                  name={tab.icon} 
                  size={20} 
                  color={isActive ? "#FFFFFF" : theme.textSecondary} 
                />
                {badge && badge > 0 ? (
                  <View style={[styles.tabBadge, { backgroundColor: isActive ? "#FFFFFF" : theme.accent }]}>
                    <ThemedText style={[styles.tabBadgeText, { color: isActive ? theme.accent : "#FFFFFF" }]}>
                      {badge > 9 ? "9+" : badge}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
              <ThemedText 
                style={[
                  styles.tabText, 
                  { color: isActive ? "#FFFFFF" : theme.textSecondary },
                  isActive && { fontWeight: "600" }
                ]}
              >
                {tab.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>


      {activeTab !== "messages" && activeTab !== "reviews" && activeTab !== "couples" ? (
        <View style={styles.createBtnContainer}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              if (activeTab === "deliveries") {
                navigation.navigate("DeliveryCreate");
              } else if (activeTab === "inspirations") {
                navigation.navigate("InspirationCreate");
              } else if (activeTab === "products") {
                navigation.navigate("ProductCreate");
              } else if (activeTab === "offers") {
                navigation.navigate("OfferCreate");
              }
            }}
            style={({ pressed }) => [
              styles.createBtn,
              { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
              pressed && { backgroundColor: theme.backgroundSecondary, transform: [{ scale: 0.98 }] }
            ]}
          >
            <View style={[styles.createBtnIconCircle, { backgroundColor: theme.accent }]}>
              <Feather 
                name={
                  activeTab === "deliveries" ? "package" : 
                  activeTab === "inspirations" ? "image" :
                  activeTab === "products" ? "shopping-bag" : "file-text"
                } 
                size={18} 
                color="#FFFFFF" 
              />
            </View>
            <View style={styles.createBtnContent}>
              <ThemedText style={[styles.createBtnText, { color: theme.text }]}>
                {activeTab === "deliveries" ? "Ny leveranse" : 
                 activeTab === "inspirations" ? "Ny showcase" :
                 activeTab === "products" ? "Nytt produkt" : "Nytt tilbud"}
              </ThemedText>
              <ThemedText style={[styles.createBtnSubtext, { color: theme.textSecondary }]}>
                {activeTab === "deliveries" ? "Del innhold med brudepar" : 
                 activeTab === "inspirations" ? "Vis frem ditt arbeid" :
                 activeTab === "products" ? "Legg til tjeneste eller vare" : "Send pristilbud til par"}
              </ThemedText>
            </View>
            <View style={[styles.createBtnArrow, { backgroundColor: theme.accent + "15" }]}>
              <Feather name="plus" size={20} color={theme.accent} />
            </View>
          </Pressable>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : activeTab === "deliveries" ? (
        <FlatList
          style={{ zIndex: 1, flex: 1 }}
          data={deliveries}
          renderItem={renderDeliveryItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.accent}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: theme.accent + "15" }]}>
                <Feather name="package" size={32} color={theme.accent} />
              </View>
              <ThemedText style={[styles.emptyText, { color: theme.text }]}>
                {vendorConfig.emptyStates.deliveries.title}
              </ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                {vendorConfig.emptyStates.deliveries.subtitle}
              </ThemedText>
            </View>
          )}
        />
      ) : activeTab === "inspirations" ? (
        <FlatList
          style={{ zIndex: 1, flex: 1 }}
          data={inspirationsData}
          renderItem={renderInspirationItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.accent}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: theme.accent + "15" }]}>
                <Feather name="image" size={32} color={theme.accent} />
              </View>
              <ThemedText style={[styles.emptyText, { color: theme.text }]}>
                {vendorConfig.emptyStates.inspirations.title}
              </ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                {vendorConfig.emptyStates.inspirations.subtitle}
              </ThemedText>
            </View>
          )}
        />
      ) : activeTab === "products" ? (
        <FlatList
          style={{ zIndex: 1, flex: 1 }}
          data={productsData}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.accent}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: theme.accent + "15" }]}>
                <Feather name="shopping-bag" size={32} color={theme.accent} />
              </View>
              <ThemedText style={[styles.emptyText, { color: theme.text }]}>
                {vendorConfig.emptyStates.products.title}
              </ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                {vendorConfig.emptyStates.products.subtitle}
              </ThemedText>
            </View>
          )}
        />
      ) : activeTab === "offers" ? (
        <FlatList
          style={{ zIndex: 1, flex: 1 }}
          data={offersData}
          renderItem={renderOfferItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.accent}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: theme.accent + "15" }]}>
                <Feather name="file-text" size={32} color={theme.accent} />
              </View>
              <ThemedText style={[styles.emptyText, { color: theme.text }]}>
                Ingen tilbud ennå
              </ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                Send tilbud til brudepar basert på dine produkter
              </ThemedText>
            </View>
          )}
        />
      ) : activeTab === "reviews" ? (
        <FlatList
          style={{ zIndex: 1, flex: 1 }}
          data={reviewsData}
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
              <View style={[styles.deliveryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <ThemedText style={styles.cardTitle}>{item.coupleName}</ThemedText>
                    <View style={styles.reviewRatingRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Feather
                          key={star}
                          name="star"
                          size={14}
                          color={star <= item.rating ? theme.accent : theme.border}
                        />
                      ))}
                    </View>
                  </View>
                  {!item.isApproved ? (
                    <View style={[styles.statusBadge, { backgroundColor: "#FF9800" + "30" }]}>
                      <ThemedText style={[styles.statusText, { color: "#FF9800" }]}>
                        Under godkjenning
                      </ThemedText>
                    </View>
                  ) : null}
                </View>
                {item.title ? (
                  <ThemedText style={[styles.reviewTitle, { color: theme.text }]}>{item.title}</ThemedText>
                ) : null}
                {item.body ? (
                  <ThemedText style={[styles.reviewBody, { color: theme.textSecondary }]} numberOfLines={4}>
                    {item.body}
                  </ThemedText>
                ) : null}
                {item.response ? (
                  <View style={[styles.responseContainer, { backgroundColor: theme.backgroundRoot }]}>
                    <ThemedText style={[styles.responseLabel, { color: theme.accent }]}>Ditt svar:</ThemedText>
                    <ThemedText style={[styles.responseBody, { color: theme.textSecondary }]}>{item.response.body}</ThemedText>
                  </View>
                ) : null}
                <ThemedText style={[styles.createdAt, { color: theme.textMuted }]}>
                  {formatDate(item.createdAt)}
                </ThemedText>
              </View>
            </Animated.View>
          )}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.accent}
            />
          }
          ListHeaderComponent={() => (
            <View>
              {/* Google Reviews Link */}
              <View style={[styles.googleReviewsCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                <View style={styles.googleReviewsHeader}>
                  <View style={[styles.googleIconCircle, { backgroundColor: "#FFFFFF" }]}>
                    <Image
                      source={{ uri: "https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" }}
                      style={{ width: 22, height: 22 }}
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.googleReviewsText}>
                    <ThemedText style={[styles.googleReviewsTitle, { color: theme.text }]}>
                      Google Anmeldelser
                    </ThemedText>
                    <ThemedText style={[styles.googleReviewsSubtitle, { color: theme.textSecondary }]}>
                      {vendorProfile?.googleReviewUrl 
                        ? "Vis dine Google-anmeldelser til brudepar"
                        : "Legg til Google anmeldelser URL i profilen din"}
                    </ThemedText>
                  </View>
                </View>
                {vendorProfile?.googleReviewUrl ? (
                  <Pressable
                    style={[styles.googleReviewsBtn, { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#DADCE0" }]}
                    onPress={async () => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      try {
                        await Linking.openURL(vendorProfile.googleReviewUrl!);
                      } catch (e) {
                        showToast("Kunne ikke åpne lenken");
                      }
                    }}
                  >
                    <Image
                      source={{ uri: "https://www.gstatic.com/images/branding/product/2x/googleg_48dp.png" }}
                      style={{ width: 16, height: 16 }}
                      resizeMode="contain"
                    />
                    <ThemedText style={[styles.googleReviewsBtnText, { color: "#3C4043" }]}>Åpne i Google</ThemedText>
                  </Pressable>
                ) : (
                  <Pressable
                    style={[styles.googleReviewsBtn, { backgroundColor: theme.accent }]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      navigation.navigate("VendorProfile");
                    }}
                  >
                    <Feather name="edit-2" size={14} color="#FFFFFF" />
                    <ThemedText style={styles.googleReviewsBtnText}>Rediger profil</ThemedText>
                  </Pressable>
                )}
              </View>

              {/* Stats Card */}
              {reviewsResponse?.stats && reviewsResponse.stats.total > 0 ? (
                <View style={[styles.reviewStatsCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                  <View style={styles.statItem}>
                    <ThemedText style={[styles.statValue, { color: theme.accent }]}>
                      {Number(reviewsResponse.stats.average).toFixed(1)}
                    </ThemedText>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Feather
                          key={star}
                          name="star"
                          size={12}
                          color={star <= Math.round(Number(reviewsResponse.stats.average)) ? theme.accent : theme.border}
                        />
                      ))}
                    </View>
                    <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Snitt</ThemedText>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                  <View style={styles.statItem}>
                    <ThemedText style={[styles.statValue, { color: theme.text }]}>
                      {reviewsResponse.stats.total}
                    </ThemedText>
                    <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Totalt</ThemedText>
                  </View>
                  <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                  <View style={styles.statItem}>
                    <ThemedText style={[styles.statValue, { color: "#4CAF50" }]}>
                      {reviewsResponse.stats.approved}
                    </ThemedText>
                    <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>Godkjent</ThemedText>
                  </View>
                </View>
              ) : null}

              {/* Reminders Section */}
              {completedWithoutReview.length > 0 ? (
            <View style={styles.reminderSection}>
              <ThemedText style={[styles.reminderTitle, { color: theme.text }]}>
                Venter på anmeldelse
              </ThemedText>
              <ThemedText style={[styles.reminderSubtitle, { color: theme.textSecondary }]}>
                Send påminnelse til brudepar om å anmelde deg
              </ThemedText>
              {completedWithoutReview.map((contract) => {
                const canSend = !contract.reviewReminderSentAt || 
                  (Date.now() - new Date(contract.reviewReminderSentAt).getTime()) > 14 * 24 * 60 * 60 * 1000;
                return (
                  <View key={contract.id} style={[styles.reminderCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                    <View style={styles.reminderCardInfo}>
                      <ThemedText style={styles.reminderCoupleName}>{contract.coupleName}</ThemedText>
                      {contract.reviewReminderSentAt ? (
                        <ThemedText style={[styles.reminderSentText, { color: theme.textMuted }]}>
                          Påminnelse sendt {formatDate(contract.reviewReminderSentAt)}
                        </ThemedText>
                      ) : null}
                    </View>
                    <Pressable
                      style={[
                        styles.reminderBtn,
                        { backgroundColor: canSend ? theme.accent : theme.backgroundSecondary }
                      ]}
                      onPress={() => {
                        if (canSend) {
                          sendReminderMutation.mutate(contract.id);
                        } else {
                          showToast("Du kan kun sende påminnelse én gang per 14 dager.");
                        }
                      }}
                      disabled={sendReminderMutation.isPending}
                    >
                      <Feather 
                        name="send" 
                        size={14} 
                        color={canSend ? "#1A1A1A" : theme.textMuted} 
                      />
                      <ThemedText style={[
                        styles.reminderBtnText, 
                        { color: canSend ? "#1A1A1A" : theme.textMuted }
                      ]}>
                        Send
                      </ThemedText>
                    </Pressable>
                  </View>
                );
              })}
            </View>
              ) : null}
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: theme.accent + "15" }]}>
                <Feather name="star" size={32} color={theme.accent} />
              </View>
              <ThemedText style={[styles.emptyText, { color: theme.text }]}>
                Ingen anmeldelser ennå
              </ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                Når par anmelder dine tjenester, vil de vises her
              </ThemedText>
            </View>
          )}
        />
      ) : activeTab === "couples" ? (
        <FlatList
          style={{ zIndex: 1, flex: 1 }}
          data={coupleContractsData}
          renderItem={({ item, index }) => {
            const weddingDateFormatted = item.weddingDate 
              ? new Date(item.weddingDate).toLocaleDateString("nb-NO", { day: "numeric", month: "short", year: "numeric" })
              : null;
            return (
              <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
                <View style={[styles.deliveryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleRow}>
                      <View style={[styles.coupleAvatar, { backgroundColor: theme.accent + "20" }]}>
                        <Feather name="heart" size={18} color={theme.accent} />
                      </View>
                      <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                        <ThemedText style={styles.cardTitle}>{item.coupleName}</ThemedText>
                        {weddingDateFormatted && (
                          <ThemedText style={[styles.coupleDate, { color: theme.textSecondary }]}>
                            <Feather name="calendar" size={12} color={theme.textSecondary} /> {weddingDateFormatted}
                          </ThemedText>
                        )}
                      </View>
                    </View>
                    {item.vendorRole && (
                      <View style={[styles.statusBadge, { backgroundColor: theme.accent + "20" }]}>
                        <ThemedText style={[styles.statusText, { color: theme.accent }]}>
                          {item.vendorRole}
                        </ThemedText>
                      </View>
                    )}
                  </View>
                  <View style={styles.accessBadges}>
                    {item.canViewSchedule && (
                      <Pressable
                        onPress={() => {
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                          navigation.navigate("VendorCoupleSchedule", { 
                            coupleId: item.coupleId, 
                            coupleName: item.coupleName 
                          });
                        }}
                        style={[styles.accessBadge, { backgroundColor: "#4CAF50" + "20", borderColor: "#4CAF50" }]}
                      >
                        <Feather name="calendar" size={14} color="#4CAF50" />
                        <ThemedText style={[styles.accessBadgeText, { color: "#4CAF50" }]}>
                          Program
                        </ThemedText>
                        <Feather name="chevron-right" size={14} color="#4CAF50" />
                      </Pressable>
                    )}
                    {item.canViewSpeeches && (
                      <View style={[styles.accessBadge, { backgroundColor: "#2196F3" + "20", borderColor: "#2196F3" }]}>
                        <Feather name="mic" size={14} color="#2196F3" />
                        <ThemedText style={[styles.accessBadgeText, { color: "#2196F3" }]}>
                          Taler
                        </ThemedText>
                      </View>
                    )}
                    {item.canViewTableSeating && (
                      <View style={[styles.accessBadge, { backgroundColor: "#9C27B0" + "20", borderColor: "#9C27B0" }]}>
                        <Feather name="grid" size={14} color="#9C27B0" />
                        <ThemedText style={[styles.accessBadgeText, { color: "#9C27B0" }]}>
                          Bordplassering
                        </ThemedText>
                      </View>
                    )}
                    {!item.canViewSchedule && !item.canViewSpeeches && !item.canViewTableSeating && (
                      <View style={[styles.accessBadge, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}>
                        <Feather name="lock" size={14} color={theme.textMuted} />
                        <ThemedText style={[styles.accessBadgeText, { color: theme.textMuted }]}>
                          Ingen tilgang gitt ennå
                        </ThemedText>
                      </View>
                    )}
                  </View>
                </View>
              </Animated.View>
            );
          }}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{
            paddingHorizontal: Spacing.lg,
            paddingBottom: insets.bottom + Spacing.xl,
          }}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.accent}
            />
          }
          ListHeaderComponent={() => (
            <View style={[styles.coupleInfoCard, { backgroundColor: theme.accent + "10", borderColor: theme.accent }]}>
              <Feather name="info" size={18} color={theme.accent} />
              <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                <ThemedText style={[styles.coupleInfoTitle, { color: theme.accent }]}>
                  Brudepar med tilgang
                </ThemedText>
                <ThemedText style={[styles.coupleInfoText, { color: theme.textSecondary }]}>
                  Her ser du brudepar som har gitt deg tilgang til deres planlegging. Trykk på "Program" for å se tidslinjen og foreslå endringer.
                </ThemedText>
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: theme.accent + "15" }]}>
                <Feather name="users" size={32} color={theme.accent} />
              </View>
              <ThemedText style={[styles.emptyText, { color: theme.text }]}>
                Ingen brudepar ennå
              </ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                Når brudepar aksepterer dine tilbud og gir deg tilgang, vil de vises her
              </ThemedText>
            </View>
          )}
        />
      ) : activeTab === "messages" ? (
        <>
          <View style={[styles.filterControls, { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
            <View style={styles.filterRow}>
              <ThemedText style={[styles.filterLabel, { color: theme.textSecondary }]}>Filter:</ThemedText>
              <View style={styles.filterButtons}>
                <Pressable
                  onPress={() => {
                    setConversationFilter("all");
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.filterChip,
                    conversationFilter === "all" && { backgroundColor: theme.accent },
                    { borderColor: theme.border }
                  ]}
                >
                  <ThemedText style={[
                    styles.filterChipText,
                    conversationFilter === "all" && { color: "#1A1A1A" },
                    { color: theme.text }
                  ]}>
                    Alle
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setConversationFilter("unread");
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.filterChip,
                    conversationFilter === "unread" && { backgroundColor: theme.accent },
                    { borderColor: theme.border }
                  ]}
                >
                  <Feather 
                    name="message-circle" 
                    size={14} 
                    color={conversationFilter === "unread" ? "#1A1A1A" : theme.text} 
                  />
                  <ThemedText style={[
                    styles.filterChipText,
                    conversationFilter === "unread" && { color: "#1A1A1A" },
                    { color: theme.text }
                  ]}>
                    Ulest
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setConversationFilter("favorites");
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.filterChip,
                    conversationFilter === "favorites" && { backgroundColor: theme.accent },
                    { borderColor: theme.border }
                  ]}
                >
                  <Feather 
                    name="star" 
                    size={14} 
                    color={conversationFilter === "favorites" ? "#1A1A1A" : theme.text} 
                  />
                  <ThemedText style={[
                    styles.filterChipText,
                    conversationFilter === "favorites" && { color: "#1A1A1A" },
                    { color: theme.text }
                  ]}>
                    Favoritter
                  </ThemedText>
                </Pressable>
              </View>
            </View>
            <View style={styles.filterRow}>
              <ThemedText style={[styles.filterLabel, { color: theme.textSecondary }]}>Sorter:</ThemedText>
              <View style={styles.filterButtons}>
                <Pressable
                  onPress={() => {
                    setConversationSort("recent");
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.filterChip,
                    conversationSort === "recent" && { backgroundColor: theme.accent },
                    { borderColor: theme.border }
                  ]}
                >
                  <Feather 
                    name="clock" 
                    size={14} 
                    color={conversationSort === "recent" ? "#1A1A1A" : theme.text} 
                  />
                  <ThemedText style={[
                    styles.filterChipText,
                    conversationSort === "recent" && { color: "#1A1A1A" },
                    { color: theme.text }
                  ]}>
                    Nylig
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setConversationSort("name");
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.filterChip,
                    conversationSort === "name" && { backgroundColor: theme.accent },
                    { borderColor: theme.border }
                  ]}
                >
                  <Feather 
                    name="user" 
                    size={14} 
                    color={conversationSort === "name" ? "#1A1A1A" : theme.text} 
                  />
                  <ThemedText style={[
                    styles.filterChipText,
                    conversationSort === "name" && { color: "#1A1A1A" },
                    { color: theme.text }
                  ]}>
                    Navn
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => {
                    setConversationSort("unread");
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.filterChip,
                    conversationSort === "unread" && { backgroundColor: theme.accent },
                    { borderColor: theme.border }
                  ]}
                >
                  <Feather 
                    name="message-square" 
                    size={14} 
                    color={conversationSort === "unread" ? "#1A1A1A" : theme.text} 
                  />
                  <ThemedText style={[
                    styles.filterChipText,
                    conversationSort === "unread" && { color: "#1A1A1A" },
                    { color: theme.text }
                  ]}>
                    Uleste
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          </View>
          <FlatList
            style={{ zIndex: 1, flex: 1 }}
            data={filteredAndSortedConversations}
            renderItem={renderConversationItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: Spacing.lg,
              paddingBottom: insets.bottom + Spacing.xl,
            }}
            ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
            refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={theme.accent}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <View style={[styles.emptyIconContainer, { backgroundColor: theme.accent + "15" }]}>
                <Feather name="message-circle" size={32} color={theme.accent} />
              </View>
              <ThemedText style={[styles.emptyText, { color: theme.text }]}>
                Ingen meldinger ennå
              </ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary }]}>
                Når brudepar kontakter deg, vil samtalene vises her
              </ThemedText>
            </View>
          )}
        />
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    position: "relative",
    zIndex: 1000,
    elevation: 1000,
    flexShrink: 0,
  },
  headerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.md,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  headerTextContainer: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  businessName: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  profileArrow: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.sm,
  },
  tabScroll: {
    flexGrow: 0,
    flexShrink: 0,
    position: "relative",
    zIndex: 999,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  tab: {
    alignItems: "center",
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "transparent",
    minWidth: 72,
  },
  tabActive: {
    borderWidth: 0,
    shadowColor: "#C9A962",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  tabIconContainer: {
    position: "relative",
    marginBottom: 4,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 0.1,
  },
  tabBadge: {
    position: "absolute",
    top: -6,
    right: -10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 9,
    fontWeight: "700",
  },
  createBtnContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    position: "relative",
    zIndex: 998,
    flexShrink: 0,
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.md,
  },
  createBtnIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  createBtnContent: {
    flex: 1,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  createBtnSubtext: {
    fontSize: 13,
    marginTop: 2,
  },
  createBtnArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: Spacing["4xl"],
    paddingHorizontal: Spacing["2xl"],
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: Spacing.sm,
    letterSpacing: -0.3,
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: "center",
    marginTop: Spacing.sm,
    lineHeight: 22,
    maxWidth: 280,
  },
  deliveryCard: {
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    overflow: "hidden",
  },
  deliveryThumbnailGrid: {
    height: 140,
    position: "relative",
  },
  deliverySingleThumbnail: {
    width: "100%",
    height: "100%",
  },
  deliveryTwoThumbnails: {
    flexDirection: "row",
    height: "100%",
    gap: 2,
  },
  deliveryHalfThumbnail: {
    flex: 1,
    height: "100%",
  },
  deliveryGridThumbnails: {
    flexDirection: "row",
    height: "100%",
    gap: 2,
  },
  deliveryMainThumbnail: {
    width: "60%",
    height: "100%",
  },
  deliverySideThumbnails: {
    flex: 1,
    gap: 2,
  },
  deliverySmallWrapper: {
    flex: 1,
    position: "relative",
  },
  deliverySmallThumbnail: {
    width: "100%",
    height: "100%",
  },
  deliveryMoreOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
  },
  deliveryMoreText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  deliveryStatusOverlay: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  deliveryStatusText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  deliveryCardContent: {
    padding: Spacing.lg,
  },
  cardHeader: {
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "600",
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  coupleName: {
    fontSize: 14,
    marginTop: 2,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 4,
  },
  dateText: {
    fontSize: 12,
  },
  accessCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    marginHorizontal: Spacing.lg,
  },
  accessCodeLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  accessCodeLabel: {
    fontSize: 13,
  },
  accessCode: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "monospace",
  },
  copyBtn: {
    padding: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  itemsList: {
    gap: 4,
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.lg,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  itemLabel: {
    fontSize: 13,
    flex: 1,
  },
  createdAt: {
    fontSize: 12,
    textAlign: "right",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  lastMessageContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  lastMessage: {
    fontSize: 14,
    flex: 1,
  },
  messageTime: {
    fontSize: 12,
  },
  priceTag: {
    fontSize: 14,
    fontWeight: "600",
  },
  offerTotalContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  offerTotalLabel: {
    fontSize: 13,
  },
  offerTotal: {
    fontSize: 16,
    fontWeight: "700",
  },
  moreItems: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: "italic",
  },
  reviewRatingRow: {
    flexDirection: "row",
    gap: 2,
  },
  reviewTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginTop: Spacing.sm,
  },
  reviewBody: {
    fontSize: 14,
    marginTop: Spacing.xs,
    lineHeight: 20,
  },
  responseContainer: {
    marginTop: Spacing.md,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  responseBody: {
    fontSize: 13,
  },
  reminderSection: {
    marginBottom: Spacing.xl,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  reminderSubtitle: {
    fontSize: 13,
    marginBottom: Spacing.md,
  },
  reminderCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  reminderCardInfo: {
    flex: 1,
  },
  reminderCoupleName: {
    fontSize: 15,
    fontWeight: "600",
  },
  reminderSentText: {
    fontSize: 12,
    marginTop: 2,
  },
  reminderBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  reminderBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  googleReviewsCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  googleReviewsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  googleIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  googleReviewsText: {
    flex: 1,
  },
  googleReviewsTitle: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  googleReviewsSubtitle: {
    fontSize: 13,
  },
  googleReviewsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  googleReviewsBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  reviewStatsCard: {
    flexDirection: "row",
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 4,
  },
  starsRow: {
    flexDirection: "row",
    gap: 2,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    marginVertical: Spacing.sm,
  },
  webViewContainer: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  webViewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  webViewHeaderText: {
    fontSize: 13,
    fontWeight: "500",
  },
  webViewWrapper: {
    overflow: "hidden",
  },
  webView: {
    flex: 1,
    backgroundColor: "transparent",
  },
  webViewLoading: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  // Showcase card with thumbnails
  showcaseCard: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  thumbnailGrid: {
    height: 160,
    position: "relative",
  },
  singleThumbnail: {
    width: "100%",
    height: "100%",
  },
  twoThumbnails: {
    flexDirection: "row",
    height: "100%",
    gap: 2,
  },
  halfThumbnail: {
    flex: 1,
    height: "100%",
  },
  gridThumbnails: {
    flexDirection: "row",
    height: "100%",
    gap: 2,
  },
  mainThumbnail: {
    flex: 2,
    height: "100%",
  },
  sideThumbnails: {
    flex: 1,
    gap: 2,
  },
  smallThumbnailWrapper: {
    flex: 1,
    position: "relative",
  },
  smallThumbnail: {
    width: "100%",
    height: "100%",
  },
  moreOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  moreText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  statusOverlay: {
    position: "absolute",
    top: Spacing.sm,
    right: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  statusOverlayText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  noThumbnail: {
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.xs,
  },
  noThumbnailText: {
    fontSize: 12,
    fontWeight: "500",
  },
  showcaseContent: {
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  showcaseTitle: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
  },
  showcaseDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  showcaseFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  mediaCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  mediaCountText: {
    fontSize: 12,
    fontWeight: "500",
  },
  showcaseDate: {
    fontSize: 11,
  },
  filterControls: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.sm,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: "600",
    minWidth: 50,
  },
  filterButtons: {
    flexDirection: "row",
    gap: Spacing.xs,
    flexWrap: "wrap",
    flex: 1,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  conversationBadges: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  favoriteBtn: {
    padding: 4,
  },
  paymentBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  paymentBannerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  paymentBannerText: {
    fontSize: 13,
    color: "#1A1A1A",
  },
  paymentBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  paymentBtnText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#FFA726",
  },
  trialBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  trialBannerText: {
    fontSize: 14,
    fontWeight: "600",
  },
  trialBannerSubtext: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  // Couples tab styles
  coupleAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  coupleDate: {
    fontSize: 12,
    marginTop: 2,
  },
  accessBadges: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
  },
  accessBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: 4,
  },
  accessBadgeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  quickActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  coupleInfoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  coupleInfoTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  coupleInfoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  insightsContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    gap: Spacing.sm,
  },
  insightCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  insightText: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.lg,
  },
  quickStatCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    paddingRight: Spacing.md,
  },
  quickStatContent: {
    gap: 2,
  },
  quickStatValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  quickStatLabel: {
    fontSize: 11,
  },
});
