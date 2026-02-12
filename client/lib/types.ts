export interface WeddingDetails {
  coupleNames: string;
  weddingDate: string;
  venue: string;
}

export interface ScheduleEvent {
  id: string;
  time: string;
  title: string;
  icon: "heart" | "camera" | "music" | "users" | "coffee" | "sun" | "moon" | "star";
}

export interface Guest {
  id: string;
  name: string;
  status: "confirmed" | "pending" | "declined";
  tableNumber?: number;
  category?: "bride_family" | "groom_family" | "friends" | "colleagues" | "reserved" | "other";
  email?: string;
  phone?: string;
  dietaryRequirements?: string;
  allergies?: string;
  plusOne?: boolean;
  plusOneName?: string;
  notes?: string;
}

export const GUEST_CATEGORIES = [
  { value: "bride_family", label: "Brudens familie" },
  { value: "groom_family", label: "Brudgommens familie" },
  { value: "friends", label: "Venner" },
  { value: "colleagues", label: "Kolleger" },
  { value: "reserved", label: "Reservert" },
  { value: "other", label: "Annet" },
] as const;

export interface Table {
  id: string;
  tableNumber: number;
  name: string;
  category?: string; // "bride_family", "groom_family", "friends", "colleagues", "reserved", "main"
  label?: string; // Custom label like "Brudens familie"
  seats: number;
  isReserved?: boolean;
  notes?: string;
  vendorNotes?: string;
  sortOrder: number;
  guests: string[];
}

export const TABLE_CATEGORIES = [
  { value: "main", label: "Hovedbord" },
  { value: "bride_family", label: "Brudens familie" },
  { value: "groom_family", label: "Brudgommens familie" },
  { value: "friends", label: "Venner" },
  { value: "colleagues", label: "Kolleger" },
  { value: "reserved", label: "Reservert" },
  { value: "other", label: "Annet" },
] as const;

export interface Speech {
  id: string;
  speakerName: string;
  role: string;
  time: string;
  order: number;
  status?: "ready" | "speaking" | "done";
  tableId?: string | null;
  durationMinutes?: number;
  notes?: string;
}

export interface ImportantPerson {
  id: string;
  name: string;
  role: string;
  phone?: string;
}

export interface PhotoShot {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  category: "ceremony" | "portraits" | "group" | "details" | "reception";
}

export interface InspirationItem {
  id: string;
  imageUrl: string;
  category: string;
  saved: boolean;
}

export interface BudgetItem {
  id: string;
  category: string;
  name: string;
  estimatedCost: number;
  actualCost: number;
  paid: boolean;
}

export interface BudgetCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Vendor {
  id: string;
  name: string;
  businessName?: string;
  categoryId: string | null;
  categoryName?: string;
  location: string;
  country: "Norway" | "Sweden" | "Denmark";
  rating: number;
  priceRange: string;
  description: string;
  saved: boolean;
  phone?: string | null;
  website?: string | null;
  imageUrl?: string | null;
  isFeatured: boolean;
  isPrioritized: boolean;
  hasReviewBadge: boolean;
}

export interface QaQuestion {
  id: string;
  text: string;
  authorName: string;
  authorId: string;
  createdAt: string;
  upvotes: number;
  upvotedBy: string[];
  status: "pending" | "approved" | "answered" | "rejected" | "highlighted";
  tags: string[];
  isAnonymous: boolean;
  answeredBy?: string;
  answeredAt?: string;
  answer?: string;
}

export interface QaSettings {
  // Q&A display settings
  showAuthorName: boolean;
  showScore: boolean;
  showUpvoteCount: boolean;
  showTimestamp: boolean;
  allowAnonymous: boolean;
  // Game settings
  gameTimerEnabled: boolean;
  gameTimerSeconds: number;
  showGameScore: boolean;
  showGameLeaderboard: boolean;
  shuffleQuestions: boolean;
  audienceCanSeeAnswers: boolean;
  // Custom icon overrides (admin-uploaded image URIs)
  customQaIcon?: string;                       // main Q&A session icon
  customGameIcons?: Record<string, string>;     // per game mode → image URI
  customGameAccents?: Record<string, string>;   // per game mode → hex color
}

export interface GameScore {
  id: string;
  gameMode: string;
  playerName: string;
  playerId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  completedAt: string;
}

export interface QaSession {
  id: string;
  title: string;
  isActive: boolean;
  createdAt: string;
  moderationEnabled: boolean;
  anonymousAllowed: boolean;
  questions: QaQuestion[];
  settings?: QaSettings;
  gameScores?: GameScore[];
}

export interface AITimeSlot {
  id: string;
  type: string;
  title: string;
  duration: number;
  startTime: string;
  endTime: string;
  icon: string;
}
