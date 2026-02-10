/**
 * Vendor Adapter - Dynamic dashboard configuration based on vendor category
 * Customizes tabs, features, insights, and stats for different vendor types
 */

import { EvendiIcon, EvendiIconGlyphMap } from "@/components/EvendiIcon";

export type TabType = "deliveries" | "inspirations" | "messages" | "products" | "offers" | "reviews" | "couples";

export interface VendorTab {
  key: TabType;
  icon: keyof typeof EvendiIconGlyphMap;
  label: string;
  enabled: boolean;
  priority: number; // Lower number = higher priority (leftmost)
}

export interface VendorCategoryConfig {
  categoryId: string;
  categoryName: string;
  tabs: VendorTab[];
  features: {
    deliveries: boolean;
    inspirations: boolean;
    products: boolean;
    offers: boolean;
    couples: boolean; // Schedule/seating access
    reviews: boolean;
    messages: boolean;
  };
  insights: {
    showPendingOffers: boolean;
    showReviewRequests: boolean;
    showScheduleAccess: boolean;
    showDeliveryReminders: boolean;
  };
  quickStats: {
    showDeliveryCount: boolean;
    showShowcaseCount: boolean;
    showOfferAcceptance: boolean;
    showAverageRating: boolean;
    showUpcomingEvents: boolean; // For venues/coordinators
  };
  emptyStates: {
    deliveries: {
      title: string;
      subtitle: string;
    };
    inspirations: {
      title: string;
      subtitle: string;
    };
    products: {
      title: string;
      subtitle: string;
    };
  };
}

// Default configuration for all vendors
const DEFAULT_CONFIG: Omit<VendorCategoryConfig, "categoryId" | "categoryName"> = {
  tabs: [
    { key: "deliveries", icon: "package", label: "Leveranser", enabled: true, priority: 1 },
    { key: "inspirations", icon: "image", label: "Showcase", enabled: true, priority: 2 },
    { key: "products", icon: "shopping-bag", label: "Produkter", enabled: true, priority: 3 },
    { key: "offers", icon: "file-text", label: "Tilbud", enabled: true, priority: 4 },
    { key: "couples", icon: "users", label: "Brudepar", enabled: true, priority: 5 },
    { key: "messages", icon: "message-circle", label: "Meldinger", enabled: true, priority: 6 },
    { key: "reviews", icon: "star", label: "Anmeldelser", enabled: true, priority: 7 },
  ],
  features: {
    deliveries: true,
    inspirations: true,
    products: true,
    offers: true,
    couples: true,
    reviews: true,
    messages: true,
  },
  insights: {
    showPendingOffers: true,
    showReviewRequests: true,
    showScheduleAccess: true,
    showDeliveryReminders: true,
  },
  quickStats: {
    showDeliveryCount: true,
    showShowcaseCount: true,
    showOfferAcceptance: true,
    showAverageRating: true,
    showUpcomingEvents: false,
  },
  emptyStates: {
    deliveries: {
      title: "Ingen leveranser ennå",
      subtitle: "Opprett din første leveranse for å dele innhold med brudepar",
    },
    inspirations: {
      title: "Ingen showcases ennå",
      subtitle: "Del vakre bilder og videoer for å inspirere brudepar",
    },
    products: {
      title: "Ingen produkter ennå",
      subtitle: "Opprett produkter og tjenester for å kunne sende tilbud",
    },
  },
};

