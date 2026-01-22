// Vendor Details Screens - Category-specific detail screens for vendors
export { default as VenueDetailsScreen } from "./VenueDetailsScreen";
export { default as PhotographerDetailsScreen } from "./PhotographerDetailsScreen";
export { default as FloristDetailsScreen } from "./FloristDetailsScreen";
export { default as CateringDetailsScreen } from "./CateringDetailsScreen";
export { default as MusicDetailsScreen } from "./MusicDetailsScreen";
export { default as CakeDetailsScreen } from "./CakeDetailsScreen";
export { default as BeautyDetailsScreen } from "./BeautyDetailsScreen";
export { default as TransportDetailsScreen } from "./TransportDetailsScreen";
export { default as PlannerDetailsScreen } from "./PlannerDetailsScreen";

// Category mapping helper
export const getCategoryDetailsScreen = (category: string) => {
  const mapping: Record<string, string> = {
    venue: "VenueDetails",
    photographer: "PhotographerDetails",
    videographer: "PhotographerDetails", // Same screen
    florist: "FloristDetails",
    catering: "CateringDetails",
    music: "MusicDetails",
    dj: "MusicDetails", // Same screen
    cake: "CakeDetails",
    beauty: "BeautyDetails",
    hair: "BeautyDetails", // Same screen
    makeup: "BeautyDetails", // Same screen
    transport: "TransportDetails",
    planner: "PlannerDetails",
    coordinator: "PlannerDetails", // Same screen
  };
  return mapping[category.toLowerCase()] || null;
};
