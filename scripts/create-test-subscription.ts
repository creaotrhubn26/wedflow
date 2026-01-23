import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";
import * as dotenv from "dotenv";
import { vendors, subscriptionTiers, vendorSubscriptions } from "../shared/schema";
import { eq } from "drizzle-orm";

// Load environment variables
dotenv.config({ path: ".env" });

async function createTestSubscription() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    const db = drizzle(client);

    console.log("🔍 Finding approved vendor...");
    const [vendor] = await db.select().from(vendors).where(eq(vendors.status, "approved")).limit(1);
    
    if (!vendor) {
      console.log("❌ No approved vendor found");
      return;
    }

    console.log(`✅ Found vendor: ${vendor.businessName || vendor.email}`);

    console.log("\n🔍 Finding active subscription tier...");
    const [tier] = await db.select().from(subscriptionTiers).where(eq(subscriptionTiers.isActive, true)).limit(1);
    
    if (!tier) {
      console.log("❌ No active subscription tier found. Run seed-subscription-tiers.ts first!");
      return;
    }

    console.log(`✅ Found tier: ${tier.displayName} (${tier.name})`);

    // Check if subscription already exists
    const existing = await db.select().from(vendorSubscriptions).where(eq(vendorSubscriptions.vendorId, vendor.id));
    
    if (existing.length > 0) {
      console.log(`\n⚠️  Vendor already has ${existing.length} subscription(s)`);
      console.log("Existing subscription status:", existing[0].status);
      return;
    }

    console.log("\n📝 Creating test subscription...");
    const now = new Date();
    const periodEnd = new Date();
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const [subscription] = await db.insert(vendorSubscriptions).values({
      vendorId: vendor.id,
      tierId: tier.id,
      status: "active",
      currentPeriodStart: now,
      currentPeriodEnd: periodEnd,
      autoRenew: true,
    }).returning();

    console.log("\n🎉 Test subscription created successfully!");
    console.log("Subscription ID:", subscription.id);
    console.log("Vendor:", vendor.businessName || vendor.email);
    console.log("Tier:", tier.displayName);
    console.log("Status:", subscription.status);
    console.log("Period:", `${subscription.currentPeriodStart.toISOString()} → ${subscription.currentPeriodEnd.toISOString()}`);

  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await client.end();
  }
}

createTestSubscription();
