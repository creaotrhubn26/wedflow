import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useRoute, RouteProp, useNavigation } from "@react-navigation/native";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

interface VendorProduct {
  id: string;
  title: string;
  unitPrice: number;
  unitType: string;
  trackInventory?: boolean;
  availableQuantity?: number;
  reservedQuantity?: number;
  bookingBuffer?: number;
}

interface VendorAvailabilityStatus {
  status: "available" | "blocked" | "limited";
  isAvailable: boolean;
  maxBookings?: number | null;
  currentBookings?: number;
}

interface Contact {
  couple: { id: string; displayName: string; email: string; weddingDate: string | null };
  conversationId: string;
}

interface OfferItem {
  productId?: string;
  title: string;
  description?: string;
  quantity: number;
  unitPrice: number;
}

interface Props {
}

type RouteParams = {
  OfferCreate: { offer?: any };
};

export default function OfferCreateScreen() {
  const route = useRoute<RouteProp<RouteParams, "OfferCreate">>();
  const navigation = useNavigation();
  const editingOffer = route.params?.offer;
  const isEditMode = !!editingOffer;
  
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [validUntil, setValidUntil] = useState<Date>(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [items, setItems] = useState<OfferItem[]>([]);
  const [customItemTitle, setCustomItemTitle] = useState("");
  const [customItemPrice, setCustomItemPrice] = useState("");
  const [customItemQuantity, setCustomItemQuantity] = useState("1");

  // Pre-fill form when editing
  useEffect(() => {
    if (editingOffer) {
      setTitle(editingOffer.title || "");
      setMessage(editingOffer.message || "");
      if (editingOffer.validUntil) {
        setValidUntil(new Date(editingOffer.validUntil));
      }
      if (editingOffer.couple) {
        setSelectedContact({
          couple: editingOffer.couple,
          conversationId: editingOffer.conversationId || "",
        });
      }
      if (editingOffer.items && Array.isArray(editingOffer.items)) {
        setItems(editingOffer.items.map((item: any) => ({
          productId: item.productId,
          title: item.title,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })));
      }
    }
  }, [editingOffer]);

  const { data: contacts = [], isLoading: contactsLoading } = useQuery<Contact[]>({
    queryKey: ["/api/vendor/contacts"],
    queryFn: async () => {
      const sessionData = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
      if (!sessionData) return [];
      const session = JSON.parse(sessionData);
      const response = await fetch(new URL("/api/vendor/contacts", getApiUrl()).toString(), {
        headers: { Authorization: `Bearer ${session.sessionToken}` },
      });
      if (!response.ok) throw new Error("Kunne ikke hente kontakter");
      return response.json();
    },
  });

  const { data: products = [], isLoading: productsLoading } = useQuery<VendorProduct[]>({
    queryKey: ["/api/vendor/products"],
    queryFn: async () => {
      const sessionData = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
      if (!sessionData) return [];
      const session = JSON.parse(sessionData);
      const response = await fetch(new URL("/api/vendor/products", getApiUrl()).toString(), {
        headers: { Authorization: `Bearer ${session.sessionToken}` },
      });
      if (!response.ok) throw new Error("Kunne ikke hente produkter");
      return response.json();
    },
  });

  // Check vendor availability for the couple's wedding date
  const weddingDate = selectedContact?.couple.weddingDate || editingOffer?.couple?.weddingDate;
  const { data: vendorAvailability } = useQuery<VendorAvailabilityStatus>({
    queryKey: ["/api/vendor/availability/check", weddingDate],
    queryFn: async () => {
      if (!weddingDate) return { status: "available", isAvailable: true };
      const sessionData = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
      if (!sessionData) throw new Error("Ikke innlogget");
      const session = JSON.parse(sessionData);
      
      // Check self availability for the wedding date
      const availRes = await fetch(
        new URL(`/api/vendor/availability?startDate=${weddingDate}&endDate=${weddingDate}`, getApiUrl()).toString(),
        { headers: { Authorization: `Bearer ${session.sessionToken}` } }
      );
      if (!availRes.ok) return { status: "available", isAvailable: true };
      const availData = await availRes.json();
      const dateAvail = availData.find((a: any) => a.date === weddingDate);
      
      // Also get booking count for the date
      const bookingsRes = await fetch(
        new URL(`/api/vendor/availability/${weddingDate}/bookings`, getApiUrl()).toString(),
        { headers: { Authorization: `Bearer ${session.sessionToken}` } }
      );
      const bookingsData = bookingsRes.ok ? await bookingsRes.json() : { acceptedBookings: 0 };
      
      if (dateAvail) {
        return {
          status: dateAvail.status,
          isAvailable: dateAvail.status !== "blocked",
          maxBookings: dateAvail.maxBookings,
          currentBookings: bookingsData.acceptedBookings,
        };
      }
      return { status: "available", isAvailable: true, currentBookings: bookingsData.acceptedBookings };
    },
    enabled: !!weddingDate,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!isEditMode && !selectedContact) throw new Error("Velg en mottaker");
      if (items.length === 0) throw new Error("Legg til minst én linje");

      const sessionData = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
      if (!sessionData) throw new Error("Ikke innlogget");
      const session = JSON.parse(sessionData);

      const url = isEditMode
        ? new URL(`/api/vendor/offers/${editingOffer.id}`, getApiUrl()).toString()
        : new URL("/api/vendor/offers", getApiUrl()).toString();
      
      const response = await fetch(url, {
        method: isEditMode ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.sessionToken}`,
        },
        body: JSON.stringify({
          coupleId: selectedContact?.couple.id || editingOffer?.couple?.id,
          conversationId: selectedContact?.conversationId || editingOffer?.conversationId,
          title,
          message: message || undefined,
          validUntil: validUntil.toISOString(),
          items: items.map((item) => ({
            productId: item.productId,
            title: item.title,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || (isEditMode ? "Kunne ikke oppdatere tilbud" : "Kunne ikke opprette tilbud"));
      }

      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/offers"] });
      navigation.goBack();
    },
    onError: (error: Error) => {
      Alert.alert("Feil", error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const sessionData = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
      if (!sessionData) throw new Error("Ikke innlogget");
      const session = JSON.parse(sessionData);

      const response = await fetch(
        new URL(`/api/vendor/offers/${editingOffer.id}`, getApiUrl()).toString(),
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${session.sessionToken}` },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kunne ikke slette tilbud");
      }
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/offers"] });
      navigation.goBack();
    },
    onError: (error: Error) => {
      Alert.alert("Feil", error.message);
    },
  });

  const handleDelete = () => {
    Alert.alert(
      "Slett tilbud",
      "Er du sikker på at du vil slette dette tilbudet?",
      [
        { text: "Avbryt", style: "cancel" },
        { text: "Slett", style: "destructive", onPress: () => deleteMutation.mutate() },
      ]
    );
  };

  const addProductToOffer = (product: VendorProduct) => {
    setItems([...items, {
      productId: product.id,
      title: product.title,
      quantity: 1,
      unitPrice: product.unitPrice,
    }]);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const addCustomItem = () => {
    if (!customItemTitle.trim() || !customItemPrice) return;
    
    const priceInOre = Math.round(parseFloat(customItemPrice) * 100);
    const quantity = parseInt(customItemQuantity) || 1;

    setItems([...items, {
      title: customItemTitle,
      quantity,
      unitPrice: priceInOre,
    }]);

    setCustomItemTitle("");
    setCustomItemPrice("");
    setCustomItemQuantity("1");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    // Note: Backend will validate date-specific availability when creating the offer
    const updated = [...items];
    updated[index].quantity = Math.max(1, quantity);
    setItems(updated);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const formatPrice = (priceInOre: number) => {
    return (priceInOre / 100).toLocaleString("nb-NO", { minimumFractionDigits: 0 }) + " kr";
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" });
  };

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setValidUntil(selectedDate);
    }
  };

  const isValid = title.trim().length >= 2 && (selectedContact || isEditMode) && items.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md, backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <View style={[styles.headerIconCircle, { backgroundColor: theme.accent }]}>
            <Feather name="file-text" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.headerTextContainer}>
            <ThemedText style={[styles.headerTitle, { color: theme.text }]}>
              {isEditMode ? "Rediger tilbud" : "Nytt tilbud"}
            </ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              {isEditMode ? "Oppdater tilbudsinfo" : "Send tilbud til brudepar"}
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
          <Feather name="x" size={20} color={theme.textSecondary} />
        </Pressable>
      </View>
      <KeyboardAwareScrollViewCompat
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.content,
          { paddingTop: Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <Animated.View entering={FadeInDown.duration(300)} style={styles.formSection}>
          <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <ThemedText style={styles.formTitle}>Mottaker</ThemedText>

            {contactsLoading ? (
              <ActivityIndicator size="small" color={Colors.dark.accent} />
            ) : contacts.length === 0 ? (
              <View style={styles.emptyState}>
                <Feather name="users" size={24} color={theme.textMuted} />
                <ThemedText style={[styles.emptyText, { color: theme.textMuted }]}>
                  Ingen kontakter ennå. Start en samtale med et brudepar først.
                </ThemedText>
              </View>
            ) : (
              <View style={styles.contactList}>
                {contacts.map((contact) => (
                  <Pressable
                    key={contact.couple.id}
                    onPress={() => {
                      setSelectedContact(contact);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                    style={[
                      styles.contactItem,
                      {
                        backgroundColor: selectedContact?.couple.id === contact.couple.id
                          ? Colors.dark.accent + "20"
                          : theme.backgroundRoot,
                        borderColor: selectedContact?.couple.id === contact.couple.id
                          ? Colors.dark.accent
                          : theme.border,
                      },
                    ]}
                  >
                    <View style={styles.contactInfo}>
                      <ThemedText style={styles.contactName}>{contact.couple.displayName}</ThemedText>
                      <ThemedText style={[styles.contactEmail, { color: theme.textMuted }]}>
                        {contact.couple.email}
                      </ThemedText>
                      {contact.couple.weddingDate && (
                        <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 }}>
                          <Feather name="calendar" size={12} color={theme.textMuted} />
                          <ThemedText style={[styles.contactEmail, { color: theme.textMuted }]}>
                            {new Date(contact.couple.weddingDate).toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" })}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                    {selectedContact?.couple.id === contact.couple.id ? (
                      <Feather name="check-circle" size={20} color={Colors.dark.accent} />
                    ) : null}
                  </Pressable>
                ))}
              </View>
            )}
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(100)} style={styles.formSection}>
          <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <ThemedText style={styles.formTitle}>Tilbudsdetaljer</ThemedText>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Tittel</ThemedText>
              <TextInput
                testID="input-offer-title"
                style={[
                  styles.textInput,
                  { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                ]}
                placeholder="F.eks. Bryllupspakke 2026"
                placeholderTextColor={theme.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Melding (valgfritt)</ThemedText>
              <TextInput
                testID="input-offer-message"
                style={[
                  styles.textInput,
                  styles.textArea,
                  { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                ]}
                placeholder="Legg til en personlig melding..."
                placeholderTextColor={theme.textMuted}
                value={message}
                onChangeText={setMessage}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Gyldig til</ThemedText>
              {Platform.OS === "web" ? (
                <TextInput
                  style={[
                    styles.textInput,
                    { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                  ]}
                  value={validUntil.toISOString().split("T")[0]}
                  onChangeText={(text) => setValidUntil(new Date(text))}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.textMuted}
                />
              ) : (
                <>
                  <Pressable
                    onPress={() => setShowDatePicker(true)}
                    style={[
                      styles.dateButton,
                      { backgroundColor: theme.backgroundRoot, borderColor: theme.border },
                    ]}
                  >
                    <Feather name="calendar" size={18} color={Colors.dark.accent} />
                    <ThemedText style={styles.dateButtonText}>{formatDate(validUntil)}</ThemedText>
                  </Pressable>
                  {showDatePicker ? (
                    <DateTimePicker
                      value={validUntil}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                      minimumDate={new Date()}
                    />
                  ) : null}
                </>
              )}
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(300).delay(200)} style={styles.formSection}>
          <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <View style={{ marginBottom: Spacing.md }}>
              <ThemedText style={styles.formTitle}>Produkter og tjenester</ThemedText>
              {selectedContact?.couple.weddingDate && (
                <View style={[styles.dateInfoBadge, { backgroundColor: Colors.dark.accent + "15", borderColor: Colors.dark.accent + "30" }]}>
                  <Feather name="calendar" size={14} color={Colors.dark.accent} />
                  <ThemedText style={[styles.dateInfoText, { color: Colors.dark.accent }]}>
                    Bryllup: {new Date(selectedContact.couple.weddingDate).toLocaleDateString("nb-NO", { day: "numeric", month: "long", year: "numeric" })}
                  </ThemedText>
                </View>
              )}
              
              {/* Availability warnings */}
              {vendorAvailability && !vendorAvailability.isAvailable && (
                <View style={[styles.availabilityWarning, { backgroundColor: "#F44336" + "15", borderColor: "#F44336" }]}>
                  <Feather name="x-circle" size={16} color="#F44336" />
                  <ThemedText style={[styles.availabilityWarningText, { color: "#F44336" }]}>
                    Du er blokkert på denne datoen. Tilbud kan ikke aksepteres.
                  </ThemedText>
                </View>
              )}
              {vendorAvailability && vendorAvailability.status === "limited" && vendorAvailability.maxBookings && (
                <View style={[styles.availabilityWarning, { backgroundColor: "#FF9800" + "15", borderColor: "#FF9800" }]}>
                  <Feather name="alert-circle" size={16} color="#FF9800" />
                  <ThemedText style={[styles.availabilityWarningText, { color: "#FF9800" }]}>
                    Begrenset kapasitet: {vendorAvailability.currentBookings || 0}/{vendorAvailability.maxBookings} bookinger
                  </ThemedText>
                </View>
              )}
              {vendorAvailability && vendorAvailability.currentBookings && vendorAvailability.currentBookings > 0 && vendorAvailability.status === "available" && (
                <View style={[styles.availabilityInfo, { backgroundColor: "#4CAF50" + "15", borderColor: "#4CAF50" }]}>
                  <Feather name="check-circle" size={16} color="#4CAF50" />
                  <ThemedText style={[styles.availabilityInfoText, { color: "#4CAF50" }]}>
                    {vendorAvailability.currentBookings} eksisterende booking(er) på denne datoen
                  </ThemedText>
                </View>
              )}
            </View>

            {productsLoading ? (
              <ActivityIndicator size="small" color={Colors.dark.accent} />
            ) : products.length > 0 ? (
              <View style={styles.productList}>
                {products.map((product) => {
                  // Show total available (server will check date-specific availability)
                  const totalAvailable = product.trackInventory 
                    ? (product.availableQuantity || 0) - (product.bookingBuffer || 0)
                    : null;
                  
                  return (
                    <Pressable
                      key={product.id}
                      onPress={() => addProductToOffer(product)}
                      style={[styles.productItem, { backgroundColor: theme.backgroundRoot, borderColor: theme.border }]}
                    >
                      <View style={styles.productInfo}>
                        <View style={{ flexDirection: "row", alignItems: "center", gap: Spacing.xs }}>
                          <ThemedText style={styles.productTitle}>{product.title}</ThemedText>
                          {product.trackInventory && totalAvailable !== null && (
                            <View style={[styles.inventoryBadge, {
                              backgroundColor: totalAvailable > 10 ? "#4CAF50" + "20" : totalAvailable > 0 ? "#FF9800" + "20" : "#F44336" + "20"
                            }]}>
                              <Feather 
                                name={totalAvailable > 10 ? "check-circle" : totalAvailable > 0 ? "alert-circle" : "x-circle"} 
                                size={12} 
                                color={totalAvailable > 10 ? "#4CAF50" : totalAvailable > 0 ? "#FF9800" : "#F44336"}
                              />
                              <ThemedText style={{
                                fontSize: 11,
                                marginLeft: 4,
                                color: totalAvailable > 10 ? "#4CAF50" : totalAvailable > 0 ? "#FF9800" : "#F44336"
                              }}>
                                {totalAvailable} totalt
                              </ThemedText>
                            </View>
                          )}
                        </View>
                        <ThemedText style={[styles.productPrice, { color: Colors.dark.accent }]}>
                          {formatPrice(product.unitPrice)} / {product.unitType}
                        </ThemedText>
                      </View>
                      <Feather name="plus-circle" size={20} color={Colors.dark.accent} />
                    </Pressable>
                  );
                })}
              </View>
            ) : null}

            <View style={[styles.customItemSection, { borderTopColor: theme.border }]}>
              <ThemedText style={[styles.sectionSubtitle, { color: theme.textMuted }]}>
                Eller legg til manuelt:
              </ThemedText>
              <View style={styles.customItemInputs}>
                <TextInput
                  testID="input-custom-item-title"
                  style={[
                    styles.textInput,
                    { flex: 2, backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                  ]}
                  placeholder="Beskrivelse"
                  placeholderTextColor={theme.textMuted}
                  value={customItemTitle}
                  onChangeText={setCustomItemTitle}
                />
                <TextInput
                  testID="input-custom-item-price"
                  style={[
                    styles.textInput,
                    { flex: 1, backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                  ]}
                  placeholder="Pris"
                  placeholderTextColor={theme.textMuted}
                  value={customItemPrice}
                  onChangeText={setCustomItemPrice}
                  keyboardType="numeric"
                />
                <Pressable
                  testID="button-add-custom-item"
                  onPress={addCustomItem}
                  style={[styles.addItemBtn, { backgroundColor: Colors.dark.accent }]}
                >
                  <Feather name="plus" size={18} color="#1A1A1A" />
                </Pressable>
              </View>
            </View>
          </View>
        </Animated.View>

        {items.length > 0 ? (
          <Animated.View entering={FadeInDown.duration(300).delay(300)} style={styles.formSection}>
            <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
              <ThemedText style={styles.formTitle}>Tilbudslinjer</ThemedText>

              {items.map((item, index) => (
                <View key={index} style={[styles.offerItem, { borderBottomColor: theme.border }]}>
                  <View style={styles.offerItemInfo}>
                    <ThemedText style={styles.offerItemTitle}>{item.title}</ThemedText>
                    <ThemedText style={[styles.offerItemPrice, { color: theme.textMuted }]}>
                      {formatPrice(item.unitPrice)} x {item.quantity} = {formatPrice(item.unitPrice * item.quantity)}
                    </ThemedText>
                  </View>
                  <View style={styles.offerItemActions}>
                    <Pressable
                      onPress={() => updateItemQuantity(index, item.quantity - 1)}
                      style={[styles.qtyBtn, { borderColor: theme.border }]}
                    >
                      <Feather name="minus" size={14} color={theme.textMuted} />
                    </Pressable>
                    <ThemedText style={styles.qtyText}>{item.quantity}</ThemedText>
                    <Pressable
                      onPress={() => updateItemQuantity(index, item.quantity + 1)}
                      style={[styles.qtyBtn, { borderColor: theme.border }]}
                    >
                      <Feather name="plus" size={14} color={theme.textMuted} />
                    </Pressable>
                    <Pressable onPress={() => removeItem(index)} style={styles.removeBtn}>
                      <Feather name="trash-2" size={16} color="#F44336" />
                    </Pressable>
                  </View>
                </View>
              ))}

              <View style={[styles.totalRow, { borderTopColor: theme.border }]}>
                <ThemedText style={styles.totalLabel}>Totalt:</ThemedText>
                <ThemedText style={[styles.totalAmount, { color: Colors.dark.accent }]}>
                  {formatPrice(totalAmount)}
                </ThemedText>
              </View>
            </View>
          </Animated.View>
        ) : null}

        <Button
          onPress={() => saveMutation.mutate()}
          disabled={!isValid || saveMutation.isPending}
          style={styles.submitButton}
        >
          {saveMutation.isPending 
            ? (isEditMode ? "Oppdaterer tilbud..." : "Sender tilbud...") 
            : (isEditMode ? "Oppdater tilbud" : "Send tilbud")}
        </Button>

        {isEditMode ? (
          <Pressable
            onPress={handleDelete}
            disabled={deleteMutation.isPending}
            style={[styles.deleteBtn, { borderColor: "#F44336" }]}
          >
            {deleteMutation.isPending ? (
              <ActivityIndicator size="small" color="#F44336" />
            ) : (
              <>
                <Feather name="trash-2" size={18} color="#F44336" />
                <ThemedText style={styles.deleteBtnText}>Slett tilbud</ThemedText>
              </>
            )}
          </Pressable>
        ) : null}
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.md,
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
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  formSection: {
    marginBottom: Spacing.lg,
  },
  formCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  textInput: {
    fontSize: 16,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  dateButtonText: {
    fontSize: 16,
  },
  emptyState: {
    alignItems: "center",
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },
  contactList: {
    gap: Spacing.sm,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: "600",
  },
  contactEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  productList: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  productItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  productInfo: {
    flex: 1,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  productPrice: {
    fontSize: 13,
    marginTop: 2,
  },
  customItemSection: {
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  sectionSubtitle: {
    fontSize: 13,
    marginBottom: Spacing.sm,
  },
  customItemInputs: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "center",
  },
  addItemBtn: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  offerItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  offerItemInfo: {
    flex: 1,
  },
  offerItemTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  offerItemPrice: {
    fontSize: 13,
    marginTop: 2,
  },
  offerItemActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    fontSize: 14,
    fontWeight: "600",
    minWidth: 24,
    textAlign: "center",
  },
  removeBtn: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    marginTop: Spacing.sm,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "700",
  },
  submitButton: {
    marginTop: Spacing.md,
  },
  inventoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.md,
    marginBottom: Spacing.xl,
  },
  deleteBtnText: {
    color: "#F44336",
    fontSize: 16,
    fontWeight: "600",
  },
  dateInfoBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: Spacing.xs,
    alignSelf: "flex-start",
  },
  dateInfoText: {
    fontSize: 12,
    fontWeight: "600",
  },
  availabilityWarning: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  availabilityWarningText: {
    fontSize: 13,
    flex: 1,
  },
  availabilityInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  availabilityInfoText: {
    fontSize: 13,
    flex: 1,
  },
});
