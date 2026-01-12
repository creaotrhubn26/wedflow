import React, { useState } from "react";
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
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { getApiUrl } from "@/lib/query-client";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

interface VendorProduct {
  id: string;
  title: string;
  unitPrice: number;
  unitType: string;
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
  navigation: NativeStackNavigationProp<any>;
}

export default function OfferCreateScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
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

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!selectedContact) throw new Error("Velg en mottaker");
      if (items.length === 0) throw new Error("Legg til minst én linje");

      const sessionData = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
      if (!sessionData) throw new Error("Ikke innlogget");
      const session = JSON.parse(sessionData);

      const response = await fetch(new URL("/api/vendor/offers", getApiUrl()).toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.sessionToken}`,
        },
        body: JSON.stringify({
          coupleId: selectedContact.couple.id,
          conversationId: selectedContact.conversationId,
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
        throw new Error(error.error || "Kunne ikke opprette tilbud");
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

  const isValid = title.trim().length >= 2 && selectedContact && items.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <KeyboardAwareScrollViewCompat
        contentContainerStyle={[
          styles.content,
          { paddingTop: headerHeight + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
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
            <ThemedText style={styles.formTitle}>Produkter og tjenester</ThemedText>

            {productsLoading ? (
              <ActivityIndicator size="small" color={Colors.dark.accent} />
            ) : products.length > 0 ? (
              <View style={styles.productList}>
                {products.map((product) => (
                  <Pressable
                    key={product.id}
                    onPress={() => addProductToOffer(product)}
                    style={[styles.productItem, { backgroundColor: theme.backgroundRoot, borderColor: theme.border }]}
                  >
                    <View style={styles.productInfo}>
                      <ThemedText style={styles.productTitle}>{product.title}</ThemedText>
                      <ThemedText style={[styles.productPrice, { color: Colors.dark.accent }]}>
                        {formatPrice(product.unitPrice)} / {product.unitType}
                      </ThemedText>
                    </View>
                    <Feather name="plus-circle" size={20} color={Colors.dark.accent} />
                  </Pressable>
                ))}
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
          onPress={() => createMutation.mutate()}
          disabled={!isValid || createMutation.isPending}
          style={styles.submitButton}
        >
          {createMutation.isPending ? "Sender tilbud..." : "Send tilbud"}
        </Button>
      </KeyboardAwareScrollViewCompat>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
});
