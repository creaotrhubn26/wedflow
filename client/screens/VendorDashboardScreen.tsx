import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as Clipboard from "expo-clipboard";

import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

interface VendorSession {
  sessionToken: string;
  vendorId: string;
  email: string;
  businessName: string;
}

interface DeliveryItem {
  id: string;
  type: string;
  label: string;
  url: string;
  description: string | null;
}

interface Delivery {
  id: string;
  coupleName: string;
  coupleEmail: string | null;
  accessCode: string;
  title: string;
  description: string | null;
  weddingDate: string | null;
  status: string;
  createdAt: string;
  items: DeliveryItem[];
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

type TabType = "deliveries" | "inspirations" | "messages" | "products" | "offers";

interface Conversation {
  id: string;
  coupleId: string;
  vendorId: string;
  inspirationId: string | null;
  status: string;
  lastMessageAt: string;
  vendorUnreadCount: number;
  couple: { id: string; displayName: string; email: string };
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
  couple: { id: string; displayName: string; email: string } | null;
  items: VendorOfferItem[];
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

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    const sessionData = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
    if (sessionData) {
      setSession(JSON.parse(sessionData));
    } else {
      navigation.replace("VendorLogin");
    }
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
      if (!response.ok) throw new Error("Kunne ikke hente inspirasjoner");
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

