import { getCoupleSession } from "./storage";

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "";

async function getAuthHeaders() {
  const session = await getCoupleSession();
  if (!session?.token) throw new Error("Not authenticated");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session.token}`,
  };
}

// ===== BUDGET API =====

export interface BudgetSettings {
  id?: string;
  coupleId?: string;
  totalBudget: number;
  currency: string;
}

export interface BudgetItem {
  id: string;
  coupleId: string;
  category: string;
  label: string;
  estimatedCost: number;
  actualCost?: number;
  isPaid: boolean;
  notes?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function getBudgetSettings(): Promise<BudgetSettings> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/budget/settings`, { headers });
  if (!res.ok) throw new Error("Failed to fetch budget settings");
  return res.json();
}

export async function updateBudgetSettings(data: Partial<BudgetSettings>): Promise<BudgetSettings> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/budget/settings`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update budget settings");
  return res.json();
}

export async function getBudgetItems(): Promise<BudgetItem[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/budget/items`, { headers });
  if (!res.ok) throw new Error("Failed to fetch budget items");
  return res.json();
}

export async function createBudgetItem(data: Omit<BudgetItem, "id" | "coupleId" | "createdAt" | "updatedAt">): Promise<BudgetItem> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/budget/items`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create budget item");
  return res.json();
}

export async function updateBudgetItem(id: string, data: Partial<BudgetItem>): Promise<BudgetItem> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/budget/items/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update budget item");
  return res.json();
}

export async function deleteBudgetItem(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/budget/items/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete budget item");
}

// ===== DRESS API =====

export interface DressAppointment {
  id: string;
  coupleId: string;
  shopName: string;
  date: string;
  time?: string;
  notes?: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DressFavorite {
  id: string;
  coupleId: string;
  name: string;
  designer?: string;
  shop?: string;
  price: number;
  imageUrl?: string;
  notes?: string;
  isFavorite: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DressTimeline {
  id?: string;
  coupleId?: string;
  ordered: boolean;
  orderedDate?: string;
  firstFitting: boolean;
  firstFittingDate?: string;
  alterations: boolean;
  alterationsDate?: string;
  finalFitting: boolean;
  finalFittingDate?: string;
  pickup: boolean;
  pickupDate?: string;
  budget: number;
}

export interface DressData {
  appointments: DressAppointment[];
  favorites: DressFavorite[];
  timeline: DressTimeline | null;
}

export async function getDressData(): Promise<DressData> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/dress`, { headers });
  if (!res.ok) throw new Error("Failed to fetch dress data");
  return res.json();
}

export async function createDressAppointment(data: Omit<DressAppointment, "id" | "coupleId" | "createdAt" | "updatedAt">): Promise<DressAppointment> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/dress/appointments`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create dress appointment");
  return res.json();
}

export async function updateDressAppointment(id: string, data: Partial<DressAppointment>): Promise<DressAppointment> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/dress/appointments/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update dress appointment");
  return res.json();
}

export async function deleteDressAppointment(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/dress/appointments/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete dress appointment");
}

export async function createDressFavorite(data: Omit<DressFavorite, "id" | "coupleId" | "createdAt" | "updatedAt">): Promise<DressFavorite> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/dress/favorites`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create dress favorite");
  return res.json();
}

export async function updateDressFavorite(id: string, data: Partial<DressFavorite>): Promise<DressFavorite> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/dress/favorites/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update dress favorite");
  return res.json();
}

export async function deleteDressFavorite(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/dress/favorites/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete dress favorite");
}

export async function updateDressTimeline(data: Partial<DressTimeline>): Promise<DressTimeline> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/dress/timeline`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update dress timeline");
  return res.json();
}

// ===== IMPORTANT PEOPLE API =====

export interface ImportantPerson {
  id: string;
  coupleId: string;
  name: string;
  role: 'bestman' | 'maidofhonor' | 'groomsman' | 'bridesmaid' | 'toastmaster' | 'other';
  phone?: string;
  email?: string;
  notes?: string;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function getImportantPeople(): Promise<ImportantPerson[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/important-people`, { headers });
  if (!res.ok) throw new Error("Failed to fetch important people");
  return res.json();
}

