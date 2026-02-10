import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";
import crypto from "node:crypto";
import { db } from "./db";
import bcrypt from "bcryptjs";
import { registerSubscriptionRoutes } from "./subscription-routes";
import { registerCreatorhubRoutes } from "./creatorhub-routes";
import { TIMELINE_TEMPLATES, DEFAULT_TIMELINE, TimelineTemplate, resolveTraditionKey } from "./timeline-templates";
import { vendors, vendorCategories, vendorRegistrationSchema, vendorSessions, deliveries, deliveryItems, createDeliverySchema, deliveryTracking, inspirationCategories, inspirations, inspirationMedia, createInspirationSchema, vendorFeatures, vendorInspirationCategories, inspirationInquiries, createInquirySchema, coupleProfiles, coupleSessions, conversations, messages, coupleLoginSchema, sendMessageSchema, reminders, createReminderSchema, vendorProducts, createVendorProductSchema, vendorOffers, vendorOfferItems, createOfferSchema, appSettings, speeches, createSpeechSchema, messageReminders, scheduleEvents, coordinatorInvitations, guestInvitations, createGuestInvitationSchema, coupleVendorContracts, notifications, activityLogs, weddingTables, weddingGuests, insertWeddingGuestSchema, updateWeddingGuestSchema, tableGuestAssignments, appFeedback, vendorReviews, vendorReviewResponses, checklistTasks, createChecklistTaskSchema, adminConversations, adminMessages, sendAdminMessageSchema, faqItems, insertFaqItemSchema, updateFaqItemSchema, insertAppSettingSchema, updateAppSettingSchema, whatsNewItems, insertWhatsNewSchema, updateWhatsNewSchema, videoGuides, insertVideoGuideSchema, updateVideoGuideSchema, vendorSubscriptions, subscriptionTiers, vendorCategoryDetails, vendorAvailability, createVendorAvailabilitySchema, coupleBudgetItems, coupleBudgetSettings, createBudgetItemSchema, coupleDressAppointments, coupleDressFavorites, coupleDressTimeline, createDressAppointmentSchema, createDressFavoriteSchema, coupleImportantPeople, createImportantPersonSchema, couplePhotoShots, createPhotoShotSchema, coupleHairMakeupAppointments, coupleHairMakeupLooks, coupleHairMakeupTimeline, coupleTransportBookings, coupleTransportTimeline, coupleFlowerAppointments, coupleFlowerSelections, coupleFlowerTimeline, coupleCateringTastings, coupleCateringMenu, coupleCateringDietaryNeeds, coupleCateringTimeline, coupleCakeTastings, coupleCakeDesigns, coupleCakeTimeline, coupleVenueBookings, coupleVenueTimelines, vendorVenueBookings, vendorVenueAvailability, vendorVenueTimelines, creatorhubProjects, couplePhotographerSessions, couplePhotographerShots, couplePhotographerTimeline, coupleVideographerSessions, coupleVideographerDeliverables, coupleVideographerTimeline, coupleMusicPerformances, coupleMusicSetlists, coupleMusicTimeline, couplePlannerMeetings, couplePlannerTasks, couplePlannerTimeline, weddingRoleInvitations } from "@shared/schema";
import { eq, and, desc, sql, inArray, or, gte, lte, isNotNull } from "drizzle-orm";

function generateAccessCode(): string {
  return crypto.randomBytes(8).toString("hex").toUpperCase();
}

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

interface VendorSession {
  vendorId: string;
  createdAt: Date;
  expiresAt: Date;
}

const VENDOR_SESSIONS: Map<string, VendorSession> = new Map();
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

interface CoupleSessionCache {
  coupleId: string;
  expiresAt: Date;
}
const COUPLE_SESSIONS: Map<string, CoupleSessionCache> = new Map();

function cleanExpiredSessions() {
  const now = new Date();
  for (const [token, session] of VENDOR_SESSIONS.entries()) {
    if (session.expiresAt < now) {
      VENDOR_SESSIONS.delete(token);
    }
  }
}

setInterval(cleanExpiredSessions, 60 * 60 * 1000);

const YR_CACHE: Map<string, { data: any; expires: Date }> = new Map();

function hashPassword(password: string): string {
  const salt = bcrypt.genSaltSync(10);
  return bcrypt.hashSync(password, salt);
}

function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

const DEFAULT_CATEGORIES = [
  { name: "Fotograf", icon: "camera", description: "Bryllupsfotografer" },
  { name: "Videograf", icon: "film", description: "Bryllupsvideofilmer" },
  { name: "Blomster", icon: "flower", description: "Blomsterdekoratører" },
  { name: "Catering", icon: "coffee", description: "Mat og drikke" },
  { name: "Musikk", icon: "music", description: "Band, DJ og musikere" },
  { name: "Venue", icon: "venue", description: "Bryllupslokaler" },
  { name: "Kake", icon: "cake", description: "Bryllupskaker" },
  { name: "Planlegger", icon: "clipboard", description: "Bryllupsplanleggere" },
  { name: "Hår & Makeup", icon: "scissors", description: "Styling og sminke" },
  { name: "Transport", icon: "car", description: "Bryllupstransport" },
  { name: "Invitasjoner", icon: "mail", description: "Invitasjoner og trykkeri" },
  { name: "Underholdning", icon: "sparkles", description: "Artister og show" },
  { name: "Dekorasjon", icon: "star", description: "Dekorasjon og pynt" },
  { name: "Konfektyrer", icon: "gift", description: "Sjokolade og godteri" },
  { name: "Bar & Drikke", icon: "cocktail", description: "Bartjenester og drikke" },
  { name: "Fotoboks", icon: "aperture", description: "Fotoboks og moro" },
  { name: "Ringer", icon: "diamond", description: "Vielsesringer og smykker" },
  { name: "Drakt & Dress", icon: "suit", description: "Brudgom antrekk" },
  { name: "Overnatting", icon: "bed", description: "Hotell og overnatting" },
  { name: "Husdyr", icon: "heart", description: "Kjæledyr på bryllupet" },
];

const DEFAULT_INSPIRATION_CATEGORIES = [
  { name: "Brudekjoler", icon: "heart", sortOrder: 1 },
  { name: "Blomsterarrangementer", icon: "flower", sortOrder: 2 },
  { name: "Dekorasjon", icon: "star", sortOrder: 3 },
  { name: "Bryllupskaker", icon: "cake", sortOrder: 4 },
  { name: "Lokaler", icon: "home", sortOrder: 5 },
  { name: "Borddekning", icon: "utensils", sortOrder: 6 },
  { name: "Brudebukett", icon: "gift", sortOrder: 7 },
  { name: "Hårfrisyrer", icon: "scissors", sortOrder: 8 },
  { name: "Bryllupsbilder", icon: "camera", sortOrder: 9 },
  { name: "Invitasjoner", icon: "mail", sortOrder: 10 },
];

async function fetchYrWeather(lat: number, lon: number): Promise<any> {
  const cacheKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;
  const cached = YR_CACHE.get(cacheKey);
  
  if (cached && cached.expires > new Date()) {
    return cached.data;
  }

  const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat.toFixed(4)}&lon=${lon.toFixed(4)}`;
  
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Wedflow/1.0 https://replit.com",
    },
  });

  if (!response.ok) {
    throw new Error(`YR API error: ${response.status}`);
  }

  const data = await response.json();
  
  const expiresHeader = response.headers.get("Expires");
  const expires = expiresHeader ? new Date(expiresHeader) : new Date(Date.now() + 3600000);
  
  YR_CACHE.set(cacheKey, { data, expires });
  
  return data;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // --- Realtime (WebSocket) setup state ---
  const adminConvClients: Map<string, Set<WebSocket>> = new Map();
  const adminListClients: Set<WebSocket> = new Set();
  const conversationClients: Map<string, Set<WebSocket>> = new Map();
  const vendorListClients: Map<string, Set<WebSocket>> = new Map();
  const coupleListClients: Map<string, Set<WebSocket>> = new Map();

  async function checkVendorToken(token: string): Promise<string | null> {
    const [vendorSession] = await db
      .select({ vendorId: vendorSessions.vendorId })
      .from(vendorSessions)
      .where(and(eq(vendorSessions.token, token), sql`${vendorSessions.expiresAt} > NOW()`));
    if (!vendorSession) return null;
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, vendorSession.vendorId));
    if (!vendor || vendor.status !== "approved") return null;
    return vendorSession.vendorId;
  }

  async function getOrCreateAdminConversationId(vendorId: string): Promise<string> {
    const existing = await db.select().from(adminConversations).where(eq(adminConversations.vendorId, vendorId));
    if (existing[0]) return existing[0].id;
    const [created] = await db.insert(adminConversations).values({ vendorId }).returning();
    return created.id;
  }

  function broadcastAdminConv(conversationId: string, data: unknown) {
    const set = adminConvClients.get(conversationId);
    if (!set) return;
    const payload = JSON.stringify(data);
    for (const ws of Array.from(set)) {
      try {
        if ((ws as any).readyState === 1) ws.send(payload);
        else set.delete(ws);
      } catch {
        set.delete(ws);
      }
    }
  }

  function broadcastAdminList(data: unknown) {
    const payload = JSON.stringify(data);
    for (const ws of Array.from(adminListClients)) {
      try {
        if ((ws as any).readyState === 1) ws.send(payload);
        else adminListClients.delete(ws);
      } catch {
        adminListClients.delete(ws);
      }
    }
  }

  async function checkCoupleToken(token: string): Promise<string | null> {
    const [sess] = await db
      .select({ coupleId: coupleSessions.coupleId })
      .from(coupleSessions)
      .where(and(eq(coupleSessions.token, token), sql`${coupleSessions.expiresAt} > NOW()`));
    if (!sess) return null;
    const [couple] = await db.select().from(coupleProfiles).where(eq(coupleProfiles.id, sess.coupleId));
    if (!couple) return null;
    return sess.coupleId;
  }

  function broadcastConversation(conversationId: string, data: unknown) {
    const set = conversationClients.get(conversationId);
    if (!set) return;
    const payload = JSON.stringify(data);
    for (const ws of Array.from(set)) {
      try {
        if ((ws as any).readyState === 1) ws.send(payload);
        else set.delete(ws);
      } catch {
        set.delete(ws);
      }
    }
  }

  function broadcastVendorList(vendorId: string, data: unknown) {
    const set = vendorListClients.get(vendorId);
    if (!set) return;
    const payload = JSON.stringify(data);
    for (const ws of Array.from(set)) {
      try {
        if ((ws as any).readyState === 1) ws.send(payload);
        else set.delete(ws);
      } catch {
        set.delete(ws);
      }
    }
  }

  function broadcastCoupleList(coupleId: string, data: unknown) {
    const set = coupleListClients.get(coupleId);
    if (!set) return;
    const payload = JSON.stringify(data);
    for (const ws of Array.from(set)) {
      try {
        if ((ws as any).readyState === 1) ws.send(payload);
        else set.delete(ws);
      } catch {
        set.delete(ws);
      }
    }
  }

  // Diagnostic endpoint to check server health and environment
  app.get("/api/diagnostics", (req: Request, res: Response) => {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        HAS_DATABASE_URL: !!process.env.DATABASE_URL,
        HAS_ADMIN_SECRET: !!process.env.ADMIN_SECRET,
        ADMIN_SECRET_VALUE: process.env.ADMIN_SECRET || "NOT SET",
      },
      node_version: process.version,
      build_version: "ch-full-access",
    };
    res.json(diagnostics);
  });

  // Test endpoint to debug query issues
  app.get("/api/test-query/:id", async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      console.log("[TestQuery] Testing query with ID:", id);
      
      const result = await db.select({
        id: coupleProfiles.id,
        email: coupleProfiles.email,
        displayName: coupleProfiles.displayName,
      }).from(coupleProfiles).where(eq(coupleProfiles.id, id));
      
      console.log("[TestQuery] Success, found:", result.length);
      res.json({ success: true, data: result });
    } catch (error) {
      console.error("[TestQuery] Error:", error);
      res.status(500).json({ error: "Query failed", details: error instanceof Error ? error.message : String(error) });
    }
  });

  app.get("/api/weather", async (req: Request, res: Response) => {
    try {
      const lat = parseFloat(req.query.lat as string);
      const lon = parseFloat(req.query.lon as string);

      if (isNaN(lat) || isNaN(lon)) {
        return res.status(400).json({ error: "Missing or invalid lat/lon parameters" });
      }

      const weatherData = await fetchYrWeather(lat, lon);
      
      const timeseries = weatherData.properties?.timeseries || [];
      const now = timeseries[0];
      const next6Hours = timeseries.slice(0, 6);
      const next24Hours = timeseries.slice(0, 24);

      const forecast = {
        current: now ? {
          time: now.time,
          temperature: now.data?.instant?.details?.air_temperature,
          windSpeed: now.data?.instant?.details?.wind_speed,
          humidity: now.data?.instant?.details?.relative_humidity,
          symbol: now.data?.next_1_hours?.summary?.symbol_code || now.data?.next_6_hours?.summary?.symbol_code,
          precipitation: now.data?.next_1_hours?.details?.precipitation_amount || 0,
        } : null,
        hourly: next6Hours.map((t: any) => ({
          time: t.time,
          temperature: t.data?.instant?.details?.air_temperature,
          symbol: t.data?.next_1_hours?.summary?.symbol_code || t.data?.next_6_hours?.summary?.symbol_code,
          precipitation: t.data?.next_1_hours?.details?.precipitation_amount || 0,
        })),
        daily: next24Hours
          .filter((_: any, i: number) => i % 6 === 0)
          .map((t: any) => ({
            time: t.time,
            temperature: t.data?.instant?.details?.air_temperature,
            symbol: t.data?.next_6_hours?.summary?.symbol_code,
            precipitationMax: t.data?.next_6_hours?.details?.precipitation_amount || 0,
          })),
      };

      res.json(forecast);
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({ error: "Failed to fetch weather data" });
    }
  });

  // ── Weather/Location Bridge Proxy → CreatorHub backend ──────────────────────
  // Proxies /api/wedflow/weather-location/* to CreatorHub API for couples
  const CREATORHUB_BRIDGE_URL = process.env.CREATORHUB_API_URL || 'http://localhost:3001';

  app.all("/api/wedflow/weather-location/*", async (req: Request, res: Response) => {
    try {
      const targetUrl = `${CREATORHUB_BRIDGE_URL}${req.originalUrl}`;
      const fetchOptions: RequestInit = {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          ...(req.headers.authorization ? { 'Authorization': req.headers.authorization as string } : {}),
        },
      };
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
        fetchOptions.body = JSON.stringify(req.body);
      }
      const response = await fetch(targetUrl, fetchOptions);
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error('Weather-location bridge proxy error:', error);
      res.status(502).json({ error: 'Bridge proxy feil — CreatorHub API ikke tilgjengelig' });
    }
  });

  // ── Vendor Location Intelligence endpoint ──────────────────────────────────
  // GET /api/vendors/:vendorId/travel-from-venue
  // Calculates travel time from couple's wedding venue to a vendor location
  app.get("/api/vendors/:vendorId/travel-from-venue", async (req: Request, res: Response) => {
    try {
      const { vendorId } = req.params;
      const coupleId = req.query.coupleId as string;

      if (!coupleId) {
        return res.status(400).json({ error: 'coupleId er påkrevd' });
      }

      // Get vendor location from DB
      const vendorResult = await db.execute(
        sql`SELECT id, business_name, location FROM vendors WHERE id = ${vendorId}`
      );
      const vendor = (vendorResult as any).rows?.[0];
      if (!vendor || !vendor.location) {
        return res.status(404).json({ error: 'Leverandør ikke funnet eller mangler lokasjon' });
      }

      // Proxy the travel calculation through the CreatorHub bridge
      // The bridge endpoint takes a city/location name and calculates travel from venue
      const travelUrl = `${CREATORHUB_BRIDGE_URL}/api/wedflow/weather-location/${coupleId}/travel?fromCity=${encodeURIComponent(vendor.location)}`;
      const travelResponse = await fetch(travelUrl);
      
      if (!travelResponse.ok) {
        const err = await travelResponse.json().catch(() => ({}));
        return res.status(travelResponse.status).json(err);
      }

      const travelData = await travelResponse.json();
      res.json({
        vendorId,
        vendorName: vendor.business_name,
        vendorLocation: vendor.location,
        ...travelData,
      });
    } catch (error) {
      console.error('Vendor travel calculation error:', error);
      res.status(500).json({ error: 'Feil ved beregning av reisetid til leverandør' });
    }
  });

  // ── Enhanced weather endpoint with travel time calculation ──────────────────
  // GET /api/weather/travel — Calculate travel time between two points  
  app.get("/api/weather/travel", async (req: Request, res: Response) => {
    try {
      const fromLat = parseFloat(req.query.fromLat as string);
      const fromLon = parseFloat(req.query.fromLon as string);
      const toLat = parseFloat(req.query.toLat as string);
      const toLon = parseFloat(req.query.toLon as string);

      if (isNaN(fromLat) || isNaN(fromLon) || isNaN(toLat) || isNaN(toLon)) {
        return res.status(400).json({ error: 'Oppgi fromLat, fromLon, toLat, toLon' });
      }

      // Great-circle distance + road factor
      const R = 6371;
      const dLat = (toLat - fromLat) * Math.PI / 180;
      const dLon = (toLon - fromLon) * Math.PI / 180;
      const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) *
        Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const straightLine = R * c;
      const roadDistance = straightLine * 1.35;
      const drivingMinutes = Math.round(roadDistance / 70 * 60);

      // Fetch weather at both locations
      const [fromWeather, toWeather] = await Promise.all([
        fetchYrWeather(fromLat, fromLon).catch(() => null),
        fetchYrWeather(toLat, toLon).catch(() => null),
      ]);

      const getWeatherSummary = (data: any) => {
        const now = data?.properties?.timeseries?.[0];
        return now ? {
          temperature: now.data?.instant?.details?.air_temperature,
          windSpeed: now.data?.instant?.details?.wind_speed,
          symbol: now.data?.next_1_hours?.summary?.symbol_code || now.data?.next_6_hours?.summary?.symbol_code,
          precipitation: now.data?.next_1_hours?.details?.precipitation_amount || 0,
        } : null;
      };

      res.json({
        travel: {
          straightLineKm: Math.round(straightLine * 10) / 10,
          roadDistanceKm: Math.round(roadDistance * 10) / 10,
          drivingMinutes,
          drivingFormatted: drivingMinutes >= 60
            ? `${Math.floor(drivingMinutes / 60)}t ${drivingMinutes % 60}min`
            : `${drivingMinutes} min`,
          fuelCostNok: Math.round(roadDistance * 1.8 * 10) / 10,
        },
        from: { lat: fromLat, lon: fromLon, weather: getWeatherSummary(fromWeather) },
        to: { lat: toLat, lon: toLon, weather: getWeatherSummary(toWeather) },
      });
    } catch (error) {
      console.error('Travel calculation error:', error);
      res.status(500).json({ error: 'Kunne ikke beregne reisetid' });
    }
  });

  async function seedCategories() {
    const existing = await db.select().from(vendorCategories);
    if (existing.length === 0) {
      await db.insert(vendorCategories).values(DEFAULT_CATEGORIES);
      console.log("Seeded vendor categories");
    }
  }

  async function seedInspirationCategories() {
    const existing = await db.select().from(inspirationCategories);
    if (existing.length === 0) {
      await db.insert(inspirationCategories).values(DEFAULT_INSPIRATION_CATEGORIES);
      console.log("Seeded inspiration categories");
    }
  }

  seedCategories().catch(console.error);
  seedInspirationCategories().catch(console.error);

  // Brreg.no business search endpoint
  app.get("/api/brreg/search", async (req: Request, res: Response) => {
    try {
      const { q } = req.query;
      if (!q || typeof q !== "string" || q.length < 2) {
        return res.json({ entities: [] });
      }

      const brregUrl = `https://data.brreg.no/enhetsregisteret/api/enheter?navn=${encodeURIComponent(q)}&size=10`;
      const response = await fetch(brregUrl, {
        headers: {
          "Accept": "application/json",
        },
      });

      if (!response.ok) {
        console.error("Brreg API error:", response.status);
        return res.json({ entities: [] });
      }

      const data = await response.json();
      const entities = data._embedded?.enheter || [];

      const formattedEntities = entities.map((entity: any) => ({
        organizationNumber: entity.organisasjonsnummer,
        name: entity.navn,
        organizationForm: entity.organisasjonsform?.beskrivelse,
        address: entity.forretningsadresse ? {
          street: entity.forretningsadresse.adresse?.join(", "),
          postalCode: entity.forretningsadresse.postnummer,
          city: entity.forretningsadresse.poststed,
          municipality: entity.forretningsadresse.kommune,
        } : null,
      }));

      res.json({ entities: formattedEntities });
    } catch (error) {
      console.error("Error searching brreg:", error);
      res.json({ entities: [] });
    }
  });

  app.get("/api/vendor-categories", async (_req: Request, res: Response) => {
    try {
      const categories = await db.select().from(vendorCategories);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Kunne ikke hente kategorier" });
    }
  });

  // Public endpoint to get subscription tiers (for vendor registration)
  app.get("/api/subscription/tiers", async (_req: Request, res: Response) => {
    try {
      const { subscriptionTiers } = await import("@shared/schema");
      const tiers = await db.select()
        .from(subscriptionTiers)
        .where(eq(subscriptionTiers.isActive, true))
        .orderBy(subscriptionTiers.sortOrder);
      res.json(tiers);
    } catch (error) {
      console.error("Error fetching subscription tiers:", error);
      res.status(500).json({ error: "Kunne ikke hente abonnement" });
    }
  });

  // Endpoint to check and update expired trials (should be called by cron job)
  app.post("/api/admin/subscriptions/check-expired-trials", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      const { vendorSubscriptions } = await import("@shared/schema");
      const now = new Date();
      
      // Find all trialing subscriptions that have expired
      const expiredTrials = await db.select()
        .from(vendorSubscriptions)
        .where(
          and(
            eq(vendorSubscriptions.status, "trialing"),
            sql`${vendorSubscriptions.currentPeriodEnd} < ${now}`
          )
        );

      // Update expired trials to paused status
      if (expiredTrials.length > 0) {
        await db.update(vendorSubscriptions)
          .set({ 
            status: "paused",
            pausedUntil: sql`${vendorSubscriptions.currentPeriodEnd} + interval '365 days'`, // Pause for 1 year
            updatedAt: now,
          })
          .where(
            and(
              eq(vendorSubscriptions.status, "trialing"),
              sql`${vendorSubscriptions.currentPeriodEnd} < ${now}`
            )
          );

        // Send payment reminder notifications to vendors
        for (const sub of expiredTrials) {
          // Get vendor info
          const [vendor] = await db.select().from(vendors).where(eq(vendors.id, sub.vendorId));
          if (!vendor) continue;

          // Create in-app notification
          await db.insert(notifications).values({
            recipientType: "vendor",
            recipientId: sub.vendorId,
            type: "payment_required",
            title: "Betaling påkrevd",
            body: "Din 30-dagers prøveperiode har utløpt. Betal for å fortsette å bruke Wedflow og motta henvendelser fra brudepar.",
            sentVia: "in_app",
          });

          // TODO: Send email notification
          console.log(`Trial expired for vendor ${vendor.email} - notification created`);
        }
      }

      res.json({ 
        message: "Sjekket utløpte prøveperioder",
        expiredCount: expiredTrials.length 
      });
    } catch (error) {
      console.error("Error checking expired trials:", error);
      res.status(500).json({ error: "Kunne ikke sjekke utløpte prøveperioder" });
    }
  });

  // Endpoint to send trial reminder emails (7, 3, 1 days before expiry)
  app.post("/api/admin/subscriptions/send-trial-reminders", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      const { vendorSubscriptions, subscriptionTiers } = await import("@shared/schema");
      const now = new Date();
      const reminderDays = [7, 3, 1]; // Days before expiry to send reminders
      
      let sentCount = 0;

      for (const days of reminderDays) {
        const targetDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
        const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

        // Find trials expiring on this target date
        const expiringTrials = await db.select({
          subscription: vendorSubscriptions,
          tier: subscriptionTiers,
          vendor: vendors,
        })
        .from(vendorSubscriptions)
        .innerJoin(subscriptionTiers, eq(vendorSubscriptions.tierId, subscriptionTiers.id))
        .innerJoin(vendors, eq(vendorSubscriptions.vendorId, vendors.id))
        .where(
          and(
            eq(vendorSubscriptions.status, "trialing"),
            sql`${vendorSubscriptions.currentPeriodEnd}::date = ${startOfDay}::date`
          )
        );

        for (const { subscription, tier, vendor } of expiringTrials) {
          // Create notification with FOMO messaging
          let title = "";
          let body = "";
          
          if (days === 7) {
            title = "7 dager til prøveperioden utløper";
            body = `Ikke gå glipp av henvendelser! Showcase-galleriet, meldinger og nye leads deaktiveres om en uke.\n\nSikre din plass for kun ${tier.priceNok} NOK/mnd.`;
          } else if (days === 3) {
            title = "Siste sjanse - 3 dager igjen!";
            body = `Om 3 dager mister du tilgang til alle funksjoner:\n• Showcase-galleriet\n• Aktive samtaler\n• Nye henvendelser\n• Statistikk\n\nBetal nå: ${tier.priceNok} NOK/mnd`;
          } else if (days === 1) {
            title = "SISTE DAG - Prøveperioden utløper i morgen!";
            body = `I morgen går du glipp av potensielle kunder!\n\nSikre tilgang nå for ${tier.priceNok} NOK/mnd og fortsett å motta henvendelser.`;
          }

          await db.insert(notifications).values({
            recipientType: "vendor",
            recipientId: vendor.id,
            type: "trial_reminder",
            title,
            body,
            sentVia: "in_app",
          });

          // TODO: Send email
          console.log(`Sent ${days}-day reminder to ${vendor.email}`);
          sentCount++;
        }
      }

      res.json({ 
        message: "Sendte prøveperiode-påminnelser",
        sentCount 
      });
    } catch (error) {
      console.error("Error sending trial reminders:", error);
      res.status(500).json({ error: "Kunne ikke sende påminnelser" });
    }
  });

  app.post("/api/vendors/register", async (req: Request, res: Response) => {
    try {
      const { tierId, ...restData } = req.body;
      const validation = vendorRegistrationSchema.safeParse(restData);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Ugyldig data", 
          details: validation.error.errors 
        });
      }

      const { email, password, ...profileData } = validation.data;

      const existingVendor = await db.select().from(vendors).where(eq(vendors.email, email));
      if (existingVendor.length > 0) {
        return res.status(400).json({ error: "E-postadressen er allerede registrert" });
      }

      const hashedPassword = hashPassword(password);

      const [newVendor] = await db.insert(vendors).values({
        email,
        password: hashedPassword,
        businessName: profileData.businessName,
        organizationNumber: profileData.organizationNumber || null,
        categoryId: profileData.categoryId,
        description: profileData.description || null,
        location: profileData.location || null,
        phone: profileData.phone || null,
        website: profileData.website || null,
        priceRange: profileData.priceRange || null,
      }).returning();

      // Create trial subscription if tierId is provided
      if (tierId) {
        const now = new Date();
        const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days trial
        
        await db.insert(vendorSubscriptions)
          .values({
            vendorId: newVendor.id,
            tierId: tierId,
            status: "trialing",
            currentPeriodStart: now,
            currentPeriodEnd: trialEnd,
            autoRenew: true,
          })
          .onConflictDoNothing();
      }

      const { password: _, ...vendorWithoutPassword } = newVendor;
      res.status(201).json({ 
        message: "Registrering vellykket! Din søknad er under behandling. Du får 30 dager gratis prøveperiode.",
        vendor: vendorWithoutPassword 
      });
    } catch (error) {
      console.error("Error registering vendor:", error);
      res.status(500).json({ error: "Kunne ikke registrere leverandør" });
    }
  });

  app.post("/api/vendors/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "E-post og passord er påkrevd" });
      }

      const [vendor] = await db.select().from(vendors).where(eq(vendors.email, email));
      if (!vendor) {
        return res.status(401).json({ error: "Ugyldig e-post eller passord" });
      }

      if (!verifyPassword(password, vendor.password)) {
        return res.status(401).json({ error: "Ugyldig e-post eller passord" });
      }

      const sessionToken = generateSessionToken();
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
      
      await db.insert(vendorSessions).values({
        vendorId: vendor.id,
        token: sessionToken,
        expiresAt,
      });

      // Fetch vendor category
      let vendorCategory = null;
      if (vendor.categoryId) {
        const [category] = await db.select().from(vendorCategories).where(eq(vendorCategories.id, vendor.categoryId));
        vendorCategory = category?.name || null;
      }

      const { password: _, ...vendorWithoutPassword } = vendor;
      res.json({ vendor: vendorWithoutPassword, sessionToken, vendorCategory });
    } catch (error) {
      console.error("Error logging in vendor:", error);
      res.status(500).json({ error: "Kunne ikke logge inn" });
    }
  });

  // Google OAuth vendor login/registration
  app.post("/api/vendors/google-login", async (req: Request, res: Response) => {
    try {
      const { googleEmail, googleName, googleId } = req.body;

      if (!googleEmail || !googleName) {
        return res.status(400).json({ error: "Google informasjon mangler" });
      }

      // Check if vendor with this email exists
      const [existingVendor] = await db.select().from(vendors).where(eq(vendors.email, googleEmail));

      if (existingVendor) {
        // Vendor exists - check status
        if (existingVendor.status === "approved") {
          // Create session for approved vendor
          const sessionToken = generateSessionToken();
          const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
          
          await db.insert(vendorSessions).values({
            vendorId: existingVendor.id,
            token: sessionToken,
            expiresAt,
          });

          const { password: _, ...vendorWithoutPassword } = existingVendor;
          return res.json({ 
            vendor: vendorWithoutPassword, 
            sessionToken,
            status: "approved",
            message: "Velkommen tilbake!" 
          });
        } else if (existingVendor.status === "pending") {
          return res.status(403).json({ 
            status: "pending",
            message: "Din søknad venter på godkjenning. Du vil motta en e-post når den er behandlet." 
          });
        } else if (existingVendor.status === "rejected") {
          return res.status(403).json({ 
            status: "rejected",
            message: `Din søknad ble avvist. Årsak: ${existingVendor.rejectionReason || "Ikke spesifisert"}`,
            rejectionReason: existingVendor.rejectionReason 
          });
        }
      }

      // New vendor - create account with pending status
      const newVendorId = generateSessionToken().substring(0, 21); // Use part of token as ID
      const [newVendor] = await db.insert(vendors).values({
        id: newVendorId,
        email: googleEmail,
        password: generateSessionToken(), // Random password since using OAuth
        businessName: googleName || "Min Bedrift",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      res.status(201).json({
        vendor: {
          id: newVendor.id,
          email: newVendor.email,
          businessName: newVendor.businessName,
          status: newVendor.status,
        },
        status: "pending",
        message: "Konto opprettet! Din søknad venter på godkjenning.",
      });
    } catch (error) {
      console.error("Error with Google vendor login:", error);
      res.status(500).json({ error: "Kunne ikke logge inn med Google" });
    }
  });

  app.post("/api/vendors/logout", async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      await db.delete(vendorSessions).where(eq(vendorSessions.token, token));
    }
    res.json({ message: "Logget ut" });
  });

  // Session validation endpoint for checking if a stored session is still valid
  app.get("/api/vendor/session", async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ valid: false, error: "Ikke autorisert" });
      return;
    }
    const token = authHeader.replace("Bearer ", "");
    
    try {
      const [vendorSession] = await db.select({ vendorId: vendorSessions.vendorId })
        .from(vendorSessions)
        .where(and(
          eq(vendorSessions.token, token),
          sql`${vendorSessions.expiresAt} > NOW()`
        ));
      
      if (!vendorSession) {
        res.status(401).json({ valid: false, error: "Økt utløpt" });
        return;
      }

      const [vendor] = await db.select().from(vendors).where(eq(vendors.id, vendorSession.vendorId));
      if (!vendor || vendor.status !== "approved") {
        res.status(401).json({ valid: false, error: "Ikke autorisert" });
        return;
      }

      res.json({ valid: true, vendorId: vendorSession.vendorId, businessName: vendor.businessName });
    } catch (error) {
      res.status(500).json({ valid: false, error: "Serverfeil" });
    }
  });

  app.get("/api/vendors", async (req: Request, res: Response) => {
    try {
      const categoryId = req.query.categoryId as string | undefined;
      
      // Fetch vendors with their subscription info for prioritization
      const vendorsWithSubs = await db.select({
        id: vendors.id,
        businessName: vendors.businessName,
        categoryId: vendors.categoryId,
        categoryName: vendorCategories.name,
        description: vendors.description,
        location: vendors.location,
        phone: vendors.phone,
        website: vendors.website,
        priceRange: vendors.priceRange,
        imageUrl: vendors.imageUrl,
        subscriptionId: vendorSubscriptions.id,
        tierId: vendorSubscriptions.tierId,
        hasPrioritizedSearch: subscriptionTiers.hasPrioritizedSearch,
        canHighlightProfile: subscriptionTiers.canHighlightProfile,
        hasReviewBadge: subscriptionTiers.hasReviewBadge,
      })
        .from(vendors)
        .leftJoin(vendorCategories, eq(vendorCategories.id, vendors.categoryId))
        .leftJoin(vendorSubscriptions, 
          and(
            eq(vendorSubscriptions.vendorId, vendors.id),
            eq(vendorSubscriptions.status, "active")
          )
        )
        .leftJoin(subscriptionTiers, eq(subscriptionTiers.id, vendorSubscriptions.tierId))
        .where(eq(vendors.status, "approved"));

      // Filter by category if specified
      let filtered = categoryId 
        ? vendorsWithSubs.filter(v => v.categoryId === categoryId)
        : vendorsWithSubs;

      // Sort: Featured first, then prioritized, then alphabetically
      filtered.sort((a, b) => {
        // 1. Featured profiles first
        if (a.canHighlightProfile && !b.canHighlightProfile) return -1;
        if (!a.canHighlightProfile && b.canHighlightProfile) return 1;
        
        // 2. Prioritized search second
        if (a.hasPrioritizedSearch && !b.hasPrioritizedSearch) return -1;
        if (!a.hasPrioritizedSearch && b.hasPrioritizedSearch) return 1;
        
        // 3. Alphabetically by business name
        return (a.businessName || "").localeCompare(b.businessName || "");
      });

      // Map to clean response (remove subscription fields from public API)
      const response = filtered.map(v => ({
        id: v.id,
        businessName: v.businessName,
        categoryId: v.categoryId,
        categoryName: v.categoryName,
        description: v.description,
        location: v.location,
        phone: v.phone,
        website: v.website,
        priceRange: v.priceRange,
        imageUrl: v.imageUrl,
        isFeatured: v.canHighlightProfile || false,
        isPrioritized: v.hasPrioritizedSearch || false,
        hasReviewBadge: v.hasReviewBadge || false,
      }));

      res.json(response);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ error: "Kunne ikke hente leverandører" });
    }
  });

  // Smart vendor matching endpoint for couples
  app.get("/api/vendors/matching", async (req: Request, res: Response) => {
    try {
      const { category, guestCount, location, cuisineTypes, search } = req.query;
      const guestCountNum = guestCount ? parseInt(guestCount as string) : undefined;
      const searchTerm = search && typeof search === "string" ? search.trim().toLowerCase() : undefined;
      // Parse cuisine types from query (comma-separated)
      const requestedCuisines = cuisineTypes && typeof cuisineTypes === "string" 
        ? cuisineTypes.split(",").map(c => c.trim().toLowerCase())
        : [];

      // Fetch approved vendors with their subscription details for prioritization
      const vendorsWithSubs = await db.select({
        id: vendors.id,
        businessName: vendors.businessName,
        categoryId: vendors.categoryId,
        description: vendors.description,
        location: vendors.location,
        phone: vendors.phone,
        website: vendors.website,
        priceRange: vendors.priceRange,
        imageUrl: vendors.imageUrl,
        culturalExpertise: vendors.culturalExpertise,
        hasPrioritizedSearch: subscriptionTiers.hasPrioritizedSearch,
        canHighlightProfile: subscriptionTiers.canHighlightProfile,
        hasReviewBadge: subscriptionTiers.hasReviewBadge,
      })
        .from(vendors)
        .leftJoin(vendorSubscriptions, 
          and(
            eq(vendorSubscriptions.vendorId, vendors.id),
            eq(vendorSubscriptions.status, "active")
          )
        )
        .leftJoin(subscriptionTiers, eq(subscriptionTiers.id, vendorSubscriptions.tierId))
        .where(eq(vendors.status, "approved"));

      // Filter by category if specified
      let filtered = category 
        ? vendorsWithSubs.filter(v => v.categoryId === category)
        : vendorsWithSubs;

      // Filter by search term (business name match) if specified
      if (searchTerm) {
        filtered = filtered.filter(v => {
          const name = (v.businessName || "").toLowerCase();
          const desc = (v.description || "").toLowerCase();
          return name.includes(searchTerm) || desc.includes(searchTerm);
        });
      }

      // Fetch category details for capacity matching
      const vendorIds = filtered.map(v => v.id);
      let categoryDetails: any[] = [];
      if (vendorIds.length > 0) {
        categoryDetails = await db.select().from(vendorCategoryDetails)
          .where(inArray(vendorCategoryDetails.vendorId, vendorIds));
      }

      // Map category details to vendors
      const vendorsWithDetails = filtered.map(vendor => {
        const details = categoryDetails.find(d => d.vendorId === vendor.id) || {};
        return {
          ...vendor,
          venueCapacityMin: details.venueCapacityMin,
          venueCapacityMax: details.venueCapacityMax,
          cateringMinGuests: details.cateringMinGuests,
          cateringMaxGuests: details.cateringMaxGuests,
          venueType: details.venueType,
          venueLocation: details.venueLocation,
        };
      });

      // Filter by capacity if guest count is specified and category supports it
      let result = vendorsWithDetails;
      if (guestCountNum && category === "venue") {
        result = result.filter(v => {
          // Include vendors without capacity info (show all), or those that fit
          if (!v.venueCapacityMin && !v.venueCapacityMax) return true;
          if (v.venueCapacityMax && guestCountNum > v.venueCapacityMax) return false;
          // Allow some flexibility - include if close to min
          if (v.venueCapacityMin && guestCountNum < v.venueCapacityMin * 0.7) return false;
          return true;
        });
      }
      if (guestCountNum && category === "catering") {
        result = result.filter(v => {
          if (!v.cateringMinGuests && !v.cateringMaxGuests) return true;
          if (v.cateringMaxGuests && guestCountNum > v.cateringMaxGuests) return false;
          if (v.cateringMinGuests && guestCountNum < v.cateringMinGuests * 0.7) return false;
          return true;
        });
      }

      // Filter by location if specified
      if (location && typeof location === "string") {
        const locationLower = location.toLowerCase();
        result = result.filter(v => 
          v.location?.toLowerCase().includes(locationLower) ||
          v.venueLocation?.toLowerCase().includes(locationLower)
        );
      }

      // Add cuisine match info for catering vendors
      // We'll fetch catering details separately since they might be stored in extended vendor data
      let cateringDetailsMap: Record<string, string[]> = {};
      if (category === "catering" && requestedCuisines.length > 0) {
        // Caterer cuisine types are typically stored in their vendor profile description
        // or in extended vendor features. For now, we'll include all caterers and let
        // client-side scoring handle the matching based on vendor descriptions
      }

      // Sort: Featured first, then prioritized, then alphabetically
      result.sort((a, b) => {
        // 1. Featured profiles first
        if (a.canHighlightProfile && !b.canHighlightProfile) return -1;
        if (!a.canHighlightProfile && b.canHighlightProfile) return 1;
        
        // 2. Prioritized search second
        if (a.hasPrioritizedSearch && !b.hasPrioritizedSearch) return -1;
        if (!a.hasPrioritizedSearch && b.hasPrioritizedSearch) return 1;
        
        // 3. Alphabetically by business name
        return (a.businessName || "").localeCompare(b.businessName || "");
      });

      // Fetch vendor products for matched vendors (with metadata)
      const vendorIdsForProducts = result.map(v => v.id);
      let vendorProductsMap: Record<string, any[]> = {};
      if (vendorIdsForProducts.length > 0) {
        const allProducts = await db.select()
          .from(vendorProducts)
          .where(inArray(vendorProducts.vendorId, vendorIdsForProducts));
        
        // Parse metadata JSON and group by vendorId
        allProducts.forEach(product => {
          if (!vendorProductsMap[product.vendorId]) {
            vendorProductsMap[product.vendorId] = [];
          }
          vendorProductsMap[product.vendorId].push({
            ...product,
            metadata: product.metadata ? JSON.parse(product.metadata) : null,
          });
        });
      }

      // Add featured/prioritized flags and products to response
      const response = result.map(v => ({
        ...v,
        isFeatured: v.canHighlightProfile || false,
        isPrioritized: v.hasPrioritizedSearch || false,
        hasReviewBadge: v.hasReviewBadge || false,
        products: vendorProductsMap[v.id] || [],
      }));

      res.json(response);
    } catch (error) {
      console.error("Error fetching matching vendors:", error);
      res.status(500).json({ error: "Kunne ikke hente matchende leverandører" });
    }
  });

  const checkAdminAuth = async (req: Request, res: Response): Promise<boolean> => {
    const authHeader = req.headers.authorization;
    const apiKey = req.headers["x-api-key"] as string | undefined;

    // Method 1: CreatorHub API key via X-API-Key header
    if (apiKey && apiKey.startsWith("ch_")) {
      try {
        const [project] = await db.select().from(creatorhubProjects)
          .where(eq(creatorhubProjects.apiKey, apiKey));
        if (project && project.status === "active") {
          console.log(`[Admin Auth] CreatorHub project "${project.name}" authenticated via API key`);
          return true;
        }
      } catch (err) {
        console.error("[Admin Auth] CreatorHub API key check error:", err);
      }
      res.status(401).json({ error: "Invalid CreatorHub API key" });
      return false;
    }

    // Method 2: CreatorHub API key via Bearer token
    if (authHeader && authHeader.startsWith("Bearer ch_")) {
      const key = authHeader.substring(7);
      try {
        const [project] = await db.select().from(creatorhubProjects)
          .where(eq(creatorhubProjects.apiKey, key));
        if (project && project.status === "active") {
          console.log(`[Admin Auth] CreatorHub project "${project.name}" authenticated via Bearer token`);
          return true;
        }
      } catch (err) {
        console.error("[Admin Auth] CreatorHub Bearer check error:", err);
      }
      res.status(401).json({ error: "Invalid CreatorHub API key" });
      return false;
    }

    // Method 3: Original ADMIN_SECRET
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      res.status(503).json({ error: "Admin-funksjonalitet er ikke konfigurert" });
      return false;
    }
    if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
      console.error("Auth failed - Header does not match expected value");
      res.status(401).json({ error: "Ikke autorisert" });
      return false;
    }
    return true;
  };

  app.get("/api/admin/vendors", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      const status = req.query.status as string || "pending";
      
      const vendorList = await db.select({
        id: vendors.id,
        email: vendors.email,
        businessName: vendors.businessName,
        categoryId: vendors.categoryId,
        description: vendors.description,
        location: vendors.location,
        phone: vendors.phone,
        website: vendors.website,
        priceRange: vendors.priceRange,
        status: vendors.status,
        createdAt: vendors.createdAt,
      }).from(vendors).where(eq(vendors.status, status));

      res.json(vendorList);
    } catch (error) {
      console.error("Error fetching admin vendors:", error);
      res.status(500).json({ error: "Kunne ikke hente leverandører" });
    }
  });

  app.post("/api/admin/vendors/:id/approve", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      const { id } = req.params;
      const { tierId } = req.body;
      
      // Update vendor status
      await db.update(vendors)
        .set({ status: "approved", updatedAt: new Date() })
        .where(eq(vendors.id, id));

      // Check if vendor already has a trial subscription
      const { vendorSubscriptions } = await import("@shared/schema");
      const [existingSubscription] = await db.select()
        .from(vendorSubscriptions)
        .where(eq(vendorSubscriptions.vendorId, id))
        .limit(1);

      if (existingSubscription) {
        // Keep trial subscription in "trialing" status - will activate after payment
        // Only update tier if admin changed it
        if (tierId && existingSubscription.tierId !== tierId) {
          await db.update(vendorSubscriptions)
            .set({ 
              tierId: tierId,
              updatedAt: new Date(),
            })
            .where(eq(vendorSubscriptions.vendorId, id));
        }
      } else if (tierId) {
        // Create trial subscription if none exists (payment required to activate)
        const now = new Date();
        const trialEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days trial
        
        await db.insert(vendorSubscriptions)
          .values({
            vendorId: id,
            tierId: tierId,
            status: "trialing", // Trial - requires payment
            currentPeriodStart: now,
            currentPeriodEnd: trialEnd,
            autoRenew: true,
          });
      }

      res.json({ message: "Leverandør godkjent" });
    } catch (error) {
      console.error("Error approving vendor:", error);
      res.status(500).json({ error: "Kunne ikke godkjenne leverandør" });
    }
  });

  app.post("/api/admin/vendors/:id/reject", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      const { id } = req.params;
      const { reason } = req.body;
      
      await db.update(vendors)
        .set({ 
          status: "rejected", 
          rejectionReason: reason || null,
          updatedAt: new Date() 
        })
        .where(eq(vendors.id, id));

      res.json({ message: "Leverandør avvist" });
    } catch (error) {
      console.error("Error rejecting vendor:", error);
      res.status(500).json({ error: "Kunne ikke avvise leverandør" });
    }
  });

  const checkVendorAuth = async (req: Request, res: Response): Promise<string | null> => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Ikke autorisert" });
      return null;
    }
    const token = authHeader.replace("Bearer ", "");
    
    // Check if session exists in database and is not expired
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
  };

  // Check if vendor has active subscription (not paused)
  const checkVendorSubscriptionAccess = async (vendorId: string, res: Response): Promise<boolean> => {
    try {
      const { vendorSubscriptions } = await import("@shared/schema");
      
      const [subscription] = await db.select()
        .from(vendorSubscriptions)
        .where(eq(vendorSubscriptions.vendorId, vendorId))
        .limit(1);

      if (!subscription) {
        res.status(403).json({ 
          error: "Ingen aktivt abonnement",
          message: "Du må ha et aktivt abonnement for å bruke denne funksjonen.",
          requiresPayment: true
        });
        return false;
      }

      if (subscription.status === "paused") {
        res.status(403).json({ 
          error: "Abonnement satt på pause",
          message: "Ditt abonnement er satt på pause. Betal for å fortsette å bruke Wedflow og motta henvendelser.",
          requiresPayment: true,
          isPaused: true
        });
        return false;
      }

      // Check if trial has expired
      if (subscription.status === "trialing") {
        const now = new Date();
        if (subscription.currentPeriodEnd < now) {
          // Update to paused if trial expired
          await db.update(vendorSubscriptions)
            .set({ 
              status: "paused",
              updatedAt: now,
            })
            .where(eq(vendorSubscriptions.id, subscription.id));

          res.status(403).json({ 
            error: "Prøveperiode utløpt",
            message: "Din 30-dagers prøveperiode har utløpt. Betal for å fortsette.",
            requiresPayment: true,
            trialExpired: true
          });
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error checking subscription access:", error);
      return true; // Allow access on error to avoid breaking functionality
    }
  };

  // Get vendor profile
  app.get("/api/vendor/profile", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const [vendor] = await db.select().from(vendors).where(eq(vendors.id, vendorId));
      if (!vendor) {
        return res.status(404).json({ error: "Leverandør ikke funnet" });
      }

      // Get category if exists
      let category = null;
      if (vendor.categoryId) {
        const [cat] = await db.select().from(vendorCategories).where(eq(vendorCategories.id, vendor.categoryId));
        category = cat ? { id: cat.id, name: cat.name } : null;
      }

      res.json({
        id: vendor.id,
        email: vendor.email,
        businessName: vendor.businessName,
        organizationNumber: vendor.organizationNumber,
        description: vendor.description,
        location: vendor.location,
        phone: vendor.phone,
        website: vendor.website,
        priceRange: vendor.priceRange,
        imageUrl: vendor.imageUrl,
        googleReviewUrl: vendor.googleReviewUrl,
        status: vendor.status,
        category,
      });
    } catch (error) {
      console.error("Error fetching vendor profile:", error);
      res.status(500).json({ error: "Kunne ikke hente profil" });
    }
  });

  // Get vendor subscription status
  app.get("/api/vendor/subscription/status", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { vendorSubscriptions, subscriptionTiers } = await import("@shared/schema");
      
      const [subscription] = await db.select({
        id: vendorSubscriptions.id,
        status: vendorSubscriptions.status,
        currentPeriodStart: vendorSubscriptions.currentPeriodStart,
        currentPeriodEnd: vendorSubscriptions.currentPeriodEnd,
        autoRenew: vendorSubscriptions.autoRenew,
        tier: {
          id: subscriptionTiers.id,
          name: subscriptionTiers.name,
          displayName: subscriptionTiers.displayName,
          priceNok: subscriptionTiers.priceNok,
        },
      })
      .from(vendorSubscriptions)
      .innerJoin(subscriptionTiers, eq(vendorSubscriptions.tierId, subscriptionTiers.id))
      .where(eq(vendorSubscriptions.vendorId, vendorId))
      .limit(1);

      if (!subscription) {
        return res.json({ hasSubscription: false });
      }

      const now = new Date();
      const daysRemaining = Math.ceil(
        (subscription.currentPeriodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      const needsPayment = 
        subscription.status === "paused" || 
        subscription.status === "past_due" ||
        (subscription.status === "trialing" && daysRemaining <= 0);

      res.json({
        hasSubscription: true,
        status: subscription.status,
        tier: subscription.tier,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
        needsPayment,
        isTrialing: subscription.status === "trialing",
        isPaused: subscription.status === "paused",
        autoRenew: subscription.autoRenew,
      });
    } catch (error) {
      console.error("Error fetching subscription status:", error);
      res.status(500).json({ error: "Kunne ikke hente abonnementsstatus" });
    }
  });

  // Update vendor profile
  app.patch("/api/vendor/profile", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { businessName, organizationNumber, description, location, phone, website, priceRange, googleReviewUrl, culturalExpertise } = req.body;

      if (!businessName || businessName.trim().length < 2) {
        return res.status(400).json({ error: "Bedriftsnavn er påkrevd" });
      }

      const [updatedVendor] = await db.update(vendors)
        .set({
          businessName: businessName.trim(),
          organizationNumber: organizationNumber || null,
          description: description || null,
          location: location || null,
          phone: phone || null,
          website: website || null,
          priceRange: priceRange || null,
          googleReviewUrl: googleReviewUrl || null,
          culturalExpertise: culturalExpertise || null,
          updatedAt: new Date(),
        })
        .where(eq(vendors.id, vendorId))
        .returning();

      res.json(updatedVendor);
    } catch (error) {
      console.error("Error updating vendor profile:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere profil" });
    }
  });

  // Get vendor category-specific details
  app.get("/api/vendor/category-details", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const [details] = await db.select()
        .from(vendorCategoryDetails)
        .where(eq(vendorCategoryDetails.vendorId, vendorId));

      // Also get vendor's category for context
      const [vendor] = await db.select({
        categoryId: vendors.categoryId,
      }).from(vendors).where(eq(vendors.id, vendorId));

      let categoryName = null;
      if (vendor?.categoryId) {
        const [cat] = await db.select().from(vendorCategories).where(eq(vendorCategories.id, vendor.categoryId));
        categoryName = cat?.name || null;
      }

      res.json({
        details: details || null,
        categoryName,
      });
    } catch (error) {
      console.error("Error fetching category details:", error);
      res.status(500).json({ error: "Kunne ikke hente kategori-detaljer" });
    }
  });

  // Update vendor category-specific details
  app.patch("/api/vendor/category-details", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const updateData = { ...req.body, updatedAt: new Date() };
      delete updateData.id;
      delete updateData.vendorId;
      delete updateData.createdAt;

      // Check if details exist
      const [existing] = await db.select()
        .from(vendorCategoryDetails)
        .where(eq(vendorCategoryDetails.vendorId, vendorId));

      if (existing) {
        const [updated] = await db.update(vendorCategoryDetails)
          .set(updateData)
          .where(eq(vendorCategoryDetails.vendorId, vendorId))
          .returning();
        res.json(updated);
      } else {
        const [created] = await db.insert(vendorCategoryDetails)
          .values({
            vendorId,
            ...updateData,
          })
          .returning();
        res.json(created);
      }
    } catch (error) {
      console.error("Error updating category details:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere kategori-detaljer" });
    }
  });

  app.get("/api/vendor/deliveries", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const vendorDeliveries = await db.select().from(deliveries).where(eq(deliveries.vendorId, vendorId));
      
      const deliveriesWithItems = await Promise.all(
        vendorDeliveries.map(async (delivery) => {
          const items = await db.select().from(deliveryItems).where(eq(deliveryItems.deliveryId, delivery.id));
          return { ...delivery, items };
        })
      );

      res.json(deliveriesWithItems);
    } catch (error) {
      console.error("Error fetching deliveries:", error);
      res.status(500).json({ error: "Kunne ikke hente leveranser" });
    }
  });

  app.post("/api/vendor/deliveries", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const validation = createDeliverySchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Ugyldig data", 
          details: validation.error.errors 
        });
      }

      const { items, ...deliveryData } = validation.data;
      const accessCode = generateAccessCode();

      // Auto-link to project/timeline if coupleId provided but projectId missing
      let projectId = deliveryData.projectId || null;
      let timelineId = deliveryData.timelineId || null;
      if (deliveryData.coupleId && !projectId) {
        try {
          const coupleRes = await db.execute(sql`SELECT email FROM couple_profiles WHERE id = ${deliveryData.coupleId}`);
          const coupleEmail = (coupleRes.rows[0] as any)?.email;
          if (coupleEmail) {
            const projRes = await db.execute(sql`
              SELECT p.id as project_id, wt.id as timeline_id
              FROM creatorhub_projects p
              LEFT JOIN wedding_timelines wt ON wt.project_id = p.id
              WHERE LOWER(p.owner_id) IN (
                SELECT id FROM users WHERE LOWER(email) = LOWER(${coupleEmail})
              )
              ORDER BY p.created_at DESC LIMIT 1
            `);
            const link = projRes.rows[0] as any;
            if (link) {
              projectId = link.project_id || projectId;
              timelineId = link.timeline_id || timelineId;
            }
          }
        } catch (e) { /* non-critical */ }
      }

      const [newDelivery] = await db.insert(deliveries).values({
        vendorId,
        coupleName: deliveryData.coupleName,
        coupleEmail: deliveryData.coupleEmail || null,
        title: deliveryData.title,
        description: deliveryData.description || null,
        weddingDate: deliveryData.weddingDate || null,
        projectId,
        timelineId,
        coupleId: deliveryData.coupleId || null,
        accessCode,
      }).returning();

      await Promise.all(
        items.map((item, index) =>
          db.insert(deliveryItems).values({
            deliveryId: newDelivery.id,
            type: item.type,
            label: item.label,
            url: item.url,
            description: item.description || null,
            sortOrder: index,
          })
        )
      );

      const createdItems = await db.select().from(deliveryItems).where(eq(deliveryItems.deliveryId, newDelivery.id));

      res.status(201).json({ 
        delivery: { ...newDelivery, items: createdItems },
        message: `Leveranse opprettet! Tilgangskode: ${accessCode}` 
      });
    } catch (error) {
      console.error("Error creating delivery:", error);
      res.status(500).json({ error: "Kunne ikke opprette leveranse" });
    }
  });

  // PATCH - Update delivery
  app.patch("/api/vendor/deliveries/:id", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { id } = req.params;
      const { items, ...deliveryData } = req.body;

      // Verify ownership
      const [existing] = await db.select()
        .from(deliveries)
        .where(and(
          eq(deliveries.id, id),
          eq(deliveries.vendorId, vendorId)
        ));

      if (!existing) {
        return res.status(404).json({ error: "Leveranse ikke funnet" });
      }

      // Update delivery data
      const [updated] = await db.update(deliveries)
        .set({
          coupleName: deliveryData.coupleName,
          coupleEmail: deliveryData.coupleEmail || null,
          title: deliveryData.title,
          description: deliveryData.description || null,
          weddingDate: deliveryData.weddingDate || null,
          status: deliveryData.status || existing.status,
          updatedAt: new Date(),
        })
        .where(eq(deliveries.id, id))
        .returning();

      // If items are provided, replace them
      if (items && Array.isArray(items)) {
        // Delete existing items
        await db.delete(deliveryItems).where(eq(deliveryItems.deliveryId, id));
        
        // Insert new items
        await Promise.all(
          items.map((item: any, index: number) =>
            db.insert(deliveryItems).values({
              deliveryId: id,
              type: item.type,
              label: item.label,
              url: item.url,
              description: item.description || null,
              sortOrder: index,
            })
          )
        );
      }

      const updatedItems = await db.select().from(deliveryItems).where(eq(deliveryItems.deliveryId, id));

      res.json({ 
        delivery: { ...updated, items: updatedItems },
        message: "Leveranse oppdatert!" 
      });
    } catch (error) {
      console.error("Error updating delivery:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere leveranse" });
    }
  });

  // DELETE - Delete delivery
  app.delete("/api/vendor/deliveries/:id", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { id } = req.params;

      // Verify ownership
      const [existing] = await db.select()
        .from(deliveries)
        .where(and(
          eq(deliveries.id, id),
          eq(deliveries.vendorId, vendorId)
        ));

      if (!existing) {
        return res.status(404).json({ error: "Leveranse ikke funnet" });
      }

      // Delete items first (foreign key constraint)
      await db.delete(deliveryItems).where(eq(deliveryItems.deliveryId, id));
      // Delete delivery
      await db.delete(deliveries).where(eq(deliveries.id, id));

      res.json({ message: "Leveranse slettet" });
    } catch (error) {
      console.error("Error deleting delivery:", error);
      res.status(500).json({ error: "Kunne ikke slette leveranse" });
    }
  });

  app.get("/api/deliveries/:accessCode", async (req: Request, res: Response) => {
    try {
      const { accessCode } = req.params;
      
      const [delivery] = await db.select().from(deliveries).where(eq(deliveries.accessCode, accessCode.toUpperCase()));
      if (!delivery || delivery.status !== "active") {
        return res.status(404).json({ error: "Leveranse ikke funnet" });
      }

      const [vendor] = await db.select({
        businessName: vendors.businessName,
        categoryId: vendors.categoryId,
      }).from(vendors).where(eq(vendors.id, delivery.vendorId));

      const items = await db.select().from(deliveryItems).where(eq(deliveryItems.deliveryId, delivery.id));

      // Track open event
      await db.insert(deliveryTracking).values({
        deliveryId: delivery.id,
        coupleId: delivery.coupleId,
        vendorId: delivery.vendorId,
        action: 'opened',
        actionDetail: JSON.stringify({ source: 'wedflow-app', accessCode }),
      });
      // Update open counter
      await db.execute(sql`UPDATE deliveries SET open_count = COALESCE(open_count, 0) + 1, opened_at = COALESCE(opened_at, NOW()) WHERE id = ${delivery.id}`);

      res.json({ 
        delivery: { ...delivery, items },
        vendor 
      });
    } catch (error) {
      console.error("Error fetching delivery:", error);
      res.status(500).json({ error: "Kunne ikke hente leveranse" });
    }
  });

  // POST /api/delivery-track — Track open/download/favorite actions
  app.post("/api/delivery-track", async (req: Request, res: Response) => {
    try {
      const { deliveryId, deliveryItemId, action, accessCode: ac, source } = req.body;
      if (!deliveryId || !action) return res.status(400).json({ error: "deliveryId og action er påkrevd" });

      const validActions = ['opened', 'downloaded', 'favorited', 'unfavorited', 'shared', 'viewed_item'];
      if (!validActions.includes(action)) return res.status(400).json({ error: "Ugyldig action" });

      // Verify delivery exists
      const [delivery] = await db.select().from(deliveries).where(eq(deliveries.id, deliveryId));
      if (!delivery) return res.status(404).json({ error: "Leveranse ikke funnet" });

      // Insert tracking record
      await db.insert(deliveryTracking).values({
        deliveryId,
        deliveryItemId: deliveryItemId || null,
        coupleId: delivery.coupleId,
        vendorId: delivery.vendorId,
        action,
        actionDetail: JSON.stringify({ accessCode: ac || null, source: source || 'wedflow-app' }),
      });

      // Update counters
      if (action === 'opened') {
        await db.execute(sql`UPDATE deliveries SET open_count = COALESCE(open_count, 0) + 1, opened_at = COALESCE(opened_at, NOW()) WHERE id = ${deliveryId}`);
      } else if (action === 'downloaded') {
        await db.execute(sql`UPDATE deliveries SET download_count = COALESCE(download_count, 0) + 1 WHERE id = ${deliveryId}`);
        if (deliveryItemId) {
          await db.execute(sql`UPDATE delivery_items SET download_count = COALESCE(download_count, 0) + 1 WHERE id = ${deliveryItemId}`);
        }
      } else if (action === 'favorited') {
        await db.execute(sql`UPDATE deliveries SET favorite_count = COALESCE(favorite_count, 0) + 1 WHERE id = ${deliveryId}`);
        if (deliveryItemId) {
          await db.execute(sql`UPDATE delivery_items SET favorite_count = COALESCE(favorite_count, 0) + 1, favorited_at = NOW() WHERE id = ${deliveryItemId}`);
        }
      } else if (action === 'unfavorited') {
        await db.execute(sql`UPDATE deliveries SET favorite_count = GREATEST(COALESCE(favorite_count, 0) - 1, 0) WHERE id = ${deliveryId}`);
        if (deliveryItemId) {
          await db.execute(sql`UPDATE delivery_items SET favorite_count = GREATEST(COALESCE(favorite_count, 0) - 1, 0), favorited_at = NULL WHERE id = ${deliveryItemId}`);
        }
      }

      res.json({ success: true, action });
    } catch (error) {
      console.error("Delivery track error:", error);
      res.status(500).json({ error: "Kunne ikke registrere handling" });
    }
  });

  // GET /api/vendor/delivery-tracking/:deliveryId — Vendor tracking dashboard
  app.get("/api/vendor/delivery-tracking/:deliveryId", async (req: Request, res: Response) => {
    try {
      const vendorId = await checkVendorAuth(req, res);
      if (!vendorId) return;

      const { deliveryId } = req.params;

      const [delivery] = await db.select().from(deliveries).where(
        and(eq(deliveries.id, deliveryId), eq(deliveries.vendorId, vendorId))
      );
      if (!delivery) return res.status(404).json({ error: "Leveranse ikke funnet" });

      const items = await db.select().from(deliveryItems).where(eq(deliveryItems.deliveryId, deliveryId));

      const history = await db.select().from(deliveryTracking)
        .where(eq(deliveryTracking.deliveryId, deliveryId))
        .orderBy(sql`created_at DESC`)
        .limit(50);

      res.json({
        delivery: {
          id: delivery.id,
          title: delivery.title,
          coupleName: delivery.coupleName,
          accessCode: delivery.accessCode,
          status: delivery.status,
          openCount: delivery.openCount || 0,
          downloadCount: delivery.downloadCount || 0,
          favoriteCount: delivery.favoriteCount || 0,
          openedAt: delivery.openedAt,
          chatNotified: delivery.chatNotified,
        },
        items: items.map(item => ({
          id: item.id,
          type: item.type,
          label: item.label,
          downloadCount: item.downloadCount || 0,
          favoriteCount: item.favoriteCount || 0,
          favoritedAt: item.favoritedAt,
        })),
        history,
      });
    } catch (error) {
      console.error("Vendor delivery tracking error:", error);
      res.status(500).json({ error: "Kunne ikke hente sporingsdata" });
    }
  });

  // POST /api/vendor/delivery-notify — Send chat notification to couple
  app.post("/api/vendor/delivery-notify", async (req: Request, res: Response) => {
    try {
      const vendorId = await checkVendorAuth(req, res);
      if (!vendorId) return;

      const { deliveryId, customMessage } = req.body;
      if (!deliveryId) return res.status(400).json({ error: "deliveryId er påkrevd" });

      const [delivery] = await db.select().from(deliveries).where(
        and(eq(deliveries.id, deliveryId), eq(deliveries.vendorId, vendorId))
      );
      if (!delivery) return res.status(404).json({ error: "Leveranse ikke funnet" });

      const items = await db.select().from(deliveryItems).where(eq(deliveryItems.deliveryId, deliveryId));

      // Find or create conversation
      let conversationId: string | null = null;
      let targetCoupleId = delivery.coupleId;

      if (!targetCoupleId && delivery.coupleEmail) {
        const [cp] = await db.select().from(coupleProfiles).where(sql`LOWER(email) = LOWER(${delivery.coupleEmail})`);
        if (cp) targetCoupleId = cp.id;
      }

      if (targetCoupleId) {
        const [existConv] = await db.select().from(conversations).where(
          and(eq(conversations.vendorId, vendorId), eq(conversations.coupleId, targetCoupleId))
        );
        if (existConv) {
          conversationId = existConv.id;
        } else {
          const [newConv] = await db.insert(conversations).values({
            vendorId,
            coupleId: targetCoupleId,
            status: 'active',
            lastMessageAt: new Date(),
            coupleUnreadCount: 1,
            vendorUnreadCount: 0,
          }).returning();
          conversationId = newConv.id;
        }

        const chatBody = customMessage ||
          `📦 Leveransen din er klar!\n\n"${delivery.title}"\n${items.length} ${items.length === 1 ? 'element' : 'elementer'} venter på deg.\n\n🔑 Tilgangskode: ${delivery.accessCode}\n\nÅpne Wedflow → "Hent leveranse" → Skriv inn koden. 💕`;

        await db.insert(messages).values({
          conversationId: conversationId!,
          senderType: 'vendor',
          senderId: vendorId,
          body: chatBody,
        });

        await db.execute(sql`UPDATE conversations SET last_message_at = NOW(), couple_unread_count = COALESCE(couple_unread_count, 0) + 1 WHERE id = ${conversationId}`);
      }

      await db.execute(sql`UPDATE deliveries SET chat_notified = true WHERE id = ${deliveryId}`);

      res.json({
        success: true,
        messageSent: !!conversationId,
        conversationId,
        accessCode: delivery.accessCode,
        message: conversationId
          ? `Melding sendt til ${delivery.coupleName} i chatten`
          : "Leveransen er merket som varslet, men ingen samtale ble funnet",
      });
    } catch (error) {
      console.error("Vendor delivery notify error:", error);
      res.status(500).json({ error: "Kunne ikke sende varsel" });
    }
  });

  app.get("/api/inspiration-categories", async (_req: Request, res: Response) => {
    try {
      const categories = await db.select().from(inspirationCategories);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching inspiration categories:", error);
      res.status(500).json({ error: "Kunne ikke hente kategorier" });
    }
  });

  app.get("/api/inspirations", async (req: Request, res: Response) => {
    try {
      const categoryId = req.query.categoryId as string | undefined;

      const approvedInspirations = await db.select().from(inspirations).where(eq(inspirations.status, "approved"));

      const filtered = categoryId 
        ? approvedInspirations.filter(i => i.categoryId === categoryId)
        : approvedInspirations;

      const inspirationsWithDetails = await Promise.all(
        filtered.map(async (insp) => {
          const media = await db.select().from(inspirationMedia).where(eq(inspirationMedia.inspirationId, insp.id));
          const [vendor] = await db.select({
            id: vendors.id,
            businessName: vendors.businessName,
          }).from(vendors).where(eq(vendors.id, insp.vendorId));
          const [category] = await db.select().from(inspirationCategories).where(eq(inspirationCategories.id, insp.categoryId || ""));
          return { ...insp, media, vendor, category };
        })
      );

      res.json(inspirationsWithDetails);
    } catch (error) {
      console.error("Error fetching inspirations:", error);
      res.status(500).json({ error: "Kunne ikke hente inspirasjoner" });
    }
  });

  app.get("/api/vendor/inspirations", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const vendorInspirations = await db.select().from(inspirations).where(eq(inspirations.vendorId, vendorId));

      const inspirationsWithMedia = await Promise.all(
        vendorInspirations.map(async (insp) => {
          const media = await db.select().from(inspirationMedia).where(eq(inspirationMedia.inspirationId, insp.id));
          const [category] = await db.select().from(inspirationCategories).where(eq(inspirationCategories.id, insp.categoryId || ""));
          return { ...insp, media, category };
        })
      );

      res.json(inspirationsWithMedia);
    } catch (error) {
      console.error("Error fetching vendor inspirations:", error);
      res.status(500).json({ error: "Kunne ikke hente inspirasjoner" });
    }
  });

  app.post("/api/vendor/inspirations", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const featureRows = await db.select().from(vendorFeatures)
        .where(and(eq(vendorFeatures.vendorId, vendorId), eq(vendorFeatures.featureKey, "inspirations")));
      
      if (featureRows.length > 0 && !featureRows[0].isEnabled) {
        return res.status(403).json({ error: "Inspirasjoner er deaktivert for denne kontoen" });
      }

      const validation = createInspirationSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({
          error: "Ugyldig data",
          details: validation.error.errors,
        });
      }

      const { media, ...inspirationData } = validation.data;

      const assignments = await db.select().from(vendorInspirationCategories).where(eq(vendorInspirationCategories.vendorId, vendorId));
      if (assignments.length > 0) {
        const allowedCategoryIds = assignments.map(a => a.categoryId);
        if (!allowedCategoryIds.includes(inspirationData.categoryId)) {
          return res.status(403).json({ error: "Du har ikke tilgang til denne kategorien" });
        }
      }

      const [newInspiration] = await db.insert(inspirations).values({
        vendorId,
        categoryId: inspirationData.categoryId,
        title: inspirationData.title,
        description: inspirationData.description || null,
        coverImageUrl: inspirationData.coverImageUrl || (media.length > 0 ? media[0].url : null),
        priceSummary: inspirationData.priceSummary || null,
        priceMin: inspirationData.priceMin || null,
        priceMax: inspirationData.priceMax || null,
        currency: inspirationData.currency || "NOK",
        websiteUrl: inspirationData.websiteUrl || null,
        inquiryEmail: inspirationData.inquiryEmail || null,
        inquiryPhone: inspirationData.inquiryPhone || null,
        ctaLabel: inspirationData.ctaLabel || null,
        ctaUrl: inspirationData.ctaUrl || null,
        allowInquiryForm: inspirationData.allowInquiryForm || false,
      }).returning();

      await Promise.all(
        media.map((item, index) =>
          db.insert(inspirationMedia).values({
            inspirationId: newInspiration.id,
            type: item.type,
            url: item.url,
            caption: item.caption || null,
            sortOrder: index,
          })
        )
      );

      const createdMedia = await db.select().from(inspirationMedia).where(eq(inspirationMedia.inspirationId, newInspiration.id));

      res.status(201).json({
        inspiration: { ...newInspiration, media: createdMedia },
        message: "Inspirasjon opprettet! Den vil bli synlig etter godkjenning.",
      });
    } catch (error) {
      console.error("Error creating inspiration:", error);
      res.status(500).json({ error: "Kunne ikke opprette inspirasjon" });
    }
  });

  // PATCH - Update inspiration
  app.patch("/api/vendor/inspirations/:id", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { id } = req.params;
      const { media, ...inspirationData } = req.body;

      // Verify ownership
      const [existing] = await db.select()
        .from(inspirations)
        .where(and(
          eq(inspirations.id, id),
          eq(inspirations.vendorId, vendorId)
        ));

      if (!existing) {
        return res.status(404).json({ error: "Showcase ikke funnet" });
      }

      // Update inspiration data
      const [updated] = await db.update(inspirations)
        .set({
          categoryId: inspirationData.categoryId || existing.categoryId,
          title: inspirationData.title,
          description: inspirationData.description || null,
          coverImageUrl: inspirationData.coverImageUrl || (media && media.length > 0 ? media[0].url : existing.coverImageUrl),
          priceSummary: inspirationData.priceSummary || null,
          priceMin: inspirationData.priceMin || null,
          priceMax: inspirationData.priceMax || null,
          currency: inspirationData.currency || "NOK",
          websiteUrl: inspirationData.websiteUrl || null,
          inquiryEmail: inspirationData.inquiryEmail || null,
          inquiryPhone: inspirationData.inquiryPhone || null,
          ctaLabel: inspirationData.ctaLabel || null,
          ctaUrl: inspirationData.ctaUrl || null,
          allowInquiryForm: inspirationData.allowInquiryForm ?? existing.allowInquiryForm,
          // Reset status to pending if content changes
          status: "pending",
          updatedAt: new Date(),
        })
        .where(eq(inspirations.id, id))
        .returning();

      // If media is provided, replace it
      if (media && Array.isArray(media)) {
        // Delete existing media
        await db.delete(inspirationMedia).where(eq(inspirationMedia.inspirationId, id));
        
        // Insert new media
        await Promise.all(
          media.map((item: any, index: number) =>
            db.insert(inspirationMedia).values({
              inspirationId: id,
              type: item.type,
              url: item.url,
              caption: item.caption || null,
              sortOrder: index,
            })
          )
        );
      }

      const updatedMedia = await db.select().from(inspirationMedia).where(eq(inspirationMedia.inspirationId, id));

      res.json({
        inspiration: { ...updated, media: updatedMedia },
        message: "Showcase oppdatert! Endringer vil bli synlig etter godkjenning.",
      });
    } catch (error) {
      console.error("Error updating inspiration:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere showcase" });
    }
  });

  // DELETE - Delete inspiration
  app.delete("/api/vendor/inspirations/:id", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { id } = req.params;

      // Verify ownership
      const [existing] = await db.select()
        .from(inspirations)
        .where(and(
          eq(inspirations.id, id),
          eq(inspirations.vendorId, vendorId)
        ));

      if (!existing) {
        return res.status(404).json({ error: "Showcase ikke funnet" });
      }

      // Delete media first (foreign key constraint)
      await db.delete(inspirationMedia).where(eq(inspirationMedia.inspirationId, id));
      // Delete inspiration
      await db.delete(inspirations).where(eq(inspirations.id, id));

      res.json({ message: "Showcase slettet" });
    } catch (error) {
      console.error("Error deleting inspiration:", error);
      res.status(500).json({ error: "Kunne ikke slette showcase" });
    }
  });

  app.get("/api/admin/inspirations", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;

    try {
      const status = req.query.status as string || "pending";

      const inspirationList = await db.select().from(inspirations).where(eq(inspirations.status, status));

      const inspirationsWithDetails = await Promise.all(
        inspirationList.map(async (insp) => {
          const media = await db.select().from(inspirationMedia).where(eq(inspirationMedia.inspirationId, insp.id));
          const [vendor] = await db.select({
            id: vendors.id,
            businessName: vendors.businessName,
          }).from(vendors).where(eq(vendors.id, insp.vendorId));
          const [category] = await db.select().from(inspirationCategories).where(eq(inspirationCategories.id, insp.categoryId || ""));
          return { ...insp, media, vendor, category };
        })
      );

      res.json(inspirationsWithDetails);
    } catch (error) {
      console.error("Error fetching admin inspirations:", error);
      res.status(500).json({ error: "Kunne ikke hente inspirasjoner" });
    }
  });

  app.post("/api/admin/inspirations/:id/approve", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;

    try {
      const { id } = req.params;

      await db.update(inspirations)
        .set({ status: "approved", updatedAt: new Date() })
        .where(eq(inspirations.id, id));

      res.json({ message: "Inspirasjon godkjent" });
    } catch (error) {
      console.error("Error approving inspiration:", error);
      res.status(500).json({ error: "Kunne ikke godkjenne inspirasjon" });
    }
  });

  app.post("/api/admin/inspirations/:id/reject", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;

    try {
      const { id } = req.params;
      const { reason } = req.body;

      await db.update(inspirations)
        .set({
          status: "rejected",
          rejectionReason: reason || null,
          updatedAt: new Date(),
        })
        .where(eq(inspirations.id, id));

      res.json({ message: "Inspirasjon avvist" });
    } catch (error) {
      console.error("Error rejecting inspiration:", error);
      res.status(500).json({ error: "Kunne ikke avvise inspirasjon" });
    }
  });

  app.get("/api/admin/vendors/:id/features", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;

    try {
      const { id } = req.params;
      const features = await db.select().from(vendorFeatures).where(eq(vendorFeatures.vendorId, id));
      res.json(features);
    } catch (error) {
      console.error("Error fetching vendor features:", error);
      res.status(500).json({ error: "Kunne ikke hente funksjoner" });
    }
  });

  const VALID_FEATURE_KEYS = ["deliveries", "inspirations"];

  app.put("/api/admin/vendors/:id/features", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;

    try {
      const { id } = req.params;
      const { features } = req.body as { features: { featureKey: string; isEnabled: boolean }[] };

      if (!Array.isArray(features)) {
        return res.status(400).json({ error: "Ugyldig format" });
      }

      for (const feature of features) {
        if (!VALID_FEATURE_KEYS.includes(feature.featureKey)) {
          return res.status(400).json({ error: `Ugyldig funksjonsnøkkel: ${feature.featureKey}` });
        }
      }

      for (const feature of features) {
        const existing = await db.select().from(vendorFeatures)
          .where(and(eq(vendorFeatures.vendorId, id), eq(vendorFeatures.featureKey, feature.featureKey)));

        if (existing.length > 0) {
          await db.update(vendorFeatures)
            .set({ isEnabled: feature.isEnabled, updatedAt: new Date() })
            .where(and(eq(vendorFeatures.vendorId, id), eq(vendorFeatures.featureKey, feature.featureKey)));
        } else {
          await db.insert(vendorFeatures).values({
            vendorId: id,
            featureKey: feature.featureKey,
            isEnabled: feature.isEnabled,
          });
        }
      }

      res.json({ message: "Funksjoner oppdatert" });
    } catch (error) {
      console.error("Error updating vendor features:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere funksjoner" });
    }
  });

  app.get("/api/admin/vendors/:id/inspiration-categories", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;

    try {
      const { id } = req.params;
      const assignments = await db.select().from(vendorInspirationCategories).where(eq(vendorInspirationCategories.vendorId, id));
      res.json(assignments.map(a => a.categoryId));
    } catch (error) {
      console.error("Error fetching vendor categories:", error);
      res.status(500).json({ error: "Kunne ikke hente kategorier" });
    }
  });

  app.put("/api/admin/vendors/:id/inspiration-categories", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;

    try {
      const { id } = req.params;
      const { categoryIds } = req.body as { categoryIds: string[] };

      if (!Array.isArray(categoryIds)) {
        return res.status(400).json({ error: "Ugyldig format" });
      }

      if (categoryIds.length > 0) {
        const validCategories = await db.select({ id: inspirationCategories.id }).from(inspirationCategories);
        const validCategoryIds = validCategories.map(c => c.id);
        
        for (const catId of categoryIds) {
          if (!validCategoryIds.includes(catId)) {
            return res.status(400).json({ error: `Ugyldig kategori-ID: ${catId}` });
          }
        }
      }

      await db.delete(vendorInspirationCategories).where(eq(vendorInspirationCategories.vendorId, id));

      if (categoryIds.length > 0) {
        await db.insert(vendorInspirationCategories).values(
          categoryIds.map(categoryId => ({
            vendorId: id,
            categoryId,
          }))
        );
      }

      res.json({ message: "Kategorier oppdatert" });
    } catch (error) {
      console.error("Error updating vendor categories:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere kategorier" });
    }
  });

  app.get("/api/vendor/allowed-categories", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const assignments = await db.select().from(vendorInspirationCategories).where(eq(vendorInspirationCategories.vendorId, vendorId));
      
      if (assignments.length === 0) {
        const allCategories = await db.select().from(inspirationCategories);
        res.json(allCategories);
      } else {
        const categoryIds = assignments.map(a => a.categoryId);
        const allowedCategories = await db.select().from(inspirationCategories);
        res.json(allowedCategories.filter(c => categoryIds.includes(c.id)));
      }
    } catch (error) {
      console.error("Error fetching allowed categories:", error);
      res.status(500).json({ error: "Kunne ikke hente kategorier" });
    }
  });

  app.get("/api/vendor/features", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const features = await db.select().from(vendorFeatures).where(eq(vendorFeatures.vendorId, vendorId));
      
      const featureMap: Record<string, boolean> = {
        deliveries: true,
        inspirations: true,
      };

      for (const f of features) {
        featureMap[f.featureKey] = f.isEnabled;
      }

      res.json(featureMap);
    } catch (error) {
      console.error("Error fetching vendor features:", error);
      res.status(500).json({ error: "Kunne ikke hente funksjoner" });
    }
  });

  app.post("/api/inspirations/:id/inquiry", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const validation = createInquirySchema.safeParse({ ...req.body, inspirationId: id });
      
      if (!validation.success) {
        return res.status(400).json({
          error: "Ugyldig data",
          details: validation.error.errors,
        });
      }

      const [inspiration] = await db.select().from(inspirations).where(eq(inspirations.id, id));
      if (!inspiration || inspiration.status !== "approved") {
        return res.status(404).json({ error: "Inspirasjon ikke funnet" });
      }

      const featureRows = await db.select().from(vendorFeatures)
        .where(and(eq(vendorFeatures.vendorId, inspiration.vendorId), eq(vendorFeatures.featureKey, "inspirations")));
      
      if (featureRows.length > 0 && !featureRows[0].isEnabled) {
        return res.status(403).json({ error: "Denne leverandøren har deaktivert inspirasjoner" });
      }

      if (!inspiration.allowInquiryForm) {
        return res.status(400).json({ error: "Forespørsler er ikke aktivert for denne inspirasjonen" });
      }

      const { inspirationId, ...inquiryData } = validation.data;

      await db.insert(inspirationInquiries).values({
        inspirationId: id,
        vendorId: inspiration.vendorId,
        name: inquiryData.name,
        email: inquiryData.email,
        phone: inquiryData.phone || null,
        message: inquiryData.message,
        weddingDate: inquiryData.weddingDate || null,
      });

      res.status(201).json({ message: "Forespørsel sendt!" });
    } catch (error) {
      console.error("Error creating inquiry:", error);
      res.status(500).json({ error: "Kunne ikke sende forespørsel" });
    }
  });

  app.get("/api/vendor/inquiries", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const inquiries = await db.select().from(inspirationInquiries).where(eq(inspirationInquiries.vendorId, vendorId));
      
      const inquiriesWithDetails = await Promise.all(
        inquiries.map(async (inq) => {
          const [insp] = await db.select({ title: inspirations.title }).from(inspirations).where(eq(inspirations.id, inq.inspirationId));
          return { ...inq, inspirationTitle: insp?.title };
        })
      );

      res.json(inquiriesWithDetails);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      res.status(500).json({ error: "Kunne ikke hente forespørsler" });
    }
  });

  app.patch("/api/vendor/inquiries/:id/status", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { id } = req.params;
      const { status } = req.body;

      const [inquiry] = await db.select().from(inspirationInquiries).where(eq(inspirationInquiries.id, id));
      if (!inquiry || inquiry.vendorId !== vendorId) {
        return res.status(404).json({ error: "Forespørsel ikke funnet" });
      }

      await db.update(inspirationInquiries)
        .set({ status })
        .where(eq(inspirationInquiries.id, id));

      res.json({ message: "Status oppdatert" });
    } catch (error) {
      console.error("Error updating inquiry status:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere status" });
    }
  });

  // ============ COUPLE AUTHENTICATION ============

  async function checkCoupleAuth(req: Request, res: Response): Promise<string | null> {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      res.status(401).json({ error: "Ikke autentisert" });
      return null;
    }

    const token = authHeader.substring(7);
    
    // Check in-memory cache first
    const cached = COUPLE_SESSIONS.get(token);
    if (cached && cached.expiresAt > new Date()) {
      return cached.coupleId;
    }

    // Check database
    const [session] = await db.select().from(coupleSessions).where(eq(coupleSessions.token, token));
    if (!session || session.expiresAt < new Date()) {
      res.status(401).json({ error: "Sesjon utløpt" });
      return null;
    }

    // Cache the session
    COUPLE_SESSIONS.set(token, { coupleId: session.coupleId, expiresAt: session.expiresAt });
    return session.coupleId;
  }

  // Couple login/register (email + password)
  app.post("/api/couples/login", async (req: Request, res: Response) => {
    try {
      console.log("[CoupleLogin] Login attempt for email:", req.body.email);
      console.log("[CoupleLogin] Body keys:", Object.keys(req.body || {}));

      // Accept login without displayName (use email prefix as fallback)
      const bodyWithDefaults = {
        ...req.body,
        displayName: req.body.displayName || req.body.email?.split("@")[0] || "User",
      };

      const validation = coupleLoginSchema.safeParse(bodyWithDefaults);
      if (!validation.success) {
        console.log("[CoupleLogin] Validation failed:", JSON.stringify(validation.error.errors));
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const { email, displayName, password } = validation.data;
      const { selectedTraditions } = req.body; // Optional traditions array

      console.log("[CoupleLogin] Starting lookup for email:", email);

      // Find or create couple profile
      const coupleResults = await db.select({
        id: coupleProfiles.id,
        email: coupleProfiles.email,
        displayName: coupleProfiles.displayName,
        password: coupleProfiles.password,
        partnerEmail: coupleProfiles.partnerEmail,
        weddingDate: coupleProfiles.weddingDate,
        selectedTraditions: coupleProfiles.selectedTraditions,
        lastActiveAt: coupleProfiles.lastActiveAt,
        createdAt: coupleProfiles.createdAt,
        updatedAt: coupleProfiles.updatedAt,
      })
        .from(coupleProfiles)
        .where(eq(coupleProfiles.email, email));
      
      let couple = coupleResults[0] || null;
      let isNewRegistration = false;

      console.log("[CoupleLogin] Lookup result:", couple ? "Found" : "Not found");

      if (!couple) {
        // New registration - hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        const [newCouple] = await db.insert(coupleProfiles)
          .values({ 
            email, 
            displayName, 
            password: hashedPassword,
            selectedTraditions: selectedTraditions || null,
          })
          .returning();
        couple = newCouple;
        isNewRegistration = true;
      } else {
        // Existing couple - verify password
        if (!couple.password) {
          // Account exists but has no password (old account)
          return res.status(401).json({ error: "Kontoen din har ingen passord. Kontakt support." });
        }

        const passwordMatch = await bcrypt.compare(password, couple.password);
        if (!passwordMatch) {
          return res.status(401).json({ error: "Ugyldig e-post eller passord" });
        }

        // Update display name only if an explicit displayName was provided in the request
        // Don't overwrite with the email-prefix fallback
        const explicitDisplayName = req.body.displayName;
        if (explicitDisplayName && couple.displayName !== explicitDisplayName) {
          await db.update(coupleProfiles)
            .set({ displayName: explicitDisplayName, updatedAt: new Date() })
            .where(eq(coupleProfiles.id, couple.id));
          couple.displayName = explicitDisplayName;
        }
      }

      // Auto-populate timeline for new registrations with tradition selection
      if (isNewRegistration && selectedTraditions && selectedTraditions.length > 0) {
        // Use the first selected tradition as primary (resolve legacy keys → synced keys)
        const primaryTradition = resolveTraditionKey(selectedTraditions[0]);
        const template = TIMELINE_TEMPLATES[primaryTradition] || DEFAULT_TIMELINE;
        
        // Insert timeline events
        const timelineValues = template.map(event => ({
          coupleId: couple.id,
          time: event.time,
          title: event.title,
          icon: event.icon,
        }));

        if (timelineValues.length > 0) {
          await db.insert(scheduleEvents).values(timelineValues);
        }
      }

      // Create session
      const token = generateSessionToken();
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

      await db.insert(coupleSessions).values({
        coupleId: couple.id,
        token,
        expiresAt,
      });

      COUPLE_SESSIONS.set(token, { coupleId: couple.id, expiresAt });

      // Remove password hash from response
      const { password: _pw, ...coupleWithoutPassword } = couple;
      res.json({ couple: coupleWithoutPassword, sessionToken: token });
    } catch (error) {
      console.error("[CoupleLogin] Error:", error);
      if (error instanceof Error) {
        console.error("[CoupleLogin] Error message:", error.message);
        console.error("[CoupleLogin] Error stack:", error.stack);
      }
      res.status(500).json({ error: "Kunne ikke logge inn" });
    }
  });

  app.post("/api/couples/logout", async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.substring(7);
      COUPLE_SESSIONS.delete(token);
      await db.delete(coupleSessions).where(eq(coupleSessions.token, token));
    }
    res.json({ message: "Logget ut" });
  });

  app.get("/api/couples/me", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const [couple] = await db.select().from(coupleProfiles).where(eq(coupleProfiles.id, coupleId));
      if (!couple) {
        return res.status(404).json({ error: "Profil ikke funnet" });
      }
      // Remove password hash from response
      const { password: _pw, ...coupleWithoutPassword } = couple;
      res.json(coupleWithoutPassword);
    } catch (error) {
      console.error("Error fetching couple profile:", error);
      res.status(500).json({ error: "Kunne ikke hente profil" });
    }
  });

  // Update couple profile
  app.put("/api/couples/me", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { displayName, weddingDate, selectedTraditions, expectedGuests } = req.body;
      
      const updateData: any = { updatedAt: new Date() };
      if (displayName !== undefined) updateData.displayName = displayName;
      if (weddingDate !== undefined) updateData.weddingDate = weddingDate;
      if (selectedTraditions !== undefined) updateData.selectedTraditions = selectedTraditions;
      if (expectedGuests !== undefined) updateData.expectedGuests = expectedGuests;

      const [updated] = await db.update(coupleProfiles)
        .set(updateData)
        .where(eq(coupleProfiles.id, coupleId))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating couple profile:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere profil" });
    }
  });

  // ============ COUPLE PROJECTS (from legacy.projects) ============

  // Get projects where couple is the client
  app.get("/api/couples/projects", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      // Get the couple's email
      const [couple] = await db.select().from(coupleProfiles).where(eq(coupleProfiles.id, coupleId));
      if (!couple) {
        return res.status(404).json({ error: "Profil ikke funnet" });
      }

      // Query legacy.projects where this couple is the client
      const projects = await db.execute(sql`
        SELECT 
          p.id, p.name, p.description, p.status, p.event_date,
          p.category, p.location, p.client_email,
          p.budget, p.created_at, p.updated_at,
          u.email as vendor_email,
          v.business_name as vendor_name, vc.name as vendor_category,
          v.phone as vendor_phone, v.location as vendor_location
        FROM legacy.projects p
        LEFT JOIN users u ON u.id = p.user_id
        LEFT JOIN vendors v ON v.email = u.email
        LEFT JOIN vendor_categories vc ON vc.id = v.category_id
        WHERE p.client_email = ${couple.email}
        ORDER BY p.event_date DESC
      `);

      res.json({ projects: projects.rows || [] });
    } catch (error) {
      console.error("Error fetching couple projects:", error);
      res.status(500).json({ error: "Kunne ikke hente prosjekter" });
    }
  });

  // Get single project details
  app.get("/api/couples/projects/:projectId", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const [couple] = await db.select().from(coupleProfiles).where(eq(coupleProfiles.id, coupleId));
      if (!couple) {
        return res.status(404).json({ error: "Profil ikke funnet" });
      }

      const result = await db.execute(sql`
        SELECT 
          p.id, p.name, p.description, p.status, p.event_date,
          p.category, p.location, p.client_email,
          p.budget, p.created_at, p.updated_at,
          u.email as vendor_email,
          v.business_name as vendor_name, vc.name as vendor_category,
          v.phone as vendor_phone, v.location as vendor_location,
          v.id as vendor_id
        FROM legacy.projects p
        LEFT JOIN users u ON u.id = p.user_id
        LEFT JOIN vendors v ON v.email = u.email
        LEFT JOIN vendor_categories vc ON vc.id = v.category_id
        WHERE p.id = ${req.params.projectId}
          AND p.client_email = ${couple.email}
      `);

      if (!result.rows || result.rows.length === 0) {
        return res.status(404).json({ error: "Prosjekt ikke funnet" });
      }

      res.json({ project: result.rows[0] });
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ error: "Kunne ikke hente prosjekt" });
    }
  });

  // Get couple dashboard (profile + projects + vendors + bookings)
  app.get("/api/couples/dashboard", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const [couple] = await db.select().from(coupleProfiles).where(eq(coupleProfiles.id, coupleId));
      if (!couple) {
        return res.status(404).json({ error: "Profil ikke funnet" });
      }
      const { password: _pw, ...coupleData } = couple;

      // Get projects
      const projects = await db.execute(sql`
        SELECT p.id, p.name, p.status, p.event_date, p.location, p.budget,
               v.business_name as vendor_name, vc.name as vendor_category
        FROM legacy.projects p
        LEFT JOIN users u ON u.id = p.user_id
        LEFT JOIN vendors v ON v.email = u.email
        LEFT JOIN vendor_categories vc ON vc.id = v.category_id
        WHERE p.client_email = ${couple.email}
        ORDER BY p.event_date DESC
      `);

      // Get bookings
      const bookings = await db.execute(sql`
        SELECT id, client_name, date, event_type, location, status, created_at
        FROM bookings
        WHERE client_email = ${couple.email}
        ORDER BY date DESC
      `);

      // Get vendors from projects
      const vendorList = await db.execute(sql`
        SELECT DISTINCT v.id, v.business_name, vc.name as category, v.email, v.phone, v.location
        FROM legacy.projects p
        JOIN users u ON u.id = p.user_id
        JOIN vendors v ON v.email = u.email
        LEFT JOIN vendor_categories vc ON vc.id = v.category_id
        WHERE p.client_email = ${couple.email}
      `);

      res.json({
        couple: coupleData,
        projects: projects.rows || [],
        bookings: bookings.rows || [],
        vendors: vendorList.rows || [],
        stats: {
          totalProjects: (projects.rows || []).length,
          totalVendors: (vendorList.rows || []).length,
          totalBookings: (bookings.rows || []).length,
        }
      });
    } catch (error) {
      console.error("Error fetching couple dashboard:", error);
      res.status(500).json({ error: "Kunne ikke hente dashboard" });
    }
  });

  // Get vendors assigned to couple's projects
  app.get("/api/couples/vendors", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const [couple] = await db.select().from(coupleProfiles).where(eq(coupleProfiles.id, coupleId));
      if (!couple) {
        return res.status(404).json({ error: "Profil ikke funnet" });
      }

      const vendorList = await db.execute(sql`
        SELECT DISTINCT v.id, v.business_name, vc.name as category, v.email, v.phone, v.location,
               p.name as project_name, p.event_date
        FROM legacy.projects p
        JOIN users u ON u.id = p.user_id
        JOIN vendors v ON v.email = u.email
        LEFT JOIN vendor_categories vc ON vc.id = v.category_id
        WHERE p.client_email = ${couple.email}
      `);

      res.json({ vendors: vendorList.rows || [] });
    } catch (error) {
      console.error("Error fetching couple vendors:", error);
      res.status(500).json({ error: "Kunne ikke hente leverandører" });
    }
  });

  // ============ CONVERSATIONS & MESSAGES ============

  // Get couple's conversations
  app.get("/api/couples/conversations", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const convos = await db.select().from(conversations)
        .where(and(
          eq(conversations.coupleId, coupleId),
          eq(conversations.deletedByCouple, false)
        ))
        .orderBy(desc(conversations.lastMessageAt));

      // Enrich with vendor and inspiration info
      const enriched = await Promise.all(convos.map(async (conv) => {
        const [vendor] = await db.select({ id: vendors.id, businessName: vendors.businessName })
          .from(vendors).where(eq(vendors.id, conv.vendorId));
        
        let inspiration = null;
        if (conv.inspirationId) {
          const [insp] = await db.select({ id: inspirations.id, title: inspirations.title, coverImageUrl: inspirations.coverImageUrl })
            .from(inspirations).where(eq(inspirations.id, conv.inspirationId));
          inspiration = insp;
        }

        // Get last message
        const [lastMsg] = await db.select().from(messages)
          .where(eq(messages.conversationId, conv.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        return { ...conv, vendor, inspiration, lastMessage: lastMsg };
      }));

      res.json(enriched);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ error: "Kunne ikke hente samtaler" });
    }
  });

  // Get vendor's conversations
  app.get("/api/vendor/conversations", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const convos = await db.select().from(conversations)
        .where(and(
          eq(conversations.vendorId, vendorId),
          eq(conversations.deletedByVendor, false)
        ))
        .orderBy(desc(conversations.lastMessageAt));

      const enriched = await Promise.all(convos.map(async (conv) => {
        const [couple] = await db.select({ id: coupleProfiles.id, displayName: coupleProfiles.displayName, email: coupleProfiles.email })
          .from(coupleProfiles).where(eq(coupleProfiles.id, conv.coupleId));
        
        let inspiration = null;
        if (conv.inspirationId) {
          const [insp] = await db.select({ id: inspirations.id, title: inspirations.title })
            .from(inspirations).where(eq(inspirations.id, conv.inspirationId));
          inspiration = insp;
        }

        const [lastMsg] = await db.select().from(messages)
          .where(eq(messages.conversationId, conv.id))
          .orderBy(desc(messages.createdAt))
          .limit(1);

        return { ...conv, couple, inspiration, lastMessage: lastMsg };
      }));

      res.json(enriched);
    } catch (error) {
      console.error("Error fetching vendor conversations:", error);
      res.status(500).json({ error: "Kunne ikke hente samtaler" });
    }
  });

  // Get a single conversation by ID (vendor)
  app.get("/api/vendor/conversations/:id", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { id } = req.params;

      const [conv] = await db.select().from(conversations)
        .where(and(
          eq(conversations.id, id),
          eq(conversations.vendorId, vendorId)
        ));

      if (!conv) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }

      // Enrich with couple info
      const [couple] = await db.select({ 
        id: coupleProfiles.id, 
        displayName: coupleProfiles.displayName, 
        email: coupleProfiles.email 
      })
        .from(coupleProfiles)
        .where(eq(coupleProfiles.id, conv.coupleId));

      // Get inspiration if linked
      let inspiration = null;
      if (conv.inspirationId) {
        const [insp] = await db.select({ id: inspirations.id, title: inspirations.title })
          .from(inspirations).where(eq(inspirations.id, conv.inspirationId));
        inspiration = insp;
      }

      // Get last message
      const [lastMsg] = await db.select().from(messages)
        .where(eq(messages.conversationId, conv.id))
        .orderBy(desc(messages.createdAt))
        .limit(1);

      res.json({ ...conv, couple, inspiration, lastMessage: lastMsg });
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ error: "Kunne ikke hente samtale" });
    }
  });

  // Get messages in a conversation (couple)
  app.get("/api/couples/conversations/:id/messages", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;

      const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
      if (!conv || conv.coupleId !== coupleId) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }

      const msgs = await db.select().from(messages)
        .where(and(
          eq(messages.conversationId, id),
          eq(messages.deletedByCouple, false)
        ))
        .orderBy(messages.createdAt);

      // Mark as read
      await db.update(conversations)
        .set({ coupleUnreadCount: 0 })
        .where(eq(conversations.id, id));

      res.json(msgs);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Kunne ikke hente meldinger" });
    }
  });

  // Get conversation details with vendor info (couple)
  app.get("/api/couples/conversations/:id/details", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      
      const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
      if (!conv || conv.coupleId !== coupleId) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }
      
      // Get vendor profile
      const [vendor] = await db.select().from(vendors).where(eq(vendors.id, conv.vendorId));
      
      res.json({
        conversation: conv,
        vendor: vendor ? {
          id: vendor.id,
          businessName: vendor.businessName,
          email: vendor.email,
          phone: vendor.phone,
        } : null,
        vendorTypingAt: conv.vendorTypingAt,
      });
    } catch (error) {
      console.error("Error fetching conversation details:", error);
      res.status(500).json({ error: "Kunne ikke hente samtaledetaljer" });
    }
  });

  // Get messages in a conversation (vendor)
  app.get("/api/vendor/conversations/:id/messages", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { id } = req.params;

      const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
      if (!conv || conv.vendorId !== vendorId) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }

      const msgs = await db.select().from(messages)
        .where(and(
          eq(messages.conversationId, id),
          eq(messages.deletedByVendor, false)
        ))
        .orderBy(messages.createdAt);

      // Mark as read
      await db.update(conversations)
        .set({ vendorUnreadCount: 0 })
        .where(eq(conversations.id, id));

      res.json(msgs);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Kunne ikke hente meldinger" });
    }
  });

  // Send message (couple)
  app.post("/api/couples/messages", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const validation = sendMessageSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const { conversationId, vendorId, inspirationId, body, attachmentUrl, attachmentType } = validation.data;

      let convId = conversationId;

      // If no conversation exists, create one
      if (!convId && vendorId) {
        // Check if conversation already exists
        let [existing] = await db.select().from(conversations)
          .where(and(eq(conversations.coupleId, coupleId), eq(conversations.vendorId, vendorId)));

        if (existing) {
          convId = existing.id;
        } else {
          const [newConv] = await db.insert(conversations)
            .values({
              coupleId,
              vendorId,
              inspirationId: inspirationId || null,
              status: "active",
              lastMessageAt: new Date(),
              vendorUnreadCount: 1,
            })
            .returning();
          convId = newConv.id;
        }
      }

      if (!convId) {
        return res.status(400).json({ error: "Mangler samtale eller leverandør-ID" });
      }

      // Verify couple owns this conversation
      const [conv] = await db.select().from(conversations).where(eq(conversations.id, convId));
      if (!conv || conv.coupleId !== coupleId) {
        return res.status(403).json({ error: "Ingen tilgang til denne samtalen" });
      }

      // Insert message
      const [msg] = await db.insert(messages)
        .values({
          conversationId: convId,
          senderType: "couple",
          senderId: coupleId,
          body: body || "",
          attachmentUrl: attachmentUrl || null,
          attachmentType: attachmentType || null,
        })
        .returning();

      // Update conversation
      await db.update(conversations)
        .set({
          lastMessageAt: new Date(),
          vendorUnreadCount: (conv.vendorUnreadCount || 0) + 1,
        })
        .where(eq(conversations.id, convId));

      // Broadcast to listeners of this conversation
      broadcastConversation(convId, { type: "message", payload: msg });

      // Broadcast to vendor list listeners
      const msgCreatedAt = msg.createdAt || new Date();
      broadcastVendorList(conv.vendorId, { type: "conv-update", payload: { conversationId: convId, lastMessageAt: msgCreatedAt.toISOString(), vendorUnreadCount: (conv.vendorUnreadCount || 0) + 1 } });

      res.status(201).json(msg);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ error: "Kunne ikke sende melding" });
    }
  });

  // Send message (vendor)
  app.post("/api/vendor/messages", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { conversationId, body, attachmentUrl, attachmentType } = req.body;

      if (!conversationId || (!body && !attachmentUrl)) {
        return res.status(400).json({ error: "Mangler samtale-ID eller melding" });
      }

      // Verify vendor owns this conversation
      const [conv] = await db.select().from(conversations).where(eq(conversations.id, conversationId));
      if (!conv || conv.vendorId !== vendorId) {
        return res.status(403).json({ error: "Ingen tilgang til denne samtalen" });
      }

      // Insert message
      const [msg] = await db.insert(messages)
        .values({
          conversationId,
          senderType: "vendor",
          senderId: vendorId,
          body: body || "",
          attachmentUrl: attachmentUrl || null,
          attachmentType: attachmentType || null,
        })
        .returning();

      // Update conversation
      await db.update(conversations)
        .set({
          lastMessageAt: new Date(),
          coupleUnreadCount: (conv.coupleUnreadCount || 0) + 1,
        })
        .where(eq(conversations.id, conversationId));

      // Broadcast to listeners of this conversation
      broadcastConversation(conversationId, { type: "message", payload: msg });

      // Broadcast to couple list listeners
      const msgCreatedAt = msg.createdAt || new Date();
      broadcastCoupleList(conv.coupleId, { type: "conv-update", payload: { conversationId, lastMessageAt: msgCreatedAt.toISOString(), coupleUnreadCount: (conv.coupleUnreadCount || 0) + 1 } });

      res.status(201).json(msg);
    } catch (error) {
      console.error("Error sending vendor message:", error);
      res.status(500).json({ error: "Kunne ikke sende melding" });
    }
  });

  // --- Vendor ↔ Admin Chat ---

  // Ensure a single admin conversation exists per vendor, create if missing
  app.get("/api/vendor/admin/conversation", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const existing = await db.select().from(adminConversations).where(eq(adminConversations.vendorId, vendorId));
      let conv = existing[0];
      if (!conv) {
        const [created] = await db.insert(adminConversations)
          .values({ vendorId })
          .returning();
        conv = created;
      }
      res.json(conv);
    } catch (error) {
      console.error("Error fetching admin conversation:", error);
      res.status(500).json({ error: "Kunne ikke hente admin-samtale" });
    }
  });

  // List messages in vendor's admin conversation
  app.get("/api/vendor/admin/messages", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const [conv] = await db.select().from(adminConversations).where(eq(adminConversations.vendorId, vendorId));
      if (!conv) {
        return res.json([]);
      }

      const msgs = await db.select().from(adminMessages)
        .where(eq(adminMessages.conversationId, conv.id))
        .orderBy(desc(adminMessages.createdAt));

      // mark vendor unread as 0
      await db.update(adminConversations)
        .set({ vendorUnreadCount: 0 })
        .where(eq(adminConversations.id, conv.id));

      res.json(msgs);
    } catch (error) {
      console.error("Error fetching admin messages:", error);
      res.status(500).json({ error: "Kunne ikke hente admin-meldinger" });
    }
  });

  // Send message from vendor to admin
  app.post("/api/vendor/admin/messages", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access  
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { body, attachmentUrl, attachmentType } = req.body as any;
      const parse = sendAdminMessageSchema.safeParse({ body, attachmentUrl, attachmentType });
      if (!parse.success) {
        return res.status(400).json({ error: parse.error.errors[0]?.message || "Ugyldig melding" });
      }

      const [conv] = await db.select().from(adminConversations).where(eq(adminConversations.vendorId, vendorId));
      let conversationId = conv?.id;
      if (!conversationId) {
        const [created] = await db.insert(adminConversations)
          .values({ vendorId })
          .returning();
        conversationId = created.id;
      }

      const [msg] = await db.insert(adminMessages)
        .values({
          conversationId,
          senderType: "vendor",
          senderId: vendorId,
          body,
          attachmentUrl: attachmentUrl || null,
          attachmentType: attachmentType || null,
        })
        .returning();

      const newLast = new Date();
      const newAdminUnread = (conv?.adminUnreadCount || 0) + 1;
      await db.update(adminConversations)
        .set({
          lastMessageAt: newLast,
          adminUnreadCount: newAdminUnread,
        })
        .where(eq(adminConversations.id, conversationId));

      // broadcast to this conversation
      broadcastAdminConv(conversationId, { type: "message", payload: msg });
      // broadcast list update
      broadcastAdminList({ type: "conv-update", payload: { conversationId, lastMessageAt: newLast.toISOString(), adminUnreadCount: newAdminUnread } });

      res.status(201).json(msg);
    } catch (error) {
      console.error("Error sending admin message:", error);
      res.status(500).json({ error: "Kunne ikke sende melding til admin" });
    }
  });

  // Admin endpoints to read and reply
  app.get("/api/admin/vendor-admin-conversations", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    try {
      const rows = await db.select({
        conv: adminConversations,
        vendor: vendors,
      })
        .from(adminConversations)
        .leftJoin(vendors, eq(adminConversations.vendorId, vendors.id))
        .orderBy(desc(adminConversations.lastMessageAt));
      res.json(rows);
    } catch (error) {
      console.error("Error listing admin convs:", error);
      res.status(500).json({ error: "Kunne ikke liste admin-samtaler" });
    }
  });

  app.get("/api/admin/vendor-admin-conversations/:id/messages", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    try {
      const { id } = req.params;
      const msgs = await db.select().from(adminMessages)
        .where(eq(adminMessages.conversationId, id))
        .orderBy(desc(adminMessages.createdAt));
      // reset admin unread
      await db.update(adminConversations)
        .set({ adminUnreadCount: 0 })
        .where(eq(adminConversations.id, id));
      res.json(msgs);
    } catch (error) {
      console.error("Error fetching admin msgs:", error);
      res.status(500).json({ error: "Kunne ikke hente meldinger" });
    }
  });

  app.post("/api/admin/vendor-admin-conversations/:id/messages", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    try {
      const { id } = req.params;
      const { body, attachmentUrl, attachmentType, videoGuideId } = req.body as any;
      const parse = sendAdminMessageSchema.safeParse({ body, attachmentUrl, attachmentType, videoGuideId });
      if (!parse.success) {
        return res.status(400).json({ error: parse.error.errors[0]?.message || "Ugyldig melding" });
      }

      const [msg] = await db.insert(adminMessages)
        .values({
          conversationId: id,
          senderType: "admin",
          senderId: "admin",
          body,
          attachmentUrl: attachmentUrl || null,
          attachmentType: attachmentType || null,
          videoGuideId: videoGuideId || null,
        })
        .returning();

      const newLast = new Date();
      await db.update(adminConversations)
        .set({
          lastMessageAt: newLast,
          vendorUnreadCount: sql`COALESCE(${adminConversations.vendorUnreadCount}, 0) + 1`,
        })
        .where(eq(adminConversations.id, id));

      // broadcast to this conversation
      broadcastAdminConv(id, { type: "message", payload: msg });
      // broadcast list update (adminUnreadCount likely unchanged when admin sends)
      broadcastAdminList({ type: "conv-update", payload: { conversationId: id, lastMessageAt: newLast.toISOString() } });

      res.status(201).json(msg);
    } catch (error) {
      console.error("Error sending admin reply:", error);
      res.status(500).json({ error: "Kunne ikke sende admin-svar" });
    }
  });

  // Admin typing indicator for vendor-admin chat
  app.post("/api/admin/vendor-admin-conversations/:id/typing", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    try {
      const { id } = req.params;
      broadcastAdminConv(id, { type: "typing", payload: { sender: "admin", at: new Date().toISOString() } });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Kunne ikke sende skrive-status" });
    }
  });

  // Update conversation status (resolve/reopen)
  app.patch("/api/admin/vendor-admin-conversations/:id/status", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["active", "resolved"].includes(status)) {
        return res.status(400).json({ error: "Ugyldig status" });
      }

      await db
        .update(adminConversations)
        .set({ status })
        .where(eq(adminConversations.id, id));

      broadcastAdminConv(id, { type: "status-update", payload: { status, updatedAt: new Date().toISOString() } });
      res.json({ success: true, status });
    } catch (error) {
      console.error("Error updating conversation status:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere status" });
    }
  });

  // Edit a message (couple)
  app.patch("/api/couples/messages/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const { body } = req.body;

      // Validate body
      if (!body || typeof body !== "string" || body.trim() === "") {
        return res.status(400).json({ error: "Melding kan ikke være tom" });
      }

      // Verify message exists and belongs to this couple
      const [msg] = await db.select().from(messages).where(eq(messages.id, id));
      if (!msg) {
        return res.status(404).json({ error: "Melding ikke funnet" });
      }

      // Verify sender is the couple
      if (msg.senderType !== "couple" || msg.senderId !== coupleId) {
        return res.status(403).json({ error: "Du kan bare redigere dine egne meldinger" });
      }

      // Verify couple has access to this conversation
      const [conv] = await db.select().from(conversations).where(eq(conversations.id, msg.conversationId));
      if (!conv || conv.coupleId !== coupleId) {
        return res.status(403).json({ error: "Ingen tilgang til denne samtalen" });
      }

      // Update message
      const [updated] = await db.update(messages)
        .set({ 
          body: body.trim(),
          editedAt: new Date()
        })
        .where(eq(messages.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error editing message:", error);
      res.status(500).json({ error: "Kunne ikke redigere melding" });
    }
  });

  // Vendor typing indicator
  app.post("/api/vendor/conversations/:id/typing", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access for messaging
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { id } = req.params;

      // Verify vendor owns this conversation
      const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
      if (!conv || conv.vendorId !== vendorId) {
        return res.status(403).json({ error: "Ingen tilgang til denne samtalen" });
      }

      // Update vendor typing timestamp
      await db.update(conversations)
        .set({
          vendorTypingAt: new Date(),
        })
        .where(eq(conversations.id, id));

      // Broadcast typing to couple client(s)
      broadcastConversation(id, { type: "typing", payload: { sender: "vendor", at: new Date().toISOString() } });

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating typing status:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere skrive-status" });
    }
  });

  // Couple typing indicator
  app.post("/api/couples/conversations/:id/typing", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;

      // Verify couple owns this conversation
      const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
      if (!conv || conv.coupleId !== coupleId) {
        return res.status(403).json({ error: "Ingen tilgang til denne samtalen" });
      }

      // Update couple typing timestamp
      await db.update(conversations)
        .set({
          coupleTypingAt: new Date(),
        })
        .where(eq(conversations.id, id));

      // Broadcast typing to vendor client(s)
      broadcastConversation(id, { type: "typing", payload: { sender: "couple", at: new Date().toISOString() } });

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating typing status:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere skrive-status" });
    }
  });

  // GDPR: Delete a single message (couple)
  app.delete("/api/couples/messages/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;

      // Verify message belongs to a conversation the couple owns
      const [msg] = await db.select().from(messages).where(eq(messages.id, id));
      if (!msg) {
        return res.status(404).json({ error: "Melding ikke funnet" });
      }

      const [conv] = await db.select().from(conversations).where(eq(conversations.id, msg.conversationId));
      if (!conv || conv.coupleId !== coupleId) {
        return res.status(403).json({ error: "Ingen tilgang til denne meldingen" });
      }

      // Soft delete for couple
      await db.update(messages)
        .set({ deletedByCouple: true, coupleDeletedAt: new Date() })
        .where(eq(messages.id, id));

      res.json({ success: true, message: "Melding slettet" });
    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ error: "Kunne ikke slette melding" });
    }
  });

  // GDPR: Delete entire conversation (couple)
  app.delete("/api/couples/conversations/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;

      const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
      if (!conv || conv.coupleId !== coupleId) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }

      // Soft delete conversation for couple
      await db.update(conversations)
        .set({ deletedByCouple: true, coupleDeletedAt: new Date() })
        .where(eq(conversations.id, id));

      // Soft delete all messages in conversation for couple
      await db.update(messages)
        .set({ deletedByCouple: true, coupleDeletedAt: new Date() })
        .where(eq(messages.conversationId, id));

      res.json({ success: true, message: "Samtale og meldinger slettet" });
    } catch (error) {
      console.error("Error deleting conversation:", error);
      res.status(500).json({ error: "Kunne ikke slette samtale" });
    }
  });

  // GDPR: Delete a single message (vendor)
  app.delete("/api/vendor/messages/:id", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { id } = req.params;

      const [msg] = await db.select().from(messages).where(eq(messages.id, id));
      if (!msg) {
        return res.status(404).json({ error: "Melding ikke funnet" });
      }

      const [conv] = await db.select().from(conversations).where(eq(conversations.id, msg.conversationId));
      if (!conv || conv.vendorId !== vendorId) {
        return res.status(403).json({ error: "Ingen tilgang til denne meldingen" });
      }

      await db.update(messages)
        .set({ deletedByVendor: true, vendorDeletedAt: new Date() })
        .where(eq(messages.id, id));

      res.json({ success: true, message: "Melding slettet" });
    } catch (error) {
      console.error("Error deleting vendor message:", error);
      res.status(500).json({ error: "Kunne ikke slette melding" });
    }
  });

  // Edit a message (vendor)
  app.patch("/api/vendor/messages/:id", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { id } = req.params;
      const { body } = req.body;

      if (!body || !body.trim()) {
        return res.status(400).json({ error: "Melding kan ikke være tom" });
      }

      const [msg] = await db.select().from(messages).where(eq(messages.id, id));
      if (!msg) {
        return res.status(404).json({ error: "Melding ikke funnet" });
      }

      if (msg.senderType !== "vendor") {
        return res.status(403).json({ error: "Du kan kun redigere dine egne meldinger" });
      }

      const [conv] = await db.select().from(conversations).where(eq(conversations.id, msg.conversationId));
      if (!conv || conv.vendorId !== vendorId) {
        return res.status(403).json({ error: "Ingen tilgang til denne meldingen" });
      }

      const [updated] = await db.update(messages)
        .set({ 
          body: body.trim(),
          editedAt: new Date(),
        })
        .where(eq(messages.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error editing vendor message:", error);
      res.status(500).json({ error: "Kunne ikke redigere melding" });
    }
  });

  // GDPR: Delete entire conversation (vendor)
  app.delete("/api/vendor/conversations/:id", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { id } = req.params;

      const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
      if (!conv || conv.vendorId !== vendorId) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }

      await db.update(conversations)
        .set({ deletedByVendor: true, vendorDeletedAt: new Date() })
        .where(eq(conversations.id, id));

      await db.update(messages)
        .set({ deletedByVendor: true, vendorDeletedAt: new Date() })
        .where(eq(messages.conversationId, id));

      res.json({ success: true, message: "Samtale og meldinger slettet" });
    } catch (error) {
      console.error("Error deleting vendor conversation:", error);
      res.status(500).json({ error: "Kunne ikke slette samtale" });
    }
  });

  // Start conversation from inquiry (updates existing inquiry with conversation)
  app.post("/api/couples/conversations/from-inquiry", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { inquiryId } = req.body;

      const [inquiry] = await db.select().from(inspirationInquiries).where(eq(inspirationInquiries.id, inquiryId));
      if (!inquiry) {
        return res.status(404).json({ error: "Henvendelse ikke funnet" });
      }

      // Check if conversation already exists for this inquiry
      let [existing] = await db.select().from(conversations).where(eq(conversations.inquiryId, inquiryId));
      if (existing) {
        return res.json(existing);
      }

      // Create new conversation
      const [conv] = await db.insert(conversations)
        .values({
          coupleId,
          vendorId: inquiry.vendorId,
          inspirationId: inquiry.inspirationId,
          inquiryId,
          status: "active",
          lastMessageAt: new Date(),
        })
        .returning();

      // Add initial message from inquiry
      await db.insert(messages).values({
        conversationId: conv.id,
        senderType: "couple",
        senderId: coupleId,
        body: inquiry.message,
      });

      res.status(201).json(conv);
    } catch (error) {
      console.error("Error creating conversation from inquiry:", error);
      res.status(500).json({ error: "Kunne ikke opprette samtale" });
    }
  });

  // Reminders endpoints
  app.get("/api/reminders", async (req: Request, res: Response) => {
    try {
      const allReminders = await db.select().from(reminders).orderBy(reminders.reminderDate);
      res.json(allReminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({ error: "Kunne ikke hente påminnelser" });
    }
  });

  app.post("/api/reminders", async (req: Request, res: Response) => {
    try {
      const validatedData = createReminderSchema.parse(req.body);
      const [newReminder] = await db.insert(reminders)
        .values({
          title: validatedData.title,
          description: validatedData.description,
          reminderDate: new Date(validatedData.reminderDate),
          category: validatedData.category,
        })
        .returning();
      res.status(201).json(newReminder);
    } catch (error) {
      console.error("Error creating reminder:", error);
      res.status(500).json({ error: "Kunne ikke opprette påminnelse" });
    }
  });

  app.patch("/api/reminders/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { isCompleted, notificationId } = req.body;

      const updates: Record<string, any> = { updatedAt: new Date() };
      if (isCompleted !== undefined) updates.isCompleted = isCompleted;
      if (notificationId !== undefined) updates.notificationId = notificationId;

      const [updated] = await db.update(reminders)
        .set(updates)
        .where(eq(reminders.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Påminnelse ikke funnet" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating reminder:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere påminnelse" });
    }
  });

  app.delete("/api/reminders/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [deleted] = await db.delete(reminders)
        .where(eq(reminders.id, id))
        .returning();

      if (!deleted) {
        return res.status(404).json({ error: "Påminnelse ikke funnet" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting reminder:", error);
      res.status(500).json({ error: "Kunne ikke slette påminnelse" });
    }
  });

  // Speech list endpoints
  app.get("/api/speeches", async (req: Request, res: Response) => {
    try {
      const coupleId = await checkCoupleAuth(req, res);
      const allSpeeches = await db.select()
        .from(speeches)
        .where(coupleId ? eq(speeches.coupleId, coupleId) : sql`1=1`)
        .orderBy(speeches.sortOrder);
      res.json(allSpeeches);
    } catch (error) {
      console.error("Error fetching speeches:", error);
      res.status(500).json({ error: "Kunne ikke hente taleliste" });
    }
  });

  app.post("/api/speeches", async (req: Request, res: Response) => {
    try {
      const coupleId = await checkCoupleAuth(req, res);
      const validatedData = createSpeechSchema.parse(req.body);
      
      // Get the max sort order
      const existingSpeeches = await db.select()
        .from(speeches)
        .where(coupleId ? eq(speeches.coupleId, coupleId) : sql`1=1`)
        .orderBy(desc(speeches.sortOrder));
      const maxOrder = existingSpeeches.length > 0 ? existingSpeeches[0].sortOrder : 0;
      
      const [newSpeech] = await db.insert(speeches)
        .values({
          coupleId: coupleId || undefined,
          speakerName: validatedData.speakerName,
          role: validatedData.role,
          durationMinutes: validatedData.durationMinutes,
          sortOrder: maxOrder + 1,
          notes: validatedData.notes,
          scheduledTime: validatedData.scheduledTime,
        })
        .returning();
      
      // Notify vendors if couple is authenticated
      if (coupleId) {
        const [couple] = await db.select({ displayName: coupleProfiles.displayName })
          .from(coupleProfiles).where(eq(coupleProfiles.id, coupleId));
        
        // Use inline notification since helper is defined later
        const contracts = await db.select({
          vendorId: coupleVendorContracts.vendorId,
          notifyOnSpeechChanges: coupleVendorContracts.notifyOnSpeechChanges,
        })
          .from(coupleVendorContracts)
          .where(and(
            eq(coupleVendorContracts.coupleId, coupleId),
            eq(coupleVendorContracts.status, "active")
          ));
        
        for (const contract of contracts) {
          if (contract.notifyOnSpeechChanges) {
            await db.insert(notifications).values({
              recipientType: "vendor",
              recipientId: contract.vendorId,
              type: "speech_changed",
              title: "Talelisteendring",
              body: `${couple?.displayName || 'Brudeparet'} har lagt til en ny tale av "${validatedData.speakerName}".`,
              actorType: "couple",
              actorId: coupleId,
              actorName: couple?.displayName || 'Brudeparet',
            });
          }
        }
      }
      
      res.status(201).json(newSpeech);
    } catch (error) {
      console.error("Error creating speech:", error);
      res.status(500).json({ error: "Kunne ikke opprette tale" });
    }
  });

  app.patch("/api/speeches/:id", async (req: Request, res: Response) => {
    try {
      const coupleId = await checkCoupleAuth(req, res);
      const { id } = req.params;
      const { speakerName, role, durationMinutes, sortOrder, notes, scheduledTime } = req.body;

      const updates: Record<string, any> = { updatedAt: new Date() };
      if (speakerName !== undefined) updates.speakerName = speakerName;
      if (role !== undefined) updates.role = role;
      if (durationMinutes !== undefined) updates.durationMinutes = durationMinutes;
      if (sortOrder !== undefined) updates.sortOrder = sortOrder;
      if (notes !== undefined) updates.notes = notes;
      if (scheduledTime !== undefined) updates.scheduledTime = scheduledTime;

      const [updated] = await db.update(speeches)
        .set(updates)
        .where(eq(speeches.id, id))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Tale ikke funnet" });
      }

      // Notify vendors if couple is authenticated
      if (coupleId && updated.coupleId) {
        const [couple] = await db.select({ displayName: coupleProfiles.displayName })
          .from(coupleProfiles).where(eq(coupleProfiles.id, coupleId));
        
        const contracts = await db.select({
          vendorId: coupleVendorContracts.vendorId,
          notifyOnSpeechChanges: coupleVendorContracts.notifyOnSpeechChanges,
        })
          .from(coupleVendorContracts)
          .where(and(
            eq(coupleVendorContracts.coupleId, coupleId),
            eq(coupleVendorContracts.status, "active")
          ));
        
        for (const contract of contracts) {
          if (contract.notifyOnSpeechChanges) {
            await db.insert(notifications).values({
              recipientType: "vendor",
              recipientId: contract.vendorId,
              type: "speech_changed",
              title: "Talelisteendring",
              body: `${couple?.displayName || 'Brudeparet'} har endret talen av "${updated.speakerName}".`,
              actorType: "couple",
              actorId: coupleId,
              actorName: couple?.displayName || 'Brudeparet',
            });
          }
        }
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating speech:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tale" });
    }
  });

  app.delete("/api/speeches/:id", async (req: Request, res: Response) => {
    try {
      const coupleId = await checkCoupleAuth(req, res);
      const { id } = req.params;
      
      // Get speech info before deleting for notification
      const [speechToDelete] = await db.select()
        .from(speeches)
        .where(eq(speeches.id, id));
      
      const [deleted] = await db.delete(speeches)
        .where(eq(speeches.id, id))
        .returning();

      if (!deleted) {
        return res.status(404).json({ error: "Tale ikke funnet" });
      }

      // Notify vendors if couple is authenticated
      if (coupleId && speechToDelete?.coupleId) {
        const [couple] = await db.select({ displayName: coupleProfiles.displayName })
          .from(coupleProfiles).where(eq(coupleProfiles.id, coupleId));
        
        const contracts = await db.select({
          vendorId: coupleVendorContracts.vendorId,
          notifyOnSpeechChanges: coupleVendorContracts.notifyOnSpeechChanges,
        })
          .from(coupleVendorContracts)
          .where(and(
            eq(coupleVendorContracts.coupleId, coupleId),
            eq(coupleVendorContracts.status, "active")
          ));
        
        for (const contract of contracts) {
          if (contract.notifyOnSpeechChanges) {
            await db.insert(notifications).values({
              recipientType: "vendor",
              recipientId: contract.vendorId,
              type: "speech_changed",
              title: "Talelisteendring",
              body: `${couple?.displayName || 'Brudeparet'} har fjernet talen av "${speechToDelete.speakerName}".`,
              actorType: "couple",
              actorId: coupleId,
              actorName: couple?.displayName || 'Brudeparet',
            });
          }
        }
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting speech:", error);
      res.status(500).json({ error: "Kunne ikke slette tale" });
    }
  });

  // Reorder speeches
  app.post("/api/speeches/reorder", async (req: Request, res: Response) => {
    try {
      const { orderedIds } = req.body;
      if (!Array.isArray(orderedIds)) {
        return res.status(400).json({ error: "orderedIds må være en liste" });
      }

      for (let i = 0; i < orderedIds.length; i++) {
        await db.update(speeches)
          .set({ sortOrder: i, updatedAt: new Date() })
          .where(eq(speeches.id, orderedIds[i]));
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error reordering speeches:", error);
      res.status(500).json({ error: "Kunne ikke sortere taler" });
    }
  });

  // Anti-ghosting: Mark messages as read and update last active
  app.post("/api/conversations/:id/mark-read", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { userType } = req.body; // 'couple' or 'vendor'
      
      if (userType === 'couple') {
        const coupleId = await checkCoupleAuth(req, res);
        if (!coupleId) return;
        
        // Update couple's last active
        await db.update(coupleProfiles)
          .set({ lastActiveAt: new Date(), updatedAt: new Date() })
          .where(eq(coupleProfiles.id, coupleId));
        
        // Mark vendor messages in this conversation as read
        await db.update(messages)
          .set({ readAt: new Date() })
          .where(and(
            eq(messages.conversationId, id),
            eq(messages.senderType, 'vendor'),
            sql`${messages.readAt} IS NULL`
          ));
        
        // Reset couple unread count
        await db.update(conversations)
          .set({ coupleUnreadCount: 0 })
          .where(eq(conversations.id, id));
      } else if (userType === 'vendor') {
        const vendorId = await checkVendorAuth(req, res);
        if (!vendorId) return;
        
        // Mark couple messages in this conversation as read
        await db.update(messages)
          .set({ readAt: new Date() })
          .where(and(
            eq(messages.conversationId, id),
            eq(messages.senderType, 'couple'),
            sql`${messages.readAt} IS NULL`
          ));
        
        // Reset vendor unread count
        await db.update(conversations)
          .set({ vendorUnreadCount: 0 })
          .where(eq(conversations.id, id));
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking conversation as read:", error);
      res.status(500).json({ error: "Kunne ikke markere som lest" });
    }
  });

  // Get conversation with read receipts and last active info
  app.get("/api/vendor/conversations/:id/details", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { id } = req.params;
      
      const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
      if (!conv || conv.vendorId !== vendorId) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }
      
      // Get couple profile with last active
      const [couple] = await db.select().from(coupleProfiles).where(eq(coupleProfiles.id, conv.coupleId));
      
      // Get messages with read status
      const convMessages = await db.select()
        .from(messages)
        .where(eq(messages.conversationId, id))
        .orderBy(messages.createdAt);
      
      // Check if couple has seen vendor's last message
      const vendorMessages = convMessages.filter(m => m.senderType === 'vendor');
      const lastVendorMessage = vendorMessages[vendorMessages.length - 1];
      const messageSeenByCuple = lastVendorMessage?.readAt ? true : false;
      
      res.json({
        conversation: conv,
        couple: couple ? {
          id: couple.id,
          displayName: couple.displayName,
          email: couple.email,
          lastActiveAt: couple.lastActiveAt,
        } : null,
        messages: convMessages,
        lastMessageSeenByCouple: messageSeenByCuple,
        lastSeenAt: lastVendorMessage?.readAt || null,
      });
    } catch (error) {
      console.error("Error fetching conversation details:", error);
      res.status(500).json({ error: "Kunne ikke hente samtaledetaljer" });
    }
  });

  // Schedule reminder for unanswered message
  app.post("/api/vendor/conversations/:id/schedule-reminder", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { id } = req.params;
      const { reminderType, scheduledFor } = req.body;
      
      const [conv] = await db.select().from(conversations).where(eq(conversations.id, id));
      if (!conv || conv.vendorId !== vendorId) {
        return res.status(404).json({ error: "Samtale ikke funnet" });
      }
      
      const [reminder] = await db.insert(messageReminders)
        .values({
          conversationId: id,
          vendorId,
          coupleId: conv.coupleId,
          reminderType: reminderType || 'gentle',
          scheduledFor: new Date(scheduledFor),
        })
        .returning();
      
      res.status(201).json(reminder);
    } catch (error) {
      console.error("Error scheduling reminder:", error);
      res.status(500).json({ error: "Kunne ikke planlegge påminnelse" });
    }
  });

  // Get pending reminders for vendor
  app.get("/api/vendor/message-reminders", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const pendingReminders = await db.select()
        .from(messageReminders)
        .where(and(
          eq(messageReminders.vendorId, vendorId),
          eq(messageReminders.status, 'pending')
        ))
        .orderBy(messageReminders.scheduledFor);
      
      res.json(pendingReminders);
    } catch (error) {
      console.error("Error fetching message reminders:", error);
      res.status(500).json({ error: "Kunne ikke hente påminnelser" });
    }
  });

  // Background job: Process due message reminders
  app.post("/api/admin/jobs/process-message-reminders", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      // Find all pending reminders that are due
      const dueReminders = await db.select()
        .from(messageReminders)
        .where(and(
          eq(messageReminders.status, 'pending'),
          sql`${messageReminders.scheduledFor} <= NOW()`
        ));
      
      if (dueReminders.length === 0) {
        return res.json({ message: "Ingen påminnelser å behandle", sent: 0 });
      }
      
      let sent = 0;
      // Process each reminder
      for (const reminder of dueReminders) {
        const [vendor] = await db.select({ businessName: vendors.businessName })
          .from(vendors)
          .where(eq(vendors.id, reminder.vendorId));
        
        const reminderText = reminder.reminderType === 'final' 
          ? 'Siste påminnelse: ' 
          : 'Påminnelse: ';
        
        // Send notification to couple
        await db.insert(notifications).values({
          recipientType: "couple",
          recipientId: reminder.coupleId,
          type: "message_reminder",
          title: reminderText + "Ubesvart melding",
          body: `Du har en ubesvart melding fra ${vendor?.businessName}. Svar snart.`,
          relatedEntityType: "conversation",
          relatedEntityId: reminder.conversationId,
        });
        
        // Mark reminder as sent
        await db.update(messageReminders)
          .set({ status: 'sent', sentAt: new Date() })
          .where(eq(messageReminders.id, reminder.id));
        
        sent++;
      }
      
      res.json({ message: `${sent} påminnelser sendt`, sent });
    } catch (error) {
      console.error("Error processing message reminders:", error);
      res.status(500).json({ error: "Kunne ikke behandle påminnelser" });
    }
  });

  // Cancel a scheduled reminder
  app.delete("/api/vendor/message-reminders/:id", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { id } = req.params;
      
      const [deleted] = await db.update(messageReminders)
        .set({ status: 'cancelled' })
        .where(and(
          eq(messageReminders.id, id),
          eq(messageReminders.vendorId, vendorId)
        ))
        .returning();
      
      if (!deleted) {
        return res.status(404).json({ error: "Påminnelse ikke funnet" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error cancelling reminder:", error);
      res.status(500).json({ error: "Kunne ikke avbryte påminnelse" });
    }
  });

  // Vendor Products endpoints
  app.get("/api/vendor/products", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const products = await db.select()
        .from(vendorProducts)
        .where(and(
          eq(vendorProducts.vendorId, vendorId),
          eq(vendorProducts.isArchived, false)
        ))
        .orderBy(vendorProducts.sortOrder);

      // Parse metadata JSON
      const productsWithMetadata = products.map(p => ({
        ...p,
        metadata: p.metadata ? JSON.parse(p.metadata) : null,
      }));

      res.json(productsWithMetadata);
    } catch (error) {
      console.error("Error fetching vendor products:", error);
      res.status(500).json({ error: "Kunne ikke hente produkter" });
    }
  });

  app.post("/api/vendor/products", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const validatedData = createVendorProductSchema.parse(req.body);
      
      const [product] = await db.insert(vendorProducts)
        .values({
          vendorId,
          title: validatedData.title,
          description: validatedData.description,
          unitPrice: validatedData.unitPrice,
          unitType: validatedData.unitType,
          leadTimeDays: validatedData.leadTimeDays,
          minQuantity: validatedData.minQuantity,
          categoryTag: validatedData.categoryTag,
          imageUrl: validatedData.imageUrl || null,
          sortOrder: validatedData.sortOrder,
          trackInventory: validatedData.trackInventory,
          availableQuantity: validatedData.availableQuantity,
          bookingBuffer: validatedData.bookingBuffer,
          metadata: req.body.metadata ? JSON.stringify(req.body.metadata) : null,
        })
        .returning();

      res.status(201).json({
        ...product,
        metadata: product.metadata ? JSON.parse(product.metadata) : null,
      });
    } catch (error) {
      console.error("Error creating vendor product:", error);
      res.status(500).json({ error: "Kunne ikke opprette produkt" });
    }
  });

  app.patch("/api/vendor/products/:id", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { id } = req.params;
      const updates = req.body;

      // Verify ownership
      const [existing] = await db.select()
        .from(vendorProducts)
        .where(and(
          eq(vendorProducts.id, id),
          eq(vendorProducts.vendorId, vendorId)
        ));

      if (!existing) {
        return res.status(404).json({ error: "Produkt ikke funnet" });
      }

      // Serialize metadata if provided
      const updateData: any = { ...updates, updatedAt: new Date() };
      if (updates.metadata) {
        updateData.metadata = JSON.stringify(updates.metadata);
      }

      const [updated] = await db.update(vendorProducts)
        .set(updateData)
        .where(eq(vendorProducts.id, id))
        .returning();

      res.json({
        ...updated,
        metadata: updated.metadata ? JSON.parse(updated.metadata) : null,
      });
    } catch (error) {
      console.error("Error updating vendor product:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere produkt" });
    }
  });

  app.delete("/api/vendor/products/:id", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { id } = req.params;

      // Soft delete - archive the product
      const [archived] = await db.update(vendorProducts)
        .set({ isArchived: true, updatedAt: new Date() })
        .where(and(
          eq(vendorProducts.id, id),
          eq(vendorProducts.vendorId, vendorId)
        ))
        .returning();

      if (!archived) {
        return res.status(404).json({ error: "Produkt ikke funnet" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vendor product:", error);
      res.status(500).json({ error: "Kunne ikke slette produkt" });
    }
  });

  // ============================================================
  // Vendor Availability Calendar endpoints
  // ============================================================
  
  // Get vendor availability for a date range
  app.get("/api/vendor/availability", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { startDate, endDate } = req.query;
      
      let query = db.select()
        .from(vendorAvailability)
        .where(eq(vendorAvailability.vendorId, vendorId));
      
      if (startDate && endDate) {
        query = db.select()
          .from(vendorAvailability)
          .where(and(
            eq(vendorAvailability.vendorId, vendorId),
            gte(vendorAvailability.date, startDate as string),
            lte(vendorAvailability.date, endDate as string)
          ));
      }
      
      const availability = await query.orderBy(vendorAvailability.date);
      res.json(availability);
    } catch (error) {
      console.error("Error fetching vendor availability:", error);
      res.status(500).json({ error: "Kunne ikke hente tilgjengelighet" });
    }
  });
  
  // Create or update vendor availability for a single date
  app.post("/api/vendor/availability", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const validatedData = createVendorAvailabilitySchema.parse(req.body);
      
      // Check if entry already exists for this date
      const [existing] = await db.select()
        .from(vendorAvailability)
        .where(and(
          eq(vendorAvailability.vendorId, vendorId),
          eq(vendorAvailability.date, validatedData.date)
        ));
      
      if (existing) {
        // Update existing entry
        const [updated] = await db.update(vendorAvailability)
          .set({
            name: validatedData.name,
            status: validatedData.status,
            maxBookings: validatedData.maxBookings,
            notes: validatedData.notes,
            updatedAt: new Date(),
          })
          .where(eq(vendorAvailability.id, existing.id))
          .returning();
        res.json(updated);
      } else {
        // Create new entry
        const [created] = await db.insert(vendorAvailability)
          .values({
            vendorId,
            date: validatedData.date,
            name: validatedData.name,
            status: validatedData.status || "available",
            maxBookings: validatedData.maxBookings,
            notes: validatedData.notes,
          })
          .returning();
        res.status(201).json(created);
      }
    } catch (error) {
      console.error("Error creating vendor availability:", error);
      res.status(500).json({ error: "Kunne ikke opprette tilgjengelighet" });
    }
  });
  
  // Bulk update vendor availability (for multiple dates)
  app.post("/api/vendor/availability/bulk", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { dates, status, maxBookings, name, notes } = req.body;
      
      if (!Array.isArray(dates) || dates.length === 0) {
        return res.status(400).json({ error: "Må oppgi minst én dato" });
      }
      
      if (!["available", "blocked", "limited"].includes(status)) {
        return res.status(400).json({ error: "Ugyldig status" });
      }
      
      const results = await Promise.all(
        dates.map(async (date: string) => {
          const [existing] = await db.select()
            .from(vendorAvailability)
            .where(and(
              eq(vendorAvailability.vendorId, vendorId),
              eq(vendorAvailability.date, date)
            ));
          
          if (existing) {
            const [updated] = await db.update(vendorAvailability)
              .set({ status, maxBookings, name, notes, updatedAt: new Date() })
              .where(eq(vendorAvailability.id, existing.id))
              .returning();
            return updated;
          } else {
            const [created] = await db.insert(vendorAvailability)
              .values({ vendorId, date, status, maxBookings, name, notes })
              .returning();
            return created;
          }
        })
      );
      
      res.json(results);
    } catch (error) {
      console.error("Error bulk updating vendor availability:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tilgjengelighet" });
    }
  });
  
  // Delete vendor availability entry
  app.delete("/api/vendor/availability/:id", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { id } = req.params;
      
      // Verify ownership
      const [existing] = await db.select()
        .from(vendorAvailability)
        .where(and(
          eq(vendorAvailability.id, id),
          eq(vendorAvailability.vendorId, vendorId)
        ));
      
      if (!existing) {
        return res.status(404).json({ error: "Tilgjengelighet ikke funnet" });
      }
      
      await db.delete(vendorAvailability).where(eq(vendorAvailability.id, id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vendor availability:", error);
      res.status(500).json({ error: "Kunne ikke slette tilgjengelighet" });
    }
  });
  
  // Delete vendor availability by date (for frontend compatibility)
  app.delete("/api/vendor/availability/date/:date", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { date } = req.params;
      
      await db.delete(vendorAvailability)
        .where(and(
          eq(vendorAvailability.vendorId, vendorId),
          eq(vendorAvailability.date, date)
        ));
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vendor availability by date:", error);
      res.status(500).json({ error: "Kunne ikke slette tilgjengelighet" });
    }
  });
  
  // Get bookings count for a specific date (for availability calendar)
  app.get("/api/vendor/availability/:date/bookings", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { date } = req.params;
      
      // Count accepted offers for this date (based on couple's wedding date)
      const acceptedOffers = await db.select({
        offer: vendorOffers,
        weddingDate: coupleProfiles.weddingDate,
      })
        .from(vendorOffers)
        .leftJoin(coupleProfiles, eq(vendorOffers.coupleId, coupleProfiles.id))
        .where(and(
          eq(vendorOffers.vendorId, vendorId),
          eq(vendorOffers.status, "accepted"),
          eq(coupleProfiles.weddingDate, date)
        ));
      
      res.json({
        date,
        acceptedBookings: acceptedOffers.length,
      });
    } catch (error) {
      console.error("Error fetching bookings for date:", error);
      res.status(500).json({ error: "Kunne ikke hente bookinger" });
    }
  });
  
  // Public endpoint to check vendor availability for couples
  app.get("/api/vendors/:vendorId/availability", async (req: Request, res: Response) => {
    try {
      const { vendorId } = req.params;
      const { date } = req.query;
      
      if (!date) {
        return res.status(400).json({ error: "Må oppgi dato" });
      }
      
      const [availability] = await db.select()
        .from(vendorAvailability)
        .where(and(
          eq(vendorAvailability.vendorId, vendorId),
          eq(vendorAvailability.date, date as string)
        ));
      
      if (!availability) {
        // No entry means vendor is available
        res.json({ status: "available", isAvailable: true });
      } else {
        res.json({
          status: availability.status,
          isAvailable: availability.status !== "blocked",
          maxBookings: availability.maxBookings,
        });
      }
    } catch (error) {
      console.error("Error checking vendor availability:", error);
      res.status(500).json({ error: "Kunne ikke sjekke tilgjengelighet" });
    }
  });

  // Vendor Offers endpoints
  app.get("/api/vendor/offers", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const offers = await db.select({
        offer: vendorOffers,
        couple: {
          id: coupleProfiles.id,
          displayName: coupleProfiles.displayName,
          email: coupleProfiles.email,
        },
      })
        .from(vendorOffers)
        .leftJoin(coupleProfiles, eq(vendorOffers.coupleId, coupleProfiles.id))
        .where(eq(vendorOffers.vendorId, vendorId))
        .orderBy(desc(vendorOffers.createdAt));

      // Get offer items for each offer
      const offersWithItems = await Promise.all(
        offers.map(async ({ offer, couple }) => {
          const items = await db.select()
            .from(vendorOfferItems)
            .where(eq(vendorOfferItems.offerId, offer.id))
            .orderBy(vendorOfferItems.sortOrder);
          return { ...offer, couple, items };
        })
      );

      res.json(offersWithItems);
    } catch (error) {
      console.error("Error fetching vendor offers:", error);
      res.status(500).json({ error: "Kunne ikke hente tilbud" });
    }
  });

  app.post("/api/vendor/offers", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const validatedData = createOfferSchema.parse(req.body);
      
      // Get couple's wedding date for date-aware inventory checking
      const [couple] = await db.select()
        .from(coupleProfiles)
        .where(eq(coupleProfiles.id, validatedData.coupleId));
      
      if (!couple) {
        return res.status(404).json({ error: "Par ikke funnet" });
      }
      
      const targetWeddingDate = couple.weddingDate; // This is a string like "2025-06-15"
      
      // Check vendor availability for the wedding date
      if (targetWeddingDate) {
        const [availability] = await db.select()
          .from(vendorAvailability)
          .where(and(
            eq(vendorAvailability.vendorId, vendorId),
            eq(vendorAvailability.date, targetWeddingDate)
          ));
        
        if (availability?.status === "blocked") {
          return res.status(400).json({ 
            error: `Du er ikke tilgjengelig på ${new Date(targetWeddingDate).toLocaleDateString("nb-NO")}`,
            code: "VENDOR_BLOCKED"
          });
        }
        
        // Check max bookings limit
        if (availability?.maxBookings !== null && availability?.maxBookings !== undefined) {
          const [existingBookings] = await db.select({ count: sql<number>`count(*)` })
            .from(vendorOffers)
            .innerJoin(coupleProfiles, eq(vendorOffers.coupleId, coupleProfiles.id))
            .where(and(
              eq(vendorOffers.vendorId, vendorId),
              eq(coupleProfiles.weddingDate, targetWeddingDate),
              eq(vendorOffers.status, "accepted")
            ));
          
          if (existingBookings && existingBookings.count >= availability.maxBookings) {
            return res.status(400).json({ 
              error: `Maksimalt antall bookinger (${availability.maxBookings}) for ${new Date(targetWeddingDate).toLocaleDateString("nb-NO")} er nådd`,
              code: "MAX_BOOKINGS_REACHED"
            });
          }
        }
      }
      
      // Check inventory availability for each item with tracking enabled
      const inventoryErrors: string[] = [];
      for (const item of validatedData.items) {
        if (!item.productId) continue;
        
        const [product] = await db.select()
          .from(vendorProducts)
          .where(eq(vendorProducts.id, item.productId));
        
        if (!product || !product.trackInventory) continue;
        
        // Calculate reserved quantity for this date
        let reservedForDate = 0;
        if (targetWeddingDate) {
          const existingOffers = await db.select({
            quantity: vendorOfferItems.quantity,
          })
            .from(vendorOfferItems)
            .innerJoin(vendorOffers, eq(vendorOfferItems.offerId, vendorOffers.id))
            .innerJoin(coupleProfiles, eq(vendorOffers.coupleId, coupleProfiles.id))
            .where(and(
              eq(vendorOfferItems.productId, item.productId),
              eq(coupleProfiles.weddingDate, targetWeddingDate),
              or(
                eq(vendorOffers.status, "pending"),
                eq(vendorOffers.status, "accepted")
              )
            ));
          
          reservedForDate = existingOffers.reduce((sum, o) => sum + (o.quantity || 0), 0);
        }
        
        const availableQuantity = (product.availableQuantity || 0) - reservedForDate - (product.bookingBuffer || 0);
        
        if (item.quantity > availableQuantity) {
          inventoryErrors.push(
            `"${product.title}": Kun ${availableQuantity} tilgjengelig${targetWeddingDate ? ` for ${new Date(targetWeddingDate).toLocaleDateString("nb-NO")}` : ""}, forespurt ${item.quantity}`
          );
        }
      }
      
      if (inventoryErrors.length > 0) {
        return res.status(400).json({ 
          error: "Ikke nok tilgjengelig lager",
          details: inventoryErrors,
          code: "INSUFFICIENT_INVENTORY"
        });
      }
      
      // Calculate total
      const totalAmount = validatedData.items.reduce(
        (sum, item) => sum + (item.quantity * item.unitPrice), 
        0
      );

      const [offer] = await db.insert(vendorOffers)
        .values({
          vendorId,
          coupleId: validatedData.coupleId,
          conversationId: validatedData.conversationId || null,
          title: validatedData.title,
          message: validatedData.message,
          totalAmount,
          validUntil: validatedData.validUntil ? new Date(validatedData.validUntil) : null,
        })
        .returning();

      // Insert offer items
      const items = await Promise.all(
        validatedData.items.map(async (item, index) => {
          const [offerItem] = await db.insert(vendorOfferItems)
            .values({
              offerId: offer.id,
              productId: item.productId || null,
              title: item.title,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              lineTotal: item.quantity * item.unitPrice,
              sortOrder: index,
            })
            .returning();
          return offerItem;
        })
      );

      // If there's a conversation, add a system message about the offer
      if (validatedData.conversationId) {
        await db.insert(messages).values({
          conversationId: validatedData.conversationId,
          senderType: "vendor",
          senderId: vendorId,
          body: `📋 Nytt tilbud: ${validatedData.title}\nTotalt: ${(totalAmount / 100).toLocaleString("nb-NO")} kr`,
        });

        // Update conversation
        await db.update(conversations)
          .set({ 
            lastMessageAt: new Date(),
            coupleUnreadCount: 1,
          })
          .where(eq(conversations.id, validatedData.conversationId));
      }

      res.status(201).json({ ...offer, items });
    } catch (error) {
      console.error("Error creating vendor offer:", error);
      res.status(500).json({ error: "Kunne ikke opprette tilbud" });
    }
  });

  app.patch("/api/vendor/offers/:id", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { id } = req.params;
      const updates = req.body;

      // Verify ownership
      const [existing] = await db.select()
        .from(vendorOffers)
        .where(and(
          eq(vendorOffers.id, id),
          eq(vendorOffers.vendorId, vendorId)
        ));

      if (!existing) {
        return res.status(404).json({ error: "Tilbud ikke funnet" });
      }

      const [updated] = await db.update(vendorOffers)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(vendorOffers.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating vendor offer:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tilbud" });
    }
  });

  // Delete a vendor offer
  app.delete("/api/vendor/offers/:id", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { id } = req.params;

      // Verify ownership
      const [existing] = await db.select()
        .from(vendorOffers)
        .where(and(
          eq(vendorOffers.id, id),
          eq(vendorOffers.vendorId, vendorId)
        ));

      if (!existing) {
        return res.status(404).json({ error: "Tilbud ikke funnet" });
      }

      // Delete offer items first
      await db.delete(vendorOfferItems).where(eq(vendorOfferItems.offerId, id));
      // Delete the offer
      await db.delete(vendorOffers).where(eq(vendorOffers.id, id));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vendor offer:", error);
      res.status(500).json({ error: "Kunne ikke slette tilbud" });
    }
  });

  // Vendor Planner (meetings/tasks/timeline) - lightweight persistence via App Settings
  // Keys: vendor_planner_meetings_{vendorId}, vendor_planner_tasks_{vendorId}, vendor_planner_timeline_{vendorId}
  const plannerKey = (kind: "meetings" | "tasks" | "timeline", vendorId: string) => `vendor_planner_${kind}_${vendorId}`;

  app.get("/api/vendor/planner/:kind", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { kind } = req.params as { kind: "meetings" | "tasks" | "timeline" };
      if (!["meetings", "tasks", "timeline"].includes(kind)) {
        return res.status(400).json({ error: "Ugyldig planner-type" });
      }
      const key = plannerKey(kind, vendorId);
      const [setting] = await db.select().from(appSettings).where(eq(appSettings.key, key));
      const value = setting?.value ? JSON.parse(setting.value) : (kind === "timeline" ? [] : []);
      res.json(value);
    } catch (error) {
      console.error("Error fetching vendor planner items:", error);
      res.status(500).json({ error: "Kunne ikke hente planner-data" });
    }
  });

  app.post("/api/vendor/planner/:kind", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { kind } = req.params as { kind: "meetings" | "tasks" | "timeline" };
      if (!["meetings", "tasks", "timeline"].includes(kind)) {
        return res.status(400).json({ error: "Ugyldig planner-type" });
      }
      const key = plannerKey(kind, vendorId);
      const payload = req.body;
      const json = JSON.stringify(payload);
      const [existing] = await db.select().from(appSettings).where(eq(appSettings.key, key));
      if (existing) {
        await db.update(appSettings).set({ value: json, updatedAt: new Date() }).where(eq(appSettings.key, key));
      } else {
        await db.insert(appSettings).values({ key, value: json, category: "vendor_planner" });
      }
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error saving vendor planner items:", error);
      res.status(500).json({ error: "Kunne ikke lagre planner-data" });
    }
  });

  app.patch("/api/vendor/planner/:kind", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { kind } = req.params as { kind: "meetings" | "tasks" | "timeline" };
      if (!["meetings", "tasks", "timeline"].includes(kind)) {
        return res.status(400).json({ error: "Ugyldig planner-type" });
      }
      const key = plannerKey(kind, vendorId);
      const payload = req.body;
      const json = JSON.stringify(payload);
      const [existing] = await db.select().from(appSettings).where(eq(appSettings.key, key));
      if (!existing) {
        return res.status(404).json({ error: "Planner-data ikke funnet" });
      }
      const [updated] = await db.update(appSettings)
        .set({ value: json, updatedAt: new Date() })
        .where(eq(appSettings.key, key))
        .returning();
      res.json({ success: true, updated });
    } catch (error) {
      console.error("Error updating vendor planner items:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere planner-data" });
    }
  });

  app.delete("/api/vendor/planner/:kind", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { kind } = req.params as { kind: "meetings" | "tasks" | "timeline" };
      if (!["meetings", "tasks", "timeline"].includes(kind)) {
        return res.status(400).json({ error: "Ugyldig planner-type" });
      }
      const key = plannerKey(kind, vendorId);
      await db.delete(appSettings).where(eq(appSettings.key, key));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vendor planner items:", error);
      res.status(500).json({ error: "Kunne ikke slette planner-data" });
    }
  });

  // Couple Venue planner (DB-backed with appSettings backfill)
  const coupleVenueKey = (kind: "bookings" | "timeline", coupleId: string) => `couple_venue_${kind}_${coupleId}`;

  const getCoupleIdFromReq = async (req: Request, res: Response): Promise<string | null> => {
    const token = req.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      res.status(401).json({ error: "Ikke autentisert" });
      return null;
    }

    let coupleId = COUPLE_SESSIONS.get(token)?.coupleId;
    if (!coupleId) {
      const [session] = await db.select()
        .from(coupleSessions)
        .where(eq(coupleSessions.token, token));

      if (!session || session.expiresAt < new Date()) {
        res.status(401).json({ error: "Ugyldig økt" });
        return null;
      }
      coupleId = session.coupleId;
      COUPLE_SESSIONS.set(token, { coupleId, expiresAt: session.expiresAt });
    }
    return coupleId;
  };

  const backfillCoupleVenueFromSettings = async (kind: "bookings" | "timeline", coupleId: string) => {
    const key = coupleVenueKey(kind, coupleId);
    const [setting] = await db.select().from(appSettings).where(eq(appSettings.key, key));
    if (!setting?.value) return null;
    const parsed = JSON.parse(setting.value);

    try {
      if (kind === "bookings" && Array.isArray(parsed)) {
        await db.transaction(async (tx) => {
          await tx.delete(coupleVenueBookings).where(eq(coupleVenueBookings.coupleId, coupleId));
          if (parsed.length === 0) return;
          await tx.insert(coupleVenueBookings).values(
            parsed.map((b: any) => ({
              id: b.id || crypto.randomUUID(),
              coupleId,
              venueName: b.venueName,
              date: b.date,
              time: b.time,
              location: b.location,
              capacity: b.capacity ?? null,
              notes: b.notes,
              completed: !!b.completed,
            }))
          );
        });
      }

      if (kind === "timeline" && parsed && typeof parsed === "object") {
        await db.insert(coupleVenueTimelines)
          .values({
            coupleId,
            venueSelected: !!parsed.venueSelected,
            venueVisited: !!parsed.venueVisited,
            contractSigned: !!parsed.contractSigned,
            depositPaid: !!parsed.depositPaid,
            capacity: parsed.capacity ?? null,
            budget: parsed.budget ?? null,
          })
          .onConflictDoUpdate({
            target: coupleVenueTimelines.coupleId,
            set: {
              venueSelected: !!parsed.venueSelected,
              venueVisited: !!parsed.venueVisited,
              contractSigned: !!parsed.contractSigned,
              depositPaid: !!parsed.depositPaid,
              capacity: parsed.capacity ?? null,
              budget: parsed.budget ?? null,
              updatedAt: new Date(),
            },
          });
      }
    } catch (err) {
      console.error("Backfill couple venue from appSettings failed", err);
    }

    return parsed;
  };

  app.get("/api/couple/venue/:kind", async (req: Request, res: Response) => {
    const coupleId = await getCoupleIdFromReq(req, res);
    if (!coupleId) return;
    const { kind } = req.params as { kind: "bookings" | "timeline" };
    if (!["bookings", "timeline"].includes(kind)) {
      return res.status(400).json({ error: "Ugyldig type" });
    }
    try {
      if (kind === "bookings") {
        const rows = await db.select().from(coupleVenueBookings).where(eq(coupleVenueBookings.coupleId, coupleId)).orderBy(desc(coupleVenueBookings.createdAt));
        if (rows.length > 0) {
          return res.json(rows.map((r) => ({
            id: r.id,
            venueName: r.venueName,
            date: r.date,
            time: r.time ?? undefined,
            location: r.location ?? undefined,
            capacity: r.capacity ?? undefined,
            notes: r.notes ?? undefined,
            vendorVisitCompleted: !!r.vendorVisitCompleted,
            createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
            updatedAt: r.updatedAt?.toISOString?.() ?? r.updatedAt,
          })));
        }
        const fallback = await backfillCoupleVenueFromSettings(kind, coupleId);
        return res.json(Array.isArray(fallback) ? fallback : []);
      }

      const [timeline] = await db.select().from(coupleVenueTimelines).where(eq(coupleVenueTimelines.coupleId, coupleId));
      if (timeline) {
        return res.json({
          venueSelected: !!timeline.venueSelected,
          venueVisited: !!timeline.venueVisited,
          contractSigned: !!timeline.contractSigned,
          depositPaid: !!timeline.depositPaid,
          capacity: timeline.capacity ?? undefined,
          budget: timeline.budget ?? undefined,
        });
      }
      const fallback = await backfillCoupleVenueFromSettings(kind, coupleId);
      return res.json(fallback && typeof fallback === "object" ? fallback : {});
    } catch (error) {
      console.error("Error fetching couple venue data:", error);
      res.status(500).json({ error: "Kunne ikke hente data" });
    }
  });

  app.post("/api/couple/venue/:kind", async (req: Request, res: Response) => {
    const coupleId = await getCoupleIdFromReq(req, res);
    if (!coupleId) return;
    const { kind } = req.params as { kind: "bookings" | "timeline" };
    if (!["bookings", "timeline"].includes(kind)) {
      return res.status(400).json({ error: "Ugyldig type" });
    }
    try {
      if (kind === "bookings") {
        const payload = Array.isArray(req.body) ? req.body : [];
        await db.transaction(async (tx) => {
          await tx.delete(coupleVenueBookings).where(eq(coupleVenueBookings.coupleId, coupleId));
          if (payload.length === 0) return;
          await tx.insert(coupleVenueBookings).values(
            payload.map((b: any) => ({
              id: b.id || crypto.randomUUID(),
              coupleId,
              venueName: b.venueName,
              date: b.date,
              time: b.time,
              location: b.location,
              capacity: b.capacity ?? null,
              notes: b.notes,
              completed: !!b.completed,
            }))
          );
        });
        return res.status(201).json({ success: true });
      }

      const payload = req.body || {};
      await db.insert(coupleVenueTimelines)
        .values({
          coupleId,
          venueSelected: !!payload.venueSelected,
          venueVisited: !!payload.venueVisited,
          contractSigned: !!payload.contractSigned,
          depositPaid: !!payload.depositPaid,
          capacity: payload.capacity ?? null,
          budget: payload.budget ?? null,
        })
        .onConflictDoUpdate({
          target: coupleVenueTimelines.coupleId,
          set: {
            venueSelected: !!payload.venueSelected,
            venueVisited: !!payload.venueVisited,
            contractSigned: !!payload.contractSigned,
            depositPaid: !!payload.depositPaid,
            capacity: payload.capacity ?? null,
            budget: payload.budget ?? null,
            updatedAt: new Date(),
          },
        });
      return res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error saving couple venue data:", error);
      res.status(500).json({ error: "Kunne ikke lagre" });
    }
  });

  app.patch("/api/couple/venue/:kind", async (req: Request, res: Response) => {
    const coupleId = await getCoupleIdFromReq(req, res);
    if (!coupleId) return;
    const { kind } = req.params as { kind: "bookings" | "timeline" };
    if (!["bookings", "timeline"].includes(kind)) {
      return res.status(400).json({ error: "Ugyldig type" });
    }
    try {
      if (kind === "bookings") {
        const payload = Array.isArray(req.body) ? req.body : [];
        await db.transaction(async (tx) => {
          await tx.delete(coupleVenueBookings).where(eq(coupleVenueBookings.coupleId, coupleId));
          if (payload.length === 0) return;
          await tx.insert(coupleVenueBookings).values(
            payload.map((b: any) => ({
              id: b.id || crypto.randomUUID(),
              coupleId,
              venueName: b.venueName,
              date: b.date,
              time: b.time,
              location: b.location,
              capacity: b.capacity ?? null,
              notes: b.notes,
              completed: !!b.completed,
            }))
          );
        });
        return res.json({ success: true });
      }

      const payload = req.body || {};
      await db.insert(coupleVenueTimelines)
        .values({
          coupleId,
          venueSelected: !!payload.venueSelected,
          venueVisited: !!payload.venueVisited,
          contractSigned: !!payload.contractSigned,
          depositPaid: !!payload.depositPaid,
          capacity: payload.capacity ?? null,
          budget: payload.budget ?? null,
        })
        .onConflictDoUpdate({
          target: coupleVenueTimelines.coupleId,
          set: {
            venueSelected: !!payload.venueSelected,
            venueVisited: !!payload.venueVisited,
            contractSigned: !!payload.contractSigned,
            depositPaid: !!payload.depositPaid,
            capacity: payload.capacity ?? null,
            budget: payload.budget ?? null,
            updatedAt: new Date(),
          },
        });
      return res.json({ success: true });
    } catch (error) {
      console.error("Error updating couple venue data:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere" });
    }
  });

  app.delete("/api/couple/venue/:kind", async (req: Request, res: Response) => {
    const coupleId = await getCoupleIdFromReq(req, res);
    if (!coupleId) return;
    const { kind } = req.params as { kind: "bookings" | "timeline" };
    if (!["bookings", "timeline"].includes(kind)) {
      return res.status(400).json({ error: "Ugyldig type" });
    }
    try {
      if (kind === "bookings") {
        await db.delete(coupleVenueBookings).where(eq(coupleVenueBookings.coupleId, coupleId));
        return res.json({ success: true });
      }
      await db.delete(coupleVenueTimelines).where(eq(coupleVenueTimelines.coupleId, coupleId));
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting couple venue data:", error);
      res.status(500).json({ error: "Kunne ikke slette" });
    }
  });

  // Couple seating chart
  const coupleSeatingKey = (coupleId: string) => `couple_venue_seating_${coupleId}`;

  app.get("/api/couple/venue/seating", async (req: Request, res: Response) => {
    const coupleId = await getCoupleIdFromReq(req, res);
    if (!coupleId) return;
    try {
      const key = coupleSeatingKey(coupleId);
      const [setting] = await db.select().from(appSettings).where(eq(appSettings.key, key));
      const seating = setting?.value ? JSON.parse(setting.value) : { tables: [], guests: [] };
      return res.json(seating);
    } catch (error) {
      console.error("Error fetching couple seating:", error);
      res.status(500).json({ error: "Kunne ikke hente seating" });
    }
  });

  app.post("/api/couple/venue/seating", async (req: Request, res: Response) => {
    const coupleId = await getCoupleIdFromReq(req, res);
    if (!coupleId) return;
    try {
      const key = coupleSeatingKey(coupleId);
      const payload = req.body || { tables: [], guests: [] };
      const json = JSON.stringify(payload);
      const [existing] = await db.select().from(appSettings).where(eq(appSettings.key, key));
      if (existing) {
        await db.update(appSettings).set({ value: json, updatedAt: new Date() }).where(eq(appSettings.key, key));
      } else {
        await db.insert(appSettings).values({ key, value: json, category: "couple_venue_seating" });
      }
      return res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error saving couple seating:", error);
      res.status(500).json({ error: "Kunne ikke lagre seating" });
    }
  });

  // Vendor Venue planner (DB-backed with appSettings backfill)
  const vendorVenueKey = (kind: "bookings" | "availability" | "timeline", vendorId: string) => `vendor_venue_${kind}_${vendorId}`;

  const backfillVendorVenueFromSettings = async (kind: "bookings" | "availability" | "timeline", vendorId: string) => {
    const key = vendorVenueKey(kind, vendorId);
    const [setting] = await db.select().from(appSettings).where(eq(appSettings.key, key));
    if (!setting?.value) return null;
    const parsed = JSON.parse(setting.value);

    try {
      if (kind === "bookings" && Array.isArray(parsed)) {
        await db.transaction(async (tx) => {
          await tx.delete(vendorVenueBookings).where(eq(vendorVenueBookings.vendorId, vendorId));
          if (parsed.length === 0) return;
          await tx.insert(vendorVenueBookings).values(
            parsed.map((b: any) => ({
              id: b.id || crypto.randomUUID(),
              vendorId,
              coupleName: b.coupleName,
              date: b.date,
              time: b.time,
              location: b.location,
              capacity: b.capacity ?? null,
              notes: b.notes,
              status: b.status || "booked",
              completed: !!b.completed,
            }))
          );
        });
      }

      if (kind === "availability" && Array.isArray(parsed)) {
        await db.transaction(async (tx) => {
          await tx.delete(vendorVenueAvailability).where(eq(vendorVenueAvailability.vendorId, vendorId));
          if (parsed.length === 0) return;
          await tx.insert(vendorVenueAvailability).values(
            parsed.map((a: any) => ({
              id: a.id || crypto.randomUUID(),
              vendorId,
              date: a.date,
              status: a.status || "available",
              maxBookings: a.maxBookings ?? null,
              notes: a.notes,
            }))
          );
        });
      }

      if (kind === "timeline" && parsed && typeof parsed === "object") {
        await db.insert(vendorVenueTimelines)
          .values({
            vendorId,
            siteVisitDone: !!parsed.siteVisitDone,
            contractSigned: !!parsed.contractSigned,
            depositReceived: !!parsed.depositReceived,
            floorPlanFinalized: !!parsed.floorPlanFinalized,
          })
          .onConflictDoUpdate({
            target: vendorVenueTimelines.vendorId,
            set: {
              siteVisitDone: !!parsed.siteVisitDone,
              contractSigned: !!parsed.contractSigned,
              depositReceived: !!parsed.depositReceived,
              floorPlanFinalized: !!parsed.floorPlanFinalized,
              updatedAt: new Date(),
            },
          });
      }
    } catch (err) {
      console.error("Backfill vendor venue from appSettings failed", err);
    }

    return parsed;
  };

  app.get("/api/vendor/venue/:kind", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;
    const { kind } = req.params as { kind: "bookings" | "availability" | "timeline" };
    if (!["bookings", "availability", "timeline"].includes(kind)) {
      return res.status(400).json({ error: "Ugyldig type" });
    }
    try {
      if (kind === "bookings") {
        const rows = await db.select().from(vendorVenueBookings).where(eq(vendorVenueBookings.vendorId, vendorId)).orderBy(desc(vendorVenueBookings.createdAt));
        if (rows.length > 0) {
          return res.json(rows.map((r) => ({
            id: r.id,
            coupleName: r.coupleName,
            date: r.date,
            time: r.time ?? undefined,
            location: r.location ?? undefined,
            capacity: r.capacity ?? undefined,
            notes: r.notes ?? undefined,
            status: r.status || "booked",
            createdAt: r.createdAt?.toISOString?.() ?? r.createdAt,
            updatedAt: r.updatedAt?.toISOString?.() ?? r.updatedAt,
          })));
        }
        const fallback = await backfillVendorVenueFromSettings(kind, vendorId);
        return res.json(Array.isArray(fallback) ? fallback : []);
      }

      if (kind === "availability") {
        const rows = await db.select().from(vendorVenueAvailability).where(eq(vendorVenueAvailability.vendorId, vendorId)).orderBy(desc(vendorVenueAvailability.date));
        if (rows.length > 0) {
          return res.json(rows.map((r) => ({
            id: r.id,
            date: r.date,
            status: (r.status as any) || "available",
            maxBookings: r.maxBookings ?? undefined,
            notes: r.notes ?? undefined,
          })));
        }
        const fallback = await backfillVendorVenueFromSettings(kind, vendorId);
        return res.json(Array.isArray(fallback) ? fallback : []);
      }

      const [timeline] = await db.select().from(vendorVenueTimelines).where(eq(vendorVenueTimelines.vendorId, vendorId));
      if (timeline) {
        return res.json({
          siteVisitDone: !!timeline.siteVisitDone,
          contractSigned: !!timeline.contractSigned,
          depositReceived: !!timeline.depositReceived,
          floorPlanFinalized: !!timeline.floorPlanFinalized,
        });
      }
      const fallback = await backfillVendorVenueFromSettings(kind, vendorId);
      return res.json(fallback && typeof fallback === "object" ? fallback : {});
    } catch (error) {
      console.error("Error fetching vendor venue data:", error);
      res.status(500).json({ error: "Kunne ikke hente data" });
    }
  });

  app.post("/api/vendor/venue/:kind", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;
    const { kind } = req.params as { kind: "bookings" | "availability" | "timeline" };
    if (!["bookings", "availability", "timeline"].includes(kind)) {
      return res.status(400).json({ error: "Ugyldig type" });
    }
    try {
      if (kind === "bookings") {
        const payload = Array.isArray(req.body) ? req.body : [];
        await db.transaction(async (tx) => {
          await tx.delete(vendorVenueBookings).where(eq(vendorVenueBookings.vendorId, vendorId));
          if (payload.length === 0) return;
          await tx.insert(vendorVenueBookings).values(
            payload.map((b: any) => ({
              id: b.id || crypto.randomUUID(),
              vendorId,
              coupleName: b.coupleName,
              date: b.date,
              time: b.time,
              location: b.location,
              capacity: b.capacity ?? null,
              notes: b.notes,
              status: b.status || "booked",
              completed: !!b.completed,
            }))
          );
        });
        return res.status(201).json({ success: true });
      }

      if (kind === "availability") {
        const payload = Array.isArray(req.body) ? req.body : [];
        await db.transaction(async (tx) => {
          await tx.delete(vendorVenueAvailability).where(eq(vendorVenueAvailability.vendorId, vendorId));
          if (payload.length === 0) return;
          await tx.insert(vendorVenueAvailability).values(
            payload.map((a: any) => ({
              id: a.id || crypto.randomUUID(),
              vendorId,
              date: a.date,
              status: a.status || "available",
              maxBookings: a.maxBookings ?? null,
              notes: a.notes,
            }))
          );
        });
        return res.status(201).json({ success: true });
      }

      const payload = req.body || {};
      await db.insert(vendorVenueTimelines)
        .values({
          vendorId,
          siteVisitDone: !!payload.siteVisitDone,
          contractSigned: !!payload.contractSigned,
          depositReceived: !!payload.depositReceived,
          floorPlanFinalized: !!payload.floorPlanFinalized,
        })
        .onConflictDoUpdate({
          target: vendorVenueTimelines.vendorId,
          set: {
            siteVisitDone: !!payload.siteVisitDone,
            contractSigned: !!payload.contractSigned,
            depositReceived: !!payload.depositReceived,
            floorPlanFinalized: !!payload.floorPlanFinalized,
            updatedAt: new Date(),
          },
        });
      return res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error saving vendor venue data:", error);
      res.status(500).json({ error: "Kunne ikke lagre" });
    }
  });

  app.patch("/api/vendor/venue/:kind", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;
    const { kind } = req.params as { kind: "bookings" | "availability" | "timeline" };
    if (!["bookings", "availability", "timeline"].includes(kind)) {
      return res.status(400).json({ error: "Ugyldig type" });
    }
    try {
      if (kind === "bookings") {
        const payload = Array.isArray(req.body) ? req.body : [];
        await db.transaction(async (tx) => {
          await tx.delete(vendorVenueBookings).where(eq(vendorVenueBookings.vendorId, vendorId));
          if (payload.length === 0) return;
          await tx.insert(vendorVenueBookings).values(
            payload.map((b: any) => ({
              id: b.id || crypto.randomUUID(),
              vendorId,
              coupleName: b.coupleName,
              date: b.date,
              time: b.time,
              location: b.location,
              capacity: b.capacity ?? null,
              notes: b.notes,
              status: b.status || "booked",
              completed: !!b.completed,
            }))
          );
        });
        return res.json({ success: true });
      }

      if (kind === "availability") {
        const payload = Array.isArray(req.body) ? req.body : [];
        await db.transaction(async (tx) => {
          await tx.delete(vendorVenueAvailability).where(eq(vendorVenueAvailability.vendorId, vendorId));
          if (payload.length === 0) return;
          await tx.insert(vendorVenueAvailability).values(
            payload.map((a: any) => ({
              id: a.id || crypto.randomUUID(),
              vendorId,
              date: a.date,
              status: a.status || "available",
              maxBookings: a.maxBookings ?? null,
              notes: a.notes,
            }))
          );
        });
        return res.json({ success: true });
      }

      const payload = req.body || {};
      await db.insert(vendorVenueTimelines)
        .values({
          vendorId,
          siteVisitDone: !!payload.siteVisitDone,
          contractSigned: !!payload.contractSigned,
          depositReceived: !!payload.depositReceived,
          floorPlanFinalized: !!payload.floorPlanFinalized,
        })
        .onConflictDoUpdate({
          target: vendorVenueTimelines.vendorId,
          set: {
            siteVisitDone: !!payload.siteVisitDone,
            contractSigned: !!payload.contractSigned,
            depositReceived: !!payload.depositReceived,
            floorPlanFinalized: !!payload.floorPlanFinalized,
            updatedAt: new Date(),
          },
        });
      return res.json({ success: true });
    } catch (error) {
      console.error("Error updating vendor venue data:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere" });
    }
  });

  app.delete("/api/vendor/venue/:kind", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;
    const { kind } = req.params as { kind: "bookings" | "availability" | "timeline" };
    if (!["bookings", "availability", "timeline"].includes(kind)) {
      return res.status(400).json({ error: "Ugyldig type" });
    }
    try {
      if (kind === "bookings") {
        await db.delete(vendorVenueBookings).where(eq(vendorVenueBookings.vendorId, vendorId));
        return res.json({ success: true });
      }
      if (kind === "availability") {
        await db.delete(vendorVenueAvailability).where(eq(vendorVenueAvailability.vendorId, vendorId));
        return res.json({ success: true });
      }
      await db.delete(vendorVenueTimelines).where(eq(vendorVenueTimelines.vendorId, vendorId));
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting vendor venue data:", error);
      res.status(500).json({ error: "Kunne ikke slette" });
    }
  });

  // Vendor seating chart endpoints
  const vendorSeatingKey = (vendorId: string) => `vendor_venue_seating_${vendorId}`;

  app.get("/api/vendor/venue/seating", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;
    try {
      const key = vendorSeatingKey(vendorId);
      const [setting] = await db.select().from(appSettings).where(eq(appSettings.key, key));
      const seating = setting?.value ? JSON.parse(setting.value) : { tables: [], guests: [] };
      return res.json(seating);
    } catch (error) {
      console.error("Error fetching vendor seating:", error);
      res.status(500).json({ error: "Kunne ikke hente seating" });
    }
  });

  app.post("/api/vendor/venue/seating", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;
    try {
      const key = vendorSeatingKey(vendorId);
      const payload = req.body || { tables: [], guests: [] };
      const json = JSON.stringify(payload);
      const [existing] = await db.select().from(appSettings).where(eq(appSettings.key, key));
      if (existing) {
        await db.update(appSettings).set({ value: json, updatedAt: new Date() }).where(eq(appSettings.key, key));
      } else {
        await db.insert(appSettings).values({ key, value: json, category: "vendor_venue_seating" });
      }
      return res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error saving vendor seating:", error);
      res.status(500).json({ error: "Kunne ikke lagre seating" });
    }
  });

  // Vendor site visits - get upcoming scheduled site visits at vendor's venue
  app.get("/api/vendor/site-visits", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const siteVisits = await db.select({
        id: coupleVenueBookings.id,
        coupleName: coupleProfiles.displayName,
        venueName: coupleVenueBookings.venueName,
        siteVisitDate: coupleVenueBookings.siteVisitDate,
        siteVisitTime: coupleVenueBookings.siteVisitTime,
        address: coupleVenueBookings.address,
        maxGuests: coupleVenueBookings.maxGuests,
        invitedGuests: coupleVenueBookings.invitedGuests,
        status: coupleVenueBookings.status,
        notes: coupleVenueBookings.notes,
        weddingDate: coupleProfiles.weddingDate,
        email: coupleProfiles.email,
        vendorVisitConfirmed: coupleVenueBookings.vendorVisitConfirmed,
        vendorVisitNotes: coupleVenueBookings.vendorVisitNotes,
        vendorVisitCompleted: coupleVenueBookings.vendorVisitCompleted,
      })
      .from(coupleVenueBookings)
      .innerJoin(coupleProfiles, eq(coupleVenueBookings.coupleId, coupleProfiles.id))
      .where(and(
        eq(coupleVenueBookings.vendorId, vendorId),
        isNotNull(coupleVenueBookings.siteVisitDate)
      ))
      .orderBy(coupleVenueBookings.siteVisitDate, coupleVenueBookings.siteVisitTime);

      res.json(siteVisits);
    } catch (error) {
      console.error("Error fetching vendor site visits:", error);
      res.status(500).json({ error: "Kunne ikke hente befaringer" });
    }
  });

  // Update vendor site visit tracking
  app.patch("/api/vendor/site-visits/:id", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { id } = req.params;
      const { vendorVisitConfirmed, vendorVisitNotes, vendorVisitCompleted } = req.body;

      // Verify this site visit belongs to the vendor
      const [existing] = await db.select()
        .from(coupleVenueBookings)
        .where(and(
          eq(coupleVenueBookings.id, id),
          eq(coupleVenueBookings.vendorId, vendorId)
        ));

      if (!existing) {
        return res.status(404).json({ error: "Befaring ikke funnet" });
      }

      const [updated] = await db.update(coupleVenueBookings)
        .set({
          vendorVisitConfirmed: vendorVisitConfirmed ?? existing.vendorVisitConfirmed,
          vendorVisitNotes: vendorVisitNotes ?? existing.vendorVisitNotes,
          vendorVisitCompleted: vendorVisitCompleted ?? existing.vendorVisitCompleted,
          updatedAt: new Date(),
        })
        .where(eq(coupleVenueBookings.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating site visit:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere befaring" });
    }
  });

  // Couple can accept/decline offers
  app.post("/api/couple/offers/:id/respond", async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "Ikke autentisert" });
      }

      // Check couple session
      let coupleId = COUPLE_SESSIONS.get(token)?.coupleId;
      if (!coupleId) {
        const [session] = await db.select()
          .from(coupleSessions)
          .where(eq(coupleSessions.token, token));

        if (!session || session.expiresAt < new Date()) {
          return res.status(401).json({ error: "Ugyldig økt" });
        }
        coupleId = session.coupleId;
        COUPLE_SESSIONS.set(token, { coupleId, expiresAt: session.expiresAt });
      }

      const { id } = req.params;
      const { response } = req.body; // 'accept' or 'decline'

      // Verify ownership
      const [offer] = await db.select()
        .from(vendorOffers)
        .where(and(
          eq(vendorOffers.id, id),
          eq(vendorOffers.coupleId, coupleId)
        ));

      if (!offer) {
        return res.status(404).json({ error: "Tilbud ikke funnet" });
      }

      if (offer.status !== "pending") {
        return res.status(400).json({ error: "Tilbudet er allerede behandlet" });
      }

      const updates: Record<string, any> = {
        status: response === "accept" ? "accepted" : "declined",
        updatedAt: new Date(),
      };

      if (response === "accept") {
        updates.acceptedAt = new Date();
        
        // Use transaction for inventory updates and contract creation
        try {
          await db.transaction(async (tx) => {
            // Update inventory - decrement available quantity for items with tracking
            const offerItems = await tx.select()
              .from(vendorOfferItems)
              .where(eq(vendorOfferItems.offerId, id));
            
            for (const item of offerItems) {
              if (!item.productId) continue;
              
              const [product] = await tx.select()
                .from(vendorProducts)
                .where(eq(vendorProducts.id, item.productId));
              
              if (product?.trackInventory && product.availableQuantity !== null) {
                // Check if we have enough inventory
                if (product.availableQuantity < (item.quantity || 0)) {
                  throw new Error(`Ikke nok på lager av "${product.title}". Tilgjengelig: ${product.availableQuantity}, Ønsket: ${item.quantity}`);
                }
                
                const newQuantity = product.availableQuantity - (item.quantity || 0);
                await tx.update(vendorProducts)
                  .set({ 
                    availableQuantity: newQuantity,
                    updatedAt: new Date()
                  })
                  .where(eq(vendorProducts.id, item.productId));
              }
            }
            
            // Create vendor contract automatically
            await tx.insert(coupleVendorContracts).values({
              coupleId: coupleId!,
              vendorId: offer.vendorId,
              offerId: offer.id,
              status: "active",
            });
            
            // Update offer status within transaction
            await tx.update(vendorOffers)
              .set(updates)
              .where(eq(vendorOffers.id, id));
          });
        } catch (txError: any) {
          console.error("Transaction error accepting offer:", txError);
          return res.status(400).json({ 
            error: txError.message || "Kunne ikke akseptere tilbud - lagerstatus endret" 
          });
        }
        
        // Get updated offer for response (outside transaction)
        const [updated] = await db.select()
          .from(vendorOffers)
          .where(eq(vendorOffers.id, id));

        // Notify vendor via message if there's a conversation
        if (offer.conversationId) {
          await db.insert(messages).values({
            conversationId: offer.conversationId,
            senderType: "couple",
            senderId: coupleId,
            body: `✅ Tilbud "${offer.title}" er akseptert`,
          });

          await db.update(conversations)
            .set({ 
              lastMessageAt: new Date(),
              vendorUnreadCount: 1,
            })
            .where(eq(conversations.id, offer.conversationId));
        }

        return res.json(updated);
        
      } else {
        updates.declinedAt = new Date();
      }

      const [updated] = await db.update(vendorOffers)
        .set(updates)
        .where(eq(vendorOffers.id, id))
        .returning();

      // Notify vendor via message if there's a conversation
      if (offer.conversationId) {
        await db.insert(messages).values({
          conversationId: offer.conversationId,
          senderType: "couple",
          senderId: coupleId,
          body: `✅ Tilbud "${offer.title}" er avslått`,
        });

        await db.update(conversations)
          .set({ 
            lastMessageAt: new Date(),
            vendorUnreadCount: 1,
          })
          .where(eq(conversations.id, offer.conversationId));
      }

      res.json(updated);
    } catch (error) {
      console.error("Error responding to offer:", error);
      res.status(500).json({ error: "Kunne ikke svare på tilbud" });
    }
  });

  // Get offers for a couple
  app.get("/api/couple/offers", async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "Ikke autentisert" });
      }

      // Check couple session
      let coupleId = COUPLE_SESSIONS.get(token)?.coupleId;
      if (!coupleId) {
        const [session] = await db.select()
          .from(coupleSessions)
          .where(eq(coupleSessions.token, token));

        if (!session || session.expiresAt < new Date()) {
          return res.status(401).json({ error: "Ugyldig økt" });
        }
        coupleId = session.coupleId;
        COUPLE_SESSIONS.set(token, { coupleId, expiresAt: session.expiresAt });
      }

      const offers = await db.select({
        offer: vendorOffers,
        vendor: {
          id: vendors.id,
          businessName: vendors.businessName,
          imageUrl: vendors.imageUrl,
        },
      })
        .from(vendorOffers)
        .leftJoin(vendors, eq(vendorOffers.vendorId, vendors.id))
        .where(eq(vendorOffers.coupleId, coupleId))
        .orderBy(desc(vendorOffers.createdAt));

      // Get items for each offer
      const offersWithItems = await Promise.all(
        offers.map(async ({ offer, vendor }) => {
          const items = await db.select({
            item: vendorOfferItems,
            product: vendorProducts,
          })
            .from(vendorOfferItems)
            .leftJoin(vendorProducts, eq(vendorOfferItems.productId, vendorProducts.id))
            .where(eq(vendorOfferItems.offerId, offer.id))
            .orderBy(vendorOfferItems.sortOrder);
          
          // Parse metadata for each product
          const itemsWithMetadata = items.map(({ item, product }) => ({
            ...item,
            product: product ? {
              ...product,
              metadata: product.metadata ? JSON.parse(product.metadata) : null,
            } : null,
          }));
          
          return { ...offer, vendor, items: itemsWithMetadata };
        })
      );

      res.json(offersWithItems);
    } catch (error) {
      console.error("Error fetching couple offers:", error);
      res.status(500).json({ error: "Kunne ikke hente tilbud" });
    }
  });

  // Get couples that the vendor has conversations with (for offer recipient selection)
  app.get("/api/vendor/contacts", async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "Ikke autentisert" });
      }

      const session = VENDOR_SESSIONS.get(token);
      if (!session || session.expiresAt < new Date()) {
        return res.status(401).json({ error: "Ugyldig økt" });
      }

      // Get all couples that have active conversations with this vendor
      const vendorConversations = await db.select({
        couple: {
          id: coupleProfiles.id,
          displayName: coupleProfiles.displayName,
          email: coupleProfiles.email,
          weddingDate: coupleProfiles.weddingDate,
        },
        conversationId: conversations.id,
      })
        .from(conversations)
        .leftJoin(coupleProfiles, eq(conversations.coupleId, coupleProfiles.id))
        .where(and(
          eq(conversations.vendorId, session.vendorId),
          eq(conversations.status, "active"),
          eq(conversations.deletedByVendor, false)
        ));

      // Deduplicate by couple ID
      const uniqueCouples = Array.from(
        new Map(vendorConversations.map(c => [c.couple?.id, c])).values()
      );

      res.json(uniqueCouples);
    } catch (error) {
      console.error("Error fetching vendor contacts:", error);
      res.status(500).json({ error: "Kunne ikke hente kontakter" });
    }
  });

  // Admin Settings Routes
  // Admin Settings Routes - Public read for design settings (anyone can see the design)
  app.get("/api/admin/settings", async (req: Request, res: Response) => {
    try {
      const settings = await db.select().from(appSettings);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Kunne ikke hente innstillinger" });
    }
  });

  app.put("/api/admin/settings", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      const { settings: settingsArray } = req.body;
      
      for (const setting of settingsArray) {
        const existing = await db.select().from(appSettings).where(eq(appSettings.key, setting.key));
        
        if (existing.length > 0) {
          await db.update(appSettings)
            .set({ value: setting.value, category: setting.category, updatedAt: new Date() })
            .where(eq(appSettings.key, setting.key));
        } else {
          await db.insert(appSettings).values({
            key: setting.key,
            value: setting.value,
            category: setting.category,
          });
        }
      }
      
      const updated = await db.select().from(appSettings);
      res.json(updated);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere innstillinger" });
    }
  });

  // Admin Statistics Routes
  app.get("/api/admin/statistics", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      const [vendorCount] = await db.select({ count: sql<number>`count(*)` }).from(vendors);
      const [approvedVendors] = await db.select({ count: sql<number>`count(*)` }).from(vendors).where(eq(vendors.status, "approved"));
      const [pendingVendors] = await db.select({ count: sql<number>`count(*)` }).from(vendors).where(eq(vendors.status, "pending"));
      const [coupleCount] = await db.select({ count: sql<number>`count(*)` }).from(coupleProfiles);
      const [inspirationCount] = await db.select({ count: sql<number>`count(*)` }).from(inspirations);
      const [pendingInspirations] = await db.select({ count: sql<number>`count(*)` }).from(inspirations).where(eq(inspirations.status, "pending"));
      const [conversationCount] = await db.select({ count: sql<number>`count(*)` }).from(conversations);
      const [messageCount] = await db.select({ count: sql<number>`count(*)` }).from(messages);
      const [deliveryCount] = await db.select({ count: sql<number>`count(*)` }).from(deliveries);
      const [offerCount] = await db.select({ count: sql<number>`count(*)` }).from(vendorOffers);
      
      res.json({
        vendors: {
          total: Number(vendorCount?.count || 0),
          approved: Number(approvedVendors?.count || 0),
          pending: Number(pendingVendors?.count || 0),
        },
        couples: Number(coupleCount?.count || 0),
        inspirations: {
          total: Number(inspirationCount?.count || 0),
          pending: Number(pendingInspirations?.count || 0),
        },
        conversations: Number(conversationCount?.count || 0),
        messages: Number(messageCount?.count || 0),
        deliveries: Number(deliveryCount?.count || 0),
        offers: Number(offerCount?.count || 0),
      });
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({ error: "Kunne ikke hente statistikk" });
    }
  });

  // Admin Preview Routes - Allow admin to see the app from couple/vendor perspective
  app.get("/api/admin/preview/couple/users", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      const coupleData = await db.select({
        id: coupleProfiles.id,
        name: coupleProfiles.displayName,
        email: coupleProfiles.email,
      }).from(coupleProfiles).limit(50);
      
      // Map the response to match frontend expectations
      const mappedUsers = coupleData.map(user => ({
        id: user.id,
        name: user.name || "Ukjent brudepar",
        email: user.email,
      }));
      
      res.json({
        role: "couple",
        users: mappedUsers,
      });
    } catch (error) {
      console.error("Error fetching couple list:", error);
      res.status(500).json({ error: "Kunne ikke hente brudepar-liste" });
    }
  });

  app.get("/api/admin/preview/vendor/users", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      const vendorData = await db.select({
        id: vendors.id,
        name: vendors.businessName,
        email: vendors.email,
        categoryId: vendors.categoryId,
      })
        .from(vendors)
        .where(eq(vendors.status, "approved"))
        .limit(50);
      
      // Map the response to match frontend expectations
      const mappedUsers = vendorData.map(user => ({
        id: user.id,
        name: user.name || "Ukjent leverandør",
        email: user.email,
        categoryId: user.categoryId,
      }));
      
      res.json({
        role: "vendor",
        users: mappedUsers,
      });
    } catch (error) {
      console.error("Error fetching vendor list:", error);
      res.status(500).json({ error: "Kunne ikke hente leverandør-liste" });
    }
  });

  // Impersonate endpoint - Creates a session token to use the app as a specific user
  app.post("/api/admin/preview/couple/impersonate", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      console.log("[Impersonate] Looking up couple with ID:", userId);

      if (!db) {
        console.error("[Impersonate] Database connection not available");
        return res.status(503).json({ error: "Databaseforbindelse ikke tilgjengelig" });
      }

      console.log("[Impersonate DEBUG] About to query database");

      let coupleData: any[];
      try {
        // Use the exact same pattern as the working users endpoint
        console.log("[Impersonate DEBUG] Executing select query");
        coupleData = await db.select({
          id: coupleProfiles.id,
          name: coupleProfiles.displayName,
          email: coupleProfiles.email,
        }).from(coupleProfiles).limit(50);
        console.log("[Impersonate DEBUG] Query succeeded, results:", coupleData?.length);
      } catch (dbError) {
        console.error("[Impersonate] Database query error:", dbError);
        if (dbError instanceof Error) {
          console.error("[Impersonate] Error message:", dbError.message);
          console.error("[Impersonate] Error stack:", dbError.stack);
        }
        return res.status(503).json({ error: "Databasefeil ved oppslag" });
      }

      console.log("[Impersonate] Query result:", coupleData?.length ? "Found" : "Not found");

      // Find the couple with matching ID
      const couple = coupleData.find(c => c.id === userId);
      
      if (!couple) {
        console.warn("[Impersonate] Couple not found for ID:", userId);
        return res.status(404).json({ error: "Brudepar ikke funnet" });
      }

      // Generate a preview session token
      const sessionToken = generateSessionToken();
      
      // Store in a temporary cache with expiration (24 hours)
      COUPLE_SESSIONS.set(sessionToken, {
        coupleId: userId,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      console.log("[Impersonate] Session created for couple:", userId);

      res.json({
        sessionToken,
        coupleId: userId,
        coupleData: couple,
      });
    } catch (error) {
      console.error("[Impersonate] Error:", error instanceof Error ? error.message : String(error));
      console.error("[Impersonate] Full error:", error);
      res.status(500).json({ error: "Kunne ikke logge inn som brudepar" });
    }
  });

  app.post("/api/admin/preview/vendor/impersonate", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "userId is required" });
      }

      console.log("[Impersonate Vendor] Looking up vendor with ID:", userId);

      if (!db) {
        console.error("[Impersonate Vendor] Database connection not available");
        return res.status(503).json({ error: "Databaseforbindelse ikke tilgjengelig" });
      }

      let vendorData: any[];
      try {
        // Use the exact same pattern as the working users endpoint
        vendorData = await db.select({
          id: vendors.id,
          name: vendors.businessName,
          email: vendors.email,
          categoryId: vendors.categoryId,
        })
          .from(vendors)
          .where(eq(vendors.status, "approved"))
          .limit(50);
      } catch (dbError) {
        console.error("[Impersonate Vendor] Database query error:", dbError);
        if (dbError instanceof Error) {
          console.error("[Impersonate Vendor] Error message:", dbError.message);
          console.error("[Impersonate Vendor] Error stack:", dbError.stack);
        }
        return res.status(503).json({ error: "Databasefeil ved oppslag" });
      }

      console.log("[Impersonate Vendor] Query result:", vendorData?.length ? "Found" : "Not found");

      // Find the vendor with matching ID
      const vendor = vendorData.find(v => v.id === userId);

      if (!vendor) {
        console.warn("[Impersonate Vendor] Vendor not found for ID:", userId);
        return res.status(404).json({ error: "Leverandør ikke funnet" });
      }

      // Generate a preview session token
      const sessionToken = generateSessionToken();
      
      // Store in a temporary cache with expiration (24 hours)
      VENDOR_SESSIONS.set(sessionToken, {
        vendorId: userId,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

      console.log("[Impersonate Vendor] Session created for vendor:", userId);

      res.json({
        sessionToken,
        vendorId: userId,
        vendorData: vendor,
      });
    } catch (error) {
      console.error("[Impersonate Vendor] Error:", error instanceof Error ? error.message : String(error));
      console.error("[Impersonate Vendor] Full error:", error);
      res.status(500).json({ error: "Kunne ikke logge inn som leverandør" });
    }
  });

  // Background job: Expire old offers and notify couples
  app.post("/api/admin/jobs/expire-offers", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      // Find all pending offers that have expired
      const expiredOffers = await db.select()
        .from(vendorOffers)
        .where(and(
          eq(vendorOffers.status, "pending"),
          sql`${vendorOffers.validUntil} < NOW()`
        ));
      
      if (expiredOffers.length === 0) {
        return res.json({ message: "Ingen utløpte tilbud", updated: 0 });
      }
      
      // Update all expired offers to "expired" status
      await db.update(vendorOffers)
        .set({ status: "expired", updatedAt: new Date() })
        .where(and(
          eq(vendorOffers.status, "pending"),
          sql`${vendorOffers.validUntil} < NOW()`
        ));
      
      // Send notifications to couples about expired offers
      for (const offer of expiredOffers) {
        const [vendor] = await db.select({ businessName: vendors.businessName })
          .from(vendors)
          .where(eq(vendors.id, offer.vendorId));
        
        await db.insert(notifications).values({
          recipientType: "couple",
          recipientId: offer.coupleId,
          type: "offer_expired",
          title: "Tilbud utløpt",
          body: `Tilbudet fra ${vendor?.businessName} "${offer.title}" har utløpt`,
          relatedEntityType: "offer",
          relatedEntityId: offer.id,
        });
      }
      
      res.json({ message: `${expiredOffers.length} tilbud marked som utløpt`, updated: expiredOffers.length });
    } catch (error) {
      console.error("Error expiring offers:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tilbud" });
    }
  });

  // Admin Categories Management
  app.post("/api/admin/inspiration-categories", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      const { name, icon, sortOrder } = req.body;
      const [newCategory] = await db.insert(inspirationCategories).values({
        name,
        icon,
        sortOrder: sortOrder || 0,
      }).returning();
      res.json(newCategory);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Kunne ikke opprette kategori" });
    }
  });

  app.put("/api/admin/inspiration-categories/:id", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      const { id } = req.params;
      const { name, icon, sortOrder } = req.body;
      
      await db.update(inspirationCategories)
        .set({ name, icon, sortOrder })
        .where(eq(inspirationCategories.id, id));
      
      res.json({ message: "Kategori oppdatert" });
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere kategori" });
    }
  });

  app.delete("/api/admin/inspiration-categories/:id", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      const { id } = req.params;
      await db.delete(inspirationCategories).where(eq(inspirationCategories.id, id));
      res.json({ message: "Kategori slettet" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ error: "Kunne ikke slette kategori" });
    }
  });

  // Admin Vendor Categories Management
  app.post("/api/admin/vendor-categories", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      const { name, icon, description } = req.body;
      const [newCategory] = await db.insert(vendorCategories).values({
        name,
        icon,
        description: description || null,
      }).returning();
      res.json(newCategory);
    } catch (error) {
      console.error("Error creating vendor category:", error);
      res.status(500).json({ error: "Kunne ikke opprette kategori" });
    }
  });

  app.put("/api/admin/vendor-categories/:id", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      const { id } = req.params;
      const { name, icon, description } = req.body;
      
      await db.update(vendorCategories)
        .set({ name, icon, description })
        .where(eq(vendorCategories.id, id));
      
      res.json({ message: "Kategori oppdatert" });
    } catch (error) {
      console.error("Error updating vendor category:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere kategori" });
    }
  });

  app.delete("/api/admin/vendor-categories/:id", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      const { id } = req.params;
      await db.delete(vendorCategories).where(eq(vendorCategories.id, id));
      res.json({ message: "Kategori slettet" });
    } catch (error) {
      console.error("Error deleting vendor category:", error);
      res.status(500).json({ error: "Kunne ikke slette kategori" });
    }
  });

  // Admin Couples Management
  app.get("/api/admin/couples", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      const couples = await db.select().from(coupleProfiles).orderBy(desc(coupleProfiles.createdAt));
      res.json(couples);
    } catch (error) {
      console.error("Error fetching couples:", error);
      res.status(500).json({ error: "Kunne ikke hente par" });
    }
  });

  app.delete("/api/admin/couples/:id", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      const { id } = req.params;
      // Delete related data first
      await db.delete(coupleSessions).where(eq(coupleSessions.coupleId, id));
      await db.delete(messages).where(sql`conversation_id IN (SELECT id FROM conversations WHERE couple_id = ${id})`);
      await db.delete(conversations).where(eq(conversations.coupleId, id));
      await db.delete(coupleProfiles).where(eq(coupleProfiles.id, id));
      res.json({ message: "Par slettet" });
    } catch (error) {
      console.error("Error deleting couple:", error);
      res.status(500).json({ error: "Kunne ikke slette par" });
    }
  });

  // Admin Full Vendor Update
  app.put("/api/admin/vendors/:id", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      const { id } = req.params;
      const { businessName, email, description, location, phone, website, priceRange, categoryId, status } = req.body;
      
      await db.update(vendors)
        .set({ 
          businessName, 
          email, 
          description, 
          location, 
          phone, 
          website, 
          priceRange, 
          categoryId, 
          status,
          updatedAt: new Date() 
        })
        .where(eq(vendors.id, id));
      
      res.json({ message: "Leverandør oppdatert" });
    } catch (error) {
      console.error("Error updating vendor:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere leverandør" });
    }
  });

  app.delete("/api/admin/vendors/:id", async (req: Request, res: Response) => {
    if (!(await checkAdminAuth(req, res))) return;
    
    try {
      const { id } = req.params;
      // Delete related data
      await db.delete(vendorFeatures).where(eq(vendorFeatures.vendorId, id));
      await db.delete(vendorInspirationCategories).where(eq(vendorInspirationCategories.vendorId, id));
      await db.delete(deliveryItems).where(sql`delivery_id IN (SELECT id FROM deliveries WHERE vendor_id = ${id})`);
      await db.delete(deliveries).where(eq(deliveries.vendorId, id));
      await db.delete(inspirationMedia).where(sql`inspiration_id IN (SELECT id FROM inspirations WHERE vendor_id = ${id})`);
      await db.delete(inspirations).where(eq(inspirations.vendorId, id));
      await db.delete(messages).where(sql`conversation_id IN (SELECT id FROM conversations WHERE vendor_id = ${id})`);
      await db.delete(conversations).where(eq(conversations.vendorId, id));
      await db.delete(vendorOfferItems).where(sql`offer_id IN (SELECT id FROM vendor_offers WHERE vendor_id = ${id})`);
      await db.delete(vendorOffers).where(eq(vendorOffers.vendorId, id));
      await db.delete(vendorProducts).where(eq(vendorProducts.vendorId, id));
      await db.delete(vendors).where(eq(vendors.id, id));
      res.json({ message: "Leverandør slettet" });
    } catch (error) {
      console.error("Error deleting vendor:", error);
      res.status(500).json({ error: "Kunne ikke slette leverandør" });
    }
  });

  // ==========================================
  // Coordinator Access Endpoints
  // ==========================================

  // Get couple's coordinator invitations
  app.get("/api/couple/coordinators", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const invitations = await db.select()
        .from(coordinatorInvitations)
        .where(eq(coordinatorInvitations.coupleId, coupleId))
        .orderBy(desc(coordinatorInvitations.createdAt));
      
      res.json(invitations);
    } catch (error) {
      console.error("Error fetching coordinators:", error);
      res.status(500).json({ error: "Kunne ikke hente koordinatorer" });
    }
  });

  // Create coordinator invitation
  app.post("/api/couple/coordinators", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { name, email, roleLabel, canViewSpeeches, canViewSchedule, expiresAt } = req.body;
      
      // Generate unique access token and code
      const accessToken = crypto.randomBytes(32).toString('hex');
      const accessCode = Math.random().toString().slice(2, 8); // 6-digit code
      
      const [invitation] = await db.insert(coordinatorInvitations)
        .values({
          coupleId,
          name,
          email: email || null,
          roleLabel: roleLabel || "Toastmaster",
          accessToken,
          accessCode,
          canViewSpeeches: canViewSpeeches !== false,
          canViewSchedule: canViewSchedule !== false,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        })
        .returning();
      
      res.status(201).json(invitation);
    } catch (error) {
      console.error("Error creating coordinator invitation:", error);
      res.status(500).json({ error: "Kunne ikke opprette invitasjon" });
    }
  });

  // Update coordinator invitation
  app.patch("/api/couple/coordinators/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const { name, roleLabel, canViewSpeeches, canViewSchedule, status } = req.body;
      
      const [updated] = await db.update(coordinatorInvitations)
        .set({
          name,
          roleLabel,
          canViewSpeeches,
          canViewSchedule,
          status,
          updatedAt: new Date(),
        })
        .where(and(
          eq(coordinatorInvitations.id, id),
          eq(coordinatorInvitations.coupleId, coupleId)
        ))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ error: "Invitasjon ikke funnet" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating coordinator:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere invitasjon" });
    }
  });

  // Delete coordinator invitation
  app.delete("/api/couple/coordinators/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      
      await db.delete(coordinatorInvitations)
        .where(and(
          eq(coordinatorInvitations.id, id),
          eq(coordinatorInvitations.coupleId, coupleId)
        ));
      
      res.json({ message: "Invitasjon slettet" });
    } catch (error) {
      console.error("Error deleting coordinator:", error);
      res.status(500).json({ error: "Kunne ikke slette invitasjon" });
    }
  });

  // ==========================================
  // Guest Invitations - public RSVP links
  // ==========================================

  app.get("/api/couple/guest-invitations", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const domain = process.env.EXPO_PUBLIC_DOMAIN
        ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
        : `http://localhost:${process.env.PORT || 5000}`;

      const invitations = await db
        .select()
        .from(guestInvitations)
        .where(eq(guestInvitations.coupleId, coupleId))
        .orderBy(desc(guestInvitations.createdAt));

      res.json(
        invitations.map((inv) => ({
          ...inv,
          inviteUrl: `${domain}/invite/${inv.inviteToken}`,
        })),
      );
    } catch (error) {
      console.error("Error fetching guest invitations:", error);
      res.status(500).json({ error: "Kunne ikke hente invitasjoner" });
    }
  });

  app.post("/api/couple/guest-invitations", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    const parsed = createGuestInvitationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.message });
    }

    const { name, email, phone, template, message, expiresAt } = parsed.data;

    try {
      const inviteToken = crypto.randomBytes(24).toString("hex");
      const [invitation] = await db
        .insert(guestInvitations)
        .values({
          coupleId,
          name,
          email: email || null,
          phone: phone || null,
          template,
          message: message || null,
          inviteToken,
          status: "sent",
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        })
        .returning();

      const domain = process.env.EXPO_PUBLIC_DOMAIN
        ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
        : `http://localhost:${process.env.PORT || 5000}`;

      res.status(201).json({
        ...invitation,
        inviteUrl: `${domain}/invite/${inviteToken}`,
      });
    } catch (error) {
      console.error("Error creating guest invitation:", error);
      res.status(500).json({ error: "Kunne ikke opprette invitasjon" });
    }
  });

  app.patch("/api/couple/guest-invitations/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    const { id } = req.params;
    const { status, template, message, expiresAt } = req.body;

    try {
      const [updated] = await db
        .update(guestInvitations)
        .set({
          status,
          template,
          message,
          expiresAt: expiresAt ? new Date(expiresAt) : undefined,
          updatedAt: new Date(),
        })
        .where(and(eq(guestInvitations.id, id), eq(guestInvitations.coupleId, coupleId)))
        .returning();

      if (!updated) return res.status(404).json({ error: "Invitasjon ikke funnet" });

      res.json(updated);
    } catch (error) {
      console.error("Error updating guest invitation:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere invitasjon" });
    }
  });

  app.delete("/api/couple/guest-invitations/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    const { id } = req.params;

    try {
      await db
        .delete(guestInvitations)
        .where(and(eq(guestInvitations.id, id), eq(guestInvitations.coupleId, coupleId)));

      res.json({ message: "Invitasjon slettet" });
    } catch (error) {
      console.error("Error deleting guest invitation:", error);
      res.status(500).json({ error: "Kunne ikke slette invitasjon" });
    }
  });

  // Public: fetch invitation by token
  app.get("/api/guest/invite/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;

      const [invitation] = await db
        .select({
          invite: guestInvitations,
          coupleName: coupleProfiles.displayName,
        })
        .from(guestInvitations)
        .leftJoin(coupleProfiles, eq(guestInvitations.coupleId, coupleProfiles.id))
        .where(eq(guestInvitations.inviteToken, token));

      if (!invitation?.invite) {
        return res.status(404).json({ error: "Ugyldig invitasjon" });
      }

      const expires = invitation.invite.expiresAt ? new Date(invitation.invite.expiresAt) : null;
      if (expires && expires < new Date()) {
        return res.status(410).json({ error: "Invitasjonen er utløpt" });
      }

      res.json({
        ...invitation.invite,
        coupleName: invitation.coupleName,
      });
    } catch (error) {
      console.error("Error fetching guest invitation:", error);
      res.status(500).json({ error: "Kunne ikke hente invitasjon" });
    }
  });

  // Public: respond to invitation
  app.post("/api/guest/invite/:token/respond", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { attending, dietary, allergies, notes, plusOne } = req.body;

      const [existing] = await db
        .select()
        .from(guestInvitations)
        .where(eq(guestInvitations.inviteToken, token));

      if (!existing) {
        return res.status(404).json({ error: "Ugyldig invitasjon" });
      }

      const expires = existing.expiresAt ? new Date(existing.expiresAt) : null;
      if (expires && expires < new Date()) {
        return res.status(410).json({ error: "Invitasjonen er utløpt" });
      }

      const [updated] = await db
        .update(guestInvitations)
        .set({
          responseAttending: attending,
          responseDietary: dietary || null,
          responseAllergies: allergies || null,
          responseNotes: notes || null,
          responsePlusOne: plusOne || null,
          status: attending === false ? "declined" : "responded",
          respondedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(guestInvitations.id, existing.id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error responding to invitation:", error);
      res.status(500).json({ error: "Kunne ikke lagre svar" });
    }
  });

  // Public landing page for invitation
  app.get("/invite/:token", async (req: Request, res: Response) => {
    const { token } = req.params;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    const apiBase = process.env.EXPO_PUBLIC_DOMAIN
      ? `https://${process.env.EXPO_PUBLIC_DOMAIN}`
      : `http://localhost:${process.env.PORT || 5000}`;

    const html = `<!doctype html>
<html lang="no">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Bryllupsinvitasjon</title>
  <style>
    :root { --bg: #f7f5f2; --card: #ffffff; --text: #1f1f1f; --accent: #c07b5a; }
    body { margin:0; font-family: 'Helvetica Neue', Arial, sans-serif; background: var(--bg); color: var(--text); display:flex; justify-content:center; padding:24px; }
    .card { max-width: 520px; width:100%; background: var(--card); border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); overflow:hidden; }
    .hero { padding: 28px; background: linear-gradient(135deg, #f2e8df, #f7f1ea); }
    .badge { display:inline-flex; align-items:center; gap:6px; padding:6px 10px; background: rgba(0,0,0,0.05); border-radius: 999px; font-size:12px; letter-spacing:0.4px; text-transform:uppercase; }
    .title { font-size:28px; margin:14px 0 6px; letter-spacing:-0.3px; }
    .subtitle { color:#5f5f5f; margin:0; }
    form { padding: 24px; display:flex; flex-direction:column; gap:14px; }
    label { font-weight:600; font-size:14px; }
    input, textarea, select { width:100%; padding:12px 14px; border-radius:10px; border:1px solid #e1d9cf; font-size:15px; box-sizing:border-box; background:#faf7f4; }
    textarea { min-height:96px; resize:vertical; }
    button { background: var(--accent); color:#1f1f1f; border:none; padding:14px; border-radius:12px; font-weight:700; font-size:15px; cursor:pointer; transition: transform 120ms ease, box-shadow 120ms ease; }
    button:hover { transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,0,0,0.12); }
    .chips { display:flex; gap:8px; flex-wrap:wrap; }
    .chip { padding:9px 12px; border-radius:10px; background:#f0e8df; font-weight:600; border:1px solid transparent; }
    .chip.active { background:#1f1f1f; color:#fff; }
    .divider { height:1px; background:#eee4da; margin:0 24px; }
    .note { color:#7a7a7a; font-size:13px; margin-top:4px; }
    .error { color:#b00020; background:#fdeaea; padding:10px 12px; border-radius:10px; border:1px solid #f5c6c6; }
    .success { color:#0b5d1e; background:#e7f6ec; padding:10px 12px; border-radius:10px; border:1px solid #bde5c8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="hero">
      <div class="badge">Bryllupsinvitasjon</div>
      <h1 class="title" id="title">Laster invitasjon...</h1>
      <p class="subtitle" id="subtitle"></p>
    </div>
    <div class="divider"></div>
    <form id="rsvpForm">
      <div id="alert"></div>
      <div>
        <label>Kan du komme?</label>
        <div class="chips">
          <div class="chip active" data-value="yes">Ja, jeg kommer</div>
          <div class="chip" data-value="no">Dessverre nei</div>
        </div>
      </div>
      <div>
        <label>Telefon</label>
        <input id="phone" placeholder="Telefon (valgfritt)" />
      </div>
      <div>
        <label>E-post</label>
        <input id="email" placeholder="E-post (valgfritt)" />
      </div>
      <div>
        <label>Kosthold</label>
        <input id="dietary" placeholder="Vegetar, halal, osv" />
      </div>
      <div>
        <label>Allergier</label>
        <input id="allergies" placeholder="Nøtter, gluten, laktose, osv" />
      </div>
      <div>
        <label>Plus-one navn</label>
        <input id="plusOne" placeholder="Navn på følge (valgfritt)" />
      </div>
      <div>
        <label>Notater</label>
        <textarea id="notes" placeholder="Andre hensyn"></textarea>
      </div>
      <button type="submit">Send svar</button>
      <p class="note">Vi lagrer kun dette svaret til bryllupsplanleggingen.</p>
    </form>
  </div>

  <script>
    const token = ${JSON.stringify(token)};
    const apiBase = ${JSON.stringify(apiBase)};
    const alertBox = document.getElementById('alert');
    const chips = Array.from(document.querySelectorAll('.chip'));
    let attending = true;

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        attending = chip.dataset.value === 'yes';
      });
    });

    async function loadInvitation() {
      try {
        const res = await fetch(apiBase + '/api/guest/invite/' + token);
        if (!res.ok) throw new Error('Kunne ikke hente invitasjon');
        const data = await res.json();
        document.getElementById('title').textContent = data.name;
        document.getElementById('subtitle').textContent = data.coupleName ? 'Invitert av ' + data.coupleName : 'Bryllup';
      } catch (err) {
        alertBox.innerHTML = '<div class="error">' + err.message + '</div>';
      }
    }

    document.getElementById('rsvpForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      alertBox.innerHTML = '';
      try {
        const payload = {
          attending,
          dietary: document.getElementById('dietary').value,
          allergies: document.getElementById('allergies').value,
          notes: document.getElementById('notes').value,
          plusOne: document.getElementById('plusOne').value,
        };
        const res = await fetch(apiBase + '/api/guest/invite/' + token + '/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Ukjent feil' }));
          throw new Error(err.error || 'Kunne ikke lagre svar');
        }
        alertBox.innerHTML = '<div class="success">Takk! Svaret ditt er registrert.</div>';
      } catch (err) {
        alertBox.innerHTML = '<div class="error">' + err.message + '</div>';
      }
    });

    loadInvitation();
  </script>
</body>
</html>`;

    res.send(html);
  });

  // Coordinator access - validate token and get data
  app.get("/api/coordinator/access/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      
      const [invitation] = await db.select()
        .from(coordinatorInvitations)
        .where(and(
          eq(coordinatorInvitations.accessToken, token),
          eq(coordinatorInvitations.status, "active")
        ));
      
      if (!invitation) {
        return res.status(404).json({ error: "Ugyldig eller utløpt tilgang" });
      }
      
      // Check expiry
      if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
        await db.update(coordinatorInvitations)
          .set({ status: "expired" })
          .where(eq(coordinatorInvitations.id, invitation.id));
        return res.status(403).json({ error: "Tilgangen har utløpt" });
      }
      
      // Update last accessed
      await db.update(coordinatorInvitations)
        .set({ lastAccessedAt: new Date() })
        .where(eq(coordinatorInvitations.id, invitation.id));
      
      // Get couple info
      const [couple] = await db.select({
        displayName: coupleProfiles.displayName,
        weddingDate: coupleProfiles.weddingDate,
      }).from(coupleProfiles).where(eq(coupleProfiles.id, invitation.coupleId));
      
      // Get speeches if allowed
      let speechList: any[] = [];
      if (invitation.canViewSpeeches) {
        speechList = await db.select()
          .from(speeches)
          .where(eq(speeches.coupleId, invitation.coupleId))
          .orderBy(speeches.sortOrder);
      }
      
      // Get schedule events if allowed
      let scheduleList: any[] = [];
      if (invitation.canViewSchedule) {
        scheduleList = await db.select()
          .from(scheduleEvents)
          .where(eq(scheduleEvents.coupleId, invitation.coupleId))
          .orderBy(scheduleEvents.time);
      }
      
      res.json({
        invitation: {
          id: invitation.id,
          name: invitation.name,
          roleLabel: invitation.roleLabel,
          canViewSpeeches: invitation.canViewSpeeches,
          canViewSchedule: invitation.canViewSchedule,
          canEditSpeeches: invitation.canEditSpeeches,
          canEditSchedule: invitation.canEditSchedule,
        },
        couple,
        speeches: speechList,
        schedule: scheduleList,
      });
    } catch (error) {
      console.error("Error accessing coordinator view:", error);
      res.status(500).json({ error: "Kunne ikke hente data" });
    }
  });

  // Coordinator access by code
  app.post("/api/coordinator/access-by-code", async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      
      const [invitation] = await db.select()
        .from(coordinatorInvitations)
        .where(and(
          eq(coordinatorInvitations.accessCode, code),
          eq(coordinatorInvitations.status, "active")
        ));
      
      if (!invitation) {
        return res.status(404).json({ error: "Ugyldig kode" });
      }
      
      // Return the token for redirect
      res.json({ token: invitation.accessToken });
    } catch (error) {
      console.error("Error validating access code:", error);
      res.status(500).json({ error: "Kunne ikke validere kode" });
    }
  });

  // ==========================================
  // Schedule Events Endpoints (Server-side storage)
  // ==========================================

  // Get couple's schedule events
  app.get("/api/couple/schedule-events", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const events = await db.select()
        .from(scheduleEvents)
        .where(eq(scheduleEvents.coupleId, coupleId))
        .orderBy(scheduleEvents.time);
      
      res.json(events);
    } catch (error) {
      console.error("Error fetching schedule events:", error);
      res.status(500).json({ error: "Kunne ikke hente program" });
    }
  });

  // Helper to notify vendors about changes (defined early for use in couple endpoints)
  async function notifyVendorsOfChangeInternal(coupleId: string, changeType: 'schedule' | 'speech', actorName: string, description: string) {
    try {
      const contracts = await db.select({
        vendorId: coupleVendorContracts.vendorId,
        notifyOnScheduleChanges: coupleVendorContracts.notifyOnScheduleChanges,
        notifyOnSpeechChanges: coupleVendorContracts.notifyOnSpeechChanges,
      })
        .from(coupleVendorContracts)
        .where(and(
          eq(coupleVendorContracts.coupleId, coupleId),
          eq(coupleVendorContracts.status, "active")
        ));
      
      const [couple] = await db.select({
        displayName: coupleProfiles.displayName,
      }).from(coupleProfiles).where(eq(coupleProfiles.id, coupleId));
      
      for (const contract of contracts) {
        const shouldNotify = changeType === 'schedule' 
          ? contract.notifyOnScheduleChanges 
          : contract.notifyOnSpeechChanges;
        
        if (shouldNotify) {
          await db.insert(notifications).values({
            recipientType: "vendor",
            recipientId: contract.vendorId,
            type: changeType === 'schedule' ? "schedule_changed" : "speech_changed",
            title: changeType === 'schedule' ? "Programendring" : "Talelisteendring",
            body: `${actorName} har endret ${changeType === 'schedule' ? 'bryllupsprogrammet' : 'talelisten'} for ${couple?.displayName || 'brudeparet'}. ${description}`,
            actorType: "couple",
            actorId: coupleId,
            actorName: actorName,
          });
        }
      }
    } catch (error) {
      console.error("Error notifying vendors:", error);
    }
  }

  // Create schedule event
  app.post("/api/couple/schedule-events", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { time, title, icon, notes, sortOrder } = req.body;
      
      const [event] = await db.insert(scheduleEvents)
        .values({
          coupleId,
          time,
          title,
          icon: icon || "star",
          notes,
          sortOrder: sortOrder || 0,
        })
        .returning();
      
      // Get couple display name for notification
      const [couple] = await db.select({ displayName: coupleProfiles.displayName })
        .from(coupleProfiles).where(eq(coupleProfiles.id, coupleId));
      
      // Notify vendors
      await notifyVendorsOfChangeInternal(coupleId, 'schedule', couple?.displayName || 'Brudeparet', `"${title}" ble lagt til kl. ${time}.`);
      
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating schedule event:", error);
      res.status(500).json({ error: "Kunne ikke opprette hendelse" });
    }
  });

  // Update schedule event
  app.patch("/api/couple/schedule-events/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const { time, title, icon, notes, sortOrder } = req.body;
      
      const [updated] = await db.update(scheduleEvents)
        .set({
          time,
          title,
          icon,
          notes,
          sortOrder,
          updatedAt: new Date(),
        })
        .where(and(
          eq(scheduleEvents.id, id),
          eq(scheduleEvents.coupleId, coupleId)
        ))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ error: "Hendelse ikke funnet" });
      }
      
      // Get couple display name for notification
      const [couple] = await db.select({ displayName: coupleProfiles.displayName })
        .from(coupleProfiles).where(eq(coupleProfiles.id, coupleId));
      
      // Notify vendors
      await notifyVendorsOfChangeInternal(coupleId, 'schedule', couple?.displayName || 'Brudeparet', `"${title}" ble endret.`);
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating schedule event:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere hendelse" });
    }
  });

  // Delete schedule event
  app.delete("/api/couple/schedule-events/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      
      // Get event info for notification before deleting
      const [event] = await db.select()
        .from(scheduleEvents)
        .where(and(
          eq(scheduleEvents.id, id),
          eq(scheduleEvents.coupleId, coupleId)
        ));
      
      await db.delete(scheduleEvents)
        .where(and(
          eq(scheduleEvents.id, id),
          eq(scheduleEvents.coupleId, coupleId)
        ));
      
      // Notify vendors
      if (event) {
        const [couple] = await db.select({ displayName: coupleProfiles.displayName })
          .from(coupleProfiles).where(eq(coupleProfiles.id, coupleId));
        await notifyVendorsOfChangeInternal(coupleId, 'schedule', couple?.displayName || 'Brudeparet', `"${event.title}" ble fjernet.`);
      }
      
      res.json({ message: "Hendelse slettet" });
    } catch (error) {
      console.error("Error deleting schedule event:", error);
      res.status(500).json({ error: "Kunne ikke slette hendelse" });
    }
  });

  // ==========================================
  // Coordinator Read-Only Endpoints
  // ==========================================

  async function checkCoordinatorAuth(req: Request, res: Response): Promise<string | null> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Ikke autorisert" });
      return null;
    }
    const token = authHeader.replace("Bearer ", "");
    const [invite] = await db
      .select()
      .from(coordinatorInvitations)
      .where(and(eq(coordinatorInvitations.accessToken, token), eq(coordinatorInvitations.status, "active")));
    if (!invite) {
      res.status(401).json({ error: "Ugyldig eller inaktiv tilgang" });
      return null;
    }
    // Update lastAccessedAt
    await db
      .update(coordinatorInvitations)
      .set({ lastAccessedAt: new Date(), updatedAt: new Date() })
      .where(eq(coordinatorInvitations.id, invite.id));
    return invite.coupleId as string;
  }

  // Read-only schedule for coordinator
  app.get("/api/coordinator/schedule-events", async (req: Request, res: Response) => {
    const coupleId = await checkCoordinatorAuth(req, res);
    if (!coupleId) return;

    try {
      const events = await db
        .select({ id: scheduleEvents.id, time: scheduleEvents.time, title: scheduleEvents.title, icon: scheduleEvents.icon })
        .from(scheduleEvents)
        .where(eq(scheduleEvents.coupleId, coupleId))
        .orderBy(scheduleEvents.time);
      res.json(events);
    } catch (error) {
      console.error("Error fetching coordinator schedule:", error);
      res.status(500).json({ error: "Kunne ikke hente program" });
    }
  });

  // Read-only couple profile for coordinator (display name and wedding date)
  app.get("/api/coordinator/couple-profile", async (req: Request, res: Response) => {
    const coupleId = await checkCoordinatorAuth(req, res);
    if (!coupleId) return;

    try {
      const [couple] = await db
        .select({ id: coupleProfiles.id, displayName: coupleProfiles.displayName, weddingDate: coupleProfiles.weddingDate })
        .from(coupleProfiles)
        .where(eq(coupleProfiles.id, coupleId));
      if (!couple) return res.status(404).json({ error: "Profil ikke funnet" });
      res.json(couple);
    } catch (error) {
      console.error("Error fetching coordinator couple profile:", error);
      res.status(500).json({ error: "Kunne ikke hente profil" });
    }
  });

  // Read-only seating chart for coordinator (toastmaster needs table overview)
  app.get("/api/coordinator/seating", async (req: Request, res: Response) => {
    const coupleId = await checkCoordinatorAuth(req, res);
    if (!coupleId) return;

    try {
      const key = `couple_venue_seating_${coupleId}`;
      const [setting] = await db.select().from(appSettings).where(eq(appSettings.key, key));
      const seating = setting?.value ? JSON.parse(setting.value) : { tables: [] };
      res.json(seating);
    } catch (error) {
      console.error("Error fetching coordinator seating:", error);
      res.status(500).json({ error: "Kunne ikke hente bordplan" });
    }
  });

  // ==========================================
  // Wedding Guests Endpoints (Server-side storage)
  // ==========================================

  // Get couple's wedding guests
  app.get("/api/couple/guests", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const guests = await db
        .select()
        .from(weddingGuests)
        .where(eq(weddingGuests.coupleId, coupleId))
        .orderBy(weddingGuests.createdAt);

      res.json(guests);
    } catch (error) {
      console.error("Error fetching guests:", error);
      res.status(500).json({ error: "Kunne ikke hente gjester" });
    }
  });

  // Create a guest
  app.post("/api/couple/guests", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const parsed = insertWeddingGuestSchema.parse(req.body);
      const [guest] = await db
        .insert(weddingGuests)
        .values({ ...parsed, coupleId })
        .returning();

      res.json(guest);
    } catch (error) {
      console.error("Error creating guest:", error);
      res.status(400).json({ error: "Kunne ikke opprett gjest" });
    }
  });

  // Update a guest
  app.patch("/api/couple/guests/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const parsed = updateWeddingGuestSchema.parse(req.body);

      // Verify guest belongs to couple
      const [guest] = await db
        .select()
        .from(weddingGuests)
        .where(
          and(
            eq(weddingGuests.id, id),
            eq(weddingGuests.coupleId, coupleId)
          )
        );

      if (!guest) {
        return res.status(404).json({ error: "Gjest ikke funnet" });
      }

      const [updated] = await db
        .update(weddingGuests)
        .set({ ...parsed, updatedAt: new Date() })
        .where(eq(weddingGuests.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating guest:", error);
      res.status(400).json({ error: "Kunne ikke oppdatere gjest" });
    }
  });

  // Delete a guest
  app.delete("/api/couple/guests/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;

      // Verify guest belongs to couple
      const [guest] = await db
        .select()
        .from(weddingGuests)
        .where(
          and(
            eq(weddingGuests.id, id),
            eq(weddingGuests.coupleId, coupleId)
          )
        );

      if (!guest) {
        return res.status(404).json({ error: "Gjest ikke funnet" });
      }

      await db.delete(weddingGuests).where(eq(weddingGuests.id, id));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting guest:", error);
      res.status(400).json({ error: "Kunne ikke slette gjest" });
    }
  });

  // ==========================================
  // Wedding Tables Endpoints (Server-side storage)
  // ==========================================

  // Get couple's wedding tables
  app.get("/api/couple/tables", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const tables = await db.select()
        .from(weddingTables)
        .where(eq(weddingTables.coupleId, coupleId))
        .orderBy(weddingTables.sortOrder);
      
      // Get guest assignments for each table
      const assignments = await db.select()
        .from(tableGuestAssignments)
        .where(eq(tableGuestAssignments.coupleId, coupleId));
      
      // Group assignments by tableId
      const guestsByTable: Record<string, string[]> = {};
      for (const a of assignments) {
        if (!guestsByTable[a.tableId]) guestsByTable[a.tableId] = [];
        guestsByTable[a.tableId].push(a.guestId);
      }
      
      // Add guests array to each table
      const tablesWithGuests = tables.map(t => ({
        ...t,
        guests: guestsByTable[t.id] || [],
      }));
      
      res.json(tablesWithGuests);
    } catch (error) {
      console.error("Error fetching tables:", error);
      res.status(500).json({ error: "Kunne ikke hente bord" });
    }
  });

  // Create wedding table
  app.post("/api/couple/tables", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { tableNumber, name, category, label, seats, isReserved, notes, vendorNotes, sortOrder } = req.body;
      
      const [table] = await db.insert(weddingTables)
        .values({
          coupleId,
          tableNumber: tableNumber || 1,
          name: name || `Bord ${tableNumber || 1}`,
          category,
          label,
          seats: seats || 8,
          isReserved: isReserved || false,
          notes,
          vendorNotes,
          sortOrder: sortOrder || 0,
        })
        .returning();
      
      res.status(201).json({ ...table, guests: [] });
    } catch (error) {
      console.error("Error creating table:", error);
      res.status(500).json({ error: "Kunne ikke opprette bord" });
    }
  });

  // Update wedding table
  app.patch("/api/couple/tables/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const { tableNumber, name, category, label, seats, isReserved, notes, vendorNotes, sortOrder } = req.body;
      
      const updates: Record<string, any> = { updatedAt: new Date() };
      if (tableNumber !== undefined) updates.tableNumber = tableNumber;
      if (name !== undefined) updates.name = name;
      if (category !== undefined) updates.category = category;
      if (label !== undefined) updates.label = label;
      if (seats !== undefined) updates.seats = seats;
      if (isReserved !== undefined) updates.isReserved = isReserved;
      if (notes !== undefined) updates.notes = notes;
      if (vendorNotes !== undefined) updates.vendorNotes = vendorNotes;
      if (sortOrder !== undefined) updates.sortOrder = sortOrder;
      
      const [updated] = await db.update(weddingTables)
        .set(updates)
        .where(and(
          eq(weddingTables.id, id),
          eq(weddingTables.coupleId, coupleId)
        ))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ error: "Bord ikke funnet" });
      }
      
      // Notify vendors who can view table seating
      const contracts = await db.select({
        vendorId: coupleVendorContracts.vendorId,
        notifyOnTableChanges: coupleVendorContracts.notifyOnTableChanges,
      })
        .from(coupleVendorContracts)
        .where(and(
          eq(coupleVendorContracts.coupleId, coupleId),
          eq(coupleVendorContracts.status, "active"),
          eq(coupleVendorContracts.canViewTableSeating, true)
        ));
      
      const [couple] = await db.select({ displayName: coupleProfiles.displayName })
        .from(coupleProfiles).where(eq(coupleProfiles.id, coupleId));
      
      for (const contract of contracts) {
        if (contract.notifyOnTableChanges) {
          await db.insert(notifications).values({
            recipientType: "vendor",
            recipientId: contract.vendorId,
            type: "table_changed",
            title: "Bordplassering endret",
            body: `${couple?.displayName || 'Brudeparet'} har endret "${updated.name}".`,
            actorType: "couple",
            actorId: coupleId,
            actorName: couple?.displayName || 'Brudeparet',
          });
        }
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating table:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere bord" });
    }
  });

  // Delete wedding table
  app.delete("/api/couple/tables/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      
      // Delete guest assignments first
      await db.delete(tableGuestAssignments)
        .where(and(
          eq(tableGuestAssignments.tableId, id),
          eq(tableGuestAssignments.coupleId, coupleId)
        ));
      
      await db.delete(weddingTables)
        .where(and(
          eq(weddingTables.id, id),
          eq(weddingTables.coupleId, coupleId)
        ));
      
      res.json({ message: "Bord slettet" });
    } catch (error) {
      console.error("Error deleting table:", error);
      res.status(500).json({ error: "Kunne ikke slette bord" });
    }
  });

  // Assign guest to table
  app.post("/api/couple/tables/:tableId/guests", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { tableId } = req.params;
      const { guestId, seatNumber } = req.body;
      
      // Remove any existing assignment for this guest
      await db.delete(tableGuestAssignments)
        .where(and(
          eq(tableGuestAssignments.coupleId, coupleId),
          eq(tableGuestAssignments.guestId, guestId)
        ));
      
      // Create new assignment
      await db.insert(tableGuestAssignments)
        .values({
          coupleId,
          tableId,
          guestId,
          seatNumber,
        });
      
      res.status(201).json({ success: true });
    } catch (error) {
      console.error("Error assigning guest:", error);
      res.status(500).json({ error: "Kunne ikke plassere gjest" });
    }
  });

  // Remove guest from table
  app.delete("/api/couple/tables/:tableId/guests/:guestId", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { tableId, guestId } = req.params;
      
      await db.delete(tableGuestAssignments)
        .where(and(
          eq(tableGuestAssignments.coupleId, coupleId),
          eq(tableGuestAssignments.tableId, tableId),
          eq(tableGuestAssignments.guestId, guestId)
        ));
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error removing guest:", error);
      res.status(500).json({ error: "Kunne ikke fjerne gjest" });
    }
  });

  // ==========================================
  // Vendor Table Seating Access Endpoints
  // ==========================================

  // Vendor views couple's table seating (if granted access)
  app.get("/api/vendor/couple/:coupleId/tables", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { coupleId } = req.params;
      
      // Check if vendor has access to this couple's table seating
      const [contract] = await db.select()
        .from(coupleVendorContracts)
        .where(and(
          eq(coupleVendorContracts.vendorId, vendorId),
          eq(coupleVendorContracts.coupleId, coupleId),
          eq(coupleVendorContracts.status, "active"),
          eq(coupleVendorContracts.canViewTableSeating, true)
        ));
      
      if (!contract) {
        return res.status(403).json({ error: "Ingen tilgang til bordplassering" });
      }
      
      // Get tables
      const tables = await db.select()
        .from(weddingTables)
        .where(eq(weddingTables.coupleId, coupleId))
        .orderBy(weddingTables.sortOrder);
      
      // Get guest assignments
      const assignments = await db.select()
        .from(tableGuestAssignments)
        .where(eq(tableGuestAssignments.coupleId, coupleId));
      
      // Group by table
      const guestsByTable: Record<string, string[]> = {};
      for (const a of assignments) {
        if (!guestsByTable[a.tableId]) guestsByTable[a.tableId] = [];
        guestsByTable[a.tableId].push(a.guestId);
      }
      
      const tablesWithGuests = tables.map(t => ({
        ...t,
        guests: guestsByTable[t.id] || [],
        // Hide private notes, only show vendorNotes
        notes: undefined,
      }));
      
      res.json(tablesWithGuests);
    } catch (error) {
      console.error("Error fetching tables for vendor:", error);
      res.status(500).json({ error: "Kunne ikke hente bordplassering" });
    }
  });

  // ==========================================
  // Coordinator Editing Endpoints
  // ==========================================

  // Helper to validate coordinator token and permissions
  async function validateCoordinatorAccess(token: string, requiredPermission?: 'editSchedule' | 'editSpeeches') {
    const [invitation] = await db.select()
      .from(coordinatorInvitations)
      .where(and(
        eq(coordinatorInvitations.accessToken, token),
        eq(coordinatorInvitations.status, "active")
      ));
    
    if (!invitation) return null;
    
    // Check expiry
    if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
      return null;
    }
    
    // Check required permission
    if (requiredPermission === 'editSchedule' && !invitation.canEditSchedule) {
      return null;
    }
    if (requiredPermission === 'editSpeeches' && !invitation.canEditSpeeches) {
      return null;
    }
    
    return invitation;
  }

  // Helper to notify vendors about changes
  async function notifyVendorsOfChange(coupleId: string, changeType: 'schedule' | 'speech', actorName: string, description: string) {
    try {
      // Find all active contracts for this couple
      const contracts = await db.select({
        vendorId: coupleVendorContracts.vendorId,
        notifyOnScheduleChanges: coupleVendorContracts.notifyOnScheduleChanges,
        notifyOnSpeechChanges: coupleVendorContracts.notifyOnSpeechChanges,
      })
        .from(coupleVendorContracts)
        .where(and(
          eq(coupleVendorContracts.coupleId, coupleId),
          eq(coupleVendorContracts.status, "active")
        ));
      
      // Get couple info for notification
      const [couple] = await db.select({
        displayName: coupleProfiles.displayName,
      }).from(coupleProfiles).where(eq(coupleProfiles.id, coupleId));
      
      // Create notifications for relevant vendors
      for (const contract of contracts) {
        const shouldNotify = changeType === 'schedule' 
          ? contract.notifyOnScheduleChanges 
          : contract.notifyOnSpeechChanges;
        
        if (shouldNotify) {
          await db.insert(notifications).values({
            recipientType: "vendor",
            recipientId: contract.vendorId,
            type: changeType === 'schedule' ? "schedule_changed" : "speech_changed",
            title: changeType === 'schedule' ? "Programendring" : "Talelisteendring",
            body: `${actorName} har endret ${changeType === 'schedule' ? 'bryllupsprogrammet' : 'talelisten'} for ${couple?.displayName || 'brudeparet'}. ${description}`,
            actorType: "couple",
            actorId: coupleId,
            actorName: actorName,
          });
        }
      }
    } catch (error) {
      console.error("Error notifying vendors:", error);
    }
  }

  // Coordinator: Update schedule event
  app.patch("/api/coordinator/:token/schedule-events/:id", async (req: Request, res: Response) => {
    try {
      const { token, id } = req.params;
      const invitation = await validateCoordinatorAccess(token, 'editSchedule');
      
      if (!invitation) {
        return res.status(403).json({ error: "Ingen tilgang til å redigere programmet" });
      }
      
      const { time, title, icon, notes } = req.body;
      
      // Get previous value for activity log
      const [previousEvent] = await db.select()
        .from(scheduleEvents)
        .where(and(
          eq(scheduleEvents.id, id),
          eq(scheduleEvents.coupleId, invitation.coupleId)
        ));
      
      if (!previousEvent) {
        return res.status(404).json({ error: "Hendelse ikke funnet" });
      }
      
      const [updated] = await db.update(scheduleEvents)
        .set({
          time,
          title,
          icon,
          notes,
          updatedAt: new Date(),
        })
        .where(and(
          eq(scheduleEvents.id, id),
          eq(scheduleEvents.coupleId, invitation.coupleId)
        ))
        .returning();
      
      // Log activity
      await db.insert(activityLogs).values({
        coupleId: invitation.coupleId,
        actorType: "coordinator",
        actorId: invitation.id,
        actorName: invitation.name,
        action: "updated",
        entityType: "schedule_event",
        entityId: id,
        previousValue: JSON.stringify(previousEvent),
        newValue: JSON.stringify(updated),
      });
      
      // Notify vendors
      await notifyVendorsOfChange(
        invitation.coupleId,
        'schedule',
        invitation.name,
        `"${title}" ble endret.`
      );
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating schedule event:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere hendelse" });
    }
  });

  // Coordinator: Create schedule event
  app.post("/api/coordinator/:token/schedule-events", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const invitation = await validateCoordinatorAccess(token, 'editSchedule');
      
      if (!invitation) {
        return res.status(403).json({ error: "Ingen tilgang til å redigere programmet" });
      }
      
      const { time, title, icon, notes, sortOrder } = req.body;
      
      const [event] = await db.insert(scheduleEvents)
        .values({
          coupleId: invitation.coupleId,
          time,
          title,
          icon: icon || "star",
          notes,
          sortOrder: sortOrder || 0,
        })
        .returning();
      
      // Log activity
      await db.insert(activityLogs).values({
        coupleId: invitation.coupleId,
        actorType: "coordinator",
        actorId: invitation.id,
        actorName: invitation.name,
        action: "created",
        entityType: "schedule_event",
        entityId: event.id,
        newValue: JSON.stringify(event),
      });
      
      // Notify vendors
      await notifyVendorsOfChange(
        invitation.coupleId,
        'schedule',
        invitation.name,
        `"${title}" ble lagt til kl. ${time}.`
      );
      
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating schedule event:", error);
      res.status(500).json({ error: "Kunne ikke opprette hendelse" });
    }
  });

  // Coordinator: Delete schedule event
  app.delete("/api/coordinator/:token/schedule-events/:id", async (req: Request, res: Response) => {
    try {
      const { token, id } = req.params;
      const invitation = await validateCoordinatorAccess(token, 'editSchedule');
      
      if (!invitation) {
        return res.status(403).json({ error: "Ingen tilgang til å redigere programmet" });
      }
      
      // Get event for logging
      const [event] = await db.select()
        .from(scheduleEvents)
        .where(and(
          eq(scheduleEvents.id, id),
          eq(scheduleEvents.coupleId, invitation.coupleId)
        ));
      
      if (!event) {
        return res.status(404).json({ error: "Hendelse ikke funnet" });
      }
      
      await db.delete(scheduleEvents)
        .where(and(
          eq(scheduleEvents.id, id),
          eq(scheduleEvents.coupleId, invitation.coupleId)
        ));
      
      // Log activity
      await db.insert(activityLogs).values({
        coupleId: invitation.coupleId,
        actorType: "coordinator",
        actorId: invitation.id,
        actorName: invitation.name,
        action: "deleted",
        entityType: "schedule_event",
        entityId: id,
        previousValue: JSON.stringify(event),
      });
      
      // Notify vendors
      await notifyVendorsOfChange(
        invitation.coupleId,
        'schedule',
        invitation.name,
        `"${event.title}" ble fjernet.`
      );
      
      res.json({ message: "Hendelse slettet" });
    } catch (error) {
      console.error("Error deleting schedule event:", error);
      res.status(500).json({ error: "Kunne ikke slette hendelse" });
    }
  });

  // Coordinator: Update speech
  app.patch("/api/coordinator/:token/speeches/:id", async (req: Request, res: Response) => {
    try {
      const { token, id } = req.params;
      const invitation = await validateCoordinatorAccess(token, 'editSpeeches');
      
      if (!invitation) {
        return res.status(403).json({ error: "Ingen tilgang til å redigere talelisten" });
      }
      
      const { speakerName, role, durationMinutes, notes, sortOrder, scheduledTime } = req.body;
      
      // Get previous value
      const [previousSpeech] = await db.select()
        .from(speeches)
        .where(and(
          eq(speeches.id, id),
          eq(speeches.coupleId, invitation.coupleId)
        ));
      
      if (!previousSpeech) {
        return res.status(404).json({ error: "Tale ikke funnet" });
      }
      
      const [updated] = await db.update(speeches)
        .set({
          speakerName,
          role,
          durationMinutes,
          notes,
          sortOrder,
          scheduledTime,
          updatedAt: new Date(),
        })
        .where(and(
          eq(speeches.id, id),
          eq(speeches.coupleId, invitation.coupleId)
        ))
        .returning();
      
      // Log activity
      await db.insert(activityLogs).values({
        coupleId: invitation.coupleId,
        actorType: "coordinator",
        actorId: invitation.id,
        actorName: invitation.name,
        action: "updated",
        entityType: "speech",
        entityId: id,
        previousValue: JSON.stringify(previousSpeech),
        newValue: JSON.stringify(updated),
      });
      
      // Notify vendors
      await notifyVendorsOfChange(
        invitation.coupleId,
        'speech',
        invitation.name,
        `Tale av "${speakerName}" ble endret.`
      );
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating speech:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tale" });
    }
  });

  // Coordinator: Create speech
  app.post("/api/coordinator/:token/speeches", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const invitation = await validateCoordinatorAccess(token, 'editSpeeches');
      
      if (!invitation) {
        return res.status(403).json({ error: "Ingen tilgang til å redigere talelisten" });
      }
      
      const { speakerName, role, durationMinutes, notes, sortOrder, scheduledTime } = req.body;
      
      const [speech] = await db.insert(speeches)
        .values({
          coupleId: invitation.coupleId,
          speakerName,
          role,
          durationMinutes: durationMinutes || 5,
          notes,
          sortOrder: sortOrder || 0,
          scheduledTime,
        })
        .returning();
      
      // Log activity
      await db.insert(activityLogs).values({
        coupleId: invitation.coupleId,
        actorType: "coordinator",
        actorId: invitation.id,
        actorName: invitation.name,
        action: "created",
        entityType: "speech",
        entityId: speech.id,
        newValue: JSON.stringify(speech),
      });
      
      // Notify vendors
      await notifyVendorsOfChange(
        invitation.coupleId,
        'speech',
        invitation.name,
        `Tale av "${speakerName}" ble lagt til.`
      );
      
      res.status(201).json(speech);
    } catch (error) {
      console.error("Error creating speech:", error);
      res.status(500).json({ error: "Kunne ikke opprette tale" });
    }
  });

  // Coordinator: Delete speech
  app.delete("/api/coordinator/:token/speeches/:id", async (req: Request, res: Response) => {
    try {
      const { token, id } = req.params;
      const invitation = await validateCoordinatorAccess(token, 'editSpeeches');
      
      if (!invitation) {
        return res.status(403).json({ error: "Ingen tilgang til å redigere talelisten" });
      }
      
      // Get speech for logging
      const [speech] = await db.select()
        .from(speeches)
        .where(and(
          eq(speeches.id, id),
          eq(speeches.coupleId, invitation.coupleId)
        ));
      
      if (!speech) {
        return res.status(404).json({ error: "Tale ikke funnet" });
      }
      
      await db.delete(speeches)
        .where(and(
          eq(speeches.id, id),
          eq(speeches.coupleId, invitation.coupleId)
        ));
      
      // Log activity
      await db.insert(activityLogs).values({
        coupleId: invitation.coupleId,
        actorType: "coordinator",
        actorId: invitation.id,
        actorName: invitation.name,
        action: "deleted",
        entityType: "speech",
        entityId: id,
        previousValue: JSON.stringify(speech),
      });
      
      // Notify vendors
      await notifyVendorsOfChange(
        invitation.coupleId,
        'speech',
        invitation.name,
        `Tale av "${speech.speakerName}" ble fjernet.`
      );
      
      res.json({ message: "Tale slettet" });
    } catch (error) {
      console.error("Error deleting speech:", error);
      res.status(500).json({ error: "Kunne ikke slette tale" });
    }
  });

  // ==========================================
  // Vendor Contract Endpoints
  // ==========================================

  // Get couple's vendor contracts
  app.get("/api/couple/vendor-contracts", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const contracts = await db.select({
        id: coupleVendorContracts.id,
        vendorId: coupleVendorContracts.vendorId,
        vendorRole: coupleVendorContracts.vendorRole,
        status: coupleVendorContracts.status,
        notifyOnScheduleChanges: coupleVendorContracts.notifyOnScheduleChanges,
        notifyOnSpeechChanges: coupleVendorContracts.notifyOnSpeechChanges,
        canViewSchedule: coupleVendorContracts.canViewSchedule,
        canViewSpeeches: coupleVendorContracts.canViewSpeeches,
        createdAt: coupleVendorContracts.createdAt,
        vendorName: vendors.businessName,
        vendorCategory: vendorCategories.name,
      })
        .from(coupleVendorContracts)
        .leftJoin(vendors, eq(coupleVendorContracts.vendorId, vendors.id))
        .leftJoin(vendorCategories, eq(vendors.categoryId, vendorCategories.id))
        .where(eq(coupleVendorContracts.coupleId, coupleId))
        .orderBy(desc(coupleVendorContracts.createdAt));
      
      res.json(contracts);
    } catch (error) {
      console.error("Error fetching vendor contracts:", error);
      res.status(500).json({ error: "Kunne ikke hente leverandøravtaler" });
    }
  });

  // Create vendor contract (when offer is accepted)
  app.post("/api/couple/vendor-contracts", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { vendorId, offerId, vendorRole, notifyOnScheduleChanges, notifyOnSpeechChanges, canViewSchedule, canViewSpeeches } = req.body;
      
      // Check if contract already exists
      const [existing] = await db.select()
        .from(coupleVendorContracts)
        .where(and(
          eq(coupleVendorContracts.coupleId, coupleId),
          eq(coupleVendorContracts.vendorId, vendorId),
          eq(coupleVendorContracts.status, "active")
        ));
      
      if (existing) {
        return res.status(400).json({ error: "Avtale eksisterer allerede" });
      }
      
      const [contract] = await db.insert(coupleVendorContracts)
        .values({
          coupleId,
          vendorId,
          offerId,
          vendorRole,
          notifyOnScheduleChanges: notifyOnScheduleChanges ?? true,
          notifyOnSpeechChanges: notifyOnSpeechChanges ?? true,
          canViewSchedule: canViewSchedule ?? true,
          canViewSpeeches: canViewSpeeches ?? false,
        })
        .returning();
      
      // Notify vendor about new contract
      const [couple] = await db.select({
        displayName: coupleProfiles.displayName,
      }).from(coupleProfiles).where(eq(coupleProfiles.id, coupleId));
      
      await db.insert(notifications).values({
        recipientType: "vendor",
        recipientId: vendorId,
        type: "contract_created",
        title: "Ny avtale",
        body: `${couple?.displayName || 'Et brudepar'} har opprettet en avtale med deg.`,
        actorType: "couple",
        actorId: coupleId,
      });
      
      res.status(201).json(contract);
    } catch (error) {
      console.error("Error creating vendor contract:", error);
      res.status(500).json({ error: "Kunne ikke opprette avtale" });
    }
  });

  // Update vendor contract settings
  app.patch("/api/couple/vendor-contracts/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const { notifyOnScheduleChanges, notifyOnSpeechChanges, canViewSchedule, canViewSpeeches, status } = req.body;
      
      // Get current contract to check if status is changing to cancelled
      const [currentContract] = await db.select()
        .from(coupleVendorContracts)
        .where(and(
          eq(coupleVendorContracts.id, id),
          eq(coupleVendorContracts.coupleId, coupleId)
        ));
      
      if (!currentContract) {
        return res.status(404).json({ error: "Avtale ikke funnet" });
      }
      
      // If status is changing to cancelled, restore inventory in a transaction
      if (status === "cancelled" && currentContract.status !== "cancelled") {
        try {
          await db.transaction(async (tx) => {
            // Get offer items to restore inventory
            if (currentContract.offerId) {
              const offerItems = await tx.select()
                .from(vendorOfferItems)
                .where(eq(vendorOfferItems.offerId, currentContract.offerId));
              
              for (const item of offerItems) {
                if (!item.productId) continue;
                
                const [product] = await tx.select()
                  .from(vendorProducts)
                  .where(eq(vendorProducts.id, item.productId));
                
                if (product?.trackInventory && product.availableQuantity !== null) {
                  // Restore the quantity
                  const restoredQuantity = product.availableQuantity + (item.quantity || 0);
                  await tx.update(vendorProducts)
                    .set({ 
                      availableQuantity: restoredQuantity,
                      updatedAt: new Date()
                    })
                    .where(eq(vendorProducts.id, item.productId));
                }
              }
            }
            
            // Update contract status within transaction
            await tx.update(coupleVendorContracts)
              .set({
                notifyOnScheduleChanges,
                notifyOnSpeechChanges,
                canViewSchedule,
                canViewSpeeches,
                status,
                updatedAt: new Date(),
              })
              .where(and(
                eq(coupleVendorContracts.id, id),
                eq(coupleVendorContracts.coupleId, coupleId)
              ));
          });
          
          // Get updated contract for response
          const [updated] = await db.select()
            .from(coupleVendorContracts)
            .where(eq(coupleVendorContracts.id, id));
          
          return res.json(updated);
        } catch (txError: any) {
          console.error("Transaction error cancelling contract:", txError);
          return res.status(500).json({ error: "Kunne ikke kansellere avtale" });
        }
      }
      
      const [updated] = await db.update(coupleVendorContracts)
        .set({
          notifyOnScheduleChanges,
          notifyOnSpeechChanges,
          canViewSchedule,
          canViewSpeeches,
          status,
          updatedAt: new Date(),
        })
        .where(and(
          eq(coupleVendorContracts.id, id),
          eq(coupleVendorContracts.coupleId, coupleId)
        ))
        .returning();
      
      res.json(updated);
    } catch (error) {
      console.error("Error updating vendor contract:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere avtale" });
    }
  });

  // Mark vendor contract as completed
  app.post("/api/couple/vendor-contracts/:id/complete", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      
      const [updated] = await db.update(coupleVendorContracts)
        .set({
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(coupleVendorContracts.id, id),
          eq(coupleVendorContracts.coupleId, coupleId)
        ))
        .returning();
      
      if (!updated) {
        return res.status(404).json({ error: "Avtale ikke funnet" });
      }
      
      res.json(updated);
    } catch (error) {
      console.error("Error completing vendor contract:", error);
      res.status(500).json({ error: "Kunne ikke fullføre avtale" });
    }
  });

  // ==========================================
  // Notification Endpoints
  // ==========================================

  // Get vendor notifications
  app.get("/api/vendor/notifications", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const vendorNotifications = await db.select()
        .from(notifications)
        .where(and(
          eq(notifications.recipientType, "vendor"),
          eq(notifications.recipientId, vendorId)
        ))
        .orderBy(desc(notifications.createdAt))
        .limit(50);
      
      res.json(vendorNotifications);
    } catch (error) {
      console.error("Error fetching vendor notifications:", error);
      res.status(500).json({ error: "Kunne ikke hente varsler" });
    }
  });

  // Mark notification as read
  app.patch("/api/vendor/notifications/:id/read", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { id } = req.params;
      
      await db.update(notifications)
        .set({ readAt: new Date() })
        .where(and(
          eq(notifications.id, id),
          eq(notifications.recipientId, vendorId)
        ));
      
      res.json({ message: "Varsel markert som lest" });
    } catch (error) {
      console.error("Error marking notification read:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere varsel" });
    }
  });

  // Get couple notifications
  app.get("/api/couple/notifications", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const coupleNotifications = await db.select()
        .from(notifications)
        .where(and(
          eq(notifications.recipientType, "couple"),
          eq(notifications.recipientId, coupleId)
        ))
        .orderBy(desc(notifications.createdAt))
        .limit(50);
      
      res.json(coupleNotifications);
    } catch (error) {
      console.error("Error fetching couple notifications:", error);
      res.status(500).json({ error: "Kunne ikke hente varsler" });
    }
  });

  // Get unread notification count
  app.get("/api/vendor/notifications/unread-count", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const [result] = await db.select({ count: sql<number>`count(*)::int` })
        .from(notifications)
        .where(and(
          eq(notifications.recipientType, "vendor"),
          eq(notifications.recipientId, vendorId),
          sql`${notifications.readAt} IS NULL`
        ));
      
      res.json({ count: result?.count || 0 });
    } catch (error) {
      console.error("Error fetching unread count:", error);
      res.status(500).json({ error: "Kunne ikke hente antall uleste" });
    }
  });

  // Get vendor's view of couple's schedule (through contract)
  app.get("/api/vendor/couple-schedule/:coupleId", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { coupleId } = req.params;
      
      // Check if vendor has contract with this couple
      const [contract] = await db.select()
        .from(coupleVendorContracts)
        .where(and(
          eq(coupleVendorContracts.coupleId, coupleId),
          eq(coupleVendorContracts.vendorId, vendorId),
          eq(coupleVendorContracts.status, "active"),
          eq(coupleVendorContracts.canViewSchedule, true)
        ));
      
      if (!contract) {
        return res.status(403).json({ error: "Ingen tilgang til dette programmet" });
      }
      
      // Get couple info
      const [couple] = await db.select({
        displayName: coupleProfiles.displayName,
        weddingDate: coupleProfiles.weddingDate,
      }).from(coupleProfiles).where(eq(coupleProfiles.id, coupleId));
      
      // Get schedule
      const schedule = await db.select()
        .from(scheduleEvents)
        .where(eq(scheduleEvents.coupleId, coupleId))
        .orderBy(scheduleEvents.time);
      
      // Get speeches if allowed
      let speechList: any[] = [];
      if (contract.canViewSpeeches) {
        speechList = await db.select()
          .from(speeches)
          .where(eq(speeches.coupleId, coupleId))
          .orderBy(speeches.sortOrder);
      }
      
      res.json({
        couple,
        schedule,
        speeches: speechList,
        canViewSpeeches: contract.canViewSpeeches,
      });
    } catch (error) {
      console.error("Error fetching couple schedule for vendor:", error);
      res.status(500).json({ error: "Kunne ikke hente program" });
    }
  });

  // Vendor sends schedule change suggestion to couple
  app.post("/api/vendor/schedule-suggestions", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { coupleId, type, eventId, suggestedTime, suggestedTitle, message } = req.body;

      if (!coupleId || !message) {
        return res.status(400).json({ error: "Mangler påkrevde felter" });
      }

      // Verify vendor has contract with this couple
      const [contract] = await db.select()
        .from(coupleVendorContracts)
        .where(and(
          eq(coupleVendorContracts.coupleId, coupleId),
          eq(coupleVendorContracts.vendorId, vendorId),
          eq(coupleVendorContracts.status, "active")
        ));

      if (!contract) {
        return res.status(403).json({ error: "Ingen aktiv avtale med dette brudeparet" });
      }

      // Get vendor name
      const [vendor] = await db.select({ businessName: vendors.businessName })
        .from(vendors)
        .where(eq(vendors.id, vendorId));

      // Create notification for couple
      const payload: any = {
        type,
        eventId,
        suggestedTime,
        suggestedTitle,
        message,
        vendorId,
      };

      await db.insert(notifications).values({
        recipientType: "couple",
        recipientId: coupleId,
        type: "schedule_suggestion",
        title: "Forslag til programendring",
        body: `${vendor?.businessName || 'En leverandør'} foreslår en endring: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}`,
        actorType: "vendor",
        actorId: vendorId,
        payload: JSON.stringify(payload),
      });

      // Log activity
      await db.insert(activityLogs).values({
        coupleId,
        actorType: "vendor",
        actorId: vendorId,
        actorName: vendor?.businessName || "Leverandør",
        action: "schedule_suggestion",
        entityType: "schedule_suggestion",
        entityId: vendorId,
        newValue: JSON.stringify({ message: message.substring(0, 100) }),
      });

      res.json({ success: true, message: "Forslag sendt til brudeparet" });
    } catch (error) {
      console.error("Error sending schedule suggestion:", error);
      res.status(500).json({ error: "Kunne ikke sende forslag" });
    }
  });

  // Get vendor's active contracts with couples (for schedule access)
  app.get("/api/vendor/couple-contracts", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const contracts = await db.select({
        id: coupleVendorContracts.id,
        coupleId: coupleVendorContracts.coupleId,
        vendorRole: coupleVendorContracts.vendorRole,
        status: coupleVendorContracts.status,
        canViewSchedule: coupleVendorContracts.canViewSchedule,
        canViewSpeeches: coupleVendorContracts.canViewSpeeches,
        canViewTableSeating: coupleVendorContracts.canViewTableSeating,
        createdAt: coupleVendorContracts.createdAt,
        coupleName: coupleProfiles.displayName,
        weddingDate: coupleProfiles.weddingDate,
      })
        .from(coupleVendorContracts)
        .innerJoin(coupleProfiles, eq(coupleVendorContracts.coupleId, coupleProfiles.id))
        .where(and(
          eq(coupleVendorContracts.vendorId, vendorId),
          eq(coupleVendorContracts.status, "active")
        ))
        .orderBy(desc(coupleVendorContracts.createdAt));

      res.json(contracts);
    } catch (error) {
      console.error("Error fetching vendor couple contracts:", error);
      res.status(500).json({ error: "Kunne ikke hente avtaler" });
    }
  });

  // Get activity log for couple (to see who changed what)
  app.get("/api/couple/activity-log", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const logs = await db.select()
        .from(activityLogs)
        .where(eq(activityLogs.coupleId, coupleId))
        .orderBy(desc(activityLogs.createdAt))
        .limit(50);
      
      res.json(logs);
    } catch (error) {
      console.error("Error fetching activity log:", error);
      res.status(500).json({ error: "Kunne ikke hente aktivitetslogg" });
    }
  });

  // ==================== REVIEWS & FEEDBACK ====================

  // Get couple's completed contracts that can be reviewed
  app.get("/api/couple/reviewable-contracts", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const contracts = await db.select({
        id: coupleVendorContracts.id,
        vendorId: coupleVendorContracts.vendorId,
        vendorRole: coupleVendorContracts.vendorRole,
        completedAt: coupleVendorContracts.completedAt,
        businessName: vendors.businessName,
        imageUrl: vendors.imageUrl,
      })
        .from(coupleVendorContracts)
        .innerJoin(vendors, eq(coupleVendorContracts.vendorId, vendors.id))
        .where(and(
          eq(coupleVendorContracts.coupleId, coupleId),
          eq(coupleVendorContracts.status, "completed")
        ));

      // Check which ones already have reviews
      const existingReviews = await db.select({ contractId: vendorReviews.contractId })
        .from(vendorReviews)
        .where(eq(vendorReviews.coupleId, coupleId));
      
      const reviewedContractIds = new Set(existingReviews.map(r => r.contractId));

      const result = contracts.map(c => ({
        ...c,
        hasReview: reviewedContractIds.has(c.id),
      }));

      res.json(result);
    } catch (error) {
      console.error("Error fetching reviewable contracts:", error);
      res.status(500).json({ error: "Kunne ikke hente avsluttede avtaler" });
    }
  });

  // Submit a review for a vendor
  app.post("/api/couple/reviews", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { contractId, rating, title, body, isAnonymous } = req.body;

      if (!contractId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ error: "Ugyldig anmeldelse" });
      }

      // Verify contract belongs to couple and is completed
      const [contract] = await db.select()
        .from(coupleVendorContracts)
        .where(and(
          eq(coupleVendorContracts.id, contractId),
          eq(coupleVendorContracts.coupleId, coupleId),
          eq(coupleVendorContracts.status, "completed")
        ));

      if (!contract) {
        return res.status(404).json({ error: "Fant ikke fullført avtale" });
      }

      // Check if already reviewed
      const [existing] = await db.select()
        .from(vendorReviews)
        .where(eq(vendorReviews.contractId, contractId));

      if (existing) {
        return res.status(400).json({ error: "Du har allerede gitt en anmeldelse" });
      }

      // Create review with 14-day edit window
      const editableUntil = new Date();
      editableUntil.setDate(editableUntil.getDate() + 14);

      const [review] = await db.insert(vendorReviews).values({
        contractId,
        coupleId,
        vendorId: contract.vendorId,
        rating,
        title: title || null,
        body: body || null,
        isAnonymous: isAnonymous || false,
        editableUntil,
      }).returning();

      // Notify vendor about new review
      await db.insert(notifications).values({
        recipientType: "vendor",
        recipientId: contract.vendorId,
        type: "new_review",
        title: "Ny anmeldelse",
        body: `Du har mottatt en ${rating}-stjerners anmeldelse`,
        payload: JSON.stringify({ reviewId: review.id }),
      });

      res.json(review);
    } catch (error) {
      console.error("Error submitting review:", error);
      res.status(500).json({ error: "Kunne ikke lagre anmeldelse" });
    }
  });

  // Update a review (within 14 days)
  app.patch("/api/couple/reviews/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const { rating, title, body, isAnonymous } = req.body;

      const [existing] = await db.select()
        .from(vendorReviews)
        .where(and(
          eq(vendorReviews.id, id),
          eq(vendorReviews.coupleId, coupleId)
        ));

      if (!existing) {
        return res.status(404).json({ error: "Fant ikke anmeldelse" });
      }

      if (existing.editableUntil && new Date() > new Date(existing.editableUntil)) {
        return res.status(400).json({ error: "Redigeringsperioden har utløpt" });
      }

      const [updated] = await db.update(vendorReviews)
        .set({
          rating: rating ?? existing.rating,
          title: title ?? existing.title,
          body: body ?? existing.body,
          isAnonymous: isAnonymous ?? existing.isAnonymous,
          isApproved: false, // Reset approval on edit
          updatedAt: new Date(),
        })
        .where(eq(vendorReviews.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating review:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere anmeldelse" });
    }
  });

  // Get couple's own reviews
  app.get("/api/couple/reviews", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const reviews = await db.select({
        id: vendorReviews.id,
        contractId: vendorReviews.contractId,
        vendorId: vendorReviews.vendorId,
        rating: vendorReviews.rating,
        title: vendorReviews.title,
        body: vendorReviews.body,
        isAnonymous: vendorReviews.isAnonymous,
        isApproved: vendorReviews.isApproved,
        editableUntil: vendorReviews.editableUntil,
        createdAt: vendorReviews.createdAt,
        businessName: vendors.businessName,
      })
        .from(vendorReviews)
        .innerJoin(vendors, eq(vendorReviews.vendorId, vendors.id))
        .where(eq(vendorReviews.coupleId, coupleId))
        .orderBy(desc(vendorReviews.createdAt));

      res.json(reviews);
    } catch (error) {
      console.error("Error fetching couple reviews:", error);
      res.status(500).json({ error: "Kunne ikke hente anmeldelser" });
    }
  });

  // Get public reviews for a vendor (approved only)
  app.get("/api/vendors/:vendorId/reviews", async (req: Request, res: Response) => {
    try {
      const { vendorId } = req.params;

      const reviews = await db.select({
        id: vendorReviews.id,
        rating: vendorReviews.rating,
        title: vendorReviews.title,
        body: vendorReviews.body,
        isAnonymous: vendorReviews.isAnonymous,
        createdAt: vendorReviews.createdAt,
        coupleName: coupleProfiles.displayName,
      })
        .from(vendorReviews)
        .innerJoin(coupleProfiles, eq(vendorReviews.coupleId, coupleProfiles.id))
        .where(and(
          eq(vendorReviews.vendorId, vendorId),
          eq(vendorReviews.isApproved, true)
        ))
        .orderBy(desc(vendorReviews.createdAt));

      // Get vendor's Google review link
      const [vendor] = await db.select({ googleReviewUrl: vendors.googleReviewUrl })
        .from(vendors)
        .where(eq(vendors.id, vendorId));

      // Get aggregate stats
      const [stats] = await db.select({
        count: sql<number>`count(*)::int`,
        average: sql<number>`round(avg(${vendorReviews.rating})::numeric, 1)`,
      })
        .from(vendorReviews)
        .where(and(
          eq(vendorReviews.vendorId, vendorId),
          eq(vendorReviews.isApproved, true)
        ));

      // Get responses
      const responses = await db.select()
        .from(vendorReviewResponses)
        .innerJoin(vendorReviews, eq(vendorReviewResponses.reviewId, vendorReviews.id))
        .where(eq(vendorReviews.vendorId, vendorId));

      const responseMap = new Map(responses.map(r => [r.vendor_review_responses.reviewId, r.vendor_review_responses]));

      const reviewsWithResponses = reviews.map(r => ({
        ...r,
        coupleName: r.isAnonymous ? "Anonym" : r.coupleName,
        vendorResponse: responseMap.get(r.id) || null,
      }));

      res.json({
        reviews: reviewsWithResponses,
        googleReviewUrl: vendor?.googleReviewUrl || null,
        stats: {
          count: stats?.count || 0,
          average: stats?.average || 0,
        },
      });
    } catch (error) {
      console.error("Error fetching vendor reviews:", error);
      res.status(500).json({ error: "Kunne ikke hente anmeldelser" });
    }
  });

  // Public endpoint to get vendor products (for couple viewing)
  app.get("/api/vendors/:vendorId/products", async (req: Request, res: Response) => {
    try {
      const { vendorId } = req.params;

      const products = await db.select()
        .from(vendorProducts)
        .where(eq(vendorProducts.vendorId, vendorId))
        .orderBy(vendorProducts.createdAt);

      // Parse metadata for each product
      const productsWithMetadata = products.map(p => ({
        ...p,
        metadata: p.metadata ? JSON.parse(p.metadata) : null,
      }));

      res.json(productsWithMetadata);
    } catch (error) {
      console.error("Error fetching vendor products:", error);
      res.status(500).json({ error: "Kunne ikke hente produkter" });
    }
  });

  // Vendor: Get reviews received
  app.get("/api/vendor/reviews", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const reviews = await db.select({
        id: vendorReviews.id,
        contractId: vendorReviews.contractId,
        rating: vendorReviews.rating,
        title: vendorReviews.title,
        body: vendorReviews.body,
        isAnonymous: vendorReviews.isAnonymous,
        isApproved: vendorReviews.isApproved,
        createdAt: vendorReviews.createdAt,
        coupleName: coupleProfiles.displayName,
      })
        .from(vendorReviews)
        .innerJoin(coupleProfiles, eq(vendorReviews.coupleId, coupleProfiles.id))
        .where(eq(vendorReviews.vendorId, vendorId))
        .orderBy(desc(vendorReviews.createdAt));

      // Get responses
      const responses = await db.select()
        .from(vendorReviewResponses)
        .where(eq(vendorReviewResponses.vendorId, vendorId));

      const responseMap = new Map(responses.map(r => [r.reviewId, r]));

      const reviewsWithResponses = reviews.map(r => ({
        ...r,
        coupleName: r.isAnonymous ? "Anonym" : r.coupleName,
        response: responseMap.get(r.id) || null,
      }));

      // Get aggregate stats
      const [stats] = await db.select({
        total: sql<number>`count(*)::int`,
        approved: sql<number>`count(*) filter (where ${vendorReviews.isApproved})::int`,
        average: sql<number>`round(avg(${vendorReviews.rating})::numeric, 1)`,
      })
        .from(vendorReviews)
        .where(eq(vendorReviews.vendorId, vendorId));

      res.json({
        reviews: reviewsWithResponses,
        stats: {
          total: stats?.total || 0,
          approved: stats?.approved || 0,
          average: stats?.average || 0,
        },
      });
    } catch (error) {
      console.error("Error fetching vendor reviews:", error);
      res.status(500).json({ error: "Kunne ikke hente anmeldelser" });
    }
  });

  // Vendor: Respond to a review
  app.post("/api/vendor/reviews/:reviewId/response", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { reviewId } = req.params;
      const { body } = req.body;

      if (!body || body.trim().length === 0) {
        return res.status(400).json({ error: "Svar kan ikke være tomt" });
      }

      // Verify review belongs to vendor
      const [review] = await db.select()
        .from(vendorReviews)
        .where(and(
          eq(vendorReviews.id, reviewId),
          eq(vendorReviews.vendorId, vendorId)
        ));

      if (!review) {
        return res.status(404).json({ error: "Fant ikke anmeldelse" });
      }

      // Check for existing response
      const [existing] = await db.select()
        .from(vendorReviewResponses)
        .where(eq(vendorReviewResponses.reviewId, reviewId));

      if (existing) {
        // Update existing
        const [updated] = await db.update(vendorReviewResponses)
          .set({ body, updatedAt: new Date() })
          .where(eq(vendorReviewResponses.reviewId, reviewId))
          .returning();
        res.json(updated);
      } else {
        // Create new
        const [response] = await db.insert(vendorReviewResponses).values({
          reviewId,
          vendorId,
          body,
        }).returning();
        res.json(response);
      }
    } catch (error) {
      console.error("Error responding to review:", error);
      res.status(500).json({ error: "Kunne ikke lagre svar" });
    }
  });

  // Vendor: Get contracts for review reminders
  app.get("/api/vendor/contracts", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const contracts = await db.select({
        id: coupleVendorContracts.id,
        coupleId: coupleVendorContracts.coupleId,
        status: coupleVendorContracts.status,
        completedAt: coupleVendorContracts.completedAt,
        reviewReminderSentAt: coupleVendorContracts.reviewReminderSentAt,
        coupleName: coupleProfiles.displayName,
      })
        .from(coupleVendorContracts)
        .innerJoin(coupleProfiles, eq(coupleVendorContracts.coupleId, coupleProfiles.id))
        .where(eq(coupleVendorContracts.vendorId, vendorId))
        .orderBy(desc(coupleVendorContracts.createdAt));

      // Check which contracts have reviews
      const contractIds = contracts.map(c => c.id);
      const reviews = contractIds.length > 0 
        ? await db.select({ contractId: vendorReviews.contractId })
            .from(vendorReviews)
            .where(inArray(vendorReviews.contractId, contractIds))
        : [];

      const reviewedContractIds = new Set(reviews.map(r => r.contractId));

      const contractsWithReviewStatus = contracts.map(c => ({
        ...c,
        hasReview: reviewedContractIds.has(c.id),
      }));

      res.json(contractsWithReviewStatus);
    } catch (error) {
      console.error("Error fetching vendor contracts:", error);
      res.status(500).json({ error: "Kunne ikke hente avtaler" });
    }
  });

  // Vendor: Send review reminder to couple
  app.post("/api/vendor/contracts/:contractId/review-reminder", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { contractId } = req.params;

      // Verify contract belongs to vendor and is completed
      const [contract] = await db.select()
        .from(coupleVendorContracts)
        .where(and(
          eq(coupleVendorContracts.id, contractId),
          eq(coupleVendorContracts.vendorId, vendorId),
          eq(coupleVendorContracts.status, "completed")
        ));

      if (!contract) {
        return res.status(404).json({ error: "Fant ikke fullført avtale" });
      }

      // Check if reminder already sent (limit to one per 14 days)
      if (contract.reviewReminderSentAt) {
        const daysSinceReminder = Math.floor(
          (Date.now() - new Date(contract.reviewReminderSentAt).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceReminder < 14) {
          return res.status(400).json({ 
            error: `Du kan sende ny påminnelse om ${14 - daysSinceReminder} dager` 
          });
        }
      }

      // Check if already reviewed
      const [existingReview] = await db.select()
        .from(vendorReviews)
        .where(eq(vendorReviews.contractId, contractId));

      if (existingReview) {
        return res.status(400).json({ error: "Brudeparet har allerede gitt anmeldelse" });
      }

      // Get vendor name
      const [vendor] = await db.select({ businessName: vendors.businessName })
        .from(vendors)
        .where(eq(vendors.id, vendorId));

      // Send notification to couple
      await db.insert(notifications).values({
        recipientType: "couple",
        recipientId: contract.coupleId,
        type: "review_reminder",
        title: "Gi en anmeldelse",
        body: `${vendor?.businessName} ønsker gjerne din tilbakemelding på tjenesten`,
        payload: JSON.stringify({ contractId, vendorId }),
      });

      // Update reminder sent timestamp
      await db.update(coupleVendorContracts)
        .set({ reviewReminderSentAt: new Date() })
        .where(eq(coupleVendorContracts.id, contractId));

      res.json({ success: true, message: "Påminnelse sendt" });
    } catch (error) {
      console.error("Error sending review reminder:", error);
      res.status(500).json({ error: "Kunne ikke sende påminnelse" });
    }
  });

  // Vendor: Update Google review URL
  app.patch("/api/vendor/google-review-url", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { googleReviewUrl } = req.body;

      // Validate URL if provided
      if (googleReviewUrl && !googleReviewUrl.includes("google.com")) {
        return res.status(400).json({ error: "Ugyldig Google-lenke" });
      }

      await db.update(vendors)
        .set({ googleReviewUrl: googleReviewUrl || null, updatedAt: new Date() })
        .where(eq(vendors.id, vendorId));

      res.json({ success: true });
    } catch (error) {
      console.error("Error updating Google review URL:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere lenke" });
    }
  });

  // ==================== APP FEEDBACK ====================

  // Submit feedback to Wedflow (couple)
  app.post("/api/couple/feedback", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { category, subject, message } = req.body;

      if (!category || !subject || !message) {
        return res.status(400).json({ error: "Alle felt må fylles ut" });
      }

      const [feedback] = await db.insert(appFeedback).values({
        submitterType: "couple",
        submitterId: coupleId,
        category,
        subject,
        message,
      }).returning();

      res.json(feedback);
    } catch (error) {
      console.error("Error submitting couple feedback:", error);
      res.status(500).json({ error: "Kunne ikke sende tilbakemelding" });
    }
  });

  // Submit feedback to Wedflow (vendor)
  app.post("/api/vendor/feedback", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { category, subject, message } = req.body;

      if (!category || !subject || !message) {
        return res.status(400).json({ error: "Alle felt må fylles ut" });
      }

      const [feedback] = await db.insert(appFeedback).values({
        submitterType: "vendor",
        submitterId: vendorId,
        category,
        subject,
        message,
      }).returning();

      res.json(feedback);
    } catch (error) {
      console.error("Error submitting vendor feedback:", error);
      res.status(500).json({ error: "Kunne ikke sende tilbakemelding" });
    }
  });

  // Admin: Get all feedback (protected by admin secret)
  app.get("/api/admin/feedback", async (req: Request, res: Response) => {
    const adminSecret = req.headers["x-admin-secret"];
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }

    try {
      const feedback = await db.select()
        .from(appFeedback)
        .orderBy(desc(appFeedback.createdAt));

      res.json(feedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ error: "Kunne ikke hente tilbakemeldinger" });
    }
  });

  // Admin: Update feedback status
  app.patch("/api/admin/feedback/:id", async (req: Request, res: Response) => {
    const adminSecret = req.headers["x-admin-secret"];
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }

    try {
      const { id } = req.params;
      const { status, adminNotes } = req.body;

      const [updated] = await db.update(appFeedback)
        .set({ status, adminNotes, updatedAt: new Date() })
        .where(eq(appFeedback.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating feedback:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tilbakemelding" });
    }
  });

  // Admin: Approve/reject vendor review
  app.patch("/api/admin/reviews/:id", async (req: Request, res: Response) => {
    const adminSecret = req.headers["x-admin-secret"];
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }

    try {
      const { id } = req.params;
      const { isApproved } = req.body;

      const [updated] = await db.update(vendorReviews)
        .set({
          isApproved,
          approvedAt: isApproved ? new Date() : null,
          approvedBy: isApproved ? "admin" : null,
          updatedAt: new Date(),
        })
        .where(eq(vendorReviews.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating review approval:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere godkjenning" });
    }
  });

  // Admin: Get pending reviews for moderation
  app.get("/api/admin/reviews/pending", async (req: Request, res: Response) => {
    const adminSecret = req.headers["x-admin-secret"];
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }

    try {
      const reviews = await db.select({
        id: vendorReviews.id,
        rating: vendorReviews.rating,
        title: vendorReviews.title,
        body: vendorReviews.body,
        isAnonymous: vendorReviews.isAnonymous,
        createdAt: vendorReviews.createdAt,
        coupleName: coupleProfiles.displayName,
        businessName: vendors.businessName,
      })
        .from(vendorReviews)
        .innerJoin(coupleProfiles, eq(vendorReviews.coupleId, coupleProfiles.id))
        .innerJoin(vendors, eq(vendorReviews.vendorId, vendors.id))
        .where(eq(vendorReviews.isApproved, false))
        .orderBy(vendorReviews.createdAt);

      res.json(reviews);
    } catch (error) {
      console.error("Error fetching pending reviews:", error);
      res.status(500).json({ error: "Kunne ikke hente ventende anmeldelser" });
    }
  });

  // Vendor: Mark contract as completed
  app.patch("/api/vendor/contracts/:id/complete", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    // Check subscription access
    if (!(await checkVendorSubscriptionAccess(vendorId, res))) return;

    try {
      const { id } = req.params;

      const [contract] = await db.select()
        .from(coupleVendorContracts)
        .where(and(
          eq(coupleVendorContracts.id, id),
          eq(coupleVendorContracts.vendorId, vendorId)
        ));

      if (!contract) {
        return res.status(404).json({ error: "Fant ikke avtale" });
      }

      const [updated] = await db.update(coupleVendorContracts)
        .set({
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(coupleVendorContracts.id, id))
        .returning();

      // Notify couple
      const [vendor] = await db.select({ businessName: vendors.businessName })
        .from(vendors)
        .where(eq(vendors.id, vendorId));

      await db.insert(notifications).values({
        recipientType: "couple",
        recipientId: contract.coupleId,
        type: "contract_completed",
        title: "Avtale fullført",
        body: `${vendor?.businessName} har markert avtalen som fullført. Gi gjerne en anmeldelse!`,
        payload: JSON.stringify({ contractId: id, vendorId }),
      });

      res.json(updated);
    } catch (error) {
      console.error("Error completing contract:", error);
      res.status(500).json({ error: "Kunne ikke fullføre avtale" });
    }
  });

  // ===== CHECKLIST ENDPOINTS =====
  
  // Admin: Get all checklists (all couples)
  app.get("/api/admin/checklists", async (req: Request, res: Response) => {
    const adminSecret = req.headers["x-admin-secret"];
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }

    try {
      const checklists = await db.select({
        taskId: checklistTasks.id,
        taskTitle: checklistTasks.title,
        taskMonthsBefore: checklistTasks.monthsBefore,
        taskCategory: checklistTasks.category,
        taskCompleted: checklistTasks.completed,
        taskCompletedAt: checklistTasks.completedAt,
        taskNotes: checklistTasks.notes,
        taskIsDefault: checklistTasks.isDefault,
        taskSortOrder: checklistTasks.sortOrder,
        coupleId: coupleProfiles.id,
        coupleName: coupleProfiles.displayName,
        coupleEmail: coupleProfiles.email,
        weddingDate: coupleProfiles.weddingDate,
      })
        .from(checklistTasks)
        .innerJoin(coupleProfiles, eq(checklistTasks.coupleId, coupleProfiles.id))
        .orderBy(coupleProfiles.displayName, checklistTasks.sortOrder);

      res.json(checklists);
    } catch (error) {
      console.error("Error fetching admin checklists:", error);
      res.status(500).json({ error: "Kunne ikke hente sjekklister" });
    }
  });

  // Admin: Get checklist for specific couple
  app.get("/api/admin/checklists/:coupleId", async (req: Request, res: Response) => {
    const adminSecret = req.headers["x-admin-secret"];
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }

    try {
      const { coupleId } = req.params;

      const tasks = await db.select()
        .from(checklistTasks)
        .where(eq(checklistTasks.coupleId, coupleId))
        .orderBy(checklistTasks.sortOrder, checklistTasks.monthsBefore);

      const [couple] = await db.select()
        .from(coupleProfiles)
        .where(eq(coupleProfiles.id, coupleId));

      res.json({ couple, tasks });
    } catch (error) {
      console.error("Error fetching couple checklist:", error);
      res.status(500).json({ error: "Kunne ikke hente sjekkliste" });
    }
  });

  // Admin: Update any checklist task
  app.patch("/api/admin/checklists/:id", async (req: Request, res: Response) => {
    const adminSecret = req.headers["x-admin-secret"];
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }

    try {
      const { id } = req.params;
      const { title, monthsBefore, category, completed, notes, assignedTo } = req.body;

      const updateData: any = { updatedAt: new Date() };
      if (title !== undefined) updateData.title = title;
      if (monthsBefore !== undefined) updateData.monthsBefore = monthsBefore;
      if (category !== undefined) updateData.category = category;
      if (notes !== undefined) updateData.notes = notes;
      if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
      
      if (completed !== undefined) {
        updateData.completed = completed;
        if (completed) {
          updateData.completedAt = new Date();
        } else {
          updateData.completedAt = null;
          updateData.completedBy = null;
        }
      }

      const [updated] = await db.update(checklistTasks)
        .set(updateData)
        .where(eq(checklistTasks.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating checklist task (admin):", error);
      res.status(500).json({ error: "Kunne ikke oppdatere oppgave" });
    }
  });

  // Admin: Delete any checklist task
  app.delete("/api/admin/checklists/:id", async (req: Request, res: Response) => {
    const adminSecret = req.headers["x-admin-secret"];
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: "Ikke autorisert" });
    }

    try {
      const { id } = req.params;

      await db.delete(checklistTasks)
        .where(eq(checklistTasks.id, id));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting checklist task (admin):", error);
      res.status(500).json({ error: "Kunne ikke slette oppgave" });
    }
  });
  
  // Get checklist tasks for couple
  app.get("/api/checklist", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const tasks = await db.select()
        .from(checklistTasks)
        .where(eq(checklistTasks.coupleId, coupleId))
        .orderBy(checklistTasks.sortOrder, checklistTasks.monthsBefore);

      res.json(tasks);
    } catch (error) {
      console.error("Error fetching checklist:", error);
      res.status(500).json({ error: "Kunne ikke hente sjekkliste" });
    }
  });

  // Create new checklist task
  app.post("/api/checklist", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const validation = createChecklistTaskSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ 
          error: "Ugyldig data", 
          details: validation.error.errors 
        });
      }

      const [task] = await db.insert(checklistTasks).values({
        coupleId,
        ...validation.data,
      }).returning();

      res.json(task);
    } catch (error) {
      console.error("Error creating checklist task:", error);
      res.status(500).json({ error: "Kunne ikke opprette oppgave" });
    }
  });

  // Update checklist task
  app.patch("/api/checklist/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const { title, monthsBefore, category, completed, notes, assignedTo, createReminder } = req.body;

      const [existing] = await db.select()
        .from(checklistTasks)
        .where(and(
          eq(checklistTasks.id, id),
          eq(checklistTasks.coupleId, coupleId)
        ));

      if (!existing) {
        return res.status(404).json({ error: "Fant ikke oppgave" });
      }

      const updateData: any = { updatedAt: new Date() };
      if (title !== undefined) updateData.title = title;
      if (monthsBefore !== undefined) updateData.monthsBefore = monthsBefore;
      if (category !== undefined) updateData.category = category;
      if (notes !== undefined) updateData.notes = notes;
      if (assignedTo !== undefined) updateData.assignedTo = assignedTo;
      
      if (completed !== undefined) {
        updateData.completed = completed;
        if (completed) {
          updateData.completedAt = new Date();
          updateData.completedBy = coupleId;
        } else {
          updateData.completedAt = null;
          updateData.completedBy = null;
        }
      }

      // Create linked reminder if requested
      if (createReminder && monthsBefore !== undefined) {
        const [couple] = await db.select().from(coupleProfiles).where(eq(coupleProfiles.id, coupleId));
        
        if (couple?.weddingDate) {
          const weddingDate = new Date(couple.weddingDate);
          const reminderDate = new Date(weddingDate);
          reminderDate.setMonth(reminderDate.getMonth() - monthsBefore);
          
          const [reminder] = await db.insert(reminders).values({
            title: title || existing.title,
            description: notes || `Fra sjekkliste: ${title || existing.title}`,
            reminderDate: reminderDate,
            category: "planning",
          }).returning();

          updateData.linkedReminderId = reminder.id;
        }
      }

      const [updated] = await db.update(checklistTasks)
        .set(updateData)
        .where(eq(checklistTasks.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating checklist task:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere oppgave" });
    }
  });

  // Delete checklist task
  app.delete("/api/checklist/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;

      const [existing] = await db.select()
        .from(checklistTasks)
        .where(and(
          eq(checklistTasks.id, id),
          eq(checklistTasks.coupleId, coupleId)
        ));

      if (!existing) {
        return res.status(404).json({ error: "Fant ikke oppgave" });
      }

      // Don't allow deleting default tasks
      if (existing.isDefault) {
        return res.status(400).json({ error: "Kan ikke slette standardoppgaver" });
      }

      await db.delete(checklistTasks)
        .where(eq(checklistTasks.id, id));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting checklist task:", error);
      res.status(500).json({ error: "Kunne ikke slette oppgave" });
    }
  });

  // Seed default checklist for couple
  app.post("/api/checklist/seed-defaults", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      // Check if couple already has tasks
      const existing = await db.select()
        .from(checklistTasks)
        .where(eq(checklistTasks.coupleId, coupleId));

      if (existing.length > 0) {
        return res.status(400).json({ error: "Sjekkliste finnes allerede" });
      }

      const DEFAULT_TASKS = [
        { title: "Sett bryllupsbudsjett", monthsBefore: 12, category: "planning", sortOrder: 1 },
        { title: "Velg bryllupsdato", monthsBefore: 12, category: "planning", sortOrder: 2 },
        { title: "Book lokale", monthsBefore: 12, category: "vendors", sortOrder: 3 },
        { title: "Start gjesteliste", monthsBefore: 11, category: "planning", sortOrder: 4 },
        { title: "Book fotograf", monthsBefore: 10, category: "vendors", sortOrder: 5 },
        { title: "Book videograf", monthsBefore: 10, category: "vendors", sortOrder: 6 },
        { title: "Bestill/kjøp brudekjole", monthsBefore: 9, category: "attire", sortOrder: 7 },
        { title: "Book DJ/band", monthsBefore: 8, category: "vendors", sortOrder: 8 },
        { title: "Velg catering/meny", monthsBefore: 6, category: "vendors", sortOrder: 9 },
        { title: "Send 'save the date'", monthsBefore: 6, category: "logistics", sortOrder: 10 },
        { title: "Bestill invitasjoner", monthsBefore: 5, category: "logistics", sortOrder: 11 },
        { title: "Book overnatting for gjester", monthsBefore: 5, category: "logistics", sortOrder: 12 },
        { title: "Velg blomsterarrangement", monthsBefore: 4, category: "vendors", sortOrder: 13 },
        { title: "Kjøp/bestill gifteringer", monthsBefore: 4, category: "attire", sortOrder: 14 },
        { title: "Send invitasjoner", monthsBefore: 3, category: "logistics", sortOrder: 15 },
        { title: "Planlegg bryllupsreise", monthsBefore: 3, category: "logistics", sortOrder: 16 },
        { title: "Prøv brudekjole", monthsBefore: 2, category: "attire", sortOrder: 17 },
        { title: "Ferdigstill kjøreplan", monthsBefore: 2, category: "planning", sortOrder: 18 },
        { title: "Bekreft alle leverandører", monthsBefore: 1, category: "vendors", sortOrder: 19 },
        { title: "Ferdigstill bordplassering", monthsBefore: 1, category: "logistics", sortOrder: 20 },
        { title: "Hent brudekjole", monthsBefore: 1, category: "attire", sortOrder: 21 },
        { title: "Øv på brudevals", monthsBefore: 1, category: "final", sortOrder: 22 },
        { title: "Pakk til bryllupsreise", monthsBefore: 0, category: "final", sortOrder: 23 },
        { title: "Siste gjennomgang med lokale", monthsBefore: 0, category: "final", sortOrder: 24 },
      ];

      const tasks = await db.insert(checklistTasks).values(
        DEFAULT_TASKS.map((task) => ({
          coupleId,
          ...task,
          isDefault: true,
        }))
      ).returning();

      res.json(tasks);
    } catch (error) {
      console.error("Error seeding checklist:", error);
      res.status(500).json({ error: "Kunne ikke opprette standardsjekkliste" });
    }
  });

  // ===== BUDGET ENDPOINTS =====

  // Get couple's budget settings
  app.get("/api/couple/budget/settings", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const [settings] = await db.select()
        .from(coupleBudgetSettings)
        .where(eq(coupleBudgetSettings.coupleId, coupleId));

      res.json(settings || { totalBudget: 0, currency: "NOK" });
    } catch (error) {
      console.error("Error fetching budget settings:", error);
      res.status(500).json({ error: "Kunne ikke hente budsjettinnstillinger" });
    }
  });

  // Update couple's budget settings
  app.put("/api/couple/budget/settings", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { totalBudget, currency } = req.body;

      const [existing] = await db.select()
        .from(coupleBudgetSettings)
        .where(eq(coupleBudgetSettings.coupleId, coupleId));

      if (existing) {
        const [updated] = await db.update(coupleBudgetSettings)
          .set({ totalBudget, currency, updatedAt: new Date() })
          .where(eq(coupleBudgetSettings.coupleId, coupleId))
          .returning();
        res.json(updated);
      } else {
        const [created] = await db.insert(coupleBudgetSettings).values({
          coupleId,
          totalBudget,
          currency: currency || "NOK",
        }).returning();
        res.json(created);
      }
    } catch (error) {
      console.error("Error updating budget settings:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere budsjettinnstillinger" });
    }
  });

  // Get couple's budget items
  app.get("/api/couple/budget/items", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const items = await db.select()
        .from(coupleBudgetItems)
        .where(eq(coupleBudgetItems.coupleId, coupleId))
        .orderBy(coupleBudgetItems.sortOrder, coupleBudgetItems.createdAt);

      res.json(items);
    } catch (error) {
      console.error("Error fetching budget items:", error);
      res.status(500).json({ error: "Kunne ikke hente budsjettlinjer" });
    }
  });

  // Create budget item
  app.post("/api/couple/budget/items", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const parsed = createBudgetItemSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Ugyldig data", details: parsed.error.flatten() });
      }

      const [item] = await db.insert(coupleBudgetItems).values({
        coupleId,
        ...parsed.data,
      }).returning();

      res.json(item);
    } catch (error) {
      console.error("Error creating budget item:", error);
      res.status(500).json({ error: "Kunne ikke opprette budsjettlinje" });
    }
  });

  // Update budget item
  app.patch("/api/couple/budget/items/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const { category, label, estimatedCost, actualCost, isPaid, notes, sortOrder } = req.body;

      const [existing] = await db.select()
        .from(coupleBudgetItems)
        .where(and(eq(coupleBudgetItems.id, id), eq(coupleBudgetItems.coupleId, coupleId)));

      if (!existing) {
        return res.status(404).json({ error: "Fant ikke budsjettlinje" });
      }

      const updateData: any = { updatedAt: new Date() };
      if (category !== undefined) updateData.category = category;
      if (label !== undefined) updateData.label = label;
      if (estimatedCost !== undefined) updateData.estimatedCost = estimatedCost;
      if (actualCost !== undefined) updateData.actualCost = actualCost;
      if (isPaid !== undefined) updateData.isPaid = isPaid;
      if (notes !== undefined) updateData.notes = notes;
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

      const [updated] = await db.update(coupleBudgetItems)
        .set(updateData)
        .where(eq(coupleBudgetItems.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating budget item:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere budsjettlinje" });
    }
  });

  // Delete budget item
  app.delete("/api/couple/budget/items/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;

      await db.delete(coupleBudgetItems)
        .where(and(eq(coupleBudgetItems.id, id), eq(coupleBudgetItems.coupleId, coupleId)));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting budget item:", error);
      res.status(500).json({ error: "Kunne ikke slette budsjettlinje" });
    }
  });

  // ===== DRESS TRACKING ENDPOINTS =====

  // Get all dress data
  app.get("/api/couple/dress", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const [appointments, favorites, timeline] = await Promise.all([
        db.select().from(coupleDressAppointments)
          .where(eq(coupleDressAppointments.coupleId, coupleId))
          .orderBy(coupleDressAppointments.date),
        db.select().from(coupleDressFavorites)
          .where(eq(coupleDressFavorites.coupleId, coupleId))
          .orderBy(coupleDressFavorites.createdAt),
        db.select().from(coupleDressTimeline)
          .where(eq(coupleDressTimeline.coupleId, coupleId)),
      ]);

      res.json({
        appointments,
        favorites,
        timeline: timeline[0] || null,
      });
    } catch (error) {
      console.error("Error fetching dress data:", error);
      res.status(500).json({ error: "Kunne ikke hente kjoledata" });
    }
  });

  // Create dress appointment
  app.post("/api/couple/dress/appointments", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const parsed = createDressAppointmentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Ugyldig data", details: parsed.error.flatten() });
      }

      const [appointment] = await db.insert(coupleDressAppointments).values({
        coupleId,
        ...parsed.data,
      }).returning();

      res.json(appointment);
    } catch (error) {
      console.error("Error creating dress appointment:", error);
      res.status(500).json({ error: "Kunne ikke opprette avtale" });
    }
  });

  // Update dress appointment
  app.patch("/api/couple/dress/appointments/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const { shopName, date, time, notes, completed } = req.body;

      const updateData: any = { updatedAt: new Date() };
      if (shopName !== undefined) updateData.shopName = shopName;
      if (date !== undefined) updateData.date = date;
      if (time !== undefined) updateData.time = time;
      if (notes !== undefined) updateData.notes = notes;
      if (completed !== undefined) updateData.completed = completed;

      const [updated] = await db.update(coupleDressAppointments)
        .set(updateData)
        .where(and(eq(coupleDressAppointments.id, id), eq(coupleDressAppointments.coupleId, coupleId)))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating dress appointment:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere avtale" });
    }
  });

  // Delete dress appointment
  app.delete("/api/couple/dress/appointments/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      await db.delete(coupleDressAppointments)
        .where(and(eq(coupleDressAppointments.id, id), eq(coupleDressAppointments.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting dress appointment:", error);
      res.status(500).json({ error: "Kunne ikke slette avtale" });
    }
  });

  // Create dress favorite
  app.post("/api/couple/dress/favorites", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const parsed = createDressFavoriteSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Ugyldig data", details: parsed.error.flatten() });
      }

      const [favorite] = await db.insert(coupleDressFavorites).values({
        coupleId,
        ...parsed.data,
      }).returning();

      res.json(favorite);
    } catch (error) {
      console.error("Error creating dress favorite:", error);
      res.status(500).json({ error: "Kunne ikke lagre kjole" });
    }
  });

  // Update dress favorite
  app.patch("/api/couple/dress/favorites/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const { name, designer, shop, price, imageUrl, notes, isFavorite } = req.body;

      const updateData: any = { updatedAt: new Date() };
      if (name !== undefined) updateData.name = name;
      if (designer !== undefined) updateData.designer = designer;
      if (shop !== undefined) updateData.shop = shop;
      if (price !== undefined) updateData.price = price;
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
      if (notes !== undefined) updateData.notes = notes;
      if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

      const [updated] = await db.update(coupleDressFavorites)
        .set(updateData)
        .where(and(eq(coupleDressFavorites.id, id), eq(coupleDressFavorites.coupleId, coupleId)))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating dress favorite:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere kjole" });
    }
  });

  // Delete dress favorite
  app.delete("/api/couple/dress/favorites/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      await db.delete(coupleDressFavorites)
        .where(and(eq(coupleDressFavorites.id, id), eq(coupleDressFavorites.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting dress favorite:", error);
      res.status(500).json({ error: "Kunne ikke slette kjole" });
    }
  });

  // Update dress timeline
  app.put("/api/couple/dress/timeline", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { ordered, orderedDate, firstFitting, firstFittingDate, alterations, alterationsDate, finalFitting, finalFittingDate, pickup, pickupDate, budget } = req.body;

      const [existing] = await db.select()
        .from(coupleDressTimeline)
        .where(eq(coupleDressTimeline.coupleId, coupleId));

      const timelineData = {
        ordered: ordered ?? false,
        orderedDate: orderedDate || null,
        firstFitting: firstFitting ?? false,
        firstFittingDate: firstFittingDate || null,
        alterations: alterations ?? false,
        alterationsDate: alterationsDate || null,
        finalFitting: finalFitting ?? false,
        finalFittingDate: finalFittingDate || null,
        pickup: pickup ?? false,
        pickupDate: pickupDate || null,
        budget: budget ?? 0,
        updatedAt: new Date(),
      };

      if (existing) {
        const [updated] = await db.update(coupleDressTimeline)
          .set(timelineData)
          .where(eq(coupleDressTimeline.coupleId, coupleId))
          .returning();
        res.json(updated);
      } else {
        const [created] = await db.insert(coupleDressTimeline).values({
          coupleId,
          ...timelineData,
        }).returning();
        res.json(created);
      }
    } catch (error) {
      console.error("Error updating dress timeline:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tidslinje" });
    }
  });

  // ===== IMPORTANT PEOPLE ENDPOINTS =====

  // Get important people
  app.get("/api/couple/important-people", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const people = await db.select()
        .from(coupleImportantPeople)
        .where(eq(coupleImportantPeople.coupleId, coupleId))
        .orderBy(coupleImportantPeople.sortOrder, coupleImportantPeople.createdAt);

      res.json(people);
    } catch (error) {
      console.error("Error fetching important people:", error);
      res.status(500).json({ error: "Kunne ikke hente viktige personer" });
    }
  });

  // Create important person
  app.post("/api/couple/important-people", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const parsed = createImportantPersonSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Ugyldig data", details: parsed.error.flatten() });
      }

      const [person] = await db.insert(coupleImportantPeople).values({
        coupleId,
        ...parsed.data,
      }).returning();

      res.json(person);
    } catch (error) {
      console.error("Error creating important person:", error);
      res.status(500).json({ error: "Kunne ikke legge til person" });
    }
  });

  // Update important person
  app.patch("/api/couple/important-people/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const { name, role, phone, email, notes, sortOrder } = req.body;

      const updateData: any = { updatedAt: new Date() };
      if (name !== undefined) updateData.name = name;
      if (role !== undefined) updateData.role = role;
      if (phone !== undefined) updateData.phone = phone;
      if (email !== undefined) updateData.email = email;
      if (notes !== undefined) updateData.notes = notes;
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;

      const [updated] = await db.update(coupleImportantPeople)
        .set(updateData)
        .where(and(eq(coupleImportantPeople.id, id), eq(coupleImportantPeople.coupleId, coupleId)))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating important person:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere person" });
    }
  });

  // Delete important person
  app.delete("/api/couple/important-people/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      await db.delete(coupleImportantPeople)
        .where(and(eq(coupleImportantPeople.id, id), eq(coupleImportantPeople.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting important person:", error);
      res.status(500).json({ error: "Kunne ikke slette person" });
    }
  });

  // ===== PHOTO SHOTS ENDPOINTS =====

  // Get photo shots
  app.get("/api/couple/photo-shots", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const shots = await db.select()
        .from(couplePhotoShots)
        .where(eq(couplePhotoShots.coupleId, coupleId))
        .orderBy(couplePhotoShots.sortOrder, couplePhotoShots.createdAt);

      res.json(shots);
    } catch (error) {
      console.error("Error fetching photo shots:", error);
      res.status(500).json({ error: "Kunne ikke hente fotoliste" });
    }
  });

  // Create photo shot
  app.post("/api/couple/photo-shots", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const parsed = createPhotoShotSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Ugyldig data", details: parsed.error.flatten() });
      }

      const [shot] = await db.insert(couplePhotoShots).values({
        coupleId,
        ...parsed.data,
      }).returning();

      res.json(shot);
    } catch (error) {
      console.error("Error creating photo shot:", error);
      res.status(500).json({ error: "Kunne ikke legge til bilde" });
    }
  });

  // Update photo shot
  app.patch("/api/couple/photo-shots/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const { title, description, category, completed, sortOrder,
              locationName, locationLat, locationLng, locationNotes,
              weatherTip, travelFromVenue, imageUri, scouted } = req.body;

      const updateData: any = { updatedAt: new Date() };
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (completed !== undefined) updateData.completed = completed;
      if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
      // Location scouting fields
      if (locationName !== undefined) updateData.locationName = locationName;
      if (locationLat !== undefined) updateData.locationLat = locationLat;
      if (locationLng !== undefined) updateData.locationLng = locationLng;
      if (locationNotes !== undefined) updateData.locationNotes = locationNotes;
      if (weatherTip !== undefined) updateData.weatherTip = weatherTip;
      if (travelFromVenue !== undefined) updateData.travelFromVenue = travelFromVenue;
      if (imageUri !== undefined) updateData.imageUri = imageUri;
      if (scouted !== undefined) updateData.scouted = scouted;

      const [updated] = await db.update(couplePhotoShots)
        .set(updateData)
        .where(and(eq(couplePhotoShots.id, id), eq(couplePhotoShots.coupleId, coupleId)))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating photo shot:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere bilde" });
    }
  });

  // Delete photo shot
  app.delete("/api/couple/photo-shots/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      await db.delete(couplePhotoShots)
        .where(and(eq(couplePhotoShots.id, id), eq(couplePhotoShots.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting photo shot:", error);
      res.status(500).json({ error: "Kunne ikke slette bilde" });
    }
  });

  // Get vendor-planned photo shots (pushed from CreatorHub)
  app.get("/api/couple/photo-shots/vendor-planned", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const vendorShots = await db.select()
        .from(couplePhotoShots)
        .where(and(
          eq(couplePhotoShots.coupleId, coupleId),
          sql`${couplePhotoShots.id} LIKE 'vendor-%'`
        ))
        .orderBy(couplePhotoShots.sortOrder, couplePhotoShots.createdAt);

      res.json({
        vendorShots,
        count: vendorShots.length,
      });
    } catch (error) {
      console.error("Error fetching vendor-planned shots:", error);
      res.status(500).json({ error: "Kunne ikke hente fotografens planlagte bilder" });
    }
  });

  // Seed default photo shots
  app.post("/api/couple/photo-shots/seed-defaults", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const existing = await db.select()
        .from(couplePhotoShots)
        .where(eq(couplePhotoShots.coupleId, coupleId));

      if (existing.length > 0) {
        return res.status(400).json({ error: "Fotoliste finnes allerede" });
      }

      const DEFAULT_SHOTS = [
        { title: "Detaljer av brudekjolen", description: "Nærbilder av kjole og sko", category: "details", sortOrder: 1 },
        { title: "Bruden og forlover", description: "Før seremonien", category: "portraits", sortOrder: 2 },
        { title: "Brudgommen gjør seg klar", description: "Med bestmennene", category: "portraits", sortOrder: 3 },
        { title: "Brudens ankomst", description: "Ved kirken/lokalet", category: "ceremony", sortOrder: 4 },
        { title: "Seremonien", description: "Utveksling av løfter og ringer", category: "ceremony", sortOrder: 5 },
        { title: "Første kyss", description: "Det viktige øyeblikket", category: "ceremony", sortOrder: 6 },
        { title: "Gruppebilde med familie", description: "Begge familier samlet", category: "group", sortOrder: 7 },
        { title: "Brudeparet alene", description: "Romantiske portretter", category: "portraits", sortOrder: 8 },
        { title: "Middagen starter", description: "Første dans og taler", category: "reception", sortOrder: 9 },
        { title: "Kaken skjæres", description: "Bryllupskaken", category: "reception", sortOrder: 10 },
      ];

      const shots = await db.insert(couplePhotoShots).values(
        DEFAULT_SHOTS.map((shot) => ({
          coupleId,
          ...shot,
        }))
      ).returning();

      res.json(shots);
    } catch (error) {
      console.error("Error seeding photo shots:", error);
      res.status(500).json({ error: "Kunne ikke opprette standardfotoliste" });
    }
  });

  // ===== HAIR & MAKEUP ROUTES =====

  // Get all hair/makeup data
  app.get("/api/couple/hair-makeup", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const [appointments, looks, timelineRows] = await Promise.all([
        db.select().from(coupleHairMakeupAppointments).where(eq(coupleHairMakeupAppointments.coupleId, coupleId)).orderBy(coupleHairMakeupAppointments.date),
        db.select().from(coupleHairMakeupLooks).where(eq(coupleHairMakeupLooks.coupleId, coupleId)),
        db.select().from(coupleHairMakeupTimeline).where(eq(coupleHairMakeupTimeline.coupleId, coupleId)),
      ]);

      const timeline = timelineRows[0] || {
        consultationBooked: false, trialBooked: false, lookSelected: false, weddingDayBooked: false, budget: 0
      };

      res.json({ appointments, looks, timeline });
    } catch (error) {
      console.error("Error fetching hair/makeup data:", error);
      res.status(500).json({ error: "Kunne ikke hente hår/makeup data" });
    }
  });

  // Create hair/makeup appointment
  app.post("/api/couple/hair-makeup/appointments", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { stylistName, serviceType, appointmentType, date, time, location, notes } = req.body;
      const [appointment] = await db.insert(coupleHairMakeupAppointments).values({
        coupleId, stylistName, serviceType, appointmentType, date, time, location, notes
      }).returning();
      res.json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ error: "Kunne ikke opprette avtale" });
    }
  });

  // Update hair/makeup appointment
  app.patch("/api/couple/hair-makeup/appointments/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const [appointment] = await db.update(coupleHairMakeupAppointments)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(coupleHairMakeupAppointments.id, id), eq(coupleHairMakeupAppointments.coupleId, coupleId)))
        .returning();
      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere avtale" });
    }
  });

  // Delete hair/makeup appointment
  app.delete("/api/couple/hair-makeup/appointments/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      await db.delete(coupleHairMakeupAppointments)
        .where(and(eq(coupleHairMakeupAppointments.id, id), eq(coupleHairMakeupAppointments.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ error: "Kunne ikke slette avtale" });
    }
  });

  // Create hair/makeup look
  app.post("/api/couple/hair-makeup/looks", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { name, lookType, imageUrl, notes, isFavorite } = req.body;
      const [look] = await db.insert(coupleHairMakeupLooks).values({
        coupleId, name, lookType, imageUrl, notes, isFavorite
      }).returning();
      res.json(look);
    } catch (error) {
      console.error("Error creating look:", error);
      res.status(500).json({ error: "Kunne ikke opprette look" });
    }
  });

  // Update hair/makeup look
  app.patch("/api/couple/hair-makeup/looks/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const [look] = await db.update(coupleHairMakeupLooks)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(coupleHairMakeupLooks.id, id), eq(coupleHairMakeupLooks.coupleId, coupleId)))
        .returning();
      res.json(look);
    } catch (error) {
      console.error("Error updating look:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere look" });
    }
  });

  // Delete hair/makeup look
  app.delete("/api/couple/hair-makeup/looks/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      await db.delete(coupleHairMakeupLooks)
        .where(and(eq(coupleHairMakeupLooks.id, id), eq(coupleHairMakeupLooks.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting look:", error);
      res.status(500).json({ error: "Kunne ikke slette look" });
    }
  });

  // Update hair/makeup timeline
  app.put("/api/couple/hair-makeup/timeline", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const existing = await db.select().from(coupleHairMakeupTimeline).where(eq(coupleHairMakeupTimeline.coupleId, coupleId));
      
      if (existing.length > 0) {
        const [timeline] = await db.update(coupleHairMakeupTimeline)
          .set({ ...req.body, updatedAt: new Date() })
          .where(eq(coupleHairMakeupTimeline.coupleId, coupleId))
          .returning();
        res.json(timeline);
      } else {
        const [timeline] = await db.insert(coupleHairMakeupTimeline).values({
          coupleId, ...req.body
        }).returning();
        res.json(timeline);
      }
    } catch (error) {
      console.error("Error updating timeline:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tidslinje" });
    }
  });

  // ===== TRANSPORT ROUTES =====

  // Get all transport data
  app.get("/api/couple/transport", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const [bookings, timelineRows] = await Promise.all([
        db.select().from(coupleTransportBookings).where(eq(coupleTransportBookings.coupleId, coupleId)),
        db.select().from(coupleTransportTimeline).where(eq(coupleTransportTimeline.coupleId, coupleId)),
      ]);

      const timeline = timelineRows[0] || {
        brideCarBooked: false, groomCarBooked: false, guestShuttleBooked: false, getawayCarBooked: false, allConfirmed: false, budget: 0
      };

      res.json({ bookings, timeline });
    } catch (error) {
      console.error("Error fetching transport data:", error);
      res.status(500).json({ error: "Kunne ikke hente transport data" });
    }
  });

  // Create transport booking
  app.post("/api/couple/transport/bookings", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const [booking] = await db.insert(coupleTransportBookings).values({
        coupleId, ...req.body
      }).returning();
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ error: "Kunne ikke opprette bestilling" });
    }
  });

  // Update transport booking
  app.patch("/api/couple/transport/bookings/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const [booking] = await db.update(coupleTransportBookings)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(coupleTransportBookings.id, id), eq(coupleTransportBookings.coupleId, coupleId)))
        .returning();
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere bestilling" });
    }
  });

  // Delete transport booking
  app.delete("/api/couple/transport/bookings/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      await db.delete(coupleTransportBookings)
        .where(and(eq(coupleTransportBookings.id, id), eq(coupleTransportBookings.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ error: "Kunne ikke slette bestilling" });
    }
  });

  // Update transport timeline
  app.put("/api/couple/transport/timeline", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const existing = await db.select().from(coupleTransportTimeline).where(eq(coupleTransportTimeline.coupleId, coupleId));
      
      if (existing.length > 0) {
        const [timeline] = await db.update(coupleTransportTimeline)
          .set({ ...req.body, updatedAt: new Date() })
          .where(eq(coupleTransportTimeline.coupleId, coupleId))
          .returning();
        res.json(timeline);
      } else {
        const [timeline] = await db.insert(coupleTransportTimeline).values({
          coupleId, ...req.body
        }).returning();
        res.json(timeline);
      }
    } catch (error) {
      console.error("Error updating timeline:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tidslinje" });
    }
  });

  // ===== FLOWERS/FLORIST ROUTES =====

  // Get all flower data
  app.get("/api/couple/flowers", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const [appointments, selections, timelineRows] = await Promise.all([
        db.select().from(coupleFlowerAppointments).where(eq(coupleFlowerAppointments.coupleId, coupleId)).orderBy(coupleFlowerAppointments.date),
        db.select().from(coupleFlowerSelections).where(eq(coupleFlowerSelections.coupleId, coupleId)),
        db.select().from(coupleFlowerTimeline).where(eq(coupleFlowerTimeline.coupleId, coupleId)),
      ]);

      const timeline = timelineRows[0] || {
        floristSelected: false, consultationDone: false, mockupApproved: false, deliveryConfirmed: false, budget: 0
      };

      res.json({ appointments, selections, timeline });
    } catch (error) {
      console.error("Error fetching flower data:", error);
      res.status(500).json({ error: "Kunne ikke hente blomster data" });
    }
  });

  // Create flower appointment
  app.post("/api/couple/flowers/appointments", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const [appointment] = await db.insert(coupleFlowerAppointments).values({
        coupleId, ...req.body
      }).returning();
      res.json(appointment);
    } catch (error) {
      console.error("Error creating appointment:", error);
      res.status(500).json({ error: "Kunne ikke opprette avtale" });
    }
  });

  // Update flower appointment
  app.patch("/api/couple/flowers/appointments/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const [appointment] = await db.update(coupleFlowerAppointments)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(coupleFlowerAppointments.id, id), eq(coupleFlowerAppointments.coupleId, coupleId)))
        .returning();
      res.json(appointment);
    } catch (error) {
      console.error("Error updating appointment:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere avtale" });
    }
  });

  // Delete flower appointment
  app.delete("/api/couple/flowers/appointments/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      await db.delete(coupleFlowerAppointments)
        .where(and(eq(coupleFlowerAppointments.id, id), eq(coupleFlowerAppointments.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting appointment:", error);
      res.status(500).json({ error: "Kunne ikke slette avtale" });
    }
  });

  // Create flower selection
  app.post("/api/couple/flowers/selections", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const [selection] = await db.insert(coupleFlowerSelections).values({
        coupleId, ...req.body
      }).returning();
      res.json(selection);
    } catch (error) {
      console.error("Error creating selection:", error);
      res.status(500).json({ error: "Kunne ikke opprette valg" });
    }
  });

  // Update flower selection
  app.patch("/api/couple/flowers/selections/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const [selection] = await db.update(coupleFlowerSelections)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(coupleFlowerSelections.id, id), eq(coupleFlowerSelections.coupleId, coupleId)))
        .returning();
      res.json(selection);
    } catch (error) {
      console.error("Error updating selection:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere valg" });
    }
  });

  // Delete flower selection
  app.delete("/api/couple/flowers/selections/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      await db.delete(coupleFlowerSelections)
        .where(and(eq(coupleFlowerSelections.id, id), eq(coupleFlowerSelections.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting selection:", error);
      res.status(500).json({ error: "Kunne ikke slette valg" });
    }
  });

  // Update flower timeline
  app.put("/api/couple/flowers/timeline", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const existing = await db.select().from(coupleFlowerTimeline).where(eq(coupleFlowerTimeline.coupleId, coupleId));
      
      if (existing.length > 0) {
        const [timeline] = await db.update(coupleFlowerTimeline)
          .set({ ...req.body, updatedAt: new Date() })
          .where(eq(coupleFlowerTimeline.coupleId, coupleId))
          .returning();
        res.json(timeline);
      } else {
        const [timeline] = await db.insert(coupleFlowerTimeline).values({
          coupleId, ...req.body
        }).returning();
        res.json(timeline);
      }
    } catch (error) {
      console.error("Error updating timeline:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tidslinje" });
    }
  });

  // ===== CATERING ROUTES =====

  // Get all catering data
  app.get("/api/couple/catering", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const [tastings, menu, dietaryNeeds, timelineRows] = await Promise.all([
        db.select().from(coupleCateringTastings).where(eq(coupleCateringTastings.coupleId, coupleId)).orderBy(coupleCateringTastings.date),
        db.select().from(coupleCateringMenu).where(eq(coupleCateringMenu.coupleId, coupleId)),
        db.select().from(coupleCateringDietaryNeeds).where(eq(coupleCateringDietaryNeeds.coupleId, coupleId)),
        db.select().from(coupleCateringTimeline).where(eq(coupleCateringTimeline.coupleId, coupleId)),
      ]);

      const timeline = timelineRows[0] || {
        catererSelected: false, tastingCompleted: false, menuFinalized: false, guestCountConfirmed: false, guestCount: 0, budget: 0
      };

      res.json({ tastings, menu, dietaryNeeds, timeline });
    } catch (error) {
      console.error("Error fetching catering data:", error);
      res.status(500).json({ error: "Kunne ikke hente catering data" });
    }
  });

  // Create catering tasting
  app.post("/api/couple/catering/tastings", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const [tasting] = await db.insert(coupleCateringTastings).values({
        coupleId, ...req.body
      }).returning();
      res.json(tasting);
    } catch (error) {
      console.error("Error creating tasting:", error);
      res.status(500).json({ error: "Kunne ikke opprette smaksprøve" });
    }
  });

  // Update catering tasting
  app.patch("/api/couple/catering/tastings/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const [tasting] = await db.update(coupleCateringTastings)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(coupleCateringTastings.id, id), eq(coupleCateringTastings.coupleId, coupleId)))
        .returning();
      res.json(tasting);
    } catch (error) {
      console.error("Error updating tasting:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere smaksprøve" });
    }
  });

  // Delete catering tasting
  app.delete("/api/couple/catering/tastings/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      await db.delete(coupleCateringTastings)
        .where(and(eq(coupleCateringTastings.id, id), eq(coupleCateringTastings.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting tasting:", error);
      res.status(500).json({ error: "Kunne ikke slette smaksprøve" });
    }
  });

  // Create menu item
  app.post("/api/couple/catering/menu", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const [menuItem] = await db.insert(coupleCateringMenu).values({
        coupleId, ...req.body
      }).returning();
      res.json(menuItem);
    } catch (error) {
      console.error("Error creating menu item:", error);
      res.status(500).json({ error: "Kunne ikke opprette rett" });
    }
  });

  // Update menu item
  app.patch("/api/couple/catering/menu/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const [menuItem] = await db.update(coupleCateringMenu)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(coupleCateringMenu.id, id), eq(coupleCateringMenu.coupleId, coupleId)))
        .returning();
      res.json(menuItem);
    } catch (error) {
      console.error("Error updating menu item:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere rett" });
    }
  });

  // Delete menu item
  app.delete("/api/couple/catering/menu/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      await db.delete(coupleCateringMenu)
        .where(and(eq(coupleCateringMenu.id, id), eq(coupleCateringMenu.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting menu item:", error);
      res.status(500).json({ error: "Kunne ikke slette rett" });
    }
  });

  // Create dietary need
  app.post("/api/couple/catering/dietary", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const [need] = await db.insert(coupleCateringDietaryNeeds).values({
        coupleId, ...req.body
      }).returning();
      res.json(need);
    } catch (error) {
      console.error("Error creating dietary need:", error);
      res.status(500).json({ error: "Kunne ikke opprette kostbehov" });
    }
  });

  // Update dietary need
  app.patch("/api/couple/catering/dietary/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const [need] = await db.update(coupleCateringDietaryNeeds)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(coupleCateringDietaryNeeds.id, id), eq(coupleCateringDietaryNeeds.coupleId, coupleId)))
        .returning();
      res.json(need);
    } catch (error) {
      console.error("Error updating dietary need:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere kostbehov" });
    }
  });

  // Delete dietary need
  app.delete("/api/couple/catering/dietary/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      await db.delete(coupleCateringDietaryNeeds)
        .where(and(eq(coupleCateringDietaryNeeds.id, id), eq(coupleCateringDietaryNeeds.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting dietary need:", error);
      res.status(500).json({ error: "Kunne ikke slette kostbehov" });
    }
  });

  // Update catering timeline
  app.put("/api/couple/catering/timeline", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const existing = await db.select().from(coupleCateringTimeline).where(eq(coupleCateringTimeline.coupleId, coupleId));
      
      if (existing.length > 0) {
        const [timeline] = await db.update(coupleCateringTimeline)
          .set({ ...req.body, updatedAt: new Date() })
          .where(eq(coupleCateringTimeline.coupleId, coupleId))
          .returning();
        res.json(timeline);
      } else {
        const [timeline] = await db.insert(coupleCateringTimeline).values({
          coupleId, ...req.body
        }).returning();
        res.json(timeline);
      }
    } catch (error) {
      console.error("Error updating timeline:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tidslinje" });
    }
  });

  // ===== WEDDING CAKE ROUTES =====

  // Get all cake data
  app.get("/api/couple/cake", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const [tastings, designs, timelineRows] = await Promise.all([
        db.select().from(coupleCakeTastings).where(eq(coupleCakeTastings.coupleId, coupleId)).orderBy(coupleCakeTastings.date),
        db.select().from(coupleCakeDesigns).where(eq(coupleCakeDesigns.coupleId, coupleId)),
        db.select().from(coupleCakeTimeline).where(eq(coupleCakeTimeline.coupleId, coupleId)),
      ]);

      const timeline = timelineRows[0] || {
        bakerySelected: false, tastingCompleted: false, designFinalized: false, depositPaid: false, deliveryConfirmed: false, budget: 0
      };

      res.json({ tastings, designs, timeline });
    } catch (error) {
      console.error("Error fetching cake data:", error);
      res.status(500).json({ error: "Kunne ikke hente kake data" });
    }
  });

  // Create cake tasting
  app.post("/api/couple/cake/tastings", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const [tasting] = await db.insert(coupleCakeTastings).values({
        coupleId, ...req.body
      }).returning();
      res.json(tasting);
    } catch (error) {
      console.error("Error creating tasting:", error);
      res.status(500).json({ error: "Kunne ikke opprette smaksprøve" });
    }
  });

  // Update cake tasting
  app.patch("/api/couple/cake/tastings/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const [tasting] = await db.update(coupleCakeTastings)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(coupleCakeTastings.id, id), eq(coupleCakeTastings.coupleId, coupleId)))
        .returning();
      res.json(tasting);
    } catch (error) {
      console.error("Error updating tasting:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere smaksprøve" });
    }
  });

  // Delete cake tasting
  app.delete("/api/couple/cake/tastings/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      await db.delete(coupleCakeTastings)
        .where(and(eq(coupleCakeTastings.id, id), eq(coupleCakeTastings.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting tasting:", error);
      res.status(500).json({ error: "Kunne ikke slette smaksprøve" });
    }
  });

  // Create cake design
  app.post("/api/couple/cake/designs", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const [design] = await db.insert(coupleCakeDesigns).values({
        coupleId, ...req.body
      }).returning();
      res.json(design);
    } catch (error) {
      console.error("Error creating design:", error);
      res.status(500).json({ error: "Kunne ikke opprette design" });
    }
  });

  // Update cake design
  app.patch("/api/couple/cake/designs/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const [design] = await db.update(coupleCakeDesigns)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(coupleCakeDesigns.id, id), eq(coupleCakeDesigns.coupleId, coupleId)))
        .returning();
      res.json(design);
    } catch (error) {
      console.error("Error updating design:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere design" });
    }
  });

  // Delete cake design
  app.delete("/api/couple/cake/designs/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      await db.delete(coupleCakeDesigns)
        .where(and(eq(coupleCakeDesigns.id, id), eq(coupleCakeDesigns.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting design:", error);
      res.status(500).json({ error: "Kunne ikke slette design" });
    }
  });

  // Update cake timeline
  app.put("/api/couple/cake/timeline", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const existing = await db.select().from(coupleCakeTimeline).where(eq(coupleCakeTimeline.coupleId, coupleId));
      
      if (existing.length > 0) {
        const [timeline] = await db.update(coupleCakeTimeline)
          .set({ ...req.body, updatedAt: new Date() })
          .where(eq(coupleCakeTimeline.coupleId, coupleId))
          .returning();
        res.json(timeline);
      } else {
        const [timeline] = await db.insert(coupleCakeTimeline).values({
          coupleId, ...req.body
        }).returning();
        res.json(timeline);
      }
    } catch (error) {
      console.error("Error updating timeline:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tidslinje" });
    }
  });

  // ===== PHOTOGRAPHER ROUTES =====

  app.get("/api/couple/photographer", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [sessions, shots, timelineRows] = await Promise.all([
        db.select().from(couplePhotographerSessions).where(eq(couplePhotographerSessions.coupleId, coupleId)).orderBy(couplePhotographerSessions.date),
        db.select().from(couplePhotographerShots).where(eq(couplePhotographerShots.coupleId, coupleId)),
        db.select().from(couplePhotographerTimeline).where(eq(couplePhotographerTimeline.coupleId, coupleId)),
      ]);
      const timeline = timelineRows[0] || { photographerSelected: false, sessionBooked: false, contractSigned: false, depositPaid: false, budget: 0 };
      res.json({ sessions, shots, timeline });
    } catch (error) {
      console.error("Error fetching photographer data:", error);
      res.status(500).json({ error: "Kunne ikke hente fotograf data" });
    }
  });

  app.post("/api/couple/photographer/sessions", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [session] = await db.insert(couplePhotographerSessions).values({ coupleId, ...req.body }).returning();
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ error: "Kunne ikke opprette session" });
    }
  });

  app.patch("/api/couple/photographer/sessions/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [session] = await db.update(couplePhotographerSessions)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(couplePhotographerSessions.id, id), eq(couplePhotographerSessions.coupleId, coupleId)))
        .returning();
      res.json(session);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere session" });
    }
  });

  app.delete("/api/couple/photographer/sessions/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(couplePhotographerSessions)
        .where(and(eq(couplePhotographerSessions.id, id), eq(couplePhotographerSessions.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting session:", error);
      res.status(500).json({ error: "Kunne ikke slette session" });
    }
  });

  app.post("/api/couple/photographer/shots", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [shot] = await db.insert(couplePhotographerShots).values({ coupleId, ...req.body }).returning();
      res.json(shot);
    } catch (error) {
      console.error("Error creating shot:", error);
      res.status(500).json({ error: "Kunne ikke opprette bildeidé" });
    }
  });

  app.patch("/api/couple/photographer/shots/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [shot] = await db.update(couplePhotographerShots)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(couplePhotographerShots.id, id), eq(couplePhotographerShots.coupleId, coupleId)))
        .returning();
      res.json(shot);
    } catch (error) {
      console.error("Error updating shot:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere bildeidé" });
    }
  });

  app.delete("/api/couple/photographer/shots/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(couplePhotographerShots)
        .where(and(eq(couplePhotographerShots.id, id), eq(couplePhotographerShots.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting shot:", error);
      res.status(500).json({ error: "Kunne ikke slette bildeidé" });
    }
  });

  app.put("/api/couple/photographer/timeline", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const existing = await db.select().from(couplePhotographerTimeline).where(eq(couplePhotographerTimeline.coupleId, coupleId));
      if (existing.length > 0) {
        const [timeline] = await db.update(couplePhotographerTimeline)
          .set({ ...req.body, updatedAt: new Date() })
          .where(eq(couplePhotographerTimeline.coupleId, coupleId))
          .returning();
        res.json(timeline);
      } else {
        const [timeline] = await db.insert(couplePhotographerTimeline).values({ coupleId, ...req.body }).returning();
        res.json(timeline);
      }
    } catch (error) {
      console.error("Error updating timeline:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tidslinje" });
    }
  });

  // ===== VIDEOGRAPHER ROUTES =====

  app.get("/api/couple/videographer", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [sessions, deliverables, timelineRows] = await Promise.all([
        db.select().from(coupleVideographerSessions).where(eq(coupleVideographerSessions.coupleId, coupleId)).orderBy(coupleVideographerSessions.date),
        db.select().from(coupleVideographerDeliverables).where(eq(coupleVideographerDeliverables.coupleId, coupleId)),
        db.select().from(coupleVideographerTimeline).where(eq(coupleVideographerTimeline.coupleId, coupleId)),
      ]);
      const timeline = timelineRows[0] || { videographerSelected: false, sessionBooked: false, contractSigned: false, depositPaid: false, budget: 0 };
      res.json({ sessions, deliverables, timeline });
    } catch (error) {
      console.error("Error fetching videographer data:", error);
      res.status(500).json({ error: "Kunne ikke hente videograf data" });
    }
  });

  app.post("/api/couple/videographer/sessions", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [session] = await db.insert(coupleVideographerSessions).values({ coupleId, ...req.body }).returning();
      res.json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ error: "Kunne ikke opprette session" });
    }
  });

  app.patch("/api/couple/videographer/sessions/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [session] = await db.update(coupleVideographerSessions)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(coupleVideographerSessions.id, id), eq(coupleVideographerSessions.coupleId, coupleId)))
        .returning();
      res.json(session);
    } catch (error) {
      console.error("Error updating session:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere session" });
    }
  });

  app.delete("/api/couple/videographer/sessions/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coupleVideographerSessions)
        .where(and(eq(coupleVideographerSessions.id, id), eq(coupleVideographerSessions.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting session:", error);
      res.status(500).json({ error: "Kunne ikke slette session" });
    }
  });

  app.post("/api/couple/videographer/deliverables", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [deliverable] = await db.insert(coupleVideographerDeliverables).values({ coupleId, ...req.body }).returning();
      res.json(deliverable);
    } catch (error) {
      console.error("Error creating deliverable:", error);
      res.status(500).json({ error: "Kunne ikke opprette leveranse" });
    }
  });

  app.patch("/api/couple/videographer/deliverables/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [deliverable] = await db.update(coupleVideographerDeliverables)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(coupleVideographerDeliverables.id, id), eq(coupleVideographerDeliverables.coupleId, coupleId)))
        .returning();
      res.json(deliverable);
    } catch (error) {
      console.error("Error updating deliverable:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere leveranse" });
    }
  });

  app.delete("/api/couple/videographer/deliverables/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coupleVideographerDeliverables)
        .where(and(eq(coupleVideographerDeliverables.id, id), eq(coupleVideographerDeliverables.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting deliverable:", error);
      res.status(500).json({ error: "Kunne ikke slette leveranse" });
    }
  });

  app.put("/api/couple/videographer/timeline", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const existing = await db.select().from(coupleVideographerTimeline).where(eq(coupleVideographerTimeline.coupleId, coupleId));
      if (existing.length > 0) {
        const [timeline] = await db.update(coupleVideographerTimeline)
          .set({ ...req.body, updatedAt: new Date() })
          .where(eq(coupleVideographerTimeline.coupleId, coupleId))
          .returning();
        res.json(timeline);
      } else {
        const [timeline] = await db.insert(coupleVideographerTimeline).values({ coupleId, ...req.body }).returning();
        res.json(timeline);
      }
    } catch (error) {
      console.error("Error updating timeline:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tidslinje" });
    }
  });

  // ===== MUSIC/DJ ROUTES =====

  app.get("/api/couple/music", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [performances, setlists, timelineRows] = await Promise.all([
        db.select().from(coupleMusicPerformances).where(eq(coupleMusicPerformances.coupleId, coupleId)).orderBy(coupleMusicPerformances.date),
        db.select().from(coupleMusicSetlists).where(eq(coupleMusicSetlists.coupleId, coupleId)),
        db.select().from(coupleMusicTimeline).where(eq(coupleMusicTimeline.coupleId, coupleId)),
      ]);
      const timeline = timelineRows[0] || { musicianSelected: false, setlistDiscussed: false, contractSigned: false, depositPaid: false, budget: 0 };
      res.json({ performances, setlists, timeline });
    } catch (error) {
      console.error("Error fetching music data:", error);
      res.status(500).json({ error: "Kunne ikke hente musikk data" });
    }
  });

  app.post("/api/couple/music/performances", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [performance] = await db.insert(coupleMusicPerformances).values({ coupleId, ...req.body }).returning();
      res.json(performance);
    } catch (error) {
      console.error("Error creating performance:", error);
      res.status(500).json({ error: "Kunne ikke opprette opptreden" });
    }
  });

  app.patch("/api/couple/music/performances/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [performance] = await db.update(coupleMusicPerformances)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(coupleMusicPerformances.id, id), eq(coupleMusicPerformances.coupleId, coupleId)))
        .returning();
      res.json(performance);
    } catch (error) {
      console.error("Error updating performance:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere opptreden" });
    }
  });

  app.delete("/api/couple/music/performances/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coupleMusicPerformances)
        .where(and(eq(coupleMusicPerformances.id, id), eq(coupleMusicPerformances.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting performance:", error);
      res.status(500).json({ error: "Kunne ikke slette opptreden" });
    }
  });

  app.post("/api/couple/music/setlists", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [setlist] = await db.insert(coupleMusicSetlists).values({ coupleId, ...req.body }).returning();
      res.json(setlist);
    } catch (error) {
      console.error("Error creating setlist:", error);
      res.status(500).json({ error: "Kunne ikke opprette spilleliste" });
    }
  });

  app.patch("/api/couple/music/setlists/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      const [setlist] = await db.update(coupleMusicSetlists)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(coupleMusicSetlists.id, id), eq(coupleMusicSetlists.coupleId, coupleId)))
        .returning();
      res.json(setlist);
    } catch (error) {
      console.error("Error updating setlist:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere spilleliste" });
    }
  });

  app.delete("/api/couple/music/setlists/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const { id } = req.params;
      await db.delete(coupleMusicSetlists)
        .where(and(eq(coupleMusicSetlists.id, id), eq(coupleMusicSetlists.coupleId, coupleId)));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting setlist:", error);
      res.status(500).json({ error: "Kunne ikke slette spilleliste" });
    }
  });

  app.put("/api/couple/music/timeline", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const existing = await db.select().from(coupleMusicTimeline).where(eq(coupleMusicTimeline.coupleId, coupleId));
      if (existing.length > 0) {
        const [timeline] = await db.update(coupleMusicTimeline)
          .set({ ...req.body, updatedAt: new Date() })
          .where(eq(coupleMusicTimeline.coupleId, coupleId))
          .returning();
        res.json(timeline);
      } else {
        const [timeline] = await db.insert(coupleMusicTimeline).values({ coupleId, ...req.body }).returning();
        res.json(timeline);
      }
    } catch (error) {
      console.error("Error updating timeline:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tidslinje" });
    }
  });

  // ===== PLANNER ROUTES =====

  // Get all planner data (meetings, tasks, timeline)
  app.get("/api/couple/planner", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [meetings, tasks, timeline] = await Promise.all([
        db.select().from(couplePlannerMeetings).where(eq(couplePlannerMeetings.coupleId, coupleId)).orderBy(desc(couplePlannerMeetings.createdAt)),
        db.select().from(couplePlannerTasks).where(eq(couplePlannerTasks.coupleId, coupleId)).orderBy(desc(couplePlannerTasks.createdAt)),
        db.select().from(couplePlannerTimeline).where(eq(couplePlannerTimeline.coupleId, coupleId)),
      ]);
      res.json({ meetings, tasks, timeline: timeline[0] || null });
    } catch (error) {
      console.error("Error fetching planner data:", error);
      res.status(500).json({ error: "Kunne ikke hente planlegger-data" });
    }
  });

  // Create a planner meeting
  app.post("/api/couple/planner/meetings", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [meeting] = await db.insert(couplePlannerMeetings).values({ coupleId, ...req.body }).returning();
      res.json(meeting);
    } catch (error) {
      console.error("Error creating meeting:", error);
      res.status(500).json({ error: "Kunne ikke opprette møte" });
    }
  });

  // Update a planner meeting
  app.patch("/api/couple/planner/meetings/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [meeting] = await db.update(couplePlannerMeetings)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(couplePlannerMeetings.id, req.params.id), eq(couplePlannerMeetings.coupleId, coupleId)))
        .returning();
      if (!meeting) return res.status(404).json({ error: "Møte ikke funnet" });
      res.json(meeting);
    } catch (error) {
      console.error("Error updating meeting:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere møte" });
    }
  });

  // Delete a planner meeting
  app.delete("/api/couple/planner/meetings/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [deleted] = await db.delete(couplePlannerMeetings)
        .where(and(eq(couplePlannerMeetings.id, req.params.id), eq(couplePlannerMeetings.coupleId, coupleId)))
        .returning();
      if (!deleted) return res.status(404).json({ error: "Møte ikke funnet" });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting meeting:", error);
      res.status(500).json({ error: "Kunne ikke slette møte" });
    }
  });

  // Create a planner task
  app.post("/api/couple/planner/tasks", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [task] = await db.insert(couplePlannerTasks).values({ coupleId, ...req.body }).returning();
      res.json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ error: "Kunne ikke opprette oppgave" });
    }
  });

  // Update a planner task
  app.patch("/api/couple/planner/tasks/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [task] = await db.update(couplePlannerTasks)
        .set({ ...req.body, updatedAt: new Date() })
        .where(and(eq(couplePlannerTasks.id, req.params.id), eq(couplePlannerTasks.coupleId, coupleId)))
        .returning();
      if (!task) return res.status(404).json({ error: "Oppgave ikke funnet" });
      res.json(task);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere oppgave" });
    }
  });

  // Delete a planner task
  app.delete("/api/couple/planner/tasks/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const [deleted] = await db.delete(couplePlannerTasks)
        .where(and(eq(couplePlannerTasks.id, req.params.id), eq(couplePlannerTasks.coupleId, coupleId)))
        .returning();
      if (!deleted) return res.status(404).json({ error: "Oppgave ikke funnet" });
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ error: "Kunne ikke slette oppgave" });
    }
  });

  // Update planner timeline (upsert)
  app.put("/api/couple/planner/timeline", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;
    try {
      const existing = await db.select().from(couplePlannerTimeline).where(eq(couplePlannerTimeline.coupleId, coupleId));
      if (existing.length > 0) {
        const [timeline] = await db.update(couplePlannerTimeline)
          .set({ ...req.body, updatedAt: new Date() })
          .where(eq(couplePlannerTimeline.coupleId, coupleId))
          .returning();
        res.json(timeline);
      } else {
        const [timeline] = await db.insert(couplePlannerTimeline).values({ coupleId, ...req.body }).returning();
        res.json(timeline);
      }
    } catch (error) {
      console.error("Error updating planner timeline:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tidslinje" });
    }
  });

  // ===== FAQ ROUTES =====
  
  // Get FAQ items by category (public)
  app.get("/api/faq/:category", async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      
      if (category !== "couple" && category !== "vendor") {
        return res.status(400).json({ error: "Ugyldig kategori" });
      }

      const items = await db.select()
        .from(faqItems)
        .where(and(
          eq(faqItems.category, category),
          eq(faqItems.isActive, true)
        ))
        .orderBy(faqItems.sortOrder);

      res.json(items);
    } catch (error) {
      console.error("Error fetching FAQ:", error);
      res.status(500).json({ error: "Kunne ikke hente FAQ" });
    }
  });

  // Admin: Get all FAQ items by category
  app.get("/api/admin/faq/:category", async (req: Request, res: Response) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;

    try {
      const { category } = req.params;
      
      if (category !== "couple" && category !== "vendor") {
        return res.status(400).json({ error: "Ugyldig kategori" });
      }

      const items = await db.select()
        .from(faqItems)
        .where(eq(faqItems.category, category))
        .orderBy(faqItems.sortOrder);

      res.json(items);
    } catch (error) {
      console.error("Error fetching FAQ:", error);
      res.status(500).json({ error: "Kunne ikke hente FAQ" });
    }
  });

  // Admin: Create FAQ item
  app.post("/api/admin/faq", async (req: Request, res: Response) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;

    try {
      const parsed = insertFaqItemSchema.parse(req.body);
      const [item] = await db.insert(faqItems).values(parsed).returning();
      res.json(item);
    } catch (error: any) {
      console.error("Error creating FAQ:", error);
      res.status(400).json({ error: error.message || "Kunne ikke opprette FAQ" });
    }
  });

  // Admin: Update FAQ item
  app.patch("/api/admin/faq/:id", async (req: Request, res: Response) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;

    try {
      const { id } = req.params;
      const parsed = updateFaqItemSchema.parse(req.body);
      
      const [item] = await db.update(faqItems)
        .set(parsed)
        .where(eq(faqItems.id, id))
        .returning();

      if (!item) {
        return res.status(404).json({ error: "FAQ ikke funnet" });
      }

      res.json(item);
    } catch (error: any) {
      console.error("Error updating FAQ:", error);
      res.status(400).json({ error: error.message || "Kunne ikke oppdatere FAQ" });
    }
  });

  // Admin: Delete FAQ item
  app.delete("/api/admin/faq/:id", async (req: Request, res: Response) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;

    try {
      const { id } = req.params;
      
      await db.delete(faqItems).where(eq(faqItems.id, id));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      res.status(500).json({ error: "Kunne ikke slette FAQ" });
    }
  });

  // ===== APP SETTINGS ROUTES =====

  // Get app settings (public)
  app.get("/api/app-settings", async (req: Request, res: Response) => {
    try {
      const settings = await db.select().from(appSettings);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching app settings:", error);
      res.status(500).json({ error: "Kunne ikke hente innstillinger" });
    }
  });

  // Get app setting by key (public)
  app.get("/api/app-settings/:key", async (req: Request, res: Response) => {
    try {
      const { key } = req.params;
      const [setting] = await db.select()
        .from(appSettings)
        .where(eq(appSettings.key, key));

      if (!setting) {
        return res.status(404).json({ error: "Innstilling ikke funnet" });
      }

      res.json(setting);
    } catch (error) {
      console.error("Error fetching app setting:", error);
      res.status(500).json({ error: "Kunne ikke hente innstilling" });
    }
  });

  // Admin: Get all app settings
  app.get("/api/admin/app-settings", async (req: Request, res: Response) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;

    try {
      const settings = await db.select().from(appSettings);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching app settings:", error);
      res.status(500).json({ error: "Kunne ikke hente innstillinger" });
    }
  });

  // Admin: Update app setting
  app.patch("/api/admin/app-settings/:key", async (req: Request, res: Response) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;

    try {
      const { key } = req.params;
      const parsed = updateAppSettingSchema.parse(req.body);
      
      // Try to update existing
      const [existing] = await db.select()
        .from(appSettings)
        .where(eq(appSettings.key, key));

      let setting;
      if (existing) {
        [setting] = await db.update(appSettings)
          .set({ value: parsed.value, updatedAt: new Date() })
          .where(eq(appSettings.key, key))
          .returning();
      } else {
        // Create if doesn't exist
        [setting] = await db.insert(appSettings)
          .values({ key, value: parsed.value })
          .returning();
      }

      res.json(setting);
    } catch (error: any) {
      console.error("Error updating app setting:", error);
      res.status(400).json({ error: error.message || "Kunne ikke oppdatere innstilling" });
    }
  });

  // ===== WHAT'S NEW ROUTES =====

  // Get active What's New items by category (public)
  app.get("/api/whats-new/:category", async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      if (!["vendor", "couple"].includes(category)) {
        return res.status(400).json({ error: "Ugyldig kategori" });
      }

      const items = await db.select()
        .from(whatsNewItems)
        .where(and(
          eq(whatsNewItems.category, category),
          eq(whatsNewItems.isActive, true)
        ))
        .orderBy(whatsNewItems.sortOrder);

      res.json(items);
    } catch (error) {
      console.error("Error fetching what's new:", error);
      res.status(500).json({ error: "Kunne ikke hente hva som er nytt" });
    }
  });

  // Admin: Get all What's New items by category
  app.get("/api/admin/whats-new/:category", async (req: Request, res: Response) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;

    try {
      const { category } = req.params;
      if (!["vendor", "couple"].includes(category)) {
        return res.status(400).json({ error: "Ugyldig kategori" });
      }

      const items = await db.select()
        .from(whatsNewItems)
        .where(eq(whatsNewItems.category, category))
        .orderBy(whatsNewItems.sortOrder);

      res.json(items);
    } catch (error) {
      console.error("Error fetching what's new:", error);
      res.status(500).json({ error: "Kunne ikke hente hva som er nytt" });
    }
  });

  // Admin: Create What's New item
  app.post("/api/admin/whats-new", async (req: Request, res: Response) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;

    try {
      const parsed = insertWhatsNewSchema.parse(req.body);
      const [item] = await db.insert(whatsNewItems)
        .values(parsed)
        .returning();

      res.json(item);
    } catch (error: any) {
      console.error("Error creating what's new:", error);
      res.status(400).json({ error: error.message || "Kunne ikke opprette hva som er nytt" });
    }
  });

  // Admin: Update What's New item
  app.patch("/api/admin/whats-new/:id", async (req: Request, res: Response) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;

    try {
      const { id } = req.params;
      const parsed = updateWhatsNewSchema.parse(req.body);

      const [item] = await db.update(whatsNewItems)
        .set({ ...parsed, updatedAt: new Date() })
        .where(eq(whatsNewItems.id, id))
        .returning();

      if (!item) {
        return res.status(404).json({ error: "Hva som er nytt ikke funnet" });
      }

      res.json(item);
    } catch (error: any) {
      console.error("Error updating what's new:", error);
      res.status(400).json({ error: error.message || "Kunne ikke oppdatere hva som er nytt" });
    }
  });

  // Admin: Delete What's New item
  app.delete("/api/admin/whats-new/:id", async (req: Request, res: Response) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;

    try {
      const { id } = req.params;
      await db.delete(whatsNewItems).where(eq(whatsNewItems.id, id));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting what's new:", error);
      res.status(500).json({ error: "Kunne ikke slette hva som er nytt" });
    }
  });

  // ===== VIDEO GUIDES ROUTES =====

  // Get active video guides by category (public)
  app.get("/api/video-guides", async (req: Request, res: Response) => {
    try {
      const guides = await db
        .select()
        .from(videoGuides)
        .where(eq(videoGuides.isActive, true))
        .orderBy(videoGuides.sortOrder);

      res.json(guides);
    } catch (error) {
      console.error("Error fetching video guides:", error);
      res.status(500).json({ error: "Kunne ikke hente videoguider" });
    }
  });

  app.get("/api/video-guides/:category", async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const guides = await db
        .select()
        .from(videoGuides)
        .where(
          and(
            eq(videoGuides.category, category as any),
            eq(videoGuides.isActive, true)
          )
        )
        .orderBy(videoGuides.sortOrder);

      res.json(guides);
    } catch (error) {
      console.error("Error fetching video guides:", error);
      res.status(500).json({ error: "Kunne ikke hente videoguider" });
    }
  });

  // Admin: Get all video guides by category
  app.get("/api/admin/video-guides/:category", async (req: Request, res: Response) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;

    try {
      const { category } = req.params;
      const guides = await db
        .select()
        .from(videoGuides)
        .where(eq(videoGuides.category, category as any))
        .orderBy(videoGuides.sortOrder);

      res.json(guides);
    } catch (error) {
      console.error("Error fetching video guides:", error);
      res.status(500).json({ error: "Kunne ikke hente videoguider" });
    }
  });

  // Admin: Create video guide
  app.post("/api/admin/video-guides", async (req: Request, res: Response) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;

    try {
      const parsed = insertVideoGuideSchema.parse(req.body);
      const [guide] = await db
        .insert(videoGuides)
        .values(parsed)
        .returning();

      res.json(guide);
    } catch (error: any) {
      console.error("Error creating video guide:", error);
      res.status(400).json({ error: error.message || "Kunne ikke opprette videoguide" });
    }
  });

  // Admin: Update video guide
  app.patch("/api/admin/video-guides/:id", async (req: Request, res: Response) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;

    try {
      const { id } = req.params;
      const parsed = updateVideoGuideSchema.parse(req.body);

      const [guide] = await db
        .update(videoGuides)
        .set({ ...parsed, updatedAt: new Date() })
        .where(eq(videoGuides.id, id))
        .returning();

      res.json(guide);
    } catch (error: any) {
      console.error("Error updating video guide:", error);
      res.status(400).json({ error: error.message || "Kunne ikke oppdatere videoguide" });
    }
  });

  // Admin: Delete video guide
  app.delete("/api/admin/video-guides/:id", async (req: Request, res: Response) => {
    const adminKey = await checkAdminAuth(req, res);
    if (!adminKey) return;

    try {
      const { id } = req.params;
      await db.delete(videoGuides).where(eq(videoGuides.id, id));

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting video guide:", error);
      res.status(500).json({ error: "Kunne ikke slette videoguide" });
    }
  });

  const httpServer = createServer(app);

  // Attach WebSocket server for vendor-admin chat
  const wss = new WebSocketServer({ server: httpServer, path: "/ws/vendor-admin" });

  wss.on("connection", async (ws, req) => {
    try {
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      const token = url.searchParams.get("token") || "";
      const vendorId = await checkVendorToken(token);
      if (!vendorId) {
        ws.close(1008, "unauthorized");
        return;
      }
      const conversationId = await getOrCreateAdminConversationId(vendorId);
      let set = adminConvClients.get(conversationId);
      if (!set) {
        set = new Set();
        adminConvClients.set(conversationId, set);
      }
      set.add(ws);

      ws.on("close", () => {
        const current = adminConvClients.get(conversationId);
        if (current) {
          current.delete(ws);
          if (current.size === 0) adminConvClients.delete(conversationId);
        }
      });
    } catch {
      try { ws.close(); } catch {}
    }
  });

  // Attach WebSocket server for admin subscriptions to vendor-admin conversations
  const wssAdminVendorAdmin = new WebSocketServer({ server: httpServer, path: "/ws/admin/vendor-admin" });

  wssAdminVendorAdmin.on("connection", async (ws, req) => {
    try {
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      const adminKey = url.searchParams.get("adminKey") || "";
      const conversationId = url.searchParams.get("conversationId") || "";
      // Auth using admin secret
      if (!process.env.ADMIN_SECRET || `Bearer ${process.env.ADMIN_SECRET}` !== `Bearer ${adminKey}`) {
        ws.close(1008, "unauthorized");
        return;
      }
      if (!conversationId) {
        ws.close(1008, "bad-request");
        return;
      }
      // Ensure conversation exists
      const [conv] = await db.select().from(adminConversations).where(eq(adminConversations.id, conversationId));
      if (!conv) {
        ws.close(1008, "not-found");
        return;
      }
      let set = adminConvClients.get(conversationId);
      if (!set) {
        set = new Set();
        adminConvClients.set(conversationId, set);
      }
      set.add(ws);

      ws.on("close", () => {
        const current = adminConvClients.get(conversationId);
        if (current) {
          current.delete(ws);
          if (current.size === 0) adminConvClients.delete(conversationId);
        }
      });
    } catch {
      try { ws.close(); } catch {}
    }
  });

  // Admin-wide list subscription for vendor-admin conversations
  const wssAdminVendorList = new WebSocketServer({ server: httpServer, path: "/ws/admin/vendor-admin-list" });

  wssAdminVendorList.on("connection", (ws, req) => {
    try {
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      const adminKey = url.searchParams.get("adminKey") || "";
      if (!process.env.ADMIN_SECRET || `Bearer ${process.env.ADMIN_SECRET}` !== `Bearer ${adminKey}`) {
        ws.close(1008, "unauthorized");
        return;
      }
      adminListClients.add(ws);
      ws.on("close", () => {
        adminListClients.delete(ws);
      });
    } catch {
      try { ws.close(); } catch {}
    }
  });

  // Attach WebSocket server for couple-vendor conversations
  const wssCouples = new WebSocketServer({ server: httpServer, path: "/ws/couples" });

  wssCouples.on("connection", async (ws, req) => {
    try {
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      const token = url.searchParams.get("token") || "";
      const conversationId = url.searchParams.get("conversationId") || "";
      const coupleId = await checkCoupleToken(token);
      if (!coupleId || !conversationId) {
        ws.close(1008, "unauthorized");
        return;
      }
      const [conv] = await db.select().from(conversations).where(eq(conversations.id, conversationId));
      if (!conv || conv.coupleId !== coupleId) {
        ws.close(1008, "forbidden");
        return;
      }
      let set = conversationClients.get(conversationId);
      if (!set) {
        set = new Set();
        conversationClients.set(conversationId, set);
      }
      set.add(ws);

      ws.on("close", () => {
        const current = conversationClients.get(conversationId);
        if (current) {
          current.delete(ws);
          if (current.size === 0) conversationClients.delete(conversationId);
        }
      });
    } catch {
      try { ws.close(); } catch {}
    }
  });

  // Attach WebSocket server for vendor-side conversation subscriptions
  const wssVendors = new WebSocketServer({ server: httpServer, path: "/ws/vendor" });

  wssVendors.on("connection", async (ws, req) => {
    try {
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      const token = url.searchParams.get("token") || "";
      const conversationId = url.searchParams.get("conversationId") || "";
      const vendorId = await checkVendorToken(token);
      if (!vendorId || !conversationId) {
        ws.close(1008, "unauthorized");
        return;
      }
      const [conv] = await db.select().from(conversations).where(eq(conversations.id, conversationId));
      if (!conv || conv.vendorId !== vendorId) {
        ws.close(1008, "forbidden");
        return;
      }
      let set = conversationClients.get(conversationId);
      if (!set) {
        set = new Set();
        conversationClients.set(conversationId, set);
      }
      set.add(ws);

      ws.on("close", () => {
        const current = conversationClients.get(conversationId);
        if (current) {
          current.delete(ws);
          if (current.size === 0) conversationClients.delete(conversationId);
        }
      });
    } catch {
      try { ws.close(); } catch {}
    }
  });

  // Attach WebSocket server for vendor list (all conversations)
  const wssVendorList = new WebSocketServer({ server: httpServer, path: "/ws/vendor-list" });

  wssVendorList.on("connection", async (ws, req) => {
    try {
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      const token = url.searchParams.get("token") || "";
      const vendorId = await checkVendorToken(token);
      if (!vendorId) {
        ws.close(1008, "unauthorized");
        return;
      }
      let set = vendorListClients.get(vendorId);
      if (!set) {
        set = new Set();
        vendorListClients.set(vendorId, set);
      }
      set.add(ws);

      ws.on("close", () => {
        const current = vendorListClients.get(vendorId);
        if (current) {
          current.delete(ws);
          if (current.size === 0) vendorListClients.delete(vendorId);
        }
      });
    } catch {
      try { ws.close(); } catch {}
    }
  });

  // Attach WebSocket server for couple list (all conversations)
  const wssCoupleList = new WebSocketServer({ server: httpServer, path: "/ws/couples-list" });

  wssCoupleList.on("connection", async (ws, req) => {
    try {
      const url = new URL(req.url || "", `http://${req.headers.host}`);
      const token = url.searchParams.get("token") || "";
      const coupleId = await checkCoupleToken(token);
      if (!coupleId) {
        ws.close(1008, "unauthorized");
        return;
      }
      let set = coupleListClients.get(coupleId);
      if (!set) {
        set = new Set();
        coupleListClients.set(coupleId, set);
      }
      set.add(ws);

      ws.on("close", () => {
        const current = coupleListClients.get(coupleId);
        if (current) {
          current.delete(ws);
          if (current.size === 0) coupleListClients.delete(coupleId);
        }
      });
    } catch {
      try { ws.close(); } catch {}
    }
  });

  // ==============================================================
  // VENDOR ↔ CREATORHUB PROJECT BRIDGE
  // Lets vendors see CreatorHub projects, timeline, comments, shots
  // ==============================================================

  // GET /api/vendor/creatorhub-bridge — Vendor sees linked CreatorHub projects + timeline for their couples
  app.get("/api/vendor/creatorhub-bridge", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const coupleId = req.query.coupleId as string;
      if (!coupleId) return res.status(400).json({ error: "coupleId er påkrevd" });

      // Verify vendor has access to this couple
      const [conv] = await db.select({ id: conversations.id })
        .from(conversations)
        .where(and(eq(conversations.vendorId, vendorId), eq(conversations.coupleId, coupleId)));
      if (!conv) return res.status(403).json({ error: "Ingen tilgang til dette paret" });

      // Get couple email
      const [couple] = await db.select({ email: coupleProfiles.email, displayName: coupleProfiles.displayName })
        .from(coupleProfiles)
        .where(eq(coupleProfiles.id, coupleId));
      if (!couple) return res.status(404).json({ error: "Par ikke funnet" });

      // Find projects linked to this couple's email
      const projectsResult = await db.execute(sql`
        SELECT id, title, category, status, client_email, metadata, settings, created_at
        FROM legacy.projects
        WHERE LOWER(client_email) = LOWER(${couple.email})
        ORDER BY created_at DESC
      `);

      const projects: any[] = [];
      for (const proj of (projectsResult.rows || [])) {
        // Get timeline for this project
        const timelineResult = await db.execute(sql`
          SELECT id, title, wedding_date, venue, couple_name, cultural_type, status,
                 photographer_message, client_notes, client_access_enabled
          FROM wedding_timelines
          WHERE project_id = ${(proj as any).id}
          ORDER BY created_at DESC LIMIT 1
        `);
        const timeline = (timelineResult.rows || [])[0] || null;

        let events: any[] = [];
        let comments: any[] = [];
        if (timeline) {
          const eventsResult = await db.execute(sql`
            SELECT id, title, event_time, duration_minutes, description, location, status, can_client_edit
            FROM wedding_timeline_events
            WHERE timeline_id = ${(timeline as any).id}
            ORDER BY event_time ASC
          `);
          events = eventsResult.rows || [];

          const commentsResult = await db.execute(sql`
            SELECT id, author_type, author_name, message, is_private, created_at
            FROM wedding_timeline_comments
            WHERE timeline_id = ${(timeline as any).id}
            ORDER BY created_at ASC
          `);
          comments = commentsResult.rows || [];
        }

        // Get shot list from project metadata
        const metadata = (proj as any).metadata;
        const shotList = metadata?.shotList || [];

        projects.push({
          id: (proj as any).id,
          title: (proj as any).title,
          category: (proj as any).category,
          status: (proj as any).status,
          createdAt: (proj as any).created_at,
          timeline,
          events,
          comments,
          shotList,
        });
      }

      res.json({
        success: true,
        coupleId,
        coupleName: couple.displayName,
        coupleEmail: couple.email,
        projects,
        conversationId: conv.id,
      });
    } catch (error) {
      console.error("Vendor CreatorHub bridge error:", error);
      res.status(500).json({ error: "Kunne ikke hente prosjektdata" });
    }
  });

  // GET /api/vendor/timeline-comments/:timelineId — Get timeline comments
  app.get("/api/vendor/timeline-comments/:timelineId", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { timelineId } = req.params;

      const result = await db.execute(sql`
        SELECT id, author_type, author_name, message, is_private, created_at
        FROM wedding_timeline_comments
        WHERE timeline_id = ${timelineId}
        ORDER BY created_at ASC
      `);

      res.json({ success: true, comments: result.rows || [] });
    } catch (error) {
      console.error("Get timeline comments error:", error);
      res.status(500).json({ error: "Kunne ikke hente kommentarer" });
    }
  });

  // POST /api/vendor/timeline-comments/:timelineId — Add a comment to the timeline
  app.post("/api/vendor/timeline-comments/:timelineId", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { timelineId } = req.params;
      const { message, isPrivate } = req.body;

      if (!message || !message.trim()) {
        return res.status(400).json({ error: "Melding er påkrevd" });
      }

      // Verify timeline exists
      const tlCheck = await db.execute(sql`SELECT id FROM wedding_timelines WHERE id = ${timelineId}`);
      if (!(tlCheck.rows || []).length) return res.status(404).json({ error: "Tidslinje ikke funnet" });

      // Get vendor name
      const [vendor] = await db.select({ businessName: vendors.businessName })
        .from(vendors)
        .where(eq(vendors.id, vendorId));
      const vendorName = vendor?.businessName || "Leverandør";

      const id = crypto.randomUUID();
      const now = new Date().toISOString();

      await db.execute(sql`
        INSERT INTO wedding_timeline_comments (id, timeline_id, author_type, author_name, message, is_private, created_at, updated_at)
        VALUES (${id}, ${timelineId}, 'vendor', ${vendorName}, ${message.trim()}, ${isPrivate || false}, ${now}, ${now})
      `);

      res.json({
        success: true,
        comment: {
          id,
          timeline_id: timelineId,
          author_type: "vendor",
          author_name: vendorName,
          message: message.trim(),
          is_private: isPrivate || false,
          created_at: now,
        },
      });
    } catch (error) {
      console.error("Add timeline comment error:", error);
      res.status(500).json({ error: "Kunne ikke legge til kommentar" });
    }
  });

  // POST /api/vendor/timeline-events/:timelineId — Vendor adds an event to the timeline
  app.post("/api/vendor/timeline-events/:timelineId", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { timelineId } = req.params;
      const { title, eventTime, durationMinutes, description, location } = req.body;

      if (!title) return res.status(400).json({ error: "Tittel er påkrevd" });

      // Verify timeline exists
      const tlCheck = await db.execute(sql`SELECT id FROM wedding_timelines WHERE id = ${timelineId}`);
      if (!(tlCheck.rows || []).length) return res.status(404).json({ error: "Tidslinje ikke funnet" });

      const id = crypto.randomUUID();

      await db.execute(sql`
        INSERT INTO wedding_timeline_events (id, timeline_id, title, event_time, duration_minutes, description, location, status, can_client_edit)
        VALUES (${id}, ${timelineId}, ${title}, ${eventTime || null}, ${durationMinutes || 30}, ${description || ""}, ${location || ""}, 'planned', false)
      `);

      res.json({
        success: true,
        event: { id, timeline_id: timelineId, title, event_time: eventTime, duration_minutes: durationMinutes || 30, description, location, status: "planned" },
      });
    } catch (error) {
      console.error("Add timeline event error:", error);
      res.status(500).json({ error: "Kunne ikke legge til hendelse" });
    }
  });

  // ==========================================
  // Wedding Role Invitations — Join/Invite System
  // ==========================================

  // Generate a unique invite code
  function generateInviteCode(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No I/O/0/1 for clarity
    let code = "WED-";
    for (let i = 0; i < 5; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  }

  // Get all wedding role invitations for the couple
  app.get("/api/couple/wedding-invites", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const invitations = await db.select()
        .from(weddingRoleInvitations)
        .where(eq(weddingRoleInvitations.coupleId, coupleId))
        .orderBy(desc(weddingRoleInvitations.createdAt));

      res.json(invitations);
    } catch (error) {
      console.error("Error fetching wedding invitations:", error);
      res.status(500).json({ error: "Kunne ikke hente invitasjoner" });
    }
  });

  // Create a wedding role invitation (used from SharePartnerScreen or ImportantPeopleScreen)
  app.post("/api/couple/wedding-invites", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { name, email, role, importantPersonId, canViewTimeline, canCommentTimeline, canViewSchedule, canEditSchedule, canViewShotlist, canViewBudget, canViewGuestlist, canViewImportantPeople, canEditPlanning, expiresAt } = req.body;

      if (!name || name.trim().length === 0) {
        return res.status(400).json({ error: "Navn er påkrevd" });
      }

      // Generate unique access token and invite code
      const accessToken = crypto.randomBytes(32).toString("hex");
      let inviteCode = generateInviteCode();

      // Ensure invite code is unique
      let existing = await db.select({ id: weddingRoleInvitations.id }).from(weddingRoleInvitations).where(eq(weddingRoleInvitations.inviteCode, inviteCode));
      while (existing.length > 0) {
        inviteCode = generateInviteCode();
        existing = await db.select({ id: weddingRoleInvitations.id }).from(weddingRoleInvitations).where(eq(weddingRoleInvitations.inviteCode, inviteCode));
      }

      // Default permissions based on role
      const isPartner = role === "partner";
      const isKey = ["toastmaster", "coordinator", "bestman", "maidofhonor"].includes(role);

      const [invitation] = await db.insert(weddingRoleInvitations)
        .values({
          coupleId,
          importantPersonId: importantPersonId || null,
          name,
          email: email || null,
          role: role || "partner",
          accessToken,
          inviteCode,
          canViewTimeline: canViewTimeline ?? true,
          canCommentTimeline: canCommentTimeline ?? (isPartner || isKey),
          canViewSchedule: canViewSchedule ?? true,
          canEditSchedule: canEditSchedule ?? isPartner,
          canViewShotlist: canViewShotlist ?? (isPartner || isKey),
          canViewBudget: canViewBudget ?? isPartner,
          canViewGuestlist: canViewGuestlist ?? isPartner,
          canViewImportantPeople: canViewImportantPeople ?? isPartner,
          canEditPlanning: canEditPlanning ?? isPartner,
          expiresAt: expiresAt ? new Date(expiresAt) : null,
        })
        .returning();

      // If linked to an important person, update their email if provided
      if (importantPersonId && email) {
        await db.update(coupleImportantPeople)
          .set({ email, updatedAt: new Date() })
          .where(and(
            eq(coupleImportantPeople.id, importantPersonId),
            eq(coupleImportantPeople.coupleId, coupleId)
          ));
      }

      res.status(201).json(invitation);
    } catch (error) {
      console.error("Error creating wedding invitation:", error);
      res.status(500).json({ error: "Kunne ikke opprette invitasjon" });
    }
  });

  // Update a wedding role invitation (change permissions)
  app.patch("/api/couple/wedding-invites/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;
      const { name, role, canViewTimeline, canCommentTimeline, canViewSchedule, canEditSchedule, canViewShotlist, canViewBudget, canViewGuestlist, canViewImportantPeople, canEditPlanning, status } = req.body;

      const [updated] = await db.update(weddingRoleInvitations)
        .set({
          ...(name !== undefined && { name }),
          ...(role !== undefined && { role }),
          ...(canViewTimeline !== undefined && { canViewTimeline }),
          ...(canCommentTimeline !== undefined && { canCommentTimeline }),
          ...(canViewSchedule !== undefined && { canViewSchedule }),
          ...(canEditSchedule !== undefined && { canEditSchedule }),
          ...(canViewShotlist !== undefined && { canViewShotlist }),
          ...(canViewBudget !== undefined && { canViewBudget }),
          ...(canViewGuestlist !== undefined && { canViewGuestlist }),
          ...(canViewImportantPeople !== undefined && { canViewImportantPeople }),
          ...(canEditPlanning !== undefined && { canEditPlanning }),
          ...(status !== undefined && { status }),
          updatedAt: new Date(),
        })
        .where(and(
          eq(weddingRoleInvitations.id, id),
          eq(weddingRoleInvitations.coupleId, coupleId)
        ))
        .returning();

      if (!updated) {
        return res.status(404).json({ error: "Invitasjon ikke funnet" });
      }

      res.json(updated);
    } catch (error) {
      console.error("Error updating wedding invitation:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere invitasjon" });
    }
  });

  // Delete (revoke) a wedding role invitation
  app.delete("/api/couple/wedding-invites/:id", async (req: Request, res: Response) => {
    const coupleId = await checkCoupleAuth(req, res);
    if (!coupleId) return;

    try {
      const { id } = req.params;

      await db.delete(weddingRoleInvitations)
        .where(and(
          eq(weddingRoleInvitations.id, id),
          eq(weddingRoleInvitations.coupleId, coupleId)
        ));

      res.json({ message: "Invitasjon slettet" });
    } catch (error) {
      console.error("Error deleting wedding invitation:", error);
      res.status(500).json({ error: "Kunne ikke slette invitasjon" });
    }
  });

  // ==========================================
  // Partner/Join — Public endpoints (no auth required)
  // ==========================================

  // Validate invite code and get basic info (for JoinWeddingScreen)
  app.post("/api/partner/validate-code", async (req: Request, res: Response) => {
    try {
      const { code } = req.body;
      if (!code) return res.status(400).json({ error: "Invitasjonskode er påkrevd" });

      const normalizedCode = code.trim().toUpperCase();

      const [invitation] = await db.select({
        id: weddingRoleInvitations.id,
        role: weddingRoleInvitations.role,
        name: weddingRoleInvitations.name,
        status: weddingRoleInvitations.status,
        expiresAt: weddingRoleInvitations.expiresAt,
        coupleId: weddingRoleInvitations.coupleId,
      })
        .from(weddingRoleInvitations)
        .where(eq(weddingRoleInvitations.inviteCode, normalizedCode));

      if (!invitation) {
        return res.status(404).json({ error: "Ugyldig invitasjonskode" });
      }

      if (invitation.status === "revoked") {
        return res.status(403).json({ error: "Denne invitasjonen er trukket tilbake" });
      }

      if (invitation.status === "accepted") {
        return res.status(409).json({ error: "Denne invitasjonen er allerede brukt" });
      }

      if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
        await db.update(weddingRoleInvitations)
          .set({ status: "expired" })
          .where(eq(weddingRoleInvitations.id, invitation.id));
        return res.status(403).json({ error: "Invitasjonen har utløpt" });
      }

      // Get couple info
      const [couple] = await db.select({
        displayName: coupleProfiles.displayName,
        weddingDate: coupleProfiles.weddingDate,
      }).from(coupleProfiles).where(eq(coupleProfiles.id, invitation.coupleId));

      res.json({
        valid: true,
        invitation: {
          id: invitation.id,
          role: invitation.role,
          name: invitation.name,
        },
        couple: couple || null,
      });
    } catch (error) {
      console.error("Error validating invite code:", error);
      res.status(500).json({ error: "Kunne ikke validere kode" });
    }
  });

  // Join a wedding — redeem invite code
  app.post("/api/partner/join", async (req: Request, res: Response) => {
    try {
      const { code, name, email, role } = req.body;
      if (!code) return res.status(400).json({ error: "Invitasjonskode er påkrevd" });
      if (!name) return res.status(400).json({ error: "Navn er påkrevd" });
      if (!email) return res.status(400).json({ error: "E-post er påkrevd" });

      const normalizedCode = code.trim().toUpperCase();

      const [invitation] = await db.select()
        .from(weddingRoleInvitations)
        .where(and(
          eq(weddingRoleInvitations.inviteCode, normalizedCode),
          eq(weddingRoleInvitations.status, "pending")
        ));

      if (!invitation) {
        return res.status(404).json({ error: "Ugyldig eller allerede brukt invitasjonskode" });
      }

      // Check expiry
      if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
        await db.update(weddingRoleInvitations)
          .set({ status: "expired" })
          .where(eq(weddingRoleInvitations.id, invitation.id));
        return res.status(403).json({ error: "Invitasjonen har utløpt" });
      }

      // Mark invitation as accepted
      const [updated] = await db.update(weddingRoleInvitations)
        .set({
          status: "accepted",
          email,
          name,
          role: role || invitation.role,
          joinedAt: new Date(),
          lastAccessedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(weddingRoleInvitations.id, invitation.id))
        .returning();

      // If linked to an important person, update their info
      if (invitation.importantPersonId) {
        await db.update(coupleImportantPeople)
          .set({
            name,
            email,
            updatedAt: new Date(),
          })
          .where(eq(coupleImportantPeople.id, invitation.importantPersonId));
      }

      // Return the access token for future access
      res.json({
        success: true,
        accessToken: updated.accessToken,
        invitation: {
          id: updated.id,
          role: updated.role,
          name: updated.name,
          canViewTimeline: updated.canViewTimeline,
          canCommentTimeline: updated.canCommentTimeline,
          canViewSchedule: updated.canViewSchedule,
          canEditSchedule: updated.canEditSchedule,
          canViewShotlist: updated.canViewShotlist,
          canViewBudget: updated.canViewBudget,
          canViewGuestlist: updated.canViewGuestlist,
          canViewImportantPeople: updated.canViewImportantPeople,
          canEditPlanning: updated.canEditPlanning,
        },
      });
    } catch (error) {
      console.error("Error joining wedding:", error);
      res.status(500).json({ error: "Kunne ikke delta i bryllupet" });
    }
  });

  // Access wedding data by token (for invited persons)
  app.get("/api/partner/access/:token", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;

      const [invitation] = await db.select()
        .from(weddingRoleInvitations)
        .where(and(
          eq(weddingRoleInvitations.accessToken, token),
          eq(weddingRoleInvitations.status, "accepted")
        ));

      if (!invitation) {
        return res.status(404).json({ error: "Ugyldig eller utløpt tilgang" });
      }

      // Check expiry
      if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
        await db.update(weddingRoleInvitations)
          .set({ status: "expired" })
          .where(eq(weddingRoleInvitations.id, invitation.id));
        return res.status(403).json({ error: "Tilgangen har utløpt" });
      }

      // Update last accessed
      await db.update(weddingRoleInvitations)
        .set({ lastAccessedAt: new Date() })
        .where(eq(weddingRoleInvitations.id, invitation.id));

      // Get couple info
      const [couple] = await db.select({
        displayName: coupleProfiles.displayName,
        weddingDate: coupleProfiles.weddingDate,
      }).from(coupleProfiles).where(eq(coupleProfiles.id, invitation.coupleId));

      // Build response based on permissions
      const responseData: any = {
        invitation: {
          id: invitation.id,
          name: invitation.name,
          role: invitation.role,
          canViewTimeline: invitation.canViewTimeline,
          canCommentTimeline: invitation.canCommentTimeline,
          canViewSchedule: invitation.canViewSchedule,
          canEditSchedule: invitation.canEditSchedule,
          canViewShotlist: invitation.canViewShotlist,
          canViewBudget: invitation.canViewBudget,
          canViewGuestlist: invitation.canViewGuestlist,
          canViewImportantPeople: invitation.canViewImportantPeople,
          canEditPlanning: invitation.canEditPlanning,
        },
        couple,
      };

      // Get timeline if allowed
      if (invitation.canViewTimeline) {
        // Find timeline through vendor conversations -> projects -> timelines
        const timelines = await db.execute(sql`
          SELECT DISTINCT wt.id, wt.title, wt.wedding_date, wt.status, wt.couple_name, wt.created_at
          FROM wedding_timelines wt
          JOIN creatorhub_projects cp ON wt.project_id = cp.id
          JOIN conversations c ON c.vendor_id = cp.owner_id
          WHERE c.couple_id = ${invitation.coupleId}
          ORDER BY wt.created_at DESC LIMIT 1
        `);
        if ((timelines.rows || []).length > 0) {
          const timeline = (timelines.rows as any[])[0];
          responseData.timeline = timeline;

          // Get timeline events
          const events = await db.execute(sql`
            SELECT id, title, event_time, duration_minutes, description, location, status
            FROM wedding_timeline_events
            WHERE timeline_id = ${timeline.id}
            ORDER BY event_time ASC NULLS LAST
          `);
          responseData.timelineEvents = events.rows || [];

          // Get timeline comments if can comment
          if (invitation.canCommentTimeline) {
            const comments = await db.execute(sql`
              SELECT id, content, author_name, author_role, is_private, created_at
              FROM wedding_timeline_comments
              WHERE timeline_id = ${timeline.id} AND is_private = false
              ORDER BY created_at DESC LIMIT 50
            `);
            responseData.timelineComments = comments.rows || [];
          }
        }
      }

      // Get schedule if allowed
      if (invitation.canViewSchedule) {
        const scheduleList = await db.select()
          .from(scheduleEvents)
          .where(eq(scheduleEvents.coupleId, invitation.coupleId))
          .orderBy(scheduleEvents.time);
        responseData.schedule = scheduleList;
      }

      // Get shotlist if allowed
      if (invitation.canViewShotlist) {
        const shots = await db.execute(sql`
          SELECT id, title, description, category, completed
          FROM couple_photo_shots
          WHERE couple_id = ${invitation.coupleId}
          ORDER BY sort_order ASC
        `);
        responseData.shotlist = shots.rows || [];
      }

      // Get important people if allowed
      if (invitation.canViewImportantPeople) {
        const people = await db.select()
          .from(coupleImportantPeople)
          .where(eq(coupleImportantPeople.coupleId, invitation.coupleId))
          .orderBy(coupleImportantPeople.sortOrder);
        responseData.importantPeople = people;
      }

      res.json(responseData);
    } catch (error) {
      console.error("Error accessing wedding data:", error);
      res.status(500).json({ error: "Kunne ikke hente bryllupsdata" });
    }
  });

  // ==========================================
  // Vendor — View important people for a couple
  // ==========================================

  app.get("/api/vendor/couple/:coupleId/important-people", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

    try {
      const { coupleId } = req.params;

      // Verify vendor has a relationship with this couple (active contract or conversation)
      const contractCheck = await db.execute(sql`
        SELECT id FROM couple_vendor_contracts
        WHERE vendor_id = ${vendorId} AND couple_id = ${coupleId} AND status = 'active'
        LIMIT 1
      `);
      const convCheck = await db.execute(sql`
        SELECT id FROM conversations
        WHERE vendor_id = ${vendorId} AND couple_id = ${coupleId}
        LIMIT 1
      `);

      if (!(contractCheck.rows || []).length && !(convCheck.rows || []).length) {
        return res.status(403).json({ error: "Ingen tilgang til dette bryllupet" });
      }

      const people = await db.select({
        id: coupleImportantPeople.id,
        name: coupleImportantPeople.name,
        role: coupleImportantPeople.role,
        phone: coupleImportantPeople.phone,
        email: coupleImportantPeople.email,
        notes: coupleImportantPeople.notes,
      })
        .from(coupleImportantPeople)
        .where(eq(coupleImportantPeople.coupleId, coupleId))
        .orderBy(coupleImportantPeople.sortOrder);

      res.json(people);
    } catch (error) {
      console.error("Error fetching important people for vendor:", error);
      res.status(500).json({ error: "Kunne ikke hente viktige personer" });
    }
  });

  // Register subscription routes
  registerSubscriptionRoutes(app);

  // Register CreatorHub API routes
  registerCreatorhubRoutes(app);

  return httpServer;
}