// Category-specific configurations
const CATEGORY_CONFIGS: Record<string, Partial<VendorCategoryConfig>> = {
  // Photographers & Videographers
  photographer: {
    tabs: [
      { key: "deliveries", icon: "package", label: "Leveranser", enabled: true, priority: 1 },
      { key: "inspirations", icon: "image", label: "Showcase", enabled: true, priority: 2 },
      { key: "couples", icon: "users", label: "Brudepar", enabled: true, priority: 3 },
      { key: "messages", icon: "message-circle", label: "Meldinger", enabled: true, priority: 4 },
      { key: "reviews", icon: "star", label: "Anmeldelser", enabled: true, priority: 5 },
      { key: "products", icon: "shopping-bag", label: "Pakker", enabled: true, priority: 6 },
      { key: "offers", icon: "file-text", label: "Tilbud", enabled: true, priority: 7 },
    ],
    features: {
      deliveries: true,
      inspirations: true,
      products: true,
      offers: true,
      couples: true,
      reviews: true,
      messages: true,
    },
    insights: {
      showPendingOffers: true,
      showReviewRequests: true,
      showScheduleAccess: true,
      showDeliveryReminders: true,
    },
    quickStats: {
      showDeliveryCount: true,
      showShowcaseCount: true,
      showOfferAcceptance: true,
      showAverageRating: true,
      showUpcomingEvents: false,
    },
    emptyStates: {
      deliveries: {
        title: "Ingen leveranser ennå",
        subtitle: "Last opp bilder og videoer til brudepar etter bryllupet",
      },
      inspirations: {
        title: "Ingen showcase ennå",
        subtitle: "Vis frem dine beste bryllupsbilder for å inspirere",
      },
      products: {
        title: "Ingen fotopakker ennå",
        subtitle: "Opprett fotopakker med priser for å kunne sende tilbud",
      },
    },
  },

  // Florists
  florist: {
    tabs: [
      { key: "inspirations", icon: "image", label: "Showcase", enabled: true, priority: 1 },
      { key: "products", icon: "shopping-bag", label: "Produkter", enabled: true, priority: 2 },
      { key: "offers", icon: "file-text", label: "Tilbud", enabled: true, priority: 3 },
      { key: "messages", icon: "message-circle", label: "Meldinger", enabled: true, priority: 4 },
      { key: "reviews", icon: "star", label: "Anmeldelser", enabled: true, priority: 5 },
      { key: "couples", icon: "users", label: "Brudepar", enabled: true, priority: 6 },
      { key: "deliveries", icon: "package", label: "Leveranser", enabled: false, priority: 7 },
    ],
    features: {
      deliveries: false, // Florists typically don't deliver digital content
      inspirations: true,
      products: true,
      offers: true,
      couples: true,
      reviews: true,
      messages: true,
    },
    insights: {
      showPendingOffers: true,
      showReviewRequests: true,
      showScheduleAccess: false,
      showDeliveryReminders: false,
    },
    quickStats: {
      showDeliveryCount: false,
      showShowcaseCount: true,
      showOfferAcceptance: true,
      showAverageRating: true,
      showUpcomingEvents: false,
    },
    emptyStates: {
      deliveries: {
        title: "Ikke tilgjengelig",
        subtitle: "Floristleveranser håndteres ikke digitalt",
      },
      inspirations: {
        title: "Ingen showcase ennå",
        subtitle: "Vis frem dine vakreste blomsterarrangementer",
      },
      products: {
        title: "Ingen produkter ennå",
        subtitle: "Opprett blomsterpakker (brudebukett, bordpynt, kirke)",
      },
    },
  },

  // Venues
  venue: {
    tabs: [
      { key: "inspirations", icon: "image", label: "Showcase", enabled: true, priority: 1 },
      { key: "couples", icon: "users", label: "Brudepar", enabled: true, priority: 2 },
      { key: "messages", icon: "message-circle", label: "Meldinger", enabled: true, priority: 3 },
      { key: "reviews", icon: "star", label: "Anmeldelser", enabled: true, priority: 4 },
      { key: "products", icon: "shopping-bag", label: "Pakker", enabled: true, priority: 5 },
      { key: "offers", icon: "file-text", label: "Tilbud", enabled: true, priority: 6 },
      { key: "deliveries", icon: "package", label: "Leveranser", enabled: false, priority: 7 },
    ],
    features: {
      deliveries: false,
      inspirations: true,
      products: true,
      offers: true,
      couples: true,
      reviews: true,
      messages: true,
    },
    insights: {
      showPendingOffers: true,
      showReviewRequests: true,
      showScheduleAccess: true, // Venues might need to see schedule
      showDeliveryReminders: false,
    },
    quickStats: {
      showDeliveryCount: false,
      showShowcaseCount: true,
      showOfferAcceptance: true,
      showAverageRating: true,
      showUpcomingEvents: true, // Show upcoming weddings
    },
    emptyStates: {
      deliveries: {
        title: "Ikke tilgjengelig",
        subtitle: "Lokalet håndteres ikke gjennom leveranser",
      },
      inspirations: {
        title: "Ingen showcase ennå",
        subtitle: "Vis frem lokalet med bilder og videoer",
      },
      products: {
        title: "Ingen lokalpakker ennå",
        subtitle: "Opprett pakker med forskjellige kapasiteter og priser",
      },
    },
  },

  // Caterers
  caterer: {
    tabs: [
      { key: "products", icon: "shopping-bag", label: "Menyer", enabled: true, priority: 1 },
      { key: "offers", icon: "file-text", label: "Tilbud", enabled: true, priority: 2 },
      { key: "inspirations", icon: "image", label: "Showcase", enabled: true, priority: 3 },
      { key: "messages", icon: "message-circle", label: "Meldinger", enabled: true, priority: 4 },
      { key: "reviews", icon: "star", label: "Anmeldelser", enabled: true, priority: 5 },
      { key: "couples", icon: "users", label: "Brudepar", enabled: true, priority: 6 },
      { key: "deliveries", icon: "package", label: "Leveranser", enabled: false, priority: 7 },
    ],
    features: {
      deliveries: false,
      inspirations: true,
      products: true,
      offers: true,
      couples: true,
      reviews: true,
      messages: true,
    },
    insights: {
      showPendingOffers: true,
      showReviewRequests: true,
      showScheduleAccess: false,
      showDeliveryReminders: false,
    },
    quickStats: {
      showDeliveryCount: false,
      showShowcaseCount: true,
      showOfferAcceptance: true,
      showAverageRating: true,
      showUpcomingEvents: false,
    },
    emptyStates: {
      deliveries: {
        title: "Ikke tilgjengelig",
        subtitle: "Catering håndteres ikke gjennom leveranser",
      },
      inspirations: {
        title: "Ingen showcase ennå",
        subtitle: "Vis frem dine retter og bordoppsett",
      },
      products: {
        title: "Ingen menyer ennå",
        subtitle: "Opprett menypakker og priser per gjest",
      },
    },
  },

  // Coordinators / Toastmasters
  coordinator: {
    tabs: [
      { key: "couples", icon: "users", label: "Brudepar", enabled: true, priority: 1 },
      { key: "messages", icon: "message-circle", label: "Meldinger", enabled: true, priority: 2 },
      { key: "reviews", icon: "star", label: "Anmeldelser", enabled: true, priority: 3 },
      { key: "inspirations", icon: "image", label: "Showcase", enabled: true, priority: 4 },
      { key: "products", icon: "shopping-bag", label: "Tjenester", enabled: true, priority: 5 },
      { key: "offers", icon: "file-text", label: "Tilbud", enabled: true, priority: 6 },
      { key: "deliveries", icon: "package", label: "Leveranser", enabled: false, priority: 7 },
    ],
    features: {
      deliveries: false,
      inspirations: true,
      products: true,
      offers: true,
      couples: true,
      reviews: true,
      messages: true,
    },
    insights: {
      showPendingOffers: true,
      showReviewRequests: true,
      showScheduleAccess: true, // Coordinators need schedule access
      showDeliveryReminders: false,
    },
    quickStats: {
      showDeliveryCount: false,
      showShowcaseCount: false,
      showOfferAcceptance: true,
      showAverageRating: true,
      showUpcomingEvents: true, // Show upcoming weddings they coordinate
    },
    emptyStates: {
      deliveries: {
        title: "Ikke tilgjengelig",
        subtitle: "Koordinering håndteres ikke gjennom leveranser",
      },
      inspirations: {
        title: "Ingen showcase ennå",
        subtitle: "Del tips og eksempler på bryllupskoordinering",
      },
      products: {
        title: "Ingen tjenester ennå",
        subtitle: "Opprett koordineringspakker med priser",
      },
    },
  },

  // Hair & Makeup
  "hair-makeup": {
    tabs: [
      { key: "inspirations", icon: "image", label: "Showcase", enabled: true, priority: 1 },
      { key: "products", icon: "shopping-bag", label: "Pakker", enabled: true, priority: 2 },
      { key: "offers", icon: "file-text", label: "Tilbud", enabled: true, priority: 3 },
      { key: "messages", icon: "message-circle", label: "Meldinger", enabled: true, priority: 4 },
      { key: "reviews", icon: "star", label: "Anmeldelser", enabled: true, priority: 5 },
      { key: "couples", icon: "users", label: "Brudepar", enabled: true, priority: 6 },
      { key: "deliveries", icon: "package", label: "Leveranser", enabled: false, priority: 7 },
    ],
    features: {
      deliveries: false,
      inspirations: true,
      products: true,
      offers: true,
      couples: true,
      reviews: true,
      messages: true,
    },
    insights: {
      showPendingOffers: true,
      showReviewRequests: true,
      showScheduleAccess: false,
      showDeliveryReminders: false,
    },
    quickStats: {
      showDeliveryCount: false,
      showShowcaseCount: true,
      showOfferAcceptance: true,
      showAverageRating: true,
      showUpcomingEvents: false,
    },
    emptyStates: {
      deliveries: {
        title: "Ikke tilgjengelig",
        subtitle: "Hår og makeup håndteres ikke gjennom leveranser",
      },
      inspirations: {
        title: "Ingen showcase ennå",
        subtitle: "Vis frem dine beste brude-looks",
      },
      products: {
        title: "Ingen pakker ennå",
        subtitle: "Opprett hår & makeup pakker for bryllupsdagen",
      },
    },
  },

  // Musicians / Bands
  musician: {
    tabs: [
      { key: "inspirations", icon: "image", label: "Showcase", enabled: true, priority: 1 },
      { key: "products", icon: "shopping-bag", label: "Opptredener", enabled: true, priority: 2 },
      { key: "offers", icon: "file-text", label: "Tilbud", enabled: true, priority: 3 },
      { key: "messages", icon: "message-circle", label: "Meldinger", enabled: true, priority: 4 },
      { key: "reviews", icon: "star", label: "Anmeldelser", enabled: true, priority: 5 },
      { key: "couples", icon: "users", label: "Brudepar", enabled: true, priority: 6 },
      { key: "deliveries", icon: "package", label: "Opptak", enabled: true, priority: 7 },
    ],
    features: {
      deliveries: true, // Musicians might deliver performance recordings
      inspirations: true,
      products: true,
      offers: true,
      couples: true,
      reviews: true,
      messages: true,
    },
    insights: {
      showPendingOffers: true,
      showReviewRequests: true,
      showScheduleAccess: true, // Need to know performance time
      showDeliveryReminders: true,
    },
    quickStats: {
      showDeliveryCount: true,
      showShowcaseCount: true,
      showOfferAcceptance: true,
      showAverageRating: true,
      showUpcomingEvents: false,
    },
    emptyStates: {
      deliveries: {
        title: "Ingen opptak ennå",
        subtitle: "Del lydopptak fra opptreden med brudeparet",
      },
      inspirations: {
        title: "Ingen showcase ennå",
        subtitle: "Del videoer av opptredener og repertoar",
      },
      products: {
        title: "Ingen pakker ennå",
        subtitle: "Opprett opptredenspakker (vielse, middag, dans)",
      },
    },
  },

    // Cakes
    cake: {
      tabs: [
        { key: "products", icon: "shopping-bag", label: "Kakepakker", enabled: true, priority: 1 },
        { key: "offers", icon: "file-text", label: "Tilbud", enabled: true, priority: 2 },
        { key: "inspirations", icon: "image", label: "Showcase", enabled: true, priority: 3 },
        { key: "messages", icon: "message-circle", label: "Meldinger", enabled: true, priority: 4 },
        { key: "reviews", icon: "star", label: "Anmeldelser", enabled: true, priority: 5 },
        { key: "couples", icon: "users", label: "Brudepar", enabled: true, priority: 6 },
        { key: "deliveries", icon: "package", label: "Leveranser", enabled: false, priority: 7 },
      ],
      features: {
        deliveries: false,
        inspirations: true,
        products: true,
        offers: true,
        couples: true,
        reviews: true,
        messages: true,
      },
      insights: {
        showPendingOffers: true,
        showReviewRequests: true,
        showScheduleAccess: false,
        showDeliveryReminders: false,
      },
      quickStats: {
        showDeliveryCount: false,
        showShowcaseCount: true,
        showOfferAcceptance: true,
        showAverageRating: true,
        showUpcomingEvents: false,
      },
      emptyStates: {
        deliveries: {
          title: "Ikke tilgjengelig",
          subtitle: "Kakeleveranser håndteres direkte med brudeparet",
        },
        inspirations: {
          title: "Ingen showcase ennå",
          subtitle: "Del bilder av tidligere kaker og design",
        },
        products: {
          title: "Ingen kakepakker ennå",
          subtitle: "Legg til størrelser, smaker og pris på kaker",
        },
      },
    },

    // Transport
    transport: {
      tabs: [
        { key: "products", icon: "truck", label: "Transportpakker", enabled: true, priority: 1 },
        { key: "offers", icon: "file-text", label: "Tilbud", enabled: true, priority: 2 },
        { key: "messages", icon: "message-circle", label: "Meldinger", enabled: true, priority: 3 },
        { key: "reviews", icon: "star", label: "Anmeldelser", enabled: true, priority: 4 },
        { key: "couples", icon: "users", label: "Brudepar", enabled: true, priority: 5 },
        { key: "inspirations", icon: "image", label: "Showcase", enabled: true, priority: 6 },
        { key: "deliveries", icon: "package", label: "Leveranser", enabled: false, priority: 7 },
      ],
      features: {
        deliveries: false,
        inspirations: true,
        products: true,
        offers: true,
        couples: true,
        reviews: true,
        messages: true,
      },
      insights: {
        showPendingOffers: true,
        showReviewRequests: true,
        showScheduleAccess: true, // pickup/dropoff schedule
        showDeliveryReminders: false,
      },
      quickStats: {
        showDeliveryCount: false,
        showShowcaseCount: false,
        showOfferAcceptance: true,
        showAverageRating: true,
        showUpcomingEvents: true,
      },
      emptyStates: {
        deliveries: {
          title: "Ikke tilgjengelig",
          subtitle: "Transport leveres direkte på dagen",
        },
        inspirations: {
          title: "Ingen showcase ennå",
          subtitle: "Legg ut biler/busser for visning",
        },
        products: {
          title: "Ingen transportpakker ennå",
          subtitle: "Legg til kapasitet, ruter og priser",
        },
      },
    },
};

