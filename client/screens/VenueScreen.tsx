import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  TextInput,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { EvendiIcon } from '@/components/EvendiIcon';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getCoupleProfile } from '@/lib/api-couples';
import { TraditionHintBanner } from '@/components/TraditionHintBanner';
import { ThemedText } from '../components/ThemedText';
import { Button } from '../components/Button';
import { SwipeableRow } from '../components/SwipeableRow';
import { SeatingChart, Table, Guest } from '../components/SeatingChart';
import { VendorSearchField } from '@/components/VendorSearchField';
import { useTheme } from '../hooks/useTheme';
import { Colors, Spacing, BorderRadius } from '../constants/theme';
import { PlanningStackParamList } from '../navigation/PlanningStackNavigator';
import { getApiUrl } from '@/lib/query-client';
import { getSpeeches } from '@/lib/storage';
import { Speech } from '@/lib/types';
import { showToast } from '@/lib/toast';
import { showConfirm, showOptions } from '@/lib/dialogs';
import {
  getVenueBookings,
  getVenueTimeline,
  getVenueSeating,
  saveVenueData,
  saveVenueSeating,
} from '@/lib/api-couple-data';

type TabType = 'bookings' | 'seating' | 'timeline';
type NavigationProp = NativeStackNavigationProp<PlanningStackParamList>;

interface VenueBooking {
  id: string;
  venueName: string;
  date: string;
  time?: string;
  location?: string;
  capacity?: number;
  notes?: string;
  status?: 'considering' | 'booked' | 'confirmed';
  isPrimary?: boolean;
  venueType?: 'ceremony' | 'reception' | 'party' | 'accommodation' | 'other';
  // Decision-making fields
  address?: string;
  maxGuests?: number;
  invitedGuests?: number;
  cateringIncluded?: boolean;
  accommodationAvailable?: boolean;
  checkoutTime?: string;
  // Site visit / befaring fields
  siteVisitDate?: string;
  siteVisitTime?: string;
  visitNotesLiked?: string;
  visitNotesUnsure?: string;
  vendorId?: string;
  vendorName?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface VenueTimeline {
  venueSelected?: boolean;
  venueVisited?: boolean;
  contractSigned?: boolean;
  depositPaid?: boolean;
  capacity?: number;
  budget?: number;
}

const TIMELINE_STEPS = [
  { key: 'venueSelected', label: 'Lokale valgt', icon: 'check-circle' as const },
  { key: 'venueVisited', label: 'Lokalebefaring gjennomført', icon: 'map-pin' as const },
  { key: 'contractSigned', label: 'Kontrakt signert', icon: 'file-text' as const },
  { key: 'depositPaid', label: 'Depositum betalt', icon: 'credit-card' as const },
];

export function VenueScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('bookings');
  const [refreshing, setRefreshing] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [editingBooking, setEditingBooking] = useState<VenueBooking | null>(null);

