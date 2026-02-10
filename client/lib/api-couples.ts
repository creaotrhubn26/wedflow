import type { EventType, EventCategory } from "@shared/event-types";

export interface CoupleProfile {
  id: string;
  displayName: string;
  email: string;
  partnerEmail?: string | null;
  weddingDate?: string | null;
  eventType?: EventType | null;
  eventCategory?: EventCategory | null;
  selectedTraditions?: string[] | null;
  expectedGuests?: number | null;
}

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:5000";

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export async function getCoupleProfile(sessionToken: string): Promise<CoupleProfile> {
  const res = await fetch(`${API_URL}/api/couples/me`, {
    headers: authHeader(sessionToken),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Kunne ikke hente parprofil");
  }
  return res.json();
}

export async function updateCoupleProfile(
  sessionToken: string,
  updates: {
    displayName?: string;
    weddingDate?: string;
    partnerEmail?: string | null;
    selectedTraditions?: string[];
    expectedGuests?: number;
    eventType?: EventType;
    eventCategory?: EventCategory;
  }
): Promise<CoupleProfile> {
  const res = await fetch(`${API_URL}/api/couples/me`, {
    method: "PUT",
    headers: {
      ...authHeader(sessionToken),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Kunne ikke oppdatere profil");
  }
  return res.json();
}