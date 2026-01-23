import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import type { RootStackParamList } from "@/navigation/RootStackNavigator";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

const UNIT_TYPES = [
  { value: "stk", label: "Stykk" },
  { value: "time", label: "Time" },
  { value: "dag", label: "Dag" },
  { value: "pakke", label: "Pakke" },
  { value: "m2", label: "m\u00B2" },
];

interface Props {
  navigation: NativeStackNavigationProp<RootStackParamList, "ProductCreate">;
  route: RouteProp<RootStackParamList, "ProductCreate">;
}

export default function ProductCreateScreen({ navigation, route }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();
  
  const editingProduct = route.params?.product;
  const isEditMode = !!editingProduct;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [unitType, setUnitType] = useState("stk");
  const [leadTimeDays, setLeadTimeDays] = useState("");
  const [minQuantity, setMinQuantity] = useState("1");
  const [categoryTag, setCategoryTag] = useState("");
  const [trackInventory, setTrackInventory] = useState(false);
  const [availableQuantity, setAvailableQuantity] = useState("");
  const [bookingBuffer, setBookingBuffer] = useState("0");

  // Pre-fill form when editing
  useEffect(() => {
    if (editingProduct) {
      setTitle(editingProduct.title || "");
      setDescription(editingProduct.description || "");
      setUnitPrice(editingProduct.unitPrice ? String(editingProduct.unitPrice / 100) : "");
      setUnitType(editingProduct.unitType || "stk");
      setLeadTimeDays(editingProduct.leadTimeDays ? String(editingProduct.leadTimeDays) : "");
      setMinQuantity(editingProduct.minQuantity ? String(editingProduct.minQuantity) : "1");
      setCategoryTag(editingProduct.categoryTag || "");
      setTrackInventory(editingProduct.trackInventory || false);
      setAvailableQuantity(editingProduct.availableQuantity ? String(editingProduct.availableQuantity) : "");
      setBookingBuffer(editingProduct.bookingBuffer ? String(editingProduct.bookingBuffer) : "0");
    }
  }, [editingProduct]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      const sessionData = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
      if (!sessionData) throw new Error("Ikke innlogget");
      const session = JSON.parse(sessionData);

      const priceInOre = Math.round(parseFloat(unitPrice) * 100);
      
      const url = isEditMode 
        ? new URL(`/api/vendor/products/${editingProduct.id}`, getApiUrl()).toString()
        : new URL("/api/vendor/products", getApiUrl()).toString();

      const response = await fetch(url, {
        method: isEditMode ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.sessionToken}`,
        },
        body: JSON.stringify({
          title,
          description: description || undefined,
          unitPrice: priceInOre,
          unitType,
          leadTimeDays: leadTimeDays ? parseInt(leadTimeDays) : undefined,
          minQuantity: minQuantity ? parseInt(minQuantity) : 1,
          categoryTag: categoryTag || undefined,
          trackInventory,
          availableQuantity: trackInventory && availableQuantity ? parseInt(availableQuantity) : undefined,
          bookingBuffer: trackInventory && bookingBuffer ? parseInt(bookingBuffer) : 0,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || (isEditMode ? "Kunne ikke oppdatere produkt" : "Kunne ikke opprette produkt"));
      }

      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/products"] });
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
        new URL(`/api/vendor/products/${editingProduct.id}`, getApiUrl()).toString(),
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.sessionToken}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kunne ikke slette produkt");
      }

      return response.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["/api/vendor/products"] });
      navigation.goBack();
    },
    onError: (error: Error) => {
      Alert.alert("Feil", error.message);
    },
  });

  const handleDelete = () => {
    Alert.alert(
      "Slett produkt",
      `Er du sikker på at du vil slette "${title}"?`,
      [
        { text: "Avbryt", style: "cancel" },
        { text: "Slett", style: "destructive", onPress: () => deleteMutation.mutate() },
      ]
    );
  };

  const isValid = title.trim().length >= 2 && parseFloat(unitPrice) >= 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.md, backgroundColor: theme.backgroundDefault, borderBottomColor: theme.border }]}>
        <View style={styles.headerContent}>
          <View style={[styles.headerIconCircle, { backgroundColor: theme.accent }]}>
            <Feather name="shopping-bag" size={20} color="#FFFFFF" />
          </View>
          <View style={styles.headerTextContainer}>
            <ThemedText style={[styles.headerTitle, { color: theme.text }]}>
              {isEditMode ? "Rediger produkt" : "Nytt produkt"}
            </ThemedText>
            <ThemedText style={[styles.headerSubtitle, { color: theme.textSecondary }]}>
              {isEditMode ? "Oppdater produktinfo" : "Legg til tjeneste eller vare"}
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
        <Animated.View entering={FadeInDown.duration(300)}>
          <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconCircle, { backgroundColor: theme.accent + "15" }]}>
                <Feather name="info" size={16} color={theme.accent} />
              </View>
              <ThemedText style={[styles.formTitle, { color: theme.text }]}>Produktinformasjon</ThemedText>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Tittel</ThemedText>
              <TextInput
                testID="input-product-title"
                style={[
                  styles.textInput,
                  { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                ]}
                placeholder="F.eks. Bryllupsfotografering"
                placeholderTextColor={theme.textMuted}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Beskrivelse (valgfritt)</ThemedText>
              <TextInput
                testID="input-product-description"
                style={[
                  styles.textInput,
                  styles.textArea,
                  { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                ]}
                placeholder="Beskriv produktet eller tjenesten..."
                placeholderTextColor={theme.textMuted}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Pris (NOK)</ThemedText>
                <TextInput
                  testID="input-product-price"
                  style={[
                    styles.textInput,
                    { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                  ]}
                  placeholder="0"
                  placeholderTextColor={theme.textMuted}
                  value={unitPrice}
                  onChangeText={setUnitPrice}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Enhet</ThemedText>
                <View style={styles.unitPicker}>
                  {UNIT_TYPES.map((unit) => (
                    <Pressable
                      key={unit.value}
                      onPress={() => {
                        setUnitType(unit.value);
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      }}
                      style={[{
                        paddingHorizontal: Spacing.md,
                        paddingVertical: Spacing.sm,
                        borderRadius: BorderRadius.full,
                        borderWidth: unitType === unit.value ? 0 : 1,
                        backgroundColor: unitType === unit.value ? theme.accent : theme.backgroundRoot,
                        borderColor: theme.border,
                      }]}
                    >
                      <ThemedText
                        style={[{
                          fontSize: 13,
                          fontWeight: "600",
                          color: unitType === unit.value ? "#FFFFFF" : theme.textMuted,
                        }]}
                      >
                        {unit.label}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.rowInputs}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Leveringstid (dager)</ThemedText>
                <TextInput
                  testID="input-product-lead-time"
                  style={[
                    styles.textInput,
                    { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                  ]}
                  placeholder="Valgfritt"
                  placeholderTextColor={theme.textMuted}
                  value={leadTimeDays}
                  onChangeText={setLeadTimeDays}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Min. antall</ThemedText>
                <TextInput
                  testID="input-product-min-quantity"
                  style={[
                    styles.textInput,
                    { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                  ]}
                  placeholder="1"
                  placeholderTextColor={theme.textMuted}
                  value={minQuantity}
                  onChangeText={setMinQuantity}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Kategori (valgfritt)</ThemedText>
              <TextInput
                testID="input-product-category"
                style={[
                  styles.textInput,
                  { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                ]}
                placeholder="F.eks. Hovedtjenester, Tillegg..."
                placeholderTextColor={theme.textMuted}
                value={categoryTag}
                onChangeText={setCategoryTag}
              />
            </View>
          </View>

          {/* Inventory Tracking Section */}
          <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, marginTop: Spacing.lg }]}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIconCircle, { backgroundColor: theme.accent + "15" }]}>
                <Feather name="package" size={16} color={theme.accent} />
              </View>
              <ThemedText style={[styles.formTitle, { color: theme.text }]}>Lagerstyring</ThemedText>
            </View>

            <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
              <View style={styles.switchContent}>
                <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Aktiver lagerstyring</ThemedText>
                <ThemedText style={[styles.switchDescription, { color: theme.textMuted }]}>
                  Hold oversikt over tilgjengelig antall (f.eks. 200 stoler)
                </ThemedText>
              </View>
              <Switch
                value={trackInventory}
                onValueChange={(value) => {
                  setTrackInventory(value);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                trackColor={{ false: theme.border, true: theme.accent }}
                thumbColor="#FFFFFF"
              />
            </View>

            {trackInventory && (
              <Animated.View entering={FadeInDown.duration(300)}>
                <View style={styles.rowInputs}>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>
                      Totalt tilgjengelig
                    </ThemedText>
                    <TextInput
                      testID="input-available-quantity"
                      style={[
                        styles.textInput,
                        { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                      ]}
                      placeholder="200"
                      placeholderTextColor={theme.textMuted}
                      value={availableQuantity}
                      onChangeText={setAvailableQuantity}
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>
                      Sikkerhetsbuffer
                    </ThemedText>
                    <TextInput
                      testID="input-booking-buffer"
                      style={[
                        styles.textInput,
                        { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border },
                      ]}
                      placeholder="10"
                      placeholderTextColor={theme.textMuted}
                      value={bookingBuffer}
                      onChangeText={setBookingBuffer}
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={[styles.infoBox, { backgroundColor: theme.accent + "12", borderColor: theme.accent + "30" }]}>
                  <Feather name="info" size={16} color={theme.accent} />
                  <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                    <ThemedText style={[styles.infoBoxText, { color: theme.text }]}>
                      {availableQuantity && parseInt(availableQuantity) > 0 ? (
                        <>
                          <ThemedText style={{ fontWeight: "600" }}>
                            {parseInt(availableQuantity) - parseInt(bookingBuffer || "0")}
                          </ThemedText>
                          {" "}tilgjengelig for booking
                          {editingProduct?.reservedQuantity > 0 && (
                            <ThemedText style={{ color: theme.textMuted }}>
                              {" "}({editingProduct.reservedQuantity} reservert)
                            </ThemedText>
                          )}
                        </>
                      ) : (
                        "Angi totalt antall og sikkerhetsbuffer"
                      )}
                    </ThemedText>
                    <ThemedText style={[styles.infoBoxSubtext, { color: theme.textMuted }]}>
                      Sikkerhetsbuffer holdes alltid tilbake
                    </ThemedText>
                  </View>
                </View>
              </Animated.View>
            )}
          </View>

          <View style={[styles.formCard, { backgroundColor: theme.backgroundDefault, borderColor: theme.border, marginTop: Spacing.lg }]}>
            <View style={[styles.pricePreview, { backgroundColor: theme.accent + "12" }]}>
              <View style={[styles.pricePreviewIcon, { backgroundColor: theme.accent }]}>
                <Feather name="tag" size={16} color="#FFFFFF" />
              </View>
              <ThemedText style={[styles.pricePreviewText, { color: theme.text }]}>
                {parseFloat(unitPrice) > 0
                  ? `${parseFloat(unitPrice).toLocaleString("nb-NO")} kr / ${UNIT_TYPES.find(u => u.value === unitType)?.label.toLowerCase()}`
                  : "Angi pris for forhåndsvisning"}
              </ThemedText>
            </View>

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                saveMutation.mutate();
              }}
              disabled={!isValid || saveMutation.isPending}
              style={({ pressed }) => [
                styles.submitBtn,
                { 
                  backgroundColor: theme.accent, 
                  opacity: (!isValid || saveMutation.isPending) ? 0.5 : 1,
                  transform: [{ scale: pressed && isValid ? 0.98 : 1 }],
                },
              ]}
            >
              {saveMutation.isPending ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <View style={styles.submitBtnIcon}>
                    <Feather name="check" size={18} color="#FFFFFF" />
                  </View>
                  <ThemedText style={styles.submitBtnText}>
                    {isEditMode ? "Lagre endringer" : "Opprett produkt"}
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
                    <Feather name="trash-2" size={18} color="#F44336" />
                    <ThemedText style={[styles.deleteBtnText, { color: "#F44336" }]}>
                      Slett produkt
                    </ThemedText>
                  </>
                )}
              </Pressable>
            )}
          </View>
        </Animated.View>
      </KeyboardAwareScrollViewCompat>
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
  content: {
    paddingHorizontal: Spacing.lg,
  },
  formCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
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
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  rowInputs: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  unitPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  pricePreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  pricePreviewIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pricePreviewText: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  submitBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    borderRadius: BorderRadius.lg,
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
  },
  deleteBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
  },
  switchContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
  },
  switchDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  infoBox: {
    flexDirection: "row",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  infoBoxText: {
    fontSize: 14,
    lineHeight: 20,
  },
  infoBoxSubtext: {
    fontSize: 12,
    marginTop: 2,
  },
});