  // Form state
  const [venueName, setVenueName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [notes, setNotes] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [venueType, setVenueType] = useState<'ceremony' | 'reception' | 'party' | 'accommodation' | 'other'>('ceremony');
  const [status, setStatus] = useState<'considering' | 'booked' | 'confirmed'>('considering');
  // Decision-making fields
  const [address, setAddress] = useState('');
  const [maxGuests, setMaxGuests] = useState('');
  const [invitedGuests, setInvitedGuests] = useState('');
  const [cateringIncluded, setCateringIncluded] = useState(false);
  const [accommodationAvailable, setAccommodationAvailable] = useState(false);
  const [checkoutTime, setCheckoutTime] = useState('');
  // Site visit / befaring fields
  const [siteVisitDate, setSiteVisitDate] = useState('');
  const [siteVisitTime, setSiteVisitTime] = useState('');
  const [visitNotesLiked, setVisitNotesLiked] = useState('');
  const [visitNotesUnsure, setVisitNotesUnsure] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [vendorName, setVendorName] = useState('');

  const [bookings, setBookings] = useState<VenueBooking[]>([]);
  const [timeline, setTimeline] = useState<VenueTimeline>({});
  const [seatingTables, setSeatingTables] = useState<Table[]>([]);
  const [seatingGuests, setSeatingGuests] = useState<Guest[]>([]);
  const [speeches, setSpeeches] = useState<Speech[]>([]);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const apiBase = getApiUrl();
  const COUPLE_STORAGE_KEY = 'wedflow_couple_session';

  // Fetch couple profile to get selected traditions
  const { data: coupleProfile } = useQuery({
    queryKey: ['coupleProfile'],
    queryFn: async () => {
      if (!sessionToken) throw new Error('No session');
      return getCoupleProfile(sessionToken);
    },
    enabled: !!sessionToken,
  });

  useFocusEffect(
    useCallback(() => {
      const loadSession = async () => {
        const data = await AsyncStorage.getItem(COUPLE_STORAGE_KEY);
        if (!data) return;
        const parsed = JSON.parse(data);
        setSessionToken(parsed?.sessionToken || null);

        // Load speeches once on focus so timeline has initial data
        const existingSpeeches = await getSpeeches();
        setSpeeches(existingSpeeches);
      };
      loadSession();
    }, [])
  );

  const bookingsQuery = useQuery<VenueBooking[]>({
    queryKey: ['/api/couple/venue/bookings', sessionToken],
    enabled: !!sessionToken,
    queryFn: async () => {
      return getVenueBookings() as Promise<VenueBooking[]>;
    },
  });

  useCallback(() => {
    if (bookingsQuery.data) {
      setBookings(Array.isArray(bookingsQuery.data) ? bookingsQuery.data : []);
    }
  }, [bookingsQuery.data])();

  const timelineQuery = useQuery<VenueTimeline>({
    queryKey: ['/api/couple/venue/timeline', sessionToken],
    enabled: !!sessionToken,
    queryFn: async () => {
      return getVenueTimeline() as Promise<VenueTimeline>;
    },
  });

  useCallback(() => {
    if (timelineQuery.data) {
      setTimeline(timelineQuery.data || {});
    }
  }, [timelineQuery.data])();

  // Keep speeches in sync across screens (invalidated from SpeechListScreen)
  const speechesQuery = useQuery<Speech[]>({
    queryKey: ['speeches'],
    queryFn: async () => {
      const data = await getSpeeches();
      return Array.isArray(data) ? data : [];
    },
  });

  useCallback(() => {
    if (speechesQuery.data) {
      setSpeeches(speechesQuery.data || []);
    }
  }, [speechesQuery.data])();

  const seatingQuery = useQuery<{ tables: Table[]; guests: Guest[] }>({
    queryKey: ['/api/couple/venue/seating', sessionToken],
    enabled: !!sessionToken,
    queryFn: async () => {
      return getVenueSeating();
    },
  });

  useCallback(() => {
    if (seatingQuery.data) {
      setSeatingTables(seatingQuery.data.tables || []);
      setSeatingGuests(seatingQuery.data.guests || []);
    }
  }, [seatingQuery.data])();

  const plannerMutation = useMutation({
    mutationFn: async ({ kind, payload }: { kind: 'bookings' | 'timeline'; payload: any }) => {
      if (!sessionToken) return;
      await saveVenueData(kind, payload);
    },
  });

  const persistAndCache = (kind: 'bookings' | 'timeline', payload: any) => {
    if (!sessionToken) return;
    const key = [`/api/couple/venue/${kind}`, sessionToken];
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
    const key = ['/api/couple/venue/seating', sessionToken];
    const payload = { tables, guests };
    queryClient.setQueryData(key, payload);
    await saveVenueSeating(payload);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([bookingsQuery.refetch(), timelineQuery.refetch()]);
    setRefreshing(false);
  };

  const openBookingModal = (booking?: VenueBooking) => {
    if (booking) {
      setEditingBooking(booking);
      setVenueName(booking.venueName);
      setDate(booking.date);
      setTime(booking.time || '');
      setLocation(booking.location || '');
      setCapacity(booking.capacity?.toString() || '');
      setNotes(booking.notes || '');
      setIsPrimary(booking.isPrimary || false);
      setVenueType(booking.venueType || 'ceremony');
      setStatus(booking.status || 'considering');
      setAddress(booking.address || '');
      setMaxGuests(booking.maxGuests?.toString() || '');
      setInvitedGuests(booking.invitedGuests?.toString() || '');
      setCateringIncluded(booking.cateringIncluded || false);
      setAccommodationAvailable(booking.accommodationAvailable || false);
      setCheckoutTime(booking.checkoutTime || '');
      setSiteVisitDate(booking.siteVisitDate || '');
      setSiteVisitTime(booking.siteVisitTime || '');
      setVisitNotesLiked(booking.visitNotesLiked || '');
      setVisitNotesUnsure(booking.visitNotesUnsure || '');
      setVendorId(booking.vendorId || '');
      setVendorName(booking.vendorName || '');
    } else {
      setEditingBooking(null);
      setVenueName('');
      setDate('');
      setTime('');
      setLocation('');
      setCapacity('');
      setNotes('');
      setIsPrimary(bookings.length === 0); // First venue is primary by default
      setVenueType('ceremony');
      setStatus('considering');
      setAddress('');
      setMaxGuests('');
      setInvitedGuests('');
      setCateringIncluded(false);
      setAccommodationAvailable(false);
      setCheckoutTime('');
      setSiteVisitDate('');
      setSiteVisitTime('');
      setVisitNotesLiked('');
      setVisitNotesUnsure('');
      setVendorId('');
      setVendorName('');
    }
    setShowBookingModal(true);
  };

  const saveBooking = async () => {
    if (!venueName.trim() || !date.trim()) {
      showToast('Vennligst fyll inn lokalnavn og dato');
      return;
    }
    const datePattern = /^\d{2}\.\d{2}\.\d{4}$/;
    if (!datePattern.test(date.trim())) {
      showToast('Bruk datoformat DD.MM.YYYY');
      return;
    }
    if (capacity && isNaN(Number(capacity))) {
      showToast('Kapasitet må være et tall');
      return;
    }

    const booking: VenueBooking = {
      id: editingBooking?.id || Date.now().toString(),
      venueName,
      date,
      time,
      location,
      capacity: capacity ? parseInt(capacity, 10) : undefined,
      notes,
      status,
      isPrimary,
      venueType,
      address,
      maxGuests: maxGuests ? parseInt(maxGuests, 10) : undefined,
      invitedGuests: invitedGuests ? parseInt(invitedGuests, 10) : undefined,
      cateringIncluded,
      accommodationAvailable,
      checkoutTime,
      siteVisitDate,
      siteVisitTime,
      visitNotesLiked,
      visitNotesUnsure,
      vendorId,
      vendorName,
    };

    let next = bookings;
    if (editingBooking) {
      next = bookings.map(b => b.id === editingBooking.id ? booking : b);
    } else {
      // If this is set as primary, unset all other primaries
      if (isPrimary) {
        next = bookings.map(b => ({ ...b, isPrimary: false }));
      }
      next = [...next, booking];
    }
    setBookings(next);
    persistAndCache('bookings', next);

    setShowBookingModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const deleteBooking = async (id: string) => {
    const confirmed = await showConfirm({
      title: 'Slett lokale',
      message: 'Er du sikker på at du vil slette denne lokalereservasjonen?',
      confirmLabel: 'Slett',
      cancelLabel: 'Avbryt',
      destructive: true,
    });
    if (!confirmed) return;
    const next = bookings.filter(b => b.id !== id);
    setBookings(next);
    persistAndCache('bookings', next);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const duplicateBooking = async (booking: VenueBooking) => {
    try {
      const newBooking: VenueBooking = {
        ...booking,
        id: Date.now().toString(),
        venueName: `Kopi av ${booking.venueName}`,
        status: 'considering',
        isPrimary: false, // Duplicates are never primary
      };
      const next = [...bookings, newBooking];
      setBookings(next);
      persistAndCache('bookings', next);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      showToast('Kunne ikke duplisere lokale');
    }
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

  const getCapacityStatus = (maxGuests?: number, invitedGuests?: number) => {
    if (!maxGuests || !invitedGuests) return { color: theme.textSecondary, text: '' };
    const percentage = (invitedGuests / maxGuests) * 100;
    if (percentage <= 80) return { color: '#10b981', text: `${invitedGuests}/${maxGuests} gjester (${percentage.toFixed(0)}%)` };
    if (percentage <= 100) return { color: '#f59e0b', text: `${invitedGuests}/${maxGuests} gjester (${percentage.toFixed(0)}%)` };
    return { color: '#ef4444', text: `${invitedGuests}/${maxGuests} gjester (${percentage.toFixed(0)}% - Over kapasitet!)` };
  };

  const openInMaps = (address?: string) => {
    if (!address) return;
    const encodedAddress = encodeURIComponent(address);
    const url = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
    // On mobile, this will open in the default maps app
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  const goToTableSeating = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('TableSeating' as any);
  };

  const handleFindVenue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('VendorMatching', { 
      category: 'venue',
      selectedTraditions: coupleProfile?.selectedTraditions || [],
    });
  };

  const renderBookingsTab = () => {
    const guestCount = coupleProfile?.expectedGuests || 0;
    // Find the primary booking's capacity
    const primaryBooking = bookings.find(b => b.isPrimary);
    const venueCapacity = primaryBooking?.capacity ? parseInt(String(primaryBooking.capacity)) : 0;
    const capacityWarning = guestCount > 0 && venueCapacity > 0 && guestCount > venueCapacity;

    return (
    <View style={styles.tabContent}>
      {/* Tradition hints for venue */}
      {(coupleProfile?.selectedTraditions?.length ?? 0) > 0 && (
        <TraditionHintBanner
          traditions={coupleProfile?.selectedTraditions || []}
          category="venue"
        />
      )}

      {/* Capacity warning */}
      {capacityWarning && (
        <View style={[styles.emptyState, { backgroundColor: '#DC354520', borderWidth: 1, borderColor: '#DC3545', marginBottom: Spacing.md, padding: Spacing.md }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <EvendiIcon name="alert-triangle" size={18} color="#DC3545" />
            <ThemedText style={{ color: '#DC3545', fontWeight: '600', marginLeft: Spacing.sm, flex: 1, fontSize: 14 }}>
              Kapasitetsadvarsel: {guestCount} gjester, men lokalet har plass til {venueCapacity}
            </ThemedText>
          </View>
        </View>
      )}

      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>Lokalereservasjoner</ThemedText>
        <Pressable onPress={() => openBookingModal()} style={[styles.addButton, { backgroundColor: theme.primary }]}>
          <EvendiIcon name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      {bookings.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: theme.backgroundDefault }]}>
          <EvendiIcon name="heart" size={48} color={theme.primary} style={{ opacity: 0.6 }} />
          <ThemedText style={[styles.emptyText, { color: theme.text, fontWeight: '600', fontSize: 20 }]}>
            Hvor skal bryllupet holdes?
          </ThemedText>
          <ThemedText style={[styles.emptySubtext, { color: theme.textSecondary, fontSize: 15, textAlign: 'center', paddingHorizontal: Spacing.xl }]}>
            La oss finne det perfekte stedet sammen.
          </ThemedText>
          <View style={styles.emptyButtons}>
            <Button onPress={() => openBookingModal()} style={styles.buttonSmall}>
              Legg til lokale
            </Button>
            <Button onPress={handleFindVenue} style={styles.buttonSmall}>
              Finn lokale
            </Button>
          </View>
        </View>
      ) : (
        // Sort bookings: primary first, then by creation date
        [...bookings].sort((a, b) => {
          if (a.isPrimary && !b.isPrimary) return -1;
          if (!a.isPrimary && b.isPrimary) return 1;
          return (a.createdAt || '') > (b.createdAt || '') ? -1 : 1;
        }).map((booking, index) => (
          <Animated.View key={booking.id} entering={FadeInDown.delay(index * 50)}>
            <SwipeableRow onDelete={() => deleteBooking(booking.id)}>
              <Pressable
                onPress={() => openBookingModal(booking)}
                onLongPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  showOptions({
                    title: 'Alternativer',
                    message: booking.venueName,
                    cancelLabel: 'Avbryt',
                    options: [
                      { label: 'Rediger', onPress: () => openBookingModal(booking) },
                      { label: 'Dupliser', onPress: () => duplicateBooking(booking) },
                      { label: 'Slett', destructive: true, onPress: () => deleteBooking(booking.id) },
                    ],
                  });
                }}
                style={[styles.bookingCard, { backgroundColor: theme.backgroundDefault }]}
              >
                <Pressable
                  onPress={() => {
                    const statuses: Array<'considering' | 'booked' | 'confirmed'> = ['considering', 'booked', 'confirmed'];
                    const currentIndex = statuses.indexOf(booking.status || 'considering');
                    const nextStatus = statuses[(currentIndex + 1) % statuses.length];
                    updateBookingStatus(booking.id, nextStatus);
                  }}
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(booking.status) + '20', borderColor: getStatusColor(booking.status) },
                  ]}
                >
                  <ThemedText style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                    {getStatusLabel(booking.status)}
                  </ThemedText>
                </Pressable>
                <View style={styles.bookingInfo}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <ThemedText style={styles.bookingName}>
                      {booking.venueName}
                    </ThemedText>
                    {booking.isPrimary && (
                      <View style={[styles.primaryBadge, { backgroundColor: theme.primary + '20', borderColor: theme.primary }]}>
                        <ThemedText style={[styles.primaryBadgeText, { color: theme.primary }]}>Hovedlokale</ThemedText>
                      </View>
                    )}
                  </View>
                  {booking.venueType && (
                    <ThemedText style={[styles.venueTypeBadge, { color: theme.textSecondary }]}>
                      {booking.venueType === 'ceremony' ? 'Seremoni' : 
                       booking.venueType === 'reception' ? 'Middag' :
                       booking.venueType === 'party' ? 'Fest' :
                       booking.venueType === 'accommodation' ? 'Overnatting' : 'Annet'}
                    </ThemedText>
                  )}
                  <ThemedText style={[styles.bookingDate, { color: theme.textSecondary }]}>
                    {booking.date} {booking.time && `kl. ${booking.time}`}
                    {booking.checkoutTime && ` • Ut kl. ${booking.checkoutTime}`}
                  </ThemedText>
                  {booking.address && (
                    <Pressable 
                      onPress={() => openInMaps(booking.address)}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}
                    >
                      <EvendiIcon name="map-pin" size={12} color={theme.primary} />
                      <ThemedText style={[styles.bookingLocation, { color: theme.primary }]}>
                        {booking.address}
                      </ThemedText>
                    </Pressable>
                  )}
                  {(booking.maxGuests || booking.invitedGuests) && (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <EvendiIcon name="users" size={12} color={getCapacityStatus(booking.maxGuests, booking.invitedGuests).color} />
                      <ThemedText style={[styles.bookingCapacity, { color: getCapacityStatus(booking.maxGuests, booking.invitedGuests).color }]}>
                        {getCapacityStatus(booking.maxGuests, booking.invitedGuests).text || `Maks ${booking.maxGuests || booking.invitedGuests} gjester`}
                      </ThemedText>
                    </View>
                  )}
                  {(booking.cateringIncluded || booking.accommodationAvailable) && (
                    <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
                      {booking.cateringIncluded && (
                        <View style={[styles.featureBadge, { backgroundColor: '#10b981' + '15', borderColor: '#10b981' }]}>
                          <EvendiIcon name="coffee" size={10} color="#10b981" />
                          <ThemedText style={[styles.featureBadgeText, { color: '#10b981' }]}>Servering</ThemedText>
                        </View>
                      )}
                      {booking.accommodationAvailable && (
                        <View style={[styles.featureBadge, { backgroundColor: '#3b82f6' + '15', borderColor: '#3b82f6' }]}>
                          <EvendiIcon name="moon" size={10} color="#3b82f6" />
                          <ThemedText style={[styles.featureBadgeText, { color: '#3b82f6' }]}>Overnatting</ThemedText>
                        </View>
                      )}
                    </View>
                  )}
                  {booking.siteVisitDate && (
                    <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.border }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <EvendiIcon name="calendar" size={12} color={theme.accent} />
                        <ThemedText style={[styles.visitDateText, { color: theme.textSecondary }]}>
                          Befaring: {booking.siteVisitDate}{booking.siteVisitTime && ` kl. ${booking.siteVisitTime}`}
                        </ThemedText>
                      </View>
                      {(booking.visitNotesLiked || booking.visitNotesUnsure) && (
                        <View style={{ marginTop: 4, gap: 4 }}>
                          {booking.visitNotesLiked && (
                            <View style={{ flexDirection: 'row', gap: 4, alignItems: 'flex-start' }}>
                              <EvendiIcon name="heart" size={11} color="#10b981" style={{ marginTop: 2 }} />
                              <ThemedText style={[styles.visitNotePreview, { color: theme.textSecondary }]} numberOfLines={1}>
                                {booking.visitNotesLiked}
                              </ThemedText>
                            </View>
                          )}
                          {booking.visitNotesUnsure && (
                            <View style={{ flexDirection: 'row', gap: 4, alignItems: 'flex-start' }}>
                              <EvendiIcon name="help-circle" size={11} color="#f59e0b" style={{ marginTop: 2 }} />
                              <ThemedText style={[styles.visitNotePreview, { color: theme.textSecondary }]} numberOfLines={1}>
                                {booking.visitNotesUnsure}
                              </ThemedText>
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  )}
                </View>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    duplicateBooking(booking);
                  }}
                  style={styles.quickActionButton}
                >
                  <EvendiIcon name="copy" size={16} color={theme.textSecondary} />
                </Pressable>
                <EvendiIcon name="chevron-right" size={20} color={theme.textSecondary} />
              </Pressable>
            </SwipeableRow>
          </Animated.View>
        ))
      )}
    </View>
  );
  };

  const renderSeatingTab = () => (
    <View style={{ flex: 1 }}>
      {seatingQuery.isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.accent} />
        </View>
      ) : (
        <SeatingChart
          tables={seatingTables}
          guests={seatingGuests}
          speeches={speeches}
          onTablesChange={handleSeatingTablesChange}
          onGuestsChange={handleSeatingGuestsChange}
          editable={true}
        />
      )}
    </View>
  );

  const renderTimelineTab = () => {
    // Sort speeches by time
    const sortedSpeeches = [...speeches].sort((a, b) => {
      const timeA = a.time || '23:59';
      const timeB = b.time || '23:59';
      return timeA.localeCompare(timeB);
    });

    return (
      <View style={styles.tabContent}>
        {/* Venue Checklist Section */}
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>Lokale & forberedelse</ThemedText>
        </View>

        <View style={[styles.timelineCard, { backgroundColor: theme.backgroundDefault }]}>
          {TIMELINE_STEPS.map((step) => (
            <Pressable
              key={step.key}
              onPress={() => {
                const next = {
                  ...timeline,
                  [step.key]: !timeline[step.key as keyof VenueTimeline],
                };
                setTimeline(next);
                persistAndCache('timeline', next);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={styles.timelineStep}
            >
              <View
                style={[
                  styles.timelineCheckbox,
                  { borderColor: theme.border },
                  timeline[step.key as keyof VenueTimeline] ? { backgroundColor: Colors.light.success, borderColor: Colors.light.success } : {},
                ]}
              >
                  {timeline[step.key as keyof VenueTimeline] && <EvendiIcon name="check" size={12} color="#fff" />}
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

        {/* Speeches Section */}
        {sortedSpeeches.length > 0 && (
          <>
            <View style={[styles.sectionHeader, { marginTop: Spacing.lg }]}>
              <ThemedText style={styles.sectionTitle}>Taleplan ({sortedSpeeches.length})</ThemedText>
            </View>

            <View style={[styles.timelineCard, { backgroundColor: theme.backgroundDefault }]}>
              {sortedSpeeches.map((speech) => {
                const tableLabel = seatingTables.find(t => t.id === speech.tableId)?.name || 'Uten bord';
                const statusColor = speech.status === 'speaking' ? '#f59e0b' : 
                                   speech.status === 'done' ? '#16a34a' : theme.textSecondary;
                const statusIcon = speech.status === 'speaking' ? 'mic' :
                                  speech.status === 'done' ? 'check-circle' : 'clock';

                return (
                  <View
                    key={speech.id}
                    style={[
                      styles.timelineStep,
                      {
                        borderLeftWidth: 3,
                        borderLeftColor: statusColor,
                        backgroundColor: speech.status === 'speaking' ? '#f59e0b15' : 'transparent',
                      }
                    ]}
                  >
                    <View style={[styles.timelineCheckbox, { borderColor: statusColor, backgroundColor: statusColor + '20' }]}>
                      <EvendiIcon name={statusIcon} size={14} color={statusColor} />
                    </View>
                    <View style={[styles.timelineStepContent, { flex: 1 }]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.md }}>
                        <View style={{ flex: 1 }}>
                          <ThemedText style={[styles.timelineLabel, { color: theme.text, fontWeight: '600' }]}>
                            {speech.time} - {speech.speakerName}
                          </ThemedText>
                          <ThemedText style={[styles.timelineLabel, { color: theme.textSecondary, fontSize: 12, marginTop: 4 }]}>
                            {speech.role} • {tableLabel}
                          </ThemedText>
                        </View>
                        <View style={{ alignItems: 'center' }}>
                          <ThemedText style={[{ color: statusColor, fontSize: 11, fontWeight: '600' }]}>
                            {speech.status === 'speaking' ? 'Nå' : speech.status === 'done' ? 'Ferdig' : 'Klar'}
                          </ThemedText>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}
      </View>
    );
  };

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
              Bryllupslokaler og bordplassering
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
              {tab === 'bookings' ? 'Lokaler' : tab === 'seating' ? 'Bord' : 'Tidslinje'}
            </ThemedText>
            {activeTab === tab && <View style={[styles.tabIndicator, { backgroundColor: Colors.dark.accent }]} />}
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {activeTab === 'bookings' && renderBookingsTab()}
        {activeTab === 'seating' && renderSeatingTab()}
        {activeTab === 'timeline' && renderTimelineTab()}
      </ScrollView>

      <Modal visible={showBookingModal} animationType="slide" onRequestClose={() => setShowBookingModal(false)}>
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: theme.backgroundRoot }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
            <Pressable onPress={() => setShowBookingModal(false)}>
              <ThemedText style={[styles.modalCancel, { color: theme.primary }]}>Avbryt</ThemedText>
            </Pressable>
            <ThemedText style={styles.modalTitle}>
              {editingBooking ? 'Rediger lokale' : 'Legg til lokale'}
            </ThemedText>
            <Pressable onPress={saveBooking}>
              <ThemedText style={[styles.modalSave, { color: theme.primary }]}>Lagre</ThemedText>
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <VendorSearchField
                category="venue"
                icon="home"
                label="Lokalnavn *"
                placeholder="Søk etter registrert lokale..."
                externalValue={venueName}
                onNameChange={setVenueName}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Type lokale</ThemedText>
              <View style={styles.venueTypeContainer}>
                {[
                  { value: 'ceremony', label: 'Seremoni', icon: 'heart' },
                  { value: 'reception', label: 'Middag', icon: 'coffee' },
                  { value: 'party', label: 'Fest', icon: 'music' },
                  { value: 'accommodation', label: 'Overnatting', icon: 'moon' },
                  { value: 'other', label: 'Annet', icon: 'more-horizontal' },
                ].map((type) => (
                  <Pressable
                    key={type.value}
                    onPress={() => {
                      setVenueType(type.value as any);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.venueTypeButton,
                      { borderColor: theme.border, backgroundColor: theme.backgroundDefault },
                      venueType === type.value && { borderColor: theme.primary, backgroundColor: theme.primary + '15' },
                    ]}
                  >
                    <EvendiIcon 
                      name={type.icon as any} 
                      size={16} 
                      color={venueType === type.value ? theme.primary : theme.textSecondary} 
                    />
                    <ThemedText 
                      style={[
                        styles.venueTypeText,
                        { color: venueType === type.value ? theme.primary : theme.textSecondary }
                      ]}
                    >
                      {type.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
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
                      setStatus(statusOption.value as any);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.statusButton,
                      { borderColor: theme.border, backgroundColor: theme.backgroundDefault },
                      status === statusOption.value && { 
                        borderColor: statusOption.color, 
                        backgroundColor: statusOption.color + '15' 
                      },
                    ]}
                  >
                    <EvendiIcon 
                      name={statusOption.icon as any} 
                      size={16} 
                      color={status === statusOption.value ? statusOption.color : theme.textSecondary} 
                    />
                    <ThemedText 
                      style={[
                        styles.statusButtonText,
                        { color: status === statusOption.value ? statusOption.color : theme.textSecondary }
                      ]}
                    >
                      {statusOption.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Pressable
                onPress={() => {
                  setIsPrimary(!isPrimary);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={styles.primaryToggle}
              >
                <View
                  style={[
                    styles.primaryCheckbox,
                    { borderColor: theme.border },
                    isPrimary && { backgroundColor: theme.primary, borderColor: theme.primary },
                  ]}
                >
                  {isPrimary && <EvendiIcon name="check" size={14} color="#fff" />}
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.primaryLabel, { color: theme.text }]}>
                    Hovedlokale (primær)
                  </ThemedText>
                  <ThemedText style={[styles.primarySubtext, { color: theme.textSecondary }]}>
                    Dette er hovedlokasjonen for seremonien eller middagen
                  </ThemedText>
                </View>
              </Pressable>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Dato *</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder="DD.MM.YYYY"
                placeholderTextColor={theme.textSecondary}
                value={date}
                onChangeText={setDate}
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <ThemedText style={styles.formLabel}>Tid</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  placeholder="HH:MM"
                  placeholderTextColor={theme.textSecondary}
                  value={time}
                  onChangeText={setTime}
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: Spacing.md }]}>
                <ThemedText style={styles.formLabel}>Kapasitet</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  placeholder="f.eks. 150"
                  placeholderTextColor={theme.textSecondary}
                  value={capacity}
                  onChangeText={setCapacity}
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
                value={location}
                onChangeText={setLocation}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Adresse</ThemedText>
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text, flex: 1 }]}
                  placeholder="Gate, postnummer, sted"
                  placeholderTextColor={theme.textSecondary}
                  value={address}
                  onChangeText={setAddress}
                />
                {address && (
                  <Pressable
                    onPress={() => openInMaps(address)}
                    style={[styles.mapButton, { backgroundColor: theme.primary }]}
                  >
                    <EvendiIcon name="map" size={20} color="#fff" />
                  </Pressable>
                )}
              </View>
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <ThemedText style={styles.formLabel}>Maks gjester</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  placeholder="f.eks. 150"
                  placeholderTextColor={theme.textSecondary}
                  value={maxGuests}
                  onChangeText={setMaxGuests}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: Spacing.md }]}>
                <ThemedText style={styles.formLabel}>Inviterte gjester</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                  placeholder="f.eks. 120"
                  placeholderTextColor={theme.textSecondary}
                  value={invitedGuests}
                  onChangeText={setInvitedGuests}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Når må lokalet forlates?</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text }]}
                placeholder="f.eks. 23:00"
                placeholderTextColor={theme.textSecondary}
                value={checkoutTime}
                onChangeText={setCheckoutTime}
              />
            </View>

            <View style={styles.formGroup}>
              <Pressable
                onPress={() => {
                  setCateringIncluded(!cateringIncluded);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={styles.primaryToggle}
              >
                <View
                  style={[
                    styles.primaryCheckbox,
                    { borderColor: theme.border },
                    cateringIncluded && { backgroundColor: '#10b981', borderColor: '#10b981' },
                  ]}
                >
                  {cateringIncluded && <EvendiIcon name="check" size={14} color="#fff" />}
                </View>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <EvendiIcon name="coffee" size={16} color={theme.textSecondary} />
                  <ThemedText style={[styles.primaryLabel, { color: theme.text }]}>
                    Servering inkludert
                  </ThemedText>
                </View>
              </Pressable>
            </View>

            <View style={styles.formGroup}>
              <Pressable
                onPress={() => {
                  setAccommodationAvailable(!accommodationAvailable);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={styles.primaryToggle}
              >
                <View
                  style={[
                    styles.primaryCheckbox,
                    { borderColor: theme.border },
                    accommodationAvailable && { backgroundColor: '#3b82f6', borderColor: '#3b82f6' },
                  ]}
                >
                  {accommodationAvailable && <EvendiIcon name="check" size={14} color="#fff" />}
                </View>
                <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <EvendiIcon name="moon" size={16} color={theme.textSecondary} />
                  <ThemedText style={[styles.primaryLabel, { color: theme.text }]}>
                    Overnatting tilgjengelig
                  </ThemedText>
                </View>
              </Pressable>
            </View>

            {/* Site visit / befaring section */}
            <View style={[styles.sectionDivider, { backgroundColor: theme.backgroundSecondary }]}>
              <ThemedText style={[styles.sectionDividerText, { color: theme.textSecondary }]}>
                Befaring / Besøk
              </ThemedText>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Hvilket lokale besøker dere?</ThemedText>
              {vendorName ? (
                <View style={{ flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' }}>
                  <View style={[styles.input, { borderColor: theme.border, flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
                    <EvendiIcon name="home" size={16} color={theme.accent} />
                    <ThemedText style={{ color: theme.text, flex: 1 }}>{vendorName}</ThemedText>
                  </View>
                  <Pressable
                    onPress={() => {
                      setVendorId('');
                      setVendorName('');
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[styles.mapButton, { backgroundColor: theme.backgroundSecondary }]}
                  >
                    <EvendiIcon name="x" size={16} color={theme.textSecondary} />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  onPress={() => {
                    setShowBookingModal(false);
                    setTimeout(() => {
                      navigation.navigate('VendorMatching', { category: 'venue' });
                    }, 100);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[styles.input, { borderColor: theme.border, flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' }]}
                >
                  <EvendiIcon name="search" size={16} color={theme.accent} />
                  <ThemedText style={{ color: theme.accent }}>Finn lokale</ThemedText>
                </Pressable>
              )}
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Når skal dere besøke lokalet?</ThemedText>
              <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text, flex: 2 }]}
                  placeholder="DD.MM.YYYY"
                  placeholderTextColor={theme.textSecondary}
                  value={siteVisitDate}
                  onChangeText={setSiteVisitDate}
                />
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.text, flex: 1 }]}
                  placeholder="HH:MM"
                  placeholderTextColor={theme.textSecondary}
                  value={siteVisitTime}
                  onChangeText={setSiteVisitTime}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Hva likte vi?</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text, minHeight: 80 }]}
                placeholder="Atmosfære, utsikt, plassering, muligheter..."
                placeholderTextColor={theme.textSecondary}
                value={visitNotesLiked}
                onChangeText={setVisitNotesLiked}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Hva var vi usikre på?</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text, minHeight: 80 }]}
                placeholder="Kapasitet, pris, tilgjengelighet, begrensninger..."
                placeholderTextColor={theme.textSecondary}
                value={visitNotesUnsure}
                onChangeText={setVisitNotesUnsure}
                multiline
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>Notater</ThemedText>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.text, minHeight: 80 }]}
                placeholder="Tilleggsinformasjon om lokalet..."
                placeholderTextColor={theme.textSecondary}
                value={notes}
                onChangeText={setNotes}
                multiline
                textAlignVertical="top"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: { fontSize: 16, fontWeight: '600' },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.md,
  },
  emptyText: { fontSize: 16, fontWeight: '600' },
  emptySubtext: { fontSize: 13 },
  emptyButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
  },
  buttonSmall: {
    flex: 1,
  },
  bookingCard: {
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    minWidth: 80,
    alignItems: 'center',
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
  bookingInfo: { flex: 1 },
  bookingName: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  bookingDate: { fontSize: 12 },
  bookingLocation: { fontSize: 12, marginTop: 2 },
  bookingCapacity: { fontSize: 12, marginTop: 2 },
  primaryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  primaryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  venueTypeBadge: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  venueTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  venueTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
  },
  venueTypeText: {
    fontSize: 13,
    fontWeight: '500',
  },
  primaryToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  primaryCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryLabel: {
    fontSize: 15,
    fontWeight: '600',
  },
  primarySubtext: {
    fontSize: 12,
    marginTop: 2,
  },
  featureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  featureBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  visitDateText: {
    fontSize: 11,
    fontWeight: '500',
  },
  visitNotePreview: {
    fontSize: 11,
    flex: 1,
  },
  sectionDivider: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  sectionDividerText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mapButton: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatingCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    gap: Spacing.md,
  },
  seatingIcon: { marginTop: Spacing.md },
  seatingTitle: { fontSize: 16, fontWeight: '600', textAlign: 'center' },
  seatingDesc: { fontSize: 13, textAlign: 'center' },
  seatingButton: { alignSelf: 'center', marginTop: Spacing.md },
  timelineCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
  },
  timelineCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineStepContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  timelineLabel: { fontSize: 14, fontWeight: '500' },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  modalCancel: { fontSize: 16 },
  modalTitle: { fontSize: 17, fontWeight: '600' },
  modalSave: { fontSize: 16, fontWeight: '600' },
  modalContent: { flex: 1, padding: Spacing.lg },
  formGroup: { marginBottom: Spacing.lg },
  formLabel: { fontSize: 14, fontWeight: '500', marginBottom: Spacing.sm },
  formRow: { flexDirection: 'row' },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 14,
  },
});