  const totalUnread = conversationsData.reduce((sum, c) => sum + (c.vendorUnreadCount || 0), 0);

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
    } else {
      await refetchConversations();
    }
    setIsRefreshing(false);
  }, [activeTab, refetchDeliveries, refetchInspirations, refetchConversations, refetchProducts, refetchOffers]);

  const handleLogout = async () => {
    Alert.alert(
      "Logg ut",
      "Er du sikker på at du vil logge ut?",
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Logg ut",
          style: "destructive",
          onPress: async () => {
            if (session?.sessionToken) {
              try {
                await fetch(new URL("/api/vendors/logout", getApiUrl()).toString(), {
                  method: "POST",
                  headers: {
                    Authorization: `Bearer ${session.sessionToken}`,
                  },
                });
              } catch {
              }
            }
            await AsyncStorage.removeItem(VENDOR_STORAGE_KEY);
            queryClient.clear();
            navigation.replace("VendorLogin");
          },
        },
      ]
    );
  };

  const copyAccessCode = async (code: string) => {
    await Clipboard.setStringAsync(code);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert("Kopiert!", `Tilgangskode ${code} er kopiert.`);
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
      default: return Colors.dark.accent;
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

  const renderInspirationItem = ({ item, index }: { item: Inspiration; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <View style={[styles.deliveryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "30" }]}>
              <ThemedText style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {getStatusLabel(item.status)}
              </ThemedText>
            </View>
          </View>
          {item.category ? (
            <ThemedText style={[styles.coupleName, { color: theme.textSecondary }]}>
              {item.category.name}
            </ThemedText>
          ) : null}
          {item.description ? (
            <ThemedText style={[styles.dateText, { color: theme.textMuted, marginTop: 4 }]} numberOfLines={2}>
              {item.description}
            </ThemedText>
          ) : null}
        </View>

        <View style={styles.itemsList}>
          <View style={styles.itemRow}>
            <Feather name="image" size={14} color={theme.textSecondary} />
            <ThemedText style={[styles.itemLabel, { color: theme.textSecondary }]}>
              {item.media.length} {item.media.length === 1 ? "bilde/video" : "bilder/videoer"}
            </ThemedText>
          </View>
        </View>

        <ThemedText style={[styles.createdAt, { color: theme.textMuted }]}>
          Opprettet {formatDate(item.createdAt)}
        </ThemedText>
      </View>
    </Animated.View>
  );

  const renderDeliveryItem = ({ item, index }: { item: Delivery; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <View style={[styles.deliveryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: Colors.dark.accent + "30" }]}>
              <ThemedText style={[styles.statusText, { color: Colors.dark.accent }]}>
                Aktiv
              </ThemedText>
            </View>
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
            style={[styles.copyBtn, { backgroundColor: Colors.dark.accent + "20" }]}
          >
            <Feather name="copy" size={16} color={Colors.dark.accent} />
          </Pressable>
        </View>

        <View style={styles.itemsList}>
          {item.items.map((deliveryItem) => (
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
      </View>
    </Animated.View>
  );

  if (!session) {
    return (
      <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
        <ActivityIndicator size="large" color={Colors.dark.accent} />
      </View>
    );
  }

  const isLoading = 
    activeTab === "deliveries" ? deliveriesLoading : 
    activeTab === "inspirations" ? inspirationsLoading : 
    activeTab === "products" ? productsLoading :
    activeTab === "offers" ? offersLoading :
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

  const renderProductItem = ({ item, index }: { item: VendorProduct; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <View style={[styles.deliveryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
            <ThemedText style={[styles.priceTag, { color: Colors.dark.accent }]}>
              {formatPrice(item.unitPrice)} / {item.unitType}
            </ThemedText>
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
      </View>
    </Animated.View>
  );

  const renderOfferItem = ({ item, index }: { item: VendorOffer; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <View style={[styles.deliveryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <ThemedText style={styles.cardTitle}>{item.title}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: getOfferStatusColor(item.status) + "30" }]}>
              <ThemedText style={[styles.statusText, { color: getOfferStatusColor(item.status) }]}>
                {getOfferStatusLabel(item.status)}
              </ThemedText>
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
          <ThemedText style={[styles.offerTotal, { color: Colors.dark.accent }]}>
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
      </View>
    </Animated.View>
  );

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

  const renderConversationItem = ({ item, index }: { item: Conversation; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(300)}>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          navigation.navigate("VendorChat", { conversationId: item.id, coupleName: item.couple.displayName });
        }}
        style={[styles.deliveryCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <ThemedText style={styles.cardTitle}>{item.couple.displayName}</ThemedText>
            {item.vendorUnreadCount > 0 ? (
              <View style={[styles.unreadBadge, { backgroundColor: Colors.dark.accent }]}>
                <ThemedText style={styles.unreadText}>{item.vendorUnreadCount}</ThemedText>
              </View>
            ) : null}
          </View>
          <ThemedText style={[styles.coupleName, { color: theme.textSecondary }]}>
            {item.couple.email}
          </ThemedText>
          {item.inspiration ? (
            <ThemedText style={[styles.dateText, { color: Colors.dark.accent, marginTop: 4 }]}>
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

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: headerHeight + Spacing.md }]}>
        <View style={styles.headerLeft}>
          <ThemedText style={styles.welcomeText}>Velkommen tilbake,</ThemedText>
          <ThemedText style={styles.businessName}>{session.businessName}</ThemedText>
        </View>
        <Pressable onPress={handleLogout} style={styles.logoutBtn}>
          <Feather name="log-out" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabContainer}
      >
        <Pressable
          onPress={() => setActiveTab("deliveries")}
          style={[
            styles.tab,
            activeTab === "deliveries" && { borderBottomColor: Colors.dark.accent, borderBottomWidth: 2 }
          ]}
        >
          <Feather name="package" size={16} color={activeTab === "deliveries" ? Colors.dark.accent : theme.textMuted} />
          <ThemedText style={[styles.tabText, { color: activeTab === "deliveries" ? Colors.dark.accent : theme.textMuted }]}>
            Leveranser
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("inspirations")}
          style={[
            styles.tab,
            activeTab === "inspirations" && { borderBottomColor: Colors.dark.accent, borderBottomWidth: 2 }
          ]}
        >
          <Feather name="image" size={16} color={activeTab === "inspirations" ? Colors.dark.accent : theme.textMuted} />
          <ThemedText style={[styles.tabText, { color: activeTab === "inspirations" ? Colors.dark.accent : theme.textMuted }]}>
            Inspirasjon
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("products")}
          style={[
            styles.tab,
            activeTab === "products" && { borderBottomColor: Colors.dark.accent, borderBottomWidth: 2 }
          ]}
        >
          <Feather name="shopping-bag" size={16} color={activeTab === "products" ? Colors.dark.accent : theme.textMuted} />
          <ThemedText style={[styles.tabText, { color: activeTab === "products" ? Colors.dark.accent : theme.textMuted }]}>
            Produkter
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("offers")}
          style={[
            styles.tab,
            activeTab === "offers" && { borderBottomColor: Colors.dark.accent, borderBottomWidth: 2 }
          ]}
        >
          <Feather name="file-text" size={16} color={activeTab === "offers" ? Colors.dark.accent : theme.textMuted} />
          <ThemedText style={[styles.tabText, { color: activeTab === "offers" ? Colors.dark.accent : theme.textMuted }]}>
            Tilbud
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab("messages")}
          style={[
            styles.tab,
            activeTab === "messages" && { borderBottomColor: Colors.dark.accent, borderBottomWidth: 2 }
          ]}
        >
          <View style={styles.tabWithBadge}>
            <Feather name="message-circle" size={16} color={activeTab === "messages" ? Colors.dark.accent : theme.textMuted} />
            {totalUnread > 0 ? (
              <View style={[styles.tabBadge, { backgroundColor: Colors.dark.accent }]}>
                <ThemedText style={styles.tabBadgeText}>{totalUnread}</ThemedText>
              </View>
            ) : null}
          </View>
          <ThemedText style={[styles.tabText, { color: activeTab === "messages" ? Colors.dark.accent : theme.textMuted }]}>
            Meldinger
          </ThemedText>
        </Pressable>
      </ScrollView>

      {activeTab !== "messages" ? (
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
          style={[styles.createBtn, { backgroundColor: Colors.dark.accent }]}
        >
          <Feather name="plus" size={20} color="#1A1A1A" />
          <ThemedText style={styles.createBtnText}>
            {activeTab === "deliveries" ? "Ny leveranse" : 
             activeTab === "inspirations" ? "Ny inspirasjon" :
             activeTab === "products" ? "Nytt produkt" : "Nytt tilbud"}
          </ThemedText>
        </Pressable>
      ) : null}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.dark.accent} />
        </View>
      ) : activeTab === "deliveries" ? (
        <FlatList
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
              tintColor={Colors.dark.accent}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Feather name="package" size={48} color={theme.textMuted} />
              <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
                Ingen leveranser ennå
              </ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: theme.textMuted }]}>
                Opprett din første leveranse for å dele innhold med brudepar
              </ThemedText>
            </View>
          )}
        />
      ) : activeTab === "inspirations" ? (
        <FlatList
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
              tintColor={Colors.dark.accent}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Feather name="image" size={48} color={theme.textMuted} />
              <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
                Ingen inspirasjoner ennå
              </ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: theme.textMuted }]}>
                Del vakre bilder og videoer for å inspirere brudepar
              </ThemedText>
            </View>
          )}
        />
      ) : activeTab === "products" ? (
        <FlatList
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
              tintColor={Colors.dark.accent}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Feather name="shopping-bag" size={48} color={theme.textMuted} />
              <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
                Ingen produkter ennå
              </ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: theme.textMuted }]}>
                Opprett produkter og tjenester for å kunne sende tilbud
              </ThemedText>
            </View>
          )}
        />
      ) : activeTab === "offers" ? (
        <FlatList
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
              tintColor={Colors.dark.accent}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Feather name="file-text" size={48} color={theme.textMuted} />
              <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
                Ingen tilbud ennå
              </ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: theme.textMuted }]}>
                Send tilbud til brudepar basert på dine produkter
              </ThemedText>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={conversationsData}
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
              tintColor={Colors.dark.accent}
            />
          }
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Feather name="message-circle" size={48} color={theme.textMuted} />
              <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
                Ingen meldinger ennå
              </ThemedText>
              <ThemedText style={[styles.emptySubtext, { color: theme.textMuted }]}>
                Når brudepar kontakter deg, vil samtalene vises her
              </ThemedText>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    opacity: 0.7,
  },
  businessName: {
    fontSize: 20,
    fontWeight: "700",
  },
  logoutBtn: {
    padding: Spacing.sm,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  createBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  createBtnText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    alignItems: "center",
    paddingTop: Spacing.xl * 2,
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    marginTop: Spacing.xs,
  },
  deliveryCard: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  cardHeader: {
    marginBottom: Spacing.md,
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
  },
  tabWithBadge: {
    flexDirection: "row",
    alignItems: "center",
  },
  tabBadge: {
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 4,
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1A1A1A",
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
});
