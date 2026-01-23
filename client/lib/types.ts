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

export interface AITimeSlot {
  id: string;
  type: string;
  title: string;
  duration: number;
  startTime: string;
  endTime: string;
  icon: string;
}
