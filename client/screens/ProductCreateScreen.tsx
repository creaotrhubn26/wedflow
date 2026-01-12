import React, { useState } from "react";
import {
  StyleSheet,
  View,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeInDown } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { Button } from "@/components/Button";
import { KeyboardAwareScrollViewCompat } from "@/components/KeyboardAwareScrollViewCompat";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

const VENDOR_STORAGE_KEY = "wedflow_vendor_session";

const UNIT_TYPES = [
  { value: "stk", label: "Stykk" },
  { value: "time", label: "Time" },
  { value: "dag", label: "Dag" },
  { value: "pakke", label: "Pakke" },
  { value: "m2", label: "m\u00B2" },
];

interface Props {
  navigation: NativeStackNavigationProp<any>;
}

export default function ProductCreateScreen({ navigation }: Props) {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [unitType, setUnitType] = useState("stk");
  const [leadTimeDays, setLeadTimeDays] = useState("");
  const [minQuantity, setMinQuantity] = useState("1");
  const [categoryTag, setCategoryTag] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => {
      const sessionData = await AsyncStorage.getItem(VENDOR_STORAGE_KEY);
      if (!sessionData) throw new Error("Ikke innlogget");
      const session = JSON.parse(sessionData);

      const priceInOre = Math.round(parseFloat(unitPrice) * 100);

      const response = await fetch(new URL("/api/vendor/products", getApiUrl()).toString(), {
        method: "POST",
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
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Kunne ikke opprette produkt");
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

  const isValid = title.trim().length >= 2 && parseFloat(unitPrice) >= 0;

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
            <ThemedText style={styles.formTitle}>Produktinformasjon</ThemedText>

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
                      onPress={() => setUnitType(unit.value)}
                      style={[
                        styles.unitOption,
                        { 
                          backgroundColor: unitType === unit.value ? Colors.dark.accent : theme.backgroundRoot,
                          borderColor: unitType === unit.value ? Colors.dark.accent : theme.border,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.unitOptionText,
                          { color: unitType === unit.value ? "#1A1A1A" : theme.textMuted },
                        ]}
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

            <View style={styles.pricePreview}>
              <Feather name="tag" size={20} color={Colors.dark.accent} />
              <ThemedText style={styles.pricePreviewText}>
                {parseFloat(unitPrice) > 0
                  ? `${parseFloat(unitPrice).toLocaleString("nb-NO")} kr / ${UNIT_TYPES.find(u => u.value === unitType)?.label.toLowerCase()}`
                  : "Angi pris for forhåndsvisning"}
              </ThemedText>
            </View>

            <Button
              onPress={() => createMutation.mutate()}
              disabled={!isValid || createMutation.isPending}
              style={styles.submitButton}
            >
              {createMutation.isPending ? "Oppretter..." : "Opprett produkt"}
            </Button>
          </View>
        </Animated.View>
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
  rowInputs: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  unitPicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  unitOption: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },
  unitOptionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  pricePreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.dark.accent + "15",
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  pricePreviewText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.dark.accent,
  },
  submitButton: {
    marginTop: Spacing.sm,
  },
});