/**
 * Get vendor configuration based on category
 */
function slugifyCategory(name: string | null | undefined): string {
  if (!name) return "default";
  const lowered = name
    .toLowerCase()
    .replace(/å/g, "a")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return lowered || "default";
}

function resolveCategoryKey(normalized: string): string {
  const aliases: Record<string, string> = {
    catering: "caterer",
    caterer: "caterer",
    blomster: "florist",
    florist: "florist",
    musikk: "musician",
    musician: "musician",
    venue: "venue",
    planner: "coordinator",
    planlegger: "coordinator",
    coordinator: "coordinator",
    "hair-makeup": "hair-makeup",
    "haar-makeup": "hair-makeup",
    "haar-og-makeup": "hair-makeup",
    "haar-make-up": "hair-makeup",
    "har-makeup": "hair-makeup",
    "h%25r-makeup": "hair-makeup",
    "transport": "transport",
    "kake": "cake",
    "cake": "cake",
    "videograf": "photographer", // fallback to photographer behavior
    "fotograf": "photographer",
  };
  return aliases[normalized] || normalized || "default";
}

export function getVendorConfig(
  categoryId: string | null,
  categoryName: string | null
): VendorCategoryConfig {
  const normalized = slugifyCategory(categoryName);
  const key = resolveCategoryKey(normalized);
  const categoryConfig = CATEGORY_CONFIGS[key] || {};
  
  return {
    categoryId: categoryId || "default",
    categoryName: categoryName || "Generell",
    ...DEFAULT_CONFIG,
    ...categoryConfig,
    tabs: categoryConfig.tabs || DEFAULT_CONFIG.tabs,
    features: { ...DEFAULT_CONFIG.features, ...categoryConfig.features },
    insights: { ...DEFAULT_CONFIG.insights, ...categoryConfig.insights },
    quickStats: { ...DEFAULT_CONFIG.quickStats, ...categoryConfig.quickStats },
    emptyStates: { ...DEFAULT_CONFIG.emptyStates, ...categoryConfig.emptyStates },
  };
}

/**
 * Get enabled tabs sorted by priority
 */
export function getEnabledTabs(config: VendorCategoryConfig): VendorTab[] {
  return config.tabs
    .filter(tab => tab.enabled)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Check if a feature is enabled for this vendor category
 */
export function isFeatureEnabled(
  config: VendorCategoryConfig,
  feature: keyof VendorCategoryConfig["features"]
): boolean {
  return config.features[feature];
}

/**
 * Get custom empty state for a tab
 */
export function getEmptyState(
  config: VendorCategoryConfig,
  tab: keyof VendorCategoryConfig["emptyStates"]
): { title: string; subtitle: string } {
  return config.emptyStates[tab];
}
