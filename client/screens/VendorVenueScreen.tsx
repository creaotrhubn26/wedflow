import React, { useEffect, useState } from "react";
import { View, ScrollView, StyleSheet, Pressable, ActivityIndicator, RefreshControl, Modal, TextInput } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { EvendiIcon } from "@/components/EvendiIcon";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SwipeableRow } from "@/components/SwipeableRow";
import { SeatingChart, Table, Guest } from "@/components/SeatingChart";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import { getVendorConfig } from "@/lib/vendor-adapter";
import { showToast } from "@/lib/toast";
import { showConfirm, showOptions } from "@/lib/dialogs";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

type Navigation = NativeStackNavigationProp<any>;
type TabType = 'bookings' | 'seating' | 'timeline';

type VendorProduct = {
  id: string;
  title: string;
  description: string | null;
  unitPrice: number;
  unitType: string;
  imageUrl: string | null;
};

type VendorOffer = {
  id: string;
  title: string;
  status: string;
  totalAmount: number;
  currency: string | null;
  createdAt: string;
};

type VendorVenueBooking = {
  id: string;
  coupleName: string;
  date: string;
  time?: string;
  location?: string;
  capacity?: number;
  notes?: string;
  status?: 'considering' | 'booked' | 'confirmed';
  // Decision-making fields
  address?: string;
  maxGuests?: number;
  cateringIncluded?: boolean;
  accommodationAvailable?: boolean;
  checkoutTime?: string;
};

type VendorAvailability = {
  id: string;
  date: string;
  status: "available" | "blocked" | "limited";
  maxBookings?: number;
  notes?: string;
};

type VendorVenueTimeline = {
  siteVisitDone?: boolean;
  contractSigned?: boolean;
  depositReceived?: boolean;
  floorPlanFinalized?: boolean;
};

