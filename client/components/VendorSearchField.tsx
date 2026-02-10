/**
 * VendorSearchField – Drop-in vendor search for any couple-facing screen.
 *
 * Bundles useVendorSearch + VendorSuggestions + VendorActionBar into ONE component.
 * Future screens only need to import this single component:
 *
 * ```tsx
 * import { VendorSearchField } from '@/components/VendorSearchField';
 *
 * <VendorSearchField
 *   category="florist"
 *   icon="sun"
 *   label="Florist"
 *   placeholder="Søk etter registrert florist..."
 * />
 * ```
 *
 * For form modals where you also need the selected name as local state:
 *
 * ```tsx
 * <VendorSearchField
 *   category="bakery"
 *   icon="gift"
 *   label="Bakeri navn *"
 *   placeholder="Søk etter registrert bakeri..."
 *   onNameChange={(name) => setBakeryName(name)}
 *   externalValue={bakeryName}
 * />
 * ```
 */
import React, { useEffect, useMemo } from "react";
import { View, TextInput, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { EvendiIcon, type EvendiIconName } from "@/components/EvendiIcon";

import { ThemedText } from "@/components/ThemedText";
import { VendorSuggestions } from "@/components/VendorSuggestions";
import { VendorActionBar } from "@/components/VendorActionBar";
import { useVendorSearch, VendorSuggestion } from "@/hooks/useVendorSearch";
import { useVendorLocationIntelligence } from "@/hooks/useVendorLocationIntelligence";
import { useTheme } from "@/hooks/useTheme";
import { Spacing } from "@/constants/theme";
import { PlanningStackParamList } from "@/navigation/PlanningStackNavigator";

type NavigationProp = NativeStackNavigationProp<PlanningStackParamList>;

export interface VendorSearchFieldProps {
  /** Vendor category slug (e.g., "florist", "catering", "beauty", "photographer") */
  category: string;
  /** Evendi icon name for this category */
  icon?: EvendiIconName;
  /** Label above the search input */
  label?: string;
  /** Placeholder text in the search input */
  placeholder?: string;
  /**
   * Called whenever the displayed vendor name changes (typing or selection).
   * Useful for syncing with form state in modal screens.
   */
  onNameChange?: (name: string) => void;
  /**
   * External controlled value for the text input.
   * When provided, the component uses this OR the internal search text, whichever is non-empty.
   */
  externalValue?: string;
  /**
   * Called when a vendor is selected from suggestions.
   * The VendorActionBar is shown automatically; this is for extra side-effects.
   */
  onSelect?: (vendor: VendorSuggestion) => void;
  /**
   * Called when user clears the selection.
   */
  onClear?: () => void;
  /** Override the input style */
  inputStyle?: object;
}

/**
 * All-in-one vendor search field.
 * Renders: label → TextInput → VendorActionBar (when selected) → VendorSuggestions dropdown.
 */
export function VendorSearchField({
  category,
  icon = "briefcase",
  label,
  placeholder = "Søk etter leverandør...",
  onNameChange,
  externalValue,
  onSelect: onSelectProp,
  onClear: onClearProp,
  inputStyle,
}: VendorSearchFieldProps) {
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const vendorSearch = useVendorSearch({ category });
  const locationIntel = useVendorLocationIntelligence();

  const displayValue = externalValue ?? vendorSearch.searchText;

  // Calculate travel for suggestions when they change and venue is available
  useEffect(() => {
    if (vendorSearch.suggestions.length > 0 && locationIntel.venueCoordinates) {
      const vendors = vendorSearch.suggestions.map(s => ({
        id: s.id,
        businessName: s.businessName,
        location: s.location,
      }));
      locationIntel.calculateBatchTravel(vendors);
    }
  }, [vendorSearch.suggestions, locationIntel.venueCoordinates]);

  // Calculate travel for selected vendor
  useEffect(() => {
    if (vendorSearch.selectedVendor && locationIntel.venueCoordinates) {
      locationIntel.calculateVendorTravel({
        id: vendorSearch.selectedVendor.id,
        businessName: vendorSearch.selectedVendor.businessName,
        location: vendorSearch.selectedVendor.location,
      });
    }
  }, [vendorSearch.selectedVendor, locationIntel.venueCoordinates]);

  // Build travel badges map for suggestions
  const travelBadges = useMemo(() => {
    const badges: Record<string, string | null> = {};
    for (const s of vendorSearch.suggestions) {
      badges[s.id] = locationIntel.getTravelBadge(s.id);
    }
    return badges;
  }, [vendorSearch.suggestions, locationIntel.vendorTravelMap]);

  const handleChangeText = (text: string) => {
    vendorSearch.onChangeText(text);
    onNameChange?.(text);
  };

  const handleSelect = (vendor: VendorSuggestion) => {
    vendorSearch.onSelectVendor(vendor);
    onNameChange?.(vendor.businessName);
    onSelectProp?.(vendor);
  };

  const handleClear = () => {
    vendorSearch.clearSelection();
    onNameChange?.("");
    onClearProp?.();
  };

  const handleViewProfile = (vendor: VendorSuggestion) => {
    navigation.navigate("VendorDetail", {
      vendorId: vendor.id,
      vendorName: vendor.businessName,
      vendorDescription: vendor.description || "",
      vendorLocation: vendor.location || "",
      vendorPriceRange: vendor.priceRange || "",
      vendorCategory: category,
    });
  };

  const handleNavigateToVendor = (vendor: VendorSuggestion) => {
    locationIntel.openDirections({
      id: vendor.id,
      businessName: vendor.businessName,
      location: vendor.location,
    });
  };

  const handleAddToTimeline = () => {
    if (!vendorSearch.selectedVendor) return;
    const travel = locationIntel.getVendorTravel(vendorSearch.selectedVendor.id);
    const badge = locationIntel.getTravelBadge(vendorSearch.selectedVendor.id);
    Alert.alert(
      "Lagt til i tidslinje",
      `Reisetid til ${vendorSearch.selectedVendor.businessName}${badge ? ` (${badge})` : ''} er lagt til i bryllupstidslinjen din.`,
      [{ text: "OK" }]
    );
  };

  // Get travel data for the selected vendor
  const selectedTravel = vendorSearch.selectedVendor
    ? locationIntel.getVendorTravel(vendorSearch.selectedVendor.id)
    : null;

  return (
    <View>
      {label && (
        <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
          {label}
        </ThemedText>
      )}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: theme.backgroundDefault,
            borderColor: theme.border,
            color: theme.text,
          },
          inputStyle,
        ]}
        value={displayValue}
        onChangeText={handleChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.textSecondary}
      />
      {vendorSearch.selectedVendor && (
        <VendorActionBar
          vendor={vendorSearch.selectedVendor}
          vendorCategory={category}
          onClear={handleClear}
          icon={icon}
          travelBadge={locationIntel.getTravelBadge(vendorSearch.selectedVendor.id)}
          isTravelLoading={selectedTravel?.isLoading}
          onGetDirections={() =>
            locationIntel.openDirections({
              id: vendorSearch.selectedVendor!.id,
              businessName: vendorSearch.selectedVendor!.businessName,
              location: vendorSearch.selectedVendor!.location,
            })
          }
          onShowOnMap={() =>
            locationIntel.openVendorOnMap({
              id: vendorSearch.selectedVendor!.id,
              businessName: vendorSearch.selectedVendor!.businessName,
              location: vendorSearch.selectedVendor!.location,
            })
          }
          onAddToTimeline={handleAddToTimeline}
          venueName={locationIntel.venueName}
          fuelCostNok={selectedTravel?.travel?.fuelCostNok}
        />
      )}
      <VendorSuggestions
        suggestions={vendorSearch.suggestions}
        isLoading={vendorSearch.isLoading}
        onSelect={handleSelect}
        onViewProfile={handleViewProfile}
        icon={icon}
        travelBadges={travelBadges}
        travelInfoMap={locationIntel.vendorTravelMap}
        onNavigate={handleNavigateToVendor}
        venueName={locationIntel.venueName}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: Spacing.xs,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    fontSize: 15,
  },
});
