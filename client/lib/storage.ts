import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  WeddingDetails,
  ScheduleEvent,
  Guest,
  Table,
  Speech,
  ImportantPerson,
  PhotoShot,
  BudgetItem,
} from "./types";

const KEYS = {
  WEDDING_DETAILS: "@wedflow/wedding_details",
  SCHEDULE: "@wedflow/schedule",
  GUESTS: "@wedflow/guests",
  TABLES: "@wedflow/tables",
  SPEECHES: "@wedflow/speeches",
  IMPORTANT_PEOPLE: "@wedflow/important_people",
  PHOTO_SHOTS: "@wedflow/photo_shots",
  BUDGET_ITEMS: "@wedflow/budget_items",
  TOTAL_BUDGET: "@wedflow/total_budget",
};

export async function getWeddingDetails(): Promise<WeddingDetails | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.WEDDING_DETAILS);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function saveWeddingDetails(details: WeddingDetails): Promise<void> {
  await AsyncStorage.setItem(KEYS.WEDDING_DETAILS, JSON.stringify(details));
}

export async function getSchedule(): Promise<ScheduleEvent[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SCHEDULE);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveSchedule(events: ScheduleEvent[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.SCHEDULE, JSON.stringify(events));
}

export async function getGuests(): Promise<Guest[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.GUESTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveGuests(guests: Guest[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.GUESTS, JSON.stringify(guests));
}

export async function getTables(): Promise<Table[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.TABLES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveTables(tables: Table[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.TABLES, JSON.stringify(tables));
}

export async function getSpeeches(): Promise<Speech[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SPEECHES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveSpeeches(speeches: Speech[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.SPEECHES, JSON.stringify(speeches));
}

export async function getImportantPeople(): Promise<ImportantPerson[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.IMPORTANT_PEOPLE);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveImportantPeople(people: ImportantPerson[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.IMPORTANT_PEOPLE, JSON.stringify(people));
}

export async function getPhotoShots(): Promise<PhotoShot[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.PHOTO_SHOTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function savePhotoShots(shots: PhotoShot[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.PHOTO_SHOTS, JSON.stringify(shots));
}

export async function getBudgetItems(): Promise<BudgetItem[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.BUDGET_ITEMS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveBudgetItems(items: BudgetItem[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.BUDGET_ITEMS, JSON.stringify(items));
}

export async function getTotalBudget(): Promise<number> {
  try {
    const data = await AsyncStorage.getItem(KEYS.TOTAL_BUDGET);
    return data ? JSON.parse(data) : 300000;
  } catch {
    return 300000;
  }
}

export async function saveTotalBudget(budget: number): Promise<void> {
  await AsyncStorage.setItem(KEYS.TOTAL_BUDGET, JSON.stringify(budget));
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}
