import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { db } from "./db";
import { vendors, vendorCategories, vendorRegistrationSchema } from "@shared/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

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

  seedCategories().catch(console.error);

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

      const { password: _, ...vendorWithoutPassword } = vendor;
      res.json({ vendor: vendorWithoutPassword });
    } catch (error) {
      console.error("Error logging in vendor:", error);
      res.status(500).json({ error: "Kunne ikke logge inn" });
    }
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

  const httpServer = createServer(app);

  return httpServer;
}
