import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { subscriptionTiers } from "../shared/schema";

// Load environment variables from .env.local
config({ path: ".env.local" });

const DEFAULT_TIERS = [
  {
    name: "starter",
    displayName: "Starter",
    description: "Perfect for new vendors getting started",
    priceNok: 149,
    sortOrder: 1,
    isActive: true,
    maxInspirationPhotos: 10,
    maxProducts: 5,
    maxMonthlyOffers: 5,
    maxMonthlyDeliveries: 2,
    maxStorageGb: 5,
    canSendMessages: true,
    canReceiveInquiries: true,
    canCreateOffers: true,
    canCreateDeliveries: true,
    canShowcaseWork: true,
    hasAdvancedAnalytics: false,
    hasPrioritizedSearch: false,
    canHighlightProfile: false,
    canUseVideoGallery: false,
    hasReviewBadge: false,
    hasMultipleCategories: false,
    commissionPercentage: 3,
  },
  {
    name: "professional",
    displayName: "Professional",
    description: "For established vendors with growing businesses",
    priceNok: 299,
    sortOrder: 2,
    isActive: true,
    maxInspirationPhotos: -1, // Unlimited
    maxProducts: 50,
    maxMonthlyOffers: 50,
    maxMonthlyDeliveries: 20,
    maxStorageGb: 50,
    canSendMessages: true,
    canReceiveInquiries: true,
    canCreateOffers: true,
    canCreateDeliveries: true,
    canShowcaseWork: true,
    hasAdvancedAnalytics: true,
    hasPrioritizedSearch: true,
    canHighlightProfile: true,
    canUseVideoGallery: true,
    hasReviewBadge: true,
    hasMultipleCategories: true,
    commissionPercentage: 2,
  },
  {
    name: "enterprise",
    displayName: "Enterprise",
    description: "Full suite for high-volume vendors",
    priceNok: 599,
    sortOrder: 3,
    isActive: true,
    maxInspirationPhotos: -1, // Unlimited
    maxProducts: -1,
    maxMonthlyOffers: -1,
    maxMonthlyDeliveries: -1,
    maxStorageGb: 500,
    canSendMessages: true,
    canReceiveInquiries: true,
    canCreateOffers: true,
    canCreateDeliveries: true,
    canShowcaseWork: true,
    hasAdvancedAnalytics: true,
    hasPrioritizedSearch: true,
    canHighlightProfile: true,
    canUseVideoGallery: true,
    hasReviewBadge: true,
    hasMultipleCategories: true,
    commissionPercentage: 1,
  },
];

async function seedTiers() {
  const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const db = drizzle(client);

  try {
    console.log("🌱 Starting subscription tiers seed...");

    // Check if tiers already exist
    const existing = await db.select().from(subscriptionTiers);
    if (existing.length > 0) {
      console.log("⚠️  Tiers already exist. Skipping seed.");
      await client.end();
      return;
    }

    // Insert tiers
    for (const tier of DEFAULT_TIERS) {
      const [created] = await db.insert(subscriptionTiers).values(tier).returning();
      console.log(`✅ Created tier: ${created.displayName} (${created.priceNok} NOK/mnd)`);
    }

    console.log("🎉 Subscription tiers seed completed!");
    console.log("\nTiers created:");
    DEFAULT_TIERS.forEach((t) => {
      console.log(`  • ${t.displayName}: ${t.priceNok} NOK/month`);
    });
    await client.end();
  } catch (error) {
    console.error("❌ Error seeding tiers:", error);
    await client.end();
    throw error;
  }
}

// Run the seed
seedTiers()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