export async function createImportantPerson(data: Omit<ImportantPerson, "id" | "coupleId" | "createdAt" | "updatedAt">): Promise<ImportantPerson> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/important-people`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create important person");
  return res.json();
}

export async function updateImportantPerson(id: string, data: Partial<ImportantPerson>): Promise<ImportantPerson> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/important-people/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update important person");
  return res.json();
}

export async function deleteImportantPerson(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/important-people/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete important person");
}

// ===== PHOTO SHOTS API =====

export interface PhotoShot {
  id: string;
  coupleId: string;
  title: string;
  description?: string;
  category: 'ceremony' | 'portraits' | 'group' | 'details' | 'reception';
  completed: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export async function getPhotoShots(): Promise<PhotoShot[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/photo-shots`, { headers });
  if (!res.ok) throw new Error("Failed to fetch photo shots");
  return res.json();
}

export async function createPhotoShot(data: Omit<PhotoShot, "id" | "coupleId" | "createdAt" | "updatedAt">): Promise<PhotoShot> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/photo-shots`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create photo shot");
  return res.json();
}

export async function updatePhotoShot(id: string, data: Partial<PhotoShot>): Promise<PhotoShot> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/photo-shots/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update photo shot");
  return res.json();
}

export async function deletePhotoShot(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/photo-shots/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete photo shot");
}

export async function seedDefaultPhotoShots(): Promise<PhotoShot[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/photo-shots/seed-defaults`, {
    method: "POST",
    headers,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to seed default photo shots");
  }
  return res.json();
}

// ===== CONTRACTS API =====

export interface CoupleContract {
  id: string;
  coupleId: string;
  vendorId: string;
  offerId: string;
  vendorRole?: string;
  status: 'active' | 'completed' | 'cancelled';
  canViewSchedule: boolean;
  canViewSpeeches: boolean;
  canViewTableSeating: boolean;
  notifyOnScheduleChange: boolean;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  // Joined data
  vendorName?: string;
  vendorImage?: string;
  vendorCategory?: string;
  offerTotalAmount?: number;
}

export async function getCoupleContracts(): Promise<CoupleContract[]> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/vendor-contracts`, { headers });
  if (!res.ok) throw new Error("Failed to fetch contracts");
  return res.json();
}

export async function updateContract(id: string, data: Partial<CoupleContract>): Promise<CoupleContract> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/vendor-contracts/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update contract");
  return res.json();
}

// ===== HAIR & MAKEUP API =====

export interface HairMakeupAppointment {
  id: string;
  coupleId: string;
  stylistName: string;
  serviceType?: string;
  appointmentType: string;
  date: string;
  time?: string;
  location?: string;
  notes?: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface HairMakeupLook {
  id: string;
  coupleId: string;
  name: string;
  lookType: string;
  imageUrl?: string;
  notes?: string;
  isFavorite: boolean;
  isSelected: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface HairMakeupTimeline {
  id?: string;
  coupleId?: string;
  consultationBooked: boolean;
  trialBooked: boolean;
  lookSelected: boolean;
  weddingDayBooked: boolean;
  budget: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface HairMakeupData {
  appointments: HairMakeupAppointment[];
  looks: HairMakeupLook[];
  timeline: HairMakeupTimeline;
}

export async function getHairMakeupData(): Promise<HairMakeupData> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/hair-makeup`, { headers });
  if (!res.ok) throw new Error("Failed to fetch hair/makeup data");
  return res.json();
}

export async function createHairMakeupAppointment(data: Omit<HairMakeupAppointment, "id" | "coupleId" | "createdAt" | "updatedAt">): Promise<HairMakeupAppointment> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/hair-makeup/appointments`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create appointment");
  return res.json();
}

export async function updateHairMakeupAppointment(id: string, data: Partial<HairMakeupAppointment>): Promise<HairMakeupAppointment> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/hair-makeup/appointments/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update appointment");
  return res.json();
}

export async function deleteHairMakeupAppointment(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/hair-makeup/appointments/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete appointment");
}

export async function createHairMakeupLook(data: Omit<HairMakeupLook, "id" | "coupleId" | "createdAt" | "updatedAt">): Promise<HairMakeupLook> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/hair-makeup/looks`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create look");
  return res.json();
}

export async function updateHairMakeupLook(id: string, data: Partial<HairMakeupLook>): Promise<HairMakeupLook> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/hair-makeup/looks/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update look");
  return res.json();
}

export async function deleteHairMakeupLook(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/hair-makeup/looks/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete look");
}

