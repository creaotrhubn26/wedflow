/**
 * Event Type System — Multi-event platform configuration
 * 
 * Defines all supported event types, their categories (B2C/B2B),
 * applicable vendor categories, visible features, and role labels.
 * 
 * B2B taxonomy follows Norwegian corporate event standards:
 *   1. Faglige og strategiske (Professional & Strategic)
 *   2. Sosiale og relasjonsbyggende (Social & Relationship)
 *   3. Eksternt rettede (External-facing)
 *   4. HR- og interne markeringer (HR & Internal)
 */

// ─── Event Type Enum ────────────────────────────────────────────
export const EVENT_TYPES = [
  // B2C: Personal / Life events
  "wedding",
  "confirmation",
  "birthday",
  "anniversary",
  "engagement",
  "baby_shower",
  // B2B: Professional & Strategic
  "conference",
  "seminar",
  "kickoff",
  // B2B: Social & Relationship
  "summer_party",
  "christmas_party",
  "team_building",
  // B2B: External-facing
  "product_launch",
  "trade_fair",
  // B2B: HR & Internal
  "corporate_anniversary",
  "awards_night",
  "employee_day",
  "onboarding_day",
  // B2B: General catch-all
  "corporate_event",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

// ─── Event Category (B2C vs B2B) ────────────────────────────────
export const EVENT_CATEGORIES = ["personal", "corporate"] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

// ─── Corporate Sub-Categories ───────────────────────────────────
export const CORPORATE_SUB_CATEGORIES = [
  "professional_strategic",
  "social_relational",
  "external_facing",
  "hr_internal",
] as const;
export type CorporateSubCategory = (typeof CORPORATE_SUB_CATEGORIES)[number];

export interface CorporateSubCategoryInfo {
  key: CorporateSubCategory;
  labelNo: string;
  labelEn: string;
  descriptionNo: string;
  descriptionEn: string;
}

export const CORPORATE_SUB_CATEGORY_INFO: Record<CorporateSubCategory, CorporateSubCategoryInfo> = {
  professional_strategic: {
    key: "professional_strategic",
    labelNo: "Faglige og strategiske",
    labelEn: "Professional & Strategic",
    descriptionNo: "Kompetanseheving, bransjedeling, retning og mål",
    descriptionEn: "Competence building, industry sharing, direction and goals",
  },
  social_relational: {
    key: "social_relational",
    labelNo: "Sosiale og relasjonsbyggende",
    labelEn: "Social & Relationship Building",
    descriptionNo: "Kulturbygging, trivsel, samarbeid og samhold",
    descriptionEn: "Culture building, well-being, collaboration and cohesion",
  },
  external_facing: {
    key: "external_facing",
    labelNo: "Eksternt rettede",
    labelEn: "External-facing Events",
    descriptionNo: "PR, merkevarebygging, leads og nettverk",
    descriptionEn: "PR, branding, leads and networking",
  },
  hr_internal: {
    key: "hr_internal",
    labelNo: "HR og interne markeringer",
    labelEn: "HR & Internal Celebrations",
    descriptionNo: "Jubileer, utmerkelser, ansattdager, onboarding",
    descriptionEn: "Anniversaries, awards, employee days, onboarding",
  },
};

// ─── Event Type Metadata ────────────────────────────────────────
export interface EventTypeConfig {
  type: EventType;
  category: EventCategory;
  corporateSubCategory?: CorporateSubCategory;
  labelNo: string;       // Norwegian label
  labelEn: string;       // English label
  icon: string;          // Emoji icon for picker
  descriptionNo: string; // Norwegian description
  descriptionEn: string; // English description
  /** Typical content / key activities (for B2B info display) */
  typicalContentNo?: string[];
  typicalContentEn?: string[];
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
  /** Share screen labels — what do we call "sharing" for this event type */
  shareLabel: {
    titleNo: string;      // "Del bryllupet" / "Del arrangementet"
    titleEn: string;      // "Share wedding" / "Share event"
    subtitleNo: string;   // "Inviter partner, toastmaster..."
    subtitleEn: string;
    shareMessageNo: string;  // SMS/share text template
    shareMessageEn: string;
  };
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
    shareLabel: {
      titleNo: "Del bryllupet",
      titleEn: "Share Wedding",
      subtitleNo: "Inviter partneren din, toastmaster og forlovere",
      subtitleEn: "Invite your partner, toastmaster and best man/maid of honor",
      shareMessageNo: "Hei {name}! Du er invitert til bryllupet vårt på Wedflow. Din invitasjonskode: {code}. Last ned Wedflow og skriv inn koden for å få tilgang.",
      shareMessageEn: "Hi {name}! You're invited to our wedding on Wedflow. Your invitation code: {code}. Download Wedflow and enter the code to get access.",
    },
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
      sharePartner: true,
    },
    roleLabels: {
      primary: { no: "Konfirmant", en: "Confirmand" },
      secondary: { no: "Forelder", en: "Parent" },
      guestLabel: { no: "Gjester", en: "Guests" },
    },
    dateLabel: { no: "Konfirmasjonsdato", en: "Confirmation Date" },
    shareLabel: {
      titleNo: "Del konfirmasjonen",
      titleEn: "Share Confirmation",
      subtitleNo: "Inviter den andre forelderen eller medarrangør",
      subtitleEn: "Invite the other parent or co-organizer",
      shareMessageNo: "Hei {name}! Du er invitert til konfirmasjonsfeiringen på Wedflow. Din invitasjonskode: {code}. Last ned Wedflow og skriv inn koden for å få tilgang.",
      shareMessageEn: "Hi {name}! You're invited to the confirmation celebration on Wedflow. Your invitation code: {code}. Download Wedflow and enter the code to get access.",
    },
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
      sharePartner: true,
    },
    roleLabels: {
      primary: { no: "Jubilant", en: "Birthday Person" },
      secondary: { no: "Medarrangør", en: "Co-organizer" },
      guestLabel: { no: "Gjester", en: "Guests" },
    },
    dateLabel: { no: "Bursdagsdato", en: "Birthday Date" },
    shareLabel: {
      titleNo: "Del bursdagen",
      titleEn: "Share Birthday",
      subtitleNo: "Inviter medarrangør til bursdagsfeiringen",
      subtitleEn: "Invite a co-organizer to the birthday celebration",
      shareMessageNo: "Hei {name}! Du er invitert til bursdagsfeiringen på Wedflow. Din invitasjonskode: {code}. Last ned Wedflow og skriv inn koden for å få tilgang.",
      shareMessageEn: "Hi {name}! You're invited to the birthday celebration on Wedflow. Your invitation code: {code}. Download Wedflow and enter the code to get access.",
    },
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
    shareLabel: {
      titleNo: "Del jubileet",
      titleEn: "Share Anniversary",
      subtitleNo: "Inviter partneren din eller medarrangør",
      subtitleEn: "Invite your partner or co-organizer",
      shareMessageNo: "Hei {name}! Du er invitert til jubileumsfeiringen på Wedflow. Din invitasjonskode: {code}. Last ned Wedflow og skriv inn koden for å få tilgang.",
      shareMessageEn: "Hi {name}! You're invited to the anniversary celebration on Wedflow. Your invitation code: {code}. Download Wedflow and enter the code to get access.",
    },
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
    shareLabel: {
      titleNo: "Del forlovelsen",
      titleEn: "Share Engagement",
      subtitleNo: "Inviter din forlovede",
      subtitleEn: "Invite your fiancé(e)",
      shareMessageNo: "Hei {name}! Du er invitert til forlovelsesfesten på Wedflow. Din invitasjonskode: {code}. Last ned Wedflow og skriv inn koden for å få tilgang.",
      shareMessageEn: "Hi {name}! You're invited to the engagement party on Wedflow. Your invitation code: {code}. Download Wedflow and enter the code to get access.",
    },
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
      sharePartner: true,
    },
    roleLabels: {
      primary: { no: "Arrangør", en: "Host" },
      secondary: { no: "Medarrangør", en: "Co-host" },
      guestLabel: { no: "Gjester", en: "Guests" },
    },
    dateLabel: { no: "Dato", en: "Date" },
    shareLabel: {
      titleNo: "Del arrangementet",
      titleEn: "Share Event",
      subtitleNo: "Inviter medarrangør til babyshoweren",
      subtitleEn: "Invite a co-organizer to the baby shower",
      shareMessageNo: "Hei {name}! Du er invitert til babyshoweren på Wedflow. Din invitasjonskode: {code}. Last ned Wedflow og skriv inn koden for å få tilgang.",
      shareMessageEn: "Hi {name}! You're invited to the baby shower on Wedflow. Your invitation code: {code}. Download Wedflow and enter the code to get access.",
    },
  },

  // ─── B2B: Professional & Strategic ──────────────────────────
  conference: {
    type: "conference",
    category: "corporate",
    corporateSubCategory: "professional_strategic",
    labelNo: "Konferanse / Fagseminar",
    labelEn: "Conference / Industry Seminar",
    icon: "🎤",
    descriptionNo: "Kompetanseheving, bransjedeling, synlighet",
    descriptionEn: "Competence building, industry sharing, visibility",
    typicalContentNo: ["Keynote speakers", "Paneldebatter", "Breakout sessions", "Sponsorstands"],
    typicalContentEn: ["Keynote speakers", "Panel debates", "Breakout sessions", "Sponsor booths"],
    features: {
      traditions: false, dressTracking: false, weddingPartyRoles: false,
      speeches: true, photoplan: true, seating: true,
      coupleProfile: false, importantPeople: true, sharePartner: true,
    },
    roleLabels: {
      primary: { no: "Arrangør", en: "Organizer" },
      secondary: { no: "Programansvarlig", en: "Program Lead" },
      guestLabel: { no: "Deltakere", en: "Delegates" },
    },
    dateLabel: { no: "Konferansedato", en: "Conference Date" },
    shareLabel: {
      titleNo: "Del arrangementet", titleEn: "Share Event",
      subtitleNo: "Inviter medarrangør, programansvarlig eller kollega",
      subtitleEn: "Invite a co-organizer, program lead or colleague",
      shareMessageNo: "Hei {name}! Du er invitert til konferansen på Wedflow. Din invitasjonskode: {code}. Last ned Wedflow og skriv inn koden for å få tilgang.",
      shareMessageEn: "Hi {name}! You're invited to the conference on Wedflow. Your invitation code: {code}. Download Wedflow and enter the code to get access.",
    },
  },

  seminar: {
    type: "seminar",
    category: "corporate",
    corporateSubCategory: "professional_strategic",
    labelNo: "Seminar / Workshop",
    labelEn: "Seminar / Workshop",
    icon: "📋",
    descriptionNo: "Kunnskapsdeling og kompetansebygging",
    descriptionEn: "Knowledge sharing and competence building",
    typicalContentNo: ["Presentasjoner", "Gruppearbeid", "Diskusjoner", "Nettverking"],
    typicalContentEn: ["Presentations", "Group work", "Discussions", "Networking"],
    features: {
      traditions: false, dressTracking: false, weddingPartyRoles: false,
      speeches: true, photoplan: false, seating: true,
      coupleProfile: false, importantPeople: true, sharePartner: true,
    },
    roleLabels: {
      primary: { no: "Arrangør", en: "Organizer" },
      secondary: { no: "Fasilitator", en: "Facilitator" },
      guestLabel: { no: "Deltakere", en: "Participants" },
    },
    dateLabel: { no: "Seminardato", en: "Seminar Date" },
    shareLabel: {
      titleNo: "Del arrangementet", titleEn: "Share Event",
      subtitleNo: "Inviter medarrangør eller fasilitator",
      subtitleEn: "Invite a co-organizer or facilitator",
      shareMessageNo: "Hei {name}! Du er invitert til seminaret på Wedflow. Din invitasjonskode: {code}. Last ned Wedflow og skriv inn koden for å få tilgang.",
      shareMessageEn: "Hi {name}! You're invited to the seminar on Wedflow. Your invitation code: {code}. Download Wedflow and enter the code to get access.",
    },
  },

  kickoff: {
    type: "kickoff",
    category: "corporate",
    corporateSubCategory: "professional_strategic",
    labelNo: "Strategisamling / Kickoff",
    labelEn: "Strategy Gathering / Kickoff",
    icon: "🎯",
    descriptionNo: "Sette retning, mål og motivasjon — ofte 1–2 dager",
    descriptionEn: "Set direction, goals and motivation — often 1–2 days",
    typicalContentNo: ["Presentasjon av budsjett og mål", "Teambuilding", "Sosiale aktiviteter på kvelden"],
    typicalContentEn: ["Budget and goals presentation", "Team building", "Evening social activities"],
    features: {
      traditions: false, dressTracking: false, weddingPartyRoles: false,
      speeches: true, photoplan: true, seating: true,
      coupleProfile: false, importantPeople: true, sharePartner: true,
    },
    roleLabels: {
      primary: { no: "Arrangør", en: "Organizer" },
      secondary: { no: "Avdelingsleder", en: "Department Lead" },
      guestLabel: { no: "Deltakere", en: "Attendees" },
    },
    dateLabel: { no: "Kickoff-dato", en: "Kickoff Date" },
    shareLabel: {
      titleNo: "Del arrangementet", titleEn: "Share Event",
      subtitleNo: "Inviter medarrangør eller avdelingsleder",
      subtitleEn: "Invite a co-organizer or department lead",
      shareMessageNo: "Hei {name}! Du er invitert til kickoffen på Wedflow. Din invitasjonskode: {code}. Last ned Wedflow og skriv inn koden for å få tilgang.",
      shareMessageEn: "Hi {name}! You're invited to the kickoff on Wedflow. Your invitation code: {code}. Download Wedflow and enter the code to get access.",
    },
  },

  // ─── B2B: Social & Relationship Building ──────────────────
  summer_party: {
    type: "summer_party",
    category: "corporate",
    corporateSubCategory: "social_relational",
    labelNo: "Sommerfest",
    labelEn: "Summer Party",
    icon: "☀️",
    descriptionNo: "Uformell kulturbygging, ofte utendørs",
    descriptionEn: "Informal culture building, often outdoors",
    typicalContentNo: ["Uformell stemning", "Utendørs aktiviteter", "Grilling", "Underholdning"],
    typicalContentEn: ["Casual atmosphere", "Outdoor activities", "BBQ", "Entertainment"],
    features: {
      traditions: false, dressTracking: false, weddingPartyRoles: false,
      speeches: true, photoplan: true, seating: true,
      coupleProfile: false, importantPeople: true, sharePartner: true,
    },
    roleLabels: {
      primary: { no: "Arrangør", en: "Organizer" },
      secondary: { no: "Sosialansvarlig", en: "Social Coordinator" },
      guestLabel: { no: "Ansatte", en: "Employees" },
    },
    dateLabel: { no: "Festdato", en: "Party Date" },
    shareLabel: {
      titleNo: "Del arrangementet", titleEn: "Share Event",
      subtitleNo: "Inviter sosialansvarlig eller medarrangør",
      subtitleEn: "Invite social coordinator or co-organizer",
      shareMessageNo: "Hei {name}! Du er invitert til sommerfesten på Wedflow. Din invitasjonskode: {code}. Last ned Wedflow og skriv inn koden for å få tilgang.",
      shareMessageEn: "Hi {name}! You're invited to the summer party on Wedflow. Your invitation code: {code}. Download Wedflow and enter the code to get access.",
    },
  },

  christmas_party: {
    type: "christmas_party",
    category: "corporate",
    corporateSubCategory: "social_relational",
    labelNo: "Julebord",
    labelEn: "Christmas Party",
    icon: "🎄",
    descriptionNo: "Formell middag med underholdning og tema",
    descriptionEn: "Formal dinner with entertainment and theme",
    typicalContentNo: ["Felles middag", "Underholdning", "Quiz / tema", "Dans"],
    typicalContentEn: ["Shared dinner", "Entertainment", "Quiz / theme", "Dancing"],
    features: {
      traditions: false, dressTracking: false, weddingPartyRoles: false,
      speeches: true, photoplan: true, seating: true,
      coupleProfile: false, importantPeople: true, sharePartner: true,
    },
    roleLabels: {
      primary: { no: "Arrangør", en: "Organizer" },
      secondary: { no: "Sosialkomité", en: "Social Committee" },
      guestLabel: { no: "Ansatte", en: "Employees" },
    },
    dateLabel: { no: "Juleborddato", en: "Party Date" },
    shareLabel: {
      titleNo: "Del arrangementet", titleEn: "Share Event",
      subtitleNo: "Inviter sosialkomité eller medarrangør",
      subtitleEn: "Invite social committee or co-organizer",
      shareMessageNo: "Hei {name}! Du er invitert til julebordet på Wedflow. Din invitasjonskode: {code}. Last ned Wedflow og skriv inn koden for å få tilgang.",
      shareMessageEn: "Hi {name}! You're invited to the Christmas party on Wedflow. Your invitation code: {code}. Download Wedflow and enter the code to get access.",
    },
  },

  team_building: {
    type: "team_building",
    category: "corporate",
    corporateSubCategory: "social_relational",
    labelNo: "Teambuilding",
    labelEn: "Team Building",
    icon: "🤝",
    descriptionNo: "Samarbeid og samhold — escape room, matlaging, tur",
    descriptionEn: "Collaboration and cohesion — escape room, cooking, outdoors",
    typicalContentNo: ["Escape room", "Matlagingskurs", "Rafting / fjelltur", "Vinteraktiviteter"],
    typicalContentEn: ["Escape room", "Cooking class", "Rafting / hiking", "Winter activities"],
    features: {
      traditions: false, dressTracking: false, weddingPartyRoles: false,
      speeches: false, photoplan: false, seating: false,
      coupleProfile: false, importantPeople: true, sharePartner: true,
    },
    roleLabels: {
      primary: { no: "Arrangør", en: "Organizer" },
      secondary: { no: "Teamleder", en: "Team Lead" },
      guestLabel: { no: "Deltakere", en: "Participants" },
    },
    dateLabel: { no: "Dato", en: "Date" },
    shareLabel: {
      titleNo: "Del arrangementet", titleEn: "Share Event",
      subtitleNo: "Inviter teamleder eller medarrangør",
      subtitleEn: "Invite team lead or co-organizer",
      shareMessageNo: "Hei {name}! Du er invitert til teambuildingen på Wedflow. Din invitasjonskode: {code}. Last ned Wedflow og skriv inn koden for å få tilgang.",
      shareMessageEn: "Hi {name}! You're invited to the team building event on Wedflow. Your invitation code: {code}. Download Wedflow and enter the code to get access.",
    },
  },

  // ─── B2B: External-facing ─────────────────────────────────
  product_launch: {
    type: "product_launch",
    category: "corporate",
    corporateSubCategory: "external_facing",
    labelNo: "Produktlansering",
    labelEn: "Product Launch",
    icon: "🚀",
    descriptionNo: "PR og merkevarebygging — presse, kunder, investorer",
    descriptionEn: "PR and branding — press, customers, investors",
    typicalContentNo: ["Sceneproduksjon", "Demo", "Mingling og nettverk", "Pressedekning"],
    typicalContentEn: ["Stage production", "Demo", "Mingling and networking", "Press coverage"],
    features: {
      traditions: false, dressTracking: false, weddingPartyRoles: false,
      speeches: true, photoplan: true, seating: true,
      coupleProfile: false, importantPeople: true, sharePartner: true,
    },
    roleLabels: {
      primary: { no: "Arrangør", en: "Organizer" },
      secondary: { no: "Prosjektleder", en: "Project Lead" },
      guestLabel: { no: "Inviterte", en: "Invitees" },
    },
    dateLabel: { no: "Lanseringsdato", en: "Launch Date" },
    shareLabel: {
      titleNo: "Del arrangementet", titleEn: "Share Event",
      subtitleNo: "Inviter prosjektleder eller medarrangør",
      subtitleEn: "Invite project lead or co-organizer",
      shareMessageNo: "Hei {name}! Du er invitert til produktlanseringen på Wedflow. Din invitasjonskode: {code}. Last ned Wedflow og skriv inn koden for å få tilgang.",
      shareMessageEn: "Hi {name}! You're invited to the product launch on Wedflow. Your invitation code: {code}. Download Wedflow and enter the code to get access.",
    },
  },

  trade_fair: {
    type: "trade_fair",
    category: "corporate",
    corporateSubCategory: "external_facing",
    labelNo: "Messe / Bransjetreff",
    labelEn: "Trade Fair / Industry Meetup",
    icon: "🏛️",
    descriptionNo: "Leads og nettverk — stand, kunder, samarbeidspartnere",
    descriptionEn: "Leads and networking — booth, customers, partners",
    typicalContentNo: ["Standplass", "Kundemøter", "Nettverk", "Produktvisning"],
    typicalContentEn: ["Exhibition booth", "Client meetings", "Networking", "Product display"],
    features: {
      traditions: false, dressTracking: false, weddingPartyRoles: false,
      speeches: true, photoplan: true, seating: false,
      coupleProfile: false, importantPeople: true, sharePartner: true,
    },
    roleLabels: {
      primary: { no: "Utstiller", en: "Exhibitor" },
      secondary: { no: "Standansvarlig", en: "Booth Manager" },
      guestLabel: { no: "Besøkende", en: "Visitors" },
    },
    dateLabel: { no: "Messedato", en: "Fair Date" },
    shareLabel: {
      titleNo: "Del arrangementet", titleEn: "Share Event",
      subtitleNo: "Inviter standansvarlig eller kollega",
      subtitleEn: "Invite booth manager or colleague",
      shareMessageNo: "Hei {name}! Du er invitert til messen på Wedflow. Din invitasjonskode: {code}. Last ned Wedflow og skriv inn koden for å få tilgang.",
      shareMessageEn: "Hi {name}! You're invited to the trade fair on Wedflow. Your invitation code: {code}. Download Wedflow and enter the code to get access.",
    },
  },

  // ─── B2B: HR & Internal Celebrations ──────────────────────
  corporate_anniversary: {
    type: "corporate_anniversary",
    category: "corporate",
    corporateSubCategory: "hr_internal",
    labelNo: "Jubileumsfeiring",
    labelEn: "Anniversary Celebration",
    icon: "🎊",
    descriptionNo: "Feir 10, 25 eller 50 år — bedriftsjubileum",
    descriptionEn: "Celebrate 10, 25 or 50 years — corporate anniversary",
    typicalContentNo: ["Taler", "Tilbakeblikk / historikk", "Prisutdeling", "Festmiddag"],
    typicalContentEn: ["Speeches", "Retrospective / history", "Awards", "Gala dinner"],
    features: {
      traditions: false, dressTracking: false, weddingPartyRoles: false,
      speeches: true, photoplan: true, seating: true,
      coupleProfile: false, importantPeople: true, sharePartner: true,
    },
    roleLabels: {
      primary: { no: "Arrangør", en: "Organizer" },
      secondary: { no: "Jubileumskomité", en: "Anniversary Committee" },
      guestLabel: { no: "Gjester", en: "Guests" },
    },
    dateLabel: { no: "Jubileumsdato", en: "Anniversary Date" },
    shareLabel: {
      titleNo: "Del arrangementet", titleEn: "Share Event",
      subtitleNo: "Inviter jubileumskomité eller medarrangør",
      subtitleEn: "Invite anniversary committee or co-organizer",
      shareMessageNo: "Hei {name}! Du er invitert til jubileumsfeiringen på Wedflow. Din invitasjonskode: {code}. Last ned Wedflow og skriv inn koden for å få tilgang.",
      shareMessageEn: "Hi {name}! You're invited to the anniversary celebration on Wedflow. Your invitation code: {code}. Download Wedflow and enter the code to get access.",
    },
  },

  awards_night: {
    type: "awards_night",
    category: "corporate",
    corporateSubCategory: "hr_internal",
    labelNo: "Prisutdeling / Galla",
    labelEn: "Awards Night / Gala",
    icon: "🏆",
    descriptionNo: "Pris- og utmerkelseskveld med formell ramme",
    descriptionEn: "Awards and recognition night with formal setting",
    typicalContentNo: ["Prisutdeling", "Taler", "Festmiddag", "Underholdning"],
    typicalContentEn: ["Awards ceremony", "Speeches", "Gala dinner", "Entertainment"],
    features: {
      traditions: false, dressTracking: false, weddingPartyRoles: false,
      speeches: true, photoplan: true, seating: true,
      coupleProfile: false, importantPeople: true, sharePartner: true,
    },
    roleLabels: {
      primary: { no: "Arrangør", en: "Organizer" },
      secondary: { no: "Seremonimester", en: "MC" },
      guestLabel: { no: "Gjester", en: "Guests" },
    },
    dateLabel: { no: "Galladato", en: "Gala Date" },
    shareLabel: {
      titleNo: "Del arrangementet", titleEn: "Share Event",
      subtitleNo: "Inviter seremonimester eller medarrangør",
      subtitleEn: "Invite MC or co-organizer",
      shareMessageNo: "Hei {name}! Du er invitert til gallaen på Wedflow. Din invitasjonskode: {code}. Last ned Wedflow og skriv inn koden for å få tilgang.",
      shareMessageEn: "Hi {name}! You're invited to the awards night on Wedflow. Your invitation code: {code}. Download Wedflow and enter the code to get access.",
    },
  },

  employee_day: {
    type: "employee_day",
    category: "corporate",
    corporateSubCategory: "hr_internal",
    labelNo: "Ansattdag / Mangfoldsarrangement",
    labelEn: "Employee Day / Diversity Event",
    icon: "🙌",
    descriptionNo: "Ansattdager, mangfold- og kulturarrangementer",
    descriptionEn: "Employee days, diversity and culture events",
    typicalContentNo: ["Foredrag", "Workshops", "Kulturelle innslag", "Sosialt samvær"],
    typicalContentEn: ["Talks", "Workshops", "Cultural performances", "Social gathering"],
    features: {
      traditions: false, dressTracking: false, weddingPartyRoles: false,
      speeches: true, photoplan: false, seating: false,
      coupleProfile: false, importantPeople: true, sharePartner: true,
    },
    roleLabels: {
      primary: { no: "HR-ansvarlig", en: "HR Lead" },
      secondary: { no: "Medarrangør", en: "Co-organizer" },
      guestLabel: { no: "Ansatte", en: "Employees" },
    },
    dateLabel: { no: "Dato", en: "Date" },
    shareLabel: {
      titleNo: "Del arrangementet", titleEn: "Share Event",
      subtitleNo: "Inviter HR-kollega eller medarrangør",
      subtitleEn: "Invite HR colleague or co-organizer",
      shareMessageNo: "Hei {name}! Du er invitert til ansattdagen på Wedflow. Din invitasjonskode: {code}. Last ned Wedflow og skriv inn koden for å få tilgang.",
      shareMessageEn: "Hi {name}! You're invited to the employee day on Wedflow. Your invitation code: {code}. Download Wedflow and enter the code to get access.",
    },
  },

  onboarding_day: {
    type: "onboarding_day",
    category: "corporate",
    corporateSubCategory: "hr_internal",
    labelNo: "Onboarding-dag",
    labelEn: "Onboarding Day",
    icon: "🎓",
    descriptionNo: "Velkomstdag for nye ansatte",
    descriptionEn: "Welcome day for new employees",
    typicalContentNo: ["Introduksjoner", "Kontoromvisning", "Teamlunsj", "Buddy-ordning"],
    typicalContentEn: ["Introductions", "Office tour", "Team lunch", "Buddy program"],
    features: {
      traditions: false, dressTracking: false, weddingPartyRoles: false,
      speeches: true, photoplan: false, seating: false,
      coupleProfile: false, importantPeople: true, sharePartner: true,
    },
    roleLabels: {
      primary: { no: "HR-ansvarlig", en: "HR Lead" },
      secondary: { no: "Fadder", en: "Buddy" },
      guestLabel: { no: "Nye ansatte", en: "New Employees" },
    },
    dateLabel: { no: "Onboarding-dato", en: "Onboarding Date" },
    shareLabel: {
      titleNo: "Del arrangementet", titleEn: "Share Event",
      subtitleNo: "Inviter fadder eller HR-kollega",
      subtitleEn: "Invite buddy or HR colleague",
      shareMessageNo: "Hei {name}! Du er invitert til onboarding-dagen på Wedflow. Din invitasjonskode: {code}. Last ned Wedflow og skriv inn koden for å få tilgang.",
      shareMessageEn: "Hi {name}! You're invited to the onboarding day on Wedflow. Your invitation code: {code}. Download Wedflow and enter the code to get access.",
    },
  },

  // ─── B2B: General catch-all ───────────────────────────────
  corporate_event: {
    type: "corporate_event",
    category: "corporate",
    labelNo: "Annet bedriftsarrangement",
    labelEn: "Other Corporate Event",
    icon: "🏢",
    descriptionNo: "Planlegg et annet type bedriftsarrangement",
    descriptionEn: "Plan another type of corporate event",
    features: {
      traditions: false, dressTracking: false, weddingPartyRoles: false,
      speeches: true, photoplan: true, seating: true,
      coupleProfile: false, importantPeople: true, sharePartner: true,
    },
    roleLabels: {
      primary: { no: "Arrangør", en: "Organizer" },
      secondary: { no: "Medarrangør", en: "Co-organizer" },
      guestLabel: { no: "Deltakere", en: "Attendees" },
    },
    dateLabel: { no: "Arrangementsdato", en: "Event Date" },
    shareLabel: {
      titleNo: "Del arrangementet", titleEn: "Share Event",
      subtitleNo: "Inviter medarrangør eller kollega",
      subtitleEn: "Invite co-organizer or colleague",
      shareMessageNo: "Hei {name}! Du er invitert til arrangementet på Wedflow. Din invitasjonskode: {code}. Last ned Wedflow og skriv inn koden for å få tilgang.",
      shareMessageEn: "Hi {name}! You're invited to the event on Wedflow. Your invitation code: {code}. Download Wedflow and enter the code to get access.",
    },
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

/** Get corporate event types grouped by sub-category */
export function getCorporateGrouped(): { subCategory: CorporateSubCategoryInfo; events: EventTypeConfig[] }[] {
  const corporate = getCorporateEventTypes();
  return CORPORATE_SUB_CATEGORIES.map(subCat => ({
    subCategory: CORPORATE_SUB_CATEGORY_INFO[subCat],
    events: corporate.filter(e => e.corporateSubCategory === subCat),
  })).filter(g => g.events.length > 0);
}

/** Get the "Other" corporate catch-all (no sub-category) */
export function getCorporateCatchAll(): EventTypeConfig | undefined {
  return getCorporateEventTypes().find(e => !e.corporateSubCategory);
}

// ─── Vendor Category → Event Type Mapping ───────────────────────
// Which vendor categories are relevant for which event types
export const VENDOR_CATEGORY_EVENT_MAP: Record<string, EventType[]> = {
  "Fotograf": ["wedding", "confirmation", "birthday", "anniversary", "engagement", "baby_shower", "conference", "kickoff", "summer_party", "christmas_party", "product_launch", "trade_fair", "corporate_anniversary", "awards_night", "employee_day", "corporate_event"],
  "Videograf": ["wedding", "confirmation", "anniversary", "conference", "kickoff", "product_launch", "corporate_anniversary", "awards_night", "corporate_event"],
  "Blomster": ["wedding", "confirmation", "anniversary", "engagement", "awards_night", "corporate_anniversary"],
  "Catering": ["wedding", "confirmation", "birthday", "anniversary", "engagement", "baby_shower", "conference", "seminar", "kickoff", "summer_party", "christmas_party", "team_building", "product_launch", "corporate_anniversary", "awards_night", "employee_day", "onboarding_day", "corporate_event"],
  "Musikk": ["wedding", "confirmation", "birthday", "anniversary", "engagement", "summer_party", "christmas_party", "awards_night", "corporate_anniversary", "corporate_event"],
  "Venue": ["wedding", "confirmation", "birthday", "anniversary", "engagement", "baby_shower", "conference", "seminar", "kickoff", "summer_party", "christmas_party", "team_building", "product_launch", "trade_fair", "corporate_anniversary", "awards_night", "employee_day", "onboarding_day", "corporate_event"],
  "Kake": ["wedding", "confirmation", "birthday", "baby_shower", "corporate_anniversary"],
  "Planlegger": ["wedding", "conference", "kickoff", "product_launch", "awards_night", "corporate_anniversary", "corporate_event"],
  "Hår & Makeup": ["wedding", "awards_night"],
  "Transport": ["wedding", "conference", "kickoff", "awards_night", "corporate_event"],
  "Invitasjoner": ["wedding", "confirmation", "birthday", "anniversary", "engagement", "christmas_party", "awards_night", "corporate_anniversary", "corporate_event"],
  "Underholdning": ["wedding", "confirmation", "birthday", "anniversary", "summer_party", "christmas_party", "team_building", "awards_night", "corporate_anniversary", "employee_day", "corporate_event"],
  "Dekorasjon": ["wedding", "confirmation", "birthday", "anniversary", "engagement", "christmas_party", "product_launch", "awards_night", "corporate_anniversary", "corporate_event"],
  "Konfektyrer": ["wedding", "confirmation", "birthday", "baby_shower", "corporate_anniversary"],
  "Bar & Drikke": ["wedding", "birthday", "anniversary", "summer_party", "christmas_party", "product_launch", "awards_night", "corporate_anniversary", "corporate_event"],
  "Fotoboks": ["wedding", "confirmation", "birthday", "summer_party", "christmas_party", "awards_night", "corporate_event"],
  "Ringer": ["wedding", "engagement"],
  "Drakt & Dress": ["wedding"],
  "Overnatting": ["wedding", "conference", "kickoff", "awards_night", "corporate_event"],
  "Husdyr": ["wedding"],
};

/** Check if a vendor category is applicable for a given event type */
export function isVendorCategoryApplicable(categoryName: string, eventType: EventType): boolean {
  const applicableEvents = VENDOR_CATEGORY_EVENT_MAP[categoryName];
  if (!applicableEvents) return true; // Unknown categories default to applicable
  return applicableEvents.includes(eventType);
}
