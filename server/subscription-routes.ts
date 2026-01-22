import { Request, Response, Express } from "express";
import { db } from "./db";
import { eq, and, sql } from "drizzle-orm";
import { subscriptionTiers, vendorSubscriptions, vendorUsageMetrics, vendorPayments, vendors, vendorSessions } from "@shared/schema";
import * as vippsService from "./vipps-service";
import crypto from "crypto";

// Helper to check vendor authentication
async function checkVendorAuth(req: Request, res: Response): Promise<string | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Ikke autorisert" });
    return null;
  }
  const token = authHeader.replace("Bearer ", "");
  
  const [vendorSession] = await db.select({ vendorId: vendorSessions.vendorId })
    .from(vendorSessions)
    .where(and(
      eq(vendorSessions.token, token),
      sql`${vendorSessions.expiresAt} > NOW()`
    ));
  
  if (!vendorSession) {
    res.status(401).json({ error: "Økt utløpt. Vennligst logg inn på nytt." });
    return null;
  }

  const [vendor] = await db.select().from(vendors).where(eq(vendors.id, vendorSession.vendorId));
  if (!vendor || vendor.status !== "approved") {
    res.status(401).json({ error: "Ikke autorisert" });
    return null;
  }

  return vendorSession.vendorId;
}

// Helper function to get vendor's current subscription
export async function getVendorSubscription(vendorId: string) {
  const [subscription] = await db
    .select()
    .from(vendorSubscriptions)
    .where(
      and(
        eq(vendorSubscriptions.vendorId, vendorId),
        eq(vendorSubscriptions.status, "active")
      )
    );
  
  return subscription;
}

// Helper function to get tier details
export async function getTierDetails(tierId: string) {
  const [tier] = await db
    .select()
    .from(subscriptionTiers)
    .where(eq(subscriptionTiers.id, tierId));
  
  return tier;
}

// Helper function to get current usage for month
export async function getCurrentMonthUsage(vendorId: string) {
  const now = new Date();
  const [usage] = await db
    .select()
    .from(vendorUsageMetrics)
    .where(
      and(
        eq(vendorUsageMetrics.vendorId, vendorId),
        eq(vendorUsageMetrics.year, now.getFullYear()),
        eq(vendorUsageMetrics.month, now.getMonth() + 1)
      )
    );
  
  if (!usage) {
    // Create new usage record for this month
    const [newUsage] = await db
      .insert(vendorUsageMetrics)
      .values({
        vendorId,
        year: now.getFullYear(),
        month: now.getMonth() + 1,
      })
      .returning();
    return newUsage;
  }
  
  return usage;
}

