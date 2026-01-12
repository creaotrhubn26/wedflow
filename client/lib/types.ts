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
