export interface CoupleProfile {
  id: string;
  displayName: string;
  email: string;
  weddingDate?: string | null;
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
    selectedTraditions?: string[];
    expectedGuests?: number;
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