export function registerSubscriptionRoutes(app: Express) {
  // ===== SUBSCRIPTION ROUTES =====

  // Vendor: Get available subscription tiers
  app.get("/api/vendor/subscription/tiers", async (req: Request, res: Response) => {
    try {
      const tiers = await db
        .select()
        .from(subscriptionTiers)
        .where(eq(subscriptionTiers.isActive, true))
        .orderBy(subscriptionTiers.sortOrder);
      
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching subscription tiers:", error);
      res.status(500).json({ error: "Kunne ikke hente abonnementsalternativer" });
    }
  });

  // Vendor: Get current subscription details
  app.get("/api/vendor/subscription/current", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const subscription = await getVendorSubscription(vendorId);
      if (!subscription) {
        return res.json({ subscription: null, message: "Ingen aktiv abonnement" });
      }

      const tier = await getTierDetails(subscription.tierId);
      const usage = await getCurrentMonthUsage(vendorId);

      res.json({
        subscription,
        tier,
        usage,
      });
    } catch (error) {
      console.error("Error fetching current subscription:", error);
      res.status(500).json({ error: "Kunne ikke hente abonnement" });
    }
  });

  // Vendor: Check feature access
  app.post("/api/vendor/subscription/check-feature", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { feature } = req.body; // e.g., "advanced_analytics", "api_access"
      
      const subscription = await getVendorSubscription(vendorId);
      if (!subscription) {
        return res.json({ hasAccess: false, reason: "Ingen aktiv abonnement" });
      }

      const tier = await getTierDetails(subscription.tierId);
      if (!tier) {
        return res.json({ hasAccess: false, reason: "Tier ikke funnet" });
      }

      const featureAccess: Record<string, boolean> = {
        send_messages: tier.canSendMessages,
        receive_inquiries: tier.canReceiveInquiries,
        create_offers: tier.canCreateOffers,
        create_deliveries: tier.canCreateDeliveries,
        showcase_work: tier.canShowcaseWork,
        advanced_analytics: tier.hasAdvancedAnalytics,
        prioritized_search: tier.hasPrioritizedSearch,
        highlight_profile: tier.canHighlightProfile,
        video_gallery: tier.canUseVideoGallery,
        review_badge: tier.hasReviewBadge,
        multiple_categories: tier.hasMultipleCategories,
      };

      const hasAccess = featureAccess[feature] ?? false;
      res.json({ hasAccess, feature, tier: tier.name });
    } catch (error) {
      console.error("Error checking feature access:", error);
      res.status(500).json({ error: "Kunne ikke sjekke feature-tilgang" });
    }
  });

  // Vendor: Check usage limits
  app.get("/api/vendor/subscription/usage-limits", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const subscription = await getVendorSubscription(vendorId);
      if (!subscription) {
        return res.json({ limits: null, usage: null });
      }

      const tier = await getTierDetails(subscription.tierId);
      const usage = await getCurrentMonthUsage(vendorId);

      const limits = {
        maxInspirationPhotos: tier?.maxInspirationPhotos ?? 10,
        maxProducts: tier?.maxProducts ?? 5,
        maxMonthlyOffers: tier?.maxMonthlyOffers ?? 10,
        maxMonthlyDeliveries: tier?.maxMonthlyDeliveries ?? 5,
        maxStorageGb: tier?.maxStorageGb ?? 5,
      };

      const usage_data = {
        inspirationPhotosUploaded: usage?.inspirationPhotosUploaded ?? 0,
        videoMinutesUsed: usage?.videoMinutesUsed ?? 0,
        storageUsedGb: usage?.storageUsedGb ?? 0,
        profileViewsCount: usage?.profileViewsCount ?? 0,
        messagesSent: usage?.messagesSent ?? 0,
      };

      const available = {
        inspirationPhotos: Math.max(
          0,
          (limits.maxInspirationPhotos === -1 
            ? 999999 
            : limits.maxInspirationPhotos) - (usage_data.inspirationPhotosUploaded ?? 0)
        ),
        products: Math.max(0, limits.maxProducts),
        offers: Math.max(0, limits.maxMonthlyOffers),
        deliveries: Math.max(0, limits.maxMonthlyDeliveries),
        storageGb: Math.max(
          0,
          limits.maxStorageGb - (usage_data.storageUsedGb ?? 0)
        ),
      };

      res.json({ limits, usage: usage_data, available });
    } catch (error) {
      console.error("Error fetching usage limits:", error);
      res.status(500).json({ error: "Kunne ikke hente bruksgrenser" });
    }
  });

  // Vendor: Update usage metric
  app.post("/api/vendor/subscription/track-usage", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { metric, amount = 1 } = req.body; // metric: "inspiration_photos", "video_minutes", etc.
      
      const usage = await getCurrentMonthUsage(vendorId);
      if (!usage) {
        return res.status(500).json({ error: "Kunne ikke få bruksdata" });
      }

      const updateData: any = { updatedAt: new Date() };
      
      switch (metric) {
        case "inspiration_photos":
          updateData.inspirationPhotosUploaded = (usage.inspirationPhotosUploaded ?? 0) + amount;
          break;
        case "video_minutes":
          updateData.videoMinutesUsed = (usage.videoMinutesUsed ?? 0) + amount;
          break;
        case "storage_gb":
          updateData.storageUsedGb = (usage.storageUsedGb ?? 0) + amount;
          break;
        case "profile_views":
          updateData.profileViewsCount = (usage.profileViewsCount ?? 0) + amount;
          break;
        case "messages":
          updateData.messagesSent = (usage.messagesSent ?? 0) + amount;
          break;
        default:
          return res.status(400).json({ error: "Ukjent metrikk" });
      }

      const [updated] = await db
        .update(vendorUsageMetrics)
        .set(updateData)
        .where(eq(vendorUsageMetrics.id, usage.id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error tracking usage:", error);
      res.status(500).json({ error: "Kunne ikke registrere bruk" });
    }
  });

  // Admin: Get all subscription tiers (for management)
  app.get("/api/admin/subscription/tiers", async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const adminKey = authHeader?.split(" ")[1];
    
    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }

    try {
      const tiers = await db
        .select()
        .from(subscriptionTiers)
        .orderBy(subscriptionTiers.sortOrder);
      
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching tiers:", error);
      res.status(500).json({ error: "Kunne ikke hente abonnementer" });
    }
  });

  // Admin: Create subscription tier
  app.post("/api/admin/subscription/tiers", async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const adminKey = authHeader?.split(" ")[1];
    
    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }

    try {
      const [tier] = await db
        .insert(subscriptionTiers)
        .values(req.body)
        .returning();
      
      res.status(201).json(tier);
    } catch (error: any) {
      console.error("Error creating tier:", error);
      res.status(400).json({ error: error.message || "Kunne ikke opprette abonnement" });
    }
  });

  // Admin: Update subscription tier
  app.patch("/api/admin/subscription/tiers/:id", async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const adminKey = authHeader?.split(" ")[1];
    
    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }

    try {
      const { id } = req.params;
      
      const [tier] = await db
        .update(subscriptionTiers)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(subscriptionTiers.id, id))
        .returning();
      
      if (!tier) {
        return res.status(404).json({ error: "Abonnement ikke funnet" });
      }

      res.json(tier);
    } catch (error: any) {
      console.error("Error updating tier:", error);
      res.status(400).json({ error: error.message || "Kunne ikke oppdatere abonnement" });
    }
  });

  // Admin: Get vendor subscriptions
  app.get("/api/admin/subscription/vendors", async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const adminKey = authHeader?.split(" ")[1];
    
    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }

    try {
      const subs = await db
        .select({
          subscription: vendorSubscriptions,
          vendor: vendors,
          tier: subscriptionTiers,
        })
        .from(vendorSubscriptions)
        .innerJoin(vendors, eq(vendorSubscriptions.vendorId, vendors.id))
        .innerJoin(subscriptionTiers, eq(vendorSubscriptions.tierId, subscriptionTiers.id));
      
      res.json(subs);
    } catch (error) {
      console.error("Error fetching vendor subscriptions:", error);
      res.status(500).json({ error: "Kunne ikke hente abonnementer" });
    }
  });

  // Admin: Get vendor usage statistics
  app.get("/api/admin/subscription/usage/:vendorId", async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const adminKey = authHeader?.split(" ")[1];
    
    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }

    try {
      const { vendorId } = req.params;
      const usage = await db
        .select()
        .from(vendorUsageMetrics)
        .where(eq(vendorUsageMetrics.vendorId, vendorId));
      
      res.json(usage);
    } catch (error) {
      console.error("Error fetching usage:", error);
      res.status(500).json({ error: "Kunne ikke hente bruksdata" });
    }
  });

  // Admin: Get vendor payments
  app.get("/api/admin/subscription/payments/:vendorId", async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const adminKey = authHeader?.split(" ")[1];
    
    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }

    try {
      const { vendorId } = req.params;
      const payments = await db
        .select()
        .from(vendorPayments)
        .where(eq(vendorPayments.vendorId, vendorId));
      
      res.json(payments);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ error: "Kunne ikke hente betalinger" });
    }
  });

  // ===== PAYMENT ENDPOINTS =====

  // Vendor: Initiate VIPPS payment for subscription
  app.post("/api/vendor/subscription/checkout", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { tierId } = req.body;

      // Get tier details
      const tier = await getTierDetails(tierId);
      if (!tier) {
        return res.status(404).json({ error: "Tier ikke funnet" });
      }

      // Find existing subscription for this vendor
      const [subscription] = await db.select()
        .from(vendorSubscriptions)
        .where(eq(vendorSubscriptions.vendorId, vendorId))
        .limit(1);

      // Generate order ID
      const orderId = `WF-${vendorId.substring(0, 8)}-${Date.now()}`;
      const now = new Date();
      const nextBillingDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

      // Create pending payment record
      const [payment] = await db
        .insert(vendorPayments)
        .values({
          vendorId,
          subscriptionId: subscription?.id, // Link to subscription
          amountNok: tier.priceNok * 100, // Convert to øre
          currency: "NOK",
          status: "pending",
          description: `${tier.displayName} subscription (monthly)`,
          billingPeriodStart: now,
          billingPeriodEnd: nextBillingDate,
        })
        .returning();

      // Initiate VIPPS payment
      const vippsPayment = await vippsService.initiateVIPPSPayment({
        orderId,
        amount: tier.priceNok * 100, // in øre
        description: `${tier.displayName} subscription`,
        vendorId,
        subscriptionTierId: tierId,
        billingPeriodStart: now,
        billingPeriodEnd: nextBillingDate,
      });

      // Store VIPPS order ID in payment record
      await db.update(vendorPayments)
        .set({ 
          stripePaymentIntentId: orderId,
          updatedAt: new Date()
        })
        .where(eq(vendorPayments.id, payment.id));

      res.json({
        paymentId: payment.id,
        paymentUrl: vippsPayment.paymentUrl,
        amount: tier.priceNok,
        tierName: tier.displayName,
      });
    } catch (error) {
      console.error("Error initiating payment:", error);
      res.status(500).json({ error: "Kunne ikke initialisere betaling" });
    }
  });

  // Vendor: Check payment status
  app.get("/api/vendor/subscription/payment-status/:orderId", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { orderId } = req.params;

      // Get payment record
      const [payment] = await db
        .select()
        .from(vendorPayments)
        .where(and(
          eq(vendorPayments.vendorId, vendorId),
          eq(vendorPayments.stripePaymentIntentId, orderId)
        ));

      if (!payment) {
        return res.status(404).json({ error: "Betaling ikke funnet" });
      }

      // Check status with VIPPS
      const vippsStatus = await vippsService.getVIPPSPaymentStatus(orderId);

      // Update payment status if changed
      if (vippsStatus.transactionStatus === "CAPTURED" && payment.status !== "succeeded") {
        await db.update(vendorPayments)
          .set({
            status: "succeeded",
            paidAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(vendorPayments.id, payment.id));
      } else if (vippsStatus.transactionStatus === "RESERVED" && payment.status === "pending") {
        // Payment reserved but not captured yet
        // Admin can capture later
      }

      res.json({
        status: payment.status,
        amount: payment.amountNok,
        vippsStatus: vippsStatus.transactionStatus,
        paidAt: payment.paidAt,
      });
    } catch (error) {
      console.error("Error checking payment status:", error);
      res.status(500).json({ error: "Kunne ikke hente betalingsstatus" });
    }
  });

  // Public: VIPPS Callback/Webhook
  app.post("/api/vipps/callback", async (req: Request, res: Response) => {
    try {
      const { orderId, transactionInfo } = req.body;
      const signature = req.headers["x-vipps-signature"] as string;

      // Verify webhook signature
      const authToken = process.env.VIPPS_AUTH_TOKEN || "";
      const bodyString = JSON.stringify(req.body);
      
      if (!vippsService.verifyVIPPSWebhookSignature(signature, bodyString, authToken)) {
        return res.status(401).json({ error: "Invalid signature" });
      }

      // Find payment by order ID
      const [payment] = await db
        .select()
        .from(vendorPayments)
        .where(eq(vendorPayments.stripePaymentIntentId, orderId));

      if (!payment) {
        console.warn(`Payment not found for order: ${orderId}`);
        return res.status(404).json({ error: "Payment not found" });
      }

      // Handle different transaction statuses
      const status = transactionInfo?.status || "UNKNOWN";

      if (status === "CAPTURED" || status === "RESERVED") {
        // Update payment status
        await db.update(vendorPayments)
          .set({
            status: "succeeded",
            paidAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(vendorPayments.id, payment.id));

        // Activate subscription if payment successful
        if (payment.subscriptionId) {
          const now = new Date();
          const nextBilling = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
          
          await db.update(vendorSubscriptions)
            .set({
              status: "active", // Activate subscription after successful payment
              currentPeriodStart: now,
              currentPeriodEnd: nextBilling,
              updatedAt: new Date(),
            })
            .where(eq(vendorSubscriptions.id, payment.subscriptionId));
          
          console.log(`Subscription ${payment.subscriptionId} activated for vendor ${payment.vendorId}`);
        }
        
        console.log(`Payment ${orderId} captured successfully`);
      } else if (status === "FAILED" || status === "ABORTED") {
        await db.update(vendorPayments)
          .set({
            status: "failed",
            failureReason: transactionInfo?.errorMessage || "Payment failed",
            updatedAt: new Date(),
          })
          .where(eq(vendorPayments.id, payment.id));

        console.log(`Payment ${orderId} failed: ${transactionInfo?.errorMessage}`);
      }

      // Return 200 OK to VIPPS
      res.json({ success: true, orderId });
    } catch (error) {
      console.error("Error processing VIPPS callback:", error);
      res.status(500).json({ error: "Callback processing failed" });
    }
  });

  // Admin: Capture reserved payment
  app.post("/api/admin/subscription/payments/:orderId/capture", async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const adminKey = authHeader?.split(" ")[1];

    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }

    try {
      const { orderId } = req.params;
      const { amount } = req.body;

      // Capture with VIPPS
      await vippsService.captureVIPPSPayment(orderId, amount * 100);

      // Update payment record
      await db.update(vendorPayments)
        .set({
          status: "succeeded",
          paidAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(vendorPayments.stripePaymentIntentId, orderId));

      res.json({ success: true, message: "Payment captured" });
    } catch (error) {
      console.error("Error capturing payment:", error);
      res.status(500).json({ error: "Kunne ikke hente betaling" });
    }
  });

  // Admin: Refund payment
  app.post("/api/admin/subscription/payments/:orderId/refund", async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    const adminKey = authHeader?.split(" ")[1];

    if (adminKey !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }

    try {
      const { orderId } = req.params;
      const { amount } = req.body;

      // Refund with VIPPS
      await vippsService.refundVIPPSPayment(orderId, amount * 100);

      // Update payment record
      await db.update(vendorPayments)
        .set({
          status: "refunded",
          updatedAt: new Date(),
        })
        .where(eq(vendorPayments.stripePaymentIntentId, orderId));

      res.json({ success: true, message: "Payment refunded" });
    } catch (error) {
      console.error("Error refunding payment:", error);
      res.status(500).json({ error: "Kunne ikke refundere betaling" });
    }
  });
}
