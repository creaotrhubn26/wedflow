import React, { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  StyleSheet,
  View,
  TextInput,
  Pressable,
  Alert,
  Share,
  Modal,
  Linking,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import * as Clipboard from "expo-clipboard";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { SwipeableRow } from "@/components/SwipeableRow";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { GuestsStackParamList } from "@/navigation/GuestsStackNavigator";
import { getCoupleSession } from "@/lib/storage";
import { getGuests, createGuest, updateGuest, deleteGuest } from "@/lib/api-guests";
import { GUEST_CATEGORIES } from "@/lib/types";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { searchContacts, requestContactsPermission, ContactResult } from "@/lib/contacts";
import { createGuestInvitation, getGuestInvitations } from "@/lib/api-guest-invitations";
import type { GuestInvitation, WeddingGuest } from "@shared/schema";

type NavigationProp = NativeStackNavigationProp<GuestsStackParamList>;

const STATUS_COLORS: { [key: string]: string } = {
  confirmed: "#4CAF50",
  pending: Colors.dark.accent,
  declined: "#EF5350",
};

const STATUS_LABELS: { [key: string]: string } = {
  confirmed: "Bekreftet",
  pending: "Venter",
  declined: "Avslått",
};

export default function GuestsScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const [guests, setGuests] = useState<WeddingGuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [contactResults, setContactResults] = useState<ContactResult[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGuest, setEditingGuest] = useState<WeddingGuest | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [sendingInvite, setSendingInvite] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<"classic" | "floral" | "modern">("classic");
  const [invitationMessage, setInvitationMessage] = useState("");
  const [invitations, setInvitations] = useState<Array<GuestInvitation & { inviteUrl: string }>>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  const [rsvpFilter, setRsvpFilter] = useState<"all" | "hasInvite" | "responded" | "declined" | "sent">("all");
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<GuestInvitation & { inviteUrl: string } | null>(null);
  
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState<string>("other");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formDietary, setFormDietary] = useState("");
  const [formAllergies, setFormAllergies] = useState("");
  const [formPlusOne, setFormPlusOne] = useState(false);
  const [formPlusOneName, setFormPlusOneName] = useState("");
  const [formNotes, setFormNotes] = useState("");

  const resetForm = () => {
    setFormName("");
    setFormCategory("other");
    setFormPhone("");
    setFormEmail("");
    setFormDietary("");
    setFormAllergies("");
    setFormPlusOne(false);
    setFormPlusOneName("");
    setFormNotes("");
    setEditingGuest(null);
  };

  const loadData = useCallback(async () => {
    if (!sessionToken) return;
    try {
      const data = await getGuests(sessionToken);
      setGuests(data);
    } catch (err) {
      console.warn("Kunne ikke hente gjester", err);
      Alert.alert("Feil", "Kunne ikke laste gjester fra server");
    } finally {
      setLoading(false);
    }
  }, [sessionToken]);

  useEffect(() => {
    const initSession = async () => {
      const session = await getCoupleSession();
      if (session?.token) {
        setSessionToken(session.token);
      }
    };
    initSession();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (sessionToken) {
        loadData();
      }
    }, [sessionToken, loadData])
  );

  const refreshInvitations = useCallback(async () => {
    if (!sessionToken) return;
    setLoadingInvites(true);
    try {
      const data = await getGuestInvitations(sessionToken);
      setInvitations(data);
    } catch (err) {
      console.warn("Kunne ikke hente invitasjoner", err);
    } finally {
      setLoadingInvites(false);
    }
  }, [sessionToken]);

  useEffect(() => {
    refreshInvitations();
  }, [refreshInvitations]);

  const handleSearchChange = async (query: string) => {
    setSearchQuery(query);
    
    if (query.trim().length > 0) {
      const hasPermission = await requestContactsPermission();
      if (hasPermission) {
        const results = await searchContacts(query);
        setContactResults(results);
      }
    } else {
      setContactResults([]);
    }
  };

  const handleSelectContact = (contact: ContactResult) => {
    setFormName(contact.name);
    if (contact.phone) setFormPhone(contact.phone);
    if (contact.email) setFormEmail(contact.email);
    setContactResults([]);
    setSearchQuery("");
  };

  const handleSendInvitation = async () => {
    if (!formName.trim()) {
      Alert.alert("Feil", "Legg inn et navn før du sender invitasjon");
      return;
    }
    if (!sessionToken) {
      Alert.alert("Ikke innlogget", "Logg inn som par for å sende invitasjoner.");
      return;
    }

    setSendingInvite(true);
    try {
      const invitation = await createGuestInvitation(sessionToken, {
        name: formName.trim(),
        email: formEmail.trim() || undefined,
        phone: formPhone.trim() || undefined,
        template: selectedTemplate,
        message: invitationMessage.trim() || undefined,
      });

      await refreshInvitations();

      await Share.share({
        message: `Invitasjon til ${formName.trim()}: ${invitation.inviteUrl}`,
      });

      Alert.alert("Sendt", "Lenken er klar til deling. Du kan dele den senere også.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Kunne ikke sende invitasjon";
      Alert.alert("Feil", message);
    } finally {
      setSendingInvite(false);
    }
  };

  const handleShareExisting = async (invite: GuestInvitation & { inviteUrl: string }) => {
    try {
      await Share.share({
        message: `Invitasjon til ${invite.name}: ${invite.inviteUrl}`,
      });
    } catch (error) {
      console.warn("Share error", error);
    }
  };

  const invitationStatusLabel = (status?: string) => {
    switch (status) {
      case "responded":
        return "Svar mottatt";
      case "declined":
        return "Kan ikke komme";
      case "sent":
        return "Sendt";
      default:
        return "Venter";
    }
  };

  const nameMatches = (g: WeddingGuest) => g.name.toLowerCase().includes(searchQuery.toLowerCase());
  const rsvpMatches = (g: WeddingGuest) => {
    if (rsvpFilter === "all") return true;
    const inv = getInviteForGuest(g);
    if (rsvpFilter === "hasInvite") return !!inv;
    return inv?.status === rsvpFilter;
  };
  const filteredGuests = guests.filter((g) => nameMatches(g)).filter((g) => rsvpMatches(g));

  const confirmedCount = guests.filter((g) => g.status === "confirmed").length;
  const pendingCount = guests.filter((g) => g.status === "pending").length;
  const respondedCount = invitations.filter((inv) => inv.status === "responded").length;
  const declinedCountInv = invitations.filter((inv) => inv.status === "declined").length;
  const sentCountInv = invitations.filter((inv) => inv.status === "sent").length;

  const handleAddGuest = async () => {
    if (!formName.trim()) {
      Alert.alert("Feil", "Vennligst skriv inn et navn");
      return;
    }

    if (!sessionToken) {
      Alert.alert("Ikke innlogget", "Logg inn som par for å legge til gjester.");
      return;
    }

    setIsSaving(true);
    try {
      if (editingGuest) {
        await updateGuest(sessionToken, editingGuest.id, {
          name: formName.trim(),
          category: formCategory,
          phone: formPhone.trim() || undefined,
          email: formEmail.trim() || undefined,
          dietaryRequirements: formDietary.trim() || undefined,
          allergies: formAllergies.trim() || undefined,
          plusOne: formPlusOne,
          plusOneName: formPlusOneName.trim() || undefined,
          notes: formNotes.trim() || undefined,
          status: editingGuest.status,
          tableNumber: editingGuest.tableNumber || undefined,
        });
      } else {
        await createGuest(sessionToken, {
          name: formName.trim(),
          status: "pending",
          category: formCategory,
          phone: formPhone.trim() || undefined,
          email: formEmail.trim() || undefined,
          dietaryRequirements: formDietary.trim() || undefined,
          allergies: formAllergies.trim() || undefined,
          plusOne: formPlusOne,
          plusOneName: formPlusOneName.trim() || undefined,
          notes: formNotes.trim() || undefined,
        });
      }

      await loadData();
      resetForm();
      setShowAddForm(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Kunne ikke lagre gjest";
      Alert.alert("Feil", message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditGuest = (guest: WeddingGuest) => {
    setEditingGuest(guest);
    setFormName(guest.name);
    setFormCategory(guest.category || "other");
    setFormPhone(guest.phone || "");
    setFormEmail(guest.email || "");
    setFormDietary(guest.dietaryRequirements || "");
    setFormAllergies(guest.allergies || "");
    setFormPlusOne(guest.plusOne || false);
    setFormPlusOneName(guest.plusOneName || "");
    setFormNotes(guest.notes || "");
    setShowAddForm(true);
  };

  const handleToggleStatus = async (guest: WeddingGuest) => {
    if (!sessionToken) return;

    const statusOrder: WeddingGuest["status"][] = ["pending", "confirmed", "declined"];
    const currentIndex = statusOrder.indexOf(guest.status);
    const nextStatus = statusOrder[(currentIndex + 1) % statusOrder.length];

    setIsSaving(true);
    try {
      await updateGuest(sessionToken, guest.id, { status: nextStatus });
      await loadData();
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      Alert.alert("Feil", "Kunne ikke oppdatere status");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (!sessionToken) return;

    Alert.alert("Slett gjest", "Er du sikker på at du vil slette denne gjesten?", [
      { text: "Avbryt", style: "cancel" },
      {
        text: "Slett",
        style: "destructive",
        onPress: async () => {
          setIsSaving(true);
          try {
            await deleteGuest(sessionToken, id);
            await loadData();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          } catch (error) {
            Alert.alert("Feil", "Kunne ikke slette gjest");
          } finally {
            setIsSaving(false);
          }
        },
      },
    ]);
  };

  const getCategoryLabel = (category?: string | null) => {
    const cat = GUEST_CATEGORIES.find((c) => c.value === category);
    return cat?.label || "";
  };

  const normalize = (s?: string | null) => (s || "").replace(/\s+/g, "").toLowerCase();
  const getInviteForGuest = (guest: WeddingGuest) => {
    const gEmail = normalize(guest.email);
    const gPhone = normalize(guest.phone);
    return invitations.find(
      (inv) => normalize(inv.email) === gEmail || normalize(inv.phone) === gPhone
    );
  };

  const renderRsvpBadge = (guest: WeddingGuest) => {
    const inv = getInviteForGuest(guest);
    if (!inv || !inv.status) return null;
    const status = inv.status;
    const color = status === "responded" ? "#4CAF50" : status === "declined" ? "#EF5350" : Colors.dark.accent;
    const label = invitationStatusLabel(status);
    return (
      <Pressable
        onPress={() => handleShareExisting(inv)}
        style={[styles.rsvpBadge, { backgroundColor: color + "20" }]}
      >
        <View style={[styles.rsvpDot, { backgroundColor: color }]} />
        <ThemedText style={[styles.rsvpText, { color }]}>{`RSVP: ${label}`}</ThemedText>
      </Pressable>
    );
  };

  const renderGuestItem = ({ item, index }: { item: WeddingGuest; index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 50).duration(300)}>
      <SwipeableRow
        onEdit={() => handleEditGuest(item)}
        onDelete={() => handleDeleteGuest(item.id)}
        backgroundColor={theme.backgroundDefault}
      >
        <Pressable
          onPress={() => handleToggleStatus(item)}
          style={({ pressed }) => [
            styles.guestItem,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
            pressed && { opacity: 0.9 },
          ]}
        >
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: item.category === "reserved" ? Colors.dark.accent + "30" : theme.backgroundSecondary,
              },
            ]}
          >
            <Feather
              name={item.category === "reserved" ? "star" : "user"}
              size={18}
              color={item.category === "reserved" ? Colors.dark.accent : theme.textSecondary}
            />
          </View>
          <View style={styles.guestInfo}>
            <View style={styles.guestNameRow}>
              <ThemedText style={styles.guestName}>{item.name}</ThemedText>
              {item.plusOne ? (
                <View style={[styles.plusOneBadge, { backgroundColor: theme.backgroundSecondary }]}>
                  <ThemedText style={[styles.plusOneText, { color: theme.textSecondary }]}>+1</ThemedText>
                </View>
              ) : null}
            </View>
            <View style={styles.guestMeta}>
              {item.category ? (
                <ThemedText style={[styles.categoryLabel, { color: item.category === "reserved" ? Colors.dark.accent : theme.textSecondary }]}>
                  {getCategoryLabel(item.category)}
                </ThemedText>
              ) : null}
              {item.tableNumber ? (
                <ThemedText style={[styles.tableNumber, { color: theme.textSecondary }]}>
                  • Bord {item.tableNumber}
                </ThemedText>
              ) : null}
              {renderRsvpBadge(item)}
            </View>
            {item.dietaryRequirements || item.allergies ? (
              <View style={styles.dietaryRow}>
                {item.dietaryRequirements ? (
                  <View style={[styles.dietaryBadge, { backgroundColor: "#4CAF5020" }]}>
                    <Feather name="coffee" size={10} color="#4CAF50" />
                    <ThemedText style={[styles.dietaryText, { color: "#4CAF50" }]}>
                      {item.dietaryRequirements}
                    </ThemedText>
                  </View>
                ) : null}
                {item.allergies ? (
                  <View style={[styles.dietaryBadge, { backgroundColor: "#EF535020" }]}>
                    <Feather name="alert-circle" size={10} color="#EF5350" />
                    <ThemedText style={[styles.dietaryText, { color: "#EF5350" }]}>
                      {item.allergies}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: STATUS_COLORS[item.status] + "20" },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: STATUS_COLORS[item.status] },
              ]}
            />
            <ThemedText
              style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}
            >
              {STATUS_LABELS[item.status]}
            </ThemedText>
          </View>
        </Pressable>
      </SwipeableRow>
    </Animated.View>
  );

  const ListHeader = () => (
    <>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.statNumber, { color: Colors.dark.accent }]}>
            {guests.length}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
            Gjester
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.statNumber, { color: "#4CAF50" }]}>
            {confirmedCount}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
            Bekreftet
          </ThemedText>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
          <ThemedText style={[styles.statNumber, { color: Colors.dark.accent }]}>
            {pendingCount}
          </ThemedText>
          <ThemedText style={[styles.statLabel, { color: theme.textSecondary }]}>
            Venter
          </ThemedText>
        </View>
      </View>

      {/* Smart matching CTA - show when there are guests */}
      {guests.length > 0 && (
        <Animated.View entering={FadeInDown.delay(100).duration(300)}>
          <Pressable
            onPress={() => {
              // Navigate to VendorMatching with guest count
              const rootNav = navigation.getParent()?.getParent();
              if (rootNav) {
                (rootNav as any).navigate("Planning", {
                  screen: "VendorMatching",
                  params: { guestCount: confirmedCount > 0 ? confirmedCount : guests.length },
                });
              }
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[styles.matchingCard, { backgroundColor: theme.backgroundDefault, borderColor: Colors.dark.accent + "30" }]}
          >
            <View style={[styles.matchingIconCircle, { backgroundColor: Colors.dark.accent + "15" }]}>
              <Feather name="zap" size={18} color={Colors.dark.accent} />
            </View>
            <View style={styles.matchingContent}>
              <ThemedText style={[styles.matchingTitle, { color: theme.text }]}>
                Finn leverandører for {confirmedCount > 0 ? confirmedCount : guests.length} gjester
              </ThemedText>
              <ThemedText style={[styles.matchingSubtitle, { color: theme.textSecondary }]}>
                Lokale, catering, fotograf, kake og mer
              </ThemedText>
            </View>
            <Feather name="chevron-right" size={18} color={Colors.dark.accent} />
          </Pressable>
        </Animated.View>
      )}

      <View style={styles.filterRow}>
        {[
          { value: "all", label: "Alle" },
          { value: "hasInvite", label: "Har invitasjon" },
          { value: "responded", label: "Svar" },
          { value: "declined", label: "Avslått" },
          { value: "sent", label: "Sendt" },
        ].map((f) => (
          <Pressable
            key={f.value}
            onPress={() => setRsvpFilter(f.value as typeof rsvpFilter)}
            style={[
              styles.filterChip,
              {
                backgroundColor: rsvpFilter === f.value ? Colors.dark.accent : theme.backgroundSecondary,
                borderColor: rsvpFilter === f.value ? Colors.dark.accent : theme.border,
              },
            ]}
          >
            <ThemedText style={[styles.filterChipText, { color: rsvpFilter === f.value ? "#1A1A1A" : theme.textSecondary }]}>
              {f.label}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <View style={styles.actionButtons}>
        <Pressable
          onPress={() => navigation.navigate("TableSeating")}
          style={[styles.actionButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          <Feather name="grid" size={18} color={Colors.dark.accent} />
          <ThemedText style={styles.actionButtonText}>Bordplassering</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("SpeechList")}
          style={[styles.actionButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          <Feather name="mic" size={18} color={Colors.dark.accent} />
          <ThemedText style={styles.actionButtonText}>Taleliste</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => navigation.navigate("GuestInvitations")}
          style={[styles.actionButton, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
        >
          <Feather name="mail" size={18} color={Colors.dark.accent} />
          <ThemedText style={styles.actionButtonText}>Invitasjoner</ThemedText>
        </Pressable>
      </View>

      <View
        style={[
          styles.searchContainer,
          { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
        ]}
      >
        <Feather name="search" size={18} color={theme.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Søk etter gjest eller kontakt..."
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
      </View>

      {contactResults.length > 0 && (
        <Animated.View
          entering={FadeInDown.duration(200)}
          style={[
            styles.contactResultsContainer,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
        >
          <ThemedText style={[styles.contactResultsTitle, { color: theme.textSecondary }]}>
            Kontakter fra telefonen
          </ThemedText>
          {contactResults.map((contact) => (
            <Pressable
              key={contact.id}
              onPress={() => handleSelectContact(contact)}
              style={[
                styles.contactResultItem,
                { backgroundColor: theme.backgroundSecondary, borderColor: theme.border },
              ]}
            >
              <View style={[styles.contactAvatar, { backgroundColor: Colors.dark.accent + "20" }]}>
                <Feather name="phone" size={14} color={Colors.dark.accent} />
              </View>
              <View style={styles.contactInfo}>
                <ThemedText style={styles.contactName}>{contact.name}</ThemedText>
                {contact.phone && (
                  <ThemedText style={[styles.contactDetail, { color: theme.textSecondary }]}>
                    {contact.phone}
                  </ThemedText>
                )}
                {contact.email && (
                  <ThemedText style={[styles.contactDetail, { color: theme.textSecondary }]}>
                    {contact.email}
                  </ThemedText>
                )}
              </View>
              <Feather name="arrow-right" size={16} color={theme.textMuted} />
            </Pressable>
          ))}
        </Animated.View>
      )}

      <ThemedText style={[styles.swipeHint, { color: theme.textMuted }]}>
        Trykk for å endre status • Sveip til venstre for å endre eller slette
      </ThemedText>

      <View style={[styles.inviteCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
        <View style={styles.inviteHeader}>
          <ThemedText style={[styles.inviteTitle, { color: theme.text }]}>Invitasjoner</ThemedText>
          <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>
            {loadingInvites ? "Laster..." : `${invitations.length} stk`}
          </ThemedText>
        </View>
        {invitations.length === 0 ? (
          <ThemedText style={{ color: theme.textSecondary }}>Ingen invitasjoner enda</ThemedText>
        ) : (
          invitations.slice(0, 5).map((inv) => (
            <View
              key={inv.id}
              style={[styles.inviteRow, { borderColor: theme.border }]}
            >
              <View style={{ flex: 1 }}>
                <ThemedText style={{ color: theme.text, fontWeight: "600" }}>{inv.name}</ThemedText>
                <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>
                  {inv.email || inv.phone || "Lenke"}
                </ThemedText>
                <ThemedText style={{ color: theme.textSecondary, fontSize: 12 }}>
                  {invitationStatusLabel(inv.status)}
                </ThemedText>
              </View>
              <Pressable
                onPress={() => handleShareExisting(inv)}
                style={[styles.inviteShareBtn, { borderColor: theme.border }]}
              >
                <Feather name="share-2" size={16} color={theme.text} />
              </Pressable>
            </View>
          ))
        )}
      </View>

      {showAddForm ? (
        <Animated.View
          entering={FadeInDown.duration(300)}
          style={[
            styles.addForm,
            { backgroundColor: theme.backgroundDefault, borderColor: theme.border },
          ]}
        >
          <ThemedText type="h4" style={styles.formTitle}>
            {editingGuest ? "Endre gjest" : "Legg til gjest"}
          </ThemedText>
          
          <TextInput
            style={[
              styles.addInput,
              { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border },
            ]}
            placeholder="Navn *"
            placeholderTextColor={theme.textMuted}
            value={formName}
            onChangeText={setFormName}
            autoFocus
          />

          <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Kategori</ThemedText>
          <View style={styles.categoryPicker}>
            {GUEST_CATEGORIES.map((cat) => (
              <Pressable
                key={cat.value}
                onPress={() => setFormCategory(cat.value)}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: formCategory === cat.value ? Colors.dark.accent : theme.backgroundSecondary,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.categoryChipText,
                    { color: formCategory === cat.value ? "#1A1A1A" : theme.textSecondary },
                  ]}
                >
                  {cat.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <View style={styles.inputRow}>
            <TextInput
              style={[
                styles.addInput,
                styles.halfInput,
                { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border, marginBottom: 0 },
              ]}
              placeholder="Telefon"
              placeholderTextColor={theme.textMuted}
              value={formPhone}
              onChangeText={setFormPhone}
              keyboardType="phone-pad"
            />
            <TextInput
              style={[
                styles.addInput,
                styles.halfInput,
                { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border, marginBottom: 0 },
              ]}
              placeholder="E-post"
              placeholderTextColor={theme.textMuted}
              value={formEmail}
              onChangeText={setFormEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <TextInput
            style={[
              styles.addInput,
              { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border },
            ]}
            placeholder="Kosthold / preferanser"
            placeholderTextColor={theme.textMuted}
            value={formDietary}
            onChangeText={setFormDietary}
          />

          <TextInput
            style={[
              styles.addInput,
              { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border },
            ]}
            placeholder="Allergier"
            placeholderTextColor={theme.textMuted}
            value={formAllergies}
            onChangeText={setFormAllergies}
          />

          <ThemedText style={[styles.inputLabel, { color: theme.textSecondary }]}>Invitasjonskort</ThemedText>
          <View style={styles.templateRow}>
            {[
              { value: "classic", label: "Klassisk" },
              { value: "floral", label: "Floralt" },
              { value: "modern", label: "Moderne" },
            ].map((tpl) => (
              <Pressable
                key={tpl.value}
                onPress={() => setSelectedTemplate(tpl.value as typeof selectedTemplate)}
                style={[
                  styles.templateChip,
                  {
                    backgroundColor: selectedTemplate === tpl.value ? Colors.dark.accent : theme.backgroundSecondary,
                    borderColor: selectedTemplate === tpl.value ? Colors.dark.accent : theme.border,
                  },
                ]}
              >
                <ThemedText
                  style={{
                    color: selectedTemplate === tpl.value ? "#1A1A1A" : theme.textSecondary,
                    fontWeight: "600",
                  }}
                >
                  {tpl.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <TextInput
            style={[
              styles.addInput,
              styles.notesInput,
              { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border },
            ]}
            placeholder="Hilsen / melding til invitasjonen"
            placeholderTextColor={theme.textMuted}
            value={invitationMessage}
            onChangeText={setInvitationMessage}
            multiline
            numberOfLines={3}
          />

          <Pressable
            onPress={() => setFormPlusOne(!formPlusOne)}
            style={[styles.checkboxRow, { borderColor: theme.border }]}
          >
            <View
              style={[
                styles.checkbox,
                {
                  backgroundColor: formPlusOne ? Colors.dark.accent : "transparent",
                  borderColor: formPlusOne ? Colors.dark.accent : theme.border,
                },
              ]}
            >
              {formPlusOne ? <Feather name="check" size={14} color="#1A1A1A" /> : null}
            </View>
            <ThemedText style={{ color: theme.text }}>+1 (Følge)</ThemedText>
          </Pressable>

          {formPlusOne ? (
            <TextInput
              style={[
                styles.addInput,
                { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border },
              ]}
              placeholder="Navn på følge"
              placeholderTextColor={theme.textMuted}
              value={formPlusOneName}
              onChangeText={setFormPlusOneName}
            />
          ) : null}

          <TextInput
            style={[
              styles.addInput,
              styles.notesInput,
              { backgroundColor: theme.backgroundSecondary, color: theme.text, borderColor: theme.border },
            ]}
            placeholder="Notater"
            placeholderTextColor={theme.textMuted}
            value={formNotes}
            onChangeText={setFormNotes}
            multiline
            numberOfLines={3}
          />

          <View style={[styles.addFormButtons, { marginBottom: Spacing.md }]}>
            <Button onPress={handleSendInvitation} style={styles.saveButton} disabled={sendingInvite}>
              {sendingInvite ? "Sender..." : "Send invitasjon"}
            </Button>
          </View>

          <View style={styles.addFormButtons}>
            <Pressable
              onPress={() => {
                setShowAddForm(false);
                resetForm();
              }}
              style={[styles.cancelButton, { borderColor: theme.border }]}
            >
              <ThemedText style={{ color: theme.textSecondary }}>Avbryt</ThemedText>
            </Pressable>
            <Button onPress={handleAddGuest} style={styles.saveButton}>
              {editingGuest ? "Oppdater" : "Legg til"}
            </Button>
          </View>
        </Animated.View>
      ) : null}
    </>
  );

  const ListEmpty = () => (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.backgroundSecondary }]}>
        <Feather name="users" size={48} color={theme.textMuted} />
      </View>
      <ThemedText style={[styles.emptyText, { color: theme.textSecondary }]}>
        Ingen gjester lagt til
      </ThemedText>
      <ThemedText style={[styles.emptySubtext, { color: theme.textMuted }]}>
        Legg til din første gjest
      </ThemedText>
    </View>
  );

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centered,
          { backgroundColor: theme.backgroundRoot },
        ]}
      >
        <ThemedText style={{ color: theme.textSecondary }}>Laster...</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={filteredGuests}
        renderItem={renderGuestItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.lg,
          paddingBottom: tabBarHeight + Spacing.xl + 70,
          paddingHorizontal: Spacing.lg,
          flexGrow: 1,
        }}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={searchQuery ? null : ListEmpty}
        ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
      />

      <Modal
        animationType="slide"
        transparent
        visible={inviteModalVisible}
        onRequestClose={() => setInviteModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}
          >
            <ThemedText style={[styles.modalTitle, { color: theme.text }]}>Invitasjon</ThemedText>
            {selectedInvite ? (
              <>
                <View style={styles.modalRow}>
                  <ThemedText style={{ color: theme.textSecondary }}>Navn:</ThemedText>
                  <ThemedText style={{ color: theme.text }}>{selectedInvite.name}</ThemedText>
                </View>
                {selectedInvite.email ? (
                  <View style={styles.modalRow}>
                    <ThemedText style={{ color: theme.textSecondary }}>E-post:</ThemedText>
                    <ThemedText style={{ color: theme.text }}>{selectedInvite.email}</ThemedText>
                  </View>
                ) : null}
                {selectedInvite.phone ? (
                  <View style={styles.modalRow}>
                    <ThemedText style={{ color: theme.textSecondary }}>Telefon:</ThemedText>
                    <ThemedText style={{ color: theme.text }}>{selectedInvite.phone}</ThemedText>
                  </View>
                ) : null}
                <View style={styles.modalRow}>
                  <ThemedText style={{ color: theme.textSecondary }}>Status:</ThemedText>
                  <ThemedText style={{ color: theme.text }}>{invitationStatusLabel(selectedInvite.status)}</ThemedText>
                </View>
                <View style={styles.modalRow}>
                  <ThemedText style={{ color: theme.textSecondary }}>Lenke:</ThemedText>
                  <ThemedText style={{ color: Colors.dark.accent }}>{selectedInvite.inviteUrl}</ThemedText>
                </View>

                <View style={styles.addFormButtons}>
                  <Button
                    onPress={async () => {
                      if (selectedInvite?.inviteUrl) {
                        await Clipboard.setStringAsync(selectedInvite.inviteUrl);
                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        Alert.alert("Kopiert", "Lenken er kopiert til utklippstavlen.");
                      }
                    }}
                    style={styles.saveButton}
                  >
                    Kopier lenke
                  </Button>
                  <Button
                    onPress={() => {
                      if (selectedInvite?.inviteUrl) Linking.openURL(selectedInvite.inviteUrl);
                    }}
                    style={styles.saveButton}
                  >
                    Åpne RSVP-side
                  </Button>
                </View>
                <View style={styles.addFormButtons}>
                  <Button
                    onPress={() => selectedInvite && handleShareExisting(selectedInvite)}
                    style={styles.saveButton}
                  >
                    Del invitasjon
                  </Button>
                  <Button
                    onPress={() => {
                      if (selectedInvite?.phone && selectedInvite?.inviteUrl) {
                        const smsUrl = `sms:${selectedInvite.phone}?body=${encodeURIComponent(selectedInvite.inviteUrl)}`;
                        Linking.openURL(smsUrl);
                      } else {
                        Alert.alert("Mangler telefon", "Legg til telefonnummer for å sende SMS.");
                      }
                    }}
                    style={styles.saveButton}
                  >
                    Send via SMS
                  </Button>
                </View>
                <View style={styles.addFormButtons}>
                  <Button
                    onPress={() => {
                      if (selectedInvite?.email && selectedInvite?.inviteUrl) {
                        const subject = "Bryllupsinvitasjon";
                        const body = `Hei ${selectedInvite.name},\n\nHer er din invitasjon: ${selectedInvite.inviteUrl}\n`;
                        const mailto = `mailto:${selectedInvite.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                        Linking.openURL(mailto);
                      } else {
                        Alert.alert("Mangler e-post", "Legg til e-postadresse for å sende e-post.");
                      }
                    }}
                    style={styles.saveButton}
                  >
                    Send via e-post
                  </Button>
                </View>
              </>
            ) : null}
            <Pressable
              onPress={() => setInviteModalVisible(false)}
              style={[styles.modalCloseButton, { borderColor: theme.border }]}
            >
              <ThemedText style={{ color: theme.textSecondary }}>Lukk</ThemedText>
            </Pressable>
          </View>
        </View>
      </Modal>

      {!showAddForm ? (
        <Pressable
          onPress={() => {
            setShowAddForm(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          style={[
            styles.fab,
            { backgroundColor: Colors.dark.accent, bottom: tabBarHeight + Spacing.xl },
          ]}
        >
          <Feather name="plus" size={24} color="#1A1A1A" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
  },
  matchingCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  matchingIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  matchingContent: {
    flex: 1,
  },
  matchingTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  matchingSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    gap: Spacing.xs,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "500",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    height: 44,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    marginLeft: Spacing.sm,
    fontSize: 16,
  },
  swipeHint: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  addForm: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  formTitle: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: Spacing.xs,
  },
  categoryPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500",
  },
  inputRow: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  halfInput: {
    flex: 1,
    marginBottom: 0,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
    paddingTop: Spacing.sm,
  },
  templateRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  templateChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  addInput: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    fontSize: 16,
    marginBottom: Spacing.md,
  },
  addFormButtons: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  cancelButton: {
    flex: 1,
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  saveButton: {
    flex: 1,
  },
  guestItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  guestInfo: {
    flex: 1,
  },
  guestNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  guestName: {
    fontSize: 16,
    fontWeight: "500",
  },
  plusOneBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  plusOneText: {
    fontSize: 11,
    fontWeight: "600",
  },
  guestMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  categoryLabel: {
    fontSize: 12,
  },
  tableNumber: {
    fontSize: 12,
    marginLeft: Spacing.xs,
  },
  filterRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "600",
  },
  rsvpBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginLeft: Spacing.xs,
  },
  rsvpDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs,
  },
  rsvpText: {
    fontSize: 11,
    fontWeight: "600",
  },
  dietaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
    marginTop: 4,
  },
  dietaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
    gap: 3,
  },
  dietaryText: {
    fontSize: 10,
    fontWeight: "500",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Spacing.xs,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["5xl"],
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.xl,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.25)",
    elevation: 5,
  },
  contactResultsContainer: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    overflow: "hidden",
  },
  contactResultsTitle: {
    fontSize: 12,
    fontWeight: "600",
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  contactResultItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  contactAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 14,
    fontWeight: "500",
  },
  contactDetail: {
    fontSize: 12,
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    padding: Spacing.lg,
    borderTopLeftRadius: BorderRadius.lg,
    borderTopRightRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  modalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.xs,
  },
  modalCloseButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.full,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  inviteCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
  },
  inviteHeader: {
    marginBottom: Spacing.md,
  },
  inviteTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: Spacing.sm,
  },
  inviteRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  inviteShareBtn: {
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    marginLeft: Spacing.sm,
  },
});
