import express from "express";
import type { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { registerRoutes } from "./routes";
import { registerCreatorhubRoutes } from "./creatorhub-routes";
import { initializeSubscriptionCrons } from "./cron-subscriptions";
import * as fs from "fs";
import * as path from "path";

import 'dotenv/config';
import { config } from 'dotenv';
config({ override: true });

console.log("DATABASE_URL loaded:", process.env.DATABASE_URL ? "YES" : "NO");
console.log("ADMIN_SECRET loaded:", process.env.ADMIN_SECRET ? "YES" : "NO");

const app = express();
const log = console.log;

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

function setupCors(app: express.Application) {
  app.use((req, res, next) => {
    const origin = req.header("origin");

    // Allowlist production origins (including current domains and render host)
    const allowedProdOrigins = [
      "https://evendi.no",
      "https://www.evendi.no",
      "https://app.evendi.no",
      "https://api.evendi.no",
      "https://evendi-api.onrender.com",
      "https://evendi-evendi.vercel.app",
    ];

    // Allow custom list via env (comma-separated)
    const envAllowedOrigins = (process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    // In development, allow all origins for easier testing
    const isDev = process.env.NODE_ENV === "development";

    // Allow localhost origins for Expo web development (any port)
    const isLocalhost =
      origin?.startsWith("http://localhost:") ||
      origin?.startsWith("http://127.0.0.1:");

    // Allow GitHub Codespaces preview URLs
    const isGitHubCodespaces = origin?.includes(".app.github.dev") || origin?.includes(".github.dev");

    // Allow Cloudflare tunnel
    const isCloudflare = origin?.includes(".trycloudflare.com");

    // Allow Replit domains
    const isReplit = origin?.includes(".replit.dev") || origin?.includes(".repl.co");

    const allAllowedOrigins = new Set([
      ...allowedProdOrigins,
      ...envAllowedOrigins,
    ]);

    // Allow production domains (explicit allowlist)
    const isProductionDomain = origin ? allAllowedOrigins.has(origin) : false;

    // Allow origin if it matches any known development domain, production domain, or in dev mode allow all
    const allowAnyOrigin = false;

    const shouldAllowOrigin = allowAnyOrigin || isDev || isLocalhost || isGitHubCodespaces || isCloudflare || isReplit || isProductionDomain;

    if (origin && shouldAllowOrigin) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD",
      );
      res.header(
        "Access-Control-Allow-Headers",
        "Content-Type, x-session-token, x-admin-secret, authorization, Authorization, Accept, Origin, X-Requested-With",
      );
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Max-Age", "86400");
    }

    // Handle preflight OPTIONS requests immediately
    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    next();
  });
}

function setupBodyParsing(app: express.Application) {
  app.use(
    express.json({
      limit: "2mb",
      verify: (req, _res, buf) => {
        req.rawBody = buf;
      },
    }),
  );

  app.use(express.urlencoded({ extended: false }));
}

function setupRequestLogging(app: express.Application) {
  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, unknown> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      if (!path.startsWith("/api")) return;

      const duration = Date.now() - start;

      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    });

    next();
  });
}

function getAppName(): string {
  try {
    const appJsonPath = path.resolve(process.cwd(), "app.json");
    const appJsonContent = fs.readFileSync(appJsonPath, "utf-8");
    const appJson = JSON.parse(appJsonContent);
    return appJson.expo?.name || "App Landing Page";
  } catch {
    return "App Landing Page";
  }
}

function serveExpoManifest(platform: string, res: Response) {
  const manifestPath = path.resolve(
    process.cwd(),
    "static-build",
    platform,
    "manifest.json",
  );

  if (!fs.existsSync(manifestPath)) {
    return res
      .status(404)
      .json({ error: `Manifest not found for platform: ${platform}` });
  }

  res.setHeader("expo-protocol-version", "1");
  res.setHeader("expo-sfv-version", "0");
  res.setHeader("content-type", "application/json");

  const manifest = fs.readFileSync(manifestPath, "utf-8");
  res.send(manifest);
}

function serveLandingPage({
  req,
  res,
  landingPageTemplate,
  appName,
}: {
  req: Request;
  res: Response;
  landingPageTemplate: string;
  appName: string;
}) {
  const forwardedProto = req.header("x-forwarded-proto");
  const protocol = forwardedProto || req.protocol || "https";
  const forwardedHost = req.header("x-forwarded-host");
  const host = forwardedHost || req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const expsUrl = `${host}`;

  log(`baseUrl`, baseUrl);
  log(`expsUrl`, expsUrl);

  const html = landingPageTemplate
    .replace(/BASE_URL_PLACEHOLDER/g, baseUrl)
    .replace(/EXPS_URL_PLACEHOLDER/g, expsUrl)
    .replace(/APP_NAME_PLACEHOLDER/g, appName);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(html);
}

function configureExpoAndLanding(app: express.Application) {
  const templatePath = path.resolve(
    process.cwd(),
    "server",
    "templates",
    "landing-page.html",
  );
  const landingPageTemplate = fs.readFileSync(templatePath, "utf-8");
  const appName = getAppName();

  log("Serving static Expo files with dynamic manifest routing");

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith("/api")) {
      return next();
    }

    if (req.path !== "/" && req.path !== "/manifest") {
      return next();
    }

    const platform = req.header("expo-platform");
    if (platform && (platform === "ios" || platform === "android")) {
      return serveExpoManifest(platform, res);
    }

    if (req.path === "/") {
      return serveLandingPage({
        req,
        res,
        landingPageTemplate,
        appName,
      });
    }

    next();
  });

  app.use("/assets", express.static(path.resolve(process.cwd(), "assets")));
  app.use(express.static(path.resolve(process.cwd(), "static-build")));

  log("Expo routing: Checking expo-platform header on / and /manifest");
}

function setupErrorHandler(app: express.Application) {
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const error = err as {
      status?: number;
      statusCode?: number;
      message?: string;
    };

    const status = error.status || error.statusCode || 500;
    const message = error.message || "Internal Server Error";

    res.status(status).json({ message });

    console.error("[ErrorHandler]", err);
  });
}

(async () => {
  setupCors(app);
  setupBodyParsing(app);
  setupRequestLogging(app);

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: false, // CSP can break Expo web — disable for now
    crossOriginEmbedderPolicy: false,
  }));

  const server = await registerRoutes(app);

  // Register CreatorHub external API routes
  registerCreatorhubRoutes(app);

  // Serve Terms of Sale page
  app.get("/terms-of-sale", (_req: Request, res: Response) => {
    const termsPath = path.resolve(
      process.cwd(),
      "server",
      "templates",
      "terms-of-sale.html"
    );
    try {
      const termsHtml = fs.readFileSync(termsPath, "utf-8");
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      res.status(200).send(termsHtml);
    } catch (err) {
      res.status(404).json({ error: "Terms of sale not found" });
    }
  });

  // Configure Expo AFTER routes so /api endpoints are not caught by landing page middleware
  configureExpoAndLanding(app);

  setupErrorHandler(app);

  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`express server serving on port ${port}`);
      
      // Initialize subscription cron jobs
      initializeSubscriptionCrons();
    },
  );
})();