export async function updateHairMakeupTimeline(data: Partial<HairMakeupTimeline>): Promise<HairMakeupTimeline> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/hair-makeup/timeline`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update timeline");
  return res.json();
}

// ===== TRANSPORT API =====

export interface TransportBooking {
  id: string;
  coupleId: string;
  vehicleType: string;
  providerName?: string;
  vehicleDescription?: string;
  pickupTime?: string;
  pickupLocation?: string;
  dropoffTime?: string;
  dropoffLocation?: string;
  driverName?: string;
  driverPhone?: string;
  price?: number;
  notes?: string;
  confirmed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransportTimeline {
  id?: string;
  coupleId?: string;
  brideCarBooked: boolean;
  groomCarBooked: boolean;
  guestShuttleBooked: boolean;
  getawayCarBooked: boolean;
  allConfirmed: boolean;
  budget: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface TransportData {
  bookings: TransportBooking[];
  timeline: TransportTimeline;
}

export async function getTransportData(): Promise<TransportData> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/transport`, { headers });
  if (!res.ok) throw new Error("Failed to fetch transport data");
  return res.json();
}

export async function createTransportBooking(data: Omit<TransportBooking, "id" | "coupleId" | "createdAt" | "updatedAt">): Promise<TransportBooking> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/transport/bookings`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create booking");
  return res.json();
}

export async function updateTransportBooking(id: string, data: Partial<TransportBooking>): Promise<TransportBooking> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/transport/bookings/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update booking");
  return res.json();
}

export async function deleteTransportBooking(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/transport/bookings/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete booking");
}

export async function updateTransportTimeline(data: Partial<TransportTimeline>): Promise<TransportTimeline> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/transport/timeline`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update timeline");
  return res.json();
}

// ===== FLOWERS API =====

export interface FlowerAppointment {
  id: string;
  coupleId: string;
  floristName: string;
  appointmentType: string;
  date: string;
  time?: string;
  location?: string;
  notes?: string;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface FlowerSelection {
  id: string;
  coupleId: string;
  itemType: string;
  name: string;
  description?: string;
  imageUrl?: string;
  quantity?: number;
  estimatedPrice?: number;
  isConfirmed: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FlowerTimeline {
  id?: string;
  coupleId?: string;
  floristSelected: boolean;
  consultationDone: boolean;
  mockupApproved: boolean;
  deliveryConfirmed: boolean;
  budget: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FlowerData {
  appointments: FlowerAppointment[];
  selections: FlowerSelection[];
  timeline: FlowerTimeline;
}

export async function getFlowerData(): Promise<FlowerData> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/flowers`, { headers });
  if (!res.ok) throw new Error("Failed to fetch flower data");
  return res.json();
}

export async function createFlowerAppointment(data: Omit<FlowerAppointment, "id" | "coupleId" | "createdAt" | "updatedAt">): Promise<FlowerAppointment> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/flowers/appointments`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create appointment");
  return res.json();
}

export async function updateFlowerAppointment(id: string, data: Partial<FlowerAppointment>): Promise<FlowerAppointment> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/flowers/appointments/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update appointment");
  return res.json();
}

export async function deleteFlowerAppointment(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/flowers/appointments/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete appointment");
}

export async function createFlowerSelection(data: Omit<FlowerSelection, "id" | "coupleId" | "createdAt" | "updatedAt">): Promise<FlowerSelection> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/flowers/selections`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create selection");
  return res.json();
}

export async function updateFlowerSelection(id: string, data: Partial<FlowerSelection>): Promise<FlowerSelection> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/flowers/selections/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update selection");
  return res.json();
}

export async function deleteFlowerSelection(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/flowers/selections/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete selection");
}

export async function updateFlowerTimeline(data: Partial<FlowerTimeline>): Promise<FlowerTimeline> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/flowers/timeline`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update timeline");
  return res.json();
}

// ===== CATERING API =====