export default function VendorVenueScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const navigation = useNavigation<Navigation>();
  const queryClient = useQueryClient();
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('bookings');

  // Planner state
  const [bookings, setBookings] = useState<VendorVenueBooking[]>([]);
  const [availability, setAvailability] = useState<VendorAvailability[]>([]);
  const [timeline, setTimeline] = useState<VendorVenueTimeline>({});
  const [seatingTables, setSeatingTables] = useState<Table[]>([]);
  const [seatingGuests, setSeatingGuests] = useState<Guest[]>([]);

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<VendorVenueBooking | null>(null);
  const [editingAvailability, setEditingAvailability] = useState<VendorAvailability | null>(null);

  // Booking form
  const [coupleName, setCoupleName] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [bookingLocation, setBookingLocation] = useState("");
  const [bookingCapacity, setBookingCapacity] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [bookingStatus, setBookingStatus] = useState<'considering' | 'booked' | 'confirmed'>("considering");
  // Decision-making fields
  const [bookingAddress, setBookingAddress] = useState("");
  const [bookingMaxGuests, setBookingMaxGuests] = useState("");
  const [bookingCateringIncluded, setBookingCateringIncluded] = useState(false);
  const [bookingAccommodationAvailable, setBookingAccommodationAvailable] = useState(false);
  const [bookingCheckoutTime, setBookingCheckoutTime] = useState("");

  // Availability form
  const [availDate, setAvailDate] = useState("");
  const [availStatus, setAvailStatus] = useState<"available" | "blocked" | "limited">("available");
  const [availMaxBookings, setAvailMaxBookings] = useState("");
  const [availNotes, setAvailNotes] = useState("");

  const vendorConfig = getVendorConfig(null, "Venue");

  useEffect(() => {
    const loadSession = async () => {
      const data = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
      if (!data) {
        navigation.replace("VendorLogin");
        return;
      }
      const parsed = JSON.parse(data);
      setSessionToken(parsed?.sessionToken || null);
    };
    loadSession();
  }, [navigation]);

  const { data: products = [], isLoading: productsLoading, refetch: refetchProducts } = useQuery<VendorProduct[]>({
    queryKey: ["/api/vendor/products"],
    queryFn: async () => {
      if (!sessionToken) return [];
      const res = await fetch(new URL("/api/vendor/products", getApiUrl()).toString(), {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!sessionToken,
  });

  const { data: offers = [], isLoading: offersLoading, refetch: refetchOffers } = useQuery<VendorOffer[]>({
    queryKey: ["/api/vendor/offers"],
    queryFn: async () => {
      if (!sessionToken) return [];
      const res = await fetch(new URL("/api/vendor/offers", getApiUrl()).toString(), {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!sessionToken,
  });

  const bookingsQuery = useQuery<VendorVenueBooking[]>({
    queryKey: ["/api/vendor/venue/bookings", sessionToken],
    enabled: !!sessionToken,
    queryFn: async () => {
      const res = await fetch(new URL("/api/vendor/venue/bookings", getApiUrl()).toString(), {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!res.ok) return [] as VendorVenueBooking[];
      return res.json();
    },
  });

  useEffect(() => {
    if (bookingsQuery.data) {
      setBookings(Array.isArray(bookingsQuery.data) ? bookingsQuery.data : []);
    }
  }, [bookingsQuery.data]);

  const availabilityQuery = useQuery<VendorAvailability[]>({
    queryKey: ["/api/vendor/venue/availability", sessionToken],
    enabled: !!sessionToken,
    queryFn: async () => {
      const res = await fetch(new URL("/api/vendor/venue/availability", getApiUrl()).toString(), {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!res.ok) return [] as VendorAvailability[];
      return res.json();
    },
  });

  useEffect(() => {
    if (availabilityQuery.data) {
      setAvailability(Array.isArray(availabilityQuery.data) ? availabilityQuery.data : []);
    }
  }, [availabilityQuery.data]);

  const timelineQuery = useQuery<VendorVenueTimeline>({
    queryKey: ["/api/vendor/venue/timeline", sessionToken],
    enabled: !!sessionToken,
    queryFn: async () => {
      const res = await fetch(new URL("/api/vendor/venue/timeline", getApiUrl()).toString(), {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!res.ok) return {} as VendorVenueTimeline;
      return res.json();
    },
  });

  useEffect(() => {
    if (timelineQuery.data) {
      setTimeline(timelineQuery.data || {});
    }
  }, [timelineQuery.data]);

  const seatingQuery = useQuery<{ tables: Table[]; guests: Guest[] }>({
    queryKey: ["/api/vendor/venue/seating", sessionToken],
    enabled: !!sessionToken,
    queryFn: async () => {
      const res = await fetch(new URL("/api/vendor/venue/seating", getApiUrl()).toString(), {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      if (!res.ok) return { tables: [], guests: [] };
      return res.json();
    },
  });

  useEffect(() => {
    if (seatingQuery.data) {
      setSeatingTables(seatingQuery.data?.tables || []);
      setSeatingGuests(seatingQuery.data?.guests || []);
    }
  }, [seatingQuery.data]);

  const plannerMutation = useMutation({
    mutationFn: async ({ kind, payload }: { kind: "bookings" | "availability" | "timeline"; payload: any }) => {
      if (!sessionToken) return;
      await fetch(new URL(`/api/vendor/venue/${kind}`, getApiUrl()).toString(), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    },
  });

  const persistAndCache = (kind: "bookings" | "availability" | "timeline", payload: any) => {
    if (!sessionToken) return;
    const key = [`/api/vendor/venue/${kind}`, sessionToken];
    queryClient.setQueryData(key, payload);
    plannerMutation.mutate({ kind, payload });
  };

  const handleSeatingTablesChange = (tables: Table[]) => {
    setSeatingTables(tables);
    persistSeating(tables, seatingGuests);
  };

  const handleSeatingGuestsChange = (guests: Guest[]) => {
    setSeatingGuests(guests);
    persistSeating(seatingTables, guests);
  };

  const persistSeating = async (tables: Table[], guests: Guest[]) => {
    if (!sessionToken) return;
    const key = ["/api/vendor/venue/seating", sessionToken];
    const payload = { tables, guests };
    queryClient.setQueryData(key, payload);
    
    await fetch(new URL("/api/vendor/venue/seating", getApiUrl()).toString(), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await Promise.all([
      refetchProducts(),
      refetchOffers(),
      bookingsQuery.refetch(),
      availabilityQuery.refetch(),
      timelineQuery.refetch(),
      seatingQuery.refetch(),
    ]);
    setIsRefreshing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const goToProducts = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("ProductCreate");
  };

  const goToOffers = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate("OfferCreate");
  };

  const handleDelete = async (id: string, type: 'product' | 'offer') => {
    const confirmed = await showConfirm({
      title: `Slett ${type === 'product' ? 'produkt' : 'tilbud'}`,
      message: "Er du sikker?",
      confirmLabel: "Slett",
      cancelLabel: "Avbryt",
      destructive: true,
    });
    if (!confirmed) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const openBookingModal = (booking?: VendorVenueBooking) => {
    if (booking) {
      setEditingBooking(booking);
      setCoupleName(booking.coupleName);
      setBookingDate(booking.date);
      setBookingTime(booking.time || "");
      setBookingLocation(booking.location || "");
      setBookingCapacity(booking.capacity ? booking.capacity.toString() : "");
      setBookingNotes(booking.notes || "");
      setBookingStatus(booking.status || "considering");
      setBookingAddress(booking.address || "");
      setBookingMaxGuests(booking.maxGuests?.toString() || "");
      setBookingCateringIncluded(booking.cateringIncluded || false);
      setBookingAccommodationAvailable(booking.accommodationAvailable || false);
      setBookingCheckoutTime(booking.checkoutTime || "");
    } else {
      setEditingBooking(null);
      setCoupleName("");
      setBookingDate("");
      setBookingTime("");
      setBookingLocation("");
      setBookingCapacity("");
      setBookingNotes("");
      setBookingStatus("considering");
      setBookingAddress("");
      setBookingMaxGuests("");
      setBookingCateringIncluded(false);
      setBookingAccommodationAvailable(false);
      setBookingCheckoutTime("");
    }
    setShowBookingModal(true);
  };

  const saveBooking = () => {
    if (!coupleName.trim() || !bookingDate.trim()) {
      showToast("Kundenavn og dato er påkrevd");
      return;
    }
    const nextItem: VendorVenueBooking = {
      id: editingBooking?.id || Date.now().toString(),
      coupleName: coupleName.trim(),
      date: bookingDate.trim(),
      time: bookingTime.trim() || undefined,
      location: bookingLocation.trim() || undefined,
      capacity: bookingCapacity ? parseInt(bookingCapacity, 10) : undefined,
      notes: bookingNotes.trim() || undefined,
      status: bookingStatus,
      address: bookingAddress.trim() || undefined,
      maxGuests: bookingMaxGuests ? parseInt(bookingMaxGuests, 10) : undefined,
      cateringIncluded: bookingCateringIncluded,
      accommodationAvailable: bookingAccommodationAvailable,
      checkoutTime: bookingCheckoutTime.trim() || undefined,
    };
    const next = editingBooking
      ? bookings.map((b) => (b.id === editingBooking.id ? nextItem : b))
      : [...bookings, nextItem];
    setBookings(next);
    persistAndCache("bookings", next);
    setShowBookingModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const deleteBooking = async (id: string) => {
    const confirmed = await showConfirm({
      title: "Slett booking",
      message: "Er du sikker?",
      confirmLabel: "Slett",
      cancelLabel: "Avbryt",
      destructive: true,
    });
    if (!confirmed) return;
    const next = bookings.filter((b) => b.id !== id);
    setBookings(next);
    persistAndCache("bookings", next);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const updateBookingStatus = (id: string, newStatus: 'considering' | 'booked' | 'confirmed') => {
    const next = bookings.map(b => b.id === id ? { ...b, status: newStatus } : b);
    setBookings(next);
    persistAndCache('bookings', next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed': return '#10b981'; // green
      case 'booked': return '#f59e0b'; // orange
      case 'considering':
      default: return theme.textSecondary; // gray
    }
  };

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'confirmed': return 'Bekreftet';
      case 'booked': return 'Booket';
      case 'considering':
      default: return 'Vurderes';
    }
  };

  const duplicateBooking = (booking: VendorVenueBooking) => {
    const copy: VendorVenueBooking = {
      ...booking,
      id: Date.now().toString(),
      coupleName: `Kopi av ${booking.coupleName}`,
      status: 'considering',
    };
    const next = [...bookings, copy];
    setBookings(next);
    persistAndCache("bookings", next);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const openAvailabilityModal = (block?: VendorAvailability) => {
    if (block) {
      setEditingAvailability(block);
      setAvailDate(block.date);
      setAvailStatus(block.status);
      setAvailMaxBookings(block.maxBookings ? block.maxBookings.toString() : "");
      setAvailNotes(block.notes || "");
    } else {
      setEditingAvailability(null);
      setAvailDate("");
      setAvailStatus("available");
      setAvailMaxBookings("");
      setAvailNotes("");
    }
    setShowAvailabilityModal(true);
  };

  const saveAvailability = () => {
    if (!availDate.trim()) {
      showToast("Dato er påkrevd");
      return;
    }
    const block: VendorAvailability = {
      id: editingAvailability?.id || Date.now().toString(),
      date: availDate.trim(),
      status: availStatus,
      maxBookings: availMaxBookings ? parseInt(availMaxBookings, 10) : undefined,
      notes: availNotes.trim() || undefined,
    };
    const next = editingAvailability
      ? availability.map((b) => (b.id === editingAvailability.id ? block : b))
      : [...availability, block];
    setAvailability(next);
    persistAndCache("availability", next);
    setShowAvailabilityModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const deleteAvailability = async (id: string) => {
    const confirmed = await showConfirm({
      title: "Slett blokkering",
      message: "Er du sikker?",
      confirmLabel: "Slett",
      cancelLabel: "Avbryt",
      destructive: true,
    });
    if (!confirmed) return;
    const next = availability.filter((b) => b.id !== id);
    setAvailability(next);
    persistAndCache("availability", next);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggleTimeline = (key: keyof VendorVenueTimeline) => {
    const next = { ...timeline, [key]: !timeline[key] };
    setTimeline(next);
    persistAndCache("timeline", next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const renderBookingsTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.infoBox, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <EvendiIcon name="info" size={16} color={theme.textSecondary} />
        <ThemedText style={[styles.infoText, { color: theme.textSecondary }]}>Legg til bilder av lokalet og tidligere arrangementer for å øke konvertering.</ThemedText>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={[styles.cardTitle, { color: theme.text }]}>Bookingforespørsler</ThemedText>
          <Pressable onPress={() => openBookingModal()} style={styles.addIconBtn}>
            <EvendiIcon name="plus" size={18} color={theme.text} />
          </Pressable>
        </View>
        {bookingsQuery.isLoading ? <ActivityIndicator color={theme.accent} /> : null}
        {bookings.length === 0 ? (
          <View style={styles.emptyRow}>
            <EvendiIcon name="home" size={18} color={theme.accent} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>Ingen bookinger ennå</ThemedText>
              <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Legg til manuelle bookinger eller importér</ThemedText>
            </View>
            <Button onPress={() => openBookingModal()}>Legg til</Button>
          </View>
        ) : (
          bookings.map((b, idx) => (
            <Animated.View key={b.id} entering={FadeInDown.delay(idx * 30)}>
              <SwipeableRow onDelete={() => deleteBooking(b.id)}>
                <Pressable
                  onPress={() => openBookingModal(b)}
                  onLongPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    showOptions({
                      title: 'Alternativer',
                      message: b.coupleName,
                      cancelLabel: 'Avbryt',
                      options: [
                        { label: 'Rediger', onPress: () => openBookingModal(b) },
                        { label: 'Dupliser', onPress: () => duplicateBooking(b) },
                        { label: 'Slett', destructive: true, onPress: () => deleteBooking(b.id) },
                      ],
                    });
                  }}
                  style={[styles.listRow, { borderBottomColor: theme.border }]}
                >
                  <Pressable
                    onPress={() => {
                      const statuses: Array<'considering' | 'booked' | 'confirmed'> = ['considering', 'booked', 'confirmed'];
                      const currentIndex = statuses.indexOf(b.status || 'considering');
                      const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                      updateBookingStatus(b.id, nextStatus);
                    }}
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(b.status) + '20', borderColor: getStatusColor(b.status) },
                    ]}
                  >
                    <ThemedText style={[styles.statusText, { color: getStatusColor(b.status) }]}>
                      {getStatusLabel(b.status)}
                    </ThemedText>
                  </Pressable>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ color: theme.text, fontWeight: '600' }}>{b.coupleName}</ThemedText>
                    <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>{b.date} {b.time && `kl. ${b.time}`}</ThemedText>
                    {b.capacity ? <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>Kapasitet: {b.capacity}</ThemedText> : null}
                  </View>
                  <Pressable onPress={() => duplicateBooking(b)} style={styles.quickActionButton}>
                    <EvendiIcon name="copy" size={16} color={theme.textSecondary} />
                  </Pressable>
                  <EvendiIcon name="chevron-right" size={18} color={theme.textSecondary} />
                </Pressable>
              </SwipeableRow>
            </Animated.View>
          ))
        )}
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.sectionHeaderRow}>
          <ThemedText style={[styles.cardTitle, { color: theme.text }]}>Tilgjengelighet</ThemedText>
          <Pressable onPress={() => openAvailabilityModal()} style={styles.addIconBtn}>
            <EvendiIcon name="plus" size={18} color={theme.text} />
          </Pressable>
        </View>
        {availabilityQuery.isLoading ? <ActivityIndicator color={theme.accent} /> : null}
        {availability.length === 0 ? (
          <View style={styles.emptyRow}>
            <EvendiIcon name="calendar" size={18} color={theme.accent} />
            <View style={{ flex: 1 }}>
              <ThemedText style={[styles.emptyTitle, { color: theme.text }]}>Ingen blokker</ThemedText>
              <ThemedText style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Legg til blokkerte datoer eller kapasitetsgrenser</ThemedText>
            </View>
            <Button onPress={() => openAvailabilityModal()}>Legg til</Button>
          </View>
        ) : (
          availability.map((a, idx) => (
            <Animated.View key={a.id} entering={FadeInDown.delay(idx * 30)}>
              <SwipeableRow onDelete={() => deleteAvailability(a.id)}>
                <Pressable
                  onPress={() => openAvailabilityModal(a)}
                  style={[styles.listRow, { borderBottomColor: theme.border }]}
                >
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ color: theme.text, fontWeight: '600' }}>{a.date}</ThemedText>
                    <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>Status: {a.status}</ThemedText>
                    {a.maxBookings !== undefined ? (
                      <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>Maks: {a.maxBookings}</ThemedText>
                    ) : null}
                    {a.notes ? <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>{a.notes}</ThemedText> : null}
                  </View>
                  <EvendiIcon name="chevron-right" size={18} color={theme.textSecondary} />
                </Pressable>
              </SwipeableRow>
            </Animated.View>
          ))
        )}
      </View>
    </View>
  );

  const renderSeatingTab = () => (
    <View style={{ flex: 1 }}>
      <SeatingChart
        tables={seatingTables}
        guests={seatingGuests}
        onTablesChange={handleSeatingTablesChange}
        onGuestsChange={handleSeatingGuestsChange}
        editable={true}
      />
    </View>
  );

  const renderTimelineTab = () => (
    <View style={styles.tabContent}>
      <View style={[styles.timelineCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        {timelineQuery.isLoading ? <ActivityIndicator color={theme.accent} /> : null}
        {[
          { key: 'siteVisitDone', label: 'Befaring gjennomført', icon: 'map-pin' as const },
          { key: 'contractSigned', label: 'Kontrakt signert', icon: 'file-text' as const },
          { key: 'depositReceived', label: 'Depositum mottatt', icon: 'credit-card' as const },
          { key: 'floorPlanFinalized', label: 'Gulvplan ferdig', icon: 'layout' as const },
        ].map((step) => (
          <Pressable key={step.key} onPress={() => toggleTimeline(step.key as keyof VendorVenueTimeline)} style={styles.timelineStep}>
            <View
              style={[styles.timelineCheckbox, { borderColor: theme.border }, timeline[step.key as keyof VendorVenueTimeline] && { backgroundColor: theme.primary, borderColor: theme.primary }]}
            >
              {timeline[step.key as keyof VendorVenueTimeline] && <EvendiIcon name="check" size={12} color="#fff" />}
            </View>
            <View style={styles.timelineStepContent}>
              <EvendiIcon name={step.icon} size={16} color={theme.textSecondary} />
              <ThemedText style={[styles.timelineLabel, { color: theme.text }]}>
                {step.label}
              </ThemedText>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );

  if (!sessionToken) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.backgroundRoot }]} edges={['bottom']}>
      <View style={[styles.header, { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <View style={[styles.iconCircle, { backgroundColor: Colors.dark.accent + '15' }]}>
            <EvendiIcon name="home" size={24} color={Colors.dark.accent} />
          </View>
          <View style={styles.headerText}>
            <ThemedText style={styles.headerTitle}>Lokale</ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: theme.textMuted }]}>
              Bookinger, kapasitet og pakker
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={[styles.tabBar, { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        {['bookings', 'seating', 'timeline'].map((tab) => (
          <Pressable
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => {
              setActiveTab(tab as TabType);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
          >
            <ThemedText style={[styles.tabText, activeTab === tab && { color: Colors.dark.accent }]}>
              {tab === 'bookings' ? 'Bookinger' : tab === 'seating' ? 'Bord' : 'Tidslinje'}
            </ThemedText>
            {activeTab === tab && <View style={[styles.tabIndicator, { backgroundColor: Colors.dark.accent }]} />}
          </Pressable>
        ))}
      </View>

      {activeTab === 'seating' ? (
        renderSeatingTab()
      ) : (
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              tintColor={theme.accent}
            />
          }
        >
          {activeTab === 'bookings' && renderBookingsTab()}
          {activeTab === 'timeline' && renderTimelineTab()}
        </ScrollView>
      )}

      {/* Booking Modal */}
      <Modal visible={showBookingModal} animationType="slide" onRequestClose={() => setShowBookingModal(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}> 
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}> 
            <Pressable onPress={() => setShowBookingModal(false)}>
              <ThemedText style={[styles.modalCancel, { color: theme.primary }]}>Avbryt</ThemedText>
            </Pressable>
            <ThemedText style={styles.modalTitle}>{editingBooking ? 'Rediger booking' : 'Legg til booking'}</ThemedText>
            <Pressable onPress={saveBooking}>
              <ThemedText style={[styles.modalSave, { color: theme.primary }]}>Lagre</ThemedText>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Kundenavn *</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder="f.eks. Anna & Jonas"
                placeholderTextColor={theme.textSecondary}
                value={coupleName}
                onChangeText={setCoupleName}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Dato *</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder="DD.MM.YYYY"
                placeholderTextColor={theme.textSecondary}
                value={bookingDate}
                onChangeText={setBookingDate}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <ThemedText style={styles.formLabel}>Tid</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  placeholder="HH:MM"
                  placeholderTextColor={theme.textSecondary}
                  value={bookingTime}
                  onChangeText={setBookingTime}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: Spacing.md }]}>
                <ThemedText style={styles.formLabel}>Kapasitet</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  placeholder="f.eks. 150"
                  placeholderTextColor={theme.textSecondary}
                  value={bookingCapacity}
                  onChangeText={setBookingCapacity}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Lokasjon</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder="f.eks. Oslo sentrum"
                placeholderTextColor={theme.textSecondary}
                value={bookingLocation}
                onChangeText={setBookingLocation}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Status</ThemedText>
              <View style={styles.statusContainer}>
                {[
                  { value: 'considering', label: 'Vurderes', icon: 'search', color: theme.textSecondary },
                  { value: 'booked', label: 'Booket', icon: 'calendar', color: '#f59e0b' },
                  { value: 'confirmed', label: 'Bekreftet', icon: 'check-circle', color: '#10b981' },
                ].map((statusOption) => (
                  <Pressable
                    key={statusOption.value}
                    onPress={() => {
                      setBookingStatus(statusOption.value as any);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.statusButton,
                      { borderColor: theme.border, backgroundColor: theme.backgroundDefault },
                      bookingStatus === statusOption.value && { 
                        borderColor: statusOption.color, 
                        backgroundColor: statusOption.color + '15' 
                      },
                    ]}
                  >
                    <EvendiIcon 
                      name={statusOption.icon as any} 
                      size={16} 
                      color={bookingStatus === statusOption.value ? statusOption.color : theme.textSecondary} 
                    />
                    <ThemedText 
                      style={[
                        styles.statusButtonText,
                        { color: bookingStatus === statusOption.value ? statusOption.color : theme.textSecondary }
                      ]}
                    >
                      {statusOption.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Notater</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text, minHeight: 80 }]}
                placeholder="Detaljer om avtalen"
                placeholderTextColor={theme.textSecondary}
                value={bookingNotes}
                onChangeText={setBookingNotes}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Availability Modal */}
      <Modal visible={showAvailabilityModal} animationType="slide" onRequestClose={() => setShowAvailabilityModal(false)}>
        <View style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}> 
          <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}> 
            <Pressable onPress={() => setShowAvailabilityModal(false)}>
              <ThemedText style={[styles.modalCancel, { color: theme.primary }]}>Avbryt</ThemedText>
            </Pressable>
            <ThemedText style={styles.modalTitle}>{editingAvailability ? 'Rediger tilgjengelighet' : 'Legg til blokkering'}</ThemedText>
            <Pressable onPress={saveAvailability}>
              <ThemedText style={[styles.modalSave, { color: theme.primary }]}>Lagre</ThemedText>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Dato *</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder="DD.MM.YYYY"
                placeholderTextColor={theme.textSecondary}
                value={availDate}
                onChangeText={setAvailDate}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Status</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
                {(['available','limited','blocked'] as const).map((s) => (
                  <Pressable
                    key={s}
                    onPress={() => setAvailStatus(s)}
                    style={[styles.categoryChip, availStatus === s && { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}
                  >
                    <ThemedText style={styles.categoryChipText}>{s}</ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Maks bookinger</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder="f.eks. 2"
                placeholderTextColor={theme.textSecondary}
                value={availMaxBookings}
                onChangeText={setAvailMaxBookings}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Notater</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text, minHeight: 80 }]}
                placeholder="Detaljer om blokkeringen"
                placeholderTextColor={theme.textSecondary}
                value={availNotes}
                onChangeText={setAvailNotes}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 24, fontWeight: '700' },
  headerSubtitle: { fontSize: 14, marginTop: 2 },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  activeTab: {},
  tabText: { fontSize: 15, fontWeight: '600' },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
  },
  content: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: Spacing.lg },
  tabContent: { gap: Spacing.md },
  infoBox: { flexDirection: 'row', gap: Spacing.sm, padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1 },
  infoText: { flex: 1, fontSize: 13 },
  sectionCard: { padding: Spacing.md, borderRadius: BorderRadius.md, borderWidth: 1 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.md },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  emptyRow: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center', paddingVertical: Spacing.md },
  emptyTitle: { fontSize: 14, fontWeight: '600' },
  emptySubtitle: { fontSize: 12, marginTop: 2 },
  listRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm, borderBottomWidth: 1 },
  addIconBtn: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, borderRadius: BorderRadius.sm },
  checkbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginRight: Spacing.sm },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    minWidth: 80,
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  statusButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  quickActionButton: { padding: Spacing.sm, borderRadius: BorderRadius.sm, justifyContent: 'center', alignItems: 'center' },
  seatingCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1,
  },
  seatingIcon: { marginTop: Spacing.md },
  seatingTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  seatingDesc: { fontSize: 13, textAlign: 'center' },
  timelineCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  timelineStep: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  timelineCheckbox: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  timelineStepContent: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, flex: 1 },
  timelineLabel: { fontSize: 14, fontWeight: '500' },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.md, borderBottomWidth: 1 },
  modalCancel: { fontSize: 16 },
  modalTitle: { fontSize: 17, fontWeight: '600' },
  modalSave: { fontSize: 16, fontWeight: '600' },
  modalContent: { flex: 1, padding: Spacing.lg },
  formGroup: { marginBottom: Spacing.lg },
  formLabel: { fontSize: 14, fontWeight: '500', marginBottom: Spacing.sm },
  formRow: { flexDirection: 'row' },
  input: { borderWidth: 1, borderRadius: BorderRadius.md, padding: Spacing.md, fontSize: 14 },
  categoryScroll: { marginRight: -Spacing.lg },
  categoryChip: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: BorderRadius.md, marginRight: Spacing.sm, backgroundColor: '#f0f0f0', borderWidth: 1, borderColor: '#ccc' },
  categoryChipText: { fontSize: 12, fontWeight: '500' },
});
