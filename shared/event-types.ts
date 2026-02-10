/**
 * Event Type System — Multi-event platform configuration
 * 
 * Defines all supported event types, their categories (B2C/B2B),
 * applicable vendor categories, visible features, and role labels.
 */

// ─── Event Type Enum ────────────────────────────────────────────
export const EVENT_TYPES = [
  "wedding",
  "confirmation",
  "birthday",
  "anniversary",
  "engagement",
  "baby_shower",
  "corporate_event",
  "conference",
  "seminar",
  "team_building",
  "product_launch",
  "gala",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

// ─── Event Category (B2C vs B2B) ────────────────────────────────
export const EVENT_CATEGORIES = ["personal", "corporate"] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

// ─── Event Type Metadata ────────────────────────────────────────
export interface EventTypeConfig {
  type: EventType;
  category: EventCategory;
  labelNo: string;       // Norwegian label
  labelEn: string;       // English label
  icon: string;          // Emoji icon for picker
  descriptionNo: string; // Norwegian description
  descriptionEn: string; // English description
  /** Which wedding-only features to show */
  features: {
    traditions: boolean;
    dressTracking: boolean;
    weddingPartyRoles: boolean;
    speeches: boolean;
    photoplan: boolean;
    seating: boolean;
    coupleProfile: boolean;
    importantPeople: boolean;
    sharePartner: boolean;
  };
  /** Role labels for "important people" */
  roleLabels: {
    primary: { no: string; en: string };     // "Brud" / "Konfirmant" / "Jubilant" / "Arrangør"
    secondary: { no: string; en: string };   // "Brudgom" / "Fadder" / "Partner" / "Medarrangør"
    guestLabel: { no: string; en: string };  // "Gjester" / "Deltakere" / "Inviterte"
  };
  /** Date field label */
  dateLabel: { no: string; en: string };     // "Bryllupsdato" / "Konfirmasjonsdato" / "Arrangementsdato"
}

export const EVENT_TYPE_CONFIGS: Record<EventType, EventTypeConfig> = {
  // ─── B2C: Life Events ───────────────────────────────────────
  wedding: {
    type: "wedding",
    category: "personal",
    labelNo: "Bryllup",
    labelEn: "Wedding",
    icon: "💒",
    descriptionNo: "Planlegg bryllupet med alle verktøy",
    descriptionEn: "Plan your wedding with all the tools",
    features: {
      traditions: true,
      dressTracking: true,
      weddingPartyRoles: true,
      speeches: true,
      photoplan: true,
      seating: true,
      coupleProfile: true,
      importantPeople: true,
      sharePartner: true,
    },
    roleLabels: {
      primary: { no: "Brud", en: "Bride" },
      secondary: { no: "Brudgom", en: "Groom" },
      guestLabel: { no: "Gjester", en: "Guests" },
    },
    dateLabel: { no: "Bryllupsdato", en: "Wedding Date" },
  },

  confirmation: {
    type: "confirmation",
    category: "personal",
    labelNo: "Konfirmasjon",
    labelEn: "Confirmation",
    icon: "⛪",
    descriptionNo: "Planlegg konfirmasjonen steg for steg",
    descriptionEn: "Plan the confirmation step by step",
    features: {
      traditions: false,
      dressTracking: false,
      weddingPartyRoles: false,
      speeches: true,
      photoplan: true,
      seating: true,
      coupleProfile: false,
      importantPeople: true,
      sharePartner: false,
    },
    roleLabels: {
      primary: { no: "Konfirmant", en: "Confirmand" },
      secondary: { no: "Forelder", en: "Parent" },
      guestLabel: { no: "Gjester", en: "Guests" },
    },
    dateLabel: { no: "Konfirmasjonsdato", en: "Confirmation Date" },
  },

  birthday: {
    type: "birthday",
    category: "personal",
    labelNo: "Bursdag",
    labelEn: "Birthday",
    icon: "🎂",
    descriptionNo: "Planlegg bursdagsfeiringen",
    descriptionEn: "Plan the birthday celebration",
    features: {
      traditions: false,
      dressTracking: false,
      weddingPartyRoles: false,
      speeches: true,
      photoplan: true,
      seating: true,
      coupleProfile: false,
      importantPeople: true,
      sharePartner: false,
    },
    roleLabels: {
      primary: { no: "Jubilant", en: "Birthday Person" },
      secondary: { no: "Medarrangør", en: "Co-organizer" },
      guestLabel: { no: "Gjester", en: "Guests" },
    },
    dateLabel: { no: "Bursdagsdato", en: "Birthday Date" },
  },

  anniversary: {
    type: "anniversary",
    category: "personal",
    labelNo: "Jubileum",
    labelEn: "Anniversary",
    icon: "💍",
    descriptionNo: "Feir jubileet med stil",
    descriptionEn: "Celebrate the anniversary in style",
    features: {
      traditions: false,
      dressTracking: false,
      weddingPartyRoles: false,
      speeches: true,
      photoplan: true,
      seating: true,
      coupleProfile: true,
      importantPeople: true,
      sharePartner: true,
    },
    roleLabels: {
      primary: { no: "Vert", en: "Host" },
      secondary: { no: "Medvert", en: "Co-host" },
      guestLabel: { no: "Gjester", en: "Guests" },
    },
    dateLabel: { no: "Jubileumsdato", en: "Anniversary Date" },
  },

  engagement: {
    type: "engagement",
    category: "personal",
    labelNo: "Forlovelse",
    labelEn: "Engagement Party",
    icon: "💎",
    descriptionNo: "Planlegg forlovelsesfesten",
    descriptionEn: "Plan the engagement party",
    features: {
      traditions: false,
      dressTracking: false,
      weddingPartyRoles: false,
      speeches: true,
      photoplan: true,
      seating: true,
      coupleProfile: true,
      importantPeople: true,
      sharePartner: true,
    },
    roleLabels: {
      primary: { no: "Forlovet", en: "Fiancée" },
      secondary: { no: "Forlovet", en: "Fiancé" },
      guestLabel: { no: "Gjester", en: "Guests" },
    },
    dateLabel: { no: "Festdato", en: "Party Date" },
  },

  baby_shower: {
    type: "baby_shower",
    category: "personal",
    labelNo: "Babyshower / Dåp",
    labelEn: "Baby Shower / Baptism",
    icon: "👶",
    descriptionNo: "Planlegg babyshower eller dåp",
    descriptionEn: "Plan the baby shower or baptism",
    features: {
      traditions: false,
      dressTracking: false,
      weddingPartyRoles: false,
      speeches: true,
      photoplan: true,
      seating: true,
      coupleProfile: false,
      importantPeople: true,
      sharePartner: false,
    },
    roleLabels: {
      primary: { no: "Arrangør", en: "Host" },
      secondary: { no: "Medarrangør", en: "Co-host" },
      guestLabel: { no: "Gjester", en: "Guests" },
    },
    dateLabel: { no: "Dato", en: "Date" },
  },

  // ─── B2B: Corporate Events ─────────────────────────────────
  corporate_event: {
    type: "corporate_event",
    category: "corporate",
    labelNo: "Firmafest",
    labelEn: "Corporate Event",
    icon: "🏢",
    descriptionNo: "Planlegg firmafest eller bedriftsarrangement",
    descriptionEn: "Plan a corporate party or company event",
    features: {
      traditions: false,
      dressTracking: false,
      weddingPartyRoles: false,
      speeches: true,
      photoplan: true,
      seating: true,
      coupleProfile: false,
      importantPeople: true,
      sharePartner: false,
    },
    roleLabels: {
      primary: { no: "Arrangør", en: "Organizer" },
      secondary: { no: "Medarrangør", en: "Co-organizer" },
      guestLabel: { no: "Deltakere", en: "Attendees" },
    },
    dateLabel: { no: "Arrangementsdato", en: "Event Date" },
  },

  conference: {
    type: "conference",
    category: "corporate",
    labelNo: "Konferanse",
    labelEn: "Conference",
    icon: "🎤",
    descriptionNo: "Planlegg konferanse med foredrag og program",
    descriptionEn: "Plan a conference with speakers and agenda",
    features: {
      traditions: false,
      dressTracking: false,
      weddingPartyRoles: false,
      speeches: true,
      photoplan: true,
      seating: true,
      coupleProfile: false,
      importantPeople: true,
      sharePartner: false,
    },
    roleLabels: {
      primary: { no: "Arrangør", en: "Organizer" },
      secondary: { no: "Programansvarlig", en: "Program Lead" },
      guestLabel: { no: "Deltakere", en: "Delegates" },
    },
    dateLabel: { no: "Konferansedato", en: "Conference Date" },
  },

  seminar: {
    type: "seminar",
    category: "corporate",
    labelNo: "Seminar / Workshop",
    labelEn: "Seminar / Workshop",
    icon: "📋",
    descriptionNo: "Planlegg seminar eller workshop",
    descriptionEn: "Plan a seminar or workshop",
    features: {
      traditions: false,
      dressTracking: false,
      weddingPartyRoles: false,
      speeches: true,
      photoplan: false,
      seating: true,
      coupleProfile: false,
      importantPeople: true,
      sharePartner: false,
    },
    roleLabels: {
      primary: { no: "Arrangør", en: "Organizer" },
      secondary: { no: "Fasilitator", en: "Facilitator" },
      guestLabel: { no: "Deltakere", en: "Participants" },
    },
    dateLabel: { no: "Seminardato", en: "Seminar Date" },
  },

  team_building: {
    type: "team_building",
    category: "corporate",
    labelNo: "Teambuilding",
    labelEn: "Team Building",
    icon: "🤝",
    descriptionNo: "Planlegg teambuilding-aktiviteter",
    descriptionEn: "Plan team building activities",
    features: {
      traditions: false,
      dressTracking: false,
      weddingPartyRoles: false,
      speeches: false,
      photoplan: false,
      seating: false,
      coupleProfile: false,
      importantPeople: true,
      sharePartner: false,
    },
    roleLabels: {
      primary: { no: "Arrangør", en: "Organizer" },
      secondary: { no: "Teamleder", en: "Team Lead" },
      guestLabel: { no: "Deltakere", en: "Participants" },
    },
    dateLabel: { no: "Dato", en: "Date" },
  },

  product_launch: {
    type: "product_launch",
    category: "corporate",
    labelNo: "Produktlansering",
    labelEn: "Product Launch",
    icon: "🚀",
    descriptionNo: "Planlegg produktlansering eller lanseringsevent",
    descriptionEn: "Plan a product launch event",
    features: {
      traditions: false,
      dressTracking: false,
      weddingPartyRoles: false,
      speeches: true,
      photoplan: true,
      seating: true,
      coupleProfile: false,
      importantPeople: true,
      sharePartner: false,
    },
    roleLabels: {
      primary: { no: "Arrangør", en: "Organizer" },
      secondary: { no: "Prosjektleder", en: "Project Lead" },
      guestLabel: { no: "Inviterte", en: "Invitees" },
    },
    dateLabel: { no: "Lanseringsdato", en: "Launch Date" },
  },

  gala: {
    type: "gala",
    category: "corporate",
    labelNo: "Galla / Prisutdeling",
    labelEn: "Gala / Awards Ceremony",
    icon: "🏆",
    descriptionNo: "Planlegg galla eller prisutdeling",
    descriptionEn: "Plan a gala or awards ceremony",
    features: {
      traditions: false,
      dressTracking: false,
      weddingPartyRoles: false,
      speeches: true,
      photoplan: true,
      seating: true,
      coupleProfile: false,
      importantPeople: true,
      sharePartner: false,
    },
    roleLabels: {
      primary: { no: "Arrangør", en: "Organizer" },
      secondary: { no: "Seremonimester", en: "MC" },
      guestLabel: { no: "Gjester", en: "Guests" },
    },
    dateLabel: { no: "Galladato", en: "Gala Date" },
  },
};

// ─── Helper Functions ───────────────────────────────────────────

/** Get event config for a given type (defaults to wedding) */
export function getEventConfig(eventType?: EventType | null): EventTypeConfig {
  return EVENT_TYPE_CONFIGS[eventType || "wedding"];
}

/** Get localized label for an event type */
export function getEventLabel(eventType: EventType | null | undefined, locale: string = "no"): string {
  const config = getEventConfig(eventType);
  return locale === "no" ? config.labelNo : config.labelEn;
}

/** Get date field label for an event type */
export function getDateLabel(eventType: EventType | null | undefined, locale: string = "no"): string {
  const config = getEventConfig(eventType);
  return locale === "no" ? config.dateLabel.no : config.dateLabel.en;
}

/** Get guest/attendee label for an event type */
export function getGuestLabel(eventType: EventType | null | undefined, locale: string = "no"): string {
  const config = getEventConfig(eventType);
  return locale === "no" ? config.roleLabels.guestLabel.no : config.roleLabels.guestLabel.en;
}

/** Check if a feature is enabled for an event type */
export function isFeatureEnabled(eventType: EventType | null | undefined, feature: keyof EventTypeConfig["features"]): boolean {
  return getEventConfig(eventType).features[feature];
}

/** Get personal (B2C) event types */
export function getPersonalEventTypes(): EventTypeConfig[] {
  return Object.values(EVENT_TYPE_CONFIGS).filter(c => c.category === "personal");
}

/** Get corporate (B2B) event types */
export function getCorporateEventTypes(): EventTypeConfig[] {
  return Object.values(EVENT_TYPE_CONFIGS).filter(c => c.category === "corporate");
}

/** Get all event types grouped by category */
export function getGroupedEventTypes(): { personal: EventTypeConfig[]; corporate: EventTypeConfig[] } {
  return {
    personal: getPersonalEventTypes(),
    corporate: getCorporateEventTypes(),
  };
}

// ─── Vendor Category → Event Type Mapping ───────────────────────
// Which vendor categories are relevant for which event types
export const VENDOR_CATEGORY_EVENT_MAP: Record<string, EventType[]> = {
  "Fotograf": ["wedding", "confirmation", "birthday", "anniversary", "engagement", "baby_shower", "corporate_event", "conference", "product_launch", "gala"],
  "Videograf": ["wedding", "confirmation", "anniversary", "corporate_event", "conference", "product_launch", "gala"],
  "Blomster": ["wedding", "confirmation", "anniversary", "engagement", "gala"],
  "Catering": ["wedding", "confirmation", "birthday", "anniversary", "engagement", "baby_shower", "corporate_event", "conference", "seminar", "team_building", "product_launch", "gala"],
  "Musikk": ["wedding", "confirmation", "birthday", "anniversary", "engagement", "corporate_event", "gala"],
  "Venue": ["wedding", "confirmation", "birthday", "anniversary", "engagement", "baby_shower", "corporate_event", "conference", "seminar", "team_building", "product_launch", "gala"],
  "Kake": ["wedding", "confirmation", "birthday", "baby_shower"],
  "Planlegger": ["wedding", "corporate_event", "conference", "gala", "product_launch"],
  "Hår & Makeup": ["wedding", "gala"],
  "Transport": ["wedding", "corporate_event", "gala"],
  "Invitasjoner": ["wedding", "confirmation", "birthday", "anniversary", "engagement", "corporate_event", "gala"],
  "Underholdning": ["wedding", "confirmation", "birthday", "anniversary", "corporate_event", "team_building", "gala"],
  "Dekorasjon": ["wedding", "confirmation", "birthday", "anniversary", "engagement", "corporate_event", "gala", "product_launch"],
  "Konfektyrer": ["wedding", "confirmation", "birthday", "baby_shower"],
  "Bar & Drikke": ["wedding", "birthday", "anniversary", "corporate_event", "gala", "product_launch"],
  "Fotoboks": ["wedding", "confirmation", "birthday", "corporate_event", "gala"],
  "Ringer": ["wedding", "engagement"],
  "Drakt & Dress": ["wedding"],
  "Overnatting": ["wedding", "conference", "corporate_event", "gala"],
  "Husdyr": ["wedding"],
};

/** Check if a vendor category is applicable for a given event type */
export function isVendorCategoryApplicable(categoryName: string, eventType: EventType): boolean {
  const applicableEvents = VENDOR_CATEGORY_EVENT_MAP[categoryName];
  if (!applicableEvents) return true; // Unknown categories default to applicable
  return applicableEvents.includes(eventType);
}
