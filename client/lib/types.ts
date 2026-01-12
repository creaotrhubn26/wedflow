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
}

export interface Table {
  id: number;
  name: string;
  seats: number;
  guests: string[];
}

export interface Speech {
  id: string;
  speakerName: string;
  role: string;
  time: string;
  order: number;
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
  category: "photographer" | "videographer" | "dj" | "florist" | "caterer" | "venue";
  location: string;
  country: "Norway" | "Sweden" | "Denmark";
  rating: number;
  priceRange: string;
  description: string;
  saved: boolean;
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
