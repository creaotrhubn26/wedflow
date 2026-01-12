import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { db } from "./db";
import { vendors, vendorCategories, vendorRegistrationSchema, deliveries, deliveryItems, createDeliverySchema, inspirationCategories, inspirations, inspirationMedia, createInspirationSchema, vendorFeatures, vendorInspirationCategories, inspirationInquiries, createInquirySchema, coupleProfiles, coupleSessions, conversations, messages, coupleLoginSchema, sendMessageSchema, reminders, createReminderSchema, vendorProducts, createVendorProductSchema, vendorOffers, vendorOfferItems, createOfferSchema, appSettings, speeches, createSpeechSchema, messageReminders } from "@shared/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import crypto from "crypto";

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
  return crypto.createHash("sha256").update(password).digest("hex");
}

const DEFAULT_CATEGORIES = [
  { name: "Fotograf", icon: "camera", description: "Bryllupsfotografer" },
  { name: "Videograf", icon: "video", description: "Bryllupsvideofilmer" },
  { name: "Blomster", icon: "flower", description: "Blomsterdekoratører" },
  { name: "Catering", icon: "utensils", description: "Mat og drikke" },
  { name: "Musikk", icon: "music", description: "Band, DJ og musikere" },
  { name: "Venue", icon: "home", description: "Bryllupslokaler" },
  { name: "Kake", icon: "cake", description: "Bryllupskaker" },
  { name: "Planlegger", icon: "clipboard", description: "Bryllupsplanleggere" },
  { name: "Hår & Makeup", icon: "scissors", description: "Styling og sminke" },
  { name: "Transport", icon: "car", description: "Bryllupstransport" },
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

  app.get("/api/vendor-categories", async (_req: Request, res: Response) => {
    try {
      const categories = await db.select().from(vendorCategories);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ error: "Kunne ikke hente kategorier" });
    }
  });

  app.post("/api/vendors/register", async (req: Request, res: Response) => {
    try {
      const validation = vendorRegistrationSchema.safeParse(req.body);
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
        categoryId: profileData.categoryId,
        description: profileData.description || null,
        location: profileData.location || null,
        phone: profileData.phone || null,
        website: profileData.website || null,
        priceRange: profileData.priceRange || null,
      }).returning();

      const { password: _, ...vendorWithoutPassword } = newVendor;
      res.status(201).json({ 
        message: "Registrering vellykket! Din søknad er under behandling.",
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

      if (vendor.password !== hashPassword(password)) {
        return res.status(401).json({ error: "Ugyldig e-post eller passord" });
      }

      const sessionToken = generateSessionToken();
      const now = new Date();
      VENDOR_SESSIONS.set(sessionToken, {
        vendorId: vendor.id,
        createdAt: now,
        expiresAt: new Date(now.getTime() + SESSION_DURATION_MS),
      });

      const { password: _, ...vendorWithoutPassword } = vendor;
      res.json({ vendor: vendorWithoutPassword, sessionToken });
    } catch (error) {
      console.error("Error logging in vendor:", error);
      res.status(500).json({ error: "Kunne ikke logge inn" });
    }
  });

  app.post("/api/vendors/logout", async (req: Request, res: Response) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.replace("Bearer ", "");
      VENDOR_SESSIONS.delete(token);
    }
    res.json({ message: "Logget ut" });
  });

  app.get("/api/vendors", async (req: Request, res: Response) => {
    try {
      const categoryId = req.query.categoryId as string | undefined;
      
      let query = db.select({
        id: vendors.id,
        businessName: vendors.businessName,
        categoryId: vendors.categoryId,
        description: vendors.description,
        location: vendors.location,
        phone: vendors.phone,
        website: vendors.website,
        priceRange: vendors.priceRange,
        imageUrl: vendors.imageUrl,
      }).from(vendors).where(eq(vendors.status, "approved"));

      const approvedVendors = await query;
      
      const filtered = categoryId 
        ? approvedVendors.filter(v => v.categoryId === categoryId)
        : approvedVendors;

      res.json(filtered);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ error: "Kunne ikke hente leverandører" });
    }
  });

  const checkAdminAuth = (req: Request, res: Response): boolean => {
    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret) {
      res.status(503).json({ error: "Admin-funksjonalitet er ikke konfigurert" });
      return false;
    }
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${adminSecret}`) {
      res.status(401).json({ error: "Ikke autorisert" });
      return false;
    }
    return true;
  };

  app.get("/api/admin/vendors", async (req: Request, res: Response) => {
    if (!checkAdminAuth(req, res)) return;
    
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
    if (!checkAdminAuth(req, res)) return;
    
    try {
      const { id } = req.params;
      
      await db.update(vendors)
        .set({ status: "approved", updatedAt: new Date() })
        .where(eq(vendors.id, id));

      res.json({ message: "Leverandør godkjent" });
    } catch (error) {
      console.error("Error approving vendor:", error);
      res.status(500).json({ error: "Kunne ikke godkjenne leverandør" });
    }
  });

  app.post("/api/admin/vendors/:id/reject", async (req: Request, res: Response) => {
    if (!checkAdminAuth(req, res)) return;
    
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
    const session = VENDOR_SESSIONS.get(token);
    
    if (!session) {
      res.status(401).json({ error: "Økt utløpt. Vennligst logg inn på nytt." });
      return null;
    }

    if (session.expiresAt < new Date()) {
      VENDOR_SESSIONS.delete(token);
      res.status(401).json({ error: "Økt utløpt. Vennligst logg inn på nytt." });
      return null;
    }

    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, session.vendorId));
    if (!vendor || vendor.status !== "approved") {
      res.status(401).json({ error: "Ikke autorisert" });
      return null;
    }
    return session.vendorId;
  };

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

      const [newDelivery] = await db.insert(deliveries).values({
        vendorId,
        coupleName: deliveryData.coupleName,
        coupleEmail: deliveryData.coupleEmail || null,
        title: deliveryData.title,
        description: deliveryData.description || null,
        weddingDate: deliveryData.weddingDate || null,
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

      res.json({ 
        delivery: { ...delivery, items },
        vendor 
      });
    } catch (error) {
      console.error("Error fetching delivery:", error);
      res.status(500).json({ error: "Kunne ikke hente leveranse" });
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

  app.get("/api/admin/inspirations", async (req: Request, res: Response) => {
    if (!checkAdminAuth(req, res)) return;

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
    if (!checkAdminAuth(req, res)) return;

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
    if (!checkAdminAuth(req, res)) return;

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
    if (!checkAdminAuth(req, res)) return;

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
    if (!checkAdminAuth(req, res)) return;

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
    if (!checkAdminAuth(req, res)) return;

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
    if (!checkAdminAuth(req, res)) return;

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

  // Couple login/register (simple email-based)
  app.post("/api/couples/login", async (req: Request, res: Response) => {
    try {
      const validation = coupleLoginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: validation.error.errors[0].message });
      }

      const { email, displayName } = validation.data;

      // Find or create couple profile
      let [couple] = await db.select().from(coupleProfiles).where(eq(coupleProfiles.email, email));

      if (!couple) {
        const [newCouple] = await db.insert(coupleProfiles)
          .values({ email, displayName })
          .returning();
        couple = newCouple;
      } else {
        // Update display name if changed
        if (couple.displayName !== displayName) {
          await db.update(coupleProfiles)
            .set({ displayName, updatedAt: new Date() })
            .where(eq(coupleProfiles.id, couple.id));
          couple.displayName = displayName;
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

      res.json({ couple, sessionToken: token });
    } catch (error) {
      console.error("Couple login error:", error);
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
      res.json(couple);
    } catch (error) {
      console.error("Error fetching couple profile:", error);
      res.status(500).json({ error: "Kunne ikke hente profil" });
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

      const { conversationId, vendorId, inspirationId, body } = validation.data;

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
          body,
        })
        .returning();

      // Update conversation
      await db.update(conversations)
        .set({
          lastMessageAt: new Date(),
          vendorUnreadCount: (conv.vendorUnreadCount || 0) + 1,
        })
        .where(eq(conversations.id, convId));

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

    try {
      const { conversationId, body } = req.body;

      if (!conversationId || !body) {
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
          body,
        })
        .returning();

      // Update conversation
      await db.update(conversations)
        .set({
          lastMessageAt: new Date(),
          coupleUnreadCount: (conv.coupleUnreadCount || 0) + 1,
        })
        .where(eq(conversations.id, conversationId));

      res.status(201).json(msg);
    } catch (error) {
      console.error("Error sending vendor message:", error);
      res.status(500).json({ error: "Kunne ikke sende melding" });
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

  // GDPR: Delete entire conversation (vendor)
  app.delete("/api/vendor/conversations/:id", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

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
      res.status(201).json(newSpeech);
    } catch (error) {
      console.error("Error creating speech:", error);
      res.status(500).json({ error: "Kunne ikke opprette tale" });
    }
  });

  app.patch("/api/speeches/:id", async (req: Request, res: Response) => {
    try {
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

      res.json(updated);
    } catch (error) {
      console.error("Error updating speech:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere tale" });
    }
  });

  app.delete("/api/speeches/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const [deleted] = await db.delete(speeches)
        .where(eq(speeches.id, id))
        .returning();

      if (!deleted) {
        return res.status(404).json({ error: "Tale ikke funnet" });
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

  // Cancel a scheduled reminder
  app.delete("/api/vendor/message-reminders/:id", async (req: Request, res: Response) => {
    const vendorId = await checkVendorAuth(req, res);
    if (!vendorId) return;

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
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "Ikke autentisert" });
      }

      const session = VENDOR_SESSIONS.get(token);
      if (!session || session.expiresAt < new Date()) {
        return res.status(401).json({ error: "Ugyldig økt" });
      }

      const products = await db.select()
        .from(vendorProducts)
        .where(and(
          eq(vendorProducts.vendorId, session.vendorId),
          eq(vendorProducts.isArchived, false)
        ))
        .orderBy(vendorProducts.sortOrder);

      res.json(products);
    } catch (error) {
      console.error("Error fetching vendor products:", error);
      res.status(500).json({ error: "Kunne ikke hente produkter" });
    }
  });

  app.post("/api/vendor/products", async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "Ikke autentisert" });
      }

      const session = VENDOR_SESSIONS.get(token);
      if (!session || session.expiresAt < new Date()) {
        return res.status(401).json({ error: "Ugyldig økt" });
      }

      const validatedData = createVendorProductSchema.parse(req.body);
      
      const [product] = await db.insert(vendorProducts)
        .values({
          vendorId: session.vendorId,
          title: validatedData.title,
          description: validatedData.description,
          unitPrice: validatedData.unitPrice,
          unitType: validatedData.unitType,
          leadTimeDays: validatedData.leadTimeDays,
          minQuantity: validatedData.minQuantity,
          categoryTag: validatedData.categoryTag,
          imageUrl: validatedData.imageUrl || null,
          sortOrder: validatedData.sortOrder,
        })
        .returning();

      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating vendor product:", error);
      res.status(500).json({ error: "Kunne ikke opprette produkt" });
    }
  });

  app.patch("/api/vendor/products/:id", async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "Ikke autentisert" });
      }

      const session = VENDOR_SESSIONS.get(token);
      if (!session || session.expiresAt < new Date()) {
        return res.status(401).json({ error: "Ugyldig økt" });
      }

      const { id } = req.params;
      const updates = req.body;

      // Verify ownership
      const [existing] = await db.select()
        .from(vendorProducts)
        .where(and(
          eq(vendorProducts.id, id),
          eq(vendorProducts.vendorId, session.vendorId)
        ));

      if (!existing) {
        return res.status(404).json({ error: "Produkt ikke funnet" });
      }

      const [updated] = await db.update(vendorProducts)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(vendorProducts.id, id))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating vendor product:", error);
      res.status(500).json({ error: "Kunne ikke oppdatere produkt" });
    }
  });

  app.delete("/api/vendor/products/:id", async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "Ikke autentisert" });
      }

      const session = VENDOR_SESSIONS.get(token);
      if (!session || session.expiresAt < new Date()) {
        return res.status(401).json({ error: "Ugyldig økt" });
      }

      const { id } = req.params;

      // Soft delete - archive the product
      const [archived] = await db.update(vendorProducts)
        .set({ isArchived: true, updatedAt: new Date() })
        .where(and(
          eq(vendorProducts.id, id),
          eq(vendorProducts.vendorId, session.vendorId)
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

  // Vendor Offers endpoints
  app.get("/api/vendor/offers", async (req: Request, res: Response) => {
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "Ikke autentisert" });
      }

      const session = VENDOR_SESSIONS.get(token);
      if (!session || session.expiresAt < new Date()) {
        return res.status(401).json({ error: "Ugyldig økt" });
      }

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
        .where(eq(vendorOffers.vendorId, session.vendorId))
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
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "Ikke autentisert" });
      }

      const session = VENDOR_SESSIONS.get(token);
      if (!session || session.expiresAt < new Date()) {
        return res.status(401).json({ error: "Ugyldig økt" });
      }

      const validatedData = createOfferSchema.parse(req.body);
      
      // Calculate total
      const totalAmount = validatedData.items.reduce(
        (sum, item) => sum + (item.quantity * item.unitPrice), 
        0
      );

      const [offer] = await db.insert(vendorOffers)
        .values({
          vendorId: session.vendorId,
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
          senderId: session.vendorId,
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
    try {
      const token = req.headers.authorization?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ error: "Ikke autentisert" });
      }

      const session = VENDOR_SESSIONS.get(token);
      if (!session || session.expiresAt < new Date()) {
        return res.status(401).json({ error: "Ugyldig økt" });
      }

      const { id } = req.params;
      const updates = req.body;

      // Verify ownership
      const [existing] = await db.select()
        .from(vendorOffers)
        .where(and(
          eq(vendorOffers.id, id),
          eq(vendorOffers.vendorId, session.vendorId)
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
      } else {
        updates.declinedAt = new Date();
      }

      const [updated] = await db.update(vendorOffers)
        .set(updates)
        .where(eq(vendorOffers.id, id))
        .returning();

      // Notify vendor via message if there's a conversation
      if (offer.conversationId) {
        const statusText = response === "accept" ? "akseptert" : "avslått";
        await db.insert(messages).values({
          conversationId: offer.conversationId,
          senderType: "couple",
          senderId: coupleId,
          body: `✅ Tilbud "${offer.title}" er ${statusText}`,
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
          const items = await db.select()
            .from(vendorOfferItems)
            .where(eq(vendorOfferItems.offerId, offer.id))
            .orderBy(vendorOfferItems.sortOrder);
          return { ...offer, vendor, items };
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
  app.get("/api/admin/settings", async (req: Request, res: Response) => {
    if (!checkAdminAuth(req, res)) return;
    
    try {
      const settings = await db.select().from(appSettings);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ error: "Kunne ikke hente innstillinger" });
    }
  });

  app.put("/api/admin/settings", async (req: Request, res: Response) => {
    if (!checkAdminAuth(req, res)) return;
    
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
    if (!checkAdminAuth(req, res)) return;
    
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

  // Admin Categories Management
  app.post("/api/admin/inspiration-categories", async (req: Request, res: Response) => {
    if (!checkAdminAuth(req, res)) return;
    
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
    if (!checkAdminAuth(req, res)) return;
    
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
    if (!checkAdminAuth(req, res)) return;
    
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
    if (!checkAdminAuth(req, res)) return;
    
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
    if (!checkAdminAuth(req, res)) return;
    
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
    if (!checkAdminAuth(req, res)) return;
    
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
    if (!checkAdminAuth(req, res)) return;
    
    try {
      const couples = await db.select().from(coupleProfiles).orderBy(desc(coupleProfiles.createdAt));
      res.json(couples);
    } catch (error) {
      console.error("Error fetching couples:", error);
      res.status(500).json({ error: "Kunne ikke hente par" });
    }
  });

  app.delete("/api/admin/couples/:id", async (req: Request, res: Response) => {
    if (!checkAdminAuth(req, res)) return;
    
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
    if (!checkAdminAuth(req, res)) return;
    
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
    if (!checkAdminAuth(req, res)) return;
    
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

  const httpServer = createServer(app);

  return httpServer;
}
