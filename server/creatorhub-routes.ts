/**
 * CreatorHub API Routes
 * 
 * External API for the CreatorHub platform integration.
 * All routes are under /api/creatorhub/* and require API key authentication.
 * 
 * Authentication: API key via `X-API-Key` header or `Authorization: Bearer ch_xxxxx` header.
 * Each API key is scoped to a single CreatorHub project.
 */

import type { Express, Request, Response, NextFunction } from "express";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { db } from "./db";
import {
  creatorhubProjects,
  creatorhubUsers,
  creatorhubInvitations,
  creatorhubBookings,
  creatorhubCrmNotes,
  creatorhubAnalyticsEvents,
  creatorhubApiAuditLog,
  createCreatorhubProjectSchema,
  createCreatorhubInvitationSchema,
  createCreatorhubBookingSchema,
  createCreatorhubCrmNoteSchema,
  vendors,
  coupleProfiles,
  conversations,
  messages,
  vendorOffers,
} from "@shared/schema";
import { eq, and, desc, sql, gte, lte, inArray, or } from "drizzle-orm";

// Extend Request type to carry auth context
interface CreatorhubRequest extends Request {
  project?: typeof creatorhubProjects.$inferSelect;
  creatorhubUser?: typeof creatorhubUsers.$inferSelect;
}

// ========== Helpers ==========

function generateApiKey(): { key: string; prefix: string } {
  const key = `ch_${crypto.randomBytes(32).toString("hex")}`;
  const prefix = key.substring(0, 11); // "ch_xxxxxxxx"
  return { key, prefix };
}

function generateInviteToken(): string {
  return crypto.randomBytes(24).toString("base64url");
}

// ========== Middleware ==========

/**
 * API Key authentication middleware.
 * Checks X-API-Key header or Authorization: Bearer ch_xxx header.
 */
async function authenticateApiKey(req: CreatorhubRequest, res: Response, next: NextFunction) {
  const apiKey = req.header("X-API-Key") || extractBearerToken(req);

  if (!apiKey || !apiKey.startsWith("ch_")) {
    return res.status(401).json({ error: "Missing or invalid API key" });
  }

  try {
    const [project] = await db
      .select()
      .from(creatorhubProjects)
      .where(eq(creatorhubProjects.apiKey, apiKey));

    if (!project || project.status !== "active") {
      return res.status(401).json({ error: "Invalid or inactive API key" });
    }

    req.project = project;
    next();
  } catch (err) {
    console.error("[CreatorHub] Auth error:", err);
    return res.status(500).json({ error: "Authentication error" });
  }
}

function extractBearerToken(req: Request): string | null {
  const auth = req.header("Authorization");
  if (auth?.startsWith("Bearer ch_")) {
    return auth.substring(7); // Remove "Bearer "
  }
  return null;
}

/**
 * Audit logging middleware - logs all API calls
 */
async function auditLog(req: CreatorhubRequest, res: Response, next: NextFunction) {
  const startTime = Date.now();

  // Hook into response finish to log
  const originalEnd = res.end.bind(res);
  (res as any).end = function (...args: any[]) {
    const responseTime = Date.now() - startTime;

    // Fire and forget - don't block response
    if (req.project) {
      db.insert(creatorhubApiAuditLog)
        .values({
          projectId: req.project.id,
          userId: req.creatorhubUser?.id || null,
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          requestBody: req.method !== "GET" ? JSON.stringify(req.body).substring(0, 2000) : null,
          responseTime,
          ipAddress: req.ip || req.socket.remoteAddress || null,
          userAgent: req.header("User-Agent") || null,
        })
        .catch((err) => console.error("[CreatorHub] Audit log error:", err));
    }

    return originalEnd(...args);
  };

  next();
}

// ========== Route Registration ==========

