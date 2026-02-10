/**
 * VENDOR INTEGRATION REGISTRY
 * ============================
 * Single source of truth for every screen that should have vendor search.
 *
 * HOW TO USE:
 * -----------
 * When you create a NEW couple-facing category screen:
 *
 * 1. Add it to COUPLE_VENDOR_SCREENS below.
 *
 * 2. Import VendorSearchField in your screen:
 *    ```tsx
 *    import { VendorSearchField } from '@/components/VendorSearchField';
 *    ```
 *
 * 3a. FOR "FORM MODAL" SCREENS (screen has a Modal with a vendor/name TextInput):
 *     Replace the TextInput with:
 *     ```tsx
 *     <VendorSearchField
 *       category="your-category"
 *       icon="icon-name"
 *       label="Leverandør *"
 *       placeholder="Søk etter registrert leverandør..."
 *       externalValue={vendorName}
 *       onNameChange={setVendorName}
 *     />
 *     ```
 *
 * 3b. FOR "EMPTY STATE" SCREENS (screen shows an empty state with "Finn X" button):
 *     Add above the Button:
 *     ```tsx
 *     <View style={{ width: '100%', marginTop: Spacing.md }}>
 *       <VendorSearchField
 *         category="your-category"
 *         icon="icon-name"
 *         label="Søk etter leverandør"
 *         placeholder="Søk etter registrert leverandør..."
 *       />
 *     </View>
 *     ```
 *
 * 4. That's it! VendorSearchField handles the hook, suggestions dropdown,
 *    action bar, profile navigation, and chat initiation automatically.
 *
 *
 * VENDOR-FACING SCREENS:
 * ----------------------
 * Vendor screens do NOT use VendorSearchField (vendors don't search for
 * other vendors). They are listed here for completeness and to track
 * which vendor categories exist in the system.
 */

import { type EvendiIconName } from "@/components/EvendiIcon";

// ─── Couple-facing screens that MUST have VendorSearchField ─────────────────

export interface CoupleVendorScreen {
  /** Screen file name (without path) */
  screen: string;
  /** Vendor category slug passed to useVendorSearch / VendorSearchField */
  category: string;
  /** Evendi icon name */
  icon: EvendiIconName;
  /** Human label (Norwegian) */
  label: string;
  /** "form-modal" = TextInput inside a Modal  |  "inline" = search in page body */
  pattern: "form-modal" | "inline";
  /** Set to true once wired. CI can assert all are true. */
  wired: boolean;
}

export const COUPLE_VENDOR_SCREENS: CoupleVendorScreen[] = [
  // ── FORM MODAL pattern ──────────────────────────────────────────
  { screen: "BlomsterScreen.tsx",       category: "florist",      icon: "sun",       label: "Blomster",          pattern: "form-modal", wired: true },
  { screen: "BrudekjoleScreen.tsx",     category: "bridal",       icon: "heart",     label: "Brudekjole",        pattern: "form-modal", wired: true },
  { screen: "HaarMakeupScreen.tsx",     category: "beauty",       icon: "scissors",  label: "Hår & Makeup",      pattern: "form-modal", wired: true },
  { screen: "CateringScreen.tsx",       category: "catering",     icon: "coffee",    label: "Catering",          pattern: "form-modal", wired: true },
  { screen: "TransportScreen.tsx",      category: "transport",    icon: "truck",     label: "Transport",         pattern: "form-modal", wired: true },
  { screen: "PlanleggerScreen.tsx",     category: "planner",      icon: "clipboard", label: "Bryllupsplanlegger",pattern: "form-modal", wired: true },
  { screen: "KakeScreen.tsx",          category: "bakery",       icon: "gift",      label: "Kake",              pattern: "form-modal", wired: true },
  { screen: "VenueScreen.tsx",         category: "venue",        icon: "home",      label: "Lokale",            pattern: "form-modal", wired: true },

  // ── INLINE (empty state) pattern ────────────────────────────────
  { screen: "FotografScreen.tsx",       category: "photographer", icon: "camera",    label: "Fotograf",          pattern: "inline",     wired: true },
  { screen: "FotoVideografScreen.tsx",  category: "photo-video",  icon: "camera",    label: "Foto & Video",      pattern: "inline",     wired: true },
  { screen: "MusikkScreen.tsx",        category: "music",        icon: "music",     label: "Musikk & DJ",       pattern: "inline",     wired: true },
  { screen: "VideografScreen.tsx",     category: "videographer", icon: "video",     label: "Videograf",         pattern: "inline",     wired: true },
];

// ─── Vendor-facing category screens (for reference) ────────────────────────

export interface VendorCategoryScreen {
  screen: string;
  category: string;
  label: string;
}

export const VENDOR_CATEGORY_SCREENS: VendorCategoryScreen[] = [
  { screen: "VendorBlomsterScreen.tsx",       category: "florist",      label: "Blomster" },
  { screen: "VendorCateringScreen.tsx",       category: "catering",     label: "Catering" },
  { screen: "VendorFotografScreen.tsx",       category: "photographer", label: "Fotograf" },
  { screen: "VendorFotoVideografScreen.tsx",  category: "photo-video",  label: "Foto & Video" },
  { screen: "VendorHaarMakeupScreen.tsx",     category: "beauty",       label: "Hår & Makeup" },
  { screen: "VendorKakeScreen.tsx",           category: "bakery",       label: "Kake" },
  { screen: "VendorMusikkScreen.tsx",         category: "music",        label: "Musikk" },
  { screen: "VendorPlanleggerScreen.tsx",     category: "planner",      label: "Planlegger" },
  { screen: "VendorTransportScreen.tsx",      category: "transport",    label: "Transport" },
  { screen: "VendorVenueScreen.tsx",          category: "venue",        label: "Lokale" },
  { screen: "VendorVideografScreen.tsx",      category: "videographer", label: "Videograf" },
];

/**
 * Helper: returns all couple screens that are NOT yet wired.
 * Use in dev/CI to catch missing integrations.
 */
export function getUnwiredScreens(): CoupleVendorScreen[] {
  return COUPLE_VENDOR_SCREENS.filter((s) => !s.wired);
}