export interface CateringTasting {
  id: string;
  coupleId: string;
  catererName: string;
  date: string;
  time?: string;
  location?: string;
  notes?: string;
  rating?: number;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CateringMenuItem {
  id: string;
  coupleId: string;
  courseType: string;
  dishName: string;
  description?: string;
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isDairyFree: boolean;
  isSelected: boolean;
  pricePerPerson?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CateringDietaryNeed {
  id: string;
  coupleId: string;
  guestName: string;
  dietaryType: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CateringTimeline {
  id?: string;
  coupleId?: string;
  catererSelected: boolean;
  tastingCompleted: boolean;
  menuFinalized: boolean;
  guestCountConfirmed: boolean;
  guestCount: number;
  budget: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CateringData {
  tastings: CateringTasting[];
  menu: CateringMenuItem[];
  dietaryNeeds: CateringDietaryNeed[];
  timeline: CateringTimeline;
}

export async function getCateringData(): Promise<CateringData> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/catering`, { headers });
  if (!res.ok) throw new Error("Failed to fetch catering data");
  return res.json();
}

export async function createCateringTasting(data: Omit<CateringTasting, "id" | "coupleId" | "createdAt" | "updatedAt">): Promise<CateringTasting> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/catering/tastings`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create tasting");
  return res.json();
}

export async function updateCateringTasting(id: string, data: Partial<CateringTasting>): Promise<CateringTasting> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/catering/tastings/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update tasting");
  return res.json();
}

export async function deleteCateringTasting(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/catering/tastings/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete tasting");
}

export async function createCateringMenuItem(data: Omit<CateringMenuItem, "id" | "coupleId" | "createdAt" | "updatedAt">): Promise<CateringMenuItem> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/catering/menu`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create menu item");
  return res.json();
}

export async function updateCateringMenuItem(id: string, data: Partial<CateringMenuItem>): Promise<CateringMenuItem> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/catering/menu/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update menu item");
  return res.json();
}

export async function deleteCateringMenuItem(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/catering/menu/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete menu item");
}

export async function createCateringDietaryNeed(data: Omit<CateringDietaryNeed, "id" | "coupleId" | "createdAt" | "updatedAt">): Promise<CateringDietaryNeed> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/catering/dietary`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create dietary need");
  return res.json();
}

export async function updateCateringDietaryNeed(id: string, data: Partial<CateringDietaryNeed>): Promise<CateringDietaryNeed> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/catering/dietary/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update dietary need");
  return res.json();
}

export async function deleteCateringDietaryNeed(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/catering/dietary/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete dietary need");
}

export async function updateCateringTimeline(data: Partial<CateringTimeline>): Promise<CateringTimeline> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/catering/timeline`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update timeline");
  return res.json();
}

// ===== CAKE API =====

export interface CakeTasting {
  id: string;
  coupleId: string;
  bakeryName: string;
  date: string;
  time?: string;
  location?: string;
  flavorsToTry?: string;
  notes?: string;
  rating?: number;
  completed: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CakeDesign {
  id: string;
  coupleId: string;
  name: string;
  imageUrl?: string;
  tiers?: number;
  flavor?: string;
  filling?: string;
  frosting?: string;
  style?: string;
  estimatedPrice?: number;
  estimatedServings?: number;
  isFavorite: boolean;
  isSelected: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CakeTimeline {
  id?: string;
  coupleId?: string;
  bakerySelected: boolean;
  tastingCompleted: boolean;
  designFinalized: boolean;
  depositPaid: boolean;
  deliveryConfirmed: boolean;
  budget: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CakeData {
  tastings: CakeTasting[];
  designs: CakeDesign[];
  timeline: CakeTimeline;
}

export async function getCakeData(): Promise<CakeData> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/cake`, { headers });
  if (!res.ok) throw new Error("Failed to fetch cake data");
  return res.json();
}

export async function createCakeTasting(data: Omit<CakeTasting, "id" | "coupleId" | "createdAt" | "updatedAt">): Promise<CakeTasting> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/cake/tastings`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create tasting");
  return res.json();
}

export async function updateCakeTasting(id: string, data: Partial<CakeTasting>): Promise<CakeTasting> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/cake/tastings/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update tasting");
  return res.json();
}

export async function deleteCakeTasting(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/cake/tastings/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete tasting");
}

export async function createCakeDesign(data: Omit<CakeDesign, "id" | "coupleId" | "createdAt" | "updatedAt">): Promise<CakeDesign> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/cake/designs`, {
    method: "POST",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create design");
  return res.json();
}

export async function updateCakeDesign(id: string, data: Partial<CakeDesign>): Promise<CakeDesign> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/cake/designs/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update design");
  return res.json();
}

export async function deleteCakeDesign(id: string): Promise<void> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/cake/designs/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete design");
}

export async function updateCakeTimeline(data: Partial<CakeTimeline>): Promise<CakeTimeline> {
  const headers = await getAuthHeaders();
  const res = await fetch(`${API_BASE}/api/couple/cake/timeline`, {
    method: "PUT",
    headers,
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update timeline");
  return res.json();
}