export function registerCreatorhubRoutes(app: Express) {
  // Apply middleware to all CreatorHub API routes
  app.use("/api/creatorhub", auditLog);

  // ==========================================
  // PROJECT MANAGEMENT (Admin secret required)
  // ==========================================

  /**
   * POST /api/creatorhub/projects
   * Create a new CreatorHub project. Requires ADMIN_SECRET.
   * Returns the project with API key (shown only once).
   */
  app.post("/api/creatorhub/projects", async (req: Request, res: Response) => {
    const adminSecret = req.header("X-Admin-Secret") || req.header("Authorization")?.replace("Bearer ", "");
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: "Admin authentication required" });
    }

    try {
      const parsed = createCreatorhubProjectSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation error", details: parsed.error.flatten() });
      }

      // Check slug uniqueness
      const existing = await db.select().from(creatorhubProjects).where(eq(creatorhubProjects.slug, parsed.data.slug));
      if (existing.length > 0) {
        return res.status(409).json({ error: "Project slug already exists" });
      }

      const { key: apiKey, prefix: apiKeyPrefix } = generateApiKey();
      const webhookSecret = crypto.randomBytes(32).toString("hex");

      const [project] = await db.insert(creatorhubProjects).values({
        ...parsed.data,
        ownerId: "system", // Will be updated when first user is created
        apiKey,
        apiKeyPrefix,
        webhookSecret,
      }).returning();

      // Also create the owner user from req body if ownerEmail provided
      if (req.body.ownerEmail && req.body.ownerName) {
        const [user] = await db.insert(creatorhubUsers).values({
          projectId: project.id,
          email: req.body.ownerEmail,
          displayName: req.body.ownerName,
          role: "owner",
          vendorId: req.body.vendorId || null,
        }).returning();

        // Update project owner
        await db.update(creatorhubProjects)
          .set({ ownerId: user.id })
          .where(eq(creatorhubProjects.id, project.id));

        return res.json({
          project: { ...project, ownerId: user.id },
          apiKey, // Show ONCE - store this!
          webhookSecret, // Show ONCE - store this!
          owner: user,
        });
      }

      return res.json({
        project,
        apiKey, // Show ONCE - store this!
        webhookSecret, // Show ONCE - store this!
      });
    } catch (err: any) {
      console.error("[CreatorHub] Create project error:", err);
      return res.status(500).json({ error: "Failed to create project" });
    }
  });

  /**
   * GET /api/creatorhub/projects
   * List all projects. Admin only.
   */
  app.get("/api/creatorhub/projects", async (req: Request, res: Response) => {
    const adminSecret = req.header("X-Admin-Secret") || req.header("Authorization")?.replace("Bearer ", "");
    if (adminSecret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: "Admin authentication required" });
    }

    try {
      const projects = await db.select({
        id: creatorhubProjects.id,
        name: creatorhubProjects.name,
        slug: creatorhubProjects.slug,
        status: creatorhubProjects.status,
        apiKeyPrefix: creatorhubProjects.apiKeyPrefix,
        createdAt: creatorhubProjects.createdAt,
      }).from(creatorhubProjects).orderBy(desc(creatorhubProjects.createdAt));

      return res.json(projects);
    } catch (err: any) {
      console.error("[CreatorHub] List projects error:", err);
      return res.status(500).json({ error: "Failed to list projects" });
    }
  });

  // ==========================================
  // AUTHENTICATED API ROUTES (API Key required)
  // ==========================================

  // ----- PROJECT INFO -----

  /**
   * GET /api/creatorhub/project
   * Get current project info (from API key)
   */
  app.get("/api/creatorhub/project", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    const { apiKey, webhookSecret, ...safeProject } = req.project!;
    return res.json(safeProject);
  });

  // ----- USERS -----

  /**
   * GET /api/creatorhub/users
   * List all users in the project
   */
  app.get("/api/creatorhub/users", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    try {
      const users = await db.select().from(creatorhubUsers)
        .where(eq(creatorhubUsers.projectId, req.project!.id))
        .orderBy(desc(creatorhubUsers.createdAt));
      return res.json(users);
    } catch (err: any) {
      console.error("[CreatorHub] List users error:", err);
      return res.status(500).json({ error: "Failed to list users" });
    }
  });

  /**
   * GET /api/creatorhub/users/:id
   * Get a specific user
   */
  app.get("/api/creatorhub/users/:id", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    try {
      const [user] = await db.select().from(creatorhubUsers)
        .where(and(
          eq(creatorhubUsers.id, req.params.id),
          eq(creatorhubUsers.projectId, req.project!.id)
        ));
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.json(user);
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to get user" });
    }
  });

  /**
   * PATCH /api/creatorhub/users/:id
   * Update a user's role or status
   */
  app.patch("/api/creatorhub/users/:id", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    try {
      const { role, status, displayName, avatarUrl, vendorId } = req.body;
      const updates: any = { updatedAt: new Date() };
      if (role) updates.role = role;
      if (status) updates.status = status;
      if (displayName) updates.displayName = displayName;
      if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
      if (vendorId !== undefined) updates.vendorId = vendorId;

      const [updated] = await db.update(creatorhubUsers)
        .set(updates)
        .where(and(
          eq(creatorhubUsers.id, req.params.id),
          eq(creatorhubUsers.projectId, req.project!.id)
        ))
        .returning();

      if (!updated) return res.status(404).json({ error: "User not found" });
      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to update user" });
    }
  });

  // ----- INVITATIONS -----

  /**
   * POST /api/creatorhub/invitations
   * Send an invitation to join the project
   */
  app.post("/api/creatorhub/invitations", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    try {
      const parsed = createCreatorhubInvitationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation error", details: parsed.error.flatten() });
      }

      // Check if user already exists in project
      const existingUser = await db.select().from(creatorhubUsers)
        .where(and(
          eq(creatorhubUsers.projectId, req.project!.id),
          eq(creatorhubUsers.email, parsed.data.email)
        ));
      if (existingUser.length > 0) {
        return res.status(409).json({ error: "User already exists in this project" });
      }

      // Check for pending invitation
      const existingInvite = await db.select().from(creatorhubInvitations)
        .where(and(
          eq(creatorhubInvitations.projectId, req.project!.id),
          eq(creatorhubInvitations.email, parsed.data.email),
          eq(creatorhubInvitations.status, "pending")
        ));
      if (existingInvite.length > 0) {
        return res.status(409).json({ error: "Pending invitation already exists for this email" });
      }

      // Get inviter (first user or use requestor from body)
      const invitedBy = req.body.invitedByUserId;
      if (!invitedBy) {
        return res.status(400).json({ error: "invitedByUserId is required" });
      }

      const token = generateInviteToken();
      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

      const [invitation] = await db.insert(creatorhubInvitations).values({
        projectId: req.project!.id,
        invitedBy,
        email: parsed.data.email,
        role: parsed.data.role,
        token,
        message: parsed.data.message,
        expiresAt,
      }).returning();

      // Track analytics event
      await db.insert(creatorhubAnalyticsEvents).values({
        projectId: req.project!.id,
        creatorUserId: invitedBy,
        eventType: "invitation_sent",
        eventData: JSON.stringify({ email: parsed.data.email, role: parsed.data.role }),
        source: "api",
      });

      return res.status(201).json({
        ...invitation,
        inviteUrl: `${process.env.APP_URL || "https://wedflow.no"}/creatorhub/invite/${token}`,
      });
    } catch (err: any) {
      console.error("[CreatorHub] Create invitation error:", err);
      return res.status(500).json({ error: "Failed to create invitation" });
    }
  });

  /**
   * GET /api/creatorhub/invitations
   * List all invitations for the project
   */
  app.get("/api/creatorhub/invitations", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const conditions = [eq(creatorhubInvitations.projectId, req.project!.id)];
      if (status) conditions.push(eq(creatorhubInvitations.status, status));

      const invitations = await db.select().from(creatorhubInvitations)
        .where(and(...conditions))
        .orderBy(desc(creatorhubInvitations.createdAt));

      return res.json(invitations);
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to list invitations" });
    }
  });

  /**
   * POST /api/creatorhub/invitations/:token/accept
   * Accept an invitation and create the user account
   */
  app.post("/api/creatorhub/invitations/:token/accept", async (req: Request, res: Response) => {
    try {
      const { token } = req.params;
      const { displayName, vendorId } = req.body;

      const [invitation] = await db.select().from(creatorhubInvitations)
        .where(eq(creatorhubInvitations.token, token));

      if (!invitation) {
        return res.status(404).json({ error: "Invitation not found" });
      }
      if (invitation.status !== "pending") {
        return res.status(400).json({ error: `Invitation is ${invitation.status}` });
      }
      if (invitation.expiresAt < new Date()) {
        await db.update(creatorhubInvitations)
          .set({ status: "expired" })
          .where(eq(creatorhubInvitations.id, invitation.id));
        return res.status(400).json({ error: "Invitation has expired" });
      }

      // Create user
      const [user] = await db.insert(creatorhubUsers).values({
        projectId: invitation.projectId,
        email: invitation.email,
        displayName: displayName || invitation.email.split("@")[0],
        role: invitation.role,
        vendorId: vendorId || null,
      }).returning();

      // Update invitation
      await db.update(creatorhubInvitations)
        .set({ status: "accepted", acceptedAt: new Date(), acceptedUserId: user.id })
        .where(eq(creatorhubInvitations.id, invitation.id));

      // Track analytics
      await db.insert(creatorhubAnalyticsEvents).values({
        projectId: invitation.projectId,
        creatorUserId: user.id,
        eventType: "invitation_accepted",
        eventData: JSON.stringify({ role: invitation.role }),
        source: "api",
      });

      return res.json({ user, projectId: invitation.projectId });
    } catch (err: any) {
      console.error("[CreatorHub] Accept invitation error:", err);
      return res.status(500).json({ error: "Failed to accept invitation" });
    }
  });

  /**
   * DELETE /api/creatorhub/invitations/:id
   * Revoke a pending invitation
   */
  app.delete("/api/creatorhub/invitations/:id", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    try {
      const [updated] = await db.update(creatorhubInvitations)
        .set({ status: "revoked" })
        .where(and(
          eq(creatorhubInvitations.id, req.params.id),
          eq(creatorhubInvitations.projectId, req.project!.id),
          eq(creatorhubInvitations.status, "pending")
        ))
        .returning();

      if (!updated) return res.status(404).json({ error: "Pending invitation not found" });
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to revoke invitation" });
    }
  });

  // ----- BOOKINGS / CALENDAR -----

  /**
   * GET /api/creatorhub/bookings
   * List bookings with optional filters
   */
  app.get("/api/creatorhub/bookings", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    try {
      const { status, creatorUserId, from, to } = req.query;
      const conditions = [eq(creatorhubBookings.projectId, req.project!.id)];

      if (status) conditions.push(eq(creatorhubBookings.status, status as string));
      if (creatorUserId) conditions.push(eq(creatorhubBookings.creatorUserId, creatorUserId as string));
      if (from) conditions.push(gte(creatorhubBookings.eventDate, from as string));
      if (to) conditions.push(lte(creatorhubBookings.eventDate, to as string));

      const bookings = await db.select().from(creatorhubBookings)
        .where(and(...conditions))
        .orderBy(desc(creatorhubBookings.eventDate));

      return res.json(bookings);
    } catch (err: any) {
      console.error("[CreatorHub] List bookings error:", err);
      return res.status(500).json({ error: "Failed to list bookings" });
    }
  });

  /**
   * GET /api/creatorhub/bookings/:id
   * Get a specific booking
   */
  app.get("/api/creatorhub/bookings/:id", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    try {
      const [booking] = await db.select().from(creatorhubBookings)
        .where(and(
          eq(creatorhubBookings.id, req.params.id),
          eq(creatorhubBookings.projectId, req.project!.id)
        ));

      if (!booking) return res.status(404).json({ error: "Booking not found" });

      // Include linked Wedflow data if available
      let wedflowData: any = {};
      if (booking.vendorId) {
        const [vendor] = await db.select({
          id: vendors.id,
          businessName: vendors.businessName,
          email: vendors.email,
        }).from(vendors).where(eq(vendors.id, booking.vendorId));
        wedflowData.vendor = vendor || null;
      }
      if (booking.coupleId) {
        const [couple] = await db.select({
          id: coupleProfiles.id,
          displayName: coupleProfiles.displayName,
          email: coupleProfiles.email,
        }).from(coupleProfiles).where(eq(coupleProfiles.id, booking.coupleId));
        wedflowData.couple = couple || null;
      }

      return res.json({ ...booking, wedflow: wedflowData });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to get booking" });
    }
  });

  /**
   * POST /api/creatorhub/bookings
   * Create a new booking
   */
  app.post("/api/creatorhub/bookings", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    try {
      const parsed = createCreatorhubBookingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation error", details: parsed.error.flatten() });
      }

      if (!req.body.creatorUserId) {
        return res.status(400).json({ error: "creatorUserId is required" });
      }

      // Verify creator belongs to this project
      const [creator] = await db.select().from(creatorhubUsers)
        .where(and(
          eq(creatorhubUsers.id, req.body.creatorUserId),
          eq(creatorhubUsers.projectId, req.project!.id)
        ));
      if (!creator) {
        return res.status(400).json({ error: "Creator user not found in this project" });
      }

      const [booking] = await db.insert(creatorhubBookings).values({
        projectId: req.project!.id,
        creatorUserId: req.body.creatorUserId,
        ...parsed.data,
      }).returning();

      // Track analytics
      await db.insert(creatorhubAnalyticsEvents).values({
        projectId: req.project!.id,
        creatorUserId: req.body.creatorUserId,
        bookingId: booking.id,
        eventType: "booking_created",
        eventData: JSON.stringify({ status: parsed.data.status, eventDate: parsed.data.eventDate }),
        source: "api",
      });

      return res.status(201).json(booking);
    } catch (err: any) {
      console.error("[CreatorHub] Create booking error:", err);
      return res.status(500).json({ error: "Failed to create booking" });
    }
  });

  /**
   * PATCH /api/creatorhub/bookings/:id
   * Update a booking
   */
  app.patch("/api/creatorhub/bookings/:id", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    try {
      const allowedFields = [
        "title", "description", "clientName", "clientEmail", "clientPhone",
        "eventDate", "eventTime", "eventEndTime", "location",
        "totalAmount", "depositAmount", "depositPaid", "fullPaid",
        "status", "notes", "internalNotes", "tags", "externalRef",
        "vendorId", "coupleId", "conversationId", "offerId",
      ];

      const updates: any = { updatedAt: new Date() };
      for (const field of allowedFields) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      const [updated] = await db.update(creatorhubBookings)
        .set(updates)
        .where(and(
          eq(creatorhubBookings.id, req.params.id),
          eq(creatorhubBookings.projectId, req.project!.id)
        ))
        .returning();

      if (!updated) return res.status(404).json({ error: "Booking not found" });

      // Track status changes
      if (req.body.status) {
        await db.insert(creatorhubAnalyticsEvents).values({
          projectId: req.project!.id,
          creatorUserId: updated.creatorUserId,
          bookingId: updated.id,
          eventType: `booking_${req.body.status}`,
          eventData: JSON.stringify({ previousStatus: "unknown", newStatus: req.body.status }),
          source: "api",
        });
      }

      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to update booking" });
    }
  });

  /**
   * DELETE /api/creatorhub/bookings/:id
   * Delete a booking
   */
  app.delete("/api/creatorhub/bookings/:id", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    try {
      const [deleted] = await db.delete(creatorhubBookings)
        .where(and(
          eq(creatorhubBookings.id, req.params.id),
          eq(creatorhubBookings.projectId, req.project!.id)
        ))
        .returning();

      if (!deleted) return res.status(404).json({ error: "Booking not found" });
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to delete booking" });
    }
  });

  // ----- CRM / MESSAGING -----

  /**
   * GET /api/creatorhub/crm/notes
   * List CRM notes, optionally filtered by booking
   */
  app.get("/api/creatorhub/crm/notes", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    try {
      const { bookingId, creatorUserId, noteType } = req.query;
      const conditions = [eq(creatorhubCrmNotes.projectId, req.project!.id)];

      if (bookingId) conditions.push(eq(creatorhubCrmNotes.bookingId, bookingId as string));
      if (creatorUserId) conditions.push(eq(creatorhubCrmNotes.creatorUserId, creatorUserId as string));
      if (noteType) conditions.push(eq(creatorhubCrmNotes.noteType, noteType as string));

      const notes = await db.select().from(creatorhubCrmNotes)
        .where(and(...conditions))
        .orderBy(desc(creatorhubCrmNotes.createdAt));

      return res.json(notes);
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to list CRM notes" });
    }
  });

  /**
   * POST /api/creatorhub/crm/notes
   * Create a CRM note
   */
  app.post("/api/creatorhub/crm/notes", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    try {
      const parsed = createCreatorhubCrmNoteSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Validation error", details: parsed.error.flatten() });
      }

      if (!req.body.creatorUserId) {
        return res.status(400).json({ error: "creatorUserId is required" });
      }

      const [note] = await db.insert(creatorhubCrmNotes).values({
        projectId: req.project!.id,
        creatorUserId: req.body.creatorUserId,
        ...parsed.data,
        dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
      }).returning();

      return res.status(201).json(note);
    } catch (err: any) {
      console.error("[CreatorHub] Create CRM note error:", err);
      return res.status(500).json({ error: "Failed to create CRM note" });
    }
  });

  /**
   * PATCH /api/creatorhub/crm/notes/:id
   * Update a CRM note (e.g., mark task as completed)
   */
  app.patch("/api/creatorhub/crm/notes/:id", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    try {
      const updates: any = { updatedAt: new Date() };
      if (req.body.subject !== undefined) updates.subject = req.body.subject;
      if (req.body.body !== undefined) updates.body = req.body.body;
      if (req.body.isCompleted !== undefined) {
        updates.isCompleted = req.body.isCompleted;
        updates.completedAt = req.body.isCompleted ? new Date() : null;
      }
      if (req.body.dueDate !== undefined) updates.dueDate = req.body.dueDate ? new Date(req.body.dueDate) : null;

      const [updated] = await db.update(creatorhubCrmNotes)
        .set(updates)
        .where(and(
          eq(creatorhubCrmNotes.id, req.params.id),
          eq(creatorhubCrmNotes.projectId, req.project!.id)
        ))
        .returning();

      if (!updated) return res.status(404).json({ error: "CRM note not found" });
      return res.json(updated);
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to update CRM note" });
    }
  });

  /**
   * DELETE /api/creatorhub/crm/notes/:id
   */
  app.delete("/api/creatorhub/crm/notes/:id", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    try {
      const [deleted] = await db.delete(creatorhubCrmNotes)
        .where(and(
          eq(creatorhubCrmNotes.id, req.params.id),
          eq(creatorhubCrmNotes.projectId, req.project!.id)
        ))
        .returning();

      if (!deleted) return res.status(404).json({ error: "CRM note not found" });
      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to delete CRM note" });
    }
  });

  // ----- WEDFLOW BRIDGE: Conversations & Messages -----

  /**
   * GET /api/creatorhub/wedflow/conversations
   * List Wedflow conversations for a specific vendor (linked creator)
   */
  app.get("/api/creatorhub/wedflow/conversations", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    try {
      const { vendorId } = req.query;
      if (!vendorId) {
        return res.status(400).json({ error: "vendorId query param required" });
      }

      // Verify vendor is linked to a user in this project
      const [creator] = await db.select().from(creatorhubUsers)
        .where(and(
          eq(creatorhubUsers.projectId, req.project!.id),
          eq(creatorhubUsers.vendorId, vendorId as string)
        ));
      if (!creator) {
        return res.status(403).json({ error: "Vendor not linked to this project" });
      }

      const convos = await db.select().from(conversations)
        .where(eq(conversations.vendorId, vendorId as string))
        .orderBy(desc(conversations.lastMessageAt));

      return res.json(convos);
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to list conversations" });
    }
  });

  /**
   * GET /api/creatorhub/wedflow/conversations/:id/messages
   * Get messages for a Wedflow conversation
   */
  app.get("/api/creatorhub/wedflow/conversations/:id/messages", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    try {
      // Verify conversation belongs to a vendor in this project
      const [convo] = await db.select().from(conversations)
        .where(eq(conversations.id, req.params.id));

      if (!convo) return res.status(404).json({ error: "Conversation not found" });

      const [creator] = await db.select().from(creatorhubUsers)
        .where(and(
          eq(creatorhubUsers.projectId, req.project!.id),
          eq(creatorhubUsers.vendorId, convo.vendorId)
        ));
      if (!creator) return res.status(403).json({ error: "Conversation not accessible from this project" });

      const msgs = await db.select().from(messages)
        .where(eq(messages.conversationId, req.params.id))
        .orderBy(desc(messages.createdAt));

      return res.json(msgs);
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to get messages" });
    }
  });

  // ----- WEDFLOW BRIDGE: Offers -----

  /**
   * GET /api/creatorhub/wedflow/offers
   * List Wedflow offers for a vendor linked to this project
   */
  app.get("/api/creatorhub/wedflow/offers", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    try {
      const { vendorId, status } = req.query;
      if (!vendorId) return res.status(400).json({ error: "vendorId query param required" });

      const [creator] = await db.select().from(creatorhubUsers)
        .where(and(
          eq(creatorhubUsers.projectId, req.project!.id),
          eq(creatorhubUsers.vendorId, vendorId as string)
        ));
      if (!creator) return res.status(403).json({ error: "Vendor not linked to this project" });

      const conditions = [eq(vendorOffers.vendorId, vendorId as string)];
      if (status) conditions.push(eq(vendorOffers.status, status as string));

      const offers = await db.select().from(vendorOffers)
        .where(and(...conditions))
        .orderBy(desc(vendorOffers.createdAt));

      return res.json(offers);
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to list offers" });
    }
  });

  // ----- ANALYTICS / REPORTING -----

  /**
   * GET /api/creatorhub/analytics/summary
   * Get analytics summary for the project
   */
  app.get("/api/creatorhub/analytics/summary", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    try {
      const { from, to } = req.query;

      // Booking stats
      const bookingStats = await db.select({
        total: sql<number>`count(*)::int`,
        confirmed: sql<number>`count(*) filter (where status = 'confirmed')::int`,
        completed: sql<number>`count(*) filter (where status = 'completed')::int`,
        cancelled: sql<number>`count(*) filter (where status = 'cancelled')::int`,
        totalRevenue: sql<number>`coalesce(sum(total_amount) filter (where status in ('confirmed', 'completed')), 0)::int`,
        avgBookingValue: sql<number>`coalesce(avg(total_amount) filter (where total_amount > 0), 0)::int`,
      }).from(creatorhubBookings)
        .where(eq(creatorhubBookings.projectId, req.project!.id));

      // User stats
      const userStats = await db.select({
        totalUsers: sql<number>`count(*)::int`,
        activeUsers: sql<number>`count(*) filter (where status = 'active')::int`,
        creators: sql<number>`count(*) filter (where role = 'creator')::int`,
      }).from(creatorhubUsers)
        .where(eq(creatorhubUsers.projectId, req.project!.id));

      // Pending invitations
      const inviteStats = await db.select({
        pending: sql<number>`count(*) filter (where status = 'pending')::int`,
        accepted: sql<number>`count(*) filter (where status = 'accepted')::int`,
      }).from(creatorhubInvitations)
        .where(eq(creatorhubInvitations.projectId, req.project!.id));

      // Recent events count
      const recentEventCount = await db.select({
        count: sql<number>`count(*)::int`,
      }).from(creatorhubAnalyticsEvents)
        .where(and(
          eq(creatorhubAnalyticsEvents.projectId, req.project!.id),
          gte(creatorhubAnalyticsEvents.createdAt, sql`now() - interval '30 days'`)
        ));

      return res.json({
        bookings: bookingStats[0] || {},
        users: userStats[0] || {},
        invitations: inviteStats[0] || {},
        recentEventsLast30Days: recentEventCount[0]?.count || 0,
      });
    } catch (err: any) {
      console.error("[CreatorHub] Analytics summary error:", err);
      return res.status(500).json({ error: "Failed to get analytics summary" });
    }
  });

  /**
   * GET /api/creatorhub/analytics/events
   * List analytics events with filtering
   */
  app.get("/api/creatorhub/analytics/events", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    try {
      const { eventType, from, to, limit } = req.query;
      const conditions = [eq(creatorhubAnalyticsEvents.projectId, req.project!.id)];

      if (eventType) conditions.push(eq(creatorhubAnalyticsEvents.eventType, eventType as string));
      if (from) conditions.push(gte(creatorhubAnalyticsEvents.createdAt, new Date(from as string)));
      if (to) conditions.push(lte(creatorhubAnalyticsEvents.createdAt, new Date(to as string)));

      const events = await db.select().from(creatorhubAnalyticsEvents)
        .where(and(...conditions))
        .orderBy(desc(creatorhubAnalyticsEvents.createdAt))
        .limit(Math.min(parseInt(limit as string) || 100, 500));

      return res.json(events);
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to list analytics events" });
    }
  });

  /**
   * POST /api/creatorhub/analytics/events
   * Track a custom analytics event
   */
  app.post("/api/creatorhub/analytics/events", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    try {
      const { eventType, eventData, creatorUserId, bookingId, source } = req.body;
      if (!eventType) return res.status(400).json({ error: "eventType is required" });

      const [event] = await db.insert(creatorhubAnalyticsEvents).values({
        projectId: req.project!.id,
        creatorUserId: creatorUserId || null,
        bookingId: bookingId || null,
        eventType,
        eventData: typeof eventData === "string" ? eventData : JSON.stringify(eventData),
        source: source || "api",
        ipAddress: req.ip || req.socket.remoteAddress || null,
        userAgent: req.header("User-Agent") || null,
      }).returning();

      return res.status(201).json(event);
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to track event" });
    }
  });

  // ----- AUDIT LOG -----

  /**
   * GET /api/creatorhub/audit-log
   * View API audit log (admin feature)
   */
  app.get("/api/creatorhub/audit-log", authenticateApiKey, async (req: CreatorhubRequest, res: Response) => {
    try {
      const { limit, method, path } = req.query;
      const conditions = [eq(creatorhubApiAuditLog.projectId, req.project!.id)];

      if (method) conditions.push(eq(creatorhubApiAuditLog.method, method as string));
      if (path) conditions.push(sql`${creatorhubApiAuditLog.path} LIKE ${"%" + path + "%"}`);

      const logs = await db.select().from(creatorhubApiAuditLog)
        .where(and(...conditions))
        .orderBy(desc(creatorhubApiAuditLog.createdAt))
        .limit(Math.min(parseInt(limit as string) || 50, 200));

      return res.json(logs);
    } catch (err: any) {
      return res.status(500).json({ error: "Failed to get audit log" });
    }
  });

  console.log("[CreatorHub] API routes registered at /api/creatorhub/*");
}
