// Category-specific fields for vendor products
import React from "react";
import { View, TextInput, Switch, Pressable, StyleSheet } from "react-native";
import { EvendiIcon } from "@/components/EvendiIcon";
import * as Haptics from "expo-haptics";
import { ThemedText } from "@/components/ThemedText";
import { Spacing, BorderRadius } from "@/constants/theme";

export interface CategoryFieldsProps {
  metadata: any;
  setMetadata: (metadata: any) => void;
  theme: any;
}

const CUISINE_TYPES = [
  { key: "norwegian", label: "Norsk" },
  { key: "indian", label: "Indisk" },
  { key: "pakistani", label: "Pakistansk" },
  { key: "middle-eastern", label: "Midtøsten" },
  { key: "mediterranean", label: "Middelhavet" },
  { key: "asian", label: "Asiatisk" },
  { key: "italian", label: "Italiensk" },
  { key: "mixed", label: "Blandet" },
];

const CAKE_STYLES = [
  { key: "traditional", label: "Tradisjonell" },
  { key: "naked", label: "Naked Cake" },
  { key: "drip", label: "Drip Cake" },
  { key: "fondant", label: "Fondant" },
  { key: "buttercream", label: "Smørkrem" },
  { key: "cupcakes", label: "Cupcakes" },
];

const FLOWER_TYPES = [
  { key: "bouquet", label: "Brudebukett" },
  { key: "boutonniere", label: "Knapphullsblomst" },
  { key: "centerpiece", label: "Borddekorasjon" },
  { key: "ceremony", label: "Seremoni" },
  { key: "arch", label: "Bue/Portal" },
];

const VEHICLE_TYPES = [
  { key: "limousine", label: "Limousin" },
  { key: "vintage", label: "Veteranbil" },
  { key: "bus", label: "Buss" },
  { key: "van", label: "Minibuss" },
  { key: "luxury", label: "Luksusbil" },
];

const SERVICE_TYPES = [
  { key: "hair", label: "Hår" },
  { key: "makeup", label: "Sminke" },
  { key: "both", label: "Begge" },
];

export function CateringFields({ metadata, setMetadata, theme }: CategoryFieldsProps) {
  return (
    <View>
      <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
        <View style={styles.switchContent}>
          <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Tilbyr smaksprøver</ThemedText>
          <ThemedText style={[styles.switchDescription, { color: theme.textMuted }]}>
            Lar par smake på menyen før valg
          </ThemedText>
        </View>
        <Switch
          value={metadata.offersTasteSample || false}
          onValueChange={(value) => {
            setMetadata({ ...metadata, offersTasteSample: value });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Kjøkkentype</ThemedText>
        <View style={styles.chipContainer}>
          {CUISINE_TYPES.map((cuisine) => (
            <Pressable
              key={cuisine.key}
              onPress={() => {
                setMetadata({ ...metadata, cuisineType: cuisine.key });
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.chip,
                {
                  backgroundColor: metadata.cuisineType === cuisine.key ? theme.accent : theme.backgroundRoot,
                  borderColor: theme.border,
                  borderWidth: metadata.cuisineType === cuisine.key ? 0 : 1,
                },
              ]}
            >
              <ThemedText style={[{ fontSize: 13, fontWeight: "600", color: metadata.cuisineType === cuisine.key ? "#FFFFFF" : theme.textMuted }]}>
                {cuisine.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Antall porsjoner</ThemedText>
          <TextInput
            style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
            placeholder="F.eks. 10"
            placeholderTextColor={theme.textMuted}
            value={metadata.servesCount ? String(metadata.servesCount) : ""}
            onChangeText={(text) => setMetadata({ ...metadata, servesCount: text ? parseInt(text) : undefined })}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={{ marginTop: Spacing.sm }}>
        <ThemedText style={[styles.inputLabel, { color: theme.textMuted, marginBottom: Spacing.xs }]}>Kosthold</ThemedText>
        {["isVegetarian", "isVegan", "isGlutenFree", "isDairyFree"].map((key) => {
          const labels: Record<string, string> = {
            isVegetarian: "Vegetar",
            isVegan: "Vegan",
            isGlutenFree: "Glutenfri",
            isDairyFree: "Laktosefri",
          };
          return (
            <View key={key} style={[styles.checkboxRow, { borderBottomColor: theme.border }]}>
              <ThemedText style={[styles.checkboxLabel, { color: theme.text }]}>{labels[key]}</ThemedText>
              <Switch
                value={metadata[key] || false}
                onValueChange={(value) => {
                  setMetadata({ ...metadata, [key]: value });
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                trackColor={{ false: theme.border, true: theme.accent }}
                thumbColor="#FFFFFF"
              />
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function CakeFields({ metadata, setMetadata, theme }: CategoryFieldsProps) {
  return (
    <View>
      <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
        <View style={styles.switchContent}>
          <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Tilbyr smaksprøver</ThemedText>
        </View>
        <Switch
          value={metadata.offersTasteSample || false}
          onValueChange={(value) => {
            setMetadata({ ...metadata, offersTasteSample: value });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor="#FFFFFF"
        />
      </View>

      <View style={styles.inputGroup}>
        <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Kakestil</ThemedText>
        <View style={styles.chipContainer}>
          {CAKE_STYLES.map((style) => (
            <Pressable
              key={style.key}
              onPress={() => {
                setMetadata({ ...metadata, cakeStyle: style.key });
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.chip,
                {
                  backgroundColor: metadata.cakeStyle === style.key ? theme.accent : theme.backgroundRoot,
                  borderColor: theme.border,
                  borderWidth: metadata.cakeStyle === style.key ? 0 : 1,
                },
              ]}
            >
              <ThemedText style={[{ fontSize: 13, fontWeight: "600", color: metadata.cakeStyle === style.key ? "#FFFFFF" : theme.textMuted }]}>
                {style.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Porsjoner</ThemedText>
          <TextInput
            style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
            placeholder="50"
            placeholderTextColor={theme.textMuted}
            value={metadata.servings ? String(metadata.servings) : ""}
            onChangeText={(text) => setMetadata({ ...metadata, servings: text ? parseInt(text) : undefined })}
            keyboardType="numeric"
          />
        </View>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Etasjer</ThemedText>
          <TextInput
            style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
            placeholder="3"
            placeholderTextColor={theme.textMuted}
            value={metadata.tiers ? String(metadata.tiers) : ""}
            onChangeText={(text) => setMetadata({ ...metadata, tiers: text ? parseInt(text) : undefined })}
            keyboardType="numeric"
          />
        </View>
      </View>
    </View>
  );
}

export function FlowerFields({ metadata, setMetadata, theme }: CategoryFieldsProps) {
  return (
    <View>
      <View style={styles.inputGroup}>
        <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Type blomsterarrangement</ThemedText>
        <View style={styles.chipContainer}>
          {FLOWER_TYPES.map((type) => (
            <Pressable
              key={type.key}
              onPress={() => {
                setMetadata({ ...metadata, itemType: type.key });
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.chip,
                {
                  backgroundColor: metadata.itemType === type.key ? theme.accent : theme.backgroundRoot,
                  borderColor: theme.border,
                  borderWidth: metadata.itemType === type.key ? 0 : 1,
                },
              ]}
            >
              <ThemedText style={[{ fontSize: 13, fontWeight: "600", color: metadata.itemType === type.key ? "#FFFFFF" : theme.textMuted }]}>
                {type.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
        <View style={styles.switchContent}>
          <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Kun sesongbasert</ThemedText>
        </View>
        <Switch
          value={metadata.isSeasonalOnly || false}
          onValueChange={(value) => {
            setMetadata({ ...metadata, isSeasonalOnly: value });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
}

export function TransportFields({ metadata, setMetadata, theme }: CategoryFieldsProps) {
  return (
    <View>
      <View style={styles.inputGroup}>
        <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Kjøretøytype</ThemedText>
        <View style={styles.chipContainer}>
          {VEHICLE_TYPES.map((type) => (
            <Pressable
              key={type.key}
              onPress={() => {
                setMetadata({ ...metadata, vehicleType: type.key });
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.chip,
                {
                  backgroundColor: metadata.vehicleType === type.key ? theme.accent : theme.backgroundRoot,
                  borderColor: theme.border,
                  borderWidth: metadata.vehicleType === type.key ? 0 : 1,
                },
              ]}
            >
              <ThemedText style={[{ fontSize: 13, fontWeight: "600", color: metadata.vehicleType === type.key ? "#FFFFFF" : theme.textMuted }]}>
                {type.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Passasjerkapasitet</ThemedText>
          <TextInput
            style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
            placeholder="4"
            placeholderTextColor={theme.textMuted}
            value={metadata.passengerCapacity ? String(metadata.passengerCapacity) : ""}
            onChangeText={(text) => setMetadata({ ...metadata, passengerCapacity: text ? parseInt(text) : undefined })}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
        <View style={styles.switchContent}>
          <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Inkluderer sjåfør</ThemedText>
        </View>
        <Switch
          value={metadata.includesDriver || false}
          onValueChange={(value) => {
            setMetadata({ ...metadata, includesDriver: value });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
}

export function HairMakeupFields({ metadata, setMetadata, theme }: CategoryFieldsProps) {
  return (
    <View>
      <View style={styles.inputGroup}>
        <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Tjenestetype</ThemedText>
        <View style={styles.chipContainer}>
          {SERVICE_TYPES.map((type) => (
            <Pressable
              key={type.key}
              onPress={() => {
                setMetadata({ ...metadata, serviceType: type.key });
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
              style={[
                styles.chip,
                {
                  backgroundColor: metadata.serviceType === type.key ? theme.accent : theme.backgroundRoot,
                  borderColor: theme.border,
                  borderWidth: metadata.serviceType === type.key ? 0 : 1,
                },
              ]}
            >
              <ThemedText style={[{ fontSize: 13, fontWeight: "600", color: metadata.serviceType === type.key ? "#FFFFFF" : theme.textMuted }]}>
                {type.label}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
          <ThemedText style={[styles.inputLabel, { color: theme.textMuted }]}>Varighet (timer)</ThemedText>
          <TextInput
            style={[styles.textInput, { backgroundColor: theme.backgroundRoot, color: theme.text, borderColor: theme.border }]}
            placeholder="2"
            placeholderTextColor={theme.textMuted}
            value={metadata.durationHours ? String(metadata.durationHours) : ""}
            onChangeText={(text) => setMetadata({ ...metadata, durationHours: text ? parseInt(text) : undefined })}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={[styles.switchRow, { borderBottomColor: theme.border }]}>
        <View style={styles.switchContent}>
          <ThemedText style={[styles.switchLabel, { color: theme.text }]}>Inkluderer prøvetime</ThemedText>
        </View>
        <Switch
          value={metadata.includesTrialSession || false}
          onValueChange={(value) => {
            setMetadata({ ...metadata, includesTrialSession: value });
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }}
          trackColor={{ false: theme.border, true: theme.accent }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  rowInputs: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
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
  checkboxRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  checkboxLabel: {
    fontSize: 14,
  },
});
